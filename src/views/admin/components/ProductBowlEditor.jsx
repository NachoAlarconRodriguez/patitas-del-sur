import React, { useState, useMemo } from 'react';
import {
  ChevronDown,
  Image as ImageIcon,
  Search,
  Sparkles,
  Check,
  RotateCcw,
  X,
} from 'lucide-react';
import {
  BOWL_BASE_IMAGE,
  BOWL_IMAGE_BANK,
  BOWL_IMAGE_CATEGORIES,
  buildWedgesFromFirstSixIngredients,
  resolveProductBowlData,
} from '../../../utils/productBowlResolver';

/**
 * Configurador Visual del Plato Interactivo de Ingredientes (6 Gajos)
 * Cargado de forma diferida (React.lazy) dentro del modal de edición de producto en Admin.
 */
export default function ProductBowlEditor({ editingProduct, setEditingProduct }) {
  const [previewIdx, setPreviewIdx] = useState(0);
  const [pickerSlotIdx, setPickerSlotIdx] = useState(null);
  const [bankCategory, setBankCategory] = useState('Todos');
  const [bankSearch, setBankSearch] = useState('');

  const resolvedBowl = useMemo(
    () => resolveProductBowlData(editingProduct || {}),
    [editingProduct]
  );

  const hasCustomBowl = Boolean(
    editingProduct?.bowlConfig &&
      ((Array.isArray(editingProduct.bowlConfig.wedges) &&
        editingProduct.bowlConfig.wedges.some((w) => w && (w.name || w.pill || w.desc || w.img))) ||
        (Array.isArray(editingProduct.bowlConfig.stickers) &&
          editingProduct.bowlConfig.stickers.some(Boolean)) ||
        editingProduct.bowlConfig.subtitle)
  );

  const ingredientCount = Array.isArray(editingProduct?.ingredients)
    ? editingProduct.ingredients.filter((i) => i && String(i).trim()).length
    : 0;

  const filteredBank = useMemo(() => {
    const q = bankSearch
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim();

    return BOWL_IMAGE_BANK.filter((item) => {
      if (bankCategory !== 'Todos' && item.category !== bankCategory) return false;
      if (!q) return true;
      const inLabel = item.label
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .includes(q);
      const inKeywords = item.keywords.some((kw) => kw.includes(q));
      return inLabel || inKeywords;
    });
  }, [bankCategory, bankSearch]);

  const updateWedgeField = (slotIdx, field, val) => {
    setEditingProduct((prev) => {
      const prevBowl = prev.bowlConfig || {};
      const prevWedges = Array.isArray(prevBowl.wedges)
        ? [...prevBowl.wedges]
        : [{}, {}, {}, {}, {}, {}];
      while (prevWedges.length < 6) prevWedges.push({});
      prevWedges[slotIdx] = {
        ...(prevWedges[slotIdx] || {}),
        [field]: val,
      };
      return {
        ...prev,
        bowlConfig: {
          ...prevBowl,
          wedges: prevWedges,
        },
      };
    });
  };

  const updateStickerField = (stIdx, val) => {
    setEditingProduct((prev) => {
      const prevBowl = prev.bowlConfig || {};
      const prevStickers = Array.isArray(prevBowl.stickers)
        ? [...prevBowl.stickers]
        : ['', '', '', ''];
      while (prevStickers.length < 4) prevStickers.push('');
      prevStickers[stIdx] = val;
      return {
        ...prev,
        bowlConfig: {
          ...prevBowl,
          stickers: prevStickers,
        },
      };
    });
  };

  const handleLoadFirstSix = () => {
    const generatedWedges = buildWedgesFromFirstSixIngredients(editingProduct);
    setEditingProduct((prev) => ({
      ...prev,
      bowlConfig: {
        ...(prev.bowlConfig || {}),
        wedges: generatedWedges,
      },
    }));
  };

  const activePreviewWedge = resolvedBowl.wedges[previewIdx] || resolvedBowl.wedges[0];
  const activeAngle = activePreviewWedge?.c ?? 330;
  const cut0 = (((activeAngle - 30) / 60) + 6) % 6;
  const cut1 = ((activeAngle + 30) / 60) % 6;

  const findBankLabel = (url) => {
    const match = BOWL_IMAGE_BANK.find((b) => b.url === url);
    return match ? match.label : 'Imagen personalizada';
  };

  return (
    <details className="group rounded-2xl bg-amber-50/50 border border-amber-200/80 overflow-hidden">
      <summary className="flex items-center justify-between gap-3 p-4 cursor-pointer select-none list-none hover:bg-amber-50 transition-colors">
        <div className="flex items-center gap-2.5">
          <span className="w-7 h-7 rounded-lg bg-[#F5BA13] text-slate-900 flex items-center justify-center font-black text-xs shadow-2xs">
            6
          </span>
          <div>
            <h5 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-2 flex-wrap">
              Plato Interactivo de Ingredientes (6 Gajos)
              <span
                className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                  hasCustomBowl
                    ? 'bg-amber-500 text-white'
                    : 'bg-emerald-100 text-emerald-800'
                }`}
              >
                {hasCustomBowl ? 'Personalizado' : 'Automático'}
              </span>
            </h5>
            <p className="text-[11px] text-slate-500">
              Toma en orden los 6 primeros ingredientes y permite elegir la foto exacta de cada gajo desde el banco visual.
            </p>
          </div>
        </div>
        <ChevronDown className="w-4 h-4 text-slate-500 transition-transform group-open:rotate-180 shrink-0" />
      </summary>

      <div className="p-4 pt-3 border-t border-amber-200/60 space-y-4 bg-white">
        {/* Barra superior de acciones + Mini Vista Previa en Vivo */}
        <div className="flex flex-col md:flex-row items-center gap-4 p-3.5 rounded-2xl bg-gradient-to-br from-[#FAF8F4] to-amber-50/40 border border-amber-200/60">
          {/* Mini Plato Interactivo en Vivo */}
          <div className="relative w-40 h-40 shrink-0 select-none">
            <img
              src={BOWL_BASE_IMAGE}
              alt="Vista previa del plato"
              width="640"
              height="640"
              loading="lazy"
              decoding="async"
              className="w-full h-full object-contain drop-shadow-md"
            />
            {resolvedBowl.wedges.map((w, idx) => {
              const isAct = previewIdx === idx;
              return (
                <div
                  key={w.num}
                  className="absolute inset-0 pointer-events-none transition-all duration-300"
                  style={{
                    opacity: isAct ? 1 : 0,
                    clipPath: isAct
                      ? `polygon(50% 50%, ${w.p0}, ${w.pm}, ${w.p1})`
                      : `polygon(50% 50%, ${w.pm}, ${w.pm}, ${w.pm})`,
                  }}
                >
                  <img
                    src={w.img}
                    alt=""
                    width="640"
                    height="640"
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-contain"
                  />
                </div>
              );
            })}
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none"
              viewBox="0 0 100 100"
              aria-hidden="true"
            >
              {[
                [50, 6],
                [88.11, 28],
                [88.11, 72],
                [50, 94],
                [11.89, 72],
                [11.89, 28],
              ].map(([x2, y2], idx) => (
                <line
                  key={idx}
                  x1="50"
                  y1="50"
                  x2={x2}
                  y2={y2}
                  stroke={idx === cut0 || idx === cut1 ? '#F5BA13' : 'rgba(255,255,255,0.75)'}
                  strokeWidth={idx === cut0 || idx === cut1 ? '1.8' : '0.9'}
                />
              ))}
            </svg>
            {resolvedBowl.wedges.map((w, idx) => (
              <button
                key={w.num}
                type="button"
                onClick={() => setPreviewIdx(idx)}
                style={{ left: w.hx, top: w.hy }}
                className={`absolute -translate-x-1/2 -translate-y-1/2 w-5 h-5 rounded-full text-[10px] font-black flex items-center justify-center transition-all cursor-pointer shadow-xs ${
                  previewIdx === idx
                    ? 'bg-[#D97706] text-white scale-110 ring-2 ring-white'
                    : 'bg-white/95 text-slate-800 hover:bg-amber-100'
                }`}
                title={`Ver Gajo #${w.num}: ${w.name}`}
              >
                {w.num}
              </button>
            ))}
          </div>

          {/* Info del gajo previsualizado y botones rápidos */}
          <div className="flex-1 space-y-2.5 text-center md:text-left">
            <div>
              <div className="text-[10px] font-black uppercase tracking-wider text-amber-700">
                Vista previa en vivo · Gajo #{activePreviewWedge?.num}
              </div>
              <div className="text-sm font-black text-slate-900">
                {activePreviewWedge?.name}{' '}
                <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full ml-1">
                  {activePreviewWedge?.pill}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2">
                Foto asignada: <strong className="text-slate-700">{findBankLabel(activePreviewWedge?.img)}</strong>. Haz clic en los números 1–6 del plato para revisar cada gajo.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
              <button
                type="button"
                onClick={handleLoadFirstSix}
                disabled={ingredientCount === 0}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white text-[11px] font-bold transition-colors cursor-pointer"
                title="Carga los 6 primeros ingredientes de arriba en orden y sugiere la imagen exacta para cada uno"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#F5BA13]" />
                Cargar los 6 primeros al plato ({Math.min(ingredientCount, 6)}/6)
              </button>

              {hasCustomBowl && (
                <button
                  type="button"
                  onClick={() =>
                    setEditingProduct((prev) => ({
                      ...prev,
                      bowlConfig: null,
                    }))
                  }
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white hover:bg-rose-50 text-slate-600 hover:text-rose-600 text-[11px] font-bold border border-slate-200 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  Restaurar automático
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Subtítulo y 4 Stickers flotantes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200/80">
          <div className="md:col-span-2">
            <label className="block text-[10px] font-extrabold text-slate-600 uppercase mb-1">
              Subtítulo bajo la palabra &ldquo;ingredientes&rdquo;
            </label>
            <input
              type="text"
              placeholder={resolvedBowl.subtitle}
              value={editingProduct.bowlConfig?.subtitle || ''}
              onChange={(e) =>
                setEditingProduct((prev) => ({
                  ...prev,
                  bowlConfig: {
                    ...(prev.bowlConfig || {}),
                    subtitle: e.target.value,
                  },
                }))
              }
              className="w-full p-2 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-800 focus:border-[#D97706] focus:outline-none"
            />
          </div>
          {[0, 1, 2, 3].map((stIdx) => (
            <div key={stIdx}>
              <label className="block text-[10px] font-extrabold text-slate-600 uppercase mb-1">
                Sticker Flotante #{stIdx + 1}
              </label>
              <input
                type="text"
                placeholder={resolvedBowl.stickers[stIdx]}
                value={editingProduct.bowlConfig?.stickers?.[stIdx] || ''}
                onChange={(e) => updateStickerField(stIdx, e.target.value)}
                className="w-full p-2 rounded-lg border border-slate-200 bg-white text-xs font-bold text-slate-800 focus:border-[#D97706] focus:outline-none"
              />
            </div>
          ))}
        </div>

        {/* Los 6 Gajos del Plato */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {resolvedBowl.wedges.map((w, idx) => {
            const customW = editingProduct.bowlConfig?.wedges?.[idx] || {};
            const isPickerOpen = pickerSlotIdx === idx;
            const currentImg = w.img;

            return (
              <div
                key={w.num}
                className={`p-3 rounded-xl border transition-colors space-y-2.5 ${
                  previewIdx === idx
                    ? 'border-amber-400 bg-amber-50/30'
                    : 'border-slate-200 bg-slate-50/70'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => setPreviewIdx(idx)}
                    className="inline-flex items-center gap-1.5 text-xs font-black text-slate-800 cursor-pointer"
                  >
                    <span className="w-5 h-5 rounded-full bg-[#D97706] text-white text-[11px] flex items-center justify-center font-black">
                      {w.num}
                    </span>
                    Gajo #{w.num} ({idx < 3 ? 'Izq.' : 'Der.'})
                  </button>
                  <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
                    {w.pill}
                  </span>
                </div>

                {/* Fila visual de imagen seleccionada + botón abrir banco */}
                <div className="flex items-center gap-2.5 p-2 rounded-xl bg-white border border-slate-200">
                  <img
                    src={currentImg}
                    alt={w.name}
                    width="64"
                    height="64"
                    loading="lazy"
                    decoding="async"
                    className="w-11 h-11 rounded-full object-cover bg-amber-50 border border-amber-200 shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="text-[9px] font-extrabold uppercase text-slate-400">
                      {customW.img ? 'Foto elegida del banco' : 'Foto automática sugerida'}
                    </div>
                    <div className="text-xs font-bold text-slate-800 truncate">
                      {findBankLabel(currentImg)}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setPreviewIdx(idx);
                      setBankCategory('Todos');
                      setBankSearch('');
                      setPickerSlotIdx(isPickerOpen ? null : idx);
                    }}
                    className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-bold border transition-colors cursor-pointer shrink-0 ${
                      isPickerOpen
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'bg-amber-50 hover:bg-amber-100 text-amber-900 border-amber-200'
                    }`}
                  >
                    <ImageIcon className="w-3.5 h-3.5" />
                    {isPickerOpen ? 'Cerrar' : 'Elegir foto'}
                  </button>
                </div>

                {/* Selector Visual del Banco de Imágenes (solo se monta al abrir) */}
                {isPickerOpen && (
                  <div className="p-2.5 rounded-xl bg-white border-2 border-amber-300 shadow-sm space-y-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-black uppercase text-amber-800">
                        Banco de Ingredientes ({BOWL_IMAGE_BANK.length} fotos)
                      </span>
                      <div className="flex items-center gap-1.5">
                        {customW.img && (
                          <button
                            type="button"
                            onClick={() => {
                              updateWedgeField(idx, 'img', '');
                              setPickerSlotIdx(null);
                            }}
                            className="text-[10px] font-bold text-slate-500 hover:text-amber-700 underline cursor-pointer"
                          >
                            Usar automática
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => setPickerSlotIdx(null)}
                          className="text-slate-400 hover:text-slate-700 cursor-pointer"
                          aria-label="Cerrar banco"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Buscador */}
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={bankSearch}
                        onChange={(e) => setBankSearch(e.target.value)}
                        placeholder="Buscar: venado, trucha, conejo, piña..."
                        className="w-full pl-8 pr-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-[11px] font-medium text-slate-800 focus:bg-white focus:border-[#D97706] focus:outline-none"
                      />
                    </div>

                    {/* Filtros por categoría */}
                    <div className="flex flex-wrap gap-1">
                      {['Todos', ...BOWL_IMAGE_CATEGORIES].map((cat) => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setBankCategory(cat)}
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold transition-colors cursor-pointer ${
                            bankCategory === cat
                              ? 'bg-slate-900 text-white'
                              : 'bg-slate-100 text-slate-600 hover:bg-amber-100'
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>

                    {/* Grilla de Miniaturas */}
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5 max-h-52 overflow-y-auto pr-0.5">
                      {filteredBank.map((item) => {
                        const isSelected = currentImg === item.url;
                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => {
                              updateWedgeField(idx, 'img', item.url);
                              setPreviewIdx(idx);
                              setPickerSlotIdx(null);
                            }}
                            className={`relative flex flex-col items-center gap-1 p-1.5 rounded-xl border text-center transition-all cursor-pointer ${
                              isSelected
                                ? 'border-[#D97706] bg-amber-50 ring-1 ring-[#D97706]'
                                : 'border-slate-200 hover:border-amber-300 hover:bg-amber-50/40 bg-white'
                            }`}
                          >
                            <div className="relative w-11 h-11">
                              <img
                                src={item.url}
                                alt={item.label}
                                width="64"
                                height="64"
                                loading="lazy"
                                decoding="async"
                                className="w-11 h-11 rounded-full object-cover bg-slate-100"
                              />
                              {isSelected && (
                                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-[#D97706] text-white flex items-center justify-center shadow-xs">
                                  <Check className="w-2.5 h-2.5" />
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] leading-tight font-bold text-slate-700 line-clamp-2">
                              {item.label}
                            </span>
                          </button>
                        );
                      })}
                      {filteredBank.length === 0 && (
                        <p className="col-span-full text-center text-[11px] text-slate-400 py-3">
                          Sin resultados para &ldquo;{bankSearch}&rdquo;.
                        </p>
                      )}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[9px] font-extrabold text-slate-500 uppercase mb-0.5">
                      Título del Ingrediente
                    </label>
                    <input
                      type="text"
                      placeholder={w.name}
                      value={customW.name || ''}
                      onChange={(e) => updateWedgeField(idx, 'name', e.target.value)}
                      className="w-full p-1.5 rounded-lg border border-slate-200 bg-white text-xs font-bold text-slate-900 focus:border-[#D97706] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-extrabold text-slate-500 uppercase mb-0.5">
                      Píldora (Beneficio)
                    </label>
                    <input
                      type="text"
                      placeholder={w.pill}
                      value={customW.pill || ''}
                      onChange={(e) => updateWedgeField(idx, 'pill', e.target.value)}
                      className="w-full p-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-800 focus:border-[#D97706] focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[9px] font-extrabold text-slate-500 uppercase mb-0.5">
                    Descripción breve
                  </label>
                  <textarea
                    rows={2}
                    placeholder={w.desc}
                    value={customW.desc || ''}
                    onChange={(e) => updateWedgeField(idx, 'desc', e.target.value)}
                    className="w-full p-1.5 rounded-lg border border-slate-200 bg-white text-[11px] font-medium text-slate-700 focus:border-[#D97706] focus:outline-none resize-none"
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </details>
  );
}
