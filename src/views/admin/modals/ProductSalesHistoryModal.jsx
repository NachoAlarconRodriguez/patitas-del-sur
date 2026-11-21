import React from 'react';
import {
  Pause,
  Play,
  Star,
  Edit2,
  X,
  Package,
  ShoppingBag,
  DollarSign,
  TrendingUp,
  BarChart3,
  Clock,
  CheckCircle2,
  Truck,
  Trash2,
  SlidersHorizontal,
} from 'lucide-react';
import { cleanIngredientName } from '../../../services/productsService';
import { extractProductFormat } from '../../../utils/productVariants';
import {
  formatCLP,
  getProductUnitCostNetoTotal,
  getProductUnitCostWithIva,
  getProductImage,
} from '../adminUtils';

/**
 * Modal de Detalle de Ventas, Costos, Gráficos Históricos y Pedidos por Producto
 */
export default function ProductSalesHistoryModal({
  selectedProduct,
  inventory,
  getProductSalesAnalytics,
  productSalesPeriod,
  setProductSalesPeriod,
  onToggleCarouselProduct,
  onTogglePauseProduct,
  onEditProduct,
  onRequestDeleteProduct,
  onRequestAdjustStock,
  onClose,
}) {
  if (!selectedProduct) return null;

  const prod = inventory.find((p) => p.id === selectedProduct.id) || selectedProduct;
  const analytics = getProductSalesAnalytics(prod);
  if (!analytics) return null;

  const unitCostNeto = Number(prod.unitCostNeto) || 0;
  const shippingUnitNeto = Number(prod.shippingUnitCost) || 0;
  const totalUnitCostNeto = getProductUnitCostNetoTotal(prod);
  const shippingUnitWithIva = Math.round(shippingUnitNeto * 1.19);
  const unitCostWithIva = getProductUnitCostWithIva(prod);
  const salePrice = Number(prod.salePrice) || 0;
  const unitProfit = salePrice - unitCostWithIva;
  const unitMarginPct = salePrice > 0 ? Math.round((unitProfit / salePrice) * 100) : 0;
  const totalSkuNetValue = (Number(prod.stock) || 0) * totalUnitCostNeto;
  const formatLabel = prod.format || extractProductFormat(prod);

  const handleOpenEditFromModal = () => {
    onClose();
    onEditProduct({
      ...prod,
      images: Array.isArray(prod.images) ? prod.images : [],
      tagline: prod.tagline || '',
      description: prod.description || prod.tagline || '',
      badge: prod.badge || '',
      benefits: Array.isArray(prod.benefits) ? prod.benefits : [],
      ingredients: Array.isArray(prod.ingredients)
        ? prod.ingredients.map(cleanIngredientName).filter(Boolean)
        : typeof prod.ingredients === 'string' && prod.ingredients.trim()
        ? prod.ingredients.split(',').map(cleanIngredientName).filter(Boolean)
        : [],
      guaranteedAnalysis:
        prod.guaranteedAnalysis &&
        typeof prod.guaranteedAnalysis === 'object' &&
        Object.keys(prod.guaranteedAnalysis).length > 0
          ? { ...prod.guaranteedAnalysis }
          : { 'Proteína Cruda': '32%', 'Grasa Cruda': '16%', 'Fibra Cruda': '4%', 'Humedad': '10%' },
      animalPercent:
        prod.animalPercent ??
        (prod.brand?.toLowerCase().includes('acana')
          ? 65
          : prod.brand?.toLowerCase().includes('bravery')
          ? 85
          : 70),
      proteinValue: prod.proteinValue || 30,
      mainProtein: prod.mainProtein || 'Pollo',
      grainLevel: prod.grainLevel || 'free',
      isVeterinary: Boolean(prod.isVeterinary),
      vetDetail: prod.vetDetail || '',
      lifeStage: prod.lifeStage || 'adulto',
    });
  };

  const currentChartData =
    productSalesPeriod === '7d'
      ? analytics.days7
      : productSalesPeriod === '30d'
      ? analytics.weeks30
      : analytics.months12;

  const maxUnits = Math.max(...currentChartData.map((d) => d.units), 1);
  const periodTotalUnits = currentChartData.reduce((acc, d) => acc + d.units, 0);
  const periodTotalRevenue = currentChartData.reduce((acc, d) => acc + d.revenue, 0);
  const periodTotalMargin = currentChartData.reduce((acc, d) => acc + d.margin, 0);

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl max-w-4xl w-full border border-slate-200 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[92vh] no-scrollbar"
      >
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-r from-slate-50 via-amber-50/30 to-white shrink-0">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 p-1.5 shadow-xs shrink-0 flex items-center justify-center">
              <img
                src={getProductImage(prod.name)}
                alt={prod.name}
                className="max-h-full max-w-full object-contain"
              />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2 py-0.5 rounded-md bg-[#D97706]/10 text-[#D97706] font-black text-[10px] uppercase tracking-wider border border-[#D97706]/20">
                  {prod.brand}
                </span>
                <span className="text-[11px] font-mono text-slate-500">
                  {prod.sku ? `SKU: ${prod.sku} • ` : ''}
                  {formatLabel}
                </span>
                {prod.isPaused && (
                  <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 text-[10px] font-black uppercase border border-amber-200 inline-flex items-center gap-1">
                    <Pause className="w-2.5 h-2.5 fill-current" />
                    <span>Pausado en tienda</span>
                  </span>
                )}
                {prod.inCarousel && (
                  <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 text-[10px] font-bold border border-amber-200 inline-flex items-center gap-1">
                    <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-500" />
                    <span>En Carrusel</span>
                  </span>
                )}
              </div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 leading-snug mt-0.5">
                {prod.name}
              </h3>
            </div>
          </div>

          {/* Acciones rápidas del producto en la cabecera */}
          <div className="flex items-center gap-1.5 self-end sm:self-auto">
            <button
              type="button"
              onClick={() => onToggleCarouselProduct(prod)}
              className={`px-3 py-1.5 rounded-xl text-[11px] font-bold border transition-all cursor-pointer flex items-center gap-1.5 ${
                prod.inCarousel
                  ? 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
              title={prod.inCarousel ? 'Quitar del Carrusel Promocional' : 'Destacar en Carrusel Promocional'}
            >
              <Star className={`w-3.5 h-3.5 ${prod.inCarousel ? 'fill-amber-400 text-amber-500' : 'text-slate-400'}`} />
              <span>{prod.inCarousel ? 'Destacado' : 'Carrusel'}</span>
            </button>

            <button
              type="button"
              onClick={() => onTogglePauseProduct(prod)}
              className={`px-3 py-1.5 rounded-xl text-[11px] font-bold border transition-all cursor-pointer flex items-center gap-1.5 ${
                prod.isPaused
                  ? 'bg-amber-500 hover:bg-amber-600 text-white border-amber-500'
                  : 'bg-white hover:bg-amber-50 text-slate-600 hover:text-amber-800 border-slate-200'
              }`}
              title={prod.isPaused ? 'Reactivar producto en tienda pública' : 'Pausar producto en tienda pública'}
            >
              {prod.isPaused ? <Play className="w-3.5 h-3.5 fill-current" /> : <Pause className="w-3.5 h-3.5" />}
              <span>{prod.isPaused ? 'Reactivar' : 'Pausar'}</span>
            </button>

            <button
              type="button"
              onClick={handleOpenEditFromModal}
              className="px-3 py-1.5 rounded-xl bg-white hover:bg-[#FEF3C7] text-slate-700 hover:text-[#D97706] border border-slate-200 text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1.5"
              title="Editar producto"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>Editar</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer ml-1"
              title="Cerrar ventana"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 no-scrollbar text-xs">
          {/* Ficha Financiera de Costos, Precios y Valorización en Bodega */}
          <div className="bg-[#F8FAFC] border border-[#EAECEF] rounded-2xl p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Package className="w-3.5 h-3.5 text-[#D97706]" />
                <span>Detalle de Costos, Precios y Bodega ({formatLabel})</span>
              </span>
              <span className="text-[11px] font-mono text-slate-500">
                Valorización Total SKU ({prod.stock} u.):{' '}
                <strong className="text-slate-900">{formatCLP(totalSkuNetValue)} neto</strong>
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-white rounded-xl p-3 border border-[#EAECEF]">
                <span className="text-[10px] font-semibold text-slate-400 uppercase block">Costo Neto Total</span>
                <span className="text-sm font-mono font-bold text-slate-800 mt-0.5 block">
                  {formatCLP(totalUnitCostNeto)}
                </span>
                {shippingUnitNeto > 0 ? (
                  <span className="text-[10px] font-mono text-slate-400 block mt-0.5">
                    Prod. {formatCLP(unitCostNeto)} + Flete {formatCLP(shippingUnitNeto)}
                  </span>
                ) : (
                  <span className="text-[10px] text-slate-400 block mt-0.5">Sin recargo de flete</span>
                )}
              </div>
              <div className="bg-white rounded-xl p-3 border border-[#EAECEF]">
                <span className="text-[10px] font-semibold text-slate-400 uppercase block">Costo Total c/IVA (19%)</span>
                <span className="text-sm font-mono font-bold text-slate-900 mt-0.5 block">
                  {formatCLP(unitCostWithIva)}
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  {shippingUnitWithIva > 0 ? 'Prod. + Flete con 19% IVA' : 'Costo Neto × 1,19'}
                </span>
              </div>
              <div className="bg-white rounded-xl p-3 border border-[#EAECEF]">
                <span className="text-[10px] font-semibold text-slate-400 uppercase block">Precio de Venta</span>
                <span className="text-sm font-mono font-extrabold text-slate-900 mt-0.5 block">
                  {formatCLP(salePrice)}
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">PVP Tienda &amp; Manual</span>
              </div>
              <div className="bg-white rounded-xl p-3 border border-[#EAECEF]">
                <span className="text-[10px] font-semibold text-slate-400 uppercase block">Ganancia Unitaria</span>
                <span
                  className={`text-sm font-mono font-extrabold mt-0.5 block ${
                    unitProfit >= 0 ? 'text-emerald-600' : 'text-rose-600'
                  }`}
                >
                  {unitProfit >= 0 ? `+${formatCLP(unitProfit)}` : `-${formatCLP(Math.abs(unitProfit))}`} (
                  {unitMarginPct >= 0 ? `+${unitMarginPct}%` : `${unitMarginPct}%`})
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">Por cada unidad vendida</span>
              </div>
            </div>
          </div>

          {/* 4 KPI Highlights */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5 space-y-1">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[10px] font-bold uppercase tracking-wider">Unidades Vendidas</span>
                <ShoppingBag className="w-4 h-4 text-[#D97706]" />
              </div>
              <div className="text-xl font-black text-slate-900">
                {analytics.totalUnitsSold} <span className="text-xs font-bold text-slate-500">u.</span>
              </div>
              <div className="text-[10px] text-slate-500 font-medium">
                Promedio: <strong className="text-slate-700">{analytics.monthlyAverageUnits} u./mes</strong>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5 space-y-1">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[10px] font-bold uppercase tracking-wider">Facturación Total</span>
                <DollarSign className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-xl font-black text-emerald-600">{formatCLP(analytics.totalRevenue)}</div>
              <div className="text-[10px] text-slate-500 font-medium">
                PVP Unitario: <strong className="text-slate-700">{formatCLP(prod.salePrice)}</strong>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5 space-y-1">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[10px] font-bold uppercase tracking-wider">Margen Bruto Total</span>
                <TrendingUp className="w-4 h-4 text-[#D97706]" />
              </div>
              <div className="text-xl font-black text-slate-900">{formatCLP(analytics.totalMargin)}</div>
              <div className="text-[10px] font-medium text-emerald-700">
                Margen: <strong className="font-extrabold">+{analytics.marginPercent}%</strong> por unidad
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5 space-y-1">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[10px] font-bold uppercase tracking-wider">Stock &amp; Cobertura</span>
                <Package className="w-4 h-4 text-amber-500" />
              </div>
              <div className="text-xl font-black text-slate-900">
                {prod.stock} <span className="text-xs font-bold text-slate-500">en bodega</span>
              </div>
              <div className="text-[10px] text-slate-500 font-medium">
                Cobertura estimada: <strong className="text-slate-700">{analytics.stockCoverageDays}</strong>
              </div>
            </div>
          </div>

          {/* Gráfico interactivo de Ventas */}
          <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-[#D97706]" />
                  <h4 className="font-black text-slate-900 text-sm">
                    Gráfico de Ventas &amp; Evolución Histórica
                  </h4>
                </div>
                <p className="text-[11px] text-slate-500">
                  {productSalesPeriod === '7d'
                    ? 'Ventas diarias de los últimos 7 días con desglose por jornada.'
                    : productSalesPeriod === '30d'
                    ? 'Ventas semanales del último mes de facturación.'
                    : 'Ventas mes a mes durante los últimos 12 meses.'}
                </p>
              </div>

              <div className="inline-flex items-center p-1 bg-slate-100 rounded-2xl border border-slate-200 shrink-0 self-start sm:self-auto">
                {[
                  { id: '7d', label: '7 Días (Diario)' },
                  { id: '30d', label: '30 Días (Semanas)' },
                  { id: 'mes', label: '12 Meses' },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setProductSalesPeriod(opt.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      productSalesPeriod === opt.id
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 bg-slate-50/80 p-3 rounded-2xl border border-slate-100 text-center">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Unidades Periodo</span>
                <span className="text-sm font-black text-slate-900">{periodTotalUnits} u.</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Facturación Periodo</span>
                <span className="text-sm font-black text-emerald-600">{formatCLP(periodTotalRevenue)}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Ganancia Bruta</span>
                <span className="text-sm font-black text-[#D97706]">{formatCLP(periodTotalMargin)}</span>
              </div>
            </div>

            {/* Visual Line Chart */}
            <div className="pt-2 pb-1">
              {(() => {
                const chartWidth = 720;
                const chartHeight = 180;
                const padX = 42;
                const padTop = 32;
                const padBottom = 26;
                const availableWidth = chartWidth - padX * 2;
                const availableHeight = chartHeight - padTop - padBottom;

                const pts = currentChartData.map((item, idx) => {
                  const x =
                    currentChartData.length > 1
                      ? padX + (idx / (currentChartData.length - 1)) * availableWidth
                      : chartWidth / 2;
                  const normalizedValue = maxUnits > 0 ? item.units / maxUnits : 0;
                  const y = chartHeight - padBottom - normalizedValue * availableHeight;
                  return { x, y, item, idx };
                });

                let linePath = '';
                if (pts.length === 1) {
                  linePath = `M ${pts[0].x - 30},${pts[0].y} L ${pts[0].x + 30},${pts[0].y}`;
                } else if (pts.length > 1) {
                  linePath = `M ${pts[0].x},${pts[0].y}`;
                  for (let i = 0; i < pts.length - 1; i++) {
                    const p0 = i > 0 ? pts[i - 1] : pts[i];
                    const p1 = pts[i];
                    const p2 = pts[i + 1];
                    const p3 = i < pts.length - 2 ? pts[i + 2] : p2;
                    const cp1x = p1.x + (p2.x - p0.x) / 6;
                    const cp1y = p1.y + (p2.y - p0.y) / 6;
                    const cp2x = p2.x - (p3.x - p1.x) / 6;
                    const cp2y = p2.y - (p3.y - p1.y) / 6;
                    linePath += ` C ${cp1x.toFixed(1)},${cp1y.toFixed(1)} ${cp2x.toFixed(1)},${cp2y.toFixed(1)} ${p2.x.toFixed(1)},${p2.y.toFixed(1)}`;
                  }
                }

                const areaPath =
                  pts.length > 1
                    ? `${linePath} L ${pts[pts.length - 1].x},${chartHeight - padBottom + 10} L ${pts[0].x},${chartHeight - padBottom + 10} Z`
                    : '';

                return (
                  <div className="relative w-full">
                    <svg
                      viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                      className="w-full h-48 overflow-visible"
                      preserveAspectRatio="none"
                    >
                      <defs>
                        <linearGradient id="lineSalesGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#D97706" stopOpacity="0.28" />
                          <stop offset="70%" stopColor="#D97706" stopOpacity="0.05" />
                          <stop offset="100%" stopColor="#D97706" stopOpacity="0" />
                        </linearGradient>
                        <linearGradient id="strokeLineGradient" x1="0" y1="0" x2="1" y2="0">
                          <stop offset="0%" stopColor="#D97706" />
                          <stop offset="50%" stopColor="#2DD4BF" />
                          <stop offset="100%" stopColor="#D97706" />
                        </linearGradient>
                        <filter id="pointShadow" x="-50%" y="-50%" width="200%" height="200%">
                          <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#D97706" floodOpacity="0.35" />
                        </filter>
                      </defs>

                      <line x1={padX - 10} y1={padTop} x2={chartWidth - padX + 10} y2={padTop} stroke="#F1F5F9" strokeWidth="1.5" strokeDasharray="4 4" />
                      <line x1={padX - 10} y1={padTop + availableHeight / 2} x2={chartWidth - padX + 10} y2={padTop + availableHeight / 2} stroke="#F1F5F9" strokeWidth="1.5" strokeDasharray="4 4" />
                      <line x1={padX - 10} y1={chartHeight - padBottom} x2={chartWidth - padX + 10} y2={chartHeight - padBottom} stroke="#E2E8F0" strokeWidth="1.5" />

                      {areaPath && <path d={areaPath} fill="url(#lineSalesGradient)" />}
                      {linePath && (
                        <path
                          d={linePath}
                          fill="none"
                          stroke="url(#strokeLineGradient)"
                          strokeWidth="3.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      )}

                      {pts.map((pt, idx) => (
                        <g key={idx} className="group/pt cursor-pointer">
                          <circle cx={pt.x} cy={pt.y} r="20" fill="transparent" />
                          <line
                            x1={pt.x}
                            y1={pt.y}
                            x2={pt.x}
                            y2={chartHeight - padBottom}
                            stroke="#D97706"
                            strokeWidth="1.5"
                            strokeDasharray="3 3"
                            className="opacity-0 group-hover/pt:opacity-70 transition-opacity"
                          />
                          <circle
                            cx={pt.x}
                            cy={pt.y}
                            r="5.5"
                            fill="#FFFFFF"
                            stroke="#D97706"
                            strokeWidth="3"
                            filter="url(#pointShadow)"
                            className="group-hover/pt:scale-125 transition-transform origin-center"
                          />
                          <circle cx={pt.x} cy={pt.y} r="2" fill="#D97706" />
                          <text
                            x={pt.x}
                            y={pt.y - 11}
                            textAnchor="middle"
                            className="text-[10px] font-black fill-slate-700 select-none group-hover/pt:fill-[#D97706]"
                          >
                            {pt.item.units}
                          </text>

                          <g className="opacity-0 group-hover/pt:opacity-100 transition-opacity pointer-events-none z-30">
                            <rect
                              x={Math.max(10, Math.min(chartWidth - 140, pt.x - 65))}
                              y={Math.max(5, pt.y - 65)}
                              width="130"
                              height="48"
                              rx="10"
                              fill="#0F172A"
                              opacity="0.95"
                              stroke="#334155"
                              strokeWidth="1"
                              filter="url(#pointShadow)"
                            />
                            <text
                              x={Math.max(10, Math.min(chartWidth - 140, pt.x - 65)) + 65}
                              y={Math.max(5, pt.y - 65) + 16}
                              textAnchor="middle"
                              fill="#5EEAD4"
                              fontSize="10"
                              fontWeight="bold"
                            >
                              {pt.item.label}
                            </text>
                            <text
                              x={Math.max(10, Math.min(chartWidth - 140, pt.x - 65)) + 65}
                              y={Math.max(5, pt.y - 65) + 30}
                              textAnchor="middle"
                              fill="#FFFFFF"
                              fontSize="10"
                              fontWeight="bold"
                            >
                              {pt.item.units} u. • {formatCLP(pt.item.revenue)}
                            </text>
                            <text
                              x={Math.max(10, Math.min(chartWidth - 140, pt.x - 65)) + 65}
                              y={Math.max(5, pt.y - 65) + 42}
                              textAnchor="middle"
                              fill="#34D399"
                              fontSize="9"
                              fontWeight="semibold"
                            >
                              Margen: {formatCLP(pt.item.margin)}
                            </text>
                          </g>
                        </g>
                      ))}
                    </svg>

                    <div className="flex items-center justify-between px-3 sm:px-6 pt-1 text-[11px] font-bold text-slate-500">
                      {currentChartData.map((d, i) => (
                        <span
                          key={i}
                          className="truncate text-center hover:text-[#D97706] transition-colors"
                          style={{ width: `${100 / currentChartData.length}%` }}
                        >
                          {d.day}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>

          {/* Pedidos Recientes de este Producto */}
          <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#D97706]" />
                <h4 className="font-black text-slate-900 text-sm">
                  Últimos Pedidos con este Producto ({analytics.recentOrders.length})
                </h4>
              </div>
              <span className="text-[11px] text-slate-400 font-medium">
                Trazabilidad por cliente y despacho
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 text-[10px] uppercase font-bold tracking-wider">
                    <th className="py-2.5 px-3">Pedido</th>
                    <th className="py-2.5 px-3">Fecha</th>
                    <th className="py-2.5 px-3">Cliente &amp; Mascota</th>
                    <th className="py-2.5 px-3 text-center">Cantidad</th>
                    <th className="py-2.5 px-3">Total CLP</th>
                    <th className="py-2.5 px-3">Método Pago</th>
                    <th className="py-2.5 px-3 text-center">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {analytics.recentOrders.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="py-8 text-center text-slate-400">
                        <Package className="w-6 h-6 mx-auto mb-1.5 text-slate-300 stroke-[1.5]" />
                        <span>Aún no hay pedidos registrados con este producto.</span>
                      </td>
                    </tr>
                  ) : (
                    analytics.recentOrders.map((ord) => (
                      <tr key={ord.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-2.5 px-3 font-mono font-bold text-slate-900">{ord.id}</td>
                        <td className="py-2.5 px-3 text-slate-500 whitespace-nowrap">{ord.date}</td>
                        <td className="py-2.5 px-3">
                          <div className="font-bold text-slate-800">{ord.customer}</div>
                          <div className="text-[10px] text-slate-400">{ord.pet}</div>
                        </td>
                        <td className="py-2.5 px-3 text-center font-black text-slate-900">{ord.units} u.</td>
                        <td className="py-2.5 px-3 font-black text-emerald-600 font-mono">{formatCLP(ord.total)}</td>
                        <td className="py-2.5 px-3 text-slate-600">
                          <span className="inline-block px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-medium">
                            {ord.paymentMethod}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-center whitespace-nowrap">
                          {ord.status === 'cancelado' ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-bold">
                              <X className="w-3 h-3 stroke-[2.5]" />
                              Cancelado
                            </span>
                          ) : ord.status === 'entregado' ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                              <CheckCircle2 className="w-3 h-3 stroke-[2.5]" />
                              Entregado
                            </span>
                          ) : ord.status === 'en_camino' ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-bold">
                              <Truck className="w-3 h-3 stroke-[2.5]" />
                              En camino
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold">
                              <Clock className="w-3 h-3 stroke-[2.5]" />
                              En preparación
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={() => {
              onClose();
              onRequestDeleteProduct(prod);
            }}
            className="px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer self-start sm:self-auto"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Eliminar Producto</span>
          </button>

          <div className="flex items-center gap-2 self-end sm:self-auto flex-wrap">
            <button
              type="button"
              onClick={() => {
                onClose();
                onRequestAdjustStock(prod);
              }}
              className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Ajustar Stock</span>
            </button>

            <button
              type="button"
              onClick={handleOpenEditFromModal}
              className="px-3.5 py-2 rounded-xl bg-white hover:bg-[#FEF3C7] text-slate-700 hover:text-[#D97706] border border-slate-200 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>Editar Producto</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-[#D97706] hover:bg-[#78350F] text-white font-bold text-xs transition-colors shadow-xs cursor-pointer"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
