/**
 * Utilidades para agrupación inteligente y gestión de variantes y formatos
 * entre el catálogo público y el inventario de bodega.
 */

// Regex para detectar formatos de peso/tamaño (ej: "10 kg", "3.5 kg", "20 kg", "400 g", "12 kilos")
const WEIGHT_REGEX = /\b(\d+(?:[.,]\d+)?\s*(?:kg|kilos|kilo|g|gr|gramos|un|unidades|l|litros|ml))\b/i;

/**
 * Detecta y extrae información de familia/línea de productos con múltiples variedades o sabores
 * (ej: Latas de Alpha Spirit 400 gr en sus distintos sabores).
 * @param {Object} item 
 * @returns {Object}
 */
export function getProductFamilyInfo(item) {
  if (!item || !item.name) {
    return { isFamily: false, familyKey: '', masterName: '', formatLabel: '', tagline: '' };
  }

  const name = String(item.name).trim();
  const brand = String(item.brand || '').trim().toLowerCase();
  const nameLower = name.toLowerCase();

  // Caso: Alpha Spirit Latas (Conejo & Plátano, Cordero & Pera, Pato & Manzana, Salmón & Piña, Vacuno & Melón)
  if (brand.includes('alpha spirit') && (nameLower.includes('lata') || nameLower.includes('humedo') || nameLower.includes('húmedo'))) {
    let flavor = name
      .replace(/^alpha\s+spirit\s*(?:lata)?\s*[-•/:]?\s*/i, '')
      .replace(/\s*lata\b/gi, '')
      .replace(/\b\d+\s*(?:gr|g|gramos|kg)\b/gi, '')
      .replace(/[\s\-•/]+$/, '')
      .trim();

    // Normalizar tildes y ortografía en los sabores
    const fLower = flavor.toLowerCase();
    if (fLower === 'conejo & platano' || fLower === 'conejo con platano' || fLower === 'conejo con plátano') {
      flavor = 'Conejo & Plátano';
    } else if (fLower === 'salmon & pina' || fLower === 'salmón & pina' || fLower === 'salmon con pina' || fLower === 'salmón con piña' || fLower === 'salmón & piña') {
      flavor = 'Salmón & Piña';
    } else if (fLower === 'cordero & pera' || fLower === 'cordero con pera') {
      flavor = 'Cordero & Pera';
    } else if (fLower.includes('pato') && (fLower.includes('manzana') || fLower.includes('verde'))) {
      flavor = 'Pato & Manzana Verde';
    } else if (fLower.includes('vacuno') && (fLower.includes('mel') || fLower.includes('melon'))) {
      flavor = 'Vacuno & Melón';
    }

    return {
      isFamily: true,
      familyKey: 'alpha_spirit_lata_400g',
      masterName: 'Alpha Spirit Lata 400 gr',
      tagline: 'Alimento húmedo completo y natural en lata para perros adultos.',
      formatLabel: flavor || '400 gr',
    };
  }

  // Regla general para líneas de latas, sobres, patés o pouches del mismo fabricante
  const isWetFood =
    nameLower.includes('lata') ||
    nameLower.includes('pouch') ||
    nameLower.includes('sobre') ||
    nameLower.includes('paté') ||
    nameLower.includes('pate');
  if (isWetFood && brand) {
    const match = name.match(/^(.*?(?:lata|pouch|sobre|paté|pate))\s+(.+)$/i);
    if (match) {
      const linePrefix = match[1].trim();
      const variantName = match[2].replace(WEIGHT_REGEX, '').trim();
      if (variantName) {
        const rawWeight = extractProductFormat(item);
        const weightLabel =
          rawWeight && rawWeight !== 'Estándar'
            ? rawWeight
            : nameLower.includes('sobre') || nameLower.includes('pouch')
            ? '85 gr'
            : '400 gr';
        const normalizedWeightKey = weightLabel.toLowerCase().replace(/\s+/g, '_');
        const hasWeightInPrefix = WEIGHT_REGEX.test(linePrefix);
        return {
          isFamily: true,
          familyKey: `${brand}_${linePrefix.toLowerCase().replace(/\s+/g, '_')}_${normalizedWeightKey}`,
          masterName: hasWeightInPrefix ? linePrefix : `${linePrefix} ${weightLabel}`,
          tagline: item.tagline || 'Alimento húmedo completo y balanceado.',
          formatLabel: variantName,
        };
      }
    }
  }

  return { isFamily: false, familyKey: '', masterName: '', formatLabel: '', tagline: '' };
}

