import React, { useState, useEffect } from 'react';

export default function Preloader({ onLoaded }) {
  const [progress, setProgress] = useState(12);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [isRemoved, setIsRemoved] = useState(false);

  useEffect(() => {
    let isCancelled = false;
    let rafId = null;
    let removeTimer = null;
    let assetsReady = false;
    let currentProgress = 12;

    const fontsReady =
      typeof document !== 'undefined' && document.fonts && document.fonts.ready
        ? document.fonts.ready.catch(() => {})
        : Promise.resolve();

    const heroOrWindowReady = new Promise((resolve) => {
      if (typeof window === 'undefined') {
        resolve();
        return;
      }

      if (window.location.pathname === '/') {
        const heroImg = new Image();
        heroImg.onload = () => resolve();
        heroImg.onerror = () => resolve();
        heroImg.src = '/images/kira_hero_still_alpha.png?v=5';
        if (heroImg.complete) {
          resolve();
        }
        return;
      }

      if (document.readyState === 'complete') {
        resolve();
      } else {
        window.addEventListener('load', () => resolve(), { once: true });
      }
    });

    // Tope máximo de seguridad para que nunca retenga al usuario de más
    const maxWaitFallback = new Promise((resolve) => {
      setTimeout(resolve, 750);
    });

    Promise.race([Promise.all([fontsReady, heroOrWindowReady]), maxWaitFallback]).then(() => {
      assetsReady = true;
    });

    const tick = () => {
      if (isCancelled) return;

      if (!assetsReady) {
        // Avance orgánico mientras cargan los recursos reales (hasta 86%)
        currentProgress += (86 - currentProgress) * 0.08;
        setProgress(currentProgress);
        rafId = requestAnimationFrame(tick);
      } else {
        // Cuando la portada ya está lista, completa fluidamente hasta el 100%
        currentProgress += Math.max(2.6, (100 - currentProgress) * 0.24);
        if (currentProgress >= 99.6) {
          setProgress(100);
          requestAnimationFrame(() => {
            if (isCancelled) return;
            setIsFadingOut(true);
            removeTimer = setTimeout(() => {
              if (isCancelled) return;
              setIsRemoved(true);
              if (onLoaded) onLoaded();
            }, 480);
          });
          return;
        }
        setProgress(currentProgress);
        rafId = requestAnimationFrame(tick);
      }
    };

    rafId = requestAnimationFrame(tick);

    return () => {
      isCancelled = true;
      if (rafId) cancelAnimationFrame(rafId);
      if (removeTimer) clearTimeout(removeTimer);
    };
  }, [onLoaded]);

  if (isRemoved) return null;

  const clipRight = Math.max(0, 100 - progress);

  return (
    <div
      aria-hidden={isFadingOut}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FAF8F4',
        padding: '24px',
        userSelect: 'none',
      }}
      className={`transition-opacity duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
        isFadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100 pointer-events-auto'
      }`}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '22px',
        }}
        className={`transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          isFadingOut ? 'scale-[0.985]' : 'scale-100'
        }`}
      >
        <img
          src="/images/logo_patitas_del_sur_amber.svg"
          alt="Patitas del Sur"
          style={{
            width: 'clamp(230px, 34vw, 300px)',
            height: 'auto',
            display: 'block',
          }}
        />

        <div
          style={{
            position: 'relative',
            display: 'inline-block',
            fontFamily: "'Bricolage Grotesque', 'Outfit', system-ui, -apple-system, sans-serif",
            fontSize: 'clamp(2.35rem, 5.5vw, 4rem)',
            fontWeight: 800,
            letterSpacing: '-0.03em',
            lineHeight: 1.08,
            whiteSpace: 'nowrap',
          }}
        >
          {/* Capa base sin rellenar */}
          <span style={{ color: '#D4CFC7' }}>Patitas del Sur</span>

          {/* Capa de color que va llenando las letras de 0% a 100% */}
          <span
            aria-hidden="true"
            style={{
              position: 'absolute',
              inset: 0,
              color: '#D97706',
              background: 'linear-gradient(95deg, #1D1D1F 0%, #B45309 38%, #D97706 68%, #F5BA13 100%)',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              clipPath: `inset(0 ${clipRight.toFixed(2)}% 0 0)`,
            }}
          >
            Patitas del Sur
          </span>
        </div>
      </div>
    </div>
  );
}
