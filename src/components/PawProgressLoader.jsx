import React, { useId } from 'react';

function PawPads() {
  return (
    <>
      <ellipse cx="12" cy="16.2" rx="5.2" ry="4.4" />
      <ellipse cx="5.4" cy="10.4" rx="2.1" ry="2.6" transform="rotate(-20 5.4 10.4)" />
      <ellipse cx="9.5" cy="6.3" rx="2.2" ry="2.8" transform="rotate(-8 9.5 6.3)" />
      <ellipse cx="14.5" cy="6.3" rx="2.2" ry="2.8" transform="rotate(8 14.5 6.3)" />
      <ellipse cx="18.6" cy="10.4" rx="2.1" ry="2.6" transform="rotate(20 18.6 10.4)" />
    </>
  );
}

/**
 * Cargador de Huella con relleno progresivo amarillo (#F5BA13) de 0% a 100%.
 * El área visible de la huella en el viewBox 0..24 va desde y=20.8 (base) hasta y=3.2 (punta de los dedos).
 */
export default function PawProgressLoader({ progress = 0, label }) {
  const uid = useId().replace(/:/g, '');
  const clamped = Math.max(0, Math.min(100, Math.round(progress)));

  // Mapea 0%..100% exactamente al rango vertical de la huella (20.8 -> 3.0)
  const minY = 3.0;
  const maxY = 20.8;
  const fillY = maxY - (clamped / 100) * (maxY - minY);

  const statusText =
    label ||
    (clamped < 38
      ? 'Olfateando la receta seleccionada...'
      : clamped < 80
      ? 'Cargando ingredientes e información nutricional...'
      : '¡Listo para servir!');

  return (
    <div
      className="pt-36 pb-28 min-h-[72vh] flex flex-col items-center justify-center px-6 bg-[#FAF9F6] select-none"
      role="status"
      aria-live="polite"
      aria-label={`Cargando producto: ${clamped}%`}
    >
      <div className="relative flex flex-col items-center max-w-sm w-full text-center">
        {/* Halo cálido detrás de la huella que crece con el porcentaje */}
        <div
          className="relative w-36 h-36 sm:w-40 sm:h-40 rounded-[36px] bg-white border border-[#1D1D1F]/8 shadow-[0_24px_50px_-22px_rgba(29,29,31,0.16)] flex items-center justify-center mb-6 overflow-hidden"
        >
          <div
            className="absolute inset-0 pointer-events-none transition-opacity duration-300"
            style={{
              background:
                'radial-gradient(circle at 50% 65%, rgba(245, 186, 19, 0.28) 0%, rgba(245, 186, 19, 0) 70%)',
              opacity: 0.25 + (clamped / 100) * 0.75,
            }}
          />

          <svg
            viewBox="0 0 24 24"
            className={`w-24 h-24 sm:w-28 sm:h-28 relative z-10 transition-transform duration-300 ${
              clamped >= 100 ? 'scale-108' : 'scale-100'
            }`}
            aria-hidden="true"
          >
            <defs>
              {/* Gradiente amarillo marca Patitas del Sur */}
              <linearGradient id={`paw-grad-${uid}`} x1="0" y1="1" x2="0" y2="0">
                <stop offset="0%" stopColor="#E5A200" />
                <stop offset="55%" stopColor="#F5BA13" />
                <stop offset="100%" stopColor="#FFD24C" />
              </linearGradient>

              {/* Máscara que sube desde la base de la almohadilla hasta los dedos */}
              <clipPath id={`paw-clip-${uid}`}>
                <rect
                  x="0"
                  y={fillY}
                  width="24"
                  height="24"
                  style={{
                    transition: 'y 180ms cubic-bezier(0.22, 1, 0.36, 1)',
                  }}
                />
              </clipPath>

              {/* Clip con la silueta de la huella para dibujar la línea brillante del nivel */}
              <clipPath id={`paw-shape-${uid}`}>
                <PawPads />
              </clipPath>
            </defs>

            {/* 1. Silueta base vacía (crema/gris suave) */}
            <g
              fill="#EFECE4"
              stroke="#1D1D1F"
              strokeOpacity="0.1"
              strokeWidth="0.35"
            >
              <PawPads />
            </g>

            {/* 2. Relleno amarillo progresivo según el porcentaje */}
            <g
              clipPath={`url(#paw-clip-${uid})`}
              fill={`url(#paw-grad-${uid})`}
              style={{
                filter: 'drop-shadow(0 2px 6px rgba(245, 186, 19, 0.35))',
              }}
            >
              <PawPads />
            </g>

            {/* 3. Franja brillante en el borde superior del líquido mientras sube */}
            {clamped > 2 && clamped < 99 && (
              <g clipPath={`url(#paw-shape-${uid})`}>
                <rect
                  x="0"
                  y={fillY - 0.35}
                  width="24"
                  height="0.75"
                  fill="#FFFBEB"
                  opacity="0.85"
                  style={{
                    transition: 'y 180ms cubic-bezier(0.22, 1, 0.36, 1)',
                  }}
                />
              </g>
            )}
          </svg>
        </div>

        {/* Porcentaje grande en tipografía Display */}
        <div className="inline-flex items-baseline gap-1 mb-1.5">
          <span
            className="text-3xl sm:text-4xl font-extrabold text-[#1D1D1F] tabular-nums tracking-tight"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            {clamped}%
          </span>
        </div>

        {/* Barra de progreso auxiliar minimalista */}
        <div className="w-48 h-2 rounded-full bg-[#1D1D1F]/8 overflow-hidden mb-3 p-0.5">
          <div
            className="h-full rounded-full bg-[#F5BA13] transition-all duration-200 ease-out"
            style={{ width: `${clamped}%` }}
          />
        </div>

        {/* Texto de estado cálido */}
        <p className="text-xs sm:text-sm font-bold text-[#1D1D1F]/65">
          {statusText}
        </p>
      </div>
    </div>
  );
}

