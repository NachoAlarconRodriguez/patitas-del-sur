import React, { useState, useMemo } from 'react';
import { ChevronDown, HelpCircle, MessageSquare } from 'lucide-react';
import { COMPANY_INFO } from '../constants';
import { PERROS_FAQS, GATOS_FAQS, GENERAL_FAQS, FRUTILLAR_FAQS } from '../data/faqData';

export default function FAQSection({
  type = 'all', // 'all' | 'perros' | 'gatos' | 'frutillar'
  faqs = null,
  title = 'Preguntas Frecuentes sobre Nutrición y Despacho en Frutillar',
  subtitle = 'Respuestas claras y directas sobre alimentación natural, despacho a domicilio en Frutillar y medios de pago.',
}) {
  // Filtrar FAQs según prop explícita o tipo de página
  const faqsToDisplay = useMemo(() => {
    if (Array.isArray(faqs) && faqs.length > 0) {
      return faqs;
    }
    if (type === 'frutillar') {
      return FRUTILLAR_FAQS;
    }
    if (type === 'perros') {
      return [...PERROS_FAQS, ...GENERAL_FAQS.slice(0, 2)];
    }
    if (type === 'gatos') {
      return [...GATOS_FAQS, ...GENERAL_FAQS.slice(0, 2)];
    }
    return [...PERROS_FAQS, ...GATOS_FAQS, ...GENERAL_FAQS];
  }, [type, faqs]);

  const [openId, setOpenId] = useState(() => faqsToDisplay[0]?.id || null);

  const toggleAccordion = (id) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  return (
    <section
      aria-label="Preguntas frecuentes"
      className="py-10 sm:py-12 bg-white rounded-3xl border border-[#1D1D1F]/10 shadow-xs p-5 sm:p-10 my-8 sm:my-10"
    >
      {/* Header */}
      <div className="max-w-3xl mb-7 sm:mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FEF3C7] text-[#78350F] border border-[#F5BA13]/40 text-xs font-extrabold uppercase tracking-wider mb-3">
          <HelpCircle className="w-3.5 h-3.5 text-[#D97706]" />
          <span>Respuestas Directas · Frutillar</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-[#1D1D1F] tracking-tight">
          {title}
        </h2>
        <p className="text-slate-600 text-sm mt-2 leading-relaxed">
          {subtitle}
        </p>
      </div>

      {/* Accordion List (answers remain in DOM for SEO/AEO crawlers) */}
      <div className="space-y-3 max-w-4xl">
        {faqsToDisplay.map((faq) => {
          const isOpen = openId === faq.id;
          return (
            <div
              key={faq.id}
              className={`rounded-2xl border transition-all duration-200 ${
                isOpen
                  ? 'border-[#F5BA13] bg-[#FFFBEB]/55 shadow-xs'
                  : 'border-slate-200 hover:border-[#F5BA13]/60 bg-white'
              }`}
            >
              <button
                type="button"
                onClick={() => toggleAccordion(faq.id)}
                aria-expanded={isOpen}
                aria-controls={`faq-answer-${faq.id}`}
                className="w-full py-4 px-5 sm:px-6 text-left flex items-center justify-between gap-4 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F5BA13] rounded-2xl"
              >
                <div className="flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full bg-[#D97706] shrink-0" />
                  <h3 className="font-bold text-[#1D1D1F] text-sm sm:text-base leading-snug m-0">
                    {faq.question}
                  </h3>
                </div>
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-transform duration-200 ${
                    isOpen ? 'rotate-180 bg-[#1D1D1F] text-[#F5BA13]' : 'bg-[#FAF8F4] text-[#1D1D1F]/70'
                  }`}
                >
                  <ChevronDown className="w-4 h-4" />
                </div>
              </button>

              <div
                id={`faq-answer-${faq.id}`}
                className={
                  isOpen
                    ? 'px-5 sm:px-6 pb-5 pt-2 text-slate-700 text-xs sm:text-sm space-y-2.5 border-t border-[#F5BA13]/25'
                    : 'hidden'
                }
              >
                {/* Resumen Inverted Pyramid (40-60 palabras destacadas para AEO) */}
                <p className="font-semibold text-[#1D1D1F] leading-relaxed bg-white p-3.5 rounded-xl border border-[#1D1D1F]/8">
                  {faq.shortAnswer}
                </p>
                {/* Explicación y detalle secundario */}
                {faq.details && (
                  <p className="text-slate-600 leading-relaxed">
                    {faq.details}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* CTA Box de Soporte Nutricional */}
      <div className="mt-8 p-4 sm:p-5 rounded-2xl bg-[#FAF8F4] border border-[#1D1D1F]/10 flex flex-col sm:flex-row items-center justify-between gap-4 max-w-4xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#1D1D1F] text-[#F5BA13] flex items-center justify-center shrink-0 shadow-xs">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-extrabold text-[#1D1D1F] text-xs sm:text-sm">
              ¿Necesitas ayuda para elegir el alimento ideal en Frutillar?
            </h4>
            <p className="text-slate-600 text-[11px] sm:text-xs">
              Escríbenos por WhatsApp y te orientamos según edad, peso y sensibilidad de tu mascota.
            </p>
          </div>
        </div>

        <a
          href={`${COMPANY_INFO.whatsappUrl}?text=${encodeURIComponent(COMPANY_INFO.whatsappDefaultMessage)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 px-5 py-2.5 rounded-full bg-[#1D1D1F] hover:bg-black text-white hover:text-[#F5BA13] text-xs font-extrabold transition-all active:scale-95 shadow-sm flex items-center gap-2 cursor-pointer"
        >
          <span>Consultar por WhatsApp</span>
        </a>
      </div>
    </section>
  );
}
