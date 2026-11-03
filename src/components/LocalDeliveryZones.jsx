import React, { useState, useEffect, useMemo } from 'react';
import {
  Clock,
  Truck,
  Sparkles,
  Zap,
  Calendar,
  Sun,
  Moon,
} from 'lucide-react';
import DeliveryCoverageMap from './DeliveryCoverageMap';
import {
  getDispatchZonesFromSupabase,
  getDeliverySchedulesFromSupabase,
  DEFAULT_DELIVERY_SCHEDULES,
} from '../services/dispatchService';
import { supabase } from '../lib/supabase';
import { TOWN_COORDINATES, CENTRAL_HUB } from '../services/googleMapsService';

// Formateador de moneda chilena
const formatCLP = (amount) => {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    maximumFractionDigits: 0,
  }).format(amount || 0);
};

// Base de sectores y parcelaciones destacadas por comuna para el mapa
export const KNOWN_CITY_SPOTS = {
  frutillar: [
    {
      id: 'fr-punta-larga',
      name: 'Camino a Punta Larga (Parcelaciones)',
      type: 'parcelas',
      desc: 'Cobertura completa a condominios de alta plusvalía frente al lago.',
      lat: -41.17,
      lng: -73.01,
    },
    {
      id: 'fr-reserva',
      name: 'Condominio Reserva Frutillar & Los Colonos',
      type: 'parcelas',
      desc: 'Entregas regulares directas a portería y casas particulares.',
      lat: -41.115,
      lng: -73.075,
    },
    {
      id: 'fr-urbano',
      name: 'Frutillar Bajo y Frutillar Alto',
      type: 'urbano',
      desc: 'Reparto urbano en costanera, teatro y zona alta comercial.',
      lat: -41.1278,
      lng: -73.0456,
    },
    {
      id: 'fr-quilanto',
      name: 'Camino a Quilanto',
      type: 'parcelas',
      desc: 'Ruta rural hacia parcelas del interior frutillarino.',
      lat: -41.095,
      lng: -73.01,
    },
    {
      id: 'fr-los-bajos',
      name: 'Los Bajos',
      type: 'parcelas',
      desc: 'Ruta costera tradicional con reparto a parcelaciones lacustres.',
      lat: -41.19,
      lng: -73.06,
    },
  ],
  llanquihue: [
    {
      id: 'lq-centro',
      name: 'Centro y Costanera Lago',
      type: 'urbano',
      desc: 'Despacho prioritario en minutos en todo el radio urbano.',
      lat: -41.255,
      lng: -73.0075,
    },
    {
      id: 'lq-pellines',
      name: 'Los Pellines (Parcelas)',
      type: 'parcelas',
      desc: 'Entregas a loteos campestres y parcelas camino a Fresia.',
      lat: -41.233,
      lng: -73.045,
    },
    {
      id: 'lq-totoral',
      name: 'Totoral y Bahía',
      type: 'parcelas',
      desc: 'Ruta lacustre costera hacia parcelaciones en bahía Totoral.',
      lat: -41.275,
      lng: -72.93,
    },
    {
      id: 'lq-loncotoro',
      name: 'Cruce Loncotoro',
      type: 'parcelas',
      desc: 'Conexión a parcelas agrícolas y residenciales del sector.',
      lat: -41.27,
      lng: -73.08,
    },
  ],
  'puerto varas': [
    {
      id: 'pv-ensenada',
      name: 'Camino a Ensenada (Km 1 al 15)',
      type: 'parcelas',
      desc: 'Cobertura a condominios, loteos y parcelas a orilla y falda de ruta 225.',
      lat: -41.305,
      lng: -72.88,
    },
    {
      id: 'pv-linea-nueva',
      name: 'Línea Nueva / Condominios',
      type: 'parcelas',
      desc: 'Entregas regulares a parcelaciones residenciales fuera del radio urbano.',
      lat: -41.34,
      lng: -73.03,
    },
    {
      id: 'pv-centro-chico',
      name: 'Centro y Puerto Chico',
      type: 'urbano',
      desc: 'Despacho express ultra rápido en el radio urbano y costanera.',
      lat: -41.3195,
      lng: -72.9854,
    },
    {
      id: 'pv-los-riscos',
      name: 'Los Riscos / Río Pescado',
      type: 'parcelas',
      desc: 'Rondas lacustres programadas a parcelas en la ribera del lago.',
      lat: -41.265,
      lng: -72.8,
    },
    {
      id: 'pv-3-puentes',
      name: 'Colonia 3 Puentes / Alerce Norte',
      type: 'parcelas',
      desc: 'Llegamos a parcelaciones entre Puerto Varas y la conexión norte.',
      lat: -41.365,
      lng: -72.94,
    },
  ],
  'puerto montt': [
    {
      id: 'pm-alerce',
      name: 'Alerce Histórico y Alerce Norte',
      type: 'parcelas',
      desc: 'Despacho directo a condominios y loteos residenciales del eje norte.',
      lat: -41.396,
      lng: -72.91,
    },
    {
      id: 'pm-volcanes',
      name: 'Valle Volcanes y Parcelaciones',
      type: 'parcelas',
      desc: 'Llegamos a sectores altos y parcelas camino a los volcanes.',
      lat: -41.445,
      lng: -72.905,
    },
    {
      id: 'pm-centro',
      name: 'Centro, Mirasol y Costanera',
      type: 'urbano',
      desc: 'Cobertura para todo el radio urbano de la capital regional.',
      lat: -41.469,
      lng: -72.942,
    },
    {
      id: 'pm-cardonal',
      name: 'Cardonal y Lagunitas',
      type: 'parcelas',
      desc: 'Sector parcelaciones y ruta camino al aeropuerto El Tepual.',
      lat: -41.455,
      lng: -73.01,
    },
    {
      id: 'pm-chamiza',
      name: 'Carretera Austral (Chamiza Parcelas)',
      type: 'parcelas',
      desc: 'Entregas a loteos y parcelaciones al inicio de la ruta 7.',
      lat: -41.49,
      lng: -72.845,
    },
  ],
  casma: [
    {
      id: 'casma-centro',
      name: 'Casma Centro y Ruta 5',
      type: 'urbano',
      desc: 'Entregas en el radio urbano y accesos de Casma.',
      lat: -41.05,
      lng: -73.183,
    },
    {
      id: 'casma-parcelas',
      name: 'Parcelaciones Rurales Casma',
      type: 'parcelas',
      desc: 'Cobertura a parcelas agrícolas y loteos del sector.',
      lat: -41.06,
      lng: -73.17,
    },
  ],
  fresia: [
    {
      id: 'fresia-centro',
      name: 'Fresia Centro y Plaza',
      type: 'urbano',
      desc: 'Entregas programadas en el radio urbano comunal.',
      lat: -41.15,
      lng: -73.416,
    },
  ],
  'puerto octay': [
    {
      id: 'octay-centro',
      name: 'Puerto Octay Centro y Bahía',
      type: 'urbano',
      desc: 'Despacho lacustre en el sector urbano y costanera.',
      lat: -40.974,
      lng: -72.885,
    },
  ],
};

