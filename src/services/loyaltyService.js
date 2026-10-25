import { supabase } from '../lib/supabase';
import { updateCustomerPoints } from './customersService';

export const DEFAULT_LOYALTY_SETTINGS = {
  pointsPerThousand: 1, // 1 Punto por cada $1.000 CLP gastados
  tiers: [
    {
      id: 'reward-100',
      points: 100,
      discountAmount: 3000,
      title: 'Cupón $3.000 CLP Dcto.',
      validity: 'Válido para 1 compra',
      description: 'Aplica $3.000 de descuento directo en el total de tu próxima compra.',
      icon: '💵',
      active: true,
    },
    {
      id: 'reward-200',
      points: 200,
      discountAmount: 7000,
      title: 'Cupón $7.000 CLP Dcto.',
      validity: 'Válido para 1 compra',
      description: 'Aplica $7.000 de descuento directo en el total de tu próxima compra.',
      icon: '💰',
      active: true,
    },
    {
      id: 'reward-350',
      points: 350,
      discountAmount: 14000,
      title: 'Cupón $14.000 CLP Dcto.',
      validity: 'Válido para 1 compra',
      description: 'Aplica $14.000 de descuento directo en el total de tu próxima compra.',
      icon: '🏷️',
      active: true,
    },
    {
      id: 'reward-500',
      points: 500,
      discountAmount: 25000,
      title: 'Cupón $25.000 CLP Dcto.',
      validity: 'Válido para 1 compra',
      description: 'Aplica $25.000 de descuento directo en el total de tu próxima compra.',
      icon: '👑',
      active: true,
    },
  ],
};

/**
 * Obtener la configuración actual del programa de fidelización desde store_settings
 */
export async function getLoyaltySettings() {
  try {
    const { data, error } = await supabase
      .from('store_settings')
      .select('value')
      .eq('key', 'loyalty')
      .maybeSingle();

    if (error) {
      console.warn('Error fetching loyalty settings from Supabase, using defaults:', error);
      return DEFAULT_LOYALTY_SETTINGS;
    }

    if (data?.value && typeof data.value === 'object') {
      return {
        pointsPerThousand: Number(data.value.pointsPerThousand) || 1,
        tiers: Array.isArray(data.value.tiers) ? data.value.tiers : DEFAULT_LOYALTY_SETTINGS.tiers,
      };
    }

    return DEFAULT_LOYALTY_SETTINGS;
  } catch (err) {
    console.error('Exception fetching loyalty settings:', err);
    return DEFAULT_LOYALTY_SETTINGS;
  }
}

/**
 * Guardar la configuración editada por el Administrador en store_settings
 */
