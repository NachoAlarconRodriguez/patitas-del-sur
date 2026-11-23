import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { FRUTILLAR_FAQS, PERROS_FAQS, GATOS_FAQS, GENERAL_FAQS } from '../src/data/faqData.js';
import {
  getBreadcrumbSchema,
  getCollectionPageSchema,
  getFAQPageSchema,
} from '../src/utils/schemaGenerators.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST_DIR = path.resolve(__dirname, '../dist');
const SITE_URL = (
  process.env.SITE_URL ||
  process.env.VITE_SITE_URL ||
  'https://www.patitas-delsur.cl'
).replace(/\/+$/, '');

const GOOGLE_VERIFICATION = (process.env.VITE_GOOGLE_SITE_VERIFICATION || process.env.GOOGLE_SITE_VERIFICATION || '').trim();
const BING_VERIFICATION = (process.env.VITE_BING_SITE_VERIFICATION || process.env.BING_SITE_VERIFICATION || '').trim();

const escapeHtml = (str) =>
  String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const renderFaqsHtml = (faqs = []) => {
  if (!Array.isArray(faqs) || faqs.length === 0) return '';
  return `<section><h2>Preguntas Frecuentes</h2>${faqs
    .map(
      (f) =>
        `<article><h3>${escapeHtml(f.question)}</h3><p>${escapeHtml(
          [f.shortAnswer, f.details].filter(Boolean).join(' ')
        )}</p></article>`
    )
    .join('')}</section>`;
};

const NAV_HTML = `<nav aria-label="Navegación principal">
  <a href="/">Inicio</a> |
  <a href="/catalogo">Catálogo Digital</a> |
  <a href="/despacho/frutillar">Despacho en Frutillar</a> |
  <a href="/perros">Alimento para Perros</a> |
  <a href="/gatos">Alimento para Gatos</a> |
  <a href="/nosotros">Nosotros</a> |
  <a href="/politicas-de-despacho">Políticas de Despacho</a>
</nav>`;

