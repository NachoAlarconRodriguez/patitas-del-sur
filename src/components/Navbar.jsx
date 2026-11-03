import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingBag, Search, Menu, X, ArrowLeft, User, LogOut, ChevronDown, Shield } from 'lucide-react';
import Logo from './Logo';
import { PRODUCTS } from '../data/mockData';
import { fetchProductsFromSupabase } from '../services/productsService';
import { getHiddenProductIdentifiers, isProductHidden } from '../utils/productVisibility';

export default function Navbar({ cartCount = 0, onOpenCart, user, onOpenAuthModal, onLogout, onSelectProduct }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [availableProducts, setAvailableProducts] = useState(PRODUCTS);
  
  const userMenuRef = useRef(null);
  const searchInputRef = useRef(null);
  const searchContainerRef = useRef(null);
  const navContainerRef = useRef(null);
  const location = useLocation();

  // Close menus when switching routes
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsSearchOpen(false);
  }, [location.pathname]);

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
        searchInputRef.current?.focus();
        setIsSearchOpen(true);
      } else if (e.key === 'Escape') {
        if (isSearchOpen) {
          setIsSearchOpen(false);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSearchOpen]);

  // Synchronize available products with Supabase
  useEffect(() => {
    let isMounted = true;
    const syncProducts = async () => {
      try {
        const prods = await fetchProductsFromSupabase();
        if (isMounted && prods && prods.length > 0) {
          setAvailableProducts(prods);
        }
      } catch (err) {
        console.warn('Navbar: error syncing products from Supabase:', err);
      }
    };

    syncProducts();
    window.addEventListener('patitas_products_updated', syncProducts);
    return () => {
      isMounted = false;
      window.removeEventListener('patitas_products_updated', syncProducts);
    };
  }, []);

  // Search filter effect
  useEffect(() => {
    if (searchQuery.trim().length > 1) {
      const q = searchQuery.toLowerCase();
      const hidden = getHiddenProductIdentifiers();
      const filtered = availableProducts.filter((p) => {
        if (isProductHidden(p, hidden)) return false;
        return (
          (p.name && p.name.toLowerCase().includes(q)) ||
          (p.tagline && p.tagline.toLowerCase().includes(q)) ||
          (p.category && p.category.toLowerCase().includes(q)) ||
          (p.petType && p.petType.toLowerCase().includes(q)) ||
          (p.brand && p.brand.toLowerCase().includes(q)) ||
          (p.ingredients && p.ingredients.some((ing) => ing.toLowerCase().includes(q)))
        );
      });
      setSearchResults(filtered);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery, availableProducts]);

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

  // Base navigation links - Categorías comerciales limpias y sin emojis
  const allNavLinks = [
    { name: 'Perros', path: '/perros' },
    { name: 'Gatos', path: '/gatos' },
    { name: 'Nosotros', path: '/nosotros' },
  ];

  const navLinks = allNavLinks;

  const isActive = (path) => location.pathname === path;

  return (
    <>
      {/* Main Navigation Header Capsule - Siempre visible y translúcida */}
      <header className="fixed top-0 left-0 right-0 z-50 px-3 py-2.5 sm:px-6 sm:py-3 md:px-8 md:py-4 transition-all duration-300 ease-out pointer-events-none translate-y-0 opacity-100">
        <div
          ref={navContainerRef}
          className="relative max-w-7xl mx-auto bg-white/85 backdrop-blur-xl rounded-2xl md:rounded-full px-3 sm:px-6 py-2 sm:py-2.5 flex items-center justify-between gap-2 sm:gap-3 shadow-md shadow-slate-900/[0.04] border border-slate-200/80 pointer-events-auto transition-all"
        >

          {/* Left Side: Brand Logo & Back to Home */}
          <div className="relative z-10 flex items-center gap-2 shrink-0">
            {location.pathname !== '/' && (
              <Link
                to="/"
                className="p-1.5 sm:p-2 rounded-full hover:bg-amber-50 text-slate-700 transition-colors flex items-center gap-1 text-xs font-bold"
                title="Volver a la portada"
              >
                <ArrowLeft className="w-4 h-4 text-[#D97706]" />
                <span className="hidden lg:inline">Portada</span>
              </Link>
            )}
            
            <Link
              to="/"
              className="flex items-center gap-2 group transition-transform hover:scale-[1.02]"
              title="Patitas del Sur - Inicio"
            >
              <Logo className="h-8 sm:h-9 md:h-10" variant="amber" />
            </Link>
          </div>

          {/* Center-Left: Desktop Navigation Links (Apple-Style Segmented Control) */}
          <nav className="relative z-10 hidden md:flex items-center gap-1 bg-slate-900/[0.04] p-1 rounded-full border border-slate-900/[0.06] backdrop-blur-md shrink-0">
            {navLinks.map((link) => {
              const active = isActive(link.path);
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`relative px-4 py-1.5 rounded-full text-xs font-bold tracking-tight transition-all duration-200 select-none flex items-center gap-1.5 ${
                    active
                      ? 'bg-white text-[#1D1D1F] shadow-[0_2px_8px_rgba(0,0,0,0.08)] ring-1 ring-black/[0.04]'
                      : 'text-slate-600 hover:text-[#1D1D1F] hover:bg-white/60'
                  }`}
                >
                  <span>{link.name}</span>
                  {active && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#F5BA13] animate-pulse" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Center-Right: Large Prominent Keyword Search Bar (Barra amplia de búsqueda) */}
          <div ref={searchContainerRef} className="relative z-10 flex-1 max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg hidden sm:block">
            <div className="relative flex items-center w-full rounded-full bg-white/80 hover:bg-white focus-within:bg-white border border-slate-200/90 focus-within:border-[#F5BA13] focus-within:ring-2 focus-within:ring-[#F5BA13]/25 transition-all shadow-2xs px-3.5 py-1.5 sm:py-2">
              <Search className="w-4 h-4 text-[#D97706] shrink-0 mr-2" />
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
                        if (onSelectProduct) onSelectProduct(product);
                      }}
                      className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-amber-50/70 transition-all cursor-pointer group"
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
                              ? 'bg-[#F5BA13]/20 text-[#78350F]'
                              : 'bg-[#D97706]/15 text-[#92400E]'
                          }`}>
                            {product.petType}
                          </span>
                          <span className="text-[10px] text-slate-400 font-bold truncate">{product.brand}</span>
                        </div>
                        <div className="text-xs font-bold text-slate-800 group-hover:text-[#D97706] transition-colors truncate">
                          {product.name}
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-xs font-black text-[#D97706]">{formatCLP(product.price)}</span>
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
          <div className="relative z-10 flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Mobile search toggle on very small screens */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(true)}
              className="sm:hidden p-2 rounded-full bg-white/80 hover:bg-amber-50 text-slate-700 border border-slate-200 cursor-pointer"
              title="Buscar"
            >
              <Search className="w-4 h-4 text-[#D97706]" />
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
                  className="flex items-center gap-1 sm:gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-full bg-amber-50 text-[#78350F] border border-[#F5BA13]/40 hover:bg-[#F5BA13] hover:text-[#1D1D1F] font-extrabold text-xs shadow-2xs transition-all active:scale-95 cursor-pointer"
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
                      <div className="text-[10px] font-bold text-amber-600 truncate">Mascota: {user.petName}</div>
                    </div>
                    <Link
                      to="/mi-cuenta"
                      onClick={() => {
                        setIsUserMenuOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 text-xs font-bold text-slate-700 hover:bg-amber-50 rounded-xl transition-colors mt-1 flex items-center gap-2"
                    >
                      <User className="w-3.5 h-3.5 text-[#D97706]" />
                      <span>Mi Panel Personal</span>
                    </Link>
                    <Link
                      to="/admin"
                      onClick={() => {
                        setIsUserMenuOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 text-xs font-bold text-slate-700 hover:bg-amber-50 rounded-xl transition-colors mt-1 flex items-center gap-2"
                    >
                      <Shield className="w-3.5 h-3.5 text-amber-600" />
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
                className="flex items-center gap-1.5 px-2.5 py-1.5 sm:px-4 sm:py-2 rounded-full border border-slate-300/80 bg-white/90 hover:bg-[#F5BA13] hover:text-[#1D1D1F] hover:border-[#F5BA13] text-slate-800 font-bold text-xs shadow-2xs transition-all active:scale-95"
              >
                <User className="w-3.5 h-3.5 text-[#D97706]" />
                <span className="hidden sm:inline">Iniciar Sesión</span>
              </Link>
            )}

            {/* Cart Trigger Button - Apple Charcoal Pill with Golden Amber Accent */}
            <button
              onClick={onOpenCart}
              aria-label="Ver carrito"
              className="relative flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-full bg-[#1D1D1F] hover:bg-black text-white font-medium text-xs sm:text-sm transition-all shadow-md hover:shadow-black/20 active:scale-95 cursor-pointer border border-white/10"
            >
              <ShoppingBag className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#F5BA13]" />
              <span className="hidden sm:inline font-bold">Carrito</span>
              {cartCount > 0 && (
                <span className="bg-[#F5BA13] text-[#1D1D1F] text-[10px] sm:text-xs font-black w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center shadow-xs">
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
        </div>

        {/* Mobile Menu Dropdown */}
        {isMobileMenuOpen && (
          <div className="md:hidden fixed inset-x-4 top-20 z-50 glass-panel-dark rounded-3xl p-5 shadow-2xl border border-white/20 animate-in fade-in slide-in-from-top-4 duration-300 pointer-events-auto max-h-[80vh] overflow-y-auto">
            {/* Mobile Search Input */}
            <div className="relative flex items-center gap-2 bg-slate-900/80 border border-white/20 rounded-2xl px-4 py-2.5 mb-3 focus-within:border-[#F5BA13]/60 transition-colors">
              <Search className="w-4 h-4 text-[#F5BA13] shrink-0" />
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
                              ? 'bg-amber-400/20 text-amber-300'
                              : 'bg-orange-400/20 text-orange-300'
                          }`}>
                            {product.petType}
                          </span>
                          <span className="text-[10px] text-slate-400 font-bold truncate">{product.brand}</span>
                        </div>
                        <div className="text-xs font-bold text-white truncate">{product.name}</div>
                        <div className="text-[11px] font-black text-[#F5BA13]">{formatCLP(product.price)}</div>
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
              <Link
                to="/"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`px-4 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center justify-between ${
                  isActive('/')
                    ? 'bg-[#F5BA13] text-[#1D1D1F] font-black shadow-lg shadow-[#F5BA13]/30'
                    : 'text-slate-200 hover:bg-white/10 hover:text-[#F5BA13]'
                }`}
              >
                <span>Portada</span>
                <span className="text-xs opacity-60">➔</span>
              </Link>
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                  }}
                  className={`px-4 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center justify-between ${
                    isActive(link.path)
                      ? 'bg-[#F5BA13] text-[#1D1D1F] font-black shadow-lg shadow-[#F5BA13]/30'
                      : 'text-slate-200 hover:bg-white/10 hover:text-[#F5BA13]'
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
