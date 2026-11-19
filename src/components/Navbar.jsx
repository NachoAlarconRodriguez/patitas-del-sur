import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function Navbar({ cartCount = 0, onOpenCart, user }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  // Close mobile menu when switching routes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // Handle Escape key and body scroll lock for mobile menu
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMobileMenuOpen]);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  // Do not render on login, customer account, or admin dashboard
  if (
    location.pathname === '/login' ||
    location.pathname === '/mi-cuenta' ||
    location.pathname.startsWith('/admin')
  ) {
    return null;
  }

  const isActive = (path) => location.pathname === path;

  return (
    <div className="kibo-page kibo-nav-shell">
      {/* Shared SVG Symbol (#i-paw) for the navbar */}
      <svg width="0" height="0" aria-hidden="true" focusable="false" style={{ position: 'absolute' }}>
        <symbol id="i-paw" viewBox="0 0 24 24">
          <g fill="currentColor">
            <ellipse cx="12" cy="16.2" rx="5.2" ry="4.4" />
            <ellipse cx="5.4" cy="10.4" rx="2.1" ry="2.6" transform="rotate(-20 5.4 10.4)" />
            <ellipse cx="9.5" cy="6.3" rx="2.2" ry="2.8" transform="rotate(-8 9.5 6.3)" />
            <ellipse cx="14.5" cy="6.3" rx="2.2" ry="2.8" transform="rotate(8 14.5 6.3)" />
            <ellipse cx="18.6" cy="10.4" rx="2.1" ry="2.6" transform="rotate(20 18.6 10.4)" />
          </g>
        </symbol>
      </svg>

      <header className="kibo-nav is-floating" data-open={isMobileMenuOpen ? 'true' : 'false'}>
        <Link
          className="nav__logo"
          to="/"
          aria-label="Patitas del Sur, inicio"
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <svg className="paw" viewBox="0 0 24 24" aria-hidden="true">
            <use href="#i-paw" />
          </svg>
          <span>patitas del sur</span>
        </Link>

        <nav
          className="nav__links"
          id="global-nav-links"
          aria-label="Principal"
          onClick={(e) => {
            if (e.target.closest('a')) setIsMobileMenuOpen(false);
          }}
        >
          <Link to="/" className={isActive('/') ? 'is-active' : ''}>
            Inicio
          </Link>
          <Link to="/perros" className={isActive('/perros') ? 'is-active' : ''}>
            Perros
          </Link>
          <Link to="/gatos" className={isActive('/gatos') ? 'is-active' : ''}>
            Gatos
          </Link>
          <Link
            to={user ? (user.role === 'admin' ? '/admin' : '/mi-cuenta') : '/login'}
            className={isActive('/login') || isActive('/mi-cuenta') ? 'is-active' : ''}
          >
            {user ? user.name?.split(' ')[0] || 'Mi Cuenta' : 'Ingresar'}
          </Link>
        </nav>

        <div className="nav__actions">
          <button
            type="button"
            onClick={onOpenCart}
            className="nav__cta btn btn--ink"
            aria-label="Abrir carrito"
          >
            {cartCount > 0 ? `Carrito (${cartCount})` : 'Pedir ahora'}
          </button>
          <button
            className="nav__burger"
            type="button"
            aria-expanded={isMobileMenuOpen ? 'true' : 'false'}
            aria-controls="global-nav-links"
            aria-label={isMobileMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
            onClick={() => setIsMobileMenuOpen((prev) => !prev)}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </header>
    </div>
  );
}
