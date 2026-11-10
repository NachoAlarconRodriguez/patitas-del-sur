/**
 * Generador inteligente y normalizador de datos para el Plato Interactivo de Ingredientes (6 gajos)
 * en cada página de detalle de producto (ProductDetailView).
 *
 * Cada uno de los 6 gajos del plato cenital está alineado con su recorte poligonal exacto:
 * - Gajo 1 (330° Sup-Izq): Proteína Principal (Pollo, Pavo, Cordero, Conejo, Vacuno, etc.)
 * - Gajo 2 (270° Med-Izq): Segunda Proteína / Omega 3 y 6 (Salmón, Pescado, Hígado, Aceite de Salmón)
 * - Gajo 3 (210° Inf-Izq): Carbohidratos Nobles y Fibra (Camote, Calabaza, Papa, Arroz, Avena)
 * - Gajo 4 (30°  Sup-Der): Verduras y Vitaminas (Zanahoria, Espinaca, Betarraga, Vitaminas)
 * - Gajo 5 (90°  Med-Der): Legumbres, Prebióticos y Minerales (Guisantes, Lentejas, Glucosamina)
 * - Gajo 6 (150° Inf-Der): Superfrutas, Bayas y Antioxidantes (Arándanos, Manzana, Pera, Botánicos)
 */

export const WEDGE_GEOMETRY = [
  {
    num: 1,
    c: 330,
    p0: '-19.28% 10%',
    pm: '10% -19.28%',
    p1: '50% -30%',
    hx: '36.5%',
    hy: '26.62%',
    defaultImg: 'https://media.kolpusites.com/kibory/bol-pollo.webp',
  },
  {
    num: 2,
    c: 270,
    p0: '-19.28% 90%',
    pm: '-30% 50%',
    p1: '-19.28% 10%',
    hx: '23%',
    hy: '50%',
    defaultImg: 'https://media.kolpusites.com/kibory/bol-salmon.webp',
  },
  {
    num: 3,
    c: 210,
    p0: '50% 130%',
    pm: '10% 119.28%',
    p1: '-19.28% 90%',
    hx: '36.5%',
    hy: '73.38%',
    defaultImg: 'https://media.kolpusites.com/kibory/bol-boniato.webp',
  },
  {
    num: 4,
    c: 30,
    p0: '50% -30%',
    pm: '90% -19.28%',
    p1: '119.28% 10%',
    hx: '63.5%',
    hy: '26.62%',
    defaultImg: 'https://media.kolpusites.com/kibory/bol-zanahoria.webp',
  },
  {
    num: 5,
    c: 90,
    p0: '119.28% 10%',
    pm: '130% 50%',
    p1: '119.28% 90%',
    hx: '77%',
    hy: '50%',
    defaultImg: 'https://media.kolpusites.com/kibory/bol-guisantes.webp',
  },
  {
    num: 6,
    c: 150,
    p0: '119.28% 90%',
    pm: '90% 119.28%',
    p1: '50% 130%',
    hx: '63.5%',
    hy: '73.38%',
    defaultImg: 'https://media.kolpusites.com/kibory/bol-arandanos.webp',
  },
];

export const BOWL_IMAGE_PRESETS = [
  { id: 'pollo', label: 'Gajo 1 · Proteína / Carne', url: 'https://media.kolpusites.com/kibory/bol-pollo.webp' },
  { id: 'salmon', label: 'Gajo 2 · Salmón / Omega 3', url: 'https://media.kolpusites.com/kibory/bol-salmon.webp' },
  { id: 'boniato', label: 'Gajo 3 · Camote / Calabaza', url: 'https://media.kolpusites.com/kibory/bol-boniato.webp' },
  { id: 'zanahoria', label: 'Gajo 4 · Zanahoria / Verduras', url: 'https://media.kolpusites.com/kibory/bol-zanahoria.webp' },
  { id: 'guisantes', label: 'Gajo 5 · Guisantes / Minerales', url: 'https://media.kolpusites.com/kibory/bol-guisantes.webp' },
  { id: 'arandanos', label: 'Gajo 6 · Arándanos / Frutas', url: 'https://media.kolpusites.com/kibory/bol-arandanos.webp' },
];

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
 * Clasifica un ingrediente en uno de los 6 gajos (0..5) según su función nutricional,
 * y retorna su píldora y descripción sugerida.
 */
