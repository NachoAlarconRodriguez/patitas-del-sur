import React, { useState } from 'react';
import { ChevronDown, HelpCircle, MessageSquare, Truck, ShieldCheck, Sparkles, CheckCircle2 } from 'lucide-react';

export const PERROS_FAQS = [
  {
    id: 'perros-donde-comprar',
    category: 'perros',
    question: '¿Dónde comprar alimento super premium para perros en Puerto Varas y Llanquihue?',
    shortAnswer: 'Puedes comprar alimento super premium y 100% natural para perros directamente en Patitas del Sur (patitasdelsur.cl).',
    details: 'Ofrecemos marcas líderes como Bravery (100% Grain Free) y Patagonia Holística con despacho a domicilio el mismo día en Puerto Varas y Llanquihue, y en 24 a 48 horas en Frutillar y Puerto Montt. Despacho gratis en pedidos desde $35.000 CLP.',
  },
  {
    id: 'perros-beneficios-grain-free',
    category: 'perros',
    question: '¿Por qué elegir un alimento Grain Free (libre de grano) para mi perro?',
    shortAnswer: 'Los alimentos libres de grano eliminan cereales inflamatorios (maíz, trigo y soya) y los reemplazan por carne deshidratada de alta calidad y carbohidratos digestibles como la tapioca.',
    details: 'Esto previene alergias alimentarias, dermatitis atópica, infecciones de oído y problemas gastrointestinales, favoreciendo una digestión liviana, heces firmes y un pelaje brillante y resistente a la lluvia.',
  },
  {
    id: 'perros-mejor-antiparasitario',
    category: 'perros',
    question: '¿Cuál es el mejor antiparasitario para perros en la Región de Los Lagos?',
    shortAnswer: 'Para la Patagonia recomendamos NexGard Spectra (mensual integral), Bravecto (masticable de 12 semanas) o Simparica Trio.',
    details: 'En el sur de Chile los perros están expuestos tanto a parásitos externos (garrapatas y pulgas en pastizales) como internos. NexGard Spectra y Simparica Trio protegen contra parásitos intestinales y gusano del corazón, mientras que Bravecto otorga 3 meses continuos de eficacia antipulgas y garrapatas.',
  },
  {
    id: 'perros-snacks-deshidratados',
    category: 'perros',
    question: '¿Qué ventajas tienen los snacks deshidratados 100% naturales?',
    shortAnswer: 'Nuestros snacks Sur Natural son monoproteicos, hechos con 100% pulmón o carne de res deshidratada a baja temperatura, sin conservantes ni aditivos químicos.',
    details: 'Aportan más del 70% de proteína pura, son ideales para adiestramiento positivo y no aportan calorías vacías ni sales dañinas para la salud renal.',
  },
];

export const GATOS_FAQS = [
  {
    id: 'gatos-salud-urinaria',
    category: 'gatos',
    question: '¿Cómo prevenir problemas urinarios y renales en gatos?',
    shortAnswer: 'Combinando alimento seco super premium bajo en cenizas y fósforo con alimento húmedo diario rico en agua (mínimo 80% de humedad).',
    details: 'Los gatos evolucionaron en el desierto y beben poca agua por instinto. Al incorporar fórmulas como Bravery Cat y patés húmedos de salmón Chiloé Sea Recipes, aseguras la hidratación fisiológica de los riñones, previniendo cristales urinarios y cistitis idiopática felina.',
  },
  {
    id: 'gatos-taurina-importancia',
    category: 'gatos',
    question: '¿Por qué es indispensable la taurina en el alimento para gatos?',
    shortAnswer: 'La taurina es un aminoácido esencial que el organismo del gato no puede sintetizar por sí mismo y debe obtenerse obligatoriamente de la dieta.',
    details: 'La deficiencia de taurina provoca ceguera irreversible (degeneración retiniana central) y fallas cardíacas severas (cardiomiopatía dilatada). Nuestras fórmulas felinas contienen taurina pura biodisponible en dosis óptimas.',
  },
  {
    id: 'gatos-antiparasitarios-spot-on',
    category: 'gatos',
    question: '¿Qué antiparasitario es más seguro y fácil de aplicar en gatos?',
    shortAnswer: 'Las pipetas tópicas spot-on como Bravecto Plus (12 semanas) y Revolution Plus (mensual 6 en 1) son las opciones veterinarias más seguras y sin estrés.',
    details: 'Se aplican directamente en la piel de la nuca del gato, evitando tener que obligarlo a tragar pastillas. Protegen eficazmente contra pulgas, ácaros de la oreja, sarna y parásitos intestinales.',
  },
];

