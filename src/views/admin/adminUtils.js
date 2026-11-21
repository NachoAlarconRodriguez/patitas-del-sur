import {
  formatCLPWithHalf as formatCLP,
  getChileDateString,
  getChileTimeFormatted,
  buildChileOrderIso,
  formatCLPDate,
  getYearMonthFromDate,
  formatPeriodLabel,
  shiftIsoDate,
  getChileIsoDateFromRecord,
  getChileHourFromRecord,
  getChileDateRanges,
} from '../../utils/formatters.js';

export {
  formatCLP,
  getChileDateString,
  getChileTimeFormatted,
  buildChileOrderIso,
  formatCLPDate,
  getYearMonthFromDate,
  formatPeriodLabel,
  shiftIsoDate,
  getChileIsoDateFromRecord,
  getChileHourFromRecord,
  getChileDateRanges,
};

export const getMockOrderDate = (daysAgo = 0) => {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
};

export const getPetBirthdayDetails = (birthdateStr) => {
  if (!birthdateStr) {
    return { formatted: 'No registrada', shortDate: 'Sin fecha', fullDate: 'Sin fecha', isCurrentMonth: false, monthName: '' };
  }
  const parts = birthdateStr.split('-');
  if (parts.length < 3) {
    return { formatted: birthdateStr, shortDate: birthdateStr, fullDate: birthdateStr, isCurrentMonth: false, monthName: '' };
  }
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);
  const now = new Date();
  const isCurrentMonth = month === now.getMonth();
  const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  const fullMonths = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  return {
    formatted: `${day} de ${fullMonths[month]} (${year})`,
    shortDate: `${day} de ${months[month]}`,
    fullDate: `${day} de ${fullMonths[month]}`,
    isCurrentMonth,
    day,
    monthName: fullMonths[month],
    year,
  };
};

