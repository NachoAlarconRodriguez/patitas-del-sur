import React, { useState, useMemo, useEffect } from 'react';
import { Sparkles, ChevronLeft, ChevronRight, Plus, X } from 'lucide-react';
import { PRODUCTS } from '../../data/mockData';
import { isProductOutOfStock, resolveProductImage } from '../../utils/productVariants';
import { extractBrandAndCleanName } from './customerUtils';

/**
 * Carrusel Automático de Productos Destacados con transiciones suaves
 */
export default function FeaturedProductsCarousel({
  pet,
  currentProduct,
  catalogProducts,
  onAddToCart,
  onSelectProduct,
  setOrderToastMessage,
  formatCLP,
}) {
  const [featuredIndex, setFeaturedIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Computar productos destacados según especie de la mascota (excluyendo el alimento habitual actual)
  const featuredProducts = useMemo(() => {
    const source = catalogProducts && catalogProducts.length > 0 ? catalogProducts : PRODUCTS;
    const filtered = source.filter((p) => {
      const pPetType = (p.petType || p.pet_type || '').toLowerCase();
      const matchSpecies =
        pPetType.includes(pet?.type === 'gato' ? 'gato' : 'perro') ||
        pPetType === 'ambos' ||
        pPetType === 'todos';
      const isNotPaused = !p.isPaused && !p.is_paused && p.isActive !== false && p.is_active !== false;
      return matchSpecies && p.id !== currentProduct?.id && isNotPaused;
    });
    if (filtered.length < 4) {
      const fallback = source.filter((p) => p.id !== currentProduct?.id && !p.isPaused && !p.is_paused);
      return [...filtered, ...fallback].slice(0, 9);
    }
    return filtered.slice(0, 9);
  }, [pet?.type, currentProduct?.id, catalogProducts]);

  // Reiniciar slide al cambiar de mascota
  useEffect(() => {
    setFeaturedIndex(0);
  }, [pet?.id]);

  const maxIndex = Math.max(0, featuredProducts.length - 3);

  // Avance automático con temporizador y pausa al interactuar
  useEffect(() => {
    if (isPaused || maxIndex === 0) return;

    const timer = setInterval(() => {
      setFeaturedIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
    }, 3200);

    return () => clearInterval(timer);
  }, [isPaused, maxIndex]);

  if (!featuredProducts || featuredProducts.length === 0) return null;

  return (
    <div className="pt-2 space-y-2">
      {/* Header del Carrusel: Título, Indicadores de Slide y Controles */}
      <div className="flex items-center justify-between px-0.5">
        <div className="flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
          <span className="text-[11px] sm:text-xs font-black text-slate-800 tracking-tight">
            Destacados para {pet?.name ? pet.name.split(' ')[0] : 'tu regalón'}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Indicadores en forma de cápsula dinámica */}
          <div className="flex items-center gap-1 mr-0.5">
            {Array.from({ length: maxIndex + 1 }).map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setFeaturedIndex(idx)}
                className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                  featuredIndex === idx
                    ? 'w-3.5 bg-[#F5BA13]'
                    : 'w-1.5 bg-slate-200 hover:bg-slate-300'
                }`}
                aria-label={`Slide ${idx + 1}`}
              />
            ))}
          </div>

          {/* Botones de navegación táctil/click ergonómicos */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setFeaturedIndex((prev) => (prev <= 0 ? maxIndex : prev - 1))}
              className="w-7 h-7 rounded-xl bg-white border border-slate-200 hover:border-[#F5BA13] text-slate-600 hover:text-amber-900 flex items-center justify-center transition-all cursor-pointer active:scale-90 shadow-2xs"
              title="Producto anterior"
              aria-label="Producto anterior"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setFeaturedIndex((prev) => (prev >= maxIndex ? 0 : prev + 1))}
              className="w-7 h-7 rounded-xl bg-white border border-slate-200 hover:border-[#F5BA13] text-slate-600 hover:text-amber-900 flex items-center justify-center transition-all cursor-pointer active:scale-90 shadow-2xs"
              title="Siguiente producto"
              aria-label="Siguiente producto"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Viewport del carrusel: 3 cards lado a lado */}
      <div
        className="relative overflow-hidden w-full py-0.5 select-none"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => setIsPaused(false)}
      >
        <div
          className="smooth-carousel-track flex gap-2"
          style={{
            transform: `translateX(calc(-${featuredIndex} * ((100% + 8px) / 3)))`,
          }}
        >
          {featuredProducts.map((prod) => {
            const isOutOfStock = isProductOutOfStock(prod);
            return (
              <div
                key={prod.id}
                onClick={() => onSelectProduct && onSelectProduct(prod)}
                className={`w-[calc((100%-16px)/3)] shrink-0 bg-white border rounded-2xl p-2 sm:p-2.5 flex flex-col justify-between transition-all duration-300 group select-none ${
                  isOutOfStock
                    ? 'border-slate-200/60 opacity-80'
                    : 'border-slate-200/90 hover:border-[#F5BA13]/60 shadow-2xs hover:shadow-md cursor-pointer active:scale-[0.98]'
                }`}
              >
                {/* Tag / Badge */}
                <div className="flex items-center justify-between mb-1">
                  {isOutOfStock ? (
                    <span className="text-[9px] font-extrabold text-rose-700 bg-rose-50 border border-rose-200 px-1.5 py-0.5 rounded-md truncate max-w-full">
                      Agotado
                    </span>
                  ) : (
                    <span className="text-[9px] font-extrabold text-amber-900 bg-amber-50 border border-amber-200/70 px-1.5 py-0.5 rounded-md truncate max-w-full">
                      {prod.badge || prod.brand || 'Destacado'}
                    </span>
                  )}
                </div>

                {/* Imagen centrada */}
                <div className="w-full h-16 sm:h-18 rounded-xl bg-slate-50/80 p-1.5 flex items-center justify-center my-0.5 overflow-hidden">
                  <img
                    src={resolveProductImage(prod)}
                    alt={prod.name}
                    className={`max-h-full max-w-full object-contain duration-500 ease-out ${
                      isOutOfStock ? 'grayscale-[35%]' : 'group-hover:scale-105 transition-transform'
                    }`}
                    loading="lazy"
                  />
                </div>

                {/* Información y Compra Rápida */}
                <div className="mt-1 space-y-1">
                  <h4
                    className="text-[10.5px] sm:text-xs font-bold text-slate-800 line-clamp-1 leading-tight group-hover:text-amber-800 transition-colors"
                    title={prod.name}
                  >
                    {extractBrandAndCleanName(prod).cleanName}
                  </h4>

                  <div className="flex items-center justify-between pt-0.5">
                    <span className="text-[10px] sm:text-[11.5px] font-black text-slate-900 truncate">
                      {formatCLP(prod.price)}
                    </span>
                    <button
                      type="button"
                      disabled={isOutOfStock}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (isOutOfStock) return;
                        const weight = prod.weights?.[0] || '1 unidad';
                        onAddToCart(prod, weight, 1);
                        setOrderToastMessage(`✓ ${prod.name.split(' ')[0]} agregado al carrito`);
                      }}
                      className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all ${
                        isOutOfStock
                          ? 'bg-slate-100 text-slate-300 cursor-not-allowed shadow-none'
                          : 'bg-amber-50 hover:bg-[#F5BA13] text-amber-900 hover:text-[#1D1D1F] border border-amber-200/70 shadow-2xs active:scale-90 cursor-pointer'
                      }`}
                      title={isOutOfStock ? 'Producto sin stock' : 'Agregar al carrito'}
                    >
                      {isOutOfStock ? <X className="w-3 h-3 text-slate-400" /> : <Plus className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
