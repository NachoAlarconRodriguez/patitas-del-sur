import React, { useMemo, useState, useEffect } from 'react';
import {
  Clock,
  Truck,
  CheckCircle2,
  ShoppingBag,
  MapPin,
  Package,
  Calendar,
  Zap,
  Eye,
  ChevronDown,
  Search,
  X,
  Phone,
  AlertTriangle,
  RefreshCw,
  Bell,
  Route,
  LogOut,
  Trash2,
  MessageSquare,
  Wallet,
  Loader2,
} from 'lucide-react';
import { WhatsAppIcon, GoogleMapsIcon } from '../../../components/OfficialIcons';
import { formatOrderScheduleSummary } from '../../../services/dispatchService.js';
import {
  optimizeDeliveryRoute,
  getSingleOrderNavigationUrl,
} from '../../../services/googleMapsService.js';
import {
  formatCLP,
  getOrderPaymentStatus,
  resolveProductImage,
  getOrderCustomerPhoneDigits,
} from '../adminUtils.js';
import {
  renderPaymentMethodBadge,
  renderPaymentCollectionBanner,
} from '../adminPaymentUI.jsx';

function getDisplayDeliveryNote(notes) {
  if (!notes) return '';
  const cleaned = String(notes)
    .replace(/\s*\|\s*Repartidor:\s*[^|\n]+/gi, '')
    .replace(/\s*\|\s*DespachoGratis:\s*Si/gi, '')
    .replace(/^Pedido creado manualmente en el panel\s*$/i, '')
    .replace(/^Pedido registrado en el panel\s*$/i, '')
    .trim();
  return cleaned;
}

function MobileOrderSkeletonList({ count = 3 }) {
  return (
    <div className="space-y-3" aria-busy="true" aria-label="Cargando pedidos">
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className="ios-grouped-card p-4 space-y-3 animate-pulse"
        >
          <div className="flex items-center justify-between gap-2">
            <div className="h-5 w-32 rounded-full bg-slate-200/80" />
            <div className="h-5 w-20 rounded-full bg-slate-200/70" />
          </div>
          <div className="space-y-2">
            <div className="h-5 w-44 rounded-lg bg-slate-200/80" />
            <div className="h-3.5 w-60 rounded-lg bg-slate-200/60" />
          </div>
          <div className="h-11 w-full rounded-xl bg-slate-100" />
          <div className="grid grid-cols-3 gap-2 pt-2">
            <div className="h-10 rounded-xl bg-slate-200/70" />
            <div className="h-10 rounded-xl bg-slate-200/70" />
            <div className="h-10 rounded-xl bg-slate-200/70" />
          </div>
        </div>
      ))}
    </div>
  );
}

function SyncErrorBanner({ syncError, onRetry, isRefreshing }) {
  if (!syncError) return null;
  return (
    <div className="rounded-2xl bg-rose-50 border border-rose-200 px-3.5 py-3 flex items-center justify-between gap-3">
      <div className="flex items-center gap-2.5 min-w-0">
        <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
        <p className="text-[12px] font-semibold text-rose-900 leading-snug">
          {syncError}
        </p>
      </div>
      <button
        type="button"
        onClick={onRetry}
        disabled={isRefreshing}
        className="ios-pressable shrink-0 px-3 py-1.5 rounded-full bg-rose-600 text-white text-[11px] font-bold flex items-center gap-1 cursor-pointer disabled:opacity-60"
      >
        <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin' : ''}`} />
        <span>Reintentar</span>
      </button>
    </div>
  );
}