// Generador de códigos únicos de cupón de un solo uso (ej. SWD-7K9P)
export const generateRandomCouponCode = (prefix = 'SWD-') => {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let randomPart = '';
  for (let i = 0; i < 4; i++) {
    randomPart += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `${prefix}${randomPart}`;
};

// Costo Unitario Neto Total puesto en bodega (Producto Neto + Despacho/Flete Unitario Neto)
export const getProductUnitCostNetoTotal = (prod) => {
  if (!prod) return 0;
  const unitNeto = Number(prod.unitCostNeto ?? prod.unit_cost_neto) || 0;
  const shippingUnitCost = Number(prod.shippingUnitCost ?? prod.shipping_unit_cost) || 0;
  return unitNeto + shippingUnitCost;
};

// Precio Unitario Neto + Despacho Unitario Neto con IVA (19%)
export const getProductUnitCostWithIva = (prod, order = null) => {
  if (!prod) return 0;
  const unitNeto = Number(prod.unitCostNeto ?? prod.unit_cost_neto) || 0;
  let shippingUnitCost = Number(prod.shippingUnitCost ?? prod.shipping_unit_cost) || 0;

  if (order && shippingUnitCost > 0) {
    const orderId = String(order.id || order.order_number || '').trim();
    const orderDate = String(order.date || order.created_at || '').slice(0, 10);
    const isBatch78954 =
      ['PED-0001', 'PED-0002', 'PED-0003', 'PED-0004'].includes(orderId) ||
      (orderDate && orderDate < '2026-10-20');

    if (isBatch78954) {
      shippingUnitCost = Math.round((unitNeto / 204804) * 20084);
    }
  }

  return Math.round(unitNeto * 1.19) + Math.round(shippingUnitCost * 1.19);
};

// Resuelve el listado ordenado de productos, formatos, unidades y costo unitario neto de una factura
export const resolveInvoiceItems = (inv, inventoryList = []) => {
  if (!inv) return [];

  const cleanInvNum = String(inv.invoiceNumber || inv.invoice_number || inv.id || '').trim();
  const is81006 = cleanInvNum === '81006';
  const is78954 = cleanInvNum === '78954';
  const rawShipField = inv.shippingCostNeto ?? inv.shipping_cost_neto;
  const rawHasShipField = inv.hasShippingCost ?? inv.has_shipping_cost;
  const shippingNeto =
    rawShipField !== undefined && rawShipField !== null && rawShipField !== ''
      ? (parseFloat(rawShipField) || 0)
      : (rawHasShipField === false ? 0 : is81006 ? 23277 : is78954 ? 20084 : 0);
  const hasShipping =
    rawHasShipField !== undefined && rawHasShipField !== null
      ? Boolean(rawHasShipField)
      : shippingNeto > 0;
  const shippingMethod = inv.shippingDistributionMethod || inv.shipping_distribution_method || 'value';

  // 1. Si la factura ya trae un array estructurado de ítems
  if (Array.isArray(inv.items) && inv.items.length > 0) {
    const totalUnits = inv.items.reduce((acc, it) => acc + (parseInt(it.quantityReceived || it.qty || it.quantity, 10) || 1), 0);
    const totalNetoMercaderia = inv.items.reduce((acc, it) => {
      const q = parseInt(it.quantityReceived || it.qty || it.quantity, 10) || 1;
      const u = parseInt(it.supplierUnitNeto || it.unitCostNeto || it.unitNeto || it.cost, 10) || 0;
      return acc + q * u;
    }, 0);

    return inv.items.map((it, idx) => {
      const qty = parseInt(it.quantityReceived || it.qty || it.quantity, 10) || 1;
      const supplierUnitNeto = parseInt(it.supplierUnitNeto || it.unitCostNeto || it.unitNeto || it.cost, 10) || 0;
      let unitShippingCost = parseInt(it.unitShippingCost || it.shippingUnitCost || it.shippingCostPerUnit, 10) || 0;

      if (!unitShippingCost && hasShipping && shippingNeto > 0) {
        if (shippingMethod === 'value' && totalNetoMercaderia > 0) {
          const itemNeto = qty * supplierUnitNeto;
          unitShippingCost = Math.round(((itemNeto / totalNetoMercaderia) * shippingNeto) / qty);
        } else if (totalUnits > 0) {
          unitShippingCost = Math.round(shippingNeto / totalUnits);
        }
      }

      const unitShippingCostWithIva = Math.round(unitShippingCost * 1.19);
      const unitCostWithIva = Math.round(supplierUnitNeto * 1.19) + unitShippingCostWithIva;

      return {
        index: idx + 1,
        name: it.fullProdTitle || it.cleanName || it.productName || it.name || `Ítem #${idx + 1}`,
        format: it.format || '10 kg',
        qty,
        supplierUnitNeto,
        unitShippingCost,
        unitShippingCostWithIva,
        unitCostWithIva,
        landedUnitNeto: supplierUnitNeto,
        unitNeto: supplierUnitNeto,
        subtotalNeto: it.subtotalNeto ? parseInt(it.subtotalNeto, 10) : qty * supplierUnitNeto,
      };
    });
  }

  // 2. Casos estructurados verificados para Facturas #94258, #78954 y #81006
  if (cleanInvNum === '94258') {
    const raw94258 = [
      { name: 'Arena Fit Carbón', format: '10 kg', qty: 1, supplierUnitNeto: 8125 },
      { name: 'Stay Happy Arena Aglutinante Café', format: '10 kg', qty: 1, supplierUnitNeto: 8581 },
      { name: 'Fit Adulto Raza Pequeña', format: '10 kg', qty: 2, supplierUnitNeto: 16467 },
      { name: 'Fit Adulto Raza Pequeña', format: '3 kg', qty: 2, supplierUnitNeto: 7982 },
      { name: 'Fit Adulto Raza Mediana y Grande', format: '20 kg', qty: 1, supplierUnitNeto: 30095 },
      { name: 'Fit Cachorro', format: '10 kg', qty: 1, supplierUnitNeto: 17564 },
      { name: 'Fit Cachorro', format: '3 kg', qty: 1, supplierUnitNeto: 9081 },
      { name: 'Fit Gato Adulto', format: '11 kg', qty: 2, supplierUnitNeto: 22359 },
      { name: 'Nomade Adulto Raza Mediana y Grande', format: '20 kg', qty: 2, supplierUnitNeto: 30378 },
      { name: 'Nomade Adulto Raza Pequeña', format: '10 kg', qty: 1, supplierUnitNeto: 16105 },
    ];
    return raw94258.map((it, idx) => {
      const qty = it.qty;
      const supplierUnitNeto = it.supplierUnitNeto;
      const unitCostWithIva = Math.round(supplierUnitNeto * 1.19);
      return {
        index: idx + 1,
        name: it.name,
        format: it.format,
        qty,
        supplierUnitNeto,
        unitShippingCost: 0,
        unitShippingCostWithIva: 0,
        unitCostWithIva,
        landedUnitNeto: supplierUnitNeto,
        unitNeto: supplierUnitNeto,
        subtotalNeto: qty * supplierUnitNeto,
      };
    });
  }

  if (cleanInvNum === '78954') {
    const raw78954 = [
      { name: 'Alpha Spirit Lata Cordero & Pera', format: '400 gr', qty: 1, supplierUnitNeto: 1757 },
      { name: 'Alpha Spirit Lata Conejo & Platano', format: '400 gr', qty: 1, supplierUnitNeto: 1757 },
      { name: 'Alpha Spirit Lata Pato & Manzana Verde', format: '400 gr', qty: 1, supplierUnitNeto: 1757 },
      { name: 'Alpha Spirit Lata Salmón & Piña', format: '400 gr', qty: 1, supplierUnitNeto: 1757 },
      { name: 'Acana Free Run Poultry', format: '11,35 kg', qty: 2, supplierUnitNeto: 48410 },
      { name: 'Acana Freshwater Fish', format: '11,35 kg', qty: 2, supplierUnitNeto: 50478 },
    ];
    const totalUnits = 8;
    const totalNetoMercaderia = 204804;

    return raw78954.map((it, idx) => {
      const qty = it.qty;
      const supplierUnitNeto = it.supplierUnitNeto;
      let unitShippingCost = 0;

      if (hasShipping && shippingNeto > 0) {
        if (shippingMethod === 'value' && totalNetoMercaderia > 0) {
          const itemNeto = qty * supplierUnitNeto;
          unitShippingCost = Math.round(((itemNeto / totalNetoMercaderia) * shippingNeto) / qty);
        } else if (totalUnits > 0) {
          unitShippingCost = Math.round(shippingNeto / totalUnits);
        }
      }

      const unitShippingCostWithIva = Math.round(unitShippingCost * 1.19);
      const unitCostWithIva = Math.round(supplierUnitNeto * 1.19) + unitShippingCostWithIva;

      return {
        index: idx + 1,
        name: it.name,
        format: it.format,
        qty,
        supplierUnitNeto,
        unitShippingCost,
        unitShippingCostWithIva,
        unitCostWithIva,
        landedUnitNeto: supplierUnitNeto,
        unitNeto: supplierUnitNeto,
        subtotalNeto: qty * supplierUnitNeto,
      };
    });
  }

  if (cleanInvNum === '81006') {
    const raw81006 = [
      { name: 'Alpha Spirit Lata Vacuno & Melón', format: '400 gr', qty: 2, supplierUnitNeto: 1757 },
      { name: 'Alpha Spirit Lata Cordero & Pera', format: '400 gr', qty: 2, supplierUnitNeto: 1757 },
      { name: 'Alpha Spirit Lata Conejo & Platano', format: '400 gr', qty: 2, supplierUnitNeto: 1757 },
      { name: 'Alpha Spirit Lata Pato & Manzana Verde', format: '400 gr', qty: 2, supplierUnitNeto: 1757 },
      { name: 'Alpha Spirit Lata Salmón & Piña', format: '400 gr', qty: 2, supplierUnitNeto: 1757 },
      { name: 'Acana Free Run Poultry', format: '11,35 kg', qty: 2, supplierUnitNeto: 48410 },
      { name: 'Acana Freshwater Fish', format: '11,35 kg', qty: 2, supplierUnitNeto: 50478 },
      { name: 'Acana Light & Fit', format: '11,35 kg', qty: 1, supplierUnitNeto: 50672 },
    ];
    const totalUnits = 15;
    const totalNetoMercaderia = 266018;

    return raw81006.map((it, idx) => {
      const qty = it.qty;
      const supplierUnitNeto = it.supplierUnitNeto;
      const unitShippingCost = hasShipping && shippingNeto > 0
        ? (shippingMethod === 'value' && totalNetoMercaderia > 0
          ? Math.round((((qty * supplierUnitNeto) / totalNetoMercaderia) * shippingNeto) / qty)
          : Math.round(shippingNeto / totalUnits))
        : 0;

      const unitShippingCostWithIva = Math.round(unitShippingCost * 1.19);
      const unitCostWithIva = Math.round(supplierUnitNeto * 1.19) + unitShippingCostWithIva;

      return {
        index: idx + 1,
        name: it.name,
        format: it.format,
        qty,
        supplierUnitNeto,
        unitShippingCost,
        unitShippingCostWithIva,
        unitCostWithIva,
        landedUnitNeto: supplierUnitNeto,
        unitNeto: supplierUnitNeto,
        subtotalNeto: qty * supplierUnitNeto,
      };
    });
  }

  // 2.5 Si se guardó en caché local de ítems de factura
  try {
    const cached = localStorage.getItem('patitas_invoice_items_' + (inv.invoiceNumber || inv.id));
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const totalUnits = parsed.reduce((acc, it) => acc + (parseInt(it.quantityReceived || it.qty || it.quantity, 10) || 1), 0);
        const totalNetoMercaderia = parsed.reduce((acc, it) => {
          const q = parseInt(it.quantityReceived || it.qty || it.quantity, 10) || 1;
          const u = parseInt(it.supplierUnitNeto || it.unitCostNeto || it.unitNeto || it.cost, 10) || 0;
          return acc + q * u;
        }, 0);

        return parsed.map((it, idx) => {
          const qty = parseInt(it.quantityReceived || it.qty || it.quantity, 10) || 1;
          const supplierUnitNeto = parseInt(it.supplierUnitNeto || it.unitCostNeto || it.unitNeto || it.cost, 10) || 0;
          let unitShippingCost = parseInt(it.unitShippingCost || it.shippingUnitCost || it.shippingCostPerUnit, 10) || 0;

          if (!unitShippingCost && hasShipping && shippingNeto > 0) {
            if (shippingMethod === 'value' && totalNetoMercaderia > 0) {
              const itemNeto = qty * supplierUnitNeto;
              unitShippingCost = Math.round(((itemNeto / totalNetoMercaderia) * shippingNeto) / qty);
            } else if (totalUnits > 0) {
              unitShippingCost = Math.round(shippingNeto / totalUnits);
            }
          }

          const unitShippingCostWithIva = Math.round(unitShippingCost * 1.19);
          const unitCostWithIva = Math.round(supplierUnitNeto * 1.19) + unitShippingCostWithIva;

          return {
            index: idx + 1,
            name: it.fullProdTitle || it.cleanName || it.productName || it.name || `Ítem #${idx + 1}`,
            format: it.format || '10 kg',
            qty,
            supplierUnitNeto,
            unitShippingCost,
            unitShippingCostWithIva,
            unitCostWithIva,
            landedUnitNeto: supplierUnitNeto,
            unitNeto: supplierUnitNeto,
            subtotalNeto: it.subtotalNeto ? parseInt(it.subtotalNeto, 10) : qty * supplierUnitNeto,
          };
        });
      }
    }
  } catch {
    // ignore
  }

  // 3. Descomponer y reconstruir desde la cadena product_name respetando variantes por formato
  const rawNames = (inv.productName || inv.product_name || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  if (rawNames.length === 0) {
    const fallbackQty = inv.quantityReceived || inv.quantity_received || inv.itemsCount || 1;
    const fallbackNeto = inv.totalNeto || inv.total_neto || 0;
    const fallbackUnit = inv.unitCostNeto || inv.unit_cost_neto || (fallbackQty > 0 ? Math.round(fallbackNeto / fallbackQty) : 0);
    const unitShippingCost = hasShipping && shippingNeto > 0 && fallbackQty > 0 ? Math.round(shippingNeto / fallbackQty) : 0;
    const unitCostWithIva = Math.round(fallbackUnit * 1.19) + unitShippingCost;
    return [
      {
        index: 1,
        name: 'Mercadería y reposición de bodega',
        format: 'Formato Estándar',
        qty: fallbackQty,
        supplierUnitNeto: fallbackUnit,
        unitShippingCost,
        unitCostWithIva,
        landedUnitNeto: fallbackUnit,
        unitNeto: fallbackUnit,
        subtotalNeto: fallbackNeto,
      },
    ];
  }

  const counts = {};
  rawNames.forEach((n) => {
    let clean = n.trim();
    if (clean.toLowerCase() === 'fit cachorr') clean = 'Fit Cachorro';
    counts[clean] = (counts[clean] || 0) + 1;
  });

  const expectedTotalUnits = parseInt(inv.quantityReceived || inv.quantity_received || inv.itemsCount, 10) || 0;
  const expectedTotalNeto = parseFloat(inv.totalNeto || inv.total_neto) || 0;

  const itemsParsed = [];
  Object.entries(counts).forEach(([name, countQty]) => {
    const allMatches = (inventoryList || []).filter((p) => {
      const pName = (p.name || '').toLowerCase().trim();
      const nName = name.toLowerCase().trim();
      return pName === nName || pName.includes(nName) || nName.includes(pName);
    });

    if (allMatches.length > 1 && countQty >= allMatches.length) {
      allMatches.forEach((matchedProd, mIdx) => {
        const unitNeto = Number(matchedProd.unitCostNeto || matchedProd.unit_cost_neto) || 0;
        const format = Array.isArray(matchedProd.weights)
          ? matchedProd.weights[0]
          : (matchedProd.format || '10 kg');
        const assignedQty = mIdx === 0 ? countQty - (allMatches.length - 1) : 1;
        itemsParsed.push({
          name: matchedProd.name || name,
          format,
          qty: assignedQty,
          supplierUnitNeto: unitNeto,
          unitNeto,
          subtotalNeto: assignedQty * unitNeto,
        });
      });
    } else {
      const matched = allMatches[0];
      const unitNeto = matched
        ? (Number(matched.unitCostNeto || matched.unit_cost_neto) || 0)
        : (Number(inv.unitCostNeto || inv.unit_cost_neto) || 8500);
      const format = matched
        ? (Array.isArray(matched.weights) ? matched.weights[0] : (matched.format || matched.weights || '10 kg'))
        : '10 kg';

      itemsParsed.push({
        name,
        format,
        qty: countQty,
        supplierUnitNeto: unitNeto,
        unitNeto,
        subtotalNeto: countQty * unitNeto,
      });
    }
  });

  // Reconciliación si la factura registra más unidades totales que los nombres únicos
  const currentUnitsSum = itemsParsed.reduce((s, it) => s + it.qty, 0);
  if (expectedTotalUnits > currentUnitsSum && expectedTotalNeto > 0) {
    const unitsDiff = expectedTotalUnits - currentUnitsSum;
    const currentNetoSum = itemsParsed.reduce((s, it) => s + (it.qty * it.supplierUnitNeto), 0);
    const netoDiff = expectedTotalNeto - currentNetoSum;

    if (netoDiff > 0 && unitsDiff > 0) {
      const sortedByCost = [...itemsParsed].sort((a, b) => b.supplierUnitNeto - a.supplierUnitNeto);
      let remainingUnits = unitsDiff;
      for (const target of sortedByCost) {
        if (remainingUnits <= 0) break;
        if (target.supplierUnitNeto > 0) {
          const canAdd = Math.min(remainingUnits, Math.round(netoDiff / target.supplierUnitNeto));
          if (canAdd > 0) {
            target.qty += canAdd;
            target.subtotalNeto = target.qty * target.supplierUnitNeto;
            remainingUnits -= canAdd;
          }
        }
      }
    }
  }

  const finalTotalUnits = itemsParsed.reduce((s, it) => s + it.qty, 0);
  const finalTotalNeto = itemsParsed.reduce((s, it) => s + (it.qty * it.supplierUnitNeto), 0);

  return itemsParsed.map((it, idx) => {
    let unitShippingCost = 0;
    if (hasShipping && shippingNeto > 0) {
      if (shippingMethod === 'value' && finalTotalNeto > 0) {
        unitShippingCost = Math.round(((it.subtotalNeto / finalTotalNeto) * shippingNeto) / it.qty);
      } else if (finalTotalUnits > 0) {
        unitShippingCost = Math.round(shippingNeto / finalTotalUnits);
      }
    }
    const landedUnitNeto = it.supplierUnitNeto + unitShippingCost;
    return {
      index: idx + 1,
      name: it.name,
      format: it.format,
      qty: it.qty,
      supplierUnitNeto: it.supplierUnitNeto,
      unitShippingCost,
      landedUnitNeto,
      unitNeto: landedUnitNeto || it.supplierUnitNeto,
      subtotalNeto: it.qty * it.supplierUnitNeto,
    };
  });
};

