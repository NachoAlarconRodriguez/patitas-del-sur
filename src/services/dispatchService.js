import { supabase } from '../lib/supabase.js';

/**
 * Servicio de Zonas de Despacho y Cobertura con persistencia en Supabase (store_settings)
 */

export const DISPATCH_SETTINGS_KEY = 'dispatch_zones';

/**
 * Obtiene las zonas de despacho configuradas desde la base de datos de Supabase
 */
export async function getDispatchZonesFromSupabase() {
  try {
    const { data, error } = await supabase
      .from('store_settings')
      .select('value')
      .eq('key', DISPATCH_SETTINGS_KEY)
      .maybeSingle();

    if (error) {
      console.warn('Error fetching dispatch zones from Supabase:', error.message);
      return [];
    }

    if (data && Array.isArray(data.value)) {
      return data.value;
    }

    return [];
  } catch (err) {
    console.error('Error in getDispatchZonesFromSupabase:', err);
    return [];
  }
}

/**
 * Guarda las zonas de despacho en la base de datos de Supabase
 */
export async function saveDispatchZonesToSupabase(zones) {
  try {
    const safeZones = Array.isArray(zones) ? zones : [];
    const { data, error } = await supabase
      .from('store_settings')
      .upsert(
        {
          key: DISPATCH_SETTINGS_KEY,
          value: safeZones,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'key' }
      )
      .select();

    if (error) throw error;

    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('patitas_dispatch_zones_updated', { detail: safeZones })
      );
    }

    return { success: true, data };
  } catch (err) {
    console.error('Error saving dispatch zones to Supabase:', err);
    return { success: false, error: err };
  }
}

/**
 * Determina a qué zona de despacho pertenece una distancia (en kilómetros)
 */
export function matchDispatchZone(distanceKm, zones = []) {
  if (!zones || zones.length === 0) {
    return null;
  }
  const dist = parseFloat(distanceKm) || 0;
  const sorted = [...zones].sort((a, b) => (a.radiusMaxKm || 0) - (b.radiusMaxKm || 0));
  const matched = sorted.find((z) => dist <= (z.radiusMaxKm ?? 999));
  return matched || sorted[sorted.length - 1];
}

// =========================================================================
// GESTOR DE HORARIOS Y RUTAS DE ENTREGA POR CIUDAD / COMUNA
// =========================================================================

export const DELIVERY_SCHEDULES_KEY = 'delivery_schedules';

export const DEFAULT_DELIVERY_SCHEDULES = [
  {
    id: 'SCHED-FRUTILLAR',
    city: 'Frutillar',
    routeLabel: 'Ruta Local Frutillar',
    active: true,
    slots: [
      { id: 'FRUT-MANANA', label: 'Mañana (10:00 - 13:30 hrs)', days: 'Lunes a Sábado', active: true },
      { id: 'FRUT-TARDE', label: 'Tarde (14:30 - 19:30 hrs)', days: 'Lunes a Sábado', active: true },
    ],
  },
  {
    id: 'SCHED-LLANQUIHUE',
    city: 'Llanquihue',
    routeLabel: 'Ruta Llanquihue Urbano',
    active: true,
    slots: [
      { id: 'LLANQ-MANANA', label: 'Mañana (11:00 - 14:00 hrs)', days: 'Lunes a Sábado', active: true },
      { id: 'LLANQ-TARDE', label: 'Tarde (15:00 - 19:00 hrs)', days: 'Lunes a Sábado', active: true },
    ],
  },
  {
    id: 'SCHED-PUERTO-VARAS',
    city: 'Puerto Varas',
    routeLabel: 'Ruta Puerto Varas & Nueva Braunau',
    active: true,
    slots: [
      { id: 'PV-MANANA', label: 'Mañana (10:30 - 14:00 hrs)', days: 'Lunes a Sábado', active: true },
      { id: 'PV-TARDE', label: 'Tarde (15:00 - 19:30 hrs)', days: 'Lunes a Sábado', active: true },
    ],
  },
  {
    id: 'SCHED-CASMA',
    city: 'Casma',
    routeLabel: 'Ruta Norte / Casma',
    active: true,
    slots: [
      { id: 'CASMA-TARDE', label: 'Tarde (15:00 - 19:00 hrs)', days: 'Martes y Jueves', active: true },
    ],
  },
  {
    id: 'SCHED-FRESIA',
    city: 'Fresia',
    routeLabel: 'Ruta Poniente / Fresia',
    active: true,
    slots: [
      { id: 'FRESIA-TARDE', label: 'Tarde (15:00 - 19:00 hrs)', days: 'Miércoles y Viernes', active: true },
    ],
  },
  {
    id: 'SCHED-PTO-OCTAY',
    city: 'Puerto Octay',
    routeLabel: 'Ruta Cuenca Lago / Puerto Octay',
    active: true,
    slots: [
      { id: 'OCTAY-TARDE', label: 'Tarde (14:00 - 18:30 hrs)', days: 'Lunes, Miércoles y Viernes', active: true },
    ],
  },
  {
    id: 'SCHED-TOTORAL',
    city: 'Totoral',
    routeLabel: 'Ruta Costera Totoral',
    active: true,
    slots: [
      { id: 'TOT-TARDE', label: 'Tarde (14:30 - 18:30 hrs)', days: 'Martes y Sábados', active: true },
    ],
  },
];

