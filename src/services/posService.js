import { supabase } from '../lib/supabase.js';
import { createOrderInSupabase } from './ordersService.js';
import {
  calculatePointsEarned,
  redeemRewardForCustomer,
  markCouponAsUsed,
} from './loyaltyService.js';
import { updateCustomerPoints } from './customersService.js';
import { resolveInventoryVariant } from '../utils/productVariants.js';
import {
  formatCLP,
  getProductUnitCostWithIva,
  getOrderPaymentBreakdown,
  calculateOrderPaymentFeeBreakdown,
  getChileIsoDateFromRecord,
  getYearMonthFromDate,
} from '../views/admin/adminUtils.js';
import { createAdminNotification } from './adminNotificationsService.js';

/**
 * Servicio completo del Terminal POS (Punto de Venta Físico)
 * - Apertura y cierre diario de caja + movimientos de efectivo
 * - Turnos y horas trabajadas por socio (Ignacio Alarcón y Alamiro Huerta)
 * - Venta atómica POS con canje/acumulación de Puntos Patitas y pago dividido
 * - Motor de repartición mensual proporcional por horas trabajadas + detalle diario
 */

export const POS_PARTNERS = [
  {
    key: 'ignacio',
    name: 'Ignacio Alarcón',
    shortName: 'Ignacio',
    email: 'ialarconr.684@gmail.com',
  },
  {
    key: 'alamiro',
    name: 'Alamiro Huerta',
    shortName: 'Alamiro',
    email: 'alamirohuertac@hotmail.com',
  },
];

export const POS_PAYMENT_METHODS = [
  {
    id: 'Efectivo',
    label: 'Efectivo',
    shortLabel: 'Efectivo',
    feeLabel: '0% comisión',
    feeBucket: 'none',
    isCash: true,
  },
  {
    id: 'Tarjeta Débito POS',
    label: 'Tarjeta Débito',
    shortLabel: 'Débito POS',
    feeLabel: '2,19% + IVA',
    feeBucket: 'debit_mp',
    isCash: false,
  },
  {
    id: 'Tarjeta Crédito POS',
    label: 'Tarjeta Crédito',
    shortLabel: 'Crédito POS',
    feeLabel: '2,69% + IVA',
    feeBucket: 'credit',
    isCash: false,
  },
  {
    id: 'Dinero Mercado Pago (QR)',
    label: 'Dinero Mercado Pago / QR',
    shortLabel: 'Dinero MP / QR',
    feeLabel: '2,19% + IVA',
    feeBucket: 'debit_mp',
    isCash: false,
  },
  {
    id: 'Transferencia',
    label: 'Transferencia Bancaria',
    shortLabel: 'Transferencia',
    feeLabel: '0% comisión',
    feeBucket: 'none',
    isCash: false,
  },
];

const LS_REGISTERS_KEY = 'patitas_pos_registers_fallback_v1';
const LS_MOVEMENTS_KEY = 'patitas_pos_movements_fallback_v1';
const LS_SHIFTS_KEY = 'patitas_pos_shifts_fallback_v1';

function isTableMissingError(error) {
  if (!error) return false;
  const code = String(error.code || '');
  const msg = String(error.message || '').toLowerCase();
  return (
    code === '42P01' ||
    code === 'PGRST205' ||
    msg.includes('does not exist') ||
    msg.includes('could not find the table') ||
    msg.includes('schema cache')
  );
}

function readLocalList(key) {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(key);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeLocalList(key, list) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(list));
  } catch {
    // ignore storage errors
  }
}

export function getChileTodayIso() {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Santiago',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
}

export function resolvePartnerFromAdmin(email = '', name = '') {
  const e = String(email || '').trim().toLowerCase();
  const n = String(name || '').trim().toLowerCase();
  if (e.includes('alamiro') || n.includes('alamiro')) {
    return POS_PARTNERS[1];
  }
  return POS_PARTNERS[0];
}

export function getPartnerByKey(key) {
  return POS_PARTNERS.find((p) => p.key === key) || POS_PARTNERS[0];
}

export function formatMinutesToHoursLabel(totalMinutes) {
  const safeMin = Math.max(0, Math.round(Number(totalMinutes) || 0));
  const hrs = Math.floor(safeMin / 60);
  const mins = safeMin % 60;
  if (hrs === 0) return `${mins}m`;
  if (mins === 0) return `${hrs}h`;
  return `${hrs}h ${String(mins).padStart(2, '0')}m`;
}

export function computeShiftDurationMinutes(shift, nowMs = Date.now()) {
  if (!shift) return 0;
  if (shift.status === 'cerrado' && Number(shift.duration_minutes) >= 0 && shift.ended_at) {
    const stored = Number(shift.duration_minutes);
    if (stored > 0) return stored;
  }
  const startMs = shift.started_at ? new Date(shift.started_at).getTime() : NaN;
  const endMs = shift.ended_at ? new Date(shift.ended_at).getTime() : nowMs;
  if (!Number.isFinite(startMs) || !Number.isFinite(endMs) || endMs <= startMs) {
    return Math.max(0, Number(shift.duration_minutes) || 0);
  }
  return Math.max(1, Math.round((endMs - startMs) / 60000));
}

// =========================================================================
// 1. CAJA DIARIA (APERTURA, MOVIMIENTOS, HISTORIAL Y CIERRE)
// =========================================================================