export async function saveLoyaltySettings(newSettings) {
  try {
    const payload = {
      pointsPerThousand: Number(newSettings.pointsPerThousand) || 1,
      tiers: Array.isArray(newSettings.tiers) ? newSettings.tiers : DEFAULT_LOYALTY_SETTINGS.tiers,
    };

    const { data, error } = await supabase
      .from('store_settings')
      .upsert({
        key: 'loyalty',
        value: payload,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return { success: true, settings: payload, data };
  } catch (err) {
    console.error('Error saving loyalty settings in Supabase:', err);
    return { success: false, error: err.message || err };
  }
}

/**
 * Calcular los puntos ganados por un monto de compra
 * 1 Punto por cada $1.000 CLP gastados
 */
export function calculatePointsEarned(totalAmount, pointsPerThousand = 1) {
  const safeTotal = Math.max(0, Number(totalAmount) || 0);
  const rate = Number(pointsPerThousand) || 1;
  return Math.floor(safeTotal / 1000) * rate;
}

/**
 * Obtener todos los cupones canjeados por un cliente específico
 */
export async function getCustomerRedemptions(customerId) {
  if (!customerId) return [];
  try {
    const { data, error } = await supabase
      .from('points_redemptions')
      .select('*')
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('Error fetching customer redemptions:', err);
    return [];
  }
}

/**
 * Canjear un cupón de puntos para un cliente
 * - Valida saldo
 * - Descuenta puntos en customers
 * - Genera registro en points_redemptions con código PTS-XXXXX
 */
export async function redeemRewardForCustomer(customer, tier) {
  if (!customer?.id) {
    return { success: false, error: 'No se identificó al cliente para el canje.' };
  }

  const currentPoints = Number(customer.points || 0);
  const cost = Number(tier.points || 0);

  if (currentPoints < cost) {
    return {
      success: false,
      error: `Puntos insuficientes. Tienes ${currentPoints} Pts y necesitas ${cost} Pts.`,
    };
  }

  try {
    // 1. Generar código alfanumérico único
    const randomChars = Math.random().toString(36).substring(2, 7).toUpperCase();
    const couponCode = `PTS-${randomChars}`;

    // 2. Descontar puntos del cliente
    const updateResult = await updateCustomerPoints(customer.id, -cost);
    if (!updateResult.success) {
      throw new Error('Error al actualizar el saldo de puntos del cliente.');
    }

    // 3. Registrar el canje en points_redemptions
    const { data: redemptionData, error: redemptionError } = await supabase
      .from('points_redemptions')
      .insert({
        customer_id: customer.id,
        reward_id: tier.id,
        points_spent: cost,
        coupon_code: couponCode,
        status: 'activo',
      })
      .select()
      .single();

    if (redemptionError) {
      console.error('Error saving redemption record:', redemptionError);
      // Puntos ya descontados, retornamos con el código
    }

    const newBalance = updateResult.points ?? (currentPoints - cost);

    return {
      success: true,
      newPoints: newBalance,
      coupon: {
        id: redemptionData?.id || `RED-${Date.now()}`,
        code: couponCode,
        title: tier.title,
        discountAmount: tier.discountAmount,
        pointsCost: cost,
        validity: tier.validity,
        status: 'activo',
        createdAt: new Date().toISOString(),
      },
    };
  } catch (err) {
    console.error('Error redeeming reward:', err);
    return { success: false, error: err.message || 'Error inesperado al canjear premio.' };
  }
}

/**
 * Marcar cupón como utilizado cuando se finaliza una compra
 */
export async function markCouponAsUsed(couponCode, orderId) {
  if (!couponCode) return;
  try {
    const { data, error } = await supabase
      .from('points_redemptions')
      .update({ status: 'utilizado' })
      .eq('coupon_code', couponCode.trim())
      .select();

    if (error) {
      console.warn('Error marking coupon as used:', error);
    }
    return { success: !error, data };
  } catch (e) {
    console.warn('Exception marking coupon as used:', e);
  }
}

/**
 * Para el Panel de Administración:
 * Obtener todos los canjes realizados con detalles de cliente y pedidos
 */
export async function getAllRedemptionsWithAudit() {
  try {
    const [redemptionsRes, customersRes, ordersRes, settingsRes] = await Promise.all([
      supabase.from('points_redemptions').select('*').order('created_at', { ascending: false }),
      supabase.from('customers').select('id, full_name, email, phone, points'),
      supabase.from('orders').select('id, customer_name, total, coupon_code_used, discount, created_at'),
      getLoyaltySettings(),
    ]);

    const redemptions = redemptionsRes.data || [];
    const customers = customersRes.data || [];
    const orders = ordersRes.data || [];
    const tiers = settingsRes.tiers || DEFAULT_LOYALTY_SETTINGS.tiers;

    // Indexar clientes por id
    const customerMap = new Map();
    customers.forEach((c) => customerMap.set(c.id, c));

    // Indexar órdenes por coupon_code_used
    const orderMap = new Map();
    orders.forEach((o) => {
      if (o.coupon_code_used) {
        orderMap.set(o.coupon_code_used.trim().toUpperCase(), o);
      }
    });

    // Mapear cada canje enriquecido
    const enriched = redemptions.map((r) => {
      const cust = customerMap.get(r.customer_id) || {};
      const tier = tiers.find((t) => t.id === r.reward_id) || {};
      const matchedOrder = r.coupon_code ? orderMap.get(r.coupon_code.trim().toUpperCase()) : null;

      // Descuento en dinero: o del tier o por default de acuerdo a los puntos gastados
      let discountAmount = tier.discountAmount;
      if (!discountAmount) {
        if (r.points_spent === 100) discountAmount = 3000;
        else if (r.points_spent === 200) discountAmount = 7000;
        else if (r.points_spent === 350) discountAmount = 14000;
        else if (r.points_spent === 500) discountAmount = 25000;
        else discountAmount = r.points_spent * 30;
      }

      return {
        id: r.id,
        createdAt: r.created_at,
        customerName: cust.full_name || 'Cliente Patitas',
        customerEmail: cust.email || '',
        customerPhone: cust.phone || '',
        currentCustomerPoints: cust.points ?? 0,
        rewardId: r.reward_id,
        rewardTitle: tier.title || `Cupón $${discountAmount.toLocaleString('es-CL')} Dcto.`,
        pointsSpent: r.points_spent,
        discountAmount,
        couponCode: r.coupon_code,
        status: matchedOrder ? 'utilizado' : (r.status || 'activo'),
        usedInOrderId: matchedOrder?.id || null,
        usedInOrderTotal: matchedOrder?.total || null,
      };
    });

    return enriched;
  } catch (err) {
    console.error('Error fetching redemptions with audit:', err);
    return [];
  }
}
