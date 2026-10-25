import React, { useState } from 'react';
import { X, User, Lock, Mail, ShieldCheck, ArrowRight, AlertCircle, Loader2 } from 'lucide-react';
import Logo from './Logo';
import { supabase } from '../lib/supabase';
import { getCustomerProfile, upsertCustomerProfile } from '../services/customersService';

export default function AuthModal({ isOpen, onClose, onLoginSuccess }) {
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'register'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [petName, setPetName] = useState('');
  const [petType, setPetType] = useState('perro');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [successMsg, setSuccessMsg] = useState(false);

  if (!isOpen) return null;

  const buildUserSession = async (authUser) => {
    if (!authUser) return null;

    let profile = await getCustomerProfile(authUser.id);
    if (!profile && authUser.email) {
      profile = await getCustomerProfile(authUser.email);
      if (profile && !profile.auth_user_id) {
        await supabase
          .from('customers')
          .update({ auth_user_id: authUser.id })
          .eq('id', profile.id);
        profile.auth_user_id = authUser.id;
      }
    }

    if (!profile) {
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
      petName: authUser.user_metadata?.pet_name || petName || null,
      petType: authUser.user_metadata?.pet_type || petType || null,
      city: profile.city || '',
      address: profile.address || '',
      phone: profile.phone || '',
      points: profile.points || 0,
      memberSince: profile.created_at
        ? new Intl.DateTimeFormat('es-CL', { month: 'long', year: 'numeric' }).format(new Date(profile.created_at))
        : 'Octubre 2026',
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    const cleanEmail = email.trim().toLowerCase();

    try {
      if (authMode === 'login') {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password,
        });

        if (error) {
          if (error.message.includes('Invalid login credentials')) {
            throw new Error('Credenciales incorrectas. Verifica tu correo y contraseña.');
          } else {
            throw error;
          }
        }

        const userObj = await buildUserSession(data.user);
        setSuccessMsg(true);
        setTimeout(() => {
          onLoginSuccess(userObj);
          setSuccessMsg(false);
          onClose();
        }, 600);
      } else {
        // Register
        if (password.length < 6) {
          throw new Error('La contraseña debe tener al menos 6 caracteres.');
        }

        const { data, error } = await supabase.auth.signUp({
          email: cleanEmail,
          password,
          options: {
            data: {
              full_name: fullName.trim() || cleanEmail.split('@')[0],
              role: 'cliente',
              pet_name: petName.trim() || null,
              pet_type: petName.trim() ? petType : null,
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

        const userObj = await buildUserSession(data.user);
        setSuccessMsg(true);
        setTimeout(() => {
          onLoginSuccess(userObj);
          setSuccessMsg(false);
          onClose();
        }, 600);
      }
    } catch (err) {
      console.error('AuthModal error:', err);
      setErrorMsg(err.message || 'Ocurrió un error. Por favor intenta de nuevo.');
    } finally {
      setLoading(false);
    }
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
          
          {/* Tab Selector: Iniciar Sesión / Crear Cuenta */}
          <div className="flex items-center bg-slate-50 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => {
                setErrorMsg(null);
                setAuthMode('login');
              }}
              className={`flex-1 py-1.5 rounded-lg text-xs font-black transition-all ${
                authMode === 'login'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Iniciar Sesión
            </button>
            <button
              onClick={() => {
                setErrorMsg(null);
                setAuthMode('register');
              }}
              className={`flex-1 py-1.5 rounded-lg text-xs font-black transition-all ${
                authMode === 'register'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Crear Cuenta
            </button>
          </div>

          {/* Mensaje de Error */}
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{errorMsg}</span>
            </div>
          )}

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
                Iniciando sesión segura en tu cuenta...
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
                      placeholder="Ej. María González"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      disabled={loading}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-hidden focus:border-[#0E8388] focus:bg-white transition-all disabled:opacity-60"
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
                    placeholder="tucorreo@ejemplo.cl"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-hidden focus:border-[#0E8388] focus:bg-white transition-all disabled:opacity-60"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-700 uppercase tracking-wider">
                  Contraseña
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-hidden focus:border-[#0E8388] focus:bg-white transition-all disabled:opacity-60"
                  />
                </div>
              </div>

              {authMode === 'register' && (
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-700 uppercase tracking-wider">
                    Nombre de tu Mascota (Opcional)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Ej. Jack / Kira"
                      value={petName}
                      onChange={(e) => setPetName(e.target.value)}
                      disabled={loading}
                      className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-hidden focus:border-[#0E8388] focus:bg-white transition-all disabled:opacity-60"
                    />
                    <select
                      value={petType}
                      onChange={(e) => setPetType(e.target.value)}
                      disabled={loading}
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
                disabled={loading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-[#0E8388] to-[#0A3E40] text-white font-black text-xs hover:shadow-lg hover:scale-[1.01] active:scale-95 transition-all shadow-md flex items-center justify-center gap-2 mt-2 cursor-pointer disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Verificando...</span>
                  </>
                ) : (
                  <>
                    <span>
                      {authMode === 'login' ? 'Iniciar Sesión Segura' : 'Crear mi Cuenta'}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

            </form>
          )}

          {/* Footer Security Guarantee */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-center gap-2 text-[10px] font-semibold text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>Autenticación Cifrada SSL con Supabase Auth</span>
          </div>

        </div>

      </div>

    </div>
  );
}
