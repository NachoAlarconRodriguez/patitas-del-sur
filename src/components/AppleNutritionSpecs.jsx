import React, { useId } from 'react';
import { Sparkles, ShieldCheck, Leaf } from 'lucide-react';
import { ANIMAL_SILHOUETTES } from './anatomicalSilhouettes';

/**
 * Mapea el origen de proteína a la silueta anatómica correspondiente de alta fidelidad
 */
export function getAnimalConfig(proteinSource = '') {
  const s = String(proteinSource || '').toLowerCase();

  // 1. Pescados y productos marinos (evaluar primero para evitar falsos positivos)
  if (
    s.includes('fish') ||
    s.includes('pescado') ||
    s.includes('salmon') ||
    s.includes('salmón') ||
    s.includes('trucha') ||
    s.includes('arenque')
  ) {
    return ANIMAL_SILHOUETTES.salmon;
  }

  // 2. Vacuno / Res / Bovino (evitar falsos positivos como 'freshwater')
  if (
    s.includes('vacuno') ||
    s.includes('beef') ||
    s.includes('buey') ||
    s.includes('bovino') ||
    /\b(res|carne de res)\b/i.test(s)
  ) {
    return ANIMAL_SILHOUETTES.vacuno;
  }

  // 3. Pollo y aves de granja
  if (
    s.includes('pollo') ||
    s.includes('chicken') ||
    s.includes('ave') ||
    s.includes('poultry')
  ) {
    return ANIMAL_SILHOUETTES.pollo;
  }

  // 4. Cordero y ovino
  if (
    s.includes('cordero') ||
    s.includes('lamb') ||
    s.includes('oveja') ||
    s.includes('ovino')
  ) {
    return ANIMAL_SILHOUETTES.cordero;
  }

  // 5. Conejo
  if (
    s.includes('conejo') ||
    s.includes('rabbit') ||
    s.includes('liebre') ||
    s.includes('hare')
  ) {
    return ANIMAL_SILHOUETTES.conejo;
  }

  // 6. Pato
  if (
    s.includes('pato') ||
    s.includes('duck')
  ) {
    return ANIMAL_SILHOUETTES.pato;
  }

  // Fallback por defecto elegante a Pollo
  return ANIMAL_SILHOUETTES.pollo;
}

/**
 * Extrae y calcula las especificaciones nutricionales
 */
