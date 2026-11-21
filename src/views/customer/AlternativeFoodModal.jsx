import React from 'react';
import { X, Sparkles, ShoppingBag, ArrowRight } from 'lucide-react';
import { isProductOutOfStock } from '../../utils/productVariants';
import { formatCLP } from '../../utils/formatters';

/**
 * Modal de Otras Opciones de Alimento para rotación de proteínas de la mascota activa
 */
export default function AlternativeFoodModal({
  pet,
  similarProducts = [],
  getFlavorBadge,
  onAddProduct,
  onSelectAsHabitual,
  onExploreStore,
  onClose,
}) {
  if (!pet) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-200">
        {/* Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-br from-[#1D1D1F] via-[#2A1D0E] to-[#120D06] border-b border-amber-500/20 text-white flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 border border-white/10 backdrop-blur-sm flex items-center justify-center text-xl shrink-0">
              🔄
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black leading-tight">
                Otras Opciones de Alimento para {pet.name}
              </h3>
              <p className="text-[11px] text-amber-200/90 font-medium">
                Variedades monoproteicas y grain free compatibles con su digestión.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/15 hover:bg-white/25 text-white flex items-center justify-center transition-all cursor-pointer shrink-0 border border-white/20 active:scale-95"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1">
          <div className="p-3.5 rounded-2xl bg-amber-50/90 border border-amber-200/90 text-xs text-amber-950 flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <strong>Rotación de proteínas segura:</strong> Todas estas opciones pertenecen a líneas de calidad holística super premium, permitiendo alternar sabores (salmón, cordero, pollo, cerdo ibérico) sin alterar la flora intestinal de {pet.name}.
            </div>
          </div>

          <div className="space-y-3">
            {similarProducts.map((prod) => {
              const flavor = getFlavorBadge(prod);
              const defaultWeight = prod.weights?.[0] || '12 kg';
              const isProdOutOfStock = isProductOutOfStock(prod, defaultWeight);

              return (
                <div
                  key={prod.id}
                  className={`p-4 rounded-2xl bg-slate-50 border transition-all flex flex-col sm:flex-row items-center sm:items-start justify-between gap-4 shadow-2xs ${
                    isProdOutOfStock
                      ? 'border-slate-200/60 opacity-85'
                      : 'hover:bg-white border-slate-200 hover:border-amber-400 hover:shadow-md'
                  }`}
                >
                  <div className="flex items-center gap-3.5 flex-1 min-w-0">
                    <div className="w-20 h-20 rounded-xl bg-white p-2 border border-slate-200 shrink-0 flex items-center justify-center relative overflow-hidden">
                      <img
                        src={prod.image}
                        alt={prod.name}
                        className={`w-full h-full object-contain ${isProdOutOfStock ? 'opacity-40 grayscale' : ''}`}
                      />
                      {isProdOutOfStock && (
                        <div className="absolute inset-0 bg-slate-900/30 backdrop-blur-[1px] flex items-center justify-center">
                          <span className="text-[8px] font-black uppercase text-white bg-rose-600/90 px-1 py-0.5 rounded">
                            Sin Stock
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[10px] font-black text-amber-800 uppercase tracking-wider">
                          {prod.brand}
                        </span>
                        {flavor && (
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${flavor.bg}`}>
                            {flavor.emoji} {flavor.label}
                          </span>
                        )}
                        {isProdOutOfStock && (
                          <span className="text-[9px] font-black uppercase text-rose-700 bg-rose-50 px-1.5 py-0.2 rounded border border-rose-200">
                            Agotado en Bodega
                          </span>
                        )}
                      </div>
                      <h4 className="text-xs sm:text-sm font-black text-slate-900 leading-snug">
                        {prod.name}
                      </h4>
                      <div className="text-xs font-black text-slate-900">
                        {formatCLP(prod.price)} CLP{' '}
                        <span className="text-[10px] text-slate-400 font-normal">({defaultWeight})</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex sm:flex-col items-center gap-2 shrink-0 w-full sm:w-auto">
                    <button
                      type="button"
                      disabled={isProdOutOfStock}
                      onClick={() => !isProdOutOfStock && onAddProduct(prod, defaultWeight)}
                      className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl font-black text-xs shadow-xs transition-all flex items-center justify-center gap-1.5 whitespace-nowrap active:scale-95 ${
                        isProdOutOfStock
                          ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                          : 'bg-[#F5BA13] hover:bg-[#e2aa10] text-[#1D1D1F] cursor-pointer shadow-md shadow-[#F5BA13]/20'
                      }`}
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>{isProdOutOfStock ? 'Sin stock' : 'Añadir a mi pedido'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onSelectAsHabitual(prod)}
                      className="flex-1 sm:flex-initial px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 font-extrabold text-[11px] border border-slate-200 transition-all cursor-pointer whitespace-nowrap active:scale-95"
                    >
                      <span>Elegir como habitual</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">¿Buscas algo diferente?</span>
            <button
              type="button"
              onClick={onExploreStore}
              className="text-xs font-black text-amber-800 hover:text-amber-950 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Ver todos los alimentos en la Tienda Online</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
