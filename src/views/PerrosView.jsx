import React from 'react';
import PetCatalogView from './PetCatalogView';
import DogLoadingSpinner from '../components/DogLoadingSpinner';
import { PERROS_FAQS, GENERAL_FAQS } from '../data/faqData';

const PERROS_CATALOG_CONFIG = {
  petType: 'perros',
  realtimeChannel: 'products-realtime-perros',
  fallbackBrandGroup: 'Otras Recetas Patagónicas',
  fallbackBrandTagline: 'Nutrición Natural de la Patagonia',
  emptyMessage: 'No encontramos productos con los filtros seleccionados',
  srTitle: 'Alimento y Nutrición Super Premium para Perros con Despacho en Frutillar',
  seo: {
    title: 'Alimento y Snacks Naturales para Perros en Frutillar',
    description:
      'Catálogo de alimento super premium, recetas Grain Free, snacks naturales y antiparasitarios para perros con stock en vivo y despacho a domicilio el mismo día en Frutillar (urbano y parcelaciones). Envío gratis desde $25.000 CLP.',
    canonical: '/perros',
    ogImage: '/images/og-perros-kira.jpg',
    keywords:
      'alimento perros frutillar, comida perros frutillar, bravery perros frutillar, acana frutillar, grain free perros frutillar, despacho mascotas frutillar',
    breadcrumbName: 'Perros',
    faqs: [...PERROS_FAQS, ...GENERAL_FAQS.slice(0, 2)],
  },
  hero: {
    eyebrowPrefix: 'Nutrición para Perros',
    heading: 'Su plato favorito, siempre en stock.',
    subheading:
      'Marcas super premium y formatos de ahorro con despacho el mismo día en Frutillar (urbano y parcelaciones).',
    searchPlaceholder: 'Buscar por marca, salmón, cordero, formato...',
    searchAriaLabel: 'Buscar alimento para perros',
    mascotNote: '¡los favoritos de Kira!',
    mascotFigureClass: 'cat-hero__mascot',
    mascotImage: '/images/kira_hero_still_alpha.png',
    mascotAlt: 'Kira, mascota de Patitas del Sur',
    mascotWidth: '528',
    mascotHeight: '660',
  },
  faq: {
    title: 'Preguntas Frecuentes sobre Alimento y Salud Canina en Frutillar',
    subtitle:
      'Respuestas directas y verificadas sobre nutrición sin granos, snacks naturales, antiparasitarios y despacho a domicilio en Frutillar.',
  },
  matchWeightFallback: (weightFilter, weights) => {
    if (weightFilter === 'snacks' && weights.some((w) => w.includes('g') && !w.includes('kg'))) return true;
    if (weightFilter === 'standard' && weights.some((w) => w.includes('2 kg') || w.includes('3 kg') || w.includes('1.5 kg'))) return true;
    if (
      weightFilter === 'bulk' &&
      weights.some(
        (w) =>
          w.includes('5 kg') ||
          w.includes('10 kg') ||
          w.includes('11') ||
          w.includes('12 kg') ||
          w.includes('15 kg') ||
          w.includes('20 kg')
      )
    ) {
      return true;
    }
    return false;
  },
};

export default function PerrosView({ onSelectProduct, onAddToCart }) {
  return (
    <PetCatalogView
      config={PERROS_CATALOG_CONFIG}
      LoadingSpinner={DogLoadingSpinner}
      onSelectProduct={onSelectProduct}
      onAddToCart={onAddToCart}
    />
  );
}
