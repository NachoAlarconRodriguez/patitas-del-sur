import React, { useState, useRef, useMemo, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import {
  Heart,
  ShoppingBag,
  Store,
  Package,
  Award,
  Clock,
  Sparkles,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Plus,
  Minus,
  Trash2,
  X,
  Check,
  Utensils,
  Stethoscope,
  Syringe,
  Pill,
  UserCheck,
  Search,
  Calendar,
  Filter,
  RotateCcw,
  Truck,
  Dumbbell,
  Scale,
  Layers,
  Bone,
  MapPin,
  Phone,
  Shield,
  BookOpen,
  ArrowLeft,
  ArrowRight,
  FileText,
  User,
  Gift,
  ShoppingCart,
} from 'lucide-react';
import { PRODUCTS, BRANDS } from '../data/mockData';
import { isProductOutOfStock } from '../utils/productVariants';
import ProductCard from '../components/ProductCard';
import PromoCarousel from '../components/PromoCarousel';
import AdvancedFilterPanel from '../components/AdvancedFilterPanel';
import CustomDatePicker from '../components/CustomDatePicker';
import CustomDropdown from '../components/CustomDropdown';
import { WhatsAppIcon } from '../components/OfficialIcons';
import VeterinaryConsultationModal from '../components/VeterinaryConsultationModal';
import AntiparasiticModal from '../components/AntiparasiticModal';
import CustomerProfileModal from '../components/CustomerProfileModal';
import RedeemPointsModal from '../components/RedeemPointsModal';
import CustomerMembershipCard from './customer/CustomerMembershipCard';
import CustomerOrdersTable from './customer/CustomerOrdersTable';
import {
  getLoyaltySettings,
  DEFAULT_LOYALTY_SETTINGS,
} from '../services/loyaltyService.js';
import {
  getCustomerProfile,
  upsertCustomerProfile,
  updateCustomerPoints,
  getCustomerPets,
  addPetToSupabase,
  updatePetInSupabase,
  getCustomerReplenishmentData,
  saveCustomerReplenishmentData,
} from '../services/customersService.js';
import {
  getPetHealthLogs,
  addHealthLogToSupabase,
  createVeterinaryAppointmentInSupabase,
} from '../services/healthLogsService.js';
import {
  fetchOrdersFromSupabase,
  createOrderInSupabase,
  getNextOrderId,
} from '../services/ordersService.js';
import {
  fetchProductsFromSupabase,
} from '../services/productsService.js';
import { supabase } from '../lib/supabase.js';

const KNOWN_BRANDS = [
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

// Helper para extraer la marca y limpiar el nombre del producto en vistas compactas (Opción 1 Apple Eyebrow)
const extractBrandAndCleanName = (product) => {
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
};

/* Carrusel Automático de Productos Destacados con Motions de Transición de Alto Nivel */
function FeaturedProductsCarousel({ pet, currentProduct, catalogProducts, onAddToCart, onSelectProduct, setOrderToastMessage, formatCLP }) {
  const [featuredIndex, setFeaturedIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Computar productos destacados según especie de la mascota (excluyendo el alimento habitual actual)
  const featuredProducts = useMemo(() => {
    const source = (catalogProducts && catalogProducts.length > 0) ? catalogProducts : PRODUCTS;
    const species = pet?.type === 'gato' ? 'gatos' : 'perros';
    const filtered = source.filter(p => {
      const pPetType = (p.petType || p.pet_type || '').toLowerCase();
      const matchSpecies = pPetType.includes(pet?.type === 'gato' ? 'gato' : 'perro') || pPetType === 'ambos' || pPetType === 'todos';
      const isNotPaused = !p.isPaused && !p.is_paused && p.isActive !== false && p.is_active !== false;
      return matchSpecies && p.id !== currentProduct?.id && isNotPaused;
    });
    if (filtered.length < 4) {
      const fallback = source.filter(p => p.id !== currentProduct?.id && !p.isPaused && !p.is_paused);
      return [...filtered, ...fallback].slice(0, 9);
    }
    return filtered.slice(0, 9);
  }, [pet?.type, currentProduct?.id, catalogProducts]);

  // Reiniciar slide al cambiar de mascota
  useEffect(() => {
    setFeaturedIndex(0);
  }, [pet?.id]);

  const maxIndex = Math.max(0, featuredProducts.length - 3);

  // Avance automático con temporizador y pausa al interactuar
  useEffect(() => {
    if (isPaused || maxIndex === 0) return;

    const timer = setInterval(() => {
      setFeaturedIndex(prev => (prev >= maxIndex ? 0 : prev + 1));
    }, 3200);

    return () => clearInterval(timer);
  }, [isPaused, maxIndex]);

  if (!featuredProducts || featuredProducts.length === 0) return null;

  return (
    <div className="pt-2 space-y-2">
      {/* Header del Carrusel: Título, Indicadores de Slide y Controles */}
      <div className="flex items-center justify-between px-0.5">
        <div className="flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-[#0E8388] animate-pulse" />
          <span className="text-[11px] sm:text-xs font-black text-slate-800 tracking-tight">
            Destacados para {pet?.name ? pet.name.split(' ')[0] : 'tu regalón'}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Indicadores en forma de cápsula dinámica */}
          <div className="flex items-center gap-1 mr-0.5">
            {Array.from({ length: maxIndex + 1 }).map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setFeaturedIndex(idx)}
                className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                  featuredIndex === idx
                    ? 'w-3.5 bg-[#0E8388]'
                    : 'w-1.5 bg-slate-200 hover:bg-slate-300'
                }`}
                aria-label={`Slide ${idx + 1}`}
              />
            ))}
          </div>

          {/* Botones de navegación táctil/click */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setFeaturedIndex(prev => prev <= 0 ? maxIndex : prev - 1)}
              className="w-5 h-5 rounded-md bg-white border border-slate-200 hover:border-teal-400 text-slate-500 hover:text-[#0E8388] flex items-center justify-center transition-all cursor-pointer active:scale-90 shadow-2xs"
              title="Anterior"
            >
              <ChevronLeft className="w-3 h-3" />
            </button>
            <button
              type="button"
              onClick={() => setFeaturedIndex(prev => prev >= maxIndex ? 0 : prev + 1)}
              className="w-5 h-5 rounded-md bg-white border border-slate-200 hover:border-teal-400 text-slate-500 hover:text-[#0E8388] flex items-center justify-center transition-all cursor-pointer active:scale-90 shadow-2xs"
              title="Siguiente"
            >
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Viewport del carrusel: 3 cards lado a lado con motion cúbico de alta fidelidad */}
      <div
        className="relative overflow-hidden w-full py-0.5 select-none"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => setIsPaused(false)}
      >
        <div
          className="smooth-carousel-track flex gap-2"
          style={{
            transform: `translateX(calc(-${featuredIndex} * ((100% + 8px) / 3)))`,
          }}
        >
          {featuredProducts.map((prod) => {
            const isOutOfStock = isProductOutOfStock(prod);
            return (
              <div
                key={prod.id}
                onClick={() => onSelectProduct && onSelectProduct(prod)}
                className={`w-[calc((100%-16px)/3)] shrink-0 bg-white border rounded-2xl p-2 sm:p-2.5 flex flex-col justify-between transition-all duration-300 group select-none ${
                  isOutOfStock
                    ? 'border-slate-200/60 opacity-80'
                    : 'border-slate-200/90 hover:border-[#0E8388]/60 shadow-2xs hover:shadow-md cursor-pointer active:scale-[0.98]'
                }`}
              >
                {/* Tag / Badge */}
                <div className="flex items-center justify-between mb-1">
                  {isOutOfStock ? (
                    <span className="text-[9px] font-extrabold text-rose-700 bg-rose-50 border border-rose-200 px-1.5 py-0.5 rounded-md truncate max-w-full">
                      Agotado
                    </span>
                  ) : (
                    <span className="text-[9px] font-extrabold text-[#0E8388] bg-teal-50 px-1.5 py-0.5 rounded-md truncate max-w-full">
                      {prod.badge || prod.brand || 'Destacado'}
                    </span>
                  )}
                </div>

                {/* Imagen centrada */}
                <div className="w-full h-14 sm:h-16 rounded-xl bg-slate-50/70 p-1 flex items-center justify-center my-0.5 overflow-hidden">
                  <img
                    src={prod.image || '/images/hero_dog.png'}
                    alt={prod.name}
                    className={`max-h-full max-w-full object-contain duration-500 ease-out ${
                      isOutOfStock ? 'grayscale-[35%]' : 'group-hover:scale-110 transition-transform'
                    }`}
                    loading="lazy"
                  />
                </div>

                {/* Información y Compra Rápida */}
                <div className="mt-1 space-y-1">
                  <h4
                    className="text-[10.5px] sm:text-xs font-bold text-slate-800 line-clamp-1 leading-tight group-hover:text-[#0E8388] transition-colors"
                    title={prod.name}
                  >
                    {extractBrandAndCleanName(prod).cleanName}
                  </h4>

                  <div className="flex items-center justify-between pt-0.5">
                    <span className="text-[10px] sm:text-[11.5px] font-black text-[#0A3E40] truncate">
                      {formatCLP(prod.price)}
                    </span>
                    <button
                      type="button"
                      disabled={isOutOfStock}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (isOutOfStock) return;
                        const weight = prod.weights?.[0] || '1 unidad';
                        onAddToCart(prod, weight, 1);
                        setOrderToastMessage(`✓ ${prod.name.split(' ')[0]} agregado al carrito`);
                      }}
                      className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all ${
                        isOutOfStock
                          ? 'bg-slate-100 text-slate-300 cursor-not-allowed shadow-none'
                          : 'bg-teal-50 hover:bg-[#0E8388] text-[#0E8388] hover:text-white shadow-2xs active:scale-90 cursor-pointer'
                      }`}
                      title={isOutOfStock ? 'Producto sin stock' : 'Agregar al carrito'}
                    >
                      {isOutOfStock ? <X className="w-3 h-3 text-slate-400" /> : <Plus className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* Card de Selección de Producto para la Despensa Habitual */
function HabitualProductCard({ product, onAdd, formatCLP }) {
  const weights = Array.isArray(product.weights) && product.weights.length > 0
    ? product.weights
    : [product.weight || product.format || 'Formato Estándar'];

  const [selectedWeight, setSelectedWeight] = useState(weights[0]);
  const [quantity, setQuantity] = useState(1);

  // Resolver precio según variante
  const variant = (product.variants || []).find((v) => v.format === selectedWeight || v.weight === selectedWeight);
  const currentPrice = variant && typeof variant.price === 'number' ? variant.price : (product.price || 0);

  return (
    <div className="p-3.5 sm:p-4 rounded-2xl bg-white border border-slate-200 hover:border-[#0E8388]/60 transition-all flex flex-col sm:flex-row items-center sm:items-start justify-between gap-3 shadow-2xs hover:shadow-xs">
      <div className="flex items-center gap-3 w-full sm:w-auto min-w-0">
        <div className="w-14 h-14 rounded-xl bg-slate-50 border border-slate-100 p-1 shrink-0 flex items-center justify-center">
          <img
            src={product.image || '/images/hero_dog.png'}
            alt={product.name}
            className="w-full h-full object-contain"
          />
        </div>
        <div className="min-w-0 flex-1">
          {product.brand && (
            <span className="block text-[9.5px] font-black uppercase text-slate-400">
              {product.brand}
            </span>
          )}
          <h4 className="text-xs sm:text-sm font-black text-slate-900 truncate" title={product.name}>
            {product.name}
          </h4>
          <span className="text-xs font-black text-[#0A3E40] block mt-0.5">
            {formatCLP(currentPrice)}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2.5 w-full sm:w-auto justify-between sm:justify-end shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
        {/* Selector de Formato si tiene más de 1 peso */}
        {weights.length > 1 ? (
          <select
            value={selectedWeight}
            onChange={(e) => setSelectedWeight(e.target.value)}
            className="text-[11px] font-bold bg-slate-50 border border-slate-200 rounded-xl px-2 py-1.5 text-slate-700 focus:outline-hidden focus:border-[#0E8388] cursor-pointer"
          >
            {weights.map((w) => (
              <option key={w} value={w}>
                {w}
              </option>
            ))}
          </select>
        ) : (
          <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded-lg">
            {selectedWeight}
          </span>
        )}

        {/* Stepper de Cantidad */}
        <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-xl p-0.5 shadow-2xs">
          <button
            type="button"
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            className="w-6 h-6 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-200 font-black text-xs cursor-pointer active:scale-95"
            title="Disminuir cantidad"
          >
            -
          </button>
          <span className="text-xs font-black text-slate-900 min-w-[18px] text-center">
            {quantity}
          </span>
          <button
            type="button"
            onClick={() => setQuantity(quantity + 1)}
            className="w-6 h-6 rounded-lg flex items-center justify-center text-[#0E8388] hover:bg-[#E6F4F1] font-black text-xs cursor-pointer active:scale-95"
            title="Aumentar cantidad"
          >
            +
          </button>
        </div>

        {/* Botón Agregar */}
        <button
          type="button"
          onClick={() => onAdd(selectedWeight, quantity)}
          className="px-3.5 py-2 rounded-xl bg-[#0E8388] hover:bg-[#0A3E40] text-white text-xs font-black shadow-xs transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 shrink-0"
        >
          <Plus className="w-3.5 h-3.5 stroke-[3]" />
          <span>Agregar</span>
        </button>
      </div>
    </div>
  );
}

export default function CustomerDashboardView({ user, onLogout, onAddToCart, onSelectProduct, onSwitchRole }) {

  const navigate = useNavigate();
  const location = useLocation();

  // Tab activo: 'mascotas' | 'tienda' | 'cuaderno' | 'compras'
  const [activeTab, setActiveTab] = useState(() => {
    const params = new URLSearchParams(location.search);
    return params.get('tab') || 'mascotas';
  });

  // Estado para el Cuaderno Veterinario en vista principal
  const [cuadernoActivePetId, setCuadernoActivePetId] = useState(null);
  const [cuadernoCategoryFilter, setCuadernoCategoryFilter] = useState('todas'); // 'todas' | 'vacunas' | 'antiparasitario' | 'consulta'

  // Cambio de pestañas responsivo unificado (Desktop tabs y navegación PWA)
  const handleSwitchTab = (tabKey) => {
    setActiveTab(tabKey);
    navigate(`/mi-cuenta?tab=${tabKey}`, { replace: true });
    window.dispatchEvent(new CustomEvent('patitas_customer_tab_changed', { detail: tabKey }));
    window.dispatchEvent(new CustomEvent('patitas_customer_tab', { detail: tabKey }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Sincronizar tab cuando el BottomNavBar emite un evento o cambia la URL
  useEffect(() => {
    const handleTabEvent = (e) => {
      if (e.detail) {
        setActiveTab(e.detail);
      }
    };
    window.addEventListener('patitas_customer_tab', handleTabEvent);
    return () => window.removeEventListener('patitas_customer_tab', handleTabEvent);
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tabParam = params.get('tab');
    if (tabParam && tabParam !== activeTab) {
      setActiveTab(tabParam);
    }
  }, [location.search]);

  // Notificar al BottomNavBar cuando el tab cambia dentro de la vista
  useEffect(() => {
    window.dispatchEvent(new CustomEvent('patitas_customer_tab_changed', { detail: activeTab }));
  }, [activeTab]);

  // ID del cliente en Supabase para persistencia de datos relacionales
  const [customerDbId, setCustomerDbId] = useState(null);

  // Catálogo de productos sincronizado con Supabase en tiempo real
  const [catalogProducts, setCatalogProducts] = useState(PRODUCTS);

  useEffect(() => {
    let isMounted = true;
    const loadProducts = async () => {
      try {
        const dbProds = await fetchProductsFromSupabase();
        if (isMounted && dbProds && dbProds.length > 0) {
          setCatalogProducts(dbProds);
        }
      } catch (err) {
        console.warn('Error loading products from Supabase:', err);
      }
    };
    loadProducts();
    window.addEventListener('patitas_products_updated', loadProducts);
    return () => {
      isMounted = false;
      window.removeEventListener('patitas_products_updated', loadProducts);
    };
  }, []);

  // Catálogo activo general conectado al backend con fallback
  const activeCatalog = useMemo(() => {
    return catalogProducts && catalogProducts.length > 0 ? catalogProducts : PRODUCTS;
  }, [catalogProducts]);

  const [storeFilter, setStoreFilter] = useState('todos'); // 'todos' | 'perro' | 'gato'
  const [storeMobileCategory, setStoreMobileCategory] = useState('destacados'); // 'destacados' | 'alimento' | 'antiparasitarios' | 'snacks' | 'todos'
  
  // Modal for adding a new pet (Multi-step Wizard)
  const [isAddPetModalOpen, setIsAddPetModalOpen] = useState(false);
  const [petStep, setPetStep] = useState(1); // 1: Especie | 2: Info Mascota
  const hasAutoPromptedPetModal = useRef(false);

  // Replenishment & Despensa Habitual State
  const [replenishmentData, setReplenishmentData] = useState({
    frequencyDays: 30,
    habitualOrder: null,
    lastOrderDate: null,
  });
  const [isEditingReplenishFrequency, setIsEditingReplenishFrequency] = useState(false);
  const [isAddHabitualProductModalOpen, setIsAddHabitualProductModalOpen] = useState(false);
  const [habitualSearchQuery, setHabitualSearchQuery] = useState('');
  const [habitualCategoryFilter, setHabitualCategoryFilter] = useState('todos');
  const [newPetName, setNewPetName] = useState('');
  const [newPetType, setNewPetType] = useState('perro');
  const [newPetBirthdate, setNewPetBirthdate] = useState('');
  const [newPetAge, setNewPetAge] = useState('');
  const [newPetWeight, setNewPetWeight] = useState('');
  const [newPetSterilized, setNewPetSterilized] = useState('si');
  const [newPetFoodSearch, setNewPetFoodSearch] = useState('');
  const [newPetFood, setNewPetFood] = useState('');
  const [newPetSelectedProduct, setNewPetSelectedProduct] = useState(null);
  const [isCustomFood, setIsCustomFood] = useState(false);
  const [customFoodName, setCustomFoodName] = useState('');
  const [isFoodDropdownOpen, setIsFoodDropdownOpen] = useState(false);
  const [newPetDuration, setNewPetDuration] = useState('30');
  const foodDropdownRef = useRef(null);

  // Alimentos filtrados inteligentemente desde el backend para el Asistente de Registro de Mascota
  const availablePetFoods = useMemo(() => {
    if (!activeCatalog || activeCatalog.length === 0) return [];

    // 1. Filtrar SOLO alimentos (excluyendo arena sanitaria, antiparasitarios, etc.)
    const foodOnly = activeCatalog.filter((p) => {
      if (!p) return false;
      if (p.isActive === false || p.is_active === false) return false;

      const cat = (p.category || '').toLowerCase().trim();
      const nonFoodKeywords = [
        'arena',
        'arena sanitaria',
        'antiparasitario',
        'pipeta',
        'collar',
        'comprimido',
        'accesorio',
        'juguete',
        'higiene',
        'shampoo',
        'champu',
        'farmacia',
        'cama',
        'correa',
        'plato',
        'comedero'
      ];
      if (nonFoodKeywords.some((nfc) => cat.includes(nfc))) {
        return false;
      }
      if (cat.includes('alimento') || cat.includes('comida') || cat.includes('pienso') || cat.includes('nutricion')) {
        return true;
      }
      return cat === '' || cat === 'general';
    });

    // 2. Filtrar por especie (perro vs gato) para no mostrar un listado infinito
    const speciesFoods = foodOnly.filter((p) => {
      if (!newPetType) return true;
      const pt = (p.petType || p.pet_type || p.type || '').toLowerCase().trim();
      if (newPetType === 'perro') {
        return pt.includes('perro') || pt.includes('canin') || pt === 'ambos' || pt === 'todos' || pt === '';
      }
      if (newPetType === 'gato') {
        return pt.includes('gato') || pt.includes('felin') || pt === 'ambos' || pt === 'todos' || pt === '';
      }
      return true;
    });

    // 3. Filtrar en tiempo real según lo que el usuario está escribiendo
    const q = (newPetFoodSearch || '').trim();
    if (!q) {
      return speciesFoods;
    }

    const normalize = (str) =>
      (str || '')
        .toString()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim();

    const searchWords = normalize(q).split(/\s+/).filter(Boolean);

    return speciesFoods.filter((p) => {
      const weightStr = Array.isArray(p.weights) ? p.weights.join(' ') : (p.weight || p.format || '');
      const searchable = normalize(`
        ${p.name || ''} 
        ${p.brand || ''} 
        ${p.tagline || p.description || ''} 
        ${p.category || ''}
        ${weightStr}
      `);
      return searchWords.every((word) => searchable.includes(word));
    });
  }, [activeCatalog, newPetType, newPetFoodSearch]);

  // Cerrar el menú flotante de alimentos al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (foodDropdownRef.current && !foodDropdownRef.current.contains(event.target)) {
        setIsFoodDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Recargar productos desde el backend al abrir el modal de mascota
  useEffect(() => {
    if (isAddPetModalOpen) {
      fetchProductsFromSupabase().then((dbProds) => {
        if (dbProds && dbProds.length > 0) {
          setCatalogProducts(dbProds);
        }
      }).catch(console.warn);
    }
  }, [isAddPetModalOpen]);

  // Limpiar y reiniciar formulario de nueva mascota
  const resetPetModalForm = () => {
    setPetStep(1);
    setNewPetName('');
    setNewPetBirthdate('');
    setNewPetAge('');
    setNewPetWeight('');
    setNewPetSterilized('si');
    setNewPetFoodSearch('');
    setNewPetFood('');
    setNewPetSelectedProduct(null);
    setIsCustomFood(false);
    setCustomFoodName('');
    setIsFoodDropdownOpen(false);
    setNewPetDuration('30');
    setIsAddPetModalOpen(false);
  };

  // Calculate age in years and months from birthdate (Date, ISO string or Spanish string)
  const calculateAgeFromBirthdate = (input) => {
    if (!input) return '';
    let birthDate = null;

    if (input instanceof Date && !isNaN(input.getTime())) {
      birthDate = input;
    } else if (typeof input === 'string') {
      const trimmed = input.trim();
      // Check ISO YYYY-MM-DD
      if (trimmed.includes('-')) {
        const parts = trimmed.split('-');
        if (parts.length === 3) {
          const y = parseInt(parts[0], 10);
          const m = parseInt(parts[1], 10) - 1;
          const d = parseInt(parts[2], 10);
          if (!isNaN(y) && !isNaN(m) && !isNaN(d)) {
            birthDate = new Date(y, m, d);
          }
        }
      }
      // Check Spanish string "10 de Febrero 2024"
      if (!birthDate && trimmed.includes('de')) {
        const match = trimmed.match(/(\d{1,2})\s+de\s+([a-zA-ZáéíóúÁÉÍÓÚ]+)\s+(\d{4})/i);
        if (match) {
          const day = parseInt(match[1], 10);
          const monthName = match[2].toLowerCase();
          const year = parseInt(match[3], 10);
          const monthNames = [
            'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
            'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
          ];
          const mIdx = monthNames.findIndex((m) => m === monthName);
          if (mIdx !== -1) {
            birthDate = new Date(year, mIdx, day);
          }
        }
      }
      if (!birthDate) {
        const parsed = new Date(trimmed);
        if (!isNaN(parsed.getTime())) birthDate = parsed;
      }
    }

    if (!birthDate) return '';

    const today = new Date();
    let years = today.getFullYear() - birthDate.getFullYear();
    let months = today.getMonth() - birthDate.getMonth();
    let days = today.getDate() - birthDate.getDate();

    if (days < 0) {
      months--;
    }
    if (months < 0) {
      years--;
      months += 12;
    }

    if (years < 0) return 'Recién nacido';

    const yearStr = years === 1 ? '1 año' : `${years} años`;
    const monthStr = months === 1 ? '1 mes' : `${months} meses`;

    if (years > 0 && months > 0) {
      return `${yearStr} y ${monthStr}`;
    } else if (years > 0) {
      return yearStr;
    } else if (months > 0) {
      return monthStr;
    } else {
      return 'Menos de 1 mes';
    }
  };

  const handleBirthdateChange = (spanishDate, isoDate, dateObj) => {
    const selectedDate = spanishDate || isoDate;
    setNewPetBirthdate(selectedDate);
    const calculatedAge = calculateAgeFromBirthdate(dateObj || isoDate || spanishDate);
    setNewPetAge(calculatedAge);
  };

  const handleAgeChange = (e) => {
    setNewPetAge(e.target.value);
  };

  // Modal for Pet Health Log (Bitácora de Salud)
  const [selectedHealthPet, setSelectedHealthPet] = useState(null);
  const [isHealthBitacoraOpen, setIsHealthBitacoraOpen] = useState(false);
  const [logCategoryFilter, setLogCategoryFilter] = useState('vacunas'); // 'vacunas' | 'antiparasitario' | 'consulta'

  const formatCLP = (price) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const MONTH_NAMES_ES = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  // Format Date object to Spanish string e.g. "18 de Agosto 2026"
  const formatDateToSpanish = (d = new Date()) => {
    return `${d.getDate()} de ${MONTH_NAMES_ES[d.getMonth()]} ${d.getFullYear()}`;
  };

  // Helper to parse Spanish date or ISO string into Date object
  const parseSpanishOrIsoDate = (dateStr) => {
    if (!dateStr) return new Date();
    if (dateStr instanceof Date && !isNaN(dateStr.getTime())) return dateStr;

    const valStr = String(dateStr).trim();

    // Check Spanish string "18 de Agosto 2026"
    const match = valStr.match(/(\d{1,2})\s+de\s+([a-zA-ZáéíóúÁÉÍÓÚ]+)\s+(\d{4})/i);
    if (match) {
      const day = parseInt(match[1], 10);
      const monthName = match[2].toLowerCase();
      const year = parseInt(match[3], 10);
      const mIdx = MONTH_NAMES_ES.findIndex(m => m.toLowerCase() === monthName);
      if (mIdx !== -1) {
        return new Date(year, mIdx, day);
      }
    }

    // Check ISO YYYY-MM-DD
    if (valStr.includes('-')) {
      const parts = valStr.split('-');
      if (parts.length === 3) {
        return new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
      }
    }

    const fallback = new Date(valStr);
    return isNaN(fallback.getTime()) ? new Date() : fallback;
  };

  // Helper to compute next due date in Spanish relative to selected application date
  const calculateNextDueDate = (months = 12, baseDate = null) => {
    const m = parseInt(months, 10) || 12;
    const base = parseSpanishOrIsoDate(baseDate || newLogDate);
    const target = new Date(base.getFullYear(), base.getMonth() + m, base.getDate());
    return `${target.getDate()} de ${MONTH_NAMES_ES[target.getMonth()]} ${target.getFullYear()}`;
  };

  // New Log Entry Form State
  const todaySpanish = formatDateToSpanish(new Date());
  const [isAddLogFormOpen, setIsAddLogFormOpen] = useState(false);
  const [newLogCategory, setNewLogCategory] = useState('vacunas');
  const [newLogTitle, setNewLogTitle] = useState('Vacuna Séxtuple Canina (DHPPI+L)');
  const [newLogDate, setNewLogDate] = useState(todaySpanish);
  const [newLogFrequency, setNewLogFrequency] = useState('12'); // meses
  const [newLogNextDue, setNewLogNextDue] = useState(calculateNextDueDate(12, todaySpanish));
  const [newLogReminder, setNewLogReminder] = useState(true);
  const [isCustomVaccine, setIsCustomVaccine] = useState(false);
  const [customVaccineName, setCustomVaccineName] = useState('');
  const [selectedAntiparasiticId, setSelectedAntiparasiticId] = useState('nexgard-spectra-dog');
  const [isCustomAntiparasitic, setIsCustomAntiparasitic] = useState(false);
  const [customAntiparasiticName, setCustomAntiparasiticName] = useState('');
  const [newLogVetName, setNewLogVetName] = useState('Dr. Matías Morales');
  const [newLogNotes, setNewLogNotes] = useState('');

  // Accordion state for Health Log items
  const [expandedLogIds, setExpandedLogIds] = useState({});

  const toggleLogExpand = (id) => {
    setExpandedLogIds(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Helper to determine status (Al Día vs Atrasada)
  const getLogStatus = (log) => {
    if (!log.nextDueDate) {
      return {
        label: 'Al Día',
        isOverdue: false,
        bg: 'bg-emerald-100 text-emerald-800 border-emerald-300',
        Icon: CheckCircle2,
      };
    }
    const nextDate = parseSpanishOrIsoDate(log.nextDueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    nextDate.setHours(0, 0, 0, 0);

    const isOverdue = nextDate < today;
    if (isOverdue) {
      return {
        label: 'Atrasado',
        isOverdue: true,
        bg: 'bg-rose-100 text-rose-800 border-rose-300',
        Icon: AlertTriangle,
      };
    }
    return {
      label: 'Al Día',
      isOverdue: false,
      bg: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      Icon: CheckCircle2,
    };
  };

  // Replenish Food Modal State & PWA Delivery Scheduler
  const [selectedReplenishPet, setSelectedReplenishPet] = useState(null);
  const [replenishWeight, setReplenishWeight] = useState('');
  const [replenishQuantity, setReplenishQuantity] = useState(1);
  const [replenishAddedSuccess, setReplenishAddedSuccess] = useState(false);
  const [selectedSimilarWeight, setSelectedSimilarWeight] = useState({});
  const similarSliderRef = useRef(null);

  // Delivery Scheduling State (PWA Client Experience)
  const [schedDeliveryDay, setSchedDeliveryDay] = useState('manana'); // 'hoy' | 'manana' | 'otro'
  const [schedCustomDate, setSchedCustomDate] = useState('2026-08-20');
  const [schedTimeSlot, setSchedTimeSlot] = useState('tarde'); // 'manana' (09:00 - 13:00) | 'tarde' (14:00 - 19:00)
  const [schedPaymentMethod, setSchedPaymentMethod] = useState('Tarjeta'); // 'Web' | 'Tarjeta' | 'Efectivo' | 'Transferencia'
  const [schedAddress, setSchedAddress] = useState('');
  const [orderToastMessage, setOrderToastMessage] = useState(null);
  const [liveTrackingOrder, setLiveTrackingOrder] = useState(null);

  // Estados para nuevas opciones de la PWA del cliente
  const [isAlternativeFoodModalOpen, setIsAlternativeFoodModalOpen] = useState(false);
  const [isQuickLogModalOpen, setIsQuickLogModalOpen] = useState(false);
  const [quickLogCategory, setQuickLogCategory] = useState('consulta'); // 'consulta' | 'antiparasitario'
  const [quickAntiparasiticType, setQuickAntiparasiticType] = useState('externo'); // 'interno' | 'externo'
  const [isVetConsultationModalOpen, setIsVetConsultationModalOpen] = useState(false);
  const [isAntiparasiticModalOpen, setIsAntiparasiticModalOpen] = useState(false);

  const scrollSimilar = (direction) => {
    if (similarSliderRef.current) {
      const scrollAmount = direction === 'left' ? -300 : 300;
      similarSliderRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  // Loyalty Points & Settings State
  const [userPoints, setUserPoints] = useState(0);
  const [loyaltySettings, setLoyaltySettings] = useState(DEFAULT_LOYALTY_SETTINGS);
  const [isRedeemModalOpen, setIsRedeemModalOpen] = useState(false);
  const [activeCoupons, setActiveCoupons] = useState([]);
  const [redeemSuccessMessage, setRedeemSuccessMessage] = useState(null);

  // Cargar configuración de fidelización (montos configurados en admin)
  useEffect(() => {
    let isMounted = true;
    const fetchLoyalty = async () => {
      try {
        const settings = await getLoyaltySettings();
        if (isMounted && settings) {
          setLoyaltySettings(settings);
        }
      } catch (err) {
        console.warn('Error loading loyalty settings in customer view:', err);
      }
    };
    fetchLoyalty();
    return () => { isMounted = false; };
  }, []);

  // Re-validar cuando se abre el modal para asegurar montos al día
  useEffect(() => {
    if (isRedeemModalOpen) {
      getLoyaltySettings().then((s) => {
        if (s) setLoyaltySettings(s);
      });
    }
  }, [isRedeemModalOpen]);

  // Beneficios de canje sincronizados dinámicamente con la configuración del Admin
  const redeemRewards = useMemo(() => {
    const rawTiers = Array.isArray(loyaltySettings?.tiers) && loyaltySettings.tiers.length > 0
      ? loyaltySettings.tiers
      : DEFAULT_LOYALTY_SETTINGS.tiers;

    return rawTiers
      .filter((t) => t.active !== false)
      .map((t) => {
        const dAmount = Number(t.discountAmount) || 0;
        return {
          id: t.id || `reward-${t.points}`,
          points: Number(t.points) || 0,
          discountLabel: `$${dAmount.toLocaleString('es-CL')} Dcto.`,
          discountAmount: dAmount,
          title: t.title || `Cupón $${dAmount.toLocaleString('es-CL')} CLP de Descuento`,
          validity: t.validity || 'Válido para 1 compra',
          description: t.description && !t.description.startsWith('Aplica .000')
            ? t.description
            : `Aplica $${dAmount.toLocaleString('es-CL')} de descuento directo en el total de tu próxima compra.`,
          icon: t.icon || '💵',
          active: t.active !== false,
        };
      });
  }, [loyaltySettings]);

  // Tiers adaptados para la tarjeta de membresía VIP física
  const membershipTiers = useMemo(() => {
    return redeemRewards.map((r) => ({
      points: r.points,
      discount: r.discountAmount,
      label: `$${r.discountAmount.toLocaleString('es-CL')} Dcto`,
      validity: r.validity || 'Válido: 1 compra',
      icon: r.icon || '💵',
      id: r.id,
    }));
  }, [redeemRewards]);

  const handleRedeemReward = async (reward) => {
    if (userPoints < reward.points) return;

    const remainingPoints = Math.max(0, userPoints - reward.points);
    setUserPoints(remainingPoints);

    const randomChars = Math.random().toString(36).substring(2, 7).toUpperCase();
    const couponCode = `PTS-${randomChars}`;

    const newCoupon = {
      id: `CUPON-${Date.now()}`,
      title: reward.title,
      pointsCost: reward.points,
      validity: reward.validity,
      remainingUses: 1,
      code: couponCode,
      date: 'Canjeado hoy',
      discountAmount: reward.discountAmount || 1000,
      status: 'activo',
    };
    setActiveCoupons(prev => [newCoupon, ...prev]);

    // Sincronizar reducción de puntos y canje en Supabase
    if (customerDbId) {
      try {
        await updateCustomerPoints(customerDbId, -reward.points);
        const { error: insErr } = await supabase.from('points_redemptions').insert({
          customer_id: customerDbId,
          reward_id: reward.id,
          points_spent: reward.points,
          coupon_code: newCoupon.code,
          status: 'activo',
        });
        if (insErr && insErr.code === '23503') {
          await supabase.from('points_redemptions').insert({
            customer_id: customerDbId,
            reward_id: 'rew-envio-gratis',
            points_spent: reward.points,
            coupon_code: newCoupon.code,
            status: 'activo',
          });
        }
      } catch (err) {
        console.error('Error synchronizing points redemption to Supabase:', err);
      }
    }

    setRedeemSuccessMessage(`🎉 ¡Canje exitoso! Se descontaron ${reward.points.toLocaleString('es-CL')} Pts de tu tarjeta. Tu ${reward.title} ya está activo.`);
    setTimeout(() => {
      setRedeemSuccessMessage(null);
    }, 4500);
  };

  const getReplenishProducts = (pet) => {
    if (!pet) return { currentProduct: null, similarProducts: [] };

    const pool = activeCatalog && activeCatalog.length > 0 ? activeCatalog : PRODUCTS;
    const petTypeFilter = pet.type === 'gato' ? 'gatos' : 'perros';
    
    // Find current main product matching species and name
    const currentProduct = pool.find(p => {
      const pPetType = (p.petType || p.pet_type || '').toLowerCase();
      const matchSpecies = pPetType.includes(pet.type === 'gato' ? 'gato' : 'perro') || pPetType === 'ambos' || pPetType === 'todos';
      if (!matchSpecies) return false;
      const fName = (pet.foodName || '').toLowerCase();
      const pName = (p.name || '').toLowerCase();
      return fName.includes(pName) || pName.includes(fName.split(' ')[0]);
    }) || pool.find(p => {
      const pPetType = (p.petType || p.pet_type || '').toLowerCase();
      const isFood = (p.category || '').toLowerCase().includes('alimento');
      return (pPetType.includes(pet.type === 'gato' ? 'gato' : 'perro') || pPetType === 'ambos') && isFood;
    }) || pool[0];

    // Similar products: same species, same category, excluding currentProduct
    const otherProducts = pool.filter(p => {
      if (!p || p.id === currentProduct?.id) return false;
      const pPetType = (p.petType || p.pet_type || '').toLowerCase();
      const matchSpecies = pPetType.includes(pet.type === 'gato' ? 'gato' : 'perro') || pPetType === 'ambos' || pPetType === 'todos';
      const isFood = (p.category || '').toLowerCase().includes('alimento');
      return matchSpecies && isFood;
    }).sort((a, b) => {
      if (a.brand === currentProduct?.brand && b.brand !== currentProduct?.brand) return -1;
      if (b.brand === currentProduct?.brand && a.brand !== currentProduct?.brand) return 1;
      return 0;
    });

    return { currentProduct, similarProducts: otherProducts };
  };

  const handleOpenReplenishModal = (pet) => {
    setSelectedReplenishPet(pet);
    setReplenishQuantity(1);
    setReplenishAddedSuccess(false);

    if (!schedAddress && profileData?.address) {
      const fullAddr = profileData.address + (profileData.dept ? `, ${profileData.dept}` : '') + (profileData.city ? `, ${profileData.city}` : '');
      setSchedAddress(fullAddr);
    }

    const { currentProduct } = getReplenishProducts(pet);
    if (currentProduct && currentProduct.weights && currentProduct.weights.length > 0) {
      const matchWeight = currentProduct.weights.find(w => pet.bagSize && w.includes(pet.bagSize.replace(' ', '')));
      setReplenishWeight(matchWeight || currentProduct.weights[currentProduct.weights.length - 1]);
    }
  };

  const getFlavorBadge = (product) => {
    const text = (product.name + ' ' + (product.mainProtein || '') + ' ' + (product.flavor || '')).toLowerCase();
    if (text.includes('salmón') || text.includes('salmon')) return { label: 'Sabor Salmón Silvestre', emoji: '🐟', bg: 'bg-teal-50 text-teal-800 border-teal-200' };
    if (text.includes('cordero')) return { label: 'Sabor Cordero de Pradera', emoji: '🥩', bg: 'bg-amber-50 text-amber-800 border-amber-200' };
    if (text.includes('pollo')) return { label: 'Sabor Pollo de Granja', emoji: '🍗', bg: 'bg-orange-50 text-orange-800 border-orange-200' };
    if (text.includes('cerdo') || text.includes('ibérico')) return { label: 'Sabor Cerdo Ibérico', emoji: '🥓', bg: 'bg-rose-50 text-rose-800 border-rose-200' };
    if (text.includes('arenque') || text.includes('pescado')) return { label: 'Sabor Arenque Azul', emoji: '🐟', bg: 'bg-cyan-50 text-cyan-800 border-cyan-200' };
    if (text.includes('trucha')) return { label: 'Sabor Trucha & Catnip', emoji: '🐟', bg: 'bg-emerald-50 text-emerald-800 border-emerald-200' };
    return { label: product.mainProtein || 'Fórmula 100% Natural', emoji: '🌿', bg: 'bg-emerald-50 text-emerald-800 border-emerald-200' };
  };

  const handleLogout = () => {
    onLogout();
    navigate('/');
  };

  // Helper para sanitizar valores demo antiguos de sesiones previas
  const sanitizeCustomerProfile = (data) => {
    if (!data) return data;
    return {
      ...data,
      phone: (data.phone === '+56 9 8456 1234' || data.phone === '9 8456 1234') ? '' : (data.phone || ''),
      address: data.address === 'Av. Los Notros 1420' ? '' : (data.address || ''),
      dept: data.dept === 'Depto 402' ? '' : (data.dept || ''),
    };
  };

  // State for Customer Profile & Personal Info
  const [profileData, setProfileData] = useState(() => {
    if (user?.email) {
      const saved = localStorage.getItem(`patitas_customer_profile_${user.email}`);
      if (saved) {
        try {
          return sanitizeCustomerProfile(JSON.parse(saved));
        } catch (e) {
          console.error('Error parsing customer profile', e);
        }
      }
    }
    return sanitizeCustomerProfile({
      name: user?.name || user?.fullName || (user?.email ? user.email.split('@')[0] : 'Tutor Patitas'),
      email: user?.email || '',
      phone: user?.phone || '',
      address: user?.address || '',
      dept: user?.dept || '',
      city: user?.city || '',
      notes: user?.notes || '',
      notifyWhatsapp: true,
      notifyEmail: true,
      memberSince: user?.memberSince || 'Octubre 2026',
    });
  });
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  const handleSaveProfile = async (updatedProfile) => {
    setProfileData(updatedProfile);
    if (user?.email) {
      localStorage.setItem(`patitas_customer_profile_${user.email}`, JSON.stringify(updatedProfile));
    }
    localStorage.setItem('patitas_customer_profile', JSON.stringify(updatedProfile));

    // Sincronizar también con la sesión activa de la PWA
    const currentSession = localStorage.getItem('patitas_pwa_session');
    if (currentSession) {
      try {
        const parsed = JSON.parse(currentSession);
        localStorage.setItem(
          'patitas_pwa_session',
          JSON.stringify({ ...parsed, ...updatedProfile })
        );
      } catch (err) {
        console.error(err);
      }
    }

    // Persistir perfil en Supabase
    try {
      const res = await upsertCustomerProfile({
        ...updatedProfile,
        id: customerDbId,
      });
      if (res?.data?.id) {
        setCustomerDbId(res.data.id);
      }
    } catch (err) {
      console.error('Error synchronizing customer profile to Supabase:', err);
    }

    setOrderToastMessage(`✓ Datos de ${updatedProfile.name.split(' ')[0]} actualizados con éxito`);
    setTimeout(() => setOrderToastMessage(null), 3500);
  };

  // Sincronizar Perfil de Cliente y Puntos desde Supabase al iniciar
  useEffect(() => {
    let isMounted = true;
    const targetEmail = (user?.email || profileData.email || '').toLowerCase().trim();
    const targetPhone = (user?.phone || profileData.phone || '').trim();
    const userId = user?.id || user?.auth_user_id;

    if (!targetEmail && !targetPhone && !userId) return;

    const fetchCustomer = async () => {
      try {
        let dbCustomer = null;
        if (targetEmail) {
          dbCustomer = await getCustomerProfile(targetEmail);
        }
        if (!dbCustomer && targetPhone) {
          dbCustomer = await getCustomerProfile(targetPhone);
        }
        if (!dbCustomer && userId) {
          dbCustomer = await getCustomerProfile(userId);
        }

        if (!isMounted || !dbCustomer) return;

        setCustomerDbId(dbCustomer.id);
        if (typeof dbCustomer.points === 'number') {
          setUserPoints(dbCustomer.points);
        }

        // Cargar cupones activos de fidelización desde Supabase
        try {
          const { data: dbCoupons } = await supabase
            .from('points_redemptions')
            .select('*')
            .eq('customer_id', dbCustomer.id)
            .eq('status', 'activo')
            .order('created_at', { ascending: false });

          if (Array.isArray(dbCoupons)) {
            const currentTiers = loyaltySettings?.tiers || DEFAULT_LOYALTY_SETTINGS.tiers;
            const mapped = dbCoupons.map((c) => {
              const matchedTier = currentTiers.find(
                (t) => t.id === c.reward_id || Number(t.points) === Number(c.points_spent)
              );
              const dAmount = matchedTier ? matchedTier.discountAmount : Number(c.points_spent) * 10;
              return {
                id: c.id,
                title: matchedTier?.title || `Cupón $${dAmount.toLocaleString('es-CL')} CLP Dcto.`,
                pointsCost: c.points_spent,
                validity: matchedTier?.validity || 'Válido para 1 compra',
                remainingUses: 1,
                code: c.coupon_code,
                discountAmount: dAmount,
                date: new Date(c.created_at).toLocaleDateString('es-CL'),
                status: 'activo',
              };
            });
            setActiveCoupons(mapped);
          }
        } catch (couponErr) {
          console.warn('Error loading active customer coupons:', couponErr);
        }
        setProfileData((prev) => {
          const rawPhone = dbCustomer.phone || prev.phone || '';
          const cleanPhone = (rawPhone === '+56 9 8456 1234' || rawPhone === '9 8456 1234') ? '' : rawPhone;
          const rawAddr = dbCustomer.address || prev.address || '';
          const cleanAddr = rawAddr === 'Av. Los Notros 1420' ? '' : rawAddr;
          const rawDept = dbCustomer.depto || prev.dept || '';
          const cleanDept = rawDept === 'Depto 402' ? '' : rawDept;

          return {
            ...prev,
            name: dbCustomer.full_name || prev.name,
            email: dbCustomer.email || prev.email,
            phone: cleanPhone,
            city: dbCustomer.city || prev.city || '',
            address: cleanAddr,
            dept: cleanDept,
            notes: dbCustomer.delivery_reference || prev.notes || '',
          };
        });
      } catch (err) {
        console.warn('Error fetching customer profile in CustomerDashboardView:', err);
      }
    };

    fetchCustomer();

    const handleCustomerSync = () => {
      if (isMounted) fetchCustomer();
    };

    window.addEventListener('patitas_customers_updated', handleCustomerSync);
    window.addEventListener('patitas_orders_updated', handleCustomerSync);

    return () => {
      isMounted = false;
      window.removeEventListener('patitas_customers_updated', handleCustomerSync);
      window.removeEventListener('patitas_orders_updated', handleCustomerSync);
    };
  }, [user?.email, user?.phone, user?.id]);

  // Sincronizar Mascotas y Bitácora de Salud desde Supabase
  useEffect(() => {
    if (!customerDbId) return;
    let isMounted = true;

    getCustomerPets(customerDbId).then(async (dbPets) => {
      if (!isMounted) return;
      if (dbPets && dbPets.length > 0) {
        const mappedPets = dbPets.map((p) => ({
          id: p.id,
          name: p.name,
          type: p.type || 'perro',
          weight: p.weight || '6 kg',
          foodName: p.favorite_food_name || 'Bravery Alimento Super Premium',
          bagSize: p.bag_size || '12 kg',
          totalDaysDuration: p.total_days_duration || 30,
          daysRemaining: p.days_remaining || 15,
          lastOrderDate: p.last_order_date || 'Reciente',
          estimatedDepletionDate: p.estimated_depletion_date || 'En 15 días',
          sterilized: p.sterilized || 'Sí',
          breed: p.breed,
          birthdate: p.birthdate,
          notes: p.notes,
        }));
        setPets((currentPets) => {
          const pendingTempPets = currentPets.filter((p) => typeof p.id === 'string' && p.id.startsWith('pet-'));
          const stillPending = pendingTempPets.filter((p) => !mappedPets.some((mp) => mp.name === p.name));
          return [...mappedPets, ...stillPending];
        });
        if (!mappedPets.some((p) => p.id === selectedPetId)) {
          setSelectedPetId(mappedPets[0].id);
          setCuadernoActivePetId(mappedPets[0].id);
        }

        // Cargar bitácora de salud para cada mascota
        for (const pet of dbPets) {
          const logs = await getPetHealthLogs(pet.id);
          if (isMounted && logs && logs.length > 0) {
            const mappedLogs = logs.map((hl) => ({
              id: hl.id,
              date: hl.application_date,
              category: hl.category,
              title: hl.title,
              productId: hl.product_id,
              frequencyMonths: hl.frequency_months,
              nextDueDate: hl.next_due_date,
              reminderEnabled: hl.reminder_enabled,
              vetName: hl.vet_name,
              weight: hl.weight_at_time,
              diagnosis: hl.diagnosis,
              notes: hl.notes || hl.indications,
            }));
            setHealthLogs((prev) => ({
              ...prev,
              [pet.id]: mappedLogs,
            }));
          }
        }
      } else {
        // Si el cliente no tiene mascotas registradas en Supabase, iniciar en limpio salvo mascotas en proceso
        setPets((currentPets) => {
          const pendingTempPets = currentPets.filter((p) => typeof p.id === 'string' && p.id.startsWith('pet-'));
          return pendingTempPets;
        });
        if (!hasAutoPromptedPetModal.current) {
          hasAutoPromptedPetModal.current = true;
          setIsAddPetModalOpen(true);
        }
      }
    });

    return () => {
      isMounted = false;
    };
  }, [customerDbId]);

  // Cargar datos de reposición inteligente / despensa habitual
  useEffect(() => {
    let isMounted = true;
    const loadReplenishment = async () => {
      try {
        const phone = profileData?.phone || user?.phone || '';
        const data = await getCustomerReplenishmentData(customerDbId, phone);
        if (isMounted && data) {
          setReplenishmentData(data);
        }
      } catch (e) {
        console.warn('Error loading replenishment in customer dashboard:', e);
      }
    };

    loadReplenishment();

    const handleSync = () => loadReplenishment();
    window.addEventListener('patitas_replenishment_updated', handleSync);
    window.addEventListener('patitas_orders_updated', handleSync);
    return () => {
      isMounted = false;
      window.removeEventListener('patitas_replenishment_updated', handleSync);
      window.removeEventListener('patitas_orders_updated', handleSync);
    };
  }, [customerDbId, profileData?.phone, user?.phone]);

  const currentUser = {
    name: profileData.name || user?.name || (user?.email ? user.email.split('@')[0] : 'Tutor'),
    email: profileData.email || user?.email || '',
    phone: profileData.phone || user?.phone || '',
    address: profileData.address || user?.address || '',
    petName: user?.petName || '',
    petType: user?.petType || '',
    memberSince: profileData.memberSince || user?.memberSince || 'Octubre 2026',
  };

  // State for user's registered pets: inicia completamente vacío para nuevas cuentas
  const [pets, setPets] = useState(() => {
    const userKey = (user?.email || profileData?.email || user?.phone || profileData?.phone || '').toLowerCase().trim();
    if (userKey) {
      try {
        const saved = localStorage.getItem(`patitas_customer_pets_${userKey}`);
        if (saved) return JSON.parse(saved);
      } catch (e) {
        console.error('Error loading pets from localStorage:', e);
      }
    }
    return [];
  });

  // Mascota activa seleccionada desde las cápsulas superiores
  const [selectedPetId, setSelectedPetId] = useState(() => pets[0]?.id || null);
  const activeSelectedPet = pets.find(p => p.id === selectedPetId) || pets[0] || null;

  // Sincronizar selectedPetId si cambia el listado de mascotas
  useEffect(() => {
    if (pets.length > 0) {
      if (!pets.some(p => p.id === selectedPetId)) {
        setSelectedPetId(pets[0].id);
        setCuadernoActivePetId(pets[0].id);
      }
    } else {
      setSelectedPetId(null);
      setCuadernoActivePetId(null);
    }
  }, [pets, selectedPetId]);

  // Persistir mascotas en localStorage con clave por usuario
  useEffect(() => {
    const userKey = (user?.email || profileData?.email || user?.phone || profileData?.phone || '').toLowerCase().trim();
    if (userKey && pets.length > 0) {
      try {
        localStorage.setItem(`patitas_customer_pets_${userKey}`, JSON.stringify(pets));
      } catch (e) {
        console.error('Error saving pets to localStorage:', e);
      }
    }
  }, [pets, user?.email, profileData?.email, user?.phone, profileData?.phone]);

  // Sincronizar automáticamente el filtro de tienda y cuaderno con la mascota activa
  const handleSelectPet = (pet) => {
    if (!pet) return;
    setSelectedPetId(pet.id);
    setCuadernoActivePetId(pet.id);
    const targetSpecies = pet.type === 'gato' ? 'gato' : 'perro';
    setStoreFilter(targetSpecies);
    setStoreMobileCategory('destacados');
    setStoreCategoryFilter('Todos');
    setStoreSelectedBrand('Todas');
    setStoreSearchQuery('');
  };

  // Alimento habitual resuelto de la mascota activa
  const currentPetFoodProduct = useMemo(() => {
    if (!activeSelectedPet) return null;
    const { currentProduct } = getReplenishProducts(activeSelectedPet);
    return currentProduct;
  }, [activeSelectedPet]);

  // State for Health Logs (Bitácora Médica por Mascota con Recordatorios de Vacunas y Antiparasitarios)
  const [healthLogs, setHealthLogs] = useState(() => {
    if (user?.email) {
      try {
        const saved = localStorage.getItem(`patitas_customer_hl_${user.email}`);
        if (saved) return JSON.parse(saved);
      } catch (e) {
        console.error('Error loading healthLogs from localStorage:', e);
      }
    }
    return {};
  });

  // Persistir healthLogs en localStorage con clave por usuario
  useEffect(() => {
    if (user?.email) {
      try {
        localStorage.setItem(`patitas_customer_hl_${user.email}`, JSON.stringify(healthLogs));
      } catch (e) {
        console.error('Error saving healthLogs to localStorage:', e);
      }
    }
  }, [healthLogs, user?.email]);

  const handleAddPetSubmit = async (e) => {
    e.preventDefault();
    if (!newPetName.trim()) return;

    const tempId = `pet-${Date.now()}`;
    const cleanPetName = newPetName.trim();
    const cleanPetType = newPetType || 'perro';
    const cleanBirthdate = newPetBirthdate ? newPetBirthdate.trim() : null;
    const cleanWeight = newPetWeight ? `${newPetWeight} kg` : '6 kg';
    const cleanSterilized = newPetSterilized === 'si' ? 'Sí' : 'No';

    const createdPet = {
      id: tempId,
      name: cleanPetName,
      type: cleanPetType,
      birthdate: cleanBirthdate || 'No especificada',
      weight: cleanWeight,
      sterilized: cleanSterilized,
      foodName: 'Alimento Habitual',
      bagSize: 'Estándar',
      totalDaysDuration: 30,
      daysRemaining: 30,
      lastOrderDate: new Date().toISOString().split('T')[0],
      estimatedDepletionDate: null,
    };

    setPets((prev) => [...prev, createdPet]);
    setSelectedPetId(tempId);
    setCuadernoActivePetId(tempId);
    setHealthLogs((prevHl) => ({
      ...prevHl,
      [tempId]: [
        {
          id: `hl-${Date.now()}`,
          date: 'Hoy',
          category: 'consulta',
          title: 'Registro Inicial de Mascota',
          notes: `Mascota registrada. Especie: ${cleanPetType === 'perro' ? 'Canina' : 'Felina'}. Esterilizado/a: ${cleanSterilized}. Peso: ${cleanWeight}.`,
        }
      ]
    }));

    setPetStep(1);
    setNewPetName('');
    setNewPetBirthdate('');
    setNewPetAge('');
    setNewPetWeight('');
    setNewPetSterilized('si');
    setIsAddPetModalOpen(false);

    // Persistir mascota y bitácora en Supabase
    try {
      let targetCustomerId = customerDbId;
      if (!targetCustomerId) {
        const identifier = user?.email || profileData?.email || user?.phone || profileData?.phone;
        if (identifier) {
          const profile = await getCustomerProfile(identifier);
          if (profile?.id) {
            targetCustomerId = profile.id;
            setCustomerDbId(profile.id);
          }
        }
      }

      if (targetCustomerId) {
        const res = await addPetToSupabase({
          customerId: targetCustomerId,
          name: cleanPetName,
          type: cleanPetType,
          birthdate: cleanBirthdate,
          weight: cleanWeight,
          sterilized: cleanSterilized,
          foodName: 'Alimento Habitual',
          bagSize: 'Estándar',
          totalDaysDuration: 30,
          daysRemaining: 30,
          notes: `Mascota registrada. Especie: ${cleanPetType === 'perro' ? 'Canina' : 'Felina'}. Esterilizado/a: ${cleanSterilized}. Peso: ${cleanWeight}.`,
        });

        if (res?.data?.id) {
          const realPetId = res.data.id;
          setPets((prev) => prev.map((p) => (p.id === tempId ? { ...p, id: realPetId } : p)));
          setHealthLogs((prev) => {
            const nextHl = { ...prev };
            if (nextHl[tempId]) {
              nextHl[realPetId] = nextHl[tempId];
              delete nextHl[tempId];
            }
            return nextHl;
          });
          setSelectedPetId(realPetId);
          setCuadernoActivePetId(realPetId);

          await addHealthLogToSupabase({
            petId: realPetId,
            category: 'consulta',
            title: 'Registro Inicial de Mascota',
            notes: `Mascota registrada. Especie: ${cleanPetType === 'perro' ? 'Canina' : 'Felina'}. Esterilizado/a: ${cleanSterilized}. Peso: ${cleanWeight}.`,
          });

          setOrderToastMessage(`✓ ¡${cleanPetName} se guardó exitosamente! 🐾`);
        } else {
          console.error('Error al guardar mascota en Supabase:', res?.error);
        }
      }
    } catch (err) {
      console.error('Error persisting pet to Supabase:', err);
    }
  };

  const handleAddHealthLogSubmit = (e) => {
    e.preventDefault();
    let finalTitle = newLogTitle;
    let finalProductId = null;
    let finalPrice = null;

    if (newLogCategory === 'vacunas') {
      finalTitle = isCustomVaccine && customVaccineName ? customVaccineName : newLogTitle;
    } else if (newLogCategory === 'antiparasitario') {
      if (isCustomAntiparasitic && customAntiparasiticName) {
        finalTitle = customAntiparasiticName;
      } else {
        const found = PRODUCTS.find(p => p.id === selectedAntiparasiticId);
        if (found) {
          finalTitle = found.name;
          finalProductId = found.id;
          finalPrice = found.price;
        } else {
          finalTitle = newLogTitle;
        }
      }
    }

    if (!selectedHealthPet || !finalTitle) return;

    const petId = selectedHealthPet.id;
    const computedNextDue = newLogNextDue || calculateNextDueDate(newLogFrequency);

    const newEntry = {
      id: `hl-${Date.now()}`,
      date: newLogDate || 'Hoy',
      category: newLogCategory,
      title: finalTitle,
      productId: finalProductId,
      price: finalPrice,
      frequencyMonths: parseInt(newLogFrequency, 10) || (newLogCategory === 'vacunas' ? 12 : 1),
      nextDueDate: computedNextDue,
      reminderEnabled: newLogReminder,
      vetName: newLogCategory === 'consulta' ? (newLogVetName || 'Médico Veterinario') : undefined,
      notes: newLogNotes || '',
    };

    const updatedLogs = [newEntry, ...(healthLogs[petId] || [])];
    setHealthLogs({
      ...healthLogs,
      [petId]: updatedLogs,
    });

    // Persistir en Supabase si la mascota está en la base de datos
    if (petId && petId.length > 20) {
      addHealthLogToSupabase({
        petId,
        category: newLogCategory,
        title: finalTitle,
        productId: finalProductId,
        date: newLogDate || 'Hoy',
        nextDueDate: computedNextDue,
        frequencyMonths: parseInt(newLogFrequency, 10) || (newLogCategory === 'vacunas' ? 12 : 1),
        reminderEnabled: newLogReminder,
        vetName: newLogCategory === 'consulta' ? (newLogVetName || 'Médico Veterinario') : undefined,
        notes: newLogNotes || '',
      }).catch(err => console.error('Error saving health log to Supabase:', err));
    }

    setIsCustomVaccine(false);
    setCustomVaccineName('');
    setIsCustomAntiparasitic(false);
    setCustomAntiparasiticName('');
    setNewLogNotes('');
    setIsAddLogFormOpen(false);
    returnToMascotasDashboard();
  };

  // Abrir modal de bitácora directamente para una categoría médica específica y mascota
  const handleOpenLogModal = (category, targetPet = null) => {
    const pet = targetPet || pets.find(p => p.id === cuadernoActivePetId) || activeSelectedPet || pets[0];
    if (!pet) return;
    setSelectedHealthPet(pet);
    setIsHealthBitacoraOpen(true);
    setLogCategoryFilter(category);
    setNewLogCategory(category);
    if (category === 'vacunas') {
      setNewLogTitle(pet.type === 'gato' ? 'Vacuna Triple Felina (Trivalente)' : 'Vacuna Séxtuple Canina (DHPPI+L)');
      setNewLogFrequency('12');
      setNewLogNextDue(calculateNextDueDate(12));
    } else if (category === 'antiparasitario') {
      const petAntiparasitics = PRODUCTS.filter(p => 
        p.category === 'Antiparasitarios' && (
          pet.type === 'gato' ? p.petType === 'gatos' : p.petType === 'perros'
        )
      );
      if (petAntiparasitics.length > 0) {
        setSelectedAntiparasiticId(petAntiparasitics[0].id);
        setNewLogTitle(petAntiparasitics[0].name);
        setNewLogFrequency(`${petAntiparasitics[0].frequencyMonths || 1}`);
        setNewLogNextDue(calculateNextDueDate(petAntiparasitics[0].frequencyMonths || 1));
      } else {
        setNewLogTitle('Antiparasitario Interno / Externo');
        setNewLogFrequency('1');
        setNewLogNextDue(calculateNextDueDate(1));
      }
    } else {
      setNewLogTitle('Control Clínico & Evaluación Veterinaria');
      setNewLogFrequency('6');
      setNewLogNextDue(calculateNextDueDate(6));
    }
    setIsAddLogFormOpen(true);
  };

  // Abrir modal rápido para Consulta o Antiparasitario desde la pantalla principal
  const handleOpenQuickLog = (category, targetPet = null) => {
    const pet = targetPet || activeSelectedPet || pets[0];
    if (!pet) return;
    setSelectedHealthPet(pet);
    setQuickLogCategory(category);
    setNewLogCategory(category);
    if (category === 'antiparasitario') {
      const petAntiparasitics = PRODUCTS.filter(p => 
        p.category === 'Antiparasitarios' && (
          pet.type === 'gato' ? p.petType === 'gatos' : p.petType === 'perros'
        )
      );
      if (petAntiparasitics.length > 0) {
        setSelectedAntiparasiticId(petAntiparasitics[0].id);
        setNewLogTitle(petAntiparasitics[0].name);
        setNewLogFrequency(`${petAntiparasitics[0].frequencyMonths || 1}`);
        setNewLogNextDue(calculateNextDueDate(petAntiparasitics[0].frequencyMonths || 1));
      } else {
        setNewLogTitle('Antiparasitario Interno / Externo');
        setNewLogFrequency('1');
        setNewLogNextDue(calculateNextDueDate(1));
      }
    } else {
      setNewLogTitle('Consulta Médica & Evaluación Veterinaria');
      setNewLogFrequency('6');
      setNewLogNextDue(calculateNextDueDate(6));
      setNewLogNotes('');
    }
    setIsQuickLogModalOpen(true);
  };

  // Guardar registro rápido de Consulta o Antiparasitario
  const handleQuickLogSubmit = (e) => {
    e.preventDefault();
    if (!selectedHealthPet) return;

    let finalTitle = newLogTitle;
    let finalProductId = null;
    let finalPrice = null;

    if (quickLogCategory === 'antiparasitario') {
      if (isCustomAntiparasitic && customAntiparasiticName) {
        finalTitle = `${customAntiparasiticName} (${quickAntiparasiticType === 'interno' ? 'Interno' : 'Externo'})`;
      } else {
        const found = PRODUCTS.find(p => p.id === selectedAntiparasiticId);
        if (found) {
          finalTitle = `${found.name} (${quickAntiparasiticType === 'interno' ? 'Interno' : 'Externo'})`;
          finalProductId = found.id;
          finalPrice = found.price;
        }
      }
    }

    const petId = selectedHealthPet.id;
    const computedNextDue = newLogNextDue || calculateNextDueDate(newLogFrequency, newLogDate);

    const newEntry = {
      id: `hl-${Date.now()}`,
      date: newLogDate || todaySpanish,
      category: quickLogCategory,
      title: finalTitle,
      productId: finalProductId,
      price: finalPrice,
      frequencyMonths: parseInt(newLogFrequency, 10) || (quickLogCategory === 'antiparasitario' ? 1 : 6),
      nextDueDate: computedNextDue,
      reminderEnabled: newLogReminder,
      vetName: quickLogCategory === 'consulta' ? (newLogVetName || 'Médico Veterinario') : undefined,
      notes: newLogNotes || '',
      type: quickAntiparasiticType,
    };

    setHealthLogs(prev => ({
      ...prev,
      [petId]: [newEntry, ...(prev[petId] || [])],
    }));

    // Persistir en Supabase
    if (petId && petId.length > 20) {
      addHealthLogToSupabase({
        petId,
        category: quickLogCategory,
        title: finalTitle,
        productId: finalProductId,
        date: newLogDate || todaySpanish,
        nextDueDate: computedNextDue,
        frequencyMonths: parseInt(newLogFrequency, 10) || (quickLogCategory === 'antiparasitario' ? 1 : 6),
        reminderEnabled: newLogReminder,
        vetName: quickLogCategory === 'consulta' ? (newLogVetName || 'Médico Veterinario') : undefined,
        notes: newLogNotes || '',
      }).catch(err => console.error('Error saving quick health log to Supabase:', err));
    }

    setNewLogNotes('');
    setCustomAntiparasiticName('');
    setIsCustomAntiparasitic(false);
    setOrderToastMessage(`✓ ${quickLogCategory === 'consulta' ? 'Consulta e indicaciones' : 'Antiparasitario'} guardado en la ficha de ${selectedHealthPet?.name || 'tu mascota'}`);
    returnToMascotasDashboard();
    setTimeout(() => setOrderToastMessage(null), 4000);
  };

  // Guardar consulta agendada desde el nuevo modal veterinario (con Google Calendar)
  const handleSaveVetAppointment = (appointmentData) => {
    const petId = appointmentData.petId || selectedHealthPet?.id || activeSelectedPet?.id || pets[0]?.id;
    const petName = selectedHealthPet?.name || activeSelectedPet?.name || pets[0]?.name || 'tu mascota';

    const newEntry = {
      id: appointmentData.id || `apt-${Date.now()}`,
      date: appointmentData.date,
      time: appointmentData.time,
      category: 'consulta',
      type: 'agendada',
      title: `Consulta: ${appointmentData.title}`,
      vetName: appointmentData.vetName,
      clinic: appointmentData.clinic,
      location: appointmentData.location,
      notes: appointmentData.notes,
      nextDueDate: appointmentData.date,
      reminderEnabled: true,
      googleSynced: appointmentData.googleSynced,
    };

    setHealthLogs(prev => ({
      ...prev,
      [petId]: [newEntry, ...(prev[petId] || [])],
    }));

    // Persistir cita agendada en Supabase
    if (petId && petId.length > 20) {
      createVeterinaryAppointmentInSupabase({
        petId,
        customerId: customerDbId,
        title: appointmentData.title,
        date: appointmentData.date,
        time: appointmentData.time,
        clinic: appointmentData.clinic,
        googleSynced: appointmentData.googleSynced,
      }).catch(err => console.error('Error saving vet appointment to Supabase:', err));
    }

    returnToMascotasDashboard();

    if (appointmentData.googleSynced) {
      setOrderToastMessage(`✓ Cita de ${petName} agendada y abierta en Google Calendar`);
    } else {
      setOrderToastMessage(`✓ Consulta de ${petName} guardada en tu cuaderno veterinario`);
    }
    setTimeout(() => setOrderToastMessage(null), 4500);
  };

  // Guardar indicaciones y cuaderno de salud desde el nuevo modal veterinario
  const handleSaveVetHealthLog = (logData) => {
    const petId = logData.petId || selectedHealthPet?.id || activeSelectedPet?.id || pets[0]?.id;
    const petName = selectedHealthPet?.name || activeSelectedPet?.name || pets[0]?.name || 'tu mascota';

    const newEntry = {
      id: logData.id || `hl-${Date.now()}`,
      date: logData.date,
      category: 'consulta',
      type: 'atencion_realizada',
      title: logData.title,
      vetName: logData.vetName,
      clinic: logData.clinic,
      weight: logData.weight,
      diagnosis: logData.diagnosis,
      notes: logData.indications,
      dietRecommendations: logData.dietRecommendations,
      nextDueDate: logData.nextFollowUp !== 'Sin control' ? logData.nextFollowUp : undefined,
      reminderEnabled: logData.nextFollowUp !== 'Sin control',
    };

    setHealthLogs(prev => ({
      ...prev,
      [petId]: [newEntry, ...(prev[petId] || [])],
    }));

    if (logData.weight) {
      setPets(prev => prev.map(p => p.id === petId ? { ...p, weight: logData.weight } : p));
    }

    // Persistir indicaciones veterinarias en Supabase
    if (petId && petId.length > 20) {
      addHealthLogToSupabase({
        petId,
        category: 'consulta',
        title: logData.title,
        date: logData.date,
        vetName: logData.vetName,
        clinic: logData.clinic,
        weightAtTime: logData.weight,
        diagnosis: logData.diagnosis,
        indications: logData.indications,
        notes: logData.dietRecommendations,
        nextDueDate: logData.nextFollowUp !== 'Sin control' ? logData.nextFollowUp : undefined,
        reminderEnabled: logData.nextFollowUp !== 'Sin control',
      }).catch(err => console.error('Error saving vet health log to Supabase:', err));

      if (logData.weight) {
        updatePetInSupabase(petId, { weight: logData.weight }).catch(console.error);
      }
    }

    returnToMascotasDashboard();

    setOrderToastMessage(`✓ Indicaciones veterinarias guardadas en el Cuaderno de Salud de ${petName}`);
    setTimeout(() => setOrderToastMessage(null), 4500);
  };

  // Guardar antiparasitario desde el nuevo modal minimalista con recordatorios
  const handleSaveAntiparasiticLog = (logData) => {
    const petId = logData.petId || selectedHealthPet?.id || activeSelectedPet?.id || pets[0]?.id;
    const petName = selectedHealthPet?.name || activeSelectedPet?.name || pets[0]?.name || 'tu mascota';

    const newEntry = {
      id: logData.id || `hl-${Date.now()}`,
      date: logData.date,
      category: 'antiparasitario',
      type: logData.type, // 'interno' | 'externo'
      title: logData.title,
      frequencyMonths: logData.frequencyMonths,
      nextDueDate: logData.nextDueDate,
      reminderEnabled: logData.reminderEnabled,
      notes: logData.notes || '',
    };

    setHealthLogs(prev => ({
      ...prev,
      [petId]: [newEntry, ...(prev[petId] || [])],
    }));

    // Persistir antiparasitario en Supabase
    if (petId && petId.length > 20) {
      addHealthLogToSupabase({
        petId,
        category: 'antiparasitario',
        title: logData.title,
        date: logData.date,
        nextDueDate: logData.nextDueDate,
        frequencyMonths: logData.frequencyMonths,
        reminderEnabled: logData.reminderEnabled,
        notes: logData.notes || '',
      }).catch(err => console.error('Error saving antiparasitic log to Supabase:', err));
    }

    returnToMascotasDashboard();

    const typeText = logData.type === 'interno' ? 'Antiparasitario interno' : 'Antiparasitario externo';
    setOrderToastMessage(`✓ ${typeText} de ${petName} guardado con recordatorio para el ${logData.nextDueDateFormatted || logData.nextDueDate}`);
    setTimeout(() => setOrderToastMessage(null), 4500);
  };

  // Función universal para cerrar cualquier modal y volver directamente a la pantalla principal "Mis Mascotas" (donde están las cards)
  const returnToMascotasDashboard = () => {
    setIsVetConsultationModalOpen(false);
    setIsAntiparasiticModalOpen(false);
    setIsHealthBitacoraOpen(false);
    setSelectedHealthPet(null);
    setIsAddLogFormOpen(false);
    setIsQuickLogModalOpen(false);
    setSelectedReplenishPet(null);
    setIsAlternativeFoodModalOpen(false);
    setIsRedeemModalOpen(false);
    setLiveTrackingOrder(null);
    setIsAddPetModalOpen(false);
    setPetStep(1);
    setActiveTab('mascotas');
    if (!activeSelectedPet && pets.length > 0) {
      setSelectedPetId(pets[0].id);
    }
    navigate('/mi-cuenta?tab=mascotas', { replace: true });
    window.dispatchEvent(new CustomEvent('patitas_customer_tab_changed', { detail: 'mascotas' }));
    window.dispatchEvent(new CustomEvent('patitas_customer_tab', { detail: 'mascotas' }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handler para cerrar el modal veterinario y redirigir limpiamente a la pantalla "Mis Mascotas" (Imagen 2)
  const handleCloseVetModal = () => {
    returnToMascotasDashboard();
  };

  // Orders Filter State
  const [orderFilterPeriod, setOrderFilterPeriod] = useState('todos');
  const [orderFilterCategory, setOrderFilterCategory] = useState('todos');
  const [orderFilterStatus, setOrderFilterStatus] = useState('todos');
  const [orderFilterSearch, setOrderFilterSearch] = useState('');

  // Orders Mock Data with Categories, Delivery Schedules & Payment Types (0 for production)
  const INITIAL_MOCK_ORDERS = [];

  const [ordersList, setOrdersList] = useState([]);

  // Sincronizar pedidos del cliente con Supabase y reaccionar a nuevos checkouts
  useEffect(() => {
    let isMounted = true;
    const loadCustomerOrders = async () => {
      try {
        const dbOrders = await fetchOrdersFromSupabase();
        if (!isMounted) return;
        if (dbOrders && dbOrders.length > 0) {
          const activeEmail = (profileData.email || user?.email || '').toLowerCase().trim();
          const relevantOrders = dbOrders.filter((o) =>
            (customerDbId && o.customer_id === customerDbId) ||
            (activeEmail && o.customer_email && o.customer_email.toLowerCase().trim() === activeEmail)
          );

          if (relevantOrders.length > 0) {
            const mapped = relevantOrders.map((o) => {
              const primaryItem = o.order_items?.[0];
              const itemCount = o.order_items?.length || 1;
              const itemDesc = primaryItem
                ? `${primaryItem.product_name}${itemCount > 1 ? ` (+${itemCount - 1} más)` : ''}`
                : 'Pedido Patitas del Sur';

              let category = 'Alimento Seco';
              const lowerDesc = itemDesc.toLowerCase();
              if (lowerDesc.includes('snack')) category = 'Snacks Naturales';
              else if (lowerDesc.includes('nex') || lowerDesc.includes('brav') || lowerDesc.includes('pipeta') || lowerDesc.includes('anti')) category = 'Antiparasitarios / Salud';

              const statusText = o.status === 'entregado' ? 'Entregado ✓' : o.status === 'en_camino' ? 'En Camino 🚚' : 'En Preparación 📦';
              const statusColor = o.status === 'entregado' ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : 'bg-[#0E8388]/10 text-[#0E8388] border-[#0E8388]/30';

              return {
                id: o.id,
                date: o.created_at ? new Date(o.created_at).toLocaleDateString('es-CL', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Reciente',
                dateIso: o.delivery_date || (o.created_at ? o.created_at.split('T')[0] : '2026-08-17'),
                deliveryDate: o.delivery_date || (o.created_at ? o.created_at.split('T')[0] : null),
                product: itemDesc,
                category,
                total: `$${Number(o.total || 0).toLocaleString('es-CL')}`,
                pointsEarned: o.points_earned !== undefined ? o.points_earned : Math.floor((o.total || 0) / 1000),
                status: statusText,
                statusCode: o.status || 'en_preparacion',
                statusColor,
                deliveryDayText: o.delivery_day_text || 'Hoy Mismo',
                deliverySlot: o.delivery_slot || 'Tarde (14:00 - 19:00 hrs)',
                paymentMethod: o.payment_method || 'Tarjeta',
                address: o.address || 'Puerto Varas',
              };
            });

            setOrdersList(mapped);
          } else {
            setOrdersList([]);
          }
        } else {
          setOrdersList([]);
        }
      } catch (err) {
        console.error('Error fetching customer orders:', err);
      }
    };

    loadCustomerOrders();
    window.addEventListener('patitas_orders_updated', loadCustomerOrders);
    return () => {
      isMounted = false;
      window.removeEventListener('patitas_orders_updated', loadCustomerOrders);
    };
  }, [customerDbId, profileData.email, user?.email]);

  // Calcular puntos pendientes de compras cuyo pago aún está por confirmar
  const pendingPoints = useMemo(() => {
    return ordersList
      .filter((o) => {
        const isPaid = String(o.paymentStatus || '').toLowerCase() === 'pagado';
        const isCancelled = String(o.statusCode || '').toLowerCase().includes('cancel');
        return !isPaid && !isCancelled;
      })
      .reduce((sum, o) => sum + (Number(o.pointsEarned) || 0), 0);
  }, [ordersList]);

  // Productos de la Despensa Habitual (del pedido habitual guardado o derivado de órdenes anteriores)
  const habitualItems = useMemo(() => {
    if (Array.isArray(replenishmentData?.habitualOrder) && replenishmentData.habitualOrder.length > 0) {
      return replenishmentData.habitualOrder;
    }
    // Si aún no hay habitualOrder explícito, revisar en las órdenes del cliente si existe alguna compra previa de alimento
    const foodOrder = ordersList.find((o) => {
      const cat = (o.category || '').toLowerCase();
      const prod = (o.product || '').toLowerCase();
      return cat.includes('alimento') || prod.includes('kg') || prod.includes('alimento');
    });
    if (foodOrder) {
      return [{
        id: `prev-${foodOrder.id}`,
        name: foodOrder.product,
        price: parseInt(String(foodOrder.total).replace(/\D/g, ''), 10) || 45990,
        quantity: 1,
        weight: 'Formato Habitual',
        image: '/images/hero_dog.png',
        brand: 'Patitas del Sur',
        category: 'Alimento Seco',
      }];
    }
    return null;
  }, [replenishmentData?.habitualOrder, ordersList]);

  const hasHabitualItems = Array.isArray(habitualItems) && habitualItems.length > 0;

  // Ciclo de consumo y cálculo de días restantes para reposición
  const replenishmentCycle = useMemo(() => {
    const freq = Number(replenishmentData?.frequencyDays) || 30;
    const lastDateStr = replenishmentData?.lastOrderDate;
    if (!lastDateStr) {
      return {
        frequencyDays: freq,
        daysElapsed: 0,
        daysRemaining: freq,
        percent: 0,
        isDue: false,
        statusText: `Frecuencia configurada: cada ${freq} días`,
      };
    }

    const lastTime = new Date(lastDateStr).getTime();
    const nowTime = Date.now();
    const diffDays = Math.max(0, Math.floor((nowTime - lastTime) / (1000 * 60 * 60 * 24)));
    const remaining = Math.max(0, freq - diffDays);
    const percent = Math.min(100, Math.round((diffDays / freq) * 100));
    const isDue = remaining <= 5;

    return {
      frequencyDays: freq,
      daysElapsed: diffDays,
      daysRemaining: remaining,
      percent,
      isDue,
      statusText: remaining === 0
        ? '¡Momento de reponer tu despensa!'
        : `Quedan ${remaining} ${remaining === 1 ? 'día' : 'días'} para tu reposición`,
    };
  }, [replenishmentData]);

  // Manejador para actualizar frecuencia de reposición
  const handleUpdateFrequency = async (newDays) => {
    const nextData = {
      ...replenishmentData,
      frequencyDays: newDays,
      updatedAt: new Date().toISOString(),
    };
    setReplenishmentData(nextData);
    setIsEditingReplenishFrequency(false);
    try {
      await saveCustomerReplenishmentData(customerDbId, profileData?.phone || user?.phone, nextData);
      setOrderToastMessage(`Frecuencia de reposición actualizada a cada ${newDays} días ✓`);
    } catch (e) {
      console.warn('Error updating frequency:', e);
    }
  };

  // Manejador para repetir el pedido habitual completo con 1 clic
  const handleRepeatHabitualOrder = () => {
    if (!habitualItems || habitualItems.length === 0) {
      handleSwitchTab('tienda');
      return;
    }

    let addedCount = 0;
    habitualItems.forEach((item) => {
      const catalogMatch = activeCatalog.find(
        (p) => p.id === item.id || (p.name && item.name && p.name.toLowerCase() === item.name.toLowerCase())
      );
      const productToAdd = catalogMatch || {
        id: item.id || `custom-${Date.now()}`,
        name: item.name,
        price: item.price || 0,
        image: item.image || '/images/hero_dog.png',
        brand: item.brand || 'Patitas del Sur',
        category: item.category || 'Alimento Seco',
        weights: [item.weight || 'Formato Estándar'],
      };

      const weightToAdd = item.weight || productToAdd.weights?.[0] || 'Formato Estándar';
      const qtyToAdd = item.quantity || 1;
      onAddToCart(productToAdd, weightToAdd, qtyToAdd);
      addedCount++;
    });

    setOrderToastMessage(`¡${addedCount} ${addedCount === 1 ? 'producto cargado' : 'productos cargados'} de tu despensa al carrito! 🛒`);
    window.dispatchEvent(new CustomEvent('patitas_open_cart'));
  };

  // Actualizar cantidad de un producto específico dentro de la despensa habitual
  const handleUpdateHabitualItemQuantity = async (index, newQty) => {
    const currentList = Array.isArray(habitualItems) ? [...habitualItems] : [];
    if (!currentList[index]) return;

    if (newQty <= 0) {
      handleRemoveHabitualItem(index);
      return;
    }

    currentList[index] = {
      ...currentList[index],
      quantity: newQty,
    };

    const nextData = {
      ...replenishmentData,
      habitualOrder: currentList,
      updatedAt: new Date().toISOString(),
    };
    setReplenishmentData(nextData);
    try {
      await saveCustomerReplenishmentData(customerDbId, profileData?.phone || user?.phone, nextData);
    } catch (e) {
      console.warn('Error saving habitual quantity:', e);
    }
  };

  // Quitar un producto de la despensa habitual
  const handleRemoveHabitualItem = async (index) => {
    const currentList = Array.isArray(habitualItems) ? [...habitualItems] : [];
    const removed = currentList.splice(index, 1)[0];

    const nextData = {
      ...replenishmentData,
      habitualOrder: currentList,
      updatedAt: new Date().toISOString(),
    };
    setReplenishmentData(nextData);
    setOrderToastMessage(`"${removed?.name || 'Producto'}" removido de tu despensa`);
    try {
      await saveCustomerReplenishmentData(customerDbId, profileData?.phone || user?.phone, nextData);
    } catch (e) {
      console.warn('Error removing habitual item:', e);
    }
  };

  // Agregar un producto nuevo del catálogo a la despensa habitual
  const handleAddProductToHabitual = async (product, selectedWeight, quantity = 1) => {
    if (!product) return;
    const currentList = Array.isArray(habitualItems) ? [...habitualItems] : [];
    const chosenWeight = selectedWeight || product.weights?.[0] || 'Formato Estándar';

    const variantMatch = (product.variants || []).find((v) => v.format === chosenWeight || v.weight === chosenWeight);
    const resolvedPrice = variantMatch && typeof variantMatch.price === 'number' ? variantMatch.price : (product.price || 0);

    const existingIndex = currentList.findIndex(
      (item) => (item.id === product.id || item.name === product.name) && (item.weight === chosenWeight)
    );

    if (existingIndex >= 0) {
      currentList[existingIndex] = {
        ...currentList[existingIndex],
        quantity: (currentList[existingIndex].quantity || 1) + quantity,
        price: resolvedPrice,
      };
    } else {
      currentList.push({
        id: product.id,
        name: product.name,
        brand: product.brand || 'Patitas del Sur',
        price: resolvedPrice,
        quantity,
        weight: chosenWeight,
        image: product.image || '/images/hero_dog.png',
        category: product.category || 'Alimento Seco',
      });
    }

    const nextData = {
      ...replenishmentData,
      habitualOrder: currentList,
      updatedAt: new Date().toISOString(),
    };
    setReplenishmentData(nextData);
    setIsAddHabitualProductModalOpen(false);
    setOrderToastMessage(`✓ "${product.name}" agregado a tu despensa habitual 🥫`);
    try {
      await saveCustomerReplenishmentData(customerDbId, profileData?.phone || user?.phone, nextData);
    } catch (e) {
      console.warn('Error saving habitual product:', e);
    }
  };

  // Catálogo filtrado para el modal de agregar producto a la despensa
  const filteredCatalogForHabitual = useMemo(() => {
    if (!activeCatalog || activeCatalog.length === 0) return [];

    let pool = activeCatalog.filter((p) => p && p.isActive !== false && p.is_active !== false);

    if (habitualCategoryFilter === 'perro') {
      pool = pool.filter((p) => {
        const t = (p.petType || p.pet_type || '').toLowerCase();
        return t.includes('perro') || t === 'ambos' || t === 'todos';
      });
    } else if (habitualCategoryFilter === 'gato') {
      pool = pool.filter((p) => {
        const t = (p.petType || p.pet_type || '').toLowerCase();
        return t.includes('gato') || t === 'ambos' || t === 'todos';
      });
    } else if (habitualCategoryFilter === 'alimento') {
      pool = pool.filter((p) => {
        const c = (p.category || '').toLowerCase();
        return c.includes('alimento') || c.includes('seco') || c.includes('húmedo');
      });
    } else if (habitualCategoryFilter === 'snacks') {
      pool = pool.filter((p) => (p.category || '').toLowerCase().includes('snack'));
    }

    if (habitualSearchQuery.trim()) {
      const q = habitualSearchQuery.toLowerCase();
      pool = pool.filter((p) => {
        const name = (p.name || '').toLowerCase();
        const brand = (p.brand || '').toLowerCase();
        const cat = (p.category || '').toLowerCase();
        return name.includes(q) || brand.includes(q) || cat.includes(q);
      });
    }

    return pool;
  }, [activeCatalog, habitualCategoryFilter, habitualSearchQuery]);

  // Filtered Orders Calculation
  const filteredOrders = ordersList.filter((order) => {
    // 1. Period / Date Filter
    if (orderFilterPeriod === '30dias') {
      if (!order.dateIso.startsWith('2026-08') && !order.dateIso.startsWith('2026-07-28')) return false;
    } else if (orderFilterPeriod === '3meses') {
      if (!['2026-08', '2026-07', '2026-06'].some(m => order.dateIso.startsWith(m))) return false;
    } else if (orderFilterPeriod === '2026') {
      if (!order.dateIso.startsWith('2026')) return false;
    }

    // 2. Product Category Filter
    if (orderFilterCategory !== 'todos') {
      if (order.category !== orderFilterCategory) return false;
    }

    // 3. Status Filter
    if (orderFilterStatus !== 'todos') {
      if (order.statusCode !== orderFilterStatus) return false;
    }

    // 4. Search Filter
    if (orderFilterSearch.trim()) {
      const q = orderFilterSearch.toLowerCase();
      const matchId = order.id.toLowerCase().includes(q);
      const matchProduct = order.product.toLowerCase().includes(q);
      if (!matchId && !matchProduct) return false;
    }

    return true;
  });

  // Store Filter States (Matching public store)
  const [storeSearchQuery, setStoreSearchQuery] = useState('');
  const [storeSelectedBrand, setStoreSelectedBrand] = useState('Todas');
  const [storeProteinFilter, setStoreProteinFilter] = useState('Todos');
  const [storeWeightFilter, setStoreWeightFilter] = useState('Todos');
  const [storeCategoryFilter, setStoreCategoryFilter] = useState('Todos');

  const baseStoreProducts = useMemo(() => {
    return activeCatalog.filter((p) => {
      if (storeFilter === 'perro') return p.petType === 'perros' || p.petType === 'ambos';
      if (storeFilter === 'gato') return p.petType === 'gatos' || p.petType === 'ambos';
      return true;
    });
  }, [storeFilter, activeCatalog]);

  // Brand product counts
  const storeBrandCounts = useMemo(() => {
    const counts = {};
    baseStoreProducts.forEach((p) => {
      if (p.brand) {
        counts[p.brand] = (counts[p.brand] || 0) + 1;
      }
    });
    return counts;
  }, [baseStoreProducts]);

  // Master Filtered Store Products
  const storeFilteredProducts = useMemo(() => {
    return baseStoreProducts.filter((product) => {
      // 1. Brand filter
      if (storeSelectedBrand !== 'Todas' && product.brand !== storeSelectedBrand) {
        return false;
      }

      // 2. Search query
      if (storeSearchQuery.trim()) {
        const q = storeSearchQuery.toLowerCase();
        const matchName = product.name.toLowerCase().includes(q);
        const matchTagline = product.tagline ? product.tagline.toLowerCase().includes(q) : false;
        const matchBrand = product.brand ? product.brand.toLowerCase().includes(q) : false;
        const matchIngredients = product.ingredients
          ? product.ingredients.some((ing) => ing.toLowerCase().includes(q))
          : false;
        if (!matchName && !matchTagline && !matchBrand && !matchIngredients) {
          return false;
        }
      }

      // 3. Protein % Filter
      if (storeProteinFilter !== 'Todos') {
        const prot = product.proteinValue || 0;
        if (storeProteinFilter === 'high' && (prot < 30 || prot > 40)) return false;
        if (storeProteinFilter === 'super' && prot <= 40) return false;
        if (storeProteinFilter === 'moderate' && prot >= 30) return false;
      }

      // 4. Weight Filter
      if (storeWeightFilter !== 'Todos') {
        const weights = product.weights || [];
        if (storeWeightFilter === 'snacks') {
          const isSnackWeight = weights.some((w) => w.includes('g') && !w.includes('kg'));
          if (!isSnackWeight) return false;
        } else if (storeWeightFilter === 'standard') {
          const isStandardWeight = weights.some((w) => w.includes('2 kg') || w.includes('3 kg') || w.includes('1.5 kg') || w.includes('4 kg') || w.includes('7 kg'));
          if (!isStandardWeight) return false;
        } else if (storeWeightFilter === 'bulk') {
          const isBulkWeight = weights.some((w) => w.includes('5 kg') || w.includes('10 kg') || w.includes('12 kg') || w.includes('15 kg'));
          if (!isBulkWeight) return false;
        }
      }

      // 5. Category Filter
      if (storeCategoryFilter !== 'Todos' && product.category !== storeCategoryFilter) {
        return false;
      }

      return true;
    });
  }, [baseStoreProducts, storeSelectedBrand, storeSearchQuery, storeProteinFilter, storeWeightFilter, storeCategoryFilter]);

  // Productos ordenados para la tienda adaptados a la mascota activa o catálogo general
  const mobileStoreProducts = useMemo(() => {
    const isCat = activeSelectedPet?.type === 'gato';
    const targetSpecies = activeSelectedPet ? (isCat ? 'gatos' : 'perros') : null;

    // Base: productos para la especie de la mascota activa o catálogo general si aún no tiene mascotas
    const speciesProducts = targetSpecies
      ? activeCatalog.filter(p => p.petType === targetSpecies || p.petType === 'ambos')
      : activeCatalog;

    // 1. Si hay texto en el buscador
    if (storeSearchQuery.trim()) {
      const q = storeSearchQuery.toLowerCase();
      return speciesProducts.filter(p =>
        p.name.toLowerCase().includes(q) ||
        (p.tagline && p.tagline.toLowerCase().includes(q)) ||
        (p.brand && p.brand.toLowerCase().includes(q)) ||
        (p.category && p.category.toLowerCase().includes(q))
      );
    }

    // 2. Si la categoría seleccionada es 'destacados'
    if (storeMobileCategory === 'destacados') {
      const featured = [];
      // 1) Alimento habitual de la mascota
      if (currentPetFoodProduct) {
        featured.push(currentPetFoodProduct);
      }
      // 2) Antiparasitarios estrella de tienda
      const antiparasitics = speciesProducts.filter(p => p.category === 'Antiparasitarios');
      antiparasitics.forEach(a => {
        if (!featured.find(f => f.id === a.id)) featured.push(a);
      });
      // 3) Snacks naturales
      const snacks = speciesProducts.filter(p => p.category === 'Snacks Naturales');
      snacks.forEach(s => {
        if (!featured.find(f => f.id === s.id)) featured.push(s);
      });
      // 4) Otros alimentos o fórmulas
      const otherFoods = speciesProducts.filter(p => p.category === 'Alimento Seco' && p.id !== currentPetFoodProduct?.id);
      otherFoods.forEach(o => {
        if (!featured.find(f => f.id === o.id)) featured.push(o);
      });

      return featured;
    }

    // 3. Categorías específicas
    if (storeMobileCategory === 'alimento') {
      return speciesProducts.filter(p => p.category === 'Alimento Seco' || p.category === 'Alimento Húmedo');
    }
    if (storeMobileCategory === 'antiparasitarios') {
      return speciesProducts.filter(p => p.category === 'Antiparasitarios');
    }
    if (storeMobileCategory === 'snacks') {
      return speciesProducts.filter(p => p.category === 'Snacks Naturales');
    }

    // 'todos'
    return speciesProducts;
  }, [activeSelectedPet?.id, activeSelectedPet?.type, storeMobileCategory, storeSearchQuery, currentPetFoodProduct]);

  const [hoveredStoreCircle, setHoveredStoreCircle] = useState(null);

  const proteinChips = [
    { label: 'Todas', value: 'Todos', emoji: '✨' },
    { label: 'Alta (30%-40%)', value: 'high', emoji: '💪' },
    { label: 'Súper (>70%)', value: 'super', emoji: '⚡' },
    { label: 'Moderada (<30%)', value: 'moderate', emoji: '🌱' },
  ];

  const weightChips = [
    { label: 'Todos', value: 'Todos', emoji: '✨' },
    { label: 'Snacks (100-250g)', value: 'snacks', emoji: '🍖' },
    { label: 'Bolsas (1.5-4kg)', value: 'standard', emoji: '📦' },
    { label: 'Granel (5-15kg)', value: 'bulk', emoji: '🏔️' },
  ];

  const categoryChips = [
    { label: 'Todos', value: 'Todos', emoji: '✨' },
    { label: 'Alimento Seco', value: 'Alimento Seco', emoji: '🥣' },
    { label: 'Snacks Naturales', value: 'Snacks Naturales', emoji: '🍖' },
    { label: 'Alimento Húmedo', value: 'Alimento Húmedo', emoji: '🥫' },
    { label: 'Suplementos', value: 'Suplementos', emoji: '🧪' },
  ];

  const getActiveProteinLabel = () => {
    const found = proteinChips.find((c) => c.value === storeProteinFilter);
    return found ? found.label : 'Proteína';
  };

  const getActiveWeightLabel = () => {
    const found = weightChips.find((c) => c.value === storeWeightFilter);
    return found ? found.label : 'Formato (Peso)';
  };

  const getActiveCategoryLabel = () => {
    const found = categoryChips.find((c) => c.value === storeCategoryFilter);
    return found ? found.label : 'Tipo de Alimento';
  };

  const handleResetStoreFilters = () => {
    setStoreSelectedBrand('Todas');
    setStoreSearchQuery('');
    setStoreProteinFilter('Todos');
    setStoreWeightFilter('Todos');
    setStoreCategoryFilter('Todos');
  };

  const activeStoreFiltersCount =
    (storeSearchQuery ? 1 : 0) +
    (storeSelectedBrand !== 'Todas' ? 1 : 0) +
    (storeProteinFilter !== 'Todos' ? 1 : 0) +
    (storeWeightFilter !== 'Todos' ? 1 : 0) +
    (storeCategoryFilter !== 'Todos' ? 1 : 0);

  return (
    <div className="min-h-screen bg-[#FAF9F6] pt-4 pb-20 px-4 md:px-8">
      
      {/* PERSISTENT FLOATING TOP PET SELECTOR & NAVIGATION BAR */}
      <header className="sticky top-3 z-40 mb-6 w-full max-w-xl md:max-w-5xl lg:max-w-6xl xl:max-w-7xl mx-auto px-2 sm:px-4">
        <div className="bg-white/95 backdrop-blur-2xl border border-slate-200/90 rounded-2xl md:rounded-full p-2 md:p-1.5 shadow-lg shadow-slate-900/5 flex items-center justify-between gap-2 md:gap-4 transition-all duration-300">
          
          {/* Left: Pet Capsules or Add Pet Button */}
          <div className="flex items-center gap-1.5 overflow-x-auto py-0.5 px-1 scrollbar-none min-w-0 shrink-0">
            {pets.length > 0 ? (
              <>
                {pets.map((pet) => {
                  const isSelected = pet.id === selectedPetId;
                  const isCat = pet.type === 'gato';
                  return (
                    <button
                      key={pet.id}
                      type="button"
                      onClick={() => handleSelectPet(pet)}
                      className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full transition-all duration-200 shrink-0 cursor-pointer active:scale-95 ${
                        isSelected
                          ? 'bg-gradient-to-r from-[#0A3E40] to-[#0E8388] text-white shadow-md shadow-[#0E8388]/25 ring-2 ring-[#0E8388] ring-offset-1'
                          : 'bg-slate-100/90 text-slate-700 hover:bg-slate-200/80 hover:text-slate-900 border border-slate-200/60'
                      }`}
                      title={`Ver perfil y comprar para ${pet.name}`}
                    >
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs shadow-xs ${
                        isSelected ? 'bg-white/20' : 'bg-white'
                      }`}>
                        {isCat ? '🐱' : '🐶'}
                      </div>
                      <span className={`text-xs tracking-tight ${isSelected ? 'font-black' : 'font-bold'}`}>
                        {pet.name.split(' ')[0]}
                      </span>
                      {isSelected && (
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse" />
                      )}
                    </button>
                  );
                })}

                {/* Quick button to add another pet */}
                <button
                  type="button"
                  onClick={() => {
                    setPetStep(1);
                    setIsAddPetModalOpen(true);
                  }}
                  className="w-7 h-7 rounded-full bg-slate-100/80 hover:bg-[#0E8388]/10 hover:text-[#0E8388] text-slate-400 border border-dashed border-slate-300 flex items-center justify-center text-xs font-bold transition-all shrink-0 cursor-pointer active:scale-95"
                  title="Agregar otra mascota"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setPetStep(1);
                  setIsAddPetModalOpen(true);
                }}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-50 hover:bg-emerald-100 text-[#0A3E40] border border-emerald-300 font-extrabold text-xs transition-all cursor-pointer shadow-2xs active:scale-95 group"
                title="Registra a tu primera mascota"
              >
                <div className="w-5 h-5 rounded-full bg-[#0E8388] text-white flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform">
                  <Plus className="w-3 h-3 stroke-[3]" />
                </div>
                <span>+ Registrar Mascota</span>
              </button>
            )}
          </div>

          {/* Center (Desktop only): Navigation Tabs */}
          <nav aria-label="Navegación Desktop" className="hidden md:flex items-center gap-1 bg-slate-100/80 p-1 rounded-full border border-slate-200/80 shadow-2xs">
            <button
              type="button"
              onClick={() => handleSwitchTab('mascotas')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs transition-all cursor-pointer ${
                activeTab === 'mascotas'
                  ? 'bg-white text-[#0A3E40] font-black shadow-xs ring-1 ring-slate-200/60'
                  : 'text-slate-600 hover:text-slate-900 font-bold hover:bg-white/60'
              }`}
            >
              <Heart className={`w-3.5 h-3.5 ${activeTab === 'mascotas' ? 'text-[#0E8388] fill-[#0E8388]' : 'text-slate-500'}`} />
              <span>Mis Mascotas</span>
            </button>

            <button
              type="button"
              onClick={() => handleSwitchTab('tienda')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs transition-all cursor-pointer ${
                activeTab === 'tienda'
                  ? 'bg-white text-[#0A3E40] font-black shadow-xs ring-1 ring-slate-200/60'
                  : 'text-slate-600 hover:text-slate-900 font-bold hover:bg-white/60'
              }`}
            >
              <ShoppingBag className={`w-3.5 h-3.5 ${activeTab === 'tienda' ? 'text-[#0E8388]' : 'text-slate-500'}`} />
              <span>Tienda</span>
            </button>

            <button
              type="button"
              onClick={() => handleSwitchTab('cuaderno')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs transition-all cursor-pointer ${
                activeTab === 'cuaderno'
                  ? 'bg-white text-[#0A3E40] font-black shadow-xs ring-1 ring-slate-200/60'
                  : 'text-slate-600 hover:text-slate-900 font-bold hover:bg-white/60'
              }`}
            >
              <Stethoscope className={`w-3.5 h-3.5 ${activeTab === 'cuaderno' ? 'text-[#0E8388]' : 'text-slate-500'}`} />
              <span>Cuaderno Veterinario</span>
            </button>

            <button
              type="button"
              onClick={() => handleSwitchTab('compras')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs transition-all cursor-pointer ${
                activeTab === 'compras'
                  ? 'bg-white text-[#0A3E40] font-black shadow-xs ring-1 ring-slate-200/60'
                  : 'text-slate-600 hover:text-slate-900 font-bold hover:bg-white/60'
              }`}
            >
              <Award className={`w-3.5 h-3.5 ${activeTab === 'compras' ? 'text-amber-500' : 'text-slate-500'}`} />
              <span>Pedidos & Puntos</span>
            </button>
          </nav>

          {/* Right: Mi Perfil & Logout Action Buttons */}
          <div className="flex items-center justify-end gap-1.5 shrink-0 pr-1">
            <button
              type="button"
              onClick={() => setIsProfileModalOpen(true)}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full bg-slate-100/90 hover:bg-[#0E8388]/15 text-slate-700 hover:text-[#0A3E40] font-extrabold text-xs transition-all border border-slate-200/80 active:scale-95 shadow-xs cursor-pointer group"
              title="Mi perfil y datos personales"
            >
              <div className="w-5 h-5 rounded-full bg-[#0E8388]/15 group-hover:bg-[#0E8388] text-[#0E8388] group-hover:text-white flex items-center justify-center transition-colors">
                <User className="w-3 h-3 stroke-[2.5]" />
              </div>
              <span className="text-[11px] font-bold">Mi Perfil</span>
            </button>

            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full bg-slate-100/90 hover:bg-rose-50 text-slate-700 hover:text-rose-600 font-extrabold text-xs transition-all border border-slate-200/80 active:scale-95 shadow-xs cursor-pointer"
              title="Cerrar sesión y salir"
            >
              <LogOut className="w-3.5 h-3.5 text-rose-500" />
              <span className="hidden sm:inline text-[11px]">Salir</span>
            </button>
          </div>

        </div>
      </header>

      {/* MAIN CONTENT AREA */}
      <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-300">

        {/* TAB 1: PWA PRINCIPAL DEL CLIENTE: OPCIONES Y NUTRICIÓN DE LA MASCOTA */}
        {activeTab === 'mascotas' && (() => {
          // Si el cliente no tiene mascotas registradas (cuenta recién creada)
          if (pets.length === 0) {
            return (
              <div className="w-full max-w-5xl lg:max-w-6xl mx-auto space-y-6 animate-in fade-in duration-300">
                
                {/* 1. HERO ONBOARDING BIENVENIDA */}
                <div className="rounded-3xl bg-gradient-to-br from-[#0A3E40] via-[#0E8388] to-teal-700 text-white p-6 sm:p-10 shadow-xl border border-teal-600/30 relative overflow-hidden">
                  <div className="relative z-10 max-w-2xl space-y-4">
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-xs font-black text-amber-300">
                      <Sparkles className="w-4 h-4 text-amber-300" />
                      <span>Bienvenido/a a tu Portal Patitas del Sur</span>
                    </div>

                    <h1 className="text-2xl sm:text-4xl font-black text-white leading-tight">
                      ¡Hola, {currentUser.name ? currentUser.name.split(' ')[0] : 'Tutor/a'}! 🐾
                    </h1>

                    <p className="text-sm sm:text-base text-emerald-50 leading-relaxed font-medium">
                      Este es tu espacio inteligente para cuidar la nutrición de tu regalón, programar avisos de reposición antes de que se termine su saco de comida y gestionar su salud veterinaria.
                    </p>

                    <div className="pt-2 flex flex-wrap items-center gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          setPetStep(1);
                          setIsAddPetModalOpen(true);
                        }}
                        className="px-6 py-3.5 rounded-2xl bg-white text-[#0A3E40] hover:bg-emerald-50 font-black text-sm shadow-lg shadow-black/10 hover:shadow-xl transition-all flex items-center gap-2.5 active:scale-95 cursor-pointer group"
                      >
                        <div className="w-6 h-6 rounded-full bg-[#0E8388] text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                          <Plus className="w-4 h-4 stroke-[3]" />
                        </div>
                        <span>Registrar a mi primera mascota</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleSwitchTab('tienda')}
                        className="px-5 py-3 rounded-2xl bg-white/15 hover:bg-white/25 text-white font-bold text-sm backdrop-blur-md border border-white/30 transition-all flex items-center gap-2 cursor-pointer active:scale-95"
                      >
                        <ShoppingBag className="w-4 h-4 text-emerald-300" />
                        <span>Explorar Tienda</span>
                      </button>
                    </div>
                  </div>

                  {/* Decorative illustration / badges */}
                  <div className="absolute -bottom-8 -right-8 w-64 h-64 sm:w-80 sm:h-80 rounded-full bg-white/10 blur-3xl pointer-events-none" />
                  <div className="hidden lg:flex absolute right-12 bottom-6 top-6 items-center justify-center pointer-events-none opacity-20">
                    <span className="text-9xl select-none">🐾</span>
                  </div>
                </div>

                {/* 2. BENEFICIOS CLAVE DEL PORTAL (3 MICRO-CARDS) */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs space-y-2.5 hover:border-teal-400 transition-all">
                    <div className="w-10 h-10 rounded-xl bg-teal-50 text-[#0E8388] flex items-center justify-center font-bold text-lg">
                      🍲
                    </div>
                    <h3 className="font-extrabold text-slate-900 text-sm">
                      Reposición Inteligente
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Calculamos automáticamente los días de duración del saco según el peso de tu mascota y te avisamos antes de que se acabe.
                    </p>
                  </div>

                  <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs space-y-2.5 hover:border-amber-400 transition-all">
                    <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-lg">
                      🩺
                    </div>
                    <h3 className="font-extrabold text-slate-900 text-sm">
                      Cuaderno Veterinario
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Lleva registro de vacunas, desparasitaciones y consultas con avisos periódicos de cuándo le corresponde su próxima dosis.
                    </p>
                  </div>

                  <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs space-y-2.5 hover:border-emerald-400 transition-all">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-lg">
                      🎁
                    </div>
                    <h3 className="font-extrabold text-slate-900 text-sm">
                      Puntos & Envíos Gratis
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Todas tus compras suman Puntos Patitas. Acumula puntos para canjear despachos gratuitos y cupones de descuento exclusivos.
                    </p>
                  </div>
                </div>

                {/* 3. FILA INFERIOR: PUNTOS + ACCESO A PERFIL & DATOS */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Points Info Card */}
                  <div
                    onClick={() => setIsRedeemModalOpen(true)}
                    className="p-5 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50/70 to-amber-50/60 border border-emerald-200/90 hover:border-emerald-400 shadow-2xs hover:shadow-xs transition-all cursor-pointer group flex flex-col justify-between space-y-3"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0A3E40] to-[#0E8388] text-amber-300 flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                          <Gift className="w-5 h-5 text-amber-300" />
                        </div>
                        <div>
                          <span className="text-[11px] font-black uppercase tracking-wider text-emerald-800 block">
                            Puntos Patitas
                          </span>
                          <span className="text-lg font-black text-slate-900">
                            {userPoints.toLocaleString('es-CL')} Pts
                          </span>
                        </div>
                      </div>
                      <span className="text-xs font-black px-3 py-1 rounded-full bg-white text-[#0A3E40] border border-emerald-300 shadow-2xs group-hover:bg-[#0E8388] group-hover:text-white transition-colors flex items-center gap-1">
                        <span>Ver Beneficios</span>
                        <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                      </span>
                    </div>
                    <p className="text-xs text-slate-600">
                      Empieza a acumular puntos desde tu primera compra en Puerto Varas y la cuenca del Lago Llanquihue.
                    </p>
                  </div>

                  {/* Profile / Delivery info card */}
                  <div
                    onClick={() => setIsProfileModalOpen(true)}
                    className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-teal-400 shadow-2xs hover:shadow-xs transition-all cursor-pointer group flex flex-col justify-between space-y-3"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-teal-50 text-[#0E8388] flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                          <User className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <span className="text-[11px] font-black uppercase tracking-wider text-teal-800 block">
                            Datos de Tutor & Despacho
                          </span>
                          <span className="text-sm font-bold text-slate-900 truncate block">
                            {currentUser.email || 'Configura tus datos'}
                          </span>
                        </div>
                      </div>
                      <span className="text-xs font-black px-3 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200 shadow-2xs group-hover:bg-[#0E8388] group-hover:text-white transition-colors flex items-center gap-1 shrink-0">
                        <span>Gestionar</span>
                        <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 truncate">
                      {currentUser.address ? `Dirección: ${currentUser.address}` : 'Agrega tu dirección en Puerto Varas para despachos ágiles.'}
                    </p>
                  </div>
                </div>

              </div>
            );
          }

          // Si el cliente tiene al menos una mascota registrada
          const pet = activeSelectedPet || pets[0];
          const { currentProduct } = getReplenishProducts(pet);
          const priceDisplay = currentProduct?.price ? `${formatCLP(currentProduct.price)} CLP` : '$68.990 CLP';
          const isCurrentFoodOutOfStock = isProductOutOfStock(currentProduct);

          return (
            <div className="w-full max-w-5xl lg:max-w-6xl mx-auto space-y-4 animate-in fade-in duration-200">

              {/* Toast de confirmación si existe */}
              {orderToastMessage && (
                <div className="p-3 rounded-2xl bg-gradient-to-r from-[#0A3E40] to-[#0E8388] text-white shadow-md flex items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2 font-bold truncate">
                    <Sparkles className="w-4 h-4 text-amber-300 shrink-0" />
                    <span className="truncate">{orderToastMessage}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setOrderToastMessage(null)}
                    className="text-white/80 hover:text-white p-0.5 cursor-pointer shrink-0"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* Layout responsivo: Móvil 1 columna / Desktop 2 columnas */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                
                {/* Columna Izquierda (Desktop 7 cols): Alimento habitual & Carrusel */}
                <div className="lg:col-span-7 space-y-4">
                  {/* 1. CARD INTELIGENTE: MI DESPENSA HABITUAL */}
                  <div className="animated-border-card">
                    <div className="animated-border-card-inner p-4 sm:p-5 space-y-4">
                      {/* Header de la Despensa */}
                      <div className="flex items-center justify-between border-b border-slate-100 pb-3 gap-2 flex-wrap">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-[#0A3E40] to-[#0E8388] text-white flex items-center justify-center text-base shadow-xs">
                            🥫
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="text-sm sm:text-base font-black text-slate-900 tracking-tight">
                                Mi Despensa Habitual
                              </h3>
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200">
                                Cada {replenishmentCycle.frequencyDays} días
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500 font-medium">
                              {pets.length > 1
                                ? `Reposición unificada para tus ${pets.length} mascotas (${pets.map(p => p.name.split(' ')[0]).join(', ')})`
                                : 'Tus alimentos se compran juntos para tus regalones'}
                            </p>
                          </div>
                        </div>

                        {/* Botón para ajustar frecuencia */}
                        <button
                          type="button"
                          onClick={() => setIsEditingReplenishFrequency(!isEditingReplenishFrequency)}
                          className="px-2.5 py-1 rounded-xl text-[11px] font-bold text-[#0E8388] hover:bg-[#E6F4F1] border border-transparent hover:border-[#0E8388]/30 transition-all flex items-center gap-1 cursor-pointer"
                        >
                          <span>⚙️ Frecuencia</span>
                          <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isEditingReplenishFrequency ? 'rotate-180' : ''}`} />
                        </button>
                      </div>

                      {/* Selector inline de frecuencia desplegable */}
                      {isEditingReplenishFrequency && (
                        <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 animate-in fade-in duration-150">
                          <div className="text-[11px] font-black text-slate-700">
                            ¿Cada cuántos días sueles reponer el alimento seco en casa?
                          </div>
                          <div className="grid grid-cols-5 gap-1.5">
                            {[15, 21, 30, 45, 60].map((days) => (
                              <button
                                key={days}
                                type="button"
                                onClick={() => handleUpdateFrequency(days)}
                                className={`py-1.5 px-1 rounded-xl text-center text-xs transition-all cursor-pointer ${
                                  replenishmentCycle.frequencyDays === days
                                    ? 'bg-[#0E8388] text-white font-black shadow-xs'
                                    : 'bg-white hover:bg-emerald-50 text-slate-700 font-bold border border-slate-200'
                                }`}
                              >
                                <div className="font-extrabold">{days}d</div>
                                <div className="text-[8.5px] opacity-80">{days === 30 ? '⭐ Habitual' : `${days} días`}</div>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Lista de productos habituales o Empty state */}
                      {hasHabitualItems ? (
                        <div className="space-y-3.5">
                          {/* Productos en la despensa habitual */}
                          <div className="divide-y divide-slate-100 rounded-2xl bg-slate-50/70 border border-slate-200/80 p-2 sm:p-3 space-y-2">
                            {habitualItems.map((item, idx) => {
                              const { brand: brandUpper, cleanName } = extractBrandAndCleanName({
                                name: item.name,
                                brand: item.brand,
                              });
                              return (
                                <div key={`${item.id}-${idx}`} className="flex items-center gap-3 pt-2.5 first:pt-0">
                                  <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 p-1 shrink-0 flex items-center justify-center">
                                    <img
                                      src={item.image || '/images/hero_dog.png'}
                                      alt={item.name}
                                      className="w-full h-full object-contain"
                                    />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    {brandUpper && (
                                      <span className="block text-[9px] font-black uppercase tracking-wider text-slate-400">
                                        {brandUpper}
                                      </span>
                                    )}
                                    <div className="text-xs font-bold text-slate-900 truncate" title={item.name}>
                                      {cleanName}
                                    </div>
                                    <div className="text-[11px] text-slate-500 font-medium flex items-center gap-1.5 mt-0.5">
                                      {item.weight && <span className="font-bold text-slate-700">{item.weight}</span>}
                                      {item.price && (
                                        <span className="text-slate-400">
                                          • {formatCLP(item.price)} c/u
                                        </span>
                                      )}
                                    </div>
                                  </div>

                                  {/* Stepper de Cantidad */}
                                  <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-xl p-0.5 shadow-2xs shrink-0">
                                    <button
                                      type="button"
                                      onClick={() => handleUpdateHabitualItemQuantity(idx, (item.quantity || 1) - 1)}
                                      className="w-6 h-6 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 font-black text-xs cursor-pointer transition-colors active:scale-90"
                                      title="Reducir cantidad"
                                    >
                                      <Minus className="w-3 h-3" />
                                    </button>
                                    <span className="text-xs font-black text-slate-900 min-w-[20px] text-center">
                                      {item.quantity || 1}
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => handleUpdateHabitualItemQuantity(idx, (item.quantity || 1) + 1)}
                                      className="w-6 h-6 rounded-lg flex items-center justify-center text-[#0E8388] hover:bg-[#E6F4F1] font-black text-xs cursor-pointer transition-colors active:scale-90"
                                      title="Aumentar cantidad"
                                    >
                                      <Plus className="w-3 h-3" />
                                    </button>
                                  </div>

                                  {/* Subtotal y Botón Eliminar */}
                                  <div className="flex items-center gap-2 shrink-0">
                                    {item.price && (
                                      <span className="text-xs font-black text-[#0A3E40] min-w-[55px] text-right">
                                        {formatCLP((item.price || 0) * (item.quantity || 1))}
                                      </span>
                                    )}
                                    <button
                                      type="button"
                                      onClick={() => handleRemoveHabitualItem(idx)}
                                      className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-300 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                                      title="Quitar de mi despensa"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>

                          {/* Botón para agregar otro saco o producto habitual */}
                          <button
                            type="button"
                            onClick={() => {
                              setHabitualSearchQuery('');
                              setHabitualCategoryFilter('todos');
                              setIsAddHabitualProductModalOpen(true);
                            }}
                            className="w-full py-2.5 px-3 rounded-2xl border-2 border-dashed border-[#0E8388]/30 hover:border-[#0E8388] bg-[#0E8388]/5 hover:bg-[#0E8388]/10 text-[#0A3E40] text-xs font-black flex items-center justify-center gap-2 transition-all cursor-pointer group active:scale-98"
                          >
                            <Plus className="w-4 h-4 text-[#0E8388] group-hover:scale-110 transition-transform" />
                            <span>+ Agregar otro saco o producto habitual</span>
                          </button>

                          {/* Barra de progreso de ciclo y días restantes */}
                          <div className="p-3 bg-white rounded-2xl border border-slate-200 space-y-1.5 shadow-2xs">
                            <div className="flex items-center justify-between text-xs font-bold">
                              <span className={replenishmentCycle.isDue ? 'text-amber-700 font-black flex items-center gap-1' : 'text-slate-700'}>
                                {replenishmentCycle.isDue && <span>⚠️</span>}
                                <span>{replenishmentCycle.statusText}</span>
                              </span>
                              <span className="text-[11px] text-slate-500">
                                {replenishmentCycle.daysElapsed} de {replenishmentCycle.frequencyDays} días
                              </span>
                            </div>

                            <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden p-0.5 border border-slate-200">
                              <div
                                className={`h-full rounded-full transition-all duration-500 ${
                                  replenishmentCycle.isDue
                                    ? 'bg-gradient-to-r from-amber-500 to-rose-500'
                                    : 'bg-gradient-to-r from-[#0A3E40] via-[#0E8388] to-[#10B981]'
                                }`}
                                style={{ width: `${replenishmentCycle.percent}%` }}
                              />
                            </div>
                          </div>

                          {/* Acciones de la despensa */}
                          <div className="flex items-center gap-2 pt-1 flex-wrap">
                            <button
                              type="button"
                              onClick={handleRepeatHabitualOrder}
                              className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-[#0A3E40] to-[#0E8388] hover:from-[#0E8388] hover:to-[#10B981] text-white text-xs font-black shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                            >
                              <ShoppingCart className="w-4 h-4 text-emerald-300" />
                              <span>Repetir este Pedido en 1 Clic 🛒</span>
                            </button>
                            
                            <button
                              type="button"
                              onClick={() => handleSwitchTab('tienda')}
                              className="px-3.5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all border border-slate-200 cursor-pointer"
                            >
                              Ver más opciones
                            </button>
                          </div>
                        </div>
                      ) : (
                        /* Empty State: aún no hay productos registrados en la despensa */
                        <div className="p-4 rounded-2xl bg-gradient-to-br from-teal-50/70 to-emerald-50/60 border border-teal-200/80 space-y-3">
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-white text-[#0E8388] flex items-center justify-center text-xl shrink-0 shadow-2xs border border-teal-100">
                              🥘
                            </div>
                            <div className="space-y-1">
                              <h4 className="text-xs font-black text-slate-900">
                                Tu despensa inteligente se activará con tu primer pedido
                              </h4>
                              <p className="text-[11px] text-slate-600 leading-relaxed font-medium">
                                Al comprar alimento seco para tus mascotas, guardaremos automáticamente tu pedido habitual para que lo repitas todo junto en 1 solo clic y te recordaremos antes de que se acabe.
                              </p>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                            <button
                              type="button"
                              onClick={() => {
                                setHabitualSearchQuery('');
                                setHabitualCategoryFilter('todos');
                                setIsAddHabitualProductModalOpen(true);
                              }}
                              className="py-2.5 px-4 rounded-xl bg-[#0E8388] hover:bg-[#0A3E40] text-white text-xs font-black shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span>Configurar despensa ahora</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleSwitchTab('tienda')}
                              className="py-2.5 px-4 rounded-xl bg-white hover:bg-slate-100 text-slate-700 text-xs font-black border border-slate-200 shadow-2xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                            >
                              <ShoppingBag className="w-3.5 h-3.5 text-[#0E8388]" />
                              <span>Explorar en la Tienda 🐾</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* CARRUSEL AUTOMÁTICO DE PRODUCTOS DESTACADOS */}
                  <FeaturedProductsCarousel
                    pet={pet}
                    currentProduct={currentProduct}
                    catalogProducts={activeCatalog}
                    onAddToCart={onAddToCart}
                    onSelectProduct={onSelectProduct}
                    setOrderToastMessage={setOrderToastMessage}
                    formatCLP={formatCLP}
                  />
                </div>

                {/* Columna Derecha (Desktop 5 cols): Puntos, Consultas, Antiparasitarios, Tienda */}
                <div className="lg:col-span-5 space-y-3">
                  
                  {/* BARRA DE PROGRESO DE PUNTOS ACUMULADOS */}
                  {(() => {
                    const activeTiers = redeemRewards.filter((r) => r.active !== false);
                    const nextTierObj = activeTiers.find((r) => userPoints < r.points) || activeTiers[activeTiers.length - 1];
                    const nextGoal = nextTierObj?.points || 500;
                    const nextGoalReward = nextTierObj ? `Cupón $${(nextTierObj.discountAmount || 0).toLocaleString('es-CL')} 🎁` : 'Premio VIP 👑';
                    const progressPercent = Math.min(100, Math.round((userPoints / nextGoal) * 100));
                    const pointsRemaining = Math.max(0, nextGoal - userPoints);
                    const affordableTiers = [...activeTiers].filter((r) => userPoints >= r.points).sort((a, b) => b.points - a.points);
                    const canjeableValue = affordableTiers[0]?.discountAmount || 0;

                    return (
                      <div
                        onClick={() => setIsRedeemModalOpen(true)}
                        className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50/70 to-amber-50/60 border border-emerald-200/90 hover:border-emerald-400 shadow-2xs hover:shadow-xs transition-all cursor-pointer group active:scale-[0.99] space-y-2.5 select-none"
                        title="Toca para ver y canjear tus puntos de fidelización"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#0A3E40] to-[#0E8388] text-amber-300 flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
                              <Gift className="w-4 h-4 text-amber-300" />
                            </div>
                            <div className="min-w-0">
                              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 block">
                                Puntos por Compras
                              </span>
                              <div className="flex items-baseline gap-1.5 truncate">
                                <span className="text-xs sm:text-sm font-black text-slate-900">
                                  {userPoints.toLocaleString('es-CL')} Pts
                                </span>
                                <span className="text-[10px] text-emerald-700 font-bold truncate">
                                  {canjeableValue > 0
                                    ? `(Canjeable: $${canjeableValue.toLocaleString('es-CL')} CLP)`
                                    : '(Acumula para canjear)'}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            <span className="text-[10.5px] font-black px-2.5 py-1 rounded-full bg-white text-[#0A3E40] border border-emerald-300 shadow-2xs group-hover:bg-[#0E8388] group-hover:text-white transition-colors flex items-center gap-1">
                              <span>Canjear</span>
                              <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                            </span>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <div className="w-full bg-slate-200/80 h-2 rounded-full overflow-hidden p-0.5 border border-slate-100">
                            <div
                              className="bg-gradient-to-r from-[#0E8388] via-teal-500 to-amber-400 h-full rounded-full transition-all duration-500 shadow-xs"
                              style={{ width: `${progressPercent}%` }}
                            />
                          </div>
                          
                          <div className="flex items-center justify-between text-[10px] text-slate-500 font-bold px-0.5 pt-0.5">
                            <span className="truncate">
                              {pointsRemaining > 0 
                                ? `Faltan ${pointsRemaining} Pts para ${nextGoalReward}`
                                : `¡Meta alcanzada para ${nextGoalReward}!`}
                            </span>
                            <span className="text-[#0E8388] font-extrabold shrink-0 pl-2">{progressPercent}%</span>
                          </div>
                        </div>
                      </div>
                    );
                  })()}

                  {/* 2. CARD DE UNA LÍNEA: PRÓXIMA CONSULTA VETERINARIA / INDICACIONES */}
                  <div
                    onClick={() => {
                      setSelectedHealthPet(pet);
                      setIsVetConsultationModalOpen(true);
                    }}
                    className="p-3.5 px-4 rounded-2xl bg-white border border-slate-200 hover:border-teal-400 shadow-2xs hover:shadow-xs transition-all flex items-center justify-between gap-3 cursor-pointer group active:scale-[0.99]"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-xl bg-teal-50 text-[#0E8388] flex items-center justify-center shrink-0">
                        <Stethoscope className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-bold text-slate-800 truncate">
                        Próxima consulta veterinaria / Indicaciones
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0 text-[11px] font-extrabold text-[#0E8388]">
                      <span className="hidden sm:inline">Gestionar</span>
                      <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#0E8388] group-hover:translate-x-0.5 transition-all" />
                    </div>
                  </div>

                  {/* 3. CARD DE UNA LÍNEA: REGISTRAR ANTIPARASITARIO */}
                  <div
                    onClick={() => {
                      setSelectedHealthPet(pet);
                      setIsAntiparasiticModalOpen(true);
                    }}
                    className="p-3.5 px-4 rounded-2xl bg-white border border-slate-200 hover:border-amber-400 shadow-2xs hover:shadow-xs transition-all flex items-center justify-between gap-3 cursor-pointer group active:scale-[0.99]"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                        <Pill className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-bold text-slate-800 truncate">
                        Registrar antiparasitario (interno o externo)
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0 text-[11px] font-extrabold text-amber-600">
                      <span className="hidden sm:inline">Registrar</span>
                      <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-amber-600 group-hover:translate-x-0.5 transition-all" />
                    </div>
                  </div>

                  {/* 4. CARD DE UNA LÍNEA: VER TIENDA ONLINE */}
                  <div
                    onClick={() => {
                      handleSelectPet(pet);
                      setStoreMobileCategory('destacados');
                      handleSwitchTab('tienda');
                    }}
                    className="p-3.5 px-4 rounded-2xl bg-white border border-slate-200 hover:border-emerald-400 shadow-2xs hover:shadow-xs transition-all flex items-center justify-between gap-3 cursor-pointer group active:scale-[0.99]"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                        <ShoppingBag className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-bold text-slate-800 truncate">
                        Ver tienda online
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0 text-[11px] font-extrabold text-emerald-700">
                      <span className="hidden sm:inline">Explorar</span>
                      <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-700 group-hover:translate-x-0.5 transition-all" />
                    </div>
                  </div>

                  {/* 5. FICHA RESUMEN RÁPIDO DE LA MASCOTA */}
                  <div className="p-3.5 px-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 flex items-center justify-between text-xs text-slate-600">
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{pet.type === 'gato' ? '🐱' : '🐶'}</span>
                      <span className="font-bold text-slate-800">{pet.name}</span>
                      <span className="text-slate-400">•</span>
                      <span>{pet.weight || '6 kg'}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleSwitchTab('cuaderno')}
                      className="text-[#0E8388] font-bold hover:underline cursor-pointer"
                    >
                      Ver Ficha Completa
                    </button>
                  </div>

                </div>

              </div>
            </div>
          );
        })()}

        {/* TAB 2: MIS COMPRAS & FIDELIZACIÓN (Historial & Puntos Patitas) */}
        {activeTab === 'compras' && (
          <div className="space-y-8">
            
            {/* Header Showcase Banner */}
            <div className="p-8 rounded-3xl bg-gradient-to-r from-[#0A3E40] via-[#0E8388] to-[#10B981] text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
              <div className="relative z-10 space-y-2">
                <span className="px-3.5 py-1 rounded-full text-xs font-black bg-white/20 text-white backdrop-blur-md border border-white/30 uppercase tracking-wider">
                  Historial de Envíos & Programa de Puntos
                </span>
                <h1 className="text-3xl md:text-4xl font-black tracking-tight">
                  Mis Compras & Puntos Patitas 🛒
                </h1>
                <p className="text-xs md:text-sm text-emerald-100 font-medium max-w-xl">
                  Revisa todos tus pedidos realizados, seguimiento de despachos en tiempo real y tus puntos acumulados para canjear descuentos.
                </p>
              </div>

              {/* Loyalty Summary Badge */}
              <div className="relative z-10 p-5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-white shrink-0 space-y-1 text-center md:text-right">
                <div className="text-xs font-black text-amber-300 uppercase tracking-wider flex items-center justify-center md:justify-end gap-1.5">
                  <Award className="w-4 h-4 text-amber-400" />
                  <span>Socio Nivel Oro 🥇</span>
                </div>
                <div className="text-3xl font-black">{userPoints.toLocaleString('es-CL')} Pts</div>
                <div className="text-[11px] text-emerald-100 font-bold">${(userPoints * 10).toLocaleString('es-CL')} CLP en Descuentos</div>
              </div>

              <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-white/10 blur-3xl pointer-events-none" />
            </div>

            {/* Scheduled Order Toast */}
            {orderToastMessage && (
              <div className="p-4 rounded-2xl bg-gradient-to-r from-[#0A3E40] to-[#0E8388] text-white shadow-xl flex items-center justify-between gap-3 animate-in slide-in-from-top-4 duration-300">
                <div className="flex items-center gap-2.5 font-bold text-xs">
                  <Sparkles className="w-5 h-5 text-amber-300 shrink-0" />
                  <span>{orderToastMessage}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setOrderToastMessage(null)}
                  className="text-white/80 hover:text-white p-1 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Redeem Success Toast */}
            {redeemSuccessMessage && (
              <div className="p-4 rounded-2xl bg-emerald-600 text-white shadow-lg flex items-center justify-between gap-3 animate-in slide-in-from-top-4 duration-300">
                <div className="flex items-center gap-2 font-bold text-xs">
                  <Sparkles className="w-5 h-5 text-amber-300 shrink-0" />
                  <span>{redeemSuccessMessage}</span>
                </div>
                <button
                  onClick={() => setRedeemSuccessMessage(null)}
                  className="text-white/80 hover:text-white p-1 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* REAL PHYSICAL-STYLE DIGITAL MEMBERSHIP CARD SECTION */}
            <CustomerMembershipCard
              currentUser={currentUser}
              userPoints={userPoints}
              pendingPoints={pendingPoints}
              activeCoupons={activeCoupons}
              onOpenRedeemModal={() => setIsRedeemModalOpen(true)}
              tiers={membershipTiers}
              pointsPerThousand={loyaltySettings.pointsPerThousand || 1}
            />

            {/* Order History Table with Interactive Filters */}
            <CustomerOrdersTable
              ordersList={ordersList}
              filteredOrders={filteredOrders}
              orderFilterPeriod={orderFilterPeriod}
              setOrderFilterPeriod={setOrderFilterPeriod}
              orderFilterCategory={orderFilterCategory}
              setOrderFilterCategory={setOrderFilterCategory}
              orderFilterStatus={orderFilterStatus}
              setOrderFilterStatus={setOrderFilterStatus}
              orderFilterSearch={orderFilterSearch}
              setOrderFilterSearch={setOrderFilterSearch}
              onOpenLiveTracking={(order) => setLiveTrackingOrder(order)}
            />

          </div>
        )}

        {/* TAB 3: TIENDA ONLINE ORDENADA PARA LA MASCOTA ACTIVA (MOBILE FIRST) */}
        {activeTab === 'tienda' && (() => {
          const currentPet = activeSelectedPet || pets[0] || null;
          const isCat = currentPet?.type === 'gato';
          const petFirstName = currentPet ? currentPet.name.split(' ')[0] : 'tu regalón';

          // Categorías rápidas para el catálogo
          const MOBILE_CATEGORIES = [
            { id: 'destacados', label: currentPet ? `⭐ Destacados para ${petFirstName}` : '⭐ Productos Destacados' },
            { id: 'alimento', label: '🍲 Alimentos' },
            { id: 'antiparasitarios', label: '🛡️ Antiparasitarios' },
            { id: 'snacks', label: '🥩 Snacks & Premios' },
            { id: 'todos', label: '✨ Ver Todos' },
          ];

          return (
            <div className="space-y-4 w-full max-w-5xl lg:max-w-6xl mx-auto animate-in fade-in duration-200 pb-16 select-none">
              
              {/* 1. CABECERA PRINCIPAL: ESTÁS COMPRANDO PARA [NOMBRE DE LA MASCOTA] */}
              <div className="rounded-3xl bg-gradient-to-r from-[#0A3E40] via-[#0E8388] to-teal-700 text-white p-4 sm:p-6 shadow-lg border border-teal-600/30 space-y-3.5 relative overflow-hidden">
                
                {/* Fila Superior: Botón Volver + Selector rápido de mascotas */}
                <div className="flex items-center justify-between gap-2 relative z-10">
                  <button
                    type="button"
                    onClick={() => handleSwitchTab('mascotas')}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/15 hover:bg-white/25 text-white text-xs font-bold backdrop-blur-md border border-white/25 transition-all cursor-pointer active:scale-95 shadow-2xs"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Volver a Mis Mascotas</span>
                  </button>

                  {/* Selector rápido si el cliente tiene más de una mascota */}
                  {pets.length > 1 && (
                    <div className="flex items-center gap-1 bg-black/20 p-1 rounded-full border border-white/20 backdrop-blur-md">
                      {pets.map((p) => {
                        const isCurrent = p.id === currentPet?.id;
                        return (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => handleSelectPet(p)}
                            className={`px-2.5 py-1 rounded-full text-[11px] font-black transition-all flex items-center gap-1 cursor-pointer ${
                              isCurrent
                                ? 'bg-white text-[#0A3E40] shadow-sm'
                                : 'text-white/80 hover:text-white'
                            }`}
                            title={`Comprar para ${p.name}`}
                          >
                            <span>{p.type === 'gato' ? '🐱' : '🐶'}</span>
                            <span>{p.name.split(' ')[0]}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Banner de Identidad: Estás comprando para [Nombre] */}
                <div className="flex items-center gap-3.5 relative z-10 pt-1">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white/95 text-slate-800 shadow-md border-2 border-white flex items-center justify-center text-2xl sm:text-3xl shrink-0">
                    {currentPet ? (isCat ? '🐱' : '🐶') : '🛍️'}
                  </div>
                  <div className="space-y-0.5 min-w-0">
                    <span className="text-[10px] sm:text-[11px] font-black tracking-widest text-emerald-200 uppercase block">
                      {currentPet ? 'Estás comprando para' : 'Explora nuestra'}
                    </span>
                    <h1 className="text-xl sm:text-2xl font-black text-white leading-tight truncate">
                      {currentPet ? currentPet.name : 'Tienda Online Patitas del Sur'}
                    </h1>
                  </div>
                </div>

                {/* Buscador Limpio Integrado */}
                <div className="relative z-10 pt-1 max-w-xl">
                  <div className="relative">
                    <Search className="w-4 h-4 text-white/70 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      value={storeSearchQuery}
                      onChange={(e) => setStoreSearchQuery(e.target.value)}
                      placeholder={currentPet ? `Buscar productos para ${petFirstName}...` : 'Buscar alimento, snacks, antiparasitarios...'}
                      className="w-full pl-9 pr-8 py-2.5 rounded-2xl bg-white/15 border border-white/30 text-white placeholder-white/70 text-xs font-semibold backdrop-blur-md focus:outline-none focus:bg-white focus:text-slate-900 focus:placeholder-slate-400 transition-all shadow-inner"
                    />
                    {storeSearchQuery && (
                      <button
                        type="button"
                        onClick={() => setStoreSearchQuery('')}
                        className="w-6 h-6 rounded-full flex items-center justify-center text-white/80 hover:text-white absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer"
                        title="Borrar búsqueda"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-white/10 blur-2xl pointer-events-none" />
              </div>

              {/* 2. CARROUSEL DESLIZABLE DE CATEGORÍAS (PILLS MÓVILES) */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none select-none">
                {MOBILE_CATEGORIES.map((cat) => {
                  const isSelected = storeMobileCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => {
                        setStoreMobileCategory(cat.id);
                        setStoreSearchQuery('');
                      }}
                      className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 cursor-pointer active:scale-95 ${
                        isSelected
                          ? 'bg-gradient-to-r from-[#0A3E40] to-[#0E8388] text-white shadow-xs font-black ring-2 ring-[#0E8388]/30'
                          : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200/90 shadow-2xs'
                      }`}
                    >
                      <span>{cat.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* 3. ALIMENTO HABITUAL DE LA MASCOTA (HERO QUICK RE-ORDER) */}
              {(storeMobileCategory === 'destacados' || storeMobileCategory === 'alimento') && !storeSearchQuery && currentPetFoodProduct && (() => {
                const isCurrentFoodOutOfStock = isProductOutOfStock(currentPetFoodProduct, currentPet.bagSize);

                return (
                  <div className="animated-border-card">
                    <div className="animated-border-card-inner p-3 sm:p-3.5 flex items-center gap-3.5">
                      {/* Foto del Producto */}
                      <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-xl bg-slate-50 border border-slate-100 p-1 shrink-0 flex items-center justify-center relative overflow-hidden">
                        <img
                          src={currentPetFoodProduct.image || '/images/hero_dog.png'}
                          alt={currentPet.foodName}
                          className={`w-full h-full object-contain ${isCurrentFoodOutOfStock ? 'opacity-40 grayscale' : ''}`}
                        />
                        {isCurrentFoodOutOfStock && (
                          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[1px] flex items-center justify-center">
                            <span className="text-[8px] font-black uppercase text-white bg-rose-600/90 px-1 py-0.5 rounded">
                              Sin Stock
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Info y Reponer */}
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[9px] font-black uppercase text-emerald-800 bg-emerald-100/90 px-1.5 py-0.2 rounded-md">
                            ⭐ Alimento Habitual de {currentPet.name.split(' ')[0]}
                          </span>
                          <span className="text-[10px] text-slate-400 font-bold">
                            {currentPet.bagSize || '12 kg'}
                          </span>
                          {isCurrentFoodOutOfStock && (
                            <span className="text-[9px] font-black uppercase text-rose-700 bg-rose-50 border border-rose-200 px-1.5 py-0.2 rounded-md flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                              Sin Stock en Bodega
                            </span>
                          )}
                        </div>
                        <h3 className="text-xs sm:text-sm font-bold text-slate-900 leading-tight line-clamp-1" title={currentPet.foodName}>
                          {currentPet.foodName}
                        </h3>
                        <div className="text-xs font-black text-[#0A3E40]">
                          {formatCLP(currentPetFoodProduct.price)} CLP
                        </div>

                        <div className="pt-0.5 flex items-center gap-2 flex-wrap">
                          {isCurrentFoodOutOfStock ? (
                            <>
                              <button
                                type="button"
                                disabled
                                className="px-3 py-1.5 rounded-xl bg-slate-200 text-slate-400 font-extrabold text-[11px] flex items-center gap-1.5 cursor-not-allowed"
                              >
                                <ShoppingBag className="w-3 h-3 text-slate-400" />
                                <span>Agotado</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => setIsAlternativeFoodModalOpen(true)}
                                className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-extrabold text-[11px] shadow-2xs hover:shadow-xs active:scale-95 flex items-center gap-1 cursor-pointer transition-all"
                              >
                                <Sparkles className="w-3 h-3 text-emerald-200" />
                                <span>Ver alternativas con stock</span>
                              </button>
                            </>
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                const weight = currentPet.bagSize || currentPetFoodProduct.weights?.[0] || '12 kg';
                                onAddToCart(currentPetFoodProduct, weight, 1);
                                setOrderToastMessage(`✓ Alimento de ${currentPet.name.split(' ')[0]} agregado al carrito`);
                                setTimeout(() => setOrderToastMessage(null), 3500);
                              }}
                              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#0A3E40] to-[#0E8388] hover:from-[#0E8388] hover:to-teal-600 text-white font-extrabold text-[11px] transition-all active:scale-95 shadow-2xs flex items-center gap-1.5 cursor-pointer"
                            >
                              <ShoppingBag className="w-3 h-3 text-emerald-300" />
                              <span>Reponer alimento en 1 clic</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* 4. ENCABEZADO DE SECCIÓN CON CONTADOR */}
              <div className="flex items-center justify-between px-1 pt-1">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#0E8388]" />
                  <span className="text-xs font-black text-slate-800">
                    {storeMobileCategory === 'destacados'
                      ? `Productos Destacados para ${petFirstName}`
                      : storeMobileCategory === 'alimento'
                      ? `Alimentos para ${petFirstName}`
                      : storeMobileCategory === 'antiparasitarios'
                      ? `Antiparasitarios para ${petFirstName}`
                      : storeMobileCategory === 'snacks'
                      ? `Snacks & Premios para ${petFirstName}`
                      : `Catálogo completo para ${petFirstName}`}
                  </span>
                </div>
                <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                  {mobileStoreProducts.length} {mobileStoreProducts.length === 1 ? 'producto' : 'productos'}
                </span>
              </div>

              {/* 5. GRILLA RESPONSIVA DE PRODUCTOS (2 MÓVIL / 3-4 DESKTOP) */}
              {mobileStoreProducts.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                  {mobileStoreProducts.map((product) => {
                    const isHabitual = product.id === currentPetFoodProduct?.id;
                    const weightOption = product.weights?.[0] || '1 unidad';
                    const isProdOutOfStock = isProductOutOfStock(product, weightOption);

                    return (
                      <div
                        key={product.id}
                        className={`bg-white rounded-2xl border p-2.5 sm:p-3 flex flex-col justify-between shadow-2xs hover:shadow-md transition-all group relative ${
                          isProdOutOfStock ? 'border-slate-200/60 opacity-85' : 'border-slate-200/90 hover:border-emerald-400'
                        }`}
                      >
                        {/* Insignia Superior */}
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md truncate max-w-[85%] ${
                            isProdOutOfStock
                              ? 'bg-rose-50 text-rose-700 border border-rose-200'
                              : isHabitual
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : 'bg-teal-50 text-[#0E8388]'
                          }`}>
                            {isProdOutOfStock ? '🔴 Agotado' : isHabitual ? '⭐ Habitual' : (product.badge || product.brand || 'Patitas del Sur')}
                          </span>
                          {!isProdOutOfStock && isHabitual && (
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                          )}
                        </div>

                        {/* Imagen del Producto */}
                        <div
                          onClick={() => onSelectProduct && onSelectProduct(product)}
                          className="w-full h-24 sm:h-28 rounded-xl bg-slate-50/70 p-1.5 flex items-center justify-center my-1 cursor-pointer overflow-hidden relative"
                        >
                          <img
                            src={product.image || '/images/hero_dog.png'}
                            alt={product.name}
                            className={`max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300 ${
                              isProdOutOfStock ? 'opacity-40 grayscale' : ''
                            }`}
                            loading="lazy"
                          />
                          {isProdOutOfStock && (
                            <div className="absolute inset-0 bg-slate-900/30 backdrop-blur-[1px] flex items-center justify-center">
                              <span className="text-[9px] font-black uppercase text-white bg-rose-600/90 px-1.5 py-0.5 rounded-md shadow-xs">
                                Sin Stock
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Información del Producto */}
                        <div className="space-y-0.5 my-1 flex-1">
                          <span className="text-[10px] font-extrabold text-[#0E8388] block uppercase tracking-wide">
                            {product.brand}
                          </span>
                          <h4
                            onClick={() => onSelectProduct && onSelectProduct(product)}
                            className="text-[11.5px] sm:text-xs font-bold text-slate-800 line-clamp-2 leading-tight group-hover:text-[#0E8388] transition-colors cursor-pointer"
                            title={product.name}
                          >
                            {product.name}
                          </h4>
                          <div className="text-[10px] text-slate-400 font-semibold truncate pt-0.5">
                            {product.weights?.[0] || product.tagline || 'Protección y nutrición'}
                          </div>
                        </div>

                        {/* Precio y Botón de Añadir */}
                        <div className="pt-2 mt-1 border-t border-slate-100 flex items-center justify-between gap-1.5">
                          <div className="min-w-0">
                            <span className="text-xs sm:text-sm font-black text-[#0A3E40] truncate block">
                              {formatCLP(product.price)}
                            </span>
                          </div>

                          <button
                            type="button"
                            disabled={isProdOutOfStock}
                            onClick={(e) => {
                              if (isProdOutOfStock) return;
                              e.stopPropagation();
                              onAddToCart(product, weightOption, 1);
                              setOrderToastMessage(`✓ ${product.name.split(' ')[0]} agregado para ${currentPet.name.split(' ')[0]}`);
                              setTimeout(() => setOrderToastMessage(null), 3500);
                            }}
                            className={`h-8 px-2.5 sm:px-3 rounded-xl text-[11px] font-black flex items-center gap-1 shadow-2xs transition-all shrink-0 ${
                              isProdOutOfStock
                                ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                                : 'bg-gradient-to-r from-[#0A3E40] to-[#0E8388] hover:from-[#0E8388] hover:to-teal-600 text-white hover:shadow-xs active:scale-90 cursor-pointer'
                            }`}
                            title={isProdOutOfStock ? "Sin stock en bodega" : "Añadir al pedido"}
                          >
                            {isProdOutOfStock ? (
                              <span className="text-[10px]">Agotado</span>
                            ) : (
                              <>
                                <Plus className="w-3.5 h-3.5 stroke-[3]" />
                                <span className="hidden sm:inline">Añadir</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                /* Estado sin resultados */
                <div className="bg-white rounded-3xl p-8 text-center border border-slate-200 shadow-2xs space-y-3">
                  <span className="text-3xl block">🔍</span>
                  <h3 className="text-sm font-black text-slate-800">
                    No encontramos productos para "{storeSearchQuery}"
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Prueba buscando por marca (Bravery, NexGard, Bravecto) o ingrediente.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setStoreSearchQuery('');
                      setStoreMobileCategory('destacados');
                    }}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer"
                  >
                    Restablecer filtros
                  </button>
                </div>
              )}

              {/* Acceso directo al Catálogo General Completo */}
              <div className="rounded-2xl bg-white border border-slate-200/80 p-4 text-center space-y-2.5 shadow-2xs">
                <p className="text-xs font-bold text-slate-700">
                  ¿Buscas más marcas, snacks específicos o accesorios?
                </p>
                <div className="flex items-center justify-center gap-2">
                  <Link
                    to="/perros"
                    className="px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-[#0A3E40] text-xs font-black shadow-2xs transition-all flex items-center gap-1.5 active:scale-95"
                  >
                    <span>🐶</span>
                    <span>Catálogo Perros</span>
                  </Link>
                  <Link
                    to="/gatos"
                    className="px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-[#C86D39] text-xs font-black shadow-2xs transition-all flex items-center gap-1.5 active:scale-95"
                  >
                    <span>🐱</span>
                    <span>Catálogo Gatos</span>
                  </Link>
                </div>
              </div>
            </div>
          );
        })()}

        {/* TAB 4: CUADERNO VETERINARIO - RESUMEN EJECUTIVO Y ORDENADO (MOBILE FIRST) */}
        {activeTab === 'cuaderno' && (() => {
          if (pets.length === 0) {
            return (
              <div className="w-full max-w-4xl mx-auto py-12 px-4 text-center">
                <div className="bg-white rounded-3xl border border-slate-200/80 p-8 sm:p-12 shadow-sm space-y-4">
                  <div className="w-16 h-16 rounded-2xl bg-teal-50 text-[#0E8388] flex items-center justify-center mx-auto shadow-inner">
                    <Stethoscope className="w-8 h-8 stroke-[2.2]" />
                  </div>
                  <div className="space-y-2 max-w-md mx-auto">
                    <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                      Tu Cuaderno Veterinario Digital
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-600 font-medium">
                      Lleva el control de vacunas, antiparasitarios mensuales y próximas citas veterinarias. Para comenzar, registra a tu primera mascota.
                    </p>
                  </div>
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setPetStep(1);
                        setIsAddPetModalOpen(true);
                      }}
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-[#0A3E40] to-[#0E8388] hover:from-[#0E8388] hover:to-teal-600 text-white font-extrabold text-sm shadow-md shadow-[#0E8388]/25 transition-all cursor-pointer active:scale-95"
                    >
                      <Plus className="w-4 h-4 stroke-[3]" />
                      <span>Registrar Mascota</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          }

          const activePet = activeSelectedPet || pets.find(p => p.id === cuadernoActivePetId) || pets[0];
          const isCat = activePet?.type === 'gato';
          const activeLogs = healthLogs[activePet.id] || [];

          const vacunasLogs = activeLogs.filter(l => l.category === 'vacunas');
          const antiparasitarioLogs = activeLogs.filter(l => l.category === 'antiparasitario');
          const consultaLogs = activeLogs.filter(l => l.category === 'consulta');

          // Fechas clave resueltas directamente del historial de salud
          const latestAntiparasitic = antiparasitarioLogs[0];
          const nextAntiparasiticDate = latestAntiparasitic?.nextDueDateFormatted || latestAntiparasitic?.nextDueDate || (isCat ? '01 de Noviembre 2026' : '15 de Agosto 2026');
          const antiparasiticName = latestAntiparasitic?.title || (isCat ? 'Bravecto Plus Gatos (Pipeta 12 Semanas)' : 'NexGard Spectra Perros 7.5 - 15kg (Masticable Mensual)');

          const latestConsultation = consultaLogs[0];
          const nextConsultationDate = latestConsultation?.nextDueDate || '02 de Noviembre 2026';
          const consultationReason = latestConsultation?.title || 'Chequeo Preventivo & Evaluación Nutricional';
          const consultationNotes = latestConsultation?.notes || 'Piel sana, pelaje denso. Mantener dieta super premium.';

          const latestVaccine = vacunasLogs[0];
          const nextVaccineDate = latestVaccine?.nextDueDate || (isCat ? '10 de Junio 2027' : '10 de Agosto 2027');

          // Filtro interno de la bitácora
          const filteredLogs = activeLogs.filter(log => {
            if (cuadernoCategoryFilter === 'todas') return true;
            return log.category === cuadernoCategoryFilter;
          });

          return (
            <div className="space-y-4 w-full max-w-5xl lg:max-w-6xl mx-auto animate-in fade-in duration-200 pb-16 select-none">

              {/* 1. CABECERA RESUMEN DE LA MASCOTA */}
              <div className="rounded-3xl bg-gradient-to-r from-[#0A3E40] via-[#0E8388] to-teal-700 text-white p-4 sm:p-5 shadow-lg border border-teal-600/30 space-y-3 relative overflow-hidden">
                
                {/* Fila 1: Título de Ficha + Selector de Mascota */}
                <div className="flex items-center justify-between gap-2 relative z-10">
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-[10.5px] font-black tracking-wider uppercase text-emerald-200">
                    <Stethoscope className="w-3 h-3 text-emerald-300" />
                    <span>Cuaderno Veterinario</span>
                  </div>

                  {/* Selector interactivo de mascotas */}
                  {pets.length > 1 && (
                    <div className="flex items-center gap-1 bg-black/20 p-1 rounded-full border border-white/20 backdrop-blur-md">
                      {pets.map((p) => {
                        const isCurrent = p.id === activePet.id;
                        return (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => handleSelectPet(p)}
                            className={`px-2.5 py-1 rounded-full text-[11px] font-black transition-all flex items-center gap-1 cursor-pointer ${
                              isCurrent
                                ? 'bg-white text-[#0A3E40] shadow-sm'
                                : 'text-white/80 hover:text-white'
                            }`}
                            title={`Ver ficha médica de ${p.name}`}
                          >
                            <span>{p.type === 'gato' ? '🐱' : '🐶'}</span>
                            <span>{p.name.split(' ')[0]}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Fila 2: Avatar y Nombre */}
                <div className="flex items-center gap-3.5 relative z-10 pt-0.5">
                  <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-white/95 text-slate-800 shadow-md border-2 border-white flex items-center justify-center text-2xl sm:text-3xl shrink-0">
                    {isCat ? '🐱' : '🐶'}
                  </div>
                  <div className="space-y-0.5 min-w-0">
                    <span className="text-[10px] sm:text-[11px] font-black tracking-widest text-emerald-200 uppercase block">
                      Ficha de Salud & Cuidados
                    </span>
                    <h1 className="text-xl sm:text-2xl font-black text-white leading-tight truncate">
                      {activePet.name.replace(/[\u{1F300}-\u{1F9FF}|🐱|🐶|🐾]/gu, '').trim()}
                    </h1>
                  </div>
                </div>

                {/* Fila 3: Badge Resumen de Salud General */}
                <div className="relative z-10 p-2.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" />
                    <span className="font-extrabold text-white text-[11px] sm:text-xs">
                      Plan preventivo al día
                    </span>
                  </div>
                  <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-400/20 text-emerald-200 border border-emerald-300/30">
                    {activeLogs.length} registros guardados
                  </span>
                </div>

                <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-white/10 blur-2xl pointer-events-none" />
              </div>

              {/* 2. RESUMEN DE PRÓXIMAS FECHAS Y RECORDATORIOS CLAVE (TIMELINE RESUMEN) */}
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between px-1">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-[#0E8388]" />
                    <span className="text-xs font-black text-slate-800 uppercase tracking-wider text-[11px]">
                      Próximas Fechas & Controles de {activePet.name.split(' ')[0]}
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-slate-400">
                    Sincronizado ✓
                  </span>
                </div>

                {/* GRILLA DE 3 CARDS CUADRADAS EN LA MISMA LÍNEA */}
                {(() => {
                  const toShortDate = (str) => {
                    if (!str) return '';
                    return str
                      .replace(' de Enero ', ' Ene ')
                      .replace(' de Febrero ', ' Feb ')
                      .replace(' de Marzo ', ' Mar ')
                      .replace(' de Abril ', ' Abr ')
                      .replace(' de Mayo ', ' May ')
                      .replace(' de Junio ', ' Jun ')
                      .replace(' de Julio ', ' Jul ')
                      .replace(' de Agosto ', ' Ago ')
                      .replace(' de Septiembre ', ' Sep ')
                      .replace(' de Octubre ', ' Oct ')
                      .replace(' de Noviembre ', ' Nov ')
                      .replace(' de Diciembre ', ' Dic ')
                      .replace(' de ', ' ');
                  };

                  return (
                    <div className="grid grid-cols-3 gap-2 sm:gap-2.5">
                      
                      {/* CARD 1: PRÓXIMO ANTIPARASITARIO (ÁMBAR CÁLIDO) */}
                      <div
                        onClick={() => {
                          setSelectedHealthPet(activePet);
                          setIsAntiparasiticModalOpen(true);
                        }}
                        className="p-2.5 sm:p-3 rounded-2xl bg-gradient-to-b from-amber-50/90 via-orange-50/40 to-white border border-amber-200/90 hover:border-amber-400 shadow-2xs hover:shadow-xs transition-all cursor-pointer group active:scale-[0.98] flex flex-col justify-between text-left aspect-square relative overflow-hidden"
                        title="Actualizar o registrar dosis antiparasitaria"
                      >
                        {/* Fila Superior: Ícono + Insignia */}
                        <div className="flex items-center justify-between gap-1">
                          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-amber-100/90 text-amber-700 flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
                            <Pill className="w-3.5 h-3.5 text-amber-600" />
                          </div>
                          <span className="text-[8.5px] sm:text-[9px] font-black px-1.5 py-0.5 rounded-full bg-white text-amber-800 border border-amber-200 shadow-2xs shrink-0">
                            Aviso ✓
                          </span>
                        </div>

                        {/* Medio: Categoría y Fecha */}
                        <div className="space-y-0.5 min-w-0">
                          <span className="text-[9px] font-black uppercase tracking-wider text-amber-800 block truncate">
                            Antiparasitario
                          </span>
                          <h4 className="text-[11px] sm:text-[12.5px] font-black text-slate-900 leading-tight truncate">
                            📅 {toShortDate(nextAntiparasiticDate)}
                          </h4>
                        </div>

                        {/* Pie: Nombre de Producto y Flecha */}
                        <div className="pt-1 border-t border-amber-200/50 flex items-center justify-between gap-1 min-w-0">
                          <span className="text-[9px] sm:text-[9.5px] text-slate-500 font-bold truncate">
                            {antiparasiticName.split('(')[0].split('Perros')[0].split('Gatos')[0].trim()}
                          </span>
                          <ChevronRight className="w-3 h-3 text-amber-600/70 group-hover:translate-x-0.5 transition-transform shrink-0" />
                        </div>
                      </div>

                      {/* CARD 2: PRÓXIMO CONTROL VETERINARIO (VERDE TEAL) */}
                      <div
                        onClick={() => {
                          setSelectedHealthPet(activePet);
                          setIsVetConsultationModalOpen(true);
                        }}
                        className="p-2.5 sm:p-3 rounded-2xl bg-gradient-to-b from-emerald-50/90 via-teal-50/40 to-white border border-emerald-200/90 hover:border-emerald-400 shadow-2xs hover:shadow-xs transition-all cursor-pointer group active:scale-[0.98] flex flex-col justify-between text-left aspect-square relative overflow-hidden"
                        title="Ver indicaciones o agendar control"
                      >
                        {/* Fila Superior: Ícono + Insignia */}
                        <div className="flex items-center justify-between gap-1">
                          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-teal-100/90 text-[#0E8388] flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
                            <Stethoscope className="w-3.5 h-3.5 text-[#0E8388]" />
                          </div>
                          <span className="text-[8.5px] sm:text-[9px] font-black px-1.5 py-0.5 rounded-full bg-white text-[#0A3E40] border border-teal-200 shadow-2xs shrink-0">
                            Cita ✓
                          </span>
                        </div>

                        {/* Medio: Categoría y Fecha */}
                        <div className="space-y-0.5 min-w-0">
                          <span className="text-[9px] font-black uppercase tracking-wider text-emerald-800 block truncate">
                            Control Vet
                          </span>
                          <h4 className="text-[11px] sm:text-[12.5px] font-black text-slate-900 leading-tight truncate">
                            📅 {toShortDate(nextConsultationDate)}
                          </h4>
                        </div>

                        {/* Pie: Motivo de Control y Flecha */}
                        <div className="pt-1 border-t border-emerald-200/50 flex items-center justify-between gap-1 min-w-0">
                          <span className="text-[9px] sm:text-[9.5px] text-slate-500 font-bold truncate">
                            {consultationReason.split('&')[0].trim()}
                          </span>
                          <ChevronRight className="w-3 h-3 text-[#0E8388]/70 group-hover:translate-x-0.5 transition-transform shrink-0" />
                        </div>
                      </div>

                      {/* CARD 3: VACUNACIÓN VIGENTE (ROSA / PÚRPURA) */}
                      <div
                        onClick={() => setCuadernoCategoryFilter('vacunas')}
                        className="p-2.5 sm:p-3 rounded-2xl bg-gradient-to-b from-rose-50/90 via-purple-50/30 to-white border border-rose-200/80 hover:border-rose-400 shadow-2xs hover:shadow-xs transition-all cursor-pointer group active:scale-[0.98] flex flex-col justify-between text-left aspect-square relative overflow-hidden"
                        title="Ver esquema de vacunación"
                      >
                        {/* Fila Superior: Ícono + Insignia */}
                        <div className="flex items-center justify-between gap-1">
                          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-rose-100/90 text-rose-600 flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
                            <Syringe className="w-3.5 h-3.5 text-rose-500" />
                          </div>
                          <span className="text-[8.5px] sm:text-[9px] font-black px-1.5 py-0.5 rounded-full bg-white text-rose-800 border border-rose-200 shadow-2xs shrink-0">
                            Al día ✓
                          </span>
                        </div>

                        {/* Medio: Categoría y Fecha */}
                        <div className="space-y-0.5 min-w-0">
                          <span className="text-[9px] font-black uppercase tracking-wider text-rose-800 block truncate">
                            Vacunación
                          </span>
                          <h4 className="text-[11px] sm:text-[12.5px] font-black text-slate-900 leading-tight truncate">
                            📅 {toShortDate(nextVaccineDate)}
                          </h4>
                        </div>

                        {/* Pie: Vacunas y Estado */}
                        <div className="pt-1 border-t border-rose-100 flex items-center justify-between gap-1 min-w-0">
                          <span className="text-[9px] sm:text-[9.5px] text-slate-500 font-bold truncate">
                            {isCat ? 'Triple Felina' : 'Séxtuple'}
                          </span>
                          <span className="text-[8.5px] font-extrabold text-rose-600 shrink-0">
                            {vacunasLogs.length > 0 ? `${vacunasLogs.length} reg.` : 'OK'}
                          </span>
                        </div>
                      </div>

                    </div>
                  );
                })()}

              </div>

              {/* 3. DOS BOTONES DE ACCIÓN RÁPIDA (CONECTADOS DIRECTAMENTE CON LOS MODALES) */}
              <div className="grid grid-cols-2 gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedHealthPet(activePet);
                    setIsAntiparasiticModalOpen(true);
                  }}
                  className="p-3 rounded-2xl bg-gradient-to-r from-amber-600 via-amber-500 to-orange-500 hover:opacity-95 text-white font-black text-xs shadow-xs hover:shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Pill className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>+ Registrar Antiparasitario</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedHealthPet(activePet);
                    setIsVetConsultationModalOpen(true);
                  }}
                  className="p-3 rounded-2xl bg-gradient-to-r from-[#0A3E40] to-[#0E8388] hover:from-[#0E8388] hover:to-teal-600 text-white font-black text-xs shadow-xs hover:shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Stethoscope className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>+ Registrar Consulta</span>
                </button>
              </div>

              {/* 4. ÚLTIMAS INDICACIONES MÉDICAS REGISTRADAS (CARD CLÍNICA RECONFORTANTE) */}
              {latestConsultation && (
                <div className="p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-[#0E8388]" />
                      <span className="text-xs font-black text-slate-800">
                        Indicaciones Veterinarias Vigentes
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-bold">
                      {latestConsultation.date}
                    </span>
                  </div>

                  <p className="text-xs text-slate-700 bg-slate-50/80 p-2.5 rounded-xl border border-slate-100 font-medium leading-relaxed italic">
                    "{consultationNotes}"
                  </p>

                  <div className="flex items-center justify-between text-[10.5px] text-slate-400 font-bold pt-0.5">
                    <span>Dr. Felipe San Martín • Clínica Patitas del Sur</span>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedHealthPet(activePet);
                        setIsVetConsultationModalOpen(true);
                      }}
                      className="text-[#0E8388] hover:underline font-extrabold cursor-pointer"
                    >
                      Editar / Nueva cita →
                    </button>
                  </div>
                </div>
              )}

              {/* 5. HISTORIAL / BITÁCORA DETALLADA CON FILTROS */}
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between px-1">
                  <div className="flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-[#0E8388]" />
                    <span className="text-xs font-black text-slate-800 uppercase tracking-wider text-[11px]">
                      Historial Sanitario Completo
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-slate-400">
                    {filteredLogs.length} eventos
                  </span>
                </div>

                {/* Filtro en cápsulas para la bitácora */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none">
                  {[
                    { id: 'todas', label: `Todos (${activeLogs.length})` },
                    { id: 'antiparasitario', label: `Antiparasitarios (${antiparasitarioLogs.length})` },
                    { id: 'consulta', label: `Consultas (${consultaLogs.length})` },
                    { id: 'vacunas', label: `Vacunas (${vacunasLogs.length})` },
                  ].map((filterTab) => {
                    const isSelected = cuadernoCategoryFilter === filterTab.id;
                    return (
                      <button
                        key={filterTab.id}
                        type="button"
                        onClick={() => setCuadernoCategoryFilter(filterTab.id)}
                        className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all shrink-0 cursor-pointer active:scale-95 ${
                          isSelected
                            ? 'bg-[#0E8388] text-white shadow-2xs font-black'
                            : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
                        }`}
                      >
                        {filterTab.label}
                      </button>
                    );
                  })}
                </div>

                {/* Lista de Eventos Médicos */}
                <div className="space-y-2">
                  {filteredLogs.map((log) => {
                    const status = getLogStatus(log);
                    const StatusIcon = status.Icon;
                    const isAntiparasitic = log.category === 'antiparasitario';
                    const isConsultation = log.category === 'consulta';

                    return (
                      <div
                        key={log.id}
                        className="bg-white rounded-2xl p-3 sm:p-3.5 border border-slate-200/80 shadow-2xs hover:shadow-xs transition-all space-y-2"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                              isAntiparasitic
                                ? 'bg-amber-100 text-amber-700'
                                : isConsultation
                                ? 'bg-teal-100 text-[#0E8388]'
                                : 'bg-rose-100 text-rose-600'
                            }`}>
                              {isAntiparasitic ? (
                                <Pill className="w-4 h-4" />
                              ) : isConsultation ? (
                                <Stethoscope className="w-4 h-4" />
                              ) : (
                                <Syringe className="w-4 h-4" />
                              )}
                            </div>
                            <div className="min-w-0">
                              <span className={`text-[9.5px] font-black uppercase tracking-wider block ${
                                isAntiparasitic ? 'text-amber-800' : isConsultation ? 'text-teal-800' : 'text-rose-800'
                              }`}>
                                {isAntiparasitic ? 'Antiparasitario' : isConsultation ? 'Consulta Médica' : 'Vacuna'}
                              </span>
                              <h5 className="text-xs font-bold text-slate-900 truncate">
                                {log.title}
                              </h5>
                            </div>
                          </div>

                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-black border flex items-center gap-1 shrink-0 ${status.bg}`}>
                            <StatusIcon className="w-3 h-3" />
                            <span>{status.label}</span>
                          </span>
                        </div>

                        {/* Datos de fecha y próxima dosis */}
                        <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-50/80 p-2 rounded-xl border border-slate-100">
                          <div>
                            <span className="text-slate-400 font-semibold block text-[10px]">Administrado / Control:</span>
                            <span className="text-slate-800 font-bold">{log.date}</span>
                          </div>
                          {log.nextDueDate && (
                            <div>
                              <span className="text-slate-400 font-semibold block text-[10px]">Próximo Aviso:</span>
                              <span className="text-[#0E8388] font-bold">{log.nextDueDateFormatted || log.nextDueDate}</span>
                            </div>
                          )}
                        </div>

                        {/* Observaciones si las hay */}
                        {log.notes && (
                          <p className="text-[11px] text-slate-600 bg-white p-2 rounded-xl border border-slate-100 font-medium">
                            💬 "{log.notes}"
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 6. BANNER ENLACE A LA TIENDA DE LA MASCOTA */}
              <div
                onClick={() => {
                  handleSelectPet(activePet);
                  setStoreMobileCategory('destacados');
                  setActiveTab('tienda');
                  navigate('/mi-cuenta?tab=tienda', { replace: true });
                  window.dispatchEvent(new CustomEvent('patitas_customer_tab_changed', { detail: 'tienda' }));
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-white border border-emerald-300 shadow-2xs hover:shadow-xs transition-all flex items-center justify-between gap-3 cursor-pointer group active:scale-[0.99]"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-[#0E8388] text-white flex items-center justify-center shrink-0">
                    <ShoppingBag className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs font-black text-slate-800 block truncate">
                      ¿Necesitas reponer antiparasitarios o alimento para {activePet.name.split(' ')[0]}?
                    </span>
                    <span className="text-[10px] text-emerald-800 font-bold">
                      Ver productos con despacho rápido en Tienda Online
                    </span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-emerald-700 group-hover:translate-x-0.5 transition-transform shrink-0" />
              </div>

            </div>
          );
        })()}

      </div>

      {/* MODAL 1: REGISTRAR NUEVA MASCOTA (MULTI-STEP WIZARD) */}
      {isAddPetModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="max-w-lg w-full bg-white rounded-3xl p-6 md:p-8 shadow-2xl border border-slate-200 space-y-6 relative animate-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-xl font-black text-slate-900">Agregar Nueva Mascota 🐾</h3>
                <p className="text-xs text-slate-500 font-medium">Asistente de registro en 2 pasos</p>
              </div>
              <button
                onClick={resetPetModalForm}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center font-bold transition-all cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Wizard Progress Bar */}
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden p-0.5 border border-slate-200">
              <div
                className="bg-gradient-to-r from-[#0A3E40] via-[#0E8388] to-[#10B981] h-full rounded-full transition-all duration-500"
                style={{ width: `${(petStep / 2) * 100}%` }}
              />
            </div>

            <form onSubmit={handleAddPetSubmit} className="space-y-4 text-xs font-semibold">
              
              {/* STEP 1: TIPO DE MASCOTA (Perro o Gato) */}
              {petStep === 1 && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  <div className="text-center space-y-1">
                    <span className="px-3 py-1 rounded-full text-[11px] font-black bg-[#0E8388]/10 text-[#0E8388] border border-[#0E8388]/20 inline-block mb-1">
                      Paso 1 de 2: Especie 🐾
                    </span>
                    <h4 className="text-lg font-black text-slate-900">¿Tu mascota es Perro o Gato?</h4>
                    <p className="text-xs text-slate-500 font-medium">Selecciona la especie de tu regalón para personalizar su experiencia.</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {/* Option Perro */}
                    <button
                      type="button"
                      onClick={() => {
                        setNewPetType('perro');
                        setPetStep(2);
                      }}
                      className={`p-6 rounded-3xl border-2 transition-all flex flex-col items-center justify-center gap-3 text-center cursor-pointer hover:scale-105 active:scale-95 ${
                        newPetType === 'perro'
                          ? 'border-[#0E8388] bg-[#E6F4F1]/60 shadow-lg ring-2 ring-[#0E8388]/30'
                          : 'border-slate-200 bg-slate-50 hover:bg-slate-100 hover:border-slate-300'
                      }`}
                    >
                      <span className="text-5xl drop-shadow-xs">🐶</span>
                      <div>
                        <div className="font-black text-slate-900 text-base">Perro</div>
                        <p className="text-[11px] text-slate-500 font-medium">Nutrición Canina</p>
                      </div>
                      {newPetType === 'perro' && (
                        <span className="px-2.5 py-0.5 rounded-full bg-[#0E8388] text-white text-[10px] font-black uppercase">
                          ✓ Seleccionado
                        </span>
                      )}
                    </button>

                    {/* Option Gato */}
                    <button
                      type="button"
                      onClick={() => {
                        setNewPetType('gato');
                        setPetStep(2);
                      }}
                      className={`p-6 rounded-3xl border-2 transition-all flex flex-col items-center justify-center gap-3 text-center cursor-pointer hover:scale-105 active:scale-95 ${
                        newPetType === 'gato'
                          ? 'border-[#0E8388] bg-[#E6F4F1]/60 shadow-lg ring-2 ring-[#0E8388]/30'
                          : 'border-slate-200 bg-slate-50 hover:bg-slate-100 hover:border-slate-300'
                      }`}
                    >
                      <span className="text-5xl drop-shadow-xs">🐱</span>
                      <div>
                        <div className="font-black text-slate-900 text-base">Gato</div>
                        <p className="text-[11px] text-slate-500 font-medium">Nutrición Felina</p>
                      </div>
                      {newPetType === 'gato' && (
                        <span className="px-2.5 py-0.5 rounded-full bg-[#0E8388] text-white text-[10px] font-black uppercase">
                          ✓ Seleccionado
                        </span>
                      )}
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => setPetStep(2)}
                    className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#0A3E40] to-[#0E8388] hover:from-[#0E8388] hover:to-[#10B981] text-white font-black text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Siguiente: Datos de la Mascota</span>
                    <span>→</span>
                  </button>
                </div>
              )}

              {/* STEP 2: INFORMACIÓN DE LA MASCOTA */}
              {petStep === 2 && (
                <div className="space-y-5 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <span className="px-3 py-1 rounded-full text-[11px] font-black bg-[#0E8388]/10 text-[#0E8388] border border-[#0E8388]/20">
                      Paso 2 de 2: Datos de {newPetType === 'perro' ? '🐶 Perro' : '🐱 Gato'}
                    </span>
                    <span className="text-xs font-bold text-emerald-600">100% completado</span>
                  </div>

                  {/* Nombre */}
                  <div className="space-y-1">
                    <label className="font-black text-slate-700 uppercase text-[11px]">Nombre de la Mascota *</label>
                    <input
                      type="text"
                      required
                      placeholder="Ej. Luna, Milo, Jack, Thor..."
                      value={newPetName}
                      onChange={(e) => setNewPetName(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:outline-hidden focus:border-[#0E8388] focus:bg-white"
                    />
                  </div>

                  {/* Fila 1: Fecha de Nacimiento & Edad Calculada */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="font-black text-slate-700 uppercase text-[10px] flex items-center justify-between">
                        <span>Fecha Nacimiento</span>
                        <span className="text-[9px] text-[#0E8388] font-bold">Calendario</span>
                      </label>
                      <CustomDatePicker
                        value={newPetBirthdate}
                        onChange={handleBirthdateChange}
                        placeholder="dd / mm / aaaa"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-black text-slate-700 uppercase text-[10px] flex items-center justify-between">
                        <span>Edad (Automática)</span>
                        <span className="text-[9px] text-emerald-700 font-bold">Años y meses</span>
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="Ej. 2 años y 4 meses"
                          value={newPetAge}
                          onChange={handleAgeChange}
                          className="w-full pl-3.5 pr-8 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-black text-slate-900 focus:outline-hidden focus:border-[#0E8388] focus:bg-white"
                        />
                        {newPetAge && (
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs">
                            🐾
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Fila 2: Peso & Esterilización */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="font-black text-slate-700 uppercase text-[10px]">Peso (KG Entero)</label>
                      <div className="relative">
                        <input
                          type="text"
                          inputMode="numeric"
                          placeholder="Ej. 12"
                          value={newPetWeight}
                          onChange={(e) => {
                            const val = e.target.value.replace(/[^0-9]/g, '');
                            setNewPetWeight(val);
                          }}
                          className="w-full pl-3.5 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-black focus:outline-hidden focus:border-[#0E8388] focus:bg-white text-slate-900"
                        />
                        <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-extrabold text-slate-400">
                          KG
                        </span>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="font-black text-slate-700 uppercase text-[10px]">¿Está esterilizado / capado?</label>
                      <div className="grid grid-cols-2 gap-2 h-[46px]">
                        <button
                          type="button"
                          onClick={() => setNewPetSterilized('si')}
                          className={`rounded-2xl border text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                            newPetSterilized === 'si'
                              ? 'bg-[#0E8388] text-white border-[#0E8388] shadow-xs'
                              : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          <span>✂️ Sí</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setNewPetSterilized('no')}
                          className={`rounded-2xl border text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                            newPetSterilized === 'no'
                              ? 'bg-[#0E8388] text-white border-[#0E8388] shadow-xs'
                              : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          <span>🐾 No</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Navigation buttons */}
                  <div className="flex items-center gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setPetStep(1)}
                      className="w-1/3 py-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-all cursor-pointer"
                    >
                      ← Volver
                    </button>

                    <button
                      type="submit"
                      disabled={!newPetName.trim()}
                      className={`w-2/3 py-3.5 rounded-2xl font-black text-xs transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer ${
                        newPetName.trim()
                          ? 'bg-gradient-to-r from-[#0A3E40] to-[#0E8388] hover:from-[#0E8388] hover:to-[#10B981] text-white hover:scale-[1.02] shadow-emerald-900/10'
                          : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                      }`}
                    >
                      <span>Guardar Mascota 🐾</span>
                    </button>
                  </div>
                </div>
              )}

            </form>

          </div>
        </div>
      )}

      {/* MODAL 2: BITÁCORA DE SALUD VETERINARIA (Vacunas, Antiparasitarios & Notas del Veterinario) */}
      {isHealthBitacoraOpen && selectedHealthPet && (
        <div 
          onClick={(e) => {
            if (e.target === e.currentTarget) returnToMascotasDashboard();
          }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200"
        >
          <div className="max-w-2xl w-full bg-white rounded-3xl p-6 md:p-8 shadow-2xl border border-slate-200 space-y-6 relative max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
            
            {/* ULTRA-PREMIUM SHOWCASE HEADER BANNER */}
            <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-r from-[#0A3E40] via-[#0E8388] to-[#10B981] text-white shadow-xl relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-emerald-400/30">
              
              <div className="relative z-10 flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-white/15 backdrop-blur-md border border-white/30 flex items-center justify-center text-3xl shadow-inner shrink-0">
                  🏥
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-0.5 rounded-full text-[10px] font-black bg-white/20 text-white backdrop-blur-md border border-white/30 uppercase tracking-wider">
                      Ficha Clínica Veterinaria 🩺
                    </span>
                  </div>
                  <h3 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
                    <span>Bitácora de Salud de {selectedHealthPet.name}</span>
                  </h3>
                  <p className="text-xs text-emerald-100 font-medium">
                    Historial médico, vacunas, antiparasitarios y diagnósticos veterinarios al día.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={returnToMascotasDashboard}
                className="w-9 h-9 rounded-2xl bg-white/15 hover:bg-white/25 text-white backdrop-blur-md border border-white/30 flex items-center justify-center font-bold transition-all shrink-0 self-start sm:self-auto cursor-pointer active:scale-95"
                title="Cerrar y volver a Mis Mascotas"
              >
                ✕
              </button>

              <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-white/10 blur-3xl pointer-events-none" />
            </div>

            {/* CLEAN 3-COLUMN SEGMENTED CONTROL (NO SCROLLBAR, NO 'VER TODO', NO TOP 'REGISTRAR ENTRADA') */}
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-1.5 bg-slate-100/90 p-1.5 rounded-2xl border border-slate-200 shadow-inner">
                <button
                  type="button"
                  onClick={() => setLogCategoryFilter('vacunas')}
                  className={`py-2.5 px-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer text-center ${
                    logCategoryFilter === 'vacunas'
                      ? 'bg-[#0A3E40] text-white shadow-md'
                      : 'text-slate-600 hover:bg-white/60'
                  }`}
                >
                  <Syringe className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                  <span className="truncate">Vacunas</span>
                </button>

                <button
                  type="button"
                  onClick={() => setLogCategoryFilter('antiparasitario')}
                  className={`py-2.5 px-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer text-center ${
                    logCategoryFilter === 'antiparasitario'
                      ? 'bg-[#0A3E40] text-white shadow-md'
                      : 'text-slate-600 hover:bg-white/60'
                  }`}
                >
                  <Pill className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  <span className="truncate">Antiparasitario</span>
                </button>

                <button
                  type="button"
                  onClick={() => setLogCategoryFilter('consulta')}
                  className={`py-2.5 px-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer text-center ${
                    logCategoryFilter === 'consulta'
                      ? 'bg-[#0A3E40] text-white shadow-md'
                      : 'text-slate-600 hover:bg-white/60'
                  }`}
                >
                  <UserCheck className="w-3.5 h-3.5 text-[#0E8388] shrink-0" />
                  <span className="truncate">Notas Veterinario</span>
                </button>
              </div>

              {/* Active Tab Sub-header with Dedicated Category Action Button */}
              <div className="flex items-center justify-between px-1">
                <h4 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                  <span>
                    Historial de {logCategoryFilter === 'vacunas' ? 'Vacunas 💉' : logCategoryFilter === 'antiparasitario' ? 'Antiparasitarios 💊' : 'Notas Veterinarias 🩺'}
                  </span>
                </h4>
                <button
                  type="button"
                  onClick={() => {
                    setNewLogCategory(logCategoryFilter);
                    if (logCategoryFilter === 'vacunas') {
                      setNewLogTitle(selectedHealthPet.type === 'gato' ? 'Vacuna Triple Felina (Trivalente)' : 'Vacuna Séxtuple Canina (DHPPI+L)');
                      setNewLogFrequency('12');
                      setNewLogNextDue(calculateNextDueDate(12));
                    } else if (logCategoryFilter === 'antiparasitario') {
                      const petAntiparasitics = PRODUCTS.filter(p => 
                        p.category === 'Antiparasitarios' && (
                          selectedHealthPet.type === 'gato' ? p.petType === 'gatos' : p.petType === 'perros'
                        )
                      );
                      if (petAntiparasitics.length > 0) {
                        setSelectedAntiparasiticId(petAntiparasitics[0].id);
                        setNewLogTitle(petAntiparasitics[0].name);
                        setNewLogFrequency(`${petAntiparasitics[0].frequencyMonths || 1}`);
                        setNewLogNextDue(calculateNextDueDate(petAntiparasitics[0].frequencyMonths || 1));
                      }
                    }
                    setIsAddLogFormOpen(!isAddLogFormOpen);
                  }}
                  className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#0E8388] to-[#10B981] hover:from-[#0A3E40] hover:to-[#0E8388] text-white font-black text-xs shadow-sm transition-all flex items-center gap-1.5 cursor-pointer border border-emerald-300/40"
                >
                  <Plus className="w-4 h-4" />
                  <span>
                    {isAddLogFormOpen
                      ? 'Cancelar'
                      : logCategoryFilter === 'vacunas'
                      ? 'Registrar Vacuna 💉'
                      : logCategoryFilter === 'antiparasitario'
                      ? 'Registrar Antiparasitario 💊'
                      : 'Registrar Nota 🩺'}
                  </span>
                </button>
              </div>
            </div>

            {/* Collapsible Form for Adding New Health Log */}
            {isAddLogFormOpen && (
              <form onSubmit={handleAddHealthLogSubmit} className="p-6 rounded-3xl bg-[#FAF9F5] border-2 border-[#0E8388]/30 space-y-4 text-xs font-semibold animate-in fade-in duration-200 shadow-md">
                <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
                  <h4 className="font-black text-[#0A3E40] uppercase tracking-wider flex items-center gap-2 text-sm">
                    {newLogCategory === 'vacunas' ? (
                      <Syringe className="w-4 h-4 text-rose-500" />
                    ) : newLogCategory === 'antiparasitario' ? (
                      <Pill className="w-4 h-4 text-amber-500" />
                    ) : (
                      <Stethoscope className="w-4 h-4 text-[#0E8388]" />
                    )}
                    <span>
                      {newLogCategory === 'vacunas'
                        ? `Registrar Vacuna para ${selectedHealthPet.name}`
                        : newLogCategory === 'antiparasitario'
                        ? `Registrar Antiparasitario para ${selectedHealthPet.name}`
                        : `Nueva Consulta Médica para ${selectedHealthPet.name}`}
                    </span>
                  </h4>
                  {(newLogCategory === 'vacunas' || newLogCategory === 'antiparasitario') && (
                    <span className="text-[10px] font-black text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-300 flex items-center gap-1">
                      🔔 Recordatorio Activo
                    </span>
                  )}
                </div>

                {newLogCategory === 'vacunas' ? (
                  <>
                    {/* TIPO DE VACUNA */}
                    <div className="space-y-1.5">
                      {isCustomVaccine ? (
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <label className="font-black text-slate-700 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                              <Syringe className="w-3.5 h-3.5 text-rose-500" />
                              <span>Nombre de la Vacuna Personalizada</span>
                            </label>
                            <button
                              type="button"
                              onClick={() => setIsCustomVaccine(false)}
                              className="text-[#0E8388] text-[11px] font-bold hover:underline cursor-pointer"
                            >
                              ← Seleccionar de la lista
                            </button>
                          </div>
                          <input
                            type="text"
                            required
                            placeholder="Ej. Vacuna Giardia, Vacuna KC, etc."
                            value={customVaccineName}
                            onChange={(e) => setCustomVaccineName(e.target.value)}
                            className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl font-bold focus:outline-hidden text-slate-800 text-xs"
                          />
                        </div>
                      ) : (
                        <CustomDropdown
                          label="Tipo de Vacuna"
                          icon={Syringe}
                          value={newLogTitle}
                          options={
                            selectedHealthPet.type === 'gato'
                              ? [
                                  { value: "Vacuna Triple Felina (Trivalente)", label: "Vacuna Triple Felina" },
                                  { value: "Vacuna Leucemia Felina (FeLV)", label: "Vacuna Leucemia Felina (FeLV)" },
                                  { value: "Vacuna Antirrábica Felina", label: "Vacuna Antirrábica Felina" },
                                  { value: "Vacuna KC / Complejo Respiratorio Felino", label: "Vacuna KC Complejo Respiratorio" },
                                ]
                              : [
                                  { value: "Vacuna Séxtuple Canina (DHPPI+L)", label: "Vacuna Séxtuple (DHPPI+L)" },
                                  { value: "Vacuna Antirrábica Canina", label: "Vacuna Antirrábica" },
                                  { value: "Vacuna KC / Tos de las Perreras (Bordetella)", label: "Vacuna KC / Tos de las Perreras" },
                                  { value: "Vacuna Óctuple Canina", label: "Vacuna Óctuple Canina" },
                                  { value: "Vacuna Puppy / Cachorro (Primera Dosis)", label: "Vacuna Puppy / Cachorro" },
                                ]
                          }
                          onChange={(val) => setNewLogTitle(val)}
                          rightAction={
                            <button
                              type="button"
                              onClick={() => setIsCustomVaccine(true)}
                              className="text-[#0E8388] text-[11px] font-bold hover:underline cursor-pointer"
                            >
                              ➕ Otra vacuna
                            </button>
                          }
                        />
                      )}
                    </div>

                    {/* FECHA DE APLICACIÓN Y FRECUENCIA */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <CustomDatePicker
                        label="Fecha de Aplicación"
                        icon={Clock}
                        value={newLogDate}
                        onChange={(spanishDate) => {
                          setNewLogDate(spanishDate);
                          setNewLogNextDue(calculateNextDueDate(newLogFrequency, spanishDate));
                        }}
                      />

                      <CustomDropdown
                        label="Frecuencia de Refuerzo"
                        icon={Clock}
                        value={newLogFrequency}
                        options={[
                          { value: "12", label: "Anual (12 meses)" },
                          { value: "6", label: "Semestral (6 meses)" },
                          { value: "1", label: "Refuerzo Cachorro (21-30 días)" },
                        ]}
                        onChange={(freq) => {
                          setNewLogFrequency(freq);
                          setNewLogNextDue(calculateNextDueDate(freq, newLogDate));
                        }}
                      />
                    </div>

                    {/* PRÓXIMA VACUNA CALCULADA */}
                    <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-[#0E8388]/10 to-teal-500/10 border border-emerald-300/60 flex items-center justify-between gap-2">
                      <span className="text-[11px] font-black text-[#0A3E40] uppercase flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-[#0E8388]" />
                        <span>Próxima Vacuna:</span>
                      </span>
                      <span className="text-xs font-black text-emerald-900 bg-white px-3 py-1 rounded-full border border-emerald-300 shadow-xs">
                        📅 {newLogNextDue}
                      </span>
                    </div>
                  </>
                ) : newLogCategory === 'antiparasitario' ? (
                  <>
                    {/* SELECTOR DE ANTIPARASITARIOS ASOCIADOS A LA TIENDA */}
                    <div className="space-y-1.5">
                      {isCustomAntiparasitic ? (
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <label className="font-black text-slate-700 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                              <Pill className="w-3.5 h-3.5 text-amber-500" />
                              <span>Antiparasitario Personalizado</span>
                            </label>
                            <button
                              type="button"
                              onClick={() => setIsCustomAntiparasitic(false)}
                              className="text-[#0E8388] text-[11px] font-bold hover:underline cursor-pointer"
                            >
                              ← Seleccionar de la tienda
                            </button>
                          </div>
                          <input
                            type="text"
                            required
                            placeholder="Ej. Drontal Plus, Endogard, etc."
                            value={customAntiparasiticName}
                            onChange={(e) => setCustomAntiparasiticName(e.target.value)}
                            className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl font-bold focus:outline-hidden text-slate-800 text-xs"
                          />
                        </div>
                      ) : (
                        <CustomDropdown
                          label="Antiparasitario de la Tienda Online"
                          icon={Store}
                          value={selectedAntiparasiticId}
                          options={PRODUCTS.filter(p => p.category === 'Antiparasitarios' && (
                            selectedHealthPet.type === 'gato' ? p.petType === 'gatos' : p.petType === 'perros'
                          )).map(prod => ({
                            value: prod.id,
                            label: `${prod.name} — ${formatCLP(prod.price)}`,
                          }))}
                          onChange={(prodId) => {
                            setSelectedAntiparasiticId(prodId);
                            const prod = PRODUCTS.find(p => p.id === prodId);
                            if (prod) {
                              setNewLogTitle(prod.name);
                              const freq = `${prod.frequencyMonths || 1}`;
                              setNewLogFrequency(freq);
                              setNewLogNextDue(calculateNextDueDate(freq, newLogDate));
                            }
                          }}
                          rightAction={
                            <button
                              type="button"
                              onClick={() => setIsCustomAntiparasitic(true)}
                              className="text-[#0E8388] text-[11px] font-bold hover:underline cursor-pointer"
                            >
                              ➕ Otro no listado
                            </button>
                          }
                        />
                      )}
                    </div>

                    {/* FECHA DE APLICACIÓN Y FRECUENCIA */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <CustomDatePicker
                        label="Fecha de Aplicación"
                        icon={Clock}
                        value={newLogDate}
                        onChange={(spanishDate) => {
                          setNewLogDate(spanishDate);
                          setNewLogNextDue(calculateNextDueDate(newLogFrequency, spanishDate));
                        }}
                      />

                      <CustomDropdown
                        label="Duración de Protección"
                        icon={Clock}
                        value={newLogFrequency}
                        options={[
                          { value: "1", label: "Mensual (1 mes / 30 días)" },
                          { value: "3", label: "Trimestral (3 meses / 12 semanas)" },
                          { value: "6", label: "Semestral (6 meses)" },
                        ]}
                        onChange={(freq) => {
                          setNewLogFrequency(freq);
                          setNewLogNextDue(calculateNextDueDate(freq, newLogDate));
                        }}
                      />
                    </div>

                    {/* PRÓXIMA DOSIS CALCULADA */}
                    <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-[#0E8388]/10 to-teal-500/10 border border-amber-300/60 flex items-center justify-between gap-2">
                      <span className="text-[11px] font-black text-[#0A3E40] uppercase flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-amber-600" />
                        <span>Próxima Dosis:</span>
                      </span>
                      <span className="text-xs font-black text-amber-900 bg-white px-3 py-1 rounded-full border border-amber-300 shadow-xs">
                        📅 {newLogNextDue}
                      </span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="font-black text-slate-700 uppercase tracking-wider text-[11px]">Motivo de Consulta / Examen</label>
                        <input
                          type="text"
                          required
                          placeholder="Ej. Chequeo preventivo de rutina"
                          value={newLogTitle}
                          onChange={(e) => setNewLogTitle(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl font-bold focus:outline-hidden text-slate-800 text-xs"
                        />
                      </div>

                      <CustomDatePicker
                        label="Fecha de Atención"
                        icon={Clock}
                        value={newLogDate}
                        onChange={(spanishDate) => {
                          setNewLogDate(spanishDate);
                        }}
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-black text-slate-700 uppercase tracking-wider text-[11px]">Notas & Observaciones</label>
                      <textarea
                        rows={2}
                        placeholder="Observaciones clínicas, dieta, etc."
                        value={newLogNotes}
                        onChange={(e) => setNewLogNotes(e.target.value)}
                        className="w-full p-3 bg-white border border-slate-200 rounded-xl font-medium focus:outline-hidden leading-relaxed text-xs"
                      />
                    </div>
                  </>
                )}

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-[#0A3E40] to-[#0E8388] hover:from-[#0E8388] hover:to-[#10B981] text-white font-black text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Guardar en Bitácora de {selectedHealthPet.name}</span>
                        </button>
                      </form>
                    )}

                    {/* Health Logs List */}
                    <div className="space-y-3.5">
                      {((healthLogs[selectedHealthPet.id] || []).filter(log => {
                        if (logCategoryFilter === 'todos') return true;
                        return log.category === logCategoryFilter;
                      })).length > 0 ? (
                        (healthLogs[selectedHealthPet.id] || [])
                          .filter(log => logCategoryFilter === 'todos' || log.category === logCategoryFilter)
                          .map((log) => {
                            if (log.category === 'vacunas') {
                              const isExpanded = !!expandedLogIds[log.id];
                              const status = getLogStatus(log);
                              const StatusIcon = status.Icon;

                              return (
                                <div
                                  key={log.id}
                                  className={`rounded-2xl border transition-all shadow-xs overflow-hidden bg-slate-50 ${
                                    isExpanded
                                      ? 'border-[#0E8388]/40 ring-2 ring-[#0E8388]/10 bg-white'
                                      : 'border-slate-200/90 hover:border-slate-300'
                                  }`}
                                >
                                  {/* Collapsible Header: Vaccine Name + Status + Chevron */}
                                  <div
                                    onClick={() => toggleLogExpand(log.id)}
                                    className="p-4 flex items-center justify-between gap-3 cursor-pointer hover:bg-slate-100/70 transition-colors select-none"
                                  >
                                    <div className="flex items-center gap-2 min-w-0 flex-1">
                                      <h4 className="font-black text-slate-900 text-xs sm:text-sm truncate">
                                        {log.title}
                                      </h4>
                                    </div>

                                    <div className="flex items-center gap-2 shrink-0">
                                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black border ${status.bg}`}>
                                        <StatusIcon className="w-3 h-3" />
                                        <span>{status.label}</span>
                                      </span>
                                      <div className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all ${isExpanded ? 'bg-[#0E8388]/10 text-[#0E8388]' : 'text-slate-400'}`}>
                                        <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? 'rotate-180 text-[#0E8388]' : ''}`} />
                                      </div>
                                    </div>
                                  </div>

                                  {/* Expandable Content Details */}
                                  {isExpanded && (
                                    <div className="px-4 pb-4 pt-1 border-t border-slate-200/60 space-y-3 animate-in fade-in zoom-in-95 duration-150">
                                      {/* Dates Information Grid */}
                                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
                                        <div className="p-3 bg-white rounded-xl border border-slate-200/70 space-y-0.5">
                                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                                            📅 Fecha de Aplicación
                                          </span>
                                          <span className="text-xs font-black text-slate-800">
                                            {log.date}
                                          </span>
                                        </div>

                                        <div className={`p-3 rounded-xl border space-y-0.5 ${status.isOverdue ? 'bg-rose-50/80 border-rose-200/80' : 'bg-emerald-50/80 border-emerald-200/80'}`}>
                                          <span className={`text-[10px] font-black uppercase tracking-wider block flex items-center gap-1 ${status.isOverdue ? 'text-rose-700' : 'text-emerald-700'}`}>
                                            <Clock className={`w-3 h-3 ${status.isOverdue ? 'text-rose-600' : 'text-emerald-600'}`} />
                                            <span>Próxima Vacuna / Refuerzo</span>
                                          </span>
                                          <span className={`text-xs font-black ${status.isOverdue ? 'text-rose-900' : 'text-emerald-900'}`}>
                                            {log.nextDueDate || 'En 1 año'}
                                          </span>
                                        </div>
                                      </div>

                                      {/* Automated Reminder Pill */}
                                      <div className="px-3.5 py-2 bg-emerald-50/80 rounded-xl border border-emerald-200/80 flex items-center justify-between gap-2 text-xs text-emerald-900 font-bold">
                                        <span className="flex items-center gap-1.5">
                                          <span>🔔</span>
                                          <span>Aviso automático activado</span>
                                        </span>
                                        <span className="text-[10px] font-black bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-300">
                                          Activo
                                        </span>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              );
                            }

                            if (log.category === 'antiparasitario') {
                              const isExpanded = !!expandedLogIds[log.id];
                              const status = getLogStatus(log);
                              const StatusIcon = status.Icon;

                              // Match with store product
                              const catalogPool = activeCatalog && activeCatalog.length > 0 ? activeCatalog : PRODUCTS;
                              const matchedProduct = catalogPool.find(p => 
                                (log.productId && p.id === log.productId) ||
                                p.name.toLowerCase().includes(log.title.toLowerCase().split(' ')[0]) ||
                                log.title.toLowerCase().includes(p.brand.toLowerCase())
                              ) || catalogPool.find(p => p.category === 'Antiparasitarios');

                              return (
                                <div
                                  key={log.id}
                                  className={`rounded-2xl border transition-all shadow-xs overflow-hidden bg-slate-50 ${
                                    isExpanded
                                      ? 'border-emerald-400/50 ring-2 ring-emerald-400/10 bg-white'
                                      : 'border-slate-200/90 hover:border-slate-300'
                                  }`}
                                >
                                  {/* Collapsible Header */}
                                  <div
                                    onClick={() => toggleLogExpand(log.id)}
                                    className="p-4 flex items-center justify-between gap-3 cursor-pointer hover:bg-slate-100/70 transition-colors select-none"
                                  >
                                    <div className="flex items-center gap-2 min-w-0 flex-1">
                                      <h4 className="font-black text-slate-900 text-xs sm:text-sm truncate">
                                        {log.title}
                                      </h4>
                                    </div>

                                    <div className="flex items-center gap-2 shrink-0">
                                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black border ${status.bg}`}>
                                        <StatusIcon className="w-3 h-3" />
                                        <span>{status.label}</span>
                                      </span>
                                      <div className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all ${isExpanded ? 'bg-emerald-100 text-emerald-800' : 'text-slate-400'}`}>
                                        <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? 'rotate-180 text-emerald-800' : ''}`} />
                                      </div>
                                    </div>
                                  </div>

                                  {/* Expandable Content Details */}
                                  {isExpanded && (
                                    <div className="px-4 pb-4 pt-1 border-t border-slate-200/60 space-y-3 animate-in fade-in zoom-in-95 duration-150">
                                      {/* Dates Information Grid */}
                                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
                                        <div className="p-3 bg-white rounded-xl border border-slate-200/70 space-y-0.5">
                                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                                            📅 Fecha de Aplicación
                                          </span>
                                          <span className="text-xs font-black text-slate-800">
                                            {log.date}
                                          </span>
                                        </div>

                                        <div className={`p-3 rounded-xl border space-y-0.5 ${status.isOverdue ? 'bg-rose-50/80 border-rose-200/80' : 'bg-emerald-50/80 border-emerald-200/80'}`}>
                                          <span className={`text-[10px] font-black uppercase tracking-wider block flex items-center gap-1 ${status.isOverdue ? 'text-rose-700' : 'text-emerald-700'}`}>
                                            <Clock className={`w-3 h-3 ${status.isOverdue ? 'text-rose-600' : 'text-emerald-600'}`} />
                                            <span>Próxima Dosis / Refuerzo</span>
                                          </span>
                                          <span className={`text-xs font-black ${status.isOverdue ? 'text-rose-900' : 'text-emerald-900'}`}>
                                            {log.nextDueDate || 'En 1 mes'}
                                          </span>
                                        </div>
                                      </div>

                                      {/* Automated Reminder Pill (Always Green for Active Status) */}
                                      <div className="px-3.5 py-2 bg-emerald-50/80 rounded-xl border border-emerald-200/80 flex items-center justify-between gap-2 text-xs text-emerald-900 font-bold">
                                        <span className="flex items-center gap-1.5">
                                          <span>🔔</span>
                                          <span>Aviso automático activado</span>
                                        </span>
                                        <span className="text-[10px] font-black bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-300">
                                          Activo
                                        </span>
                                      </div>

                                      {/* DIRECT STORE LINK & REPO REORDER ACTION */}
                                      {matchedProduct && (() => {
                                        const isMatchedOutOfStock = isProductOutOfStock(matchedProduct, matchedProduct.weights?.[0]);

                                        return (
                                          <div className="p-3 bg-gradient-to-r from-white to-amber-50/60 rounded-2xl border border-amber-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
                                            <div className="flex items-center gap-3">
                                              <div className="w-12 h-12 rounded-xl bg-white p-1 border border-slate-200 shadow-xs shrink-0 relative overflow-hidden flex items-center justify-center">
                                                <img
                                                  src={matchedProduct.image}
                                                  alt={matchedProduct.name}
                                                  className={`w-full h-full object-contain ${isMatchedOutOfStock ? 'opacity-40 grayscale' : ''}`}
                                                />
                                              </div>
                                              <div>
                                                <div className="flex items-center gap-1.5">
                                                  <span className="text-[10px] font-black text-[#0E8388] uppercase tracking-wider">
                                                    🛒 Disponible en Tienda Online
                                                  </span>
                                                  {isMatchedOutOfStock ? (
                                                    <span className="text-[9px] font-extrabold bg-rose-100 text-rose-700 px-1.5 py-0.5 rounded-md flex items-center gap-1">
                                                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                                                      Sin Stock
                                                    </span>
                                                  ) : (
                                                    <span className="text-[9px] font-extrabold bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded-md">
                                                      En Stock
                                                    </span>
                                                  )}
                                                </div>
                                                <h5 className="font-bold text-slate-900 text-xs line-clamp-1">{matchedProduct.name}</h5>
                                                <p className="text-xs font-black text-[#0A3E40] mt-0.5">
                                                  {formatCLP(matchedProduct.price)}
                                                </p>
                                              </div>
                                            </div>

                                            <button
                                              type="button"
                                              disabled={isMatchedOutOfStock}
                                              onClick={() => {
                                                if (isMatchedOutOfStock) return;
                                                onAddToCart(matchedProduct, matchedProduct.weights?.[0] || '1 Dosis', 1);
                                              }}
                                              className={`px-4 py-2.5 rounded-xl font-black text-xs transition-all shadow-md flex items-center justify-center gap-1.5 shrink-0 ${
                                                isMatchedOutOfStock
                                                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                                                  : 'bg-[#0A3E40] hover:bg-[#0E8388] text-white cursor-pointer active:scale-95'
                                              }`}
                                            >
                                              <ShoppingBag className={`w-4 h-4 ${isMatchedOutOfStock ? 'text-slate-400' : 'text-emerald-400'}`} />
                                              <span>{isMatchedOutOfStock ? 'Sin Stock en Bodega' : 'Comprar Reposición'}</span>
                                            </button>
                                          </div>
                                        );
                                      })()}
                                    </div>
                                  )}
                                </div>
                              );
                            }

                            const isExpanded = !!expandedLogIds[log.id];
                            return (
                              <div
                                key={log.id}
                                className={`rounded-2xl border transition-all shadow-xs overflow-hidden bg-slate-50 ${
                                  isExpanded
                                    ? 'border-teal-400/50 ring-2 ring-teal-400/10 bg-white'
                                    : 'border-slate-200/90 hover:border-slate-300'
                                }`}
                              >
                                <div
                                  onClick={() => toggleLogExpand(log.id)}
                                  className="p-4 flex items-center justify-between gap-3 cursor-pointer hover:bg-slate-100/70 transition-colors select-none"
                                >
                                  <div className="flex items-center gap-2 min-w-0 flex-1">
                                    <h4 className="font-black text-slate-900 text-xs sm:text-sm truncate">{log.title}</h4>
                                  </div>

                                  <div className="flex items-center gap-2 shrink-0">
                                    <span className="text-xs text-slate-500 font-bold">{log.date}</span>
                                    <div className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all ${isExpanded ? 'bg-teal-100 text-teal-700' : 'text-slate-400'}`}>
                                      <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? 'rotate-180 text-teal-700' : ''}`} />
                                    </div>
                                  </div>
                                </div>

                                {isExpanded && log.notes && (
                                  <div className="px-4 pb-4 pt-1 border-t border-slate-200/60 animate-in fade-in zoom-in-95 duration-150">
                                    <p className="text-slate-700 text-xs font-medium bg-white p-3 rounded-xl border border-slate-200/70 leading-relaxed mt-2">
                                      💬 <strong>Observación Médica:</strong> "{log.notes}"
                                    </p>
                                  </div>
                                )}
                              </div>
                            );
                          })
                      ) : (
                        /* CATEGORY SPECIFIC EMPTY STATE WITH DIRECT REGISTRATION BUTTON */
                        <div className="text-center py-10 px-6 rounded-3xl bg-gradient-to-br from-slate-50 to-[#E6F4F1]/30 border border-slate-200 space-y-4 shadow-inner">
                  <div className="w-16 h-16 rounded-3xl bg-white shadow-md border border-slate-200 mx-auto flex items-center justify-center text-3xl">
                    {logCategoryFilter === 'vacunas' ? '💉' : logCategoryFilter === 'antiparasitario' ? '💊' : '🩺'}
                  </div>
                  <div className="space-y-1">
                    <h5 className="font-black text-slate-900 text-base">
                      No hay registros en {logCategoryFilter === 'vacunas' ? 'Vacunas' : logCategoryFilter === 'antiparasitario' ? 'Antiparasitarios' : 'Notas Veterinarias'}
                    </h5>
                    <p className="text-xs text-slate-500 font-medium max-w-sm mx-auto">
                      {logCategoryFilter === 'vacunas'
                        ? `Registra las vacunas de ${selectedHealthPet.name} para activar los recordatorios automáticos de próximos refuerzos.`
                        : logCategoryFilter === 'antiparasitario'
                        ? `Registra los antiparasitarios de ${selectedHealthPet.name} para activar los avisos de próximas dosis y reponerlos en 1 clic.`
                        : `Lleva el control de salud al día para ${selectedHealthPet.name}.`}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setNewLogCategory(logCategoryFilter);
                      if (logCategoryFilter === 'vacunas') {
                        setNewLogTitle(selectedHealthPet.type === 'gato' ? 'Vacuna Triple Felina (Trivalente)' : 'Vacuna Séxtuple Canina (DHPPI+L)');
                        setNewLogFrequency('12');
                        setNewLogNextDue(calculateNextDueDate(12));
                      } else if (logCategoryFilter === 'antiparasitario') {
                        const petAntiparasitics = PRODUCTS.filter(p => 
                          p.category === 'Antiparasitarios' && (
                            selectedHealthPet.type === 'gato' ? p.petType === 'gatos' : p.petType === 'perros'
                          )
                        );
                        if (petAntiparasitics.length > 0) {
                          setSelectedAntiparasiticId(petAntiparasitics[0].id);
                          setNewLogTitle(petAntiparasitics[0].name);
                          setNewLogFrequency(`${petAntiparasitics[0].frequencyMonths || 1}`);
                          setNewLogNextDue(calculateNextDueDate(petAntiparasitics[0].frequencyMonths || 1));
                        }
                      }
                      setIsAddLogFormOpen(true);
                    }}
                    className="px-5 py-3 rounded-2xl bg-gradient-to-r from-[#0E8388] to-[#10B981] hover:scale-105 text-white font-black text-xs shadow-md transition-all inline-flex items-center gap-2 cursor-pointer border border-emerald-300/40"
                  >
                    <Plus className="w-4 h-4" />
                    <span>
                      Registrar {logCategoryFilter === 'vacunas' ? 'Nueva Vacuna 💉' : logCategoryFilter === 'antiparasitario' ? 'Antiparasitario 💊' : 'Nota Médica 🩺'}
                    </span>
                  </button>
                </div>
              )}
            </div>

          </div>
        </div>
      )}

      {/* MODAL: REPONER ALIMENTO CON ALIMENTO HABITUAL Y OPCIONES SIMILARES / SABORES */}
      {selectedReplenishPet && (() => {
        const { currentProduct, similarProducts } = getReplenishProducts(selectedReplenishPet);
        const mainFlavor = currentProduct ? getFlavorBadge(currentProduct) : null;
        const isMainProductOutOfStock = isProductOutOfStock(currentProduct, replenishWeight);

        return (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-3xl w-full my-auto overflow-hidden animate-in zoom-in-95 duration-200 max-h-[92vh] flex flex-col">
              
              {/* Modal Header */}
              <div className="p-4 sm:p-6 bg-gradient-to-r from-[#0A3E40] via-[#0E8388] to-[#10B981] text-white flex items-center justify-between gap-4 shrink-0 shadow-md">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-white/15 backdrop-blur-md border border-white/30 flex items-center justify-center text-2xl shadow-inner shrink-0">
                    {selectedReplenishPet.type === 'gato' ? '🐱' : '🐶'}
                  </div>
                  <div>
                    <span className="text-[10px] font-black text-emerald-200 uppercase tracking-wider block">
                      Nutrición & Reposición Inteligente
                    </span>
                    <h3 className="text-sm sm:text-lg font-black text-white leading-tight">
                      Reponer Alimento de {selectedReplenishPet.name}
                    </h3>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedReplenishPet(null)}
                  className="w-9 h-9 rounded-full bg-white/15 hover:bg-white/25 text-white flex items-center justify-center transition-all cursor-pointer shrink-0 border border-white/20 active:scale-95"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body: Scrollable Area */}
              <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1">
                
                {/* 1. MAIN CURRENT PRODUCT CARD (ALIMENTO HABITUAL) */}
                {currentProduct && (
                  <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-br from-emerald-50/60 via-white to-slate-50 border-2 border-[#0E8388]/30 shadow-sm space-y-4 relative overflow-hidden">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <span className="px-3 py-1 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-emerald-600" />
                        <span>Alimento Habitual de {selectedReplenishPet.name}</span>
                      </span>
                      {isMainProductOutOfStock ? (
                        <span className="text-[10px] font-extrabold text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                          🔴 Sin Stock en Bodega (Agotado)
                        </span>
                      ) : (
                        <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                          🟢 En Stock Inmediato
                        </span>
                      )}
                    </div>

                    {isMainProductOutOfStock && (
                      <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5 shadow-2xs">
                        <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                        <div className="space-y-0.5">
                          <p className="font-black">Este alimento habitual no cuenta con existencias en bodega en este momento.</p>
                          <p className="text-[11px] text-amber-800">
                            No es posible despacharlo ni programar reposición de este producto hoy. Te sugerimos revisar las opciones de variedad de sabor o alternativas disponibles más abajo.
                          </p>
                        </div>
                      </div>
                    )}

                    <div className="flex flex-col sm:flex-row gap-4 items-center sm:items-start">
                      {/* Product Image */}
                      <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-white p-2 border border-slate-200 shadow-sm flex items-center justify-center shrink-0 relative overflow-hidden">
                        <img
                          src={currentProduct.image}
                          alt={currentProduct.name}
                          className={`w-full h-full object-contain hover:scale-105 transition-transform ${
                            isMainProductOutOfStock ? 'opacity-40 grayscale' : ''
                          }`}
                        />
                        {isMainProductOutOfStock && (
                          <div className="absolute inset-0 bg-slate-900/30 backdrop-blur-[1px] flex items-center justify-center">
                            <span className="text-[9px] font-black uppercase text-white bg-rose-600/90 px-1.5 py-0.5 rounded-md shadow-xs">
                              Sin Stock
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Product Details */}
                      <div className="space-y-1.5 flex-1 text-center sm:text-left">
                        <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                          <span className="text-[10px] font-black uppercase tracking-wider text-[#0E8388]">
                            {currentProduct.brand} {currentProduct.gama && `• ${currentProduct.gama}`}
                          </span>
                          {mainFlavor && (
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${mainFlavor.bg}`}>
                              {mainFlavor.emoji} {mainFlavor.label}
                            </span>
                          )}
                        </div>

                        <h4 className="text-sm sm:text-base font-black text-slate-900 leading-snug">
                          {currentProduct.name}
                        </h4>

                        <div className="flex items-baseline justify-center sm:justify-start gap-2">
                          <span className="text-lg sm:text-xl font-black text-[#0A3E40]">
                            {formatCLP(currentProduct.price)}
                          </span>
                          {currentProduct.originalPrice && (
                            <span className="text-xs text-slate-400 line-through font-semibold">
                              {formatCLP(currentProduct.originalPrice)}
                            </span>
                          )}
                        </div>

                        {/* Format / Weight Selector */}
                        {currentProduct.weights && currentProduct.weights.length > 0 && (
                          <div className="pt-1">
                            <span className="text-[10px] font-extrabold text-slate-500 block mb-1.5 uppercase tracking-wider">
                              Selecciona el Formato:
                            </span>
                            <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                              {currentProduct.weights.map((weight) => (
                                <button
                                  key={weight}
                                  type="button"
                                  onClick={() => setReplenishWeight(weight)}
                                  className={`px-3 py-1 rounded-xl text-xs font-black transition-all cursor-pointer border ${
                                    replenishWeight === weight
                                      ? 'bg-[#0A3E40] text-white border-[#0A3E40] shadow-xs'
                                      : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                                  }`}
                                >
                                  {weight}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Delivery Day, Time Slot & Payment Method Configuration (PWA Client Flow) */}
                    <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-3.5 text-left">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-base">📅</span>
                          <h5 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                            Programar Despacho a Domicilio
                          </h5>
                        </div>
                        <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          ⚡ PWA Despacho Express
                        </span>
                      </div>

                      {/* 1. Delivery Day Selector */}
                      <div className="space-y-1.5">
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                          ¿Qué día prefieres recibirlo?
                        </span>
                        <div className="grid grid-cols-3 gap-2">
                          <button
                            type="button"
                            onClick={() => setSchedDeliveryDay('hoy')}
                            className={`py-2 px-2 rounded-xl text-xs font-black transition-all border text-center cursor-pointer ${
                              schedDeliveryDay === 'hoy'
                                ? 'bg-[#0A3E40] text-white border-[#0A3E40] shadow-xs'
                                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                            }`}
                          >
                            <span className="block text-xs">Hoy Mismo</span>
                            <span className="text-[10px] opacity-80 block">🚀 Express</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setSchedDeliveryDay('manana')}
                            className={`py-2 px-2 rounded-xl text-xs font-black transition-all border text-center cursor-pointer ${
                              schedDeliveryDay === 'manana'
                                ? 'bg-[#0A3E40] text-white border-[#0A3E40] shadow-xs'
                                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                            }`}
                          >
                            <span className="block text-xs">Mañana</span>
                            <span className="text-[10px] opacity-80 block">📦 19 Ago</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setSchedDeliveryDay('otro')}
                            className={`py-2 px-2 rounded-xl text-xs font-black transition-all border text-center cursor-pointer ${
                              schedDeliveryDay === 'otro'
                                ? 'bg-[#0A3E40] text-white border-[#0A3E40] shadow-xs'
                                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                            }`}
                          >
                            <span className="block text-xs">Elegir Fecha</span>
                            <span className="text-[10px] opacity-80 block">📅 Calendario</span>
                          </button>
                        </div>

                        {schedDeliveryDay === 'otro' && (
                          <div className="pt-1.5 animate-in fade-in duration-200">
                            <input
                              type="date"
                              value={schedCustomDate}
                              min="2026-08-18"
                              onChange={(e) => setSchedCustomDate(e.target.value)}
                              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-[#0E8388]"
                            />
                          </div>
                        )}
                      </div>

                      {/* 2. Time Slot Selector */}
                      <div className="space-y-1.5">
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                          Franja Horaria de Entrega:
                        </span>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => setSchedTimeSlot('manana')}
                            className={`py-2 px-2.5 rounded-xl text-xs font-black transition-all border text-center cursor-pointer ${
                              schedTimeSlot === 'manana'
                                ? 'bg-amber-100 border-amber-400 text-amber-950 shadow-2xs'
                                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                            }`}
                          >
                            <span>🌅 Mañana</span>
                            <span className="block text-[10px] font-semibold text-slate-500">09:00 - 13:00 hrs</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setSchedTimeSlot('tarde')}
                            className={`py-2 px-2.5 rounded-xl text-xs font-black transition-all border text-center cursor-pointer ${
                              schedTimeSlot === 'tarde'
                                ? 'bg-teal-100 border-teal-500 text-teal-950 shadow-2xs'
                                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                            }`}
                          >
                            <span>🌇 Tarde</span>
                            <span className="block text-[10px] font-semibold text-slate-500">14:00 - 19:00 hrs</span>
                          </button>
                        </div>
                      </div>

                      {/* 3. Payment Method Selector */}
                      <div className="space-y-1.5">
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                          Método de Pago:
                        </span>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                          {[
                            { id: 'Web', label: 'Web', icon: '🌐', sub: 'Online' },
                            { id: 'Tarjeta', label: 'Tarjeta', icon: '💳', sub: 'POS al recibir' },
                            { id: 'Efectivo', label: 'Efectivo', icon: '💵', sub: 'Contra entrega' },
                            { id: 'Transferencia', label: 'Transfer.', icon: '🏦', sub: 'Bancaria' },
                          ].map((pm) => (
                            <button
                              key={pm.id}
                              type="button"
                              onClick={() => setSchedPaymentMethod(pm.id)}
                              className={`p-2 rounded-xl text-left border transition-all cursor-pointer ${
                                schedPaymentMethod === pm.id
                                  ? 'bg-[#0E8388]/15 border-[#0E8388] text-[#0A3E40] shadow-2xs font-black'
                                  : 'bg-slate-50 border-slate-200/80 text-slate-600 hover:bg-slate-100'
                              }`}
                            >
                              <div className="flex items-center gap-1">
                                <span className="text-xs">{pm.icon}</span>
                                <span className="text-xs font-bold">{pm.label}</span>
                              </div>
                              <div className="text-[9px] text-slate-500">{pm.sub}</div>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* 4. Delivery Address */}
                      <div className="space-y-1">
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                          Dirección de Despacho:
                        </span>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                          <input
                            type="text"
                            value={schedAddress}
                            onChange={(e) => setSchedAddress(e.target.value)}
                            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-[#0E8388]"
                            placeholder="Dirección de entrega..."
                          />
                        </div>
                      </div>
                    </div>

                    {/* Quantity & Action Buttons */}
                    <div className="pt-3 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-600">Cantidad:</span>
                        <div className="flex items-center border border-slate-200 rounded-xl bg-white p-0.5 shadow-xs">
                          <button
                            type="button"
                            onClick={() => setReplenishQuantity(Math.max(1, replenishQuantity - 1))}
                            className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="w-8 text-center text-xs font-black text-slate-900">
                            {replenishQuantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => setReplenishQuantity(replenishQuantity + 1)}
                            className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        <button
                          type="button"
                          disabled={isMainProductOutOfStock}
                          onClick={() => {
                            if (isMainProductOutOfStock) return;
                            onAddToCart(currentProduct, replenishWeight || currentProduct.weights?.[0] || '12 kg', replenishQuantity);
                            setReplenishAddedSuccess(true);
                            setTimeout(() => setReplenishAddedSuccess(false), 2500);
                          }}
                          className={`px-4 py-3 rounded-2xl font-black text-xs transition-all border flex items-center justify-center gap-1.5 ${
                            isMainProductOutOfStock
                              ? 'border-slate-200 bg-slate-100 text-slate-400 cursor-not-allowed opacity-60'
                              : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 cursor-pointer active:scale-95'
                          }`}
                          title={isMainProductOutOfStock ? "Producto sin stock en bodega" : "Solo agregar al carrito estándar"}
                        >
                          <ShoppingBag className="w-4 h-4 text-slate-500" />
                          <span>{isMainProductOutOfStock ? 'Sin Stock' : 'Al Carrito'}</span>
                        </button>

                        <button
                          type="button"
                          disabled={isMainProductOutOfStock}
                          onClick={() => {
                            if (isMainProductOutOfStock) return;
                            const today = new Date();
                            const tomorrow = new Date();
                            tomorrow.setDate(today.getDate() + 1);
                            const tomorrowFormatted = tomorrow.toLocaleDateString('es-CL', { day: 'numeric', month: 'short' });
                            const dayLabel = schedDeliveryDay === 'hoy' ? 'Hoy Mismo' : (schedDeliveryDay === 'manana' ? `Mañana ${tomorrowFormatted}` : schedCustomDate);
                            const timeLabel = schedTimeSlot === 'manana' ? '09:00 - 13:00 hrs' : '14:00 - 19:00 hrs';
                            const orderTotalNum = currentProduct.price * replenishQuantity;
                            const newOrderId = `PTS-${Math.floor(1000 + Math.random() * 9000)}`;

                            const newOrder = {
                              id: newOrderId,
                              date: today.toLocaleDateString('es-CL', { day: 'numeric', month: 'short', year: 'numeric' }),
                              dateIso: today.toISOString().split('T')[0],
                              product: `${currentProduct.name} (${replenishWeight || currentProduct.weights?.[0] || '12 kg'})`,
                              category: 'Alimento Seco',
                              total: formatCLP(orderTotalNum),
                              pointsEarned: Math.floor(orderTotalNum / 1000),
                              status: 'En Preparación ⏳',
                              statusCode: 'en_preparacion',
                              statusColor: 'bg-amber-100 text-amber-800 border-amber-300',
                              deliveryDayText: dayLabel,
                              deliverySlot: timeLabel,
                              paymentMethod: schedPaymentMethod,
                              address: schedAddress,
                            };

                            setOrdersList((prev) => [newOrder, ...prev]);

                            // Reset pet food duration counter
                            setPets((prevPets) =>
                              prevPets.map((p) =>
                                p.id === selectedReplenishPet.id
                                  ? {
                                      ...p,
                                      daysRemaining: p.totalDaysDuration,
                                      lastOrderDate: today.toLocaleDateString('es-CL', { day: 'numeric', month: 'long', year: 'numeric' }),
                                    }
                                  : p
                              )
                            );

                            setSelectedReplenishPet(null);
                            setActiveTab('compras');
                            setOrderToastMessage(`🎉 ¡Pedido programado con éxito! Entrega: ${dayLabel} (${timeLabel}) · Pago: ${schedPaymentMethod}.`);
                            setTimeout(() => setOrderToastMessage(null), 8000);

                            // Sincronizar orden en Supabase
                            createOrderInSupabase({
                              customerName: profileData.name || user?.name || 'Cliente Patitas',
                              customerEmail: profileData.email || user?.email || '',
                              customerPhone: profileData.phone || user?.phone || '',
                              channel: 'web',
                              paymentMethod: schedPaymentMethod,
                              paymentStatus: schedPaymentMethod === 'Web' || schedPaymentMethod === 'Tarjeta' ? 'pagado' : 'pendiente',
                              status: 'en_preparacion',
                              subtotal: orderTotalNum,
                              shippingCost: 0,
                              total: orderTotalNum,
                              address: schedAddress,
                              deliveryDayText: dayLabel,
                              deliverySlot: timeLabel,
                            }, [
                              {
                                id: currentProduct.id,
                                name: currentProduct.name,
                                weight: replenishWeight || currentProduct.weights?.[0] || '12 kg',
                                quantity: replenishQuantity,
                                price: currentProduct.price,
                              }
                            ]).then(() => {
                              window.dispatchEvent(new CustomEvent('patitas_orders_updated'));
                            }).catch((err) => console.warn('Replenish sync order:', err));
                          }}
                          className={`flex-1 sm:flex-initial px-5 py-3 rounded-2xl font-black text-xs transition-all shadow-md flex items-center justify-center gap-2 ${
                            isMainProductOutOfStock
                              ? 'bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-300 shadow-none'
                              : 'cursor-pointer bg-gradient-to-r from-[#0E8388] to-[#0A3E40] text-white hover:shadow-lg active:scale-95'
                          }`}
                        >
                          <Truck className={`w-4 h-4 ${isMainProductOutOfStock ? 'text-slate-400' : 'text-emerald-300'}`} />
                          <span>{isMainProductOutOfStock ? 'Producto Sin Stock en Bodega' : 'Programar Entrega & Confirmar'}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. SIMILAR OPTIONS & FLAVOR VARIETIES (CAROUSEL WITH NAVIGATION ARROWS) */}
                {similarProducts.length > 0 && (
                  <div className="space-y-3 pt-2">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <h4 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
                          <span>🔄</span>
                          <span>¿Quieres variar de sabor? Otras opciones {currentProduct?.brand ? `de ${currentProduct.brand}` : 'similares'}</span>
                        </h4>
                        <p className="text-[11px] text-slate-500 font-medium">
                          Misma calidad y digestibilidad para rotar el menú de {selectedReplenishPet.name} sin problemas estomacales.
                        </p>
                      </div>

                      {/* Navigation Arrows */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => scrollSimilar('left')}
                          className="w-8 h-8 rounded-full border border-slate-200 bg-white hover:bg-[#0E8388] hover:text-white hover:border-[#0E8388] text-slate-700 shadow-xs flex items-center justify-center transition-all cursor-pointer active:scale-90"
                          title="Ver anteriores"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => scrollSimilar('right')}
                          className="w-8 h-8 rounded-full border border-slate-200 bg-white hover:bg-[#0E8388] hover:text-white hover:border-[#0E8388] text-slate-700 shadow-xs flex items-center justify-center transition-all cursor-pointer active:scale-90"
                          title="Ver siguientes"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Horizontal Scrollable Track */}
                    <div
                      ref={similarSliderRef}
                      className="flex gap-3 overflow-x-auto pb-2 pt-1 -mx-1 px-1 scroll-smooth snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                    >
                      {similarProducts.map((prod) => {
                        const flavor = getFlavorBadge(prod);
                        const weightChoice = selectedSimilarWeight[prod.id] || prod.weights?.[prod.weights.length - 1] || '12 kg';
                        const isSimilarOutOfStock = isProductOutOfStock(prod, weightChoice);

                        return (
                          <div
                            key={prod.id}
                            className={`min-w-[270px] sm:min-w-[290px] max-w-[290px] p-4 rounded-2xl bg-white border transition-all flex flex-col justify-between gap-3 group shrink-0 snap-start ${
                              isSimilarOutOfStock ? 'border-slate-200/60 opacity-85' : 'border-slate-200/90 hover:border-[#0E8388]/60 hover:shadow-md'
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-slate-50 p-1 border border-slate-100 shrink-0 flex items-center justify-center relative overflow-hidden">
                                <img
                                  src={prod.image}
                                  alt={prod.name}
                                  className={`w-full h-full object-contain group-hover:scale-105 transition-transform ${
                                    isSimilarOutOfStock ? 'opacity-40 grayscale' : ''
                                  }`}
                                />
                                {isSimilarOutOfStock && (
                                  <div className="absolute inset-0 bg-slate-900/30 backdrop-blur-[1px] flex items-center justify-center">
                                    <span className="text-[8px] font-black uppercase text-white bg-rose-600/90 px-1 py-0.5 rounded">
                                      Sin Stock
                                    </span>
                                  </div>
                                )}
                              </div>

                              <div className="space-y-1 min-w-0 flex-1">
                                <div className="flex items-center gap-1 flex-wrap">
                                  <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full border inline-flex items-center gap-1 ${flavor.bg}`}>
                                    <span>{flavor.emoji}</span>
                                    <span>{flavor.label}</span>
                                  </span>
                                  {isSimilarOutOfStock && (
                                    <span className="text-[8px] font-black uppercase text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
                                      Agotado
                                    </span>
                                  )}
                                </div>
                                <h5 className="text-xs font-black text-slate-900 line-clamp-2 leading-tight">
                                  {prod.name}
                                </h5>
                                <div className="text-xs font-black text-[#0A3E40]">
                                  {formatCLP(prod.price)}
                                </div>
                              </div>
                            </div>

                            {/* Weight Choice + Add Button */}
                            <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2 flex-wrap">
                              {prod.weights && prod.weights.length > 0 ? (
                                <div className="flex items-center gap-1">
                                  {prod.weights.map((w) => (
                                    <button
                                      key={w}
                                      type="button"
                                      onClick={() => setSelectedSimilarWeight(prev => ({ ...prev, [prod.id]: w }))}
                                      className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer border ${
                                        weightChoice === w
                                          ? 'bg-slate-900 text-white border-slate-900'
                                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-slate-300'
                                      }`}
                                    >
                                      {w}
                                    </button>
                                  ))}
                                </div>
                              ) : <div />}

                              <button
                                type="button"
                                disabled={isSimilarOutOfStock}
                                onClick={() => {
                                  if (isSimilarOutOfStock) return;
                                  onAddToCart(prod, weightChoice, 1);
                                }}
                                className={`px-3 py-1.5 rounded-xl font-black text-[11px] transition-all flex items-center gap-1 ml-auto ${
                                  isSimilarOutOfStock
                                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                    : 'bg-[#0E8388]/10 hover:bg-[#0E8388] text-[#0E8388] hover:text-white cursor-pointer active:scale-95'
                                }`}
                              >
                                {isSimilarOutOfStock ? (
                                  <span>Agotado</span>
                                ) : (
                                  <>
                                    <Plus className="w-3.5 h-3.5" />
                                    <span>Agregar</span>
                                  </>
                                )}
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* 3. NUTRITIONAL TIP BOX */}
                <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/80 text-[11px] text-amber-900 leading-relaxed flex items-start gap-2.5">
                  <span className="text-base shrink-0">💡</span>
                  <div>
                    <strong>Tip Nutricional Patitas del Sur:</strong> Al rotar entre sabores de la misma línea <em>{currentProduct?.brand || 'Bravery'} (100% Monoproteica y Grain Free)</em>, la transición se puede realizar de forma directa y segura, brindándole a {selectedReplenishPet.name} variedad de proteínas sin alterar su digestión.
                  </div>
                </div>

              </div>

            </div>
          </div>
        );
      })()}

      {/* MODAL MINIMALISTA: CANJE DE PUNTOS POR BENEFICIOS Y CUPONES DE COMPRA */}
      <RedeemPointsModal
        isOpen={isRedeemModalOpen}
        onClose={() => setIsRedeemModalOpen(false)}
        userPoints={userPoints}
        rewards={redeemRewards}
        onRedeem={handleRedeemReward}
        activeCoupons={activeCoupons}
        pointsPerThousand={loyaltySettings.pointsPerThousand || 1}
      />

          {/* MODAL: SEGUIMIENTO EN VIVO DE DESPACHO PWA CLIENTES */}
      {liveTrackingOrder && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setLiveTrackingOrder(null)}
        >
          <div
            className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-5 bg-gradient-to-r from-[#0A3E40] via-[#0E8388] to-[#10B981] text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center text-xl shadow-inner">
                  🚚
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase text-emerald-200 tracking-wider block">
                    Seguimiento en Tiempo Real
                  </span>
                  <h3 className="text-base font-black leading-tight text-white">
                    Pedido {liveTrackingOrder.id}
                  </h3>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setLiveTrackingOrder(null)}
                className="w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Stepper Progress */}
            <div className="p-6 space-y-5">
              <div className="space-y-4">
                {[
                  {
                    step: 1,
                    title: 'Pedido Confirmado',
                    sub: 'Tu orden fue ingresada y validada en el sistema.',
                    done: true,
                    active: false,
                  },
                  {
                    step: 2,
                    title: 'Preparación en Bodega',
                    sub: 'Empaque hermético y revisión de lote en Puerto Varas.',
                    done: liveTrackingOrder.statusCode === 'en_camino' || liveTrackingOrder.statusCode === 'entregado',
                    active: liveTrackingOrder.statusCode === 'en_preparacion',
                  },
                  {
                    step: 3,
                    title: 'En Camino a tu Domicilio',
                    sub: `Despacho en móvil de reparto. Franja: ${liveTrackingOrder.deliverySlot || '14:00 - 19:00 hrs'}.`,
                    done: liveTrackingOrder.statusCode === 'entregado',
                    active: liveTrackingOrder.statusCode === 'en_camino',
                  },
                  {
                    step: 4,
                    title: 'Entregado en Domicilio',
                    sub: 'Completado y firmado por el tutor.',
                    done: liveTrackingOrder.statusCode === 'entregado',
                    active: false,
                  },
                ].map((st, idx) => (
                  <div key={idx} className="flex items-start gap-3.5 relative">
                    {idx < 3 && (
                      <div
                        className={`absolute left-4 top-8 w-0.5 h-8 ${
                          st.done ? 'bg-emerald-500' : 'bg-slate-200'
                        }`}
                      />
                    )}
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs shrink-0 z-10 ${
                        st.done
                          ? 'bg-emerald-500 text-white shadow-xs'
                          : st.active
                          ? 'bg-[#0E8388] text-white ring-4 ring-[#0E8388]/20 animate-pulse'
                          : 'bg-slate-100 text-slate-400 border border-slate-200'
                      }`}
                    >
                      {st.done ? '✓' : st.step}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <h4
                          className={`text-xs font-black ${
                            st.active ? 'text-[#0E8388]' : st.done ? 'text-slate-900' : 'text-slate-400'
                          }`}
                        >
                          {st.title}
                        </h4>
                        {st.active && (
                          <span className="text-[10px] font-bold text-[#0E8388] bg-[#0E8388]/10 px-2 py-0.5 rounded-full border border-[#0E8388]/20">
                            En Curso ⏳
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 font-medium">{st.sub}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Details Inset Card */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span className="font-bold">Producto:</span>
                  <span className="font-extrabold text-slate-900 truncate max-w-[200px]">{liveTrackingOrder.product}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span className="font-bold">Entrega:</span>
                  <span className="font-black text-[#0A3E40]">{liveTrackingOrder.deliveryDayText || liveTrackingOrder.date} · {liveTrackingOrder.deliverySlot || 'Tarde'}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span className="font-bold">Pago:</span>
                  <span className="font-bold text-slate-800">{liveTrackingOrder.paymentMethod || 'Tarjeta'}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span className="font-bold">Dirección:</span>
                  <span className="font-medium text-slate-700 truncate max-w-[200px]">{liveTrackingOrder.address || 'Av. Los Colonos 1420, Puerto Varas'}</span>
                </div>
              </div>

              {/* Driver & Support Row */}
              <div className="flex items-center justify-between gap-3 pt-2 border-t border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-sm">
                    👨‍✈️
                  </div>
                  <div>
                    <div className="text-xs font-black text-slate-900">Rodrigo Muñoz</div>
                    <div className="text-[10px] text-slate-500 font-bold">Repartidor Patitas Móvil</div>
                  </div>
                </div>

                <a
                  href={`https://wa.me/56987654321?text=${encodeURIComponent(`Hola, tengo una consulta sobre mi entrega del pedido ${liveTrackingOrder.id}.`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs border border-emerald-200 flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Contactar por WhatsApp"
                >
                  <WhatsAppIcon className="w-3.5 h-3.5 shrink-0" />
                  <span>WhatsApp</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: OTRAS OPCIONES DE ALIMENTO PARA LA MASCOTA */}
      {isAlternativeFoodModalOpen && activeSelectedPet && (() => {
        const { currentProduct, similarProducts } = getReplenishProducts(activeSelectedPet);

        return (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-200">
              {/* Header */}
              <div className="p-5 sm:p-6 bg-gradient-to-r from-[#0A3E40] via-[#0E8388] to-[#10B981] text-white flex items-center justify-between gap-3 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-xl shrink-0">
                    🔄
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-black leading-tight">
                      Otras Opciones de Alimento para {activeSelectedPet.name}
                    </h3>
                    <p className="text-[11px] text-emerald-100 font-medium">
                      Variedades monoproteicas y grain free compatibles con su digestión.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAlternativeFoodModalOpen(false)}
                  className="w-9 h-9 rounded-full bg-white/15 hover:bg-white/25 text-white flex items-center justify-center transition-all cursor-pointer shrink-0 border border-white/20 active:scale-95"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body */}
              <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1">
                <div className="p-3.5 rounded-2xl bg-amber-50/90 border border-amber-200/90 text-xs text-amber-950 flex items-start gap-2.5">
                  <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <strong>Rotación de proteínas segura:</strong> Todas estas opciones pertenecen a líneas de calidad holística super premium, permitiendo alternar sabores (salmón, cordero, pollo, cerdo ibérico) sin alterar la flora intestinal de {activeSelectedPet.name}.
                  </div>
                </div>

                <div className="space-y-3">
                  {similarProducts.map((prod) => {
                    const flavor = getFlavorBadge(prod);
                    const defaultWeight = prod.weights?.[0] || '12 kg';
                    const isProdOutOfStock = isProductOutOfStock(prod, defaultWeight);

                    return (
                      <div
                        key={prod.id}
                        className={`p-4 rounded-2xl bg-slate-50 border transition-all flex flex-col sm:flex-row items-center sm:items-start justify-between gap-4 shadow-2xs ${
                          isProdOutOfStock
                            ? 'border-slate-200/60 opacity-85'
                            : 'hover:bg-white border-slate-200 hover:border-[#0E8388]/60 hover:shadow-md'
                        }`}
                      >
                        <div className="flex items-center gap-3.5 flex-1 min-w-0">
                          <div className="w-20 h-20 rounded-xl bg-white p-2 border border-slate-200 shrink-0 flex items-center justify-center relative overflow-hidden">
                            <img
                              src={prod.image}
                              alt={prod.name}
                              className={`w-full h-full object-contain ${isProdOutOfStock ? 'opacity-40 grayscale' : ''}`}
                            />
                            {isProdOutOfStock && (
                              <div className="absolute inset-0 bg-slate-900/30 backdrop-blur-[1px] flex items-center justify-center">
                                <span className="text-[8px] font-black uppercase text-white bg-rose-600/90 px-1 py-0.5 rounded">
                                  Sin Stock
                                </span>
                              </div>
                            )}
                          </div>

                          <div className="space-y-1 min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-[10px] font-black text-[#0E8388] uppercase tracking-wider">
                                {prod.brand}
                              </span>
                              {flavor && (
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${flavor.bg}`}>
                                  {flavor.emoji} {flavor.label}
                                </span>
                              )}
                              {isProdOutOfStock && (
                                <span className="text-[9px] font-black uppercase text-rose-700 bg-rose-50 px-1.5 py-0.2 rounded border border-rose-200">
                                  Agotado en Bodega
                                </span>
                              )}
                            </div>
                            <h4 className="text-xs sm:text-sm font-black text-slate-900 leading-snug">
                              {prod.name}
                            </h4>
                            <div className="text-xs font-black text-[#0A3E40]">
                              {formatCLP(prod.price)} CLP <span className="text-[10px] text-slate-400 font-normal">({defaultWeight})</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex sm:flex-col items-center gap-2 shrink-0 w-full sm:w-auto">
                          <button
                            type="button"
                            disabled={isProdOutOfStock}
                            onClick={() => {
                              if (isProdOutOfStock) return;
                              onAddToCart(prod, defaultWeight, 1);
                              setOrderToastMessage(`✓ Añadido al pedido: ${prod.name} (${defaultWeight})`);
                              setTimeout(() => setOrderToastMessage(null), 4000);
                              setIsAlternativeFoodModalOpen(false);
                            }}
                            className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl font-black text-xs shadow-xs transition-all flex items-center justify-center gap-1.5 whitespace-nowrap active:scale-95 ${
                              isProdOutOfStock
                                ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                                : 'bg-gradient-to-r from-[#0E8388] to-[#10B981] hover:opacity-95 text-white cursor-pointer'
                            }`}
                          >
                            <ShoppingBag className="w-3.5 h-3.5" />
                            <span>{isProdOutOfStock ? 'Sin stock' : 'Añadir a mi pedido'}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setPets(prev => prev.map(p => p.id === activeSelectedPet.id ? { ...p, foodName: prod.name } : p));
                              setOrderToastMessage(`✓ Alimento habitual de ${activeSelectedPet.name} actualizado a ${prod.name}`);
                              setTimeout(() => setOrderToastMessage(null), 4000);
                              setIsAlternativeFoodModalOpen(false);
                            }}
                            className="flex-1 sm:flex-initial px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 font-extrabold text-[11px] border border-slate-200 transition-all cursor-pointer whitespace-nowrap active:scale-95"
                          >
                            <span>Elegir como habitual</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs text-slate-500 font-medium">¿Buscas algo diferente?</span>
                  <button
                    type="button"
                    onClick={() => {
                      setIsAlternativeFoodModalOpen(false);
                      setActiveTab('tienda');
                      setStoreCategoryFilter('Alimento Seco');
                    }}
                    className="text-xs font-black text-[#0E8388] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>Ver todos los alimentos en la Tienda Online</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* MODAL PANTALLA COMPLETA: CONSULTA VETERINARIA (AGENDAR & GOOGLE CALENDAR + CUADERNO DE SALUD) */}
      <VeterinaryConsultationModal
        isOpen={isVetConsultationModalOpen}
        onClose={handleCloseVetModal}
        pet={selectedHealthPet || activeSelectedPet || pets[0] || null}
        existingConsultations={((selectedHealthPet || activeSelectedPet || pets[0]) ? (healthLogs[selectedHealthPet?.id || activeSelectedPet?.id || pets[0]?.id] || []) : []).filter(l => l.category === 'consulta')}
        onSaveAppointment={handleSaveVetAppointment}
        onSaveHealthLog={handleSaveVetHealthLog}
      />

      {/* MODAL MINIMALISTA: REGISTRAR ANTIPARASITARIO (INTERNO Y EXTERNO) */}
      <AntiparasiticModal
        isOpen={isAntiparasiticModalOpen}
        onClose={returnToMascotasDashboard}
        pet={selectedHealthPet || activeSelectedPet || pets[0] || null}
        orders={ordersList}
        storeProducts={catalogProducts}
        onSaveAntiparasitic={handleSaveAntiparasiticLog}
      />

      {/* MODAL: MI PERFIL Y DATOS PERSONALES DEL CLIENTE */}
      <CustomerProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        profileData={profileData}
        onSaveProfile={handleSaveProfile}
      />

      {/* MODAL RÁPIDO: REGISTRAR CONSULTA VETERINARIA / INDICACIONES O ANTIPARASITARIO */}
      {isQuickLogModalOpen && selectedHealthPet && (
        <div 
          onClick={(e) => {
            if (e.target === e.currentTarget) returnToMascotasDashboard();
          }}
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-200"
        >
          <div className="bg-white rounded-3xl w-full max-w-lg max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-200">
            {/* Header */}
            <div className={`p-5 sm:p-6 text-white flex items-center justify-between gap-3 shrink-0 ${
              quickLogCategory === 'consulta'
                ? 'bg-gradient-to-r from-[#0A3E40] via-[#0E8388] to-teal-600'
                : 'bg-gradient-to-r from-amber-600 via-amber-500 to-orange-500'
            }`}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-xl shrink-0">
                  {quickLogCategory === 'consulta' ? '🩺' : '💊'}
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black leading-tight">
                    {quickLogCategory === 'consulta'
                      ? `Registrar Consulta de ${selectedHealthPet.name}`
                      : `Registrar Antiparasitario para ${selectedHealthPet.name}`}
                  </h3>
                  <p className="text-[11px] text-white/90 font-medium">
                    {quickLogCategory === 'consulta'
                      ? 'Guarda la fecha y las indicaciones del veterinario para no olvidarlas.'
                      : 'Protege a tu mascota con antiparasitario interno o externo.'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={returnToMascotasDashboard}
                className="w-9 h-9 rounded-full bg-white/15 hover:bg-white/25 text-white flex items-center justify-center transition-all cursor-pointer shrink-0 border border-white/20 active:scale-95"
                title="Cerrar y volver a Mis Mascotas"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Formulario */}
            <form onSubmit={handleQuickLogSubmit} className="p-5 sm:p-6 space-y-4 overflow-y-auto flex-1 text-xs">
              
              {/* Si es antiparasitario: Selector entre Interno y Externo */}
              {quickLogCategory === 'antiparasitario' && (
                <div className="space-y-1.5">
                  <label className="font-black text-slate-700 uppercase tracking-wider text-[11px] block">
                    Tipo de Antiparasitario:
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setQuickAntiparasiticType('interno')}
                      className={`p-3 rounded-2xl border text-center font-black transition-all cursor-pointer ${
                        quickAntiparasiticType === 'interno'
                          ? 'bg-amber-50 border-amber-400 text-amber-900 shadow-xs ring-2 ring-amber-200'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <span className="text-base block mb-0.5">💊</span>
                      <span className="text-xs">Antiparasitario Interno</span>
                      <span className="text-[10px] text-slate-400 block font-normal">(Pastillas / Suspensión)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setQuickAntiparasiticType('externo')}
                      className={`p-3 rounded-2xl border text-center font-black transition-all cursor-pointer ${
                        quickAntiparasiticType === 'externo'
                          ? 'bg-amber-50 border-amber-400 text-amber-900 shadow-xs ring-2 ring-amber-200'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <span className="text-base block mb-0.5">🧴</span>
                      <span className="text-xs">Antiparasitario Externo</span>
                      <span className="text-[10px] text-slate-400 block font-normal">(Pipeta / Pulgas & Garrapatas)</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Campos para Consulta Veterinaria */}
              {quickLogCategory === 'consulta' ? (
                <>
                  <div className="space-y-1">
                    <label className="font-black text-slate-700 uppercase tracking-wider text-[11px]">
                      Motivo de Consulta o Chequeo
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ej. Chequeo preventivo de rutina, Control anual, Vacunación"
                      value={newLogTitle}
                      onChange={(e) => setNewLogTitle(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:outline-hidden focus:border-[#0E8388] text-slate-800 text-xs"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <CustomDatePicker
                      label="Fecha de la Consulta"
                      icon={Clock}
                      value={newLogDate}
                      onChange={(date) => setNewLogDate(date)}
                    />

                    <div className="space-y-1">
                      <label className="font-black text-slate-700 uppercase tracking-wider text-[11px]">
                        Veterinario / Clínica
                      </label>
                      <input
                        type="text"
                        placeholder="Ej. Dr. Morales (Clínica Puerto Varas)"
                        value={newLogVetName}
                        onChange={(e) => setNewLogVetName(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:outline-hidden focus:border-[#0E8388] text-slate-800 text-xs"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="font-black text-slate-700 uppercase tracking-wider text-[11px] flex items-center justify-between">
                      <span>📝 Lo que dijo el veterinario (Indicaciones & Receta)</span>
                      <span className="text-[10px] text-teal-700 font-bold bg-teal-50 px-2 py-0.5 rounded-md">Para no olvidar</span>
                    </label>
                    <textarea
                      rows={3}
                      required
                      placeholder="Escribe aquí las recomendaciones del doctor: diagnóstico, medicamentos recetados, dosis, cuidados de alimentación, etc."
                      value={newLogNotes}
                      onChange={(e) => setNewLogNotes(e.target.value)}
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-hidden focus:border-[#0E8388] leading-relaxed text-xs text-slate-800"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <CustomDropdown
                      label="Frecuencia Próximo Control"
                      icon={Clock}
                      value={newLogFrequency}
                      options={[
                        { value: "1", label: "En 1 mes" },
                        { value: "3", label: "En 3 meses" },
                        { value: "6", label: "En 6 meses (Semestral)" },
                        { value: "12", label: "En 1 año (Anual)" },
                      ]}
                      onChange={(freq) => {
                        setNewLogFrequency(freq);
                        setNewLogNextDue(calculateNextDueDate(freq, newLogDate));
                      }}
                    />

                    <div className="p-3 rounded-xl bg-teal-50 border border-teal-200 flex flex-col justify-center">
                      <span className="text-[10px] font-black uppercase tracking-wider text-[#0E8388] block">Próxima Cita Calculada:</span>
                      <span className="text-xs font-black text-[#0A3E40] pt-0.5">📅 {newLogNextDue}</span>
                    </div>
                  </div>
                </>
              ) : (
                /* Campos para Antiparasitario */
                <>
                  <div className="space-y-1.5">
                    {isCustomAntiparasitic ? (
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <label className="font-black text-slate-700 uppercase tracking-wider text-[11px]">
                            Nombre del Antiparasitario
                          </label>
                          <button
                            type="button"
                            onClick={() => setIsCustomAntiparasitic(false)}
                            className="text-[#0E8388] text-[11px] font-bold hover:underline cursor-pointer"
                          >
                            ← Seleccionar de la lista
                          </button>
                        </div>
                        <input
                          type="text"
                          required
                          placeholder="Ej. Drontal Plus, NexGard, Bravecto, Endogard"
                          value={customAntiparasiticName}
                          onChange={(e) => setCustomAntiparasiticName(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:outline-hidden focus:border-amber-400 text-slate-800 text-xs"
                        />
                      </div>
                    ) : (
                      <CustomDropdown
                        label="Antiparasitario Sugerido de la Tienda"
                        icon={Store}
                        value={selectedAntiparasiticId}
                        options={PRODUCTS.filter(p => p.category === 'Antiparasitarios' && (
                          selectedHealthPet.type === 'gato' ? p.petType === 'gatos' : p.petType === 'perros'
                        )).map(prod => ({
                          value: prod.id,
                          label: `${prod.name} — ${formatCLP(prod.price)}`,
                        }))}
                        onChange={(prodId) => {
                          setSelectedAntiparasiticId(prodId);
                          const prod = PRODUCTS.find(p => p.id === prodId);
                          if (prod) {
                            setNewLogTitle(prod.name);
                            const freq = `${prod.frequencyMonths || 1}`;
                            setNewLogFrequency(freq);
                            setNewLogNextDue(calculateNextDueDate(freq, newLogDate));
                          }
                        }}
                        rightAction={
                          <button
                            type="button"
                            onClick={() => setIsCustomAntiparasitic(true)}
                            className="text-amber-700 text-[11px] font-bold hover:underline cursor-pointer"
                          >
                            ➕ Otro no listado
                          </button>
                        }
                      />
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <CustomDatePicker
                      label="Fecha de Administración"
                      icon={Clock}
                      value={newLogDate}
                      onChange={(date) => {
                        setNewLogDate(date);
                        setNewLogNextDue(calculateNextDueDate(newLogFrequency, date));
                      }}
                    />

                    <CustomDropdown
                      label="Duración de Protección"
                      icon={Clock}
                      value={newLogFrequency}
                      options={[
                        { value: "1", label: "Mensual (1 mes / 30 días)" },
                        { value: "3", label: "Trimestral (3 meses / 12 semanas)" },
                        { value: "6", label: "Semestral (6 meses)" },
                      ]}
                      onChange={(freq) => {
                        setNewLogFrequency(freq);
                        setNewLogNextDue(calculateNextDueDate(freq, newLogDate));
                      }}
                    />
                  </div>

                  <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-300/70 flex items-center justify-between">
                    <span className="text-[11px] font-black text-amber-900 uppercase flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-amber-600" />
                      <span>Próxima Dosis:</span>
                    </span>
                    <span className="text-xs font-black text-amber-950 bg-white px-3 py-1 rounded-full border border-amber-300 shadow-2xs">
                      📅 {newLogNextDue}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <label className="font-black text-slate-700 uppercase tracking-wider text-[11px]">
                      Notas u Observaciones (Opcional)
                    </label>
                    <input
                      type="text"
                      placeholder="Ej. Administrado con comida, peso al aplicar 8kg"
                      value={newLogNotes}
                      onChange={(e) => setNewLogNotes(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-hidden focus:border-amber-400 text-slate-800 text-xs"
                    />
                  </div>
                </>
              )}

              <button
                type="submit"
                className={`w-full py-3.5 rounded-2xl text-white font-black text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-98 ${
                  quickLogCategory === 'consulta'
                    ? 'bg-gradient-to-r from-[#0A3E40] to-[#0E8388] hover:opacity-95'
                    : 'bg-gradient-to-r from-amber-600 to-orange-500 hover:opacity-95'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>
                  Guardar en Ficha de {selectedHealthPet.name}
                </span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: AGREGAR PRODUCTO A LA DESPENSA HABITUAL */}
      {isAddHabitualProductModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="p-4 sm:p-5 bg-gradient-to-r from-[#0A3E40] to-[#0E8388] text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-xl shadow-inner border border-white/20">
                  🥫
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-black text-white tracking-tight">
                    Agregar a tu Despensa Habitual
                  </h3>
                  <p className="text-[11px] text-teal-100/90 font-medium">
                    Elige los sacos de alimento o snacks que compras mes a mes
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAddHabitualProductModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
                title="Cerrar"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Filtros y Buscador */}
            <div className="p-3 sm:p-4 border-b border-slate-100 bg-slate-50/70 space-y-3 shrink-0">
              {/* Buscador */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Buscar por nombre o marca (ej. Acana, Bravery, Hills)..."
                  value={habitualSearchQuery}
                  onChange={(e) => setHabitualSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-9 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-[#0E8388] shadow-2xs"
                  autoFocus
                />
                {habitualSearchQuery && (
                  <button
                    type="button"
                    onClick={() => setHabitualSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Chips de Categoría */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-[11px] font-bold">
                {[
                  { id: 'todos', label: 'Todos los productos' },
                  { id: 'perro', label: '🐶 Perros' },
                  { id: 'gato', label: '🐱 Gatos' },
                  { id: 'alimento', label: '🥣 Alimento' },
                  { id: 'snacks', label: '🥩 Snacks' },
                ].map((chip) => (
                  <button
                    key={chip.id}
                    type="button"
                    onClick={() => setHabitualCategoryFilter(chip.id)}
                    className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-all cursor-pointer ${
                      habitualCategoryFilter === chip.id
                        ? 'bg-[#0E8388] text-white shadow-2xs font-black'
                        : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200'
                    }`}
                  >
                    {chip.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Listado de Productos */}
            <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-2.5">
              {filteredCatalogForHabitual.length === 0 ? (
                <div className="py-12 text-center space-y-2">
                  <div className="text-3xl">🔍</div>
                  <p className="text-xs font-black text-slate-700">
                    No encontramos productos con ese filtro o búsqueda
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Intenta buscar con otra palabra clave o quita los filtros.
                  </p>
                </div>
              ) : (
                filteredCatalogForHabitual.slice(0, 40).map((prod) => (
                  <HabitualProductCard
                    key={prod.id || prod.name}
                    product={prod}
                    onAdd={(weight, qty) => handleAddProductToHabitual(prod, weight, qty)}
                    formatCLP={formatCLP}
                  />
                ))
              )}
            </div>

            {/* Footer */}
            <div className="p-3 sm:p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between gap-3 shrink-0">
              <p className="text-[11px] text-slate-500 font-medium hidden sm:block">
                💡 Los productos agregados se guardarán para reposición cada {replenishmentCycle.frequencyDays} días.
              </p>
              <button
                type="button"
                onClick={() => setIsAddHabitualProductModalOpen(false)}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold transition-all cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