export function getProductNutritionalSpecs(product, activeFlavor = '') {
  if (!product) {
    return {
      isNonFood: false,
      animalPercent: 70,
      grainPercent: 0,
      grainStatus: 'free',
      proteinSource: 'Proteína',
      isVeterinary: false,
    };
  }

  const nameLower = String(product.name || '').toLowerCase();
  const brandLower = String(product.brand || '').toLowerCase();
  const catLower = String(product.category || '').toLowerCase();
  const tagLower = String(product.tagline || '').toLowerCase();

  // Detectar productos no comestibles (arenas sanitarias, accesorios, etc.)
  if (catLower.includes('arena') || nameLower.includes('arena') || catLower.includes('accesorio') || catLower.includes('higiene')) {
    return {
      isNonFood: true,
      label1: '100% Natural',
      label2: 'Aglutinante',
      label3: 'Sin Polvo',
    };
  }

  // 1. Porcentaje de Proteína Animal Real
  let animalPercent = 70;
  if (typeof product.animalPercent === 'number' && product.animalPercent > 0) {
    animalPercent = product.animalPercent;
  } else if (typeof product.animal_percent === 'number' && product.animal_percent > 0) {
    animalPercent = product.animal_percent;
  } else if (brandLower.includes('alpha spirit') || nameLower.includes('alpha spirit')) {
    // Latas húmedas Alpha Spirit: 92% a 96% carnes frescas nobles
    animalPercent = 92;
  } else if (brandLower.includes('sur natural') || brandLower.includes('chiloé') || catLower.includes('snack') || nameLower.includes('snack') || nameLower.includes('premio')) {
    animalPercent = 100;
  } else if (brandLower.includes('bravery') || nameLower.includes('bravery')) {
    animalPercent = 85;
  } else if (brandLower.includes('acana') || nameLower.includes('acana') || brandLower.includes('orijen')) {
    animalPercent = 65;
  } else if (brandLower.includes('patagonia') || nameLower.includes('patagonia')) {
    animalPercent = 75;
  } else if (brandLower.includes('fit') || nameLower.includes('fit')) {
    animalPercent = 70;
  } else if (brandLower.includes('nomade') || nameLower.includes('nomade')) {
    animalPercent = 65;
  }

  // 2. Porcentaje de Grano
  let grainPercent = 0;
  let grainStatus = 'free'; // 'free' (0%), 'low' (15%), 'with' (35%)
  
  if (product.grainLevel === 'with' || product.gama === 'with') {
    grainStatus = 'with';
    grainPercent = 35;
  } else if (product.grainLevel === 'low' || product.gama === 'low' || tagLower.includes('arroz') || tagLower.includes('bajo en grano')) {
    grainStatus = 'low';
    grainPercent = 15;
  } else if (
    product.grainLevel === 'free' ||
    product.gama === 'free' ||
    tagLower.includes('grain free') ||
    tagLower.includes('libre de grano') ||
    brandLower.includes('alpha spirit') ||
    brandLower.includes('bravery') ||
    brandLower.includes('patagonia')
  ) {
    grainStatus = 'free';
    grainPercent = 0;
  } else {
    grainStatus = 'free';
    grainPercent = 0;
  }

  // 3. Origen de la Proteína: Prioridad absoluta al sabor/formato activo, luego a mainProtein y finalmente al nombre
  function matchProtein(str) {
    const s = String(str || '').toLowerCase();
    if (!s) return null;
    if (s.includes('pato') || s.includes('duck')) return 'Pato';
    if (s.includes('conejo') || s.includes('rabbit') || s.includes('liebre')) return 'Conejo';
    if (s.includes('cordero') || s.includes('lamb') || s.includes('oveja')) return 'Cordero';
    if (s.includes('fish') || s.includes('pescado') || s.includes('salmon') || s.includes('salmón') || s.includes('trucha') || s.includes('arenque')) return 'Salmón';
    if (s.includes('vacuno') || s.includes('beef') || s.includes('buey') || /\b(res|carne de res)\b/i.test(s)) return 'Vacuno';
    if (s.includes('pollo') || s.includes('chicken') || s.includes('ave') || s.includes('poultry')) return 'Pollo';
    return null;
  }

  const proteinSource = matchProtein(activeFlavor) || matchProtein(product.mainProtein) || matchProtein(product.name) || 'Pollo';

  return {
    isNonFood: false,
    animalPercent,
    grainPercent,
    grainStatus,
    proteinSource,
    isVeterinary: Boolean(product.isVeterinary || product.is_veterinary),
  };
}

/**
 * Componente Medidor Líquido con Silueta Anatómica Profesional
 */
