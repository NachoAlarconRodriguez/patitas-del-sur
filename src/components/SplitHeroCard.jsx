import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export default function SplitHeroCard() {
  const navigate = useNavigate();
  const [activeMobileTab, setActiveMobileTab] = useState('perros'); // 'perros' | 'gatos'
  const [touchStartX, setTouchStartX] = useState(0);

  const videoRef = useRef(null);
  const targetTimeRef = useRef(0);

  useEffect(() => {
    const updateTargetTime = (clientX) => {
      const video = videoRef.current;
      if (!video) return;

      // Center of Kira's video on the screen
      const rect = video.getBoundingClientRect();
      const videoCenterX = rect.left + rect.width / 2;

      // Keyframes discovered in Kira.mp4:
      // - 2.0s: Looking Left
      // - 4.0s: Looking Center (Forward)
      // - 6.5s: Looking Right
      const maxDistance = Math.max(280, window.innerWidth * 0.35);
      const offset = clientX - videoCenterX; // negative = left of Kira, positive = right of Kira
      const factor = Math.max(-1, Math.min(1, offset / maxDistance)); // -1 (left) to +1 (right)

      let targetTime;
      if (factor < 0) {
        // Easing towards Left (factor = -1 -> 2.0s, factor = 0 -> 4.0s)
        targetTime = 4.0 + factor * (4.0 - 2.0);
      } else {
        // Easing towards Right (factor = 0 -> 4.0s, factor = 1 -> 6.5s)
        targetTime = 4.0 + factor * (6.5 - 4.0);
      }

      targetTimeRef.current = targetTime;
    };

    const handleMouseMove = (e) => {
      updateTargetTime(e.clientX);
    };

    const handleTouchMove = (e) => {
      if (e.touches && e.touches[0]) {
        updateTargetTime(e.touches[0].clientX);
      }
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });

    let rafId;
    const updateVideo = () => {
      const video = videoRef.current;
      if (video && video.readyState >= 2 && !video.seeking) {
        const diff = targetTimeRef.current - video.currentTime;
        if (Math.abs(diff) > 0.02) {
          // LERP smooth interpolation (16% per frame)
          const nextTime = video.currentTime + diff * 0.16;
          const duration = video.duration || 7.9;
          video.currentTime = Math.max(0, Math.min(duration, nextTime));
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
      videoRef.current.currentTime = 4.0; // Initial posture: looking straight forward
      targetTimeRef.current = 4.0;
    }
  };

  const handleTouchStart = (e) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e) => {
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX - touchEndX;
    if (diff > 50) {
      setActiveMobileTab('gatos');
    } else if (diff < -50) {
      setActiveMobileTab('perros');
    }
  };

  return (
    <section className="relative w-full h-[100dvh] min-h-[100dvh] overflow-hidden bg-[#FAF9F6] select-none">
      {/* Semantic H1 for Search Engine & Screen Reader Accessibility */}
      <h1 className="sr-only">
        Patitas del Sur | Alimento Natural, Grain Free y Snacks Holísticos para Perros y Gatos en la Patagonia
      </h1>
      
      {/* Mobile Segmented Mascot Switcher (Only on Mobile) */}
      <div className="md:hidden absolute top-20 left-1/2 -translate-x-1/2 z-30 flex items-center bg-white/95 backdrop-blur-md p-1 rounded-full border border-slate-200/90 shadow-lg">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setActiveMobileTab('perros');
          }}
          className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-black transition-all cursor-pointer ${
            activeMobileTab === 'perros'
              ? 'bg-[#0E8388] text-white shadow-md shadow-[#0E8388]/30 scale-102'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <span>🐶 Perros</span>
          <span className="text-[10px] opacity-80">(Kira)</span>
        </button>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setActiveMobileTab('gatos');
          }}
          className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-black transition-all cursor-pointer ${
            activeMobileTab === 'gatos'
              ? 'bg-[#C86D39] text-white shadow-md shadow-[#C86D39]/30 scale-102'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <span>🐱 Gatos</span>
          <span className="text-[10px] opacity-80">(Jack)</span>
        </button>
      </div>

      {/* 2-Card Container: 50/50 on Desktop, Horizontal Swipe / Tab on Mobile */}
      <div
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className={`split-hero-container flex flex-row w-[200%] md:w-full h-full transition-transform duration-500 ease-out md:transition-none ${
          activeMobileTab === 'perros' ? 'translate-x-0' : '-translate-x-1/2 md:translate-x-0'
        }`}
      >
        
        {/* LEFT CARD: PERROS (KIRA) */}
        <div
          onClick={() => navigate('/perros')}
          className="relative w-1/2 md:w-auto split-card group/dog border-r border-slate-200/80 bg-gradient-to-br from-[#E6F4F1] via-[#FAF9F5] to-[#CBE5E1] flex flex-col justify-between cursor-pointer h-full overflow-hidden"
        >
          
          {/* Background Video Layer (Full Bleed Card) */}
          <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
            <video
              ref={videoRef}
              src="/Kira.mp4"
              muted
              playsInline
              preload="auto"
              onLoadedMetadata={handleLoadedMetadata}
              className="w-full h-full object-cover object-[center_35%]"
            />
            {/* Top gradient for tag contrast */}
            <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-[#E6F4F1]/90 via-[#E6F4F1]/40 to-transparent pointer-events-none" />
            
            {/* Bottom gradient for crisp text legibility */}
            <div className="absolute bottom-0 inset-x-0 h-[60%] sm:h-[55%] bg-gradient-to-t from-[#FAF9F5] via-[#FAF9F5]/85 to-transparent pointer-events-none" />
          </div>

          {/* Top Mascot Name Tag */}
          <div className="relative z-20 pt-28 sm:pt-28 md:pt-18 px-6 md:px-10 flex items-center justify-between">
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black bg-white/90 text-slate-800 border border-slate-200/80 shadow-xs backdrop-blur-md">
              Kira 🐶
            </span>
            <span className="md:hidden text-[10px] font-extrabold text-slate-500 bg-white/60 px-2 py-0.5 rounded-full">
              Desliza para Gatos ➔
            </span>
          </div>

          {/* Middle Spacer */}
          <div className="relative flex-1 min-h-0 pointer-events-none" />

          {/* Content Box (Bottom) */}
          <div className="relative z-20 pb-20 sm:pb-20 md:pb-8 px-6 md:px-10 flex flex-col items-start gap-1.5 sm:gap-2">
            
            <div className="space-y-0.5">
              <span className="text-[#0E8388] text-[10px] sm:text-xs font-black tracking-widest uppercase">
                Nutrición Pura de la Patagonia
              </span>
              <h2 className="font-molen font-bold text-3xl sm:text-4xl md:text-6xl lg:text-7xl text-[#0A3E40] tracking-tight drop-shadow-xs leading-none">
                PERROS <span className="text-[#10B981] font-serif italic text-2xl sm:text-3xl md:text-5xl">.</span>
              </h2>
            </div>

            <p className="text-slate-700 text-xs sm:text-sm max-w-md font-medium leading-relaxed line-clamp-2">
              Alimento seco libre de granos, snacks deshidratados 100% de pradera y suplementos naturales para Kira y tu perro.
            </p>

            <div className="flex flex-wrap gap-1.5 pt-0.5">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] sm:text-[11px] font-bold bg-white text-[#0A3E40] border border-slate-200/80 shadow-xs">
                100% Salmón Austral
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] sm:text-[11px] font-bold bg-white text-[#0A3E40] border border-slate-200/80 shadow-xs">
                Sin Rellenos Artificiales
              </span>
            </div>

            <div className="mt-1 sm:mt-2 group/btn inline-flex items-center gap-2.5 px-6 py-2.5 sm:py-3 rounded-full bg-[#0E8388] group-hover/dog:bg-[#10B981] text-white font-extrabold text-xs sm:text-sm transition-all duration-300 shadow-xl shadow-[#0E8388]/25 group-hover/dog:scale-105 active:scale-95">
              <span>EXPLORAR PERROS</span>
              <ArrowRight className="w-4 h-4 group-hover/dog:translate-x-1.5 transition-transform" />
            </div>
          </div>

        </div>

        {/* RIGHT CARD: GATOS (JACK) */}
        <div
          onClick={() => navigate('/gatos')}
          className="w-1/2 md:w-auto split-card group/cat bg-gradient-to-br from-[#FFF4EB] via-[#FAF9F6] to-[#FCE6D5] flex flex-col justify-between cursor-pointer h-full"
        >
          
          {/* Top Mascot Name Tag */}
          <div className="relative z-20 pt-28 sm:pt-28 md:pt-18 px-6 md:px-10 flex items-center justify-between">
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black bg-white/90 text-slate-800 border border-slate-200/80 shadow-xs backdrop-blur-md">
              Jack 🐱
            </span>
            <span className="md:hidden text-[10px] font-extrabold text-slate-500 bg-white/60 px-2 py-0.5 rounded-full">
              ⬅ Desliza para Perros
            </span>
          </div>

          {/* Mascot Jack Image */}
          <div className="relative flex-1 min-h-0 flex items-center justify-center p-2 sm:p-4 overflow-hidden">
            <div className="absolute w-60 h-60 md:w-80 md:h-80 rounded-full bg-[#F59E0B]/15 blur-3xl group-hover/cat:bg-[#F59E0B]/25 transition-all duration-700 pointer-events-none" />
            
            <div className="relative h-full max-h-[30vh] sm:max-h-[34vh] md:max-h-[38vh] aspect-square group-hover/cat:scale-105 transition-transform duration-700 ease-out flex items-center justify-center">
              <img
                src="/images/jack_cat.jpg"
                alt="Jack Mascota Gato"
                className="w-full h-full object-contain drop-shadow-xl opacity-95"
                style={{
                  maskImage: 'radial-gradient(circle at center, black 60%, transparent 88%)',
                  WebkitMaskImage: 'radial-gradient(circle at center, black 60%, transparent 88%)',
                }}
              />
            </div>
          </div>

          {/* Content Box (Bottom) */}
          <div className="relative z-20 pb-20 sm:pb-20 md:pb-8 px-6 md:px-10 flex flex-col items-start gap-1.5 sm:gap-2">
            
            <div className="space-y-0.5">
              <span className="text-[#C86D39] text-[10px] sm:text-xs font-black tracking-widest uppercase">
                Recetas Holísticas Felinas
              </span>
              <h2 className="font-molen font-bold text-3xl sm:text-4xl md:text-6xl lg:text-7xl text-[#59260E] tracking-tight drop-shadow-xs leading-none">
                GATOS <span className="text-[#C86D39] font-serif italic text-2xl sm:text-3xl md:text-5xl">.</span>
              </h2>
            </div>

            <p className="text-slate-700 text-xs sm:text-sm max-w-md font-medium leading-relaxed line-clamp-2">
              Fórmulas con trucha fresca, taurina esencial y bocadillos irresistibles para Jack y tu felino.
            </p>

            <div className="flex flex-wrap gap-1.5 pt-0.5">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] sm:text-[11px] font-bold bg-white text-[#59260E] border border-slate-200/80 shadow-xs">
                Taurina Natural Essential
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] sm:text-[11px] font-bold bg-white text-[#59260E] border border-slate-200/80 shadow-xs">
                Salud Renal & Urinaria
              </span>
            </div>

            <div className="mt-1 sm:mt-2 group/btn inline-flex items-center gap-2.5 px-6 py-2.5 sm:py-3 rounded-full bg-[#C86D39] group-hover/cat:bg-[#D97706] text-white font-extrabold text-xs sm:text-sm transition-all duration-300 shadow-xl shadow-[#C86D39]/25 group-hover/cat:scale-105 active:scale-95">
              <span>EXPLORAR GATOS</span>
              <ArrowRight className="w-4 h-4 group-hover/cat:translate-x-1.5 transition-transform" />
            </div>
          </div>

        </div>

      </div>

    </section>
  );
}
