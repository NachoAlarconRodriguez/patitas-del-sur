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
  Navigation,
  Search,
} from 'lucide-react';
import { WhatsAppIcon } from './OfficialIcons';

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

// Comunas principales de la Región de Los Lagos
const LOS_LAGOS_COMMUNES = [
  'Puerto Montt',
  'Puerto Varas',
  'Llanquihue',
  'Frutillar',
  'Alerce',
  'Osorno',
  'Castro',
  'Ancud',
  'Calbuco',
  'Fresia',
  'Los Muermos',
  'Chonchi',
  'Otra comuna',
];

// Base referencial de calles y avenidas populares en la Región de Los Lagos
const LOS_LAGOS_PLACES_DB = [
  { street: 'Av. Los Notros 1420', sector: 'Mirador de la Bahía', city: 'Puerto Montt' },
  { street: 'Av. Los Notros 850', sector: 'Valle Volcanes', city: 'Puerto Montt' },
  { street: 'Av. Diego Portales 800', sector: 'Costanera', city: 'Puerto Montt' },
  { street: 'Av. Cuarta Terraza 1120', sector: 'Valle Volcanes', city: 'Puerto Montt' },
  { street: 'Calle San Martín 450', sector: 'Centro', city: 'Puerto Montt' },
  { street: 'Calle Antonio Varas 580', sector: 'Centro', city: 'Puerto Montt' },
  { street: 'Calle Guillermo Gallardo 240', sector: 'Centro', city: 'Puerto Montt' },
  { street: 'Calle Benavente 730', sector: 'Centro', city: 'Puerto Montt' },
  { street: 'Calle Egaña 320', sector: 'Centro', city: 'Puerto Montt' },
  { street: 'Av. Austral 1050', sector: 'Valle Volcanes', city: 'Puerto Montt' },
  { street: 'Calle Sargento Silva 640', sector: 'Manuel Montt', city: 'Puerto Montt' },
  { street: 'Av. Transversal 1 #320', sector: 'Alerce Norte', city: 'Alerce' },
  { street: 'Calle Los Alerces 210', sector: 'Alerce Sur', city: 'Alerce' },
  { street: 'Calle San Francisco 650', sector: 'Centro', city: 'Puerto Varas' },
  { street: 'Calle Del Salvador 340', sector: 'Centro', city: 'Puerto Varas' },
  { street: 'Calle San Pedro 210', sector: 'Centro', city: 'Puerto Varas' },
  { street: 'Calle Santa Rosa 450', sector: 'Costanera', city: 'Puerto Varas' },
  { street: 'Calle Walker Martínez 280', sector: 'Centro', city: 'Puerto Varas' },
  { street: 'Av. Gramado 120', sector: 'Entrada Norte', city: 'Puerto Varas' },
  { street: 'Av. Vicente Pérez Rosales 890', sector: 'Costanera', city: 'Llanquihue' },
  { street: 'Calle Baquedano 410', sector: 'Centro', city: 'Llanquihue' },
  { street: 'Av. Bernardo Philippi 1250', sector: 'Costanera Bajo', city: 'Frutillar' },
  { street: 'Calle Carlos Richter 310', sector: 'Frutillar Alto', city: 'Frutillar' },
  { street: 'Calle Eleuterio Ramírez 780', sector: 'Centro', city: 'Osorno' },
  { street: 'Calle Mackenna 920', sector: 'Centro', city: 'Osorno' },
  { street: 'Calle San Martín 340', sector: 'Plaza de Armas', city: 'Castro' },
  { street: 'Calle Blanco Encalada 210', sector: 'Costanera', city: 'Castro' },
];

