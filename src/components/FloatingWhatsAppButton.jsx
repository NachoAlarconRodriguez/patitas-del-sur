import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Botón Flotante Oficial de WhatsApp (Patitas del Sur)
 * Con logo oficial SVG, respuesta táctil estilo Apple y tooltip descriptivo.
 */
export default function FloatingWhatsAppButton({
  phoneNumber = '56953332492',
  defaultMessage = '¡Hola Patitas del Sur! Quisiera hacer una consulta sobre los alimentos y despacho a domicilio 🐾',
  hidden = false,
}) {
  const location = useLocation();
  const [isHovered, setIsHovered] = useState(false);

  // Ocultar en el panel de administración o cuando el carrito/modal está abierto
  if (hidden || location.pathname.startsWith('/admin')) {
    return null;
  }

  const encodedMessage = encodeURIComponent(defaultMessage);
  const waUrl = `https://wa.me/${phoneNumber.replace(/[^0-9]/g, '')}?text=${encodedMessage}`;
  const isProductPage = location.pathname.startsWith('/producto/');

  return (
    <aside
      aria-label="Contacto directo por WhatsApp"
      className={`fixed ${isProductPage ? 'bottom-36' : 'bottom-20'} sm:bottom-6 right-4 sm:right-6 z-40 flex items-center justify-end select-none pointer-events-none transition-all duration-300`}
    >
      {/* Tooltip flotante con efecto Apple Glassmorphism */}
      <div
        className={`hidden sm:flex items-center gap-2 mr-3 px-3.5 py-2 rounded-2xl bg-white/95 backdrop-blur-md text-[#1D1D1F] border border-slate-200/90 shadow-xl transition-all duration-300 origin-right pointer-events-none ${
          isHovered
            ? 'opacity-100 scale-100 translate-x-0'
            : 'opacity-0 scale-95 translate-x-2'
        }`}
      >
        <div className="w-2 h-2 rounded-full bg-[#25D366] animate-pulse shrink-0" />
        <span className="text-xs font-bold whitespace-nowrap">
          ¿Dudas con tu pedido? Chatea con nosotros
        </span>
      </div>

      {/* Botón Circular Principal */}
      <a
        href={waUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Abrir chat de WhatsApp con Patitas del Sur"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="pointer-events-auto relative group w-14 h-14 sm:w-15 sm:h-15 rounded-full bg-[#25D366] hover:bg-[#20ba5a] text-white flex items-center justify-center shadow-2xl shadow-emerald-900/35 border-2 border-white/30 transition-all duration-300 hover:scale-110 active:scale-95 cursor-pointer"
      >
        {/* Halo de pulso continuo sutil */}
        <span className="absolute -inset-1 rounded-full bg-[#25D366]/40 animate-ping pointer-events-none opacity-60 duration-1000" />

        {/* Logo Oficial de WhatsApp en SVG Vectorial */}
        <svg
          viewBox="0 0 32 32"
          className="w-7 h-7 sm:w-8 sm:h-8 fill-white relative z-10 drop-shadow-xs transition-transform duration-300 group-hover:scale-105"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M16 2C8.28 2 2 8.28 2 16c0 2.72.78 5.26 2.13 7.42L2 30l6.8-1.78A13.9 13.9 0 0 0 16 30c7.72 0 14-6.28 14-14S23.72 2 16 2zm0 25.64c-2.38 0-4.6-.66-6.5-1.8l-.46-.28-4.04 1.06 1.08-3.94-.3-.48A11.57 11.57 0 0 1 4.36 16c0-6.42 5.22-11.64 11.64-11.64s11.64 5.22 11.64 11.64-5.22 11.64-11.64 11.64zm6.38-8.73c-.35-.18-2.07-1.02-2.39-1.14-.32-.12-.55-.18-.78.18-.23.35-.9 1.14-1.1 1.37-.2.23-.4.26-.75.09-.35-.18-1.48-.55-2.82-1.74-1.04-.93-1.74-2.08-1.94-2.43-.2-.35-.02-.54.15-.71.16-.16.35-.4.52-.61.18-.2.23-.35.35-.58.12-.23.06-.44-.03-.61-.09-.18-.78-1.88-1.07-2.58-.28-.68-.57-.59-.78-.6-.2-.01-.44-.01-.67-.01-.23 0-.61.09-.93.44-.32.35-1.22 1.19-1.22 2.91s1.25 3.38 1.42 3.61c.18.23 2.45 3.74 5.94 5.25.83.36 1.48.57 1.98.73.83.27 1.59.23 2.19.14.67-.1 2.07-.85 2.36-1.66.29-.82.29-1.52.2-1.66-.09-.15-.32-.23-.67-.41z" />
        </svg>

        {/* Punto de estado activo en línea */}
        <span
          className="absolute top-1 right-1 w-3.5 h-3.5 rounded-full bg-emerald-300 border-2 border-white shadow-xs z-20"
          title="En línea ahora"
        />
      </a>
    </aside>
  );
}
