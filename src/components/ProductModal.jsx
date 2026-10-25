import React, { useState } from 'react';
import { X, Star, Check, ShieldCheck, Heart, ShoppingBag, Truck } from 'lucide-react';
import { getFlavorSwatchStyle } from '../utils/productVariants';

export default function ProductModal({ product, onClose, onAddToCart }) {
  const [selectedWeight, setSelectedWeight] = useState(
    product?.weights ? product.weights[0] : ''
  );
  const [quantity, setQuantity] = useState(1);

  if (!product) return null;

  const formatCLP = (price) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const isDog = product.petType === 'perros';
  const variants = product?.variants || [];
  const activeVariant = variants.find((v) => v.format === selectedWeight || v.weight === selectedWeight) || variants[0];
  const activeStock = activeVariant && typeof activeVariant.stock === 'number'
    ? activeVariant.stock
    : (typeof product.stock === 'number' ? product.stock : 10);
  const isOutOfStock = activeStock <= 0 || Boolean(activeVariant?.isPaused || product?.isPaused);

  const handleAdd = () => {
    if (isOutOfStock) return;
    const variantName = activeVariant && activeVariant.format && activeVariant.format !== product.name
      ? `${product.name} (${activeVariant.format})`
      : product.name;
    const itemToAdd = {
      ...product,
      id: activeVariant?.id || product.id,
      name: variantName,
      price: activeVariant ? activeVariant.price : product.price,
      selectedWeight: selectedWeight,
      weight: selectedWeight,
      stock: activeStock,
    };
    onAddToCart(itemToAdd, selectedWeight, quantity);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-300">
      
      {/* Modal Container: Bottom Sheet on Mobile, Centered Modal on Desktop */}
      <div className="relative w-full max-w-3xl bg-white rounded-t-3xl md:rounded-3xl overflow-hidden shadow-2xl border border-slate-100 max-h-[90dvh] md:max-h-[90vh] flex flex-col md:flex-row pb-safe md:pb-0 animate-in slide-in-from-bottom-6 md:slide-in-from-bottom-0 duration-300">
        
        {/* Mobile Drag Indicator Bar */}
        <div className="md:hidden w-full pt-2.5 pb-1 flex justify-center bg-slate-50">
          <div className="w-12 h-1.5 bg-slate-300 rounded-full" />
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-20 p-2 rounded-full bg-slate-100/90 hover:bg-slate-200 text-slate-700 transition-all min-w-[44px] min-h-[44px] flex items-center justify-center cursor-pointer"
          aria-label="Cerrar vista rápida"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Product Image Side: Compact banner on Mobile, 50% showcase on Desktop */}
        <div className="w-full md:w-1/2 bg-slate-50 p-4 md:p-6 flex flex-row md:flex-col items-center justify-start md:justify-center relative border-b md:border-b-0 md:border-r border-slate-100 gap-3">
          {product.badge && (
            <span className={`absolute top-3 left-3 text-[10px] md:text-xs font-black px-2.5 py-0.5 md:px-3 md:py-1 rounded-full text-white ${
              isDog ? 'bg-[#0E8388]' : 'bg-[#C86D39]'
            }`}>
              {product.badge}
            </span>
          )}
          <img
            src={product.image}
            alt={product.name}
            className="w-20 h-20 sm:w-28 sm:h-28 md:w-64 md:h-64 object-contain max-h-72 drop-shadow-md shrink-0 mt-4 md:mt-0"
          />
          <div className="md:hidden min-w-0 pr-10">
            <span className="text-[10px] font-black uppercase tracking-wider text-[#0E8388]">
              {product.category}
            </span>
            <h3 className="font-heading font-extrabold text-base text-slate-900 leading-snug truncate">
              {product.name}
            </h3>
            <div className="text-lg font-black text-slate-900 mt-0.5">
              {formatCLP(product.price * quantity)}
            </div>
          </div>
        </div>

        {/* Product Details Side */}
        <div className="w-full md:w-1/2 p-5 md:p-8 overflow-y-auto flex flex-col justify-between">
          <div>
            <div className="hidden md:flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#0E8388]">
                {product.category}
              </span>
              <div className="flex items-center gap-1 text-amber-500 font-bold text-sm">
                <Star className="w-4 h-4 fill-amber-400" />
                <span>{product.rating}</span>
                <span className="text-slate-400">({product.reviewsCount} reseñas)</span>
              </div>
            </div>

            <h2 className="hidden md:block font-heading font-extrabold text-xl sm:text-2xl text-slate-900 mb-2 leading-tight tracking-tight">
              {product.name}
            </h2>

            <p className="text-xs sm:text-sm text-slate-600 mb-4 leading-relaxed line-clamp-2 sm:line-clamp-none">
              {product.tagline}
            </p>

            <div className="hidden md:block text-3xl font-black text-slate-900 mb-6">
              {formatCLP(product.price * quantity)}
            </div>

            {/* Weights / Flavors Selector */}
            {product.weights && (
              <div className="mb-4 md:mb-6">
                <label className="flex items-center justify-between text-[11px] md:text-xs font-bold text-slate-700 tracking-tight mb-2">
                  <span>
                    {product.hasFlavorVariants ? 'Sabor:' : 'Formato:'}{' '}
                    <strong className="text-slate-900 font-extrabold">{selectedWeight}</strong>
                  </span>
                  {product.hasFlavorVariants && (
                    <span className="text-[10px] text-slate-400 font-medium">
                      {product.weights.length} variedades
                    </span>
                  )}
                </label>
                <div className="flex flex-wrap gap-2">
                  {product.weights.map((w) => {
                    const swatch = product.hasFlavorVariants ? getFlavorSwatchStyle(w) : null;
                    const isSelected = selectedWeight === w;

                    return (
                      <button
                        key={w}
                        type="button"
                        onClick={() => setSelectedWeight(w)}
                        className={`flex items-center gap-2 px-3.5 py-2 md:px-4 md:py-2 rounded-xl text-xs md:text-sm font-bold transition-all border cursor-pointer active:scale-95 ${
                          isSelected
                            ? isDog
                              ? 'bg-emerald-50 text-slate-900 border-[#0E8388] shadow-xs ring-2 ring-[#0E8388]/20'
                              : 'bg-amber-50 text-slate-900 border-[#C86D39] shadow-xs ring-2 ring-[#C86D39]/20'
                            : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        {swatch && (
                          <span
                            className="w-3.5 h-3.5 rounded-full flex items-center justify-center shrink-0 bg-white"
                            style={{
                              border: `1.5px solid ${swatch.primaryColor}`,
                              padding: isSelected ? '2px' : '0px',
                            }}
                          >
                            {isSelected && (
                              <span
                                className="w-full h-full rounded-full block animate-in zoom-in-50 duration-150"
                                style={{ backgroundColor: swatch.primaryColor }}
                              />
                            )}
                          </span>
                        )}
                        <span>{w}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Benefits List (Compact on mobile) */}
            {product.benefits && (
              <div className="mb-4 md:mb-6 space-y-1.5 hidden sm:block">
                <h4 className="text-[11px] md:text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Beneficios Destacados:
                </h4>
                {product.benefits.slice(0, 3).map((b, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-xs font-semibold text-slate-700">
                    <Check className="w-3.5 h-3.5 text-[#10B981] shrink-0 mt-0.5" />
                    <span>{b}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Actions & Quantity */}
          <div className="pt-3 md:pt-4 border-t border-slate-100 space-y-3 md:space-y-4">
            <div className="flex items-center gap-3">
              <div className={`flex items-center border rounded-2xl p-0.5 ${
                isOutOfStock ? 'bg-slate-100 border-slate-200 opacity-60' : 'border-slate-200 bg-slate-50'
              }`}>
                <button
                  disabled={isOutOfStock || quantity <= 1}
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-9 h-9 flex items-center justify-center text-slate-700 font-bold hover:bg-slate-200 rounded-xl active:scale-95 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                  aria-label="Disminuir cantidad"
                >
                  -
                </button>
                <span className="w-8 text-center text-sm font-black text-slate-900">{isOutOfStock ? 0 : quantity}</span>
                <button
                  disabled={isOutOfStock || quantity >= activeStock}
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-9 h-9 flex items-center justify-center text-slate-700 font-bold hover:bg-slate-200 rounded-xl active:scale-95 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                  aria-label="Aumentar cantidad"
                >
                  +
                </button>
              </div>

              <button
                disabled={isOutOfStock}
                onClick={handleAdd}
                className={`flex-1 py-3.5 px-5 rounded-2xl font-extrabold text-sm flex items-center justify-center gap-2 transition-all active:scale-95 ${
                  isOutOfStock
                    ? 'bg-rose-50 text-rose-700 border border-rose-200 shadow-none cursor-not-allowed'
                    : isDog
                    ? 'bg-[#0E8388] hover:bg-[#10B981] text-white shadow-lg shadow-[#0E8388]/30 cursor-pointer'
                    : 'bg-[#C86D39] hover:bg-[#D97706] text-white shadow-lg shadow-[#C86D39]/30 cursor-pointer'
                }`}
              >
                {isOutOfStock ? (
                  <>
                    <X className="w-4 h-4 text-rose-500" />
                    <span>Agotado en Bodega</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4" />
                    <span>Agregar al Carrito</span>
                  </>
                )}
              </button>
            </div>

            <div className="flex items-center justify-between text-[10px] md:text-[11px] font-semibold text-slate-500 pt-1">
              <span className="flex items-center gap-1">
                <Truck className="w-3.5 h-3.5 text-[#10B981]" /> Envío a todo Chile
              </span>
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-[#0E8388]" /> 100% Holístico
              </span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
