import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Send, Heart, ShieldCheck, Mail, MapPin, Phone, Share2, Globe } from 'lucide-react';
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
    <footer className="bg-slate-950 text-white pt-16 pb-12 border-t border-white/10 relative overflow-hidden">
      
      {/* Background Decorative Glow */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#0E8388]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#C86D39]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
        
        {/* Top Newsletter Card (Prepared for Brevo) */}
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
                  className="px-8 py-3.5 rounded-full bg-[#10B981] hover:bg-[#34D399] text-slate-950 font-extrabold text-sm transition-all shadow-lg shadow-[#10B981]/30 flex items-center justify-center gap-2 shrink-0 active:scale-95"
                >
                  <span>SUSCRIBIRME</span>
                  <Send className="w-4 h-4" />
                </button>
              </>
            )}
          </form>
        </div>

        {/* Main Footer Links */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-white/10 text-sm">
          
          {/* Col 1: Brand */}
          <div className="space-y-4">
            <Logo className="h-12" />
            <p className="text-slate-400 text-xs leading-relaxed">
              Alimentos y snacks para mascotas elaborados con salmón fresco, cordero patagónico e ingredientes 100% naturales procedentes del sur de Chile.
            </p>
            <div className="flex items-center gap-3 text-slate-400 pt-2">
              <a href="#instagram" className="p-2 rounded-full bg-slate-900 hover:text-emerald-400 transition-colors border border-white/10" aria-label="Instagram">
                <Share2 className="w-4 h-4" />
              </a>
              <a href="#facebook" className="p-2 rounded-full bg-slate-900 hover:text-emerald-400 transition-colors border border-white/10" aria-label="Sitio Web">
                <Globe className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Col 2: Navigation */}
          <div className="space-y-3">
            <h4 className="font-extrabold text-white uppercase text-xs tracking-wider">Navegación</h4>
            <ul className="space-y-2 text-slate-400">
              <li><Link to="/" className="hover:text-white transition-colors">Inicio (Portada 2 Cards)</Link></li>
              <li><Link to="/perros" className="hover:text-[#10B981] transition-colors">Catálogo Perros 🐶</Link></li>
              <li><Link to="/gatos" className="hover:text-[#C86D39] transition-colors">Catálogo Gatos 🐱</Link></li>
              <li><Link to="/nosotros" className="hover:text-white transition-colors">Sobre Nosotros</Link></li>
              <li><Link to="/contacto" className="hover:text-white transition-colors">Contacto & Consultas</Link></li>
            </ul>
          </div>

          {/* Col 3: Categorías */}
          <div className="space-y-3">
            <h4 className="font-extrabold text-white uppercase text-xs tracking-wider">Nutrición & Productos</h4>
            <ul className="space-y-2 text-slate-400">
              <li><span className="hover:text-white transition-colors cursor-pointer">Alimentos Grain Free</span></li>
              <li><span className="hover:text-white transition-colors cursor-pointer">Snacks 100% Deshidratados</span></li>
              <li><span className="hover:text-white transition-colors cursor-pointer">Suplementos Articulares</span></li>
              <li><span className="hover:text-white transition-colors cursor-pointer">Recetas Holísticas Felinas</span></li>
            </ul>
          </div>

          {/* Col 4: Contact & Tech Stack Badges */}
          <div className="space-y-3">
            <h4 className="font-extrabold text-white uppercase text-xs tracking-wider">Atención al Cliente</h4>
            <ul className="space-y-2 text-slate-400 text-xs">
              <li className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#10B981]" /> Puerto Varas & Santiago, Chile
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#0E8388]" /> contacto@patitasdelsur.cl
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#C86D39]" /> +56 9 8765 4321
              </li>
            </ul>

            {/* Architecture Badges */}
            <div className="pt-4 space-y-1.5">
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Stack Tecnológico 2026:</span>
              <div className="flex flex-wrap gap-1.5 text-[10px] font-mono">
                <span className="px-2 py-0.5 rounded bg-slate-900 border border-white/10 text-slate-300">Vercel Deploy</span>
                <span className="px-2 py-0.5 rounded bg-slate-900 border border-white/10 text-slate-300">Cloudflare DNS</span>
                <span className="px-2 py-0.5 rounded bg-slate-900 border border-white/10 text-slate-300">Supabase DB</span>
                <span className="px-2 py-0.5 rounded bg-slate-900 border border-white/10 text-slate-300">Brevo Mail</span>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 font-medium">
          <p>© 2026 Patitas del Sur SpA. Todos los derechos reservados.</p>
          <p className="flex items-center gap-1">
            Diseñado con <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500 inline" /> para el bienestar animal.
          </p>
        </div>

      </div>
    </footer>
  );
}
