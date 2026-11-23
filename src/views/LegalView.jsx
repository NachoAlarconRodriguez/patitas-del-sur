import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { ShieldCheck, FileText, Truck, RotateCcw, ChevronRight, ArrowLeft } from 'lucide-react';
import SEOHead from '../components/SEOHead';
import { getBreadcrumbSchema } from '../utils/schemaGenerators';
import { COMPANY_INFO } from '../constants';

const SECTIONS = [
  {
    id: 'terminos',
    path: '/terminos-y-condiciones',
    title: 'Términos y Condiciones',
    seoTitle: 'Términos y Condiciones de Uso y Venta',
    seoDescription:
      'Términos y condiciones de compra online en www.patitas-delsur.cl (Comercial Kira SpA, RUT 78.493.053-K): precios con IVA, boleta/factura SII y pagos vía Mercado Pago o Contra Entrega en Frutillar.',
    h1: 'Términos y Condiciones de Uso y Venta',
    subtitle:
      'Condiciones generales de contratación, emisión de documentos tributarios SII y medios de pago habilitados en Patitas del Sur.',
    keywords: 'terminos y condiciones patitas del sur, comercial kira spa, compras mascotas frutillar',
    icon: FileText,
    badge: 'Comercio Digital',
  },
  {
    id: 'privacidad',
    path: '/politicas-de-privacidad',
    title: 'Políticas de Privacidad',
    seoTitle: 'Políticas de Privacidad y Protección de Datos (Ley 19.628)',
    seoDescription:
      'Política de privacidad, resguardo de datos personales de clientes y mascotas y ejercicio de derechos ARCO en Patitas del Sur conforme a la Ley N° 19.628 de Chile.',
    h1: 'Políticas de Privacidad y Datos Personales',
    subtitle:
      'Tratamiento confidencial de la información de clientes y mascotas conforme a la Ley N° 19.628 de la República de Chile.',
    keywords: 'politicas de privacidad patitas del sur, ley 19628 proteccion datos chile',
    icon: ShieldCheck,
    badge: 'Ley 19.628',
  },
  {
    id: 'despacho',
    path: '/politicas-de-despacho',
    title: 'Políticas de Despacho',
    seoTitle: 'Políticas de Despacho y Horarios de Entrega en Frutillar',
    seoDescription:
      'Cobertura (~9 km alrededor de Frutillar Alto), ventanas de reparto Lunes a Sábado (10:00–13:00 y 15:30–19:30 hrs), envío gratis desde $25.000 CLP y Pedido Urgente los domingos ($3.500 CLP).',
    h1: 'Políticas de Despacho en Frutillar y Alrededores',
    subtitle:
      'Cobertura operativa en radio aproximado de 9 km alrededor de Frutillar Alto (urbano y parcelaciones), tarifas vigentes y horarios de reparto.',
    keywords: 'politicas despacho patitas del sur, envio alimento mascotas frutillar, despacho domingo frutillar',
    icon: Truck,
    badge: 'Frutillar ~9 km',
  },
  {
    id: 'devoluciones',
    path: '/cambios-y-devoluciones',
    title: 'Garantía y Devoluciones',
    seoTitle: 'Garantía Legal, Cambios y Devoluciones (SERNAC)',
    seoDescription:
      'Política de cambios en 10 días corridos con envase sellado, Garantía de Palatabilidad de 5 días hábiles (mínimo 80% del contenido) y 6 meses de garantía legal SERNAC en Frutillar.',
    h1: 'Garantía Legal, Cambios y Devoluciones',
    subtitle:
      'Derechos del consumidor conforme a la Ley N° 19.496 (SERNAC), cambios de receta sellada y Garantía de Palatabilidad.',
    keywords: 'garantia legal mascotas chile, cambios devoluciones patitas del sur, garantia palatabilidad frutillar',
    icon: RotateCcw,
    badge: 'Garantía SERNAC',
  },
];

