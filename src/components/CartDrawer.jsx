import React, { useState, useEffect } from 'react';
import { X, Trash2, ShoppingBag, ArrowRight, ShieldCheck, Truck, Ticket, Check, AlertCircle, Sparkles, Loader2 } from 'lucide-react';
import { verifyCouponInSupabase, redeemCouponInSupabase } from '../services/conveniosService';
import { createOrderInSupabase } from '../services/ordersService';
import { updateCustomerPoints } from '../services/customersService';
import { updateProductInSupabase } from '../services/productsService';

export default function CartDrawer({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  user,
  onClearCart,
}) {
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState(null);
  const [isVerifyingCoupon, setIsVerifyingCoupon] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);

  // Reset coupon state if cart is emptied
  useEffect(() => {
    if (cartItems.length === 0) {
      setAppliedCoupon(null);
      setCouponError(null);
      setCheckoutSuccess(false);
    }
  }, [cartItems]);

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

  // Coupon Discount Calculation
  const discountPercent = appliedCoupon ? appliedCoupon.discountPercent : 0;
  const discountAmount = appliedCoupon ? Math.round((subtotal * discountPercent) / 100) : 0;
  const shippingCost = subtotal >= freeShippingThreshold ? 0 : 3990;
  const total = Math.max(0, subtotal - discountAmount + shippingCost);

  // Validate and Apply Coupon (Supabase con fallback a localStorage)
  const handleApplyCoupon = async (e) => {
    e?.preventDefault();
    setCouponError(null);
    const cleanCode = couponInput.trim().toUpperCase();

    if (!cleanCode) {
      setCouponError('Ingresa un código de cupón.');
      return;
    }

    setIsVerifyingCoupon(true);

    try {
      // 1. Validar en Supabase
      const result = await verifyCouponInSupabase(cleanCode);
      if (result && result.valid) {
        setAppliedCoupon({
          code: cleanCode,
          convenioId: result.convenio?.id,
          convenioName: result.convenio?.name || 'Convenio Aliado',
          discountPercent: result.discountPercent || 10,
          isSingleUse: result.isSingleUse ?? true,
        });
        setCouponInput('');
        setIsVerifyingCoupon(false);
        return;
      }

      // 2. Fallback a convenios locales
      let savedConvenios = [];
      try {
        const raw = localStorage.getItem('patitas_convenios');
        if (raw) savedConvenios = JSON.parse(raw);
      } catch (err) {
        console.error('Error reading convenios', err);
      }

      let matchedConvenio = null;
      let matchedCoupon = null;

      for (const conv of savedConvenios) {
        if (!conv.active) continue;

        if (conv.discountType === 'single_use' && conv.coupons) {
          const found = conv.coupons.find((c) => c.code.toUpperCase() === cleanCode);
          if (found) {
            matchedConvenio = conv;
            matchedCoupon = found;
            break;
          }
        } else if (conv.code && conv.code.toUpperCase() === cleanCode) {
          matchedConvenio = conv;
          break;
        }
      }

      if (!matchedConvenio) {
        setCouponError(result?.error || 'Código no válido o el convenio no se encuentra activo.');
        setIsVerifyingCoupon(false);
        return;
      }

      if (matchedCoupon && matchedCoupon.status === 'canjeado') {
        setCouponError(`El cupón ${cleanCode} ya fue utilizado en una compra anterior.`);
        setIsVerifyingCoupon(false);
        return;
      }

      const pct = matchedConvenio.discountPercent || 10;
      setAppliedCoupon({
        code: cleanCode,
        convenioId: matchedConvenio.id,
        convenioName: matchedConvenio.name,
        discountPercent: pct,
        isSingleUse: matchedConvenio.discountType === 'single_use',
      });
      setCouponInput('');
    } catch (err) {
      console.error('Error applying coupon:', err);
      setCouponError('Ocurrió un error al verificar el cupón.');
    } finally {
      setIsVerifyingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponError(null);
  };

  // Process Checkout con persistencia real en Supabase
  const handleCheckout = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    const orderId = `PED-${Math.floor(1000 + Math.random() * 9000)}`;
    const pointsEarned = Math.round(total * 0.01);

    const orderPayload = {
      id: orderId,
      customerId: user?.id || null,
      customerName: user?.name || user?.full_name || 'Cliente Web',
      customerEmail: user?.email || null,
      customerPhone: user?.phone || null,
      channel: 'web',
      paymentMethod: 'Tarjeta',
      paymentStatus: 'pagado',
      status: 'en_preparacion',
      subtotal,
      shippingCost,
      discount: discountAmount,
      total,
      pointsEarned,
      deliveryDayText: 'Hoy Mismo',
      deliveryDate: new Date().toISOString().split('T')[0],
      deliverySlot: 'Tarde (14:00 - 19:00 hrs)',
      address: user?.address || 'Av. Los Colonos 1420, Puerto Varas',
      city: user?.city || 'Puerto Varas',
      deliveryZone: 'Zona 1: Radio Urbano Puerto Varas',
      agreementUsed: appliedCoupon ? `${appliedCoupon.convenioName} (${appliedCoupon.code})` : null,
      couponCodeUsed: appliedCoupon ? appliedCoupon.code : null,
      notes: 'Pedido realizado desde la web / PWA Patitas del Sur',
    };

    try {
      // 1. Guardar orden e ítems en Supabase
      await createOrderInSupabase(orderPayload, cartItems);

      // 2. Quemar cupón en Supabase y localmente si aplica
      if (appliedCoupon) {
        await redeemCouponInSupabase(appliedCoupon.code, orderId);

        try {
          const raw = localStorage.getItem('patitas_convenios');
          if (raw) {
            const list = JSON.parse(raw);
            const updated = list.map((conv) => {
              if (conv.id === appliedCoupon.convenioId) {
                const updatedCoupons = (conv.coupons || []).map((cp) => {
                  if (cp.code.toUpperCase() === appliedCoupon.code.toUpperCase()) {
                    return {
                      ...cp,
                      status: 'canjeado',
                      usedAt: new Date().toLocaleDateString('es-CL'),
                      orderId,
                    };
                  }
                  return cp;
                });
                return {
                  ...conv,
                  redemptionsCount: (conv.redemptionsCount || 0) + 1,
                  coupons: updatedCoupons,
                };
              }
              return conv;
            });
            localStorage.setItem('patitas_convenios', JSON.stringify(updated));
          }
        } catch (e) {
          console.error(e);
        }
      }

      // 3. Sumar puntos acumulados al cliente si está identificado
      if (user?.id) {
        await updateCustomerPoints(user.id, pointsEarned);
      }

      // 4. Descontar stock en Supabase
      for (const item of cartItems) {
        if (item.id && typeof item.stock === 'number') {
          const newStock = Math.max(0, item.stock - (item.quantity || 1));
          await updateProductInSupabase(item.id, { stock: newStock });
        }
      }

      // 5. Emitir eventos globales para que el Panel de Administración y Vistas se sincronicen
      window.dispatchEvent(new Event('patitas_orders_updated'));
      window.dispatchEvent(new Event('patitas_products_updated'));
      window.dispatchEvent(new Event('patitas_convenios_updated'));

      setCheckoutSuccess(true);
      if (onClearCart) {
        onClearCart();
      }

      setTimeout(() => {
        alert(
          `¡Compra procesada y registrada con éxito en el sistema!\n\n` +
          `N° Pedido: ${orderId}\n` +
          `Total pagado: ${formatCLP(total)}\n` +
          (appliedCoupon ? `Cupón aplicado: ${appliedCoupon.code} (-${appliedCoupon.discountPercent}%)\n` : '') +
          `Puntos acumulados: +${pointsEarned} Pts Club Patitas\n\n` +
          `Tu pedido ya está siendo preparado en bodega 🐾`
        );
        setAppliedCoupon(null);
        setCheckoutSuccess(false);
        setIsSubmitting(false);
        onClose();
      }, 400);
    } catch (err) {
      console.error('Error during checkout process:', err);
      alert('Hubo un problema registrando el pedido. Por favor intenta nuevamente.');
      setIsSubmitting(false);
    }
  };

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
              
              {/* Coupon / Discount Code Input */}
              <div className="p-3 bg-white rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-700 flex items-center gap-1.5">
                    <Ticket className="w-3.5 h-3.5 text-[#0E8388]" />
                    ¿Tienes un cupón de convenio?
                  </span>
                  {appliedCoupon && (
                    <button
                      type="button"
                      onClick={handleRemoveCoupon}
                      className="text-red-500 hover:underline font-bold text-[11px] cursor-pointer"
                    >
                      Quitar
                    </button>
                  )}
                </div>

                {appliedCoupon ? (
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-emerald-500 text-white flex items-center justify-center shrink-0">
                        <Check className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <div className="font-black text-emerald-900 flex items-center gap-1.5">
                          <span>{appliedCoupon.code}</span>
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-200/60 px-1.5 py-0.2 rounded">
                            -{appliedCoupon.discountPercent}%
                          </span>
                        </div>
                        <p className="text-[11px] text-emerald-700">Convenio {appliedCoupon.convenioName}</p>
                      </div>
                    </div>
                    <span className="font-black text-emerald-800">
                      -{formatCLP(discountAmount)}
                    </span>
                  </div>
                ) : (
                  <form onSubmit={handleApplyCoupon} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Ej: SWD-7K9P"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                      className="flex-1 px-3 py-2 text-xs font-mono font-bold rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:bg-white focus:border-[#0E8388]"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 bg-[#0E8388] hover:bg-[#10B981] text-white font-bold text-xs rounded-xl transition-all cursor-pointer shadow-xs"
                    >
                      Aplicar
                    </button>
                  </form>
                )}

                {couponError && (
                  <div className="flex items-center gap-1.5 text-[11px] font-semibold text-rose-600 animate-in fade-in">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{couponError}</span>
                  </div>
                )}
              </div>

              {/* Price Breakdown */}
              <div className="space-y-1 text-xs sm:text-sm">
                <div className="flex justify-between text-slate-500">
                  <span>Subtotal</span>
                  <span>{formatCLP(subtotal)}</span>
                </div>

                {appliedCoupon && (
                  <div className="flex justify-between font-bold text-emerald-700">
                    <span className="flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      Descuento ({appliedCoupon.discountPercent}%)
                    </span>
                    <span>-{formatCLP(discountAmount)}</span>
                  </div>
                )}

                <div className="flex justify-between text-slate-500">
                  <span>Envío estimado</span>
                  <span>{subtotal >= freeShippingThreshold ? 'GRATIS' : '$3.990'}</span>
                </div>

                <div className="flex justify-between text-base sm:text-lg font-black text-slate-900 pt-2 border-t border-slate-200">
                  <span>Total</span>
                  <span className={appliedCoupon ? 'text-emerald-700' : 'text-slate-900'}>
                    {formatCLP(total)}
                  </span>
                </div>
              </div>

              {/* Checkout Button */}
              <button
                onClick={handleCheckout}
                disabled={checkoutSuccess || isSubmitting}
                className="w-full py-3.5 sm:py-4 rounded-2xl bg-[#10B981] hover:bg-[#34D399] text-slate-950 font-black text-sm sm:text-base flex items-center justify-center gap-2 shadow-xl shadow-[#10B981]/30 transition-transform active:scale-95 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                    <span>REGISTRANDO PEDIDO EN SUPABASE...</span>
                  </>
                ) : (
                  <>
                    <span>PROCESAR COMPRA SEGURA</span>
                    <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                  </>
                )}
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

