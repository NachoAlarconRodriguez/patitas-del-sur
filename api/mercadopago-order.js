import crypto from 'node:crypto';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL =
  process.env.VITE_SUPABASE_URL ||
  process.env.SUPABASE_URL ||
  'https://onouflypoewijovavkec.supabase.co';

const SUPABASE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.VITE_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9ub3VmbHlwb2V3aWpvdmF2a2VjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTIzOTA5MzksImV4cCI6MjEwNzk2NjkzOX0.CgguuTDxIPqNYHQePsivaDMowZo6nkdmD24J1LzZ8mQ';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function resolveAccessToken() {
  if (process.env.MP_ACCESS_TOKEN) {
    return process.env.MP_ACCESS_TOKEN;
  }
  try {
    const { data } = await supabase
      .from('store_settings')
      .select('value')
      .eq('key', 'mercadopago')
      .maybeSingle();
    if (data?.value?.accessToken) {
      return data.value.accessToken;
    }
  } catch (err) {
    console.warn('No se pudo leer accessToken desde store_settings:', err);
  }
  return null;
}

/**
 * Serverless Endpoint: Creación y Consulta de Órdenes de Pago en Mercado Pago (Orders API v1)
 * Documentación: https://www.mercadopago.cl/developers/es/docs/checkout-pro-orders/create-order
 */
export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const accessToken = await resolveAccessToken();
  if (!accessToken) {
    return res.status(500).json({
      error: 'MP_ACCESS_TOKEN no está configurado en el servidor ni en store_settings.',
    });
  }

  try {
    // 1. GET /api/mercadopago-order?id=ORD... -> Consultar estado de una orden en Mercado Pago
    if (req.method === 'GET') {
      const orderId = req.query?.id;
      if (!orderId) {
        return res.status(400).json({ error: 'Falta el parámetro id de la orden de Mercado Pago.' });
      }

      const mpRes = await fetch(`https://api.mercadopago.com/v1/orders/${encodeURIComponent(orderId)}`, {
        method: 'GET',
        headers: {
          accept: 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const mpData = await mpRes.json();
      return res.status(mpRes.status).json(mpData);
    }

    // 2. POST /api/mercadopago-order -> Crear nueva orden de pago en Mercado Pago
    if (req.method === 'POST') {
      const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
      const {
        externalReference,
        totalAmount,
        payerEmail,
        items = [],
        shippingCost = 0,
        description,
        origin,
        config,
      } = body;

      const numericTotal = Math.round(Number(totalAmount) || 0);
      if (numericTotal <= 0) {
        return res.status(400).json({ error: 'El monto total del pedido debe ser mayor a 0.' });
      }

      // Construir lista de ítems asegurando que sum(unit_price * quantity) === total_amount
      let normalizedItems = (Array.isArray(items) ? items : []).map((it) => ({
        title: String(it.title || it.name || 'Producto Patitas del Sur').slice(0, 120),
        unit_price: String(Math.round(Number(it.unit_price ?? it.price) || 0)),
        quantity: Math.max(1, parseInt(it.quantity || it.qty || 1, 10) || 1),
      })).filter((it) => Number(it.unit_price) > 0);

      const numericShipping = Math.round(Number(shippingCost) || 0);
      if (numericShipping > 0) {
        normalizedItems.push({
          title: 'Despacho a Domicilio',
          unit_price: String(numericShipping),
          quantity: 1,
        });
      }

      const itemsSum = normalizedItems.reduce(
        (acc, it) => acc + Number(it.unit_price) * it.quantity,
        0
      );

      // Si hay un descuento de cupón o diferencia de redondeo, consolidar en un ítem por el total exacto
      // porque la API /v1/orders exige que la suma de (unit_price * quantity) sea exactamente igual a total_amount
      if (itemsSum !== numericTotal || normalizedItems.length === 0) {
        const summaryTitle =
          normalizedItems.length > 0
            ? normalizedItems.map((i) => `${i.quantity}x ${i.title}`).join(', ').slice(0, 120)
            : description || `Pedido Patitas del Sur ${externalReference || ''}`.trim();

        normalizedItems = [
          {
            title: summaryTitle || 'Pedido Patitas del Sur',
            unit_price: String(numericTotal),
            quantity: 1,
          },
        ];
      }

      const cleanEmail =
        payerEmail && String(payerEmail).includes('@')
          ? String(payerEmail).trim()
          : 'cliente@patitasdelsur.cl';

      // Determinar URL base para las URLs de retorno (config.online)
      const rawOrigin =
        origin ||
        req.headers?.origin ||
        (req.headers?.referer ? new URL(req.headers.referer).origin : null) ||
        'https://patitas-del-sur.vercel.app';
      const baseUrl = String(rawOrigin).replace(/\/+$/, '');

      const mpPayload = {
        type: 'online',
        processing_mode: 'manual',
        total_amount: String(numericTotal),
        external_reference: String(externalReference || `PED-${Date.now()}`),
        description: String(description || `Pedido Patitas del Sur #${externalReference || ''}`).slice(0, 120),
        payer: {
          email: cleanEmail,
        },
        items: normalizedItems,
        config: {
          ...(config && typeof config === 'object' ? config : {}),
          online: {
            success_url: `${baseUrl}/?mp_return=success`,
            failure_url: `${baseUrl}/?mp_return=failure`,
            pending_url: `${baseUrl}/?mp_return=pending`,
            auto_return: 'approved',
            ...(config?.online && typeof config.online === 'object' ? config.online : {}),
          },
        },
      };

      const idempotencyKey = crypto.randomUUID();

      const mpRes = await fetch('https://api.mercadopago.com/v1/orders', {
        method: 'POST',
        headers: {
          accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
          'X-Idempotency-Key': idempotencyKey,
        },
        body: JSON.stringify(mpPayload),
      });

      const mpData = await mpRes.json();

      if (!mpRes.ok) {
        console.error('Error creando orden en Mercado Pago:', mpData);
        return res.status(mpRes.status).json({
          error: mpData?.message || 'Error al crear la orden en Mercado Pago',
          details: mpData,
        });
      }

      return res.status(201).json(mpData);
    }

    return res.status(405).json({ error: 'Método no permitido' });
  } catch (err) {
    console.error('Excepción en /api/mercadopago-order:', err);
    return res.status(500).json({ error: err.message || 'Error interno del servidor' });
  }
}

