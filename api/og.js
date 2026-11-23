import { createClient } from '@supabase/supabase-js';
import { groupProductsForStore } from '../src/utils/productVariants.js';
import {
  getProductSchema,
  getBreadcrumbSchema,
  getCollectionPageSchema,
} from '../src/utils/schemaGenerators.js';

const DEFAULT_SITE_URL = 'https://www.patitas-delsur.cl';
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

function safeParseJsonArray(val) {
  if (Array.isArray(val)) return val;
  if (!val) return [];
  if (typeof val === 'string') {
    try {
      const parsed = JSON.parse(val);
      return Array.isArray(parsed) ? parsed : [parsed];
    } catch {
      return val.trim() ? [val.trim()] : [];
    }
  }
  return [];
}

async function fetchGroupedActiveProducts() {
  if (!SUPABASE_URL || !SUPABASE_KEY) return [];
  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data, error } = await supabase
      .from('products')
      .select(
        'id, sku, name, brand, pet_type, category, price, original_price, stock, weights, tagline, image, images, ingredients, benefits, main_protein, protein_value, target_stage_label, rating, reviews_count, updated_at, is_active, is_paused'
      )
      .order('id', { ascending: true });

    if (error || !Array.isArray(data)) return [];
    const activeRaw = data
      .filter((p) => p?.id && p.is_active !== false && !p.is_paused)
      .map((p) => ({
        ...p,
        petType: p.pet_type || 'perros',
        weights: safeParseJsonArray(p.weights),
        images: safeParseJsonArray(p.images),
        ingredients: safeParseJsonArray(p.ingredients),
        benefits: safeParseJsonArray(p.benefits),
        mainProtein: p.main_protein || null,
        proteinValue: p.protein_value ?? null,
        targetStageLabel: p.target_stage_label || null,
        reviewsCount: p.reviews_count ?? 0,
      }));

    return groupProductsForStore(activeRaw).filter((p) => p?.id && !p.isPaused);
  } catch (err) {
    console.warn('SEO/OG products lookup failed:', err?.message || err);
    return [];
  }
}

function renderCatalogBody(products, petParam, baseUrl) {
  const filtered =
    petParam === 'perros' || petParam === 'perro'
      ? products.filter((p) => p.petType === 'perros')
      : petParam === 'gatos' || petParam === 'gato'
        ? products.filter((p) => p.petType === 'gatos')
        : products;

  const listItems = filtered
    .map((p) => {
      const priceLabel =
        p.minPrice && p.maxPrice && p.maxPrice > p.minPrice
          ? `desde ${formatCLP(p.minPrice)} hasta ${formatCLP(p.maxPrice)} CLP`
          : `${formatCLP(p.price)} CLP`;
      const formats = Array.isArray(p.weights) && p.weights.length > 0 ? ` (${p.weights.join(', ')})` : '';
      const status = p.isOutOfStock ? 'Temporalmente agotado' : 'Disponible con despacho hoy en Frutillar';
      const href = `${baseUrl}/producto/${encodeURIComponent(String(p.id))}`;
      return `<li><a href="${escapeHtml(href)}"><strong>${escapeHtml(p.brand ? `${p.brand} — ` : '')}${escapeHtml(p.name)}</strong></a>${escapeHtml(formats)} · ${escapeHtml(priceLabel)} · ${escapeHtml(status)}</li>`;
    })
    .join('\n');

  return `
    <main>
      <h1>Catálogo Digital de Alimento para Perros y Gatos en Frutillar | Patitas del Sur</h1>
      <p>Stock real en bodega local en Loteo Espacio Frutillar con despacho el mismo día en Frutillar y alrededores (~9 km alrededor de Frutillar Alto: urbano y parcelaciones). Ventanas estándar Lunes a Sábado 10:00–13:00 y 15:30–19:30 hrs ($2.500 CLP, envío gratis desde $25.000 CLP). Domingos exclusivo Pedido Urgente 10:00–20:00 hrs ($3.500 CLP).</p>
      <nav aria-label="Navegación principal">
        <a href="${escapeHtml(baseUrl)}/">Inicio</a> |
        <a href="${escapeHtml(baseUrl)}/perros">Alimento para Perros</a> |
        <a href="${escapeHtml(baseUrl)}/gatos">Alimento para Gatos</a> |
        <a href="${escapeHtml(baseUrl)}/despacho/frutillar">Despacho en Frutillar</a> |
        <a href="${escapeHtml(baseUrl)}/nosotros">Nosotros</a>
      </nav>
      <section>
        <h2>Productos en Stock (${filtered.length})</h2>
        <ul>
          ${listItems || `<li>Explora nuestro catálogo completo en <a href="${escapeHtml(baseUrl)}/catalogo">Patitas del Sur</a>.</li>`}
        </ul>
      </section>
    </main>
  `;
}

