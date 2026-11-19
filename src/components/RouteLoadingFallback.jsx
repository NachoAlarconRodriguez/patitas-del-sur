import React from 'react';

export default function RouteLoadingFallback() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-5 p-6 bg-[#FAF8F4] select-none animate-in fade-in duration-200">
      <img
        src="/images/logo_patitas_del_sur_amber.svg"
        alt="Patitas del Sur"
        style={{ width: 'clamp(200px, 28vw, 260px)', height: 'auto', display: 'block' }}
      />
      <div
        style={{
          fontFamily: "'Bricolage Grotesque', 'Outfit', system-ui, -apple-system, sans-serif",
          fontSize: 'clamp(2rem, 4.5vw, 3.25rem)',
          fontWeight: 800,
          letterSpacing: '-0.03em',
          lineHeight: 1.08,
          background: 'linear-gradient(95deg, #1D1D1F 0%, #B45309 38%, #D97706 68%, #F5BA13 100%)',
          WebkitBackgroundClip: 'text',
          backgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}
      >
        Patitas del Sur
      </div>
    </div>
  );
}