// Fallback por defecto si aún no ha sincronizado Supabase
const FALLBACK_ZONES = [
  {
    id: 'ZONE-DEFAULT-FRUTILLAR',
    name: 'Frutillar',
    badgeText: 'Hasta 7 km',
    radiusMaxKm: 7,
    baseFee: 2000,
    freeThreshold: 25000,
    deliveryTime: 'Mismo día / 24 hrs',
    color: '#10B981',
    active: true,
  },
];

// Días de la semana para orden visual consistente
const WEEKDAY_ORDER = [
  { id: 1, day: 'L', name: 'Lun', fullName: 'Lunes' },
  { id: 2, day: 'M', name: 'Mar', fullName: 'Martes' },
  { id: 3, day: 'M', name: 'Mié', fullName: 'Miércoles' },
  { id: 4, day: 'J', name: 'Jue', fullName: 'Jueves' },
  { id: 5, day: 'V', name: 'Vie', fullName: 'Viernes' },
  { id: 6, day: 'S', name: 'Sáb', fullName: 'Sábado' },
  { id: 0, day: 'D', name: 'Dom', fullName: 'Domingo' },
];

// Helper para formatear nombres de días especiales
function formatSpecialDaysText(specialDays = []) {
  if (!Array.isArray(specialDays) || specialDays.length === 0) return '';
  const names = { 1: 'Lunes', 2: 'Martes', 3: 'Miércoles', 4: 'Jueves', 5: 'Viernes', 6: 'Sábados', 0: 'Domingos' };
  const mapped = specialDays.map((d) => names[d] || d);
  if (mapped.length === 1) return mapped[0];
  if (mapped.length === 2) return `${mapped[0]} y ${mapped[1]}`;
  return mapped.join(', ');
}

