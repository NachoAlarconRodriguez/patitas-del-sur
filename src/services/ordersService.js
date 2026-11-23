import { supabase } from '../lib/supabase.js';
import { resolveInventoryVariant } from '../utils/productVariants.js';
import { triggerAdminNewOrderPush } from './pushNotificationsService.js';

/**
 * Servicio de Órdenes y Checkout con Supabase
 */

export async function getNextOrderId() {
  try {
    // 1. Intentar secuencia atómica en Supabase (RPC) si la migración ya está aplicada
    const { data: rpcId, error: rpcError } = await supabase.rpc('get_next_order_id');
    if (!rpcError && typeof rpcId === 'string' && /^PED-\d+$/i.test(rpcId.trim())) {
      return rpcId.trim().toUpperCase();
    }

    // 2. Fallback consultando el máximo correlativo actual en la tabla orders
    const { data, error } = await supabase
      .from('orders')
      .select('id');

    if (error) throw error;
    if (!data || data.length === 0) return 'PED-0001';

    let maxNum = 0;
    for (const row of data) {
      const match = String(row.id || '').match(/PED-(\d+)/i);
      if (match) {
        const num = parseInt(match[1], 10);
        if (!isNaN(num) && num > maxNum) {
          maxNum = num;
        }
      }
    }

    const nextNum = maxNum + 1;
    return `PED-${String(nextNum).padStart(4, '0')}`;
  } catch (err) {
    console.error('Error generating next order ID:', err);
    // Evitar colisión segura con PED-0001 usando sufijo temporal único
    return `PED-${String(Date.now()).slice(-6)}`;
  }
}

