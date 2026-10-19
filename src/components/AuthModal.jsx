import React, { useState } from 'react';
import { X, User, Lock, Mail, ShieldCheck, ArrowRight, Smartphone } from 'lucide-react';
import Logo from './Logo';

export default function AuthModal({ isOpen, onClose, onLoginSuccess }) {
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'register'
  const [selectedRole, setSelectedRole] = useState('cliente'); // 'cliente' | 'admin'
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

    const isDomainAdmin =
      email && (email.toLowerCase().includes('admin') || email.toLowerCase().includes('@patitasdelsur.cl'));
    const finalRole = selectedRole === 'admin' || isDomainAdmin ? 'admin' : 'cliente';

    const userObj = {
      name:
        fullName ||
        (email ? email.split('@')[0] : finalRole === 'admin' ? 'Camila Silva' : 'Felipe Soto'),
      email: email || (finalRole === 'admin' ? 'camila@patitasdelsur.cl' : 'felipe@tutor.cl'),
      role: finalRole,
      petName: petName || (finalRole === 'admin' ? 'Kira 🐶' : 'Jack 🐶'),
      petType: petType,
      memberSince: 'Agosto 2026',
    };

    setTimeout(() => {
      onLoginSuccess(userObj);
      setSuccessMsg(false);
      onClose();
    }, 700);
  };

  const handleDemoAdmin = () => {
    setSuccessMsg(true);
    const demoAdmin = {
      name: 'Camila Silva',
      email: 'camila@patitasdelsur.cl',
      role: 'admin',
      petName: 'Kira 🐶',
      petType: 'perro',
      memberSince: 'Agosto 2026',
    };
    setTimeout(() => {
      onLoginSuccess(demoAdmin);
      setSuccessMsg(false);
      onClose();
    }, 600);
  };

  const handleDemoClient = () => {
    setSuccessMsg(true);
    const demoClient = {
      name: 'Felipe Soto',
      email: 'felipe@tutor.cl',
      role: 'cliente',
      petName: 'Jack 🐶',
      petType: 'perro',
      memberSince: 'Julio 2026',
    };
    setTimeout(() => {
      onLoginSuccess(demoClient);
      setSuccessMsg(false);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md animate-in fade-in duration-300">
      
      {/* Modal Container */}
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200/80 overflow-hidden animate-in zoom-in-95 duration-300">
        
        {/* Header Bar */}
        <div className="p-5 bg-gradient-to-r from-[#E6F4F1] via-[#FAF9F5] to-[#CBE5E1] border-b border-slate-200/60 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Logo className="h-10 sm:h-12" />
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/80 hover:bg-white text-slate-700 flex items-center justify-center shadow-xs transition-transform active:scale-95 cursor-pointer"
            aria-label="Cerrar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-4">
          
          {/* Dual Role Selector Capsules */}
          <div className="space-y-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
              Rol de Acceso PWA:
            </span>
            <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-100 rounded-2xl border border-slate-200/80">
              <button
                type="button"
                onClick={() => setSelectedRole('cliente')}
                className={`py-2 px-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  selectedRole === 'cliente'
                    ? 'bg-white text-[#0E8388] shadow-xs border border-slate-200/60'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>🐾</span>
                <span>Cliente / Tutor</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedRole('admin')}
                className={`py-2 px-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  selectedRole === 'admin'
                    ? 'bg-[#0A3E40] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>🛡️</span>
                <span>Administrador</span>
              </button>
            </div>
          </div>

          {/* Tab Selector: Iniciar Sesión / Crear Cuenta */}
          <div className="flex items-center bg-slate-50 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setAuthMode('login')}
              className={`flex-1 py-1.5 rounded-lg text-xs font-black transition-all ${
                authMode === 'login'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Iniciar Sesión
            </button>
            <button
              onClick={() => setAuthMode('register')}
              className={`flex-1 py-1.5 rounded-lg text-xs font-black transition-all ${
                authMode === 'register'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Crear Cuenta
            </button>
          </div>

          {/* Success Banner */}
          {successMsg ? (
            <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-2 animate-in fade-in duration-300">
              <div className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto text-lg font-black shadow-xs">
                ✓
              </div>
              <h4 className="text-sm font-black text-emerald-900">
                ¡Bienvenido a Patitas del Sur! 🐾
              </h4>
              <p className="text-xs text-emerald-700 font-medium">
                Iniciando sesión en tu panel PWA...
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3">
              
              {authMode === 'register' && (
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-700 uppercase tracking-wider">
                    Nombre Completo
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      required
                      placeholder={selectedRole === 'admin' ? 'Ej. Camila Silva' : 'Ej. Felipe Soto'}
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-hidden focus:border-[#0E8388] focus:bg-white transition-all"
                    />
                  </div>
                </div>
              )}

              {/* Email */}
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-700 uppercase tracking-wider">
                  Correo Electrónico
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    required
                    placeholder={selectedRole === 'admin' ? 'camila@patitasdelsur.cl' : 'felipe@tutor.cl'}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-hidden focus:border-[#0E8388] focus:bg-white transition-all"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-700 uppercase tracking-wider">
                  Contraseña (Cualquiera es válida)
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-hidden focus:border-[#0E8388] focus:bg-white transition-all"
                  />
                </div>
              </div>

              {authMode === 'register' && selectedRole === 'cliente' && (
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-700 uppercase tracking-wider">
                    Nombre de tu Mascota
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Ej. Jack / Kira"
                      value={petName}
                      onChange={(e) => setPetName(e.target.value)}
                      className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-hidden focus:border-[#0E8388] focus:bg-white transition-all"
                    />
                    <select
                      value={petType}
                      onChange={(e) => setPetType(e.target.value)}
                      className="px-2 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-hidden"
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
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#0E8388] to-[#0A3E40] text-white font-black text-xs hover:shadow-lg hover:scale-[1.01] active:scale-95 transition-all shadow-md flex items-center justify-center gap-2 mt-1 cursor-pointer"
              >
                <span>
                  {selectedRole === 'admin'
                    ? 'Acceder como Administrador 🛡️'
                    : 'Acceder como Cliente 🐾'}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>

              {/* Demo Quick Access Buttons */}
              <div className="pt-2 border-t border-slate-100 space-y-1.5">
                <span className="text-[10px] font-bold text-slate-400 block text-center uppercase tracking-wider">
                  Acceso Demo Directo:
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={handleDemoAdmin}
                    className="p-2 rounded-xl border border-teal-200 bg-teal-50/70 hover:bg-teal-100/80 text-slate-800 text-left transition-all flex items-center gap-2 cursor-pointer active:scale-95"
                  >
                    <span className="text-sm">🛡️</span>
                    <div className="min-w-0">
                      <div className="text-[11px] font-black text-teal-900 truncate">Admin Demo</div>
                      <div className="text-[9px] text-teal-700 truncate">Despachos</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={handleDemoClient}
                    className="p-2 rounded-xl border border-emerald-200 bg-emerald-50/70 hover:bg-emerald-100/80 text-slate-800 text-left transition-all flex items-center gap-2 cursor-pointer active:scale-95"
                  >
                    <span className="text-sm">🐾</span>
                    <div className="min-w-0">
                      <div className="text-[11px] font-black text-emerald-900 truncate">Cliente Demo</div>
                      <div className="text-[9px] text-emerald-700 truncate">Tutor Jack</div>
                    </div>
                  </button>
                </div>
              </div>

            </form>
          )}

          {/* Footer Security Guarantee */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-center gap-2 text-[10px] font-semibold text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>Acceso Seguro PWA Patitas del Sur</span>
          </div>

        </div>

      </div>

    </div>
  );
}