function AnimalLiquidGauge({ animalConfig, percent }) {
  const uniqueId = useId().replace(/:/g, '');
  const clipId = `animal-clip-${uniqueId}`;
  const gradientId = `animal-grad-${uniqueId}`;

  const { viewBox, minY, maxY, d, gradientColors, outlineColor } = animalConfig;
  
  // Cálculo de altura líquida precisa dentro de los límites del animal (0 a 512)
  const boundedPercent = Math.min(100, Math.max(0, percent));
  const totalHeight = maxY - minY;
  const liquidHeight = totalHeight * (boundedPercent / 100);
  const fillTopY = maxY - liquidHeight;

  return (
    <div className="relative w-14 h-12 sm:w-16 sm:h-13 shrink-0 flex items-center justify-center">
      <svg
        viewBox={viewBox}
        className="w-full h-full drop-shadow-xs overflow-visible"
        aria-hidden="true"
      >
        <defs>
          {/* Máscara anatómica que limita el líquido al contorno del animal */}
          <clipPath id={clipId}>
            <path d={d} />
          </clipPath>

          {/* Gradiente vertical del líquido */}
          <linearGradient id={gradientId} x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor={gradientColors[1]} />
            <stop offset="100%" stopColor={gradientColors[0]} />
          </linearGradient>
        </defs>

        {/* 1. Silueta base translúcida (recipiente de cristal) */}
        <path
          d={d}
          className="fill-slate-200/50 stroke-slate-300/60"
          strokeWidth="10"
        />

        {/* 2. Líquido que sube dentro de la silueta */}
        <g clipPath={`url(#${clipId})`}>
          <rect
            x="0"
            y={fillTopY}
            width="512"
            height={512 - fillTopY + 20}
            fill={`url(#${gradientId})`}
            className="transition-all duration-700 ease-out"
          />

          {/* Menisco / reflejo luminoso en la superficie del líquido */}
          {boundedPercent > 5 && boundedPercent < 98 && (
            <line
              x1="0"
              y1={fillTopY}
              x2="512"
              y2={fillTopY}
              stroke="#ffffff"
              strokeWidth="12"
              strokeOpacity="0.9"
              strokeLinecap="round"
              className="transition-all duration-700 ease-out"
            />
          )}
        </g>

        {/* 3. Contorno anatómico nítido de alta precisión */}
        <path
          d={d}
          fill="none"
          stroke={outlineColor}
          strokeWidth="12"
          strokeLinejoin="round"
          strokeLinecap="round"
          strokeOpacity="0.85"
        />
      </svg>
    </div>
  );
}

/**
 * Componente Silueta Espiga de Trigo (Indicador Grano / Grain Free)
 */
function WheatStalkGauge({ grainPercent = 0, grainStatus = 'free' }) {
  const isGrainFree = grainPercent === 0 || grainStatus === 'free';
  const strokeColor = isGrainFree ? '#10B981' : '#D97706';
  const fillColor = isGrainFree ? 'none' : '#F59E0B';

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="w-8 h-11 flex items-center justify-center relative">
        <svg
          viewBox="0 -3 24 30"
          className="w-full h-full drop-shadow-xs transition-transform duration-300 hover:scale-105"
          fill={fillColor}
          stroke={strokeColor}
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <g transform="rotate(-45 12 12)">
            <path d="M2 22 16 8" />
            <path d="M3.47 12.53 5 11l1.53 1.53a3.5 3.5 0 0 1 0 4.94L5 19l-1.53-1.53a3.5 3.5 0 0 1 0-4.94Z" />
            <path d="M7.47 8.53 9 7l1.53 1.53a3.5 3.5 0 0 1 0 4.94L9 15l-1.53-1.53a3.5 3.5 0 0 1 0-4.94Z" />
            <path d="M11.47 4.53 13 3l1.53 1.53a3.5 3.5 0 0 1 0 4.94L13 11l-1.53-1.53a3.5 3.5 0 0 1 0-4.94Z" />
            <path d="M20 2h2v2a4 4 0 0 1-4 4h-2V6a4 4 0 0 1 4-4Z" />
            <path d="M11.47 17.47 13 19l-1.53 1.53a3.5 3.5 0 0 1-4.94 0L5 19l1.53-1.53a3.5 3.5 0 0 1 4.94 0Z" />
            <path d="M15.47 13.47 17 15l-1.53 1.53a3.5 3.5 0 0 1-4.94 0L9 15l1.53-1.53a3.5 3.5 0 0 1 4.94 0Z" />
            <path d="M19.47 9.47 21 11l-1.53 1.53a3.5 3.5 0 0 1-4.94 0L13 11l1.53-1.53a3.5 3.5 0 0 1 4.94 0Z" />
          </g>
        </svg>
      </div>

      <span
        className={`mt-1 text-[9.5px] font-black px-2 py-0.5 rounded-full inline-flex items-center tracking-tight leading-none border shadow-2xs ${
          isGrainFree
            ? 'text-emerald-800 bg-emerald-50 border-emerald-200/80'
            : grainStatus === 'low'
            ? 'text-amber-800 bg-amber-50 border-amber-200/80'
            : 'text-slate-700 bg-slate-100 border-slate-200'
        }`}
      >
        {isGrainFree ? 'Grain Free' : `${grainPercent}% Grano`}
      </span>
    </div>
  );
}

