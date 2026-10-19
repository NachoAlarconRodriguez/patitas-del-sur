import React from 'react';
import { Package, Calendar, ChevronDown, Truck, Search, RotateCcw } from 'lucide-react';

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
    <div className="p-6 md:p-8 rounded-3xl bg-white border border-slate-200 shadow-md space-y-5">
      {/* Header & Filter Controls Bar */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <h3 className="text-lg font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <Package className="w-5 h-5 text-[#0E8388]" />
            <span>Detalle de Compras Realizadas</span>
          </h3>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Historial de pedidos, puntos generados y estado de despacho en tiempo real:
          </p>
        </div>

        {/* Filters Toolbar */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* 1. Date Filter Dropdown */}
          <div className="relative min-w-[145px]">
            <select
              value={orderFilterPeriod}
              onChange={(e) => setOrderFilterPeriod(e.target.value)}
              className="w-full pl-8 pr-7 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-bold text-slate-700 appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#0E8388]/30 transition-all"
            >
              <option value="todos">📅 Todas las fechas</option>
              <option value="30dias">⏳ Últimos 30 días</option>
              <option value="3meses">🗓️ Últimos 3 meses</option>
              <option value="2026">📆 Todo el 2026</option>
            </select>
            <Calendar className="w-3.5 h-3.5 text-[#0E8388] absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* 2. Category Filter Dropdown */}
          <div className="relative min-w-[145px]">
            <select
              value={orderFilterCategory}
              onChange={(e) => setOrderFilterCategory(e.target.value)}
              className="w-full pl-8 pr-7 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-bold text-slate-700 appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#0E8388]/30 transition-all"
            >
              <option value="todos">🥩 Todos los productos</option>
              <option value="Alimento Seco">🥩 Alimento Seco</option>
              <option value="Snacks Naturales">🥓 Snacks Naturales</option>
              <option value="Antiparasitarios / Salud">💊 Antiparasitarios</option>
            </select>
            <Package className="w-3.5 h-3.5 text-[#0E8388] absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* 3. Shipment Status Filter */}
          <div className="relative min-w-[145px]">
            <select
              value={orderFilterStatus}
              onChange={(e) => setOrderFilterStatus(e.target.value)}
              className="w-full pl-8 pr-7 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-bold text-slate-700 appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#0E8388]/30 transition-all"
            >
              <option value="todos">🚚 Todos los estados</option>
              <option value="en_camino">🚚 En Camino</option>
              <option value="entregado">✓ Entregado</option>
            </select>
            <Truck className="w-3.5 h-3.5 text-[#0E8388] absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* 4. Search Filter Input */}
          <div className="relative min-w-[150px] flex-1 sm:flex-initial">
            <input
              type="text"
              value={orderFilterSearch}
              onChange={(e) => setOrderFilterSearch(e.target.value)}
              placeholder="Buscar pedido..."
              className="w-full pl-8 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0E8388]/30 transition-all"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* 5. Reset Filter Button */}
          {(orderFilterPeriod !== 'todos' || orderFilterCategory !== 'todos' || orderFilterStatus !== 'todos' || orderFilterSearch) && (
            <button
              type="button"
              onClick={() => {
                setOrderFilterPeriod('todos');
                setOrderFilterCategory('todos');
                setOrderFilterStatus('todos');
                setOrderFilterSearch('');
              }}
              className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-black text-xs flex items-center gap-1 transition-all cursor-pointer shadow-2xs"
              title="Restablecer filtros"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Limpiar</span>
            </button>
          )}
        </div>
      </div>

      {/* Table / Results */}
      <div className="overflow-x-auto rounded-2xl border border-slate-200/80">
        <table className="w-full text-xs text-left">
          <thead className="bg-slate-100 text-slate-700 uppercase font-black border-b border-slate-200">
            <tr>
              <th className="px-5 py-3.5">N° Pedido</th>
              <th className="px-5 py-3.5">Fecha</th>
              <th className="px-5 py-3.5">Producto Adquirido</th>
              <th className="px-5 py-3.5">Entrega Programada</th>
              <th className="px-5 py-3.5">Puntos Ganados</th>
              <th className="px-5 py-3.5">Monto Total</th>
              <th className="px-5 py-3.5 text-center">Estado & Rastreo</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200/60 font-semibold text-slate-700">
            {filteredOrders.length > 0 ? (
              filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-4 font-black text-[#0E8388] font-mono">{order.id}</td>
                  <td className="px-5 py-4 text-slate-500 whitespace-nowrap">{order.date}</td>
                  <td className="px-5 py-4 font-bold text-slate-900 min-w-[200px]">{order.product}</td>
                  <td className="px-5 py-4 whitespace-nowrap">
                    <div className="font-extrabold text-slate-800 text-xs">
                      {order.deliveryDayText || 'Entrega estándar'}
                    </div>
                    <div className="text-[10px] text-slate-500 font-medium">
                      {order.deliverySlot || 'Tarde (14:00 - 19:00 hrs)'} · Pago: {order.paymentMethod || 'Web'}
                    </div>
                  </td>
                  <td className="px-5 py-4 font-black text-amber-600 whitespace-nowrap">+{order.pointsEarned} Pts</td>
                  <td className="px-5 py-4 font-extrabold text-slate-900 whitespace-nowrap">{order.total}</td>
                  <td className="px-5 py-4 text-center whitespace-nowrap">
                    <div className="flex flex-col items-center gap-1.5">
                      <span className={`px-3 py-1 rounded-full text-[11px] font-black border ${order.statusColor}`}>
                        {order.status}
                      </span>
                      {onOpenLiveTracking && (
                        <button
                          type="button"
                          onClick={() => onOpenLiveTracking(order)}
                          className="px-2.5 py-0.5 rounded-lg bg-teal-50 hover:bg-teal-100 text-[#0E8388] font-bold text-[10px] border border-teal-200 transition-colors cursor-pointer flex items-center gap-1 active:scale-95"
                        >
                          <Truck className="w-3 h-3" />
                          <span>Ver Rastreo</span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="px-6 py-12 text-center text-slate-500">
                  <div className="max-w-xs mx-auto space-y-2">
                    <span className="text-3xl block">🔍</span>
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
                        className="mt-2 px-4 py-1.5 rounded-xl bg-[#0E8388] text-white font-bold text-xs hover:bg-[#0A3E40] transition-colors cursor-pointer"
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

      {/* Table Footer Summary */}
      <div className="flex items-center justify-between text-xs text-slate-500 font-semibold px-1 pt-1">
        <span>Mostrando <strong>{filteredOrders.length}</strong> de <strong>{ordersList.length}</strong> compras</span>
        <span className="text-emerald-700 font-bold">✓ Puntos acumulados automáticamente</span>
      </div>
    </div>
  );
}
