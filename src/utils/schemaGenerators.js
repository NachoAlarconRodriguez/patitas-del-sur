/**
 * Schema.org JSON-LD Generators for SEO, GEO & AEO Rich Snippets
 * Compliant with Google Search Central & Schema.org specifications
 */

import { COMPANY_INFO, SITE_URL } from '../constants.js';

export const BASE_URL = String(SITE_URL || COMPANY_INFO.url || 'https://patitas-del-sur.vercel.app').replace(/\/+$/, '');

/**
 * Global Organization Schema for Comercial Kira SpA / Patitas del Sur
 */
export function getOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${BASE_URL}/#organization`,
    name: COMPANY_INFO.name,
    legalName: COMPANY_INFO.legalName,
    taxID: COMPANY_INFO.taxId,
    url: BASE_URL,
    logo: `${BASE_URL}/images/logo_patitas_del_sur.svg`,
    image: `${BASE_URL}${COMPANY_INFO.defaultOgImage || '/images/og-patitas-frutillar.jpg'}`,
    description:
      'Tienda online de alimento super premium, fórmulas Grain Free, snacks naturales y antiparasitarios para perros y gatos con despacho a domicilio propio en Frutillar, Región de Los Lagos, Chile.',
    telephone: COMPANY_INFO.phone,
    email: COMPANY_INFO.email,
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Loteo Espacio Frutillar',
      addressLocality: COMPANY_INFO.hubCity,
      addressRegion: 'Región de Los Lagos',
      postalCode: COMPANY_INFO.postalCode,
      addressCountry: 'CL',
    },
    contactPoint: [
      {
        '@type': 'ContactPoint',
        telephone: COMPANY_INFO.phone,
        email: COMPANY_INFO.email,
        contactType: 'customer service',
        areaServed: 'CL',
        availableLanguage: ['es', 'Spanish'],
      },
    ],
    sameAs: [
      COMPANY_INFO.instagramUrl,
      COMPANY_INFO.facebookUrl,
    ],
  };
}

/**
 * WebSite Schema with Sitelinks SearchBox Action pointing to /catalogo
 */
export function getWebSiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${BASE_URL}/#website`,
    url: BASE_URL,
    name: 'Patitas del Sur',
    description: 'Alimento para perros y gatos con despacho a domicilio en Frutillar, Región de Los Lagos, Chile.',
    publisher: {
      '@id': `${BASE_URL}/#organization`,
    },
    inLanguage: 'es-CL',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${BASE_URL}/catalogo?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

/**
 * BreadcrumbList Schema
 * @param {Array<{ name: string, url: string }>} items
 */
export function getBreadcrumbSchema(items = []) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url.startsWith('http') ? item.url : `${BASE_URL}${item.url.startsWith('/') ? '' : '/'}${item.url}`,
    })),
  };
}

/**
 * CollectionPage Schema for /catalogo, /perros, and /gatos
 */
export function getCollectionPageSchema({ name, description, url = '/catalogo', itemCount }) {
  const fullUrl = url.startsWith('http') ? url : `${BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`;
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': `${fullUrl}#collection`,
    name,
    description,
    url: fullUrl,
    inLanguage: 'es-CL',
    isPartOf: { '@id': `${BASE_URL}/#website` },
    ...(typeof itemCount === 'number' && itemCount > 0 ? { numberOfItems: itemCount } : {}),
  };
}

/**
 * Rich Product Schema for Google Search Rich Snippets & AI Engines
 * Reflects real stock availability, accurate Frutillar shipping cost, and only includes AggregateRating if real reviews exist.
 * @param {Object} product
 */
