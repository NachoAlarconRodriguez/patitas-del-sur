import React from 'react';
import { CreditCard, X } from 'lucide-react';
import { formatCLP } from '../adminUtils';

/**
 * Modal de configuración de comisiones de Tarjeta & Botón de Pago (Mercado Pago)
 */
export default function MercadoPagoConfigModal({
  isOpen,
  mercadoPagoConfig,
  setMercadoPagoConfig,
  onClose,
  showToast,
}) {
  if (!isOpen) return null;

  const cRate = Number(mercadoPagoConfig.cardRatePercent ?? 2.55);
  const wRate = Number(mercadoPagoConfig.webRatePercent ?? 3.19);
  const fixed = Number(mercadoPagoConfig.fixedFeeCLP || 0);
  const mult = mercadoPagoConfig.addIvaToCommission
    ? 1 + Number(mercadoPagoConfig.ivaPercent || 19) / 100
    : 1;
  const sampleCardFee = Math.round((10000 * (cRate / 100) + fixed) * mult);
  const sampleWebFee = Math.round((10000 * (wRate / 100) + fixed) * mult);

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-blue-50/80">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-blue-600 text-white shadow-xs">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900">
                Comisiones de Tarjeta &amp; Botón de Pago
              </h3>
              <p className="text-[11px] text-slate-500 font-medium">
                Porcentajes descontados antes de repartir la ganancia 50/50 entre socios
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
            onClose();
            showToast(
              `Tasas actualizadas: Tarjeta ${mercadoPagoConfig.cardRatePercent ?? 2.55}% • Botón de Pago ${mercadoPagoConfig.webRatePercent ?? 3.19}%.`
            );
          }}
          className="p-6 space-y-4 text-xs"
        >
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1.5">
                💳 Máquina / Tarjeta (%)
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="15"
                  value={mercadoPagoConfig.cardRatePercent ?? 2.55}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value) || 0;
                    setMercadoPagoConfig((prev) => ({
                      ...prev,
                      cardRatePercent: val,
                    }));
                  }}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-mono font-bold text-slate-900 focus:bg-white focus:border-[#D97706] focus:outline-none"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">%</span>
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block">
                Tasa fija única (cubre Débito/Crédito: 2,55%)
              </span>
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1.5">
                🌐 Botón de Pago Web (%)
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="15"
                  value={mercadoPagoConfig.webRatePercent ?? mercadoPagoConfig.commissionRatePercent ?? 3.19}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value) || 0;
                    setMercadoPagoConfig((prev) => ({
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
                Sobre el monto total c/IVA (3,19%)
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1.5">
                Modo de Cálculo (IVA)
              </label>
              <select
                value={mercadoPagoConfig.addIvaToCommission ? 'add_iva' : 'direct'}
                onChange={(e) =>
                  setMercadoPagoConfig((prev) => ({
                    ...prev,
                    addIvaToCommission: e.target.value === 'add_iva',
                  }))
                }
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-900 focus:bg-white focus:border-[#D97706] focus:outline-none cursor-pointer"
              >
                <option value="direct">Opción A: % directo final (IVA incl.)</option>
                <option value="add_iva">Opción B: Sumar +19% IVA a comisión</option>
              </select>
              <span className="text-[10px] text-slate-400 mt-1 block">Opción A activa por defecto</span>
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
                  value={mercadoPagoConfig.fixedFeeCLP ?? 0}
                  onChange={(e) =>
                    setMercadoPagoConfig((prev) => ({
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
              Simulación sobre una venta de $10.000 CLP (ej. PED-0006):
            </div>
            <div className="grid grid-cols-2 gap-2.5 text-[10px]">
              <div className="p-2.5 rounded-xl bg-white border border-blue-200/70 space-y-0.5">
                <div className="font-black text-slate-800">💳 Con Tarjeta ({cRate}%)</div>
                <div className="text-rose-600 font-mono font-bold">Comisión: -{formatCLP(sampleCardFee)}</div>
                <div className="text-emerald-700 font-mono font-bold">Líquido: {formatCLP(10000 - sampleCardFee)}</div>
              </div>
              <div className="p-2.5 rounded-xl bg-white border border-blue-200/70 space-y-0.5">
                <div className="font-black text-slate-800">🌐 Botón Web ({wRate}%)</div>
                <div className="text-rose-600 font-mono font-bold">Comisión: -{formatCLP(sampleWebFee)}</div>
                <div className="text-emerald-700 font-mono font-bold">Líquido: {formatCLP(10000 - sampleWebFee)}</div>
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
