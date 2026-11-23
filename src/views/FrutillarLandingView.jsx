import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  MapPin,
  Truck,
  Clock,
  Zap,
  Sparkles,
  CheckCircle2,
  CreditCard,
  ShieldCheck,
  ArrowRight,
  ChevronRight,
  ShoppingBag,
  Dog,
  Cat,
} from 'lucide-react';
import SEOHead from '../components/SEOHead';
import FAQSection from '../components/FAQSection';
import DigitalCatalogItemCard from '../components/catalog/DigitalCatalogItemCard';
import { WhatsAppIcon } from '../components/OfficialIcons';
import { COMPANY_INFO, FRUTILLAR_SECTORS } from '../constants';
import { FRUTILLAR_FAQS } from '../data/faqData';
import { PRODUCTS as FALLBACK_PRODUCTS } from '../data/mockData';
import { fetchProductsFromSupabase, getCachedProducts } from '../services/productsService';
import { getHiddenProductIdentifiers, isProductHidden } from '../utils/productVisibility';
import { groupProductsForStore } from '../utils/productVariants';
import {
  getFAQPageSchema,
  getBreadcrumbSchema,
} from '../utils/schemaGenerators';
import { formatCLP } from '../utils/formatters';

const URBAN_SECTORS = new Set(['Frutillar Bajo', 'Frutillar Alto', 'Loteo Espacio Frutillar']);

const DELIVERY_SCHEDULE_ROWS = [
  {
    id: 'morning',
    days: 'Lunes a Sábado',
    window: 'Ventana Mañana',
    hours: '10:00 – 13:00 hrs',
    standardFee: '$2.500 CLP',
    freeShipping: 'GRATIS desde $25.000 CLP',
    isUrgent: false,
  },
  {
    id: 'afternoon',
    days: 'Lunes a Sábado',
    window: 'Ventana Tarde',
    hours: '15:30 – 19:30 hrs',
    standardFee: '$2.500 CLP',
    freeShipping: 'GRATIS desde $25.000 CLP',
    isUrgent: false,
  },
  {
    id: 'urgent-weekday',
    days: 'Lunes a Sábado',
    window: 'Pedido Urgente',
    hours: 'Fuera de ventana estándar',
    standardFee: '$3.500 CLP (tarifa fija)',
    freeShipping: 'No aplica envío gratis',
    isUrgent: true,
  },
  {
    id: 'urgent-sunday',
    days: 'Domingos',
    window: 'Solo Pedido Urgente',
    hours: '10:00 – 20:00 hrs',
    standardFee: '$3.500 CLP (tarifa fija)',
    freeShipping: 'No aplica envío gratis',
    isUrgent: true,
  },
];

/**
 * Landing Local SEO, GEO & AEO: Despacho de Alimento para Mascotas en Frutillar (/despacho/frutillar)
 */
