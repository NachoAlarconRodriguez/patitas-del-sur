import React from 'react';
import { Truck, Clock, MapPin, ShieldCheck, Sparkles, CheckCircle2 } from 'lucide-react';

const DELIVERY_ZONES = [
  {
    comuna: 'Llanquihue',
    badge: 'Base Operativa 🏡',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    time: '2 a 4 Horas (Mismo Día)',
    standardCost: '$2.500 CLP',
    freeThreshold: 'Gratis desde $35.000',
    schedule: 'Lunes a Sábado de 09:00 a 19:30 hrs',
    featured: true,
  },
  {
    comuna: 'Puerto Varas',
    badge: 'Express Lacustre ⚡',
    badgeColor: 'bg-teal-100 text-teal-800 border-teal-300',
    time: '2 a 4 Horas (Mismo Día)',
    standardCost: '$3.500 CLP',
    freeThreshold: 'Gratis desde $35.000',
    schedule: 'Lunes a Sábado de 09:00 a 19:30 hrs',
    featured: true,
  },
  {
    comuna: 'Frutillar',
    badge: '24 Horas Hábiles ⏱️',
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-300',
    time: '24 Horas Hábiles',
    standardCost: '$3.900 CLP',
    freeThreshold: 'Gratis desde $35.000',
    schedule: 'Rutas martes, jueves y sábados',
    featured: false,
  },
  {
    comuna: 'Puerto Montt',
    badge: '24 a 48 Horas 📦',
    badgeColor: 'bg-sky-100 text-sky-800 border-sky-300',
    time: '24 a 48 Horas Hábiles',
    standardCost: '$4.900 CLP',
    freeThreshold: 'Gratis desde $35.000',
    schedule: 'Rutas diarias de lunes a viernes',
    featured: false,
  },
];

export default function LocalDeliveryZones({ className = '' }) {
  return (
    <section
      aria-label="Zonas de despacho local en Los Lagos"
      className={`bg-white rounded-3xl p-6 sm:p-8 md:p-10 border border-slate-200/90 shadow-sm ${className}`}
    >
      {/* Header */}
      <div className="max-w-2xl mx-auto text-center space-y-2.5 mb-8 sm:mb-10">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-[#0E8388]/10 text-[#0E8388]">
          <MapPin className="w-3.5 h-3.5" />
          <span>Cobertura Región de Los Lagos</span>
        </div>
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
          Despacho a Domicilio en el Sur de Chile 🚚
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
          Llevamos la mejor nutrición directamente a tu puerta en la Cuenca del Lago Llanquihue y Puerto Montt, con sacos sellados y seguimiento directo.
        </p>
      </div>

      {/* Grid of Delivery Zones */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 mb-8">
        {DELIVERY_ZONES.map((zone) => (
          <div
            key={zone.comuna}
            className={`rounded-2xl p-5 border transition-all flex flex-col justify-between ${
              zone.featured
                ? 'bg-gradient-to-b from-[#E6F4F1]/60 via-white to-white border-[#0E8388]/30 shadow-xs ring-1 ring-[#0E8388]/15'
                : 'bg-white border-slate-200/90 hover:border-slate-300 shadow-2xs'
            }`}
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-1 flex-wrap">
                <h3 className="text-lg font-black text-slate-900">{zone.comuna}</h3>
                <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${zone.badgeColor}`}>
                  {zone.badge}
                </span>
              </div>

              <div className="space-y-1.5 text-xs">
                <div className="flex items-center gap-2 text-slate-700 font-bold">
                  <Clock className="w-3.5 h-3.5 text-[#0E8388] shrink-0" />
                  <span>{zone.time}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-500 font-medium text-[11px]">
                  <Truck className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>Tarifa estándar: <strong className="text-slate-700">{zone.standardCost}</strong></span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
              <span className="font-extrabold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                {zone.freeThreshold}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Trust Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-6 border-t border-slate-100 text-slate-700 text-xs font-semibold">
        <div className="flex items-center gap-2.5 justify-center sm:justify-start">
          <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <span>Envío Gratis sobre $35.000 CLP</span>
        </div>
        <div className="flex items-center gap-2.5 justify-center">
          <div className="w-8 h-8 rounded-full bg-teal-100 text-[#0E8388] flex items-center justify-center shrink-0">
            <Clock className="w-4 h-4" />
          </div>
          <span>Entrega el mismo día en Puerto Varas</span>
        </div>
        <div className="flex items-center gap-2.5 justify-center sm:justify-end">
          <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <span>Garantía Legal de Satisfacción SERNAC</span>
        </div>
      </div>
    </section>
  );
}