/**
 * Extrae el formato o peso de un producto
 * @param {Object} item 
 * @returns {string}
 */
export function extractProductFormat(item) {
  if (!item) return 'Estándar';
  
  if (item.format && typeof item.format === 'string' && item.format.trim() !== '') {
    return item.format.trim();
  }

  if (Array.isArray(item.weights) && item.weights.length > 0 && item.weights[0]) {
    return String(item.weights[0]).trim();
  }

  if (item.name) {
    const match = item.name.match(WEIGHT_REGEX);
    if (match) {
      return match[1].toLowerCase().replace(/\s+/, ' ');
    }
  }

  return 'Estándar';
}

/**
 * Extrae el nombre base limpio de un producto eliminando sufijos de peso o formatos
 * Ej: "Fit Cachorro 10 kg" -> "Fit Cachorro"
 * @param {string} rawName 
 * @param {string} [brand] 
 * @returns {string}
 */
export function cleanBaseProductName(rawName, _brand = '') {
  if (!rawName) return 'Producto';
  let name = String(rawName).trim();

  // Eliminar patrones de peso/formato al final o entre guiones/puntos
  name = name.replace(WEIGHT_REGEX, '');
  
  // Limpiar guiones o puntos huérfanos al final
  name = name.replace(/[\s\-•/]+$/, '').trim();

  // Corregir cortes comunes de caracteres incompletos (ej. "Fit Cachorr" -> "Fit Cachorro")
  if (name.toLowerCase() === 'fit cachorr') {
    name = 'Fit Cachorro';
  }

  // Normalizar singular/plural en tamaños de raza para agrupar formatos del mismo producto
  name = name
    .replace(/\brazas\s+pequeñas\b/gi, 'Raza Pequeña')
    .replace(/\brazas\s+medianas\b/gi, 'Raza Mediana')
    .replace(/\brazas\s+grandes\b/gi, 'Raza Grande');

  return name || String(rawName).trim();
}

/**
 * Resuelve de forma determinista y sin falsos positivos a qué registro de inventario
 * (variante física con su propio ID, formato, precio y costo) corresponde un ítem de pedido o carrito.
 *
 * Orden de prioridad estricto:
 *  1. Coincidencia exacta por `productId` / `product_id` (ej: "PROD-09")
 *  2. Coincidencia exacta por `id` de producto (cuando no es el UUID de la fila order_items)
 *  3. Coincidencia exacta por código `SKU`
 *  4. Coincidencia exacta de Nombre Base normalizado + Formato/Peso normalizado (ej: "Nomade Adulto Raza Pequeña" + "10 kg")
 *  5. Coincidencia exacta de Nombre Completo + Formato/Peso
 *  6. Coincidencia exacta de Nombre Base normalizado (solo si no existe ambigüedad con otro nombre distinto)
 *
 * @param {Array} inventoryList
 * @param {Object} item
 * @returns {Object|null}
 */
