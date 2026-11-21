import { createClient } from '@supabase/supabase-js';

const DEFAULT_SITE_URL = 'https://patitas-del-sur.vercel.app';
const SUPABASE_URL =
  process.env.VITE_SUPABASE_URL ||
  process.env.SUPABASE_URL ||
  'https://onouflypoewijovavkec.supabase.co';
const SUPABASE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.VITE_SUPABASE_ANON_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9ub3VmbHlwb2V3aWpvdmF2a2VjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTIzOTA5MzksImV4cCI6MjEwNzk2NjkzOX0.CgguuTDxIPqNYHQePsivaDMowZo6nkdmD24J1LzZ8mQ';

function getBaseUrl() {
  const configured = process.env.SITE_URL || process.env.VITE_SITE_URL || DEFAULT_SITE_URL;
  return String(configured).replace(/\/+$/, '');
}

function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function formatCLP(amount) {
  const n = Math.round(Number(amount) || 0);
  return `$${n.toLocaleString('es-CL')}`;
}

function normalizePath(rawPath) {
  const cleaned = String(rawPath || '/').split('?')[0].trim();
  if (!cleaned || cleaned === '/') return '/';
  const prefixed = cleaned.startsWith('/') ? cleaned : `/${cleaned}`;
  return prefixed.replace(/\/+$/, '') || '/';
}

function isWhatsAppFriendlyImage(url) {
  if (!url || typeof url !== 'string') return false;
  const lower = url.toLowerCase().split('?')[0];
  return (
    (lower.startsWith('https://') || lower.startsWith('/')) &&
    (lower.endsWith('.jpg') || lower.endsWith('.jpeg') || lower.endsWith('.png'))
  );
}

async function fetchProductById(productId) {
  if (!productId || !SUPABASE_URL || !SUPABASE_KEY) return null;
  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data, error } = await supabase
      .from('products')
      .select('id, name, brand, pet_type, price, weights, tagline, image, is_active, is_paused')
      .eq('id', productId)
      .maybeSingle();

    if (error || !data || data.is_active === false || data.is_paused === true) {
      return null;
    }
    return data;
  } catch (err) {
    console.warn('OG product lookup failed:', err?.message || err);
    return null;
  }
}

function resolveRouteMeta(path, query, baseUrl) {
  const petParam = String(query?.pet || '').toLowerCase().trim();

  // 1. Catálogo de Perros (/perros o /catalogo?pet=perros)
  if (path === '/perros' || (path === '/catalogo' && (petParam === 'perros' || petParam === 'perro'))) {
    const canonicalPath = path === '/catalogo' ? '/catalogo?pet=perros' : '/perros';
    return {
      title: 'Catálogo Perros en Frutillar | Patitas del Sur',
      description:
        'Alimento super premium, recetas Grain Free, snacks naturales y antiparasitarios para perros con stock en vivo y despacho el mismo día en Frutillar. Envío gratis desde $25.000 CLP.',
      image: `${baseUrl}/images/og-perros-kira.jpg`,
      imageAlt: 'Patitas del Sur — Catálogo para Perros con Kira en Frutillar',
      canonicalUrl: `${baseUrl}${canonicalPath}`,
      ogType: 'website',
    };
  }

  // 2. Catálogo de Gatos (/gatos o /catalogo?pet=gatos)
  if (path === '/gatos' || (path === '/catalogo' && (petParam === 'gatos' || petParam === 'gato'))) {
    const canonicalPath = path === '/catalogo' ? '/catalogo?pet=gatos' : '/gatos';
    return {
      title: 'Catálogo Gatos en Frutillar | Patitas del Sur',
      description:
        'Alimento holístico, fórmulas Grain Free, alimento húmedo y arena sanitaria para gatos con stock en vivo y despacho el mismo día en Frutillar. Envío gratis desde $25.000 CLP.',
      image: `${baseUrl}/images/og-gatos-jack.jpg`,
      imageAlt: 'Patitas del Sur — Catálogo para Gatos con Jack en Frutillar',
      canonicalUrl: `${baseUrl}${canonicalPath}`,
      ogType: 'website',
    };
  }

  // 3. Catálogo Digital Express (/catalogo)
  if (path === '/catalogo') {
    return {
      title: 'Catálogo Digital | Pedido Rápido en Frutillar · Patitas del Sur',
      description:
        'Revisa el stock en vivo para perros y gatos y haz tu pedido directo con despacho a domicilio el mismo día en todo Frutillar (urbano y parcelaciones). Envío gratis desde $25.000 CLP.',
      image: `${baseUrl}/images/og-patitas-frutillar.jpg`,
      imageAlt: 'Patitas del Sur — Catálogo Digital con Despacho en Frutillar',
      canonicalUrl: `${baseUrl}/catalogo`,
      ogType: 'website',
    };
  }

  // 4. Landing Local Frutillar (/despacho/frutillar)
  if (path === '/despacho/frutillar') {
    return {
      title: 'Despacho de Alimento para Mascotas en Frutillar | Patitas del Sur',
      description:
        'Despacho propio el mismo día en Frutillar Bajo, Frutillar Alto, Punta Larga, Reserva Frutillar, Lagunita Frutillar, Parcelas Frutillar y Colonia La Radio. Envío gratis desde $25.000 y Pedido Urgente los domingos.',
      image: `${baseUrl}/images/og-patitas-frutillar.jpg`,
      imageAlt: 'Patitas del Sur — Despacho a domicilio en Frutillar',
      canonicalUrl: `${baseUrl}/despacho/frutillar`,
      ogType: 'website',
    };
  }

  // 5. Tarjetas de Presentación Digitales NFC (/tarjeta/:slug)
  if (path === '/tarjeta/ignacio') {
    return {
      title: 'Nacho Alarcón Rodríguez · Founder | Patitas del Sur',
      description:
        'Tarjeta de presentación digital de Nacho Alarcón Rodríguez, Founder de Patitas del Sur (Frutillar). WhatsApp, teléfono, correo, redes sociales y catálogo digital.',
      image: `${baseUrl}/images/og-patitas-frutillar.jpg`,
      imageAlt: 'Nacho Alarcón Rodríguez · Founder | Patitas del Sur',
      canonicalUrl: `${baseUrl}/tarjeta/ignacio`,
      ogType: 'profile',
    };
  }

  if (path === '/tarjeta/alamiro') {
    return {
      title: 'Alamiro Huerta · Founder | Patitas del Sur',
      description:
        'Tarjeta de presentación digital de Alamiro Huerta, Founder de Patitas del Sur (Frutillar). WhatsApp, teléfono, correo, redes sociales y catálogo digital.',
      image: `${baseUrl}/images/og-patitas-frutillar.jpg`,
      imageAlt: 'Alamiro Huerta · Founder | Patitas del Sur',
      canonicalUrl: `${baseUrl}/tarjeta/alamiro`,
      ogType: 'profile',
    };
  }

  // 6. Página general / Home y demás rutas
  return {
    title: 'Patitas del Sur | Alimento para Perros y Gatos en Frutillar',
    description:
      'Alimento super premium, Grain Free y snacks naturales para perros y gatos en Frutillar. Despacho hoy en ventanas 10:00–13:00 y 15:30–19:30 (gratis desde $25.000) y domingos urgentes 10:00–20:00.',
    image: `${baseUrl}/images/og-patitas-frutillar.jpg`,
    imageAlt: 'Patitas del Sur — Alimento y Snacks para Mascotas en Frutillar',
    canonicalUrl: path === '/' ? `${baseUrl}/` : `${baseUrl}${path}`,
    ogType: 'website',
  };
}

