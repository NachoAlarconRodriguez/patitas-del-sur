import React from 'react';
import { X, Search } from 'lucide-react';
import HabitualProductCard from './HabitualProductCard';
import { formatCLP } from '../../utils/formatters';

const HABITUAL_CATEGORY_CHIPS = [
  { id: 'todos', label: 'Todos los productos' },
  { id: 'perro', label: '🐶 Perros' },
  { id: 'gato', label: '🐱 Gatos' },
  { id: 'alimento', label: '🥣 Alimento' },
  { id: 'snacks', label: '🥩 Snacks' },
];

/**
 * Modal para buscar y agregar productos a la Despensa Habitual del cliente
 */
export default function AddHabitualProductModal({
  isOpen,
  searchQuery,
  onSearchChange,
  categoryFilter,
  onCategoryChange,
  filteredProducts = [],
  frequencyDays,
  onAddProduct,
  onClose,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-br from-[#1D1D1F] via-[#2A1D0E] to-[#120D06] border-b border-amber-500/20 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-xl shadow-inner border border-white/20">
              🥫
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-black text-white tracking-tight">
                Agregar a tu Despensa Habitual
              </h3>
              <p className="text-[11px] text-amber-200/90 font-medium">
                Elige los sacos de alimento o snacks que compras mes a mes
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
            title="Cerrar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Filtros y Buscador */}
        <div className="p-3 sm:p-4 border-b border-slate-100 bg-slate-50/70 space-y-3 shrink-0">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por nombre o marca (ej. Acana, Bravery, Hills)..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-9 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-amber-400 shadow-2xs"
              autoFocus
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => onSearchChange('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-[11px] font-bold">
            {HABITUAL_CATEGORY_CHIPS.map((chip) => (
              <button
                key={chip.id}
                type="button"
                onClick={() => onCategoryChange(chip.id)}
                className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-all cursor-pointer ${
                  categoryFilter === chip.id
                    ? 'bg-[#1D1D1F] text-[#F5BA13] shadow-2xs font-black'
                    : 'bg-white hover:bg-amber-50/50 text-slate-600 border border-slate-200'
                }`}
              >
                {chip.label}
              </button>
            ))}
          </div>
        </div>

        {/* Listado de Productos */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-2.5">
          {filteredProducts.length === 0 ? (
            <div className="py-12 text-center space-y-2">
              <div className="text-3xl">🔍</div>
              <p className="text-xs font-black text-slate-700">
                No encontramos productos con ese filtro o búsqueda
              </p>
              <p className="text-[11px] text-slate-400">
                Intenta buscar con otra palabra clave o quita los filtros.
              </p>
            </div>
          ) : (
            filteredProducts.slice(0, 40).map((prod) => (
              <HabitualProductCard
                key={prod.id || prod.name}
                product={prod}
                onAdd={(weight, qty) => onAddProduct(prod, weight, qty)}
                formatCLP={formatCLP}
              />
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-3 sm:p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between gap-3 shrink-0">
          <p className="text-[11px] text-slate-500 font-medium hidden sm:block">
            💡 Los productos agregados se guardarán para reposición cada {frequencyDays} días.
          </p>
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold transition-all cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
