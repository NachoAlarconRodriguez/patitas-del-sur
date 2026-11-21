import React from 'react';
import { X } from 'lucide-react';
import { WhatsAppIcon } from '../../components/OfficialIcons';
import { COMPANY_INFO } from '../../constants';

/**
 * Modal de Seguimiento en Vivo de Despacho para clientes (PWA)
 */
export default function LiveDispatchTrackingModal({ order, onClose }) {
  if (!order) return null;

  const steps = [
    {
      step: 1,
      title: 'Pedido Confirmado',
      sub: 'Tu orden fue ingresada y validada en el sistema.',
      done: true,
      active: false,
    },
    {
      step: 2,
      title: 'Preparación en Bodega',
      sub: 'Empaque hermético y revisión de lote en Puerto Varas.',
      done: order.statusCode === 'en_camino' || order.statusCode === 'entregado',
      active: order.statusCode === 'en_preparacion',
    },
    {
      step: 3,
      title: 'En Camino a tu Domicilio',
      sub: `Despacho en móvil de reparto. Franja: ${order.deliverySlot || '14:00 - 19:00 hrs'}.`,
      done: order.statusCode === 'entregado',
      active: order.statusCode === 'en_camino',
    },
    {
      step: 4,
      title: 'Entregado en Domicilio',
      sub: 'Completado y firmado por el tutor.',
      done: order.statusCode === 'entregado',
      active: false,
    },
  ];

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-5 bg-gradient-to-br from-[#1D1D1F] via-[#2A1D0E] to-[#120D06] border-b border-amber-500/20 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 border border-white/10 backdrop-blur-md flex items-center justify-center text-xl shadow-inner">
              🚚
            </div>
            <div>
              <span className="text-[10px] font-black uppercase text-[#F5BA13] tracking-wider block">
                Seguimiento en Tiempo Real
              </span>
              <h3 className="text-base font-black leading-tight text-white">
                Pedido {order.id}
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Stepper Progress */}
        <div className="p-6 space-y-5">
          <div className="space-y-4">
            {steps.map((st, idx) => (
              <div key={st.step} className="flex items-start gap-3.5 relative">
                {idx < 3 && (
                  <div
                    className={`absolute left-4 top-8 w-0.5 h-8 ${
                      st.done ? 'bg-amber-500' : 'bg-slate-200'
                    }`}
                  />
                )}
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs shrink-0 z-10 ${
                    st.done
                      ? 'bg-amber-500 text-white shadow-xs'
                      : st.active
                      ? 'bg-[#F5BA13] text-[#1D1D1F] ring-4 ring-[#F5BA13]/25 animate-pulse'
                      : 'bg-slate-100 text-slate-400 border border-slate-200'
                  }`}
                >
                  {st.done ? '✓' : st.step}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <h4
                      className={`text-xs font-black ${
                        st.active ? 'text-amber-800' : st.done ? 'text-slate-900' : 'text-slate-400'
                      }`}
                    >
                      {st.title}
                    </h4>
                    {st.active && (
                      <span className="text-[10px] font-bold text-amber-900 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-300">
                        En Curso ⏳
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 font-medium">{st.sub}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Order Details Inset Card */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2 text-xs">
            <div className="flex justify-between text-slate-600">
              <span className="font-bold">Producto:</span>
              <span className="font-extrabold text-slate-900 truncate max-w-[200px]">{order.product}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span className="font-bold">Entrega:</span>
              <span className="font-black text-amber-900">
                {order.deliveryDayText || order.date} · {order.deliverySlot || 'Tarde'}
              </span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span className="font-bold">Pago:</span>
              <span className="font-bold text-slate-800">{order.paymentMethod || 'Tarjeta'}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span className="font-bold">Dirección:</span>
              <span className="font-medium text-slate-700 truncate max-w-[200px]">
                {order.address || 'Av. Los Colonos 1420, Puerto Varas'}
              </span>
            </div>
          </div>

          {/* Driver & Support Row */}
          <div className="flex items-center justify-between gap-3 pt-2 border-t border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-sm">
                👨‍✈️
              </div>
              <div>
                <div className="text-xs font-black text-slate-900">Rodrigo Muñoz</div>
                <div className="text-[10px] text-slate-500 font-bold">Repartidor Patitas Móvil</div>
              </div>
            </div>

            <a
              href={`https://wa.me/${COMPANY_INFO.whatsappRaw}?text=${encodeURIComponent(
                `Hola, tengo una consulta sobre mi entrega del pedido ${order.id}.`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs border border-emerald-200 flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Contactar por WhatsApp"
            >
              <WhatsAppIcon className="w-3.5 h-3.5 shrink-0" />
              <span>WhatsApp</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
