import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ArrowRight, User, CheckCircle2 } from 'lucide-react';

export default function LoginView({ onLoginSuccess }) {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState('login'); // 'login' | 'register' | 'recovery'

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [notice, setNotice] = useState(null);

  const showNotification = (msg) => {
    setNotice(msg);
    setTimeout(() => setNotice(null), 4000);
  };

  // 1-Tap Demo Shortcuts for Prototype
  const handleAdminDemo = () => {
    const adminUser = {
      name: 'Camila Silva',
      email: 'camila@patitasdelsur.cl',
      role: 'admin',
      petName: 'Kira 🐶',
      petType: 'perro',
      memberSince: 'Octubre 2026',
    };
    onLoginSuccess(adminUser);
    navigate('/admin');
  };

  const handleClientDemo = () => {
    const clientUser = {
      name: 'Felipe Soto',
      email: 'felipe@tutor.cl',
      role: 'cliente',
      petName: 'Jack 🐱',
      petType: 'gato',
      memberSince: 'Octubre 2026',
    };
    onLoginSuccess(clientUser);
    navigate('/mi-cuenta');
  };

  const handleLoginSubmit = (e) => {
    e.preventDefault();

    const cleanEmail = email.trim().toLowerCase();
    const isAdmin =
      cleanEmail.includes('admin') ||
      cleanEmail.includes('@patitasdelsur.cl') ||
      cleanEmail === 'camila';

    const userObj = {
      name: isAdmin ? 'Camila Silva' : cleanEmail ? cleanEmail.split('@')[0] : 'Cliente Tutor',
      email: cleanEmail || (isAdmin ? 'camila@patitasdelsur.cl' : 'cliente@patitasdelsur.cl'),
      role: isAdmin ? 'admin' : 'cliente',
      petName: isAdmin ? 'Kira 🐶' : 'Jack 🐱',
      petType: isAdmin ? 'perro' : 'gato',
      memberSince: 'Octubre 2026',
    };

    onLoginSuccess(userObj);

    if (isAdmin) {
      navigate('/admin');
    } else {
      navigate('/mi-cuenta');
    }
  };

  const handleRegisterSubmit = (e) => {
    e.preventDefault();

    const cleanEmail = email.trim().toLowerCase();
    const userObj = {
      name: fullName.trim() || 'Nuevo Tutor',
      email: cleanEmail || 'cliente@patitasdelsur.cl',
      role: 'cliente',
      petName: 'Mi Mascota 🐾',
      petType: 'perro',
      memberSince: 'Octubre 2026',
    };

    onLoginSuccess(userObj);
    navigate('/mi-cuenta');
  };

  const handleRecoverySubmit = (e) => {
    e.preventDefault();
    showNotification(`Te hemos enviado un enlace de recuperación a ${email || 'tu correo'}.`);
    setTimeout(() => {
      setViewMode('login');
    }, 2000);
  };

  return (
    <div className="min-h-dvh w-full bg-gradient-to-b from-[#093C3E] via-[#0E8388] to-[#072B2D] flex flex-col items-center justify-center p-6 select-none relative">
      
      {/* Toast Notificación */}
      {notice && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-slate-900/95 backdrop-blur-md text-white text-xs font-semibold px-4 py-3 rounded-2xl shadow-2xl border border-slate-700/80 flex items-center gap-2.5 animate-in fade-in slide-in-from-top-3">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{notice}</span>
        </div>
      )}

      {/* Contenedor central minimalista para móviles */}
      <div className="w-full max-w-sm flex flex-col items-center space-y-6 animate-in fade-in duration-300">
        
        {/* Botones superiores de prototipo: Administrador y Cliente */}
        <div className="w-full grid grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={handleAdminDemo}
            className="py-2.5 px-3 rounded-2xl bg-white/15 hover:bg-white/25 active:scale-95 text-white border border-white/20 backdrop-blur-md text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
          >
            <span>🛡️</span>
            <span>Administrador</span>
          </button>

          <button
            type="button"
            onClick={handleClientDemo}
            className="py-2.5 px-3 rounded-2xl bg-white/15 hover:bg-white/25 active:scale-95 text-white border border-white/20 backdrop-blur-md text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
          >
            <span>🐾</span>
            <span>Cliente</span>
          </button>
        </div>

        {/* Logo de la empresa */}
        <div className="bg-white p-3.5 sm:p-4 rounded-3xl shadow-2xl flex items-center justify-center transition-transform hover:scale-105">
          <img
            src="/images/logo_patitas_del_sur.svg"
            alt="Patitas del Sur"
            className="h-14 sm:h-16 w-auto object-contain"
          />
        </div>

        {/* ============================================================ */}
        {/* MODO 1: INICIAR SESIÓN (DEFAULT)                             */}
        {/* ============================================================ */}
        {viewMode === 'login' && (
          <form onSubmit={handleLoginSubmit} className="w-full space-y-4">
            {/* Campo Mail */}
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                <Mail className="w-5 h-5" />
              </div>
              <input
                type="email"
                required
                autoComplete="username"
                inputMode="email"
                placeholder="Correo electrónico"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-white text-slate-900 placeholder:text-slate-400 rounded-2xl text-sm font-semibold shadow-lg border border-white/50 focus:outline-hidden focus:ring-2 focus:ring-white transition-all"
              />
            </div>

            {/* Campo Contraseña */}
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                <Lock className="w-5 h-5" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="current-password"
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-12 pr-12 py-4 bg-white text-slate-900 placeholder:text-slate-400 rounded-2xl text-sm font-semibold shadow-lg border border-white/50 focus:outline-hidden focus:ring-2 focus:ring-white transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer p-1"
                title={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            {/* Botón de Ingresar */}
            <button
              type="submit"
              className="w-full py-4 rounded-2xl bg-[#062628] hover:bg-[#041a1b] active:scale-98 text-white font-black text-sm tracking-wide shadow-xl flex items-center justify-center gap-2 transition-all cursor-pointer mt-2"
            >
              <span>Ingresar</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {/* Los 2 botones formato texto */}
            <div className="flex flex-col items-center gap-2 pt-3">
              <button
                type="button"
                onClick={() => setViewMode('recovery')}
                className="text-xs text-white/80 hover:text-white transition-colors cursor-pointer font-medium hover:underline py-1"
              >
                ¿Olvidaste tu contraseña?
              </button>

              <button
                type="button"
                onClick={() => setViewMode('register')}
                className="text-xs text-white hover:text-emerald-100 font-bold transition-colors cursor-pointer hover:underline py-1"
              >
                Crear una cuenta nueva
              </button>
            </div>
          </form>
        )}

        {/* ============================================================ */}
        {/* MODO 2: CREAR UNA CUENTA NUEVA                              */}
        {/* ============================================================ */}
        {viewMode === 'register' && (
          <form onSubmit={handleRegisterSubmit} className="w-full space-y-4 animate-in fade-in duration-200">
            {/* Campo Nombre Completo */}
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                <User className="w-5 h-5" />
              </div>
              <input
                type="text"
                required
                placeholder="Nombre completo"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-white text-slate-900 placeholder:text-slate-400 rounded-2xl text-sm font-semibold shadow-lg border border-white/50 focus:outline-hidden focus:ring-2 focus:ring-white transition-all"
              />
            </div>

            {/* Campo Mail */}
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                <Mail className="w-5 h-5" />
              </div>
              <input
                type="email"
                required
                autoComplete="email"
                inputMode="email"
                placeholder="Correo electrónico"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-white text-slate-900 placeholder:text-slate-400 rounded-2xl text-sm font-semibold shadow-lg border border-white/50 focus:outline-hidden focus:ring-2 focus:ring-white transition-all"
              />
            </div>

            {/* Campo Contraseña */}
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                <Lock className="w-5 h-5" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="new-password"
                placeholder="Crear contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-12 pr-12 py-4 bg-white text-slate-900 placeholder:text-slate-400 rounded-2xl text-sm font-semibold shadow-lg border border-white/50 focus:outline-hidden focus:ring-2 focus:ring-white transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer p-1"
                title={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            {/* Botón de Registrarse */}
            <button
              type="submit"
              className="w-full py-4 rounded-2xl bg-[#062628] hover:bg-[#041a1b] active:scale-98 text-white font-black text-sm tracking-wide shadow-xl flex items-center justify-center gap-2 transition-all cursor-pointer mt-2"
            >
              <span>Registrarse</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {/* Botón texto para regresar */}
            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => setViewMode('login')}
                className="text-xs text-white hover:underline font-semibold cursor-pointer py-1"
              >
                ¿Ya tienes una cuenta? Iniciar sesión
              </button>
            </div>
          </form>
        )}

        {/* ============================================================ */}
        {/* MODO 3: RECUPERAR CONTRASEÑA                                */}
        {/* ============================================================ */}
        {viewMode === 'recovery' && (
          <form onSubmit={handleRecoverySubmit} className="w-full space-y-4 animate-in fade-in duration-200">
            <p className="text-xs text-white/90 text-center font-medium px-2 leading-relaxed">
              Ingresa tu correo registrado para enviarte un enlace de restablecimiento:
            </p>

            {/* Campo Mail */}
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                <Mail className="w-5 h-5" />
              </div>
              <input
                type="email"
                required
                autoComplete="email"
                inputMode="email"
                placeholder="Correo electrónico"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-white text-slate-900 placeholder:text-slate-400 rounded-2xl text-sm font-semibold shadow-lg border border-white/50 focus:outline-hidden focus:ring-2 focus:ring-white transition-all"
              />
            </div>

            {/* Botón de Enviar */}
            <button
              type="submit"
              className="w-full py-4 rounded-2xl bg-[#062628] hover:bg-[#041a1b] active:scale-98 text-white font-black text-sm tracking-wide shadow-xl flex items-center justify-center gap-2 transition-all cursor-pointer mt-2"
            >
              <span>Recuperar Contraseña</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {/* Botón texto para volver */}
            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => setViewMode('login')}
                className="text-xs text-white hover:underline font-semibold cursor-pointer py-1"
              >
                Volver a Iniciar sesión
              </button>
            </div>
          </form>
        )}

      </div>

    </div>
  );
}
