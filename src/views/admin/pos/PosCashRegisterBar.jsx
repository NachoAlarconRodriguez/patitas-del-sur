import React, { useEffect, useState } from 'react';
import {
  Clock,
  ArrowLeftRight,
  Wallet,
  Lock,
  Unlock,
  ArrowDownUp,
  Printer,
  CheckCircle2,
} from 'lucide-react';
import { formatCLP } from '../adminUtils.js';
import {
  POS_PARTNERS,
  computeShiftDurationMinutes,
  formatMinutesToHoursLabel,
} from '../../../services/posService.js';

/**
 * Barra superior persistente del Terminal POS:
 * - Estado de Caja Diaria (Abierta / Cerrada)
 * - Socio en turno + reloj en vivo de horas trabajadas
 * - Relevo rápido de socio sin cerrar caja ni sesión
 * - Botones de Ingreso/Retiro de efectivo y Cierre Diario
 */
export default function PosCashRegisterBar({
  activeRegister,
  activeShift,
  reconciliation,
  ticketWidthMm,
  onChangeTicketWidth,
  onOpenRegisterModal,
  onOpenCloseRegisterModal,
  onOpenCashMovementModal,
  onSwitchPartnerShift,
  isSwitchingShift = false,
}) {
  const [nowMs, setNowMs] = useState(() => Date.now());
  const [showHandoverMenu, setShowHandoverMenu] = useState(false);

  useEffect(() => {
    if (!activeShift) return undefined;
    const timer = setInterval(() => setNowMs(Date.now()), 30000);
    return () => clearInterval(timer);
  }, [activeShift]);

  const elapsedMinutes = activeShift ? computeShiftDurationMinutes(activeShift, nowMs) : 0;
  const elapsedLabel = formatMinutesToHoursLabel(elapsedMinutes);
  const otherPartner = POS_PARTNERS.find((p) => p.key !== activeShift?.partner_key) || POS_PARTNERS[1];

  if (!activeRegister) {
    return (
      <div className="bg-white border border-amber-200 rounded-3xl p-4 sm:px-6 flex flex-wrap items-center justify-between gap-4 shadow-2xs">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-[#D97706] shrink-0">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-extrabold text-[#111827]">Caja diaria cerrada</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">
                Sin turno activo
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Abre la caja con el fondo inicial de efectivo para comenzar a escanear productos y registrar tus horas trabajadas.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onOpenRegisterModal}
          className="px-5 py-2.5 rounded-full bg-[#D97706] hover:bg-[#B45309] text-white text-xs font-extrabold shadow-sm shadow-[#D97706]/25 transition-all flex items-center gap-2 cursor-pointer active:scale-95"
        >
          <Unlock className="w-4 h-4" />
          <span>Abrir Caja Diaria</span>
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white border border-[#EAECEF] rounded-3xl p-3.5 sm:px-5 flex flex-wrap items-center justify-between gap-3 shadow-2xs">
      {/* Izquierda: Estado de Caja + KPIs rápidos del turno */}
      <div className="flex flex-wrap items-center gap-3 sm:gap-4 min-w-0">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 shrink-0">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div className="leading-tight">
            <div className="flex items-center gap-2">
              <span className="text-xs font-extrabold text-[#111827]">Caja Abierta</span>
              <span className="text-[10px] font-mono font-bold text-slate-400">{activeRegister.id}</span>
            </div>
            <div className="text-[11px] text-slate-500 font-medium tabular-nums">
              Ventas hoy: <strong className="text-[#111827]">{reconciliation?.salesCount || 0}</strong> ({formatCLP(reconciliation?.totalSales || 0)}) · Efvo. esperado:{' '}
              <strong className="text-emerald-700">{formatCLP(reconciliation?.expectedCash || 0)}</strong>
            </div>
          </div>
        </div>

        <div className="h-7 w-px bg-[#EAECEF] hidden xl:block" />

        {/* Socio activo en turno + cronómetro en vivo */}
        <div className="relative">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#FAF8F4] border border-[#FDE68A]">
            <div className="w-6 h-6 rounded-full bg-[#D97706] text-white text-[11px] font-extrabold flex items-center justify-center shrink-0">
              {(activeShift?.partner_name || 'S').charAt(0).toUpperCase()}
            </div>
            <div className="leading-tight">
              <div className="text-[11px] font-extrabold text-[#111827] whitespace-nowrap">
                {activeShift?.partner_name || activeRegister.opened_by_name}
              </div>
              <div className="text-[10px] font-bold text-[#D97706] flex items-center gap-1 tabular-nums">
                <Clock className="w-2.5 h-2.5" />
                <span>Turno: {elapsedLabel}</span>
              </div>
            </div>
            <button
              type="button"
              disabled={isSwitchingShift}
              onClick={() => setShowHandoverMenu((prev) => !prev)}
              className="ml-1 px-2.5 py-1 rounded-full bg-white hover:bg-[#FEF3C7] border border-[#FDE68A] text-[10px] font-extrabold text-[#92400E] flex items-center gap-1 transition-colors cursor-pointer disabled:opacity-50"
              title="Cambiar socio en caja sin cerrar la caja diaria"
            >
              <ArrowLeftRight className="w-3 h-3" />
              <span>Relevo</span>
            </button>
          </div>

          {showHandoverMenu && (
            <div className="absolute left-0 top-full mt-2 w-72 bg-white border border-[#EAECEF] rounded-2xl shadow-xl p-3.5 z-40 space-y-2.5">
              <div className="text-[11px] font-extrabold text-[#111827]">
                Relevo de turno en caja
              </div>
              <p className="text-[11px] text-slate-500 leading-snug">
                Cierra el turno actual de <strong>{activeShift?.partner_name}</strong> ({elapsedLabel}) e inicia inmediatamente el turno de{' '}
                <strong>{otherPartner.name}</strong> sin cerrar la caja del día.
              </p>
              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowHandoverMenu(false)}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  disabled={isSwitchingShift}
                  onClick={async () => {
                    setShowHandoverMenu(false);
                    await onSwitchPartnerShift?.(otherPartner.key);
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-[#D97706] hover:bg-[#B45309] text-white text-[11px] font-extrabold cursor-pointer disabled:opacity-50"
                >
                  Dar relevo a {otherPartner.shortName}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Derecha: Selector ancho ticket, Movimiento efectivo, Cierre de caja */}
      <div className="flex flex-wrap items-center gap-2">
        <div
          className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-[#F8FAFC] border border-[#EAECEF] text-[11px] font-bold text-slate-600"
          title="Ancho de papel impresora térmica"
        >
          <Printer className="w-3.5 h-3.5 text-slate-400 ml-1" />
          {[80, 58].map((mm) => (
            <button
              key={mm}
              type="button"
              onClick={() => onChangeTicketWidth?.(mm)}
              className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold transition-colors cursor-pointer ${
                ticketWidthMm === mm
                  ? 'bg-[#111827] text-white'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              {mm}mm
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={onOpenCashMovementModal}
          className="px-3.5 py-2 rounded-full bg-[#F8FAFC] hover:bg-[#FEF3C7]/60 border border-[#EAECEF] text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
          title="Registrar ingreso de sencillo o retiro de efectivo"
        >
          <ArrowDownUp className="w-3.5 h-3.5 text-[#D97706]" />
          <span>Mov. Efectivo</span>
        </button>

        <button
          type="button"
          onClick={onOpenCloseRegisterModal}
          className="px-4 py-2 rounded-full bg-[#111827] hover:bg-slate-800 text-white text-xs font-extrabold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
        >
          <Wallet className="w-3.5 h-3.5 text-[#F5BA13]" />
          <span>Cerrar Caja</span>
        </button>
      </div>
    </div>
  );
}
