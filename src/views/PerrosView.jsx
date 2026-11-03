import React, { useState, useMemo, useEffect } from 'react';
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
import FAQSection, { PERROS_FAQS, GENERAL_FAQS } from '../components/FAQSection';
import DogLoadingSpinner from '../components/DogLoadingSpinner';

export default function PerrosView({ onSelectProduct, onAddToCart }) {
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
        console.error('Error al cargar productos de perros:', err);
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
      .channel('products-realtime-perros')
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

  const dogProducts = useMemo(
    () => {
      const filtered = allProducts.filter(
        (p) =>
          p.petType === 'perros' &&
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

  // Filter States
  const [selectedBrand, setSelectedBrand] = useState('Todas');
  const [searchQuery, setSearchQuery] = useState('');
  const [proteinFilter, setProteinFilter] = useState('Todos');
  const [weightFilter, setWeightFilter] = useState('Todos');
  const [categoryFilter, setCategoryFilter] = useState('Todos');

  // Count per brand
  const productCountsByBrand = useMemo(() => {
    const counts = {};
    dogProducts.forEach((p) => {
      if (p.brand) {
        counts[p.brand] = (counts[p.brand] || 0) + 1;
      }
    });
    return counts;
  }, [dogProducts]);

  // Master Filter logic
  const filteredProducts = useMemo(() => {
    return dogProducts.filter((product) => {
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
          // Check if proteinFilter is a source (e.g. Pollo, Salmón, Cordero, Conejo, Pato, Vacuno)
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
          if (weightFilter === 'snacks' && weights.some((w) => w.includes('g') && !w.includes('kg'))) return true;
          if (weightFilter === 'standard' && weights.some((w) => w.includes('2 kg') || w.includes('3 kg') || w.includes('1.5 kg'))) return true;
          if (weightFilter === 'bulk' && weights.some((w) => w.includes('5 kg') || w.includes('10 kg') || w.includes('11') || w.includes('12 kg') || w.includes('15 kg') || w.includes('20 kg'))) return true;
          return false;
        }
      }

      // 5. Category / Tipo de Alimento filter
      if (categoryFilter !== 'Todos' && product.category !== categoryFilter) {
        return false;
      }

      return true;
    });
  }, [dogProducts, selectedBrand, searchQuery, proteinFilter, weightFilter, categoryFilter]);

  // Group products by brand when "Todas las Marcas" is selected
  const groupedProducts = useMemo(() => {
    const groups = {};
    filteredProducts.forEach((p) => {
      const b = p.brand || 'Otras Recetas Patagónicas';
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
    <div className="pt-24 sm:pt-28 pb-20 bg-[#FAF9F6] min-h-screen text-slate-900">
      <SEOHead
        title="Alimento y Snacks Naturales para Perros en Puerto Varas"
        description="Catálogo de alimento super premium 100% Grain Free, antiparasitarios y premios deshidratados para perros. Despacho express en Puerto Varas, Llanquihue y Frutillar."
        canonical="/perros"
        keywords="alimento perros puerto varas, comida perros llanquihue, bravery perros los lagos, grain free perros chile"
        jsonLd={[
          getBreadcrumbSchema([
            { name: 'Inicio', url: '/' },
            { name: 'Perros', url: '/perros' },
          ]),
          getFAQPageSchema([...PERROS_FAQS, ...GENERAL_FAQS.slice(0, 2)]),
        ]}
      />

      <h1 className="sr-only">
        Alimento y Nutrición Super Premium para Perros en Puerto Varas, Llanquihue y Frutillar
      </h1>

      {/* Main Catalog Section */}
      <section id="catalogo-section" className="max-w-7xl mx-auto px-4 sm:px-6 scroll-mt-24">
        
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
          products={dogProducts}
          isLoading={isLoading}
          petType="perros"
        />

        {/* Products Displayed & Grouped by Brands */}
        {isLoading ? (
          <DogLoadingSpinner showSkeletons={true} />
        ) : filteredProducts.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center text-slate-500 space-y-3 border border-slate-200">
            <p className="text-lg font-bold text-slate-800">No encontramos productos con los filtros seleccionados</p>
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
                <div key={brandName} className="space-y-4">
                  {/* Brand Group Header */}
                  <div className="flex items-center justify-between pb-3 border-b border-slate-200/90">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-xl shrink-0">
                        {brandMeta ? brandMeta.logo : '🐶'}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h2 className="text-lg md:text-xl font-black text-slate-900 tracking-tight">{brandName}</h2>
                          {brandMeta?.badge && (
                            <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-900 border border-amber-200/80 text-[10px] font-bold">
                              {brandMeta.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 font-medium">
                          {brandMeta ? brandMeta.tagline : 'Nutrición Natural de la Patagonia'}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs font-black px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/25 text-[#92400E]">
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

      {/* Sección de Preguntas Frecuentes y Guía Nutricional AEO */}
      <div className="max-w-7xl mx-auto px-6 mt-16">
        <FAQSection
          type="perros"
          title="Preguntas Frecuentes sobre Alimento y Salud Canina"
          subtitle="Respuestas veterinarias directas y estructuradas sobre nutrición sin granos, snacks naturales y despacho en Puerto Varas."
        />
      </div>

      {/* Módulo de Cobertura y Despacho Local Los Lagos */}
      <div className="max-w-7xl mx-auto px-6 mt-10">
        <LocalDeliveryZones />
      </div>

    </div>
  );
}