export function resolveInventoryVariant(inventoryList, item) {
  if (!Array.isArray(inventoryList) || inventoryList.length === 0 || !item) {
    return null;
  }

  const normalizeStr = (s) =>
    String(s || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, ' ')
      .trim();

  const normalizeFormat = (s) =>
    normalizeStr(s)
      .replace(/,/g, '.')
      .replace(/\b(kilos|kilo)\b/g, 'kg')
      .replace(/\b(gramos|gr)\b/g, 'g');

  const explicitProdId = String(item.productId || item.product_id || '').trim();
  const rawItemId = String(item.id || '').trim();
  const itemSku = String(item.sku || item.code || '')
    .replace(/^SKU-/i, '')
    .trim()
    .toLowerCase();

  // 1. Prioridad absoluta: productId explícito
  if (explicitProdId) {
    const byProdId = inventoryList.find((p) => p && String(p.id).trim() === explicitProdId);
    if (byProdId) return byProdId;
  }

  // 2. Coincidencia por item.id cuando corresponde a un ID de producto (ej. PROD-XX)
  if (rawItemId) {
    const byId = inventoryList.find((p) => p && String(p.id).trim() === rawItemId);
    if (byId) return byId;
  }

  // 3. Coincidencia exacta por SKU
  if (itemSku && itemSku !== 'prod') {
    const bySku = inventoryList.find(
      (p) =>
        p &&
        ((p.sku && String(p.sku).trim().toLowerCase() === itemSku) ||
          (p.id && String(p.id).trim().toLowerCase() === itemSku))
    );
    if (bySku) return bySku;
  }

  const rawItemName = String(item.name || item.product_name || '').trim();
  const cleanItemBase = normalizeStr(cleanBaseProductName(rawItemName));
  const rawItemNameNorm = normalizeStr(rawItemName);

  const itemFmtRaw = item.format || item.weight || extractProductFormat({ name: rawItemName });
  const itemFmtNorm = normalizeFormat(itemFmtRaw);

  // 4. Coincidencia exacta: Nombre Base normalizado + Formato/Peso exacto
  if (cleanItemBase && itemFmtNorm && itemFmtNorm !== 'estandar' && itemFmtNorm !== '1 un.') {
    const byBaseAndFormat = inventoryList.find((p) => {
      if (!p) return false;
      const pBase = normalizeStr(cleanBaseProductName(p.name, p.brand));
      const pFull = normalizeStr(p.name);
      const pFmt = normalizeFormat(p.format || extractProductFormat(p));
      return (pBase === cleanItemBase || pFull === rawItemNameNorm) && pFmt === itemFmtNorm;
    });
    if (byBaseAndFormat) return byBaseAndFormat;
  }

  // 5. Coincidencia exacta por nombre completo o nombre base (nunca usando .includes() parcial entre productos distintos)
  if (cleanItemBase) {
    const byExactName = inventoryList.find((p) => {
      if (!p) return false;
      const pBase = normalizeStr(cleanBaseProductName(p.name, p.brand));
      const pFull = normalizeStr(p.name);
      return pFull === rawItemNameNorm || pBase === cleanItemBase;
    });
    if (byExactName) return byExactName;
  }

  return null;
}

/**
 * Determina si dos productos son variantes de la misma publicación base
 * @param {Object} a 
 * @param {Object} b 
 * @returns {boolean}
 */
export function areProductsSameGroup(a, b) {
  if (!a || !b) return false;
  if (a.id === b.id) return true;

  // 1. Relación explícita por parentId
  if (a.parentId && (a.parentId === b.id || a.parentId === b.parentId)) return true;
  if (b.parentId && (b.parentId === a.id || b.parentId === a.parentId)) return true;

  // 2. Coincidencia por Marca (debe coincidir si ambos la definen)
  const brandA = (a.brand || '').toLowerCase().trim();
  const brandB = (b.brand || '').toLowerCase().trim();
  if (brandA && brandB && brandA !== brandB) {
    return false;
  }

  // 3. Tipo de mascota debe coincidir
  const petA = (a.petType || a.pet_type || '').toLowerCase().trim();
  const petB = (b.petType || b.pet_type || '').toLowerCase().trim();
  if (petA && petB && petA !== petB) {
    return false;
  }

  // 4. Agrupación por Familia / Línea de producto (ej: Latas de Alpha Spirit, Fit Sobre 85 gr)
  const familyA = getProductFamilyInfo(a);
  const familyB = getProductFamilyInfo(b);
  const keyA = a.familyKey || (familyA.isFamily ? familyA.familyKey : '');
  const keyB = b.familyKey || (familyB.isFamily ? familyB.familyKey : '');
  if (keyA && keyB && keyA === keyB) {
    return true;
  }

  // 5. Limpieza y normalización de nombres base (por peso)
  const cleanA = cleanBaseProductName(a.name, a.brand).toLowerCase().trim();
  const cleanB = cleanBaseProductName(b.name, b.brand).toLowerCase().trim();

  if (cleanA === cleanB) return true;

  // Tolerancia para prefijos idénticos con longitud casi igual (ej: "fit cachorr" y "fit cachorro")
  if (cleanA.length > 5 && cleanB.length > 5) {
    if (cleanA.startsWith(cleanB) || cleanB.startsWith(cleanA)) {
      if (Math.abs(cleanA.length - cleanB.length) <= 3) return true;
    }
  }

  return false;
}

/**
 * Convierte un formato string como "3 kg" o "10 kg" a un valor numérico en kg para ordenar
 * @param {string} formatStr 
 * @returns {number}
 */
function parseFormatToKgNumber(formatStr) {
  if (!formatStr) return 0;
  const match = String(formatStr).match(/(\d+(?:[.,]\d+)?)/);
  if (!match) return 0;
  let val = parseFloat(match[1].replace(',', '.'));
  if (String(formatStr).toLowerCase().includes('g') && !String(formatStr).toLowerCase().includes('kg')) {
    val = val / 1000;
  }
  return val || 0;
}

