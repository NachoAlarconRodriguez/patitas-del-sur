import {
  DollarSign,
  ShoppingBag,
  MapPin,
  Truck,
  Award,
  Handshake,
  Flame,
} from 'lucide-react';

export const ALLY_TYPE_OPTIONS = [
  { value: 'peluqueria', label: '✂️ Peluquería & Spa' },
  { value: 'veterinaria', label: '🏥 Clínica Veterinaria' },
  { value: 'entrenamiento', label: '🐕 Adiestramiento / K9' },
  { value: 'guarderia', label: '🏡 Guardería & Hotel' },
];

export const INITIAL_COUPON_OPTIONS = [
  { value: 5, label: '5 cupones' },
  { value: 10, label: '10 cupones (Recomendado)' },
  { value: 20, label: '20 cupones' },
  { value: 50, label: '50 cupones' },
];

export const INVOICE_PRODUCT_CATEGORIES = [
  { value: 'Alimento Seco', label: '🥣 Alimento Seco' },
  { value: 'Alimento Húmedo', label: '🥫 Alimento Húmedo (Latas/Pouch)' },
  { value: 'Snacks Naturales', label: '🍖 Snacks & Premios' },
  { value: 'Arena Sanitaria', label: '🏖️ Arena Sanitaria' },
  { value: 'Farmacia & Salud', label: '💊 Farmacia & Suplementos' },
  { value: 'Accesorios & Juguetes', label: '🎾 Accesorios & Juguetes' },
  { value: 'Higiene & Cuidados', label: '🧴 Higiene & Cuidados' },
  { value: 'Otro', label: '✨ Otro (Personalizado)' },
];

export const SHIPPING_DISTRIBUTION_OPTIONS = [
  {
    value: 'value',
    label: 'Proporcional al valor neto (Recomendado)',
    desc: 'Distribuye según el porcentaje del valor neto de cada ítem',
  },
  {
    value: 'units',
    label: 'Por unidades (Equitativo)',
    desc: 'Divide el flete en partes iguales por cada unidad de producto',
  },
];

// Subpestañas / Cápsulas para navegar directamente los 7 gráficos del Dashboard
export const CHART_SLIDE_TABS = [
  { id: 0, label: 'Ventas', icon: DollarSign },
  { id: 1, label: 'Pedidos', icon: ShoppingBag },
  { id: 2, label: 'Comunas', icon: MapPin },
  { id: 3, label: 'Modalidad', icon: Truck },
  { id: 4, label: 'Top Productos', icon: Award },
  { id: 5, label: 'Convenios', icon: Handshake },
  { id: 6, label: 'Horarios', icon: Flame },
];

export const MOTIVATIONAL_PHRASES = [
  'Cada bolsa entregada lleva el amor y la pureza de los ríos y bosques del sur a un hogar feliz. 🏔️🐾',
  'Nutrir con ingredientes reales es el acto de amor más noble que podemos regalar a nuestros peludos. 🐟❤️',
  'Hoy es un gran día para llenar platos con salud, vitalidad y sonrisas de cuatro patas. ✨🐶',
  'Nuestra pasión nace en la Patagonia: alimentar con honestidad, cuidar con el corazón. 🌿🌲',
  'Detrás de cada pedido hay una familia que confía en nosotros para ver a su compañero saltar de alegría. 🐾🏡',
  'El salmón fresco y las praderas limpias no son solo ingredientes, son nuestra promesa de bienestar animal. 🌊🐕',
  'Un perro sano y un gato juguetón son el mejor testimonio de un trabajo hecho con amor y dedicación. 🐱✨',
  'Que hoy la fuerza de la naturaleza austral inspire cada despacho y cada conversación con nuestros tutores. 🏔️🚀',
  'Amar a las mascotas es elegir lo mejor para ellas todos los días, sin atajos ni rellenos artificiales. 🥩🐾',
  'Transformamos la nutrición en momentos de felicidad compartida en cada rincón de Chile. 🇨🇱❤️',
  'La lealtad infinita de nuestras mascotas merece lo más puro de nuestra tierra patagónica. 🐶🌲',
  'Pequeños cambios en su alimentación crean vidas más largas, saludables y llenas de juegos. 🏃‍♂️🐾',
  'Cuidar de Kira, Jack y miles de peludos es el motor que llena de energía a Patitas del Sur cada mañana. 🐾☀️',
  'Conectando la magia del sur con el corazón de cada familia. ¡Excelente jornada para todo el equipo! 🏔️✨',
];
