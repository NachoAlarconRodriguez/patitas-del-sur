import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Bell,
  BellRing,
  BellOff,
  CheckCheck,
  ShoppingBag,
  Truck,
  CreditCard,
  PackageX,
  AlertTriangle,
  Wallet,
  CheckCircle2,
  XCircle,
  Loader2,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import {
  formatRelativeTimeEs,
  isNotificationUnreadForAdmin,
} from '../../../services/adminNotificationsService.js';

function getNotificationVisuals(item) {
  const cat = item?.category || 'order';
  const sev = item?.severity || 'info';
  const titleLower = String(item?.title || '').toLowerCase();

  if (cat === 'stock') {
    if (sev === 'critical') {
      return {
        icon: PackageX,
        iconBg: 'bg-rose-50 text-rose-600 border-rose-200',
        pillLabel: 'Sin stock',
        pillCls: 'bg-rose-50 text-rose-700 border-rose-200',
      };
    }
    return {
      icon: AlertTriangle,
      iconBg: 'bg-amber-50 text-amber-600 border-amber-200',
      pillLabel: 'Stock bajo',
      pillCls: 'bg-amber-50 text-amber-800 border-amber-200',
    };
  }

  if (cat === 'pos') {
    return {
      icon: Wallet,
      iconBg:
        sev === 'warning'
          ? 'bg-amber-50 text-amber-700 border-amber-200'
          : 'bg-indigo-50 text-indigo-600 border-indigo-200',
      pillLabel: 'POS',
      pillCls: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    };
  }

  if (cat === 'payment') {
    if (sev === 'critical') {
      return {
        icon: XCircle,
        iconBg: 'bg-rose-50 text-rose-600 border-rose-200',
        pillLabel: 'Pago',
        pillCls: 'bg-rose-50 text-rose-700 border-rose-200',
      };
    }
    if (sev === 'success') {
      return {
        icon: CreditCard,
        iconBg: 'bg-emerald-50 text-emerald-600 border-emerald-200',
        pillLabel: 'Pagado',
        pillCls: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      };
    }
    return {
      icon: CreditCard,
      iconBg: 'bg-amber-50 text-amber-700 border-amber-200',
      pillLabel: 'Cobranza',
      pillCls: 'bg-amber-50 text-amber-800 border-amber-200',
    };
  }

  if (cat === 'status') {
    if (titleLower.includes('cancelad')) {
      return {
        icon: XCircle,
        iconBg: 'bg-rose-50 text-rose-600 border-rose-200',
        pillLabel: 'Estado',
        pillCls: 'bg-rose-50 text-rose-700 border-rose-200',
      };
    }
    if (titleLower.includes('entregad')) {
      return {
        icon: CheckCircle2,
        iconBg: 'bg-emerald-50 text-emerald-600 border-emerald-200',
        pillLabel: 'Entregado',
        pillCls: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      };
    }
    return {
      icon: Truck,
      iconBg: 'bg-sky-50 text-sky-600 border-sky-200',
      pillLabel: 'Estado',
      pillCls: 'bg-sky-50 text-sky-700 border-sky-200',
    };
  }

  return {
    icon: ShoppingBag,
    iconBg: 'bg-[#FEF3C7] text-[#D97706] border-[#FDE68A]',
    pillLabel: 'Pedido',
    pillCls: 'bg-[#FEF3C7] text-[#92400E] border-[#FDE68A]',
  };
}

/**
 * Centro de Notificaciones Interactivo del Panel de Administración (Escritorio y Tablet)
 * Unifica en un solo botón:
 * - Feed en vivo de nuevos pedidos, cambios de estado, pagos, alertas de stock y eventos POS
 * - Interruptor de Alertas Push del navegador (app cerrada / segundo plano)
 */
