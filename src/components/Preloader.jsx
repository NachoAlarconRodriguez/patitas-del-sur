import React, { useState, useEffect } from 'react';
import ModernPetLoadingSpinner from './ModernPetLoadingSpinner';

export default function Preloader({ onLoaded }) {
  const [progress, setProgress] = useState(0);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [isRemoved, setIsRemoved] = useState(false);

  useEffect(() => {
    // Incremento suave del progreso
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        const increment = Math.floor(Math.random() * 18) + 14;
        return Math.min(prev + increment, 100);
      });
    }, 85);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (progress === 100) {
      const fadeTimer = setTimeout(() => {
        setIsFadingOut(true);
      }, 250);

      const removeTimer = setTimeout(() => {
        setIsRemoved(true);
        if (onLoaded) onLoaded();
      }, 850);

      return () => {
        clearTimeout(fadeTimer);
        clearTimeout(removeTimer);
      };
    }
  }, [progress, onLoaded]);

  if (isRemoved) return null;

  return (
    <div
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#FAF9F6] select-none transition-all duration-700 ease-out px-4 ${
        isFadingOut ? 'opacity-0 scale-105 pointer-events-none' : 'opacity-100 scale-100 pointer-events-auto'
      }`}
    >
      {/* Luces Ambientales Patagónicas (Ámbar y Verde Azulado) */}
      <div className="absolute top-1/3 left-1/3 -translate-x-1/2 -translate-y-1/2 w-80 h-80 sm:w-96 sm:h-96 rounded-full bg-[#F5BA13]/12 blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute bottom-1/3 right-1/3 translate-x-1/2 translate-y-1/2 w-80 h-80 sm:w-96 sm:h-96 rounded-full bg-[#0E8388]/12 blur-3xl pointer-events-none animate-pulse" />

      {/* Contenedor del Spinner de Carga Moderno */}
      <div className="relative z-10 w-full max-w-md">
        <ModernPetLoadingSpinner
          petType="both"
          showSkeletons={false}
          customMessage={
            progress < 45
              ? 'Preparando recetas holísticas de la Patagonia...'
              : progress < 90
              ? 'Sincronizando stock fresco para despacho express...'
              : '¡Todo listo!'
          }
        />

        {/* Micro barra sutil de progreso coordinada */}
        <div className="w-36 h-1 bg-slate-200/80 rounded-full overflow-hidden mx-auto -mt-3 relative shadow-inner">
          <div
            className="h-full bg-gradient-to-r from-[#F5BA13] via-[#D97706] to-[#0E8388] rounded-full transition-all duration-150 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}
