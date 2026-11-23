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
  Check,
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
 * Buscador + Escáner de Pistola USB + Grilla visual de catálogo POS.
 * - Soporta escaneo directo desde el buscador (auto-enfoque F2) y captura global de ráfagas USB.
 * - Permite asignar al vuelo un código de barras escaneado que aún no exista en Inventario.
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
  const [categoryFilter, setCategoryFilter] = useState('todos');
  const [petFilter, setPetFilter] = useState('todos');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [lastScannedId, setLastScannedId] = useState(null);
  const [unknownBarcode, setUnknownBarcode] = useState(null);
  const [assignSearch, setAssignSearch] = useState('');
  const [isAssigning, setIsAssigning] = useState(false);

  const searchInputRef = useRef(null);
  const scanBufferRef = useRef('');
  const lastKeyTimeRef = useRef(0);

  // Mapa rápido de cantidades ya en carrito por producto
  const cartQtyById = useMemo(() => {
    const map = new Map();
    cartItems.forEach((it) => map.set(it.id, (map.get(it.id) || 0) + (it.quantity || 0)));
    return map;
  }, [cartItems]);

  const categories = useMemo(() => {
    const set = new Set();
    inventory.forEach((p) => {
      if (p.category) set.add(p.category);
    });
    return ['todos', ...Array.from(set).sort()];
  }, [inventory]);

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
      const currentInCart = cartQtyById.get(exactMatch.id) || 0;
      const availableStock = Number(exactMatch.stock) || 0;
      if (availableStock <= 0 || currentInCart >= availableStock) {
        if (soundEnabled) playPosBeep('error');
        showToast?.(`Sin stock suficiente de ${exactMatch.name} (Stock: ${availableStock}).`, 'error');
        return true;
      }
      onAddProduct?.(exactMatch);
      setLastScannedId(exactMatch.id);
      setUnknownBarcode(null);
      if (soundEnabled) playPosBeep('ok');
      setTimeout(() => setLastScannedId((prev) => (prev === exactMatch.id ? null : prev)), 900);
      return true;
    }

    // Si parece un código de barras real (>= 6 chars alfanuméricos sin espacios) y no se encontró
    if (/^[A-Za-z0-9\-_]{6,}$/.test(clean)) {
      if (soundEnabled) playPosBeep('error');
      setUnknownBarcode(clean);
      setAssignSearch('');
      return true;
    }

    return false;
  };

  // Atajo F2 para enfocar buscador + captura global de pistola USB si el foco está fuera de inputs
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
        // Pistola USB teclea cada carácter en < 55ms; si pasó más tiempo, reinicia buffer
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

  const filteredProducts = useMemo(() => {
    const q = query.trim().toLowerCase();
    return inventory.filter((p) => {
      if (categoryFilter !== 'todos' && p.category !== categoryFilter) return false;
      if (petFilter !== 'todos' && String(p.petType || '').toLowerCase() !== petFilter) return false;
      if (!q) return true;
      return (
        String(p.name || '').toLowerCase().includes(q) ||
        String(p.brand || '').toLowerCase().includes(q) ||
        String(p.format || '').toLowerCase().includes(q) ||
        String(p.sku || '').toLowerCase().includes(q) ||
        String(p.barcode || '').toLowerCase().includes(q)
      );
    });
  }, [inventory, query, categoryFilter, petFilter]);

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

  const handleSearchKeyDown = (e) => {
    if (e.key !== 'Enter') return;
    e.preventDefault();
    const clean = query.trim();
    if (!clean) return;

    const matchedByCode = handleBarcodeLookup(clean);
    if (matchedByCode) {
      setQuery('');
      return;
    }

    // Si hay exactamente 1 resultado filtrado al presionar Enter, agregarlo
    if (filteredProducts.length === 1) {
      const single = filteredProducts[0];
      const currentInCart = cartQtyById.get(single.id) || 0;
      if ((Number(single.stock) || 0) > currentInCart) {
        onAddProduct?.(single);
        setLastScannedId(single.id);
        if (soundEnabled) playPosBeep('ok');
        setQuery('');
        setTimeout(() => setLastScannedId(null), 900);
      } else {
        if (soundEnabled) playPosBeep('error');
        showToast?.(`Sin stock suficiente de ${single.name}.`, 'error');
      }
    }
  };

  return (
    <div className="bg-white border border-[#EAECEF] rounded-3xl p-4 sm:p-5 flex flex-col gap-4 h-full min-h-[540px]">
      {/* Buscador + Pistola USB */}
      <div className="flex items-center gap-2.5">
        <div className="relative flex-1">
          <ScanBarcode className="w-4 h-4 text-[#D97706] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            ref={searchInputRef}
            type="text"
            disabled={disabled}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleSearchKeyDown}
            placeholder="Escanea código de barras con pistola USB o busca por nombre, marca, peso o SKU... (F2)"
            className="w-full pl-10 pr-10 py-3 rounded-2xl bg-[#F8FAFC] border-2 border-[#EAECEF] focus:border-[#D97706] focus:bg-white text-sm font-semibold text-[#111827] placeholder:text-slate-400 focus:outline-none transition-all disabled:opacity-50"
          />
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery('');
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

      {/* Aviso código de barras no encontrado + asignación rápida */}
      {unknownBarcode && (
        <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div className="text-xs">
                <div className="font-extrabold text-amber-950">
                  Código <span className="font-mono bg-white px-1.5 py-0.5 rounded border border-amber-200">{unknownBarcode}</span> no registrado en inventario
                </div>
                <p className="text-amber-800/90 mt-0.5">
                  Puedes vincularlo ahora mismo a un producto existente y agregarlo al carrito:
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setUnknownBarcode(null)}
              className="p-1 rounded-lg text-amber-700 hover:bg-amber-100 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={assignSearch}
              onChange={(e) => setAssignSearch(e.target.value)}
              placeholder="Buscar producto para asignar este código de barras..."
              className="w-full pl-8 pr-3 py-2 rounded-xl bg-white border border-amber-200 text-xs font-semibold text-slate-900 focus:outline-none focus:border-[#D97706]"
            />
          </div>

          <div className="max-h-40 overflow-y-auto space-y-1 pr-1">
            {assignableProducts.map((prod) => (
              <div
                key={prod.id}
                className="flex items-center justify-between gap-2 p-2 rounded-xl bg-white border border-amber-100 hover:border-[#D97706] transition-colors"
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
                      if ((Number(prod.stock) || 0) > (cartQtyById.get(prod.id) || 0)) {
                        onAddProduct?.({ ...prod, barcode: unknownBarcode });
                      }
                      setUnknownBarcode(null);
                      searchInputRef.current?.focus();
                    }
                  }}
                  className="px-3 py-1.5 rounded-lg bg-[#D97706] hover:bg-[#B45309] text-white text-[11px] font-extrabold flex items-center gap-1 shrink-0 cursor-pointer disabled:opacity-50"
                >
                  <Link2 className="w-3 h-3" />
                  <span>Vincular y agregar</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filtros rápidos de categoría y mascota */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1.5">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1 rounded-full text-[11px] font-bold transition-all cursor-pointer border ${
                categoryFilter === cat
                  ? 'bg-[#D97706] text-white border-[#D97706]'
                  : 'bg-[#F8FAFC] text-slate-600 border-[#EAECEF] hover:bg-[#FAF8F4]'
              }`}
            >
              {cat === 'todos' ? `Todos (${inventory.length})` : cat}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1">
          {[
            { id: 'todos', label: 'Todos' },
            { id: 'perros', label: 'Perros' },
            { id: 'gatos', label: 'Gatos' },
          ].map((pf) => (
            <button
              key={pf.id}
              type="button"
              onClick={() => setPetFilter(pf.id)}
              className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold transition-colors cursor-pointer border ${
                petFilter === pf.id
                  ? 'bg-[#111827] text-white border-[#111827]'
                  : 'bg-white text-slate-500 border-[#EAECEF] hover:text-slate-800'
              }`}
            >
              {pf.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grilla de productos */}
      <div className="flex-1 overflow-y-auto pr-1">
        {filteredProducts.length === 0 ? (
          <div className="h-56 flex flex-col items-center justify-center text-center text-slate-400 space-y-2">
            <Package className="w-8 h-8 opacity-40" />
            <p className="text-xs font-bold text-slate-500">No se encontraron productos</p>
            <p className="text-[11px]">Prueba otro término o limpia los filtros.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 xl:grid-cols-3 gap-2.5">
            {filteredProducts.map((prod) => {
              const stock = Number(prod.stock) || 0;
              const inCart = cartQtyById.get(prod.id) || 0;
              const remaining = Math.max(0, stock - inCart);
              const outOfStock = remaining <= 0;
              const isJustScanned = lastScannedId === prod.id;
              const price = Number(prod.salePrice ?? prod.price ?? 0);

              return (
                <button
                  key={prod.id}
                  type="button"
                  disabled={disabled || outOfStock}
                  onClick={() => {
                    onAddProduct?.(prod);
                    if (soundEnabled) playPosBeep('ok');
                    searchInputRef.current?.focus();
                  }}
                  className={`group text-left p-3 rounded-2xl border transition-all flex flex-col justify-between gap-2 relative ${
                    isJustScanned
                      ? 'bg-emerald-50 border-emerald-400 ring-2 ring-emerald-400/30'
                      : outOfStock
                        ? 'bg-slate-50 border-slate-200 opacity-55 cursor-not-allowed'
                        : 'bg-white border-[#EAECEF] hover:border-[#D97706] hover:bg-[#FAF8F4]/60 cursor-pointer active:scale-[0.98]'
                  }`}
                >
                  {inCart > 0 && (
                    <span className="absolute -top-2 -right-2 min-w-6 h-6 px-1.5 rounded-full bg-[#D97706] text-white text-[11px] font-black flex items-center justify-center shadow-sm tabular-nums">
                      {inCart}
                    </span>
                  )}

                  <div className="flex items-start gap-2.5">
                    {prod.image ? (
                      <img
                        src={prod.image}
                        alt={prod.name}
                        className="w-11 h-11 rounded-xl object-contain bg-[#F8FAFC] border border-[#EAECEF] p-1 shrink-0"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-11 h-11 rounded-xl bg-[#F8FAFC] border border-[#EAECEF] flex items-center justify-center text-slate-400 shrink-0">
                        <Package className="w-5 h-5" />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="text-[10px] font-bold uppercase tracking-wide text-slate-400 truncate">
                        {prod.brand}
                      </div>
                      <div className="text-xs font-extrabold text-[#111827] leading-snug line-clamp-2">
                        {prod.name}
                      </div>
                      <div className="flex flex-wrap items-center gap-1 mt-1">
                        <span className="px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-bold">
                          {prod.format}
                        </span>
                        {prod.barcode && (
                          <span
                            className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-[#FEF3C7]/70 text-[#92400E] text-[9px] font-mono font-bold"
                            title={`Código de barras: ${prod.barcode}`}
                          >
                            <ScanBarcode className="w-2.5 h-2.5" />
                            <span>{prod.barcode.slice(-6)}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                    <span
                      className={`text-[10px] font-extrabold tabular-nums ${
                        stock <= 0
                          ? 'text-rose-600'
                          : stock <= (prod.minStock || 5)
                            ? 'text-amber-600'
                            : 'text-emerald-700'
                      }`}
                    >
                      {stock <= 0 ? 'Agotado' : `Stock: ${remaining}`}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-black text-[#111827] tabular-nums">
                        {formatCLP(price)}
                      </span>
                      {!outOfStock && (
                        <span className="w-6 h-6 rounded-full bg-[#FEF3C7] group-hover:bg-[#D97706] text-[#D97706] group-hover:text-white flex items-center justify-center transition-colors">
                          {isJustScanned ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5 stroke-[2.5]" />}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
