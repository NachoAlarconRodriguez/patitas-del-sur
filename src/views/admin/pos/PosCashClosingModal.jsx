import React, { useState, useEffect } from 'react';
import {
  X,
  Unlock,
  Wallet,
  ArrowDownUp,
  Calculator,
  CheckCircle2,
  AlertTriangle,
  Printer,
  Loader2,
  Clock,
} from 'lucide-react';
import { formatCLP } from '../adminUtils.js';
import {
  POS_PARTNERS,
  computeShiftDurationMinutes,
  formatMinutesToHoursLabel,
} from '../../../services/posService.js';
import { printPosCashClosingReport } from './PosTicketReceipt.jsx';

const CHILEAN_DENOMINATIONS = [20000, 10000, 5000, 2000, 1000, 500, 100];

/**
 * Modal 1: Apertura de Caja Diaria + Inicio de Turno de Socio
 */
export function PosOpenRegisterModal({
  isOpen,
  defaultPartnerKey = 'ignacio',
  onConfirmOpen,
  onClose,
}) {
  const [openingCash, setOpeningCash] = useState('50000');
  const [partnerKey, setPartnerKey] = useState(defaultPartnerKey);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setPartnerKey(defaultPartnerKey);
      setNotes('');
      setIsSubmitting(false);
    }
  }, [isOpen, defaultPartnerKey]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onConfirmOpen?.({
        openingCash: Math.max(0, Number(openingCash) || 0),
        partnerKey,
        notes,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={() => !isSubmitting && onClose?.()}
      className="fixed inset-0 z-50 bg-slate-900/65 backdrop-blur-xs flex items-center justify-center p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl max-w-md w-full border border-[#EAECEF] shadow-2xl overflow-hidden"
      >
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-[#FAF8F4]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#D97706] text-white flex items-center justify-center">
              <Unlock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-[#111827]">Apertura de Caja Diaria</h3>
              <p className="text-[11px] text-slate-500 font-medium">
                Inicia caja e inicia tu reloj de horas trabajadas
              </p>
            </div>
          </div>
          <button
            type="button"
            disabled={isSubmitting}
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-200/70 text-slate-500 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div>
            <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1.5">
              ¿Qué socio abre la caja hoy?
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              {POS_PARTNERS.map((p) => (
                <button
                  key={p.key}
                  type="button"
                  onClick={() => setPartnerKey(p.key)}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                    partnerKey === p.key
                      ? 'bg-[#FAF8F4] border-[#D97706] ring-2 ring-[#D97706]/20'
                      : 'bg-white border-[#EAECEF] hover:bg-slate-50'
                  }`}
                >
                  <div className="font-extrabold text-xs text-[#111827]">{p.name}</div>
                  <div className="text-[10px] text-slate-400 truncate">{p.email}</div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1.5">
              Fondo inicial de efectivo / sencillo ($ CLP)
            </label>
            <input
              type="number"
              min="0"
              step="100"
              required
              value={openingCash}
              onChange={(e) => setOpeningCash(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl bg-[#F8FAFC] border border-[#EAECEF] focus:bg-white focus:border-[#D97706] text-lg font-mono font-black text-[#111827] focus:outline-none"
            />
            <div className="flex flex-wrap gap-1.5 mt-2">
              {[0, 20000, 30000, 50000, 100000].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setOpeningCash(String(amt))}
                  className="px-2.5 py-1 rounded-full bg-slate-100 hover:bg-[#FEF3C7] text-slate-700 text-[10px] font-bold cursor-pointer"
                >
                  {formatCLP(amt)}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1.5">
              Notas de apertura (opcional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ej: Sencillo en monedas y billetes de $1.000 / $2.000"
              className="w-full px-3 py-2.5 rounded-xl bg-[#F8FAFC] border border-[#EAECEF] text-xs font-semibold focus:bg-white focus:border-[#D97706] focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl bg-[#D97706] hover:bg-[#B45309] text-white font-black shadow-md shadow-[#D97706]/25 flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Unlock className="w-4 h-4" />}
              <span>Abrir Caja e Iniciar Turno</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/**
 * Modal 2: Movimiento Manual de Efectivo (Ingreso de sencillo / Retiro de caja)
 */
export function PosCashMovementModal({ isOpen, onConfirmMovement, onClose }) {
  const [type, setType] = useState('retiro');
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setType('retiro');
      setAmount('');
      setReason('');
      setIsSubmitting(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onConfirmMovement?.({
        type,
        amount: Math.max(0, Number(amount) || 0),
        reason: reason.trim(),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={() => !isSubmitting && onClose?.()}
      className="fixed inset-0 z-50 bg-slate-900/65 backdrop-blur-xs flex items-center justify-center p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl max-w-md w-full border border-[#EAECEF] shadow-2xl overflow-hidden"
      >
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-[#FAF8F4]">
          <div className="flex items-center gap-2.5">
            <ArrowDownUp className="w-5 h-5 text-[#D97706]" />
            <h3 className="text-base font-black text-[#111827]">Movimiento de Efectivo en Caja</h3>
          </div>
          <button
            type="button"
            disabled={isSubmitting}
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-200/70 text-slate-500 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setType('ingreso')}
              className={`py-2.5 rounded-2xl border font-extrabold cursor-pointer ${
                type === 'ingreso'
                  ? 'bg-emerald-50 border-emerald-500 text-emerald-800'
                  : 'bg-white border-slate-200 text-slate-600'
              }`}
            >
              + Ingreso (Sencillo)
            </button>
            <button
              type="button"
              onClick={() => setType('retiro')}
              className={`py-2.5 rounded-2xl border font-extrabold cursor-pointer ${
                type === 'retiro'
                  ? 'bg-rose-50 border-rose-500 text-rose-800'
                  : 'bg-white border-slate-200 text-slate-600'
              }`}
            >
              − Retiro de Caja
            </button>
          </div>

          <div>
            <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">Monto ($ CLP)</label>
            <input
              type="number"
              min="10"
              step="10"
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Ej: 10000"
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8FAFC] border border-[#EAECEF] text-base font-mono font-black focus:bg-white focus:border-[#D97706] focus:outline-none"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">Motivo</label>
            <input
              type="text"
              required
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={type === 'ingreso' ? 'Ej: Aporte de sencillo para vueltos' : 'Ej: Retiro para depósito / compra insumos'}
              className="w-full px-3 py-2.5 rounded-xl bg-[#F8FAFC] border border-[#EAECEF] text-xs font-semibold focus:bg-white focus:border-[#D97706] focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-bold cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl bg-[#D97706] hover:bg-[#B45309] text-white font-black cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? 'Guardando...' : 'Registrar Movimiento'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/**
 * Modal 3: Cierre Diario de Caja + Arqueo Físico + Cierre de Turno + Reporte Z
 */
export function PosCloseRegisterModal({
  isOpen,
  activeRegister,
  reconciliation,
  registerShifts = [],
  ticketWidthMm = 80,
  onConfirmClose,
  onClose,
}) {
  const [countedCash, setCountedCash] = useState('');
  const [showDenomHelper, setShowDenomHelper] = useState(false);
  const [denomCounts, setDenomCounts] = useState({});
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [closedSummary, setClosedSummary] = useState(null);

  useEffect(() => {
    if (isOpen && reconciliation) {
      setCountedCash(String(reconciliation.expectedCash ?? 0));
      setDenomCounts({});
      setShowDenomHelper(false);
      setNotes('');
      setClosedSummary(null);
      setIsSubmitting(false);
    }
  }, [isOpen, reconciliation]);

  if (!isOpen || !activeRegister) return null;

  const expectedCash = Number(reconciliation?.expectedCash ?? 0);
  const parsedCounted = Math.max(0, Number(countedCash) || 0);
  const difference = parsedCounted - expectedCash;

  const updateDenom = (denom, qty) => {
    const next = { ...denomCounts, [denom]: Math.max(0, parseInt(qty, 10) || 0) };
    setDenomCounts(next);
    const total = CHILEAN_DENOMINATIONS.reduce((sum, d) => sum + d * (next[d] || 0), 0);
    setCountedCash(String(total));
  };

  const handleConfirm = async () => {
    setIsSubmitting(true);
    try {
      const res = await onConfirmClose?.({
        countedCash: parsedCounted,
        notes,
      });
      if (res?.success) {
        setClosedSummary(res);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={() => !isSubmitting && !closedSummary && onClose?.()}
      className="fixed inset-0 z-50 bg-slate-900/65 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl max-w-xl w-full border border-[#EAECEF] shadow-2xl overflow-hidden"
      >
        {closedSummary ? (
          <div className="p-6 space-y-5 text-center">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-xl font-black text-[#111827]">Caja diaria cerrada y turnos registrados</h3>
              <p className="text-xs text-slate-500 mt-1">
                {closedSummary.register?.id} · Diferencia de caja:{' '}
                <strong className={difference === 0 ? 'text-emerald-700' : 'text-amber-700'}>
                  {difference === 0 ? '$0 (Cuadrada)' : `${difference > 0 ? '+' : ''}${formatCLP(difference)}`}
                </strong>
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() =>
                  printPosCashClosingReport(
                    closedSummary.register,
                    closedSummary.reconciliation,
                    registerShifts,
                    ticketWidthMm
                  )
                }
                className="py-3 rounded-2xl bg-[#111827] hover:bg-slate-800 text-white text-xs font-extrabold flex items-center justify-center gap-2 cursor-pointer"
              >
                <Printer className="w-4 h-4 text-[#F5BA13]" />
                <span>Imprimir Cierre Z</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                className="py-3 rounded-2xl bg-[#D97706] hover:bg-[#B45309] text-white text-xs font-black cursor-pointer"
              >
                Listo
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-[#FAF8F4]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#111827] text-[#F5BA13] flex items-center justify-center">
                  <Wallet className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-[#111827]">Cierre Diario y Arqueo de Caja</h3>
                  <p className="text-[11px] text-slate-500 font-medium">
                    {activeRegister.id} · Cierra la caja y detiene el reloj de turno activo
                  </p>
                </div>
              </div>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={onClose}
                className="p-2 rounded-full hover:bg-slate-200/70 text-slate-500 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 sm:p-6 space-y-4 max-h-[78dvh] overflow-y-auto text-xs">
              {/* Desglose de ventas por medio de pago */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div className="p-3 rounded-2xl bg-emerald-50/70 border border-emerald-200">
                  <div className="text-[10px] font-bold text-emerald-700">Efectivo neto</div>
                  <div className="text-sm font-black text-emerald-950 tabular-nums mt-0.5">
                    {formatCLP(reconciliation?.cashSalesNet || 0)}
                  </div>
                </div>
                <div className="p-3 rounded-2xl bg-blue-50/70 border border-blue-200">
                  <div className="text-[10px] font-bold text-blue-700">Débito / MP</div>
                  <div className="text-sm font-black text-blue-950 tabular-nums mt-0.5">
                    {formatCLP(reconciliation?.debitMpSales || 0)}
                  </div>
                </div>
                <div className="p-3 rounded-2xl bg-indigo-50/70 border border-indigo-200">
                  <div className="text-[10px] font-bold text-indigo-700">Crédito POS</div>
                  <div className="text-sm font-black text-indigo-950 tabular-nums mt-0.5">
                    {formatCLP(reconciliation?.creditSales || 0)}
                  </div>
                </div>
                <div className="p-3 rounded-2xl bg-amber-50/70 border border-amber-200">
                  <div className="text-[10px] font-bold text-amber-800">Transferencia</div>
                  <div className="text-sm font-black text-amber-950 tabular-nums mt-0.5">
                    {formatCLP(reconciliation?.transferSales || 0)}
                  </div>
                </div>
              </div>

              {/* Fórmula de Arqueo de Efectivo */}
              <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-[#EAECEF] space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-500">Fondo inicial de caja:</span>
                  <strong className="tabular-nums">{formatCLP(reconciliation?.openingCash || 0)}</strong>
                </div>
                <div className="flex justify-between text-emerald-700">
                  <span>+ Ventas netas en efectivo ({reconciliation?.salesCount || 0} ventas totales):</span>
                  <strong className="tabular-nums">+{formatCLP(reconciliation?.cashSalesNet || 0)}</strong>
                </div>
                {(reconciliation?.cashInflows || 0) > 0 && (
                  <div className="flex justify-between text-emerald-700">
                    <span>+ Ingresos manuales de sencillo:</span>
                    <strong className="tabular-nums">+{formatCLP(reconciliation.cashInflows)}</strong>
                  </div>
                )}
                {(reconciliation?.cashOutflows || 0) > 0 && (
                  <div className="flex justify-between text-rose-600">
                    <span>− Retiros de efectivo registrados:</span>
                    <strong className="tabular-nums">-{formatCLP(reconciliation.cashOutflows)}</strong>
                  </div>
                )}
                <div className="flex justify-between pt-2 border-t border-slate-200 text-sm font-black text-[#111827]">
                  <span>Efectivo esperado en caja:</span>
                  <span className="tabular-nums">{formatCLP(expectedCash)}</span>
                </div>
              </div>

              {/* Conteo físico */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-bold uppercase text-slate-500">
                    Efectivo contado físicamente ($ CLP)
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowDenomHelper((p) => !p)}
                    className="text-[11px] font-bold text-[#D97706] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Calculator className="w-3.5 h-3.5" />
                    <span>{showDenomHelper ? 'Ocultar contador de billetes' : 'Contar por billetes'}</span>
                  </button>
                </div>

                <input
                  type="number"
                  min="0"
                  step="10"
                  value={countedCash}
                  onChange={(e) => setCountedCash(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-white border-2 border-[#EAECEF] focus:border-[#D97706] text-xl font-mono font-black text-[#111827] focus:outline-none tabular-nums"
                />

                {showDenomHelper && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-3 rounded-2xl bg-[#FAF8F4] border border-[#FDE68A]">
                    {CHILEAN_DENOMINATIONS.map((d) => (
                      <div key={d} className="flex items-center justify-between gap-1.5 bg-white px-2.5 py-1.5 rounded-xl border border-amber-100">
                        <span className="text-[11px] font-mono font-bold text-slate-700">{formatCLP(d)}</span>
                        <input
                          type="number"
                          min="0"
                          placeholder="0"
                          value={denomCounts[d] ?? ''}
                          onChange={(e) => updateDenom(d, e.target.value)}
                          className="w-12 text-right font-mono font-black text-xs border-b border-slate-200 focus:border-[#D97706] focus:outline-none"
                        />
                      </div>
                    ))}
                  </div>
                )}

                {/* Semáforo de Diferencia */}
                <div
                  className={`p-3 rounded-2xl border flex items-center justify-between font-extrabold ${
                    difference === 0
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                      : difference > 0
                        ? 'bg-amber-50 border-amber-200 text-amber-900'
                        : 'bg-rose-50 border-rose-200 text-rose-800'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {difference === 0 ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <AlertTriangle className="w-4 h-4" />
                    )}
                    <span>
                      {difference === 0
                        ? 'Caja cuadrada al peso'
                        : difference > 0
                          ? 'Sobrante en caja'
                          : 'Faltante en caja'}
                    </span>
                  </div>
                  <span className="font-mono text-sm tabular-nums">
                    {difference > 0 ? `+${formatCLP(difference)}` : formatCLP(difference)}
                  </span>
                </div>
              </div>

              {/* Resumen de turnos del día */}
              {registerShifts.length > 0 && (
                <div className="p-3.5 rounded-2xl bg-[#F8FAFC] border border-[#EAECEF] space-y-1.5">
                  <div className="text-[10px] font-extrabold uppercase text-slate-500 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-[#D97706]" />
                    <span>Horas trabajadas en esta caja</span>
                  </div>
                  {registerShifts.map((sh) => (
                    <div key={sh.id} className="flex items-center justify-between text-xs">
                      <span className="font-bold text-[#111827]">
                        {sh.partner_name}{' '}
                        {sh.status === 'activo' && (
                          <span className="text-[10px] text-emerald-700 font-semibold">(se cerrará ahora)</span>
                        )}
                      </span>
                      <span className="font-mono font-extrabold text-[#D97706] tabular-nums">
                        {formatMinutesToHoursLabel(computeShiftDurationMinutes(sh))}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              <div>
                <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">
                  Observaciones del cierre (opcional)
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ej: Todo cuadrado, voucher Transbank/MP archivado"
                  className="w-full px-3 py-2.5 rounded-xl bg-[#F8FAFC] border border-[#EAECEF] text-xs font-semibold focus:bg-white focus:border-[#D97706] focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleConfirm}
                  className="px-6 py-2.5 rounded-xl bg-[#111827] hover:bg-slate-800 text-white font-black flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wallet className="w-4 h-4 text-[#F5BA13]" />}
                  <span>Confirmar Cierre Diario</span>
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