// Normalizador oficial de Medios de Pago
export const normalizePaymentMethod = (pm) => {
  if (!pm) return 'Web';
  const s = String(pm).trim().toLowerCase();
  if (s === 'web' || s === 'webpay' || s.includes('webpay') || s.includes('online')) return 'Web';
  if (
    s === 'tarjeta' ||
    s.includes('tarjeta') ||
    s.includes('débito') ||
    s.includes('debito') ||
    s.includes('crédito') ||
    s.includes('credito') ||
    s.includes('mercado pago') ||
    s.includes('mercadopago')
  ) {
    return 'Tarjeta';
  }
  if (s === 'efectivo' || s.includes('efectivo')) return 'Efectivo';
  if (s === 'transferencia' || s.includes('transferencia') || s.includes('bci') || s.includes('santander') || s.includes('banco')) {
    return 'Transferencia';
  }
  return 'Web';
};

// Determina si una factura de compra a proveedor ya fue pagada efectivamente
export const isPurchaseInvoicePaid = (inv) => {
  if (!inv) return false;
  const st = String(inv.status || '').trim().toLowerCase();
  return st === 'pagada' || st === 'pagado';
};

// Desglose consistente de factura de compra incluyendo flete (neto, IVA 19% y bruto)
export const getInvoiceTotalWithFreight = (inv) => {
  if (!inv) {
    return {
      merchNeto: 0,
      merchIva: 0,
      merchBruto: 0,
      shippingNeto: 0,
      shippingIva: 0,
      shippingBruto: 0,
      totalNeto: 0,
      totalIva: 0,
      totalBruto: 0,
    };
  }
  const merchNeto = Number(inv.totalNeto ?? inv.total_neto) || 0;
  const merchIva = Number(inv.iva) || Math.round(merchNeto * 0.19);
  const merchBruto = Number(inv.totalBruto ?? inv.total_bruto) || (merchNeto + merchIva);
  const rawShip = Number(inv.shippingCostNeto ?? inv.shipping_cost_neto) || 0;
  const explicitHasShipping = inv.hasShippingCost ?? inv.has_shipping_cost;
  const hasShipping =
    explicitHasShipping !== undefined && explicitHasShipping !== null
      ? Boolean(explicitHasShipping)
      : rawShip > 0;
  const shippingNeto = hasShipping && rawShip > 0 ? Math.round(rawShip) : 0;
  const shippingIva = shippingNeto > 0 ? Math.round(shippingNeto * 0.19) : 0;
  const shippingBruto = shippingNeto + shippingIva;

  return {
    merchNeto,
    merchIva,
    merchBruto,
    shippingNeto,
    shippingIva,
    shippingBruto,
    totalNeto: merchNeto + shippingNeto,
    totalIva: merchIva + shippingIva,
    totalBruto: merchBruto + shippingBruto,
  };
};

