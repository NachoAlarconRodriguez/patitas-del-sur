import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Tag, ArrowRight } from 'lucide-react';
import { PRODUCTS } from '../data/mockData';

// Custom Vector Paw Print Icon for indicators
function PawPrintIcon({ active = false, activeColor = "#10B981" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={`w-5 h-5 transition-all duration-300 cursor-pointer ${
        active ? 'scale-125 drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'opacity-40 hover:opacity-100 hover:scale-110'
      }`}
      fill={active ? activeColor : '#0F383A'}
    >
      {/* Main Bottom Pad */}
      <ellipse cx="12" cy="16" rx="4.5" ry="3.5" />
      {/* 4 Top Toes */}
      <circle cx="6.5" cy="11.5" r="2" />
      <circle cx="10" cy="8.5" r="2" />
      <circle cx="14" cy="8.5" r="2" />
      <circle cx="17.5" cy="11.5" r="2" />
    </svg>
  );
}

export default function PromoCarousel({ petType = 'perros', onAddToCart, onSelectProduct }) {
  const [currentSlide, setCurrentSlide] = useState(0);

  const dogPromos = [
    {
      id: "promo-dog-1",
      badge: "20% DCTO",
      tagline: "PROMO EDICIÓN PATAGONIA",
      title: "Salmón de la Patagonia 2kg + Snack de Regalo",
      description: "Receta holística libre de granos con 40% salmón silvestre de Chiloé y Omega 3 antiinflamatorio.",
      price: 22990,
      originalPrice: 28990,
      productId: "perros-salmon-2kg",
      mascot: "Kira 🐶",
      productImg: "/images/dog_food_salmon.png",
      bgGradient: "from-[#E6F4F1] via-[#FAF9F5] to-[#CBE5E1]",
      textColor: "text-[#0A3E40]",
      badgeBg: "bg-[#10B981] text-slate-950",
      btnBg: "bg-[#0E8388] hover:bg-[#10B981] text-white",
    },
    {
      id: "promo-dog-2",
      badge: "ENVÍO GRATIS",
      tagline: "PACK AHORRO MENSUAL",
      title: "2x Cordero Patagónico & Hierbas 5kg",
      description: "Ahorra $8.000 CLP en tu compra mensual. Ideal para estómagos sensibles con manzana verde.",
      price: 32990,
      originalPrice: 38990,
      productId: "perros-cordero-5kg",
      mascot: "Kira 🐶",
      productImg: "/images/dog_food_salmon.png",
      bgGradient: "from-[#ECF7F3] via-[#FAF9F5] to-[#D5EFE9]",
      textColor: "text-[#0A3E40]",
      badgeBg: "bg-[#0E8388] text-white",
      btnBg: "bg-[#10B981] hover:bg-[#0E8388] text-slate-950 hover:text-white",
    },
    {
      id: "promo-dog-3",
      badge: "OFERTA 3x2",
      tagline: "SNACKS 100% NATURALES",
      title: "Lleva 3 Packs de Pulmón de Res Deshidratado",
      description: "Premios monoproteicos deshidratados a baja temperatura sin preservantes químicos.",
      price: 7990,
      originalPrice: 11990,
      productId: "perros-snack-res",
      mascot: "Kira 🐶",
      productImg: "/images/dog_food_salmon.png",
      bgGradient: "from-[#E8F5F1] via-[#FAF9F5] to-[#D2EAE4]",
      textColor: "text-[#0A3E40]",
      badgeBg: "bg-[#10B981] text-slate-950",
      btnBg: "bg-[#0E8388] hover:bg-[#10B981] text-white",
    },
    {
      id: "promo-dog-4",
      badge: "10% DCTO",
      tagline: "CUIDADO ARTICULAR AVANZADO",
      title: "Elixir Articular Patagónico con Glucosamina",
      description: "Refuerza cartílagos y movilidad con Glucosamina + Condroitina y concentrado de Calafate.",
      price: 18990,
      originalPrice: 21990,
      productId: "perros-suplemento-articulaciones",
      mascot: "Kira 🐶",
      productImg: "/images/dog_food_salmon.png",
      bgGradient: "from-[#E6F4F1] via-[#FAF9F5] to-[#CBE5E1]",
      textColor: "text-[#0A3E40]",
      badgeBg: "bg-[#0E8388] text-white",
      btnBg: "bg-[#10B981] hover:bg-[#0E8388] text-slate-950 hover:text-white",
    },
    {
      id: "promo-dog-5",
      badge: "COMBO AHORRO",
      tagline: "COMBO SALMÓN & VITALIDAD",
      title: "Combo Salmón 2kg + Elixir Articular",
      description: "La combinación perfecta de alimento seco holístico y suplemento líquido con 25% dcto.",
      price: 34990,
      originalPrice: 43980,
      productId: "perros-salmon-2kg",
      mascot: "Kira 🐶",
      productImg: "/images/dog_food_salmon.png",
      bgGradient: "from-[#ECF7F3] via-[#FAF9F5] to-[#D5EFE9]",
      textColor: "text-[#0A3E40]",
      badgeBg: "bg-[#10B981] text-slate-950",
      btnBg: "bg-[#0E8388] hover:bg-[#10B981] text-white",
    },
  ];

  const catPromos = [
    {
      id: "promo-cat-1",
      badge: "20% DCTO",
      tagline: "RECETA FAVORITA FELINA",
      title: "Trucha del Sur & Catnip Silvestre 1.5kg",
      description: "Receta holística rica en taurina esencial con control de pH urinario y bolas de pelo.",
      price: 19990,
      originalPrice: 23990,
      productId: "gatos-trucha-catnip",
      mascot: "Jack 🐱",
      productImg: "/images/cat_food_tuna.png",
      bgGradient: "from-[#FFF4EB] via-[#FAF9F6] to-[#FCE6D5]",
      textColor: "text-[#59260E]",
      badgeBg: "bg-[#C86D39] text-white",
      btnBg: "bg-[#C86D39] hover:bg-[#D97706] text-white",
    },
    {
      id: "promo-cat-2",
      badge: "PACK 6 UNIDADES",
      tagline: "ALIMENTO HÚMEDO HOLÍSTICO",
      title: "Pack 6x Paté de Salmón & Mariscos del Sur",
      description: "Aporta la hidratación vital que previene cálculos renales en gatos adultos.",
      price: 12990,
      originalPrice: 14940,
      productId: "gatos-pate-salmon",
      mascot: "Jack 🐱",
      productImg: "/images/cat_food_tuna.png",
      bgGradient: "from-[#FFF6EE] via-[#FAF9F6] to-[#FDE8D3]",
      textColor: "text-[#59260E]",
      badgeBg: "bg-[#D97706] text-white",
      btnBg: "bg-[#C86D39] hover:bg-[#D97706] text-white",
    },
    {
      id: "promo-cat-3",
      badge: "OFERTA DENTAL",
      tagline: "SNACKS CRUJIETES FELINOS",
      title: "Bocaditos de Atún & Hierba Gatera",
      description: "Snacks funcionales con taurina que promueven la limpieza dental mecánica.",
      price: 5490,
      originalPrice: 6990,
      productId: "gatos-snacks-atun",
      mascot: "Jack 🐱",
      productImg: "/images/cat_food_tuna.png",
      bgGradient: "from-[#FFF4EB] via-[#FAF9F6] to-[#FCE6D5]",
      textColor: "text-[#59260E]",
      badgeBg: "bg-[#C86D39] text-white",
      btnBg: "bg-[#D97706] hover:bg-[#C86D39] text-white",
    },
    {
      id: "promo-cat-4",
      badge: "ENVÍO GRATIS",
      tagline: "COMBO AHORRO FELINO",
      title: "Combo Trucha 3.5kg + Pack 6 Patés Húmedos",
      description: "Nutrición seca y húmeda balanceada para proteger el sistema urinario de tu felino.",
      price: 31990,
      originalPrice: 37930,
      productId: "gatos-trucha-catnip",
      mascot: "Jack 🐱",
      productImg: "/images/cat_food_tuna.png",
      bgGradient: "from-[#FFF6EE] via-[#FAF9F6] to-[#FDE8D3]",
      textColor: "text-[#59260E]",
      badgeBg: "bg-[#C86D39] text-white",
      btnBg: "bg-[#C86D39] hover:bg-[#D97706] text-white",
    },
    {
      id: "promo-cat-5",
      badge: "NUEVA FÓRMULA",
      tagline: "SALUD RENAL INTEGRAL",
      title: "Trucha Austral Formato 7kg Familiar",
      description: "Formato ahorro para hogares multigato con ingredientes 100% orgánicos.",
      price: 42990,
      originalPrice: 48990,
      productId: "gatos-trucha-catnip",
      mascot: "Jack 🐱",
      productImg: "/images/cat_food_tuna.png",
      bgGradient: "from-[#FFF4EB] via-[#FAF9F6] to-[#FCE6D5]",
      textColor: "text-[#59260E]",
      badgeBg: "bg-[#D97706] text-white",
      btnBg: "bg-[#C86D39] hover:bg-[#D97706] text-white",
    },
  ];

  const promos = petType === 'perros' ? dogPromos : catPromos;

  // Auto-play interval (5 seconds)
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % promos.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [promos.length]);

  const handlePrev = () => {
    setCurrentSlide((prev) => (prev - 1 + promos.length) % promos.length);
  };

  const handleNext = () => {
    setCurrentSlide((prev) => (prev + 1) % promos.length);
  };

  const activePromo = promos[currentSlide];

  const formatCLP = (price) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const handleAction = () => {
    const matchedProduct = PRODUCTS.find((p) => p.id === activePromo.productId);
    if (matchedProduct) {
      if (onSelectProduct) {
        onSelectProduct(matchedProduct);
      } else if (onAddToCart) {
        onAddToCart(matchedProduct);
      }
    }
  };

  const activeColor = petType === 'perros' ? '#10B981' : '#C86D39';

  return (
    <div className="relative w-full rounded-3xl overflow-hidden shadow-xl shadow-slate-200/60 border border-slate-200/80 select-none transition-all duration-700 min-h-[380px] md:min-h-[440px]">
      
      {/* Background Gradient & Full Product Image */}
      <div className={`absolute inset-0 w-full h-full bg-gradient-to-r ${activePromo.bgGradient}`}>
        <img
          src={activePromo.productImg}
          alt={activePromo.title}
          className="w-full h-full object-contain object-right md:object-right opacity-90 p-4 md:p-8 transition-all duration-1000"
        />
        {/* Soft Radial Fade for text readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#FAF9F5] via-[#FAF9F5]/90 to-transparent w-full md:w-3/4" />
      </div>

      {/* Slide Content Box */}
      <div className="relative z-10 p-8 md:p-14 h-full min-h-[380px] md:min-h-[440px] flex flex-col justify-between max-w-2xl">
        
        {/* Top Badges */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider ${activePromo.badgeBg} shadow-md`}>
              <Tag className="w-3.5 h-3.5" /> {activePromo.badge}
            </span>
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-extrabold bg-white text-slate-800 border border-slate-200 shadow-xs">
              {activePromo.mascot}
            </span>
            <span className="text-xs font-extrabold text-[#0E8388] tracking-widest uppercase">
              {activePromo.tagline}
            </span>
          </div>

          {/* Title */}
          <h2 className={`text-3xl md:text-5xl font-black ${activePromo.textColor} tracking-tight leading-tight`}>
            {activePromo.title}
          </h2>

          {/* Description */}
          <p className="text-slate-600 text-sm md:text-base leading-relaxed max-w-xl font-medium">
            {activePromo.description}
          </p>
        </div>

        {/* Pricing & CTA Button */}
        <div className="flex items-center gap-6 pt-4">
          <div>
            <div className={`text-3xl md:text-4xl font-black ${activePromo.textColor}`}>
              {formatCLP(activePromo.price)}
            </div>
            <div className="text-xs text-slate-400 line-through font-semibold">
              {formatCLP(activePromo.originalPrice)}
            </div>
          </div>

          <button
            onClick={handleAction}
            className={`px-7 py-3.5 rounded-full ${activePromo.btnBg} font-extrabold text-sm transition-all shadow-xl flex items-center gap-2 active:scale-95 shrink-0`}
          >
            <span>APROVECHAR OFERTA</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>

      {/* Manual Arrow Controls */}
      <button
        onClick={handlePrev}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-white/90 text-slate-800 hover:bg-[#0E8388] hover:text-white transition-all border border-slate-200 shadow-lg backdrop-blur-md"
        aria-label="Anterior oferta"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      <button
        onClick={handleNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-white/90 text-slate-800 hover:bg-[#0E8388] hover:text-white transition-all border border-slate-200 shadow-lg backdrop-blur-md"
        aria-label="Siguiente oferta"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* 5 Paw Print Vector Indicators 🐾 */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3 px-5 py-2 rounded-full bg-white/90 backdrop-blur-md border border-slate-200 shadow-lg">
        {promos.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentSlide(idx)}
            title={`Ir a oferta ${idx + 1}`}
            className="text-slate-400 focus:outline-none"
          >
            <PawPrintIcon
              active={currentSlide === idx}
              activeColor={activeColor}
            />
          </button>
        ))}
      </div>

    </div>
  );
}