function renderProductBody(product, baseUrl) {
  const isDog = product.petType !== 'gatos';
  const catPath = isDog ? '/perros' : '/gatos';
  const catName = isDog ? 'Alimento para Perros' : 'Alimento para Gatos';
  const variants = Array.isArray(product.variants) ? product.variants : [];
  const variantLines = variants
    .map((v) => {
      const avail = (typeof v.stock === 'number' ? v.stock : 10) > 0 && !v.isPaused ? 'Disponible' : 'Agotado';
      return `<li>${escapeHtml(v.format || v.weight || 'Estándar')}: <strong>${escapeHtml(formatCLP(v.price))} CLP</strong> (${escapeHtml(avail)})</li>`;
    })
    .join('\n');

  const ingredients = Array.isArray(product.ingredients) ? product.ingredients.filter(Boolean) : [];
  const benefits = Array.isArray(product.benefits) ? product.benefits.filter(Boolean) : [];

  return `
    <main>
      <nav aria-label="Ruta de navegación">
        <a href="${escapeHtml(baseUrl)}/">Inicio</a> ›
        <a href="${escapeHtml(baseUrl)}${catPath}">${catName}</a> ›
        <span>${escapeHtml(product.name)}</span>
      </nav>
      <article>
        <h1>${escapeHtml(product.name)} en Frutillar — ${escapeHtml(product.brand || 'Patitas del Sur')}</h1>
        <p>${escapeHtml(product.tagline || `${product.name} con despacho a domicilio el mismo día en Frutillar y alrededores.`)}</p>
        <p><strong>Precio:</strong> ${escapeHtml(
          product.minPrice && product.maxPrice && product.maxPrice > product.minPrice
            ? `desde ${formatCLP(product.minPrice)} hasta ${formatCLP(product.maxPrice)} CLP`
            : `${formatCLP(product.price)} CLP`
        )} · <strong>Estado:</strong> ${product.isOutOfStock ? 'Temporalmente agotado' : 'En stock en bodega local de Frutillar'}</p>
        ${variantLines ? `<section><h2>Formatos y Precios</h2><ul>${variantLines}</ul></section>` : ''}
        ${product.mainProtein || product.proteinValue ? `<p><strong>Proteína principal:</strong> ${escapeHtml(product.mainProtein || 'Animal')}${product.proteinValue ? ` (${escapeHtml(product.proteinValue)}%)` : ''}</p>` : ''}
        ${ingredients.length > 0 ? `<section><h2>Ingredientes principales</h2><p>${escapeHtml(ingredients.slice(0, 12).join(', '))}</p></section>` : ''}
        ${benefits.length > 0 ? `<section><h2>Beneficios clave</h2><ul>${benefits.slice(0, 6).map((b) => `<li>${escapeHtml(typeof b === 'string' ? b : b?.title || b?.text || '')}</li>`).join('')}</ul></section>` : ''}
        <section>
          <h2>Despacho a Domicilio en Frutillar y Alrededores</h2>
          <p>Entregamos con flota propia en un radio aproximado de 9 km alrededor de Frutillar Alto (Frutillar Bajo, Frutillar Alto, Loteo Espacio Frutillar, Punta Larga, Reserva Frutillar, Los Colonos, Quilanto, Los Bajos, Playa Maqui, Lagunita Frutillar, Parcelas Frutillar y Colonia La Radio). Envío gratis desde $25.000 CLP de lunes a sábado (tarifa estándar $2.500 CLP) y Pedido Urgente los domingos de 10:00 a 20:00 hrs ($3.500 CLP).</p>
        </section>
      </article>
      <p><a href="${escapeHtml(baseUrl)}/catalogo">Ver catálogo completo</a> · <a href="${escapeHtml(baseUrl)}/despacho/frutillar">Ver cobertura y horarios en Frutillar</a></p>
    </main>
  `;
}