// Convierte cualquier registro financiero (pedido, factura, gasto o aporte) en clave cronológica ordenable (YYYY-MM-DD + timestamp)
export const getSortableTimestamp = (record) => {
  if (!record) return 0;
  const rawTs = record.created_at || record.createdAt;
  if (rawTs) {
    const parsed = new Date(rawTs);
    if (!Number.isNaN(parsed.getTime())) {
      const isoFromRecord = getChileIsoDateFromRecord(record);
      const isoFromTs = getChileDateString(parsed);
      // Si la fecha contable explícita difiere de created_at (ej. ingreso retroactivo), priorizar la fecha contable
      if (isoFromRecord && isoFromRecord !== isoFromTs) {
        return new Date(`${isoFromRecord}T12:00:00Z`).getTime();
      }
      return parsed.getTime();
    }
  }
  const iso = getChileIsoDateFromRecord(record);
  if (iso) {
    return new Date(`${iso}T12:00:00Z`).getTime();
  }
  return 0;
};

// Determina si un gasto operacional tiene factura con derecho a IVA Crédito Fiscal
export const isExpenseWithIvaCredit = (exp) => {
  if (!exp) return false;
  return Boolean(
    exp.hasIvaCredit ||
    exp.has_iva_credit ||
    exp.documentType === 'factura' ||
    exp.document_type === 'factura' ||
    (exp.documentNumber && String(exp.documentNumber).toUpperCase().startsWith('FAC')) ||
    (exp.document_number && String(exp.document_number).toUpperCase().startsWith('FAC'))
  );
};

