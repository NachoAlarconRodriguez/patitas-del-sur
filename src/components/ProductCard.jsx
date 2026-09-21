import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, ShoppingBag, Eye, Wheat, Fish, Drumstick, Beef, Sparkles, Stethoscope, Dumbbell } from 'lucide-react';

// Mini Circular Ring Chart Component for numeric percentage values (% Proteína)
function MiniCircleMetric({ value, label, color = '#0E8388', trackColor = 'text-slate-200/70' }) {
  const numeric = typeof value === 'number' ? value : parseInt(value, 10) || 0;
  const radius = 14;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (Math.min(100, Math.max(0, numeric)) / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-1 text-center">
      <div className="relative w-11 h-11 flex items-center justify-center">
        <svg className="w-11 h-11 -rotate-90 transform" viewBox="0 0 40 40">
          <circle
            cx="20"
            cy="20"
            r={radius}
            className={trackColor}
            strokeWidth="3.5"
            stroke="currentColor"
            fill="transparent"
          />
          <circle
            cx="20"
            cy="20"
            r={radius}
            strokeWidth="3.5"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            stroke={color}
            fill="transparent"
            className="transition-all duration-700"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center text-center">
          <span className="text-[10px] font-black text-slate-900 leading-none">{value}</span>
        </div>
      </div>
      <span className="text-[9px] font-black text-slate-600 uppercase tracking-tight leading-none">
        {label}
      </span>
    </div>
  );
}

// Protein Source Vector Icon Badge (Modern Lucide UI Icons, rounded-2xl badge card)
function ProteinIconBadge({ icon: IconComponent, label, iconColor = 'text-[#0E8388]', bgColor = 'bg-white border-slate-200' }) {
  return (
    <div className="flex flex-col items-center gap-1 text-center justify-center">
      <div className={`w-11 h-11 rounded-2xl ${bgColor} shadow-sm border flex items-center justify-center transition-transform hover:scale-105`}>
        <IconComponent className={`w-5 h-5 ${iconColor}`} />
      </div>
      <span className="text-[9px] font-black text-slate-800 uppercase tracking-tight leading-none">
        {label}
      </span>
    </div>
  );
}

// Grain Status Vector Icon Badge
function GrainIconBadge({ isGrainFree, grainLevelProp, tagline = '' }) {
  let status = 'free';
  const tagLower = tagline.toLowerCase();

  if (grainLevelProp) {
    status = grainLevelProp;
  } else if (isGrainFree || tagLower.includes('grain free') || tagLower.includes('libre de grano')) {
    status = 'free';
  } else if (tagLower.includes('bajo en grano') || tagLower.includes('low grain') || tagLower.includes('arroz integral')) {
    status = 'low';
  } else {
    status = 'with';
  }

  let labelText = 'LIBRE GRANO';
  let bgColor = 'bg-slate-100/90 border-slate-200/90 text-slate-500';
  let wheatColor = 'text-slate-400';

  if (status === 'low') {
    labelText = 'BAJO GRANO';
    bgColor = 'bg-amber-50/90 border-amber-200/90 text-amber-900';
    wheatColor = 'text-amber-500';
  } else if (status === 'with' || status === 'full') {
    labelText = 'CON GRANO';
    bgColor = 'bg-amber-100 border-amber-300 text-amber-900';
    wheatColor = 'text-amber-700 scale-105';
  }

  return (
    <div className="flex flex-col items-center gap-1 text-center justify-center">
      <div className={`w-11 h-11 rounded-2xl ${bgColor} shadow-xs border flex items-center justify-center transition-transform hover:scale-105`}>
        <Wheat className={`w-5 h-5 ${wheatColor}`} />
      </div>
      <span className="text-[9px] font-black text-slate-600 uppercase tracking-tight leading-none">
        {labelText}
      </span>
    </div>
  );
}

