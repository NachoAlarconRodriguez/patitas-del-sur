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
        window.dispatchEvent(new Event('patitas_customers_updated'));
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

  // Filtrar administradores y cruzar con pedidos para que siempre estén todos los clientes reales y sus puntos
  const enrichedCustomers = useMemo(() => {
    const adminEmails = ['ialarconr.684@gmail.com', 'alamirohuertac@hotmail.com', 'admin@patitasdelsur.cl'];
    const adminNames = ['ignacio alarcón', 'ignacio alarcon', 'alamiro huerto', 'alamiro huerta'];
    const isAdmin = (c) => {
      if (!c) return false;
      if (String(c.role || '').toLowerCase() === 'admin') return true;
      const email = String(c.email || '').trim().toLowerCase();
      if (email && adminEmails.includes(email)) return true;
      const name = String(c.name || c.full_name || '').trim().toLowerCase();
      if (name && adminNames.includes(name)) return true;
      return false;
    };

    const baseList = (customers || []).filter((c) => !isAdmin(c));
    const knownNames = new Set(
      baseList.map((c) => String(c.name || c.full_name || '').trim().toLowerCase()).filter(Boolean)
    );
    const knownIds = new Set(baseList.map((c) => String(c.id || '')).filter(Boolean));

    const validOrders = (orders || []).filter((o) => o && o.status !== 'cancelado');
    const extraCustomersMap = new Map();

    for (const o of validOrders) {
      const oName = String(o.customer || o.customer_name || '').trim();
      const normName = oName.toLowerCase();
      if (!oName || normName === 'cliente patitas' || adminNames.includes(normName)) continue;
      if ((o.customerId && knownIds.has(String(o.customerId))) || knownNames.has(normName)) continue;

      if (!extraCustomersMap.has(normName)) {
        extraCustomersMap.set(normName, {
          id: o.customerId || `order-cust-${normName}`,
          name: oName,
          full_name: oName,
          email: o.customerEmail || o.customer_email || '',
          phone: o.customerPhone && o.customerPhone !== '+56 9 9123 4567' ? o.customerPhone : '',
          city: o.city || 'Frutillar',
          address: o.address || '',
          pets: o.petName ? [{ name: o.petName, type: o.petType || 'perro' }] : [],
          petsSummary: o.petName ? `${o.petName} (${o.petType || 'perro'})` : '',
          points: 0,
          totalSpent: 0,
          ordersCount: 0,
          role: 'cliente',
        });
      }
    }

    const fullList = [...baseList, ...Array.from(extraCustomersMap.values())];
    const ptsMultiplier = Number(settings.pointsPerThousand) || 1;

    return fullList.map((c) => {
      const rawPhone = String(c.phone || '').trim();
      const effectivePhone =
        rawPhone === '+56 9 8456 1234' || rawPhone === '+56 9 9123 4567' ? '' : rawPhone;
      const cleanPhoneDigits = effectivePhone.replace(/\D/g, '');
      const normCustName = String(c.name || c.full_name || '').trim().toLowerCase();
      const normCustEmail = String(c.email || '').trim().toLowerCase();

      const custOrders = validOrders.filter((o) => {
        if (o.customerId && c.id && String(o.customerId) === String(c.id)) return true;
        const normOrderName = String(o.customer || o.customer_name || '').trim().toLowerCase();
        if (normCustName && normOrderName && normCustName === normOrderName) return true;
        const normOrderEmail = String(o.customerEmail || o.customer_email || '').trim().toLowerCase();
        if (normCustEmail && normOrderEmail && normCustEmail === normOrderEmail) return true;
        if (cleanPhoneDigits.length >= 8 && o.customerPhone && o.customerPhone !== '+56 9 9123 4567') {
          const oPhoneDigits = String(o.customerPhone).replace(/\D/g, '');
          if (oPhoneDigits.length >= 8 && oPhoneDigits.includes(cleanPhoneDigits.slice(-8))) {
            return true;
          }
        }
        return false;
      });

      const ordersTotalSum = custOrders.reduce((acc, o) => acc + (Number(o.total) || 0), 0);
      const calculatedOrdersCount = Math.max(
        custOrders.length,
        Number(c.ordersCount) || Number(c.orders_count) || 0
      );
      const calculatedTotalSpent = Math.max(
        ordersTotalSum,
        Number(c.totalSpent) || Number(c.total_spent) || 0
      );

      const dbPts = Number(c.points) || Number(c.loyalty_points) || Number(c.loyaltyPoints) || 0;
      const estimatedPtsFromOrders = Math.floor(calculatedTotalSpent / 1000) * ptsMultiplier;
      const pts = dbPts > 0 ? dbPts : estimatedPtsFromOrders;
      const tierInfo = getCustomerTierInfo(pts);

      return {
        ...c,
        effectiveName: c.name || c.full_name || 'Cliente sin nombre',
        effectivePhone,
        effectiveEmail: c.email || '',
        effectivePets:
          c.petsSummary && c.petsSummary !== 'Sin mascotas'
            ? c.petsSummary
            : Array.isArray(c.pets) && c.pets.length > 0
            ? c.pets.map((p) => (p.name ? `${p.name}${p.type ? ` (${p.type})` : ''}` : p)).join(', ')
            : 'Sin mascotas',
        points: pts,
        tierInfo,
        calculatedOrdersCount,
        calculatedTotalSpent,
      };
    });
  }, [customers, orders, settings.pointsPerThousand, activeTiers]);

  // Estadísticas Calculadas
  const totalCustomerPoints = useMemo(() => {
    return enrichedCustomers.reduce((acc, c) => acc + (Number(c.points) || 0), 0);
  }, [enrichedCustomers]);

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

  const selectedCustomerObj = enrichedCustomers.find((c) => c.id === selectedCustomerId);

  const processedCustomers = useMemo(() => {
    let list = [...enrichedCustomers];

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
  }, [enrichedCustomers, customerSearch, pointsFilter, sortBy]);

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
    return enrichedCustomers.filter((c) => c.points > 0).length;
  }, [enrichedCustomers]);

  const zeroPointsCount = useMemo(() => {
    return enrichedCustomers.filter((c) => c.points === 0).length;
  }, [enrichedCustomers]);

  const canRedeemCount = useMemo(() => {
    if (!minRedeemTier) return 0;
    return enrichedCustomers.filter((c) => c.points >= minRedeemTier.points).length;
  }, [enrichedCustomers, minRedeemTier]);

  const handleSelectCustomerForAdjustment = (customerId) => {
    setSelectedCustomerId(customerId);
    setAdjustSuccessMsg('');
    setAdjustErrorMsg('');
    const el = document.getElementById('crm-adjustment-tool');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el.classList.add('ring-4', 'ring-[#F5BA13]/30');
      setTimeout(() => el.classList.remove('ring-4', 'ring-[#F5BA13]/30'), 2500);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* 1. FINSET BENTO KPI ROW */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* KPI 1: Puntos en Circulación */}
        <div className="finset-card bg-white p-5 rounded-3xl border border-[#EAECEF] flex flex-col justify-between">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[13px] font-semibold text-slate-600">Puntos en clientes</span>
            <span className="px-2.5 py-0.5 rounded-full border border-[#EAECEF] bg-[#F8FAFC] text-[10px] font-semibold text-slate-500">
              PTS
            </span>
          </div>
          <div className="my-3 flex items-baseline gap-1">
            <span className="text-[28px] leading-none font-extrabold text-[#111827] tracking-tight">
              {totalCustomerPoints.toLocaleString('es-CL')}
            </span>
            <span className="text-sm font-semibold text-slate-400">pts</span>
          </div>
          <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#EBF5F3] text-[#0E8388] text-[11px] font-bold">
              {enrichedCustomers.length} tutores
            </span>
            <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500">
              <span className="w-6 h-6 rounded-lg bg-[#EBF5F3] text-[#0E8388] flex items-center justify-center">
                <Award className="w-3.5 h-3.5" />
              </span>
              <span>Club Patitas</span>
            </div>
          </div>
        </div>

        {/* KPI 2: Cupones Activos por Cobrar */}
        <div className="finset-card bg-white p-5 rounded-3xl border border-[#EAECEF] flex flex-col justify-between">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[13px] font-semibold text-slate-600">Cupones activos</span>
            <span className="px-2.5 py-0.5 rounded-full border border-[#EAECEF] bg-[#F8FAFC] text-[10px] font-semibold text-slate-500">
              Billetera
            </span>
          </div>
          <div className="my-3 flex items-baseline gap-1.5">
            <span className="text-[28px] leading-none font-extrabold text-[#111827] tracking-tight">
              {activeCouponsCount}
            </span>
            <span className="text-sm font-semibold text-slate-400">disponibles</span>
          </div>
          <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 text-[11px] font-bold">
              Listos para uso
            </span>
            <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500">
              <span className="w-6 h-6 rounded-lg bg-[#EBF5F3] text-[#0E8388] flex items-center justify-center">
                <Ticket className="w-3.5 h-3.5" />
              </span>
              <span>Vigentes</span>
            </div>
          </div>
        </div>

        {/* KPI 3: Descuentos Utilizados */}
        <div className="finset-card bg-white p-5 rounded-3xl border border-[#EAECEF] flex flex-col justify-between">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[13px] font-semibold text-slate-600">Cupones cobrados</span>
            <span className="px-2.5 py-0.5 rounded-full border border-[#EAECEF] bg-[#F8FAFC] text-[10px] font-semibold text-slate-500">
              Ventas
            </span>
          </div>
          <div className="my-3 flex items-baseline gap-1.5">
            <span className="text-[28px] leading-none font-extrabold text-[#111827] tracking-tight">
              {usedCouponsCount}
            </span>
            <span className="text-sm font-semibold text-slate-400">canjeados</span>
          </div>
          <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 text-[11px] font-bold">
              ✓ Aplicados
            </span>
            <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500">
              <span className="w-6 h-6 rounded-lg bg-[#EBF5F3] text-[#0E8388] flex items-center justify-center">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </span>
              <span>Pedidos</span>
            </div>
          </div>
        </div>

        {/* KPI 4: Monto Total Bonificado */}
        <div className="finset-card bg-white p-5 rounded-3xl border border-[#EAECEF] flex flex-col justify-between">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[13px] font-semibold text-slate-600">Total bonificado</span>
            <span className="px-2.5 py-0.5 rounded-full border border-[#EAECEF] bg-[#F8FAFC] text-[10px] font-semibold text-slate-500">
              CLP
            </span>
          </div>
          <div className="my-3 flex items-baseline">
            <span className="text-[28px] leading-none font-extrabold text-[#111827] tracking-tight">
              ${totalDiscountMoneyRedeemed.toLocaleString('es-CL')}
            </span>
            <span className="finset-suffix text-base font-semibold text-slate-300 ml-0.5">.00</span>
          </div>
          <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#EBF5F3] text-[#0E8388] text-[11px] font-bold">
              Ahorro clientes
            </span>
            <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500">
              <span className="w-6 h-6 rounded-lg bg-[#EBF5F3] text-[#0E8388] flex items-center justify-center">
                <DollarSign className="w-3.5 h-3.5" />
              </span>
              <span>Efectivo</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. CONFIGURADOR DE REGLAS & PREMIOS EDITABLE */}
      <div className="finset-card bg-white p-6 sm:p-7 rounded-3xl border border-[#EAECEF] space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-[#EBF5F3] border border-[#CBE4DE] text-[#0E8388] flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-extrabold text-[#111827] tracking-tight">
                  Reglas de fidelización y premios
                </h3>
                <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  En vivo
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium mt-0.5">
                Configura cuántos puntos ganan tus clientes y el monto en dinero ($ CLP) que descuenta cada cupón.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {saveSuccessMsg && (
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3.5 py-1.5 rounded-full border border-emerald-200 animate-in fade-in">
                {saveSuccessMsg}
              </span>
            )}
            <button
              type="button"
              onClick={handleSaveSettings}
              disabled={isSavingSettings}
              className="px-5 py-2.5 rounded-full bg-[#0E8388] hover:bg-[#0c7276] text-white font-bold text-xs shadow-sm shadow-[#0E8388]/20 transition-all active:scale-95 flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isSavingSettings ? 'Guardando...' : 'Guardar cambios'}</span>
            </button>
          </div>
        </div>

        {/* Regla de Acumulación Base */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#F8FAFC] border border-[#EAECEF] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-0.5">
            <span className="text-xs font-bold text-[#111827] block">
              Regla de acumulación base
            </span>
            <p className="text-xs text-slate-500 font-medium">
              Por cada $1.000 CLP gastados en un pedido completado, el cliente recibe esta cantidad de puntos:
            </p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2 bg-white px-3.5 py-1.5 rounded-full border border-[#EAECEF]">
              <span className="text-xs font-semibold text-slate-600">1 punto x cada $</span>
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
                className="w-20 px-2 py-1 text-xs font-mono font-extrabold text-center text-[#111827] bg-[#F8FAFC] rounded-full border border-[#EAECEF] focus:outline-none"
              />
              <span className="text-xs font-semibold text-slate-500">CLP</span>
            </div>
            <span className="text-[11px] font-bold text-[#0E8388] bg-[#EBF5F3] px-3 py-1 rounded-full border border-[#CBE4DE]">
              {settings.pointsPerThousand === 1 ? '1 pt x $1.000' : '2 pts x $1.000 (Puntos dobles)'}
            </span>
          </div>
        </div>

        {/* Grid de los 4 Niveles de Canje en Dinero */}
        <div className="space-y-3">
          <span className="text-xs font-bold text-slate-600 block">
            Escalones de canje (premios en dinero fijo)
          </span>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {settings.tiers?.map((tier, idx) => (
              <div
                key={tier.id || idx}
                className="p-4 rounded-2xl bg-[#F8FAFC]/60 hover:bg-white border border-[#EAECEF] hover:border-[#0E8388]/40 transition-all space-y-3"
              >
                <div className="flex items-center justify-between border-b border-[#EAECEF] pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg bg-[#EBF5F3] flex items-center justify-center text-sm">
                      {tier.icon || '💵'}
                    </span>
                    <span className="text-xs font-extrabold text-[#111827]">
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
                    <span className="text-[10px] font-semibold text-slate-500">
                      {tier.active !== false ? 'Activo' : 'Pausado'}
                    </span>
                  </label>
                </div>

                {/* Puntos Requeridos */}
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-500 block">
                    Puntos requeridos
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="10"
                      step="10"
                      value={tier.points}
                      onChange={(e) => handleTierChange(idx, 'points', e.target.value)}
                      className="w-full px-3 py-1.5 rounded-xl border border-[#EAECEF] bg-white text-xs font-mono font-extrabold text-[#111827] focus:outline-none"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400">
                      PTS
                    </span>
                  </div>
                </div>

                {/* Descuento en Dinero ($ CLP) */}
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-500 block">
                    Descuento en dinero ($)
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
                      className="w-full pl-7 pr-3 py-1.5 rounded-xl border border-[#EAECEF] bg-white text-xs font-mono font-extrabold text-[#0E8388] focus:outline-none"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400">
                      CLP
                    </span>
                  </div>
                </div>

                {/* Retorno Porcentual Estimado */}
                <div className="pt-1 text-[11px] text-slate-400 flex justify-between font-medium">
                  <span>Valor por punto</span>
                  <span className="font-bold text-[#0E8388]">
                    ${Math.round(tier.discountAmount / (tier.points || 1))} CLP/pt
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 3. SALDOS & RANKING DE PUNTOS POR CLIENTE */}
      <div className="finset-card bg-white p-6 sm:p-7 rounded-3xl border border-[#EAECEF] space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-[#EBF5F3] border border-[#CBE4DE] text-[#0E8388] flex items-center justify-center shrink-0">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base sm:text-lg font-extrabold text-[#111827] tracking-tight">
                  Saldos y ranking de puntos por cliente
                </h3>
                <span className="text-[11px] font-semibold text-slate-500 bg-[#F8FAFC] px-2.5 py-0.5 rounded-full border border-[#EAECEF]">
                  {processedCustomers.length} de {enrichedCustomers.length} clientes
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium mt-0.5">
                Monitorea el balance acumulado de cada tutor, su nivel en Club Patitas y su beneficio disponible.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="text-[11px] font-semibold text-slate-400">Ordenar:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3.5 py-1.5 rounded-full border border-[#EAECEF] bg-[#F8FAFC] text-xs font-semibold text-slate-700 focus:bg-white cursor-pointer"
            >
              <option value="points_desc">Mayor saldo de puntos</option>
              <option value="points_asc">Menor saldo de puntos</option>
              <option value="name_asc">Nombre (A - Z)</option>
              <option value="orders_desc">Más compras realizadas</option>
            </select>
          </div>
        </div>

        {/* Buscador y Filtros Rápidos */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por tutor, teléfono, email o mascota..."
              value={customerSearch}
              onChange={(e) => setCustomerSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-full border border-[#EAECEF] bg-[#F8FAFC] focus:bg-white text-xs text-[#111827] placeholder:text-slate-400"
            />
            {customerSearch && (
              <button
                type="button"
                onClick={() => setCustomerSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 hover:text-slate-600 font-bold cursor-pointer"
              >
                ✕ Limpiar
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-1 bg-[#F8FAFC] border border-[#EAECEF] p-1 rounded-full shrink-0">
            <button
              type="button"
              onClick={() => setPointsFilter('todos')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                pointsFilter === 'todos' ? 'bg-[#0E8388] text-white shadow-xs' : 'text-slate-600 hover:text-[#111827]'
              }`}
            >
              Todos ({enrichedCustomers.length})
            </button>
            <button
              type="button"
              onClick={() => setPointsFilter('con_puntos')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                pointsFilter === 'con_puntos'
                  ? 'bg-[#0E8388] text-white shadow-xs'
                  : 'text-slate-600 hover:text-[#111827]'
              }`}
            >
              Con puntos ({withPointsCount})
            </button>
            <button
              type="button"
              onClick={() => setPointsFilter('canje_listo')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                pointsFilter === 'canje_listo'
                  ? 'bg-[#0E8388] text-white shadow-xs'
                  : 'text-slate-600 hover:text-[#111827]'
              }`}
            >
              Listos para canje ({canRedeemCount})
            </button>
            <button
              type="button"
              onClick={() => setPointsFilter('sin_puntos')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                pointsFilter === 'sin_puntos'
                  ? 'bg-[#0E8388] text-white shadow-xs'
                  : 'text-slate-600 hover:text-[#111827]'
              }`}
            >
              Sin puntos ({zeroPointsCount})
            </button>
          </div>
        </div>

        {/* Listado Minimalista & Visual de Clientes con Barra de Progreso e Hitos */}
        <div className="space-y-3.5">
          {paginatedCustomers.length === 0 ? (
            <div className="p-10 text-center bg-[#F8FAFC] rounded-3xl border border-dashed border-[#EAECEF] text-slate-400">
              <User className="w-8 h-8 mx-auto mb-2 text-slate-300" />
              <span className="font-bold block text-sm text-slate-600">No se encontraron clientes</span>
              <span className="text-xs">Prueba ajustando los filtros o el texto de búsqueda.</span>
            </div>
          ) : (
            paginatedCustomers.map((c, index) => {
              const initials =
                (c.effectiveName || 'C')
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
                  className="bg-white hover:bg-[#F8FAFC]/60 p-4 sm:p-5 rounded-3xl border border-[#EAECEF] hover:border-[#CBD5E1] transition-all space-y-4"
                >
                  {/* Fila Superior: Nombre del Cliente + Badges + Saldo + Botón Ajustar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div
                        className={`w-11 h-11 rounded-2xl flex items-center justify-center font-extrabold text-xs shrink-0 ${
                          c.points >= 350
                            ? 'bg-[#0E8388] text-white'
                            : c.points >= 100
                            ? 'bg-[#EBF5F3] text-[#0E8388] border border-[#CBE4DE]'
                            : 'bg-[#F8FAFC] text-slate-500 border border-[#EAECEF]'
                        }`}
                      >
                        {initials}
                      </div>

                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="font-extrabold text-[#111827] text-sm sm:text-base tracking-tight truncate">
                            {c.effectiveName}
                          </h4>
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${c.tierInfo.badgeColor}`}
                          >
                            <span>{c.tierInfo.badgeIcon}</span>
                            <span>{c.tierInfo.badgeName}</span>
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 font-medium mt-0.5">
                          {c.effectivePets && (
                            <span className="inline-flex items-center gap-1 text-slate-700 font-semibold">
                              <span className="text-[#0E8388]">🐾</span>
                              <span>{c.effectivePets}</span>
                            </span>
                          )}
                          {c.effectivePhone && (
                            <span className="inline-flex items-center gap-1 font-mono text-[11px] text-slate-500">
                              <Phone className="w-3 h-3 text-slate-400" />
                              <span>{c.effectivePhone}</span>
                              {cleanPhone && (
                                <a
                                  href={`https://wa.me/${waNumber}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  title="Abrir WhatsApp"
                                  className="text-[#0E8388] hover:text-[#0c7276]"
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
                    <div className="flex items-center gap-2.5 shrink-0 self-end sm:self-auto">
                      <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#F8FAFC] border border-[#EAECEF]">
                        <span className="text-[10px] font-bold text-slate-400">Saldo</span>
                        <span className="font-mono font-extrabold text-sm text-[#111827]">
                          {c.points.toLocaleString('es-CL')}
                        </span>
                        <span className="text-[10px] font-bold text-[#0E8388]">PTS</span>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleSelectCustomerForAdjustment(c.id)}
                        className="px-4 py-1.5 rounded-full bg-white hover:bg-[#0E8388] text-slate-700 hover:text-white border border-[#EAECEF] hover:border-[#0E8388] font-semibold text-xs transition-all inline-flex items-center gap-1.5 active:scale-95 cursor-pointer"
                        title="Ajustar saldo en herramienta CRM"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Ajustar puntos</span>
                      </button>
                    </div>
                  </div>

                  {/* Fila Inferior: Barra de Progreso con Hitos */}
                  <div className="p-3.5 sm:p-4 rounded-2xl bg-[#F8FAFC] border border-[#EAECEF] space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                      <div className="flex items-center gap-1.5">
                        {c.tierInfo.canRedeem ? (
                          <span className="text-emerald-700 font-bold text-xs flex items-center gap-1">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                            <span>
                              Cupón ${c.tierInfo.qualified.discountAmount.toLocaleString('es-CL')} CLP listo para canjear
                            </span>
                          </span>
                        ) : c.tierInfo.nextTier ? (
                          <span className="text-slate-600 font-medium text-xs flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-[#0E8388]"></span>
                            <span>
                              Faltan <strong className="text-[#111827] font-extrabold">{c.tierInfo.nextTier.points - c.points} pts</strong> para desbloquear cupón ${c.tierInfo.nextTier.discountAmount.toLocaleString('es-CL')} CLP
                            </span>
                          </span>
                        ) : (
                          <span className="text-slate-400 italic text-xs">Sin niveles configurados</span>
                        )}
                      </div>

                      <div className="text-[11px] font-semibold text-slate-400 font-mono">
                        Progreso: <span className="text-[#111827] font-extrabold">{progressPct}%</span> ({maxTierPoints} pts máx.)
                      </div>
                    </div>

                    {/* Pista Visual de Hitos */}
                    <div className="pt-6 pb-6 px-4 sm:px-6 relative">
                      <div className="h-2.5 bg-[#EAECEF] rounded-full relative overflow-hidden">
                        <div
                          className="h-full bg-[#0E8388] rounded-full transition-all duration-500 ease-out"
                          style={{ width: `${progressPct}%` }}
                        />
                      </div>

                      <div className="absolute inset-x-4 sm:inset-x-6 top-1/2 -translate-y-1/2 pointer-events-none">
                        {activeTiers.map((tier, idx) => {
                          const isReached = c.points >= tier.points;
                          const isNext = !isReached && (idx === 0 || c.points >= activeTiers[idx - 1].points);
                          const posPct = Math.min(100, Math.max(0, (tier.points / maxTierPoints) * 100));

                          return (
                            <div
                              key={tier.id || idx}
                              className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-auto"
                              style={{ left: `${posPct}%` }}
                            >
                              <div className="absolute -top-7 whitespace-nowrap text-center">
                                {isReached ? (
                                  <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-[#EBF5F3] text-[#0E8388] text-[10px] font-bold border border-[#CBE4DE]">
                                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                                    <span>${tier.discountAmount.toLocaleString('es-CL')}</span>
                                  </span>
                                ) : isNext ? (
                                  <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 text-[10px] font-bold border border-amber-200">
                                    <Star className="w-2.5 h-2.5 fill-[#F5BA13] text-[#F5BA13]" />
                                    <span>${tier.discountAmount.toLocaleString('es-CL')}</span>
                                  </span>
                                ) : (
                                  <span className="text-[10px] font-semibold text-slate-400">
                                    ${tier.discountAmount.toLocaleString('es-CL')}
                                  </span>
                                )}
                              </div>

                              <div
                                className={`w-5 h-5 rounded-full flex items-center justify-center transition-all ${
                                  isReached
                                    ? 'bg-[#0E8388] text-white ring-4 ring-white'
                                    : isNext
                                    ? 'bg-[#F5BA13] text-[#111827] ring-4 ring-amber-100 font-extrabold text-[9px]'
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

                              <div className="absolute -bottom-5 whitespace-nowrap text-center">
                                <span
                                  className={`text-[10px] font-mono font-semibold ${
                                    isReached
                                      ? 'text-[#0E8388] font-extrabold'
                                      : isNext
                                      ? 'text-amber-700 font-extrabold'
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
              Página <strong className="text-[#111827]">{customersPage}</strong> de{' '}
              <strong className="text-[#111827]">{totalCustomerPages}</strong> ({processedCustomers.length} clientes)
            </span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setCustomersPage((p) => Math.max(1, p - 1))}
                disabled={customersPage === 1}
                className="px-3.5 py-1.5 rounded-full bg-white border border-[#EAECEF] hover:bg-[#F8FAFC] text-slate-700 font-semibold disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 cursor-pointer transition-colors"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Anterior</span>
              </button>
              <button
                type="button"
                onClick={() => setCustomersPage((p) => Math.min(totalCustomerPages, p + 1))}
                disabled={customersPage === totalCustomerPages}
                className="px-3.5 py-1.5 rounded-full bg-white border border-[#EAECEF] hover:bg-[#F8FAFC] text-slate-700 font-semibold disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 cursor-pointer transition-colors"
              >
                <span>Siguiente</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 4. AUDITORÍA DE CANJES EN TIEMPO REAL */}
      <div className="finset-card bg-white p-6 sm:p-7 rounded-3xl border border-[#EAECEF] space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-extrabold text-[#111827] tracking-tight">
                Auditoría de canjes y cupones
              </h3>
              <span className="text-[11px] font-semibold text-slate-500 bg-[#F8FAFC] border border-[#EAECEF] px-2.5 py-0.5 rounded-full">
                {filteredRedemptions.length} registros
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium mt-0.5">
              Monitorea cada cupón canjeado, el cliente que lo solicitó y el pedido donde se aplicó el descuento.
            </p>
          </div>

          <button
            type="button"
            onClick={loadRedemptions}
            disabled={isLoadingRedemptions}
            className="px-4 py-2 rounded-full bg-white border border-[#EAECEF] hover:bg-[#F8FAFC] text-slate-700 font-semibold text-xs transition-all flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#0E8388] ${isLoadingRedemptions ? 'animate-spin' : ''}`} />
            <span>Actualizar</span>
          </button>
        </div>

        {/* Buscador y Filtros */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por cliente, teléfono o código (ej. PTS-)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-full border border-[#EAECEF] bg-[#F8FAFC] focus:bg-white text-xs text-[#111827] placeholder:text-slate-400"
            />
          </div>

          <div className="flex items-center gap-1 bg-[#F8FAFC] border border-[#EAECEF] p-1 rounded-full shrink-0">
            <button
              type="button"
              onClick={() => setStatusFilter('todos')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                statusFilter === 'todos' ? 'bg-[#0E8388] text-white shadow-xs' : 'text-slate-600 hover:text-[#111827]'
              }`}
            >
              Todos
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('activo')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                statusFilter === 'activo' ? 'bg-[#0E8388] text-white shadow-xs' : 'text-slate-600 hover:text-[#111827]'
              }`}
            >
              Activos ({activeCouponsCount})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('utilizado')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                statusFilter === 'utilizado' ? 'bg-[#0E8388] text-white shadow-xs' : 'text-slate-600 hover:text-[#111827]'
              }`}
            >
              Utilizados ({usedCouponsCount})
            </button>
          </div>
        </div>

        {/* Tabla de Auditoría */}
        <div className="overflow-x-auto rounded-2xl border border-[#EAECEF]">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-[#F8FAFC] text-[11px] font-semibold text-slate-500 border-b border-[#EAECEF]">
              <tr>
                <th className="px-4 py-3">Fecha y hora</th>
                <th className="px-4 py-3">Cliente (tutor)</th>
                <th className="px-4 py-3 text-center">Puntos usados</th>
                <th className="px-4 py-3">Descuento</th>
                <th className="px-4 py-3">Código cupón</th>
                <th className="px-4 py-3 text-center">Estado</th>
                <th className="px-4 py-3">Pedido aplicado</th>
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
                    <tr key={r.id} className="hover:bg-[#F8FAFC] transition-colors">
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

                      <td className="px-4 py-3">
                        <div className="font-bold text-[#111827]">{r.customerName}</div>
                        <div className="text-[10px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                          <span>{r.customerPhone || 'Sin teléfono'}</span>
                          <span>· Saldo: {r.currentCustomerPoints} pts</span>
                        </div>
                      </td>

                      <td className="px-4 py-3 text-center">
                        <span className="font-bold text-rose-600 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200/80">
                          -{r.pointsSpent} pts
                        </span>
                      </td>

                      <td className="px-4 py-3 font-extrabold text-[#0E8388]">
                        ${(r.discountAmount || 0).toLocaleString('es-CL')} CLP
                      </td>

                      <td className="px-4 py-3">
                        <button
                          type="button"
                          onClick={() => handleCopyCode(r.couponCode)}
                          className="font-mono font-bold text-[#111827] bg-[#F8FAFC] hover:bg-[#EBF5F3] px-3 py-1 rounded-full border border-[#EAECEF] flex items-center gap-1.5 cursor-pointer transition-colors"
                          title="Copiar código"
                        >
                          <span>{r.couponCode}</span>
                          <Copy className="w-3 h-3 text-slate-400" />
                          {copiedCode === r.couponCode && (
                            <span className="text-[9px] text-[#0E8388] font-bold">¡Copiado!</span>
                          )}
                        </button>
                      </td>

                      <td className="px-4 py-3 text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            isUsed
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}
                        >
                          {isUsed ? '✓ Utilizado' : 'Activo'}
                        </span>
                      </td>

                      <td className="px-4 py-3">
                        {r.usedInOrderId ? (
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono font-bold text-[#0E8388] bg-[#EBF5F3] px-2.5 py-0.5 rounded-full border border-[#CBE4DE]">
                              {r.usedInOrderId}
                            </span>
                            {r.usedInOrderTotal && (
                              <span className="text-[10px] text-slate-400 font-semibold">
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
      <div
        id="crm-adjustment-tool"
        className="finset-card bg-white p-6 sm:p-7 rounded-3xl border border-[#EAECEF] space-y-4 scroll-mt-6 transition-all duration-300"
      >
        <div className="flex items-center gap-3.5 border-b border-slate-100 pb-4">
          <div className="w-10 h-10 rounded-2xl bg-[#EBF5F3] border border-[#CBE4DE] text-[#0E8388] flex items-center justify-center shrink-0">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-[#111827] tracking-tight">
              Ajuste manual de puntos a clientes
            </h3>
            <p className="text-xs text-slate-400 font-medium">
              Suma puntos de cortesía (cumpleaños, eventos o compensación) o corrige saldos.
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
          <div className="sm:col-span-4 space-y-1.5">
            <label className="text-xs font-semibold text-slate-600 block">
              Seleccionar cliente
            </label>
            <select
              value={selectedCustomerId}
              onChange={(e) => setSelectedCustomerId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-2xl border border-[#EAECEF] bg-[#F8FAFC] text-xs font-semibold text-[#111827] focus:bg-white"
            >
              <option value="">-- Elige un tutor / cliente --</option>
              {enrichedCustomers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.effectiveName} ({c.effectivePhone || c.effectiveEmail || 'Sin contacto'}) — Saldo: {c.points || 0} pts
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-3 space-y-1.5">
            <label className="text-xs font-semibold text-slate-600 block">
              Puntos (+ sumar / - restar)
            </label>
            <input
              type="number"
              placeholder="Ej. +50 ó -30"
              value={pointsAdjustment}
              onChange={(e) => setPointsAdjustment(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-2xl border border-[#EAECEF] bg-[#F8FAFC] text-xs font-mono font-extrabold text-[#111827] focus:bg-white"
            />
          </div>

          <div className="sm:col-span-3 space-y-1.5">
            <label className="text-xs font-semibold text-slate-600 block">
              Motivo o justificación
            </label>
            <input
              type="text"
              placeholder="Ej. Cortesía por fidelización"
              value={adjustmentReason}
              onChange={(e) => setAdjustmentReason(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-2xl border border-[#EAECEF] bg-[#F8FAFC] text-xs text-[#111827] focus:bg-white"
            />
          </div>

          <div className="sm:col-span-2">
            <button
              type="submit"
              disabled={isAdjusting}
              className="w-full py-2.5 px-4 rounded-full bg-[#0E8388] hover:bg-[#0c7276] text-white font-bold text-xs shadow-sm shadow-[#0E8388]/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{isAdjusting ? 'Aplicando...' : 'Aplicar puntos'}</span>
            </button>
          </div>
        </form>

        {selectedCustomerObj && (
          <div className="p-3.5 rounded-2xl bg-[#F8FAFC] border border-[#EAECEF] text-xs text-slate-600 flex items-center justify-between">
            <div>
              <span className="font-bold text-[#111827]">
                {selectedCustomerObj.name || selectedCustomerObj.full_name}
              </span>
              <span className="text-slate-400 ml-2">
                (Tel: {selectedCustomerObj.phone || 'N/A'})
              </span>
            </div>
            <div className="font-mono font-extrabold text-[#0E8388]">
              Saldo actual: {selectedCustomerObj.points || 0} PTS
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
