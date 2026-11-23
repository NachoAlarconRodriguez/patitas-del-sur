import { SITE_URL } from '../constants.js';

/**
 * Tarjetas de presentación digitales (NFC / QR) de Patitas del Sur.
 * Centralizadas aquí para agregar fácilmente nuevos integrantes (ej. Alamiro)
 * y actualizar redes sociales o dominio en un solo lugar.
 */
export const DIGITAL_BUSINESS_CARDS = {
  ignacio: {
    slug: 'ignacio',
    fullName: 'Nacho Alarcón Rodríguez',
    firstName: 'Nacho',
    lastName: 'Alarcón Rodríguez',
    monogram: 'NA',
    role: 'Founder',
    company: 'Patitas del Sur',
    location: 'Frutillar, Región de Los Lagos',
    bio: 'Alimento super premium, recetas Grain Free y snacks naturales para perros y gatos con despacho a domicilio en Frutillar.',
    phone: '+56 9 5333 2492',
    phoneRaw: '56953332492',
    whatsappMessage: '¡Hola Nacho! Escaneé tu tarjeta digital de Patitas del Sur 🐾',
    email: 'patitasdelsur.cl@gmail.com',
    // Enlaces temporales mientras se crean las cuentas oficiales definitivas
    instagram: {
      handle: '@patitasdelsur.cl',
      url: 'https://www.instagram.com/patitasdelsur.cl',
    },
    facebook: {
      handle: 'Patitas del Sur',
      url: 'https://www.facebook.com/patitasdelsur.cl',
    },
    isPublic: false,
  },
  alamiro: {
    slug: 'alamiro',
    fullName: 'Alamiro Huerta',
    firstName: 'Alamiro',
    lastName: 'Huerta',
    monogram: 'AH',
    role: 'Founder',
    company: 'Patitas del Sur',
    location: 'Frutillar, Región de Los Lagos',
    bio: 'Alimento super premium, recetas Grain Free y snacks naturales para perros y gatos con despacho a domicilio en Frutillar.',
    phone: '+56 9 9452 9737',
    phoneRaw: '56994529737',
    whatsappMessage: '¡Hola Alamiro! Escaneé tu tarjeta digital de Patitas del Sur 🐾',
    email: 'patitasdelsur.cl@gmail.com',
    // Enlaces temporales mientras se crean las cuentas oficiales definitivas
    instagram: {
      handle: '@patitasdelsur.cl',
      url: 'https://www.instagram.com/patitasdelsur.cl',
    },
    facebook: {
      handle: 'Patitas del Sur',
      url: 'https://www.facebook.com/patitasdelsur.cl',
    },
    isPublic: false,
  },
};

export function getBusinessCardBySlug(slug) {
  if (!slug) return null;
  const key = String(slug).toLowerCase().trim();
  return DIGITAL_BUSINESS_CARDS[key] || null;
}

/**
 * Genera el contenido vCard 3.0 (.vcf) compatible con iOS (iPhone) y Android
 * para guardar el contacto directo en la agenda en 1 toque.
 */
export function buildVCardContent(card) {
  const cleanSiteUrl = String(SITE_URL || 'https://www.patitas-delsur.cl').replace(/\/+$/, '');
  const cardUrl = `${cleanSiteUrl}/tarjeta/${card.slug}`;
  const cleanPhone = `+${String(card.phoneRaw || '').replace(/\D/g, '')}`;

  const lines = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `N:${card.lastName || ''};${card.firstName || card.fullName};;;`,
    `FN:${card.fullName}`,
    `ORG:${card.company}`,
    `TITLE:${card.role}`,
    `TEL;TYPE=CELL,VOICE:${cleanPhone}`,
    card.email ? `EMAIL;TYPE=INTERNET,WORK:${card.email}` : null,
    `URL;TYPE=WORK:${cleanSiteUrl}`,
    `item1.URL:${cardUrl}`,
    'item1.X-ABLabel:Tarjeta Digital',
    'ADR;TYPE=WORK:;;Frutillar;Región de Los Lagos;;5620000;Chile',
    `NOTE:${card.role} en ${card.company} (${card.location}). Alimento y snacks naturales para mascotas con despacho a domicilio en Frutillar.`,
    'END:VCARD',
  ].filter(Boolean);

  return lines.join('\r\n');
}
