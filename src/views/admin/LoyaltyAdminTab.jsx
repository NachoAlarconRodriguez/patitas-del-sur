import React, { useState, useEffect, useMemo } from 'react';
import {
  Award,
  Sparkles,
  Save,
  RefreshCw,
  Search,
  Filter,
  Check,
  CheckCircle2,
  Clock,
  Copy,
  Plus,
  Minus,
  User,
  DollarSign,
  Ticket,
  ShoppingBag,
  AlertCircle,
  ExternalLink,
  Users,
  Trophy,
  Phone,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Sliders,
  Star,
  MessageCircle,
} from 'lucide-react';
import {
  getLoyaltySettings,
  saveLoyaltySettings,
  getAllRedemptionsWithAudit,
  DEFAULT_LOYALTY_SETTINGS,
} from '../../services/loyaltyService';
import { updateCustomerPoints } from '../../services/customersService';

export default function LoyaltyAdminTab({ customers = [], orders = [] }) {
  // Configuración de reglas y niveles
  const [settings, setSettings] = useState(DEFAULT_LOYALTY_SETTINGS);
  const [isLoadingSettings, setIsLoadingSettings] = useState(true);
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');

  // Auditoría de canjes
  const [redemptions, setRedemptions] = useState([]);
  const [isLoadingRedemptions, setIsLoadingRedemptions] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos'); // 'todos', 'activo', 'utilizado'
  const [copiedCode, setCopiedCode] = useState(null);

  // Ajuste manual de puntos (CRM)
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [pointsAdjustment, setPointsAdjustment] = useState('');
  const [adjustmentReason, setAdjustmentReason] = useState('');
  const [isAdjusting, setIsAdjusting] = useState(false);
  const [adjustSuccessMsg, setAdjustSuccessMsg] = useState('');
  const [adjustErrorMsg, setAdjustErrorMsg] = useState('');

  // Búsqueda, filtros y orden de clientes
  const [customerSearch, setCustomerSearch] = useState('');
  const [pointsFilter, setPointsFilter] = useState('todos'); // 'todos' | 'con_puntos' | 'sin_puntos' | 'canje_listo'
  const [sortBy, setSortBy] = useState('points_desc'); // 'points_desc' | 'points_asc' | 'name_asc' | 'orders_desc'
  const [customersPage, setCustomersPage] = useState(1);
  const CUSTOMERS_PER_PAGE = 8;

  // Cargar configuración de fidelización desde Supabase
  const loadSettings = async () => {
    setIsLoadingSettings(true);
    try {
      const data = await getLoyaltySettings();
      setSettings(data);
    } catch (err) {
      console.error('Error loading loyalty settings:', err);
    } finally {
      setIsLoadingSettings(false);
    }
  };

  // Cargar auditoría de canjes enriquecida
  const loadRedemptions = async () => {
    setIsLoadingRedemptions(true);
    try {
      const data = await getAllRedemptionsWithAudit();
      setRedemptions(data);
    } catch (err) {
      console.error('Error loading redemptions:', err);
    } finally {
      setIsLoadingRedemptions(false);
    }
  };

  useEffect(() => {
    loadSettings();
    loadRedemptions();
  }, []);

  // Guardar configuración
  const handleSaveSettings = async (e) => {
    e?.preventDefault();
    setIsSavingSettings(true);
    setSaveSuccessMsg('');
    try {
      const res = await saveLoyaltySettings(settings);
      if (res.success) {
        setSaveSuccessMsg('✓ ¡Configuración guardada exitosamente en la tienda!');
        setTimeout(() => setSaveSuccessMsg(''), 4000);
      } else {
        alert('Error al guardar: ' + res.error);
      }
    } catch (err) {
      alert('Error inesperado al guardar configuración.');
    } finally {
      setIsSavingSettings(false);
    }
  };

  // Actualizar un nivel específico
  const handleTierChange = (index, field, value) => {
    setSettings((prev) => {
      const updatedTiers = [...prev.tiers];
      const currentTier = updatedTiers[index] || {};
      const parsedValue = field === 'points' || field === 'discountAmount' ? Number(value) || 0 : value;
      const updatedTier = {
        ...currentTier,
        [field]: parsedValue,
      };

      if (field === 'discountAmount') {
        updatedTier.title = `Cupón $${parsedValue.toLocaleString('es-CL')} CLP Dcto.`;
        updatedTier.description = `Aplica $${parsedValue.toLocaleString('es-CL')} de descuento directo en el total de tu próxima compra.`;
      }

      updatedTiers[index] = updatedTier;
      return { ...prev, tiers: updatedTiers };
    });
  };

  // Aplicar ajuste manual de puntos
  const handleApplyAdjustment = async (e) => {
    e?.preventDefault();
    setAdjustSuccessMsg('');
    setAdjustErrorMsg('');

    if (!selectedCustomerId) {
      setAdjustErrorMsg('Por favor selecciona un cliente.');
      return;
    }
    const delta = Number(pointsAdjustment);
    if (!delta || isNaN(delta)) {
      setAdjustErrorMsg('Ingresa una cantidad válida de puntos (positiva para sumar, negativa para restar).');
      return;
    }

    setIsAdjusting(true);
    try {
      const res = await updateCustomerPoints(selectedCustomerId, delta);
      if (res.success) {
        const targetCust = customers.find((c) => c.id === selectedCustomerId);
        setAdjustSuccessMsg(
          `✓ Se ${delta > 0 ? 'sumaron' : 'restaron'} ${Math.abs(delta)} Pts a ${
            targetCust?.name || targetCust?.full_name || 'Cliente'
          }. Nuevo saldo: ${res.points} Pts.`
        );
        setPointsAdjustment('');
        setAdjustmentReason('');
        loadRedemptions();
        window.dispatchEvent(new Event('patitas_customer_updated'));
      } else {
        setAdjustErrorMsg('No se pudo actualizar los puntos.');
      }
    } catch (err) {
      setAdjustErrorMsg('Error en el servidor al actualizar puntos.');
    } finally {
      setIsAdjusting(false);
    }
  };

  // Copiar código al portapapeles
  const handleCopyCode = (code) => {
    if (!code) return;
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  // Estadísticas Calculadas
  const totalCustomerPoints = useMemo(() => {
    return customers.reduce((acc, c) => acc + (Number(c.points) || 0), 0);
  }, [customers]);

  const activeCouponsCount = useMemo(() => {
    return redemptions.filter((r) => r.status === 'activo').length;
  }, [redemptions]);

  const usedCouponsCount = useMemo(() => {
    return redemptions.filter((r) => r.status === 'utilizado').length;
  }, [redemptions]);

  const totalDiscountMoneyRedeemed = useMemo(() => {
    return redemptions
      .filter((r) => r.status === 'utilizado')
      .reduce((acc, r) => acc + (Number(r.discountAmount) || 0), 0);
  }, [redemptions]);

  // Filtrado de la tabla de auditoría
  const filteredRedemptions = useMemo(() => {
    return redemptions.filter((r) => {
      const matchStatus = statusFilter === 'todos' || r.status === statusFilter;
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        r.customerName?.toLowerCase().includes(q) ||
        r.customerPhone?.toLowerCase().includes(q) ||
        r.couponCode?.toLowerCase().includes(q);
      return matchStatus && matchSearch;
    });
  }, [redemptions, statusFilter, searchQuery]);

  const selectedCustomerObj = customers.find((c) => c.id === selectedCustomerId);

  // Niveles activos de canje ordenados
  const activeTiers = useMemo(() => {
    return (settings.tiers || [])
      .filter((t) => t.active !== false)
      .sort((a, b) => (Number(a.points) || 0) - (Number(b.points) || 0));
  }, [settings.tiers]);

  const minRedeemTier = activeTiers[0] || null;

  const maxTierPoints = useMemo(() => {
    if (!activeTiers || activeTiers.length === 0) return 500;
    return Number(activeTiers[activeTiers.length - 1].points) || 500;
  }, [activeTiers]);

  const getCustomerTierInfo = (points) => {
    const pts = Number(points) || 0;
    const qualified = [...activeTiers].reverse().find((t) => pts >= t.points);
    const nextTier = activeTiers.find((t) => pts < t.points);

    let badgeName = 'Miembro';
    let badgeColor = 'bg-slate-100 text-slate-700 border-slate-200';
    let badgeIcon = '🐾';

    if (pts >= 300) {
      badgeName = 'Nivel Oro';
      badgeColor = 'bg-amber-100 text-amber-900 border-amber-300';
      badgeIcon = '🥇';
    } else if (pts >= 200) {
      badgeName = 'Nivel Plata';
      badgeColor = 'bg-slate-200 text-slate-800 border-slate-300';
      badgeIcon = '🥈';
    } else if (pts >= 100) {
      badgeName = 'Nivel Bronce';
      badgeColor = 'bg-orange-100 text-orange-900 border-orange-300';
      badgeIcon = '🥉';
    }

    return {
      pts,
      qualified,
      nextTier,
      badgeName,
      badgeColor,
      badgeIcon,
      canRedeem: !!qualified,
    };
  };

  const processedCustomers = useMemo(() => {
    let list = (customers || []).map((c) => {
      const pts = Number(c.points) || Number(c.loyalty_points) || Number(c.loyaltyPoints) || 0;
      const tierInfo = getCustomerTierInfo(pts);

      const cleanPhoneDigits = String(c.phone || '').replace(/\D/g, '');
      const custOrders = (orders || []).filter((o) => {
        if (o.customerId && c.id && o.customerId === c.id) return true;
        if (cleanPhoneDigits.length >= 8 && o.customerPhone) {
          const oPhoneDigits = String(o.customerPhone).replace(/\D/g, '');
          return oPhoneDigits.includes(cleanPhoneDigits.slice(-8));
        }
        return false;
      });

      const calculatedOrdersCount = custOrders.length || Number(c.ordersCount) || Number(c.orders_count) || 0;
      const calculatedTotalSpent = custOrders.reduce((acc, o) => acc + (Number(o.total) || 0), 0) || Number(c.totalSpent) || Number(c.total_spent) || 0;

      return {
        ...c,
        effectiveName: c.name || c.full_name || 'Cliente sin nombre',
        effectivePhone: c.phone || '',
        effectiveEmail: c.email || '',
        effectivePets: c.petsSummary || (Array.isArray(c.pets) ? c.pets.map((p) => p.name || p).join(', ') : ''),
        points: pts,
        tierInfo,
        calculatedOrdersCount,
        calculatedTotalSpent,
      };
    });

    // Búsqueda
    const q = customerSearch.toLowerCase().trim();
    if (q) {
      list = list.filter((c) => {
        return (
          c.effectiveName.toLowerCase().includes(q) ||
          c.effectivePhone.toLowerCase().includes(q) ||
          c.effectiveEmail.toLowerCase().includes(q) ||
          c.effectivePets.toLowerCase().includes(q)
        );
      });
    }

    // Filtro por puntos
    if (pointsFilter === 'con_puntos') {
      list = list.filter((c) => c.points > 0);
    } else if (pointsFilter === 'sin_puntos') {
      list = list.filter((c) => c.points === 0);
    } else if (pointsFilter === 'canje_listo') {
      list = list.filter((c) => c.tierInfo.canRedeem);
    }

    // Ordenamiento
    if (sortBy === 'points_desc') {
      list.sort((a, b) => b.points - a.points);
    } else if (sortBy === 'points_asc') {
      list.sort((a, b) => a.points - b.points);
    } else if (sortBy === 'name_asc') {
      list.sort((a, b) => a.effectiveName.localeCompare(b.effectiveName));
    } else if (sortBy === 'orders_desc') {
      list.sort((a, b) => b.calculatedOrdersCount - a.calculatedOrdersCount);
    }

    return list;
  }, [customers, orders, customerSearch, pointsFilter, sortBy, activeTiers]);

  // Paginación
  const totalCustomerPages = Math.max(1, Math.ceil(processedCustomers.length / CUSTOMERS_PER_PAGE));
  const paginatedCustomers = useMemo(() => {
    const start = (customersPage - 1) * CUSTOMERS_PER_PAGE;
    return processedCustomers.slice(start, start + CUSTOMERS_PER_PAGE);
  }, [processedCustomers, customersPage]);

  // Reseteo de página si cambia filtro o búsqueda
  useEffect(() => {
    setCustomersPage(1);
  }, [customerSearch, pointsFilter, sortBy]);

  const withPointsCount = useMemo(() => {
    return (customers || []).filter((c) => (Number(c.points) || Number(c.loyalty_points) || 0) > 0).length;
  }, [customers]);

  const zeroPointsCount = useMemo(() => {
    return (customers || []).filter((c) => (Number(c.points) || Number(c.loyalty_points) || 0) === 0).length;
  }, [customers]);

  const canRedeemCount = useMemo(() => {
    if (!minRedeemTier) return 0;
    return (customers || []).filter((c) => (Number(c.points) || Number(c.loyalty_points) || 0) >= minRedeemTier.points).length;
  }, [customers, minRedeemTier]);

  const handleSelectCustomerForAdjustment = (customerId) => {
    setSelectedCustomerId(customerId);
    setAdjustSuccessMsg('');
    setAdjustErrorMsg('');
    const el = document.getElementById('crm-adjustment-tool');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el.classList.add('ring-4', 'ring-[#0E8388]/30');
      setTimeout(() => el.classList.remove('ring-4', 'ring-[#0E8388]/30'), 2500);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      
      {/* 1. TARJETAS DE ESTADÍSTICAS Y KPIS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Puntos en Circulación */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 block">
              Puntos en Clientes
            </span>
            <span className="text-2xl font-black text-[#0A3E40] block mt-1">
              {totalCustomerPoints.toLocaleString('es-CL')} PTS
            </span>
            <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">
              Saldo acumulado en {customers.length} tutores
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 shadow-xs">
            <Award className="w-6 h-6" />
          </div>
        </div>

        {/* KPI 2: Cupones Activos por Cobrar */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-black uppercase tracking-wider text-amber-600 block">
              Cupones Activos
            </span>
            <span className="text-2xl font-black text-slate-900 block mt-1">
              {activeCouponsCount}
            </span>
            <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">
              Listos en billetera de clientes
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 shadow-xs">
            <Ticket className="w-6 h-6" />
          </div>
        </div>

        {/* KPI 3: Descuentos Utilizados */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-black uppercase tracking-wider text-emerald-600 block">
              Cupones Cobrados
            </span>
            <span className="text-2xl font-black text-slate-900 block mt-1">
              {usedCouponsCount}
            </span>
            <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">
              Aplicados en ventas reales
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 shadow-xs">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        {/* KPI 4: Monto Total Bonificado */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 block">
              Total Bonificado
            </span>
            <span className="text-2xl font-black text-teal-800 block mt-1">
              ${totalDiscountMoneyRedeemed.toLocaleString('es-CL')}
            </span>
            <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">
              En descuentos en dinero efectivo
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700 shadow-xs">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* 2. CONFIGURADOR DE REGLAS & PREMIOS EDITABLE */}
      <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#0A3E40] text-white flex items-center justify-center shadow-md">
              <Sparkles className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black text-slate-900">
                  Reglas de Fidelización & Premios en Dinero
                </h3>
                <span className="text-[10px] font-black uppercase bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-300">
                  En Vivo
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                Configura cuántos puntos ganan tus clientes y el monto en efectivo ($ CLP) que descuenta cada cupón.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {saveSuccessMsg && (
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 animate-in fade-in">
                {saveSuccessMsg}
              </span>
            )}
            <button
              type="button"
              onClick={handleSaveSettings}
              disabled={isSavingSettings}
              className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-[#0A3E40] to-[#0E8388] text-white font-black text-xs shadow-md transition-all hover:scale-105 active:scale-95 flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Save className="w-4 h-4 text-amber-300" />
              <span>{isSavingSettings ? 'Guardando...' : 'Guardar Cambios'}</span>
            </button>
          </div>
        </div>

        {/* Regla de Acumulación Base */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-teal-50/60 via-emerald-50/40 to-slate-50 border border-teal-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-xs font-black text-[#0A3E40] uppercase tracking-wider block">
              Regla de Acumulación Base
            </span>
            <p className="text-xs text-slate-600 font-medium">
              Por cada $1.000 CLP gastados en un pedido completado, el cliente recibe esta cantidad de puntos:
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-xs font-bold text-slate-600">1 Punto x cada $</span>
              <input
                type="number"
                min="100"
                step="100"
                value={settings.pointsPerThousand === 1 ? 1000 : Math.round(1000 / (settings.pointsPerThousand || 1))}
                onChange={(e) => {
                  const val = Number(e.target.value) || 1000;
                  setSettings((prev) => ({
                    ...prev,
                    pointsPerThousand: val <= 500 ? 2 : 1,
                  }));
                }}
                className="w-20 px-2 py-1 text-xs font-mono font-black text-center text-[#0A3E40] bg-slate-50 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0E8388]"
              />
              <span className="text-xs font-bold text-slate-600">CLP</span>
            </div>
            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100/80 px-2.5 py-1 rounded-lg">
              {settings.pointsPerThousand === 1 ? '1 Pts x $1.000' : '2 Pts x $1.000 (Puntos Dobles)'}
            </span>
          </div>
        </div>

        {/* Grid de los 4 Niveles de Canje en Dinero */}
        <div className="space-y-3">
          <span className="text-xs font-black text-slate-700 uppercase tracking-wider block">
            Escalones de Canje (Premios en Dinero Fijo)
          </span>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {settings.tiers?.map((tier, idx) => (
              <div
                key={tier.id || idx}
                className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs hover:border-[#0E8388]/60 transition-all space-y-3"
              >
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{tier.icon || '💵'}</span>
                    <span className="text-xs font-black text-slate-800 uppercase">
                      Nivel {idx + 1}
                    </span>
                  </div>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={tier.active !== false}
                      onChange={(e) => handleTierChange(idx, 'active', e.target.checked)}
                      className="rounded text-[#0E8388] focus:ring-[#0E8388]"
                    />
                    <span className="text-[10px] font-bold text-slate-500">
                      {tier.active !== false ? 'Activo' : 'Pausado'}
                    </span>
                  </label>
                </div>

                {/* Puntos Requeridos */}
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-500 block">
                    Puntos Requeridos
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="10"
                      step="10"
                      value={tier.points}
                      onChange={(e) => handleTierChange(idx, 'points', e.target.value)}
                      className="w-full px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-mono font-black text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0E8388]"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400">
                      PTS
                    </span>
                  </div>
                </div>

                {/* Descuento en Dinero ($ CLP) */}
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-500 block">
                    Descuento en Dinero ($)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                      $
                    </span>
                    <input
                      type="number"
                      min="500"
                      step="500"
                      value={tier.discountAmount}
                      onChange={(e) => handleTierChange(idx, 'discountAmount', e.target.value)}
                      className="w-full pl-7 pr-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-mono font-black text-emerald-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0E8388]"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400">
                      CLP
                    </span>
                  </div>
                </div>

                {/* Retorno Porcentual Estimado */}
                <div className="pt-1 text-[10px] text-slate-500 flex justify-between font-medium">
                  <span>Valor x Punto:</span>
                  <span className="font-bold text-emerald-700">
                    ${Math.round(tier.discountAmount / (tier.points || 1))} CLP / pt
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 3. SALDOS & RANKING DE PUNTOS POR CLIENTE */}
      <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#0A3E40] to-[#0E8388] text-white flex items-center justify-center shadow-md">
              <Trophy className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-slate-900">
                  Saldos & Ranking de Puntos por Cliente
                </h3>
                <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200">
                  {processedCustomers.length} de {customers.length} clientes
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Monitorea el balance acumulado de cada tutor, su nivel en el Club Patitas y su beneficio disponible para canjear.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="text-[11px] font-bold text-slate-400">Ordenar:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0E8388] cursor-pointer"
            >
              <option value="points_desc">⭐ Mayor Saldo de Puntos</option>
              <option value="points_asc">Menor Saldo de Puntos</option>
              <option value="name_asc">Nombre (A - Z)</option>
              <option value="orders_desc">Más Compras Realizadas</option>
            </select>
          </div>
        </div>

        {/* Buscador y Filtros Rápidos */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por tutor, teléfono, email o mascota..."
              value={customerSearch}
              onChange={(e) => setCustomerSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0E8388]"
            />
            {customerSearch && (
              <button
                type="button"
                onClick={() => setCustomerSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕ Limpiar
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1 rounded-xl shrink-0">
            <button
              type="button"
              onClick={() => setPointsFilter('todos')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                pointsFilter === 'todos' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Todos ({customers.length})
            </button>
            <button
              type="button"
              onClick={() => setPointsFilter('con_puntos')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                pointsFilter === 'con_puntos'
                  ? 'bg-emerald-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              🟢 Con Puntos ({withPointsCount})
            </button>
            <button
              type="button"
              onClick={() => setPointsFilter('canje_listo')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                pointsFilter === 'canje_listo'
                  ? 'bg-amber-500 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              🎁 Listos para Canje ({canRedeemCount})
            </button>
            <button
              type="button"
              onClick={() => setPointsFilter('sin_puntos')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                pointsFilter === 'sin_puntos'
                  ? 'bg-slate-700 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Sin Puntos ({zeroPointsCount})
            </button>
          </div>
        </div>

        {/* Listado Minimalista & Visual de Clientes con Barra de Progreso e Hitos */}
        <div className="space-y-3.5">
          {paginatedCustomers.length === 0 ? (
            <div className="p-10 text-center bg-slate-50/50 rounded-3xl border border-dashed border-slate-200 text-slate-400">
              <User className="w-8 h-8 mx-auto mb-2 text-slate-300" />
              <span className="font-bold block text-sm text-slate-600">No se encontraron clientes</span>
              <span className="text-xs">Prueba ajustando los filtros o el texto de búsqueda.</span>
            </div>
          ) : (
            paginatedCustomers.map((c, index) => {
              const initials = (c.effectiveName || 'C')
                .split(' ')
                .filter(Boolean)
                .slice(0, 2)
                .map((n) => n[0]?.toUpperCase())
                .join('') || 'C';

              const cleanPhone = String(c.effectivePhone || '').replace(/\D/g, '');
              const waNumber = cleanPhone.startsWith('56')
                ? cleanPhone
                : cleanPhone.length === 9
                ? `56${cleanPhone}`
                : cleanPhone;

              const progressPct = Math.min(100, Math.max(0, Math.round((c.points / maxTierPoints) * 100)));

              return (
                <div
                  key={c.id || index}
                  className="bg-white hover:bg-slate-50/60 p-4 sm:p-5 rounded-3xl border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-[#0E8388]/30 transition-all space-y-4"
                >
                  {/* Fila Superior: Nombre del Cliente primero + Badges + Saldo + Botón Ajustar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    
                    {/* Identidad del Cliente: Nombre primero y destacado */}
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div
                        className={`w-11 h-11 rounded-2xl flex items-center justify-center font-black text-xs shrink-0 shadow-2xs ${
                          c.points >= 350
                            ? 'bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 font-bold'
                            : c.points >= 100
                            ? 'bg-gradient-to-br from-[#0A3E40] to-[#0E8388] text-white'
                            : 'bg-slate-100 text-slate-600 border border-slate-200'
                        }`}
                      >
                        {initials}
                      </div>

                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="font-black text-slate-900 text-sm sm:text-base tracking-tight truncate">
                            {c.effectiveName}
                          </h4>
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black border ${c.tierInfo.badgeColor}`}
                          >
                            <span>{c.tierInfo.badgeIcon}</span>
                            <span>{c.tierInfo.badgeName}</span>
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 font-medium mt-0.5">
                          {c.effectivePets && (
                            <span className="inline-flex items-center gap-1 text-slate-700 font-semibold">
                              <span className="text-amber-500">🐾</span>
                              <span>{c.effectivePets}</span>
                            </span>
                          )}
                          {c.effectivePhone && (
                            <span className="inline-flex items-center gap-1 font-mono text-[11px] text-slate-600">
                              <Phone className="w-3 h-3 text-slate-400" />
                              <span>{c.effectivePhone}</span>
                              {cleanPhone && (
                                <a
                                  href={`https://wa.me/${waNumber}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  title="Abrir WhatsApp"
                                  className="text-emerald-600 hover:text-emerald-700"
                                >
                                  <MessageCircle className="w-3.5 h-3.5" />
                                </a>
                              )}
                            </span>
                          )}
                          <span className="text-slate-300">·</span>
                          <span className="text-slate-400 text-[11px]">
                            {c.calculatedOrdersCount} {c.calculatedOrdersCount === 1 ? 'pedido' : 'pedidos'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Saldo de Puntos & Acción Rápida CRM */}
                    <div className="flex items-center gap-3 shrink-0 self-end sm:self-auto">
                      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-slate-50 border border-slate-200">
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Saldo:</span>
                        <span className="font-mono font-black text-sm text-[#0A3E40]">
                          {c.points.toLocaleString('es-CL')}
                        </span>
                        <span className="text-[11px] font-bold text-slate-500">PTS</span>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleSelectCustomerForAdjustment(c.id)}
                        className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-[#0A3E40] text-slate-700 hover:text-white font-bold text-xs transition-all inline-flex items-center gap-1 shadow-2xs hover:shadow-xs active:scale-95 cursor-pointer"
                        title="Ajustar saldo en herramienta CRM"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Ajustar Puntos</span>
                      </button>
                    </div>
                  </div>

                  {/* Fila Inferior: Barra de Progreso con Hitos Alcanzados y por Alcanzar */}
                  <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-50/70 border border-slate-200/60 space-y-2">
                    
                    {/* Cabecera del Progreso: Resumen de Estado */}
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                      <div className="flex items-center gap-1.5">
                        {c.tierInfo.canRedeem ? (
                          <span className="text-emerald-700 font-black text-xs flex items-center gap-1">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                            <span>Cupón ${c.tierInfo.qualified.discountAmount.toLocaleString('es-CL')} CLP listo para canjear en tienda</span>
                          </span>
                        ) : c.tierInfo.nextTier ? (
                          <span className="text-slate-600 font-medium text-xs flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                            <span>
                              Faltan <strong className="text-slate-900 font-black">{c.tierInfo.nextTier.points - c.points} pts</strong> para desbloquear Cupón ${c.tierInfo.nextTier.discountAmount.toLocaleString('es-CL')} CLP
                            </span>
                          </span>
                        ) : (
                          <span className="text-slate-400 italic text-xs">Sin niveles configurados</span>
                        )}
                      </div>

                      <div className="text-[11px] font-bold text-slate-400 font-mono">
                        Progreso: <span className="text-slate-700 font-black">{progressPct}%</span> hacia meta máx. ({maxTierPoints} pts)
                      </div>
                    </div>

                    {/* Pista Visual de Hitos con Línea Continua y Nodos Escalados */}
                    <div className="pt-6 pb-6 px-4 sm:px-6 relative">
                      {/* Línea Base de Fondo */}
                      <div className="h-2.5 bg-slate-200/80 rounded-full relative overflow-hidden">
                        {/* Línea Llena con Gradiente */}
                        <div
                          className="h-full bg-gradient-to-r from-[#0E8388] via-emerald-400 to-amber-400 rounded-full transition-all duration-500 ease-out"
                          style={{ width: `${progressPct}%` }}
                        />
                      </div>

                      {/* Nodos de Hitos Posicionados a lo largo de la barra */}
                      <div className="absolute inset-x-4 sm:inset-x-6 top-1/2 -translate-y-1/2 pointer-events-none">
                        {activeTiers.map((tier, idx) => {
                          const isReached = c.points >= tier.points;
                          const isNext = !isReached && (idx === 0 || c.points >= activeTiers[idx - 1].points);
                          // Posición porcentual sobre la barra
                          const posPct = Math.min(100, Math.max(0, (tier.points / maxTierPoints) * 100));

                          return (
                            <div
                              key={tier.id || idx}
                              className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-auto"
                              style={{ left: `${posPct}%` }}
                            >
                              {/* Etiqueta Superior del Hito (Premio en Dinero) */}
                              <div className="absolute -top-7 whitespace-nowrap text-center">
                                {isReached ? (
                                  <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black border border-emerald-300 shadow-2xs">
                                    <Check className="w-2.5 h-2.5 text-emerald-600 stroke-[3]" />
                                    <span>${tier.discountAmount.toLocaleString('es-CL')}</span>
                                  </span>
                                ) : isNext ? (
                                  <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[10px] font-black border border-amber-300 shadow-2xs animate-bounce">
                                    <Star className="w-2.5 h-2.5 fill-amber-500 text-amber-500" />
                                    <span>${tier.discountAmount.toLocaleString('es-CL')}</span>
                                  </span>
                                ) : (
                                  <span className="text-[10px] font-bold text-slate-400">
                                    ${tier.discountAmount.toLocaleString('es-CL')}
                                  </span>
                                )}
                              </div>

                              {/* Nodo Circular (Pin) */}
                              <div
                                className={`w-5 h-5 rounded-full flex items-center justify-center transition-all shadow-xs ${
                                  isReached
                                    ? 'bg-emerald-500 text-white ring-4 ring-white shadow-emerald-500/30'
                                    : isNext
                                    ? 'bg-amber-400 text-slate-950 ring-4 ring-amber-100 font-black text-[9px] shadow-amber-400/30'
                                    : 'bg-white border-2 border-slate-300 ring-2 ring-slate-100 text-slate-400'
                                }`}
                                title={`${tier.title}: ${tier.points} puntos`}
                              >
                                {isReached ? (
                                  <Check className="w-3 h-3 stroke-[3]" />
                                ) : (
                                  <span className="text-[9px]">{tier.icon || '•'}</span>
                                )}
                              </div>

                              {/* Etiqueta Inferior del Hito (Puntos Requeridos) */}
                              <div className="absolute -bottom-5 whitespace-nowrap text-center">
                                <span
                                  className={`text-[10px] font-mono font-bold ${
                                    isReached
                                      ? 'text-emerald-700 font-black'
                                      : isNext
                                      ? 'text-amber-800 font-black'
                                      : 'text-slate-400'
                                  }`}
                                >
                                  {tier.points} pts
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Paginación */}
        {totalCustomerPages > 1 && (
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
            <span className="text-slate-500 font-medium">
              Página <strong className="text-slate-800">{customersPage}</strong> de <strong className="text-slate-800">{totalCustomerPages}</strong> ({processedCustomers.length} clientes en total)
            </span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setCustomersPage((p) => Math.max(1, p - 1))}
                disabled={customersPage === 1}
                className="px-3 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 cursor-pointer transition-colors"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Anterior</span>
              </button>
              <button
                type="button"
                onClick={() => setCustomersPage((p) => Math.min(totalCustomerPages, p + 1))}
                disabled={customersPage === totalCustomerPages}
                className="px-3 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 cursor-pointer transition-colors"
              >
                <span>Siguiente</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 4. AUDITORÍA DE CANJES EN TIEMPO REAL */}
      <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-black text-slate-900">
                Auditoría de Canjes & Cupones de Clientes
              </h3>
              <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                {filteredRedemptions.length} registros
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Monitorea cada cupón canjeado, el cliente que lo solicitó y el pedido donde se aplicó el descuento.
            </p>
          </div>

          <button
            type="button"
            onClick={loadRedemptions}
            disabled={isLoadingRedemptions}
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-all flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoadingRedemptions ? 'animate-spin' : ''}`} />
            <span>Actualizar</span>
          </button>
        </div>

        {/* Buscador y Filtros */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por cliente, teléfono o código (ej. PTS-)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0E8388]"
            />
          </div>

          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl shrink-0">
            <button
              type="button"
              onClick={() => setStatusFilter('todos')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                statusFilter === 'todos' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Todos
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('activo')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                statusFilter === 'activo'
                  ? 'bg-amber-500 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              🟡 Activos ({activeCouponsCount})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('utilizado')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                statusFilter === 'utilizado'
                  ? 'bg-emerald-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              🟢 Utilizados ({usedCouponsCount})
            </button>
          </div>
        </div>

        {/* Tabla de Auditoría */}
        <div className="overflow-x-auto rounded-2xl border border-slate-200">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-[10px] uppercase font-black tracking-wider text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">Fecha y Hora</th>
                <th className="px-4 py-3">Cliente (Tutor)</th>
                <th className="px-4 py-3 text-center">Puntos Gastados</th>
                <th className="px-4 py-3">Descuento Obtenido</th>
                <th className="px-4 py-3">Código Cupón</th>
                <th className="px-4 py-3 text-center">Estado</th>
                <th className="px-4 py-3">Pedido Aplicado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRedemptions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-400">
                    No se encontraron canjes registrados con estos filtros.
                  </td>
                </tr>
              ) : (
                filteredRedemptions.map((r) => {
                  const isUsed = r.status === 'utilizado';

                  return (
                    <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Fecha */}
                      <td className="px-4 py-3 whitespace-nowrap text-slate-500 font-medium">
                        {r.createdAt
                          ? new Date(r.createdAt).toLocaleString('es-CL', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })
                          : 'Reciente'}
                      </td>

                      {/* Cliente */}
                      <td className="px-4 py-3">
                        <div className="font-extrabold text-slate-900">{r.customerName}</div>
                        <div className="text-[10px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                          <span>{r.customerPhone || 'Sin teléfono'}</span>
                          <span>• Saldo: {r.currentCustomerPoints} Pts</span>
                        </div>
                      </td>

                      {/* Puntos Gastados */}
                      <td className="px-4 py-3 text-center">
                        <span className="font-black text-rose-600 bg-rose-50 px-2 py-0.5 rounded-lg border border-rose-200">
                          -{r.pointsSpent} Pts
                        </span>
                      </td>

                      {/* Descuento */}
                      <td className="px-4 py-3 font-extrabold text-emerald-700">
                        ${(r.discountAmount || 0).toLocaleString('es-CL')} CLP
                      </td>

                      {/* Código Cupón */}
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          onClick={() => handleCopyCode(r.couponCode)}
                          className="font-mono font-black text-slate-800 bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded-lg border border-slate-200/80 flex items-center gap-1.5 cursor-pointer transition-colors"
                          title="Copiar código"
                        >
                          <span>{r.couponCode}</span>
                          <Copy className="w-3 h-3 text-slate-400" />
                          {copiedCode === r.couponCode && (
                            <span className="text-[9px] text-emerald-600 font-bold">¡Copiado!</span>
                          )}
                        </button>
                      </td>

                      {/* Estado */}
                      <td className="px-4 py-3 text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                            isUsed
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : 'bg-amber-100 text-amber-900 border border-amber-300'
                          }`}
                        >
                          {isUsed ? '✓ Utilizado' : '🟡 Activo'}
                        </span>
                      </td>

                      {/* Pedido Asociado */}
                      <td className="px-4 py-3">
                        {r.usedInOrderId ? (
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono font-black text-[#0A3E40] bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200">
                              {r.usedInOrderId}
                            </span>
                            {r.usedInOrderTotal && (
                              <span className="text-[10px] text-slate-500 font-bold">
                                (${Number(r.usedInOrderTotal).toLocaleString('es-CL')})
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-400 italic text-[11px]">En espera de compra</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. HERRAMIENTA CRM: AJUSTE MANUAL DE PUNTOS */}
      <div id="crm-adjustment-tool" className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200 shadow-sm space-y-4 scroll-mt-6 transition-all duration-300">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center shadow-xs">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-black text-slate-900">
              Herramienta CRM: Ajuste Manual de Puntos a Clientes
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Suma puntos de cortesía (por cumpleaños, eventos especiales o compensación) o corrige saldos.
            </p>
          </div>
        </div>

        {adjustSuccessMsg && (
          <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-2xl text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>{adjustSuccessMsg}</span>
          </div>
        )}

        {adjustErrorMsg && (
          <div className="p-3 bg-rose-50 text-rose-800 border border-rose-200 rounded-2xl text-xs font-bold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{adjustErrorMsg}</span>
          </div>
        )}

        <form onSubmit={handleApplyAdjustment} className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
          {/* Selector de Cliente */}
          <div className="sm:col-span-4 space-y-1">
            <label className="text-[11px] font-black uppercase text-slate-500 block">
              Seleccionar Cliente
            </label>
            <select
              value={selectedCustomerId}
              onChange={(e) => setSelectedCustomerId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0E8388]"
            >
              <option value="">-- Elige un tutor / cliente --</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name || c.full_name} ({c.phone || c.email || 'Sin contacto'}) — Saldo: {c.points || 0} Pts
                </option>
              ))}
            </select>
          </div>

          {/* Cantidad de Puntos a Sumar / Restar */}
          <div className="sm:col-span-3 space-y-1">
            <label className="text-[11px] font-black uppercase text-slate-500 block">
              Puntos (+ para sumar / - para restar)
            </label>
            <input
              type="number"
              placeholder="Ej. +50 ó -30"
              value={pointsAdjustment}
              onChange={(e) => setPointsAdjustment(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-mono font-black text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0E8388]"
            />
          </div>

          {/* Motivo del Ajuste */}
          <div className="sm:col-span-3 space-y-1">
            <label className="text-[11px] font-black uppercase text-slate-500 block">
              Motivo o Justificación
            </label>
            <input
              type="text"
              placeholder="Ej. Cortesía por demora / Fidelización"
              value={adjustmentReason}
              onChange={(e) => setAdjustmentReason(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0E8388]"
            />
          </div>

          {/* Botón Aplicar */}
          <div className="sm:col-span-2">
            <button
              type="submit"
              disabled={isAdjusting}
              className="w-full py-2.5 rounded-xl bg-[#0A3E40] hover:bg-[#0E8388] text-white font-black text-xs shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{isAdjusting ? 'Aplicando...' : 'Aplicar Puntos'}</span>
            </button>
          </div>
        </form>

        {selectedCustomerObj && (
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-center justify-between">
            <div>
              <span className="font-bold text-slate-800">
                {selectedCustomerObj.name || selectedCustomerObj.full_name}
              </span>
              <span className="text-slate-500 ml-2">
                (Tel: {selectedCustomerObj.phone || 'N/A'})
              </span>
            </div>
            <div className="font-mono font-black text-[#0A3E40]">
              Saldo actual: {selectedCustomerObj.points || 0} PTS
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
