import { COMPANY_INFO } from '../adminConstants.js';
import { formatCLP, getOrderPaymentBreakdown } from '../adminUtils.js';
import { formatMinutesToHoursLabel } from '../../../services/posService.js';

const LS_TICKET_WIDTH_KEY = 'patitas_pos_ticket_width_mm';

export function getSavedTicketWidthMm() {
  if (typeof window === 'undefined') return 80;
  try {
    const val = Number(localStorage.getItem(LS_TICKET_WIDTH_KEY));
    return val === 58 ? 58 : 80;
  } catch {
    return 80;
  }
}

export function saveTicketWidthMm(widthMm) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LS_TICKET_WIDTH_KEY, widthMm === 58 ? '58' : '80');
  } catch {
    // ignore
  }
}

function escapeHtml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function formatChileDateTime(isoStr) {
  try {
    const d = isoStr ? new Date(isoStr) : new Date();
    return new Intl.DateTimeFormat('es-CL', {
      timeZone: 'America/Santiago',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(d);
  } catch {
    return '';
  }
}

function printHtmlInHiddenFrame(html) {
  if (typeof document === 'undefined') return;
  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  document.body.appendChild(iframe);

  const doc = iframe.contentWindow?.document;
  if (!doc) {
    document.body.removeChild(iframe);
    return;
  }

  doc.open();
  doc.write(html);
  doc.close();

  const cleanup = () => {
    setTimeout(() => {
      if (iframe.parentNode) iframe.parentNode.removeChild(iframe);
    }, 1000);
  };

  iframe.onload = () => {
    try {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
    } catch (err) {
      console.error('Error printing POS ticket:', err);
    } finally {
      cleanup();
    }
  };
}

/**
 * Imprime un comprobante térmico de venta POS (80 mm por defecto o 58 mm)
 */
export function printPosSaleTicket(order, widthMm = getSavedTicketWidthMm()) {
  if (!order) return;
  const safeWidth = widthMm === 58 ? 58 : 80;
  const fontSize = safeWidth === 58 ? '10px' : '11.5px';
  const items = Array.isArray(order.items) && order.items.length > 0
    ? order.items
    : [{ name: order.product || 'Producto', format: order.format || '', quantity: order.qty || 1, price: order.total || 0 }];

  const breakdown = getOrderPaymentBreakdown(order);
  const subtotal = Number(order.subtotal ?? order.total ?? 0);
  const discount = Number(order.discount || 0);
  const total = Number(order.total || 0);
  const cashChange = Number(order.cashChange ?? order.cash_change ?? 0);
  const sellerName = order.soldByName || order.sold_by_name || order.deliveredByName || 'Equipo Patitas';
  const customerName = order.customerName || order.customer || order.customer_name || 'Cliente de Paso';
  const isRecurringCustomer = customerName && !customerName.toLowerCase().includes('cliente de paso');
  const pointsEarned = Number(order.pointsEarned ?? order.points_earned ?? 0);
  const pointsSpent = Number(order.pointsSpent || 0);
  const newCustomerPoints = order.newCustomerPoints;

  const itemsRows = items
    .map((it) => {
      const qty = Number(it.quantity || it.qty || 1);
      const unitPrice = Number(it.price || it.unit_price || 0);
      const lineTotal = qty * unitPrice;
      const fmt = it.format || it.weight ? ` (${escapeHtml(it.format || it.weight)})` : '';
      return `
        <tr>
          <td colspan="2" class="item-name">${qty}x ${escapeHtml(it.name || it.product_name)}${fmt}</td>
        </tr>
        <tr>
          <td class="muted">${qty} x ${escapeHtml(formatCLP(unitPrice))}</td>
          <td class="right bold">${escapeHtml(formatCLP(lineTotal))}</td>
        </tr>
      `;
    })
    .join('');

  const paymentRows = breakdown
    .map((line) => {
      const isCash = line.norm === 'Efectivo';
      const cashDetails =
        isCash && line.tendered > line.amount
          ? `<tr><td class="muted">&nbsp;&nbsp;Recibido efectivo</td><td class="right muted">${escapeHtml(formatCLP(line.tendered))}</td></tr>`
          : '';
      return `
        <tr>
          <td>${escapeHtml(line.method)}</td>
          <td class="right bold">${escapeHtml(formatCLP(line.amount))}</td>
        </tr>
        ${cashDetails}
      `;
    })
    .join('');

  const html = `<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <title>Ticket ${escapeHtml(order.id || 'POS')}</title>
  <style>
    @page { size: ${safeWidth}mm auto; margin: 2mm; }
    * { box-sizing: border-box; }
    body {
      width: ${safeWidth - 4}mm;
      margin: 0 auto;
      font-family: 'Courier New', Courier, monospace;
      font-size: ${fontSize};
      line-height: 1.35;
      color: #000;
      background: #fff;
    }
    .center { text-align: center; }
    .right { text-align: right; }
    .bold { font-weight: 700; }
    .title { font-size: ${safeWidth === 58 ? '13px' : '15px'}; font-weight: 900; letter-spacing: 0.4px; }
    .muted { color: #333; font-size: ${safeWidth === 58 ? '9px' : '10px'}; }
    .sep { border-top: 1px dashed #000; margin: 6px 0; }
    table { width: 100%; border-collapse: collapse; }
    td { padding: 1.5px 0; vertical-align: top; }
    .item-name { font-weight: 700; padding-top: 4px; }
    .total-row td { font-size: ${safeWidth === 58 ? '13px' : '15px'}; font-weight: 900; padding-top: 4px; }
    .box { border: 1px dashed #000; padding: 5px; margin: 6px 0; }
  </style>
</head>
<body>
  <div class="center">
    <div class="title">${escapeHtml(COMPANY_INFO.tradeName.toUpperCase())}</div>
    <div class="muted">${escapeHtml(COMPANY_INFO.legalName)}</div>
    <div class="muted">RUT: ${escapeHtml(COMPANY_INFO.rut)}</div>
    <div class="muted">${escapeHtml(COMPANY_INFO.address)}</div>
  </div>

  <div class="sep"></div>

  <table>
    <tr><td>Comprobante:</td><td class="right bold">${escapeHtml(order.id || 'POS')}</td></tr>
    <tr><td>Fecha:</td><td class="right">${escapeHtml(formatChileDateTime(order.created_at))}</td></tr>
    <tr><td>Atendido por:</td><td class="right">${escapeHtml(sellerName)}</td></tr>
    <tr><td>Cliente:</td><td class="right">${escapeHtml(customerName)}</td></tr>
  </table>

  <div class="sep"></div>

  <table>
    ${itemsRows}
  </table>

  <div class="sep"></div>

  <table>
    <tr><td>Subtotal</td><td class="right">${escapeHtml(formatCLP(subtotal))}</td></tr>
    ${
      discount > 0
        ? `<tr><td>Descuento${order.couponCodeUsed ? ` (${escapeHtml(order.couponCodeUsed)})` : ''}</td><td class="right">-${escapeHtml(formatCLP(discount))}</td></tr>`
        : ''
    }
    <tr class="total-row"><td>TOTAL</td><td class="right">${escapeHtml(formatCLP(total))}</td></tr>
  </table>

  <div class="sep"></div>

  <div class="bold" style="margin-bottom:2px;">MEDIO DE PAGO</div>
  <table>
    ${paymentRows}
    ${
      cashChange > 0
        ? `<tr><td class="bold">VUELTO ENTREGADO</td><td class="right bold">${escapeHtml(formatCLP(cashChange))}</td></tr>`
        : ''
    }
  </table>

  ${
    isRecurringCustomer && (pointsEarned > 0 || pointsSpent > 0)
      ? `
      <div class="box">
        <div class="center bold">CLUB PATITAS · PUNTOS</div>
        <table>
          ${pointsSpent > 0 ? `<tr><td>Puntos canjeados:</td><td class="right">-${pointsSpent} pts</td></tr>` : ''}
          ${pointsEarned > 0 ? `<tr><td>Puntos ganados hoy:</td><td class="right">+${pointsEarned} pts</td></tr>` : ''}
          ${newCustomerPoints !== undefined ? `<tr><td class="bold">Saldo actual:</td><td class="right bold">${newCustomerPoints} pts</td></tr>` : ''}
        </table>
      </div>
      `
      : ''
  }

  <div class="sep"></div>
  <div class="center muted">
    <div>¡Gracias por elegir Patitas del Sur!</div>
    <div style="margin-top:3px;">Comprobante interno de venta POS.</div>
    <div>No válido como boleta electrónica SII.</div>
  </div>
</body>
</html>`;

  printHtmlInHiddenFrame(html);
}

/**
 * Imprime un comprobante de Cierre Diario / Arqueo de Caja (Reporte Z)
 */
export function printPosCashClosingReport(register, reconciliation, shifts = [], widthMm = getSavedTicketWidthMm()) {
  if (!register) return;
  const safeWidth = widthMm === 58 ? 58 : 80;
  const fontSize = safeWidth === 58 ? '10px' : '11.5px';
  const diff = Number(register.cash_difference ?? 0);
  const diffLabel = diff === 0 ? 'CUADRADA ($0)' : diff > 0 ? `SOBRANTE (+${formatCLP(diff)})` : `FALTANTE (${formatCLP(diff)})`;

  const shiftRows = (shifts || [])
    .map(
      (s) =>
        `<tr><td>${escapeHtml(s.partner_name)}</td><td class="right">${escapeHtml(formatMinutesToHoursLabel(s.duration_minutes || 0))}</td></tr>`
    )
    .join('');

  const html = `<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <title>Cierre de Caja ${escapeHtml(register.id)}</title>
  <style>
    @page { size: ${safeWidth}mm auto; margin: 2mm; }
    body {
      width: ${safeWidth - 4}mm;
      margin: 0 auto;
      font-family: 'Courier New', Courier, monospace;
      font-size: ${fontSize};
      line-height: 1.35;
      color: #000;
    }
    .center { text-align: center; }
    .right { text-align: right; }
    .bold { font-weight: 700; }
    .sep { border-top: 1px dashed #000; margin: 6px 0; }
    table { width: 100%; border-collapse: collapse; }
    td { padding: 1.5px 0; }
  </style>
</head>
<body>
  <div class="center">
    <div class="bold" style="font-size:14px;">CIERRE DE CAJA POS</div>
    <div>${escapeHtml(COMPANY_INFO.tradeName)}</div>
    <div>${escapeHtml(register.id)}</div>
  </div>
  <div class="sep"></div>
  <table>
    <tr><td>Apertura:</td><td class="right">${escapeHtml(formatChileDateTime(register.opened_at))}</td></tr>
    <tr><td>Cierre:</td><td class="right">${escapeHtml(formatChileDateTime(register.closed_at || new Date().toISOString()))}</td></tr>
    <tr><td>Abrió:</td><td class="right">${escapeHtml(register.opened_by_name)}</td></tr>
    <tr><td>Cerró:</td><td class="right">${escapeHtml(register.closed_by_name || '-')}</td></tr>
  </table>
  <div class="sep"></div>
  <div class="bold">RESUMEN DE VENTAS (${reconciliation?.salesCount ?? register.total_sales_count ?? 0})</div>
  <table>
    <tr><td>Efectivo neto:</td><td class="right">${escapeHtml(formatCLP(reconciliation?.cashSalesNet ?? register.total_cash_sales ?? 0))}</td></tr>
    <tr><td>Débito / Dinero MP:</td><td class="right">${escapeHtml(formatCLP(reconciliation?.debitMpSales ?? register.total_debit_sales ?? 0))}</td></tr>
    <tr><td>Tarjeta Crédito:</td><td class="right">${escapeHtml(formatCLP(reconciliation?.creditSales ?? register.total_credit_sales ?? 0))}</td></tr>
    <tr><td>Transferencia:</td><td class="right">${escapeHtml(formatCLP(reconciliation?.transferSales ?? register.total_transfer_sales ?? 0))}</td></tr>
    <tr><td class="bold">TOTAL VENTAS:</td><td class="right bold">${escapeHtml(formatCLP(reconciliation?.totalSales ?? register.total_sales_amount ?? 0))}</td></tr>
  </table>
  <div class="sep"></div>
  <div class="bold">ARQUEO DE EFECTIVO</div>
  <table>
    <tr><td>Fondo inicial:</td><td class="right">${escapeHtml(formatCLP(register.opening_cash || 0))}</td></tr>
    <tr><td>+ Ventas efectivo:</td><td class="right">${escapeHtml(formatCLP(reconciliation?.cashSalesNet ?? register.total_cash_sales ?? 0))}</td></tr>
    <tr><td>+ Ingresos caja:</td><td class="right">${escapeHtml(formatCLP(reconciliation?.cashInflows ?? 0))}</td></tr>
    <tr><td>- Retiros caja:</td><td class="right">-${escapeHtml(formatCLP(reconciliation?.cashOutflows ?? 0))}</td></tr>
    <tr><td class="bold">Esperado en caja:</td><td class="right bold">${escapeHtml(formatCLP(register.expected_cash ?? reconciliation?.expectedCash ?? 0))}</td></tr>
    <tr><td class="bold">Contado físico:</td><td class="right bold">${escapeHtml(formatCLP(register.counted_cash ?? 0))}</td></tr>
    <tr><td class="bold">Diferencia:</td><td class="right bold">${escapeHtml(diffLabel)}</td></tr>
  </table>
  ${
    shiftRows
      ? `<div class="sep"></div><div class="bold">TURNOS DEL DÍA</div><table>${shiftRows}</table>`
      : ''
  }
  <div class="sep"></div>
  <div class="center">Generado por Patitas del Sur POS</div>
</body>
</html>`;

  printHtmlInHiddenFrame(html);
}
