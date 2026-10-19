import { supabase } from '../lib/supabase.js';

/**
 * Servicio de Clientes y Mascotas para sincronización con Supabase
 */

// Perfil de cliente
export async function getCustomerProfile(identifier) {
  if (!identifier) return null;
  try {
    let query = supabase.from('customers').select('*');
    if (identifier.includes('@')) {
      query = query.eq('email', identifier.toLowerCase().trim());
    } else {
      query = query.or(`id.eq.${identifier},auth_user_id.eq.${identifier}`);
    }

    const { data, error } = await query.maybeSingle();
    if (error) throw error;
    return data;
  } catch (err) {
    console.error('Error fetching customer profile from Supabase:', err);
    return null;
  }
}

export async function upsertCustomerProfile(profile) {
  try {
    const payload = {
      full_name: profile.fullName || profile.name || profile.full_name || 'Tutor Patitas',
      email: (profile.email || '').toLowerCase().trim(),
      phone: profile.phone || '',
      city: profile.city || 'Puerto Varas',
      address: profile.address || '',
      depto: profile.depto || '',
      delivery_reference: profile.deliveryReference || profile.delivery_reference || '',
      whatsapp_notifications: profile.whatsappNotifications ?? profile.whatsapp_notifications ?? true,
      role: profile.role || 'cliente',
    };

    if (profile.id && profile.id.length > 20) {
      payload.id = profile.id;
    }
    if (profile.auth_user_id) {
      payload.auth_user_id = profile.auth_user_id;
    }

    let resultData = null;
    let existingId = profile.id && profile.id.length > 20 ? profile.id : null;

    if (!existingId && payload.email) {
      const { data: existing } = await supabase
        .from('customers')
        .select('id')
        .eq('email', payload.email)
        .maybeSingle();
      if (existing?.id) {
        existingId = existing.id;
      }
    }

    if (existingId) {
      const { data, error } = await supabase
        .from('customers')
        .update(payload)
        .eq('id', existingId)
        .select()
        .single();
      if (error) throw error;
      resultData = data;
    } else {
      const { data, error } = await supabase
        .from('customers')
        .insert(payload)
        .select()
        .single();
      if (error) throw error;
      resultData = data;
    }

    return { success: true, data: resultData };
  } catch (err) {
    console.error('Error saving customer profile in Supabase:', err);
    return { success: false, error: err };
  }
}

export async function updateCustomerPoints(customerId, pointsDelta) {
  try {
    const { data: customer, error: fetchErr } = await supabase
      .from('customers')
      .select('points')
      .eq('id', customerId)
      .single();

    if (fetchErr) throw fetchErr;

    const newPoints = Math.max(0, (customer?.points || 0) + pointsDelta);
    const { data, error } = await supabase
      .from('customers')
      .update({ points: newPoints })
      .eq('id', customerId)
      .select()
      .single();

    if (error) throw error;
    return { success: true, points: newPoints, data };
  } catch (err) {
    console.error('Error updating customer points:', err);
    return { success: false, error: err };
  }
}

// Mascotas del cliente
export async function getCustomerPets(customerId) {
  if (!customerId) return [];
  try {
    const { data, error } = await supabase
      .from('pets')
      .select('*')
      .eq('customer_id', customerId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('Error fetching customer pets from Supabase:', err);
    return [];
  }
}

export async function addPetToSupabase(petData) {
  try {
    const payload = {
      customer_id: petData.customerId || petData.customer_id,
      name: petData.name,
      type: petData.type || 'perro',
      breed: petData.breed || '',
      birthdate: petData.birthdate || null,
      age: petData.age || '',
      weight: petData.weight ? String(petData.weight) : '',
      sterilized: petData.sterilized || 'Sí',
      favorite_food_name: petData.favoriteFoodName || petData.foodName || '',
      favorite_product_id: petData.favoriteProductId || null,
      bag_size: petData.bagSize || '',
      total_days_duration: parseInt(petData.totalDaysDuration, 10) || 30,
      days_remaining: parseInt(petData.daysRemaining, 10) || 30,
      last_order_date: petData.lastOrderDate || new Date().toISOString().split('T')[0],
      estimated_depletion_date: petData.estimatedDepletionDate || null,
      notes: petData.notes || '',
      vet_clinic: petData.vetClinic || '',
    };

    const { data, error } = await supabase
      .from('pets')
      .insert(payload)
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (err) {
    console.error('Error adding pet to Supabase:', err);
    return { success: false, error: err };
  }
}

export async function updatePetInSupabase(petId, updates) {
  try {
    const { data, error } = await supabase
      .from('pets')
      .update(updates)
      .eq('id', petId)
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (err) {
    console.error('Error updating pet in Supabase:', err);
    return { success: false, error: err };
  }
}

export async function deletePetFromSupabase(petId) {
  try {
    const { error } = await supabase
      .from('pets')
      .delete()
      .eq('id', petId);

    if (error) throw error;
    return { success: true };
  } catch (err) {
    console.error('Error deleting pet from Supabase:', err);
    return { success: false, error: err };
  }
}

export async function fetchAllCustomersForAdmin() {
  try {
    const { data, error } = await supabase
      .from('customers')
      .select(`
        *,
        pets (*)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('Error fetching customers for admin:', err);
    return [];
  }
}
