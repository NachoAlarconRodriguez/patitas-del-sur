import { supabase } from '../lib/supabase.js';
import { resolveInventoryVariant } from '../utils/productVariants.js';

/**
 * Servicio de Órdenes y Checkout con Supabase
 */

export async function getNextOrderId() {
  try {
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
    return 'PED-0001';
  }
}

export async function createOrderInSupabase(orderData, items = []) {
  try {
    const finalOrderId = orderData.id || (await getNextOrderId());
    const seqMatch = String(finalOrderId).match(/PED-(\d+)/i);
    const seqNum = seqMatch ? seqMatch[1] : '0001';
    const orderTotalNum = Number(orderData.total || 0);
    const earnedPts =
      orderData.pointsEarned !== undefined
        ? Number(orderData.pointsEarned) || 0
        : Math.floor(orderTotalNum / 1000);

    // 1. Vincular o registrar automáticamente al cliente en la tabla customers (CRM)
    let resolvedCustomerId = orderData.customerId || null;
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
        await supabase
          .from('customers')
          .update({
            total_spent: (Number(matchedCust.total_spent) || 0) + orderTotalNum,
            points: (Number(matchedCust.points) || 0) + earnedPts,
            address: orderData.address || matchedCust.address || '',
            city: orderData.city || matchedCust.city || 'Frutillar',
          })
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
            points: earnedPts,
            total_spent: orderTotalNum,
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

    const orderPayload = {
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
      points_earned: earnedPts,
      delivery_day_text: orderData.deliveryDayText || 'Hoy Mismo',
      delivery_date:
        orderData.deliveryDate ||
        orderData.delivery_date ||
        new Intl.DateTimeFormat('en-CA', {
          timeZone: 'America/Santiago',
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
        }).format(new Date()),
      delivery_slot: orderData.deliverySlot || 'Tarde (15:30 - 19:30 hrs)',
      address: orderData.address || '',
      city: orderData.city || 'Puerto Varas',
      delivery_zone: orderData.deliveryZone || 'Zona 1: Radio Urbano Puerto Varas',
      agreement_used: orderData.agreementUsed || null,
      coupon_code_used: orderData.couponCodeUsed || null,
      notes: orderData.notes || '',
      invoice_number: orderData.invoiceNumber || `BOL-2026-${seqNum}`,
      created_at: orderData.created_at || orderData.createdAt || new Date().toISOString(),
    };

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert(orderPayload)
      .select()
      .single();

    if (orderError) throw orderError;

    // Insertar ítems del pedido
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
        console.warn('Error inserting order items into Supabase:', itemsError.message);
      }

      // Descontar stock en Supabase de forma centralizada y atómica agrupando por variante exacta
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
          const { data: prodData } = await supabase
            .from('products')
            .select('id, stock')
            .eq('id', targetProductId)
            .maybeSingle();

          if (prodData) {
            const currentStock = Number(prodData.stock) || 0;
            const newStock = Math.max(0, currentStock - totalQtyToDeduct);
            await supabase
              .from('products')
              .update({
                stock: newStock,
                updated_at: new Date().toISOString(),
              })
              .eq('id', targetProductId);
          }
        } catch (stockDeductErr) {
          console.warn('Error descontando stock en Supabase para producto:', targetProductId, stockDeductErr);
        }
      }

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('patitas_products_updated'));
      }
    }

    return { success: true, order: order || orderPayload };
  } catch (err) {
    console.error('Error creating order in Supabase:', err);
    return { success: false, error: err };
  }
}

export async function fetchOrdersFromSupabase() {
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
 * Elimina un pedido y sus ítems permanentemente de Supabase (ideal para limpiar pedidos de prueba o cancelados)
 */
export async function deleteOrderFromSupabase(orderId) {
  if (!orderId) return { success: false };
  try {
    await supabase.from('order_items').delete().eq('order_id', orderId);
    const { error } = await supabase.from('orders').delete().eq('id', orderId);
    if (error) throw error;
    return { success: true };
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
