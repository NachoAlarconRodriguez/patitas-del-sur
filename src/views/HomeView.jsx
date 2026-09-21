import React from 'react';
import SplitHeroCard from '../components/SplitHeroCard';

export default function HomeView() {
  return (
    <div className="w-full h-screen overflow-hidden bg-[#FAF9F6]">
      {/* La página de inicio es el Split Hero interactivo de Kira y Jack a pantalla completa */}
      <SplitHeroCard />
    </div>
  );
}
