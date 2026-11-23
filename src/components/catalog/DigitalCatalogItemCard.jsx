import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Minus, Trash2, Sparkles, Stethoscope } from 'lucide-react';
import {
  getDefaultAvailableVariantIndex,
  getFlavorSwatchStyle,
  resolveProductImage,
} from '../../utils/productVariants';
import { formatCLP } from '../../utils/formatters';

/**
 * Tarjeta vertical compacta de producto para el Catálogo Digital Express (/catalogo).
 * Optimizada para selección con una mano en WebViews de Instagram y WhatsApp.
 */
export default function DigitalCatalogItemCard({
  product,
  cartItems = [],
  onAddToCart,
  onUpdateQuantity,
  onRemoveItem,
  onSelectProduct,
}) {
  const hasUserSelectedRef = useRef(false);
  const lastProductIdRef = useRef(product?.id);
  const variants = useMemo(() => product?.variants || [], [product?.variants]);
  const hasVariants = variants.length > 1;
  const isFlavorFamily = Boolean(product?.hasFlavorVariants);
  const defaultAvailableIdx = getDefaultAvailableVariantIndex(variants);
  const variantAvailabilitySignature = variants
    .map((v) => `${v?.id ?? ''}:${v?.stock ?? ''}:${v?.isPaused ? 1 : 0}`)
    .join('|');

  // Seleccionar por defecto la primera variante con stock disponible (si existe)
  const [selectedVariantIdx, setSelectedVariantIdx] = useState(() => defaultAvailableIdx);

  useEffect(() => {
    const productChanged = lastProductIdRef.current !== product?.id;
    if (productChanged) {
      lastProductIdRef.current = product?.id;
      hasUserSelectedRef.current = false;
    }
    if (productChanged || !hasUserSelectedRef.current) {
      setSelectedVariantIdx(defaultAvailableIdx);
    }
  }, [product?.id, variantAvailabilitySignature, defaultAvailableIdx]);

  const handleSelectVariant = (idx) => {
    hasUserSelectedRef.current = true;
    setSelectedVariantIdx(idx);
  };

  const safeIdx = selectedVariantIdx < variants.length ? selectedVariantIdx : defaultAvailableIdx;
  const activeVariant = variants[safeIdx] || variants[0] || null;

  const selectedFormat =
    activeVariant?.format ||
    activeVariant?.weight ||
    (Array.isArray(product?.weights) && product.weights[0]) ||
    product?.format ||
    'Estándar';

  const resolvedVariantId = activeVariant?.id || product?.productId || product?.id;
  const unitPrice = Number(activeVariant?.price ?? product?.price ?? 0);
  const originalPrice = activeVariant?.originalPrice || product?.originalPrice || null;

  const activeStock =
    activeVariant && typeof activeVariant.stock === 'number'
      ? activeVariant.stock
      : typeof product?.stock === 'number'
        ? product.stock
        : 10;

  const isOutOfStock =
    activeStock <= 0 ||
    Boolean(activeVariant?.isPaused || product?.isPaused || product?.isOutOfStock);

  const isAllVariantsOutOfStock = useMemo(() => {
    if (variants.length > 0) {
      return variants.every((v) => (typeof v.stock === 'number' ? v.stock : 10) <= 0 || Boolean(v.isPaused));
    }
    return isOutOfStock;
  }, [variants, isOutOfStock]);

  // Buscar si esta variante específica ya está en el carrito
  const cartMatchIndex = useMemo(() => {
    return cartItems.findIndex(
      (item) =>
        (item.id === resolvedVariantId || item.productId === resolvedVariantId) &&
        (item.weight === selectedFormat || item.selectedWeight === selectedFormat || !selectedFormat)
    );
  }, [cartItems, resolvedVariantId, selectedFormat]);

  const inCartItem = cartMatchIndex >= 0 ? cartItems[cartMatchIndex] : null;
  const inCartQty = inCartItem?.quantity || 0;

  // Total acumulado en carrito entre todas las variantes de este mismo producto (útil cuando hay varios pesos/sabores)
  const totalProductInCart = useMemo(() => {
    if (!variants.length) return inCartQty;
    const variantIds = new Set(variants.map((v) => v.id));
    return cartItems.reduce((sum, item) => {
      if (variantIds.has(item.id) || variantIds.has(item.productId)) {
        return sum + (item.quantity || 1);
      }
      return sum;
    }, 0);
  }, [cartItems, variants, inCartQty]);

  const resolvedImg = resolveProductImage(activeVariant || product);

  const handleQuickAdd = (e) => {
    e.stopPropagation();
    if (isOutOfStock) return;

    const itemToAdd = activeVariant
      ? {
          ...product,
          id: activeVariant.id || product.id,
          productId: activeVariant.id || product.id,
          name: isFlavorFamily
            ? activeVariant.name || (activeVariant.format ? `${product.name} - ${activeVariant.format}` : product.name)
            : product.name,
          image: activeVariant.image || product.image,
          sku: activeVariant.sku || product.sku,
          price: activeVariant.price,
          unitCostNeto: activeVariant.unitCostNeto,
          shippingUnitCost: activeVariant.shippingUnitCost || product.shippingUnitCost || 0,
          format: selectedFormat,
          weight: selectedFormat,
          selectedWeight: selectedFormat,
          stock: activeStock,
        }
      : {
          ...product,
          price: unitPrice,
          format: selectedFormat,
          weight: selectedFormat,
          selectedWeight: selectedFormat,
          stock: activeStock,
        };

    onAddToCart(itemToAdd, selectedFormat, 1, { openDrawer: false });
  };

  const handleIncrement = (e) => {
    e.stopPropagation();
    if (cartMatchIndex < 0 || inCartQty >= activeStock) return;
    onUpdateQuantity(cartMatchIndex, inCartQty + 1);
  };

  const handleDecrement = (e) => {
    e.stopPropagation();
    if (cartMatchIndex < 0) return;
    if (inCartQty <= 1) {
      onRemoveItem(cartMatchIndex);
    } else {
      onUpdateQuantity(cartMatchIndex, inCartQty - 1);
    }
  };

  const handleOpenQuickView = () => {
    if (onSelectProduct) {
      onSelectProduct(product);
    }
  };

  return (
    <article
      className={`relative rounded-2xl bg-white border transition-all p-3 flex items-stretch gap-3 shadow-[0_2px_10px_-4px_rgba(29,29,31,0.08)] ${
        isAllVariantsOutOfStock
          ? 'border-slate-200/90 opacity-70 bg-slate-50/70'
          : inCartQty > 0
            ? 'border-[#F5BA13] ring-1 ring-[#F5BA13]/35'
            : 'border-[#1D1D1F]/10 hover:border-[#F5BA13]/60'
      }`}
    >
      {/* Miniatura clickeable (abre vista rápida) */}
      <button
        type="button"
        onClick={handleOpenQuickView}
        className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-xl bg-[#FAF8F4] border border-[#1D1D1F]/8 overflow-hidden shrink-0 flex items-center justify-center p-1.5 cursor-pointer group active:scale-95 transition-transform"
        aria-label={`Ver detalle de ${product.name}`}
      >
        <img
          src={resolvedImg}
          alt={product.name}
          loading="lazy"
          decoding="async"
          width="112"
          height="112"
          className={`w-full h-full object-contain group-hover:scale-105 transition-transform duration-300 ${
            isOutOfStock ? 'grayscale opacity-45' : ''
          }`}
        />

        {/* Badge superior sobre foto */}
        {isAllVariantsOutOfStock ? (
          <span className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded-full bg-rose-600 text-white text-[9.5px] font-black uppercase tracking-wide shadow-xs">
            Agotado
          </span>
        ) : product.isVeterinary ? (
          <span className="absolute top-1.5 left-1.5 inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-[#1D1D1F]/90 text-[#F5BA13] text-[9px] font-black shadow-xs">
            <Stethoscope className="w-2.5 h-2.5" />
            <span>Vet</span>
          </span>
        ) : totalProductInCart > 0 ? (
          <span className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded-full bg-[#1D1D1F] text-[#F5BA13] text-[10px] font-black shadow-xs">
            {totalProductInCart} en carro
          </span>
        ) : null}
      </button>

      {/* Información + Variantes + Precio y Acción */}
      <div className="flex-1 min-w-0 flex flex-col justify-between gap-2">
        <div className="space-y-1">
          {/* Eyebrow: Marca + Stock alerta */}
          <div className="flex items-center justify-between gap-1.5">
            <span className="text-[10px] font-black uppercase tracking-wider text-[#D97706] truncate">
              {product.brand || product.category || 'Patitas del Sur'}
            </span>

            {!isOutOfStock && activeStock <= 3 ? (
              <span className="text-[9.5px] font-black px-1.5 py-0.5 rounded-md bg-[#FEF3C7] text-[#92400E] border border-[#F5BA13]/40 shrink-0">
                {activeStock === 1 ? '¡Última u.!' : `Quedan ${activeStock}`}
              </span>
            ) : isOutOfStock && !isAllVariantsOutOfStock ? (
              <span className="text-[9.5px] font-bold px-1.5 py-0.5 rounded-md bg-rose-50 text-rose-700 border border-rose-200 shrink-0">
                Formato agotado
              </span>
            ) : null}
          </div>

          {/* Título clickeable con enlace rastreable a la ficha canónica */}
          <Link
            to={`/producto/${product.id}`}
            onClick={(e) => {
              if (onSelectProduct && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey) {
                e.preventDefault();
                handleOpenQuickView();
              }
            }}
            className="text-left block w-full cursor-pointer"
          >
            <h3 className="text-[13.5px] sm:text-sm font-extrabold text-[#1D1D1F] leading-snug line-clamp-2 hover:text-[#B45309] transition-colors">
              {product.name}
            </h3>
          </Link>

          {/* Selector rápido de variantes (pesos o sabores) */}
          {hasVariants ? (
            isFlavorFamily ? (
              <div className="pt-0.5 space-y-1">
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
                  {variants.map((v, idx) => {
                    const isSel = safeIdx === idx;
                    const vOut = (typeof v.stock === 'number' ? v.stock : 10) <= 0 || Boolean(v.isPaused);
                    const swatch = getFlavorSwatchStyle(v.format);

                    return (
                      <button
                        key={v.id || idx}
                        type="button"
                        onClick={() => handleSelectVariant(idx)}
                        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10.5px] font-bold border transition-all shrink-0 cursor-pointer active:scale-95 ${
                          isSel
                            ? 'bg-[#1D1D1F] text-[#F5BA13] border-[#1D1D1F]'
                            : vOut
                              ? 'bg-slate-100 text-slate-400 border-slate-200 line-through opacity-70'
                              : 'bg-[#FAF8F4] text-[#1D1D1F] border-[#1D1D1F]/12 hover:border-[#F5BA13]'
                        }`}
                      >
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0 border border-white/60"
                          style={{ backgroundColor: swatch.primaryColor }}
                        />
                        <span>{v.format}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                {variants.map((v, idx) => {
                  const isSel = safeIdx === idx;
                  const vOut = (typeof v.stock === 'number' ? v.stock : 10) <= 0 || Boolean(v.isPaused);
                  return (
                    <button
                      key={v.id || idx}
                      type="button"
                      onClick={() => handleSelectVariant(idx)}
                      className={`px-2.5 py-0.5 rounded-full text-[10.5px] font-extrabold border transition-all cursor-pointer active:scale-95 ${
                        isSel
                          ? 'bg-[#1D1D1F] text-[#F5BA13] border-[#1D1D1F] shadow-2xs'
                          : vOut
                            ? 'bg-slate-100 text-slate-400 border-slate-200 line-through opacity-70'
                            : 'bg-[#FAF8F4] text-[#78350F] border-[#F5BA13]/45 hover:bg-[#FEF3C7]'
                      }`}
                    >
                      {v.format}
                    </button>
                  );
                })}
              </div>
            )
          ) : (
            selectedFormat &&
            selectedFormat !== 'Estándar' && (
              <div className="pt-0.5">
                <span className="inline-block px-2 py-0.5 rounded-full bg-[#FAF8F4] border border-[#1D1D1F]/10 text-[10.5px] font-bold text-slate-600">
                  {selectedFormat}
                </span>
              </div>
            )
          )}
        </div>

        {/* Fila inferior: Precio + Acción (+ Agregar o Stepper - N +) */}
        <div className="flex items-end justify-between gap-2 pt-1.5 border-t border-[#1D1D1F]/6">
          <div className="min-w-0">
            {originalPrice && Number(originalPrice) > unitPrice && (
              <span className="block text-[10.5px] text-slate-400 line-through font-semibold leading-none mb-0.5">
                {formatCLP(originalPrice)}
              </span>
            )}
            <div className="text-base sm:text-lg font-black text-[#1D1D1F] leading-none tracking-tight tabular-nums">
              {formatCLP(unitPrice)}
            </div>
            {!isOutOfStock && unitPrice >= 1000 && (
              <span className="inline-flex items-center gap-0.5 text-[9.5px] font-bold text-[#B45309] mt-0.5">
                <Sparkles className="w-2.5 h-2.5" />
                <span>+{Math.floor(unitPrice / 1000)} pts</span>
              </span>
            )}
          </div>

          {/* Botón o Stepper en línea */}
          {isOutOfStock ? (
            <span className="px-3 py-2 rounded-xl bg-slate-100 text-slate-400 border border-slate-200 text-xs font-extrabold select-none">
              Agotado
            </span>
          ) : inCartQty > 0 ? (
            <div className="inline-flex items-center bg-[#FEF3C7] border border-[#F5BA13] rounded-xl p-0.5 shadow-2xs shrink-0">
              <button
                type="button"
                onClick={handleDecrement}
                className="w-8 h-8 rounded-lg bg-white hover:bg-[#FAF8F4] text-[#1D1D1F] flex items-center justify-center active:scale-90 transition-transform cursor-pointer"
                aria-label={inCartQty <= 1 ? 'Quitar del carrito' : 'Disminuir cantidad'}
              >
                {inCartQty <= 1 ? (
                  <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                ) : (
                  <Minus className="w-3.5 h-3.5 stroke-[2.8]" />
                )}
              </button>
              <span className="min-w-[26px] text-center text-xs font-black text-[#1D1D1F] tabular-nums">
                {inCartQty}
              </span>
              <button
                type="button"
                disabled={inCartQty >= activeStock}
                onClick={handleIncrement}
                className="w-8 h-8 rounded-lg bg-[#1D1D1F] text-[#F5BA13] hover:bg-black flex items-center justify-center active:scale-90 transition-transform cursor-pointer disabled:opacity-35 disabled:cursor-not-allowed"
                aria-label="Aumentar cantidad"
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.8]" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleQuickAdd}
              className="inline-flex items-center justify-center gap-1.5 min-h-[38px] px-3.5 py-2 rounded-xl bg-[#1D1D1F] hover:bg-black text-white hover:text-[#F5BA13] text-xs font-black shadow-sm active:scale-95 transition-all cursor-pointer shrink-0"
              aria-label={`Agregar ${product.name} al carrito`}
            >
              <Plus className="w-3.5 h-3.5 text-[#F5BA13] stroke-[3]" />
              <span>Agregar</span>
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
