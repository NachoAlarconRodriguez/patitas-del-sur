import React from 'react';

export default function Logo({ className = "h-10", imageClassName = "", variant = "full" }) {
  return (
    <div className={`inline-flex items-center select-none ${className}`}>
      <img
        src="/images/logo_patitas_del_sur.svg"
        alt="Patitas del Sur - Alimento y Snacks para mascotas"
        className={`h-full w-auto object-contain transition-transform hover:scale-105 ${imageClassName}`}
      />
    </div>
  );
}
