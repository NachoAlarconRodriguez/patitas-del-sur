import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  CalendarPlus,
  Clock,
  BookOpen,
  X,
  Check,
  ChevronLeft,
  ChevronRight,
  Heart,
  Scale
} from 'lucide-react';

// Selector de Fecha Sedoso y Minimalista
function SoftDatePicker({ value, onChange, allowPastDates = false }) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  const parseVal = (valStr) => {
    if (!valStr || !valStr.includes('-')) return new Date();
    const parts = valStr.split('-').map(Number);
    return new Date(parts[0], parts[1] - 1, parts[2]);
  };

  const initialDate = parseVal(value);
  const [viewYear, setViewYear] = useState(initialDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(initialDate.getMonth());

  // Sincronizar año y mes al cambiar value externo
  useEffect(() => {
    const d = parseVal(value);
    setViewYear(d.getFullYear());
    setViewMonth(d.getMonth());
  }, [value]);

  // Cerrar al hacer clic fuera
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
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

  const MONTH_NAMES = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];
  const WEEKDAYS = ['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá'];

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDayIndex = new Date(viewYear, viewMonth, 1).getDay();

  const prevMonthDays = new Date(viewYear, viewMonth, 0).getDate();
  const days = [];
  for (let i = firstDayIndex - 1; i >= 0; i--) {
    days.push({ day: prevMonthDays - i, isCurrentMonth: false, disabled: true });
  }
  for (let i = 1; i <= daysInMonth; i++) {
    const dObj = new Date(viewYear, viewMonth, i);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const isPast = dObj < today;
    days.push({
      day: i,
      isCurrentMonth: true,
      disabled: !allowPastDates && isPast,
      isToday: dObj.getTime() === today.getTime(),
      dateStr: `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`
    });
  }

  const prevMonth = (e) => {
    e.stopPropagation();
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(y => y - 1);
    } else {
      setViewMonth(m => m - 1);
    }
  };

  const nextMonth = (e) => {
    e.stopPropagation();
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(y => y + 1);
    } else {
      setViewMonth(m => m + 1);
    }
  };

  const selectDate = (dateStr, disabled) => {
    if (disabled || !dateStr) return;
    onChange(dateStr);
    setIsOpen(false);
  };

  // Formato amigable en español
  const formatFriendly = (isoStr) => {
    if (!isoStr) return 'Seleccionar fecha';
    try {
      const [y, m, d] = isoStr.split('-').map(Number);
      const dt = new Date(y, m - 1, d);
      return dt.toLocaleDateString('es-CL', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    } catch {
      return isoStr;
    }
  };

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3.5 py-2.5 bg-slate-50/90 border border-slate-200/80 hover:border-slate-300 focus:border-[#0E8388] focus:bg-white focus:ring-3 focus:ring-[#0E8388]/12 rounded-xl text-xs font-bold text-slate-700 flex items-center justify-between transition-all cursor-pointer shadow-2xs group"
      >
        <span className="capitalize">{formatFriendly(value)}</span>
        <Calendar className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#0E8388] transition-colors" />
      </button>

      {/* Popover del Calendario */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 z-50 bg-white rounded-2xl shadow-[0_12px_32px_rgba(10,62,64,0.14),0_2px_8px_rgba(0,0,0,0.06)] border border-slate-200/90 p-3.5 w-64 animate-in fade-in zoom-in-95 duration-150 select-none">
          {/* Header del Calendario */}
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
            <span className="text-xs font-black text-slate-800 capitalize">
              {MONTH_NAMES[viewMonth]} {viewYear}
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={prevMonth}
                className="w-6 h-6 rounded-lg hover:bg-slate-100 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
                title="Mes anterior"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={nextMonth}
                className="w-6 h-6 rounded-lg hover:bg-slate-100 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
                title="Mes siguiente"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Días de la semana */}
          <div className="grid grid-cols-7 gap-1 text-center mb-1">
            {WEEKDAYS.map(w => (
              <span key={w} className="text-[10px] font-bold text-slate-400">
                {w}
              </span>
            ))}
          </div>

          {/* Días del mes */}
          <div className="grid grid-cols-7 gap-1 text-center">
            {days.map((item, idx) => {
              const isSelected = item.dateStr === value;
              return (
                <button
                  key={idx}
                  type="button"
                  disabled={item.disabled || !item.isCurrentMonth}
                  onClick={() => selectDate(item.dateStr, item.disabled)}
                  className={`h-7 w-7 mx-auto rounded-lg text-[11px] font-bold flex items-center justify-center transition-all ${
                    !item.isCurrentMonth
                      ? 'text-slate-300 opacity-30 cursor-default'
                      : item.disabled
                      ? 'text-slate-300 cursor-not-allowed line-through'
                      : isSelected
                      ? 'bg-gradient-to-r from-[#0A3E40] to-[#0E8388] text-white shadow-xs font-black'
                      : item.isToday
                      ? 'bg-teal-50 text-[#0E8388] font-black border border-teal-200'
                      : 'text-slate-700 hover:bg-slate-100 cursor-pointer active:scale-90'
                  }`}
                >
                  {item.day}
                </button>
              );
            })}
          </div>

          {/* Botón rápido "Hoy" */}
          <div className="mt-2.5 pt-2 border-t border-slate-100 flex justify-between items-center text-[10px]">
            <button
              type="button"
              onClick={() => {
                const now = new Date();
                const nowStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
                onChange(nowStr);
                setIsOpen(false);
              }}
              className="font-bold text-[#0E8388] hover:underline cursor-pointer"
            >
              Seleccionar Hoy
            </button>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-slate-600 font-semibold cursor-pointer"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Generador de URL oficial de Google Calendar
const generateGoogleCalendarUrl = ({
  title,
  description,
  location,
  date,
  time = "10:30",
  durationMinutes = 60,
}) => {
  try {
    let year = 2026, month = 1, day = 1;
    if (date && date.includes('-')) {
      const parts = date.split('-').map(Number);
      year = parts[0];
      month = parts[1];
      day = parts[2];
    } else {
      const now = new Date();
      year = now.getFullYear();
      month = now.getMonth() + 1;
      day = now.getDate();
    }

    let hours = 10, minutes = 30;
    if (time && time.includes(':')) {
      const parts = time.split(':').map(Number);
      hours = parts[0] || 10;
      minutes = parts[1] || 30;
    }

    const startLocal = new Date(year, month - 1, day, hours, minutes);
    const endLocal = new Date(startLocal.getTime() + durationMinutes * 60 * 1000);

    const pad = (n) => String(n).padStart(2, '0');
    const toGCalIso = (d) => {
      return `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}00Z`;
    };

    const datesParam = `${toGCalIso(startLocal)}/${toGCalIso(endLocal)}`;

    const params = new URLSearchParams({
      action: 'TEMPLATE',
      text: title || 'Consulta Veterinaria',
      dates: datesParam,
      details: description || '',
      location: location || '',
    });

    return `https://calendar.google.com/calendar/render?${params.toString()}`;
  } catch (err) {
    console.error('Error generating Google Calendar URL:', err);
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}`;
  }
};

export default function VeterinaryConsultationModal({
  isOpen,
  onClose,
  pet,
  onSaveAppointment,
  onSaveHealthLog,
}) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('agendar'); // 'agendar' | 'cuaderno'
  const todayIso = new Date().toISOString().split('T')[0];

  // Opción 1: Agendar Cita
  const [appointmentReason, setAppointmentReason] = useState('');
  const [appointmentDate, setAppointmentDate] = useState(todayIso);
  const [appointmentTime, setAppointmentTime] = useState('10:30');
  const [appointmentVetOrClinic, setAppointmentVetOrClinic] = useState('');

  // Opción 2: Cuaderno de Salud
  const [logDate, setLogDate] = useState(todayIso);
  const [logWeight, setLogWeight] = useState(pet?.weight ? String(pet.weight).replace('kg', '').trim() : '');
  const [logDiagnosis, setLogDiagnosis] = useState('');
  const [logIndications, setLogIndications] = useState('');

  // Redirigir a la pantalla principal del cliente: Mis Mascotas (Imagen 2)
  const handleClose = () => {
    if (onClose) {
      onClose();
    }
    navigate('/mi-cuenta?tab=mascotas', { replace: true });
    window.dispatchEvent(new CustomEvent('patitas_customer_tab_changed', { detail: 'mascotas' }));
    window.dispatchEvent(new CustomEvent('patitas_customer_tab', { detail: 'mascotas' }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Cerrar con Escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') handleClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen || !pet) return null;

  // Enviar Opción 1 (Agendar Consulta)
  const handleAppointmentSubmit = (e, openGoogle = true) => {
    if (e && e.preventDefault) e.preventDefault();

    const reason = appointmentReason.trim() || 'Consulta Veterinaria';
    const title = `🩺 ${pet.name}: ${reason}`;
    const details = `Mascota: ${pet.name}\nMotivo: ${reason}\nLugar / Vet: ${appointmentVetOrClinic || 'Clínica Veterinaria'}\nPatitas del Sur PWA`;

    if (onSaveAppointment) {
      onSaveAppointment({
        id: `apt-${Date.now()}`,
        petId: pet.id,
        title: reason,
        date: appointmentDate,
        time: appointmentTime,
        clinic: appointmentVetOrClinic,
        googleSynced: openGoogle,
      });
    }

    if (openGoogle) {
      const url = generateGoogleCalendarUrl({
        title,
        description: details,
        location: appointmentVetOrClinic,
        date: appointmentDate,
        time: appointmentTime,
      });
      window.open(url, '_blank', 'noopener,noreferrer');
    }

    handleClose();
  };

  // Enviar Opción 2 (Cuaderno de Salud)
  const handleHealthLogSubmit = (e) => {
    if (e && e.preventDefault) e.preventDefault();

    if (onSaveHealthLog) {
      onSaveHealthLog({
        id: `hl-${Date.now()}`,
        petId: pet.id,
        date: logDate,
        title: logDiagnosis ? `Atención: ${logDiagnosis}` : `Consulta de ${pet.name}`,
        weight: logWeight ? `${logWeight} kg` : undefined,
        diagnosis: logDiagnosis,
        indications: logIndications,
      });
    }

    handleClose();
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          handleClose();
        }
      }}
      className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150"
    >
      
      {/* Contenedor Suave y Cálido (Pureza, Confianza y Cariño) */}
      <div className="bg-white rounded-[28px] shadow-[0_20px_50px_rgba(10,62,64,0.16),0_4px_16px_rgba(0,0,0,0.04)] border border-emerald-100/60 w-full max-w-sm sm:max-w-md p-5 sm:p-6 space-y-4 animate-in zoom-in-95 duration-150 select-none">
        
        {/* Header Cálido: Avatar con halo suave y micro-detalle de cariño */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-emerald-50/80 border border-emerald-100/80 flex items-center justify-center text-xl shadow-2xs shrink-0">
              {pet.type === 'gato' ? '🐱' : '🐶'}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-sm sm:text-base font-black text-slate-800 leading-tight">
                  {pet.name}
                </h3>
                <span className="text-xs">{pet.type === 'gato' ? '🐱' : '🐶'}</span>
              </div>
              <div className="text-[11px] text-slate-400 font-medium flex items-center gap-1 pt-0.5">
                <span>Consulta & Salud</span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClose}
            aria-label="Cerrar y volver a Mis Mascotas"
            className="w-9 h-9 rounded-full bg-slate-100/90 hover:bg-slate-200 text-slate-400 hover:text-slate-700 flex items-center justify-center transition-all cursor-pointer active:scale-95 border border-slate-200/80 shadow-2xs"
            title="Cerrar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Pestañas Cápsula Flotantes */}
        <div className="bg-slate-100/70 p-1 rounded-2xl flex gap-1.5">
          <button
            type="button"
            onClick={() => setActiveTab('agendar')}
            className={`flex-1 py-2 rounded-xl text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'agendar'
                ? 'bg-gradient-to-r from-[#0A3E40] to-[#0E8388] text-white font-black shadow-xs'
                : 'text-slate-500 hover:text-slate-800 font-semibold'
            }`}
          >
            <Calendar className={`w-3.5 h-3.5 ${activeTab === 'agendar' ? 'text-white' : 'text-slate-400'}`} />
            <span>Agendar Cita</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('cuaderno')}
            className={`flex-1 py-2 rounded-xl text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'cuaderno'
                ? 'bg-gradient-to-r from-[#0A3E40] to-[#0E8388] text-white font-black shadow-xs'
                : 'text-slate-500 hover:text-slate-800 font-semibold'
            }`}
          >
            <BookOpen className={`w-3.5 h-3.5 ${activeTab === 'cuaderno' ? 'text-white' : 'text-slate-400'}`} />
            <span>Cuaderno</span>
          </button>
        </div>

        {/* ============================================== */}
        {/* OPCIÓN 1: AGENDAR CONSULTA CON GOOGLE CALENDAR */}
        {/* ============================================== */}
        {activeTab === 'agendar' && (
          <form onSubmit={(e) => handleAppointmentSubmit(e, true)} className="space-y-3 pt-1">
            
            {/* Campo 1: Motivo con lenguaje cariñoso */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-500 pl-1">
                ¿Por qué visita al veterinario?
              </label>
              <input
                type="text"
                required
                placeholder="Ej. Chequeo de rutina, vacunas, revisión..."
                value={appointmentReason}
                onChange={(e) => setAppointmentReason(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50/90 border border-slate-200/80 hover:border-slate-300 focus:border-[#0E8388] focus:bg-white focus:ring-3 focus:ring-[#0E8388]/12 rounded-xl text-xs font-bold text-slate-800 focus:outline-none transition-all placeholder:text-slate-400 placeholder:font-normal"
              />
            </div>

            {/* Campo 2: Fecha y Hora (Cápsulas suaves) */}
            <div className="grid grid-cols-2 gap-2.5">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-500 pl-1 flex items-center gap-1">
                  <span>Fecha</span>
                </label>
                <SoftDatePicker
                  value={appointmentDate}
                  onChange={(dateStr) => setAppointmentDate(dateStr)}
                  allowPastDates={false}
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-500 pl-1 flex items-center gap-1">
                  <span>Hora</span>
                </label>
                <input
                  type="time"
                  required
                  value={appointmentTime}
                  onChange={(e) => setAppointmentTime(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50/90 border border-slate-200/80 hover:border-slate-300 focus:border-[#0E8388] focus:bg-white focus:ring-3 focus:ring-[#0E8388]/12 rounded-xl text-xs font-bold text-slate-700 focus:outline-none transition-all"
                />
              </div>
            </div>

            {/* Campo 3: Lugar o Doctor (opcional) */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-500 pl-1">
                Veterinario o clínica (opcional)
              </label>
              <input
                type="text"
                placeholder="Ej. Dr. Morales / Clínica Puerto Varas"
                value={appointmentVetOrClinic}
                onChange={(e) => setAppointmentVetOrClinic(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50/90 border border-slate-200/80 hover:border-slate-300 focus:border-[#0E8388] focus:bg-white focus:ring-3 focus:ring-[#0E8388]/12 rounded-xl text-xs font-medium text-slate-800 focus:outline-none transition-all placeholder:text-slate-400 placeholder:font-normal"
              />
            </div>

            {/* Acciones de Alto Nivel */}
            <div className="pt-2 space-y-1.5 text-center">
              <button
                type="submit"
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#0A3E40] to-[#0E8388] hover:opacity-95 text-white font-black text-xs flex items-center justify-center gap-2 shadow-sm hover:shadow-md transition-all active:scale-[0.98] cursor-pointer"
              >
                <CalendarPlus className="w-4 h-4" />
                <span>Agendar Cita</span>
              </button>

              <button
                type="button"
                onClick={(e) => handleAppointmentSubmit(e, false)}
                className="text-[11px] font-medium text-slate-400 hover:text-slate-600 transition-colors cursor-pointer py-1"
              >
                O guardar solo en la app
              </button>
            </div>

          </form>
        )}

        {/* ============================================== */}
        {/* OPCIÓN 2: CUADERNO DE SALUD & INDICACIONES     */}
        {/* ============================================== */}
        {activeTab === 'cuaderno' && (
          <form onSubmit={handleHealthLogSubmit} className="space-y-3 pt-1">
            
            {/* Campo 1: Fecha y Peso */}
            <div className="grid grid-cols-2 gap-2.5">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-500 pl-1">
                  Fecha
                </label>
                <SoftDatePicker
                  value={logDate}
                  onChange={(dateStr) => setLogDate(dateStr)}
                  allowPastDates={true}
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-500 pl-1 flex items-center gap-1">
                  <span>Peso (kg)</span>
                </label>
                <input
                  type="number"
                  step="0.1"
                  placeholder="8"
                  value={logWeight}
                  onChange={(e) => setLogWeight(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50/90 border border-slate-200/80 hover:border-slate-300 focus:border-[#0E8388] focus:bg-white focus:ring-3 focus:ring-[#0E8388]/12 rounded-xl text-xs font-bold text-slate-800 focus:outline-none transition-all placeholder:text-slate-400 placeholder:font-normal"
                />
              </div>
            </div>

            {/* Campo 2: Diagnóstico o motivo */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-500 pl-1">
                Diagnóstico o motivo
              </label>
              <input
                type="text"
                placeholder="Ej. Control de rutina, oídos limpios, peso ideal..."
                value={logDiagnosis}
                onChange={(e) => setLogDiagnosis(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50/90 border border-slate-200/80 hover:border-slate-300 focus:border-[#0E8388] focus:bg-white focus:ring-3 focus:ring-[#0E8388]/12 rounded-xl text-xs font-medium text-slate-800 focus:outline-none transition-all placeholder:text-slate-400 placeholder:font-normal"
              />
            </div>

            {/* Campo 3: Indicaciones & Receta */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-500 pl-1 flex items-center gap-1.5">
                <span>Indicaciones & Receta</span>
              </label>
              <textarea
                rows={3}
                required
                placeholder="Lo que indicó el doctor: medicamentos, dosis, cuidados o alimento..."
                value={logIndications}
                onChange={(e) => setLogIndications(e.target.value)}
                className="w-full p-3 bg-slate-50/90 border border-slate-200/80 hover:border-slate-300 focus:border-[#0E8388] focus:bg-white focus:ring-3 focus:ring-[#0E8388]/12 rounded-xl text-xs font-medium text-slate-800 focus:outline-none transition-all resize-none leading-relaxed placeholder:text-slate-400 placeholder:font-normal"
              />
            </div>

            {/* Acción Principal */}
            <div className="pt-2 text-center">
              <button
                type="submit"
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#0A3E40] to-[#0E8388] hover:opacity-95 text-white font-black text-xs flex items-center justify-center gap-2 shadow-sm hover:shadow-md transition-all active:scale-[0.98] cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>Guardar Indicaciones</span>
              </button>
            </div>

          </form>
        )}

      </div>
    </div>
  );
}
