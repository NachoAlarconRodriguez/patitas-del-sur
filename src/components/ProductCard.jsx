import React, { useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShoppingBag, Stethoscope, Check } from 'lucide-react';
import { getFlavorSwatchStyle, resolveProductImage } from '../utils/productVariants';
import { formatCLP } from '../utils/formatters';

export default function ProductCard({ product, onSelectProduct: _onSelectProduct, onAddToCart }) {
  const navigate = useNavigate();
  const cardRef = useRef(null);

  const variants = product.variants || [];
  const hasVariants = variants.length > 1;
  const isFlavorFamily = Boolean(product.hasFlavorVariants);

  // Multi-selección para familias de sabores (array de índices)
  const [selectedVariantIndices, setSelectedVariantIndices] = React.useState([0]);
  // Selección simple para formatos estándar de peso
  const [selectedVariantIdx, setSelectedVariantIdx] = React.useState(0);
  const [hoveredVariantIdx, setHoveredVariantIdx] = React.useState(null);
  const [lastInteractedIdx, setLastInteractedIdx] = React.useState(null);
  const [justAdded, setJustAdded] = React.useState(false);

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
    (lastInteractedIdx !== null && selectedVariantIndices.includes(lastInteractedIdx) && variants[lastInteractedIdx]) ||
    selectedVariants[0] ||
    (hasVariants ? variants[0] : null);

  const displayVariant =
    hasVariants && hoveredVariantIdx !== null && variants[hoveredVariantIdx]
      ? variants[hoveredVariantIdx]
      : activeVariant;

  const unitPrice = activeVariant ? activeVariant.price : product.price || 0;
  const totalPrice = isFlavorFamily
    ? selectedVariants.length > 0
      ? selectedVariants.reduce((sum, v) => sum + (v.price || 0), 0)
      : product.price || 0
    : activeVariant
    ? activeVariant.price
    : product.price || 0;

  const currentOriginalPrice = activeVariant ? activeVariant.originalPrice : product.originalPrice;
  const totalOriginalPrice = currentOriginalPrice
    ? currentOriginalPrice * (isFlavorFamily ? Math.max(1, selectedVariants.length) : 1)
    : null;

  const isSelectionEmpty = isFlavorFamily && selectedVariants.length === 0;
  const isAllSelectedOutOfStock = isFlavorFamily
    ? selectedVariants.length > 0 && selectedVariants.every((v) => v.stock <= 0 || v.isPaused)
    : activeVariant
    ? activeVariant.stock <= 0 || activeVariant.isPaused
    : product.stock <= 0 || product.isOutOfStock;

  const isAddToCartDisabled = isSelectionEmpty || isAllSelectedOutOfStock;

  const isDog = product.petType === 'perros';
  const isGrainFree =
    product.badge?.toLowerCase().includes('grain') ||
    product.tagline?.toLowerCase().includes('grain') ||
    product.brand?.toLowerCase().includes('bravery') ||
    product.brand?.toLowerCase().includes('acana') ||
    product.brand?.toLowerCase().includes('orijen') ||
    product.brand?.toLowerCase().includes('taste') ||
    product.ingredients?.some((i) => i.toLowerCase().includes('grain free'));

  // Puntos Club Patitas (1 punto por cada $1.000 CLP)
  const clubPoints = Math.max(1, Math.floor((totalPrice || 0) / 1000));

  // Ingredientes destacados para las píldoras flotantes (máx. 3)
  const topIngredients = React.useMemo(() => {
    if (Array.isArray(product.ingredients) && product.ingredients.length > 0) {
      return product.ingredients
        .slice(0, 3)
        .map((ing) => String(ing).replace(/\s*\(.*?\)\s*/g, '').trim())
        .filter(Boolean);
    }
    if (product.mainProtein) {
      return [product.mainProtein, isGrainFree ? '100% Grain Free' : 'Receta Natural'];
    }
    return isGrainFree ? ['Proteína Animal', 'Libre de Granos'] : ['Nutrición Completa'];
  }, [product.ingredients, product.mainProtein, isGrainFree]);

  // 3D Physical Perspective Tilt (60fps via CSS variables)
  const handleMouseMove = (e) => {
    const el = cardRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    const rx = ((0.5 - y) * 7).toFixed(2);
    const ry = ((x - 0.5) * 8).toFixed(2);
    el.style.setProperty('--rx', `${rx}deg`);
    el.style.setProperty('--ry', `${ry}deg`);
    el.style.setProperty('--ty', '-6px');
  };

  const handleMouseLeave = () => {
    const el = cardRef.current;
    if (!el) return;
    el.style.setProperty('--rx', '0deg');
    el.style.setProperty('--ry', '0deg');
    el.style.setProperty('--ty', '0px');
  };

  const handleCardClick = (e) => {
    if (e.target.closest('button')) {
      return;
    }
    const targetId = activeVariant?.id || product.id;
    navigate(`/producto/${targetId}`);
  };

  const resolvedImg = resolveProductImage(displayVariant || activeVariant || product);

  return (
    <div
      ref={cardRef}
      onClick={handleCardClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transform:
          'perspective(950px) rotateX(var(--rx, 0deg)) rotateY(var(--ry, 0deg)) translateY(var(--ty, 0px))',
        transition: 'transform 0.45s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.45s cubic-bezier(0.22, 1, 0.36, 1)',
      }}
      className="group relative bg-white rounded-[30px] shadow-[0_18px_40px_-20px_rgba(29,29,31,0.22)] hover:shadow-[0_32px_64px_-22px_rgba(29,29,31,0.34)] border border-[#1D1D1F]/10 flex flex-col justify-between overflow-hidden cursor-pointer"
    >
      {/* =====================================================================
          1. FULL-BLEED IMMERSIVE TOP STAGE (Sin recuadro interno aburrido)
         ===================================================================== */}
      <Link
        to={`/producto/${activeVariant?.id || product.id}`}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full aspect-[4/3.65] overflow-hidden bg-[#2D1F0E] block select-none"
        aria-label={`Ver detalles de ${product.name}`}
      >
        {/* Ambient Blurred Backdrop (llena el fondo con los colores propios del saco/escena) */}
        <img
          src={resolvedImg}
          alt=""
          aria-hidden="true"
          loading="lazy"
          decoding="async"
          className="absolute inset-0 w-full h-full object-cover scale-125 blur-xl opacity-55 brightness-90 pointer-events-none"
        />

        {/* Warm Editorial Vignette Overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(circle at 50% 42%, rgba(254, 243, 199, 0.18) 0%, rgba(29, 29, 31, 0.38) 100%)',
          }}
        />

        {/* Main Full-Bleed Product Image */}
        <img
          src={resolvedImg}
          alt={`${product.name} - Alimento para ${isDog ? 'perros' : 'gatos'} en Puerto Varas, Patitas del Sur`}
          loading="lazy"
          decoding="async"
          className={`relative z-[1] w-full h-full object-cover group-hover:scale-108 transition-transform duration-700 ease-out ${
            isAllSelectedOutOfStock ? 'opacity-40 grayscale' : ''
          }`}
        />

        {/* Bottom Gradient Scrim for Floating Ingredient Pills */}
        <div
          className="absolute inset-x-0 bottom-0 h-28 z-[2] pointer-events-none"
          style={{
            background: 'linear-gradient(180deg, rgba(29,29,31,0) 0%, rgba(29,29,31,0.72) 100%)',
          }}
        />

        {/* Top-Left Floating Badges: Brand + Benefit/Status */}
        <div className="absolute top-3.5 left-3.5 z-10 flex flex-wrap items-center gap-1.5 max-w-[72%]">
          {product.brand && (
            <span className="px-3 py-1 rounded-full bg-[#1D1D1F]/80 backdrop-blur-md text-[#F5BA13] text-[10.5px] font-extrabold uppercase tracking-wider border border-white/15 shadow-sm">
              {product.brand}
            </span>
          )}
          {isAllSelectedOutOfStock ? (
            <span className="flex items-center gap-1.5 bg-rose-600/95 text-white backdrop-blur-md px-2.5 py-1 rounded-full text-[10.5px] font-black shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              <span>Agotado</span>
            </span>
          ) : product.isVeterinary ? (
            <span className="flex items-center gap-1 bg-teal-900/90 text-white backdrop-blur-md px-2.5 py-1 rounded-full text-[10.5px] font-black shadow-sm border border-teal-400/30">
              <Stethoscope className="w-3 h-3 text-teal-300" />
              <span>Receta Vet</span>
            </span>
          ) : product.proteinValue ? (
            <span className="px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-md text-[#1D1D1F] text-[10.5px] font-extrabold shadow-sm">
              🥩 {product.proteinValue}% Proteína
            </span>
          ) : isGrainFree ? (
            <span className="px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-md text-[#1D1D1F] text-[10.5px] font-extrabold shadow-sm">
              🌾 Grain Free
            </span>
          ) : null}
        </div>

        {/* Top-Right Floating Kibory Rotating Arrow Button */}
        <div className="absolute top-3.5 right-3.5 z-10 flex items-center gap-1.5">
          <span
            className="w-8 h-8 rounded-full bg-[#F5BA13] text-[#1D1D1F] group-hover:bg-white group-hover:rotate-45 transition-all duration-300 flex items-center justify-center font-black text-sm shadow-md"
            aria-hidden="true"
          >
            ↗
          </span>
        </div>

        {/* Bottom Floating Ingredient Chips + Handwritten Note */}
        <div className="absolute inset-x-3.5 bottom-6 z-10 flex items-end justify-between gap-2 pointer-events-none">
          <div className="flex flex-wrap gap-1">
            {topIngredients.map((ing, i) => (
              <span
                key={i}
                className="px-2.5 py-0.5 rounded-full bg-white/90 backdrop-blur-md text-[#1D1D1F] text-[10px] font-extrabold shadow-xs border border-white/40"
              >
                {ing}
              </span>
            ))}
          </div>

          <span
            className="text-[#FDE68A] text-base leading-none shrink-0 drop-shadow-[0_2px_4px_rgba(0,0,0,0.65)] -rotate-6 hidden sm:inline-block"
            style={{ fontFamily: 'var(--font-hand)' }}
          >
            {isDog ? '¡favorito de Kira!' : '¡aprobado por Jack!'}
          </span>
        </div>
      </Link>

      {/* =====================================================================
          2. OVERLAPPING CURVED EDITORIAL SHEET
         ===================================================================== */}
      <div className="relative z-10 -mt-4 bg-white rounded-t-[24px] p-4 sm:p-5 flex flex-col flex-grow justify-between space-y-3 shadow-[0_-8px_24px_-12px_rgba(29,29,31,0.18)]">
        <div className="space-y-2">
          {/* Product Title */}
          <h3
            className="font-extrabold text-lg sm:text-[19px] text-[#1D1D1F] line-clamp-2 leading-tight"
            style={{ fontFamily: 'var(--font-display)', letterSpacing: '-0.03em' }}
          >
            <Link
              to={`/producto/${activeVariant?.id || product.id}`}
              onClick={(e) => e.stopPropagation()}
              className="group-hover:text-[#B45309] transition-colors"
            >
              {product.name}
            </Link>
          </h3>

          {/* Club Patitas Loyalty Points Pill */}
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#FEF3C7]/85 border border-[#F5BA13]/45 text-[11px] font-extrabold text-[#78350F] w-fit">
            <svg className="w-3.5 h-3.5 text-[#D97706] fill-current shrink-0" viewBox="0 0 24 24" aria-hidden="true">
              <ellipse cx="12" cy="16.2" rx="5.2" ry="4.4" />
              <ellipse cx="5.4" cy="10.4" rx="2.1" ry="2.6" transform="rotate(-20 5.4 10.4)" />
              <ellipse cx="9.5" cy="6.3" rx="2.2" ry="2.8" transform="rotate(-8 9.5 6.3)" />
              <ellipse cx="14.5" cy="6.3" rx="2.2" ry="2.8" transform="rotate(8 14.5 6.3)" />
              <ellipse cx="18.6" cy="10.4" rx="2.1" ry="2.6" transform="rotate(20 18.6 10.4)" />
            </svg>
            <span>Suma +{clubPoints} pts Club Patitas</span>
          </div>

          {/* Weights / Formats Selector */}
          {hasVariants ? (
            <div className="pt-1 space-y-1.5">
              {isFlavorFamily ? (
                /* Flavor Swatches */
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
                      <span
                        className={`text-[10px] font-bold shrink-0 ${
                          displayVariant?.stock <= 0
                            ? 'text-rose-500'
                            : displayVariant?.stock === 1
                            ? 'text-amber-600'
                            : 'text-amber-700'
                        }`}
                      >
                        {displayVariant?.stock <= 0
                          ? 'Agotado'
                          : displayVariant?.stock === 1
                          ? '¡Última unidad!'
                          : `${displayVariant?.stock} disp.`}
                      </span>
                    ) : selectedVariants.length > 1 ? (
                      <span className="text-[10px] font-bold text-[#78350F] shrink-0 bg-amber-100 px-2 py-0.5 rounded-full">
                        {selectedVariants.length} seleccionados
                      </span>
                    ) : selectedVariants.length === 1 ? (
                      <span
                        className={`text-[10px] font-bold shrink-0 ${
                          selectedVariants[0]?.stock <= 0
                            ? 'text-rose-500'
                            : selectedVariants[0]?.stock === 1
                            ? 'text-amber-600'
                            : 'text-amber-700'
                        }`}
                      >
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
                          <span
                            className={`w-full h-full rounded-full flex items-center justify-center transition-all duration-200 bg-white ${
                              isHovered && !isSelected ? 'shadow-xs' : ''
                            }`}
                            style={{
                              border: `2px solid ${swatch.primaryColor}`,
                              padding: isSelected ? '3px' : '0px',
                            }}
                          >
                            {isSelected && (
                              <span
                                className="w-full h-full rounded-full block animate-in zoom-in-50 duration-150"
                                style={{ backgroundColor: swatch.primaryColor }}
                              />
                            )}
                          </span>

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
                /* Standard Weights (e.g. 2 kg, 6 kg, 11.35 kg) — Kibory .tag Pill Style */
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    <span>Formato:</span>
                    {activeVariant && (
                      <span
                        className={
                          activeVariant.stock <= 0 ? 'text-rose-500 font-bold' : 'text-[#B45309] font-extrabold'
                        }
                      >
                        {activeVariant.stock <= 0
                          ? 'Agotado'
                          : activeVariant.stock === 1
                          ? '¡Última unidad!'
                          : `${activeVariant.stock} en stock`}
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
                          className={`text-xs font-bold px-3 py-1 rounded-full transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-[#1D1D1F] text-[#F5BA13] font-extrabold shadow-xs scale-105 ring-2 ring-[#F5BA13]/50'
                              : vOutOfStock
                              ? 'bg-slate-100 text-slate-300 line-through cursor-not-allowed border border-slate-200/50'
                              : 'bg-[#FAF8F4] hover:bg-[#FEF3C7] text-[#B45309] shadow-[inset_0_0_0_1.5px_#F5BA13]'
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
            product.weights &&
            product.weights.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {product.weights.map((w, idx) => (
                  <span
                    key={idx}
                    className="text-xs font-extrabold px-3 py-1 rounded-full bg-[#1D1D1F] text-[#F5BA13]"
                  >
                    {w}
                  </span>
                ))}
              </div>
            )
          )}
        </div>

        {/* Footer: Monumental Price & .btn--ink Add to Cart */}
        <div className="pt-3 border-t border-[#1D1D1F]/8 flex items-center justify-between gap-2">
          <div>
            {isFlavorFamily && selectedVariants.length > 1 ? (
              <span className="text-[10px] font-bold text-slate-400 block leading-none mb-0.5">
                {selectedVariants.length} unid. • {formatCLP(unitPrice)} c/u
              </span>
            ) : (
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block leading-none mb-0.5">
                Precio Online
              </span>
            )}
            <div
              className="text-2xl font-black text-[#1D1D1F] leading-none"
              style={{ fontFamily: 'var(--font-display)', letterSpacing: '-0.035em' }}
            >
              {formatCLP(totalPrice)}
            </div>
            {totalOriginalPrice && (
              <div className="text-[11px] text-slate-400 line-through font-semibold mt-0.5">
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

              setJustAdded(true);
              setTimeout(() => setJustAdded(false), 1600);

              if (isFlavorFamily && selectedVariants.length > 0) {
                selectedVariants.forEach((v) => {
                  const itemToAdd = {
                    ...product,
                    id: v.id || product.id,
                    productId: v.id || product.id,
                    name: v.name || (v.format ? `${product.name} - ${v.format}` : product.name),
                    image: v.image || product.image,
                    sku: v.sku || product.sku,
                    price: v.price,
                    unitCostNeto: v.unitCostNeto,
                    shippingUnitCost: v.shippingUnitCost || product.shippingUnitCost || 0,
                    format: v.format,
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
                      productId: activeVariant.id || product.id,
                      sku: activeVariant.sku || product.sku,
                      price: activeVariant.price,
                      unitCostNeto: activeVariant.unitCostNeto,
                      shippingUnitCost: activeVariant.shippingUnitCost || product.shippingUnitCost || 0,
                      format: activeVariant.format,
                      weight: activeVariant.format,
                      selectedWeight: activeVariant.format,
                      stock:
                        typeof activeVariant.stock === 'number'
                          ? activeVariant.stock
                          : typeof product.stock === 'number'
                          ? product.stock
                          : 10,
                    }
                  : product;
                onAddToCart(itemToAdd, activeVariant?.format || (product.weights && product.weights[0]));
              }
            }}
            className={`group/btn inline-flex items-center justify-center gap-2.5 rounded-full font-bold text-xs transition-all cursor-pointer ${
              isAddToCartDisabled
                ? 'px-4 py-2.5 bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed shadow-none'
                : justAdded
                ? 'pl-4 pr-1.5 py-1.5 bg-[#F5BA13] text-[#1D1D1F] font-black shadow-md'
                : 'pl-4 pr-1.5 py-1.5 bg-[#1D1D1F] text-white hover:bg-black hover:shadow-lg active:scale-95'
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
            {justAdded ? (
              <>
                <span>¡Agregado!</span>
                <span className="w-8 h-8 rounded-full bg-[#1D1D1F] text-[#F5BA13] flex items-center justify-center shrink-0">
                  <Check className="w-4 h-4 stroke-[3]" />
                </span>
              </>
            ) : isAllSelectedOutOfStock ? (
              <span>Agotado</span>
            ) : isSelectionEmpty ? (
              <span>Elegir</span>
            ) : isFlavorFamily && selectedVariants.length > 1 ? (
              <>
                <span>Agregar ({selectedVariants.length})</span>
                <span className="w-8 h-8 rounded-full bg-[#F5BA13] text-[#1D1D1F] flex items-center justify-center shrink-0 transition-transform group-hover/btn:rotate-12">
                  <ShoppingBag className="w-4 h-4" />
                </span>
              </>
            ) : (
              <>
                <span>Agregar</span>
                <span className="w-8 h-8 rounded-full bg-[#F5BA13] text-[#1D1D1F] flex items-center justify-center shrink-0 transition-transform group-hover/btn:rotate-12">
                  <ShoppingBag className="w-4 h-4" />
                </span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
