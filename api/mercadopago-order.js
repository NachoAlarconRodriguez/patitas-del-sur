import crypto from 'node:crypto';
import { createClient } from '@supabase/supabase-js';
import { MercadoPagoConfig, Order } from 'mercadopago';

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

  // Inicializar cliente oficial del SDK de Backend de Mercado Pago (Node.js)
  const mpClient = new MercadoPagoConfig({
    accessToken,
    options: { timeout: 10000 },
  });
  const orderClient = new Order(mpClient);

  try {
    // 1. GET /api/mercadopago-order?id=ORD... -> Consultar estado de una orden en Mercado Pago vía SDK oficial
    if (req.method === 'GET') {
      const orderId = req.query?.id;
      if (!orderId) {
        return res.status(400).json({ error: 'Falta el parámetro id de la orden de Mercado Pago.' });
      }

      const mpData = await orderClient.get({ id: String(orderId) });
      return res.status(200).json(mpData);
    }

    // 2. POST /api/mercadopago-order -> Crear nueva orden de pago en Mercado Pago
    if (req.method === 'POST') {
      const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
      const {
        externalReference,
        totalAmount,
        payerEmail,
        payerFirstName,
        payerLastName,
        payerName,
        payerPhone,
        payerIdentification,
        payerRegistrationDate,
        payerIsFirstPurchaseOnline,
        payerAuthenticationType,
        additionalInfo,
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
      let normalizedItems = (Array.isArray(items) ? items : []).map((it, idx) => {
        const itemTitle = String(it.title || it.name || 'Producto Patitas del Sur').slice(0, 120);
        const itemDesc = String(
          it.description || it.tagline || `${itemTitle} - Nutrición y cuidado para mascotas Patitas del Sur`
        ).slice(0, 250);
        const extCode = String(it.external_code || it.sku || it.id || `PROD-${idx + 1}`).slice(0, 60);
        return {
          external_code: extCode,
          title: itemTitle,
          description: itemDesc,
          unit_price: String(Math.round(Number(it.unit_price ?? it.price) || 0)),
          quantity: Math.max(1, parseInt(it.quantity || it.qty || 1, 10) || 1),
          category_id: String(it.category_id || 'others'),
        };
      }).filter((it) => Number(it.unit_price) > 0);

      const numericShipping = Math.round(Number(shippingCost) || 0);
      if (numericShipping > 0) {
        normalizedItems.push({
          external_code: 'DESPACHO-DOMICILIO',
          title: 'Despacho a Domicilio',
          description: 'Servicio de despacho a domicilio Patitas del Sur',
          unit_price: String(numericShipping),
          quantity: 1,
          category_id: 'others',
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
            external_code: String(externalReference || 'PEDIDO-CONSOLIDADO').slice(0, 60),
            title: summaryTitle || 'Pedido Patitas del Sur',
            description: String(
              description || `${summaryTitle || 'Pedido'} - Alimento y snacks naturales para mascotas`
            ).slice(0, 250),
            unit_price: String(numericTotal),
            quantity: 1,
            category_id: 'others',
          },
        ];
      }

      const cleanEmail =
        payerEmail && String(payerEmail).includes('@')
          ? String(payerEmail).trim()
          : 'cliente@patitasdelsur.cl';

      // Separar nombre y apellido para payer.first_name y payer.last_name
      const fullNameParts = String(payerName || '').trim().split(/\s+/).filter(Boolean);
      const resolvedFirstName = String(
        payerFirstName || fullNameParts[0] || 'Cliente'
      ).trim();
      const resolvedLastName = String(
        payerLastName ||
          (fullNameParts.length > 1 ? fullNameParts.slice(1).join(' ') : 'Patitas del Sur')
      ).trim();

      const resolvedIdentification = {
        type: String(payerIdentification?.type || 'RUT').trim(),
        number: String(payerIdentification?.number || '11111111-1').trim(),
      };

      // Resolver payer.phone ({ area_code, number })
      let resolvedAreaCode = '56';
      let resolvedPhoneNumber = '953332492';
      if (payerPhone && typeof payerPhone === 'object') {
        resolvedAreaCode = String(payerPhone.area_code || '56').replace(/\D/g, '') || '56';
        resolvedPhoneNumber = String(payerPhone.number || '').replace(/\D/g, '') || '953332492';
      } else if (payerPhone) {
        const digits = String(payerPhone).replace(/\D/g, '');
        if (digits.startsWith('56') && digits.length > 9) {
          resolvedAreaCode = '56';
          resolvedPhoneNumber = digits.slice(2);
        } else if (digits.length > 0) {
          resolvedPhoneNumber = digits;
        }
      }
      const resolvedPhone = {
        area_code: resolvedAreaCode,
        number: resolvedPhoneNumber,
      };

      // Determinar URL base para las URLs de retorno (config.online)
      const rawOrigin =
        origin ||
        req.headers?.origin ||
        (req.headers?.referer ? new URL(req.headers.referer).origin : null) ||
        'https://patitas-del-sur.vercel.app';
      const baseUrl = String(rawOrigin).replace(/\/+$/, '');

      // Resolver additional_info["payer.registration_date"] en formato ISO 8601
      const rawRegDate =
        payerRegistrationDate ||
        additionalInfo?.['payer.registration_date'] ||
        additionalInfo?.payer?.registration_date ||
        null;
      let resolvedRegDate = new Date().toISOString();
      if (rawRegDate) {
        const parsedDate = new Date(rawRegDate);
        if (!Number.isNaN(parsedDate.getTime())) {
          resolvedRegDate = parsedDate.toISOString();
        }
      }

      const rawFirstPurchase =
        payerIsFirstPurchaseOnline ??
        additionalInfo?.['payer.is_first_purchase_online'] ??
        additionalInfo?.payer?.is_first_purchase_online;
      const resolvedFirstPurchase =
        typeof rawFirstPurchase === 'boolean' ? rawFirstPurchase : Boolean(rawFirstPurchase ?? true);

      const rawAuthType = String(
        payerAuthenticationType ||
          additionalInfo?.['payer.authentication_type'] ||
          additionalInfo?.payer?.authentication_type ||
          'WEB'
      ).toUpperCase();
      const resolvedAuthType = rawAuthType === 'MOBILE' ? 'MOBILE' : 'WEB';

      const flatAdditionalInfo = {
        'payer.registration_date': resolvedRegDate,
        'payer.is_first_purchase_online': resolvedFirstPurchase,
        'payer.authentication_type': resolvedAuthType,
      };
      if (additionalInfo && typeof additionalInfo === 'object') {
        Object.entries(additionalInfo).forEach(([k, v]) => {
          if (k !== 'payer' && v !== undefined && v !== null) {
            flatAdditionalInfo[k] = v;
          }
        });
      }

      const mpPayload = {
        type: 'online',
        processing_mode: 'manual',
        total_amount: String(numericTotal),
        external_reference: String(externalReference || `PED-${Date.now()}`),
        description: String(description || `Pedido Patitas del Sur #${externalReference || ''}`).slice(0, 120),
        payer: {
          email: cleanEmail,
          first_name: resolvedFirstName,
          last_name: resolvedLastName,
          identification: resolvedIdentification,
          phone: resolvedPhone,
        },
        additional_info: flatAdditionalInfo,
        items: normalizedItems,
        config: {
          statement_descriptor: 'PATITASDELSUR',
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

      try {
        const mpData = await orderClient.create({
          body: mpPayload,
          requestOptions: { idempotencyKey },
        });
        return res.status(201).json(mpData);
      } catch (sdkErr) {
        console.error('Error creando orden con MercadoPago SDK:', sdkErr);
        const statusCode = sdkErr?.status || sdkErr?.statusCode || 400;
        return res.status(statusCode).json({
          error: sdkErr?.message || 'Error al crear la orden en Mercado Pago',
          details: sdkErr?.cause || sdkErr?.errors || sdkErr,
        });
      }
    }

    return res.status(405).json({ error: 'Método no permitido' });
  } catch (err) {
    console.error('Excepción en /api/mercadopago-order:', err);
    return res.status(500).json({ error: err.message || 'Error interno del servidor' });
  }
}

