import React, { useState, useMemo, useEffect } from 'react';
import ProductCard from '../components/ProductCard';
import PromoCarousel from '../components/PromoCarousel';
import AdvancedFilterPanel from '../components/AdvancedFilterPanel';
import { PRODUCTS as FALLBACK_PRODUCTS, BRANDS } from '../data/mockData';
import { fetchProductsFromSupabase } from '../services/productsService';
import { supabase } from '../lib/supabase';
import { getHiddenProductIdentifiers, isProductHidden } from '../utils/productVisibility';
import { groupProductsForStore } from '../utils/productVariants';
import SEOHead from '../components/SEOHead';
import { getBreadcrumbSchema, getFAQPageSchema } from '../utils/schemaGenerators';
import LocalDeliveryZones from '../components/LocalDeliveryZones';
import FAQSection, { GATOS_FAQS, GENERAL_FAQS } from '../components/FAQSection';

export default function GatosView({ onSelectProduct, onAddToCart }) {
  const [allProducts, setAllProducts] = useState(FALLBACK_PRODUCTS);
  const [hiddenProducts, setHiddenProducts] = useState(getHiddenProductIdentifiers);

  // Carga en vivo desde Supabase
  useEffect(() => {
    let isMounted = true;
    const loadProducts = async () => {
      const data = await fetchProductsFromSupabase();
      if (isMounted && data && data.length > 0) {
        setAllProducts(data);
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

  // Filter States
  const [selectedBrand, setSelectedBrand] = useState('Todas');
  const [searchQuery, setSearchQuery] = useState('');
  const [proteinFilter, setProteinFilter] = useState('Todos');
  const [weightFilter, setWeightFilter] = useState('Todos');
  const [categoryFilter, setCategoryFilter] = useState('Todos');

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
    <div className="pt-28 pb-20 bg-[#FAF9F6] min-h-screen text-slate-900">
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

      {/* Main Catalog Header */}
      <header className="max-w-7xl mx-auto px-6 mb-6">
        <div className="space-y-1">
          <span className="text-[11px] font-black uppercase tracking-wider text-[#C86D39] bg-[#C86D39]/10 px-3 py-1 rounded-full inline-block">
            Catálogo Felino Holístico
          </span>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
            Alimento y Snacks Naturales para Gatos 🐱
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 max-w-2xl">
            Recetas ricas en taurina y proteína de origen silvestre (salmón, trucha y arenque). Cuidado renal y digestivo con despacho en la Región de Los Lagos.
          </p>
        </div>
      </header>
      
      {/* Promo Carousel Banner (Máximo 5 Ofertas Felinas) */}
      {catProducts.length > 0 && (
        <section className="max-w-7xl mx-auto px-6 mb-10">
          <PromoCarousel
            petType="gatos"
            products={catProducts}
            onSelectProduct={onSelectProduct}
            onAddToCart={onAddToCart}
          />
        </section>
      )}

      {/* Main Catalog Section */}
      <section id="catalogo-section" className="max-w-7xl mx-auto px-6 scroll-mt-24">
        
        {/* Unified Filter Panel (Marca + Proteína + Peso + Tipo + Búsqueda 100%) */}
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
        />

        {/* Products Displayed & Grouped by Brands */}
        {filteredProducts.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center text-slate-500 space-y-3 border border-slate-200">
            <p className="text-lg font-bold text-slate-800">No encontramos productos felinos con los filtros seleccionados</p>
            <p className="text-xs">Prueba cambiando la marca, el porcentaje de proteína o limpiando la búsqueda.</p>
            <button
              onClick={handleResetFilters}
              className="px-6 py-2.5 rounded-full bg-[#C86D39] text-white text-xs font-bold hover:bg-[#D97706] transition-colors shadow-md"
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
                  <div className="flex items-center justify-between pb-3 border-b-2 border-[#C86D39]/20">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{brandMeta ? brandMeta.logo : '🐟'}</span>
                      <div>
                        <h2 className="text-xl md:text-2xl font-black text-slate-900">{brandName}</h2>
                        <p className="text-xs text-slate-500 font-semibold">
                          {brandMeta ? brandMeta.tagline : 'Fórmulas Holísticas Felinas de la Patagonia'}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-[#C86D39]/10 text-[#C86D39]">
                      {items.length} {items.length === 1 ? 'producto' : 'productos'}
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
          type="gatos"
          title="Preguntas Frecuentes sobre Alimento y Salud Felina"
          subtitle="Respuestas veterinarias directas y estructuradas sobre nutrición carnívora estricta, prevención urinaria y despacho en Los Lagos."
        />
      </div>

      {/* Módulo de Cobertura y Despacho Local Los Lagos */}
      <div className="max-w-7xl mx-auto px-6 mt-10">
        <LocalDeliveryZones />
      </div>

    </div>
  );
}
