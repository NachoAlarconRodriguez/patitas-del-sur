import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ChevronDown } from 'lucide-react';

export default function SplitHeroCard() {
  const navigate = useNavigate();
  const containerRef = useRef(null);
  const videoRef = useRef(null);
  const targetTimeRef = useRef(3.6);
  const shownTimeRef = useRef(3.6);
  const lastMoveRef = useRef(performance.now());
  const prevTimeRef = useRef(performance.now());
  const [videoLoaded, setVideoLoaded] = useState(false);

  // Precarga del video unificado en memoria RAM como Blob (cero latencia de disco/red)
  useEffect(() => {
    let objectUrl = null;
    let isCancelled = false;

    fetch('/hero_movie_fast.mp4')
      .then((res) => res.blob())
      .then((blob) => {
        if (!isCancelled && videoRef.current) {
          objectUrl = URL.createObjectURL(blob);
          videoRef.current.src = objectUrl;
          videoRef.current.load();
        }
      })
      .catch((err) => {
        console.warn('Fallback to direct video URL', err);
        if (videoRef.current) videoRef.current.src = '/hero_movie_fast.mp4';
      });

    return () => {
      isCancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, []);

  // Motor de interacción de seguimiento del cursor (Mouse & Touch Tracking)
  useEffect(() => {
    const updateTargetTime = (clientX) => {
      const video = videoRef.current;
      if (!video) return;

      const rect = containerRef.current
        ? containerRef.current.getBoundingClientRect()
        : { left: 0, width: window.innerWidth };

      // Normalizar coordenada horizontal entre 0 (borde izquierdo) y 1 (borde derecho)
      const x = Math.max(0, Math.min(rect.width, clientX - rect.left));
      const xRatio = x / rect.width;

      // Keyframes de hero_movie.mp4:
      // - 1.8s: Kira y Jack mirando juntos hacia la Izquierda
      // - 3.6s: Kira y Jack mirando juntos al Centro / Frente
      // - 5.8s: Kira y Jack mirando juntos hacia la Derecha
      let targetTime;
      if (xRatio <= 0.5) {
        targetTime = 1.8 + (xRatio / 0.5) * (3.6 - 1.8);
      } else {
        targetTime = 3.6 + ((xRatio - 0.5) / 0.5) * (5.8 - 3.6);
      }

      targetTimeRef.current = targetTime;
    };

    const handleMouseMove = (e) => {
      lastMoveRef.current = performance.now();
      updateTargetTime(e.clientX);
    };

    const handleTouchMove = (e) => {
      if (e.touches && e.touches[0]) {
        lastMoveRef.current = performance.now();
        updateTargetTime(e.touches[0].clientX);
      }
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });

    let rafId;
    const updateVideo = (now) => {
      const dt = Math.min((now - prevTimeRef.current) / 1000, 0.1);
      prevTimeRef.current = now;

      let target = targetTimeRef.current;
      const idle = now - lastMoveRef.current - 2200; // Al estar inactivo 2.2s

      // Respiración sutil / mirada viva cuando no hay movimiento
      if (idle > 0) {
        const k = Math.min(1, idle / 1800);
        const idleSway = 3.6 + 0.22 * Math.sin((idle / 1000) * 1.2);
        target = target * (1 - k) + idleSway * k;
      }

      // Suavizado por decaimiento exponencial físico (tau = 0.050s)
      shownTimeRef.current += (target - shownTimeRef.current) * (1 - Math.exp(-dt / 0.050));

      const video = videoRef.current;
      if (video && video.readyState >= 2 && !video.seeking) {
        const diff = Math.abs(video.currentTime - shownTimeRef.current);
        if (diff > 0.002) {
          const duration = video.duration || 7.98;
          const nextTime = Math.max(0, Math.min(duration - 0.01, shownTimeRef.current));
          if (typeof video.fastSeek === 'function') {
            video.fastSeek(nextTime);
          } else {
            video.currentTime = nextTime;
          }
        }
      }

      rafId = requestAnimationFrame(updateVideo);
    };

    rafId = requestAnimationFrame(updateVideo);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
      cancelAnimationFrame(rafId);
    };
  }, []);

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = 3.6; // Postura inicial: mirando al frente
      targetTimeRef.current = 3.6;
      shownTimeRef.current = 3.6;
      setVideoLoaded(true);
    }
  };

  return (
    <section
      ref={containerRef}
      className="relative w-full h-[88vh] sm:h-[92vh] md:h-[95vh] min-h-[580px] overflow-hidden bg-[#FAF8F4] select-none"
    >
      {/* Semantic H1 for SEO */}
      <h1 className="sr-only">
        Patitas del Sur | Alimento Natural, Grain Free y Snacks Holísticos para Perros y Gatos en la Patagonia
      </h1>

      {/* Video de Fondo Panorámico Unificado */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <video
          ref={videoRef}
          src="/hero_movie_fast.mp4"
          muted
          playsInline
          preload="auto"
          onLoadedMetadata={handleLoadedMetadata}
          className={`w-full h-full object-cover object-[center_35%] transition-opacity duration-700 ${
            videoLoaded ? 'opacity-100' : 'opacity-90'
          }`}
        />

        {/* Gradiente superior sutil para dar contraste a la barra de navegación */}
        <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-[#1D1D1F]/20 via-transparent to-transparent pointer-events-none" />

        {/* Gradiente inferior para una transición suave y legible con los botones y la tienda */}
        <div className="absolute bottom-0 inset-x-0 h-52 sm:h-60 bg-gradient-to-t from-[#FAF8F4] via-[#FAF8F4]/85 via-45% to-transparent pointer-events-none" />
      </div>

      {/* Tags de Identificación de Mascotas (Flotando sobre Kira y Jack) */}
      <div className="relative z-20 pt-28 sm:pt-28 md:pt-24 px-6 md:px-12 max-w-7xl mx-auto flex items-center justify-between pointer-events-none">
        {/* Tag Kira */}
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-white/90 text-[#1D1D1F] border border-amber-200/80 shadow-xs backdrop-blur-md">
          <span>Kira</span>
          <span className="text-[10px] text-[#D97706] font-semibold hidden sm:inline">Peludos</span>
        </div>

        {/* Tag Jack */}
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-white/90 text-[#1D1D1F] border border-amber-200/80 shadow-xs backdrop-blur-md">
          <span>Jack</span>
          <span className="text-[10px] text-[#D97706] font-semibold hidden sm:inline">Felinos</span>
        </div>
      </div>

      {/* Contenedor de Botones y Acciones en Desktop y Mobile */}
      <div className="absolute bottom-10 sm:bottom-12 md:bottom-8 inset-x-0 z-20 px-4 sm:px-8 md:px-12 max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 sm:gap-6 pointer-events-none">
        
        {/* BLOQUE IZQUIERDO: PELUDOS (KIRA) */}
        <div className="w-full md:w-auto flex flex-col items-center md:items-start text-center md:text-left pointer-events-auto">
          <h2 className="font-molen font-bold text-2xl sm:text-4xl md:text-5xl lg:text-6xl text-[#1D1D1F] tracking-tight drop-shadow-xs leading-none mb-1.5 sm:mb-2.5">
            PELUDOS <span className="text-[#D97706] font-serif italic text-xl sm:text-4xl">.</span>
          </h2>
          <button
            type="button"
            onClick={() => navigate('/perros')}
            className="group inline-flex items-center gap-2 sm:gap-2.5 px-5 sm:px-7 py-2.5 sm:py-3 rounded-full bg-[#1D1D1F] hover:bg-[#F5BA13] text-white hover:text-[#1D1D1F] font-extrabold text-xs sm:text-sm transition-all duration-300 shadow-xl shadow-black/20 hover:shadow-[#F5BA13]/40 hover:scale-105 active:scale-95 cursor-pointer"
          >
            <span>EXPLORAR PELUDOS</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
          </button>
        </div>

        {/* BLOQUE DERECHO: GATOS (JACK) */}
        <div className="w-full md:w-auto flex flex-col items-center md:items-end text-center md:text-right pointer-events-auto">
          <h2 className="font-molen font-bold text-2xl sm:text-4xl md:text-5xl lg:text-6xl text-[#1D1D1F] tracking-tight drop-shadow-xs leading-none mb-1.5 sm:mb-2.5">
            GATOS <span className="text-[#F5BA13] font-serif italic text-xl sm:text-4xl">.</span>
          </h2>
          <button
            type="button"
            onClick={() => navigate('/gatos')}
            className="group inline-flex items-center gap-2 sm:gap-2.5 px-5 sm:px-7 py-2.5 sm:py-3 rounded-full bg-[#1D1D1F] hover:bg-[#F5BA13] text-white hover:text-[#1D1D1F] font-extrabold text-xs sm:text-sm transition-all duration-300 shadow-xl shadow-black/20 hover:shadow-[#F5BA13]/40 hover:scale-105 active:scale-95 cursor-pointer"
          >
            <span>EXPLORAR GATOS</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
          </button>
        </div>

      </div>

      {/* Indicador Sutil de Scroll */}
      <div className="absolute bottom-2 sm:bottom-3 md:bottom-4 left-1/2 -translate-x-1/2 z-20 pointer-events-auto">
        <button
          type="button"
          onClick={() => {
            const target = document.getElementById('storefront-content');
            if (target) {
              target.scrollIntoView({ behavior: 'smooth' });
            }
          }}
          className="group inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/80 hover:bg-white text-slate-700 hover:text-slate-900 border border-white/80 shadow-xs backdrop-blur-md transition-all duration-200 cursor-pointer select-none text-[11px] font-semibold"
          title="Ver Catálogo"
          aria-label="Desplazarse hacia el catálogo"
        >
          <span>Ver catálogo</span>
          <ChevronDown className="w-3.5 h-3.5 text-[#D97706] group-hover:translate-y-0.5 transition-transform" />
        </button>
      </div>
    </section>
  );
}
