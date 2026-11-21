/**
 * Utilidades centralizadas de formateo de moneda (CLP) y fechas en zona horaria de Chile.
 */

export function formatCLP(amount) {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    maximumFractionDigits: 0,
  }).format(Number(amount) || 0);
}

/**
 * Formateador CLP para finanzas/utilidades que preserva ",5" cuando la división 50/50
 * de una utilidad impar genera medios pesos.
 */
export function formatCLPWithHalf(amount) {
  const num = Number(amount || 0);
  const roundedHalf = Math.round(num * 2) / 2;
  const isNegative = roundedHalf < 0;
  const absVal = Math.abs(roundedHalf);
  const intPart = Math.floor(absVal);
  const hasHalf = Math.abs(absVal - intPart - 0.5) < 0.01;
  const formattedInt = new Intl.NumberFormat('es-CL', {
    maximumFractionDigits: 0,
  }).format(intPart);
  return `${isNegative ? '-' : ''}$${formattedInt}${hasHalf ? ',5' : ''}`;
}

/**
 * Fecha actual en zona horaria de Chile (YYYY-MM-DD).
 */
export function getChileDateString(dateObj = new Date()) {
  try {
    return new Intl.DateTimeFormat('en-CA', {
      timeZone: 'America/Santiago',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(dateObj);
  } catch {
    const offsetMs = dateObj.getTime() - dateObj.getTimezoneOffset() * 60000;
    return new Date(offsetMs).toISOString().split('T')[0];
  }
}

/**
 * Hora actual formateada en zona horaria de Chile (ej: "11:05 p. m." / "23:05").
 */
export function getChileTimeFormatted(dateObj = new Date()) {
  try {
    return dateObj.toLocaleTimeString('es-CL', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'America/Santiago',
    });
  } catch {
    return `${String(dateObj.getHours()).padStart(2, '0')}:${String(dateObj.getMinutes()).padStart(2, '0')}`;
  }
}

/**
 * Construye un ISO timestamp alineado con la fecha seleccionada y la hora actual de Chile.
 */
export function buildChileOrderIso(dateStr) {
  const now = new Date();
  const todayChile = getChileDateString(now);
  if (!dateStr || dateStr === todayChile) {
    return now.toISOString();
  }
  const [ordY, ordM, ordD] = String(dateStr).split('-').map(Number);
  if (!ordY || !ordM || !ordD) return now.toISOString();
  const localDate = new Date(
    ordY,
    ordM - 1,
    ordD,
    now.getHours(),
    now.getMinutes(),
    now.getSeconds(),
    now.getMilliseconds()
  );
  return localDate.toISOString();
}

/**
 * Formatea una fecha a DD/MM/YYYY respetando zona horaria de Chile cuando es ISO timestamp.
 */
export function formatCLPDate(dateVal) {
  if (!dateVal) return '-';
  const str = String(dateVal).trim();
  if (str.includes('T')) {
    const parsed = new Date(str);
    if (!isNaN(parsed.getTime())) {
      const chileIso = getChileDateString(parsed);
      const parts = chileIso.split('-');
      if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
  }
  if (str.includes('-')) {
    const parts = str.split('T')[0].split('-');
    if (parts.length === 3 && parts[0].length === 4) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
  }
  return str;
}

/**
 * Helper universal para extraer YYYY-MM desde cualquier formato de fecha
 * (ISO, YYYY-MM-DD, o español "22 Oct 2026").
 */
export function getYearMonthFromDate(dateVal, createdAtVal) {
  const str = String(dateVal || createdAtVal || '').trim();
  if (!str) return null;

  if (str.includes('T')) {
    const parsedTs = new Date(str);
    if (!isNaN(parsedTs.getTime())) {
      return getChileDateString(parsedTs).slice(0, 7);
    }
  }

  const isoMatch = str.match(/^(\d{4})-(\d{2})/);
  if (isoMatch) {
    return `${isoMatch[1]}-${isoMatch[2]}`;
  }

  if (createdAtVal) {
    const cStr = String(createdAtVal);
    if (cStr.includes('T')) {
      const parsedCreated = new Date(cStr);
      if (!isNaN(parsedCreated.getTime())) {
        return getChileDateString(parsedCreated).slice(0, 7);
      }
    }
    const cMatch = cStr.match(/^(\d{4})-(\d{2})/);
    if (cMatch) return `${cMatch[1]}-${cMatch[2]}`;
  }

  const lower = str.toLowerCase();
  const yearMatch = lower.match(/(20\d\d)/);
  const year = yearMatch ? yearMatch[1] : new Date().getFullYear().toString();

  const monthMap = {
    ene: '01', jan: '01',
    feb: '02',
    mar: '03',
    abr: '04', apr: '04',
    may: '05',
    jun: '06',
    jul: '07',
    ago: '08', aug: '08',
    sep: '09', set: '09',
    oct: '10',
    nov: '11',
    dic: '12', dec: '12',
  };

  for (const [prefix, mm] of Object.entries(monthMap)) {
    if (lower.includes(prefix)) {
      return `${year}-${mm}`;
    }
  }

  if (lower.includes('hoy') || lower.includes('ayer')) {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  }

  const parsed = new Date(str);
  if (!isNaN(parsed.getTime())) {
    return `${parsed.getFullYear()}-${String(parsed.getMonth() + 1).padStart(2, '0')}`;
  }

  return null;
}

/**
 * Convierte YYYY-MM a etiqueta legible en español ("Octubre 2026").
 */
export function formatPeriodLabel(ym) {
  if (!ym || ym === 'todos') return 'Todo el Histórico';
  const parts = String(ym).split('-');
  if (parts.length < 2) return ym;
  const [year, month] = parts;
  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
  ];
  const mIndex = parseInt(month, 10) - 1;
  const name = monthNames[mIndex] || month;
  return `${name} ${year}`;
}

const SPANISH_MONTH_INDEX = {
  ene: 1, jan: 1,
  feb: 2,
  mar: 3,
  abr: 4, apr: 4,
  may: 5,
  jun: 6,
  jul: 7,
  ago: 8, aug: 8,
  sep: 9, set: 9,
  oct: 10,
  nov: 11,
  dic: 12, dec: 12,
};

/**
 * Resta N días calendario a una fecha ISO YYYY-MM-DD de forma determinista (sin desfase TZ).
 */
export function shiftIsoDate(isoDate, deltaDays) {
  const [y, m, d] = String(isoDate).split('-').map(Number);
  if (!y || !m || !d) return isoDate;
  const dt = new Date(Date.UTC(y, m - 1, d + deltaDays));
  const yy = dt.getUTCFullYear();
  const mm = String(dt.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(dt.getUTCDate()).padStart(2, '0');
  return `${yy}-${mm}-${dd}`;
}

/**
 * Extrae la fecha YYYY-MM-DD en zona horaria de Chile (America/Santiago) desde un registro
 * (pedido, factura, gasto, cliente o inversión), priorizando created_at/createdAt sobre strings formateados.
 */
export function getChileIsoDateFromRecord(record, now = new Date()) {
  if (!record) return null;

  const tsRaw = record.created_at || record.createdAt;
  if (tsRaw) {
    const tsStr = String(tsRaw).trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(tsStr)) {
      return tsStr;
    }
    const parsed = new Date(tsStr);
    if (!isNaN(parsed.getTime())) {
      return getChileDateString(parsed);
    }
  }

  const dateRaw = String(record.date || '').trim();
  if (!dateRaw) return null;

  if (/^\d{4}-\d{2}-\d{2}/.test(dateRaw)) {
    if (dateRaw.includes('T')) {
      const parsed = new Date(dateRaw);
      if (!isNaN(parsed.getTime())) return getChileDateString(parsed);
    }
    return dateRaw.slice(0, 10);
  }

  const lower = dateRaw.toLowerCase().replace(/\./g, '');
  if (lower === 'hoy') return getChileDateString(now);
  if (lower === 'ayer') return shiftIsoDate(getChileDateString(now), -1);

  // Formato DD/MM/YYYY o DD-MM-YYYY
  const dmyMatch = lower.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
  if (dmyMatch) {
    return `${dmyMatch[3]}-${dmyMatch[2].padStart(2, '0')}-${dmyMatch[1].padStart(2, '0')}`;
  }

  // Formato español "21 nov 2026" o "21 de noviembre de 2026"
  const esMatch = lower.match(/(\d{1,2})\s+(?:de\s+)?([a-záéíóú]+)(?:\s+(?:de\s+)?(\d{4}))?/);
  if (esMatch) {
    const day = parseInt(esMatch[1], 10);
    const monPrefix = esMatch[2].slice(0, 3);
    const month = SPANISH_MONTH_INDEX[monPrefix];
    const year = esMatch[3] ? parseInt(esMatch[3], 10) : Number(getChileDateString(now).slice(0, 4));
    if (day >= 1 && day <= 31 && month) {
      return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    }
  }

  const parsedFallback = new Date(dateRaw);
  if (!isNaN(parsedFallback.getTime())) {
    return getChileDateString(parsedFallback);
  }
  return null;
}

/**
 * Extrae la hora (0..23) en zona horaria de Chile (America/Santiago) de un registro.
 */
export function getChileHourFromRecord(record) {
  if (!record) return null;
  const tsRaw = record.created_at || record.createdAt;
  if (tsRaw && String(tsRaw).includes('T')) {
    const parsed = new Date(tsRaw);
    if (!isNaN(parsed.getTime())) {
      try {
        const parts = new Intl.DateTimeFormat('en-GB', {
          timeZone: 'America/Santiago',
          hour: '2-digit',
          hour12: false,
        }).formatToParts(parsed);
        const hourPart = parts.find((p) => p.type === 'hour');
        if (hourPart) {
          const h = parseInt(hourPart.value, 10);
          if (!isNaN(h)) return h === 24 ? 0 : h;
        }
      } catch {
        // fallback below
      }
    }
  }

  const timeRaw = String(record.time || '').trim().toLowerCase();
  if (!timeRaw) return null;
  const m = timeRaw.match(/(\d{1,2})\s*:\s*(\d{2})/);
  if (!m) return null;
  let h = parseInt(m[1], 10);
  if (isNaN(h)) return null;
  const isPM = /p\.?\s*m\.?/.test(timeRaw);
  const isAM = /a\.?\s*m\.?/.test(timeRaw);
  if (isPM && h < 12) h += 12;
  if (isAM && h === 12) h = 0;
  return h >= 0 && h <= 23 ? h : null;
}

/**
 * Calcula todos los rangos de fecha vigentes en hora de Chile para el Dashboard:
 * hoy, ayer, últimos 7 días, 7 días previos, mes actual y mes anterior.
 */
export function getChileDateRanges(now = new Date()) {
  const todayIso = getChileDateString(now);
  const yesterdayIso = shiftIsoDate(todayIso, -1);
  const weekStartIso = shiftIsoDate(todayIso, -6); // últimos 7 días incluyendo hoy
  const prevWeekStartIso = shiftIsoDate(todayIso, -13);
  const prevWeekEndIso = shiftIsoDate(todayIso, -7);

  const currentYM = todayIso.slice(0, 7);
  const [cy, cm] = currentYM.split('-').map(Number);
  const prevYear = cm === 1 ? cy - 1 : cy;
  const prevMonth = cm === 1 ? 12 : cm - 1;
  const prevYM = `${prevYear}-${String(prevMonth).padStart(2, '0')}`;

  const shortDays = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  const last7Days = Array.from({ length: 7 }, (_, idx) => {
    const iso = shiftIsoDate(todayIso, idx - 6);
    const [y, m, d] = iso.split('-').map(Number);
    const weekday = new Date(Date.UTC(y, m - 1, d)).getUTCDay();
    return {
      iso,
      label: idx === 6 ? 'Hoy' : `${shortDays[weekday]} ${d}`,
    };
  });

  return {
    todayIso,
    yesterdayIso,
    weekStartIso,
    prevWeekStartIso,
    prevWeekEndIso,
    currentYM,
    prevYM,
    last7Days,
  };
}


