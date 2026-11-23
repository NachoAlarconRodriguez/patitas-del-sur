import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  ScanBarcode,
  Clock,
  Receipt,
  Printer,
  Monitor,
  AlertTriangle,
  Wallet,
  CheckCircle2,
} from 'lucide-react';
import { formatCLP, getOrderPaymentBreakdown } from '../adminUtils.js';
import { renderPaymentMethodBadge } from '../adminPaymentUI.jsx';
import { getLoyaltySettings, DEFAULT_LOYALTY_SETTINGS } from '../../../services/loyaltyService.js';
import { updateProductInSupabase } from '../../../services/productsService.js';
import {
  resolvePartnerFromAdmin,
  getPartnerByKey,
  openPosCashRegister,
  recordPosCashMovement,
  calculateRegisterReconciliation,
  closePosCashRegister,
  switchPosWorkShift,
  createManualPosWorkShift,
  updatePosWorkShiftDuration,
  completePosSale,
} from '../../../services/posService.js';
import PosCashRegisterBar from './PosCashRegisterBar.jsx';
import PosProductScannerGrid from './PosProductScannerGrid.jsx';
import PosCartAndCustomerPanel from './PosCartAndCustomerPanel.jsx';
import PosCheckoutModal from './PosCheckoutModal.jsx';
import {
  PosOpenRegisterModal,
  PosCashMovementModal,
  PosCloseRegisterModal,
} from './PosCashClosingModal.jsx';
import PosShiftHistoryAndSplitPanel from './PosShiftHistoryAndSplitPanel.jsx';
import {
  getSavedTicketWidthMm,
  saveTicketWidthMm,
  printPosSaleTicket,
  printPosCashClosingReport,
} from './PosTicketReceipt.jsx';

/**
 * Pestaña Principal Terminal POS (Exclusiva para Escritorio)
 * Sub-vistas:
 * 1. Caja / Vender (Escaneo USB + Carrito + Cliente/Puntos + Cobro simple/dividido + Ticket)
 * 2. Turnos, Horas y Reparto (Pozo mensual proporcional + detalle día por día)
 * 3. Cajas y Ventas POS (Historial de aperturas/cierres y reimpresión de tickets)
 */
