import React, { useState, useEffect } from 'react';
import {
  X,
  Trash2,
  ShoppingBag,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Truck,
  Ticket,
  Check,
  AlertCircle,
  Sparkles,
  Loader2,
  CreditCard,
  Landmark,
  MapPin,
  Phone,
  Mail,
  Clock,
  MessageSquare,
  Copy,
  CheckCircle2,
} from 'lucide-react';
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
  // Navigation step inside drawer: 'cart' | 'shipping' | 'success'
  const [step, setStep] = useState('cart');

  // Coupon state
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState(null);
  const [isVerifyingCoupon, setIsVerifyingCoupon] = useState(false);

  // Shipping & Checkout form state
  const [recipientName, setRecipientName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [city, setCity] = useState('Puerto Varas');
  const [address, setAddress] = useState('');
  const [depto, setDepto] = useState('');
  const [deliveryReference, setDeliveryReference] = useState('');
  const [deliverySlot, setDeliverySlot] = useState('Tarde (14:00 - 19:00 hrs)');
  const [paymentMethod, setPaymentMethod] = useState('tarjeta'); // 'tarjeta' | 'transferencia'
  const [formError, setFormError] = useState(null);

  // Submission & Post-order state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedOrder, setCompletedOrder] = useState(null);
  const [copiedBankData, setCopiedBankData] = useState(false);

  // Sync form with logged in user when available
  useEffect(() => {
    if (user) {
      if (!recipientName) setRecipientName(user.name || '');
      if (!phone) setPhone(user.phone || '');
      if (!email) setEmail(user.email || '');
      if (!address) setAddress(user.address || '');
      if (!city) setCity(user.city || 'Puerto Varas');
    }
  }, [user]);

  // Reset coupon and step if cart is emptied externally
  useEffect(() => {
    if (cartItems.length === 0 && step !== 'success') {
      setAppliedCoupon(null);
      setCouponError(null);
      setStep('cart');
    }
  }, [cartItems, step]);

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

      // Fallback a convenios locales
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

  // Validate step 1 to proceed to shipping
  const handleProceedToShipping = () => {
    if (cartItems.length === 0) return;
    setFormError(null);
    setStep('shipping');
  };

  // Submit Order to Supabase
  const handleConfirmOrder = async (e) => {
    e?.preventDefault();
    setFormError(null);

    // Validate fields
    if (!recipientName.trim()) {
      setFormError('Por favor ingresa el nombre de quien recibe el pedido.');
      return;
    }
    if (!phone.trim() || phone.trim().length < 8) {
      setFormError('Ingresa un teléfono celular válido para contactarte sobre el despacho.');
      return;
    }
    if (!address.trim()) {
      setFormError('Por favor ingresa la calle y número para el despacho.');
      return;
    }

    setIsSubmitting(true);

    const orderId = `PED-${Math.floor(1000 + Math.random() * 9000)}`;
    const pointsEarned = Math.round(total * 0.01);
    const fullAddress = depto.trim() ? `${address.trim()}, Depto/Casa ${depto.trim()}` : address.trim();

    const orderPayload = {
      id: orderId,
      customerId: user?.id || null,
      customerName: recipientName.trim(),
      customerEmail: email.trim() || user?.email || null,
      customerPhone: phone.trim(),
      channel: 'web',
      paymentMethod: paymentMethod === 'tarjeta' ? 'Tarjeta (Webpay / MP)' : 'Transferencia Bancaria',
      paymentStatus: 'pendiente',
      status: 'en_preparacion',
      subtotal,
      shippingCost,
      discount: discountAmount,
      total,
      pointsEarned,
      deliveryDayText: 'Hoy Mismo',
      deliveryDate: new Date().toISOString().split('T')[0],
      deliverySlot: deliverySlot,
      address: fullAddress,
      city: city,
      deliveryZone: `Zona Despacho: ${city}`,
      agreementUsed: appliedCoupon ? `${appliedCoupon.convenioName} (${appliedCoupon.code})` : null,
      couponCodeUsed: appliedCoupon ? appliedCoupon.code : null,
      notes: deliveryReference.trim() ? `Referencia: ${deliveryReference.trim()}` : 'Pedido desde la web',
    };

    try {
      // 1. Guardar orden e ítems en Supabase
      const result = await createOrderInSupabase(orderPayload, cartItems);
      if (!result.success) {
        throw new Error(result.error?.message || 'Error registrando el pedido en base de datos');
      }

      // 2. Quemar cupón si aplica
      if (appliedCoupon) {
        await redeemCouponInSupabase(appliedCoupon.code, orderId);
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

      // 5. Emitir eventos globales de sincronización
      window.dispatchEvent(new Event('patitas_orders_updated'));
      window.dispatchEvent(new Event('patitas_products_updated'));
      window.dispatchEvent(new Event('patitas_convenios_updated'));

      // Set order result and switch to modern success screen
      setCompletedOrder({
        id: orderId,
        total,
        pointsEarned,
        recipientName: recipientName.trim(),
        address: fullAddress,
        city,
        deliverySlot,
        paymentMethod,
        itemsCount: cartItems.length,
      });

      if (onClearCart) {
        onClearCart();
      }

      setStep('success');
    } catch (err) {
      console.error('Error during checkout process:', err);
      setFormError('Hubo un inconveniente al procesar tu pedido. Por favor intenta nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyBankData = () => {
    const bankText = `Patitas del Sur - Datos de Transferencia:
Banco: Banco de Chile
Tipo: Cuenta Corriente
N° Cuenta: 00-123-45678-09
RUT: 77.892.451-2
Titular: Comercial Kira SpA
Email: pagos@patitasdelsur.cl
Monto: ${formatCLP(completedOrder?.total || total)}
Asunto: Pedido ${completedOrder?.id}`;

    navigator.clipboard.writeText(bankText);
    setCopiedBankData(true);
    setTimeout(() => setCopiedBankData(false), 3000);
  };

  const handleCloseAndFinish = () => {
    setStep('cart');
    setCompletedOrder(null);
    setAppliedCoupon(null);
    setFormError(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-0 sm:pl-10 w-full justify-end">
        
        {/* Drawer Panel */}
        <div className="w-full sm:w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between border-l border-slate-100 h-full">
          
          {/* ========================================================= */}
          {/* HEADER: Dinámico según el paso                            */}
          {/* ========================================================= */}
          <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
            <div className="flex items-center gap-2">
              {step === 'shipping' && (
                <button
                  onClick={() => setStep('cart')}
                  className="p-1.5 rounded-xl hover:bg-slate-200 text-slate-700 transition-colors mr-1 cursor-pointer"
                  title="Volver al carrito"
                  aria-label="Volver al carrito"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
              )}

              <ShoppingBag className="w-5 h-5 text-[#0E8388]" />
              <h2 className="text-lg sm:text-xl font-black text-slate-900">
                {step === 'cart' && 'Tu Carrito'}
                {step === 'shipping' && 'Despacho & Pago'}
                {step === 'success' && '¡Pedido Exitoso!'}
              </h2>

              {step === 'cart' && (
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-[#10B981]/10 text-[#10B981]">
                  {cartItems.length} items
                </span>
              )}
            </div>

            <button
              onClick={step === 'success' ? handleCloseAndFinish : onClose}
              className="p-2 rounded-full text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition-all cursor-pointer min-w-[40px] min-h-[40px] flex items-center justify-center"
              aria-label="Cerrar carrito"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* ========================================================= */}
          {/* PASO 1: VISTA DE ÍTEMS Y CARRITO                          */}
          {/* ========================================================= */}
          {step === 'cart' && (
            <>
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
              <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3">
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
                      Ir a Explorar Catálogo
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

              {/* Footer Cart Summary & Next Step */}
              {cartItems.length > 0 && (
                <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50 space-y-3 pb-safe">
                  {/* Coupon Input */}
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
                          disabled={isVerifyingCoupon}
                          className="px-4 py-2 bg-[#0E8388] hover:bg-[#10B981] text-white font-bold text-xs rounded-xl transition-all cursor-pointer shadow-xs disabled:opacity-50"
                        >
                          {isVerifyingCoupon ? '...' : 'Aplicar'}
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
                      <span>Total estimado</span>
                      <span className={appliedCoupon ? 'text-emerald-700' : 'text-slate-900'}>
                        {formatCLP(total)}
                      </span>
                    </div>
                  </div>

                  {/* Button to proceed to Step 2 */}
                  <button
                    onClick={handleProceedToShipping}
                    className="w-full py-3.5 sm:py-4 rounded-2xl bg-[#0E8388] hover:bg-[#10B981] text-white font-black text-sm flex items-center justify-center gap-2 shadow-xl shadow-[#0E8388]/30 transition-transform active:scale-95 cursor-pointer"
                  >
                    <span>CONTINUAR AL DESPACHO</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </>
          )}

          {/* ========================================================= */}
          {/* PASO 2: FORMULARIO DE DESPACHO Y MÉTODO DE PAGO          */}
          {/* ========================================================= */}
          {step === 'shipping' && (
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 flex flex-col justify-between">
              <form onSubmit={handleConfirmOrder} className="space-y-4">
                
                {/* Error Banner */}
                {formError && (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 font-semibold flex items-center gap-2 animate-in fade-in">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>{formError}</span>
                  </div>
                )}

                {/* Sección 1: Datos del Receptor */}
                <div className="space-y-2.5 bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80">
                  <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#0E8388]" />
                    <span>1. Datos de Entrega</span>
                  </h3>

                  <div className="space-y-2">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">
                        Nombre completo de quien recibe *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Ej: Ignacio Alarcón"
                        value={recipientName}
                        onChange={(e) => setRecipientName(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#0E8388]"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">
                          Teléfono Móvil (WhatsApp) *
                        </label>
                        <input
                          type="tel"
                          required
                          placeholder="+56 9 8765 4321"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#0E8388]"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">
                          Comuna *
                        </label>
                        <select
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          className="w-full px-2.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#0E8388]"
                        >
                          <option value="Puerto Varas">Puerto Varas</option>
                          <option value="Llanquihue">Llanquihue</option>
                          <option value="Frutillar">Frutillar</option>
                          <option value="Puerto Montt">Puerto Montt</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">
                        Dirección (Calle y Número) *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Ej: Av. Los Colonos 1420"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#0E8388]"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">
                          Depto / Casa (Opcional)
                        </label>
                        <input
                          type="text"
                          placeholder="Ej: Depto 402"
                          value={depto}
                          onChange={(e) => setDepto(e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#0E8388]"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">
                          Horario Preferido *
                        </label>
                        <select
                          value={deliverySlot}
                          onChange={(e) => setDeliverySlot(e.target.value)}
                          className="w-full px-2 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#0E8388]"
                        >
                          <option value="Tarde (14:00 - 19:00 hrs)">Tarde (14:00 - 19:00 hrs)</option>
                          <option value="Mañana (09:00 - 13:00 hrs)">Mañana (09:00 - 13:00 hrs)</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">
                        Referencia para el despachador (Opcional)
                      </label>
                      <input
                        type="text"
                        placeholder="Ej: Portón café, tocar timbre blanco"
                        value={deliveryReference}
                        onChange={(e) => setDeliveryReference(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#0E8388]"
                      />
                    </div>
                  </div>
                </div>

                {/* Sección 2: Selección de Método de Pago */}
                <div className="space-y-2.5 bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80">
                  <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <CreditCard className="w-3.5 h-3.5 text-[#0E8388]" />
                    <span>2. Método de Pago</span>
                  </h3>

                  <div className="space-y-2">
                    {/* Opción 1: Tarjeta Online */}
                    <label
                      onClick={() => setPaymentMethod('tarjeta')}
                      className={`flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
                        paymentMethod === 'tarjeta'
                          ? 'bg-white border-[#0E8388] shadow-xs ring-1 ring-[#0E8388]'
                          : 'bg-white/60 border-slate-200 hover:bg-white'
                      }`}
                    >
                      <input
                        type="radio"
                        name="payment"
                        checked={paymentMethod === 'tarjeta'}
                        onChange={() => setPaymentMethod('tarjeta')}
                        className="mt-0.5 text-[#0E8388] focus:ring-[#0E8388]"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black text-slate-900">
                            Tarjeta Débito / Crédito
                          </span>
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-teal-100 text-teal-800">
                            Webpay / MP
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 font-medium">
                          Transacción segura con tarjeta nacional o internacional.
                        </p>
                      </div>
                    </label>

                    {/* Opción 2: Transferencia Bancaria */}
                    <label
                      onClick={() => setPaymentMethod('transferencia')}
                      className={`flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
                        paymentMethod === 'transferencia'
                          ? 'bg-white border-[#0E8388] shadow-xs ring-1 ring-[#0E8388]'
                          : 'bg-white/60 border-slate-200 hover:bg-white'
                      }`}
                    >
                      <input
                        type="radio"
                        name="payment"
                        checked={paymentMethod === 'transferencia'}
                        onChange={() => setPaymentMethod('transferencia')}
                        className="mt-0.5 text-[#0E8388] focus:ring-[#0E8388]"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black text-slate-900">
                            Transferencia Bancaria Inmediata
                          </span>
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                            Directo
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 font-medium">
                          Banco de Chile / Santander. Datos bancarios al confirmar.
                        </p>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Resumen Total y Confirmación */}
                <div className="p-3.5 bg-white rounded-2xl border border-slate-200 space-y-2">
                  <div className="flex justify-between text-xs text-slate-600">
                    <span>Subtotal ({cartItems.length} items)</span>
                    <span>{formatCLP(subtotal)}</span>
                  </div>

                  {appliedCoupon && (
                    <div className="flex justify-between text-xs font-bold text-emerald-700">
                      <span>Descuento ({appliedCoupon.code})</span>
                      <span>-{formatCLP(discountAmount)}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-xs text-slate-600">
                    <span>Despacho a {city}</span>
                    <span>{subtotal >= freeShippingThreshold ? 'GRATIS' : '$3.990'}</span>
                  </div>

                  <div className="flex justify-between text-base font-black text-slate-900 pt-2 border-t border-slate-100">
                    <span>Total a Pagar</span>
                    <span className="text-[#0E8388]">{formatCLP(total)}</span>
                  </div>
                </div>

                {/* Botón Final de Envío */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 rounded-2xl bg-[#10B981] hover:bg-[#34D399] text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-xl shadow-[#10B981]/30 transition-transform active:scale-95 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>REGISTRANDO ORDEN EN BASE DE DATOS...</span>
                    </>
                  ) : (
                    <>
                      <span>CONFIRMAR Y FINALIZAR PEDIDO</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* ========================================================= */}
          {/* PASO 3: CONFIRMACIÓN DE COMPRA EXITOSA (MODERNA, SIN ALERT) */}
          {/* ========================================================= */}
          {step === 'success' && completedOrder && (
            <div className="flex-1 overflow-y-auto p-5 space-y-4 flex flex-col justify-between">
              <div className="space-y-4 animate-in fade-in duration-300">
                
                {/* Banner de Éxito */}
                <div className="text-center py-4 px-2 space-y-2">
                  <div className="w-14 h-14 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto text-2xl shadow-lg shadow-emerald-500/30">
                    ✓
                  </div>
                  <h3 className="text-xl font-black text-slate-900">
                    ¡Pedido Recibido con Éxito! 🐾
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Número de Orden:{' '}
                    <span className="font-mono font-black text-[#0E8388] bg-[#0E8388]/10 px-2 py-0.5 rounded-md">
                      {completedOrder.id}
                    </span>
                  </p>
                </div>

                {/* Resumen de Entrega */}
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2 text-xs">
                  <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
                    <span className="text-slate-500">Destinatario:</span>
                    <span className="font-bold text-slate-900">{completedOrder.recipientName}</span>
                  </div>

                  <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
                    <span className="text-slate-500">Dirección:</span>
                    <span className="font-bold text-slate-900 text-right max-w-[200px] truncate">
                      {completedOrder.address}, {completedOrder.city}
                    </span>
                  </div>

                  <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
                    <span className="text-slate-500">Ventana de Entrega:</span>
                    <span className="font-bold text-emerald-800">{completedOrder.deliverySlot}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Total:</span>
                    <span className="font-black text-sm text-[#0E8388]">
                      {formatCLP(completedOrder.total)}
                    </span>
                  </div>
                </div>

                {/* Puntos Acumulados */}
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-emerald-600" />
                    <span className="text-xs font-bold text-emerald-900">
                      Puntos Club Patitas Ganados
                    </span>
                  </div>
                  <span className="text-xs font-black text-emerald-700 bg-emerald-200/60 px-2 py-0.5 rounded-full">
                    +{completedOrder.pointsEarned} Pts
                  </span>
                </div>

                {/* Si seleccionó Transferencia Bancaria */}
                {completedOrder.paymentMethod === 'transferencia' ? (
                  <div className="p-4 bg-teal-50 border border-teal-200 rounded-2xl space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-black text-teal-950 uppercase tracking-wider flex items-center gap-1.5">
                        <Landmark className="w-4 h-4 text-[#0E8388]" />
                        <span>Datos para Transferir</span>
                      </h4>
                      <button
                        onClick={handleCopyBankData}
                        className="text-[11px] font-bold text-[#0E8388] hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        {copiedBankData ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Copiado</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copiar Datos</span>
                          </>
                        )}
                      </button>
                    </div>

                    <div className="text-xs space-y-1 text-slate-700 font-medium font-mono">
                      <div><strong className="font-sans">Banco:</strong> Banco de Chile</div>
                      <div><strong className="font-sans">Tipo:</strong> Cuenta Corriente</div>
                      <div><strong className="font-sans">N°:</strong> 00-123-45678-09</div>
                      <div><strong className="font-sans">RUT:</strong> 77.892.451-2</div>
                      <div><strong className="font-sans">Titular:</strong> Comercial Kira SpA</div>
                      <div><strong className="font-sans">Email:</strong> pagos@patitasdelsur.cl</div>
                      <div><strong className="font-sans">Asunto:</strong> Pedido {completedOrder.id}</div>
                    </div>

                    <a
                      href={`https://wa.me/56987654321?text=Hola%20Patitas%20del%20Sur%2C%20adjunto%20comprobante%20de%20mi%20pedido%20${completedOrder.id}%20por%20${encodeURIComponent(formatCLP(completedOrder.total))}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-sm"
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span>Enviar Comprobante por WhatsApp</span>
                    </a>
                  </div>
                ) : (
                  <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-2xl text-xs text-blue-900 space-y-1">
                    <p className="font-bold flex items-center gap-1.5">
                      <CreditCard className="w-4 h-4 text-blue-600" />
                      <span>Pago registrado con éxito</span>
                    </p>
                    <p className="text-[11px] text-blue-700">
                      Tu pedido ya está siendo preparado en bodega para el despacho programado.
                    </p>
                  </div>
                )}

              </div>

              {/* Botón de Finalizar */}
              <button
                onClick={handleCloseAndFinish}
                className="w-full py-3.5 rounded-2xl bg-[#0E8388] hover:bg-[#10B981] text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg transition-transform active:scale-95 cursor-pointer mt-4"
              >
                <span>FINALIZAR Y SEGUIR EXPLORANDO</span>
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