// Helper para calcular el rango de horas total a partir de las franjas horarias
function getSlotsTimeSpan(slots) {
  if (!Array.isArray(slots) || slots.length === 0) return null;
  const times = [];
  slots.forEach((s) => {
    if (!s.label) return;
    const matches = s.label.match(/\d{2}:\d{2}/g);
    if (matches && matches.length >= 2) {
      times.push(matches[0], matches[matches.length - 1]);
    }
  });
  if (times.length === 0) return null;
  times.sort();
  return `${times[0]} - ${times[times.length - 1]} hrs`;
}

// Helper para parsear la configuración de horarios de una ciudad
function parseScheduleInfo(city, schedules) {
  if (!city) {
    return {
      hours: '10:00 - 19:30 hrs',
      daysSummary: 'Lunes a Sábado',
      tabBadge: '⚡ Hoy en 2-4 hrs',
      operatingDays: [
        { day: 'L', name: 'Lun', active: true },
        { day: 'M', name: 'Mar', active: true },
        { day: 'M', name: 'Mié', active: true },
        { day: 'J', name: 'Jue', active: true },
        { day: 'V', name: 'Vie', active: true },
        { day: 'S', name: 'Sáb', active: true },
        { day: 'D', name: 'Dom', active: false },
      ],
    };
  }

  const normalized = city.trim().toLowerCase();
  const found = (schedules || []).find(
    (s) => s.city && s.city.trim().toLowerCase() === normalized
  );

  if (!found || !Array.isArray(found.slots) || found.slots.length === 0) {
    return {
      hours: '10:00 - 19:30 hrs',
      daysSummary: 'Lunes a Sábado',
      tabBadge: '⚡ Hoy / 24 hrs',
      operatingDays: [
        { day: 'L', name: 'Lun', active: true },
        { day: 'M', name: 'Mar', active: true },
        { day: 'M', name: 'Mié', active: true },
        { day: 'J', name: 'Jue', active: true },
        { day: 'V', name: 'Vie', active: true },
        { day: 'S', name: 'Sáb', active: true },
        { day: 'D', name: 'Dom', active: false },
      ],
    };
  }

  const activeSlots = found.slots.filter((s) => s.active !== false);
  const daysStrings = activeSlots.map((s) => s.days || '').join(' ');
  const lowerDays = daysStrings.toLowerCase();

  const isTodos = lowerDays.includes('todos los días') || lowerDays.includes('todos');
  const isLunASab = lowerDays.includes('lunes a sábado') || lowerDays.includes('lunes a sabado');
  const isLunAVie = lowerDays.includes('lunes a viernes');

  const hasLun = isTodos || isLunASab || isLunAVie || lowerDays.includes('lunes') || lowerDays.includes('lun');
  const hasMar = isTodos || isLunASab || isLunAVie || lowerDays.includes('martes') || lowerDays.includes('mar');
  const hasMie = isTodos || isLunASab || isLunAVie || lowerDays.includes('miércoles') || lowerDays.includes('miercoles') || lowerDays.includes('mié');
  const hasJue = isTodos || isLunASab || isLunAVie || lowerDays.includes('jueves') || lowerDays.includes('jue');
  const hasVie = isTodos || isLunASab || isLunAVie || lowerDays.includes('viernes') || lowerDays.includes('vie');
  const hasSab = isTodos || isLunASab || lowerDays.includes('sábado') || lowerDays.includes('sabado') || lowerDays.includes('sáb');
  const hasDom = isTodos || lowerDays.includes('domingo') || lowerDays.includes('dom');

  let tabBadge = '⚡ Hoy / 24 hrs';
  if (isLunASab) {
    tabBadge = '⚡ Lun a Sáb';
  } else if (isLunAVie) {
    tabBadge = '🗓️ Lun a Vie';
  } else if (hasMar && hasJue && hasSab && !hasLun && !hasMie && !hasVie) {
    tabBadge = '🗓️ Mar, Jue y Sáb';
  } else if (hasMar && hasJue && !hasSab && !hasLun && !hasMie && !hasVie) {
    tabBadge = '🗓️ Mar y Jue';
  } else if (hasMie && hasVie && !hasLun && !hasMar && !hasJue) {
    tabBadge = '🗓️ Mié y Vie';
  } else if (hasLun && hasMie && hasVie && !hasMar && !hasJue) {
    tabBadge = '🗓️ Lun, Mié y Vie';
  }

  let hours = '10:00 - 19:30 hrs';
  if (activeSlots.length === 1 && activeSlots[0].label) {
    const match = activeSlots[0].label.match(/\((\d{2}:\d{2}\s*-\s*\d{2}:\d{2}\s*hrs)\)/i);
    if (match) hours = match[1];
  } else if (activeSlots.length >= 2) {
    hours = '10:00 - 19:30 hrs';
  }

  return {
    hours,
    daysSummary: activeSlots[0]?.days || 'Lunes a Sábado',
    tabBadge,
    operatingDays: [
      { day: 'L', name: 'Lun', active: hasLun },
      { day: 'M', name: 'Mar', active: hasMar },
      { day: 'M', name: 'Mié', active: hasMie },
      { day: 'J', name: 'Jue', active: hasJue },
      { day: 'V', name: 'Vie', active: hasVie },
      { day: 'S', name: 'Sáb', active: hasSab },
      { day: 'D', name: 'Dom', active: hasDom },
    ],
  };
}

