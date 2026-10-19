import React from 'react';
import SplitHeroCard from '../components/SplitHeroCard';
import SEOHead from '../components/SEOHead';
import { getWebSiteSchema, getOrganizationSchema, getLocalBusinessSchema } from '../utils/schemaGenerators';

export default function HomeView() {
  return (
    <div className="w-full h-screen overflow-hidden bg-[#FAF9F6]">
      <SEOHead
        title="Alimento y Snacks Naturales para Mascotas en la Patagonia"
        description="Nutrición holística, libre de granos y snacks deshidratados para perros y gatos. Despacho rápido en Puerto Varas, Llanquihue, Frutillar y Puerto Montt."
        canonical="/"
        keywords="alimento para perros puerto varas, comida gatos llanquihue, snacks naturales mascotas chile, grain free patagonia"
        jsonLd={[getWebSiteSchema(), getOrganizationSchema(), getLocalBusinessSchema()]}
      />
      {/* La página de inicio es el Split Hero interactivo de Kira y Jack a pantalla completa */}
      <SplitHeroCard />
    </div>
  );
}
