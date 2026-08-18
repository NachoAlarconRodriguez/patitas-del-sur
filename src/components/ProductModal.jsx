import React, { useState } from 'react';
import { X, Star, Check, ShieldCheck, Heart, ShoppingBag, Truck } from 'lucide-react';

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

  const handleAdd = () => {
    onAddToCart(product, selectedWeight, quantity);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-300">
      
      {/* Modal Container */}
      <div className="relative w-full max-w-3xl bg-white rounded-3xl overflow-hidden shadow-2xl border border-slate-100 max-h-[90vh] flex flex-col md:flex-row">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-slate-100 text-slate-700 hover:bg-slate-200 transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Product Image Side */}
        <div className="w-full md:w-1/2 bg-slate-50 p-6 flex flex-col items-center justify-center relative border-b md:border-b-0 md:border-r border-slate-100">
          {product.badge && (
            <span className={`absolute top-4 left-4 text-xs font-black px-3 py-1 rounded-full text-white ${
              isDog ? 'bg-[#0E8388]' : 'bg-[#C86D39]'
            }`}>
              {product.badge}
            </span>
          )}
          <img
            src={product.image}
            alt={product.name}
            className="w-64 h-64 object-contain max-h-72 drop-shadow-md"
          />
        </div>

        {/* Product Details Side */}
        <div className="w-full md:w-1/2 p-6 md:p-8 overflow-y-auto flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#0E8388]">
                {product.category}
              </span>
              <div className="flex items-center gap-1 text-amber-500 font-bold text-sm">
                <Star className="w-4 h-4 fill-amber-400" />
                <span>{product.rating}</span>
                <span className="text-slate-400">({product.reviewsCount} reseñas)</span>
              </div>
            </div>

            <h2 className="text-2xl font-black text-slate-900 mb-2 leading-tight">
              {product.name}
            </h2>

            <p className="text-sm text-slate-600 mb-4 leading-relaxed">
              {product.tagline}
            </p>

            <div className="text-3xl font-black text-slate-900 mb-6">
              {formatCLP(product.price * quantity)}
            </div>

            {/* Weights Selector */}
            {product.weights && (
              <div className="mb-6">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Formato / Peso:
                </label>
                <div className="flex flex-wrap gap-2">
                  {product.weights.map((w) => (
                    <button
                      key={w}
                      onClick={() => setSelectedWeight(w)}
                      className={`px-4 py-2 rounded-xl text-sm font-bold transition-all border ${
                        selectedWeight === w
                          ? isDog
                            ? 'bg-[#0E8388] text-white border-[#0E8388]'
                            : 'bg-[#C86D39] text-white border-[#C86D39]'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {w}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Benefits List */}
            {product.benefits && (
              <div className="mb-6 space-y-2">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Beneficios Destacados:
                </h4>
                {product.benefits.map((b, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-xs font-semibold text-slate-700">
                    <Check className="w-4 h-4 text-[#10B981] shrink-0 mt-0.5" />
                    <span>{b}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Actions & Quantity */}
          <div className="pt-4 border-t border-slate-100 space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center border border-slate-200 rounded-2xl bg-slate-50">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3.5 py-2 text-slate-600 font-bold hover:bg-slate-200 rounded-l-2xl"
                >
                  -
                </button>
                <span className="px-4 text-sm font-black text-slate-900">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-3.5 py-2 text-slate-600 font-bold hover:bg-slate-200 rounded-r-2xl"
                >
                  +
                </button>
              </div>

              <button
                onClick={handleAdd}
                className={`flex-1 py-3.5 px-6 rounded-2xl text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg transition-transform active:scale-95 ${
                  isDog
                    ? 'bg-[#0E8388] hover:bg-[#10B981] shadow-[#0E8388]/30'
                    : 'bg-[#C86D39] hover:bg-[#D97706] shadow-[#C86D39]/30'
                }`}
              >
                <ShoppingBag className="w-4 h-4" />
                Agregar al Carrito
              </button>
            </div>

            <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 pt-1">
              <span className="flex items-center gap-1">
                <Truck className="w-3.5 h-3.5 text-[#10B981]" /> Envío rápido a todo Chile
              </span>
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-[#0E8388]" /> Garantía 100% Holístico
              </span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