export async function createOrderInSupabase(orderData, items = []) {
  try {
    let finalOrderId = orderData.id || (await getNextOrderId());
    const seqMatch = String(finalOrderId).match(/PED-(\d+)/i);
    const seqNum = seqMatch ? seqMatch[1] : '0001';
    const orderTotalNum = Number(orderData.total || 0);
    const earnedPts =
      orderData.pointsEarned !== undefined
        ? Number(orderData.pointsEarned) || 0
        : Math.floor(orderTotalNum / 1000);

    const initialPaymentStatus = String(orderData.paymentStatus || 'pendiente').trim().toLowerCase();
    const isInitiallyPaid = initialPaymentStatus === 'pagado';

    const isPosWalkIn =
      Boolean(orderData.skipCustomerCreation) ||
      (String(orderData.channel || '').toLowerCase() === 'pos' && !orderData.customerId);

    // 1. Vincular o registrar automáticamente al cliente en la tabla customers (CRM)
    let resolvedCustomerId = orderData.customerId || null;
    if (!isPosWalkIn) {
      try {
        const phone9 = String(orderData.customerPhone || '').replace(/\D/g, '').slice(-9);
        const cleanEmail = String(orderData.customerEmail || '').trim().toLowerCase();
        const cleanName = String(orderData.customerName || 'Cliente Patitas').trim();

        const { data: allCusts } = await supabase
          .from('customers')
          .select('id, full_name, email, phone, role, points, total_spent, address, city');

        let matchedCust = (allCusts || []).find((c) => {
          if (resolvedCustomerId && c.id === resolvedCustomerId) return true;
          const cPhone9 = String(c.phone || '').replace(/\D/g, '').slice(-9);
          if (phone9 && phone9.length === 9 && cPhone9 === phone9) return true;
          if (cleanEmail && c.email && c.email.toLowerCase() === cleanEmail) return true;
          return false;
        });

        if (matchedCust && String(matchedCust.role || 'cliente').toLowerCase() !== 'admin') {
          resolvedCustomerId = matchedCust.id;
          const customerUpdatePayload = {
            address: orderData.address || matchedCust.address || '',
            city: orderData.city || matchedCust.city || 'Frutillar',
          };
          if (isInitiallyPaid) {
            customerUpdatePayload.total_spent = (Number(matchedCust.total_spent) || 0) + orderTotalNum;
            customerUpdatePayload.points = (Number(matchedCust.points) || 0) + earnedPts;
          }
          await supabase
            .from('customers')
            .update(customerUpdatePayload)
            .eq('id', matchedCust.id);
        } else if (!matchedCust && (phone9 || cleanName)) {
          const { data: createdCust } = await supabase
            .from('customers')
            .insert({
              full_name: cleanName,
              email: cleanEmail || null,
              phone: orderData.customerPhone || '',
              city: orderData.city || 'Frutillar',
              address: orderData.address || '',
              role: 'cliente',
              points: isInitiallyPaid ? earnedPts : 0,
              total_spent: isInitiallyPaid ? orderTotalNum : 0,
              whatsapp_notifications: true,
            })
            .select('id')
            .single();

          if (createdCust?.id) {
            resolvedCustomerId = createdCust.id;
          }
        }

        if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event('patitas_customers_updated'));
        }
      } catch (crmSyncErr) {
        console.warn('Error sincronizando cliente en CRM al crear pedido:', crmSyncErr);
      }
    }

    const latVal = Number(orderData.deliveryLat ?? orderData.delivery_lat ?? orderData.lat);
    const lngVal = Number(orderData.deliveryLng ?? orderData.delivery_lng ?? orderData.lng);
    const hasCoords = Number.isFinite(latVal) && Number.isFinite(lngVal) && latVal !== 0 && lngVal !== 0;

    const baseOrderPayload = {
      id: finalOrderId,
      customer_id: resolvedCustomerId,
      customer_name: orderData.customerName || 'Cliente Web',
      customer_email: orderData.customerEmail || null,
      customer_phone: orderData.customerPhone || null,
      channel: orderData.channel || 'web',
      payment_method: orderData.paymentMethod || 'Tarjeta',
      payment_status: orderData.paymentStatus || 'pendiente',
      mercadopago_preference_id: orderData.mercadopagoPreferenceId || orderData.mercadopago_preference_id || null,
      mercadopago_payment_id: orderData.mercadopagoPaymentId || orderData.mercadopago_payment_id || null,
      status: orderData.status || 'en_preparacion',
      subtotal: orderData.subtotal || 0,
      shipping_cost: orderData.shippingCost || 0,
      discount: orderData.discount || 0,
      total: orderTotalNum,
      points_earned: isPosWalkIn ? 0 : earnedPts,
      delivery_day_text: orderData.deliveryDayText || orderData.delivery_day_text || 'Hoy Mismo',
      delivery_date:
        orderData.deliveryDate ||
        orderData.delivery_date ||
        new Intl.DateTimeFormat('en-CA', {
          timeZone: 'America/Santiago',
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
        }).format(new Date()),
      delivery_slot: orderData.deliverySlot || orderData.delivery_slot || 'Tarde (15:30 - 19:30 hrs)',
      address: orderData.address || '',
      city: orderData.city || 'Frutillar',
      delivery_zone: orderData.deliveryZone || `Zona Despacho: ${orderData.city || 'Frutillar'}`,
      agreement_used: orderData.agreementUsed || null,
      coupon_code_used: orderData.couponCodeUsed || null,
      notes: orderData.notes || '',
      invoice_number: orderData.invoiceNumber || `BOL-2026-${seqNum}`,
      created_at: orderData.created_at || orderData.createdAt || new Date().toISOString(),
    };

    const paymentBreakdownVal = orderData.paymentBreakdown ?? orderData.payment_breakdown ?? null;
    const extendedOrderPayload = {
      ...baseOrderPayload,
      ...(hasCoords ? { delivery_lat: latVal, delivery_lng: lngVal } : {}),
      ...(orderData.petName || orderData.pet_name ? { pet_name: orderData.petName || orderData.pet_name } : {}),
      ...(orderData.petType || orderData.pet_type ? { pet_type: orderData.petType || orderData.pet_type } : {}),
      ...(orderData.posRegisterId || orderData.pos_register_id
        ? { pos_register_id: orderData.posRegisterId || orderData.pos_register_id }
        : {}),
      ...(orderData.posShiftId || orderData.pos_shift_id
        ? { pos_shift_id: orderData.posShiftId || orderData.pos_shift_id }
        : {}),
      ...(orderData.soldByEmail || orderData.sold_by_email
        ? { sold_by_email: orderData.soldByEmail || orderData.sold_by_email }
        : {}),
      ...(orderData.soldByName || orderData.sold_by_name
        ? { sold_by_name: orderData.soldByName || orderData.sold_by_name }
        : {}),
      ...(Array.isArray(paymentBreakdownVal) && paymentBreakdownVal.length > 0
        ? { payment_breakdown: paymentBreakdownVal }
        : {}),
      ...(orderData.cashTendered !== undefined || orderData.cash_tendered !== undefined
        ? { cash_tendered: Number(orderData.cashTendered ?? orderData.cash_tendered) || 0 }
        : {}),
      ...(orderData.cashChange !== undefined || orderData.cash_change !== undefined
        ? { cash_change: Number(orderData.cashChange ?? orderData.cash_change) || 0 }
        : {}),
      ...(orderData.deliveredByName || orderData.delivered_by_name
        ? { delivered_by_name: orderData.deliveredByName || orderData.delivered_by_name }
        : {}),
      ...(orderData.deliveredAt || orderData.delivered_at
        ? { delivered_at: orderData.deliveredAt || orderData.delivered_at }
        : {}),
    };

    const attemptInsertOrder = async (payloadToInsert) => {
      let res = await supabase
        .from('orders')
        .insert(payloadToInsert)
        .select()
        .single();

      // Si faltan columnas opcionales (delivery_lat/pos_register_id/payment_breakdown/etc.) porque aún no se corrió la migración SQL
      if (res.error && (res.error.code === '42703' || String(res.error.message || '').includes('column'))) {
        const cleanFallback = { ...baseOrderPayload, id: payloadToInsert.id, invoice_number: payloadToInsert.invoice_number };
        res = await supabase
          .from('orders')
          .insert(cleanFallback)
          .select()
          .single();
      }
      return res;
    };

    let { data: order, error: orderError } = await attemptInsertOrder(extendedOrderPayload);

    // Reintentar una vez con nuevo ID atómico si hubo colisión PK (23505) entre pedido web y manual simultáneos
    if (orderError && orderError.code === '23505') {
      finalOrderId = await getNextOrderId();
      const retrySeqMatch = String(finalOrderId).match(/PED-(\d+)/i);
      const retrySeq = retrySeqMatch ? retrySeqMatch[1] : seqNum;
      const retryYear = String(baseOrderPayload.delivery_date || '').slice(0, 4) || '2026';
      extendedOrderPayload.id = finalOrderId;
      extendedOrderPayload.invoice_number = `BOL-${retryYear}-${retrySeq}`;
      baseOrderPayload.id = finalOrderId;
      baseOrderPayload.invoice_number = `BOL-${retryYear}-${retrySeq}`;

      const retryRes = await attemptInsertOrder(extendedOrderPayload);
      order = retryRes.data;
      orderError = retryRes.error;
    }

    if (orderError) throw orderError;

    const orderPayload = { ...extendedOrderPayload, id: finalOrderId };

    // Insertar ítems del pedido
    let itemsInsertError = null;
    if (items && items.length > 0) {
      // Cargar catálogo de productos para garantizar resolución exacta de variante (ID + formato)
      const { data: allDbProducts } = await supabase
        .from('products')
        .select('id, name, brand, sku, weights, stock, unit_cost_neto');

      const itemsPayload = items.map((item) => {
        const directProdId = item.productId || item.product_id || (typeof item.id === 'string' && item.id.startsWith('PROD-') ? item.id : null);
        const resolvedVariant = directProdId
          ? (allDbProducts || []).find((p) => p.id === directProdId)
          : resolveInventoryVariant(allDbProducts || [], item);

        return {
          order_id: orderPayload.id,
          product_id: resolvedVariant?.id || directProdId || item.id || null,
          product_name: item.name,
          weight: item.weight || item.selectedWeight || item.format || '1 unidad',
          quantity: item.quantity || 1,
          unit_price: item.price || 0,
          subtotal: (item.price || 0) * (item.quantity || 1),
        };
      });

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(itemsPayload);

      if (itemsError) {
        itemsInsertError = itemsError;
        console.error('Error inserting order items into Supabase:', itemsError.message);
      }

      // Descontar stock en Supabase de forma centralizada agrupando por variante exacta
      const deductionsByProdId = new Map();
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        const qtyToDeduct = Math.max(1, Number(item.quantity || item.qty || 1));
        const resolvedVariant = resolveInventoryVariant(allDbProducts || [], item);
        const targetProductId =
          itemsPayload[i]?.product_id ||
          resolvedVariant?.id ||
          item.productId ||
          item.product_id ||
          (typeof item.id === 'string' && item.id.startsWith('PROD-') ? item.id : null);

        if (targetProductId) {
          deductionsByProdId.set(
            targetProductId,
            (deductionsByProdId.get(targetProductId) || 0) + qtyToDeduct
          );
        }
      }

      for (const [targetProductId, totalQtyToDeduct] of deductionsByProdId.entries()) {
        try {
          const { data: prodData, error: prodFetchErr } = await supabase
            .from('products')
            .select('id, stock')
            .eq('id', targetProductId)
            .maybeSingle();

          if (prodFetchErr) {
            console.warn('Error leyendo stock para descuento:', targetProductId, prodFetchErr.message);
            continue;
          }

          if (prodData) {
            const currentStock = Number(prodData.stock) || 0;
            const newStock = Math.max(0, currentStock - totalQtyToDeduct);
            const { error: stockUpdErr } = await supabase
              .from('products')
              .update({
                stock: newStock,
                updated_at: new Date().toISOString(),
              })
              .eq('id', targetProductId);

            if (stockUpdErr) {
              console.warn('Error persistiendo descuento de stock en Supabase:', targetProductId, stockUpdErr.message);
            }
          }
        } catch (stockDeductErr) {
          console.warn('Error descontando stock en Supabase para producto:', targetProductId, stockDeductErr);
        }
      }

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('patitas_products_updated'));
      }
    }

    // Si es un pedido proveniente de la tienda web, disparar notificación Web Push a dispositivos Admin (best-effort).
    // Para Mercado Pago aún pendiente, NO notificar todavía: se notificará una sola vez cuando el pago sea aprobado.
    const isMercadoPagoOrder =
      Boolean(orderPayload.mercadopago_preference_id) ||
      /mercado\s*pago/i.test(String(orderPayload.payment_method || ''));
    const isPaidOrder = String(orderPayload.payment_status || '').toLowerCase() === 'pagado';

    const normalizedChannel = String(orderPayload.channel || 'web').toLowerCase();
    if (
      normalizedChannel !== 'manual' &&
      normalizedChannel !== 'pos' &&
      !(isMercadoPagoOrder && !isPaidOrder)
    ) {
      triggerAdminNewOrderPush(orderPayload.id, 'new_web_order');
    }

    return {
      success: true,
      order: order || orderPayload,
      itemsError: itemsInsertError || null,
    };
  } catch (err) {
    console.error('Error creating order in Supabase:', err);
    return { success: false, error: err };
  }
}