function resolveStaticRouteMeta(path, query, baseUrl) {
  const petParam = String(query?.pet || '').toLowerCase().trim();

  if (path === '/catalogo') {
    const isDogFilter = petParam === 'perros' || petParam === 'perro';
    const isCatFilter = petParam === 'gatos' || petParam === 'gato';
    return {
      status: 200,
      noindex: false,
      title: isDogFilter
        ? 'Catálogo Perros en Frutillar | Patitas del Sur'
        : isCatFilter
          ? 'Catálogo Gatos en Frutillar | Patitas del Sur'
          : 'Catálogo Digital en Frutillar | Pedido Rápido · Patitas del Sur',
      description: isDogFilter
        ? 'Alimento super premium, recetas Grain Free, snacks naturales y antiparasitarios para perros con stock en vivo y despacho el mismo día en Frutillar y alrededores. Envío gratis desde $25.000 CLP.'
        : isCatFilter
          ? 'Alimento holístico, fórmulas Grain Free, alimento húmedo y arena sanitaria para gatos con stock en vivo y despacho el mismo día en Frutillar y alrededores. Envío gratis desde $25.000 CLP.'
          : 'Revisa el stock en vivo para perros y gatos y haz tu pedido directo con despacho a domicilio el mismo día en Frutillar y alrededores (~9 km desde Frutillar Alto). Envío gratis desde $25.000 CLP.',
      image: isDogFilter
        ? `${baseUrl}/images/og-perros-kira.jpg`
        : isCatFilter
          ? `${baseUrl}/images/og-gatos-jack.jpg`
          : `${baseUrl}/images/og-patitas-frutillar.jpg`,
      imageAlt: isDogFilter
        ? 'Patitas del Sur — Catálogo para Perros con Kira en Frutillar'
        : isCatFilter
          ? 'Patitas del Sur — Catálogo para Gatos con Jack en Frutillar'
          : 'Patitas del Sur — Catálogo Digital con Despacho en Frutillar',
      canonicalUrl: `${baseUrl}/catalogo`,
      ogType: 'website',
    };
  }

  if (path === '/tarjeta/ignacio') {
    return {
      status: 200,
      noindex: true,
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
      status: 200,
      noindex: true,
      title: 'Alamiro Huerta · Founder | Patitas del Sur',
      description:
        'Tarjeta de presentación digital de Alamiro Huerta, Founder de Patitas del Sur (Frutillar). WhatsApp, teléfono, correo, redes sociales y catálogo digital.',
      image: `${baseUrl}/images/og-patitas-frutillar.jpg`,
      imageAlt: 'Alamiro Huerta · Founder | Patitas del Sur',
      canonicalUrl: `${baseUrl}/tarjeta/alamiro`,
      ogType: 'profile',
    };
  }

  if (path.startsWith('/admin') || path.startsWith('/mi-cuenta') || path === '/login') {
    return {
      status: 200,
      noindex: true,
      title: 'Acceso Privado | Patitas del Sur',
      description: 'Área privada de Patitas del Sur.',
      image: `${baseUrl}/images/og-patitas-frutillar.jpg`,
      imageAlt: 'Patitas del Sur',
      canonicalUrl: `${baseUrl}${path}`,
      ogType: 'website',
    };
  }

  // Fallback para rutas conocidas si llegan a invocarse directamente
  if (path === '/' || path === '/perros' || path === '/gatos' || path === '/despacho/frutillar' || path === '/nosotros') {
    const isDogs = path === '/perros';
    const isCats = path === '/gatos';
    return {
      status: 200,
      noindex: false,
      title: isDogs
        ? 'Alimento y Snacks Naturales para Perros en Frutillar | Patitas del Sur'
        : isCats
          ? 'Alimento, Arena y Snacks para Gatos en Frutillar | Patitas del Sur'
          : path === '/despacho/frutillar'
            ? 'Alimento para Perros y Gatos con Despacho a Domicilio en Frutillar | Patitas del Sur'
            : path === '/nosotros'
              ? 'Nuestra Historia · Patitas del Sur en Frutillar'
              : 'Patitas del Sur | Alimento para Perros y Gatos en Frutillar',
      description:
        'Alimento super premium, Grain Free y snacks naturales para perros y gatos con despacho a domicilio propio en Frutillar y alrededores (~9 km desde Frutillar Alto). Envío gratis desde $25.000 CLP y Pedido Urgente los domingos.',
      image: isDogs
        ? `${baseUrl}/images/og-perros-kira.jpg`
        : isCats
          ? `${baseUrl}/images/og-gatos-jack.jpg`
          : `${baseUrl}/images/og-patitas-frutillar.jpg`,
      imageAlt: 'Patitas del Sur — Alimento y Snacks para Mascotas en Frutillar',
      canonicalUrl: path === '/' ? `${baseUrl}/` : `${baseUrl}${path}`,
      ogType: 'website',
    };
  }

  // Cualquier ruta inexistente → HTTP 404 real con noindex
  return {
    status: 404,
    noindex: true,
    title: 'Página no encontrada (404) | Patitas del Sur',
    description: 'La página solicitada no existe o fue trasladada en Patitas del Sur.',
    image: `${baseUrl}/images/og-patitas-frutillar.jpg`,
    imageAlt: 'Patitas del Sur Frutillar',
    canonicalUrl: `${baseUrl}/`,
    ogType: 'website',
  };
}