/**
 * Obtiene los horarios y rutas de entrega desde Supabase (store_settings)
 */
export async function getDeliverySchedulesFromSupabase() {
  try {
    const { data, error } = await supabase
      .from('store_settings')
      .select('value')
      .eq('key', DELIVERY_SCHEDULES_KEY)
      .maybeSingle();

    if (error) {
      console.warn('Error fetching delivery schedules from Supabase:', error.message);
      return DEFAULT_DELIVERY_SCHEDULES;
    }

    if (data && Array.isArray(data.value) && data.value.length > 0) {
      return data.value;
    }

    return DEFAULT_DELIVERY_SCHEDULES;
  } catch (err) {
    console.error('Error in getDeliverySchedulesFromSupabase:', err);
    return DEFAULT_DELIVERY_SCHEDULES;
  }
}

/**
 * Guarda los horarios y rutas de entrega en Supabase (store_settings)
 */
export async function saveDeliverySchedulesToSupabase(schedules) {
  try {
    const safeSchedules = Array.isArray(schedules) ? schedules : DEFAULT_DELIVERY_SCHEDULES;
    const { data, error } = await supabase
      .from('store_settings')
      .upsert(
        {
          key: DELIVERY_SCHEDULES_KEY,
          value: safeSchedules,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'key' }
      )
      .select();

    if (error) throw error;

    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('patitas_delivery_schedules_updated', { detail: safeSchedules })
      );
    }

    return { success: true, data };
  } catch (err) {
    console.error('Error saving delivery schedules to Supabase:', err);
    return { success: false, error: err };
  }
}

/**
 * Retorna las opciones de horario activas para una comuna o ciudad específica
 */
export function getSlotsForCity(city, schedules = DEFAULT_DELIVERY_SCHEDULES) {
  if (!city) return [];
  const normalizedCity = city.trim().toLowerCase();
  const schedule = (schedules || []).find(
    (s) => s.city && s.city.trim().toLowerCase() === normalizedCity
  );

  if (schedule && Array.isArray(schedule.slots) && schedule.slots.length > 0) {
    return schedule.slots
      .filter((slot) => slot.active !== false)
      .map((slot) => ({
        value: slot.label,
        label: slot.label,
        desc: slot.days ? `Días: ${slot.days}` : undefined,
      }));
  }

  // Fallback si la comuna no tiene horarios configurados personalizados
  return [
    { value: 'Mañana (10:00 - 13:30 hrs)', label: 'Mañana (10:00 - 13:30 hrs)', desc: 'Lunes a Sábado' },
    { value: 'Tarde (14:30 - 19:30 hrs)', label: 'Tarde (14:30 - 19:30 hrs)', desc: 'Lunes a Sábado' },
  ];
}
