/**
 * Constantes institucionales y de configuración centralizada de Patitas del Sur
 * Fuente única de verdad (Single Source of Truth) para SEO, GEO, AEO y UI.
 *
 * Para migrar a dominio propio (ej. https://www.patitas-delsur.cl), basta definir
 * VITE_SITE_URL en Vercel y actualizar index.html / robots.txt.
 */
export const SITE_URL =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SITE_URL) ||
  'https://www.patitas-delsur.cl';

export const FRUTILLAR_SECTORS = [
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

export const COMPANY_INFO = {
  name: 'Patitas del Sur',
  legalName: 'Comercial Kira SpA',
  rut: '78.493.053-K',
  taxId: '78.493.053-K',
  url: SITE_URL,
  logoUrl: '/pwa-icon-512.png',
  defaultOgImage: '/images/og-patitas-frutillar.jpg',
  phone: '+56 9 5333 2492',
  phoneDisplay: '+56 9 5333 2492',
  whatsappRaw: '56953332492',
  whatsappLink: 'https://wa.me/56953332492',
  whatsappUrl: 'https://wa.me/56953332492',
  whatsappDefaultMessage: 'Hola! Quisiera asesoría para elegir el alimento ideal para mi mascota en Frutillar',
  email: 'patitasdelsur.cl@gmail.com',
  supportEmail: 'patitasdelsur.cl@gmail.com',
  privacyEmail: 'patitasdelsur.cl@gmail.com',
  paymentsEmail: 'patitasdelsur.cl@gmail.com',
  bankTransfer: {
    bank: 'Mercado Pago',
    accountType: 'Cuenta Vista',
    accountNumber: '1034904137',
    rut: '78.493.053-K',
    holder: 'Comercial Kira SpA',
    email: 'patitasdelsur.cl@gmail.com',
  },
  instagramUrl: 'https://www.instagram.com/patitasdelsur.cl',
  facebookUrl: 'https://www.facebook.com/patitasdelsur.cl',
  location: 'Frutillar, Región de Los Lagos, Chile',
  hubCity: 'Frutillar',
  hubAddress: 'Loteo Espacio Frutillar, Frutillar, Región de Los Lagos, Chile',
  postalCode: '5620000',
  coverageRadiusKm: 9,
  coverageDescription: 'Frutillar y alrededores (radio de ~9 km alrededor de Frutillar Alto: urbano y parcelaciones)',
  coordinates: {
    lat: -41.08985,
    lng: -73.08013,
    hubLat: -41.08985,
    hubLng: -73.08013,
  },
  communes: ['Frutillar', ...FRUTILLAR_SECTORS],
  sectors: FRUTILLAR_SECTORS,
  baseShippingFee: 2500,
  urgentShippingFee: 3500,
  freeShippingThreshold: 25000,
  deliveryWindows: {
    morning: '10:00 - 13:00 hrs',
    afternoon: '15:30 - 19:30 hrs',
    sundayUrgent: '10:00 - 20:00 hrs',
  },
  returnPolicyDays: 10,
  palatabilityGuaranteeDays: 5,
  legalWarrantyMonths: 6,
  paymentMethods: [
    'Mercado Pago (Tarjetas de Crédito, Débito Redcompra y Prepago)',
    'Transferencia Bancaria al recibir',
    'Efectivo contra entrega',
    'Tarjeta Débito / Crédito al recibir (Máquina POS móvil)',
  ],
};
