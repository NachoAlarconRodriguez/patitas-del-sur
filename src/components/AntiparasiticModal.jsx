import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Pill,
  Shield,
  ShieldCheck,
  Calendar,
  Clock,
  Check,
  X,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Bell,
  Sparkles,
  Heart,
  ShoppingBag,
  Star,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

// Formateador de moneda CLP
const formatCLP = (val) => {
  if (typeof val === 'number') {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      maximumFractionDigits: 0,
    }).format(val);
  }
  return val || '';
};

// Formateador amigable de fecha en español
const formatDateSpanish = (isoStr) => {
  if (!isoStr || !isoStr.includes('-')) return isoStr || '';
  try {
    const [y, m, d] = isoStr.split('-').map(Number);
    const dt = new Date(y, m - 1, d);
    return dt.toLocaleDateString('es-CL', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  } catch {
    return isoStr;
  }
};

// Cálculo de la próxima dosis
const computeNextDue = (monthsStr, baseDateIso) => {
  const months = parseInt(monthsStr, 10) || 1;
  let baseDate = new Date();
  if (baseDateIso && baseDateIso.includes('-')) {
    const [y, m, d] = baseDateIso.split('-').map(Number);
    baseDate = new Date(y, m - 1, d);
  }
  const nextDate = new Date(baseDate.getFullYear(), baseDate.getMonth() + months, baseDate.getDate());
  const year = nextDate.getFullYear();
  const month = String(nextDate.getMonth() + 1).padStart(2, '0');
  const day = String(nextDate.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Selector de Fecha Sedoso y Minimalista con Acento Ámbar / Naranjo
function SoftDatePicker({ value, onChange, allowPastDates = true }) {
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

  useEffect(() => {
    const d = parseVal(value);
    setViewYear(d.getFullYear());
    setViewMonth(d.getMonth());
  }, [value]);

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
        className="w-full px-3.5 py-2.5 bg-slate-50/90 border border-slate-200/80 hover:border-amber-300 focus:border-amber-500 focus:bg-white focus:ring-3 focus:ring-amber-500/12 rounded-xl text-xs font-bold text-slate-700 flex items-center justify-between transition-all cursor-pointer shadow-2xs group"
      >
        <span className="capitalize">{formatFriendly(value)}</span>
        <Calendar className="w-3.5 h-3.5 text-slate-400 group-hover:text-amber-600 transition-colors" />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 z-50 bg-white rounded-2xl shadow-[0_12px_32px_rgba(245,158,11,0.18),0_2px_8px_rgba(0,0,0,0.06)] border border-slate-200/90 p-3.5 w-64 animate-in fade-in zoom-in-95 duration-150 select-none">
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

          <div className="grid grid-cols-7 gap-1 text-center mb-1">
            {WEEKDAYS.map(w => (
              <span key={w} className="text-[10px] font-bold text-slate-400">
                {w}
              </span>
            ))}
          </div>

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
                      ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-xs font-black'
                      : item.isToday
                      ? 'bg-amber-50 text-amber-700 font-black border border-amber-300'
                      : 'text-slate-700 hover:bg-amber-50/80 cursor-pointer active:scale-90'
                  }`}
                >
                  {item.day}
                </button>
              );
            })}
          </div>

          <div className="mt-2.5 pt-2 border-t border-slate-100 flex justify-between items-center text-[10px]">
            <button
              type="button"
              onClick={() => {
                const now = new Date();
                const nowStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
                onChange(nowStr);
                setIsOpen(false);
              }}
              className="font-bold text-amber-600 hover:underline cursor-pointer"
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

// DROPDOWN PERSONALIZADO Y FLOTANTE DE PRODUCTOS ANTIPARASITARIOS (Sin select nativo)
function CustomProductDropdown({
  selectedProduct,
  onSelectProduct,
  items = [],
  onSwitchToCustom
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
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

  const activeItem = items.find(i => i.name === selectedProduct) || items[0];

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Botón Disparador Minimalista */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full px-3.5 py-2.5 rounded-xl text-left flex items-center justify-between gap-2 border transition-all cursor-pointer shadow-2xs group ${
          isOpen
            ? 'bg-white border-amber-500 ring-3 ring-amber-500/12'
            : 'bg-slate-50/90 border-slate-200/80 hover:border-amber-300 hover:bg-white'
        }`}
      >
        <div className="flex items-center gap-2 min-w-0 flex-1">
          {activeItem?.isPurchased ? (
            <span className="w-5 h-5 rounded-md bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
              <Star className="w-3 h-3 fill-amber-500 text-amber-600" />
            </span>
          ) : activeItem?.inStore ? (
            <span className="w-5 h-5 rounded-md bg-teal-50 text-[#0E8388] flex items-center justify-center shrink-0">
              <ShoppingBag className="w-3 h-3" />
            </span>
          ) : (
            <span className="w-5 h-5 rounded-md bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
              <Pill className="w-3 h-3" />
            </span>
          )}

          <div className="min-w-0 flex-1">
            <span className="text-xs font-bold text-slate-800 truncate block leading-tight">
              {activeItem?.name || selectedProduct || 'Seleccionar producto...'}
            </span>
            {activeItem?.isPurchased && (
              <span className="text-[10px] font-extrabold text-amber-700 flex items-center gap-1">
                ⭐ Tu compra en tienda {activeItem.orderInfo?.orderDate ? `(${activeItem.orderInfo.orderDate})` : ''}
              </span>
            )}
          </div>
        </div>

        <ChevronDown className={`w-4 h-4 text-slate-400 group-hover:text-amber-600 transition-transform duration-200 shrink-0 ${
          isOpen ? 'rotate-180 text-amber-600' : ''
        }`} />
      </button>

      {/* Popover Flotante de Productos con Diseño Cálido y Sombra Sedosa */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1.5 z-50 bg-white/98 backdrop-blur-md rounded-2xl shadow-[0_16px_40px_rgba(245,158,11,0.22),0_4px_16px_rgba(0,0,0,0.06)] border border-amber-200/90 p-2 max-h-72 overflow-y-auto space-y-1.5 animate-in fade-in zoom-in-95 duration-150">
          
          {items.map((item, idx) => {
            const isSelected = item.name === selectedProduct;
            
            // ÍTEM DESTACADO: Producto comprado previamente por el cliente (Posición 1)
            if (item.isPurchased) {
              return (
                <div
                  key={idx}
                  onClick={() => {
                    onSelectProduct(item);
                    setIsOpen(false);
                  }}
                  className={`relative p-2.5 rounded-xl border-2 transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-gradient-to-r from-amber-100/90 via-orange-100/80 to-amber-50 border-amber-500 shadow-xs'
                      : 'bg-gradient-to-r from-amber-50 via-orange-50/50 to-amber-50/40 border-amber-300 hover:border-amber-400 hover:shadow-2xs'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="inline-flex items-center gap-1 text-[9.5px] font-black uppercase tracking-wide text-amber-900 bg-amber-200/90 border border-amber-300/80 px-2 py-0.5 rounded-full shadow-2xs">
                      <Star className="w-2.5 h-2.5 fill-amber-600 text-amber-700" />
                      Tu compra habitual en tienda
                    </span>
                    {item.orderInfo?.orderId && (
                      <span className="text-[10px] font-bold text-amber-800">
                        Pedido #{item.orderInfo.orderId}
                      </span>
                    )}
                  </div>

                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h4 className="text-xs font-black text-slate-900 leading-tight">
                        {item.name}
                      </h4>
                      <p className="text-[10.5px] font-semibold text-amber-800/90 mt-0.5">
                        {item.tagline || item.format || 'Protección veterinaria recomendada'}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        {item.price && (
                          <span className="text-[11px] font-black text-[#0A3E40] bg-white/90 px-1.5 py-0.5 rounded-md border border-amber-200">
                            {formatCLP(item.price)}
                          </span>
                        )}
                        <span className="text-[10px] font-bold text-amber-900 bg-amber-100/90 px-1.5 py-0.5 rounded-md">
                          Duración: {item.duration === '3' ? '3 Meses (12 sem.)' : `${item.duration} Mes`}
                        </span>
                      </div>
                    </div>

                    <div className="pt-1">
                      {isSelected ? (
                        <div className="w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center shadow-xs">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                      ) : (
                        <div className="w-6 h-6 rounded-full border border-amber-300 flex items-center justify-center text-amber-600 hover:bg-amber-100">
                          <PlusIcon className="w-3.5 h-3.5" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            }

            // Separador si es el primer producto de tienda no comprado
            const isFirstStoreItem = !item.isPurchased && item.inStore && (idx === 0 || items[idx - 1]?.isPurchased);
            const isFirstClinicalItem = !item.inStore && (idx === 0 || items[idx - 1]?.inStore);

            return (
              <React.Fragment key={idx}>
                {isFirstStoreItem && (
                  <div className="px-2 pt-1.5 pb-0.5 flex items-center gap-1.5">
                    <ShoppingBag className="w-3 h-3 text-[#0E8388]" />
                    <span className="text-[10px] font-black tracking-wider uppercase text-slate-400">
                      Disponibles en Tienda Virtual
                    </span>
                  </div>
                )}

                {isFirstClinicalItem && (
                  <div className="px-2 pt-1.5 pb-0.5 flex items-center gap-1.5">
                    <Pill className="w-3 h-3 text-slate-400" />
                    <span className="text-[10px] font-black tracking-wider uppercase text-slate-400">
                      Otras Fórmulas Clínicas
                    </span>
                  </div>
                )}

                <div
                  onClick={() => {
                    onSelectProduct(item);
                    setIsOpen(false);
                  }}
                  className={`p-2 rounded-xl transition-all cursor-pointer flex items-center justify-between gap-2 ${
                    isSelected
                      ? 'bg-amber-50/90 border border-amber-300 text-amber-950 font-black'
                      : 'hover:bg-slate-50 text-slate-700 hover:text-slate-900 border border-transparent'
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold truncate block">
                        {item.name}
                      </span>
                      {item.inStore && (
                        <span className="text-[9px] font-extrabold text-[#0E8388] bg-teal-50 px-1.5 py-0.2 rounded shrink-0">
                          En Tienda
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5 text-[10.5px] text-slate-500 font-medium">
                      {item.price && (
                        <span className="font-black text-[#0A3E40]">{formatCLP(item.price)}</span>
                      )}
                      <span>•</span>
                      <span>{item.duration === '3' ? '3 Meses (12 sem.)' : `${item.duration} Mes`}</span>
                      {item.format && <span>• {item.format}</span>}
                    </div>
                  </div>

                  {isSelected && (
                    <Check className="w-4 h-4 text-amber-600 shrink-0 stroke-[2.5]" />
                  )}
                </div>
              </React.Fragment>
            );
          })}

          {/* Opción al pie para escribir otro producto manual */}
          <div className="pt-1 border-t border-slate-100">
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                if (onSwitchToCustom) onSwitchToCustom();
              }}
              className="w-full py-2 px-2.5 rounded-xl hover:bg-amber-50/80 text-amber-800 text-[11px] font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <span>+ Escribir otro producto o marca manual</span>
            </button>
          </div>

        </div>
      )}
    </div>
  );
}

// DROPDOWN PERSONALIZADO DE DURACIÓN DE PROTECCIÓN (Sin select nativo)
function CustomDurationDropdown({ value, onChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  const OPTIONS = [
    { value: '1', label: '1 Mes (30 días)', desc: 'Masticables y pipetas mensuales' },
    { value: '3', label: '3 Meses (12 sem.)', desc: 'Bravecto / Protección extendida' },
    { value: '6', label: '6 Meses (Semestral)', desc: 'Esquema preventivo semestral' },
  ];

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

  const activeOption = OPTIONS.find(o => o.value === String(value)) || OPTIONS[0];

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full px-3.5 py-2.5 rounded-xl text-left flex items-center justify-between gap-2 border transition-all cursor-pointer shadow-2xs group ${
          isOpen
            ? 'bg-white border-amber-500 ring-3 ring-amber-500/12'
            : 'bg-slate-50/90 border-slate-200/80 hover:border-amber-300 hover:bg-white'
        }`}
      >
        <span className="text-xs font-bold text-slate-800 truncate">
          {activeOption.label}
        </span>
        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 group-hover:text-amber-600 transition-transform duration-200 shrink-0 ${
          isOpen ? 'rotate-180 text-amber-600' : ''
        }`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1.5 z-50 bg-white rounded-2xl shadow-[0_12px_32px_rgba(245,158,11,0.2),0_4px_12px_rgba(0,0,0,0.06)] border border-amber-200/90 p-1.5 space-y-1 animate-in fade-in zoom-in-95 duration-150">
          {OPTIONS.map((opt) => {
            const isSelected = String(value) === opt.value;
            return (
              <div
                key={opt.value}
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
                className={`p-2 rounded-xl transition-all cursor-pointer flex items-center justify-between gap-2 ${
                  isSelected
                    ? 'bg-amber-50 border border-amber-300 text-amber-950 font-black'
                    : 'hover:bg-slate-50 text-slate-700 hover:text-slate-900 border border-transparent'
                }`}
              >
                <div>
                  <div className="text-xs font-bold leading-tight">{opt.label}</div>
                  <div className="text-[10px] text-slate-400 font-medium">{opt.desc}</div>
                </div>
                {isSelected && (
                  <Check className="w-3.5 h-3.5 text-amber-600 stroke-[2.5]" />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// Icono pequeño plus para items
function PlusIcon({ className = 'w-3.5 h-3.5' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19"></line>
      <line x1="5" y1="12" x2="19" y2="12"></line>
    </svg>
  );
}

export default function AntiparasiticModal({
  isOpen,
  onClose,
  pet,
  orders = [],
  storeProducts = [],
  onSaveAntiparasitic,
}) {
  const navigate = useNavigate();
  const todayIso = new Date().toISOString().split('T')[0];

  // Pestañas: 'interno' | 'externo'
  const [activeTab, setActiveTab] = useState('interno');

  // Estado del formulario
  const [adminDate, setAdminDate] = useState(todayIso);
  const [frequencyMonths, setFrequencyMonths] = useState('1'); // '1' | '3' | '6'
  const [selectedProduct, setSelectedProduct] = useState('');
  const [isCustomProduct, setIsCustomProduct] = useState(false);
  const [customProductName, setCustomProductName] = useState('');
  const [notes, setNotes] = useState('');

  // Estado de detección automática de compra
  const [autoDetectedOrder, setAutoDetectedOrder] = useState(null);

  const isCat = pet?.type === 'gato';

  // 1. Detectar si el cliente compró antiparasitarios en pedidos anteriores para esta especie
  const findCustomerAntiparasiticOrder = () => {
    if (!orders || !Array.isArray(orders) || orders.length === 0) return null;
    return orders.find((order) => {
      const cat = (order.category || '').toLowerCase();
      const prod = (order.product || '').toLowerCase();
      const isAntiparasitic = cat.includes('antiparasit') ||
        /nexgard|bravecto|simparica|revolution|drontal|endogard|broadline|frontline/i.test(prod);
      if (!isAntiparasitic) return false;
      if (isCat) {
        return /gato|felin|revolution|plus gatos/i.test(prod);
      } else {
        return /perro|canin|spectra|trio/i.test(prod) || (!/gato|felin/i.test(prod));
      }
    }) || null;
  };

  // 2. Construir lista de productos sugeridos (Tienda + Clínicos) para cada pestaña y especie
  const buildProductList = () => {
    const purchasedOrder = findCustomerAntiparasiticOrder();

    // Productos de la tienda virtual filtrados por especie
    const storeAntiparasitics = (storeProducts || [])
      .filter(p => p.category === 'Antiparasitarios' && (p.petType === (isCat ? 'gatos' : 'perros') || !p.petType))
      .map(p => ({
        id: p.id,
        name: p.name,
        brand: p.brand,
        price: p.price,
        duration: String(p.frequencyMonths || (p.name.includes('12') || p.name.includes('3 Meses') ? '3' : '1')),
        format: p.weights?.[0] || (p.name.includes('Pipeta') ? 'Pipeta tópica' : 'Masticable'),
        tagline: p.tagline,
        inStore: true,
      }));

    // Fórmulas veterinarias clínicas tradicionales
    const clinicalInternal = isCat
      ? [
          { name: 'Drontal Gatos (Comprimido Interno)', duration: '1', format: 'Comprimido', inStore: false },
          { name: 'Total F Felinos (Suspensión Oral)', duration: '1', format: 'Suspensión oral', inStore: false },
          { name: 'Profender Spot-on Gatos (Interno Tópico)', duration: '3', format: 'Pipeta tópica', inStore: false },
        ]
      : [
          { name: 'Drontal Plus Perros (Masticable Palatable)', duration: '1', format: 'Masticable palatable', inStore: false },
          { name: 'Endogard 10 Perros (Comprimido Palatable)', duration: '1', format: 'Comprimido palatable', inStore: false },
          { name: 'Total F Caninos (Suspensión Oral)', duration: '1', format: 'Suspensión oral', inStore: false },
        ];

    const clinicalExternal = isCat
      ? [
          { name: 'Broadline Gatos (Pipeta Antipulgas & Garrapatas)', duration: '1', format: 'Pipeta Spot-on', inStore: false },
        ]
      : [
          { name: 'Frontline Plus Perros (Pipeta Spot-on)', duration: '1', format: 'Pipeta Spot-on', inStore: false },
        ];

    // Para "interno", los endectocidas de tienda (NexGard Spectra, Simparica Trio, Bravecto Plus, Revolution Plus)
    // actúan tanto interna como externamente.
    let baseList = [];
    if (activeTab === 'interno') {
      const internalStore = storeAntiparasitics.filter(p => 
        /spectra|trio|plus|revolution/i.test(p.name)
      );
      baseList = [...internalStore, ...clinicalInternal];
      // Si la tienda tiene otros, agregarlos
      storeAntiparasitics.forEach(p => {
        if (!baseList.find(b => b.name === p.name)) {
          baseList.push(p);
        }
      });
    } else {
      // "externo"
      baseList = [...storeAntiparasitics, ...clinicalExternal];
    }

    // SI HAY UNA COMPRA PREVIA DEL CLIENTE, DESTACARLA EN LA PRIMERA POSICIÓN (ÍNDICE 0)
    if (purchasedOrder) {
      const matchedStore = storeAntiparasitics.find(p => 
        purchasedOrder.product.toLowerCase().includes(p.brand?.toLowerCase() || '---') ||
        p.name.toLowerCase().includes((purchasedOrder.product || '').toLowerCase().slice(0, 10))
      );

      const purchasedItem = {
        name: matchedStore ? matchedStore.name : purchasedOrder.product,
        duration: matchedStore ? matchedStore.duration : (purchasedOrder.product.includes('12') ? '3' : '1'),
        price: matchedStore ? matchedStore.price : (purchasedOrder.total ? parseInt(purchasedOrder.total.replace(/[^0-9]/g, ''), 10) : null),
        format: matchedStore ? matchedStore.format : 'Comprado en Patitas del Sur',
        tagline: matchedStore ? matchedStore.tagline : 'Tu compra verificada en tienda',
        inStore: true,
        isPurchased: true,
        orderInfo: {
          orderId: purchasedOrder.id,
          orderDate: purchasedOrder.date,
          orderDateIso: purchasedOrder.dateIso,
        }
      };

      // Remover duplicado de la lista base y colocar el comprado al principio
      const filtered = baseList.filter(b => b.name !== purchasedItem.name);
      return [purchasedItem, ...filtered];
    }

    return baseList;
  };

  const productList = buildProductList();

  // 3. AUTO-REGISTRO / DETECCIÓN AUTOMÁTICA AL ABRIR O CAMBIAR DE PESTAÑA
  useEffect(() => {
    if (!isOpen) return;

    const detectedOrder = findCustomerAntiparasiticOrder();
    if (detectedOrder) {
      setAutoDetectedOrder(detectedOrder);
      const firstItem = productList[0];
      if (firstItem && !isCustomProduct) {
        setSelectedProduct(firstItem.name);
        setFrequencyMonths(firstItem.duration || '1');
        // Si el cliente compró, pre-cargamos la fecha de la compra como administración automática
        if (detectedOrder.dateIso) {
          setAdminDate(detectedOrder.dateIso);
        }
        setNotes(`Auto-registrado desde compra en tienda (Pedido #${detectedOrder.id})`);
      }
    } else {
      setAutoDetectedOrder(null);
      if (productList.length > 0 && !isCustomProduct) {
        setSelectedProduct(productList[0].name);
        setFrequencyMonths(productList[0].duration || '1');
      }
    }
  }, [isOpen, activeTab, pet?.id]);

  // Manejar selección de producto desde el dropdown personalizado
  const handleSelectProduct = (item) => {
    setSelectedProduct(item.name);
    setIsCustomProduct(false);
    if (item.duration) {
      setFrequencyMonths(String(item.duration));
    }
  };

  // Próxima dosis calculada
  const nextDueDate = computeNextDue(frequencyMonths, adminDate);
  const nextDueDateFriendly = formatDateSpanish(nextDueDate);

  // Redirigir a la pantalla principal "Mis Mascotas" (donde están las cards)
  const handleClose = () => {
    if (onClose) {
      onClose();
    }
    navigate('/mi-cuenta?tab=mascotas', { replace: true });
    window.dispatchEvent(new CustomEvent('patitas_customer_tab_changed', { detail: 'mascotas' }));
    window.dispatchEvent(new CustomEvent('patitas_customer_tab', { detail: 'mascotas' }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Cerrar con tecla Escape
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

  const handleSubmit = (e) => {
    if (e && e.preventDefault) e.preventDefault();

    const finalTitle = isCustomProduct
      ? customProductName.trim() || (activeTab === 'interno' ? 'Antiparasitario Interno' : 'Antiparasitario Externo')
      : selectedProduct || (activeTab === 'interno' ? 'Antiparasitario Interno' : 'Antiparasitario Externo');

    if (onSaveAntiparasitic) {
      onSaveAntiparasitic({
        id: `ap-${Date.now()}`,
        petId: pet.id,
        date: adminDate,
        type: activeTab,
        title: finalTitle,
        frequencyMonths: parseInt(frequencyMonths, 10) || 1,
        nextDueDate,
        nextDueDateFormatted: nextDueDateFriendly,
        reminderEnabled: true,
        notes: notes.trim(),
        isFromStorePurchase: !!autoDetectedOrder,
      });
    }

    handleClose();
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
      className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150 overflow-y-auto"
    >
      {/* Contenedor Suave, Cálido y Minimalista */}
      <div className="bg-white rounded-[28px] shadow-[0_20px_50px_rgba(245,158,11,0.18),0_4px_16px_rgba(0,0,0,0.04)] border border-amber-100/70 w-full max-w-sm sm:max-w-md p-5 sm:p-6 space-y-3.5 animate-in zoom-in-95 duration-150 select-none my-auto">
        
        {/* Header Cálido con halo ámbar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-50/90 border border-amber-200/80 flex items-center justify-center text-xl shadow-2xs shrink-0">
              {pet.type === 'gato' ? '🐱' : '🐶'}
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-black text-slate-800 leading-tight">
                {pet.name}
              </h3>
              <div className="text-[11px] text-amber-700/80 font-semibold flex items-center gap-1 pt-0.5">
                <Sparkles className="w-3 h-3 text-amber-500 fill-amber-500" />
                <span>Protección Antiparasitaria</span>
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

        {/* Pestañas Cápsula Flotantes: Interno vs Externo */}
        <div className="bg-amber-50/60 p-1 rounded-2xl flex gap-1.5 border border-amber-100/60">
          <button
            type="button"
            onClick={() => setActiveTab('interno')}
            className={`flex-1 py-2.5 rounded-xl text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'interno'
                ? 'bg-gradient-to-r from-amber-600 via-amber-500 to-orange-500 text-white font-black shadow-xs'
                : 'text-slate-600 hover:text-slate-900 font-semibold'
            }`}
          >
            <Pill className={`w-3.5 h-3.5 ${activeTab === 'interno' ? 'text-white' : 'text-amber-600'}`} />
            <span>Interno</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('externo')}
            className={`flex-1 py-2.5 rounded-xl text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'externo'
                ? 'bg-gradient-to-r from-amber-600 via-amber-500 to-orange-500 text-white font-black shadow-xs'
                : 'text-slate-600 hover:text-slate-900 font-semibold'
            }`}
          >
            <Shield className={`w-3.5 h-3.5 ${activeTab === 'externo' ? 'text-white' : 'text-amber-600'}`} />
            <span>Externo</span>
          </button>
        </div>

        {/* BANNER RECONFORTANTE: DETECCIÓN Y AUTO-REGISTRO DE COMPRA EN TIENDA */}
        {autoDetectedOrder && (
          <div className="p-3 bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/10 border border-amber-300/80 rounded-2xl flex items-start gap-2.5 shadow-2xs animate-in fade-in duration-200">
            <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center shrink-0 shadow-xs mt-0.5">
              <Sparkles className="w-3.5 h-3.5 fill-white" />
            </div>
            <div className="flex-1 min-w-0 text-left">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-xs font-black text-amber-950">
                  ¡Compra en tienda detectada!
                </span>
                <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded-full bg-amber-200/90 text-amber-900 border border-amber-300/80">
                  Pedido #{autoDetectedOrder.id}
                </span>
              </div>
              <p className="text-[11px] font-medium text-amber-900/90 leading-snug mt-0.5">
                Auto-completamos tu producto y fecha de compra ({autoDetectedOrder.date}). Tu recordatorio se ha programado de forma automática.
              </p>
            </div>
          </div>
        )}

        {/* Formulario Minimalista */}
        <form onSubmit={handleSubmit} className="space-y-3 pt-0.5">
          
          {/* Campo 1: Producto con Dropdown Flotante Personalizado */}
          <div className="space-y-1">
            <div className="flex items-center justify-between pl-1">
              <label className="text-[11px] font-semibold text-slate-500">
                {activeTab === 'interno' ? 'Antiparasitario interno administrado' : 'Antiparasitario externo administrado'}
              </label>
              <button
                type="button"
                onClick={() => setIsCustomProduct(!isCustomProduct)}
                className="text-[10px] font-bold text-amber-700 hover:underline cursor-pointer"
              >
                {isCustomProduct ? '← Ver productos y tienda' : '+ Otro no listado'}
              </button>
            </div>

            {isCustomProduct ? (
              <input
                type="text"
                required
                placeholder="Ej. Drontal, Bravecto, Endogard, Nexgard..."
                value={customProductName}
                onChange={(e) => setCustomProductName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50/90 border border-slate-200/80 hover:border-amber-300 focus:border-amber-500 focus:bg-white focus:ring-3 focus:ring-amber-500/12 rounded-xl text-xs font-bold text-slate-800 focus:outline-none transition-all placeholder:text-slate-400 placeholder:font-normal"
              />
            ) : (
              <CustomProductDropdown
                selectedProduct={selectedProduct}
                onSelectProduct={handleSelectProduct}
                items={productList}
                onSwitchToCustom={() => setIsCustomProduct(true)}
              />
            )}
          </div>

          {/* Campo 2: Fecha de Administración y Duración (Ambos con selectores sedosos) */}
          <div className="grid grid-cols-2 gap-2.5">
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-500 pl-1">
                Fecha administración
              </label>
              <SoftDatePicker
                value={adminDate}
                onChange={(dStr) => setAdminDate(dStr)}
                allowPastDates={true}
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-500 pl-1">
                Duración protección
              </label>
              <CustomDurationDropdown
                value={frequencyMonths}
                onChange={(val) => setFrequencyMonths(val)}
              />
            </div>
          </div>

          {/* Cápsula Cálida de Próxima Dosis & Recordatorio Automático */}
          <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200/80 flex items-center justify-between gap-3 shadow-2xs">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-amber-100/90 text-amber-700 flex items-center justify-center shrink-0">
                <Bell className="w-4 h-4 text-amber-600" />
              </div>
              <div>
                <span className="text-[10px] font-black text-amber-900 uppercase tracking-wider block">
                  Próxima Dosis Programada
                </span>
                <span className="text-xs font-black text-amber-950 block">
                  📅 {nextDueDateFriendly}
                </span>
              </div>
            </div>
            <div className="text-[10px] font-extrabold text-amber-800 bg-white/95 px-2.5 py-1 rounded-full border border-amber-300 shadow-2xs shrink-0">
              Aviso activo ✓
            </div>
          </div>

          {/* Campo 3: Observaciones Opcionales */}
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-slate-500 pl-1">
              Notas u observaciones (opcional)
            </label>
            <input
              type="text"
              placeholder="Ej. Administrado con comida, peso al aplicar 8kg..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50/90 border border-slate-200/80 hover:border-amber-300 focus:border-amber-500 focus:bg-white focus:ring-3 focus:ring-amber-500/12 rounded-xl text-xs font-medium text-slate-800 focus:outline-none transition-all placeholder:text-slate-400 placeholder:font-normal"
            />
          </div>

          {/* Botón Principal de Acción */}
          <div className="pt-1.5 text-center">
            <button
              type="submit"
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-600 via-amber-500 to-orange-500 hover:opacity-95 text-white font-black text-xs flex items-center justify-center gap-2 shadow-sm hover:shadow-md transition-all active:scale-[0.98] cursor-pointer"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>Guardar y Activar Recordatorio</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
