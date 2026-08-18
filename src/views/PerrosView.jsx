import React, { useState, useMemo } from 'react';
import ProductCard from '../components/ProductCard';
import PromoCarousel from '../components/PromoCarousel';
import AdvancedFilterPanel from '../components/AdvancedFilterPanel';
import { PRODUCTS, BRANDS } from '../data/mockData';

export default function PerrosView({ onSelectProduct, onAddToCart }) {
  const dogProducts = useMemo(() => PRODUCTS.filter((p) => p.petType === 'perros'), []);

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

      // 3. Protein % Filter
      if (proteinFilter !== 'Todos') {
        const prot = product.proteinValue || 0;
        if (proteinFilter === 'high' && (prot < 30 || prot > 40)) return false;
        if (proteinFilter === 'super' && prot <= 40) return false;
        if (proteinFilter === 'moderate' && prot >= 30) return false;
      }

      // 4. Weight / Format Filter
      if (weightFilter !== 'Todos') {
        const weights = product.weights || [];
        if (weightFilter === 'snacks') {
          const isSnackWeight = weights.some((w) => w.includes('g') && !w.includes('kg'));
          if (!isSnackWeight) return false;
        } else if (weightFilter === 'standard') {
          const isStandardWeight = weights.some((w) => w.includes('2 kg') || w.includes('3 kg') || w.includes('1.5 kg'));
          if (!isStandardWeight) return false;
        } else if (weightFilter === 'bulk') {
          const isBulkWeight = weights.some((w) => w.includes('5 kg') || w.includes('12 kg') || w.includes('15 kg'));
          if (!isBulkWeight) return false;
        }
      }

      // 5. Category / Snack filter
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
    <div className="pt-28 pb-20 bg-[#FAF9F6] min-h-screen text-slate-900">
      
      {/* Promo Carousel Banner (Máximo 5 Ofertas) */}
      <section className="max-w-7xl mx-auto px-6 mb-10">
        <PromoCarousel
          petType="perros"
          onSelectProduct={onSelectProduct}
          onAddToCart={onAddToCart}
        />
      </section>

      {/* Main Catalog Section */}
      <section className="max-w-7xl mx-auto px-6">
        
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
        />

        {/* Products Displayed & Grouped by Brands */}
        {filteredProducts.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center text-slate-500 space-y-3 border border-slate-200">
            <p className="text-lg font-bold text-slate-800">No encontramos productos con los filtros seleccionados</p>
            <p className="text-xs">Prueba cambiando la marca, el porcentaje de proteína o limpiando la búsqueda.</p>
            <button
              onClick={handleResetFilters}
              className="px-6 py-2.5 rounded-full bg-[#0E8388] text-white text-xs font-bold hover:bg-[#10B981] transition-colors shadow-md"
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
                  <div className="flex items-center justify-between pb-3 border-b-2 border-[#0E8388]/20">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{brandMeta ? brandMeta.logo : '🏔️'}</span>
                      <div>
                        <h2 className="text-xl md:text-2xl font-black text-slate-900">{brandName}</h2>
                        <p className="text-xs text-slate-500 font-semibold">
                          {brandMeta ? brandMeta.tagline : 'Nutrición Natural de la Patagonia'}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-[#0E8388]/10 text-[#0E8388]">
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

    </div>
  );
}
