import React from 'react';
import {
  DollarSign,
  X,
  Clock,
  Landmark,
  Banknote,
  CheckCircle2,
  Check,
  AlertTriangle,
} from 'lucide-react';
import { formatCLP } from '../adminUtils';

/**
 * Modales de confirmación de Pago al Entregar y Cancelación de Pedido con reintegro de stock
 */
export default function PaymentAndCancelOrderModals({
  paymentDeliveryConfirmModal,
  setPaymentDeliveryConfirmModal,
  currentAdminName,
  onConfirmPaymentAndDelivery,
  cancelOrderConfirmModal,
  setCancelOrderConfirmModal,
  onConfirmCancelOrder,
}) {
  return (
    <>
      {paymentDeliveryConfirmModal && (() => {
        const { order, paymentMethod, paymentMode = 'pagado' } = paymentDeliveryConfirmModal;
        const isPendingDelivery = paymentMode === 'pendiente';
        const totalFormatted = formatCLP(order.total || 0);
        const pointsToEarn = order.pointsEarned ?? Math.floor((order.total || 0) / 1000);

        return (
          <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-slate-900/65 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col transform transition-all animate-in zoom-in-95 duration-200">
              {/* Header */}
              <div className="p-6 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border-b border-slate-100 flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-amber-100 border border-amber-200 flex items-center justify-center text-amber-700 shadow-xs shrink-0">
                    <DollarSign className="w-6 h-6 stroke-[2.5]" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900 tracking-tight">
                      Confirmar Pago para Entrega
                    </h3>
                    <p className="text-xs text-slate-500 font-semibold">
                      Pedido <strong>{order.id}</strong> · {order.customer || order.customerName || 'Cliente'}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setPaymentDeliveryConfirmModal(null)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                  title="Cerrar"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body */}
              <div className="p-6 space-y-4">
                <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-black uppercase text-amber-800 tracking-wider block">
                      Monto del pedido
                    </span>
                    <span className="text-2xl font-black text-slate-950 font-mono tracking-tight">
                      {totalFormatted}
                    </span>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[11px] font-black bg-amber-200 text-amber-900 border border-amber-300 flex items-center gap-1 shadow-2xs">
                    <Clock className="w-3 h-3 text-amber-700" />
                    Pago Pendiente
                  </span>
                </div>

                <p className="text-xs text-slate-600 font-medium leading-relaxed">
                  Al marcar el pedido como <strong>Entregado</strong>, selecciona si el pago ya fue recibido o si se entrega dejando el <strong>pago pendiente</strong> (cuando el cliente transferirá después):
                </p>

                {/* Selector de Método / Estado de Pago */}
                <div className="space-y-2.5">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    ¿Cuál es el estado del pago al entregar?
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      onClick={() =>
                        setPaymentDeliveryConfirmModal((prev) => ({
                          ...prev,
                          paymentMethod: 'Transferencia',
                          paymentMode: 'pagado',
                        }))
                      }
                      className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-2 ${
                        !isPendingDelivery && paymentMethod === 'Transferencia'
                          ? 'bg-emerald-50/80 border-emerald-500 ring-2 ring-emerald-500/20 shadow-xs'
                          : 'bg-white border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div
                          className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                            !isPendingDelivery && paymentMethod === 'Transferencia'
                              ? 'bg-emerald-600 text-white'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          <Landmark className="w-4 h-4" />
                        </div>
                        {!isPendingDelivery && paymentMethod === 'Transferencia' && (
                          <span className="w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px]">
                            ✓
                          </span>
                        )}
                      </div>
                      <div>
                        <div className="font-black text-xs text-slate-900">Pagado · Transferencia</div>
                        <div className="text-[10px] text-slate-500 font-medium">
                          Recibida y verificada en cuenta bancaria
                        </div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setPaymentDeliveryConfirmModal((prev) => ({
                          ...prev,
                          paymentMethod: 'Efectivo',
                          paymentMode: 'pagado',
                        }))
                      }
                      className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-2 ${
                        !isPendingDelivery && paymentMethod === 'Efectivo'
                          ? 'bg-emerald-50/80 border-emerald-500 ring-2 ring-emerald-500/20 shadow-xs'
                          : 'bg-white border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div
                          className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                            !isPendingDelivery && paymentMethod === 'Efectivo'
                              ? 'bg-emerald-600 text-white'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          <Banknote className="w-4 h-4" />
                        </div>
                        {!isPendingDelivery && paymentMethod === 'Efectivo' && (
                          <span className="w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px]">
                            ✓
                          </span>
                        )}
                      </div>
                      <div>
                        <div className="font-black text-xs text-slate-900">Pagado · Efectivo</div>
                        <div className="text-[10px] text-slate-500 font-medium">
                          Recibido en mano durante la entrega
                        </div>
                      </div>
                    </button>
                  </div>

                  <button
                    type="button"
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
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                          isPendingDelivery
                            ? 'bg-amber-500 text-slate-950'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        <Clock className="w-4 h-4 stroke-[2.5]" />
                      </div>
                      <div>
                        <div className="font-black text-xs text-slate-900">
                          ⏳ Entregar con Pago Pendiente (Transferirá después)
                        </div>
                        <div className="text-[10px] text-slate-500 font-medium">
                          Marca el pedido como Entregado pero mantiene el cobro en &quot;Pendiente de pago&quot;
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
                      {currentAdminName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <span className="text-[10px] text-[#D97706] font-extrabold uppercase tracking-wider block">
                        Repartidor Responsable
                      </span>
                      <strong className="text-slate-900 font-black">{currentAdminName}</strong>
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
                      El pedido quedará como <strong>Entregado</strong> por <strong>{currentAdminName}</strong> y con estado <strong>Pendiente de pago</strong>. Cuando recibas la transferencia, podrás marcarlo como <strong>Pagado</strong> con un clic en la tabla.
                    </span>
                  </div>
                ) : (
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 text-[11px] text-slate-600 flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>
                      Al confirmar, el pedido pasará a <strong>Pagado</strong> y <strong>Entregado</strong> por <strong>{currentAdminName}</strong>, y se acreditarán automáticamente <strong>+{pointsToEarn} Pts</strong> Club Patitas al cliente.
                    </span>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-4 sm:px-6 bg-slate-50 border-t border-slate-200/80 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setPaymentDeliveryConfirmModal(null)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 text-xs font-bold hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={onConfirmPaymentAndDelivery}
                  className={`px-5 py-2.5 rounded-xl text-xs font-black shadow-md transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 ${
                    isPendingDelivery
                      ? 'bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-amber-500/20'
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20'
                  }`}
                >
                  {isPendingDelivery ? (
                    <>
                      <Clock className="w-4 h-4 stroke-[2.5]" />
                      <span>Entregar con Pago Pendiente</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4 stroke-[3]" />
                      <span>Confirmar Pago y Entregar</span>
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
          <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-slate-900/65 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col transform transition-all animate-in zoom-in-95 duration-200">
              {/* Header */}
              <div className="p-6 bg-gradient-to-r from-rose-500/10 via-rose-500/5 to-transparent border-b border-slate-100 flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-rose-100 border border-rose-200 flex items-center justify-center text-rose-700 shadow-xs shrink-0">
                    <AlertTriangle className="w-6 h-6 stroke-[2.5]" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900 tracking-tight">
                      ¿Cancelar Pedido?
                    </h3>
                    <p className="text-xs text-slate-500 font-semibold">
                      Pedido <strong>{order.id}</strong> · {order.customer || order.customerName || 'Cliente'}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setCancelOrderConfirmModal(null)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                  title="Cerrar"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body */}
              <div className="p-6 space-y-4">
                <div className="p-4 rounded-2xl bg-rose-50/70 border border-rose-200/80 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-black uppercase text-rose-800 tracking-wider block">
                      Monto del Pedido
                    </span>
                    <span className="text-2xl font-black text-slate-950 font-mono tracking-tight">
                      {totalFormatted}
                    </span>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[11px] font-black bg-rose-200 text-rose-900 border border-rose-300 flex items-center gap-1 shadow-2xs">
                    <X className="w-3 h-3 text-rose-700" />
                    Se marcará como Cancelado
                  </span>
                </div>

                <div className="space-y-2 text-xs text-slate-600 font-medium">
                  <p className="font-bold text-slate-800">
                    Al confirmar la cancelación de este pedido:
                  </p>
                  <ul className="space-y-1.5 list-disc list-inside text-slate-600 text-[11px]">
                    <li>
                      <strong>Stock en Bodega:</strong> Se reintegrará automáticamente el inventario de los productos de este pedido ({orderItems.length} {orderItems.length === 1 ? 'producto' : 'productos'}).
                    </li>
                    <li>
                      <strong>Finanzas y Ganancias:</strong> No se sumará a las ventas totales, flujo de caja ni distribución a socios.
                    </li>
                    <li>
                      <strong>Despachos:</strong> No figurará en rutas de entrega activas ni pendientes.
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
              <div className="p-4 sm:px-6 bg-slate-50/80 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setCancelOrderConfirmModal(null)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
                >
                  Volver / No Cancelar
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
