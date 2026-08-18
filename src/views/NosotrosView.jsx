import React from 'react';
import { ShieldCheck, HeartHandshake, Leaf, Award, MapPin } from 'lucide-react';
import Logo from '../components/Logo';

export default function NosotrosView() {
  return (
    <div className="pt-28 pb-20 bg-[#FAF9F6] text-slate-900 min-h-screen">
      
      {/* Brand Story Hero */}
      <section className="max-w-5xl mx-auto px-6 text-center space-y-6 mb-16">
        <div className="flex justify-center">
          <Logo className="h-16" />
        </div>
        <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tight">
          Nuestra Historia del Sur de Chile 🏔️
        </h1>
        <p className="text-slate-600 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
          Nacimos entre los fiordos, ríos y praderas de la Patagonia con una convicción clara: las mascotas merecen una nutrición tan pura y honesta como la naturaleza que nos rodea.
        </p>
      </section>

      {/* Mission Cards */}
      <section className="max-w-7xl mx-auto px-6 mb-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          <div className="bg-white rounded-3xl p-8 shadow-lg border border-slate-100 space-y-4">
            <div className="p-3.5 rounded-2xl bg-[#0E8388]/10 text-[#0E8388] w-fit">
              <Leaf className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Ingredientes Reales</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              Trabajamos con pescadores artesanales y ganaderos locales del sur para utilizar salmón austral fresco, cordero magro y superalimentos como el maqui y calafate.
            </p>
          </div>

          <div className="bg-white rounded-3xl p-8 shadow-lg border border-slate-100 space-y-4">
            <div className="p-3.5 rounded-2xl bg-[#10B981]/10 text-[#10B981] w-fit">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Formulación Veterinaria</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              Nuestras recetas son diseñadas por médicos veterinarios expertos en nutrición animal holística, garantizando digestibilidad superior y 0% rellenos artificiales.
            </p>
          </div>

          <div className="bg-white rounded-3xl p-8 shadow-lg border border-slate-100 space-y-4">
            <div className="p-3.5 rounded-2xl bg-[#C86D39]/10 text-[#C86D39] w-fit">
              <Award className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Sostenibilidad Activa</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              Nos preocupamos por el huella ecológica de nuestros envíos. Utilizamos empaques biodegradables y apoyamos refugios locales de rescate animal en el sur.
            </p>
          </div>

        </div>
      </section>

      {/* Origin Banner */}
      <section className="max-w-7xl mx-auto px-6">
        <div className="bg-slate-950 text-white rounded-3xl p-8 md:p-14 shadow-2xl border border-white/10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-4 max-w-xl">
            <div className="flex items-center gap-2 text-[#10B981] font-bold text-xs uppercase tracking-wider">
              <MapPin className="w-4 h-4" /> Desde Puerto Varas a todo Chile
            </div>
            <h2 className="text-3xl md:text-5xl font-black">
              Compromiso con el bienestar de tu mascota
            </h2>
            <p className="text-slate-300 text-sm leading-relaxed">
              Queremos que cada plato servido traiga energía vital, pelaje radiante y alegría a los miembros peludos de tu familia.
            </p>
          </div>

          <div className="shrink-0 flex items-center justify-center p-6 rounded-3xl bg-slate-900 border border-white/10 text-center">
            <div className="space-y-1">
              <div className="text-4xl font-black text-[#10B981]">100%</div>
              <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
                Garantía de Satisfacción
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
