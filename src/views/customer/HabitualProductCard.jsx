import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { getDefaultAvailableVariantIndex } from '../../utils/productVariants';

/**
 * Card de Selección de Producto para la Despensa Habitual
 */
export default function HabitualProductCard({ product, onAdd, formatCLP }) {
  const weights =
    Array.isArray(product.weights) && product.weights.length > 0
      ? product.weights
      : [product.weight || product.format || 'Formato Estándar'];

  const [selectedWeight, setSelectedWeight] = useState(() => {
    const list = product?.variants || [];
    if (list.length > 0) {
      const defaultVariant = list[getDefaultAvailableVariantIndex(list)];
      if (defaultVariant?.format || defaultVariant?.weight) {
        return defaultVariant.format || defaultVariant.weight;
      }
    }
    return weights[0];
  });
  const [quantity, setQuantity] = useState(1);

  // Resolver precio según variante
  const variant = (product.variants || []).find(
    (v) => v.format === selectedWeight || v.weight === selectedWeight
  );
  const currentPrice = variant && typeof variant.price === 'number' ? variant.price : product.price || 0;

  return (
    <div className="p-3.5 sm:p-4 rounded-2xl bg-white border border-slate-200 hover:border-[#F5BA13]/60 transition-all flex flex-col sm:flex-row items-center sm:items-start justify-between gap-3 shadow-2xs hover:shadow-xs">
      <div className="flex items-center gap-3 w-full sm:w-auto min-w-0">
        <div className="w-14 h-14 rounded-xl bg-slate-50 border border-slate-100 p-1 shrink-0 flex items-center justify-center">
          <img
            src={product.image || '/images/hero_dog.png'}
            alt={product.name}
            className="w-full h-full object-contain"
          />
        </div>
        <div className="min-w-0 flex-1">
          {product.brand && (
            <span className="block text-[9.5px] font-black uppercase text-slate-400">
              {product.brand}
            </span>
          )}
          <h4 className="text-xs sm:text-sm font-black text-slate-900 truncate" title={product.name}>
            {product.name}
          </h4>
          <span className="text-xs font-black text-slate-900 block mt-0.5">
            {formatCLP(currentPrice)}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2.5 w-full sm:w-auto justify-between sm:justify-end shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
        {/* Selector de Formato si tiene más de 1 peso */}
        {weights.length > 1 ? (
          <select
            value={selectedWeight}
            onChange={(e) => setSelectedWeight(e.target.value)}
            className="text-[11px] font-bold bg-slate-50 border border-slate-200 rounded-xl px-2 py-1.5 text-slate-700 focus:outline-hidden focus:border-[#F5BA13] cursor-pointer"
          >
            {weights.map((w) => (
              <option key={w} value={w}>
                {w}
              </option>
            ))}
          </select>
        ) : (
          <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded-lg">
            {selectedWeight}
          </span>
        )}

        {/* Stepper de Cantidad */}
        <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-xl p-0.5 shadow-2xs">
          <button
            type="button"
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            className="w-6 h-6 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-200 font-black text-xs cursor-pointer active:scale-95"
            title="Disminuir cantidad"
          >
            -
          </button>
          <span className="text-xs font-black text-slate-900 min-w-[18px] text-center">
            {quantity}
          </span>
          <button
            type="button"
            onClick={() => setQuantity(quantity + 1)}
            className="w-6 h-6 rounded-lg flex items-center justify-center text-amber-800 hover:bg-amber-100/70 font-black text-xs cursor-pointer active:scale-95"
            title="Aumentar cantidad"
          >
            +
          </button>
        </div>

        {/* Botón Agregar */}
        <button
          type="button"
          onClick={() => onAdd(selectedWeight, quantity)}
          className="px-3.5 py-2 rounded-xl bg-[#F5BA13] hover:bg-[#e2aa10] text-[#1D1D1F] text-xs font-black shadow-xs transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 shrink-0"
        >
          <Plus className="w-3.5 h-3.5 stroke-[3]" />
          <span>Agregar</span>
        </button>
      </div>
    </div>
  );
}
