import React from 'react';
import { X, MapPin, Copy, ExternalLink, Calendar, Zap } from 'lucide-react';
import { WhatsAppIcon, GoogleMapsIcon } from '../../../components/OfficialIcons';
import { CENTRAL_HUB, getSingleOrderNavigationUrl } from '../../../services/googleMapsService';
import { formatOrderScheduleSummary } from '../../../services/dispatchService';

/**
 * Modal Optimizador de Rutas Multiparada (Google Maps)
 */
export default function RouteOptimizerModal({
  isOpen,
  optimizedRouteData,
  onClose,
  showToast,
}) {
  if (!isOpen || !optimizedRouteData) return null;

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-[#EAECEF] text-[#111827] overflow-hidden flex flex-col max-h-[90vh] font-sans"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-5 sm:p-6 bg-white border-b border-[#EAECEF] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-[#FEF3C7] border border-[#FDE68A]/60 flex items-center justify-center text-[#D97706] shrink-0">
              <GoogleMapsIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-[#111827] tracking-tight flex items-center gap-2">
                <span>Ruta óptima de despacho</span>
                <span className="px-2.5 py-0.5 rounded-full bg-[#FEF3C7] text-[#D97706] border border-[#FDE68A]/60 text-[10px] font-bold">
                  Google Maps
                </span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Secuencia inteligente ordenada para menor consumo de combustible
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-[#F8FAFC] hover:bg-slate-100 border border-[#EAECEF] text-slate-500 hover:text-[#111827] flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Metrics Bar */}
        <div className="grid grid-cols-3 gap-2.5 px-5 sm:px-6 py-3.5 bg-[#F8FAFC] border-b border-[#EAECEF] text-xs shrink-0">
          <div className="p-3 rounded-2xl bg-white border border-[#EAECEF]">
            <span className="text-[11px] font-semibold text-slate-500 block">Paradas</span>
            <span className="text-base font-extrabold text-[#111827] mt-0.5 block">
              {optimizedRouteData.optimizedOrders.length} domicilios
            </span>
          </div>
          <div className="p-3 rounded-2xl bg-white border border-[#EAECEF]">
            <span className="text-[11px] font-semibold text-slate-500 block">Distancia aprox.</span>
            <span className="text-base font-extrabold text-[#D97706] mt-0.5 block">
              ~{optimizedRouteData.totalDistanceKm} km
            </span>
          </div>
          <div className="p-3 rounded-2xl bg-white border border-[#EAECEF]">
            <span className="text-[11px] font-semibold text-slate-500 block">Costo de la API</span>
            <span className="text-base font-extrabold text-[#78350F] mt-0.5 block">
              $0 CLP (Gratis)
            </span>
          </div>
        </div>

        {/* Stops Timeline (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-3">
          {/* Origin Hub Card */}
          <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-[#FEF3C7]/70 border border-[#FDE68A]/70 text-xs">
            <div className="w-8 h-8 rounded-full bg-[#D97706] text-white font-bold text-xs flex items-center justify-center shrink-0">
              🏢
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <span className="font-bold text-[#78350F] text-xs">
                  Punto de partida (Bodega central)
                </span>
                <span className="text-[10px] font-bold text-[#D97706] bg-white px-2.5 py-0.5 rounded-full border border-[#FDE68A]">
                  Inicio
                </span>
              </div>
              <p className="font-bold text-[#111827] mt-0.5">{CENTRAL_HUB.name}</p>
              <p className="text-[11px] text-slate-500">{CENTRAL_HUB.address}</p>
            </div>
          </div>

          {/* Stop Sequence */}
          <div className="relative pl-4 space-y-3 before:absolute before:left-7.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#EAECEF]">
            {optimizedRouteData.optimizedOrders.map((order, idx) => {
              const sched = formatOrderScheduleSummary(order);
              return (
              <div
                key={order.id || idx}
                className={`relative flex items-start gap-3 p-3.5 rounded-2xl border transition-all text-xs ${
                  sched.isUrgent
                    ? 'bg-gradient-to-br from-[#FFFBEB] via-[#FEF3C7]/60 to-white border-[#D97706]/50'
                    : 'bg-white border-[#EAECEF] hover:border-[#FDE68A]'
                }`}
              >
                <div className="w-7 h-7 rounded-full bg-[#D97706] text-white font-bold text-xs flex items-center justify-center shrink-0 z-10 ring-4 ring-white">
                  {order.stopNumber}
                </div>

                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <span className="font-bold text-[#111827] truncate block text-xs">
                        {order.customer}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        Pedido #{order.id}
                      </span>
                    </div>
                    <span className="text-[10px] font-bold text-[#D97706] bg-[#FEF3C7] px-2.5 py-0.5 rounded-full border border-[#FDE68A]/60 shrink-0">
                      +{order.legDistanceKm} km
                    </span>
                  </div>

                  <div className="flex items-start gap-1.5 text-slate-600 text-[11px]">
                    <MapPin className="w-3.5 h-3.5 text-[#D97706] shrink-0 mt-0.5" />
                    <span className="truncate">
                      {order.address}, <strong className="text-[#111827]">{order.city || 'Puerto Varas'}</strong>
                    </span>
                  </div>

                  {/* Día y ventana agendada */}
                  <div
                    className={`inline-flex flex-wrap items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold border ${
                      sched.isUrgent
                        ? 'bg-[#FEF3C7] text-[#78350F] border-[#D97706]/50'
                        : 'bg-[#FAF8F4] text-slate-700 border-slate-200/90'
                    }`}
                  >
                    {sched.isUrgent ? (
                      <Zap className="w-3 h-3 text-[#D97706] shrink-0 fill-current" />
                    ) : (
                      <Calendar className="w-3 h-3 text-[#D97706] shrink-0" />
                    )}
                    <span>{sched.dateShort}</span>
                    <span className="opacity-50">·</span>
                    <span className={sched.isUrgent ? 'text-[#92400E] font-black' : 'text-[#B45309]'}>
                      {sched.shortSlot}
                    </span>
                  </div>

                  {order.items && order.items.length > 0 && (
                    <div className="text-[10px] text-slate-500 truncate pt-0.5">
                      📦 {order.items.map((it) => `${it.quantity}x ${it.name}`).join(', ')}
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-1.5 border-t border-slate-100 text-[10px]">
                    <span className="font-bold text-[#111827] tabular-nums">
                      Total: ${Number(order.total || 0).toLocaleString('es-CL')}
                    </span>
                    <div className="flex items-center gap-1.5">
                      {order.phone && (
                        <a
                          href={`https://wa.me/${order.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                            `¡Hola ${order.customer}! Te contactamos de Patitas del Sur, tu pedido #${order.id} va en camino a ${order.address}. 🐾`
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2.5 py-0.5 rounded-full bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold border border-emerald-200/80 transition-colors flex items-center gap-1"
                          title="Avisar por WhatsApp"
                        >
                          <WhatsAppIcon className="w-3 h-3" />
                          <span>WhatsApp</span>
                        </a>
                      )}
                      <a
                        href={getSingleOrderNavigationUrl(order)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2.5 py-0.5 rounded-full bg-[#F8FAFC] hover:bg-[#FEF3C7] text-[#111827] hover:text-[#D97706] font-semibold border border-[#EAECEF] transition-colors flex items-center gap-1"
                        title="Navegar a esta parada en Google Maps"
                      >
                        <GoogleMapsIcon className="w-3 h-3" />
                        <span>Solo este</span>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
              );
            })}
          </div>
        </div>

        {/* Modal Footer / CTAs */}
        <div className="p-4 sm:p-5 bg-[#F8FAFC] border-t border-[#EAECEF] flex flex-col sm:flex-row items-center justify-between gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => {
              navigator.clipboard.writeText(optimizedRouteData.googleMapsUrl);
              showToast('📋 ¡Enlace de ruta copiado al portapapeles! Puedes enviarlo por WhatsApp al repartidor.');
            }}
            className="w-full sm:w-auto px-4 py-2.5 rounded-full bg-white hover:bg-slate-50 text-[#111827] border border-[#EAECEF] text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Copy className="w-3.5 h-3.5 text-[#D97706]" />
            <span>Copiar enlace de ruta</span>
          </button>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-full bg-white hover:bg-slate-50 text-slate-600 border border-[#EAECEF] text-xs font-semibold transition-all cursor-pointer"
            >
              Cerrar
            </button>
            <a
              href={optimizedRouteData.googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 sm:flex-none px-5 py-2.5 rounded-full bg-[#D97706] hover:bg-[#B45309] text-white text-xs font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <GoogleMapsIcon className="w-4 h-4 shrink-0" />
              <span>Iniciar ruta multiparada</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