export async function fetchPosRegistersAndShifts() {
  let migrationPending = false;
  let registers = [];
  let shifts = [];
  let movements = [];

  try {
    const [regRes, shiftRes, movRes] = await Promise.all([
      supabase.from('pos_cash_registers').select('*').order('opened_at', { ascending: false }).limit(120),
      supabase.from('pos_work_shifts').select('*').order('started_at', { ascending: false }).limit(400),
      supabase.from('pos_cash_movements').select('*').order('created_at', { ascending: false }).limit(300),
    ]);

    if (isTableMissingError(regRes.error) || isTableMissingError(shiftRes.error)) {
      migrationPending = true;
      registers = readLocalList(LS_REGISTERS_KEY);
      shifts = readLocalList(LS_SHIFTS_KEY);
      movements = readLocalList(LS_MOVEMENTS_KEY);
    } else {
      registers = regRes.data || [];
      shifts = shiftRes.data || [];
      movements = isTableMissingError(movRes.error) ? [] : (movRes.data || []);
    }
  } catch (err) {
    console.warn('Error loading POS registers/shifts:', err);
    migrationPending = true;
    registers = readLocalList(LS_REGISTERS_KEY);
    shifts = readLocalList(LS_SHIFTS_KEY);
    movements = readLocalList(LS_MOVEMENTS_KEY);
  }

  const activeRegister = registers.find((r) => r.status === 'abierta') || null;
  const activeShift = activeRegister
    ? shifts.find((s) => s.register_id === activeRegister.id && s.status === 'activo') ||
      shifts.find((s) => s.status === 'activo') ||
      null
    : null;

  return {
    migrationPending,
    registers,
    shifts,
    movements,
    activeRegister,
    activeShift,
  };
}

export async function openPosCashRegister({ openingCash = 0, partner, notes = '' }) {
  const resolvedPartner = partner?.key ? getPartnerByKey(partner.key) : resolvePartnerFromAdmin(partner?.email, partner?.name);
  const businessDate = getChileTodayIso();
  const compactDate = businessDate.replace(/-/g, '');
  const randomSuffix = String(Date.now()).slice(-3);
  const registerId = `CAJA-${compactDate}-${randomSuffix}`;
  const nowIso = new Date().toISOString();

  const registerPayload = {
    id: registerId,
    business_date: businessDate,
    status: 'abierta',
    opened_at: nowIso,
    opened_by_email: resolvedPartner.email,
    opened_by_name: resolvedPartner.name,
    opening_cash: Math.max(0, Number(openingCash) || 0),
    expected_cash: Math.max(0, Number(openingCash) || 0),
    notes: String(notes || '').trim() || null,
  };

  const shiftPayload = {
    register_id: registerId,
    business_date: businessDate,
    partner_key: resolvedPartner.key,
    partner_email: resolvedPartner.email,
    partner_name: resolvedPartner.name,
    started_at: nowIso,
    status: 'activo',
    duration_minutes: 0,
    sales_count: 0,
    sales_total: 0,
    notes: 'Inicio automático al abrir caja diaria',
  };

  try {
    const { data: regData, error: regErr } = await supabase
      .from('pos_cash_registers')
      .insert(registerPayload)
      .select()
      .single();

    if (regErr) {
      if (isTableMissingError(regErr)) {
        const localReg = { ...registerPayload, created_at: nowIso };
        const localShift = { ...shiftPayload, id: `SHIFT-${Date.now()}`, created_at: nowIso };
        writeLocalList(LS_REGISTERS_KEY, [localReg, ...readLocalList(LS_REGISTERS_KEY)]);
        writeLocalList(LS_SHIFTS_KEY, [localShift, ...readLocalList(LS_SHIFTS_KEY)]);
        createAdminNotification({
          category: 'pos',
          severity: 'info',
          title: 'Caja POS diaria abierta',
          message: `${resolvedPartner.name} abrió la caja ${registerId} con fondo inicial de ${formatCLP(registerPayload.opening_cash)}.`,
          entityType: 'pos_register',
          entityId: registerId,
          actorName: resolvedPartner.name,
          actorEmail: resolvedPartner.email,
          metadata: { registerId, openingCash: registerPayload.opening_cash },
        }).catch(() => {});
        return { success: true, register: localReg, shift: localShift, migrationPending: true };
      }
      throw regErr;
    }

    const { data: shiftData, error: shiftErr } = await supabase
      .from('pos_work_shifts')
      .insert(shiftPayload)
      .select()
      .single();

    if (shiftErr) throw shiftErr;

    createAdminNotification({
      category: 'pos',
      severity: 'info',
      title: 'Caja POS diaria abierta',
      message: `${resolvedPartner.name} abrió la caja ${registerId} con fondo inicial de ${formatCLP(registerPayload.opening_cash)}.`,
      entityType: 'pos_register',
      entityId: registerId,
      actorName: resolvedPartner.name,
      actorEmail: resolvedPartner.email,
      metadata: { registerId, openingCash: registerPayload.opening_cash },
    }).catch(() => {});

    return { success: true, register: regData, shift: shiftData, migrationPending: false };
  } catch (err) {
    console.error('Error opening POS cash register:', err);
    return { success: false, error: err?.message || 'No se pudo abrir la caja.' };
  }
}

