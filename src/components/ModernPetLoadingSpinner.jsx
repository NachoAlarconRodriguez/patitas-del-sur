import React, { useState, useEffect } from 'react';

// Huella Canina Vectorial Moderna (4 dedos ovalados + almohadilla triangular)
function DogPawIcon({ className = '', style = {} }) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      style={style}
      fill="currentColor"
      aria-hidden="true"
    >
      <ellipse cx="26" cy="30" rx="8" ry="12" transform="rotate(-18 26 30)" />
      <ellipse cx="42" cy="18" rx="8.5" ry="13" transform="rotate(-5 42 18)" />
      <ellipse cx="58" cy="18" rx="8.5" ry="13" transform="rotate(5 58 18)" />
      <ellipse cx="74" cy="30" rx="8" ry="12" transform="rotate(18 74 30)" />
      <path d="M50 42 C40 42, 28 47, 24 58 C20 68, 25 79, 36 82 C43 84, 47 80, 50 82 C53 80, 57 84, 64 82 C75 79, 80 68, 76 58 C72 47, 60 42, 50 42 Z" />
    </svg>
  );
}

// Huella Felina Vectorial Moderna (4 dedos circulares + almohadilla trilobulada)
function CatPawIcon({ className = '', style = {} }) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      style={style}
      fill="currentColor"
      aria-hidden="true"
    >
      <circle cx="24" cy="32" r="9" />
      <circle cx="41" cy="19" r="9.5" />
      <circle cx="59" cy="19" r="9.5" />
      <circle cx="76" cy="32" r="9" />
      <path d="M50 44 C38 44, 27 51, 25 63 C23 73, 29 82, 38 82 C42 82, 46 76, 50 76 C54 76, 58 82, 62 82 C71 82, 77 73, 75 63 C73 51, 62 44, 50 44 Z" />
    </svg>
  );
}

const PHRASES_BY_TYPE = {
  perros: [
    'Buscando las mejores recetas 100% Grain Free...',
    'Seleccionando nutrición natural con salmón y cordero...',
    'Verificando premios naturales y snacks deshidratados...',
    'Sincronizando stock fresco para despacho express...',
    'Preparando catálogo con amor para tu perro...',
  ],
  gatos: [
    'Buscando las mejores recetas de salmón y trucha austral...',
    'Seleccionando patés holísticos y bocaditos naturales...',
    'Verificando fórmulas para salud urinaria y renal...',
    'Sincronizando stock fresco para despacho express...',
    'Preparando catálogo con amor para tu felino...',
  ],
  both: [
    'Preparando selección de nutrición natural de la Patagonia...',
    'Buscando recetas 100% naturales con salmón y cordero...',
    'Verificando stock fresco para despacho express en Puerto Varas...',
    'Cargando las mejores recetas para perros y gatos...',
    'Sincronizando productos holísticos de alta calidad...',
  ],
};

