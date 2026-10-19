import React from 'react';
import { Plus, Ticket, Check, X, Trash2, MessageSquare } from 'lucide-react';

export default function AdminConveniosManager({
  convenios = [],
  setIsAddAgreementModalOpen,
  handleToggleConvenio,
  handleDeleteConvenio,
  setSelectedConvenioForCoupons,
  handleShareCouponsWhatsApp,
}) {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Convenios Stats Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs">
          <span className="text-slate-500 text-[10px] uppercase font-bold">Convenios Activos</span>
          <div className="text-2xl font-black text-slate-900 mt-1">{convenios.filter((c) => c.active).length}</div>
        </div>
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs">
          <span className="text-slate-500 text-[10px] uppercase font-bold">Ventas Derivadas</span>
          <div className="text-2xl font-black text-emerald-700 mt-1">
            ${(convenios.reduce((acc, c) => acc + (c.redemptionsCount || 0), 0) * 65000).toLocaleString('es-CL')}
          </div>
        </div>
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs">
          <span className="text-slate-500 text-[10px] uppercase font-bold">Comisiones Aliados</span>
          <div className="text-2xl font-black text-purple-700 mt-1">
            ${Math.round(convenios.reduce((acc, c) => acc + (c.redemptionsCount || 0), 0) * 65000 * 0.08).toLocaleString('es-CL')}
          </div>
        </div>
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs">
          <span className="text-slate-500 text-[10px] uppercase font-bold">Canjes Realizados</span>
          <div className="text-2xl font-black text-amber-700 mt-1">
            {convenios.reduce((acc, c) => acc + (c.redemptionsCount || 0), 0)} canjes
          </div>
        </div>
      </div>

      {/* Convenios Table / Cards */}
      {convenios.length === 0 ? (
        <div className="bg-white border border-slate-200/80 rounded-3xl p-12 text-center shadow-xs">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-[#0E8388]/10 border border-[#0E8388]/20 flex items-center justify-center text-2xl text-[#0E8388]">
            🤝
          </div>
          <h3 className="text-lg font-black text-slate-900">No hay convenios creados</h3>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto mt-1 mb-6">
            Todos los convenios han sido eliminados. Puedes registrar nuevas alianzas comerciales con veterinarias, adiestradores y guarderías cuando lo necesites.
          </p>
          <button
            type="button"
            onClick={() => setIsAddAgreementModalOpen(true)}
            className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-[#0E8388] to-[#10B981] text-white text-xs font-extrabold shadow-md shadow-[#0E8388]/20 hover:opacity-95 transition-all inline-flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Crear Nuevo Convenio</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {convenios.map((conv) => (
            <div
              key={conv.id}
              className="bg-white border border-slate-200/80 rounded-3xl p-6 space-y-4 shadow-sm flex flex-col justify-between"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center text-2xl shrink-0">
                    {conv.type === 'veterinaria' && '🏥'}
                    {conv.type === 'entrenamiento' && '🐕'}
                    {conv.type === 'peluqueria' && '✂️'}
                    {conv.type === 'guarderia' && '🏡'}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-black text-slate-900 text-base">{conv.name}</h3>
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                        conv.active
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-slate-100 text-slate-500'
                      }`}>
                        {conv.active ? 'Activo' : 'Pausado'}
                      </span>
                      {conv.discountType === 'single_use' && (
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-purple-50 text-purple-700 border border-purple-200 flex items-center gap-1">
                          <Ticket className="w-3 h-3" />
                          Cupones Únicos
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 font-medium">{conv.typeLabel} • {conv.city}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleToggleConvenio(conv.id)}
                    className={`p-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                      conv.active
                        ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                        : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                    }`}
                    title={conv.active ? 'Pausar Convenio' : 'Activar Convenio'}
                  >
                    {conv.active ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => handleDeleteConvenio(conv.id)}
                    className="p-2 rounded-xl text-xs font-bold text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 transition-colors cursor-pointer"
                    title="Eliminar Convenio"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Benefit details */}
              <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-100 space-y-2.5 text-xs">
                {conv.discountType === 'single_use' ? (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Prefijo Cupones:</span>
                      <span className="font-mono font-black text-[#0E8388] bg-[#0E8388]/10 px-2.5 py-0.5 rounded border border-[#0E8388]/20">
                        {conv.codePrefix || 'SWD-'}XXXX
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Descuento Cliente:</span>
                      <span className="font-bold text-slate-800">{conv.discountPercent || 10}% Descuento (1 uso por cliente)</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Estado de Cupones:</span>
                      <div className="flex items-center gap-1.5 font-bold">
                        <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[11px]">
                          {(conv.coupons || []).filter(c => c.status === 'disponible').length} Disponibles
                        </span>
                        <span className="px-2 py-0.5 rounded bg-purple-100 text-purple-800 text-[11px]">
                          {(conv.coupons || []).filter(c => c.status === 'canjeado').length} Canjeados
                        </span>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Código Promocional:</span>
                      <span className="font-mono font-black text-[#0E8388] bg-[#0E8388]/10 px-2.5 py-0.5 rounded border border-[#0E8388]/20">
                        {conv.code}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Beneficio Cliente:</span>
                      <span className="font-semibold text-slate-800 truncate max-w-[200px]">{conv.benefitCustomer}</span>
                    </div>
                  </>
                )}

                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Retorno Aliado:</span>
                  <span className="font-bold text-purple-700">{conv.commissionEntity}</span>
                </div>
                <div className="flex items-center justify-between pt-1 border-t border-slate-200 text-[11px]">
                  <span className="text-slate-500">Contacto: {conv.contactPerson} ({conv.phone})</span>
                  <span className="text-emerald-700 font-bold">
                    {conv.discountType === 'single_use'
                      ? `${(conv.coupons || []).filter(c => c.status === 'canjeado').length} canjes`
                      : `${conv.redemptionsCount || 0} canjes`}
                  </span>
                </div>
              </div>

              {/* Action buttons inside card */}
              {conv.discountType === 'single_use' && (
                <div className="pt-1 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedConvenioForCoupons(conv)}
                    className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#0E8388] to-[#10B981] hover:opacity-95 text-white font-extrabold text-xs shadow-md shadow-[#0E8388]/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <Ticket className="w-4 h-4" />
                    <span>Gestionar Cupones Únicos ({conv.coupons?.length || 0})</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleShareCouponsWhatsApp(conv)}
                    title="Enviar lote disponible por WhatsApp"
                    className="p-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 transition-colors cursor-pointer"
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