export async function fetchOrdersFromSupabase({ throwOnError = false } = {}) {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (*),
        customers (
          *,
          pets (*)
        )
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('Error fetching orders from Supabase:', err);
    if (throwOnError) throw err;
    return [];
  }
}

/**
 * Crea una orden de pago en Mercado Pago (Orders API /v1/orders) a través del endpoint serverless /api/mercadopago-order
 */
export async function createMercadoPagoOrder({
  externalReference,
  totalAmount,
  payerEmail,
  payerFirstName,
  payerLastName,
  payerName,
  payerPhone,
  payerIdentification,
  payerRegistrationDate,
  payerIsFirstPurchaseOnline,
  payerAuthenticationType,
  additionalInfo,
  items = [],
  shippingCost = 0,
  description,
  origin,
  config,
}) {
  try {
    const resolvedOrigin =
      origin ||
      (typeof window !== 'undefined' && window.location?.origin
        ? window.location.origin
        : 'https://www.patitas-delsur.cl');

    const response = await fetch('/api/mercadopago-order', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        externalReference,
        totalAmount,
        payerEmail,
        payerFirstName,
        payerLastName,
        payerName,
        payerPhone,
        payerIdentification,
        payerRegistrationDate,
        payerIsFirstPurchaseOnline,
        payerAuthenticationType,
        additionalInfo,
        items,
        shippingCost,
        description,
        origin: resolvedOrigin,
        config,
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data?.error || 'Error al crear la orden en Mercado Pago');
    }

    return {
      success: true,
      mpOrder: data,
      mpOrderId: data.id,
      checkoutUrl: data.checkout_url,
    };
  } catch (err) {
    console.error('Error en createMercadoPagoOrder:', err);
    return {
      success: false,
      error: err,
    };
  }
}