const ROUTES = [
  {
    file: 'index.html',
    canonical: `${SITE_URL}/`,
    title: 'Patitas del Sur | Alimento para Perros y Gatos con Despacho a Domicilio en Frutillar',
    description:
      'Tienda de alimentos super premium, recetas Grain Free, snacks naturales y antiparasitarios para perros y gatos con despacho a domicilio el mismo día en Frutillar y alrededores (~9 km desde Frutillar Alto). Envío gratis desde $25.000 CLP y Pedido Urgente los domingos.',
    ogImage: `${SITE_URL}/images/og-patitas-frutillar.jpg`,
    jsonLd: null,
    noscriptHtml: `<main style="max-width:760px;margin:40px auto;padding:24px;font-family:system-ui,sans-serif;color:#1D1D1F;">
      <h1>Patitas del Sur — Alimento para Perros y Gatos con Despacho a Domicilio en Frutillar</h1>
      <p>Tienda online en Frutillar (Región de Los Lagos, Chile) especializada en alimento super premium, fórmulas Grain Free, snacks naturales, arenas y antiparasitarios para perros y gatos. Despacho propio en Frutillar y alrededores (~9 km alrededor de Frutillar Alto: Frutillar Bajo, Frutillar Alto, Loteo Espacio Frutillar, Punta Larga, Reserva Frutillar, Los Colonos, Quilanto, Los Bajos, Playa Maqui, Lagunita Frutillar, Parcelas Frutillar y Colonia La Radio).</p>
      <p>Ventanas Lunes a Sábado: 10:00–13:00 hrs y 15:30–19:30 hrs ($2.500 CLP, envío gratis desde $25.000 CLP). Domingos: Pedido Urgente 10:00–20:00 hrs ($3.500 CLP). Pago con Mercado Pago o Contra Entrega (transferencia, efectivo o POS móvil). WhatsApp: +56 9 5333 2492.</p>
      ${NAV_HTML}
    </main>`,
  },
  {
    file: 'despacho/frutillar.html',
    canonical: `${SITE_URL}/despacho/frutillar`,
    title: 'Alimento para Perros y Gatos con Despacho a Domicilio en Frutillar | Patitas del Sur',
    description:
      'Compra alimento super premium, Grain Free, snacks y antiparasitarios para perros y gatos con despacho propio el mismo día en Frutillar y alrededores (~9 km desde Frutillar Alto): Frutillar Bajo, Frutillar Alto, Punta Larga, Reserva Frutillar, Lagunita Frutillar, Parcelas Frutillar y Colonia La Radio. Envío gratis desde $25.000 CLP y Pedido Urgente los domingos.',
    ogImage: `${SITE_URL}/images/og-patitas-frutillar.jpg`,
    jsonLd: [
      getFAQPageSchema(FRUTILLAR_FAQS),
      getBreadcrumbSchema([
        { name: 'Inicio', url: '/' },
        { name: 'Despacho en Frutillar', url: '/despacho/frutillar' },
      ]),
    ],
    noscriptHtml: `<main style="max-width:760px;margin:40px auto;padding:24px;font-family:system-ui,sans-serif;color:#1D1D1F;">
      <h1>Alimento para Perros y Gatos con Despacho a Domicilio en Frutillar</h1>
      <p>En Patitas del Sur despachamos con flota propia desde Loteo Espacio Frutillar en un radio de ~9 km alrededor de Frutillar Alto: Frutillar Bajo, Frutillar Alto, Loteo Espacio Frutillar, Punta Larga, Reserva Frutillar, Los Colonos, Quilanto, Los Bajos, Playa Maqui, Lagunita Frutillar, Parcelas Frutillar y Colonia La Radio.</p>
      <p>Tarifa estándar $2.500 CLP (envío gratis desde $25.000 CLP de lunes a sábado en ventanas 10:00–13:00 y 15:30–19:30 hrs). Domingos exclusivo Pedido Urgente 10:00–20:00 hrs ($3.500 CLP).</p>
      ${renderFaqsHtml(FRUTILLAR_FAQS)}
      ${NAV_HTML}
    </main>`,
  },
  {
    file: 'perros.html',
    canonical: `${SITE_URL}/perros`,
    title: 'Alimento y Snacks Naturales para Perros en Frutillar | Patitas del Sur',
    description:
      'Catálogo de alimento super premium, recetas Grain Free, snacks naturales y antiparasitarios para perros con stock en vivo y despacho a domicilio el mismo día en Frutillar y alrededores (~9 km). Envío gratis desde $25.000 CLP.',
    ogImage: `${SITE_URL}/images/og-perros-kira.jpg`,
    jsonLd: [
      getCollectionPageSchema({
        name: 'Alimento y Snacks Naturales para Perros en Frutillar',
        description:
          'Catálogo de alimento super premium, recetas Grain Free, snacks naturales y antiparasitarios para perros en Frutillar.',
        url: '/perros',
      }),
      getBreadcrumbSchema([
        { name: 'Inicio', url: '/' },
        { name: 'Perros', url: '/perros' },
      ]),
      getFAQPageSchema([...PERROS_FAQS, ...GENERAL_FAQS.slice(0, 2)]),
    ],
    noscriptHtml: `<main style="max-width:760px;margin:40px auto;padding:24px;font-family:system-ui,sans-serif;color:#1D1D1F;">
      <h1>Alimento y Nutrición Super Premium para Perros en Frutillar</h1>
      <p>Marcas super premium, recetas Grain Free, alimento húmedo, snacks naturales y antiparasitarios para perros con stock en bodega local y despacho el mismo día en Frutillar y alrededores (~9 km desde Frutillar Alto).</p>
      ${renderFaqsHtml([...PERROS_FAQS, ...GENERAL_FAQS.slice(0, 2)])}
      ${NAV_HTML}
    </main>`,
  },
  {
    file: 'gatos.html',
    canonical: `${SITE_URL}/gatos`,
    title: 'Alimento, Arena y Snacks para Gatos en Frutillar | Patitas del Sur',
    description:
      'Catálogo de alimento felino super premium Grain Free, alimento húmedo, arena sanitaria y antiparasitarios para gatos con despacho a domicilio el mismo día en Frutillar y alrededores (~9 km). Envío gratis desde $25.000 CLP.',
    ogImage: `${SITE_URL}/images/og-gatos-jack.jpg`,
    jsonLd: [
      getCollectionPageSchema({
        name: 'Alimento, Arena y Snacks para Gatos en Frutillar',
        description:
          'Catálogo de alimento felino super premium Grain Free, alimento húmedo, arena sanitaria y antiparasitarios para gatos en Frutillar.',
        url: '/gatos',
      }),
      getBreadcrumbSchema([
        { name: 'Inicio', url: '/' },
        { name: 'Gatos', url: '/gatos' },
      ]),
      getFAQPageSchema([...GATOS_FAQS, ...GENERAL_FAQS.slice(0, 2)]),
    ],
    noscriptHtml: `<main style="max-width:760px;margin:40px auto;padding:24px;font-family:system-ui,sans-serif;color:#1D1D1F;">
      <h1>Alimento, Arena y Snacks Super Premium para Gatos en Frutillar</h1>
      <p>Fórmulas felinas holísticas ricas en proteína animal y taurina, alimento húmedo y arenas sanitarias con despacho el mismo día en Frutillar y alrededores (~9 km desde Frutillar Alto).</p>
      ${renderFaqsHtml([...GATOS_FAQS, ...GENERAL_FAQS.slice(0, 2)])}
      ${NAV_HTML}
    </main>`,
  },
  {
    file: 'nosotros.html',
    canonical: `${SITE_URL}/nosotros`,
    title: 'Nuestra Historia · Por qué creamos Patitas del Sur',
    description:
      'Conoce la historia real de Patitas del Sur en Frutillar: nacimos con bodega y stock local permanente para que a ninguna mascota le falte jamás su alimento habitual ni sufra cambios bruscos de dieta.',
    ogImage: `${SITE_URL}/images/og-patitas-frutillar.jpg`,
    jsonLd: [
      getBreadcrumbSchema([
        { name: 'Inicio', url: '/' },
        { name: 'Nosotros', url: '/nosotros' },
      ]),
    ],
    noscriptHtml: `<main style="max-width:760px;margin:40px auto;padding:24px;font-family:system-ui,sans-serif;color:#1D1D1F;">
      <h1>Nuestra Historia — Patitas del Sur en Frutillar</h1>
      <p>Nacimos en Frutillar con la misión de asegurar stock permanente de alimentos super premium y despacho confiable directo a tu domicilio o parcela en Frutillar y alrededores (~9 km alrededor de Frutillar Alto), evitando cambios bruscos de dieta.</p>
      ${NAV_HTML}
    </main>`,
  },
  {
    file: 'politicas-de-despacho.html',
    canonical: `${SITE_URL}/politicas-de-despacho`,
    title: 'Políticas de Despacho y Horarios de Entrega en Frutillar | Patitas del Sur',
    description:
      'Cobertura (~9 km alrededor de Frutillar Alto), ventanas de reparto Lunes a Sábado (10:00–13:00 y 15:30–19:30 hrs), envío gratis desde $25.000 CLP y Pedido Urgente los domingos ($3.500 CLP) en Patitas del Sur.',
    ogImage: `${SITE_URL}/images/og-patitas-frutillar.jpg`,
    jsonLd: [
      getBreadcrumbSchema([
        { name: 'Inicio', url: '/' },
        { name: 'Políticas de Despacho', url: '/politicas-de-despacho' },
      ]),
    ],
    noscriptHtml: `<main style="max-width:760px;margin:40px auto;padding:24px;font-family:system-ui,sans-serif;color:#1D1D1F;">
      <h1>Políticas de Despacho en Frutillar y Alrededores</h1>
      <p>Despacho con flota propia en un radio de ~9 km alrededor de Frutillar Alto (urbano y parcelaciones). Lunes a Sábado 10:00–13:00 y 15:30–19:30 hrs ($2.500 CLP, gratis desde $25.000 CLP). Pedido Urgente y Domingos 10:00–20:00 hrs ($3.500 CLP fijo).</p>
      ${NAV_HTML}
    </main>`,
  },
  {
    file: 'cambios-y-devoluciones.html',
    canonical: `${SITE_URL}/cambios-y-devoluciones`,
    title: 'Garantía Legal, Cambios y Devoluciones (SERNAC) | Patitas del Sur',
    description:
      'Conoce nuestra política de cambios en 10 días corridos con envase sellado, Garantía de Palatabilidad de 5 días hábiles (mínimo 80% del contenido) y 6 meses de garantía legal SERNAC en Frutillar.',
    ogImage: `${SITE_URL}/images/og-patitas-frutillar.jpg`,
    jsonLd: [
      getBreadcrumbSchema([
        { name: 'Inicio', url: '/' },
        { name: 'Cambios y Devoluciones', url: '/cambios-y-devoluciones' },
      ]),
    ],
    noscriptHtml: `<main style="max-width:760px;margin:40px auto;padding:24px;font-family:system-ui,sans-serif;color:#1D1D1F;">
      <h1>Garantía Legal, Cambios y Devoluciones</h1>
      <p>Garantía legal de 6 meses (Ley 19.496), cambios de envase sellado dentro de 10 días corridos y Garantía de Palatabilidad de 5 días hábiles conservando al menos el 80% del contenido.</p>
      ${NAV_HTML}
    </main>`,
  },
  {
    file: 'terminos-y-condiciones.html',
    canonical: `${SITE_URL}/terminos-y-condiciones`,
    title: 'Términos y Condiciones de Uso y Venta | Patitas del Sur',
    description:
      'Términos y condiciones de compra online en www.patitas-delsur.cl (Comercial Kira SpA, RUT 78.493.053-K): precios con IVA, boleta/factura SII y medios de pago Mercado Pago y Contra Entrega en Frutillar.',
    ogImage: `${SITE_URL}/images/og-patitas-frutillar.jpg`,
    jsonLd: [
      getBreadcrumbSchema([
        { name: 'Inicio', url: '/' },
        { name: 'Términos y Condiciones', url: '/terminos-y-condiciones' },
      ]),
    ],
    noscriptHtml: `<main style="max-width:760px;margin:40px auto;padding:24px;font-family:system-ui,sans-serif;color:#1D1D1F;">
      <h1>Términos y Condiciones de Uso y Venta</h1>
      <p>Condiciones comerciales de Patitas del Sur (Comercial Kira SpA, RUT 78.493.053-K) en Frutillar, Chile: precios en CLP con IVA incluido, emisión de boleta o factura SII y pagos vía Mercado Pago o Contra Entrega (transferencia, efectivo y POS móvil).</p>
      ${NAV_HTML}
    </main>`,
  },
  {
    file: 'politicas-de-privacidad.html',
    canonical: `${SITE_URL}/politicas-de-privacidad`,
    title: 'Políticas de Privacidad y Protección de Datos (Ley 19.628) | Patitas del Sur',
    description:
      'Política de privacidad y resguardo de datos personales de clientes y mascotas en Patitas del Sur conforme a la Ley N° 19.628 de Chile y ejercicio de derechos ARCO.',
    ogImage: `${SITE_URL}/images/og-patitas-frutillar.jpg`,
    jsonLd: [
      getBreadcrumbSchema([
        { name: 'Inicio', url: '/' },
        { name: 'Políticas de Privacidad', url: '/politicas-de-privacidad' },
      ]),
    ],
    noscriptHtml: `<main style="max-width:760px;margin:40px auto;padding:24px;font-family:system-ui,sans-serif;color:#1D1D1F;">
      <h1>Políticas de Privacidad y Protección de Datos</h1>
      <p>Tratamiento confidencial de datos personales conforme a la Ley N° 19.628 de la República de Chile por Comercial Kira SpA (Patitas del Sur).</p>
      ${NAV_HTML}
    </main>`,
  },
  {
    file: 'admin.html',
    noindex: true,
    includeAdminManifest: true,
    title: 'Panel de Administración | Patitas del Sur',
    description: 'Panel privado de administración y logística de Patitas del Sur.',
    ogImage: `${SITE_URL}/images/og-patitas-frutillar.jpg`,
    jsonLd: null,
  },
  {
    file: 'login.html',
    noindex: true,
    title: 'Iniciar Sesión | Patitas del Sur',
    description: 'Acceso a tu cuenta de Club Patitas en Patitas del Sur.',
    ogImage: `${SITE_URL}/images/og-patitas-frutillar.jpg`,
    jsonLd: null,
  },
  {
    file: 'mi-cuenta.html',
    noindex: true,
    title: 'Mi Cuenta | Patitas del Sur',
    description: 'Portal de cliente, mascotas y pedidos de Patitas del Sur.',
    ogImage: `${SITE_URL}/images/og-patitas-frutillar.jpg`,
    jsonLd: null,
  },
];

