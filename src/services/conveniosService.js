import { supabase } from '../lib/supabase.js';

/**
 * Servicio de Convenios Comerciales y Cupones Promocionales
 */

export async function fetchConveniosFromSupabase() {
  try {
    const { data, error } = await supabase
      .from('convenios')
      .select(`
        *,
        convenio_coupons (*)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Normalizar para que sea 100% compatible con los componentes existentes
    return (data || []).map((conv) => ({
      ...conv,
      discountPercent: conv.discount_percent ?? conv.discountPercent ?? 10,
      commissionPercent: conv.commission_percent ?? conv.commissionPercent ?? 8,
      discountType: conv.discount_type ?? conv.discountType ?? 'general',
      redemptionsCount: conv.redemptions_count ?? conv.redemptionsCount ?? 0,
      coupons: (conv.convenio_coupons || []).map((cp) => ({
        id: cp.id,
        code: cp.code,
        status: cp.status,
        orderId: cp.order_id,
        usedAt: cp.used_at,
      })),
    }));
  } catch (err) {
    console.error('Error fetching convenios from Supabase:', err);
    return [];
  }
}

export async function createConvenioInSupabase(convenioData, couponCodes = []) {
  try {
    const convenioPayload = {
      id: convenioData.id || `conv-${Date.now()}`,
      name: convenioData.name,
      type: convenioData.type || 'veterinaria',
      contact_name: convenioData.contactName || convenioData.contact_name || '',
      phone: convenioData.phone || '',
      email: convenioData.email || '',
      discount_type: convenioData.discountType || convenioData.discount_type || 'general',
      discount_percent: convenioData.discountPercent || convenioData.discount_percent || 10,
      commission_percent: convenioData.commissionPercent || convenioData.commission_percent || 8,
      active: convenioData.active ?? true,
      redemptions_count: 0,
    };

    const { data: convenio, error: convError } = await supabase
      .from('convenios')
      .insert(convenioPayload)
      .select()
      .single();

    if (convError) throw convError;

    // Insertar cupones si aplica tipo single_use
    if (couponCodes && couponCodes.length > 0) {
      const couponsPayload = couponCodes.map((code) => ({
        convenio_id: convenioPayload.id,
        code: code.trim().toUpperCase(),
        status: 'disponible',
      }));

      const { error: couponsError } = await supabase
        .from('convenio_coupons')
        .insert(couponsPayload);

      if (couponsError) {
        console.warn('Error inserting coupons:', couponsError.message);
      }
    }

    return { success: true, data: convenio };
  } catch (err) {
    console.error('Error creating convenio in Supabase:', err);
    return { success: false, error: err };
  }
}

export async function verifyCouponInSupabase(couponCode) {
  const code = (couponCode || '').trim().toUpperCase();
  if (!code) return { valid: false, error: 'Ingresa un código de cupón.' };

  try {
    // 1. Buscar en cupones de 1 solo uso
    const { data: singleUseCoupon, error: singleErr } = await supabase
      .from('convenio_coupons')
      .select(`
        *,
        convenios (*)
      `)
      .eq('code', code)
      .maybeSingle();

    if (singleUseCoupon) {
      if (singleUseCoupon.status === 'canjeado') {
        return { valid: false, error: `El cupón ${code} ya fue utilizado en una compra anterior.` };
      }
      if (!singleUseCoupon.convenios?.active) {
        return { valid: false, error: 'El convenio asociado no se encuentra activo actualmente.' };
      }
      return {
        valid: true,
        coupon: singleUseCoupon,
        convenio: singleUseCoupon.convenios,
        discountPercent: singleUseCoupon.convenios.discount_percent,
        isSingleUse: true,
      };
    }

    // 2. Buscar en convenios de código general (ej. CONV-PATITAS)
    const { data: generalConvenio, error: genErr } = await supabase
      .from('convenios')
      .select('*')
      .eq('id', code.toLowerCase())
      .eq('active', true)
      .maybeSingle();

    if (generalConvenio) {
      return {
        valid: true,
        convenio: generalConvenio,
        discountPercent: generalConvenio.discount_percent,
        isSingleUse: false,
      };
    }

    return { valid: false, error: 'Código no válido o no encontrado en el sistema.' };
  } catch (err) {
    console.error('Error verifying coupon in Supabase:', err);
    return { valid: false, error: 'Error al verificar el cupón en la base de datos.' };
  }
}

export async function redeemCouponInSupabase(code, orderId) {
  const cleanCode = (code || '').trim().toUpperCase();
  if (!cleanCode) return { success: false };

  try {
    const { data: coupon, error: fetchErr } = await supabase
      .from('convenio_coupons')
      .select('id, convenio_id')
      .eq('code', cleanCode)
      .maybeSingle();

    if (fetchErr) throw fetchErr;

    if (coupon) {
      // Marcar como canjeado
      await supabase
        .from('convenio_coupons')
        .update({
          status: 'canjeado',
          order_id: orderId,
          used_at: new Date().toISOString(),
        })
        .eq('id', coupon.id);

      // Incrementar contador de redenciones en el convenio
      if (coupon.convenio_id) {
        const { data: conv } = await supabase
          .from('convenios')
          .select('redemptions_count')
          .eq('id', coupon.convenio_id)
          .single();

        if (conv) {
          await supabase
            .from('convenios')
            .update({ redemptions_count: (conv.redemptions_count || 0) + 1 })
            .eq('id', coupon.convenio_id);
        }
      }
    }

    return { success: true };
  } catch (err) {
    console.error('Error redeeming coupon in Supabase:', err);
    return { success: false, error: err };
  }
}

export async function deleteConvenioFromSupabase(convenioId) {
  try {
    const { error } = await supabase
      .from('convenios')
      .delete()
      .eq('id', convenioId);

    if (error) throw error;
    return { success: true };
  } catch (err) {
    console.error('Error deleting convenio from Supabase:', err);
    return { success: false, error: err };
  }
}

export async function updateConvenioStatusInSupabase(convenioId, active) {
  try {
    const { data, error } = await supabase
      .from('convenios')
      .update({ active })
      .eq('id', convenioId)
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (err) {
    console.error('Error updating convenio status in Supabase:', err);
    return { success: false, error: err };
  }
}

export async function createConvenioCouponsInSupabase(convenioId, codes) {
  try {
    if (!codes || codes.length === 0) return { success: true, count: 0 };
    const payload = codes.map((c) => ({
      convenio_id: convenioId,
      code: typeof c === 'string' ? c.trim().toUpperCase() : c.code?.trim().toUpperCase(),
      status: 'disponible',
    }));

    const { data, error } = await supabase
      .from('convenio_coupons')
      .insert(payload)
      .select();

    if (error) throw error;
    return { success: true, count: data?.length || 0 };
  } catch (err) {
    console.error('Error adding convenio coupons to Supabase:', err);
    return { success: false, error: err };
  }
}

export async function deleteConvenioCouponFromSupabase(couponCode) {
  try {
    const code = (couponCode || '').trim().toUpperCase();
    const { error } = await supabase
      .from('convenio_coupons')
      .delete()
      .eq('code', code);

    if (error) throw error;
    return { success: true };
  } catch (err) {
    console.error('Error deleting coupon from Supabase:', err);
    return { success: false, error: err };
  }
}