export function MobilePwaDashboardView({
  orders,
  todayOrders,
  inventory,
  salesPeriodData,
  activeRouteOrigin,
  driverGpsOrigin,
  isLocatingDriverGps,
  isInitialLoading,
  isRefreshing,
  syncError,
  pushStatus,
  isTogglingPush,
  onTogglePush,
  onRetrySync,
  onToggleDriverGpsOrigin,
  onOpenRouteOptimizer,
  onNavigateToRepartoWithFilter,
  onUpdateOrderStatus,
  onSelectOrderModal,
  onSelectProductPreview,
}) {
  const [expandedItemsByOrderId, setExpandedItemsByOrderId] = useState({});
  const [pushBannerDismissed, setPushBannerDismissed] = useState(false);

  const enPrepCount = useMemo(
    () => (orders || []).filter((o) => o.status === 'en_preparacion').length,
    [orders]
  );
  const enCaminoCount = useMemo(
    () => (orders || []).filter((o) => o.status === 'en_camino').length,
    [orders]
  );
  const deliveredTodayCount = useMemo(
    () => (todayOrders || []).filter((o) => o.status === 'entregado').length,
    [todayOrders]
  );
  const unpaidOrdersCount = useMemo(
    () =>
      (orders || []).filter(
        (o) => o.status !== 'cancelado' && !getOrderPaymentStatus(o).isPaid
      ).length,
    [orders]
  );

  const routeOptimization = useMemo(() => {
    const rawPendingOrders = (orders || []).filter(
      (o) => o.status === 'en_camino' || o.status === 'en_preparacion'
    );
    return optimizeDeliveryRoute(rawPendingOrders, activeRouteOrigin);
  }, [orders, activeRouteOrigin]);

  const pendingDispatchOrders = routeOptimization.optimizedOrders || [];

  const showPushPromptBanner =
    !pushBannerDismissed &&
    pushStatus &&
    !pushStatus.subscribed &&
    pushStatus.permission !== 'denied' &&
    (pushStatus.supported || pushStatus.requiresIosInstall);

  return (
    <div className="block md:hidden space-y-4">
      <SyncErrorBanner
        syncError={syncError}
        onRetry={onRetrySync}
        isRefreshing={isRefreshing}
      />

      {/* Invitación sutil a activar Notificaciones Push en segundo plano */}
      {showPushPromptBanner && (
        <div className="ios-grouped-card p-3.5 border border-[#F5BA13]/40 bg-gradient-to-r from-[#FFFBEB] to-white flex items-center justify-between gap-2.5">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="w-9 h-9 rounded-2xl bg-[#D97706]/15 text-[#D97706] flex items-center justify-center shrink-0">
              <Bell className="w-4 h-4 stroke-[2.25]" />
            </span>
            <div className="min-w-0">
              <div className="text-[12.5px] font-bold text-[#1C1C1E] leading-tight">
                {pushStatus.requiresIosInstall
                  ? 'Instala la app para alertas'
                  : 'Alertas de nuevos pedidos web'}
              </div>
              <p className="text-[11px] text-[#6E6E73] leading-snug mt-0.5">
                {pushStatus.requiresIosInstall
                  ? 'En iPhone, usa Compartir → Agregar a inicio para recibir notificaciones con app cerrada.'
                  : 'Activa notificaciones para enterarte al instante incluso con el celular bloqueado.'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            {!pushStatus.requiresIosInstall && (
              <button
                type="button"
                onClick={onTogglePush}
                disabled={isTogglingPush}
                className="ios-pressable px-3 py-1.5 rounded-full bg-[#D97706] text-white text-[11px] font-bold cursor-pointer disabled:opacity-60 flex items-center gap-1"
              >
                {isTogglingPush ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : null}
                <span>Activar</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => setPushBannerDismissed(true)}
              className="w-7 h-7 rounded-full text-[#8E8E93] hover:bg-black/5 flex items-center justify-center cursor-pointer"
              aria-label="Ocultar aviso"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* 1. Widgets Compactos iOS de Estado del Reparto (filtran correctamente en Reparto) */}
      <div className="grid grid-cols-3 gap-2.5">
        <button
          type="button"
          onClick={() => onNavigateToRepartoWithFilter('en_preparacion')}
          className="ios-grouped-card ios-pressable p-3.5 text-left cursor-pointer flex flex-col justify-between min-h-[86px]"
        >
          <div className="flex items-center justify-between">
            <span className="w-7 h-7 rounded-[10px] bg-[#FF9500]/15 text-[#FF9500] flex items-center justify-center">
              <Clock className="w-4 h-4 stroke-[2.25]" />
            </span>
            <span className="text-[22px] font-bold tracking-[-0.025em] tabular-nums text-[#1C1C1E] leading-none">
              {isInitialLoading ? '—' : enPrepCount}
            </span>
          </div>
          <div className="text-[12px] font-semibold text-[#6E6E73] tracking-[-0.01em] mt-2 truncate">
            En prep.
          </div>
        </button>

        <button
          type="button"
          onClick={() => onNavigateToRepartoWithFilter('en_camino')}
          className="ios-grouped-card ios-pressable p-3.5 text-left cursor-pointer flex flex-col justify-between min-h-[86px]"
        >
          <div className="flex items-center justify-between">
            <span className="w-7 h-7 rounded-[10px] bg-[#D97706]/15 text-[#D97706] flex items-center justify-center">
              <Truck className="w-4 h-4 stroke-[2.25]" />
            </span>
            <span className="text-[22px] font-bold tracking-[-0.025em] tabular-nums text-[#1C1C1E] leading-none">
              {isInitialLoading ? '—' : enCaminoCount}
            </span>
          </div>
          <div className="text-[12px] font-semibold text-[#6E6E73] tracking-[-0.01em] mt-2 truncate">
            En camino
          </div>
        </button>

        <button
          type="button"
          onClick={() => onNavigateToRepartoWithFilter('entregados_hoy')}
          className="ios-grouped-card ios-pressable p-3.5 text-left cursor-pointer flex flex-col justify-between min-h-[86px]"
        >
          <div className="flex items-center justify-between">
            <span className="w-7 h-7 rounded-[10px] bg-[#34C759]/15 text-[#34C759] flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4 stroke-[2.25]" />
            </span>
            <span className="text-[22px] font-bold tracking-[-0.025em] tabular-nums text-[#1C1C1E] leading-none">
              {isInitialLoading ? '—' : deliveredTodayCount}
            </span>
          </div>
          <div className="text-[12px] font-semibold text-[#6E6E73] tracking-[-0.01em] mt-2 truncate">
            Entregados
          </div>
        </button>
      </div>

      {/* 2. Tarjetas iOS Inset Grouped de Métricas del Día */}
      <div className="grid grid-cols-2 gap-2.5">
        <div className="ios-grouped-card p-3.5 flex flex-col justify-between space-y-1.5">
          <div className="flex items-center justify-between gap-1.5">
            <span className="text-[12.5px] font-semibold text-[#6E6E73] tracking-[-0.01em]">
              Ventas hoy
            </span>
            <span className="text-[10px] font-semibold text-[#248A3D] bg-[#34C759]/15 px-2 py-0.5 rounded-full truncate">
              {salesPeriodData?.dia?.growth || 'Hoy'}
            </span>
          </div>
          <div className="text-[21px] font-bold text-[#1C1C1E] tracking-[-0.025em] tabular-nums leading-tight">
            {isInitialLoading ? '—' : formatCLP(salesPeriodData?.dia?.amount || 0)}
          </div>
          <span className="text-[11.5px] text-[#6E6E73] font-medium truncate">
            {isInitialLoading ? 'Sincronizando...' : salesPeriodData?.dia?.detail}
          </span>
        </div>

        <button
          type="button"
          onClick={() =>
            onNavigateToRepartoWithFilter(
              unpaidOrdersCount > 0 ? 'por_cobrar' : 'todos_hoy'
            )
          }
          className="ios-grouped-card ios-pressable p-3.5 flex flex-col justify-between space-y-1.5 text-left cursor-pointer"
        >
          <div className="flex items-center justify-between gap-1.5">
            <span className="text-[12.5px] font-semibold text-[#6E6E73] tracking-[-0.01em]">
              Pedidos hoy
            </span>
            <div className="w-7 h-7 rounded-[10px] bg-[#D97706]/15 text-[#D97706] flex items-center justify-center shrink-0">
              <ShoppingBag className="w-4 h-4 stroke-[2.25]" />
            </div>
          </div>
          <div className="text-[21px] font-bold text-[#1C1C1E] tracking-[-0.025em] tabular-nums leading-tight">
            {isInitialLoading
              ? '—'
              : `${todayOrders.length} ${todayOrders.length === 1 ? 'pedido' : 'pedidos'}`}
          </div>
          <span
            className={`text-[11.5px] font-semibold truncate ${
              unpaidOrdersCount > 0 ? 'text-[#C93400]' : 'text-[#6E6E73]'
            }`}
          >
            {unpaidOrdersCount > 0
              ? `${unpaidOrdersCount} por cobrar (ver)`
              : `${todayOrders.filter((o) => o.status === 'en_preparacion' || o.status === 'en_camino').length} pendientes`}
          </span>
        </button>
      </div>

      {/* 3. Sección: "Siguiente por despachar (Ruta óptima)" */}
      <div className="space-y-2.5">
        <div className="flex flex-wrap items-center justify-between gap-2 px-1">
          <span className="text-[11.5px] font-bold uppercase tracking-[0.04em] text-[#6E6E73]">
            Siguiente por despachar
          </span>
          <div className="flex items-center gap-1.5">
            {pendingDispatchOrders.length > 0 && (
              <>
                <button
                  type="button"
                  onClick={onToggleDriverGpsOrigin}
                  disabled={isLocatingDriverGps}
                  className={`ios-pressable inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full cursor-pointer border ${
                    driverGpsOrigin
                      ? 'bg-[#1C1C1E] text-white border-[#1C1C1E]'
                      : 'bg-white text-[#1C1C1E] border-[#3C3C43]/12'
                  }`}
                >
                  <MapPin
                    className={`w-3 h-3 shrink-0 ${
                      driverGpsOrigin ? 'text-[#F5BA13]' : 'text-[#D97706]'
                    }`}
                  />
                  <span>
                    {isLocatingDriverGps
                      ? 'GPS...'
                      : driverGpsOrigin
                        ? 'Mi GPS'
                        : 'Bodega'}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={onOpenRouteOptimizer}
                  className="ios-pressable inline-flex items-center gap-1 text-[11px] font-bold text-[#D97706] bg-[#D97706]/12 px-2.5 py-1 rounded-full tabular-nums cursor-pointer"
                >
                  <Route className="w-3 h-3 shrink-0" />
                  <span>
                    {pendingDispatchOrders.length}{' '}
                    {pendingDispatchOrders.length === 1 ? 'parada' : 'paradas'} ·{' '}
                    {routeOptimization.totalDistanceKm} km
                  </span>
                </button>
              </>
            )}
          </div>
        </div>

        {isInitialLoading ? (
          <MobileOrderSkeletonList count={2} />
        ) : pendingDispatchOrders.length === 0 ? (
          <div className="ios-grouped-card p-6 text-center space-y-2">
            <div className="w-11 h-11 rounded-[14px] bg-[#34C759]/15 text-[#34C759] flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6 stroke-[2.25]" />
            </div>
            <div className="text-[15px] font-bold text-[#1C1C1E] tracking-[-0.015em]">
              Sin pedidos pendientes por despachar
            </div>
            <p className="text-[13px] text-[#6E6E73] font-normal leading-relaxed max-w-[260px] mx-auto">
              Todos los pedidos registrados ya han sido despachados y entregados.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {pendingDispatchOrders.map((nextOrder, orderIdx) => {
              const itemsList = Array.isArray(nextOrder.items) ? nextOrder.items : [];
              const itemsCount = itemsList.reduce((acc, it) => acc + (Number(it.quantity) || 1), 0);
              const isExpandedItems = Boolean(expandedItemsByOrderId[nextOrder.id]);
              const sched = formatOrderScheduleSummary(nextOrder);
              const phoneDigits = getOrderCustomerPhoneDigits(nextOrder);
              const deliveryNote = getDisplayDeliveryNote(nextOrder.notes);
              const payStatus = getOrderPaymentStatus(nextOrder);
              const isEnCamino = nextOrder.status === 'en_camino';

              return (
                <div
                  key={nextOrder.id}
                  className="ios-grouped-card p-4 space-y-3"
                >
                  {/* Encabezado: Parada #N, Cercanía, Estado e ID */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 min-w-0 flex-wrap">
                      <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full bg-[#D97706] text-white text-[11px] font-bold tabular-nums shrink-0">
                        Parada #{nextOrder.stopNumber || orderIdx + 1}
                      </span>
                      <span className="text-[11.5px] font-semibold text-[#6E6E73] tabular-nums truncate">
                        {nextOrder.legDistanceKm} km{' '}
                        {nextOrder.previousStopLabel || 'desde Bodega'}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span
                        className={`text-[10.5px] font-bold px-2 py-0.5 rounded-full ${
                          isEnCamino
                            ? 'bg-[#D97706]/15 text-[#B45309]'
                            : 'bg-[#FF9500]/15 text-[#C93400]'
                        }`}
                      >
                        {isEnCamino ? 'En camino' : 'En prep.'}
                      </span>
                      <span className="text-[11.5px] font-semibold tabular-nums text-[#1C1C1E] bg-[#F2F2F7] px-2 py-0.5 rounded-full">
                        {nextOrder.id}
                      </span>
                    </div>
                  </div>

                  {/* Agenda / Urgencia */}
                  <div
                    className={`flex items-center justify-between gap-2 px-3 py-1.5 rounded-xl text-[11.5px] font-bold border ${
                      sched.isUrgent
                        ? 'bg-gradient-to-r from-[#FFFBEB] via-[#FEF3C7] to-[#FDE68A]/50 border-[#D97706]/45 text-[#78350F]'
                        : 'bg-[#FAF8F4] border-[#1D1D1F]/10 text-[#1D1D1F]'
                    }`}
                  >
                    <span className="flex items-center gap-1.5 min-w-0 truncate">
                      {sched.isUrgent ? (
                        <Zap className="w-3.5 h-3.5 text-[#D97706] shrink-0 fill-current" />
                      ) : (
                        <Calendar className="w-3.5 h-3.5 text-[#D97706] shrink-0" />
                      )}
                      <span className="truncate">{sched.dateShort}</span>
                    </span>
                    <span
                      className={`text-[10.5px] font-extrabold px-2 py-0.5 rounded-full shrink-0 ${
                        sched.isUrgent
                          ? 'bg-[#78350F] text-[#FDE68A]'
                          : 'bg-white text-[#B45309] border border-[#F5BA13]/45'
                      }`}
                    >
                      {sched.shortSlot}
                    </span>
                  </div>

                  {/* Cliente, Dirección Completa y Total */}
                  <div className="space-y-2.5">
                    <div className="flex items-start justify-between gap-2.5">
                      <div className="min-w-0 flex-1">
                        <div className="text-[17px] font-bold text-[#1C1C1E] tracking-[-0.02em] leading-snug break-words">
                          {nextOrder.customer}
                        </div>
                        <div className="text-[13px] text-[#6E6E73] font-medium flex items-start gap-1.5 mt-1">
                          <MapPin className="w-3.5 h-3.5 text-[#D97706] shrink-0 mt-0.5" />
                          <span className="break-words leading-snug">
                            {nextOrder.address}, {nextOrder.city}
                          </span>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-[17px] font-bold text-[#1C1C1E] tabular-nums tracking-[-0.02em] block">
                          {formatCLP(nextOrder.total)}
                        </span>
                        <span
                          className={`inline-block text-[10.5px] font-semibold px-2 py-0.5 rounded-full border mt-1 ${payStatus.badgeColor}`}
                        >
                          {payStatus.statusText}
                        </span>
                      </div>
                    </div>

                    {renderPaymentCollectionBanner(nextOrder, true)}

                    {deliveryNote && (
                      <div className="px-3 py-2 rounded-xl bg-amber-50/90 border border-amber-200/80 text-amber-950 text-[12px] flex items-start gap-2">
                        <MessageSquare className="w-3.5 h-3.5 text-[#D97706] shrink-0 mt-0.5" />
                        <span className="leading-snug break-words">{deliveryNote}</span>
                      </div>
                    )}

                    {/* Productos con foto real y expansión individual */}
                    <div className="pt-2 border-t border-[#3C3C43]/10 space-y-2">
                      <div className="flex items-center justify-between text-[12px] font-semibold text-[#6E6E73]">
                        <span className="flex items-center gap-1.5">
                          <Package className="w-3.5 h-3.5 text-[#D97706]" />
                          <span>Carga a entregar ({itemsCount} un.)</span>
                        </span>
                        <div className="flex items-center gap-2.5">
                          {itemsList.length > 2 && (
                            <button
                              type="button"
                              onClick={() =>
                                setExpandedItemsByOrderId((prev) => ({
                                  ...prev,
                                  [nextOrder.id]: !prev[nextOrder.id],
                                }))
                              }
                              className="text-[12px] font-semibold text-[#D97706] active:opacity-70 cursor-pointer"
                            >
                              {isExpandedItems
                                ? 'Ocultar'
                                : `Ver ${itemsList.length - 2} más`}
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => onSelectOrderModal(nextOrder)}
                            className="inline-flex items-center gap-1 text-[11.5px] font-bold text-[#1C1C1E] bg-[#F2F2F7] px-2.5 py-1 rounded-full cursor-pointer"
                          >
                            <Eye className="w-3 h-3 text-[#D97706]" />
                            <span>Detalle</span>
                          </button>
                        </div>
                      </div>

                      <div className="rounded-[16px] bg-[#F2F2F7]/75 p-1.5 space-y-1.5">
                        {(isExpandedItems ? itemsList : itemsList.slice(0, 2)).map(
                          (item, idx) => {
                            const imgSrc = resolveProductImage(item, inventory);
                            return (
                              <div
                                key={idx}
                                onClick={() =>
                                  onSelectProductPreview({
                                    ...item,
                                    image: imgSrc,
                                    orderId: nextOrder.id,
                                    customer: nextOrder.customer,
                                    petName: nextOrder.petName,
                                    petType: nextOrder.petType,
                                    tracking: nextOrder.tracking,
                                  })
                                }
                                className="ios-pressable flex items-center gap-3 p-2 rounded-[12px] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.03)] cursor-pointer"
                                title="Toca para ver foto ampliada"
                              >
                                <div className="relative shrink-0 w-11 h-11 rounded-[10px] bg-[#F8FAFC] border border-[#3C3C43]/10 p-0.5 flex items-center justify-center">
                                  <img
                                    src={imgSrc}
                                    alt={item.name}
                                    className="w-full h-full object-contain rounded-lg"
                                  />
                                  <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-[#D97706] text-white text-[10px] font-bold tabular-nums flex items-center justify-center border border-white leading-none">
                                    x{item.quantity || 1}
                                  </span>
                                </div>

                                <div className="flex-1 min-w-0">
                                  <div className="text-[13px] font-semibold text-[#1C1C1E] tracking-[-0.01em] truncate">
                                    {item.name}
                                  </div>
                                  <div className="flex items-center gap-1.5 mt-0.5">
                                    {(item.weight || item.format) && (
                                      <span className="text-[11px] font-medium text-[#6E6E73] bg-[#F2F2F7] px-2 py-0.5 rounded-md">
                                        {item.weight || item.format}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          }
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Botonera iOS 44pt: Maps (GPS-aware), Llamar/WhatsApp, Despachar/Entregar */}
                  <div className="grid grid-cols-12 gap-2 pt-2 border-t border-[#3C3C43]/10">
                    <a
                      href={getSingleOrderNavigationUrl(nextOrder, activeRouteOrigin)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="col-span-3 ios-pressable min-h-[44px] px-2 rounded-[14px] bg-[#F2F2F7] active:bg-[#E5E5EA] text-[#1C1C1E] text-[12.5px] font-semibold flex items-center justify-center gap-1"
                      title="Abrir navegación en Google Maps"
                    >
                      <GoogleMapsIcon className="w-4 h-4 shrink-0" />
                      <span>Maps</span>
                    </a>

                    {phoneDigits ? (
                      <>
                        <a
                          href={`tel:+${phoneDigits}`}
                          className="col-span-2 ios-pressable min-h-[44px] rounded-[14px] bg-sky-50 active:bg-sky-100 text-sky-700 flex items-center justify-center"
                          title={`Llamar a ${nextOrder.customer}`}
                          aria-label={`Llamar a ${nextOrder.customer}`}
                        >
                          <Phone className="w-4 h-4 stroke-[2.25]" />
                        </a>
                        <a
                          href={`https://wa.me/${phoneDigits}?text=${encodeURIComponent(
                            `¡Hola ${nextOrder.customer}! Te contactamos de Patitas del Sur respecto a tu pedido ${nextOrder.id}. Voy en camino a tu domicilio 🐾`
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="col-span-3 ios-pressable min-h-[44px] px-2 rounded-[14px] bg-[#34C759]/14 active:bg-[#34C759]/22 text-[#248A3D] text-[12px] font-semibold flex items-center justify-center gap-1"
                          title="Avisar por WhatsApp"
                        >
                          <WhatsAppIcon className="w-4 h-4 shrink-0" />
                          <span className="truncate">Chat</span>
                        </a>
                      </>
                    ) : (
                      <div className="col-span-5 min-h-[44px] px-2 rounded-[14px] bg-slate-100 text-slate-400 text-[11px] font-semibold flex items-center justify-center">
                        Sin teléfono
                      </div>
                    )}

                    {nextOrder.status === 'en_preparacion' ? (
                      <button
                        type="button"
                        onClick={() => onUpdateOrderStatus(nextOrder.id, 'en_camino')}
                        className="col-span-4 ios-pressable min-h-[44px] px-2.5 rounded-[14px] bg-[#D97706] active:bg-[#B45309] text-white text-[12.5px] font-bold flex items-center justify-center gap-1 shadow-xs cursor-pointer"
                      >
                        <Truck className="w-4 h-4 stroke-[2.25] shrink-0" />
                        <span className="truncate">Despachar</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => onUpdateOrderStatus(nextOrder.id, 'entregado')}
                        className="col-span-4 ios-pressable min-h-[44px] px-2.5 rounded-[14px] bg-[#34C759] active:bg-[#248A3D] text-white text-[12.5px] font-bold flex items-center justify-center gap-1 shadow-xs cursor-pointer"
                      >
                        <CheckCircle2 className="w-4 h-4 stroke-[2.25] shrink-0" />
                        <span className="truncate">Entregar</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export function MobilePwaRepartoView({
  orders,
  todayOrders,
  todayFormattedDate,
  inventory,
  activeRouteOrigin,
  driverGpsOrigin,
  isLocatingDriverGps,
  isInitialLoading,
  isRefreshing,
  syncError,
  mobileRepartoFilter,
  setMobileRepartoFilter,
  mobileOrderSearch,
  setMobileOrderSearch,
  expandedOrders,
  setExpandedOrders,
  expandedOrderCards,
  setExpandedOrderCards,
  selectedOrderModal,
  onRetrySync,
  onToggleDriverGpsOrigin,
  onOpenRouteOptimizer,
  onUpdateOrderStatus,
  onSelectOrderModal,
  onSelectProductPreview,
}) {
  const todayIds = useMemo(
    () => new Set((todayOrders || []).map((o) => o.id)),
    [todayOrders]
  );

  const pendingToOptimize = useMemo(
    () =>
      (orders || []).filter(
        (o) => o.status === 'en_camino' || o.status === 'en_preparacion'
      ),
    [orders]
  );

  const routeOptimization = useMemo(
    () => optimizeDeliveryRoute(pendingToOptimize, activeRouteOrigin),
    [pendingToOptimize, activeRouteOrigin]
  );

  const optimizedPendingOrders = useMemo(
    () => routeOptimization.optimizedOrders || [],
    [routeOptimization]
  );

  const deliveredTodayList = useMemo(
    () =>
      (orders || []).filter(
        (o) =>
          o.status === 'entregado' &&
          (todayIds.has(o.id) || o.date === todayFormattedDate || o.date === 'Hoy')
      ),
    [orders, todayIds, todayFormattedDate]
  );

  const unpaidAllList = useMemo(
    () =>
      (orders || []).filter(
        (o) => o.status !== 'cancelado' && !getOrderPaymentStatus(o).isPaid
      ),
    [orders]
  );

  const filterChips = useMemo(
    () => [
      { id: 'en_ruta', label: 'En ruta', count: optimizedPendingOrders.length },
      {
        id: 'en_preparacion',
        label: 'En prep.',
        count: optimizedPendingOrders.filter((o) => o.status === 'en_preparacion').length,
      },
      {
        id: 'en_camino',
        label: 'En camino',
        count: optimizedPendingOrders.filter((o) => o.status === 'en_camino').length,
      },
      { id: 'por_cobrar', label: 'Por cobrar', count: unpaidAllList.length },
      { id: 'entregados_hoy', label: 'Entregados hoy', count: deliveredTodayList.length },
      {
        id: 'todos_hoy',
        label: 'Todos hoy',
        count: optimizedPendingOrders.length + deliveredTodayList.length,
      },
    ],
    [optimizedPendingOrders, unpaidAllList, deliveredTodayList]
  );

  const pwaOrdersList = useMemo(() => {
    let baseList = [];
    if (mobileRepartoFilter === 'en_ruta') {
      baseList = optimizedPendingOrders;
    } else if (mobileRepartoFilter === 'en_preparacion') {
      baseList = optimizedPendingOrders.filter((o) => o.status === 'en_preparacion');
    } else if (mobileRepartoFilter === 'en_camino') {
      baseList = optimizedPendingOrders.filter((o) => o.status === 'en_camino');
    } else if (mobileRepartoFilter === 'entregados_hoy') {
      baseList = deliveredTodayList;
    } else if (mobileRepartoFilter === 'por_cobrar') {
      // Colocar primero los pendientes de entrega ya optimizados y luego entregados por cobrar
      const optimizedIds = new Set(optimizedPendingOrders.map((o) => o.id));
      const pendingUnpaid = optimizedPendingOrders.filter(
        (o) => !getOrderPaymentStatus(o).isPaid
      );
      const otherUnpaid = unpaidAllList.filter((o) => !optimizedIds.has(o.id));
      baseList = [...pendingUnpaid, ...otherUnpaid];
    } else {
      baseList = [...optimizedPendingOrders, ...deliveredTodayList];
    }

    const q = (mobileOrderSearch || '').trim().toLowerCase();
    if (!q) return baseList;
    return baseList.filter((o) => {
      const hay = [
        o.id,
        o.customer,
        o.address,
        o.city,
        o.petName,
        o.customerPhone,
        o.phone,
        o.notes,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return hay.includes(q);
    });
  }, [
    mobileRepartoFilter,
    mobileOrderSearch,
    optimizedPendingOrders,
    deliveredTodayList,
    unpaidAllList,
  ]);

  const allExpanded =
    pwaOrdersList.length > 0 && pwaOrdersList.every((o) => expandedOrders[o.id]);
  const routeLegs = routeOptimization.routeLegs || [];

  return (
    <div className="block md:hidden space-y-3">
      <SyncErrorBanner
        syncError={syncError}
        onRetry={onRetrySync}
        isRefreshing={isRefreshing}
      />

      {/* Buscador rápido móvil */}
      <div className="relative">
        <Search className="w-4 h-4 text-[#8E8E93] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="search"
          value={mobileOrderSearch}
          onChange={(e) => setMobileOrderSearch(e.target.value)}
          placeholder="Buscar cliente, dirección, #PED o mascota..."
          className="w-full h-11 pl-10 pr-9 rounded-2xl bg-white border border-[#3C3C43]/12 text-[14px] font-medium text-[#1C1C1E] placeholder:text-[#8E8E93] focus:outline-none focus:border-[#D97706] shadow-[0_1px_3px_rgba(0,0,0,0.03)]"
        />
        {mobileOrderSearch && (
          <button
            type="button"
            onClick={() => setMobileOrderSearch('')}
            className="w-7 h-7 rounded-full bg-[#F2F2F7] text-[#6E6E73] flex items-center justify-center absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer"
            aria-label="Limpiar búsqueda"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Chips de filtro rápido */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-none">
        {filterChips.map((chip) => {
          const isActive = mobileRepartoFilter === chip.id;
          return (
            <button
              key={chip.id}
              type="button"
              onClick={() => setMobileRepartoFilter(chip.id)}
              className={`ios-pressable shrink-0 px-3 py-1.5 rounded-full text-[12px] font-bold flex items-center gap-1.5 border transition-colors cursor-pointer ${
                isActive
                  ? 'bg-[#1C1C1E] text-white border-[#1C1C1E]'
                  : chip.id === 'por_cobrar' && chip.count > 0
                    ? 'bg-amber-50 text-[#B45309] border-amber-300/80'
                    : 'bg-white text-[#3C3C43] border-[#3C3C43]/12'
              }`}
            >
              {chip.id === 'por_cobrar' && (
                <Wallet className="w-3 h-3 shrink-0" />
              )}
              <span>{chip.label}</span>
              <span
                className={`text-[10.5px] font-extrabold px-1.5 py-0.2 rounded-full tabular-nums ${
                  isActive
                    ? 'bg-white/20 text-white'
                    : 'bg-[#F2F2F7] text-[#1C1C1E]'
                }`}
              >
                {chip.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Barra de controles de Ruta Óptima */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-0.5">
        <span className="text-[11.5px] font-bold uppercase tracking-[0.04em] text-[#6E6E73] tabular-nums">
          {optimizedPendingOrders.length > 0
            ? `${optimizedPendingOrders.length} en ruta (${routeOptimization.totalDistanceKm} km)`
            : `${pwaOrdersList.length} ${pwaOrdersList.length === 1 ? 'pedido' : 'pedidos'}`}
        </span>
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={onToggleDriverGpsOrigin}
            disabled={isLocatingDriverGps}
            className={`ios-pressable inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1.5 rounded-full cursor-pointer border transition-colors ${
              driverGpsOrigin
                ? 'bg-[#1C1C1E] text-white border-[#1C1C1E]'
                : 'bg-white text-[#1C1C1E] border-[#3C3C43]/12 shadow-[0_1px_2px_rgba(0,0,0,0.03)]'
            }`}
            title="Alternar punto de partida: Bodega Central o tu ubicación GPS actual"
          >
            <MapPin
              className={`w-3 h-3 shrink-0 ${
                driverGpsOrigin ? 'text-[#F5BA13]' : 'text-[#D97706]'
              }`}
            />
            <span>
              {isLocatingDriverGps
                ? 'GPS...'
                : driverGpsOrigin
                  ? 'Desde mi GPS'
                  : 'Desde Bodega'}
            </span>
          </button>

          {optimizedPendingOrders.length > 0 && (
            <button
              type="button"
              onClick={onOpenRouteOptimizer}
              className="ios-pressable inline-flex items-center gap-1 text-[11px] font-semibold text-[#1C1C1E] bg-white px-2.5 py-1.5 rounded-full border border-[#3C3C43]/12 shadow-[0_1px_2px_rgba(0,0,0,0.03)] cursor-pointer"
              title="Ver orden completo de paradas y tramos"
            >
              <Route className="w-3.5 h-3.5 text-[#D97706] shrink-0" />
              <span>Paradas</span>
            </button>
          )}

          {routeLegs.length === 1 && routeLegs[0]?.googleMapsUrl && (
            <a
              href={routeLegs[0].googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="ios-pressable inline-flex items-center gap-1 text-[11px] font-semibold text-[#1C1C1E] bg-white px-2.5 py-1.5 rounded-full border border-[#3C3C43]/12 shadow-[0_1px_2px_rgba(0,0,0,0.03)]"
              title="Abrir ruta encadenada en Google Maps"
            >
              <GoogleMapsIcon className="w-3.5 h-3.5 shrink-0" />
              <span>Ruta Maps</span>
            </a>
          )}

          {pwaOrdersList.length > 0 && (
            <button
              type="button"
              onClick={() => {
                if (allExpanded) {
                  setExpandedOrders({});
                } else {
                  const nextState = {};
                  pwaOrdersList.forEach((o) => {
                    nextState[o.id] = true;
                  });
                  setExpandedOrders(nextState);
                }
              }}
              className="ios-pressable inline-flex items-center gap-1 text-[11px] font-semibold text-[#D97706] bg-[#D97706]/12 px-2.5 py-1.5 rounded-full cursor-pointer"
            >
              <ChevronDown
                className={`w-3.5 h-3.5 text-[#D97706] transition-transform ${
                  allExpanded ? 'rotate-180' : ''
                }`}
              />
              <span>{allExpanded ? 'Contraer' : 'Expandir'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Multi-tramo Google Maps (>10 paradas) */}
      {routeLegs.length > 1 && (
        <div className="ios-grouped-card p-3 space-y-2 border border-[#F5BA13]/40 bg-[#FFFBEB]/60">
          <div className="text-[11px] font-bold text-[#78350F]">
            Ruta dividida en {routeLegs.length} tramos (límite de 10 paradas por enlace en Google Maps):
          </div>
          <div className="flex flex-wrap gap-1.5">
            {routeLegs.map((leg) => (
              <a
                key={leg.legIndex}
                href={leg.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="ios-pressable inline-flex items-center gap-1.5 text-[11.5px] font-bold text-[#1C1C1E] bg-white px-3 py-1.5 rounded-full border border-[#D97706]/30 shadow-2xs"
              >
                <GoogleMapsIcon className="w-3.5 h-3.5 shrink-0" />
                <span>
                  Tramo {leg.legIndex} (#{leg.fromStop}–#{leg.toStop})
                </span>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Lista de Pedidos */}
      {isInitialLoading ? (
        <MobileOrderSkeletonList count={3} />
      ) : pwaOrdersList.length === 0 ? (
        <div className="ios-grouped-card p-8 text-center space-y-2.5">
          <div className="w-12 h-12 rounded-[14px] bg-[#34C759]/15 text-[#34C759] flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-6 h-6 stroke-[2.25]" />
          </div>
          <div className="font-bold text-[#1C1C1E] text-[16px] tracking-[-0.015em]">
            {mobileOrderSearch
              ? 'Sin resultados para tu búsqueda'
              : mobileRepartoFilter === 'por_cobrar'
                ? '¡Todo cobrado al día!'
                : 'Sin pedidos en esta vista'}
          </div>
          <p className="text-[13px] text-[#6E6E73] max-w-[260px] mx-auto leading-relaxed">
            {mobileOrderSearch
              ? 'Prueba buscando por otro nombre, dirección o número de pedido.'
              : 'No hay pedidos que coincidan con el filtro seleccionado.'}
          </p>
          {(mobileOrderSearch || mobileRepartoFilter !== 'todos_hoy') && (
            <button
              type="button"
              onClick={() => {
                setMobileOrderSearch('');
                setMobileRepartoFilter('todos_hoy');
              }}
              className="ios-pressable mt-1 px-4 py-2 rounded-full bg-[#D97706]/12 text-[#D97706] text-[12px] font-bold cursor-pointer"
            >
              Ver todos los de hoy
            </button>
          )}
        </div>
      ) : (
        <div className="flex flex-col space-y-3">
          {pwaOrdersList.map((order) => {
            const itemsList = Array.isArray(order.items) ? order.items : [];
            const itemsCount = itemsList.reduce((acc, it) => acc + (Number(it.quantity) || 1), 0);
            const isCat =
              order.petType?.toLowerCase().includes('gato') ||
              order.petType?.includes('🐱');
            const isExpanded = Boolean(expandedOrders[order.id]);
            const isCollapsed = !isExpanded;
            const isPendingRouteStop =
              (order.status === 'en_camino' || order.status === 'en_preparacion') &&
              order.stopNumber;
            const payStatus = getOrderPaymentStatus(order);
            const sched = formatOrderScheduleSummary(order);
            const phoneDigits = getOrderCustomerPhoneDigits(order);
            const deliveryNote = getDisplayDeliveryNote(order.notes);

            const toggleExpand = () => {
              setExpandedOrders((prev) => ({
                ...prev,
                [order.id]: !prev[order.id],
              }));
            };

            return (
              <div
                key={order.id}
                className={`ios-grouped-card transition-all p-4 space-y-3 select-none ${
                  selectedOrderModal?.id === order.id
                    ? 'ring-2 ring-[#D97706]/40'
                    : ''
                }`}
              >
                {/* Cabecera clickable para expandir / contraer */}
                <div
                  role="button"
                  tabIndex={0}
                  onClick={toggleExpand}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      toggleExpand();
                    }
                  }}
                  className="space-y-3 cursor-pointer"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-1.5 min-w-0">
                      {isPendingRouteStop && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#D97706] text-white text-[11px] font-bold tabular-nums shrink-0">
                          <span>Parada #{order.stopNumber}</span>
                          <span className="opacity-90 font-medium">
                            · {order.legDistanceKm} km
                          </span>
                        </span>
                      )}
                      <span className="font-semibold text-[12px] tabular-nums text-[#D97706] bg-[#D97706]/12 px-2.5 py-1 rounded-full shrink-0">
                        {order.id}
                      </span>
                      {!isPendingRouteStop && (
                        <span className="text-[12px] font-medium text-[#6E6E73] tabular-nums truncate">
                          {order.date}
                          {order.time ? ` · ${order.time}` : ''}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold capitalize shrink-0 ${
                          order.status === 'cancelado'
                            ? 'bg-[#FF3B30]/12 text-[#D70015]'
                            : order.status === 'entregado'
                              ? 'bg-[#34C759]/14 text-[#248A3D]'
                              : order.status === 'en_camino'
                                ? 'bg-[#D97706]/15 text-[#B45309]'
                                : 'bg-[#FF9500]/15 text-[#C93400]'
                        }`}
                      >
                        {order.status === 'cancelado' && <X className="w-3 h-3 stroke-[2.5]" />}
                        {order.status === 'entregado' && <CheckCircle2 className="w-3 h-3 stroke-[2.5]" />}
                        {order.status === 'en_camino' && <Truck className="w-3 h-3 stroke-[2.5]" />}
                        {order.status === 'en_preparacion' && <Clock className="w-3 h-3 stroke-[2.5]" />}
                        <span>{order.status.replace('_', ' ')}</span>
                      </span>

                      <span
                        className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                          isCollapsed
                            ? 'bg-[#F2F2F7] text-[#6E6E73]'
                            : 'bg-[#D97706]/15 text-[#D97706]'
                        }`}
                        aria-hidden="true"
                      >
                        <ChevronDown
                          className={`w-4 h-4 transition-transform duration-200 ${
                            isCollapsed ? 'rotate-0' : 'rotate-180'
                          }`}
                        />
                      </span>
                    </div>
                  </div>

                  {/* Cliente, Mascota, Total y Estado de Pago (solo informativo para evitar toques accidentales) */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="font-bold text-[#1C1C1E] text-[17px] tracking-[-0.02em] leading-snug break-words">
                        {order.customer}
                      </div>
                      {order.petName && (
                        <div className="flex items-center gap-1.5 text-[12.5px] text-[#6E6E73] font-medium mt-0.5">
                          <span className="text-xs">{isCat ? '🐱' : '🐶'}</span>
                          <span className="truncate">{order.petName}</span>
                          {order.petBreed && (
                            <span className="text-[11.5px] text-[#8E8E93] font-normal truncate">
                              · {order.petBreed}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="text-right shrink-0">
                      <div className="font-bold text-[#1C1C1E] text-[17px] tabular-nums tracking-[-0.02em]">
                        {formatCLP(order.total)}
                      </div>
                      <span
                        className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full inline-flex items-center gap-1 mt-1 ${
                          payStatus.isPaid
                            ? 'bg-[#34C759]/14 text-[#248A3D]'
                            : payStatus.isRejected
                              ? 'bg-rose-100 text-rose-700'
                              : 'bg-[#FF9500]/16 text-[#C93400]'
                        }`}
                      >
                        {payStatus.isPaid ? (
                          <>
                            <CheckCircle2 className="w-3 h-3 shrink-0" />
                            <span>Pagado</span>
                          </>
                        ) : payStatus.isRejected ? (
                          <>
                            <AlertTriangle className="w-3 h-3 shrink-0" />
                            <span>Rechazado</span>
                          </>
                        ) : (
                          <>
                            <Clock className="w-3 h-3 shrink-0" />
                            <span>Por cobrar</span>
                          </>
                        )}
                      </span>
                    </div>
                  </div>

                  {/* Agenda de Despacho */}
                  <div
                    className={`flex items-center justify-between gap-2 px-3 py-1.5 rounded-xl text-[11.5px] font-bold border ${
                      sched.isUrgent
                        ? 'bg-gradient-to-r from-[#FFFBEB] via-[#FEF3C7] to-[#FDE68A]/50 border-[#D97706]/45 text-[#78350F]'
                        : 'bg-[#FAF8F4] border-[#1D1D1F]/10 text-[#1D1D1F]'
                    }`}
                  >
                    <span className="flex items-center gap-1.5 min-w-0 truncate">
                      {sched.isUrgent ? (
                        <Zap className="w-3.5 h-3.5 text-[#D97706] shrink-0 fill-current" />
                      ) : (
                        <Calendar className="w-3.5 h-3.5 text-[#D97706] shrink-0" />
                      )}
                      <span className="truncate">{sched.dateShort}</span>
                    </span>
                    <span
                      className={`text-[10.5px] font-extrabold px-2 py-0.5 rounded-full shrink-0 ${
                        sched.isUrgent
                          ? 'bg-[#78350F] text-[#FDE68A]'
                          : 'bg-white text-[#B45309] border border-[#F5BA13]/45'
                      }`}
                    >
                      {sched.shortSlot}
                    </span>
                  </div>

                  {/* Resumen compacto cuando está contraída */}
                  {isCollapsed && (
                    <div className="flex items-center justify-between gap-2 text-[13px] text-[#6E6E73] pt-2.5 border-t border-[#3C3C43]/10">
                      <div className="flex items-start gap-1.5 min-w-0 flex-1">
                        <MapPin className="w-3.5 h-3.5 text-[#D97706] shrink-0 mt-0.5" />
                        <span className="font-medium text-[#1C1C1E] line-clamp-1 break-words">
                          {order.address}, {order.city}
                        </span>
                      </div>
                      <span className="text-[12px] font-semibold text-[#D97706] shrink-0 bg-[#D97706]/12 px-2.5 py-1 rounded-full tabular-nums">
                        {itemsCount} {itemsCount === 1 ? 'prod.' : 'prods.'}
                      </span>
                    </div>
                  )}
                </div>

                {/* Detalle expandido */}
                {!isCollapsed && (
                  <>
                    {renderPaymentCollectionBanner(order)}

                    {/* Dirección completa (sin recorte ciego) */}
                    <div className="flex items-start justify-between gap-2 text-[13px] text-[#1C1C1E] bg-[#F2F2F7]/80 px-3.5 py-2.5 rounded-[14px]">
                      <div className="flex items-start gap-2 min-w-0 flex-1">
                        <MapPin className="w-4 h-4 text-[#D97706] shrink-0 mt-0.5" />
                        <div className="min-w-0 leading-snug">
                          <span className="font-semibold break-words block">
                            {order.address}
                          </span>
                          <span className="text-[11.5px] text-[#6E6E73]">
                            {order.city}
                            {order.previousStopLabel
                              ? ` · ${order.legDistanceKm} km ${order.previousStopLabel}`
                              : ''}
                          </span>
                        </div>
                      </div>
                      <div className="shrink-0">
                        {renderPaymentMethodBadge(order.paymentMethod)}
                      </div>
                    </div>

                    {deliveryNote && (
                      <div className="px-3 py-2 rounded-xl bg-amber-50/90 border border-amber-200/80 text-amber-950 text-[12px] flex items-start gap-2">
                        <MessageSquare className="w-3.5 h-3.5 text-[#D97706] shrink-0 mt-0.5" />
                        <span className="leading-snug break-words">{deliveryNote}</span>
                      </div>
                    )}

                    {/* Desglose visual de productos con foto real */}
                    <div className="pt-2 border-t border-[#3C3C43]/10 space-y-2">
                      <div className="flex items-center justify-between text-[12px] font-semibold text-[#6E6E73]">
                        <span className="flex items-center gap-1.5">
                          <Package className="w-3.5 h-3.5 text-[#D97706]" />
                          <span>Productos ({itemsCount} un.)</span>
                        </span>
                        <div className="flex items-center gap-2.5">
                          {itemsList.length > 2 && (
                            <button
                              type="button"
                              onClick={() =>
                                setExpandedOrderCards((prev) => ({
                                  ...prev,
                                  [order.id]: !prev[order.id],
                                }))
                              }
                              className="text-[12px] font-semibold text-[#D97706] active:opacity-70 cursor-pointer"
                            >
                              {expandedOrderCards[order.id]
                                ? 'Ocultar'
                                : `Ver ${itemsList.length - 2} más`}
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => onSelectOrderModal(order)}
                            className="inline-flex items-center gap-1 text-[11.5px] font-bold text-[#1C1C1E] bg-[#F2F2F7] px-2.5 py-1 rounded-full cursor-pointer"
                          >
                            <Eye className="w-3 h-3 text-[#D97706]" />
                            <span>Ver detalle</span>
                          </button>
                        </div>
                      </div>

                      <div className="rounded-[16px] bg-[#F2F2F7]/75 p-1.5 space-y-1.5">
                        {(expandedOrderCards[order.id]
                          ? itemsList
                          : itemsList.slice(0, 2)
                        ).map((it, idx) => {
                          const imgSrc = resolveProductImage(it, inventory);
                          return (
                            <div
                              key={idx}
                              onClick={() =>
                                onSelectProductPreview({
                                  ...it,
                                  image: imgSrc,
                                  orderId: order.id,
                                  customer: order.customer,
                                  petName: order.petName,
                                  petType: order.petType,
                                  tracking: order.tracking,
                                })
                              }
                              className="ios-pressable flex items-center gap-3 p-2 pr-3 rounded-[12px] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.03)] cursor-pointer"
                              title="Toca para ver foto ampliada"
                            >
                              <div className="relative shrink-0 w-11 h-11 rounded-[10px] bg-[#F8FAFC] border border-[#3C3C43]/10 p-0.5 flex items-center justify-center">
                                <img
                                  src={imgSrc}
                                  alt={it.name}
                                  className="w-full h-full object-contain rounded-lg"
                                />
                                <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-[#D97706] text-white text-[10px] font-bold tabular-nums flex items-center justify-center border border-white leading-none">
                                  x{it.quantity || 1}
                                </span>
                              </div>

                              <div className="flex-1 min-w-0">
                                <div className="text-[13px] font-semibold text-[#1C1C1E] tracking-[-0.01em] truncate">
                                  {it.name}
                                </div>
                                <div className="flex items-center justify-between gap-1.5 mt-0.5">
                                  {(it.weight || it.format) && (
                                    <span className="text-[11px] font-medium text-[#6E6E73] bg-[#F2F2F7] px-2 py-0.5 rounded-md">
                                      {it.weight || it.format}
                                    </span>
                                  )}
                                  {it.price ? (
                                    <span className="text-[12px] font-semibold tabular-nums text-[#1C1C1E] shrink-0">
                                      {formatCLP(it.price * (it.quantity || 1))}
                                    </span>
                                  ) : null}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Botonera iOS 44pt */}
                    <div className="grid grid-cols-12 gap-2 pt-2 border-t border-[#3C3C43]/10">
                      <a
                        href={getSingleOrderNavigationUrl(order, activeRouteOrigin)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="col-span-3 ios-pressable min-h-[44px] px-2 rounded-[14px] bg-[#F2F2F7] active:bg-[#E5E5EA] text-[#1C1C1E] text-[12.5px] font-semibold flex items-center justify-center gap-1"
                        title="Abrir ruta en Google Maps"
                      >
                        <GoogleMapsIcon className="w-4 h-4 shrink-0" />
                        <span>Maps</span>
                      </a>

                      {phoneDigits ? (
                        <>
                          <a
                            href={`tel:+${phoneDigits}`}
                            className="col-span-2 ios-pressable min-h-[44px] rounded-[14px] bg-sky-50 active:bg-sky-100 text-sky-700 flex items-center justify-center"
                            title={`Llamar a ${order.customer}`}
                            aria-label={`Llamar a ${order.customer}`}
                          >
                            <Phone className="w-4 h-4 stroke-[2.25]" />
                          </a>
                          <a
                            href={`https://wa.me/${phoneDigits}?text=${encodeURIComponent(
                              `¡Hola ${order.customer}! Te contactamos de Patitas del Sur sobre tu pedido ${order.id}. 🐾`
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="col-span-3 ios-pressable min-h-[44px] px-2 rounded-[14px] bg-[#34C759]/14 active:bg-[#34C759]/22 text-[#248A3D] text-[12px] font-semibold flex items-center justify-center gap-1"
                            title="Avisar por WhatsApp"
                          >
                            <WhatsAppIcon className="w-4 h-4 shrink-0" />
                            <span className="truncate">Chat</span>
                          </a>
                        </>
                      ) : (
                        <div className="col-span-5 min-h-[44px] px-2 rounded-[14px] bg-slate-100 text-slate-400 text-[11px] font-semibold flex items-center justify-center">
                          Sin teléfono
                        </div>
                      )}

                      {order.status === 'en_preparacion' && (
                        <button
                          type="button"
                          onClick={() => onUpdateOrderStatus(order.id, 'en_camino')}
                          className="col-span-4 ios-pressable min-h-[44px] px-2.5 rounded-[14px] bg-[#D97706] active:bg-[#B45309] text-white font-bold text-[12.5px] cursor-pointer flex items-center justify-center gap-1 shadow-xs"
                        >
                          <Truck className="w-4 h-4 stroke-[2.25] shrink-0" />
                          <span className="truncate">Despachar</span>
                        </button>
                      )}
                      {order.status === 'en_camino' && (
                        <button
                          type="button"
                          onClick={() => onUpdateOrderStatus(order.id, 'entregado')}
                          className="col-span-4 ios-pressable min-h-[44px] px-2.5 rounded-[14px] bg-[#34C759] active:bg-[#248A3D] text-white font-bold text-[12.5px] cursor-pointer flex items-center justify-center gap-1 shadow-xs"
                        >
                          <CheckCircle2 className="w-4 h-4 stroke-[2.25] shrink-0" />
                          <span className="truncate">Entregar</span>
                        </button>
                      )}
                      {order.status === 'entregado' && (
                        <button
                          type="button"
                          onClick={() => onSelectOrderModal(order)}
                          className="col-span-4 ios-pressable min-h-[44px] px-2.5 rounded-[14px] bg-[#D97706]/12 active:bg-[#D97706]/20 text-[#D97706] font-bold text-[12.5px] cursor-pointer flex items-center justify-center gap-1"
                        >
                          <Eye className="w-4 h-4 shrink-0" />
                          <span className="truncate">Detalle</span>
                        </button>
                      )}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function AdminConfirmActionModal({
  isOpen,
  title,
  description,
  confirmLabel,
  cancelLabel = 'Cancelar',
  tone = 'danger',
  icon = 'logout',
  onConfirm,
  onCancel,
}) {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onCancel();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-[90] flex items-center justify-center p-4 animate-in fade-in duration-150"
      onClick={onCancel}
    >
      <div
        className="bg-white rounded-3xl max-w-sm w-full border border-slate-200 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5 space-y-3 text-center">
          <div
            className={`w-12 h-12 rounded-2xl mx-auto flex items-center justify-center ${
              tone === 'danger'
                ? 'bg-rose-100 text-rose-600'
                : 'bg-amber-100 text-[#D97706]'
            }`}
          >
            {icon === 'delete' ? (
              <Trash2 className="w-6 h-6" />
            ) : (
              <LogOut className="w-6 h-6" />
            )}
          </div>
          <h3 className="text-base font-black text-slate-900">{title}</h3>
          <p className="text-xs text-slate-600 leading-relaxed">{description}</p>
        </div>

        <div
          className="px-5 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center gap-2.5"
          style={{ paddingBottom: 'max(0.875rem, env(safe-area-inset-bottom))' }}
        >
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-2.5 px-4 rounded-xl bg-white border border-slate-200 text-slate-700 font-bold text-xs cursor-pointer hover:bg-slate-100 transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`flex-1 py-2.5 px-4 rounded-xl font-black text-xs text-white cursor-pointer transition-colors ${
              tone === 'danger'
                ? 'bg-rose-600 hover:bg-rose-700'
                : 'bg-[#D97706] hover:bg-[#B45309]'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
