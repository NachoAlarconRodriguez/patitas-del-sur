import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Ticket,
  Globe,
  Banknote,
  Landmark,
  Copy,
  LayoutDashboard,
  LayoutGrid,
  List,
  ShoppingBag,
  Users,
  User,
  Handshake,
  Package,
  DollarSign,
  Truck,
  LogOut,
  Search,
  Filter,
  Plus,
  Minus,
  History,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  Pause,
  Play,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileText,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowUpDown,
  Shield,
  Store,
  MapPin,
  Phone,
  Mail,
  Calendar,
  Building2,
  Percent,
  Settings,
  RefreshCw,
  Download,
  Check,
  X,
  ChevronRight,
  ChevronLeft,
  ChevronUp,
  ChevronDown,
  Award,
  Flame,
  Sparkles,
  Heart,
  Scissors,
  GraduationCap,
  Stethoscope,
  ExternalLink,
  Receipt,
  CreditCard,
  BarChart3,
  PieChart,
  Layers,
  Lock,
  ArrowLeft,
  MessageSquare,
  Send,
  AlertCircle,
  Target,
  Radio,
  Locate,
  Navigation,
  Compass,
  Fuel,
  Wallet,
  SlidersHorizontal,
  Car,
  Gauge,
  Zap,
  Calculator,
} from 'lucide-react';
import { PRODUCTS, BRANDS } from '../data/mockData';
import CustomDropdown from '../components/CustomDropdown';
import AdminConveniosManager from './admin/AdminConveniosManager';
import { WhatsAppIcon, GoogleMapsIcon } from '../components/OfficialIcons';
import {
  fetchProductsFromSupabase,
  updateProductInSupabase,
  createProductInSupabase,
  deleteProductFromSupabase,
} from '../services/productsService.js';
import {
  fetchOrdersFromSupabase,
  createOrderInSupabase,
} from '../services/ordersService.js';
import {
  fetchAllCustomersForAdmin,
} from '../services/customersService.js';
import {
  fetchConveniosFromSupabase,
  createConvenioInSupabase,
  updateConvenioStatusInSupabase,
  deleteConvenioFromSupabase,
  createConvenioCouponsInSupabase,
  deleteConvenioCouponFromSupabase,
} from '../services/conveniosService.js';

import {
  fetchPurchaseInvoicesFromSupabase,
  createPurchaseInvoiceInSupabase,
  updatePurchaseInvoiceStatus,
  fetchExpensesFromSupabase,
  createExpenseInSupabase,
  deleteExpenseFromSupabase,
  getMercadoPagoSettingsFromSupabase,
  updateMercadoPagoSettingsInSupabase,
} from '../services/financesService.js';
import { supabase } from '../lib/supabase.js';

// ==========================================
// INITIAL MOCK DATASETS
// ==========================================

const ALLY_TYPE_OPTIONS = [
  { value: 'peluqueria', label: '✂️ Peluquería & Spa' },
  { value: 'veterinaria', label: '🏥 Clínica Veterinaria' },
  { value: 'entrenamiento', label: '🐕 Adiestramiento / K9' },
  { value: 'guarderia', label: '🏡 Guardería & Hotel' },
];

const INITIAL_COUPON_OPTIONS = [
  { value: 5, label: '5 cupones' },
  { value: 10, label: '10 cupones (Recomendado)' },
  { value: 20, label: '20 cupones' },
  { value: 50, label: '50 cupones' },
];

const POPULAR_MAPS_ADDRESSES = [
  { address: 'San Francisco 416', city: 'Puerto Varas', region: 'Los Lagos' },
  { address: 'Av. Gramado 1240', city: 'Puerto Varas', region: 'Los Lagos' },
  { address: 'Costanera Vicente Pérez Rosales 1300', city: 'Puerto Varas', region: 'Los Lagos' },
  { address: 'Santa Rosa 575', city: 'Puerto Varas', region: 'Los Lagos' },
  { address: 'Walker Martínez 450', city: 'Puerto Varas', region: 'Los Lagos' },
  { address: 'Del Salvador 320', city: 'Puerto Varas', region: 'Los Lagos' },
  { address: 'Imperial 650', city: 'Puerto Varas', region: 'Los Lagos' },
  { address: 'Los Colonos 1100', city: 'Puerto Varas', region: 'Los Lagos' },
  { address: 'Pinto 240', city: 'Puerto Varas', region: 'Los Lagos' },
  { address: 'San Pedro 350', city: 'Puerto Varas', region: 'Los Lagos' },
  { address: 'San Ignacio 810', city: 'Puerto Varas', region: 'Los Lagos' },
  { address: 'Klenner 220', city: 'Puerto Varas', region: 'Los Lagos' },
  { address: 'Ruta 5 Sur Km 1012', city: 'Puerto Varas', region: 'Los Lagos' },
  { address: 'Av. Vicente Pérez Rosales 820', city: 'Llanquihue', region: 'Los Lagos' },
  { address: 'Bernardo O\'Higgins 310', city: 'Llanquihue', region: 'Los Lagos' },
  { address: 'Ernesto Riquelme 450', city: 'Llanquihue', region: 'Los Lagos' },
  { address: 'Av. Philippi 450', city: 'Frutillar', region: 'Los Lagos' },
  { address: 'Av. Carlos Richter 280', city: 'Frutillar', region: 'Los Lagos' },
  { address: 'Cristóbal Colón 120', city: 'Frutillar', region: 'Los Lagos' },
  { address: 'Diego Portales 2000', city: 'Puerto Montt', region: 'Los Lagos' },
  { address: 'Av. Angelmó 1850', city: 'Puerto Montt', region: 'Los Lagos' },
  { address: 'Urmeneta 520', city: 'Puerto Montt', region: 'Los Lagos' },
  { address: 'Guillermo Gallardo 340', city: 'Puerto Montt', region: 'Los Lagos' },
  { address: 'Ruta 225 Km 42', city: 'Ensenada', region: 'Los Lagos' },
  { address: 'Eleuterio Ramírez 900', city: 'Osorno', region: 'Los Lagos' },
  { address: 'Av. Costanera Arturo Prat 500', city: 'Valdivia', region: 'Los Ríos' },
  { address: 'Av. Alemania 0850', city: 'Temuco', region: 'Araucanía' },
];

const getMockOrderDate = (daysAgo = 0) => {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
};

const getPetBirthdayDetails = (birthdateStr) => {
  if (!birthdateStr) {
    return { formatted: 'No registrada', shortDate: 'Sin fecha', fullDate: 'Sin fecha', isCurrentMonth: false, monthName: '' };
  }
  const parts = birthdateStr.split('-');
  if (parts.length < 3) {
    return { formatted: birthdateStr, shortDate: birthdateStr, fullDate: birthdateStr, isCurrentMonth: false, monthName: '' };
  }
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);
  const now = new Date();
  const isCurrentMonth = month === now.getMonth();
  const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  const fullMonths = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  return {
    formatted: `${day} de ${fullMonths[month]} (${year})`,
    shortDate: `${day} de ${months[month]}`,
    fullDate: `${day} de ${fullMonths[month]}`,
    isCurrentMonth,
    day,
    monthName: fullMonths[month],
    year,
  };
};

const INITIAL_ORDERS = [];


const INITIAL_CUSTOMERS = [];

const INITIAL_CONVENIOS = [];

// Helper generator for unique single-use coupon codes (e.g. SWD-7K9P)
const generateRandomCouponCode = (prefix = 'SWD-') => {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let randomPart = '';
  for (let i = 0; i < 4; i++) {
    randomPart += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `${prefix}${randomPart}`;
};

const INITIAL_INVENTORY = [];

const INITIAL_PURCHASE_INVOICES = [];

const INITIAL_EXPENSES = [];

const INITIAL_DISPATCH_ZONES = [];
const INITIAL_VEHICLES = [];

// Helper currency formatter
const formatCLP = (amount) => {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    maximumFractionDigits: 0,
  }).format(amount || 0);
};

// Normalizador oficial de Medios de Pago según requerimiento
const normalizePaymentMethod = (pm) => {
  if (!pm) return 'Web';
  const s = String(pm).trim().toLowerCase();
  if (s === 'web' || s === 'webpay' || s.includes('webpay') || s.includes('online')) return 'Web';
  if (
    s === 'tarjeta' ||
    s.includes('tarjeta') ||
    s.includes('débito') ||
    s.includes('debito') ||
    s.includes('crédito') ||
    s.includes('credito') ||
    s.includes('mercado pago') ||
    s.includes('mercadopago')
  ) {
    return 'Tarjeta';
  }
  if (s === 'efectivo' || s.includes('efectivo')) return 'Efectivo';
  if (s === 'transferencia' || s.includes('transferencia') || s.includes('bci') || s.includes('santander') || s.includes('banco')) {
    return 'Transferencia';
  }
  return 'Web';
};

const renderPaymentMethodBadge = (pm) => {
  const norm = normalizePaymentMethod(pm);
  switch (norm) {
    case 'Web':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-sky-50 text-sky-800 border border-sky-200/90 shadow-2xs">
          <Globe className="w-3 h-3 text-sky-600 shrink-0" />
          <span>Botón Web</span>
        </span>
      );
    case 'Tarjeta':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-purple-50 text-purple-800 border border-purple-200/90 shadow-2xs">
          <CreditCard className="w-3 h-3 text-purple-600 shrink-0" />
          <span>Tarjeta Web</span>
        </span>
      );
    case 'Efectivo':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-800 border border-emerald-200/90 shadow-2xs">
          <Banknote className="w-3 h-3 text-emerald-600 shrink-0" />
          <span>Efectivo</span>
        </span>
      );
    case 'Transferencia':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-amber-50 text-amber-800 border border-amber-200/90 shadow-2xs">
          <Landmark className="w-3 h-3 text-amber-600 shrink-0" />
          <span>Transferencia</span>
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
          <span>{pm || 'Web'}</span>
        </span>
      );
  }
};

// Determina si el pedido fue o será pagado online mediante el botón de pago de la web
const isOrderPaidOnline = (order) => {
  if (!order) return false;
  if (order.isPaidOnline !== undefined) return Boolean(order.isPaidOnline);
  const norm = normalizePaymentMethod(order.paymentMethod);
  return order.channel === 'web' || norm === 'Web' || (norm === 'Tarjeta' && order.channel !== 'manual');
};

// Banner visual de cobro/no cobro para el repartidor (PWA)
const renderPaymentCollectionBanner = (order, isCompact = false) => {
  if (!order) return null;
  const isPaid = isOrderPaidOnline(order);
  const norm = normalizePaymentMethod(order.paymentMethod);

  if (isPaid) {
    return (
      <div
        className={`flex items-center gap-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 font-extrabold shadow-2xs ${
          isCompact ? 'px-2 py-1 text-[10px]' : 'px-2.5 py-1.5 text-xs'
        }`}
      >
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 stroke-[2.5]" />
        <span className="truncate">PAGADO EN WEB · NO COBRAR AL CLIENTE</span>
      </div>
    );
  }

  return (
    <div
      className={`flex items-center gap-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 font-extrabold shadow-2xs ${
        isCompact ? 'px-2 py-1 text-[10px]' : 'px-2.5 py-1.5 text-xs'
      }`}
    >
      <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0 stroke-[2.5]" />
      <span className="truncate">COBRAR AL ENTREGAR: {formatCLP(order.total)} ({norm})</span>
    </div>
  );
};


// Subpestañas / Cápsulas para navegar directamente los 7 gráficos del Dashboard
const CHART_SLIDE_TABS = [
  { id: 0, label: 'Ventas', icon: DollarSign },
  { id: 1, label: 'Pedidos', icon: ShoppingBag },
  { id: 2, label: 'Comunas', icon: MapPin },
  { id: 3, label: 'Modalidad', icon: Truck },
  { id: 4, label: 'Top Productos', icon: Award },
  { id: 5, label: 'Convenios', icon: Handshake },
  { id: 6, label: 'Horarios', icon: Flame },
];


// 14 Frases motivacionales y cariñosas que representan el espíritu de Patitas del Sur (ciclo rotativo de 14 días)
const MOTIVATIONAL_PHRASES = [
  "Cada bolsa entregada lleva el amor y la pureza de los ríos y bosques del sur a un hogar feliz. 🏔️🐾",
  "Nutrir con ingredientes reales es el acto de amor más noble que podemos regalar a nuestros peludos. 🐟❤️",
  "Hoy es un gran día para llenar platos con salud, vitalidad y sonrisas de cuatro patas. ✨🐶",
  "Nuestra pasión nace en la Patagonia: alimentar con honestidad, cuidar con el corazón. 🌿🌲",
  "Detrás de cada pedido hay una familia que confía en nosotros para ver a su compañero saltar de alegría. 🐾🏡",
  "El salmón fresco y las praderas limpias no son solo ingredientes, son nuestra promesa de bienestar animal. 🌊🐕",
  "Un perro sano y un gato juguetón son el mejor testimonio de un trabajo hecho con amor y dedicación. 🐱✨",
  "Que hoy la fuerza de la naturaleza austral inspire cada despacho y cada conversación con nuestros tutores. 🏔️🚀",
  "Amar a las mascotas es elegir lo mejor para ellas todos los días, sin atajos ni rellenos artificiales. 🥩🐾",
  "Transformamos la nutrición en momentos de felicidad compartida en cada rincón de Chile. 🇨🇱❤️",
  "La lealtad infinita de nuestras mascotas merece lo más puro de nuestra tierra patagónica. 🐶🌲",
  "Pequeños cambios en su alimentación crean vidas más largas, saludables y llenas de juegos. 🏃‍♂️🐾",
  "Cuidar de Kira, Jack y miles de peludos es el motor que llena de energía a Patitas del Sur cada mañana. 🐾☀️",
  "Conectando la magia del sur con el corazón de cada familia. ¡Excelente jornada para todo el equipo! 🏔️✨",
];

// Saludo dinámico según la hora del sistema
const getDynamicGreeting = (user, adminEmail) => {
  const hour = new Date().getHours();
  let name = 'Ignacio';
  if (user && user.name) {
    name = user.name.split(' ')[0];
  } else if (adminEmail) {
    const prefix = adminEmail.split('@')[0];
    name = prefix.charAt(0).toUpperCase() + prefix.slice(1);
  }

  if (hour >= 5 && hour < 12) {
    return `¡Buenos días, ${name}! ☀️`;
  } else if (hour >= 12 && hour < 20) {
    return `¡Buenas tardes, ${name}! 🌤️`;
  } else {
    return `¡Buenas noches, ${name}! 🌙`;
  }
};

// Frase del día basada en el día del año (ciclo de 14 días rotativo)
const getDailyMotivationalQuote = () => {
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const diffDays = Math.floor((now - startOfYear) / (1000 * 60 * 60 * 24));
  const dayIndex = ((diffDays % 14) + 14) % 14;
  return {
    quote: MOTIVATIONAL_PHRASES[dayIndex],
    dayNumber: dayIndex + 1,
  };
};

// Helper to resolve high-res product packshots
const getProductImage = (itemName = '') => {
  const lower = itemName.toLowerCase();
  if (lower.includes('pollo') || lower.includes('chicken')) return '/images/bravery_chicken.jpg';
  if (lower.includes('cordero') || lower.includes('lamb')) return '/images/bravery_lamb.jpg';
  if (lower.includes('salmón') || lower.includes('salmon') || lower.includes('bravery')) return '/images/bravery_salmon.jpg';
  if (lower.includes('trucha') || lower.includes('patagonia')) return '/images/cat_food_tuna.png';
  if (lower.includes('urinary') || lower.includes('dr. pet') || lower.includes('dr pet')) return '/images/cat_food_tuna.png';
  if (lower.includes('ciervo') || lower.includes('deshidratado')) return '/images/dog_food_ingredients.png';
  if (lower.includes('hueso') || lower.includes('recreativo')) return '/images/dog_kibble_detail.png';
  if (lower.includes('omega') || lower.includes('suplemento')) return '/images/dog_food_salmon.png';
  return '/images/bravery_salmon.jpg';
};

export default function AdminDashboardView({ user, onSwitchRole, onLogout }) {
  const navigate = useNavigate();

  // Authentication State: auto-authenticated if user has admin role
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(() => {
    return user?.role === 'admin' || user?.email?.includes('patitasdelsur.cl') || false;
  });
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [authError, setAuthError] = useState('');

  useEffect(() => {
    if (user?.role === 'admin' || user?.email?.includes('patitasdelsur.cl')) {
      setIsAdminAuthenticated(true);
    }
  }, [user]);

  // Order Day Filter for PWA Mobile Dispatchers ('todos' | 'hoy')
  const [orderDayFilter, setOrderDayFilter] = useState('todos');

  // Frase del día activa
  const dailyQuote = useMemo(() => getDailyMotivationalQuote(), []);

  // Active Tab: 'dashboard' | 'pedidos' | 'clientes' | 'convenios' | 'inventario' | 'finanzas' | 'despachos'
  const [activeTab, setActiveTab] = useState('dashboard');

  // Filtro de Período Global para todo el Dashboard: 'dia' | 'semana' | 'mes'
  const [globalTimeFilter, setGlobalTimeFilter] = useState('mes');

  // Slide activo del Carrusel de Gráficos (0 a 6)
  const [currentChartSlide, setCurrentChartSlide] = useState(0);

  // Estado para expandir/colapsar desglose visual de productos en la tarjeta hero de entrega en ruta
  const [isNextOrderItemsExpanded, setIsNextOrderItemsExpanded] = useState(false);

  // Estado para expandir/colapsar productos en las tarjetas PWA de pedidos
  const [expandedOrderCards, setExpandedOrderCards] = useState({});

  // Estado para expandir/colapsar tarjetas completas de pedidos en la PWA (por defecto todas contraídas)
  const [expandedOrders, setExpandedOrders] = useState({});

  // Estado para desplegar listado exclusivo de productos con alerta de stock crítico
  const [isCriticalStockExpanded, setIsCriticalStockExpanded] = useState(false);

  // Datasets State
  const [orders, setOrders] = useState(INITIAL_ORDERS);
  const [customers, setCustomers] = useState(INITIAL_CUSTOMERS);
  const [convenios, setConvenios] = useState(() => {
    const saved = localStorage.getItem('patitas_convenios');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error parsing stored convenios', e);
      }
    }
    return INITIAL_CONVENIOS;
  });

  // Sync convenios to localStorage and listen for updates
  useEffect(() => {
    localStorage.setItem('patitas_convenios', JSON.stringify(convenios));
    window.dispatchEvent(new Event('patitas_convenios_updated'));
  }, [convenios]);

  useEffect(() => {
    const handleSync = () => {
      const saved = localStorage.getItem('patitas_convenios');
      if (saved) {
        try {
          setConvenios(JSON.parse(saved));
        } catch (e) {
          console.error(e);
        }
      }
    };
    window.addEventListener('patitas_convenios_updated', handleSync);
    window.addEventListener('storage', handleSync);
    return () => {
      window.removeEventListener('patitas_convenios_updated', handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, []);

  const [selectedConvenioForCoupons, setSelectedConvenioForCoupons] = useState(null);
  const [couponFilterStatus, setCouponFilterStatus] = useState('todos'); // 'todos' | 'disponible' | 'canjeado'
  const [inventory, setInventory] = useState(() => {
    try {
      const paused = JSON.parse(localStorage.getItem('patitas_paused_products') || '[]');
      const deleted = JSON.parse(localStorage.getItem('patitas_deleted_products') || '[]');
      return INITIAL_INVENTORY.filter(
        (p) => !deleted.includes(p.id) && !deleted.includes(p.name) && !deleted.includes(p.sku)
      ).map((p) => ({
        ...p,
        isPaused: paused.includes(p.id) || paused.includes(p.name) || paused.includes(p.sku),
      }));
    } catch {
      return INITIAL_INVENTORY;
    }
  });
  const [invoices, setInvoices] = useState(INITIAL_PURCHASE_INVOICES);
  const [expenses, setExpenses] = useState(INITIAL_EXPENSES);
  const [dispatchZones, setDispatchZones] = useState(INITIAL_DISPATCH_ZONES);

  // Fecha actual formateada del sistema y pedidos estrictamente de hoy
  const todayFormattedDate = useMemo(() => {
    return getMockOrderDate(0);
  }, []);

  const todayOrders = useMemo(() => {
    return orders.filter((o) => {
      if (!o.date) return false;
      return o.date === todayFormattedDate || o.date === 'Hoy' || o.date.includes('18 Ago');
    });
  }, [orders, todayFormattedDate]);

  // Mercado Pago Configuration State
  const [mercadoPagoConfig, setMercadoPagoConfig] = useState({
    commissionRatePercent: 3.19, // 3.19% + IVA
    fixedFeeCLP: 350, // $350 CLP fijo
    ivaPercent: 19, // 19% IVA
    payoutSchedule: 'instant', // 'instant' | '14_days'
    cardDiscountActive: false,
  });

  // 1. Sincronizar Inventario & Catálogo con Supabase
  useEffect(() => {
    let isMounted = true;
    const syncInventory = async () => {
      try {
        const dbProds = await fetchProductsFromSupabase();
        if (!isMounted) return;
        if (dbProds && dbProds.length > 0) {
          const mapped = dbProds.map((p) => ({
            id: p.id,
            name: p.name,
            brand: p.brand || 'Patitas del Sur',
            category: p.category || 'Alimento Seco',
            petType: p.petType || 'perros',
            format: p.weights?.[0] || '12 kg',
            sku: p.sku || `SKU-${p.id}`,
            stock: typeof p.stock === 'number' ? p.stock : 10,
            minStock: p.minStock || 5,
            salePrice: p.price || 68990,
            unitCostNeto: p.unitCostNeto || Math.round((p.price || 68990) * 0.6),
            status: typeof p.stock === 'number' && p.stock <= (p.minStock || 5) ? 'stock_bajo' : 'disponible',
            isPaused: Boolean(p.is_paused || p.isPaused),
            isActive: p.is_active !== false,
            image: p.image,
          }));

          setInventory(mapped);
        }
      } catch (err) {
        console.error('Error synchronizing inventory with Supabase:', err);
      }
    };

    syncInventory();
    window.addEventListener('patitas_products_updated', syncInventory);
    return () => {
      isMounted = false;
      window.removeEventListener('patitas_products_updated', syncInventory);
    };
  }, []);

  // 2. Sincronizar Pedidos y Despachos con Supabase
  useEffect(() => {
    let isMounted = true;
    const syncOrders = async () => {
      try {
        const dbOrders = await fetchOrdersFromSupabase();
        if (!isMounted) return;
        if (dbOrders && dbOrders.length > 0) {
          const mapped = dbOrders.map((o) => {
            const items = (o.order_items || []).map((it) => ({
              name: it.product_name,
              format: it.weight || '1 un.',
              qty: it.quantity || 1,
              unitPrice: it.unit_price || 0,
              subtotal: it.subtotal || 0,
            }));
            const primaryItem = items[0] || { name: 'Pedido Patitas', format: '1 un.', qty: 1 };

            return {
              id: o.id,
              date: o.created_at
                ? new Date(o.created_at).toLocaleDateString('es-CL', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })
                : 'Hoy',
              customer: o.customer_name || 'Cliente Patitas',
              customerPhone: o.customer_phone || '+56 9 9123 4567',
              product: primaryItem.name,
              format: primaryItem.format,
              qty: primaryItem.qty,
              total: Number(o.total || 0),
              status: o.status || 'en_preparacion',
              paymentMethod: o.payment_method || 'Tarjeta',
              paymentStatus: o.payment_status || 'pagado',
              address: o.address || 'Puerto Varas',
              city: o.city || 'Puerto Varas',
              deliverySlot: o.delivery_slot || 'Tarde (14:00 - 19:00 hrs)',
              items: items.length > 0 ? items : undefined,
              invoiceNumber: o.invoice_number || `BOL-2026-${o.id}`,
              channel: o.channel || 'web',
            };
          });

          setOrders(mapped);
        } else {
          setOrders([]);
        }
      } catch (err) {
        console.error('Error synchronizing orders with Supabase:', err);
      }
    };

    syncOrders();
    window.addEventListener('patitas_orders_updated', syncOrders);
    return () => {
      isMounted = false;
      window.removeEventListener('patitas_orders_updated', syncOrders);
    };
  }, []);

  // 3. Sincronizar Clientes y Tutores con Supabase
  useEffect(() => {
    let isMounted = true;
    fetchAllCustomersForAdmin().then((dbCustomers) => {
      if (!isMounted) return;
      if (dbCustomers && dbCustomers.length > 0) {
        const mapped = dbCustomers.map((c) => ({
          id: c.id,
          name: c.full_name,
          email: c.email || '',
          phone: c.phone || '+56 9 8456 1234',
          city: c.city || 'Puerto Varas',
          address: c.address || 'Dirección no registrada',
          pets: (c.pets || []).map((p) => `${p.name} (${p.type})`).join(', ') || 'Sin mascotas',
          points: c.points ?? 0,
          totalSpent: Number(c.total_spent || 0),
          role: c.role || 'cliente',
          memberSince: c.created_at
            ? new Date(c.created_at).toLocaleDateString('es-CL', { month: 'long', year: 'numeric' })
            : 'Reciente',
        }));

        setCustomers(mapped);
      } else {
        setCustomers([]);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  // 4. Sincronizar Convenios, Facturas, Gastos y Configuración de Mercado Pago
  useEffect(() => {
    let isMounted = true;

    // Convenios
    fetchConveniosFromSupabase().then((dbConv) => {
      if (!isMounted) return;
      if (dbConv && dbConv.length > 0) {
        setConvenios((prev) => {
          const ids = new Set(dbConv.map((c) => c.id));
          return [...dbConv, ...prev.filter((p) => !ids.has(p.id))];
        });
      }
    });

    // Facturas de Compra (Bodega)
    fetchPurchaseInvoicesFromSupabase().then((dbInv) => {
      if (!isMounted) return;
      if (dbInv && dbInv.length > 0) {
        setInvoices((prev) => {
          const nums = new Set(dbInv.map((i) => i.invoiceNumber));
          return [...dbInv, ...prev.filter((p) => !nums.has(p.invoiceNumber))];
        });
      }
    });

    // Gastos Operacionales
    fetchExpensesFromSupabase().then((dbExp) => {
      if (!isMounted) return;
      if (dbExp && dbExp.length > 0) {
        setExpenses((prev) => {
          const ids = new Set(dbExp.map((e) => e.id));
          return [...dbExp, ...prev.filter((p) => !ids.has(p.id))];
        });
      }
    });

    // Configuración de Mercado Pago
    getMercadoPagoSettingsFromSupabase().then((mpSettings) => {
      if (!isMounted) return;
      if (mpSettings) {
        setMercadoPagoConfig((prev) => ({
          ...prev,
          ...mpSettings,
        }));
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  // Auto-guardado de configuración de Mercado Pago en Supabase con debounce
  const initialMountMpRef = useRef(false);
  useEffect(() => {
    if (!initialMountMpRef.current) {
      initialMountMpRef.current = true;
      return;
    }
    const timer = setTimeout(() => {
      updateMercadoPagoSettingsInSupabase(mercadoPagoConfig).catch(console.error);
    }, 1200);
    return () => clearTimeout(timer);
  }, [mercadoPagoConfig]);

  // Search & Filter States
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('todos');
  const [customerSearch, setCustomerSearch] = useState('');
  const [customerViewMode, setCustomerViewMode] = useState('grid'); // 'grid' | 'list'
  const [inventorySearch, setInventorySearch] = useState('');
  const [inventoryStockFilter, setInventoryStockFilter] = useState('todos'); // 'todos' | 'bajo' | 'disponible'
  const [inventoryBrandFilter, setInventoryBrandFilter] = useState('todas'); // 'todas' | brand name
  const [inventoryPetTypeFilter, setInventoryPetTypeFilter] = useState('todos'); // 'todos' | 'perros' | 'gatos'
  const [inventoryViewMode, setInventoryViewMode] = useState('list');
  const [financesPaymentMethodFilter, setFinancesPaymentMethodFilter] = useState('todos'); // 'todos' | 'Web' | 'Tarjeta' | 'Efectivo' | 'Transferencia'

  // Opciones de lista desplegable para filtros de pedidos (Estándar iOS)
  const orderDayFilterOptions = useMemo(() => {
    const todayCount = orders.filter((o) => o.date === getMockOrderDate(0)).length;
    return [
      { value: 'todos', label: `Todos los días (${orders.length})` },
      { value: 'hoy', label: `⚡ Solo Hoy (${todayCount})` },
    ];
  }, [orders]);

  const orderStatusFilterOptions = useMemo(() => {
    const prepCount = orders.filter((o) => o.status === 'en_preparacion').length;
    const caminoCount = orders.filter((o) => o.status === 'en_camino').length;
    const entregadoCount = orders.filter((o) => o.status === 'entregado').length;
    return [
      { value: 'todos', label: `Todos los estados (${orders.length})` },
      { value: 'en_preparacion', label: `⏳ En Preparación (${prepCount})` },
      { value: 'en_camino', label: `🚚 En Camino (${caminoCount})` },
      { value: 'entregado', label: `✓ Entregados (${entregadoCount})` },
    ];
  }, [orders]);

  // Lista de pedidos filtrados para vista PWA móvil y vista escritorio
  const filteredOrdersList = useMemo(() => {
    return orders.filter((o) => {
      const matchQ =
        !orderSearch ||
        o.id.toLowerCase().includes(orderSearch.toLowerCase()) ||
        o.customer.toLowerCase().includes(orderSearch.toLowerCase()) ||
        (o.petName && o.petName.toLowerCase().includes(orderSearch.toLowerCase())) ||
        (o.city && o.city.toLowerCase().includes(orderSearch.toLowerCase())) ||
        (o.address && o.address.toLowerCase().includes(orderSearch.toLowerCase()));
      const matchS = orderStatusFilter === 'todos' || o.status === orderStatusFilter;
      const matchD = orderDayFilter === 'todos' || o.date === getMockOrderDate(0);
      return matchQ && matchS && matchD;
    });
  }, [orders, orderSearch, orderStatusFilter, orderDayFilter]);

  const handleUpdateOrderPaymentMethod = (orderId, newPaymentMethod) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, paymentMethod: newPaymentMethod } : o))
    );
    if (selectedOrderModal && selectedOrderModal.id === orderId) {
      setSelectedOrderModal((prev) => ({ ...prev, paymentMethod: newPaymentMethod }));
    }

    // Persistir en Supabase y notificar
    supabase
      .from('orders')
      .update({ payment_method: newPaymentMethod })
      .eq('id', orderId)
      .then(() => {
        window.dispatchEvent(new Event('patitas_orders_updated'));
      })
      .catch((err) => console.error('Error updating order payment method in Supabase:', err));

    showToast(`Tipo de pago actualizado a ${newPaymentMethod} en Pedido ${orderId}`);
  };
  const [convenioFilter, setConvenioFilter] = useState('todos');
  const [expenseFilterCategory, setExpenseFilterCategory] = useState('todos'); // 'todos' | 'combustible' | 'packaging' | 'fijo' | 'mantenimiento' | 'servicios' | 'notaria'
  const [financesSubTab, setFinancesSubTab] = useState('resumen'); // 'resumen' | 'gastos' | 'ingresos' | 'f29'
  const [gastosTabFilter, setGastosTabFilter] = useState('todos'); // 'todos' | 'facturas' | 'operacionales'
  const [f29PeriodFilter, setF29PeriodFilter] = useState('todos'); // 'todos' | 'current' | '2026-08' | '2026-09' | '2026-10'
  const [financesSalesChannelFilter, setFinancesSalesChannelFilter] = useState('todos'); // 'todos' | 'web' | 'manual'
  const [financesExpenseDocFilter, setFinancesExpenseDocFilter] = useState('todos'); // 'todos' | 'factura' | 'boleta'
  const [financesInvoiceStatusFilter, setFinancesInvoiceStatusFilter] = useState('todas'); // 'todas' | 'pagada' | 'pendiente'

  // Opciones para filtros de Inventario & Bodega
  const inventoryBrandOptions = useMemo(() => {
    const brands = Array.from(
      new Set(inventory.map((p) => (p.brand || '').trim()).filter(Boolean))
    ).sort();
    return [
      { value: 'todas', label: 'Todas las Marcas' },
      ...brands.map((b) => ({ value: b, label: b })),
    ];
  }, [inventory]);

  const inventoryPetTypeOptions = [
    { value: 'todos', label: 'Perros & Gatos' },
    { value: 'perros', label: '🐶 Perros' },
    { value: 'gatos', label: '🐱 Gatos' },
  ];

  const inventoryStockFilterOptions = useMemo(() => {
    const lowCount = inventory.filter((p) => p.stock <= (p.minStock || 5) || p.status === 'stock_bajo').length;
    const okCount = inventory.filter((p) => p.stock > (p.minStock || 5) && p.status !== 'stock_bajo').length;
    return [
      { value: 'todos', label: `Todos los Stocks (${inventory.length})` },
      { value: 'bajo', label: `⚠️ Stock Bajo (${lowCount})` },
      { value: 'disponible', label: `✓ Stock Óptimo (${okCount})` },
    ];
  }, [inventory]);

  // Lista exclusiva de productos que tienen alerta de stock crítico
  const criticalStockProducts = useMemo(() => {
    return inventory.filter((p) => p.stock <= (p.minStock || 5) || p.status === 'stock_bajo');
  }, [inventory]);

  // Estados de ordenamiento de columnas de inventario
  const [inventorySortKey, setInventorySortKey] = useState(null); // 'name' | 'category' | 'unitCostNeto' | 'salePrice' | 'margin' | 'stock'
  const [inventorySortDirection, setInventorySortDirection] = useState('asc'); // 'asc' | 'desc'

  const handleInventorySort = (key) => {
    if (inventorySortKey === key) {
      if (inventorySortDirection === 'asc') {
        setInventorySortDirection('desc');
      } else {
        setInventorySortKey(null);
        setInventorySortDirection('asc');
      }
    } else {
      setInventorySortKey(key);
      setInventorySortDirection('asc');
    }
  };

  const renderSortIndicator = (key) => {
    if (inventorySortKey !== key) {
      return (
        <ArrowUpDown className="w-3 h-3 text-slate-300 group-hover:text-slate-500 transition-colors shrink-0" />
      );
    }
    return inventorySortDirection === 'asc' ? (
      <ChevronUp className="w-3.5 h-3.5 text-[#0E8388] shrink-0 stroke-[2.5]" />
    ) : (
      <ChevronDown className="w-3.5 h-3.5 text-[#0E8388] shrink-0 stroke-[2.5]" />
    );
  };

  // Listado filtrado y ordenado unificado de inventario
  const filteredInventory = useMemo(() => {
    const list = inventory.filter((p) => {
      const q = inventorySearch.toLowerCase().trim();
      const matchQ =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        (p.brand || '').toLowerCase().includes(q) ||
        (p.category || '').toLowerCase().includes(q);

      const isLow = p.stock <= (p.minStock || 5) || p.status === 'stock_bajo';
      const matchStock =
        inventoryStockFilter === 'todos'
          ? true
          : inventoryStockFilter === 'bajo'
          ? isLow
          : !isLow;

      const matchBrand =
        inventoryBrandFilter === 'todas' ||
        (p.brand && p.brand.toLowerCase() === inventoryBrandFilter.toLowerCase());

      const pPetType = (
        p.petType ||
        (p.category && p.category.toLowerCase().includes('gato') ? 'gatos' : 'perros')
      ).toLowerCase();

      const matchPetType =
        inventoryPetTypeFilter === 'todos' ||
        pPetType === inventoryPetTypeFilter.toLowerCase();

      return matchQ && matchStock && matchBrand && matchPetType;
    });

    if (!inventorySortKey) return list;

    return [...list].sort((a, b) => {
      let comparison = 0;
      if (inventorySortKey === 'name') {
        comparison = (a.name || '').localeCompare(b.name || '', 'es', { sensitivity: 'base' });
      } else if (inventorySortKey === 'category') {
        const catA = `${a.brand || ''} ${a.category || ''}`.trim();
        const catB = `${b.brand || ''} ${b.category || ''}`.trim();
        comparison = catA.localeCompare(catB, 'es', { sensitivity: 'base' });
      } else if (inventorySortKey === 'unitCostNeto') {
        comparison = (Number(a.unitCostNeto) || 0) - (Number(b.unitCostNeto) || 0);
      } else if (inventorySortKey === 'salePrice') {
        comparison = (Number(a.salePrice) || 0) - (Number(b.salePrice) || 0);
      } else if (inventorySortKey === 'margin') {
        const marginA = a.salePrice ? ((a.salePrice - a.unitCostNeto) / a.salePrice) * 100 : 0;
        const marginB = b.salePrice ? ((b.salePrice - b.unitCostNeto) / b.salePrice) * 100 : 0;
        comparison = marginA - marginB;
      } else if (inventorySortKey === 'stock') {
        comparison = (Number(a.stock) || 0) - (Number(b.stock) || 0);
      }
      return inventorySortDirection === 'asc' ? comparison : -comparison;
    });
  }, [
    inventory,
    inventorySearch,
    inventoryStockFilter,
    inventoryBrandFilter,
    inventoryPetTypeFilter,
    inventorySortKey,
    inventorySortDirection,
  ]);

  const [stockAdjustModal, setStockAdjustModal] = useState(null); // { prod, type: 'sumar' | 'restar' | 'conteo', amount: 1, reason: '' }
  const [editingProduct, setEditingProduct] = useState(null); // Producto en edición
  const [deleteProductConfirm, setDeleteProductConfirm] = useState(null); // Producto para confirmar eliminación
  const [selectedProductSalesModal, setSelectedProductSalesModal] = useState(null); // Producto para ver detalle de ventas y gráficos
  const [productSalesPeriod, setProductSalesPeriod] = useState('7d'); // '7d' | '30d' | 'mes'

  // Modals & Drawers
  const [selectedOrderModal, setSelectedOrderModal] = useState(null);
  const [isAddOrderModalOpen, setIsAddOrderModalOpen] = useState(false);
  const [manualOrderStep, setManualOrderStep] = useState(1);
  const [manualOrderPhoneTouched, setManualOrderPhoneTouched] = useState(false);
  const [showPhoneSuggestions, setShowPhoneSuggestions] = useState(false);
  const [manualOrderCustomer, setManualOrderCustomer] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    city: 'Puerto Varas',
    petName: '',
    petType: '🐶 Perro',
    notes: '',
    shippingCost: 0,
    status: 'en_preparacion',
    paymentMethod: 'Transferencia',
  });
  const [manualOrderItems, setManualOrderItems] = useState([]);
  const [mapsSearchQuery, setMapsSearchQuery] = useState('');
  const [mapsSearchResults, setMapsSearchResults] = useState([]);
  const [showMapsDropdown, setShowMapsDropdown] = useState(false);
  const [isSearchingMaps, setIsSearchingMaps] = useState(false);
  const [selectedFromMaps, setSelectedFromMaps] = useState(false);

  const handleMapsSearch = (val) => {
    setMapsSearchQuery(val);
    if (!val || val.trim().length < 2) {
      setMapsSearchResults([]);
      setShowMapsDropdown(false);
      return;
    }

    const clean = val.trim().toLowerCase();
    const localMatches = POPULAR_MAPS_ADDRESSES.filter((item) =>
      item.address.toLowerCase().includes(clean) || item.city.toLowerCase().includes(clean)
    );

    const hasExact = localMatches.some((m) => m.address.toLowerCase() === clean);
    const combined = hasExact
      ? localMatches
      : [
          { address: val.trim(), city: manualOrderCustomer.city || 'Puerto Varas', region: 'Dirección personalizada' },
          ...localMatches,
        ];

    setMapsSearchResults(combined.slice(0, 5));
    setShowMapsDropdown(true);

    if (val.trim().length >= 3) {
      setIsSearchingMaps(true);
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 1200);

      fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          val.trim() + ', Chile'
        )}&addressdetails=1&limit=4`,
        { signal: controller.signal }
      )
        .then((res) => res.json())
        .then((data) => {
          clearTimeout(timer);
          if (Array.isArray(data) && data.length > 0) {
            const apiResults = data.map((item) => {
              const road = item.address?.road || item.address?.pedestrian || item.name || '';
              const houseNumber = item.address?.house_number || '';
              const fullStreet = houseNumber ? `${road} ${houseNumber}` : road || item.display_name.split(',')[0];
              const cityFound =
                item.address?.city ||
                item.address?.town ||
                item.address?.village ||
                item.address?.municipality ||
                'Puerto Varas';
              return {
                address: fullStreet.trim(),
                city: cityFound,
                region: item.address?.state || 'Chile',
              };
            });
            setMapsSearchResults((prev) => {
              const existing = new Set(prev.map((p) => p.address.toLowerCase()));
              const filteredApi = apiResults.filter((a) => !existing.has(a.address.toLowerCase()));
              return [...prev, ...filteredApi].slice(0, 6);
            });
          }
        })
        .catch(() => {})
        .finally(() => {
          setIsSearchingMaps(false);
        });
    }
  };

  const handleSelectMapsAddress = (item) => {
    setManualOrderCustomer((prev) => ({
      ...prev,
      address: item.address,
      city: item.city || prev.city,
    }));
    setMapsSearchQuery(item.address);
    setShowMapsDropdown(false);
    setSelectedFromMaps(true);
    showToast(`📍 Dirección fijada: ${item.address}, ${item.city}`);
  };

  const [selectedProductToAdd, setSelectedProductToAdd] = useState(PRODUCTS[0]?.id || '');
  const [selectedWeightToAdd, setSelectedWeightToAdd] = useState(PRODUCTS[0]?.weights?.[0] || '12 kg');
  const [quantityToAdd, setQuantityToAdd] = useState(1);
  const [orderPetTypeFilter, setOrderPetTypeFilter] = useState(null); // null | 'perros' | 'gatos'
  const [orderProductSearch, setOrderProductSearch] = useState('');
  const [orderBrandFilter, setOrderBrandFilter] = useState('todas');
  const [orderProductCardConfigs, setOrderProductCardConfigs] = useState({});
  const [selectedMultiProductIds, setSelectedMultiProductIds] = useState([]);
  const [selectedCustomerModal, setSelectedCustomerModal] = useState(null);
  const [customerModalSubTab, setCustomerModalSubTab] = useState(0); // 0, 1... for pet index, or 'client'
  const [selectedProductPreview, setSelectedProductPreview] = useState(null);
  const [selectedProductInvoicesModal, setSelectedProductInvoicesModal] = useState(null);
  const [isReplenishmentModalOpen, setIsReplenishmentModalOpen] = useState(false);
  const [replenishmentFilter, setReplenishmentFilter] = useState('criticos'); // 'criticos' | 'todos'
  const [isAddAgreementModalOpen, setIsAddAgreementModalOpen] = useState(false);
  const [isAddInvoiceModalOpen, setIsAddInvoiceModalOpen] = useState(false);
  const [isAddExpenseModalOpen, setIsAddExpenseModalOpen] = useState(false);
  const [isMercadoPagoModalOpen, setIsMercadoPagoModalOpen] = useState(false);
  const [expandedFinanceAction, setExpandedFinanceAction] = useState(null);
  const financeActionsRef = useRef(null);

  useEffect(() => {
    if (!expandedFinanceAction) return;
    const handleClickOutside = (e) => {
      if (financeActionsRef.current && !financeActionsRef.current.contains(e.target)) {
        setExpandedFinanceAction(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [expandedFinanceAction]);
  const [isZoneModalOpen, setIsZoneModalOpen] = useState(false);
  const [zoneModalForm, setZoneModalForm] = useState({
    id: null,
    name: 'Zona 1',
    radiusMaxKm: 5,
    baseFee: 1990,
    hasFreeShipping: true,
    freeThreshold: 25000,
  });

  // Delivery Sub-tab ('zonas' | 'vehiculos') & Vehicle Fleet State
  const [dispatchSubTab, setDispatchSubTab] = useState('zonas'); // 'zonas' | 'vehiculos'
  const [vehicles, setVehicles] = useState(INITIAL_VEHICLES);
  const [isVehicleModalOpen, setIsVehicleModalOpen] = useState(false);
  const [vehicleModalForm, setVehicleModalForm] = useState({
    id: null,
    brand: '',
    plate: '',
    efficiencyKmPerL: 12,
    fuelPricePerL: 1320,
  });

  // Cálculo del promedio de costo de combustible por km de la flota (Idea 4: promedio de los 2 autos)
  const fleetFuelStats = useMemo(() => {
    if (!vehicles || vehicles.length === 0) {
      return {
        count: 0,
        avgCostPerKm: Math.round(1320 / 12), // ~$110 CLP/km estándar
        avgEfficiency: '12.0',
        avgFuelPrice: 1320,
        label: 'Estimación estándar (12 km/L a $1.320/L)',
      };
    }

    const count = vehicles.length;
    const totalCostKm = vehicles.reduce((sum, v) => {
      const eff = parseFloat(v.efficiencyKmPerL) || 12;
      const price = parseFloat(v.fuelPricePerL) || 1320;
      return sum + (price / eff);
    }, 0);
    const avgCostPerKm = Math.round(totalCostKm / count);

    const totalEff = vehicles.reduce((sum, v) => sum + (parseFloat(v.efficiencyKmPerL) || 12), 0);
    const avgEfficiency = (totalEff / count).toFixed(1);

    const names = vehicles.slice(0, 2).map((v) => v.brand || 'Auto').join(' y ');

    return {
      count,
      avgCostPerKm,
      avgEfficiency,
      label:
        count === 1
          ? `Tu vehículo: ${vehicles[0].brand || 'Auto'}`
          : count === 2
          ? `Promedio de tus 2 autos`
          : `Promedio de tu flota (${count} vehículos)`,
      sublabel:
        count === 2
          ? `${vehicles[0].brand} y ${vehicles[1].brand}`
          : null,
    };
  }, [vehicles]);

  // Google Maps Radial Delivery State
  const mapType = 'streets';
  const [mapZoomLevel, setMapZoomLevel] = useState(1);
  const [simulatedAddress, setSimulatedAddress] = useState('Alerce Norte, Puerto Varas');
  const [simulatedDistanceKm, setSimulatedDistanceKm] = useState(11.5);
  const [selectedConfigZoneId, setSelectedConfigZoneId] = useState(null);

  // Forms
  const [newAgreement, setNewAgreement] = useState({
    name: 'Sweet Dog',
    type: 'peluqueria',
    contactPerson: 'Yessica Vargas',
    phone: '912345678',
    email: 'contacto@sweetdog.cl',
    city: 'Puerto Varas',
    code: '',
    benefitCustomer: '10% Descuento en primera compra (1 solo uso)',
    commissionEntity: '8% Comisión mensual',
    discountType: 'single_use', // 'single_use' | 'fixed'
    discountPercent: 10,
    codePrefix: 'SWD-',
    initialCouponsCount: 10,
  });

  const [newInvoiceForm, setNewInvoiceForm] = useState({
    selectedProductId: '',
    invoiceNumber: '',
    provider: '',
    providerRut: '',
    date: new Date().toISOString().split('T')[0],
    dueDate: '',
    productName: '',
    format: '12 kg',
    quantityReceived: 10,
    unitCostNeto: 42000,
    salePrice: 68990,
  });

  const [newExpenseForm, setNewExpenseForm] = useState({
    category: 'combustible',
    description: '',
    provider: '',
    documentType: 'boleta', // 'boleta' | 'factura'
    documentNumber: '',
    date: new Date().toISOString().split('T')[0],
    amount: 35000,
    paymentMethod: 'Tarjeta Débito Banco Santander',
    isRecurring: false,
  });

  const handleSaveNewExpense = (e) => {
    e.preventDefault();
    if (!newExpenseForm.description || !newExpenseForm.amount) {
      showToast('Por favor completa la descripción y el monto del gasto.');
      return;
    }

    const categoryIcons = {
      notaria: { label: 'Notaría & Trámites Legales', icon: '⚖️' },
      combustible: { label: 'Combustible & Bencina', icon: '⛽' },
      packaging: { label: 'Packaging & Insumos', icon: '📦' },
      fijo: { label: 'Arriendo & Gastos Fijos', icon: '🏬' },
      mantenimiento: { label: 'Mantenimiento Vehículo', icon: '🔧' },
      servicios: { label: 'Servicios & Conectividad', icon: '📶' },
      otros: { label: 'Otros Gastos Operativos', icon: '💼' },
    };

    const catInfo = categoryIcons[newExpenseForm.category] || {
      label: 'Gasto Operativo',
      icon: '💼',
    };

    const amount = parseInt(newExpenseForm.amount, 10) || 0;
    const isFactura = newExpenseForm.documentType === 'factura';
    const neto = isFactura ? Math.round(amount / 1.19) : amount;
    const iva = isFactura ? amount - neto : 0;

    const newExp = {
      id: `EXP-${String(expenses.length + 1).padStart(2, '0')}`,
      category: newExpenseForm.category,
      categoryLabel: catInfo.label,
      icon: catInfo.icon,
      description: newExpenseForm.description,
      provider: newExpenseForm.provider || 'Comercio Local',
      documentType: newExpenseForm.documentType || 'boleta',
      hasIvaCredit: isFactura,
      documentNumber:
        newExpenseForm.documentNumber ||
        `${isFactura ? 'FAC' : 'BOL'}-${Date.now().toString().slice(-4)}`,
      date: newExpenseForm.date,
      amount: amount,
      neto: neto,
      iva: iva,
      paymentMethod: newExpenseForm.paymentMethod || 'Tarjeta Débito',
      isRecurring: !!newExpenseForm.isRecurring,
    };

    setExpenses([newExp, ...expenses]);
    createExpenseInSupabase(newExp).catch((err) => console.error('Error saving expense to Supabase:', err));
    setIsAddExpenseModalOpen(false);
    setNewExpenseForm({
      category: 'combustible',
      description: '',
      provider: '',
      documentType: 'boleta',
      documentNumber: '',
      date: new Date().toISOString().split('T')[0],
      amount: 35000,
      paymentMethod: 'Tarjeta Débito Banco Santander',
      isRecurring: false,
    });
    showToast(
      isFactura
        ? `✅ Factura "${newExp.description}" registrada: +${formatCLP(iva)} IVA Crédito Fiscal ahorrado.`
        : `Gasto "${newExp.description}" de ${formatCLP(newExp.amount)} registrado.`
    );
  };

  const handleDeleteExpense = (id) => {
    setExpenses((prev) => prev.filter((exp) => exp.id !== id));
    deleteExpenseFromSupabase(id).catch((err) => console.error('Error deleting expense from Supabase:', err));
    showToast('Gasto eliminado del registro contable.');
  };

  // Toast alert
  const [toastMessage, setToastMessage] = useState('');
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  // Login handler
  const handleLoginSubmit = (e) => {
    e.preventDefault();
    if (adminEmail.trim().length > 0 && adminPassword.trim().length > 0) {
      setIsAdminAuthenticated(true);
      setAuthError('');
      showToast('¡Bienvenido al Panel de Administración!');
    } else {
      setAuthError('Por favor ingresa un correo y contraseña de administrador.');
    }
  };

  const handleQuickAdminLogin = () => {
    setIsAdminAuthenticated(true);
    setAuthError('');
    showToast('¡Acceso concedido como Administrador Principal!');
  };

  const handleLogout = () => {
    setIsAdminAuthenticated(false);
    if (onLogout) {
      onLogout();
    }
    showToast('Sesión de administrador cerrada con éxito.');
  };

  // Order status updater
  const handleUpdateOrderStatus = (orderId, newStatus) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
    );
    showToast(`Pedido ${orderId} actualizado a: ${newStatus.replace('_', ' ').toUpperCase()}`);
    if (selectedOrderModal && selectedOrderModal.id === orderId) {
      setSelectedOrderModal((prev) => ({ ...prev, status: newStatus }));
    }

    // Persistir estado del pedido en Supabase
    supabase
      .from('orders')
      .update({ status: newStatus })
      .eq('id', orderId)
      .then(() => {
        window.dispatchEvent(new Event('patitas_orders_updated'));
      })
      .catch((err) => console.error('Error updating order status in Supabase:', err));
  };

  // Helper para consultar stock en tiempo real cruzando inventario y catálogo
  const getProductStock = useCallback((prod) => {
    if (!prod) return 0;
    // 1. Prioridad: inventario real del sistema (por ID, SKU o coincidencia de nombre)
    const inv = inventory.find(
      (item) =>
        item.id === prod.id ||
        item.sku === prod.sku ||
        (item.name && prod.name && (
          item.name.toLowerCase().includes(prod.name.toLowerCase().slice(0, 15)) ||
          prod.name.toLowerCase().includes(item.name.toLowerCase().slice(0, 15))
        ))
    );
    if (inv && typeof inv.stock === 'number') {
      return inv.stock;
    }
    // 2. Productos designados sin stock (Agotados) para demostración y catálogo realista
    const outOfStockIds = ['bravery-herring-cat', 'perros-cordero-5kg', 'simparica-trio-dog', 'revolution-plus-cat'];
    if (outOfStockIds.includes(prod.id)) {
      return 0;
    }
    // 3. Stock disponible por defecto en catálogo
    const stockMap = {
      'bravery-salmon-adult': 24,
      'bravery-lamb-adult': 18,
      'bravery-chicken-adult': 14,
      'perros-salmon-2kg': 16,
      'perros-snack-res': 45,
      'perros-suplemento-articulaciones': 28,
      'nexgard-spectra-dog': 12,
      'bravecto-dog-medium': 9,
      'bravery-salmon-cat': 15,
      'bravery-chicken-cat': 11,
      'gatos-trucha-catnip': 8,
      'gatos-pate-salmon': 20,
      'gatos-snacks-atun': 32,
      'bravecto-plus-cat': 14,
    };
    return stockMap[prod.id] !== undefined ? stockMap[prod.id] : 12;
  }, [inventory]);

  // Handlers para agregar pedido manual
  const handleAddProductToManualOrder = (prodToAdd, weightToAdd, qtyToAdd) => {
    const prod = prodToAdd || PRODUCTS.find((p) => p.id === selectedProductToAdd) || PRODUCTS[0];
    if (!prod) return;

    const currentStock = getProductStock(prod);
    if (currentStock <= 0) {
      showToast(`⚠️ "${prod.name}" no tiene stock disponible`);
      return;
    }

    const chosenWeight = weightToAdd || selectedWeightToAdd || (prod.weights && prod.weights[0]) || 'Estándar';
    const chosenQty = qtyToAdd || quantityToAdd || 1;

    const existingIndex = manualOrderItems.findIndex(
      (it) => it.productId === prod.id && it.weight === chosenWeight
    );

    if (existingIndex >= 0) {
      const updated = [...manualOrderItems];
      updated[existingIndex].quantity += chosenQty;
      setManualOrderItems(updated);
    } else {
      setManualOrderItems([
        ...manualOrderItems,
        {
          productId: prod.id,
          name: prod.name,
          weight: chosenWeight,
          price: prod.price,
          quantity: chosenQty,
          image: prod.image,
        },
      ]);
    }
    setQuantityToAdd(1);
    showToast(`✓ "${prod.name} (${chosenWeight})" añadido al pedido`);
  };

  const handleAddMultipleProductsToManualOrder = (itemsToAdd) => {
    if (!itemsToAdd || itemsToAdd.length === 0) return;
    let addedCount = 0;
    let updated = [...manualOrderItems];

    itemsToAdd.forEach(({ product, weight, quantity }) => {
      if (!product) return;
      const stock = getProductStock(product);
      if (stock <= 0) return;

      const chosenWeight = weight || (product.weights && product.weights[0]) || 'Estándar';
      const chosenQty = quantity || 1;

      const existingIndex = updated.findIndex(
        (it) => it.productId === product.id && it.weight === chosenWeight
      );

      if (existingIndex >= 0) {
        updated[existingIndex].quantity += chosenQty;
      } else {
        updated.push({
          productId: product.id,
          name: product.name,
          weight: chosenWeight,
          price: product.price,
          quantity: chosenQty,
          image: product.image,
        });
      }
      addedCount++;
    });

    setManualOrderItems(updated);
    showToast(`✓ ${addedCount} ${addedCount === 1 ? 'producto añadido' : 'productos añadidos'} al pedido`);
  };

  const handleRemoveProductFromManualOrder = (index) => {
    setManualOrderItems(manualOrderItems.filter((_, idx) => idx !== index));
  };

  const handleSaveManualOrder = (e) => {
    e.preventDefault();
    if (!manualOrderCustomer.name.trim()) {
      showToast('Por favor ingresa el nombre del cliente');
      return;
    }
    const cleanPhoneDigits = (manualOrderCustomer.phone || '').replace(/\D/g, '');
    if (cleanPhoneDigits.length !== 9) {
      setManualOrderPhoneTouched(true);
      showToast('⚠️ El teléfono debe tener exactamente 9 dígitos');
      return;
    }
    if (manualOrderItems.length === 0) {
      showToast('Debes agregar al menos un producto al pedido');
      return;
    }

    const subtotal = manualOrderItems.reduce((acc, it) => acc + it.price * it.quantity, 0);
    const shipping = parseInt(manualOrderCustomer.shippingCost, 10) || 0;
    const total = subtotal + shipping;

    const now = new Date();
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const dateFormatted = `${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}`;
    const timeFormatted = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const randomDigits = Math.floor(1000 + Math.random() * 9000);
    const newId = `PED-${randomDigits}`;
    const invoiceNum = `BOL-2026-${randomDigits}`;

    const formattedPhone = `+56 ${cleanPhoneDigits.slice(0, 1)} ${cleanPhoneDigits.slice(1, 5)} ${cleanPhoneDigits.slice(5, 9)}`;

    const newOrder = {
      id: newId,
      channel: 'manual',
      paymentMethod: manualOrderCustomer.paymentMethod || 'Transferencia Bancaria / Efectivo',
      customer: manualOrderCustomer.name,
      email: manualOrderCustomer.email || `${manualOrderCustomer.name.toLowerCase().replace(/\s+/g, '.')}@gmail.com`,
      phone: formattedPhone,
      petName: manualOrderCustomer.petName || 'Mascota',
      petType: manualOrderCustomer.petType || '🐶 Perro',
      petBreed: 'Mascota regalona',
      items: manualOrderItems.map((it) => ({
        name: it.name,
        weight: it.weight || '',
        quantity: it.quantity,
        price: it.price,
        code: `SKU-${it.productId?.toUpperCase().slice(0, 8) || 'PROD'}`,
      })),
      subtotal,
      shippingCost: shipping,
      discount: 0,
      total,
      date: dateFormatted,
      time: timeFormatted,
      status: manualOrderCustomer.status || 'en_preparacion',
      tracking: `CHI-${Math.floor(8000000 + Math.random() * 1000000)}`,
      invoiceNumber: invoiceNum,
      address: manualOrderCustomer.address || 'Dirección por confirmar',
      city: manualOrderCustomer.city || 'Puerto Varas',
      deliveryZone: `Entrega ${manualOrderCustomer.city || 'Puerto Varas'}`,
      notes: manualOrderCustomer.notes || 'Pedido creado manualmente en el panel',
    };

    setOrders([newOrder, ...orders]);
    setIsAddOrderModalOpen(false);
    setManualOrderStep(1);
    showToast(`✅ ¡Pedido ${newId} creado exitosamente!`);

    // Sincronizar pedido manual a Supabase
    createOrderInSupabase({
      id: newId,
      customerName: newOrder.customer,
      customerEmail: newOrder.email,
      customerPhone: newOrder.phone,
      channel: 'manual',
      paymentMethod: newOrder.paymentMethod,
      paymentStatus: 'pagado',
      status: newOrder.status,
      subtotal: newOrder.subtotal,
      shippingCost: newOrder.shippingCost,
      discount: 0,
      total: newOrder.total,
      address: newOrder.address,
      city: newOrder.city,
      deliveryZone: newOrder.deliveryZone,
      notes: newOrder.notes,
      invoiceNumber: newOrder.invoiceNumber,
    }, newOrder.items).then(({ success }) => {
      if (success) {
        window.dispatchEvent(new CustomEvent('patitas_orders_updated'));
      }
    });

    // Reset form
    setManualOrderCustomer({
      name: '',
      phone: '',
      email: '',
      address: '',
      city: 'Puerto Varas',
      petName: '',
      petType: '🐶 Perro',
      notes: '',
      shippingCost: 0,
      status: 'en_preparacion',
      paymentMethod: 'Transferencia',
    });
    setManualOrderItems([]);
    setQuantityToAdd(1);
    setManualOrderStep(1);
    setManualOrderPhoneTouched(false);
    setMapsSearchQuery('');
    setMapsSearchResults([]);
    setShowMapsDropdown(false);
    setSelectedFromMaps(false);
  };

  // Toggle Convenio Active
  const handleToggleConvenio = (id) => {
    const target = convenios.find((c) => c.id === id);
    const newActive = target ? !target.active : true;
    setConvenios((prev) =>
      prev.map((c) => (c.id === id ? { ...c, active: !c.active } : c))
    );
    showToast('Estado del convenio actualizado');

    // Sincronizar en Supabase
    updateConvenioStatusInSupabase(id, newActive).then(() => {
      window.dispatchEvent(new CustomEvent('patitas_convenios_updated'));
    });
  };

  // Delete Convenio
  const handleDeleteConvenio = (id) => {
    setConvenios((prev) => prev.filter((c) => c.id !== id));
    showToast('Convenio eliminado con éxito');

    // Sincronizar en Supabase
    deleteConvenioFromSupabase(id).then(() => {
      window.dispatchEvent(new CustomEvent('patitas_convenios_updated'));
    });
  };

  // Generate more coupons for a convenio
  const handleGenerateMoreCoupons = (convenioId, count = 10) => {
    const targetConv = convenios.find((c) => c.id === convenioId);
    const prefix = targetConv?.codePrefix || `${(targetConv?.name || 'CUP').slice(0, 3).toUpperCase()}-`;
    const newBatch = Array.from({ length: count }, () => ({
      code: generateRandomCouponCode(prefix),
      status: 'disponible',
      createdAt: new Date().toLocaleDateString('es-CL', { day: 'numeric', month: 'short', year: 'numeric' }),
      usedAt: null,
      orderId: null,
      customerName: null,
    }));
    setConvenios((prev) =>
      prev.map((c) => {
        if (c.id !== convenioId) return c;
        const updatedCoupons = [...(c.coupons || []), ...newBatch];
        if (selectedConvenioForCoupons?.id === convenioId) {
          setSelectedConvenioForCoupons({ ...c, coupons: updatedCoupons });
        }
        return { ...c, coupons: updatedCoupons };
      })
    );
    showToast(`¡Se generaron ${count} nuevos cupones únicos!`);

    // Sincronizar cupones a Supabase
    createConvenioCouponsInSupabase(convenioId, newBatch.map((b) => b.code)).then(() => {
      window.dispatchEvent(new CustomEvent('patitas_convenios_updated'));
    });
  };

  // Delete individual coupon
  const handleDeleteCoupon = (convenioId, couponCode) => {
    setConvenios((prev) =>
      prev.map((c) => {
        if (c.id !== convenioId) return c;
        const updatedCoupons = (c.coupons || []).filter((cp) => cp.code !== couponCode);
        if (selectedConvenioForCoupons?.id === convenioId) {
          setSelectedConvenioForCoupons({ ...c, coupons: updatedCoupons });
        }
        return { ...c, coupons: updatedCoupons };
      })
    );
    showToast(`Cupón ${couponCode} eliminado`);

    // Sincronizar en Supabase
    deleteConvenioCouponFromSupabase(couponCode).then(() => {
      window.dispatchEvent(new CustomEvent('patitas_convenios_updated'));
    });
  };

  // Copy coupon code
  const handleCopyCouponCode = (code) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(code);
    }
    showToast(`Código ${code} copiado al portapapeles`);
  };

  // WhatsApp share
  const handleShareCouponsWhatsApp = (conv) => {
    const availableCoupons = (conv.coupons || []).filter((c) => c.status === 'disponible');
    if (availableCoupons.length === 0) {
      showToast('No hay cupones disponibles para compartir');
      return;
    }
    const cleanPhone = (conv.phone || '').replace(/[^0-9]/g, '');
    const codesList = availableCoupons.slice(0, 20).map((c, i) => `${i + 1}. *${c.code}*`).join('\n');
    const message = `¡Hola ${conv.contactPerson || conv.name}! 🐾\nAquí tienes un lote de cupones con un *${conv.discountPercent || 10}% de descuento* de Patitas del Sur para los clientes de *${conv.name}*:\n\n${codesList}\n\n*Condición:* Cada cupón es de 1 solo uso exclusivo en https://patitasdelsur.cl al procesar la compra en el carrito.\n¡Muchas gracias por la alianza!`;
    const url = cleanPhone ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}` : `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  // Create Convenio
  const handleSaveConvenio = (e) => {
    e.preventDefault();
    if (!newAgreement.name) {
      showToast('Por favor completa el nombre del convenio');
      return;
    }
    if (newAgreement.discountType === 'fixed' && !newAgreement.code) {
      showToast('Por favor completa el código promocional fijo');
      return;
    }

    const cleanPhoneDigits = (newAgreement.phone || '').replace(/\D/g, '').slice(0, 9);
    if (cleanPhoneDigits.length < 9) {
      showToast('El teléfono debe tener exactamente 9 dígitos');
      return;
    }

    const formattedPhone = `+56 ${cleanPhoneDigits.slice(0, 1)} ${cleanPhoneDigits.slice(1, 5)} ${cleanPhoneDigits.slice(5)}`;
    const prefix = (newAgreement.codePrefix || 'SWD-').toUpperCase().trim();
    const cleanPrefix = prefix.endsWith('-') ? prefix : `${prefix}-`;
    const countToGenerate = Math.max(1, Number(newAgreement.initialCouponsCount) || 10);

    const initialCoupons =
      newAgreement.discountType === 'single_use'
        ? Array.from({ length: countToGenerate }, () => ({
            code: generateRandomCouponCode(cleanPrefix),
            status: 'disponible',
            createdAt: new Date().toLocaleDateString('es-CL', { day: 'numeric', month: 'short', year: 'numeric' }),
            usedAt: null,
            orderId: null,
            customerName: null,
          }))
        : [];

    const created = {
      ...newAgreement,
      phone: formattedPhone,
      id: `CONV-0${convenios.length + 1}`,
      typeLabel:
        newAgreement.type === 'veterinaria'
          ? 'Clínica Veterinaria'
          : newAgreement.type === 'entrenamiento'
          ? 'Centro de Entrenamiento'
          : newAgreement.type === 'peluqueria'
          ? 'Peluquería & Spa Canino'
          : 'Guardería & Hotel',
      benefitShipping: 'Despacho preferencial',
      code: newAgreement.discountType === 'single_use' ? cleanPrefix : newAgreement.code,
      codePrefix: cleanPrefix,
      discountPercent: Number(newAgreement.discountPercent) || 10,
      benefitCustomer:
        newAgreement.benefitCustomer ||
        `${newAgreement.discountPercent || 10}% Descuento (1 solo uso)`,
      commissionEntity: newAgreement.commissionEntity || '8% Comisión mensual',
      coupons: initialCoupons,
      redemptionsCount: 0,
      active: true,
      sinceDate: 'Septiembre 2026',
    };

    setConvenios([created, ...convenios]);
    setIsAddAgreementModalOpen(false);

    // Sincronizar nuevo convenio y sus cupones iniciales a Supabase
    createConvenioInSupabase(created, initialCoupons.map((c) => c.code)).then(() => {
      window.dispatchEvent(new CustomEvent('patitas_convenios_updated'));
    });

    setNewAgreement({
      name: 'Sweet Dog',
      type: 'peluqueria',
      contactPerson: 'Yessica Vargas',
      phone: '912345678',
      email: '',
      city: 'Puerto Varas',
      code: '',
      benefitCustomer: '10% Descuento en primera compra (1 uso)',
      commissionEntity: '8% Comisión mensual',
      discountType: 'single_use',
      discountPercent: 10,
      codePrefix: 'SWD-',
      initialCouponsCount: 10,
    });
    showToast('¡Nuevo convenio registrado con éxito!');
  };


  // Register New Invoice & Stock
  const handleSaveInvoice = (e) => {
    e.preventDefault();
    if (!newInvoiceForm.invoiceNumber || !newInvoiceForm.productName) {
      showToast('Por favor completa los datos de la factura y producto');
      return;
    }

    const qty = parseInt(newInvoiceForm.quantityReceived, 10) || 1;
    const unitNeto = parseInt(newInvoiceForm.unitCostNeto, 10) || 0;
    const saleP = parseInt(newInvoiceForm.salePrice, 10) || Math.round(unitNeto * 1.4);
    const subtotalNeto = qty * unitNeto;
    const iva = Math.round(subtotalNeto * 0.19);
    const totalBruto = subtotalNeto + iva;

    const newInvoiceObj = {
      invoiceNumber: newInvoiceForm.invoiceNumber,
      provider: newInvoiceForm.provider || 'Proveedor Autorizado',
      rut: newInvoiceForm.providerRut || '76.123.456-7',
      date: newInvoiceForm.date,
      dueDate: newInvoiceForm.dueDate || 'En 30 días',
      productName: newInvoiceForm.productName,
      quantityReceived: qty,
      unitCostNeto: unitNeto,
      totalNeto: subtotalNeto,
      iva: iva,
      totalBruto: totalBruto,
      status: 'pendiente',
      itemsCount: qty,
      paymentMethod: 'Crédito Proveedor',
    };
    setInvoices([newInvoiceObj, ...invoices]);

    // Sincronizar factura de compra en Supabase
    createPurchaseInvoiceInSupabase(newInvoiceObj);

    const existingIndex = inventory.findIndex(
      (p) =>
        (newInvoiceForm.selectedProductId && p.id === newInvoiceForm.selectedProductId) ||
        p.name.toLowerCase().trim() === newInvoiceForm.productName.toLowerCase().trim()
    );

    if (existingIndex > -1) {
      const prevItem = inventory[existingIndex];
      const newStock = prevItem.stock + qty;

      setInventory((prev) => {
        const updated = [...prev];
        const item = updated[existingIndex];
        const existingInvoices = item.invoices || [
          {
            invoiceNumber: item.invoiceNumber,
            invoiceDate: item.invoiceDate,
            provider: item.provider,
            providerRut: item.providerRut,
            quantity: item.stock,
            unitCostNeto: item.unitCostNeto,
          },
        ];

        const newInvoiceEntry = {
          invoiceNumber: newInvoiceForm.invoiceNumber,
          invoiceDate: newInvoiceForm.date,
          provider: newInvoiceForm.provider || 'Proveedor Autorizado',
          providerRut: newInvoiceForm.providerRut || '76.123.456-7',
          quantity: qty,
          unitCostNeto: unitNeto,
        };

        updated[existingIndex] = {
          ...item,
          stock: newStock,
          invoiceNumber: newInvoiceForm.invoiceNumber,
          invoiceDate: newInvoiceForm.date,
          unitCostNeto: unitNeto,
          salePrice: saleP,
          provider: newInvoiceForm.provider || item.provider,
          providerRut: newInvoiceForm.providerRut || item.providerRut,
          status: newStock <= (item.minStock || 5) ? 'stock_bajo' : 'disponible',
          invoices: [newInvoiceEntry, ...existingInvoices],
        };
        return updated;
      });

      // Actualizar stock del producto existente en Supabase
      updateProductInSupabase(prevItem.id, {
        stock: newStock,
        unitCostNeto: unitNeto,
        salePrice: saleP,
      }).then(() => {
        window.dispatchEvent(new CustomEvent('patitas_products_updated'));
      });
    } else {
      const newInvoiceEntry = {
        invoiceNumber: newInvoiceForm.invoiceNumber,
        invoiceDate: newInvoiceForm.date,
        provider: newInvoiceForm.provider || 'Proveedor Autorizado',
        providerRut: newInvoiceForm.providerRut || '76.123.456-7',
        quantity: qty,
        unitCostNeto: unitNeto,
      };

      const newProd = {
        id: `PROD-${String(inventory.length + 1).padStart(2, '0')}`,
        name: newInvoiceForm.productName,
        brand: 'Patitas del Sur',
        category: 'Alimento Seco',
        petType: 'perros',
        format: newInvoiceForm.format || '12 kg',
        sku: `SKU-${Date.now().toString().slice(-6)}`,
        stock: qty,
        minStock: 6,
        salePrice: saleP,
        unitCostNeto: unitNeto,
        invoices: [newInvoiceEntry],
        invoiceNumber: newInvoiceForm.invoiceNumber,
        invoiceDate: newInvoiceForm.date,
        provider: newInvoiceForm.provider,
        providerRut: newInvoiceForm.providerRut,
        status: 'disponible',
      };
      setInventory([newProd, ...inventory]);

      // Insertar nuevo producto en Supabase
      createProductInSupabase(newProd).then(() => {
        window.dispatchEvent(new CustomEvent('patitas_products_updated'));
      });
    }

    setIsAddInvoiceModalOpen(false);
    setNewInvoiceForm({
      selectedProductId: '',
      invoiceNumber: '',
      provider: '',
      providerRut: '',
      date: new Date().toISOString().split('T')[0],
      dueDate: '',
      productName: '',
      format: '12 kg',
      quantityReceived: 10,
      unitCostNeto: 42000,
      salePrice: 68990,
    });
    showToast(`✅ Factura ${newInvoiceForm.invoiceNumber} registrada: +${qty} un. sumadas al inventario (+${formatCLP(iva)} IVA Crédito).`);
  };

  const handleToggleInvoiceStatus = (invoiceNumber) => {
    let nextStatus = 'pagada';
    setInvoices((prev) =>
      prev.map((inv) => {
        if (inv.invoiceNumber === invoiceNumber) {
          nextStatus = inv.status === 'pagada' ? 'pendiente' : 'pagada';
          showToast(`Factura ${invoiceNumber} marcada como ${nextStatus}.`);
          return { ...inv, status: nextStatus };
        }
        return inv;
      })
    );

    // Sincronizar en Supabase
    updatePurchaseInvoiceStatus(invoiceNumber, nextStatus);
  };

  // Ajuste rápido de stock físico (+1 / -1)
  const handleQuickStockChange = (productId, delta) => {
    let calculatedStock = 0;
    setInventory((prev) =>
      prev.map((item) => {
        if (item.id === productId) {
          calculatedStock = Math.max(0, item.stock + delta);
          return {
            ...item,
            stock: calculatedStock,
            status: calculatedStock <= (item.minStock || 5) ? 'stock_bajo' : 'disponible',
          };
        }
        return item;
      })
    );
    showToast(delta > 0 ? `+${delta} unidad agregada a bodega` : `${delta} unidad descontada de bodega`);

    // Sincronizar en Supabase
    updateProductInSupabase(productId, { stock: calculatedStock }).then(() => {
      window.dispatchEvent(new CustomEvent('patitas_products_updated'));
    });
  };

  // Aplicar ajuste formal de stock (entrada, merma o conteo físico)
  const handleApplyStockAdjustment = (e) => {
    if (e) e.preventDefault();
    if (!stockAdjustModal || !stockAdjustModal.prod) return;
    const { prod, type, amount, reason } = stockAdjustModal;
    const qty = parseInt(amount, 10) || 0;
    if (qty < 0) {
      showToast('⚠️ La cantidad no puede ser negativa');
      return;
    }

    let resultingStock = prod.stock;
    if (type === 'sumar') resultingStock += qty;
    else if (type === 'restar') resultingStock = Math.max(0, resultingStock - qty);
    else if (type === 'conteo') resultingStock = qty;

    setInventory((prev) =>
      prev.map((item) => {
        if (item.id === prod.id) {
          return {
            ...item,
            stock: resultingStock,
            status: resultingStock <= (item.minStock || 5) ? 'stock_bajo' : 'disponible',
          };
        }
        return item;
      })
    );

    const typeMsg =
      type === 'sumar'
        ? `+${qty} u. ingresadas`
        : type === 'restar'
        ? `-${qty} u. por merma/ajuste`
        : `Stock fijado en ${qty} u. por conteo`;

    showToast(`✓ ${prod.name}: ${typeMsg}${reason ? ` (${reason})` : ''}`);
    setStockAdjustModal(null);

    // Sincronizar en Supabase
    updateProductInSupabase(prod.id, { stock: resultingStock }).then(() => {
      window.dispatchEvent(new CustomEvent('patitas_products_updated'));
    });
  };

  // Pausar / Reactivar producto en la tienda pública
  const handleTogglePauseProduct = (product) => {
    const newPausedState = !product.isPaused;
    setInventory((prev) =>
      prev.map((item) =>
        item.id === product.id ? { ...item, isPaused: newPausedState } : item
      )
    );

    try {
      const currentPaused = JSON.parse(localStorage.getItem('patitas_paused_products') || '[]');
      let updatedPaused;
      if (newPausedState) {
        updatedPaused = Array.from(new Set([...currentPaused, product.id, product.name, product.sku]));
      } else {
        updatedPaused = currentPaused.filter(
          (id) => id !== product.id && id !== product.name && id !== product.sku
        );
      }
      localStorage.setItem('patitas_paused_products', JSON.stringify(updatedPaused));
      window.dispatchEvent(new Event('storage'));
    } catch (err) {
      console.error('Error syncing paused products:', err);
    }

    // Sincronizar en Supabase
    updateProductInSupabase(product.id, { is_paused: newPausedState }).then(() => {
      window.dispatchEvent(new CustomEvent('patitas_products_updated'));
    });

    showToast(
      newPausedState
        ? `⏸️ "${product.name}" pausado (oculto en la tienda pública)`
        : `▶️ "${product.name}" reactivado (visible en la tienda pública)`
    );
  };

  // Guardar edición de producto
  const handleSaveEditProduct = (e) => {
    if (e) e.preventDefault();
    if (!editingProduct) return;

    const newPaused = Boolean(editingProduct.isPaused);
    try {
      const currentPaused = JSON.parse(localStorage.getItem('patitas_paused_products') || '[]');
      let updatedPaused;
      if (newPaused) {
        updatedPaused = Array.from(
          new Set([...currentPaused, editingProduct.id, editingProduct.name, editingProduct.sku])
        );
      } else {
        updatedPaused = currentPaused.filter(
          (id) => id !== editingProduct.id && id !== editingProduct.name && id !== editingProduct.sku
        );
      }
      localStorage.setItem('patitas_paused_products', JSON.stringify(updatedPaused));
      window.dispatchEvent(new Event('storage'));
    } catch (err) {
      console.error('Error syncing paused products on edit:', err);
    }

    const updatedStock = Number(editingProduct.stock) >= 0 ? Number(editingProduct.stock) : undefined;
    const updatedPrice = Number(editingProduct.salePrice) || undefined;
    const updatedCost = Number(editingProduct.unitCostNeto) || undefined;
    const updatedMin = Number(editingProduct.minStock) || 5;

    setInventory((prev) =>
      prev.map((item) =>
        item.id === editingProduct.id
          ? {
              ...item,
              name: editingProduct.name,
              brand: editingProduct.brand || item.brand,
              petType: editingProduct.petType || item.petType || 'perros',
              format: editingProduct.format || item.format,
              sku: editingProduct.sku || item.sku,
              salePrice: updatedPrice !== undefined ? updatedPrice : item.salePrice,
              unitCostNeto: updatedCost !== undefined ? updatedCost : item.unitCostNeto,
              stock: updatedStock !== undefined ? updatedStock : item.stock,
              minStock: updatedMin,
              category: editingProduct.category || item.category,
              isPaused: newPaused,
              status:
                (updatedStock !== undefined ? updatedStock : item.stock) <= updatedMin
                  ? 'stock_bajo'
                  : 'disponible',
            }
          : item
      )
    );

    // Sincronizar en Supabase
    updateProductInSupabase(editingProduct.id, {
      name: editingProduct.name,
      brand: editingProduct.brand,
      petType: editingProduct.petType,
      format: editingProduct.format,
      sku: editingProduct.sku,
      salePrice: updatedPrice,
      unitCostNeto: updatedCost,
      stock: updatedStock,
      minStock: updatedMin,
      category: editingProduct.category,
      isPaused: newPaused,
    }).then(() => {
      window.dispatchEvent(new CustomEvent('patitas_products_updated'));
    });

    showToast(`✓ Producto "${editingProduct.name}" actualizado exitosamente`);
    setEditingProduct(null);
  };

  // Confirmar eliminación de producto
  const handleConfirmDeleteProduct = () => {
    if (!deleteProductConfirm) return;
    const prod = deleteProductConfirm;
    setInventory((prev) => prev.filter((item) => item.id !== prod.id));

    try {
      const currentDeleted = JSON.parse(localStorage.getItem('patitas_deleted_products') || '[]');
      const updatedDeleted = Array.from(new Set([...currentDeleted, prod.id, prod.name, prod.sku]));
      localStorage.setItem('patitas_deleted_products', JSON.stringify(updatedDeleted));
      window.dispatchEvent(new Event('storage'));
    } catch (err) {
      console.error('Error syncing deleted products:', err);
    }

    // Sincronizar en Supabase
    deleteProductFromSupabase(prod.id).then(() => {
      window.dispatchEvent(new CustomEvent('patitas_products_updated'));
    });

    showToast(`🗑️ "${prod.name}" eliminado del catálogo`);
    setDeleteProductConfirm(null);
  };


  // Obtener análisis detallado de ventas y gráficos para un producto seleccionado
  const getProductSalesAnalytics = (product) => {
    if (!product) return null;

    const unitPrice = Number(product.salePrice) || 50000;
    const unitCost = Number(product.unitCostNeto) || 30000;

    // Generador determinista de métricas basado en el producto
    const seed = (product.name || 'PROD').split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);

    // 7 días recientes (Día por Día)
    const days7 = [
      { day: 'Jue 24', label: 'Jueves 24 Sep', units: Math.max(1, (seed * 3) % 4 + 1) },
      { day: 'Vie 25', label: 'Viernes 25 Sep', units: Math.max(1, (seed * 5) % 5 + 1) },
      { day: 'Sáb 26', label: 'Sábado 26 Sep', units: Math.max(2, (seed * 7) % 6 + 2) },
      { day: 'Dom 27', label: 'Domingo 27 Sep', units: Math.max(0, (seed * 2) % 3) },
      { day: 'Lun 28', label: 'Lunes 28 Sep', units: Math.max(1, (seed * 4) % 5 + 1) },
      { day: 'Mar 29', label: 'Martes 29 Sep', units: Math.max(2, (seed * 6) % 4 + 2) },
      { day: 'Hoy', label: 'Hoy 30 Sep', units: Math.max(1, (seed * 8) % 5 + 1) },
    ].map((d) => ({
      ...d,
      revenue: d.units * unitPrice,
      margin: d.units * (unitPrice - unitCost),
    }));

    // 30 días (Semanas)
    const weeks30 = [
      { day: 'Sem 1', label: '01 al 07 Sep', units: (seed % 4) + 12 },
      { day: 'Sem 2', label: '08 al 14 Sep', units: ((seed * 2) % 5) + 14 },
      { day: 'Sem 3', label: '15 al 21 Sep', units: ((seed * 3) % 6) + 16 },
      { day: 'Sem 4', label: '22 al 30 Sep', units: ((seed * 4) % 7) + 18 },
    ].map((w) => ({
      ...w,
      revenue: w.units * unitPrice,
      margin: w.units * (unitPrice - unitCost),
    }));

    // 12 meses históricos (Mes a Mes)
    const monthsNames = ['Oct', 'Nov', 'Dic', 'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep'];
    const monthsFull = [
      'Octubre 2025', 'Noviembre 2025', 'Diciembre 2025', 'Enero 2026', 'Febrero 2026',
      'Marzo 2026', 'Abril 2026', 'Mayo 2026', 'Junio 2026', 'Julio 2026', 'Agosto 2026', 'Septiembre 2026'
    ];
    const months12 = monthsNames.map((m, idx) => {
      const seasonalBoost = idx === 2 ? 8 : (idx === 11 || idx === 10 ? 6 : 0);
      const units = Math.max(10, ((seed + idx * 7) % 12) + 14 + seasonalBoost);
      return {
        day: m,
        label: monthsFull[idx],
        units,
        revenue: units * unitPrice,
        margin: units * (unitPrice - unitCost),
      };
    });

    const totalUnitsSold = months12.reduce((acc, curr) => acc + curr.units, 0);
    const totalRevenue = totalUnitsSold * unitPrice;
    const totalMargin = totalUnitsSold * (unitPrice - unitCost);
    const marginPercent = Math.round(((unitPrice - unitCost) / unitPrice) * 100);
    const monthlyAverageUnits = Math.round(totalUnitsSold / 12);
    const dailyAverageUnits = (totalUnitsSold / 365).toFixed(1);
    const stockCoverageDays = Math.max(3, Math.round(product.stock / Math.max(0.4, totalUnitsSold / 365)));

    // Pedidos recientes asociados
    const sampleRecentOrders = [
      {
        id: 'PED-9842',
        date: 'Hoy, 12:45',
        customer: 'Camila Silva',
        pet: 'Kira (Samoyedo)',
        units: 1,
        total: unitPrice,
        paymentMethod: 'Tarjeta',
        status: 'en_camino',
      },
      {
        id: 'PED-9838',
        date: 'Ayer, 16:30',
        customer: 'Valentina Morales',
        pet: 'Rocky (Golden)',
        units: 2,
        total: unitPrice * 2,
        paymentMethod: 'Transferencia BCI',
        status: 'entregado',
      },
      {
        id: 'PED-9829',
        date: '28 Sep, 14:20',
        customer: 'Fernanda Muñoz',
        pet: 'Luna (Border Collie)',
        units: 1,
        total: unitPrice,
        paymentMethod: 'Tarjeta',
        status: 'entregado',
      },
      {
        id: 'PED-9815',
        date: '25 Sep, 11:10',
        customer: 'Rodrigo Araya',
        pet: 'Thor (Pastor Alemán)',
        units: 1,
        total: unitPrice,
        paymentMethod: 'Web',
        status: 'entregado',
      },
      {
        id: 'PED-9799',
        date: '22 Sep, 18:05',
        customer: 'Constanza Vera',
        pet: 'Max (Labrador)',
        units: 2,
        total: unitPrice * 2,
        paymentMethod: 'Web',
        status: 'entregado',
      },
    ];

    return {
      days7,
      weeks30,
      months12,
      totalUnitsSold,
      totalRevenue,
      totalMargin,
      marginPercent,
      monthlyAverageUnits,
      dailyAverageUnits,
      stockCoverageDays,
      recentOrders: sampleRecentOrders,
    };
  };

  // Formateador de números con puntos de miles para Chile (ej: 25000 -> "25.000")
  const formatDigitsWithDots = (val) => {
    if (val === '' || val === null || val === undefined) return '';
    const num = typeof val === 'number' ? val : parseInt(String(val).replace(/\D/g, ''), 10);
    if (isNaN(num)) return '';
    return new Intl.NumberFormat('es-CL').format(num);
  };

  // Handlers for Dispatch Zones Modal
  const handleOpenCreateZoneModal = () => {
    const nextIdx = dispatchZones.length;
    const lastZone = dispatchZones[dispatchZones.length - 1];
    const prevMax = lastZone ? (lastZone.radiusMaxKm || 0) : 0;
    const suggestedMax = prevMax > 0 ? prevMax + 10 : 5;

    setZoneModalForm({
      id: null,
      name: `Zona ${nextIdx + 1}`,
      radiusMaxKm: suggestedMax,
      baseFee: 1990,
      hasFreeShipping: true,
      freeThreshold: 25000,
    });
    setIsZoneModalOpen(true);
  };

  const handleOpenEditZoneModal = (zone) => {
    setZoneModalForm({
      id: zone.id,
      name: zone.name || 'Zona',
      radiusMaxKm: zone.radiusMaxKm || 5,
      baseFee: zone.baseFee || 0,
      hasFreeShipping: (zone.freeThreshold || 0) > 0,
      freeThreshold: zone.freeThreshold || 25000,
    });
    setIsZoneModalOpen(true);
  };

  const handleSaveZoneModal = (e) => {
    e.preventDefault();
    const ZONE_PALETTE = ['#10B981', '#0E8388', '#F59E0B', '#8B5CF6', '#EC4899', '#3B82F6'];
    const radiusMax = Math.max(1, parseFloat(zoneModalForm.radiusMaxKm) || 1);
    const fee = zoneModalForm.baseFee === '' ? 0 : Math.max(0, parseInt(zoneModalForm.baseFee, 10) || 0);
    const freeThresh = zoneModalForm.hasFreeShipping
      ? (zoneModalForm.freeThreshold === '' ? 0 : Math.max(0, parseInt(zoneModalForm.freeThreshold, 10) || 0))
      : 0;

    if (zoneModalForm.id) {
      // Editar zona existente
      setDispatchZones((prev) =>
        prev.map((z) =>
          z.id === zoneModalForm.id
            ? {
                ...z,
                name: (zoneModalForm.name || '').trim() || z.name,
                radiusMaxKm: radiusMax,
                badgeText: `Hasta ${radiusMax} km`,
                baseFee: fee,
                freeThreshold: freeThresh,
              }
            : z
        )
      );
      showToast('Zona de despacho actualizada correctamente.');
    } else {
      // Crear nueva zona
      const nextIdx = dispatchZones.length;
      const newId = `ZONE-${Date.now()}`;
      const newZone = {
        id: newId,
        name: (zoneModalForm.name || '').trim() || `Zona ${nextIdx + 1}`,
        coverage: '',
        radiusMinKm: 0,
        radiusMaxKm: radiusMax,
        color: ZONE_PALETTE[nextIdx % ZONE_PALETTE.length],
        badgeText: `Hasta ${radiusMax} km`,
        baseFee: fee,
        freeThreshold: freeThresh,
        deliveryTime: 'Mismo día / 24 hrs',
        active: true,
      };
      setDispatchZones((prev) => [...prev, newZone]);
      setSelectedConfigZoneId(newId);
      showToast(`¡${newZone.name} creada correctamente!`);
    }

    setIsZoneModalOpen(false);
  };

  const handleDeleteZone = (idToDelete) => {
    setDispatchZones((prev) => {
      const filtered = prev.filter((z) => z.id !== idToDelete);
      if (selectedConfigZoneId === idToDelete) {
        setSelectedConfigZoneId(filtered.length > 0 ? filtered[0].id : null);
      }
      return filtered;
    });
    showToast('Zona eliminada.');
  };

  // Vehículo principal y métricas de consumo de combustible
  const activeVehicle = useMemo(() => {
    return vehicles.find((v) => v.isDefault) || vehicles[0] || null;
  }, [vehicles]);

  const activeVehicleCostPerKm = useMemo(() => {
    if (!activeVehicle || !activeVehicle.efficiencyKmPerL || activeVehicle.efficiencyKmPerL <= 0) return 0;
    const price = Number(activeVehicle.fuelPricePerL) || 0;
    const eff = Number(activeVehicle.efficiencyKmPerL) || 1;
    return Math.round(price / eff);
  }, [activeVehicle]);

  const handleOpenCreateVehicleModal = () => {
    setVehicleModalForm({
      id: null,
      brand: '',
      plate: '',
      efficiencyKmPerL: 12,
      fuelPricePerL: 1320,
    });
    setIsVehicleModalOpen(true);
  };

  const handleOpenEditVehicleModal = (veh) => {
    setVehicleModalForm({
      id: veh.id,
      brand: veh.brand || veh.name || '',
      plate: veh.plate || '',
      efficiencyKmPerL: veh.efficiencyKmPerL || 12,
      fuelPricePerL: veh.fuelPricePerL || 1320,
    });
    setIsVehicleModalOpen(true);
  };

  const handleSaveVehicleModal = (e) => {
    e.preventDefault();
    const eff = Math.max(0.1, parseFloat(vehicleModalForm.efficiencyKmPerL) || 1);
    const price = vehicleModalForm.fuelPricePerL === '' ? 0 : Math.max(0, parseInt(vehicleModalForm.fuelPricePerL, 10) || 0);

    if (vehicleModalForm.id) {
      setVehicles((prev) =>
        prev.map((v) =>
          v.id === vehicleModalForm.id
            ? {
                ...v,
                brand: (vehicleModalForm.brand || '').trim() || v.brand || 'Auto de Reparto',
                plate: (vehicleModalForm.plate || '').trim().toUpperCase(),
                efficiencyKmPerL: eff,
                fuelPricePerL: price,
              }
            : v
        )
      );
      showToast('Auto actualizado correctamente.');
    } else {
      const newVeh = {
        id: `VEH-${Date.now()}`,
        brand: (vehicleModalForm.brand || '').trim() || `Auto ${vehicles.length + 1}`,
        plate: (vehicleModalForm.plate || '').trim().toUpperCase(),
        efficiencyKmPerL: eff,
        fuelPricePerL: price,
      };
      setVehicles((prev) => [...prev, newVeh]);
      showToast(`¡${newVeh.brand} agregado correctamente!`);
    }
    setIsVehicleModalOpen(false);
  };

  const handleDeleteVehicle = (idToDelete) => {
    setVehicles((prev) => prev.filter((v) => v.id !== idToDelete));
    showToast('Auto eliminado.');
  };

  // Calculations for Financial Dashboard
  const financialMetrics = useMemo(() => {
    const liveSalesFromOrders = orders.reduce((acc, o) => acc + (o.total || 0), 0);
    const totalSales = liveSalesFromOrders;

    // 1. Desglose de Ventas por Canal (Web vs Manual)
    const webOrders = orders.filter((o) => (o.channel || 'web') === 'web');
    const manualOrders = orders.filter((o) => o.channel === 'manual');

    const webSales = webOrders.reduce((sum, o) => sum + (o.total || 0), 0);
    const manualSales = manualOrders.reduce((sum, o) => sum + (o.total || 0), 0);

    const salesNeto = Math.round(totalSales / 1.19);
    const ivaDebito = totalSales - salesNeto;

    const webSalesNeto = Math.round(webSales / 1.19);
    const webIvaDebito = webSales - webSalesNeto;

    const manualSalesNeto = Math.round(manualSales / 1.19);
    const manualIvaDebito = manualSales - manualSalesNeto;

    // Desglose de ingresos por método de pago
    const mpSales = Math.round(totalSales * 0.72); // 72% de ventas con Mercado Pago / Tarjetas
    const transferSales = Math.round(totalSales * 0.22); // 22% por Transferencia Bancaria Directa
    const cashSales = totalSales - mpSales - transferSales; // 6% Efectivo
    const mpTxCount = mpSales > 0 ? Math.max(1, Math.round(mpSales / 42000)) : 0; // ~83 transacciones

    // Costo de Mercadería Vendida (COGS - 58% promedio según facturas)
    const estimatedCOGS = Math.round(totalSales * 0.58);
    const grossMargin = totalSales - estimatedCOGS;
    const grossMarginPercent = totalSales > 0 ? ((grossMargin / totalSales) * 100).toFixed(1) : '0.0';

    // Cálculo dinámico de comisiones Mercado Pago
    const mpPercentFeeNeto = Math.round(mpSales * (mercadoPagoConfig.commissionRatePercent / 100));
    const mpFixedFeeNeto = Math.round(mpTxCount * (mercadoPagoConfig.fixedFeeCLP || 0));
    const mpTotalNeto = mpPercentFeeNeto + mpFixedFeeNeto;
    const mpTotalIva = Math.round(mpTotalNeto * (mercadoPagoConfig.ivaPercent / 100));
    const mpTotalCostWithIva = mpTotalNeto + mpTotalIva;
    const mpEffectiveRate = mpSales > 0 ? ((mpTotalCostWithIva / mpSales) * 100).toFixed(2) : '0.00';
    const mpNetRevenueReceived = mpSales - mpTotalCostWithIva;

    // 2. Facturas de Proveedores (Mercadería / Stock) & IVA Crédito Fiscal
    const invoicesNeto = invoices.reduce((sum, inv) => sum + (inv.totalNeto || 0), 0);
    const invoicesIvaCredito = invoices.reduce(
      (sum, inv) => sum + (inv.iva || Math.round((inv.totalNeto || 0) * 0.19)),
      0
    );
    const invoicesTotalBruto = invoices.reduce(
      (sum, inv) => sum + (inv.totalBruto || (inv.totalNeto || 0) + (inv.iva || 0)),
      0
    );
    const invoicesCount = invoices.length;
    const invoicesTotalUnits = invoices.reduce(
      (sum, inv) => sum + (inv.itemsCount || inv.quantityReceived || 0),
      0
    );

    // 3. Desglose de Gastos Operacionales Registrados
    const notariaExpenses = expenses
      .filter((e) => e.category === 'notaria' || e.category === 'legal')
      .reduce((acc, e) => acc + e.amount, 0);

    const combustibleExpenses = expenses
      .filter((e) => e.category === 'combustible')
      .reduce((acc, e) => acc + e.amount, 0);

    const packagingExpenses = expenses
      .filter((e) => e.category === 'packaging')
      .reduce((acc, e) => acc + e.amount, 0);

    const fixedExpenses = expenses
      .filter((e) => e.category === 'fijo')
      .reduce((acc, e) => acc + e.amount, 0);

    const maintenanceExpenses = expenses
      .filter((e) => e.category === 'mantenimiento')
      .reduce((acc, e) => acc + e.amount, 0);

    const servicesExpenses = expenses
      .filter((e) => e.category === 'servicios')
      .reduce((acc, e) => acc + e.amount, 0);

    const otherExpenses = expenses
      .filter(
        (e) =>
          !['combustible', 'packaging', 'fijo', 'mantenimiento', 'servicios', 'notaria', 'legal'].includes(
            e.category
          )
      )
      .reduce((acc, e) => acc + e.amount, 0);

    const totalRegisteredExpenses = expenses.reduce((acc, e) => acc + e.amount, 0);

    // Gastos que tienen factura y generan IVA Crédito Fiscal
    const expensesIvaCredito = expenses.reduce((sum, e) => {
      if (
        e.hasIvaCredit ||
        e.documentType === 'factura' ||
        (e.documentNumber && e.documentNumber.startsWith('FAC'))
      ) {
        const neto = Math.round(e.amount / 1.19);
        return sum + (e.amount - neto);
      }
      return sum;
    }, 0);

    const expensesNetoWithFactura = expenses.reduce((sum, e) => {
      if (
        e.hasIvaCredit ||
        e.documentType === 'factura' ||
        (e.documentNumber && e.documentNumber.startsWith('FAC'))
      ) {
        return sum + Math.round(e.amount / 1.19);
      }
      return sum;
    }, 0);

    const expensesSinCredito = totalRegisteredExpenses - (expensesNetoWithFactura + expensesIvaCredito);

    // Comisiones convenios veterinarios y adiestradores
    const partnerCommissions = totalSales > 0 ? Math.round(totalSales * 0.038) : 0;

    // Gastos Operacionales Totales & Utilidad Neta Real
    const totalOperatingExpenses = totalRegisteredExpenses + mpTotalCostWithIva + partnerCommissions;
    const netProfit = grossMargin - totalOperatingExpenses;
    const netProfitPercent = totalSales > 0 ? ((netProfit / totalSales) * 100).toFixed(1) : '0.0';

    // 4. BALANZA FISCAL: SEMÁFORO DEL IVA (F29 SII)
    const totalIvaCredito = invoicesIvaCredito + expensesIvaCredito;
    const ivaBalance = ivaDebito - totalIvaCredito;
    const ivaStatus = ivaBalance > 0 ? 'a_pagar' : 'remanente';
    const ivaCoveredPercent =
      ivaDebito > 0 ? Math.min(100, Math.round((totalIvaCredito / ivaDebito) * 100)) : 100;

    // Valorización de Inventario
    const totalInventoryCost = inventory.reduce(
      (acc, p) => acc + (p.unitCostNeto || 0) * (p.stock || 0),
      0
    );
    const totalInventoryPVP = inventory.reduce(
      (acc, p) => acc + (p.salePrice || 0) * (p.stock || 0),
      0
    );

    return {
      totalSales,
      salesNeto,
      ivaDebito,
      webOrdersCount: webOrders.length,
      webSales,
      webSalesNeto,
      webIvaDebito,
      manualOrdersCount: manualOrders.length,
      manualSales,
      manualSalesNeto,
      manualIvaDebito,
      mpSales,
      transferSales,
      cashSales,
      mpTxCount,
      estimatedCOGS,
      grossMargin,
      grossMarginPercent,
      mpPercentFeeNeto,
      mpFixedFeeNeto,
      mpTotalCostWithIva,
      mpEffectiveRate,
      mpNetRevenueReceived,
      invoicesNeto,
      invoicesIvaCredito,
      invoicesTotalBruto,
      invoicesCount,
      invoicesTotalUnits,
      notariaExpenses,
      combustibleExpenses,
      packagingExpenses,
      fixedExpenses,
      maintenanceExpenses,
      servicesExpenses,
      otherExpenses,
      totalRegisteredExpenses,
      expensesIvaCredito,
      expensesNetoWithFactura,
      expensesSinCredito,
      totalIvaCredito,
      ivaBalance,
      ivaStatus,
      ivaCoveredPercent,
      partnerCommissions,
      totalOperatingExpenses,
      netProfit,
      netProfitPercent,
      totalInventoryCost,
      totalInventoryPVP,
    };
  }, [orders, inventory, expenses, invoices, mercadoPagoConfig]);

  // Dynamic values depending on selected period: 'dia' | 'semana' | 'mes'
  const salesPeriodData = useMemo(() => {
    const todayOrdersTotal = todayOrders.reduce((acc, o) => acc + o.total, 0) || 150460;

    const todayAmount = todayOrdersTotal;
    const weekAmount = 2875000;
    const monthAmount = financialMetrics.totalSales > 1000000 ? financialMetrics.totalSales : 4850000;

    return {
      dia: {
        title: 'Ventas de Hoy',
        amount: todayAmount,
        growth: '+14.2% vs ayer',
        detail: `${todayOrders.length} ${todayOrders.length === 1 ? 'pedido hoy' : 'pedidos hoy'}`,
        periodLabel: 'Día',
      },
      semana: {
        title: 'Ventas de la Semana',
        amount: weekAmount,
        growth: '+15.8% vs sem. anterior',
        detail: '38 pedidos (7 días)',
        periodLabel: 'Semana',
      },
      mes: {
        title: 'Ventas del Mes Actual',
        amount: monthAmount,
        growth: '+18.4% vs mes anterior',
        detail: 'Mes en curso',
        periodLabel: 'Mes Actual',
      },
    };
  }, [todayOrders, financialMetrics]);

  // Dynamic values depending on selected period for orders: 'dia' | 'semana' | 'mes'
  const ordersPeriodData = useMemo(() => {
    const enCaminoCount = todayOrders.filter((o) => o.status === 'en_camino').length;
    const enPrepCount = todayOrders.filter((o) => o.status === 'en_preparacion').length;
    const statusText = `${enPrepCount} en prep. • ${enCaminoCount} en camino`;

    return {
      dia: {
        title: 'Pedidos de Hoy',
        count: `${todayOrders.length} ${todayOrders.length === 1 ? 'Pedido' : 'Pedidos'}`,
        statusText,
        detail: 'Despachos del día',
        periodLabel: 'Día',
      },
      semana: {
        title: 'Pedidos de la Semana',
        count: '38 Pedidos',
        statusText: '34 entregados • 4 en ruta',
        detail: '+12.5% vs sem. ant.',
        periodLabel: 'Semana',
      },
      mes: {
        title: 'Pedidos del Mes Actual',
        count: '72 Pedidos',
        statusText: '68 completados • 4 en proc.',
        detail: 'Mes en curso',
        periodLabel: 'Mes Actual',
      },
    };
  }, [todayOrders]);

  // Dynamic values depending on selected period for customers: 'dia' | 'semana' | 'mes'
  const customersPeriodData = useMemo(() => {
    return {
      dia: {
        title: 'Clientes de Hoy',
        count: '2 Nuevos',
        statusText: '2 Mascotas inscritas 🐾',
        detail: '100% perfil completo',
        periodLabel: 'Día',
      },
      semana: {
        title: 'Clientes de la Semana',
        count: '14 Nuevos',
        statusText: '14 Mascotas activas 🐾',
        detail: '+22.5% vs sem. ant.',
        periodLabel: 'Semana',
      },
      mes: {
        title: 'Clientes del Mes Actual',
        count: `${customers.length > 5 ? customers.length : 48} Tutores`,
        statusText: `${customers.length} con ficha activa 🐾`,
        detail: '+31.4% en Agosto',
        periodLabel: 'Mes Actual',
      },
    };
  }, [customers]);

  // Chart, KPIs and Pet breakdown synced with global filter: 'dia' | 'semana' | 'mes'
  const dashboardAnalyticsData = useMemo(() => {
    if (globalTimeFilter === 'dia') {
      return {
        chartTitle: 'Ventas de Hoy',
        chartSubtitle: 'Ingresos y pedidos registrados en la jornada',
        chartBadge: 'Total Hoy: $620.000 (5 pedidos)',
        bars: [
          { day: '09:00', val: 40, amount: '$45.000' },
          { day: '11:00', val: 75, amount: '$125.000' },
          { day: '13:00', val: 100, amount: '$180.000' },
          { day: '15:00', val: 55, amount: '$90.000' },
          { day: '17:00', val: 70, amount: '$110.000' },
          { day: '19:00', val: 45, amount: '$70.000' },
          { day: '21:00', val: 20, amount: '$0' },
        ],
        footerTicket: '$62.000',
        footerOnTime: '100% puntual',
        footerRedemptions: '12 canjes hoy',
        perrosPercent: 68,
        perrosAmount: '$421.600',
        gatosPercent: 32,
        gatosAmount: '$198.400',
      };
    }

    if (globalTimeFilter === 'semana') {
      return {
        chartTitle: 'Ventas Semanales',
        chartSubtitle: 'Ingresos diarios acumulados de los últimos 7 días',
        chartBadge: 'Promedio: $485.000 / día',
        bars: [
          { day: 'Mié 12', val: 65, amount: '$315.000' },
          { day: 'Jue 13', val: 80, amount: '$420.000' },
          { day: 'Vie 14', val: 95, amount: '$590.000' },
          { day: 'Sáb 15', val: 70, amount: '$380.000' },
          { day: 'Dom 16', val: 45, amount: '$240.000' },
          { day: 'Lun 17', val: 85, amount: '$510.000' },
          { day: 'Hoy 18', val: 100, amount: '$620.000' },
        ],
        footerTicket: '$63.280',
        footerOnTime: '98.5% a tiempo',
        footerRedemptions: '70 canjes',
        perrosPercent: 65,
        perrosAmount: '$1.868.750',
        gatosPercent: 35,
        gatosAmount: '$1.006.250',
      };
    }

    // Default: 'mes'
    return {
      chartTitle: 'Ventas Mensuales',
      chartSubtitle: 'Ingresos consolidados por semana del mes en curso',
      chartBadge: 'Total Mes: $4.850.000',
      bars: [
        { day: 'Sem 1 (1-7)', val: 60, amount: '$950.000' },
        { day: 'Sem 2 (8-14)', val: 80, amount: '$1.250.000' },
        { day: 'Sem 3 (15-21)', val: 100, amount: '$1.550.000' },
        { day: 'Sem 4 (Proy.)', val: 70, amount: '$1.100.000' },
      ],
      footerTicket: '$67.360',
      footerOnTime: '99.1% cumplimiento',
      footerRedemptions: '142 canjes',
      perrosPercent: 65,
      perrosAmount: '$3.150.000',
      gatosPercent: 35,
      gatosAmount: '$1.700.000',
    };
  }, [globalTimeFilter]);

  // Zona de despacho calculada dinámicamente en base a KM
  const simulatedZoneResult = useMemo(() => {
    if (!dispatchZones || dispatchZones.length === 0) {
      return { baseFee: 0, name: 'Sin zona configurada', freeThreshold: 0, radiusMaxKm: 0 };
    }
    const d = parseFloat(simulatedDistanceKm) || 0;
    const sorted = [...dispatchZones].sort((a, b) => (a.radiusMaxKm || 0) - (b.radiusMaxKm || 0));
    const found = sorted.find((z) => d <= (z.radiusMaxKm ?? 999)) || sorted[sorted.length - 1];
    return found || { baseFee: 0, name: 'Sin zona configurada', freeThreshold: 0, radiusMaxKm: 0 };
  }, [simulatedDistanceKm, dispatchZones]);

  // =========================================================================
  // VIEW 1: LIGHT & WARM AUTHENTICATION SCREEN IF NOT AUTHENTICATED
  // =========================================================================
  if (!isAdminAuthenticated) {
    return (
      <div className="min-h-screen bg-[#FAF9F6] text-slate-900 flex items-center justify-center p-4 relative overflow-hidden font-sans">
        {/* Soft Pastel Background Blobs */}
        <div className="absolute top-1/4 -left-20 w-96 h-96 rounded-full bg-[#0E8388]/10 blur-[100px] pointer-events-none" />
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 rounded-full bg-[#10B981]/15 blur-[100px] pointer-events-none" />
        <div className="absolute top-1/3 right-1/4 w-80 h-80 rounded-full bg-[#C86D39]/10 blur-[90px] pointer-events-none" />

        <div className="max-w-md w-full relative z-10">
          <div className="mb-6 flex items-center justify-between">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-[#0E8388] transition-colors bg-white border border-slate-200/80 px-3.5 py-1.5 rounded-full shadow-xs backdrop-blur-md"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-[#0E8388]" />
              <span>Volver a la Tienda</span>
            </Link>

            <span className="text-[10px] font-black text-[#0E8388] bg-[#0E8388]/10 border border-[#0E8388]/20 px-3 py-1 rounded-full uppercase tracking-wider">
              Acceso Restringido
            </span>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-3xl p-8 sm:p-10 shadow-2xl space-y-6">
            <div className="text-center space-y-3">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#0A3E40] via-[#0E8388] to-[#10B981] mx-auto flex items-center justify-center shadow-lg shadow-[#0E8388]/20 border-2 border-white">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Panel de Administración
              </h1>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                Control central de operaciones, pedidos, clientes CRM, convenios y finanzas de Patitas del Sur.
              </p>
            </div>

            {authError && (
              <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-red-500" />
                <span>{authError}</span>
              </div>
            )}

            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Correo de Administrador
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    placeholder="admin@patitasdelsur.cl"
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:outline-none focus:bg-white focus:border-[#0E8388] transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Contraseña de Seguridad
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:outline-none focus:bg-white focus:border-[#0E8388] transition-colors"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#0E8388] to-[#10B981] text-white font-extrabold text-xs uppercase tracking-wider shadow-lg shadow-[#0E8388]/25 hover:opacity-95 transition-all cursor-pointer active:scale-95 mt-2"
              >
                Iniciar Sesión Administrador
              </button>
            </form>

            <div className="pt-2 border-t border-slate-100 text-center">
              <button
                type="button"
                onClick={handleQuickAdminLogin}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-50 hover:bg-slate-100 text-[#0E8388] border border-slate-200 font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
              >
                <Sparkles className="w-4 h-4 text-[#10B981]" />
                <span>Acceso Rápido 1-Clic (Demo Modo)</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // VIEW 2: LIGHT & PASTEL ADMIN PORTAL WITH SIDEBAR MENU
  // =========================================================================
  const pendingOrdersCount = orders.filter((o) => o.status === 'en_preparacion' || o.status === 'en_camino').length;
  const lowStockCount = inventory.filter((p) => p.stock <= p.minStock).length;

  return (
    <div className="h-screen bg-[#FAF9F6] text-slate-900 flex font-sans antialiased overflow-hidden">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-white border border-emerald-500/40 text-slate-900 px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 text-xs font-bold animate-in fade-in slide-in-from-bottom-3 duration-300">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ======================================================= */}
      {/* LEFT SIDEBAR NAVIGATION MENU (Hidden on mobile PWA, visible on desktop md+) */}
      {/* ======================================================= */}
      <aside className="hidden md:flex w-64 lg:w-72 bg-white border-r border-slate-200/80 flex-col justify-between shrink-0 sticky top-0 h-screen select-none z-40 shadow-xs">
        
        {/* Top Brand Header */}
        <div>
          <div className="p-6 border-b border-slate-100 flex items-center gap-3.5 bg-slate-50/50">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#0A3E40] via-[#0E8388] to-[#10B981] flex items-center justify-center text-white shadow-md shadow-[#0E8388]/20 border border-white shrink-0">
              <Shield className="w-6 h-6" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-black text-sm text-slate-900 tracking-tight">Patitas del Sur</span>
                <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
                  PRO
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-semibold truncate">Panel de Control General</p>
            </div>
          </div>

          {/* Navigation Links List */}
          <nav className="p-4 space-y-1.5">
            {/* 1. Dashboard */}
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-extrabold transition-all cursor-pointer ${
                activeTab === 'dashboard'
                  ? 'bg-gradient-to-r from-[#0E8388] to-[#10B981] text-white shadow-md shadow-[#0E8388]/25'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
              }`}
            >
              <div className="flex items-center gap-3">
                <LayoutDashboard className="w-4 h-4" />
                <span>Dashboard</span>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                activeTab === 'dashboard' ? 'bg-black/20 text-white' : 'bg-emerald-50 text-emerald-700'
              }`}>
                En vivo
              </span>
            </button>

            {/* 2. Pedidos */}
            <button
              onClick={() => setActiveTab('pedidos')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-extrabold transition-all cursor-pointer ${
                activeTab === 'pedidos'
                  ? 'bg-gradient-to-r from-[#0E8388] to-[#10B981] text-white shadow-md shadow-[#0E8388]/25'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
              }`}
            >
              <div className="flex items-center gap-3">
                <ShoppingBag className="w-4 h-4" />
                <span>Pedidos</span>
              </div>
              {pendingOrdersCount > 0 && (
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 animate-pulse">
                  {pendingOrdersCount}
                </span>
              )}
            </button>

            {/* 3. Clientes (CRM) */}
            <button
              onClick={() => setActiveTab('clientes')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-extrabold transition-all cursor-pointer ${
                activeTab === 'clientes'
                  ? 'bg-gradient-to-r from-[#0E8388] to-[#10B981] text-white shadow-md shadow-[#0E8388]/25'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
              }`}
            >
              <div className="flex items-center gap-3">
                <Users className="w-4 h-4" />
                <span>Clientes (CRM)</span>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                activeTab === 'clientes' ? 'bg-black/20 text-white' : 'bg-slate-100 text-slate-700'
              }`}>
                {customers.length}
              </span>
            </button>

            {/* 4. Convenios */}
            <button
              onClick={() => setActiveTab('convenios')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-extrabold transition-all cursor-pointer ${
                activeTab === 'convenios'
                  ? 'bg-gradient-to-r from-[#0E8388] to-[#10B981] text-white shadow-md shadow-[#0E8388]/25'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
              }`}
            >
              <div className="flex items-center gap-3">
                <Handshake className="w-4 h-4" />
                <span>Convenios</span>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                activeTab === 'convenios' ? 'bg-black/20 text-white' : 'bg-slate-100 text-slate-700'
              }`}>
                {convenios.filter((c) => c.active).length} Activos
              </span>
            </button>

            {/* 5. Inventario */}
            <button
              onClick={() => setActiveTab('inventario')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-extrabold transition-all cursor-pointer ${
                activeTab === 'inventario'
                  ? 'bg-gradient-to-r from-[#0E8388] to-[#10B981] text-white shadow-md shadow-[#0E8388]/25'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
              }`}
            >
              <div className="flex items-center gap-3">
                <Package className="w-4 h-4" />
                <span>Inventario & Bodega</span>
              </div>
              {lowStockCount > 0 && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 border border-rose-200">
                  {lowStockCount} bajo
                </span>
              )}
            </button>

            {/* 6. Finanzas */}
            <button
              onClick={() => setActiveTab('finanzas')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-extrabold transition-all cursor-pointer ${
                activeTab === 'finanzas'
                  ? 'bg-gradient-to-r from-[#0E8388] to-[#10B981] text-white shadow-md shadow-[#0E8388]/25'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
              }`}
            >
              <div className="flex items-center gap-3">
                <DollarSign className="w-4 h-4" />
                <span>Finanzas</span>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                activeTab === 'finanzas' ? 'bg-black/20 text-white' : 'bg-emerald-50 text-emerald-700'
              }`}>
                Balances
              </span>
            </button>

            {/* 7. Despachos */}
            <button
              onClick={() => setActiveTab('despachos')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-extrabold transition-all cursor-pointer ${
                activeTab === 'despachos'
                  ? 'bg-gradient-to-r from-[#0E8388] to-[#10B981] text-white shadow-md shadow-[#0E8388]/25'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
              }`}
            >
              <div className="flex items-center gap-3">
                <Truck className="w-4 h-4" />
                <span>Despachos</span>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                activeTab === 'despachos' ? 'bg-black/20 text-white' : 'bg-slate-100 text-slate-700'
              }`}>
                {dispatchZones.length} Zonas
              </span>
            </button>
          </nav>
        </div>

        {/* Bottom User Profile & Logout */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 space-y-3">
          <Link
            to="/"
            target="_blank"
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200 transition-colors shadow-xs"
          >
            <ExternalLink className="w-3.5 h-3.5 text-[#0E8388]" />
            <span>Ver Tienda Pública</span>
          </Link>

          <div className="flex items-center justify-between px-2 pt-1">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-7 h-7 rounded-full bg-[#0E8388]/15 border border-[#0E8388]/30 flex items-center justify-center text-[#0E8388] font-bold text-xs">
                A
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-slate-800 truncate">Admin Patitas</div>
                <div className="text-[10px] text-emerald-600 flex items-center gap-1 font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                  <span>En línea</span>
                </div>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
              title="Cerrar la sesión de Administrador"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* ======================================================= */}
      {/* RIGHT COLUMN: FIXED UNIFIED NAVBAR + SCROLLABLE TABS    */}
      {/* ======================================================= */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden bg-[#F8FAFC]">
        {/* FIXED UNIFIED TOP NAVBAR (Attached seamlessly to sidebar) */}
        <header className="sticky top-0 z-30 shrink-0 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 md:px-8 lg:px-10 py-3 sm:py-3.5 flex flex-row items-center justify-between gap-3 shadow-[0_1px_3px_rgba(0,0,0,0.02)] min-h-[58px] sm:min-h-[72px]">
          {/* Dynamic Left: Title & Subtitle based on activeTab */}
          <div className="min-w-0 space-y-0.5">
            {activeTab === 'dashboard' && (
              <>
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                    <span className="md:hidden">Hola, {user?.name ? user.name.split(' ')[0] : 'Camila'} 👋</span>
                    <span className="hidden md:inline">{getDynamicGreeting(user, adminEmail)}</span>
                  </h1>
                </div>
                <p className="hidden md:flex text-xs sm:text-sm text-[#0E8388] font-bold items-center gap-1.5 leading-relaxed truncate">
                  <Heart className="w-3.5 h-3.5 text-[#C86D39] fill-[#C86D39] shrink-0" />
                  <span>"{dailyQuote.quote}"</span>
                </p>
              </>
            )}

            {activeTab === 'pedidos' && (
              <h1 className="text-lg sm:text-2xl font-black text-slate-900 tracking-tight leading-snug line-clamp-2">
                Gestión de Pedidos & Envíos 📦
              </h1>
            )}

            {activeTab === 'clientes' && (
              <>
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                  <span>CRM de Clientes & Mascotas</span>
                  <span className="text-xl">🐶🐱</span>
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 font-medium truncate">
                  Base de datos de tutores, historial de pedidos y fichas nutricionales completas.
                </p>
              </>
            )}

            {activeTab === 'convenios' && (
              <>
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                  <span>Convenios & Alianzas Locales</span>
                  <span className="text-xl">🤝</span>
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 font-medium truncate">
                  Alianzas comerciales con clínicas veterinarias, adiestradores y guarderías del sur.
                </p>
              </>
            )}

            {activeTab === 'inventario' && (
              <>
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                  <span>Control de Stock & Bodega</span>
                  <span className="text-xl">📦</span>
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 font-medium truncate">
                  Existencias físicas en bodega, alertas de reposición y márgenes de ganancia.
                </p>
              </>
            )}

            {activeTab === 'finanzas' && (
              <>
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                  <span>Control Financiero & Flujo de Caja</span>
                  <span className="text-xl">💵</span>
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 font-medium truncate">
                  Facturas de proveedores, ventas web vs manuales, gastos operacionales y balance IVA F29.
                </p>
              </>
            )}

            {activeTab === 'despachos' && (
              <>
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                  <span>Configuración Despachos</span>
                  <span className="text-xl">🚚</span>
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 font-medium truncate">
                  {dispatchSubTab === 'zonas'
                    ? 'Ajusta precios y distancias de entrega desde la Bodega Central en Puerto Varas.'
                    : 'Administra vehículos de reparto, rendimiento (km/L) y costo real de combustible.'}
                </p>
              </>
            )}
          </div>

          {/* Dynamic Right: Action Buttons & Contextual Controls based on activeTab */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">

            {activeTab === 'dashboard' && (
              <button
                onClick={() => showToast('Métricas actualizadas en tiempo real')}
                className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200/90 transition-colors cursor-pointer shadow-2xs active:scale-95 flex items-center justify-center"
                title="Actualizar datos"
              >
                <RefreshCw className="w-4 h-4 text-[#0E8388]" />
              </button>
            )}

            <button
              type="button"
              onClick={handleLogout}
              className="md:hidden p-2 rounded-xl bg-slate-50 hover:bg-red-50 text-slate-400 hover:text-red-600 border border-slate-200/90 transition-colors cursor-pointer shadow-2xs active:scale-95 flex items-center justify-center"
              title="Cerrar la sesión de Administrador"
            >
              <LogOut className="w-4 h-4" />
            </button>

            {activeTab === 'dashboard' && (
              <span className="hidden sm:flex text-xs font-bold px-3.5 py-1.5 rounded-full bg-slate-50 border border-slate-200 text-slate-700 items-center gap-2 shadow-xs">
                <Calendar className="w-3.5 h-3.5 text-[#0E8388]" />
                <span>
                  {new Intl.DateTimeFormat('es-CL', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  }).format(new Date()).replace(/^\w/, (c) => c.toUpperCase())}
                </span>
              </span>
            )}



            {activeTab === 'clientes' && (
              <span className="text-xs font-extrabold px-3.5 py-1.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200 shadow-xs">
                {customers.length} Tutores Activos
              </span>
            )}

            {activeTab === 'convenios' && (
              <button
                onClick={() => setIsAddAgreementModalOpen(true)}
                className="px-4 sm:px-5 py-2 rounded-2xl bg-gradient-to-r from-[#0E8388] to-[#10B981] text-white text-xs font-extrabold shadow-sm hover:shadow-md transition-all flex items-center gap-2 cursor-pointer active:scale-95"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>Crear Nuevo Convenio</span>
              </button>
            )}

            {activeTab === 'inventario' && (
              <>
                <div className="inline-flex p-1 bg-slate-100/90 rounded-2xl border border-slate-200">
                  <button
                    type="button"
                    onClick={() => setInventoryViewMode('grid')}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      inventoryViewMode === 'grid'
                        ? 'bg-white text-[#0E8388] shadow-xs'
                        : 'text-slate-500 hover:text-slate-900'
                    }`}
                    title="Vista en Tarjetas"
                  >
                    <LayoutGrid className="w-3.5 h-3.5" />
                    <span>Tarjetas</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setInventoryViewMode('list')}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      inventoryViewMode === 'list'
                        ? 'bg-white text-[#0E8388] shadow-xs'
                        : 'text-slate-500 hover:text-slate-900'
                    }`}
                    title="Vista en Tabla"
                  >
                    <List className="w-3.5 h-3.5" />
                    <span>Lista</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const firstProd = inventory[0];
                    if (firstProd) {
                      setStockAdjustModal({
                        prod: firstProd,
                        type: 'sumar',
                        amount: 1,
                        reason: 'Ajuste manual / Conteo físico',
                      });
                    }
                  }}
                  className="px-4 sm:px-5 py-2 rounded-2xl bg-gradient-to-r from-[#0E8388] to-[#10B981] text-white text-xs font-extrabold shadow-sm hover:shadow-md transition-all flex items-center gap-2 cursor-pointer active:scale-95"
                >
                  <Plus className="w-4 h-4 stroke-[2.5]" />
                  <span>Ajuste de Stock</span>
                </button>
              </>
            )}

            {activeTab === 'finanzas' && (
              <div
                ref={financeActionsRef}
                className="flex items-center gap-2 flex-nowrap shrink-0 overflow-x-auto py-1 scrollbar-none"
              >
                {/* Button 1: Factura Compra (Stock) */}
                {(() => {
                  const isExp = expandedFinanceAction === 'invoice';
                  return (
                    <button
                      type="button"
                      onClick={() => {
                        if (isExp) {
                          setIsAddInvoiceModalOpen(true);
                          setExpandedFinanceAction(null);
                        } else {
                          setExpandedFinanceAction('invoice');
                        }
                      }}
                      className={`group relative flex items-center h-9.5 rounded-full bg-gradient-to-r from-[#0E8388] to-[#10B981] text-white shadow-sm shadow-[#0E8388]/20 hover:shadow-md transition-all duration-300 ease-out cursor-pointer shrink-0 ${
                        isExp ? 'px-3 pr-2 gap-2' : 'w-9.5 justify-center hover:scale-105 active:scale-95'
                      }`}
                      title="Cargar Factura Compra (Stock)"
                    >
                      <Package className="w-4 h-4 shrink-0" />
                      {isExp && (
                        <div className="flex items-center gap-2 animate-in fade-in slide-in-from-left-2 duration-200">
                          <span className="text-xs font-black whitespace-nowrap">
                            + Factura Compra
                          </span>
                          <span className="text-[10px] font-extrabold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-white/20 hover:bg-white/30 flex items-center gap-0.5 shrink-0">
                            Abrir <ArrowUpRight className="w-3 h-3" />
                          </span>
                          <span
                            role="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setExpandedFinanceAction(null);
                            }}
                            className="p-0.5 rounded-full hover:bg-white/20 transition-colors text-white/80 hover:text-white shrink-0 cursor-pointer"
                            title="Cerrar"
                          >
                            <X className="w-3.5 h-3.5" />
                          </span>
                        </div>
                      )}
                    </button>
                  );
                })()}

                {/* Button 2: Registrar Gasto / Notaría */}
                {(() => {
                  const isExp = expandedFinanceAction === 'expense';
                  return (
                    <button
                      type="button"
                      onClick={() => {
                        if (isExp) {
                          setIsAddExpenseModalOpen(true);
                          setExpandedFinanceAction(null);
                        } else {
                          setExpandedFinanceAction('expense');
                        }
                      }}
                      className={`group relative flex items-center h-9.5 rounded-full bg-amber-500 hover:bg-amber-600 text-white shadow-sm shadow-amber-500/20 hover:shadow-md transition-all duration-300 ease-out cursor-pointer shrink-0 ${
                        isExp ? 'px-3 pr-2 gap-2' : 'w-9.5 justify-center hover:scale-105 active:scale-95'
                      }`}
                      title="Registrar Gasto / Notaría"
                    >
                      <Receipt className="w-4 h-4 shrink-0" />
                      {isExp && (
                        <div className="flex items-center gap-2 animate-in fade-in slide-in-from-left-2 duration-200">
                          <span className="text-xs font-black whitespace-nowrap">
                            + Registrar Gasto
                          </span>
                          <span className="text-[10px] font-extrabold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-white/20 hover:bg-white/30 flex items-center gap-0.5 shrink-0">
                            Abrir <ArrowUpRight className="w-3 h-3" />
                          </span>
                          <span
                            role="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setExpandedFinanceAction(null);
                            }}
                            className="p-0.5 rounded-full hover:bg-white/20 transition-colors text-white/80 hover:text-white shrink-0 cursor-pointer"
                            title="Cerrar"
                          >
                            <X className="w-3.5 h-3.5" />
                          </span>
                        </div>
                      )}
                    </button>
                  );
                })()}

                {/* Button 3: Venta Manual */}
                {(() => {
                  const isExp = expandedFinanceAction === 'manualOrder';
                  return (
                    <button
                      type="button"
                      onClick={() => {
                        if (isExp) {
                          setManualOrderStep(1);
                          setIsAddOrderModalOpen(true);
                          setExpandedFinanceAction(null);
                        } else {
                          setExpandedFinanceAction('manualOrder');
                        }
                      }}
                      className={`group relative flex items-center h-9.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-sm shadow-blue-600/20 hover:shadow-md transition-all duration-300 ease-out cursor-pointer shrink-0 ${
                        isExp ? 'px-3 pr-2 gap-2' : 'w-9.5 justify-center hover:scale-105 active:scale-95'
                      }`}
                      title="Venta Manual"
                    >
                      <ShoppingBag className="w-4 h-4 shrink-0" />
                      {isExp && (
                        <div className="flex items-center gap-2 animate-in fade-in slide-in-from-left-2 duration-200">
                          <span className="text-xs font-black whitespace-nowrap">
                            + Venta Manual
                          </span>
                          <span className="text-[10px] font-extrabold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-white/20 hover:bg-white/30 flex items-center gap-0.5 shrink-0">
                            Abrir <ArrowUpRight className="w-3 h-3" />
                          </span>
                          <span
                            role="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setExpandedFinanceAction(null);
                            }}
                            className="p-0.5 rounded-full hover:bg-white/20 transition-colors text-white/80 hover:text-white shrink-0 cursor-pointer"
                            title="Cerrar"
                          >
                            <X className="w-3.5 h-3.5" />
                          </span>
                        </div>
                      )}
                    </button>
                  );
                })()}

                {/* Button 4: Mercado Pago */}
                {(() => {
                  const isExp = expandedFinanceAction === 'mercadoPago';
                  return (
                    <button
                      type="button"
                      onClick={() => {
                        if (isExp) {
                          setIsMercadoPagoModalOpen(true);
                          setExpandedFinanceAction(null);
                        } else {
                          setExpandedFinanceAction('mercadoPago');
                        }
                      }}
                      className={`group relative flex items-center h-9.5 rounded-full bg-white hover:bg-slate-50 border border-slate-300/90 text-slate-800 shadow-xs hover:shadow-sm transition-all duration-300 ease-out cursor-pointer shrink-0 ${
                        isExp ? 'px-3 pr-2 gap-2 ring-2 ring-blue-500/20' : 'w-9.5 justify-center hover:scale-105 active:scale-95'
                      }`}
                      title="Configuración pasarela Mercado Pago"
                    >
                      <CreditCard className="w-4 h-4 shrink-0 text-blue-600" />
                      {isExp && (
                        <div className="flex items-center gap-2 animate-in fade-in slide-in-from-left-2 duration-200">
                          <span className="text-xs font-black whitespace-nowrap text-slate-800">
                            ⚙️ Mercado Pago
                          </span>
                          <span className="text-[10px] font-extrabold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 flex items-center gap-0.5 shrink-0">
                            Configurar <ArrowUpRight className="w-3 h-3" />
                          </span>
                          <span
                            role="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setExpandedFinanceAction(null);
                            }}
                            className="p-0.5 rounded-full hover:bg-slate-100 transition-colors text-slate-400 hover:text-slate-700 shrink-0 cursor-pointer"
                            title="Cerrar"
                          >
                            <X className="w-3.5 h-3.5" />
                          </span>
                        </div>
                      )}
                    </button>
                  );
                })()}
              </div>
            )}

            {activeTab === 'despachos' && (
              <>
                {dispatchSubTab === 'zonas' ? (
                  <span className="text-xs font-bold px-3.5 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80 flex items-center gap-1.5 shadow-xs">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Puerto Varas</span>
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={handleOpenCreateVehicleModal}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#0E8388] to-[#10B981] text-white text-xs font-extrabold shadow-sm hover:shadow-md transition-all flex items-center gap-2 cursor-pointer active:scale-95"
                  >
                    <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>Nuevo Vehículo</span>
                  </button>
                )}
              </>
            )}
          </div>
        </header>

        {/* ======================================================= */}
        {/* MAIN VIEW CONTENT CONTAINER (Scrolls independently)     */}
        {/* ======================================================= */}
        <main className="flex-1 min-w-0 p-4 sm:p-6 md:p-8 lg:p-10 pb-28 md:pb-10 overflow-y-auto">
        
        {/* ========================================================================= */}
        {/* TAB 1: DASHBOARD (Resumen del Día, Gráficas y KPIs)                      */}
        {/* ========================================================================= */}
        {activeTab === 'dashboard' && (
          <div className="space-y-4 md:space-y-8 animate-in fade-in duration-300">

            {/* ========================================================= */}
            {/* VISTA MÓVIL PWA EXCLUSIVA (md:hidden)                     */}
            {/* ========================================================= */}
            <div className="block md:hidden space-y-4">
              
              {/* 1. Barra de Estados del Reparto (Mini-Píldoras Interactivas) */}
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setOrderDayFilter('hoy');
                    setActiveTab('pedidos');
                  }}
                  className="p-2.5 rounded-2xl bg-amber-50/90 border border-amber-200 text-left transition-all active:scale-95 cursor-pointer shadow-xs"
                >
                  <div className="flex items-center justify-between text-amber-700">
                    <Clock className="w-3.5 h-3.5" />
                    <span className="text-base font-black">
                      {todayOrders.filter((o) => o.status === 'en_preparacion').length}
                    </span>
                  </div>
                  <div className="text-[10px] font-black text-amber-900 tracking-tight mt-1 truncate">
                    En Prep.
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setOrderDayFilter('hoy');
                    setActiveTab('pedidos');
                  }}
                  className="p-2.5 rounded-2xl bg-blue-50/90 border border-blue-200 text-left transition-all active:scale-95 cursor-pointer shadow-xs"
                >
                  <div className="flex items-center justify-between text-blue-700">
                    <Truck className="w-3.5 h-3.5" />
                    <span className="text-base font-black">
                      {todayOrders.filter((o) => o.status === 'en_camino').length}
                    </span>
                  </div>
                  <div className="text-[10px] font-black text-blue-900 tracking-tight mt-1 truncate">
                    En Camino
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setOrderDayFilter('hoy');
                    setActiveTab('pedidos');
                  }}
                  className="p-2.5 rounded-2xl bg-emerald-50/90 border border-emerald-200 text-left transition-all active:scale-95 cursor-pointer shadow-xs"
                >
                  <div className="flex items-center justify-between text-emerald-700">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span className="text-base font-black">
                      {todayOrders.filter((o) => o.status === 'entregado').length}
                    </span>
                  </div>
                  <div className="text-[10px] font-black text-emerald-900 tracking-tight mt-1 truncate">
                    Entregados
                  </div>
                </button>
              </div>

              {/* 2. Cuadrícula 2x2 de Métricas Esenciales del Día */}
              <div className="grid grid-cols-2 gap-2.5">
                {/* Ventas Hoy */}
                <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Ventas Hoy</span>
                    <span className="text-[9px] font-black text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-md border border-emerald-200">+14%</span>
                  </div>
                  <div className="text-lg font-black text-slate-900 tracking-tight leading-tight">
                    {formatCLP(salesPeriodData.dia.amount)}
                  </div>
                  <span className="text-[10px] text-slate-400 font-semibold">{todayOrders.length} pedidos hoy</span>
                </div>

                {/* Pedidos Hoy */}
                <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Pedidos Hoy</span>
                    <div className="w-5 h-5 rounded-md bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs">
                      <ShoppingBag className="w-3 h-3" />
                    </div>
                  </div>
                  <div className="text-lg font-black text-slate-900 tracking-tight leading-tight">
                    {todayOrders.length} {todayOrders.length === 1 ? 'Pedido' : 'Pedidos'}
                  </div>
                  <span className="text-[10px] text-slate-400 font-semibold">
                    {todayOrders.filter((o) => o.status !== 'entregado').length} pendientes
                  </span>
                </div>

                {/* Cobros por Rendir */}
                <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Por Rendir</span>
                    <div className="w-5 h-5 rounded-md bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-xs">
                      <DollarSign className="w-3 h-3" />
                    </div>
                  </div>
                  <div className="text-lg font-black text-amber-900 tracking-tight leading-tight">
                    {formatCLP(
                      todayOrders
                        .filter(
                          (o) =>
                            o.paymentMethod?.toLowerCase().includes('efectivo') ||
                            o.paymentMethod?.toLowerCase().includes('transferencia')
                        )
                        .reduce((acc, o) => acc + o.total, 0) || 45000
                    )}
                  </div>
                  <span className="text-[10px] text-slate-400 font-semibold">Efectivo / Chofer</span>
                </div>

                {/* Ticket Promedio */}
                <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Ticket Prom.</span>
                    <div className="w-5 h-5 rounded-md bg-purple-50 text-purple-600 flex items-center justify-center font-bold text-xs">
                      <TrendingUp className="w-3 h-3" />
                    </div>
                  </div>
                  <div className="text-lg font-black text-slate-900 tracking-tight leading-tight">
                    {formatCLP(
                      todayOrders.length > 0
                        ? Math.round(salesPeriodData.dia.amount / todayOrders.length)
                        : 22500
                    )}
                  </div>
                  <span className="text-[10px] text-slate-400 font-semibold">Promedio por orden</span>
                </div>
              </div>

              {/* 3. Tarjeta Hero "Próxima Entrega en Ruta" */}
              {(() => {
                const nextOrder =
                  todayOrders.find((o) => o.status === 'en_camino') ||
                  todayOrders.find((o) => o.status === 'en_preparacion') ||
                  orders[0];

                if (!nextOrder) return null;

                return (
                  <div className="bg-gradient-to-br from-white to-slate-50/90 rounded-2xl border-2 border-[#0E8388]/30 p-4 shadow-sm space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                        <span className="text-[10px] font-black uppercase tracking-wider text-[#0E8388]">
                          {nextOrder.status === 'en_camino' ? 'Próxima Entrega en Ruta 🚚' : 'Siguiente por Despachar 📦'}
                        </span>
                      </div>
                      <span className="text-xs font-mono font-black text-slate-700 bg-slate-100 px-2 py-0.5 rounded-lg border border-slate-200">
                        {nextOrder.id}
                      </span>
                    </div>

                    <div className="space-y-2">
                      <div className="text-sm font-black text-slate-900 flex items-center justify-between">
                        <span>{nextOrder.customer}</span>
                        <div className="text-right">
                          <span className="text-xs font-bold text-slate-600 font-mono">{formatCLP(nextOrder.total)}</span>
                          {isOrderPaidOnline(nextOrder) ? (
                            <span className="block text-[10px] font-black text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 mt-0.5">
                              ✓ Pagado Web · $0
                            </span>
                          ) : (
                            <span className="block text-[10px] font-black text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 mt-0.5">
                              ⚠️ Cobrar en entrega
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Banner de Cobro / No Cobro para Repartidor */}
                      {renderPaymentCollectionBanner(nextOrder, true)}

                      <div className="text-xs text-slate-600 flex items-center gap-1.5 font-medium">
                        <MapPin className="w-3.5 h-3.5 text-[#0E8388] shrink-0" />
                        <span className="truncate">{nextOrder.address}, {nextOrder.city}</span>
                      </div>
                      {/* Desglose Visual de Productos (Opción 1: Miniaturas + Badge de Cantidad) */}
                      <div className="pt-2 border-t border-slate-200/60 space-y-1.5">
                        <div className="flex items-center justify-between text-[11px] font-bold text-slate-500">
                          <span className="flex items-center gap-1.5">
                            <Package className="w-3.5 h-3.5 text-[#0E8388]" />
                            <span>Carga a entregar ({nextOrder.items?.reduce((acc, it) => acc + (it.quantity || 1), 0) || 0} un.)</span>
                          </span>
                          {nextOrder.items && nextOrder.items.length > 2 && (
                            <button
                              type="button"
                              onClick={() => setIsNextOrderItemsExpanded(!isNextOrderItemsExpanded)}
                              className="text-[10px] font-extrabold text-[#0E8388] hover:text-[#093C3E] transition-colors cursor-pointer"
                            >
                              {isNextOrderItemsExpanded ? 'Ver menos ▴' : `+${nextOrder.items.length - 2} más ▾`}
                            </button>
                          )}
                        </div>

                        <div className="grid grid-cols-1 gap-1.5">
                          {(isNextOrderItemsExpanded
                            ? nextOrder.items || []
                            : (nextOrder.items || []).slice(0, 2)
                          ).map((item, idx) => {
                            const imgSrc = getProductImage(item.name);
                            return (
                              <div
                                key={idx}
                                onClick={() => setSelectedProductPreview({
                                  ...item,
                                  orderId: nextOrder.id,
                                  customer: nextOrder.customer,
                                  petName: nextOrder.petName,
                                  petType: nextOrder.petType,
                                  tracking: nextOrder.tracking,
                                })}
                                className="flex items-center gap-2.5 p-1.5 pr-2.5 rounded-xl bg-slate-50/90 border border-slate-200/80 transition-all hover:bg-slate-100/90 cursor-pointer group"
                                title="Toca para ver foto ampliada"
                              >
                                {/* Miniatura con Badge Flotante de Cantidad */}
                                <div className="relative shrink-0 w-10 h-10 rounded-lg bg-white border border-slate-200 p-0.5 flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform">
                                  <img
                                    src={imgSrc}
                                    alt={item.name}
                                    className="w-full h-full object-contain rounded-md"
                                  />
                                  <span className="absolute -top-1.5 -right-1.5 min-w-4 h-4 px-1 rounded-full bg-[#0E8388] text-white text-[9px] font-black flex items-center justify-center shadow-xs border border-white leading-none">
                                    x{item.quantity || 1}
                                  </span>
                                </div>

                                {/* Nombre y Formato/Kilos */}
                                <div className="flex-1 min-w-0">
                                  <div className="text-xs font-bold text-slate-800 truncate group-hover:text-[#0E8388] transition-colors">
                                    {item.name}
                                  </div>
                                  <div className="flex items-center gap-1.5 mt-0.5">
                                    {item.weight && (
                                      <span className="text-[10px] font-bold text-slate-600 bg-white px-1.5 py-0.2 rounded-md border border-slate-200/80 shadow-2xs">
                                        {item.weight}
                                      </span>
                                    )}
                                    {item.code && (
                                      <span className="text-[9px] font-mono text-slate-400">
                                        SKU: {item.code}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 pt-1 border-t border-slate-200/60">
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(nextOrder.address + ', ' + (nextOrder.city || 'Puerto Varas'))}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="py-2 px-1 sm:px-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-slate-800 border border-blue-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-all active:scale-95 shadow-2xs"
                        title="Abrir en Google Maps"
                      >
                        <GoogleMapsIcon className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">Google Maps</span>
                      </a>

                      <a
                        href={`https://wa.me/${(nextOrder.phone || '+56987654321').replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`¡Hola ${nextOrder.customer}! Te contactamos de Patitas del Sur respecto a tu pedido ${nextOrder.id}. Voy en camino a tu domicilio 🐾`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="py-2 px-1 sm:px-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-all active:scale-95 shadow-2xs"
                        title="Avisar por WhatsApp"
                      >
                        <WhatsAppIcon className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">WhatsApp</span>
                      </a>

                      <button
                        type="button"
                        onClick={() => handleUpdateOrderStatus(nextOrder.id, 'entregado')}
                        className="py-2 px-1 sm:px-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-black flex items-center justify-center gap-1 shadow-sm transition-all cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">Entregado</span>
                      </button>
                    </div>
                  </div>
                );
              })()}

              {/* 4. Alerta y Listado Desplegable de Stock Crítico (Solo productos con alerta) */}
              {lowStockCount > 0 && (
                <div className="w-full rounded-2xl bg-rose-50/90 border border-rose-200/90 shadow-2xs overflow-hidden transition-all duration-300">
                  <button
                    type="button"
                    onClick={() => setIsCriticalStockExpanded(!isCriticalStockExpanded)}
                    className="w-full p-2.5 text-rose-800 text-left transition-all active:scale-98 flex items-center justify-between gap-2 cursor-pointer hover:bg-rose-100/60"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                      <span className="text-xs font-bold truncate">
                        Stock Crítico: {lowStockCount} {lowStockCount === 1 ? 'producto' : 'productos'} bajo el mínimo
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="text-[10px] font-bold text-rose-600/80">
                        {isCriticalStockExpanded ? 'Ocultar' : 'Ver productos'}
                      </span>
                      <ChevronDown
                        className={`w-4 h-4 text-rose-500 transition-transform duration-200 ${
                          isCriticalStockExpanded ? 'rotate-180' : ''
                        }`}
                      />
                    </div>
                  </button>

                  {/* Listado Desplegado: ÚNICAMENTE los productos con alerta de stock crítico */}
                  {isCriticalStockExpanded && (
                    <div className="p-2.5 pt-0 space-y-2 border-t border-rose-200/60 animate-in fade-in slide-in-from-top-2 duration-200">
                      <div className="text-[10px] font-extrabold uppercase tracking-wider text-rose-700/80 pt-2 flex items-center justify-between">
                        <span>Productos con alerta de quiebre</span>
                        <span className="bg-rose-200/70 text-rose-900 px-1.5 py-0.5 rounded-full text-[9px] font-mono font-black">
                          {criticalStockProducts.length} {criticalStockProducts.length === 1 ? 'producto' : 'productos'}
                        </span>
                      </div>

                      <div className="space-y-1.5">
                        {criticalStockProducts.map((prod) => (
                          <div
                            key={prod.id}
                            className="bg-white rounded-xl p-2.5 border border-rose-200/80 shadow-2xs flex items-center justify-between gap-2.5 hover:border-rose-300 transition-colors"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className="relative w-10 h-10 rounded-lg bg-slate-50 border border-slate-200 p-0.5 shrink-0 flex items-center justify-center overflow-hidden">
                                <img
                                  src={getProductImage(prod.name)}
                                  alt={prod.name}
                                  className="w-full h-full object-contain"
                                />
                                <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-rose-500 border border-white" />
                              </div>

                              <div className="min-w-0">
                                <div className="text-xs font-black text-slate-900 truncate">
                                  {prod.name}
                                </div>
                                <div className="flex items-center gap-2 mt-0.5">
                                  <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-1.5 py-0.2 rounded">
                                    {prod.format}
                                  </span>
                                  <span className="text-[9px] font-mono text-slate-400">
                                    SKU: {prod.sku}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="text-right shrink-0">
                              <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 font-black text-xs border border-rose-300">
                                <span>{prod.stock} un.</span>
                              </div>
                              <div className="text-[9px] text-slate-400 font-medium mt-0.5">
                                Mín: {prod.minStock || 5} un.
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Botón para ver en Inventario con filtro de Stock Bajo pre-aplicado */}
                      <button
                        type="button"
                        onClick={() => {
                          setInventoryStockFilter('bajo');
                          setActiveTab('inventario');
                        }}
                        className="w-full py-2 px-3 rounded-xl bg-white hover:bg-rose-100/50 text-rose-800 text-[11px] font-black border border-rose-300/80 shadow-2xs flex items-center justify-center gap-1.5 transition-all active:scale-98 cursor-pointer mt-1"
                      >
                        <span>Gestionar en Inventario</span>
                        <ChevronRight className="w-3.5 h-3.5 text-rose-600" />
                      </button>
                    </div>
                  )}
                </div>
              )}

            </div>

            {/* ========================================================= */}
            {/* VISTA ESCRITORIO EXISTENTE (hidden md:block)              */}
            {/* ========================================================= */}
            <div className="hidden md:block space-y-8">


            {/* Global Dashboard Period Filter Bar */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-2.5 sm:p-3 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-2 text-xs font-extrabold text-slate-700">
                <div className="p-1.5 rounded-xl bg-[#0E8388]/10 text-[#0E8388] border border-[#0E8388]/20">
                  <Filter className="w-4 h-4" />
                </div>
                <span>Período del Dashboard:</span>
                <span className="text-slate-500 font-semibold hidden md:inline">
                  (Sincroniza todas las métricas, tarjetas y gráficos)
                </span>
              </div>

              {/* Segmented Filter Buttons */}
              <div className="flex items-center p-1 rounded-xl bg-slate-100 border border-slate-200/70 gap-1 w-full sm:w-auto">
                {[
                  { id: 'dia', label: 'Hoy (Día)', icon: Clock },
                  { id: 'semana', label: 'Últimos 7 Días', icon: BarChart3 },
                  { id: 'mes', label: 'Mes Actual (Agosto)', icon: Calendar },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => {
                      setGlobalTimeFilter(tab.id);
                      showToast(`Dashboard actualizado a: ${tab.label}`);
                    }}
                    className={`flex-1 sm:flex-none px-3.5 py-1.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      globalTimeFilter === tab.id
                        ? 'bg-white text-[#0E8388] shadow-xs border border-slate-200/80 font-black'
                        : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    <tab.icon className="w-3.5 h-3.5" />
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* KPI Cards Row (Driven by Global Filter) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5">
              {/* Card 1: Ventas */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200/70 shadow-[0_1px_3px_rgba(0,0,0,0.03),0_4px_12px_rgba(0,0,0,0.02)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.05)] hover:border-slate-300/80 transition-all duration-200 flex flex-col justify-between space-y-3.5 group">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    {salesPeriodData[globalTimeFilter].title}
                  </span>
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0 transition-transform group-hover:scale-105">
                    <DollarSign className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl lg:text-[28px] font-bold text-slate-900 tracking-tight leading-none">
                  {formatCLP(salesPeriodData[globalTimeFilter].amount)}
                </div>
                <div className="flex items-center justify-between text-xs pt-0.5">
                  <div className="inline-flex items-center gap-1 font-semibold text-emerald-700 bg-emerald-50/90 border border-emerald-200/60 px-2 py-0.5 rounded-md text-[11px]">
                    <TrendingUp className="w-3 h-3 text-emerald-600" />
                    <span>{salesPeriodData[globalTimeFilter].growth}</span>
                  </div>
                  <span className="text-[11px] text-slate-400 font-medium">
                    {salesPeriodData[globalTimeFilter].detail}
                  </span>
                </div>
              </div>

              {/* Card 2: Pedidos */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200/70 shadow-[0_1px_3px_rgba(0,0,0,0.03),0_4px_12px_rgba(0,0,0,0.02)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.05)] hover:border-slate-300/80 transition-all duration-200 flex flex-col justify-between space-y-3.5 group">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    {ordersPeriodData[globalTimeFilter].title}
                  </span>
                  <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center shrink-0 transition-transform group-hover:scale-105">
                    <ShoppingBag className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl lg:text-[28px] font-bold text-slate-900 tracking-tight leading-none">
                  {ordersPeriodData[globalTimeFilter].count}
                </div>
                <div className="flex items-center justify-between text-xs pt-0.5">
                  <span className="text-slate-600 font-medium truncate max-w-[155px] text-[11px]">
                    {ordersPeriodData[globalTimeFilter].statusText}
                  </span>
                  <span className="text-[11px] text-slate-400 font-medium">
                    {ordersPeriodData[globalTimeFilter].detail}
                  </span>
                </div>
              </div>

              {/* Card 3: Clientes CRM */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200/70 shadow-[0_1px_3px_rgba(0,0,0,0.03),0_4px_12px_rgba(0,0,0,0.02)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.05)] hover:border-slate-300/80 transition-all duration-200 flex flex-col justify-between space-y-3.5 group">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    {customersPeriodData[globalTimeFilter].title}
                  </span>
                  <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center shrink-0 transition-transform group-hover:scale-105">
                    <Users className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl lg:text-[28px] font-bold text-slate-900 tracking-tight leading-none">
                  {customersPeriodData[globalTimeFilter].count}
                </div>
                <div className="flex items-center justify-between text-xs pt-0.5">
                  <span className="text-slate-600 font-medium truncate max-w-[155px] text-[11px]">
                    {customersPeriodData[globalTimeFilter].statusText}
                  </span>
                  <span className="text-[11px] text-slate-400 font-medium">
                    {customersPeriodData[globalTimeFilter].detail}
                  </span>
                </div>
              </div>

              {/* Card 4: Valor Inventario */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200/70 shadow-[0_1px_3px_rgba(0,0,0,0.03),0_4px_12px_rgba(0,0,0,0.02)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.05)] hover:border-slate-300/80 transition-all duration-200 flex flex-col justify-between space-y-3.5 group">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Valor Inventario</span>
                  <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0 transition-transform group-hover:scale-105">
                    <Package className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl lg:text-[28px] font-bold text-slate-900 tracking-tight leading-none">
                  {formatCLP(financialMetrics.totalInventoryCost)}
                </div>
                <div className="flex items-center justify-between text-xs pt-0.5">
                  <span className="text-[11px] font-medium text-slate-600">
                    18 SKUs valorizados
                  </span>
                  <span className="text-[11px] text-slate-400 font-medium">
                    Bodega Central
                  </span>
                </div>
              </div>
            </div>

            {/* Graphs & Operational Overview (Driven by Global Filter) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Graphic 1: Multi-Chart Carousel with 7 Interactive Slides */}
              <div className="lg:col-span-2 bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/70 shadow-[0_1px_3px_rgba(0,0,0,0.03),0_4px_12px_rgba(0,0,0,0.02)] flex flex-col justify-between space-y-6">
                {/* Header with Subtabs/Capsules and Navigation Controls */}
                <div className="space-y-4">
                  {/* Apple Segmented Capsule Bar */}
                  <div className="bg-slate-100/90 p-1 rounded-2xl flex items-center gap-1 overflow-x-auto scrollbar-none border border-slate-200/60 shadow-inner">
                    {CHART_SLIDE_TABS.map((tab) => {
                      const Icon = tab.icon;
                      const isActive = currentChartSlide === tab.id;
                      return (
                        <button
                          key={tab.id}
                          type="button"
                          onClick={() => setCurrentChartSlide(tab.id)}
                          className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer active:scale-95 ${
                            isActive
                              ? 'bg-white text-slate-900 shadow-[0_1px_4px_rgba(0,0,0,0.08),0_1px_2px_rgba(0,0,0,0.04)] font-bold'
                              : 'text-slate-600 hover:text-slate-900 hover:bg-white/40'
                          }`}
                        >
                          <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#0E8388]' : 'text-slate-400'}`} />
                          <span>{tab.label}</span>
                        </button>
                      );
                    })}
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 text-[#0E8388] flex items-center justify-center shrink-0 border border-slate-200/60">
                        {currentChartSlide === 0 && <DollarSign className="w-5 h-5 text-emerald-600" />}
                        {currentChartSlide === 1 && <ShoppingBag className="w-5 h-5 text-blue-600" />}
                        {currentChartSlide === 2 && <MapPin className="w-5 h-5 text-emerald-600" />}
                        {currentChartSlide === 3 && <Truck className="w-5 h-5 text-purple-600" />}
                        {currentChartSlide === 4 && <Award className="w-5 h-5 text-amber-500" />}
                        {currentChartSlide === 5 && <Handshake className="w-5 h-5 text-[#0E8388]" />}
                        {currentChartSlide === 6 && <Flame className="w-5 h-5 text-rose-500" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-base font-bold text-slate-900 tracking-tight leading-none">
                            {currentChartSlide === 0 && dashboardAnalyticsData.chartTitle}
                            {currentChartSlide === 1 && 'Volumen de Pedidos'}
                            {currentChartSlide === 2 && 'Distribución por Comuna'}
                            {currentChartSlide === 3 && 'Modalidad de Entrega'}
                            {currentChartSlide === 4 && 'Top 5 Productos'}
                            {currentChartSlide === 5 && 'Ventas por Convenio'}
                            {currentChartSlide === 6 && 'Horarios de Mayor Demanda'}
                          </h3>
                          <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200/60">
                            Gráfico {currentChartSlide + 1} de 7
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 font-normal mt-1">
                          {currentChartSlide === 0 && dashboardAnalyticsData.chartSubtitle}
                          {currentChartSlide === 1 && 'Cantidad de órdenes procesadas y estados de despacho'}
                          {currentChartSlide === 2 && 'Concentración de entregas en la cuenca del Lago Llanquihue y regiones'}
                          {currentChartSlide === 3 && 'Porcentaje de flota propia vs. retiro en clínicas y guarderías aliadas'}
                          {currentChartSlide === 4 && 'Ranking de alimentos y snacks preferidos por los tutores'}
                          {currentChartSlide === 5 && 'Ventas derivadas por convenios veterinarios vs. venta directa'}
                          {currentChartSlide === 6 && 'Horas y días con mayor volumen de compras para optimizar rutas'}
                        </p>
                      </div>
                    </div>

                    {/* Navigation Steppers */}
                    <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                      <button
                        type="button"
                        onClick={() => setCurrentChartSlide((prev) => (prev === 0 ? 6 : prev - 1))}
                        className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200/80 active:bg-slate-300 text-slate-600 transition-all flex items-center justify-center cursor-pointer active:scale-95"
                        title="Gráfico anterior"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setCurrentChartSlide((prev) => (prev === 6 ? 0 : prev + 1))}
                        className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200/80 active:bg-slate-300 text-slate-600 transition-all flex items-center justify-center cursor-pointer active:scale-95"
                        title="Siguiente gráfico"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* SLIDE 0: INGRESOS POR VENTAS ($ CLP) */}
                {currentChartSlide === 0 && (
                  <div className="space-y-4 animate-in fade-in duration-300">
                    <div className="pt-2 grid grid-flow-col auto-cols-fr gap-3 items-end h-44 border-b border-slate-100 pb-3">
                      {dashboardAnalyticsData.bars.map((bar, idx) => (
                        <div key={idx} className="flex flex-col items-center gap-2 group/bar">
                          <span className="text-[10px] font-semibold text-slate-600 opacity-0 group-hover/bar:opacity-100 transition-opacity whitespace-nowrap">
                            {bar.amount}
                          </span>
                          <div className="w-12 sm:w-16 mx-auto bg-slate-100/80 rounded-t-lg h-32 flex items-end p-0.5">
                            <div
                              className={`w-full rounded-t-md transition-all duration-700 ${
                                idx === dashboardAnalyticsData.bars.length - 1 || bar.val === 100
                                  ? 'bg-gradient-to-t from-emerald-600 to-teal-500 shadow-xs'
                                  : 'bg-slate-300 hover:bg-slate-400'
                              }`}
                              style={{ height: `${bar.val}%` }}
                            />
                          </div>
                          <span className="text-[11px] font-medium text-slate-500 text-center truncate max-w-full">
                            {bar.day}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="bg-slate-50/80 rounded-xl p-3 border border-slate-100 grid grid-cols-3 divide-x divide-slate-200/60 text-center text-xs">
                      <div className="px-2">
                        <span className="text-slate-400 block text-[10px] uppercase font-semibold tracking-wider">Ticket Promedio</span>
                        <span className="text-sm font-bold text-slate-900 mt-0.5 block">{dashboardAnalyticsData.footerTicket}</span>
                      </div>
                      <div className="px-2">
                        <span className="text-slate-400 block text-[10px] uppercase font-semibold tracking-wider">Entrega a Tiempo</span>
                        <span className="text-sm font-bold text-emerald-600 mt-0.5 block">{dashboardAnalyticsData.footerOnTime}</span>
                      </div>
                      <div className="px-2">
                        <span className="text-slate-400 block text-[10px] uppercase font-semibold tracking-wider">Canjes Convenios</span>
                        <span className="text-sm font-bold text-purple-600 mt-0.5 block">{dashboardAnalyticsData.footerRedemptions}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* SLIDE 1: VOLUMEN DE PEDIDOS (CANTIDAD DE ÓRDENES) */}
                {currentChartSlide === 1 && (
                  <div className="space-y-4 animate-in fade-in duration-300">
                    <div className="pt-2 grid grid-flow-col auto-cols-fr gap-3 items-end h-44 border-b border-slate-100 pb-3">
                      {(globalTimeFilter === 'dia'
                        ? [
                            { label: '09:00', count: 1, height: 50 },
                            { label: '11:00', count: 1, height: 50 },
                            { label: '13:00', count: 2, height: 100 },
                            { label: '15:00', count: 0, height: 10 },
                            { label: '17:00', count: 1, height: 50 },
                            { label: '19:00', count: 0, height: 10 },
                          ]
                        : globalTimeFilter === 'semana'
                        ? [
                            { label: 'Mié 12', count: 4, height: 50 },
                            { label: 'Jue 13', count: 6, height: 75 },
                            { label: 'Vie 14', count: 8, height: 100 },
                            { label: 'Sáb 15', count: 5, height: 62 },
                            { label: 'Dom 16', count: 3, height: 37 },
                            { label: 'Lun 17', count: 7, height: 87 },
                            { label: 'Hoy 18', count: 5, height: 62 },
                          ]
                        : [
                            { label: 'Sem 1 (1-7)', count: 15, height: 65 },
                            { label: 'Sem 2 (8-14)', count: 19, height: 82 },
                            { label: 'Sem 3 (15-21)', count: 23, height: 100 },
                            { label: 'Sem 4 (22-31)', count: 15, height: 65 },
                          ]
                      ).map((col, idx) => (
                        <div key={idx} className="flex flex-col items-center gap-2 group/col">
                          <span className="text-[11px] font-black text-blue-600 opacity-0 group-hover/col:opacity-100 transition-opacity">
                            {col.count} {col.count === 1 ? 'pedido' : 'pedidos'}
                          </span>
                          <div className="w-10 sm:w-12 mx-auto bg-slate-100/80 rounded-t-lg h-32 flex items-end p-0.5">
                            <div
                              className="w-full bg-gradient-to-t from-blue-600 to-cyan-500 rounded-t-md shadow-xs transition-all duration-700"
                              style={{ height: `${col.height}%` }}
                            />
                          </div>
                          <span className="text-[11px] font-bold text-slate-600">{col.label}</span>
                        </div>
                      ))}
                    </div>

                    <div className="grid grid-cols-3 gap-4 pt-1 text-center text-xs">
                      <div>
                        <span className="text-slate-400 block font-semibold">Entregados</span>
                        <span className="text-sm font-black text-emerald-600">94.4% (68)</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block font-semibold">En Ruta 🚚</span>
                        <span className="text-sm font-black text-blue-600">4.1% (3)</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block font-semibold">En Preparación</span>
                        <span className="text-sm font-black text-amber-600">1.5% (1)</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* SLIDE 2: DISTRIBUCIÓN GEOGRÁFICA POR COMUNA */}
                {currentChartSlide === 2 && (
                  <div className="space-y-3 pt-1 animate-in fade-in duration-300">
                    {[
                      { city: 'Puerto Varas (Radio Urbano Central)', percent: 42, count: '30 pedidos', total: '$2.037.000', color: 'from-[#0E8388] to-[#10B981]' },
                      { city: 'Puerto Montt & Alerce', percent: 28, count: '20 pedidos', total: '$1.358.000', color: 'from-blue-600 to-cyan-500' },
                      { city: 'Llanquihue & Frutillar', percent: 18, count: '13 pedidos', total: '$873.000', color: 'from-purple-600 to-indigo-500' },
                      { city: 'Ensenada & Zonas Rurales', percent: 7, count: '5 pedidos', total: '$339.500', color: 'from-amber-500 to-orange-400' },
                      { city: 'Envíos Regionales (Courier Express)', percent: 5, count: '4 pedidos', total: '$242.500', color: 'from-rose-500 to-pink-500' },
                    ].map((zone, idx) => (
                      <div key={idx} className="space-y-1 text-xs">
                        <div className="flex items-center justify-between font-bold">
                          <span className="text-slate-800 flex items-center gap-1.5">
                            <MapPin className="w-3 h-3 text-[#0E8388]" />
                            <span>{zone.city}</span>
                          </span>
                          <span className="text-slate-900 font-black">
                            {zone.percent}% <span className="text-slate-400 font-normal">({zone.count} • {zone.total})</span>
                          </span>
                        </div>
                        <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden">
                          <div
                            className={`h-full bg-gradient-to-r ${zone.color} rounded-full transition-all duration-700`}
                            style={{ width: `${zone.percent}%` }}
                          />
                        </div>
                      </div>
                    ))}

                    <div className="grid grid-cols-3 gap-4 pt-3 border-t border-slate-100 text-center text-xs">
                      <div>
                        <span className="text-slate-400 block font-semibold">Comuna Líder</span>
                        <span className="text-sm font-black text-slate-900">Puerto Varas</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block font-semibold">Cobertura Activa</span>
                        <span className="text-sm font-black text-emerald-600">5 Zonas</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block font-semibold">Despacho Promedio</span>
                        <span className="text-sm font-black text-[#0E8388]">24 Horas</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* SLIDE 3: MODALIDAD DE ENTREGA (DOMICILIO VS RETIRO EN CONVENIOS) */}
                {currentChartSlide === 3 && (
                  <div className="space-y-4 pt-1 animate-in fade-in duration-300">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black uppercase text-emerald-800">Despacho a Domicilio</span>
                          <Truck className="w-4 h-4 text-emerald-600" />
                        </div>
                        <div className="text-2xl font-black text-emerald-900">64%</div>
                        <p className="text-[11px] text-emerald-700 font-medium">46 pedidos entregados con flota propia</p>
                      </div>

                      <div className="p-3.5 rounded-2xl bg-purple-50/70 border border-purple-200/80 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black uppercase text-purple-800">Puntos de Retiro / Convenio</span>
                          <Building2 className="w-4 h-4 text-purple-600" />
                        </div>
                        <div className="text-2xl font-black text-purple-900">26%</div>
                        <p className="text-[11px] text-purple-700 font-medium">19 retiros en Clínicas y Guarderías</p>
                      </div>

                      <div className="p-3.5 rounded-2xl bg-blue-50/70 border border-blue-200/80 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black uppercase text-blue-800">Courier Regional</span>
                          <Package className="w-4 h-4 text-blue-600" />
                        </div>
                        <div className="text-2xl font-black text-blue-900">10%</div>
                        <p className="text-[11px] text-blue-700 font-medium">7 envíos nacionales Blue Express</p>
                      </div>
                    </div>

                    <div className="space-y-2 pt-1">
                      <span className="text-slate-500 font-bold uppercase text-[10px]">Composición Total de Envíos</span>
                      <div className="w-full h-4 rounded-full bg-slate-100 overflow-hidden flex">
                        <div className="h-full bg-gradient-to-r from-[#0E8388] to-[#10B981]" style={{ width: '64%' }} title="Domicilio 64%" />
                        <div className="h-full bg-gradient-to-r from-purple-500 to-indigo-500" style={{ width: '26%' }} title="Punto Retiro 26%" />
                        <div className="h-full bg-gradient-to-r from-blue-500 to-cyan-400" style={{ width: '10%' }} title="Courier 10%" />
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-slate-500 font-semibold px-1">
                        <span>🟢 64% Flota Propia</span>
                        <span>🟣 26% Retiro en Aliados</span>
                        <span>🔵 10% Courier Express</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 pt-2 border-t border-slate-100 text-center text-xs">
                      <div>
                        <span className="text-slate-400 block font-semibold">Costo Promedio Flete</span>
                        <span className="text-sm font-black text-slate-900">$1.990 CLP</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block font-semibold">Ahorro Tutores Convenio</span>
                        <span className="text-sm font-black text-purple-600">$57.000 CLP</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block font-semibold">Satisfacción Envíos</span>
                        <span className="text-sm font-black text-emerald-600">99.4% ✓</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* SLIDE 4: TOP 5 PRODUCTOS MÁS VENDIDOS */}
                {currentChartSlide === 4 && (
                  <div className="space-y-2.5 pt-1 animate-in fade-in duration-300">
                    {[
                      { rank: '🥇', name: 'Bravery Salmón Adulto Medium/Large', format: '12 kg', units: 32, total: '$2.207.680', percent: 100 },
                      { rank: '🥈', name: 'Patagonia Holística Trucha Silvestre', format: '7 kg', units: 24, total: '$1.271.760', percent: 75 },
                      { rank: '🥉', name: 'Bravery Pollo Adulto Raza Grande', format: '12 kg', units: 18, total: '$1.241.820', percent: 56 },
                      { rank: '4️⃣', name: 'Snack Ciervo Patagónico Deshidratado', format: '200 g', units: 45, total: '$854.550', percent: 45 },
                      { rank: '5️⃣', name: 'Dr. Pet Urinary Care Felino', format: '3 kg', units: 15, total: '$524.850', percent: 35 },
                    ].map((item, idx) => (
                      <div key={idx} className="p-2.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2.5">
                          <span className="text-base">{item.rank}</span>
                          <div>
                            <div className="font-black text-slate-900">{item.name}</div>
                            <div className="text-[10px] text-slate-500 font-mono">Formato {item.format} • {item.units} unidades vendidas</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-black text-slate-900">{item.total}</div>
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                            Top #{idx + 1}
                          </span>
                        </div>
                      </div>
                    ))}

                    <div className="grid grid-cols-3 gap-4 pt-2 border-t border-slate-100 text-center text-xs">
                      <div>
                        <span className="text-slate-400 block font-semibold">Categoría Líder</span>
                        <span className="text-sm font-black text-slate-900">Perros Adultos (65%)</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block font-semibold">Formato Más Pedido</span>
                        <span className="text-sm font-black text-[#0E8388]">Saco 12 kg</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block font-semibold">Ticket por Producto</span>
                        <span className="text-sm font-black text-purple-600">$54.200</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* SLIDE 5: RENDIMIENTO POR CONVENIOS LOCALES */}
                {currentChartSlide === 5 && (
                  convenios.length === 0 ? (
                    <div className="p-8 text-center text-slate-400 bg-slate-50 rounded-2xl border border-slate-100">
                      <Handshake className="w-8 h-8 mx-auto mb-2 opacity-40 text-slate-400" />
                      <p className="text-xs font-semibold text-slate-500">No hay convenios registrados</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">Crea convenios en la sección correspondiente para ver métricas aquí.</p>
                    </div>
                  ) : (
                    <div className="space-y-3 pt-1 animate-in fade-in duration-300">
                      {convenios.map((conv, idx) => (
                        <div key={conv.id || idx} className="p-3 rounded-2xl bg-slate-50 border border-slate-100 space-y-1 text-xs">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 font-bold text-slate-900">
                              <span>
                                {conv.type === 'veterinaria' ? '🏥' : conv.type === 'entrenamiento' ? '🐕' : conv.type === 'peluqueria' ? '✂️' : '🏡'}
                              </span>
                              <span>{conv.name}</span>
                              <span className="text-[10px] font-mono font-bold text-[#0E8388] bg-[#0E8388]/10 px-1.5 py-0.5 rounded">
                                {conv.code}
                              </span>
                            </div>
                            <div className="font-black text-slate-900">
                              ${((conv.redemptionsCount || 0) * 65000).toLocaleString('es-CL')}
                            </div>
                          </div>
                          <div className="flex items-center justify-between text-[11px] text-slate-500 pt-0.5">
                            <span>{conv.redemptionsCount || 0} canjes acumulados</span>
                            <span className="text-purple-700 font-bold">Comisión: {conv.commissionEntity}</span>
                          </div>
                        </div>
                      ))}

                      <div className="grid grid-cols-3 gap-4 pt-2 border-t border-slate-100 text-center text-xs">
                        <div>
                          <span className="text-slate-400 block font-semibold">Total Ventas Convenios</span>
                          <span className="text-sm font-black text-slate-900">
                            ${(convenios.reduce((acc, c) => acc + (c.redemptionsCount || 0), 0) * 65000).toLocaleString('es-CL')}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400 block font-semibold">Aliado N°1</span>
                          <span className="text-sm font-black text-emerald-600">{convenios[0]?.name || 'N/A'}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block font-semibold">Comisiones Pagadas</span>
                          <span className="text-sm font-black text-purple-600">
                            ${Math.round(convenios.reduce((acc, c) => acc + (c.redemptionsCount || 0), 0) * 65000 * 0.08).toLocaleString('es-CL')}
                          </span>
                        </div>
                      </div>
                    </div>
                  )
                )}

                {/* SLIDE 6: HORARIOS Y DÍAS PICO DE COMPRA */}
                {currentChartSlide === 6 && (
                  <div className="space-y-4 pt-1 animate-in fade-in duration-300">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                      <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200 space-y-1">
                        <span className="text-[10px] font-black uppercase text-amber-800">Franja Pico Tarde (13:00 - 17:00)</span>
                        <div className="text-2xl font-black text-amber-900">45% Demanda</div>
                        <p className="text-[11px] text-amber-800 font-medium">Mayor concentración de compras del día</p>
                      </div>

                      <div className="p-3.5 rounded-2xl bg-purple-50/80 border border-purple-200 space-y-1">
                        <span className="text-[10px] font-black uppercase text-purple-800">Franja Noche (18:00 - 22:00)</span>
                        <div className="text-2xl font-black text-purple-900">35% Demanda</div>
                        <p className="text-[11px] text-purple-800 font-medium">Compras en el hogar post-jornada laboral</p>
                      </div>

                      <div className="p-3.5 rounded-2xl bg-blue-50/80 border border-blue-200 space-y-1">
                        <span className="text-[10px] font-black uppercase text-blue-800">Franja Mañana (08:00 - 12:00)</span>
                        <div className="text-2xl font-black text-blue-900">20% Demanda</div>
                        <p className="text-[11px] text-blue-800 font-medium">Pedidos matutinos para entrega exprés</p>
                      </div>
                    </div>

                    <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5 text-xs">
                      <span className="text-slate-500 font-bold uppercase text-[10px]">Días con Mayor Flujo de Pedidos</span>
                      <div className="grid grid-cols-7 gap-1.5 text-center pt-1 font-bold">
                        {[
                          { day: 'Lun', val: '26% 🔥', active: true },
                          { day: 'Mar', val: '14%', active: false },
                          { day: 'Mié', val: '12%', active: false },
                          { day: 'Jue', val: '15%', active: false },
                          { day: 'Vie', val: '20% ⭐', active: true },
                          { day: 'Sáb', val: '8%', active: false },
                          { day: 'Dom', val: '5%', active: false },
                        ].map((d, idx) => (
                          <div
                            key={idx}
                            className={`p-2 rounded-xl border ${
                              d.active
                                ? 'bg-emerald-50 border-emerald-300 text-emerald-800 font-black'
                                : 'bg-white border-slate-200 text-slate-600'
                            }`}
                          >
                            <span className="text-[10px] block text-slate-400">{d.day}</span>
                            <span className="text-[11px]">{d.val}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 pt-1 text-center text-xs">
                      <div>
                        <span className="text-slate-400 block font-semibold">Hora Punta Exacta</span>
                        <span className="text-sm font-black text-rose-600">14:30 hrs</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block font-semibold">Día Más Fuerte</span>
                        <span className="text-sm font-black text-emerald-600">Lunes (26%)</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block font-semibold">Tasa de Conversión</span>
                        <span className="text-sm font-black text-purple-600">4.8% en vivo</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Graphic 2: Category Breakdown */}
              <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/70 shadow-[0_1px_3px_rgba(0,0,0,0.03),0_4px_12px_rgba(0,0,0,0.02)] flex flex-col justify-between space-y-5">
                <div>
                  <h3 className="text-base font-bold text-slate-900 tracking-tight">Distribución por Mascota</h3>
                  <p className="text-xs text-slate-400 font-normal mt-0.5">Porcentaje de ventas Perros vs. Gatos</p>
                </div>

                <div className="space-y-4">
                  {/* Perros Progress */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-700 flex items-center gap-1.5">🐶 Alimentos & Snacks Perros</span>
                      <span className="text-slate-900 font-bold">
                        {dashboardAnalyticsData.perrosPercent}% <span className="text-slate-400 font-normal">({dashboardAnalyticsData.perrosAmount})</span>
                      </span>
                    </div>
                    <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-500"
                        style={{ width: `${dashboardAnalyticsData.perrosPercent}%` }}
                      />
                    </div>
                  </div>

                  {/* Gatos Progress */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-700 flex items-center gap-1.5">🐱 Nutrición Felina</span>
                      <span className="text-slate-900 font-bold">
                        {dashboardAnalyticsData.gatosPercent}% <span className="text-slate-400 font-normal">({dashboardAnalyticsData.gatosAmount})</span>
                      </span>
                    </div>
                    <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-amber-500 to-orange-400 rounded-full transition-all duration-500"
                        style={{ width: `${dashboardAnalyticsData.gatosPercent}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Operational Quick Alert Box with Action Button */}
                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-950">
                    <div className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-700 flex items-center justify-center shrink-0">
                      <AlertTriangle className="w-3.5 h-3.5" />
                    </div>
                    <span>Alertas de Reposición Próxima</span>
                  </div>

                  <p className="text-xs text-amber-950/80 leading-relaxed font-normal">
                    Hay <strong className="font-semibold text-amber-950">2 tutores</strong> que agotarán el alimento de su mascota en menos de 5 días (<span className="underline decoration-amber-400">Kira: 4 días</span> • <span className="underline decoration-amber-400">Rocky: 2 días</span>).
                  </p>

                  <button
                    type="button"
                    onClick={() => {
                      setReplenishmentFilter('criticos');
                      setIsReplenishmentModalOpen(true);
                    }}
                    className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 active:scale-[0.98] text-white font-semibold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                  >
                    <Eye className="w-3.5 h-3.5 text-slate-300" />
                    <span className="whitespace-nowrap">Ver Reposiciones</span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Orders of the Day Table */}
            <div className="bg-white border border-slate-200/80 rounded-3xl p-6 space-y-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2.5">
                    <h3 className="text-base font-black text-slate-900">Pedidos Recientes del Día</h3>
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {todayOrders.length} {todayOrders.length === 1 ? 'pedido hoy' : 'pedidos hoy'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Últimos pedidos registrados para despacho hoy ({todayFormattedDate})
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('pedidos')}
                  className="text-xs font-bold text-[#0E8388] hover:text-[#0A3E40] flex items-center gap-1 cursor-pointer"
                >
                  <span>Ver todos los pedidos</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="text-slate-400 uppercase tracking-wider text-[10px] bg-slate-50 border-b border-slate-100">
                    <tr>
                      <th className="py-3 px-3">ID Pedido</th>
                      <th className="py-3 px-3">Cliente & Mascota</th>
                      <th className="py-3 px-3">Productos</th>
                      <th className="py-3 px-3">Total</th>
                      <th className="py-3 px-3">Estado</th>
                      <th className="py-3 px-3 text-right">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {todayOrders.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-slate-400 font-medium">
                          No hay pedidos registrados para despacho en el día de hoy ({todayFormattedDate}).
                        </td>
                      </tr>
                    ) : (
                      todayOrders.map((o) => (
                        <tr key={o.id} className="hover:bg-slate-50 transition-colors">
                          <td className="py-3.5 px-3 whitespace-nowrap min-w-[120px]">
                            <div className="font-mono font-black text-[#0E8388] text-xs whitespace-nowrap leading-none">{o.id}</div>
                            <div className="text-[11px] text-slate-500 font-medium whitespace-nowrap mt-1">{o.date} • {o.time}</div>
                          </td>
                          <td className="py-3.5 px-3 whitespace-nowrap min-w-[130px]">
                            <div className="font-bold text-slate-900 whitespace-nowrap leading-none">{o.customer}</div>
                            <div className="text-[11px] text-slate-600 font-semibold whitespace-nowrap mt-1 flex items-center gap-1.5">
                              <span>{o.petType?.toLowerCase().includes('gato') || o.petType?.includes('🐱') ? '🐱' : '🐶'}</span>
                              <span>{o.petName}</span>
                            </div>
                          </td>
                          <td className="py-3.5 px-3 max-w-xs truncate text-slate-600 font-medium">
                            {o.items.map((i, idx) => (
                              <span
                                key={idx}
                                onClick={() => setSelectedProductPreview({
                                  ...i,
                                  orderId: o.id,
                                  customer: o.customer,
                                  petName: o.petName,
                                  petType: o.petType,
                                  tracking: o.tracking,
                                })}
                                className="hover:text-[#0E8388] hover:underline cursor-pointer"
                                title="Clic para ver foto del producto"
                              >
                                {idx > 0 ? ', ' : ''}{i.quantity}x {i.name}
                              </span>
                            ))}
                          </td>
                          <td className="py-3.5 px-3 font-black text-slate-900 whitespace-nowrap">{formatCLP(o.total)}</td>
                          <td className="py-3.5 px-3 whitespace-nowrap">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                              o.status === 'entregado'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : o.status === 'en_camino'
                                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                : 'bg-amber-50 text-amber-700 border border-amber-200'
                            }`}>
                              {o.status.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="py-3.5 px-3 text-right whitespace-nowrap">
                            <button
                              onClick={() => setSelectedOrderModal(o)}
                              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-700 font-bold text-xs border border-slate-200 transition-colors cursor-pointer"
                            >
                              Ver detalle
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

        {/* ========================================================================= */}
        {/* TAB 2: PEDIDOS (Gestión Integral & Ver Detalle)                           */}
        {/* ========================================================================= */}
        {activeTab === 'pedidos' && (
          <div className="space-y-6 animate-in fade-in duration-300">


            {/* Filter Bar & Express Order Intake - iOS Native Style */}
            <div className="bg-white border border-slate-200/80 rounded-2xl sm:rounded-3xl p-3.5 sm:p-4 shadow-xs space-y-3">
              <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
                {/* iOS Search Bar */}
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Buscar por ID, cliente, mascota o dirección..."
                    value={orderSearch}
                    onChange={(e) => setOrderSearch(e.target.value)}
                    className="w-full pl-10 pr-9 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:bg-white focus:border-[#0E8388] transition-colors"
                  />
                  {orderSearch && (
                    <button
                      type="button"
                      onClick={() => setOrderSearch('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 rounded-full transition-colors cursor-pointer"
                      title="Limpiar búsqueda"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* iOS Dropdown Menus: Día y Estado (en la misma línea en móvil y desktop) */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 shrink-0">
                  {/* Filtros en la misma línea: 2 columnas en móvil, inline en sm+ */}
                  <div className="grid grid-cols-2 gap-2 w-full sm:w-auto">
                    {/* Lista Desplegable 1: Período / Día */}
                    <div className="min-w-0 sm:w-44">
                      <CustomDropdown
                        value={orderDayFilter}
                        options={orderDayFilterOptions}
                        onChange={(val) => setOrderDayFilter(val)}
                        buttonClassName="w-full px-2.5 sm:px-3.5 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-slate-800 font-bold hover:bg-white text-[11px] sm:text-xs"
                        popoverClassName="w-52"
                      />
                    </div>

                    {/* Lista Desplegable 2: Estado del Pedido */}
                    <div className="min-w-0 sm:w-48">
                      <CustomDropdown
                        value={orderStatusFilter}
                        options={orderStatusFilterOptions}
                        onChange={(val) => setOrderStatusFilter(val)}
                        align="right"
                        buttonClassName="w-full px-2.5 sm:px-3.5 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-slate-800 font-bold hover:bg-white text-[11px] sm:text-xs"
                        popoverClassName="w-56"
                      />
                    </div>
                  </div>

                  {/* Acciones: Pedido Manual y Limpiar */}
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button
                      type="button"
                      onClick={() => {
                        if (manualOrderItems.length === 0 && PRODUCTS.length > 0) {
                          setManualOrderItems([
                            {
                              productId: PRODUCTS[0].id,
                              name: PRODUCTS[0].name,
                              weight: PRODUCTS[0].weights?.[0] || '12 kg',
                              price: PRODUCTS[0].price,
                              quantity: 1,
                              image: PRODUCTS[0].image,
                            },
                          ]);
                        }
                        setManualOrderStep(1);
                        setIsAddOrderModalOpen(true);
                      }}
                      className="flex-1 sm:flex-none px-3.5 py-2.5 rounded-2xl bg-[#0E8388] hover:bg-[#0c7276] text-white text-xs font-black transition-all flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer active:scale-95 shrink-0"
                    >
                      <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                      <span className="truncate">Pedido Manual</span>
                    </button>

                    {/* Resetear filtros si hay alguno activo */}
                    {(orderDayFilter !== 'todos' || orderStatusFilter !== 'todos' || orderSearch) && (
                      <button
                        type="button"
                        onClick={() => {
                          setOrderDayFilter('todos');
                          setOrderStatusFilter('todos');
                          setOrderSearch('');
                        }}
                        className="p-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 text-xs font-bold transition-colors cursor-pointer shrink-0"
                        title="Limpiar filtros"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* ========================================================================= */}
            {/* PWA / MÓVIL: Tarjetas Nativas iOS (Sin scroll horizontal)                */}
            {/* ========================================================================= */}
            <div className="block md:hidden space-y-3">
              {filteredOrdersList.length > 0 && (
                <div className="flex items-center justify-between px-1 text-xs text-slate-500 font-medium">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    {filteredOrdersList.length} {filteredOrdersList.length === 1 ? 'Pedido' : 'Pedidos'}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      const allExpanded = filteredOrdersList.every((o) => expandedOrders[o.id]);
                      if (allExpanded) {
                        setExpandedOrders({});
                      } else {
                        const nextState = {};
                        filteredOrdersList.forEach((o) => {
                          nextState[o.id] = true;
                        });
                        setExpandedOrders(nextState);
                      }
                    }}
                    className="inline-flex items-center gap-1 text-[11px] font-extrabold text-[#0E8388] hover:text-[#093C3E] active:scale-95 transition-all cursor-pointer bg-teal-50/90 px-2.5 py-1 rounded-lg border border-teal-100"
                  >
                    {filteredOrdersList.length > 0 && filteredOrdersList.every((o) => expandedOrders[o.id]) ? (
                      <>
                        <ChevronDown className="w-3.5 h-3.5 rotate-180 text-[#0E8388]" />
                        <span>Contraer todos</span>
                      </>
                    ) : (
                      <>
                        <ChevronDown className="w-3.5 h-3.5 text-[#0E8388]" />
                        <span>Expandir todos</span>
                      </>
                    )}
                  </button>
                </div>
              )}

              {filteredOrdersList.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-200/80 p-8 text-center space-y-3 shadow-xs">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                    <Package className="w-6 h-6 stroke-[1.5]" />
                  </div>
                  <div className="font-bold text-slate-800 text-sm">No hay pedidos con estos filtros</div>
                  <p className="text-xs text-slate-500 max-w-xs mx-auto">
                    Prueba cambiando el día, el estado o limpiando el término de búsqueda.
                  </p>
                  {(orderDayFilter !== 'todos' || orderStatusFilter !== 'todos' || orderSearch) && (
                    <button
                      type="button"
                      onClick={() => {
                        setOrderDayFilter('todos');
                        setOrderStatusFilter('todos');
                        setOrderSearch('');
                      }}
                      className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer"
                    >
                      Restablecer filtros
                    </button>
                  )}
                </div>
              ) : (
                filteredOrdersList.map((order) => {
                  const itemsCount = order.items.reduce((acc, it) => acc + (it.quantity || 1), 0);
                  const isCat = order.petType?.toLowerCase().includes('gato') || order.petType?.includes('🐱');
                  const isExpanded = Boolean(expandedOrders[order.id]);
                  const isCollapsed = !isExpanded;

                  return (
                    <div
                      key={order.id}
                      onClick={() => {
                        if (isCollapsed) {
                          setExpandedOrders((prev) => ({
                            ...prev,
                            [order.id]: true,
                          }));
                        } else {
                          setSelectedOrderModal(order);
                        }
                      }}
                      className={`bg-white rounded-2xl border transition-all active:scale-[0.99] p-3.5 shadow-xs space-y-2.5 cursor-pointer select-none ${
                        selectedOrderModal?.id === order.id
                          ? 'border-[#0E8388] ring-2 ring-[#0E8388]/20 bg-teal-50/20'
                          : 'border-slate-200/80 hover:border-slate-300'
                      }`}
                    >
                      {/* Cabecera iOS: ID, Fecha, Badge de Estado y Botón Contraer/Expandir */}
                      <div
                        className="flex items-center justify-between gap-2"
                        onClick={(e) => {
                          e.stopPropagation();
                          setExpandedOrders((prev) => ({
                            ...prev,
                            [order.id]: !prev[order.id],
                          }));
                        }}
                      >
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-black text-xs text-[#0E8388] bg-teal-50 px-2 py-0.5 rounded-lg border border-teal-100">
                            {order.id}
                          </span>
                          <span className="text-[11px] font-semibold text-slate-500">
                            {order.date} · {order.time}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider shrink-0 ${
                              order.status === 'entregado'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : order.status === 'en_camino'
                                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                : 'bg-amber-50 text-amber-700 border border-amber-200'
                            }`}
                          >
                            {order.status === 'entregado' && <CheckCircle2 className="w-3 h-3 stroke-[2.5]" />}
                            {order.status === 'en_camino' && <Truck className="w-3 h-3 stroke-[2.5]" />}
                            {order.status === 'en_preparacion' && <Clock className="w-3 h-3 stroke-[2.5]" />}
                            <span>{order.status.replace('_', ' ')}</span>
                          </span>

                          {/* Botón Contraer / Expandir Pedido (iOS Chevron) */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setExpandedOrders((prev) => ({
                                ...prev,
                                [order.id]: !prev[order.id],
                              }));
                            }}
                            className={`p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 active:scale-90 transition-all cursor-pointer flex items-center justify-center shrink-0 ${
                              isCollapsed ? 'bg-slate-50 text-slate-500' : 'bg-teal-50/80 text-[#0E8388]'
                            }`}
                            title={isCollapsed ? 'Expandir pedido' : 'Contraer pedido'}
                            aria-label={isCollapsed ? 'Expandir pedido' : 'Contraer pedido'}
                          >
                            <ChevronDown
                              className={`w-4 h-4 transition-transform duration-200 ${
                                isCollapsed ? 'rotate-0' : 'rotate-180'
                              }`}
                            />
                          </button>
                        </div>
                      </div>

                      {/* Cliente y Total con Estado de Cobro */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="font-bold text-slate-900 text-sm truncate">
                            {order.customer}
                          </div>
                          <div className="flex items-center gap-1.5 text-[11px] text-slate-600 font-semibold mt-0.5">
                            <span className="text-xs">{isCat ? '🐱' : '🐶'}</span>
                            <span className="truncate">{order.petName}</span>
                            {order.petBreed && (
                              <span className="text-[10px] text-slate-400 font-normal truncate">
                                · {order.petBreed}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <div className="text-[10px] uppercase font-bold text-slate-400">Total</div>
                          <div className="font-mono font-black text-slate-900 text-sm sm:text-base">
                            {formatCLP(order.total)}
                          </div>
                          {isOrderPaidOnline(order) ? (
                            <div className="text-[10px] font-black text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200/80 inline-block mt-0.5">
                              ✓ Pagado Web · $0
                            </div>
                          ) : (
                            <div className="text-[10px] font-black text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200/80 inline-block mt-0.5">
                              ⚠️ Cobrar en entrega
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Vista según estado de contracción: Contraída vs Expandida */}
                      {isCollapsed ? (
                        <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                          <div className="flex items-center gap-1.5 truncate max-w-[65%]">
                            <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                            <span className="font-semibold text-slate-700 shrink-0">{order.city}</span>
                            <span className="text-slate-300">•</span>
                            <span className="truncate text-slate-500">{order.address}</span>
                          </div>
                          <span className="text-[10px] font-bold text-[#0E8388] shrink-0 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-100">
                            {itemsCount} {itemsCount === 1 ? 'prod.' : 'prods.'} · Expandir ▾
                          </span>
                        </div>
                      ) : (
                        <>
                          {/* Banner de Cobro / No Cobro para el Repartidor */}
                          {renderPaymentCollectionBanner(order)}

                          {/* Ubicación / Dirección */}
                          <div className="flex items-center gap-1.5 text-xs text-slate-600 bg-slate-50/80 px-2.5 py-1.5 rounded-xl border border-slate-100">
                            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span className="font-bold text-slate-800 shrink-0">{order.city}</span>
                            <span className="text-slate-300">•</span>
                            <span className="text-[11px] text-slate-500 truncate">{order.address}</span>
                          </div>

                          {/* Desglose Visual de Productos (Consistente con Dashboard: Miniaturas + Badge Flotante de Cantidad) */}
                          <div className="pt-2 border-t border-slate-200/60 space-y-1.5">
                            <div className="flex items-center justify-between text-[11px] font-bold text-slate-500">
                              <span className="flex items-center gap-1.5">
                                <Package className="w-3.5 h-3.5 text-[#0E8388]" />
                                <span>Productos a entregar ({itemsCount} un.)</span>
                              </span>
                              {order.items && order.items.length > 2 && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setExpandedOrderCards((prev) => ({
                                      ...prev,
                                      [order.id]: !prev[order.id],
                                    }));
                                  }}
                                  className="text-[10px] font-extrabold text-[#0E8388] hover:text-[#093C3E] transition-colors cursor-pointer"
                                >
                                  {expandedOrderCards[order.id] ? 'Ver menos ▴' : `+${order.items.length - 2} más ▾`}
                                </button>
                              )}
                            </div>

                            <div className="grid grid-cols-1 gap-1.5">
                              {(expandedOrderCards[order.id]
                                ? order.items || []
                                : (order.items || []).slice(0, 2)
                              ).map((it, idx) => {
                                const imgSrc = getProductImage(it.name);
                                return (
                                  <div
                                    key={idx}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedProductPreview({
                                        ...it,
                                        orderId: order.id,
                                        customer: order.customer,
                                        petName: order.petName,
                                        petType: order.petType,
                                        tracking: order.tracking,
                                      });
                                    }}
                                    className="flex items-center gap-2.5 p-1.5 pr-2.5 rounded-xl bg-slate-50/90 border border-slate-200/80 transition-all hover:bg-slate-100/90 cursor-pointer group"
                                    title="Toca para ver foto ampliada"
                                  >
                                    {/* Miniatura con Badge Flotante de Cantidad */}
                                    <div className="relative shrink-0 w-10 h-10 rounded-lg bg-white border border-slate-200 p-0.5 flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform">
                                      <img
                                        src={imgSrc}
                                        alt={it.name}
                                        className="w-full h-full object-contain rounded-md"
                                      />
                                      <span className="absolute -top-1.5 -right-1.5 min-w-4 h-4 px-1 rounded-full bg-[#0E8388] text-white text-[9px] font-black flex items-center justify-center shadow-xs border border-white leading-none">
                                        x{it.quantity || 1}
                                      </span>
                                    </div>

                                    {/* Nombre, Formato/Kilos y Precio */}
                                    <div className="flex-1 min-w-0">
                                      <div className="text-xs font-bold text-slate-800 truncate group-hover:text-[#0E8388] transition-colors">
                                        {it.name}
                                      </div>
                                      <div className="flex items-center justify-between gap-1.5 mt-0.5">
                                        <div className="flex items-center gap-1.5">
                                          {it.weight && (
                                            <span className="text-[10px] font-bold text-slate-600 bg-white px-1.5 py-0.5 rounded-md border border-slate-200/80 shadow-2xs">
                                              {it.weight}
                                            </span>
                                          )}
                                          {it.code && (
                                            <span className="text-[9px] font-mono text-slate-400">
                                              SKU: {it.code}
                                            </span>
                                          )}
                                        </div>
                                        {it.price && (
                                          <span className="text-[11px] font-mono font-bold text-slate-700 shrink-0">
                                            {formatCLP(it.price * (it.quantity || 1))}
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>

                          {/* Barra de Pago y Acciones Rápidas */}
                          <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-100">
                            {/* Método de Pago */}
                            <div className="flex items-center gap-1.5 shrink-0">
                              {renderPaymentMethodBadge(order.paymentMethod)}
                              {isOrderPaidOnline(order) && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
                                  <Check className="w-3 h-3 stroke-[3]" />
                                  <span>Sin cobro</span>
                                </span>
                              )}
                            </div>

                            {/* Botones de Acción */}
                            <div className="flex items-center gap-1.5">
                              {/* Google Maps 1-Tap */}
                              <a
                                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(order.address + ', ' + (order.city || 'Puerto Varas'))}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="p-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-slate-700 border border-blue-200/90 transition-all shadow-2xs active:scale-95"
                                title="Abrir en Google Maps"
                              >
                                <GoogleMapsIcon className="w-3.5 h-3.5" />
                              </a>

                              {/* WhatsApp 1-Tap */}
                              <a
                                href={`https://wa.me/${(order.phone || '+56987654321').replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`¡Hola ${order.customer}! Te contactamos de Patitas del Sur sobre tu pedido ${order.id}. 🐾`)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="p-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200/90 transition-all shadow-2xs active:scale-95"
                                title="Avisar por WhatsApp"
                              >
                                <WhatsAppIcon className="w-3.5 h-3.5" />
                              </a>

                              {/* Botón de Cambio de Estado / Ver Detalle */}
                              {order.status === 'en_preparacion' && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleUpdateOrderStatus(order.id, 'en_camino');
                                  }}
                                  className="px-2.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold text-xs transition-all shadow-xs cursor-pointer flex items-center gap-1"
                                  title="Marcar En Camino"
                                >
                                  <Truck className="w-3 h-3 stroke-[2.5]" />
                                  <span>Despachar</span>
                                </button>
                              )}
                              {order.status === 'en_camino' && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleUpdateOrderStatus(order.id, 'entregado');
                                  }}
                                  className="px-2.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs transition-all shadow-xs cursor-pointer flex items-center gap-1"
                                  title="Marcar Entregado"
                                >
                                  <CheckCircle2 className="w-3 h-3 stroke-[2.5]" />
                                  <span>Entregar</span>
                                </button>
                              )}
                              {order.status === 'entregado' && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedOrderModal(order);
                                  }}
                                  className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-700 font-bold text-xs border border-slate-200 transition-all shadow-xs cursor-pointer flex items-center gap-1"
                                >
                                  <Eye className="w-3 h-3" />
                                  <span>Detalle</span>
                                </button>
                              )}
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* ========================================================================= */}
            {/* ESCRITORIO: Tabla Completa para Pantallas Grandes (>= md)                  */}
            {/* ========================================================================= */}
            <div className="hidden md:block bg-white border border-slate-200/80 rounded-3xl overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="text-slate-500 uppercase tracking-wider text-[10px] bg-slate-50/80 border-b border-slate-200">
                    <tr>
                      <th className="py-3.5 px-4">Pedido / Fecha</th>
                      <th className="py-3.5 px-4">Cliente & Mascota</th>
                      <th className="py-3.5 px-4">Desglose de Ítems</th>
                      <th className="py-3.5 px-4">Zona / Ciudad</th>
                      <th className="py-3.5 px-4">Total</th>
                      <th className="py-3.5 px-4">Estado</th>
                      <th className="py-3.5 px-4 text-center">Acciones Rápidas</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredOrdersList.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="py-8 text-center text-slate-500 text-xs">
                          No se encontraron pedidos con los filtros aplicados.
                        </td>
                      </tr>
                    ) : (
                      filteredOrdersList.map((order) => (
                        <tr
                          key={order.id}
                          onClick={() => setSelectedOrderModal(order)}
                          className={`hover:bg-slate-50/90 transition-all cursor-pointer select-none ${
                            selectedOrderModal?.id === order.id ? 'bg-teal-50/70 border-l-4 border-l-[#0E8388]' : ''
                          }`}
                          title="Haz clic para ver el detalle del pedido y cliente en el panel derecho"
                        >
                          <td className="py-4 px-4 whitespace-nowrap min-w-[130px]">
                            <div className="font-mono font-black text-[#0E8388] text-xs whitespace-nowrap leading-none">{order.id}</div>
                            <div className="text-[11px] text-slate-500 font-medium whitespace-nowrap mt-1">{order.date} • {order.time}</div>
                            <div className="mt-1.5 flex items-center gap-1.5">
                              {renderPaymentMethodBadge(order.paymentMethod)}
                              {isOrderPaidOnline(order) ? (
                                <span className="text-[9px] font-black text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                                  No cobrar
                                </span>
                              ) : (
                                <span className="text-[9px] font-black text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                                  Cobrar
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-4 px-4 whitespace-nowrap min-w-[140px]">
                            <div className="font-bold text-slate-900 whitespace-nowrap leading-none">{order.customer}</div>
                            <div className="text-[11px] text-slate-600 font-semibold whitespace-nowrap mt-1.5 flex items-center gap-1.5">
                              <span>{order.petType?.toLowerCase().includes('gato') || order.petType?.includes('🐱') ? '🐱' : '🐶'}</span>
                              <span>{order.petName}</span>
                            </div>
                          </td>
                          <td className="py-4 px-4 max-w-xs">
                            <div className="space-y-1">
                              {order.items.map((it, idx) => (
                                <div
                                  key={idx}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedProductPreview({
                                      ...it,
                                      orderId: order.id,
                                      customer: order.customer,
                                      petName: order.petName,
                                      petType: order.petType,
                                      tracking: order.tracking,
                                    });
                                  }}
                                  className="text-slate-700 hover:text-[#0E8388] text-xs font-medium truncate cursor-pointer transition-colors hover:underline"
                                  title="Clic para ver foto del producto"
                                >
                                  • {it.quantity}x {it.name} ({it.weight})
                                </div>
                              ))}
                            </div>
                          </td>
                          <td className="py-4 px-4 text-slate-600">
                            <div className="font-bold text-slate-800">{order.city}</div>
                            <div className="text-[10px] text-slate-400 truncate max-w-[150px]">{order.address}</div>
                          </td>
                          <td className="py-4 px-4 whitespace-nowrap">
                            <div className="font-black text-slate-900 text-sm">{formatCLP(order.total)}</div>
                            {isOrderPaidOnline(order) ? (
                              <div className="text-[10px] font-black text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200/80 inline-block mt-0.5">
                                ✓ Pagado Web ($0)
                              </div>
                            ) : (
                              <div className="text-[10px] font-black text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200/80 inline-block mt-0.5">
                                ⚠️ Cobrar entrega
                              </div>
                            )}
                          </td>
                          <td className="py-4 px-4 whitespace-nowrap">
                            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                              order.status === 'entregado'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : order.status === 'en_camino'
                                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                : 'bg-amber-50 text-amber-700 border border-amber-200'
                            }`}>
                              {order.status === 'entregado' && <CheckCircle2 className="w-3 h-3" />}
                              {order.status === 'en_camino' && <Truck className="w-3 h-3" />}
                              {order.status === 'en_preparacion' && <Clock className="w-3 h-3" />}
                              <span>{order.status.replace('_', ' ')}</span>
                            </span>
                          </td>
                          <td className="py-4 px-4 text-center whitespace-nowrap">
                            <div className="flex items-center justify-center gap-1.5">
                              {/* 1-Tap Navigation: Google Maps */}
                              <a
                                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(order.address + ', ' + (order.city || 'Puerto Varas'))}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="p-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-slate-700 border border-blue-200 transition-all shadow-2xs hover:scale-105 active:scale-95"
                                title="Abrir en Google Maps"
                              >
                                <GoogleMapsIcon className="w-3.5 h-3.5" />
                              </a>

                              {/* 1-Tap WhatsApp Contact */}
                              <a
                                href={`https://wa.me/${(order.phone || '+56987654321').replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`¡Hola ${order.customer}! Te contactamos de Patitas del Sur sobre tu pedido ${order.id}. 🐾`)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="p-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 transition-all shadow-2xs hover:scale-105 active:scale-95"
                                title="Avisar por WhatsApp"
                              >
                                <WhatsAppIcon className="w-3.5 h-3.5" />
                              </a>

                              {order.status === 'en_preparacion' && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleUpdateOrderStatus(order.id, 'en_camino');
                                  }}
                                  className="px-2.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold text-xs transition-colors cursor-pointer shadow-xs"
                                  title="Marcar En Camino"
                                >
                                  Despachar
                                </button>
                              )}
                              {order.status === 'en_camino' && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleUpdateOrderStatus(order.id, 'entregado');
                                  }}
                                  className="px-2.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs transition-colors cursor-pointer shadow-xs"
                                  title="Marcar Entregado"
                                >
                                  Entregar
                                </button>
                              )}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedOrderModal(order);
                                }}
                                className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-700 font-bold text-xs border border-slate-200 transition-colors cursor-pointer shadow-xs"
                              >
                                Ver
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: CLIENTES (CRM con Ficha de Mascota Completa)                      */}
        {/* ========================================================================= */}
        {activeTab === 'clientes' && (
          <div className="space-y-6 animate-in fade-in duration-300">


            {/* Search & View Mode Switcher */}
            <div className="bg-white border border-slate-200/80 rounded-3xl p-4 flex flex-col md:flex-row gap-4 items-center justify-between shadow-xs">
              <div className="relative w-full md:w-96">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Buscar por nombre de cliente, mascota, raza o ciudad..."
                  value={customerSearch}
                  onChange={(e) => setCustomerSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:bg-white focus:border-[#0E8388]"
                />
              </div>

              {/* View Switcher: Tarjetas (Grid) / Lista (Table) */}
              <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
                <div className="inline-flex p-1 bg-slate-100/90 rounded-2xl border border-slate-200/80">
                  <button
                    type="button"
                    onClick={() => setCustomerViewMode('grid')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                      customerViewMode === 'grid'
                        ? 'bg-white text-[#0E8388] shadow-xs border border-slate-200/70'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <LayoutGrid className="w-3.5 h-3.5" />
                    <span>Tarjetas</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setCustomerViewMode('list')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                      customerViewMode === 'list'
                        ? 'bg-white text-[#0E8388] shadow-xs border border-slate-200/70'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <List className="w-3.5 h-3.5" />
                    <span>Lista</span>
                  </button>
                </div>

                <div className="text-xs text-slate-500 font-semibold hidden sm:block">
                  Mostrando {customers.filter((c) => {
                    const q = customerSearch.toLowerCase();
                    return (
                      c.name.toLowerCase().includes(q) ||
                      c.email.toLowerCase().includes(q) ||
                      c.city.toLowerCase().includes(q) ||
                      (c.pets
                        ? c.pets.some((p) => p.name.toLowerCase().includes(q) || p.breed.toLowerCase().includes(q))
                        : (c.pet?.name.toLowerCase().includes(q) || c.pet?.breed.toLowerCase().includes(q)))
                    );
                  }).length} perfiles
                </div>
              </div>
            </div>

            {/* VISTA 1: TARJETAS (GRID) */}
            {customerViewMode === 'grid' && (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 animate-in fade-in duration-200">
                {customers
                  .filter((c) => {
                    const q = customerSearch.toLowerCase();
                    return (
                      c.name.toLowerCase().includes(q) ||
                      c.email.toLowerCase().includes(q) ||
                      c.city.toLowerCase().includes(q) ||
                      (c.pets
                        ? c.pets.some((p) => p.name.toLowerCase().includes(q) || p.breed.toLowerCase().includes(q))
                        : (c.pet?.name.toLowerCase().includes(q) || c.pet?.breed.toLowerCase().includes(q)))
                    );
                  })
                  .map((customer) => {
                    const customerPets = (customer.pets && customer.pets.length > 0)
                      ? customer.pets
                      : (customer.pet ? [customer.pet] : []);
                    const urgentPet = customerPets.find((p) => (p.daysRemaining ?? 99) < 10);
                    const isUrgent = !!urgentPet;
                    return (
                      <div
                        key={customer.id}
                        className={`rounded-3xl p-6 space-y-4 transition-all flex flex-col justify-between hover:shadow-lg ${
                          isUrgent
                            ? 'bg-gradient-to-b from-rose-50 to-rose-100/60 border-2 border-rose-400 ring-2 ring-rose-400/30 shadow-md shadow-rose-200/50'
                            : 'bg-white border border-slate-200/80 shadow-xs hover:shadow-md'
                        }`}
                      >
                        {/* Alerta de Reposición Urgente (< 10 días) */}
                        {isUrgent && (
                          <div className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-rose-600 text-white text-[11px] font-black shadow-xs">
                            <span className="flex items-center gap-1.5">
                              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                              <span>
                                ¡REPOSICIÓN! Quedan {urgentPet.daysRemaining} días {customerPets.length > 1 ? `(${urgentPet.name})` : ''}
                              </span>
                            </span>
                            <span className="text-[9px] uppercase tracking-wider font-extrabold bg-white/20 px-2 py-0.5 rounded-md">
                              Encargar
                            </span>
                          </div>
                        )}

                        {/* Header Tutor */}
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`w-12 h-12 rounded-2xl text-white font-black text-lg flex items-center justify-center shadow-xs ${
                              isUrgent
                                ? 'bg-gradient-to-tr from-rose-600 to-rose-500 shadow-rose-200'
                                : 'bg-gradient-to-tr from-[#0E8388] to-[#10B981]'
                            }`}>
                              {customer.name.charAt(0)}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className={`font-black text-base leading-tight ${isUrgent ? 'text-rose-950' : 'text-slate-900'}`}>
                                  {customer.name}
                                </h3>
                                {customerPets.length > 1 && (
                                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                                    {customerPets.length} mascotas
                                  </span>
                                )}
                              </div>
                              <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5 font-medium">
                                <MapPin className={`w-3 h-3 ${isUrgent ? 'text-rose-600' : 'text-[#0E8388]'}`} />
                                <span>{customer.city}</span>
                              </div>
                            </div>
                          </div>

                          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${
                            isUrgent
                              ? 'bg-white text-rose-700 border-rose-300'
                              : 'bg-purple-50 text-purple-700 border border-purple-200'
                          }`}>
                            {customer.points} pts
                          </span>
                        </div>

                        {/* Mascotas Box */}
                        <div className="space-y-2.5">
                          {customerPets.map((pet, petIdx) => {
                            const isPetUrgent = (pet.daysRemaining ?? 99) <= 7;
                            const petBday = getPetBirthdayDetails(pet.birthdate);
                            const isPetBirthday = petBday.isCurrentMonth;
                            const isDog = pet.type?.toLowerCase().includes('perro') || pet.type?.includes('🐶');
                            return (
                              <div
                                key={petIdx}
                                className={`rounded-2xl p-4 space-y-2.5 transition-all ${
                                  isPetUrgent && isPetBirthday
                                    ? 'bg-gradient-to-r from-rose-50/90 via-purple-50/70 to-white border-2 border-rose-500 shadow-2xs'
                                    : isPetUrgent
                                    ? 'bg-rose-50/70 border-2 border-rose-500 shadow-2xs'
                                    : isPetBirthday
                                    ? 'bg-gradient-to-r from-purple-50/90 via-fuchsia-50/50 to-white border-2 border-purple-500 shadow-2xs'
                                    : 'bg-slate-50/80 border border-slate-100'
                                }`}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-1.5 font-bold text-sm text-slate-900">
                                    <span>{isDog ? '🐶' : '🐱'}</span>
                                    <span>{pet.name}</span>
                                    <span className="text-xs text-slate-500 font-normal">({pet.breed})</span>
                                  </div>
                                  <div className="flex items-center gap-1.5">
                                    {isPetBirthday && (
                                      <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-purple-100 text-purple-700 border border-purple-300 shadow-2xs animate-pulse">
                                        🎂 ¡Cumple!
                                      </span>
                                    )}
                                    <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md ${
                                      isPetUrgent ? 'bg-rose-100 text-rose-800 border border-rose-200' : 'bg-emerald-100 text-emerald-800'
                                    }`}>
                                      {pet.weight}
                                    </span>
                                  </div>
                                </div>

                                <div className="text-[11px] text-slate-700 space-y-1">
                                  <div className="truncate">
                                    <strong className="text-slate-500">Dieta:</strong> {pet.favoriteFood}
                                  </div>
                                  <div className={`flex items-center justify-between text-[10px] pt-1 border-t ${
                                    isPetUrgent ? 'border-rose-200' : isPetBirthday ? 'border-purple-200' : 'border-slate-200/80'
                                  }`}>
                                    <span className="text-slate-500">
                                      {isPetBirthday ? `🎂 ${petBday.fullDate}` : `Bolsa: ${pet.bagDurationDays} días`}
                                    </span>
                                    <span className={`font-black ${
                                      isPetUrgent
                                        ? 'text-rose-700 bg-rose-100 px-2 py-0.5 rounded-md border border-rose-200'
                                        : 'text-amber-700 font-bold'
                                    }`}>
                                      Quedan ~{pet.daysRemaining} días
                                    </span>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {/* Summary Stats */}
                        <div className={`grid grid-cols-2 gap-2 text-center text-xs pt-1 border-t ${
                          isUrgent ? 'border-rose-200/80' : 'border-slate-100'
                        }`}>
                          <div>
                            <span className="text-slate-400 text-[10px] uppercase font-bold block">Compras</span>
                            <span className="font-black text-slate-900">{customer.ordersCount} pedidos</span>
                          </div>
                          <div>
                            <span className="text-slate-400 text-[10px] uppercase font-bold block">Total Gastado</span>
                            <span className="font-black text-emerald-700">{formatCLP(customer.totalSpent)}</span>
                          </div>
                        </div>

                        {/* Action Button */}
                        <button
                          onClick={() => {
                            setSelectedCustomerModal(customer);
                            setCustomerModalSubTab(0);
                          }}
                          className={`w-full py-2.5 rounded-xl text-xs font-black transition-colors flex items-center justify-center gap-2 cursor-pointer ${
                            isUrgent
                              ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-sm shadow-rose-600/30'
                              : 'bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-200'
                          }`}
                        >
                          <Eye className={`w-3.5 h-3.5 ${isUrgent ? 'text-white' : 'text-[#0E8388]'}`} />
                          <span>{isUrgent ? '🚨 Encargar / Ver Ficha Nutricional' : 'Ver Ficha Nutricional & Clínica'}</span>
                        </button>
                      </div>
                    );
                  })}
              </div>
            )}

            {/* VISTA 2: LISTA / TABLA DETALLADA */}
            {customerViewMode === 'list' && (
              <div className="bg-white border border-slate-200/80 rounded-3xl overflow-hidden shadow-xs animate-in fade-in duration-200">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50/80 text-slate-500 font-extrabold uppercase text-[10px] tracking-wider border-b border-slate-200">
                        <th className="py-4 px-4">Cliente</th>
                        <th className="py-4 px-4">Contacto (Mail y Teléfono)</th>
                        <th className="py-4 px-4">Dirección(es)</th>
                        <th className="py-4 px-4">Mascotas</th>
                        <th className="py-4 px-4 text-center">Puntos</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {customers
                        .filter((c) => {
                          const q = customerSearch.toLowerCase();
                          return (
                            c.name.toLowerCase().includes(q) ||
                            c.email.toLowerCase().includes(q) ||
                            c.city.toLowerCase().includes(q) ||
                            c.address?.toLowerCase().includes(q) ||
                            (c.pets
                              ? c.pets.some((p) => p.name.toLowerCase().includes(q) || p.breed.toLowerCase().includes(q))
                              : (c.pet?.name.toLowerCase().includes(q) || c.pet?.breed.toLowerCase().includes(q)))
                          );
                        })
                        .map((customer) => {
                          const customerPets = (customer.pets && customer.pets.length > 0)
                            ? customer.pets
                            : (customer.pet ? [customer.pet] : []);
                          return (
                            <tr
                              key={customer.id}
                              onClick={() => {
                                setSelectedCustomerModal(customer);
                                setCustomerModalSubTab(0);
                              }}
                              className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                              title="Clic para ver ficha clínica & nutricional"
                            >
                              {/* 1. Cliente */}
                              <td className="py-4 px-4 whitespace-nowrap">
                                <div className="flex items-center gap-3">
                                  <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#0E8388] to-[#10B981] text-white font-black text-xs flex items-center justify-center shadow-2xs shrink-0">
                                    {customer.name.charAt(0)}
                                  </div>
                                  <div>
                                    <div className="font-bold text-slate-900 leading-tight">
                                      {customer.name}
                                    </div>
                                    <div className="text-[10px] text-slate-400 font-mono mt-0.5">ID: {customer.id}</div>
                                  </div>
                                </div>
                              </td>

                              {/* 2. Contacto (mail y telefono) */}
                              <td className="py-4 px-4 whitespace-nowrap">
                                <div className="space-y-1">
                                  <div className="text-xs font-medium text-slate-800 flex items-center gap-1.5">
                                    <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                    <a
                                      href={`mailto:${customer.email}`}
                                      onClick={(e) => e.stopPropagation()}
                                      className="hover:text-[#0E8388] transition-colors"
                                    >
                                      {customer.email}
                                    </a>
                                  </div>
                                  <div className="text-[11px] text-slate-500 font-medium flex items-center gap-1.5">
                                    <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                    <a
                                      href={`tel:${customer.phone}`}
                                      onClick={(e) => e.stopPropagation()}
                                      className="hover:text-[#0E8388] transition-colors"
                                    >
                                      {customer.phone}
                                    </a>
                                  </div>
                                </div>
                              </td>

                              {/* 3. Direccion(es) */}
                              <td className="py-4 px-4">
                                <div className="space-y-0.5 max-w-xs">
                                  <div className="text-xs font-bold text-slate-800 flex items-start gap-1.5">
                                    <MapPin className="w-3.5 h-3.5 text-[#0E8388] shrink-0 mt-0.5" />
                                    <span>{customer.address}</span>
                                  </div>
                                  <div className="text-[11px] text-slate-500 pl-5 font-medium">
                                    {customer.city}
                                  </div>
                                </div>
                              </td>

                              {/* 4. Mascotas */}
                              <td className="py-4 px-4 whitespace-nowrap">
                                <div className="space-y-2 min-w-[240px]">
                                  {customerPets.map((pet, pIdx) => {
                                    const isDog = pet.type?.toLowerCase().includes('perro') || pet.type?.includes('🐶');
                                    const petBday = getPetBirthdayDetails(pet.birthdate);
                                    const isBirthday = petBday.isCurrentMonth;
                                    const isUrgent = (pet.daysRemaining ?? 99) <= 7;

                                    return (
                                      <div
                                        key={pIdx}
                                        className={`rounded-xl px-3 py-2 transition-all ${
                                          isUrgent && isBirthday
                                            ? 'border-2 border-rose-500 bg-gradient-to-r from-rose-50/90 via-purple-50/60 to-white shadow-2xs'
                                            : isUrgent
                                            ? 'border-2 border-rose-500 bg-rose-50/70 shadow-2xs'
                                            : isBirthday
                                            ? 'border-2 border-purple-500 bg-gradient-to-r from-purple-50/90 via-fuchsia-50/40 to-white shadow-2xs'
                                            : 'border border-slate-200/90 bg-white/70 hover:border-slate-300'
                                        }`}
                                      >
                                        <div className="flex items-center justify-between gap-2">
                                          <div className="flex items-center gap-1.5 font-bold text-slate-900 text-xs">
                                            <span>{isDog ? '🐶' : '🐱'}</span>
                                            <span className="font-extrabold">{pet.name}</span>
                                            <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                                              {pet.weight}
                                            </span>
                                          </div>

                                          <div className="flex items-center gap-1">
                                            {isBirthday && (
                                              <span className="inline-flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-md bg-purple-100 text-purple-700 border border-purple-300 shadow-2xs animate-pulse">
                                                🎂 Cumple
                                              </span>
                                            )}
                                            {isUrgent && (
                                              <span className="inline-flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-md bg-rose-100 text-rose-700 border border-rose-300 shadow-2xs animate-pulse">
                                                🚨 {pet.daysRemaining}d
                                              </span>
                                            )}
                                          </div>
                                        </div>

                                        <div className="flex items-center justify-between gap-3 text-[11px] text-slate-500 mt-1">
                                          <span>{pet.breed} ({pet.age})</span>
                                          {isBirthday && (
                                            <span className="text-[10px] font-bold text-purple-700 bg-purple-50/90 px-1.5 py-0.5 rounded border border-purple-200">
                                              🎉 {petBday.shortDate}
                                            </span>
                                          )}
                                          {!isBirthday && isUrgent && (
                                            <span className="text-[10px] font-bold text-rose-700 bg-rose-50/90 px-1.5 py-0.5 rounded border border-rose-200">
                                              Quedan {pet.daysRemaining} días
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </td>

                              {/* 5. Puntos */}
                              <td className="py-4 px-4 text-center whitespace-nowrap">
                                <span className="inline-flex items-center gap-1 text-xs font-black px-3 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-200 shadow-2xs">
                                  <Sparkles className="w-3 h-3 text-purple-500" />
                                  {customer.points} pts
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: CONVENIOS (Entidades Locales: Veterinarias, Adiestramiento, Spa)    */}
        {/* ========================================================================= */}
        {activeTab === 'convenios' && (
          <AdminConveniosManager
            convenios={convenios}
            setIsAddAgreementModalOpen={setIsAddAgreementModalOpen}
            handleToggleConvenio={handleToggleConvenio}
            handleDeleteConvenio={handleDeleteConvenio}
            setSelectedConvenioForCoupons={setSelectedConvenioForCoupons}
            handleShareCouponsWhatsApp={handleShareCouponsWhatsApp}
          />
        )}

        {/* ========================================================================= */}
        {/* TAB 5: INVENTARIO & FACTURAS DE COMPRA (Vista Tarjetas & Vista Tabla)     */}
        {/* ========================================================================= */}
        {activeTab === 'inventario' && (
          <div className="space-y-6 animate-in fade-in duration-300">


            {/* Inventory Overview KPIs */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs">
                <span className="text-slate-500 text-[10px] uppercase font-bold">Total SKUs Activos</span>
                <div className="text-2xl font-black text-slate-900 mt-1">{inventory.length}</div>
              </div>
              <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs">
                <span className="text-slate-500 text-[10px] uppercase font-bold">Unidades en Bodega</span>
                <div className="text-2xl font-black text-emerald-700 mt-1">
                  {inventory.reduce((acc, p) => acc + p.stock, 0)} u.
                </div>
              </div>
              <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs">
                <span className="text-slate-500 text-[10px] uppercase font-bold">Costo Inventario Neto</span>
                <div className="text-2xl font-black text-slate-900 mt-1">{formatCLP(financialMetrics.totalInventoryCost)}</div>
              </div>
              <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs">
                <span className="text-slate-500 text-[10px] uppercase font-bold">Valor Proyectado PVP</span>
                <div className="text-2xl font-black text-amber-700 mt-1">{formatCLP(financialMetrics.totalInventoryPVP)}</div>
              </div>
            </div>

            {/* Search & Filters Bar (En una sola línea) */}
            <div className="bg-white border border-slate-200/80 rounded-3xl p-3.5 sm:p-4 shadow-xs">
              <div className="flex flex-col xl:flex-row items-stretch xl:items-center gap-2.5 sm:gap-3">
                {/* Buscador */}
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Buscar producto por nombre, marca o SKU..."
                    value={inventorySearch}
                    onChange={(e) => setInventorySearch(e.target.value)}
                    className="w-full pl-10 pr-9 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:bg-white focus:border-[#0E8388] transition-colors"
                  />
                  {inventorySearch && (
                    <button
                      type="button"
                      onClick={() => setInventorySearch('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 rounded-full transition-colors cursor-pointer"
                      title="Limpiar búsqueda"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Filtros Dropdowns en línea */}
                <div className="flex items-center gap-2.5 shrink-0 flex-wrap sm:flex-nowrap">
                  {/* Filtro Desplegable: Estado de Stock */}
                  <div className="w-full sm:w-48 shrink-0">
                    <CustomDropdown
                      value={inventoryStockFilter}
                      options={inventoryStockFilterOptions}
                      onChange={(val) => setInventoryStockFilter(val)}
                      buttonClassName="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-slate-800 font-bold hover:bg-white text-xs"
                      popoverClassName="w-52"
                    />
                  </div>

                  {/* Filtro Desplegable: Mascota (Perro / Gato) */}
                  <div className="w-full sm:w-44 shrink-0">
                    <CustomDropdown
                      value={inventoryPetTypeFilter}
                      options={inventoryPetTypeOptions}
                      onChange={(val) => setInventoryPetTypeFilter(val)}
                      buttonClassName="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-slate-800 font-bold hover:bg-white text-xs"
                      popoverClassName="w-48"
                    />
                  </div>

                  {/* Filtro Desplegable: Marca */}
                  <div className="w-full sm:w-52 shrink-0">
                    <CustomDropdown
                      value={inventoryBrandFilter}
                      options={inventoryBrandOptions}
                      onChange={(val) => setInventoryBrandFilter(val)}
                      buttonClassName="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-slate-800 font-bold hover:bg-white text-xs"
                      popoverClassName="w-56"
                    />
                  </div>

                  {/* Resetear filtros si hay alguno aplicado */}
                  {(inventorySearch || inventoryStockFilter !== 'todos' || inventoryBrandFilter !== 'todas' || inventoryPetTypeFilter !== 'todos') && (
                    <button
                      type="button"
                      onClick={() => {
                        setInventorySearch('');
                        setInventoryStockFilter('todos');
                        setInventoryBrandFilter('todas');
                        setInventoryPetTypeFilter('todos');
                      }}
                      className="p-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 text-xs font-bold transition-colors cursor-pointer shrink-0"
                      title="Restablecer todos los filtros"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* =================================================================== */}
            {/* VIEW MODE 1: TARJETAS (CARDS GRID VIEW)                             */}
            {/* =================================================================== */}
            {inventoryViewMode === 'grid' && (
              filteredInventory.length === 0 ? (
                <div className="bg-white border border-slate-200/80 rounded-3xl p-12 text-center animate-in fade-in duration-300">
                  <div className="max-w-sm mx-auto space-y-2">
                    <Package className="w-10 h-10 text-slate-300 mx-auto" />
                    <div className="font-bold text-slate-800 text-sm">
                      No se encontraron productos
                    </div>
                    <p className="text-xs text-slate-500">
                      Prueba cambiando los filtros de marca, tipo de mascota o búsqueda.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setInventorySearch('');
                        setInventoryStockFilter('todos');
                        setInventoryBrandFilter('todas');
                        setInventoryPetTypeFilter('todos');
                      }}
                      className="mt-2 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
                    >
                      Limpiar Filtros
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-in fade-in duration-300">
                  {filteredInventory.map((prod) => {
                    const isLow = prod.stock <= (prod.minStock || 5) || prod.status === 'stock_bajo';
                    const marginPercent = Math.round(
                      ((prod.salePrice - prod.unitCostNeto) / prod.salePrice) * 100
                    );

                    return (
                      <div
                        key={prod.id}
                        onClick={() => setSelectedProductSalesModal(prod)}
                        className={`bg-white rounded-3xl border p-5 flex flex-col justify-between space-y-4 shadow-sm hover:shadow-md transition-all cursor-pointer group ${
                          isLow
                            ? 'border-2 border-rose-400 ring-2 ring-rose-300/30 bg-gradient-to-b from-rose-50/40 to-white'
                            : 'border-slate-200/80 hover:border-[#0E8388]/40'
                        }`}
                      >
                        {/* Top: Product Image, Category & Stock Badge */}
                        <div>
                          <div className="relative w-full h-44 rounded-2xl bg-gradient-to-b from-slate-50 to-slate-100/90 border border-slate-200/80 p-3 flex items-center justify-center overflow-hidden group">
                            <img
                              src={getProductImage(prod.name)}
                              alt={prod.name}
                              className="max-h-full max-w-full object-contain drop-shadow-sm group-hover:scale-105 transition-transform duration-300"
                            />
                            {/* Format Pill */}
                            <span className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-white/95 text-[#0E8388] border border-slate-200 shadow-xs">
                              {prod.format}
                            </span>
                            {/* Overlay on hover to indicate clickable analytics */}
                            <div className="absolute inset-0 bg-[#0E8388]/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                              <span className="px-3 py-1 rounded-xl bg-slate-900/85 backdrop-blur-xs text-white text-[11px] font-black flex items-center gap-1.5 shadow-lg">
                                <BarChart3 className="w-3.5 h-3.5 text-[#0E8388]" />
                                Ver Ventas
                              </span>
                            </div>
                            {/* Stock Indicator Badge */}
                            <span
                              className={`absolute top-2.5 right-2.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                                isLow
                                  ? 'bg-rose-600 text-white shadow-xs animate-pulse'
                                  : 'bg-emerald-100 text-emerald-800'
                              }`}
                            >
                              {isLow ? `⚠️ ${prod.stock} u. Bajo` : `✓ ${prod.stock} u.`}
                            </span>
                          </div>

                          {/* Product Title & Brand */}
                          <div className="mt-3 space-y-1">
                            <div className="flex items-center justify-between text-[10px] font-bold text-slate-400">
                              <span className="uppercase">{prod.brand}</span>
                              <span className="font-mono">{prod.sku}</span>
                            </div>
                            <h4 className="font-black text-slate-900 text-sm leading-snug line-clamp-2">
                              {prod.name}
                            </h4>
                          </div>

                          {/* Pricing & Margin Box */}
                          <div className="mt-3 grid grid-cols-3 gap-2 bg-slate-50/80 p-2.5 rounded-2xl border border-slate-100 text-center">
                            <div>
                              <span className="text-[9px] uppercase font-bold text-slate-400 block">Costo Neto</span>
                              <span className="text-xs font-mono font-bold text-slate-700">
                                {formatCLP(prod.unitCostNeto)}
                              </span>
                            </div>
                            <div>
                              <span className="text-[9px] uppercase font-bold text-slate-400 block">PVP Venta</span>
                              <span className="text-xs font-black text-slate-900">
                                {formatCLP(prod.salePrice)}
                              </span>
                            </div>
                            <div>
                              <span className="text-[9px] uppercase font-bold text-emerald-700 block">Margen</span>
                              <span className="text-xs font-black text-emerald-700">
                                +{marginPercent}%
                              </span>
                            </div>
                          </div>

                          {/* Warehouse Stock & Valuation Info */}
                          <div className="mt-3 pt-3 border-t border-slate-100 space-y-1.5 text-xs">
                            <div className="flex items-center justify-between text-[11px]">
                              <span className="text-slate-500 font-bold uppercase text-[10px]">Alerta Mínimo:</span>
                              <span className="font-bold text-slate-700">{prod.minStock || 5} unidades</span>
                            </div>
                            <div className="flex items-center justify-between text-[11px]">
                              <span className="text-slate-500 font-bold uppercase text-[10px]">Valor en Bodega:</span>
                              <span className="font-mono font-bold text-slate-900">
                                {formatCLP(prod.stock * prod.unitCostNeto)}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Card Footer Actions: Stepper + Modal */}
                        <div
                          className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="flex items-center bg-slate-100 rounded-xl p-1 border border-slate-200">
                            <button
                              type="button"
                              onClick={() => handleQuickStockChange(prod.id, -1)}
                              disabled={prod.stock <= 0}
                              className="w-7 h-7 rounded-lg bg-white hover:bg-slate-200 text-slate-700 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center font-bold text-xs transition-colors shadow-2xs cursor-pointer"
                              title="Descontar 1 unidad"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="px-3 font-black text-xs text-slate-900 min-w-[3rem] text-center">
                              {prod.stock} u.
                            </span>
                            <button
                              type="button"
                              onClick={() => handleQuickStockChange(prod.id, 1)}
                              className="w-7 h-7 rounded-lg bg-white hover:bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs transition-colors shadow-2xs cursor-pointer"
                              title="Sumar 1 unidad"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() =>
                                setStockAdjustModal({
                                  prod,
                                  type: 'sumar',
                                  amount: 1,
                                  reason: 'Ajuste manual / Conteo',
                                })
                              }
                              className="px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-[11px] flex items-center gap-1 transition-colors cursor-pointer"
                              title="Ajuste formal de inventario"
                            >
                              <SlidersHorizontal className="w-3 h-3" />
                              <span>Ajustar</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setSelectedProductInvoicesModal(prod)}
                              className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                              title="Ver historial de movimientos y origen de compras"
                            >
                              <History className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )
            )}

            {/* =================================================================== */}
            {/* VIEW MODE 2: TABLA (LIST VIEW)                                      */}
            {/* =================================================================== */}
            {inventoryViewMode === 'list' && (
              <div className="bg-white border border-slate-200/80 rounded-3xl overflow-hidden shadow-xs animate-in fade-in duration-300">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="text-slate-500 uppercase tracking-wider text-[10px] bg-slate-50/80 border-b border-slate-200">
                      <tr>
                        {/* 1. Producto & Formato */}
                        <th
                          onClick={() => handleInventorySort('name')}
                          className="py-3.5 px-4 cursor-pointer select-none group hover:bg-slate-100/80 transition-colors"
                          title="Ordenar alfabéticamente por producto (A-Z / Z-A)"
                        >
                          <div className="flex items-center gap-1.5">
                            <span className={inventorySortKey === 'name' ? 'text-[#0E8388] font-black' : ''}>
                              Producto & Formato
                            </span>
                            {renderSortIndicator('name')}
                          </div>
                        </th>

                        {/* 2. Categoría & Marca */}
                        <th
                          onClick={() => handleInventorySort('category')}
                          className="py-3.5 px-4 cursor-pointer select-none group hover:bg-slate-100/80 transition-colors"
                          title="Ordenar alfabéticamente por marca y categoría (A-Z / Z-A)"
                        >
                          <div className="flex items-center gap-1.5">
                            <span className={inventorySortKey === 'category' ? 'text-[#0E8388] font-black' : ''}>
                              Categoría & Marca
                            </span>
                            {renderSortIndicator('category')}
                          </div>
                        </th>

                        {/* 3. Costo Neto */}
                        <th
                          onClick={() => handleInventorySort('unitCostNeto')}
                          className="py-3.5 px-4 cursor-pointer select-none group hover:bg-slate-100/80 transition-colors"
                          title="Ordenar por costo neto (menor a mayor / mayor a menor)"
                        >
                          <div className="flex items-center gap-1.5">
                            <span className={inventorySortKey === 'unitCostNeto' ? 'text-[#0E8388] font-black' : ''}>
                              Costo Neto
                            </span>
                            {renderSortIndicator('unitCostNeto')}
                          </div>
                        </th>

                        {/* 4. Precio Venta (PVP) */}
                        <th
                          onClick={() => handleInventorySort('salePrice')}
                          className="py-3.5 px-4 cursor-pointer select-none group hover:bg-slate-100/80 transition-colors"
                          title="Ordenar por precio venta PVP (menor a mayor / mayor a menor)"
                        >
                          <div className="flex items-center gap-1.5">
                            <span className={inventorySortKey === 'salePrice' ? 'text-[#0E8388] font-black' : ''}>
                              Precio Venta (PVP)
                            </span>
                            {renderSortIndicator('salePrice')}
                          </div>
                        </th>

                        {/* 5. Margen */}
                        <th
                          onClick={() => handleInventorySort('margin')}
                          className="py-3.5 px-4 cursor-pointer select-none group hover:bg-slate-100/80 transition-colors"
                          title="Ordenar por margen porcentual (menor a mayor / mayor a menor)"
                        >
                          <div className="flex items-center gap-1.5">
                            <span className={inventorySortKey === 'margin' ? 'text-[#0E8388] font-black' : ''}>
                              Margen
                            </span>
                            {renderSortIndicator('margin')}
                          </div>
                        </th>

                        {/* 6. Stock en Bodega */}
                        <th
                          onClick={() => handleInventorySort('stock')}
                          className="py-3.5 px-4 cursor-pointer select-none group hover:bg-slate-100/80 transition-colors"
                          title="Ordenar por stock en bodega (menor a mayor / mayor a menor)"
                        >
                          <div className="flex items-center gap-1.5">
                            <span className={inventorySortKey === 'stock' ? 'text-[#0E8388] font-black' : ''}>
                              Stock en Bodega
                            </span>
                            {renderSortIndicator('stock')}
                          </div>
                        </th>

                        {/* 7. Acciones (Sin ordenar) */}
                        <th className="py-3.5 px-4 text-center">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredInventory.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="py-12 px-4 text-center">
                            <div className="max-w-sm mx-auto space-y-2">
                              <Package className="w-10 h-10 text-slate-300 mx-auto" />
                              <div className="font-bold text-slate-800 text-sm">
                                No se encontraron productos
                              </div>
                              <p className="text-xs text-slate-500">
                                Prueba cambiando los filtros de marca, tipo de mascota o búsqueda.
                              </p>
                              <button
                                type="button"
                                onClick={() => {
                                  setInventorySearch('');
                                  setInventoryStockFilter('todos');
                                  setInventoryBrandFilter('todas');
                                  setInventoryPetTypeFilter('todos');
                                }}
                                className="mt-2 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
                              >
                                Limpiar Filtros
                              </button>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        filteredInventory.map((prod) => {
                          const isLow = prod.stock <= (prod.minStock || 5) || prod.status === 'stock_bajo';
                          const marginPercent = Math.round(
                            ((prod.salePrice - prod.unitCostNeto) / prod.salePrice) * 100
                          );

                          return (
                            <tr
                              key={prod.id}
                              onClick={() => setSelectedProductSalesModal(prod)}
                              className={`transition-colors cursor-pointer group ${
                                isLow
                                  ? 'bg-rose-50/40 hover:bg-rose-50/70 border-l-4 border-l-rose-500'
                                  : 'hover:bg-teal-50/40'
                              }`}
                              title="Haz clic para ver el detalle de ventas, gráficos y pedidos de este producto"
                            >
                              {/* Product Info */}
                              <td className="py-4 px-4">
                                <div className="flex items-center gap-3">
                                  <img
                                    src={getProductImage(prod.name)}
                                    alt={prod.name}
                                    className="w-10 h-10 rounded-xl object-contain bg-slate-50 border border-slate-200 p-1 shrink-0 group-hover:scale-105 transition-transform"
                                  />
                                  <div>
                                    <div className="font-bold text-slate-900 text-sm leading-snug group-hover:text-[#0E8388] transition-colors flex items-center gap-1.5">
                                      <span>{prod.name}</span>
                                      <span className="opacity-0 group-hover:opacity-100 transition-opacity text-[#0E8388] text-[10px] font-bold bg-[#0E8388]/10 px-1.5 py-0.5 rounded-md flex items-center gap-0.5">
                                        <BarChart3 className="w-3 h-3" />
                                        <span>Ventas</span>
                                      </span>
                                    </div>
                                    <div className="text-[11px] text-slate-500 font-mono">
                                      {prod.sku} • {prod.format}
                                    </div>
                                  </div>
                                </div>
                              </td>

                              {/* Categoría & Marca */}
                              <td className="py-4 px-4">
                                <div className="space-y-0.5">
                                  <span className="inline-block px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-black text-[10px] uppercase tracking-wider">
                                    {prod.brand}
                                  </span>
                                  <div className="text-xs text-slate-500 font-medium">{prod.category}</div>
                                </div>
                              </td>

                              {/* Costo Neto */}
                              <td className="py-4 px-4 font-mono font-bold text-slate-600">
                                {formatCLP(prod.unitCostNeto)}
                              </td>

                              {/* Precio Venta */}
                              <td className="py-4 px-4 font-black text-slate-900 text-sm">
                                {formatCLP(prod.salePrice)}
                              </td>

                              {/* Margen */}
                              <td className="py-4 px-4">
                                <span className="px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 font-extrabold text-xs">
                                  +{marginPercent}%
                                </span>
                              </td>

                              {/* Stock en Bodega */}
                              <td className="py-4 px-4">
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className={`font-black text-base ${isLow ? 'text-rose-600' : 'text-slate-900'}`}>
                                      {prod.stock} u.
                                    </span>
                                    {prod.isPaused && (
                                      <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 text-[10px] font-black uppercase border border-amber-200 inline-flex items-center gap-1">
                                        <Pause className="w-2.5 h-2.5 fill-current" />
                                        <span>Pausado</span>
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-[10px] text-slate-400 font-mono">
                                    Total: {formatCLP(prod.stock * prod.unitCostNeto)}
                                  </div>
                                </div>
                              </td>

                              {/* Acciones: Editar, Eliminar, Pausar */}
                              <td className="py-4 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                                <div className="inline-flex items-center justify-center gap-2">
                                  {/* Botón Pausar / Reactivar en web pública */}
                                  <button
                                    type="button"
                                    onClick={() => handleTogglePauseProduct(prod)}
                                    className={`p-2 rounded-xl transition-all cursor-pointer flex items-center justify-center ${
                                      prod.isPaused
                                        ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-xs ring-2 ring-amber-200'
                                        : 'bg-slate-100 hover:bg-amber-50 text-slate-600 hover:text-amber-700 border border-slate-200'
                                    }`}
                                    title={
                                      prod.isPaused
                                        ? 'Reactivar producto (hacer visible en la tienda pública)'
                                        : 'Pausar producto (ocultar de la tienda web pública)'
                                    }
                                  >
                                    {prod.isPaused ? (
                                      <Play className="w-4 h-4 fill-current" />
                                    ) : (
                                      <Pause className="w-4 h-4" />
                                    )}
                                  </button>

                                  {/* Botón Editar Producto */}
                                  <button
                                    type="button"
                                    onClick={() => setEditingProduct({ ...prod })}
                                    className="p-2 rounded-xl bg-slate-100 hover:bg-[#0E8388]/10 text-slate-600 hover:text-[#0E8388] border border-slate-200 transition-all cursor-pointer flex items-center justify-center"
                                    title="Editar producto (precios, costos, stock, formato)"
                                  >
                                    <Edit2 className="w-4 h-4" />
                                  </button>

                                  {/* Botón Eliminar Producto */}
                                  <button
                                    type="button"
                                    onClick={() => setDeleteProductConfirm(prod)}
                                    className="p-2 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 border border-slate-200 transition-all cursor-pointer flex items-center justify-center"
                                    title="Eliminar producto"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 6: FINANZAS (Control Financiero, Facturas Stock, Ventas, Gastos & IVA) */}
        {/* ========================================================================= */}
        {activeTab === 'finanzas' && (() => {
          const filteredFinancesOrders = orders.filter((o) => {
            const channel = o.channel || 'web';
            const matchesChannel = financesSalesChannelFilter === 'todos' || channel === financesSalesChannelFilter;
            const normPayment = normalizePaymentMethod(o.paymentMethod);
            const matchesPayment = financesPaymentMethodFilter === 'todos' || normPayment === financesPaymentMethodFilter;
            return matchesChannel && matchesPayment;
          });

          const paymentBreakdown = {
            Web: { count: orders.filter((o) => normalizePaymentMethod(o.paymentMethod) === 'Web').length, total: orders.filter((o) => normalizePaymentMethod(o.paymentMethod) === 'Web').reduce((s, o) => s + (o.total || 0), 0) },
            Tarjeta: { count: orders.filter((o) => normalizePaymentMethod(o.paymentMethod) === 'Tarjeta').length, total: orders.filter((o) => normalizePaymentMethod(o.paymentMethod) === 'Tarjeta').reduce((s, o) => s + (o.total || 0), 0) },
            Efectivo: { count: orders.filter((o) => normalizePaymentMethod(o.paymentMethod) === 'Efectivo').length, total: orders.filter((o) => normalizePaymentMethod(o.paymentMethod) === 'Efectivo').reduce((s, o) => s + (o.total || 0), 0) },
            Transferencia: { count: orders.filter((o) => normalizePaymentMethod(o.paymentMethod) === 'Transferencia').length, total: orders.filter((o) => normalizePaymentMethod(o.paymentMethod) === 'Transferencia').reduce((s, o) => s + (o.total || 0), 0) },
          };

          const filteredInvoices = invoices.filter((inv) => {
            if (financesInvoiceStatusFilter === 'todas') return true;
            return inv.status === financesInvoiceStatusFilter;
          });

          const filteredExpenses = expenses.filter((exp) => {
            const matchesCat = expenseFilterCategory === 'todos' ? true : exp.category === expenseFilterCategory;
            const isFac =
              exp.hasIvaCredit ||
              exp.documentType === 'factura' ||
              (exp.documentNumber && exp.documentNumber.startsWith('FAC'));
            const matchesDoc =
              financesExpenseDocFilter === 'todos'
                ? true
                : financesExpenseDocFilter === 'factura'
                ? isFac
                : !isFac;
            return matchesCat && matchesDoc;
          });

          // Cálculo dinámico para la pestaña F29 según período/mes seleccionado
          const f29FilteredData = (() => {
            if (f29PeriodFilter === 'todos') {
              return {
                ...financialMetrics,
                periodLabel: 'Todo el Histórico (Consolidado)',
                filteredOrdersCount: orders.length,
                filteredInvoicesCount: invoices.length,
                filteredExpensesCount: expenses.length,
              };
            }
            const matchPeriod = (dateStr) => {
              if (!dateStr) return false;
              const str = String(dateStr).toLowerCase();
              if (f29PeriodFilter === '2026-08' || f29PeriodFilter === 'ago') {
                return str.includes('ago') || str.includes('08') || str.includes('aug');
              }
              if (f29PeriodFilter === '2026-09' || f29PeriodFilter === 'sep') {
                return str.includes('sep') || str.includes('09');
              }
              if (f29PeriodFilter === '2026-10' || f29PeriodFilter === 'oct' || f29PeriodFilter === 'current') {
                return str.includes('oct') || str.includes('10');
              }
              return true;
            };

            const periodOrders = orders.filter((o) => matchPeriod(o.date));
            const periodInvoices = invoices.filter((i) => matchPeriod(i.date));
            const periodExpenses = expenses.filter((e) => matchPeriod(e.date));

            const totalSales = periodOrders.reduce((sum, o) => sum + (o.total || 0), 0);
            const salesNeto = Math.round(totalSales / 1.19);
            const ivaDebito = totalSales - salesNeto;

            const webOrders = periodOrders.filter((o) => (o.channel || 'web') === 'web');
            const manualOrders = periodOrders.filter((o) => o.channel === 'manual');
            const webSales = webOrders.reduce((sum, o) => sum + (o.total || 0), 0);
            const manualSales = manualOrders.reduce((sum, o) => sum + (o.total || 0), 0);
            const webSalesNeto = Math.round(webSales / 1.19);
            const webIvaDebito = webSales - webSalesNeto;
            const manualSalesNeto = Math.round(manualSales / 1.19);
            const manualIvaDebito = manualSales - manualSalesNeto;

            const invoicesNeto = periodInvoices.reduce((sum, inv) => sum + (inv.totalNeto || 0), 0);
            const invoicesIvaCredito = periodInvoices.reduce(
              (sum, inv) => sum + (inv.iva || Math.round((inv.totalNeto || 0) * 0.19)),
              0
            );
            const invoicesTotalBruto = periodInvoices.reduce(
              (sum, inv) => sum + (inv.totalBruto || (inv.totalNeto || 0) + (inv.iva || 0)),
              0
            );

            const expensesIvaCredito = periodExpenses.reduce((sum, e) => {
              if (
                e.hasIvaCredit ||
                e.documentType === 'factura' ||
                (e.documentNumber && e.documentNumber.startsWith('FAC'))
              ) {
                const neto = Math.round(e.amount / 1.19);
                return sum + (e.amount - neto);
              }
              return sum;
            }, 0);

            const totalIvaCredito = invoicesIvaCredito + expensesIvaCredito;
            const ivaBalance = ivaDebito - totalIvaCredito;
            const ivaStatus = ivaBalance > 0 ? 'a_pagar' : 'remanente';
            const ivaCoveredPercent =
              ivaDebito > 0 ? Math.min(100, Math.round((totalIvaCredito / ivaDebito) * 100)) : 100;

            const periodLabels = {
              '2026-08': 'Agosto 2026',
              '2026-09': 'Septiembre 2026',
              '2026-10': 'Octubre 2026 (Mes Actual)',
              'current': 'Octubre 2026 (Mes Actual)',
            };

            return {
              periodLabel: periodLabels[f29PeriodFilter] || f29PeriodFilter,
              totalSales,
              salesNeto,
              ivaDebito,
              webSales,
              webSalesNeto,
              webIvaDebito,
              manualSales,
              manualSalesNeto,
              manualIvaDebito,
              invoicesNeto,
              invoicesIvaCredito,
              invoicesTotalBruto,
              invoicesCount: periodInvoices.length,
              expensesIvaCredito,
              totalIvaCredito,
              ivaBalance,
              ivaStatus,
              ivaCoveredPercent,
              filteredOrdersCount: periodOrders.length,
              filteredInvoicesCount: periodInvoices.length,
              filteredExpensesCount: periodExpenses.length,
            };
          })();

          // Lista combinada de todos los egresos (Facturas Stock + Gastos Operacionales)
          const combinedGastosList = [
            ...invoices.map((inv) => ({
              type: 'factura',
              id: inv.invoiceNumber,
              provider: inv.provider,
              rut: inv.rut,
              date: inv.date,
              description: inv.productName || 'Mercadería & Stock para Bodega',
              quantity: inv.quantityReceived || inv.itemsCount || 1,
              neto: inv.totalNeto,
              iva: inv.iva,
              total: inv.totalBruto,
              hasIvaCredit: true,
              paymentMethod: inv.paymentMethod,
              status: inv.status,
            })),
            ...expenses.map((exp) => ({
              type: 'gasto',
              id: exp.documentNumber || exp.id,
              provider: exp.provider,
              rut: exp.rut || 'N/A',
              date: exp.date,
              description: `${exp.icon || '🧾'} ${exp.description}`,
              quantity: null,
              neto: exp.neto,
              iva: exp.iva,
              total: exp.amount,
              hasIvaCredit: exp.hasIvaCredit,
              paymentMethod: exp.paymentMethod,
              status: 'pagado',
              category: exp.categoryLabel || exp.category,
            })),
          ];

          return (
            <div className="space-y-6 animate-in fade-in duration-300">
              {/* ========================================================================= */}
              {/* SUB-TABS CAPSULE (iOS Native Minimalist & Pastel Style)                   */}
              {/* ========================================================================= */}
              <div className="flex justify-center items-center w-full py-2">
                <div className="inline-flex items-center p-1.5 rounded-full bg-slate-100/90 backdrop-blur-md border border-slate-200/80 shadow-xs gap-1.5 overflow-x-auto max-w-full scrollbar-none">
                  {/* TAB 1: RESUMEN */}
                  <button
                    type="button"
                    onClick={() => setFinancesSubTab('resumen')}
                    className={`inline-flex items-center gap-2 px-4 sm:px-5 py-2 rounded-full font-bold text-xs transition-all duration-300 cursor-pointer ${
                      financesSubTab === 'resumen'
                        ? 'bg-white text-slate-900 shadow-[0_2px_8px_rgba(0,0,0,0.06)] border border-slate-200/70 font-black'
                        : 'text-slate-500 hover:text-slate-900 hover:bg-white/40'
                    }`}
                  >
                    <LayoutDashboard className={`w-3.5 h-3.5 ${financesSubTab === 'resumen' ? 'text-indigo-500' : 'text-slate-400'}`} />
                    <span>Resumen</span>
                  </button>

                  {/* TAB 2: GASTOS */}
                  <button
                    type="button"
                    onClick={() => setFinancesSubTab('gastos')}
                    className={`inline-flex items-center gap-2 px-4 sm:px-5 py-2 rounded-full font-bold text-xs transition-all duration-300 cursor-pointer ${
                      financesSubTab === 'gastos'
                        ? 'bg-white text-slate-900 shadow-[0_2px_8px_rgba(0,0,0,0.06)] border border-slate-200/70 font-black'
                        : 'text-slate-500 hover:text-slate-900 hover:bg-white/40'
                    }`}
                  >
                    <Receipt className={`w-3.5 h-3.5 ${financesSubTab === 'gastos' ? 'text-amber-500' : 'text-slate-400'}`} />
                    <span>Gastos</span>
                    <span
                      className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                        financesSubTab === 'gastos'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200/70'
                          : 'bg-slate-200/60 text-slate-600'
                      }`}
                    >
                      {invoices.length + expenses.length}
                    </span>
                  </button>

                  {/* TAB 3: INGRESOS */}
                  <button
                    type="button"
                    onClick={() => setFinancesSubTab('ingresos')}
                    className={`inline-flex items-center gap-2 px-4 sm:px-5 py-2 rounded-full font-bold text-xs transition-all duration-300 cursor-pointer ${
                      financesSubTab === 'ingresos'
                        ? 'bg-white text-slate-900 shadow-[0_2px_8px_rgba(0,0,0,0.06)] border border-slate-200/70 font-black'
                        : 'text-slate-500 hover:text-slate-900 hover:bg-white/40'
                    }`}
                  >
                    <TrendingUp className={`w-3.5 h-3.5 ${financesSubTab === 'ingresos' ? 'text-emerald-500' : 'text-slate-400'}`} />
                    <span>Ingresos</span>
                    <span
                      className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                        financesSubTab === 'ingresos'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/70'
                          : 'bg-slate-200/60 text-slate-600'
                      }`}
                    >
                      {orders.length}
                    </span>
                  </button>

                  {/* TAB 4: F29 */}
                  <button
                    type="button"
                    onClick={() => setFinancesSubTab('f29')}
                    className={`inline-flex items-center gap-2 px-4 sm:px-5 py-2 rounded-full font-bold text-xs transition-all duration-300 cursor-pointer ${
                      financesSubTab === 'f29'
                        ? 'bg-white text-slate-900 shadow-[0_2px_8px_rgba(0,0,0,0.06)] border border-slate-200/70 font-black'
                        : 'text-slate-500 hover:text-slate-900 hover:bg-white/40'
                    }`}
                  >
                    <Calculator className={`w-3.5 h-3.5 ${financesSubTab === 'f29' ? 'text-purple-500' : 'text-slate-400'}`} />
                    <span>F29 (IVA)</span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        financialMetrics.ivaStatus === 'remanente'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/70'
                          : 'bg-rose-50 text-rose-700 border border-rose-200/70'
                      }`}
                    >
                      {financialMetrics.ivaStatus === 'remanente' ? 'A Favor' : 'A Pagar'}
                    </span>
                  </button>
                </div>
              </div>

              {/* ========================================================================= */}
              {/* PESTAÑA 1: RESUMEN                                                        */}
              {/* ========================================================================= */}
              {financesSubTab === 'resumen' && (
                <div className="space-y-6">
                  {/* Top 4 KPI Cards (Pastel & Minimalist iOS Style) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Card 1: Ingresos Totales */}
                    <div className="bg-gradient-to-br from-emerald-50/70 via-white to-teal-50/40 border border-emerald-100/90 rounded-3xl p-5 space-y-2 shadow-xs relative overflow-hidden">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500 text-[11px] font-extrabold uppercase tracking-wider">
                          Ingresos Totales
                        </span>
                        <span className="p-1.5 rounded-xl bg-emerald-100/70 text-emerald-700">
                          <TrendingUp className="w-4 h-4" />
                        </span>
                      </div>
                      <div className="text-2xl font-black text-slate-900">{formatCLP(financialMetrics.totalSales)}</div>
                      <div className="text-[11px] text-slate-500 font-semibold space-y-0.5">
                        <div className="flex justify-between">
                          <span>Neto: {formatCLP(financialMetrics.salesNeto)}</span>
                          <span className="text-rose-600 font-bold">IVA: {formatCLP(financialMetrics.ivaDebito)}</span>
                        </div>
                        <div className="text-[10px] text-slate-400">
                          🌐 Web: {formatCLP(financialMetrics.webSales)} • ✍️ Manual: {formatCLP(financialMetrics.manualSales)}
                        </div>
                      </div>
                    </div>

                    {/* Card 2: Egresos Totales (Facturas Stock + Gastos Operacionales) */}
                    <div className="bg-gradient-to-br from-amber-50/70 via-white to-orange-50/40 border border-amber-100/90 rounded-3xl p-5 space-y-2 shadow-xs relative overflow-hidden">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500 text-[11px] font-extrabold uppercase tracking-wider">
                          Egresos Totales
                        </span>
                        <span className="p-1.5 rounded-xl bg-amber-100/70 text-amber-700">
                          <Receipt className="w-4 h-4" />
                        </span>
                      </div>
                      <div className="text-2xl font-black text-amber-800">
                        {formatCLP(financialMetrics.invoicesTotalBruto + financialMetrics.totalRegisteredExpenses)}
                      </div>
                      <div className="text-[11px] text-slate-500 font-semibold space-y-0.5">
                        <div className="flex justify-between">
                          <span>📦 Stock: {formatCLP(financialMetrics.invoicesTotalBruto)}</span>
                          <span>🧾 Operac: {formatCLP(financialMetrics.totalRegisteredExpenses)}</span>
                        </div>
                        <div className="text-[10px] text-emerald-700 font-bold">
                          IVA Crédito Ahorrado: +{formatCLP(financialMetrics.totalIvaCredito)}
                        </div>
                      </div>
                    </div>

                    {/* Card 3: Utilidad Operativa EBITDA */}
                    <div className="bg-gradient-to-br from-sky-50/70 via-white to-indigo-50/40 border border-sky-100/90 rounded-3xl p-5 space-y-2 shadow-xs relative overflow-hidden">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500 text-[11px] font-extrabold uppercase tracking-wider">
                          Utilidad Real
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 text-[10px] font-black uppercase">
                          EBITDA
                        </span>
                      </div>
                      <div className="text-2xl font-black text-sky-900">{formatCLP(financialMetrics.netProfit)}</div>
                      <div className="text-[11px] text-sky-700 font-bold">
                        {financialMetrics.netProfitPercent}% rentabilidad neta real
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Margen bruto: {formatCLP(financialMetrics.grossMargin)} ({financialMetrics.grossMarginPercent}%)
                      </div>
                    </div>

                    {/* Card 4: Balance Semáforo F29 */}
                    <div className="bg-gradient-to-br from-purple-50/70 via-white to-indigo-50/40 border border-purple-100/90 rounded-3xl p-5 space-y-2 shadow-xs relative overflow-hidden">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500 text-[11px] font-extrabold uppercase tracking-wider">
                          Balance IVA F29
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                            financialMetrics.ivaStatus === 'remanente'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {financialMetrics.ivaStatus === 'remanente' ? 'A Favor' : 'A Pagar'}
                        </span>
                      </div>
                      <div className="text-2xl font-black text-purple-900">
                        {formatCLP(Math.abs(financialMetrics.ivaBalance))}
                      </div>
                      <div className="text-[11px] text-slate-500 font-semibold flex items-center justify-between">
                        <span>{financialMetrics.ivaStatus === 'remanente' ? 'Remanente Fiscal' : 'Impuesto Líquido'}</span>
                        <button
                          type="button"
                          onClick={() => setFinancesSubTab('f29')}
                          className="text-purple-600 hover:text-purple-800 font-bold text-xs underline cursor-pointer"
                        >
                          Ver F29 →
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Flow Bar: Proporción Visual de Ingresos vs Egresos */}
                  <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                      <div>
                        <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                          <span>Distribución del Flujo de Caja</span>
                          <span className="text-base">📊</span>
                        </h3>
                        <p className="text-xs text-slate-500">
                          Relación porcentual de costos de mercadería, gastos de operación y utilidad neta sobre las ventas.
                        </p>
                      </div>
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                        <span className="inline-block w-2.5 h-2.5 rounded-full bg-teal-400" /> Stock (58%)
                        <span className="inline-block w-2.5 h-2.5 rounded-full bg-amber-400" /> Gastos Operac. ({((financialMetrics.totalRegisteredExpenses / (financialMetrics.totalSales || 1)) * 100).toFixed(0)}%)
                        <span className="inline-block w-2.5 h-2.5 rounded-full bg-sky-400" /> Utilidad Real ({financialMetrics.netProfitPercent}%)
                      </div>
                    </div>

                    {/* Barra Proporcional */}
                    <div className="w-full h-3 rounded-full bg-slate-100 overflow-hidden flex shadow-inner">
                      <div className="h-full bg-teal-400 transition-all duration-500" style={{ width: '58%' }} title="Costo Mercadería: 58%" />
                      <div
                        className="h-full bg-amber-400 transition-all duration-500"
                        style={{ width: `${Math.min(30, Math.max(5, ((financialMetrics.totalRegisteredExpenses / (financialMetrics.totalSales || 1)) * 100)))}%` }}
                        title="Gastos Operacionales"
                      />
                      <div
                        className="h-full bg-sky-400 transition-all duration-500"
                        style={{ width: `${Math.max(10, Math.min(35, parseFloat(financialMetrics.netProfitPercent) || 15))}%` }}
                        title="Utilidad Neta"
                      />
                    </div>

                    {/* Resumen en 3 pasteles */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 text-xs">
                      <div className="p-3.5 rounded-2xl bg-teal-50/60 border border-teal-100 space-y-1">
                        <span className="font-extrabold text-teal-800 uppercase text-[10px]">Costo Mercadería Vendida (COGS)</span>
                        <div className="font-black text-slate-900 text-sm font-mono">{formatCLP(financialMetrics.estimatedCOGS || Math.round(financialMetrics.totalSales * 0.58))}</div>
                        <span className="text-[10px] text-teal-700">Reposición de inventario y compras</span>
                      </div>
                      <div className="p-3.5 rounded-2xl bg-amber-50/60 border border-amber-100 space-y-1">
                        <span className="font-extrabold text-amber-800 uppercase text-[10px]">Gastos Fijos & Trámites</span>
                        <div className="font-black text-slate-900 text-sm font-mono">{formatCLP(financialMetrics.totalOperatingExpenses || financialMetrics.totalRegisteredExpenses)}</div>
                        <span className="text-[10px] text-amber-700">Notaría, bencina, packaging y arriendos</span>
                      </div>
                      <div className="p-3.5 rounded-2xl bg-sky-50/60 border border-sky-100 space-y-1">
                        <span className="font-extrabold text-sky-800 uppercase text-[10px]">Margen Neto Final Disponible</span>
                        <div className="font-black text-slate-900 text-sm font-mono">{formatCLP(financialMetrics.netProfit)}</div>
                        <span className="text-[10px] text-sky-700">Ganancia neta retenida por la empresa</span>
                      </div>
                    </div>
                  </div>

                  {/* 2 Cards complementarias: Mercado Pago & Inventario */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Card 1: Mercado Pago */}
                    <div className="bg-white border border-slate-200/80 rounded-3xl p-6 space-y-4 shadow-xs">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                        <div className="flex items-center gap-2">
                          <CreditCard className="w-5 h-5 text-blue-600" />
                          <h3 className="text-sm font-black text-slate-900">Cobros con Tarjetas & Mercado Pago</h3>
                        </div>
                        <button
                          type="button"
                          onClick={() => setIsMercadoPagoModalOpen(true)}
                          className="px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer"
                        >
                          Configurar Pasarela →
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-1">
                          <span className="text-slate-400 text-[10px] font-bold uppercase">Ventas Procesadas</span>
                          <div className="font-black text-slate-900 font-mono text-sm">{formatCLP(financialMetrics.mpSales)}</div>
                          <span className="text-[10px] text-slate-500">{financialMetrics.mpTxCount} cobros</span>
                        </div>
                        <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-1">
                          <span className="text-slate-400 text-[10px] font-bold uppercase">Líquido Recibido</span>
                          <div className="font-black text-emerald-700 font-mono text-sm">{formatCLP(financialMetrics.mpNetRevenueReceived)}</div>
                          <span className="text-[10px] text-slate-500">Tasa efec. {financialMetrics.mpEffectiveRate}%</span>
                        </div>
                      </div>
                    </div>

                    {/* Card 2: Valorización de Inventario en Bodega */}
                    <div className="bg-white border border-slate-200/80 rounded-3xl p-6 space-y-4 shadow-xs">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                        <div className="flex items-center gap-2">
                          <Package className="w-5 h-5 text-teal-600" />
                          <h3 className="text-sm font-black text-slate-900">Capital Activo en Bodega (Stock)</h3>
                        </div>
                        <span className="text-xs text-slate-400 font-bold">{inventory.length} productos</span>
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-1">
                          <span className="text-slate-400 text-[10px] font-bold uppercase">Costo Invertido Neto</span>
                          <div className="font-black text-slate-900 font-mono text-sm">{formatCLP(financialMetrics.totalInventoryCost)}</div>
                          <span className="text-[10px] text-slate-500">Valor de reposición</span>
                        </div>
                        <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-1">
                          <span className="text-slate-400 text-[10px] font-bold uppercase">Venta Estimada (PVP)</span>
                          <div className="font-black text-teal-700 font-mono text-sm">{formatCLP(financialMetrics.totalInventoryPVP)}</div>
                          <span className="text-[10px] text-teal-600 font-bold">Ganancia potencial en stock</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Acceso Rápido a Últimos Movimientos */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Quick Gastos */}
                    <div className="bg-white border border-slate-200/80 rounded-3xl p-6 space-y-4 shadow-xs">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                        <div>
                          <h3 className="text-sm font-black text-slate-900">Egresos Recientes</h3>
                          <p className="text-[11px] text-slate-500">Facturas de stock y gastos operacionales</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setFinancesSubTab('gastos')}
                          className="text-amber-600 font-bold text-xs hover:underline cursor-pointer"
                        >
                          Ver todos los gastos ({invoices.length + expenses.length}) →
                        </button>
                      </div>

                      <div className="space-y-2">
                        {combinedGastosList.slice(0, 3).map((item, idx) => (
                          <div key={idx} className="p-3 rounded-2xl bg-slate-50 border border-slate-200/70 flex items-center justify-between gap-3 text-xs">
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span className={`px-1.5 py-0.2 rounded-md text-[9px] font-bold uppercase ${item.type === 'factura' ? 'bg-teal-50 text-teal-700 border border-teal-200' : 'bg-amber-50 text-amber-700 border border-amber-200'}`}>
                                  {item.type === 'factura' ? 'Factura Stock' : 'Gasto'}
                                </span>
                                <span className="font-mono font-bold text-slate-700">{item.id}</span>
                              </div>
                              <div className="font-bold text-slate-900 truncate mt-0.5">{item.provider}</div>
                              <div className="text-[10px] text-slate-400">{item.description} • {item.date}</div>
                            </div>
                            <div className="text-right shrink-0">
                              <div className="font-black text-slate-900 font-mono">{formatCLP(item.total)}</div>
                              <span className="text-[9px] text-emerald-700 font-bold block">
                                IVA: +{formatCLP(item.iva)}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Quick Ventas */}
                    <div className="bg-white border border-slate-200/80 rounded-3xl p-6 space-y-4 shadow-xs">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                        <div>
                          <h3 className="text-sm font-black text-slate-900">Ventas Recientes</h3>
                          <p className="text-[11px] text-slate-500">Pedidos procesados en web y ventas manuales</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setFinancesSubTab('ingresos')}
                          className="text-blue-600 font-bold text-xs hover:underline cursor-pointer"
                        >
                          Ver todas las ventas ({orders.length}) →
                        </button>
                      </div>

                      <div className="space-y-2">
                        {orders.slice(0, 3).map((ord) => {
                          const isManual = ord.channel === 'manual';
                          return (
                            <div key={ord.id} className="p-3 rounded-2xl bg-slate-50 border border-slate-200/70 flex items-center justify-between gap-3 text-xs">
                              <div className="min-w-0">
                                <div className="flex items-center gap-1.5">
                                  <span className="font-mono font-bold text-slate-700">{ord.id}</span>
                                  <span className={`px-1.5 py-0.2 rounded-md text-[9px] font-bold ${isManual ? 'bg-purple-50 text-purple-700 border border-purple-200' : 'bg-sky-50 text-sky-700 border border-sky-200'}`}>
                                    {isManual ? '✍️ Manual' : '🌐 Web'}
                                  </span>
                                </div>
                                <div className="font-bold text-slate-900 truncate mt-0.5">{ord.customer?.name || 'Cliente'}</div>
                                <div className="text-[10px] text-slate-400">{ord.date} • {ord.paymentMethod}</div>
                              </div>
                              <div className="text-right shrink-0">
                                <div className="font-black text-slate-900 font-mono">{formatCLP(ord.total)}</div>
                                <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-emerald-50 text-emerald-700 border border-emerald-200 inline-block mt-0.5">
                                  {ord.status}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ========================================================================= */}
              {/* PESTAÑA 2: GASTOS (Unificación de Facturas Stock + Gastos Operacionales)   */}
              {/* ========================================================================= */}
              {financesSubTab === 'gastos' && (
                <div className="space-y-6">
                  {/* Header de Gastos */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-3xl bg-gradient-to-r from-amber-50/70 via-orange-50/40 to-white border border-amber-200/70 shadow-xs">
                    <div>
                      <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                        <span>Control Integral de Gastos & Egresos</span>
                        <span className="text-lg">🧾</span>
                      </h2>
                      <p className="text-xs text-slate-600 mt-0.5">
                        Facturas de compra de mercadería (con aumento automático de stock) y gastos operacionales (notaría, bencina, packaging y arriendos).
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => setIsAddInvoiceModalOpen(true)}
                        className="px-3.5 py-2 rounded-2xl bg-gradient-to-r from-[#0E8388] to-[#10B981] hover:opacity-95 text-white text-xs font-black flex items-center gap-1.5 shadow-sm cursor-pointer"
                      >
                        <Package className="w-3.5 h-3.5" />
                        <span>+ Cargar Factura Stock</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setIsAddExpenseModalOpen(true)}
                        className="px-3.5 py-2 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-black flex items-center gap-1.5 shadow-sm cursor-pointer"
                      >
                        <Receipt className="w-3.5 h-3.5" />
                        <span>+ Registrar Gasto</span>
                      </button>
                    </div>
                  </div>

                  {/* 4 Pastel KPI Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-gradient-to-br from-amber-50/70 via-white to-orange-50/30 border border-amber-200/70 rounded-3xl p-5 space-y-1 shadow-xs">
                      <span className="text-[10px] font-extrabold uppercase text-slate-400 block">Total Egresos Combinados</span>
                      <div className="text-2xl font-black text-slate-900 font-mono">
                        {formatCLP(financialMetrics.invoicesTotalBruto + financialMetrics.totalRegisteredExpenses)}
                      </div>
                      <span className="text-[10px] text-slate-500 font-medium">
                        {invoices.length + expenses.length} egresos computados
                      </span>
                    </div>

                    <div className="bg-gradient-to-br from-teal-50/70 via-white to-emerald-50/30 border border-teal-200/70 rounded-3xl p-5 space-y-1 shadow-xs">
                      <span className="text-[10px] font-extrabold uppercase text-teal-800 block">Facturas Stock (Mercadería)</span>
                      <div className="text-2xl font-black text-slate-900 font-mono">
                        {formatCLP(financialMetrics.invoicesTotalBruto)}
                      </div>
                      <span className="text-[10px] text-teal-700 font-medium">
                        {invoices.length} facturas • +{financialMetrics.invoicesTotalUnits} un. a bodega
                      </span>
                    </div>

                    <div className="bg-gradient-to-br from-orange-50/70 via-white to-amber-50/30 border border-orange-200/70 rounded-3xl p-5 space-y-1 shadow-xs">
                      <span className="text-[10px] font-extrabold uppercase text-amber-800 block">Gastos Operacionales & Notaría</span>
                      <div className="text-2xl font-black text-amber-800 font-mono">
                        {formatCLP(financialMetrics.totalRegisteredExpenses)}
                      </div>
                      <span className="text-[10px] text-slate-500 font-medium">
                        {expenses.length} comprobantes de gasto
                      </span>
                    </div>

                    <div className="bg-gradient-to-br from-emerald-50/70 via-white to-teal-50/30 border border-emerald-200/70 rounded-3xl p-5 space-y-1 shadow-xs">
                      <span className="text-[10px] font-extrabold uppercase text-emerald-800 block">IVA Crédito Ahorrado</span>
                      <div className="text-2xl font-black text-emerald-700 font-mono">
                        +{formatCLP(financialMetrics.totalIvaCredito)}
                      </div>
                      <span className="text-[10px] text-emerald-700 font-bold">
                        A tu favor para rebajar en F29
                      </span>
                    </div>
                  </div>

                  {/* Segmented Sub-Capsule Filter (iOS Style) */}
                  <div className="flex justify-center items-center w-full py-1">
                    <div className="inline-flex items-center p-1 rounded-full bg-slate-100/90 border border-slate-200/80 shadow-xs gap-1">
                      <button
                        type="button"
                        onClick={() => setGastosTabFilter('todos')}
                        className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                          gastosTabFilter === 'todos'
                            ? 'bg-white text-slate-900 shadow-xs border border-slate-200 font-black'
                            : 'text-slate-500 hover:text-slate-900'
                        }`}
                      >
                        Todos los Gastos ({invoices.length + expenses.length})
                      </button>

                      <button
                        type="button"
                        onClick={() => setGastosTabFilter('facturas')}
                        className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                          gastosTabFilter === 'facturas'
                            ? 'bg-white text-[#0E8388] shadow-xs border border-teal-200 font-black'
                            : 'text-slate-500 hover:text-slate-900'
                        }`}
                      >
                        <Package className="w-3.5 h-3.5" />
                        <span>Facturas Proveedores ({invoices.length})</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setGastosTabFilter('operacionales')}
                        className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                          gastosTabFilter === 'operacionales'
                            ? 'bg-white text-amber-700 shadow-xs border border-amber-200 font-black'
                            : 'text-slate-500 hover:text-slate-900'
                        }`}
                      >
                        <Receipt className="w-3.5 h-3.5" />
                        <span>Gastos Operacionales ({expenses.length})</span>
                      </button>
                    </div>
                  </div>

                  {/* VISTA 1: TODOS LOS GASTOS (Vista Unificada) */}
                  {gastosTabFilter === 'todos' && (
                    <div className="space-y-4">
                      {/* Category Breakdown Chips */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                        <div className="p-3 rounded-2xl bg-teal-50/70 border border-teal-100 text-xs space-y-1">
                          <span className="text-[10px] font-bold text-teal-800 uppercase block">📦 Stock & Compras</span>
                          <div className="font-mono font-bold text-slate-900">{formatCLP(financialMetrics.invoicesTotalBruto)}</div>
                        </div>
                        <div className="p-3 rounded-2xl bg-amber-50/70 border border-amber-100 text-xs space-y-1">
                          <span className="text-[10px] font-bold text-amber-800 uppercase block">⚖️ Notaría & Legal</span>
                          <div className="font-mono font-bold text-slate-900">{formatCLP(financialMetrics.notariaExpenses)}</div>
                        </div>
                        <div className="p-3 rounded-2xl bg-orange-50/70 border border-orange-100 text-xs space-y-1">
                          <span className="text-[10px] font-bold text-orange-800 uppercase block">⛽ Combustible</span>
                          <div className="font-mono font-bold text-slate-900">{formatCLP(financialMetrics.combustibleExpenses)}</div>
                        </div>
                        <div className="p-3 rounded-2xl bg-rose-50/70 border border-rose-100 text-xs space-y-1">
                          <span className="text-[10px] font-bold text-rose-800 uppercase block">📦 Packaging & Bolsas</span>
                          <div className="font-mono font-bold text-slate-900">{formatCLP(financialMetrics.packagingExpenses)}</div>
                        </div>
                        <div className="p-3 rounded-2xl bg-indigo-50/70 border border-indigo-100 text-xs space-y-1">
                          <span className="text-[10px] font-bold text-indigo-800 uppercase block">🏢 Servicios & Fijos</span>
                          <div className="font-mono font-bold text-slate-900">{formatCLP(financialMetrics.fixedExpenses + financialMetrics.servicesExpenses)}</div>
                        </div>
                      </div>

                      {/* Unified Expenses Table */}
                      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                          <h3 className="text-sm font-black text-slate-900">Listado Unificado de Egresos</h3>
                          <span className="text-xs text-slate-400 font-medium">{combinedGastosList.length} movimientos</span>
                        </div>

                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-xs">
                            <thead className="text-slate-400 uppercase tracking-wider text-[10px] bg-slate-50 border-b border-slate-200">
                              <tr>
                                <th className="py-3 px-3">Tipo</th>
                                <th className="py-3 px-3">N° Documento</th>
                                <th className="py-3 px-3">Proveedor / Emisor</th>
                                <th className="py-3 px-3">Concepto / Detalle</th>
                                <th className="py-3 px-3">Fecha</th>
                                <th className="py-3 px-3">Monto Neto</th>
                                <th className="py-3 px-3">IVA Crédito</th>
                                <th className="py-3 px-3">Total Bruto</th>
                                <th className="py-3 px-3 text-center">Estado</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                              {combinedGastosList.map((item, idx) => (
                                <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                                  <td className="py-3 px-3">
                                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${item.type === 'factura' ? 'bg-teal-50 text-teal-800 border border-teal-200' : 'bg-amber-50 text-amber-800 border border-amber-200'}`}>
                                      {item.type === 'factura' ? '📥 Factura Stock' : '🧾 Gasto Operacional'}
                                    </span>
                                  </td>
                                  <td className="py-3 px-3 font-mono font-bold text-slate-700">{item.id}</td>
                                  <td className="py-3 px-3 font-bold text-slate-900">{item.provider}</td>
                                  <td className="py-3 px-3 text-slate-600 max-w-xs truncate">{item.description}</td>
                                  <td className="py-3 px-3 text-slate-500 whitespace-nowrap">{item.date}</td>
                                  <td className="py-3 px-3 font-mono text-slate-700">{formatCLP(item.neto)}</td>
                                  <td className="py-3 px-3 font-mono font-bold text-emerald-700">+{formatCLP(item.iva)}</td>
                                  <td className="py-3 px-3 font-mono font-black text-slate-900">{formatCLP(item.total)}</td>
                                  <td className="py-3 px-3 text-center">
                                    <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
                                      {item.status}
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* VISTA 2: FACTURAS DE PROVEEDORES */}
                  {gastosTabFilter === 'facturas' && (
                    <div className="bg-white border border-slate-200/80 rounded-3xl p-6 space-y-4 shadow-xs">
                      {/* Status Filters */}
                      <div className="flex flex-wrap items-center gap-1.5">
                        {[
                          { id: 'todas', label: `Todas (${invoices.length})` },
                          { id: 'pagada', label: `Pagadas (${invoices.filter((i) => i.status === 'pagada').length})` },
                          { id: 'pendiente', label: `Pendientes (${invoices.filter((i) => i.status === 'pendiente').length})` },
                        ].map((tab) => (
                          <button
                            key={tab.id}
                            type="button"
                            onClick={() => setFinancesInvoiceStatusFilter(tab.id)}
                            className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                              financesInvoiceStatusFilter === tab.id
                                ? 'bg-slate-900 text-white shadow-xs'
                                : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                            }`}
                          >
                            {tab.label}
                          </button>
                        ))}
                      </div>

                      {/* Facturas Table */}
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                          <thead className="text-slate-500 uppercase tracking-wider text-[10px] bg-slate-50/80 border-b border-slate-200">
                            <tr>
                              <th className="py-3 px-3">N° Factura</th>
                              <th className="py-3 px-3">Proveedor & RUT</th>
                              <th className="py-3 px-3">Producto & Stock Cargado</th>
                              <th className="py-3 px-3">Emisión / Venc.</th>
                              <th className="py-3 px-3">Monto Neto</th>
                              <th className="py-3 px-3">IVA Crédito (19%)</th>
                              <th className="py-3 px-3">Total Bruto</th>
                              <th className="py-3 px-3">Medio Pago</th>
                              <th className="py-3 px-3 text-center">Estado</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {filteredInvoices.map((inv, idx) => (
                              <tr key={idx} className="hover:bg-slate-50 transition-colors">
                                <td className="py-3.5 px-3 font-mono font-bold text-[#0E8388]">{inv.invoiceNumber}</td>
                                <td className="py-3.5 px-3">
                                  <div className="font-bold text-slate-900">{inv.provider}</div>
                                  <div className="text-[10px] text-slate-400 font-mono">{inv.rut}</div>
                                </td>
                                <td className="py-3.5 px-3">
                                  <div className="font-semibold text-slate-900">{inv.productName || 'Mercadería surtida'}</div>
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 text-[10px] font-bold border border-emerald-200/60 mt-0.5">
                                    <span>📦 +{inv.quantityReceived || inv.itemsCount || 1} un. a bodega</span>
                                  </span>
                                </td>
                                <td className="py-3.5 px-3">
                                  <div className="text-slate-700">{inv.date}</div>
                                  <div className="text-[10px] text-slate-400">{inv.dueDate}</div>
                                </td>
                                <td className="py-3.5 px-3 font-mono text-slate-700">{formatCLP(inv.totalNeto)}</td>
                                <td className="py-3.5 px-3 font-mono font-bold text-emerald-700">+{formatCLP(inv.iva)}</td>
                                <td className="py-3.5 px-3 font-black text-slate-900 font-mono text-sm">
                                  {formatCLP(inv.totalBruto)}
                                </td>
                                <td className="py-3.5 px-3 text-slate-600 font-medium">{inv.paymentMethod}</td>
                                <td className="py-3.5 px-3 text-center">
                                  <button
                                    type="button"
                                    onClick={() => handleToggleInvoiceStatus(inv.invoiceNumber)}
                                    className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase transition-all cursor-pointer ${
                                      inv.status === 'pagada'
                                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                                        : 'bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100'
                                    }`}
                                    title="Haz clic para cambiar estado Pagada / Pendiente"
                                  >
                                    {inv.status}
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* VISTA 3: GASTOS OPERACIONALES */}
                  {gastosTabFilter === 'operacionales' && (
                    <div className="bg-white border border-slate-200/80 rounded-3xl p-6 space-y-4 shadow-xs">
                      {/* Filter Row */}
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex flex-wrap items-center gap-1.5">
                          {[
                            { id: 'todos', label: 'Todas las Categorías' },
                            { id: 'notaria', label: '⚖️ Notaría' },
                            { id: 'combustible', label: '⛽ Bencina' },
                            { id: 'packaging', label: '📦 Packaging' },
                            { id: 'fijo', label: '🏢 Arriendos/Fijo' },
                            { id: 'servicios', label: '💡 Servicios' },
                          ].map((cat) => (
                            <button
                              key={cat.id}
                              type="button"
                              onClick={() => setExpenseFilterCategory(cat.id)}
                              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                expenseFilterCategory === cat.id
                                  ? 'bg-amber-500 text-white shadow-xs'
                                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                              }`}
                            >
                              {cat.label}
                            </button>
                          ))}
                        </div>

                        <div className="flex items-center gap-1.5">
                          {[
                            { id: 'todos', label: 'Todos' },
                            { id: 'factura', label: 'Solo Facturas' },
                            { id: 'boleta', label: 'Solo Boletas' },
                          ].map((doc) => (
                            <button
                              key={doc.id}
                              type="button"
                              onClick={() => setFinancesExpenseDocFilter(doc.id)}
                              className={`px-2.5 py-0.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                financesExpenseDocFilter === doc.id
                                  ? 'bg-slate-800 text-white'
                                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                              }`}
                            >
                              {doc.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Expenses Table */}
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                          <thead className="text-slate-500 uppercase tracking-wider text-[10px] bg-slate-50/80 border-b border-slate-200">
                            <tr>
                              <th className="py-3 px-3">Categoría</th>
                              <th className="py-3 px-3">Descripción</th>
                              <th className="py-3 px-3">Proveedor / Entidad</th>
                              <th className="py-3 px-3">Comprobante</th>
                              <th className="py-3 px-3">Fecha</th>
                              <th className="py-3 px-3">Monto Neto</th>
                              <th className="py-3 px-3">IVA Crédito</th>
                              <th className="py-3 px-3">Total Bruto</th>
                              <th className="py-3 px-3 text-center">Acciones</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {filteredExpenses.map((exp) => (
                              <tr key={exp.id} className="hover:bg-slate-50 transition-colors">
                                <td className="py-3.5 px-3">
                                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200/60">
                                    <span>{exp.icon || '🧾'}</span>
                                    <span>{exp.categoryLabel || exp.category}</span>
                                  </span>
                                </td>
                                <td className="py-3.5 px-3 font-semibold text-slate-900 max-w-xs">{exp.description}</td>
                                <td className="py-3.5 px-3 text-slate-600">{exp.provider}</td>
                                <td className="py-3.5 px-3 font-mono text-[11px]">
                                  <span className="text-slate-700">{exp.documentNumber}</span>
                                  <span className={`block text-[9px] uppercase font-bold ${exp.hasIvaCredit ? 'text-emerald-700' : 'text-slate-400'}`}>
                                    {exp.hasIvaCredit ? '✓ Genera IVA Crédito' : 'Sin crédito fiscal'}
                                  </span>
                                </td>
                                <td className="py-3.5 px-3 text-slate-600 whitespace-nowrap">{exp.date}</td>
                                <td className="py-3.5 px-3 font-mono text-slate-700">{formatCLP(exp.neto)}</td>
                                <td className="py-3.5 px-3 font-mono font-bold text-emerald-700">
                                  {exp.iva > 0 ? `+${formatCLP(exp.iva)}` : '$0'}
                                </td>
                                <td className="py-3.5 px-3 font-black text-slate-900 font-mono text-sm">{formatCLP(exp.amount)}</td>
                                <td className="py-3.5 px-3 text-center">
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteExpense(exp.id)}
                                    className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                                    title="Eliminar gasto"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ========================================================================= */}
              {/* PESTAÑA 3: INGRESOS (Tabla Consolidada de Ventas Web & Manuales)           */}
              {/* ========================================================================= */}
              {financesSubTab === 'ingresos' && (
                <div className="space-y-6">
                  {/* Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-3xl bg-gradient-to-r from-blue-50/80 via-indigo-50/40 to-white border border-blue-200/70 shadow-xs">
                    <div>
                      <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                        <span>Consolidación de Ingresos & Ventas</span>
                        <span className="text-lg">🛒</span>
                      </h2>
                      <p className="text-xs text-slate-600 mt-0.5">
                        Registro integral de pedidos realizados en la tienda online pública y ventas manuales (mesón, WhatsApp y convenios).
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setManualOrderStep(1);
                        setIsAddOrderModalOpen(true);
                      }}
                      className="px-4 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black flex items-center gap-2 shadow-sm cursor-pointer shrink-0"
                    >
                      <Plus className="w-4 h-4" />
                      <span>+ Registrar Venta Manual</span>
                    </button>
                  </div>

                  {/* 4 Pastel KPI Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-gradient-to-br from-blue-50/70 via-white to-indigo-50/30 border border-blue-200/70 rounded-3xl p-5 space-y-1 shadow-xs">
                      <span className="text-[10px] font-extrabold uppercase text-slate-400 block">Ventas Brutas Totales</span>
                      <div className="text-2xl font-black text-slate-900 font-mono">{formatCLP(financialMetrics.totalSales)}</div>
                      <span className="text-[10px] text-slate-500 font-medium">{orders.length} pedidos emitidos</span>
                    </div>

                    <div className="bg-gradient-to-br from-sky-50/70 via-white to-blue-50/30 border border-sky-200/70 rounded-3xl p-5 space-y-1 shadow-xs">
                      <span className="text-[10px] font-extrabold uppercase text-sky-800 block">Ventas Tienda Web</span>
                      <div className="text-2xl font-black text-sky-900 font-mono">{formatCLP(financialMetrics.webSales)}</div>
                      <span className="text-[10px] text-sky-700 font-medium">
                        {financialMetrics.webOrdersCount} pedidos online (Neto: {formatCLP(financialMetrics.webSalesNeto)})
                      </span>
                    </div>

                    <div className="bg-gradient-to-br from-purple-50/70 via-white to-indigo-50/30 border border-purple-200/70 rounded-3xl p-5 space-y-1 shadow-xs">
                      <span className="text-[10px] font-extrabold uppercase text-purple-800 block">Ventas Manuales (Mesón)</span>
                      <div className="text-2xl font-black text-purple-900 font-mono">{formatCLP(financialMetrics.manualSales)}</div>
                      <span className="text-[10px] text-purple-700 font-medium">
                        {financialMetrics.manualOrdersCount} pedidos directos (Neto: {formatCLP(financialMetrics.manualSalesNeto)})
                      </span>
                    </div>

                    <div className="bg-gradient-to-br from-rose-50/70 via-white to-orange-50/30 border border-rose-200/70 rounded-3xl p-5 space-y-1 shadow-xs">
                      <span className="text-[10px] font-extrabold uppercase text-rose-800 block">IVA Débito Generado (19%)</span>
                      <div className="text-2xl font-black text-rose-600 font-mono">{formatCLP(financialMetrics.ivaDebito)}</div>
                      <span className="text-[10px] text-slate-500 font-medium">
                        Cobrado a clientes por pagar ante SII
                      </span>
                    </div>
                  </div>

                  {/* Ventas Table Card with Channel Filter */}
                  <div className="bg-white border border-slate-200/80 rounded-3xl p-6 space-y-4 shadow-xs">
                    {/* Filters Row: Canales & Medios de Pago */}
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3.5 pb-1">
                      {/* Canales */}
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">Canal:</span>
                        {[
                          { id: 'todos', label: `Todos (${orders.length})` },
                          { id: 'web', label: `🌐 Web (${financialMetrics.webOrdersCount})` },
                          { id: 'manual', label: `✍️ Manual (${financialMetrics.manualOrdersCount})` },
                        ].map((ch) => (
                          <button
                            key={ch.id}
                            type="button"
                            onClick={() => setFinancesSalesChannelFilter(ch.id)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                              financesSalesChannelFilter === ch.id
                                ? 'bg-blue-600 text-white shadow-xs'
                                : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                            }`}
                          >
                            {ch.label}
                          </button>
                        ))}
                      </div>

                      {/* Medios de Pago oficiales: Web, Tarjeta, Efectivo, Transferencia */}
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">Medio de Pago:</span>
                        {[
                          { id: 'todos', label: 'Todos' },
                          { id: 'Web', label: 'Web', icon: Globe, count: paymentBreakdown.Web.count },
                          { id: 'Tarjeta', label: 'Tarjeta', icon: CreditCard, count: paymentBreakdown.Tarjeta.count },
                          { id: 'Efectivo', label: 'Efectivo', icon: Banknote, count: paymentBreakdown.Efectivo.count },
                          { id: 'Transferencia', label: 'Transferencia', icon: Landmark, count: paymentBreakdown.Transferencia.count },
                        ].map((p) => {
                          const isSel = financesPaymentMethodFilter === p.id;
                          const Icon = p.icon;
                          return (
                            <button
                              key={p.id}
                              type="button"
                              onClick={() => setFinancesPaymentMethodFilter(p.id)}
                              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                isSel
                                  ? 'bg-[#0E8388] text-white shadow-xs font-black'
                                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                              }`}
                            >
                              {Icon && <Icon className={`w-3.5 h-3.5 ${isSel ? 'text-white' : 'text-slate-500'}`} />}
                              <span>{p.label}</span>
                              {p.count !== undefined && (
                                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                                  isSel ? 'bg-white/20 text-white font-bold' : 'bg-slate-200/80 text-slate-700'
                                }`}>
                                  {p.count}
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-400 font-medium px-0.5">
                      <span>Mostrando {filteredFinancesOrders.length} de {orders.length} pedidos conectados</span>
                      {(financesSalesChannelFilter !== 'todos' || financesPaymentMethodFilter !== 'todos') && (
                        <button
                          type="button"
                          onClick={() => {
                            setFinancesSalesChannelFilter('todos');
                            setFinancesPaymentMethodFilter('todos');
                          }}
                          className="text-[#0E8388] hover:underline font-bold cursor-pointer"
                        >
                          Limpiar filtros
                        </button>
                      )}
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="text-slate-500 uppercase tracking-wider text-[10px] bg-slate-50/80 border-b border-slate-200">
                          <tr>
                            <th className="py-3 px-3">N° Pedido</th>
                            <th className="py-3 px-3">Cliente</th>
                            <th className="py-3 px-3">Canal</th>
                            <th className="py-3 px-3">Fecha & Hora</th>
                            <th className="py-3 px-3">Medio de Pago</th>
                            <th className="py-3 px-3">Neto</th>
                            <th className="py-3 px-3">IVA (19%)</th>
                            <th className="py-3 px-3">Total Bruto</th>
                            <th className="py-3 px-3 text-center">Estado</th>
                            <th className="py-3 px-3 text-center">Acción</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {filteredFinancesOrders.map((ord) => {
                            const isManual = ord.channel === 'manual';
                            const orderNeto = Math.round(ord.total / 1.19);
                            const orderIva = ord.total - orderNeto;
                            return (
                              <tr key={ord.id} className="hover:bg-slate-50 transition-colors">
                                <td className="py-3.5 px-3 font-mono font-bold text-blue-600">{ord.id}</td>
                                <td className="py-3.5 px-3">
                                  <div className="font-bold text-slate-900">
                                    {typeof ord.customer === 'object' ? ord.customer?.name : ord.customer || 'Cliente'}
                                  </div>
                                  <div className="text-[10px] text-slate-400">
                                    {typeof ord.customer === 'object' ? ord.customer?.email : ord.email || ''}
                                  </div>
                                </td>
                                <td className="py-3.5 px-3">
                                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${isManual ? 'bg-purple-50 text-purple-800 border border-purple-200' : 'bg-sky-50 text-sky-800 border border-sky-200'}`}>
                                    {isManual ? '✍️ Manual' : '🌐 Web'}
                                  </span>
                                </td>
                                <td className="py-3.5 px-3 text-slate-600 whitespace-nowrap">{ord.date}</td>
                                <td className="py-3.5 px-3">
                                  {renderPaymentMethodBadge(ord.paymentMethod)}
                                </td>
                                <td className="py-3.5 px-3 font-mono text-slate-700">{formatCLP(orderNeto)}</td>
                                <td className="py-3.5 px-3 font-mono font-bold text-rose-600">+{formatCLP(orderIva)}</td>
                                <td className="py-3.5 px-3 font-black text-slate-900 font-mono text-sm">{formatCLP(ord.total)}</td>
                                <td className="py-3.5 px-3 text-center">
                                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
                                    {ord.status}
                                  </span>
                                </td>
                                <td className="py-3.5 px-3 text-center">
                                  <button
                                    type="button"
                                    onClick={() => setSelectedOrderModal(ord)}
                                    className="p-1 rounded-lg hover:bg-blue-50 text-slate-400 hover:text-blue-600 transition-colors cursor-pointer"
                                    title="Ver detalle del pedido"
                                  >
                                    <Eye className="w-3.5 h-3.5" />
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* ========================================================================= */}
              {/* PESTAÑA 4: F29 (Cálculo por Fecha & Mes del Balance de IVA ante SII)       */}
              {/* ========================================================================= */}
              {financesSubTab === 'f29' && (
                <div className="space-y-6">
                  {/* Header con Selector de Período / Fecha & Mes (iOS Style) */}
                  <div className="p-6 rounded-3xl bg-gradient-to-r from-purple-50/90 via-indigo-50/50 to-white border border-purple-200/70 text-slate-900 shadow-xs space-y-4">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-purple-100 border border-purple-200 text-purple-700 flex items-center justify-center text-2xl shadow-inner">
                          🏛️
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                              Conciliación Tributaria Formulario 29 (SII Chile)
                            </h2>
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                                f29FilteredData.ivaStatus === 'remanente'
                                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                  : 'bg-rose-100 text-rose-800 border border-rose-200'
                              }`}
                            >
                              {f29FilteredData.ivaStatus === 'remanente' ? '✓ Remanente a Favor' : '⚠️ A Pagar'}
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 mt-0.5">
                            Cálculo dinámico por fecha y mes sobre el IVA Débito (ventas) y el IVA Crédito recuperable (compras y gastos).
                          </p>
                        </div>
                      </div>

                      {/* Selector de Mes y Período (iOS Native Capsule) */}
                      <div className="inline-flex items-center p-1 rounded-full bg-white border border-slate-200 shadow-xs gap-1 self-start lg:self-auto">
                        {[
                          { id: 'todos', label: 'Todo el Histórico' },
                          { id: '2026-08', label: 'Agosto 2026' },
                          { id: '2026-09', label: 'Septiembre 2026' },
                          { id: '2026-10', label: 'Octubre 2026 (Actual)' },
                        ].map((period) => (
                          <button
                            key={period.id}
                            type="button"
                            onClick={() => setF29PeriodFilter(period.id)}
                            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                              f29PeriodFilter === period.id
                                ? 'bg-purple-600 text-white shadow-xs font-black'
                                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                            }`}
                          >
                            {period.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* 3 Pastel Hero Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Box 1: IVA Débito (Línea 20) */}
                    <div className="bg-rose-50/60 border border-rose-200/80 rounded-3xl p-6 space-y-4 shadow-xs">
                      <div className="flex items-center justify-between border-b border-rose-100 pb-3">
                        <div className="flex items-center gap-2">
                          <span className="p-2 rounded-xl bg-rose-100 text-rose-700 font-bold">🛒</span>
                          <div>
                            <h3 className="text-base font-black text-slate-900">1. Débito Fiscal (IVA Ventas)</h3>
                            <span className="text-[10px] text-slate-500 font-bold uppercase">Línea 20 del Formulario 29</span>
                          </div>
                        </div>
                        <span className="text-xs font-black px-2.5 py-1 rounded-full bg-rose-100/70 text-rose-800 border border-rose-200">
                          Cobrado al Cliente
                        </span>
                      </div>

                      <div className="text-2xl sm:text-3xl font-black text-slate-900 font-mono">
                        {formatCLP(f29FilteredData.ivaDebito)}
                      </div>

                      <div className="space-y-2 p-3.5 rounded-2xl bg-white/80 border border-rose-100 text-xs">
                        <div className="flex justify-between">
                          <span className="text-slate-500">🌐 Ventas Tienda Web:</span>
                          <span className="font-mono font-bold text-slate-900">{formatCLP(f29FilteredData.webIvaDebito)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">✍️ Ventas Manuales:</span>
                          <span className="font-mono font-bold text-slate-900">{formatCLP(f29FilteredData.manualIvaDebito)}</span>
                        </div>
                        <div className="pt-2 border-t border-slate-100 flex justify-between font-bold">
                          <span className="text-slate-700 uppercase text-[10px]">Ventas Netas Totales:</span>
                          <span className="font-mono text-slate-900">{formatCLP(f29FilteredData.salesNeto)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Box 2: IVA Crédito (Línea 23) */}
                    <div className="bg-emerald-50/60 border border-emerald-200/80 rounded-3xl p-6 space-y-4 shadow-xs">
                      <div className="flex items-center justify-between border-b border-emerald-100 pb-3">
                        <div className="flex items-center gap-2">
                          <span className="p-2 rounded-xl bg-emerald-100 text-emerald-700 font-bold">🛡️</span>
                          <div>
                            <h3 className="text-base font-black text-slate-900">2. Crédito Fiscal (IVA Compras)</h3>
                            <span className="text-[10px] text-slate-500 font-bold uppercase">Líneas 23 y 24 del Formulario 29</span>
                          </div>
                        </div>
                        <span className="text-xs font-black px-2.5 py-1 rounded-full bg-emerald-100/70 text-emerald-800 border border-emerald-200">
                          IVA Recuperable
                        </span>
                      </div>

                      <div className="text-2xl sm:text-3xl font-black text-emerald-700 font-mono">
                        +{formatCLP(f29FilteredData.totalIvaCredito)}
                      </div>

                      <div className="space-y-2 p-3.5 rounded-2xl bg-white/80 border border-emerald-100 text-xs">
                        <div className="flex justify-between">
                          <span className="text-slate-500">📦 Facturas Stock Mercadería:</span>
                          <span className="font-mono font-bold text-emerald-700">+{formatCLP(f29FilteredData.invoicesIvaCredito)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">📑 Facturas Gastos Operacionales:</span>
                          <span className="font-mono font-bold text-emerald-700">+{formatCLP(f29FilteredData.expensesIvaCredito)}</span>
                        </div>
                        <div className="pt-2 border-t border-slate-100 flex justify-between font-bold">
                          <span className="text-slate-700 uppercase text-[10px]">Documentos Computados:</span>
                          <span className="font-mono text-slate-900">{f29FilteredData.filteredInvoicesCount} facturas</span>
                        </div>
                      </div>
                    </div>

                    {/* Box 3: Resultado de Liquidación F29 */}
                    <div className="bg-gradient-to-br from-indigo-50/80 via-white to-purple-50/60 border border-indigo-200/80 rounded-3xl p-6 space-y-4 shadow-xs">
                      <div className="flex items-center justify-between border-b border-indigo-100 pb-3">
                        <div className="flex items-center gap-2">
                          <span className="p-2 rounded-xl bg-indigo-100 text-indigo-700 font-bold">⚖️</span>
                          <div>
                            <h3 className="text-base font-black text-slate-900">3. Resultado del Período</h3>
                            <span className="text-[10px] text-slate-500 font-bold uppercase">Línea 36 del Formulario 29</span>
                          </div>
                        </div>
                        <span
                          className={`text-xs font-black px-2.5 py-1 rounded-full uppercase ${
                            f29FilteredData.ivaStatus === 'remanente'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              : 'bg-rose-100 text-rose-800 border border-rose-200'
                          }`}
                        >
                          {f29FilteredData.ivaStatus === 'remanente' ? 'Remanente' : 'A Pagar'}
                        </span>
                      </div>

                      <div className="text-2xl sm:text-3xl font-black text-indigo-900 font-mono">
                        {formatCLP(Math.abs(f29FilteredData.ivaBalance))}
                      </div>

                      <div className="space-y-2 p-3.5 rounded-2xl bg-white/80 border border-indigo-100 text-xs">
                        <div className="flex justify-between">
                          <span className="text-slate-500">Estado de Liquidación:</span>
                          <span className="font-bold text-slate-900">
                            {f29FilteredData.ivaStatus === 'remanente' ? '🎉 Saldo a Favor' : '⚠️ Pago ante SII'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Cobertura del IVA:</span>
                          <span className="font-mono font-bold text-emerald-700">{f29FilteredData.ivaCoveredPercent}% cubierto</span>
                        </div>
                        <div className="pt-2 border-t border-slate-100 flex justify-between font-bold">
                          <span className="text-slate-700 uppercase text-[10px]">Vencimiento Legal:</span>
                          <span className="text-indigo-700">Día 20 del mes subsiguiente</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Tabla Simulada de Líneas F29 (Estructura Oficial del SII) */}
                  <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <div>
                        <h3 className="text-sm font-black text-slate-900">Desglose Oficial Formulario 29 • Declaración Mensual SII</h3>
                        <p className="text-xs text-slate-500">Período calculado: {f29FilteredData.periodLabel}</p>
                      </div>
                      <span className="text-xs font-bold text-slate-400">RUT: 76.842.119-K (Patitas del Sur SpA)</span>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="text-slate-500 uppercase tracking-wider text-[10px] bg-slate-50 border-b border-slate-200">
                          <tr>
                            <th className="py-3 px-3">Línea F29</th>
                            <th className="py-3 px-3">Código SII</th>
                            <th className="py-3 px-3">Concepto Oficial</th>
                            <th className="py-3 px-3">Base Imponible Neta</th>
                            <th className="py-3 px-3">Tasa</th>
                            <th className="py-3 px-3 text-right">Monto Determinado</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          <tr>
                            <td className="py-3.5 px-3 font-bold text-slate-900">Línea 20</td>
                            <td className="py-3.5 px-3 font-mono text-slate-500">[503]</td>
                            <td className="py-3.5 px-3 text-slate-700">Ventas con Boleta y Factura Electrónica (Débito Fiscal)</td>
                            <td className="py-3.5 px-3 font-mono text-slate-700">{formatCLP(f29FilteredData.salesNeto)}</td>
                            <td className="py-3.5 px-3 font-bold text-slate-600">19%</td>
                            <td className="py-3.5 px-3 font-mono font-bold text-rose-600 text-right">
                              +{formatCLP(f29FilteredData.ivaDebito)}
                            </td>
                          </tr>
                          <tr>
                            <td className="py-3.5 px-3 font-bold text-slate-900">Línea 23</td>
                            <td className="py-3.5 px-3 font-mono text-slate-500">[518]</td>
                            <td className="py-3.5 px-3 text-slate-700">Facturas Recibidas por Mercadería y Stock (Crédito Fiscal)</td>
                            <td className="py-3.5 px-3 font-mono text-slate-700">{formatCLP(f29FilteredData.invoicesNeto)}</td>
                            <td className="py-3.5 px-3 font-bold text-slate-600">19%</td>
                            <td className="py-3.5 px-3 font-mono font-bold text-emerald-700 text-right">
                              -{formatCLP(f29FilteredData.invoicesIvaCredito)}
                            </td>
                          </tr>
                          <tr>
                            <td className="py-3.5 px-3 font-bold text-slate-900">Línea 24</td>
                            <td className="py-3.5 px-3 font-mono text-slate-500">[520]</td>
                            <td className="py-3.5 px-3 text-slate-700">Facturas Recibidas por Gastos de Operación y Servicios</td>
                            <td className="py-3.5 px-3 font-mono text-slate-700">
                              {formatCLP(Math.round((f29FilteredData.expensesIvaCredito || 0) / 0.19))}
                            </td>
                            <td className="py-3.5 px-3 font-bold text-slate-600">19%</td>
                            <td className="py-3.5 px-3 font-mono font-bold text-emerald-700 text-right">
                              -{formatCLP(f29FilteredData.expensesIvaCredito)}
                            </td>
                          </tr>
                          <tr className="bg-slate-50 font-black text-sm">
                            <td className="py-3.5 px-3">Línea 77</td>
                            <td className="py-3.5 px-3 font-mono text-slate-500">[89]</td>
                            <td className="py-3.5 px-3">
                              {f29FilteredData.ivaStatus === 'remanente'
                                ? 'Remanente de Crédito Fiscal a Favor (a imputar el próximo período)'
                                : 'Total Impuesto Determinado a Pagar ante Tesorería'}
                            </td>
                            <td className="py-3.5 px-3 font-mono text-slate-500">-</td>
                            <td className="py-3.5 px-3 text-slate-500">-</td>
                            <td className={`py-3.5 px-3 font-mono text-right ${f29FilteredData.ivaStatus === 'remanente' ? 'text-emerald-700' : 'text-rose-600'}`}>
                              {formatCLP(Math.abs(f29FilteredData.ivaBalance))}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Tips de Optimización Tributaria (Pastel Cards) */}
                  <div className="bg-white border border-slate-200/80 rounded-3xl p-6 space-y-4 shadow-xs">
                    <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                      <span>💡 Recomendaciones Prácticas para Reducir el Pago de IVA</span>
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                      <div className="p-4 rounded-2xl bg-teal-50/60 border border-teal-100 space-y-1.5">
                        <div className="font-bold text-slate-900 flex items-center gap-1.5">
                          <span>📦</span>
                          <span>Exige Factura en Todo Insumo</span>
                        </div>
                        <p className="text-slate-600 leading-relaxed">
                          Al comprar bolsas kraft, cintas de embalaje y fletes, solicita siempre Factura con el RUT de Patitas del Sur SpA para recuperar el 19%.
                        </p>
                      </div>

                      <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-100 space-y-1.5">
                        <div className="font-bold text-slate-900 flex items-center gap-1.5">
                          <span>⚖️</span>
                          <span>Trámites de Notaría & Legal</span>
                        </div>
                        <p className="text-slate-600 leading-relaxed">
                          Los trámites notariales con boleta simple o de honorarios son gasto contable para renta, pero no descuentan IVA en el F29 mensual.
                        </p>
                      </div>

                      <div className="p-4 rounded-2xl bg-orange-50/60 border border-orange-100 space-y-1.5">
                        <div className="font-bold text-slate-900 flex items-center gap-1.5">
                          <span>⛽</span>
                          <span>Combustible con Factura Copec/Shell</span>
                        </div>
                        <p className="text-slate-600 leading-relaxed">
                          Si inscribes los furgones con factura en Copec o Shell Empresas, puedes descontar el IVA de la bencina de repartos de tu F29.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })()}

        {/* ========================================================================= */}
        {/* TAB 7: DESPACHOS (Configuración de Zonas, Tarifas & Google Maps Radial)   */}
        {/* ========================================================================= */}
        {activeTab === 'despachos' && (
          <div className="space-y-6 animate-in fade-in duration-300">


            {/* Sub-tabs en forma de Cápsula Unificada y Centrada (Pegadas y sin separación) */}
            <div className="flex justify-center items-center w-full py-1">
              <div className="inline-flex items-center p-1 rounded-full bg-slate-100 border border-slate-200/90 shadow-inner">
                <button
                  type="button"
                  onClick={() => setDispatchSubTab('zonas')}
                  className={`inline-flex items-center gap-2 px-5 sm:px-6 py-2 rounded-full font-black text-xs sm:text-sm transition-all cursor-pointer ${
                    dispatchSubTab === 'zonas'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                  }`}
                >
                  <MapPin className={`w-4 h-4 ${dispatchSubTab === 'zonas' ? 'text-white' : 'text-emerald-600'}`} />
                  <span>Zonas y Tarifas</span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-black ${
                      dispatchSubTab === 'zonas'
                        ? 'bg-white/20 text-white'
                        : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {dispatchZones.length}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setDispatchSubTab('vehiculos')}
                  className={`inline-flex items-center gap-2 px-5 sm:px-6 py-2 rounded-full font-black text-xs sm:text-sm transition-all cursor-pointer ${
                    dispatchSubTab === 'vehiculos'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                  }`}
                >
                  <Truck className={`w-4 h-4 ${dispatchSubTab === 'vehiculos' ? 'text-white' : 'text-blue-600'}`} />
                  <span>Vehículos y Consumo</span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-black ${
                      dispatchSubTab === 'vehiculos'
                        ? 'bg-white/20 text-white'
                        : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {vehicles.length}
                  </span>
                </button>
              </div>
            </div>

            {/* SUB-TAB 1: ZONAS Y TARIFAS (MAPA RADIAL + LISTA DE ZONAS) */}
            {dispatchSubTab === 'zonas' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
              {/* Left Column: Google Maps Interactive Radial Zones Map */}
              <div className="bg-white border border-slate-200/80 rounded-3xl overflow-hidden shadow-sm flex flex-col h-full">
              {/* Map Header & Toolbar */}
              <div className="p-3.5 sm:p-4 border-b border-slate-100 bg-slate-50/90 flex items-center justify-between gap-3 shrink-0">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-xs shrink-0">
                    <Compass className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <span className="font-black text-slate-900 text-base block truncate">
                      Mapa de Cobertura y Distancias
                    </span>
                    <p className="text-xs text-slate-500 font-medium truncate">
                      Bodega Central: San Francisco 412, Puerto Varas
                    </p>
                  </div>
                </div>

                {/* Map Controls */}
                <div className="flex items-center gap-2 shrink-0">
                  {/* Zoom Buttons */}
                  <div className="inline-flex items-center bg-white rounded-xl border border-slate-200 p-0.5 text-xs shadow-xs">
                    <button
                      type="button"
                      onClick={() => setMapZoomLevel((z) => Math.min(z + 0.15, 1.4))}
                      className="w-8 h-8 flex items-center justify-center text-slate-700 hover:text-slate-900 font-black cursor-pointer text-base rounded-lg hover:bg-slate-100"
                      title="Acercar mapa"
                    >
                      +
                    </button>
                    <button
                      type="button"
                      onClick={() => setMapZoomLevel((z) => Math.max(z - 0.15, 0.75))}
                      className="w-8 h-8 flex items-center justify-center text-slate-700 hover:text-slate-900 font-black cursor-pointer border-l border-slate-200 text-base rounded-lg hover:bg-slate-100"
                      title="Alejar mapa"
                    >
                      −
                    </button>
                    <button
                      type="button"
                      onClick={() => setMapZoomLevel(1)}
                      className="px-2.5 h-8 flex items-center justify-center text-slate-700 hover:text-emerald-700 font-bold cursor-pointer border-l border-slate-200 text-xs rounded-lg hover:bg-slate-100"
                      title="Re-centrar mapa"
                    >
                      Centrar
                    </button>
                  </div>
                </div>
              </div>

              {/* Interactive Radial Map Canvas with Google Maps UI Overlays */}
              <div
                className={`relative w-full h-[600px] overflow-hidden select-none transition-colors duration-300 ${
                  mapType === 'satellite'
                    ? 'bg-[#15231c]'
                    : mapType === 'terrain'
                    ? 'bg-[#eaf0e6]'
                    : 'bg-[#f4f1ea]'
                }`}
              >
                {/* Floating Google Maps Search Bar */}
                <div className="absolute top-3.5 left-3.5 right-3.5 z-20 pointer-events-none">
                  {/* Search Bar */}
                  <div className="bg-white/95 backdrop-blur-md shadow-md border border-slate-200 rounded-2xl px-4 py-2.5 flex items-center gap-2.5 w-full pointer-events-auto">
                    <Search className="w-4 h-4 text-slate-400 shrink-0" />
                    <input
                      type="text"
                      placeholder="Probar dirección (ej: Puerto Montt, Llanquihue, Frutillar)..."
                      value={simulatedAddress}
                      onChange={(e) => setSimulatedAddress(e.target.value)}
                      className="w-full bg-transparent text-slate-900 text-sm font-semibold focus:outline-none placeholder:text-slate-400"
                    />
                    <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs shrink-0 border border-emerald-200">
                      {simulatedDistanceKm} km
                    </span>
                  </div>
                </div>

                {/* SVG Radial Map */}
                <svg
                  viewBox="0 0 1000 620"
                  preserveAspectRatio="xMidYMid slice"
                  className="w-full h-full object-cover transition-transform duration-300"
                  style={{ transform: `scale(${mapZoomLevel})`, transformOrigin: '480px 340px' }}
                >
                  <defs>
                    <radialGradient id="hubRadarGlow" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="#0E8388" stopOpacity="0.5" />
                      <stop offset="100%" stopColor="#0E8388" stopOpacity="0" />
                    </radialGradient>
                    <filter id="shadowGlow" x="-20%" y="-20%" width="140%" height="140%">
                      <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.3" />
                    </filter>
                    <filter id="badgeShadow" x="-10%" y="-10%" width="120%" height="120%">
                      <feDropShadow dx="0" dy="2" stdDeviation="2" floodOpacity="0.15" />
                    </filter>
                  </defs>

                  {/* Grid Lines (Google Maps coordinates grid) */}
                  <g opacity={mapType === 'satellite' ? '0.1' : '0.25'} stroke="#94A3B8" strokeWidth="1" strokeDasharray="2 4">
                    <line x1="0" y1="120" x2="1000" y2="120" />
                    <line x1="0" y1="240" x2="1000" y2="240" />
                    <line x1="0" y1="360" x2="1000" y2="360" />
                    <line x1="0" y1="480" x2="1000" y2="480" />
                    <line x1="200" y1="0" x2="200" y2="620" />
                    <line x1="400" y1="0" x2="400" y2="620" />
                    <line x1="600" y1="0" x2="600" y2="620" />
                    <line x1="800" y1="0" x2="800" y2="620" />
                  </g>

                  {/* Topographic Background: Lago Llanquihue */}
                  <path
                    d="M 360,130 Q 420,95 530,115 T 720,180 T 780,270 Q 750,330 650,340 T 475,310 T 360,250 Z"
                    fill={mapType === 'satellite' ? '#0E334D' : '#A3D3F5'}
                    stroke={mapType === 'satellite' ? '#1E4B6E' : '#7CBFE6'}
                    strokeWidth="2.5"
                  />
                  <text
                    x="560"
                    y="210"
                    fill={mapType === 'satellite' ? '#7BB2DD' : '#3B82B6'}
                    fontSize="14"
                    fontWeight="900"
                    fontStyle="italic"
                    letterSpacing="1"
                    textAnchor="middle"
                    opacity="0.85"
                  >
                    LAGO LLANQUIHUE
                  </text>

                  {/* Seno de Reloncaví (Puerto Montt) */}
                  <path
                    d="M 440,540 Q 520,510 620,530 T 800,580 L 800,620 L 300,620 Z"
                    fill={mapType === 'satellite' ? '#092336' : '#9DCDEB'}
                    stroke={mapType === 'satellite' ? '#183D5C' : '#7CBFE6'}
                    strokeWidth="2"
                  />
                  <text
                    x="560"
                    y="585"
                    fill={mapType === 'satellite' ? '#7BB2DD' : '#3B82B6'}
                    fontSize="12"
                    fontWeight="800"
                    fontStyle="italic"
                    textAnchor="middle"
                    opacity="0.8"
                  >
                    Seno de Reloncaví (Puerto Montt)
                  </text>

                  {/* Main Highways Network (Google Maps Style) */}
                  {/* Ruta 5 Sur (Dual Carriageway Orange Highway) */}
                  <path
                    d="M 330,50 Q 365,160 395,250 T 475,335 T 505,425 T 525,505"
                    fill="none"
                    stroke="#FFFFFF"
                    strokeWidth="7"
                    strokeLinecap="round"
                  />
                  <path
                    d="M 330,50 Q 365,160 395,250 T 475,335 T 505,425 T 525,505"
                    fill="none"
                    stroke="#F59E0B"
                    strokeWidth="5"
                    strokeLinecap="round"
                  />
                  {/* Route 5 Shield Marker */}
                  <g filter="url(#badgeShadow)">
                    <rect x="335" y="70" width="22" height="16" rx="4" fill="#0E8388" stroke="#FFFFFF" strokeWidth="1.5" />
                    <text x="346" y="82" fill="#FFFFFF" fontSize="9" fontWeight="900" textAnchor="middle">5</text>
                  </g>

                  {/* Ruta 225 a Ensenada */}
                  <path
                    d="M 475,335 Q 600,345 710,290"
                    fill="none"
                    stroke="#FFFFFF"
                    strokeWidth="5"
                    strokeLinecap="round"
                  />
                  <path
                    d="M 475,335 Q 600,345 710,290"
                    fill="none"
                    stroke="#FB923C"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                  />
                  <text x="610" y="325" fill="#64748B" fontSize="9" fontWeight="800">
                    Ruta 225 (Ensenada)
                  </text>

                  {/* Ruta V-505 Puerto Varas - Alerce - Pto Montt */}
                  <path
                    d="M 475,335 Q 500,380 505,425 Q 515,465 525,505"
                    fill="none"
                    stroke="#FFFFFF"
                    strokeWidth="4"
                    strokeDasharray="4 2"
                  />

                  {/* ========================================================= */}
                  {/* CONCENTRIC RADIAL DISTANCE RINGS (Configured Dynamically) */}
                  {/* ========================================================= */}
                  {dispatchZones.map((z, idx) => {
                    const r = Math.min(Math.max(Math.round((z.radiusMaxKm || 5) * 8.5), 35), 280);
                    const isSelected = z.id === selectedConfigZoneId;
                    const badgeX = idx % 2 === 0 ? 530 : 220;
                    const badgeY = 270 + idx * 55;

                    return (
                      <g key={z.id || idx}>
                        <circle
                          cx="480"
                          cy="340"
                          r={r}
                          fill={isSelected ? `${z.color}30` : `${z.color}15`}
                          stroke={z.color || '#10B981'}
                          strokeWidth={isSelected ? '3.5' : '2'}
                          strokeDasharray="5 3"
                          className="transition-all cursor-pointer"
                          onClick={() => setSelectedConfigZoneId(z.id)}
                        />
                        {/* Zone Distance and Fee Badge */}
                        <g
                          filter="url(#badgeShadow)"
                          className="cursor-pointer"
                          onClick={() => setSelectedConfigZoneId(z.id)}
                        >
                          <rect
                            x={badgeX}
                            y={badgeY}
                            width="165"
                            height="24"
                            rx="12"
                            fill={z.color || '#10B981'}
                          />
                          <text
                            x={badgeX + 82}
                            y={badgeY + 16}
                            fill="#FFFFFF"
                            fontSize="10"
                            fontWeight="900"
                            textAnchor="middle"
                          >
                            {z.name || `Zona ${idx + 1}`} (hasta {z.radiusMaxKm} km) • {z.baseFee > 0 ? formatCLP(z.baseFee) : 'A definir'}
                          </text>
                        </g>
                      </g>
                    );
                  })}

                  {/* ========================================================= */}
                  {/* LANDMARKS & CITIES ON MAP                                 */}
                  {/* ========================================================= */}

                  {/* Llanquihue (7.5 km) */}
                  <g className="cursor-pointer group" onClick={() => { setSimulatedAddress('Llanquihue Centro'); setSimulatedDistanceKm(7.5); }}>
                    <circle cx="400" cy="270" r="5" fill="#0E8388" stroke="#FFFFFF" strokeWidth="2" />
                    <text x="390" y="265" fill="#0F172A" fontSize="11" fontWeight="800" textAnchor="end">Llanquihue (7.5 km)</text>
                  </g>

                  {/* Frutillar (24 km) */}
                  <g className="cursor-pointer group" onClick={() => { setSimulatedAddress('Frutillar Bajo'); setSimulatedDistanceKm(24); }}>
                    <circle cx="360" cy="170" r="5" fill="#F59E0B" stroke="#FFFFFF" strokeWidth="2" />
                    <text x="350" y="165" fill="#0F172A" fontSize="11" fontWeight="800" textAnchor="end">Frutillar (24 km)</text>
                  </g>

                  {/* Alerce (11.5 km) */}
                  <g className="cursor-pointer group" onClick={() => { setSimulatedAddress('Alerce Norte'); setSimulatedDistanceKm(11.5); }}>
                    <circle cx="505" cy="425" r="5" fill="#0E8388" stroke="#FFFFFF" strokeWidth="2" />
                    <text x="518" y="429" fill="#0F172A" fontSize="11" fontWeight="800">Alerce (11.5 km)</text>
                  </g>

                  {/* Puerto Montt (18 km) */}
                  <g className="cursor-pointer group" onClick={() => { setSimulatedAddress('Puerto Montt Costanera'); setSimulatedDistanceKm(18); }}>
                    <circle cx="525" cy="495" r="6" fill="#0E8388" stroke="#FFFFFF" strokeWidth="2.5" />
                    <text x="538" y="499" fill="#0F172A" fontSize="12" fontWeight="900">Puerto Montt (18 km)</text>
                  </g>

                  {/* Ensenada (38 km) */}
                  <g className="cursor-pointer group" onClick={() => { setSimulatedAddress('Ensenada / Ruta 225'); setSimulatedDistanceKm(38); }}>
                    <circle cx="710" cy="290" r="5" fill="#8B5CF6" stroke="#FFFFFF" strokeWidth="2" />
                    <text x="722" y="294" fill="#0F172A" fontSize="11" fontWeight="800">Ensenada (38 km)</text>
                  </g>

                  {/* ========================================================= */}
                  {/* SIMULATED DYNAMIC VECTOR & DELIVERY VAN (🚚)              */}
                  {/* ========================================================= */}
                  {simulatedDistanceKm && (() => {
                    const angle = 0.785; // ~45 deg angle vector
                    const maxRadius = 275;
                    const clampedKm = Math.min(simulatedDistanceKm, 65);
                    const vectorLength = (clampedKm / 65) * maxRadius;
                    const targetX = 480 + Math.cos(angle) * vectorLength;
                    const targetY = 340 + Math.sin(angle) * vectorLength;
                    const midX = 480 + Math.cos(angle) * (vectorLength * 0.5);
                    const midY = 340 + Math.sin(angle) * (vectorLength * 0.5);

                    return (
                      <g>
                        {/* Dynamic Distance Vector Line */}
                        <line
                          x1="480"
                          y1="340"
                          x2={targetX}
                          y2={targetY}
                          stroke="#EF4444"
                          strokeWidth="3.5"
                          strokeDasharray="6 3"
                        />

                        {/* Animated Dispatch Van moving on route */}
                        <g transform={`translate(${midX - 12}, ${midY - 12})`}>
                          <circle cx="12" cy="12" r="14" fill="#0F172A" stroke="#FFFFFF" strokeWidth="2" shadow="drop" />
                          <text x="12" y="17" fontSize="13" textAnchor="middle">🚚</text>
                        </g>

                        {/* Destination Target Pin (Google Maps Red Marker) */}
                        <circle
                          cx={targetX}
                          cy={targetY}
                          r="16"
                          fill="#EF4444"
                          opacity="0.35"
                          className="animate-ping"
                        />
                        <circle
                          cx={targetX}
                          cy={targetY}
                          r="9"
                          fill="#EF4444"
                          stroke="#FFFFFF"
                          strokeWidth="3"
                        />

                        {/* Floating InfoWindow Tooltip above target pin */}
                        <g filter="url(#shadowGlow)">
                          <rect
                            x={targetX - 90}
                            y={targetY - 55}
                            width="180"
                            height="44"
                            rx="14"
                            fill="#0F172A"
                          />
                          {/* Triangle pointer */}
                          <polygon
                            points={`${targetX - 6},${targetY - 11} ${targetX + 6},${targetY - 11} ${targetX},${targetY - 3}`}
                            fill="#0F172A"
                          />
                          <text x={targetX} y={targetY - 37} fill="#38BDF8" fontSize="10" fontWeight="900" textAnchor="middle">
                            📍 {simulatedAddress || 'Dirección de Entrega'}
                          </text>
                          <text x={targetX} y={targetY - 22} fill="#FFFFFF" fontSize="11" fontWeight="900" textAnchor="middle">
                            {simulatedDistanceKm} km → Tarifa: {formatCLP(simulatedZoneResult.baseFee)}
                          </text>
                        </g>
                      </g>
                    );
                  })()}

                  {/* ========================================================= */}
                  {/* CENTRAL HUB (BODEGA CENTRAL PUERTO VARAS - KM 0)          */}
                  {/* ========================================================= */}
                  <g filter="url(#shadowGlow)">
                    {/* Animated Radar Pulse */}
                    <circle cx="480" cy="340" r="22" fill="url(#hubRadarGlow)" className="animate-ping" opacity="0.8" />
                    {/* Central Marker */}
                    <circle cx="480" cy="340" r="10" fill="#0E8388" stroke="#FFFFFF" strokeWidth="3" />
                    <circle cx="480" cy="340" r="4" fill="#FFFFFF" />

                    {/* Central Badge */}
                    <rect x="405" y="356" width="150" height="24" rx="12" fill="#0E8388" stroke="#FFFFFF" strokeWidth="1.5" />
                    <text x="480" y="372" fill="#FFFFFF" fontSize="10" fontWeight="900" textAnchor="middle">
                      🏠 BODEGA CENTRAL (Km 0)
                    </text>
                  </g>
                </svg>

                {/* Google Maps Bottom Bar: Watermark */}
                <div className="absolute bottom-3 left-3 z-10 flex items-center gap-1.5 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-xl border border-slate-200 text-[10px] font-mono text-slate-600 shadow-xs">
                  <span className="font-black text-slate-800 tracking-tighter text-xs">Google</span>
                  <span>•</span>
                  <span className="text-[10px] text-slate-400">Región de Los Lagos</span>
                </div>

                {/* Floating Map Legend Bar */}
                {dispatchZones.length > 0 && (
                  <div className="absolute bottom-3 right-3 z-10 bg-white/95 backdrop-blur-md p-2 rounded-xl border border-slate-200/90 shadow-md hidden 2xl:flex items-center gap-2 text-[10px] font-bold text-slate-800">
                    {dispatchZones.map((z, idx) => (
                      <div key={z.id || idx} className="flex items-center gap-1">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: z.color || '#10B981' }} />
                        <span>{z.name || `Zona ${idx + 1}`} (hasta {z.radiusMaxKm} km)</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Panel de Zonas de Despacho */}
            <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-7 shadow-sm flex flex-col justify-between space-y-6">
              {/* Header with Title and '+ Crear Zona' Button */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                    <Truck className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="font-black text-slate-900 text-lg sm:text-xl">
                      Zonas de Despacho
                    </h3>
                    <p className="text-sm text-slate-500 font-medium mt-0.5">
                      {dispatchZones.length === 0
                        ? 'Crea tus zonas para definir precios y distancias de entrega.'
                        : `${dispatchZones.length} ${dispatchZones.length === 1 ? 'zona configurada' : 'zonas configuradas'}`}
                    </p>
                  </div>
                </div>

                {/* Botón Principal para Crear Zona */}
                <button
                  type="button"
                  onClick={handleOpenCreateZoneModal}
                  className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-black text-sm shadow-md hover:shadow-lg transition-all cursor-pointer active:scale-95 shrink-0"
                >
                  <Plus className="w-4 h-4 stroke-[3]" />
                  <span>Crear Zona</span>
                </button>
              </div>

              {/* Contenido: Si no hay zonas, estado vacío invitando a crear; si hay zonas, lista de tarjetas */}
              <div className="flex-1 space-y-4">
                {dispatchZones.length === 0 ? (
                  <div className="py-12 px-6 flex flex-col items-center justify-center text-center bg-slate-50/80 border-2 border-dashed border-slate-200 rounded-3xl space-y-4">
                    <div className="w-16 h-16 rounded-3xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 shadow-xs">
                      <Compass className="w-8 h-8" />
                    </div>
                    <div className="max-w-md space-y-1.5">
                      <h4 className="text-base sm:text-lg font-black text-slate-900">
                        No hay zonas de despacho creadas aún
                      </h4>
                      <p className="text-sm text-slate-600 font-medium leading-relaxed">
                        Haz clic en el botón de arriba o abajo para agregar tu primera zona (por ejemplo: hasta 5 km de la bodega central).
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleOpenCreateZoneModal}
                      className="mt-2 inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-black text-sm shadow-md hover:shadow-lg transition-all cursor-pointer active:scale-95"
                    >
                      <Plus className="w-4 h-4 stroke-[3]" />
                      <span>Crear Primera Zona</span>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-400 px-1">
                      <span>Zonas configuradas ({dispatchZones.length})</span>
                      <span>Haz clic en una zona para verla en el mapa</span>
                    </div>

                    <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
                      {dispatchZones.map((z, idx) => {
                        const kmOneWay = parseFloat(z.radiusMaxKm) || 0;
                        const kmRoundTrip = kmOneWay * 2;
                        const fuelCost = Math.round(kmRoundTrip * fleetFuelStats.avgCostPerKm);
                        const fee = parseInt(z.baseFee, 10) || 0;
                        const margin = fee - fuelCost;
                        const isSelected = z.id === selectedConfigZoneId;

                        return (
                          <div
                            key={z.id || idx}
                            onClick={() => setSelectedConfigZoneId(z.id)}
                            className={`group relative bg-white rounded-2xl p-4 sm:p-5 border transition-all duration-200 cursor-pointer ${
                              isSelected
                                ? 'border-emerald-500 shadow-[0_4px_20px_rgba(16,185,129,0.12)] ring-1 ring-emerald-500/30'
                                : 'border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.03),0_4px_12px_rgba(0,0,0,0.03)] hover:border-slate-300 hover:shadow-[0_6px_20px_rgba(0,0,0,0.06)]'
                            }`}
                          >
                            {/* Fila Superior: Nombre de Zona, Badge de Distancia y Acciones Apple */}
                            <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-100">
                              <div className="flex items-center gap-2.5 min-w-0">
                                <span
                                  className="w-2.5 h-2.5 rounded-full ring-4 ring-emerald-500/15 shrink-0 transition-transform group-hover:scale-110"
                                  style={{ backgroundColor: z.color || '#10B981' }}
                                />
                                <div className="flex items-center gap-2 min-w-0 flex-wrap">
                                  <h4 className="font-semibold text-slate-900 text-[15px] sm:text-base tracking-tight truncate">
                                    {z.name || `Zona ${idx + 1}`}
                                  </h4>
                                  <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100/90 text-slate-600 border border-slate-200/60 shrink-0">
                                    Hasta {z.radiusMaxKm} km
                                  </span>
                                </div>
                              </div>

                              {/* Botones de acción estilo iOS / macOS */}
                              <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                                <button
                                  type="button"
                                  onClick={() => handleOpenEditZoneModal(z)}
                                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200/80 text-slate-700 text-xs font-medium transition-all active:scale-95 cursor-pointer"
                                  title="Editar parámetros de esta zona"
                                >
                                  <Edit2 className="w-3.5 h-3.5 text-slate-500" />
                                  <span>Editar</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteZone(z.id)}
                                  className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-rose-50 active:scale-95 transition-all cursor-pointer"
                                  title="Eliminar esta zona"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>

                            {/* Fila Central: Tarifa al Cliente y Umbral Despacho Gratis */}
                            <div className="py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5">
                              <div>
                                <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">
                                  Tarifa de envío
                                </span>
                                <div className="flex items-baseline gap-1 mt-0.5">
                                  <span className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                                    {formatCLP(z.baseFee)}
                                  </span>
                                  <span className="text-xs text-slate-400 font-normal">/ despacho</span>
                                </div>
                              </div>

                              <div>
                                {z.freeThreshold > 0 ? (
                                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200/80 text-xs font-medium">
                                    <Sparkles className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                    <span>Gratis sobre {formatCLP(z.freeThreshold)}</span>
                                  </div>
                                ) : (
                                  <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100/70 text-slate-400 text-xs font-normal">
                                    <span>Sin envío gratis</span>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Fila Inferior: Panel agrupado estilo Apple Inset Grouped para logística interna */}
                            <div className="bg-slate-50/80 rounded-xl p-2.5 border border-slate-100/90 grid grid-cols-2 gap-2.5 text-xs">
                              {/* Bencina Estimada */}
                              <div className="flex items-center gap-2 min-w-0">
                                <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0">
                                  <Fuel className="w-3.5 h-3.5" />
                                </div>
                                <div className="min-w-0">
                                  <div className="text-[10px] font-medium text-slate-400 uppercase tracking-wider truncate" title={`Ida y vuelta (${kmRoundTrip} km)`}>
                                    Bencina ({kmRoundTrip} km i/v)
                                  </div>
                                  <div className="text-xs font-semibold text-slate-700">
                                    ~{formatCLP(fuelCost)}
                                  </div>
                                </div>
                              </div>

                              {/* Margen Neto Estimado */}
                              <div className="flex items-center gap-2 min-w-0">
                                <div
                                  className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                                    margin >= 0 ? 'bg-emerald-500/10 text-emerald-600' : 'bg-rose-500/10 text-rose-600'
                                  }`}
                                >
                                  <TrendingUp className="w-3.5 h-3.5" />
                                </div>
                                <div className="min-w-0">
                                  <div className="text-[10px] font-medium text-slate-400 uppercase tracking-wider truncate">
                                    Margen estimado
                                  </div>
                                  <div
                                    className={`text-xs font-semibold ${
                                      margin >= 0 ? 'text-emerald-700' : 'text-rose-600'
                                    }`}
                                  >
                                    {margin >= 0 ? `+${formatCLP(margin)}` : `-${formatCLP(Math.abs(margin))}`}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <button
                      type="button"
                      onClick={handleOpenCreateZoneModal}
                      className="w-full py-3 rounded-xl border border-dashed border-slate-300 hover:border-emerald-500 hover:bg-emerald-50/40 text-slate-600 hover:text-emerald-700 text-xs font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
                    >
                      <Plus className="w-4 h-4 stroke-[2.5]" />
                      <span>Agregar otra zona de despacho</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Nota explicativa de ayuda para persona mayor */}
              <div className="bg-emerald-50/90 border border-emerald-200/80 rounded-2xl p-4 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div className="text-xs sm:text-sm text-emerald-950 font-medium leading-relaxed">
                  <span className="font-bold">¿Cómo funciona? </span>
                  Al comprar, el cliente escribe su dirección. Si está dentro del kilometraje configurado, se cobrará el valor de esa zona (o saldrá gratis si supera el monto de compra mínima).
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SUB-TAB 2: VEHÍCULOS Y CONSUMO (DISEÑO MINIMALISTA Y SENCILLO)           */}
        {/* ========================================================================= */}
        {dispatchSubTab === 'vehiculos' && (
          <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-300">
            <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
              {/* Header de la sección */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                    <Car className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-slate-900">
                      Vehículos de Reparto
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
                      Configura el rendimiento por kilómetro y el valor del litro de bencina.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleOpenCreateVehicleModal}
                  className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-black text-sm shadow-md hover:shadow-lg transition-all cursor-pointer active:scale-95 shrink-0"
                >
                  <Plus className="w-4 h-4 stroke-[3]" />
                  <span>Agregar Auto</span>
                </button>
              </div>

              {/* Contenido: Si no hay autos, estado vacío; si hay autos, lista limpia */}
              {vehicles.length === 0 ? (
                <div className="py-12 px-6 flex flex-col items-center justify-center text-center bg-slate-50/80 border-2 border-dashed border-slate-200 rounded-3xl space-y-4">
                  <div className="w-16 h-16 rounded-3xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 shadow-xs">
                    <Car className="w-8 h-8" />
                  </div>
                  <div className="max-w-md space-y-1.5">
                    <h4 className="text-base sm:text-lg font-black text-slate-900">
                      No hay autos configurados aún
                    </h4>
                    <p className="text-sm text-slate-600 font-medium leading-relaxed">
                      Agrega un auto indicando la marca, patente, rendimiento por kilómetro y el valor del litro de bencina.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleOpenCreateVehicleModal}
                    className="mt-2 inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-black text-sm shadow-md hover:shadow-lg transition-all cursor-pointer active:scale-95"
                  >
                    <Plus className="w-4 h-4 stroke-[3]" />
                    <span>Agregar Primer Auto</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Banner de Promedio de Flota (Idea 4) */}
                  {vehicles.length >= 2 && (
                    <div className="p-4 rounded-2xl bg-emerald-50/90 border border-emerald-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-2xs">
                      <div className="flex items-center gap-2.5 font-bold text-emerald-950">
                        <Car className="w-5 h-5 text-emerald-600 shrink-0" />
                        <div>
                          <span>Promedio de tu flota ({vehicles.length} vehículos):</span>
                          <span className="text-slate-600 font-medium ml-1">
                            Rinde en promedio <strong>{fleetFuelStats.avgEfficiency} km/L</strong>
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
                        <span className="text-slate-600 font-bold">Costo promedio:</span>
                        <span className="px-3 py-1 rounded-xl bg-white border border-emerald-300 font-mono font-black text-emerald-800 text-xs shadow-2xs">
                          ~${fleetFuelStats.avgCostPerKm} / km
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="space-y-3">
                    {vehicles.map((v) => {
                      const eff = v.efficiencyKmPerL || 1;
                      const price = v.fuelPricePerL || 0;
                      const costPerKm = Math.round(price / eff);

                      return (
                        <div
                          key={v.id}
                          className="p-5 rounded-2xl border-2 border-slate-200/90 bg-white hover:border-emerald-300 transition-all shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                        >
                          <div className="flex items-center gap-4 min-w-0">
                            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-700 flex items-center justify-center text-2xl shrink-0">
                              🚗
                            </div>
                            <div className="min-w-0 space-y-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="text-base font-black text-slate-900 truncate">
                                  {v.brand || v.name}
                                </h3>
                                {v.plate && (
                                  <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-800 font-mono text-xs font-black">
                                    {v.plate}
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-3 text-xs text-slate-600 font-medium flex-wrap">
                                <span>
                                  Rinde: <strong className="text-slate-900 font-bold">{v.efficiencyKmPerL} km/L</strong>
                                </span>
                                <span className="text-slate-300">•</span>
                                <span>
                                  Bencina: <strong className="text-slate-900 font-bold">{formatCLP(v.fuelPricePerL)}/L</strong>
                                </span>
                                <span className="text-slate-300">•</span>
                                <span className="text-emerald-700 font-black">
                                  Costo: {formatCLP(costPerKm)} por km
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                            <button
                              type="button"
                              onClick={() => handleOpenEditVehicleModal(v)}
                              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 text-xs font-black transition-colors cursor-pointer border border-slate-200/80 hover:border-emerald-200"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                              <span>Editar</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteVehicle(v.id)}
                              className="p-2 rounded-xl bg-slate-100 hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors cursor-pointer border border-slate-200/80 hover:border-red-200"
                              title="Eliminar este auto"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <button
                    type="button"
                    onClick={handleOpenCreateVehicleModal}
                    className="w-full py-3.5 rounded-2xl border-2 border-dashed border-slate-200 hover:border-emerald-400 hover:bg-emerald-50/50 text-slate-600 hover:text-emerald-700 text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Plus className="w-4 h-4 stroke-[3]" />
                    <span>Agregar otro auto</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    )}

        </main>
      </div>

      {/* ========================================================================= */}
      {/* DRAWER LATERAL: DETALLE DE PEDIDO & CLIENTE (Panel Derecho Apple Native)   */}
      {/* ========================================================================= */}
      {selectedOrderModal && (
        <div
          className="fixed inset-0 z-50 overflow-hidden bg-slate-950/40 backdrop-blur-xs animate-in fade-in duration-200 flex justify-end"
          onClick={() => setSelectedOrderModal(null)}
        >
          <div
            className="w-full sm:w-[500px] md:w-[560px] h-full bg-[#F8F9FA] shadow-2xl flex flex-col border-l border-slate-200/90 text-slate-900 animate-in slide-in-from-right duration-300 font-sans"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header Drawer */}
            <div className="p-5 sm:px-6 py-4 bg-white/80 backdrop-blur-md border-b border-slate-200/70 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#0E8388]/10 text-[#0E8388] border border-[#0E8388]/20 flex items-center justify-center shrink-0 shadow-xs">
                  <ShoppingBag className="w-5 h-5 stroke-[2.2]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base sm:text-lg font-bold tracking-tight text-slate-900">
                      Pedido {selectedOrderModal.id}
                    </h3>
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                      selectedOrderModal.status === 'entregado'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : selectedOrderModal.status === 'en_camino'
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}>
                      {selectedOrderModal.status === 'entregado' && <CheckCircle2 className="w-3 h-3" />}
                      {selectedOrderModal.status === 'en_camino' && <Truck className="w-3 h-3" />}
                      {selectedOrderModal.status === 'en_preparacion' && <Clock className="w-3 h-3" />}
                      <span>{selectedOrderModal.status.replace('_', ' ')}</span>
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-medium">
                    {selectedOrderModal.date} · {selectedOrderModal.time}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedOrderModal(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-400 hover:text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
                title="Cerrar panel"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
              {/* Card 1: Cliente & Mascota (Grouped Inset Apple Style) */}
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-1 mb-1.5 block">
                  Información del Cliente & Mascota
                </span>
                <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-2xl bg-[#0E8388]/10 text-[#0E8388] border border-[#0E8388]/20 font-black text-sm flex items-center justify-center shrink-0">
                        {selectedOrderModal.customer.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 text-sm">{selectedOrderModal.customer}</div>
                        <div className="text-[11px] text-slate-500 font-medium flex items-center gap-1.5 mt-0.5">
                          <Mail className="w-3 h-3 text-slate-400" />
                          <a href={`mailto:${selectedOrderModal.email}`} className="hover:text-[#0E8388] transition-colors">
                            {selectedOrderModal.email}
                          </a>
                        </div>
                        <div className="text-[11px] text-slate-500 font-medium flex items-center gap-1.5 mt-0.5">
                          <Phone className="w-3 h-3 text-slate-400" />
                          <a href={`tel:${selectedOrderModal.phone}`} className="hover:text-[#0E8388] transition-colors">
                            {selectedOrderModal.phone}
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 grid grid-cols-2 gap-3 text-xs">
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/70">
                      <div className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1 mb-0.5">
                        <Heart className="w-3 h-3 text-rose-500" />
                        <span>Mascota</span>
                      </div>
                      <div className="font-bold text-slate-800 flex items-center gap-1.5">
                        <span>{selectedOrderModal.petType?.toLowerCase().includes('gato') || selectedOrderModal.petType?.includes('🐱') ? '🐱' : '🐶'}</span>
                        <span>{selectedOrderModal.petName}</span>
                      </div>
                      <div className="text-[10px] text-slate-500 truncate">{selectedOrderModal.petBreed || 'Mascota regalona'}</div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/70">
                      <div className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1 mb-0.5">
                        <Receipt className="w-3 h-3 text-[#0E8388]" />
                        <span>Boleta / Factura</span>
                      </div>
                      <div className="font-bold text-[#0E8388] font-mono text-[11px]">{selectedOrderModal.invoiceNumber}</div>
                      <div className="text-[10px] text-slate-500 font-mono truncate">Track: {selectedOrderModal.tracking}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 2: Dirección y Despacho */}
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-1 mb-1.5 block">
                  Destino de Despacho & Navegación GPS
                </span>
                <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs space-y-3 text-xs">
                  <div className="flex items-start gap-2.5">
                    <MapPin className="w-4 h-4 text-[#0E8388] shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold text-slate-900">{selectedOrderModal.address}</div>
                      <div className="text-slate-600 font-medium text-[11px]">{selectedOrderModal.city || selectedOrderModal.deliveryZone}</div>
                    </div>
                  </div>
                  {selectedOrderModal.notes && (
                    <div className="p-2.5 rounded-xl bg-amber-50/80 border border-amber-200/70 text-amber-900 text-[11px]">
                      <strong>Nota de entrega:</strong> "{selectedOrderModal.notes}"
                    </div>
                  )}

                  {/* 1-Tap Fast Dispatch Actions */}
                  <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-2">
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedOrderModal.address + ', ' + (selectedOrderModal.city || 'Puerto Varas'))}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="py-2 px-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-slate-800 border border-blue-200 font-bold text-[11px] flex items-center justify-center gap-1.5 transition-all shadow-2xs hover:scale-102 active:scale-95"
                      title="Abrir en Google Maps"
                    >
                      <GoogleMapsIcon className="w-3.5 h-3.5 shrink-0" />
                      <span>Google Maps</span>
                    </a>

                    <a
                      href={`https://wa.me/${(selectedOrderModal.phone || '+56987654321').replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`¡Hola ${selectedOrderModal.customer}! Te contactamos de Patitas del Sur respecto a tu pedido ${selectedOrderModal.id}. 🐾`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="py-2 px-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 font-bold text-[11px] flex items-center justify-center gap-1.5 transition-all shadow-2xs hover:scale-102 active:scale-95"
                      title="Avisar por WhatsApp"
                    >
                      <WhatsAppIcon className="w-3.5 h-3.5 shrink-0" />
                      <span>WhatsApp</span>
                    </a>
                  </div>
                </div>
              </div>

              {/* Card 3: Desglose de Productos */}
              <div>
                <div className="px-1 mb-1.5 flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Productos del Pedido ({selectedOrderModal.items.length})
                  </span>
                  <span className="text-[10px] text-slate-400">Clic para ampliar foto</span>
                </div>
                <div className="bg-white rounded-2xl border border-slate-200/80 divide-y divide-slate-100 overflow-hidden shadow-xs text-xs">
                  {selectedOrderModal.items.map((item, idx) => (
                    <div
                      key={idx}
                      onClick={() => setSelectedProductPreview({
                        ...item,
                        orderId: selectedOrderModal.id,
                        customer: selectedOrderModal.customer,
                        petName: selectedOrderModal.petName,
                        petType: selectedOrderModal.petType,
                        tracking: selectedOrderModal.tracking,
                      })}
                      className="p-3 hover:bg-slate-50/80 flex items-center justify-between gap-3 transition-colors cursor-pointer group"
                      title="Clic para ver foto ampliada"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-11 h-11 rounded-xl bg-white border border-slate-200/80 p-1 flex items-center justify-center shrink-0 overflow-hidden group-hover:scale-105 transition-transform shadow-2xs">
                          <img
                            src={getProductImage(item.name)}
                            alt={item.name}
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <div className="min-w-0">
                          <div className="font-bold text-slate-900 truncate group-hover:text-[#0E8388] transition-colors">
                            {item.name}
                          </div>
                          <div className="text-[11px] text-slate-500 font-mono flex items-center gap-2 mt-0.5">
                            <span className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-700 font-bold text-[10px]">
                              {item.weight}
                            </span>
                            <span className="text-[10px]">SKU: {item.code}</span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="font-black text-slate-900">{formatCLP(item.price * item.quantity)}</div>
                        <div className="text-[10px] text-slate-400">{item.quantity} x {formatCLP(item.price)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Card 4: Resumen Financiero */}
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-1 mb-1.5 block">
                  Resumen de Pago
                </span>
                <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs space-y-2.5 text-xs">
                  {/* Banner de Cobro / No Cobro para Repartidor */}
                  {renderPaymentCollectionBanner(selectedOrderModal)}

                  <div className="flex items-center justify-between text-slate-600 pb-1.5 border-b border-slate-100">
                    <span className="font-bold">Tipo de Pago:</span>
                    <div className="flex items-center gap-2">
                      {renderPaymentMethodBadge(selectedOrderModal.paymentMethod)}
                      <div className="w-32">
                        <CustomDropdown
                          value={normalizePaymentMethod(selectedOrderModal.paymentMethod)}
                          options={[
                            { value: 'Web', label: 'Web' },
                            { value: 'Tarjeta', label: 'Tarjeta' },
                            { value: 'Efectivo', label: 'Efectivo' },
                            { value: 'Transferencia', label: 'Transferencia' },
                          ]}
                          onChange={(val) => handleUpdateOrderPaymentMethod(selectedOrderModal.id, val)}
                          usePortal={true}
                          align="right"
                          minMenuWidth={130}
                          buttonClassName="h-7 px-2 rounded-lg bg-slate-50 hover:bg-white border border-slate-200 text-[10px] font-bold text-slate-700 flex items-center justify-between gap-1 w-full"
                          popoverClassName="p-1 rounded-xl shadow-xl border border-slate-200"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Subtotal Productos:</span>
                    <span className="font-mono text-slate-900 font-bold">{formatCLP(selectedOrderModal.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Costo de Despacho:</span>
                    <span className="font-mono text-emerald-700 font-bold">
                      {selectedOrderModal.shippingCost === 0 ? 'GRATIS' : formatCLP(selectedOrderModal.shippingCost)}
                    </span>
                  </div>
                  {selectedOrderModal.agreementUsed && (
                    <div className="flex justify-between text-purple-700 font-semibold">
                      <span>Convenio Aplicado:</span>
                      <span>{selectedOrderModal.agreementUsed}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-base font-black text-slate-900 pt-2.5 border-t border-slate-100">
                    <span>Total Pagado:</span>
                    <span className="text-[#0E8388] font-mono">{formatCLP(selectedOrderModal.total)}</span>
                  </div>
                </div>
              </div>

              {/* Card 5: Cambio de Estado Rápido */}
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-1 mb-1.5 block">
                  Actualizar Estado de Despacho
                </span>
                <div className="bg-white rounded-2xl border border-slate-200/80 p-2.5 shadow-xs grid grid-cols-3 gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleUpdateOrderStatus(selectedOrderModal.id, 'en_preparacion')}
                    className={`py-2 px-1 rounded-xl text-[11px] font-bold transition-all text-center border cursor-pointer ${
                      selectedOrderModal.status === 'en_preparacion'
                        ? 'bg-amber-400 border-amber-500 text-slate-950 font-black shadow-xs'
                        : 'bg-slate-50 border-slate-200/60 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    En Prep. ⏳
                  </button>
                  <button
                    type="button"
                    onClick={() => handleUpdateOrderStatus(selectedOrderModal.id, 'en_camino')}
                    className={`py-2 px-1 rounded-xl text-[11px] font-bold transition-all text-center border cursor-pointer ${
                      selectedOrderModal.status === 'en_camino'
                        ? 'bg-blue-600 border-blue-700 text-white font-black shadow-xs'
                        : 'bg-slate-50 border-slate-200/60 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    En Camino 🚚
                  </button>
                  <button
                    type="button"
                    onClick={() => handleUpdateOrderStatus(selectedOrderModal.id, 'entregado')}
                    className={`py-2 px-1 rounded-xl text-[11px] font-bold transition-all text-center border cursor-pointer ${
                      selectedOrderModal.status === 'entregado'
                        ? 'bg-emerald-600 border-emerald-700 text-white font-black shadow-xs'
                        : 'bg-slate-50 border-slate-200/60 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    Entregado ✓
                  </button>
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="p-4 sm:px-6 bg-white/90 backdrop-blur-md border-t border-slate-200/70 flex items-center justify-between gap-3 shrink-0">
              <button
                type="button"
                onClick={() => setSelectedOrderModal(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Cerrar
              </button>

              <button
                type="button"
                onClick={() => showToast(`Imprimiendo Guía & Boleta ${selectedOrderModal.invoiceNumber}...`)}
                className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors flex items-center gap-2 cursor-pointer shadow-xs active:scale-95"
              >
                <Receipt className="w-4 h-4 text-emerald-400" />
                <span>Imprimir Boleta</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: AGREGAR PEDIDO MANUALMENTE (Apple Native Multi-Step Design)        */}
      {/* ========================================================================= */}
      {isAddOrderModalOpen && (() => {
        const subtotal = manualOrderItems.reduce((acc, it) => acc + (it.price * it.quantity), 0);
        const shipping = parseInt(manualOrderCustomer.shippingCost, 10) || 0;
        const total = subtotal + shipping;
        const currentSelectedProduct = PRODUCTS.find((p) => p.id === selectedProductToAdd) || PRODUCTS[0];

        const phoneDigits = (manualOrderCustomer.phone || '').replace(/\D/g, '').slice(0, 9);
        const isPhoneTooShort = phoneDigits.length < 9;
        const showPhoneAlert = (phoneDigits.length > 0 && isPhoneTooShort) || (manualOrderPhoneTouched && isPhoneTooShort);

        // Clientes registrados que coinciden con el teléfono ingresado
        const matchingPhoneCustomers = (phoneDigits && phoneDigits.length >= 1)
          ? customers.filter((c) => {
              const cPhoneDigits = (c.phone || '').replace(/\D/g, '');
              const cPhone9 = cPhoneDigits.slice(-9);
              return cPhoneDigits.includes(phoneDigits) || cPhone9.includes(phoneDigits);
            })
          : [];

        const handleCloseModal = () => {
          setIsAddOrderModalOpen(false);
          setManualOrderStep(1);
          setManualOrderPhoneTouched(false);
          setShowPhoneSuggestions(false);
          setMapsSearchQuery('');
          setMapsSearchResults([]);
          setShowMapsDropdown(false);
          setSelectedFromMaps(false);
          setOrderPetTypeFilter(null);
          setOrderProductSearch('');
          setOrderBrandFilter('todas');
          setSelectedMultiProductIds([]);
          setOrderProductCardConfigs({});
        };

        // Búsqueda inteligente de alimento habitual / última compra para clientes registrados
        const customerFrequentFood = (() => {
          if (!manualOrderCustomer.name && !phoneDigits) return null;
          const cleanPhone = phoneDigits;

          // 1. Buscar en historial de pedidos anteriores del cliente
          const pastOrders = orders.filter((o) => {
            const oPhone = (o.phone || '').replace(/\D/g, '').slice(-9);
            const matchPhone = cleanPhone && oPhone === cleanPhone;
            const matchName = manualOrderCustomer.name && o.customer?.toLowerCase() === manualOrderCustomer.name.trim().toLowerCase();
            const matchEmail = manualOrderCustomer.email && o.email?.toLowerCase() === manualOrderCustomer.email.trim().toLowerCase();
            return matchPhone || matchName || matchEmail;
          });

          // 2. Buscar en ficha CRM de clientes
          const crmCustomer = customers.find((c) => {
            const cPhone = (c.phone || '').replace(/\D/g, '').slice(-9);
            const matchPhone = cleanPhone && cPhone === cleanPhone;
            const matchName = manualOrderCustomer.name && c.name?.toLowerCase() === manualOrderCustomer.name.trim().toLowerCase();
            const matchEmail = manualOrderCustomer.email && c.email?.toLowerCase() === manualOrderCustomer.email.trim().toLowerCase();
            return matchPhone || matchName || matchEmail;
          });

          const targetPetType = orderPetTypeFilter || (manualOrderCustomer.petType?.toLowerCase().includes('gato') ? 'gatos' : 'perros');

          // Buscar alimento seco comprado en pedidos
          for (const ord of pastOrders) {
            if (ord.items && ord.items.length > 0) {
              for (const it of ord.items) {
                const prod = PRODUCTS.find((p) => {
                  const pName = p.name.toLowerCase();
                  const itName = it.name.toLowerCase();
                  return (
                    pName.includes(itName) ||
                    itName.includes(pName) ||
                    (p.brand && itName.includes(p.brand.toLowerCase()) &&
                      ((itName.includes('cordero') && pName.includes('cordero')) ||
                       (itName.includes('pollo') && pName.includes('pollo')) ||
                       (itName.includes('salmón') && pName.includes('salmón')) ||
                       (itName.includes('salmon') && pName.includes('salmon')) ||
                       (itName.includes('trucha') && pName.includes('trucha')) ||
                       (itName.includes('arenque') && pName.includes('arenque'))))
                  );
                });
                if (prod && (!targetPetType || prod.petType === targetPetType)) {
                  return {
                    product: prod,
                    weight: it.weight || prod.weights?.[0] || 'Estándar',
                    source: 'order',
                    orderId: ord.id,
                    orderDate: ord.date,
                    petName: ord.petName || crmCustomer?.pets?.[0]?.name || manualOrderCustomer.petName || 'su mascota',
                  };
                }
              }
            }
          }

          // Si no está en pedidos anteriores, buscar en favoriteFood del CRM
          if (crmCustomer) {
            const pet = (targetPetType === 'gatos'
              ? crmCustomer.pets?.find((p) => p.type?.toLowerCase().includes('gato'))
              : crmCustomer.pets?.find((p) => p.type?.toLowerCase().includes('perro'))) || crmCustomer.pets?.[0] || crmCustomer.pet;

            const fav = pet?.favoriteFood;
            if (fav) {
              const favLower = fav.toLowerCase();
              const prod = PRODUCTS.find((p) => {
                const pName = p.name.toLowerCase();
                return (
                  pName.includes(favLower) ||
                  favLower.includes(pName) ||
                  (p.brand && favLower.includes(p.brand.toLowerCase()) &&
                    ((favLower.includes('cordero') && pName.includes('cordero')) ||
                     (favLower.includes('pollo') && pName.includes('pollo')) ||
                     (favLower.includes('salmón') && pName.includes('salmón')) ||
                     (favLower.includes('salmon') && pName.includes('salmon')) ||
                     (favLower.includes('trucha') && pName.includes('trucha'))))
                );
              });

              if (prod && (!targetPetType || prod.petType === targetPetType)) {
                const weightMatch = fav.match(/\d+\s*(kg|g)/i);
                const weight = weightMatch ? weightMatch[0] : (prod.weights?.[0] || 'Estándar');
                return {
                  product: prod,
                  weight: weight,
                  source: 'crm',
                  petName: pet?.name || manualOrderCustomer.petName || 'su mascota',
                };
              }
            }
          }

          return null;
        })();

        // Marcas dinámicas según la especie seleccionada
        const availableBrands = ['todas', ...Array.from(new Set(
          PRODUCTS.filter((p) => !orderPetTypeFilter || p.petType === orderPetTypeFilter)
            .map((p) => p.brand)
            .filter(Boolean)
        ))];

        // Productos filtrados según especie, marca y palabra clave
        const filteredOrderProducts = PRODUCTS.filter((p) => {
          if (orderPetTypeFilter && p.petType !== orderPetTypeFilter) return false;
          if (orderBrandFilter !== 'todas' && p.brand !== orderBrandFilter) return false;
          if (orderProductSearch.trim()) {
            const q = orderProductSearch.toLowerCase().trim();
            const matchName = p.name?.toLowerCase().includes(q);
            const matchBrand = p.brand?.toLowerCase().includes(q);
            const matchCategory = p.category?.toLowerCase().includes(q);
            const matchTagline = p.tagline?.toLowerCase().includes(q);
            const matchIngredients = p.ingredients?.some((ing) => ing.toLowerCase().includes(q));
            if (!matchName && !matchBrand && !matchCategory && !matchTagline && !matchIngredients) {
              return false;
            }
          }
          return true;
        });

        const inStockCount = filteredOrderProducts.filter((p) => getProductStock(p) > 0).length;
        const outOfStockCount = filteredOrderProducts.filter((p) => getProductStock(p) <= 0).length;

        const steps = [
          { id: 1, label: 'Cliente', icon: Users, desc: 'Datos del cliente' },
          { id: 2, label: 'Productos', icon: ShoppingBag, desc: 'Items del pedido y productos' },
          { id: 3, label: 'Despacho', icon: Truck, desc: 'Dirección y costo de envío' },
        ];

        const goToNextStep = (e) => {
          if (e) e.preventDefault();
          if (manualOrderStep === 1) {
            if (!manualOrderCustomer.name.trim()) {
              showToast('⚠️ Ingresa el nombre del cliente para continuar');
              return;
            }
            if (phoneDigits.length !== 9) {
              setManualOrderPhoneTouched(true);
              showToast('⚠️ El teléfono debe tener exactamente 9 dígitos');
              return;
            }
            if (!orderPetTypeFilter) {
              const pType = (manualOrderCustomer.petType || '').toLowerCase();
              if (pType.includes('gato')) {
                setOrderPetTypeFilter('gatos');
              } else {
                setOrderPetTypeFilter('perros');
              }
            }
            setManualOrderStep(2);
          } else if (manualOrderStep === 2) {
            if (manualOrderItems.length === 0) {
              showToast('⚠️ Debes agregar al menos un producto al pedido');
              return;
            }
            // Auto-recomendar despacho gratis si califica
            if (subtotal >= 25000 && parseInt(manualOrderCustomer.shippingCost, 10) !== 0) {
              setManualOrderCustomer((prev) => ({ ...prev, shippingCost: 0 }));
            }
            setManualOrderStep(3);
          }
        };

        const goToPrevStep = () => {
          if (manualOrderStep > 1) {
            setManualOrderStep(manualOrderStep - 1);
          }
        };

        return (
          <div
            onClick={handleCloseModal}
            className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/40 backdrop-blur-md animate-in fade-in duration-200"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="bg-[#F8F9FA] border border-slate-200/90 rounded-[28px] max-w-2xl w-full shadow-2xl max-h-[92vh] flex flex-col text-slate-900 overflow-hidden font-sans"
            >
              
              {/* Apple Window Header */}
              <div className="px-6 pt-5 pb-3 flex items-center justify-between border-b border-slate-200/60 bg-white/70 backdrop-blur-md">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-[#0E8388]/10 text-[#0E8388] border border-[#0E8388]/20 flex items-center justify-center shrink-0 shadow-xs">
                    <ShoppingBag className="w-5 h-5 stroke-[2.2]" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base sm:text-lg font-bold tracking-tight text-slate-900">
                        Crear Pedido
                      </h3>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 border border-slate-200/70">
                        Paso {manualOrderStep} de 3
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 font-medium">
                      {steps[manualOrderStep - 1]?.desc}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="w-8 h-8 rounded-full bg-slate-100/80 hover:bg-slate-200 text-slate-400 hover:text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
                  title="Cerrar"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Apple Segmented Step Indicator */}
              <div className="px-6 pt-4 pb-2 bg-[#F8F9FA]">
                <div className="bg-slate-200/70 p-1 rounded-2xl grid grid-cols-3 gap-1 shadow-inner select-none">
                  {steps.map((st) => {
                    const isActive = manualOrderStep === st.id;
                    const isPassed = manualOrderStep > st.id;

                    return (
                      <button
                        key={st.id}
                        type="button"
                        onClick={() => {
                          if (st.id >= 2 && (!manualOrderCustomer.name.trim() || phoneDigits.length !== 9)) {
                            setManualOrderPhoneTouched(true);
                            showToast('⚠️ Ingresa el nombre y un teléfono válido (9 dígitos)');
                            return;
                          }
                          if (st.id === 3 && manualOrderItems.length === 0) {
                            showToast('⚠️ Agrega al menos un producto al pedido');
                            return;
                          }
                          setManualOrderStep(st.id);
                        }}
                        className={`py-2 px-2 sm:px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                          isActive
                            ? 'bg-white text-slate-900 shadow-sm font-bold scale-[1.01]'
                            : isPassed
                            ? 'text-[#0E8388] hover:text-[#0c7276] hover:bg-white/50'
                            : 'text-slate-500 hover:text-slate-700'
                        }`}
                      >
                        <div
                          className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 transition-colors ${
                            isActive
                              ? 'bg-[#0E8388] text-white'
                              : isPassed
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-slate-300/80 text-slate-600'
                          }`}
                        >
                          {isPassed ? <Check className="w-3 h-3 stroke-[3]" /> : st.id}
                        </div>
                        <span className="hidden xs:inline sm:inline truncate">{st.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Step Forms */}
              <div className="flex-1 overflow-y-auto px-6 py-4 space-y-5">
                {/* ---------------- STEP 1: CLIENTE ---------------- */}
                {manualOrderStep === 1 && (
                  <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-200">
                    {/* Inset Group 1: Cliente */}
                    <div>
                      <div className="px-1 mb-1.5 flex items-center justify-between">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                          Datos del Cliente
                        </span>
                        <span className="text-[11px] font-medium text-slate-400">
                          * Campo obligatorio
                        </span>
                      </div>
                      <div className="bg-white rounded-2xl border border-slate-200/80 divide-y divide-slate-100 shadow-xs overflow-hidden">
                        {/* 1. Teléfono (Primero, con lista desplegable inteligente de clientes registrados) */}
                        <div className="flex flex-col px-4 py-2.5 bg-white">
                          <div className="flex items-center">
                            <label className="w-28 sm:w-36 text-xs font-semibold text-slate-700 shrink-0 flex items-center gap-1.5">
                              <Phone className="w-3.5 h-3.5 text-[#0E8388]" />
                              <span>Teléfono <span className="text-rose-500">*</span></span>
                            </label>
                            <div className="flex-1 flex items-center gap-1.5">
                              {/* Prefijo Fijo +56 */}
                              <div className="px-2 py-0.5 bg-slate-100 border border-slate-200/80 rounded-md text-slate-700 font-bold text-xs select-none flex items-center gap-1 shrink-0 font-mono">
                                <span>🇨🇱</span>
                                <span>+56</span>
                              </div>
                              <input
                                type="tel"
                                inputMode="numeric"
                                pattern="[0-9]*"
                                maxLength={9}
                                required
                                autoFocus
                                placeholder="9 8765 4321"
                                value={manualOrderCustomer.phone}
                                onChange={(e) => {
                                  const onlyDigits = e.target.value.replace(/\D/g, '').slice(0, 9);
                                  setManualOrderCustomer({ ...manualOrderCustomer, phone: onlyDigits });
                                  if (onlyDigits.length >= 1) {
                                    setShowPhoneSuggestions(true);
                                  } else {
                                    setShowPhoneSuggestions(false);
                                  }
                                }}
                                onFocus={() => {
                                  if (phoneDigits.length >= 1) setShowPhoneSuggestions(true);
                                }}
                                onBlur={() => {
                                  if (phoneDigits.length > 0) setManualOrderPhoneTouched(true);
                                }}
                                className="w-full text-xs text-slate-900 font-mono font-medium placeholder-slate-400 bg-transparent focus:outline-none"
                              />
                              {phoneDigits.length > 0 && (
                                <span
                                  className={`text-[10px] font-bold shrink-0 px-1.5 py-0.5 rounded-full ${
                                    phoneDigits.length === 9
                                      ? 'bg-emerald-50 text-emerald-600'
                                      : 'bg-rose-50 text-rose-500'
                                  }`}
                                >
                                  {phoneDigits.length}/9
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Alerta roja bajo el campo si coloca menos de 9 números */}
                          {showPhoneAlert && (
                            <p className="mt-1.5 flex items-center gap-1.5 text-[11px] font-semibold text-rose-500 animate-in fade-in">
                              <AlertCircle className="w-3.5 h-3.5 shrink-0 text-rose-500" />
                              <span>
                                {phoneDigits.length === 0
                                  ? 'El teléfono es obligatorio (debe tener 9 números)'
                                  : `El teléfono es incorrecto (debe tener 9 números, faltan ${9 - phoneDigits.length})`}
                              </span>
                            </p>
                          )}

                          {/* Lista Desplegable Minimalista de Clientes Registrados */}
                          {showPhoneSuggestions && phoneDigits.length >= 1 && matchingPhoneCustomers.length > 0 && (
                            <div className="mt-2 rounded-xl border border-slate-200/90 bg-white shadow-xs divide-y divide-slate-100 overflow-hidden animate-in fade-in duration-150">
                              {matchingPhoneCustomers.map((cust) => {
                                const custPhoneDigits = (cust.phone || '').replace(/\D/g, '').slice(-9);
                                const formattedPhone = custPhoneDigits.length === 9
                                  ? `+56 9 ${custPhoneDigits.slice(1, 5)} ${custPhoneDigits.slice(5)}`
                                  : `+56 ${custPhoneDigits}`;
                                const firstPet = cust.pets?.[0] || cust.pet;

                                return (
                                  <div
                                    key={cust.id}
                                    onMouseDown={(e) => {
                                      e.preventDefault();
                                      setManualOrderCustomer((prev) => ({
                                        ...prev,
                                        name: cust.name,
                                        phone: custPhoneDigits,
                                        email: cust.email || prev.email,
                                        address: cust.address || prev.address,
                                        city: cust.city || prev.city || 'Puerto Varas',
                                        petName: firstPet?.name || prev.petName,
                                        petType: (firstPet?.type?.toLowerCase().includes('gato') ? '🐱 Gato' : '🐶 Perro') || prev.petType,
                                      }));
                                      setShowPhoneSuggestions(false);
                                      setManualOrderPhoneTouched(false);
                                      showToast(`✨ Datos de ${cust.name} autocompletados`);
                                    }}
                                    className="px-3.5 py-2.5 hover:bg-teal-50/50 active:bg-teal-50 transition-colors cursor-pointer select-none"
                                  >
                                    <div className="font-mono text-xs font-bold text-slate-800">
                                      {formattedPhone}
                                    </div>
                                    <div className="text-[11px] font-medium text-slate-500 mt-0.5">
                                      {cust.name}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>

                        {/* 2. Nombre (Segundo) */}
                        <div className="flex items-center px-4 py-3 bg-white">
                          <label className="w-28 sm:w-36 text-xs font-semibold text-slate-700 shrink-0 flex items-center gap-1.5">
                            <Users className="w-3.5 h-3.5 text-[#0E8388]" />
                            <span>Nombre <span className="text-rose-500">*</span></span>
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="Ej: Camila Silva"
                            value={manualOrderCustomer.name}
                            onChange={(e) => setManualOrderCustomer({ ...manualOrderCustomer, name: e.target.value })}
                            className="w-full text-xs text-slate-900 font-medium placeholder-slate-400 bg-transparent focus:outline-none"
                          />
                        </div>

                        {/* 3. Email (Tercero) */}
                        <div className="flex items-center px-4 py-3 bg-white">
                          <label className="w-28 sm:w-36 text-xs font-semibold text-slate-700 shrink-0 flex items-center gap-1.5">
                            <Mail className="w-3.5 h-3.5 text-slate-400" />
                            <span>Email</span>
                          </label>
                          <input
                            type="email"
                            placeholder="cliente@gmail.com"
                            value={manualOrderCustomer.email}
                            onChange={(e) => setManualOrderCustomer({ ...manualOrderCustomer, email: e.target.value })}
                            className="w-full text-xs text-slate-900 font-medium placeholder-slate-400 bg-transparent focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Apple Info Pill */}
                    <div className="p-3.5 rounded-2xl bg-slate-100/90 border border-slate-200/70 flex items-center gap-2.5 text-slate-600">
                      <Sparkles className="w-4 h-4 text-[#0E8388] shrink-0" />
                      <p className="text-[11px] leading-relaxed">
                        Los datos ingresados se vincularán automáticamente al historial del cliente en el CRM.
                      </p>
                    </div>
                  </div>
                )}

                {/* ---------------- STEP 2: PRODUCTOS ---------------- */}
                {manualOrderStep === 2 && (
                  <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-200">
                    {/* Inset Card: Selector de Productos con Filtros Inteligentes */}
                    <div className="space-y-3">
                      {/* 1. SELECCIÓN DE ESPECIE (PERRO / GATO) */}
                      {!orderPetTypeFilter ? (
                        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 text-center shadow-xs animate-in fade-in">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">
                            Paso 1: Selecciona la mascota
                          </span>
                          <h4 className="text-sm sm:text-base font-black text-slate-900 mb-1">
                            ¿Para qué mascota buscas productos?
                          </h4>
                          <p className="text-xs text-slate-500 mb-4 max-w-sm mx-auto">
                            Elige perro o gato para desplegar la barra de búsqueda por palabra clave y marcas disponibles.
                          </p>

                          <div className="grid grid-cols-2 gap-3 max-w-md mx-auto">
                            <button
                              type="button"
                              onClick={() => {
                                setOrderPetTypeFilter('perros');
                                setOrderBrandFilter('todas');
                                setOrderProductSearch('');
                                const firstDog = PRODUCTS.find((p) => p.petType === 'perros' && getProductStock(p) > 0);
                                if (firstDog) {
                                  setSelectedProductToAdd(firstDog.id);
                                  setSelectedWeightToAdd(firstDog.weights?.[0] || '12 kg');
                                }
                              }}
                              className="p-4 rounded-2xl border-2 border-slate-200 hover:border-[#0E8388] hover:bg-teal-50/20 transition-all text-center group cursor-pointer active:scale-98 shadow-xs bg-slate-50/50"
                            >
                              <div className="w-12 h-12 mx-auto rounded-2xl bg-amber-50 text-2xl flex items-center justify-center mb-2 group-hover:scale-110 transition-transform shadow-2xs">
                                🐶
                              </div>
                              <span className="text-xs sm:text-sm font-black text-slate-900 block group-hover:text-[#0E8388]">
                                Perros
                              </span>
                              <span className="text-[10px] text-slate-500 font-semibold block mt-0.5">
                                Alimento, snacks y suplementos
                              </span>
                              <span className="inline-block mt-2 px-2 py-0.5 rounded-full text-[10px] font-bold bg-white border border-slate-200 text-slate-600">
                                {PRODUCTS.filter((p) => p.petType === 'perros').length} productos
                              </span>
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                setOrderPetTypeFilter('gatos');
                                setOrderBrandFilter('todas');
                                setOrderProductSearch('');
                                const firstCat = PRODUCTS.find((p) => p.petType === 'gatos' && getProductStock(p) > 0);
                                if (firstCat) {
                                  setSelectedProductToAdd(firstCat.id);
                                  setSelectedWeightToAdd(firstCat.weights?.[0] || '7 kg');
                                }
                              }}
                              className="p-4 rounded-2xl border-2 border-slate-200 hover:border-[#0E8388] hover:bg-teal-50/20 transition-all text-center group cursor-pointer active:scale-98 shadow-xs bg-slate-50/50"
                            >
                              <div className="w-12 h-12 mx-auto rounded-2xl bg-purple-50 text-2xl flex items-center justify-center mb-2 group-hover:scale-110 transition-transform shadow-2xs">
                                🐱
                              </div>
                              <span className="text-xs sm:text-sm font-black text-slate-900 block group-hover:text-[#0E8388]">
                                Gatos
                              </span>
                              <span className="text-[10px] text-slate-500 font-semibold block mt-0.5">
                                Fórmulas secas, patés y snacks
                              </span>
                              <span className="inline-block mt-2 px-2 py-0.5 rounded-full text-[10px] font-bold bg-white border border-slate-200 text-slate-600">
                                {PRODUCTS.filter((p) => p.petType === 'gatos').length} productos
                              </span>
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-3 animate-in fade-in">
                          {/* Switcher de Especie en la cabecera */}
                          <div className="flex items-center justify-between gap-2 px-1">
                            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                              <span>Mascota:</span>
                              <strong className="text-slate-700 capitalize">
                                {orderPetTypeFilter === 'perros' ? '🐶 Perros' : '🐱 Gatos'}
                              </strong>
                            </span>

                            <div className="flex items-center bg-slate-200/80 p-0.5 rounded-xl text-xs font-bold shadow-inner">
                              <button
                                type="button"
                                onClick={() => {
                                  setOrderPetTypeFilter('perros');
                                  setOrderBrandFilter('todas');
                                  setOrderProductSearch('');
                                  const firstDog = PRODUCTS.find((p) => p.petType === 'perros' && getProductStock(p) > 0);
                                  if (firstDog) {
                                    setSelectedProductToAdd(firstDog.id);
                                    setSelectedWeightToAdd(firstDog.weights?.[0] || '12 kg');
                                  }
                                }}
                                className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 text-[11px] cursor-pointer ${
                                  orderPetTypeFilter === 'perros'
                                    ? 'bg-white text-slate-900 shadow-xs font-black'
                                    : 'text-slate-600 hover:text-slate-900'
                                }`}
                              >
                                <span>🐶 Perros</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setOrderPetTypeFilter('gatos');
                                  setOrderBrandFilter('todas');
                                  setOrderProductSearch('');
                                  const firstCat = PRODUCTS.find((p) => p.petType === 'gatos' && getProductStock(p) > 0);
                                  if (firstCat) {
                                    setSelectedProductToAdd(firstCat.id);
                                    setSelectedWeightToAdd(firstCat.weights?.[0] || '7 kg');
                                  }
                                }}
                                className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 text-[11px] cursor-pointer ${
                                  orderPetTypeFilter === 'gatos'
                                    ? 'bg-white text-slate-900 shadow-xs font-black'
                                    : 'text-slate-600 hover:text-slate-900'
                                }`}
                              >
                                <span>🐱 Gatos</span>
                              </button>
                            </div>
                          </div>

                          {/* 2. BARRA DE BÚSQUEDA POR PALABRA CLAVE */}
                          <div className="relative">
                            <div className="flex items-center gap-2 bg-white rounded-2xl border-2 border-slate-200/90 focus-within:border-[#0E8388] focus-within:ring-4 focus-within:ring-[#0E8388]/10 px-3.5 py-2.5 shadow-2xs transition-all">
                              <Search className="w-4 h-4 text-[#0E8388] shrink-0" />
                              <input
                                type="text"
                                placeholder={`Buscar producto en ${orderPetTypeFilter === 'perros' ? 'perros' : 'gatos'} por palabra clave (ej: Pollo, Salmón, 12kg)...`}
                                value={orderProductSearch}
                                onChange={(e) => setOrderProductSearch(e.target.value)}
                                className="w-full text-xs font-semibold text-slate-900 placeholder:text-slate-400 bg-transparent focus:outline-none"
                              />
                              {orderProductSearch && (
                                <button
                                  type="button"
                                  onClick={() => setOrderProductSearch('')}
                                  className="text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer rounded-full"
                                  title="Limpiar búsqueda"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </div>

                          {/* 3. FILTROS POR MARCAS */}
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between px-1">
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                                <Filter className="w-3 h-3 text-[#0E8388]" />
                                <span>Marcas ({availableBrands.length - 1})</span>
                              </span>
                              {orderBrandFilter !== 'todas' && (
                                <button
                                  type="button"
                                  onClick={() => setOrderBrandFilter('todas')}
                                  className="text-[10px] font-bold text-[#0E8388] hover:underline cursor-pointer"
                                >
                                  Ver todas las marcas
                                </button>
                              )}
                            </div>

                            <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 scrollbar-none">
                              {availableBrands.map((brandName) => {
                                const isSelected = orderBrandFilter === brandName;
                                return (
                                  <button
                                    key={brandName}
                                    type="button"
                                    onClick={() => setOrderBrandFilter(brandName)}
                                    className={`px-3 py-1.5 rounded-xl text-[11px] font-bold whitespace-nowrap transition-all cursor-pointer border shrink-0 ${
                                      isSelected
                                        ? 'bg-[#0E8388] text-white border-[#0E8388] shadow-xs'
                                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-slate-900'
                                    }`}
                                  >
                                    {brandName === 'todas' ? 'Todas las Marcas' : brandName}
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          {/* SECCIÓN DESTACADA: Alimento Habitual / Última Compra del Cliente */}
                          {customerFrequentFood && (
                            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-teal-500/10 to-emerald-500/10 border-2 border-amber-300/80 shadow-xs space-y-2.5 animate-in fade-in slide-in-from-top-2 duration-200">
                              <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-1.5">
                                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-amber-400 text-amber-950 text-xs font-black shadow-2xs">
                                    ⭐
                                  </span>
                                  <span className="text-xs font-extrabold text-amber-950 uppercase tracking-tight">
                                    Alimento habitual de {customerFrequentFood.petName}
                                  </span>
                                </div>
                                <span className="text-[10px] font-extrabold text-amber-800 bg-amber-100/90 px-2 py-0.5 rounded-full border border-amber-200">
                                  {customerFrequentFood.source === 'order' ? 'Última compra habitual' : 'Alimento frecuente'}
                                </span>
                              </div>

                              {/* Tarjeta del Producto Habitual */}
                              <div className="bg-white rounded-xl p-3 border border-amber-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
                                <div className="flex items-center gap-3 min-w-0 flex-1">
                                  <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center shrink-0 overflow-hidden border border-slate-100 p-0.5 shadow-2xs">
                                    {customerFrequentFood.product.image ? (
                                      <img
                                        src={customerFrequentFood.product.image}
                                        alt={customerFrequentFood.product.name}
                                        className="w-full h-full object-contain"
                                      />
                                    ) : (
                                      <span className="text-lg">🥣</span>
                                    )}
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                      <span className="text-[10px] font-black uppercase px-1.5 py-0.2 rounded bg-amber-100 text-amber-900">
                                        {customerFrequentFood.product.brand}
                                      </span>
                                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 rounded-full">
                                        ✓ Stock: {getProductStock(customerFrequentFood.product)} un.
                                      </span>
                                      {manualOrderItems.some((it) => it.productId === customerFrequentFood.product.id) && (
                                        <span className="text-[10px] font-black text-[#0E8388] bg-teal-50 border border-teal-200 px-1.5 py-0.2 rounded-full flex items-center gap-1">
                                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                                          <span>En el pedido</span>
                                        </span>
                                      )}
                                    </div>
                                    <p className="font-bold text-slate-900 text-xs mt-1 truncate" title={customerFrequentFood.product.name}>
                                      {customerFrequentFood.product.name}
                                    </p>
                                    <div className="flex items-center gap-2 mt-0.5">
                                      <span className="text-xs font-black text-[#0E8388] font-mono">
                                        {formatCLP(customerFrequentFood.product.price)}
                                      </span>
                                      <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-1.5 py-0.2 rounded">
                                        Formato: {customerFrequentFood.weight}
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                {/* Botón 1-tap para añadir al pedido */}
                                <div className="flex items-center gap-2 justify-end shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      handleAddProductToManualOrder(
                                        customerFrequentFood.product,
                                        customerFrequentFood.weight,
                                        1
                                      );
                                    }}
                                    disabled={getProductStock(customerFrequentFood.product) <= 0}
                                    className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#0E8388] to-[#093C3E] hover:opacity-95 active:scale-95 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-xs transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                  >
                                    <Plus className="w-3.5 h-3.5 stroke-[3]" />
                                    <span>
                                      {manualOrderItems.some((it) => it.productId === customerFrequentFood.product.id)
                                        ? 'Añadir otra unidad'
                                        : 'Añadir al pedido'}
                                    </span>
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* 4. CATÁLOGO DE PRODUCTOS (CON STOCK Y SIN STOCK) */}
                          <div className="space-y-2">
                            <div className="flex items-center justify-between px-1">
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                Catálogo ({filteredOrderProducts.length} productos)
                              </span>
                              <div className="flex items-center gap-2 text-[10px] font-semibold">
                                <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                                  ✓ {inStockCount} con stock
                                </span>
                                {outOfStockCount > 0 && (
                                  <span className="text-slate-500 bg-slate-200/80 px-2 py-0.5 rounded-full">
                                    🚫 {outOfStockCount} sin stock
                                  </span>
                                )}
                              </div>
                            </div>

                            {filteredOrderProducts.length === 0 ? (
                              <div className="text-center py-6 px-4 bg-white rounded-2xl border border-dashed border-slate-200 text-slate-400 text-xs">
                                <Search className="w-6 h-6 mx-auto mb-1 text-slate-300" />
                                <p className="font-bold text-slate-600">No se encontraron productos</p>
                                <p className="text-[11px] text-slate-400">Intenta con otra palabra clave o marca</p>
                              </div>
                            ) : (
                              <div className="space-y-2">
                                {/* Barra de Acción Masiva si hay productos seleccionados */}
                                {selectedMultiProductIds.length > 0 && (
                                  <div className="p-3 rounded-2xl bg-slate-900 text-white flex items-center justify-between shadow-lg animate-in slide-in-from-top-2 duration-150">
                                    <div className="flex items-center gap-2">
                                      <span className="w-5 h-5 rounded-full bg-[#0E8388] text-white flex items-center justify-center font-black text-[11px]">
                                        {selectedMultiProductIds.length}
                                      </span>
                                      <span className="text-xs font-bold">
                                        {selectedMultiProductIds.length === 1
                                          ? '1 producto seleccionado'
                                          : `${selectedMultiProductIds.length} productos seleccionados`}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <button
                                        type="button"
                                        onClick={() => setSelectedMultiProductIds([])}
                                        className="text-[11px] text-slate-300 hover:text-white px-2 py-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                                      >
                                        Limpiar
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const toAdd = selectedMultiProductIds.map((id) => {
                                            const prod = PRODUCTS.find((pr) => pr.id === id);
                                            const conf = orderProductCardConfigs[id] || {
                                              weight: prod?.weights?.[0] || 'Estándar',
                                              quantity: 1,
                                            };
                                            return { product: prod, weight: conf.weight, quantity: conf.quantity };
                                          });
                                          handleAddMultipleProductsToManualOrder(toAdd);
                                          setSelectedMultiProductIds([]);
                                        }}
                                        className="px-3 py-1.5 rounded-xl bg-[#0E8388] hover:bg-[#0c7276] text-white font-black text-xs flex items-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-95"
                                      >
                                        <Plus className="w-3.5 h-3.5 stroke-[3]" />
                                        <span>Añadir Seleccionados ({selectedMultiProductIds.length})</span>
                                      </button>
                                    </div>
                                  </div>
                                )}

                                <div className="max-h-72 sm:max-h-80 overflow-y-auto space-y-2 pr-1 rounded-2xl">
                                  {filteredOrderProducts.map((p) => {
                                    const stock = getProductStock(p);
                                    const inStock = stock > 0;
                                    const isMultiSelected = selectedMultiProductIds.includes(p.id);
                                    const itemsInOrder = manualOrderItems.filter((it) => it.productId === p.id);
                                    const totalInOrder = itemsInOrder.reduce((sum, it) => sum + it.quantity, 0);

                                    const cardConfig = orderProductCardConfigs[p.id] || {
                                      weight: p.weights?.[0] || 'Estándar',
                                      quantity: 1,
                                    };

                                    const handleUpdateCardWeight = (val) => {
                                      setOrderProductCardConfigs((prev) => ({
                                        ...prev,
                                        [p.id]: { ...(prev[p.id] || { quantity: 1 }), weight: val },
                                      }));
                                    };

                                    const handleUpdateCardQty = (delta) => {
                                      setOrderProductCardConfigs((prev) => {
                                        const current = prev[p.id]?.quantity || 1;
                                        const next = Math.max(1, Math.min(stock, current + delta));
                                        return {
                                          ...prev,
                                          [p.id]: { ...(prev[p.id] || { weight: p.weights?.[0] || 'Estándar' }), quantity: next },
                                        };
                                      });
                                    };

                                    const toggleMultiSelect = () => {
                                      setSelectedMultiProductIds((prev) =>
                                        prev.includes(p.id) ? prev.filter((id) => id !== p.id) : [...prev, p.id]
                                      );
                                    };

                                    if (!inStock) {
                                      // PRODUCTO SIN STOCK: Gris y no seleccionable
                                      return (
                                        <div
                                          key={p.id}
                                          className="p-3 rounded-2xl bg-slate-100/90 border border-slate-200/80 flex items-center justify-between gap-3 text-xs grayscale opacity-55 cursor-not-allowed select-none transition-all shadow-none"
                                          title="Producto sin stock disponible - No se puede seleccionar"
                                        >
                                          <div className="flex items-center gap-3 min-w-0">
                                            <div className="w-11 h-11 rounded-xl bg-slate-200/80 flex items-center justify-center shrink-0 overflow-hidden border border-slate-300/50">
                                              {p.image ? (
                                                <img src={p.image} alt={p.name} className="w-full h-full object-contain p-0.5" />
                                              ) : (
                                                <span className="text-sm">📦</span>
                                              )}
                                            </div>
                                            <div className="min-w-0">
                                              <div className="flex items-center gap-1.5 flex-wrap">
                                                <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.2 rounded bg-slate-200 text-slate-600">
                                                  {p.brand}
                                                </span>
                                                <span className="text-[10px] font-black text-rose-600 bg-rose-50 border border-rose-200 px-2 py-0.2 rounded-full">
                                                  🚫 Sin stock
                                                </span>
                                              </div>
                                              <p className="font-bold text-slate-600 truncate text-xs mt-0.5">
                                                {p.name}
                                              </p>
                                              <p className="text-[10px] text-slate-400 font-medium">
                                                {p.weights?.join(', ') || 'Formato único'} • {formatCLP(p.price)}
                                              </p>
                                            </div>
                                          </div>

                                          <div className="text-right shrink-0">
                                            <button
                                              type="button"
                                              disabled
                                              className="px-2.5 py-1 rounded-xl bg-slate-200 text-slate-400 text-[10px] font-black cursor-not-allowed border border-slate-300/60"
                                            >
                                              Agotado
                                            </button>
                                          </div>
                                        </div>
                                      );
                                    }

                                    // PRODUCTO CON STOCK: Con interacción individual, multiselección y añadir directo
                                    return (
                                      <div
                                        key={p.id}
                                        className={`p-3 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs ${
                                          isMultiSelected
                                            ? 'bg-teal-50/40 border-[#0E8388] ring-2 ring-[#0E8388]/20 shadow-xs'
                                            : totalInOrder > 0
                                            ? 'bg-emerald-50/25 border-emerald-300 shadow-2xs'
                                            : 'bg-white border-slate-200/90 hover:border-slate-300 shadow-2xs'
                                        }`}
                                      >
                                        {/* Información y Checkbox */}
                                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
                                          {/* Checkbox para seleccionar múltiples productos */}
                                          <button
                                            type="button"
                                            onClick={toggleMultiSelect}
                                            className={`w-5 h-5 rounded-lg border flex items-center justify-center shrink-0 transition-all cursor-pointer ${
                                              isMultiSelected
                                                ? 'bg-[#0E8388] border-[#0E8388] text-white shadow-xs'
                                                : 'border-slate-300 bg-white hover:border-[#0E8388]'
                                            }`}
                                            title={isMultiSelected ? 'Deseleccionar' : 'Seleccionar para añadir varios'}
                                          >
                                            {isMultiSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                                          </button>

                                          <div className="w-11 h-11 rounded-xl bg-slate-50 flex items-center justify-center shrink-0 overflow-hidden border border-slate-100">
                                            {p.image ? (
                                              <img src={p.image} alt={p.name} className="w-full h-full object-contain p-0.5" />
                                            ) : (
                                              <span className="text-sm">📦</span>
                                            )}
                                          </div>

                                          <div className="min-w-0 flex-1">
                                            <div className="flex items-center gap-1.5 flex-wrap">
                                              <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.2 rounded bg-slate-100 text-slate-700">
                                                {p.brand}
                                              </span>
                                              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 rounded-full flex items-center gap-0.5">
                                                <Check className="w-2.5 h-2.5 stroke-[3]" />
                                                <span>Stock: {stock} un.</span>
                                              </span>
                                              {totalInOrder > 0 && (
                                                <span className="text-[10px] font-black text-[#0E8388] bg-teal-50 border border-teal-200 px-1.5 py-0.2 rounded-full flex items-center gap-1">
                                                  <ShoppingBag className="w-2.5 h-2.5" />
                                                  <span>En pedido: {totalInOrder} un.</span>
                                                </span>
                                              )}
                                            </div>
                                            <p className="font-bold text-slate-900 truncate text-xs mt-0.5" title={p.name}>
                                              {p.name}
                                            </p>
                                            <p className="text-[11px] font-black text-[#0E8388] font-mono">
                                              {formatCLP(p.price)}
                                            </p>
                                          </div>
                                        </div>

                                        {/* Controles de Formato, Cantidad y Botón Añadir */}
                                        <div className="flex items-center gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 justify-end">
                                          {p.weights && p.weights.length > 1 ? (
                                            <div className="w-24 sm:w-28 shrink-0">
                                              <CustomDropdown
                                                value={cardConfig.weight}
                                                options={p.weights.map((w) => ({ value: w, label: w }))}
                                                onChange={(val) => handleUpdateCardWeight(val)}
                                                usePortal={true}
                                                align="right"
                                                minMenuWidth={115}
                                                buttonClassName="h-8 px-2.5 rounded-xl border border-slate-200 text-[11px] text-slate-800 bg-slate-50 hover:bg-white hover:border-[#0E8388] font-bold cursor-pointer transition-all flex items-center justify-between gap-1 w-full"
                                                popoverClassName="p-1 rounded-xl shadow-xl border border-slate-200"
                                              />
                                            </div>
                                          ) : (
                                            <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2.5 py-1.5 rounded-xl border border-slate-200/60 shrink-0">
                                              {p.weights?.[0] || 'Estándar'}
                                            </span>
                                          )}

                                          <div className="flex items-center bg-slate-100 rounded-xl p-0.5 border border-slate-200/80">
                                            <button
                                              type="button"
                                              onClick={() => handleUpdateCardQty(-1)}
                                              className="w-7 h-7 rounded-lg bg-white text-slate-700 font-bold hover:bg-slate-200/80 text-xs cursor-pointer shadow-xs flex items-center justify-center transition-colors"
                                            >
                                              -
                                            </button>
                                            <span className="w-6 text-center text-xs font-black text-slate-900 font-mono">
                                              {cardConfig.quantity}
                                            </span>
                                            <button
                                              type="button"
                                              onClick={() => handleUpdateCardQty(1)}
                                              className="w-7 h-7 rounded-lg bg-white text-slate-700 font-bold hover:bg-slate-200/80 text-xs cursor-pointer shadow-xs flex items-center justify-center transition-colors"
                                            >
                                              +
                                            </button>
                                          </div>

                                          <button
                                            type="button"
                                            onClick={() => handleAddProductToManualOrder(p, cardConfig.weight, cardConfig.quantity)}
                                            className="h-8 px-3 rounded-xl bg-[#0E8388] hover:bg-[#0c7276] text-white text-xs font-black transition-all flex items-center gap-1 cursor-pointer shadow-xs active:scale-95 shrink-0"
                                            title="Añadir al pedido"
                                          >
                                            <Plus className="w-3.5 h-3.5 stroke-[3]" />
                                            <span>Añadir</span>
                                          </button>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Lista de Productos Añadidos */}
                    <div>
                      <div className="px-1 mb-1.5 flex items-center justify-between">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                          Productos en la Orden ({manualOrderItems.length})
                        </span>
                        {manualOrderItems.length > 0 && (
                          <span className="text-[11px] font-semibold text-slate-500">
                            Subtotal: <strong className="text-slate-900 font-mono">{formatCLP(subtotal)}</strong>
                          </span>
                        )}
                      </div>

                      {manualOrderItems.length === 0 ? (
                        <div className="text-center py-7 px-4 border border-dashed border-slate-300/80 rounded-2xl bg-white text-slate-400 text-xs">
                          <ShoppingBag className="w-7 h-7 mx-auto mb-1.5 text-slate-300" />
                          <p className="font-bold text-slate-600">Aún no has agregado productos</p>
                          <p className="text-[11px] text-slate-400">Selecciona un producto arriba y pulsa "Añadir" para agregarlo a la orden.</p>
                        </div>
                      ) : (
                        <div className="bg-white rounded-2xl border border-slate-200/80 divide-y divide-slate-100 overflow-hidden shadow-xs">
                          {manualOrderItems.map((item, idx) => (
                            <div key={`${item.productId}-${item.weight}-${idx}`} className="p-3 flex items-center justify-between gap-3 text-xs">
                              <div className="flex items-center gap-3 min-w-0">
                                {item.image ? (
                                  <img
                                    src={item.image}
                                    alt={item.name}
                                    className="w-9 h-9 object-contain rounded-xl border border-slate-100 bg-slate-50 shrink-0"
                                  />
                                ) : (
                                  <div className="w-9 h-9 rounded-xl bg-teal-50 text-[#0E8388] flex items-center justify-center font-bold text-xs shrink-0">
                                    📦
                                  </div>
                                )}
                                <div className="min-w-0">
                                  <div className="font-bold text-slate-900 truncate">{item.name}</div>
                                  <div className="text-[11px] text-slate-500 flex items-center gap-2">
                                    <span className="bg-slate-100 px-1.5 py-0.5 rounded text-[10px] font-semibold text-slate-600">
                                      {item.weight}
                                    </span>
                                    <span>{formatCLP(item.price)} c/u</span>
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-3 shrink-0">
                                <span className="font-bold text-slate-700 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-lg text-[11px]">
                                  x{item.quantity}
                                </span>
                                <span className="font-black text-slate-900 font-mono w-20 text-right">
                                  {formatCLP(item.price * item.quantity)}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveProductFromManualOrder(idx)}
                                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                                  title="Eliminar producto"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Banner Informativo de Despacho Gratis según Subtotal */}
                    {manualOrderItems.length > 0 && (
                      <div className={`p-3.5 rounded-2xl flex items-center justify-between text-xs border transition-all animate-in fade-in ${
                        subtotal >= 25000
                          ? 'bg-emerald-50/90 border-emerald-200 text-emerald-900'
                          : 'bg-amber-50/90 border-amber-200 text-amber-900'
                      }`}>
                        <div className="flex items-center gap-2.5">
                          <span className="text-lg shrink-0">{subtotal >= 25000 ? '🎉' : '🚚'}</span>
                          <div>
                            <p className="font-extrabold text-[12px]">
                              {subtotal >= 25000
                                ? '¡Excelente! Califica para Despacho Gratis'
                                : `Faltan ${formatCLP(25000 - subtotal)} para Despacho Gratis`}
                            </p>
                            <p className="text-[11px] opacity-80">
                              {subtotal >= 25000
                                ? 'El costo de envío se aplicará en $0 en el paso de Despacho.'
                                : 'Despacho gratuito en compras desde $25.000'}
                            </p>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="text-[10px] uppercase font-bold text-slate-400 block">Subtotal</span>
                          <span className="font-mono font-black text-sm text-slate-900">{formatCLP(subtotal)}</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* ---------------- STEP 3: DIRECCIÓN & DESPACHO ---------------- */}
                {manualOrderStep === 3 && (
                  <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-200">
                    {/* Header Resumen del Valor del Pedido */}
                    <div className="p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block truncate">
                          Valor del Pedido ({manualOrderItems.length} {manualOrderItems.length === 1 ? 'producto' : 'productos'})
                        </span>
                        <span className="text-sm sm:text-base font-black text-slate-900 font-mono whitespace-nowrap">
                          Subtotal: {formatCLP(subtotal)}
                        </span>
                      </div>
                      {subtotal >= 25000 ? (
                        <span className="px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-black border border-emerald-200 flex items-center gap-1.5 whitespace-nowrap shrink-0">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                          <span>Despacho Gratis Aplicable</span>
                        </span>
                      ) : (
                        <span className="px-3 py-1.5 rounded-full bg-slate-100 text-slate-600 text-[11px] font-semibold whitespace-nowrap shrink-0">
                          Despacho estándar
                        </span>
                      )}
                    </div>

                    {/* Inset Group: Dirección con Google Maps */}
                    <div>
                      <div className="px-1 mb-1.5 flex items-center justify-between">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-[#0E8388]" />
                          <span>Lugar de Entrega</span>
                        </span>
                        <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                          Google Maps
                        </span>
                      </div>

                      {/* Barra de Búsqueda Google Maps */}
                      <div className="relative mb-3">
                        <div className="flex items-center gap-2.5 bg-white rounded-2xl border-2 border-[#0E8388]/30 hover:border-[#0E8388]/70 focus-within:border-[#0E8388] focus-within:ring-4 focus-within:ring-[#0E8388]/10 px-3.5 py-2.5 shadow-sm transition-all">
                          <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-emerald-500 to-[#0E8388] text-white flex items-center justify-center shrink-0 shadow-xs">
                            <Search className="w-3.5 h-3.5 stroke-[2.5]" />
                          </div>
                          <input
                            type="text"
                            placeholder="Buscar dirección en Google Maps (ej: San Francisco 416)..."
                            value={mapsSearchQuery}
                            onChange={(e) => {
                              handleMapsSearch(e.target.value);
                              setManualOrderCustomer((prev) => ({ ...prev, address: e.target.value }));
                            }}
                            onFocus={() => {
                              if (mapsSearchQuery.length >= 2) setShowMapsDropdown(true);
                            }}
                            className="w-full text-xs font-semibold text-slate-900 placeholder:text-slate-400 bg-transparent focus:outline-none"
                          />
                          {isSearchingMaps && (
                            <div className="w-3.5 h-3.5 border-2 border-[#0E8388] border-t-transparent rounded-full animate-spin shrink-0"></div>
                          )}
                          {mapsSearchQuery && !isSearchingMaps && (
                            <button
                              type="button"
                              onClick={() => {
                                setMapsSearchQuery('');
                                setMapsSearchResults([]);
                                setShowMapsDropdown(false);
                                setManualOrderCustomer((prev) => ({ ...prev, address: '' }));
                              }}
                              className="p-1 text-slate-400 hover:text-slate-600 rounded-full cursor-pointer"
                              title="Limpiar"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>

                        {/* Dropdown de resultados de Google Maps */}
                        {showMapsDropdown && mapsSearchResults.length > 0 && (
                          <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-slate-200/90 rounded-2xl shadow-xl overflow-hidden z-30 divide-y divide-slate-100 max-h-56 overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-150">
                            <div className="px-3 py-1.5 bg-slate-50 flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                              <span>Direcciones en Google Maps</span>
                              <span className="text-[#0E8388] font-bold">Dirección Exacta</span>
                            </div>
                            {mapsSearchResults.map((res, idx) => (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => handleSelectMapsAddress(res)}
                                className="w-full text-left px-3.5 py-2.5 hover:bg-slate-50 transition-colors flex items-start gap-2.5 cursor-pointer group"
                              >
                                <div className="w-6 h-6 rounded-lg bg-rose-50 text-rose-500 flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-110 transition-transform">
                                  <MapPin className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-bold text-slate-900 truncate group-hover:text-[#0E8388] transition-colors">
                                    {res.address}
                                  </p>
                                  <p className="text-[11px] text-slate-500 font-medium truncate">
                                    {res.city}, {res.region || 'Región de Los Lagos'}
                                  </p>
                                </div>
                                <span className="text-[10px] font-bold text-[#0E8388] bg-[#0E8388]/10 px-2 py-0.5 rounded-full shrink-0">
                                  Fijar
                                </span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Tarjeta de dirección exacta fijada desde Maps */}
                      {(manualOrderCustomer.address || selectedFromMaps) && (
                        <div className="p-3.5 rounded-2xl bg-emerald-50/90 border border-emerald-200/90 text-emerald-900 flex items-center justify-between gap-3 text-xs animate-in fade-in shadow-2xs">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-7 h-7 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                              <MapPin className="w-3.5 h-3.5" />
                            </div>
                            <div className="min-w-0">
                              <p className="font-extrabold text-slate-900 truncate text-xs">
                                {manualOrderCustomer.address}
                              </p>
                              <p className="text-[11px] text-emerald-700 font-semibold truncate">
                                {manualOrderCustomer.city || 'Puerto Varas'}, Región de Los Lagos
                              </p>
                            </div>
                          </div>
                          <a
                            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                              (manualOrderCustomer.address || '') + ', ' + (manualOrderCustomer.city || 'Puerto Varas')
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[10px] font-black text-[#0E8388] hover:text-[#0A3E40] bg-white px-2.5 py-1.5 rounded-xl border border-emerald-200 flex items-center gap-1 shrink-0 shadow-2xs hover:shadow-xs transition-all"
                          >
                            <span>Abrir Maps</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      )}
                    </div>

                    {/* Tipo de Pago, Estado Inicial & Resumen Financiero */}
                    {/* Selector de Tipo de Pago Conectado a Pedidos */}
                    <div>
                      <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider px-1 mb-1.5">
                        Tipo de Pago
                      </span>
                      <div className="bg-white rounded-2xl border border-slate-200/80 p-1.5 shadow-xs grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                        {[
                          { id: 'Web', label: 'Web', icon: Globe },
                          { id: 'Tarjeta', label: 'Tarjeta', icon: CreditCard },
                          { id: 'Efectivo', label: 'Efectivo', icon: Banknote },
                          { id: 'Transferencia', label: 'Transferencia', icon: Landmark },
                        ].map((pm) => {
                          const isSelected = (manualOrderCustomer.paymentMethod || 'Transferencia') === pm.id;
                          const Icon = pm.icon;
                          return (
                            <button
                              key={pm.id}
                              type="button"
                              onClick={() => setManualOrderCustomer({ ...manualOrderCustomer, paymentMethod: pm.id })}
                              className={`py-2 px-1 rounded-xl text-[11px] font-extrabold transition-all text-center border cursor-pointer flex items-center justify-center gap-1.5 ${
                                isSelected
                                  ? 'bg-[#0E8388] border-[#0E8388] text-white shadow-xs'
                                  : 'bg-slate-50 border-slate-200/60 text-slate-600 hover:bg-slate-100'
                              }`}
                            >
                              <Icon className="w-3.5 h-3.5 shrink-0" />
                              <span>{pm.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
                      {/* Estado */}
                      <div>
                        <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider px-1 mb-1.5">
                          Estado Inicial
                        </span>
                        <div className="bg-white rounded-2xl border border-slate-200/80 p-2 shadow-xs grid grid-cols-3 gap-1.5">
                          <button
                            type="button"
                            onClick={() => setManualOrderCustomer({ ...manualOrderCustomer, status: 'en_preparacion' })}
                            className={`py-2 px-1 rounded-xl text-[11px] font-bold transition-all text-center border cursor-pointer ${
                              manualOrderCustomer.status === 'en_preparacion'
                                ? 'bg-amber-400/90 border-amber-500 text-slate-950 shadow-xs'
                                : 'bg-slate-50 border-slate-200/60 text-slate-600 hover:bg-slate-100'
                            }`}
                          >
                            En Prep. ⏳
                          </button>
                          <button
                            type="button"
                            onClick={() => setManualOrderCustomer({ ...manualOrderCustomer, status: 'en_camino' })}
                            className={`py-2 px-1 rounded-xl text-[11px] font-bold transition-all text-center border cursor-pointer ${
                              manualOrderCustomer.status === 'en_camino'
                                ? 'bg-blue-600 border-blue-700 text-white shadow-xs'
                                : 'bg-slate-50 border-slate-200/60 text-slate-600 hover:bg-slate-100'
                            }`}
                          >
                            En Camino 🚚
                          </button>
                          <button
                            type="button"
                            onClick={() => setManualOrderCustomer({ ...manualOrderCustomer, status: 'entregado' })}
                            className={`py-2 px-1 rounded-xl text-[11px] font-bold transition-all text-center border cursor-pointer ${
                              manualOrderCustomer.status === 'entregado'
                                ? 'bg-emerald-600 border-emerald-700 text-white shadow-xs'
                                : 'bg-slate-50 border-slate-200/60 text-slate-600 hover:bg-slate-100'
                            }`}
                          >
                            Entregado ✓
                          </button>
                        </div>
                      </div>

                      {/* Resumen Financiero */}
                      <div>
                        <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider px-1 mb-1.5">
                          Resumen Total
                        </span>
                        <div className="bg-white rounded-2xl border border-slate-200/80 p-3.5 shadow-xs space-y-1.5 text-xs">
                          <div className="flex justify-between text-slate-500">
                            <span>Subtotal:</span>
                            <span className="font-mono text-slate-900 font-bold">{formatCLP(subtotal)}</span>
                          </div>
                          <div className="flex justify-between text-slate-500">
                            <span>Despacho:</span>
                            <span className="font-mono font-bold text-emerald-700">
                              {shipping === 0 ? 'GRATIS' : formatCLP(shipping)}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm font-black text-slate-900 pt-2 border-t border-slate-100">
                            <span>Total a Pagar:</span>
                            <span className="text-[#0E8388] text-base font-mono">{formatCLP(total)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Apple Sheet Action Bar / Footer */}
              <div className="px-6 py-4 bg-white/80 backdrop-blur-md border-t border-slate-200/70 flex items-center justify-between">
                <div>
                  {manualOrderStep === 1 ? (
                    <button
                      type="button"
                      onClick={handleCloseModal}
                      className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-100 transition-colors cursor-pointer"
                    >
                      Cancelar
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={goToPrevStep}
                      className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-100 transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span>Atrás</span>
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  {manualOrderStep === 2 && manualOrderItems.length > 0 && (
                    <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-700 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200/80">
                      <ShoppingBag className="w-3.5 h-3.5 text-[#0E8388]" />
                      <span>
                        <strong>{manualOrderItems.length}</strong> {manualOrderItems.length === 1 ? 'producto' : 'productos'}:
                      </span>
                      <strong className="text-slate-900 font-mono">{formatCLP(subtotal)}</strong>
                    </div>
                  )}

                  {manualOrderStep < 3 ? (
                    <button
                      type="button"
                      onClick={goToNextStep}
                      className="px-5 py-2.5 rounded-xl bg-[#0E8388] hover:bg-[#0c7276] text-white text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-sm hover:shadow active:scale-95"
                    >
                      <span>Continuar</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleSaveManualOrder}
                      className="px-6 py-2.5 rounded-xl bg-[#0E8388] hover:bg-[#0c7276] text-white text-xs font-black transition-all flex items-center gap-2 cursor-pointer shadow-sm hover:shadow active:scale-95"
                    >
                      <Check className="w-4 h-4 stroke-[3]" />
                      <span>Confirmar Pedido ✓</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ========================================================================= */}
      {/* MODAL 2: FICHA CLINICA / CRM CLIENTE (Light Design)                      */}
      {/* ========================================================================= */}
      {selectedCustomerModal && (
        <div
          onClick={() => setSelectedCustomerModal(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm animate-in fade-in duration-200"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white border border-slate-200 rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto no-scrollbar text-slate-900"
          >
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#0E8388] to-[#10B981] text-white font-black text-xl flex items-center justify-center shadow-xs">
                  {selectedCustomerModal.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900">{selectedCustomerModal.name}</h3>
                  <p className="text-xs text-slate-500">
                    Cliente desde {selectedCustomerModal.registrationDate} • {selectedCustomerModal.city}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedCustomerModal(null)}
                className="p-2 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* SUBPESTAÑAS CON FORMA DE CÁPSULAS (PILLS) */}
            {(() => {
              const modalPets = (selectedCustomerModal.pets && selectedCustomerModal.pets.length > 0)
                ? selectedCustomerModal.pets
                : (selectedCustomerModal.pet ? [selectedCustomerModal.pet] : []);

              const getPetBirthdayDetails = (birthdateStr) => {
                if (!birthdateStr) {
                  return { formatted: 'No registrada', shortDate: 'Sin fecha', fullDate: 'Sin fecha', isCurrentMonth: false, monthName: '' };
                }
                const parts = birthdateStr.split('-');
                if (parts.length < 3) {
                  return { formatted: birthdateStr, shortDate: birthdateStr, fullDate: birthdateStr, isCurrentMonth: false, monthName: '' };
                }
                const year = parseInt(parts[0], 10);
                const month = parseInt(parts[1], 10) - 1;
                const day = parseInt(parts[2], 10);
                const now = new Date();
                const isCurrentMonth = month === now.getMonth();
                const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
                const fullMonths = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
                return {
                  formatted: `${day} de ${fullMonths[month]} (${year})`,
                  shortDate: `${day} de ${months[month]}`,
                  fullDate: `${day} de ${fullMonths[month]}`,
                  isCurrentMonth,
                  day,
                  monthName: fullMonths[month],
                  year,
                };
              };

              // Determine which pets to render
              const petsToDisplay = customerModalSubTab === 'client'
                ? []
                : typeof customerModalSubTab === 'number'
                ? [modalPets[customerModalSubTab] || modalPets[0]]
                : [modalPets[0]];

              const customerOrders = orders.filter(
                (o) => o.customer?.toLowerCase() === selectedCustomerModal.name?.toLowerCase() ||
                       o.email?.toLowerCase() === selectedCustomerModal.email?.toLowerCase()
              );

              return (
                <div className="space-y-5">
                  {/* Capsule Tabs Selector */}
                  <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-slate-100 scrollbar-none">
                    {/* Pet Capsule Tabs */}
                    {modalPets.map((pet, pIdx) => {
                      const isDog = pet.type?.toLowerCase().includes('perro') || pet.type?.includes('🐶');
                      const isSelected = customerModalSubTab === pIdx;
                      return (
                        <button
                          key={pIdx}
                          type="button"
                          onClick={() => setCustomerModalSubTab(pIdx)}
                          className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-black transition-all cursor-pointer whitespace-nowrap shadow-xs ${
                            isSelected
                              ? 'bg-gradient-to-r from-[#0E8388] to-[#10B981] text-white shadow-[#0E8388]/30 scale-[1.02]'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80 hover:text-slate-900 border border-slate-200/60'
                          }`}
                        >
                          <span className="text-sm">{isDog ? '🐶' : '🐱'}</span>
                          <span>{pet.name}</span>
                        </button>
                      );
                    })}

                    {/* Capsule Tab: Información del Cliente */}
                    <button
                      type="button"
                      onClick={() => setCustomerModalSubTab('client')}
                      className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-black transition-all cursor-pointer whitespace-nowrap shadow-xs ${
                        customerModalSubTab === 'client'
                          ? 'bg-gradient-to-r from-slate-900 to-slate-800 text-white shadow-slate-900/30 scale-[1.02]'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80 hover:text-slate-900 border border-slate-200/60'
                      }`}
                    >
                      <User className="w-3.5 h-3.5" />
                      <span>Información del Cliente</span>
                    </button>
                  </div>

                  {/* VISTA 1: CARDS DE MASCOTAS (INDIVIDUAL O TODAS) */}
                  {customerModalSubTab !== 'client' && petsToDisplay.length > 0 && (
                    <div className="space-y-5 animate-in fade-in duration-200">
                      {petsToDisplay.map((pet, displayIdx) => {
                        const isDog = pet.type?.toLowerCase().includes('perro') || pet.type?.includes('🐶');
                        const bday = getPetBirthdayDetails(pet.birthdate);
                        const days = pet.daysRemaining ?? 30;
                        const isUrgent = days < 10;
                        const isBirthday = bday.isCurrentMonth;

                        // Dynamic card color change based on alert priority
                        const cardColorClasses = isUrgent
                          ? 'bg-gradient-to-b from-rose-50/90 via-rose-50/40 to-white border-2 border-rose-400 ring-2 ring-rose-400/25 shadow-md shadow-rose-200/50'
                          : isBirthday
                          ? 'bg-gradient-to-b from-amber-50/90 via-purple-50/40 to-white border-2 border-amber-400 ring-2 ring-amber-400/30 shadow-md shadow-amber-200/50'
                          : 'bg-slate-50/80 border border-slate-200/80';

                        return (
                          <div key={displayIdx} className={`rounded-2xl p-5 space-y-4 transition-all ${cardColorClasses}`}>
                            {/* Barra de Progreso de Consumo / Nivel de Alimento */}
                            {(() => {
                              const totalBagDays = pet.bagDurationDays || 30;
                              const daysLeft = pet.daysRemaining ?? 30;
                              const percentRemaining = Math.max(0, Math.min(100, Math.round((daysLeft / totalBagDays) * 100)));
                              const isCritical = daysLeft <= 4;
                              const isUrgentLevel = daysLeft <= 7;
                              const isWarningLevel = daysLeft > 7 && daysLeft <= 14;

                              // Colores dinámicos según proximidad a agotarse
                              const barGradient = isCritical
                                ? 'bg-gradient-to-r from-red-700 via-red-600 to-rose-600 shadow-md shadow-red-600/40 animate-pulse'
                                : isUrgentLevel
                                ? 'bg-gradient-to-r from-red-600 to-rose-500 shadow-sm shadow-red-500/30'
                                : isWarningLevel
                                ? 'bg-gradient-to-r from-amber-500 to-orange-400'
                                : 'bg-gradient-to-r from-emerald-500 to-teal-400';

                              const containerBorderBg = isCritical
                                ? 'bg-red-50/90 border-2 border-red-400 shadow-xs'
                                : isUrgentLevel
                                ? 'bg-rose-50/80 border-2 border-rose-300 shadow-xs'
                                : isWarningLevel
                                ? 'bg-amber-50/60 border border-amber-200'
                                : 'bg-slate-50/90 border border-slate-200/80';

                              return (
                                <div className={`rounded-2xl p-4 space-y-2.5 transition-all ${containerBorderBg}`}>
                                  {/* Encabezado de la barra */}
                                  <div className="flex items-center gap-2">
                                    <span className="text-base">{isUrgentLevel ? '🚨' : '🥣'}</span>
                                    <div>
                                      <div className="text-xs font-black text-slate-900 leading-tight">
                                        Nivel de Alimento Restante
                                      </div>
                                      <div className="text-[11px] text-slate-500 font-medium">
                                        {pet.favoriteFood || 'Alimento Habitual'}
                                      </div>
                                    </div>
                                  </div>

                                  {/* Pista y barra de progreso */}
                                  <div className="w-full bg-slate-200/90 rounded-full h-3.5 overflow-hidden p-0.5 shadow-inner">
                                    <div
                                      className={`h-full rounded-full transition-all duration-700 ease-out ${barGradient}`}
                                      style={{ width: `${Math.max(percentRemaining, 5)}%` }}
                                      title={`Quedan ${daysLeft} días de ${totalBagDays} días (${percentRemaining}%)`}
                                    />
                                  </div>

                                  {/* Subtítulos de la barra */}
                                  <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 px-0.5">
                                    <span>Bolsa nueva: {totalBagDays} días</span>
                                    <span className={isCritical ? 'text-red-700 font-black animate-pulse' : isUrgentLevel ? 'text-rose-700 font-black' : 'text-slate-600'}>
                                      {isUrgentLevel ? `¡Reponer pronto! ~${daysLeft} días restantes` : `Autonomía estimada: ~${daysLeft} días restantes`}
                                    </span>
                                  </div>
                                </div>
                              );
                            })()}

                            {/* Alerta de Mes de Cumpleaños (Regalo Pendiente) */}
                            {isBirthday && (
                              <div className="flex items-center justify-between px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 via-purple-600 to-pink-500 text-white shadow-xs">
                                <div className="flex items-center gap-2">
                                  <span className="text-base">🎂</span>
                                  <span className="text-xs font-black">
                                    🎉 ¡MES DE CUMPLEAÑOS! ({bday.fullDate}) • ¡Hacerle un regalo especial! 🎁
                                  </span>
                                </div>
                                <span className="text-[10px] font-extrabold uppercase bg-white/20 px-2 py-0.5 rounded-md tracking-wider">
                                  Regalo Club Patitas
                                </span>
                              </div>
                            )}

                            {/* Pet Header */}
                            <div className="flex items-center justify-between pb-3 border-b border-slate-200/80 flex-wrap gap-3">
                              <div className="flex items-center gap-3">
                                <span className="text-3xl">{isDog ? '🐶' : '🐱'}</span>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <h4 className="text-lg font-black text-slate-900">{pet.name}</h4>
                                    {modalPets.length > 1 && (
                                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
                                        Mascota #{modalPets.findIndex((p) => p.name === pet.name) + 1}
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-xs text-slate-500 font-medium">{pet.breed} • {pet.age}</p>
                                </div>
                              </div>

                              {/* Peso y Esterilización */}
                              <div className="text-right">
                                <span className="text-xs font-black text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-md border border-emerald-200">
                                  Peso: {pet.weight}
                                </span>
                                <div className="text-[10px] text-slate-500 mt-0.5">Esterilizado: {pet.sterilized}</div>
                              </div>
                            </div>

                            {/* Información Esencial de la Mascota */}
                            {(() => {
                              const dewormingExt = pet.dewormingExternal || (pet.deworming?.toLowerCase().includes('al día') ? 'Sí (Nexgard Spectra)' : 'No registrado');
                              const dewormingInt = pet.dewormingInternal || (pet.deworming?.toLowerCase().includes('al día') ? 'Sí (Nexgard Spectra)' : 'No registrado');
                              const isExtBought = typeof dewormingExt === 'string' && (dewormingExt.toLowerCase().startsWith('sí') || dewormingExt.toLowerCase().startsWith('si'));
                              const isIntBought = typeof dewormingInt === 'string' && (dewormingInt.toLowerCase().startsWith('sí') || dewormingInt.toLowerCase().startsWith('si'));

                              const getCleanDewormerName = (str) => {
                                if (!str) return null;
                                const match = str.match(/\(([^)]+)\)/);
                                if (match) return match[1].trim();
                                if (/^(sí|si|no)\b/i.test(str)) {
                                  const rest = str.replace(/^(sí|si|no)\s*/i, '').trim();
                                  return rest || null;
                                }
                                return str.trim();
                              };

                              const extProdName = getCleanDewormerName(dewormingExt);
                              const intProdName = getCleanDewormerName(dewormingInt);

                              return (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                                  {/* 1. Alimento que consume */}
                                  <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-1.5 flex flex-col justify-between">
                                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
                                      <span className="text-sm">🥣</span>
                                      <span>Alimento que consume</span>
                                    </span>
                                    <div>
                                      <div className="text-sm font-black text-slate-900 leading-snug">
                                        {pet.favoriteFood}
                                      </div>
                                      <div className="text-[11px] text-slate-500 font-medium mt-0.5">
                                        Bolsa de {pet.bagDurationDays} días
                                      </div>
                                    </div>
                                  </div>

                                  {/* 2. Edad */}
                                  <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-1.5 flex flex-col justify-between">
                                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
                                      <span className="text-sm">🐾</span>
                                      <span>Edad</span>
                                    </span>
                                    <div>
                                      <div className="text-sm font-black text-slate-900 leading-snug">
                                        {pet.age}
                                      </div>
                                      <div className="text-[11px] text-slate-500 font-medium mt-0.5">
                                        Nacimiento: {bday.formatted}
                                      </div>
                                    </div>
                                  </div>

                                  {/* 3. Desparasitante Exterior */}
                                  <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-1.5 flex flex-col justify-between">
                                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
                                      <span className="text-sm">🛡️</span>
                                      <span>Desparasitante Exterior</span>
                                    </span>
                                    <div className="flex items-center justify-between gap-2">
                                      <span className="text-sm font-black text-slate-900 truncate">
                                        {extProdName || (isExtBought ? 'Comprado' : 'Sin registro')}
                                      </span>
                                      {isExtBought ? (
                                        <span className="inline-flex items-center gap-1 text-[11px] font-black px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 shrink-0">
                                          <Check className="w-3 h-3 stroke-[3]" />
                                          <span>Comprado</span>
                                        </span>
                                      ) : (
                                        <span className="inline-flex items-center gap-1 text-[11px] font-black px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 shrink-0">
                                          <span>No comprado</span>
                                        </span>
                                      )}
                                    </div>
                                    <div className="text-[11px] text-slate-400">
                                      Protección antipulgas y garrapatas
                                    </div>
                                  </div>

                                  {/* 4. Desparasitante Interior */}
                                  <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-1.5 flex flex-col justify-between">
                                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
                                      <span className="text-sm">💊</span>
                                      <span>Desparasitante Interior</span>
                                    </span>
                                    <div className="flex items-center justify-between gap-2">
                                      <span className="text-sm font-black text-slate-900 truncate">
                                        {intProdName || (isIntBought ? 'Comprado' : 'Sin registro')}
                                      </span>
                                      {isIntBought ? (
                                        <span className="inline-flex items-center gap-1 text-[11px] font-black px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 shrink-0">
                                          <Check className="w-3 h-3 stroke-[3]" />
                                          <span>Comprado</span>
                                        </span>
                                      ) : (
                                        <span className="inline-flex items-center gap-1 text-[11px] font-black px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 shrink-0">
                                          <span>No comprado</span>
                                        </span>
                                      )}
                                    </div>
                                    <div className="text-[11px] text-slate-400">
                                      Control parásitos internos
                                    </div>
                                  </div>
                                </div>
                              );
                            })()}

                            {/* Action Buttons for this Pet */}
                            <div className="flex items-center justify-between gap-3 pt-2 border-t border-slate-200/60 flex-wrap">
                              <div className="flex items-center gap-2">
                                {isBirthday && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      showToast(`🎁 ¡Regalo de cumpleaños asignado para ${pet.name}! Se enviará un snack patagónico de cortesía.`);
                                    }}
                                    className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-purple-600 hover:from-amber-600 hover:to-purple-700 text-white font-extrabold text-xs transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                                  >
                                    <span>🎁</span>
                                    <span>Asignar Regalo de Cumpleaños</span>
                                  </button>
                                )}

                                {isUrgent && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      showToast(`Generando pedido de reposición para ${pet.name} (${pet.favoriteFood})...`);
                                      setSelectedCustomerModal(null);
                                      setActiveTab('pedidos');
                                    }}
                                    className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer"
                                  >
                                    <ShoppingBag className="w-3.5 h-3.5" />
                                    <span>Crear Pedido Reposición</span>
                                  </button>
                                )}
                              </div>

                              <button
                                type="button"
                                onClick={() => {
                                  const topic = isBirthday
                                    ? `para desearle un feliz cumpleaños a ${pet.name} 🎂🎁`
                                    : isUrgent
                                    ? `para recordarle que a ${pet.name} le quedan ${days} días de alimento 🚨`
                                    : `sobre ${pet.name}`;
                                  showToast(`Iniciando contacto WhatsApp con ${selectedCustomerModal.name} ${topic}...`);
                                }}
                                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors flex items-center gap-2 cursor-pointer shadow-xs ml-auto"
                              >
                                <Phone className="w-3.5 h-3.5" />
                                <span>
                                  {isBirthday
                                    ? `Felicitar a ${pet.name} por WhatsApp 🎂`
                                    : isUrgent
                                    ? `Avisar Reposición WhatsApp 🚨`
                                    : `Contactar WhatsApp (${pet.name})`}
                                </span>
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* VISTA 2: INFORMACIÓN COMPLETA DEL CLIENTE */}
                  {customerModalSubTab === 'client' && (
                    <div className="space-y-4 animate-in fade-in duration-200 text-xs">
                      {/* Resumen de Fidelidad & Métricas */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="p-3.5 rounded-2xl bg-purple-50/80 border border-purple-200">
                          <span className="text-[10px] uppercase font-bold text-purple-600 block">Puntos Club Patitas</span>
                          <span className="text-lg font-black text-purple-900 flex items-center gap-1.5 mt-0.5">
                            <Sparkles className="w-4 h-4 text-purple-500" />
                            {selectedCustomerModal.points} pts
                          </span>
                          <span className="text-[10px] text-purple-700 font-medium">Equivalente a {formatCLP(selectedCustomerModal.points * 10)} en dscto.</span>
                        </div>

                        <div className="p-3.5 rounded-2xl bg-blue-50/80 border border-blue-200">
                          <span className="text-[10px] uppercase font-bold text-blue-600 block">Historial de Pedidos</span>
                          <span className="text-lg font-black text-blue-900 flex items-center gap-1.5 mt-0.5">
                            <ShoppingBag className="w-4 h-4 text-blue-500" />
                            {selectedCustomerModal.ordersCount} compras
                          </span>
                          <span className="text-[10px] text-blue-700 font-medium">Cliente habitual verificado</span>
                        </div>

                        <div className="p-3.5 rounded-2xl bg-emerald-50/80 border border-emerald-200">
                          <span className="text-[10px] uppercase font-bold text-emerald-600 block">Total Gastado</span>
                          <span className="text-lg font-black text-emerald-900 flex items-center gap-1.5 mt-0.5">
                            <DollarSign className="w-4 h-4 text-emerald-600" />
                            {formatCLP(selectedCustomerModal.totalSpent)}
                          </span>
                          <span className="text-[10px] text-emerald-700 font-medium">LTV histórico cliente</span>
                        </div>
                      </div>

                      {/* Datos de Contacto y Despacho */}
                      <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-200/80 space-y-3">
                        <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
                          <MapPin className="w-3.5 h-3.5 text-[#0E8388]" />
                          <span>Datos de Contacto y Envío</span>
                        </h4>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                          <div className="p-3 bg-white rounded-xl border border-slate-200/70 space-y-1">
                            <span className="text-slate-400 font-bold text-[10px] uppercase block">Correo Electrónico</span>
                            <div className="flex items-center gap-1.5 font-bold text-slate-900">
                              <Mail className="w-3.5 h-3.5 text-slate-400" />
                              <a href={`mailto:${selectedCustomerModal.email}`} className="hover:text-[#0E8388] transition-colors">
                                {selectedCustomerModal.email}
                              </a>
                            </div>
                          </div>

                          <div className="p-3 bg-white rounded-xl border border-slate-200/70 space-y-1">
                            <span className="text-slate-400 font-bold text-[10px] uppercase block">Teléfono de Contacto</span>
                            <div className="flex items-center gap-1.5 font-bold text-slate-900">
                              <Phone className="w-3.5 h-3.5 text-slate-400" />
                              <a href={`tel:${selectedCustomerModal.phone}`} className="hover:text-[#0E8388] transition-colors">
                                {selectedCustomerModal.phone}
                              </a>
                            </div>
                          </div>

                          <div className="p-3 bg-white rounded-xl border border-slate-200/70 space-y-1">
                            <span className="text-slate-400 font-bold text-[10px] uppercase block">Dirección de Entrega</span>
                            <div className="font-bold text-slate-900 flex items-start gap-1.5">
                              <MapPin className="w-3.5 h-3.5 text-[#0E8388] shrink-0 mt-0.5" />
                              <span>{selectedCustomerModal.address}</span>
                            </div>
                          </div>

                          <div className="p-3 bg-white rounded-xl border border-slate-200/70 space-y-1">
                            <span className="text-slate-400 font-bold text-[10px] uppercase block">Ciudad y Zona</span>
                            <div className="font-bold text-slate-900">
                              {selectedCustomerModal.city}, Región del Sur
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Mascotas registradas vinculadas */}
                      <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-200/80 space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
                            <span>🐾</span>
                            <span>Mascotas Asociadas ({modalPets.length})</span>
                          </h4>
                          <span className="text-[10px] text-slate-400 font-semibold">Haz clic en una mascota para ver su ficha</span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {modalPets.map((p, idx) => {
                            const isDog = p.type?.toLowerCase().includes('perro') || p.type?.includes('🐶');
                            return (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => setCustomerModalSubTab(idx)}
                                className="flex items-center justify-between p-3 rounded-xl bg-white border border-slate-200 hover:border-[#0E8388] hover:bg-slate-50 transition-all text-left cursor-pointer group"
                              >
                                <div className="flex items-center gap-2.5">
                                  <span className="text-xl">{isDog ? '🐶' : '🐱'}</span>
                                  <div>
                                    <div className="font-bold text-slate-900 group-hover:text-[#0E8388] transition-colors">
                                      {p.name}
                                    </div>
                                    <div className="text-[11px] text-slate-500 font-normal">
                                      {p.breed} • {p.weight}
                                    </div>
                                  </div>
                                </div>
                                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#0E8388] group-hover:translate-x-0.5 transition-all" />
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Pedidos Recientes en el Sistema */}
                      {customerOrders.length > 0 && (
                        <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-200/80 space-y-2.5">
                          <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
                            <ShoppingBag className="w-3.5 h-3.5 text-[#0E8388]" />
                            <span>Últimos Pedidos Registrados ({customerOrders.length})</span>
                          </h4>
                          <div className="space-y-1.5">
                            {customerOrders.slice(0, 3).map((ord) => (
                              <div key={ord.id} className="p-2.5 rounded-xl bg-white border border-slate-200 flex items-center justify-between text-xs">
                                <div>
                                  <div className="font-bold text-slate-900 flex items-center gap-2">
                                    <span>{ord.id}</span>
                                    <span className="text-[10px] text-slate-400 font-normal">{ord.date} {ord.time}</span>
                                  </div>
                                  <div className="text-[11px] text-slate-500 truncate max-w-xs">
                                    {ord.items?.map((it) => it.name).join(', ')}
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="font-mono font-bold text-slate-900">{formatCLP(ord.total)}</div>
                                  <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md">
                                    {ord.status === 'en_camino' ? 'En Camino 🚚' : ord.status === 'entregado' ? 'Entregado ✓' : 'En Prep.'}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Quick Contact buttons for Customer */}
                      <div className="flex items-center justify-end gap-3 pt-2">
                        <button
                          onClick={() => showToast(`Iniciando contacto WhatsApp con ${selectedCustomerModal.name}...`)}
                          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors flex items-center gap-2 cursor-pointer shadow-xs"
                        >
                          <Phone className="w-3.5 h-3.5" />
                          <span>Contactar por WhatsApp</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: CREAR CONVENIO NUEVO (Light Design)                             */}
      {/* ========================================================================= */}
      {isAddAgreementModalOpen && (
        <div
          onClick={() => setIsAddAgreementModalOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm animate-in fade-in duration-200"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto no-scrollbar text-slate-900"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-xl font-black text-slate-900">Nuevo Convenio Institucional 🤝</h3>
              <button
                onClick={() => setIsAddAgreementModalOpen(false)}
                className="p-2 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveConvenio} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-bold uppercase mb-1">Nombre de la Entidad</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Sweet Dog"
                  value={newAgreement.name}
                  onChange={(e) => {
                    const name = e.target.value;
                    const autoPrefix = name.length >= 3 ? `${name.replace(/\s+/g, '').slice(0, 3).toUpperCase()}-` : 'SWD-';
                    setNewAgreement((prev) => ({
                      ...prev,
                      name,
                      codePrefix: prev.codePrefix === 'SWD-' || !prev.codePrefix ? autoPrefix : prev.codePrefix,
                    }));
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:bg-white focus:border-[#0E8388]"
                />
              </div>

              {/* Selector de Modalidad de Descuento */}
              <div>
                <label className="block text-slate-700 font-bold uppercase mb-1.5">Modalidad de Cupón / Descuento</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setNewAgreement({ ...newAgreement, discountType: 'single_use' })}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                      newAgreement.discountType === 'single_use'
                        ? 'border-[#0E8388] bg-[#0E8388]/10 text-slate-900 shadow-xs ring-1 ring-[#0E8388]'
                        : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-bold text-xs">
                      <Ticket className="w-3.5 h-3.5 text-[#0E8388]" />
                      <span>Cupones Únicos</span>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1 leading-tight">
                      1 solo uso por cliente. Se generan códigos individuales tipo SWD-7K9P.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setNewAgreement({ ...newAgreement, discountType: 'fixed' })}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                      newAgreement.discountType === 'fixed'
                        ? 'border-[#0E8388] bg-[#0E8388]/10 text-slate-900 shadow-xs ring-1 ring-[#0E8388]'
                        : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-bold text-xs">
                      <Percent className="w-3.5 h-3.5 text-[#0E8388]" />
                      <span>Código Fijo</span>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1 leading-tight">
                      Un mismo código reutilizable para todos (ej: SWEETDOG10).
                    </p>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <CustomDropdown
                    label="Tipo de Aliado"
                    labelClassName="block text-slate-700 font-bold uppercase text-[11px] mb-1"
                    buttonClassName="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold hover:bg-white text-xs"
                    value={newAgreement.type}
                    options={ALLY_TYPE_OPTIONS}
                    onChange={(val) => setNewAgreement({ ...newAgreement, type: val })}
                  />
                </div>

                {newAgreement.discountType === 'single_use' ? (
                  <div>
                    <label className="block text-slate-700 font-bold uppercase mb-1">Prefijo de Códigos</label>
                    <input
                      type="text"
                      required
                      placeholder="SWD-"
                      value={newAgreement.codePrefix || 'SWD-'}
                      onChange={(e) => setNewAgreement({ ...newAgreement, codePrefix: e.target.value.toUpperCase() })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-[#0E8388] font-mono font-bold focus:outline-none focus:bg-white focus:border-[#0E8388]"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block text-slate-700 font-bold uppercase mb-1">Código Promocional</label>
                    <input
                      type="text"
                      required
                      placeholder="Ej: CONV-SWEETDOG"
                      value={newAgreement.code}
                      onChange={(e) => setNewAgreement({ ...newAgreement, code: e.target.value.toUpperCase() })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-[#0E8388] font-mono font-bold focus:outline-none focus:bg-white focus:border-[#0E8388]"
                    />
                  </div>
                )}
              </div>

              {newAgreement.discountType === 'single_use' && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 font-bold uppercase mb-1">% de Descuento</label>
                    <div className="relative">
                      <input
                        type="number"
                        min="1"
                        max="100"
                        required
                        value={newAgreement.discountPercent || 10}
                        onChange={(e) => setNewAgreement({ ...newAgreement, discountPercent: Number(e.target.value) })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold focus:outline-none focus:bg-white focus:border-[#0E8388]"
                      />
                      <span className="absolute right-3 top-2.5 font-bold text-slate-400">%</span>
                    </div>
                  </div>
                  <div>
                    <CustomDropdown
                      label="Cupones a emitir ahora"
                      labelClassName="block text-slate-700 font-bold uppercase text-[11px] mb-1"
                      buttonClassName="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold hover:bg-white text-xs"
                      value={newAgreement.initialCouponsCount || 10}
                      options={INITIAL_COUPON_OPTIONS}
                      onChange={(val) => setNewAgreement({ ...newAgreement, initialCouponsCount: Number(val) })}
                    />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold uppercase mb-1">Contacto / Encargado</label>
                  <input
                    type="text"
                    placeholder="Yessica Vargas"
                    value={newAgreement.contactPerson}
                    onChange={(e) => setNewAgreement({ ...newAgreement, contactPerson: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:bg-white focus:border-[#0E8388]"
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-slate-700 font-bold uppercase text-[11px]">Teléfono</label>
                    <span
                      className={`text-[10px] font-bold ${
                        (newAgreement.phone || '').replace(/\D/g, '').length === 9
                          ? 'text-emerald-600'
                          : (newAgreement.phone || '').replace(/\D/g, '').length > 0
                          ? 'text-rose-500'
                          : 'text-slate-400'
                      }`}
                    >
                      {(newAgreement.phone || '').replace(/\D/g, '').length}/9 dígitos
                    </span>
                  </div>

                  <div
                    className={`flex items-center rounded-xl bg-slate-50 border transition-all ${
                      (newAgreement.phone || '').replace(/\D/g, '').length < 9 &&
                      (newAgreement.phone || '').length > 0
                        ? 'border-rose-400 ring-2 ring-rose-200/50 bg-rose-50/20'
                        : 'border-slate-200 focus-within:border-[#0E8388] focus-within:ring-2 focus-within:ring-[#0E8388]/15 focus-within:bg-white'
                    }`}
                  >
                    {/* Prefijo Fijo +56 */}
                    <div className="px-3 py-2.5 bg-slate-100/90 border-r border-slate-200 text-slate-700 font-black text-xs rounded-l-xl select-none flex items-center gap-1 shrink-0">
                      <span>🇨🇱</span>
                      <span>+56</span>
                    </div>

                    <input
                      type="tel"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={9}
                      placeholder="912345678"
                      value={newAgreement.phone}
                      onChange={(e) => {
                        const onlyDigits = e.target.value.replace(/\D/g, '').slice(0, 9);
                        setNewAgreement({ ...newAgreement, phone: onlyDigits });
                      }}
                      className="w-full px-3 py-2.5 bg-transparent text-slate-900 text-xs font-mono font-bold focus:outline-none placeholder:text-slate-400"
                    />
                  </div>

                  {/* Mensaje de error en rojo si faltan números */}
                  {(newAgreement.phone || '').replace(/\D/g, '').length < 9 && (
                    <p className="text-rose-600 text-[11px] font-bold mt-1 animate-in fade-in flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>
                        Faltan números: debes ingresar exactamente 9 dígitos (
                        {9 - (newAgreement.phone || '').replace(/\D/g, '').length} restantes)
                      </span>
                    </p>
                  )}
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddAgreementModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 font-bold transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#0E8388] to-[#10B981] text-white font-bold shadow-md shadow-[#0E8388]/20 transition-all cursor-pointer"
                >
                  Guardar Convenio
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL GESTIÓN DE CUPONES DE CONVENIO (Sweet Dog, etc.)                   */}
      {/* ========================================================================= */}
      {selectedConvenioForCoupons && (
        <div
          onClick={() => setSelectedConvenioForCoupons(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-sm animate-in fade-in duration-200"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white border border-slate-200 rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl max-h-[90vh] flex flex-col text-slate-900"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#0E8388]/10 text-[#0E8388] flex items-center justify-center text-2xl font-black shrink-0">
                  ✂️
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-black text-slate-900">{selectedConvenioForCoupons.name}</h3>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-100 text-emerald-800">
                      {selectedConvenioForCoupons.discountPercent || 10}% DCTO
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-medium">
                    Gestión de cupones de 1 solo uso • Contacto: {selectedConvenioForCoupons.contactPerson || 'Encargado'} ({selectedConvenioForCoupons.phone || 'Sin fono'})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedConvenioForCoupons(null)}
                className="p-2 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 text-center">
                <span className="text-[10px] uppercase font-bold text-slate-400">Total Generados</span>
                <div className="text-xl font-black text-slate-900 mt-0.5">
                  {selectedConvenioForCoupons.coupons?.length || 0}
                </div>
              </div>
              <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-100 text-center">
                <span className="text-[10px] uppercase font-bold text-emerald-700">Disponibles</span>
                <div className="text-xl font-black text-emerald-800 mt-0.5">
                  {(selectedConvenioForCoupons.coupons || []).filter((c) => c.status === 'disponible').length}
                </div>
              </div>
              <div className="p-3 rounded-2xl bg-purple-50 border border-purple-100 text-center">
                <span className="text-[10px] uppercase font-bold text-purple-700">Canjeados</span>
                <div className="text-xl font-black text-purple-800 mt-0.5">
                  {(selectedConvenioForCoupons.coupons || []).filter((c) => c.status === 'canjeado').length}
                </div>
              </div>
            </div>

            {/* Quick Action Toolbar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-slate-500 font-bold">Generar más:</span>
                <button
                  type="button"
                  onClick={() => handleGenerateMoreCoupons(selectedConvenioForCoupons.id, 5)}
                  className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-800 font-bold border border-slate-200 transition-all cursor-pointer"
                >
                  +5
                </button>
                <button
                  type="button"
                  onClick={() => handleGenerateMoreCoupons(selectedConvenioForCoupons.id, 10)}
                  className="px-3 py-1.5 rounded-xl bg-[#0E8388] text-white font-bold hover:opacity-90 transition-all cursor-pointer shadow-xs"
                >
                  +10 Cupones
                </button>
                <button
                  type="button"
                  onClick={() => handleGenerateMoreCoupons(selectedConvenioForCoupons.id, 25)}
                  className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-800 font-bold border border-slate-200 transition-all cursor-pointer"
                >
                  +25
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleShareCouponsWhatsApp(selectedConvenioForCoupons)}
                  className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Enviar por WhatsApp</span>
                </button>
              </div>
            </div>

            {/* Filter buttons */}
            <div className="flex items-center gap-2 border-b border-slate-100 pb-2 text-xs">
              <button
                type="button"
                onClick={() => setCouponFilterStatus('todos')}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                  couponFilterStatus === 'todos' ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-slate-100'
                }`}
              >
                Todos ({selectedConvenioForCoupons.coupons?.length || 0})
              </button>
              <button
                type="button"
                onClick={() => setCouponFilterStatus('disponible')}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                  couponFilterStatus === 'disponible' ? 'bg-emerald-600 text-white' : 'text-slate-500 hover:bg-slate-100'
                }`}
              >
                Disponibles ({(selectedConvenioForCoupons.coupons || []).filter((c) => c.status === 'disponible').length})
              </button>
              <button
                type="button"
                onClick={() => setCouponFilterStatus('canjeado')}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                  couponFilterStatus === 'canjeado' ? 'bg-purple-600 text-white' : 'text-slate-500 hover:bg-slate-100'
                }`}
              >
                Canjeados ({(selectedConvenioForCoupons.coupons || []).filter((c) => c.status === 'canjeado').length})
              </button>
            </div>

            {/* Coupons list table / grid */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1 max-h-[360px]">
              {(!selectedConvenioForCoupons.coupons || selectedConvenioForCoupons.coupons.length === 0) ? (
                <div className="p-8 text-center text-slate-400">
                  <Ticket className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  <p className="font-semibold text-xs">No hay cupones emitidos todavía</p>
                  <p className="text-[11px] text-slate-400 mt-1">Haz clic en '+10 Cupones' para generar el primer lote.</p>
                </div>
              ) : (
                (selectedConvenioForCoupons.coupons || [])
                  .filter((c) => couponFilterStatus === 'todos' || c.status === couponFilterStatus)
                  .map((coupon, idx) => (
                    <div
                      key={coupon.code || idx}
                      className="p-3 rounded-2xl border border-slate-200/80 bg-slate-50/60 flex items-center justify-between gap-3 text-xs hover:bg-white transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center font-bold text-slate-500 text-[11px]">
                          {idx + 1}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-black text-sm tracking-wider text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                              {coupon.code}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                                coupon.status === 'disponible'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-slate-200 text-slate-600'
                              }`}
                            >
                              {coupon.status === 'disponible' ? '✓ Disponible' : 'Canjeado'}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            {coupon.status === 'disponible'
                              ? `Generado el ${coupon.createdAt || 'Hoy'}`
                              : `Canjeado el ${coupon.usedAt || 'Reciente'} en pedido ${coupon.orderId || 'WEB'}`}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleCopyCouponCode(coupon.code)}
                          className="px-2.5 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 font-bold border border-slate-200 flex items-center gap-1 transition-all cursor-pointer"
                          title="Copiar código"
                        >
                          <Copy className="w-3.5 h-3.5 text-[#0E8388]" />
                          <span className="text-[11px]">Copiar</span>
                        </button>
                        {coupon.status === 'disponible' && (
                          <button
                            type="button"
                            onClick={() => handleDeleteCoupon(selectedConvenioForCoupons.id, coupon.code)}
                            className="p-1.5 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                            title="Eliminar este cupón"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL AJUSTE MANUAL DE STOCK FÍSICO (Bodega)                             */}
      {/* ========================================================================= */}
      {stockAdjustModal && (
        <div
          onClick={() => setStockAdjustModal(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm animate-in fade-in duration-200"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl text-slate-900 no-scrollbar"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#0E8388]/10 text-[#0E8388] flex items-center justify-center font-bold">
                  <Package className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">Ajuste de Stock Físico 📦</h3>
                  <p className="text-[11px] text-slate-500 font-medium">Control de existencias en bodega</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setStockAdjustModal(null)}
                className="p-1.5 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Selector de producto */}
            <div>
              <label className="block text-slate-700 font-bold uppercase text-[11px] mb-1">Producto</label>
              <select
                value={stockAdjustModal.prod.id}
                onChange={(e) => {
                  const p = inventory.find((it) => it.id === e.target.value);
                  if (p) setStockAdjustModal({ ...stockAdjustModal, prod: p });
                }}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-bold focus:outline-none focus:bg-white focus:border-[#0E8388]"
              >
                {inventory.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.format}) — Stock: {p.stock} u.
                  </option>
                ))}
              </select>
            </div>

            {/* Tipo de Ajuste */}
            <div>
              <label className="block text-slate-700 font-bold uppercase text-[11px] mb-1.5">Tipo de Movimiento</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setStockAdjustModal({ ...stockAdjustModal, type: 'sumar' })}
                  className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all cursor-pointer flex flex-col items-center gap-1 ${
                    stockAdjustModal.type === 'sumar'
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-800 ring-1 ring-emerald-500'
                      : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Plus className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-[11px]">Entrada</span>
                </button>
                <button
                  type="button"
                  onClick={() => setStockAdjustModal({ ...stockAdjustModal, type: 'restar' })}
                  className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all cursor-pointer flex flex-col items-center gap-1 ${
                    stockAdjustModal.type === 'restar'
                      ? 'border-rose-500 bg-rose-50 text-rose-800 ring-1 ring-rose-500'
                      : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Minus className="w-3.5 h-3.5 text-rose-600" />
                  <span className="text-[11px]">Merma / Salida</span>
                </button>
                <button
                  type="button"
                  onClick={() => setStockAdjustModal({ ...stockAdjustModal, type: 'conteo', amount: stockAdjustModal.prod.stock })}
                  className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all cursor-pointer flex flex-col items-center gap-1 ${
                    stockAdjustModal.type === 'conteo'
                      ? 'border-[#0E8388] bg-[#0E8388]/10 text-[#0E8388] ring-1 ring-[#0E8388]'
                      : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <RefreshCw className="w-3.5 h-3.5 text-[#0E8388]" />
                  <span className="text-[11px]">Conteo Físico</span>
                </button>
              </div>
            </div>

            {/* Cantidad y Preview de Resultado */}
            <form onSubmit={handleApplyStockAdjustment} className="space-y-4">
              <div className="grid grid-cols-2 gap-3 items-center">
                <div>
                  <label className="block text-slate-700 font-bold uppercase text-[11px] mb-1">
                    {stockAdjustModal.type === 'conteo' ? 'Nuevo Total en Bodega' : 'Cantidad (unidades)'}
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={stockAdjustModal.amount}
                    onChange={(e) =>
                      setStockAdjustModal({
                        ...stockAdjustModal,
                        amount: Math.max(0, parseInt(e.target.value, 10) || 0),
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-mono font-bold text-sm focus:outline-none focus:bg-white focus:border-[#0E8388]"
                  />
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-center">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Stock Resultante</span>
                  <span className="text-base font-black text-slate-900">
                    {stockAdjustModal.type === 'sumar'
                      ? stockAdjustModal.prod.stock + (parseInt(stockAdjustModal.amount, 10) || 0)
                      : stockAdjustModal.type === 'restar'
                      ? Math.max(0, stockAdjustModal.prod.stock - (parseInt(stockAdjustModal.amount, 10) || 0))
                      : parseInt(stockAdjustModal.amount, 10) || 0}{' '}
                    u.
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold uppercase text-[11px] mb-1">Motivo / Glosa</label>
                <input
                  type="text"
                  placeholder="Ej: Conteo físico quincenal, daño de envase, muestra..."
                  value={stockAdjustModal.reason}
                  onChange={(e) => setStockAdjustModal({ ...stockAdjustModal, reason: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:bg-white focus:border-[#0E8388]"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setStockAdjustModal(null)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 font-bold text-xs transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#0E8388] to-[#10B981] text-white font-bold text-xs shadow-md shadow-[#0E8388]/20 hover:opacity-95 transition-all cursor-pointer"
                >
                  Confirmar Ajuste
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: INGRESAR FACTURA & STOCK (Light Design)                         */}
      {/* ========================================================================= */}
      {isAddInvoiceModalOpen && (() => {
        const selectedInvProd = inventory.find((p) => p.id === newInvoiceForm.selectedProductId);
        const modalQty = parseInt(newInvoiceForm.quantityReceived, 10) || 0;
        const modalUnitCost = parseInt(newInvoiceForm.unitCostNeto, 10) || 0;
        const modalSubtotalNeto = modalQty * modalUnitCost;
        const modalIvaCredito = Math.round(modalSubtotalNeto * 0.19);
        const modalTotalBruto = modalSubtotalNeto + modalIvaCredito;

        return (
          <div
            onClick={() => setIsAddInvoiceModalOpen(false)}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm animate-in fade-in duration-200"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="bg-white border border-slate-200 rounded-3xl max-w-xl w-full p-6 sm:p-7 space-y-5 shadow-2xl max-h-[92vh] overflow-y-auto no-scrollbar text-slate-900"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-[#0E8388]/10 text-[#0E8388] flex items-center justify-center text-xl font-black shadow-xs">
                    📦
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-900">Ingreso de Factura & Stock</h3>
                    <p className="text-xs text-slate-500 font-medium">
                      Asocia la factura al inventario: aumentará el stock físico y sumará IVA Crédito Fiscal
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAddInvoiceModalOpen(false)}
                  className="p-2 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveInvoice} className="space-y-4 text-xs">
                {/* Datos de la Factura */}
                <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-3">
                  <span className="text-[11px] font-black uppercase text-slate-700 tracking-wider block">
                    1. Identificación del Documento Tributario
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-slate-700 font-bold uppercase text-[10px] mb-1">N° Factura Compra</label>
                      <input
                        type="text"
                        required
                        placeholder="FAC-2026-9042"
                        value={newInvoiceForm.invoiceNumber}
                        onChange={(e) =>
                          setNewInvoiceForm({ ...newInvoiceForm, invoiceNumber: e.target.value.toUpperCase() })
                        }
                        className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-[#0E8388] font-mono font-bold focus:outline-none focus:border-[#0E8388]"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-bold uppercase text-[10px] mb-1">Fecha Emisión</label>
                      <input
                        type="date"
                        required
                        value={newInvoiceForm.date}
                        onChange={(e) => setNewInvoiceForm({ ...newInvoiceForm, date: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 focus:outline-none focus:border-[#0E8388]"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-bold uppercase text-[10px] mb-1">Vencimiento / Plazo</label>
                      <input
                        type="text"
                        placeholder="30 días / 20 Sep 2026"
                        value={newInvoiceForm.dueDate}
                        onChange={(e) => setNewInvoiceForm({ ...newInvoiceForm, dueDate: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 focus:outline-none focus:border-[#0E8388]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-700 font-bold uppercase text-[10px] mb-1">Proveedor / Distribuidora</label>
                      <input
                        type="text"
                        placeholder="Distribuidora Bravery Chile SpA"
                        value={newInvoiceForm.provider}
                        onChange={(e) => setNewInvoiceForm({ ...newInvoiceForm, provider: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 focus:outline-none focus:border-[#0E8388]"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-bold uppercase text-[10px] mb-1">RUT Proveedor</label>
                      <input
                        type="text"
                        placeholder="76.452.190-3"
                        value={newInvoiceForm.providerRut}
                        onChange={(e) => setNewInvoiceForm({ ...newInvoiceForm, providerRut: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 font-mono focus:outline-none focus:border-[#0E8388]"
                      />
                    </div>
                  </div>
                </div>

                {/* Selección o Creación de Producto para Inventario */}
                <div className="p-3.5 rounded-2xl bg-emerald-50/50 border border-emerald-200/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-black uppercase text-emerald-900 tracking-wider">
                      2. Producto y Afectación en Inventario (Bodega)
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                      Afecta Stock Físico
                    </span>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold uppercase text-[10px] mb-1">
                      Seleccionar Producto de Catálogo o Ingresar Nuevo
                    </label>
                    <select
                      value={newInvoiceForm.selectedProductId}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === 'nuevo') {
                          setNewInvoiceForm({
                            ...newInvoiceForm,
                            selectedProductId: 'nuevo',
                            productName: '',
                            unitCostNeto: 35000,
                            salePrice: 59990,
                          });
                        } else if (val) {
                          const prod = inventory.find((p) => p.id === val);
                          if (prod) {
                            setNewInvoiceForm({
                              ...newInvoiceForm,
                              selectedProductId: prod.id,
                              productName: prod.name,
                              format: prod.format || '12 kg',
                              unitCostNeto: prod.unitCostNeto || 42000,
                              salePrice: prod.salePrice || 68990,
                            });
                          }
                        } else {
                          setNewInvoiceForm({
                            ...newInvoiceForm,
                            selectedProductId: '',
                          });
                        }
                      }}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-emerald-300 text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    >
                      <option value="">-- Elige un producto existente en bodega --</option>
                      {inventory.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({p.format || 'Formato estándar'}) • Stock actual: {p.stock} un. • PVP: {formatCLP(p.salePrice)}
                        </option>
                      ))}
                      <option value="nuevo">➕ Registrar un producto nuevo que no está en catálogo...</option>
                    </select>
                  </div>

                  {newInvoiceForm.selectedProductId === 'nuevo' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      <div>
                        <label className="block text-slate-700 font-bold uppercase text-[10px] mb-1">Nombre del Producto Nuevo</label>
                        <input
                          type="text"
                          required
                          placeholder="Ej: Bravery Pavo Puppy 12kg"
                          value={newInvoiceForm.productName}
                          onChange={(e) => setNewInvoiceForm({ ...newInvoiceForm, productName: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 focus:outline-none focus:border-[#0E8388]"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-700 font-bold uppercase text-[10px] mb-1">Formato / Peso</label>
                        <input
                          type="text"
                          placeholder="12 kg, 7 kg, 200 g..."
                          value={newInvoiceForm.format}
                          onChange={(e) => setNewInvoiceForm({ ...newInvoiceForm, format: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 focus:outline-none focus:border-[#0E8388]"
                        />
                      </div>
                    </div>
                  )}

                  {/* Stock projection banner */}
                  {selectedInvProd && (
                    <div className="p-2.5 rounded-xl bg-white border border-emerald-200 text-xs flex items-center justify-between text-slate-700">
                      <div>
                        <span className="text-slate-500 block text-[10px] uppercase font-bold">Proyección de Stock:</span>
                        <span className="font-medium">
                          Stock actual: <strong>{selectedInvProd.stock} un.</strong>
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-emerald-700 font-black text-sm">
                          → Nuevo Stock: {selectedInvProd.stock + modalQty} un. (+{modalQty})
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Costos y Cantidades */}
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-slate-700 font-bold uppercase text-[10px] mb-1">Cantidad (Unidades)</label>
                      <input
                        type="number"
                        min="1"
                        required
                        value={newInvoiceForm.quantityReceived}
                        onChange={(e) => setNewInvoiceForm({ ...newInvoiceForm, quantityReceived: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 font-black text-sm focus:outline-none focus:border-[#0E8388]"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-bold uppercase text-[10px] mb-1">Costo Unit. Neto ($)</label>
                      <input
                        type="number"
                        min="0"
                        required
                        value={newInvoiceForm.unitCostNeto}
                        onChange={(e) => setNewInvoiceForm({ ...newInvoiceForm, unitCostNeto: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 font-mono font-bold focus:outline-none focus:border-[#0E8388]"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-bold uppercase text-[10px] mb-1">PVP Venta ($ CLP)</label>
                      <input
                        type="number"
                        min="0"
                        required
                        value={newInvoiceForm.salePrice}
                        onChange={(e) => setNewInvoiceForm({ ...newInvoiceForm, salePrice: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-[#0E8388] font-mono font-black focus:outline-none focus:border-[#0E8388]"
                      />
                    </div>
                  </div>
                </div>

                {/* Tarjeta de Cálculo de Impuestos en Vivo (IVA Crédito Fiscal) */}
                <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 to-indigo-950 text-white space-y-2.5 shadow-md">
                  <div className="flex items-center justify-between text-[11px] border-b border-white/10 pb-2">
                    <span className="uppercase tracking-wider font-extrabold text-slate-300">Resumen Fiscal de la Factura:</span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold text-[10px]">
                      IVA 19% Ley de Impuestos
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center pt-1">
                    <div className="bg-white/5 p-2 rounded-xl border border-white/10">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Subtotal Neto</span>
                      <span className="text-sm font-black font-mono text-white">{formatCLP(modalSubtotalNeto)}</span>
                    </div>
                    <div className="bg-emerald-500/15 p-2 rounded-xl border border-emerald-500/30">
                      <span className="text-[10px] uppercase font-bold text-emerald-300 block">IVA Crédito (19%)</span>
                      <span className="text-sm font-black font-mono text-emerald-300">+{formatCLP(modalIvaCredito)}</span>
                    </div>
                    <div className="bg-white/10 p-2 rounded-xl border border-white/15">
                      <span className="text-[10px] uppercase font-bold text-slate-300 block">Total Bruto Factura</span>
                      <span className="text-sm font-black font-mono text-white">{formatCLP(modalTotalBruto)}</span>
                    </div>
                  </div>

                  <p className="text-[11px] text-emerald-300/90 font-medium pt-1">
                    🛡️ <strong>Impacto Tributario:</strong> Los <strong>{formatCLP(modalIvaCredito)}</strong> de IVA quedarán cargados a tu favor en el Formulario 29, descontándose automáticamente del IVA de tus ventas del mes.
                  </p>
                </div>

                <div className="pt-2 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsAddInvoiceModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 font-bold transition-colors cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#0E8388] to-[#10B981] hover:opacity-95 text-white font-black shadow-md shadow-[#0E8388]/20 transition-all cursor-pointer flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Guardar Factura & Aumentar Stock (+{modalQty} un.)</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        );
      })()}

      {/* ========================================================================= */}
      {/* MODAL: CREAR / CONFIGURAR ZONA DE DESPACHO                                */}
      {/* ========================================================================= */}
      {isZoneModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-xl w-full p-6 sm:p-7 space-y-5 shadow-2xl text-slate-900 max-h-[92vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                  <Truck className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900">
                    {zoneModalForm.id ? 'Editar Zona de Despacho' : 'Crear Zona de Despacho'}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
                    Configura el kilometraje, el valor y el envío gratis.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsZoneModalOpen(false)}
                className="p-2 rounded-full bg-slate-100 text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
                title="Cerrar ventana"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveZoneModal} className="space-y-5">
              {/* Nombre de la Zona */}
              <div>
                <label className="text-sm font-bold text-slate-800 block mb-1">
                  Nombre de la Zona:
                </label>
                <input
                  type="text"
                  required
                  value={zoneModalForm.name}
                  onChange={(e) => setZoneModalForm({ ...zoneModalForm, name: e.target.value })}
                  placeholder="Ej: Zona 1 (Radio Urbano)"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-base font-bold text-slate-900 focus:outline-none focus:bg-white focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                />
              </div>

              {/* Fila 2 columnas: Kilometraje y Valor del Despacho lado a lado */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Campo 1: Kilometraje */}
                <div>
                  <label className="text-sm font-bold text-slate-800 block mb-1">
                    ¿Hasta cuántos km cubre?
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="1"
                      max="250"
                      step="1"
                      required
                      value={zoneModalForm.radiusMaxKm || ''}
                      placeholder="km desde bodega (ej: 5)"
                      onChange={(e) =>
                        setZoneModalForm({
                          ...zoneModalForm,
                          radiusMaxKm: e.target.value === '' ? '' : parseFloat(e.target.value) || 0,
                        })
                      }
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-4 pr-11 py-3 text-lg font-black text-slate-900 placeholder:text-slate-400 placeholder:text-xs sm:placeholder:text-sm placeholder:font-normal focus:outline-none focus:bg-white focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    {/* Selector personalizado para subir y bajar kilómetros */}
                    <div className="absolute right-1 top-1 bottom-1 w-8 flex flex-col border-l border-slate-200 bg-white rounded-r-xl overflow-hidden shadow-2xs">
                      <button
                        type="button"
                        onClick={() =>
                          setZoneModalForm((prev) => ({
                            ...prev,
                            radiusMaxKm: Math.min(250, (parseFloat(prev.radiusMaxKm) || 0) + 1),
                          }))
                        }
                        className="flex-1 flex items-center justify-center text-slate-500 hover:text-emerald-700 hover:bg-slate-100 transition-colors cursor-pointer active:bg-slate-200"
                        title="Aumentar kilómetros (+1)"
                      >
                        <ChevronUp className="w-4 h-4 stroke-[2.5]" />
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setZoneModalForm((prev) => ({
                            ...prev,
                            radiusMaxKm: Math.max(1, (parseFloat(prev.radiusMaxKm) || 0) - 1),
                          }))
                        }
                        className="flex-1 flex items-center justify-center text-slate-500 hover:text-emerald-700 hover:bg-slate-100 border-t border-slate-200 transition-colors cursor-pointer active:bg-slate-200"
                        title="Disminuir kilómetros (-1)"
                      >
                        <ChevronDown className="w-4 h-4 stroke-[2.5]" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Campo 2: Valor del despacho */}
                <div>
                  <label className="text-sm font-bold text-slate-800 block mb-1">
                    ¿Cuánto cobrar por el despacho?
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-3 text-xl font-black text-slate-400">$</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      required
                      value={zoneModalForm.baseFee !== '' && zoneModalForm.baseFee !== null && zoneModalForm.baseFee !== undefined ? formatDigitsWithDots(zoneModalForm.baseFee) : ''}
                      placeholder="1.990"
                      onChange={(e) => {
                        const raw = e.target.value.replace(/\D/g, '');
                        setZoneModalForm({
                          ...zoneModalForm,
                          baseFee: raw === '' ? '' : parseInt(raw, 10),
                        });
                      }}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-4 py-3 text-2xl font-black text-slate-900 focus:outline-none focus:bg-white focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                    />
                  </div>
                </div>
              </div>

              {/* DYNAMIC CALCULATIONS: Costo Real, Margen Neto (Idea 1 & Idea 4) */}
              {(() => {
                const kmOneWay = parseFloat(zoneModalForm.radiusMaxKm) || 0;
                const kmRoundTrip = kmOneWay * 2;
                const fuelCostRoundTrip = Math.round(kmRoundTrip * fleetFuelStats.avgCostPerKm);
                const deliveryFee = parseInt(zoneModalForm.baseFee, 10) || 0;
                const netMargin = deliveryFee - fuelCostRoundTrip;
                const marginPercent = deliveryFee > 0 ? Math.round((netMargin / deliveryFee) * 100) : 0;

                return (
                  <div
                    className={`p-4 rounded-2xl border transition-all ${
                      deliveryFee > 0 && netMargin < 0
                        ? 'bg-rose-50/70 border-rose-200'
                        : 'bg-slate-50/90 border-slate-200'
                    }`}
                  >
                    {/* Header con referencia al promedio de la flota (Idea 4) */}
                    <div className="flex items-center justify-between gap-2 text-xs pb-2.5 border-b border-slate-200/80">
                      <div className="flex items-center gap-1.5 font-bold text-slate-700 min-w-0">
                        <Car className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span className="truncate">{fleetFuelStats.label}</span>
                        {fleetFuelStats.sublabel && (
                          <span className="text-[11px] font-normal text-slate-400 hidden sm:inline truncate">
                            ({fleetFuelStats.sublabel})
                          </span>
                        )}
                      </div>
                      <span className="font-mono font-black text-slate-800 bg-white border border-slate-200 px-2.5 py-0.5 rounded-lg text-[11px] shadow-2xs shrink-0">
                        ~${fleetFuelStats.avgCostPerKm}/km
                      </span>
                    </div>

                    {/* 3 Cards con Estilo Moderno: Recorrido, Bencina y Margen (Alineadas en Cabecera y Pie) */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 items-stretch">
                      {/* CARD 1: Recorrido */}
                      <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col justify-between text-center h-full hover:border-slate-300 transition-all">
                        {/* Título alineado arriba */}
                        <div className="h-5 flex items-center justify-center">
                          <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                            Recorrido
                          </span>
                        </div>

                        {/* Valor central */}
                        <div className="my-auto py-1 flex items-baseline justify-center gap-1">
                          <span className="text-2xl sm:text-3xl font-black text-slate-900 font-mono tracking-tight">
                            {kmRoundTrip}
                          </span>
                          <span className="text-xs sm:text-sm font-black text-slate-500 uppercase">
                            km
                          </span>
                        </div>

                        {/* Texto inferior alineado abajo */}
                        <div className="h-8 flex items-center justify-center">
                          <span className="text-[10px] font-medium text-slate-400 leading-tight">
                            Ida y vuelta ({kmOneWay} km x 2)
                          </span>
                        </div>
                      </div>

                      {/* CARD 2: Bencina */}
                      <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col justify-between text-center h-full hover:border-slate-300 transition-all">
                        {/* Título alineado arriba */}
                        <div className="h-5 flex items-center justify-center">
                          <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                            Bencina
                          </span>
                        </div>

                        {/* Valor central */}
                        <div className="my-auto py-1 flex items-center justify-center">
                          <span className="text-2xl sm:text-3xl font-black text-slate-900 font-mono tracking-tight text-center">
                            {formatCLP(fuelCostRoundTrip)}
                          </span>
                        </div>

                        {/* Texto inferior alineado abajo */}
                        <div className="h-8 flex items-center justify-center">
                          <span className="text-[10px] font-medium text-slate-400 leading-tight">
                            Costo estimado viaje
                          </span>
                        </div>
                      </div>

                      {/* CARD 3: Margen */}
                      <div
                        className={`p-3.5 sm:p-4 rounded-2xl border shadow-2xs flex flex-col justify-between text-center h-full transition-all ${
                          netMargin > 0
                            ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950 hover:border-emerald-300'
                            : netMargin === 0
                            ? 'bg-slate-50 border-slate-200 text-slate-800'
                            : 'bg-rose-50/80 border-rose-200 text-rose-950 hover:border-rose-300'
                        }`}
                      >
                        {/* Título alineado arriba */}
                        <div className="h-5 flex items-center justify-center">
                          <span
                            className={`text-[11px] font-black uppercase tracking-wider ${
                              netMargin > 0
                                ? 'text-emerald-700'
                                : netMargin === 0
                                ? 'text-slate-400'
                                : 'text-rose-700'
                            }`}
                          >
                            Margen
                          </span>
                        </div>

                        {/* Valor central */}
                        <div className="my-auto py-1 flex flex-col items-center justify-center">
                          <div className="flex items-baseline justify-center gap-1.5 flex-wrap">
                            <span
                              className={`text-2xl sm:text-3xl font-black font-mono tracking-tight ${
                                netMargin > 0
                                  ? 'text-emerald-700'
                                  : netMargin === 0
                                  ? 'text-slate-700'
                                  : 'text-rose-700'
                              }`}
                            >
                              {netMargin > 0
                                ? `+${formatCLP(netMargin)}`
                                : netMargin === 0
                                ? '$0'
                                : `-${formatCLP(Math.abs(netMargin))}`}
                            </span>
                            {deliveryFee > 0 && netMargin > 0 && (
                              <span className="text-xs font-black px-1.5 py-0.5 rounded-md bg-emerald-600/10 text-emerald-800 border border-emerald-600/20">
                                {marginPercent}%
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Texto inferior alineado abajo */}
                        <div className="h-8 flex items-center justify-center">
                          <span
                            className={`text-[10px] font-medium leading-tight ${
                              netMargin > 0
                                ? 'text-emerald-700/80'
                                : netMargin === 0
                                ? 'text-slate-400'
                                : 'text-rose-700'
                            }`}
                          >
                            {netMargin > 0
                              ? 'Ganancia neta'
                              : netMargin === 0
                              ? 'Cubre justo el costo'
                              : 'Pérdida en combustible'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Alerta inteligente en caso de que la tarifa no cubra la bencina */}
                    {deliveryFee > 0 && netMargin < 0 && (
                      <div className="mt-2.5 p-2.5 bg-rose-100/90 border border-rose-200 rounded-xl flex items-center gap-2 text-xs font-bold text-rose-800">
                        <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                        <span>
                          Atención: Cobrar {formatCLP(deliveryFee)} no cubre los {formatCLP(fuelCostRoundTrip)} de bencina para {kmRoundTrip} km. Te sugerimos cobrar al menos {formatCLP(fuelCostRoundTrip)}.
                        </span>
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* Campo 3: Despacho gratis en base a una compra mínima */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                {/* Checkbox diseñado a medida sin usar el nativo del navegador */}
                <div
                  role="checkbox"
                  aria-checked={zoneModalForm.hasFreeShipping}
                  tabIndex={0}
                  onClick={() =>
                    setZoneModalForm((prev) => ({
                      ...prev,
                      hasFreeShipping: !prev.hasFreeShipping,
                    }))
                  }
                  onKeyDown={(e) => {
                    if (e.key === ' ' || e.key === 'Enter') {
                      e.preventDefault();
                      setZoneModalForm((prev) => ({
                        ...prev,
                        hasFreeShipping: !prev.hasFreeShipping,
                      }));
                    }
                  }}
                  className="flex items-center gap-3 cursor-pointer select-none group focus:outline-none"
                >
                  <div
                    className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                      zoneModalForm.hasFreeShipping
                        ? 'bg-emerald-600 border-emerald-600 shadow-xs text-white'
                        : 'bg-white border-slate-300 group-hover:border-slate-400'
                    }`}
                  >
                    {zoneModalForm.hasFreeShipping && (
                      <Check className="w-4 h-4 stroke-[3] animate-in zoom-in-75 duration-150" />
                    )}
                  </div>
                  <span className="text-sm font-black text-slate-800 group-hover:text-slate-900">
                    ¿Ofrecer despacho gratis con compra mínima?
                  </span>
                </div>

                {zoneModalForm.hasFreeShipping ? (
                  <div className="pl-8 space-y-2.5 animate-in fade-in">
                    <label className="text-xs font-bold text-slate-700 block">
                      Envío gratis en compras superiores a ($ CLP):
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-2.5 text-base font-black text-slate-400">$</span>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={zoneModalForm.freeThreshold !== '' && zoneModalForm.freeThreshold !== null && zoneModalForm.freeThreshold !== undefined ? formatDigitsWithDots(zoneModalForm.freeThreshold) : ''}
                        placeholder="25.000"
                        onChange={(e) => {
                          const raw = e.target.value.replace(/\D/g, '');
                          setZoneModalForm({
                            ...zoneModalForm,
                            freeThreshold: raw === '' ? '' : parseInt(raw, 10),
                          });
                        }}
                        className="w-full bg-white border border-slate-300 rounded-xl pl-9 pr-4 py-2.5 text-lg font-black text-slate-900 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                      />
                    </div>

                    {/* IDEA 3: Impacto del costo de bencina en el pedido mínimo */}
                    {(() => {
                      const kmOneWay = parseFloat(zoneModalForm.radiusMaxKm) || 0;
                      const kmRoundTrip = kmOneWay * 2;
                      const fuelCost = Math.round(kmRoundTrip * fleetFuelStats.avgCostPerKm);
                      const threshold = parseInt(zoneModalForm.freeThreshold, 10) || 0;
                      if (threshold <= 0 || fuelCost <= 0) return null;
                      const percent = ((fuelCost / threshold) * 100).toFixed(1);

                      return (
                        <div className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between gap-3 text-xs shadow-2xs">
                          <div className="flex items-center gap-2 text-slate-700 font-medium">
                            <Fuel className="w-4 h-4 text-emerald-600 shrink-0" />
                            <span>
                              En un pedido de <strong>{formatCLP(threshold)}</strong>, la bencina ({formatCLP(fuelCost)}) representa:
                            </span>
                          </div>
                          <div
                            className={`px-2.5 py-1 rounded-lg font-mono font-black text-xs shrink-0 ${
                              parseFloat(percent) <= 6
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                : parseFloat(percent) <= 12
                                ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                : 'bg-rose-100 text-rose-800 border border-rose-200'
                            }`}
                          >
                            {percent}% del pedido
                          </div>
                        </div>
                      );
                    })()}

                    <p className="text-xs text-slate-500 font-medium">
                      Si el cliente compra más de este monto, el despacho saldrá a costo $0.
                    </p>
                  </div>
                ) : (
                  <p className="pl-8 text-xs text-slate-500 font-medium">
                    Esta zona no tendrá opción de despacho gratis; se cobrará siempre la tarifa fija.
                  </p>
                )}
              </div>

              {/* Resumen Visual Escaneable (Key-Value Badges & Pills) */}
              {(() => {
                const kmOneWay = parseFloat(zoneModalForm.radiusMaxKm) || 0;
                const kmRoundTrip = kmOneWay * 2;
                const fuelCost = Math.round(kmRoundTrip * fleetFuelStats.avgCostPerKm);
                const deliveryFee = parseInt(zoneModalForm.baseFee, 10) || 0;
                const netMargin = deliveryFee - fuelCost;
                const threshold = parseInt(zoneModalForm.freeThreshold, 10) || 0;

                return (
                  <div className="bg-slate-50/90 border border-slate-200/90 rounded-2xl p-4 space-y-3">
                    {/* Header del Resumen */}
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>Resumen de la Zona</span>
                      </span>
                      <span className="text-[11px] font-black text-slate-700 bg-white border border-slate-200 px-2.5 py-0.5 rounded-full shadow-2xs font-mono">
                        Hasta {kmOneWay} km
                      </span>
                    </div>

                    {/* 2 Columnas Escaneables: Cobro al Cliente y Envío Gratis */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                      {/* Fila 1: Tarifa Despacho */}
                      <div className="bg-white p-3 rounded-xl border border-slate-200/80 flex items-center justify-between shadow-2xs">
                        <span className="text-slate-600 font-semibold">Tarifa cliente:</span>
                        <span className="font-mono font-black text-slate-900 text-sm">
                          {deliveryFee > 0 ? formatCLP(deliveryFee) : '$0'}
                        </span>
                      </div>

                      {/* Fila 2: Envío Gratis */}
                      <div className="bg-white p-3 rounded-xl border border-slate-200/80 flex items-center justify-between shadow-2xs">
                        <span className="text-slate-600 font-semibold">Envío gratis:</span>
                        {zoneModalForm.hasFreeShipping && threshold > 0 ? (
                          <span className="font-mono font-black text-emerald-700 text-sm">
                            Sobre {formatCLP(threshold)}
                          </span>
                        ) : (
                          <span className="font-bold text-slate-400 text-xs">
                            No aplica
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Fila 3: Balance por Despacho */}
                    <div
                      className={`p-3 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 text-xs ${
                        netMargin > 0
                          ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                          : netMargin === 0
                          ? 'bg-white border-slate-200 text-slate-700'
                          : 'bg-rose-50 border-rose-200 text-rose-950'
                      }`}
                    >
                      <span className="font-semibold text-slate-700">
                        {netMargin >= 0 ? 'Margen neto estimado:' : 'Balance de entrega:'}
                      </span>
                      <div className="flex items-center gap-2">
                        <span
                          className={`font-mono font-black text-sm ${
                            netMargin > 0
                              ? 'text-emerald-700'
                              : netMargin === 0
                              ? 'text-slate-700'
                              : 'text-rose-700'
                          }`}
                        >
                          {netMargin > 0
                            ? `+${formatCLP(netMargin)}`
                            : netMargin === 0
                            ? '$0'
                            : `-${formatCLP(Math.abs(netMargin))}`}
                        </span>
                        <span className="text-[11px] font-medium text-slate-500">
                          (cubriendo ~{formatCLP(fuelCost)} de bencina)
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Botones de acción */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsZoneModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-sm font-black shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center gap-2 active:scale-95"
                >
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>{zoneModalForm.id ? 'Guardar Cambios' : 'Crear Zona'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: AGREGAR / EDITAR AUTO (DISEÑO MINIMALISTA)                         */}
      {/* ========================================================================= */}
      {isVehicleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full p-6 sm:p-7 space-y-5 shadow-2xl text-slate-900 max-h-[92vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                  <Car className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900">
                    {vehicleModalForm.id ? 'Editar Auto' : 'Agregar Auto'}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Configura la marca, patente, rendimiento y precio de la bencina.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsVehicleModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveVehicleModal} className="space-y-4">
              {/* Marca y Modelo */}
              <div className="space-y-1.5">
                <label className="text-xs font-black uppercase tracking-wider text-slate-700 block">
                  Marca y Modelo del Auto *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Chevrolet Sail, Peugeot Partner..."
                  value={vehicleModalForm.brand}
                  onChange={(e) => setVehicleModalForm({ ...vehicleModalForm, brand: e.target.value })}
                  className="w-full h-11 px-3.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold text-sm focus:bg-white focus:border-emerald-500 focus:outline-none transition-colors"
                />
              </div>

              {/* Patente */}
              <div className="space-y-1.5">
                <label className="text-xs font-black uppercase tracking-wider text-slate-700 block">
                  Patente *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: LD-42-10"
                  value={vehicleModalForm.plate}
                  onChange={(e) => setVehicleModalForm({ ...vehicleModalForm, plate: e.target.value.toUpperCase() })}
                  className="w-full h-11 px-3.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-mono font-bold text-sm focus:bg-white focus:border-emerald-500 focus:outline-none transition-colors"
                />
              </div>

              {/* 2 Columnas: Rendimiento y Litro de Bencina */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                {/* Rendimiento (km por litro) */}
                <div className="space-y-1.5">
                  <label className="text-xs font-black uppercase tracking-wider text-slate-700 block">
                    Rendimiento (km por litro) *
                  </label>
                  <div className="flex items-center gap-1.5">
                    <div className="relative flex-1">
                      <input
                        type="number"
                        step="0.5"
                        min="1"
                        max="60"
                        required
                        value={vehicleModalForm.efficiencyKmPerL}
                        onChange={(e) =>
                          setVehicleModalForm({
                            ...vehicleModalForm,
                            efficiencyKmPerL: Math.max(0.5, parseFloat(e.target.value) || 1),
                          })
                        }
                        className="w-full h-11 pl-3.5 pr-14 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-mono font-black text-sm focus:bg-white focus:border-emerald-500 focus:outline-none transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                      <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                        km/L
                      </span>
                    </div>
                    {/* Botones Stepper */}
                    <div className="flex flex-col gap-0.5">
                      <button
                        type="button"
                        onClick={() =>
                          setVehicleModalForm((prev) => ({
                            ...prev,
                            efficiencyKmPerL: parseFloat(((parseFloat(prev.efficiencyKmPerL) || 1) + 1).toFixed(1)),
                          }))
                        }
                        className="w-7 h-5 flex items-center justify-center rounded-md bg-slate-100 hover:bg-emerald-100 text-slate-700 hover:text-emerald-700 cursor-pointer border border-slate-200 transition-colors"
                        title="Subir 1 km/L"
                      >
                        <ChevronUp className="w-3.5 h-3.5 stroke-[3]" />
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setVehicleModalForm((prev) => ({
                            ...prev,
                            efficiencyKmPerL: Math.max(1, parseFloat(((parseFloat(prev.efficiencyKmPerL) || 1) - 1).toFixed(1))),
                          }))
                        }
                        className="w-7 h-5 flex items-center justify-center rounded-md bg-slate-100 hover:bg-emerald-100 text-slate-700 hover:text-emerald-700 cursor-pointer border border-slate-200 transition-colors"
                        title="Bajar 1 km/L"
                      >
                        <ChevronDown className="w-3.5 h-3.5 stroke-[3]" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Precio por Litro de Bencina */}
                <div className="space-y-1.5">
                  <label className="text-xs font-black uppercase tracking-wider text-slate-700 block">
                    Litro de Bencina ($ CLP) *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-black text-slate-400 text-sm">
                      $
                    </span>
                    <input
                      type="text"
                      inputMode="numeric"
                      required
                      placeholder="1.320"
                      value={
                        vehicleModalForm.fuelPricePerL !== '' &&
                        vehicleModalForm.fuelPricePerL !== null &&
                        vehicleModalForm.fuelPricePerL !== undefined
                          ? formatDigitsWithDots(vehicleModalForm.fuelPricePerL)
                          : ''
                      }
                      onChange={(e) => {
                        const cleanDigits = e.target.value.replace(/\D/g, '');
                        setVehicleModalForm({
                          ...vehicleModalForm,
                          fuelPricePerL: cleanDigits === '' ? '' : parseInt(cleanDigits, 10),
                        });
                      }}
                      className="w-full h-11 pl-8 pr-12 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-mono font-black text-sm focus:bg-white focus:border-emerald-500 focus:outline-none transition-colors"
                    />
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                      / Litro
                    </span>
                  </div>
                </div>
              </div>

              {/* Previsualización en tiempo real */}
              {(() => {
                const eff = parseFloat(vehicleModalForm.efficiencyKmPerL) || 1;
                const price = parseFloat(vehicleModalForm.fuelPricePerL) || 0;
                const costKm = eff > 0 ? Math.round(price / eff) : 0;
                return (
                  <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    <div className="text-xs text-emerald-950 font-medium">
                      Costo estimado: <strong className="text-emerald-800 font-black text-sm">{formatCLP(costKm)} CLP</strong> por cada kilómetro recorrido.
                    </div>
                  </div>
                );
              })()}

              {/* Botones de acción */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsVehicleModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-sm font-black shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center gap-2 active:scale-95"
                >
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>{vehicleModalForm.id ? 'Guardar Cambios' : 'Guardar Auto'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================= */}
      {/* MODAL: PLANIFICADOR DE REPOSICIÓN PREDICTIVA DE ALIMENTOS */}
      {/* ======================================================= */}
      {isReplenishmentModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-4xl w-full border border-slate-200 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="p-6 bg-gradient-to-r from-amber-500/10 via-emerald-500/5 to-transparent border-b border-slate-100 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-amber-500 text-white shadow-md shadow-amber-500/30">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-black text-slate-900">Planificador Predictivo de Reposición</h3>
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-300">
                      Nutrición & Consumo
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    Monitoreo automático de días restantes de alimento según peso, ración diaria y fecha de última compra
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsReplenishmentModalOpen(false)}
                className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick KPI Counters & Filter Bar */}
            <div className="p-5 bg-slate-50/80 border-b border-slate-100 space-y-4 shrink-0">
              {/* Metric Summary Badges */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-rose-700 uppercase block">🔴 Nivel Crítico (&lt; 5 días)</span>
                    <span className="text-lg font-black text-rose-900">2 Mascotas</span>
                  </div>
                  <span className="text-xs font-bold text-rose-700 bg-white px-2 py-1 rounded-xl shadow-xs">Kira, Rocky</span>
                </div>

                <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-amber-700 uppercase block">🟡 Atención Próxima (&lt; 15 días)</span>
                    <span className="text-lg font-black text-amber-900">1 Mascota</span>
                  </div>
                  <span className="text-xs font-bold text-amber-700 bg-white px-2 py-1 rounded-xl shadow-xs">Luna</span>
                </div>

                <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-emerald-700 uppercase block">🟢 Stock Óptimo (&gt; 15 días)</span>
                    <span className="text-lg font-black text-emerald-900">2 Mascotas</span>
                  </div>
                  <span className="text-xs font-bold text-emerald-700 bg-white px-2 py-1 rounded-xl shadow-xs">Jack, Milo</span>
                </div>
              </div>

              {/* Filter Tabs */}
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-1.5 p-1 rounded-xl bg-white border border-slate-200 shadow-xs">
                  {[
                    { id: 'criticos', label: '⚠️ Solo Críticos (< 5 días)' },
                    { id: 'proximos', label: '🟡 Próximos 15 días' },
                    { id: 'todos', label: 'Todos los Tutores (5)' },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setReplenishmentFilter(tab.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        replenishmentFilter === tab.id
                          ? 'bg-[#0E8388] text-white shadow-xs font-black'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                <span className="text-xs text-slate-500 font-semibold">
                  Mostrando clientes calculados con IA nutricional
                </span>
              </div>
            </div>

            {/* List of Customers and Food to Replenish */}
            <div className="p-6 overflow-y-auto space-y-4 flex-1">
              {customers
                .filter((cust) => {
                  if (replenishmentFilter === 'criticos') return (cust.pet?.daysRemaining || 30) <= 5;
                  if (replenishmentFilter === 'proximos') return (cust.pet?.daysRemaining || 30) <= 15;
                  return true;
                })
                .map((cust) => {
                  const days = cust.pet?.daysRemaining || 30;
                  const isCritical = days <= 5;
                  const isWarning = days > 5 && days <= 15;
                  const totalDays = cust.pet?.bagDurationDays || 30;
                  const consumedPercent = Math.min(100, Math.round(((totalDays - days) / totalDays) * 100));

                  // Calculate estimated run-out date
                  const targetDate = new Date();
                  targetDate.setDate(targetDate.getDate() + days);
                  const formattedTargetDate = new Intl.DateTimeFormat('es-CL', {
                    weekday: 'short',
                    day: 'numeric',
                    month: 'short',
                  }).format(targetDate);

                  return (
                    <div
                      key={cust.id}
                      className={`p-5 rounded-3xl border transition-all ${
                        isCritical
                          ? 'bg-rose-50/40 border-rose-200 hover:border-rose-300 shadow-xs'
                          : isWarning
                          ? 'bg-amber-50/40 border-amber-200 hover:border-amber-300 shadow-xs'
                          : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
                      }`}
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        {/* Pet & Food Highlight */}
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-2xl shadow-xs shrink-0">
                            {cust.pet?.type === 'perro' ? '🐶' : '🐱'}
                          </div>

                          <div className="space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="text-base font-black text-slate-900">
                                {cust.pet?.name}{' '}
                                <span className="text-xs font-semibold text-slate-500">
                                  ({cust.pet?.breed} • {cust.pet?.weight})
                                </span>
                              </h4>
                              {isCritical && (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-rose-100 text-rose-800 border border-rose-300 animate-pulse">
                                  ⚠️ Reposición Urgente
                                </span>
                              )}
                              {isWarning && (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-amber-100 text-amber-800 border border-amber-300">
                                  🟡 Atención Próxima
                                </span>
                              )}
                            </div>

                            {/* Food SKU Info */}
                            <div className="flex items-center gap-2 text-xs">
                              <span className="font-extrabold text-[#0E8388] bg-[#0E8388]/10 px-2.5 py-0.5 rounded-lg border border-[#0E8388]/20 flex items-center gap-1.5">
                                <Package className="w-3.5 h-3.5" />
                                <span>{cust.pet?.favoriteFood}</span>
                              </span>
                              <span className="text-slate-500 font-medium">
                                Formato para {totalDays} días
                              </span>
                            </div>

                            {/* Tutor Info */}
                            <div className="text-xs text-slate-600 flex items-center gap-3 pt-1 flex-wrap font-medium">
                              <span><strong>Tutor:</strong> {cust.name}</span>
                              <span>•</span>
                              <span><strong>Ciudad:</strong> {cust.city}</span>
                              <span>•</span>
                              <span className="font-mono text-slate-500">{cust.phone}</span>
                            </div>
                          </div>
                        </div>

                        {/* Consumption Countdown & Runout Date */}
                        <div className="md:text-right space-y-1.5 shrink-0">
                          <div className="flex md:justify-end items-baseline gap-1.5">
                            <span className="text-xs text-slate-500 font-bold">Le quedan:</span>
                            <span
                              className={`text-xl font-black ${
                                isCritical ? 'text-rose-600' : isWarning ? 'text-amber-600' : 'text-emerald-600'
                              }`}
                            >
                              {days} {days === 1 ? 'día' : 'días'}
                            </span>
                          </div>

                          <div className="text-[11px] text-slate-500 font-medium">
                            Se agota aprox.: <strong className="text-slate-900">{formattedTargetDate}</strong>
                          </div>

                          {/* Progress Bar of Consumption */}
                          <div className="w-44 h-2.5 rounded-full bg-slate-200 overflow-hidden ml-auto">
                            <div
                              className={`h-full rounded-full transition-all duration-700 ${
                                isCritical
                                  ? 'bg-rose-500'
                                  : isWarning
                                  ? 'bg-amber-500'
                                  : 'bg-emerald-500'
                              }`}
                              style={{ width: `${consumedPercent}%` }}
                              title={`${consumedPercent}% consumido`}
                            />
                          </div>
                          <span className="text-[10px] text-slate-400 block">{consumedPercent}% de la bolsa consumida</span>
                        </div>
                      </div>

                      {/* Action Buttons Row */}
                      <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center justify-between gap-3 flex-wrap">
                        <div className="text-xs text-slate-500 font-medium">
                          Clínica habitual: <strong className="text-slate-800">{cust.pet?.vetClinic || 'Convenio Local'}</strong>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              const msg = `¡Hola ${cust.name}! Te escribimos con cariño desde Patitas del Sur 🐾. Calculamos que a ${cust.pet?.name} le quedan aproximadamente ${days} días de su alimento "${cust.pet?.favoriteFood}". ¿Te gustaría que te programemos el despacho a ${cust.city} para que no se quede sin su comida? Tienes tu 10% de descuento habitual activo ✨. ¡Avísanos y lo preparamos de inmediato!`;
                              navigator.clipboard?.writeText?.(msg);
                              showToast(`¡Mensaje para ${cust.name} copiado al portapapeles y listo para WhatsApp!`);
                            }}
                            className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                            <span>Enviar Recordatorio WhatsApp</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              showToast(`Generando orden de reposición de "${cust.pet?.favoriteFood}" para ${cust.name}...`);
                              setActiveTab('pedidos');
                              setIsReplenishmentModalOpen(false);
                            }}
                            className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 active:scale-95 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
                          >
                            <ShoppingBag className="w-3.5 h-3.5" />
                            <span>Crear Pedido de Reposición</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setSelectedCustomerModal(cust);
                            }}
                            className="p-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 transition-colors cursor-pointer"
                            title="Ver ficha médica/nutricional completa"
                          >
                            <Eye className="w-4 h-4 text-slate-600" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>

            {/* Modal Footer */}
            <div className="p-5 bg-slate-50 border-t border-slate-100 flex items-center justify-between shrink-0">
              <span className="text-xs text-slate-500 font-medium">
                💡 <strong>Consejo Patitas del Sur:</strong> Enviar el recordatorio con 4 días de anticipación aumenta la tasa de recompra recurrente en un <strong>42%</strong>.
              </span>
              <button
                type="button"
                onClick={() => setIsReplenishmentModalOpen(false)}
                className="px-5 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-extrabold text-xs transition-colors cursor-pointer"
              >
                Cerrar Planificador
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================= */}
      {/* POP-UP: VISTA PREVIA DEL PRODUCTO CON FOTO REAL         */}
      {/* ======================================================= */}
      {selectedProductPreview && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Pop-up Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-[#0E8388]/10 text-[#0E8388] border border-[#0E8388]/20">
                  <Package className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">Detalle Visual del Producto</h3>
                  <p className="text-[11px] text-slate-500 font-mono">Código: {selectedProductPreview.code || 'SKU-PATITAS'}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedProductPreview(null)}
                className="p-2 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Pop-up Content */}
            <div className="p-6 space-y-5">
              {/* Product Image Container */}
              <div className="w-full h-56 rounded-2xl bg-gradient-to-b from-slate-50 to-slate-100/80 border border-slate-200 p-4 flex items-center justify-center relative group overflow-hidden">
                <img
                  src={getProductImage(selectedProductPreview.name)}
                  alt={selectedProductPreview.name}
                  className="max-h-full max-w-full object-contain drop-shadow-md group-hover:scale-105 transition-transform duration-300"
                />
                <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-white/90 backdrop-blur-xs text-[#0E8388] border border-slate-200 shadow-xs">
                  {selectedProductPreview.weight || 'Formato Original'}
                </span>
                <span className="absolute bottom-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-black bg-slate-900/80 text-white backdrop-blur-xs">
                  {selectedProductPreview.quantity} unidad(es) en pedido
                </span>
              </div>

              {/* Product Details */}
              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-[10px] font-extrabold uppercase text-[#0E8388] tracking-wider block">
                    {selectedProductPreview.name.toLowerCase().includes('bravery') ? 'Línea Bravery Super Premium 100% Grain Free' : 'Patitas del Sur Selección Premium'}
                  </span>
                  <h4 className="text-lg font-black text-slate-900 leading-snug">
                    {selectedProductPreview.name}
                  </h4>
                </div>

                <div className="grid grid-cols-2 gap-2.5 pt-1">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-0.5">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Precio Unitario</span>
                    <span className="text-sm font-black text-slate-900">{formatCLP(selectedProductPreview.price)}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-100 space-y-0.5">
                    <span className="text-[10px] text-emerald-700 font-bold uppercase block">Total Ítem</span>
                    <span className="text-sm font-black text-emerald-800">
                      {formatCLP((selectedProductPreview.price || 0) * (selectedProductPreview.quantity || 1))}
                    </span>
                  </div>
                </div>

                {/* Associated Order info if available */}
                {selectedProductPreview.orderId && (
                  <div className="p-3 rounded-2xl bg-blue-50/70 border border-blue-100 space-y-1">
                    <div className="flex items-center justify-between text-blue-900 font-bold text-[11px]">
                      <span>Asociado al Pedido {selectedProductPreview.orderId}</span>
                      <span className="font-mono">{selectedProductPreview.tracking || ''}</span>
                    </div>
                    <div className="text-slate-600 text-[11px]">
                      Tutor: <strong>{selectedProductPreview.customer}</strong> • Mascota: <strong>{selectedProductPreview.petName}</strong>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Pop-up Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setSelectedProductPreview(null)}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#0E8388] to-[#10B981] hover:opacity-95 text-white font-black text-xs shadow-md shadow-[#0E8388]/20 transition-all cursor-pointer text-center"
              >
                Entendido / Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================= */}
      {/* POP-UP: KARDEX & HISTORIAL DE MOVIMIENTOS POR SKU       */}
      {/* ======================================================= */}
      {selectedProductInvoicesModal && (
        <div
          onClick={() => setSelectedProductInvoicesModal(null)}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh] no-scrollbar"
          >
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80 shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-[#0E8388]/10 text-[#0E8388] border border-[#0E8388]/20">
                  <History className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">Kardex & Movimientos de Stock 📦</h3>
                  <p className="text-[11px] text-slate-500 font-mono">
                    SKU: {selectedProductInvoicesModal.sku} • {selectedProductInvoicesModal.format}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedProductInvoicesModal(null)}
                className="p-2 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5 overflow-y-auto no-scrollbar">
              {/* Product Header Strip */}
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                <img
                  src={getProductImage(selectedProductInvoicesModal.name)}
                  alt={selectedProductInvoicesModal.name}
                  className="w-14 h-14 object-contain bg-white rounded-xl border border-slate-200 p-1 shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] uppercase font-bold text-[#0E8388] tracking-wider block">
                    {selectedProductInvoicesModal.brand}
                  </span>
                  <h4 className="font-black text-slate-900 text-sm truncate">
                    {selectedProductInvoicesModal.name}
                  </h4>
                  <div className="flex items-center gap-3 mt-1 text-xs text-slate-500 font-medium">
                    <span>Stock Actual: <strong className="text-slate-900 font-black">{selectedProductInvoicesModal.stock} u.</strong></span>
                    <span>PVP: <strong className="text-slate-900 font-black">{formatCLP(selectedProductInvoicesModal.salePrice)}</strong></span>
                  </div>
                </div>
              </div>

              {/* Invoices List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h5 className="text-xs font-black uppercase text-slate-500 tracking-wider">
                    Historial de Lotes y Entradas Registradas ({(selectedProductInvoicesModal.invoices || []).length || 1})
                  </h5>
                  <span className="text-[11px] text-emerald-700 font-bold">✓ Trazabilidad en Bodega</span>
                </div>

                <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-xs">
                  {(
                    selectedProductInvoicesModal.invoices || [
                      {
                        invoiceNumber: selectedProductInvoicesModal.invoiceNumber,
                        invoiceDate: selectedProductInvoicesModal.invoiceDate,
                        provider: selectedProductInvoicesModal.provider,
                        providerRut: selectedProductInvoicesModal.providerRut,
                        quantity: selectedProductInvoicesModal.stock,
                        unitCostNeto: selectedProductInvoicesModal.unitCostNeto,
                      },
                    ]
                  ).map((inv, idx) => (
                    <div key={idx} className="p-4 hover:bg-slate-50/80 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-blue-100 text-blue-900 font-mono font-black text-xs">
                            <FileText className="w-3 h-3 text-blue-700" />
                            <span>{inv.invoiceNumber}</span>
                          </span>
                          <span className="text-[11px] text-slate-400 font-medium">{inv.invoiceDate || 'Reciente'}</span>
                        </div>
                        <div className="font-bold text-slate-800">{inv.provider}</div>
                        <div className="text-[10px] text-slate-400 font-mono">RUT: {inv.providerRut || '76.452.190-3'}</div>
                      </div>

                      <div className="sm:text-right space-y-0.5 bg-slate-50 sm:bg-transparent p-2 sm:p-0 rounded-xl">
                        <div className="text-slate-500 text-[11px]">
                          Unidades recibidas: <strong className="text-slate-900 font-black">{inv.quantity || 10} u.</strong>
                        </div>
                        <div className="text-slate-500 text-[11px]">
                          Costo Unit. Neto: <strong className="text-slate-900 font-black">{formatCLP(inv.unitCostNeto || selectedProductInvoicesModal.unitCostNeto)}</strong>
                        </div>
                        <div className="text-[10px] text-emerald-700 font-bold">
                          Subtotal Lote: {formatCLP((inv.quantity || 10) * (inv.unitCostNeto || selectedProductInvoicesModal.unitCostNeto))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3 shrink-0">
              <button
                type="button"
                onClick={() => {
                  const prod = selectedProductInvoicesModal;
                  setSelectedProductInvoicesModal(null);
                  setStockAdjustModal({
                    prod,
                    type: 'sumar',
                    amount: 1,
                    reason: 'Ajuste manual / Conteo',
                  });
                }}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>Ajustar Stock de este Producto</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedProductInvoicesModal(null)}
                className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs cursor-pointer transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================= */}
      {/* POP-UP: DETALLE DE VENTAS Y GRÁFICOS POR PRODUCTO       */}
      {/* ======================================================= */}
      {selectedProductSalesModal && (() => {
        const prod = selectedProductSalesModal;
        const analytics = getProductSalesAnalytics(prod);
        if (!analytics) return null;

        const currentChartData =
          productSalesPeriod === '7d'
            ? analytics.days7
            : productSalesPeriod === '30d'
            ? analytics.weeks30
            : analytics.months12;

        const maxUnits = Math.max(...currentChartData.map((d) => d.units), 1);
        const periodTotalUnits = currentChartData.reduce((acc, d) => acc + d.units, 0);
        const periodTotalRevenue = currentChartData.reduce((acc, d) => acc + d.revenue, 0);
        const periodTotalMargin = currentChartData.reduce((acc, d) => acc + d.margin, 0);

        return (
          <div
            onClick={() => setSelectedProductSalesModal(null)}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-in fade-in duration-200"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl max-w-4xl w-full border border-slate-200 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[92vh] no-scrollbar"
            >
              {/* Modal Header */}
              <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-50 via-teal-50/30 to-white shrink-0">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 p-1.5 shadow-xs shrink-0 flex items-center justify-center">
                    <img
                      src={getProductImage(prod.name)}
                      alt={prod.name}
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-md bg-[#0E8388]/10 text-[#0E8388] font-black text-[10px] uppercase tracking-wider border border-[#0E8388]/20">
                        {prod.brand}
                      </span>
                      <span className="text-[11px] font-mono text-slate-400">
                        SKU: {prod.sku} • {prod.format}
                      </span>
                      {prod.isPaused && (
                        <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 text-[10px] font-black uppercase border border-amber-200 inline-flex items-center gap-1">
                          <Pause className="w-2.5 h-2.5 fill-current" />
                          <span>Pausado en tienda</span>
                        </span>
                      )}
                    </div>
                    <h3 className="text-base sm:text-lg font-black text-slate-900 leading-snug mt-0.5">
                      {prod.name}
                    </h3>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedProductSalesModal(null)}
                    className="p-2 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                    title="Cerrar ventana"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Modal Body */}
              <div className="p-5 sm:p-6 overflow-y-auto space-y-6 no-scrollbar text-xs">
                {/* 4 KPI Highlights */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {/* KPI 1: Unidades vendidas */}
                  <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5 space-y-1">
                    <div className="flex items-center justify-between text-slate-400">
                      <span className="text-[10px] font-bold uppercase tracking-wider">Unidades Vendidas</span>
                      <ShoppingBag className="w-4 h-4 text-[#0E8388]" />
                    </div>
                    <div className="text-xl font-black text-slate-900">
                      {analytics.totalUnitsSold} <span className="text-xs font-bold text-slate-500">u.</span>
                    </div>
                    <div className="text-[10px] text-slate-500 font-medium">
                      Promedio: <strong className="text-slate-700">{analytics.monthlyAverageUnits} u./mes</strong>
                    </div>
                  </div>

                  {/* KPI 2: Facturación Total */}
                  <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5 space-y-1">
                    <div className="flex items-center justify-between text-slate-400">
                      <span className="text-[10px] font-bold uppercase tracking-wider">Facturación Total</span>
                      <DollarSign className="w-4 h-4 text-emerald-600" />
                    </div>
                    <div className="text-xl font-black text-emerald-600">
                      {formatCLP(analytics.totalRevenue)}
                    </div>
                    <div className="text-[10px] text-slate-500 font-medium">
                      PVP Unitario: <strong className="text-slate-700">{formatCLP(prod.salePrice)}</strong>
                    </div>
                  </div>

                  {/* KPI 3: Margen Bruto */}
                  <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5 space-y-1">
                    <div className="flex items-center justify-between text-slate-400">
                      <span className="text-[10px] font-bold uppercase tracking-wider">Margen Bruto Total</span>
                      <TrendingUp className="w-4 h-4 text-[#0E8388]" />
                    </div>
                    <div className="text-xl font-black text-slate-900">
                      {formatCLP(analytics.totalMargin)}
                    </div>
                    <div className="text-[10px] font-medium text-emerald-700">
                      Margen: <strong className="font-extrabold">+{analytics.marginPercent}%</strong> por unidad
                    </div>
                  </div>

                  {/* KPI 4: Stock & Cobertura */}
                  <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5 space-y-1">
                    <div className="flex items-center justify-between text-slate-400">
                      <span className="text-[10px] font-bold uppercase tracking-wider">Stock & Cobertura</span>
                      <Package className="w-4 h-4 text-amber-500" />
                    </div>
                    <div className="text-xl font-black text-slate-900">
                      {prod.stock} <span className="text-xs font-bold text-slate-500">en bodega</span>
                    </div>
                    <div className="text-[10px] text-slate-500 font-medium">
                      Cobertura estimada: <strong className="text-slate-700">{analytics.stockCoverageDays} días</strong>
                    </div>
                  </div>
                </div>

                {/* Section: Gráfico interactivo de Ventas */}
                <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-xs space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <BarChart3 className="w-4 h-4 text-[#0E8388]" />
                        <h4 className="font-black text-slate-900 text-sm">
                          Gráfico de Ventas & Evolución Histórica
                        </h4>
                      </div>
                      <p className="text-[11px] text-slate-500">
                        {productSalesPeriod === '7d'
                          ? 'Ventas diarias de los últimos 7 días con desglose por jornada.'
                          : productSalesPeriod === '30d'
                          ? 'Ventas semanales del último mes de facturación.'
                          : 'Ventas mes a mes durante los últimos 12 meses.'}
                      </p>
                    </div>

                    {/* Selector de periodo */}
                    <div className="inline-flex items-center p-1 bg-slate-100 rounded-2xl border border-slate-200 shrink-0 self-start sm:self-auto">
                      <button
                        type="button"
                        onClick={() => setProductSalesPeriod('7d')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          productSalesPeriod === '7d'
                            ? 'bg-white text-slate-900 shadow-xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        7 Días (Diario)
                      </button>
                      <button
                        type="button"
                        onClick={() => setProductSalesPeriod('30d')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          productSalesPeriod === '30d'
                            ? 'bg-white text-slate-900 shadow-xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        30 Días (Semanas)
                      </button>
                      <button
                        type="button"
                        onClick={() => setProductSalesPeriod('mes')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          productSalesPeriod === 'mes'
                            ? 'bg-white text-slate-900 shadow-xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        12 Meses
                      </button>
                    </div>
                  </div>

                  {/* Summary row for selected period */}
                  <div className="grid grid-cols-3 gap-2 bg-slate-50/80 p-3 rounded-2xl border border-slate-100 text-center">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Unidades Periodo</span>
                      <span className="text-sm font-black text-slate-900">{periodTotalUnits} u.</span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Facturación Periodo</span>
                      <span className="text-sm font-black text-emerald-600">{formatCLP(periodTotalRevenue)}</span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Ganancia Bruta</span>
                      <span className="text-sm font-black text-[#0E8388]">{formatCLP(periodTotalMargin)}</span>
                    </div>
                  </div>

                  {/* Visual Line Chart (Gráfico de Líneas con Curva Suave, Área y Tooltips) */}
                  <div className="pt-2 pb-1">
                    {(() => {
                      const chartWidth = 720;
                      const chartHeight = 180;
                      const padX = 42;
                      const padTop = 32;
                      const padBottom = 26;
                      const availableWidth = chartWidth - padX * 2;
                      const availableHeight = chartHeight - padTop - padBottom;

                      const pts = currentChartData.map((item, idx) => {
                        const x =
                          currentChartData.length > 1
                            ? padX + (idx / (currentChartData.length - 1)) * availableWidth
                            : chartWidth / 2;
                        const normalizedValue = maxUnits > 0 ? item.units / maxUnits : 0;
                        const y = chartHeight - padBottom - normalizedValue * availableHeight;
                        return { x, y, item, idx };
                      });

                      // Generar curva suave bezier (spline)
                      let linePath = '';
                      if (pts.length === 1) {
                        linePath = `M ${pts[0].x - 30},${pts[0].y} L ${pts[0].x + 30},${pts[0].y}`;
                      } else if (pts.length > 1) {
                        linePath = `M ${pts[0].x},${pts[0].y}`;
                        for (let i = 0; i < pts.length - 1; i++) {
                          const p0 = i > 0 ? pts[i - 1] : pts[i];
                          const p1 = pts[i];
                          const p2 = pts[i + 1];
                          const p3 = i < pts.length - 2 ? pts[i + 2] : p2;
                          const cp1x = p1.x + (p2.x - p0.x) / 6;
                          const cp1y = p1.y + (p2.y - p0.y) / 6;
                          const cp2x = p2.x - (p3.x - p1.x) / 6;
                          const cp2y = p2.y - (p3.y - p1.y) / 6;
                          linePath += ` C ${cp1x.toFixed(1)},${cp1y.toFixed(1)} ${cp2x.toFixed(1)},${cp2y.toFixed(1)} ${p2.x.toFixed(1)},${p2.y.toFixed(1)}`;
                        }
                      }

                      const areaPath =
                        pts.length > 1
                          ? `${linePath} L ${pts[pts.length - 1].x},${chartHeight - padBottom + 10} L ${pts[0].x},${chartHeight - padBottom + 10} Z`
                          : '';

                      return (
                        <div className="relative w-full">
                          <svg
                            viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                            className="w-full h-48 overflow-visible"
                            preserveAspectRatio="none"
                          >
                            <defs>
                              <linearGradient id="lineSalesGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#0E8388" stopOpacity="0.28" />
                                <stop offset="70%" stopColor="#0E8388" stopOpacity="0.05" />
                                <stop offset="100%" stopColor="#0E8388" stopOpacity="0" />
                              </linearGradient>
                              <linearGradient id="strokeLineGradient" x1="0" y1="0" x2="1" y2="0">
                                <stop offset="0%" stopColor="#0E8388" />
                                <stop offset="50%" stopColor="#2DD4BF" />
                                <stop offset="100%" stopColor="#0E8388" />
                              </linearGradient>
                              <filter id="pointShadow" x="-50%" y="-50%" width="200%" height="200%">
                                <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#0E8388" floodOpacity="0.35" />
                              </filter>
                            </defs>

                            {/* Líneas horizontales de guía (Grid lines) */}
                            <line
                              x1={padX - 10}
                              y1={padTop}
                              x2={chartWidth - padX + 10}
                              y2={padTop}
                              stroke="#F1F5F9"
                              strokeWidth="1.5"
                              strokeDasharray="4 4"
                            />
                            <line
                              x1={padX - 10}
                              y1={padTop + availableHeight / 2}
                              x2={chartWidth - padX + 10}
                              y2={padTop + availableHeight / 2}
                              stroke="#F1F5F9"
                              strokeWidth="1.5"
                              strokeDasharray="4 4"
                            />
                            <line
                              x1={padX - 10}
                              y1={chartHeight - padBottom}
                              x2={chartWidth - padX + 10}
                              y2={chartHeight - padBottom}
                              stroke="#E2E8F0"
                              strokeWidth="1.5"
                            />

                            {/* Área con gradiente suave bajo la línea */}
                            {areaPath && (
                              <path
                                d={areaPath}
                                fill="url(#lineSalesGradient)"
                              />
                            )}

                            {/* Línea de tendencia continua */}
                            {linePath && (
                              <path
                                d={linePath}
                                fill="none"
                                stroke="url(#strokeLineGradient)"
                                strokeWidth="3.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            )}

                            {/* Puntos de datos y Tooltips */}
                            {pts.map((pt, idx) => (
                              <g key={idx} className="group/pt cursor-pointer">
                                {/* Zona táctil / hover invisible amplia */}
                                <circle
                                  cx={pt.x}
                                  cy={pt.y}
                                  r="20"
                                  fill="transparent"
                                />

                                {/* Línea vertical guía en hover */}
                                <line
                                  x1={pt.x}
                                  y1={pt.y}
                                  x2={pt.x}
                                  y2={chartHeight - padBottom}
                                  stroke="#0E8388"
                                  strokeWidth="1.5"
                                  strokeDasharray="3 3"
                                  className="opacity-0 group-hover/pt:opacity-70 transition-opacity"
                                />

                                {/* Punto externo brillante */}
                                <circle
                                  cx={pt.x}
                                  cy={pt.y}
                                  r="5.5"
                                  fill="#FFFFFF"
                                  stroke="#0E8388"
                                  strokeWidth="3"
                                  filter="url(#pointShadow)"
                                  className="group-hover/pt:scale-125 transition-transform origin-center"
                                />

                                {/* Punto central */}
                                <circle
                                  cx={pt.x}
                                  cy={pt.y}
                                  r="2"
                                  fill="#0E8388"
                                />

                                {/* Valor numérico permanente encima del punto */}
                                <text
                                  x={pt.x}
                                  y={pt.y - 11}
                                  textAnchor="middle"
                                  className="text-[10px] font-black fill-slate-700 select-none group-hover/pt:fill-[#0E8388]"
                                >
                                  {pt.item.units}
                                </text>

                                {/* Tooltip Flotante al pasar el mouse */}
                                <g className="opacity-0 group-hover/pt:opacity-100 transition-opacity pointer-events-none z-30">
                                  <rect
                                    x={Math.max(10, Math.min(chartWidth - 140, pt.x - 65))}
                                    y={Math.max(5, pt.y - 65)}
                                    width="130"
                                    height="48"
                                    rx="10"
                                    fill="#0F172A"
                                    opacity="0.95"
                                    stroke="#334155"
                                    strokeWidth="1"
                                    filter="url(#pointShadow)"
                                  />
                                  <text
                                    x={Math.max(10, Math.min(chartWidth - 140, pt.x - 65)) + 65}
                                    y={Math.max(5, pt.y - 65) + 16}
                                    textAnchor="middle"
                                    fill="#5EEAD4"
                                    fontSize="10"
                                    fontWeight="bold"
                                  >
                                    {pt.item.label}
                                  </text>
                                  <text
                                    x={Math.max(10, Math.min(chartWidth - 140, pt.x - 65)) + 65}
                                    y={Math.max(5, pt.y - 65) + 30}
                                    textAnchor="middle"
                                    fill="#FFFFFF"
                                    fontSize="10"
                                    fontWeight="bold"
                                  >
                                    {pt.item.units} u. • {formatCLP(pt.item.revenue)}
                                  </text>
                                  <text
                                    x={Math.max(10, Math.min(chartWidth - 140, pt.x - 65)) + 65}
                                    y={Math.max(5, pt.y - 65) + 42}
                                    textAnchor="middle"
                                    fill="#34D399"
                                    fontSize="9"
                                    fontWeight="semibold"
                                  >
                                    Margen: {formatCLP(pt.item.margin)}
                                  </text>
                                </g>
                              </g>
                            ))}
                          </svg>

                          {/* Eje X con nombres de días / semanas / meses */}
                          <div className="flex items-center justify-between px-3 sm:px-6 pt-1 text-[11px] font-bold text-slate-500">
                            {currentChartData.map((d, i) => (
                              <span
                                key={i}
                                className="truncate text-center hover:text-[#0E8388] transition-colors"
                                style={{
                                  width: `${100 / currentChartData.length}%`,
                                }}
                              >
                                {d.day}
                              </span>
                            ))}
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>

                {/* Section: Pedidos Recientes de este Producto */}
                <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-xs space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-[#0E8388]" />
                      <h4 className="font-black text-slate-900 text-sm">
                        Últimos Pedidos con este Producto ({analytics.recentOrders.length})
                      </h4>
                    </div>
                    <span className="text-[11px] text-slate-400 font-medium">
                      Trazabilidad por cliente y despacho
                    </span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-slate-100 text-slate-400 text-[10px] uppercase font-bold tracking-wider">
                          <th className="py-2.5 px-3">Pedido</th>
                          <th className="py-2.5 px-3">Fecha</th>
                          <th className="py-2.5 px-3">Cliente & Mascota</th>
                          <th className="py-2.5 px-3 text-center">Cantidad</th>
                          <th className="py-2.5 px-3">Total CLP</th>
                          <th className="py-2.5 px-3">Método Pago</th>
                          <th className="py-2.5 px-3 text-center">Estado</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {analytics.recentOrders.map((ord) => (
                          <tr key={ord.id} className="hover:bg-slate-50/80 transition-colors">
                            <td className="py-2.5 px-3 font-mono font-bold text-slate-900">
                              {ord.id}
                            </td>
                            <td className="py-2.5 px-3 text-slate-500">
                              {ord.date}
                            </td>
                            <td className="py-2.5 px-3">
                              <div className="font-bold text-slate-800">{ord.customer}</div>
                              <div className="text-[10px] text-slate-400">{ord.pet}</div>
                            </td>
                            <td className="py-2.5 px-3 text-center font-black text-slate-900">
                              {ord.units} u.
                            </td>
                            <td className="py-2.5 px-3 font-black text-emerald-600 font-mono">
                              {formatCLP(ord.total)}
                            </td>
                            <td className="py-2.5 px-3 text-slate-600">
                              <span className="inline-block px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-medium">
                                {ord.paymentMethod}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-center">
                              {ord.status === 'entregado' ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                                  <CheckCircle2 className="w-3 h-3" />
                                  Entregado
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-bold">
                                  <Truck className="w-3 h-3" />
                                  En camino
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
                <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                  <span>Métricas actualizadas automáticamente con cada venta de la tienda y pedidos registrados.</span>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <button
                    type="button"
                    onClick={() => {
                      const p = prod;
                      setSelectedProductSalesModal(null);
                      setStockAdjustModal({
                        prod: p,
                        type: 'sumar',
                        amount: 1,
                        reason: 'Ajuste manual desde analítica de ventas',
                      });
                    }}
                    className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <SlidersHorizontal className="w-3.5 h-3.5" />
                    <span>Ajustar Stock</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedProductSalesModal(null)}
                    className="px-5 py-2 rounded-xl bg-[#0E8388] hover:bg-[#2E4F4F] text-white font-bold text-xs transition-colors shadow-xs cursor-pointer"
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ======================================================= */}
      {/* POP-UP: EDITAR PRODUCTO                                 */}
      {/* ======================================================= */}
      {editingProduct && (
        <div
          onClick={() => setEditingProduct(null)}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl max-w-xl w-full border border-slate-200 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh] no-scrollbar"
          >
            {/* Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80 shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-[#0E8388]/10 text-[#0E8388] border border-[#0E8388]/20">
                  <Edit2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">Editar Producto 📝</h3>
                  <p className="text-[11px] text-slate-500 font-mono">
                    SKU: {editingProduct.sku} • {editingProduct.brand}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingProduct(null)}
                className="p-2 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveEditProduct} className="p-6 space-y-4 overflow-y-auto text-xs no-scrollbar">
              {/* Nombre del Producto */}
              <div>
                <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">
                  Nombre del Producto *
                </label>
                <input
                  type="text"
                  required
                  value={editingProduct.name}
                  onChange={(e) => setEditingProduct((prev) => ({ ...prev, name: e.target.value }))}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-900 focus:bg-white focus:border-[#0E8388] focus:outline-none"
                />
              </div>

              {/* Mascota, Marca & Categoría */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">
                    Mascota
                  </label>
                  <select
                    value={editingProduct.petType || 'perros'}
                    onChange={(e) => setEditingProduct((prev) => ({ ...prev, petType: e.target.value }))}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-900 focus:bg-white focus:border-[#0E8388] focus:outline-none cursor-pointer"
                  >
                    <option value="perros">🐶 Perros</option>
                    <option value="gatos">🐱 Gatos</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">
                    Marca
                  </label>
                  <input
                    type="text"
                    value={editingProduct.brand || ''}
                    onChange={(e) => setEditingProduct((prev) => ({ ...prev, brand: e.target.value }))}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-900 focus:bg-white focus:border-[#0E8388] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">
                    Categoría
                  </label>
                  <input
                    type="text"
                    value={editingProduct.category || ''}
                    onChange={(e) => setEditingProduct((prev) => ({ ...prev, category: e.target.value }))}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-900 focus:bg-white focus:border-[#0E8388] focus:outline-none"
                  />
                </div>
              </div>

              {/* Formato & SKU */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">
                    Formato / Peso (ej: 12 kg)
                  </label>
                  <input
                    type="text"
                    value={editingProduct.format || ''}
                    onChange={(e) => setEditingProduct((prev) => ({ ...prev, format: e.target.value }))}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-900 focus:bg-white focus:border-[#0E8388] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">
                    Código SKU
                  </label>
                  <input
                    type="text"
                    value={editingProduct.sku || ''}
                    onChange={(e) => setEditingProduct((prev) => ({ ...prev, sku: e.target.value }))}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-mono font-bold text-slate-900 focus:bg-white focus:border-[#0E8388] focus:outline-none"
                  />
                </div>
              </div>

              {/* Costo Neto & Precio Venta (PVP) */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">
                    Costo Neto Unitario ($ CLP)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="100"
                    value={editingProduct.unitCostNeto ?? ''}
                    onChange={(e) => setEditingProduct((prev) => ({ ...prev, unitCostNeto: e.target.value }))}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-mono font-bold text-slate-900 focus:bg-white focus:border-[#0E8388] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">
                    Precio Venta PVP ($ CLP)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="100"
                    value={editingProduct.salePrice ?? ''}
                    onChange={(e) => setEditingProduct((prev) => ({ ...prev, salePrice: e.target.value }))}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-mono font-bold text-slate-900 focus:bg-white focus:border-[#0E8388] focus:outline-none"
                  />
                </div>
              </div>

              {/* Margen Estimado Preview */}
              {Number(editingProduct.salePrice) > 0 && Number(editingProduct.unitCostNeto) > 0 && (
                <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200 flex items-center justify-between text-xs">
                  <span className="text-emerald-800 font-bold">Margen comercial proyectado:</span>
                  <span className="font-mono font-black text-emerald-700 text-sm">
                    +{Math.round(((Number(editingProduct.salePrice) - Number(editingProduct.unitCostNeto)) / Number(editingProduct.salePrice)) * 100)}%
                    <span className="text-[11px] font-medium text-emerald-600 ml-1.5">
                      ({formatCLP(Number(editingProduct.salePrice) - Number(editingProduct.unitCostNeto))} margen bruto)
                    </span>
                  </span>
                </div>
              )}

              {/* Stock Actual & Stock Mínimo */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">
                    Stock Físico en Bodega (u.)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={editingProduct.stock ?? ''}
                    onChange={(e) => setEditingProduct((prev) => ({ ...prev, stock: e.target.value }))}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-mono font-black text-slate-900 focus:bg-white focus:border-[#0E8388] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">
                    Stock Mínimo Crítico (Alerta)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={editingProduct.minStock ?? 5}
                    onChange={(e) => setEditingProduct((prev) => ({ ...prev, minStock: e.target.value }))}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-mono font-bold text-slate-900 focus:bg-white focus:border-[#0E8388] focus:outline-none"
                  />
                </div>
              </div>

              {/* Visibilidad en Tienda Pública (Pausa) */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-900 text-xs">Visibilidad en Tienda Online Pública</div>
                  <div className="text-[11px] text-slate-500">
                    {editingProduct.isPaused
                      ? '⏸️ Producto actualmente oculto en el catálogo público'
                      : '👁️ Producto visible y disponible para compras'}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setEditingProduct((prev) => ({ ...prev, isPaused: !prev.isPaused }))
                  }
                  className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-colors cursor-pointer flex items-center gap-1.5 ${
                    editingProduct.isPaused
                      ? 'bg-amber-100 text-amber-800 border border-amber-300'
                      : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  }`}
                >
                  {editingProduct.isPaused ? (
                    <>
                      <Pause className="w-3.5 h-3.5 fill-current" />
                      <span>Pausado</span>
                    </>
                  ) : (
                    <>
                      <Eye className="w-3.5 h-3.5" />
                      <span>Visible</span>
                    </>
                  )}
                </button>
              </div>

              {/* Botones de acción del Modal */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#0E8388] hover:bg-[#0c7276] text-white font-black shadow-md transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Guardar Cambios</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================= */}
      {/* POP-UP: CONFIRMAR ELIMINACIÓN DE PRODUCTO               */}
      {/* ======================================================= */}
      {deleteProductConfirm && (
        <div
          onClick={() => setDeleteProductConfirm(null)}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl max-w-md w-full border border-slate-200 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 p-6 space-y-5"
          >
            {/* Header / Icon */}
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-rose-100 text-rose-600 border border-rose-200 shrink-0">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900">¿Eliminar Producto?</h3>
                <p className="text-xs text-slate-500">Esta acción quitará el producto del inventario</p>
              </div>
            </div>

            {/* Product Summary */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center gap-3">
              <img
                src={getProductImage(deleteProductConfirm.name)}
                alt={deleteProductConfirm.name}
                className="w-12 h-12 object-contain bg-white rounded-xl border border-slate-200 p-1 shrink-0"
              />
              <div className="min-w-0 flex-1">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  {deleteProductConfirm.brand} • {deleteProductConfirm.format}
                </div>
                <div className="font-black text-slate-900 text-xs truncate">
                  {deleteProductConfirm.name}
                </div>
                <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                  SKU: {deleteProductConfirm.sku} • Stock: {deleteProductConfirm.stock} u.
                </div>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              El producto será eliminado de la bodega y ya no estará disponible en el catálogo de la tienda online pública.
            </p>

            {/* Action buttons */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setDeleteProductConfirm(null)}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteProduct}
                className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs shadow-md transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Sí, Eliminar Producto</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================= */}
      {/* POP-UP: CONFIGURACIÓN DE MERCADO PAGO                   */}
      {/* ======================================================= */}
      {isMercadoPagoModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-blue-50/80">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-blue-600 text-white shadow-xs">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">Configuración de Mercado Pago</h3>
                  <p className="text-[11px] text-slate-500 font-medium">
                    Ajusta los cobros por venta con tarjeta y botón de pago
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsMercadoPagoModalOpen(false)}
                className="p-2 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setIsMercadoPagoModalOpen(false);
                showToast(`Parámetros de Mercado Pago actualizados (${mercadoPagoConfig.commissionRatePercent}% + $${mercadoPagoConfig.fixedFeeCLP} CLP).`);
              }}
              className="p-6 space-y-4 text-xs"
            >
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1.5">
                    Comisión Variable (%)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max="15"
                      value={mercadoPagoConfig.commissionRatePercent}
                      onChange={(e) =>
                        setMercadoPagoConfig((prev) => ({
                          ...prev,
                          commissionRatePercent: parseFloat(e.target.value) || 0,
                        }))
                      }
                      className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-mono font-bold text-slate-900 focus:bg-white focus:border-[#0E8388] focus:outline-none"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">%</span>
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1 block">Estándar Chile: 3.19%</span>
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1.5">
                    Costo Fijo por Cobro ($ CLP)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="10"
                      min="0"
                      value={mercadoPagoConfig.fixedFeeCLP}
                      onChange={(e) =>
                        setMercadoPagoConfig((prev) => ({
                          ...prev,
                          fixedFeeCLP: parseInt(e.target.value, 10) || 0,
                        }))
                      }
                      className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-mono font-bold text-slate-900 focus:bg-white focus:border-[#0E8388] focus:outline-none"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">CLP</span>
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1 block">Cargo fijo por transacción</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1.5">
                    IVA sobre Comisión (%)
                  </label>
                  <input
                    type="number"
                    value={mercadoPagoConfig.ivaPercent}
                    onChange={(e) =>
                      setMercadoPagoConfig((prev) => ({
                        ...prev,
                        ivaPercent: parseInt(e.target.value, 10) || 19,
                      }))
                    }
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-mono font-bold text-slate-900 focus:bg-white focus:border-[#0E8388] focus:outline-none"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">19% IVA tributario Chile</span>
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1.5">
                    Plazo de Acreditación
                  </label>
                  <select
                    value={mercadoPagoConfig.payoutSchedule}
                    onChange={(e) =>
                      setMercadoPagoConfig((prev) => ({
                        ...prev,
                        payoutSchedule: e.target.value,
                      }))
                    }
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-900 focus:bg-white focus:border-[#0E8388] focus:outline-none cursor-pointer"
                  >
                    <option value="instant">Inmediata (Recomendado)</option>
                    <option value="14_days">14 Días (Menor comisión)</option>
                    <option value="30_days">30 Días</option>
                  </select>
                  <span className="text-[10px] text-slate-400 mt-1 block">Disponibilidad en cuenta</span>
                </div>
              </div>

              {/* Simulation Box */}
              <div className="p-3.5 rounded-2xl bg-blue-50/70 border border-blue-100 space-y-1.5">
                <div className="text-[11px] font-bold text-blue-900 flex items-center justify-between">
                  <span>Simulación en una venta de $45.000 CLP:</span>
                  <span className="font-mono text-emerald-700">
                    Neto a recibir: {formatCLP(45000 - Math.round(((45000 * (mercadoPagoConfig.commissionRatePercent / 100)) + (mercadoPagoConfig.fixedFeeCLP || 0)) * (1 + (mercadoPagoConfig.ivaPercent || 19) / 100)))}
                  </span>
                </div>
                <div className="text-[10px] text-slate-600 space-y-0.5">
                  <div>• Comisión variable: -{formatCLP(Math.round(45000 * (mercadoPagoConfig.commissionRatePercent / 100)))}</div>
                  <div>• Cargo fijo: -{formatCLP(mercadoPagoConfig.fixedFeeCLP || 0)}</div>
                  <div>• Total retenido con IVA: -{formatCLP(Math.round(((45000 * (mercadoPagoConfig.commissionRatePercent / 100)) + (mercadoPagoConfig.fixedFeeCLP || 0)) * (1 + (mercadoPagoConfig.ivaPercent || 19) / 100)))}</div>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsMercadoPagoModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black shadow-md shadow-blue-600/20 transition-all cursor-pointer"
                >
                  Guardar Configuración
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================= */}
      {/* POP-UP: REGISTRAR NUEVO GASTO / BOLETA OPERACIONAL      */}
      {/* ======================================================= */}
      {isAddExpenseModalOpen && (() => {
        const modalExpAmount = parseInt(newExpenseForm.amount, 10) || 0;
        const isFactura = newExpenseForm.documentType === 'factura';
        const expNeto = isFactura ? Math.round(modalExpAmount / 1.19) : modalExpAmount;
        const expIva = isFactura ? modalExpAmount - expNeto : 0;

        return (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
              {/* Modal Header */}
              <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-2xl bg-amber-500 text-white shadow-xs">
                    <Receipt className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900">Registrar Gasto Operacional</h3>
                    <p className="text-[11px] text-slate-500 font-medium">
                      Notaría, combustible, packaging, arriendos o trámites legales
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAddExpenseModalOpen(false)}
                  className="p-2 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Form */}
              <form onSubmit={handleSaveNewExpense} className="p-6 space-y-4 text-xs">
                {/* Tipo de Documento: Factura vs Boleta */}
                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1.5">
                    Tipo de Comprobante Tributario
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setNewExpenseForm((prev) => ({ ...prev, documentType: 'factura' }))}
                      className={`py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 border transition-all cursor-pointer ${
                        newExpenseForm.documentType === 'factura'
                          ? 'bg-emerald-50 border-emerald-500 text-emerald-900 ring-1 ring-emerald-500'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <span>🧾</span>
                      <span>Factura (IVA Crédito 19%)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewExpenseForm((prev) => ({ ...prev, documentType: 'boleta' }))}
                      className={`py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 border transition-all cursor-pointer ${
                        newExpenseForm.documentType === 'boleta'
                          ? 'bg-amber-50 border-amber-500 text-amber-900 ring-1 ring-amber-500'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <span>🎫</span>
                      <span>Boleta / Recibo simple</span>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1.5">
                    Categoría del Gasto
                  </label>
                  <select
                    value={newExpenseForm.category}
                    onChange={(e) =>
                      setNewExpenseForm((prev) => ({
                        ...prev,
                        category: e.target.value,
                      }))
                    }
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-900 focus:bg-white focus:border-[#0E8388] focus:outline-none cursor-pointer"
                  >
                    <option value="notaria">⚖️ Notaría, Trámites Legales & Constitución SpA</option>
                    <option value="combustible">⛽ Combustible & Bencina de Reparto</option>
                    <option value="packaging">📦 Packaging, Cajas & Bolsas Kraft</option>
                    <option value="fijo">🏬 Arriendo Bodega & Gastos Fijos</option>
                    <option value="mantenimiento">🔧 Mantenimiento de Vehículo</option>
                    <option value="servicios">📶 Servicios Básicos & Conectividad</option>
                    <option value="otros">💼 Otros Gastos Operativos</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1.5">
                    Descripción del Gasto
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: Trámite Notarial poderes bancarios SpA / Carga Bencina 95"
                    value={newExpenseForm.description}
                    onChange={(e) =>
                      setNewExpenseForm((prev) => ({ ...prev, description: e.target.value }))
                    }
                    required
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-900 focus:bg-white focus:border-[#0E8388] focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1.5">
                      Proveedor / Comercio
                    </label>
                    <input
                      type="text"
                      placeholder="Ej: Notaría Pública Puerto Varas / Copec"
                      value={newExpenseForm.provider}
                      onChange={(e) =>
                        setNewExpenseForm((prev) => ({ ...prev, provider: e.target.value }))
                      }
                      className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-medium text-slate-900 focus:bg-white focus:border-[#0E8388] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1.5">
                      N° Boleta / Factura
                    </label>
                    <input
                      type="text"
                      placeholder={isFactura ? 'FAC-PAC-1902' : 'BOL-COP-8910'}
                      value={newExpenseForm.documentNumber}
                      onChange={(e) =>
                        setNewExpenseForm((prev) => ({ ...prev, documentNumber: e.target.value }))
                      }
                      className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-mono font-bold text-slate-900 focus:bg-white focus:border-[#0E8388] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1.5">
                      Fecha del Gasto
                    </label>
                    <input
                      type="date"
                      value={newExpenseForm.date}
                      onChange={(e) =>
                        setNewExpenseForm((prev) => ({ ...prev, date: e.target.value }))
                      }
                      className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-900 focus:bg-white focus:border-[#0E8388] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1.5">
                      Monto Total ($ CLP)
                    </label>
                    <input
                      type="number"
                      step="500"
                      min="1"
                      placeholder="Ej: 35000"
                      value={newExpenseForm.amount}
                      onChange={(e) =>
                        setNewExpenseForm((prev) => ({ ...prev, amount: e.target.value }))
                      }
                      required
                      className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-mono font-black text-slate-900 focus:bg-white focus:border-[#0E8388] focus:outline-none"
                    />
                  </div>
                </div>

                {/* Live Tax Insight Card */}
                <div
                  className={`p-3.5 rounded-2xl border text-xs space-y-1.5 ${
                    isFactura
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                      : 'bg-amber-50/80 border-amber-200 text-amber-900'
                  }`}
                >
                  <div className="flex items-center justify-between font-bold">
                    <span>
                      {isFactura ? '🛡️ Comprobante con IVA Crédito Fiscal:' : 'ℹ️ Comprobante sin IVA Crédito:'}
                    </span>
                    <span className="font-mono font-black">
                      {isFactura ? `+${formatCLP(expIva)} Ahorrado` : 'Sin crédito fiscal'}
                    </span>
                  </div>
                  <p className="text-[11px] leading-relaxed opacity-90">
                    {isFactura
                      ? `Al ser factura formal, el monto neto es de ${formatCLP(expNeto)} y descuentas ${formatCLP(expIva)} de IVA en el F29 ante el SII.`
                      : `Las boletas o recibos pasan como gasto operacional (${formatCLP(modalExpAmount)}), pero no descuentan IVA en la declaración mensual.`}
                  </p>
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1.5">
                    Medio de Pago Utilizado
                  </label>
                  <select
                    value={newExpenseForm.paymentMethod}
                    onChange={(e) =>
                      setNewExpenseForm((prev) => ({ ...prev, paymentMethod: e.target.value }))
                    }
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-900 focus:bg-white focus:border-[#0E8388] focus:outline-none cursor-pointer"
                  >
                    <option value="Tarjeta Débito Banco Santander">Tarjeta Débito Banco Santander</option>
                    <option value="Tarjeta Crédito">Tarjeta de Crédito</option>
                    <option value="Transferencia Bancaria BCI">Transferencia Bancaria BCI</option>
                    <option value="Efectivo Caja Chica">Efectivo Caja Chica</option>
                  </select>
                </div>

                {/* Modal Actions */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setIsAddExpenseModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition-colors cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-black shadow-md transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Guardar Gasto en Finanzas</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        );
      })()}
      {/* ======================================================= */}
      {/* NATIVE iOS STYLE MOBILE BOTTOM NAVIGATION BAR            */}
      {/* ======================================================= */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/90 backdrop-blur-xl border-t border-slate-200/90 shadow-[0_-4px_25px_rgba(0,0,0,0.08)] px-8 pt-2 pb-safe flex items-center justify-between h-18 select-none">
        
        {/* Tab 1: Dashboard */}
        <button
          type="button"
          onClick={() => setActiveTab('dashboard')}
          className={`flex flex-col items-center justify-center gap-1 transition-all cursor-pointer w-20 ${
            activeTab === 'dashboard'
              ? 'text-[#0E8388] font-black scale-105'
              : 'text-slate-400 hover:text-slate-600 font-bold'
          }`}
        >
          <LayoutDashboard className="w-5 h-5" />
          <span className="text-[11px] tracking-tight">Dashboard</span>
        </button>

        {/* Central Button: Big '+' to enter a new manual order */}
        <button
          type="button"
          onClick={() => {
            if (manualOrderItems.length === 0 && PRODUCTS.length > 0) {
              setManualOrderItems([
                {
                  productId: PRODUCTS[0].id,
                  name: PRODUCTS[0].name,
                  weight: PRODUCTS[0].weights ? PRODUCTS[0].weights[0] : 'Formato Estándar',
                  price: PRODUCTS[0].price,
                  quantity: 1,
                  image: PRODUCTS[0].image,
                },
              ]);
            }
            setIsAddOrderModalOpen(true);
          }}
          className="-mt-7 w-14 h-14 rounded-full bg-gradient-to-tr from-[#0A3E40] via-[#0E8388] to-[#10B981] text-white shadow-xl shadow-[#0E8388]/30 ring-4 ring-white flex items-center justify-center cursor-pointer active:scale-90 hover:scale-105 transition-all shrink-0"
          title="Ingresar Nuevo Pedido"
        >
          <Plus className="w-7 h-7 stroke-[3]" />
        </button>

        {/* Tab 2: Reparto */}
        <button
          type="button"
          onClick={() => setActiveTab('pedidos')}
          className={`flex flex-col items-center justify-center gap-1 transition-all cursor-pointer w-20 relative ${
            activeTab === 'pedidos' || activeTab === 'despachos'
              ? 'text-[#0E8388] font-black scale-105'
              : 'text-slate-400 hover:text-slate-600 font-bold'
          }`}
        >
          <div className="relative">
            <Truck className="w-5 h-5" />
            {orders.filter((o) => o.status !== 'entregado').length > 0 && (
              <span className="absolute -top-1 -right-2.5 w-4 h-4 rounded-full bg-amber-500 text-white text-[9px] font-black flex items-center justify-center shadow-xs">
                {orders.filter((o) => o.status !== 'entregado').length}
              </span>
            )}
          </div>
          <span className="text-[11px] tracking-tight">Reparto</span>
        </button>

      </nav>

    </div>
  );
}
