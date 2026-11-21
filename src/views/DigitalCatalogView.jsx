import React, { useState, useEffect, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Search,
  X,
  ShoppingBag,
  ArrowRight,
  Truck,
  Share2,
  Check,
  Clock,
  Zap,
  Sparkles,
  ExternalLink,
  SlidersHorizontal,
} from 'lucide-react';
import SEOHead from '../components/SEOHead';
import DigitalCatalogItemCard from '../components/catalog/DigitalCatalogItemCard';
import { WhatsAppIcon } from '../components/OfficialIcons';
import { PRODUCTS as FALLBACK_PRODUCTS } from '../data/mockData';
import { fetchProductsFromSupabase, getCachedProducts } from '../services/productsService';
import { supabase } from '../lib/supabase';
import { getHiddenProductIdentifiers, isProductHidden } from '../utils/productVisibility';
import { groupProductsForStore } from '../utils/productVariants';
import {
  getDispatchZonesFromSupabase,
  getLiveDispatchStatusFromSupabase,
  getUpcomingDeliveryDates,
  evaluateSmartDeliverySchedule,
} from '../services/dispatchService';
import { formatCLP } from '../utils/formatters';

const normalizeText = (value) =>
  String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();

const isGroupOutOfStock = (product) => {
  const variants = product?.variants || [];
  if (variants.length > 0) {
    return variants.every(
      (v) => (typeof v.stock === 'number' ? v.stock : 10) <= 0 || Boolean(v.isPaused)
    );
  }
  const stock = typeof product?.stock === 'number' ? product.stock : 10;
  return stock <= 0 || Boolean(product?.isOutOfStock || product?.isPaused);
};

/**
 * Catálogo Digital Express (/catalogo)
 * Diseñado específicamente para navegadores internos (WebViews) de Instagram y WhatsApp:
 * - Carga inmediata sin preloader ni navegación pesada
 * - Sincronización en vivo con stock de Supabase y Panel de Administración
 * - Selección 1-tap con contador en línea (- N +) y barra fija inferior de compra
 */
