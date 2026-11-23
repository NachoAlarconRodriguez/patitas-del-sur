import React, { useState, useMemo } from 'react';
import {
  Clock,
  Calendar,
  TrendingUp,
  Plus,
  Edit2,
  Check,
  X,
  Users,
} from 'lucide-react';
import { formatCLP, formatPeriodLabel } from '../adminUtils.js';
import {
  POS_PARTNERS,
  calculatePosPartnerHoursSplit,
  computeShiftDurationMinutes,
  formatMinutesToHoursLabel,
  getChileTodayIso,
} from '../../../services/posService.js';

function formatIsoDayLabel(isoDate) {
  if (!isoDate) return '-';
  const parts = String(isoDate).split('-');
  if (parts.length !== 3) return isoDate;
  const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
  return new Intl.DateTimeFormat('es-CL', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(d);
}

function formatShiftTime(iso) {
  if (!iso) return 'En curso';
  try {
    return new Intl.DateTimeFormat('es-CL', {
      timeZone: 'America/Santiago',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(iso));
  } catch {
    return '-';
  }
}

/**
 * Panel de Control de Turnos, Detalle Diario de Horas Trabajadas y
 * Repartición Proporcional del Pozo Mensual de Ganancias POS entre Socios.
 */
export default function PosShiftHistoryAndSplitPanel({
  orders = [],
  shifts = [],
  inventory = [],
  mercadoPagoConfig = {},
  onCreateManualShift,
  onUpdateShiftDuration,
}) {
  const currentMonth = getChileTodayIso().slice(0, 7);
  const [selectedPeriod, setSelectedPeriod] = useState(currentMonth);

  const [showManualForm, setShowManualForm] = useState(false);
  const [manualForm, setManualForm] = useState({
    partnerKey: 'ignacio',
    businessDate: getChileTodayIso(),
    hours: '4',
    minutes: '0',
    notes: '',
  });
  const [isSavingManual, setIsSavingManual] = useState(false);

  const [editingShiftId, setEditingShiftId] = useState(null);
  const [editMinutesInput, setEditMinutesInput] = useState('');
  const [editNotesInput, setEditNotesInput] = useState('');

  // Meses disponibles basados en turnos y ventas POS + mes actual
  const availablePeriods = useMemo(() => {
    const set = new Set([currentMonth]);
    (shifts || []).forEach((s) => {
      const ym = String(s.business_date || s.started_at || '').slice(0, 7);
      if (/^\d{4}-\d{2}$/.test(ym)) set.add(ym);
    });
    (orders || []).forEach((o) => {
      if (String(o.channel || '').toLowerCase() !== 'pos') return;
      const ym = String(o.deliveryDate || o.created_at || '').slice(0, 7);
      if (/^\d{4}-\d{2}$/.test(ym)) set.add(ym);
    });
    return Array.from(set).sort((a, b) => b.localeCompare(a));
  }, [shifts, orders, currentMonth]);

  const splitData = useMemo(
    () =>
      calculatePosPartnerHoursSplit({
        orders,
        shifts,
        inventory,
        mercadoPagoConfig,
        targetPeriod: selectedPeriod,
      }),
    [orders, shifts, inventory, mercadoPagoConfig, selectedPeriod]
  );

  const handleCreateManual = async (e) => {
    e.preventDefault();
    const totalMins = (parseInt(manualForm.hours, 10) || 0) * 60 + (parseInt(manualForm.minutes, 10) || 0);
    if (totalMins <= 0) return;
    setIsSavingManual(true);
    try {
      const ok = await onCreateManualShift?.({
        partnerKey: manualForm.partnerKey,
        businessDate: manualForm.businessDate,
        durationMinutes: totalMins,
        notes: manualForm.notes,
      });
      if (ok) {
        setShowManualForm(false);
        setManualForm((prev) => ({ ...prev, hours: '4', minutes: '0', notes: '' }));
      }
    } finally {
      setIsSavingManual(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Encabezado + Selector de Mes + Botón Turno Manual */}
      <div className="bg-white border border-[#EAECEF] rounded-3xl p-5 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-black text-[#111827] flex items-center gap-2">
            <Users className="w-4 h-4 text-[#D97706]" />
            <span>Pozo Mensual POS y Repartición por Horas Trabajadas</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            La utilidad neta de las ventas físicas del período se reparte proporcionalmente según las horas trabajadas por cada socio.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-4 py-2 rounded-full bg-[#F8FAFC] border border-[#EAECEF] text-xs font-extrabold text-[#111827] focus:outline-none focus:border-[#D97706] cursor-pointer"
          >
            {availablePeriods.map((ym) => (
              <option key={ym} value={ym}>
                {formatPeriodLabel(ym)}
              </option>
            ))}
            <option value="todos">Histórico Consolidado</option>
          </select>

          <button
            type="button"
            onClick={() => setShowManualForm((p) => !p)}
            className="px-4 py-2 rounded-full bg-[#D97706] hover:bg-[#B45309] text-white text-xs font-extrabold flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Registrar Turno Manual</span>
          </button>
        </div>
      </div>

      {/* Formulario rápido de turno manual */}
      {showManualForm && (
        <form
          onSubmit={handleCreateManual}
          className="bg-[#FAF8F4] border border-[#FDE68A] rounded-3xl p-5 grid grid-cols-1 md:grid-cols-6 gap-3 items-end text-xs"
        >
          <div>
            <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">Socio</label>
            <select
              value={manualForm.partnerKey}
              onChange={(e) => setManualForm((p) => ({ ...p, partnerKey: e.target.value }))}
              className="w-full px-3 py-2 rounded-xl bg-white border border-amber-200 font-bold"
            >
              {POS_PARTNERS.map((p) => (
                <option key={p.key} value={p.key}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">Fecha</label>
            <input
              type="date"
              required
              value={manualForm.businessDate}
              onChange={(e) => setManualForm((p) => ({ ...p, businessDate: e.target.value }))}
              className="w-full px-3 py-2 rounded-xl bg-white border border-amber-200 font-bold"
            />
          </div>
          <div>
            <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">Horas</label>
            <input
              type="number"
              min="0"
              max="24"
              value={manualForm.hours}
              onChange={(e) => setManualForm((p) => ({ ...p, hours: e.target.value }))}
              className="w-full px-3 py-2 rounded-xl bg-white border border-amber-200 font-mono font-bold"
            />
          </div>
          <div>
            <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">Minutos</label>
            <input
              type="number"
              min="0"
              max="59"
              value={manualForm.minutes}
              onChange={(e) => setManualForm((p) => ({ ...p, minutes: e.target.value }))}
              className="w-full px-3 py-2 rounded-xl bg-white border border-amber-200 font-mono font-bold"
            />
          </div>
          <div>
            <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">Motivo / Nota</label>
            <input
              type="text"
              placeholder="Ej: Turno sábado tarde"
              value={manualForm.notes}
              onChange={(e) => setManualForm((p) => ({ ...p, notes: e.target.value }))}
              className="w-full px-3 py-2 rounded-xl bg-white border border-amber-200 font-semibold"
            />
          </div>
          <div className="flex items-center gap-1.5">
            <button
              type="submit"
              disabled={isSavingManual}
              className="flex-1 py-2 rounded-xl bg-[#D97706] hover:bg-[#B45309] text-white font-extrabold cursor-pointer disabled:opacity-50"
            >
              Guardar
            </button>
            <button
              type="button"
              onClick={() => setShowManualForm(false)}
              className="p-2 rounded-xl bg-white border border-amber-200 text-slate-500 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </form>
      )}

      {/* KPIs del Pozo Mensual POS + Tarjetas de los 2 Socios */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Card Pozo Mensual POS */}
        <div className="bg-[#111827] text-white rounded-3xl p-5 flex flex-col justify-between gap-4">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300">Pozo Utilidad Neta POS</span>
              <span className="px-2.5 py-0.5 rounded-full bg-white/10 text-[#F5BA13] text-[10px] font-extrabold">
                {splitData.posOrdersCount} ventas físicas
              </span>
            </div>
            <div className="text-3xl font-black tracking-tight tabular-nums mt-2">
              {formatCLP(splitData.totalPosNetProfit)}
            </div>
            <div className="text-[11px] text-slate-400 mt-1 tabular-nums">
              {splitData.hasRecordedHours
                ? `Total trabajado: ${formatMinutesToHoursLabel(splitData.totalMinutes)} (${formatCLP(splitData.profitPerHour)}/hora)`
                : 'Sin horas registradas en el período (reparto referencial 50/50)'}
            </div>
          </div>

          <div className="space-y-1 pt-3 border-t border-white/10 text-[11px] text-slate-300">
            <div className="flex justify-between">
              <span>Ventas brutas POS:</span>
              <strong className="text-white tabular-nums">{formatCLP(splitData.totalPosSales)}</strong>
            </div>
            <div className="flex justify-between">
              <span>− Costo reposición (c/IVA):</span>
              <span className="text-rose-300 tabular-nums">-{formatCLP(splitData.totalPosCogs)}</span>
            </div>
            <div className="flex justify-between">
              <span>− Comisiones tarjeta/MP:</span>
              <span className="text-amber-300 tabular-nums">-{formatCLP(splitData.totalPosPaymentFees)}</span>
            </div>
          </div>
        </div>

        {/* Tarjetas Ignacio y Alamiro */}
        {[splitData.ignacio, splitData.alamiro].map((partner) => (
          <div
            key={partner.key}
            className="bg-white border border-[#EAECEF] rounded-3xl p-5 flex flex-col justify-between gap-4"
          >
            <div>
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full bg-[#FEF3C7] border border-[#FDE68A] text-[#D97706] font-black text-sm flex items-center justify-center">
                    {partner.name.charAt(0)}
                  </div>
                  <div>
                    <div className="text-sm font-extrabold text-[#111827]">{partner.name}</div>
                    <div className="text-[11px] text-slate-400 font-semibold">
                      {partner.shiftsCount} turno(s) · {partner.salesCount} venta(s) atendidas
                    </div>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-[#FEF3C7] text-[#92400E] text-xs font-black tabular-nums">
                  {partner.sharePercent}%
                </span>
              </div>

              <div className="mt-4 flex items-baseline justify-between">
                <div>
                  <div className="text-[10px] font-bold uppercase text-slate-400">Ganancia POS del mes</div>
                  <div className="text-2xl font-black text-emerald-700 tabular-nums">
                    {formatCLP(partner.profitShare)}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] font-bold uppercase text-slate-400">Horas acumuladas</div>
                  <div className="text-lg font-black text-[#111827] tabular-nums flex items-center justify-end gap-1">
                    <Clock className="w-4 h-4 text-[#D97706]" />
                    <span>{partner.hoursLabel}</span>
                  </div>
                </div>
              </div>

              {/* Barra visual de porcentaje */}
              <div className="mt-3 h-2 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full rounded-full bg-[#D97706] transition-all duration-300"
                  style={{ width: `${Math.min(100, Math.max(0, partner.sharePercent))}%` }}
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
              <span>Ventas directas en mostrador:</span>
              <strong className="text-[#111827] tabular-nums">{formatCLP(partner.salesAmount)}</strong>
            </div>
          </div>
        ))}
      </div>

      {/* DETALLE DÍA POR DÍA DE HORAS TRABAJADAS Y VENTAS POS */}
      <div className="bg-white border border-[#EAECEF] rounded-3xl overflow-hidden">
        <div className="p-5 border-b border-[#EAECEF] flex flex-wrap items-center justify-between gap-2">
          <div>
            <h4 className="text-sm font-black text-[#111827] flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#D97706]" />
              <span>Detalle Diario de Horas Trabajadas y Rendimiento POS</span>
            </h4>
            <p className="text-[11px] text-slate-500">
              Horas trabajadas por cada socio día por día junto con las ventas y utilidad física de cada jornada.
            </p>
          </div>
          <span className="px-3 py-1 rounded-full bg-[#F8FAFC] border border-[#EAECEF] text-[11px] font-bold text-slate-600 tabular-nums">
            {splitData.dailyBreakdown.length} jornada(s) con actividad
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F8FAFC] text-slate-500 text-[11px] font-bold border-b border-[#EAECEF]">
              <tr>
                <th className="py-3 px-4">Día</th>
                <th className="py-3 px-4">Horas Ignacio</th>
                <th className="py-3 px-4">Horas Alamiro</th>
                <th className="py-3 px-4">Total Día</th>
                <th className="py-3 px-4 text-center">Ventas POS</th>
                <th className="py-3 px-4 text-right">Ventas Brutas</th>
                <th className="py-3 px-4 text-right">Utilidad Neta Día</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EAECEF]">
              {splitData.dailyBreakdown.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-400 font-semibold">
                    Aún no hay horas ni ventas POS registradas en este período.
                  </td>
                </tr>
              ) : (
                splitData.dailyBreakdown.map((day) => (
                  <tr key={day.date} className="hover:bg-[#F8FAFC] transition-colors">
                    <td className="py-3 px-4 font-bold text-[#111827] capitalize whitespace-nowrap">
                      {formatIsoDayLabel(day.date)}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-[#111827] tabular-nums">
                      {day.ignacioMinutes > 0 ? (
                        <span className="px-2.5 py-1 rounded-full bg-[#FEF3C7]/70 text-[#92400E]">
                          {formatMinutesToHoursLabel(day.ignacioMinutes)}
                        </span>
                      ) : (
                        <span className="text-slate-300">0m</span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-[#111827] tabular-nums">
                      {day.alamiroMinutes > 0 ? (
                        <span className="px-2.5 py-1 rounded-full bg-sky-50 text-sky-800 border border-sky-200/70">
                          {formatMinutesToHoursLabel(day.alamiroMinutes)}
                        </span>
                      ) : (
                        <span className="text-slate-300">0m</span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-mono font-black text-[#111827] tabular-nums">
                      {formatMinutesToHoursLabel(day.totalMinutes)}
                    </td>
                    <td className="py-3 px-4 text-center font-bold text-slate-600 tabular-nums">
                      {day.salesCount}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-[#111827] tabular-nums">
                      {formatCLP(day.grossSales)}
                    </td>
                    <td className="py-3 px-4 text-right font-black text-emerald-700 tabular-nums">
                      {formatCLP(day.netProfit)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* BITÁCORA INDIVIDUAL DE TURNOS (CON EDICIÓN AUDITADA) */}
      <div className="bg-white border border-[#EAECEF] rounded-3xl overflow-hidden">
        <div className="p-5 border-b border-[#EAECEF] flex items-center justify-between">
          <div>
            <h4 className="text-sm font-black text-[#111827] flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#D97706]" />
              <span>Bitácora Detallada de Turnos ({splitData.shifts.length})</span>
            </h4>
            <p className="text-[11px] text-slate-500">
              Registro exacto de inicio, término/relevo y duración de cada turno. Puedes corregir minutos si olvidaste cerrar un turno a tiempo.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F8FAFC] text-slate-500 text-[11px] font-bold border-b border-[#EAECEF]">
              <tr>
                <th className="py-3 px-4">Fecha</th>
                <th className="py-3 px-4">Socio</th>
                <th className="py-3 px-4">Horario</th>
                <th className="py-3 px-4">Duración</th>
                <th className="py-3 px-4">Nota</th>
                <th className="py-3 px-4 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EAECEF]">
              {splitData.shifts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400 font-semibold">
                    Sin turnos registrados en este período.
                  </td>
                </tr>
              ) : (
                splitData.shifts.map((sh) => {
                  const mins = computeShiftDurationMinutes(sh);
                  const isEditing = editingShiftId === sh.id;
                  return (
                    <tr key={sh.id} className="hover:bg-[#F8FAFC]">
                      <td className="py-3 px-4 font-semibold text-slate-700 whitespace-nowrap">
                        {formatIsoDayLabel(sh.business_date || String(sh.started_at || '').slice(0, 10))}
                      </td>
                      <td className="py-3 px-4 font-extrabold text-[#111827]">{sh.partner_name}</td>
                      <td className="py-3 px-4 font-mono text-slate-600 whitespace-nowrap">
                        {formatShiftTime(sh.started_at)} → {formatShiftTime(sh.ended_at)}
                      </td>
                      <td className="py-3 px-4">
                        {isEditing ? (
                          <div className="flex items-center gap-1.5">
                            <input
                              type="number"
                              min="1"
                              value={editMinutesInput}
                              onChange={(e) => setEditMinutesInput(e.target.value)}
                              className="w-20 px-2 py-1 rounded-lg border border-[#D97706] font-mono font-bold text-xs"
                            />
                            <span className="text-[10px] text-slate-500">min</span>
                          </div>
                        ) : (
                          <span className="font-mono font-black text-[#D97706] tabular-nums">
                            {formatMinutesToHoursLabel(mins)}{' '}
                            {sh.status === 'activo' && (
                              <span className="ml-1 px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[9px] font-extrabold">
                                EN VIVO
                              </span>
                            )}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-slate-500 max-w-[260px] truncate">
                        {isEditing ? (
                          <input
                            type="text"
                            value={editNotesInput}
                            onChange={(e) => setEditNotesInput(e.target.value)}
                            className="w-full px-2 py-1 rounded-lg border border-slate-300 text-xs"
                            placeholder="Motivo del ajuste"
                          />
                        ) : (
                          sh.notes || '-'
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {isEditing ? (
                          <div className="inline-flex items-center gap-1">
                            <button
                              type="button"
                              onClick={async () => {
                                const ok = await onUpdateShiftDuration?.(sh.id, {
                                  durationMinutes: Number(editMinutesInput) || mins,
                                  notes: editNotesInput,
                                });
                                if (ok) setEditingShiftId(null);
                              }}
                              className="p-1.5 rounded-lg bg-emerald-600 text-white cursor-pointer"
                              title="Guardar ajuste"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingShiftId(null)}
                              className="p-1.5 rounded-lg bg-slate-200 text-slate-700 cursor-pointer"
                              title="Cancelar"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          sh.status === 'cerrado' && (
                            <button
                              type="button"
                              onClick={() => {
                                setEditingShiftId(sh.id);
                                setEditMinutesInput(String(mins));
                                setEditNotesInput(sh.notes || '');
                              }}
                              className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-500 cursor-pointer"
                              title="Ajustar duración del turno"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                          )
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
