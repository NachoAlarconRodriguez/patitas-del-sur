import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Gift,
  CheckCircle2,
  Copy,
  Check,
  ShieldCheck,
  ArrowRight,
  Loader2,
  User,
  Phone,
  Mail,
  Heart,
  ChevronDown,
} from 'lucide-react';
import { upsertCustomerProfile } from '../services/customersService';

export default function ClubPatitasBanner({ className = '' }) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [countryCode, setCountryCode] = useState('+56');
  const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
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
    setPhone(digitsOnly);
    if (errorMsg) setErrorMsg(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg(null);

    const cleanName = name.trim();
    const cleanEmail = email.trim();
    const cleanPhoneDigits = phone.replace(/\D/g, '');

    if (!cleanName) {
      setErrorMsg('Por favor ingresa tu nombre.');
      return;
    }
    if (cleanPhoneDigits.length !== 9) {
      setErrorMsg('El número de WhatsApp debe tener ni más ni menos que 9 dígitos (ej: 9 1234 5678).');
      return;
    }
    if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      setErrorMsg('Por favor ingresa un correo electrónico válido.');
      return;
    }

    setIsSubmitting(true);

    try {
      const fullPhone = `${countryCode}${cleanPhoneDigits}`;

      // Guardar en la base de datos de clientes
      try {
        await upsertCustomerProfile({
          fullName: cleanName,
          name: cleanName,
          email: cleanEmail,
          phone: fullPhone,
          city: 'Puerto Varas',
          role: 'cliente',
          whatsappNotifications: true,
        });
      } catch (profileErr) {
        console.warn('Customer profile upsert warning:', profileErr);
      }

      // Persistir en sesión local para checkout automático
      try {
        localStorage.setItem('patitas_welcome_coupon', 'CLUBPATITAS10');
        localStorage.setItem(
          'patitas_registered_member',
          JSON.stringify({
            name: cleanName,
            email: cleanEmail,
            phone: fullPhone,
            registeredAt: new Date().toISOString(),
          })
        );
      } catch (storageErr) {
        console.warn('Local storage write warning:', storageErr);
      }

      setIsSuccess(true);
    } catch (err) {
      console.error('Error saving Club Patitas lead:', err);
      setIsSuccess(true); // Brindar el cupón sin bloquear al cliente
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard?.writeText('CLUBPATITAS10');
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  return (
    <section
      aria-label="Invitación al Club Patitas y 10% de descuento de bienvenida"
      className={`relative rounded-3xl overflow-hidden bg-gradient-to-br from-amber-50/70 via-white to-amber-50/30 border border-amber-200/90 shadow-sm text-slate-900 ${className}`}
    >
      <div className="p-6 sm:p-8 md:p-10">
        {isSuccess ? (
          /* PANTALLA DE ÉXITO LUMINOSA Y CÁLIDA */
          <div className="max-w-xl mx-auto text-center space-y-5 py-4 animate-in fade-in zoom-in-95 duration-300">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-bold uppercase tracking-wider">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>¡Membresía Activada!</span>
            </div>

            <h3 className="text-2xl sm:text-3xl font-extrabold text-[#1D1D1F] tracking-tight">
              ¡Bienvenido al Club Patitas, {name}! 🐾
            </h3>

            <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
              Ya dejamos activo tu beneficio para tu primer pedido. Te contactaremos por WhatsApp cuando tu furgón vaya en ruta.
            </p>

            {/* Tarjeta de Cupón Limpia */}
            <div className="p-5 rounded-2xl bg-white border-2 border-dashed border-amber-300 max-w-sm mx-auto space-y-2 shadow-xs">
              <span className="text-[11px] font-bold uppercase tracking-widest text-slate-500 block">
                Tu Cupón de 10% OFF
              </span>
              <div className="flex items-center justify-center gap-3">
                <span className="font-mono text-2xl font-black text-amber-900 tracking-wider">
                  CLUBPATITAS10
                </span>
                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold transition-all active:scale-95 cursor-pointer flex items-center gap-1.5 text-xs shadow-xs"
                >
                  {copiedCode ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>¡Copiado!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copiar</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Enlaces a catálogos */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <a
                href="/perros"
                className="px-5 py-2.5 rounded-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm transition-all active:scale-95 flex items-center gap-1.5"
              >
                <span>Ver Alimento Perros 🐶</span>
                <ArrowRight className="w-4 h-4" />
              </a>
              <a
                href="/gatos"
                className="px-5 py-2.5 rounded-full bg-white hover:bg-slate-100 text-slate-800 font-bold text-xs sm:text-sm border border-slate-300 transition-all active:scale-95 flex items-center gap-1.5"
              >
                <span>Ver Alimento Gatos 🐱</span>
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        ) : (
          /* OPCIÓN A: LAYOUT SPLIT-SCREEN LUMINOSO, FOTO LIMPIA Y SOLO 2 CAMPOS */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
            {/* LADO IZQUIERDO: FOTO DE KIRA & JACK LIMPIA Y SIN DISTRACCIONES (5 cols) */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative group w-full max-w-sm sm:max-w-md rounded-2xl sm:rounded-3xl overflow-hidden border border-amber-200/80 shadow-md bg-white">
                <img
                  src="/images/club_patitas_mascots.jpg"
                  alt="Kira y Jack - Mascotas oficiales de Patitas del Sur"
                  className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-103"
                  loading="lazy"
                />
                <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-white/95 backdrop-blur-sm text-slate-800 text-[11px] font-bold shadow-sm border border-slate-200/80 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  <span>Kira & Jack te esperan</span>
                </div>
              </div>
            </div>

            {/* LADO DERECHO: CONTENIDO CLARO, DIRECTO Y SOLO 2 CAMPOS (7 cols) */}
            <div className="lg:col-span-7 space-y-4 text-center lg:text-left">
              {/* Badge Superior */}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 text-amber-900 border border-amber-500/30 text-xs font-bold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-amber-700" />
                <span>Club Patitas · Beneficio de Bienvenida</span>
              </div>

              {/* Título Principal */}
              <div className="space-y-1.5">
                <h3 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#1D1D1F] tracking-tight leading-tight">
                  Únete al Club Patitas y llévate un <span className="text-amber-700">10% OFF</span>
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed max-w-xl mx-auto lg:mx-0">
                  Ingresa tus datos para enviarte tu cupón de bienvenida y coordinar entregas directas a tu puerta o portón.
                </p>
              </div>

              {/* 3 Micro-Badges de Beneficios */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 pt-0.5">
                <span className="px-2.5 py-1 rounded-lg bg-white border border-amber-200/80 text-slate-700 text-xs font-semibold shadow-2xs flex items-center gap-1.5">
                  🏷️ 10% en tu primera compra
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-white border border-amber-200/80 text-slate-700 text-xs font-semibold shadow-2xs flex items-center gap-1.5">
                  🎂 Regalo en su cumpleaños
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-white border border-amber-200/80 text-slate-700 text-xs font-semibold shadow-2xs flex items-center gap-1.5">
                  🚐 Despacho directo a parcelas
                </span>
              </div>

              {/* Error Message */}
              {errorMsg && (
                <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold text-center lg:text-left">
                  {errorMsg}
                </div>
              )}

              {/* FORMULARIO ULTRA-COMPACTO: NOMBRE, WHATSAPP Y MAIL */}
              <form onSubmit={handleSubmit} className="space-y-3 pt-1">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Campo 1: Nombre */}
                  <div className="space-y-1 text-left">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-amber-700" />
                      <span>Tu Nombre *</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ej. Constanza"
                      value={name}
                      onChange={(e) => {
                        setName(e.target.value);
                        if (errorMsg) setErrorMsg(null);
                      }}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 shadow-2xs transition-all"
                    />
                  </div>

                  {/* Campo 2: WhatsApp con Dropdown +56 y ni más ni menos 9 números */}
                  <div className="space-y-1 text-left">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-emerald-700" />
                        <span>WhatsApp *</span>
                      </label>
                      <span
                        className={`text-[10px] font-bold tracking-tight transition-colors ${
                          phone.length === 9
                            ? 'text-emerald-700'
                            : phone.length > 0
                            ? 'text-amber-800'
                            : 'text-slate-500'
                        }`}
                      >
                        {phone.length === 9 ? '✓ 9 números' : `${phone.length}/9 números`}
                      </span>
                    </div>

                    <div className="relative flex items-center rounded-xl bg-white border border-slate-300 focus-within:border-amber-500 focus-within:ring-2 focus-within:ring-amber-500/20 shadow-2xs transition-all">
                      {/* Lista desplegable diseñada para prefijo (+56 fijo por defecto) */}
                      <div className="relative shrink-0" ref={countryDropdownRef}>
                        <button
                          type="button"
                          onClick={() => setIsCountryDropdownOpen((prev) => !prev)}
                          className="flex items-center gap-1 px-3 py-2.5 text-xs sm:text-sm font-bold text-slate-800 hover:bg-slate-50 rounded-l-xl transition-all cursor-pointer border-r border-slate-200 select-none"
                          title="Seleccionar prefijo de país"
                        >
                          <span>{COUNTRY_CODES.find((c) => c.code === countryCode)?.flag || '🇨🇱'}</span>
                          <span className="font-mono text-slate-900">{countryCode}</span>
                          <ChevronDown
                            className={`w-3.5 h-3.5 text-slate-500 transition-transform duration-200 ${
                              isCountryDropdownOpen ? 'rotate-180' : ''
                            }`}
                          />
                        </button>

                        {/* Menú flotante del selector */}
                        {isCountryDropdownOpen && (
                          <div className="absolute top-full left-0 mt-1.5 w-44 rounded-xl bg-white border border-slate-200 shadow-xl p-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                            <div className="text-[10px] font-black uppercase tracking-wider text-slate-500 px-2.5 py-1">
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
                                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                  countryCode === item.code
                                    ? 'bg-amber-100 text-amber-900 font-extrabold'
                                    : 'text-slate-800 hover:bg-slate-100'
                                }`}
                              >
                                <div className="flex items-center gap-2">
                                  <span>{item.flag}</span>
                                  <span>{item.name}</span>
                                </div>
                                <span className="font-mono text-slate-600 text-[11px]">{item.code}</span>
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
                        placeholder="9 8765 4321"
                        value={phone}
                        onChange={handlePhoneChange}
                        className="w-full px-3 py-2.5 bg-transparent text-slate-900 placeholder-slate-400 text-sm focus:outline-none font-mono tracking-wider"
                      />
                    </div>
                  </div>

                  {/* Campo 3: Mail */}
                  <div className="sm:col-span-2 space-y-1 text-left">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-amber-700" />
                      <span>Tu Mail *</span>
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="Ej. constanza@gmail.com"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (errorMsg) setErrorMsg(null);
                      }}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 shadow-2xs transition-all"
                    />
                  </div>
                </div>

                {/* Botón Principal de Acción Rápida */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto px-8 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-sm transition-all shadow-md shadow-amber-500/20 flex items-center justify-center gap-2 cursor-pointer active:scale-98 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Generando tu 10%...</span>
                    </>
                  ) : (
                    <>
                      <Gift className="w-4 h-4" />
                      <span>Reclamar mi 10% de descuento</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                <div className="flex items-center justify-center lg:justify-start gap-1.5 text-[11px] text-slate-500 pt-0.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Sin contraseñas ni spam. Solo beneficios y avisos de furgón.</span>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