function applyRouteMeta(templateHtml, route) {
  let html = templateHtml;

  // Replace <title>
  html = html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${escapeHtml(route.title)}</title>`);

  // Replace meta description
  html = html.replace(
    /<meta\s+name="description"\s+content="[^"]*"\s*\/?>/i,
    `<meta name="description" content="${escapeHtml(route.description)}" />`
  );

  // Replace meta robots
  const robotsValue = route.noindex ? 'noindex, nofollow' : 'index, follow';
  html = html.replace(
    /<meta\s+name="robots"\s+content="[^"]*"\s*\/?>/i,
    `<meta name="robots" content="${robotsValue}" />`
  );

  // Replace OG & Twitter tags
  const ogUrl = route.canonical || `${SITE_URL}/`;
  html = html.replace(
    /<meta\s+property="og:url"\s+content="[^"]*"\s*\/?>/i,
    `<meta property="og:url" content="${escapeHtml(ogUrl)}" />`
  );
  html = html.replace(
    /<meta\s+property="og:title"\s+content="[^"]*"\s*\/?>/i,
    `<meta property="og:title" content="${escapeHtml(route.title)}" />`
  );
  html = html.replace(
    /<meta\s+property="og:description"\s+content="[^"]*"\s*\/?>/i,
    `<meta property="og:description" content="${escapeHtml(route.description)}" />`
  );
  html = html.replace(
    /<meta\s+property="og:image"\s+content="[^"]*"\s*\/?>/i,
    `<meta property="og:image" content="${escapeHtml(route.ogImage)}" />`
  );
  html = html.replace(
    /<meta\s+name="twitter:title"\s+content="[^"]*"\s*\/?>/i,
    `<meta name="twitter:title" content="${escapeHtml(route.title)}" />`
  );
  html = html.replace(
    /<meta\s+name="twitter:description"\s+content="[^"]*"\s*\/?>/i,
    `<meta name="twitter:description" content="${escapeHtml(route.description)}" />`
  );
  html = html.replace(
    /<meta\s+name="twitter:image"\s+content="[^"]*"\s*\/?>/i,
    `<meta name="twitter:image" content="${escapeHtml(route.ogImage)}" />`
  );

  // Inject route-specific head additions (canonical, optional verification tags, admin manifest, route JSON-LD)
  const headAdditions = [];
  if (route.canonical && !route.noindex) {
    headAdditions.push(`    <link rel="canonical" href="${escapeHtml(route.canonical)}" />`);
  }
  if (route.includeAdminManifest) {
    headAdditions.push('    <link rel="manifest" href="/manifest.webmanifest" />');
  }
  if (GOOGLE_VERIFICATION) {
    headAdditions.push(`    <meta name="google-site-verification" content="${escapeHtml(GOOGLE_VERIFICATION)}" />`);
  }
  if (BING_VERIFICATION) {
    headAdditions.push(`    <meta name="msvalidate.01" content="${escapeHtml(BING_VERIFICATION)}" />`);
  }
  const cleanJsonLd = Array.isArray(route.jsonLd) ? route.jsonLd.filter(Boolean) : route.jsonLd;
  const hasJsonLd = Array.isArray(cleanJsonLd) ? cleanJsonLd.length > 0 : Boolean(cleanJsonLd);
  if (hasJsonLd) {
    const payload = Array.isArray(cleanJsonLd) && cleanJsonLd.length === 1 ? cleanJsonLd[0] : cleanJsonLd;
    headAdditions.push(`    <script id="seo-json-ld" type="application/ld+json">${JSON.stringify(payload)}</script>`);
  }

  if (headAdditions.length > 0) {
    html = html.replace('</head>', `${headAdditions.join('\n')}\n  </head>`);
  }

  // Replace <noscript> with route-specific semantic fallback HTML
  if (route.noscriptHtml) {
    html = html.replace(
      /<noscript>[\s\S]*?<\/noscript>/i,
      `<noscript>\n      ${route.noscriptHtml}\n    </noscript>`
    );
  }

  return html;
}

async function run() {
  const indexPath = path.join(DIST_DIR, 'index.html');
  const rawTemplate = await fs.readFile(indexPath, 'utf8');

  // 1. Save clean SPA fallback (_spa.html) without hardcoded canonical
  let spaHtml = rawTemplate;
  const spaVerifications = [];
  if (GOOGLE_VERIFICATION) {
    spaVerifications.push(`    <meta name="google-site-verification" content="${escapeHtml(GOOGLE_VERIFICATION)}" />`);
  }
  if (BING_VERIFICATION) {
    spaVerifications.push(`    <meta name="msvalidate.01" content="${escapeHtml(BING_VERIFICATION)}" />`);
  }
  if (spaVerifications.length > 0) {
    spaHtml = spaHtml.replace('</head>', `${spaVerifications.join('\n')}\n  </head>`);
  }
  await fs.writeFile(path.join(DIST_DIR, '_spa.html'), spaHtml, 'utf8');

  // 2. Generate route-specific static HTML files
  for (const route of ROUTES) {
    const outPath = path.join(DIST_DIR, route.file);
    await fs.mkdir(path.dirname(outPath), { recursive: true });
    const rendered = applyRouteMeta(rawTemplate, route);
    await fs.writeFile(outPath, rendered, 'utf8');
  }

  console.log(`[prerender-seo] Generated _spa.html + ${ROUTES.length} route HTML files in dist/`);
}

run().catch((err) => {
  console.error('[prerender-seo] Failed:', err);
  process.exit(1);
});