function analyzeIngredient(rawText, petLabel = 'perro o gato') {
  const t = String(rawText || '').toLowerCase();
  const title = cleanIngTitle(rawText);

  // Gajo 2 (índice 1): Salmón / Pescado / Aceites Omega 3 y 6
  if (
    t.includes('aceite') ||
    t.includes('omega') ||
    t.includes('salmón') ||
    t.includes('salmon') ||
    t.includes('arenque') ||
    t.includes('trucha') ||
    t.includes('caballa') ||
    t.includes('merluza') ||
    t.includes('pescado') ||
    t.includes(' sardina') ||
    t.includes('linaza')
  ) {
    return {
      preferredSlot: 1,
      name: title,
      pill: t.includes('aceite') || t.includes('omega') || t.includes('linaza') ? 'Omega 3 y 6' : 'Omega 3',
      desc: `Fuente rica en ácidos grasos esenciales EPA y DHA para nutrir la piel, dar brillo al pelaje y cuidar las articulaciones de tu ${petLabel}.`,
    };
  }

  // Gajo 1 (índice 0): Proteínas animales principales (Pollo, Pavo, Cordero, Vacuno, Conejo, Pato, Huevo)
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
    t.includes('jabalí') ||
    t.includes('jabali') ||
    t.includes('conejo') ||
    t.includes('venado') ||
    t.includes('carne') ||
    t.includes('hígado') ||
    t.includes('higado') ||
    t.includes('corazón') ||
    t.includes('huevo')
  ) {
    return {
      preferredSlot: 0,
      name: title,
      pill: 'Proteína',
      desc: `Proteína animal de alto valor biológico y excelente digestibilidad para mantener una musculatura firme y vitalidad diaria en tu ${petLabel}.`,
    };
  }

  // Gajo 3 (índice 2): Carbohidratos nobles y fibra (Camote, Calabaza, Zapallo, Papa, Avena, Arroz, Cebada)
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
    t.includes('cebada')
  ) {
    return {
      preferredSlot: 2,
      name: title,
      pill: t.includes('calabaza') || t.includes('zapallo') ? 'Fibra' : 'Energía Noble',
      desc: 'Carbohidratos nobles de asimilación gradual y fibra soluble natural para una digestión suave y energía sostenida.',
    };
  }

  // Gajo 4 (índice 3): Zanahoria, Verduras de hoja, Betacarotenos y Vitaminas
  if (
    t.includes('zanahoria') ||
    t.includes('espinaca') ||
    t.includes('acelga') ||
    t.includes('kale') ||
    t.includes('brócoli') ||
    t.includes('brocoli') ||
    t.includes('betarraga') ||
    t.includes('remolacha') ||
    t.includes('tomate') ||
    t.includes('alfalfa') ||
    t.includes('vitamina')
  ) {
    return {
      preferredSlot: 3,
      name: title,
      pill: 'Vitamina A',
      desc: 'Aporte natural de betacarotenos, vitaminas y fitonutrientes esenciales para cuidar la visión y el sistema inmune.',
    };
  }

  // Gajo 5 (índice 4): Legumbres, Minerales, Prebióticos y Condroprotectores
  if (
    t.includes('guisante') ||
    t.includes('arveja') ||
    t.includes('lenteja') ||
    t.includes('garbanzo') ||
    t.includes('haba') ||
    t.includes('fibra') ||
    t.includes('achicoria') ||
    t.includes('inulina') ||
    t.includes('prebiótic') ||
    t.includes('probiótic') ||
    t.includes('levadura') ||
    t.includes('glucosamina') ||
    t.includes('condroitina') ||
    t.includes('mineral') ||
    t.includes('calcio') ||
    t.includes('zinc')
  ) {
    return {
      preferredSlot: 4,
      name: title,
      pill: t.includes('glucosamina') || t.includes('condroitina') ? 'Articulaciones' : 'Minerales',
      desc: 'Fuente equilibrada de aminoácidos vegetales, fibra prebiótica y minerales clave para la flora intestinal y el bienestar articular.',
    };
  }

  // Gajo 6 (índice 5): Frutas, Bayas, Botánicos y Taurina
  if (
    t.includes('arándano') ||
    t.includes('arandano') ||
    t.includes('cranberry') ||
    t.includes('blueberry') ||
    t.includes('manzana') ||
    t.includes('pera') ||
    t.includes('plátano') ||
    t.includes('platano') ||
    t.includes('melón') ||
    t.includes('melon') ||
    t.includes('piña') ||
    t.includes('pina') ||
    t.includes('alga') ||
    t.includes('kelp') ||
    t.includes('romero') ||
    t.includes('cúrcuma') ||
    t.includes('curcuma') ||
    t.includes('yucca') ||
    t.includes('taurina')
  ) {
    return {
      preferredSlot: 5,
      name: title,
      pill: t.includes('taurina') ? 'Taurina' : 'Antiox.',
      desc: 'Antioxidantes naturales y extractos botánicos que protegen las células, las vías urinarias y las defensas naturales.',
    };
  }

  return {
    preferredSlot: -1,
    name: title,
    pill: 'Nutrición Real',
    desc: `Ingrediente seleccionado cuidadosamente para complementar la nutrición diaria y vitalidad de tu ${petLabel}.`,
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
    },
    {
      name: 'Salmón y Omega 3 Austral',
      pill: 'Omega 3',
      desc: 'Rico en ácidos grasos EPA y DHA para mantener la piel sana, un pelaje brillante y articulaciones fuertes.',
    },
    {
      name: 'Camote y Calabaza',
      pill: 'Fibra',
      desc: 'Carbohidratos nobles y fibra soluble natural para una digestión suave y energía estable durante el día.',
    },
    {
      name: 'Zanahoria y Vegetales',
      pill: 'Vitamina A',
      desc: 'Betacarotenos y vitaminas esenciales de origen natural para proteger la visión y el sistema inmune.',
    },
    {
      name: isCat ? 'Prebióticos y Minerales' : 'Guisantes y Minerales',
      pill: 'Minerales',
      desc: 'Equilibrio óptimo de minerales quelados y fibra prebiótica que favorecen la absorción de nutrientes.',
    },
    {
      name: isCat ? 'Arándanos y Taurina' : 'Arándanos del Sur',
      pill: isCat ? 'Taurina + Antiox.' : 'Antiox.',
      desc: isCat
        ? 'Antioxidantes naturales y taurina esencial para proteger el corazón, la visión y el tracto urinario felino.'
        : 'Antioxidantes naturales patagónicos para proteger las vías urinarias y el envejecimiento celular.',
    },
  ];
}