/**
 * Agrupa una lista plana de productos de inventario/Supabase en publicaciones
 * maestras consolidadas para la tienda pública, donde cada publicación contiene
 * sus variantes de formatos (pesos o sabores) con precios, stocks y SKUs independientes.
 * 
 * @param {Array} rawProducts 
 * @returns {Array} Lista de productos agrupados
 */
export function groupProductsForStore(rawProducts) {
  if (!Array.isArray(rawProducts) || rawProducts.length === 0) {
    return [];
  }

  const groups = [];

  rawProducts.forEach((prod) => {
    // Buscar si ya existe un grupo al que pertenezca este producto
    const existingGroup = groups.find((g) => areProductsSameGroup(g.master, prod));

    if (existingGroup) {
      existingGroup.items.push(prod);
      const fInfo = getProductFamilyInfo(prod);
      if (fInfo.isFamily && fInfo.masterName) {
        existingGroup.master = {
          ...existingGroup.master,
          name: fInfo.masterName,
          familyKey: fInfo.familyKey,
          tagline: fInfo.tagline || existingGroup.master.tagline,
          hasFlavorVariants: true,
        };
      }
    } else {
      const fInfo = getProductFamilyInfo(prod);
      groups.push({
        master: {
          ...prod,
          name: fInfo.isFamily ? fInfo.masterName : cleanBaseProductName(prod.name, prod.brand),
          familyKey: fInfo.isFamily ? fInfo.familyKey : '',
          tagline: fInfo.isFamily ? (fInfo.tagline || prod.tagline) : prod.tagline,
          hasFlavorVariants: Boolean(fInfo.isFamily),
        },
        items: [prod],
      });
    }
  });

  // Consolidar cada grupo en un producto para la tienda pública
  return groups.map((g) => {
    const { master, items } = g;
    const isFamily = Boolean(master.hasFlavorVariants);

    // Normalizar variantes
    const variants = items.map((item) => {
      let format = extractProductFormat(item);
      if (isFamily) {
        const fInfo = getProductFamilyInfo(item);
        if (fInfo.formatLabel) {
          format = fInfo.formatLabel;
        }
      }

      const salePrice = Number(item.salePrice || item.price) || 0;
      const originalPrice = item.originalPrice ? Number(item.originalPrice) : null;
      const unitCostNeto = Number(item.unitCostNeto || item.unit_cost_neto) || 0;
      const shippingUnitCost = Number(item.shippingUnitCost || item.shipping_unit_cost) || 0;
      const stock = typeof item.stock === 'number' ? item.stock : 10;
      const isPaused = Boolean(item.isPaused || item.is_paused);
      const isActive = item.isActive !== false && item.is_active !== false;

      return {
        id: item.id,
        sku: item.sku || '',
        name: item.name,
        format: format,
        weight: format,
        price: salePrice,
        originalPrice: originalPrice,
        unitCostNeto: unitCostNeto,
        shippingUnitCost: shippingUnitCost,
        stock: stock,
        minStock: item.minStock || 5,
        isPaused: isPaused,
        isActive: isActive,
        image: item.image || master.image,
        images: Array.isArray(item.images) ? item.images : [],
        tagline: item.tagline || '',
        badge: item.badge || '',
        targetStageLabel: item.targetStageLabel || item.target_stage_label || null,
        ingredients: Array.isArray(item.ingredients) ? item.ingredients : [],
        guaranteedAnalysis:
          item.guaranteedAnalysis && typeof item.guaranteedAnalysis === 'object'
            ? item.guaranteedAnalysis
            : {},
        benefits: Array.isArray(item.benefits) ? item.benefits : [],
        bowlConfig: item.bowlConfig || null,
        feedingGuide: item.feedingGuide || null,
        mainProtein: item.mainProtein || item.main_protein || null,
        proteinValue: item.proteinValue ?? item.protein_value ?? null,
        proteinPercent: item.proteinPercent ?? item.protein_percent ?? null,
        proteinSubtitle: item.proteinSubtitle || item.protein_subtitle || null,
        animalPercent: item.animalPercent ?? item.animal_percent ?? null,
        animalPercentDetail: item.animalPercentDetail || item.animal_percent_detail || null,
        lifeStage: item.lifeStage || item.life_stage || null,
        grainLevel: item.grainLevel || item.gama || null,
      };
    });

    // Ordenar variantes: por peso numérico si es alimento seco, o alfabéticamente si son sabores
    if (!isFamily) {
      variants.sort((a, b) => parseFormatToKgNumber(a.format) - parseFormatToKgNumber(b.format));
    } else {
      variants.sort((a, b) => a.format.localeCompare(b.format));
    }

    // Formatos únicos disponibles
    const weights = Array.from(new Set(variants.map((v) => v.format)));

    const validVariants = variants.filter((v) => !v.isPaused && v.isActive);
    const prices = validVariants.map((v) => v.price).filter((p) => p > 0);
    const minPrice = prices.length > 0 ? Math.min(...prices) : (Number(master.price) || 0);
    const maxPrice = prices.length > 0 ? Math.max(...prices) : minPrice;

    const totalStock = variants.reduce((sum, v) => sum + (v.stock || 0), 0);
    const isPausedOverall = variants.every((v) => v.isPaused);
    const isOutOfStock = totalStock <= 0;

    return {
      ...master,
      id: master.id,
      name: master.name,
      bowlConfig: master.bowlConfig || items.find((i) => i.bowlConfig)?.bowlConfig || null,
      feedingGuide: master.feedingGuide || items.find((i) => i.feedingGuide)?.feedingGuide || null,
      weights: weights.length > 0 ? weights : ['400 gr'],
      variants: variants,
      hasMultipleVariants: variants.length > 1,
      hasFlavorVariants: isFamily,
      price: minPrice,
      minPrice: minPrice,
      maxPrice: maxPrice,
      stock: totalStock,
      totalStock: totalStock,
      isOutOfStock: isOutOfStock,
      isPaused: isPausedOverall,
    };
  });
}

