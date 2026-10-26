import React from 'react';
import { Gift, X, Sparkles, Check, AlertCircle } from 'lucide-react';

export default function RedeemPointsModal({
  isOpen,
  onClose,
  userPoints = 0,
  rewards = [],
  onRedeem,
  activeCoupons = [],
  pointsPerThousand = 1,
}) {
  if (!isOpen) return null;

  // Calcular valor canjeable actual según el tramo máximo alcanzable
  const affordableRewards = [...rewards]
    .filter((r) => r.active !== false && userPoints >= (r.points || 0))
    .sort((a, b) => (b.points || 0) - (a.points || 0));
  const currentRedeemableAmount = affordableRewards[0]?.discountAmount || 0;

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
                Canjear Puntos por Descuentos
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

        {/* SALDO ACTUAL */}
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
                {currentRedeemableAmount > 0
                  ? `(Canjeable: $${currentRedeemableAmount.toLocaleString('es-CL')} CLP)`
                  : '(Acumula para tu primer cupón)'}
              </span>
            </div>
          </div>

          <div className="px-2.5 py-1 rounded-xl bg-white border border-emerald-200 shadow-2xs text-right shrink-0">
            <span className="text-[10px] font-black text-amber-600 block">Socio Club 🐾</span>
            <span className="text-[9.5px] font-bold text-slate-500">
              {pointsPerThousand} Pt{pointsPerThousand > 1 ? 's' : ''} x cada $1.000
            </span>
          </div>
        </div>

        {/* LISTA DE BENEFICIOS CANJEABLES */}
        <div className="space-y-2 overflow-y-auto flex-1 pr-0.5 -mr-0.5">
          <div className="flex items-center justify-between px-1 pt-0.5">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">
              Descuentos en Dinero Disponibles
            </span>
            <span className="text-[10px] font-bold text-slate-400">
              {rewards.length} opciones
            </span>
          </div>

          <div className="space-y-2">
            {rewards.map((reward) => {
              const canAfford = userPoints >= reward.points;
              const displayTitle = (reward.title || `$${(reward.discountAmount || 0).toLocaleString('es-CL')} Dcto.`).replace(/^Cupón\s*/i, '');
              const displayDesc = reward.description && !reward.description.startsWith('Aplica .000')
                ? reward.description
                : `Aplica $${(reward.discountAmount || 0).toLocaleString('es-CL')} de descuento directo en el total de tu próxima compra.`;

              return (
                <div
                  key={reward.id}
                  className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-2.5 ${
                    canAfford
                      ? 'bg-white border-emerald-300 hover:border-[#0E8388] shadow-2xs hover:shadow-xs'
                      : 'bg-slate-50/60 border-slate-100 opacity-65'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-lg shrink-0">
                      {reward.icon || '💵'}
                    </div>
                    <div className="min-w-0 space-y-0.5">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h4 className="text-xs font-black text-slate-900 leading-tight truncate">
                          {displayTitle}
                        </h4>
                        <span className="text-[9px] font-black text-[#0E8388] bg-teal-50 px-1.5 py-0.2 rounded border border-teal-100 shrink-0">
                          {reward.validity?.replace('Válido para ', '') || '1 compra'}
                        </span>
                      </div>
                      <p className="text-[10.5px] text-slate-500 font-medium truncate">
                        {displayDesc}
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
                  className="px-2.5 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-2 shrink-0 shadow-2xs text-[11px]"
                >
                  <span className="font-mono font-black text-emerald-800">{coupon.code}</span>
                  <span className="text-slate-600 font-bold truncate max-w-[120px]">{coupon.title}</span>
                  <span className="text-[9px] font-black bg-emerald-600 text-white px-1.5 py-0.2 rounded-full">
                    Listo
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
