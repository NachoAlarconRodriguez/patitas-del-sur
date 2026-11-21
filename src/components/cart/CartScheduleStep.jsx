import React from 'react';
import {
  AlertCircle,
  ArrowRight,
  Calendar,
  Check,
  Clock,
  MapPin,
  Sun,
  Sunset,
  Truck,
  Zap,
} from 'lucide-react';
import { formatCLP } from '../../utils/formatters';
import { formatDeliveryDaysSummary } from '../../services/dispatchService';

const SHORT_DAYS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const SHORT_MONTHS = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

const parseDateCardParts = (dateObj) => {
  const parts = String(dateObj?.isoDate || '').split('-');
  const dayNum = parts.length === 3 ? Number(parts[2]) : '';
  const monthIdx = parts.length === 3 ? Number(parts[1]) - 1 : -1;
  const monthShort = SHORT_MONTHS[monthIdx] || '';
  const dayShort = SHORT_DAYS[dateObj?.dayOfWeek] || '';

  return {
    eyebrow: dateObj?.isToday ? 'HOY' : dateObj?.isTomorrow ? 'MAÑANA' : dayShort.toUpperCase(),
    dayNum,
    subLabel: dateObj?.isToday || dateObj?.isTomorrow ? `${dayShort} · ${monthShort}` : monthShort,
  };
};

const parseSlotDisplay = (slot) => {
  const rawValue = String(slot?.value || slot?.label || '');
  if (slot?.isUrgent) {
    return {
      kind: 'urgent',
      title: 'Pedido Urgente',
      timeRange: 'Fuera de ventana horaria',
      subtitle: 'Entrega prioritaria coordinada (se cobra despacho aunque supere el mínimo).',
    };
  }
  if (/10:00|13:00|ma[ñn]ana/i.test(rawValue)) {
    const isDirectToday = /hoy antes/i.test(rawValue);
    return {
      kind: 'morning',
      title: isDirectToday ? 'Hoy · Bloque Mañana' : 'Bloque Mañana',
      timeRange: isDirectToday ? 'Antes de las 13:00 hrs' : '10:00 a 13:00 hrs',
      subtitle: slot?.desc || '1ª ventana de reparto del día',
    };
  }
  if (/15:30|19:30|tarde/i.test(rawValue)) {
    const isDirectToday = /hoy antes/i.test(rawValue);
    return {
      kind: 'afternoon',
      title: isDirectToday ? 'Hoy · Bloque Tarde' : 'Bloque Tarde',
      timeRange: isDirectToday ? 'Antes de las 19:30 hrs' : '15:30 a 19:30 hrs',
      subtitle: slot?.desc || '2ª ventana de reparto del día',
    };
  }
  return {
    kind: 'standard',
    title: slot?.label || rawValue,
    timeRange: '',
    subtitle: slot?.desc || '',
  };
};

/**
 * Paso 2 del Checkout: Selección visual de Día y Bloque Horario de Despacho.
 */
