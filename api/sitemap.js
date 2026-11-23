import { createClient } from '@supabase/supabase-js';
import { groupProductsForStore } from '../src/utils/productVariants.js';

const SITE_URL = (
  process.env.SITE_URL ||
  process.env.VITE_SITE_URL ||
  'https://www.patitas-delsur.cl'
).replace(/\/+$/, '');

const SUPABASE_URL =
  process.env.VITE_SUPABASE_URL ||
  process.env.SUPABASE_URL ||
  'https://onouflypoewijovavkec.supabase.co';

const SUPABASE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.VITE_SUPABASE_ANON_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9ub3VmbHlwb2V3aWpvdmF2a2VjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTIzOTA5MzksImV4cCI6MjEwNzk2NjkzOX0.CgguuTDxIPqNYHQePsivaDMowZo6nkdmD24J1LzZ8mQ';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const escapeXml = (str) =>
  String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

const toDateOnly = (iso) => {
  if (iso && typeof iso === 'string') {
    const match = iso.match(/^\d{4}-\d{2}-\d{2}/);
    if (match) return match[0];
  }
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Santiago',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
};

/**
 * Construye la lista canónica de rutas públicas (estáticas + productos agrupados)
 * Reutilizada por /sitemap.xml y /api/indexnow.
 */
export async function getCanonicalSiteEntries() {
  const today = toDateOnly();

  const staticRoutes = [
    { path: '/', changefreq: 'daily', priority: '1.0', lastmod: today },
    { path: '/catalogo', changefreq: 'daily', priority: '0.95', lastmod: today },
    { path: '/despacho/frutillar', changefreq: 'weekly', priority: '0.95', lastmod: today },
    { path: '/perros', changefreq: 'daily', priority: '0.9', lastmod: today },
    { path: '/gatos', changefreq: 'daily', priority: '0.9', lastmod: today },
    { path: '/nosotros', changefreq: 'monthly', priority: '0.7', lastmod: today },
    { path: '/politicas-de-despacho', changefreq: 'monthly', priority: '0.6', lastmod: today },
    { path: '/cambios-y-devoluciones', changefreq: 'monthly', priority: '0.6', lastmod: today },
    { path: '/terminos-y-condiciones', changefreq: 'monthly', priority: '0.5', lastmod: today },
    { path: '/politicas-de-privacidad', changefreq: 'monthly', priority: '0.5', lastmod: today },
  ];

  let productRoutes = [];
  try {
    const { data, error } = await supabase
      .from('products')
      .select('id, name, brand, pet_type, weights, price, stock, updated_at, is_active, is_paused')
      .order('id', { ascending: true });

    if (!error && Array.isArray(data)) {
      const activeRaw = data.filter((p) => p?.id && p.is_active !== false && !p.is_paused);
      const grouped = groupProductsForStore(activeRaw);

      const seenIds = new Set();
      productRoutes = grouped
        .filter((p) => {
          if (!p?.id || p.isPaused) return false;
          const idKey = String(p.id);
          if (seenIds.has(idKey)) return false;
          seenIds.add(idKey);
          return true;
        })
        .map((p) => ({
          path: `/producto/${encodeURIComponent(String(p.id))}`,
          changefreq: 'weekly',
          priority: '0.8',
          lastmod: toDateOnly(p.updated_at),
        }));
    }
  } catch (err) {
    console.warn('Error fetching products for dynamic sitemap:', err);
  }

  return [...staticRoutes, ...productRoutes];
}

/**
 * Serverless Endpoint: Sitemap XML dinámico conectado al inventario real en Supabase.
 * Emite únicamente URLs canónicas (productos agrupados por familia/formato) y excluye rutas privadas y tarjetas NFC.
 */
export default async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.setHeader('Allow', 'GET, HEAD');
    return res.status(405).send('Method Not Allowed');
  }

  const allUrls = await getCanonicalSiteEntries();

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allUrls
  .map(
    (entry) => `  <url>
    <loc>${escapeXml(`${SITE_URL}${entry.path}`)}</loc>
    <lastmod>${escapeXml(entry.lastmod)}</lastmod>
    <changefreq>${entry.changefreq}</changefreq>
    <priority>${entry.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>
`;

  res.setHeader('Content-Type', 'application/xml; charset=utf-8');
  res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
  return res.status(200).send(xml);
}
