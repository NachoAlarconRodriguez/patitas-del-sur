import React, { useEffect, useState } from 'react';
import { Gift, X, Sparkles, Check, Ticket, Coins, Crown, Lock, Award, Copy } from 'lucide-react';

export default function RedeemPointsModal({
  isOpen,
  onClose,
  userPoints = 0,
  rewards = [],
  onRedeem,
  activeCoupons = [],
  pointsPerThousand = 1,
}) {
  const [copiedCouponId, setCopiedCouponId] = useState(null);

  // Cerrar con tecla Escape (Apple UX pattern)
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Bloquear scroll de fondo mientras el modal está activo
  useEffect(() => {
    if (!isOpen) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  // Copiar código de cupón al portapapeles con micro-feedback
  const handleCopyCode = (code, id) => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(code);
      setCopiedCouponId(id);
      setTimeout(() => setCopiedCouponId(null), 2000);
    }
  };

  // Helper de selección de íconos SVG vectoriales (reemplaza emojis según reglas de diseño)
  const renderRewardIcon = (points, discountAmount, isAffordable) => {
    const iconColor = isAffordable ? 'text-amber-600' : 'text-slate-400';
    if (points >= 500 || discountAmount >= 5000) {
      return <Crown className={`w-5 h-5 ${iconColor}`} />;
    }
    if (points >= 350 || discountAmount >= 3500) {
      return <Sparkles className={`w-5 h-5 ${iconColor}`} />;
    }
    if (points >= 200 || discountAmount >= 2000) {
      return <Coins className={`w-5 h-5 ${iconColor}`} />;
    }
    return <Ticket className={`w-5 h-5 ${iconColor}`} />;
  };

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
      className="fixed inset-0 z-50 bg-[#1D1D1F]/50 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="redeem-modal-title"
    >
      <div className="bg-white rounded-3xl shadow-[0_24px_60px_-15px_rgba(29,29,31,0.22),0_8px_20px_-6px_rgba(0,0,0,0.06)] border border-amber-500/20 w-full max-w-sm sm:max-w-md p-5 sm:p-6 space-y-4 animate-in zoom-in-95 duration-200 select-none my-auto max-h-[90vh] flex flex-col relative overflow-hidden">
        
        {/* Barra decorativa de acento dorado Patitas del Sur */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#F5BA13] via-[#D97706] to-[#B45309]" />

        {/* HEADER MINIMALISTA */}
        <div className="flex items-center justify-between shrink-0 pt-1">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#1D1D1F] text-[#F5BA13] flex items-center justify-center shadow-xs border border-amber-500/20 shrink-0">
              <Gift className="w-5 h-5 text-[#F5BA13]" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-700 block">
                Club Patitas del Sur
              </span>
              <h3 id="redeem-modal-title" className="text-base sm:text-lg font-black text-slate-900 font-heading leading-tight">
                Canjear Puntos por Descuentos
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar modal"
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-all cursor-pointer active:scale-95 border border-slate-200/60 shadow-2xs"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* SALDO ACTUAL */}
        <div className="p-3.5 rounded-2xl bg-gradient-to-br from-amber-500/10 via-[#FFFBEB] to-amber-500/5 border border-amber-200/80 flex items-center justify-between gap-3 shadow-2xs shrink-0">
          <div>
            <span className="text-[10px] text-amber-900/80 font-bold uppercase tracking-wider block">
              Tu Saldo Disponible
            </span>
            <div className="flex items-baseline gap-2 pt-0.5 flex-wrap">
              <span className="text-xl sm:text-2xl font-black text-[#1D1D1F] tracking-tight">
                {userPoints.toLocaleString('es-CL')} PTS
              </span>
              {currentRedeemableAmount > 0 ? (
                <span className="text-[11px] font-bold text-amber-900 bg-amber-200/60 border border-amber-300/80 px-2 py-0.5 rounded-lg">
                  Canjeable: ${(currentRedeemableAmount).toLocaleString('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 })}
                </span>
              ) : (
                <span className="text-[11px] font-medium text-slate-500">
                  Acumula para tu 1° cupón
                </span>
              )}
            </div>
          </div>

          <div className="px-3 py-1.5 rounded-xl bg-white border border-amber-200/80 shadow-2xs text-right shrink-0">
            <div className="flex items-center gap-1 text-[11px] font-black text-amber-900 justify-end">
              <Award className="w-3.5 h-3.5 text-amber-600" />
              <span>Socio Club</span>
            </div>
            <span className="text-[9.5px] font-semibold text-slate-500 block">
              {pointsPerThousand} Pt{pointsPerThousand > 1 ? 's' : ''} x cada $1.000
            </span>
          </div>
        </div>

        {/* LISTA DE BENEFICIOS CANJEABLES */}
        <div className="space-y-2 overflow-y-auto flex-1 pr-1 -mr-1">
          <div className="flex items-center justify-between px-1 pt-0.5">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-600">
              Descuentos en Dinero Disponibles
            </span>
            <span className="text-[10px] font-bold text-slate-400">
              {rewards.length} opciones
            </span>
          </div>

          <div className="space-y-2.5">
            {rewards.map((reward) => {
              const canAfford = userPoints >= reward.points;
              const displayTitle = (reward.title || `$${(reward.discountAmount || 0).toLocaleString('es-CL')} Dcto.`)
                .replace(/^Cupón\s*/i, '')
                .replace(/[\u{1F300}-\u{1F9FF}]/gu, '')
                .trim();
              const displayDesc = reward.description && !reward.description.startsWith('Aplica .000')
                ? reward.description.replace(/[\u{1F300}-\u{1F9FF}]/gu, '').trim()
                : `Aplica $${(reward.discountAmount || 0).toLocaleString('es-CL')} de descuento directo en tu compra.`;
              const validityText = reward.validity?.replace('Válido para ', '') || '1 compra';

              return (
                <div
                  key={reward.id}
                  className={`p-3 sm:p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                    canAfford
                      ? 'bg-white border-amber-200/90 hover:border-amber-400 shadow-2xs hover:shadow-xs group'
                      : 'bg-slate-50/70 border-slate-200/70 opacity-70'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform ${
                        canAfford
                          ? 'bg-amber-50 border border-amber-200/80 group-hover:scale-105'
                          : 'bg-slate-100 border border-slate-200'
                      }`}
                    >
                      {renderRewardIcon(reward.points, reward.discountAmount, canAfford)}
                    </div>
                    <div className="min-w-0 space-y-0.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-xs sm:text-sm font-black text-slate-900 leading-tight truncate">
                          {displayTitle}
                        </h4>
                        <span
                          className={`text-[9.5px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                            canAfford
                              ? 'bg-amber-100/80 text-amber-900 border border-amber-200/70'
                              : 'bg-slate-100 text-slate-500 border border-slate-200'
                          }`}
                        >
                          {validityText}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 font-medium truncate">
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
                    className={`px-3.5 py-2 rounded-xl text-xs font-black shrink-0 transition-all flex items-center gap-1.5 ${
                      canAfford
                        ? 'bg-[#F5BA13] hover:bg-[#e2aa10] text-[#1D1D1F] active:scale-95 shadow-xs hover:shadow-sm cursor-pointer'
                        : 'bg-slate-100 border border-slate-200/80 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    {canAfford ? (
                      <>
                        <Sparkles className="w-3.5 h-3.5 text-[#1D1D1F]" />
                        <span>Canjear {reward.points} Pts</span>
                      </>
                    ) : (
                      <>
                        <Lock className="w-3 h-3 text-slate-400" />
                        <span>Faltan {reward.points - userPoints} Pts</span>
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* CUPONES ACTIVOS */}
        {activeCoupons && activeCoupons.length > 0 && (
          <div className="pt-3 border-t border-slate-100 shrink-0 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                Tus Cupones Disponibles ({activeCoupons.length})
              </span>
              <span className="text-[10px] text-amber-800 font-semibold">
                Listos para el checkout
              </span>
            </div>
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              {activeCoupons.map((coupon) => {
                const isCopied = copiedCouponId === coupon.id;
                return (
                  <div
                    key={coupon.id}
                    className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-50 to-white border border-amber-200/90 flex items-center gap-2.5 shrink-0 shadow-2xs text-[11px]"
                  >
                    <span className="font-mono font-black text-slate-900 tracking-wider">
                      {coupon.code}
                    </span>
                    <span className="text-slate-600 font-semibold truncate max-w-[120px]">
                      {coupon.title?.replace(/[\u{1F300}-\u{1F9FF}]/gu, '').trim() || 'Cupón'}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopyCode(coupon.code, coupon.id)}
                      className="px-2 py-0.5 rounded-lg bg-[#1D1D1F] hover:bg-slate-800 text-[#F5BA13] text-[9.5px] font-black flex items-center gap-1 cursor-pointer transition-colors active:scale-95"
                      title="Copiar código para el carrito"
                    >
                      {isCopied ? (
                        <>
                          <Check className="w-2.5 h-2.5 text-emerald-400" />
                          <span>¡Copiado!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-2.5 h-2.5" />
                          <span>Copiar</span>
                        </>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
