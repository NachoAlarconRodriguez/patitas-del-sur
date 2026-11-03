import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, ArrowRight, Check, ChevronDown } from 'lucide-react';
import { fetchProductsFromSupabase } from '../services/productsService';

// Vector Paw Print Icon for discrete indicators
function PawIndicator({ active = false, activeColor = '#10B981', onClick, label }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-current={active ? 'true' : undefined}
      className={`p-1.5 rounded-full transition-all duration-300 cursor-pointer focus:outline-none focus:ring-2 focus:ring-white/60 ${
        active ? 'scale-125 drop-shadow-[0_0_8px_rgba(255,255,255,0.7)]' : 'opacity-40 hover:opacity-100 hover:scale-110'
      }`}
    >
      <svg
        viewBox="0 0 24 24"
        className="w-5 h-5 transition-transform duration-300"
        fill={active ? activeColor : '#FFFFFF'}
      >
        <ellipse cx="12" cy="16" rx="4.5" ry="3.5" />
        <circle cx="6.5" cy="11.5" r="2" />
        <circle cx="10" cy="8.5" r="2" />
        <circle cx="14" cy="8.5" r="2" />
        <circle cx="17.5" cy="11.5" r="2" />
      </svg>
    </button>
  );
}

// Huella de Perro (Dog Paw Print)
function DogPawPrint({ className = '' }) {
  return (
    <svg viewBox="0 0 100 100" className={className} fill="currentColor" aria-hidden="true">
      {/* 4 dedos superiores */}
      <ellipse cx="26" cy="30" rx="8" ry="12" transform="rotate(-18 26 30)" />
      <ellipse cx="42" cy="18" rx="8.5" ry="13" transform="rotate(-5 42 18)" />
      <ellipse cx="58" cy="18" rx="8.5" ry="13" transform="rotate(5 58 18)" />
      <ellipse cx="74" cy="30" rx="8" ry="12" transform="rotate(18 74 30)" />
      {/* Almohadilla central de perro */}
      <path d="M50 42 C40 42, 28 47, 24 58 C20 68, 25 79, 36 82 C43 84, 47 80, 50 82 C53 80, 57 84, 64 82 C75 79, 80 68, 76 58 C72 47, 60 42, 50 42 Z" />
    </svg>
  );
}

// Huella de Gato (Cat Paw Print)
function CatPawPrint({ className = '' }) {
  return (
    <svg viewBox="0 0 100 100" className={className} fill="currentColor" aria-hidden="true">
      {/* 4 dedos redondeados */}
      <circle cx="24" cy="32" r="9" />
      <circle cx="41" cy="19" r="9.5" />
      <circle cx="59" cy="19" r="9.5" />
      <circle cx="76" cy="32" r="9" />
      {/* Almohadilla felina con 3 lóbulos suaves en la base */}
      <path d="M50 44 C38 44, 27 51, 25 63 C23 73, 29 82, 38 82 C42 82, 46 76, 50 76 C54 76, 58 82, 62 82 C71 82, 77 73, 75 63 C73 51, 62 44, 50 44 Z" />
    </svg>
  );
}

// Huellas decorativas de perro y gato en el fondo de la vitrina (tono uniforme que no altera el color de fondo)
function DecorativeShapes() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-5" aria-hidden="true">
      {/* Huella 1 - Perro (Izquierda flotante) */}
      <div className="absolute top-[18%] left-[4%] sm:left-[8%] lg:left-[10%] text-white/10 transition-all duration-700">
        <DogPawPrint className="w-36 h-36 sm:w-48 sm:h-48 -rotate-12" />
      </div>

      {/* Huella 2 - Gato (Superior Derecha) */}
      <div className="absolute top-[8%] right-[6%] sm:right-[12%] lg:right-[14%] text-white/10 transition-all duration-700">
        <CatPawPrint className="w-28 h-28 sm:w-36 sm:h-36 rotate-15" />
      </div>

      {/* Huella 3 - Perro (Inferior Derecha) */}
      <div className="absolute bottom-[10%] right-[5%] sm:right-[9%] lg:right-[11%] text-white/10 transition-all duration-700">
        <DogPawPrint className="w-32 h-32 sm:w-44 sm:h-44 rotate-25" />
      </div>
    </div>
  );
}

