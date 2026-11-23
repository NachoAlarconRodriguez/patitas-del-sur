import React, { useEffect } from 'react';
import {
  DollarSign,
  X,
  Clock,
  Landmark,
  Banknote,
  CreditCard,
  CheckCircle2,
  Check,
  AlertTriangle,
  Loader2,
} from 'lucide-react';
import { formatCLP, getOrderPaymentStatus } from '../adminUtils';

/**
 * Modales de confirmación de Pago al Entregar (incluyendo POS móvil) y Cancelación de Pedido
 */
export default function PaymentAndCancelOrderModals({
  paymentDeliveryConfirmModal,
  setPaymentDeliveryConfirmModal,
  isSubmittingPayment = false,
  currentAdminName,
  onConfirmPaymentAndDelivery,
  cancelOrderConfirmModal,
  setCancelOrderConfirmModal,
  onConfirmCancelOrder,
}) {
  useEffect(() => {
    if (!paymentDeliveryConfirmModal && !cancelOrderConfirmModal) return;
    const onKeyDown = (e) => {
      if (e.key === 'Escape' && !isSubmittingPayment) {
        if (paymentDeliveryConfirmModal) setPaymentDeliveryConfirmModal(null);
        if (cancelOrderConfirmModal) setCancelOrderConfirmModal(null);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [
    paymentDeliveryConfirmModal,
    cancelOrderConfirmModal,
    isSubmittingPayment,
    setPaymentDeliveryConfirmModal,
    setCancelOrderConfirmModal,
  ]);

  const safeAdminName = String(currentAdminName || 'Admin').trim() || 'Admin';

  return (
    <>
      {paymentDeliveryConfirmModal && (() => {
        const { order, paymentMethod, paymentMode = 'pagado' } = paymentDeliveryConfirmModal;
        const isPendingDelivery = paymentMode === 'pendiente';
        const totalFormatted = formatCLP(order.total || 0);
        const pointsToEarn = order.pointsEarned ?? Math.floor((order.total || 0) / 1000);
        const payInfo = getOrderPaymentStatus(order);

        return (
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Confirmar pago para entrega"
            onClick={() => {
              if (!isSubmittingPayment) setPaymentDeliveryConfirmModal(null);
            }}
            className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-slate-900/65 backdrop-blur-sm animate-in fade-in duration-200"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl max-w-md w-full max-h-[90dvh] shadow-2xl border border-slate-200 overflow-hidden flex flex-col transform transition-all animate-in zoom-in-95 duration-200"
            >
              {/* Header */}
              <div className="p-5 sm:p-6 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border-b border-slate-100 flex items-start justify-between shrink-0">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-11 h-11 rounded-2xl bg-amber-100 border border-amber-200 flex items-center justify-center text-amber-700 shadow-xs shrink-0">
                    <DollarSign className="w-5 h-5 stroke-[2.5]" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-base font-black text-slate-900 tracking-tight">
                      Confirmar Pago para Entrega
                    </h3>
                    <p className="text-xs text-slate-500 font-semibold truncate">
                      Pedido <strong>{order.id}</strong> · {order.customer || order.customerName || 'Cliente'}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  disabled={isSubmittingPayment}
                  onClick={() => setPaymentDeliveryConfirmModal(null)}
                  aria-label="Cerrar"
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer disabled:opacity-40 shrink-0"
                  title="Cerrar"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Scrollable Body */}
              <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
                <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 flex items-center justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-black uppercase text-amber-800 tracking-wider block">
                      Monto del pedido
                    </span>
                    <span className="text-2xl font-black text-slate-950 font-mono tracking-tight tabular-nums">
                      {totalFormatted}
                    </span>
                  </div>
                  <span
                    className={`px-2.5 py-1 rounded-full text-[11px] font-black border flex items-center gap-1 shadow-2xs shrink-0 ${
                      payInfo.isRejected
                        ? 'bg-rose-100 text-rose-800 border-rose-300'
                        : 'bg-amber-200 text-amber-900 border-amber-300'
                    }`}
                  >
                    <Clock className={`w-3 h-3 ${payInfo.isRejected ? 'text-rose-700' : 'text-amber-700'}`} />
                    {payInfo.isRejected ? 'Pago Rechazado' : 'Pago Pendiente'}
                  </span>
                </div>

                <p className="text-xs text-slate-600 font-medium leading-relaxed">
                  Al marcar el pedido como <strong>Entregado</strong>, selecciona cómo pagó el cliente o si se entrega con <strong>pago pendiente</strong>:
                </p>

                {/* Selector de Método / Estado de Pago */}
                <div className="space-y-2.5">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    ¿Cómo se recibió el pago?
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {/* Opción 1: Transferencia */}
                    <button
                      type="button"
                      disabled={isSubmittingPayment}
                      onClick={() =>
                        setPaymentDeliveryConfirmModal((prev) => ({
                          ...prev,
                          paymentMethod: 'Transferencia',
                          paymentMode: 'pagado',
                        }))
                      }
                      className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between gap-2.5 ${
                        !isPendingDelivery && paymentMethod === 'Transferencia'
                          ? 'bg-emerald-50/80 border-emerald-500 ring-2 ring-emerald-500/20 shadow-xs'
                          : 'bg-white border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <div
                        className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                          !isPendingDelivery && paymentMethod === 'Transferencia'
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        <Landmark className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-black text-xs text-slate-900">Transferencia</div>
                        <div className="text-[10px] text-slate-500 font-medium leading-tight">
                          Sin comisión (0%)
                        </div>
                      </div>
                      {!isPendingDelivery && paymentMethod === 'Transferencia' && (
                        <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[11px] shrink-0">
                          ✓
                        </span>
                      )}
                    </button>

                    {/* Opción 2: Tarjeta Débito / Dinero MP (POS móvil) */}
                    <button
                      type="button"
                      disabled={isSubmittingPayment}
                      onClick={() =>
                        setPaymentDeliveryConfirmModal((prev) => ({
                          ...prev,
                          paymentMethod: 'Tarjeta Débito POS (Contra Entrega)',
                          paymentMode: 'pagado',
                        }))
                      }
                      className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between gap-2.5 ${
                        !isPendingDelivery &&
                        (String(paymentMethod || '').toLowerCase().includes('débito') ||
                          String(paymentMethod || '').toLowerCase().includes('debito') ||
                          String(paymentMethod || '').toLowerCase().includes('dinero'))
                          ? 'bg-emerald-50/80 border-emerald-500 ring-2 ring-emerald-500/20 shadow-xs'
                          : 'bg-white border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <div
                        className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                          !isPendingDelivery &&
                          (String(paymentMethod || '').toLowerCase().includes('débito') ||
                            String(paymentMethod || '').toLowerCase().includes('debito') ||
                            String(paymentMethod || '').toLowerCase().includes('dinero'))
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        <CreditCard className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-black text-xs text-slate-900">Débito / Dinero MP</div>
                        <div className="text-[10px] text-slate-500 font-medium leading-tight">
                          POS móvil · 2,19% + IVA
                        </div>
                      </div>
                      {!isPendingDelivery &&
                        (String(paymentMethod || '').toLowerCase().includes('débito') ||
                          String(paymentMethod || '').toLowerCase().includes('debito') ||
                          String(paymentMethod || '').toLowerCase().includes('dinero')) && (
                          <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[11px] shrink-0">
                            ✓
                          </span>
                        )}
                    </button>

                    {/* Opción 3: Tarjeta Crédito (POS móvil) */}
                    <button
                      type="button"
                      disabled={isSubmittingPayment}
                      onClick={() =>
                        setPaymentDeliveryConfirmModal((prev) => ({
                          ...prev,
                          paymentMethod: 'Tarjeta Crédito POS (Contra Entrega)',
                          paymentMode: 'pagado',
                        }))
                      }
                      className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between gap-2.5 ${
                        !isPendingDelivery &&
                        (String(paymentMethod || '').toLowerCase().includes('crédito') ||
                          String(paymentMethod || '').toLowerCase().includes('credito') ||
                          (String(paymentMethod || '').toLowerCase().includes('tarjeta') &&
                            !String(paymentMethod || '').toLowerCase().includes('débito') &&
                            !String(paymentMethod || '').toLowerCase().includes('debito')))
                          ? 'bg-emerald-50/80 border-emerald-500 ring-2 ring-emerald-500/20 shadow-xs'
                          : 'bg-white border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <div
                        className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                          !isPendingDelivery &&
                          (String(paymentMethod || '').toLowerCase().includes('crédito') ||
                            String(paymentMethod || '').toLowerCase().includes('credito') ||
                            (String(paymentMethod || '').toLowerCase().includes('tarjeta') &&
                              !String(paymentMethod || '').toLowerCase().includes('débito') &&
                              !String(paymentMethod || '').toLowerCase().includes('debito')))
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        <CreditCard className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-black text-xs text-slate-900">Tarjeta Crédito</div>
                        <div className="text-[10px] text-slate-500 font-medium leading-tight">
                          POS móvil · 2,69% + IVA
                        </div>
                      </div>
                      {!isPendingDelivery &&
                        (String(paymentMethod || '').toLowerCase().includes('crédito') ||
                          String(paymentMethod || '').toLowerCase().includes('credito') ||
                          (String(paymentMethod || '').toLowerCase().includes('tarjeta') &&
                            !String(paymentMethod || '').toLowerCase().includes('débito') &&
                            !String(paymentMethod || '').toLowerCase().includes('debito'))) && (
                          <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[11px] shrink-0">
                            ✓
                          </span>
                        )}
                    </button>

                    {/* Opción 4: Efectivo */}
                    <button
                      type="button"
                      disabled={isSubmittingPayment}
                      onClick={() =>
                        setPaymentDeliveryConfirmModal((prev) => ({
                          ...prev,
                          paymentMethod: 'Efectivo',
                          paymentMode: 'pagado',
                        }))
                      }
                      className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between gap-2.5 ${
                        !isPendingDelivery && paymentMethod === 'Efectivo'
                          ? 'bg-emerald-50/80 border-emerald-500 ring-2 ring-emerald-500/20 shadow-xs'
                          : 'bg-white border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <div
                        className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                          !isPendingDelivery && paymentMethod === 'Efectivo'
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        <Banknote className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-black text-xs text-slate-900">Efectivo</div>
                        <div className="text-[10px] text-slate-500 font-medium leading-tight">
                          Sin comisión (0%)
                        </div>
                      </div>
                      {!isPendingDelivery && paymentMethod === 'Efectivo' && (
                        <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[11px] shrink-0">
                          ✓
                        </span>
                      )}
                    </button>
                  </div>

                  <button
                    type="button"
                    disabled={isSubmittingPayment}
                    onClick={() =>
                      setPaymentDeliveryConfirmModal((prev) => ({
                        ...prev,
                        paymentMethod: 'Transferencia',
                        paymentMode: 'pendiente',
                      }))
                    }
                    className={`w-full p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between gap-3 ${
                      isPendingDelivery
                        ? 'bg-amber-50/90 border-amber-500 ring-2 ring-amber-500/25 shadow-xs'
                        : 'bg-white border-slate-200 hover:bg-amber-50/40 hover:border-amber-200'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                          isPendingDelivery
                            ? 'bg-amber-500 text-slate-950'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        <Clock className="w-4 h-4 stroke-[2.5]" />
                      </div>
                      <div className="min-w-0">
                        <div className="font-black text-xs text-slate-900">
                          ⏳ Entregar con Pago Pendiente
                        </div>
                        <div className="text-[10px] text-slate-500 font-medium">
                          El cliente transferirá después (queda en Por Cobrar)
                        </div>
                      </div>
                    </div>
                    {isPendingDelivery && (
                      <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 font-black flex items-center justify-center text-[11px] shrink-0">
                        ✓
                      </span>
                    )}
                  </button>
                </div>

                {/* Repartidor Responsable */}
                <div className="p-3 rounded-2xl bg-amber-50/80 border border-amber-200/90 text-xs flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-xl bg-[#D97706] text-white flex items-center justify-center font-black text-xs shadow-2xs">
                      {safeAdminName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <span className="text-[10px] text-[#D97706] font-extrabold uppercase tracking-wider block">
                        Repartidor Responsable
                      </span>
                      <strong className="text-slate-900 font-black">{safeAdminName}</strong>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-amber-800 bg-white/90 px-2 py-0.5 rounded-lg border border-amber-200">
                    Administrador
                  </span>
                </div>

                {isPendingDelivery ? (
                  <div className="p-3 rounded-2xl bg-amber-50/80 border border-amber-200/90 text-[11px] text-amber-900 flex items-start gap-2">
                    <Clock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <span>
                      Quedará como <strong>Entregado</strong> por <strong>{safeAdminName}</strong> y en <strong>Por cobrar</strong> hasta confirmar la transferencia.
                    </span>
                  </div>
                ) : (
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 text-[11px] text-slate-600 flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>
                      Al confirmar, pasará a <strong>Pagado</strong> y <strong>Entregado</strong> por <strong>{safeAdminName}</strong> (+<strong>{pointsToEarn} Pts</strong> Club Patitas).
                    </span>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-4 sm:px-6 pb-[max(1rem,env(safe-area-inset-bottom))] bg-slate-50 border-t border-slate-200/80 flex items-center justify-end gap-2.5 shrink-0">
                <button
                  type="button"
                  disabled={isSubmittingPayment}
                  onClick={() => setPaymentDeliveryConfirmModal(null)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 text-xs font-bold hover:bg-slate-100 transition-colors cursor-pointer disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  disabled={isSubmittingPayment}
                  onClick={onConfirmPaymentAndDelivery}
                  className={`px-5 py-2.5 rounded-xl text-xs font-black shadow-md transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed ${
                    isPendingDelivery
                      ? 'bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-amber-500/20'
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20'
                  }`}
                >
                  {isSubmittingPayment ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Guardando...</span>
                    </>
                  ) : isPendingDelivery ? (
                    <>
                      <Clock className="w-4 h-4 stroke-[2.5]" />
                      <span>Entregar Pendiente</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4 stroke-[3]" />
                      <span>Confirmar y Entregar</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {cancelOrderConfirmModal && (() => {
        const order = cancelOrderConfirmModal;
        const totalFormatted = formatCLP(order.total || 0);
        const orderItems =
          order.items && order.items.length > 0
            ? order.items
            : order.product
              ? [{ name: order.product, quantity: order.qty || 1 }]
              : [];

        return (
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Confirmar cancelación de pedido"
            onClick={() => setCancelOrderConfirmModal(null)}
            className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-slate-900/65 backdrop-blur-sm animate-in fade-in duration-200"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl max-w-md w-full max-h-[90dvh] shadow-2xl border border-slate-200 overflow-hidden flex flex-col transform transition-all animate-in zoom-in-95 duration-200"
            >
              {/* Header */}
              <div className="p-5 sm:p-6 bg-gradient-to-r from-rose-500/10 via-rose-500/5 to-transparent border-b border-slate-100 flex items-start justify-between shrink-0">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-11 h-11 rounded-2xl bg-rose-100 border border-rose-200 flex items-center justify-center text-rose-700 shadow-xs shrink-0">
                    <AlertTriangle className="w-5 h-5 stroke-[2.5]" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-base font-black text-slate-900 tracking-tight">
                      ¿Cancelar Pedido?
                    </h3>
                    <p className="text-xs text-slate-500 font-semibold truncate">
                      Pedido <strong>{order.id}</strong> · {order.customer || order.customerName || 'Cliente'}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setCancelOrderConfirmModal(null)}
                  aria-label="Cerrar"
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
                  title="Cerrar"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Scrollable Body */}
              <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
                <div className="p-4 rounded-2xl bg-rose-50/70 border border-rose-200/80 flex items-center justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-black uppercase text-rose-800 tracking-wider block">
                      Monto del Pedido
                    </span>
                    <span className="text-2xl font-black text-slate-950 font-mono tracking-tight tabular-nums">
                      {totalFormatted}
                    </span>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[11px] font-black bg-rose-200 text-rose-900 border border-rose-300 flex items-center gap-1 shadow-2xs shrink-0">
                    <X className="w-3 h-3 text-rose-700" />
                    Cancelado
                  </span>
                </div>

                <div className="space-y-2 text-xs text-slate-600 font-medium">
                  <p className="font-bold text-slate-800">
                    Al confirmar la cancelación de este pedido:
                  </p>
                  <ul className="space-y-1.5 list-disc list-inside text-slate-600 text-[11px]">
                    <li>
                      <strong>Stock en Bodega:</strong> Se reintegrará automáticamente el inventario ({orderItems.length} {orderItems.length === 1 ? 'producto' : 'productos'}).
                    </li>
                    <li>
                      <strong>Finanzas y Ganancias:</strong> No se sumará a las ventas totales ni flujo de caja.
                    </li>
                    <li>
                      <strong>Despachos:</strong> Saldrá de las rutas activas de entrega.
                    </li>
                  </ul>
                </div>

                {orderItems.length > 0 && (
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/70 text-xs">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      Productos a devolver al stock:
                    </span>
                    <div className="space-y-1 max-h-32 overflow-y-auto">
                      {orderItems.map((it, idx) => (
                        <div key={idx} className="flex justify-between items-center text-slate-700 font-semibold text-[11px]">
                          <span className="truncate pr-2">{it.name}</span>
                          <span className="font-mono font-bold text-emerald-700 shrink-0">
                            +{it.quantity || it.qty || 1} un.
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-4 sm:px-6 pb-[max(1rem,env(safe-area-inset-bottom))] bg-slate-50/80 border-t border-slate-100 flex items-center justify-end gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => setCancelOrderConfirmModal(null)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
                >
                  No Cancelar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const orderId = order.id;
                    setCancelOrderConfirmModal(null);
                    onConfirmCancelOrder(orderId);
                  }}
                  className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black shadow-md shadow-rose-600/20 transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
                >
                  <X className="w-4 h-4 stroke-[3]" />
                  <span>Sí, Cancelar Pedido</span>
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </>
  );
}
