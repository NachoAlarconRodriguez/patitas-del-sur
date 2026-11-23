import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Search,
  ScanBarcode,
  Plus,
  Volume2,
  VolumeX,
  Package,
  AlertTriangle,
  Link2,
  X,
  CornerDownLeft,
} from 'lucide-react';
import { formatCLP } from '../adminUtils.js';

function playPosBeep(type = 'ok') {
  if (typeof window === 'undefined') return;
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    if (type === 'error') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(240, ctx.currentTime);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      osc.start();
      osc.stop(ctx.currentTime + 0.16);
    } else {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1040, ctx.currentTime);
      gain.gain.setValueAtTime(0.06, ctx.currentTime);
      osc.start();
      osc.stop(ctx.currentTime + 0.08);
    }
  } catch {
    // ignore audio block
  }
}

/**
 * Barra de Escaneo USB + Buscador con Lista Desplegable Flotante (sin grilla fija).
 * - Pistola lectora USB: agrega al carrito al instante (con foco o mediante captura global de ráfagas).
 * - Al escribir nombre, marca, peso, SKU o código: muestra lista desplegable navegable con ↑/↓/Enter/Click.
 * - Si el código escaneado no existe, abre un modal compacto para vincularlo a un producto al vuelo.
 */
export default function PosProductScannerGrid({
  inventory = [],
  cartItems = [],
  disabled = false,
  disableGlobalScanner = false,
  onAddProduct,
  onAssignBarcodeToProduct,
  showToast,
}) {
  const [query, setQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [unknownBarcode, setUnknownBarcode] = useState(null);
  const [assignSearch, setAssignSearch] = useState('');
  const [isAssigning, setIsAssigning] = useState(false);

  const searchInputRef = useRef(null);
  const containerRef = useRef(null);
  const scanBufferRef = useRef('');
  const lastKeyTimeRef = useRef(0);

  const cartQtyById = useMemo(() => {
    const map = new Map();
    cartItems.forEach((it) => map.set(it.id, (map.get(it.id) || 0) + (it.quantity || 0)));
    return map;
  }, [cartItems]);

  const tryAddProduct = (prod) => {
    if (!prod || disabled) return false;
    const currentInCart = cartQtyById.get(prod.id) || 0;
    const availableStock = Number(prod.stock) || 0;
    if (availableStock <= 0 || currentInCart >= availableStock) {
      if (soundEnabled) playPosBeep('error');
      showToast?.(`Sin stock suficiente de ${prod.name} (Stock: ${availableStock}).`, 'error');
      return false;
    }
    onAddProduct?.(prod);
    if (soundEnabled) playPosBeep('ok');
    return true;
  };

  const handleBarcodeLookup = (rawCode) => {
    const clean = String(rawCode || '').trim();
    if (!clean || disabled) return false;
    const cleanLower = clean.toLowerCase();

    const exactMatch = inventory.find((p) => {
      const bc = String(p.barcode || '').trim().toLowerCase();
      const sku = String(p.sku || '').trim().toLowerCase();
      return (bc && bc === cleanLower) || (sku && sku === cleanLower);
    });

    if (exactMatch) {
      tryAddProduct(exactMatch);
      setUnknownBarcode(null);
      return true;
    }

    // Si parece un código de barras real (>= 6 caracteres alfanuméricos sin espacios) y no se encontró
    if (/^[A-Za-z0-9\-_]{6,}$/.test(clean)) {
      if (soundEnabled) playPosBeep('error');
      setUnknownBarcode(clean);
      setAssignSearch('');
      return true;
    }

    return false;
  };

  // Cerrar lista desplegable al hacer clic fuera
  useEffect(() => {
    const onMouseDown = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', onMouseDown);
    return () => document.removeEventListener('mousedown', onMouseDown);
  }, []);

  // Atajo F2 para enfocar buscador + captura global de pistola USB
  useEffect(() => {
    const onGlobalKeyDown = (e) => {
      if (e.key === 'F2') {
        e.preventDefault();
        searchInputRef.current?.focus();
        searchInputRef.current?.select();
        return;
      }

      if (disabled || disableGlobalScanner || unknownBarcode) return;

      const tag = String(e.target?.tagName || '').toLowerCase();
      const isEditingOtherField =
        (tag === 'input' || tag === 'textarea' || tag === 'select' || e.target?.isContentEditable) &&
        e.target !== searchInputRef.current;
      if (isEditingOtherField) return;
      if (e.target === searchInputRef.current) return;

      const now = Date.now();
      if (e.key === 'Enter') {
        const buffered = scanBufferRef.current.trim();
        scanBufferRef.current = '';
        if (buffered.length >= 4) {
          e.preventDefault();
          handleBarcodeLookup(buffered);
        }
        return;
      }

      if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
        if (now - lastKeyTimeRef.current > 80) {
          scanBufferRef.current = '';
        }
        scanBufferRef.current += e.key;
        lastKeyTimeRef.current = now;
      }
    };

    window.addEventListener('keydown', onGlobalKeyDown);
    return () => window.removeEventListener('keydown', onGlobalKeyDown);
  });

  // Resultados de la lista desplegable (solo cuando el usuario escribe)
  const dropdownResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    const tokens = q.split(/\s+/).filter(Boolean);
    return inventory
      .filter((p) => {
        const haystack = `${p.name || ''} ${p.brand || ''} ${p.format || ''} ${p.sku || ''} ${p.barcode || ''} ${p.category || ''}`.toLowerCase();
        return tokens.every((tok) => haystack.includes(tok));
      })
      .sort((a, b) => {
        // Priorizar productos con stock disponible sobre agotados
        const aStock = (Number(a.stock) || 0) - (cartQtyById.get(a.id) || 0) > 0 ? 1 : 0;
        const bStock = (Number(b.stock) || 0) - (cartQtyById.get(b.id) || 0) > 0 ? 1 : 0;
        if (aStock !== bStock) return bStock - aStock;
        return String(a.name || '').localeCompare(String(b.name || ''));
      })
      .slice(0, 15);
  }, [inventory, query, cartQtyById]);

  const safeHighlightedIndex =
    dropdownResults.length === 0 ? 0 : Math.min(highlightedIndex, dropdownResults.length - 1);

  const assignableProducts = useMemo(() => {
    const q = assignSearch.trim().toLowerCase();
    return inventory
      .filter((p) => {
        if (!q) return true;
        return (
          String(p.name || '').toLowerCase().includes(q) ||
          String(p.brand || '').toLowerCase().includes(q) ||
          String(p.format || '').toLowerCase().includes(q) ||
          String(p.sku || '').toLowerCase().includes(q)
        );
      })
      .slice(0, 12);
  }, [inventory, assignSearch]);

  const handleSelectFromDropdown = (prod) => {
    const ok = tryAddProduct(prod);
    if (ok) {
      setQuery('');
      setIsDropdownOpen(false);
      setHighlightedIndex(0);
      searchInputRef.current?.focus();
    }
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      setIsDropdownOpen(false);
      setQuery('');
      return;
    }

    if (e.key === 'ArrowDown') {
      if (dropdownResults.length > 0) {
        e.preventDefault();
        setIsDropdownOpen(true);
        setHighlightedIndex((prev) => (prev + 1) % dropdownResults.length);
      }
      return;
    }

    if (e.key === 'ArrowUp') {
      if (dropdownResults.length > 0) {
        e.preventDefault();
        setIsDropdownOpen(true);
        setHighlightedIndex((prev) => (prev - 1 + dropdownResults.length) % dropdownResults.length);
      }
      return;
    }

    if (e.key !== 'Enter') return;
    e.preventDefault();
    const clean = query.trim();
    if (!clean) return;

    // 1. Intentar match exacto por barcode/SKU (pistola USB)
    const matchedByCode = handleBarcodeLookup(clean);
    if (matchedByCode) {
      setQuery('');
      setIsDropdownOpen(false);
      setHighlightedIndex(0);
      return;
    }

    // 2. Si hay lista desplegable con resultados, agregar el ítem resaltado
    if (dropdownResults.length > 0) {
      const target = dropdownResults[safeHighlightedIndex] || dropdownResults[0];
      handleSelectFromDropdown(target);
    }
  };

  const showDropdown = isDropdownOpen && query.trim().length > 0 && !disabled;

  return (
    <div ref={containerRef} className="relative bg-white border border-[#EAECEF] rounded-3xl p-3.5 sm:px-4 shrink-0 shadow-2xs">
      <div className="flex items-center gap-2.5">
        <div className="relative flex-1">
          <ScanBarcode className="w-4 h-4 text-[#D97706] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            ref={searchInputRef}
            type="text"
            disabled={disabled}
            value={query}
            onFocus={() => {
              if (query.trim()) setIsDropdownOpen(true);
            }}
            onChange={(e) => {
              const nextVal = e.target.value;
              setQuery(nextVal);
              setHighlightedIndex(0);
              setIsDropdownOpen(nextVal.trim().length > 0);
            }}
            onKeyDown={handleSearchKeyDown}
            placeholder="Escanea código con pistola USB o escribe el nombre del producto para buscar... (F2)"
            className="w-full pl-10 pr-10 py-3 rounded-2xl bg-[#F8FAFC] border-2 border-[#EAECEF] focus:border-[#D97706] focus:bg-white text-sm font-semibold text-[#111827] placeholder:text-slate-400 focus:outline-none transition-all disabled:opacity-50"
          />
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                setIsDropdownOpen(false);
                searchInputRef.current?.focus();
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              aria-label="Limpiar búsqueda"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={() => setSoundEnabled((prev) => !prev)}
          className={`p-3 rounded-2xl border transition-colors cursor-pointer shrink-0 ${
            soundEnabled
              ? 'bg-[#FEF3C7]/60 border-[#FDE68A] text-[#D97706]'
              : 'bg-[#F8FAFC] border-[#EAECEF] text-slate-400'
          }`}
          title={soundEnabled ? 'Silenciar sonido de escaneo' : 'Activar sonido de escaneo'}
        >
          {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </button>
      </div>

      {/* LISTA DESPLEGABLE FLOTANTE DE PRODUCTOS AL ESCRIBIR */}
      {showDropdown && (
        <div className="absolute left-0 right-0 top-full mt-2 z-40 bg-white border border-[#EAECEF] rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150">
          {dropdownResults.length === 0 ? (
            <div className="p-5 text-center text-xs text-slate-400 flex flex-col items-center gap-1">
              <Search className="w-5 h-5 opacity-40" />
              <span className="font-bold text-slate-600">No se encontraron productos para &quot;{query.trim()}&quot;</span>
              <span className="text-[11px]">Prueba con otro nombre, marca, peso o escanea el código de barras.</span>
            </div>
          ) : (
            <>
              <div className="px-3.5 py-2 bg-[#F8FAFC] border-b border-[#EAECEF] flex items-center justify-between text-[10px] font-bold text-slate-500">
                <span>{dropdownResults.length} coincidencia(s) encontrada(s)</span>
                <span className="inline-flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 rounded bg-white border border-slate-200 font-mono">↑↓</kbd> navegar ·{' '}
                  <kbd className="px-1.5 py-0.5 rounded bg-white border border-slate-200 font-mono inline-flex items-center gap-0.5">
                    <CornerDownLeft className="w-2.5 h-2.5" /> Enter
                  </kbd>{' '}
                  agregar
                </span>
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                {dropdownResults.map((prod, idx) => {
                  const stock = Number(prod.stock) || 0;
                  const inCart = cartQtyById.get(prod.id) || 0;
                  const remaining = Math.max(0, stock - inCart);
                  const outOfStock = remaining <= 0;
                  const isHighlighted = idx === safeHighlightedIndex;
                  const price = Number(prod.salePrice ?? prod.price ?? 0);

                  return (
                    <button
                      key={prod.id}
                      type="button"
                      disabled={outOfStock}
                      onMouseEnter={() => setHighlightedIndex(idx)}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        handleSelectFromDropdown(prod);
                      }}
                      className={`w-full px-3.5 py-2.5 text-left flex items-center justify-between gap-3 transition-colors ${
                        outOfStock
                          ? 'bg-slate-50/80 opacity-55 cursor-not-allowed'
                          : isHighlighted
                            ? 'bg-[#FAF8F4] cursor-pointer'
                            : 'bg-white hover:bg-[#FAF8F4] cursor-pointer'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        {prod.image ? (
                          <img
                            src={prod.image}
                            alt={prod.name}
                            className="w-10 h-10 rounded-xl object-contain bg-[#F8FAFC] border border-[#EAECEF] p-1 shrink-0"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-xl bg-[#F8FAFC] border border-[#EAECEF] flex items-center justify-center text-slate-400 shrink-0">
                            <Package className="w-4 h-4" />
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-extrabold text-[#111827] truncate">{prod.name}</span>
                            <span className="px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-bold shrink-0">
                              {prod.format}
                            </span>
                            {inCart > 0 && (
                              <span className="px-1.5 py-0.5 rounded-full bg-[#D97706] text-white text-[10px] font-black shrink-0 tabular-nums">
                                En carrito: {inCart}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-0.5">
                            <span className="font-semibold">{prod.brand}</span>
                            {prod.barcode && (
                              <span className="font-mono text-[#92400E] bg-[#FEF3C7]/70 px-1.5 py-0.2 rounded">
                                {prod.barcode}
                              </span>
                            )}
                            <span
                              className={`font-extrabold tabular-nums ${
                                outOfStock
                                  ? 'text-rose-600'
                                  : remaining <= (prod.minStock || 5)
                                    ? 'text-amber-600'
                                    : 'text-emerald-700'
                              }`}
                            >
                              {outOfStock ? 'Agotado' : `Stock disp.: ${remaining}`}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2.5 shrink-0">
                        <span className="text-sm font-black text-[#111827] tabular-nums">{formatCLP(price)}</span>
                        {!outOfStock && (
                          <span
                            className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors ${
                              isHighlighted
                                ? 'bg-[#D97706] text-white'
                                : 'bg-[#FEF3C7] text-[#D97706]'
                            }`}
                          >
                            <Plus className="w-4 h-4 stroke-[2.5]" />
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>
      )}

      {/* MODAL COMPACTO PARA VINCULAR CÓDIGO DE BARRAS NO REGISTRADO */}
      {unknownBarcode && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setUnknownBarcode(null)}
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl max-w-lg w-full border border-amber-200 shadow-2xl p-5 space-y-3.5"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div className="text-xs">
                  <div className="font-black text-sm text-[#111827]">
                    Código no registrado:{' '}
                    <span className="font-mono bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200 text-amber-900">
                      {unknownBarcode}
                    </span>
                  </div>
                  <p className="text-slate-500 mt-0.5">
                    Vincúlalo ahora mismo a un producto del inventario y se agregará automáticamente a la venta:
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setUnknownBarcode(null)}
                className="p-1.5 rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                autoFocus
                value={assignSearch}
                onChange={(e) => setAssignSearch(e.target.value)}
                placeholder="Buscar producto para vincular este código..."
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-[#F8FAFC] border border-[#EAECEF] text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:border-[#D97706]"
              />
            </div>

            <div className="max-h-60 overflow-y-auto space-y-1.5 pr-1">
              {assignableProducts.map((prod) => (
                <div
                  key={prod.id}
                  className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-[#F8FAFC] border border-[#EAECEF] hover:border-[#D97706] transition-colors"
                >
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-slate-900 truncate">
                      {prod.name} <span className="text-slate-400 font-semibold">· {prod.format}</span>
                    </div>
                    <div className="text-[10px] text-slate-500">
                      Stock: {prod.stock} · {formatCLP(prod.salePrice || prod.price || 0)}
                      {prod.barcode ? ` · Actual: ${prod.barcode}` : ''}
                    </div>
                  </div>
                  <button
                    type="button"
                    disabled={isAssigning}
                    onClick={async () => {
                      setIsAssigning(true);
                      const ok = await onAssignBarcodeToProduct?.(prod, unknownBarcode);
                      setIsAssigning(false);
                      if (ok) {
                        tryAddProduct({ ...prod, barcode: unknownBarcode });
                        setUnknownBarcode(null);
                        searchInputRef.current?.focus();
                      }
                    }}
                    className="px-3 py-1.5 rounded-xl bg-[#D97706] hover:bg-[#B45309] text-white text-[11px] font-extrabold flex items-center gap-1 shrink-0 cursor-pointer disabled:opacity-50"
                  >
                    <Link2 className="w-3 h-3" />
                    <span>Vincular y agregar</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