/**
 * Componente principal de Especificaciones Nutricionales Estilo Apple
 */
export default function AppleNutritionSpecs({ product, activeFlavor = '', className = '' }) {
  const specs = getProductNutritionalSpecs(product, activeFlavor);

  if (specs.isNonFood) {
    return (
      <div className={`rounded-2xl bg-slate-50/80 backdrop-blur-xs border border-slate-200/60 p-2.5 grid grid-cols-3 divide-x divide-slate-200/60 items-center ${className}`}>
        <div className="flex flex-col items-center text-center px-1">
          <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-200/60 flex items-center justify-center mb-1">
            <Leaf className="w-4 h-4 text-emerald-600" />
          </div>
          <span className="text-[9px] font-black text-slate-800 uppercase tracking-tight leading-none">
            {specs.label1}
          </span>
          <span className="text-[8px] font-semibold text-slate-400 mt-0.5 leading-none">
            Origen
          </span>
        </div>
        <div className="flex flex-col items-center text-center px-1">
          <div className="w-8 h-8 rounded-xl bg-teal-50 border border-teal-200/60 flex items-center justify-center mb-1">
            <Sparkles className="w-4 h-4 text-teal-600" />
          </div>
          <span className="text-[9px] font-black text-slate-800 uppercase tracking-tight leading-none">
            {specs.label2}
          </span>
          <span className="text-[8px] font-semibold text-slate-400 mt-0.5 leading-none">
            Textura
          </span>
        </div>
        <div className="flex flex-col items-center text-center px-1">
          <div className="w-8 h-8 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center mb-1">
            <ShieldCheck className="w-4 h-4 text-slate-600" />
          </div>
          <span className="text-[9px] font-black text-slate-800 uppercase tracking-tight leading-none">
            {specs.label3}
          </span>
          <span className="text-[8px] font-semibold text-slate-400 mt-0.5 leading-none">
            Cuidado
          </span>
        </div>
      </div>
    );
  }

  const { animalPercent, grainPercent, grainStatus, proteinSource } = specs;
  const animalConfig = getAnimalConfig(proteinSource);

  return (
    <div className={`relative rounded-2xl bg-[#F8FAFC]/95 backdrop-blur-md border border-slate-200/80 p-2 sm:p-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_2px_8px_-2px_rgba(0,0,0,0.03)] grid grid-cols-2 divide-x divide-slate-200/80 items-center gap-1.5 ${className}`}>
      
      {/* 1. SECCIÓN PROTEÍNA ANIMAL (SILUETA ANATÓMICA CON MEDIDOR LÍQUIDO) */}
      <div className="flex flex-col items-center justify-center min-w-0 px-1">
        <AnimalLiquidGauge
          animalConfig={animalConfig}
          percent={animalPercent}
        />
        <span className={`mt-1 text-[9.5px] font-black px-2 py-0.5 rounded-full inline-flex items-center tracking-tight leading-none border shadow-2xs ${animalConfig.badgeBg}`}>
          {animalPercent}% {animalConfig.label}
        </span>
      </div>

      {/* 2. SECCIÓN NIVEL DE GRANO (SILUETA DE ESPIGA DE TRIGO) */}
      <div className="flex flex-col items-center justify-center min-w-0 px-1">
        <WheatStalkGauge
          grainPercent={grainPercent}
          grainStatus={grainStatus}
        />
      </div>

    </div>
  );
}
