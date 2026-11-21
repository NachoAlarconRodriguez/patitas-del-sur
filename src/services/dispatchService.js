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
  return matched || null;
}

// =========================================================================
// GESTOR DE HORARIOS Y RUTAS DE ENTREGA POR CIUDAD / COMUNA
// =========================================================================

export const DELIVERY_SCHEDULES_KEY = 'delivery_schedules';
export const DISPATCH_LIVE_STATUS_KEY = 'dispatch_live_status';

export const OFFICIAL_MORNING_SLOT_LABEL = 'Mañana (10:00 - 13:00 hrs)';
export const OFFICIAL_AFTERNOON_SLOT_LABEL = 'Tarde (15:30 - 19:30 hrs)';
export const URGENT_EXPRESS_SLOT_LABEL = '⚡ Pedido Urgente (Fuera de ventana horaria)';
export const SUNDAY_URGENT_SLOT_LABEL = '⚡ Pedido Urgente Domingo (10:00 - 20:00 hrs)';
export const URGENT_EXPRESS_FEE = 3500;

export const DEFAULT_DELIVERY_SCHEDULES = [
  {
    id: 'SCHED-FRUTILLAR',
    city: 'Frutillar',
    cityName: 'Frutillar',
    routeLabel: 'Ruta Local Frutillar',
    coverageDays: 'Lunes a Sábado',
    active: true,
    slots: [
      { id: 'FRUT-MANANA', label: 'Mañana (10:00 - 13:00 hrs)', days: 'Lunes a Sábado', cutoffNote: 'Corte 12:15 hrs', active: true },
      { id: 'FRUT-TARDE', label: 'Tarde (15:30 - 19:30 hrs)', days: 'Lunes a Sábado', cutoffNote: 'Corte 18:45 hrs', active: true },
    ],
  },
  {
    id: 'SCHED-LLANQUIHUE',
    city: 'Llanquihue',
    cityName: 'Llanquihue',
    routeLabel: 'Ruta Llanquihue Urbano',
    coverageDays: 'Lunes a Sábado',
    active: true,
    slots: [
      { id: 'LLANQ-MANANA', label: 'Mañana (10:00 - 13:00 hrs)', days: 'Lunes a Sábado', cutoffNote: 'Corte 12:15 hrs', active: true },
      { id: 'LLANQ-TARDE', label: 'Tarde (15:30 - 19:30 hrs)', days: 'Lunes a Sábado', cutoffNote: 'Corte 18:45 hrs', active: true },
    ],
  },
  {
    id: 'SCHED-PUERTO-VARAS',
    city: 'Puerto Varas',
    cityName: 'Puerto Varas',
    routeLabel: 'Ruta Puerto Varas & Nueva Braunau',
    coverageDays: 'Lunes a Sábado',
    active: true,
    slots: [
      { id: 'PV-MANANA', label: 'Mañana (10:00 - 13:00 hrs)', days: 'Lunes a Sábado', cutoffNote: 'Corte 12:15 hrs', active: true },
      { id: 'PV-TARDE', label: 'Tarde (15:30 - 19:30 hrs)', days: 'Lunes a Sábado', cutoffNote: 'Corte 18:45 hrs', active: true },
    ],
  },
  {
    id: 'SCHED-CASMA',
    city: 'Casma',
    cityName: 'Casma',
    routeLabel: 'Ruta Norte / Casma',
    coverageDays: 'Lunes a Sábado',
    active: true,
    slots: [
      { id: 'CASMA-MANANA', label: 'Mañana (10:00 - 13:00 hrs)', days: 'Lunes a Sábado', cutoffNote: 'Corte 12:15 hrs', active: true },
      { id: 'CASMA-TARDE', label: 'Tarde (15:30 - 19:30 hrs)', days: 'Lunes a Sábado', cutoffNote: 'Corte 18:45 hrs', active: true },
    ],
  },
  {
    id: 'SCHED-FRESIA',
    city: 'Fresia',
    cityName: 'Fresia',
    routeLabel: 'Ruta Poniente / Fresia',
    coverageDays: 'Miércoles y Viernes',
    active: true,
    slots: [
      { id: 'FRESIA-TARDE', label: 'Tarde (15:30 - 19:30 hrs)', days: 'Miércoles y Viernes', cutoffNote: 'Corte 18:45 hrs', active: true },
    ],
  },
  {
    id: 'SCHED-PTO-OCTAY',
    city: 'Puerto Octay',
    cityName: 'Puerto Octay',
    routeLabel: 'Ruta Cuenca Lago / Puerto Octay',
    coverageDays: 'Lunes, Miércoles y Viernes',
    active: true,
    slots: [
      { id: 'OCTAY-TARDE', label: 'Tarde (15:30 - 19:30 hrs)', days: 'Lunes, Miércoles y Viernes', cutoffNote: 'Corte 18:45 hrs', active: true },
    ],
  },
  {
    id: 'SCHED-TOTORAL',
    city: 'Totoral',
    cityName: 'Totoral',
    routeLabel: 'Ruta Costera Totoral',
    coverageDays: 'Martes y Sábados',
    active: true,
    slots: [
      { id: 'TOT-TARDE', label: 'Tarde (15:30 - 19:30 hrs)', days: 'Martes y Sábados', cutoffNote: 'Corte 18:45 hrs', active: true },
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
    { value: OFFICIAL_MORNING_SLOT_LABEL, label: OFFICIAL_MORNING_SLOT_LABEL, desc: 'Lunes a Sábado' },
    { value: OFFICIAL_AFTERNOON_SLOT_LABEL, label: OFFICIAL_AFTERNOON_SLOT_LABEL, desc: 'Lunes a Sábado' },
  ];
}

/**
 * Obtiene la fecha y hora actual en zona horaria de Chile (America/Santiago)
 */
export function getChileNowParts(referenceDate = new Date()) {
  try {
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'America/Santiago',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
    const parts = formatter.formatToParts(referenceDate);
    const map = {};
    parts.forEach((p) => {
      map[p.type] = p.value;
    });
    const year = parseInt(map.year, 10) || referenceDate.getFullYear();
    const month = parseInt(map.month, 10) || referenceDate.getMonth() + 1;
    const day = parseInt(map.day, 10) || referenceDate.getDate();
    let hour = parseInt(map.hour, 10);
    if (Number.isNaN(hour)) hour = referenceDate.getHours();
    if (hour === 24) hour = 0;
    const minute = parseInt(map.minute, 10) || 0;
    const isoDate = `${String(year).padStart(4, '0')}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return {
      year,
      month,
      day,
      hour,
      minute,
      totalMinutes: hour * 60 + minute,
      isoDate,
    };
  } catch {
    const hour = referenceDate.getHours();
    const minute = referenceDate.getMinutes();
    const yyyy = referenceDate.getFullYear();
    const mm = String(referenceDate.getMonth() + 1).padStart(2, '0');
    const dd = String(referenceDate.getDate()).padStart(2, '0');
    return {
      year: yyyy,
      month: referenceDate.getMonth() + 1,
      day: referenceDate.getDate(),
      hour,
      minute,
      totalMinutes: hour * 60 + minute,
      isoDate: `${yyyy}-${mm}-${dd}`,
    };
  }
}

/**
 * Consulta en tiempo real si el vehículo anda en reparto:
 * 1) Revisa si hay pedidos con status === 'en_camino' en Supabase.
 * 2) Revisa si el administrador activó el interruptor manual "En Reparto" en store_settings.
 */
export async function getLiveDispatchStatusFromSupabase() {
  let manualOnRoute = false;
  let activeEnCaminoCount = 0;

  try {
    const cached = localStorage.getItem('patitas_dispatch_live_status_v1');
    if (cached) {
      const parsed = JSON.parse(cached);
      if (parsed && typeof parsed.manualOnRoute === 'boolean') {
        manualOnRoute = parsed.manualOnRoute;
      }
    }
  } catch {
    // ignore localStorage read errors
  }

  try {
    const [settingsRes, ordersRes] = await Promise.all([
      supabase
        .from('store_settings')
        .select('value')
        .eq('key', DISPATCH_LIVE_STATUS_KEY)
        .maybeSingle(),
      supabase
        .from('orders')
        .select('id, status')
        .eq('status', 'en_camino'),
    ]);

    if (!settingsRes.error && settingsRes.data?.value && typeof settingsRes.data.value.manualOnRoute === 'boolean') {
      manualOnRoute = Boolean(settingsRes.data.value.manualOnRoute);
      try {
        localStorage.setItem(
          'patitas_dispatch_live_status_v1',
          JSON.stringify({ manualOnRoute, updatedAt: settingsRes.data.value.updatedAt || new Date().toISOString() })
        );
      } catch {
        // ignore
      }
    }

    if (!ordersRes.error && Array.isArray(ordersRes.data)) {
      activeEnCaminoCount = ordersRes.data.length;
    }
  } catch (err) {
    console.warn('Error fetching live dispatch status from Supabase:', err);
  }

  const isFleetOnRoute = Boolean(manualOnRoute || activeEnCaminoCount > 0);
  return {
    isFleetOnRoute,
    manualOnRoute,
    activeEnCaminoCount,
  };
}

/**
 * Permite al administrador activar o desactivar con 1 clic el estado "En Reparto"
 */
export async function saveManualDispatchStatusToSupabase(manualOnRoute) {
  const payload = {
    manualOnRoute: Boolean(manualOnRoute),
    updatedAt: new Date().toISOString(),
  };

  try {
    localStorage.setItem('patitas_dispatch_live_status_v1', JSON.stringify(payload));
  } catch {
    // ignore
  }

  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('patitas_dispatch_live_status_updated', { detail: payload })
    );
  }

  try {
    const { data, error } = await supabase
      .from('store_settings')
      .upsert(
        {
          key: DISPATCH_LIVE_STATUS_KEY,
          value: payload,
          updated_at: payload.updatedAt,
        },
        { onConflict: 'key' }
      )
      .select();

    if (error) throw error;
    return { success: true, data, payload };
  } catch (err) {
    console.error('Error saving manual dispatch status to Supabase:', err);
    return { success: false, error: err, payload };
  }
}

/**
 * Motor inteligente de evaluación de ventanas de despacho (10:00-13:00 y 15:30-19:30 + Pedido Urgente)
 */
export function evaluateSmartDeliverySchedule({
  isFleetOnRoute = false,
  selectedDateIso = '',
  referenceDate = new Date(),
} = {}) {
  const chileNow = getChileNowParts(referenceDate);
  const { totalMinutes, isoDate: todayIso } = chileNow;

  // Hitos horarios del día en minutos
  const MORNING_START = 10 * 60;         // 10:00 (600)
  const MORNING_CUTOFF = 12 * 60 + 15;   // 12:15 (735) - 45 min antes de las 13:00
  const MORNING_END = 13 * 60;           // 13:00 (780)
  const AFTERNOON_START = 15 * 60 + 30;  // 15:30 (930)
  const AFTERNOON_CUTOFF = 18 * 60 + 45; // 18:45 (1125) - 45 min antes de las 19:30
  const AFTERNOON_END = 19 * 60 + 30;    // 19:30 (1170)

  // Determinar si HOY aún tiene ventanas estándar abiertas
  // Si son >= 15:30 y se anda en reparto, o si ya pasó el corte de las 18:45, los pedidos estándar pasan a mañana a las 10:00 hrs
  const isTodayClosedForStandard =
    totalMinutes > AFTERNOON_CUTOFF ||
    (totalMinutes >= AFTERNOON_START && isFleetOnRoute);

  // Construir banner inteligente explicativo según la hora y si se anda en reparto
  let statusBanner = {
    type: 'available',
    badge: 'Despacho Hoy',
    title: 'Ventana de mañana disponible (10:00 a 13:00 hrs)',
    message: 'Si pides ahora, tu pedido entra en la primera ventana de reparto de hoy.',
  };

  if (totalMinutes < MORNING_START) {
    statusBanner = {
      type: 'available',
      badge: '1ª Ventana Hoy',
      title: 'Entrega hoy entre 10:00 y 13:00 hrs',
      message: 'Tu pedido se programará automáticamente para la ventana de esta mañana.',
    };
  } else if (totalMinutes >= MORNING_START && totalMinutes <= MORNING_CUTOFF) {
    if (!isFleetOnRoute) {
      statusBanner = {
        type: 'available',
        badge: 'Reparto Disponible',
        title: '¡Tu pedido llegará hoy antes de las 13:00 hrs!',
        message: 'No andamos en reparto en este momento, por lo que alcanzamos a preparar y entregarte hoy antes de las 13:00 hrs.',
      };
    } else {
      statusBanner = {
        type: 'on_route',
        badge: 'Reparto Matutino en Ruta',
        title: 'Programado para hoy en la ventana de 15:30 a 19:30 hrs',
        message: 'Nuestro vehículo ya salió al reparto de la mañana. Tu pedido queda agendado para la ventana de hoy a las 15:30 hrs.',
      };
    }
  } else if (totalMinutes > MORNING_CUTOFF && totalMinutes < AFTERNOON_START) {
    statusBanner = {
      type: 'available',
      badge: '2ª Ventana Hoy',
      title: 'Entrega hoy en la ventana de 15:30 a 19:30 hrs',
      message:
        totalMinutes < MORNING_END && isFleetOnRoute
          ? 'Nuestro reparto de la mañana está en ruta. Tu pedido queda para la ventana de hoy de 15:30 a 19:30 hrs.'
          : 'La ventana de la mañana ya cerró. Tu pedido se entregará hoy entre las 15:30 y 19:30 hrs.',
    };
  } else if (totalMinutes >= AFTERNOON_START && totalMinutes <= AFTERNOON_CUTOFF) {
    if (!isFleetOnRoute) {
      statusBanner = {
        type: 'available',
        badge: 'Reparto Disponible',
        title: '¡Tu pedido se entregará hoy antes de las 19:30 hrs!',
        message: 'Nuestro vehículo está disponible en bodega. Si confirmas ahora, te entregamos hoy mismo antes de las 19:30 hrs.',
      };
    } else {
      statusBanner = {
        type: 'next_day',
        badge: 'Reparto Vespertino en Ruta',
        title: 'Programado para mañana en la ventana de 10:00 a 13:00 hrs',
        message: 'Ya nos encontramos en el reparto de la tarde. Tu pedido queda agendado para la primera ventana de mañana (10:00 a 13:00 hrs).',
      };
    }
  } else {
    statusBanner = {
      type: 'next_day',
      badge: 'Próxima Ventana 10:00 hrs',
      title: 'Entrega en la primera ventana de mañana (10:00 a 13:00 hrs)',
      message:
        totalMinutes <= AFTERNOON_END && isFleetOnRoute
          ? 'Nuestro reparto de la tarde ya está en ruta. Tu pedido queda para mañana de 10:00 a 13:00 hrs.'
          : 'El horario de reparto estándar de hoy finalizó. Tu pedido llegará mañana entre las 10:00 y 13:00 hrs.',
    };
  }

  const isSelectedToday = Boolean(selectedDateIso && selectedDateIso === todayIso);
  const isSelectedSunday = (() => {
    if (!selectedDateIso) return false;
    const parts = String(selectedDateIso).split('-').map(Number);
    if (parts.length !== 3 || parts.some(Number.isNaN)) return false;
    return new Date(parts[0], parts[1] - 1, parts[2]).getDay() === 0;
  })();

  const slots = [];

  if (isSelectedSunday) {
    // Los domingos no existen ventanas horarias estándar: solo Pedido Urgente entre 10:00 y 20:00 hrs ($3.500)
    statusBanner = {
      type: 'sunday_urgent',
      badge: 'Domingo · 10:00 a 20:00 hrs',
      title: 'Domingo: entrega exclusiva con Pedido Urgente (10:00 a 20:00 hrs)',
      message:
        'Los domingos no hay reparto regular. Puedes solicitar entrega prioritaria entre las 10:00 y 20:00 hrs con tarifa fija de $3.500 (sin envío gratis).',
    };

    slots.push({
      value: SUNDAY_URGENT_SLOT_LABEL,
      label: SUNDAY_URGENT_SLOT_LABEL,
      desc: 'Horario domingo: 10:00 a 20:00 hrs · Tarifa fija $3.500 (sin envío gratis).',
      fee: URGENT_EXPRESS_FEE,
      noFreeShipping: true,
      isUrgent: true,
      isSundayOnly: true,
    });
  } else {
    if (isSelectedToday) {
      // Evaluar Ventana 1 (10:00 - 13:00) para HOY
      if (totalMinutes < MORNING_START) {
        slots.push({
          value: OFFICIAL_MORNING_SLOT_LABEL,
          label: 'Mañana (10:00 - 13:00 hrs)',
          desc: '1ª ventana del día · Envío gratis sobre $25.000',
          noFreeShipping: false,
          isUrgent: false,
        });
      } else if (totalMinutes >= MORNING_START && totalMinutes <= MORNING_CUTOFF && !isFleetOnRoute) {
        slots.push({
          value: 'Hoy antes de las 13:00 hrs (Ventana 10:00 - 13:00)',
          label: '🟢 Hoy antes de las 13:00 hrs (10:00 - 13:00)',
          desc: 'Sin reparto en ruta: llega hoy antes de las 13:00 hrs',
          noFreeShipping: false,
          isUrgent: false,
        });
      }

      // Evaluar Ventana 2 (15:30 - 19:30) para HOY
      if (totalMinutes < AFTERNOON_START) {
        slots.push({
          value: OFFICIAL_AFTERNOON_SLOT_LABEL,
          label: 'Tarde (15:30 - 19:30 hrs)',
          desc: '2ª ventana del día · Envío gratis sobre $25.000',
          noFreeShipping: false,
          isUrgent: false,
        });
      } else if (totalMinutes >= AFTERNOON_START && totalMinutes <= AFTERNOON_CUTOFF && !isFleetOnRoute) {
        slots.push({
          value: 'Hoy antes de las 19:30 hrs (Ventana 15:30 - 19:30)',
          label: '🟢 Hoy antes de las 19:30 hrs (15:30 - 19:30)',
          desc: 'Sin reparto en ruta: se entrega hoy antes de las 19:30 hrs',
          noFreeShipping: false,
          isUrgent: false,
        });
      }
    } else {
      // Para Mañana o días futuros (Lunes a Sábado): ambas ventanas estándar están abiertas
      slots.push(
        {
          value: OFFICIAL_MORNING_SLOT_LABEL,
          label: 'Mañana (10:00 - 13:00 hrs)',
          desc: '1ª ventana de reparto · Envío gratis sobre $25.000',
          noFreeShipping: false,
          isUrgent: false,
        },
        {
          value: OFFICIAL_AFTERNOON_SLOT_LABEL,
          label: 'Tarde (15:30 - 19:30 hrs)',
          desc: '2ª ventana de reparto · Envío gratis sobre $25.000',
          noFreeShipping: false,
          isUrgent: false,
        }
      );
    }

    // Opción 3: Pedido Urgente (Fuera de ventana horaria -> Tarifa fija $3.500, sin envío gratis)
    slots.push({
      value: URGENT_EXPRESS_SLOT_LABEL,
      label: URGENT_EXPRESS_SLOT_LABEL,
      desc: 'Fuera de ventana: tarifa fija $3.500 (sin envío gratis sobre $25.000)',
      fee: URGENT_EXPRESS_FEE,
      noFreeShipping: true,
      isUrgent: true,
    });
  }

  const recommendedSlotValue = slots[0]?.value || OFFICIAL_MORNING_SLOT_LABEL;

  return {
    chileNow,
    isTodayClosedForStandard,
    isSelectedSunday,
    statusBanner,
    slots,
    recommendedSlotValue,
  };
}

export const WEEKDAYS = [
  { id: 1, label: 'Lun', name: 'Lunes' },
  { id: 2, label: 'Mar', name: 'Martes' },
  { id: 3, label: 'Mié', name: 'Miércoles' },
  { id: 4, label: 'Jue', name: 'Jueves' },
  { id: 5, label: 'Vie', name: 'Viernes' },
  { id: 6, label: 'Sáb', name: 'Sábado' },
  { id: 0, label: 'Dom', name: 'Domingo' },
];

export function formatDeliveryDaysSummary(days = [1, 2, 3, 4, 5, 6]) {
  if (!days || !Array.isArray(days) || days.length === 0) return 'Sin días configurados';
  if (days.length === 7) return 'Todos los días (Lun a Dom)';
  const sorted = [...days].sort((a, b) => (a === 0 ? 7 : a) - (b === 0 ? 7 : b));
  const isLunVie = sorted.length === 5 && sorted.every((d, i) => d === i + 1);
  if (isLunVie) return 'Lunes a Viernes';
  const isLunSab = sorted.length === 6 && sorted.every((d, i) => d === i + 1);
  if (isLunSab) return 'Lunes a Sábado';
  const names = { 1: 'Lun', 2: 'Mar', 3: 'Mié', 4: 'Jue', 5: 'Vie', 6: 'Sáb', 0: 'Dom' };
  return sorted.map((d) => names[d] || d).join(', ');
}

/**
 * Retorna las próximas fechas disponibles de entrega según los días habilitados de la zona.
 * Siempre incluye Domingo (0) como opción de Pedido Urgente (10:00 a 20:00 hrs) aunque la zona sea Lun-Sáb.
 * Genera todas las fechas usando la fecha oficial de Chile (America/Santiago).
 */
export function getUpcomingDeliveryDates(allowedDays = [1, 2, 3, 4, 5, 6], maxDays = 6, options = {}) {
  const dates = [];
  const now = new Date();
  const chileNow = getChileNowParts(now);
  const { year: baseYear, month: baseMonth, day: baseDay, totalMinutes } = chileNow;
  const isFleetOnRoute = Boolean(options?.isFleetOnRoute);

  const normalizedAllowed = Array.isArray(allowedDays) && allowedDays.length > 0
    ? allowedDays
    : [1, 2, 3, 4, 5, 6];
  // Los domingos siempre están disponibles como despacho urgente ($3.500), aunque la zona sea Lun-Sáb
  const effectiveAllowedDays = normalizedAllowed.includes(0)
    ? normalizedAllowed
    : [...normalizedAllowed, 0];

  const todayChileDate = new Date(baseYear, baseMonth - 1, baseDay);
  const isTodaySunday = todayChileDate.getDay() === 0;

  // Hitos de cierre del día actual:
  // - Domingos: disponible para Pedido Urgente hasta las 20:00 hrs (10:00 a 20:00 hrs)
  // - Lunes a Sábado: cierra a las 18:45 hrs o desde las 15:30 si la flota ya anda en ruta
  const AFTERNOON_START = 15 * 60 + 30;  // 15:30
  const AFTERNOON_CUTOFF = 18 * 60 + 45; // 18:45
  const SUNDAY_END = 20 * 60;            // 20:00

  const isTodayClosed = isTodaySunday
    ? totalMinutes >= SUNDAY_END
    : totalMinutes > AFTERNOON_CUTOFF || (totalMinutes >= AFTERNOON_START && isFleetOnRoute);

  const startOffset = isTodayClosed ? 1 : 0;
  const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

  for (let i = startOffset; i < 21 && dates.length < maxDays; i++) {
    const d = new Date(baseYear, baseMonth - 1, baseDay + i);
    const dayOfWeek = d.getDay(); // 0 = Domingo, 1 = Lunes, etc.

    if (effectiveAllowedDays.includes(dayOfWeek)) {
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      const isoDate = `${yyyy}-${mm}-${dd}`;

      const cleanLabel = `${dayNames[dayOfWeek]} ${d.getDate()} de ${monthNames[d.getMonth()]}`;
      let relativePrefix = '';
      if (i === 0) relativePrefix = 'Hoy - ';
      else if (i === 1) relativePrefix = 'Mañana - ';

      const label = `${relativePrefix}${cleanLabel}`;

      dates.push({
        isoDate,
        dayOfWeek,
        label,
        cleanLabel,
        isToday: i === 0,
        isTomorrow: i === 1,
        isSunday: dayOfWeek === 0,
      });
    }
  }

  return dates;
}

/**
 * Formatea el resumen de día y ventana de despacho de una orden para Admin y Optimizador de Rutas,
 * calculando dinámicamente "Hoy" / "Mañana" respecto a la hora actual de Chile (America/Santiago).
 */
export function formatOrderScheduleSummary(order) {
  const rawDate = String(order?.deliveryDate || order?.delivery_date || '').trim();
  const rawDayText = String(order?.deliveryDayText || order?.delivery_day_text || '').trim();
  const rawSlot = String(order?.deliverySlot || order?.delivery_slot || '').trim();

  const shortDays = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  const fullDays = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  const shortMonths = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

  const chileNow = getChileNowParts();
  const todayIso = chileNow.isoDate;
  const tomorrowObj = new Date(chileNow.year, chileNow.month - 1, chileNow.day + 1);
  const tomorrowIso = `${tomorrowObj.getFullYear()}-${String(tomorrowObj.getMonth() + 1).padStart(2, '0')}-${String(tomorrowObj.getDate()).padStart(2, '0')}`;

  let dateShort = '';
  let dateFull = '';
  let relativeTag = '';
  let isSunday = false;

  const isoMatch = rawDate.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (isoMatch) {
    const [, yStr, mStr, dStr] = isoMatch;
    const isoNorm = `${yStr}-${mStr}-${dStr}`;
    const dt = new Date(Number(yStr), Number(mStr) - 1, Number(dStr));
    const dow = dt.getDay();
    isSunday = dow === 0;
    const dayNum = Number(dStr);
    const mon = shortMonths[Number(mStr) - 1] || '';

    if (isoNorm === todayIso) relativeTag = 'Hoy';
    else if (isoNorm === tomorrowIso) relativeTag = 'Mañana';

    dateShort = relativeTag ? `${relativeTag} · ${shortDays[dow]} ${dayNum} ${mon}` : `${shortDays[dow]} ${dayNum} ${mon}`;
    dateFull = relativeTag ? `${relativeTag} · ${fullDays[dow]} ${dayNum} de ${mon}` : `${fullDays[dow]} ${dayNum} de ${mon}`;
  } else if (rawDayText) {
    const cleaned = rawDayText.replace(/^(Hoy|Mañana)\s*[-–·:]\s*/i, '').trim() || rawDayText;
    isSunday = /domingo/i.test(cleaned);
    dateShort = cleaned;
    dateFull = cleaned;
  } else {
    dateShort = 'Por coordinar';
    dateFull = 'Fecha por coordinar';
  }

  const slotLower = rawSlot.toLowerCase();
  const isUrgent = slotLower.includes('urgente') || slotLower.includes('express') || isSunday;

  let shortSlot = rawSlot || 'Horario por coordinar';
  if (isUrgent && (isSunday || slotLower.includes('domingo') || slotLower.includes('20:00'))) {
    shortSlot = 'Urgente Dom · 10:00–20:00';
  } else if (isUrgent) {
    shortSlot = 'Pedido Urgente';
  } else if (/10:00|13:00|ma[ñn]ana/i.test(rawSlot)) {
    shortSlot = 'Mañana · 10:00–13:00';
  } else if (/15:30|19:30|14:00|19:00|tarde/i.test(rawSlot)) {
    shortSlot = 'Tarde · 15:30–19:30';
  }

  return {
    dateShort,
    dateFull,
    relativeTag,
    shortSlot,
    fullSlot: rawSlot || OFFICIAL_AFTERNOON_SLOT_LABEL,
    isUrgent,
    isSunday,
    hasExplicitDate: Boolean(isoMatch || rawDayText),
  };
}

// =========================================================================
// GESTOR DE VEHÍCULOS DE REPARTO ASIGNADOS POR SOCIO / USUARIO
// =========================================================================

export const DISPATCH_VEHICLES_KEY = 'dispatch_vehicles';

export const DEFAULT_DISPATCH_VEHICLES = [
  {
    id: 'VEH-AVEO-CHDD60',
    brand: 'Chevrolet Aveo',
    plate: 'CHDD60',
    efficiencyKmPerL: 10,
    fuelPricePerL: 1400,
    owner: 'Ignacio Alarcón',
  },
];

export async function getVehiclesFromSupabase() {
  try {
    const { data, error } = await supabase
      .from('store_settings')
      .select('value')
      .eq('key', DISPATCH_VEHICLES_KEY)
      .maybeSingle();

    if (!error && data && Array.isArray(data.value) && data.value.length > 0) {
      const normalized = data.value.map((v) => ({
        ...v,
        owner: v.owner || 'Ignacio Alarcón',
      }));
      try {
        localStorage.setItem('patitas_admin_vehicles_v1', JSON.stringify(normalized));
      } catch {
        // ignore storage error
      }
      return normalized;
    }
  } catch (err) {
    console.warn('Error fetching vehicles from Supabase:', err);
  }

  try {
    const cached = localStorage.getItem('patitas_admin_vehicles_v1');
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map((v) => ({
          ...v,
          owner: v.owner || 'Ignacio Alarcón',
        }));
      }
    }
  } catch {
    // ignore storage error
  }

  return DEFAULT_DISPATCH_VEHICLES;
}

export async function saveVehiclesToSupabase(vehicles) {
  const safeVehicles = (Array.isArray(vehicles) ? vehicles : []).map((v) => ({
    ...v,
    owner: v.owner || 'Ignacio Alarcón',
  }));

  try {
    localStorage.setItem('patitas_admin_vehicles_v1', JSON.stringify(safeVehicles));
  } catch {
    // ignore storage error
  }

  try {
    const { data, error } = await supabase
      .from('store_settings')
      .upsert(
        {
          key: DISPATCH_VEHICLES_KEY,
          value: safeVehicles,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'key' }
      )
      .select();

    if (error) throw error;
    return { success: true, data };
  } catch (err) {
    console.error('Error saving vehicles to Supabase:', err);
    return { success: false, error: err };
  }
}

