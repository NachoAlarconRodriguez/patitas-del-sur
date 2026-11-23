import crypto from 'node:crypto';
import { createClient } from '@supabase/supabase-js';
import { MercadoPagoConfig, Order } from 'mercadopago';
import { sendAdminOrderPushNotification } from './admin-push-notify.js';

const SUPABASE_URL =
  process.env.VITE_SUPABASE_URL ||
  process.env.SUPABASE_URL ||
  'https://onouflypoewijovavkec.supabase.co';

const SUPABASE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.VITE_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9ub3VmbHlwb2V3aWpvdmF2a2VjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTIzOTA5MzksImV4cCI6MjEwNzk2NjkzOX0.CgguuTDxIPqNYHQePsivaDMowZo6nkdmD24J1LzZ8mQ';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

/**
 * Valida la firma HMAC-SHA256 de Mercado Pago cuando MP_WEBHOOK_SECRET está configurado
 */
function verifyWebhookSignature(req, bodyData, secret) {
  if (!secret) return true;

  const xSignature = req.headers?.['x-signature'] || '';
  const xRequestId = req.headers?.['x-request-id'] || '';

  let urlDataId = '';
  try {
    const parsedUrl = new URL(req.url || '', 'http://localhost');
    urlDataId = parsedUrl.searchParams.get('data.id') || parsedUrl.searchParams.get('id') || '';
  } catch {
    urlDataId = '';
  }

  const queryDataId =
    urlDataId ||
    req.query?.['data.id'] ||
    req.query?.id ||
    bodyData?.data?.id ||
    '';
  const dataId = String(queryDataId).toLowerCase();

  if (!xSignature) return false;

  let ts = null;
  let hash = null;
  for (const part of xSignature.split(',')) {
    const eq = part.indexOf('=');
    if (eq === -1) continue;
    const key = part.slice(0, eq).trim();
    const val = part.slice(eq + 1).trim();
    if (key === 'ts') ts = val;
    if (key === 'v1') hash = val;
  }

  if (!ts || !hash) return false;

  const parts = [];
  if (dataId) parts.push(`id:${dataId}`);
  if (xRequestId) parts.push(`request-id:${xRequestId}`);
  parts.push(`ts:${ts}`);
  const manifest = `${parts.join(';')};`;

  const computed = crypto.createHmac('sha256', secret).update(manifest).digest('hex');
  const computedBuf = Buffer.from(computed);
  const hashBuf = Buffer.from(hash);

  if (computedBuf.length !== hashBuf.length) return false;
  return crypto.timingSafeEqual(computedBuf, hashBuf);
}

