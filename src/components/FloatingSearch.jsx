import React, { useState, useRef, useEffect } from 'react';
import { Search, X, Sparkles, ArrowRight } from 'lucide-react';
import { PRODUCTS } from '../data/mockData';

export default function FloatingSearch({ onSelectProduct }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const containerRef = useRef(null);

  // Live Search filter
  useEffect(() => {
    if (query.trim().length > 1) {
      const q = query.toLowerCase();
      const filtered = PRODUCTS.filter((p) =>
        p.name.toLowerCase().includes(q) ||
        p.tagline.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.petType.toLowerCase().includes(q) ||
        (p.ingredients && p.ingredients.some((ing) => ing.toLowerCase().includes(q)))
      );
      setResults(filtered);
    } else {
      setResults([]);
    }
  }, [query]);

  // Click outside listener to close search
  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        if (!query) {
          setIsExpanded(false);
        }
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [query]);

  const formatCLP = (price) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div
      ref={containerRef}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => {
        if (!query) setIsExpanded(false);
      }}
      className="absolute top-20 md:top-24 left-1/2 -translate-x-1/2 z-50 select-none flex flex-col items-center pointer-events-auto"
    >
      {/* Floating Expandable Search Capsule */}
      <div
        onClick={() => setIsExpanded(true)}
        className={`relative transition-all duration-500 ease-out flex items-center bg-white/90 rounded-full border shadow-xl backdrop-blur-2xl ${
          isExpanded
            ? 'w-80 sm:w-96 px-5 py-3 border-[#0E8388] shadow-[#0E8388]/20 scale-105'
            : 'w-14 h-14 justify-center border-slate-200 hover:border-[#0E8388] hover:scale-110 cursor-pointer bg-white'
        }`}
      >
        {/* Search Icon */}
        <Search
          className={`shrink-0 transition-colors duration-300 ${
            isExpanded ? 'w-5 h-5 text-[#0E8388]' : 'w-6 h-6 text-slate-700 hover:text-[#0E8388]'
          }`}
        />

        {/* Input Field when expanded */}
        {isExpanded && (
          <input
            type="text"
            autoFocus
            placeholder="Buscar alimento, salmón, trucha..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent border-none outline-none text-slate-900 placeholder-slate-400 text-sm font-semibold ml-3 pr-2"
          />
        )}

        {/* Clear / Close Icon when expanded & typing */}
        {isExpanded && query && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setQuery('');
              setResults([]);
            }}
            className="p-1 text-slate-400 hover:text-slate-700 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Live Search Results Dropdown Preview */}
      {isExpanded && results.length > 0 && (
        <div className="mt-3 w-80 sm:w-96 bg-white/95 rounded-3xl p-4 border border-slate-200 shadow-2xl backdrop-blur-2xl max-h-80 overflow-y-auto space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="text-[11px] font-bold text-[#0E8388] uppercase tracking-wider px-2 pb-1 border-b border-slate-100 flex items-center justify-between">
            <span>Resultados encontrados ({results.length})</span>
            <Sparkles className="w-3 h-3 text-[#0E8388]" />
          </div>

          {results.map((product) => (
            <div
              key={product.id}
              onClick={() => {
                onSelectProduct(product);
                setQuery('');
                setIsExpanded(false);
              }}
              className="flex items-center gap-3 p-2.5 rounded-2xl hover:bg-slate-100 transition-all cursor-pointer group"
            >
              <img
                src={product.image}
                alt={product.name}
                className="w-12 h-12 object-contain rounded-xl bg-slate-50 p-1 border border-slate-200 group-hover:scale-105 transition-transform"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full text-white ${
                    product.petType === 'perros' ? 'bg-[#0E8388]' : 'bg-[#C86D39]'
                  }`}>
                    {product.petType === 'perros' ? '🐶 Perro' : '🐱 Gato'}
                  </span>
                  <span className="text-[10px] text-slate-400 font-semibold">{product.category}</span>
                </div>
                <h4 className="text-xs font-bold text-slate-900 truncate mt-0.5 group-hover:text-[#0E8388] transition-colors">
                  {product.name}
                </h4>
                <div className="text-xs font-black text-slate-900">
                  {formatCLP(product.price)}
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-[#0E8388] group-hover:translate-x-1 transition-all" />
            </div>
          ))}
        </div>
      )}

      {/* No Results Fallback */}
      {isExpanded && query.trim().length > 1 && results.length === 0 && (
        <div className="mt-3 w-80 sm:w-96 bg-white/95 rounded-2xl p-4 border border-slate-200 text-center text-xs text-slate-600 backdrop-blur-2xl">
          No encontramos productos para "<span className="text-slate-900 font-bold">{query}</span>". Intenta con salmón, trucha o cordero.
        </div>
      )}
    </div>
  );
}