export async function recordPosCashMovement({ registerId, type, amount, reason, partner }) {
  const resolvedPartner = partner?.key ? getPartnerByKey(partner.key) : resolvePartnerFromAdmin(partner?.email, partner?.name);
  const safeAmount = Math.max(0, Number(amount) || 0);
  if (!registerId || safeAmount <= 0 || !String(reason || '').trim()) {
    return { success: false, error: 'Ingresa un monto válido y el motivo del movimiento.' };
  }

  const payload = {
    register_id: registerId,
    movement_type: type === 'retiro' ? 'retiro' : 'ingreso',
    amount: safeAmount,
    reason: String(reason).trim(),
    recorded_by_email: resolvedPartner.email,
    recorded_by_name: resolvedPartner.name,
  };

  try {
    const { data, error } = await supabase
      .from('pos_cash_movements')
      .insert(payload)
      .select()
      .single();

    if (error) {
      if (isTableMissingError(error)) {
        const localMov = { ...payload, id: `MOV-${Date.now()}`, created_at: new Date().toISOString() };
        writeLocalList(LS_MOVEMENTS_KEY, [localMov, ...readLocalList(LS_MOVEMENTS_KEY)]);
        return { success: true, movement: localMov, migrationPending: true };
      }
      throw error;
    }

    return { success: true, movement: data, migrationPending: false };
  } catch (err) {
    console.error('Error recording cash movement:', err);
    return { success: false, error: err?.message || 'Error al registrar movimiento.' };
  }
}

export function calculateRegisterReconciliation(register, orders = [], movements = []) {
  if (!register) {
    return {
      salesCount: 0,
      totalSales: 0,
      totalDiscounts: 0,
      cashSalesNet: 0,
      debitMpSales: 0,
      creditSales: 0,
      transferSales: 0,
      otherSales: 0,
      cashInflows: 0,
      cashOutflows: 0,
      expectedCash: 0,
      registerOrders: [],
      registerMovements: [],
    };
  }

  const regOrders = (orders || []).filter((o) => {
    if (String(o.status || '').toLowerCase() === 'cancelado') return false;
    if (String(o.channel || '').toLowerCase() !== 'pos') return false;
    if (o.posRegisterId || o.pos_register_id) {
      return (o.posRegisterId || o.pos_register_id) === register.id;
    }
    // Fallback por ventana horaria de la caja si faltaba pos_register_id en BD antigua
    const createdMs = o.created_at ? new Date(o.created_at).getTime() : NaN;
    const openMs = register.opened_at ? new Date(register.opened_at).getTime() : NaN;
    const closeMs = register.closed_at ? new Date(register.closed_at).getTime() : Date.now() + 60000;
    return Number.isFinite(createdMs) && Number.isFinite(openMs) && createdMs >= openMs && createdMs <= closeMs;
  });

  const regMovs = (movements || []).filter((m) => m.register_id === register.id);

  let totalSales = 0;
  let totalDiscounts = 0;
  let cashSalesNet = 0;
  let debitMpSales = 0;
  let creditSales = 0;
  let transferSales = 0;
  let otherSales = 0;

  regOrders.forEach((ord) => {
    totalSales += Number(ord.total) || 0;
    totalDiscounts += Number(ord.discount) || 0;
    const lines = getOrderPaymentBreakdown(ord);
    lines.forEach((line) => {
      if (line.norm === 'Efectivo') {
        cashSalesNet += line.amount;
      } else if (line.norm === 'Transferencia') {
        transferSales += line.amount;
      } else if (line.feeBucket === 'credit') {
        creditSales += line.amount;
      } else if (line.feeBucket === 'debit_mp') {
        debitMpSales += line.amount;
      } else if (line.norm === 'Tarjeta') {
        creditSales += line.amount;
      } else {
        otherSales += line.amount;
      }
    });
  });

  const cashInflows = regMovs
    .filter((m) => m.movement_type === 'ingreso')
    .reduce((acc, m) => acc + (Number(m.amount) || 0), 0);
  const cashOutflows = regMovs
    .filter((m) => m.movement_type === 'retiro')
    .reduce((acc, m) => acc + (Number(m.amount) || 0), 0);

  const openingCash = Number(register.opening_cash) || 0;
  const expectedCash = openingCash + cashSalesNet + cashInflows - cashOutflows;

  return {
    salesCount: regOrders.length,
    totalSales,
    totalDiscounts,
    cashSalesNet,
    debitMpSales,
    creditSales,
    transferSales,
    otherSales,
    cashInflows,
    cashOutflows,
    openingCash,
    expectedCash,
    registerOrders: regOrders,
    registerMovements: regMovs,
  };
}