// Elemento 4: Vet Status Metric Badge
function VetStatusMetric({ isVeterinary = false }) {
  let labelText = 'NO VET';
  let bgColor = 'bg-slate-100/90 border-slate-200/90 text-slate-500';
  let iconColor = 'text-slate-400';

  if (isVeterinary) {
    labelText = 'RECETA VET';
    bgColor = 'bg-purple-100 border-purple-300 text-purple-900';
    iconColor = 'text-purple-600 scale-105';
  }

  return (
    <div className="flex flex-col items-center gap-1 text-center justify-center">
      <div className={`w-11 h-11 rounded-2xl ${bgColor} shadow-xs border flex items-center justify-center transition-transform hover:scale-105`}>
        <Stethoscope className={`w-5 h-5 ${iconColor}`} />
      </div>
      <span className="text-[9px] font-black text-slate-600 uppercase tracking-tight leading-none">
        {labelText}
      </span>
    </div>
  );
}

// Helper to determine main protein vector icon badge
function getProteinBadge(mainProteinStr, productNameStr) {
  const text = ((mainProteinStr || '') + ' ' + (productNameStr || '')).toLowerCase();

  if (text.includes('multi') || text.includes('combo') || (text.includes('pollo') && text.includes('res'))) {
    return {
      icon: Sparkles,
      label: 'Multiproteico',
      iconColor: 'text-[#0E8388]',
      bgColor: 'bg-emerald-50 border-emerald-200 text-emerald-800',
    };
  }

  if (text.includes('cordero') || text.includes('lamb')) {
    return {
      icon: Beef,
      label: 'Cordero',
      iconColor: 'text-amber-700',
      bgColor: 'bg-amber-50 border-amber-200/90 text-amber-900',
    };
  }

  if (text.includes('salmón') || text.includes('salmon')) {
    return {
      icon: Fish,
      label: 'Salmón',
      iconColor: 'text-teal-600',
      bgColor: 'bg-teal-50 border-teal-200/90 text-teal-900',
    };
  }

  if (text.includes('pollo') || text.includes('chicken')) {
    return {
      icon: Drumstick,
      label: 'Pollo',
      iconColor: 'text-amber-600',
      bgColor: 'bg-orange-50 border-orange-200/90 text-orange-900',
    };
  }

  if (text.includes('trucha') || text.includes('tuna') || text.includes('atún') || text.includes('pescado')) {
    return {
      icon: Fish,
      label: 'Pescado',
      iconColor: 'text-[#0E8388]',
      bgColor: 'bg-[#E6F4F1] border-[#0E8388]/30 text-[#0A3E40]',
    };
  }

  if (text.includes('res') || text.includes('carne') || text.includes('beef')) {
    return {
      icon: Beef,
      label: 'Res',
      iconColor: 'text-red-600',
      bgColor: 'bg-red-50 border-red-200/90 text-red-900',
    };
  }

  return {
    icon: Beef,
    label: 'Proteína',
    iconColor: 'text-[#0E8388]',
    bgColor: 'bg-slate-50 border-slate-200 text-slate-800',
  };
}

