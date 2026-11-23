import React, { useState, useEffect } from 'react';
import { CreditCard, X } from 'lucide-react';
import { formatCLP } from '../adminUtils';

/**
 * Modal de configuración de comisiones de Tarjeta & Botón de Pago (Mercado Pago)
 * Usa estado borrador local para que "Cancelar" o "X" descarten cualquier cambio sin afectar la app ni Supabase.
 */
export default function MercadoPagoConfigModal({
  isOpen,
  mercadoPagoConfig,
  onSave,
  onClose,
}) {
  const [draftConfig, setDraftConfig] = useState(mercadoPagoConfig);

  useEffect(() => {
    if (isOpen) {
      setDraftConfig(mercadoPagoConfig);
    }
  }, [isOpen, mercadoPagoConfig]);

  if (!isOpen) return null;

  const activeCfg = draftConfig || mercadoPagoConfig || {};
  const wRate = Number(activeCfg.webRatePercent ?? activeCfg.commissionRatePercent ?? 3.19);
  const creditRate = Number(activeCfg.creditCardRatePercent ?? activeCfg.cardRatePercent ?? 2.69);
  const debitRate = Number(activeCfg.debitCardRatePercent ?? 2.19);
  const fixed = Number(activeCfg.fixedFeeCLP || 0);
  const addIva = activeCfg.addIvaToCommission !== false;
  const mult = addIva ? 1 + Number(activeCfg.ivaPercent || 19) / 100 : 1;

  const sampleAmount = 20000;
  const sampleWebFee = Math.round((sampleAmount * (wRate / 100) + fixed) * mult);
  const sampleCreditFee = Math.round((sampleAmount * (creditRate / 100) + fixed) * mult);
  const sampleDebitFee = Math.round((sampleAmount * (debitRate / 100) + fixed) * mult);

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl max-w-xl w-full border border-slate-200 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
      >
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-blue-50/80">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-blue-600 text-white shadow-xs">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900">
                Comisiones Mercado Pago (Web, POS y Despacho)
              </h3>
              <p className="text-[11px] text-slate-500 font-medium">
                Tasas descontadas automáticamente antes de calcular utilidad neta y reparto de socios
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSave?.({
              ...activeCfg,
              webRatePercent: wRate,
              commissionRatePercent: wRate,
              creditCardRatePercent: creditRate,
              debitCardRatePercent: debitRate,
              cardRatePercent: creditRate,
              addIvaToCommission: addIva,
            });
            onClose();
          }}
          className="p-6 space-y-4 text-xs"
        >
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div>
              <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1.5">
                Checkout Pro Web (%)
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="15"
                  value={activeCfg.webRatePercent ?? activeCfg.commissionRatePercent ?? 3.19}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value) || 0;
                    setDraftConfig((prev) => ({
                      ...prev,
                      webRatePercent: val,
                      commissionRatePercent: val,
                    }));
                  }}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-mono font-bold text-slate-900 focus:bg-white focus:border-[#D97706] focus:outline-none"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">%</span>
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block">
                Botón web online (3,19%)
              </span>
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1.5">
                Crédito Físico (%)
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="15"
                  value={activeCfg.creditCardRatePercent ?? activeCfg.cardRatePercent ?? 2.69}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value) || 0;
                    setDraftConfig((prev) => ({
                      ...prev,
                      creditCardRatePercent: val,
                      cardRatePercent: val,
                    }));
                  }}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-mono font-bold text-slate-900 focus:bg-white focus:border-[#D97706] focus:outline-none"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">%</span>
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block">
                POS + contra entrega (2,69%)
              </span>
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1.5">
                Débito / Dinero MP (%)
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="15"
                  value={activeCfg.debitCardRatePercent ?? 2.19}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value) || 0;
                    setDraftConfig((prev) => ({
                      ...prev,
                      debitCardRatePercent: val,
                    }));
                  }}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-mono font-bold text-slate-900 focus:bg-white focus:border-[#D97706] focus:outline-none"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">%</span>
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block">
                Débito o QR MP físico (2,19%)
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1.5">
                IVA sobre Comisión (19%)
              </label>
              <select
                value={addIva ? 'add_iva' : 'direct'}
                onChange={(e) =>
                  setDraftConfig((prev) => ({
                    ...prev,
                    addIvaToCommission: e.target.value === 'add_iva',
                  }))
                }
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-900 focus:bg-white focus:border-[#D97706] focus:outline-none cursor-pointer"
              >
                <option value="add_iva">Sumar +19% IVA a la comisión (Real Mercado Pago)</option>
                <option value="direct">% directo final (IVA incluido)</option>
              </select>
              <span className="text-[10px] text-slate-400 mt-1 block">
                Mercado Pago descuenta comisión + 19% IVA al instante
              </span>
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1.5">
                Cargo Fijo Opcional ($ CLP)
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="10"
                  min="0"
                  value={activeCfg.fixedFeeCLP ?? 0}
                  onChange={(e) =>
                    setDraftConfig((prev) => ({
                      ...prev,
                      fixedFeeCLP: parseInt(e.target.value, 10) || 0,
                    }))
                  }
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-mono font-bold text-slate-900 focus:bg-white focus:border-[#D97706] focus:outline-none"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">CLP</span>
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block">Por defecto $0 CLP</span>
            </div>
          </div>

          {/* Simulation Box */}
          <div className="p-3.5 rounded-2xl bg-blue-50/70 border border-blue-100 space-y-2">
            <div className="text-[11px] font-bold text-blue-900">
              Simulación en vivo sobre una venta de $20.000 CLP ({addIva ? '+ 19% IVA sobre comisión' : 'tasa directa'}):
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[10px]">
              <div className="p-2.5 rounded-xl bg-white border border-blue-200/70 space-y-0.5">
                <div className="font-black text-slate-800">Checkout Pro ({wRate}%)</div>
                <div className="text-rose-600 font-mono font-bold">Desc.: -{formatCLP(sampleWebFee)}</div>
                <div className="text-emerald-700 font-mono font-bold">Recibes: {formatCLP(sampleAmount - sampleWebFee)}</div>
              </div>
              <div className="p-2.5 rounded-xl bg-white border border-blue-200/70 space-y-0.5">
                <div className="font-black text-slate-800">Crédito Físico ({creditRate}%)</div>
                <div className="text-rose-600 font-mono font-bold">Desc.: -{formatCLP(sampleCreditFee)}</div>
                <div className="text-emerald-700 font-mono font-bold">Recibes: {formatCLP(sampleAmount - sampleCreditFee)}</div>
              </div>
              <div className="p-2.5 rounded-xl bg-white border border-blue-200/70 space-y-0.5">
                <div className="font-black text-slate-800">Débito / MP ({debitRate}%)</div>
                <div className="text-rose-600 font-mono font-bold">Desc.: -{formatCLP(sampleDebitFee)}</div>
                <div className="text-emerald-700 font-mono font-bold">Recibes: {formatCLP(sampleAmount - sampleDebitFee)}</div>
              </div>
            </div>
          </div>

          {/* Modal Actions */}
          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black shadow-md shadow-blue-600/20 transition-all cursor-pointer"
            >
              Guardar Configuración
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
