import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { PRODUCTS } from '../data/mockData';
import ProductCard from '../components/ProductCard';
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

  if (text.includes('res') || text.includes('carne') || text.includes('beef')) {
    return {
      icon: Beef,
      label: 'Res',
      iconColor: 'text-red-600',
      bgColor: 'bg-red-50 border-red-200/90 text-red-900',
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

  // Find product by URL param or default to first product
  const product = PRODUCTS.find((p) => p.id === id) || PRODUCTS[0];
  const isDog = product.petType === 'perros';

  const [selectedWeight, setSelectedWeight] = useState(
    product.weights ? product.weights[0] : 'Estándar'
  );
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('ingredientes');
  const [addedSuccess, setAddedSuccess] = useState(false);
  const [petWeight, setPetWeight] = useState(isDog ? 8 : 4);
  const [wizardStep, setWizardStep] = useState(1); // 1, 2, 3, or 'result'
  const [selectedLifeStage, setSelectedLifeStage] = useState(null);
  const [selectedBreedSize, setSelectedBreedSize] = useState(null);

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const productImages = product.images && product.images.length > 0 ? product.images : [product.image];

  // Reset wizard steps and active image when product changes
  useEffect(() => {
    setActiveImageIndex(0);
    setWizardStep(1);
    setSelectedLifeStage(null);
    setSelectedBreedSize(null);
  }, [id, product]);

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

  // Scroll to top on product change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (product.weights && product.weights.length > 0) {
      setSelectedWeight(product.weights[0]);
    }
  }, [id, product]);

  // Calculate dynamic price based on weight selection (multiplier preview)
  const getCalculatedPrice = () => {
    let price = product.price;
    if (selectedWeight.includes('5 kg') || selectedWeight.includes('3.5 kg')) {
      price = Math.round(product.price * 1.35);
    } else if (selectedWeight.includes('12 kg') || selectedWeight.includes('15 kg') || selectedWeight.includes('7 kg')) {
      price = Math.round(product.price * 2.5);
    }
    return price;
  };

  const currentPrice = getCalculatedPrice();

  const formatCLP = (price) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const handleAddToCart = () => {
    const itemToAdd = {
      ...product,
      price: currentPrice,
      selectedWeight: selectedWeight,
    };
    for (let i = 0; i < quantity; i++) {
      onAddToCart(itemToAdd);
    }
    setAddedSuccess(true);
    setTimeout(() => setAddedSuccess(false), 2500);
  };

  // Related products
  const relatedProducts = PRODUCTS.filter(
    (p) => p.petType === product.petType && p.id !== product.id
  ).slice(0, 4);

  return (
    <div className="pt-28 pb-20 bg-[#FAF9F6] min-h-screen text-slate-900 select-none">
      
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
      <section className="max-w-7xl mx-auto px-6 mb-16">
        <div className="bg-white rounded-3xl p-6 md:p-12 shadow-xl border border-slate-200/80">
          
          {/* Top Grid: Gallery & Purchase Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          
          {/* Left Column: Minimalist Multi-Image Gallery Showcase */}
          <div className="lg:col-span-6 flex flex-col items-center w-full">
            
            {/* Image Box with Soft Pastel Glow */}
            <div className={`relative w-full aspect-square rounded-3xl p-8 flex items-center justify-center border border-slate-100 overflow-hidden shadow-inner group ${
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
              
              {/* Paw Print Vector Indicators (Identicas a la Imagen 2) */}
              {productImages.length > 1 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3 px-5 py-2.5 rounded-full bg-white/90 backdrop-blur-md border border-slate-200 shadow-lg">
                  {productImages.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImageIndex(idx)}
                      title={`Ir a foto ${idx + 1}`}
                      className="focus:outline-none"
                    >
                      <PawPrintIcon
                        active={activeImageIndex === idx}
                        activeColor={isDog ? '#10B981' : '#C86D39'}
                      />
                    </button>
                  ))}
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

            {/* Thumbnail Strip (Fotos secundarias en miniatura) */}
            {productImages.length > 1 && (
              <div className="mt-4 flex items-center justify-center gap-3 overflow-x-auto p-1">
                {productImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`w-16 h-16 rounded-2xl overflow-hidden border-2 transition-all p-1 bg-white shadow-xs flex-shrink-0 ${
                      activeImageIndex === idx
                        ? 'border-[#0E8388] ring-2 ring-[#0E8388]/30 scale-105 shadow-md'
                        : 'border-slate-200 opacity-60 hover:opacity-100 hover:border-slate-300'
                    }`}
                  >
                    <img src={img} alt={`Miniatura ${idx + 1}`} className="w-full h-full object-contain" />
                  </button>
                ))}
              </div>
            )}


          </div>

          {/* Right Column: Product Info & Purchase Action */}
          <div className="lg:col-span-6 space-y-6">
            
            {/* Header: Brand & Rating */}
            <div className="space-y-2">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-[#0E8388]/10 text-[#0E8388]">
                    {product.brand || 'Patagonia Holística'}
                  </span>
                  {product.targetStageLabel && (
                    <span className="px-3 py-1 rounded-full text-xs font-black bg-slate-100 text-slate-800 border border-slate-200 flex items-center gap-1.5">
                      <span>🐾</span>
                      <span>{product.targetStageLabel}</span>
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
              <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight">
                {product.name}
              </h1>

              {/* Tagline */}
              <p className="text-slate-600 text-sm md:text-base font-medium leading-relaxed">
                {product.tagline}
              </p>
            </div>

            {/* Weight / Format Selector */}
            {product.weights && product.weights.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <label className="flex items-center justify-between text-xs font-extrabold uppercase tracking-wider text-slate-700">
                  <span>Seleccionar Formato (Peso):</span>
                  <span className="text-[#0E8388]">{selectedWeight}</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {product.weights.map((w) => (
                    <button
                      key={w}
                      onClick={() => setSelectedWeight(w)}
                      className={`px-5 py-2.5 rounded-2xl text-xs font-extrabold transition-all border ${
                        selectedWeight === w
                          ? isDog
                            ? 'bg-[#0E8388] text-white border-[#0E8388] shadow-md scale-105'
                            : 'bg-[#C86D39] text-white border-[#C86D39] shadow-md scale-105'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {w}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Pricing Section */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Precio Total:</div>
                <div className="text-3xl md:text-4xl font-black text-slate-900">
                  {formatCLP(currentPrice)}
                </div>
                {product.originalPrice && (
                  <div className="text-xs text-slate-400 line-through font-semibold">
                    {formatCLP(Math.round(product.originalPrice * (currentPrice / product.price)))}
                  </div>
                )}
              </div>

              <span className="px-3.5 py-1.5 rounded-xl bg-[#10B981]/15 text-[#10B981] font-black text-xs">
                Ahorro Especial Incluido
              </span>
            </div>

            {/* Quantity Spinner & Add to Cart Action */}
            <div className="flex items-center gap-4 pt-2">
              
              {/* Quantity Spinner */}
              <div className="flex items-center border border-slate-200 rounded-2xl bg-slate-50 p-1">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 rounded-xl bg-white text-slate-800 font-extrabold text-base flex items-center justify-center hover:bg-slate-100 shadow-xs"
                >
                  -
                </button>
                <span className="w-12 text-center text-sm font-black text-slate-900">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-10 h-10 rounded-xl bg-white text-slate-800 font-extrabold text-base flex items-center justify-center hover:bg-slate-100 shadow-xs"
                >
                  +
                </button>
              </div>

              {/* CTA Button */}
              <button
                onClick={handleAddToCart}
                className={`flex-1 py-4 px-8 rounded-2xl font-black text-sm text-white transition-all shadow-xl flex items-center justify-center gap-2 active:scale-95 ${
                  addedSuccess
                    ? 'bg-[#10B981] shadow-[#10B981]/30'
                    : isDog
                    ? 'bg-[#0E8388] hover:bg-[#10B981] shadow-[#0E8388]/30'
                    : 'bg-[#C86D39] hover:bg-[#D97706] shadow-[#C86D39]/30'
                }`}
              >
                {addedSuccess ? (
                  <>
                    <CheckCircle2 className="w-5 h-5" />
                    <span>¡AGREGADO AL CARRITO!</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-5 h-5" />
                    <span>AGREGAR AL CARRITO</span>
                  </>
                )}
              </button>

            </div>

            {/* Metrics Row (Mismo formato exacto que la Tarjeta de Catálogo en Imagen 2, incorporando el Indicador Veterinario) */}
            <div className="p-4 rounded-3xl bg-[#E6F4F1]/40 border border-[#0E8388]/20 flex items-center justify-around gap-2 flex-wrap">
              {/* Elemento 1: % Proteína (Círculo Ring Chart) */}
              <MiniCircleMetric
                value={`${product.proteinValue || 30}%`}
                label="Proteína"
                color="#0E8388"
              />

              {/* Elemento 2: Ícono Proteína Principal (Tarjeta rounded-2xl) */}
              <ProteinIconBadge
                icon={getProteinBadge(product.mainProtein, product.name).icon}
                label={getProteinBadge(product.mainProtein, product.name).label}
                iconColor={getProteinBadge(product.mainProtein, product.name).iconColor}
                bgColor={getProteinBadge(product.mainProtein, product.name).bgColor}
              />

              {/* Elemento 3: Ícono Trigo / Estado Grano (Tarjeta rounded-2xl Libre/Bajo/Con Grano) */}
              <GrainIconBadge
                isGrainFree={
                  product.badge?.toLowerCase().includes('grain') ||
                  product.tagline?.toLowerCase().includes('grain') ||
                  product.brand?.toLowerCase().includes('bravery') ||
                  product.brand?.toLowerCase().includes('patagonia')
                }
                grainLevelProp={product.grainLevel}
                tagline={product.tagline || ''}
              />

              {/* Elemento 4: Indicador Veterinario (EN GRIS SI NO ES VETERINARIO, CON COLOR SI ES VETERINARIO) */}
              <VetStatusMetric isVeterinary={product.isVeterinary} />
            </div>

          </div>

        </div>

        {/* Divider Bar Integrating Top Section with Tabs Info inside the SAME Card */}
        <hr className="border-slate-200/80 my-8" />

        {/* Integrated Tab Controls Navigation */}
        <div className="flex items-center gap-3 border-b border-slate-200 pb-4 overflow-x-auto scrollbar-none mb-8">
          <button
            onClick={() => setActiveTab('ingredientes')}
            className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-xs font-black transition-all shrink-0 ${
              activeTab === 'ingredientes'
                ? 'bg-[#0A3E40] text-white shadow-md'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Utensils className="w-4 h-4 text-[#0E8388]" />
            <span>Ingredientes & Análisis</span>
          </button>

          <button
            onClick={() => setActiveTab('racion')}
            className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-xs font-black transition-all shrink-0 ${
              activeTab === 'racion'
                ? 'bg-[#0A3E40] text-white shadow-md'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Scale className="w-4 h-4 text-[#C86D39]" />
            <span>Guía de Alimentación</span>
          </button>

          <button
            onClick={() => setActiveTab('beneficios')}
            className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-xs font-black transition-all shrink-0 ${
              activeTab === 'beneficios'
                ? 'bg-[#0A3E40] text-white shadow-md'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Sparkles className="w-4 h-4 text-[#10B981]" />
            <span>Beneficios de Nutrición</span>
          </button>

          <button
            onClick={() => setActiveTab('resenas')}
            className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-xs font-black transition-all shrink-0 ${
              activeTab === 'resenas'
                ? 'bg-[#0A3E40] text-white shadow-md'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
            }`}
          >
            <MessageSquare className="w-4 h-4 text-amber-400" />
            <span>Reseñas de Clientes ({product.reviewsCount})</span>
          </button>
        </div>

          {/* TAB 1: INGREDIENTES & ANÁLISIS GARANTIZADO */}
          {activeTab === 'ingredientes' && (
            <div className="space-y-8 animate-in fade-in duration-300">
              {/* Ingredients List */}
              <div className="space-y-3">
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">Ingredientes Principales:</h3>
                <div className="flex flex-wrap gap-2">
                  {product.ingredients?.map((ing, idx) => (
                    <span key={idx} className="px-4 py-2 rounded-xl bg-slate-100 text-slate-800 text-xs font-bold border border-slate-200">
                      🌿 {ing}
                    </span>
                  ))}
                </div>
              </div>

              {/* Guaranteed Analysis Table */}
              {product.guaranteedAnalysis && (
                <div className="space-y-3">
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">Análisis Nutricional Garantizado:</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {Object.entries(product.guaranteedAnalysis).map(([key, val]) => (
                      <div key={key} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center">
                        <div className="text-2xl font-black text-[#0E8388]">{val}</div>
                        <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">{key}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: GUÍA DE ALIMENTACIÓN DIARIA (FORMULARIO MULTI-PASOS) */}
          {activeTab === 'racion' && (
            <div className="space-y-6 animate-in fade-in duration-300 max-w-4xl mx-auto">
              
              {/* Header Title */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3 text-center sm:text-left">
                <div>
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                    Calculadora Nutricional de Ración Diaria
                  </h3>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    Completa los sencillos pasos para conocer la porción recomendada para tu mascota:
                  </p>
                </div>
                {product.targetStageLabel && (
                  <span className="px-3 py-1 rounded-full bg-[#0E8388]/10 text-[#0E8388] text-xs font-black self-center sm:self-auto">
                    {product.targetStageLabel}
                  </span>
                )}
              </div>

              {/* Wizard Step Progress Tracker Bar */}
              <div className="flex items-center justify-between gap-2 max-w-md mx-auto bg-slate-50 p-2.5 rounded-full border border-slate-200 shadow-xs">
                {/* Step 1 Pill */}
                <button
                  onClick={() => setWizardStep(1)}
                  className={`flex items-center gap-1.5 text-xs font-black px-3.5 py-1.5 rounded-full transition-all ${
                    wizardStep === 1
                      ? 'bg-[#0E8388] text-white shadow-md'
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
                      onClick={() => selectedLifeStage && setWizardStep(2)}
                      disabled={!selectedLifeStage}
                      className={`flex items-center gap-1.5 text-xs font-black px-3.5 py-1.5 rounded-full transition-all ${
                        wizardStep === 2
                          ? 'bg-[#0E8388] text-white shadow-md'
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
                  onClick={() => {
                    if (selectedLifeStage && (!isDog || selectedLifeStage === 'cachorro' || selectedBreedSize)) {
                      setWizardStep(3);
                    }
                  }}
                  disabled={!selectedLifeStage}
                  className={`flex items-center gap-1.5 text-xs font-black px-3.5 py-1.5 rounded-full transition-all ${
                    wizardStep === 3
                      ? 'bg-[#0E8388] text-white shadow-md'
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
                <div className="p-8 rounded-3xl bg-white border border-slate-200 shadow-md space-y-6 text-center max-w-xl mx-auto animate-in fade-in duration-300">
                  <div className="space-y-1">
                    <span className="px-3 py-1 rounded-full bg-[#0E8388]/10 text-[#0E8388] text-[11px] font-black uppercase tracking-wider">
                      Paso 1 de {isDog ? '3' : '2'}
                    </span>
                    <h3 className="text-xl font-black text-slate-900 tracking-tight">
                      ¿Cuál es la Etapa de Vida de tu {isDog ? 'Perro' : 'Gato'}?
                    </h3>
                    <p className="text-xs text-slate-500 font-medium">
                      Selecciona la edad actual de tu mascota para calcular sus requerimientos:
                    </p>
                  </div>

                  <div className="flex flex-wrap justify-center gap-4 py-2">
                    <button
                      onClick={() => setSelectedLifeStage('cachorro')}
                      className={`p-5 rounded-2xl border text-xs font-black transition-all flex flex-col items-center gap-2 min-w-[130px] active:scale-95 ${
                        selectedLifeStage === 'cachorro'
                          ? 'bg-[#0E8388] text-white border-[#0E8388] shadow-lg ring-4 ring-[#0E8388]/20 scale-105'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
                      }`}
                    >
                      <span className="text-3xl">🐾</span>
                      <div className="text-sm font-black">{isDog ? 'Cachorro' : 'Gatito'}</div>
                      <div className="text-[10px] opacity-80 font-medium">2 - 12 meses</div>
                    </button>

                    <button
                      onClick={() => setSelectedLifeStage('adulto')}
                      className={`p-5 rounded-2xl border text-xs font-black transition-all flex flex-col items-center gap-2 min-w-[130px] active:scale-95 ${
                        selectedLifeStage === 'adulto'
                          ? 'bg-[#0E8388] text-white border-[#0E8388] shadow-lg ring-4 ring-[#0E8388]/20 scale-105'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
                      }`}
                    >
                      <span className="text-3xl">🐕</span>
                      <div className="text-sm font-black">Adulto</div>
                      <div className="text-[10px] opacity-80 font-medium">1 - 7 años</div>
                    </button>

                    {isDog && (
                      <button
                        onClick={() => setSelectedLifeStage('senior')}
                        className={`p-5 rounded-2xl border text-xs font-black transition-all flex flex-col items-center gap-2 min-w-[130px] active:scale-95 ${
                          selectedLifeStage === 'senior'
                            ? 'bg-[#0E8388] text-white border-[#0E8388] shadow-lg ring-4 ring-[#0E8388]/20 scale-105'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
                        }`}
                      >
                        <span className="text-3xl">🦴</span>
                        <div className="text-sm font-black">Senior</div>
                        <div className="text-[10px] opacity-80 font-medium">7+ años</div>
                      </button>
                    )}
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex justify-end">
                    <button
                      disabled={!selectedLifeStage}
                      onClick={() => {
                        if (isDog && selectedLifeStage !== 'cachorro') {
                          setWizardStep(2);
                        } else {
                          setWizardStep(3);
                        }
                      }}
                      className={`px-6 py-3 rounded-full font-black text-xs transition-all flex items-center gap-2 ${
                        selectedLifeStage
                          ? 'bg-[#0E8388] text-white hover:bg-[#0A3E40] shadow-md hover:scale-105'
                          : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                      }`}
                    >
                      <span>Siguiente Paso</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* PASO 2: Seleccionar Tamaño de Raza (solo perros adultos/seniors) */}
              {wizardStep === 2 && (
                <div className="p-8 rounded-3xl bg-white border border-slate-200 shadow-md space-y-6 text-center max-w-xl mx-auto animate-in fade-in duration-300">
                  <div className="space-y-1">
                    <span className="px-3 py-1 rounded-full bg-[#0E8388]/10 text-[#0E8388] text-[11px] font-black uppercase tracking-wider">
                      Paso 2 de 3
                    </span>
                    <h3 className="text-xl font-black text-slate-900 tracking-tight">
                      ¿Cuál es el Tamaño de Raza de tu Perro?
                    </h3>
                    <p className="text-xs text-slate-500 font-medium">
                      El tamaño de la raza define la densidad nutricional recomendada:
                    </p>
                  </div>

                  <div className="flex flex-wrap justify-center gap-4 py-2">
                    <button
                      onClick={() => setSelectedBreedSize('pequena')}
                      className={`p-5 rounded-2xl border text-xs font-black transition-all flex flex-col items-center gap-2 min-w-[130px] active:scale-95 ${
                        selectedBreedSize === 'pequena'
                          ? 'bg-[#0A3E40] text-white border-[#0A3E40] shadow-lg ring-4 ring-[#0A3E40]/20 scale-105'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
                      }`}
                    >
                      <span className="text-3xl">🐩</span>
                      <div className="text-sm font-black">Raza Pequeña</div>
                      <div className="text-[10px] opacity-80 font-medium">Menos de 10 kg</div>
                    </button>

                    <button
                      onClick={() => setSelectedBreedSize('mediana')}
                      className={`p-5 rounded-2xl border text-xs font-black transition-all flex flex-col items-center gap-2 min-w-[130px] active:scale-95 ${
                        selectedBreedSize === 'mediana'
                          ? 'bg-[#0A3E40] text-white border-[#0A3E40] shadow-lg ring-4 ring-[#0A3E40]/20 scale-105'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
                      }`}
                    >
                      <span className="text-3xl">🐕</span>
                      <div className="text-sm font-black">Raza Mediana</div>
                      <div className="text-[10px] opacity-80 font-medium">10 a 25 kg</div>
                    </button>

                    <button
                      onClick={() => setSelectedBreedSize('grande')}
                      className={`p-5 rounded-2xl border text-xs font-black transition-all flex flex-col items-center gap-2 min-w-[130px] active:scale-95 ${
                        selectedBreedSize === 'grande'
                          ? 'bg-[#0A3E40] text-white border-[#0A3E40] shadow-lg ring-4 ring-[#0A3E40]/20 scale-105'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
                      }`}
                    >
                      <span className="text-3xl">🦮</span>
                      <div className="text-sm font-black">Raza Grande</div>
                      <div className="text-[10px] opacity-80 font-medium">Más de 25 kg</div>
                    </button>
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                    <button
                      onClick={() => setWizardStep(1)}
                      className="px-5 py-2.5 rounded-full font-bold text-xs text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
                    >
                      ← Paso Anterior
                    </button>

                    <button
                      disabled={!selectedBreedSize}
                      onClick={() => setWizardStep(3)}
                      className={`px-6 py-3 rounded-full font-black text-xs transition-all flex items-center gap-2 ${
                        selectedBreedSize
                          ? 'bg-[#0E8388] text-white hover:bg-[#0A3E40] shadow-md hover:scale-105'
                          : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                      }`}
                    >
                      <span>Siguiente Paso</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* PASO 3: Ingresar Peso de la Mascota */}
              {wizardStep === 3 && (
                <div className="p-8 rounded-3xl bg-white border border-slate-200 shadow-md space-y-6 text-center max-w-xl mx-auto animate-in fade-in duration-300">
                  <div className="space-y-1">
                    <span className="px-3 py-1 rounded-full bg-[#0E8388]/10 text-[#0E8388] text-[11px] font-black uppercase tracking-wider">
                      Último Paso
                    </span>
                    <h3 className="text-xl font-black text-slate-900 tracking-tight">
                      Ingresa el Peso Exacto de tu Mascota
                    </h3>
                    <p className="text-xs text-slate-500 font-medium">
                      Ajusta los kilos para calcular la porción diaria recomendada en gramos:
                    </p>
                  </div>

                  {/* Weight Input Selector */}
                  <div className="flex flex-col items-center gap-4 py-2">
                    <div className="flex items-center border-2 border-[#0E8388]/30 rounded-2xl bg-slate-50 p-2 shadow-inner">
                      <button
                        onClick={() => setPetWeight(Math.max(1, (parseFloat(petWeight) || 1) - 1))}
                        className="w-11 h-11 rounded-xl bg-white text-slate-800 font-black text-lg flex items-center justify-center hover:bg-slate-100 shadow-xs active:scale-95"
                      >
                        -
                      </button>
                      <div className="flex items-center px-4">
                        <input
                          type="number"
                          min="0.5"
                          max="100"
                          step="0.5"
                          value={petWeight}
                          onChange={(e) => setPetWeight(e.target.value)}
                          className="w-16 text-center text-2xl font-black text-slate-900 focus:outline-hidden"
                        />
                        <span className="text-base font-bold text-slate-600 ml-1">kg</span>
                      </div>
                      <button
                        onClick={() => setPetWeight((parseFloat(petWeight) || 0) + 1)}
                        className="w-11 h-11 rounded-xl bg-white text-slate-800 font-black text-lg flex items-center justify-center hover:bg-slate-100 shadow-xs active:scale-95"
                      >
                        +
                      </button>
                    </div>

                    {/* Quick weight chips */}
                    <div className="flex flex-wrap justify-center items-center gap-2">
                      <span className="text-xs font-bold text-slate-400 mr-1">Pesos habituales:</span>
                      {(isDog ? [3, 8, 20, 35] : [2, 4, 6]).map((w) => (
                        <button
                          key={w}
                          onClick={() => setPetWeight(w)}
                          className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all border ${
                            parseFloat(petWeight) === w
                              ? 'bg-[#0E8388] text-white border-[#0E8388] shadow-xs'
                              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          {w} kg
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                    <button
                      onClick={() => {
                        if (isDog && selectedLifeStage !== 'cachorro') {
                          setWizardStep(2);
                        } else {
                          setWizardStep(1);
                        }
                      }}
                      className="px-5 py-2.5 rounded-full font-bold text-xs text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
                    >
                      ← Paso Anterior
                    </button>

                    <button
                      onClick={() => setWizardStep('result')}
                      className="px-7 py-3.5 rounded-full font-black text-xs bg-gradient-to-r from-[#0E8388] to-[#0A3E40] text-white hover:shadow-lg hover:scale-105 transition-all flex items-center gap-2 shadow-md"
                    >
                      <span>🎯 Calcular Ración Recomendada</span>
                    </button>
                  </div>
                </div>
              )}

              {/* VISTA RESULTADO: Revela la Tabla y el Banner SOLO al completar el formulario */}
              {wizardStep === 'result' && (
                <div className="space-y-6 animate-in fade-in duration-400">
                  
                  {/* Active Selection Summary Bar */}
                  <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2 flex-wrap text-xs font-black text-slate-800">
                      <span className="text-slate-400">Mascota seleccionada:</span>
                      <span className="px-3 py-1 rounded-full bg-[#0E8388]/15 text-[#0E8388] flex items-center gap-1.5">
                        {selectedLifeStage === 'cachorro' ? '🐾 Cachorro' : selectedLifeStage === 'adulto' ? '🐕 Adulto' : '🦴 Senior'}
                      </span>
                      {selectedBreedSize && (
                        <span className="px-3 py-1 rounded-full bg-[#0A3E40]/15 text-[#0A3E40] flex items-center gap-1.5">
                          {selectedBreedSize === 'pequena' ? '🐩 Raza Pequeña' : selectedBreedSize === 'mediana' ? '🐕 Raza Mediana' : '🦮 Raza Grande'}
                        </span>
                      )}
                      <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 flex items-center gap-1">
                        ⚖️ {petWeight} kg
                      </span>
                    </div>

                    <button
                      onClick={() => setWizardStep(1)}
                      className="px-4 py-2 rounded-full text-xs font-black bg-[#0E8388]/10 text-[#0E8388] hover:bg-[#0E8388] hover:text-white transition-colors flex items-center gap-1.5 self-start sm:self-auto"
                    >
                      <span>✏️ Recalcular / Modificar Formulario</span>
                    </button>
                  </div>

                  {/* Highlight Banner */}
                  {activeFeedingRow && (
                    <div className={`p-5 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-md transition-all ${
                      isDog
                        ? 'bg-[#0E8388]/10 border-[#0E8388]/30 text-[#0A3E40]'
                        : 'bg-[#C86D39]/10 border-[#C86D39]/30 text-[#692A08]'
                    }`}>
                      <div className="flex items-center gap-3 font-black text-sm md:text-base">
                        <span className={`p-2.5 rounded-xl text-white text-sm shadow-xs ${isDog ? 'bg-[#0E8388]' : 'bg-[#C86D39]'}`}>🎯</span>
                        <div>
                          <div>Ración Diaria Sugerida ({petWeight} kg):</div>
                          <div className="text-xs font-normal opacity-80">{activeFeedingRow.label}</div>
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 font-bold">
                        <span className="px-5 py-2.5 rounded-xl bg-white border border-slate-200 shadow-sm text-sm font-black text-emerald-600">
                          🟢 Ración Diaria: <strong>{activeFeedingRow.maint}</strong>
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Feeding Table */}
                  <div className="overflow-x-auto rounded-3xl border border-slate-200 shadow-md bg-white">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-slate-100 text-slate-700 uppercase font-black border-b border-slate-200">
                        <tr>
                          <th className="px-6 py-4">Rango de Peso de la Mascota</th>
                          <th className="px-6 py-4">Ración Diaria Recomendada (Gramos / Día)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200/60 font-semibold text-slate-700">
                        {feedingGuide.map((row) => {
                          const isActive = activeFeedingRow?.id === row.id;
                          return (
                            <tr
                              key={row.id}
                              className={`transition-all duration-300 ${
                                isActive
                                  ? isDog
                                    ? 'bg-[#0E8388]/15 font-black text-[#0A3E40] ring-2 ring-inset ring-[#0E8388]'
                                    : 'bg-[#C86D39]/15 font-black text-[#692A08] ring-2 ring-inset ring-[#C86D39]'
                                  : 'hover:bg-slate-50'
                              }`}
                            >
                              <td className="px-6 py-4">
                                <div className="flex items-center justify-between gap-2">
                                  <span className="font-extrabold text-sm">{row.label}</span>
                                  {isActive && (
                                    <span className={`px-3 py-1 rounded-full text-[10px] font-black text-white shadow-xs ${
                                      isDog ? 'bg-[#0E8388]' : 'bg-[#C86D39]'
                                    }`}>
                                      ✓ Tu Mascota ({petWeight} kg)
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td className="px-6 py-4 text-sm font-bold">{row.maint}</td>
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-300">
              {product.benefits ? (
                product.benefits.map((b, idx) => (
                  <div key={idx} className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start gap-4">
                    <div className="p-3 rounded-xl bg-[#10B981]/15 text-[#10B981] shrink-0">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-base font-extrabold text-slate-900 mb-1">Beneficio Clave #{idx + 1}</h4>
                      <p className="text-xs text-slate-600 font-medium leading-relaxed">{b}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-500">Receta nutricional holística libre de granos.</p>
              )}
            </div>
          )}

          {/* TAB 4: RESEÑAS DE CLIENTES */}
          {activeTab === 'resenas' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="flex items-center gap-6 p-6 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="text-center">
                  <div className="text-5xl font-black text-slate-900">{product.rating}</div>
                  <div className="flex text-amber-400 justify-center my-1">
                    {'★'.repeat(5)}
                  </div>
                  <div className="text-xs text-slate-500 font-bold">{product.reviewsCount} opiniones verificadas</div>
                </div>
                <div className="flex-1 text-xs space-y-1 font-semibold text-slate-600">
                  <p>🟢 98% de los dueños notaron mejoras en el pelaje de su mascota a los 14 días.</p>
                  <p>🟢 100% Aceptación de palatabilidad y sabor en perros y gatos exigentes.</p>
                </div>
              </div>
            </div>
          )}

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

    </div>
  );
}
