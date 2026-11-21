import React from 'react';
import { Globe, CreditCard, Banknote, Landmark, CheckCircle2, AlertCircle } from 'lucide-react';
import { formatCLP, normalizePaymentMethod, getOrderPaymentStatus } from './adminUtils';

export function renderPaymentMethodBadge(pm) {
  const norm = normalizePaymentMethod(pm);
  switch (norm) {
    case 'Web':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#FEF3C7] text-[#D97706] border border-[#FDE68A]">
          <Globe className="w-3 h-3 text-[#D97706] shrink-0" />
          <span>Botón Web</span>
        </span>
      );
    case 'Tarjeta':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#FAF8F4] text-[#78350F] border border-[#EAECEF]">
          <CreditCard className="w-3 h-3 text-[#D97706] shrink-0" />
          <span>Tarjeta Web</span>
        </span>
      );
    case 'Efectivo':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/80">
          <Banknote className="w-3 h-3 text-emerald-600 shrink-0" />
          <span>Efectivo</span>
        </span>
      );
    case 'Transferencia':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200/80">
          <Landmark className="w-3 h-3 text-amber-600 shrink-0" />
          <span>Transferencia</span>
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-[#F8FAFC] text-slate-600 border border-[#EAECEF]">
          <span>{pm || 'Web'}</span>
        </span>
      );
  }
}

// Banner visual de cobro/no cobro para el repartidor (PWA)
export function renderPaymentCollectionBanner(order, isCompact = false) {
  if (!order) return null;
  const paymentInfo = getOrderPaymentStatus(order);

  if (!paymentInfo.shouldCollect) {
    const detailText =
      paymentInfo.norm === 'Transferencia'
        ? 'TRANSFERENCIA ACREDITADA · NO COBRAR AL CLIENTE'
        : 'PAGADO EN WEB · NO COBRAR AL CLIENTE';

    return (
      <div
        className={`flex items-center gap-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 font-extrabold shadow-2xs ${
          isCompact ? 'px-2 py-1 text-[10px]' : 'px-2.5 py-1.5 text-xs'
        }`}
      >
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 stroke-[2.5]" />
        <span className="truncate">{detailText}</span>
      </div>
    );
  }

  const collectText =
    paymentInfo.norm === 'Transferencia'
      ? `TRANSFERENCIA PENDIENTE · CONFIRMAR COMPROBANTE (${formatCLP(order.total)})`
      : `COBRAR AL ENTREGAR: ${formatCLP(order.total)} (${paymentInfo.norm})`;

  return (
    <div
      className={`flex items-center gap-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 font-extrabold shadow-2xs ${
        isCompact ? 'px-2 py-1 text-[10px]' : 'px-2.5 py-1.5 text-xs'
      }`}
    >
      <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0 stroke-[2.5]" />
      <span className="truncate">{collectText}</span>
    </div>
  );
}
