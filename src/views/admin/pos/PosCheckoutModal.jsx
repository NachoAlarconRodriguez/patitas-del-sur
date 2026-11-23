import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  Banknote,
  CreditCard,
  Landmark,
  Smartphone,
  Split,
  Plus,
  Trash2,
  CheckCircle2,
  Printer,
  RotateCcw,
  Loader2,
  AlertTriangle,
  Award,
  Receipt,
  Check,
} from 'lucide-react';
import { formatCLP } from '../adminUtils.js';
import { POS_PAYMENT_METHODS } from '../../../services/posService.js';
import { printPosSaleTicket } from './PosTicketReceipt.jsx';

function getMethodIcon(methodId) {
  const s = String(methodId || '').toLowerCase();
  if (s.includes('efectivo')) return Banknote;
  if (s.includes('transferencia')) return Landmark;
  if (s.includes('dinero') || s.includes('qr')) return Smartphone;
  return CreditCard;
}

/**
 * Genera sugerencias inteligentes de billetes chilenos >= totalAmount
 * (ej. para $73.000 sugiere $75.000, $80.000, $90.000, $100.000 en vez de billetes menores inútiles)
 */
function getSmartCashSuggestions(totalAmount) {
  const safeTotal = Math.max(0, Math.round(Number(totalAmount) || 0));
  if (safeTotal <= 0) return [5000, 10000, 20000, 50000];

  const candidates = new Set();
  const roundUp = (step) => Math.ceil(safeTotal / step) * step;

  [1000, 2000, 5000, 10000, 20000, 50000].forEach((step) => {
    const val = roundUp(step);
    if (val > safeTotal) candidates.add(val);
  });

  // Agregar siguientes denominaciones limpias si faltan opciones
  const nextTenK = (Math.floor(safeTotal / 10000) + 1) * 10000;
  if (nextTenK > safeTotal) candidates.add(nextTenK);
  const nextTwentyK = (Math.floor(safeTotal / 20000) + 1) * 20000;
  if (nextTwentyK > safeTotal) candidates.add(nextTwentyK);
  const nextFiftyK = (Math.floor(safeTotal / 50000) + 1) * 50000;
  if (nextFiftyK > safeTotal) candidates.add(nextFiftyK);

  return Array.from(candidates)
    .sort((a, b) => a - b)
    .slice(0, 4);
}

/**
 * Modal de Cobro del Terminal POS (Diseño horizontal moderno de 2 columnas · Sin scroll en escritorio):
 * - Columna izquierda: Selección de pago (único o dividido) + calculadora inteligente de efectivo/vuelto + nota opcional
 * - Columna derecha oscura: Total en vivo, desglose, vuelto destacado y CTA Confirmar Venta siempre a la vista
 */