export default function LegalView() {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('terminos');

  useEffect(() => {
    const path = location.pathname.toLowerCase();
    if (path.includes('privacidad')) setActiveTab('privacidad');
    else if (path.includes('despacho')) setActiveTab('despacho');
    else if (path.includes('devolucion') || path.includes('cambio')) setActiveTab('devoluciones');
    else setActiveTab('terminos');
  }, [location.pathname]);

  const currentSection = SECTIONS.find((s) => s.id === activeTab) || SECTIONS[0];

  return (
    <div className="pt-28 pb-20 bg-[#FAF9F6] text-slate-900 min-h-screen">
      <SEOHead
        title={currentSection.seoTitle}
        description={currentSection.seoDescription}
        canonical={currentSection.path}
        keywords={currentSection.keywords}
        jsonLd={getBreadcrumbSchema([
          { name: 'Inicio', url: '/' },
          { name: currentSection.title, url: currentSection.path },
        ])}
      />
      <div className="max-w-6xl mx-auto px-6">
        {/* Navigation Breadcrumb */}
        <div className="mb-6 flex items-center gap-2 text-xs font-bold text-slate-500">
          <Link to="/" className="hover:text-[#0E8388] transition-colors flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Inicio</span>
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
          <span className="text-[#0E8388] uppercase tracking-wider">{currentSection.title}</span>
        </div>

        {/* Header (H1 único por ruta legal) */}
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-3">
          <span className="inline-block px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider bg-[#0E8388]/10 text-[#0E8388]">
            Transparencia & Cumplimiento Legal
          </span>
          <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight">
            {currentSection.h1}
          </h1>
          <p className="text-slate-600 text-xs md:text-sm leading-relaxed">
            {currentSection.subtitle}
          </p>
        </div>

        {/* Tab Selection Navigation (Semantic URL Links) */}
        <nav aria-label="Secciones legales" className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10">
          {SECTIONS.map((sec) => {
            const Icon = sec.icon;
            const isActive = activeTab === sec.id;
            return (
              <Link
                key={sec.id}
                to={sec.path}
                aria-current={isActive ? 'page' : undefined}
                className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between space-y-3 ${
                  isActive
                    ? 'bg-gradient-to-br from-[#0A3E40] to-[#0E8388] text-white border-[#0E8388] shadow-lg shadow-[#0E8388]/20 scale-[1.02]'
                    : 'bg-white text-slate-700 border-slate-200 hover:border-[#0E8388]/40 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                      isActive ? 'bg-white/20 text-white' : 'bg-[#0E8388]/10 text-[#0E8388]'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <span
                    className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                      isActive ? 'bg-white/20 text-emerald-200' : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {sec.badge}
                  </span>
                </div>
                <div>
                  <h2 className="font-extrabold text-xs sm:text-sm leading-snug">{sec.title}</h2>
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Content Section Container */}
        <div className="bg-white rounded-3xl p-8 md:p-12 border border-slate-200 shadow-sm leading-relaxed space-y-8 text-sm text-slate-700">
          {/* TAB 1: TÉRMINOS Y CONDICIONES */}
          {activeTab === 'terminos' && (
            <div className="space-y-6 animate-fade-in">
              <div className="border-b border-slate-100 pb-4">
                <span className="text-[10px] font-black text-[#0E8388] uppercase tracking-widest block mb-1">
                  Documento Oficial
                </span>
                <h2 className="text-2xl font-black text-slate-900">
                  Términos y Condiciones Generales de Uso y Venta
                </h2>
                <p className="text-xs text-slate-400 mt-1">Última actualización: Noviembre de 2026</p>
              </div>

              <section className="space-y-3">
                <h3 className="text-base font-bold text-slate-900">1. Identificación del Vendedor</h3>
                <p>
                  El sitio web <strong>www.patitas-delsur.cl</strong> es operado y administrado por <strong>{COMPANY_INFO.legalName}</strong>, Rol Único Tributario (RUT) <strong>{COMPANY_INFO.rut}</strong>, con centro operativo en {COMPANY_INFO.hubAddress}. Todas las compras realizadas a través de la plataforma se rigen por la legislación chilena vigente.
                </p>
              </section>

              <section className="space-y-3">
                <h3 className="text-base font-bold text-slate-900">2. Precios y Moneda</h3>
                <p>
                  Todos los precios publicados en la plataforma están expresados en pesos chilenos (CLP) e incluyen el Impuesto al Valor Agregado (IVA del 19%) aplicable según la legislación tributaria. Los precios informados no incluyen los costos de despacho, los cuales son transparentados y calculados previo a la confirmación de la orden en el paso de checkout.
                </p>
              </section>

              <section className="space-y-3">
                <h3 className="text-base font-bold text-slate-900">3. Boletas y Facturas Electrónicas</h3>
                <p>
                  Por cada transacción completada se emitirá la correspondiente Boleta Electrónica o Factura autorizada por el Servicio de Impuestos Internos (SII), la cual será remitida automáticamente al correo electrónico registrado por el cliente al momento de la compra.
                </p>
              </section>

              <section className="space-y-3">
                <h3 className="text-base font-bold text-slate-900">4. Medios de Pago Habilitados</h3>
                <p>
                  Los usuarios pueden realizar sus compras mediante:
                </p>
                <ul className="list-disc pl-5 space-y-1 text-slate-600">
                  <li><strong>Mercado Pago (Tarjetas de Débito Redcompra, Crédito y Prepago):</strong> Pago online seguro con cifrado bancario de 256 bits y autenticación 3D Secure.</li>
                  <li><strong>Transferencia Bancaria al recibir (Contra Entrega):</strong> A la cuenta vista {COMPANY_INFO.bankTransfer.bank} de {COMPANY_INFO.legalName} (RUT {COMPANY_INFO.rut}), validada al momento de la entrega.</li>
                  <li><strong>Tarjeta Débito / Crédito al recibir (Máquina POS móvil):</strong> Disponible directamente en tu domicilio o parcela en Frutillar.</li>
                  <li><strong>Efectivo contra entrega:</strong> Disponible en toda nuestra zona de despacho en Frutillar y alrededores ({COMPANY_INFO.phoneDisplay}).</li>
                </ul>
              </section>
            </div>
          )}

          {/* TAB 2: POLÍTICAS DE PRIVACIDAD */}
          {activeTab === 'privacidad' && (
            <div className="space-y-6 animate-fade-in">
              <div className="border-b border-slate-100 pb-4">
                <span className="text-[10px] font-black text-[#0E8388] uppercase tracking-widest block mb-1">
                  Protección de Datos Personales
                </span>
                <h2 className="text-2xl font-black text-slate-900">
                  Políticas de Privacidad y Tratamiento de Información
                </h2>
                <p className="text-xs text-slate-400 mt-1">Conforme a la Ley N° 19.628 de la República de Chile</p>
              </div>

              <section className="space-y-3">
                <h3 className="text-base font-bold text-slate-900">1. Compromiso de Confidencialidad</h3>
                <p>
                  En <strong>Patitas del Sur</strong> respetamos rigurosamente la privacidad de nuestros clientes y sus mascotas. Todos los datos ingresados al crear una cuenta o gestionar una orden son tratados con estrictos estándares de confidencialidad y no son vendidos, arrendados ni cedidos a terceros con fines publicitarios ajenos a nuestro servicio.
                </p>
              </section>

              <section className="space-y-3">
                <h3 className="text-base font-bold text-slate-900">2. Finalidad del Tratamiento de Datos</h3>
                <p>Los datos solicitados se emplean exclusivamente para:</p>
                <ul className="list-disc pl-5 space-y-1 text-slate-600">
                  <li>Procesar, preparar y despachar los pedidos a la dirección indicada en Frutillar y alrededores.</li>
                  <li>Calcular la ración diaria y duración estimada del saco de alimento de tu mascota en el portal de tutor.</li>
                  <li>Acumular y acreditar puntos de lealtad en el programa Club Patitas.</li>
                  <li>Remitir avisos importantes respecto al estado de tu despacho o alertas nutricionales relevantes.</li>
                </ul>
              </section>

              <section className="space-y-3">
                <h3 className="text-base font-bold text-slate-900">3. Seguridad Criptográfica de Sesiones</h3>
                <p>
                  Las contraseñas de acceso son procesadas mediante funciones de hash criptográfico de un solo sentido a través de Supabase Auth. Nuestro equipo técnico no tiene acceso ni visibilidad sobre contraseñas en texto plano.
                </p>
              </section>

              <section className="space-y-3">
                <h3 className="text-base font-bold text-slate-900">4. Ejercicio de Derechos ARCO</h3>
                <p>
                  Conforme a la Ley 19.628, el titular de los datos podrá solicitar en cualquier momento el acceso, rectificación, cancelación u oposición al tratamiento de sus datos personales enviando un correo a <strong>{COMPANY_INFO.privacyEmail}</strong>.
                </p>
              </section>
            </div>
          )}

          {/* TAB 3: POLÍTICAS DE DESPACHO */}
          {activeTab === 'despacho' && (
            <div className="space-y-6 animate-fade-in">
              <div className="border-b border-slate-100 pb-4">
                <span className="text-[10px] font-black text-[#0E8388] uppercase tracking-widest block mb-1">
                  Logística Local en Frutillar
                </span>
                <h2 className="text-2xl font-black text-slate-900">
                  Políticas, Tarifas y Horarios de Despacho
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Cobertura propia en un radio aproximado de 9 km alrededor de Frutillar Alto (Región de Los Lagos)
                </p>
              </div>

              <section className="space-y-3">
                <h3 className="text-base font-bold text-slate-900">1. Zona de Cobertura</h3>
                <p>
                  Despachamos directamente con flota propia desde nuestra bodega en <strong>Loteo Espacio Frutillar</strong> hacia domicilios urbanos y parcelaciones en un radio aproximado de <strong>9 km alrededor de Frutillar Alto</strong>:
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 font-bold text-xs text-[#0A3E40]">
                  {COMPANY_INFO.sectors.map((sector) => (
                    <div key={sector} className="p-3 rounded-xl bg-teal-50 border border-teal-200 text-center">
                      📍 {sector}
                    </div>
                  ))}
                </div>
              </section>

              <section className="space-y-3">
                <h3 className="text-base font-bold text-slate-900">2. Tarifas y Envío Gratis</h3>
                <ul className="list-disc pl-5 space-y-1 text-slate-600">
                  <li><strong>Envío Gratis (Lunes a Sábado):</strong> Disponible en compras iguales o superiores a <strong>$25.000 CLP</strong> dentro de las ventanas horarias estándar.</li>
                  <li><strong>Tarifa Estándar (Lunes a Sábado):</strong> <strong>$2.500 CLP</strong> para compras inferiores a $25.000 CLP.</li>
                  <li><strong>Pedido Urgente (Express / Domingos):</strong> Tarifa fija de <strong>$3.500 CLP</strong> (no aplica envío gratis).</li>
                </ul>
              </section>

              <section className="space-y-3">
                <h3 className="text-base font-bold text-slate-900">3. Ventanas Horarias de Entrega</h3>
                <ul className="list-disc pl-5 space-y-1 text-slate-600">
                  <li><strong>Bloque Mañana (Lunes a Sábado):</strong> 10:00 a 13:00 hrs.</li>
                  <li><strong>Bloque Tarde (Lunes a Sábado):</strong> 15:30 a 19:30 hrs.</li>
                  <li><strong>Domingo Urgente:</strong> Domingos de 10:00 a 20:00 hrs, operando exclusivamente bajo modalidad Pedido Urgente ($3.500 CLP).</li>
                </ul>
                <p className="text-xs text-slate-500">
                  Revisa también el detalle por sector en nuestra{' '}
                  <Link to="/despacho/frutillar" className="text-[#0E8388] font-bold underline">
                    Guía de Despacho en Frutillar
                  </Link>.
                </p>
              </section>
            </div>
          )}

          {/* TAB 4: GARANTÍA Y DEVOLUCIONES */}
          {activeTab === 'devoluciones' && (
            <div className="space-y-6 animate-fade-in">
              <div className="border-b border-slate-100 pb-4">
                <span className="text-[10px] font-black text-[#0E8388] uppercase tracking-widest block mb-1">
                  Protección al Consumidor
                </span>
                <h2 className="text-2xl font-black text-slate-900">
                  Garantía Legal, Cambios y Devoluciones
                </h2>
                <p className="text-xs text-slate-400 mt-1">Conforme a la Ley N° 19.496 (SERNAC)</p>
              </div>

              <section className="space-y-3">
                <h3 className="text-base font-bold text-slate-900">1. Garantía Legal de 6 Meses (Ley Pro Consumidor)</h3>
                <p>
                  Si un producto presenta defectos de fábrica, fecha de vencimiento adulterada o no cumple con las condiciones técnicas informadas, el cliente tiene derecho a elegir entre tres alternativas durante los primeros <strong>{COMPANY_INFO.legalWarrantyMonths} meses</strong> desde su recepción:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 font-bold text-xs text-slate-800">
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">1. Cambio inmediato por un producto nuevo idéntico.</div>
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">2. Devolución total del dinero pagado.</div>
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">3. Reparación gratuita (en caso de accesorios o arneses).</div>
                </div>
              </section>

              <section className="space-y-3">
                <h3 className="text-base font-bold text-slate-900">2. Cambios por Receta Sellada (10 Días) y Garantía de Palatabilidad (5 Días)</h3>
                <p>
                  Aceptamos cambios de sabor o formato dentro de los primeros <strong>{COMPANY_INFO.returnPolicyDays} días corridos</strong> desde la recepción siempre que el saco permanezca <strong>100% sellado e intacto</strong>. Adicionalmente, si tu perro o gato no tolera el sabor de una receta recién abierta, nuestra <strong>Garantía de Palatabilidad</strong> permite solicitar el cambio por otra variedad dentro de los primeros <strong>{COMPANY_INFO.palatabilityGuaranteeDays} días hábiles</strong> posteriores a la compra, conservando al menos el <strong>80% de su contenido original</strong> en su envase en óptimas condiciones higiénicas.
                </p>
              </section>

              <section className="space-y-3">
                <h3 className="text-base font-bold text-slate-900">3. Procedimiento para Solicitar un Cambio</h3>
                <p>
                  Para gestionar una solicitud, contacta a nuestro equipo de postventa vía WhatsApp directo (<a href={COMPANY_INFO.whatsappUrl} target="_blank" rel="noopener noreferrer" className="text-[#0E8388] font-bold underline">{COMPANY_INFO.phoneDisplay}</a>) o escribiendo a <strong>{COMPANY_INFO.supportEmail}</strong> indicando tu número de pedido (ej: ORD-20261123-XXXX). Nuestro equipo coordinará el retiro o cambio a domicilio en Frutillar y alrededores.
                </p>
              </section>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
