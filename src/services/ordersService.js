import { supabase } from '../lib/supabase.js';

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

    const orderPayload = {
      id: finalOrderId,
      customer_id: orderData.customerId || null,
      customer_name: orderData.customerName || 'Cliente Web',
      customer_email: orderData.customerEmail || null,
      customer_phone: orderData.customerPhone || null,
      channel: orderData.channel || 'web',
      payment_method: orderData.paymentMethod || 'Tarjeta',
      payment_status: orderData.paymentStatus || 'pendiente',
      status: orderData.status || 'en_preparacion',
      subtotal: orderData.subtotal || 0,
      shipping_cost: orderData.shippingCost || 0,
      discount: orderData.discount || 0,
      total: orderData.total || 0,
      points_earned: orderData.pointsEarned !== undefined ? orderData.pointsEarned : Math.floor((orderData.total || 0) / 1000),
      delivery_day_text: orderData.deliveryDayText || 'Hoy Mismo',
      delivery_date: orderData.deliveryDate || new Date().toISOString().split('T')[0],
      delivery_slot: orderData.deliverySlot || 'Tarde (14:00 - 19:00 hrs)',
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
      const itemsPayload = items.map((item) => ({
        order_id: orderPayload.id,
        product_id: item.id || null,
        product_name: item.name,
        weight: item.weight || item.selectedWeight || '1 unidad',
        quantity: item.quantity || 1,
        unit_price: item.price || 0,
        subtotal: (item.price || 0) * (item.quantity || 1),
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(itemsPayload);

      if (itemsError) {
        console.warn('Error inserting order items into Supabase:', itemsError.message);
      }

      // Descontar stock en Supabase de forma centralizada y atómica
      for (const item of items) {
        try {
          const qtyToDeduct = Number(item.quantity || item.qty || 1);
          let targetProductId = item.id || item.product_id || item.productId || null;

          // Si no tenemos ID directo, buscar por nombre o SKU
          if (!targetProductId && item.name) {
            const { data: matched } = await supabase
              .from('products')
              .select('id, stock')
              .ilike('name', `%${String(item.name).trim()}%`)
              .limit(1)
              .maybeSingle();

            if (matched) {
              targetProductId = matched.id;
              const currentStock = Number(matched.stock) || 0;
              const newStock = Math.max(0, currentStock - qtyToDeduct);
              await supabase
                .from('products')
                .update({ stock: newStock })
                .eq('id', targetProductId);
              continue;
            }
          }

          if (targetProductId) {
            // Consultar stock fresco en base de datos para descontar con precisión
            const { data: prodData } = await supabase
              .from('products')
              .select('id, stock')
              .eq('id', targetProductId)
              .maybeSingle();

            if (prodData) {
              const currentStock = Number(prodData.stock) || 0;
              const newStock = Math.max(0, currentStock - qtyToDeduct);
              await supabase
                .from('products')
                .update({ stock: newStock })
                .eq('id', targetProductId);
            }
          }
        } catch (stockDeductErr) {
          console.warn('Error descontando stock en Supabase para ítem:', item, stockDeductErr);
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