export default function LocalDeliveryZones({ className = '' }) {
  const [adminZones, setAdminZones] = useState([]);
  const [schedules, setSchedules] = useState(DEFAULT_DELIVERY_SCHEDULES);
  const [selectedId, setSelectedId] = useState(null);

  // 1. Cargar zonas y horarios desde Supabase en el montaje
  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      try {
        const [loadedZones, loadedSchedules] = await Promise.all([
          getDispatchZonesFromSupabase(),
          getDeliverySchedulesFromSupabase(),
        ]);
        if (!isMounted) return;

        if (Array.isArray(loadedZones) && loadedZones.length > 0) {
          setAdminZones(loadedZones);
        }
        if (Array.isArray(loadedSchedules) && loadedSchedules.length > 0) {
          setSchedules(loadedSchedules);
        }
      } catch (err) {
        console.warn('Error cargando configuración de despachos desde Supabase:', err);
      }
    }

    loadData();

    // 2. Escuchar eventos de sincronización en tiempo real emitidos desde el Panel de Administración
    const handleZonesUpdated = (e) => {
      if (Array.isArray(e.detail) && e.detail.length > 0) {
        setAdminZones(e.detail);
      }
    };

    const handleSchedulesUpdated = (e) => {
      if (Array.isArray(e.detail) && e.detail.length > 0) {
        setSchedules(e.detail);
      }
    };

    window.addEventListener('patitas_dispatch_zones_updated', handleZonesUpdated);
    window.addEventListener('patitas_delivery_schedules_updated', handleSchedulesUpdated);

    // 3. Suscripción en tiempo real con Supabase Realtime para reflejar cambios automáticos
    const channel = supabase
      .channel('public:store_settings_public_dispatch')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'store_settings' },
        (payload) => {
          if (payload.new?.key === 'dispatch_zones' && Array.isArray(payload.new.value)) {
            setAdminZones(payload.new.value);
          }
          if (payload.new?.key === 'delivery_schedules' && Array.isArray(payload.new.value)) {
            setSchedules(payload.new.value);
          }
        }
      )
      .subscribe();

    return () => {
      isMounted = false;
      window.removeEventListener('patitas_dispatch_zones_updated', handleZonesUpdated);
      window.removeEventListener('patitas_delivery_schedules_updated', handleSchedulesUpdated);
      supabase.removeChannel(channel);
    };
  }, []);

  // 4. Mapear las zonas configuradas en el Panel de Administración al formato de la UI pública
  const effectiveZones = useMemo(() => {
    const activeAdminZones = (adminZones || []).filter((z) => z.active !== false);
    const source = activeAdminZones.length > 0 ? activeAdminZones : FALLBACK_ZONES;

    return source.map((az, index) => {
      const normCity = (az.name || '').trim().toLowerCase();
      const scheduleInfo = parseScheduleInfo(az.name, schedules);
      const spots = KNOWN_CITY_SPOTS[normCity] || [];
      const radiusKm = parseFloat(az.radiusMaxKm) || 7;
      const baseFee = typeof az.baseFee === 'number' ? az.baseFee : parseInt(az.baseFee, 10) || 0;
      const freeThreshold =
        typeof az.freeThreshold === 'number' ? az.freeThreshold : parseInt(az.freeThreshold, 10) || 0;

      // Configuración de Días y Horarios del Admin
      const deliveryDays = Array.isArray(az.deliveryDays) && az.deliveryDays.length > 0
        ? az.deliveryDays
        : scheduleInfo.operatingDays.filter((d) => d.active).map((d) => {
            const mapDay = { Lun: 1, Mar: 2, Mié: 3, Jue: 4, Vie: 5, Sáb: 6, Dom: 0 };
            return mapDay[d.name] ?? 1;
          });

      const hasSpecialDayPricing = Boolean(az.hasSpecialDayPricing);
      const specialDays = Array.isArray(az.specialDays) ? az.specialDays : [];
      const specialDayFee =
        typeof az.specialDayFee === 'number' ? az.specialDayFee : parseInt(az.specialDayFee, 10) || 0;
      const specialDayNoFreeShipping = Boolean(az.specialDayNoFreeShipping);
      const specialDaysText = formatSpecialDaysText(specialDays);

      const slots = Array.isArray(az.slots) && az.slots.length > 0
        ? az.slots.filter((s) => s.active !== false)
        : [
            { id: 'manana', label: 'Mañana (10:00 - 13:30 hrs)', fee: null, noFreeShipping: false },
            { id: 'tarde', label: 'Tarde (14:30 - 19:30 hrs)', fee: null, noFreeShipping: false },
          ];

      const slotsHours = getSlotsTimeSpan(slots) || scheduleInfo.hours || '10:00 - 19:30 hrs';
      const slotsNoFreeShippingList = slots.filter((s) => Boolean(s.noFreeShipping));
      const hasSlotsNoFreeShipping = slotsNoFreeShippingList.length > 0;

      const operatingDays = WEEKDAY_ORDER.map((item) => {
        const isActive = deliveryDays.includes(item.id);
        const isSpecial = hasSpecialDayPricing && specialDays.includes(item.id);
        return {
          id: item.id,
          day: item.day,
          name: item.name,
          fullName: item.fullName,
          active: isActive,
          isSpecial,
        };
      });

      // Coordenadas geográficas centradas en la comuna o en el Hub Central Frutillar
      let coords = TOWN_COORDINATES[az.name];
      if (!coords) {
        if (normCity.includes('frutillar')) {
          coords = { lat: CENTRAL_HUB.lat, lng: CENTRAL_HUB.lng };
        } else {
          coords = { lat: -41.1278, lng: -73.0456 };
        }
      }

      const isExpress =
        (az.deliveryTime || '').toLowerCase().includes('mismo día') ||
        (az.deliveryTime || '').toLowerCase().includes('hoy') ||
        (az.deliveryTime || '').toLowerCase().includes('2 a 4');

      let tabPreview = az.tabPreview || az.badgeText;
      if (!tabPreview) {
        if (deliveryDays.length === 7) tabPreview = '⚡ Lun a Dom';
        else if (deliveryDays.length === 6 && !deliveryDays.includes(0)) tabPreview = '⚡ Lun a Sáb';
        else tabPreview = scheduleInfo.tabBadge;
      }

      return {
        id: az.id || `zone-${index}`,
        name: az.name || 'Zona de Despacho',
        color: az.color || '#10B981',
        tabPreview,
        badge: az.badgeText || `Hasta ${radiusKm} km`,
        timePrimary: az.deliveryTime || 'Mismo día / 24 hrs',
        standardCost: baseFee === 0 ? 'GRATIS' : `${formatCLP(baseFee)} CLP`,
        baseFee,
        freeThreshold:
          freeThreshold > 0 ? `Gratis sobre ${formatCLP(freeThreshold)} CLP` : 'Sin monto mínimo',
        freeThresholdAmount: freeThreshold,
        freeNotice:
          freeThreshold > 0
            ? `¡Casi todos los sacos de alimento ya califican sin costo!`
            : '¡Tarifa única sin costo adicional de envío!',
        schedule: slotsHours,
        slotsHours,
        deliveryDays,
        hasSpecialDayPricing,
        specialDays,
        specialDayFee,
        specialDayNoFreeShipping,
        specialDaysText,
        slots,
        hasSlotsNoFreeShipping,
        slotsNoFreeShippingList,
        isExpress,
        coordinates: coords,
        mapZoom: radiusKm > 20 ? 10 : radiusKm > 10 ? 11 : 12,
        coverageRadiusMeters: radiusKm * 1000,
        radiusMaxKm: radiusKm,
        operatingDays,
        ruralSpots: spots,
      };
    });
  }, [adminZones, schedules]);

  // Mantener la zona seleccionada
  useEffect(() => {
    if (effectiveZones.length > 0) {
      if (!selectedId || !effectiveZones.some((z) => z.id === selectedId)) {
        setSelectedId(effectiveZones[0].id);
      }
    }
  }, [effectiveZones, selectedId]);

  const activeZone = effectiveZones.find((z) => z.id === selectedId) || effectiveZones[0] || null;

  if (!activeZone) return null;

  // Clasificación estructurada para presentación unificada de horarios (Opción 1)
  const regularDaysList = (activeZone.operatingDays || []).filter((d) => d.active && !d.isSpecial);
  const specialDaysList = (activeZone.operatingDays || []).filter((d) => d.active && d.isSpecial);

  let regularDaysLabel = 'Lunes a Sábado';
  if (regularDaysList.length === 7) {
    regularDaysLabel = 'Lunes a Domingo';
  } else if (regularDaysList.length === 6 && !regularDaysList.some((d) => d.id === 0)) {
    regularDaysLabel = 'Lunes a Sábado';
  } else if (regularDaysList.length === 5 && !regularDaysList.some((d) => d.id === 0 || d.id === 6)) {
    regularDaysLabel = 'Lunes a Viernes';
  } else if (regularDaysList.length > 0) {
    regularDaysLabel = regularDaysList.map((d) => d.name).join(', ');
  }

  const standardSlots = (activeZone.slots || []).filter(
    (s) => !s.noFreeShipping && (!s.fee || Number(s.fee) === 0)
  );
  const specialSlots = (activeZone.slots || []).filter(
    (s) => Boolean(s.noFreeShipping) || (s.fee && Number(s.fee) > 0)
  );

  return (
    <section
      aria-label="Calculador y cobertura de despacho local y parcelas"
      className={`bg-white rounded-3xl p-5 sm:p-7 md:p-9 border border-slate-200/90 shadow-sm ${className}`}
    >
      {/* Encabezado Principal de la Sección */}
      <div className="max-w-3xl mx-auto text-center space-y-2.5 mb-7 sm:mb-9">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-900 border border-amber-500/25 text-xs font-bold uppercase tracking-wider">
          <Truck className="w-3.5 h-3.5 text-amber-700" />
          <span>Logística Propia para el Sur</span>
        </div>
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#1D1D1F] tracking-tight leading-tight">
          Despacho a Domicilio en el Sur de Chile
        </h2>
        <p className="text-xs sm:text-sm md:text-base text-slate-600 font-medium max-w-2xl mx-auto leading-relaxed">
          Repartimos directo a tu puerta o portón en <strong>parcelaciones, condominios rurales y zonas urbanas</strong> con furgón climatizado.
        </p>
      </div>

      {/* Selector de Comuna / Zona dinámico desde el Panel de Administración */}
      <div className="flex justify-center mb-7 sm:mb-8">
        <div
          role="tablist"
          aria-label="Selecciona tu comuna de despacho"
          className="inline-flex p-1.5 rounded-2xl bg-slate-100/90 border border-slate-200/90 shadow-inner max-w-full overflow-x-auto gap-1.5 scrollbar-none"
        >
          {effectiveZones.map((zone) => {
            const isSelected = zone.id === selectedId;
            return (
              <button
                key={zone.id}
                role="tab"
                aria-selected={isSelected}
                type="button"
                onClick={() => setSelectedId(zone.id)}
                className={`relative px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold tracking-tight transition-all duration-200 ease-out cursor-pointer select-none active:scale-95 whitespace-nowrap flex flex-col items-center gap-0.5 ${
                  isSelected
                    ? 'bg-white text-[#1D1D1F] shadow-md shadow-black/8 ring-1 ring-slate-200/80'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: zone.color || '#10B981' }}
                  />
                  <span>{zone.name}</span>
                  {zone.isExpress && (
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500" title="Entrega Express Mismo Día" />
                  )}
                </div>
                <span
                  className={`text-[10px] font-semibold ${
                    isSelected ? 'text-amber-800' : 'text-slate-600'
                  }`}
                >
                  {zone.tabPreview}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Split Screen Bento: Ficha Rápida (Izquierda) + Google Maps Interactivo (Derecha) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* COLUMNA IZQUIERDA: Ficha Rápida de Despacho (Sincronizada con Admin) */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
          <div className="p-5 sm:p-6 rounded-2xl sm:rounded-3xl bg-slate-50/70 border border-slate-200/90 space-y-4 shadow-2xs">
            {/* Header de la Comuna y Radio Máximo */}
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-2xl sm:text-3xl font-black text-[#1D1D1F] tracking-tight">
                {activeZone.name}
              </h3>
              <span
                className="px-2.5 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wide border"
                style={{
                  backgroundColor: `${activeZone.color}15`,
                  color: activeZone.color,
                  borderColor: `${activeZone.color}40`,
                }}
              >
                {activeZone.badge}
              </span>
            </div>

            {/* Promesa de Entrega */}
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-amber-500/15 text-amber-700 flex items-center justify-center shrink-0">
                {activeZone.isExpress ? (
                  <Zap className="w-5 h-5 text-amber-600 fill-amber-500/20" />
                ) : (
                  <Clock className="w-5 h-5 text-amber-600" />
                )}
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                  Promesa de Entrega
                </span>
                <span className="text-lg sm:text-xl font-extrabold text-[#1D1D1F] tracking-tight">
                  {activeZone.timePrimary}
                </span>
              </div>
            </div>

            {/* Tarifa y Envío Gratis Heroico (Sincronizado con Panel Admin) */}
            <div className="p-3.5 sm:p-4 rounded-2xl bg-amber-500/10 border border-amber-500/25 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                  Tarifa Estándar
                </span>
                <span className="text-lg sm:text-xl font-black text-[#1D1D1F]">
                  {activeZone.standardCost}
                </span>
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-amber-200/60">
                <Sparkles className="w-4 h-4 text-emerald-700 fill-emerald-500 shrink-0" />
                <span className="text-xs font-black text-emerald-950 uppercase tracking-wide">
                  {activeZone.freeThreshold}
                </span>
              </div>
            </div>

            {/* HORARIOS DE ENTREGA (OPCIÓN 1: UNIFICACIÓN ESTRUCTURADA ESTILO APPLE) */}
            <div className="space-y-2 pt-2 border-t border-slate-200/70">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-700 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-amber-600" />
                  <span>Horarios de Entrega</span>
                </span>
                <span className="text-[11px] text-slate-500 font-semibold">
                  Elige al finalizar compra
                </span>
              </div>

              <div className="space-y-2 pt-0.5">
                {/* 1. Servicio Regular (Lunes a Sábado o días regulares) */}
                {regularDaysList.length > 0 && (
                  <div className="p-3 rounded-2xl bg-slate-50/90 border border-slate-200/80 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg bg-amber-500/15 text-amber-800 flex items-center justify-center shrink-0">
                          <Sun className="w-3.5 h-3.5 text-amber-700" />
                        </div>
                        <span className="font-black text-xs text-slate-900">
                          {regularDaysLabel}
                        </span>
                      </div>
                      <span className="text-[10.5px] font-bold text-emerald-800 bg-emerald-100/70 border border-emerald-300/60 px-2 py-0.5 rounded-full shrink-0">
                        Envío gratis disponible
                      </span>
                    </div>

                    {/* Chips de los turnos estándar (Garantizados en 1 sola línea) */}
                    {standardSlots.length > 0 ? (
                      <div className="flex flex-col sm:flex-row gap-1.5">
                        {standardSlots.map((slot, sIdx) => (
                          <div
                            key={slot.id || sIdx}
                            className="flex-1 flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-white border border-slate-200/90 text-[10.5px] sm:text-[11px] font-bold text-slate-800 shadow-2xs whitespace-nowrap min-w-0"
                          >
                            <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                            <span className="whitespace-nowrap">{slot.label}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-[11px] text-slate-500 font-medium">
                        Horario continuo: {activeZone.schedule}
                      </div>
                    )}
                  </div>
                )}

                {/* 2. Turnos Vespertinos / Nocturnos con Tarifa Especial (si existen) */}
                {specialSlots.map((slot, sIdx) => (
                  <div
                    key={slot.id || sIdx}
                    className="p-3 rounded-2xl bg-amber-50/70 border border-amber-200/80 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-6 h-6 rounded-lg bg-amber-200/70 text-amber-900 flex items-center justify-center shrink-0">
                        <Moon className="w-3.5 h-3.5 text-amber-800" />
                      </div>
                      <div className="min-w-0">
                        <div className="font-black text-xs text-amber-950 truncate">
                          {slot.label}
                        </div>
                        <div className="text-[10.5px] text-amber-800 font-medium">
                          Turno extendido
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      {slot.fee && Number(slot.fee) > 0 ? (
                        <div className="font-black text-xs text-amber-950 font-mono">
                          {formatCLP(slot.fee)} CLP
                        </div>
                      ) : null}
                    </div>
                  </div>
                ))}

                {/* 3. Domingos / Días Especiales (si la zona tiene entrega en domingos) */}
                {activeZone.hasSpecialDayPricing && specialDaysList.length > 0 && (
                  <div className="p-3 rounded-2xl bg-amber-50/70 border border-amber-200/80 flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-6 h-6 rounded-lg bg-amber-200/70 text-amber-900 flex items-center justify-center shrink-0">
                        <Calendar className="w-3.5 h-3.5 text-amber-800" />
                      </div>
                      <div className="min-w-0">
                        <div className="font-black text-xs text-amber-950 truncate">
                          {activeZone.specialDaysText}
                        </div>
                        <div className="text-[10.5px] text-amber-800 font-medium">
                          Horario: {activeZone.schedule}
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="font-black text-xs text-amber-950 font-mono">
                        {formatCLP(activeZone.specialDayFee)} CLP
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* COLUMNA DERECHA: Google Maps Interactivo con Círculo de Cobertura y Bodega Central */}
        <div className="lg:col-span-7 h-[420px] sm:h-[480px] lg:h-auto min-h-[420px] lg:min-h-full">
          <DeliveryCoverageMap activeZone={activeZone} />
        </div>
      </div>
    </section>
  );
}
