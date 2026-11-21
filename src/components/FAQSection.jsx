import React, { useState } from 'react';
import { ChevronDown, HelpCircle, MessageSquare } from 'lucide-react';
import { COMPANY_INFO } from '../constants';
import { PERROS_FAQS, GATOS_FAQS, GENERAL_FAQS } from '../data/faqData';

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
          href={`${COMPANY_INFO.whatsappUrl}?text=Hola%20Patitas%20del%20Sur%2C%20tengo%20una%20consulta%20nutricional`}
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
