import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';

const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

const WEEKDAYS = ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá', 'Do'];

/**
 * Helper to safely parse YYYY-MM-DD or return a fallback date.
 */
function parseISODate(isoStr) {
  if (!isoStr || typeof isoStr !== 'string') return new Date();
  const parts = isoStr.split('-').map(Number);
  if (parts.length === 3 && !isNaN(parts[0]) && !isNaN(parts[1]) && !isNaN(parts[2])) {
    return new Date(parts[0], parts[1] - 1, parts[2]);
  }
  const fallback = new Date(isoStr);
  return isNaN(fallback.getTime()) ? new Date() : fallback;
}

/**
 * Formats a Date object to YYYY-MM-DD string.
 */
function formatToISO(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Formats YYYY-MM-DD to DD/MM/YYYY for friendly Chilean display.
 */
function formatToDisplay(isoStr) {
  if (!isoStr) return '';
  const parts = isoStr.split('-');
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return isoStr;
}

/**
 * Formats user input as DD/MM/YYYY in real time while typing.
 */
function formatTypedDate(raw, prev = '') {
  let digits = (raw || '').replace(/\D/g, '').slice(0, 8);
  const prevDigits = (prev || '').replace(/\D/g, '');

  // If user pressed backspace on a slash, remove the preceding digit
  if (raw.length < prev.length && digits.length === prevDigits.length && digits.length > 0) {
    digits = digits.slice(0, -1);
  }

  if (digits.length === 0) return '';
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
}

/**
 * Validates DD/MM/YYYY and converts to YYYY-MM-DD (ISO).
 * Returns null if invalid or incomplete.
 */
function parseDisplayDateToISO(displayStr) {
  if (!displayStr) return null;
  const parts = displayStr.split('/');
  if (parts.length !== 3) return null;
  const d = parseInt(parts[0], 10);
  const m = parseInt(parts[1], 10);
  const y = parseInt(parts[2], 10);

  if (isNaN(d) || isNaN(m) || isNaN(y)) return null;
  if (y < 1900 || y > 2100) return null;
  if (m < 1 || m > 12) return null;

  const maxDays = new Date(y, m, 0).getDate();
  if (d < 1 || d > maxDays) return null;

  return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

export default function AdminDatePicker({
  value,
  onChange,
  label,
  placeholder = 'DD/MM/AAAA',
  align = 'left',
  presets = false, // true or array like ['today', '+15d', '+30d', '+60d']
  className = '',
  buttonClassName = '',
  disabled = false,
  usePortal = true,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef(null);
  const popoverRef = useRef(null);

  // Synchronized text input value for manual typing (DD/MM/YYYY)
  const [textValue, setTextValue] = useState(() => formatToDisplay(value));

  const selectedDate = parseISODate(value);
  const [viewYear, setViewYear] = useState(selectedDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(selectedDate.getMonth());
  const [portalCoords, setPortalCoords] = useState(null);

  // Keep display text and calendar view in sync when value changes externally
  useEffect(() => {
    setTextValue(formatToDisplay(value));
    if (value) {
      const d = parseISODate(value);
      setViewYear(d.getFullYear());
      setViewMonth(d.getMonth());
    }
  }, [value]);

  // Calculate coordinates for portal popover
  const updatePosition = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const calendarHeight = 320;
    const calendarWidth = 260; // w-64 is 256px
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;

    // Flip upwards if not enough room below but enough room above
    const openUp = spaceBelow < calendarHeight && spaceAbove > spaceBelow;

    const isRight = align === 'right' || rect.left + calendarWidth > window.innerWidth - 12;

    setPortalCoords({
      top: openUp ? undefined : rect.bottom + 6,
      bottom: openUp ? window.innerHeight - rect.top + 6 : undefined,
      left: isRight ? undefined : Math.max(12, rect.left),
      right: isRight ? Math.max(12, window.innerWidth - rect.right) : undefined,
      openUp,
    });
  }, [align]);

  // Position updates and window listeners
  useEffect(() => {
    if (!isOpen) return;
    updatePosition();

    const handleScroll = (e) => {
      if (popoverRef.current && popoverRef.current.contains(e.target)) return;
      updatePosition();
    };

    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', handleScroll, true);
    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', handleScroll, true);
    };
  }, [isOpen, updatePosition]);

  // Click outside listener (respects both trigger input and portal popover)
  useEffect(() => {
    const handleOutsideClick = (e) => {
      const inTrigger = triggerRef.current && triggerRef.current.contains(e.target);
      const inPopover = popoverRef.current && popoverRef.current.contains(e.target);

      if (!inTrigger && !inPopover) {
        setIsOpen(false);
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

  // Escape key listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;
      if (e.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Handles manual keyboard typing into the date input
  const handleTextChange = (e) => {
    const raw = e.target.value;
    const formatted = formatTypedDate(raw, textValue);
    setTextValue(formatted);

    // If a full valid date DD/MM/YYYY has been typed, immediately sync with parent
    const parsedIso = parseDisplayDateToISO(formatted);
    if (parsedIso) {
      if (onChange) onChange(parsedIso);
      const d = parseISODate(parsedIso);
      setViewYear(d.getFullYear());
      setViewMonth(d.getMonth());
    }
  };

  // On blur: revert to previous valid date if user left incomplete input
  const handleTextBlur = () => {
    if (!textValue) {
      if (onChange) onChange('');
      return;
    }
    const parsedIso = parseDisplayDateToISO(textValue);
    if (parsedIso) {
      if (onChange) onChange(parsedIso);
    } else {
      // Revert to current valid value
      setTextValue(formatToDisplay(value));
    }
  };

  const handleInputKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setIsOpen(true);
    } else if (e.key === 'Enter') {
      const parsedIso = parseDisplayDateToISO(textValue);
      if (parsedIso) {
        if (onChange) onChange(parsedIso);
        setIsOpen(false);
      }
    }
  };

  const handlePrevMonth = (e) => {
    e.stopPropagation();
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const handleNextMonth = (e) => {
    e.stopPropagation();
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const handleSelectDate = (dateStr) => {
    setTextValue(formatToDisplay(dateStr));
    if (onChange) onChange(dateStr);
    setIsOpen(false);
  };

  const handleSelectToday = (e) => {
    e.stopPropagation();
    const today = new Date();
    handleSelectDate(formatToISO(today));
  };

  const handleAddDays = (days, e) => {
    e.stopPropagation();
    const base = value ? parseISODate(value) : new Date();
    const target = new Date(base.getTime());
    target.setDate(target.getDate() + days);
    handleSelectDate(formatToISO(target));
  };

  // Calculate calendar grid (Monday first: 0=Lu, 1=Ma... 6=Do)
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const rawFirstDay = new Date(viewYear, viewMonth, 1).getDay();
  // Monday=0, Sunday=6
  const startDayOffset = (rawFirstDay + 6) % 7;
  const prevMonthTotalDays = new Date(viewYear, viewMonth, 0).getDate();

  const todayStr = formatToISO(new Date());

  // Generate grid days
  const gridCells = [];

  // Filler days from previous month
  for (let i = startDayOffset - 1; i >= 0; i--) {
    const dayNum = prevMonthTotalDays - i;
    const prevMonthIdx = viewMonth === 0 ? 11 : viewMonth - 1;
    const prevYearVal = viewMonth === 0 ? viewYear - 1 : viewYear;
    const dateStr = `${prevYearVal}-${String(prevMonthIdx + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
    gridCells.push({
      day: dayNum,
      isCurrentMonth: false,
      dateStr,
    });
  }

  // Days of current month
  for (let i = 1; i <= daysInMonth; i++) {
    const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
    gridCells.push({
      day: i,
      isCurrentMonth: true,
      dateStr,
      isToday: dateStr === todayStr,
      isSelected: dateStr === value,
    });
  }

  // Filler days for next month to complete row of 7
  const remainingCells = (7 - (gridCells.length % 7)) % 7;
  for (let i = 1; i <= remainingCells; i++) {
    const nextMonthIdx = viewMonth === 11 ? 0 : viewMonth + 1;
    const nextYearVal = viewMonth === 11 ? viewYear + 1 : viewYear;
    const dateStr = `${nextYearVal}-${String(nextMonthIdx + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
    gridCells.push({
      day: i,
      isCurrentMonth: false,
      dateStr,
    });
  }

  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 10 }, (_, i) => currentYear - 3 + i);

  // Popover calendar content
  const popoverContent = (
    <div
      ref={popoverRef}
      style={
        usePortal && portalCoords
          ? {
              position: 'fixed',
              top: portalCoords.top !== undefined ? `${portalCoords.top}px` : undefined,
              bottom: portalCoords.bottom !== undefined ? `${portalCoords.bottom}px` : undefined,
              left: portalCoords.left !== undefined ? `${portalCoords.left}px` : undefined,
              right: portalCoords.right !== undefined ? `${portalCoords.right}px` : undefined,
              zIndex: 99999,
            }
          : undefined
      }
      className={`bg-white rounded-2xl p-3 shadow-2xl border border-slate-200/90 w-64 select-none animate-in fade-in zoom-in-95 duration-150 ${
        !usePortal
          ? `absolute ${portalCoords?.openUp ? 'bottom-full mb-1.5' : 'top-full mt-1.5'} z-50 ${
              align === 'right' ? 'right-0' : 'left-0'
            }`
          : ''
      }`}
    >
      {/* Cabecera del mes y año */}
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
        <div className="flex items-center gap-1 font-black text-slate-900 text-xs">
          <span className="capitalize">{MONTH_NAMES[viewMonth]}</span>
          <select
            value={viewYear}
            onChange={(e) => setViewYear(parseInt(e.target.value, 10))}
            className="bg-slate-100 font-bold text-slate-700 text-xs py-0.5 px-1.5 rounded-lg border-none hover:bg-slate-200 focus:outline-none cursor-pointer"
          >
            {yearOptions.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-0.5">
          <button
            type="button"
            onClick={handlePrevMonth}
            className="w-6 h-6 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer"
            title="Mes anterior"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={handleNextMonth}
            className="w-6 h-6 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer"
            title="Mes siguiente"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Días de la semana */}
      <div className="grid grid-cols-7 gap-1 text-center mb-1.5">
        {WEEKDAYS.map((w) => (
          <span key={w} className="text-[10px] font-bold text-slate-400">
            {w}
          </span>
        ))}
      </div>

      {/* Cuadrícula de días */}
      <div className="grid grid-cols-7 gap-1 text-center">
        {gridCells.map((cell, idx) => {
          if (!cell.isCurrentMonth) {
            return (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectDate(cell.dateStr)}
                className="h-6.5 w-6.5 mx-auto rounded-lg text-[10px] font-medium text-slate-300 hover:text-slate-400 hover:bg-slate-50 flex items-center justify-center transition-colors cursor-pointer"
              >
                {cell.day}
              </button>
            );
          }

          return (
            <button
              key={idx}
              type="button"
              onClick={() => handleSelectDate(cell.dateStr)}
              className={`h-6.5 w-6.5 mx-auto rounded-lg text-[11px] font-bold flex items-center justify-center transition-all cursor-pointer ${
                cell.isSelected
                  ? 'bg-gradient-to-r from-[#0E8388] to-[#10B981] text-white shadow-xs font-black'
                  : cell.isToday
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-300 font-black'
                  : 'text-slate-700 hover:bg-slate-100 active:scale-95'
              }`}
            >
              {cell.day}
            </button>
          );
        })}
      </div>

      {/* Accesos rápidos inferiores */}
      <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between gap-1 text-[10px]">
        <button
          type="button"
          onClick={handleSelectToday}
          className="px-2 py-1 rounded-md text-emerald-700 hover:bg-emerald-50 font-bold transition-colors cursor-pointer"
        >
          Hoy
        </button>

        {presets && (
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={(e) => handleAddDays(15, e)}
              className="px-1.5 py-1 rounded-md bg-slate-50 hover:bg-slate-100 text-slate-600 font-semibold transition-colors cursor-pointer"
              title="Vencimiento a 15 días"
            >
              +15d
            </button>
            <button
              type="button"
              onClick={(e) => handleAddDays(30, e)}
              className="px-1.5 py-1 rounded-md bg-slate-50 hover:bg-slate-100 text-slate-600 font-semibold transition-colors cursor-pointer"
              title="Vencimiento estándar a 30 días"
            >
              +30d
            </button>
            <button
              type="button"
              onClick={(e) => handleAddDays(60, e)}
              className="px-1.5 py-1 rounded-md bg-slate-50 hover:bg-slate-100 text-slate-600 font-semibold transition-colors cursor-pointer"
              title="Vencimiento a 60 días"
            >
              +60d
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className={`relative ${className}`}>
      {label && (
        <label className="block text-slate-600 font-bold uppercase text-[10px] mb-1">
          {label}
        </label>
      )}

      {/* Input editable con opción de escribir o seleccionar */}
      <div
        ref={triggerRef}
        className={`relative w-full h-[35px] rounded-xl bg-white border transition-all flex items-center shadow-2xs group ${
          isOpen
            ? 'border-[#0E8388] ring-2 ring-[#0E8388]/20 bg-white'
            : 'border-slate-200 hover:border-slate-300'
        } ${disabled ? 'opacity-50 cursor-not-allowed bg-slate-50' : ''} ${buttonClassName}`}
      >
        <input
          type="text"
          disabled={disabled}
          value={textValue}
          onChange={handleTextChange}
          onBlur={handleTextBlur}
          onKeyDown={handleInputKeyDown}
          placeholder={placeholder}
          maxLength={10}
          className="w-full h-full pl-3 pr-8 rounded-xl bg-transparent font-mono font-bold text-xs text-slate-900 placeholder:text-slate-400 placeholder:font-normal focus:outline-none"
        />

        <button
          type="button"
          disabled={disabled}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsOpen((prev) => !prev);
          }}
          title="Abrir calendario"
          className="absolute right-1 w-7 h-7 rounded-lg text-slate-400 hover:text-[#0E8388] hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer"
        >
          <Calendar
            className={`w-3.5 h-3.5 transition-colors ${
              isOpen ? 'text-[#0E8388]' : 'text-slate-400 group-hover:text-slate-600'
            }`}
          />
        </button>
      </div>

      {/* Popover del Calendario (vía Portal para evitar recortes de overflow) */}
      {isOpen && (usePortal ? createPortal(popoverContent, document.body) : popoverContent)}
    </div>
  );
}
