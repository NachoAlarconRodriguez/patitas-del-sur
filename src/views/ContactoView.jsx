import React, { useState } from 'react';
import { Send, CheckCircle2, MessageSquare, Phone, Mail, MapPin } from 'lucide-react';

export default function ContactoView() {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    mascota: 'perro',
    mensaje: '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="pt-28 pb-20 bg-[#FAF9F6] text-slate-900 min-h-screen">
      <div className="max-w-7xl mx-auto px-6">
        
        <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
          <span className="inline-block px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider bg-[#0E8388]/10 text-[#0E8388]">
            Atención Personalizada
          </span>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
            ¿Tienes dudas sobre la dieta ideal? 🐾
          </h1>
          <p className="text-slate-600 text-sm md:text-base leading-relaxed">
            Escríbenos y nuestro equipo nutricional se pondrá en contacto contigo para orientarte en la mejor receta para tu perro o gato.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          
          {/* Info Side */}
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex items-start gap-4">
              <div className="p-3 rounded-2xl bg-[#0E8388]/10 text-[#0E8388]">
                <Mail className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm">Correo Electrónico</h4>
                <p className="text-slate-500 text-xs mt-1">contacto@patitasdelsur.cl</p>
                <p className="text-slate-400 text-[11px]">Respuesta en menos de 24 horas</p>
              </div>
            </div>

            <a
              href="https://wa.me/56987654321?text=Hola%20Patitas%20del%20Sur%2C%20tengo%20una%20consulta%20nutricional"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex items-start gap-4 hover:border-emerald-300 hover:shadow-md transition-all group block active:scale-98 cursor-pointer"
            >
              <div className="p-3 rounded-2xl bg-[#10B981]/10 text-[#10B981] group-hover:bg-[#10B981] group-hover:text-white transition-colors shrink-0">
                <Phone className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-900 text-sm">WhatsApp & Asesoría</h4>
                  <span className="text-[11px] font-black text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                    Abrir Chat 💬
                  </span>
                </div>
                <p className="text-slate-800 text-xs font-black mt-1">+56 9 8765 4321</p>
                <p className="text-slate-400 text-[11px]">Atención nutricional personalizada</p>
              </div>
            </a>

            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex items-start gap-4">
              <div className="p-3 rounded-2xl bg-[#C86D39]/10 text-[#C86D39]">
                <MapPin className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm">Oficina Central</h4>
                <p className="text-slate-500 text-xs mt-1">Puerto Varas, Región de Los Lagos, Chile</p>
              </div>
            </div>
          </div>

          {/* Form Side */}
          <div className="lg:col-span-2 bg-white rounded-3xl p-8 md:p-10 shadow-xl border border-slate-100">
            {submitted ? (
              <div className="py-12 text-center space-y-4">
                <div className="p-4 rounded-full bg-[#10B981]/10 text-[#10B981] w-fit mx-auto">
                  <CheckCircle2 className="w-12 h-12" />
                </div>
                <h3 className="text-2xl font-black text-slate-900">¡Mensaje Enviado con Éxito!</h3>
                <p className="text-slate-600 text-sm max-w-md mx-auto">
                  Hemos recibido tu consulta. Un especialista en nutrición de Patitas del Sur te responderá al e-mail indicado a la brevedad.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="px-6 py-2.5 rounded-full bg-[#0E8388] text-white font-bold text-xs hover:bg-[#10B981] transition-colors"
                >
                  Enviar otro mensaje
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                      Tu Nombre:
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ej: María González"
                      value={formData.nombre}
                      onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:border-[#0E8388]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                      Tu Correo:
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="maria@correo.cl"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:border-[#0E8388]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Tipo de Mascota:
                  </label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer text-sm font-semibold text-slate-700">
                      <input
                        type="radio"
                        name="mascota"
                        value="perro"
                        checked={formData.mascota === 'perro'}
                        onChange={(e) => setFormData({ ...formData, mascota: e.target.value })}
                        className="text-[#0E8388] focus:ring-[#0E8388]"
                      />
                      Perro 🐶
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer text-sm font-semibold text-slate-700">
                      <input
                        type="radio"
                        name="mascota"
                        value="gato"
                        checked={formData.mascota === 'gato'}
                        onChange={(e) => setFormData({ ...formData, mascota: e.target.value })}
                        className="text-[#C86D39] focus:ring-[#C86D39]"
                      />
                      Gato 🐱
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Tu Mensaje o Consulta Nutricional:
                  </label>
                  <textarea
                    required
                    rows="4"
                    placeholder="Cuéntanos la edad, raza o necesidades especiales de tu mascota..."
                    value={formData.mensaje}
                    onChange={(e) => setFormData({ ...formData, mensaje: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:border-[#0E8388]"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="w-full py-4 rounded-2xl bg-[#0E8388] hover:bg-[#10B981] text-white font-black text-sm flex items-center justify-center gap-2 shadow-xl shadow-[#0E8388]/30 transition-transform active:scale-95"
                >
                  <Send className="w-4 h-4" />
                  <span>ENVIAR CONSULTA</span>
                </button>
              </form>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