export default async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.setHeader('Allow', 'GET, HEAD');
    return res.status(405).send('Method Not Allowed');
  }

  const baseUrl = getBaseUrl();
  const path = normalizePath(req.query?.path || '/');
  let meta = resolveRouteMeta(path, req.query || {}, baseUrl);

  // Detalle de producto (/producto/:id): enriquecer con datos reales desde Supabase
  if (path.startsWith('/producto/')) {
    const productId = decodeURIComponent(path.slice('/producto/'.length));
    const product = await fetchProductById(productId);
    if (product) {
      const isDog = String(product.pet_type || '').toLowerCase() !== 'gatos';
      const fallbackImage = isDog
        ? `${baseUrl}/images/og-perros-kira.jpg`
        : `${baseUrl}/images/og-gatos-jack.jpg`;

      let productImage = fallbackImage;
      if (isWhatsAppFriendlyImage(product.image)) {
        productImage = product.image.startsWith('http')
          ? product.image
          : `${baseUrl}${product.image}`;
      }

      const priceLabel = Number(product.price) > 0 ? ` · ${formatCLP(product.price)} CLP` : '';
      const firstWeight = Array.isArray(product.weights) && product.weights[0] ? product.weights[0] : '';
      const formatLabel = firstWeight ? ` (${firstWeight})` : '';
      meta = {
        title: `${product.name}${formatLabel}${priceLabel} | Patitas del Sur`,
        description: `${product.tagline || `${product.name} de ${product.brand || 'Patitas del Sur'}`}. Stock en vivo y despacho a domicilio el mismo día en Frutillar.`,
        image: productImage,
        imageAlt: `${product.name} — Patitas del Sur Frutillar`,
        canonicalUrl: `${baseUrl}/producto/${encodeURIComponent(String(product.id))}`,
        ogType: 'product',
      };
    }
  }

  const imageType = meta.image.toLowerCase().endsWith('.png') ? 'image/png' : 'image/jpeg';
  const html = `<!doctype html>
<html lang="es-CL">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${escapeHtml(meta.title)}</title>
    <meta name="description" content="${escapeHtml(meta.description)}" />
    <link rel="canonical" href="${escapeHtml(meta.canonicalUrl)}" />
    <meta property="og:type" content="${escapeHtml(meta.ogType)}" />
    <meta property="og:locale" content="es_CL" />
    <meta property="og:site_name" content="Patitas del Sur" />
    <meta property="og:url" content="${escapeHtml(meta.canonicalUrl)}" />
    <meta property="og:title" content="${escapeHtml(meta.title)}" />
    <meta property="og:description" content="${escapeHtml(meta.description)}" />
    <meta property="og:image" content="${escapeHtml(meta.image)}" />
    <meta property="og:image:secure_url" content="${escapeHtml(meta.image)}" />
    <meta property="og:image:type" content="${imageType}" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:image:alt" content="${escapeHtml(meta.imageAlt)}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapeHtml(meta.title)}" />
    <meta name="twitter:description" content="${escapeHtml(meta.description)}" />
    <meta name="twitter:image" content="${escapeHtml(meta.image)}" />
  </head>
  <body>
    <main>
      <h1>${escapeHtml(meta.title)}</h1>
      <p>${escapeHtml(meta.description)}</p>
      <p><a href="${escapeHtml(meta.canonicalUrl)}">Abrir en Patitas del Sur</a></p>
    </main>
  </body>
</html>
`;

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Vary', 'User-Agent');
  res.setHeader('Cache-Control', 'public, s-maxage=1800, stale-while-revalidate=86400');
  return res.status(200).send(html);
}
