import React from 'react';
import { Link } from 'react-router-dom';
import {
  Heart,
  ShieldCheck,
  Truck,
  Sparkles,
  MapPin,
  MessageCircle,
  CheckCircle2,
  ArrowRight,
  Clock,
  Activity,
  HeartPulse,
  ShieldAlert,
} from 'lucide-react';
import SEOHead from '../components/SEOHead';
import { getOrganizationSchema } from '../utils/schemaGenerators';

export default function NosotrosView() {
  return (
    <div className="pt-24 sm:pt-28 pb-20 bg-[#FAF9F6] text-slate-900 min-h-screen select-none">
      <SEOHead
        title="Nuestra Historia · Por qué creamos Patitas del Sur"
        description="Conoce la historia real de Patitas del Sur en Frutillar y la cuenca del lago Llanquihue: nacimos para que a ninguna mascota le falte jamás su alimento favorito ni sufra cambios bruscos de dieta."
        canonical="/nosotros"
        keywords="historia patitas del sur, alimento mascotas frutillar, pet shop puerto varas, nutricion canina llanquihue, despacho alimento mascotas lago llanquihue"
        jsonLd={getOrganizationSchema()}
      />

      {/* 1. HERO EMOCIONAL CON ATMÓSFERA DORADA Y JERARQUÍA EQUILIBRADA */}
      <section className="relative overflow-hidden pt-6 pb-12 sm:pb-16">
        {/* Atmósfera dorada envolvente de amanecer suave (Apple Design lighting principle) */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[420px] bg-[radial-gradient(ellipse_at_top,_rgba(245,186,19,0.22)_0%,_rgba(251,191,36,0.08)_50%,_transparent_75%)] pointer-events-none" />

        <div className="max-w-4xl mx-auto px-6 relative z-10 text-center space-y-6">
          {/* Badge del Origen */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/25 text-[#92400E] text-xs font-black uppercase tracking-wider shadow-xs">
            <MapPin className="w-3.5 h-3.5 text-[#D97706]" />
            <span>Nuestra Historia · Frutillar y Cuenca del Lago Llanquihue</span>
          </div>

          {/* Titular conciso de 1-2 líneas con gran impacto emocional */}
          <h1 className="font-heading font-black text-3xl sm:text-5xl md:text-6xl text-slate-950 tracking-tight leading-[1.12] max-w-3xl mx-auto">
            Una promesa nacida en el sur:
            <span className="block text-[#B45309] mt-1 sm:mt-2">
              que a tu regalón nunca le falte su comida.
            </span>
          </h1>

          {/* Subtítulo editorial con peso y aire */}
          <p className="text-slate-600 text-base sm:text-xl max-w-2xl mx-auto font-normal leading-relaxed">
            Nacimos de una historia de amor verdadero, una dolorosa pérdida y la convicción absoluta de que en nuestras ciudades del sur ninguna mascota debe volver a sufrir por falta de su alimento habitual.
          </p>

          {/* Fotografía Emocional en Frutillar (Muelle Lago Llanquihue y Volcán Osorno) */}
          <div className="pt-4 max-w-4xl mx-auto">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-amber-200/50 group bg-slate-900">
              <img
                src="/images/frutillar_mascot_story.jpg"
                alt="Perro y gato en el muelle de Frutillar mirando el lago Llanquihue y el volcán Osorno al atardecer"
                className="w-full h-[280px] sm:h-[400px] md:h-[460px] object-cover transition-transform duration-700 group-hover:scale-102"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent flex flex-col justify-end p-6 sm:p-8 text-left">
                <div className="flex items-center gap-2 text-amber-300 text-xs font-black uppercase tracking-wider mb-2">
                  <Sparkles className="w-4 h-4 text-[#F5BA13]" />
                  <span>Frutillar, Región de Los Lagos</span>
                </div>
                <p className="text-white text-base sm:text-xl font-bold max-w-2xl leading-snug drop-shadow-md">
                  “Cuidar su nutrición no es una transacción: es el acto de amor más constante que les podemos brindar cada día.”
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. LA HISTORIA REAL (CARTA EDITORIAL DEL FUNDADOR) */}
      <section className="max-w-4xl mx-auto px-6 py-8 sm:py-12">
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200/80 shadow-xl relative overflow-hidden space-y-8">
          {/* Acento lateral dorado cálido */}
          <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-[#F5BA13] via-[#D97706] to-[#F5BA13]" />

          {/* Cabecera de la carta */}
          <div className="flex items-center gap-3.5 border-b border-slate-100 pb-5">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-[#D97706] shrink-0">
              <Heart className="w-6 h-6 fill-[#F5BA13] text-[#D97706]" />
            </div>
            <div>
              <span className="text-[11px] font-black uppercase tracking-widest text-[#D97706]">Carta desde el corazón</span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                El dolor que transformamos en nuestro propósito
              </h2>
            </div>
          </div>

          <div className="space-y-6 text-slate-700 text-base sm:text-lg leading-relaxed font-normal">
            <p>
              Vivir en el sur de Chile, en comunas tranquilas y hermosas como <strong className="text-slate-900 font-bold">Frutillar, Llanquihue o Puerto Varas</strong>, es un privilegio invaluable. Pero también implica un desafío cotidiano que pocos comprenden hasta que se enfrentan a él: <strong className="text-slate-900 font-bold">la incertidumbre en el abastecimiento</strong>.
            </p>

            <p>
              Comprar alimento por plataformas nacionales muchas veces significa <strong className="text-slate-900 font-bold">esperar días de ruta incierta</strong> hacia el sur. Y en las tiendas locales de pueblos pequeños, la variedad es limitada y el stock de fórmulas específicas o terapéuticas se agota constantemente.
            </p>

            {/* Momento crítico destacado con diseño editorial respetuoso */}
            <div className="p-6 rounded-2xl bg-amber-500/8 border-l-4 border-[#F5BA13] border-y border-r border-amber-200/60 space-y-2.5">
              <div className="flex items-center gap-2 text-[#92400E] font-bold text-xs uppercase tracking-wider">
                <Clock className="w-4 h-4 text-[#D97706]" />
                <span>El punto de inflexión</span>
              </div>
              <p className="text-slate-800 text-base sm:text-lg italic leading-relaxed font-serif">
                “Un día, el saco de alimento de mis perritas se terminó antes de tiempo. Recorrí todas las tiendas de la zona y ninguna tenía su fórmula; por internet tardaba más de una semana. Sin otra alternativa para que no pasaran hambre, compré lo único disponible y les cambié la comida de golpe, de un día para otro.”
              </p>
            </div>

            <p>
              Ese cambio abrupto desencadenó una reacción renal severa. A una de mis perritas el cambio le afectó profundamente: su organismo colapsó produciendo <strong className="text-slate-900 font-bold">cálculos renales</strong> que derivaron en una <strong className="text-slate-900 font-bold">insuficiencia renal fulminante</strong>. A pesar de los tratamientos de urgencia, su pequeño cuerpo no resistió y partió de este mundo.
            </p>

            {/* Pull-quote editorial destacada */}
            <div className="py-2">
              <div className="border-l-4 border-[#F5BA13] pl-5 sm:pl-6 py-1">
                <p className="text-xl sm:text-2xl font-black text-slate-950 leading-snug tracking-tight">
                  «La impotencia y el dolor fueron desgarradores. Perder a una compañera de vida por un simple quiebre de stock local no le debía volver a pasar a ninguna familia.»
                </p>
              </div>
            </div>

            <p>
              De esa herida nació <strong className="text-slate-950 font-black">Patitas del Sur</strong>. No como un negocio más de mascotas, sino como un escudo de tranquilidad para quienes aman a sus perros y gatos como parte de su familia.
            </p>
          </div>

          {/* Firma y dedicatoria conmemorativa íntima */}
          <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-[#D97706]">
                <Heart className="w-5 h-5 fill-[#F5BA13] text-[#D97706]" />
              </div>
              <div>
                <div className="font-black text-slate-900 text-sm">Equipo Fundador Patitas del Sur</div>
                <div className="text-xs text-slate-500 font-medium">Frutillar, Llanquihue & Puerto Varas</div>
              </div>
            </div>

            <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-amber-50 text-amber-900 border border-amber-200/80 text-xs font-bold">
              <span>En memoria de quien inspiró este camino</span>
              <Heart className="w-3.5 h-3.5 fill-red-500 text-red-500" />
            </div>
          </div>
        </div>
      </section>

      {/* 3. SECCIÓN DESTACADA: EL MANIFIESTO Y NUESTROS 3 PILARES */}
      <section className="max-w-6xl mx-auto px-6 py-8 sm:py-12">
        <div className="relative rounded-[2.5rem] p-8 sm:p-14 bg-gradient-to-br from-[#F5BA13] via-[#FBBF24] to-[#F59E0B] text-[#1D1D1F] overflow-hidden shadow-2xl border border-amber-300/40">
          {/* Halos de luz sutiles */}
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-white/25 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-[#D97706]/25 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 space-y-10 sm:space-y-12">
            
            {/* Cabecera del Manifiesto */}
            <div className="text-center space-y-3.5 max-w-3xl mx-auto">
              <span className="inline-block px-4 py-1.5 rounded-full bg-[#1D1D1F] text-[#F5BA13] text-xs font-black uppercase tracking-widest shadow-md">
                La Misión de Patitas del Sur
              </span>
              <h2 className="font-heading font-black text-3xl sm:text-5xl md:text-6xl text-[#1D1D1F] tracking-tight leading-tight">
                Que a tu regalón nunca le falte su comida favorita.
              </h2>
              <p className="text-[#1D1D1F]/90 text-base sm:text-xl font-bold leading-relaxed">
                Porque la continuidad nutricional no es un lujo: es la clave para que vivan sanos, felices y muchos años a nuestro lado.
              </p>
            </div>

            {/* 3 Pilares con acabado Glassmorphism integrado */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Pilar 1 */}
              <div className="bg-white/95 backdrop-blur-md rounded-3xl p-7 sm:p-8 shadow-xl border border-amber-300/40 space-y-4 hover:-translate-y-1.5 transition-all duration-300">
                <div className="w-14 h-14 rounded-2xl bg-amber-100 text-[#D97706] flex items-center justify-center shadow-inner">
                  <Activity className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-black text-slate-900 tracking-tight">
                  Cero Cambios Bruscos de Dieta
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed font-medium">
                  El sistema digestivo y renal de perros y gatos es delicado. Aseguramos la continuidad exacta de la fórmula que tu mascota tolera y disfruta, evitando inflamaciones, diarreas y estrés metabólico.
                </p>
                <div className="pt-2 flex items-center gap-1.5 text-xs font-black text-[#D97706]">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Salud y longevidad comprobada</span>
                </div>
              </div>

              {/* Pilar 2 */}
              <div className="bg-white/95 backdrop-blur-md rounded-3xl p-7 sm:p-8 shadow-xl border border-amber-300/40 space-y-4 hover:-translate-y-1.5 transition-all duration-300">
                <div className="w-14 h-14 rounded-2xl bg-amber-100 text-[#D97706] flex items-center justify-center shadow-inner">
                  <ShieldCheck className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-black text-slate-900 tracking-tight">
                  Stock Real en la Cuenca
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed font-medium">
                  No esperamos a que pidas para mandar a buscar tu saco a Santiago. Contamos con inventario físico fresco en la región de Los Lagos, garantizando disponibilidad inmediata cuando lo necesites.
                </p>
                <div className="pt-2 flex items-center gap-1.5 text-xs font-black text-[#D97706]">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Disponibilidad local permanente</span>
                </div>
              </div>

              {/* Pilar 3 */}
              <div className="bg-white/95 backdrop-blur-md rounded-3xl p-7 sm:p-8 shadow-xl border border-amber-300/40 space-y-4 hover:-translate-y-1.5 transition-all duration-300">
                <div className="w-14 h-14 rounded-2xl bg-amber-100 text-[#D97706] flex items-center justify-center shadow-inner">
                  <Truck className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-black text-slate-900 tracking-tight">
                  Despacho en la Puerta de tu Hogar
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed font-medium">
                  Olvídate de cargar sacos de 15 o 20 kilos o recorrer tiendas sin stock. Te lo llevamos directo a tu casa en Frutillar, Llanquihue, Puerto Varas y sectores aledaños con trato puntual y cordial.
                </p>
                <div className="pt-2 flex items-center gap-1.5 text-xs font-black text-[#D97706]">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Comodidad y tranquilidad absoluta</span>
                </div>
              </div>

            </div>

            {/* Frase de Compromiso con botón secundario integrado */}
            <div className="bg-[#1D1D1F] text-white rounded-3xl p-7 sm:p-9 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6 border border-white/10">
              <div className="space-y-1.5 text-center md:text-left">
                <div className="text-amber-400 font-mono text-xs font-black uppercase tracking-widest">
                  Nuestro Compromiso Inquebrantable
                </div>
                <h4 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                  “Nunca más el plato de tu compañero se quedará vacío.”
                </h4>
              </div>
              <Link
                to="/perros"
                className="px-6 py-3 rounded-full bg-[#F5BA13] text-[#1D1D1F] font-black text-sm hover:bg-white hover:scale-105 active:scale-95 transition-all shadow-md shrink-0 cursor-pointer"
              >
                Conocer Nuestro Catálogo
              </Link>
            </div>

          </div>
        </div>
      </section>

      {/* 4. CONSEJO VETERINARIO: SALUD PREVENTIVA Y CONTINUIDAD */}
      <section className="max-w-4xl mx-auto px-6 py-8 sm:py-12">
        <div className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-200/90 shadow-md space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-[#D97706] flex items-center justify-center shrink-0 border border-amber-500/20">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-black text-[#D97706] uppercase tracking-wider">Cuidado Veterinario Preventivo</span>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                ¿Por qué los cambios bruscos de alimento son tan peligrosos?
              </h3>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-sm text-slate-600 leading-relaxed font-medium">
            <div className="p-5 rounded-2xl bg-amber-50/40 border border-amber-200/60 space-y-2">
              <div className="flex items-center gap-2 text-slate-950 font-bold">
                <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
                <h4 className="font-black text-slate-900">Alteración del pH y Sistema Renal</h4>
              </div>
              <p>
                Cada alimento tiene un balance mineral (fósforo, calcio, magnesio) formulado específicamente. Cambiar bruscamente de receta altera el pH urinario, facilitando la precipitación de sales y la formación de cálculos renales u obstrucciones urinarias severas.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-amber-50/40 border border-amber-200/60 space-y-2">
              <div className="flex items-center gap-2 text-slate-950 font-bold">
                <HeartPulse className="w-4 h-4 text-amber-600 shrink-0" />
                <h4 className="font-black text-slate-900">Sensibilidad del Microbioma Digestivo</h4>
              </div>
              <p>
                Las enzimas y bacterias de la flora intestinal de perros y gatos requieren entre 7 y 10 días para adaptarse a nuevas proteínas y carbohidratos. Un cambio sin transición gradual provoca diarreas agudas, dolor abdominal y descompensación inmunológica.
              </p>
            </div>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/80 border border-amber-200/80 text-xs sm:text-sm text-amber-950 font-medium flex items-start sm:items-center gap-3">
            <Sparkles className="w-5 h-5 text-[#D97706] shrink-0 mt-0.5 sm:mt-0" />
            <span>
              <strong className="font-bold text-amber-900">Consejo de Patitas del Sur:</strong> Te ayudamos a programar tus pedidos con días de margen para que nunca te quedes con el saco vacío. Y si requieres cambiar de dieta, te asesoramos en un calendario de transición gradual y seguro.
            </span>
          </div>
        </div>
      </section>

      {/* 5. COBERTURA & CERCANÍA HUMANA (CTA CON JERARQUÍA CLARA) */}
      <section className="max-w-4xl mx-auto px-6 py-6 sm:py-8">
        <div className="bg-gradient-to-b from-white to-amber-50/60 rounded-3xl p-8 sm:p-10 border border-amber-200/80 shadow-lg text-center space-y-6">
          <div className="max-w-2xl mx-auto space-y-3">
            <span className="inline-block px-3 py-1 rounded-full bg-amber-100 text-[#78350F] text-xs font-black uppercase tracking-wider">
              Comunidad del Lago Llanquihue
            </span>
            <h3 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Frutillar · Llanquihue · Puerto Varas · Puerto Montt
            </h3>
            <p className="text-slate-600 text-sm sm:text-base font-normal">
              Si buscas un alimento específico, una receta medicada o quieres coordinar tu despacho a domicilio, escríbenos directamente. Te atenderemos personas de la zona que amamos a las mascotas tanto como tú.
            </p>
          </div>

          {/* Botones de Acción con jerarquía visual cuidada */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2">
            {/* CTA Primario Destacado: WhatsApp */}
            <a
              href="https://wa.me/56961205315?text=Hola!%20Leí%20la%20historia%20de%20Patitas%20del%20Sur%20y%20me%20gustaría%20consultar%20por%20el%20alimento%20de%20mi%20mascota."
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-full bg-[#25D366] hover:bg-[#20bd5a] text-white text-sm font-black transition-all shadow-md hover:shadow-lg active:scale-95 cursor-pointer"
            >
              <MessageCircle className="w-4 h-4 fill-white text-white" />
              <span>Escríbenos por WhatsApp</span>
            </a>

            {/* CTAs Secundarios: Catálogos */}
            <div className="flex items-center gap-2.5 w-full sm:w-auto justify-center">
              <Link
                to="/perros"
                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-full bg-[#1D1D1F] hover:bg-black text-white hover:text-[#F5BA13] text-xs sm:text-sm font-bold transition-all shadow-xs active:scale-95 cursor-pointer"
              >
                <span>Catálogo Canino</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#F5BA13]" />
              </Link>

              <Link
                to="/gatos"
                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-full bg-white hover:bg-slate-100 text-slate-800 text-xs sm:text-sm font-bold border border-slate-200/90 shadow-xs transition-all active:scale-95 cursor-pointer"
              >
                <span>Catálogo Felino</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}

