import React from 'react';
import { Package, Calendar, ChevronDown, Truck, Search, RotateCcw, Clock, AlertTriangle, Check, X, Award } from 'lucide-react';

/**
 * Helper para parsear cualquier fecha a ISO YYYY-MM-DD
 */
function parseDateToIso(dateStr) {
  if (!dateStr || typeof dateStr !== 'string') return null;
  const trimmed = dateStr.trim();

  // YYYY-MM-DD (ej: 2026-10-24)
  if (/^\d{4}-\d{2}-\d{2}/.test(trimmed)) {
    return trimmed.split('T')[0];
  }

  // DD/MM/YYYY o DD-MM-YYYY
  const dmyMatch = trimmed.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/);
  if (dmyMatch) {
    const d = dmyMatch[1].padStart(2, '0');
    const m = dmyMatch[2].padStart(2, '0');
    const y = dmyMatch[3];
    return `${y}-${m}-${d}`;
  }

  // Formato español texto: "23 oct 2026", "23 oct.", "24 octubre 2026"
  const textMatch = trimmed.match(/^(\d{1,2})\s+([a-zA-Záéíóúñ]+)\.?\s*(\d{4})?/i);
  if (textMatch) {
    const day = textMatch[1].padStart(2, '0');
    const monthStr = textMatch[2].toLowerCase().slice(0, 3);
    const months = {
      ene: '01', feb: '02', mar: '03', abr: '04', may: '05', jun: '06',
      jul: '07', ago: '08', sep: '09', oct: '10', nov: '11', dic: '12'
    };
    const m = months[monthStr];
    const y = textMatch[3] || String(new Date().getFullYear());
    if (m) {
      return `${y}-${m}-${day}`;
    }
  }

  return null;
}

/**
 * Helper para formatear fecha de entrega, rango horario y detectar atraso
 */
function getDeliveryInfo(order) {
  const statusCode = String(order.statusCode || order.status || '').toLowerCase();
  const isDelivered = statusCode.includes('entregado');
  const isCancelled = statusCode.includes('cancelado');

  // Fecha actual local
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = String(now.getMonth() + 1).padStart(2, '0');
  const currentDay = String(now.getDate()).padStart(2, '0');
  const currentIsoDate = `${currentYear}-${currentMonth}-${currentDay}`;

  // 1. Obtener fecha de entrega prometida
  let rawDate = order.deliveryDate || order.dateIso || '';
  if (!rawDate && order.date) {
    rawDate = order.date;
  }

  const cleanIso = parseDateToIso(rawDate);
  let formattedDate = '';
  let isDelayed = false;

  if (cleanIso) {
    const parts = cleanIso.split('-');
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    const d = new Date(year, month, day);

    const monthName = d.toLocaleDateString('es-CL', { month: 'short' });
    const fullDateText = `${d.getDate()} ${monthName} ${d.getFullYear()}`;

    if (cleanIso === currentIsoDate) {
      formattedDate = `Hoy, ${d.getDate()} ${monthName}`;
    } else {
      formattedDate = fullDateText;
    }

    // Comprobar si está atrasado (solo si no está entregado ni cancelado)
    if (!isDelivered && !isCancelled) {
      if (cleanIso < currentIsoDate) {
        // La fecha prometida ya pasó
        isDelayed = true;
      } else if (cleanIso === currentIsoDate) {
        // Es hoy: comprobar si ya pasó el rango horario
        const slotLower = String(order.deliverySlot || '').toLowerCase();
        const currentTotalMinutes = now.getHours() * 60 + now.getMinutes();

        // Slot mañana: vence a las 13:30 (810 min)
        if (slotLower.includes('mañana') || slotLower.includes('13:30') || slotLower.includes('13:00')) {
          if (currentTotalMinutes > 810) {
            isDelayed = true;
          }
        }
        // Slot tarde: vence a las 19:30 (1170 min) o 19:00 (1140 min)
        else if (slotLower.includes('tarde') || slotLower.includes('19:30') || slotLower.includes('19:00')) {
          if (currentTotalMinutes > 1170) {
            isDelayed = true;
          }
        }
      }
    }
  }

  if (!formattedDate) {
    formattedDate = order.deliveryDayText || order.date || 'Fecha por confirmar';
  }

  // 2. Extraer rango horario limpio (eliminando medios de pago y textos innecesarios)
  let cleanSlot = String(order.deliverySlot || 'Horario por coordinar');
  if (cleanSlot.includes('·')) {
    cleanSlot = cleanSlot.split('·')[0].trim();
  }
  if (cleanSlot.includes('Pago:')) {
    cleanSlot = cleanSlot.split('Pago:')[0].trim();
  }

  // Si tiene el rango entre paréntesis (ej: "Mañana (10:00 - 13:30 hrs)"), extraer solo las horas
  const timeRangeMatch = cleanSlot.match(/\(([\d\:\s\-–]+(?:hrs|horas)?)\)/i);
  if (timeRangeMatch && timeRangeMatch[1]) {
    cleanSlot = timeRangeMatch[1].trim();
  }

  return {
    formattedDate,
    cleanSlot,
    isDelayed,
  };
}

