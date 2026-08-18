import React, { useState } from 'react';
import { X, User, Lock, Mail, Heart, Sparkles, CheckCircle2, ShieldCheck, ArrowRight } from 'lucide-react';
import Logo from './Logo';

export default function AuthModal({ isOpen, onClose, onLoginSuccess }) {
  const [authMode, setAuthMode] = useState('login'); // 'login' or 'register'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [petName, setPetName] = useState('');
  const [petType, setPetType] = useState('perro');
  const [successMsg, setSuccessMsg] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setSuccessMsg(true);

    const userObj = {
      name: fullName || (email ? email.split('@')[0] : 'Camila Silva'),
      email: email || 'camila@patitasdelsur.cl',
      petName: petName || 'Kira 🐶',
      petType: petType,
    };

    setTimeout(() => {
      onLoginSuccess(userObj);
      setSuccessMsg(false);
      onClose();
    }, 1000);
  };

  const handleDemoLogin = () => {
    setSuccessMsg(true);
    const demoUser = {
      name: 'Camila Silva',
      email: 'camila@patitasdelsur.cl',
      petName: 'Kira 🐶',
      petType: 'perro',
    };

    setTimeout(() => {
      onLoginSuccess(demoUser);
      setSuccessMsg(false);
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md animate-in fade-in duration-300">
      
      {/* Modal Container */}
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200/80 overflow-hidden animate-in zoom-in-95 duration-300">
        
        {/* Header Bar */}
        <div className="p-6 bg-gradient-to-r from-[#E6F4F1] via-[#FAF9F5] to-[#CBE5E1] border-b border-slate-200/60 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Logo className="h-9" />
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/80 hover:bg-white text-slate-700 flex items-center justify-center shadow-xs transition-transform active:scale-95"
            aria-label="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 md:p-8 space-y-6">
          
          {/* Tab Selector */}
          <div className="flex items-center bg-slate-100 p-1 rounded-2xl border border-slate-200">
            <button
              onClick={() => setAuthMode('login')}
              className={`flex-1 py-2.5 rounded-xl text-xs font-black transition-all ${
                authMode === 'login'
                  ? 'bg-white text-[#0E8388] shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Iniciar Sesión
            </button>
            <button
              onClick={() => setAuthMode('register')}
              className={`flex-1 py-2.5 rounded-xl text-xs font-black transition-all ${
                authMode === 'register'
                  ? 'bg-white text-[#0E8388] shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Crear Cuenta
            </button>
          </div>

          {/* Success Banner */}
          {successMsg ? (
            <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-3 animate-in fade-in duration-300">
              <div className="w-12 h-12 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto text-xl font-black shadow-md">
                ✓
              </div>
              <h4 className="text-base font-black text-emerald-900">
                ¡Bienvenido a Patitas del Sur! 🐾
              </h4>
              <p className="text-xs text-emerald-700 font-medium">
                Sesión iniciada con éxito. Redirigiendo a tu perfil...
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {authMode === 'register' && (
                <div className="space-y-1">
                  <label className="text-xs font-black text-slate-700 uppercase tracking-wider">
                    Nombre Completo
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      required
                      placeholder="Ej. Camila Silva"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-hidden focus:border-[#0E8388] focus:bg-white transition-all"
                    />
                  </div>
                </div>
              )}

              {/* Email */}
              <div className="space-y-1">
                <label className="text-xs font-black text-slate-700 uppercase tracking-wider">
                  Correo Electrónico
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    required
                    placeholder="tu@correo.cl"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-hidden focus:border-[#0E8388] focus:bg-white transition-all"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-black text-slate-700 uppercase tracking-wider">
                    Contraseña
                  </label>
                  {authMode === 'login' && (
                    <a href="#forgot" onClick={(e) => e.preventDefault()} className="text-[11px] font-bold text-[#0E8388] hover:underline">
                      ¿Olvidaste tu clave?
                    </a>
                  )}
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-hidden focus:border-[#0E8388] focus:bg-white transition-all"
                  />
                </div>
              </div>

              {/* Pet Name field in Register mode */}
              {authMode === 'register' && (
                <div className="space-y-1 pt-1">
                  <label className="text-xs font-black text-slate-700 uppercase tracking-wider">
                    Nombre de tu Mascota
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Ej. Kira / Jack"
                      value={petName}
                      onChange={(e) => setPetName(e.target.value)}
                      className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-hidden focus:border-[#0E8388] focus:bg-white transition-all"
                    />
                    <select
                      value={petType}
                      onChange={(e) => setPetType(e.target.value)}
                      className="px-3 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-black focus:outline-hidden"
                    >
                      <option value="perro">🐶 Perro</option>
                      <option value="gato">🐱 Gato</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Primary Submit Button */}
              <button
                type="submit"
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#0E8388] to-[#0A3E40] text-white font-black text-sm hover:shadow-lg hover:scale-[1.01] active:scale-95 transition-all shadow-md flex items-center justify-center gap-2 mt-2"
              >
                <span>{authMode === 'login' ? 'Iniciar Sesión 🐾' : 'Crear mi Cuenta 🐾'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              {/* Quick Demo Login Option */}
              {authMode === 'login' && (
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleDemoLogin}
                    className="w-full py-2.5 rounded-xl border border-dashed border-[#0E8388]/40 bg-[#0E8388]/10 text-[#0E8388] hover:bg-[#0E8388] hover:text-white font-bold text-xs transition-all flex items-center justify-center gap-1.5"
                  >
                    <span>⚡ Iniciar Rápido como Cliente Demo (Camila & Kira)</span>
                  </button>
                </div>
              )}

            </form>
          )}

          {/* Footer Security Guarantee */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-center gap-2 text-[11px] font-bold text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Tus datos están protegidos con encriptación SSL de 256 bits</span>
          </div>

        </div>

      </div>

    </div>
  );
}