export default function ModernPetLoadingSpinner({
  petType = 'both',
  showSkeletons = true,
  customMessage = null,
}) {
  const phrases = PHRASES_BY_TYPE[petType] || PHRASES_BY_TYPE.both;
  const [phraseIdx, setPhraseIdx] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setPhraseIdx((prev) => (prev + 1) % phrases.length);
    }, 2400);
    return () => clearInterval(timer);
  }, [phrases.length]);

  return (
    <div className="w-full py-6 sm:py-8 space-y-8 animate-in fade-in duration-300">
      {/* Tarjeta Principal Minimalista & Moderna */}
      <div className="relative max-w-md mx-auto bg-white/90 backdrop-blur-xl rounded-3xl p-7 sm:p-9 border border-slate-200/80 shadow-[0_8px_30px_rgb(0,0,0,0.05)] text-center overflow-hidden">
        {/* Luces Ambientales Patagónicas Suaves (Amber & Teal) */}
        <div className="absolute -top-12 -left-12 w-44 h-44 bg-[#F5BA13]/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -right-12 w-44 h-44 bg-[#0E8388]/15 rounded-full blur-3xl pointer-events-none" />

        {/* Spinner Orbital con Huellas de Perro y Gato */}
        <div className="relative w-28 h-28 mx-auto mb-5 flex items-center justify-center">
          {/* Aro de Pista Suave */}
          <div className="absolute inset-0 rounded-full border-2 border-slate-100/90" />

          {/* Halo de Pulso Concéntrico Sutil */}
          <div
            className="absolute inset-0 rounded-full border border-amber-400/30 animate-ping opacity-30 pointer-events-none"
            style={{ animationDuration: '2.8s' }}
          />

          {/* Anillo de Carga Giratorio con Gradiente Suave */}
          <svg
            className="absolute inset-0 w-full h-full animate-spin pointer-events-none"
            style={{ animationDuration: '2.6s', animationTimingFunction: 'linear' }}
            viewBox="0 0 100 100"
          >
            <defs>
              <linearGradient id="petSpinnerGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#F5BA13" stopOpacity="1" />
                <stop offset="60%" stopColor="#D97706" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#0E8388" stopOpacity="0.1" />
              </linearGradient>
            </defs>
            <circle
              cx="50"
              cy="50"
              r="44"
              fill="none"
              stroke="url(#petSpinnerGrad)"
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray="160 110"
            />
          </svg>

          {/* Núcleo Central de Cristal con Huellas de Perro y Gato */}
          <div className="relative z-10 w-20 h-20 rounded-full bg-white/95 backdrop-blur-md shadow-inner border border-slate-100 flex items-center justify-center gap-1.5 p-2.5">
            {/* Huella Canina (Ámbar Patagonia) */}
            <div className="w-8 h-8 flex items-center justify-center text-[#F5BA13] animate-paw-dog">
              <DogPawIcon className="w-full h-full -rotate-6 transition-all duration-300" />
            </div>

            {/* Huella Felina (Verde Azulado Patagonia) */}
            <div className="w-7 h-7 flex items-center justify-center text-[#0E8388] animate-paw-cat">
              <CatPawIcon className="w-full h-full rotate-6 transition-all duration-300" />
            </div>
          </div>
        </div>

        {/* Secuencia de Pasitos de Huellas (Dog & Cat en alternancia suave) */}
        <div className="flex items-center justify-center gap-3 mb-4 select-none">
          <span className="w-4 h-4 text-[#F5BA13] animate-paw-step-1 opacity-70">
            <DogPawIcon className="w-full h-full" />
          </span>
          <span className="w-3.5 h-3.5 text-[#0E8388] animate-paw-step-2 opacity-70">
            <CatPawIcon className="w-full h-full" />
          </span>
          <span className="w-4 h-4 text-[#F5BA13] animate-paw-step-3 opacity-70">
            <DogPawIcon className="w-full h-full" />
          </span>
          <span className="w-3.5 h-3.5 text-[#0E8388] animate-paw-step-4 opacity-70">
            <CatPawIcon className="w-full h-full" />
          </span>
        </div>

        {/* ÚNICA LÍNEA DE TEXTO DINÁMICA (Sin sobrecarga ni texto infantil) */}
        <div className="h-7 flex items-center justify-center px-2 overflow-hidden">
          <div
            key={phraseIdx}
            className="inline-flex items-center gap-2 text-slate-700 text-xs sm:text-sm font-semibold tracking-tight animate-phrase-slide"
          >
            <span className="relative flex h-2 w-2 flex-shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#F5BA13] opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#D97706]" />
            </span>
            <span className="truncate">{customMessage || phrases[phraseIdx]}</span>
          </div>
        </div>

        {/* Línea Sutil Shimmer de Progreso */}
        <div className="w-36 mx-auto h-1 bg-slate-100 rounded-full overflow-hidden mt-3 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#F5BA13] to-transparent animate-modern-shimmer" />
        </div>
      </div>

      {/* Grid de Tarjetas Esqueleto Shimmer (Estructura limpia de 4 columnas) */}
      {showSkeletons && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium px-2">
            <span className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#F5BA13] animate-pulse" />
              Sincronizando recetas con bodega Puerto Varas...
            </span>
            <span className="hidden sm:inline">Nutrición Natural · Despacho Express</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((n) => (
              <div
                key={n}
                className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-4 relative overflow-hidden"
              >
                {/* Imagen del producto en skeleton */}
                <div className="h-48 w-full rounded-2xl skeleton-shimmer flex items-center justify-center relative overflow-hidden">
                  <div className="w-8 h-8 text-slate-300 opacity-40">
                    {n % 2 === 0 ? <DogPawIcon className="w-full h-full" /> : <CatPawIcon className="w-full h-full" />}
                  </div>
                  <div className="absolute top-3 left-3 w-16 h-5 rounded-full bg-white/70 backdrop-blur-xs" />
                  <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/70 backdrop-blur-xs" />
                </div>

                {/* Líneas de información */}
                <div className="space-y-2.5 pt-1">
                  <div className="h-3 w-20 rounded-full skeleton-shimmer" />
                  <div className="h-5 w-4/5 rounded-full skeleton-shimmer" />
                  <div className="h-3.5 w-3/5 rounded-full skeleton-shimmer" />
                </div>

                {/* Badges / Formato */}
                <div className="flex items-center gap-2 pt-2">
                  <div className="h-6 w-16 rounded-lg skeleton-shimmer" />
                  <div className="h-6 w-20 rounded-lg skeleton-shimmer" />
                </div>

                {/* Precio y Botón */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="h-2.5 w-12 rounded-full skeleton-shimmer" />
                    <div className="h-6 w-24 rounded-full skeleton-shimmer" />
                  </div>
                  <div className="h-10 w-24 rounded-2xl skeleton-shimmer" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
