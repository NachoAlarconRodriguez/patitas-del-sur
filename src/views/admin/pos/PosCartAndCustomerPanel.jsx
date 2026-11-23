import React, { useState, useMemo, useEffect } from 'react';
import {
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  User,
  UserPlus,
  Search,
  Award,
  Ticket,
  Percent,
  X,
  CheckCircle2,
  Loader2,
  CreditCard,
} from 'lucide-react';
import { formatCLP } from '../adminUtils.js';
import { isAdminCustomer } from '../../../utils/adminAuth.js';
import {
  calculatePointsEarned,
  getCustomerRedemptions,
} from '../../../services/loyaltyService.js';
import { upsertCustomerProfile } from '../../../services/customersService.js';

/**
 * Panel derecho del Terminal POS:
 * - Selector de Cliente (Cliente de Paso vs. Cliente Recurrente + Registro rápido)
 * - Club Patitas: saldo, canje directo por tramo y aplicación de cupones PTS-XXXXX existentes
 * - Carrito de ítems, descuento manual opcional y CTA de Cobro (F9)
 */
export default function PosCartAndCustomerPanel({
  cartItems = [],
  inventory = [],
  customers = [],
  loyaltySettings,
  selectedCustomer,
  onSelectCustomer,
  selectedRedeemTier,
  onSelectRedeemTier,
  selectedExistingCoupon,
  onSelectExistingCoupon,
  manualDiscount = 0,
  manualDiscountReason = '',
  onChangeManualDiscount,
  onUpdateQty,
  onRemoveItem,
  onClearCart,
  onOpenCheckout,
  onCustomerCreated,
  disabled = false,
  showToast,
}) {
  const [customerSearch, setCustomerSearch] = useState('');
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [showQuickCreate, setShowQuickCreate] = useState(false);
  const [quickForm, setQuickForm] = useState({ fullName: '', phone: '', email: '', city: 'Frutillar' });
  const [isCreatingCustomer, setIsCreatingCustomer] = useState(false);

  const [showRedeemDrawer, setShowRedeemDrawer] = useState(false);
  const [activeCoupons, setActiveCoupons] = useState([]);
  const [loadingCoupons, setLoadingCoupons] = useState(false);

  const [showManualDiscount, setShowManualDiscount] = useState(false);
  const [discountMode, setDiscountMode] = useState('clp'); // 'clp' | 'pct'
  const [discountInput, setDiscountInput] = useState('');

  // Stock máximo disponible por producto
  const stockById = useMemo(() => {
    const map = new Map();
    inventory.forEach((p) => map.set(p.id, Number(p.stock) || 0));
    return map;
  }, [inventory]);

  const subtotal = useMemo(
    () => cartItems.reduce((acc, it) => acc + (Number(it.price) || 0) * (Number(it.quantity) || 1), 0),
    [cartItems]
  );

  const loyaltyDiscount = selectedRedeemTier
    ? Number(selectedRedeemTier.discountAmount) || 0
    : selectedExistingCoupon
      ? Number(selectedExistingCoupon.discountAmount) || 0
      : 0;

  const totalDiscount = Math.min(subtotal, loyaltyDiscount + (Number(manualDiscount) || 0));
  const finalTotal = Math.max(0, subtotal - totalDiscount);
  const pointsPerThousand = Number(loyaltySettings?.pointsPerThousand) || 1;
  const estimatedPointsEarned = selectedCustomer?.id ? calculatePointsEarned(finalTotal, pointsPerThousand) : 0;

  // Cargar cupones PTS-XXXXX activos del cliente seleccionado
  useEffect(() => {
    let mounted = true;
    if (!selectedCustomer?.id) {
      setActiveCoupons([]);
      return undefined;
    }
    setLoadingCoupons(true);
    getCustomerRedemptions(selectedCustomer.id)
      .then((rows) => {
        if (!mounted) return;
        const tiers = loyaltySettings?.tiers || [];
        const usable = (rows || [])
          .filter((r) => String(r.status || '').toLowerCase() === 'activo' && r.coupon_code)
          .map((r) => {
            const matchedTier = tiers.find((t) => t.id === r.reward_id || Number(t.points) === Number(r.points_spent));
            const discountAmount = matchedTier?.discountAmount || (Number(r.points_spent) || 0) * 10;
            return {
              id: r.id,
              code: r.coupon_code,
              pointsSpent: r.points_spent,
              discountAmount,
              title: matchedTier?.title || `Cupón ${formatCLP(discountAmount)} Dcto.`,
            };
          });
        setActiveCoupons(usable);
      })
      .finally(() => {
        if (mounted) setLoadingCoupons(false);
      });
    return () => {
      mounted = false;
    };
  }, [selectedCustomer?.id, loyaltySettings]);

  const filteredCustomers = useMemo(() => {
    const q = customerSearch.trim().toLowerCase();
    const nonAdmins = (customers || []).filter((c) => !isAdminCustomer(c));
    if (!q) return nonAdmins.slice(0, 8);
    return nonAdmins
      .filter((c) => {
        const name = String(c.full_name || c.name || '').toLowerCase();
        const phone = String(c.phone || '').toLowerCase();
        const email = String(c.email || '').toLowerCase();
        return name.includes(q) || phone.includes(q) || email.includes(q);
      })
      .slice(0, 10);
  }, [customers, customerSearch]);

  const activeTiers = useMemo(
    () => (loyaltySettings?.tiers || []).filter((t) => t.active !== false),
    [loyaltySettings]
  );

  const handleQuickCreateCustomer = async (e) => {
    e.preventDefault();
    if (!quickForm.fullName.trim() || !quickForm.phone.trim()) {
      showToast?.('Ingresa nombre y teléfono del cliente.', 'error');
      return;
    }
    setIsCreatingCustomer(true);
    try {
      const res = await upsertCustomerProfile({
        fullName: quickForm.fullName.trim(),
        phone: quickForm.phone.trim(),
        email: quickForm.email.trim() || '',
        city: quickForm.city || 'Frutillar',
        role: 'cliente',
      });
      if (res?.success && res.customer) {
        onSelectCustomer?.(res.customer);
        onCustomerCreated?.(res.customer);
        setShowQuickCreate(false);
        setQuickForm({ fullName: '', phone: '', email: '', city: 'Frutillar' });
        showToast?.(`Cliente ${res.customer.full_name || quickForm.fullName} creado y vinculado a Club Patitas.`);
      } else {
        showToast?.(res?.error?.message || 'No se pudo crear el cliente.', 'error');
      }
    } finally {
      setIsCreatingCustomer(false);
    }
  };

  const applyManualDiscountInput = () => {
    const num = Math.max(0, Number(discountInput) || 0);
    if (discountMode === 'pct') {
      const pct = Math.min(100, num);
      const clpVal = Math.round((subtotal * pct) / 100);
      onChangeManualDiscount?.(clpVal, `${pct}% descuento caja`);
    } else {
      onChangeManualDiscount?.(Math.min(subtotal, Math.round(num)), manualDiscountReason || 'Descuento manual caja');
    }
    setShowManualDiscount(false);
  };

  return (
    <div className="bg-white border border-[#EAECEF] rounded-3xl p-4 sm:p-5 flex flex-col gap-3.5 h-full min-h-[540px]">
      {/* 1. BLOQUE CLIENTE Y CLUB PATITAS */}
      <div className="rounded-2xl bg-[#F8FAFC] border border-[#EAECEF] p-3 space-y-2.5">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-xs font-extrabold text-[#111827]">
            <User className="w-3.5 h-3.5 text-[#D97706]" />
            <span>Cliente</span>
          </div>
          {selectedCustomer ? (
            <button
              type="button"
              onClick={() => {
                onSelectCustomer?.(null);
                onSelectRedeemTier?.(null);
                onSelectExistingCoupon?.(null);
                setShowRedeemDrawer(false);
              }}
              className="text-[11px] font-bold text-slate-500 hover:text-rose-600 flex items-center gap-1 cursor-pointer"
            >
              <X className="w-3 h-3" />
              <span>Cambiar a de paso</span>
            </button>
          ) : (
            <button
              type="button"
              disabled={disabled}
              onClick={() => setShowQuickCreate((prev) => !prev)}
              className="text-[11px] font-extrabold text-[#D97706] hover:text-[#B45309] flex items-center gap-1 cursor-pointer disabled:opacity-50"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>+ Nuevo cliente</span>
            </button>
          )}
        </div>

        {/* Cliente seleccionado */}
        {selectedCustomer ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2 bg-white rounded-xl p-2.5 border border-[#FDE68A]">
              <div className="min-w-0">
                <div className="text-xs font-extrabold text-[#111827] truncate">
                  {selectedCustomer.full_name || selectedCustomer.name}
                </div>
                <div className="text-[10px] text-slate-500 truncate">
                  {selectedCustomer.phone || 'Sin teléfono'} {selectedCustomer.email ? `· ${selectedCustomer.email}` : ''}
                </div>
              </div>
              <div className="text-right shrink-0">
                <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#FEF3C7] text-[#92400E] text-[11px] font-black tabular-nums">
                  <Award className="w-3 h-3 text-[#D97706]" />
                  <span>{Number(selectedCustomer.points || 0)} pts</span>
                </div>
                {estimatedPointsEarned > 0 && (
                  <div className="text-[10px] font-bold text-emerald-700 mt-0.5 tabular-nums">
                    +{estimatedPointsEarned} pts esta compra
                  </div>
                )}
              </div>
            </div>

            {/* Botón y panel de Canje de Puntos Patitas */}
            <div className="flex items-center justify-between gap-2">
              <button
                type="button"
                disabled={disabled || subtotal <= 0}
                onClick={() => setShowRedeemDrawer((prev) => !prev)}
                className={`flex-1 py-1.5 px-3 rounded-xl text-[11px] font-extrabold flex items-center justify-center gap-1.5 border transition-colors cursor-pointer disabled:opacity-50 ${
                  selectedRedeemTier || selectedExistingCoupon
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                    : 'bg-white border-[#FDE68A] text-[#92400E] hover:bg-[#FEF3C7]/60'
                }`}
              >
                <Ticket className="w-3.5 h-3.5" />
                <span>
                  {selectedRedeemTier
                    ? `Canjeando ${selectedRedeemTier.points} pts (-${formatCLP(selectedRedeemTier.discountAmount)})`
                    : selectedExistingCoupon
                      ? `Cupón ${selectedExistingCoupon.code} (-${formatCLP(selectedExistingCoupon.discountAmount)})`
                      : `Canjear Puntos Patitas${activeCoupons.length > 0 ? ` (${activeCoupons.length} cupón)` : ''}`}
                </span>
              </button>

              {(selectedRedeemTier || selectedExistingCoupon) && (
                <button
                  type="button"
                  onClick={() => {
                    onSelectRedeemTier?.(null);
                    onSelectExistingCoupon?.(null);
                  }}
                  className="p-1.5 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 cursor-pointer"
                  title="Quitar canje de puntos"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {showRedeemDrawer && (
              <div className="p-2.5 rounded-xl bg-white border border-amber-200 space-y-2.5 text-xs">
                {/* Cupones PTS-XXXXX ya existentes */}
                {loadingCoupons ? (
                  <div className="flex items-center gap-2 text-[11px] text-slate-400 py-1">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Buscando cupones activos...</span>
                  </div>
                ) : activeCoupons.length > 0 ? (
                  <div className="space-y-1">
                    <div className="text-[10px] font-extrabold uppercase text-slate-500">
                      Cupones activos del cliente
                    </div>
                    {activeCoupons.map((cp) => {
                      const isSel = selectedExistingCoupon?.code === cp.code;
                      return (
                        <button
                          key={cp.code}
                          type="button"
                          onClick={() => {
                            onSelectRedeemTier?.(null);
                            onSelectExistingCoupon?.(isSel ? null : cp);
                            setShowRedeemDrawer(false);
                          }}
                          className={`w-full p-2 rounded-lg border text-left flex items-center justify-between cursor-pointer transition-colors ${
                            isSel
                              ? 'bg-emerald-50 border-emerald-400 text-emerald-900'
                              : 'bg-slate-50 border-slate-200 hover:border-[#D97706]'
                          }`}
                        >
                          <div>
                            <div className="font-mono font-black text-[11px]">{cp.code}</div>
                            <div className="text-[10px] text-slate-500">{cp.title}</div>
                          </div>
                          <span className="font-black text-emerald-700 tabular-nums">
                            -{formatCLP(cp.discountAmount)}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                ) : null}

                {/* Canje instantáneo por tramo */}
                <div className="space-y-1">
                  <div className="text-[10px] font-extrabold uppercase text-slate-500">
                    Canjear saldo ahora ({Number(selectedCustomer.points || 0)} pts disp.)
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    {activeTiers.map((tier) => {
                      const canAfford = Number(selectedCustomer.points || 0) >= Number(tier.points || 0);
                      const isSel = selectedRedeemTier?.id === tier.id;
                      return (
                        <button
                          key={tier.id}
                          type="button"
                          disabled={!canAfford}
                          onClick={() => {
                            onSelectExistingCoupon?.(null);
                            onSelectRedeemTier?.(isSel ? null : tier);
                            setShowRedeemDrawer(false);
                          }}
                          className={`p-2 rounded-xl border text-left transition-all ${
                            isSel
                              ? 'bg-emerald-50 border-emerald-500 ring-1 ring-emerald-400'
                              : canAfford
                                ? 'bg-[#FAF8F4] border-[#FDE68A] hover:border-[#D97706] cursor-pointer'
                                : 'bg-slate-50 border-slate-200 opacity-45 cursor-not-allowed'
                          }`}
                        >
                          <div className="text-[11px] font-black text-[#111827] tabular-nums">
                            -{formatCLP(tier.discountAmount)}
                          </div>
                          <div className="text-[10px] font-bold text-[#D97706] tabular-nums">
                            {tier.points} pts
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : showQuickCreate ? (
          <form onSubmit={handleQuickCreateCustomer} className="space-y-2 bg-white p-2.5 rounded-xl border border-amber-200">
            <div className="text-[11px] font-extrabold text-[#111827]">Registrar cliente rápido (Club Patitas)</div>
            <input
              type="text"
              required
              placeholder="Nombre y apellido *"
              value={quickForm.fullName}
              onChange={(e) => setQuickForm((p) => ({ ...p, fullName: e.target.value }))}
              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold focus:outline-none focus:border-[#D97706]"
            />
            <div className="grid grid-cols-2 gap-1.5">
              <input
                type="tel"
                required
                placeholder="Teléfono (+56 9...) *"
                value={quickForm.phone}
                onChange={(e) => setQuickForm((p) => ({ ...p, phone: e.target.value }))}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold focus:outline-none focus:border-[#D97706]"
              />
              <input
                type="email"
                placeholder="Email (opcional)"
                value={quickForm.email}
                onChange={(e) => setQuickForm((p) => ({ ...p, email: e.target.value }))}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold focus:outline-none focus:border-[#D97706]"
              />
            </div>
            <div className="flex justify-end gap-1.5 pt-1">
              <button
                type="button"
                onClick={() => setShowQuickCreate(false)}
                className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 text-[11px] font-bold cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isCreatingCustomer}
                className="px-3 py-1 rounded-lg bg-[#D97706] text-white text-[11px] font-extrabold cursor-pointer disabled:opacity-50"
              >
                {isCreatingCustomer ? 'Guardando...' : 'Guardar y seleccionar'}
              </button>
            </div>
          </form>
        ) : (
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              disabled={disabled}
              value={customerSearch}
              onFocus={() => setShowCustomerDropdown(true)}
              onBlur={() => setTimeout(() => setShowCustomerDropdown(false), 180)}
              onChange={(e) => {
                setCustomerSearch(e.target.value);
                setShowCustomerDropdown(true);
              }}
              placeholder="Cliente de paso (o busca cliente recurrente para sumar puntos)..."
              className="w-full pl-8 pr-3 py-2 rounded-xl bg-white border border-[#EAECEF] text-xs font-semibold text-[#111827] placeholder:text-slate-400 focus:outline-none focus:border-[#D97706] disabled:opacity-50"
            />
            {showCustomerDropdown && (
              <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-[#EAECEF] rounded-2xl shadow-xl max-h-52 overflow-y-auto z-30 divide-y divide-slate-100">
                {filteredCustomers.length === 0 ? (
                  <div className="p-3 text-center text-[11px] text-slate-400">
                    Sin coincidencias. Usa &quot;+ Nuevo cliente&quot; arriba.
                  </div>
                ) : (
                  filteredCustomers.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        onSelectCustomer?.(c);
                        setCustomerSearch('');
                        setShowCustomerDropdown(false);
                      }}
                      className="w-full px-3 py-2 text-left hover:bg-[#FAF8F4] flex items-center justify-between gap-2 cursor-pointer"
                    >
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-[#111827] truncate">{c.full_name || c.name}</div>
                        <div className="text-[10px] text-slate-400 truncate">
                          {c.phone || 'Sin teléfono'} {c.email ? `· ${c.email}` : ''}
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded-full bg-[#FEF3C7] text-[#92400E] text-[10px] font-black shrink-0 tabular-nums">
                        {Number(c.points || 0)} pts
                      </span>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* 2. ENCABEZADO CARRITO */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShoppingCart className="w-4 h-4 text-[#D97706]" />
          <span className="text-xs font-extrabold text-[#111827]">
            Detalle de venta ({cartItems.reduce((s, i) => s + (i.quantity || 0), 0)} ítems)
          </span>
        </div>
        {cartItems.length > 0 && (
          <button
            type="button"
            onClick={onClearCart}
            className="text-[11px] font-bold text-slate-400 hover:text-rose-600 flex items-center gap-1 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Vaciar</span>
          </button>
        )}
      </div>

      {/* 3. LISTA DE PRODUCTOS EN CARRITO */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-1 min-h-[160px]">
        {cartItems.length === 0 ? (
          <div className="h-full min-h-[160px] flex flex-col items-center justify-center text-center text-slate-400 border-2 border-dashed border-[#EAECEF] rounded-2xl p-6">
            <ShoppingCart className="w-8 h-8 opacity-30 mb-2" />
            <div className="text-xs font-bold text-slate-500">Escanea o selecciona productos</div>
            <p className="text-[11px] mt-0.5 max-w-[220px]">
              Usa la pistola lectora USB o haz clic en el catálogo para ir sumando a la compra.
            </p>
          </div>
        ) : (
          cartItems.map((item) => {
            const maxStock = stockById.get(item.id) ?? 999;
            const lineTotal = (Number(item.price) || 0) * (Number(item.quantity) || 1);
            return (
              <div
                key={item.id}
                className="p-2.5 rounded-2xl bg-[#F8FAFC] border border-[#EAECEF] flex items-center justify-between gap-2.5"
              >
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-extrabold text-[#111827] leading-snug truncate">
                    {item.name}
                  </div>
                  <div className="text-[10px] text-slate-500 font-semibold tabular-nums">
                    {item.format} · {formatCLP(item.price)} c/u
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => onUpdateQty?.(item.id, item.quantity - 1)}
                    className="w-7 h-7 rounded-xl bg-white border border-[#EAECEF] hover:border-slate-300 flex items-center justify-center text-slate-700 cursor-pointer"
                    aria-label="Restar 1"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-6 text-center text-xs font-black text-[#111827] tabular-nums">
                    {item.quantity}
                  </span>
                  <button
                    type="button"
                    disabled={item.quantity >= maxStock}
                    onClick={() => onUpdateQty?.(item.id, item.quantity + 1)}
                    className="w-7 h-7 rounded-xl bg-white border border-[#EAECEF] hover:border-[#D97706] flex items-center justify-center text-slate-700 cursor-pointer disabled:opacity-40"
                    aria-label="Sumar 1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="text-right min-w-[74px] shrink-0">
                  <div className="text-xs font-black text-[#111827] tabular-nums">
                    {formatCLP(lineTotal)}
                  </div>
                  <button
                    type="button"
                    onClick={() => onRemoveItem?.(item.id)}
                    className="text-[10px] font-bold text-slate-400 hover:text-rose-600 cursor-pointer"
                  >
                    Quitar
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* 4. DESCUENTO MANUAL OPCIONAL + TOTALES + BOTÓN COBRAR */}
      <div className="pt-3 border-t border-[#EAECEF] space-y-2.5">
        {showManualDiscount ? (
          <div className="p-2.5 rounded-2xl bg-[#FAF8F4] border border-[#FDE68A] space-y-2">
            <div className="flex items-center justify-between text-[11px] font-extrabold text-[#111827]">
              <span>Descuento manual en caja</span>
              <div className="flex items-center gap-1">
                {['clp', 'pct'].map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setDiscountMode(m)}
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold cursor-pointer ${
                      discountMode === m ? 'bg-[#D97706] text-white' : 'bg-white text-slate-600 border border-slate-200'
                    }`}
                  >
                    {m === 'clp' ? '$ CLP' : '%'}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <input
                type="number"
                min="0"
                placeholder={discountMode === 'pct' ? 'Ej: 10' : 'Ej: 2000'}
                value={discountInput}
                onChange={(e) => setDiscountInput(e.target.value)}
                className="flex-1 px-2.5 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-mono font-bold focus:outline-none focus:border-[#D97706]"
              />
              <button
                type="button"
                onClick={applyManualDiscountInput}
                className="px-3 py-1.5 rounded-xl bg-[#D97706] text-white text-[11px] font-extrabold cursor-pointer"
              >
                Aplicar
              </button>
              <button
                type="button"
                onClick={() => setShowManualDiscount(false)}
                className="p-1.5 rounded-xl bg-white border border-slate-200 text-slate-500 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between text-[11px]">
            <button
              type="button"
              disabled={disabled || subtotal <= 0}
              onClick={() => {
                setDiscountInput(manualDiscount > 0 ? String(manualDiscount) : '');
                setShowManualDiscount(true);
              }}
              className="inline-flex items-center gap-1 font-bold text-slate-500 hover:text-[#D97706] cursor-pointer disabled:opacity-40"
            >
              <Percent className="w-3.5 h-3.5" />
              <span>{manualDiscount > 0 ? `Editar dcto. manual (-${formatCLP(manualDiscount)})` : 'Agregar descuento manual'}</span>
            </button>
            {manualDiscount > 0 && (
              <button
                type="button"
                onClick={() => onChangeManualDiscount?.(0, '')}
                className="text-rose-600 font-bold hover:underline cursor-pointer"
              >
                Quitar
              </button>
            )}
          </div>
        )}

        <div className="space-y-1 text-xs">
          <div className="flex justify-between text-slate-500 font-semibold">
            <span>Subtotal</span>
            <span className="tabular-nums">{formatCLP(subtotal)}</span>
          </div>
          {loyaltyDiscount > 0 && (
            <div className="flex justify-between text-emerald-700 font-bold">
              <span>Canje Puntos Patitas</span>
              <span className="tabular-nums">-{formatCLP(loyaltyDiscount)}</span>
            </div>
          )}
          {manualDiscount > 0 && (
            <div className="flex justify-between text-amber-700 font-bold">
              <span>Descuento manual</span>
              <span className="tabular-nums">-{formatCLP(manualDiscount)}</span>
            </div>
          )}
          <div className="flex items-baseline justify-between pt-2 border-t border-slate-100">
            <span className="text-sm font-extrabold text-[#111827]">Total a cobrar</span>
            <span className="text-2xl font-black text-[#111827] tabular-nums tracking-tight">
              {formatCLP(finalTotal)}
            </span>
          </div>
        </div>

        <button
          type="button"
          disabled={disabled || cartItems.length === 0}
          onClick={onOpenCheckout}
          className="w-full py-3.5 rounded-2xl bg-[#D97706] hover:bg-[#B45309] text-white font-black text-sm shadow-md shadow-[#D97706]/25 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99] disabled:opacity-45 disabled:cursor-not-allowed"
        >
          <CreditCard className="w-4 h-4" />
          <span>Cobrar {formatCLP(finalTotal)}</span>
          <span className="px-1.5 py-0.5 rounded-md bg-white/20 text-[10px] font-bold">F9</span>
        </button>

        {selectedCustomer && estimatedPointsEarned > 0 && (
          <div className="flex items-center justify-center gap-1.5 text-[11px] font-bold text-emerald-700">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>
              {selectedCustomer.full_name?.split(' ')[0]} acumulará +{estimatedPointsEarned} Puntos Patitas
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