export const GENERAL_FAQS = [
  {
    id: 'general-zonas-despacho',
    category: 'general',
    question: '¿A qué comunas realizan despacho y cuáles son los tiempos de entrega?',
    shortAnswer: 'Despachamos en Puerto Varas, Llanquihue, Frutillar y Puerto Montt con flota propia.',
    details: 'En Puerto Varas y Llanquihue entregamos el mismo día (compras antes de las 14:00 hrs) o en un máximo de 24 horas hábiles. En Frutillar y Puerto Montt las entregas se realizan en 24 a 48 horas hábiles.',
  },
  {
    id: 'general-envio-gratis',
    category: 'general',
    question: '¿Cómo funciona el envío gratis en Patitas del Sur?',
    shortAnswer: 'El envío es 100% gratuito en cualquier comuna de nuestra zona de cobertura (Puerto Varas, Llanquihue, Frutillar y Puerto Montt) para todas las compras desde $35.000 CLP.',
    details: 'Para pedidos inferiores a $35.000 CLP, la tarifa es de sólo $2.000 en Puerto Varas, $2.500 en Llanquihue y $3.500 en Frutillar y Puerto Montt.',
  },
  {
    id: 'general-medios-pago',
    category: 'general',
    question: '¿Qué medios de pago aceptan?',
    shortAnswer: 'Aceptamos Webpay Plus (todas las tarjetas de crédito y débito chilenas), transferencia bancaria directa y pago en efectivo contra entrega.',
    details: 'Todas las transacciones en línea son procesadas con cifrado SSL bancario de 256 bits, garantizando la total seguridad de tus datos.',
  },
  {
    id: 'general-garantia-cambios',
    category: 'general',
    question: '¿Puedo cambiar un alimento si me equivoqué de receta o sabor?',
    shortAnswer: 'Sí. Aceptamos cambios dentro de los 10 primeros días de compra siempre que el envase permanezca sellado e intacto.',
    details: 'Además, todos nuestros productos cuentan con la garantía legal de 6 meses de la Ley del Consumidor (SERNAC) ante cualquier falla de sellado o calidad.',
  },
];

export default function FAQSection({
  type = 'all', // 'all' | 'perros' | 'gatos'
  title = 'Preguntas Frecuentes sobre Nutrición y Despacho',
  subtitle = 'Respuestas claras y directas respaldadas por veterinarios y especialistas en nutrición de la Patagonia.',
}) {
  const [openId, setOpenId] = useState(null);

  // Filtrar FAQs según el tipo de página
  const faqsToDisplay = React.useMemo(() => {
    if (type === 'perros') {
      return [...PERROS_FAQS, ...GENERAL_FAQS.slice(0, 2)];
    }
    if (type === 'gatos') {
      return [...GATOS_FAQS, ...GENERAL_FAQS.slice(0, 2)];
    }
    return [...PERROS_FAQS, ...GATOS_FAQS, ...GENERAL_FAQS];
  }, [type]);

  const toggleAccordion = (id) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  return (
    <section className="py-12 bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 sm:p-10 my-10">
      
      {/* Header */}
      <div className="max-w-3xl mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0E8388]/10 text-[#0E8388] text-xs font-bold uppercase tracking-wider mb-3">
          <HelpCircle className="w-3.5 h-3.5" />
          <span>Guía Nutricional & Respuestas Clave (AEO)</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          {title}
        </h2>
        <p className="text-slate-600 text-sm mt-2 leading-relaxed">
          {subtitle}
        </p>
      </div>

      {/* Accordion List */}
      <div className="space-y-3.5 max-w-4xl">
        {faqsToDisplay.map((faq) => {
          const isOpen = openId === faq.id;
          return (
            <div
              key={faq.id}
              className={`rounded-2xl border transition-all duration-200 ${
                isOpen
                  ? 'border-[#0E8388] bg-slate-50/70 shadow-sm'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <button
                type="button"
                onClick={() => toggleAccordion(faq.id)}
                aria-expanded={isOpen}
                aria-controls={`faq-answer-${faq.id}`}
                className="w-full py-4 px-5 sm:px-6 text-left flex items-center justify-between gap-4 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0E8388] rounded-2xl"
              >
                <div className="flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full bg-[#0E8388] shrink-0" />
                  <span className="font-bold text-slate-900 text-sm sm:text-base leading-snug">
                    {faq.question}
                  </span>
                </div>
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-transform duration-200 ${
                    isOpen ? 'rotate-180 bg-[#0E8388] text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  <ChevronDown className="w-4 h-4" />
                </div>
              </button>

              {isOpen && (
                <div
                  id={`faq-answer-${faq.id}`}
                  className="px-5 sm:px-6 pb-5 pt-1 text-slate-700 text-xs sm:text-sm space-y-2.5 border-t border-slate-200/60"
                >
                  {/* Resumen Inverted Pyramid (40-60 palabras destacadas) */}
                  <p className="font-semibold text-slate-900 leading-relaxed bg-white p-3 rounded-xl border border-slate-200/60">
                    💡 {faq.shortAnswer}
                  </p>
                  {/* Explicación y detalle secundario */}
                  <p className="text-slate-600 leading-relaxed">
                    {faq.details}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* CTA Box de Soporte Nutricional */}
      <div className="mt-8 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200/70 flex flex-col sm:flex-row items-center justify-between gap-4 max-w-4xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-slate-900 text-xs sm:text-sm">
              ¿Tu mascota tiene una necesidad nutricional específica?
            </h4>
            <p className="text-slate-600 text-[11px] sm:text-xs">
              Habla directamente con nuestro equipo por WhatsApp para recomendarte la fórmula exacta.
            </p>
          </div>
        </div>

        <a
          href="https://wa.me/56987654321?text=Hola%20Patitas%20del%20Sur%2C%20tengo%20una%20consulta%20nutricional"
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 px-5 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-transform active:scale-95 shadow-md flex items-center gap-2 cursor-pointer"
        >
          <span>Consultar por WhatsApp</span>
          <span>💬</span>
        </a>
      </div>

    </section>
  );
}