export async function closePosCashRegister({
  register,
  countedCash,
  notes = '',
  closedByPartner,
  orders = [],
  movements = [],
  activeShifts = [],
}) {
  if (!register?.id) return { success: false, error: 'No hay caja activa para cerrar.' };
  const partner = closedByPartner?.key
    ? getPartnerByKey(closedByPartner.key)
    : resolvePartnerFromAdmin(closedByPartner?.email, closedByPartner?.name);

  const nowIso = new Date().toISOString();
  const rec = calculateRegisterReconciliation(register, orders, movements);
  const safeCounted = Math.max(0, Number(countedCash) || 0);
  const cashDifference = safeCounted - rec.expectedCash;

  // Cerrar todos los turnos activos asociados a esta caja
  for (const sh of activeShifts) {
    if (sh.status === 'activo') {
      await endPosWorkShift(sh, { endedAt: nowIso, notes: sh.notes || 'Cerrado al cerrar caja diaria' });
    }
  }

  const updatePayload = {
    status: 'cerrada',
    closed_at: nowIso,
    closed_by_email: partner.email,
    closed_by_name: partner.name,
    expected_cash: rec.expectedCash,
    counted_cash: safeCounted,
    cash_difference: cashDifference,
    total_sales_count: rec.salesCount,
    total_sales_amount: rec.totalSales,
    total_cash_sales: rec.cashSalesNet,
    total_debit_sales: rec.debitMpSales,
    total_credit_sales: rec.creditSales,
    total_transfer_sales: rec.transferSales,
    total_other_sales: rec.otherSales,
    total_discounts: rec.totalDiscounts,
    notes: String(notes || '').trim() || register.notes || null,
  };

  try {
    const { data, error } = await supabase
      .from('pos_cash_registers')
      .update(updatePayload)
      .eq('id', register.id)
      .select()
      .single();

    const diffText =
      cashDifference === 0
        ? 'Caja cuadrada ($0 diferencia).'
        : cashDifference > 0
        ? `Sobrante de efectivo: +${formatCLP(cashDifference)}.`
        : `Faltante de efectivo: -${formatCLP(Math.abs(cashDifference))}.`;

    const notifyClose = () => {
      createAdminNotification({
        category: 'pos',
        severity: cashDifference !== 0 ? 'warning' : 'success',
        title: `Cierre de caja ${register.id}`,
        message: `${partner.name} cerró la caja (${rec.salesCount} ventas · ${formatCLP(rec.totalSales)}). ${diffText}`,
        entityType: 'pos_register',
        entityId: register.id,
        actorName: partner.name,
        actorEmail: partner.email,
        metadata: { registerId: register.id, totalSales: rec.totalSales, cashDifference },
      }).catch(() => {});
    };

    if (error) {
      if (isTableMissingError(error)) {
        const list = readLocalList(LS_REGISTERS_KEY);
        const updated = list.map((r) => (r.id === register.id ? { ...r, ...updatePayload } : r));
        writeLocalList(LS_REGISTERS_KEY, updated);
        notifyClose();
        return {
          success: true,
          register: { ...register, ...updatePayload },
          reconciliation: rec,
          migrationPending: true,
        };
      }
      throw error;
    }

    notifyClose();
    return { success: true, register: data, reconciliation: rec, migrationPending: false };
  } catch (err) {
    console.error('Error closing POS cash register:', err);
    return { success: false, error: err?.message || 'Error al cerrar la caja.' };
  }
}

// =========================================================================
// 2. TURNOS Y HORAS TRABAJADAS POR SOCIO
// =========================================================================

export async function endPosWorkShift(shift, { endedAt, notes } = {}) {
  if (!shift?.id) return { success: false, error: 'Turno no válido.' };
  const endIso = endedAt || new Date().toISOString();
  const durationMinutes = computeShiftDurationMinutes({ ...shift, ended_at: endIso, status: 'activo' }, new Date(endIso).getTime());

  const payload = {
    status: 'cerrado',
    ended_at: endIso,
    duration_minutes: durationMinutes,
    ...(notes !== undefined ? { notes } : {}),
  };

  try {
    const { data, error } = await supabase
      .from('pos_work_shifts')
      .update(payload)
      .eq('id', shift.id)
      .select()
      .single();

    if (error) {
      if (isTableMissingError(error)) {
        const list = readLocalList(LS_SHIFTS_KEY);
        const updated = list.map((s) => (s.id === shift.id ? { ...s, ...payload } : s));
        writeLocalList(LS_SHIFTS_KEY, updated);
        return { success: true, shift: { ...shift, ...payload }, migrationPending: true };
      }
      throw error;
    }

    return { success: true, shift: data, migrationPending: false };
  } catch (err) {
    console.error('Error ending work shift:', err);
    return { success: false, error: err?.message || 'Error al cerrar turno.' };
  }
}

export async function switchPosWorkShift({ registerId, currentShift, nextPartnerKey, notes = '' }) {
  const nextPartner = getPartnerByKey(nextPartnerKey);
  const nowIso = new Date().toISOString();

  if (currentShift && currentShift.status === 'activo') {
    await endPosWorkShift(currentShift, {
      endedAt: nowIso,
      notes: notes || `Relevo de turno a ${nextPartner.name}`,
    });
  }

  const newShiftPayload = {
    register_id: registerId || null,
    business_date: getChileTodayIso(),
    partner_key: nextPartner.key,
    partner_email: nextPartner.email,
    partner_name: nextPartner.name,
    started_at: nowIso,
    status: 'activo',
    duration_minutes: 0,
    sales_count: 0,
    sales_total: 0,
    notes: notes || (currentShift ? `Relevo desde ${currentShift.partner_name}` : 'Inicio de turno manual'),
  };

  try {
    const { data, error } = await supabase
      .from('pos_work_shifts')
      .insert(newShiftPayload)
      .select()
      .single();

    const notifyShift = () => {
      createAdminNotification({
        category: 'pos',
        severity: 'info',
        title: `Relevo de turno POS: ${nextPartner.shortName}`,
        message: currentShift
          ? `${currentShift.partner_name} entregó el turno a ${nextPartner.name}.`
          : `${nextPartner.name} inició turno en el Terminal POS.`,
        entityType: 'pos_register',
        entityId: registerId || 'pos',
        actorName: nextPartner.name,
        actorEmail: nextPartner.email,
        metadata: { registerId, fromPartner: currentShift?.partner_name || null, toPartner: nextPartner.name },
      }).catch(() => {});
    };

    if (error) {
      if (isTableMissingError(error)) {
        const localShift = { ...newShiftPayload, id: `SHIFT-${Date.now()}`, created_at: nowIso };
        writeLocalList(LS_SHIFTS_KEY, [localShift, ...readLocalList(LS_SHIFTS_KEY)]);
        notifyShift();
        return { success: true, shift: localShift, migrationPending: true };
      }
      throw error;
    }

    notifyShift();
    return { success: true, shift: data, migrationPending: false };
  } catch (err) {
    console.error('Error switching POS work shift:', err);
    return { success: false, error: err?.message || 'Error al realizar el relevo de turno.' };
  }
}

