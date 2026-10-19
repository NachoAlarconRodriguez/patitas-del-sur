import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { ShieldCheck, FileText, Truck, RotateCcw, ChevronRight, ArrowLeft } from 'lucide-react';
import SEOHead from '../components/SEOHead';

const SECTIONS = [
  {
    id: 'terminos',
    title: 'Términos y Condiciones',
    icon: FileText,
    badge: 'Comercio Digital',
  },
  {
    id: 'privacidad',
    title: 'Políticas de Privacidad',
    icon: ShieldCheck,
    badge: 'Ley 19.628',
  },
  {
    id: 'despacho',
    title: 'Políticas de Despacho',
    icon: Truck,
    badge: 'Zona Lacustre',
  },
  {
    id: 'devoluciones',
    title: 'Garantía y Devoluciones',
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

  return (
    <div className="pt-28 pb-20 bg-[#FAF9F6] text-slate-900 min-h-screen">
      <SEOHead
        title={
          activeTab === 'privacidad'
            ? 'Políticas de Privacidad (Ley 19.628)'
            : activeTab === 'despacho'
            ? 'Políticas de Despacho y Tiempos de Entrega'
            : activeTab === 'devoluciones'
            ? 'Garantía Legal y Devoluciones SERNAC'
            : 'Términos y Condiciones de Venta'
        }
        description="Marco legal, condiciones de contratación, políticas de despacho lacustre y derechos del consumidor de Patitas del Sur (Comercial Kira SpA, RUT 77.892.451-2)."
        canonical={
          activeTab === 'privacidad'
            ? '/politicas-de-privacidad'
            : activeTab === 'despacho'
            ? '/politicas-de-despacho'
            : activeTab === 'devoluciones'
            ? '/cambios-y-devoluciones'
            : '/terminos-y-condiciones'
        }
        keywords="terminos y condiciones patitas del sur, despacho puerto varas llanquihue, sernac devolucion alimentos mascotas"
      />
      <div className="max-w-6xl mx-auto px-6">
        {/* Navigation Breadcrumb */}
        <div className="mb-6 flex items-center gap-2 text-xs font-bold text-slate-500">
          <Link to="/" className="hover:text-[#0E8388] transition-colors flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Inicio</span>
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
          <span className="text-[#0E8388] uppercase tracking-wider">Centro Legal y Normativo</span>
        </div>

        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-3">
          <span className="inline-block px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider bg-[#0E8388]/10 text-[#0E8388]">
            Transparencia & Cumplimiento Legal
          </span>
          <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight">
            Términos Legales y Políticas 📜
          </h1>
          <p className="text-slate-600 text-xs md:text-sm leading-relaxed">
            Información legal, garantías de compra, privacidad y condiciones de servicio conforme a la legislación de la República de Chile y normativas SERNAC.
          </p>
        </div>

        {/* Tab Selection Navigation */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10">
          {SECTIONS.map((sec) => {
            const Icon = sec.icon;
            const isActive = activeTab === sec.id;
            return (
              <button
                key={sec.id}
                onClick={() => setActiveTab(sec.id)}
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
                  <h3 className="font-extrabold text-xs sm:text-sm leading-snug">{sec.title}</h3>
                </div>
              </button>
            );
          })}
        </div>

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
                <p className="text-xs text-slate-400 mt-1">Última actualización: 19 de Octubre de 2026</p>
              </div>

              <section className="space-y-3">
                <h3 className="text-base font-bold text-slate-900">1. Identificación del Vendedor</h3>
                <p>
                  El sitio web <strong>patitasdelsur.cl</strong> es operado y administrado por <strong>Comercial Kira SpA</strong>, Rol Único Tributario (RUT) <strong>77.892.451-2</strong>, con domicilio legal en Puerto Varas, Región de Los Lagos, Chile. Todas las compras realizadas a través de la plataforma se rigen por la legislación chilena vigente.
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
                  <li><strong>Tarjetas de Débito y Crédito (Webpay Plus):</strong> Transacciones seguras con cifrado bancario y autenticación de 3 factores.</li>
                  <li><strong>Transferencia Bancaria Directa:</strong> A la cuenta corriente bancaria de Comercial Kira SpA, con validación de comprobante en menos de 60 minutos.</li>
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
                  <li>Procesar, preparar y despachar los pedidos a la dirección indicada en la cuenca del lago.</li>
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
                  Conforme a la Ley 19.628, el titular de los datos podrá solicitar en cualquier momento el acceso, rectificación, cancelación u oposición al tratamiento de sus datos personales enviando un correo a <strong>privacidad@patitasdelsur.cl</strong>.
                </p>
              </section>
            </div>
          )}

          {/* TAB 3: POLÍTICAS DE DESPACHO */}
          {activeTab === 'despacho' && (
            <div className="space-y-6 animate-fade-in">
              <div className="border-b border-slate-100 pb-4">
                <span className="text-[10px] font-black text-[#0E8388] uppercase tracking-widest block mb-1">
                  Logística Lacustre
                </span>
                <h2 className="text-2xl font-black text-slate-900">
                  Políticas y Tiempos de Entrega Local
                </h2>
                <p className="text-xs text-slate-400 mt-1">Cobertura directa en la Región de Los Lagos</p>
              </div>

              <section className="space-y-3">
                <h3 className="text-base font-bold text-slate-900">1. Zona de Cobertura</h3>
                <p>
                  Despachamos directamente con flota propia y operadores locales en las comunas de:
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 font-bold text-xs text-[#0A3E40]">
                  <div className="p-3 rounded-xl bg-teal-50 border border-teal-200 text-center">📍 Puerto Varas</div>
                  <div className="p-3 rounded-xl bg-teal-50 border border-teal-200 text-center">📍 Llanquihue</div>
                  <div className="p-3 rounded-xl bg-teal-50 border border-teal-200 text-center">📍 Frutillar</div>
                  <div className="p-3 rounded-xl bg-teal-50 border border-teal-200 text-center">📍 Puerto Montt</div>
                </div>
              </section>

              <section className="space-y-3">
                <h3 className="text-base font-bold text-slate-900">2. Tarifas y Despacho Gratuito</h3>
                <ul className="list-disc pl-5 space-y-1 text-slate-600">
                  <li><strong>Envío Gratis:</strong> En todos los pedidos con un monto igual o superior a <strong>$30.000 CLP</strong>.</li>
                  <li><strong>Tarifa Plana Estándar:</strong> <strong>$3.990 CLP</strong> para compras inferiores al umbral mínimo en todo el radio urbano lacustre.</li>
                </ul>
              </section>

              <section className="space-y-3">
                <h3 className="text-base font-bold text-slate-900">3. Tiempos y Ventanas Horarias de Entrega</h3>
                <p>
                  Los pedidos recibidos antes de las 13:00 hrs son entregados en la <strong>misma jornada (Tarde: 15:00 a 19:00 hrs)</strong>. Las compras realizadas con posterioridad se programan para el siguiente día hábil en la ventana matutina (09:00 a 13:00 hrs) o vespertina.
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
                  Si un producto presenta defectos de fábrica, fecha de vencimiento adulterada o no cumple con las condiciones técnicas informadas, el cliente tiene derecho a elegir entre tres alternativas durante los primeros <strong>6 meses</strong> desde su recepción:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 font-bold text-xs text-slate-800">
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">1. Cambio inmediato por un producto nuevo idéntico.</div>
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">2. Devolución total del dinero pagado.</div>
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">3. Reparación gratuita (en caso de accesorios o arneses).</div>
                </div>
              </section>

              <section className="space-y-3">
                <h3 className="text-base font-bold text-slate-900">2. Garantía de Palatabilidad Patitas del Sur</h3>
                <p>
                  Sabemos que la transición nutricional puede ser exigente. Si a tu perro o gato no le agrada el sabor de una receta de alimento seco recién adquirida, te permitimos solicitar el cambio por otra variedad dentro de los primeros <strong>5 días hábiles</strong> posteriores a la compra, siempre que el saco conserve al menos el <strong>80% de su contenido original</strong> y el envase se encuentre en óptimas condiciones higiénicas.
                </p>
              </section>

              <section className="space-y-3">
                <h3 className="text-base font-bold text-slate-900">3. Procedimiento para Solicitar un Cambio</h3>
                <p>
                  Para gestionar una solicitud, contacta a nuestro equipo de postventa vía WhatsApp directo (+56 9 8765 4321) o escribiendo a <strong>postventa@patitasdelsur.cl</strong> indicando tu número de pedido (ej: `ORD-20261019-XXXX`). Nuestro equipo coordinará el retiro o cambio a domicilio en Puerto Varas o comunas vecinas.
                </p>
              </section>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
