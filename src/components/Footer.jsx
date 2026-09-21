import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Send, Heart, ShieldCheck, Mail, MapPin, Phone, Share2, Globe, MessageSquare } from 'lucide-react';
import Logo from './Logo';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const location = useLocation();

  // Hide footer on homepage, login page, customer dashboard, and admin dashboard
  if (
    location.pathname === '/' ||
    location.pathname === '/login' ||
    location.pathname === '/mi-cuenta' ||
    location.pathname.startsWith('/admin')
  ) {
    return null;
  }

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail('');
    }
  };

  return (
    <footer className="bg-slate-950 text-white pt-16 pb-28 md:pb-12 border-t border-white/10 relative overflow-hidden">
      
      {/* Background Decorative Glow */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#0E8388]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#C86D39]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
        
        {/* Top Newsletter Card */}
        <div className="mb-16 glass-panel-dark rounded-3xl p-8 md:p-12 border border-white/15 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-2 text-center md:text-left max-w-xl">
            <span className="inline-block px-3.5 py-1 rounded-full text-xs font-bold bg-[#10B981]/20 text-[#10B981] mb-2">
              Comunidad Patitas del Sur
            </span>
            <h3 className="text-2xl md:text-3xl font-black text-white">
              Recibe un 10% de descuento en tu primera compra
            </h3>
            <p className="text-slate-300 text-sm">
              Suscríbete a nuestro boletín para consejos veterinarios de nutrición natural y lanzamientos exclusivos.
            </p>
          </div>

          <form onSubmit={handleSubscribe} className="w-full md:w-auto flex flex-col sm:flex-row gap-3">
            {subscribed ? (
              <div className="px-6 py-3.5 rounded-full bg-[#10B981]/20 text-[#10B981] font-bold text-sm border border-[#10B981]/40 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5" />
                ¡Gracias por suscribirte! Te enviamos tu cupón a tu e-mail.
              </div>
            ) : (
              <>
                <input
                  type="email"
                  required
                  placeholder="Tu correo electrónico..."
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="px-6 py-3.5 rounded-full bg-slate-900 border border-white/20 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-[#10B981] w-full sm:w-72"
                />
                <button
                  type="submit"
                  className="px-8 py-3.5 rounded-full bg-[#10B981] hover:bg-[#34D399] text-slate-950 font-extrabold text-sm transition-all shadow-lg shadow-[#10B981]/30 flex items-center justify-center gap-2 shrink-0 active:scale-95 cursor-pointer"
                >
                  <span>SUSCRIBIRME</span>
                  <Send className="w-4 h-4" />
                </button>
              </>
            )}
          </form>
        </div>

        {/* Main Footer Links: Reorganized 3-Column Premium Layout */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 lg:gap-12 pb-12 border-b border-white/10 text-sm">
          
          {/* Col 1: Brand & Patagonia Identity (Span 5) */}
          <div className="md:col-span-5 space-y-4">
            <Logo className="h-12" />
            <p className="text-slate-400 text-xs leading-relaxed max-w-sm">
              Alimentos y snacks para mascotas elaborados con salmón fresco, cordero patagónico e ingredientes 100% naturales procedentes del sur de Chile.
            </p>
            <div className="flex flex-wrap gap-2 pt-1 text-[11px] font-bold text-slate-400">
              <span className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10">100% Natural</span>
              <span className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10">Libre de Granos</span>
              <span className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10">Salmón Austral</span>
            </div>
            <div className="flex items-center gap-3 text-slate-400 pt-2">
              <a
                href="#instagram"
                className="p-2.5 rounded-full bg-slate-900 hover:text-emerald-400 hover:border-emerald-500/30 transition-all border border-white/10 shadow-xs"
                aria-label="Instagram"
              >
                <Share2 className="w-4 h-4" />
              </a>
              <a
                href="#facebook"
                className="p-2.5 rounded-full bg-slate-900 hover:text-emerald-400 hover:border-emerald-500/30 transition-all border border-white/10 shadow-xs"
                aria-label="Sitio Web"
              >
                <Globe className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Col 2: Navegación Rápida Reorganizada (Span 3) */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="font-extrabold text-white uppercase text-xs tracking-wider flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
              <span>Navegación</span>
            </h4>
            <ul className="space-y-2.5 text-slate-400 text-xs font-semibold">
              <li>
                <Link to="/" className="hover:text-white hover:translate-x-1 inline-flex items-center gap-1.5 transition-all">
                  <span>Portada</span>
                </Link>
              </li>
              <li>
                <Link to="/perros" className="hover:text-[#10B981] hover:translate-x-1 inline-flex items-center gap-1.5 transition-all">
                  <span>Catálogo Perros 🐶</span>
                </Link>
              </li>
              <li>
                <Link to="/gatos" className="hover:text-[#C86D39] hover:translate-x-1 inline-flex items-center gap-1.5 transition-all">
                  <span>Catálogo Gatos 🐱</span>
                </Link>
              </li>
              <li>
                <Link to="/nosotros" className="hover:text-white hover:translate-x-1 inline-flex items-center gap-1.5 transition-all">
                  <span>Sobre Nosotros</span>
                </Link>
              </li>
              <li>
                <Link to="/contacto" className="hover:text-white hover:translate-x-1 inline-flex items-center gap-1.5 transition-all">
                  <span>Contacto & Consultas</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Atención al Cliente Rediseñada (Span 4) */}
          <div className="md:col-span-4">
            <div className="glass-panel-dark rounded-2xl p-5 border border-white/10 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-extrabold text-white uppercase text-xs tracking-wider flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#0E8388]" />
                  <span>Atención al Cliente</span>
                </h4>
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  En línea
                </span>
              </div>

              <ul className="space-y-2.5 text-xs text-slate-300">
                <li className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                    <MapPin className="w-3.5 h-3.5 text-[#10B981]" />
                  </div>
                  <span>Puerto Varas & Santiago, Chile</span>
                </li>
                <li>
                  <a
                    href="mailto:contacto@patitasdelsur.cl"
                    className="flex items-center gap-2.5 hover:text-emerald-400 transition-colors group"
                  >
                    <div className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0 group-hover:border-emerald-500/40 transition-colors">
                      <Mail className="w-3.5 h-3.5 text-[#0E8388]" />
                    </div>
                    <span className="truncate">contacto@patitasdelsur.cl</span>
                  </a>
                </li>
                <li>
                  <a
                    href="tel:+56987654321"
                    className="flex items-center gap-2.5 hover:text-[#C86D39] transition-colors group"
                  >
                    <div className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0 group-hover:border-[#C86D39]/40 transition-colors">
                      <Phone className="w-3.5 h-3.5 text-[#C86D39]" />
                    </div>
                    <span>+56 9 8765 4321</span>
                  </a>
                </li>
              </ul>

              {/* Botón directo de WhatsApp / Ayuda */}
              <a
                href="https://wa.me/56987654321"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#10B981]/20 to-[#0E8388]/20 hover:from-[#10B981] hover:to-[#0E8388] text-emerald-300 hover:text-white border border-[#10B981]/40 font-bold text-xs transition-all shadow-md group cursor-pointer"
              >
                <MessageSquare className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
                <span>Escríbenos por WhatsApp</span>
              </a>
            </div>
          </div>

        </div>

        {/* Bottom copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 font-medium">
          <p>© 2026 Comercial Kira SpA. Todos los derechos reservados.</p>
          <p className="flex items-center gap-1.5 flex-wrap justify-center">
            Diseñado con <Heart className="w-3.5 h-3.5 text-orange-500 fill-orange-500 inline shrink-0" /> por{' '}
            <span className="text-orange-500 font-bold">Orange Design</span> para el bienestar animal.
          </p>
        </div>

      </div>
    </footer>
  );
}