/**
 * Consulta una orden de Mercado Pago por su ID (GET /api/mercadopago-order?id=...)
 */
export async function getMercadoPagoOrderById(mpOrderId) {
  try {
    const response = await fetch(`/api/mercadopago-order?id=${encodeURIComponent(mpOrderId)}`);
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data?.error || 'Error al consultar la orden en Mercado Pago');
    }
    return { success: true, mpOrder: data };
  } catch (err) {
    console.error('Error en getMercadoPagoOrderById:', err);
    return { success: false, error: err };
  }
}

/**
 * Actualiza los identificadores y estado de pago de Mercado Pago en un pedido de Supabase
 */
export async function updateOrderMercadoPagoData(orderId, { mpOrderId, mpPaymentId, paymentStatus }) {
  try {
    const updatePayload = {};
    if (mpOrderId !== undefined) updatePayload.mercadopago_preference_id = mpOrderId;
    if (mpPaymentId !== undefined) updatePayload.mercadopago_payment_id = mpPaymentId;
    if (paymentStatus !== undefined) updatePayload.payment_status = paymentStatus;

    const { data, error } = await supabase
      .from('orders')
      .update(updatePayload)
      .eq('id', orderId)
      .select()
      .maybeSingle();

    if (error) throw error;
    return { success: true, data };
  } catch (err) {
    console.error('Error updating order Mercado Pago data in Supabase:', err);
    return { success: false, error: err };
  }
}

