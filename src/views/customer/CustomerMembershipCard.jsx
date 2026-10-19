import React from 'react';
import { Award, Sparkles } from 'lucide-react';

export default function CustomerMembershipCard({
  currentUser,
  userPoints = 0,
  activeCoupons = [],
  onOpenRedeemModal,
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
      {/* Left 5 Cols: CUSTOM PATITAS DEL SUR BRAND VIP MEMBERSHIP CARD */}
      <div className="lg:col-span-5 flex flex-col justify-between">
        <div className="w-full aspect-[1.58/1] rounded-3xl p-6 text-slate-900 bg-gradient-to-br from-[#E6F4F1] via-[#FAF9F5] to-[#CBE5E1] shadow-2xl border-2 border-[#0E8388]/30 relative overflow-hidden flex flex-col justify-between group transform transition-transform hover:scale-[1.02]">
          {/* Watermarked Official Patitas del Sur Logo Outline in Background */}
          <img
            src="/images/logo_patitas_del_sur.svg"
            alt=""
            className="absolute -right-8 -bottom-10 h-64 w-auto opacity-15 pointer-events-none select-none filter contrast-125"
          />

          {/* Decorative Brand Color Bar at Top */}
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#0A3E40] via-[#0E8388] to-[#10B981]" />

          {/* Card Top Row: Official Logo & Tier Badge */}
          <div className="relative z-10 flex items-center justify-between pt-1">
            <img
              src="/images/logo_patitas_del_sur.svg"
              alt="Patitas del Sur"
              className="h-10 w-auto object-contain drop-shadow-xs"
            />

            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0A3E40] text-white shadow-md border border-[#0E8388]/40">
              <Award className="w-3.5 h-3.5 text-amber-300" />
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-300">
                SOCIO ORO 🥇
              </span>
            </div>
          </div>

          {/* Card Middle Row: Member Name, ID & Points Balance */}
          <div className="relative z-10 space-y-1.5 my-auto pt-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-black tracking-widest text-[#0E8388]">
                Tarjeta de Fidelización Oficial
              </span>
              <span className="text-[10px] font-mono font-bold text-slate-600">
                N° #PTS-1042
              </span>
            </div>

            <div className="text-xl md:text-2xl font-black text-slate-900 tracking-tight flex items-baseline justify-between">
              <span>{currentUser?.name || 'Tutor Patitas'}</span>
              <span className="text-xs font-bold text-slate-500 font-mono">2026 / 2027</span>
            </div>

            {/* Points Box */}
            <div className="p-3 rounded-2xl bg-white/90 border border-[#0E8388]/30 shadow-xs flex items-center justify-between backdrop-blur-md">
              <div>
                <span className="text-[9px] uppercase font-black text-slate-500 block">Saldo de Puntos</span>
                <span className="text-2xl font-black text-[#0A3E40]">{userPoints.toLocaleString('es-CL')} PTS</span>
              </div>
              <div className="text-right">
                <span className="text-[9px] uppercase font-black text-slate-500 block">Valor Canjeable</span>
                <span className="text-xs font-black text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                  ${(userPoints * 10).toLocaleString('es-CL')} CLP Dcto
                </span>
              </div>
            </div>
          </div>

          {/* Card Bottom Row: Pet Icons & Brand Guarantee */}
          <div className="relative z-10 flex items-center justify-between text-xs font-bold text-slate-600 pt-2 border-t border-slate-200/80">
            <div className="flex items-center gap-1.5 text-[11px] font-black text-[#0A3E40]">
              <span>🐾 Mascotas: {currentUser?.petName || 'Mis Mascotas'}</span>
            </div>
            <div className="text-[10px] font-extrabold text-[#0E8388] uppercase tracking-wider">
              Patitas del Sur SpA
            </div>
          </div>
        </div>
      </div>

      {/* Right 7 Cols: Progress Bar & Milestone Tier Rewards Panel */}
      <div className="lg:col-span-7 bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-md flex flex-col justify-between space-y-6">
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <span className="px-3 py-1 rounded-full text-xs font-black bg-amber-100 text-amber-900 border border-amber-300 inline-block mb-1">
                Canje de Puntos por Compras 🚀
              </span>
              <h3 className="text-xl font-black text-slate-900">
                {userPoints < 1500 ? 'Próximo Beneficio: Envío Gratis (2 compras) 🚚' : '¡Tienes puntos listos para canjear! 🎁'}
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Al canjear un cupón, los puntos se descuentan y el beneficio aplica en tus compras indicadas.
              </p>
            </div>
            <button
              type="button"
              onClick={onOpenRedeemModal}
              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-[#0A3E40] to-[#0E8388] text-white font-black text-xs shadow-md transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-1.5 shrink-0 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Canjear Puntos</span>
            </button>
          </div>

          {/* Progress Bar Container */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex justify-between text-xs font-black">
              <span className="text-slate-700">
                {userPoints < 1500 ? 'Progreso para Envío Gratis (1.500 Pts):' : 'Progreso a 2.000 Pts (20% Dcto + Regalo):'}
              </span>
              <span className="text-[#0E8388]">
                {userPoints < 1500
                  ? `¡Faltan solo ${1500 - userPoints} Pts! (${Math.round((userPoints / 1500) * 100)}%)`
                  : userPoints < 2000
                  ? `¡Faltan ${2000 - userPoints} Pts! (${Math.round((userPoints / 2000) * 100)}%)`
                  : '¡Nivel Máximo de Recompensas Alcanzado!'}
              </span>
            </div>
            <div className="w-full h-4 rounded-full bg-slate-200 overflow-hidden p-0.5 border border-slate-300">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#0A3E40] via-[#0E8388] to-[#10B981] transition-all duration-700 shadow-md relative"
                style={{ width: `${Math.min(100, (userPoints / 1500) * 100)}%` }}
              >
                <div className="absolute inset-0 bg-white/20 animate-pulse" />
              </div>
            </div>
          </div>
        </div>

        {/* Milestone Tiers Horizontal List (Explicit Validity Per Purchases) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* Milestone 1: 500 Pts */}
          <div className={`p-3 rounded-2xl border text-xs space-y-1 ${userPoints >= 500 ? 'bg-emerald-50 border-emerald-200' : 'bg-slate-50 border-slate-200 opacity-60'}`}>
            <div className="text-[10px] font-black text-emerald-800 uppercase">500 Pts</div>
            <div className="font-extrabold text-slate-900">$5.000 Dcto</div>
            <div className="text-[10px] text-slate-600 font-medium">Válido: 1 compra</div>
            <div className={`text-[10px] font-black ${userPoints >= 500 ? 'text-emerald-700' : 'text-slate-400'}`}>
              {userPoints >= 500 ? '✓ Canjeable' : '🔒 Faltan Pts'}
            </div>
          </div>

          {/* Milestone 2: 1000 Pts */}
          <div className={`p-3 rounded-2xl border text-xs space-y-1 ${userPoints >= 1000 ? 'bg-emerald-50 border-emerald-200' : 'bg-slate-50 border-slate-200 opacity-60'}`}>
            <div className="text-[10px] font-black text-emerald-800 uppercase">1.000 Pts</div>
            <div className="font-extrabold text-slate-900">$10.000 Dcto</div>
            <div className="text-[10px] text-slate-600 font-medium">Válido: 1 compra</div>
            <div className={`text-[10px] font-black ${userPoints >= 1000 ? 'text-emerald-700' : 'text-slate-400'}`}>
              {userPoints >= 1000 ? '✓ Canjeable' : '🔒 Faltan Pts'}
            </div>
          </div>

          {/* Milestone 3: 1500 Pts */}
          <div className={`p-3 rounded-2xl border text-xs space-y-1 ${userPoints >= 1500 ? 'bg-emerald-50 border-emerald-200' : 'bg-amber-50 border-2 border-amber-300 shadow-xs'}`}>
            <div className="text-[10px] font-black text-amber-900 uppercase">1.500 Pts ⚡</div>
            <div className="font-extrabold text-slate-900">Envío Gratis</div>
            <div className="text-[10px] text-slate-600 font-medium">Válido: 2 compras</div>
            <div className="text-[10px] text-amber-800 font-black">
              {userPoints >= 1500 ? '✓ Canjeable' : '¡Próxima Meta!'}
            </div>
          </div>

          {/* Milestone 4: 2000 Pts */}
          <div className={`p-3 rounded-2xl border text-xs space-y-1 ${userPoints >= 2000 ? 'bg-emerald-50 border-emerald-200' : 'bg-slate-50 border-slate-200 opacity-70'}`}>
            <div className="text-[10px] font-black text-slate-500 uppercase">2.000 Pts 🔒</div>
            <div className="font-extrabold text-slate-700">20% + Regalo</div>
            <div className="text-[10px] text-slate-600 font-medium">Válido: 1 compra</div>
            <div className="text-[10px] text-slate-500 font-bold">
              {userPoints >= 2000 ? '✓ Canjeable' : 'Bloqueado'}
            </div>
          </div>
        </div>

        {/* Active Redeemed Coupons List */}
        {activeCoupons.length > 0 && (
          <div className="pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-[11px] font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <span>🎟️</span>
                <span>Cupones Activos Canjeados ({activeCoupons.length})</span>
              </span>
              <span className="text-[10px] text-slate-400 font-bold">Listos para aplicar al pagar</span>
            </div>

            <div className="flex gap-2 overflow-x-auto pb-1">
              {activeCoupons.map((coupon) => (
                <div
                  key={coupon.id}
                  className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 text-xs flex items-center justify-between gap-3 shrink-0 shadow-2xs"
                >
                  <div>
                    <div className="font-black text-emerald-950 text-xs">{coupon.title}</div>
                    <div className="text-[10px] text-emerald-700 font-bold flex items-center gap-1.5 mt-0.5">
                      <span className="bg-emerald-100 px-1.5 py-0.2 rounded-md font-mono">{coupon.code}</span>
                      <span>• {coupon.validity}</span>
                    </div>
                  </div>
                  <span className="text-[9px] font-black bg-emerald-600 text-white px-2 py-0.5 rounded-full">
                    Activo
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