/**
 * Determina de forma centralizada si un producto o formato específico está sin stock o pausado
 * @param {Object} product
 * @param {string} [selectedWeight]
 * @returns {boolean}
 */
export function isProductOutOfStock(product, selectedWeight = null) {
  if (!product) return true;
  if (product.isPaused || product.is_paused || product.isActive === false || product.is_active === false) {
    return true;
  }
  if (product.isOutOfStock) return true;

  // Si tiene variantes de formatos o sabores
  if (Array.isArray(product.variants) && product.variants.length > 0) {
    if (selectedWeight) {
      const v = product.variants.find(
        (item) => item.format === selectedWeight || item.weight === selectedWeight
      );
      if (v) {
        return (typeof v.stock === 'number' ? v.stock : 10) <= 0 || Boolean(v.isPaused || v.is_paused);
      }
    }
    return product.variants.every((v) => (typeof v.stock === 'number' ? v.stock : 10) <= 0 || Boolean(v.isPaused || v.is_paused));
  }

  // Stock numérico directo
  if (typeof product.stock === 'number') {
    return product.stock <= 0;
  }

  return false;
}

/**
 * Determina si una variante específica tiene unidades disponibles y no está pausada
 * @param {Object} variant
 * @returns {boolean}
 */
export function isVariantAvailable(variant) {
  if (!variant) return false;
  if (variant.isPaused || variant.is_paused) return false;
  const stock = typeof variant.stock === 'number' ? variant.stock : 10;
  return stock > 0;
}

/**
 * Retorna el índice de la primera variante con stock disponible (o 0 si todas están agotadas)
 * @param {Array} variants
 * @returns {number}
 */
export function getDefaultAvailableVariantIndex(variants) {
  if (!Array.isArray(variants) || variants.length === 0) return 0;
  const firstInStock = variants.findIndex((v) => isVariantAvailable(v));
  return firstInStock >= 0 ? firstInStock : 0;
}


/**
 * Retorna la configuración de color y estilo visual estilo Apple Swatch para una variedad o sabor
 * @param {string} flavorName 
 * @returns {Object} { name, primaryColor, gradient, ringColor }
 */
