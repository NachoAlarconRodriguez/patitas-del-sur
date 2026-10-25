import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, Search, Check } from 'lucide-react';

export const COUNTRY_CODES = [
  { code: '+56', name: 'Chile', flag: '🇨🇱' },
  { code: '+54', name: 'Argentina', flag: '🇦🇷' },
  { code: '+51', name: 'Perú', flag: '🇵🇪' },
  { code: '+57', name: 'Colombia', flag: '🇨🇴' },
  { code: '+1', name: 'Estados Unidos / Canadá', flag: '🇺🇸' },
  { code: '+34', name: 'España', flag: '🇪🇸' },
  { code: '+52', name: 'México', flag: '🇲🇽' },
  { code: '+55', name: 'Brasil', flag: '🇧🇷' },
  { code: '+591', name: 'Bolivia', flag: '🇧🇴' },
  { code: '+598', name: 'Uruguay', flag: '🇺🇾' },
  { code: '+595', name: 'Paraguay', flag: '🇵🇾' },
  { code: '+593', name: 'Ecuador', flag: '🇪🇨' },
  { code: '+58', name: 'Venezuela', flag: '🇻🇪' },
  { code: '+49', name: 'Alemania', flag: '🇩🇪' },
  { code: '+33', name: 'Francia', flag: '🇫🇷' },
  { code: '+44', name: 'Reino Unido', flag: '🇬🇧' },
  { code: '+39', name: 'Italia', flag: '🇮🇹' },
  { code: '+351', name: 'Portugal', flag: '🇵🇹' },
  { code: '+61', name: 'Australia', flag: '🇦🇺' },
  { code: '+64', name: 'Nueva Zelanda', flag: '🇳🇿' },
];

/**
 * Custom Country Code Dropdown with Flag and Search
 * Matches Patitas del Sur design system without using browser native select
 */
export default function CountryCodeDropdown({
  value = '+56',
  onChange,
  disabled = false,
  className = '',
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const triggerRef = useRef(null);
  const menuRef = useRef(null);
  const searchInputRef = useRef(null);
  const [coords, setCoords] = useState(null);

  const selectedCountry = COUNTRY_CODES.find((c) => c.code === value) || COUNTRY_CODES[0];

  const updatePosition = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const openUp = spaceBelow < 260 && rect.top > spaceBelow;

    setCoords({
      top: openUp ? rect.top - 6 : rect.bottom + 6,
      left: rect.left,
      openUp,
    });
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    updatePosition();
    const handleScroll = (e) => {
      if (menuRef.current && menuRef.current.contains(e.target)) return;
      updatePosition();
    };
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', handleScroll, true);
    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', handleScroll, true);
    };
  }, [isOpen, updatePosition]);

  useEffect(() => {
    if (!isOpen) {
      setSearch('');
      return;
    }
    // Auto-focus buscador al abrir
    const timer = setTimeout(() => {
      if (searchInputRef.current) {
        searchInputRef.current.focus();
      }
    }, 50);

    const handleClickOutside = (e) => {
      if (
        triggerRef.current && !triggerRef.current.contains(e.target) &&
        menuRef.current && !menuRef.current.contains(e.target)
      ) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setIsOpen(false);
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      clearTimeout(timer);
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const filteredCountries = COUNTRY_CODES.filter((c) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase().trim();
    return c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q);
  });

  const handleSelect = (code) => {
    if (onChange) onChange(code);
    setIsOpen(false);
  };

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen((prev) => !prev)}
        className={`inline-flex items-center gap-1.5 px-2.5 py-2 bg-slate-50 hover:bg-slate-100 text-slate-800 text-xs font-bold transition-colors cursor-pointer select-none rounded-l-xl shrink-0 focus:outline-none border-r border-slate-200 ${className}`}
        title="Seleccionar país / prefijo telefónico"
      >
        <span className="text-sm leading-none">{selectedCountry.flag}</span>
        <span className="font-mono tracking-tight text-slate-700">{selectedCountry.code}</span>
        <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && coords && createPortal(
        <div
          ref={menuRef}
          style={{
            position: 'fixed',
            top: coords.openUp ? 'auto' : `${coords.top}px`,
            bottom: coords.openUp ? `${window.innerHeight - coords.top}px` : 'auto',
            left: `${Math.max(12, Math.min(coords.left, window.innerWidth - 290))}px`,
            zIndex: 99999,
            width: '280px',
          }}
          className="bg-white rounded-2xl shadow-2xl border border-slate-200/90 p-2 overflow-hidden animate-in fade-in zoom-in-95 duration-150 font-sans"
        >
          {/* Buscador */}
          <div className="relative mb-1.5">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Buscar país o prefijo..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white focus:border-[#0E8388] font-medium"
            />
          </div>

          {/* Lista de países */}
          <div className="max-h-56 overflow-y-auto space-y-0.5 pr-0.5 custom-scrollbar">
            {filteredCountries.length === 0 ? (
              <div className="p-3 text-center text-xs text-slate-400">
                No se encontró ningún país
              </div>
            ) : (
              filteredCountries.map((c) => {
                const isSelected = c.code === value;
                return (
                  <button
                    key={c.code + c.name}
                    type="button"
                    onClick={() => handleSelect(c.code)}
                    className={`w-full px-2.5 py-2 rounded-xl text-left text-xs flex items-center justify-between transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-teal-50 text-[#0E8388] font-bold'
                        : 'text-slate-700 hover:bg-slate-50 font-medium'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span className="text-base leading-none">{c.flag}</span>
                      <span className="truncate">{c.name}</span>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0 ml-2">
                      <span className="font-mono text-slate-500 font-semibold">{c.code}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-[#0E8388]" />}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