export async function createManualPosWorkShift({ partnerKey, businessDate, durationMinutes, notes = '' }) {
  const partner = getPartnerByKey(partnerKey);
  const safeMinutes = Math.max(1, Math.round(Number(durationMinutes) || 0));
  const dateStr = businessDate || getChileTodayIso();
  const startIso = `${dateStr}T10:00:00-03:00`;
  const endIso = new Date(new Date(startIso).getTime() + safeMinutes * 60000).toISOString();

  const payload = {
    register_id: null,
    business_date: dateStr,
    partner_key: partner.key,
    partner_email: partner.email,
    partner_name: partner.name,
    started_at: startIso,
    ended_at: endIso,
    duration_minutes: safeMinutes,
    status: 'cerrado',
    sales_count: 0,
    sales_total: 0,
    notes: String(notes || '').trim() || 'Registro manual de horas trabajadas',
  };

  try {
    const { data, error } = await supabase
      .from('pos_work_shifts')
      .insert(payload)
      .select()
      .single();

    if (error) {
      if (isTableMissingError(error)) {
        const localShift = { ...payload, id: `SHIFT-${Date.now()}`, created_at: new Date().toISOString() };
        writeLocalList(LS_SHIFTS_KEY, [localShift, ...readLocalList(LS_SHIFTS_KEY)]);
        return { success: true, shift: localShift, migrationPending: true };
      }
      throw error;
    }

    return { success: true, shift: data, migrationPending: false };
  } catch (err) {
    console.error('Error creating manual shift:', err);
    return { success: false, error: err?.message || 'Error al registrar turno manual.' };
  }
}

export async function updatePosWorkShiftDuration(shiftId, { durationMinutes, notes }) {
  const safeMinutes = Math.max(1, Math.round(Number(durationMinutes) || 0));
  const payload = {
    duration_minutes: safeMinutes,
    ...(notes !== undefined ? { notes } : {}),
  };

  try {
    const { data, error } = await supabase
      .from('pos_work_shifts')
      .update(payload)
      .eq('id', shiftId)
      .select()
      .single();

    if (error) {
      if (isTableMissingError(error)) {
        const list = readLocalList(LS_SHIFTS_KEY);
        const updated = list.map((s) => (s.id === shiftId ? { ...s, ...payload } : s));
        writeLocalList(LS_SHIFTS_KEY, updated);
        return { success: true, shift: updated.find((s) => s.id === shiftId), migrationPending: true };
      }
      throw error;
    }

    return { success: true, shift: data, migrationPending: false };
  } catch (err) {
    console.error('Error updating shift duration:', err);
    return { success: false, error: err?.message || 'Error al actualizar turno.' };
  }
}

// =========================================================================
// 3. ORQUESTACIÓN DE VENTA ATÓMICA POS (CON CANJE Y PAGO DIVIDIDO)
// =========================================================================