export default function PosCheckoutModal({
  isOpen,
  totalAmount = 0,
  subtotal = 0,
  totalDiscount = 0,
  selectedCustomer = null,
  selectedRedeemTier = null,
  selectedExistingCoupon = null,
  sellerPartner,
  mercadoPagoConfig = {},
  ticketWidthMm = 80,
  onChangeTicketWidth,
  onConfirmSale,
  onClose,
  onStartNewSale,
}) {
  const [mode, setMode] = useState('single'); // 'single' | 'split'
  const [singleMethod, setSingleMethod] = useState('Efectivo');
  const [singleCashTendered, setSingleCashTendered] = useState('');

  const [splitLines, setSplitLines] = useState([]);
  const [saleNotes, setSaleNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [completedOrder, setCompletedOrder] = useState(null);

  useEffect(() => {
    if (isOpen) {
      setMode('single');
      setSingleMethod('Efectivo');
      setSingleCashTendered(totalAmount > 0 ? String(totalAmount) : '');
      setSplitLines([
        {
          id: 'pay-1',
          method: 'Efectivo',
          amount: Math.floor(totalAmount / 2),
          tendered: Math.floor(totalAmount / 2),
        },
        {
          id: 'pay-2',
          method: 'Tarjeta Débito POS',
          amount: totalAmount - Math.floor(totalAmount / 2),
          tendered: 0,
        },
      ]);
      setSaleNotes('');
      setErrorMsg('');
      setCompletedOrder(null);
      setIsSubmitting(false);
    }
  }, [isOpen, totalAmount]);

  useEffect(() => {
    if (!isOpen) return undefined;
    const onKeyDown = (e) => {
      if (e.key === 'Escape' && !isSubmitting && !completedOrder) {
        onClose?.();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, isSubmitting, completedOrder, onClose]);

  const debitRate = Number(mercadoPagoConfig.debitCardRatePercent ?? 2.19);
  const creditRate = Number(mercadoPagoConfig.creditCardRatePercent ?? 2.69);
  const addIva = mercadoPagoConfig.addIvaToCommission !== false;
  const ivaMult = addIva ? 1 + Number(mercadoPagoConfig.ivaPercent || 19) / 100 : 1;

  const methodsWithLiveRates = useMemo(
    () =>
      POS_PAYMENT_METHODS.map((m) => {
        let feeLabel = 'Sin comisión';
        let rateNum = 0;
        if (m.feeBucket === 'debit_mp') {
          rateNum = debitRate;
          feeLabel = `${debitRate}%${addIva ? ' + IVA' : ''}`;
        }
        if (m.feeBucket === 'credit') {
          rateNum = creditRate;
          feeLabel = `${creditRate}%${addIva ? ' + IVA' : ''}`;
        }
        return { ...m, feeLabel, rateNum };
      }),
    [debitRate, creditRate, addIva]
  );

  const smartCashSuggestions = useMemo(
    () => getSmartCashSuggestions(totalAmount),
    [totalAmount]
  );

  if (!isOpen) return null;

  // Cálculos pago único
  const singleIsCash = singleMethod === 'Efectivo';
  const activeSingleMethodObj =
    methodsWithLiveRates.find((m) => m.id === singleMethod) || methodsWithLiveRates[0];
  const parsedSingleTendered =
    singleCashTendered === '' ? 0 : Math.max(0, Number(singleCashTendered) || 0);
  const singleCashChange = singleIsCash ? Math.max(0, parsedSingleTendered - totalAmount) : 0;
  const singleCashShortfall = singleIsCash ? Math.max(0, totalAmount - parsedSingleTendered) : 0;
  const singleEstimatedFee =
    !singleIsCash && activeSingleMethodObj?.rateNum > 0
      ? Math.round(totalAmount * (activeSingleMethodObj.rateNum / 100) * ivaMult)
      : 0;

  // Cálculos pago dividido
  const splitCoveredTotal = splitLines.reduce(
    (acc, l) => acc + Math.max(0, Number(l.amount) || 0),
    0
  );
  const splitRemaining = totalAmount - splitCoveredTotal;
  const splitHasInvalidCash = splitLines.some((l) => {
    if (l.method !== 'Efectivo') return false;
    const amt = Math.max(0, Number(l.amount) || 0);
    const tend = Math.max(0, Number(l.tendered) || 0);
    return amt > 0 && tend < amt;
  });
  const splitTotalChange = splitLines.reduce((acc, l) => {
    if (l.method !== 'Efectivo') return acc;
    const amt = Math.max(0, Number(l.amount) || 0);
    const tend = Math.max(0, Number(l.tendered) || 0);
    return acc + Math.max(0, tend - amt);
  }, 0);
  const splitHasCashLine = splitLines.some(
    (l) => l.method === 'Efectivo' && (Number(l.amount) || 0) > 0
  );

  const displayChange = mode === 'single' ? singleCashChange : splitTotalChange;
  const showCashChangeCard = mode === 'single' ? singleIsCash : splitHasCashLine;

  const canSubmit =
    !isSubmitting &&
    (mode === 'single'
      ? !singleIsCash || parsedSingleTendered >= totalAmount
      : splitCoveredTotal === totalAmount &&
        splitLines.filter((l) => (Number(l.amount) || 0) > 0).length >= 1 &&
        !splitHasInvalidCash);

  const handleAddSplitLine = () => {
    const usedMethods = new Set(splitLines.map((l) => l.method));
    const nextMethod =
      methodsWithLiveRates.find((m) => !usedMethods.has(m.id))?.id || 'Transferencia';
    const rem = Math.max(0, splitRemaining);
    setSplitLines((prev) => [
      ...prev,
      {
        id: `pay-${Date.now()}`,
        method: nextMethod,
        amount: rem,
        tendered: nextMethod === 'Efectivo' ? rem : 0,
      },
    ]);
  };

  const handleConfirm = async () => {
    if (!canSubmit) return;
    setErrorMsg('');
    setIsSubmitting(true);

    const paymentLines =
      mode === 'single'
        ? [
            {
              method: singleMethod,
              amount: totalAmount,
              ...(singleIsCash
                ? { tendered: parsedSingleTendered, change: singleCashChange }
                : {}),
            },
          ]
        : splitLines
            .filter((l) => (Number(l.amount) || 0) > 0)
            .map((l) => {
              const amt = Math.round(Number(l.amount) || 0);
              const isCash = l.method === 'Efectivo';
              const tend = isCash
                ? Math.max(amt, Math.round(Number(l.tendered) || amt))
                : amt;
              return {
                method: l.method,
                amount: amt,
                ...(isCash ? { tendered: tend, change: Math.max(0, tend - amt) } : {}),
              };
            });

    try {
      const res = await onConfirmSale?.({ paymentLines, notes: saleNotes });
      if (res?.success && res.order) {
        setCompletedOrder(res.order);
      } else {
        setErrorMsg(res?.error || 'No se pudo completar la venta.');
      }
    } catch (err) {
      setErrorMsg(err?.message || 'Error inesperado al registrar la venta.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Separación equilibrada de 5 métodos (2 principales arriba + 3 abajo, sin huecos vacíos)
  const primaryMethods = methodsWithLiveRates.slice(0, 2);
  const secondaryMethods = methodsWithLiveRates.slice(2);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Cobrar venta POS"
      onClick={() => {
        if (!isSubmitting && !completedOrder) onClose?.();
      }}
      className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150"
    >
      {/* =================================================================== */}
      {/* ESTADO 2: VENTA COMPLETADA (HORIZONTAL COMPACTO SIN SCROLL)         */}
      {/* =================================================================== */}
      {completedOrder ? (
        <div
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-[28px] max-w-2xl w-full border border-slate-200/80 shadow-[0_24px_70px_-16px_rgba(15,23,42,0.35)] overflow-hidden animate-in zoom-in-95 duration-150"
        >
          <div className="p-6 sm:p-7 space-y-5">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-[#111827] tracking-tight">
                    Venta registrada con éxito
                  </h3>
                  <p className="text-xs text-slate-500 font-semibold mt-0.5">
                    Comprobante{' '}
                    <span className="font-mono font-bold text-[#D97706]">{completedOrder.id}</span> ·
                    Atendido por <strong>{completedOrder.soldByName}</strong>
                  </p>
                </div>
              </div>

              {/* Selector ancho ticket térmico */}
              <div className="inline-flex items-center gap-1 p-1 rounded-full bg-[#F8FAFC] border border-[#EAECEF]">
                {[80, 58].map((mm) => (
                  <button
                    key={mm}
                    type="button"
                    onClick={() => onChangeTicketWidth?.(mm)}
                    className={`px-3 py-1 rounded-full text-[11px] font-extrabold transition-colors cursor-pointer ${
                      ticketWidthMm === mm
                        ? 'bg-[#111827] text-white'
                        : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    {mm} mm
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3.5">
              <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-[#EAECEF]">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Total cobrado
                </div>
                <div className="text-3xl font-black text-[#111827] tabular-nums tracking-tight mt-1">
                  {formatCLP(completedOrder.total)}
                </div>
                <div className="text-xs text-slate-500 font-semibold mt-1 truncate">
                  {completedOrder.paymentMethod}
                </div>
              </div>

              <div
                className={`p-4 rounded-2xl border ${
                  (completedOrder.cashChange || 0) > 0
                    ? 'bg-emerald-50 border-emerald-200'
                    : 'bg-[#F8FAFC] border-[#EAECEF]'
                }`}
              >
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Vuelto a entregar
                </div>
                <div
                  className={`text-3xl font-black tabular-nums tracking-tight mt-1 ${
                    (completedOrder.cashChange || 0) > 0 ? 'text-emerald-700' : 'text-slate-400'
                  }`}
                >
                  {formatCLP(completedOrder.cashChange || 0)}
                </div>
                <div className="text-xs text-slate-500 font-semibold mt-1 tabular-nums">
                  {(completedOrder.cashTendered || 0) > 0
                    ? `Pagó con ${formatCLP(completedOrder.cashTendered)}`
                    : 'Sin vuelto en efectivo'}
                </div>
              </div>
            </div>

            {(completedOrder.pointsEarned > 0 || completedOrder.pointsSpent > 0) && (
              <div className="p-3.5 rounded-2xl bg-[#FAF8F4] border border-[#FDE68A] flex items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2 font-bold text-[#92400E]">
                  <Award className="w-4 h-4 text-[#D97706]" />
                  <span>Club Patitas · {completedOrder.customerName}</span>
                </div>
                <div className="font-black text-[#111827] tabular-nums">
                  {completedOrder.pointsSpent > 0 && (
                    <span className="text-rose-600 mr-2">-{completedOrder.pointsSpent} pts</span>
                  )}
                  {completedOrder.pointsEarned > 0 && (
                    <span className="text-emerald-700 mr-2">+{completedOrder.pointsEarned} pts</span>
                  )}
                  <span className="text-slate-500 font-semibold">
                    Saldo: {completedOrder.newCustomerPoints} pts
                  </span>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 pt-1">
              <button
                type="button"
                onClick={() => printPosSaleTicket(completedOrder, ticketWidthMm)}
                className="py-3.5 rounded-2xl bg-[#111827] hover:bg-slate-800 text-white font-extrabold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <Printer className="w-4 h-4 text-[#F5BA13]" />
                <span>Imprimir Ticket ({ticketWidthMm} mm)</span>
              </button>

              <button
                type="button"
                onClick={() => onStartNewSale?.()}
                className="py-3.5 rounded-2xl bg-[#D97706] hover:bg-[#B45309] text-white font-black text-xs flex items-center justify-center gap-2 shadow-md shadow-[#D97706]/25 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Nueva Venta</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* =================================================================== */
        /* ESTADO 1: COBRO MODERNO 2 COLUMNAS (ANCHO · CERO SCROLL)            */
        /* =================================================================== */
        <div
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-[28px] max-w-4xl w-full border border-slate-200/80 shadow-[0_28px_80px_-16px_rgba(15,23,42,0.4)] overflow-hidden grid grid-cols-1 lg:grid-cols-12 animate-in zoom-in-95 duration-150"
        >
          {/* COLUMNA IZQUIERDA (7 cols): MEDIOS DE PAGO + EFECTIVO/VUELTO + NOTA */}
          <div className="lg:col-span-7 p-6 sm:p-7 flex flex-col justify-between gap-5 bg-white">
            <div className="space-y-5">
              {/* Header + Selector Pago Único / Dividido */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-lg font-black text-[#111827] tracking-tight leading-tight">
                    Finalizar y cobrar venta
                  </h3>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    {sellerPartner?.name} ·{' '}
                    <span className="text-slate-700 font-semibold">
                      {selectedCustomer
                        ? selectedCustomer.full_name || selectedCustomer.name
                        : 'Cliente de paso'}
                    </span>
                  </p>
                </div>

                {/* Segmented Toggle */}
                <div className="inline-flex items-center p-1 rounded-full bg-[#F4F5F7] border border-[#EAECEF]">
                  <button
                    type="button"
                    onClick={() => setMode('single')}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-extrabold transition-all cursor-pointer ${
                      mode === 'single'
                        ? 'bg-white text-[#111827] shadow-xs'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Pago único
                  </button>
                  <button
                    type="button"
                    onClick={() => setMode('split')}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-extrabold flex items-center gap-1.5 transition-all cursor-pointer ${
                      mode === 'split'
                        ? 'bg-white text-[#111827] shadow-xs'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <Split className="w-3.5 h-3.5 text-[#D97706]" />
                    <span>Pago dividido</span>
                  </button>
                </div>
              </div>

              {errorMsg && (
                <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* MODO 1: PAGO ÚNICO */}
              {mode === 'single' ? (
                <div className="space-y-4">
                  {/* Fila superior (2 principales) + Fila inferior (3 secundarios) sin espacios vacíos */}
                  <div className="space-y-2.5">
                    <div className="grid grid-cols-2 gap-2.5">
                      {primaryMethods.map((m) => {
                        const Icon = getMethodIcon(m.id);
                        const isSel = singleMethod === m.id;
                        return (
                          <button
                            key={m.id}
                            type="button"
                            onClick={() => {
                              setSingleMethod(m.id);
                              if (
                                m.isCash &&
                                (!singleCashTendered || Number(singleCashTendered) < totalAmount)
                              ) {
                                setSingleCashTendered(String(totalAmount));
                              }
                            }}
                            className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex items-center gap-3 ${
                              isSel
                                ? 'bg-[#FAF8F4] border-[#D97706] shadow-xs'
                                : 'bg-[#F8FAFC]/70 border-[#EAECEF] hover:bg-[#F8FAFC] hover:border-slate-300'
                            }`}
                          >
                            <div
                              className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                                isSel
                                  ? 'bg-[#D97706] text-white'
                                  : 'bg-white border border-[#EAECEF] text-slate-600'
                              }`}
                            >
                              <Icon className="w-4 h-4" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="text-xs font-extrabold text-[#111827] truncate">
                                {m.shortLabel}
                              </div>
                              <div className="text-[11px] text-slate-500 font-medium">
                                {m.feeLabel}
                              </div>
                            </div>
                            {isSel && (
                              <span className="w-5 h-5 rounded-full bg-[#D97706] text-white flex items-center justify-center shrink-0">
                                <Check className="w-3 h-3 stroke-[3]" />
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>

                    <div className="grid grid-cols-3 gap-2.5">
                      {secondaryMethods.map((m) => {
                        const Icon = getMethodIcon(m.id);
                        const isSel = singleMethod === m.id;
                        return (
                          <button
                            key={m.id}
                            type="button"
                            onClick={() => setSingleMethod(m.id)}
                            className={`p-3 rounded-2xl border text-left transition-all cursor-pointer space-y-2 ${
                              isSel
                                ? 'bg-[#FAF8F4] border-[#D97706] shadow-xs'
                                : 'bg-[#F8FAFC]/70 border-[#EAECEF] hover:bg-[#F8FAFC] hover:border-slate-300'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div
                                className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors ${
                                  isSel
                                    ? 'bg-[#D97706] text-white'
                                    : 'bg-white border border-[#EAECEF] text-slate-600'
                                }`}
                              >
                                <Icon className="w-4 h-4" />
                              </div>
                              {isSel && (
                                <span className="w-4 h-4 rounded-full bg-[#D97706] text-white flex items-center justify-center">
                                  <Check className="w-2.5 h-2.5 stroke-[3]" />
                                </span>
                              )}
                            </div>
                            <div>
                              <div className="text-xs font-extrabold text-[#111827] leading-tight truncate">
                                {m.shortLabel}
                              </div>
                              <div className="text-[10px] text-slate-500 font-medium mt-0.5">
                                {m.feeLabel}
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Bloque contextual: Efectivo & Vuelto vs. Resumen método digital */}
                  {singleIsCash ? (
                    <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-[#EAECEF] space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <label
                          htmlFor="pos-cash-tendered-input"
                          className="text-xs font-extrabold text-[#111827]"
                        >
                          ¿Con cuánto paga el cliente?
                        </label>
                        <button
                          type="button"
                          onClick={() => setSingleCashTendered(String(totalAmount))}
                          className="px-2.5 py-1 rounded-full bg-white border border-[#EAECEF] hover:border-[#D97706] text-[#111827] text-[11px] font-bold transition-colors cursor-pointer"
                        >
                          Exacto ({formatCLP(totalAmount)})
                        </button>
                      </div>

                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-bold text-slate-400">
                          $
                        </span>
                        <input
                          id="pos-cash-tendered-input"
                          type="number"
                          min="0"
                          step="10"
                          autoFocus
                          value={singleCashTendered}
                          onChange={(e) => setSingleCashTendered(e.target.value)}
                          placeholder="0"
                          className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white border border-slate-300 focus:border-[#D97706] focus:ring-2 focus:ring-[#D97706]/15 text-2xl font-mono font-black text-[#111827] focus:outline-none tabular-nums"
                        />
                      </div>

                      {/* Sugerencias inteligentes >= total + sumadores rápidos */}
                      <div className="flex flex-wrap items-center gap-1.5">
                        {smartCashSuggestions.map((bill) => (
                          <button
                            key={bill}
                            type="button"
                            onClick={() => setSingleCashTendered(String(bill))}
                            className={`px-3 py-1 rounded-full text-[11px] font-mono font-extrabold border transition-colors cursor-pointer ${
                              parsedSingleTendered === bill
                                ? 'bg-[#111827] text-white border-[#111827]'
                                : 'bg-white text-slate-700 border-[#EAECEF] hover:border-[#D97706]'
                            }`}
                          >
                            {formatCLP(bill)}
                          </button>
                        ))}
                        <span className="text-slate-300 mx-0.5">|</span>
                        {[5000, 10000, 20000].map((inc) => (
                          <button
                            key={`inc-${inc}`}
                            type="button"
                            onClick={() =>
                              setSingleCashTendered(String(parsedSingleTendered + inc))
                            }
                            className="px-2.5 py-1 rounded-full bg-[#FEF3C7]/70 hover:bg-[#FEF3C7] text-[#92400E] text-[10px] font-mono font-extrabold cursor-pointer transition-colors"
                          >
                            +{formatCLP(inc)}
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-[#EAECEF] flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-white border border-[#EAECEF] flex items-center justify-center text-[#D97706] shrink-0">
                          <Receipt className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-extrabold text-[#111827]">
                            Cobro directo con {activeSingleMethodObj?.label}
                          </div>
                          <div className="text-[11px] text-slate-500 font-medium">
                            {singleEstimatedFee > 0
                              ? `Comisión estimada (${activeSingleMethodObj.feeLabel}): -${formatCLP(singleEstimatedFee)} · Recibes ${formatCLP(totalAmount - singleEstimatedFee)}`
                              : 'Sin comisión bancaria · Recibes el 100% del monto cobrado'}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* MODO 2: PAGO DIVIDIDO */
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-[#111827]">
                      Distribución del pago ({splitLines.length} medios)
                    </span>
                    <button
                      type="button"
                      onClick={handleAddSplitLine}
                      className="px-3 py-1 rounded-full bg-[#FAF8F4] hover:bg-[#FEF3C7] border border-[#FDE68A] text-[#92400E] text-[11px] font-extrabold flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Agregar medio</span>
                    </button>
                  </div>

                  <div className="space-y-2 max-h-[235px] overflow-y-auto pr-1">
                    {splitLines.map((line, idx) => {
                      const isCash = line.method === 'Efectivo';
                      const amt = Math.max(0, Number(line.amount) || 0);
                      const tend = Math.max(0, Number(line.tendered) || 0);
                      const lineChange = isCash ? Math.max(0, tend - amt) : 0;

                      return (
                        <div
                          key={line.id}
                          className="p-3 rounded-2xl bg-[#F8FAFC] border border-[#EAECEF] space-y-2"
                        >
                          <div className="flex items-center gap-2">
                            <select
                              value={line.method}
                              onChange={(e) => {
                                const nextM = e.target.value;
                                setSplitLines((prev) =>
                                  prev.map((item) =>
                                    item.id === line.id
                                      ? {
                                          ...item,
                                          method: nextM,
                                          tendered:
                                            nextM === 'Efectivo'
                                              ? Math.max(
                                                  Number(item.amount) || 0,
                                                  Number(item.tendered) || 0
                                                )
                                              : 0,
                                        }
                                      : item
                                  )
                                );
                              }}
                              className="flex-1 px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-[#111827] focus:outline-none focus:border-[#D97706]"
                            >
                              {methodsWithLiveRates.map((m) => (
                                <option key={m.id} value={m.id}>
                                  {m.label} ({m.feeLabel})
                                </option>
                              ))}
                            </select>

                            <div className="relative w-32">
                              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                                $
                              </span>
                              <input
                                type="number"
                                min="0"
                                step="10"
                                value={line.amount}
                                onChange={(e) => {
                                  const nextAmt = Math.max(0, Number(e.target.value) || 0);
                                  setSplitLines((prev) =>
                                    prev.map((item) =>
                                      item.id === line.id
                                        ? {
                                            ...item,
                                            amount: nextAmt,
                                            tendered:
                                              item.method === 'Efectivo' &&
                                              (Number(item.tendered) || 0) < nextAmt
                                                ? nextAmt
                                                : item.tendered,
                                          }
                                        : item
                                    )
                                  );
                                }}
                                className="w-full pl-6 pr-2.5 py-2 rounded-xl bg-white border border-slate-200 text-xs font-mono font-black text-right text-[#111827] focus:outline-none focus:border-[#D97706]"
                              />
                            </div>

                            {splitLines.length > 1 && (
                              <button
                                type="button"
                                onClick={() =>
                                  setSplitLines((prev) => prev.filter((item) => item.id !== line.id))
                                }
                                className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                                title={`Quitar pago ${idx + 1}`}
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>

                          {isCash && (
                            <div className="pt-2 border-t border-slate-200/70 flex flex-wrap items-center justify-between gap-2 text-[11px]">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-slate-600">Recibido efectivo:</span>
                                <input
                                  type="number"
                                  min="0"
                                  step="10"
                                  value={line.tendered}
                                  onChange={(e) => {
                                    const val = Math.max(0, Number(e.target.value) || 0);
                                    setSplitLines((prev) =>
                                      prev.map((item) =>
                                        item.id === line.id ? { ...item, tendered: val } : item
                                      )
                                    );
                                  }}
                                  className="w-28 px-2.5 py-1 rounded-lg bg-white border border-slate-300 font-mono font-black text-right text-[#111827] focus:outline-none focus:border-[#D97706]"
                                />
                              </div>
                              <div className="font-extrabold tabular-nums">
                                {tend < amt ? (
                                  <span className="text-rose-600">
                                    Falta {formatCLP(amt - tend)}
                                  </span>
                                ) : (
                                  <span className="text-emerald-700">
                                    Vuelto: {formatCLP(lineChange)}
                                  </span>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {splitRemaining !== 0 && (
                    <div className="p-2.5 px-3.5 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-between text-xs font-bold text-amber-900">
                      <span>
                        {splitRemaining > 0
                          ? `Faltan ${formatCLP(splitRemaining)} por asignar`
                          : `Excede el total por ${formatCLP(Math.abs(splitRemaining))}`}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setSplitLines((prev) => {
                            if (prev.length === 0) return prev;
                            const last = prev[prev.length - 1];
                            const nextAmt = Math.max(0, (Number(last.amount) || 0) + splitRemaining);
                            return prev.map((item, i) =>
                              i === prev.length - 1
                                ? {
                                    ...item,
                                    amount: nextAmt,
                                    tendered:
                                      item.method === 'Efectivo'
                                        ? Math.max(nextAmt, Number(item.tendered) || 0)
                                        : item.tendered,
                                  }
                                : item
                            );
                          });
                        }}
                        className="px-2.5 py-1 rounded-lg bg-white border border-amber-300 text-amber-950 text-[11px] font-extrabold cursor-pointer hover:bg-amber-100"
                      >
                        Ajustar último monto
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Observación compacta en una línea */}
            <div className="pt-2 border-t border-slate-100">
              <input
                type="text"
                value={saleNotes}
                onChange={(e) => setSaleNotes(e.target.value)}
                placeholder="Observación opcional (ej. N° boleta SII o comentario interno)..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8FAFC] border border-[#EAECEF] text-xs font-semibold text-[#111827] placeholder:text-slate-400 focus:bg-white focus:border-[#D97706] focus:outline-none"
              />
            </div>
          </div>

          {/* COLUMNA DERECHA (5 cols): RESUMEN OSCURO MODERNO + VUELTO + CTA SIEMPRE VISIBLE */}
          <div className="lg:col-span-5 bg-[#141518] text-white p-6 sm:p-7 flex flex-col justify-between gap-6 relative">
            {/* Botón cerrar arriba derecha */}
            <button
              type="button"
              disabled={isSubmitting}
              onClick={onClose}
              aria-label="Cerrar modal de cobro"
              className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/8 hover:bg-white/15 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="space-y-5">
              {/* Monto Total Hero */}
              <div className="pr-8">
                <span className="text-[11px] font-bold uppercase tracking-[0.08em] text-slate-400 block">
                  Total a cobrar
                </span>
                <div className="text-4xl font-black tracking-tight tabular-nums text-white mt-1">
                  {formatCLP(totalAmount)}
                </div>
              </div>

              {/* Desglose compacto */}
              <div className="space-y-2 py-4 border-y border-white/10 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Subtotal productos</span>
                  <span className="font-semibold text-slate-200 tabular-nums">
                    {formatCLP(subtotal)}
                  </span>
                </div>
                {totalDiscount > 0 && (
                  <div className="flex justify-between text-[#F5BA13]">
                    <span>
                      Descuento
                      {selectedRedeemTier
                        ? ` (${selectedRedeemTier.points} pts)`
                        : selectedExistingCoupon
                          ? ` (${selectedExistingCoupon.code})`
                          : ''}
                    </span>
                    <span className="font-bold tabular-nums">-{formatCLP(totalDiscount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-400 pt-1">
                  <span>Medio de pago</span>
                  <span className="font-bold text-white truncate max-w-[170px] text-right">
                    {mode === 'single'
                      ? activeSingleMethodObj?.shortLabel
                      : `Dividido (${splitLines.filter((l) => (Number(l.amount) || 0) > 0).length})`}
                  </span>
                </div>
              </div>

              {/* Indicador de Vuelto / Estado del cobro */}
              {showCashChangeCard ? (
                <div
                  className={`p-4 rounded-2xl border transition-colors ${
                    (mode === 'single' && singleCashShortfall > 0) ||
                    (mode === 'split' && splitHasInvalidCash)
                      ? 'bg-rose-500/15 border-rose-400/30'
                      : displayChange > 0
                        ? 'bg-emerald-500/15 border-emerald-400/30'
                        : 'bg-white/6 border-white/10'
                  }`}
                >
                  {mode === 'single' && singleCashShortfall > 0 ? (
                    <div className="space-y-0.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-rose-300">
                        Monto insuficiente
                      </span>
                      <div className="text-xl font-black text-rose-200 tabular-nums">
                        Faltan {formatCLP(singleCashShortfall)}
                      </div>
                    </div>
                  ) : mode === 'split' && splitHasInvalidCash ? (
                    <div className="text-xs font-bold text-rose-200">
                      Revisa el monto recibido en la línea de efectivo.
                    </div>
                  ) : (
                    <div className="flex items-baseline justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300 block">
                          Vuelto a entregar
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {displayChange > 0 ? 'Entregar al cliente' : 'Pago exacto'}
                        </span>
                      </div>
                      <span
                        className={`text-2xl font-black font-mono tabular-nums ${
                          displayChange > 0 ? 'text-emerald-300' : 'text-slate-300'
                        }`}
                      >
                        {formatCLP(displayChange)}
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-white/6 border border-white/10 text-xs text-slate-300">
                  <div className="font-bold text-white">Pago electrónico / transferencia</div>
                  <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                    Verifica la aprobación en la máquina POS o cuenta bancaria antes de confirmar la venta.
                  </p>
                </div>
              )}
            </div>

            {/* Botones de confirmación anclados abajo */}
            <div className="space-y-2.5">
              <button
                type="button"
                disabled={!canSubmit}
                onClick={handleConfirm}
                className="w-full py-3.5 px-5 rounded-2xl bg-[#D97706] hover:bg-[#F59E0B] text-white font-black text-sm shadow-lg shadow-[#D97706]/30 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99] disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Registrando venta...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Confirmar Venta · {formatCLP(totalAmount)}</span>
                  </>
                )}
              </button>

              <button
                type="button"
                disabled={isSubmitting}
                onClick={onClose}
                className="w-full py-2.5 rounded-xl bg-white/6 hover:bg-white/12 text-slate-300 hover:text-white text-xs font-bold transition-colors cursor-pointer"
              >
                Cancelar (Esc)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
