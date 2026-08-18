import React from 'react';
import SplitHeroCard from '../components/SplitHeroCard';

export default function HomeView({ onSelectProduct, user, onLogout }) {
  return (
    <div className="w-full h-screen overflow-hidden bg-slate-950">
      {/* La página de inicio es únicamente las 2 cards de Kira y Jack a pantalla completa (100vh) */}
      <SplitHeroCard
        onSelectProduct={onSelectProduct}
        user={user}
        onLogout={onLogout}
      />
    </div>
  );
}
