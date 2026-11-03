import React, { useState, useEffect, useRef } from 'react';
import {
  User,
  Mail,
  MapPin,
  Building,
  Check,
  X,
  Bell,
  ChevronDown,
} from 'lucide-react';
import { WhatsAppIcon } from './OfficialIcons';
import GoogleAddressAutocomplete from './GoogleAddressAutocomplete';
import { ALLOWED_COMMUNES, detectCommuneFromAddress } from '../services/googleMapsService';

// Lista de países con prefijo telefónico
const COUNTRY_CODES = [
  { code: '+56', country: 'Chile', flag: '🇨🇱', mask: '9 1234 5678' },
  { code: '+54', country: 'Argentina', flag: '🇦🇷', mask: '9 11 1234-5678' },
  { code: '+51', country: 'Perú', flag: '🇵🇪', mask: '912 345 678' },
  { code: '+57', country: 'Colombia', flag: '🇨🇴', mask: '300 123 4567' },
  { code: '+52', country: 'México', flag: '🇲🇽', mask: '55 1234 5678' },
  { code: '+1', country: 'EE.UU. / Canadá', flag: '🇺🇸', mask: '(555) 123-4567' },
  { code: '+34', country: 'España', flag: '🇪🇸', mask: '612 34 56 78' },
];

