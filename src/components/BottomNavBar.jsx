import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, ShoppingBag, User, Heart, Stethoscope } from 'lucide-react';

export default function BottomNavBar({ cartCount = 0, onOpenCart, user, onOpenAuthModal }) {
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;

  const isActive = (path) => currentPath === path;
  const isCustomerPWA = user?.role === 'cliente' || currentPath === '/mi-cuenta';

  // Sincronización del tab activo en la PWA del cliente ('mascotas' | 'tienda' | 'cuaderno')
  const [activeCustomerTab, setActiveCustomerTab] = useState(() => {
    const params = new URLSearchParams(location.search);
    return params.get('tab') || 'mascotas';
  });

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tabParam = params.get('tab');
    if (tabParam) {
      setActiveCustomerTab(tabParam);
    }
  }, [location.search]);

  useEffect(() => {
    const handleTabChange = (e) => {
      if (e.detail) {
        setActiveCustomerTab(e.detail);
      }
    };
    window.addEventListener('patitas_customer_tab_changed', handleTabChange);
    return () => window.removeEventListener('patitas_customer_tab_changed', handleTabChange);
  }, []);

  const handleSelectCustomerTab = (tabKey) => {
    setActiveCustomerTab(tabKey);
    window.dispatchEvent(new CustomEvent('patitas_customer_tab', { detail: tabKey }));
    if (currentPath !== '/mi-cuenta') {
      navigate(`/mi-cuenta?tab=${tabKey}`);
    } else {
      navigate(`/mi-cuenta?tab=${tabKey}`, { replace: true });
    }
  };

  // =========================================================================
  // VISTA PWA CLIENTE: 3 BOTONES MINIMALISTAS
  // 1. Izquierda: Mis Mascotas
  // 2. Centro: Botón grande para realizar una compra
  // 3. Derecha: Cuaderno Veterinario (vacunas, desparasitante, etc.)
  // =========================================================================
  if (isCustomerPWA) {
    return (
      <nav
        aria-label="Navegación PWA Cliente"
        className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-white/95 backdrop-blur-2xl border-t border-slate-200/90 shadow-[0_-4px_25px_rgba(0,0,0,0.08)] pb-safe transition-all duration-300"
      >
        <div className="flex items-center justify-between px-8 py-1.5 max-w-md mx-auto relative">
          
          {/* 1. Al lado izquierdo: Mis Mascotas */}
          <button
            type="button"
            onClick={() => handleSelectCustomerTab('mascotas')}
            className={`flex flex-col items-center justify-center py-1 px-2 rounded-2xl transition-all active:scale-90 cursor-pointer ${
              activeCustomerTab === 'mascotas'
                ? 'text-[#0E8388]'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <div className="relative p-1">
              <Heart
                className={`w-5 h-5 transition-all ${
                  activeCustomerTab === 'mascotas'
                    ? 'fill-[#0E8388] text-[#0E8388] scale-110'
                    : 'text-slate-500'
                }`}
              />
              {activeCustomerTab === 'mascotas' && (
                <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-[#0E8388]" />
              )}
            </div>
            <span className={`text-[10px] tracking-tight mt-0.5 ${activeCustomerTab === 'mascotas' ? 'font-black' : 'font-semibold'}`}>
              Mis Mascotas
            </span>
          </button>

          {/* 2. Al centro: Botón grande para realizar una compra */}
          <div className="flex flex-col items-center -mt-6">
            <button
              type="button"
              onClick={() => handleSelectCustomerTab('tienda')}
              className={`w-14 h-14 rounded-full bg-gradient-to-tr from-[#0A3E40] via-[#0E8388] to-[#10B981] text-white flex items-center justify-center shadow-lg shadow-[#0E8388]/35 border-4 border-white transition-all transform hover:scale-105 active:scale-95 cursor-pointer relative group ${
                activeCustomerTab === 'tienda' ? 'ring-2 ring-[#0E8388]' : ''
              }`}
              aria-label="Realizar una compra"
              title="Realizar una compra"
            >
              <ShoppingBag className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#C86D39] text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow-xs animate-pulse">
                  {cartCount}
                </span>
              )}
            </button>
            <span
              className={`text-[10px] tracking-tight mt-1 ${
                activeCustomerTab === 'tienda'
                  ? 'font-black text-[#0E8388]'
                  : 'font-bold text-slate-700'
              }`}
            >
              Comprar
            </span>
          </div>

          {/* 3. Al lado derecho: Cuaderno Veterinario */}
          <button
            type="button"
            onClick={() => handleSelectCustomerTab('cuaderno')}
            className={`flex flex-col items-center justify-center py-1 px-2 rounded-2xl transition-all active:scale-90 cursor-pointer ${
              activeCustomerTab === 'cuaderno'
                ? 'text-[#0E8388]'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <div className="relative p-1">
              <Stethoscope
                className={`w-5 h-5 transition-all ${
                  activeCustomerTab === 'cuaderno'
                    ? 'text-[#0E8388] scale-110 stroke-[2.5]'
                    : 'text-slate-500'
                }`}
              />
              {activeCustomerTab === 'cuaderno' && (
                <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-[#0E8388]" />
              )}
            </div>
            <span className={`text-[10px] tracking-tight mt-0.5 ${activeCustomerTab === 'cuaderno' ? 'font-black' : 'font-semibold'}`}>
              Cuaderno Vet
            </span>
          </button>

        </div>
      </nav>
    );
  }

  // =========================================================================
  // VISTA GENERAL / INVITADO (5 BOTONES)
  // =========================================================================
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