export function getFlavorSwatchStyle(flavorName = '') {
  const f = String(flavorName || '').toLowerCase().trim();

  // Sabores específicos comunes y combinaciones de ingredientes
  if (f.includes('conejo') && (f.includes('pl') || f.includes('banana'))) {
    // Conejo & Plátano: Cálido miel & durazno tostado
    return {
      name: 'Conejo & Plátano',
      primaryColor: '#D97736',
      gradient: 'linear-gradient(135deg, #F6BD60 0%, #E07A5F 100%)',
      ringColor: '#D97736',
    };
  }
  if (f.includes('cordero') && (f.includes('pera') || f.includes('lamb'))) {
    // Cordero & Pera: Rubí patagónico profundo & pera
    return {
      name: 'Cordero & Pera',
      primaryColor: '#9C4146',
      gradient: 'linear-gradient(135deg, #A84448 0%, #682B32 100%)',
      ringColor: '#9C4146',
    };
  }
  if (f.includes('pato') && (f.includes('manzana') || f.includes('verde') || f.includes('duck'))) {
    // Pato & Manzana Verde: Verde manzana fresca & salvia
    return {
      name: 'Pato & Manzana Verde',
      primaryColor: '#588157',
      gradient: 'linear-gradient(135deg, #84A98C 0%, #3A5A40 100%)',
      ringColor: '#588157',
    };
  }
  if (f.includes('salm') && (f.includes('piña') || f.includes('pina') || f.includes('ananas'))) {
    // Salmón & Piña: Coral salmón austral & piña dorada
    return {
      name: 'Salmón & Piña',
      primaryColor: '#F26A5A',
      gradient: 'linear-gradient(135deg, #FF8370 0%, #E0533C 100%)',
      ringColor: '#F26A5A',
    };
  }
  if ((f.includes('vacuno') || f.includes('buey') || f.includes('res') || f.includes('beef')) && (f.includes('mel') || f.includes('cantaloupe'))) {
    // Vacuno & Melón / Vacuno con Melón: Rubí vacuno intenso
    return {
      name: f.includes('con') ? 'Vacuno con Melón' : 'Vacuno & Melón',
      primaryColor: '#DC2626',
      gradient: 'linear-gradient(135deg, #EF4444 0%, #991B1B 100%)',
      ringColor: '#DC2626',
    };
  }
  if (f.includes('salm') || f.includes('salmon')) {
    return {
      name: 'Salmón',
      primaryColor: '#F26A5A',
      gradient: 'linear-gradient(135deg, #FF8A7A 0%, #E24E3F 100%)',
      ringColor: '#F26A5A',
    };
  }
  if (f.includes('cordero') || f.includes('lamb')) {
    return {
      name: 'Cordero',
      primaryColor: '#8C3A40',
      gradient: 'linear-gradient(135deg, #9E474D 0%, #6E262B 100%)',
      ringColor: '#8C3A40',
    };
  }
  if (f.includes('pato') || f.includes('duck')) {
    return {
      name: 'Pato',
      primaryColor: '#4A6B48',
      gradient: 'linear-gradient(135deg, #6B8F69 0%, #344E33 100%)',
      ringColor: '#4A6B48',
    };
  }
  if (f.includes('conejo') || f.includes('rabbit')) {
    return {
      name: 'Conejo',
      primaryColor: '#D97736',
      gradient: 'linear-gradient(135deg, #E69138 0%, #C25920 100%)',
      ringColor: '#D97736',
    };
  }
  if (f.includes('pollo') || f.includes('chicken')) {
    return {
      name: 'Pollo',
      primaryColor: '#D97706',
      gradient: 'linear-gradient(135deg, #FBBF24 0%, #D97706 100%)',
      ringColor: '#D97706',
    };
  }
  if (f.includes('pavo') || f.includes('turkey')) {
    return {
      name: 'Pavo',
      primaryColor: '#B45309',
      gradient: 'linear-gradient(135deg, #D97706 0%, #92400E 100%)',
      ringColor: '#B45309',
    };
  }
  if (f.includes('res') || f.includes('carne') || f.includes('beef') || f.includes('ternera') || f.includes('vacuno') || f.includes('buey')) {
    return {
      name: 'Carne de Vacuno',
      primaryColor: '#DC2626',
      gradient: 'linear-gradient(135deg, #EF4444 0%, #991B1B 100%)',
      ringColor: '#DC2626',
    };
  }
  if (f.includes('pescado') || f.includes('trucha') || f.includes('atun') || f.includes('atún') || f.includes('fish')) {
    return {
      name: 'Pescado Austral',
      primaryColor: '#0E8388',
      gradient: 'linear-gradient(135deg, #2E8B99 0%, #0A4D52 100%)',
      ringColor: '#0E8388',
    };
  }
  if (f.includes('cerdo') || f.includes('pork') || f.includes('jabali') || f.includes('jabalí')) {
    return {
      name: 'Cerdo / Jabalí',
      primaryColor: '#DB2777',
      gradient: 'linear-gradient(135deg, #F472B6 0%, #BE185D 100%)',
      ringColor: '#DB2777',
    };
  }
  if (f.includes('ciervo') || f.includes('venado')) {
    return {
      name: 'Ciervo Silvestre',
      primaryColor: '#78350F',
      gradient: 'linear-gradient(135deg, #92400E 0%, #451A03 100%)',
      ringColor: '#78350F',
    };
  }

  // Paleta fallback balanceada y estética
  const fallbacks = [
    { primaryColor: '#0E8388', gradient: 'linear-gradient(135deg, #20B2AA 0%, #0E8388 100%)' },
    { primaryColor: '#C86D39', gradient: 'linear-gradient(135deg, #E07A5F 0%, #C86D39 100%)' },
    { primaryColor: '#475569', gradient: 'linear-gradient(135deg, #94A3B8 0%, #475569 100%)' },
    { primaryColor: '#059669', gradient: 'linear-gradient(135deg, #34D399 0%, #059669 100%)' },
  ];
  const hash = Math.abs(f.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)) % fallbacks.length;
  return {
    name: flavorName,
    ...fallbacks[hash],
    ringColor: fallbacks[hash].primaryColor,
  };
}