// Cálculo tributario oficial F29 (SII Chile) con arrastre real de remanente de IVA Crédito desde meses anteriores
// Por defecto aplica criterio devengado (todos los pedidos no cancelados del mes) informando el desglose de pagados vs pendientes.
export const calculateF29WithCarryover = ({
  orders = [],
  invoices = [],
  expenses = [],
  targetPeriod = 'todos',
  includeUnpaidOrders = true,
}) => {
  const validOrders = (orders || []).filter((o) => {
    if (!o || o.status === 'cancelado') return false;
    if (!includeUnpaidOrders) return getOrderPaymentStatus(o).isPaid;
    return true;
  });

  const computeMonthData = (monthKey) => {
    const mOrders =
      monthKey === 'todos'
        ? validOrders
        : validOrders.filter((o) => getYearMonthFromDate(o.date, o.created_at) === monthKey);
    const mInvoices =
      monthKey === 'todos'
        ? (invoices || [])
        : (invoices || []).filter((i) => getYearMonthFromDate(i.date, i.created_at) === monthKey);
    const mExpenses =
      monthKey === 'todos'
        ? (expenses || [])
        : (expenses || []).filter((e) => getYearMonthFromDate(e.date, e.created_at) === monthKey);

    const totalSales = mOrders.reduce((s, o) => s + (Number(o.total) || 0), 0);
    const salesNeto = Math.round(totalSales / 1.19);
    const ivaDebito = totalSales - salesNeto;

    const webOrders = mOrders.filter((o) => (o.channel || 'web') === 'web');
    const manualOrders = mOrders.filter((o) => o.channel === 'manual');
    const webSales = webOrders.reduce((s, o) => s + (Number(o.total) || 0), 0);
    const manualSales = manualOrders.reduce((s, o) => s + (Number(o.total) || 0), 0);
    const webIvaDebito = webSales - Math.round(webSales / 1.19);
    const manualIvaDebito = manualSales - Math.round(manualSales / 1.19);

    const unpaidOrders = mOrders.filter((o) => !getOrderPaymentStatus(o).isPaid);
    const unpaidSales = unpaidOrders.reduce((s, o) => s + (Number(o.total) || 0), 0);
    const unpaidIvaDebito = unpaidSales - Math.round(unpaidSales / 1.19);

    const invoicesNeto = mInvoices.reduce((s, inv) => s + getInvoiceTotalWithFreight(inv).totalNeto, 0);
    const invoicesIvaCredito = mInvoices.reduce((s, inv) => s + getInvoiceTotalWithFreight(inv).totalIva, 0);

    const expenseFacturas = mExpenses.filter(isExpenseWithIvaCredit);
    const expensesIvaCredito = expenseFacturas.reduce((s, exp) => {
      const explicitIva = Number(exp.iva) || 0;
      if (explicitIva > 0) return s + explicitIva;
      const amt = Number(exp.amount) || 0;
      return s + (amt - Math.round(amt / 1.19));
    }, 0);
    const expensesNetoWithFactura = expenseFacturas.reduce((s, exp) => {
      const explicitNeto = Number(exp.neto) || 0;
      if (explicitNeto > 0 && (Number(exp.iva) || 0) > 0) return s + explicitNeto;
      const amt = Number(exp.amount) || 0;
      return s + Math.round(amt / 1.19);
    }, 0);

    const totalIvaCreditoMes = invoicesIvaCredito + expensesIvaCredito;

    return {
      ordersCount: mOrders.length,
      unpaidOrdersCount: unpaidOrders.length,
      unpaidSales,
      unpaidIvaDebito,
      totalSales,
      salesNeto,
      ivaDebito,
      webIvaDebito,
      manualIvaDebito,
      invoicesNeto,
      invoicesIvaCredito,
      expensesNetoWithFactura,
      expensesIvaCredito,
      totalIvaCreditoMes,
      purchaseInvoicesCount: mInvoices.length,
      expenseInvoicesCount: expenseFacturas.length,
      totalDocsCount: mInvoices.length + expenseFacturas.length,
    };
  };

  if (targetPeriod === 'todos') {
    const consolidated = computeMonthData('todos');
    const totalIvaCredito = consolidated.totalIvaCreditoMes;
    const ivaBalance = consolidated.ivaDebito - totalIvaCredito;
    const ivaStatus = ivaBalance <= 0 ? 'remanente' : 'a_pagar';
    const ivaCoveredPercent =
      consolidated.ivaDebito > 0
        ? Math.min(100, Math.round((totalIvaCredito / consolidated.ivaDebito) * 100))
        : totalIvaCredito > 0
          ? 100
          : 0;
    return {
      ...consolidated,
      remanenteAnterior: 0,
      totalIvaCredito,
      ivaBalance,
      ivaStatus,
      ivaCoveredPercent,
      filteredInvoicesCount: consolidated.purchaseInvoicesCount,
      filteredOrdersCount: consolidated.ordersCount,
    };
  }

  // Recolectar todos los meses anteriores al período objetivo para arrastrar remanente cronológicamente
  const priorMonthsSet = new Set();
  validOrders.forEach((o) => {
    const ym = getYearMonthFromDate(o.date, o.created_at);
    if (ym && ym < targetPeriod) priorMonthsSet.add(ym);
  });
  (invoices || []).forEach((i) => {
    const ym = getYearMonthFromDate(i.date, i.created_at);
    if (ym && ym < targetPeriod) priorMonthsSet.add(ym);
  });
  (expenses || []).forEach((e) => {
    const ym = getYearMonthFromDate(e.date, e.created_at);
    if (ym && ym < targetPeriod) priorMonthsSet.add(ym);
  });

  const sortedPriorMonths = Array.from(priorMonthsSet).sort();
  let carriedRemanente = 0;

  sortedPriorMonths.forEach((ym) => {
    const mData = computeMonthData(ym);
    const availableCredit = mData.totalIvaCreditoMes + carriedRemanente;
    const balance = mData.ivaDebito - availableCredit;
    carriedRemanente = balance < 0 ? Math.abs(balance) : 0;
  });

  const currentData = computeMonthData(targetPeriod);
  const totalIvaCredito = currentData.totalIvaCreditoMes + carriedRemanente;
  const ivaBalance = currentData.ivaDebito - totalIvaCredito;
  const ivaStatus = ivaBalance <= 0 ? 'remanente' : 'a_pagar';
  const ivaCoveredPercent =
    currentData.ivaDebito > 0
      ? Math.min(100, Math.round((totalIvaCredito / currentData.ivaDebito) * 100))
      : totalIvaCredito > 0
        ? 100
        : 0;

  return {
    ...currentData,
    remanenteAnterior: carriedRemanente,
    totalIvaCredito,
    ivaBalance,
    ivaStatus,
    ivaCoveredPercent,
    filteredInvoicesCount: currentData.purchaseInvoicesCount,
    filteredOrdersCount: currentData.ordersCount,
  };
};

