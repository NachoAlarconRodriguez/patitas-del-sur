/**
 * Generador inteligente y normalizador de datos para el Plato Interactivo de Ingredientes (6 gajos)
 * en cada página de detalle de producto (ProductDetailView) y en el editor del Panel Admin.
 *
 * - Respeta el orden exacto de los 6 primeros ingredientes del producto (Gajo #1 = Ingrediente #1, etc.).
 * - Asocia automáticamente cada ingrediente con la fotografía cenital más fiel del Banco de Imágenes local.
 * - Migra al vuelo cualquier URL legacy externa guardada previamente en Supabase.
 */

export const BOWL_BASE_IMAGE = '/images/bowl/bol-base.webp';

export const BOWL_IMAGE_CATEGORIES = [
  'Carnes y Aves',
  'Pescados y Omega',
  'Carbohidratos y Raíces',
  'Verduras y Legumbres',
  'Frutas y Botánicos',
];

export const BOWL_IMAGE_BANK = [
  // Carnes y Aves
  {
    id: 'pollo',
    label: 'Pollo',
    category: 'Carnes y Aves',
    url: '/images/bowl/ing-pollo.webp',
    keywords: ['pollo', 'ave', 'aves', 'pechuga', 'gallina'],
  },
  {
    id: 'pavo',
    label: 'Pavo',
    category: 'Carnes y Aves',
    url: '/images/bowl/ing-pavo.webp',
    keywords: ['pavo'],
  },
  {
    id: 'cordero',
    label: 'Cordero',
    category: 'Carnes y Aves',
    url: '/images/bowl/ing-cordero.webp',
    keywords: ['cordero', 'borrego', 'ovino'],
  },
  {
    id: 'vacuno',
    label: 'Vacuno / Res',
    category: 'Carnes y Aves',
    url: '/images/bowl/ing-vacuno.webp',
    keywords: ['carne de vacuno', 'carne de res', 'carne roja', 'vacuno', 'res', 'buey', 'ternera', 'bovino', 'higado', 'corazon'],
  },
  {
    id: 'pato',
    label: 'Pato',
    category: 'Carnes y Aves',
    url: '/images/bowl/ing-pato.webp',
    keywords: ['pato'],
  },
  {
    id: 'cerdo',
    label: 'Cerdo / Jabalí',
    category: 'Carnes y Aves',
    url: '/images/bowl/ing-cerdo.webp',
    keywords: ['cerdo', 'jabali', 'porcino', 'iberico'],
  },
  {
    id: 'venado',
    label: 'Venado / Ciervo',
    category: 'Carnes y Aves',
    url: '/images/bowl/ing-venado.webp',
    keywords: ['venado', 'ciervo', 'venison'],
  },
  {
    id: 'conejo',
    label: 'Conejo',
    category: 'Carnes y Aves',
    url: '/images/bowl/ing-conejo.webp',
    keywords: ['conejo', 'liebre'],
  },
  {
    id: 'huevo',
    label: 'Huevo',
    category: 'Carnes y Aves',
    url: '/images/bowl/ing-huevo.webp',
    keywords: ['huevo', 'huevos', 'ovoproducto'],
  },

  // Pescados y Omega
  {
    id: 'aceite-omega',
    label: 'Aceite de Salmón / Omega 3',
    category: 'Pescados y Omega',
    url: '/images/bowl/ing-aceite-omega.webp',
    keywords: ['aceite de salmon', 'aceite de pescado', 'aceite de linaza', 'aceite', 'omega', 'linaza', 'chia', 'semilla de lino'],
  },
  {
    id: 'trucha',
    label: 'Trucha',
    category: 'Pescados y Omega',
    url: '/images/bowl/ing-trucha.webp',
    keywords: ['trucha', 'trout'],
  },
  {
    id: 'salmon',
    label: 'Salmón',
    category: 'Pescados y Omega',
    url: '/images/bowl/ing-salmon.webp',
    keywords: ['salmon'],
  },
  {
    id: 'pescado-blanco',
    label: 'Pescado Blanco / Arenque / Merluza',
    category: 'Pescados y Omega',
    url: '/images/bowl/ing-pescado-blanco.webp',
    keywords: ['pescado blanco', 'merluza', 'arenque', 'caballa', 'sardina', 'bacalao', 'atun', 'pescado', 'jurel', 'krill'],
  },

  // Carbohidratos y Raíces
  {
    id: 'camote',
    label: 'Camote / Boniato',
    category: 'Carbohidratos y Raíces',
    url: '/images/bowl/ing-camote.webp',
    keywords: ['camote', 'boniato', 'batata'],
  },
  {
    id: 'zapallo',
    label: 'Zapallo / Calabaza',
    category: 'Carbohidratos y Raíces',
    url: '/images/bowl/ing-zapallo.webp',
    keywords: ['zapallo', 'calabaza', 'calabacin'],
  },
  {
    id: 'papa',
    label: 'Papa / Mandioca / Tapioca',
    category: 'Carbohidratos y Raíces',
    url: '/images/bowl/ing-papa.webp',
    keywords: ['papa', 'patata', 'mandioca', 'tapioca', 'yuca'],
  },
  {
    id: 'arroz-avena',
    label: 'Arroz Integral / Avena',
    category: 'Carbohidratos y Raíces',
    url: '/images/bowl/ing-arroz-avena.webp',
    keywords: ['arroz integral', 'arroz', 'avena', 'cebada', 'quinoa', 'quinua', 'sorgo', 'maiz', 'trigo', 'cereal', 'grano'],
  },

  // Verduras y Legumbres
  {
    id: 'zanahoria',
    label: 'Zanahoria',
    category: 'Verduras y Legumbres',
    url: '/images/bowl/ing-zanahoria.webp',
    keywords: ['zanahoria', 'betacaroteno'],
  },
  {
    id: 'espinaca',
    label: 'Espinaca / Vegetales Verdes',
    category: 'Verduras y Legumbres',
    url: '/images/bowl/ing-espinaca.webp',
    keywords: ['espinaca', 'acelga', 'kale', 'brocoli', 'alfalfa', 'verdura', 'vegetal', 'espirulina', 'alga', 'kelp'],
  },
  {
    id: 'arvejas',
    label: 'Arvejas / Guisantes',
    category: 'Verduras y Legumbres',
    url: '/images/bowl/ing-arvejas.webp',
    keywords: ['arveja', 'arvejas', 'guisante', 'guisantes', 'chicharo'],
  },
  {
    id: 'lentejas',
    label: 'Lentejas / Garbanzos',
    category: 'Verduras y Legumbres',
    url: '/images/bowl/ing-lentejas.webp',
    keywords: ['lenteja', 'lentejas', 'garbanzo', 'garbanzos', 'haba', 'habas', 'legumbre', 'poroto', 'frijol'],
  },

  // Frutas y Botánicos
  {
    id: 'arandanos',
    label: 'Arándanos / Berries',
    category: 'Frutas y Botánicos',
    url: '/images/bowl/ing-arandanos.webp',
    keywords: ['arandano', 'arandanos', 'cranberry', 'blueberry', 'berry', 'berries', 'fruto rojo', 'maqui', 'mora', 'frambuesa'],
  },
  {
    id: 'manzana-verde',
    label: 'Manzana Verde',
    category: 'Frutas y Botánicos',
    url: '/images/bowl/ing-manzana-verde.webp',
    keywords: ['manzana verde', 'pulpa de manzana', 'manzana', 'pera'],
  },
  {
    id: 'platano',
    label: 'Plátano',
    category: 'Frutas y Botánicos',
    url: '/images/bowl/ing-platano.webp',
    keywords: ['platano', 'banana'],
  },
  {
    id: 'pina',
    label: 'Piña',
    category: 'Frutas y Botánicos',
    url: '/images/bowl/ing-pina.webp',
    keywords: ['pina', 'anana', 'bromelina'],
  },
  {
    id: 'hierbas',
    label: 'Hierbas / Romero / Cúrcuma / Botánicos',
    category: 'Frutas y Botánicos',
    url: '/images/bowl/ing-hierbas.webp',
    keywords: [
      'romero',
      'curcuma',
      'manzanilla',
      'yucca',
      'yuca schidigera',
      'achicoria',
      'inulina',
      'prebiotic',
      'probiotic',
      'levadura',
      'glucosamina',
      'condroitina',
      'taurina',
      'vitamina',
      'mineral',
      'hierba',
      'botanic',
      'jengibre',
      'menta',
      'te verde',
    ],
  },
];

