import React, { useState, useEffect } from 'react';

export default function Preloader({ onLoaded }) {
  const [progress, setProgress] = useState(0);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [isRemoved, setIsRemoved] = useState(false);

  useEffect(() => {
    // Step 1: Smooth progress incrementation
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        // Accelerate smoothly
        const increment = Math.floor(Math.random() * 15) + 12;
        return Math.min(prev + increment, 100);
      });
    }, 100);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (progress === 100) {
      // Step 2: Hold for a brief moment at 100% then trigger smooth fade-out
      const fadeTimer = setTimeout(() => {
        setIsFadingOut(true);
      }, 300);

      // Step 3: Remove from DOM after fade-out transition completes
      const removeTimer = setTimeout(() => {
        setIsRemoved(true);
        if (onLoaded) onLoaded();
      }, 950);

      return () => {
        clearTimeout(fadeTimer);
        clearTimeout(removeTimer);
      };
    }
  }, [progress, onLoaded]);

  if (isRemoved) return null;

  return (
    <div
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#FAF9F6] select-none transition-all duration-700 ease-out ${
        isFadingOut ? 'opacity-0 scale-105 pointer-events-none' : 'opacity-100 scale-100 pointer-events-auto'
      }`}
    >
      {/* Ambient Radial Background Glows (Emerald & Terracotta) */}
      <div className="absolute top-1/3 left-1/3 -translate-x-1/2 -translate-y-1/2 w-80 h-80 sm:w-96 sm:h-96 rounded-full bg-[#10B981]/15 blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute bottom-1/3 right-1/3 translate-x-1/2 translate-y-1/2 w-80 h-80 sm:w-96 sm:h-96 rounded-full bg-[#C86D39]/15 blur-3xl pointer-events-none animate-pulse" />

      {/* Center Content Container */}
      <div className="relative z-10 flex flex-col items-center px-6 max-w-sm text-center">
        
        {/* Glowing Aura Behind Brand Logo */}
        <div className="relative mb-6">
          <div className="absolute -inset-4 rounded-3xl bg-gradient-to-r from-[#0E8388]/20 via-[#10B981]/25 to-[#C86D39]/20 blur-2xl opacity-80 animate-pulse" />
          
          {/* Logo Card with Breathing Animation */}
          <div className="relative w-44 sm:w-56 h-auto p-4 rounded-3xl bg-white/80 backdrop-blur-xl border border-white/80 shadow-2xl shadow-slate-900/10 flex items-center justify-center transition-transform duration-700 hover:scale-105">
            <img
              src="/images/logo_patitas_del_sur.svg"
              alt="Patitas del Sur"
              className="w-full h-auto object-contain drop-shadow-sm"
            />
          </div>
        </div>

        {/* Progress Bar Container */}
        <div className="w-48 sm:w-56 h-1.5 bg-slate-200/80 rounded-full overflow-hidden relative shadow-inner mb-3">
          <div
            className="h-full bg-gradient-to-r from-[#0E8388] via-[#10B981] to-[#C86D39] rounded-full transition-all duration-200 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Loading Tagline & Micro Paw Animation */}
        <div className="flex items-center gap-2 text-slate-600 text-xs font-bold tracking-tight">
          <span className="text-[#0E8388]">Nutrición Pura de la Patagonia</span>
          <span className="inline-block animate-bounce text-sm">🐾</span>
        </div>

        {/* Dynamic Micro Status */}
        <p className="text-[11px] text-slate-400 font-semibold mt-1">
          {progress < 40 && 'Preparando recetas holísticas...'}
          {progress >= 40 && progress < 85 && 'Cargando el mundo de Kira y Jack...'}
          {progress >= 85 && '¡Todo listo!'}
        </p>

      </div>
    </div>
  );
}