export function resolveProductBowlData(product = {}) {
  const isCat = (product?.petType || product?.pet_type) === 'gatos';
  const petLabel = isCat ? 'michi' : 'perro';
  const rawIngredients = Array.isArray(product?.ingredients)
    ? product.ingredients.filter((i) => i && String(i).trim())
    : [];

  const defaults = getDefaultWedgesForProduct(product);
  const slots = [null, null, null, null, null, null];
  const unassigned = [];

  // 1. Asignar ingredientes reales del producto a su gajo ideal según su función nutricional
  rawIngredients.forEach((raw) => {
    const analyzed = analyzeIngredient(raw, petLabel);
    if (analyzed.preferredSlot >= 0 && !slots[analyzed.preferredSlot]) {
      slots[analyzed.preferredSlot] = {
        name: analyzed.name,
        pill: analyzed.pill,
        desc: analyzed.desc,
      };
    } else {
      unassigned.push(analyzed);
    }
  });

  // 2. Rellenar los gajos restantes con los demás ingredientes reales del producto o con los pilares por defecto
  let unassignedIdx = 0;
  for (let i = 0; i < 6; i++) {
    if (!slots[i]) {
      if (unassignedIdx < unassigned.length) {
        const nextIng = unassigned[unassignedIdx++];
        slots[i] = {
          name: nextIng.name,
          pill: nextIng.pill === 'Nutrición Real' ? defaults[i].pill : nextIng.pill,
          desc: nextIng.desc,
        };
      } else {
        slots[i] = defaults[i];
      }
    }
  }

  // 3. Superponer configuración personalizada del Panel de Administración (bowlConfig) si existe
  const customBowl = product?.bowlConfig || product?.bowl_config || null;
  const customWedges = Array.isArray(customBowl?.wedges) ? customBowl.wedges : [];

  const finalWedges = WEDGE_GEOMETRY.map((geo, idx) => {
    const autoWedge = slots[idx] || defaults[idx];
    const customWedge = customWedges[idx] || {};

    return {
      ...geo,
      name: (customWedge.name && String(customWedge.name).trim()) || autoWedge.name,
      pill: (customWedge.pill && String(customWedge.pill).trim()) || autoWedge.pill,
      desc: (customWedge.desc && String(customWedge.desc).trim()) || autoWedge.desc,
      img: (customWedge.img && String(customWedge.img).trim()) || geo.defaultImg,
    };
  });

  // 4. Resolver los 4 stickers flotantes alrededor de "ingredientes"
  const mainProt = product?.mainProtein || product?.main_protein || finalWedges[0]?.name || 'Proteína Real';
  const grainLevel = String(product?.grainLevel || product?.gama || '').toLowerCase();
  const grainBadge = grainLevel === 'free' ? '100% Grain Free' : grainLevel === 'low' ? 'Low Grain Noble' : 'Fórmula Completa';
  const protPercent =
    product?.proteinPercent ||
    (product?.proteinValue ? `${product.proteinValue}% Proteína` : null) ||
    product?.guaranteedAnalysis?.proteina ||
    'Omega 3 y 6';

  const autoStickers = [
    cleanIngTitle(finalWedges[0]?.name || mainProt),
    cleanIngTitle(finalWedges[2]?.name || 'Camote y Calabaza'),
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

  // 5. Subtítulo personalizado o automático para la receta
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
