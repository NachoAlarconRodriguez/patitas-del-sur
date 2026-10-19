import { supabase } from '../lib/supabase.js';

/**
 * Servicio de Órdenes y Checkout con Supabase
 */

export async function createOrderInSupabase(orderData, items = []) {
  try {
    const orderPayload = {
      id: orderData.id || `PED-${Math.floor(1000 + Math.random() * 9000)}`,
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
      points_earned: orderData.pointsEarned || Math.round((orderData.total || 0) * 0.01),
      delivery_day_text: orderData.deliveryDayText || 'Hoy Mismo',
      delivery_date: orderData.deliveryDate || new Date().toISOString().split('T')[0],
      delivery_slot: orderData.deliverySlot || 'Tarde (14:00 - 19:00 hrs)',
      address: orderData.address || '',
      city: orderData.city || 'Puerto Varas',
      delivery_zone: orderData.deliveryZone || 'Zona 1: Radio Urbano Puerto Varas',
      agreement_used: orderData.agreementUsed || null,
      coupon_code_used: orderData.couponCodeUsed || null,
      notes: orderData.notes || '',
      invoice_number: orderData.invoiceNumber || `BOL-2026-${Math.floor(1000 + Math.random() * 9000)}`,
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
        order_items (*)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('Error fetching orders from Supabase:', err);
    return [];
  }
}
