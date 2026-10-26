import { supabase } from '../lib/supabase.js';

/**
 * Servicio de Clientes y Mascotas para sincronización con Supabase
 */

// Normalizar y enriquecer libreta de direcciones del cliente
export function normalizeCustomerAddresses(customer) {
  if (!customer) return customer;
  const cleanPhone = String(customer.phone || '').replace(/\D/g, '');
  let addresses = Array.isArray(customer.saved_addresses) ? [...customer.saved_addresses] : [];

  // 1. Si no viene en base de datos, buscar en caché local del navegador
  if (addresses.length === 0 && cleanPhone) {
    try {
      const cached = localStorage.getItem(`patitas_saved_addresses_${cleanPhone}`);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          addresses = parsed;
        }
      }
    } catch (e) {
      console.warn('Error reading cached addresses:', e);
    }
  }

  // 2. Si no hay lista pero sí tiene dirección habitual en perfil, generar ítem predeterminado
  if (addresses.length === 0 && customer.address) {
    addresses = [
      {
        id: 'default',
        label: 'Dirección guardada',
        address: customer.address,
        depto: customer.depto || customer.dept || '',
        city: customer.city || 'Puerto Varas',
        deliveryReference: customer.delivery_reference || customer.deliveryReference || customer.notes || '',
        isDefault: true,
      },
    ];
  }

  return {
    ...customer,
    saved_addresses: addresses,
  };
}

// Perfil de cliente (soporta búsqueda por Email, UUID o Teléfono Móvil)
export async function getCustomerProfile(identifier) {
  if (!identifier) return null;
  try {
    const trimmed = String(identifier).trim();

    // 1. Si contiene @, buscar por Email
    if (trimmed.includes('@')) {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('email', trimmed.toLowerCase())
        .maybeSingle();
      if (error) throw error;
      if (data) return normalizeCustomerAddresses(data);
    }

    // 2. Si tiene formato UUID válido, buscar por id o auth_user_id
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (uuidRegex.test(trimmed)) {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .or(`id.eq.${trimmed},auth_user_id.eq.${trimmed}`)
        .maybeSingle();
      if (error) throw error;
      if (data) return normalizeCustomerAddresses(data);
    }

    // 3. Si no es UUID ni Email, buscar por teléfono
    const byPhone = await getCustomerByPhone(trimmed);
    if (byPhone) return normalizeCustomerAddresses(byPhone);

    return null;
  } catch (err) {
    console.error('Error fetching customer profile from Supabase:', err);
    return null;
  }
}

// Buscar cliente por número de teléfono (actúa como Identificador Único de Cliente)
export async function getCustomerByPhone(phoneQuery) {
  if (!phoneQuery) return null;
  try {
    const rawDigits = String(phoneQuery).replace(/\D/g, '');
    const clean9 = rawDigits.startsWith('56') && rawDigits.length > 9 ? rawDigits.slice(2) : rawDigits;

    if (!clean9 || clean9.length < 8) return null;

    // Generar patrones para coincidir con distintos formatos en base de datos:
    // ej: 984561234, 9 8456 1234, 84561234, 8456 1234
    const formatted = `${clean9.slice(0, 1)} ${clean9.slice(1, 5)} ${clean9.slice(5)}`.trim();
    const last8 = clean9.length === 9 ? clean9.slice(1) : clean9;
    const formattedLast8 = `${last8.slice(0, 4)} ${last8.slice(4)}`.trim();

    const orConditions = [
      `phone.ilike.%${clean9}%`,
      `phone.ilike.%${formatted}%`,
      `phone.ilike.%${last8}%`,
      `phone.ilike.%${formattedLast8}%`,
      `phone.eq.${phoneQuery}`,
    ].join(',');

    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .or(orConditions)
      .limit(10);

    if (error) throw error;
    if (Array.isArray(data) && data.length > 0) {
      // Priorizar coincidencia exacta de los 9 dígitos limpios
      const exactMatch = data.find((c) => {
        if (!c.phone) return false;
        const cDigits = String(c.phone).replace(/\D/g, '');
        return cDigits.endsWith(clean9) || clean9.endsWith(cDigits);
      });
      return normalizeCustomerAddresses(exactMatch || data[0]);
    }
    return null;
  } catch (err) {
    console.error('Error fetching customer by phone from Supabase:', err);
    return null;
  }
}