export function getProductSchema(product) {
  if (!product) return null;

  const isDog = product.petType === 'perros';
  const categoryLabel = isDog ? 'Alimento para Perros' : 'Alimento para Gatos';
  const productUrl = `${BASE_URL}/producto/${encodeURIComponent(String(product.id))}`;
  const imageUrl = product.image?.startsWith('http')
    ? product.image
    : `${BASE_URL}${product.image?.startsWith('/') ? '' : '/'}${product.image || 'images/og-patitas-frutillar.jpg'}`;

  const priceVal = Number(product.price) || 0;
  const variants = Array.isArray(product.variants) ? product.variants : [];
  const hasStock = variants.length > 0
    ? variants.some((v) => (typeof v.stock === 'number' ? v.stock : 10) > 0 && !v.isPaused)
    : (typeof product.stock === 'number' ? product.stock : 10) > 0 && !product.isPaused && !product.isOutOfStock;

  const shippingRateVal =
    priceVal >= (COMPANY_INFO.freeShippingThreshold || 25000)
      ? 0
      : (COMPANY_INFO.baseShippingFee || 2500);

  const ratingVal = Number(product.rating);
  const reviewsCount = Number(product.reviewsCount);
  const hasVerifiedReviews = Number.isFinite(ratingVal) && ratingVal > 0 && Number.isFinite(reviewsCount) && reviewsCount > 0;

  const additionalProperties = [];
  if (product.proteinValue) {
    additionalProperties.push({
      '@type': 'PropertyValue',
      name: 'Porcentaje de Proteína',
      value: `${product.proteinValue}%`,
    });
  }
  if (product.mainProtein) {
    additionalProperties.push({
      '@type': 'PropertyValue',
      name: 'Fuente Proteica Principal',
      value: product.mainProtein,
    });
  }
  if (product.weights && product.weights.length > 0) {
    additionalProperties.push({
      '@type': 'PropertyValue',
      name: 'Formatos Disponibles',
      value: product.weights.join(', '),
    });
  }
  if (product.targetStageLabel) {
    additionalProperties.push({
      '@type': 'PropertyValue',
      name: 'Etapa de Vida',
      value: product.targetStageLabel,
    });
  }

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    '@id': `${productUrl}#product`,
    name: product.name,
    image: [imageUrl],
    description: product.tagline
      ? `${product.tagline}. Alimento para ${isDog ? 'perros' : 'gatos'} con despacho a domicilio en Frutillar (urbano y parcelaciones).`
      : `${product.name} disponible en Patitas del Sur con despacho a domicilio el mismo día en Frutillar, Región de Los Lagos.`,
    sku: String(product.sku || product.id),
    category: categoryLabel,
    brand: {
      '@type': 'Brand',
      name: product.brand || 'Patitas del Sur',
    },
    offers: {
      '@type': 'Offer',
      priceCurrency: 'CLP',
      price: priceVal,
      priceValidUntil: '2027-12-31',
      availability: hasStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      url: productUrl,
      itemCondition: 'https://schema.org/NewCondition',
      seller: {
        '@type': 'Organization',
        name: 'Patitas del Sur',
        url: BASE_URL,
      },
      shippingDetails: {
        '@type': 'OfferShippingDetails',
        shippingRate: {
          '@type': 'MonetaryAmount',
          value: String(shippingRateVal),
          currency: 'CLP',
        },
        shippingDestination: [
          {
            '@type': 'DefinedRegion',
            addressCountry: 'CL',
            addressRegion: 'Región de Los Lagos',
            postalCode: COMPANY_INFO.postalCode || '5620000',
          },
        ],
        deliveryTime: {
          '@type': 'ShippingDeliveryTime',
          transitTime: {
            '@type': 'QuantitativeValue',
            minValue: 0,
            maxValue: 1,
            unitCode: 'DAY',
          },
        },
      },
    },
    ...(hasVerifiedReviews
      ? {
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: ratingVal.toFixed(1),
            reviewCount: reviewsCount,
            bestRating: '5',
            worstRating: '1',
          },
        }
      : {}),
    ...(additionalProperties.length > 0 ? { additionalProperty: additionalProperties } : {}),
  };
}

/**
 * LocalBusiness / PetStore Schema for Google Maps, Local Pack SEO & Frutillar AI Citations
 */
export function getLocalBusinessSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'PetStore',
    '@id': `${BASE_URL}/#localbusiness`,
    name: COMPANY_INFO.name,
    legalName: COMPANY_INFO.legalName,
    taxID: COMPANY_INFO.taxId,
    image: `${BASE_URL}${COMPANY_INFO.defaultOgImage || '/images/og-patitas-frutillar.jpg'}`,
    logo: `${BASE_URL}/images/logo_patitas_del_sur.svg`,
    url: BASE_URL,
    telephone: COMPANY_INFO.phone,
    email: COMPANY_INFO.email,
    priceRange: '$$ (CLP)',
    currenciesAccepted: 'CLP',
    paymentAccepted: COMPANY_INFO.paymentMethods.join(', '),
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Loteo Espacio Frutillar',
      addressLocality: COMPANY_INFO.hubCity,
      addressRegion: 'Región de Los Lagos',
      postalCode: COMPANY_INFO.postalCode,
      addressCountry: 'CL',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: COMPANY_INFO.coordinates.hubLat,
      longitude: COMPANY_INFO.coordinates.hubLng,
    },
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        opens: '10:00',
        closes: '19:30',
      },
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Sunday'],
        opens: '10:00',
        closes: '20:00',
        description: 'Despacho exclusivo Pedido Urgente en Frutillar ($3.500 CLP)',
      },
    ],
    areaServed: [
      { '@type': 'City', name: 'Frutillar' },
      ...(COMPANY_INFO.sectors || []).map((sector) => ({
        '@type': 'Place',
        name: sector,
      })),
    ],
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Catálogo de Alimentos, Snacks y Cuidado para Mascotas en Frutillar',
      itemListElement: [
        {
          '@type': 'OfferCatalog',
          name: 'Alimento Super Premium Perros en Frutillar',
        },
        {
          '@type': 'OfferCatalog',
          name: 'Alimento Super Premium Gatos en Frutillar',
        },
        {
          '@type': 'OfferCatalog',
          name: 'Antiparasitarios y Farmacia Veterinaria',
        },
        {
          '@type': 'OfferCatalog',
          name: 'Snacks Naturales y Arenas Sanitarias',
        },
      ],
    },
  };
}

/**
 * FAQPage Schema for Google Rich Snippets & AI Answer Engines (AEO)
 * @param {Array<{question: string, answer?: string, shortAnswer?: string, details?: string}>} faqs
 */
export function getFAQPageSchema(faqs = []) {
  if (!faqs || faqs.length === 0) return null;

  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => {
      const answerText = faq.answer || [faq.shortAnswer, faq.details].filter(Boolean).join(' ');
      return {
        '@type': 'Question',
        name: faq.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: answerText,
        },
      };
    }),
  };
}