export async function completePosSale({
  cartItems = [],
  customer = null, // null => Cliente de paso (anónimo)
  redeemTier = null, // { id, points, discountAmount, title, validity } => canje instantáneo en caja
  existingCoupon = null, // { code, discountAmount, title } => cupón PTS-XXXXX ya canjeado previamente
  manualDiscount = 0,
  manualDiscountReason = '',
  paymentLines = [], // [{ method, amount, tendered?, change? }]
  activeRegister = null,
  activeShift = null,
  sellerPartner,
  pointsPerThousand = 1,
  notes = '',
}) {
  if (!Array.isArray(cartItems) || cartItems.length === 0) {
    return { success: false, error: 'El carrito está vacío.' };
  }
  if (!Array.isArray(paymentLines) || paymentLines.length === 0) {
    return { success: false, error: 'Selecciona al menos un medio de pago.' };
  }

  const partner = sellerPartner?.key
    ? getPartnerByKey(sellerPartner.key)
    : resolvePartnerFromAdmin(sellerPartner?.email, sellerPartner?.name);

  const subtotal = cartItems.reduce((acc, item) => acc + (Number(item.price) || 0) * (Number(item.quantity) || 1), 0);
  const loyaltyDiscount = redeemTier
    ? Number(redeemTier.discountAmount) || 0
    : existingCoupon
      ? Number(existingCoupon.discountAmount) || 0
      : 0;
  const safeManualDiscount = Math.max(0, Number(manualDiscount) || 0);
  const totalDiscount = Math.min(subtotal, loyaltyDiscount + safeManualDiscount);
  const finalTotal = Math.max(0, subtotal - totalDiscount);

  const coveredAmount = paymentLines.reduce((acc, line) => acc + (Number(line.amount) || 0), 0);
  if (coveredAmount < finalTotal) {
    return { success: false, error: 'El monto de los pagos no cubre el total de la venta.' };
  }

  // Normalizar líneas de pago (ajustar última línea no-efectivo o mantener exactitud)
  const normalizedPayments = paymentLines
    .filter((l) => (Number(l.amount) || 0) > 0)
    .map((l) => {
      const amount = Math.round(Number(l.amount) || 0);
      const isCash = String(l.method || '').toLowerCase().includes('efectivo');
      const tendered = isCash ? Math.max(amount, Math.round(Number(l.tendered) || amount)) : amount;
      const change = isCash ? Math.max(0, tendered - amount) : 0;
      return {
        method: l.method,
        amount,
        ...(isCash ? { tendered, change } : {}),
      };
    });

  const cashLines = normalizedPayments.filter((l) => String(l.method || '').toLowerCase().includes('efectivo'));
  const cashTendered = cashLines.reduce((acc, l) => acc + (l.tendered || l.amount), 0);
  const cashChange = cashLines.reduce((acc, l) => acc + (l.change || 0), 0);

  const paymentMethodLabel =
    normalizedPayments.length > 1
      ? `Mixto (${normalizedPayments.map((l) => l.method.replace(' POS', '')).join(' + ')})`
      : normalizedPayments[0]?.method || 'Efectivo';

  // Paso 1: Si corresponde canje instantáneo de Puntos Patitas, ejecutarlo antes de crear la orden
  let appliedCouponCode = existingCoupon?.code || null;
  let pointsSpentNow = 0;
  let redeemedRecordInfo = null;

  if (customer?.id && redeemTier) {
    const redeemRes = await redeemRewardForCustomer(customer, redeemTier);
    if (!redeemRes.success) {
      return { success: false, error: redeemRes.error || 'No se pudieron canjear los puntos del cliente.' };
    }
    appliedCouponCode = redeemRes.coupon?.code || null;
    pointsSpentNow = Number(redeemTier.points) || 0;
    redeemedRecordInfo = redeemRes.coupon;
  }

  const earnedPoints = customer?.id ? calculatePointsEarned(finalTotal, pointsPerThousand) : 0;
  const nowIso = new Date().toISOString();
  const todayIso = getChileTodayIso();

  const noteParts = [
    'Venta presencial Terminal POS',
    `Vendedor: ${partner.name}`,
    activeRegister?.id ? `Caja: ${activeRegister.id}` : null,
    normalizedPayments.length > 1
      ? `Pago dividido: ${normalizedPayments.map((l) => `${l.method} $${l.amount.toLocaleString('es-CL')}`).join(' + ')}`
      : null,
    cashChange > 0 ? `Efectivo recibido: $${cashTendered.toLocaleString('es-CL')} | Vuelto: $${cashChange.toLocaleString('es-CL')}` : null,
    pointsSpentNow > 0 ? `Canje en caja: -${pointsSpentNow} pts (${appliedCouponCode})` : null,
    safeManualDiscount > 0
      ? `Dcto. manual: -$${safeManualDiscount.toLocaleString('es-CL')}${manualDiscountReason ? ` (${manualDiscountReason})` : ''}`
      : null,
    notes ? String(notes).trim() : null,
  ].filter(Boolean);

  const orderRes = await createOrderInSupabase(
    {
      customerId: customer?.id || null,
      skipCustomerCreation: !customer?.id,
      customerName: customer?.full_name || customer?.name || 'Cliente de Paso (POS)',
      customerEmail: customer?.email || null,
      customerPhone: customer?.phone || null,
      channel: 'pos',
      paymentMethod: paymentMethodLabel,
      paymentStatus: 'pagado',
      status: 'entregado',
      subtotal,
      shippingCost: 0,
      discount: totalDiscount,
      total: finalTotal,
      pointsEarned: earnedPoints,
      deliveryDayText: 'Retiro en Tienda (POS)',
      deliveryDate: todayIso,
      deliverySlot: 'Venta Presencial (POS)',
      address: 'Tienda Física Patitas del Sur',
      city: customer?.city || 'Frutillar',
      deliveryZone: 'Tienda Física (POS)',
      couponCodeUsed: appliedCouponCode,
      notes: noteParts.join(' | '),
      posRegisterId: activeRegister?.id || null,
      posShiftId: activeShift?.id && !String(activeShift.id).startsWith('SHIFT-') ? activeShift.id : null,
      soldByEmail: partner.email,
      soldByName: partner.name,
      deliveredByName: partner.name,
      deliveredAt: nowIso,
      paymentBreakdown: normalizedPayments,
      cashTendered,
      cashChange,
      createdAt: nowIso,
    },
    cartItems.map((it) => ({
      productId: it.id,
      id: it.id,
      name: it.name,
      weight: it.format || '1 unidad',
      format: it.format || '1 unidad',
      quantity: it.quantity,
      price: it.price,
    }))
  );

  // Rollback defensivo si falló la orden después de haber descontado puntos al cliente
  if (!orderRes.success) {
    if (customer?.id && pointsSpentNow > 0) {
      try {
        await updateCustomerPoints(customer.id, pointsSpentNow);
      } catch (rbErr) {
        console.warn('Rollback de puntos tras fallo de orden POS:', rbErr);
      }
    }
    return {
      success: false,
      error: orderRes.error?.message || 'Error al guardar la venta POS en Supabase.',
    };
  }

  // Paso 3: Marcar cupón como utilizado si se aplicó uno
  if (appliedCouponCode) {
    await markCouponAsUsed(appliedCouponCode, orderRes.order?.id);
  }

  // Paso 4: Actualizar estadísticas del turno activo (best-effort)
  if (activeShift?.id) {
    const nextCount = (Number(activeShift.sales_count) || 0) + 1;
    const nextTotal = (Number(activeShift.sales_total) || 0) + finalTotal;
    if (String(activeShift.id).startsWith('SHIFT-')) {
      const list = readLocalList(LS_SHIFTS_KEY).map((s) =>
        s.id === activeShift.id ? { ...s, sales_count: nextCount, sales_total: nextTotal } : s
      );
      writeLocalList(LS_SHIFTS_KEY, list);
    } else {
      supabase
        .from('pos_work_shifts')
        .update({ sales_count: nextCount, sales_total: nextTotal })
        .eq('id', activeShift.id)
        .then(() => {})
        .catch(() => {});
    }
  }

  const previousPoints = Number(customer?.points || 0);
  const newCustomerPoints = customer?.id ? Math.max(0, previousPoints - pointsSpentNow + earnedPoints) : 0;
  const saleOrderId = orderRes.order?.id;
  const saleCustomerName = customer?.full_name || customer?.name || 'Cliente de Paso (POS)';

  createAdminNotification({
    category: 'order',
    severity: 'success',
    title: `Nueva venta POS ${saleOrderId || ''}`.trim(),
    message: `${saleCustomerName} · ${formatCLP(finalTotal)} (${paymentMethodLabel}) · Atendió ${partner.shortName}.`,
    entityType: 'order',
    entityId: saleOrderId || null,
    actorName: partner.name,
    actorEmail: partner.email,
    metadata: {
      orderId: saleOrderId,
      total: finalTotal,
      paymentMethod: paymentMethodLabel,
      channel: 'pos',
    },
  }).catch(() => {});

  return {
    success: true,
    order: {
      ...orderRes.order,
      id: saleOrderId,
      invoiceNumber: orderRes.order?.invoice_number || saleOrderId,
      subtotal,
      discount: totalDiscount,
      total: finalTotal,
      paymentMethod: paymentMethodLabel,
      paymentBreakdown: normalizedPayments,
      cashTendered,
      cashChange,
      soldByName: partner.name,
      soldByEmail: partner.email,
      customerName: saleCustomerName,
      customerPhone: customer?.phone || '',
      pointsEarned: earnedPoints,
      pointsSpent: pointsSpentNow,
      newCustomerPoints,
      couponCodeUsed: appliedCouponCode,
      redeemedTitle: redeemTier?.title || existingCoupon?.title || redeemedRecordInfo?.title || null,
      items: cartItems,
      created_at: nowIso,
    },
  };
}

