import { getCanonicalSiteEntries } from './sitemap.js';

const SITE_URL = (
  process.env.SITE_URL ||
  process.env.VITE_SITE_URL ||
  'https://www.patitas-delsur.cl'
).replace(/\/+$/, '');

const INDEXNOW_KEY = (
  process.env.INDEXNOW_KEY ||
  '7c4e9b2a8f1d4e6a9c3b5d7f2a8e4c1b'
).trim();

/**
 * Serverless Endpoint: Notificación masiva o puntual a IndexNow (Bing, ChatGPT Search, Copilot, Yandex, Seznam).
 * Uso:
 *   POST /api/indexnow?key=7c4e9b2a8f1d4e6a9c3b5d7f2a8e4c1b
 *   Body opcional: { "urls": ["https://www.patitas-delsur.cl/despacho/frutillar"] }
 *   Si no se envía `urls`, envía automáticamente todas las URLs canónicas activas del sitemap.
 */
export default async function handler(req, res) {
  res.setHeader('X-Robots-Tag', 'noindex, nofollow');

  if (req.method !== 'POST' && req.method !== 'GET') {
    res.setHeader('Allow', 'GET, POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const providedKey = String(
    req.query?.key ||
      req.headers?.['x-indexnow-key'] ||
      req.body?.key ||
      ''
  ).trim();

  const expectedSecret = process.env.INDEXNOW_SECRET || INDEXNOW_KEY;
  if (!providedKey || providedKey !== expectedSecret) {
    return res.status(401).json({
      error: 'Unauthorized. Provide ?key=<INDEXNOW_KEY> or x-indexnow-key header.',
    });
  }

  let host;
  try {
    host = new URL(SITE_URL).host;
  } catch {
    host = 'www.patitas-delsur.cl';
  }

  let urlList = [];
  if (Array.isArray(req.body?.urls) && req.body.urls.length > 0) {
    urlList = req.body.urls
      .map((u) => String(u || '').trim())
      .filter((u) => u.startsWith(SITE_URL));
  } else {
    const entries = await getCanonicalSiteEntries();
    urlList = entries.map((e) => `${SITE_URL}${e.path}`);
  }

  if (urlList.length === 0) {
    return res.status(400).json({ error: 'No valid URLs to submit to IndexNow.' });
  }

  const payload = {
    host,
    key: INDEXNOW_KEY,
    keyLocation: `${SITE_URL}/${INDEXNOW_KEY}.txt`,
    urlList: urlList.slice(0, 10000),
  };

  try {
    const response = await fetch('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify(payload),
    });

    const responseText = await response.text().catch(() => '');

    return res.status(response.ok ? 200 : 502).json({
      ok: response.ok,
      indexNowStatus: response.status,
      submittedCount: payload.urlList.length,
      keyLocation: payload.keyLocation,
      urls: payload.urlList,
      details: responseText || (response.ok ? 'Accepted by IndexNow' : 'IndexNow rejected request'),
    });
  } catch (err) {
    return res.status(502).json({
      ok: false,
      error: err?.message || 'Failed to contact api.indexnow.org',
    });
  }
}