export default function PosTerminalTab({
  inventory = [],
  customers = [],
  orders = [],
  currentAdminName,
  adminEmail,
  mercadoPagoConfig = {},
  posRegisters = [],
  posShifts = [],
  posMovements = [],
  posMigrationPending = false,
  onReloadPosData,
  onSyncOrders,
  onSyncInventory,
  onSyncCustomers,
  showToast,
}) {
  const [subTab, setSubTab] = useState('vender'); // 'vender' | 'turnos' | 'historial'
  const [cartItems, setCartItems] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [selectedRedeemTier, setSelectedRedeemTier] = useState(null);
  const [selectedExistingCoupon, setSelectedExistingCoupon] = useState(null);
  const [manualDiscount, setManualDiscount] = useState(0);
  const [manualDiscountReason, setManualDiscountReason] = useState('');
  const [loyaltySettings, setLoyaltySettings] = useState(DEFAULT_LOYALTY_SETTINGS);

  const [ticketWidthMm, setTicketWidthMm] = useState(() => getSavedTicketWidthMm());
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isOpenRegModalOpen, setIsOpenRegModalOpen] = useState(false);
  const [isCashMoveModalOpen, setIsCashMoveModalOpen] = useState(false);
  const [isCloseRegModalOpen, setIsCloseRegModalOpen] = useState(false);
  const [isSwitchingShift, setIsSwitchingShift] = useState(false);

  const loggedPartner = useMemo(
    () => resolvePartnerFromAdmin(adminEmail, currentAdminName),
    [adminEmail, currentAdminName]
  );

  useEffect(() => {
    let mounted = true;
    getLoyaltySettings().then((settings) => {
      if (mounted && settings) setLoyaltySettings(settings);
    });
    return () => {
      mounted = false;
    };
  }, []);

  const activeRegister = useMemo(
    () => (posRegisters || []).find((r) => r.status === 'abierta') || null,
    [posRegisters]
  );

  const activeRegisterShifts = useMemo(() => {
    if (!activeRegister) return [];
    return (posShifts || []).filter((s) => s.register_id === activeRegister.id);
  }, [posShifts, activeRegister]);

  const activeShift = useMemo(() => {
    if (!activeRegister) return null;
    return (
      activeRegisterShifts.find((s) => s.status === 'activo') ||
      (posShifts || []).find((s) => s.status === 'activo') ||
      null
    );
  }, [activeRegister, activeRegisterShifts, posShifts]);

  const activeSellerPartner = useMemo(() => {
    if (activeShift?.partner_key) return getPartnerByKey(activeShift.partner_key);
    if (activeRegister?.opened_by_name) {
      return resolvePartnerFromAdmin(activeRegister.opened_by_email, activeRegister.opened_by_name);
    }
    return loggedPartner;
  }, [activeShift, activeRegister, loggedPartner]);

  const activeReconciliation = useMemo(
    () => calculateRegisterReconciliation(activeRegister, orders, posMovements),
    [activeRegister, orders, posMovements]
  );

  const posOrdersHistory = useMemo(
    () => (orders || []).filter((o) => String(o.channel || '').toLowerCase() === 'pos'),
    [orders]
  );

  // Totales de carrito actual
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

  // Atajo F9 para abrir modal de cobro
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === 'F9' && subTab === 'vender' && activeRegister && cartItems.length > 0 && !isCheckoutOpen) {
        e.preventDefault();
        setIsCheckoutOpen(true);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [subTab, activeRegister, cartItems.length, isCheckoutOpen]);

  const handleChangeTicketWidth = (mm) => {
    const safe = mm === 58 ? 58 : 80;
    setTicketWidthMm(safe);
    saveTicketWidthMm(safe);
  };

  const handleAddProduct = useCallback((prod) => {
    if (!prod?.id) return;
    const price = Number(prod.salePrice ?? prod.price ?? 0);
    const maxStock = Number(prod.stock) || 0;
    if (maxStock <= 0) return;

    setCartItems((prev) => {
      const existing = prev.find((it) => it.id === prod.id);
      if (existing) {
        if (existing.quantity >= maxStock) return prev;
        return prev.map((it) => (it.id === prod.id ? { ...it, quantity: it.quantity + 1 } : it));
      }
      return [
        ...prev,
        {
          id: prod.id,
          name: prod.name,
          brand: prod.brand,
          format: prod.format || prod.weights?.[0] || '1 unidad',
          price,
          quantity: 1,
        },
      ];
    });
  }, []);

  const handleUpdateQty = useCallback((prodId, nextQty) => {
    if (nextQty <= 0) {
      setCartItems((prev) => prev.filter((it) => it.id !== prodId));
      return;
    }
    setCartItems((prev) => prev.map((it) => (it.id === prodId ? { ...it, quantity: nextQty } : it)));
  }, []);

  const handleResetSaleState = useCallback(() => {
    setCartItems([]);
    setSelectedCustomer(null);
    setSelectedRedeemTier(null);
    setSelectedExistingCoupon(null);
    setManualDiscount(0);
    setManualDiscountReason('');
    setIsCheckoutOpen(false);
  }, []);

  const handleAssignBarcode = async (prod, barcodeValue) => {
    const res = await updateProductInSupabase(prod.id, { barcode: barcodeValue });
    if (res?.success) {
      if (res.barcodeMigrationMissing) {
        showToast?.(
          'Falta ejecutar la migración SQL en Supabase para guardar códigos de barras permanentemente.',
          'error'
        );
        return false;
      }
      showToast?.(`Código ${barcodeValue} vinculado a ${prod.name}.`);
      await onSyncInventory?.();
      return true;
    }
    const isDuplicate = String(res?.error?.code || '') === '23505';
    showToast?.(
      isDuplicate
        ? `El código ${barcodeValue} ya está asignado a otro producto.`
        : 'No se pudo asignar el código de barras.',
      'error'
    );
    return false;
  };

  const handleOpenRegister = async ({ openingCash, partnerKey, notes }) => {
    const res = await openPosCashRegister({
      openingCash,
      partner: getPartnerByKey(partnerKey),
      notes,
    });
    if (res.success) {
      setIsOpenRegModalOpen(false);
      await onReloadPosData?.();
      showToast?.(`Caja ${res.register.id} abierta por ${res.register.opened_by_name}. Turno en curso.`);
    } else {
      showToast?.(res.error || 'Error al abrir caja.', 'error');
    }
  };

  const handleCashMovement = async ({ type, amount, reason }) => {
    if (!activeRegister) return;
    const res = await recordPosCashMovement({
      registerId: activeRegister.id,
      type,
      amount,
      reason,
      partner: activeSellerPartner,
    });
    if (res.success) {
      setIsCashMoveModalOpen(false);
      await onReloadPosData?.();
      showToast?.(`${type === 'ingreso' ? 'Ingreso' : 'Retiro'} de ${formatCLP(amount)} registrado en caja.`);
    } else {
      showToast?.(res.error || 'Error al registrar movimiento.', 'error');
    }
  };

  const handleSwitchShift = async (nextPartnerKey) => {
    if (!activeRegister) return;
    setIsSwitchingShift(true);
    try {
      const res = await switchPosWorkShift({
        registerId: activeRegister.id,
        currentShift: activeShift,
        nextPartnerKey,
      });
      if (res.success) {
        await onReloadPosData?.();
        showToast?.(`Relevo completado: ahora atiende ${res.shift.partner_name}.`);
      } else {
        showToast?.(res.error || 'No se pudo realizar el relevo.', 'error');
      }
    } finally {
      setIsSwitchingShift(false);
    }
  };

  const handleCloseRegister = async ({ countedCash, notes }) => {
    const res = await closePosCashRegister({
      register: activeRegister,
      countedCash,
      notes,
      closedByPartner: activeSellerPartner,
      orders,
      movements: posMovements,
      activeShifts: activeRegisterShifts,
    });
    if (res.success) {
      await onReloadPosData?.();
      showToast?.(`Caja ${activeRegister.id} cerrada correctamente.`);
    } else {
      showToast?.(res.error || 'Error al cerrar la caja.', 'error');
    }
    return res;
  };

  const handleConfirmSale = async ({ paymentLines, notes }) => {
    const res = await completePosSale({
      cartItems,
      customer: selectedCustomer,
      redeemTier: selectedRedeemTier,
      existingCoupon: selectedExistingCoupon,
      manualDiscount,
      manualDiscountReason,
      paymentLines,
      activeRegister,
      activeShift,
      sellerPartner: activeSellerPartner,
      pointsPerThousand: loyaltySettings?.pointsPerThousand || 1,
      notes,
    });

    if (res.success) {
      await Promise.all([
        onSyncOrders?.(),
        onSyncInventory?.(),
        onSyncCustomers?.(),
        onReloadPosData?.(),
      ]);
      showToast?.(`Venta ${res.order.id} registrada por ${formatCLP(res.order.total)}.`);
    }
    return res;
  };

  const handleCreateManualShift = async (payload) => {
    const res = await createManualPosWorkShift(payload);
    if (res.success) {
      await onReloadPosData?.();
      showToast?.(`Turno manual de ${res.shift.partner_name} registrado.`);
      return true;
    }
    showToast?.(res.error || 'No se pudo guardar el turno manual.', 'error');
    return false;
  };

  const handleUpdateShiftDuration = async (shiftId, payload) => {
    const res = await updatePosWorkShiftDuration(shiftId, payload);
    if (res.success) {
      await onReloadPosData?.();
      showToast?.('Duración del turno actualizada.');
      return true;
    }
    showToast?.(res.error || 'No se pudo actualizar el turno.', 'error');
    return false;
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* Aviso exclusivo para pantallas móviles */}
      <div className="md:hidden bg-white border border-[#EAECEF] rounded-3xl p-6 text-center space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-[#FEF3C7] text-[#D97706] mx-auto flex items-center justify-center">
          <Monitor className="w-6 h-6" />
        </div>
        <h3 className="text-base font-black text-[#111827]">Terminal POS exclusivo para computador</h3>
        <p className="text-xs text-slate-500 leading-relaxed">
          Esta interfaz de caja está diseñada para pantallas de escritorio con pistola lectora USB e impresora térmica.
        </p>
      </div>

      {/* Contenido completo Desktop (md+) */}
      <div className="hidden md:flex flex-col gap-4">
        {/* Aviso si falta correr la migración SQL en Supabase */}
        {posMigrationPending && (
          <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-300 text-amber-950 text-xs flex items-center gap-3">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <div>
              <strong>Migración SQL pendiente en Supabase:</strong> Ejecuta{' '}
              <code className="px-1.5 py-0.5 rounded bg-white border border-amber-200 font-mono text-[11px]">
                supabase/migrations/20261124_pos_terminal_barcodes_and_shifts.sql
              </code>{' '}
              en el SQL Editor de Supabase para sincronizar cajas, turnos y códigos de barras en la nube (mientras tanto se guarda un respaldo local).
            </div>
          </div>
        )}

        {/* Barra superior de Caja y Turno en vivo */}
        <PosCashRegisterBar
          activeRegister={activeRegister}
          activeShift={activeShift}
          reconciliation={activeReconciliation}
          ticketWidthMm={ticketWidthMm}
          onChangeTicketWidth={handleChangeTicketWidth}
          onOpenRegisterModal={() => setIsOpenRegModalOpen(true)}
          onOpenCloseRegisterModal={() => setIsCloseRegModalOpen(true)}
          onOpenCashMovementModal={() => setIsCashMoveModalOpen(true)}
          onSwitchPartnerShift={handleSwitchShift}
          isSwitchingShift={isSwitchingShift}
        />

        {/* Sub-pestañas del Terminal POS */}
        <div className="flex items-center justify-between gap-3">
          <div className="inline-flex items-center p-1 rounded-full bg-white border border-[#EAECEF] shadow-2xs">
            {[
              { id: 'vender', label: 'Caja / Vender', icon: ScanBarcode },
              { id: 'turnos', label: 'Turnos, Horas y Reparto', icon: Clock },
              { id: 'historial', label: `Cajas y Ventas POS (${posOrdersHistory.length})`, icon: Receipt },
            ].map((t) => {
              const Icon = t.icon;
              const isAct = subTab === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setSubTab(t.id)}
                  className={`px-4 py-2 rounded-full text-xs font-extrabold flex items-center gap-2 transition-all cursor-pointer ${
                    isAct
                      ? 'bg-[#D97706] text-white shadow-xs'
                      : 'text-slate-600 hover:text-[#111827]'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{t.label}</span>
                </button>
              );
            })}
          </div>

          {subTab === 'vender' && (
            <div className="text-[11px] text-slate-400 font-semibold">
              Atajos: <kbd className="px-1.5 py-0.5 rounded bg-white border border-slate-200 text-slate-600 font-mono">F2</kbd> Escanear/Buscar ·{' '}
              <kbd className="px-1.5 py-0.5 rounded bg-white border border-slate-200 text-slate-600 font-mono">F9</kbd> Cobrar
            </div>
          )}
        </div>

        {/* SUB-VISTA 1: CAJA / VENDER */}
        {subTab === 'vender' && (
          <div className="grid grid-cols-12 gap-4 items-stretch min-h-[580px]">
            <div className="col-span-7 xl:col-span-7">
              <PosProductScannerGrid
                inventory={inventory}
                cartItems={cartItems}
                disabled={!activeRegister}
                disableGlobalScanner={isCheckoutOpen || isOpenRegModalOpen || isCashMoveModalOpen || isCloseRegModalOpen}
                onAddProduct={handleAddProduct}
                onAssignBarcodeToProduct={handleAssignBarcode}
                showToast={showToast}
              />
            </div>

            <div className="col-span-5 xl:col-span-5">
              <PosCartAndCustomerPanel
                cartItems={cartItems}
                inventory={inventory}
                customers={customers}
                loyaltySettings={loyaltySettings}
                selectedCustomer={selectedCustomer}
                onSelectCustomer={(cust) => {
                  setSelectedCustomer(cust);
                  setSelectedRedeemTier(null);
                  setSelectedExistingCoupon(null);
                }}
                selectedRedeemTier={selectedRedeemTier}
                onSelectRedeemTier={setSelectedRedeemTier}
                selectedExistingCoupon={selectedExistingCoupon}
                onSelectExistingCoupon={setSelectedExistingCoupon}
                manualDiscount={manualDiscount}
                manualDiscountReason={manualDiscountReason}
                onChangeManualDiscount={(val, reason) => {
                  setManualDiscount(val);
                  setManualDiscountReason(reason);
                }}
                onUpdateQty={handleUpdateQty}
                onRemoveItem={(id) => setCartItems((prev) => prev.filter((it) => it.id !== id))}
                onClearCart={handleResetSaleState}
                onOpenCheckout={() => setIsCheckoutOpen(true)}
                onCustomerCreated={() => onSyncCustomers?.()}
                disabled={!activeRegister}
                showToast={showToast}
              />
            </div>
          </div>
        )}

        {/* SUB-VISTA 2: TURNOS, HORAS Y REPARTO MENSUAL */}
        {subTab === 'turnos' && (
          <PosShiftHistoryAndSplitPanel
            orders={orders}
            shifts={posShifts}
            inventory={inventory}
            mercadoPagoConfig={mercadoPagoConfig}
            onCreateManualShift={handleCreateManualShift}
            onUpdateShiftDuration={handleUpdateShiftDuration}
          />
        )}

        {/* SUB-VISTA 3: HISTORIAL DE CAJAS Y VENTAS POS */}
        {subTab === 'historial' && (
          <div className="space-y-5">
            {/* Historial de Cajas Diarias */}
            <div className="bg-white border border-[#EAECEF] rounded-3xl overflow-hidden">
              <div className="p-5 border-b border-[#EAECEF] flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-black text-[#111827] flex items-center gap-2">
                    <Wallet className="w-4 h-4 text-[#D97706]" />
                    <span>Historial de Aperturas y Cierres de Caja ({posRegisters.length})</span>
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Arqueos diarios, fondo inicial, efectivo esperado vs. contado y reimpresión de Cierre Z.
                  </p>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#F8FAFC] text-slate-500 text-[11px] font-bold border-b border-[#EAECEF]">
                    <tr>
                      <th className="py-3 px-4">Caja</th>
                      <th className="py-3 px-4">Estado</th>
                      <th className="py-3 px-4">Abrió / Cerró</th>
                      <th className="py-3 px-4 text-right">Fondo Inicial</th>
                      <th className="py-3 px-4 text-right">Total Ventas</th>
                      <th className="py-3 px-4 text-right">Diferencia Efvo.</th>
                      <th className="py-3 px-4 text-right">Reporte</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EAECEF]">
                    {posRegisters.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-slate-400 font-semibold">
                          Todavía no hay cajas registradas.
                        </td>
                      </tr>
                    ) : (
                      posRegisters.map((reg) => {
                        const liveRec =
                          reg.status === 'abierta'
                            ? calculateRegisterReconciliation(reg, orders, posMovements)
                            : null;
                        const totalSales = liveRec ? liveRec.totalSales : Number(reg.total_sales_amount || 0);
                        const diff = reg.cash_difference;
                        const regShifts = (posShifts || []).filter((s) => s.register_id === reg.id);

                        return (
                          <tr key={reg.id} className="hover:bg-[#F8FAFC]">
                            <td className="py-3 px-4">
                              <div className="font-mono font-bold text-[#D97706]">{reg.id}</div>
                              <div className="text-[10px] text-slate-400">{reg.business_date}</div>
                            </td>
                            <td className="py-3 px-4">
                              {reg.status === 'abierta' ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-extrabold">
                                  <CheckCircle2 className="w-3 h-3" />
                                  Abierta
                                </span>
                              ) : (
                                <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold">
                                  Cerrada
                                </span>
                              )}
                            </td>
                            <td className="py-3 px-4 text-slate-600">
                              <div className="font-bold text-[#111827]">{reg.opened_by_name}</div>
                              {reg.closed_by_name && (
                                <div className="text-[10px] text-slate-400">Cerró: {reg.closed_by_name}</div>
                              )}
                            </td>
                            <td className="py-3 px-4 text-right font-mono tabular-nums">
                              {formatCLP(reg.opening_cash || 0)}
                            </td>
                            <td className="py-3 px-4 text-right font-black text-[#111827] tabular-nums">
                              {formatCLP(totalSales)}
                            </td>
                            <td className="py-3 px-4 text-right font-mono font-bold tabular-nums">
                              {reg.status === 'abierta' ? (
                                <span className="text-slate-400">En curso</span>
                              ) : Number(diff || 0) === 0 ? (
                                <span className="text-emerald-700">$0 (Cuadrada)</span>
                              ) : Number(diff) > 0 ? (
                                <span className="text-amber-700">+{formatCLP(diff)}</span>
                              ) : (
                                <span className="text-rose-600">{formatCLP(diff)}</span>
                              )}
                            </td>
                            <td className="py-3 px-4 text-right">
                              <button
                                type="button"
                                onClick={() =>
                                  printPosCashClosingReport(
                                    reg,
                                    liveRec || calculateRegisterReconciliation(reg, orders, posMovements),
                                    regShifts,
                                    ticketWidthMm
                                  )
                                }
                                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#F8FAFC] hover:bg-[#FEF3C7] border border-[#EAECEF] text-[#111827] text-[11px] font-bold cursor-pointer"
                              >
                                <Printer className="w-3.5 h-3.5 text-[#D97706]" />
                                <span>Cierre Z</span>
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Ventas POS Registradas */}
            <div className="bg-white border border-[#EAECEF] rounded-3xl overflow-hidden">
              <div className="p-5 border-b border-[#EAECEF]">
                <h4 className="text-sm font-black text-[#111827] flex items-center gap-2">
                  <Receipt className="w-4 h-4 text-[#D97706]" />
                  <span>Últimas Ventas Terminal POS ({posOrdersHistory.length})</span>
                </h4>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#F8FAFC] text-slate-500 text-[11px] font-bold border-b border-[#EAECEF]">
                    <tr>
                      <th className="py-3 px-4">N° Venta</th>
                      <th className="py-3 px-4">Fecha / Hora</th>
                      <th className="py-3 px-4">Vendedor</th>
                      <th className="py-3 px-4">Cliente</th>
                      <th className="py-3 px-4">Medio de Pago</th>
                      <th className="py-3 px-4 text-right">Total</th>
                      <th className="py-3 px-4 text-right">Ticket</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EAECEF]">
                    {posOrdersHistory.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-slate-400 font-semibold">
                          Aún no se han registrado ventas en el Terminal POS.
                        </td>
                      </tr>
                    ) : (
                      posOrdersHistory.slice(0, 60).map((ord) => {
                        const breakdown = getOrderPaymentBreakdown(ord);
                        return (
                          <tr key={ord.id} className="hover:bg-[#F8FAFC]">
                            <td className="py-3 px-4 font-mono font-bold text-[#D97706]">{ord.id}</td>
                            <td className="py-3 px-4 text-slate-600 whitespace-nowrap tabular-nums">
                              {ord.date} {ord.time ? `· ${ord.time}` : ''}
                            </td>
                            <td className="py-3 px-4 font-bold text-[#111827]">
                              {ord.soldByName || ord.deliveredByName || 'Socio'}
                            </td>
                            <td className="py-3 px-4">
                              <div className="font-semibold text-[#111827]">{ord.customer}</div>
                              {ord.pointsEarned > 0 && (
                                <div className="text-[10px] font-bold text-emerald-700">
                                  +{ord.pointsEarned} pts
                                </div>
                              )}
                            </td>
                            <td className="py-3 px-4">
                              {renderPaymentMethodBadge(ord.paymentMethod)}
                              {breakdown.length > 1 && (
                                <div className="text-[10px] text-slate-500 mt-1">
                                  {breakdown.map((b) => `${b.method}: ${formatCLP(b.amount)}`).join(' · ')}
                                </div>
                              )}
                            </td>
                            <td className="py-3 px-4 text-right font-black text-[#111827] tabular-nums">
                              {formatCLP(ord.total)}
                            </td>
                            <td className="py-3 px-4 text-right">
                              <button
                                type="button"
                                onClick={() => printPosSaleTicket(ord, ticketWidthMm)}
                                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#F8FAFC] hover:bg-[#FEF3C7] border border-[#EAECEF] text-[#111827] text-[11px] font-bold cursor-pointer"
                              >
                                <Printer className="w-3.5 h-3.5 text-[#D97706]" />
                                <span>Reimprimir</span>
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* MODALES DEL TERMINAL POS */}
      <PosCheckoutModal
        isOpen={isCheckoutOpen}
        totalAmount={finalTotal}
        subtotal={subtotal}
        totalDiscount={totalDiscount}
        selectedCustomer={selectedCustomer}
        selectedRedeemTier={selectedRedeemTier}
        selectedExistingCoupon={selectedExistingCoupon}
        sellerPartner={activeSellerPartner}
        mercadoPagoConfig={mercadoPagoConfig}
        ticketWidthMm={ticketWidthMm}
        onChangeTicketWidth={handleChangeTicketWidth}
        onConfirmSale={handleConfirmSale}
        onClose={() => setIsCheckoutOpen(false)}
        onStartNewSale={handleResetSaleState}
      />

      <PosOpenRegisterModal
        isOpen={isOpenRegModalOpen}
        defaultPartnerKey={loggedPartner.key}
        onConfirmOpen={handleOpenRegister}
        onClose={() => setIsOpenRegModalOpen(false)}
      />

      <PosCashMovementModal
        isOpen={isCashMoveModalOpen}
        onConfirmMovement={handleCashMovement}
        onClose={() => setIsCashMoveModalOpen(false)}
      />

      <PosCloseRegisterModal
        isOpen={isCloseRegModalOpen}
        activeRegister={activeRegister}
        reconciliation={activeReconciliation}
        registerShifts={activeRegisterShifts}
        ticketWidthMm={ticketWidthMm}
        onConfirmClose={handleCloseRegister}
        onClose={() => setIsCloseRegModalOpen(false)}
      />
    </div>
  );
}