export default function FrutillarLandingView({
  cartItems = [],
  onAddToCart,
  onUpdateQuantity,
  onRemoveItem,
  onSelectProduct,
}) {
  const cached = getCachedProducts();
  const [allProducts, setAllProducts] = useState(
    cached && cached.length > 0 ? cached : FALLBACK_PRODUCTS
  );
  const [hiddenProducts] = useState(getHiddenProductIdentifiers);

  useEffect(() => {
    let isMounted = true;
    fetchProductsFromSupabase()
      .then((data) => {
        if (isMounted && Array.isArray(data) && data.length > 0) {
          setAllProducts(data);
        }
      })
      .catch((err) => {
        console.error('Error cargando productos destacados en FrutillarLandingView:', err);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  // Seleccionar hasta 6 productos con stock activo (mezcla de perros y gatos)
  const featuredProducts = useMemo(() => {
    const visible = (allProducts || []).filter(
      (p) =>
        !p.isPaused &&
        !p.is_paused &&
        p.isActive !== false &&
        p.is_active !== false &&
        !isProductHidden(p, hiddenProducts)
    );
    const grouped = groupProductsForStore(visible).filter((p) => {
      const variants = p.variants || [];
      if (variants.length > 0) {
        return variants.some((v) => (typeof v.stock === 'number' ? v.stock : 10) > 0 && !v.isPaused);
      }
      const stock = typeof p.stock === 'number' ? p.stock : 10;
      return stock > 0 && !p.isOutOfStock;
    });

    const dogs = grouped.filter((p) => p.petType === 'perros').slice(0, 4);
    const cats = grouped.filter((p) => p.petType === 'gatos').slice(0, 2);
    const combined = [...dogs, ...cats];
    return combined.length > 0 ? combined.slice(0, 6) : grouped.slice(0, 6);
  }, [allProducts, hiddenProducts]);

  const activeBrands = useMemo(() => {
    const set = new Set();
    (allProducts || []).forEach((p) => {
      if (p.brand && !p.isPaused && p.isActive !== false) {
        set.add(String(p.brand).trim());
      }
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'es'));
  }, [allProducts]);

  const whatsappFrutillarUrl = `${COMPANY_INFO.whatsappUrl}?text=${encodeURIComponent(
    '¡Hola Patitas del Sur! 🐾 Quiero hacer un pedido con despacho a domicilio en Frutillar.'
  )}`;

  return (
    <div className="min-h-screen bg-[#FAF8F4] text-[#1D1D1F] pt-24 sm:pt-28 pb-24 sm:pb-16">
      <SEOHead
        title="Alimento para Perros y Gatos con Despacho a Domicilio en Frutillar"
        description="Compra alimento super premium, Grain Free, snacks y antiparasitarios para perros y gatos con despacho propio el mismo día en Frutillar y alrededores (~9 km desde Frutillar Alto): Frutillar Bajo, Frutillar Alto, Punta Larga, Reserva Frutillar, Lagunita Frutillar, Parcelas Frutillar y Colonia La Radio. Envío gratis desde $25.000 CLP y Pedido Urgente los domingos."
        canonical="/despacho/frutillar"
        keywords="alimento para perros frutillar, alimento para gatos frutillar, tienda de mascotas frutillar, despacho comida mascotas frutillar, alimento mascotas domingo frutillar, parcelas frutillar, lagunita frutillar, colonia la radio, punta larga, reserva frutillar"
        jsonLd={[
          getFAQPageSchema(FRUTILLAR_FAQS),
          getBreadcrumbSchema([
            { name: 'Inicio', url: '/' },
            { name: 'Despacho en Frutillar', url: '/despacho/frutillar' },
          ]),
        ]}
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-10 sm:space-y-12">
        {/* Breadcrumbs */}
        <nav aria-label="Ruta de navegación" className="flex items-center gap-2 text-xs font-bold text-slate-500">
          <Link to="/" className="hover:text-[#1D1D1F] transition-colors">
            Inicio
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-[#1D1D1F] font-extrabold">Despacho en Frutillar</span>
        </nav>

        {/* =============================================================== */}
        {/* 1. HERO + RESUMEN AEO DIRECTO                                   */}
        {/* =============================================================== */}
        <header className="relative overflow-hidden rounded-[2rem] bg-[#1D1D1F] text-white p-6 sm:p-10 md:p-12 shadow-lg">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-24 -right-24 w-72 h-72 rounded-full bg-[#F5BA13]/20 blur-3xl"
          />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-5">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#F5BA13]/15 border border-[#F5BA13]/40 text-[#F5BA13] text-xs font-extrabold uppercase tracking-wider">
                <MapPin className="w-3.5 h-3.5 shrink-0" />
                <span>Bodega Local en Loteo Espacio Frutillar · Radio ~9 km</span>
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-[1.08] text-white">
                Alimento para Perros y Gatos con{' '}
                <span className="text-[#F5BA13]">Despacho a Domicilio en Frutillar</span>
              </h1>

              {/* Bloque AEO de respuesta directa (45–55 palabras) */}
              <p className="text-sm sm:text-base text-white/85 leading-relaxed max-w-2xl">
                En <strong>Patitas del Sur</strong> despachamos alimento super premium, recetas Grain Free,
                snacks naturales, arenas y antiparasitarios directo a tu puerta o parcela en{' '}
                <strong>Frutillar y alrededores (~9 km alrededor de Frutillar Alto)</strong>. Tarifa estándar{' '}
                <strong>{formatCLP(COMPANY_INFO.baseShippingFee)} CLP</strong>{' '}
                (envío <strong>GRATIS desde {formatCLP(COMPANY_INFO.freeShippingThreshold)} CLP</strong> de lunes a sábado) y{' '}
                <strong>Pedido Urgente los domingos</strong> de 10:00 a 20:00 hrs por{' '}
                <strong>{formatCLP(COMPANY_INFO.urgentShippingFee)} CLP</strong>.
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-1">
                <Link
                  to="/catalogo"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-[#F5BA13] hover:bg-[#D97706] text-[#1D1D1F] text-sm font-black shadow-md transition-all active:scale-95"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Ver Catálogo con Stock en Vivo</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <a
                  href={whatsappFrutillarUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-3.5 rounded-full bg-white/10 hover:bg-white/15 border border-white/20 text-white text-sm font-bold transition-all active:scale-95"
                >
                  <WhatsAppIcon className="w-4 h-4" colored />
                  <span>Pedir por WhatsApp</span>
                </a>
              </div>
            </div>

            {/* Tarjeta de Datos Verificables Rápidos */}
            <aside className="lg:col-span-5 rounded-3xl bg-white/8 border border-white/15 backdrop-blur-xs p-5 sm:p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <span className="text-xs font-extrabold uppercase tracking-wider text-[#F5BA13]">
                  Resumen de Despacho · Frutillar
                </span>
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                  Mismo día
                </span>
              </div>

              <dl className="space-y-3 text-xs sm:text-sm">
                <div className="flex items-start gap-3">
                  <Truck className="w-4 h-4 text-[#F5BA13] shrink-0 mt-0.5" />
                  <div>
                    <dt className="font-bold text-white">Lun–Sáb (Mañana y Tarde)</dt>
                    <dd className="text-white/75">
                      10:00–13:00 y 15:30–19:30 hrs · <strong>$2.500 CLP</strong> (Gratis ≥ $25.000)
                    </dd>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Zap className="w-4 h-4 text-[#F5BA13] shrink-0 mt-0.5" />
                  <div>
                    <dt className="font-bold text-white">Domingos y Pedidos Urgentes</dt>
                    <dd className="text-white/75">
                      Domingos 10:00–20:00 hrs · Tarifa fija <strong>$3.500 CLP</strong>
                    </dd>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CreditCard className="w-4 h-4 text-[#F5BA13] shrink-0 mt-0.5" />
                  <div>
                    <dt className="font-bold text-white">Pago Online o Contra Entrega</dt>
                    <dd className="text-white/75">
                      Mercado Pago, transferencia al recibir, efectivo o POS móvil en tu puerta.
                    </dd>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <ShieldCheck className="w-4 h-4 text-[#F5BA13] shrink-0 mt-0.5" />
                  <div>
                    <dt className="font-bold text-white">Garantía de Palatabilidad</dt>
                    <dd className="text-white/75">
                      5 días hábiles + cambios por 10 días corridos · {COMPANY_INFO.legalName}
                    </dd>
                  </div>
                </div>
              </dl>
            </aside>
          </div>
        </header>

        {/* =============================================================== */}
        {/* 2. TABLA TRANSPARENTE DE HORARIOS Y TARIFAS (SEO + AEO)         */}
        {/* =============================================================== */}
        <section
          aria-labelledby="horarios-tarifas-frutillar"
          className="bg-white rounded-3xl border border-[#1D1D1F]/10 shadow-xs p-5 sm:p-8 md:p-10 space-y-6"
        >
          <div className="max-w-3xl space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FEF3C7] text-[#78350F] border border-[#F5BA13]/40 text-xs font-extrabold uppercase tracking-wider">
              <Clock className="w-3.5 h-3.5 text-[#D97706]" />
              <span>Horarios y Tarifas Oficiales</span>
            </div>
            <h2
              id="horarios-tarifas-frutillar"
              className="text-2xl sm:text-3xl font-black text-[#1D1D1F] tracking-tight"
            >
              ¿Cuánto cuesta y en qué horario llega tu despacho en Frutillar?
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              Elegimos el mejor horario contigo directamente en el checkout. Sin letra chica ni recargos sorpresa al llegar a tu casa o parcela.
            </p>
          </div>

          {/* Tabla semántica (desktop & crawlers) */}
          <div className="overflow-x-auto rounded-2xl border border-[#1D1D1F]/10">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="bg-[#FAF8F4] border-b border-[#1D1D1F]/10 text-[#1D1D1F]">
                  <th className="py-3.5 px-4 font-black">Días</th>
                  <th className="py-3.5 px-4 font-black">Modalidad</th>
                  <th className="py-3.5 px-4 font-black">Horario de Entrega</th>
                  <th className="py-3.5 px-4 font-black">Tarifa</th>
                  <th className="py-3.5 px-4 font-black">Envío Gratis</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {DELIVERY_SCHEDULE_ROWS.map((row) => (
                  <tr
                    key={row.id}
                    className={row.isUrgent ? 'bg-[#FFFBEB]/75' : 'bg-white hover:bg-[#FAF8F4]/50'}
                  >
                    <td className="py-3.5 px-4 font-bold text-[#1D1D1F] whitespace-nowrap">
                      {row.days}
                    </td>
                    <td className="py-3.5 px-4 font-extrabold text-[#1D1D1F]">
                      <span className="inline-flex items-center gap-1.5">
                        {row.isUrgent ? (
                          <Zap className="w-3.5 h-3.5 text-[#D97706] fill-[#F5BA13]" />
                        ) : (
                          <Truck className="w-3.5 h-3.5 text-emerald-600" />
                        )}
                        {row.window}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-700 whitespace-nowrap">
                      {row.hours}
                    </td>
                    <td className="py-3.5 px-4 font-black text-[#1D1D1F] whitespace-nowrap">
                      {row.standardFee}
                    </td>
                    <td className="py-3.5 px-4">
                      {row.isUrgent ? (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-[#FEF3C7] text-[#78350F] text-xs font-bold">
                          {row.freeShipping}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-extrabold">
                          <Sparkles className="w-3 h-3 text-emerald-600" />
                          {row.freeShipping}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* =============================================================== */}
        {/* 3. SECTORES Y PARCELACIONES CON COBERTURA EN FRUTILLAR          */}
        {/* =============================================================== */}
        <section
          aria-labelledby="sectores-frutillar"
          className="bg-white rounded-3xl border border-[#1D1D1F]/10 shadow-xs p-5 sm:p-8 md:p-10 space-y-6"
        >
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="max-w-2xl space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FEF3C7] text-[#78350F] border border-[#F5BA13]/40 text-xs font-extrabold uppercase tracking-wider">
                <MapPin className="w-3.5 h-3.5 text-[#D97706]" />
                <span>Cobertura Urbana y Rural</span>
              </div>
              <h2
                id="sectores-frutillar"
                className="text-2xl sm:text-3xl font-black text-[#1D1D1F] tracking-tight"
              >
                Sectores y parcelaciones de Frutillar donde despachamos
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                Llegamos directo a tu casa, condominio o portón de parcela con nuestra flota propia saliendo desde{' '}
                <strong>Loteo Espacio Frutillar</strong>.
              </p>
            </div>
            <Link
              to="/politicas-de-despacho"
              className="text-xs font-extrabold text-[#B45309] hover:text-[#1D1D1F] underline underline-offset-4 shrink-0"
            >
              Ver políticas de despacho completas
            </Link>
          </div>

          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {FRUTILLAR_SECTORS.map((sector) => {
              const isUrban = URBAN_SECTORS.has(sector);
              return (
                <li
                  key={sector}
                  className="flex items-center justify-between gap-3 p-3.5 rounded-2xl bg-[#FAF8F4] border border-[#1D1D1F]/8 hover:border-[#F5BA13]/60 transition-colors"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="font-bold text-sm text-[#1D1D1F] truncate">{sector}</span>
                  </div>
                  <span
                    className={`text-[10.5px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full shrink-0 ${
                      isUrban
                        ? 'bg-[#1D1D1F] text-[#F5BA13]'
                        : 'bg-[#FEF3C7] text-[#78350F]'
                    }`}
                  >
                    {isUrban ? 'Urbano' : 'Parcelas'}
                  </span>
                </li>
              );
            })}
          </ul>

          {/* Medios de pago verificados */}
          <div className="p-4 sm:p-5 rounded-2xl bg-[#FFFBEB] border border-[#F5BA13]/35 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <h3 className="text-sm font-black text-[#1D1D1F]">
                Medios de pago disponibles en Frutillar
              </h3>
              <p className="text-xs sm:text-sm text-slate-700">
                Paga online con <strong>Mercado Pago</strong> (crédito, débito Redcompra y prepago) o elige{' '}
                <strong>Pago Contra Entrega</strong> al recibir en tu domicilio: transferencia bancaria, efectivo o máquina POS móvil.
              </p>
            </div>
            <Link
              to="/catalogo"
              className="shrink-0 inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-[#1D1D1F] hover:bg-black text-white hover:text-[#F5BA13] text-xs font-extrabold transition-all"
            >
              <span>Hacer pedido ahora</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </section>

        {/* =============================================================== */}
        {/* 4. PRODUCTOS CON STOCK EN VIVO EN FRUTILLAR                     */}
        {/* =============================================================== */}
        <section aria-labelledby="productos-stock-frutillar" className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="space-y-1.5">
              <span className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-[#B45309]">
                <Sparkles className="w-3.5 h-3.5" />
                Inventario Real Sincronizado
              </span>
              <h2
                id="productos-stock-frutillar"
                className="text-2xl sm:text-3xl font-black text-[#1D1D1F] tracking-tight"
              >
                Alimentos disponibles hoy en Frutillar
              </h2>
              {activeBrands.length > 0 && (
                <p className="text-xs sm:text-sm text-slate-600">
                  Marcas activas en bodega: <strong>{activeBrands.join(', ')}</strong>.
                </p>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Link
                to="/perros"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white hover:bg-[#FEF3C7] border border-[#1D1D1F]/15 text-xs font-extrabold text-[#1D1D1F] transition-colors"
              >
                <Dog className="w-3.5 h-3.5 text-[#D97706]" />
                <span>Perros</span>
              </Link>
              <Link
                to="/gatos"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white hover:bg-[#FEF3C7] border border-[#1D1D1F]/15 text-xs font-extrabold text-[#1D1D1F] transition-colors"
              >
                <Cat className="w-3.5 h-3.5 text-[#D97706]" />
                <span>Gatos</span>
              </Link>
              <Link
                to="/catalogo"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#F5BA13] hover:bg-[#D97706] text-xs font-black text-[#1D1D1F] transition-colors"
              >
                <span>Ver todo el catálogo</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {featuredProducts.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {featuredProducts.map((product) => (
                <DigitalCatalogItemCard
                  key={product.id}
                  product={product}
                  cartItems={cartItems}
                  onAddToCart={onAddToCart}
                  onUpdateQuantity={onUpdateQuantity}
                  onRemoveItem={onRemoveItem}
                  onSelectProduct={onSelectProduct}
                />
              ))}
            </div>
          )}
        </section>

        {/* =============================================================== */}
        {/* 5. PREGUNTAS FRECUENTES AEO FRUTILLAR                           */}
        {/* =============================================================== */}
        <FAQSection
          type="frutillar"
          faqs={FRUTILLAR_FAQS}
          title="Preguntas Frecuentes sobre Despacho de Mascotas en Frutillar"
          subtitle="Todo lo que necesitas saber sobre sectores de cobertura, horarios de lunes a domingo, tarifas de despacho y medios de pago en Frutillar."
        />
      </div>
    </div>
  );
}