export default function CustomerProfileModal({
  isOpen,
  onClose,
  profileData,
  onSaveProfile,
}) {
  // Formateador estricto para número telefónico chileno en formato "x xxxx xxxx" (9 dígitos)
  const formatChileanPhone = (val) => {
    if (!val) return '';
    let digits = String(val).replace(/\D/g, '');
    if (digits.startsWith('56') && digits.length > 9) {
      digits = digits.slice(2);
    }
    const limited = digits.slice(0, 9);
    if (limited.length <= 1) return limited;
    if (limited.length <= 5) return `${limited.slice(0, 1)} ${limited.slice(1)}`;
    return `${limited.slice(0, 1)} ${limited.slice(1, 5)} ${limited.slice(5)}`;
  };

  // Parsing inicial del teléfono separando prefijo (+56) y número
  const parsePhone = (fullPhone = '') => {
    const trimmed = (fullPhone || '').trim();
    if (trimmed === '+56 9 8456 1234' || trimmed === '9 8456 1234') {
      return { countryCode: '+56', phoneDigits: '' };
    }
    for (const c of COUNTRY_CODES) {
      if (trimmed.startsWith(c.code)) {
        const rawRem = trimmed.slice(c.code.length).trim();
        return {
          countryCode: c.code,
          phoneDigits: c.code === '+56' ? formatChileanPhone(rawRem) : rawRem,
        };
      }
    }
    return {
      countryCode: '+56',
      phoneDigits: formatChileanPhone(trimmed.replace(/^\+?56\s?/, '')),
    };
  };

  const initialPhone = parsePhone(profileData?.phone || '');

  const [selectedCountry, setSelectedCountry] = useState(
    COUNTRY_CODES.find((c) => c.code === initialPhone.countryCode) || COUNTRY_CODES[0]
  );
  const [phoneDigits, setPhoneDigits] = useState(initialPhone.phoneDigits || '');
  const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false);
  const countryDropdownRef = useRef(null);

  const cleanInitialAddress = profileData?.address === 'Av. Los Notros 1420' ? '' : (profileData?.address || '');
  const cleanInitialDept =
    profileData?.dept === 'Depto 402' || profileData?.depto === 'Depto 402'
      ? ''
      : profileData?.dept || profileData?.depto || '';

  const [formData, setFormData] = useState({
    name: profileData?.name || profileData?.full_name || '',
    email: profileData?.email || '',
    address: cleanInitialAddress,
    dept: cleanInitialDept,
    depto: cleanInitialDept,
    city: profileData?.city || '',
    notes: profileData?.notes || profileData?.delivery_reference || profileData?.deliveryReference || '',
    delivery_reference: profileData?.notes || profileData?.delivery_reference || profileData?.deliveryReference || '',
    notifyWhatsapp: profileData?.notifyWhatsapp !== false,
    notifyEmail: profileData?.notifyEmail !== false,
    ...profileData,
    address: cleanInitialAddress,
    dept: cleanInitialDept,
  });

  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Cerrar con Escape (Apple HIG)
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Bloquear scroll de fondo
  useEffect(() => {
    if (!isOpen) return;
    const origOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = origOverflow;
    };
  }, [isOpen]);

  // Sincronizar datos al abrir el modal
  useEffect(() => {
    if (isOpen && profileData) {
      const p = parsePhone(profileData.phone || '');
      setSelectedCountry(
        COUNTRY_CODES.find((c) => c.code === p.countryCode) || COUNTRY_CODES[0]
      );
      setPhoneDigits(p.phoneDigits || '');
      const addr = profileData.address === 'Av. Los Notros 1420' ? '' : (profileData.address || '');
      const deptVal =
        profileData.dept === 'Depto 402' || profileData.depto === 'Depto 402'
          ? ''
          : profileData.dept || profileData.depto || '';

      const notesVal =
        profileData.notes || profileData.delivery_reference || profileData.deliveryReference || '';

      setFormData({
        name: profileData.name || profileData.full_name || '',
        email: profileData.email || '',
        address: addr,
        dept: deptVal,
        depto: deptVal,
        city: profileData.city || '',
        notes: notesVal,
        delivery_reference: notesVal,
        notifyWhatsapp: profileData.notifyWhatsapp !== false,
        notifyEmail: profileData.notifyEmail !== false,
      });

      setShowSuccess(false);
      setErrorMsg('');
      setIsCountryDropdownOpen(false);
    }
  }, [isOpen, profileData]);

  // Cierre de dropdown de país al hacer clic fuera
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (
        countryDropdownRef.current &&
        !countryDropdownRef.current.contains(e.target)
      ) {
        setIsCountryDropdownOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
      document.addEventListener('touchstart', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('touchstart', handleOutsideClick);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errorMsg) setErrorMsg('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      setErrorMsg('Por favor ingresa tu nombre completo.');
      return;
    }
    if (!phoneDigits.trim()) {
      setErrorMsg('Por favor ingresa un número de teléfono o WhatsApp.');
      return;
    }

    if (selectedCountry.code === '+56') {
      const cleanDigits = phoneDigits.replace(/\D/g, '');
      if (cleanDigits.length !== 9) {
        setErrorMsg('El teléfono móvil debe tener exactamente 9 dígitos en formato 9 xxxx xxxx (ni más ni menos).');
        return;
      }
    }

    const fullPhoneNumber = `${selectedCountry.code} ${phoneDigits.trim()}`;

    const cleanDept = (formData.dept || formData.depto || '').trim();
    const cleanNotes = (formData.notes || formData.delivery_reference || '').trim();

    const updated = {
      ...formData,
      address: (formData.address || '').trim(),
      phone: fullPhoneNumber,
      dept: cleanDept,
      depto: cleanDept,
      notes: cleanNotes,
      delivery_reference: cleanNotes,
      deliveryReference: cleanNotes,
      notifyWhatsapp: formData.notifyWhatsapp !== false,
      notifyEmail: formData.notifyEmail !== false,
      whatsappNotifications: formData.notifyWhatsapp !== false,
      whatsapp_notifications: formData.notifyWhatsapp !== false,
      emailNotifications: formData.notifyEmail !== false,
      email_notifications: formData.notifyEmail !== false,
    };

    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setShowSuccess(true);
      if (onSaveProfile) {
        onSaveProfile(updated);
      }
      setTimeout(() => {
        setShowSuccess(false);
        onClose();
      }, 700);
    }, 400);
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 bg-[#1D1D1F]/50 backdrop-blur-sm flex items-center justify-center p-2.5 sm:p-6 overflow-y-auto animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="customer-profile-modal-title"
    >
      <div className="bg-white rounded-3xl w-full max-w-2xl sm:max-w-3xl max-h-[92dvh] flex flex-col shadow-[0_32px_70px_-20px_rgba(29,29,31,0.28)] border border-amber-500/20 overflow-hidden animate-in zoom-in-95 duration-200 my-auto relative">
        
        {/* HEADER VIBRANTE EN COLOR PRINCIPAL PATITAS DEL SUR */}
        <div className="bg-gradient-to-br from-[#F5BA13] via-[#FBBF24] to-[#F59E0B] text-[#1D1D1F] p-4 sm:p-5 relative shrink-0 border-b border-amber-400/40 overflow-hidden">
          {/* Acentos de luz sutil para mayor profundidad visual */}
          <div className="absolute -top-12 -right-12 w-44 h-44 rounded-full bg-white/30 blur-2xl pointer-events-none" />
          <div className="absolute -bottom-8 -left-8 w-36 h-36 rounded-full bg-amber-600/15 blur-xl pointer-events-none" />

          <div className="flex items-center justify-between gap-3 relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-[#1D1D1F] text-[#F5BA13] flex items-center justify-center shadow-md shadow-black/10 shrink-0 border border-black/10">
                <User className="w-5 h-5 text-[#F5BA13]" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h2 id="customer-profile-modal-title" className="text-lg sm:text-xl font-black text-[#1D1D1F] font-heading leading-tight truncate">
                    Mi Perfil
                  </h2>
                  {profileData?.memberSince && (
                    <span className="text-[10px] text-[#1D1D1F]/70 font-semibold bg-black/5 px-2 py-0.5 rounded-full hidden sm:inline">
                      • Miembro desde {profileData.memberSince}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-[#1D1D1F]/10 hover:bg-[#1D1D1F]/20 text-[#1D1D1F] flex items-center justify-center transition-all cursor-pointer shrink-0 border border-[#1D1D1F]/15 active:scale-95"
              title="Cerrar ventana"
              aria-label="Cerrar"
            >
              <X className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>

          <p className="text-xs text-[#1D1D1F]/80 font-medium pt-2 relative z-10">
            Mantén tus datos al día para que tus despachos y recordatorios lleguen sin demoras.
          </p>
        </div>

        {/* BODY (SCROLLABLE FORM) */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-4 sm:p-6 space-y-4 text-xs font-semibold">
          
          {errorMsg && (
            <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-2 animate-in fade-in">
              <X className="w-4 h-4 text-rose-500 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* SECCIÓN 1: IDENTIFICACIÓN Y CONTACTO */}
          <div className="space-y-3">
            <div className="flex items-center gap-1.5 text-slate-800 font-black text-xs uppercase tracking-wider px-1">
              <User className="w-3.5 h-3.5 text-amber-600" />
              <span>Datos de Contacto</span>
            </div>

            <div className="space-y-3">
              {/* Nombre completo */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700 block">
                  Nombre y Apellidos <span className="text-amber-600 font-bold">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    placeholder="Ej. Bárbara Frías"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200/90 bg-slate-50/50 hover:border-slate-300 text-slate-900 text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#F5BA13]/40 focus:border-[#F5BA13] transition-all"
                  />
                </div>
              </div>

              {/* Teléfono / WhatsApp con Selector Desplegable */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700 block">
                  Teléfono / WhatsApp <span className="text-amber-600 font-bold">*</span>
                </label>
                
                <div className="flex items-center gap-2">
                  {/* Selector Desplegable Personalizado del Código de País */}
                  <div className="relative shrink-0" ref={countryDropdownRef}>
                    <button
                      type="button"
                      onClick={() => setIsCountryDropdownOpen(!isCountryDropdownOpen)}
                      className={`h-10 px-2.5 sm:px-3 rounded-xl border flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs ${
                        isCountryDropdownOpen
                          ? 'bg-white border-[#F5BA13] ring-2 ring-[#F5BA13]/25'
                          : 'bg-slate-50/80 hover:bg-white border-slate-200 text-slate-800'
                      }`}
                      title="Cambiar código de país"
                    >
                      <span className="text-base leading-none">{selectedCountry.flag}</span>
                      <span className="text-xs font-black text-slate-800">{selectedCountry.code}</span>
                      <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isCountryDropdownOpen ? 'rotate-180 text-amber-600' : ''}`} />
                    </button>

                    {/* Menú Desplegable Flotante Elegante */}
                    {isCountryDropdownOpen && (
                      <div className="absolute top-full left-0 mt-1.5 z-50 bg-white rounded-2xl shadow-xl border border-slate-200/90 p-1.5 w-56 animate-in fade-in zoom-in-95 duration-150 space-y-0.5">
                        <div className="px-2 py-1 text-[9.5px] font-bold uppercase tracking-wider text-slate-400">
                          Selecciona tu país
                        </div>
                        {COUNTRY_CODES.map((country) => {
                          const isSelected = country.code === selectedCountry.code;
                          return (
                            <div
                              key={country.code}
                              onClick={() => {
                                setSelectedCountry(country);
                                setIsCountryDropdownOpen(false);
                              }}
                              className={`px-2.5 py-1.5 rounded-xl transition-all cursor-pointer flex items-center justify-between text-xs ${
                                isSelected
                                  ? 'bg-amber-500/10 text-amber-950 font-black'
                                  : 'hover:bg-slate-50 text-slate-700'
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <span className="text-base">{country.flag}</span>
                                <span className="font-semibold text-slate-800">{country.country}</span>
                              </div>
                              <span className="font-black text-[11px] text-amber-700">{country.code}</span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Input del Número Telefónico */}
                  <div className="relative flex-1">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center text-slate-400 pointer-events-none">
                      <WhatsAppIcon className="w-4 h-4 text-emerald-600" />
                    </div>
                    <input
                      type="tel"
                      required
                      maxLength={selectedCountry.code === '+56' ? 11 : 16}
                      value={phoneDigits}
                      onChange={(e) => {
                        const val = e.target.value;
                        setPhoneDigits(selectedCountry.code === '+56' ? formatChileanPhone(val) : val);
                        if (errorMsg) setErrorMsg('');
                      }}
                      placeholder={selectedCountry.code === '+56' ? "Ej. 9 8923 4733" : "Ej. 1234 5678"}
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200/90 bg-slate-50/50 hover:border-slate-300 text-slate-900 text-xs font-mono font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#F5BA13]/40 focus:border-[#F5BA13] transition-all"
                    />
                  </div>
                </div>

                <span className="text-[10.5px] text-slate-400 block pl-1">
                  Código fijo <strong>{selectedCountry.code}</strong> para avisos de entrega y despachos prioritarios
                </span>
              </div>

              {/* Correo Electrónico */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700 block">
                  Correo Electrónico
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    placeholder="tu-correo@ejemplo.com"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200/90 bg-slate-50/50 hover:border-slate-300 text-slate-900 text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#F5BA13]/40 focus:border-[#F5BA13] transition-all"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-100 my-1" />

          {/* SECCIÓN 2: DIRECCIÓN Y DESPACHO (GOOGLE MAPS) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-1.5 text-slate-800 font-black text-xs uppercase tracking-wider">
                <MapPin className="w-3.5 h-3.5 text-amber-600" />
                <span>Dirección Habitual de Despacho</span>
              </div>
              <span className="text-[10px] font-bold text-amber-900 bg-amber-100/90 px-2.5 py-0.5 rounded-full border border-amber-300/80 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-amber-600" />
                <span>Región de Los Lagos</span>
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              
              {/* Campo Calle y Número con Autocomplete de Google Maps */}
              <div className="space-y-1 sm:col-span-3">
                <label className="text-[11px] font-bold text-slate-700 block">
                  Calle y Número <span className="text-amber-600 font-bold">*</span>
                </label>
                
                <GoogleAddressAutocomplete
                  value={formData.address || ''}
                  onChange={(val) => {
                    const autoCity = detectCommuneFromAddress(val);
                    setFormData((prev) => ({
                      ...prev,
                      address: val,
                      ...(autoCity ? { city: autoCity } : {}),
                    }));
                    if (errorMsg) setErrorMsg('');
                  }}
                  onSelect={(item) => {
                    const autoCity =
                      item.city ||
                      detectCommuneFromAddress(item.formattedAddress || item.street) ||
                      detectCommuneFromAddress(item.mainText);
                    setFormData((prev) => ({
                      ...prev,
                      address: item.street,
                      city: autoCity || prev.city,
                    }));
                  }}
                  placeholder="Escribe tu calle y número (ej. espacio frutillar parcela 110...)"
                  required
                />
              </div>

              {/* Depto / Casa */}
              <div className="space-y-1 sm:col-span-1">
                <label className="text-[11px] font-bold text-slate-700 block">
                  Depto / Block / Casa
                </label>
                <div className="relative">
                  <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={formData.dept || ''}
                    onChange={(e) => handleChange('dept', e.target.value)}
                    placeholder="Ej. Parcela 115"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200/90 bg-slate-50/50 hover:border-slate-300 text-slate-900 text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#F5BA13]/40 focus:border-[#F5BA13] transition-all"
                  />
                </div>
              </div>

              {/* Comuna / Ciudad */}
              <div className="space-y-1 sm:col-span-2">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-slate-700 block">
                    Comuna / Ciudad (Zona de Despacho)
                  </label>
                  {formData.city && (
                    <span className="text-[9.5px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 rounded-md flex items-center gap-1">
                      <Check className="w-3 h-3 text-emerald-600" /> Auto-detectada
                    </span>
                  )}
                </div>
                <div className="relative">
                  <select
                    value={formData.city || ''}
                    onChange={(e) => handleChange('city', e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200/90 bg-slate-50/50 hover:border-slate-300 text-slate-900 text-xs font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#F5BA13]/40 focus:border-[#F5BA13] transition-all cursor-pointer"
                  >
                    <option value="">Selecciona tu comuna...</option>
                    {ALLOWED_COMMUNES.map((comuna) => (
                      <option key={comuna} value={comuna}>
                        {comuna} (Región de Los Lagos)
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Instrucciones de Entrega */}
              <div className="space-y-1 sm:col-span-3">
                <label className="text-[11px] font-bold text-slate-700 block">
                  Indicaciones para el Repartidor (Opcional)
                </label>
                <div className="relative">
                  <textarea
                    rows={2}
                    value={formData.notes || ''}
                    onChange={(e) => handleChange('notes', e.target.value)}
                    placeholder="Ej. Dejar en conserjería si no contesto, timbre blanco portón derecho..."
                    className="w-full p-2.5 rounded-xl border border-slate-200/90 bg-slate-50/50 hover:border-slate-300 text-slate-900 text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#F5BA13]/40 focus:border-[#F5BA13] transition-all resize-none"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-100 my-1" />

          {/* SECCIÓN 3: PREFERENCIAS DE RECORDATORIOS */}
          <div className="space-y-2.5 bg-amber-50/30 p-3.5 rounded-2xl border border-amber-200/60">
            <div className="flex items-center gap-1.5 text-slate-800 font-black text-xs">
              <Bell className="w-3.5 h-3.5 text-amber-600" />
              <span>Notificaciones Automáticas</span>
            </div>

            <label className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-white border border-amber-200/50 cursor-pointer hover:border-amber-300 transition-colors">
              <div className="min-w-0">
                <span className="text-xs font-bold text-slate-800 block">
                  Avisos de reposición por WhatsApp
                </span>
                <span className="text-[10.5px] text-slate-500 font-medium">
                  Te avisamos cuando queden pocos días de alimento para tu mascota.
                </span>
              </div>
              <input
                type="checkbox"
                checked={formData.notifyWhatsapp}
                onChange={(e) => handleChange('notifyWhatsapp', e.target.checked)}
                className="w-4 h-4 rounded text-amber-600 focus:ring-[#F5BA13] accent-[#F5BA13] cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-white border border-amber-200/50 cursor-pointer hover:border-amber-300 transition-colors">
              <div className="min-w-0">
                <span className="text-xs font-bold text-slate-800 block">
                  Recordatorios de antiparasitario y vacunas
                </span>
                <span className="text-[10.5px] text-slate-500 font-medium">
                  Notificaciones cuando corresponda la próxima dosis o control.
                </span>
              </div>
              <input
                type="checkbox"
                checked={formData.notifyEmail}
                onChange={(e) => handleChange('notifyEmail', e.target.checked)}
                className="w-4 h-4 rounded text-amber-600 focus:ring-[#F5BA13] accent-[#F5BA13] cursor-pointer"
              />
            </label>
          </div>

          {/* FOOTER ACTIONS */}
          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 font-bold text-xs transition-all cursor-pointer active:scale-95"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2.5 rounded-xl bg-[#F5BA13] hover:bg-[#e2aa10] text-[#1D1D1F] font-black text-xs shadow-md shadow-[#F5BA13]/25 transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-[#1D1D1F]/30 border-t-[#1D1D1F] rounded-full animate-spin" />
                  <span>Guardando...</span>
                </>
              ) : showSuccess ? (
                <>
                  <Check className="w-4 h-4 text-emerald-800 stroke-[3]" />
                  <span>¡Guardado con éxito!</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>Guardar Datos</span>
                </>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
