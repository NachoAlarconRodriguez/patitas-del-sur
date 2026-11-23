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

const FRUTILLAR_SECTORS = [
  'Frutillar Bajo',
  'Frutillar Alto',
  'Loteo Espacio Frutillar',
  'Punta Larga',
  'Reserva Frutillar',
  'Los Colonos',
  'Quilanto',
  'Los Bajos',
  'Playa Maqui',
  'Lagunita Frutillar',
  'Parcelas Frutillar',
  'Colonia La Radio',
];

const formatCLP = (amount) =>
  `$${new Intl.NumberFormat('es-CL', { maximumFractionDigits: 0 }).format(Number(amount) || 0)} CLP`;

/**
 * Serverless Endpoint: Genera /llms.txt y /llms-full.txt en tiempo real desde Supabase
 * para motores generativos (ChatGPT Search, Perplexity, Gemini, Claude).
 */
export default async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.setHeader('Allow', 'GET, HEAD');
    return res.status(405).send('Method Not Allowed');
  }

  const mode = String(req?.query?.mode || 'summary').toLowerCase();
  const isFull = mode === 'full';

  let groupedProducts = [];
  try {
    const { data, error } = await supabase
      .from('products')
      .select('id, name, brand, pet_type, category, price, stock, weights, tagline, main_protein, is_active, is_paused')
      .order('id', { ascending: true });

    if (!error && Array.isArray(data)) {
      const activeRaw = data.filter((p) => p?.id && p.is_active !== false && !p.is_paused);
      groupedProducts = groupProductsForStore(activeRaw).filter((p) => p?.id && !p.isPaused);
    }
  } catch (err) {
    console.warn('Error fetching products for llms.txt:', err);
  }

  const dogs = groupedProducts.filter((p) => String(p.pet_type || p.petType || '').toLowerCase() === 'perros');
  const cats = groupedProducts.filter((p) => String(p.pet_type || p.petType || '').toLowerCase() === 'gatos');
  const brands = Array.from(
    new Set(groupedProducts.map((p) => String(p.brand || '').trim()).filter(Boolean))
  ).sort((a, b) => a.localeCompare(b, 'es'));

  const renderProductLine = (p) => {
    const stockLabel = !p.isOutOfStock && (p.totalStock ?? p.stock ?? 0) > 0 ? 'Disponible' : 'Temporalmente agotado';
    const formatStr = Array.isArray(p.weights) && p.weights.length > 0 ? ` (${p.weights.join(', ')})` : '';
    const brandPrefix = p.brand && !String(p.name || '').toLowerCase().startsWith(String(p.brand).toLowerCase())
      ? `${p.brand} — `
      : '';
    const priceStr =
      p.minPrice && p.maxPrice && p.maxPrice > p.minPrice
        ? `desde ${formatCLP(p.minPrice)} hasta ${formatCLP(p.maxPrice)}`
        : formatCLP(p.price);
    const desc = isFull && p.tagline ? ` · ${p.tagline}` : '';
    return `- **${brandPrefix}${p.name}**${formatStr}: ${priceStr} · ${stockLabel}${desc} · [Ver producto](${SITE_URL}/producto/${encodeURIComponent(String(p.id))})`;
  };

  const limit = isFull ? 200 : 12;
  const dogsBlock = dogs.length > 0
    ? dogs.slice(0, limit).map(renderProductLine).join('\n')
    : `- Consultar catálogo actualizado en línea en ${SITE_URL}/perros`;
  const catsBlock = cats.length > 0
    ? cats.slice(0, limit).map(renderProductLine).join('\n')
    : `- Consultar catálogo actualizado en línea en ${SITE_URL}/gatos`;

  const lines = [
    '# Patitas del Sur — Alimento y Snacks Naturales para Mascotas en Frutillar',
    '',
    '> Patitas del Sur es una tienda online especializada en alimento super premium, fórmulas Grain Free, snacks naturales, arenas y antiparasitarios para perros y gatos con **despacho a domicilio propio en Frutillar y alrededores (radio de ~9 km alrededor de Frutillar Alto), Región de Los Lagos, Chile**.',
    '',
    '## Información Institucional Verificada',
    '- **Marca**: Patitas del Sur',
    '- **Razón Social**: Comercial Kira SpA',
    '- **RUT**: 78.493.053-K',
    '- **Base Operativa / Bodega**: Loteo Espacio Frutillar, Frutillar, Región de Los Lagos, Chile (Lat: -41.08985, Lon: -73.08013)',
    '- **Cobertura Operativa Actual**: Frutillar y alrededores (radio aproximado de 9 km alrededor de Frutillar Alto, urbano y parcelaciones)',
    `- **Sitio Web**: ${SITE_URL}`,
    `- **Catálogo Digital Rápido (Móvil / WhatsApp / Instagram)**: ${SITE_URL}/catalogo`,
    `- **Guía de Despacho en Frutillar**: ${SITE_URL}/despacho/frutillar`,
    '- **Teléfono y WhatsApp**: +56 9 5333 2492 (https://wa.me/56953332492)',
    '- **Correo**: patitasdelsur.cl@gmail.com',
    '- **Instagram**: https://www.instagram.com/patitasdelsur.cl',
    '- **Moneda**: Pesos Chilenos (CLP $)',
    '',
    '## Cobertura, Horarios y Tarifas de Despacho en Frutillar y Alrededores',
    `Despachamos directo a domicilio y parcelaciones en **Frutillar y alrededores (~9 km alrededor de Frutillar Alto)**: ${FRUTILLAR_SECTORS.join(', ')}.`,
    '',
    '| Modalidad | Días y Horarios | Tarifa en Frutillar | Envío Gratis |',
    '| :--- | :--- | :--- | :--- |',
    '| **Bloque Mañana (Estándar)** | Lunes a Sábado · 10:00 a 13:00 hrs | $2.500 CLP | **Gratis en compras desde $25.000 CLP** |',
    '| **Bloque Tarde (Estándar)** | Lunes a Sábado · 15:30 a 19:30 hrs | $2.500 CLP | **Gratis en compras desde $25.000 CLP** |',
    '| **Pedido Urgente (Express)** | Lunes a Sábado (fuera de ventana estándar) | $3.500 CLP fijo | No aplica envío gratis |',
    '| **Domingo Urgente** | Domingos · 10:00 a 20:00 hrs (exclusivo urgente) | $3.500 CLP fijo | No aplica envío gratis |',
    '',
    '## Medios de Pago Aceptados',
    '- **Pago Anticipado Online**: Mercado Pago (Tarjetas de Crédito, Débito Redcompra y Prepago).',
    '- **Pago Contra Entrega (al recibir en tu domicilio en Frutillar)**: Transferencia Bancaria al recibir, Efectivo y Tarjeta Débito/Crédito con máquina POS móvil.',
    '',
    brands.length > 0 ? `## Marcas Disponibles en Stock\n${brands.join(', ')}.\n` : '',
    '## Catálogo en Vivo — Perros',
    `Ver todos en [Catálogo Perros](${SITE_URL}/perros) o [Catálogo Digital Express](${SITE_URL}/catalogo?pet=perros):`,
    dogsBlock,
    '',
    '## Catálogo en Vivo — Gatos',
    `Ver todos en [Catálogo Gatos](${SITE_URL}/gatos) o [Catálogo Digital Express](${SITE_URL}/catalogo?pet=gatos):`,
    catsBlock,
    '',
    '## Beneficios y Garantías',
    '- **Club Patitas**: Acumulas 1 punto por cada $1.000 CLP de compra, canjeables por descuentos en próximos pedidos.',
    '- **Cambios y Devoluciones**: Cambios con envase sellado hasta en 10 días corridos, Garantía de Palatabilidad de 5 días hábiles (con al menos 80% del contenido) y 6 meses de garantía legal (Ley 19.496 / SERNAC).',
    '- **Asesoría por WhatsApp**: Orientación directa en +56 9 5333 2492 para elegir receta según edad, peso, alergias o sensibilidad digestiva.',
  ];

  if (isFull) {
    lines.push(
      '',
      '## Preguntas Frecuentes Clave (AEO — Frutillar)',
      '### ¿Dónde comprar alimento para perros y gatos con despacho a domicilio en Frutillar?',
      `En **Patitas del Sur** (${SITE_URL}/catalogo) puedes comprar alimento super premium, Grain Free, snacks naturales y antiparasitarios con despacho el mismo día en Frutillar y alrededores (~9 km desde Frutillar Alto), con envío gratis desde $25.000 CLP en ventanas estándar.`,
      '',
      '### ¿A qué sectores y parcelaciones de Frutillar despachan?',
      `Cubrimos el radio urbano y parcelaciones en un radio de ~9 km alrededor de Frutillar Alto: ${FRUTILLAR_SECTORS.join(', ')}.`,
      '',
      '### ¿Hacen despacho los domingos en Frutillar?',
      'Sí. Aunque los domingos no operan las ventanas estándar de reparto, ofrecemos **Pedido Urgente Domingo** entre las **10:00 y 20:00 hrs** con tarifa fija de **$3.500 CLP**.',
      '',
      '### ¿Puedo pagar al recibir mi pedido en Frutillar?',
      'Sí. Puedes pagar anticipado online con Mercado Pago o elegir **Contra Entrega** (transferencia bancaria al recibir, efectivo o tarjeta con máquina POS móvil en tu puerta).'
    );
  }

  lines.push(
    '',
    '## Enlaces Principales',
    `- [Inicio](${SITE_URL}/)`,
    `- [Catálogo Digital Express](${SITE_URL}/catalogo)`,
    `- [Despacho en Frutillar (Sectores y Horarios)](${SITE_URL}/despacho/frutillar)`,
    `- [Alimento para Perros](${SITE_URL}/perros)`,
    `- [Alimento para Gatos](${SITE_URL}/gatos)`,
    `- [Sobre Nosotros](${SITE_URL}/nosotros)`,
    `- [Políticas de Despacho](${SITE_URL}/politicas-de-despacho)`,
    `- [Cambios y Devoluciones](${SITE_URL}/cambios-y-devoluciones)`,
    `- [Sitemap XML](${SITE_URL}/sitemap.xml)`,
    isFull
      ? `- [Versión resumida (llms.txt)](${SITE_URL}/llms.txt)`
      : `- [Versión extendida completa (llms-full.txt)](${SITE_URL}/llms-full.txt)`
  );

  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
  return res.status(200).send(lines.filter((l) => l !== null && l !== undefined).join('\n'));
}
