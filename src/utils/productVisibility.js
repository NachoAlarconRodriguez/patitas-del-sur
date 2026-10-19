/**
 * Utilidades para el control de visibilidad de productos entre
 * el Panel de Administración (Bodega/Inventario) y la Tienda Pública.
 */

export function getHiddenProductIdentifiers() {
  try {
    const paused = JSON.parse(localStorage.getItem('patitas_paused_products') || '[]');
    const deleted = JSON.parse(localStorage.getItem('patitas_deleted_products') || '[]');
    return [...paused, ...deleted];
  } catch {
    return [];
  }
}

/**
 * Verifica si un producto debe ocultarse de la tienda pública (si fue pausado o eliminado en el Admin)
 * @param {Object} product - Objeto producto
 * @param {Array|Set} hiddenList - Lista o Set de IDs, nombres o SKUs pausados/eliminados
 * @returns {boolean}
 */
export function isProductHidden(product, hiddenList) {
  if (!product) return false;
  // Si el producto viene marcado como pausado o inactivo desde Supabase
  if (product.isPaused || product.is_paused || product.isActive === false || product.is_active === false) {
    return true;
  }

  if (!hiddenList) return false;
  const list = Array.isArray(hiddenList) ? hiddenList : Array.from(hiddenList);
  if (list.length === 0) return false;

  return list.some((item) => {
    if (!item) return false;
    const term = String(item).toLowerCase().trim();
    if (!term) return false;

    // 1. Coincidencia exacta por ID
    if (product.id && product.id.toLowerCase() === term) return true;

    // 2. Coincidencia exacta por SKU
    if (product.sku && product.sku.toLowerCase() === term) return true;

    // 3. Coincidencia por Nombre
    if (product.name) {
      const pName = product.name.toLowerCase();
      if (pName === term || pName.includes(term) || term.includes(pName)) return true;

      // Coincidencia por palabras clave representativas (ej: 'bravery salmon')
      const words = term.split(/[\s/•-]+/).filter((w) => w.length > 3);
      if (words.length >= 2 && words.every((w) => pName.includes(w))) return true;
    }

    return false;
  });
}
