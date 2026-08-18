import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, User, ArrowRight, ShieldCheck, Sparkles, Heart, CheckCircle2, ArrowLeft } from 'lucide-react';
import Logo from '../components/Logo';

export default function LoginView({ onLoginSuccess }) {
  const navigate = useNavigate();
  const [authMode, setAuthMode] = useState('login'); // 'login' or 'register'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [petName, setPetName] = useState('');
  const [petType, setPetType] = useState('perro');

  const handleSubmit = (e) => {
    e.preventDefault();

    // Free access: any email and password works!
    const userObj = {
      name: fullName || (email ? email.split('@')[0] : 'Camila Silva'),
      email: email || 'camila@patitasdelsur.cl',
      petName: petName || 'Kira 🐶',
      petType: petType,
      memberSince: 'Agosto 2026',
    };

    onLoginSuccess(userObj);
    navigate('/mi-cuenta');
  };

  const handleQuickDemo = () => {
    const demoUser = {
      name: 'Camila Silva',
      email: 'camila@patitasdelsur.cl',
      petName: 'Kira 🐶',
      petType: 'perro',
      memberSince: 'Agosto 2026',
    };

    onLoginSuccess(demoUser);
    navigate('/mi-cuenta');
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] pt-24 pb-16 px-4 flex items-center justify-center">
      <div className="max-w-4xl w-full bg-white rounded-3xl shadow-2xl border border-slate-200/80 overflow-hidden grid grid-cols-1 md:grid-cols-12 animate-in fade-in duration-500">
        
        {/* Left Side: Hero Brand Showcase */}
        <div className="md:col-span-5 bg-gradient-to-br from-[#0A3E40] via-[#0E8388] to-[#10B981] p-8 md:p-12 text-white flex flex-col justify-between relative overflow-hidden">
          <div className="relative z-10 space-y-6">
            <Link to="/" className="inline-flex items-center gap-2 text-xs font-black text-emerald-200 hover:text-white transition-colors bg-white/10 px-3 py-1.5 rounded-full backdrop-blur-md">
              <ArrowLeft className="w-4 h-4" />
              <span>Volver al sitio web</span>
            </Link>

            <div className="space-y-3 pt-4">
              <span className="px-3.5 py-1 rounded-full text-xs font-black bg-emerald-400/20 text-emerald-300 border border-emerald-400/30 uppercase tracking-wider">
                Club Patitas del Sur 🐾
              </span>
              <h2 className="text-3xl font-black tracking-tight leading-tight">
                Panel Personal de Clientes
              </h2>
              <p className="text-xs text-emerald-100/90 leading-relaxed font-medium">
                Accede a tus compras, seguimiento de envíos en tiempo real, suscripciones mensuales y la ficha de nutrición de tu mascota.
              </p>
            </div>

            <div className="space-y-2.5 pt-4 text-xs font-bold text-emerald-100">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Descuento de 10% en tu primera compra</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Calculadora de ración guardada para tu mascota</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Envío prioritario a todo Chile</span>
              </div>
            </div>
          </div>

          <div className="relative z-10 pt-8 border-t border-white/20 text-[11px] font-semibold text-emerald-200/80 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-300" />
            <span>Acceso Seguro Liberado (Ingresa cualquier credencial)</span>
          </div>

          {/* Decorative Background Circles */}
          <div className="absolute -bottom-16 -right-16 w-64 h-64 rounded-full bg-white/10 blur-2xl pointer-events-none" />
        </div>

        {/* Right Side: Credentials Form */}
        <div className="md:col-span-7 p-8 md:p-12 flex flex-col justify-center space-y-6">
          
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-xl font-black text-slate-900">
                {authMode === 'login' ? 'Iniciar Sesión' : 'Crear Cuenta'}
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                {authMode === 'login' ? 'Ingresa tu correo y contraseña:' : 'Completa tus datos:'}
              </p>
            </div>
            <Logo className="h-8" />
          </div>

          {/* Tab Switcher */}
          <div className="flex items-center bg-slate-100 p-1 rounded-2xl border border-slate-200">
            <button
              type="button"
              onClick={() => setAuthMode('login')}
              className={`flex-1 py-2 rounded-xl text-xs font-black transition-all ${
                authMode === 'login'
                  ? 'bg-white text-[#0E8388] shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Iniciar Sesión
            </button>
            <button
              type="button"
              onClick={() => setAuthMode('register')}
              className={`flex-1 py-2 rounded-xl text-xs font-black transition-all ${
                authMode === 'register'
                  ? 'bg-white text-[#0E8388] shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Crear Cuenta
            </button>
          </div>

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
                  placeholder="ejemplo@correo.cl"
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
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                  Acceso Libre Activo
                </span>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="password"
                  required
                  placeholder="Cualquier contraseña funciona"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-hidden focus:border-[#0E8388] focus:bg-white transition-all"
                />
              </div>
            </div>

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

            {/* Primary Action CTA */}
            <button
              type="submit"
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#0E8388] to-[#0A3E40] text-white font-black text-sm hover:shadow-lg hover:scale-[1.01] active:scale-95 transition-all shadow-md flex items-center justify-center gap-2 mt-2"
            >
              <span>{authMode === 'login' ? 'Entrar a Mi Panel Personal 🐾' : 'Crear mi Cuenta 🐾'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {/* Demo Instant Button */}
            <button
              type="button"
              onClick={handleQuickDemo}
              className="w-full py-2.5 rounded-xl border border-dashed border-[#0E8388]/40 bg-[#0E8388]/10 text-[#0E8388] hover:bg-[#0E8388] hover:text-white font-bold text-xs transition-all flex items-center justify-center gap-1.5"
            >
              <span>⚡ O presiona aquí para entrar como Cliente Demo Rápido</span>
            </button>

          </form>

        </div>

      </div>
    </div>
  );
}
