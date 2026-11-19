import React from 'react';
import { Plus, Ticket, Check, X, Trash2, MessageSquare, Handshake, TrendingUp, Percent, Sparkles } from 'lucide-react';

export default function AdminConveniosManager({
  convenios = [],
  setIsAddAgreementModalOpen,
  handleToggleConvenio,
  handleDeleteConvenio,
  setSelectedConvenioForCoupons,
  handleShareCouponsWhatsApp,
}) {
  const activeCount = convenios.filter((c) => c.active).length;
  const totalRedemptions = convenios.reduce((acc, c) => acc + (c.redemptionsCount || 0), 0);
  const derivedSales = totalRedemptions * 65000;
  const partnerCommissions = Math.round(derivedSales * 0.08);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* FinSet Bento KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* Card 1: Convenios activos */}
        <div className="finset-card bg-white border border-[#EAECEF] rounded-3xl p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[13px] font-semibold text-slate-600">Convenios activos</span>
            <span className="px-2.5 py-0.5 rounded-full border border-[#EAECEF] bg-[#F8FAFC] text-[10px] font-semibold text-slate-500">
              Alianzas
            </span>
          </div>
          <div className="my-3 flex items-baseline gap-1">
            <span className="text-[28px] leading-none font-extrabold text-[#111827] tracking-tight">
              {activeCount}
            </span>
            <span className="text-sm font-semibold text-slate-400">/ {convenios.length} registrados</span>
          </div>
          <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#EBF5F3] text-[#0E8388] text-[11px] font-bold">
              {convenios.length > 0 ? `${Math.round((activeCount / convenios.length) * 100)}% operativos` : 'Sin convenios'}
            </span>
            <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500">
              <span className="w-6 h-6 rounded-lg bg-[#EBF5F3] text-[#0E8388] flex items-center justify-center">
                <Handshake className="w-3.5 h-3.5" />
              </span>
              <span>Red local</span>
            </div>
          </div>
        </div>

        {/* Card 2: Ventas derivadas */}
        <div className="finset-card bg-white border border-[#EAECEF] rounded-3xl p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[13px] font-semibold text-slate-600">Ventas derivadas</span>
            <span className="px-2.5 py-0.5 rounded-full border border-[#EAECEF] bg-[#F8FAFC] text-[10px] font-semibold text-slate-500">
              CLP
            </span>
          </div>
          <div className="my-3 flex items-baseline">
            <span className="text-[28px] leading-none font-extrabold text-[#111827] tracking-tight">
              ${derivedSales.toLocaleString('es-CL')}
            </span>
            <span className="finset-suffix text-base font-semibold text-slate-300 ml-0.5">.00</span>
          </div>
          <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 text-[11px] font-bold">
              ↑ Ticket est. $65k
            </span>
            <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500">
              <span className="w-6 h-6 rounded-lg bg-[#EBF5F3] text-[#0E8388] flex items-center justify-center">
                <TrendingUp className="w-3.5 h-3.5" />
              </span>
              <span>Ingresos</span>
            </div>
          </div>
        </div>

        {/* Card 3: Comisiones aliados */}
        <div className="finset-card bg-white border border-[#EAECEF] rounded-3xl p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[13px] font-semibold text-slate-600">Comisiones aliados</span>
            <span className="px-2.5 py-0.5 rounded-full border border-[#EAECEF] bg-[#F8FAFC] text-[10px] font-semibold text-slate-500">
              CLP
            </span>
          </div>
          <div className="my-3 flex items-baseline">
            <span className="text-[28px] leading-none font-extrabold text-[#111827] tracking-tight">
              ${partnerCommissions.toLocaleString('es-CL')}
            </span>
            <span className="finset-suffix text-base font-semibold text-slate-300 ml-0.5">.00</span>
          </div>
          <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 text-[11px] font-bold">
              8% retorno prom.
            </span>
            <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500">
              <span className="w-6 h-6 rounded-lg bg-[#EBF5F3] text-[#0E8388] flex items-center justify-center">
                <Percent className="w-3.5 h-3.5" />
              </span>
              <span>Liquidación</span>
            </div>
          </div>
        </div>

        {/* Card 4: Canjes realizados */}
        <div className="finset-card bg-white border border-[#EAECEF] rounded-3xl p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[13px] font-semibold text-slate-600">Canjes realizados</span>
            <span className="px-2.5 py-0.5 rounded-full border border-[#EAECEF] bg-[#F8FAFC] text-[10px] font-semibold text-slate-500">
              Histórico
            </span>
          </div>
          <div className="my-3 flex items-baseline gap-1.5">
            <span className="text-[28px] leading-none font-extrabold text-[#111827] tracking-tight">
              {totalRedemptions}
            </span>
            <span className="text-sm font-semibold text-slate-400">canjes</span>
          </div>
          <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#EBF5F3] text-[#0E8388] text-[11px] font-bold">
              Códigos validados
            </span>
            <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500">
              <span className="w-6 h-6 rounded-lg bg-[#EBF5F3] text-[#0E8388] flex items-center justify-center">
                <Sparkles className="w-3.5 h-3.5" />
              </span>
              <span>Cupones</span>
            </div>
          </div>
        </div>
      </div>

      {/* Convenios Empty State or Bento Cards */}
      {convenios.length === 0 ? (
        <div className="finset-card bg-white border border-[#EAECEF] rounded-3xl p-12 text-center">
          <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-[#EBF5F3] border border-[#CBE4DE] flex items-center justify-center text-[#0E8388]">
            <Ticket className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-extrabold text-[#111827] tracking-tight">No hay convenios creados</h3>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto mt-1.5 mb-6 leading-relaxed">
            Registra alianzas comerciales con clínicas veterinarias, adiestradores, peluquerías y guarderías para generar cupones y seguimiento automático.
          </p>
          <button
            type="button"
            onClick={() => setIsAddAgreementModalOpen(true)}
            className="px-6 py-2.5 rounded-full bg-[#0E8388] hover:bg-[#0c7276] text-white text-xs font-bold transition-all shadow-sm shadow-[#0E8388]/20 inline-flex items-center gap-2 cursor-pointer active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Crear nuevo convenio</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {convenios.map((conv) => (
            <div
              key={conv.id}
              className="finset-card bg-white border border-[#EAECEF] rounded-3xl p-6 space-y-4 flex flex-col justify-between"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-[#EBF5F3] border border-[#CBE4DE]/70 flex items-center justify-center text-2xl shrink-0">
                    {conv.type === 'veterinaria' && '🏥'}
                    {conv.type === 'entrenamiento' && '🐕'}
                    {conv.type === 'peluqueria' && '✂️'}
                    {conv.type === 'guarderia' && '🏡'}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-extrabold text-[#111827] text-base tracking-tight">{conv.name}</h3>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          conv.active
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/80'
                            : 'bg-slate-100 text-slate-500 border border-slate-200'
                        }`}
                      >
                        {conv.active ? 'Activo' : 'Pausado'}
                      </span>
                      {conv.discountType === 'single_use' && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#EBF5F3] text-[#0E8388] border border-[#CBE4DE] flex items-center gap-1">
                          <Ticket className="w-3 h-3" />
                          Cupones únicos
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 font-medium mt-0.5">
                      {conv.typeLabel} · {conv.city}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleToggleConvenio(conv.id)}
                    className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-colors cursor-pointer ${
                      conv.active
                        ? 'bg-[#EBF5F3] text-[#0E8388] hover:bg-[#CBE4DE]/60 border border-[#CBE4DE]'
                        : 'bg-slate-100 text-slate-500 hover:bg-slate-200 border border-slate-200'
                    }`}
                    title={conv.active ? 'Pausar convenio' : 'Activar convenio'}
                  >
                    {conv.active ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => handleDeleteConvenio(conv.id)}
                    className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-rose-500 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200/80 transition-colors cursor-pointer"
                    title="Eliminar convenio"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Benefit details */}
              <div className="bg-[#F8FAFC] rounded-2xl p-4 border border-[#EAECEF] space-y-2.5 text-xs">
                {conv.discountType === 'single_use' ? (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 font-medium">Prefijo cupones</span>
                      <span className="font-mono font-bold text-[#0E8388] bg-[#EBF5F3] px-2.5 py-0.5 rounded-full border border-[#CBE4DE]">
                        {conv.codePrefix || 'SWD-'}XXXX
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 font-medium">Descuento cliente</span>
                      <span className="font-bold text-[#111827]">{conv.discountPercent || 10}% dcto. (1 uso por cliente)</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 font-medium">Estado de cupones</span>
                      <div className="flex items-center gap-1.5 font-bold">
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/70 text-[11px]">
                          {(conv.coupons || []).filter((c) => c.status === 'disponible').length} disponibles
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full bg-[#EBF5F3] text-[#2E4F4F] border border-[#CBE4DE] text-[11px]">
                          {(conv.coupons || []).filter((c) => c.status === 'canjeado').length} canjeados
                        </span>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 font-medium">Código promocional</span>
                      <span className="font-mono font-bold text-[#0E8388] bg-[#EBF5F3] px-2.5 py-0.5 rounded-full border border-[#CBE4DE]">
                        {conv.code}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 font-medium">Beneficio cliente</span>
                      <span className="font-semibold text-[#111827] truncate max-w-[220px]">{conv.benefitCustomer}</span>
                    </div>
                  </>
                )}

                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Retorno aliado</span>
                  <span className="font-bold text-[#0E8388]">{conv.commissionEntity}</span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-[#EAECEF] text-[11px]">
                  <span className="text-slate-400 font-medium">
                    Contacto: <strong className="text-slate-600">{conv.contactPerson}</strong> ({conv.phone})
                  </span>
                  <span className="text-emerald-600 font-bold">
                    {conv.discountType === 'single_use'
                      ? `${(conv.coupons || []).filter((c) => c.status === 'canjeado').length} canjes`
                      : `${conv.redemptionsCount || 0} canjes`}
                  </span>
                </div>
              </div>

              {/* Action buttons inside card */}
              {conv.discountType === 'single_use' && (
                <div className="pt-1 flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => setSelectedConvenioForCoupons(conv)}
                    className="flex-1 py-2.5 px-5 rounded-full bg-[#0E8388] hover:bg-[#0c7276] text-white font-bold text-xs shadow-sm shadow-[#0E8388]/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <Ticket className="w-4 h-4" />
                    <span>Gestionar cupones únicos ({conv.coupons?.length || 0})</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleShareCouponsWhatsApp(conv)}
                    title="Enviar lote disponible por WhatsApp"
                    className="w-10 h-10 rounded-full bg-[#EBF5F3] hover:bg-[#CBE4DE]/70 text-[#0E8388] border border-[#CBE4DE] flex items-center justify-center transition-colors cursor-pointer shrink-0"
                  >
                    <MessageSquare className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
