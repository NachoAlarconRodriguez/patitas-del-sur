import React from 'react';
import PetCatalogView from './PetCatalogView';
import CatLoadingSpinner from '../components/CatLoadingSpinner';
import { GATOS_FAQS, GENERAL_FAQS } from '../data/faqData';

const GATOS_CATALOG_CONFIG = {
  petType: 'gatos',
  realtimeChannel: 'products-realtime-gatos',
  fallbackBrandGroup: 'Recetas Felinas Holísticas',
  fallbackBrandTagline: 'Fórmulas Holísticas Felinas de la Patagonia',
  emptyMessage: 'No encontramos productos felinos con los filtros seleccionados',
  srTitle: 'Alimento y Nutrición Super Premium para Gatos en Puerto Varas, Llanquihue y Frutillar',
  seo: {
    title: 'Alimento y Snacks Naturales para Gatos en Puerto Varas',
    description:
      'Catálogo de alimento felino super premium 100% Grain Free, patés y antiparasitarios para gatos. Despacho express en Puerto Varas, Llanquihue y Frutillar.',
    canonical: '/gatos',
    keywords:
      'alimento gatos puerto varas, comida gatos llanquihue, bravery gatos los lagos, grain free gatos chile',
    breadcrumbName: 'Gatos',
    faqs: [...GATOS_FAQS, ...GENERAL_FAQS.slice(0, 2)],
  },
  hero: {
    eyebrowPrefix: 'Nutrición para Gatos',
    heading: 'Recetas para michis exigentes.',
    subheading:
      'Fórmulas ricas en proteína animal y humedad con despacho rápido directo a tu puerta en el Sur.',
    searchPlaceholder: 'Buscar por marca, salmón, pollo, paté, formato...',
    searchAriaLabel: 'Buscar alimento para gatos',
    mascotNote: '¡aprobado por Jack!',
    mascotFigureClass: 'cat-hero__mascot cat-hero__mascot--cat',
    mascotImage: '/images/jack_peek_alpha.png?v=1',
    mascotAlt: 'Jack, mascota de Patitas del Sur',
    mascotWidth: '882',
    mascotHeight: '773',
  },
  faq: {
    title: 'Preguntas Frecuentes sobre Alimento y Salud Felina',
    subtitle:
      'Respuestas veterinarias directas y estructuradas sobre nutrición carnívora estricta, prevención urinaria y despacho en Los Lagos.',
  },
  matchWeightFallback: (weightFilter, weights) => {
    if (weightFilter === 'snacks' && weights.some((w) => w.includes('g') || w.includes('pack'))) return true;
    if (weightFilter === 'standard' && weights.some((w) => w.includes('1.5 kg') || w.includes('3.5 kg'))) return true;
    if (weightFilter === 'bulk' && weights.some((w) => w.includes('7 kg') || w.includes('10 kg') || w.includes('11 kg'))) return true;
    return false;
  },
};

export default function GatosView({ onSelectProduct, onAddToCart }) {
  return (
    <PetCatalogView
      config={GATOS_CATALOG_CONFIG}
      LoadingSpinner={CatLoadingSpinner}
      onSelectProduct={onSelectProduct}
      onAddToCart={onAddToCart}
    />
  );
}