export default function CartScheduleStep({
  address,
  depto,
  city,
  matchedDispatchZone,
  availableDeliveryDates,
  deliveryDate,
  selectedDateObj,
  onSelectDate,
  availableSlots,
  deliverySlot,
  selectedSlotData,
  recommendedSlotValue,
  onSelectSlot,
  smartScheduleEval,
  isSpecialDeliveryDay,
  zoneBaseFee,
  effectiveBaseFee,
  freeShippingThreshold,
  subtotal,
  calculatedShippingCost,
  shippingStepTotal,
  fieldErrors,
  formError,
  onEditAddress,
  onContinueToPayment,
}) {
  const coverageSummary = matchedDispatchZone
    ? formatDeliveryDaysSummary(matchedDispatchZone.deliveryDays || [1, 2, 3, 4, 5, 6])
    : 'Lunes a Sábado';

  const hasMorningSlot = availableSlots.some(
    (s) => !s.isUrgent && /10:00|13:00|ma[ñn]ana/i.test(s.value || s.label || '')
  );
  const showClosedMorningRow = Boolean(selectedDateObj?.isToday && !hasMorningSlot);

  const getSlotCostInfo = (slot) => {
    const slotNoFree = Boolean(
      (isSpecialDeliveryDay && matchedDispatchZone?.specialDayNoFreeShipping) ||
        slot?.noFreeShipping
    );
    const slotFee =
      slot?.fee !== null && slot?.fee !== undefined && Number(slot.fee) > 0
        ? Number(slot.fee)
        : isSpecialDeliveryDay &&
            matchedDispatchZone?.specialDayFee !== undefined &&
            Number(matchedDispatchZone.specialDayFee) > 0
          ? Number(matchedDispatchZone.specialDayFee)
          : zoneBaseFee;
    const isFree = !slotNoFree && subtotal >= freeShippingThreshold;
    return { isFree, cost: isFree ? 0 : slotFee, isExcluded: slotNoFree };
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* Banner de error general */}
      {formError && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 font-semibold flex items-center gap-2 animate-in fade-in">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{formError}</span>
        </div>
      )}

      {/* Resumen compacto del destino confirmado en el paso 1 */}
      <div className="p-3.5 rounded-2xl bg-[#FAF8F4] border border-[#1D1D1F]/10 flex items-start justify-between gap-3">
        <div className="flex items-start gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-[#1D1D1F] text-[#F5BA13] flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
            <MapPin className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[10px] font-black uppercase tracking-wider text-[#B45309]">
                Despacho a domicilio
              </span>
              {matchedDispatchZone?.name && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FEF3C7] text-[#78350F] border border-[#F5BA13]/40">
                  {matchedDispatchZone.name}
                </span>
              )}
            </div>
            <p className="text-xs font-extrabold text-[#1D1D1F] leading-snug mt-0.5 break-words">
              {address}
              {depto ? <span className="text-slate-500 font-semibold"> ({depto})</span> : null}
            </p>
            {city && (
              <p className="text-[11px] text-slate-500 font-medium">
                Comuna: <strong className="text-[#1D1D1F]">{city}</strong>
              </p>
            )}
          </div>
        </div>
        <button
          type="button"
          onClick={onEditAddress}
          className="text-[11px] font-extrabold text-[#B45309] hover:text-[#1D1D1F] bg-white hover:bg-[#FEF3C7] px-2.5 py-1.5 rounded-xl border border-[#1D1D1F]/12 transition-colors shrink-0 cursor-pointer"
        >
          Cambiar
        </button>
      </div>

      {/* Banner Inteligente de Ventana de Despacho en Tiempo Real */}
      {smartScheduleEval?.statusBanner && (
        <div
          className={`p-3 rounded-2xl border text-xs flex items-start gap-2.5 transition-colors ${
            selectedSlotData?.isUrgent
              ? 'bg-[#FFFBEB] border-[#F5BA13] text-[#78350F]'
              : smartScheduleEval.statusBanner.type === 'available'
                ? 'bg-[#FEF3C7]/55 border-[#F5BA13]/50 text-[#1D1D1F]'
                : 'bg-[#FAF8F4] border-[#1D1D1F]/12 text-[#1D1D1F]'
          }`}
        >
          <div
            className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
              selectedSlotData?.isUrgent
                ? 'bg-[#F5BA13] text-[#1D1D1F]'
                : 'bg-[#1D1D1F] text-[#F5BA13]'
            }`}
          >
            {selectedSlotData?.isUrgent ? (
              <Zap className="w-4 h-4 stroke-[2.5]" />
            ) : (
              <Clock className="w-4 h-4 stroke-[2.2]" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <span className="font-black text-xs leading-snug block text-[#1D1D1F]">
              {selectedSlotData?.isUrgent
                ? 'Pedido Urgente seleccionado'
                : smartScheduleEval.statusBanner.title}
            </span>
            <p className="text-[11px] text-slate-600 font-medium leading-relaxed mt-0.5">
              {selectedSlotData?.isUrgent
                ? `Al solicitar entrega urgente fuera de las ventanas estándar (10:00–13:00 y 15:30–19:30), se aplica tarifa de despacho (${formatCLP(effectiveBaseFee)}) aunque el pedido supere los ${formatCLP(freeShippingThreshold)}.`
                : smartScheduleEval.statusBanner.message}
            </p>
          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/* 1. SELECTOR VISUAL DE DÍA DE ENTREGA                              */}
      {/* ================================================================= */}
      <div id="field-delivery-date" className="space-y-2.5">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <h3 className="text-xs font-black text-[#1D1D1F] uppercase tracking-wider flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-[#D97706]" />
            <span>1. Día de Entrega</span>
          </h3>
          <span className="text-[10.5px] font-bold text-[#78350F] bg-[#FEF3C7] px-2.5 py-0.5 rounded-full border border-[#F5BA13]/45">
            {coverageSummary}
          </span>
        </div>

        {availableDeliveryDates.length === 0 ? (
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-500 text-center font-semibold">
            No hay días de reparto disponibles para esta zona en este momento.
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            {availableDeliveryDates.map((d) => {
              const isSelected = deliveryDate === d.isoDate;
              const { eyebrow, dayNum, subLabel } = parseDateCardParts(d);
              const isSpecial =
                matchedDispatchZone?.hasSpecialDayPricing &&
                (matchedDispatchZone.specialDays || [6]).includes(d.dayOfWeek);

              return (
                <button
                  key={d.isoDate}
                  type="button"
                  onClick={() => onSelectDate(d.isoDate)}
                  aria-pressed={isSelected}
                  className={`relative p-2.5 rounded-2xl border text-center transition-all cursor-pointer active:scale-95 flex flex-col items-center justify-center gap-0.5 ${
                    isSelected
                      ? 'bg-[#1D1D1F] text-white border-[#1D1D1F] shadow-md ring-2 ring-[#F5BA13]/55'
                      : 'bg-[#FAF8F4] hover:bg-[#FEF3C7]/60 text-[#1D1D1F] border-[#1D1D1F]/12 hover:border-[#F5BA13]'
                  }`}
                >
                  {isSelected && (
                    <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-[#F5BA13] text-[#1D1D1F] flex items-center justify-center">
                      <Check className="w-2.5 h-2.5 stroke-[3.5]" />
                    </span>
                  )}

                  <span
                    className={`text-[10px] font-black tracking-wider uppercase ${
                      isSelected
                        ? 'text-[#F5BA13]'
                        : d.isToday
                          ? 'text-[#D97706]'
                          : 'text-slate-500'
                    }`}
                  >
                    {eyebrow}
                  </span>

                  <span className="text-xl font-black leading-none tracking-tight my-0.5">
                    {dayNum}
                  </span>

                  <span
                    className={`text-[10.5px] font-semibold leading-none ${
                      isSelected ? 'text-white/80' : 'text-slate-500'
                    }`}
                  >
                    {subLabel}
                  </span>

                  {isSpecial && (
                    <span
                      className={`mt-1 text-[9px] font-extrabold px-1.5 py-0.5 rounded-full leading-none ${
                        isSelected
                          ? 'bg-[#F5BA13]/20 text-[#FDE68A]'
                          : 'bg-[#FEF3C7] text-[#92400E]'
                      }`}
                    >
                      Tarifa esp.
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}

        {selectedDateObj && (
          <p className="text-[11px] font-semibold text-slate-500 pl-0.5">
            Seleccionado:{' '}
            <strong className="text-[#1D1D1F] font-extrabold">{selectedDateObj.label}</strong>
          </p>
        )}

        {fieldErrors?.deliveryDate && (
          <p className="text-[11px] font-bold text-rose-600 flex items-center gap-1 animate-in fade-in">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{fieldErrors.deliveryDate}</span>
          </p>
        )}
      </div>

      {/* ================================================================= */}
      {/* 2. SELECTOR VISUAL DE BLOQUE HORARIO                              */}
      {/* ================================================================= */}
      <div id="field-delivery-slot" className="space-y-2.5 pt-1">
        <h3 className="text-xs font-black text-[#1D1D1F] uppercase tracking-wider flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-[#D97706]" />
          <span>2. Bloque Horario</span>
        </h3>

        <div className="space-y-2">
          {/* Fila informativa clara cuando la ventana de la mañana ya cerró hoy */}
          {showClosedMorningRow && (
            <div className="flex items-center justify-between gap-3 p-3 rounded-2xl bg-slate-50 border border-dashed border-slate-200 opacity-75">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-slate-200/70 text-slate-400 flex items-center justify-center shrink-0">
                  <Sun className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-500 line-through leading-snug">
                    Bloque Mañana · 10:00 a 13:00 hrs
                  </p>
                  <p className="text-[10.5px] text-slate-400 font-medium">
                    Ventana cerrada por hoy — disponible desde mañana
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-slate-200/80 text-slate-500 shrink-0">
                Cerrada
              </span>
            </div>
          )}

          {availableSlots.map((slot) => {
            const isSelected = deliverySlot === slot.value;
            const isRecommended = !slot.isUrgent && slot.value === recommendedSlotValue;
            const info = parseSlotDisplay(slot);
            const costInfo = getSlotCostInfo(slot);

            const SlotIcon =
              info.kind === 'urgent'
                ? Zap
                : info.kind === 'morning'
                  ? Sun
                  : info.kind === 'afternoon'
                    ? Sunset
                    : Clock;

            return (
              <button
                key={slot.value}
                type="button"
                onClick={() => onSelectSlot(slot.value)}
                aria-pressed={isSelected}
                className={`w-full text-left p-3.5 rounded-2xl border transition-all cursor-pointer active:scale-[0.99] flex items-start gap-3 ${
                  isSelected
                    ? slot.isUrgent
                      ? 'bg-[#FFFBEB] border-2 border-[#D97706] ring-2 ring-[#F5BA13]/30 shadow-sm'
                      : 'bg-white border-2 border-[#F5BA13] ring-2 ring-[#F5BA13]/25 shadow-sm'
                    : 'bg-[#FAF8F4] hover:bg-white border-[#1D1D1F]/12 hover:border-[#F5BA13]/70'
                }`}
              >
                {/* Ícono del bloque */}
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                    isSelected
                      ? slot.isUrgent
                        ? 'bg-[#F5BA13] text-[#1D1D1F]'
                        : 'bg-[#1D1D1F] text-[#F5BA13]'
                      : 'bg-white text-[#D97706] border border-[#1D1D1F]/10'
                  }`}
                >
                  <SlotIcon className="w-4 h-4" />
                </div>

                {/* Contenido principal sin recortes */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-xs sm:text-[13px] font-black text-[#1D1D1F] leading-snug">
                          {info.title}
                        </span>
                        {isRecommended && (
                          <span className="text-[9.5px] font-black px-2 py-0.5 rounded-full bg-[#FEF3C7] text-[#92400E] border border-[#F5BA13]/50">
                            Más rápido
                          </span>
                        )}
                      </div>
                      {info.timeRange && (
                        <p className="text-xs font-extrabold text-[#B45309] mt-0.5">
                          {info.timeRange}
                        </p>
                      )}
                    </div>

                    {/* Precio o Gratis + indicador de selección */}
                    <div className="flex items-center gap-2 shrink-0">
                      {costInfo.isFree ? (
                        <span className="text-[10.5px] font-black px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200">
                          GRATIS
                        </span>
                      ) : (
                        <span className="text-[11px] font-black px-2 py-0.5 rounded-lg bg-[#FEF3C7]/80 text-[#78350F] border border-[#F5BA13]/40">
                          {formatCLP(costInfo.cost)}
                        </span>
                      )}

                      <span
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                          isSelected
                            ? 'bg-[#1D1D1F] border-[#1D1D1F] text-[#F5BA13]'
                            : 'bg-white border-slate-300'
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3 stroke-[3.5]" />}
                      </span>
                    </div>
                  </div>

                  {info.subtitle && (
                    <p className="text-[11px] text-slate-500 font-medium leading-relaxed mt-1">
                      {info.subtitle}
                    </p>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {fieldErrors?.deliverySlot && (
          <p className="text-[11px] font-bold text-rose-600 flex items-center gap-1 animate-in fade-in">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{fieldErrors.deliverySlot}</span>
          </p>
        )}
      </div>

      {/* Resumen de costo de despacho + Total parcial */}
      <div className="p-3.5 bg-white rounded-2xl border border-[#1D1D1F]/10 space-y-1.5">
        <div className="flex items-center justify-between text-xs text-slate-600">
          <span className="flex items-center gap-1.5 font-semibold">
            <Truck className="w-3.5 h-3.5 text-[#D97706]" />
            <span>Despacho {city ? `(${city})` : ''}</span>
          </span>
          <span
            className={`font-black ${
              calculatedShippingCost === 0 ? 'text-emerald-700' : 'text-[#1D1D1F]'
            }`}
          >
            {calculatedShippingCost === 0 ? 'GRATIS' : formatCLP(calculatedShippingCost)}
          </span>
        </div>

        <div className="flex items-center justify-between text-sm font-black text-[#1D1D1F] pt-1.5 border-t border-slate-100">
          <span>Total con despacho</span>
          <span className="text-[#D97706]">{formatCLP(shippingStepTotal)}</span>
        </div>
      </div>

      {/* Botón Continuar al Pago */}
      <button
        type="button"
        onClick={onContinueToPayment}
        className="w-full py-4 rounded-2xl bg-[#F5BA13] hover:bg-[#D97706] text-[#1D1D1F] hover:text-white font-black text-sm flex items-center justify-center gap-2 shadow-xl shadow-[#F5BA13]/30 transition-all active:scale-95 cursor-pointer"
      >
        <span>CONTINUAR AL PAGO</span>
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
}