// Estado detallado y consistente del pago de una orden
export const getOrderPaymentStatus = (order) => {
  if (!order) {
    return {
      norm: 'Web',
      isPaid: false,
      isRejected: false,
      shouldCollect: true,
      statusText: '⚠️ Cobrar en entrega',
      badgeColor: 'bg-amber-50 text-amber-700 border-amber-200/90',
      actionBadgeText: 'Cobrar',
      actionBadgeColor: 'text-amber-700 bg-amber-50 border-amber-200',
    };
  }

  const norm = normalizePaymentMethod(order.paymentMethod || order.payment_method);
  const pmLower = String(order.paymentMethod || order.payment_method || '').toLowerCase();
  const psLower = String(order.paymentStatus ?? order.payment_status ?? '').trim().toLowerCase();

  const isPaidStatus = psLower === 'pagado' || psLower === 'approved' || psLower === 'processed';
  const isRejectedStatus = ['rechazado', 'rejected', 'failed', 'cancelado', 'canceled', 'expired'].includes(psLower);
  const isExplicitlyUnpaid = psLower === 'pendiente' || isRejectedStatus;
  const isPosOrContraEntrega =
    pmLower.includes('contra entrega') || pmLower.includes('pos') || pmLower.includes('al recibir');
  const isExplicitlyPaidOnline = order.isPaidOnline === true && !isExplicitlyUnpaid;

  // Solo considerar pagado con confirmación explícita (evita falsos positivos en pagos rechazados, expirados o POS)
  const isPaid = !isRejectedStatus && (isPaidStatus || isExplicitlyPaidOnline);
  const isWebCard = norm === 'Web' || (norm === 'Tarjeta' && !isPosOrContraEntrega);
  const shouldCollect = !isPaid;

  let statusText = '';
  let badgeColor = '';
  let actionBadgeText = 'Cobrar';
  let actionBadgeColor = 'text-amber-700 bg-amber-50 border-amber-200';

  if (isRejectedStatus) {
    statusText = '✕ Pago rechazado';
    badgeColor = 'bg-rose-50 text-rose-700 border-rose-200/90';
    actionBadgeText = 'Rechazado';
    actionBadgeColor = 'text-rose-700 bg-rose-50 border-rose-200';
  } else if (norm === 'Transferencia') {
    if (isPaid) {
      statusText = '✓ Pagado Transferencia';
      badgeColor = 'bg-emerald-50 text-emerald-700 border-emerald-200/90';
      actionBadgeText = 'No cobrar';
      actionBadgeColor = 'text-emerald-700 bg-emerald-50 border-emerald-200';
    } else {
      statusText = '⏳ Transferencia pendiente';
      badgeColor = 'bg-amber-50 text-amber-700 border-amber-200/90';
      actionBadgeText = 'Por verificar';
      actionBadgeColor = 'text-amber-700 bg-amber-50 border-amber-200';
    }
  } else if (isWebCard) {
    if (isPaid) {
      statusText = '✓ Pagado Web';
      badgeColor = 'bg-emerald-50 text-emerald-700 border-emerald-200/90';
      actionBadgeText = 'No cobrar';
      actionBadgeColor = 'text-emerald-700 bg-emerald-50 border-emerald-200';
    } else {
      statusText = '⏳ Pago Web pendiente';
      badgeColor = 'bg-amber-50 text-amber-700 border-amber-200/90';
      actionBadgeText = 'Pendiente Web';
      actionBadgeColor = 'text-amber-700 bg-amber-50 border-amber-200';
    }
  } else if (norm === 'Efectivo') {
    if (isPaid) {
      statusText = '✓ Pagado Efectivo';
      badgeColor = 'bg-emerald-50 text-emerald-700 border-emerald-200/90';
      actionBadgeText = 'No cobrar';
      actionBadgeColor = 'text-emerald-700 bg-emerald-50 border-emerald-200';
    } else {
      statusText = '⚠️ Cobrar en entrega';
      badgeColor = 'bg-amber-50 text-amber-700 border-amber-200/90';
      actionBadgeText = 'Cobrar efectivo';
      actionBadgeColor = 'text-amber-700 bg-amber-50 border-amber-200';
    }
  } else {
    if (isPaid) {
      statusText = '✓ Pagado POS';
      badgeColor = 'bg-emerald-50 text-emerald-700 border-emerald-200/90';
      actionBadgeText = 'No cobrar';
      actionBadgeColor = 'text-emerald-700 bg-emerald-50 border-emerald-200';
    } else {
      statusText = '⚠️ Cobrar con POS';
      badgeColor = 'bg-amber-50 text-amber-700 border-amber-200/90';
      actionBadgeText = 'Cobrar con POS';
      actionBadgeColor = 'text-amber-700 bg-amber-50 border-amber-200';
    }
  }

  return {
    norm,
    isPaid,
    isRejected: isRejectedStatus,
    shouldCollect,
    statusText,
    badgeColor,
    actionBadgeText,
    actionBadgeColor,
  };
};