export default function AdminNotificationCenter({
  persistedNotifications = [],
  liveAlerts = [],
  readLiveKeys = new Set(),
  adminEmail = '',
  migrationPending = false,
  pushStatus = { subscribed: false, permission: 'default', supported: true },
  isTogglingPush = false,
  onTogglePush,
  onMarkOneRead,
  onMarkAllRead,
  onSelectNotification,
  onGoToOrders,
  onGoToLowStock,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState('all'); // 'all' | 'orders' | 'stock' | 'pos'
  const containerRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return undefined;
    const onMouseDown = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    const onKeyDown = (e) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('mousedown', onMouseDown);
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [isOpen]);

  // Combinar alertas activas en vivo (no leídas primero) + historial cronológico persistido
  const allItems = useMemo(() => {
    const taggedLive = (liveAlerts || []).map((a) => ({
      ...a,
      _unread: isNotificationUnreadForAdmin(a, adminEmail, readLiveKeys),
    }));
    const taggedPersisted = (persistedNotifications || []).map((n) => ({
      ...n,
      _unread: isNotificationUnreadForAdmin(n, adminEmail, readLiveKeys),
    }));

    const severityRank = { critical: 0, warning: 1, info: 2, success: 3 };
    const sortedLive = [...taggedLive].sort((a, b) => {
      if (a._unread !== b._unread) return a._unread ? -1 : 1;
      return (severityRank[a.severity] ?? 2) - (severityRank[b.severity] ?? 2);
    });

    const sortedPersisted = [...taggedPersisted].sort((a, b) => {
      const ta = a.created_at ? new Date(a.created_at).getTime() : 0;
      const tb = b.created_at ? new Date(b.created_at).getTime() : 0;
      return tb - ta;
    });

    // En la vista general, poner alertas críticas/activas no leídas arriba y luego el historial cronológico
    const unreadLive = sortedLive.filter((a) => a._unread);
    const readLive = sortedLive.filter((a) => !a._unread);
    return [...unreadLive, ...sortedPersisted, ...readLive];
  }, [liveAlerts, persistedNotifications, adminEmail, readLiveKeys]);

  const counts = useMemo(() => {
    const unread = allItems.filter((i) => i._unread);
    return {
      totalUnread: unread.length,
      ordersUnread: unread.filter((i) => ['order', 'status', 'payment'].includes(i.category)).length,
      stockUnread: unread.filter((i) => i.category === 'stock').length,
      posUnread: unread.filter((i) => i.category === 'pos').length,
    };
  }, [allItems]);

  const filteredItems = useMemo(() => {
    if (filter === 'orders') {
      return allItems.filter((i) => ['order', 'status', 'payment'].includes(i.category));
    }
    if (filter === 'stock') {
      return allItems.filter((i) => i.category === 'stock');
    }
    if (filter === 'pos') {
      return allItems.filter((i) => i.category === 'pos');
    }
    return allItems;
  }, [allItems, filter]);

  const badgeText = counts.totalUnread > 99 ? '99+' : String(counts.totalUnread);

  return (
    <div ref={containerRef} className="relative">
      {/* Botón único de campana en Header */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`relative w-10 h-10 rounded-full border flex items-center justify-center transition-all cursor-pointer ${
          isOpen
            ? 'bg-[#FAF8F4] border-[#D97706] text-[#D97706] ring-2 ring-[#D97706]/15'
            : 'bg-white hover:bg-[#FAF8F4] border-[#EAECEF] text-slate-600 hover:text-[#111827]'
        }`}
        aria-label="Abrir centro de notificaciones"
        aria-expanded={isOpen}
        title={
          counts.totalUnread > 0
            ? `${counts.totalUnread} notificaciones sin leer`
            : 'Centro de notificaciones'
        }
      >
        {pushStatus.subscribed ? (
          <BellRing className={`w-4 h-4 ${isOpen ? 'text-[#D97706]' : 'text-slate-700'}`} />
        ) : (
          <Bell className="w-4 h-4" />
        )}
        {counts.totalUnread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-rose-500 text-white text-[9px] font-black flex items-center justify-center border-2 border-white tabular-nums shadow-xs">
            {badgeText}
          </span>
        )}
      </button>

      {/* Popover Centro de Notificaciones */}
      {isOpen && (
        <div
          role="dialog"
          aria-label="Centro de notificaciones"
          className="absolute right-0 top-full mt-2.5 w-[430px] max-w-[92vw] bg-white border border-[#EAECEF] rounded-3xl shadow-[0_24px_64px_-12px_rgba(15,23,42,0.24)] overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150"
        >
          {/* Header */}
          <div className="p-4 pb-3 border-b border-[#EAECEF] bg-[#FAF8F4]/70 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-black text-[#111827] tracking-tight">
                  Notificaciones
                </h3>
                {counts.totalUnread > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 text-[10px] font-black tabular-nums">
                    {counts.totalUnread} nuevas
                  </span>
                )}
              </div>

              {counts.totalUnread > 0 && (
                <button
                  type="button"
                  onClick={() => onMarkAllRead?.()}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-[#D97706] hover:text-[#B45309] transition-colors cursor-pointer"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  <span>Marcar todo leído</span>
                </button>
              )}
            </div>

            {/* Interruptor integrado de Alertas Push (unifica las 2 campanas) */}
            <div className="flex items-center justify-between gap-2 px-3 py-2 rounded-2xl bg-white border border-[#EAECEF]">
              <div className="flex items-center gap-2 min-w-0">
                {pushStatus.subscribed ? (
                  <BellRing className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                ) : pushStatus.permission === 'denied' ? (
                  <BellOff className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                ) : (
                  <Bell className="w-3.5 h-3.5 text-[#D97706] shrink-0" />
                )}
                <div className="min-w-0 leading-tight">
                  <div className="text-[11px] font-extrabold text-[#111827] truncate">
                    Alertas Push en este equipo
                  </div>
                  <div className="text-[10px] text-slate-500 truncate">
                    {pushStatus.subscribed
                      ? 'Activas para nuevos pedidos en segundo plano'
                      : pushStatus.permission === 'denied'
                        ? 'Bloqueadas en el navegador'
                        : 'Recibe avisos aunque cierres la pestaña'}
                  </div>
                </div>
              </div>
              <button
                type="button"
                disabled={isTogglingPush}
                onClick={() => onTogglePush?.()}
                className={`px-3 py-1 rounded-full text-[10px] font-extrabold transition-colors cursor-pointer shrink-0 disabled:opacity-50 ${
                  pushStatus.subscribed
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                    : 'bg-[#111827] text-white hover:bg-slate-800'
                }`}
              >
                {isTogglingPush ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : pushStatus.subscribed ? (
                  'Activas'
                ) : (
                  'Activar'
                )}
              </button>
            </div>

            {/* Filtros por categoría */}
            <div className="flex items-center gap-1.5">
              {[
                { id: 'all', label: 'Todas', count: counts.totalUnread },
                { id: 'orders', label: 'Pedidos', count: counts.ordersUnread },
                { id: 'stock', label: 'Stock', count: counts.stockUnread },
                { id: 'pos', label: 'POS / Caja', count: counts.posUnread },
              ].map((tab) => {
                const isSel = filter === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setFilter(tab.id)}
                    className={`px-2.5 py-1 rounded-full text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer border ${
                      isSel
                        ? 'bg-[#D97706] text-white border-[#D97706]'
                        : 'bg-white text-slate-600 border-[#EAECEF] hover:bg-[#FEF3C7]/40'
                    }`}
                  >
                    <span>{tab.label}</span>
                    {tab.count > 0 && (
                      <span
                        className={`text-[9px] font-black px-1.5 rounded-full tabular-nums ${
                          isSel ? 'bg-white/25 text-white' : 'bg-rose-100 text-rose-700'
                        }`}
                      >
                        {tab.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Aviso discreto si falta correr el SQL de persistencia */}
          {migrationPending && (
            <div className="px-4 py-2 bg-amber-50 border-b border-amber-200 text-[10px] font-semibold text-amber-900">
              Historial en modo local. Ejecuta{' '}
              <code className="font-mono bg-white px-1 rounded">20261124_admin_notifications_center.sql</code>{' '}
              en Supabase para sincronizar entre socios.
            </div>
          )}

          {/* Lista de Notificaciones */}
          <div className="max-h-[410px] overflow-y-auto divide-y divide-slate-100">
            {filteredItems.length === 0 ? (
              <div className="py-12 px-6 text-center space-y-2">
                <div className="w-11 h-11 rounded-2xl bg-[#FAF8F4] border border-[#FDE68A] text-[#D97706] mx-auto flex items-center justify-center">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div className="text-xs font-extrabold text-[#111827]">Todo al día</div>
                <p className="text-[11px] text-slate-400">
                  No hay notificaciones ni alertas en esta categoría por ahora.
                </p>
              </div>
            ) : (
              filteredItems.slice(0, 40).map((item) => {
                const visuals = getNotificationVisuals(item);
                const Icon = visuals.icon;
                const isUnread = item._unread;

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      if (isUnread) onMarkOneRead?.(item);
                      setIsOpen(false);
                      onSelectNotification?.(item);
                    }}
                    className={`w-full px-4 py-3 text-left flex items-start gap-3 transition-colors cursor-pointer group ${
                      isUnread
                        ? 'bg-[#FFFBEB]/55 hover:bg-[#FEF3C7]/45'
                        : 'bg-white hover:bg-[#F8FAFC]'
                    }`}
                  >
                    <div
                      className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 mt-0.5 ${visuals.iconBg}`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>

                    <div className="min-w-0 flex-1 space-y-0.5">
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-xs font-extrabold text-[#111827] leading-snug">
                          {item.title}
                        </span>
                        {isUnread && (
                          <span className="w-2 h-2 rounded-full bg-[#D97706] shrink-0 mt-1.5" />
                        )}
                      </div>

                      <p className="text-[11px] text-slate-600 leading-snug line-clamp-2">
                        {item.message}
                      </p>

                      <div className="flex items-center justify-between gap-2 pt-1 text-[10px] text-slate-400 font-semibold">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span
                            className={`px-1.5 py-0.2 rounded-md border text-[9px] font-bold ${visuals.pillCls}`}
                          >
                            {visuals.pillLabel}
                          </span>
                          {item.actor_name && (
                            <span className="truncate">{item.actor_name}</span>
                          )}
                        </div>
                        <span className="shrink-0 tabular-nums">
                          {item.isLiveAlert ? 'En vivo' : formatRelativeTimeEs(item.created_at)}
                        </span>
                      </div>
                    </div>

                    <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-[#D97706] shrink-0 mt-2.5 transition-colors" />
                  </button>
                );
              })
            )}
          </div>

          {/* Footer de accesos rápidos */}
          <div className="px-4 py-2.5 bg-[#F8FAFC] border-t border-[#EAECEF] flex items-center justify-between gap-2 text-[11px]">
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                onGoToOrders?.();
              }}
              className="font-bold text-slate-600 hover:text-[#D97706] transition-colors cursor-pointer"
            >
              Ver todos los pedidos
            </button>
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                onGoToLowStock?.();
              }}
              className="font-bold text-slate-600 hover:text-[#D97706] transition-colors cursor-pointer"
            >
              Revisar stock bajo →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