/**
 * Ajusta el stock en Supabase para un listado de ítems (direction = +1 reintegra, -1 descuenta)
 * agrupando por variante exacta mediante resolveInventoryVariant.
 */
export async function adjustStockForItemsInSupabase(items = [], direction = -1) {
  if (!Array.isArray(items) || items.length === 0) return { success: true, adjustedCount: 0 };
  try {
    const { data: allDbProducts } = await supabase
      .from('products')
      .select('id, name, brand, sku, weights, stock');

    const deltasByProdId = new Map();
    for (const item of items) {
      const qty = Math.max(1, Number(item.quantity || item.qty || 1));
      const resolved = resolveInventoryVariant(allDbProducts || [], {
        productId: item.productId || item.product_id,
        id: typeof item.id === 'string' && item.id.startsWith('PROD-') ? item.id : undefined,
        sku: item.sku || item.code,
        name: item.name || item.product_name,
        format: item.format || item.weight,
      });
      const targetProdId =
        resolved?.id ||
        item.productId ||
        item.product_id ||
        (typeof item.id === 'string' && item.id.startsWith('PROD-') ? item.id : null);

      if (targetProdId) {
        deltasByProdId.set(targetProdId, (deltasByProdId.get(targetProdId) || 0) + qty * direction);
      }
    }

    let adjustedCount = 0;
    for (const [prodId, delta] of deltasByProdId.entries()) {
      const { data: freshProd } = await supabase
        .from('products')
        .select('id, stock')
        .eq('id', prodId)
        .maybeSingle();

      if (freshProd) {
        const currentStock = Number(freshProd.stock) || 0;
        const nextStock = Math.max(0, currentStock + delta);
        await supabase
          .from('products')
          .update({ stock: nextStock, updated_at: new Date().toISOString() })
          .eq('id', prodId);
        adjustedCount += 1;
      }
    }

    if (typeof window !== 'undefined' && adjustedCount > 0) {
      window.dispatchEvent(new Event('patitas_products_updated'));
    }

    return { success: true, adjustedCount };
  } catch (err) {
    console.error('Error adjusting stock for items in Supabase:', err);
    return { success: false, error: err, adjustedCount: 0 };
  }
}

