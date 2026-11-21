/**
 * Utilidades compartidas del portal de clientes (Club Patitas).
 */
export const KNOWN_BRANDS = [
  'Alpha Spirit',
  'Acana',
  'Orijen',
  'Bravery',
  'Fit',
  'Nomade',
  'Stay Happy',
  'Dr. Pet',
  'Dr Pet',
  'Patagonia Holística',
  'Patagonia',
  'Sur Natural',
  'Austral Bio',
  'Chiloé Sea',
];

/**
 * Extrae la marca y limpia el nombre del producto en vistas compactas (Apple Eyebrow).
 */
export function extractBrandAndCleanName(product) {
  let brand = (product?.brand || '').trim();
  let cleanName = (product?.name || product?.foodName || '').trim();

  if (!brand) {
    const matchedBrand = KNOWN_BRANDS.find((b) =>
      cleanName.toLowerCase().startsWith(b.toLowerCase())
    );
    if (matchedBrand) {
      brand = matchedBrand;
    }
  }

  if (brand && cleanName.toLowerCase().startsWith(brand.toLowerCase())) {
    cleanName = cleanName.slice(brand.length).trim();
  }

  cleanName = cleanName.replace(/^[-–—:·\s]+/, '');

  return {
    brand: brand.toUpperCase(),
    cleanName: cleanName || product?.name || product?.foodName || '',
  };
}