export default function CustomerOrdersTable({
  ordersList = [],
  filteredOrders = [],
  orderFilterPeriod = 'todos',
  setOrderFilterPeriod,
  orderFilterCategory = 'todos',
  setOrderFilterCategory,
  orderFilterStatus = 'todos',
  setOrderFilterStatus,
  orderFilterSearch = '',
  setOrderFilterSearch,
  onOpenLiveTracking,
}) {
  return (
    <div className="p-6 md:p-8 rounded-3xl bg-white border border-slate-200/90 shadow-md space-y-6">
      {/* Header Row: Title, Counter & Active Filter Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-5">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0 shadow-2xs mt-0.5">
            <Package className="w-5 h-5 text-amber-700" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                Detalle de Compras Realizadas
              </h3>
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200 shadow-2xs">
                {filteredOrders.length} {filteredOrders.length === 1 ? 'pedido' : 'pedidos'}
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Historial de pedidos, puntos generados y estado de despacho en tiempo real.
            </p>
          </div>
        </div>

        {/* Indicador de filtros activos */}
        {(orderFilterPeriod !== 'todos' || orderFilterCategory !== 'todos' || orderFilterStatus !== 'todos' || orderFilterSearch) && (
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="text-[11px] font-bold text-amber-900 bg-amber-50 border border-amber-200/80 px-2.5 py-1 rounded-xl flex items-center gap-1.5 shadow-2xs">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
              Filtros activos
            </span>
            <button
              type="button"
              onClick={() => {
                setOrderFilterPeriod('todos');
                setOrderFilterCategory('todos');
                setOrderFilterStatus('todos');
                setOrderFilterSearch('');
              }}
              className="text-[11px] font-bold text-slate-500 hover:text-rose-600 underline cursor-pointer transition-colors"
            >
              Restablecer
            </button>
          </div>
        )}
      </div>

      {/* Unified Filter & Search Toolbar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-2.5">
        
        {/* Barra de búsqueda por palabra clave (N° pedido, producto o fecha) */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={orderFilterSearch}
            onChange={(e) => setOrderFilterSearch(e.target.value)}
            placeholder="Buscar por N° pedido, producto o fecha..."
            className="w-full pl-9 pr-9 py-2.5 rounded-xl bg-slate-50/80 hover:bg-slate-50 focus:bg-white border border-slate-200 focus:border-[#F5BA13] text-xs font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-3 focus:ring-[#F5BA13]/20 shadow-2xs transition-all"
          />
          {orderFilterSearch && (
            <button
              type="button"
              onClick={() => setOrderFilterSearch('')}
              className="w-6 h-6 rounded-lg hover:bg-slate-200/80 text-slate-400 hover:text-slate-700 flex items-center justify-center absolute right-2.5 top-1/2 -translate-y-1/2 transition-colors cursor-pointer"
              title="Limpiar búsqueda"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Grupo de Filtros Selectores */}
        <div className="grid grid-cols-1 sm:grid-cols-3 lg:flex items-center gap-2">
          
          {/* 1. Selector de Período / Fecha */}
          <div className="relative min-w-[145px]">
            <Calendar className={`w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none ${
              orderFilterPeriod !== 'todos' ? 'text-amber-700' : 'text-slate-400'
            }`} />
            <select
              value={orderFilterPeriod}
              onChange={(e) => setOrderFilterPeriod(e.target.value)}
              className={`w-full pl-8.5 pr-8 py-2.5 rounded-xl text-xs font-bold appearance-none cursor-pointer focus:outline-none focus:ring-3 focus:ring-[#F5BA13]/20 transition-all border shadow-2xs truncate ${
                orderFilterPeriod !== 'todos'
                  ? 'bg-amber-50/90 border-amber-300 text-amber-950 font-black'
                  : 'bg-slate-50/80 hover:bg-slate-100/80 border-slate-200 text-slate-700'
              }`}
            >
              <option value="todos">Todas las fechas</option>
              <option value="30dias">Últimos 30 días</option>
              <option value="3meses">Últimos 3 meses</option>
              <option value="2026">Todo el 2026</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* 2. Selector de Categoría */}
          <div className="relative min-w-[155px]">
            <Package className={`w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none ${
              orderFilterCategory !== 'todos' ? 'text-amber-700' : 'text-slate-400'
            }`} />
            <select
              value={orderFilterCategory}
              onChange={(e) => setOrderFilterCategory(e.target.value)}
              className={`w-full pl-8.5 pr-8 py-2.5 rounded-xl text-xs font-bold appearance-none cursor-pointer focus:outline-none focus:ring-3 focus:ring-[#F5BA13]/20 transition-all border shadow-2xs truncate ${
                orderFilterCategory !== 'todos'
                  ? 'bg-amber-50/90 border-amber-300 text-amber-950 font-black'
                  : 'bg-slate-50/80 hover:bg-slate-100/80 border-slate-200 text-slate-700'
              }`}
            >
              <option value="todos">Todos los productos</option>
              <option value="Alimento Seco">Alimento Seco</option>
              <option value="Snacks Naturales">Snacks Naturales</option>
              <option value="Antiparasitarios / Salud">Antiparasitarios</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* 3. Selector de Estado de Despacho */}
          <div className="relative min-w-[145px]">
            <Truck className={`w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none ${
              orderFilterStatus !== 'todos' ? 'text-amber-700' : 'text-slate-400'
            }`} />
            <select
              value={orderFilterStatus}
              onChange={(e) => setOrderFilterStatus(e.target.value)}
              className={`w-full pl-8.5 pr-8 py-2.5 rounded-xl text-xs font-bold appearance-none cursor-pointer focus:outline-none focus:ring-3 focus:ring-[#F5BA13]/20 transition-all border shadow-2xs truncate ${
                orderFilterStatus !== 'todos'
                  ? 'bg-amber-50/90 border-amber-300 text-amber-950 font-black'
                  : 'bg-slate-50/80 hover:bg-slate-100/80 border-slate-200 text-slate-700'
              }`}
            >
              <option value="todos">Todos los estados</option>
              <option value="en_camino">En camino</option>
              <option value="entregado">Entregado</option>
              <option value="cancelado">Cancelado</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Botón de Limpiar / Restablecer */}
          {(orderFilterPeriod !== 'todos' || orderFilterCategory !== 'todos' || orderFilterStatus !== 'todos' || orderFilterSearch) && (
            <button
              type="button"
              onClick={() => {
                setOrderFilterPeriod('todos');
                setOrderFilterCategory('todos');
                setOrderFilterStatus('todos');
                setOrderFilterSearch('');
              }}
              className="h-9 px-3 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-700 border border-slate-200 hover:border-rose-200 font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-2xs shrink-0 active:scale-95"
              title="Restablecer todos los filtros"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Limpiar</span>
            </button>
          )}

        </div>
      </div>

      {/* Table / Results (Desktop and Tablet) */}
      <div className="hidden md:block overflow-x-auto rounded-2xl border border-slate-200/80">
        <table className="w-full text-xs text-left">
          <thead className="bg-slate-100 text-slate-700 uppercase font-black border-b border-slate-200">
            <tr>
              <th className="px-5 py-3.5">N° Pedido</th>
              <th className="px-5 py-3.5">Fecha</th>
              <th className="px-5 py-3.5">Producto Adquirido</th>
              <th className="px-5 py-3.5">Entrega Programada</th>
              <th className="px-5 py-3.5">Puntos Ganados</th>
              <th className="px-5 py-3.5">Monto Total</th>
              <th className="px-5 py-3.5 text-center">Estado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200/60 font-semibold text-slate-700">
            {filteredOrders.length > 0 ? (
              filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-4 font-black text-slate-900 font-mono">{order.id}</td>
                  <td className="px-5 py-4 text-slate-500 whitespace-nowrap">{order.date}</td>
                  <td className="px-5 py-4 font-bold text-slate-900 min-w-[200px]">{order.product}</td>
                  <td className="px-5 py-4 whitespace-nowrap">
                    {(() => {
                      const { formattedDate, cleanSlot, isDelayed } = getDeliveryInfo(order);
                      return isDelayed ? (
                        <div className="inline-flex flex-col gap-0.5 px-2.5 py-1.5 rounded-xl bg-rose-50/80 border border-rose-200">
                          <div className="font-black text-xs flex items-center gap-1.5 text-rose-700">
                            <Calendar className="w-3.5 h-3.5 shrink-0 text-rose-600" />
                            <span>{formattedDate}</span>
                            <span className="px-1.5 py-0.5 rounded-md bg-rose-200 text-rose-800 text-[9.5px] font-black inline-flex items-center gap-0.5">
                              <AlertTriangle className="w-2.5 h-2.5 text-rose-700 shrink-0" />
                              Atrasado
                            </span>
                          </div>
                          <div className="text-[11px] font-bold text-rose-600 flex items-center gap-1.5">
                            <Clock className="w-3 h-3 shrink-0 text-rose-500" />
                            <span>{cleanSlot}</span>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-0.5">
                          <div className="font-black text-xs text-slate-800 flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 shrink-0 text-amber-600" />
                            <span>{formattedDate}</span>
                          </div>
                          <div className="text-[11px] text-slate-500 font-medium flex items-center gap-1.5">
                            <Clock className="w-3 h-3 shrink-0 text-slate-400" />
                            <span>{cleanSlot}</span>
                          </div>
                        </div>
                      );
                    })()}
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap">
                    {(() => {
                      const isDelivered = String(order.statusCode || order.status || '').toLowerCase().includes('entregado');
                      const isPaid = (String(order.paymentStatus || '').toLowerCase() === 'pagado') || isDelivered;

                      return (
                        <div className="space-y-0.5">
                          <span className={`font-black text-xs block ${isPaid ? 'text-amber-600' : 'text-slate-600'}`}>
                            +{order.pointsEarned} Pts
                          </span>
                          {!isPaid && (
                            <div>
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded-md border border-amber-200 shadow-2xs" title="Los puntos se sumarán a tu saldo cuando el pago sea aprobado">
                                <Clock className="w-2.5 h-2.5 text-amber-600" /> Pago pendiente
                              </span>
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </td>
                  <td className="px-5 py-4 font-extrabold text-slate-900 whitespace-nowrap">{order.total}</td>
                  <td className="px-5 py-4 text-center whitespace-nowrap">
                    {(() => {
                      const isDelivered = String(order.statusCode || order.status || '').toLowerCase().includes('entregado');
                      const isShipped = String(order.statusCode || order.status || '').toLowerCase().includes('camino');
                      const isCancelled = String(order.statusCode || order.status || '').toLowerCase().includes('cancelado');
                      const statusColor = isCancelled
                        ? 'bg-rose-50 text-rose-800 border-rose-300 shadow-2xs'
                        : isDelivered
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-300 shadow-2xs'
                        : isShipped
                        ? 'bg-sky-50 text-sky-800 border-sky-300 shadow-2xs'
                        : (order.statusColor && !order.statusColor.includes('amber-100') ? order.statusColor : 'bg-amber-50 text-amber-900 border-amber-200 shadow-2xs');

                      return (
                        <span className={`inline-block px-3 py-1 rounded-full text-[11px] font-black border ${statusColor}`}>
                          {order.status}
                        </span>
                      );
                    })()}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="px-6 py-12 text-center text-slate-500">
                  <div className="max-w-xs mx-auto space-y-2.5">
                    <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200/80 flex items-center justify-center mx-auto shadow-2xs">
                      <Search className="w-5 h-5 text-amber-600" />
                    </div>
                    <div className="font-black text-slate-800 text-sm">
                      {ordersList.length === 0 ? 'Aún no tienes compras' : 'No se encontraron compras'}
                    </div>
                    <p className="text-xs text-slate-500 font-medium">
                      {ordersList.length === 0
                        ? '¡Realiza tu primer pedido y acumula puntos Club Patitas para canjear descuentos!'
                        : 'No hay pedidos que coincidan con los filtros seleccionados.'}
                    </p>
                    {ordersList.length > 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          setOrderFilterPeriod('todos');
                          setOrderFilterCategory('todos');
                          setOrderFilterStatus('todos');
                          setOrderFilterSearch('');
                        }}
                        className="mt-2 px-4 py-1.5 rounded-xl bg-[#F5BA13] text-[#1D1D1F] font-black text-xs hover:bg-[#e2aa10] transition-colors cursor-pointer shadow-sm"
                      >
                        Ver todas las compras
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Card List (md:hidden) */}
      <div className="md:hidden space-y-3">
        {filteredOrders.length > 0 ? (
          filteredOrders.map((order) => {
            const { formattedDate, cleanSlot, isDelayed } = getDeliveryInfo(order);
            const isDelivered = String(order.statusCode || order.status || '').toLowerCase().includes('entregado');
            const isShipped = String(order.statusCode || order.status || '').toLowerCase().includes('camino') || String(order.statusCode || order.status || '').toLowerCase().includes('enviado') || String(order.statusCode || order.status || '').toLowerCase().includes('reparto');
            const isCancelled = String(order.statusCode || order.status || '').toLowerCase().includes('cancelado');
            const statusColor = isCancelled
              ? 'bg-rose-50 text-rose-800 border-rose-300 shadow-2xs'
              : isDelivered
              ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
              : isShipped
              ? 'bg-sky-50 text-sky-800 border-sky-300'
              : (order.statusColor && !order.statusColor.includes('amber-100') ? order.statusColor : 'bg-amber-50 text-amber-900 border-amber-200');

            return (
              <div
                key={order.id}
                className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs space-y-3"
              >
                {/* Header: ID + Fecha + Estado */}
                <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                  <div>
                    <span className="font-mono font-black text-xs text-slate-900">{order.id}</span>
                    <span className="text-[11px] text-slate-400 block font-medium">{order.date}</span>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black border ${statusColor}`}>
                    {order.status}
                  </span>
                </div>

                {/* Body: Producto + Despacho */}
                <div className="space-y-2">
                  <div className="text-xs font-black text-slate-900 leading-snug">
                    {order.product}
                  </div>

                  <div className="flex items-center justify-between text-[11px] pt-1">
                    <div className="flex items-center gap-1.5 text-slate-600 font-semibold">
                      <Calendar className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span>{formattedDate}</span>
                      <span className="text-slate-400">•</span>
                      <span className="text-slate-500">{cleanSlot}</span>
                    </div>
                  </div>

                  {isDelayed && (
                    <div className="px-2 py-1 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-[10px] font-bold flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3 shrink-0" />
                      <span>Entrega atrasada</span>
                    </div>
                  )}
                </div>

                {/* Footer: Puntos + Total */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <div className="flex items-center gap-1 text-[11px] font-bold text-amber-700">
                    <Award className="w-3.5 h-3.5 text-[#F5BA13]" />
                    <span>+{order.points} pts</span>
                  </div>
                  <div className="text-sm font-black text-slate-900 font-mono">
                    {order.total}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-500">
            <div className="max-w-xs mx-auto space-y-2.5">
              <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200/80 flex items-center justify-center mx-auto shadow-2xs">
                <Search className="w-5 h-5 text-amber-600" />
              </div>
              <div className="font-black text-slate-800 text-sm">
                {ordersList.length === 0 ? 'Aún no tienes compras' : 'No se encontraron compras'}
              </div>
              <p className="text-xs text-slate-500 font-medium">
                {ordersList.length === 0
                  ? '¡Realiza tu primer pedido y acumula puntos Club Patitas!'
                  : 'No hay pedidos con los filtros seleccionados.'}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Table Footer Summary */}
      <div className="flex items-center justify-between text-xs text-slate-500 font-semibold px-1 pt-1">
        <span>Mostrando <strong>{filteredOrders.length}</strong> de <strong>{ordersList.length}</strong> compras</span>
        <span className="text-slate-600 font-bold flex items-center gap-1.5 text-[11px]">
          <Check className="w-3.5 h-3.5 text-amber-600 shrink-0" />
          Puntos se acreditan automáticamente al confirmar el pago
        </span>
      </div>
    </div>
  );
}