/**
 * Elimina un pedido y sus ítems permanentemente de Supabase.
 * Si el pedido NO estaba cancelado, reintegra el stock a bodega; si estaba pagado, revierte puntos y total_spent.
 */
export async function deleteOrderFromSupabase(orderId) {
  if (!orderId) return { success: false };
  try {
    let stockRestored = false;
    try {
      const { data: orderRow } = await supabase
        .from('orders')
        .select('id, status, payment_status, customer_id, total, points_earned, order_items (*)')
        .eq('id', orderId)
        .maybeSingle();

      if (orderRow) {
        // 1. Reintegrar stock si el pedido estaba activo (no cancelado)
        if (orderRow.status !== 'cancelado' && Array.isArray(orderRow.order_items) && orderRow.order_items.length > 0) {
          const stockRes = await adjustStockForItemsInSupabase(orderRow.order_items, 1);
          stockRestored = stockRes.adjustedCount > 0;
        }

        // 2. Revertir puntos y total_spent si el pedido ya estaba pagado
        const wasPaid = String(orderRow.payment_status || '').trim().toLowerCase() === 'pagado';
        if (wasPaid && orderRow.customer_id) {
          const { data: cust } = await supabase
            .from('customers')
            .select('id, points, total_spent')
            .eq('id', orderRow.customer_id)
            .maybeSingle();

          if (cust) {
            const ptsToRevert =
              orderRow.points_earned !== null && orderRow.points_earned !== undefined
                ? Number(orderRow.points_earned) || 0
                : Math.floor((Number(orderRow.total) || 0) / 1000);
            const totalToRevert = Number(orderRow.total) || 0;
            await supabase
              .from('customers')
              .update({
                points: Math.max(0, (Number(cust.points) || 0) - ptsToRevert),
                total_spent: Math.max(0, (Number(cust.total_spent) || 0) - totalToRevert),
              })
              .eq('id', cust.id);

            if (typeof window !== 'undefined') {
              window.dispatchEvent(new Event('patitas_customers_updated'));
            }
          }
        }
      }
    } catch (cleanupErr) {
      console.warn('No se pudo reintegrar stock/puntos antes de eliminar el pedido:', cleanupErr);
    }

    await supabase.from('order_items').delete().eq('order_id', orderId);
    const { error } = await supabase.from('orders').delete().eq('id', orderId);
    if (error) throw error;
    return { success: true, stockRestored };
  } catch (err) {
    console.error('Error deleting order from Supabase:', err);
    return { success: false, error: err };
  }
}

/**
 * Elimina todos los pedidos en estado 'cancelado' y re-secuencia los IDs si quedaron huecos
 */
export async function deleteCancelledOrdersFromSupabase() {
  try {
    const { data: cancelled } = await supabase
      .from('orders')
      .select('id')
      .eq('status', 'cancelado');

    if (cancelled && cancelled.length > 0) {
      for (const c of cancelled) {
        await supabase.from('order_items').delete().eq('order_id', c.id);
        await supabase.from('orders').delete().eq('id', c.id);
      }
    }
    return { success: true, deletedCount: cancelled?.length || 0 };
  } catch (err) {
    console.error('Error deleting cancelled orders from Supabase:', err);
    return { success: false, error: err };
  }
}