// Alias retrocompatible para cualquier importación existente
export const BOWL_IMAGE_PRESETS = BOWL_IMAGE_BANK;

const LEGACY_BOWL_URL_MAP = {
  'https://media.kolpusites.com/kibory/bol-pollo.webp': '/images/bowl/ing-pollo.webp',
  'https://media.kolpusites.com/kibory/bol-salmon.webp': '/images/bowl/ing-salmon.webp',
  'https://media.kolpusites.com/kibory/bol-boniato.webp': '/images/bowl/ing-camote.webp',
  'https://media.kolpusites.com/kibory/bol-zanahoria.webp': '/images/bowl/ing-zanahoria.webp',
  'https://media.kolpusites.com/kibory/bol-guisantes.webp': '/images/bowl/ing-arvejas.webp',
  'https://media.kolpusites.com/kibory/bol-arandanos.webp': '/images/bowl/ing-arandanos.webp',
};

export const WEDGE_GEOMETRY = [
  {
    num: 1,
    c: 330,
    p0: '-19.28% 10%',
    pm: '10% -19.28%',
    p1: '50% -30%',
    hx: '36.5%',
    hy: '26.62%',
    defaultImg: '/images/bowl/ing-pollo.webp',
  },
  {
    num: 2,
    c: 270,
    p0: '-19.28% 90%',
    pm: '-30% 50%',
    p1: '-19.28% 10%',
    hx: '23%',
    hy: '50%',
    defaultImg: '/images/bowl/ing-salmon.webp',
  },
  {
    num: 3,
    c: 210,
    p0: '50% 130%',
    pm: '10% 119.28%',
    p1: '-19.28% 90%',
    hx: '36.5%',
    hy: '73.38%',
    defaultImg: '/images/bowl/ing-camote.webp',
  },
  {
    num: 4,
    c: 30,
    p0: '50% -30%',
    pm: '90% -19.28%',
    p1: '119.28% 10%',
    hx: '63.5%',
    hy: '26.62%',
    defaultImg: '/images/bowl/ing-zanahoria.webp',
  },
  {
    num: 5,
    c: 90,
    p0: '119.28% 10%',
    pm: '130% 50%',
    p1: '119.28% 90%',
    hx: '77%',
    hy: '50%',
    defaultImg: '/images/bowl/ing-arvejas.webp',
  },
  {
    num: 6,
    c: 150,
    p0: '119.28% 90%',
    pm: '90% 119.28%',
    p1: '50% 130%',
    hx: '63.5%',
    hy: '73.38%',
    defaultImg: '/images/bowl/ing-arandanos.webp',
  },
];

