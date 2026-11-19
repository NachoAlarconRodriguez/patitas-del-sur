import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import AdvancedFilterPanel from '../components/AdvancedFilterPanel';
import { PRODUCTS as FALLBACK_PRODUCTS, BRANDS } from '../data/mockData';
import { fetchProductsFromSupabase, getCachedProducts } from '../services/productsService';
import { supabase } from '../lib/supabase';
import { getHiddenProductIdentifiers, isProductHidden } from '../utils/productVisibility';
import { groupProductsForStore } from '../utils/productVariants';
import SEOHead from '../components/SEOHead';
import { getBreadcrumbSchema, getFAQPageSchema } from '../utils/schemaGenerators';
import LocalDeliveryZones from '../components/LocalDeliveryZones';
import FAQSection, { GATOS_FAQS, GENERAL_FAQS } from '../components/FAQSection';
import CatLoadingSpinner from '../components/CatLoadingSpinner';

export default function GatosView({ onSelectProduct, onAddToCart }) {
  const cached = getCachedProducts();
  const [allProducts, setAllProducts] = useState(cached || FALLBACK_PRODUCTS);
  const [isLoading, setIsLoading] = useState(!cached || cached.length === 0);
  const [hiddenProducts, setHiddenProducts] = useState(getHiddenProductIdentifiers);

  // Carga en vivo desde Supabase
  useEffect(() => {
    let isMounted = true;
    const loadProducts = async () => {
      try {
        const data = await fetchProductsFromSupabase();
        if (isMounted && data && data.length > 0) {
          setAllProducts(data);
        }
      } catch (err) {
        console.error('Error al cargar productos de gatos:', err);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadProducts();

    const handleStorage = () => {
      setHiddenProducts(getHiddenProductIdentifiers());
      loadProducts();
    };

    window.addEventListener('storage', handleStorage);
    window.addEventListener('patitas_products_updated', loadProducts);

    // Canal en tiempo real para reflejar nuevos productos o sabores de inmediato
    const channel = supabase
      .channel('products-realtime-gatos')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, () => {
        loadProducts();
      })
      .subscribe();

    return () => {
      isMounted = false;
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('patitas_products_updated', loadProducts);
      supabase.removeChannel(channel);
    };
  }, []);

  const catProducts = useMemo(
    () => {
      const filtered = allProducts.filter(
        (p) =>
          p.petType === 'gatos' &&
          !p.isPaused &&
          !p.is_paused &&
          p.isActive !== false &&
          p.is_active !== false &&
          !isProductHidden(p, hiddenProducts)
      );
      return groupProductsForStore(filtered);
    },
    [allProducts, hiddenProducts]
  );

  // Filter States (synchronized with ?q= query param for Schema.org SearchAction)
  const [searchParams] = useSearchParams();
  const [selectedBrand, setSelectedBrand] = useState('Todas');
  const [searchQuery, setSearchQuery] = useState(() => searchParams.get('q') || '');
  const [proteinFilter, setProteinFilter] = useState('Todos');
  const [weightFilter, setWeightFilter] = useState('Todos');
  const [categoryFilter, setCategoryFilter] = useState('Todos');

  useEffect(() => {
    const urlQuery = searchParams.get('q');
    if (urlQuery !== null) {
      setSearchQuery(urlQuery);
    }
  }, [searchParams]);

  // Count per brand
  const productCountsByBrand = useMemo(() => {
    const counts = {};
    catProducts.forEach((p) => {
      if (p.brand) {
        counts[p.brand] = (counts[p.brand] || 0) + 1;
      }
    });
    return counts;
  }, [catProducts]);

  // Master Filter logic
  const filteredProducts = useMemo(() => {
    return catProducts.filter((product) => {
      // 1. Brand filter
      if (selectedBrand !== 'Todas' && product.brand !== selectedBrand) {
        return false;
      }

      // 2. Keyword Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = product.name.toLowerCase().includes(q);
        const matchTagline = product.tagline.toLowerCase().includes(q);
        const matchBrand = product.brand ? product.brand.toLowerCase().includes(q) : false;
        const matchIngredients = product.ingredients
          ? product.ingredients.some((ing) => ing.toLowerCase().includes(q))
          : false;

        if (!matchName && !matchTagline && !matchBrand && !matchIngredients) {
          return false;
        }
      }

      // 3. Protein % / Source Filter
      if (proteinFilter !== 'Todos') {
        const prot = product.proteinValue || 0;
        const mainP = (product.mainProtein || '').toLowerCase();
        const pName = (product.name || '').toLowerCase();
        const filterLower = proteinFilter.toLowerCase();

        if (proteinFilter === 'high') {
          if (prot < 30 || prot > 40) return false;
        } else if (proteinFilter === 'super') {
          if (prot <= 40) return false;
        } else if (proteinFilter === 'moderate') {
          if (prot >= 30) return false;
        } else {
          // Check if proteinFilter is a source (e.g. Pollo, Salmón, Trucha, Pescado, Cordero)
          const matchesMain = mainP.includes(filterLower);
          const matchesName = pName.includes(filterLower);
          const matchesVariants = Array.isArray(product.variants) && product.variants.some((v) =>
            (v.format || v.name || '').toLowerCase().includes(filterLower)
          );
          if (!matchesMain && !matchesName && !matchesVariants) {
            return false;
          }
        }
      }

      // 4. Weight / Format Filter
      if (weightFilter !== 'Todos') {
        const weights = (product.weights || []).map((w) => String(w).toLowerCase());
        const variantWeights = (product.variants || []).map((v) => String(v.format || '').toLowerCase());
        const prodFormat = String(product.format || '').toLowerCase();
        const targetClean = weightFilter.toLowerCase().replace(',', '.').trim();

        const matches = [...weights, ...variantWeights, prodFormat].some((w) => {
          const wClean = w.replace(',', '.');
          return wClean.includes(targetClean) || targetClean.includes(wClean);
        });

        if (!matches) {
          if (weightFilter === 'snacks' && weights.some((w) => w.includes('g') || w.includes('Pack'))) return true;
          if (weightFilter === 'standard' && weights.some((w) => w.includes('1.5 kg') || w.includes('3.5 kg'))) return true;
          if (weightFilter === 'bulk' && weights.some((w) => w.includes('7 kg') || w.includes('10 kg') || w.includes('11 kg'))) return true;
          return false;
        }
      }

      // 5. Category / Tipo de Alimento filter
      if (categoryFilter !== 'Todos' && product.category !== categoryFilter) {
        return false;
      }

      return true;
    });
  }, [catProducts, selectedBrand, searchQuery, proteinFilter, weightFilter, categoryFilter]);

  // Group products by brand when "Todas las Marcas" is selected
  const groupedProducts = useMemo(() => {
    const groups = {};
    filteredProducts.forEach((p) => {
      const b = p.brand || 'Recetas Felinas Holísticas';
      if (!groups[b]) groups[b] = [];
      groups[b].push(p);
    });
    return groups;
  }, [filteredProducts]);

  const handleResetFilters = () => {
    setSelectedBrand('Todas');
    setSearchQuery('');
    setProteinFilter('Todos');
    setWeightFilter('Todos');
    setCategoryFilter('Todos');
  };

  return (
    <div className="kibo-page kibo-catalog">
      <SEOHead
        title="Alimento y Snacks Naturales para Gatos en Puerto Varas"
        description="Catálogo de alimento felino super premium 100% Grain Free, patés y antiparasitarios para gatos. Despacho express en Puerto Varas, Llanquihue y Frutillar."
        canonical="/gatos"
        keywords="alimento gatos puerto varas, comida gatos llanquihue, bravery gatos los lagos, grain free gatos chile"
        jsonLd={[
          getBreadcrumbSchema([
            { name: 'Inicio', url: '/' },
            { name: 'Gatos', url: '/gatos' },
          ]),
          getFAQPageSchema([...GATOS_FAQS, ...GENERAL_FAQS.slice(0, 2)]),
        ]}
      />

      {/* Shared SVG Symbols (#i-paw, #i-star) */}
      <svg width="0" height="0" aria-hidden="true" focusable="false" style={{ position: 'absolute' }}>
        <symbol id="i-paw" viewBox="0 0 24 24">
          <g fill="currentColor">
            <ellipse cx="12" cy="16.2" rx="5.2" ry="4.4" />
            <ellipse cx="5.4" cy="10.4" rx="2.1" ry="2.6" transform="rotate(-20 5.4 10.4)" />
            <ellipse cx="9.5" cy="6.3" rx="2.2" ry="2.8" transform="rotate(-8 9.5 6.3)" />
            <ellipse cx="14.5" cy="6.3" rx="2.2" ry="2.8" transform="rotate(8 14.5 6.3)" />
            <ellipse cx="18.6" cy="10.4" rx="2.1" ry="2.6" transform="rotate(20 18.6 10.4)" />
          </g>
        </symbol>
        <symbol id="i-star" viewBox="0 0 24 24">
          <path
            fill="currentColor"
            d="M12 2.5l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.3l-5.9 3.3 1.3-6.6-4.9-4.6 6.6-.8z"
          />
        </symbol>
      </svg>

      <h1 className="sr-only">
        Alimento y Nutrición Super Premium para Gatos en Puerto Varas, Llanquihue y Frutillar
      </h1>

      {/* Tarjeta 1: Contenedor Hero de Categoría (.card--green) */}
      <section className="card card--green cat-hero">
        <div className="cat-hero__content">
          <span className="eyebrow w-fit">
            <svg className="paw paw--inline" viewBox="0 0 24 24" aria-hidden="true">
              <use href="#i-paw" />
            </svg>
            Nutrición para Gatos · {filteredProducts.length} {filteredProducts.length === 1 ? 'receta en stock' : 'recetas en stock'}
          </span>
          <h2 className="h2 text-white">
            Recetas para michis exigentes.
          </h2>
          <p className="cat-hero__sub">
            Fórmulas ricas en proteína animal y humedad con despacho rápido directo a tu puerta en el Sur.
          </p>

          {/* Buscador integrado en el Hero */}
          <div className="cat-hero__search" role="search">
            <svg
              className="w-4 h-4 text-[#D97706] shrink-0 mr-2.5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por marca, salmón, pollo, paté, formato..."
              aria-label="Buscar alimento para gatos"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="w-6 h-6 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center text-xs font-bold shrink-0 ml-1 cursor-pointer"
                aria-label="Limpiar búsqueda"
              >
                ×
              </button>
            )}
          </div>
        </div>

        <div className="cat-hero__art" aria-hidden="true">
          <span className="hand-note hand-note--light">
            ¡aprobado por Jack!
            <svg viewBox="0 0 80 50">
              <path
                d="M4 6 C 30 4, 58 14, 70 40 M 62 34 L 70 41 L 74 31"
                pathLength="1"
              />
            </svg>
          </span>
          <figure className="cat-hero__mascot cat-hero__mascot--cat">
            <img
              src="/images/jack_peek_alpha.png?v=1"
              alt="Jack, mascota de Patitas del Sur"
              width="882"
              height="773"
              loading="eager"
              decoding="async"
            />
          </figure>
        </div>
      </section>

      {/* Tarjeta 2: Cuerpo del Catálogo (.card--blush) */}
      <section id="catalogo-section" className="card card--blush cat-body scroll-mt-24">
        {/* Unified Filter Panel (Marca + Proteína + Formato + Tipo) */}
        <AdvancedFilterPanel
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedBrand={selectedBrand}
          onBrandChange={setSelectedBrand}
          productCountsByBrand={productCountsByBrand}
          proteinFilter={proteinFilter}
          onProteinChange={setProteinFilter}
          weightFilter={weightFilter}
          onWeightChange={setWeightFilter}
          categoryFilter={categoryFilter}
          onCategoryChange={setCategoryFilter}
          onResetFilters={handleResetFilters}
          totalResultsCount={filteredProducts.length}
          products={catProducts}
          isLoading={isLoading}
          petType="gatos"
        />

        {/* Products Displayed & Grouped by Brands */}
        {isLoading ? (
          <CatLoadingSpinner showSkeletons={true} />
        ) : filteredProducts.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center text-slate-500 space-y-3 border border-slate-200">
            <p className="text-lg font-bold text-slate-800">No encontramos productos felinos con los filtros seleccionados</p>
            <p className="text-xs">Prueba cambiando la marca, el porcentaje de proteína o limpiando los filtros.</p>
            <button
              onClick={handleResetFilters}
              className="px-6 py-2.5 rounded-full bg-[#1D1D1F] hover:bg-[#F5BA13] text-white hover:text-[#1D1D1F] text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer"
            >
              Restablecer Todos los Filtros
            </button>
          </div>
        ) : selectedBrand !== 'Todas' ? (
          /* Single Brand Selected */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onSelectProduct={onSelectProduct}
                onAddToCart={onAddToCart}
              />
            ))}
          </div>
        ) : (
          /* Grouped by Brands View */
          <div className="space-y-12">
            {Object.keys(groupedProducts).map((brandName) => {
              const brandMeta = BRANDS.find((b) => b.name === brandName);
              const items = groupedProducts[brandName];

              return (
                <div key={brandName} className="space-y-5">
                  {/* Brand Group Header */}
                  <div className="flex items-center justify-between pb-3.5 border-b border-[#1D1D1F]/10">
                    <div className="flex items-center gap-3.5">
                      <div className="w-11 h-11 rounded-full bg-[#FEF3C7] border border-[#F5BA13]/40 flex items-center justify-center text-[#D97706] shadow-2xs shrink-0">
                        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                          <use href="#i-paw" />
                        </svg>
                      </div>
                      <div>
                        <div className="flex items-center gap-2.5">
                          <h2
                            className="text-xl md:text-2xl font-extrabold text-[#1D1D1F] leading-none"
                            style={{ fontFamily: 'var(--font-display)', letterSpacing: '-0.03em' }}
                          >
                            {brandName}
                          </h2>
                          {brandMeta?.badge && (
                            <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full bg-[#FEF3C7] text-[#78350F] border border-[#F5BA13]/40 text-[10px] font-extrabold">
                              {brandMeta.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 font-semibold mt-1">
                          {brandMeta ? brandMeta.tagline : 'Fórmulas Holísticas Felinas de la Patagonia'}
                        </p>
                      </div>
                    </div>
                    <span className="pill-label">
                      <svg className="paw" viewBox="0 0 24 24" aria-hidden="true">
                        <use href="#i-paw" />
                      </svg>
                      {items.length} {items.length === 1 ? 'receta' : 'recetas'}
                    </span>
                  </div>

                  {/* Brand Product Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {items.map((product) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        onSelectProduct={onSelectProduct}
                        onAddToCart={onAddToCart}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Tarjeta 3: Preguntas Frecuentes y Guía Nutricional AEO */}
      <div className="card cat-extra">
        <FAQSection
          type="gatos"
          title="Preguntas Frecuentes sobre Alimento y Salud Felina"
          subtitle="Respuestas veterinarias directas y estructuradas sobre nutrición carnívora estricta, prevención urinaria y despacho en Los Lagos."
        />
      </div>

      {/* Tarjeta 4: Módulo de Cobertura y Despacho Local Los Lagos */}
      <div className="card cat-extra">
        <LocalDeliveryZones />
      </div>
    </div>
  );
}
