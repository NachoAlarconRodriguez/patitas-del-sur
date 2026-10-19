import React from 'react';

export default function RouteLoadingFallback() {
  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center p-8 text-center animate-fade-in select-none">
      <div className="relative flex items-center justify-center">
        {/* Subtle breathing aura */}
        <div className="absolute w-20 h-20 rounded-full bg-[#0E8388]/15 blur-xl animate-pulse" />
        
        {/* Modern spinner circle */}
        <div className="w-12 h-12 rounded-full border-3 border-slate-200 border-t-[#0E8388] animate-spin" />
        
        {/* Brand emblem */}
        <span className="absolute text-base select-none">🐾</span>
      </div>
      
      <p className="mt-4 text-[11px] font-black tracking-widest text-[#0E8388] uppercase">
        Cargando experiencia...
      </p>
    </div>
  );
}
