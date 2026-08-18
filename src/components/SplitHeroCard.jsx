import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowRight, User, LogOut, ChevronDown, Shield } from 'lucide-react';
import FloatingSearch from './FloatingSearch';

export default function SplitHeroCard({ onSelectProduct, user, onLogout }) {
  const navigate = useNavigate();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);

  // Close menu on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <section className="relative w-full h-screen overflow-hidden bg-[#FAF9F6] select-none">
      
      {/* Floating Round Search Button (Expands on Hover at Center Seam) */}
      <FloatingSearch onSelectProduct={onSelectProduct} />

      {/* Central Brand Card (Recuadro Central de Marca) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 pointer-events-auto flex flex-col items-center">
        <div className="relative group/badge transition-transform duration-500 ease-out">
          {/* Glowing Gradient Aura */}
          <div className="absolute -inset-3 rounded-[2.5rem] bg-gradient-to-r from-[#0E8388]/30 via-[#10B981]/25 to-[#C86D39]/30 blur-2xl opacity-80 group-hover/badge:opacity-100 transition-opacity duration-500" />
          
          {/* Glass Square Card with Rounded Corners */}
          <div className="relative w-40 h-40 sm:w-48 sm:h-48 md:w-52 md:h-52 rounded-[2rem] bg-white/95 backdrop-blur-2xl border-2 border-white shadow-2xl shadow-slate-900/15 flex flex-col items-center justify-between pt-2.5 pb-2 px-3 sm:pt-3.5 sm:pb-3 sm:px-4 transition-all duration-300">
            
            {/* User Auth Button at Top of Central Card */}
            {user ? (
              <div
                ref={userMenuRef}
                className="relative group/user z-30"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  type="button"
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-1 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full bg-[#0E8388]/15 text-[#0E8388] border border-[#0E8388]/30 hover:bg-[#0E8388] hover:text-white font-extrabold text-[10px] sm:text-xs shadow-xs transition-all active:scale-95 cursor-pointer"
                  title="Opciones de Cuenta"
                  aria-expanded={isUserMenuOpen}
                >
                  <User className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  <span className="truncate max-w-[85px] sm:max-w-[110px]">Hola, {user.name.split(' ')[0]} 🐾</span>
                  <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Menu with Hover Bridge */}
                <div
                  className={`absolute left-1/2 -translate-x-1/2 top-full pt-1.5 w-52 z-50 transition-all duration-200 ${
                    isUserMenuOpen ? 'block opacity-100 scale-100 pointer-events-auto' : 'hidden group-hover/user:block opacity-100 scale-100 pointer-events-auto'
                  }`}
                >
                  <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 p-2 animate-in fade-in slide-in-from-top-1 duration-150">
                    <div className="px-3 py-2 border-b border-slate-100 text-left">
                      <div className="text-xs font-black text-slate-900 truncate">{user.name}</div>
                      <div className="text-[10px] font-bold text-emerald-600 truncate">Mascota: {user.petName}</div>
                    </div>
                    <Link
                      to="/mi-cuenta"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="w-full text-left px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 rounded-xl transition-colors mt-1 flex items-center gap-2"
                    >
                      <User className="w-3.5 h-3.5 text-[#0E8388]" />
                      <span>Mi Panel Personal</span>
                    </Link>
                    <button
                      type="button"
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        onLogout();
                      }}
                      className="w-full text-left px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50 rounded-xl transition-colors mt-1 flex items-center gap-2 cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Cerrar Sesión</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <Link
                to="/login"
                onClick={(e) => e.stopPropagation()}
                className="group/authbtn flex items-center gap-1.5 px-3 py-1 sm:px-4 sm:py-1.5 rounded-full border border-slate-300/80 bg-white/90 hover:bg-[#0E8388] hover:text-white text-slate-800 font-bold text-[10px] sm:text-xs shadow-xs transition-all duration-300 hover:scale-105 active:scale-95 z-30"
              >
                <User className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#0E8388] group-hover/authbtn:text-white transition-colors" />
                <span>Iniciar Sesión</span>
              </Link>
            )}

            {/* Prominent Logo (Click opens Admin Login Portal) */}
            <div
              onClick={(e) => {
                e.stopPropagation();
                navigate('/admin');
              }}
              className="flex-1 w-full flex flex-col items-center justify-center min-h-0 overflow-hidden cursor-pointer group/logo relative"
              title="Acceder al Panel de Administración"
            >
              <img
                src="/images/logo_patitas_del_sur.svg"
                alt="Patitas del Sur - Panel Administrador"
                className="w-full h-full object-contain scale-110 sm:scale-115 drop-shadow-md group-hover/badge:scale-120 group-hover/logo:scale-125 transition-transform duration-500"
              />
              
              {/* Subtle hover tooltip */}
              <div className="absolute bottom-1 opacity-0 group-hover/logo:opacity-100 transition-all duration-300 pointer-events-none bg-slate-900/90 text-white text-[9px] font-black px-2.5 py-0.5 rounded-full backdrop-blur-md flex items-center gap-1 border border-white/20 shadow-xl transform translate-y-1 group-hover/logo:translate-y-0">
                <Shield className="w-2.5 h-2.5 text-emerald-400" />
                <span>Acceso Admin</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2-Card Split Container */}
      <div className="split-hero-container">
        
        {/* LEFT CARD: PERROS (KIRA) - Warm Fresh Mint/Sage Palette */}
        <div
          onClick={() => navigate('/perros')}
          className="split-card group/dog border-b md:border-b-0 md:border-r border-slate-200/80 bg-gradient-to-br from-[#E6F4F1] via-[#FAF9F5] to-[#CBE5E1] flex flex-col justify-between cursor-pointer"
        >
          
          {/* Top Mascot Name Tag */}
          <div className="relative z-20 pt-4 sm:pt-6 md:pt-8 px-6 md:px-10 flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-3 py-0.5 sm:px-3.5 sm:py-1 rounded-full text-[11px] sm:text-xs font-black bg-white/90 text-slate-800 border border-slate-200/80 shadow-xs backdrop-blur-md">
              Kira 🐶
            </span>
          </div>

          {/* Mascot Kira Image - Scaled Flexibly to Viewport Height */}
          <div className="relative flex-1 min-h-0 flex items-center justify-center p-2 sm:p-4 overflow-hidden">
            {/* Background Soft Glow */}
            <div className="absolute w-60 h-60 md:w-80 md:h-80 rounded-full bg-[#10B981]/15 blur-3xl group-hover/dog:bg-[#10B981]/25 transition-all duration-700 pointer-events-none" />
            
            {/* Kira Image with Radial Vignette Fade */}
            <div className="relative h-full max-h-[28vh] sm:max-h-[32vh] md:max-h-[36vh] aspect-square group-hover/dog:scale-105 transition-transform duration-700 ease-out flex items-center justify-center">
              <img
                src="/images/kira_dog.jpg"
                alt="Kira Mascota Perro"
                className="w-full h-full object-contain drop-shadow-xl opacity-95"
                style={{
                  maskImage: 'radial-gradient(circle at center, black 60%, transparent 88%)',
                  WebkitMaskImage: 'radial-gradient(circle at center, black 60%, transparent 88%)',
                }}
              />
            </div>
          </div>

          {/* Content Box (Bottom) */}
          <div className="relative z-20 pb-5 sm:pb-6 md:pb-8 px-6 md:px-10 flex flex-col items-start gap-1.5 sm:gap-2">
            
            {/* Title */}
            <div className="space-y-0.5">
              <span className="text-[#0E8388] text-[10px] sm:text-xs font-black tracking-widest uppercase">
                Nutrición Pura de la Patagonia
              </span>
              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-[#0A3E40] tracking-tight drop-shadow-xs leading-none">
                PERROS <span className="text-[#10B981] font-serif italic text-2xl sm:text-3xl md:text-5xl">.</span>
              </h2>
            </div>

            {/* Description */}
            <p className="text-slate-700 text-xs sm:text-sm max-w-md font-medium leading-relaxed line-clamp-2">
              Alimento seco libre de granos, snacks deshidratados 100% de pradera y suplementos naturales para Kira y tu perro.
            </p>

            {/* Feature Pills */}
            <div className="flex flex-wrap gap-1.5 pt-0.5">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] sm:text-[11px] font-bold bg-white text-[#0A3E40] border border-slate-200/80 shadow-xs">
                100% Salmón Austral
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] sm:text-[11px] font-bold bg-white text-[#0A3E40] border border-slate-200/80 shadow-xs">
                Sin Rellenos Artificiales
              </span>
            </div>

            {/* CTA Button */}
            <div className="mt-1 sm:mt-2 group/btn inline-flex items-center gap-2.5 px-6 py-2.5 sm:py-3 rounded-full bg-[#0E8388] group-hover/dog:bg-[#10B981] text-white font-extrabold text-xs sm:text-sm transition-all duration-300 shadow-xl shadow-[#0E8388]/25 group-hover/dog:scale-105">
              <span>EXPLORAR PERROS</span>
              <ArrowRight className="w-4 h-4 group-hover/dog:translate-x-1.5 transition-transform" />
            </div>
          </div>

        </div>

        {/* RIGHT CARD: GATOS (JACK) - Warm Vanilla/Peach Palette */}
        <div
          onClick={() => navigate('/gatos')}
          className="split-card group/cat bg-gradient-to-br from-[#FFF4EB] via-[#FAF9F6] to-[#FCE6D5] flex flex-col justify-between cursor-pointer"
        >
          
          {/* Top Mascot Name Tag */}
          <div className="relative z-20 pt-4 sm:pt-6 md:pt-8 px-6 md:px-10 flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-3 py-0.5 sm:px-3.5 sm:py-1 rounded-full text-[11px] sm:text-xs font-black bg-white/90 text-slate-800 border border-slate-200/80 shadow-xs backdrop-blur-md">
              Jack 🐱
            </span>
          </div>

          {/* Mascot Jack Image - Scaled Flexibly to Viewport Height */}
          <div className="relative flex-1 min-h-0 flex items-center justify-center p-2 sm:p-4 overflow-hidden">
            {/* Background Soft Glow */}
            <div className="absolute w-60 h-60 md:w-80 md:h-80 rounded-full bg-[#F59E0B]/15 blur-3xl group-hover/cat:bg-[#F59E0B]/25 transition-all duration-700 pointer-events-none" />
            
            {/* Jack Image with Radial Vignette Fade */}
            <div className="relative h-full max-h-[28vh] sm:max-h-[32vh] md:max-h-[36vh] aspect-square group-hover/cat:scale-105 transition-transform duration-700 ease-out flex items-center justify-center">
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
          <div className="relative z-20 pb-5 sm:pb-6 md:pb-8 px-6 md:px-10 flex flex-col items-start gap-1.5 sm:gap-2">
            
            {/* Title */}
            <div className="space-y-0.5">
              <span className="text-[#C86D39] text-[10px] sm:text-xs font-black tracking-widest uppercase">
                Recetas Holísticas Felinas
              </span>
              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-[#59260E] tracking-tight drop-shadow-xs leading-none">
                GATOS <span className="text-[#C86D39] font-serif italic text-2xl sm:text-3xl md:text-5xl">.</span>
              </h2>
            </div>

            {/* Description */}
            <p className="text-slate-700 text-xs sm:text-sm max-w-md font-medium leading-relaxed line-clamp-2">
              Fórmulas con trucha fresca, taurina esencial y bocadillos irresistibles para Jack y tu felino.
            </p>

            {/* Feature Pills */}
            <div className="flex flex-wrap gap-1.5 pt-0.5">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] sm:text-[11px] font-bold bg-white text-[#59260E] border border-slate-200/80 shadow-xs">
                Taurina Natural Essential
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] sm:text-[11px] font-bold bg-white text-[#59260E] border border-slate-200/80 shadow-xs">
                Salud Renal & Urinaria
              </span>
            </div>

            {/* CTA Button */}
            <div className="mt-1 sm:mt-2 group/btn inline-flex items-center gap-2.5 px-6 py-2.5 sm:py-3 rounded-full bg-[#C86D39] group-hover/cat:bg-[#D97706] text-white font-extrabold text-xs sm:text-sm transition-all duration-300 shadow-xl shadow-[#C86D39]/25 group-hover/cat:scale-105">
              <span>EXPLORAR GATOS</span>
              <ArrowRight className="w-4 h-4 group-hover/cat:translate-x-1.5 transition-transform" />
            </div>
          </div>

        </div>

      </div>

    </section>
  );
}
