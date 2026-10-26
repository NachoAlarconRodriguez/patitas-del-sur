import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Tag, ArrowRight, Sparkles, Check, ChevronDown } from 'lucide-react';
import { fetchProductsFromSupabase } from '../services/productsService';
import { PRODUCTS } from '../data/mockData';
import { isProductOutOfStock } from '../utils/productVariants';

// Custom Vector Paw Print Icon for indicators
function PawPrintIcon({ active = false, activeColor = '#10B981' }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={`w-5 h-5 transition-all duration-300 cursor-pointer ${
        active
          ? 'scale-125 drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]'
          : 'opacity-40 hover:opacity-100 hover:scale-110'
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

// Fallback image resolver matching product category and name
function resolveProductImage(prod) {
  if (prod.image && (prod.image.startsWith('/') || prod.image.startsWith('http'))) {
    return prod.image;
  }
  if (Array.isArray(prod.images) && prod.images.length > 0 && typeof prod.images[0] === 'string') {
    return prod.images[0];
  }
  const lower = (prod.name || '').toLowerCase();
  if (lower.includes('pollo') || lower.includes('chicken')) return '/images/bravery_chicken.jpg';
  if (lower.includes('cordero') || lower.includes('lamb')) return '/images/bravery_lamb.jpg';
  if (lower.includes('salmón') || lower.includes('salmon') || lower.includes('bravery')) return '/images/bravery_salmon.jpg';
  if (lower.includes('trucha') || lower.includes('patagonia') || lower.includes('gato')) return '/images/cat_food_tuna.png';
  if (lower.includes('urinary') || lower.includes('dr. pet') || lower.includes('dr pet')) return '/images/cat_food_tuna.png';
  if (lower.includes('ciervo') || lower.includes('deshidratado')) return '/images/dog_food_ingredients.png';
  if (lower.includes('hueso') || lower.includes('recreativo')) return '/images/dog_kibble_detail.png';
  if (lower.includes('omega') || lower.includes('suplemento')) return '/images/dog_food_salmon.png';
  return (prod.petType || prod.pet_type) === 'gatos' ? '/images/cat_food_tuna.png' : '/images/bravery_salmon.jpg';
}

export default function PromoCarousel({
  petType = 'perros',
  onAddToCart,
  onSelectProduct,
  products = null,
}) {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [touchStartX, setTouchStartX] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [justAddedId, setJustAddedId] = useState(null);

  // Real inventory products and selected carousel IDs from localStorage
  const [inventoryProducts, setInventoryProducts] = useState(PRODUCTS);
  const [carouselIds, setCarouselIds] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('patitas_carousel_products') || '[]');
    } catch {
      return [];
    }
  });

  const loadRealProducts = useCallback(async () => {
    try {
      const items = await fetchProductsFromSupabase();
      if (items && items.length > 0) {
        setInventoryProducts(items);
      }
      const savedIds = JSON.parse(localStorage.getItem('patitas_carousel_products') || '[]');
      setCarouselIds(savedIds);
    } catch (err) {
      console.error('Error loading inventory products for carousel:', err);
    }
  }, []);

  useEffect(() => {
    loadRealProducts();
    const handleSync = () => loadRealProducts();
    window.addEventListener('patitas_products_updated', handleSync);
    window.addEventListener('storage', handleSync);
    return () => {
      window.removeEventListener('patitas_products_updated', handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, [loadRealProducts]);

  // Combine prop products with loaded inventory
  const sourceProducts = useMemo(() => {
    if (products && products.length > 0) return products;
    return inventoryProducts;
  }, [products, inventoryProducts]);

  // Generate dynamic slides from real products
  const promos = useMemo(() => {
    const isDog = petType === 'perros';
    const petTarget = isDog ? 'perros' : 'gatos';

    // Filter by pet type, ensure active, not paused, and strictly IN STOCK (> 0)
    const candidates = sourceProducts.filter((p) => {
      const type = (p.petType || p.pet_type || 'perros').toLowerCase();
      const matchesPet = type === petTarget || type === 'ambos';
      const isNotPaused = !p.isPaused && !p.is_paused;
      const isActive = p.isActive !== false && p.is_active !== false;

      // Check stock strictly across simple products and variants
      const outOfStock =
        isProductOutOfStock(p) ||
        p.isOutOfStock ||
        (typeof p.stock === 'number' && p.stock <= 0) ||
        (Array.isArray(p.variants) &&
          p.variants.length > 0 &&
          p.variants.every((v) => (typeof v.stock === 'number' ? v.stock : 0) <= 0 || v.isPaused));

      return matchesPet && isNotPaused && isActive && !outOfStock;
    });

    // Pick products explicitly selected for carousel in the admin panel (only among in-stock candidates!)
    let selected = candidates.filter((p) => {
      return (
        carouselIds.includes(p.id) ||
        carouselIds.includes(p.sku) ||
        carouselIds.includes(p.name) ||
        Boolean(p.inCarousel || p.in_carousel)
      );
    });

    // If none are explicitly selected yet, default to first 3-4 real in-stock products of that pet type
    if (selected.length === 0) {
      selected = candidates.slice(0, 4);
    }

    const gradientsDog = [
      'from-[#E6F4F1] via-[#FAF9F5] to-[#CBE5E1]',
      'from-[#ECF7F3] via-[#FAF9F5] to-[#D5EFE9]',
      'from-[#E8F5F1] via-[#FAF9F5] to-[#D2EAE4]',
      'from-[#E0F2F1] via-[#FAF9F5] to-[#B2DFDB]',
    ];

    const gradientsCat = [
      'from-[#FFF4EB] via-[#FAF9F6] to-[#FCE6D5]',
      'from-[#FFF6EE] via-[#FAF9F6] to-[#FDE8D3]',
      'from-[#FFF8F0] via-[#FAF9F6] to-[#FEEAD9]',
      'from-[#FBE9E7] via-[#FAF9F6] to-[#FFCCBC]',
    ];

    const gradients = isDog ? gradientsDog : gradientsCat;

    return selected.map((prod, idx) => {
      const price = Number(prod.price || prod.salePrice || 0);
      const originalPrice = prod.originalPrice || prod.original_price || (price > 0 ? Math.round(price * 1.15) : null);
      const discountPercent =
        originalPrice && originalPrice > price
          ? Math.round(((originalPrice - price) / originalPrice) * 100)
          : 0;

      let badgeText = prod.badge;
      if (!badgeText) {
        if (discountPercent > 0) badgeText = `${discountPercent}% DCTO`;
        else if (prod.stock && prod.stock <= 3) badgeText = `¡ÚLTIMAS ${prod.stock} U.!`;
        else badgeText = 'OFERTA DESTACADA';
      }

      const formatStr = prod.format || (Array.isArray(prod.weights) ? prod.weights[0] : null);
      const taglineText = prod.tagline || (prod.brand ? `${prod.brand} • ${prod.category || 'Nutrición Natural'}` : 'PROMO DESTACADA');

      const desc =
        prod.tagline ||
        (formatStr
          ? `Disponible en formato ${formatStr}. Nutrición 100% balanceada de alta digestibilidad con despacho rápido en Puerto Varas y Llanquihue.`
          : 'Alimento y nutrición seleccionada para tu mascota en la Patagonia.');

      return {
        id: `promo-real-${prod.id}`,
        rawProduct: prod,
        productId: prod.id,
        badge: badgeText,
        tagline: taglineText.toUpperCase(),
        title: prod.name,
        description: desc,
        format: formatStr,
        price,
        originalPrice,
        stock: prod.stock,
        mascot: isDog ? 'Kira 🐶' : 'Jack 🐱',
        productImg: resolveProductImage(prod),
        bgGradient: gradients[idx % gradients.length],
        textColor: isDog ? 'text-[#0A3E40]' : 'text-[#59260E]',
        badgeBg: isDog ? 'bg-[#10B981] text-slate-950' : 'bg-[#C86D39] text-white',
        btnBg: isDog
          ? 'bg-[#0E8388] hover:bg-[#10B981] text-white'
          : 'bg-[#C86D39] hover:bg-[#D97706] text-white',
      };
    });
  }, [sourceProducts, carouselIds, petType]);

  // Adjust slide index if length changed
  useEffect(() => {
    if (promos.length > 0 && currentSlide >= promos.length) {
      setCurrentSlide(0);
    }
  }, [promos.length, currentSlide]);

  // Auto-play interval (3 seconds, pauses on hover)
  useEffect(() => {
    if (promos.length <= 1 || isHovered) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % promos.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [promos.length, isHovered]);

  const handleScrollDown = () => {
    const catalogEl = document.getElementById('catalogo-section');
    if (catalogEl) {
      catalogEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      window.scrollBy({ top: 480, behavior: 'smooth' });
    }
  };

  const handlePrev = () => {
    if (promos.length === 0) return;
    setCurrentSlide((prev) => (prev - 1 + promos.length) % promos.length);
  };

  const handleNext = () => {
    if (promos.length === 0) return;
    setCurrentSlide((prev) => (prev + 1) % promos.length);
  };

  const handleTouchStart = (e) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e) => {
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX - touchEndX;
    if (diff > 45) {
      handleNext();
    } else if (diff < -45) {
      handlePrev();
    }
  };

  const formatCLP = (val) => {
    if (!val || isNaN(val)) return '$0';
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const activePromo = promos[currentSlide] || null;

  const handleAction = (e) => {
    if (e) e.stopPropagation();
    if (!activePromo) return;
    const targetProduct = activePromo.rawProduct;

    if (onAddToCart && targetProduct) {
      onAddToCart(targetProduct);
      setJustAddedId(targetProduct.id);
      setTimeout(() => setJustAddedId(null), 1800);
    } else if (onSelectProduct && targetProduct) {
      onSelectProduct(targetProduct);
    } else {
      navigate(`/producto/${activePromo.productId}`);
    }
  };

  const activeColor = petType === 'perros' ? '#10B981' : '#C86D39';

  if (!activePromo) {
    return null;
  }

  return (
    <div className="w-full space-y-4">
      <div
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className="relative w-full rounded-3xl overflow-hidden shadow-xl shadow-slate-200/60 border border-slate-200/80 select-none transition-all duration-700 min-h-[380px] md:min-h-[440px] group/carousel"
      >
      {/* Background Gradient & Full Product Image */}
      <div className={`absolute inset-0 w-full h-full bg-gradient-to-r ${activePromo.bgGradient}`}>
        <img
          src={activePromo.productImg}
          alt={activePromo.title}
          className="w-full h-full object-contain object-right md:object-right opacity-90 p-4 md:p-8 transition-all duration-1000 group-hover/carousel:scale-105"
        />
        {/* Soft Radial Fade for text readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#FAF9F5] via-[#FAF9F5]/90 to-transparent w-full md:w-3/4" />
      </div>

      {/* Slide Content Box */}
      <div className="relative z-10 p-8 md:p-14 h-full min-h-[380px] md:min-h-[440px] flex flex-col justify-between max-w-2xl">
        {/* Top Badge: Destacado del Mes */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider shadow-sm ${
                petType === 'perros'
                  ? 'bg-[#0E8388] text-white shadow-[#0E8388]/20'
                  : 'bg-[#C86D39] text-white shadow-[#C86D39]/20'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
              Destacado del Mes
            </span>
          </div>

          {/* Title - Clean & 100% Legible typography */}
          <h2
            className={`font-heading font-extrabold text-2xl sm:text-3xl md:text-4xl lg:text-5xl ${activePromo.textColor} tracking-tight leading-tight max-w-xl cursor-pointer hover:opacity-90 transition-opacity`}
            onClick={() => navigate(`/producto/${activePromo.productId}`)}
          >
            {activePromo.title}
          </h2>

          {/* Description */}
          <p className="text-slate-600 text-sm md:text-base leading-relaxed max-w-xl font-medium">
            {activePromo.description}
          </p>
        </div>

        {/* Pricing & CTA Button */}
        <div className="flex items-center gap-6 pt-4 flex-wrap sm:flex-nowrap">
          <div>
            <div className={`text-3xl md:text-4xl font-black ${activePromo.textColor}`}>
              {formatCLP(activePromo.price)}
            </div>
            {activePromo.originalPrice && activePromo.originalPrice > activePromo.price && (
              <div className="text-xs text-slate-400 line-through font-semibold">
                {formatCLP(activePromo.originalPrice)}
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleAction}
              className={`px-7 py-3.5 rounded-full ${activePromo.btnBg} font-extrabold text-sm transition-all shadow-xl flex items-center gap-2 active:scale-95 shrink-0 cursor-pointer`}
            >
              {justAddedId === activePromo.productId ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>¡AGREGADO AL CARRO!</span>
                </>
              ) : (
                <>
                  <span>APROVECHAR OFERTA</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <Link
              to={`/producto/${activePromo.productId}`}
              className="text-xs font-bold text-slate-500 hover:text-[#0E8388] transition-colors underline decoration-slate-300 underline-offset-4"
            >
              Ver ficha completa
            </Link>
          </div>
        </div>
      </div>

      {/* Manual Arrow Controls (only if more than 1 slide) */}
      {promos.length > 1 && (
        <>
          <button
            type="button"
            onClick={handlePrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-white/90 text-slate-800 hover:bg-[#0E8388] hover:text-white transition-all border border-slate-200 shadow-lg backdrop-blur-md cursor-pointer"
            aria-label="Anterior oferta"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <button
            type="button"
            onClick={handleNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-white/90 text-slate-800 hover:bg-[#0E8388] hover:text-white transition-all border border-slate-200 shadow-lg backdrop-blur-md cursor-pointer"
            aria-label="Siguiente oferta"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </>
      )}

      {/* Paw Print Vector Indicators 🐾 */}
      {promos.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3 px-5 py-2 rounded-full bg-white/90 backdrop-blur-md border border-slate-200 shadow-lg">
          {promos.map((_, idx) => (
            <button
              type="button"
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              title={`Ir a oferta ${idx + 1}`}
              className="text-slate-400 focus:outline-none cursor-pointer"
            >
              <PawPrintIcon active={currentSlide === idx} activeColor={activeColor} />
            </button>
          ))}
        </div>
      )}
      </div>

      {/* Visual Scroll Down Indicator */}
      <div className="flex flex-col items-center justify-center pt-1">
        <button
          type="button"
          onClick={handleScrollDown}
          className={`group inline-flex items-center gap-2.5 px-5 py-2 rounded-full bg-white/95 hover:bg-white border border-slate-200/90 shadow-xs hover:shadow-md transition-all duration-300 cursor-pointer ${
            petType === 'perros'
              ? 'hover:border-[#0E8388]/40 hover:text-[#0E8388]'
              : 'hover:border-[#C86D39]/40 hover:text-[#C86D39]'
          }`}
          title="Ver catálogo completo abajo"
          aria-label="Desplazarse hacia abajo para ver el catálogo de productos"
        >
          <span className="text-[11px] font-black tracking-wider uppercase text-slate-600 group-hover:text-inherit transition-colors">
            Explorar catálogo abajo
          </span>
          <div
            className={`w-5 h-5 rounded-full flex items-center justify-center ${
              petType === 'perros'
                ? 'bg-[#0E8388]/10 text-[#0E8388]'
                : 'bg-[#C86D39]/10 text-[#C86D39]'
            }`}
          >
            <ChevronDown className="w-3.5 h-3.5 animate-bounce" />
          </div>
        </button>
      </div>
    </div>
  );
}
