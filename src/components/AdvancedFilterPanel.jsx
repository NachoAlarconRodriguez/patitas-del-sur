import React, { useState } from 'react';
import { Search, Layers, Dumbbell, Scale, Bone, RefreshCw, X, Sparkles, Check } from 'lucide-react';
import { BRANDS } from '../data/mockData';

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
}) {
  const [hoveredCircle, setHoveredCircle] = useState(null);

  const activeFiltersCount =
    (searchQuery ? 1 : 0) +
    (selectedBrand !== 'Todas' ? 1 : 0) +
    (proteinFilter !== 'Todos' ? 1 : 0) +
    (weightFilter !== 'Todos' ? 1 : 0) +
    (categoryFilter !== 'Todos' ? 1 : 0);

  const proteinChips = [
    { label: 'Todas', value: 'Todos', emoji: '✨' },
    { label: 'Alta (30%-40%)', value: 'high', emoji: '💪' },
    { label: 'Súper (>70%)', value: 'super', emoji: '⚡' },
    { label: 'Moderada (<30%)', value: 'moderate', emoji: '🌱' },
  ];

  const weightChips = [
    { label: 'Todos', value: 'Todos', emoji: '✨' },
    { label: 'Snacks (100-250g)', value: 'snacks', emoji: '🍖' },
    { label: 'Bolsas (1.5-3.5kg)', value: 'standard', emoji: '📦' },
    { label: 'Granel (5-15kg)', value: 'bulk', emoji: '🏔️' },
  ];

  const categoryChips = [
    { label: 'Todos', value: 'Todos', emoji: '✨' },
    { label: 'Alimento Seco', value: 'Alimento Seco', emoji: '🥣' },
    { label: 'Snacks Naturales', value: 'Snacks Naturales', emoji: '🍖' },
    { label: 'Alimento Húmedo', value: 'Alimento Húmedo', emoji: 'os' },
    { label: 'Suplementos', value: 'Suplementos', emoji: '🧪' },
  ];

  const getActiveProteinLabel = () => {
    const found = proteinChips.find((c) => c.value === proteinFilter);
    return found ? found.label : 'Proteína';
  };

  const getActiveWeightLabel = () => {
    const found = weightChips.find((c) => c.value === weightFilter);
    return found ? found.label : 'Formato';
  };

  const getActiveCategoryLabel = () => {
    const found = categoryChips.find((c) => c.value === categoryFilter);
    return found ? found.label : 'Tipo de Alimento';
  };

  return (
    <div className="bg-white rounded-3xl p-5 md:p-6 shadow-sm border border-slate-200/80 mb-8 space-y-5 select-none overflow-visible">
      
      {/* 1. Full-Width Search Input Bar */}
      <div className="w-full">
        <div className="relative w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#0E8388]" />
          <input
            type="text"
            placeholder="Buscar por palabra clave (ej. salmón, maqui, cordero, glucosamina...)"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-12 pr-12 py-3.5 rounded-2xl bg-slate-50 border border-slate-200/90 text-sm font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#0E8388] focus:bg-white focus:ring-2 focus:ring-[#0E8388]/10 transition-all shadow-xs"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-slate-700 transition-colors"
              title="Borrar búsqueda"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* 2. Counter & Reset Active Filters Header */}
      <div className="flex items-center justify-between pt-1 pb-3 border-b border-slate-100 flex-wrap gap-2 text-xs">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#10B981]" />
          <span className="font-black text-slate-800 uppercase tracking-wider text-xs">
            {totalResultsCount} {totalResultsCount === 1 ? 'producto disponible' : 'productos disponibles'}
          </span>
        </div>

        {activeFiltersCount > 0 && (
          <button
            onClick={onResetFilters}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 font-extrabold transition-all border border-red-100 active:scale-95 shadow-xs"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Limpiar Filtros ({activeFiltersCount})</span>
          </button>
        )}
      </div>

      {/* 3. Horizontal Expanding Inline Filter Row (Empuje Lateral Dinámico) */}
      <div className="flex items-center gap-3 overflow-x-auto pb-2 pt-1 transition-all duration-500 ease-out scrollbar-none">
        
        {/* CIRCLE 1: MARCA (Horizontal Inline Expansion) */}
        <div
          onMouseEnter={() => setHoveredCircle('brand')}
          onMouseLeave={() => setHoveredCircle(null)}
          className="shrink-0 transition-all duration-500 ease-out"
        >
          {hoveredCircle === 'brand' ? (
            /* Expanded Sideways Pills Row */
            <div className="flex items-center gap-1.5 p-1.5 rounded-full bg-[#0A3E40]/10 border border-[#0A3E40]/30 shadow-md animate-in fade-in slide-in-from-left-2 duration-300">
              <span className="text-xs font-black text-[#0A3E40] uppercase tracking-wider px-3 flex items-center gap-1">
                <Layers className="w-3.5 h-3.5 text-[#0A3E40]" /> Marca:
              </span>

              {/* All Brands Pill */}
              <button
                onClick={() => onBrandChange('Todas')}
                className={`px-3 py-1.5 rounded-full text-xs font-extrabold transition-all shrink-0 ${
                  selectedBrand === 'Todas'
                    ? 'bg-[#0A3E40] text-white shadow-sm scale-105'
                    : 'bg-white text-slate-700 hover:bg-slate-100'
                }`}
              >
                Todas
              </button>

              {/* Brands Inline List */}
              {BRANDS.map((b) => {
                const count = productCountsByBrand[b.name] || 0;
                const isSelected = selectedBrand === b.name;
                return (
                  <button
                    key={b.id}
                    onClick={() => onBrandChange(b.name)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-extrabold transition-all shrink-0 ${
                      isSelected
                        ? 'bg-[#0A3E40] text-white shadow-sm scale-105'
                        : 'bg-white text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <span>{b.logo}</span>
                    <span>{b.name}</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'}`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          ) : (
            /* Compact Round Pill */
            <button
              onClick={() => setHoveredCircle('brand')}
              className={`flex items-center gap-2.5 px-5 py-2.5 rounded-full text-xs font-extrabold transition-all duration-300 border shadow-xs ${
                selectedBrand !== 'Todas'
                  ? 'bg-[#0A3E40] text-white border-[#0A3E40] shadow-md shadow-[#0A3E40]/20 scale-105'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-xs shrink-0">
                <Layers className="w-3.5 h-3.5 text-[#10B981]" />
              </div>
              <span>{selectedBrand !== 'Todas' ? selectedBrand : 'Marca'}</span>
              {selectedBrand !== 'Todas' && <Check className="w-3.5 h-3.5 text-[#10B981]" />}
            </button>
          )}
        </div>

        {/* CIRCLE 2: PROTEÍNA (Horizontal Inline Expansion) */}
        <div
          onMouseEnter={() => setHoveredCircle('protein')}
          onMouseLeave={() => setHoveredCircle(null)}
          className="shrink-0 transition-all duration-500 ease-out"
        >
          {hoveredCircle === 'protein' ? (
            /* Expanded Sideways Pills Row */
            <div className="flex items-center gap-1.5 p-1.5 rounded-full bg-[#10B981]/15 border border-[#10B981]/40 shadow-md animate-in fade-in slide-in-from-left-2 duration-300">
              <span className="text-xs font-black text-slate-900 uppercase tracking-wider px-3 flex items-center gap-1">
                <Dumbbell className="w-3.5 h-3.5 text-[#10B981]" /> Proteína:
              </span>

              {proteinChips.map((chip) => {
                const isSelected = proteinFilter === chip.value;
                return (
                  <button
                    key={chip.value}
                    onClick={() => onProteinChange(chip.value)}
                    className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-extrabold transition-all shrink-0 ${
                      isSelected
                        ? 'bg-[#10B981] text-slate-950 shadow-sm scale-105'
                        : 'bg-white text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <span>{chip.emoji}</span>
                    <span>{chip.label}</span>
                  </button>
                );
              })}
            </div>
          ) : (
            /* Compact Round Pill */
            <button
              onClick={() => setHoveredCircle('protein')}
              className={`flex items-center gap-2.5 px-5 py-2.5 rounded-full text-xs font-extrabold transition-all duration-300 border shadow-xs ${
                proteinFilter !== 'Todos'
                  ? 'bg-[#10B981] text-slate-950 border-[#10B981] shadow-md shadow-[#10B981]/20 scale-105'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-xs shrink-0">
                <Dumbbell className="w-3.5 h-3.5" />
              </div>
              <span>{proteinFilter !== 'Todos' ? getActiveProteinLabel() : 'Proteína'}</span>
              {proteinFilter !== 'Todos' && <Check className="w-3.5 h-3.5" />}
            </button>
          )}
        </div>

        {/* CIRCLE 3: FORMATO (PESO) (Horizontal Inline Expansion) */}
        <div
          onMouseEnter={() => setHoveredCircle('weight')}
          onMouseLeave={() => setHoveredCircle(null)}
          className="shrink-0 transition-all duration-500 ease-out"
        >
          {hoveredCircle === 'weight' ? (
            /* Expanded Sideways Pills Row */
            <div className="flex items-center gap-1.5 p-1.5 rounded-full bg-[#0E8388]/15 border border-[#0E8388]/40 shadow-md animate-in fade-in slide-in-from-left-2 duration-300">
              <span className="text-xs font-black text-[#0E8388] uppercase tracking-wider px-3 flex items-center gap-1">
                <Scale className="w-3.5 h-3.5 text-[#0E8388]" /> Formato:
              </span>

              {weightChips.map((chip) => {
                const isSelected = weightFilter === chip.value;
                return (
                  <button
                    key={chip.value}
                    onClick={() => onWeightChange(chip.value)}
                    className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-extrabold transition-all shrink-0 ${
                      isSelected
                        ? 'bg-[#0E8388] text-white shadow-sm scale-105'
                        : 'bg-white text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <span>{chip.emoji}</span>
                    <span>{chip.label}</span>
                  </button>
                );
              })}
            </div>
          ) : (
            /* Compact Round Pill */
            <button
              onClick={() => setHoveredCircle('weight')}
              className={`flex items-center gap-2.5 px-5 py-2.5 rounded-full text-xs font-extrabold transition-all duration-300 border shadow-xs ${
                weightFilter !== 'Todos'
                  ? 'bg-[#0E8388] text-white border-[#0E8388] shadow-md shadow-[#0E8388]/20 scale-105'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-xs shrink-0">
                <Scale className="w-3.5 h-3.5" />
              </div>
              <span>{weightFilter !== 'Todos' ? getActiveWeightLabel() : 'Formato (Peso)'}</span>
              {weightFilter !== 'Todos' && <Check className="w-3.5 h-3.5" />}
            </button>
          )}
        </div>

        {/* CIRCLE 4: TIPO DE ALIMENTO (Horizontal Inline Expansion) */}
        <div
          onMouseEnter={() => setHoveredCircle('category')}
          onMouseLeave={() => setHoveredCircle(null)}
          className="shrink-0 transition-all duration-500 ease-out"
        >
          {hoveredCircle === 'category' ? (
            /* Expanded Sideways Pills Row */
            <div className="flex items-center gap-1.5 p-1.5 rounded-full bg-[#C86D39]/15 border border-[#C86D39]/40 shadow-md animate-in fade-in slide-in-from-left-2 duration-300">
              <span className="text-xs font-black text-[#C86D39] uppercase tracking-wider px-3 flex items-center gap-1">
                <Bone className="w-3.5 h-3.5 text-[#C86D39]" /> Tipo:
              </span>

              {categoryChips.map((chip) => {
                const isSelected = categoryFilter === chip.value;
                return (
                  <button
                    key={chip.value}
                    onClick={() => onCategoryChange(chip.value)}
                    className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-extrabold transition-all shrink-0 ${
                      isSelected
                        ? 'bg-[#C86D39] text-white shadow-sm scale-105'
                        : 'bg-white text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <span>{chip.emoji}</span>
                    <span>{chip.label}</span>
                  </button>
                );
              })}
            </div>
          ) : (
            /* Compact Round Pill */
            <button
              onClick={() => setHoveredCircle('category')}
              className={`flex items-center gap-2.5 px-5 py-2.5 rounded-full text-xs font-extrabold transition-all duration-300 border shadow-xs ${
                categoryFilter !== 'Todos'
                  ? 'bg-[#C86D39] text-white border-[#C86D39] shadow-md shadow-[#C86D39]/20 scale-105'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-xs shrink-0">
                <Bone className="w-3.5 h-3.5" />
              </div>
              <span>{categoryFilter !== 'Todos' ? getActiveCategoryLabel() : 'Tipo de Alimento'}</span>
              {categoryFilter !== 'Todos' && <Check className="w-3.5 h-3.5" />}
            </button>
          )}
        </div>

      </div>

    </div>
  );
}