export async function upsertCustomerProfile(profile) {
  try {
    const payload = {
      full_name: profile.fullName || profile.name || profile.full_name || 'Tutor Patitas',
      email: (profile.email || '').toLowerCase().trim(),
      phone: profile.phone || '',
      city: profile.city || '',
      address: profile.address || '',
      depto: (profile.depto || profile.dept || '').trim(),
      delivery_reference: (profile.delivery_reference || profile.deliveryReference || profile.notes || '').trim(),
      whatsapp_notifications: profile.whatsappNotifications ?? profile.whatsapp_notifications ?? true,
      role: profile.role || 'cliente',
    };

    if (profile.saved_addresses || profile.savedAddresses) {
      payload.saved_addresses = profile.saved_addresses || profile.savedAddresses;
    }

    if (profile.id && profile.id.length > 20) {
      payload.id = profile.id;
    }
    if (profile.auth_user_id) {
      payload.auth_user_id = profile.auth_user_id;
    }

    // Persistir copia en caché local por teléfono
    const cleanPhoneDigits = (payload.phone || '').replace(/\D/g, '');
    if (cleanPhoneDigits && payload.saved_addresses) {
      try {
        localStorage.setItem(`patitas_saved_addresses_${cleanPhoneDigits}`, JSON.stringify(payload.saved_addresses));
      } catch (cacheErr) {
        console.warn('Error saving addresses in localStorage cache:', cacheErr);
      }
    }

    let resultData = null;
    let existingId = profile.id && profile.id.length > 20 ? profile.id : null;

    // 1. Buscar por teléfono primero (el teléfono es el ID principal del cliente)
    if (!existingId && payload.phone) {
      const existingByPhone = await getCustomerByPhone(payload.phone);
      if (existingByPhone?.id) {
        existingId = existingByPhone.id;
      }
    }

    // 2. Si no se encontró por teléfono, buscar por email como alternativa
    if (!existingId && payload.email) {
      const { data: existingEmail } = await supabase
        .from('customers')
        .select('id')
        .eq('email', payload.email)
        .maybeSingle();
      if (existingEmail?.id) {
        existingId = existingEmail.id;
      }
    }

    if (existingId) {
      let updateRes = await supabase
        .from('customers')
        .update(payload)
        .eq('id', existingId)
        .select()
        .single();

      // Si la columna saved_addresses aún no ha sido migrada en Supabase (error 42703), reintentar sin ella
      if (updateRes.error && updateRes.error.code === '42703' && payload.saved_addresses) {
        const { saved_addresses: _, ...payloadWithoutSaved } = payload;
        updateRes = await supabase
          .from('customers')
          .update(payloadWithoutSaved)
          .eq('id', existingId)
          .select()
          .single();
      }

      if (updateRes.error) throw updateRes.error;
      resultData = updateRes.data;
    } else {
      let insertRes = await supabase
        .from('customers')
        .insert(payload)
        .select()
        .single();

      // Si la columna saved_addresses aún no ha sido migrada en Supabase (error 42703), reintentar sin ella
      if (insertRes.error && insertRes.error.code === '42703' && payload.saved_addresses) {
        const { saved_addresses: _, ...payloadWithoutSaved } = payload;
        insertRes = await supabase
          .from('customers')
          .insert(payloadWithoutSaved)
          .select()
          .single();
      }

      if (insertRes.error) throw insertRes.error;
      resultData = insertRes.data;
    }

    return { success: true, data: normalizeCustomerAddresses(resultData) };
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

// Sanitizar y convertir cualquier formato de fecha a ISO YYYY-MM-DD para columnas PostgreSQL DATE
export function formatIsoDate(dateVal) {
  if (!dateVal) return null;
  if (dateVal instanceof Date && !isNaN(dateVal.getTime())) {
    return dateVal.toISOString().split('T')[0];
  }
  if (typeof dateVal === 'string') {
    const trimmed = dateVal.trim();
    if (!trimmed || trimmed.toLowerCase().includes('no especificada') || trimmed.toLowerCase().includes('hoy') || trimmed.toLowerCase().includes('en ')) {
      return null;
    }
    // Formato ya ISO: YYYY-MM-DD
    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed;

    // Formato latinoamericano: DD/MM/YYYY o DD-MM-YYYY
    const dmyMatch = trimmed.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
    if (dmyMatch) {
      return `${dmyMatch[3]}-${dmyMatch[2].padStart(2, '0')}-${dmyMatch[1].padStart(2, '0')}`;
    }

    // Formato texto en español: ej. "12 de Octubre 2022" o "12 de Octubre de 2022"
    const spanishMonths = {
      enero: '01', febrero: '02', marzo: '03', abril: '04', mayo: '05', junio: '06',
      julio: '07', agosto: '08', septiembre: '09', octubre: '10', noviembre: '11', diciembre: '12'
    };
    const spMatch = trimmed.toLowerCase().match(/^(\d{1,2})\s+de\s+([a-záéíóúñ]+)(?:\s+de)?\s+(\d{4})/);
    if (spMatch && spanishMonths[spMatch[2]]) {
      return `${spMatch[3]}-${spanishMonths[spMatch[2]]}-${spMatch[1].padStart(2, '0')}`;
    }

    // Intento de parse nativo con Date
    const parsed = new Date(trimmed);
    if (!isNaN(parsed.getTime())) {
      return parsed.toISOString().split('T')[0];
    }
  }
  return null;
}

export async function addPetToSupabase(petData) {
  try {
    let resolvedCustomerId = petData.customerId || petData.customer_id;
    if (!resolvedCustomerId && (petData.customerEmail || petData.customerPhone)) {
      const cust = await getCustomerProfile(petData.customerEmail || petData.customerPhone);
      if (cust?.id) resolvedCustomerId = cust.id;
    }

    const payload = {
      customer_id: resolvedCustomerId,
      name: (petData.name || '').trim(),
      type: petData.type || 'perro',
      breed: petData.breed || '',
      birthdate: formatIsoDate(petData.birthdate),
      age: petData.age || '',
      weight: petData.weight ? String(petData.weight) : '',
      sterilized: petData.sterilized || 'Sí',
      favorite_food_name: petData.favoriteFoodName || petData.foodName || '',
      favorite_product_id: petData.favoriteProductId || null,
      bag_size: petData.bagSize || '',
      total_days_duration: parseInt(petData.totalDaysDuration, 10) || 30,
      days_remaining: parseInt(petData.daysRemaining, 10) || 30,
      last_order_date: formatIsoDate(petData.lastOrderDate) || null,
      estimated_depletion_date: formatIsoDate(petData.estimatedDepletionDate) || null,
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
    const cleanUpdates = { ...updates };
    if ('birthdate' in cleanUpdates) cleanUpdates.birthdate = formatIsoDate(cleanUpdates.birthdate);
    if ('last_order_date' in cleanUpdates) cleanUpdates.last_order_date = formatIsoDate(cleanUpdates.last_order_date);
    if ('estimated_depletion_date' in cleanUpdates) cleanUpdates.estimated_depletion_date = formatIsoDate(cleanUpdates.estimated_depletion_date);
    if ('deworming_external' in cleanUpdates) cleanUpdates.deworming_external = formatIsoDate(cleanUpdates.deworming_external);
    if ('deworming_internal' in cleanUpdates) cleanUpdates.deworming_internal = formatIsoDate(cleanUpdates.deworming_internal);

    const { data, error } = await supabase
      .from('pets')
      .update(cleanUpdates)
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

export async function updateCustomerInSupabase(customerId, updates) {
  if (!customerId) return { success: false, error: 'ID de cliente no proporcionado' };
  try {
    const payload = {};
    if (updates.name !== undefined || updates.fullName !== undefined || updates.full_name !== undefined) {
      payload.full_name = updates.fullName || updates.name || updates.full_name;
    }
    if (updates.email !== undefined) payload.email = updates.email.toLowerCase().trim();
    if (updates.phone !== undefined) payload.phone = updates.phone;
    if (updates.city !== undefined) payload.city = updates.city;
    if (updates.address !== undefined) payload.address = updates.address;
    if (updates.depto !== undefined) payload.depto = updates.depto;
    if (updates.deliveryReference !== undefined || updates.delivery_reference !== undefined) {
      payload.delivery_reference = updates.deliveryReference || updates.delivery_reference;
    }
    if (updates.points !== undefined) payload.points = parseInt(updates.points, 10) || 0;
    if (updates.role !== undefined) payload.role = updates.role;

    const { data, error } = await supabase
      .from('customers')
      .update(payload)
      .eq('id', customerId)
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (err) {
    console.error('Error updating customer in Supabase:', err);
    return { success: false, error: err };
  }
}

export async function deleteCustomerFromSupabase(customerId) {
  if (!customerId) return { success: false, error: 'ID de cliente no proporcionado' };
  try {
    const { error } = await supabase
      .from('customers')
      .delete()
      .eq('id', customerId);

    if (error) throw error;
    return { success: true };
  } catch (err) {
    console.error('Error deleting customer from Supabase:', err);
    return { success: false, error: err };
  }
}

/**
 * Obtener datos de reposición inteligente y pedido habitual del cliente
 */
export async function getCustomerReplenishmentData(customerId, phone) {
  const cleanPhone = String(phone || '').replace(/\D/g, '');
  let localData = null;
  if (cleanPhone) {
    try {
      const cached = localStorage.getItem(`patitas_replenishment_${cleanPhone}`);
      if (cached) localData = JSON.parse(cached);
    } catch (e) {
      console.warn('Error reading local replenishment cache:', e);
    }
  }

  try {
    const { data } = await supabase
      .from('store_settings')
      .select('value')
      .eq('key', 'replenishment_preferences')
      .maybeSingle();

    if (data?.value && typeof data.value === 'object') {
      const remoteData = (customerId && data.value[customerId]) || (cleanPhone ? data.value[cleanPhone] : null);
      if (remoteData) {
        return { ...localData, ...remoteData };
      }
    }
  } catch (err) {
    console.warn('Error reading replenishment data from store_settings:', err);
  }

  return localData || { frequencyDays: 30, habitualOrder: null, lastOrderDate: null };
}

/**
 * Guardar datos de reposición inteligente y pedido habitual del cliente
 */
export async function saveCustomerReplenishmentData(customerId, phone, replenishmentData) {
  const cleanPhone = String(phone || '').replace(/\D/g, '');
  const dataToSave = {
    frequencyDays: Number(replenishmentData.frequencyDays) || 30,
    habitualOrder: Array.isArray(replenishmentData.habitualOrder) ? replenishmentData.habitualOrder : (replenishmentData.habitualOrder || null),
    lastOrderDate: replenishmentData.lastOrderDate || new Date().toISOString().split('T')[0],
    updatedAt: new Date().toISOString(),
  };

  // 1. Guardar en localStorage para respuesta instantánea
  if (cleanPhone) {
    try {
      localStorage.setItem(`patitas_replenishment_${cleanPhone}`, JSON.stringify(dataToSave));
    } catch (e) {
      console.warn('Error caching replenishment data:', e);
    }
  }

  // 2. Guardar en store_settings en Supabase
  try {
    const { data: current } = await supabase
      .from('store_settings')
      .select('value')
      .eq('key', 'replenishment_preferences')
      .maybeSingle();

    const existingMap = current?.value && typeof current.value === 'object' ? current.value : {};
    if (customerId) existingMap[customerId] = dataToSave;
    if (cleanPhone) existingMap[cleanPhone] = dataToSave;

    await supabase
      .from('store_settings')
      .upsert({
        key: 'replenishment_preferences',
        value: existingMap,
        updated_at: new Date().toISOString(),
      });
  } catch (err) {
    console.warn('Error saving replenishment data in store_settings:', err);
  }

  return { success: true, data: dataToSave };
}


