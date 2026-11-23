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
} from 'lucide-react';
import { formatCLP } from '../adminUtils.js';
import { POS_PAYMENT_METHODS } from '../../../services/posService.js';
import { printPosSaleTicket } from './PosTicketReceipt.jsx';

const QUICK_CASH_BILLS = [1000, 2000, 5000, 10000, 20000, 50000];

function getMethodIcon(methodId) {
  const s = String(methodId || '').toLowerCase();
  if (s.includes('efectivo')) return Banknote;
  if (s.includes('transferencia')) return Landmark;
  if (s.includes('dinero') || s.includes('qr')) return Smartphone;
  return CreditCard;
}

/**
 * Modal de Cobro del Terminal POS:
 * - Pago Único o Pago Dividido (Mixto) con todas las opciones:
 *   Efectivo, Tarjeta Débito (2,19%+IVA), Tarjeta Crédito (2,69%+IVA), Dinero MP/QR (2,19%+IVA), Transferencia (0%)
 * - Cálculo automático de vuelto cuando se paga en efectivo (tanto simple como en pago dividido)
 * - Confirmación post-venta con impresión de ticket 80mm/58mm
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
        { id: 'pay-1', method: 'Efectivo', amount: Math.floor(totalAmount / 2), tendered: Math.floor(totalAmount / 2) },
        { id: 'pay-2', method: 'Tarjeta Débito POS', amount: totalAmount - Math.floor(totalAmount / 2), tendered: 0 },
      ]);
      setSaleNotes('');
      setErrorMsg('');
      setCompletedOrder(null);
      setIsSubmitting(false);
    }
  }, [isOpen, totalAmount]);

  const debitRate = Number(mercadoPagoConfig.debitCardRatePercent ?? 2.19);
  const creditRate = Number(mercadoPagoConfig.creditCardRatePercent ?? 2.69);
  const addIva = mercadoPagoConfig.addIvaToCommission !== false;

  const methodsWithLiveRates = useMemo(
    () =>
      POS_PAYMENT_METHODS.map((m) => {
        let feeLabel = '0% comisión';
        if (m.feeBucket === 'debit_mp') feeLabel = `${debitRate}%${addIva ? ' + IVA' : ''}`;
        if (m.feeBucket === 'credit') feeLabel = `${creditRate}%${addIva ? ' + IVA' : ''}`;
        return { ...m, feeLabel };
      }),
    [debitRate, creditRate, addIva]
  );

  if (!isOpen) return null;

  // Cálculos pago simple
  const singleIsCash = singleMethod === 'Efectivo';
  const parsedSingleTendered = singleCashTendered === '' ? 0 : Math.max(0, Number(singleCashTendered) || 0);
  const singleCashChange = singleIsCash ? Math.max(0, parsedSingleTendered - totalAmount) : 0;
  const singleCashShortfall = singleIsCash ? Math.max(0, totalAmount - parsedSingleTendered) : 0;

  // Cálculos pago dividido
  const splitCoveredTotal = splitLines.reduce((acc, l) => acc + Math.max(0, Number(l.amount) || 0), 0);
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

  const canSubmit =
    !isSubmitting &&
    (mode === 'single'
      ? !singleIsCash || parsedSingleTendered >= totalAmount
      : splitCoveredTotal === totalAmount &&
        splitLines.filter((l) => (Number(l.amount) || 0) > 0).length >= 1 &&
        !splitHasInvalidCash);

  const handleAddSplitLine = () => {
    const usedMethods = new Set(splitLines.map((l) => l.method));
    const nextMethod = methodsWithLiveRates.find((m) => !usedMethods.has(m.id))?.id || 'Transferencia';
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
              ...(singleIsCash ? { tendered: parsedSingleTendered, change: singleCashChange } : {}),
            },
          ]
        : splitLines
            .filter((l) => (Number(l.amount) || 0) > 0)
            .map((l) => {
              const amt = Math.round(Number(l.amount) || 0);
              const isCash = l.method === 'Efectivo';
              const tend = isCash ? Math.max(amt, Math.round(Number(l.tendered) || amt)) : amt;
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

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Cobrar venta POS"
      onClick={() => {
        if (!isSubmitting && !completedOrder) onClose?.();
      }}
      className="fixed inset-0 z-50 bg-slate-900/65 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-150"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl max-w-xl w-full border border-[#EAECEF] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150"
      >
        {/* POST-VENTA EXITOSA */}
        {completedOrder ? (
          <div className="p-6 sm:p-7 space-y-5">
            <div className="text-center space-y-2">
              <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-black text-[#111827] tracking-tight">
                ¡Venta registrada con éxito!
              </h3>
              <p className="text-xs text-slate-500 font-semibold">
                Comprobante <span className="font-mono font-bold text-[#D97706]">{completedOrder.id}</span> · Atendido por{' '}
                <strong>{completedOrder.soldByName}</strong>
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-[#EAECEF]">
                <div className="text-[10px] font-bold uppercase text-slate-500">Total cobrado</div>
                <div className="text-2xl font-black text-[#111827] tabular-nums mt-0.5">
                  {formatCLP(completedOrder.total)}
                </div>
                <div className="text-[11px] text-slate-500 font-semibold mt-0.5 truncate">
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
                <div className="text-[10px] font-bold uppercase text-slate-500">Vuelto a entregar</div>
                <div
                  className={`text-2xl font-black tabular-nums mt-0.5 ${
                    (completedOrder.cashChange || 0) > 0 ? 'text-emerald-700' : 'text-slate-400'
                  }`}
                >
                  {formatCLP(completedOrder.cashChange || 0)}
                </div>
                {(completedOrder.cashTendered || 0) > 0 && (
                  <div className="text-[11px] text-slate-500 font-semibold mt-0.5 tabular-nums">
                    Pagó con {formatCLP(completedOrder.cashTendered)}
                  </div>
                )}
              </div>
            </div>

            {completedOrder.pointsEarned > 0 || completedOrder.pointsSpent > 0 ? (
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
                  <span className="text-slate-500 font-semibold">Saldo: {completedOrder.newCustomerPoints} pts</span>
                </div>
              </div>
            ) : null}

            {/* Controles de impresión térmica */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-[#F8FAFC] border border-[#EAECEF] text-xs">
              <span className="font-bold text-slate-600">Formato ticket térmico:</span>
              <div className="flex items-center gap-1.5">
                {[80, 58].map((mm) => (
                  <button
                    key={mm}
                    type="button"
                    onClick={() => onChangeTicketWidth?.(mm)}
                    className={`px-3 py-1 rounded-full text-[11px] font-extrabold cursor-pointer ${
                      ticketWidthMm === mm
                        ? 'bg-[#111827] text-white'
                        : 'bg-white border border-slate-200 text-slate-600'
                    }`}
                  >
                    {mm} mm
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <button
                type="button"
                onClick={() => printPosSaleTicket(completedOrder, ticketWidthMm)}
                className="py-3.5 rounded-2xl bg-[#111827] hover:bg-slate-800 text-white font-extrabold text-xs flex items-center justify-center gap-2 cursor-pointer"
              >
                <Printer className="w-4 h-4 text-[#F5BA13]" />
                <span>Imprimir Ticket ({ticketWidthMm}mm)</span>
              </button>

              <button
                type="button"
                onClick={() => onStartNewSale?.()}
                className="py-3.5 rounded-2xl bg-[#D97706] hover:bg-[#B45309] text-white font-black text-xs flex items-center justify-center gap-2 shadow-md shadow-[#D97706]/25 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Nueva Venta</span>
              </button>
            </div>
          </div>
        ) : (
          /* PANTALLA DE COBRO */
          <>
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-[#FAF8F4]">
              <div>
                <h3 className="text-base font-black text-[#111827]">Finalizar y Cobrar Venta</h3>
                <p className="text-[11px] text-slate-500 font-semibold mt-0.5">
                  Vendedor: <strong>{sellerPartner?.name}</strong>
                  {selectedCustomer ? ` · Cliente: ${selectedCustomer.full_name || selectedCustomer.name}` : ' · Cliente de paso'}
                </p>
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

            <div className="p-5 sm:p-6 space-y-4 max-h-[80dvh] overflow-y-auto">
              {/* Resumen total */}
              <div className="p-4 rounded-2xl bg-[#111827] text-white flex items-center justify-between gap-3">
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Total a cobrar
                  </div>
                  <div className="text-3xl font-black tabular-nums tracking-tight">
                    {formatCLP(totalAmount)}
                  </div>
                  {totalDiscount > 0 && (
                    <div className="text-[11px] text-[#F5BA13] font-semibold mt-0.5 tabular-nums">
                      Subtotal {formatCLP(subtotal)} − Dcto. {formatCLP(totalDiscount)}
                      {selectedRedeemTier ? ` (${selectedRedeemTier.points} pts)` : selectedExistingCoupon ? ` (${selectedExistingCoupon.code})` : ''}
                    </div>
                  )}
                </div>

                {/* Switch Pago único vs Pago dividido */}
                <div className="flex items-center bg-white/10 p-1 rounded-full">
                  <button
                    type="button"
                    onClick={() => setMode('single')}
                    className={`px-3 py-1.5 rounded-full text-[11px] font-extrabold transition-colors cursor-pointer ${
                      mode === 'single' ? 'bg-[#D97706] text-white' : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    Pago único
                  </button>
                  <button
                    type="button"
                    onClick={() => setMode('split')}
                    className={`px-3 py-1.5 rounded-full text-[11px] font-extrabold flex items-center gap-1 transition-colors cursor-pointer ${
                      mode === 'split' ? 'bg-[#D97706] text-white' : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    <Split className="w-3 h-3" />
                    <span>Dividido</span>
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
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {methodsWithLiveRates.map((m) => {
                      const Icon = getMethodIcon(m.id);
                      const isSel = singleMethod === m.id;
                      return (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => {
                            setSingleMethod(m.id);
                            if (m.isCash && (!singleCashTendered || Number(singleCashTendered) < totalAmount)) {
                              setSingleCashTendered(String(totalAmount));
                            }
                          }}
                          className={`p-3 rounded-2xl border text-left transition-all cursor-pointer space-y-1.5 ${
                            isSel
                              ? 'bg-[#FAF8F4] border-[#D97706] ring-2 ring-[#D97706]/20'
                              : 'bg-white border-[#EAECEF] hover:bg-[#F8FAFC]'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div
                              className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                                isSel ? 'bg-[#D97706] text-white' : 'bg-slate-100 text-slate-600'
                              }`}
                            >
                              <Icon className="w-4 h-4" />
                            </div>
                            {isSel && (
                              <span className="w-4 h-4 rounded-full bg-[#D97706] text-white text-[10px] font-black flex items-center justify-center">
                                ✓
                              </span>
                            )}
                          </div>
                          <div>
                            <div className="text-xs font-extrabold text-[#111827] leading-tight">{m.shortLabel}</div>
                            <div className="text-[10px] text-slate-500 font-semibold">{m.feeLabel}</div>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Calculadora de Efectivo y Vuelto */}
                  {singleIsCash && (
                    <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-extrabold text-emerald-950">
                          ¿Con cuánto está pagando el cliente? ($ CLP)
                        </label>
                        <button
                          type="button"
                          onClick={() => setSingleCashTendered(String(totalAmount))}
                          className="px-2.5 py-1 rounded-full bg-white border border-emerald-300 text-emerald-800 text-[10px] font-extrabold cursor-pointer hover:bg-emerald-100"
                        >
                          Monto exacto
                        </button>
                      </div>

                      <input
                        type="number"
                        min="0"
                        step="10"
                        autoFocus
                        value={singleCashTendered}
                        onChange={(e) => setSingleCashTendered(e.target.value)}
                        placeholder="Ingresa monto recibido..."
                        className="w-full px-4 py-3 rounded-xl bg-white border-2 border-emerald-300 focus:border-emerald-600 text-xl font-mono font-black text-[#111827] focus:outline-none tabular-nums"
                      />

                      <div className="flex flex-wrap items-center gap-1.5">
                        {QUICK_CASH_BILLS.map((bill) => (
                          <button
                            key={bill}
                            type="button"
                            onClick={() => setSingleCashTendered(String(bill))}
                            className="px-2.5 py-1 rounded-lg bg-white border border-emerald-200 hover:border-emerald-500 text-emerald-900 text-[11px] font-mono font-extrabold cursor-pointer"
                          >
                            {formatCLP(bill)}
                          </button>
                        ))}
                      </div>

                      <div className="pt-2 border-t border-emerald-200/80 flex items-center justify-between">
                        {singleCashShortfall > 0 ? (
                          <span className="text-xs font-extrabold text-rose-700">
                            Faltan {formatCLP(singleCashShortfall)} para cubrir la compra
                          </span>
                        ) : (
                          <>
                            <span className="text-xs font-extrabold text-emerald-900">Vuelto a entregar:</span>
                            <span className="text-2xl font-black font-mono text-emerald-700 tabular-nums">
                              {formatCLP(singleCashChange)}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* MODO 2: PAGO DIVIDIDO (MIXTO) */
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-[#111827]">
                      Combina 2 o más medios de pago
                    </span>
                    <button
                      type="button"
                      onClick={handleAddSplitLine}
                      className="px-3 py-1 rounded-full bg-[#FEF3C7] hover:bg-[#FDE68A] text-[#92400E] text-[11px] font-extrabold flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Agregar medio</span>
                    </button>
                  </div>

                  <div className="space-y-2.5">
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
                                          tendered: nextM === 'Efectivo' ? Math.max(Number(item.amount) || 0, Number(item.tendered) || 0) : 0,
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
                                              item.method === 'Efectivo' && (Number(item.tendered) || 0) < nextAmt
                                                ? nextAmt
                                                : item.tendered,
                                          }
                                        : item
                                    )
                                  );
                                }}
                                className="w-full pl-6 pr-2 py-2 rounded-xl bg-white border border-slate-200 text-xs font-mono font-black text-right text-[#111827] focus:outline-none focus:border-[#D97706]"
                              />
                            </div>

                            {splitLines.length > 1 && (
                              <button
                                type="button"
                                onClick={() => setSplitLines((prev) => prev.filter((item) => item.id !== line.id))}
                                className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                                title={`Quitar pago ${idx + 1}`}
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>

                          {/* Si esta porción es Efectivo, permitir ingresar con cuánto paga y ver vuelto */}
                          {isCash && (
                            <div className="pt-2 border-t border-slate-200/70 flex flex-wrap items-center justify-between gap-2 text-[11px]">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-emerald-800">Paga en efectivo con:</span>
                                <input
                                  type="number"
                                  min="0"
                                  step="10"
                                  value={line.tendered}
                                  onChange={(e) => {
                                    const val = Math.max(0, Number(e.target.value) || 0);
                                    setSplitLines((prev) =>
                                      prev.map((item) => (item.id === line.id ? { ...item, tendered: val } : item))
                                    );
                                  }}
                                  className="w-28 px-2.5 py-1 rounded-lg bg-white border border-emerald-300 font-mono font-black text-right text-emerald-950 focus:outline-none focus:border-emerald-600"
                                />
                              </div>
                              <div className="font-extrabold tabular-nums">
                                {tend < amt ? (
                                  <span className="text-rose-600">Falta {formatCLP(amt - tend)}</span>
                                ) : (
                                  <span className="text-emerald-700">Vuelto: {formatCLP(lineChange)}</span>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Balance de Pago Dividido */}
                  <div
                    className={`p-3 rounded-2xl border flex items-center justify-between text-xs font-bold ${
                      splitRemaining === 0
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                        : 'bg-amber-50 border-amber-200 text-amber-900'
                    }`}
                  >
                    <div>
                      <span>Cubierto: {formatCLP(splitCoveredTotal)} de {formatCLP(totalAmount)}</span>
                      {splitTotalChange > 0 && (
                        <span className="ml-2 text-emerald-700 font-black">
                          · Vuelto efvo.: {formatCLP(splitTotalChange)}
                        </span>
                      )}
                    </div>
                    {splitRemaining !== 0 && (
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
                                    tendered: item.method === 'Efectivo' ? Math.max(nextAmt, Number(item.tendered) || 0) : item.tendered,
                                  }
                                : item
                            );
                          });
                        }}
                        className="px-2.5 py-1 rounded-lg bg-white border border-amber-300 text-amber-900 text-[11px] font-extrabold cursor-pointer hover:bg-amber-100"
                      >
                        {splitRemaining > 0
                          ? `Completar +${formatCLP(splitRemaining)}`
                          : `Ajustar ${formatCLP(splitRemaining)}`}
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Nota opcional */}
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                  Observación opcional de la venta
                </label>
                <input
                  type="text"
                  value={saleNotes}
                  onChange={(e) => setSaleNotes(e.target.value)}
                  placeholder="Ej: Boleta SII #1234, cliente pidió bolsa grande..."
                  className="w-full px-3 py-2 rounded-xl bg-[#F8FAFC] border border-[#EAECEF] text-xs font-semibold text-[#111827] focus:bg-white focus:border-[#D97706] focus:outline-none"
                />
              </div>

              {/* Botones de acción */}
              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={onClose}
                  className="px-4 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  disabled={!canSubmit}
                  onClick={handleConfirm}
                  className="px-6 py-3 rounded-2xl bg-[#D97706] hover:bg-[#B45309] text-white text-xs font-black shadow-md shadow-[#D97706]/25 flex items-center gap-2 cursor-pointer disabled:opacity-45 disabled:cursor-not-allowed"
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
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