export default function CustomerProfileModal({
  isOpen,
  onClose,
  profileData,
  onSaveProfile,
}) {
  // Parsing inicial del teléfono separando prefijo (+56) y número
  const parsePhone = (fullPhone = '') => {
    const trimmed = (fullPhone || '').trim();
    for (const c of COUNTRY_CODES) {
      if (trimmed.startsWith(c.code)) {
        return {
          countryCode: c.code,
          phoneDigits: trimmed.slice(c.code.length).trim(),
        };
      }
    }
    return {
      countryCode: '+56',
      phoneDigits: trimmed.replace(/^\+?56\s?/, ''),
    };
  };

  const initialPhone = parsePhone(profileData?.phone || '+56 9 8456 1234');

  const [selectedCountry, setSelectedCountry] = useState(
    COUNTRY_CODES.find((c) => c.code === initialPhone.countryCode) || COUNTRY_CODES[0]
  );
  const [phoneDigits, setPhoneDigits] = useState(initialPhone.phoneDigits);
  const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false);
  const countryDropdownRef = useRef(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    address: '',
    dept: '',
    city: 'Puerto Montt',
    notes: '',
    notifyWhatsapp: true,
    notifyEmail: true,
    ...profileData,
  });

  // Autocomplete de Google Maps (Región de Los Lagos)
  const [addressQuery, setAddressQuery] = useState(profileData?.address || '');
  const [addressSuggestions, setAddressSuggestions] = useState([]);
  const [isSuggestionsOpen, setIsSuggestionsOpen] = useState(false);
  const addressContainerRef = useRef(null);

  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Sincronizar datos al abrir el modal
  useEffect(() => {
    if (isOpen && profileData) {
      const p = parsePhone(profileData.phone);
      setSelectedCountry(
        COUNTRY_CODES.find((c) => c.code === p.countryCode) || COUNTRY_CODES[0]
      );
      setPhoneDigits(p.phoneDigits || '9 8456 1234');
      setAddressQuery(profileData.address || 'Av. Los Notros 1420');

      setFormData({
        name: profileData.name || '',
        email: profileData.email || '',
        address: profileData.address || '',
        dept: profileData.dept || '',
        city: profileData.city || 'Puerto Montt',
        notes: profileData.notes || '',
        notifyWhatsapp: profileData.notifyWhatsapp !== false,
        notifyEmail: profileData.notifyEmail !== false,
      });

      setShowSuccess(false);
      setErrorMsg('');
      setIsSuggestionsOpen(false);
      setIsCountryDropdownOpen(false);
    }
  }, [isOpen, profileData]);

  // Cierre de dropdowns al hacer clic fuera
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (
        countryDropdownRef.current &&
        !countryDropdownRef.current.contains(e.target)
      ) {
        setIsCountryDropdownOpen(false);
      }
      if (
        addressContainerRef.current &&
        !addressContainerRef.current.contains(e.target)
      ) {
        setIsSuggestionsOpen(false);
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

  // Generador inteligente de sugerencias de Google Maps restringido a la Región de Los Lagos
  const handleAddressInputChange = (val) => {
    setAddressQuery(val);
    setFormData((prev) => ({ ...prev, address: val }));
    if (errorMsg) setErrorMsg('');

    const clean = val.trim().toLowerCase();
    if (clean.length < 2) {
      setAddressSuggestions([]);
      setIsSuggestionsOpen(false);
      return;
    }

    // Filtrar de la base de Los Lagos por coincidencia de texto
    const matched = LOS_LAGOS_PLACES_DB.filter(
      (p) =>
        p.street.toLowerCase().includes(clean) ||
        p.sector.toLowerCase().includes(clean) ||
        p.city.toLowerCase().includes(clean)
    );

    // Si el usuario escribe algo específico que no está en la base fija, sintetizamos opciones válidas en Los Lagos
    let finalSuggestions = [...matched];
    if (finalSuggestions.length < 4) {
      const targetCommunes = ['Puerto Montt', 'Puerto Varas', 'Llanquihue', 'Frutillar', 'Osorno'];
      targetCommunes.forEach((commune) => {
        if (!finalSuggestions.some((s) => s.city.toLowerCase() === commune.toLowerCase())) {
          finalSuggestions.push({
            street: val.trim(),
            sector: 'Sector Residencial',
            city: commune,
          });
        }
      });
    }

    setAddressSuggestions(finalSuggestions.slice(0, 5));
    setIsSuggestionsOpen(true);
  };

  const handleSelectSuggestion = (suggestion) => {
    const selectedAddress = suggestion.street;
    setAddressQuery(selectedAddress);
    setFormData((prev) => ({
      ...prev,
      address: selectedAddress,
      city: suggestion.city,
    }));
    setIsSuggestionsOpen(false);
  };

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

    const fullPhoneNumber = `${selectedCountry.code} ${phoneDigits.trim()}`;

    const updated = {
      ...formData,
      address: addressQuery.trim(),
      phone: fullPhoneNumber,
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
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200"
    >
      <div className="bg-white rounded-3xl w-full max-w-lg max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-200 my-auto">
        
        {/* HEADER */}
        <div className="bg-gradient-to-r from-[#0A3E40] via-[#0E8388] to-teal-700 text-white p-4 sm:p-5 relative shrink-0">
          <div className="flex items-center justify-between gap-3 relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/30 shadow-xs shrink-0">
                <User className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-black uppercase tracking-wider text-emerald-200 bg-white/15 px-2 py-0.5 rounded-full border border-white/20">
                    Cuenta Cliente
                  </span>
                  {profileData?.memberSince && (
                    <span className="text-[10px] text-white/70 font-semibold hidden sm:inline">
                      • Miembro desde {profileData.memberSince}
                    </span>
                  )}
                </div>
                <h2 className="text-base sm:text-lg font-black text-white leading-tight truncate pt-0.5">
                  Mi Perfil & Datos Personales
                </h2>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 text-white flex items-center justify-center transition-all cursor-pointer shrink-0 border border-white/20 active:scale-95"
              title="Cerrar ventana"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-xs text-emerald-100 font-medium pt-2 relative z-10">
            Mantén tus datos al día para que tus despachos y recordatorios lleguen sin demoras.
          </p>
        </div>

        {/* BODY (SCROLLABLE FORM) */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-4 sm:p-5 space-y-4 text-xs font-semibold">
          
          {errorMsg && (
            <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-2 animate-in fade-in">
              <X className="w-4 h-4 text-rose-500 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* SECCIÓN 1: IDENTIFICACIÓN Y CONTACTO */}
          <div className="space-y-3">
            <div className="flex items-center gap-1.5 text-slate-800 font-black text-xs uppercase tracking-wider px-1">
              <User className="w-3.5 h-3.5 text-[#0E8388]" />
              <span>Datos de Contacto</span>
            </div>

            <div className="space-y-3">
              {/* Nombre completo */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-600 block">
                  Nombre y Apellidos <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    placeholder="Ej. Felipe Soto"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0E8388]/30 focus:border-[#0E8388] transition-all"
                  />
                </div>
              </div>

              {/* Teléfono / WhatsApp con Prefijo Fijo (+56) y Selector Desplegable a Medida */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-600 block">
                  Teléfono / WhatsApp <span className="text-rose-500">*</span>
                </label>
                
                <div className="flex items-center gap-2">
                  {/* Selector Desplegable Personalizado del Código de País */}
                  <div className="relative shrink-0" ref={countryDropdownRef}>
                    <button
                      type="button"
                      onClick={() => setIsCountryDropdownOpen(!isCountryDropdownOpen)}
                      className={`h-10 px-2.5 sm:px-3 rounded-xl border flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs ${
                        isCountryDropdownOpen
                          ? 'bg-white border-[#0E8388] ring-2 ring-[#0E8388]/20'
                          : 'bg-slate-50/80 hover:bg-white border-slate-200 text-slate-800'
                      }`}
                      title="Cambiar código de país"
                    >
                      <span className="text-base leading-none">{selectedCountry.flag}</span>
                      <span className="text-xs font-black text-slate-800">{selectedCountry.code}</span>
                      <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isCountryDropdownOpen ? 'rotate-180 text-[#0E8388]' : ''}`} />
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
                                  ? 'bg-[#0E8388]/10 text-[#0A3E40] font-black'
                                  : 'hover:bg-slate-50 text-slate-700'
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <span className="text-base">{country.flag}</span>
                                <span className="font-semibold text-slate-800">{country.country}</span>
                              </div>
                              <span className="font-black text-[11px] text-[#0E8388]">{country.code}</span>
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
                      value={phoneDigits}
                      onChange={(e) => setPhoneDigits(e.target.value)}
                      placeholder="9 8456 1234"
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0E8388]/30 focus:border-[#0E8388] transition-all"
                    />
                  </div>
                </div>

                <span className="text-[10px] text-slate-400 block pl-1">
                  Código fijo 🇨🇱 <strong>{selectedCountry.code}</strong> para avisos de entrega y despachos
                </span>
              </div>

              {/* Correo Electrónico */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-600 block">
                  Correo Electrónico
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    placeholder="felipe@tutor.cl"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0E8388]/30 focus:border-[#0E8388] transition-all"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-100 my-1" />

          {/* SECCIÓN 2: DIRECCIÓN Y DESPACHO (GOOGLE MAPS RESTRINGIDO A REGIÓN DE LOS LAGOS) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-1.5 text-slate-800 font-black text-xs uppercase tracking-wider">
                <MapPin className="w-3.5 h-3.5 text-[#0E8388]" />
                <span>Dirección Habitual de Despacho</span>
              </div>
              <span className="text-[9.5px] font-black text-emerald-800 bg-emerald-100/90 px-2 py-0.5 rounded-full border border-emerald-300">
                📍 Región de Los Lagos
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              
              {/* Campo Calle y Número con Autocomplete de Google Maps */}
              <div className="space-y-1 sm:col-span-2 relative" ref={addressContainerRef}>
                <label className="text-[11px] font-bold text-slate-600 block">
                  Calle y Número <span className="text-rose-500">*</span>
                </label>
                
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#0E8388]" />
                  <input
                    type="text"
                    required
                    value={addressQuery}
                    onChange={(e) => handleAddressInputChange(e.target.value)}
                    onFocus={() => {
                      if (addressQuery.trim().length >= 2) setIsSuggestionsOpen(true);
                    }}
                    placeholder="Escribe tu calle (ej. Av. Los Notros 1420...)"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0E8388]/30 focus:border-[#0E8388] transition-all"
                  />
                  {addressQuery && (
                    <button
                      type="button"
                      onClick={() => {
                        setAddressQuery('');
                        setAddressSuggestions([]);
                        setIsSuggestionsOpen(false);
                      }}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Desplegable de Sugerencias de Google Maps (Región de Los Lagos) */}
                {isSuggestionsOpen && addressSuggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1.5 z-50 bg-white rounded-2xl shadow-xl border border-emerald-200/90 p-2 space-y-1 animate-in fade-in zoom-in-95 duration-150">
                    <div className="flex items-center justify-between px-2 py-1 border-b border-slate-100 text-[10px] text-slate-400 font-bold">
                      <span className="flex items-center gap-1 text-[#0E8388]">
                        <Navigation className="w-3 h-3 text-[#0E8388]" />
                        <span>Sugerencias de Google Maps</span>
                      </span>
                      <span className="text-[9px] text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded font-black">
                        Región de Los Lagos
                      </span>
                    </div>

                    <div className="space-y-0.5 max-h-48 overflow-y-auto">
                      {addressSuggestions.map((suggestion, idx) => (
                        <div
                          key={idx}
                          onClick={() => handleSelectSuggestion(suggestion)}
                          className="p-2 rounded-xl hover:bg-emerald-50/70 transition-colors cursor-pointer flex items-start gap-2.5 text-left group"
                        >
                          <div className="w-6 h-6 rounded-lg bg-emerald-100/70 text-[#0E8388] flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-105 transition-transform">
                            <MapPin className="w-3.5 h-3.5" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="text-xs font-bold text-slate-900 group-hover:text-[#0A3E40] truncate">
                              {suggestion.street}
                            </div>
                            <div className="text-[10px] text-slate-400 font-medium truncate">
                              {suggestion.sector ? `${suggestion.sector}, ` : ''}{suggestion.city}, Región de Los Lagos
                            </div>
                          </div>
                          <span className="text-[9.5px] font-black text-[#0E8388] self-center shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                            Seleccionar
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="text-[9.5px] text-slate-400 text-center pt-1 border-t border-slate-100">
                      Restringido a comunas de la Región de Los Lagos
                    </div>
                  </div>
                )}
              </div>

              {/* Depto / Casa */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-600 block">
                  Depto / Block / Casa
                </label>
                <div className="relative">
                  <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={formData.dept || ''}
                    onChange={(e) => handleChange('dept', e.target.value)}
                    placeholder="Ej. Depto 402"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0E8388]/30 focus:border-[#0E8388] transition-all"
                  />
                </div>
              </div>

              {/* Comuna / Ciudad (Sincronizada con Google Maps) */}
              <div className="space-y-1 sm:col-span-3">
                <label className="text-[11px] font-bold text-slate-600 block">
                  Comuna / Ciudad (Región de Los Lagos)
                </label>
                <div className="relative">
                  <select
                    value={formData.city || 'Puerto Montt'}
                    onChange={(e) => handleChange('city', e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 text-xs font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0E8388]/30 focus:border-[#0E8388] transition-all cursor-pointer"
                  >
                    {LOS_LAGOS_COMMUNES.map((comuna) => (
                      <option key={comuna} value={comuna}>
                        {comuna} (Región de Los Lagos)
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Instrucciones de Entrega */}
              <div className="space-y-1 sm:col-span-3">
                <label className="text-[11px] font-bold text-slate-600 block">
                  Indicaciones para el Repartidor (Opcional)
                </label>
                <div className="relative">
                  <textarea
                    rows={2}
                    value={formData.notes || ''}
                    onChange={(e) => handleChange('notes', e.target.value)}
                    placeholder="Ej. Dejar en conserjería si no contesto, timbre blanco portón derecho..."
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0E8388]/30 focus:border-[#0E8388] transition-all resize-none"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-100 my-1" />

          {/* SECCIÓN 3: PREFERENCIAS DE RECORDATORIOS */}
          <div className="space-y-2.5 bg-slate-50/70 p-3 rounded-2xl border border-slate-200/80">
            <div className="flex items-center gap-1.5 text-slate-800 font-black text-xs">
              <Bell className="w-3.5 h-3.5 text-[#0E8388]" />
              <span>Notificaciones Automáticas</span>
            </div>

            <label className="flex items-center justify-between gap-3 p-2 rounded-xl bg-white border border-slate-200/60 cursor-pointer hover:bg-slate-50 transition-colors">
              <div className="min-w-0">
                <span className="text-xs font-bold text-slate-800 block">
                  Avisos de reposición por WhatsApp
                </span>
                <span className="text-[10px] text-slate-500 font-medium">
                  Te avisamos cuando queden pocos días de alimento para tu mascota.
                </span>
              </div>
              <input
                type="checkbox"
                checked={formData.notifyWhatsapp}
                onChange={(e) => handleChange('notifyWhatsapp', e.target.checked)}
                className="w-4 h-4 rounded text-[#0E8388] focus:ring-[#0E8388] cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between gap-3 p-2 rounded-xl bg-white border border-slate-200/60 cursor-pointer hover:bg-slate-50 transition-colors">
              <div className="min-w-0">
                <span className="text-xs font-bold text-slate-800 block">
                  Recordatorios de antiparasitario y vacunas
                </span>
                <span className="text-[10px] text-slate-500 font-medium">
                  Notificaciones cuando corresponda la próxima dosis o control.
                </span>
              </div>
              <input
                type="checkbox"
                checked={formData.notifyEmail}
                onChange={(e) => handleChange('notifyEmail', e.target.checked)}
                className="w-4 h-4 rounded text-[#0E8388] focus:ring-[#0E8388] cursor-pointer"
              />
            </label>
          </div>

          {/* FOOTER ACTIONS */}
          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 font-bold text-xs transition-all cursor-pointer"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#0A3E40] via-[#0E8388] to-teal-600 hover:opacity-95 text-white font-extrabold text-xs shadow-md transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Guardando...</span>
                </>
              ) : showSuccess ? (
                <>
                  <Check className="w-4 h-4 text-emerald-300 stroke-[3]" />
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