function normalizeText(value) {
  return String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

function escapeRegExp(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function matchesKeyword(normalizedText, keyword) {
  const kw = normalizeText(keyword);
  if (!kw) return false;
  // Palabras cortas o ambiguas requieren coincidencia de palabra completa (evita 'res' en 'fresco' o 'ave' en 'avena')
  if (kw.length <= 5 || kw.includes(' ')) {
    const regex = new RegExp(`(?:^|[^a-z0-9])${escapeRegExp(kw)}(?:$|[^a-z0-9])`);
    return regex.test(normalizedText);
  }
  return normalizedText.includes(kw);
}

export function normalizeBowlImageUrl(url, fallbackSlotIdx = 0) {
  const clean = String(url || '').trim();
  if (!clean) {
    return WEDGE_GEOMETRY[fallbackSlotIdx]?.defaultImg || '/images/bowl/ing-pollo.webp';
  }
  if (LEGACY_BOWL_URL_MAP[clean]) {
    return LEGACY_BOWL_URL_MAP[clean];
  }
  return clean;
}

export function matchIngredientImage(rawText, fallbackSlotIdx = 0) {
  const normalized = normalizeText(rawText);
  if (normalized) {
    let bestUrl = null;
    let bestScore = -1;
    for (const item of BOWL_IMAGE_BANK) {
      for (const kw of item.keywords) {
        if (matchesKeyword(normalized, kw)) {
          // Priorizar la coincidencia más específica (frases/palabras más largas)
          const score = kw.length + (kw.includes(' ') ? 10 : 0);
          if (score > bestScore) {
            bestScore = score;
            bestUrl = item.url;
          }
        }
      }
    }
    if (bestUrl) return bestUrl;
  }
  return WEDGE_GEOMETRY[fallbackSlotIdx]?.defaultImg || '/images/bowl/ing-hierbas.webp';
}

function cleanIngTitle(raw) {
  if (!raw) return '';
  let s = String(raw)
    .replace(/\([^)]*\)/g, '')
    .replace(/\b\d+(?:[.,]\d+)?\s*%/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  if (!s) return String(raw).trim();
  s = s.charAt(0).toUpperCase() + s.slice(1);
  if (s.length > 28) {
    const words = s.split(' ');
    s = words.slice(0, 4).join(' ');
  }
  return s;
}

/**
 * Analiza un ingrediente y retorna su título limpio, píldora de beneficio,
 * descripción sugerida e imagen cenital recomendada del banco local.
 */
export function analyzeIngredient(rawText, petLabel = 'perro o gato', fallbackSlotIdx = 0) {
  const t = normalizeText(rawText);
  const title = cleanIngTitle(rawText);
  const img = matchIngredientImage(rawText, fallbackSlotIdx);

  // Pescados y Aceites Omega 3 y 6
  if (
    t.includes('aceite') ||
    t.includes('omega') ||
    t.includes('salmon') ||
    t.includes('trucha') ||
    t.includes('arenque') ||
    t.includes('caballa') ||
    t.includes('merluza') ||
    t.includes('pescado') ||
    t.includes('sardina') ||
    t.includes('atun') ||
    t.includes('krill') ||
    t.includes('linaza')
  ) {
    return {
      name: title,
      pill: t.includes('aceite') || t.includes('omega') || t.includes('linaza') ? 'Omega 3 y 6' : 'Omega 3',
      desc: `Fuente rica en ácidos grasos esenciales EPA y DHA para nutrir la piel, dar brillo al pelaje y cuidar las articulaciones de tu ${petLabel}.`,
      img,
    };
  }

  // Proteínas animales principales
  if (
    t.includes('pollo') ||
    t.includes('pavo') ||
    t.includes('ave') ||
    t.includes('pato') ||
    t.includes('cordero') ||
    t.includes('vacuno') ||
    t.includes('res') ||
    t.includes('buey') ||
    t.includes('cerdo') ||
    t.includes('jabali') ||
    t.includes('conejo') ||
    t.includes('venado') ||
    t.includes('ciervo') ||
    t.includes('carne') ||
    t.includes('higado') ||
    t.includes('corazon') ||
    t.includes('huevo')
  ) {
    return {
      name: title,
      pill: 'Proteína',
      desc: `Proteína animal de alto valor biológico y excelente digestibilidad para mantener una musculatura firme y vitalidad diaria en tu ${petLabel}.`,
      img,
    };
  }

  // Carbohidratos nobles y fibra
  if (
    t.includes('camote') ||
    t.includes('batata') ||
    t.includes('boniato') ||
    t.includes('calabaza') ||
    t.includes('zapallo') ||
    t.includes('papa') ||
    t.includes('patata') ||
    t.includes('mandioca') ||
    t.includes('tapioca') ||
    t.includes('yuca') ||
    t.includes('avena') ||
    t.includes('arroz') ||
    t.includes('cebada') ||
    t.includes('quinoa')
  ) {
    return {
      name: title,
      pill: t.includes('calabaza') || t.includes('zapallo') ? 'Fibra' : 'Energía Noble',
      desc: 'Carbohidratos nobles de asimilación gradual y fibra soluble natural para una digestión suave y energía sostenida.',
      img,
    };
  }

  // Zanahoria y Verduras
  if (
    t.includes('zanahoria') ||
    t.includes('espinaca') ||
    t.includes('acelga') ||
    t.includes('kale') ||
    t.includes('brocoli') ||
    t.includes('betarraga') ||
    t.includes('remolacha') ||
    t.includes('tomate') ||
    t.includes('alfalfa') ||
    t.includes('vitamina')
  ) {
    return {
      name: title,
      pill: 'Vitamina A',
      desc: 'Aporte natural de betacarotenos, vitaminas y fitonutrientes esenciales para cuidar la visión y el sistema inmune.',
      img,
    };
  }

  // Legumbres, Prebióticos y Minerales
  if (
    t.includes('guisante') ||
    t.includes('arveja') ||
    t.includes('lenteja') ||
    t.includes('garbanzo') ||
    t.includes('haba') ||
    t.includes('fibra') ||
    t.includes('achicoria') ||
    t.includes('inulina') ||
    t.includes('prebiotic') ||
    t.includes('probiotic') ||
    t.includes('levadura') ||
    t.includes('glucosamina') ||
    t.includes('condroitina') ||
    t.includes('mineral') ||
    t.includes('calcio') ||
    t.includes('zinc')
  ) {
    return {
      name: title,
      pill: t.includes('glucosamina') || t.includes('condroitina') ? 'Articulaciones' : 'Minerales',
      desc: 'Fuente equilibrada de aminoácidos vegetales, fibra prebiótica y minerales clave para la flora intestinal y el bienestar articular.',
      img,
    };
  }

  // Frutas, Bayas, Botánicos y Taurina
  if (
    t.includes('arandano') ||
    t.includes('cranberry') ||
    t.includes('blueberry') ||
    t.includes('manzana') ||
    t.includes('pera') ||
    t.includes('platano') ||
    t.includes('banana') ||
    t.includes('pina') ||
    t.includes('anana') ||
    t.includes('melon') ||
    t.includes('alga') ||
    t.includes('kelp') ||
    t.includes('romero') ||
    t.includes('curcuma') ||
    t.includes('yucca') ||
    t.includes('taurina')
  ) {
    return {
      name: title,
      pill: t.includes('taurina')
        ? 'Taurina'
        : t.includes('pina')
        ? 'Digestión'
        : t.includes('platano')
        ? 'Potasio'
        : 'Antiox.',
      desc: 'Frutas frescas, antioxidantes naturales y extractos botánicos que protegen las células, las vías urinarias y las defensas naturales.',
      img,
    };
  }

  return {
    name: title,
    pill: 'Nutrición Real',
    desc: `Ingrediente seleccionado cuidadosamente para complementar la nutrición diaria y vitalidad de tu ${petLabel}.`,
    img,
  };
}

function getDefaultWedgesForProduct(product) {
  const isCat = (product?.petType || product?.pet_type) === 'gatos';
  const petLabel = isCat ? 'michi' : 'perro';
  const mainProt = product?.mainProtein || product?.main_protein || 'Pollo';
  const protPct = product?.proteinPercent || (product?.proteinValue ? `${product.proteinValue}%` : '');

  return [
    {
      name: `${mainProt} Fresco Seleccionado`,
      pill: protPct ? `${protPct} Proteína` : 'Proteína',
      desc: `Fuente principal de proteína animal de alta digestibilidad para cuidar la masa muscular de tu ${petLabel}.`,
      img: matchIngredientImage(mainProt, 0),
    },
    {
      name: 'Salmón y Omega 3 Austral',
      pill: 'Omega 3',
      desc: 'Rico en ácidos grasos EPA y DHA para mantener la piel sana, un pelaje brillante y articulaciones fuertes.',
      img: '/images/bowl/ing-salmon.webp',
    },
    {
      name: 'Camote y Zapallo',
      pill: 'Fibra',
      desc: 'Carbohidratos nobles y fibra soluble natural para una digestión suave y energía estable durante el día.',
      img: '/images/bowl/ing-camote.webp',
    },
    {
      name: 'Zanahoria y Vegetales',
      pill: 'Vitamina A',
      desc: 'Betacarotenos y vitaminas esenciales de origen natural para proteger la visión y el sistema inmune.',
      img: '/images/bowl/ing-zanahoria.webp',
    },
    {
      name: isCat ? 'Prebióticos y Minerales' : 'Arvejas y Minerales',
      pill: 'Minerales',
      desc: 'Equilibrio óptimo de minerales quelados y fibra prebiótica que favorecen la absorción de nutrientes.',
      img: '/images/bowl/ing-arvejas.webp',
    },
    {
      name: isCat ? 'Arándanos y Taurina' : 'Arándanos del Sur',
      pill: isCat ? 'Taurina + Antiox.' : 'Antiox.',
      desc: isCat
        ? 'Antioxidantes naturales y taurina esencial para proteger el corazón, la visión y el tracto urinario felino.'
        : 'Antioxidantes naturales patagónicos para proteger las vías urinarias y el envejecimiento celular.',
      img: '/images/bowl/ing-arandanos.webp',
    },
  ];
}

/**
 * Construye un array de 6 gajos listo para guardar en bowlConfig.wedges
 * tomando exactamente los 6 primeros ingredientes registrados en el producto.
 */
export function buildWedgesFromFirstSixIngredients(product = {}) {
  const isCat = (product?.petType || product?.pet_type) === 'gatos';
  const petLabel = isCat ? 'michi' : 'perro';
  const rawIngredients = Array.isArray(product?.ingredients)
    ? product.ingredients.filter((i) => i && String(i).trim()).slice(0, 6)
    : [];
  const defaults = getDefaultWedgesForProduct(product);

  return WEDGE_GEOMETRY.map((geo, idx) => {
    if (rawIngredients[idx]) {
      const analyzed = analyzeIngredient(rawIngredients[idx], petLabel, idx);
      return {
        name: analyzed.name,
        pill: analyzed.pill,
        desc: analyzed.desc,
        img: analyzed.img,
      };
    }
    return {
      name: defaults[idx].name,
      pill: defaults[idx].pill,
      desc: defaults[idx].desc,
      img: defaults[idx].img || geo.defaultImg,
    };
  });
}

export function resolveProductBowlData(product = {}) {
  const isCat = (product?.petType || product?.pet_type) === 'gatos';
  const petLabel = isCat ? 'michi' : 'perro';
  const rawIngredients = Array.isArray(product?.ingredients)
    ? product.ingredients.filter((i) => i && String(i).trim())
    : [];

  const defaults = getDefaultWedgesForProduct(product);

  // 1. Respetar el orden exacto de los 6 primeros ingredientes del producto (Gajo #1 = Ingrediente #1, etc.)
  const autoSlots = WEDGE_GEOMETRY.map((geo, idx) => {
    const rawIng = rawIngredients[idx];
    if (rawIng) {
      return analyzeIngredient(rawIng, petLabel, idx);
    }
    return defaults[idx];
  });

  // 2. Superponer configuración personalizada del Panel de Administración (bowlConfig) si existe
  const customBowl = product?.bowlConfig || product?.bowl_config || null;
  const customWedges = Array.isArray(customBowl?.wedges) ? customBowl.wedges : [];

  const finalWedges = WEDGE_GEOMETRY.map((geo, idx) => {
    const autoWedge = autoSlots[idx] || defaults[idx];
    const customWedge = customWedges[idx] || {};
    const resolvedCustomImg =
      customWedge.img && String(customWedge.img).trim()
        ? normalizeBowlImageUrl(customWedge.img, idx)
        : null;

    return {
      ...geo,
      name: (customWedge.name && String(customWedge.name).trim()) || autoWedge.name,
      pill: (customWedge.pill && String(customWedge.pill).trim()) || autoWedge.pill,
      desc: (customWedge.desc && String(customWedge.desc).trim()) || autoWedge.desc,
      img: resolvedCustomImg || autoWedge.img || geo.defaultImg,
    };
  });

  // 3. Resolver los 4 stickers flotantes alrededor de "ingredientes"
  const mainProt = product?.mainProtein || product?.main_protein || finalWedges[0]?.name || 'Proteína Real';
  const grainLevel = String(product?.grainLevel || product?.gama || '').toLowerCase();
  const grainBadge =
    grainLevel === 'free' ? '100% Grain Free' : grainLevel === 'low' ? 'Low Grain Noble' : 'Fórmula Completa';
  const protPercent =
    product?.proteinPercent ||
    (product?.proteinValue ? `${product.proteinValue}% Proteína` : null) ||
    product?.guaranteedAnalysis?.proteina ||
    'Omega 3 y 6';

  const autoStickers = [
    cleanIngTitle(finalWedges[0]?.name || mainProt),
    cleanIngTitle(finalWedges[2]?.name || 'Camote y Zapallo'),
    String(protPercent).includes('%') && !String(protPercent).toLowerCase().includes('prote')
      ? `${protPercent} Proteína`
      : String(protPercent),
    cleanIngTitle(finalWedges[5]?.name || grainBadge),
  ];

  const customStickers = Array.isArray(customBowl?.stickers) ? customBowl.stickers : [];
  const stickers = [0, 1, 2, 3].map((i) =>
    customStickers[i] && String(customStickers[i]).trim()
      ? String(customStickers[i]).trim()
      : autoStickers[i]
  );

  // 4. Subtítulo personalizado o automático para la receta
  const defaultSubtitle = `Nada que no puedas pronunciar. Todo lo que el cuerpo de tu ${petLabel} necesita en cada porción de ${product?.name || 'esta receta'}.`;
  const subtitle =
    customBowl?.subtitle && String(customBowl.subtitle).trim()
      ? String(customBowl.subtitle).trim()
      : defaultSubtitle;

  return {
    subtitle,
    stickers,
    wedges: finalWedges,
  };
}