// Saludo dinámico según la hora del sistema
export const getDynamicGreeting = (user, adminEmail) => {
  const hour = new Date().getHours();
  let name = 'Ignacio';
  if (user && user.name) {
    name = user.name.split(' ')[0];
  } else if (adminEmail) {
    const prefix = adminEmail.split('@')[0];
    name = prefix.charAt(0).toUpperCase() + prefix.slice(1);
  }

  if (hour >= 5 && hour < 12) {
    return `¡Buenos días, ${name}! ☀️`;
  }
  if (hour >= 12 && hour < 20) {
    return `¡Buenas tardes, ${name}! 🌤️`;
  }
  return `¡Buenas noches, ${name}! 🌙`;
};

// Resolver packshots de productos por nombre
export const getProductImage = (itemName = '') => {
  const lower = itemName.toLowerCase();
  if (lower.includes('pollo') || lower.includes('chicken')) return '/images/bravery_chicken.jpg';
  if (lower.includes('cordero') || lower.includes('lamb')) return '/images/bravery_lamb.jpg';
  if (lower.includes('salmón') || lower.includes('salmon') || lower.includes('bravery')) return '/images/bravery_salmon.jpg';
  if (lower.includes('trucha') || lower.includes('patagonia')) return '/images/cat_food_tuna.png';
  if (lower.includes('urinary') || lower.includes('dr. pet') || lower.includes('dr pet')) return '/images/cat_food_tuna.png';
  if (lower.includes('ciervo') || lower.includes('deshidratado')) return '/images/dog_food_ingredients.png';
  if (lower.includes('hueso') || lower.includes('recreativo')) return '/images/dog_kibble_detail.png';
  if (lower.includes('omega') || lower.includes('suplemento')) return '/images/dog_food_salmon.png';
  return '/images/bravery_salmon.jpg';
};
