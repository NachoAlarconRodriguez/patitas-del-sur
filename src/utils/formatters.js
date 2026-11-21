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

