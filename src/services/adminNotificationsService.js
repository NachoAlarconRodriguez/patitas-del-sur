import { supabase } from '../lib/supabase.js';
import { formatCLP } from '../views/admin/adminUtils.js';

/**
 * Servicio del Centro de Notificaciones Administrativas en Vivo
 * - Persistencia en Supabase (public.admin_notifications) con fallback local
 * - Lectura independiente por socio (read_by_emails + localStorage)
 * - Motor de alertas activas derivadas en tiempo real (stock agotado/bajo, cobros pendientes, caja POS)
 */

const LS_NOTIFS_FALLBACK_KEY = 'patitas_admin_notifications_fallback_v1';
const LS_READ_LIVE_PREFIX = 'patitas_admin_read_live_alerts_v1_';

const recentDedupeMap = new Map();

function getChileTodayIso() {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Santiago',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
}

function isTableMissingError(error) {
  if (!error) return false;
  const code = String(error.code || '');
  const msg = String(error.message || '').toLowerCase();
  return (
    code === '42P01' ||
    code === 'PGRST205' ||
    msg.includes('does not exist') ||
    msg.includes('could not find the table') ||
    msg.includes('schema cache')
  );
}

function normalizeEmailKey(email) {
  return String(email || 'admin@patitasdelsur.cl').trim().toLowerCase() || 'admin@patitasdelsur.cl';
}

function readLocalNotifs() {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(LS_NOTIFS_FALLBACK_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeLocalNotifs(list) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LS_NOTIFS_FALLBACK_KEY, JSON.stringify((list || []).slice(0, 80)));
  } catch {
    // ignore storage errors
  }
}

export function getReadLiveAlertKeys(adminEmail) {
  if (typeof window === 'undefined') return new Set();
  try {
    const raw = localStorage.getItem(`${LS_READ_LIVE_PREFIX}${normalizeEmailKey(adminEmail)}`);
    const parsed = raw ? JSON.parse(raw) : [];
    return new Set(Array.isArray(parsed) ? parsed : []);
  } catch {
    return new Set();
  }
}

export function saveReadLiveAlertKeys(adminEmail, keysSet) {
  if (typeof window === 'undefined') return;
  try {
    const arr = Array.from(keysSet || []).slice(-200);
    localStorage.setItem(`${LS_READ_LIVE_PREFIX}${normalizeEmailKey(adminEmail)}`, JSON.stringify(arr));
  } catch {
    // ignore
  }
}

export function formatRelativeTimeEs(isoDate) {
  if (!isoDate) return 'Ahora';
  const ts = new Date(isoDate).getTime();
  if (!Number.isFinite(ts)) return '';
  const diffSec = Math.max(0, Math.floor((Date.now() - ts) / 1000));
  if (diffSec < 45) return 'Ahora';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `Hace ${diffMin} min`;
  const diffHrs = Math.floor(diffMin / 60);
  if (diffHrs < 24) return `Hace ${diffHrs} h`;
  const diffDays = Math.floor(diffHrs / 24);
  const timeStr = new Intl.DateTimeFormat('es-CL', {
    timeZone: 'America/Santiago',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(ts));
  if (diffDays === 1) return `Ayer ${timeStr}`;
  const dateStr = new Intl.DateTimeFormat('es-CL', {
    timeZone: 'America/Santiago',
    day: '2-digit',
    month: 'short',
  }).format(new Date(ts));
  return `${dateStr} · ${timeStr}`;
}

export function isNotificationUnreadForAdmin(item, adminEmail, readLiveKeys = new Set()) {
  if (!item) return false;
  if (item.isLiveAlert) {
    return !readLiveKeys.has(item.liveKey || item.id);
  }
  const emailKey = normalizeEmailKey(adminEmail);
  const readList = Array.isArray(item.read_by_emails) ? item.read_by_emails : [];
  return !readList.some((e) => normalizeEmailKey(e) === emailKey);
}

// =========================================================================
// 1. PERSISTENCIA EN SUPABASE (CON FALLBACK LOCAL AUTOMÁTICO)
// =========================================================================

export async function fetchAdminNotifications(limit = 60) {
  try {
    const { data, error } = await supabase
      .from('admin_notifications')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      if (isTableMissingError(error)) {
        return { notifications: readLocalNotifs(), migrationPending: true };
      }
      throw error;
    }

    return { notifications: data || [], migrationPending: false };
  } catch (err) {
    console.warn('Error fetching admin notifications:', err);
    return { notifications: readLocalNotifs(), migrationPending: true };
  }
}

