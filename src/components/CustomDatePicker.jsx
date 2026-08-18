import React, { useState, useRef, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight, Cake, Clock } from 'lucide-react';

const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

const WEEKDAY_NAMES = ['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá'];

export default function CustomDatePicker({
  label,
  icon: Icon,
  value,
  onChange,
  placeholder = "Seleccionar fecha...",
  showAgePresets = false,
  showTodayButton = true,
  className = "",
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  // Helper to parse date from Spanish string, ISO string, or Date
  const parseDate = (val) => {
    if (!val) return new Date();
    if (val instanceof Date && !isNaN(val.getTime())) return val;

    const valStr = String(val).trim();

    // Check Spanish string "18 de Agosto 2026"
    const spanishMatch = valStr.match(/(\d{1,2})\s+de\s+([a-zA-ZáéíóúÁÉÍÓÚ]+)\s+(\d{4})/i);
    if (spanishMatch) {
      const day = parseInt(spanishMatch[1], 10);
      const monthName = spanishMatch[2].toLowerCase();
      const year = parseInt(spanishMatch[3], 10);
      const monthIdx = MONTH_NAMES.findIndex(m => m.toLowerCase() === monthName);
      if (monthIdx !== -1) {
        return new Date(year, monthIdx, day);
      }
    }

    // Check ISO "YYYY-MM-DD"
    if (valStr.includes('-')) {
      const parts = valStr.split('-');
      if (parts.length === 3) {
        const y = parseInt(parts[0], 10);
        const m = parseInt(parts[1], 10) - 1;
        const d = parseInt(parts[2], 10);
        if (!isNaN(y) && !isNaN(m) && !isNaN(d)) {
          return new Date(y, m, d);
        }
      }
    }

    // Check DD / MM / YYYY
    if (valStr.includes('/')) {
      const parts = valStr.split('/').map(p => parseInt(p.trim(), 10));
      if (parts.length === 3 && !isNaN(parts[0]) && !isNaN(parts[1]) && !isNaN(parts[2])) {
        return new Date(parts[2], parts[1] - 1, parts[0]);
      }
    }

    const fallback = new Date(valStr);
    return isNaN(fallback.getTime()) ? new Date() : fallback;
  };

  const currentDateObj = parseDate(value);

  // Display text in input
  const getDisplayText = () => {
    if (!value) {
      const today = new Date();
      return `${today.getDate()} de ${MONTH_NAMES[today.getMonth()]} ${today.getFullYear()}`;
    }
    if (String(value).includes('de')) return value;
    const d = parseDate(value);
    return `${d.getDate()} de ${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`;
  };

  const [viewYear, setViewYear] = useState(currentDateObj.getFullYear());
  const [viewMonth, setViewMonth] = useState(currentDateObj.getMonth());

  // Keep view year & month synced when value changes
  useEffect(() => {
    if (value) {
      const d = parseDate(value);
      setViewYear(d.getFullYear());
      setViewMonth(d.getMonth());
    }
  }, [value]);

  // Close calendar on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle escape key
  useEffect(() => {
    function handleKeyDown(event) {
      if (!isOpen) return;
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const daysInMonth = (month, year) => new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = (month, year) => new Date(year, month, 1).getDay();

  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(viewYear - 1);
    } else {
      setViewMonth(viewMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(viewYear + 1);
    } else {
      setViewMonth(viewMonth + 1);
    }
  };

  const emitDateSelection = (d, m, y) => {
    const formattedMonth = String(m + 1).padStart(2, '0');
    const formattedDay = String(d).padStart(2, '0');
    const isoDate = `${y}-${formattedMonth}-${formattedDay}`;
    const spanishDate = `${d} de ${MONTH_NAMES[m]} ${y}`;
    const dateObj = new Date(y, m, d);

    onChange(spanishDate, isoDate, dateObj);
    setIsOpen(false);
  };

  const handleSelectDay = (day) => {
    emitDateSelection(day, viewMonth, viewYear);
  };

  const handleSelectToday = () => {
    const today = new Date();
    setViewYear(today.getFullYear());
    setViewMonth(today.getMonth());
    emitDateSelection(today.getDate(), today.getMonth(), today.getFullYear());
  };

  // Quick Age Preset Selectors (for Pet Birthday)
  const handleQuickAgePreset = (yearsAgo) => {
    const today = new Date();
    const targetYear = today.getFullYear() - yearsAgo;
    setViewYear(targetYear);
    setViewMonth(today.getMonth());
    emitDateSelection(today.getDate(), today.getMonth(), targetYear);
  };

  const totalDays = daysInMonth(viewMonth, viewYear);
  const startDay = firstDayOfWeek(viewMonth, viewYear);

  const currentYearNum = new Date().getFullYear();
  // List of years from current + 1 down 30 years for past dates
  const years = Array.from({ length: 32 }, (_, i) => currentYearNum + 1 - i);

  return (
    <div className={`relative w-full select-none ${className}`} ref={containerRef}>
      {/* Label */}
      {label && (
        <label className="flex items-center gap-1.5 text-slate-700 font-extrabold uppercase tracking-wider text-[11px] mb-1.5 px-0.5">
          {Icon ? <Icon className="w-3.5 h-3.5 text-[#0E8388]" /> : <Clock className="w-3.5 h-3.5 text-[#0E8388]" />}
          <span>{label}</span>
        </label>
      )}

      {/* Trigger Button Capsule */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        className={`w-full px-3.5 py-3 rounded-2xl bg-white border text-left flex items-center justify-between gap-2 transition-all duration-200 cursor-pointer shadow-xs ${
          isOpen
            ? 'border-[#0E8388] ring-4 ring-[#0E8388]/10 bg-white shadow-md'
            : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/70'
        }`}
      >
        <span className="text-xs font-bold text-slate-800 truncate block">
          {getDisplayText()}
        </span>

        <div className={`w-5 h-5 rounded-md flex items-center justify-center transition-all ${isOpen ? 'bg-[#0E8388]/10 text-[#0E8388]' : 'text-slate-400'}`}>
          <Calendar className="w-3.5 h-3.5" />
        </div>
      </button>

      {/* Calendar Dropdown Popup */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 z-50 w-72 sm:w-80 bg-white rounded-3xl p-4 shadow-2xl border border-slate-200 space-y-3.5 animate-in fade-in zoom-in-95 duration-150">
          
          {/* Header Controls: Month & Year Selector */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700 transition-colors cursor-pointer"
              title="Mes anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-1.5 font-black text-slate-900 text-xs sm:text-sm">
              <span>{MONTH_NAMES[viewMonth]}</span>
              <select
                value={viewYear}
                onChange={(e) => setViewYear(parseInt(e.target.value, 10))}
                className="bg-slate-100 hover:bg-slate-200 px-2 py-0.5 rounded-lg text-xs font-black text-[#0E8388] border-none focus:outline-hidden cursor-pointer"
              >
                {years.map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={handleNextMonth}
              className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700 transition-colors cursor-pointer"
              title="Mes siguiente"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Weekday Labels Grid */}
          <div className="grid grid-cols-7 gap-1 text-center font-black text-[10px] text-slate-400 uppercase">
            {WEEKDAY_NAMES.map(w => (
              <div key={w} className="py-0.5">{w}</div>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: startDay }).map((_, i) => (
              <div key={`empty-${i}`} className="h-7.5" />
            ))}

            {Array.from({ length: totalDays }).map((_, i) => {
              const dayNum = i + 1;
              const isSelected =
                currentDateObj.getDate() === dayNum &&
                currentDateObj.getMonth() === viewMonth &&
                currentDateObj.getFullYear() === viewYear;

              const today = new Date();
              const isToday =
                today.getDate() === dayNum &&
                today.getMonth() === viewMonth &&
                today.getFullYear() === viewYear;

              return (
                <button
                  key={dayNum}
                  type="button"
                  onClick={() => handleSelectDay(dayNum)}
                  className={`h-7.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center cursor-pointer ${
                    isSelected
                      ? 'bg-gradient-to-r from-[#0A3E40] to-[#0E8388] text-white font-black shadow-sm'
                      : isToday
                      ? 'bg-emerald-50 text-[#0E8388] border border-[#0E8388]/30 font-black'
                      : 'hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  {dayNum}
                </button>
              );
            })}
          </div>

          {/* Bottom Shortcuts */}
          <div className="border-t border-slate-100 pt-2.5 flex items-center justify-between">
            {showTodayButton && (
              <button
                type="button"
                onClick={handleSelectToday}
                className="w-full py-1.5 px-3 rounded-xl bg-slate-100 hover:bg-[#0E8388]/10 hover:text-[#0E8388] text-xs font-black text-slate-700 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Calendar className="w-3.5 h-3.5 text-[#0E8388]" />
                <span>📅 Hoy (Fecha Actual)</span>
              </button>
            )}
          </div>

          {/* Quick Age Presets (Only when showAgePresets is true) */}
          {showAgePresets && (
            <div className="border-t border-slate-100 pt-2 space-y-1">
              <div className="text-[10px] font-black text-slate-400 uppercase flex items-center gap-1">
                <Cake className="w-3 h-3 text-[#0E8388]" />
                <span>Accesos Rápidos de Edad:</span>
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                <button
                  type="button"
                  onClick={() => handleQuickAgePreset(1)}
                  className="py-1 px-2 rounded-lg bg-slate-100 hover:bg-[#E6F4F1] hover:text-[#0E8388] text-[10px] font-black text-slate-600 transition-all text-center cursor-pointer"
                >
                  1 Año 🎂
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickAgePreset(3)}
                  className="py-1 px-2 rounded-lg bg-slate-100 hover:bg-[#E6F4F1] hover:text-[#0E8388] text-[10px] font-black text-slate-600 transition-all text-center cursor-pointer"
                >
                  3 Años 🎈
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickAgePreset(6)}
                  className="py-1 px-2 rounded-lg bg-slate-100 hover:bg-[#E6F4F1] hover:text-[#0E8388] text-[10px] font-black text-slate-600 transition-all text-center cursor-pointer"
                >
                  6 Años 👑
                </button>
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
}

