import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { PRODUCTS as FALLBACK_PRODUCTS } from '../data/mockData';
import { fetchProductsFromSupabase, updateProductInSupabase } from '../services/productsService';
import { groupProductsForStore, getFlavorSwatchStyle } from '../utils/productVariants';
import ProductCard from '../components/ProductCard';
import AppleNutritionSpecs from '../components/AppleNutritionSpecs';
import SEOHead from '../components/SEOHead';
import { getProductSchema, getBreadcrumbSchema } from '../utils/schemaGenerators';
import {
  ArrowLeft,
  Star,
  ShoppingBag,
  CheckCircle2,
  ShieldCheck,
  Truck,
  Sparkles,
  Heart,
  Fish,
  Leaf,
  Dumbbell,
  Scale,
  Award,
  ChevronRight,
  ChevronLeft,
  MessageSquare,
  Utensils,
  Share2,
  Stethoscope,
  Footprints,
  Activity,
  Dog,
  Cat,
  Beef,
  Drumstick,
  Wheat,
  Upload,
  Plus,
  Trash2,
  Image as ImageIcon,
  X,
  Loader2,
} from 'lucide-react';

// Custom Vector Paw Print Icon for gallery indicators
function PawPrintIcon({ active = false, activeColor = "#10B981" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={`w-5 h-5 transition-all duration-300 cursor-pointer ${
        active ? 'scale-125 drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'opacity-40 hover:opacity-100 hover:scale-110'
      }`}
      fill={active ? activeColor : '#0F383A'}
    >
      {/* Main Bottom Pad */}
      <ellipse cx="12" cy="16" rx="4.5" ry="3.5" />
      {/* 4 Top Toes */}
      <circle cx="6.5" cy="11.5" r="2" />
      <circle cx="10" cy="8.5" r="2" />
      <circle cx="14" cy="8.5" r="2" />
      <circle cx="17.5" cy="11.5" r="2" />
    </svg>
  );
}

