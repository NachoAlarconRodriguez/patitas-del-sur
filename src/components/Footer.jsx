import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Heart, Globe, Mail } from 'lucide-react';
import Logo from './Logo';
import { COMPANY_INFO } from '../constants';
import { WhatsAppIcon, InstagramIcon, FacebookIcon } from './OfficialIcons';
import ClubPatitasBanner from './ClubPatitasBanner';

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

  const socialBtnStyle =
    'w-11 h-11 rounded-full bg-white/5 hover:bg-amber-500 hover:text-slate-950 text-slate-300 border border-white/10 hover:border-amber-400 flex items-center justify-center transition-all duration-200 active:scale-95 shadow-xs cursor-pointer';

  const legalBtnStyle =
    'px-3.5 py-2 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border border-white/10 text-xs font-semibold transition-all duration-200';

  return (
    <footer className="bg-slate-950 text-white pt-12 pb-24 md:pb-12 border-t border-white/10 relative overflow-hidden">
      {/* Background Decorative Glow */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#F5BA13]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#D97706]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10 space-y-10">
        {/* Banner de Invitación al Club Patitas */}
        <div>
          <ClubPatitasBanner />
        </div>

        {/* Footer Minimalista en 1 Sola Fila: Logo (izq), Botones Legales (centro), Redes (der) */}
        <div className="pt-6 flex flex-col lg:flex-row items-center justify-between gap-5 border-t border-white/10">
          {/* 1. Logo Oficial */}
          <Link to="/" className="cursor-pointer transition-opacity hover:opacity-90 shrink-0">
            <Logo className="h-9 sm:h-10" variant="light" />
          </Link>

          {/* 2. Botones de Información Legal (Al centro en la misma línea) */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            <Link to="/politicas-de-privacidad" className={legalBtnStyle}>
              Políticas de Privacidad
            </Link>
            <Link to="/terminos-y-condiciones" className={legalBtnStyle}>
              Términos y Condiciones
            </Link>
            <Link to="/politicas-de-despacho" className={legalBtnStyle}>
              Políticas de Despacho
            </Link>
            <Link to="/cambios-y-devoluciones" className={legalBtnStyle}>
              Garantía Legal & Devoluciones
            </Link>
          </div>

          {/* 3. Iconos de Redes y Contacto (A la derecha) */}
          <div className="flex items-center gap-2 shrink-0">
            <a
              href={COMPANY_INFO.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={socialBtnStyle}
              aria-label="WhatsApp"
              title="Escríbenos por WhatsApp"
            >
              <WhatsAppIcon className="w-4 h-4" colored={false} />
            </a>

            <Link to="/" className={socialBtnStyle} aria-label="Sitio Web Oficial" title="Sitio Web">
              <Globe className="w-4 h-4" />
            </Link>

            <a
              href="https://instagram.com/patitasdelsur.cl"
              target="_blank"
              rel="noopener noreferrer"
              className={socialBtnStyle}
              aria-label="Instagram"
              title="Instagram Oficial"
            >
              <InstagramIcon className="w-4 h-4" />
            </a>

            <a
              href="https://facebook.com/patitasdelsur"
              target="_blank"
              rel="noopener noreferrer"
              className={socialBtnStyle}
              aria-label="Facebook"
              title="Facebook Oficial"
            >
              <FacebookIcon className="w-4 h-4" />
            </a>

            <a
              href={`mailto:${COMPANY_INFO.email}`}
              className={socialBtnStyle}
              aria-label="Correo Electrónico"
              title="contacto@patitasdelsur.cl"
            >
              <Mail className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Bottom copyright y créditos */}
        <div className="pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 font-medium text-center sm:text-left">
          <p>© {new Date().getFullYear()} Patitas del Sur®. Comercial Kira SpA.</p>
          <p className="flex items-center gap-1.5 justify-center text-slate-400">
            Diseñado con <Heart className="w-3.5 h-3.5 text-orange-500 fill-orange-500 inline shrink-0" /> por{' '}
            <span className="text-orange-500 font-bold">Orange Design</span> para el bienestar animal.
          </p>
        </div>
      </div>
    </footer>
  );
}