export async function createAdminNotification({
  category = 'order',
  severity = 'info',
  title,
  message,
  entityType = null,
  entityId = null,
  actorName = 'Sistema',
  metadata = {},
}) {
  if (!title || !message) return { success: false };

  // Deduplicación corta (3 segundos) para evitar duplicados entre acción local y evento Realtime
  const dedupeKey = `${category}|${entityId || ''}|${title}|${message}`;
  const now = Date.now();
  const prevTs = recentDedupeMap.get(dedupeKey);
  if (prevTs && now - prevTs < 3500) {
    return { success: true, deduplicated: true };
  }
  recentDedupeMap.set(dedupeKey, now);

  const payload = {
    category,
    severity,
    title: String(title).trim(),
    message: String(message).trim(),
    entity_type: entityType || null,
    entity_id: entityId ? String(entityId) : null,
    actor_name: actorName || 'Sistema',
    metadata: metadata && typeof metadata === 'object' ? metadata : {},
    read_by_emails: [],
  };

  try {
    const { data, error } = await supabase
      .from('admin_notifications')
      .insert(payload)
      .select()
      .single();

    if (error) {
      if (isTableMissingError(error)) {
        const localItem = {
          ...payload,
          id: `LOCAL-NOTIF-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          created_at: new Date().toISOString(),
        };
        const nextList = [localItem, ...readLocalNotifs()];
        writeLocalNotifs(nextList);
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('patitas_admin_notifications_updated'));
        }
        return { success: true, notification: localItem, migrationPending: true };
      }
      throw error;
    }

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('patitas_admin_notifications_updated'));
    }
    return { success: true, notification: data, migrationPending: false };
  } catch (err) {
    console.warn('Error creating admin notification:', err);
    return { success: false, error: err };
  }
}

export async function markAdminNotificationRead(notification, adminEmail) {
  if (!notification?.id) return { success: false };
  const emailKey = normalizeEmailKey(adminEmail);

  if (notification.isLiveAlert) {
    const keys = getReadLiveAlertKeys(emailKey);
    keys.add(notification.liveKey || notification.id);
    saveReadLiveAlertKeys(emailKey, keys);
    return { success: true, isLiveAlert: true };
  }

  const prevRead = Array.isArray(notification.read_by_emails) ? notification.read_by_emails : [];
  if (prevRead.some((e) => normalizeEmailKey(e) === emailKey)) {
    return { success: true, alreadyRead: true };
  }
  const nextRead = Array.from(new Set([...prevRead.map(normalizeEmailKey), emailKey]));

  if (String(notification.id).startsWith('LOCAL-NOTIF-')) {
    const list = readLocalNotifs().map((n) =>
      n.id === notification.id ? { ...n, read_by_emails: nextRead } : n
    );
    writeLocalNotifs(list);
    return { success: true };
  }

  try {
    const { error } = await supabase
      .from('admin_notifications')
      .update({ read_by_emails: nextRead })
      .eq('id', notification.id);

    if (error) throw error;
    return { success: true };
  } catch (err) {
    console.warn('Error marking notification read:', err);
    return { success: false, error: err };
  }
}

export async function markAllAdminNotificationsRead({
  persistedNotifications = [],
  liveAlerts = [],
  adminEmail,
}) {
  const emailKey = normalizeEmailKey(adminEmail);

  // 1. Marcar todas las alertas en vivo actuales
  if (liveAlerts.length > 0) {
    const keys = getReadLiveAlertKeys(emailKey);
    liveAlerts.forEach((a) => keys.add(a.liveKey || a.id));
    saveReadLiveAlertKeys(emailKey, keys);
  }

  // 2. Marcar todas las notificaciones persistentes no leídas
  const unreadPersisted = (persistedNotifications || []).filter((n) => {
    const list = Array.isArray(n.read_by_emails) ? n.read_by_emails : [];
    return !list.some((e) => normalizeEmailKey(e) === emailKey);
  });

  const localUnreadIds = new Set(
    unreadPersisted.filter((n) => String(n.id).startsWith('LOCAL-NOTIF-')).map((n) => n.id)
  );
  if (localUnreadIds.size > 0) {
    const nextLocal = readLocalNotifs().map((n) => {
      if (!localUnreadIds.has(n.id)) return n;
      const nextRead = Array.from(
        new Set([...(Array.isArray(n.read_by_emails) ? n.read_by_emails : []).map(normalizeEmailKey), emailKey])
      );
      return { ...n, read_by_emails: nextRead };
    });
    writeLocalNotifs(nextLocal);
  }

  const dbUnread = unreadPersisted.filter((n) => !String(n.id).startsWith('LOCAL-NOTIF-'));
  if (dbUnread.length > 0) {
    await Promise.all(
      dbUnread.map((n) => {
        const nextRead = Array.from(
          new Set([...(Array.isArray(n.read_by_emails) ? n.read_by_emails : []).map(normalizeEmailKey), emailKey])
        );
        return supabase
          .from('admin_notifications')
          .update({ read_by_emails: nextRead })
          .eq('id', n.id)
          .then(() => {})
          .catch(() => {});
      })
    );
  }

  return { success: true };
}

// =========================================================================
// 2. MOTOR DE ALERTAS ACTIVAS EN VIVO (STOCK, COBROS PENDIENTES, CAJA POS)
// =========================================================================

export function buildLiveSystemAlerts({ inventory = [], orders = [], posRegisters = [] } = {}) {
  const alerts = [];
  const todayIso = getChileTodayIso();

  // A. Productos agotados (stock <= 0, activos y no pausados)
  const activeProds = (inventory || []).filter((p) => p && !p.isPaused && p.isActive !== false);
  const outOfStock = activeProds.filter((p) => (Number(p.stock) || 0) <= 0);
  const lowStock = activeProds.filter((p) => {
    const st = Number(p.stock) || 0;
    const min = Number(p.minStock || p.min_stock) || 5;
    return st > 0 && st <= min;
  });

  outOfStock.forEach((p) => {
    alerts.push({
      id: `live-oos-${p.id}`,
      liveKey: `live-oos-${p.id}-0`,
      isLiveAlert: true,
      category: 'stock',
      severity: 'critical',
      title: `Sin stock: ${p.name}`,
      message: `${p.brand || 'Producto'} (${p.format || 'unidad'}) llegó a 0 unidades disponibles.`,
      entity_type: 'product',
      entity_id: p.id,
      actor_name: 'Control Inventario',
      metadata: { productName: p.name, stock: 0 },
      created_at: p.updated_at || new Date().toISOString(),
    });
  });

  lowStock.forEach((p) => {
    const st = Number(p.stock) || 0;
    const min = Number(p.minStock || p.min_stock) || 5;
    alerts.push({
      id: `live-low-${p.id}`,
      liveKey: `live-low-${p.id}-${st}`,
      isLiveAlert: true,
      category: 'stock',
      severity: 'warning',
      title: `Stock bajo (${st} u.): ${p.name}`,
      message: `Quedan ${st} unidades de ${p.format || 'formato'} (mínimo configurado: ${min}).`,
      entity_type: 'product',
      entity_id: p.id,
      actor_name: 'Control Inventario',
      metadata: { productName: p.name, stock: st, minStock: min },
      created_at: p.updated_at || new Date().toISOString(),
    });
  });

  // B. Pagos rechazados recientes (excluyendo checkouts abandonados/expirados y pedidos ya cancelados)
  const rejectedOrders = (orders || []).filter(
    (o) =>
      String(o.status || '').toLowerCase() !== 'cancelado' &&
      ['rechazado', 'rejected', 'failed'].includes(String(o.paymentStatus || '').toLowerCase())
  );
  rejectedOrders.slice(0, 5).forEach((o) => {
    alerts.push({
      id: `live-rej-${o.id}`,
      liveKey: `live-rej-${o.id}`,
      isLiveAlert: true,
      category: 'payment',
      severity: 'critical',
      title: `Pago rechazado en ${o.id}`,
      message: `${o.customer || 'Cliente'} · ${formatCLP(o.total || 0)} requiere gestionar cobro.`,
      entity_type: 'order',
      entity_id: o.id,
      actor_name: 'Cobranza',
      metadata: { orderId: o.id },
      created_at: o.created_at || new Date().toISOString(),
    });
  });

  // C. Pedidos entregados con pago pendiente (alerta consolidada accionable, excluyendo abandonados MP)
  const deliveredUnpaid = (orders || []).filter(
    (o) =>
      o.status === 'entregado' &&
      String(o.paymentStatus || '').toLowerCase() === 'pendiente' &&
      !String(o.paymentMethod || '').toLowerCase().includes('mercado pago')
  );
  if (deliveredUnpaid.length > 0) {
    const unpaidSum = deliveredUnpaid.reduce((acc, o) => acc + (Number(o.total) || 0), 0);
    alerts.push({
      id: `live-unpaid-delivered`,
      liveKey: `live-unpaid-delivered-${deliveredUnpaid.length}-${unpaidSum}`,
      isLiveAlert: true,
      category: 'payment',
      severity: 'warning',
      title: `${deliveredUnpaid.length} ${deliveredUnpaid.length === 1 ? 'pedido entregado' : 'pedidos entregados'} por cobrar`,
      message: `Saldo pendiente de recaudar: ${formatCLP(unpaidSum)}. Haz clic para revisar en Pedidos.`,
      entity_type: 'orders_unpaid_filter',
      entity_id: 'entregado_pendiente',
      actor_name: 'Cobranza',
      metadata: { count: deliveredUnpaid.length, total: unpaidSum },
      created_at: deliveredUnpaid[0]?.created_at || new Date().toISOString(),
    });
  }

  // D. Caja POS abierta de un día anterior sin cerrar
  const staleOpenRegister = (posRegisters || []).find(
    (r) => r.status === 'abierta' && r.business_date && String(r.business_date).slice(0, 10) < todayIso
  );
  if (staleOpenRegister) {
    alerts.push({
      id: `live-stale-pos-${staleOpenRegister.id}`,
      liveKey: `live-stale-pos-${staleOpenRegister.id}`,
      isLiveAlert: true,
      category: 'pos',
      severity: 'warning',
      title: `Caja POS abierta de fecha anterior`,
      message: `La caja ${staleOpenRegister.id} (${staleOpenRegister.business_date}) abierta por ${staleOpenRegister.opened_by_name} sigue abierta. Recuerda cerrarla para registrar las horas.`,
      entity_type: 'pos_register',
      entity_id: staleOpenRegister.id,
      actor_name: 'Terminal POS',
      metadata: { registerId: staleOpenRegister.id },
      created_at: staleOpenRegister.opened_at || new Date().toISOString(),
    });
  }

  return alerts;
}
