import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { COMPANY_INFO } from '../constants';
import { WhatsAppIcon } from './OfficialIcons';

export default function Footer() {
  const location = useLocation();

  // Hide footer on login page, customer dashboard, and admin dashboard
  if (
    location.pathname === '/login' ||
    location.pathname === '/mi-cuenta' ||
    location.pathname.startsWith('/admin')
  ) {
    return null;
  }

  return (
    <div className="kibo-page kibo-foot-shell">
      <footer className="foot">
        <div className="foot__row">
          <p className="foot__claim">
            Que nunca le falte <span>su comida preferida.</span>
          </p>
          <nav className="foot__links" aria-label="Pie">
            <Link to="/politicas-de-privacidad">Privacidad</Link>
            <Link to="/politicas-de-despacho">Despachos</Link>
            <Link to="/terminos-y-condiciones">Términos y condiciones</Link>
            <Link to="/cambios-y-devoluciones">Cambios y devoluciones</Link>
            <Link to="/nosotros">Nosotros</Link>
          </nav>
          <div className="foot__social">
            <a
              className="foot__ico"
              href={COMPANY_INFO.instagramUrl || 'https://instagram.com/patitasdelsur.cl'}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="2" y="2" width="20" height="20" rx="5" />
                <circle cx="12" cy="12" r="4" />
                <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
              </svg>
            </a>
            <a
              className="foot__ico"
              href={COMPANY_INFO.whatsappUrl || 'https://wa.me/56953332492'}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="WhatsApp"
            >
              <WhatsAppIcon className="w-5 h-5" colored={false} />
            </a>
          </div>
        </div>

        <div className="foot__stage">
          <Link
            className="foot__wm"
            to="/"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            aria-label="Patitas del Sur, volver al inicio"
          >
            patitas
          </Link>
          <div className="foot__dogs in" data-reveal="dogs">
            <img
              src="/images/mascotas-fila.png?v=2"
              alt="Perros y gatos de Patitas del Sur"
              width="2010"
              height="687"
              loading="lazy"
              decoding="async"
            />
          </div>
        </div>

        <div className="foot__legal">
          <span>© 2026 Patitas del Sur · Comercial Kira SpA</span>
          <p style={{ margin: 0, display: 'inline-flex', alignItems: 'center', gap: '5px', minHeight: '44px' }}>
            Desarrollado con{' '}
            <svg
              viewBox="0 0 24 24"
              width="14"
              height="14"
              fill="#F97316"
              aria-label="cariño"
              style={{ display: 'inline-block', flexShrink: 0 }}
            >
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>{' '}
            por{' '}
            <a
              href="https://www.orangedesign.cl"
              target="_blank"
              rel="noopener noreferrer"
              style={{ fontWeight: 800, color: '#F97316' }}
            >
              Orange Design
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