export default function PromoCarousel({
  petType = 'perros',
  onAddToCart,
  onSelectProduct,
  products = null,
  fullWidth = false,
  onColorChange,
  showScrollIndicator = false,
}) {
  const navigate = useNavigate();

  // Active scene indices for double-buffered layer retention (no gap/flash)
  const [currentSlide, setCurrentSlide] = useState(0);
  const [previousSlide, setPreviousSlide] = useState(null);

  // Reset slide when switching pet category (dogs / cats)
  useEffect(() => {
    setCurrentSlide(0);
    setPreviousSlide(null);
  }, [petType]);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [justAddedId, setJustAddedId] = useState(null);

  // Queue to prevent chaotic transitions when user clicks rapidly
  const queuedIndexRef = useRef(null);
  const transitionTimerRef = useRef(null);
  const retainTimerRef = useRef(null);

  // Touch gesture coordinates
  const touchStartRef = useRef({ x: 0, y: 0 });

  // Real inventory products from Supabase
  const [inventoryProducts, setInventoryProducts] = useState([]);

  useEffect(() => {
    let isMounted = true;
    fetchProductsFromSupabase()
      .then((items) => {
        if (isMounted && items && items.length > 0) {
          setInventoryProducts(items);
        }
      })
      .catch((err) => console.error('Error fetching promo products:', err));
    return () => {
      isMounted = false;
    };
  }, []);

  // Pre-configured Luxury Coordinated Variants according to the user specification
  const promos = useMemo(() => {
    const isDog = petType === 'perros';

    if (isDog) {
      const realFreshwater = inventoryProducts.find(
        (p) => (p.name || '').toLowerCase().includes('freshwater') || p.id === 'PROD-15'
      );
      const realLightFit = inventoryProducts.find(
        (p) => (p.name || '').toLowerCase().includes('light & fit') || (p.name || '').toLowerCase().includes('light') || p.id === 'PROD-18'
      );
      const realPoultry = inventoryProducts.find(
        (p) => (p.name || '').toLowerCase().includes('poultry') || p.id === 'PROD-14'
      );

      return [
        {
          id: 'dog-freshwater',
          rawProduct: realFreshwater || {
            id: 'PROD-15',
            name: 'Acana Freshwater Fish Recipe',
            price: 75000,
            originalPrice: 86250,
            format: '11,35 kg',
            petType: 'perros',
          },
          productId: realFreshwater ? realFreshwater.id : 'PROD-15',
          brand: 'ACANA',
          oversizedWord: 'FRESHWATER',
          badge: 'NUTRICIÓN HOLÍSTICA',
          title: 'Acana Freshwater Fish',
          subheading: 'Trucha arcoíris, bagre azul & perca de agua dulce',
          format: '11,35 kg & 2 kg',
          price: realFreshwater ? realFreshwater.price : 75000,
          originalPrice: realFreshwater ? realFreshwater.originalPrice || 86250 : 86250,
          productImg: '/images/acana_freshwater_fish.png',
          // Coordinated Color Pair
          bgColor: '#244F46',       // Deep Forest Sage
          inkColor: '#102722',      // Deep forest ink behind product
          accentColor: '#10B981',   // Emerald
          btnGradient: 'from-[#0E8388] to-[#10B981]',
          textColor: '#FFFFFF',
          badgeBg: 'bg-[#10B981] text-slate-950',
        },
        {
          id: 'dog-light-fit',
          rawProduct: realLightFit || {
            id: 'PROD-18',
            name: 'Acana Light & Fit Recipe',
            price: 75000,
            originalPrice: 86250,
            format: '11,35 kg',
            petType: 'perros',
          },
          productId: realLightFit ? realLightFit.id : 'PROD-18',
          brand: 'ACANA',
          oversizedWord: 'LIGHT & FIT',
          badge: 'CONTROL DE PESO',
          title: 'Acana Light & Fit',
          subheading: 'Pollo de corral, pavo & platija silvestre',
          format: '11,35 kg & 2 kg',
          price: realLightFit ? realLightFit.price : 75000,
          originalPrice: realLightFit ? realLightFit.originalPrice || 86250 : 86250,
          productImg: '/images/acana_light_fit.png',
          // Coordinated Color Pair
          bgColor: '#33414D',       // Cool Slate & Charcoal
          inkColor: '#171E24',      // Charcoal ink behind product
          accentColor: '#38BDF8',   // Sky Cyan
          btnGradient: 'from-[#0284C7] to-[#0EA5E9]',
          textColor: '#FFFFFF',
          badgeBg: 'bg-[#38BDF8] text-slate-950',
        },
        {
          id: 'dog-poultry',
          rawProduct: realPoultry || {
            id: 'PROD-14',
            name: 'Acana Free-Run Poultry Recipe',
            price: 73000,
            originalPrice: 83900,
            format: '11,35 kg',
            petType: 'perros',
          },
          productId: realPoultry ? realPoultry.id : 'PROD-14',
          brand: 'ACANA',
          oversizedWord: 'POULTRY',
          badge: 'AVES DE CORRAL',
          title: 'Acana Free-Run Poultry',
          subheading: 'Pollo fresco de granja, pavo & huevos camperos',
          format: '11,35 kg & 2 kg',
          price: realPoultry ? realPoultry.price : 73000,
          originalPrice: realPoultry ? realPoultry.originalPrice || 83900 : 83900,
          productImg: '/images/acana_poultry.png',
          // Coordinated Color Pair
          bgColor: '#6B3E19',       // Warm Roasted Honey & Amber
          inkColor: '#361E0B',      // Deep roasted amber ink
          accentColor: '#F59E0B',   // Warm Amber
          btnGradient: 'from-[#D97706] to-[#F59E0B]',
          textColor: '#FFFFFF',
          badgeBg: 'bg-[#F59E0B] text-slate-950',
        },
      ];
    } else {
      // Felinos (Gatos) Coordinated Variants
      const realCat1 = inventoryProducts.find(
        (p) => (p.petType === 'gatos' || p.pet_type === 'gatos') && p.id === 'PROD-07'
      );

      return [
        {
          id: 'cat-salmon',
          rawProduct: realCat1 || {
            id: 'PROD-07',
            name: 'Feline Choice Salmon & Sweet Potato',
            price: 34000,
            originalPrice: 39900,
            format: '3 kg',
            petType: 'gatos',
          },
          productId: realCat1 ? realCat1.id : 'PROD-07',
          brand: 'FELINE',
          oversizedWord: 'SALMÓN',
          badge: 'GRAIN FREE FELINO',
          title: 'Salmon & Sweet Potato',
          subheading: 'Salmón fresco patagónico & camote digestivo',
          format: '3 kg & 7 kg',
          price: 34000,
          originalPrice: 39900,
          productImg: '/images/cat_salmon_bag.png',
          // Coordinated Color Pair
          bgColor: '#254439',       // Eucalyptus & Deep Mint
          inkColor: '#0E1C17',      // Deep green ink
          accentColor: '#10B981',   // Emerald
          btnGradient: 'from-[#059669] to-[#10B981]',
          textColor: '#FFFFFF',
          badgeBg: 'bg-[#10B981] text-slate-950',
        },
        {
          id: 'cat-poultry',
          rawProduct: realCat1 || {
            id: 'PROD-07',
            name: 'Feline Nourish Free-Run Poultry',
            price: 32000,
            originalPrice: 37500,
            format: '2 kg',
            petType: 'gatos',
          },
          productId: realCat1 ? realCat1.id : 'PROD-07',
          brand: 'NOURISH',
          oversizedWord: 'POULTRY',
          badge: 'RECETA CAMPERA',
          title: 'Free-Run Poultry Blend',
          subheading: 'Pollo de campo criado en libertad & pavo noble',
          format: '2 kg & 5 kg',
          price: 32000,
          originalPrice: 37500,
          productImg: '/images/cat_poultry_bag.png',
          // Coordinated Color Pair
          bgColor: '#4A3B2C',       // Roasted Chestnut & Sand
          inkColor: '#201811',      // Espresso ink
          accentColor: '#F59E0B',   // Warm Amber
          btnGradient: 'from-[#C86D39] to-[#D97706]',
          textColor: '#FFFFFF',
          badgeBg: 'bg-[#F59E0B] text-slate-950',
        },
        {
          id: 'cat-ocean',
          rawProduct: realCat1 || {
            id: 'PROD-07',
            name: "Ocean's Harvest Fish & Cranberry",
            price: 30000,
            originalPrice: 35000,
            format: '2 kg',
            petType: 'gatos',
          },
          productId: realCat1 ? realCat1.id : 'PROD-07',
          brand: "OCEAN'S",
          oversizedWord: 'OCEAN',
          badge: 'CUIDADO URINARIO',
          title: 'Fish & Cranberry Feast',
          subheading: 'Pescados azules silvestres & arándanos rojos',
          format: '2 kg & 4.4 lb',
          price: 30000,
          originalPrice: 35000,
          productImg: '/images/cat_ocean_bag.png',
          // Coordinated Color Pair
          bgColor: '#1D354D',       // Fjord Mist & Ocean Navy
          inkColor: '#0A1521',      // Deep abyss ink
          accentColor: '#38BDF8',   // Sky Cyan
          btnGradient: 'from-[#0284C7] to-[#38BDF8]',
          textColor: '#FFFFFF',
          badgeBg: 'bg-[#38BDF8] text-slate-950',
        },
      ];
    }
  }, [petType, inventoryProducts]);

  // Pre-decode all images locally to eliminate any missing-image flash
  useEffect(() => {
    promos.forEach((p) => {
      const img = new Image();
      img.src = p.productImg;
      if (img.decode) {
        img.decode().catch(() => {});
      }
    });
  }, [promos]);

  // Coordinated Transition Handler with queuing & double-buffered retention
  const changeToSlide = useCallback(
    (targetIndex) => {
      if (targetIndex === currentSlide) return;

      const prefersReduced =
        typeof window !== 'undefined' &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      if (prefersReduced) {
        setCurrentSlide(targetIndex);
        setPreviousSlide(null);
        setIsTransitioning(false);
        return;
      }

      if (isTransitioning) {
        queuedIndexRef.current = targetIndex;
        return;
      }

      setIsTransitioning(true);
      setPreviousSlide(currentSlide);
      setCurrentSlide(targetIndex);

      if (retainTimerRef.current) clearTimeout(retainTimerRef.current);
      retainTimerRef.current = setTimeout(() => {
        setPreviousSlide(null);
      }, 300);

      if (transitionTimerRef.current) clearTimeout(transitionTimerRef.current);
      transitionTimerRef.current = setTimeout(() => {
        setIsTransitioning(false);
        if (queuedIndexRef.current !== null) {
          const nextQueued = queuedIndexRef.current;
          queuedIndexRef.current = null;
          changeToSlide(nextQueued);
        }
      }, 950);
    },
    [currentSlide, isTransitioning]
  );

  const handleNext = useCallback(() => {
    if (promos.length === 0) return;
    const nextIdx = (currentSlide + 1) % promos.length;
    changeToSlide(nextIdx);
  }, [currentSlide, promos.length, changeToSlide]);

  const handlePrev = useCallback(() => {
    if (promos.length === 0) return;
    const prevIdx = (currentSlide - 1 + promos.length) % promos.length;
    changeToSlide(prevIdx);
  }, [currentSlide, promos.length, changeToSlide]);

  const handleReplay = useCallback(() => {
    changeToSlide(0);
  }, [changeToSlide]);

  // Keyboard navigation (ArrowLeft / ArrowRight)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target && ['input', 'textarea', 'select'].includes(e.target.tagName.toLowerCase())) {
        return;
      }
      if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNext, handlePrev]);

  // Auto-play timer (4.5s loop), paused on hover or document hidden
  useEffect(() => {
    if (!isAutoPlaying || isHovered || isTransitioning) return;
    const interval = setInterval(() => {
      if (document.hidden) return;
      handleNext();
    }, 4500);
    return () => clearInterval(interval);
  }, [isAutoPlaying, isHovered, isTransitioning, handleNext]);

  // Touch swipe handling with passive listener support (>55px travel)
  const handleTouchStart = (e) => {
    const touch = e.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
  };

  const handleTouchEnd = (e) => {
    const touch = e.changedTouches[0];
    const dx = touchStartRef.current.x - touch.clientX;
    const dy = touchStartRef.current.y - touch.clientY;

    if (Math.abs(dx) > 55 && Math.abs(dx) > Math.abs(dy)) {
      if (dx > 0) {
        handleNext();
      } else {
        handlePrev();
      }
    }
  };

  const activePromo = promos[currentSlide] || promos[0];
  const oldPromo = previousSlide !== null ? promos[previousSlide] : null;

  // Notificar al componente padre cuando el color del producto cambia
  useEffect(() => {
    if (activePromo && onColorChange) {
      onColorChange(activePromo.bgColor);
    }
  }, [activePromo, onColorChange]);

  const formatCLP = (val) => {
    if (!val || isNaN(val)) return '$0';
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      maximumFractionDigits: 0,
    }).format(val);
  };

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

  const handleScrollDown = () => {
    const catalogEl = document.getElementById('catalogo-section');
    if (catalogEl) {
      catalogEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      window.scrollBy({ top: 500, behavior: 'smooth' });
    }
  };

  if (!activePromo) return null;

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className="relative w-full flex flex-col items-center select-none"
      aria-label="Vitrina de alimentos destacados"
    >
      {/* 1. ESCENARIO CENTRAL DEL SACO HEROICO (Con palabra monumental detrás) */}
      <div className="relative w-full h-[280px] sm:h-[340px] md:h-[380px] lg:h-[400px] flex items-center justify-center overflow-hidden">
        {/* Decorative Dog & Cat Paw Prints Layer */}
        <DecorativeShapes />

        {/* OVERSIZED VARIANT NAME BEHIND PRODUCT */}
        <div
          key={`oversized-${currentSlide}`}
          className="absolute inset-0 flex items-center justify-center z-10 text-center font-heading font-black uppercase whitespace-nowrap select-none pointer-events-none"
          style={{
            color: activePromo.inkColor,
            fontSize: 'clamp(2.8rem, 10.5vw, 8rem)',
            letterSpacing: '-0.04em',
            animation: 'oversizedEntrance 1.0s cubic-bezier(0.165, 0.84, 0.44, 1) forwards',
          }}
        >
          {activePromo.oversizedWord}
        </div>

        {/* OLD PRODUCT LAYER (Retained 0.3s to avoid blank gap) */}
        {oldPromo && (
          <div
            className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none opacity-0 transition-opacity duration-300 ease-out"
            aria-hidden="true"
          >
            <img
              src={oldPromo.productImg}
              alt={oldPromo.title}
              className="h-[88%] sm:h-[92%] w-auto max-w-[85%] sm:max-w-[48%] object-contain filter drop-shadow-[0_20px_35px_rgba(0,0,0,0.6)]"
            />
          </div>
        )}

        {/* NEW PRODUCT LAYER (Centrado 100%, Saco Grande y Proporcional) */}
        <div
          key={`product-entrance-${currentSlide}`}
          className="absolute inset-0 flex items-center justify-center z-20 pointer-events-auto"
          style={{
            animation: 'productEntrance 0.85s cubic-bezier(0.165, 0.84, 0.44, 1) forwards',
          }}
        >
          <img
            src={activePromo.productImg}
            alt={activePromo.title}
            className="h-[88%] sm:h-[92%] w-auto max-w-[85%] sm:max-w-[48%] object-contain filter drop-shadow-[0_24px_45px_rgba(0,0,0,0.65)] hover:scale-105 transition-transform duration-500 cursor-pointer"
            onClick={() => navigate(`/producto/${activePromo.productId}`)}
          />
        </div>

        {/* FLECHAS DE NAVEGACIÓN EN LOS EXTREMOS DEL ESCENARIO */}
        <button
          type="button"
          onClick={handlePrev}
          aria-label="Ver producto anterior"
          className="absolute left-1 sm:left-3 md:left-6 lg:left-8 top-1/2 -translate-y-1/2 z-30 w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded-full bg-black/35 hover:bg-black/65 text-white border border-white/20 backdrop-blur-md shadow-2xl transition-all hover:scale-110 active:scale-95 cursor-pointer"
        >
          <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>

        <button
          type="button"
          onClick={handleNext}
          aria-label="Ver siguiente producto"
          className="absolute right-1 sm:right-3 md:right-6 lg:right-8 top-1/2 -translate-y-1/2 z-30 w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded-full bg-black/35 hover:bg-black/65 text-white border border-white/20 backdrop-blur-md shadow-2xl transition-all hover:scale-110 active:scale-95 cursor-pointer"
        >
          <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>
      </div>

      {/* 2. DETALLES DEL PRODUCTO, PRECIO Y BOTÓN TOTALMENTE INTEGRADOS (Sin caja negra aislada) */}
      <div className="relative z-30 w-full max-w-2xl mx-auto flex flex-col items-center text-center px-4 pt-1.5 sm:pt-2 pb-1">
        {/* Título en grande del producto */}
        <h2
          className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-heading font-black text-white tracking-tight cursor-pointer hover:text-amber-200 transition-colors drop-shadow-sm leading-tight"
          onClick={() => navigate(`/producto/${activePromo.productId}`)}
        >
          {activePromo.title}
        </h2>

        {/* Fila de Precio y Botón de Comprar (Limpio, directo y compacto) */}
        <div className="mt-2.5 sm:mt-3 flex flex-wrap items-center justify-center gap-3 sm:gap-5">
          {/* Precio */}
          <div className="flex items-baseline">
            <span className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight drop-shadow-xs">
              {formatCLP(activePromo.price)}
            </span>
          </div>

          {/* Botón de Comprar */}
          <button
            type="button"
            onClick={handleAction}
            className="px-6 sm:px-8 py-2.5 sm:py-3 rounded-full bg-white hover:bg-[#F5BA13] text-[#1D1D1F] font-black text-xs sm:text-sm transition-all duration-300 shadow-xl hover:scale-105 active:scale-95 cursor-pointer flex items-center gap-1.5"
          >
            {justAddedId === activePromo.productId ? (
              <>
                <Check className="w-4 h-4 text-emerald-600" />
                <span>¡AGREGADO AL CARRO!</span>
              </>
            ) : (
              <>
                <span>COMPRAR AHORA</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>

        {/* Huellitas indicadoras flotantes (🐾) */}
        <div className="flex items-center justify-center gap-2 mt-2 sm:mt-2.5">
          {promos.map((p, idx) => (
            <PawIndicator
              key={p.id}
              active={currentSlide === idx}
              activeColor={activePromo.accentColor}
              onClick={() => changeToSlide(idx)}
              label={`Ir a ${p.title}`}
            />
          ))}
        </div>
      </div>

      {/* Visual Scroll Down Indicator (Optional) */}
      {showScrollIndicator && (
        <div className="flex flex-col items-center justify-center pt-4 pb-1">
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
                  ? 'bg-amber-500/10 text-amber-600'
                  : 'bg-[#C86D39]/10 text-[#C86D39]'
              }`}
            >
              <ChevronDown className="w-3.5 h-3.5 group-hover:translate-y-0.5 transition-transform duration-300" />
            </div>
          </button>
        </div>
      )}

      {/* Scoped CSS Keyframes for power3.out physics choreography */}
      <style>{`
        @keyframes productEntrance {
          0% {
            transform: translateY(50px) rotate(-5deg);
            opacity: 0;
          }
          100% {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
          }
        }

        @keyframes oversizedEntrance {
          0% {
            transform: translateX(45px);
            opacity: 0;
          }
          100% {
            transform: translateX(0);
            opacity: 0.88;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          @keyframes productEntrance {
            0% { opacity: 1; transform: none; }
            100% { opacity: 1; transform: none; }
          }
          @keyframes oversizedEntrance {
            0% { opacity: 0.88; transform: none; }
            100% { opacity: 0.88; transform: none; }
          }
        }
      `}</style>
    </div>
  );
}
