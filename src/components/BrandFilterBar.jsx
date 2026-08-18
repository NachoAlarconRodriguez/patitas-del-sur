import React from 'react';
import { BRANDS } from '../data/mockData';
import { Layers, Sparkles } from 'lucide-react';

export default function BrandFilterBar({ selectedBrand, onSelectBrand, productCountsByBrand }) {
  return (
    <div className="w-full mb-6">
      
      {/* Header Label */}
      <div className="flex items-center gap-2 mb-3">
        <Layers className="w-4 h-4 text-[#0E8388]" />
        <span className="text-xs font-black uppercase tracking-wider text-slate-700">
          Nuestras Líneas & Marcas Patagónicas:
        </span>
      </div>

      {/* Brand Pills Scrollable Carousel */}
      <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
        
        {/* All Brands Tab */}
        <button
          onClick={() => onSelectBrand('Todas')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-extrabold transition-all shrink-0 border ${
            selectedBrand === 'Todas'
              ? 'bg-[#0A3E40] text-white border-[#0A3E40] shadow-lg shadow-[#0A3E40]/20 scale-105'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-[#10B981]" />
          <span>Todas las Marcas</span>
        </button>

        {/* Individual Brand Tabs */}
        {BRANDS.map((brand) => {
          const count = productCountsByBrand[brand.name] || 0;
          const isSelected = selectedBrand === brand.name;

          return (
            <button
              key={brand.id}
              onClick={() => onSelectBrand(brand.name)}
              className={`flex items-center gap-2.5 px-5 py-2.5 rounded-2xl text-xs font-extrabold transition-all shrink-0 border ${
                isSelected
                  ? 'bg-[#0E8388] text-white border-[#0E8388] shadow-lg shadow-[#0E8388]/20 scale-105'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100 hover:border-[#0E8388]/40'
              }`}
            >
              <span className="text-base">{brand.logo}</span>
              <div className="text-left">
                <div>{brand.name}</div>
                <div className={`text-[10px] font-normal ${isSelected ? 'text-emerald-200' : 'text-slate-400'}`}>
                  {brand.badge} ({count})
                </div>
              </div>
            </button>
          );
        })}

      </div>
    </div>
  );
}
