import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Truck,
  Sparkles,
  Award,
  MessageCircle,
  PawPrint,
  PackageSearch,
  CheckCircle2,
  ChevronDown,
  Mail,
} from 'lucide-react';
import SplitHeroCard from '../components/SplitHeroCard';
import PromoCarousel from '../components/PromoCarousel';
import LocalDeliveryZones from '../components/LocalDeliveryZones';
import SEOHead from '../components/SEOHead';
import { getWebSiteSchema, getOrganizationSchema, getLocalBusinessSchema } from '../utils/schemaGenerators';
import { fetchProductsFromSupabase, getCachedProducts } from '../services/productsService';
import { PRODUCTS as FALLBACK_PRODUCTS } from '../data/mockData';
import { getHiddenProductIdentifiers, isProductHidden } from '../utils/productVisibility';
import { COMPANY_INFO } from '../constants';
import { WhatsAppIcon } from '../components/OfficialIcons';
import { saveSpecialOrderToSupabase } from '../services/specialOrdersService';

export default function HomeView({ onSelectProduct, onAddToCart }) {
  const cached = getCachedProducts();
  const [allProducts, setAllProducts] = useState(cached || FALLBACK_PRODUCTS);
  const [activeCategory, setActiveCategory] = useState('perros'); // 'perros' | 'gatos'
  const [currentBgColor, setCurrentBgColor] = useState('#244F46'); // Initial color matching Acana Freshwater
  const [hiddenProducts, setHiddenProducts] = useState(getHiddenProductIdentifiers);

  // Estado del Formulario de Encargos Especiales
  const [encargoFood, setEncargoFood] = useState('');
  const [encargoName, setEncargoName] = useState('');
  const [encargoPhone, setEncargoPhone] = useState('');
  const [encargoEmail, setEncargoEmail] = useState('');
  const [countryCode, setCountryCode] = useState('+56');
  const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false);
  const [encargoSubmitted, setEncargoSubmitted] = useState(false);
  const [encargoError, setEncargoError] = useState('');
  const [encargoSubmitting, setEncargoSubmitting] = useState(false);
  const countryDropdownRef = useRef(null);

  const COUNTRY_CODES = [
    { code: '+56', name: 'Chile', flag: '🇨🇱' },
    { code: '+54', name: 'Argentina', flag: '🇦🇷' },
    { code: '+51', name: 'Perú', flag: '🇵🇪' },
  ];

  // Cerrar lista desplegable al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (countryDropdownRef.current && !countryDropdownRef.current.contains(event.target)) {
        setIsCountryDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handlePhoneChange = (e) => {
    // Permitir ni más ni menos que dígitos numéricos, máximo 9
    const digitsOnly = e.target.value.replace(/\D/g, '').slice(0, 9);
    setEncargoPhone(digitsOnly);
    if (encargoError) setEncargoError('');
  };

  const handleEncargoSubmit = async (e) => {
    e.preventDefault();
    if (!encargoFood.trim()) {
      setEncargoError('Por favor indica qué alimento o marca buscas');
      return;
    }

    const nameParts = encargoName.trim().split(/\s+/).filter(Boolean);
    if (nameParts.length < 2) {
      setEncargoError('Por favor ingresa tu nombre y apellido');
      return;
    }

    const cleanPhone = encargoPhone.replace(/\D/g, '');
    if (cleanPhone.length !== 9) {
      setEncargoError('El número de teléfono debe tener ni más ni menos que 9 dígitos (ej: 9 1234 5678)');
      return;
    }

    const cleanEmail = encargoEmail.trim();
    if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setEncargoError('Por favor ingresa un correo electrónico válido');
      return;
    }

    setEncargoError('');
    setEncargoSubmitting(true);

    const fullPhone = `${countryCode} ${cleanPhone}`;

    // 1. Guardar automáticamente en el panel de administración (Supabase store_settings + localStorage)
    try {
      await saveSpecialOrderToSupabase({
        food_requested: encargoFood.trim(),
        customer_name: encargoName.trim(),
        customer_phone: fullPhone,
        customer_email: cleanEmail,
      });
    } catch (saveErr) {
      console.warn('Error al registrar encargo especial en Supabase:', saveErr);
    } finally {
      setEncargoSubmitting(false);
    }

    setEncargoSubmitted(true);

    // 2. Abrir WhatsApp con mensaje pre-redactado
    const message =
      `¡Hola Patitas del Sur! Quisiera consultar si pueden traer este alimento para mi regalón:\n\n` +
      `🐾 Alimento o Marca: ${encargoFood.trim()}\n` +
      `👤 Nombre y Apellido: ${encargoName.trim()}\n` +
      `📞 Teléfono o WhatsApp: ${fullPhone}\n` +
      `✉️ Correo Electrónico: ${cleanEmail}\n\n` +
      `¿Me podrían confirmar si es posible traerlo y para qué fecha estaría disponible? ¡Muchas gracias!`;

    const whatsappUrl = `https://wa.me/${COMPANY_INFO.whatsappRaw || '56953332492'}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };

  // Carga sincronizada desde Supabase
  useEffect(() => {
    let isMounted = true;
    const loadProducts = async () => {
      try {
        const data = await fetchProductsFromSupabase();
        if (isMounted && data && data.length > 0) {
          setAllProducts(data);
        }
      } catch (err) {
        console.error('Error al sincronizar productos en la portada:', err);
      }
    };

    loadProducts();

    const handleStorage = () => {
      setHiddenProducts(getHiddenProductIdentifiers());
      loadProducts();
    };

    window.addEventListener('storage', handleStorage);
    window.addEventListener('patitas_products_updated', loadProducts);

    return () => {
      isMounted = false;
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('patitas_products_updated', loadProducts);
    };
  }, []);

  // Productos visibles
  const visibleProducts = useMemo(() => {
    return allProducts.filter((product) => !isProductHidden(product, hiddenProducts));
  }, [allProducts, hiddenProducts]);

  return (
    <div className="w-full min-h-screen bg-[#FAF8F4] overflow-x-hidden selection:bg-[#F5BA13] selection:text-[#1D1D1F]">
      <SEOHead
        title="Alimento y Snacks Naturales para Mascotas en la Patagonia | Patitas del Sur"
        description="Nutrición holística, libre de granos y snacks deshidratados para perros y gatos. Despacho rápido en Puerto Varas, Llanquihue, Frutillar y Puerto Montt."
        canonical="/"
        keywords="alimento para perros puerto varas, comida gatos llanquihue, snacks naturales mascotas chile, grain free patagonia"
        jsonLd={[getWebSiteSchema(), getOrganizationSchema(), getLocalBusinessSchema()]}
      />

      {/* Hero Section: Split Screen interactivo de Kira y Jack */}
      <SplitHeroCard />

      {/* Ancla para desplazamiento suave desde el Hero */}
      <div id="storefront-content" className="scroll-mt-24" />

      {/* SECCIÓN 1: Tarjetas de Beneficios con Toques de Color (4 Pilares Competitivos) */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-8 md:pt-14 md:pb-10">
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-10">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#1D1D1F] tracking-tight">
            ¿Por qué elegir Patitas del Sur?
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {/* Card 1: Despacho Express Gratis */}
          <div className="group rounded-3xl p-6 bg-white border border-slate-200/90 shadow-xs hover:shadow-xl hover:border-amber-300 transition-all duration-300 flex flex-col justify-between hover:-translate-y-1">
            <div className="flex items-start gap-3.5 mb-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-[#D97706] shrink-0 group-hover:bg-[#F5BA13] group-hover:text-[#1D1D1F] transition-all duration-300 shadow-xs">
                <Truck className="w-6 h-6" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] font-black uppercase tracking-wider text-[#D97706] block">Rapidez Local</span>
                <h3 className="text-sm sm:text-base font-extrabold text-[#1D1D1F] tracking-tight mt-0.5 leading-snug">
                  Despacho Express Gratis
                </h3>
              </div>
            </div>
            <p className="text-xs text-slate-600 font-medium leading-relaxed mb-3">
              En tu puerta en 2 a 4 hrs en Puerto Varas y Llanquihue. Gratis por compras sobre $35.000.
            </p>
            <div className="pt-3 border-t border-slate-100 flex items-center gap-1.5 text-[11px] font-bold text-slate-700">
              <span className="w-1.5 h-1.5 rounded-full bg-[#D97706]" />
              <span>Mismo día garantizado</span>
            </div>
          </div>

          {/* Card 2: Precios Bajos & Justos */}
          <div className="group rounded-3xl p-6 bg-white border border-slate-200/90 shadow-xs hover:shadow-xl hover:border-amber-300 transition-all duration-300 flex flex-col justify-between hover:-translate-y-1">
            <div className="flex items-start gap-3.5 mb-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-[#D97706] shrink-0 group-hover:bg-[#F5BA13] group-hover:text-[#1D1D1F] transition-all duration-300 shadow-xs">
                <Award className="w-6 h-6" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] font-black uppercase tracking-wider text-[#D97706] block">Ahorro Real</span>
                <h3 className="text-sm sm:text-base font-extrabold text-[#1D1D1F] tracking-tight mt-0.5 leading-snug">
                  Precios Bajos y Justos
                </h3>
              </div>
            </div>
            <p className="text-xs text-slate-600 font-medium leading-relaxed mb-3">
              Marcas Super Premium y Grain Free al mejor valor de la zona, sin sobreprecios ni intermediarios.
            </p>
            <div className="pt-3 border-t border-slate-100 flex items-center gap-1.5 text-[11px] font-bold text-slate-700">
              <span className="w-1.5 h-1.5 rounded-full bg-[#D97706]" />
              <span>Mejor precio sin letra chica</span>
            </div>
          </div>

          {/* Card 3: Club de Beneficios Patitas */}
          <div className="group rounded-3xl p-6 bg-white border border-slate-200/90 shadow-xs hover:shadow-xl hover:border-amber-300 transition-all duration-300 flex flex-col justify-between hover:-translate-y-1">
            <div className="flex items-start gap-3.5 mb-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-[#D97706] shrink-0 group-hover:bg-[#F5BA13] group-hover:text-[#1D1D1F] transition-all duration-300 shadow-xs">
                <PawPrint className="w-6 h-6" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] font-black uppercase tracking-wider text-[#D97706] block">Fidelidad & Premios</span>
                <h3 className="text-sm sm:text-base font-extrabold text-[#1D1D1F] tracking-tight mt-0.5 leading-snug">
                  Club de Beneficios Patitas
                </h3>
              </div>
            </div>
            <p className="text-xs text-slate-600 font-medium leading-relaxed mb-3">
              Acumula patitas con cada compra, canjea descuentos inmediatos y sorpresas para tu regalón.
            </p>
            <div className="pt-3 border-t border-slate-100 flex items-center gap-1.5 text-[11px] font-bold text-slate-700">
              <span className="w-1.5 h-1.5 rounded-full bg-[#D97706]" />
              <span>Puntos automáticos por compra</span>
            </div>
          </div>

          {/* Card 4: Asesoría por WhatsApp */}
          <a
            href={COMPANY_INFO.whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group rounded-3xl p-6 bg-white border border-slate-200/90 shadow-xs hover:shadow-xl hover:border-amber-300 transition-all duration-300 flex flex-col justify-between hover:-translate-y-1 block cursor-pointer"
            title="Abrir chat de WhatsApp con Patitas del Sur"
          >
            <div className="flex items-start gap-3.5 mb-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-[#D97706] shrink-0 group-hover:bg-[#F5BA13] group-hover:text-[#1D1D1F] transition-all duration-300 shadow-xs">
                <WhatsAppIcon className="w-6 h-6 fill-current" colored={false} />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] font-black uppercase tracking-wider text-[#D97706] block">Atención Cercana</span>
                <h3 className="text-sm sm:text-base font-extrabold text-[#1D1D1F] tracking-tight mt-0.5 leading-snug">
                  Asesoría por WhatsApp
                </h3>
              </div>
            </div>
            <p className="text-xs text-slate-600 font-medium leading-relaxed mb-3">
              Te orientamos en minutos para elegir la receta y porción ideal para la edad y digestión de tu mascota.
            </p>
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold text-slate-700">
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#D97706]" />
                <span>{COMPANY_INFO.phoneDisplay}</span>
              </div>
              <span className="text-xs text-[#D97706] font-bold inline-flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                <span>Chatear</span>
                <span>→</span>
              </span>
            </div>
          </a>
        </div>
      </section>
      {/* SECCIÓN 2: Vitrina de Recetas Estrella con Fondo Dinámico y Tipografía Monumental */}
      <section
        id="catalogo-section"
        className="relative w-full py-10 sm:py-14 md:py-16 overflow-hidden transition-colors duration-700 ease-out"
        style={{ backgroundColor: currentBgColor }}
      >
        <div className="relative z-10 max-w-[1400px] mx-auto px-2 sm:px-6 lg:px-8">
          {/* Encabezado Principal de la Vitrina */}
          <div className="text-center max-w-2xl mx-auto mb-5 sm:mb-6">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight leading-[1.15]">
              Que a tu Mascota Nunca le Falte su Comida
            </h2>
            <p className="mt-2 text-xs sm:text-sm md:text-[15px] text-white/85 font-medium max-w-xl mx-auto leading-relaxed">
              Despacho rápido directo a tu puerta en Puerto Varas y Llanquihue. Todas las marcas y formatos, justo cuando tu regalón lo necesita.
            </p>
          </div>

          {/* Segmented Control Unificado Estilo Apple (Tipografía Pura & Vidrio Esmerilado) */}
          <div className="flex items-center justify-center mb-4 sm:mb-5">
            <div
              role="tablist"
              aria-label="Filtrar por especie"
              className="inline-flex p-1 rounded-full bg-black/20 backdrop-blur-xl border border-white/15 border-t-white/30 shadow-inner"
            >
              {[
                { id: 'perros', label: 'Perros' },
                { id: 'gatos', label: 'Gatos' },
              ].map((cat) => {
                const isActive = activeCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    role="tab"
                    aria-selected={isActive}
                    type="button"
                    onClick={() => setActiveCategory(cat.id)}
                    className={`relative px-5 sm:px-6 py-1.5 rounded-full text-xs sm:text-sm font-bold tracking-wide transition-all duration-200 ease-out cursor-pointer select-none active:scale-95 ${
                      isActive
                        ? 'bg-white text-[#1D1D1F] shadow-md shadow-black/25'
                        : 'text-white/80 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    {cat.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Escenario Central: PromoCarousel con cambio de color sincronizado */}
          <PromoCarousel
            petType={activeCategory}
            products={visibleProducts}
            onAddToCart={onAddToCart}
            onSelectProduct={onSelectProduct}
            onColorChange={(color) => setCurrentBgColor(color)}
          />
        </div>
      </section>

      {/* SECCIÓN 3: Cobertura de Despacho Local en Los Lagos */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10">
        <LocalDeliveryZones />
      </section>

      {/* SECCIÓN 4: Encargo Especial de Alimento y Coordinación de Entrega */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14">
        <div className="rounded-3xl p-8 sm:p-12 bg-gradient-to-br from-[#1D1D1F] via-[#242427] to-[#141416] text-white shadow-2xl relative overflow-hidden border border-white/10">
          {/* Ambient Glows */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#F5BA13]/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* Columna Izquierda: Propuesta de Valor y Compromiso */}
            <div className="lg:col-span-5 space-y-4 sm:space-y-5">
              <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider bg-amber-500/20 text-[#F5BA13] border border-amber-500/30">
                <PackageSearch className="w-3.5 h-3.5" />
                <span>Servicio de Encargos Especiales</span>
              </span>

              <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
                ¿Buscas un alimento o formato específico para tu regalón?
              </h2>

              <p className="text-sm sm:text-base text-slate-300 font-normal leading-relaxed">
                Escribe la marca, receta o fórmula medicada que necesitas. Nosotros lo gestionamos, verificamos el stock y coordinamos la entrega directa a tu puerta en Frutillar, Llanquihue, Puerto Varas y sectores cercanos.
              </p>

              {/* Puntos de confianza */}
              <div className="space-y-2.5 pt-2 text-xs sm:text-sm text-slate-300 font-medium">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Gestionamos cualquier marca o tamaño de saco</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Despacho a domicilio puntual en la cuenca del lago</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Coordinación directa y trato cercano por WhatsApp</span>
                </div>
              </div>
            </div>

            {/* Columna Derecha: Formulario Interactivo */}
            <div className="lg:col-span-7">
              <form
                onSubmit={handleEncargoSubmit}
                className="bg-white/10 backdrop-blur-xl rounded-3xl p-6 sm:p-8 border border-white/15 shadow-2xl space-y-4"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Campo 1: Qué alimento o marca buscas */}
                  <div className="sm:col-span-2 space-y-1.5">
                    <label className="text-xs font-bold text-slate-200 block">
                      ¿Qué alimento o marca buscas? <span className="text-amber-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ej: Bravery Salmón Adulto, Hill's c/d, Royal Canin..."
                      value={encargoFood}
                      onChange={(e) => {
                        setEncargoFood(e.target.value);
                        if (encargoError) setEncargoError('');
                      }}
                      className="w-full px-4 py-3 rounded-2xl bg-white/10 border border-white/20 text-white placeholder-slate-400 text-sm focus:outline-none focus:border-[#F5BA13] focus:bg-white/15 focus:ring-2 focus:ring-[#F5BA13]/20 transition-all shadow-inner"
                    />
                  </div>

                  {/* Campo 2: Nombre y Apellido */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-200 block">
                      Nombre y apellido <span className="text-amber-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ej: Ignacio Alarcón"
                      value={encargoName}
                      onChange={(e) => {
                        setEncargoName(e.target.value);
                        if (encargoError) setEncargoError('');
                      }}
                      className="w-full px-4 py-3 rounded-2xl bg-white/10 border border-white/20 text-white placeholder-slate-400 text-sm focus:outline-none focus:border-[#F5BA13] focus:bg-white/15 focus:ring-2 focus:ring-[#F5BA13]/20 transition-all shadow-inner"
                    />
                  </div>

                  {/* Campo 3: Teléfono de Contacto con Dropdown +56 y ni más ni menos que 9 dígitos */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-200 block">
                        Teléfono o WhatsApp <span className="text-amber-400">*</span>
                      </label>
                      <span
                        className={`text-[11px] font-bold tracking-wide transition-colors ${
                          encargoPhone.length === 9
                            ? 'text-emerald-400'
                            : encargoPhone.length > 0
                            ? 'text-amber-300'
                            : 'text-slate-400'
                        }`}
                      >
                        {encargoPhone.length === 9 ? '✓ 9 números' : `${encargoPhone.length}/9 números`}
                      </span>
                    </div>

                    <div className="relative flex items-center rounded-2xl bg-white/10 border border-white/20 focus-within:border-[#F5BA13] focus-within:bg-white/15 focus-within:ring-2 focus-within:ring-[#F5BA13]/20 transition-all shadow-inner">
                      {/* Lista desplegable diseñada para prefijo (+56 fijo por defecto) */}
                      <div className="relative shrink-0" ref={countryDropdownRef}>
                        <button
                          type="button"
                          onClick={() => setIsCountryDropdownOpen((prev) => !prev)}
                          className="flex items-center gap-1.5 px-3 py-3 text-xs sm:text-sm font-bold text-white hover:bg-white/10 rounded-l-2xl transition-all cursor-pointer border-r border-white/15 select-none"
                          title="Seleccionar prefijo de país"
                        >
                          <span>{COUNTRY_CODES.find((c) => c.code === countryCode)?.flag || '🇨🇱'}</span>
                          <span className="font-mono">{countryCode}</span>
                          <ChevronDown
                            className={`w-3.5 h-3.5 text-slate-300 transition-transform duration-200 ${
                              isCountryDropdownOpen ? 'rotate-180' : ''
                            }`}
                          />
                        </button>

                        {/* Menú desplegable */}
                        {isCountryDropdownOpen && (
                          <div className="absolute top-full left-0 mt-2 w-44 rounded-2xl bg-slate-900/95 backdrop-blur-xl border border-white/20 shadow-2xl p-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                            <div className="text-[10px] font-black uppercase tracking-wider text-slate-400 px-2.5 py-1">
                              Prefijo
                            </div>
                            {COUNTRY_CODES.map((item) => (
                              <button
                                key={item.code}
                                type="button"
                                onClick={() => {
                                  setCountryCode(item.code);
                                  setIsCountryDropdownOpen(false);
                                }}
                                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                  countryCode === item.code
                                    ? 'bg-amber-500/20 text-[#F5BA13] border border-amber-500/30'
                                    : 'text-white hover:bg-white/10'
                                }`}
                              >
                                <div className="flex items-center gap-2">
                                  <span>{item.flag}</span>
                                  <span>{item.name}</span>
                                </div>
                                <span className="font-mono text-slate-300">{item.code}</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Campo donde se colocan ni más ni menos que 9 números */}
                      <input
                        type="tel"
                        inputMode="numeric"
                        pattern="[0-9]{9}"
                        maxLength={9}
                        required
                        placeholder="9 1234 5678"
                        value={encargoPhone}
                        onChange={handlePhoneChange}
                        className="w-full px-3 py-3 bg-transparent text-white placeholder-slate-400 text-sm focus:outline-none font-mono tracking-wider"
                      />
                    </div>
                  </div>

                  {/* Campo 4: Correo Electrónico */}
                  <div className="sm:col-span-2 space-y-1.5">
                    <label className="text-xs font-bold text-slate-200 block">
                      Correo electrónico <span className="text-amber-400">*</span>
                    </label>
                    <div className="relative flex items-center rounded-2xl bg-white/10 border border-white/20 focus-within:border-[#F5BA13] focus-within:bg-white/15 focus-within:ring-2 focus-within:ring-[#F5BA13]/20 transition-all shadow-inner">
                      <span className="pl-3.5 text-slate-400 pointer-events-none">
                        <Mail className="w-4 h-4" />
                      </span>
                      <input
                        type="email"
                        required
                        placeholder="Ej: ignacio@ejemplo.cl"
                        value={encargoEmail}
                        onChange={(e) => {
                          setEncargoEmail(e.target.value);
                          if (encargoError) setEncargoError('');
                        }}
                        className="w-full px-3 py-3 bg-transparent text-white placeholder-slate-400 text-sm focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {encargoError && (
                  <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-200 text-xs font-bold">
                    {encargoError}
                  </div>
                )}

                {encargoSubmitted && (
                  <div className="p-3.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-200 text-xs font-bold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                    <span>¡Consulta lista! Se abrirá WhatsApp para responderte disponibilidad y fecha.</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={encargoSubmitting}
                  className="w-full inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold text-sm sm:text-base transition-all duration-300 shadow-xl shadow-[#25D366]/25 hover:scale-[1.01] active:scale-95 cursor-pointer mt-1 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  <WhatsAppIcon className="w-5 h-5 shrink-0" colored={false} />
                  <span>{encargoSubmitting ? 'Registrando consulta...' : 'Consultar disponibilidad y fecha'}</span>
                </button>

                <p className="text-[11px] text-slate-400 text-center font-medium pt-1">
                  🔒 Te responderemos directamente por WhatsApp para confirmarte si podemos traerlo y para cuándo.
                </p>
              </form>
            </div>

          </div>
        </div>
      </section>

    </div>
  );
}
