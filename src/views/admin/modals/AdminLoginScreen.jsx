import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Shield, AlertTriangle, Mail, Lock } from 'lucide-react';
import SEOHead from '../../../components/SEOHead';

/**
 * Pantalla de autenticación del Panel de Administración
 */
export default function AdminLoginScreen({
  adminEmail,
  setAdminEmail,
  adminPassword,
  setAdminPassword,
  authError,
  onSubmit,
}) {
  return (
    <div className="finset-admin min-h-screen bg-[#F8FAFC] text-[#111827] flex items-center justify-center p-4 relative overflow-hidden font-sans">
      <SEOHead title="Acceso Administración" canonical="/admin" noindex={true} />
      {/* Subtle FinSet Ambient Glow */}
      <div className="absolute top-1/4 -left-24 w-96 h-96 rounded-full bg-[#FDE68A]/35 blur-[110px] pointer-events-none" />
      <div className="absolute bottom-1/4 -right-24 w-96 h-96 rounded-full bg-[#D97706]/10 blur-[110px] pointer-events-none" />

      <div className="max-w-md w-full relative z-10">
        <div className="mb-6 flex items-center justify-between">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-[#D97706] transition-colors bg-white border border-[#EAECEF] px-4 py-2 rounded-full shadow-2xs"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-[#D97706]" />
            <span>Volver a la tienda</span>
          </Link>

          <span className="text-[11px] font-bold text-[#D97706] bg-[#FEF3C7] border border-[#FDE68A] px-3 py-1 rounded-full">
            Acceso restringido
          </span>
        </div>

        <div className="finset-card bg-white border border-[#EAECEF] rounded-3xl p-8 sm:p-10 space-y-6">
          <div className="text-center space-y-3">
            <div className="w-14 h-14 rounded-full bg-[#1D1D1F] mx-auto flex items-center justify-center shadow-sm">
              <Shield className="w-7 h-7 text-[#FDE68A]" />
            </div>
            <h1 className="text-2xl sm:text-[26px] font-extrabold text-[#111827] tracking-tight">
              Panel de administración
            </h1>
            <p className="text-xs text-slate-400 font-medium leading-relaxed">
              Control central de operaciones, pedidos, clientes CRM, convenios y finanzas de Patitas del Sur.
            </p>
          </div>

          {authError && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{authError}</span>
            </div>
          )}

          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                Correo de administrador
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  placeholder="admin@patitasdelsur.cl"
                  className="w-full pl-10 pr-4 py-3 rounded-2xl bg-[#F8FAFC] border border-[#EAECEF] text-[#111827] text-sm focus:outline-none focus:bg-white transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                Contraseña de seguridad
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-4 py-3 rounded-2xl bg-[#F8FAFC] border border-[#EAECEF] text-[#111827] text-sm focus:outline-none focus:bg-white transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-full bg-[#D97706] hover:bg-[#B45309] text-white font-bold text-xs shadow-sm shadow-[#D97706]/25 transition-all cursor-pointer active:scale-98 mt-2"
            >
              Iniciar sesión
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