// =========================================================================
// 4. REPARTICIÓN PROPORCIONAL MENSUAL POR HORAS TRABAJADAS + DETALLE DIARIO
// =========================================================================

export function calculatePosOrderNetProfit(order, inventory = [], mercadoPagoConfig = {}) {
  if (!order || String(order.status || '').toLowerCase() === 'cancelado') {
    return {
      orderTotal: 0,
      productCostWithIva: 0,
      paymentFee: 0,
      netProfit: 0,
    };
  }
  const orderTotal = Number(order.total || 0);
  const items =
    Array.isArray(order.items) && order.items.length > 0
      ? order.items
      : [
          {
            name: order.product || 'Producto',
            format: order.format || '',
            price: orderTotal,
            quantity: order.qty || 1,
            productId: order.productId,
          },
        ];

  let productCostWithIva = 0;
  items.forEach((item) => {
    const qty = parseInt(item.quantity || item.qty || 1, 10) || 1;
    const match = resolveInventoryVariant(inventory, item);
    if (Number(item.unitCostNeto) > 0) {
      productCostWithIva += getProductUnitCostWithIva(item, order) * qty;
    } else if (match && Number(match.unitCostNeto) > 0) {
      productCostWithIva += getProductUnitCostWithIva(match, order) * qty;
    } else {
      const unitP = Number(item.price || item.unit_price || (orderTotal > 0 ? orderTotal / qty : 0));
      productCostWithIva += Math.round(unitP * 0.65) * qty;
    }
  });

  const feeInfo = calculateOrderPaymentFeeBreakdown(order, mercadoPagoConfig);
  const paymentFee = feeInfo.feeAmount || 0;
  const netProfit = orderTotal - productCostWithIva - paymentFee;

  return {
    orderTotal,
    productCostWithIva,
    paymentFee,
    netProfit,
  };
}

/**
 * Calcula el pozo acumulado del período (mensual o todos) para las ventas físicas POS
 * y lo distribuye entre Ignacio Alarcón y Alamiro Huerta proporcionalmente a las horas trabajadas,
 * entregando además el detalle día por día de horas y ventas.
 */
