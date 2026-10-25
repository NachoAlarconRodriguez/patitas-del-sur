import React, { useState, useEffect, useRef } from 'react';
import { MapPin, X, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { GoogleMapsIcon } from './OfficialIcons';
import {
  getGooglePlacePredictions,
  getPlaceDetails,
  ALLOWED_COMMUNES,
  detectCommuneFromAddress,
} from '../services/googleMapsService';

/**
 * Google Address Autocomplete Input Component
 * Restricted to Chile and prioritized to Región de Los Lagos (Frutillar, Casma, Fresia, Totoral, Llanquihue, Puerto Varas, Puerto Octay)
 */
export default function GoogleAddressAutocomplete({
  value = '',
  onChange,
  onSelect,
  placeholder = 'Calle y número...',
  required = false,
  className = '',
  disabled = false,
  id = 'google-address-input',
}) {
  const [query, setQuery] = useState(value || '');
  const [predictions, setPredictions] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const containerRef = useRef(null);
  const debounceTimerRef = useRef(null);

  // Sincronizar valor inicial o externo
  useEffect(() => {
    setQuery(value || '');
  }, [value]);

  // Cerrar al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  const handleInputChange = (val) => {
    setQuery(val);
    if (onChange) onChange(val);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (!val || val.trim().length < 2) {
      setPredictions([]);
      setIsOpen(false);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    debounceTimerRef.current = setTimeout(async () => {
      try {
        const results = await getGooglePlacePredictions(val);
        setPredictions(results);
        setIsOpen(results.length > 0);
      } catch (err) {
        console.warn('Error fetching predictions:', err);
      } finally {
        setIsLoading(false);
      }
    }, 280);
  };

  const handleSelectPrediction = async (pred) => {
    setIsLoading(true);
    const initialDetectedCity =
      pred.city ||
      detectCommuneFromAddress(pred.fullAddress || pred.mainText) ||
      'Puerto Varas';

    let selectedData = {
      street: pred.mainText || pred.fullAddress,
      city: initialDetectedCity,
      formattedAddress: pred.fullAddress,
      lat: null,
      lng: null,
      isAllowedZone: pred.isAllowedZone,
    };

    // Intentar traer detalles precisos de número y coordenadas desde Google
    if (pred.placeId && pred.source === 'google') {
      try {
        const details = await getPlaceDetails(pred.placeId);
        if (details) {
          selectedData = {
            ...selectedData,
            street: details.street || selectedData.street,
            city: details.city || selectedData.city,
            formattedAddress: details.formattedAddress || selectedData.formattedAddress,
            lat: details.lat,
            lng: details.lng,
          };
        }
      } catch (e) {
        console.warn('Details lookup error:', e);
      }
    }

    setIsLoading(false);
    setQuery(selectedData.street);
    setIsOpen(false);
    setPredictions([]);

    if (onChange) onChange(selectedData.street);
    if (onSelect) onSelect(selectedData);
  };

  const handleClear = () => {
    setQuery('');
    setPredictions([]);
    setIsOpen(false);
    if (onChange) onChange('');
  };

  return (
    <div className="relative w-full" ref={containerRef}>
      <div className="relative flex items-center">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none flex items-center justify-center">
          <GoogleMapsIcon className="w-4 h-4 shrink-0" />
        </div>

        <input
          id={id}
          type="text"
          value={query}
          required={required}
          disabled={disabled}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={() => {
            if (predictions.length > 0 && query.trim().length >= 2) {
              setIsOpen(true);
            }
          }}
          placeholder={placeholder}
          className={`w-full pl-9 pr-9 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 text-xs font-semibold placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0E8388]/30 focus:border-[#0E8388] transition-all shadow-xs ${className}`}
        />

        <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {isLoading && (
            <Loader2 className="w-4 h-4 text-[#0E8388] animate-spin shrink-0" />
          )}
          {query && !isLoading && (
            <button
              type="button"
              onClick={handleClear}
              className="text-slate-400 hover:text-slate-600 p-0.5 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
              title="Borrar dirección"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Desplegable de sugerencias de Google Maps */}
      {isOpen && predictions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1.5 z-50 bg-white rounded-2xl shadow-xl border border-emerald-200/90 p-2 space-y-1 animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between px-2.5 py-1 border-b border-slate-100 text-[10px] text-slate-500 font-bold">
            <span className="flex items-center gap-1.5 text-slate-700">
              <GoogleMapsIcon className="w-3.5 h-3.5" />
              <span>Direcciones Google Maps</span>
            </span>
            <span className="text-[9px] text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full font-black border border-emerald-200/70">
              Cobertura Los Lagos
            </span>
          </div>

          <div className="space-y-0.5 max-h-56 overflow-y-auto">
            {predictions.map((pred, idx) => {
              const inZone = pred.isAllowedZone;
              return (
                <button
                  key={pred.placeId || idx}
                  type="button"
                  onClick={() => handleSelectPrediction(pred)}
                  className="w-full p-2.5 rounded-xl hover:bg-emerald-50/80 transition-colors cursor-pointer flex items-start gap-2.5 text-left group"
                >
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 transition-transform group-hover:scale-105 ${
                      inZone ? 'bg-emerald-100/80 text-[#0E8388]' : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {inZone ? (
                      <MapPin className="w-4 h-4 text-[#0E8388]" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-amber-500" />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-xs font-bold text-slate-900 group-hover:text-[#0A3E40]">
                        {pred.mainText}
                      </span>
                      {inZone ? (
                        <span className="inline-flex items-center gap-0.5 text-[9px] font-black text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded shrink-0">
                          <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                          <span>{pred.city}</span>
                        </span>
                      ) : (
                        <span className="text-[9px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded shrink-0">
                          Fuera de zona
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-500 font-medium mt-0.5 break-words">
                      {pred.secondaryText || pred.fullAddress}
                    </div>
                  </div>

                  <span className="text-[10px] font-black text-[#0E8388] self-center shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    Seleccionar
                  </span>
                </button>
              );
            })}
          </div>

          <div className="text-[9px] text-slate-400 text-center pt-1 border-t border-slate-100 flex items-center justify-center gap-1">
            <span>Zona oficial de despacho:</span>
            <span className="font-bold text-slate-600">
              {ALLOWED_COMMUNES.join(', ')}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
