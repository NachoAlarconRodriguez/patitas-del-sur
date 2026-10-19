import React from 'react';
import { Gift, X, Sparkles, Check, ChevronRight, AlertCircle } from 'lucide-react';

export default function RedeemPointsModal({
  isOpen,
  onClose,
  userPoints,
  rewards = [],
  onRedeem,
  activeCoupons = [],
}) {
  if (!isOpen) return null;

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-150"
    >
      <div className="bg-white rounded-[28px] shadow-[0_20px_50px_rgba(14,131,136,0.18),0_4px_16px_rgba(0,0,0,0.04)] border border-slate-100 w-full max-w-sm sm:max-w-md p-4 sm:p-5 space-y-3 animate-in zoom-in-95 duration-150 select-none my-auto max-h-[90vh] flex flex-col">
        
        {/* HEADER MINIMALISTA */}
        <div className="flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-50 to-teal-50 border border-emerald-200/80 flex items-center justify-center text-lg shadow-2xs shrink-0">
              <Gift className="w-5 h-5 text-[#0E8388]" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 block">
                Club Patitas del Sur
              </span>
              <h3 className="text-sm sm:text-base font-black text-slate-800 leading-tight">
                Canjear Puntos
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="w-8 h-8 rounded-full bg-slate-100/90 hover:bg-slate-200 text-slate-400 hover:text-slate-700 flex items-center justify-center transition-all cursor-pointer active:scale-95 border border-slate-200/60 shadow-2xs"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* SALDO ACTUAL (CÁPSULA MINIMALISTA) */}
        <div className="p-3 rounded-2xl bg-gradient-to-r from-emerald-50/90 via-teal-50/70 to-white border border-emerald-200/80 flex items-center justify-between gap-2 shadow-2xs shrink-0">
          <div>
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">
              Tu Saldo Disponible
            </span>
            <div className="flex items-baseline gap-1.5 pt-0.5">
              <span className="text-base sm:text-lg font-black text-[#0A3E40]">
                {userPoints.toLocaleString('es-CL')} PTS
              </span>
              <span className="text-[11px] text-emerald-700 font-bold">
                (${ (userPoints * 10).toLocaleString('es-CL') } CLP)
              </span>
            </div>
          </div>

          <div className="px-2.5 py-1 rounded-xl bg-white border border-emerald-200 shadow-2xs text-right shrink-0">
            <span className="text-[10px] font-black text-amber-600 block">Socio VIP Oro 🥇</span>
            <span className="text-[9.5px] font-bold text-slate-400">10 Pts = $100 CLP</span>
          </div>
        </div>

        {/* LISTA DE BENEFICIOS CANJEABLES */}
        <div className="space-y-2 overflow-y-auto flex-1 pr-0.5 -mr-0.5">
          <div className="flex items-center justify-between px-1 pt-0.5">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">
              Recompensas Disponibles
            </span>
            <span className="text-[10px] font-bold text-slate-400">
              {rewards.length} opciones
            </span>
          </div>

          <div className="space-y-2">
            {rewards.map((reward) => {
              const canAfford = userPoints >= reward.points;

              return (
                <div
                  key={reward.id}
                  className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-2.5 ${
                    canAfford
                      ? 'bg-white border-slate-200/90 hover:border-[#0E8388] shadow-2xs hover:shadow-xs'
                      : 'bg-slate-50/60 border-slate-100 opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-lg shrink-0">
                      {reward.icon}
                    </div>
                    <div className="min-w-0 space-y-0.5">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h4 className="text-xs font-black text-slate-900 leading-tight truncate">
                          {reward.title.replace('Cupón ', '')}
                        </h4>
                        <span className="text-[9px] font-black text-[#0E8388] bg-teal-50 px-1.5 py-0.2 rounded border border-teal-100 shrink-0">
                          {reward.validity.replace('Válido para ', '').replace('Válido en tus ', '')}
                        </span>
                      </div>
                      <p className="text-[10.5px] text-slate-400 font-medium truncate">
                        {reward.description}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    disabled={!canAfford}
                    onClick={() => {
                      onRedeem(reward);
                      onClose();
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-black shrink-0 transition-all cursor-pointer active:scale-95 shadow-2xs flex items-center gap-1 ${
                      canAfford
                        ? 'bg-gradient-to-r from-[#0A3E40] to-[#0E8388] hover:from-[#0E8388] hover:to-teal-600 text-white'
                        : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    {canAfford ? (
                      <>
                        <Sparkles className="w-3 h-3 text-amber-300" />
                        <span>Canjear {reward.points} Pts</span>
                      </>
                    ) : (
                      <span>Faltan {reward.points - userPoints} Pts</span>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* CUPONES ACTIVOS SI EXISTEN */}
        {activeCoupons && activeCoupons.length > 0 && (
          <div className="pt-2 border-t border-slate-100 shrink-0 space-y-1">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              Tus Cupones Activos ({activeCoupons.length}):
            </span>
            <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none">
              {activeCoupons.map((coupon) => (
                <div
                  key={coupon.id}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-emerald-50 border border-emerald-200/90 text-emerald-800 text-[10px] font-bold shrink-0 shadow-2xs"
                >
                  <span className="text-xs">🎟️</span>
                  <span className="truncate max-w-[150px]">{coupon.title}</span>
                  <span className="text-[9px] text-emerald-600 font-black">({coupon.code})</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PIE MINIMALISTA DE REGLA */}
        <div className="pt-1 text-[10px] text-slate-400 text-center font-medium shrink-0">
          💡 Los puntos se descuentan al canjear y el beneficio queda activo para tus compras.
        </div>

      </div>
    </div>
  );
}
