import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Search, Layers, Dumbbell, Scale, Bone, RefreshCw, X, Sparkles, Check, ChevronDown } from 'lucide-react';
import { BRANDS } from '../data/mockData';

/**
 * Componente individual de Lista Desplegable (Dropdown) para filtros
 */
function FilterDropdown({
  label,
  icon: Icon,
  currentValue,
  options = [],
  onChange,
  isOpen,
  onToggle,
  defaultValues = ['Todos', 'Todas'],
}) {
  const isSelected = !defaultValues.includes(currentValue);
  const selectedOption = options.find((opt) => opt.value === currentValue);
  const displayLabel = isSelected ? (selectedOption?.label || currentValue) : label;

  return (
    <div className="relative inline-block text-left shrink-0">
      <button
        type="button"
        onClick={onToggle}
        className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all border shadow-xs cursor-pointer select-none active:scale-95 ${
          isSelected
            ? 'bg-amber-100 text-[#78350F] border-[#F5BA13] shadow-sm ring-2 ring-[#F5BA13]/25'
            : isOpen
            ? 'bg-slate-100 text-slate-900 border-slate-300'
            : 'bg-white text-slate-700 border-slate-200/90 hover:bg-amber-50/50 hover:border-amber-200'
        }`}
        aria-expanded={isOpen}
      >
        <div
          className={`w-5 h-5 rounded-lg flex items-center justify-center text-xs shrink-0 ${
            isSelected ? 'bg-[#F5BA13] text-[#1D1D1F]' : 'bg-slate-100 text-slate-500'
          }`}
        >
          <Icon className="w-3.5 h-3.5" />
        </div>

        <span className="truncate max-w-[140px] sm:max-w-[180px]">
          {isSelected ? `${label}: ` : ''}
          <strong className={isSelected ? 'text-[#78350F]' : 'text-slate-800'}>
            {displayLabel}
          </strong>
        </span>

        {isSelected && (
          <span
            onClick={(e) => {
              e.stopPropagation();
              onChange(defaultValues[0]);
            }}
            className="w-4 h-4 rounded-full bg-[#F5BA13]/30 hover:bg-[#F5BA13]/50 text-[#78350F] flex items-center justify-center text-[10px] ml-0.5 transition-colors cursor-pointer"
            title="Quitar filtro"
          >
            ×
          </span>
        )}

        <ChevronDown
          className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-slate-700' : ''
          }`}
        />
      </button>

      {/* Floating Dropdown Menu */}
      {isOpen && (
        <div className="absolute left-0 top-full mt-2 min-w-[220px] max-w-[280px] bg-white rounded-2xl shadow-xl border border-slate-200/90 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
          <div className="px-3.5 py-1.5 text-[10px] font-black text-slate-400 uppercase tracking-wider border-b border-slate-100 flex items-center justify-between">
            <span>{label}</span>
            <span>{options.length} opciones</span>
          </div>

          <div className="max-h-64 overflow-y-auto py-1 scrollbar-thin">
            {options.map((opt) => {
              const isActive = opt.value === currentValue;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    onChange(opt.value);
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2 text-xs text-left transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-amber-100 text-[#78350F] font-black'
                      : 'hover:bg-amber-50/50 text-slate-700 font-semibold'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate pr-2">
                    <span className="truncate">{opt.label}</span>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {typeof opt.count === 'number' && (
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                          isActive ? 'bg-[#F5BA13] text-[#1D1D1F]' : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {opt.count}
                      </span>
                    )}
                    {isActive && <Check className="w-3.5 h-3.5 text-[#D97706]" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdvancedFilterPanel({
  searchQuery,
  onSearchChange,
  selectedBrand,
  onBrandChange,
  productCountsByBrand = {},
  proteinFilter,
  onProteinChange,
  weightFilter,
  onWeightChange,
  categoryFilter,
  onCategoryChange,
  onResetFilters,
  totalResultsCount,
  products = [],
  isLoading = false,
  petType = 'perros',
}) {
  const [openDropdown, setOpenDropdown] = useState(null); // 'brand' | 'protein' | 'weight' | 'category' | null
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const containerRef = useRef(null);

  // Cerrar listas desplegables al hacer clic fuera o presionar Escape
  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setOpenDropdown(null);
      }
    }
    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        setOpenDropdown(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const activeFiltersCount =
    (searchQuery ? 1 : 0) +
    (selectedBrand !== 'Todas' ? 1 : 0) +
    (proteinFilter !== 'Todos' ? 1 : 0) +
    (weightFilter !== 'Todos' ? 1 : 0) +
    (categoryFilter !== 'Todos' ? 1 : 0);

  // ==========================================
  // 1. Marcas Reales (Conectadas con Backend)
  // ==========================================
  const brandOptions = useMemo(() => {
    const counts = {};
    if (products && products.length > 0) {
      products.forEach((p) => {
        const b = (p.brand || '').trim();
        if (b) counts[b] = (counts[b] || 0) + 1;
      });
    } else if (Object.keys(productCountsByBrand).length > 0) {
      Object.assign(counts, productCountsByBrand);
    } else {
      BRANDS.forEach((b) => {
        counts[b.name] = 0;
      });
    }

    const items = Object.entries(counts)
      .filter(([name]) => name.trim().length > 0)
      .map(([name, count]) => ({
        value: name,
        label: name,
        count,
      }))
      .sort((a, b) => b.count - a.count);

    const totalCount = products && products.length > 0 ? products.length : Object.values(counts).reduce((a, b) => a + b, 0);

    return [
      { value: 'Todas', label: 'Todas las marcas', count: totalCount },
      ...items,
    ];
  }, [products, productCountsByBrand]);

  // ==========================================
  // 2. Proteínas Reales (Conectadas con Backend)
  // ==========================================
  const proteinOptions = useMemo(() => {
    const sourceCounts = {};
    if (products && products.length > 0) {
      products.forEach((p) => {
        const found = new Set();
        if (p.mainProtein) found.add(p.mainProtein.trim());
        if (Array.isArray(p.variants)) {
          p.variants.forEach((v) => {
            const vText = (v.format || v.name || '').toLowerCase();
            ['Pollo', 'Salmón', 'Cordero', 'Conejo', 'Pato', 'Vacuno', 'Pavo', 'Pescado', 'Trucha'].forEach((prot) => {
              if (vText.includes(prot.toLowerCase())) found.add(prot);
            });
          });
        }
        found.forEach((prot) => {
          if (prot) sourceCounts[prot] = (sourceCounts[prot] || 0) + 1;
        });
      });
    }

    const proteinItems = Object.entries(sourceCounts)
      .map(([name, count]) => ({
        value: name,
        label: name,
        count,
      }))
      .sort((a, b) => b.count - a.count);

    return [
      { value: 'Todos', label: 'Todas las proteínas', count: products.length },
      ...proteinItems,
      { value: 'high', label: 'Alta Proteína (30%-40%)', count: products.filter((p) => (p.proteinValue || 0) >= 30 && (p.proteinValue || 0) <= 40).length || null },
      { value: 'super', label: 'Súper Proteína (>40%)', count: products.filter((p) => (p.proteinValue || 0) > 40).length || null },
    ];
  }, [products]);

  // ==========================================
  // 3. Formatos (Pesos) Reales del Inventario
  // ==========================================
  const weightOptions = useMemo(() => {
    const counts = {};
    if (products && products.length > 0) {
      products.forEach((p) => {
        const foundWeights = new Set();
        if (Array.isArray(p.weights)) {
          p.weights.forEach((w) => foundWeights.add(String(w).trim()));
        }
        if (Array.isArray(p.variants)) {
          p.variants.forEach((v) => {
            if (v.format && (v.format.includes('g') || v.format.includes('kg') || v.format.includes('gr') || v.format.includes('lata'))) {
              foundWeights.add(v.format.trim());
            }
          });
        }
        if (p.format) foundWeights.add(String(p.format).trim());

        foundWeights.forEach((w) => {
          if (w) counts[w] = (counts[w] || 0) + 1;
        });
      });
    }

    const items = Object.entries(counts)
      .map(([weight, count]) => ({
        value: weight,
        label: weight,
        count,
      }))
      .sort((a, b) => {
        const numA = parseFloat(a.value.replace(',', '.')) * (a.value.includes('kg') ? 1000 : 1);
        const numB = parseFloat(b.value.replace(',', '.')) * (b.value.includes('kg') ? 1000 : 1);
        return (numA || 0) - (numB || 0);
      });

    return [
      { value: 'Todos', label: 'Todos los formatos', count: products.length },
      ...items,
    ];
  }, [products]);

  // ==========================================
  // 4. Categorías Reales del Backend
  // ==========================================
  const categoryOptions = useMemo(() => {
    const counts = {};
    if (products && products.length > 0) {
      products.forEach((p) => {
        const c = (p.category || '').trim();
        if (c) counts[c] = (counts[c] || 0) + 1;
      });
    }

    const items = Object.entries(counts)
      .map(([name, count]) => ({
        value: name,
        label: name,
        count,
      }))
      .sort((a, b) => b.count - a.count);

    return [
      { value: 'Todos', label: 'Todos los tipos', count: products.length },
      ...items,
    ];
  }, [products]);

  return (
    <div
      ref={containerRef}
      className="bg-white/90 backdrop-blur-xl rounded-2xl md:rounded-full px-4 sm:px-6 py-3 sm:py-3.5 shadow-sm border border-slate-200/80 mb-8 select-none overflow-visible transition-all"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Left Side: Clean Category Identifier & Live Recipe Count */}
        <div className="flex items-center justify-between md:justify-start gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-sm shrink-0">
              {petType === 'gatos' ? '🐱' : '🐶'}
            </div>
            <div>
              <div className="font-heading font-black text-sm text-slate-900 tracking-tight leading-none">
                {petType === 'gatos' ? 'Nutrición para Gatos' : 'Nutrición para Perros'}
              </div>
              <div className="text-[11px] font-semibold text-slate-500 mt-0.5">
                {isLoading ? (
                  <span className="text-[#D97706] flex items-center gap-1.5">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#F5BA13] opacity-75" />
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#D97706]" />
                    </span>
                    Sincronizando recetas...
                  </span>
                ) : (
                  <span>
                    {totalResultsCount} {totalResultsCount === 1 ? 'receta disponible' : 'recetas disponibles'}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Mobile Filter Button */}
          <div className="md:hidden flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsMobileDrawerOpen(true)}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 text-white font-extrabold text-xs shadow-xs active:scale-95 cursor-pointer"
            >
              <Layers className="w-3.5 h-3.5 text-[#F5BA13]" />
              <span>Filtros</span>
              {activeFiltersCount > 0 && (
                <span className="px-1.5 py-0.5 rounded-full bg-[#F5BA13] text-[#1D1D1F] font-black text-[10px]">
                  {activeFiltersCount}
                </span>
              )}
            </button>

            {activeFiltersCount > 0 && (
              <button
                type="button"
                onClick={onResetFilters}
                className="p-2 rounded-xl bg-red-50 text-red-600 border border-red-100 active:scale-95 cursor-pointer"
                title="Limpiar filtros"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Desktop Filter Dropdowns Row */}
        <div className="hidden md:flex items-center gap-2 flex-wrap justify-end">
          {/* DROPDOWN 1: MARCA */}
          <FilterDropdown
            id="brand"
            label="Marca"
            icon={Layers}
            currentValue={selectedBrand}
            options={brandOptions}
            onChange={(val) => {
              onBrandChange(val);
              setOpenDropdown(null);
            }}
            isOpen={openDropdown === 'brand'}
            onToggle={() => setOpenDropdown((prev) => (prev === 'brand' ? null : 'brand'))}
            defaultValues={['Todas']}
          />

          {/* DROPDOWN 2: PROTEÍNA */}
          <FilterDropdown
            id="protein"
            label="Proteína"
            icon={Dumbbell}
            currentValue={proteinFilter}
            options={proteinOptions}
            onChange={(val) => {
              onProteinChange(val);
              setOpenDropdown(null);
            }}
            isOpen={openDropdown === 'protein'}
            onToggle={() => setOpenDropdown((prev) => (prev === 'protein' ? null : 'protein'))}
            defaultValues={['Todos']}
          />

          {/* DROPDOWN 3: FORMATO (PESO) */}
          <FilterDropdown
            id="weight"
            label="Formato"
            icon={Scale}
            currentValue={weightFilter}
            options={weightOptions}
            onChange={(val) => {
              onWeightChange(val);
              setOpenDropdown(null);
            }}
            isOpen={openDropdown === 'weight'}
            onToggle={() => setOpenDropdown((prev) => (prev === 'weight' ? null : 'weight'))}
            defaultValues={['Todos']}
          />

          {/* DROPDOWN 4: TIPO DE ALIMENTO */}
          <FilterDropdown
            id="category"
            label="Tipo de Alimento"
            icon={Bone}
            currentValue={categoryFilter}
            options={categoryOptions}
            onChange={(val) => {
              onCategoryChange(val);
              setOpenDropdown(null);
            }}
            isOpen={openDropdown === 'category'}
            onToggle={() => setOpenDropdown((prev) => (prev === 'category' ? null : 'category'))}
            defaultValues={['Todos']}
          />

          {/* Reset Filters Button (When active) */}
          {activeFiltersCount > 0 && (
            <button
              onClick={onResetFilters}
              className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-red-50 text-red-600 hover:bg-red-100 font-extrabold text-xs transition-all border border-red-100 active:scale-95 shadow-xs cursor-pointer ml-1"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Limpiar ({activeFiltersCount})</span>
            </button>
          )}
        </div>
      </div>

      {/* 5. Mobile Bottom Sheet Filter Drawer */}
      {isMobileDrawerOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex items-end justify-center bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="w-full bg-white rounded-t-3xl shadow-2xl border border-slate-100 max-h-[85dvh] flex flex-col pb-safe animate-in slide-in-from-bottom duration-300">
            {/* Drawer Header */}
            <div className="pt-3 pb-2 px-6 border-b border-slate-100">
              <div className="w-12 h-1.5 bg-slate-300 rounded-full mx-auto mb-3" />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Layers className="w-5 h-5 text-[#D97706]" />
                  <h3 className="text-base font-black text-slate-900">Filtros Desplegables</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsMobileDrawerOpen(false)}
                  className="p-2 rounded-full text-slate-400 hover:bg-slate-100 cursor-pointer"
                  aria-label="Cerrar filtros"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Scrollable Filters Body */}
            <div className="p-6 space-y-6 overflow-y-auto flex-1">
              {/* Section 1: Marca */}
              <div className="space-y-2.5">
                <label className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-[#D97706]" />
                  <span>Marca</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {brandOptions.map((b) => (
                    <button
                      key={b.value}
                      type="button"
                      onClick={() => onBrandChange(b.value)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all border cursor-pointer active:scale-95 flex items-center gap-1.5 ${
                        selectedBrand === b.value
                          ? 'bg-[#1D1D1F] text-[#F5BA13] border-[#1D1D1F] shadow-sm font-black'
                          : 'bg-slate-50 text-slate-700 border-slate-200'
                      }`}
                    >
                      <span>{b.label}</span>
                      {typeof b.count === 'number' && (
                        <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                          selectedBrand === b.value ? 'bg-white/20 text-[#F5BA13]' : 'bg-slate-200/70 text-slate-600'
                        }`}>
                          {b.count}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Section 2: Proteína */}
              <div className="space-y-2.5">
                <label className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Dumbbell className="w-4 h-4 text-[#D97706]" />
                  <span>Proteína</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {proteinOptions.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => onProteinChange(opt.value)}
                      className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all border cursor-pointer active:scale-95 ${
                        proteinFilter === opt.value
                          ? 'bg-[#1D1D1F] text-[#F5BA13] border-[#1D1D1F] shadow-sm font-black'
                          : 'bg-slate-50 text-slate-700 border-slate-200'
                      }`}
                    >
                      <span>{opt.label}</span>
                      {typeof opt.count === 'number' && (
                        <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                          proteinFilter === opt.value ? 'bg-white/20 text-[#F5BA13]' : 'bg-slate-200/70 text-slate-600'
                        }`}>
                          {opt.count}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Section 3: Formato / Peso */}
              <div className="space-y-2.5">
                <label className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Scale className="w-4 h-4 text-[#D97706]" />
                  <span>Formato (Peso)</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {weightOptions.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => onWeightChange(opt.value)}
                      className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all border cursor-pointer active:scale-95 ${
                        weightFilter === opt.value
                          ? 'bg-[#1D1D1F] text-[#F5BA13] border-[#1D1D1F] shadow-sm font-black'
                          : 'bg-slate-50 text-slate-700 border-slate-200'
                      }`}
                    >
                      <span>{opt.label}</span>
                      {typeof opt.count === 'number' && (
                        <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                          weightFilter === opt.value ? 'bg-white/20 text-[#F5BA13]' : 'bg-slate-200/70 text-slate-600'
                        }`}>
                          {opt.count}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Section 4: Tipo de Alimento */}
              <div className="space-y-2.5">
                <label className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Bone className="w-4 h-4 text-[#D97706]" />
                  <span>Tipo de Alimento</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {categoryOptions.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => onCategoryChange(opt.value)}
                      className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all border cursor-pointer active:scale-95 ${
                        categoryFilter === opt.value
                          ? 'bg-[#1D1D1F] text-[#F5BA13] border-[#1D1D1F] shadow-sm font-black'
                          : 'bg-slate-50 text-slate-700 border-slate-200'
                      }`}
                    >
                      <span>{opt.label}</span>
                      {typeof opt.count === 'number' && (
                        <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                          categoryFilter === opt.value ? 'bg-white/20 text-[#F5BA13]' : 'bg-slate-200/70 text-slate-600'
                        }`}>
                          {opt.count}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Sticky Drawer Footer */}
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center gap-3">
              {activeFiltersCount > 0 && (
                <button
                  type="button"
                  onClick={onResetFilters}
                  className="py-3 px-4 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Limpiar
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsMobileDrawerOpen(false)}
                className="flex-1 py-3.5 px-6 rounded-2xl bg-[#F5BA13] text-[#1D1D1F] font-black text-xs shadow-lg shadow-[#F5BA13]/25 cursor-pointer active:scale-95"
              >
                Ver {totalResultsCount} {totalResultsCount === 1 ? 'Producto' : 'Productos'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