/**
 * Serverless Endpoint: Recepción de Webhooks de Mercado Pago (Orders API v1)
 * URL de configuración en Mercado Pago: https://www.patitas-delsur.cl/api/mercadopago-webhook
 * Documentación: https://www.mercadopago.cl/developers/es/docs/checkout-pro-orders/notifications
 */
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-signature, x-request-id');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    return res.status(200).json({
      status: 'ok',
      endpoint: '/api/mercadopago-webhook',
      message: 'Webhook de Mercado Pago activo para Patitas del Sur',
      configured: {
        accessToken: Boolean(process.env.MP_ACCESS_TOKEN?.trim()),
        webhookSecret: Boolean(process.env.MP_WEBHOOK_SECRET?.trim()),
        supabaseServiceRole: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()),
      },
    });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    let webhookSecret = process.env.MP_WEBHOOK_SECRET?.trim() || null;
    let accessToken = process.env.MP_ACCESS_TOKEN?.trim() || null;

    if (!webhookSecret || !accessToken) {
      try {
        const { data: mpSettings } = await supabase
          .from('store_settings')
          .select('value')
          .eq('key', 'mercadopago')
          .maybeSingle();
        if (mpSettings?.value) {
          webhookSecret = webhookSecret || mpSettings.value.webhookSecret?.trim() || null;
          accessToken = accessToken || mpSettings.value.accessToken?.trim() || null;
        }
      } catch (settingsErr) {
        console.warn('Error leyendo store_settings mercadopago en webhook:', settingsErr);
      }
    }

    if (webhookSecret && !verifyWebhookSignature(req, body, webhookSecret)) {
      console.warn('Firma de Webhook de Mercado Pago inválida.');
      return res.status(401).json({ error: 'Invalid webhook signature' });
    }

    const eventType = body.type || req.query?.type || req.query?.topic || '';
    const action = body.action || '';
    const dataObj = body.data || {};
    const mpOrderId = dataObj.id || req.query?.['data.id'] || req.query?.id || null;

    if (!mpOrderId) {
      return res.status(200).json({ received: true, note: 'Sin data.id para procesar' });
    }

    // 1. Obtener detalles de la orden (desde el mismo body o consultando GET /v1/orders/{order_id})
    let orderDetails = dataObj;

    if ((!orderDetails.status || !orderDetails.external_reference) && accessToken && String(mpOrderId).startsWith('ORD')) {
      try {
        const mpClient = new MercadoPagoConfig({
          accessToken,
          options: { timeout: 10000 },
        });
        const orderClient = new Order(mpClient);
        orderDetails = await orderClient.get({ id: String(mpOrderId) });
      } catch (fetchErr) {
        console.warn('No se pudo consultar GET /v1/orders con SDK en webhook:', fetchErr);
      }
    }

    const externalReference = orderDetails.external_reference || null;
    const mpStatus = String(orderDetails.status || '').toLowerCase();
    const mpStatusDetail = String(orderDetails.status_detail || '').toLowerCase();

    const firstPayment = orderDetails.transactions?.payments?.[0] || null;
    const mpPaymentId =
      firstPayment?.reference?.id ||
      firstPayment?.id ||
      null;

    // Determinar el estado de pago para Supabase
    const isPaid =
      mpStatus === 'processed' ||
      mpStatus === 'approved' ||
      mpStatusDetail === 'accredited' ||
      action === 'order.processed';

    const isCanceledOrFailed =
      mpStatus === 'canceled' ||
      mpStatus === 'failed' ||
      mpStatus === 'rejected' ||
      mpStatus === 'expired' ||
      mpStatusDetail === 'expired';

    const newPaymentStatus = isPaid ? 'pagado' : isCanceledOrFailed ? 'rechazado' : 'pendiente';

    // Helper para ajustar stock de los ítems del pedido (+1 reintegra, -1 descuenta)
    const adjustOrderStock = async (orderId, direction) => {
      try {
        const { data: orderItems } = await supabase
          .from('order_items')
          .select('product_id, product_name, weight, quantity')
          .eq('order_id', orderId);

        if (!Array.isArray(orderItems) || orderItems.length === 0) return;

        const { data: allProducts } = await supabase
          .from('products')
          .select('id, name, weights, stock');

        const normalizeText = (s) =>
          String(s || '')
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/\s+/g, ' ')
            .trim();

        const deltas = new Map();
        for (const it of orderItems) {
          const qty = Math.max(1, Number(it.quantity) || 1);
          let targetId = it.product_id || null;
          if (!targetId && it.product_name && Array.isArray(allProducts)) {
            const targetName = normalizeText(it.product_name);
            const targetWeight = normalizeText(it.weight || '').replace(/,/g, '.');
            const exact = allProducts.find((p) => {
              const pName = normalizeText(p.name);
              const pWeight = normalizeText(Array.isArray(p.weights) ? p.weights[0] : p.weights || '').replace(/,/g, '.');
              return pName === targetName && (!targetWeight || pWeight === targetWeight);
            }) || allProducts.find((p) => normalizeText(p.name) === targetName);
            if (exact) targetId = exact.id;
          }
          if (targetId) {
            deltas.set(targetId, (deltas.get(targetId) || 0) + qty * direction);
          }
        }

        for (const [prodId, delta] of deltas.entries()) {
          const { data: prodRow } = await supabase
            .from('products')
            .select('id, stock')
            .eq('id', prodId)
            .maybeSingle();
          if (prodRow) {
            const nextStock = Math.max(0, (Number(prodRow.stock) || 0) + delta);
            await supabase
              .from('products')
              .update({ stock: nextStock, updated_at: new Date().toISOString() })
              .eq('id', prodId);
          }
        }
      } catch (stockErr) {
        console.warn('Error ajustando stock desde webhook de Mercado Pago:', stockErr);
      }
    };

    // 2. Buscar el pedido correspondiente en Supabase (por id = external_reference o por mercadopago_preference_id = mpOrderId)
    const orderSelectCols =
      'id, status, total, customer_id, customer_name, city, delivery_slot, payment_method, points_earned, payment_status, mercadopago_preference_id';
    let matchedOrder = null;
    if (externalReference) {
      const { data } = await supabase
        .from('orders')
        .select(orderSelectCols)
        .eq('id', externalReference)
        .maybeSingle();
      if (data) matchedOrder = data;
    }

    if (!matchedOrder && mpOrderId) {
      const { data } = await supabase
        .from('orders')
        .select(orderSelectCols)
        .eq('mercadopago_preference_id', mpOrderId)
        .maybeSingle();
      if (data) matchedOrder = data;
    }

    if (matchedOrder) {
      const wasAlreadyPaid = String(matchedOrder.payment_status || '').toLowerCase() === 'pagado';
      const isSupersededAttempt =
        Boolean(matchedOrder.mercadopago_preference_id) &&
        Boolean(mpOrderId) &&
        String(matchedOrder.mercadopago_preference_id) !== String(mpOrderId);

      // Si llega un rechazo/expiración de un intento ANTERIOR cuando ya existe un reintento más nuevo, ignorarlo
      if (isCanceledOrFailed && isSupersededAttempt) {
        return res.status(200).json({
          received: true,
          ignored: 'superseded_attempt',
          eventType,
          action,
          mpOrderId,
          currentAttemptId: matchedOrder.mercadopago_preference_id,
          externalReference,
        });
      }

      const updatePayload = {
        payment_status: wasAlreadyPaid ? 'pagado' : newPaymentStatus,
      };
      if (isPaid || !isSupersededAttempt) {
        updatePayload.mercadopago_preference_id = mpOrderId;
      }
      if (mpPaymentId) {
        updatePayload.mercadopago_payment_id = String(mpPaymentId);
      }

      // Caso A: Pago rechazado/cancelado/expirado del intento vigente -> cancelar y devolver stock a bodega
      const shouldCancelAndRestore =
        !wasAlreadyPaid && isCanceledOrFailed && matchedOrder.status !== 'cancelado';
      if (shouldCancelAndRestore) {
        updatePayload.status = 'cancelado';
      }

      // Caso B: Reintento aprobado sobre una orden previamente cancelada -> reactivar y descontar stock nuevamente
      const shouldReactivateAndDeduct =
        isPaid && matchedOrder.status === 'cancelado';
      if (shouldReactivateAndDeduct) {
        updatePayload.status = 'en_preparacion';
      }

      await supabase
        .from('orders')
        .update(updatePayload)
        .eq('id', matchedOrder.id);

      if (shouldCancelAndRestore) {
        await adjustOrderStock(matchedOrder.id, 1);
      } else if (shouldReactivateAndDeduct) {
        await adjustOrderStock(matchedOrder.id, -1);
      }

      // Si acaba de pasar a 'pagado' y tiene cliente asociado, acreditar puntos Club Patitas y total_spent una sola vez
      if (!wasAlreadyPaid && isPaid && matchedOrder.customer_id) {
        const { data: cust } = await supabase
          .from('customers')
          .select('id, points, total_spent')
          .eq('id', matchedOrder.customer_id)
          .maybeSingle();

        if (cust) {
          const ptsToAdd = Math.max(0, Number(matchedOrder.points_earned) || 0);
          const totalToAdd = Math.max(0, Number(matchedOrder.total) || 0);
          await supabase
            .from('customers')
            .update({
              points: (Number(cust.points) || 0) + ptsToAdd,
              total_spent: (Number(cust.total_spent) || 0) + totalToAdd,
            })
            .eq('id', cust.id);
        }
      }

      // Notificar vía Web Push a dispositivos Admin cuando se confirma un pago web
      if (!wasAlreadyPaid && isPaid) {
        await sendAdminOrderPushNotification({
          orderId: matchedOrder.id,
          customerName: matchedOrder.customer_name,
          total: matchedOrder.total,
          city: matchedOrder.city,
          deliverySlot: matchedOrder.delivery_slot,
          paymentMethod: matchedOrder.payment_method || 'Mercado Pago',
          event: 'payment_approved',
        }).catch((pushErr) => {
          console.warn('Error enviando push de pago aprobado:', pushErr);
        });
      }
    }

    return res.status(200).json({
      received: true,
      eventType,
      action,
      mpOrderId,
      externalReference,
      paymentStatus: newPaymentStatus,
    });
  } catch (err) {
    console.error('Error procesando webhook de Mercado Pago:', err);
    // Retornar 200 para evitar reintentos infinitos si el payload es de prueba o malformado
    return res.status(200).json({ received: true, warning: err.message });
  }
}

