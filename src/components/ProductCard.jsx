import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Star, ShoppingBag, Eye, Stethoscope } from 'lucide-react';
import { getFlavorSwatchStyle } from '../utils/productVariants';
import AppleNutritionSpecs from './AppleNutritionSpecs';

export default function ProductCard({ product, onSelectProduct, onAddToCart }) {
  const navigate = useNavigate();

  const formatCLP = (price) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      maximumFractionDigits: 0,
    }).format(price || 0);
  };

  const variants = product.variants || [];
  const hasVariants = variants.length > 1;
  const isFlavorFamily = Boolean(product.hasFlavorVariants);

  // Multi-selección para familias de sabores (array de índices)
  const [selectedVariantIndices, setSelectedVariantIndices] = React.useState([0]);
  // Selección simple para formatos estándar de peso
  const [selectedVariantIdx, setSelectedVariantIdx] = React.useState(0);
  const [hoveredVariantIdx, setHoveredVariantIdx] = React.useState(null);
  const [lastInteractedIdx, setLastInteractedIdx] = React.useState(null);

  // Toggle de selección para sabores
  const toggleVariantSelection = (idx) => {
    setLastInteractedIdx(idx);
    setSelectedVariantIndices((prev) => {
      if (prev.includes(idx)) {
        return prev.filter((i) => i !== idx);
      } else {
        return [...prev, idx];
      }
    });
  };

  // Variantes activas seleccionadas
  const selectedVariants = isFlavorFamily
    ? selectedVariantIndices.map((i) => variants[i]).filter(Boolean)
    : [variants[selectedVariantIdx] || variants[0]].filter(Boolean);

  const activeVariant =
    (lastInteractedIdx !== null && selectedVariantIndices.includes(lastInteractedIdx) && variants[lastInteractedIdx])
    || selectedVariants[0]
    || (hasVariants ? variants[0] : null);

  const displayVariant = (hasVariants && hoveredVariantIdx !== null && variants[hoveredVariantIdx])
    ? variants[hoveredVariantIdx]
    : activeVariant;

  const unitPrice = activeVariant ? activeVariant.price : (product.price || 0);
  const totalPrice = isFlavorFamily
    ? (selectedVariants.length > 0
        ? selectedVariants.reduce((sum, v) => sum + (v.price || 0), 0)
        : (product.price || 0))
    : (activeVariant ? activeVariant.price : (product.price || 0));

  const currentPrice = totalPrice;

  const currentOriginalPrice = activeVariant ? activeVariant.originalPrice : product.originalPrice;
  const totalOriginalPrice = currentOriginalPrice
    ? currentOriginalPrice * (isFlavorFamily ? Math.max(1, selectedVariants.length) : 1)
    : null;

  const isSelectionEmpty = isFlavorFamily && selectedVariants.length === 0;
  const isAllSelectedOutOfStock = isFlavorFamily
    ? (selectedVariants.length > 0 && selectedVariants.every((v) => (v.stock <= 0 || v.isPaused)))
    : (activeVariant ? (activeVariant.stock <= 0 || activeVariant.isPaused) : (product.stock <= 0 || product.isOutOfStock));

  const isAddToCartDisabled = isSelectionEmpty || isAllSelectedOutOfStock;

  const isDog = product.petType === 'perros';
  const isGrainFree = 
    product.badge?.toLowerCase().includes('grain') ||
    product.tagline?.toLowerCase().includes('grain') ||
    product.brand?.toLowerCase().includes('bravery') ||
    product.brand?.toLowerCase().includes('patagonia') ||
    product.ingredients?.some((i) => i.toLowerCase().includes('grain free'));

  const handleCardClick = () => {
    navigate(`/producto/${activeVariant?.id || product.id}`);
  };

  const currentVariantFormat = displayVariant?.format || activeVariant?.format || '';

  return (
    <div className="group relative bg-white rounded-3xl p-4 md:p-5 shadow-sm hover:shadow-2xl transition-all duration-500 border border-slate-100 flex flex-col justify-between hover:-translate-y-1.5 cursor-pointer">
      
      {/* Image Container */}
      <Link
        to={`/producto/${activeVariant?.id || product.id}`}
        className="relative w-full aspect-square rounded-2xl overflow-hidden bg-slate-50 mb-3 flex items-center justify-center p-4 border border-slate-100/60 block"
        aria-label={`Ver detalles de ${product.name}`}
      >
        {/* Rating Badge Overlay Top Right */}
        <div className="absolute top-3 right-3 z-10 flex items-center gap-1 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-full text-xs font-black text-amber-500 shadow-sm border border-slate-200/60">
          <Star className="w-3.5 h-3.5 fill-amber-400" />
          <span>{product.rating || 5.0}</span>
          <span className="text-slate-400 font-normal text-[10px]">({product.reviewsCount || 12})</span>
        </div>

        {/* Status Badges Overlay Top Left */}
        <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5">
          {isAllSelectedOutOfStock && (
            <div className="flex items-center gap-1.5 bg-rose-600/95 text-white backdrop-blur-md px-2.5 py-1 rounded-full text-xs font-black shadow-sm border border-rose-400/30">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              <span>Agotado</span>
            </div>
          )}
          {Boolean(product.isVeterinary) && !isAllSelectedOutOfStock && (
            <div className="flex items-center gap-1.5 bg-teal-800/90 text-white backdrop-blur-md px-2.5 py-1 rounded-full text-[11px] font-black shadow-sm border border-teal-500/30">
              <Stethoscope className="w-3 h-3 text-teal-200" />
              <span>Receta Vet</span>
            </div>
          )}
        </div>

        {/* View Product Overlay on Hover */}
        <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-xs opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 flex items-center justify-center gap-2 text-white font-bold text-sm">
          <span className="px-4 py-2 rounded-full bg-white text-slate-900 shadow-xl flex items-center gap-1.5 hover:scale-105 transition-transform">
            <Eye className="w-4 h-4 text-[#0E8388]" /> Ver Detalles
          </span>
        </div>

        {/* Product Image */}
        <img
          src={displayVariant?.image || activeVariant?.image || product.image}
          alt={`${product.name} - Alimento para ${isDog ? 'perros' : 'gatos'} en Puerto Varas, Patitas del Sur`}
          loading="lazy"
          decoding="async"
          className={`w-full h-full object-contain group-hover:scale-105 transition-transform duration-500 ${
            isAllSelectedOutOfStock ? 'opacity-40 grayscale' : ''
          }`}
        />
      </Link>

      {/* Content Body */}
      <div className="flex flex-col flex-grow space-y-3">
        
        {/* Apple Style Nutrition Rings & Spec Visualizer */}
        <AppleNutritionSpecs
          product={product}
          activeFlavor={currentVariantFormat}
        />

        {/* Product Title */}
        <h3 className="font-heading font-extrabold text-base sm:text-lg text-slate-900 line-clamp-2 leading-snug tracking-tight">
          <Link
            to={`/producto/${activeVariant?.id || product.id}`}
            className="group-hover:text-[#0E8388] transition-colors"
          >
            {product.name}
          </Link>
        </h3>

        {/* Short Description */}
        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed flex-grow font-medium">
          {product.tagline || `${product.brand || 'Patitas del Sur'} • Nutrición completa y balanceada.`}
        </p>

        {/* Weights / Formats Selector - Apple Style Swatches for Flavors */}
        {hasVariants ? (
          <div className="pt-1.5 space-y-1.5">
            {isFlavorFamily ? (
              /* Apple Finish Swatches for Flavor Varieties (Multi-selection & Sutil Hollow Design) */
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs min-h-[18px]">
                  <div className="text-slate-500 font-medium text-[11px] truncate mr-2">
                    {hoveredVariantIdx !== null ? (
                      <span>
                        Sabor: <strong className="text-slate-900 font-bold">{displayVariant?.format}</strong>
                      </span>
                    ) : selectedVariants.length === 0 ? (
                      <span className="text-amber-600 font-semibold text-[11px]">
                        Selecciona uno o más sabores
                      </span>
                    ) : selectedVariants.length === 1 ? (
                      <span>
                        Sabor: <strong className="text-slate-900 font-bold">{selectedVariants[0]?.format}</strong>
                      </span>
                    ) : (
                      <span>
                        Sabores ({selectedVariants.length}):{' '}
                        <strong className="text-slate-900 font-bold">
                          {selectedVariants.map((v) => v.format).join(', ')}
                        </strong>
                      </span>
                    )}
                  </div>

                  {hoveredVariantIdx !== null ? (
                    <span className={`text-[10px] font-bold shrink-0 ${
                      displayVariant?.stock <= 0
                        ? 'text-rose-500'
                        : displayVariant?.stock === 1
                        ? 'text-amber-600'
                        : 'text-emerald-700'
                    }`}>
                      {displayVariant?.stock <= 0
                        ? 'Agotado'
                        : displayVariant?.stock === 1
                        ? '¡Última unidad!'
                        : `${displayVariant?.stock} disp.`}
                    </span>
                  ) : selectedVariants.length > 1 ? (
                    <span className="text-[10px] font-bold text-[#0E8388] shrink-0 bg-[#E6F4F1] px-2 py-0.5 rounded-full">
                      {selectedVariants.length} seleccionados
                    </span>
                  ) : selectedVariants.length === 1 ? (
                    <span className={`text-[10px] font-bold shrink-0 ${
                      selectedVariants[0]?.stock <= 0
                        ? 'text-rose-500'
                        : selectedVariants[0]?.stock === 1
                        ? 'text-amber-600'
                        : 'text-emerald-700'
                    }`}>
                      {selectedVariants[0]?.stock <= 0
                        ? 'Agotado'
                        : selectedVariants[0]?.stock === 1
                        ? '¡Última unidad!'
                        : `${selectedVariants[0]?.stock} disp.`}
                    </span>
                  ) : null}
                </div>

                {/* Swatches Horizontal Row */}
                <div
                  className="flex items-center gap-2.5 py-1 px-0.5 overflow-x-auto scrollbar-none"
                  onMouseLeave={() => setHoveredVariantIdx(null)}
                >
                  {variants.map((v, idx) => {
                    const isSelected = selectedVariantIndices.includes(idx);
                    const isHovered = hoveredVariantIdx === idx;
                    const vOutOfStock = v.stock <= 0 || v.isPaused;
                    const swatch = getFlavorSwatchStyle(v.format);

                    return (
                      <button
                        key={v.id || idx}
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          if (vOutOfStock) return;
                          toggleVariantSelection(idx);
                        }}
                        onMouseEnter={() => setHoveredVariantIdx(idx)}
                        className={`group/swatch relative rounded-full transition-all duration-200 cursor-pointer flex-shrink-0 flex items-center justify-center focus:outline-none ${
                          vOutOfStock
                            ? 'opacity-35 cursor-not-allowed'
                            : isSelected
                            ? 'scale-105'
                            : 'hover:scale-110 active:scale-95'
                        }`}
                        style={{ width: '27px', height: '27px' }}
                        title={`${v.format}${vOutOfStock ? ' (Agotado)' : ` - ${formatCLP(v.price)}`}`}
                        aria-label={`Seleccionar sabor ${v.format}`}
                        aria-pressed={isSelected}
                      >
                        {/* Círculo sutil: línea fina exterior de color con fondo blanco */}
                        <span
                          className={`w-full h-full rounded-full flex items-center justify-center transition-all duration-200 bg-white ${
                            isHovered && !isSelected ? 'shadow-xs' : ''
                          }`}
                          style={{
                            border: `2px solid ${swatch.primaryColor}`,
                            padding: isSelected ? '3px' : '0px',
                          }}
                        >
                          {/* Centro de color activo con espacio blanco de separación */}
                          {isSelected && (
                            <span
                              className="w-full h-full rounded-full block animate-in zoom-in-50 duration-150"
                              style={{ backgroundColor: swatch.primaryColor }}
                            />
                          )}
                        </span>

                        {/* Línea diagonal si está agotado */}
                        {vOutOfStock && (
                          <span className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <span className="w-full h-0.5 bg-rose-600/80 -rotate-45 block" />
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              /* Standard Weights (e.g. 3 kg, 12 kg) Segmented Controls */
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  <span>Formato disponible:</span>
                  {activeVariant && (
                    <span className={activeVariant.stock <= 0 ? 'text-rose-500 font-bold' : 'text-emerald-700 font-bold'}>
                      {activeVariant.stock <= 0 ? 'Agotado' : activeVariant.stock === 1 ? '¡Última unidad!' : `${activeVariant.stock} disponibles`}
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {variants.map((v, idx) => {
                    const isSelected = selectedVariantIdx === idx;
                    const vOutOfStock = v.stock <= 0 || v.isPaused;
                    return (
                      <button
                        key={v.id || idx}
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setSelectedVariantIdx(idx);
                        }}
                        className={`text-[11px] font-black px-3 py-1 rounded-xl transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#0E8388] text-white shadow-xs scale-105 ring-2 ring-[#0E8388]/30'
                            : vOutOfStock
                            ? 'bg-slate-100 text-slate-300 line-through cursor-not-allowed border border-slate-200/50'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200/70 hover:scale-102'
                        }`}
                        title={vOutOfStock ? `${v.format} - Agotado` : `${v.format} - ${formatCLP(v.price)}`}
                      >
                        {v.format}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        ) : (
          product.weights && product.weights.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {product.weights.map((w, idx) => (
                <span
                  key={idx}
                  className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200/60"
                >
                  {w}
                </span>
              ))}
            </div>
          )
        )}

      </div>

      {/* Footer: Price & Add to Cart */}
      <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between">
        <div>
          {hasVariants && !isFlavorFamily && (
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Formato {activeVariant?.format}
            </span>
          )}
          {isFlavorFamily && selectedVariants.length > 1 && (
            <span className="text-[10px] font-bold text-slate-400 block leading-none mb-1">
              {selectedVariants.length} latas • {formatCLP(unitPrice)} c/u
            </span>
          )}
          <div className="text-lg font-black text-slate-900 leading-tight">
            {formatCLP(totalPrice)}
          </div>
          {totalOriginalPrice && (
            <div className="text-[11px] text-slate-400 line-through font-semibold">
              {formatCLP(totalOriginalPrice)}
            </div>
          )}
        </div>

        <button
          type="button"
          disabled={isAddToCartDisabled}
          onClick={(e) => {
            e.stopPropagation();
            if (isAddToCartDisabled) return;

            if (isFlavorFamily && selectedVariants.length > 0) {
              selectedVariants.forEach((v) => {
                const itemToAdd = {
                  ...product,
                  id: v.id || product.id,
                  name: v.name || (v.format ? `${product.name} - ${v.format}` : product.name),
                  image: v.image || product.image,
                  sku: v.sku || product.sku,
                  price: v.price,
                  unitCostNeto: v.unitCostNeto,
                  weight: v.format,
                  selectedWeight: v.format,
                  stock: typeof v.stock === 'number' ? v.stock : 10,
                };
                onAddToCart(itemToAdd, v.format);
              });
            } else {
              const itemToAdd = activeVariant
                ? {
                    ...product,
                    id: activeVariant.id || product.id,
                    sku: activeVariant.sku || product.sku,
                    price: activeVariant.price,
                    unitCostNeto: activeVariant.unitCostNeto,
                    weight: activeVariant.format,
                    selectedWeight: activeVariant.format,
                    stock: typeof activeVariant.stock === 'number' ? activeVariant.stock : (typeof product.stock === 'number' ? product.stock : 10),
                  }
                : product;
              onAddToCart(itemToAdd, activeVariant?.format || (product.weights && product.weights[0]));
            }
          }}
          className={`relative min-w-[44px] min-h-[44px] w-11 h-11 rounded-full flex items-center justify-center transition-all shadow-md cursor-pointer ${
            isAddToCartDisabled
              ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
              : 'bg-[#0E8388] text-white hover:bg-[#0A3E40] hover:scale-105 active:scale-95'
          }`}
          title={
            isSelectionEmpty
              ? 'Selecciona al menos un sabor'
              : isAllSelectedOutOfStock
              ? 'Agotado'
              : isFlavorFamily && selectedVariants.length > 1
              ? `Agregar ${selectedVariants.length} latas al carrito`
              : 'Agregar al Carrito'
          }
          aria-label={`Agregar ${product.name} al carrito`}
        >
          <ShoppingBag className="w-4 h-4" />
          {isFlavorFamily && selectedVariants.length > 1 && (
            <span className="absolute -top-1 -right-1 bg-amber-400 text-slate-900 text-[10px] font-black w-4.5 h-4.5 rounded-full border-2 border-white flex items-center justify-center shadow-xs">
              {selectedVariants.length}
            </span>
          )}
        </button>
      </div>

    </div>
  );
}
