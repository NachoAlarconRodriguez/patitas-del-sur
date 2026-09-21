import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, ShoppingBag, User } from 'lucide-react';

export default function BottomNavBar({ cartCount = 0, onOpenCart, user, onOpenAuthModal }) {
  const location = useLocation();
  const currentPath = location.pathname;

  const isActive = (path) => currentPath === path;

  return (
    <nav
      aria-label="Navegación móvil inferior"
      className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white/90 backdrop-blur-xl border-t border-slate-200/80 shadow-[0_-4px_25px_rgba(0,0,0,0.06)] pb-safe transition-transform duration-300"
    >
      <div className="flex items-center justify-around px-2 py-1.5 max-w-lg mx-auto">
        
        {/* 1. Inicio */}
        <Link
          to="/"
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all active:scale-90 ${
            isActive('/')
              ? 'text-[#0E8388]'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <div className="relative p-1">
            <Home className="w-5 h-5" />
            {isActive('/') && (
              <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-[#0E8388]" />
            )}
          </div>
          <span className="text-[10px] font-extrabold tracking-tight mt-0.5">Inicio</span>
        </Link>

        {/* 2. Perros (Kira) */}
        <Link
          to="/perros"
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all active:scale-90 ${
            isActive('/perros')
              ? 'text-[#0E8388]'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <div className="relative p-1">
            <span className="text-lg leading-none">🐶</span>
            {isActive('/perros') && (
              <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-[#0E8388]" />
            )}
          </div>
          <span className="text-[10px] font-extrabold tracking-tight mt-0.5">Perros</span>
        </Link>

        {/* 3. Gatos (Jack) */}
        <Link
          to="/gatos"
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all active:scale-90 ${
            isActive('/gatos')
              ? 'text-[#C86D39]'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <div className="relative p-1">
            <span className="text-lg leading-none">🐱</span>
            {isActive('/gatos') && (
              <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-[#C86D39]" />
            )}
          </div>
          <span className="text-[10px] font-extrabold tracking-tight mt-0.5">Gatos</span>
        </Link>

        {/* 4. Carrito de Compras (con Badge) */}
        <button
          type="button"
          onClick={onOpenCart}
          className="flex flex-col items-center justify-center py-1 px-3 rounded-2xl text-slate-700 hover:text-slate-900 transition-all active:scale-90 cursor-pointer"
          aria-label="Abrir carrito de compras"
        >
          <div className="relative p-1">
            <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center shadow-md">
              <ShoppingBag className="w-4 h-4 text-emerald-400" />
            </div>
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#C86D39] text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-xs animate-pulse">
                {cartCount}
              </span>
            )}
          </div>
          <span className="text-[10px] font-extrabold tracking-tight mt-0.5">Carrito</span>
        </button>

        {/* 5. Perfil / Login */}
        {user ? (
          <Link
            to="/mi-cuenta"
            className={`flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all active:scale-90 ${
              isActive('/mi-cuenta')
                ? 'text-[#0E8388]'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <div className="relative p-1">
              <div className="w-6 h-6 rounded-full bg-[#0E8388]/15 text-[#0E8388] font-bold text-xs flex items-center justify-center border border-[#0E8388]/30">
                {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              {isActive('/mi-cuenta') && (
                <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-[#0E8388]" />
              )}
            </div>
            <span className="text-[10px] font-extrabold tracking-tight mt-0.5 truncate max-w-[45px]">
              Cuenta
            </span>
          </Link>
        ) : (
          <button
            type="button"
            onClick={onOpenAuthModal}
            className="flex flex-col items-center justify-center py-1 px-3 rounded-2xl text-slate-500 hover:text-slate-900 transition-all active:scale-90 cursor-pointer"
            aria-label="Iniciar sesión"
          >
            <div className="relative p-1">
              <User className="w-5 h-5 text-slate-600" />
            </div>
            <span className="text-[10px] font-extrabold tracking-tight mt-0.5">Ingresar</span>
          </button>
        )}

      </div>
    </nav>
  );
}
