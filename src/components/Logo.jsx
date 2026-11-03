import React from 'react';

export default function Logo({ className = "h-10", imageClassName = "", variant = "amber" }) {
  let logoSrc = "/images/logo_patitas_del_sur_amber.svg";

  if (variant === "dark") {
    logoSrc = "/images/logo_patitas_del_sur_dark.svg";
  } else if (variant === "light") {
    logoSrc = "/images/logo_patitas_del_sur_light.svg";
  } else if (variant === "original") {
    logoSrc = "/images/logo_patitas_del_sur.svg";
  } else if (variant === "amber" || variant === "full") {
    logoSrc = "/images/logo_patitas_del_sur_amber.svg";
  }

  return (
    <div className={`inline-flex items-center select-none ${className}`}>
      <img
        src={logoSrc}
        alt="Patitas del Sur - Alimento y Snacks para mascotas"
        className={`h-full w-auto object-contain transition-transform duration-300 hover:scale-105 active:scale-95 ${imageClassName}`}
      />
    </div>
  );
}

