import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ArrowRight, User, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { getCustomerProfile, upsertCustomerProfile } from '../services/customersService';

export default function LoginView({ onLoginSuccess }) {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState('login'); // 'login' | 'register' | 'recovery'

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [notice, setNotice] = useState(null);
  const [unconfirmedEmail, setUnconfirmedEmail] = useState(null);
  const [isResending, setIsResending] = useState(false);

  const showNotification = (msg) => {
    setNotice(msg);
    setTimeout(() => setNotice(null), 6000);
  };

  const handleResendConfirmation = async () => {
    if (!unconfirmedEmail) return;
    setIsResending(true);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: unconfirmedEmail,
      });
      if (error) throw error;
      showNotification(`Hemos reenviado el enlace a ${unconfirmedEmail}. Por favor revisa tu bandeja de entrada y la carpeta de Spam.`);
    } catch (err) {
      console.error('Error resending confirmation:', err);
      showNotification('No pudimos reenviar el correo en este momento. Revisa en unos minutos.');
    } finally {
      setIsResending(false);
    }
  };

  const buildUserSession = async (authUser) => {
    if (!authUser) return null;

    let profile = await getCustomerProfile(authUser.id);
    if (!profile && authUser.email) {
      profile = await getCustomerProfile(authUser.email);
      if (profile && !profile.auth_user_id) {
        // Link auth user id if it was missing
        await supabase
          .from('customers')
          .update({ auth_user_id: authUser.id })
          .eq('id', profile.id);
        profile.auth_user_id = authUser.id;
      }
    }

    if (!profile) {
      // Create fresh customer record if none exists
      const newCust = await upsertCustomerProfile({
        auth_user_id: authUser.id,
        fullName: authUser.user_metadata?.full_name || fullName || authUser.email.split('@')[0],
        email: authUser.email,
        role: authUser.user_metadata?.role || 'cliente',
        city: '',
      });
      profile = newCust?.data || {
        id: authUser.id,
        full_name: authUser.user_metadata?.full_name || fullName || 'Tutor Patitas',
        email: authUser.email,
        role: 'cliente',
      };
    }

    return {
      id: profile.id,
      auth_user_id: authUser.id,
      name: profile.full_name || authUser.user_metadata?.full_name || 'Tutor Patitas',
      email: profile.email || authUser.email,
      role: profile.role || 'cliente',
      petName: authUser.user_metadata?.pet_name || null,
      petType: authUser.user_metadata?.pet_type || null,
      city: profile.city || '',
      address: profile.address || '',
      phone: profile.phone || '',
      points: profile.points || 0,
      memberSince: profile.created_at
        ? new Intl.DateTimeFormat('es-CL', { month: 'long', year: 'numeric' }).format(new Date(profile.created_at))
        : 'Octubre 2026',
    };
  };

  // Real Supabase Login
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    const cleanEmail = email.trim().toLowerCase();

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password: password,
      });

      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          setUnconfirmedEmail(null);
          throw new Error('Credenciales incorrectas. Verifica tu correo y contraseña.');
        } else if (error.message.includes('Email not confirmed')) {
          setUnconfirmedEmail(cleanEmail);
          throw new Error('Tu cuenta está registrada en el sistema, pero requiere confirmar el correo electrónico antes de ingresar.');
        } else {
          setUnconfirmedEmail(null);
          throw error;
        }
      }

      setUnconfirmedEmail(null);
      const userSession = await buildUserSession(data.user);
      onLoginSuccess(userSession);

      if (userSession.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/mi-cuenta');
      }
    } catch (err) {
      console.error('Login error:', err);
      setErrorMsg(err.message || 'Error al iniciar sesión. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  // Real Supabase Registration
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    const cleanEmail = email.trim().toLowerCase();
    const cleanName = fullName.trim();

    if (password.length < 6) {
      setErrorMsg('La contraseña debe tener al menos 6 caracteres.');
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password: password,
        options: {
          data: {
            full_name: cleanName,
            role: 'cliente',
          },
        },
      });

      if (error) {
        if (error.message.includes('already registered')) {
          throw new Error('Este correo ya está registrado. Por favor inicia sesión.');
        } else {
          throw error;
        }
      }

      if (data?.user) {
        if (!data.session) {
          setUnconfirmedEmail(cleanEmail);
          showNotification('¡Cuenta registrada! Te hemos enviado un enlace de confirmación por correo (revisa tu bandeja de entrada o Spam).');
          setViewMode('login');
          return;
        }
        const userSession = await buildUserSession(data.user);
        showNotification('¡Cuenta creada exitosamente! Bienvenido a Patitas del Sur.');
        onLoginSuccess(userSession);
        navigate('/mi-cuenta');
      }
    } catch (err) {
      console.error('Registration error:', err);
      setErrorMsg(err.message || 'Error al crear la cuenta. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  // Real Supabase Password Reset
  const handleRecoverySubmit = async (e) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    const cleanEmail = email.trim().toLowerCase();

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
        redirectTo: `${window.location.origin}/login`,
      });

      if (error) throw error;

      showNotification(`Hemos enviado un enlace de recuperación seguro a ${cleanEmail}.`);
      setTimeout(() => {
        setViewMode('login');
      }, 3500);
    } catch (err) {
      console.error('Recovery error:', err);
      setErrorMsg(err.message || 'Error al solicitar recuperación. Verifica el correo ingresado.');
    } finally {
      setLoading(false);
    }
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

      {/* Contenedor central de autenticación segura */}
      <div className="w-full max-w-sm flex flex-col items-center space-y-6 animate-in fade-in duration-300">
        
        {/* Logo de la empresa */}
        <div className="bg-white p-3.5 sm:p-4 rounded-3xl shadow-2xl flex items-center justify-center transition-transform hover:scale-105">
          <img
            src="/images/logo_patitas_del_sur.svg"
            alt="Patitas del Sur"
            className="h-14 sm:h-16 w-auto object-contain"
          />
        </div>

        {/* Mensaje de Error */}
        {errorMsg && (
          <div className="w-full p-4 rounded-2xl bg-rose-500/20 border border-rose-400/30 text-rose-100 text-xs font-semibold space-y-2.5 animate-in fade-in">
            <div className="flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-300" />
              <span className="flex-1 leading-relaxed">{errorMsg}</span>
            </div>
            {unconfirmedEmail && (
              <div className="pt-2.5 border-t border-rose-400/20 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                <span className="text-[11px] text-rose-200">
                  ¿No recibiste el correo? Revisa en tu carpeta de <strong>Spam</strong>.
                </span>
                <button
                  type="button"
                  onClick={handleResendConfirmation}
                  disabled={isResending}
                  className="px-3 py-1.5 rounded-xl bg-white/20 hover:bg-white/30 text-white text-[11px] font-bold transition-all cursor-pointer disabled:opacity-50 shrink-0 self-start sm:self-auto"
                >
                  {isResending ? 'Reenviando...' : 'Reenviar confirmación'}
                </button>
              </div>
            )}
          </div>
        )}

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
                disabled={loading}
                className="w-full pl-12 pr-4 py-4 bg-white text-slate-900 placeholder:text-slate-400 rounded-2xl text-sm font-semibold shadow-lg border border-white/50 focus:outline-hidden focus:ring-2 focus:ring-white transition-all disabled:opacity-70"
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
                disabled={loading}
                className="w-full pl-12 pr-12 py-4 bg-white text-slate-900 placeholder:text-slate-400 rounded-2xl text-sm font-semibold shadow-lg border border-white/50 focus:outline-hidden focus:ring-2 focus:ring-white transition-all disabled:opacity-70"
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
              disabled={loading}
              className="w-full py-4 rounded-2xl bg-[#062628] hover:bg-[#041a1b] active:scale-98 text-white font-black text-sm tracking-wide shadow-xl flex items-center justify-center gap-2 transition-all cursor-pointer mt-2 disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verificando credenciales...</span>
                </>
              ) : (
                <>
                  <span>Ingresar a tu Cuenta</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            {/* Enlaces de Recuperación y Registro */}
            <div className="flex flex-col items-center gap-2 pt-3">
              <button
                type="button"
                onClick={() => {
                  setErrorMsg(null);
                  setViewMode('recovery');
                }}
                className="text-xs text-white/80 hover:text-white transition-colors cursor-pointer font-medium hover:underline py-1"
              >
                ¿Olvidaste tu contraseña?
              </button>

              <button
                type="button"
                onClick={() => {
                  setErrorMsg(null);
                  setViewMode('register');
                }}
                className="text-xs text-white hover:text-emerald-100 font-bold transition-colors cursor-pointer hover:underline py-1"
              >
                ¿No tienes cuenta? Regístrate aquí
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
                disabled={loading}
                className="w-full pl-12 pr-4 py-4 bg-white text-slate-900 placeholder:text-slate-400 rounded-2xl text-sm font-semibold shadow-lg border border-white/50 focus:outline-hidden focus:ring-2 focus:ring-white transition-all disabled:opacity-70"
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
                disabled={loading}
                className="w-full pl-12 pr-4 py-4 bg-white text-slate-900 placeholder:text-slate-400 rounded-2xl text-sm font-semibold shadow-lg border border-white/50 focus:outline-hidden focus:ring-2 focus:ring-white transition-all disabled:opacity-70"
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
                placeholder="Crear contraseña (mínimo 6 caracteres)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                className="w-full pl-12 pr-12 py-4 bg-white text-slate-900 placeholder:text-slate-400 rounded-2xl text-sm font-semibold shadow-lg border border-white/50 focus:outline-hidden focus:ring-2 focus:ring-white transition-all disabled:opacity-70"
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
              disabled={loading}
              className="w-full py-4 rounded-2xl bg-[#062628] hover:bg-[#041a1b] active:scale-98 text-white font-black text-sm tracking-wide shadow-xl flex items-center justify-center gap-2 transition-all cursor-pointer mt-2 disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Creando tu cuenta...</span>
                </>
              ) : (
                <>
                  <span>Crear Cuenta en Patitas del Sur</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            {/* Botón texto para regresar */}
            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => {
                  setErrorMsg(null);
                  setViewMode('login');
                }}
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
              Ingresa tu correo registrado para enviarte un enlace de restablecimiento seguro:
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
                disabled={loading}
                className="w-full pl-12 pr-4 py-4 bg-white text-slate-900 placeholder:text-slate-400 rounded-2xl text-sm font-semibold shadow-lg border border-white/50 focus:outline-hidden focus:ring-2 focus:ring-white transition-all disabled:opacity-70"
              />
            </div>

            {/* Botón de Enviar */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-2xl bg-[#062628] hover:bg-[#041a1b] active:scale-98 text-white font-black text-sm tracking-wide shadow-xl flex items-center justify-center gap-2 transition-all cursor-pointer mt-2 disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Enviando enlace...</span>
                </>
              ) : (
                <>
                  <span>Enviar Enlace de Recuperación</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            {/* Botón texto para volver */}
            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => {
                  setErrorMsg(null);
                  setViewMode('login');
                }}
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
