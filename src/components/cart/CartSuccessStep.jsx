import React from 'react';
import {
  Sparkles,
  Banknote,
  CreditCard,
  Landmark,
  Check,
  Copy,
  MessageSquare,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import { COMPANY_INFO } from '../../constants';
import { formatCLP } from '../../utils/formatters';

/**
 * Paso 3 del Carrito: Confirmación de compra exitosa, datos de transferencia/Mercado Pago
 * y selector rápido de reposición inteligente.
 */
export default function CartSuccessStep({
  completedOrder,
  copiedBankData,
  onCopyBankData,
  replenishmentSaved,
  selectedReplenishFrequency,
  onSaveReplenishment,
  onCloseAndFinish,
}) {
  if (!completedOrder) return null;

  const paymentMethodLower = completedOrder.paymentMethod?.toLowerCase() || '';

  return (
    <div className="flex-1 overflow-y-auto p-5 space-y-4 flex flex-col justify-between">
      <div className="space-y-4 animate-in fade-in duration-300">
        {/* Banner de Éxito */}
        <div className="text-center py-4 px-2 space-y-2">
          <div className="w-14 h-14 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto text-2xl shadow-lg shadow-emerald-500/30">
            ✓
          </div>
          <h3 className="text-xl font-black text-slate-900">
            ¡Pedido Recibido con Éxito! 🐾
          </h3>
          <p className="text-xs text-slate-500 font-medium">
            Número de Orden:{' '}
            <span className="font-mono font-black text-[#D97706] bg-[#F5BA13]/20 px-2 py-0.5 rounded-md">
              {completedOrder.id}
            </span>
          </p>
        </div>

        {/* Resumen de Entrega */}
        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2 text-xs">
          <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
            <span className="text-slate-500">Destinatario:</span>
            <span className="font-bold text-slate-900">{completedOrder.recipientName}</span>
          </div>

          <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
            <span className="text-slate-500">Dirección:</span>
            <span className="font-bold text-slate-900 text-right max-w-[200px] truncate">
              {completedOrder.address}, {completedOrder.city}
            </span>
          </div>

          {completedOrder.deliveryDate && (
            <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
              <span className="text-slate-500">Día de Entrega:</span>
              <span className="font-bold text-slate-900">{completedOrder.deliveryDate}</span>
            </div>
          )}

          <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
            <span className="text-slate-500">Ventana de Entrega:</span>
            <span className="font-bold text-emerald-800">{completedOrder.deliverySlot}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-500">Total:</span>
            <span className="font-black text-sm text-[#D97706]">
              {formatCLP(completedOrder.total)}
            </span>
          </div>
        </div>

        {/* Puntos Acumulados */}
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <span className="text-xs font-bold text-emerald-900">
              Puntos Club Patitas Ganados
            </span>
          </div>
          <span className="text-xs font-black text-emerald-700 bg-emerald-200/60 px-2 py-0.5 rounded-full">
            +{completedOrder.pointsEarned} Pts
          </span>
        </div>

        {/* Información según el método de pago seleccionado */}
        {paymentMethodLower.includes('efectivo') ? (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-3 text-emerald-950 animate-in fade-in">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                <Banknote className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider text-emerald-950 flex items-center gap-1.5">
                  <span>Pago Contra Entrega (Efectivo)</span>
                </h4>
                <p className="text-[11px] text-emerald-700 font-medium">
                  Pagarás en efectivo al repartidor al recibir tu pedido.
                </p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-white border border-emerald-200/80 text-xs space-y-1.5">
              <div className="flex justify-between font-extrabold text-slate-800">
                <span>Total a pagar en efectivo:</span>
                <span className="text-emerald-700 font-black text-sm">{formatCLP(completedOrder.total)}</span>
              </div>
              {completedOrder.cashChangeNote && (
                <div className="text-[11px] text-slate-600 pt-1 border-t border-slate-100">
                  <strong>Indicación de vuelto:</strong> {completedOrder.cashChangeNote}
                </div>
              )}
            </div>
          </div>
        ) : paymentMethodLower.includes('pos') ? (
          <div className="p-4 bg-purple-50 border border-purple-200 rounded-2xl space-y-2 text-purple-950 animate-in fade-in">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-purple-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                <CreditCard className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider text-purple-950">
                  Tarjeta al Recibir (Máquina POS)
                </h4>
                <p className="text-[11px] text-purple-700 font-medium">
                  El repartidor llevará la máquina para cobrarte con tarjeta directamente en tu puerta.
                </p>
              </div>
            </div>
          </div>
        ) : paymentMethodLower.includes('transferencia') ? (
          <div className="p-4 bg-teal-50 border border-teal-200 rounded-2xl space-y-3 animate-in fade-in">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black text-teal-950 uppercase tracking-wider flex items-center gap-1.5">
                <Landmark className="w-4 h-4 text-[#D97706]" />
                <span>Datos para Transferir al Recibir</span>
              </h4>
              <button
                onClick={onCopyBankData}
                className="text-[11px] font-bold text-[#D97706] hover:underline flex items-center gap-1 cursor-pointer"
              >
                {copiedBankData ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Copiado</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copiar Datos</span>
                  </>
                )}
              </button>
            </div>

            <div className="text-xs space-y-1 text-slate-700 font-medium font-mono">
              <div><strong className="font-sans">Banco:</strong> Banco de Chile</div>
              <div><strong className="font-sans">Tipo:</strong> Cuenta Corriente</div>
              <div><strong className="font-sans">N°:</strong> 00-123-45678-09</div>
              <div><strong className="font-sans">RUT:</strong> {COMPANY_INFO.rut}</div>
              <div><strong className="font-sans">Titular:</strong> {COMPANY_INFO.legalName}</div>
              <div><strong className="font-sans">Email:</strong> {COMPANY_INFO.paymentsEmail}</div>
              <div><strong className="font-sans">Asunto:</strong> Pedido {completedOrder.id}</div>
            </div>

            <a
              href={`https://wa.me/${COMPANY_INFO.whatsappRaw}?text=Hola%20Patitas%20del%20Sur%2C%20adjunto%20comprobante%20de%20mi%20pedido%20${completedOrder.id}%20por%20${encodeURIComponent(formatCLP(completedOrder.total))}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-sm"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Enviar Comprobante por WhatsApp</span>
            </a>
          </div>
        ) : completedOrder.paymentStatus === 'pendiente' ? (
          <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-950 space-y-1.5 animate-in fade-in">
            <p className="font-bold flex items-center gap-1.5 text-amber-900">
              <Clock className="w-4 h-4 text-amber-600" />
              <span>Pago en Mercado Pago en Proceso</span>
            </p>
            <p className="text-[11px] text-amber-800">
              Tu pedido fue registrado y estamos esperando la confirmación final de tu pago por parte de Mercado Pago.
            </p>
            {(completedOrder.mpPaymentId || completedOrder.mpOrderId) && (
              <div className="pt-1 border-t border-amber-200/70 flex flex-wrap gap-2 text-[10px] font-mono text-amber-900">
                {completedOrder.mpPaymentId && (
                  <span>Operación MP: #{completedOrder.mpPaymentId}</span>
                )}
                {completedOrder.mpOrderId && (
                  <span>Orden MP: {completedOrder.mpOrderId}</span>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="p-3.5 bg-sky-50 border border-sky-200 rounded-2xl text-xs text-sky-950 space-y-1.5 animate-in fade-in">
            <p className="font-bold flex items-center gap-1.5 text-sky-900">
              <CreditCard className="w-4 h-4 text-sky-600" />
              <span>Pago con Mercado Pago Aprobado</span>
            </p>
            <p className="text-[11px] text-sky-700">
              Tu pago anticipado fue confirmado vía Mercado Pago y tu pedido ya está en preparación.
            </p>
            {(completedOrder.mpPaymentId || completedOrder.mpOrderId) && (
              <div className="pt-1 border-t border-sky-200/70 flex flex-wrap gap-2 text-[10px] font-mono text-sky-900">
                {completedOrder.mpPaymentId && (
                  <span>Operación MP: #{completedOrder.mpPaymentId}</span>
                )}
                {completedOrder.mpOrderId && (
                  <span>Orden MP: {completedOrder.mpOrderId}</span>
                )}
              </div>
            )}
          </div>
        )}

        {/* Despensa Inteligente: Frecuencia de reposición si hay alimento */}
        {completedOrder.hasFoodItem && (
          <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-50 via-teal-50/80 to-[#E6F4F1] border-2 border-[#F5BA13]/30 shadow-sm space-y-3 animate-in fade-in duration-300">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#F5BA13] text-[#1D1D1F] text-white flex items-center justify-center shrink-0 shadow-sm text-lg">
                🥫
              </div>
              <div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 bg-white px-2 py-0.5 rounded-full border border-emerald-200">
                    Despensa Inteligente
                  </span>
                  <span className="text-[10px] font-bold text-teal-700">1 solo clic</span>
                </div>
                <h4 className="text-xs sm:text-sm font-black text-slate-900 mt-1">
                  ¿Cada cuánto tiempo sueles reponer el alimento seco en casa?
                </h4>
                <p className="text-[11px] text-slate-600 font-medium">
                  Así tendremos listo tu próximo pedido habitual para que lo repitas sin complicaciones.
                </p>
              </div>
            </div>

            {replenishmentSaved ? (
              <div className="p-3 bg-white/95 rounded-xl border border-emerald-300 flex items-center gap-2.5 text-xs font-bold text-emerald-800 animate-in zoom-in-95 shadow-2xs">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>
                  ¡Anotado! Te recordaremos reponer en <strong>{selectedReplenishFrequency} días</strong> y podrás pedir todo junto con 1 clic en tu perfil.
                </span>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                  {[15, 21, 30, 45, 60].map((days) => (
                    <button
                      key={days}
                      type="button"
                      onClick={() => onSaveReplenishment(days)}
                      className={`py-2 px-1.5 rounded-xl border text-center transition-all cursor-pointer ${
                        selectedReplenishFrequency === days
                          ? 'bg-[#F5BA13] text-[#1D1D1F] text-white border-[#F5BA13] shadow-sm font-black scale-102'
                          : 'bg-white hover:bg-emerald-50/80 text-slate-700 border-slate-200/90 font-bold hover:border-[#F5BA13]/40'
                      }`}
                    >
                      <div className="text-xs font-black">{days} días</div>
                      <div className={`text-[9px] font-semibold ${selectedReplenishFrequency === days ? 'text-emerald-100' : 'text-slate-400'}`}>
                        {days === 30 ? '⭐ Habitual' : days < 30 ? 'Quincenal' : 'Bimestral'}
                      </div>
                    </button>
                  ))}
                </div>
                <div className="text-center">
                  <span className="text-[10px] text-slate-500 font-medium">
                    Toca los días para activar tu reposición automática sin cálculos manuales
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Botón de Finalizar */}
      <button
        onClick={onCloseAndFinish}
        className="w-full py-3.5 rounded-2xl bg-[#F5BA13] text-[#1D1D1F] hover:bg-[#10B981] text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg transition-transform active:scale-95 cursor-pointer mt-4"
      >
        <span>FINALIZAR Y SEGUIR EXPLORANDO</span>
      </button>
    </div>
  );
}

