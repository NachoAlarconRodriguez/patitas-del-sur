import React from 'react';
import { Globe, CreditCard, Banknote, Landmark, CheckCircle2, AlertCircle, XCircle } from 'lucide-react';
import { formatCLP, normalizePaymentMethod, getOrderPaymentStatus } from './adminUtils';

export function renderPaymentMethodBadge(pm) {
  const norm = normalizePaymentMethod(pm);
  const pmLower = String(pm || '').toLowerCase();
  const isPos = pmLower.includes('pos') || pmLower.includes('contra entrega') || pmLower.includes('al recibir');

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
          <span>{isPos ? 'Tarjeta POS' : 'Tarjeta / POS'}</span>
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

// Banner visual de cobro/no cobro para el repartidor (PWA) — nunca trunca el monto CLP
export function renderPaymentCollectionBanner(order, isCompact = false) {
  if (!order) return null;
  const paymentInfo = getOrderPaymentStatus(order);
  const amountStr = formatCLP(order.total || 0);

  if (paymentInfo.isRejected) {
    return (
      <div
        className={`flex items-center justify-between gap-2 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 font-extrabold shadow-2xs ${
          isCompact ? 'px-2.5 py-1.5 text-[10.5px]' : 'px-3 py-2 text-xs'
        }`}
      >
        <div className="flex items-center gap-1.5 min-w-0">
          <XCircle className="w-3.5 h-3.5 text-rose-600 shrink-0 stroke-[2.5]" />
          <span className="truncate">PAGO RECHAZADO · COBRAR ANTES DE ENTREGAR</span>
        </div>
        <span className="font-mono font-black text-rose-900 shrink-0 tabular-nums">
          {amountStr}
        </span>
      </div>
    );
  }

  if (!paymentInfo.shouldCollect) {
    const pmLower = String(order.paymentMethod || order.payment_method || '').toLowerCase();
    const isPos = pmLower.includes('pos') || pmLower.includes('contra entrega') || pmLower.includes('al recibir');
    let detailText = 'PAGADO EN WEB · NO COBRAR AL CLIENTE';
    if (paymentInfo.norm === 'Transferencia') {
      detailText = 'TRANSFERENCIA ACREDITADA · NO COBRAR';
    } else if (paymentInfo.norm === 'Efectivo') {
      detailText = 'PAGADO EN EFECTIVO · NO COBRAR';
    } else if (paymentInfo.norm === 'Tarjeta' && isPos) {
      detailText = 'PAGADO CON POS · NO COBRAR';
    } else if (paymentInfo.norm === 'Tarjeta') {
      detailText = 'PAGADO CON TARJETA · NO COBRAR';
    }

    return (
      <div
        className={`flex items-center gap-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 font-extrabold shadow-2xs ${
          isCompact ? 'px-2.5 py-1.5 text-[10.5px]' : 'px-3 py-2 text-xs'
        }`}
      >
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 stroke-[2.5]" />
        <span className="truncate">{detailText}</span>
      </div>
    );
  }

  const labelText =
    paymentInfo.norm === 'Transferencia'
      ? 'TRANSFERENCIA PENDIENTE · CONFIRMAR'
      : `COBRAR AL ENTREGAR (${paymentInfo.norm === 'Tarjeta' ? 'POS' : paymentInfo.norm})`;

  return (
    <div
      className={`flex items-center justify-between gap-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 font-extrabold shadow-2xs ${
        isCompact ? 'px-2.5 py-1.5 text-[10.5px]' : 'px-3 py-2 text-xs'
      }`}
    >
      <div className="flex items-center gap-1.5 min-w-0">
        <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0 stroke-[2.5]" />
        <span className="truncate">{labelText}</span>
      </div>
      <span className="font-mono font-black text-amber-950 bg-amber-200/60 px-2 py-0.5 rounded-lg shrink-0 tabular-nums">
        {amountStr}
      </span>
    </div>
  );
}