// Mini Circular Ring Chart Component for numeric percentage values (% Proteína)
function MiniCircleMetric({ value, label, color = '#0E8388', trackColor = 'text-slate-200/70' }) {
  const numeric = typeof value === 'number' ? value : parseInt(value, 10) || 0;
  const radius = 14;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (Math.min(100, Math.max(0, numeric)) / 100) * circumference;

  return (
    <div className="relative group flex flex-col items-center gap-1 text-center cursor-help">
      <div className="relative w-11 h-11 flex items-center justify-center transition-transform group-hover:scale-110">
        <svg className="w-11 h-11 -rotate-90 transform" viewBox="0 0 40 40">
          <circle
            cx="20"
            cy="20"
            r={radius}
            className={trackColor}
            strokeWidth="3.5"
            stroke="currentColor"
            fill="transparent"
          />
          <circle
            cx="20"
            cy="20"
            r={radius}
            strokeWidth="3.5"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            stroke={color}
            fill="transparent"
            className="transition-all duration-700"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center text-center">
          <span className="text-[10px] font-black text-slate-900 leading-none">{value}</span>
        </div>
      </div>
      <span className="text-[9px] font-black text-slate-600 uppercase tracking-tight leading-none">
        {label}
      </span>

      {/* Explanatory Tooltip Popover on Hover */}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2.5 w-60 p-3.5 bg-[#0F383A] text-white rounded-2xl shadow-2xl shadow-[#0E8388]/20 border border-[#0E8388]/40 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all duration-300 z-50 animate-in fade-in slide-in-from-bottom-2 text-left">
        <div className="flex items-center gap-1.5 text-xs font-black text-[#4DE1D0] mb-1">
          <Dumbbell className="w-3.5 h-3.5 shrink-0 text-[#10B981]" />
          <span>Porcentaje Proteína ({value})</span>
        </div>
        <p className="text-[11px] text-slate-200 font-medium leading-relaxed">
          Nivel de concentración proteica por porción. Esencial para la nutrición, masa muscular y vitalidad diaria de tu mascota.
        </p>
        <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-[#0F383A]" />
      </div>
    </div>
  );
}

// Protein Source Vector Icon Badge (Modern Lucide UI Icons, rounded-2xl badge card)
function ProteinIconBadge({ icon: IconComponent, label, iconColor = 'text-[#0E8388]', bgColor = 'bg-white border-slate-200' }) {
  let tooltipTitle = `Fuente Proteica: ${label}`;
  let tooltipText = `Proteína magra seleccionada para aportar aminoácidos de alto valor biológico y excelente palatabilidad.`;

  if (label === 'Cordero') {
    tooltipText = 'Cordero de pradera monoproteico e hipoalergénico. Ideal para mascotas con piel o digestión sensible.';
  } else if (label === 'Salmón') {
    tooltipText = 'Salmón silvestre rico en Omega-3 (EPA/DHA) para la salud cardiovascular, piel sana y pelaje brillante.';
  } else if (label === 'Pollo') {
    tooltipText = 'Pollo 100% natural deshidratado. Altamente digestible y magro para mantener masa muscular fuerte.';
  } else if (label === 'Res') {
    tooltipText = 'Carne de res seleccionada rica en hierro y aminoácidos esenciales para energía y tono muscular.';
  } else if (label === 'Multiproteico') {
    tooltipText = 'Combinación balanceada de múltiples fuentes de carne para ofrecer un perfil proteico completo y variado.';
  }

  return (
    <div className="relative group flex flex-col items-center gap-1 text-center justify-center cursor-help">
      <div className={`w-11 h-11 rounded-2xl ${bgColor} shadow-sm border flex items-center justify-center transition-transform group-hover:scale-110`}>
        <IconComponent className={`w-5 h-5 ${iconColor}`} />
      </div>
      <span className="text-[9px] font-black text-slate-800 uppercase tracking-tight leading-none">
        {label}
      </span>

      {/* Explanatory Tooltip Popover on Hover */}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2.5 w-60 p-3.5 bg-[#0F383A] text-white rounded-2xl shadow-2xl shadow-[#0E8388]/20 border border-[#0E8388]/40 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all duration-300 z-50 animate-in fade-in slide-in-from-bottom-2 text-left">
        <div className="flex items-center gap-1.5 text-xs font-black text-[#4DE1D0] mb-1">
          <IconComponent className="w-3.5 h-3.5 shrink-0 text-[#10B981]" />
          <span>{tooltipTitle}</span>
        </div>
        <p className="text-[11px] text-slate-200 font-medium leading-relaxed">
          {tooltipText}
        </p>
        <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-[#0F383A]" />
      </div>
    </div>
  );
}

// Grain Status Vector Icon Badge
function GrainIconBadge({ isGrainFree, grainLevelProp, tagline = '' }) {
  let status = 'free';
  const tagLower = tagline.toLowerCase();

  if (grainLevelProp) {
    status = grainLevelProp;
  } else if (isGrainFree || tagLower.includes('grain free') || tagLower.includes('libre de grano')) {
    status = 'free';
  } else if (tagLower.includes('bajo en grano') || tagLower.includes('low grain') || tagLower.includes('arroz integral')) {
    status = 'low';
  } else {
    status = 'with';
  }

  let labelText = 'LIBRE GRANO';
  let bgColor = 'bg-slate-100/90 border-slate-200/90 text-slate-500';
  let wheatColor = 'text-slate-400';
  let tooltipTitle = 'Fórmula 100% Libre de Granos (Grain Free)';
  let tooltipText = 'Formulado sin trigo, maíz ni soya. Previene alergias alimentarias, digestiones pesadas e inflamaciones.';

  if (status === 'low') {
    labelText = 'BAJO GRANO';
    bgColor = 'bg-amber-50/90 border-amber-200/90 text-amber-900';
    wheatColor = 'text-amber-500';
    tooltipTitle = 'Fórmula Baja en Granos (Low Grain)';
    tooltipText = 'Utiliza únicamente cereales nobles de bajo índice glucémico (como arroz integral) para energía sostenida.';
  } else if (status === 'with' || status === 'full') {
    labelText = 'CON GRANO';
    bgColor = 'bg-amber-100 border-amber-300 text-amber-900';
    wheatColor = 'text-amber-700 scale-105';
    tooltipTitle = 'Fórmula con Cereales Tradicionales';
    tooltipText = 'Incluye cereales seleccionados para aportar fibra digestible e hidratos de carbono energéticos.';
  }

  return (
    <div className="relative group flex flex-col items-center gap-1 text-center justify-center cursor-help">
      <div className={`w-11 h-11 rounded-2xl ${bgColor} shadow-xs border flex items-center justify-center transition-transform group-hover:scale-110`}>
        <Wheat className={`w-5 h-5 ${wheatColor}`} />
      </div>
      <span className="text-[9px] font-black text-slate-600 uppercase tracking-tight leading-none">
        {labelText}
      </span>

      {/* Explanatory Tooltip Popover on Hover */}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2.5 w-60 p-3.5 bg-[#0F383A] text-white rounded-2xl shadow-2xl shadow-[#0E8388]/20 border border-[#0E8388]/40 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all duration-300 z-50 animate-in fade-in slide-in-from-bottom-2 text-left">
        <div className="flex items-center gap-1.5 text-xs font-black text-[#4DE1D0] mb-1">
          <Wheat className="w-3.5 h-3.5 shrink-0 text-[#10B981]" />
          <span>{tooltipTitle}</span>
        </div>
        <p className="text-[11px] text-slate-200 font-medium leading-relaxed">
          {tooltipText}
        </p>
        <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-[#0F383A]" />
      </div>
    </div>
  );
}

// Elemento 4: Vet Status Metric Badge con Tooltip Explicativo al hacer Hover
function VetStatusMetric({ isVeterinary = false }) {
  let labelText = 'NO VET';
  let bgColor = 'bg-slate-100/90 border-slate-200/90 text-slate-500';
  let iconColor = 'text-slate-400';
  let tooltipTitle = 'Alimento Mantenimiento Diario';
  let tooltipText = 'Formulado para la nutrición diaria de mascotas sanas. No requiere receta médica ni tratamiento para patologías clínicas.';

  if (isVeterinary) {
    labelText = 'RECETA VET';
    bgColor = 'bg-purple-100 border-purple-300 text-purple-900';
    iconColor = 'text-purple-600 scale-105';
    tooltipTitle = 'Fórmula Médica Veterinaria';
    tooltipText = 'Diseñado específicamente para el tratamiento de afecciones clínicas (renales, dermatológicas, etc.). Se recomienda supervisión médica.';
  }

  return (
    <div className="relative group flex flex-col items-center gap-1 text-center justify-center cursor-help">
      
      {/* Badge Icon Container */}
      <div className={`w-11 h-11 rounded-2xl ${bgColor} shadow-xs border flex items-center justify-center transition-transform group-hover:scale-110`}>
        <Stethoscope className={`w-5 h-5 ${iconColor}`} />
      </div>
      <span className="text-[9px] font-black text-slate-600 uppercase tracking-tight leading-none">
        {labelText}
      </span>

      {/* Explanatory Tooltip Popover on Hover */}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2.5 w-60 p-3.5 bg-[#0F383A] text-white rounded-2xl shadow-2xl shadow-[#0E8388]/20 border border-[#0E8388]/40 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all duration-300 z-50 animate-in fade-in slide-in-from-bottom-2 text-left">
        <div className="flex items-center gap-1.5 text-xs font-black text-[#4DE1D0] mb-1">
          <Stethoscope className="w-3.5 h-3.5 shrink-0 text-[#10B981]" />
          <span>{tooltipTitle}</span>
        </div>
        <p className="text-[11px] text-slate-200 font-medium leading-relaxed">
          {tooltipText}
        </p>
        
        {/* Tooltip Arrow */}
        <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-[#0F383A]" />
      </div>

    </div>
  );
}

// Helper to determine main protein vector icon badge
function getProteinBadge(mainProteinStr, productNameStr) {
  const text = ((mainProteinStr || '') + ' ' + (productNameStr || '')).toLowerCase();

  if (text.includes('vacuno') || text.includes('res') || text.includes('carne') || text.includes('beef') || text.includes('buey')) {
    return {
      icon: Beef,
      label: 'Vacuno',
      iconColor: 'text-red-600',
      bgColor: 'bg-red-50 border-red-200/90 text-red-900',
    };
  }

  if (text.includes('conejo') || text.includes('rabbit')) {
    return {
      icon: Drumstick,
      label: 'Conejo',
      iconColor: 'text-amber-600',
      bgColor: 'bg-amber-50 border-amber-200/90 text-amber-900',
    };
  }

  if (text.includes('pato') || text.includes('duck')) {
    return {
      icon: Drumstick,
      label: 'Pato',
      iconColor: 'text-emerald-700',
      bgColor: 'bg-emerald-50 border-emerald-200 text-emerald-900',
    };
  }

  if (text.includes('multi') || text.includes('combo') || (text.includes('pollo') && text.includes('res'))) {
    return {
      icon: Sparkles,
      label: 'Multiproteico',
      iconColor: 'text-[#0E8388]',
      bgColor: 'bg-emerald-50 border-emerald-200 text-emerald-800',
    };
  }

  if (text.includes('cordero') || text.includes('lamb')) {
    return {
      icon: Beef,
      label: 'Cordero',
      iconColor: 'text-amber-700',
      bgColor: 'bg-amber-50 border-amber-200/90 text-amber-900',
    };
  }

  if (text.includes('salmón') || text.includes('salmon')) {
    return {
      icon: Fish,
      label: 'Salmón',
      iconColor: 'text-teal-600',
      bgColor: 'bg-teal-50 border-teal-200/90 text-teal-900',
    };
  }

  if (text.includes('pollo') || text.includes('chicken')) {
    return {
      icon: Drumstick,
      label: 'Pollo',
      iconColor: 'text-amber-600',
      bgColor: 'bg-orange-50 border-orange-200/90 text-orange-900',
    };
  }

  if (text.includes('trucha') || text.includes('tuna') || text.includes('atún') || text.includes('pescado')) {
    return {
      icon: Fish,
      label: 'Pescado',
      iconColor: 'text-[#0E8388]',
      bgColor: 'bg-[#E6F4F1] border-[#0E8388]/30 text-[#0A3E40]',
    };
  }

  return {
    icon: Beef,
    label: 'Proteína',
    iconColor: 'text-[#0E8388]',
    bgColor: 'bg-slate-50 border-slate-200 text-slate-800',
  };
}

export default function ProductDetailView({ onAddToCart, onSelectProduct }) {
  const { id } = useParams();
  const navigate = useNavigate();

  const [allProducts, setAllProducts] = useState(FALLBACK_PRODUCTS);

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      const data = await fetchProductsFromSupabase();
      if (isMounted && data && data.length > 0) {
        setAllProducts(data);
      }
    };
    load();
    window.addEventListener('patitas_products_updated', load);
    return () => {
      isMounted = false;
      window.removeEventListener('patitas_products_updated', load);
    };
  }, []);

  // Find product by URL param or default to first product, resolving grouped variants
  const product = useMemo(() => {
    if (!allProducts || allProducts.length === 0) return FALLBACK_PRODUCTS[0];
    const grouped = groupProductsForStore(allProducts);
    let found = grouped.find((p) => p.id === id);
    if (found) return found;
    found = grouped.find((p) => p.variants && p.variants.some((v) => v.id === id || v.sku === id));
    if (found) return found;
    return allProducts.find((p) => p.id === id) || grouped[0] || FALLBACK_PRODUCTS[0];
  }, [allProducts, id]);

  const isDog = product?.petType === 'perros';

  // Remove redundant brand name from title if product name starts with the brand
  const displayProductName = useMemo(() => {
    if (!product?.name) return '';
    const rawName = String(product.name).trim();
    const brand = String(product.brand || '').trim();
    if (!brand) return rawName;

    // Check if name starts with brand (case-insensitive)
    const escapedBrand = brand.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`^${escapedBrand}\\s*[-•:]?\\s*`, 'i');
    if (regex.test(rawName)) {
      const stripped = rawName.replace(regex, '').trim();
      return stripped || rawName;
    }
    return rawName;
  }, [product?.name, product?.brand]);

  const [selectedWeight, setSelectedWeight] = useState(() => {
    if (!product) return 'Estándar';
    const matchV = product.variants?.find((v) => v.id === id || v.sku === id);
    if (matchV) return matchV.format || matchV.weight;
    return product.weights ? product.weights[0] : 'Estándar';
  });
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('ingredientes');
  const [addedSuccess, setAddedSuccess] = useState(false);
  const [petWeight, setPetWeight] = useState(isDog ? 8 : 4);
  const [wizardStep, setWizardStep] = useState(1); // 1, 2, 3, or 'result'
  const [selectedLifeStage, setSelectedLifeStage] = useState(null);
  const [selectedBreedSize, setSelectedBreedSize] = useState(null);

  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Derivar la lista de imágenes del producto
  const productImages = useMemo(() => {
    if (!product) return [isDog ? '/images/hero_dog.png' : '/images/cat_food_tuna.png'];
    const list = [];
    if (product.image && typeof product.image === 'string' && product.image.trim()) {
      list.push(product.image.trim());
    }
    if (Array.isArray(product.images)) {
      product.images.forEach((img) => {
        if (img && typeof img === 'string' && img.trim() && !list.includes(img.trim())) {
          list.push(img.trim());
        }
      });
    }
    if (Array.isArray(product.variants)) {
      product.variants.forEach((v) => {
        if (v.image && typeof v.image === 'string' && v.image.trim() && !list.includes(v.image.trim())) {
          list.push(v.image.trim());
        }
      });
    }
    if (list.length === 0) {
      list.push(isDog ? '/images/hero_dog.png' : '/images/cat_food_tuna.png');
    }
    return list;
  }, [product, isDog]);

  // Reset al cambiar de producto
  useEffect(() => {
    setActiveImageIndex(0);
  }, [product?.id]);

  const mainCtaRef = useRef(null);
  const [showStickyBar, setShowStickyBar] = useState(false);

  // IntersectionObserver to show mobile sticky bottom buy bar when main CTA scrolls out of view
  useEffect(() => {
    if (!mainCtaRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setShowStickyBar(!entry.isIntersecting);
      },
      { threshold: 0.1 }
    );
    observer.observe(mainCtaRef.current);
    return () => observer.disconnect();
  }, [id, product]);

  // Reset wizard steps and active image when product changes
  useEffect(() => {
    setActiveImageIndex(0);
    setWizardStep(1);
    setSelectedLifeStage(null);
    setSelectedBreedSize(null);
  }, [id, product]);

  // Scroll to top on product change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (product?.weights && product.weights.length > 0) {
      const matchV = product.variants?.find((v) => v.id === id || v.sku === id);
      if (matchV) {
        setSelectedWeight(matchV.format || matchV.weight);
      } else {
        setSelectedWeight(product.weights[0]);
      }
    }
  }, [id, product]);

  if (!product) {
    return (
      <div className="pt-36 pb-24 max-w-4xl mx-auto px-6 text-center space-y-4">
        <h2 className="text-2xl font-black text-slate-800">Producto no disponible</h2>
        <p className="text-slate-500 text-sm">El catálogo se encuentra en actualización o el producto consultado no existe.</p>
        <Link to="/perros" className="inline-block px-6 py-2.5 rounded-full bg-[#0E8388] text-white text-xs font-bold">
          Explorar Catálogo
        </Link>
      </div>
    );
  }

  const getFeedingGuide = () => {
    if (!isDog) {
      if (selectedLifeStage === 'cachorro') {
        return [
          { id: 'cat-k1', min: 0, max: 1.5, label: '0.5 - 1.5 kg (Gatito 2-6 meses)', maint: '35 - 55 g / día' },
          { id: 'cat-k2', min: 1.51, max: 3, label: '1.5 - 3 kg (Gatito Joven 6-12 meses)', maint: '55 - 75 g / día' },
        ];
      }
      return [
        { id: 'cat-a1', min: 0, max: 3, label: '1 - 3 kg (Gato Pequeño)', maint: '30 - 50 g / día' },
        { id: 'cat-a2', min: 3.01, max: 5, label: '3 - 5 kg (Gato Promedio)', maint: '50 - 70 g / día' },
        { id: 'cat-a3', min: 5.01, max: 999, label: '5 kg+ (Gato Grande / Robusto)', maint: '70 - 95 g / día' },
      ];
    }

    // DOG TABLES
    if (selectedLifeStage === 'cachorro') {
      return [
        { id: 'pup-1', min: 0, max: 5, label: '1 - 5 kg (Cachorro Pequeño)', maint: '60 - 120 g / día' },
        { id: 'pup-2', min: 5.01, max: 15, label: '5 - 15 kg (Cachorro Mediano)', maint: '120 - 280 g / día' },
        { id: 'pup-3', min: 15.01, max: 30, label: '15 - 30 kg (Cachorro Grande)', maint: '280 - 450 g / día' },
        { id: 'pup-4', min: 30.01, max: 999, label: '30 kg+ (Cachorro Gigante)', maint: '450 - 650 g / día' },
      ];
    }

    if (selectedBreedSize === 'pequena') {
      return [
        { id: 'mini-1', min: 0, max: 3, label: '1 - 3 kg (Toy / Mini)', maint: '30 - 65 g / día' },
        { id: 'mini-2', min: 3.01, max: 6, label: '3 - 6 kg (Raza Pequeña)', maint: '65 - 110 g / día' },
        { id: 'mini-3', min: 6.01, max: 10, label: '6 - 10 kg (Pequeño - Mediano)', maint: '110 - 160 g / día' },
      ];
    }

    if (selectedBreedSize === 'grande') {
      return [
        { id: 'g-1', min: 15, max: 25, label: '15 - 25 kg (Raza Grande)', maint: '230 - 350 g / día' },
        { id: 'g-2', min: 25.01, max: 40, label: '25 - 40 kg (Raza Muy Grande)', maint: '350 - 500 g / día' },
        { id: 'g-3', min: 40.01, max: 999, label: '40 kg+ (Raza Gigante)', maint: '500 - 680 g / día' },
      ];
    }

    // Default Mediana / Estándar
    return [
      { id: 'm-1', min: 0, max: 5, label: '1 - 5 kg (Pequeño)', maint: '45 - 90 g / día' },
      { id: 'm-2', min: 5.01, max: 15, label: '5 - 15 kg (Mediano)', maint: '110 - 220 g / día' },
      { id: 'm-3', min: 15.01, max: 30, label: '15 - 30 kg (Grande)', maint: '220 - 380 g / día' },
      { id: 'm-4', min: 30.01, max: 999, label: '30 kg+ (Gigante)', maint: '380 - 520 g / día' },
    ];
  };

  const feedingGuide = getFeedingGuide();

  const currentWeightNum = parseFloat(petWeight) || 0;
  const activeFeedingRow = feedingGuide.find(
    (row) => currentWeightNum >= row.min && currentWeightNum <= row.max
  ) || feedingGuide[0];

  // Variantes y cálculo de precio real por formato seleccionado
  const variants = product?.variants || [];
  const activeVariant = variants.length > 0
    ? (variants.find((v) => v.format === selectedWeight || v.weight === selectedWeight) || variants[0])
    : null;

  const currentPrice = activeVariant ? activeVariant.price : (product?.price || 0);
  const currentOriginalPrice = activeVariant ? activeVariant.originalPrice : (product?.originalPrice || null);
  const currentStock = activeVariant
    ? (typeof activeVariant.stock === 'number' ? activeVariant.stock : 10)
    : (typeof product?.stock === 'number' ? product.stock : 10);
  const isOutOfStock = currentStock <= 0;

  const formatCLP = (price) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      maximumFractionDigits: 0,
    }).format(price || 0);
  };

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    const variantName = activeVariant && activeVariant.format && activeVariant.format !== product.name
      ? `${product.name} (${activeVariant.format})`
      : product.name;
    const activeVariantStock = activeVariant && typeof activeVariant.stock === 'number'
      ? activeVariant.stock
      : (typeof product.stock === 'number' ? product.stock : 10);

    const itemToAdd = {
      ...product,
      id: activeVariant?.id || product.id,
      name: variantName,
      sku: activeVariant?.sku || product.sku,
      price: currentPrice,
      unitCostNeto: activeVariant?.unitCostNeto || product.unitCostNeto,
      selectedWeight: selectedWeight,
      weight: selectedWeight,
      stock: activeVariantStock,
    };
    onAddToCart(itemToAdd, selectedWeight, quantity);
    setAddedSuccess(true);
    setTimeout(() => setAddedSuccess(false), 2500);
  };

  // Related products grouped
  const relatedProducts = allProducts && allProducts.length > 0 && product
    ? groupProductsForStore(allProducts)
        .filter((p) => p.petType === product.petType && p.id !== product.id && !p.isPaused && !p.isOutOfStock && (typeof p.stock !== 'number' || p.stock > 0))
        .slice(0, 4)
    : [];

  return (
    <div className="pt-28 pb-20 bg-[#FAF9F6] min-h-screen text-slate-900 select-none">
      <SEOHead
        title={product.name}
        description={`${product.name} de ${product.brand || 'Patitas del Sur'}. ${product.tagline || 'Alimento holístico y natural para mascotas.'} Despacho a domicilio en Puerto Varas, Llanquihue y Región de Los Lagos.`}
        canonical={`/producto/${product.id}`}
        ogImage={product.image}
        ogType="product"
        keywords={`${product.name}, ${product.brand || ''}, alimento ${isDog ? 'perros' : 'gatos'} puerto varas, comida mascotas llanquihue`}
        jsonLd={[
          getProductSchema(product),
          getBreadcrumbSchema([
            { name: 'Inicio', url: '/' },
            { name: isDog ? 'Perros' : 'Gatos', url: isDog ? '/perros' : '/gatos' },
            { name: product.name, url: `/producto/${product.id}` },
          ]),
        ]}
      />
      
      {/* 1. Breadcrumbs & Top Back Navigation */}
      <div className="max-w-7xl mx-auto px-6 mb-6">
        <div className="flex items-center justify-between">
          
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white text-slate-700 hover:text-[#0E8388] text-xs font-extrabold border border-slate-200 shadow-xs hover:shadow-md transition-all active:scale-95"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Volver al Catálogo</span>
          </button>

          {/* Breadcrumb Links */}
          <div className="hidden sm:flex items-center gap-2 text-xs font-bold text-slate-400">
            <Link to="/" className="hover:text-slate-700">Portada</Link>
            <ChevronRight className="w-3 h-3" />
            <Link to={isDog ? "/perros" : "/gatos"} className="hover:text-slate-700">
              {isDog ? "Perros 🐶" : "Gatos 🐱"}
            </Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-slate-900 font-extrabold truncate max-w-xs">{product.name}</span>
          </div>

        </div>
      </div>

      {/* 2. Main Product Showcase Hero Section (Integrated Single Card) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 mb-16">
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-200/80">
          
          {/* Top Grid: Gallery & Purchase Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          
          {/* Left Column: Minimalist Multi-Image Gallery Showcase */}
          <div className="lg:col-span-5 flex flex-col items-center w-full">
            
            {/* Image Box with Soft Pastel Glow */}
            <div className={`relative w-full aspect-square max-h-[420px] rounded-3xl p-6 flex items-center justify-center border border-slate-100 overflow-hidden shadow-inner group ${
              isDog
                ? 'bg-gradient-to-br from-[#E6F4F1] via-[#FAF9F5] to-[#CBE5E1]'
                : 'bg-gradient-to-br from-[#FFF4EB] via-[#FAF9F6] to-[#FCE6D5]'
            }`}>

              {/* Navigation Arrows */}
              {productImages.length > 1 && (
                <>
                  <button
                    onClick={() => setActiveImageIndex((prev) => (prev === 0 ? productImages.length - 1 : prev - 1))}
                    className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white/90 text-slate-800 border border-slate-200/80 shadow-md backdrop-blur-md flex items-center justify-center hover:bg-white hover:scale-110 active:scale-95 transition-all opacity-90 group-hover:opacity-100"
                    title="Foto Anterior"
                  >
                    <ChevronLeft className="w-5 h-5 text-slate-700" />
                  </button>

                  <button
                    onClick={() => setActiveImageIndex((prev) => (prev === productImages.length - 1 ? 0 : prev + 1))}
                    className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white/90 text-slate-800 border border-slate-200/80 shadow-md backdrop-blur-md flex items-center justify-center hover:bg-white hover:scale-110 active:scale-95 transition-all opacity-90 group-hover:opacity-100"
                    title="Foto Siguiente"
                  >
                    <ChevronRight className="w-5 h-5 text-slate-700" />
                  </button>
                </>
              )}
              
              {/* Photo Counter Pill (Top-Left) */}
              {productImages.length > 1 && (
                <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
                  <span className="px-3 py-1.5 rounded-full text-xs font-black bg-white/90 text-slate-800 border border-slate-200 shadow-sm backdrop-blur-md flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-[#0E8388]" />
                    <span>Foto {activeImageIndex + 1} de {productImages.length}</span>
                  </span>
                </div>
              )}

              {/* Mascot Recommendation Tag */}
              <div className="absolute top-4 right-4 z-10">
                <span className="px-3.5 py-1.5 rounded-full text-xs font-black bg-white/90 text-slate-800 border border-slate-200 shadow-sm backdrop-blur-md flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#10B981]" />
                  {isDog ? 'Kira 🐶' : 'Jack 🐱'}
                </span>
              </div>

              {/* Active Product Image */}
              <img
                src={productImages[activeImageIndex] || product.image}
                alt={`${product.name} - Vista ${activeImageIndex + 1}`}
                className="w-full h-full object-contain drop-shadow-2xl hover:scale-105 transition-all duration-500"
              />
            </div>

            {/* Recuadros Pequeños (Miniaturas de Galería) ubicados en la posición entre la foto y la nutrición */}
            {productImages.length > 1 && (
              <div className="flex items-center justify-center gap-3 w-full py-2 overflow-x-auto scrollbar-none px-1">
                {productImages.map((img, idx) => {
                  const isActive = activeImageIndex === idx;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setActiveImageIndex(idx)}
                      className={`relative w-16 h-16 sm:w-18 sm:h-18 rounded-2xl p-1.5 cursor-pointer flex-shrink-0 transition-all duration-200 border-2 bg-white ${
                        isActive
                          ? isDog
                            ? 'border-[#0E8388] shadow-md ring-2 ring-[#0E8388]/30 scale-105'
                            : 'border-[#C86D39] shadow-md ring-2 ring-[#C86D39]/30 scale-105'
                          : 'border-slate-200/90 hover:border-slate-300 opacity-75 hover:opacity-100 hover:scale-102 shadow-2xs'
                      }`}
                      title={`Ver foto ${idx + 1}`}
                      aria-label={`Ver foto ${idx + 1}`}
                    >
                      <img
                        src={img}
                        alt={`Miniatura ${idx + 1}`}
                        className="w-full h-full object-contain rounded-xl"
                      />
                      {isActive && (
                        <span
                          className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full ring-2 ring-white shadow-xs ${
                            isDog ? 'bg-[#0E8388]' : 'bg-[#C86D39]'
                          }`}
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Apple Style Nutrition Rings & Spec Visualizer (Proteína Animal % + Libre de Grano) */}
            <AppleNutritionSpecs
              product={product}
              activeFlavor={selectedWeight || ''}
              className="w-full shadow-2xs mt-2"
            />
          </div>

          {/* Right Column: Product Info, Purchase Action & Integrated Detail Tabs */}
          <div className="lg:col-span-7 space-y-5">
            
            {/* Header: Brand & Rating */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3 flex-wrap">
                  {/* Brand Name */}
                  <span className="text-xl sm:text-2xl font-black uppercase tracking-wider text-[#0E8388]">
                    {product.brand || 'Patagonia Holística'}
                  </span>

                  {product.targetStageLabel && (
                    <span className="px-3 py-1 rounded-full text-xs font-black bg-slate-100 text-slate-800 border border-slate-200 flex items-center gap-1.5 shadow-2xs">
                      <span>🐾</span>
                      <span>{product.targetStageLabel}</span>
                    </span>
                  )}
                  {Boolean(product.isVeterinary) && (
                    <span className="px-3 py-1 rounded-full text-xs font-black bg-purple-50 text-purple-700 border border-purple-200 flex items-center gap-1.5 shadow-2xs">
                      <Stethoscope className="w-3.5 h-3.5 text-purple-600" />
                      <span>Receta Veterinaria</span>
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1.5 text-amber-500 font-black text-sm">
                  <Star className="w-4 h-4 fill-amber-400" />
                  <span>{product.rating}</span>
                  <span className="text-slate-400 font-semibold">({product.reviewsCount} opiniones)</span>
                </div>
              </div>

              {/* Product Name */}
              <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-slate-900 tracking-tight leading-tight">
                {displayProductName}
              </h1>

              {/* Tagline */}
              {product.tagline && (
                <p className="text-slate-600 text-xs sm:text-sm font-medium leading-relaxed pt-0.5">
                  {product.tagline}
                </p>
              )}
            </div>

            {/* Weight / Format Selector */}
            {product.weights && product.weights.length > 0 && (
              <div className="space-y-2 pt-1 border-t border-slate-100">
                <label className="flex items-center justify-between text-xs font-bold tracking-tight text-slate-700">
                  <span className="text-slate-500 font-medium">
                    {product.hasFlavorVariants ? 'Sabor:' : 'Formato:'}{' '}
                    <strong className="text-slate-900 font-extrabold">{selectedWeight}</strong>
                  </span>
                  <span className="text-[11px] font-bold text-[#0E8388]">
                    {product.weights.length} variedades
                  </span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {product.weights.map((w) => {
                    const matchV = variants.find((v) => v.format === w || v.weight === w);
                    const isVOutOfStock = matchV && matchV.stock <= 0;
                    const isSelected = selectedWeight === w;
                    const swatch = product.hasFlavorVariants ? getFlavorSwatchStyle(w) : null;

                    return (
                      <button
                        key={w}
                        type="button"
                        onClick={() => setSelectedWeight(w)}
                        disabled={isVOutOfStock}
                        className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all border cursor-pointer active:scale-95 ${
                          isSelected
                            ? isDog
                              ? 'bg-emerald-50 text-slate-900 border-[#0E8388] shadow-2xs ring-2 ring-[#0E8388]/30'
                              : 'bg-amber-50 text-slate-900 border-[#C86D39] shadow-2xs ring-2 ring-[#C86D39]/30'
                            : isVOutOfStock
                            ? 'bg-slate-100 text-slate-300 border-slate-200 line-through cursor-not-allowed opacity-60'
                            : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        {swatch && (
                          <span
                            className="w-3.5 h-3.5 rounded-full flex items-center justify-center shrink-0 bg-white"
                            style={{
                              border: `1.5px solid ${swatch.primaryColor}`,
                              padding: isSelected ? '2px' : '0px',
                            }}
                          >
                            {isSelected && (
                              <span
                                className="w-full h-full rounded-full block animate-in zoom-in-50 duration-150"
                                style={{ backgroundColor: swatch.primaryColor }}
                              />
                            )}
                          </span>
                        )}
                        <span>{w}</span>
                        {isVOutOfStock && <span className="text-[10px] ml-1 opacity-75">(Agotado)</span>}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Pricing & Add to Cart Action Bar */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2.5">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl sm:text-3xl font-black text-slate-900">
                    {formatCLP(currentPrice)}
                  </span>
                  {currentOriginalPrice && (
                    <span className="text-xs text-slate-400 line-through font-semibold">
                      {formatCLP(currentOriginalPrice)}
                    </span>
                  )}
                </div>

                {isOutOfStock ? (
                  <span className="px-3 py-1 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 font-black text-xs">
                    Agotado en {selectedWeight}
                  </span>
                ) : currentStock === 1 ? (
                  <span className="px-3 py-1 rounded-xl bg-amber-50 text-amber-800 border border-amber-200 font-black text-xs">
                    ⚡ ¡Última unidad!
                  </span>
                ) : (
                  <span className="px-3 py-1 rounded-xl bg-[#10B981]/15 text-[#10B981] font-black text-xs">
                    ✓ {currentStock} unidades disponibles
                  </span>
                )}
              </div>

              {/* Quantity Spinner & CTA Button */}
              <div ref={mainCtaRef} className="flex items-center gap-3">
                <div className="flex items-center border border-slate-200 rounded-xl bg-white p-0.5 shrink-0">
                  <button
                    disabled={isOutOfStock}
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-9 h-9 rounded-lg bg-slate-50 text-slate-800 font-extrabold text-sm flex items-center justify-center hover:bg-slate-100 shadow-2xs disabled:opacity-50 cursor-pointer"
                  >
                    -
                  </button>
                  <span className="w-9 text-center text-sm font-black text-slate-900">{quantity}</span>
                  <button
                    disabled={isOutOfStock}
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-9 h-9 rounded-lg bg-slate-50 text-slate-800 font-extrabold text-sm flex items-center justify-center hover:bg-slate-100 shadow-2xs disabled:opacity-50 cursor-pointer"
                  >
                    +
                  </button>
                </div>

                <button
                  disabled={isOutOfStock}
                  onClick={handleAddToCart}
                  className={`flex-1 py-3 px-6 rounded-xl font-black text-xs sm:text-sm text-white transition-all shadow-md flex items-center justify-center gap-2 active:scale-95 cursor-pointer ${
                    isOutOfStock
                      ? 'bg-slate-300 text-slate-500 cursor-not-allowed shadow-none'
                      : addedSuccess
                      ? 'bg-[#10B981] shadow-[#10B981]/30'
                      : isDog
                      ? 'bg-[#0E8388] hover:bg-[#0A3E40] shadow-[#0E8388]/30'
                      : 'bg-[#C86D39] hover:bg-[#A8582C] shadow-[#C86D39]/30'
                  }`}
                >
                  {isOutOfStock ? (
                    <span>Agotado en {selectedWeight}</span>
                  ) : addedSuccess ? (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>¡AGREGADO AL CARRITO!</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-4 h-4" />
                      <span>AGREGAR AL CARRITO ({formatCLP(currentPrice * quantity)})</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Integrated Tab Navigation Bar (Elevado junto con las demás secciones) */}
            <div className="flex items-center gap-2 border-b border-slate-200 pb-2.5 overflow-x-auto scrollbar-none pt-1">
              <button
                type="button"
                onClick={() => setActiveTab('ingredientes')}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-black transition-all shrink-0 cursor-pointer ${
                  activeTab === 'ingredientes'
                    ? 'bg-[#0A3E40] text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <Utensils className="w-3.5 h-3.5 text-[#0E8388]" />
                <span>Ingredientes & Análisis</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('racion')}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-black transition-all shrink-0 cursor-pointer ${
                  activeTab === 'racion'
                    ? 'bg-[#0A3E40] text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <Scale className="w-3.5 h-3.5 text-[#C86D39]" />
                <span>Guía de Alimentación</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('beneficios')}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-black transition-all shrink-0 cursor-pointer ${
                  activeTab === 'beneficios'
                    ? 'bg-[#0A3E40] text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-[#10B981]" />
                <span>Beneficios</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('resenas')}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-black transition-all shrink-0 cursor-pointer ${
                  activeTab === 'resenas'
                    ? 'bg-[#0A3E40] text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5 text-amber-500" />
                <span>Reseñas ({product.reviewsCount})</span>
              </button>
            </div>

            {/* TAB 1: INGREDIENTES & ANÁLISIS GARANTIZADO */}
            {activeTab === 'ingredientes' && (
              <div className="space-y-4 pt-1 animate-in fade-in duration-200">
                {/* Ingredientes Principales */}
                <div className="space-y-1.5">
                  <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                    Ingredientes Principales:
                  </h3>
                  {Array.isArray(product.ingredients) && product.ingredients.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {product.ingredients.map((ing, idx) => (
                        <span key={idx} className="px-3 py-1 rounded-xl bg-slate-100 text-slate-800 text-[11px] font-bold border border-slate-200/80">
                          🌿 {ing}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[11px] text-slate-400 italic">
                      Ingredientes 100% naturales. Información nutricional detallada en proceso de actualización en ficha técnica.
                    </p>
                  )}
                </div>

                {/* Guaranteed Analysis Table */}
                {product.guaranteedAnalysis && typeof product.guaranteedAnalysis === 'object' && Object.keys(product.guaranteedAnalysis).length > 0 ? (
                  <div className="space-y-1.5">
                    <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                      Análisis Nutricional Garantizado:
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {Object.entries(product.guaranteedAnalysis).map(([key, val]) => (
                        <div key={key} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-center">
                          <div className="text-lg font-black text-[#0E8388]">{val}</div>
                          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-tight mt-0.5">{key}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                      Análisis Nutricional Garantizado:
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-center">
                        <div className="text-lg font-black text-[#0E8388]">{product.proteinValue ? `${product.proteinValue}%` : '32%'}</div>
                        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-tight mt-0.5">Proteína Cruda</div>
                      </div>
                      <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-center">
                        <div className="text-lg font-black text-[#0E8388]">16%</div>
                        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-tight mt-0.5">Grasa Cruda</div>
                      </div>
                      <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-center">
                        <div className="text-lg font-black text-[#0E8388]">4%</div>
                        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-tight mt-0.5">Fibra Cruda</div>
                      </div>
                      <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-center">
                        <div className="text-lg font-black text-[#0E8388]">10%</div>
                        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-tight mt-0.5">Humedad</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: GUÍA DE ALIMENTACIÓN DIARIA (FORMULARIO MULTI-PASOS) */}
            {activeTab === 'racion' && (
              <div className="space-y-4 pt-1 animate-in fade-in duration-200">
                {/* Header Title */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2">
                  <div>
                    <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                      Calculadora Nutricional de Ración Diaria
                    </h3>
                    <p className="text-[11px] text-slate-500 font-medium">
                      Completa los pasos para conocer la porción recomendada:
                    </p>
                  </div>
                  {product.targetStageLabel && (
                    <span className="px-2.5 py-0.5 rounded-full bg-[#0E8388]/10 text-[#0E8388] text-[10px] font-black self-start sm:self-auto">
                      {product.targetStageLabel}
                    </span>
                  )}
                </div>

                {/* Wizard Step Progress Tracker Bar */}
                <div className="flex items-center justify-between gap-2 bg-slate-50 p-2 rounded-full border border-slate-200 shadow-2xs">
                  {/* Step 1 Pill */}
                  <button
                    type="button"
                    onClick={() => setWizardStep(1)}
                    className={`flex items-center gap-1.5 text-xs font-black px-3 py-1 rounded-full transition-all cursor-pointer ${
                      wizardStep === 1
                        ? 'bg-[#0E8388] text-white shadow-2xs'
                        : wizardStep > 1 || wizardStep === 'result'
                        ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                        : 'bg-white text-slate-400 border border-slate-200'
                    }`}
                  >
                    <span>{wizardStep > 1 || wizardStep === 'result' ? '✓' : '1'}</span>
                    <span>Etapa</span>
                  </button>

                  <div className="h-0.5 flex-grow bg-slate-200 rounded-full" />

                  {/* Step 2 Pill (dogs adult/senior) */}
                  {isDog && selectedLifeStage !== 'cachorro' && (
                    <>
                      <button
                        type="button"
                        onClick={() => selectedLifeStage && setWizardStep(2)}
                        disabled={!selectedLifeStage}
                        className={`flex items-center gap-1.5 text-xs font-black px-3 py-1 rounded-full transition-all cursor-pointer ${
                          wizardStep === 2
                            ? 'bg-[#0E8388] text-white shadow-2xs'
                            : wizardStep > 2 || wizardStep === 'result'
                            ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                            : 'bg-white text-slate-400 border border-slate-200'
                        }`}
                      >
                        <span>{wizardStep > 2 || wizardStep === 'result' ? '✓' : '2'}</span>
                        <span>Raza</span>
                      </button>
                      <div className="h-0.5 flex-grow bg-slate-200 rounded-full" />
                    </>
                  )}

                  {/* Step 3 Pill */}
                  <button
                    type="button"
                    onClick={() => {
                      if (selectedLifeStage && (!isDog || selectedLifeStage === 'cachorro' || selectedBreedSize)) {
                        setWizardStep(3);
                      }
                    }}
                    disabled={!selectedLifeStage}
                    className={`flex items-center gap-1.5 text-xs font-black px-3 py-1 rounded-full transition-all cursor-pointer ${
                      wizardStep === 3
                        ? 'bg-[#0E8388] text-white shadow-2xs'
                        : wizardStep === 'result'
                        ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                        : 'bg-white text-slate-400 border border-slate-200'
                    }`}
                  >
                    <span>{wizardStep === 'result' ? '✓' : isDog && selectedLifeStage !== 'cachorro' ? '3' : '2'}</span>
                    <span>Peso</span>
                  </button>
                </div>

                {/* PASO 1: Seleccionar Etapa de Vida */}
                {wizardStep === 1 && (
                  <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-4 text-center animate-in fade-in duration-200">
                    <div className="space-y-0.5">
                      <span className="px-2.5 py-0.5 rounded-full bg-[#0E8388]/10 text-[#0E8388] text-[10px] font-black uppercase tracking-wider">
                        Paso 1 de {isDog ? '3' : '2'}
                      </span>
                      <h4 className="text-sm font-black text-slate-900 tracking-tight">
                        ¿Cuál es la Etapa de Vida de tu {isDog ? 'Perro' : 'Gato'}?
                      </h4>
                    </div>

                    <div className="flex flex-wrap justify-center gap-2.5 py-1">
                      <button
                        type="button"
                        onClick={() => setSelectedLifeStage('cachorro')}
                        className={`p-3 rounded-2xl border text-xs font-black transition-all flex flex-col items-center gap-1 min-w-[100px] cursor-pointer active:scale-95 ${
                          selectedLifeStage === 'cachorro'
                            ? 'bg-[#0E8388] text-white border-[#0E8388] shadow-md ring-2 ring-[#0E8388]/30 scale-102'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <span className="text-2xl">🐾</span>
                        <div className="text-xs font-black">{isDog ? 'Cachorro' : 'Gatito'}</div>
                        <div className="text-[9px] opacity-80 font-medium">2 - 12 meses</div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setSelectedLifeStage('adulto')}
                        className={`p-3 rounded-2xl border text-xs font-black transition-all flex flex-col items-center gap-1 min-w-[100px] cursor-pointer active:scale-95 ${
                          selectedLifeStage === 'adulto'
                            ? 'bg-[#0E8388] text-white border-[#0E8388] shadow-md ring-2 ring-[#0E8388]/30 scale-102'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <span className="text-2xl">🐕</span>
                        <div className="text-xs font-black">Adulto</div>
                        <div className="text-[9px] opacity-80 font-medium">1 - 7 años</div>
                      </button>

                      {isDog && (
                        <button
                          type="button"
                          onClick={() => setSelectedLifeStage('senior')}
                          className={`p-3 rounded-2xl border text-xs font-black transition-all flex flex-col items-center gap-1 min-w-[100px] cursor-pointer active:scale-95 ${
                            selectedLifeStage === 'senior'
                              ? 'bg-[#0E8388] text-white border-[#0E8388] shadow-md ring-2 ring-[#0E8388]/30 scale-102'
                              : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          <span className="text-2xl">🦴</span>
                          <div className="text-xs font-black">Senior</div>
                          <div className="text-[9px] opacity-80 font-medium">7+ años</div>
                        </button>
                      )}
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex justify-end">
                      <button
                        type="button"
                        disabled={!selectedLifeStage}
                        onClick={() => {
                          if (isDog && selectedLifeStage !== 'cachorro') {
                            setWizardStep(2);
                          } else {
                            setWizardStep(3);
                          }
                        }}
                        className={`px-4 py-2 rounded-full font-black text-xs transition-all flex items-center gap-1.5 cursor-pointer ${
                          selectedLifeStage
                            ? 'bg-[#0E8388] text-white hover:bg-[#0A3E40] shadow-2xs hover:scale-105'
                            : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                        }`}
                      >
                        <span>Siguiente Paso</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}

                {/* PASO 2: Seleccionar Tamaño de Raza */}
                {wizardStep === 2 && (
                  <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-4 text-center animate-in fade-in duration-200">
                    <div className="space-y-0.5">
                      <span className="px-2.5 py-0.5 rounded-full bg-[#0E8388]/10 text-[#0E8388] text-[10px] font-black uppercase tracking-wider">
                        Paso 2 de 3
                      </span>
                      <h4 className="text-sm font-black text-slate-900 tracking-tight">
                        ¿Cuál es el Tamaño de Raza de tu Perro?
                      </h4>
                    </div>

                    <div className="flex flex-wrap justify-center gap-2.5 py-1">
                      <button
                        type="button"
                        onClick={() => setSelectedBreedSize('pequena')}
                        className={`p-3 rounded-2xl border text-xs font-black transition-all flex flex-col items-center gap-1 min-w-[100px] cursor-pointer active:scale-95 ${
                          selectedBreedSize === 'pequena'
                            ? 'bg-[#0A3E40] text-white border-[#0A3E40] shadow-md ring-2 ring-[#0A3E40]/30 scale-102'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <span className="text-2xl">🐩</span>
                        <div className="text-xs font-black">Pequeña</div>
                        <div className="text-[9px] opacity-80 font-medium">&lt; 10 kg</div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setSelectedBreedSize('mediana')}
                        className={`p-3 rounded-2xl border text-xs font-black transition-all flex flex-col items-center gap-1 min-w-[100px] cursor-pointer active:scale-95 ${
                          selectedBreedSize === 'mediana'
                            ? 'bg-[#0A3E40] text-white border-[#0A3E40] shadow-md ring-2 ring-[#0A3E40]/30 scale-102'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <span className="text-2xl">🐕</span>
                        <div className="text-xs font-black">Mediana</div>
                        <div className="text-[9px] opacity-80 font-medium">10 - 25 kg</div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setSelectedBreedSize('grande')}
                        className={`p-3 rounded-2xl border text-xs font-black transition-all flex flex-col items-center gap-1 min-w-[100px] cursor-pointer active:scale-95 ${
                          selectedBreedSize === 'grande'
                            ? 'bg-[#0A3E40] text-white border-[#0A3E40] shadow-md ring-2 ring-[#0A3E40]/30 scale-102'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <span className="text-2xl">🦮</span>
                        <div className="text-xs font-black">Grande</div>
                        <div className="text-[9px] opacity-80 font-medium">&gt; 25 kg</div>
                      </button>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => setWizardStep(1)}
                        className="px-3 py-1.5 rounded-full font-bold text-xs text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
                      >
                        ← Anterior
                      </button>

                      <button
                        type="button"
                        disabled={!selectedBreedSize}
                        onClick={() => setWizardStep(3)}
                        className={`px-4 py-2 rounded-full font-black text-xs transition-all flex items-center gap-1.5 cursor-pointer ${
                          selectedBreedSize
                            ? 'bg-[#0E8388] text-white hover:bg-[#0A3E40] shadow-2xs hover:scale-105'
                            : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                        }`}
                      >
                        <span>Siguiente Paso</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}

                {/* PASO 3: Ingresar Peso de la Mascota */}
                {wizardStep === 3 && (
                  <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-4 text-center animate-in fade-in duration-200">
                    <div className="space-y-0.5">
                      <span className="px-2.5 py-0.5 rounded-full bg-[#0E8388]/10 text-[#0E8388] text-[10px] font-black uppercase tracking-wider">
                        Último Paso
                      </span>
                      <h4 className="text-sm font-black text-slate-900 tracking-tight">
                        Ingresa el Peso de tu Mascota
                      </h4>
                    </div>

                    <div className="flex flex-col items-center gap-3 py-1">
                      <div className="flex items-center border-2 border-[#0E8388]/30 rounded-2xl bg-slate-50 p-1.5 shadow-inner">
                        <button
                          type="button"
                          onClick={() => setPetWeight(Math.max(1, (parseFloat(petWeight) || 1) - 1))}
                          className="w-9 h-9 rounded-xl bg-white text-slate-800 font-black text-base flex items-center justify-center hover:bg-slate-100 shadow-2xs active:scale-95 cursor-pointer"
                        >
                          -
                        </button>
                        <div className="flex items-center px-3">
                          <input
                            type="number"
                            min="0.5"
                            max="100"
                            step="0.5"
                            value={petWeight}
                            onChange={(e) => setPetWeight(e.target.value)}
                            className="w-14 text-center text-xl font-black text-slate-900 focus:outline-hidden"
                          />
                          <span className="text-sm font-bold text-slate-600 ml-1">kg</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setPetWeight((parseFloat(petWeight) || 0) + 1)}
                          className="w-9 h-9 rounded-xl bg-white text-slate-800 font-black text-base flex items-center justify-center hover:bg-slate-100 shadow-2xs active:scale-95 cursor-pointer"
                        >
                          +
                        </button>
                      </div>

                      {/* Quick weight chips */}
                      <div className="flex flex-wrap justify-center items-center gap-1.5">
                        <span className="text-[11px] font-bold text-slate-400 mr-1">Comunes:</span>
                        {(isDog ? [3, 8, 20, 35] : [2, 4, 6]).map((w) => (
                          <button
                            type="button"
                            key={w}
                            onClick={() => setPetWeight(w)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-black transition-all border cursor-pointer ${
                              parseFloat(petWeight) === w
                                ? 'bg-[#0E8388] text-white border-[#0E8388] shadow-2xs'
                                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                            }`}
                          >
                            {w} kg
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => {
                          if (isDog && selectedLifeStage !== 'cachorro') {
                            setWizardStep(2);
                          } else {
                            setWizardStep(1);
                          }
                        }}
                        className="px-3 py-1.5 rounded-full font-bold text-xs text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
                      >
                        ← Anterior
                      </button>

                      <button
                        type="button"
                        onClick={() => setWizardStep('result')}
                        className="px-5 py-2.5 rounded-full font-black text-xs bg-gradient-to-r from-[#0E8388] to-[#0A3E40] text-white hover:shadow-md hover:scale-105 transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer"
                      >
                        <span>🎯 Calcular Ración</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* VISTA RESULTADO */}
                {wizardStep === 'result' && (
                  <div className="space-y-3 animate-in fade-in duration-300">
                    <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 flex-wrap text-xs font-black text-slate-800">
                        <span className="text-slate-400">Mascota:</span>
                        <span className="px-2.5 py-0.5 rounded-full bg-[#0E8388]/15 text-[#0E8388]">
                          {selectedLifeStage === 'cachorro' ? '🐾 Cachorro' : selectedLifeStage === 'adulto' ? '🐕 Adulto' : '🦴 Senior'}
                        </span>
                        {selectedBreedSize && (
                          <span className="px-2.5 py-0.5 rounded-full bg-[#0A3E40]/15 text-[#0A3E40]">
                            {selectedBreedSize === 'pequena' ? '🐩 Pequeña' : selectedBreedSize === 'mediana' ? '🐕 Mediana' : '🦮 Grande'}
                          </span>
                        )}
                        <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                          ⚖️ {petWeight} kg
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => setWizardStep(1)}
                        className="px-3 py-1 rounded-full text-xs font-black bg-[#0E8388]/10 text-[#0E8388] hover:bg-[#0E8388] hover:text-white transition-colors cursor-pointer self-start sm:self-auto"
                      >
                        ✏️ Modificar
                      </button>
                    </div>

                    {/* Highlight Banner */}
                    {activeFeedingRow && (
                      <div className={`p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs shadow-2xs transition-all ${
                        isDog
                          ? 'bg-[#0E8388]/10 border-[#0E8388]/30 text-[#0A3E40]'
                          : 'bg-[#C86D39]/10 border-[#C86D39]/30 text-[#692A08]'
                      }`}>
                        <div className="flex items-center gap-2.5 font-black text-xs sm:text-sm">
                          <span className={`p-2 rounded-lg text-white text-xs ${isDog ? 'bg-[#0E8388]' : 'bg-[#C86D39]'}`}>🎯</span>
                          <div>
                            <div>Ración Sugerida ({petWeight} kg):</div>
                            <div className="text-[10px] font-normal opacity-80">{activeFeedingRow.label}</div>
                          </div>
                        </div>
                        <span className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 shadow-2xs text-xs font-black text-emerald-600 self-start sm:self-auto">
                          🟢 {activeFeedingRow.maint} al día
                        </span>
                      </div>
                    )}

                    {/* Feeding Table */}
                    <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-2xs bg-white">
                      <table className="w-full text-xs text-left">
                        <thead className="bg-slate-100 text-slate-700 uppercase font-black border-b border-slate-200">
                          <tr>
                            <th className="px-4 py-2.5">Peso</th>
                            <th className="px-4 py-2.5">Ración Recomendada</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200/60 font-semibold text-slate-700">
                          {feedingGuide.map((row) => {
                            const isActive = activeFeedingRow?.id === row.id;
                            return (
                              <tr
                                key={row.id}
                                className={`transition-all duration-200 ${
                                  isActive
                                    ? isDog
                                      ? 'bg-[#0E8388]/15 font-black text-[#0A3E40]'
                                      : 'bg-[#C86D39]/15 font-black text-[#692A08]'
                                    : 'hover:bg-slate-50'
                                }`}
                              >
                                <td className="px-4 py-2.5">
                                  <div className="flex items-center gap-2">
                                    <span>{row.label}</span>
                                    {isActive && (
                                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-black text-white ${
                                        isDog ? 'bg-[#0E8388]' : 'bg-[#C86D39]'
                                      }`}>
                                        ✓ Mascota
                                      </span>
                                    )}
                                  </div>
                                </td>
                                <td className="px-4 py-2.5 font-bold">{row.maint}</td>
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

            {/* TAB 3: BENEFICIOS DE NUTRICIÓN */}
            {activeTab === 'beneficios' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 animate-in fade-in duration-200">
                {Array.isArray(product.benefits) && product.benefits.length > 0 ? (
                  product.benefits.map((b, idx) => (
                    <div key={idx} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-[#10B981]/15 text-[#10B981] shrink-0">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-extrabold text-slate-900 mb-0.5">Beneficio #{idx + 1}</h4>
                        <p className="text-[11px] text-slate-600 font-medium leading-relaxed">{b}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-2 p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-[#10B981]/15 text-[#10B981] shrink-0">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-extrabold text-slate-900 mb-0.5">Nutrición Holística Premium</h4>
                      <p className="text-[11px] text-slate-600 font-medium leading-relaxed">
                        Fórmula balanceada rica en nutrientes esenciales para la vitalidad, pelaje saludable y óptima digestión de tu mascota.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 4: RESEÑAS DE CLIENTES */}
            {activeTab === 'resenas' && (
              <div className="space-y-3 pt-1 animate-in fade-in duration-200">
                <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="text-center shrink-0">
                    <div className="text-3xl font-black text-slate-900">{product.rating}</div>
                    <div className="flex text-amber-400 justify-center my-0.5 text-xs">
                      {'★'.repeat(5)}
                    </div>
                    <div className="text-[10px] text-slate-500 font-bold">{product.reviewsCount} opiniones</div>
                  </div>
                  <div className="text-xs space-y-1 font-semibold text-slate-600">
                    <p>🟢 98% de dueños notaron mejoras en pelaje en 14 días.</p>
                    <p>🟢 100% aceptación de palatabilidad y sabor en mascotas exigentes.</p>
                  </div>
                </div>
              </div>
            )}

          </div>

        </div>
      </div>
    </section>

      {/* 4. Related Products Showcase */}
      {relatedProducts.length > 0 && (
        <section className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between mb-8">
            <div>
              <span className="text-xs font-black text-[#0E8388] uppercase tracking-widest">Recomendaciones del Sur</span>
              <h2 className="text-2xl md:text-3xl font-black text-slate-900">También te puede gustar</h2>
            </div>
            <Link
              to={isDog ? "/perros" : "/gatos"}
              className="text-xs font-extrabold text-[#0E8388] hover:underline flex items-center gap-1"
            >
              Ver todo el catálogo <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((relProd) => (
              <ProductCard
                key={relProd.id}
                product={relProd}
                onSelectProduct={onSelectProduct}
                onAddToCart={onAddToCart}
              />
            ))}
          </div>
        </section>
      )}

      {/* Mobile Sticky Bottom Buy Bar */}
      <div
        className={`md:hidden fixed bottom-[calc(3.5rem+env(safe-area-inset-bottom,0px))] inset-x-0 z-30 p-2.5 bg-white/95 backdrop-blur-xl border-t border-slate-200/90 shadow-[0_-6px_25px_rgba(0,0,0,0.12)] transition-all duration-300 ${
          showStickyBar ? 'translate-y-0 opacity-100 pointer-events-auto' : 'translate-y-6 opacity-0 pointer-events-none'
        }`}
      >
        <div className="flex items-center justify-between gap-3 px-2 max-w-md mx-auto">
          <div className="flex items-center gap-2.5 min-w-0">
            <img
              src={product.image}
              alt={product.name}
              className="w-10 h-10 object-contain rounded-xl bg-slate-50 p-1 border border-slate-100 shrink-0"
            />
            <div className="min-w-0">
              <div className="text-[10px] font-black text-slate-500 uppercase tracking-tight truncate">
                {selectedWeight}
              </div>
              <div className="text-sm font-black text-slate-900 leading-tight">
                {formatCLP(currentPrice)}
              </div>
            </div>
          </div>

          <button
            onClick={handleAddToCart}
            className={`py-2.5 px-4 rounded-xl font-black text-xs text-white shadow-md flex items-center justify-center gap-1.5 active:scale-95 transition-all cursor-pointer ${
              addedSuccess
                ? 'bg-[#10B981]'
                : isDog
                ? 'bg-[#0E8388]'
                : 'bg-[#C86D39]'
            }`}
          >
            {addedSuccess ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>¡AGREGADO!</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-4 h-4" />
                <span>AGREGAR</span>
              </>
            )}
          </button>
        </div>
      </div>

    </div>
  );
}

