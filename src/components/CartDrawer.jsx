import React from 'react';
import { X, Trash2, ShoppingBag, ArrowRight, ShieldCheck, Truck } from 'lucide-react';

export default function CartDrawer({ isOpen, onClose, cartItems, onUpdateQuantity, onRemoveItem }) {
  if (!isOpen) return null;

  const formatCLP = (price) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const freeShippingThreshold = 35000;
  const progressToFreeShipping = Math.min(100, (subtotal / freeShippingThreshold) * 100);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        
        {/* Drawer Panel */}
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between border-l border-slate-100">
          
          {/* Header */}
          <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-[#0E8388]" />
              <h2 className="text-xl font-black text-slate-900">Tu Carrito</h2>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-[#10B981]/10 text-[#10B981]">
                {cartItems.length} items
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Shipping Progress Bar */}
          <div className="bg-[#0E8388]/5 px-6 py-3 border-b border-[#0E8388]/10">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-1">
              <span className="flex items-center gap-1">
                <Truck className="w-3.5 h-3.5 text-[#0E8388]" />
                {subtotal >= freeShippingThreshold
                  ? '¡Envío Gratis desbloqueado!'
                  : `Te faltan ${formatCLP(freeShippingThreshold - subtotal)} para Envío Gratis`}
              </span>
              <span>{Math.round(progressToFreeShipping)}%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#0E8388] to-[#10B981] transition-all duration-500"
                style={{ width: `${progressToFreeShipping}%` }}
              />
            </div>
          </div>

          {/* Items List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {cartItems.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 space-y-3">
                <div className="p-4 rounded-full bg-slate-100">
                  <ShoppingBag className="w-10 h-10 text-slate-300" />
                </div>
                <p className="text-sm font-semibold">Tu carrito está vacío por ahora</p>
                <button
                  onClick={onClose}
                  className="px-6 py-2.5 rounded-full bg-[#0E8388] text-white text-xs font-extrabold hover:bg-[#10B981] transition-colors shadow-md"
                >
                  Ir a Comprar
                </button>
              </div>
            ) : (
              cartItems.map((item, idx) => (
                <div
                  key={`${item.id}-${item.weight}-${idx}`}
                  className="flex items-center gap-4 p-3 rounded-2xl bg-slate-50 border border-slate-100"
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-16 h-16 object-contain rounded-xl bg-white p-1"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold text-slate-900 truncate">{item.name}</h4>
                    {item.weight && (
                      <p className="text-xs text-slate-500 font-semibold">{item.weight}</p>
                    )}
                    <div className="text-sm font-black text-slate-900 mt-1">
                      {formatCLP(item.price)}
                    </div>
                  </div>

                  {/* Quantity Actions */}
                  <div className="flex items-center gap-2">
                    <div className="flex items-center border border-slate-200 rounded-xl bg-white text-xs">
                      <button
                        onClick={() => onUpdateQuantity(idx, Math.max(1, item.quantity - 1))}
                        className="px-2 py-1 font-bold text-slate-600 hover:bg-slate-100"
                      >
                        -
                      </button>
                      <span className="px-2 font-bold text-slate-900">{item.quantity}</span>
                      <button
                        onClick={() => onUpdateQuantity(idx, item.quantity + 1)}
                        className="px-2 py-1 font-bold text-slate-600 hover:bg-slate-100"
                      >
                        +
                      </button>
                    </div>
                    <button
                      onClick={() => onRemoveItem(idx)}
                      className="p-1.5 text-slate-400 hover:text-red-500 transition-colors"
                      title="Eliminar producto"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Checkout */}
          {cartItems.length > 0 && (
            <div className="p-6 border-t border-slate-100 bg-slate-50 space-y-4">
              <div className="space-y-1 text-sm">
                <div className="flex justify-between text-slate-500">
                  <span>Subtotal</span>
                  <span>{formatCLP(subtotal)}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Envío estimado</span>
                  <span>{subtotal >= freeShippingThreshold ? 'GRATIS' : '$3.990'}</span>
                </div>
                <div className="flex justify-between text-lg font-black text-slate-900 pt-2 border-t border-slate-200">
                  <span>Total</span>
                  <span>{formatCLP(subtotal + (subtotal >= freeShippingThreshold ? 0 : 3990))}</span>
                </div>
              </div>

              <button
                onClick={() => alert("Procesando pago seguro... (Integración pronta con Supabase/Flow/Webpay)")}
                className="w-full py-4 rounded-2xl bg-[#10B981] hover:bg-[#34D399] text-slate-950 font-black text-base flex items-center justify-center gap-2 shadow-xl shadow-[#10B981]/30 transition-transform active:scale-95"
              >
                <span>PROCESAR COMPRA SECURA</span>
                <ArrowRight className="w-5 h-5" />
              </button>

              <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400 font-semibold">
                <ShieldCheck className="w-3.5 h-3.5 text-[#0E8388]" /> Pago 100% Encriptado con Webpay & Cloudflare SSL
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