/**
 * Resuelve la imagen real y limpia de un producto, evitando fotos de stock con fondos
 * de patrones repetitivos (ej. Unsplash con galletas/huesitos) y sustituyéndolas por
 * packshots nítidos con fondo transparente cuando se detecta una coincidencia por nombre o marca.
 */
export function resolveProductImage(product) {
  if (!product) return '/images/hero_dog.png';

  const name = (product.name || product.foodName || '').toLowerCase();
  const brand = (product.brand || '').toLowerCase();
  const petType = (product.petType || product.pet_type || '').toLowerCase();
  const isCat = petType.includes('gato');
  const img = product.image || (Array.isArray(product.images) && product.images[0]) || '';

  // Si la imagen proviene del placeholder de Unsplash con fondo rosado y huesos, sustituir por packshot real
  const isUnsplashBonePlaceholder = typeof img === 'string' && img.includes('photo-1568640347023-a616a30bc3bd');

  // Si ya tiene una imagen local válida y limpia, respetarla
  if (img && !isUnsplashBonePlaceholder && (img.startsWith('/') || img.startsWith('data:'))) {
    return img;
  }

  // Mapeo inteligente a los packshots reales de alta fidelidad en /images/
  if (name.includes('freshwater') || (brand.includes('acana') && name.includes('fish'))) {
    return '/images/acana_freshwater_fish.png';
  }
  if (name.includes('light') || (brand.includes('acana') && name.includes('fit'))) {
    return '/images/acana_light_fit.png';
  }
  if (name.includes('poultry') || name.includes('free run') || (brand.includes('acana') && (name.includes('pollo') || name.includes('adult')))) {
    return '/images/acana_poultry.png';
  }
  if (brand.includes('bravery') && (name.includes('pollo') || name.includes('chicken'))) {
    return '/images/bravery_chicken.jpg';
  }
  if (brand.includes('bravery') && (name.includes('cordero') || name.includes('lamb'))) {
    return '/images/bravery_lamb.jpg';
  }
  if (brand.includes('bravery') && (name.includes('salm') || name.includes('salmon'))) {
    return '/images/bravery_salmon.jpg';
  }
  if (brand.includes('alpha spirit') || name.includes('lata') || name.includes('paté') || name.includes('pate')) {
    return '/images/dog_food_ingredients.png';
  }
  if (name.includes('tuna') || name.includes('atun') || name.includes('atún')) {
    return '/images/cat_food_tuna.png';
  }
  if (isCat || name.includes('gato') || name.includes('cat')) {
    if (name.includes('ocean')) return '/images/cat_ocean_bag.png';
    if (name.includes('poultry') || name.includes('ave')) return '/images/cat_poultry_bag.png';
    return '/images/cat_salmon_bag.png';
  }

  // Si tiene una imagen externa válida que NO sea el placeholder de huesos
  if (img && !isUnsplashBonePlaceholder && img.startsWith('http')) {
    return img;
  }

  // Fallback seguro de alta fidelidad según especie
  return isCat ? '/images/cat_salmon_bag.png' : '/images/dog_food_salmon.png';
}

