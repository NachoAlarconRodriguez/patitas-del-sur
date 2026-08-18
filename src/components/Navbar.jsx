import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingBag, Search, Menu, X, ArrowLeft, User, LogOut, ChevronDown } from 'lucide-react';
import Logo from './Logo';

export default function Navbar({ cartCount = 0, onOpenCart, user, onOpenAuthModal, onLogout }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);
  const location = useLocation();

  // Close user menu on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // If on homepage, login page, customer account page, or admin dashboard, do not render the top navbar capsule at all
  if (
    location.pathname === '/' ||
    location.pathname === '/login' ||
    location.pathname === '/mi-cuenta' ||
    location.pathname.startsWith('/admin')
  ) {
    return null;
  }

  const navLinks = [
    { name: 'Inicio', path: '/' },
    { name: 'Perros 🐶', path: '/perros' },
    { name: 'Gatos 🐱', path: '/gatos' },
    { name: 'Nosotros', path: '/nosotros' },
    { name: 'Contacto', path: '/contacto' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-4 py-3 md:px-8 md:py-4 transition-all duration-300">
      <div className="max-w-7xl mx-auto glass-panel rounded-2xl md:rounded-full px-5 py-3 flex items-center justify-between shadow-2xl border border-white/40">
        
        {/* Brand Logo & Back to Home */}
        <div className="flex items-center gap-3">
          <Link
            to="/"
            className="p-2 rounded-full hover:bg-slate-100 text-slate-700 transition-colors flex items-center gap-1 text-xs font-bold"
            title="Volver a la portada"
          >
            <ArrowLeft className="w-4 h-4 text-[#0E8388]" />
            <span className="hidden sm:inline">Portada</span>
          </Link>
          
          <Link to="/" className="flex items-center gap-2 group transition-transform hover:scale-[1.02]">
            <Logo className="h-9 md:h-11" />
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-900/5 p-1 rounded-full border border-slate-900/10 backdrop-blur-md">
          {navLinks.map((link) => {
            const active = isActive(link.path);
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all duration-300 ${
                  active
                    ? 'bg-[#0E8388] text-white shadow-md shadow-[#0E8388]/30 scale-[1.03]'
                    : 'text-slate-700 hover:text-[#0E8388] hover:bg-white/60'
                }`}
              >
                {link.name}
              </Link>
            );
          })}
        </nav>

        {/* Right Action Icons */}
        <div className="flex items-center gap-3">
          
          {/* User Auth Button */}
          {user ? (
            <div
              ref={userMenuRef}
              className="relative group"
            >
              <button
                type="button"
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-[#0E8388]/15 text-[#0E8388] border border-[#0E8388]/30 hover:bg-[#0E8388] hover:text-white font-extrabold text-xs shadow-xs transition-all active:scale-95 cursor-pointer"
                title="Opciones de Cuenta"
                aria-expanded={isUserMenuOpen}
              >
                <User className="w-4 h-4" />
                <span className="hidden sm:inline">Hola, {user.name.split(' ')[0]} 🐾</span>
                <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${isUserMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Menu with Hover Bridge */}
              <div
                className={`absolute right-0 top-full pt-1.5 w-52 z-50 transition-all duration-200 ${
                  isUserMenuOpen ? 'block opacity-100 scale-100 pointer-events-auto' : 'hidden group-hover:block opacity-100 scale-100 pointer-events-auto'
                }`}
              >
                <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-2 animate-in fade-in slide-in-from-top-1 duration-150">
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
              className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-slate-300/80 bg-white/90 hover:bg-slate-100 text-slate-800 font-bold text-xs shadow-xs transition-all active:scale-95"
            >
              <User className="w-4 h-4 text-[#0E8388]" />
              <span>Iniciar Sesión</span>
            </Link>
          )}

          {/* Cart Trigger */}
          <button
            onClick={onOpenCart}
            aria-label="Ver carrito"
            className="relative flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900 text-white font-medium text-sm hover:bg-[#10B981] transition-all shadow-lg hover:shadow-[#10B981]/30 active:scale-95"
          >
            <ShoppingBag className="w-4 h-4 text-emerald-400" />
            <span className="hidden sm:inline font-semibold">Carrito</span>
            {cartCount > 0 && (
              <span className="bg-[#C86D39] text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center animate-pulse">
                {cartCount}
              </span>
            )}
          </button>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-full text-slate-800 hover:bg-white/80 transition-all"
            aria-label="Abrir menú"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-x-4 top-20 z-50 glass-panel-dark rounded-3xl p-6 shadow-2xl border border-white/20 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex flex-col gap-3">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`px-5 py-3 rounded-xl font-bold text-base transition-all ${
                  isActive(link.path)
                    ? 'bg-[#10B981] text-white shadow-lg'
                    : 'text-slate-200 hover:bg-white/10 hover:text-emerald-400'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
