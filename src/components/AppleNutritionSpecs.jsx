import React, { useId } from 'react';
import { Sparkles, ShieldCheck, Leaf, Wheat } from 'lucide-react';
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
  const rawAnimalPercent = product.animalPercent ?? product.animal_percent;
  if (rawAnimalPercent !== null && rawAnimalPercent !== undefined && rawAnimalPercent !== '' && !isNaN(Number(rawAnimalPercent)) && Number(rawAnimalPercent) > 0) {
    animalPercent = Number(rawAnimalPercent);
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
  
  const gLevel = product.grainLevel || product.grain_level || product.gama;
  if (gLevel === 'with') {
    grainStatus = 'with';
    grainPercent = 35;
  } else if (gLevel === 'low' || tagLower.includes('arroz') || tagLower.includes('bajo en grano')) {
    grainStatus = 'low';
    grainPercent = 15;
  } else if (
    gLevel === 'free' ||
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

  const proteinSource = matchProtein(activeFlavor) || matchProtein(product.mainProtein) || matchProtein(product.main_protein) || matchProtein(product.name) || 'Pollo';

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
 * Componente Gráfico Circular para el % de Proteína Animal
 */
function AnimalProteinCircularGauge({ percent = 70, color = '#0E8388', proteinSource = 'Pollo' }) {
  const numeric = typeof percent === 'number' ? percent : parseInt(percent, 10) || 70;
  const radius = 17;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (Math.min(100, Math.max(0, numeric)) / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center text-center">
      {/* Gráfico Circular de Progreso */}
      <div className="relative w-11 h-11 sm:w-12 sm:h-12 flex items-center justify-center">
        <svg className="w-11 h-11 sm:w-12 sm:h-12 -rotate-90 transform" viewBox="0 0 44 44">
          <circle
            cx="22"
            cy="22"
            r={radius}
            className="text-slate-200"
            strokeWidth="3.5"
            stroke="currentColor"
            fill="transparent"
          />
          <circle
            cx="22"
            cy="22"
            r={radius}
            strokeWidth="3.5"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            stroke={color}
            fill="transparent"
            className="transition-all duration-700 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-[11px] sm:text-xs font-black text-slate-900 leading-none tracking-tight">
            {numeric}%
          </span>
        </div>
      </div>

      {/* Etiqueta inferior */}
      <span className="text-[9.5px] sm:text-[10px] font-black text-slate-800 uppercase tracking-tight mt-1 leading-tight">
        Proteína Animal
      </span>
      {proteinSource && (
        <span className="text-[8.5px] sm:text-[9px] font-bold text-slate-400 uppercase tracking-wider leading-none mt-0.5">
          {proteinSource}
        </span>
      )}
    </div>
  );
}

/**
 * Componente Indicador de Grano: Trigo con círculo tachado cuando es Libre de Grano
 */
function GrainStatusGauge({ isGrainFree = true, grainPercent = 0, grainStatus = 'free' }) {
  const free = isGrainFree || grainPercent === 0 || grainStatus === 'free';

  return (
    <div className="flex flex-col items-center justify-center text-center">
      {/* Icono de trigo con círculo tachado encima cuando es libre de grano */}
      <div className="relative w-11 h-11 sm:w-12 sm:h-12 flex items-center justify-center">
        {/* Espiga de trigo */}
        <Wheat className={`w-5 h-5 sm:w-6 sm:h-6 transition-transform ${free ? 'text-slate-500' : 'text-amber-500'}`} />

        {/* Círculo tachado rojo/rose arriba del trigo cuando es Libre de Grano */}
        {free && (
          <svg
            viewBox="0 0 24 24"
            className="absolute inset-0 w-full h-full text-rose-500 pointer-events-none drop-shadow-2xs"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="9" />
            <line x1="5.6" y1="5.6" x2="18.4" y2="18.4" />
          </svg>
        )}
      </div>

      {/* Etiqueta inferior */}
      <span className={`text-[9.5px] sm:text-[10px] font-black uppercase tracking-tight mt-1 leading-tight ${
        free ? 'text-emerald-700' : 'text-amber-800'
      }`}>
        {free ? 'Libre de Grano' : 'Con Grano'}
      </span>
      <span className="text-[8.5px] sm:text-[9px] font-bold text-slate-400 uppercase tracking-wider leading-none mt-0.5">
        {free ? 'Grain Free' : `${grainPercent || 15}% Cereales`}
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
    <div className={`relative rounded-2xl bg-[#F8FAFC]/95 backdrop-blur-md border border-slate-200/80 p-2 sm:p-2.5 shadow-2xs grid grid-cols-2 divide-x divide-slate-200/80 items-center ${className}`}>
      
      {/* 1. SECCIÓN PROTEÍNA ANIMAL: GRÁFICO CIRCULAR CON EL % */}
      <div className="flex flex-col items-center justify-center text-center px-1">
        <AnimalProteinCircularGauge
          percent={animalPercent}
          color={animalConfig?.outlineColor || '#0E8388'}
          proteinSource={animalConfig?.label || proteinSource}
        />
      </div>

      {/* 2. SECCIÓN LIBRE DE GRANO: TRIGO CON CÍRCULO TACHADO ARRIBA */}
      <div className="flex flex-col items-center justify-center text-center px-1">
        <GrainStatusGauge
          isGrainFree={grainPercent === 0 || grainStatus === 'free'}
          grainPercent={grainPercent}
          grainStatus={grainStatus}
        />
      </div>

    </div>
  );
}
