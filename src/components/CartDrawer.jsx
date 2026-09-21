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
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-0 sm:pl-10 w-full justify-end">
        
        {/* Drawer Panel */}
        <div className="w-full sm:w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between border-l border-slate-100 h-full">
          
          {/* Header */}
          <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-[#0E8388]" />
              <h2 className="text-xl font-black text-slate-900">Tu Carrito</h2>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-[#10B981]/10 text-[#10B981]">
                {cartItems.length} items
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-2.5 rounded-full text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition-all cursor-pointer min-w-[44px] min-h-[44px] flex items-center justify-center"
              aria-label="Cerrar carrito"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Shipping Progress Bar */}
          <div className="bg-[#0E8388]/5 px-5 sm:px-6 py-3 border-b border-[#0E8388]/10">
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
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3">
            {cartItems.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 space-y-3 py-12">
                <div className="p-4 rounded-full bg-slate-100">
                  <ShoppingBag className="w-10 h-10 text-slate-300" />
                </div>
                <p className="text-sm font-semibold">Tu carrito está vacío por ahora</p>
                <button
                  onClick={onClose}
                  className="px-6 py-2.5 rounded-full bg-[#0E8388] text-white text-xs font-extrabold hover:bg-[#10B981] transition-colors shadow-md cursor-pointer"
                >
                  Ir a Comprar
                </button>
              </div>
            ) : (
              cartItems.map((item, idx) => (
                <div
                  key={`${item.id}-${item.weight}-${idx}`}
                  className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100"
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-14 h-14 sm:w-16 sm:h-16 object-contain rounded-xl bg-white p-1 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 truncate">{item.name}</h4>
                    {item.weight && (
                      <p className="text-[11px] text-slate-500 font-semibold">{item.weight}</p>
                    )}
                    <div className="text-xs sm:text-sm font-black text-slate-900 mt-0.5">
                      {formatCLP(item.price)}
                    </div>
                  </div>

                  {/* Quantity Actions */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <div className="flex items-center border border-slate-200 rounded-xl bg-white text-xs p-0.5">
                      <button
                        onClick={() => onUpdateQuantity(idx, Math.max(1, item.quantity - 1))}
                        className="w-7 h-7 flex items-center justify-center font-bold text-slate-600 hover:bg-slate-100 rounded-lg active:scale-95 cursor-pointer"
                        aria-label="Disminuir cantidad"
                      >
                        -
                      </button>
                      <span className="w-6 text-center font-bold text-slate-900">{item.quantity}</span>
                      <button
                        onClick={() => onUpdateQuantity(idx, item.quantity + 1)}
                        className="w-7 h-7 flex items-center justify-center font-bold text-slate-600 hover:bg-slate-100 rounded-lg active:scale-95 cursor-pointer"
                        aria-label="Aumentar cantidad"
                      >
                        +
                      </button>
                    </div>
                    <button
                      onClick={() => onRemoveItem(idx)}
                      className="w-8 h-8 flex items-center justify-center p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                      title="Eliminar producto"
                      aria-label="Eliminar producto"
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
            <div className="p-5 sm:p-6 border-t border-slate-100 bg-slate-50 space-y-3.5 pb-safe">
              <div className="space-y-1 text-xs sm:text-sm">
                <div className="flex justify-between text-slate-500">
                  <span>Subtotal</span>
                  <span>{formatCLP(subtotal)}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Envío estimado</span>
                  <span>{subtotal >= freeShippingThreshold ? 'GRATIS' : '$3.990'}</span>
                </div>
                <div className="flex justify-between text-base sm:text-lg font-black text-slate-900 pt-2 border-t border-slate-200">
                  <span>Total</span>
                  <span>{formatCLP(subtotal + (subtotal >= freeShippingThreshold ? 0 : 3990))}</span>
                </div>
              </div>

              <button
                onClick={() => alert("Procesando pago seguro... (Integración pronta con Supabase/Flow/Webpay)")}
                className="w-full py-3.5 sm:py-4 rounded-2xl bg-[#10B981] hover:bg-[#34D399] text-slate-950 font-black text-sm sm:text-base flex items-center justify-center gap-2 shadow-xl shadow-[#10B981]/30 transition-transform active:scale-95 cursor-pointer"
              >
                <span>PROCESAR COMPRA SEGURA</span>
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>

              <div className="flex items-center justify-center gap-1.5 text-[10px] sm:text-[11px] text-slate-400 font-semibold text-center">
                <ShieldCheck className="w-3.5 h-3.5 text-[#0E8388] shrink-0" />
                <span>Pago 100% Encriptado con Webpay & Cloudflare SSL</span>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
