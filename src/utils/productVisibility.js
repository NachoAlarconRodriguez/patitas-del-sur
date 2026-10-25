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

  // 1. Supabase es la fuente de verdad definitiva: Si el producto está explícitamente activo y no pausado en Supabase, nunca se oculta por residuos locales
  if (product.isActive === true && product.is_active !== false && !product.isPaused && !product.is_paused) {
    return false;
  }

  // 2. Si el producto viene explícitamente marcado como pausado o inactivo desde Supabase
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

    // Coincidencia exacta por ID
    if (product.id && product.id.toLowerCase() === term) return true;

    // Coincidencia exacta por SKU
    if (product.sku && product.sku.toLowerCase() === term) return true;

    // Coincidencia exacta por Nombre completo (nunca subcadenas parciales para evitar falsos positivos con palabras comunes como 'vacuno')
    if (product.name && product.name.toLowerCase().trim() === term) return true;

    return false;
  });
}