export default function DigitalCatalogView({
  cartItems = [],
  onAddToCart,
  onUpdateQuantity,
  onRemoveItem,
  onOpenCart,
  onSelectProduct,
}) {
  const [searchParams, setSearchParams] = useSearchParams();

  const cachedProducts = getCachedProducts();
  const [allProducts, setAllProducts] = useState(
    cachedProducts && cachedProducts.length > 0 ? cachedProducts : FALLBACK_PRODUCTS
  );
  const [isLoading, setIsLoading] = useState(!cachedProducts || cachedProducts.length === 0);
  const [hiddenProducts, setHiddenProducts] = useState(getHiddenProductIdentifiers);

  // Estado de despacho en vivo y umbral de envío gratis desde Supabase
  const [isFleetOnRoute, setIsFleetOnRoute] = useState(false);
  const [freeShippingThreshold, setFreeShippingThreshold] = useState(25000);
  const [shareToast, setShareToast] = useState('');

  // Filtros sincronizados con URL (?pet=perros|gatos, ?cat=..., ?marca=..., ?q=...)
  const [petFilter, setPetFilter] = useState(() => {
    const p = (searchParams.get('pet') || '').toLowerCase();
    return p === 'perros' || p === 'gatos' ? p : 'todos';
  });
  const [categoryFilter, setCategoryFilter] = useState(() => searchParams.get('cat') || 'Todas');
  const [brandFilter, setBrandFilter] = useState(() => searchParams.get('marca') || 'Todas');
  const [searchQuery, setSearchQuery] = useState(() => searchParams.get('q') || '');

  // Sincronizar si cambian los query params externamente
  useEffect(() => {
    const p = (searchParams.get('pet') || '').toLowerCase();
    if (p === 'perros' || p === 'gatos') setPetFilter(p);
    const cat = searchParams.get('cat');
    if (cat) setCategoryFilter(cat);
    const marca = searchParams.get('marca');
    if (marca) setBrandFilter(marca);
    const q = searchParams.get('q');
    if (q !== null) setSearchQuery(q);
  }, [searchParams]);

  // Cargar productos en vivo + suscripción Realtime de Supabase
  useEffect(() => {
    let isMounted = true;

    const loadProducts = async () => {
      try {
        const data = await fetchProductsFromSupabase();
        if (isMounted && Array.isArray(data) && data.length > 0) {
          setAllProducts(data);
        }
      } catch (err) {
        console.warn('Error cargando catálogo digital desde Supabase:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadProducts();

    const handleStorage = () => {
      setHiddenProducts(getHiddenProductIdentifiers());
      loadProducts();
    };

    window.addEventListener('storage', handleStorage);
    window.addEventListener('patitas_products_updated', loadProducts);

    const realtimeChannel = supabase
      .channel('digital_catalog_products_live')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, () => {
        loadProducts();
      })
      .subscribe();

    return () => {
      isMounted = false;
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('patitas_products_updated', loadProducts);
      supabase.removeChannel(realtimeChannel);
    };
  }, []);

  // Cargar estado de reparto en vivo y umbral de envío gratis
  useEffect(() => {
    let isMounted = true;

    const loadDispatchContext = async () => {
      try {
        const [liveStatus, zones] = await Promise.all([
          getLiveDispatchStatusFromSupabase(),
          getDispatchZonesFromSupabase(),
        ]);
        if (!isMounted) return;
        if (liveStatus && typeof liveStatus.isFleetOnRoute === 'boolean') {
          setIsFleetOnRoute(liveStatus.isFleetOnRoute);
        }
        if (Array.isArray(zones) && zones.length > 0) {
          const activeZones = zones.filter((z) => z.active !== false);
          const thresholds = activeZones
            .map((z) => Number(z.freeThreshold))
            .filter((t) => t > 0);
          if (thresholds.length > 0) {
            setFreeShippingThreshold(Math.min(...thresholds));
          }
        }
      } catch (err) {
        console.warn('Error cargando estado de despacho en Catálogo Digital:', err);
      }
    };

    loadDispatchContext();
    window.addEventListener('patitas_dispatch_live_status_updated', loadDispatchContext);
    window.addEventListener('patitas_dispatch_zones_updated', loadDispatchContext);
    return () => {
      isMounted = false;
      window.removeEventListener('patitas_dispatch_live_status_updated', loadDispatchContext);
      window.removeEventListener('patitas_dispatch_zones_updated', loadDispatchContext);
    };
  }, []);

  // Banner compacto del próximo despacho disponible ahora mismo
  const liveDispatchSummary = useMemo(() => {
    const upcoming = getUpcomingDeliveryDates([1, 2, 3, 4, 5, 6], 2, { isFleetOnRoute });
    const nextDate = upcoming[0] || null;
    const evalRes = evaluateSmartDeliverySchedule({
      isFleetOnRoute,
      selectedDateIso: nextDate?.isoDate || '',
    });

    if (evalRes.isSelectedSunday) {
      return {
        isUrgent: true,
        label: 'Domingo · Despacho Urgente 10:00–20:00',
      };
    }

    if (nextDate?.isToday) {
      const firstStd = (evalRes.slots || []).find((s) => !s.isUrgent);
      const isMorning = firstStd && /10:00|13:00|ma[ñn]ana/i.test(firstStd.value || '');
      return {
        isUrgent: false,
        label: isMorning ? 'Despacho hoy · 10:00 a 13:00 hrs' : 'Despacho hoy · 15:30 a 19:30 hrs',
      };
    }

    return {
      isUrgent: false,
      label: nextDate?.isTomorrow
        ? 'Próximo reparto · Mañana 10:00 hrs'
        : `Próximo reparto · ${nextDate?.cleanLabel || 'Mañana'}`,
    };
  }, [isFleetOnRoute]);

  // Agrupar productos visibles para el catálogo (misma fuente de verdad que la tienda)
  const visibleGroupedProducts = useMemo(() => {
    const active = allProducts.filter(
      (p) =>
        !p.isPaused &&
        !p.is_paused &&
        p.isActive !== false &&
        p.is_active !== false &&
        !isProductHidden(p, hiddenProducts)
    );
    return groupProductsForStore(active);
  }, [allProducts, hiddenProducts]);

  // Productos filtrados por tipo de mascota (para derivar categorías y marcas reales)
  const petScopedProducts = useMemo(() => {
    if (petFilter === 'todos') return visibleGroupedProducts;
    return visibleGroupedProducts.filter((p) => p.petType === petFilter);
  }, [visibleGroupedProducts, petFilter]);

  // Categorías dinámicas disponibles
  const availableCategories = useMemo(() => {
    const map = new Map();
    petScopedProducts.forEach((p) => {
      const rawCat = String(p.category || '').trim();
      if (!rawCat) return;
      const key = normalizeText(rawCat);
      if (!map.has(key)) {
        map.set(key, rawCat);
      }
    });
    return ['Todas', ...Array.from(map.values())];
  }, [petScopedProducts]);

  // Marcas dinámicas disponibles (ordenadas por cantidad de productos)
  const availableBrands = useMemo(() => {
    const counts = new Map();
    petScopedProducts.forEach((p) => {
      const b = String(p.brand || '').trim();
      if (!b) return;
      counts.set(b, (counts.get(b) || 0) + 1);
    });
    const sorted = Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([name]) => name);
    return ['Todas', ...sorted];
  }, [petScopedProducts]);

  // Filtrado maestro + separación de disponibles vs agotados al final
  const { inStockProducts, outOfStockProducts } = useMemo(() => {
    const qNorm = normalizeText(searchQuery);
    const catNorm = normalizeText(categoryFilter);
    const brandNorm = normalizeText(brandFilter);

    const filtered = petScopedProducts.filter((product) => {
      if (categoryFilter !== 'Todas') {
        const pCat = normalizeText(product.category);
        if (pCat !== catNorm && !pCat.includes(catNorm)) return false;
      }

      if (brandFilter !== 'Todas') {
        const pBrand = normalizeText(product.brand);
        if (pBrand !== brandNorm) return false;
      }

      if (qNorm) {
        const haystack = [
          product.name,
          product.brand,
          product.category,
          product.tagline,
          product.mainProtein,
          ...(Array.isArray(product.ingredients) ? product.ingredients : []),
          ...(Array.isArray(product.weights) ? product.weights : []),
        ]
          .map(normalizeText)
          .join(' ');
        if (!haystack.includes(qNorm)) return false;
      }

      return true;
    });

    const available = [];
    const soldOut = [];
    filtered.forEach((p) => {
      if (isGroupOutOfStock(p)) {
        soldOut.push(p);
      } else {
        available.push(p);
      }
    });

    return { inStockProducts: available, outOfStockProducts: soldOut };
  }, [petScopedProducts, categoryFilter, brandFilter, searchQuery]);

  const totalMatches = inStockProducts.length + outOfStockProducts.length;
  const hasActiveFilters =
    petFilter !== 'todos' ||
    categoryFilter !== 'Todas' ||
    brandFilter !== 'Todas' ||
    searchQuery.trim().length > 0;

  // Actualizar query params al cambiar filtros para que el link siempre sea compartible
  const syncUrlParams = (updates) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, val]) => {
      if (!val || val === 'todos' || val === 'Todas') {
        next.delete(key);
      } else {
        next.set(key, val);
      }
    });
    setSearchParams(next, { replace: true });
  };

  const handlePetChange = (nextPet) => {
    setPetFilter(nextPet);
    setCategoryFilter('Todas');
    setBrandFilter('Todas');
    syncUrlParams({ pet: nextPet, cat: '', marca: '' });
  };

  const handleCategoryChange = (nextCat) => {
    setCategoryFilter(nextCat);
    syncUrlParams({ cat: nextCat });
  };

  const handleBrandChange = (nextBrand) => {
    setBrandFilter(nextBrand);
    syncUrlParams({ marca: nextBrand });
  };

  const handleSearchChange = (val) => {
    setSearchQuery(val);
    syncUrlParams({ q: val.trim() });
  };

  const handleResetFilters = () => {
    setPetFilter('todos');
    setCategoryFilter('Todas');
    setBrandFilter('Todas');
    setSearchQuery('');
    syncUrlParams({ pet: '', cat: '', marca: '', q: '' });
  };

  // Compartir enlace del catálogo (con filtros activos si existen)
  const handleShareCatalog = async () => {
    const shareUrl = window.location.href;
    const shareTitle = 'Catálogo Digital · Patitas del Sur 🐾';
    const shareText =
      'Mira el catálogo con stock en vivo y despacho a domicilio de Patitas del Sur:';

    try {
      if (navigator.share) {
        await navigator.share({ title: shareTitle, text: shareText, url: shareUrl });
        return;
      }
    } catch {
      // Usuario canceló compartir nativo o no soportado en WebView
    }

    try {
      await navigator.clipboard.writeText(shareUrl);
      setShareToast('¡Enlace del catálogo copiado!');
      setTimeout(() => setShareToast(''), 2200);
    } catch {
      setShareToast('Copia el enlace desde la barra superior');
      setTimeout(() => setShareToast(''), 2500);
    }
  };

  // Totales del carrito para la barra fija inferior
  const totalCartCount = useMemo(
    () => cartItems.reduce((acc, item) => acc + (item.quantity || 1), 0),
    [cartItems]
  );
  const cartSubtotal = useMemo(
    () => cartItems.reduce((acc, item) => acc + (Number(item.price) || 0) * (item.quantity || 1), 0),
    [cartItems]
  );
  const freeShippingRemaining = Math.max(0, freeShippingThreshold - cartSubtotal);
  const freeShippingProgress = Math.min(100, (cartSubtotal / freeShippingThreshold) * 100);
  const hasFreeShipping = cartSubtotal >= freeShippingThreshold && totalCartCount > 0;

  const whatsappHelpUrl = `https://wa.me/56953332492?text=${encodeURIComponent(
    '¡Hola Patitas del Sur! 🐾 Estoy viendo su catálogo digital y necesito orientación para elegir el mejor alimento para mi mascota.'
  )}`;

  return (
    <div className="min-h-[100dvh] bg-[#FAF8F4] text-[#1D1D1F] flex flex-col">
      <SEOHead
        title="Catálogo Digital | Pedido Rápido"
        description="Compra alimento natural, snacks y arena para perros y gatos con stock en vivo y despacho a domicilio en Frutillar, Puerto Varas y Llanquihue."
        canonicalPath="/catalogo"
      />

      {/* ================================================================= */}
      {/* CABECERA COMPACTA STICKY (OPTIMIZADA PARA INSTAGRAM / WHATSAPP)   */}
      {/* ================================================================= */}
      <header className="sticky top-0 z-30 bg-[#FAF8F4]/95 backdrop-blur-md border-b border-[#1D1D1F]/10 shadow-[0_4px_18px_-10px_rgba(29,29,31,0.12)]">
        <div className="max-w-4xl mx-auto px-3.5 sm:px-5 pt-3 pb-2.5 space-y-2.5">
          {/* Fila 1: Marca + Acciones discretas (Asesoría WhatsApp + Compartir) */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-[#1D1D1F] flex items-center justify-center p-1.5 shrink-0 shadow-xs">
                <img
                  src="/images/logo_patitas_del_sur_amber.svg"
                  alt="Patitas del Sur"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h1 className="text-sm sm:text-base font-black text-[#1D1D1F] tracking-tight truncate leading-none">
                    Patitas del Sur
                  </h1>
                  <span className="text-[9.5px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-[#F5BA13] text-[#1D1D1F] shrink-0">
                    Catálogo
                  </span>
                </div>
                <div className="flex items-center gap-1 mt-1">
                  {liveDispatchSummary.isUrgent ? (
                    <Zap className="w-3 h-3 text-[#D97706] shrink-0 fill-current" />
                  ) : (
                    <Clock className="w-3 h-3 text-[#D97706] shrink-0" />
                  )}
                  <span className="text-[11px] font-bold text-[#78350F] truncate">
                    {liveDispatchSummary.label}
                  </span>
                </div>
              </div>
            </div>

            {/* Botones discretos de WhatsApp y Compartir */}
            <div className="flex items-center gap-1.5 shrink-0">
              <a
                href={whatsappHelpUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200/90 text-[11px] font-extrabold transition-colors active:scale-95"
                title="Consultar dudas por WhatsApp"
                aria-label="Asesoría por WhatsApp"
              >
                <WhatsAppIcon className="w-3.5 h-3.5 text-[#25D366] shrink-0" />
                <span className="hidden xs:inline sm:inline">Asesoría</span>
              </a>

              <button
                type="button"
                onClick={handleShareCatalog}
                className="w-8 h-8 rounded-full bg-white hover:bg-[#FEF3C7] text-[#1D1D1F] border border-[#1D1D1F]/12 flex items-center justify-center transition-colors active:scale-95 cursor-pointer"
                title="Compartir enlace del catálogo"
                aria-label="Compartir enlace del catálogo"
              >
                {shareToast ? (
                  <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" />
                ) : (
                  <Share2 className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          </div>

          {/* Toast sutil de enlace copiado */}
          {shareToast && (
            <div className="px-3 py-1.5 rounded-xl bg-[#1D1D1F] text-[#F5BA13] text-[11px] font-bold flex items-center justify-center gap-1.5 animate-in fade-in duration-150">
              <Check className="w-3.5 h-3.5" />
              <span>{shareToast}</span>
            </div>
          )}

          {/* Fila 2: Buscador Instantáneo (16px para evitar auto-zoom en iOS WebViews) */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="search"
              inputMode="search"
              enterKeyHint="search"
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Buscar marca, alimento, snack o proteína..."
              className="w-full pl-10 pr-9 py-2.5 rounded-2xl bg-white border border-[#1D1D1F]/12 focus:border-[#F5BA13] focus:ring-2 focus:ring-[#F5BA13]/25 text-[16px] sm:text-sm font-medium text-[#1D1D1F] placeholder:text-slate-400 outline-none shadow-2xs transition-all"
              aria-label="Buscar productos en el catálogo digital"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => handleSearchChange('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center cursor-pointer"
                aria-label="Limpiar búsqueda"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Fila 3: Switch Rápido de Mascota (Todos / Perros / Gatos) */}
          <div className="grid grid-cols-3 gap-1.5 p-1 rounded-2xl bg-[#1D1D1F]/6">
            {[
              { id: 'todos', label: 'Todos', emoji: '🐾' },
              { id: 'perros', label: 'Perros', emoji: '🐶' },
              { id: 'gatos', label: 'Gatos', emoji: '🐱' },
            ].map((tab) => {
              const isActive = petFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => handlePetChange(tab.id)}
                  className={`py-2 px-2 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95 ${
                    isActive
                      ? 'bg-[#1D1D1F] text-[#F5BA13] shadow-xs'
                      : 'text-[#1D1D1F]/70 hover:text-[#1D1D1F]'
                  }`}
                >
                  <span aria-hidden="true">{tab.emoji}</span>
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Fila 4: Chips deslizables de Categorías */}
          {availableCategories.length > 2 && (
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5 -mx-3.5 px-3.5 sm:mx-0 sm:px-0">
              {availableCategories.map((cat) => {
                const isActive = categoryFilter === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => handleCategoryChange(cat)}
                    className={`px-3 py-1.5 rounded-full text-[11.5px] font-extrabold border whitespace-nowrap shrink-0 transition-all cursor-pointer active:scale-95 ${
                      isActive
                        ? 'bg-[#F5BA13] text-[#1D1D1F] border-[#F5BA13] shadow-2xs'
                        : 'bg-white text-slate-700 border-[#1D1D1F]/12 hover:border-[#F5BA13]'
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </header>

      {/* ================================================================= */}
      {/* CONTENIDO PRINCIPAL: MARCAS RÁPIDAS + LISTA COMPACTA DE PRODUCTOS */}
      {/* ================================================================= */}
      <main
        className={`flex-1 max-w-4xl w-full mx-auto px-3.5 sm:px-5 pt-3.5 space-y-3.5 ${
          totalCartCount > 0 ? 'pb-40' : 'pb-12'
        }`}
      >
        {/* Fila compacta de marcas + contador de resultados */}
        {availableBrands.length > 2 && (
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar -mx-3.5 px-3.5 sm:mx-0 sm:px-0">
            <span className="text-[10.5px] font-extrabold text-slate-400 uppercase tracking-wider shrink-0 flex items-center gap-1 mr-0.5">
              <SlidersHorizontal className="w-3 h-3 text-[#D97706]" />
              <span>Marca:</span>
            </span>
            {availableBrands.map((brand) => {
              const isActive = brandFilter === brand;
              return (
                <button
                  key={brand}
                  type="button"
                  onClick={() => handleBrandChange(brand)}
                  className={`px-2.5 py-1 rounded-full text-[11px] font-bold border whitespace-nowrap shrink-0 transition-all cursor-pointer active:scale-95 ${
                    isActive
                      ? 'bg-[#1D1D1F] text-[#F5BA13] border-[#1D1D1F]'
                      : 'bg-white/80 text-slate-600 border-[#1D1D1F]/10 hover:border-[#F5BA13]'
                  }`}
                >
                  {brand}
                </button>
              );
            })}
          </div>
        )}

        {/* Resumen de resultados + link limpiar filtros */}
        <div className="flex items-center justify-between gap-2 text-[11.5px] px-0.5">
          <div className="flex items-center gap-1.5 text-slate-500 font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-[#D97706] shrink-0" />
            <span>
              <strong className="text-[#1D1D1F] font-extrabold">{inStockProducts.length}</strong>{' '}
              {inStockProducts.length === 1 ? 'producto disponible' : 'productos disponibles'}
              {outOfStockProducts.length > 0 && (
                <span className="text-slate-400"> · {outOfStockProducts.length} agotados</span>
              )}
            </span>
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="text-[11px] font-extrabold text-[#B45309] hover:text-[#1D1D1F] underline cursor-pointer shrink-0"
            >
              Limpiar filtros
            </button>
          )}
        </div>

        {/* Estado de carga skeleton liviano */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 sm:gap-3">
            {Array.from({ length: 6 }).map((_, idx) => (
              <div
                key={idx}
                className="rounded-2xl bg-white border border-[#1D1D1F]/8 p-3 flex items-center gap-3 animate-pulse"
              >
                <div className="w-24 h-24 rounded-xl bg-slate-200/70 shrink-0" />
                <div className="flex-1 space-y-2.5">
                  <div className="h-3 w-20 bg-slate-200/70 rounded" />
                  <div className="h-4 w-3/4 bg-slate-200/70 rounded" />
                  <div className="h-6 w-28 bg-slate-200/70 rounded-full" />
                  <div className="flex justify-between items-center pt-1">
                    <div className="h-5 w-16 bg-slate-200/70 rounded" />
                    <div className="h-9 w-24 bg-slate-200/70 rounded-xl" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : totalMatches === 0 ? (
          /* Estado vacío amigable */
          <div className="bg-white rounded-3xl border border-[#1D1D1F]/10 p-8 text-center space-y-3 shadow-xs">
            <div className="w-12 h-12 rounded-2xl bg-[#FEF3C7] text-[#D97706] mx-auto flex items-center justify-center">
              <Search className="w-6 h-6" />
            </div>
            <h2 className="text-base font-black text-[#1D1D1F]">
              No encontramos productos con esos filtros
            </h2>
            <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
              Prueba buscando otro término o pregúntanos directo por WhatsApp si necesitas un alimento específico.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
              <button
                type="button"
                onClick={handleResetFilters}
                className="px-4 py-2.5 rounded-xl bg-[#1D1D1F] text-[#F5BA13] text-xs font-black cursor-pointer active:scale-95 transition-transform"
              >
                Ver todo el catálogo
              </button>
              <a
                href={whatsappHelpUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#25D366] text-white text-xs font-black active:scale-95 transition-transform"
              >
                <WhatsAppIcon className="w-3.5 h-3.5" />
                <span>Consultar por WhatsApp</span>
              </a>
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            {/* Lista de Productos Disponibles (1 columna en móvil, 2 en desktop) */}
            {inStockProducts.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 sm:gap-3.5">
                {inStockProducts.map((product) => (
                  <DigitalCatalogItemCard
                    key={product.id}
                    product={product}
                    cartItems={cartItems}
                    onAddToCart={onAddToCart}
                    onUpdateQuantity={onUpdateQuantity}
                    onRemoveItem={onRemoveItem}
                    onSelectProduct={onSelectProduct}
                  />
                ))}
              </div>
            )}

            {/* Productos Agotados al final con etiqueta clara */}
            {outOfStockProducts.length > 0 && (
              <section className="space-y-2.5 pt-1">
                <div className="flex items-center gap-2">
                  <div className="h-px flex-1 bg-[#1D1D1F]/10" />
                  <span className="text-[10.5px] font-black uppercase tracking-wider text-slate-400">
                    Temporalmente agotados ({outOfStockProducts.length})
                  </span>
                  <div className="h-px flex-1 bg-[#1D1D1F]/10" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 sm:gap-3.5">
                  {outOfStockProducts.map((product) => (
                    <DigitalCatalogItemCard
                      key={product.id}
                      product={product}
                      cartItems={cartItems}
                      onAddToCart={onAddToCart}
                      onUpdateQuantity={onUpdateQuantity}
                      onRemoveItem={onRemoveItem}
                      onSelectProduct={onSelectProduct}
                    />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}

        {/* Pie discreto con info de pago y acceso a la web completa */}
        <footer className="pt-4 pb-2 text-center space-y-2 border-t border-[#1D1D1F]/8">
          <p className="text-[11px] text-slate-500 font-medium">
            Envío gratis desde <strong className="text-[#1D1D1F]">{formatCLP(freeShippingThreshold)}</strong> · Paga con Mercado Pago o Contra Entrega
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-1 text-[11px] font-extrabold text-[#B45309] hover:text-[#1D1D1F] transition-colors"
          >
            <span>Visitar sitio web completo</span>
            <ExternalLink className="w-3 h-3" />
          </Link>
        </footer>
      </main>

      {/* ================================================================= */}
      {/* BARRA INFERIOR FIJA DEL CARRITO (STICKY CART BAR + SAFE AREA)     */}
      {/* ================================================================= */}
      {totalCartCount > 0 && (
        <div className="fixed bottom-0 inset-x-0 z-40 px-3 pt-2 pb-safe bg-gradient-to-t from-[#FAF8F4] via-[#FAF8F4]/95 to-transparent pointer-events-none">
          <div className="max-w-4xl mx-auto pointer-events-auto rounded-2xl bg-[#1D1D1F] text-white shadow-[0_14px_34px_-8px_rgba(29,29,31,0.45)] border border-[#F5BA13]/30 overflow-hidden animate-in slide-in-from-bottom-4 duration-200">
            {/* Micro-barra superior de Envío Gratis */}
            <div
              className={`px-3.5 py-1.5 text-[11px] font-bold flex items-center justify-between gap-2 ${
                hasFreeShipping
                  ? 'bg-emerald-600 text-white'
                  : 'bg-[#2A2620] text-[#FDE68A]'
              }`}
            >
              <span className="flex items-center gap-1.5 truncate">
                {hasFreeShipping ? (
                  <Check className="w-3.5 h-3.5 stroke-[3] shrink-0" />
                ) : (
                  <Truck className="w-3.5 h-3.5 text-[#F5BA13] shrink-0" />
                )}
                <span className="truncate">
                  {hasFreeShipping
                    ? '¡Envío Gratis desbloqueado en ventanas estándar!'
                    : `Te faltan ${formatCLP(freeShippingRemaining)} para Envío Gratis`}
                </span>
              </span>
              {!hasFreeShipping && (
                <div className="w-16 h-1.5 rounded-full bg-white/15 overflow-hidden shrink-0">
                  <div
                    className="h-full bg-[#F5BA13] transition-all duration-300"
                    style={{ width: `${freeShippingProgress}%` }}
                  />
                </div>
              )}
            </div>

            {/* Acción principal: Resumen + Botón Ver Pedido y Comprar */}
            <div className="p-2.5 sm:p-3 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0 pl-1">
                <div className="relative w-10 h-10 rounded-xl bg-[#F5BA13]/15 border border-[#F5BA13]/40 text-[#F5BA13] flex items-center justify-center shrink-0">
                  <ShoppingBag className="w-4 h-4" />
                  <span className="absolute -top-1.5 -right-1.5 min-w-[20px] h-5 px-1 rounded-full bg-[#F5BA13] text-[#1D1D1F] text-[10px] font-black flex items-center justify-center shadow-xs">
                    {totalCartCount}
                  </span>
                </div>
                <div className="min-w-0">
                  <span className="block text-[10px] uppercase tracking-wider text-white/65 font-bold leading-none">
                    Subtotal ({totalCartCount} {totalCartCount === 1 ? 'un.' : 'uns.'})
                  </span>
                  <span className="block text-base sm:text-lg font-black text-white leading-tight tabular-nums mt-0.5">
                    {formatCLP(cartSubtotal)}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={onOpenCart}
                className="px-4 sm:px-5 py-3 rounded-xl bg-[#F5BA13] hover:bg-[#e5ab0d] text-[#1D1D1F] font-black text-xs sm:text-sm flex items-center gap-1.5 shadow-md shadow-[#F5BA13]/25 active:scale-95 transition-all cursor-pointer shrink-0"
              >
                <span>Ver pedido y comprar</span>
                <ArrowRight className="w-4 h-4 stroke-[2.6]" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
