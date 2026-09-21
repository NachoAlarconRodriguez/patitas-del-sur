import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingBag, Search, Menu, X, ArrowLeft, User, LogOut, ChevronDown, ChevronUp, Shield } from 'lucide-react';
import Logo from './Logo';
import { PRODUCTS } from '../data/mockData';

export default function Navbar({ cartCount = 0, onOpenCart, user, onOpenAuthModal, onLogout, onSelectProduct }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isHomeBarExpanded, setIsHomeBarExpanded] = useState(false);
  
  const userMenuRef = useRef(null);
  const searchInputRef = useRef(null);
  const searchContainerRef = useRef(null);
  const navContainerRef = useRef(null);
  const triggerPillRef = useRef(null);
  const location = useLocation();

  const isHomePage = location.pathname === '/';

  // Collapse home bar when switching routes
  useEffect(() => {
    setIsHomeBarExpanded(false);
    setIsMobileMenuOpen(false);
    setIsSearchOpen(false);
  }, [location.pathname]);

  // Click outside listener to collapse home bar on homepage
  useEffect(() => {
    if (!isHomePage || !isHomeBarExpanded) return;

    const handleHomeClickOutside = (event) => {
      if (
        navContainerRef.current &&
        !navContainerRef.current.contains(event.target) &&
        triggerPillRef.current &&
        !triggerPillRef.current.contains(event.target)
      ) {
        setIsHomeBarExpanded(false);
        setIsSearchOpen(false);
      }
    };

    document.addEventListener('mousedown', handleHomeClickOutside);
    return () => document.removeEventListener('mousedown', handleHomeClickOutside);
  }, [isHomePage, isHomeBarExpanded]);

  // Close search dropdown on outside click
  useEffect(() => {
    const handleSearchClickOutside = (event) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleSearchClickOutside);
    return () => document.removeEventListener('mousedown', handleSearchClickOutside);
  }, []);

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

  // Keyboard shortcut (Cmd+K / Ctrl+K) to focus search & Esc to close
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isHomePage && !isHomeBarExpanded) {
          setIsHomeBarExpanded(true);
        }
        setTimeout(() => {
          searchInputRef.current?.focus();
          setIsSearchOpen(true);
        }, 100);
      } else if (e.key === 'Escape') {
        if (isSearchOpen) {
          setIsSearchOpen(false);
        } else if (isHomePage && isHomeBarExpanded) {
          setIsHomeBarExpanded(false);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSearchOpen, isHomePage, isHomeBarExpanded]);

  // Search filter effect
  useEffect(() => {
    if (searchQuery.trim().length > 1) {
      const q = searchQuery.toLowerCase();
      const filtered = PRODUCTS.filter((p) =>
        p.name.toLowerCase().includes(q) ||
        p.tagline.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.petType.toLowerCase().includes(q) ||
        (p.ingredients && p.ingredients.some((ing) => ing.toLowerCase().includes(q)))
      );
      setSearchResults(filtered);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  // Format currency
  const formatCLP = (price) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      maximumFractionDigits: 0,
    }).format(price);
  };

  // If on login page, customer account page, or admin dashboard, do not render the top navbar capsule
  if (
    location.pathname === '/login' ||
    location.pathname === '/mi-cuenta' ||
    location.pathname.startsWith('/admin')
  ) {
    return null;
  }

  // Base navigation links
  const allNavLinks = [
    { name: 'Inicio', path: '/' },
    { name: 'Perros 🐶', path: '/perros' },
    { name: 'Gatos 🐱', path: '/gatos' },
    { name: 'Nosotros', path: '/nosotros' },
    { name: 'Contacto', path: '/contacto' },
  ];

  // En la pantalla de inicio se eliminan Perros y Gatos de la barra de arriba (porque toda la pantalla ya es Kira y Jack)
  const navLinks = isHomePage
    ? allNavLinks.filter((link) => link.path !== '/perros' && link.path !== '/gatos')
    : allNavLinks;

  const isActive = (path) => location.pathname === path;

  return (
    <>
      {/* Mobile-Style Pull-Down Floating Tab (Only on Homepage when collapsed) */}
      {isHomePage && (
        <div
          ref={triggerPillRef}
          className={`fixed top-0 left-1/2 -translate-x-1/2 z-50 transition-all duration-500 ease-out ${
            isHomeBarExpanded ? '-translate-y-full opacity-0 pointer-events-none' : 'translate-y-0 opacity-100 pointer-events-auto'
          }`}
        >
          <button
            type="button"
            onClick={() => setIsHomeBarExpanded(true)}
            className="group flex items-center gap-2 sm:gap-3 px-4 sm:px-6 py-2 rounded-b-2xl bg-white/95 backdrop-blur-xl border-b-2 border-x border-white shadow-xl shadow-slate-900/10 hover:shadow-2xl hover:bg-white text-slate-800 transition-all duration-300 active:scale-95 cursor-pointer select-none"
            title="Toca para desplegar la barra de navegación"
            aria-label="Desplegar menú"
          >
            {/* Status light / indicator */}
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#10B981] opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#10B981]" />
            </span>

            {/* Mini Brand Isotype */}
            <img
              src="/images/logo_patitas_del_sur.svg"
              alt="Patitas del Sur"
              className="h-4 sm:h-5 w-auto object-contain group-hover:scale-105 transition-transform"
            />

            <span className="text-xs font-black tracking-tight text-slate-800 group-hover:text-[#0E8388] transition-colors">
              Menú
            </span>

            {/* Cart indicator if items exist */}
            {cartCount > 0 && (
              <span className="bg-[#C86D39] text-white text-[10px] font-black px-1.5 py-0.2 rounded-full">
                {cartCount}
              </span>
            )}

            {/* Mobile pull-down arrow */}
            <ChevronDown className="w-3.5 h-3.5 text-[#0E8388] group-hover:translate-y-0.5 transition-transform duration-200" />
          </button>
        </div>
      )}

      {/* Main Navigation Header Capsule */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 px-3 py-2.5 sm:px-6 sm:py-3 md:px-8 md:py-4 transition-all duration-500 ease-out pointer-events-none ${
          isHomePage
            ? isHomeBarExpanded
              ? 'translate-y-0 opacity-100'
              : '-translate-y-36 opacity-0'
            : 'translate-y-0 opacity-100'
        }`}
      >
        <div
          ref={navContainerRef}
          className="relative max-w-7xl mx-auto glass-panel rounded-2xl md:rounded-full px-4 sm:px-6 py-2 sm:py-2.5 flex items-center justify-between gap-3 shadow-xl border border-white/60 pointer-events-auto"
        >
          {/* Left Side: Brand Logo & Back to Home */}
          <div className="flex items-center gap-2 shrink-0">
            {location.pathname !== '/' && (
              <Link
                to="/"
                className="p-1.5 sm:p-2 rounded-full hover:bg-slate-100 text-slate-700 transition-colors flex items-center gap-1 text-xs font-bold"
                title="Volver a la portada"
              >
                <ArrowLeft className="w-4 h-4 text-[#0E8388]" />
                <span className="hidden lg:inline">Portada</span>
              </Link>
            )}
            
            <Link
              to="/"
              onClick={() => isHomePage && setIsHomeBarExpanded(false)}
              className="flex items-center gap-2 group transition-transform hover:scale-[1.02]"
            >
              <Logo className="h-8 sm:h-9 md:h-10" />
            </Link>
          </div>

          {/* Center-Left: Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-900/5 p-1 rounded-full border border-slate-900/10 backdrop-blur-md shrink-0">
            {navLinks.map((link) => {
              const active = isActive(link.path);
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => isHomePage && setIsHomeBarExpanded(false)}
                  className={`px-3.5 sm:px-4 py-1.5 rounded-full text-xs font-bold transition-all duration-300 ${
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

          {/* Center-Right: Large Prominent Keyword Search Bar (Barra amplia de búsqueda) */}
          <div ref={searchContainerRef} className="relative flex-1 max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg hidden sm:block">
            <div className="relative flex items-center w-full rounded-full bg-white/80 hover:bg-white focus-within:bg-white border border-slate-200/90 focus-within:border-[#0E8388] focus-within:ring-2 focus-within:ring-[#0E8388]/20 transition-all shadow-2xs px-3.5 py-1.5 sm:py-2">
              <Search className="w-4 h-4 text-[#0E8388] shrink-0 mr-2" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Buscar por alimento, snack, salmón, ingrediente..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setIsSearchOpen(true);
                }}
                onFocus={() => {
                  if (searchQuery.trim().length > 1) setIsSearchOpen(true);
                }}
                className="w-full bg-transparent text-xs font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-none"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setIsSearchOpen(false);
                  }}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded-full cursor-pointer shrink-0"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
              <kbd className="hidden lg:inline text-[9px] bg-slate-100 text-slate-400 px-1.5 py-0.5 rounded border border-slate-200 font-mono shrink-0 ml-1">
                ⌘K
              </kbd>
            </div>

            {/* Live Search Results Dropdown anchored directly below the search bar */}
            {isSearchOpen && searchQuery.trim().length > 1 && (
              <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl shadow-2xl border border-slate-200/90 p-2 z-50 max-h-80 overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-150">
                {searchResults.length > 0 ? (
                  searchResults.map((product) => (
                    <div
                      key={product.id}
                      onClick={() => {
                        setIsSearchOpen(false);
                        if (isHomePage) setIsHomeBarExpanded(false);
                        if (onSelectProduct) onSelectProduct(product);
                      }}
                      className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-emerald-50/70 transition-all cursor-pointer group"
                    >
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-10 h-10 object-contain rounded-lg bg-slate-50 p-1 border border-slate-100 shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className={`text-[9px] font-black uppercase px-1.5 py-0.2 rounded-full ${
                            product.petType === 'perros'
                              ? 'bg-[#0E8388]/15 text-[#0E8388]'
                              : 'bg-[#C86D39]/15 text-[#C86D39]'
                          }`}>
                            {product.petType}
                          </span>
                          <span className="text-[10px] text-slate-400 font-bold truncate">{product.brand}</span>
                        </div>
                        <div className="text-xs font-bold text-slate-800 group-hover:text-[#0E8388] transition-colors truncate">
                          {product.name}
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-xs font-black text-[#0E8388]">{formatCLP(product.price)}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-xs text-slate-400">
                    No encontramos resultados para "{searchQuery}"
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Action Icons (User, Cart, Mobile Search trigger, Mobile Menu) */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Mobile search toggle on very small screens */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(true)}
              className="sm:hidden p-2 rounded-full bg-white/80 hover:bg-slate-100 text-slate-700 border border-slate-200 cursor-pointer"
              title="Buscar"
            >
              <Search className="w-4 h-4 text-[#0E8388]" />
            </button>

            {/* User Auth Button */}
            {user ? (
              <div
                ref={userMenuRef}
                className="relative group"
              >
                <button
                  type="button"
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-1 sm:gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-full bg-[#0E8388]/15 text-[#0E8388] border border-[#0E8388]/30 hover:bg-[#0E8388] hover:text-white font-extrabold text-xs shadow-2xs transition-all active:scale-95 cursor-pointer"
                  title="Opciones de Cuenta"
                  aria-expanded={isUserMenuOpen}
                >
                  <User className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span className="truncate max-w-[70px] sm:max-w-[100px] md:max-w-[110px]">Hola, {user.name.split(' ')[0]} 🐾</span>
                  <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Menu with Hover Bridge */}
                <div
                  className={`absolute right-0 top-full pt-1.5 w-56 z-50 transition-all duration-200 ${
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
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        if (isHomePage) setIsHomeBarExpanded(false);
                      }}
                      className="w-full text-left px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 rounded-xl transition-colors mt-1 flex items-center gap-2"
                    >
                      <User className="w-3.5 h-3.5 text-[#0E8388]" />
                      <span>Mi Panel Personal</span>
                    </Link>
                    <Link
                      to="/admin"
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        if (isHomePage) setIsHomeBarExpanded(false);
                      }}
                      className="w-full text-left px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 rounded-xl transition-colors mt-1 flex items-center gap-2"
                    >
                      <Shield className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Panel Administrador</span>
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
                onClick={() => isHomePage && setIsHomeBarExpanded(false)}
                className="flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full border border-slate-300/80 bg-white/90 hover:bg-[#0E8388] hover:text-white hover:border-[#0E8388] text-slate-800 font-bold text-xs shadow-2xs transition-all active:scale-95"
              >
                <User className="w-3.5 h-3.5 text-[#0E8388]" />
                <span className="hidden sm:inline">Iniciar Sesión</span>
              </Link>
            )}

            {/* Cart Trigger Button */}
            <button
              onClick={onOpenCart}
              aria-label="Ver carrito"
              className="relative flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-slate-900 text-white font-medium text-xs sm:text-sm hover:bg-[#10B981] transition-all shadow-md hover:shadow-[#10B981]/30 active:scale-95 cursor-pointer"
            >
              <ShoppingBag className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400" />
              <span className="hidden sm:inline font-semibold">Carrito</span>
              {cartCount > 0 && (
                <span className="bg-[#C86D39] text-white text-[10px] sm:text-xs font-bold w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center animate-pulse">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-full text-slate-800 hover:bg-white/80 transition-all cursor-pointer"
              aria-label="Abrir menú"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

          {/* Quick Collapse Button Handle (Only on Homepage when expanded) */}
          {isHomePage && isHomeBarExpanded && (
            <button
              type="button"
              onClick={() => setIsHomeBarExpanded(false)}
              className="absolute -bottom-3.5 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-white/95 border border-slate-200/90 shadow-md text-slate-500 hover:text-slate-900 hover:bg-slate-100 text-[10px] font-extrabold flex items-center gap-1 transition-all active:scale-95 cursor-pointer backdrop-blur-md"
              title="Plegar barra de navegación"
            >
              <ChevronUp className="w-3 h-3 text-[#0E8388]" />
              <span>Plegar</span>
            </button>
          )}
        </div>

        {/* Mobile Menu Dropdown */}
        {isMobileMenuOpen && (
          <div className="md:hidden fixed inset-x-4 top-20 z-50 glass-panel-dark rounded-3xl p-5 shadow-2xl border border-white/20 animate-in fade-in slide-in-from-top-4 duration-300 pointer-events-auto max-h-[80vh] overflow-y-auto">
            {/* Mobile Search Input */}
            <div className="relative flex items-center gap-2 bg-slate-900/80 border border-white/20 rounded-2xl px-4 py-2.5 mb-3">
              <Search className="w-4 h-4 text-[#10B981] shrink-0" />
              <input
                type="text"
                placeholder="Buscar por alimento, snack, salmón..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent text-white text-sm focus:outline-none placeholder:text-slate-400"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="p-1 text-slate-400 hover:text-white cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Mobile Search Results */}
            {searchQuery.trim().length > 1 && (
              <div className="bg-slate-900/90 rounded-2xl border border-white/15 p-2 mb-3 max-h-60 overflow-y-auto space-y-1">
                {searchResults.length > 0 ? (
                  searchResults.map((product) => (
                    <div
                      key={product.id}
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        setSearchQuery('');
                        if (isHomePage) setIsHomeBarExpanded(false);
                        if (onSelectProduct) onSelectProduct(product);
                      }}
                      className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
                    >
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-10 h-10 object-contain rounded-lg bg-white/10 p-1 shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className={`text-[9px] font-black uppercase px-1.5 py-0.2 rounded-full ${
                            product.petType === 'perros'
                              ? 'bg-[#0E8388]/30 text-[#4DE1D0]'
                              : 'bg-[#C86D39]/30 text-[#FDBA74]'
                          }`}>
                            {product.petType}
                          </span>
                          <span className="text-[10px] text-slate-400 font-bold truncate">{product.brand}</span>
                        </div>
                        <div className="text-xs font-bold text-white truncate">{product.name}</div>
                        <div className="text-[11px] font-black text-emerald-400">{formatCLP(product.price)}</div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 text-xs text-slate-400 font-semibold">
                    No se encontraron productos para "{searchQuery}"
                  </div>
                )}
              </div>
            )}

            <div className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    if (isHomePage) setIsHomeBarExpanded(false);
                  }}
                  className={`px-4 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center justify-between ${
                    isActive(link.path)
                      ? 'bg-[#10B981] text-slate-950 font-black shadow-lg shadow-[#10B981]/25'
                      : 'text-slate-200 hover:bg-white/10 hover:text-emerald-400'
                  }`}
                >
                  <span>{link.name}</span>
                  <span className="text-xs opacity-60">➔</span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </header>
    </>
  );
}
