import { supabase } from '../lib/supabase.js';

/**
 * Servicio cliente de Notificaciones Push (Web Push VAPID) y alertas sonoras
 * para la PWA del Panel de Administración de Patitas del Sur.
 */

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function isWebPushSupported() {
  return (
    typeof window !== 'undefined' &&
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    'Notification' in window
  );
}

export function isStandalonePwaMode() {
  if (typeof window === 'undefined') return false;
  return (
    Boolean(window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) ||
    window.navigator?.standalone === true
  );
}

export function isIosDevice() {
  if (typeof navigator === 'undefined') return false;
  return /iphone|ipad|ipod/i.test(navigator.userAgent || '');
}

async function fetchVapidPublicKey() {
  const envKey = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_VAPID_PUBLIC_KEY) || '';
  if (envKey.trim()) {
    return { configured: true, publicKey: envKey.trim() };
  }
  try {
    const res = await fetch('/api/admin-push-notify', { method: 'GET' });
    if (!res.ok) return { configured: false, publicKey: null };
    const data = await res.json();
    return {
      configured: Boolean(data?.configured && data?.publicKey),
      publicKey: data?.publicKey || null,
    };
  } catch {
    return { configured: false, publicKey: null };
  }
}

/**
 * Obtiene el estado actual de suscripción Push del dispositivo
 */
export async function getAdminPushStatus() {
  if (!isWebPushSupported()) {
    return {
      supported: false,
      subscribed: false,
      permission: typeof Notification !== 'undefined' ? Notification.permission : 'unsupported',
      requiresInstallOnIos: isIosDevice() && !isStandalonePwaMode(),
    };
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    const existingSub = await registration.pushManager.getSubscription();
    return {
      supported: true,
      subscribed: Boolean(existingSub),
      permission: Notification.permission,
      requiresInstallOnIos: false,
    };
  } catch {
    return {
      supported: true,
      subscribed: false,
      permission: Notification.permission,
      requiresInstallOnIos: false,
    };
  }
}

/**
 * Solicita permiso al usuario, suscribe el dispositivo al PushManager y guarda las llaves en Supabase
 */
export async function subscribeAdminToWebPush(user) {
  if (!isWebPushSupported()) {
    if (isIosDevice() && !isStandalonePwaMode()) {
      return {
        success: false,
        reason: 'ios_requires_install',
        message: 'En iPhone debes instalar la app en la Pantalla de Inicio para recibir notificaciones con el teléfono bloqueado.',
      };
    }
    return {
      success: false,
      reason: 'unsupported',
      message: 'Tu navegador no soporta notificaciones Push en segundo plano.',
    };
  }

  const permission =
    Notification.permission === 'granted'
      ? 'granted'
      : await Notification.requestPermission();

  if (permission !== 'granted') {
    return {
      success: false,
      reason: 'denied',
      message: 'Permiso de notificaciones denegado. Actívalo en Ajustes del navegador o del teléfono.',
    };
  }

  const { configured, publicKey } = await fetchVapidPublicKey();
  if (!configured || !publicKey) {
    return {
      success: false,
      reason: 'vapid_missing',
      message: 'Permiso concedido en el teléfono. Falta configurar VAPID_PUBLIC_KEY y VAPID_PRIVATE_KEY en Vercel para envío en segundo plano.',
    };
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    let subscription = await registration.pushManager.getSubscription();

    if (!subscription) {
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      });
    }

    const subJson = subscription.toJSON();
    const endpoint = subJson?.endpoint;
    const p256dh = subJson?.keys?.p256dh;
    const auth = subJson?.keys?.auth;

    if (!endpoint || !p256dh || !auth) {
      return {
        success: false,
        reason: 'invalid_subscription',
        message: 'No se pudieron obtener las llaves de suscripción Push del dispositivo.',
      };
    }

    const deviceLabel = isIosDevice()
      ? 'iPhone / iPad PWA'
      : /android/i.test(navigator.userAgent || '')
        ? 'Android PWA'
        : 'Escritorio Admin';

    const { error } = await supabase
      .from('admin_push_subscriptions')
      .upsert(
        {
          user_id: user?.auth_user_id || null,
          admin_email: user?.email || null,
          endpoint,
          p256dh,
          auth,
          device_label: deviceLabel,
          user_agent: (navigator.userAgent || '').slice(0, 250),
          active: true,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'endpoint' }
      );

    if (error) {
      console.warn('Error guardando suscripción Web Push en Supabase:', error.message);
      return {
        success: false,
        reason: 'db_error',
        message: 'No se pudo registrar este dispositivo en Supabase (verifica la migración admin_push_subscriptions).',
      };
    }

    return {
      success: true,
      message: '🔔 Notificaciones activadas: recibirás avisos de pedidos web incluso con la app cerrada.',
    };
  } catch (err) {
    console.error('Error suscribiendo a Web Push:', err);
    return {
      success: false,
      reason: 'subscribe_error',
      message: 'No se pudo activar la suscripción Push en este dispositivo.',
    };
  }
}

/**
 * Desactiva la suscripción Push del dispositivo actual
 */
export async function unsubscribeAdminFromWebPush() {
  if (!isWebPushSupported()) return { success: true };
  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    if (subscription) {
      const endpoint = subscription.endpoint;
      await subscription.unsubscribe();
      if (endpoint) {
        await supabase
          .from('admin_push_subscriptions')
          .update({ active: false, updated_at: new Date().toISOString() })
          .eq('endpoint', endpoint);
      }
    }
    return { success: true, message: 'Notificaciones Push desactivadas en este dispositivo.' };
  } catch (err) {
    console.warn('Error desuscribiendo Web Push:', err);
    return { success: false, message: 'No se pudo desactivar la suscripción Push.' };
  }
}

/**
 * Dispara el endpoint serverless de Push para avisar a los admins de un nuevo pedido web (best-effort)
 */
export function triggerAdminNewOrderPush(orderId, event = 'new_web_order') {
  if (!orderId || typeof fetch !== 'function') return;
  fetch('/api/admin-push-notify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ orderId, event }),
  }).catch(() => {
    // Best-effort: nunca bloquear el checkout del cliente
  });
}

/**
 * Reproducción sutil de campanilla y vibración al recibir un pedido web en tiempo real con la PWA abierta
 */
export function playNewOrderAlertFeedback() {
  try {
    if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
      navigator.vibrate([120, 60, 140]);
    }
  } catch {
    // ignore vibration errors
  }

  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;
    const notes = [880, 1174.66]; // A5 -> D6 (timbre amigable)
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + i * 0.12);
      gain.gain.setValueAtTime(0.001, now + i * 0.12);
      gain.gain.exponentialRampToValueAtTime(0.14, now + i * 0.12 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.12 + 0.24);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + i * 0.12);
      osc.stop(now + i * 0.12 + 0.26);
    });
    setTimeout(() => ctx.close().catch(() => {}), 700);
  } catch {
    // AudioContext bloqueado antes de interacción del usuario
  }
}
