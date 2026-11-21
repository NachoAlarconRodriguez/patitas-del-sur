import React from 'react';
import { Receipt, Edit2, Printer, Trash2, X, Building2, Truck } from 'lucide-react';
import { formatCLP, formatCLPDate, resolveInvoiceItems, getInvoiceTotalWithFreight, isPurchaseInvoicePaid } from '../adminUtils';
import { COMPANY_INFO } from '../adminConstants';

/**
 * Modal de Detalle de Factura Electrónica (DTE) con desglose de productos, flete e IVA
 */
export default function InvoiceDetailModal({
  invoice,
  inventory,
  onOpenEditInvoice,
  onToggleInvoiceStatus,
  onDeleteInvoice,
  onClose,
}) {
  if (!invoice) return null;

  const invItems = resolveInvoiceItems(invoice, inventory);
  const invNumber = invoice.invoiceNumber || invoice.id;
  const isPaid = isPurchaseInvoicePaid(invoice);
  const isOverdue = (invoice.status || '').toLowerCase() === 'vencida';
  const totalUnits = invItems.reduce((acc, it) => acc + (it.qty || 1), 0);

  const totals = getInvoiceTotalWithFreight(invoice);
  const sNeto = totals.shippingNeto;
  const sIva = totals.shippingIva;
  const sConIva = totals.shippingBruto;
  const hasShipping = sNeto > 0;
  const sMethod = invoice.shippingDistributionMethod || invoice.shipping_distribution_method || 'value';
  const sInvNum = invoice.shippingInvoiceNumber || invoice.shipping_invoice_number;
  const sProv = invoice.shippingProvider || invoice.shipping_provider;

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl border border-slate-200/90 overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Toolbar */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200/80 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-200 text-[#D97706] flex items-center justify-center shadow-2xs">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-slate-900">Detalle de Factura</h3>
                <span className="font-mono text-xs font-bold text-[#D97706] bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200/60">
                  #{invNumber}
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                Documento Tributario Electrónico (DTE) • Compra y reposición de stock
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onOpenEditInvoice(invoice)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200/90 text-amber-800 hover:bg-amber-100 text-xs font-bold shadow-2xs transition-all cursor-pointer"
              title="Editar productos y costo de transporte"
            >
              <Edit2 className="w-3.5 h-3.5 text-amber-600" />
              <span>Editar</span>
            </button>
            {onDeleteInvoice && (
              <button
                type="button"
                onClick={() => onDeleteInvoice(invoice)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 border border-rose-200/90 text-rose-700 hover:bg-rose-100 text-xs font-bold shadow-2xs transition-all cursor-pointer"
                title="Eliminar factura y revertir stock"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                <span className="hidden sm:inline">Eliminar</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-bold shadow-2xs transition-colors cursor-pointer"
              title="Imprimir o guardar comprobante"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Imprimir</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
              title="Cerrar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Hoja de Factura */}
        <div className="p-6 sm:p-8 overflow-y-auto flex-1 space-y-6 text-xs text-slate-800 bg-white no-scrollbar">
          {/* 1. Encabezado DTE */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 pb-6 border-b border-slate-200">
            <div className="space-y-1.5 flex-1 min-w-0">
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-bold uppercase tracking-wider">
                <Building2 className="w-3 h-3" />
                <span>Proveedor Emisor</span>
              </div>
              <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight leading-tight">
                {invoice.provider || 'Proveedor Autorizado'}
              </h2>
              <div className="space-y-0.5 text-[11px] text-slate-600 font-medium">
                <p>
                  <span className="text-slate-400 font-normal">R.U.T.:</span>{' '}
                  <strong className="font-mono font-bold text-slate-900">
                    {invoice.rut || 'RUT no registrado'}
                  </strong>
                </p>
                <p>
                  <span className="text-slate-400 font-normal">Giro:</span> Distribución Mayorista de Alimentos y Artículos para Mascotas
                </p>
                <p>
                  <span className="text-slate-400 font-normal">Ciudad:</span> Puerto Varas, Región de Los Lagos
                </p>
              </div>
            </div>

            <div className="border-2 border-red-600 rounded-2xl p-4 text-center bg-red-50/20 text-red-700 min-w-[210px] shrink-0 shadow-2xs self-center sm:self-start">
              <div className="font-mono font-bold text-xs text-red-800 tracking-wide">
                R.U.T.: {invoice.rut || 'Sin RUT'}
              </div>
              <div className="font-black text-xs uppercase tracking-wider text-red-600 my-1 py-1 border-y border-red-600/30">
                FACTURA ELECTRÓNICA
              </div>
              <div className="font-mono text-xl font-black text-red-700">N° {invNumber}</div>
              <div className="text-[9px] font-bold text-red-500 uppercase tracking-widest mt-1">
                S.I.I. - PUERTO MONTT
              </div>
            </div>
          </div>

          {/* 2. Datos del Receptor y Fechas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-50/90 border border-slate-200/80 text-xs">
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block">
                Receptor / Adquiriente:
              </span>
              <p className="font-black text-slate-900 text-sm">{COMPANY_INFO.displayName}</p>
              <p className="text-slate-600 text-[11px]">
                <span className="text-slate-400 font-normal">R.U.T.:</span>{' '}
                <span className="font-mono font-bold text-slate-800">{COMPANY_INFO.rut}</span>
              </p>
              <p className="text-slate-600 text-[11px]">
                <span className="text-slate-400 font-normal">Giro:</span> {COMPANY_INFO.giro}
              </p>
              <p className="text-slate-600 text-[11px]">
                <span className="text-slate-400 font-normal">Dirección:</span> {COMPANY_INFO.address}
              </p>
            </div>

            <div className="space-y-1 sm:border-l sm:border-slate-200 sm:pl-4">
              <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block">
                Condiciones del Documento:
              </span>
              <div className="grid grid-cols-2 gap-2 pt-0.5">
                <div>
                  <span className="text-slate-400 text-[10px] block">Fecha Emisión:</span>
                  <span className="font-mono font-bold text-slate-800 text-[11px]">
                    {formatCLPDate(invoice.date)}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block">Fecha Vencimiento:</span>
                  <span className="font-mono font-bold text-slate-800 text-[11px]">
                    {formatCLPDate(invoice.dueDate || invoice.date)}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block">Forma de Pago:</span>
                  <span className="font-bold text-slate-700 text-[11px]">
                    {invoice.paymentMethod || 'Crédito Proveedor'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block">Estado Factura:</span>
                  <button
                    type="button"
                    onClick={() => onToggleInvoiceStatus(invoice.id || invNumber)}
                    className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase border mt-0.5 inline-flex items-center gap-1 cursor-pointer transition-all hover:scale-105 ${
                      isPaid
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : isOverdue
                        ? 'bg-rose-50 text-rose-700 border-rose-200'
                        : 'bg-amber-50 text-amber-700 border-amber-200'
                    }`}
                    title="Clic para cambiar estado Pagada / Pendiente"
                  >
                    <span>●</span>
                    <span>{isPaid ? 'pagada' : (invoice.status || 'pendiente')}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Bloque Flete */}
          {hasShipping && (
            <div className="p-3.5 rounded-2xl bg-amber-50/90 border border-amber-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-white border border-amber-200 text-[#D97706] flex items-center justify-center font-bold text-sm shrink-0 shadow-2xs">
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-black text-slate-900 text-xs">
                      Transporte y Despacho Asociado al Pedido
                    </span>
                    {sInvNum && (
                      <span className="font-mono text-[10px] font-bold text-[#D97706] bg-white px-2 py-0.5 rounded-md border border-amber-200 shadow-2xs">
                        DTE Flete #{sInvNum}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-600 mt-0.5">
                    Transportista: <strong className="text-slate-800">{sProv || 'Despacho Proveedor'}</strong> • Flete neto:{' '}
                    <strong className="text-slate-900 font-mono">+{formatCLP(sNeto)}</strong> • IVA Flete (19%):{' '}
                    <strong className="text-emerald-700 font-mono">+{formatCLP(sIva)}</strong> • Flete c/IVA:{' '}
                    <strong className="text-[#D97706] font-mono">+{formatCLP(sConIva)}</strong>
                  </p>
                </div>
              </div>
              <div className="sm:text-right shrink-0 bg-white/70 sm:bg-transparent p-2 sm:p-0 rounded-xl">
                <span className="text-[9px] font-bold uppercase text-slate-400 block tracking-wider">
                  Criterio Prorrateo
                </span>
                <span className="text-[11px] font-bold text-[#D97706]">
                  {sMethod === 'value' ? 'Proporcional por Valor Neto' : 'Equitativo por Unidades'}
                </span>
              </div>
            </div>
          )}

          {/* 3. Tabla Detallada de Productos */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black uppercase text-slate-700 tracking-wider">
                Detalle de Productos, Unidades &amp; Costos Netos
              </span>
              <span className="text-[10px] text-slate-500 font-bold bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200">
                {invItems.length} ítems en factura • {totalUnits} unidades
              </span>
            </div>

            <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100/90 text-slate-600 uppercase tracking-wider text-[10px] border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3 text-center w-10">#</th>
                    <th className="py-2.5 px-3">Descripción del Producto</th>
                    <th className="py-2.5 px-3 text-center">Formato / Peso</th>
                    <th className="py-2.5 px-3 text-center">Cantidad</th>
                    <th className="py-2.5 px-3 text-right">Costo Unitario (Neto)</th>
                    <th className="py-2.5 px-3 text-right">Subtotal Neto</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {invItems.map((it) => (
                    <tr key={it.index} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-2.5 px-3 text-center text-slate-400 font-mono font-bold text-[10px]">
                        {it.index}
                      </td>
                      <td className="py-2.5 px-3 font-bold text-slate-900">{it.name}</td>
                      <td className="py-2.5 px-3 text-center">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-mono font-semibold">
                          {it.format}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-center font-mono font-black text-slate-800">
                        <span className="inline-flex items-center gap-1 text-[#D97706] font-bold">
                          {it.qty} un.
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono">
                        {it.unitShippingCost > 0 ? (
                          <div>
                            <div className="font-black text-slate-900">
                              {formatCLP(it.supplierUnitNeto || it.unitNeto)}
                            </div>
                            <div className="text-[9px] text-slate-400 font-normal">
                              c/IVA + Desp.: {formatCLP(it.unitCostWithIva)}{' '}
                              <span className="text-[#D97706] font-bold">
                                (+{formatCLP(it.unitShippingCostWithIva || Math.round(it.unitShippingCost * 1.19))} desp. c/IVA)
                              </span>
                            </div>
                          </div>
                        ) : (
                          <span className="font-semibold text-slate-700">
                            {formatCLP(it.supplierUnitNeto || it.unitNeto)}
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-black text-slate-900">
                        {formatCLP(it.subtotalNeto)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 4. Pie de Factura: Timbre SII y Totales */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-2 border-t border-slate-200">
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 text-[10px] text-slate-500 space-y-1.5 max-w-xs shrink-0 text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-1 font-bold text-slate-700">
                <span>🛡️ Timbre Electrónico SII</span>
              </div>
              <div className="h-6 bg-slate-900/10 rounded flex items-center justify-around px-2 overflow-hidden opacity-70">
                {Array.from({ length: 30 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-full bg-slate-800"
                    style={{ width: `${(i % 3) + 1}px` }}
                  />
                ))}
              </div>
              <p className="text-[9px] text-slate-400 font-mono leading-tight">
                Res. N° 80 de 2014 • Verifique documento en www.sii.cl
              </p>
            </div>

            <div className="w-full sm:w-80 p-4 rounded-2xl bg-slate-50/90 border border-slate-200/80 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-600">
                <span>Monto Neto Mercadería:</span>
                <span className="font-mono font-bold text-slate-900">
                  {formatCLP(totals.merchNeto)}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs text-emerald-700 font-semibold">
                <span>IVA Crédito Mercadería (19%):</span>
                <span className="font-mono font-bold">+{formatCLP(totals.merchIva)}</span>
              </div>
              <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                <span className="font-black text-slate-900 text-sm">TOTAL FACTURA PROVEEDOR:</span>
                <span className="font-black font-mono text-base sm:text-lg text-slate-900">
                  {formatCLP(totals.merchBruto)}
                </span>
              </div>
              {hasShipping && (
                <>
                  <div className="pt-1.5 border-t border-dashed border-amber-200/80 flex items-center justify-between text-xs text-[#D97706] font-medium">
                    <span className="flex items-center gap-1">
                      <Truck className="w-3.5 h-3.5" />
                      <span>Flete Asociado (Neto / c/IVA):</span>
                    </span>
                    <span className="font-mono font-bold">
                      +{formatCLP(sNeto)} / +{formatCLP(sConIva)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-emerald-700 font-semibold">
                    <span>IVA Crédito Total (Merc. + Flete):</span>
                    <span className="font-mono font-bold">+{formatCLP(totals.totalIva)}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-amber-900 pt-1 border-t border-amber-200/60">
                    <span className="font-bold">Total Desembolso (c/ Flete + IVA):</span>
                    <span className="font-mono font-black text-slate-900 text-xs">
                      {formatCLP(totals.totalBruto)}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200/80 flex items-center justify-between gap-3 shrink-0">
          <span className="text-[11px] text-slate-500 font-medium hidden sm:inline">
            📦 {totalUnits} unidades registradas en inventario físico
          </span>
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
            >
              Cerrar
            </button>
            <button
              type="button"
              onClick={() => window.print()}
              className="px-4 py-2 rounded-xl bg-[#D97706] hover:bg-[#B45309] text-white font-bold text-xs shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir Factura</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
