import { createClient } from '@supabase/supabase-js';

let cachedWebPush = null;
async function getWebPush() {
  if (!cachedWebPush) {
    const mod = await import('web-push');
    cachedWebPush = mod.default || mod;
  }
  return cachedWebPush;
}

const SUPABASE_URL =
  process.env.VITE_SUPABASE_URL ||
  process.env.SUPABASE_URL ||
  'https://onouflypoewijovavkec.supabase.co';

const SUPABASE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.VITE_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9ub3VmbHlwb2V3aWpvdmF2a2VjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTIzOTA5MzksImV4cCI6MjEwNzk2NjkzOX0.CgguuTDxIPqNYHQePsivaDMowZo6nkdmD24J1LzZ8mQ';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

function getVapidConfig() {
  const publicKey = (process.env.VAPID_PUBLIC_KEY || process.env.VITE_VAPID_PUBLIC_KEY || '').trim();
  const privateKey = (process.env.VAPID_PRIVATE_KEY || '').trim();
  const subject = (process.env.VAPID_SUBJECT || 'mailto:patitasdelsur.cl@gmail.com').trim();
  return { publicKey, privateKey, subject };
}

function formatCLPServer(val) {
  return '$' + Math.round(Number(val) || 0).toLocaleString('es-CL');
}

/**
 * Envía una notificación Web Push a todos los dispositivos de administradores suscritos.
 * Puede invocarse tanto desde el endpoint HTTP /api/admin-push-notify como directamente desde
 * otros endpoints serverless (ej. /api/mercadopago-webhook).
 */
export async function sendAdminOrderPushNotification({
  orderId,
  customerName,
  total,
  city,
  deliverySlot,
  event = 'new_web_order',
  paymentMethod,
} = {}) {
  const { publicKey, privateKey, subject } = getVapidConfig();

  if (!publicKey || !privateKey) {
    return {
      sent: 0,
      skipped: true,
      reason: 'VAPID keys not configured (set VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY)',
    };
  }

  const webpush = await getWebPush();
  webpush.setVapidDetails(subject, publicKey, privateKey);

  const { data: subscriptions, error: subErr } = await supabase
    .from('admin_push_subscriptions')
    .select('id, endpoint, p256dh, auth')
    .eq('active', true);

  if (subErr) {
    console.warn('Error leyendo admin_push_subscriptions:', subErr.message);
    return { sent: 0, error: subErr.message };
  }

  if (!Array.isArray(subscriptions) || subscriptions.length === 0) {
    return { sent: 0, totalSubscriptions: 0 };
  }

  const isUrgent = /urgente|domingo/i.test(String(deliverySlot || ''));
  const cleanId = orderId || 'Nuevo';
  const cleanCustomer = customerName || 'Cliente Web';
  const cleanCity = city || 'Frutillar';
  const formattedTotal = formatCLPServer(total);

  let title = isUrgent
    ? `⚡ Pedido Urgente Web ${cleanId}`
    : `🐾 Nuevo Pedido Web ${cleanId}`;
  let body = `${cleanCustomer} · ${formattedTotal} · ${cleanCity}`;

  if (event === 'payment_approved') {
    title = `✅ Pago Web Aprobado ${cleanId}`;
    body = `${cleanCustomer} pagó ${formattedTotal} (${paymentMethod || 'Mercado Pago'}) · ${cleanCity}`;
  } else if (deliverySlot) {
    body = `${cleanCustomer} · ${formattedTotal} · ${cleanCity} (${deliverySlot})`;
  }

  const payload = JSON.stringify({
    title,
    body,
    tag: `patitas-order-${cleanId}-${event}`,
    orderId: cleanId,
    url: `/admin?tab=pedidos&order=${encodeURIComponent(cleanId)}`,
    icon: '/pwa-icon-192.png',
    badge: '/pwa-icon-192.png',
    requireInteraction: isUrgent,
  });

  let sent = 0;
  const expiredIds = [];

  await Promise.all(
    subscriptions.map(async (sub) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: {
              p256dh: sub.p256dh,
              auth: sub.auth,
            },
          },
          payload,
          { TTL: 3600, urgency: isUrgent ? 'high' : 'normal' }
        );
        sent += 1;
      } catch (pushErr) {
        const statusCode = pushErr?.statusCode || pushErr?.status;
        if (statusCode === 404 || statusCode === 410) {
          expiredIds.push(sub.id);
        } else {
          console.warn('Error enviando Web Push a dispositivo admin:', statusCode, pushErr?.message);
        }
      }
    })
  );

  if (expiredIds.length > 0) {
    await supabase
      .from('admin_push_subscriptions')
      .update({ active: false, updated_at: new Date().toISOString() })
      .in('id', expiredIds);
  }

  return {
    sent,
    totalSubscriptions: subscriptions.length,
    pruned: expiredIds.length,
  };
}

/**
 * Serverless Endpoint: /api/admin-push-notify
 * - GET: devuelve la llave pública VAPID y estado de configuración
 * - POST: valida que el pedido exista en Supabase y envía Web Push a todos los dispositivos admin suscritos
 */
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { publicKey, privateKey } = getVapidConfig();

  if (req.method === 'GET') {
    return res.status(200).json({
      configured: Boolean(publicKey && privateKey),
      publicKey: publicKey || null,
    });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    const { orderId, event = 'new_web_order' } = body;

    if (!orderId) {
      return res.status(400).json({ error: 'orderId requerido' });
    }

    // Verificar contra Supabase que el pedido exista realmente para evitar spam al endpoint público
    const { data: orderRow, error: orderErr } = await supabase
      .from('orders')
      .select('id, customer_name, total, city, delivery_slot, payment_method, channel')
      .eq('id', String(orderId))
      .maybeSingle();

    if (orderErr || !orderRow) {
      return res.status(404).json({ error: 'Pedido no encontrado' });
    }

    const result = await sendAdminOrderPushNotification({
      orderId: orderRow.id,
      customerName: orderRow.customer_name,
      total: orderRow.total,
      city: orderRow.city,
      deliverySlot: orderRow.delivery_slot,
      paymentMethod: orderRow.payment_method,
      event,
    });

    return res.status(200).json({ ok: true, ...result });
  } catch (err) {
    console.error('Error en /api/admin-push-notify:', err);
    return res.status(500).json({ ok: false, error: err.message });
  }
}