export default function ProductCard({ product, onSelectProduct, onAddToCart }) {
  const navigate = useNavigate();

  const formatCLP = (price) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const isDog = product.petType === 'perros';
  const isGrainFree = 
    product.badge?.toLowerCase().includes('grain') ||
    product.tagline?.toLowerCase().includes('grain') ||
    product.brand?.toLowerCase().includes('bravery') ||
    product.brand?.toLowerCase().includes('patagonia') ||
    product.ingredients?.some((i) => i.toLowerCase().includes('grain free'));

  const handleCardClick = () => {
    navigate(`/producto/${product.id}`);
  };

  const proteinPercentVal = product.proteinValue || 30;
  const proteinBadge = getProteinBadge(product.mainProtein, product.name);

  return (
    <div className="group relative bg-white rounded-3xl p-4 md:p-5 shadow-sm hover:shadow-2xl transition-all duration-500 border border-slate-100 flex flex-col justify-between hover:-translate-y-1.5 cursor-pointer">
      
      {/* Image Container */}
      <div
        onClick={handleCardClick}
        className="relative w-full aspect-square rounded-2xl overflow-hidden bg-slate-50 mb-3 flex items-center justify-center p-4 border border-slate-100/60"
      >
        
        {/* Rating Badge Overlay Top Right */}
        <div className="absolute top-3 right-3 z-10 flex items-center gap-1 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-full text-xs font-black text-amber-500 shadow-sm border border-slate-200/60">
          <Star className="w-3.5 h-3.5 fill-amber-400" />
          <span>{product.rating}</span>
          <span className="text-slate-400 font-normal text-[10px]">({product.reviewsCount})</span>
        </div>

        {/* View Product Overlay on Hover */}
        <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-xs opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 flex items-center justify-center gap-2 text-white font-bold text-sm">
          <span className="px-4 py-2 rounded-full bg-white text-slate-900 shadow-xl flex items-center gap-1.5 hover:scale-105 transition-transform">
            <Eye className="w-4 h-4 text-[#0E8388]" /> Ver Detalles
          </span>
        </div>

        {/* Product Image */}
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
        />
      </div>

      {/* Content Body */}
      <div className="flex flex-col flex-grow space-y-3">
        
        {/* 4 Metrics Row (Círculo 1 % Proteína | Elemento 2 Badge Proteína | Elemento 3 Badge Grano | Elemento 4 Badge Veterinario) */}
        <div className="p-3 rounded-2xl bg-[#E6F4F1]/40 border border-[#0E8388]/20 flex items-center justify-around gap-1">
          {/* Círculo 1: % Proteína */}
          <MiniCircleMetric
            value={`${proteinPercentVal}%`}
            label="Proteína"
            color="#0E8388"
          />

          {/* Elemento 2: Vector Icon Proteína (Beef, Fish, Drumstick, Sparkles) */}
          <ProteinIconBadge
            icon={proteinBadge.icon}
            label={proteinBadge.label}
            iconColor={proteinBadge.iconColor}
            bgColor={proteinBadge.bgColor}
          />

          {/* Elemento 3: Vector Icon Wheat (Gris = Libre Grano) */}
          <GrainIconBadge
            isGrainFree={isGrainFree}
            grainLevelProp={product.grainLevel}
            tagline={product.tagline || ''}
          />

          {/* Elemento 4: Vector Icon Stethoscope (Gris = No Vet | Color = Receta Vet) */}
          <VetStatusMetric isVeterinary={product.isVeterinary} />
        </div>

        {/* Product Title */}
        <h3
          onClick={handleCardClick}
          className="font-molen font-bold text-lg sm:text-xl text-slate-900 group-hover:text-[#0E8388] transition-colors cursor-pointer line-clamp-2 leading-snug tracking-tight"
        >
          {product.name}
        </h3>

        {/* Short Description */}
        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed flex-grow font-medium">
          {product.tagline}
        </p>

        {/* Weights Formats Pill Bar */}
        {product.weights && product.weights.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {product.weights.map((w, idx) => (
              <span
                key={idx}
                className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200/60"
              >
                {w}
              </span>
            ))}
          </div>
        )}

      </div>

      {/* Footer: Price & Add to Cart */}
      <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between">
        <div>
          <div className="text-lg font-black text-slate-900 leading-tight">
            {formatCLP(product.price)}
          </div>
          {product.originalPrice && (
            <div className="text-[11px] text-slate-400 line-through font-semibold">
              {formatCLP(product.originalPrice)}
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onAddToCart(product);
          }}
          className="min-w-[44px] min-h-[44px] w-11 h-11 rounded-full bg-[#0E8388] text-white flex items-center justify-center hover:bg-[#0A3E40] hover:scale-105 active:scale-95 transition-all shadow-md cursor-pointer"
          title="Agregar al Carrito"
          aria-label={`Agregar ${product.name} al carrito`}
        >
          <ShoppingBag className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
}
