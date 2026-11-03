import { supabase } from '../lib/supabase.js';

export const SPECIAL_ORDERS_KEY = 'special_orders';

// Muestras iniciales de ejemplo si la base de datos está vacía para que el panel no esté en blanco
export const DEFAULT_SPECIAL_ORDERS = [
  {
    id: 'ENC-1001',
    customer_name: 'Ignacio Alarcón',
    customer_phone: '+56 9 5333 2492',
    customer_email: 'ignacio@patitasdelsur.cl',
    food_requested: 'Bravery Salmón Adulto 12 kg',
    status: 'pendiente', // 'pendiente' | 'en_gestion' | 'confirmado' | 'cancelado'
    notes: 'Cliente de Frutillar consulta si llega el próximo miércoles.',
    quote_price: 52900,
    delivery_date: '2026-11-05',
    created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
];

/**
 * Obtiene todas las solicitudes de encargos especiales desde Supabase (store_settings)
 */
export async function getSpecialOrdersFromSupabase() {
  try {
    const { data, error } = await supabase
      .from('store_settings')
      .select('value')
      .eq('key', SPECIAL_ORDERS_KEY)
      .maybeSingle();

    if (error) {
      console.warn('Error leyendo special_orders desde Supabase:', error.message);
      return getLocalSpecialOrders();
    }

    if (data && Array.isArray(data.value)) {
      setLocalSpecialOrders(data.value);
      return data.value;
    }

    // Si aún no existe en Supabase, inicializar con DEFAULT_SPECIAL_ORDERS
    const defaults = getLocalSpecialOrders();
    await supabase.from('store_settings').upsert({
      key: SPECIAL_ORDERS_KEY,
      value: defaults,
      updated_at: new Date().toISOString(),
    });
    return defaults;
  } catch (err) {
    console.error('Error in getSpecialOrdersFromSupabase:', err);
    return getLocalSpecialOrders();
  }
}

/**
 * Guarda una nueva solicitud de encargo especial
 */
export async function saveSpecialOrderToSupabase(requestData) {
  try {
    const currentOrders = await getSpecialOrdersFromSupabase();

    const newOrder = {
      id: `ENC-${Date.now().toString().slice(-6)}`,
      customer_name: (requestData.customer_name || requestData.customerName || 'Cliente').trim(),
      customer_phone: (requestData.customer_phone || requestData.customerPhone || '').trim(),
      customer_email: (requestData.customer_email || requestData.customerEmail || '').trim(),
      food_requested: (requestData.food_requested || requestData.foodRequested || '').trim(),
      status: 'pendiente',
      notes: requestData.notes || '',
      quote_price: requestData.quote_price || null,
      delivery_date: requestData.delivery_date || null,
      created_at: new Date().toISOString(),
    };

    const updatedOrders = [newOrder, ...currentOrders];

    // Guardar en Supabase
    const { error } = await supabase
      .from('store_settings')
      .upsert(
        {
          key: SPECIAL_ORDERS_KEY,
          value: updatedOrders,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'key' }
      );

    if (error) {
      console.warn('Error guardando en Supabase, guardando en respaldo local:', error.message);
    }

    setLocalSpecialOrders(updatedOrders);

    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('patitas_special_orders_updated', { detail: updatedOrders })
      );
    }

    return { success: true, data: newOrder };
  } catch (err) {
    console.error('Error saving special order:', err);
    return { success: false, error: err };
  }
}

/**
 * Actualiza el estado, cotización o notas de un encargo especial
 */
export async function updateSpecialOrderStatusInSupabase(orderId, updates) {
  try {
    const currentOrders = await getSpecialOrdersFromSupabase();
    const updatedOrders = currentOrders.map((ord) => {
      if (ord.id === orderId) {
        return {
          ...ord,
          ...updates,
          updated_at: new Date().toISOString(),
        };
      }
      return ord;
    });

    const { error } = await supabase
      .from('store_settings')
      .upsert(
        {
          key: SPECIAL_ORDERS_KEY,
          value: updatedOrders,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'key' }
      );

    if (error) {
      console.warn('Error actualizando encargo en Supabase:', error.message);
    }

    setLocalSpecialOrders(updatedOrders);

    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('patitas_special_orders_updated', { detail: updatedOrders })
      );
    }

    return { success: true, data: updatedOrders };
  } catch (err) {
    console.error('Error updating special order:', err);
    return { success: false, error: err };
  }
}

/**
 * Elimina un encargo especial del registro
 */
export async function deleteSpecialOrderFromSupabase(orderId) {
  try {
    const currentOrders = await getSpecialOrdersFromSupabase();
    const filtered = currentOrders.filter((ord) => ord.id !== orderId);

    await supabase
      .from('store_settings')
      .upsert(
        {
          key: SPECIAL_ORDERS_KEY,
          value: filtered,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'key' }
      );

    setLocalSpecialOrders(filtered);

    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('patitas_special_orders_updated', { detail: filtered })
      );
    }

    return { success: true };
  } catch (err) {
    console.error('Error deleting special order:', err);
    return { success: false, error: err };
  }
}

/**
 * Suscripción en tiempo real a cambios de encargos especiales
 */
export function subscribeToSpecialOrders(callback) {
  const channel = supabase
    .channel('public:store_settings_special_orders')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'store_settings',
        filter: `key=eq.${SPECIAL_ORDERS_KEY}`,
      },
      (payload) => {
        if (payload?.new?.value && Array.isArray(payload.new.value)) {
          setLocalSpecialOrders(payload.new.value);
          callback(payload.new.value);
        }
      }
    )
    .subscribe();

  const handleCustomEvent = (e) => {
    if (e.detail && Array.isArray(e.detail)) {
      callback(e.detail);
    }
  };

  if (typeof window !== 'undefined') {
    window.addEventListener('patitas_special_orders_updated', handleCustomEvent);
  }

  return () => {
    supabase.removeChannel(channel);
    if (typeof window !== 'undefined') {
      window.removeEventListener('patitas_special_orders_updated', handleCustomEvent);
    }
  };
}

// Helpers de respaldo local (localStorage)
function getLocalSpecialOrders() {
  try {
    if (typeof window === 'undefined') return DEFAULT_SPECIAL_ORDERS;
    const raw = localStorage.getItem('patitas_special_orders');
    if (!raw) {
      localStorage.setItem('patitas_special_orders', JSON.stringify(DEFAULT_SPECIAL_ORDERS));
      return DEFAULT_SPECIAL_ORDERS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_SPECIAL_ORDERS;
  } catch {
    return DEFAULT_SPECIAL_ORDERS;
  }
}

function setLocalSpecialOrders(orders) {
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem('patitas_special_orders', JSON.stringify(orders));
    }
  } catch {
    // ignore
  }
}