export function calculatePosPartnerHoursSplit({
  orders = [],
  shifts = [],
  inventory = [],
  mercadoPagoConfig = {},
  targetPeriod = 'todos', // 'YYYY-MM' | 'todos'
  nowMs = Date.now(),
}) {
  const posOrders = (orders || []).filter((o) => {
    if (String(o.status || '').toLowerCase() === 'cancelado') return false;
    if (String(o.channel || '').toLowerCase() !== 'pos') return false;
    if (targetPeriod === 'todos') return true;
    return getYearMonthFromDate(o.date, o.created_at) === targetPeriod;
  });

  const periodShifts = (shifts || []).filter((s) => {
    if (targetPeriod === 'todos') return true;
    const shiftYm = String(s.business_date || '').slice(0, 7) || getYearMonthFromDate(null, s.started_at);
    return shiftYm === targetPeriod;
  });

  let totalPosSales = 0;
  let totalPosCogs = 0;
  let totalPosPaymentFees = 0;
  let totalPosNetProfit = 0;

  const dailyMap = new Map();
  const ensureDay = (isoDate) => {
    const key = isoDate || getChileTodayIso();
    if (!dailyMap.has(key)) {
      dailyMap.set(key, {
        date: key,
        ignacioMinutes: 0,
        alamiroMinutes: 0,
        totalMinutes: 0,
        shiftsCount: 0,
        salesCount: 0,
        grossSales: 0,
        netProfit: 0,
        ignacioSalesCount: 0,
        alamiroSalesCount: 0,
      });
    }
    return dailyMap.get(key);
  };

  let ignacioSalesCount = 0;
  let ignacioSalesAmount = 0;
  let alamiroSalesCount = 0;
  let alamiroSalesAmount = 0;

  posOrders.forEach((ord) => {
    const p = calculatePosOrderNetProfit(ord, inventory, mercadoPagoConfig);
    totalPosSales += p.orderTotal;
    totalPosCogs += p.productCostWithIva;
    totalPosPaymentFees += p.paymentFee;
    totalPosNetProfit += p.netProfit;

    const isoDate = getChileIsoDateFromRecord(ord) || getChileTodayIso();
    const dayRow = ensureDay(isoDate);
    dayRow.salesCount += 1;
    dayRow.grossSales += p.orderTotal;
    dayRow.netProfit += p.netProfit;

    const sellerName = String(ord.soldByName || ord.sold_by_name || ord.deliveredByName || '').toLowerCase();
    if (sellerName.includes('alamiro')) {
      alamiroSalesCount += 1;
      alamiroSalesAmount += p.orderTotal;
      dayRow.alamiroSalesCount += 1;
    } else {
      ignacioSalesCount += 1;
      ignacioSalesAmount += p.orderTotal;
      dayRow.ignacioSalesCount += 1;
    }
  });

  let ignacioMinutes = 0;
  let alamiroMinutes = 0;
  let ignacioShiftsCount = 0;
  let alamiroShiftsCount = 0;

  periodShifts.forEach((sh) => {
    const mins = computeShiftDurationMinutes(sh, nowMs);
    const isoDate =
      String(sh.business_date || '').slice(0, 10) ||
      (sh.started_at
        ? new Intl.DateTimeFormat('en-CA', {
            timeZone: 'America/Santiago',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
          }).format(new Date(sh.started_at))
        : getChileTodayIso());

    const dayRow = ensureDay(isoDate);
    dayRow.shiftsCount += 1;
    dayRow.totalMinutes += mins;

    const isAlamiro =
      sh.partner_key === 'alamiro' || String(sh.partner_name || '').toLowerCase().includes('alamiro');
    if (isAlamiro) {
      alamiroMinutes += mins;
      alamiroShiftsCount += 1;
      dayRow.alamiroMinutes += mins;
    } else {
      ignacioMinutes += mins;
      ignacioShiftsCount += 1;
      dayRow.ignacioMinutes += mins;
    }
  });

  const totalMinutes = ignacioMinutes + alamiroMinutes;
  const hasRecordedHours = totalMinutes > 0;
  const ignacioShareRatio = hasRecordedHours ? ignacioMinutes / totalMinutes : 0.5;
  const alamiroShareRatio = hasRecordedHours ? alamiroMinutes / totalMinutes : 0.5;

  const ignacioProfitShare = Math.round(totalPosNetProfit * ignacioShareRatio);
  const alamiroProfitShare = Math.round(totalPosNetProfit) - ignacioProfitShare;
  const profitPerHour = totalMinutes > 0 ? Math.round((totalPosNetProfit / totalMinutes) * 60) : 0;

  const dailyBreakdown = Array.from(dailyMap.values()).sort((a, b) => b.date.localeCompare(a.date));

  return {
    targetPeriod,
    posOrdersCount: posOrders.length,
    totalPosSales,
    totalPosCogs,
    totalPosPaymentFees,
    totalPosNetProfit: Math.round(totalPosNetProfit),
    totalMinutes,
    totalHoursDecimal: Number((totalMinutes / 60).toFixed(2)),
    hasRecordedHours,
    profitPerHour,
    ignacio: {
      key: 'ignacio',
      name: 'Ignacio Alarcón',
      minutes: ignacioMinutes,
      hoursLabel: formatMinutesToHoursLabel(ignacioMinutes),
      hoursDecimal: Number((ignacioMinutes / 60).toFixed(2)),
      sharePercent: Number((ignacioShareRatio * 100).toFixed(1)),
      profitShare: ignacioProfitShare,
      shiftsCount: ignacioShiftsCount,
      salesCount: ignacioSalesCount,
      salesAmount: ignacioSalesAmount,
    },
    alamiro: {
      key: 'alamiro',
      name: 'Alamiro Huerta',
      minutes: alamiroMinutes,
      hoursLabel: formatMinutesToHoursLabel(alamiroMinutes),
      hoursDecimal: Number((alamiroMinutes / 60).toFixed(2)),
      sharePercent: Number((alamiroShareRatio * 100).toFixed(1)),
      profitShare: alamiroProfitShare,
      shiftsCount: alamiroShiftsCount,
      salesCount: alamiroSalesCount,
      salesAmount: alamiroSalesAmount,
    },
    dailyBreakdown,
    shifts: periodShifts,
  };
}