/**
 * Serverless Endpoint de SSR ligero / Open Graph / Bot & AI Crawler Renderer.
 * Sirve HTML semántico completo, JSON-LD y códigos HTTP reales (200/404) para rutas dinámicas
 * (/producto/:id, /catalogo, /tarjeta/:slug y 404s) a bots sociales, Bing y motores de IA.
 */
export default async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.setHeader('Allow', 'GET, HEAD');
    return res.status(405).send('Method Not Allowed');
  }

  const baseUrl = getBaseUrl();
  const path = normalizePath(req.query?.path || '/');
  const petParam = String(req.query?.pet || '').toLowerCase().trim();

  let meta = resolveStaticRouteMeta(path, req.query || {}, baseUrl);
  let jsonLdList = [];
  let bodyHtml = '';

  if (path === '/catalogo') {
    const products = await fetchGroupedActiveProducts();
    bodyHtml = renderCatalogBody(products, petParam, baseUrl);
    jsonLdList = [
      getCollectionPageSchema({
        name: 'Catálogo Digital de Alimento para Mascotas en Frutillar',
        description: meta.description,
        url: '/catalogo',
        itemCount: products.length,
      }),
      getBreadcrumbSchema([
        { name: 'Inicio', url: '/' },
        { name: 'Catálogo Digital', url: '/catalogo' },
      ]),
    ];
  } else if (path.startsWith('/producto/')) {
    const productId = decodeURIComponent(path.slice('/producto/'.length)).trim();
    const products = await fetchGroupedActiveProducts();
    const product =
      products.find((p) => String(p.id) === productId || String(p.sku) === productId) ||
      products.find(
        (p) =>
          Array.isArray(p.variants) &&
          p.variants.some((v) => String(v.id) === productId || String(v.sku) === productId)
      ) ||
      null;

    if (product) {
      const isDog = product.petType !== 'gatos';
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
      const canonicalProductPath = `/producto/${encodeURIComponent(String(product.id))}`;

      meta = {
        status: 200,
        noindex: false,
        title: `${product.name}${formatLabel}${priceLabel} | Patitas del Sur`,
        description: `${product.tagline || `${product.name} de ${product.brand || 'Patitas del Sur'}`}. Stock en vivo y despacho a domicilio el mismo día en Frutillar y alrededores.`,
        image: productImage,
        imageAlt: `${product.name} — Patitas del Sur Frutillar`,
        canonicalUrl: `${baseUrl}${canonicalProductPath}`,
        ogType: 'product',
      };

      const productSchema = getProductSchema(product);
      const breadcrumbSchema = getBreadcrumbSchema([
        { name: 'Inicio', url: '/' },
        { name: isDog ? 'Perros' : 'Gatos', url: isDog ? '/perros' : '/gatos' },
        { name: product.name, url: canonicalProductPath },
      ]);
      jsonLdList = [productSchema, breadcrumbSchema].filter(Boolean);
      bodyHtml = renderProductBody(product, baseUrl);
    } else {
      meta = {
        status: 404,
        noindex: true,
        title: 'Producto no encontrado | Patitas del Sur',
        description: 'El producto consultado no se encuentra disponible en el catálogo actual de Patitas del Sur.',
        image: `${baseUrl}/images/og-patitas-frutillar.jpg`,
        imageAlt: 'Patitas del Sur Frutillar',
        canonicalUrl: `${baseUrl}/catalogo`,
        ogType: 'website',
      };
      bodyHtml = `<main><h1>Producto no disponible</h1><p>El producto solicitado no existe o fue retirado del catálogo.</p><p><a href="${escapeHtml(baseUrl)}/catalogo">Ver catálogo completo</a></p></main>`;
    }
  } else {
    bodyHtml = `
      <main>
        <h1>${escapeHtml(meta.title)}</h1>
        <p>${escapeHtml(meta.description)}</p>
        <p><a href="${escapeHtml(meta.canonicalUrl)}">Abrir en Patitas del Sur</a></p>
      </main>
    `;
  }

  const imageType = meta.image.toLowerCase().endsWith('.png') ? 'image/png' : 'image/jpeg';
  const robotsContent = meta.noindex ? 'noindex, nofollow' : 'index, follow';
  const jsonLdTag =
    jsonLdList.length > 0
      ? `\n    <script id="seo-json-ld" type="application/ld+json">${JSON.stringify(
          jsonLdList.length === 1 ? jsonLdList[0] : jsonLdList
        )}</script>`
      : '';

  const html = `<!doctype html>
<html lang="es-CL">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${escapeHtml(meta.title)}</title>
    <meta name="description" content="${escapeHtml(meta.description)}" />
    <meta name="robots" content="${robotsContent}" />
    ${!meta.noindex ? `<link rel="canonical" href="${escapeHtml(meta.canonicalUrl)}" />` : ''}
    <link rel="alternate" type="text/plain" href="${escapeHtml(baseUrl)}/llms.txt" title="Patitas del Sur AI Knowledge Base" />
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
    <meta name="twitter:image" content="${escapeHtml(meta.image)}" />${jsonLdTag}
  </head>
  <body>
    ${bodyHtml}
  </body>
</html>
`;

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Vary', 'User-Agent');
  if (meta.noindex) {
    res.setHeader('X-Robots-Tag', 'noindex, nofollow');
  }
  res.setHeader(
    'Cache-Control',
    meta.status === 404
      ? 'public, s-maxage=300, stale-while-revalidate=600'
      : 'public, s-maxage=1800, stale-while-revalidate=86400'
  );
  return res.status(meta.status || 200).send(html);
}
