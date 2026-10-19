/**
 * Schema.org JSON-LD Generators for SEO & Rich Snippets
 * Compliant with Google Search Central & Schema.org specifications
 */

export const BASE_URL = 'https://patitasdelsur.cl';

/**
 * Global Organization Schema for Comercial Kira SpA / Patitas del Sur
 */
export function getOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${BASE_URL}/#organization`,
    name: 'Patitas del Sur',
    legalName: 'Comercial Kira SpA',
    taxID: '77.892.451-2',
    url: BASE_URL,
    logo: `${BASE_URL}/images/logo_patitas_del_sur.svg`,
    image: `${BASE_URL}/images/hero_dog.png`,
    description: 'Comercializadora de alimento holístico, 100% libre de granos y snacks naturales para perros y gatos en la Patagonia chilena.',
    telephone: '+56 9 8765 4321',
    email: 'contacto@patitasdelsur.cl',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Puerto Varas',
      addressRegion: 'Región de Los Lagos',
      addressCountry: 'CL',
    },
    contactPoint: [
      {
        '@type': 'ContactPoint',
        telephone: '+56 9 8765 4321',
        contactType: 'customer service',
        areaServed: 'CL',
        availableLanguage: ['es', 'Spanish'],
      },
    ],
    sameAs: [
      'https://www.instagram.com/patitasdelsur.cl',
      'https://www.facebook.com/patitasdelsur.cl',
    ],
  };
}

/**
 * WebSite Schema with Sitelinks SearchBox Action
 */
export function getWebSiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${BASE_URL}/#website`,
    url: BASE_URL,
    name: 'Patitas del Sur',
    description: 'Alimento holístico y snacks naturales para mascotas en el sur de Chile',
    publisher: {
      '@id': `${BASE_URL}/#organization`,
    },
    inLanguage: 'es-CL',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${BASE_URL}/perros?q={search_term_string}`,
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
 * Rich Product Schema for Google Search Rich Snippets
 * @param {Object} product
 */
export function getProductSchema(product) {
  if (!product) return null;

  const isDog = product.petType === 'perros';
  const categoryLabel = isDog ? 'Alimento para Perros' : 'Alimento para Gatos';
  const productUrl = `${BASE_URL}/producto/${product.id}`;
  const imageUrl = product.image?.startsWith('http')
    ? product.image
    : `${BASE_URL}${product.image?.startsWith('/') ? '' : '/'}${product.image || 'images/hero_dog.png'}`;

  const ratingVal = Number(product.rating) || 4.9;
  const reviewsCount = Number(product.reviewsCount) || 12;
  const priceVal = Number(product.price) || 0;

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
      ? `${product.tagline}. Alimento super premium para ${isDog ? 'perros' : 'gatos'} con despacho en Puerto Varas, Llanquihue y Región de Los Lagos.`
      : `${product.name} disponible en Patitas del Sur con despacho a domicilio en la Cuenca del Lago Llanquihue.`,
    sku: String(product.id),
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
      availability: 'https://schema.org/InStock',
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
          value: '0',
          currency: 'CLP',
        },
        shippingDestination: [
          {
            '@type': 'DefinedRegion',
            addressCountry: 'CL',
            addressRegion: 'Región de Los Lagos',
          },
        ],
        deliveryTime: {
          '@type': 'ShippingDeliveryTime',
          transitTime: {
            '@type': 'QuantitativeValue',
            minValue: 0,
            maxValue: 2,
            unitCode: 'DAY',
          },
        },
      },
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: ratingVal.toFixed(1),
      reviewCount: reviewsCount,
      bestRating: '5',
      worstRating: '1',
    },
    ...(additionalProperties.length > 0 ? { additionalProperty: additionalProperties } : {}),
  };
}

/**
 * LocalBusiness / PetStore Schema for Google Maps & Local Pack SEO
 */
export function getLocalBusinessSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'PetStore',
    '@id': `${BASE_URL}/#localbusiness`,
    name: 'Patitas del Sur',
    legalName: 'Comercial Kira SpA',
    taxID: '77.892.451-2',
    image: `${BASE_URL}/images/hero_dog.png`,
    logo: `${BASE_URL}/images/logo_patitas_del_sur.svg`,
    url: BASE_URL,
    telephone: '+56 9 8765 4321',
    email: 'contacto@patitasdelsur.cl',
    priceRange: '$$ (CLP)',
    currenciesAccepted: 'CLP',
    paymentAccepted: 'Webpay Plus, Tarjetas de Débito y Crédito, Transferencia Bancaria',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Sector Costanera s/n',
      addressLocality: 'Puerto Varas',
      addressRegion: 'Región de Los Lagos',
      postalCode: '5550000',
      addressCountry: 'CL',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: -41.3195,
      longitude: -72.9854,
    },
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        opens: '09:00',
        closes: '19:30',
      },
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Saturday'],
        opens: '10:00',
        closes: '18:00',
      },
    ],
    areaServed: [
      {
        '@type': 'AdministrativeArea',
        name: 'Puerto Varas',
      },
      {
        '@type': 'AdministrativeArea',
        name: 'Llanquihue',
      },
      {
        '@type': 'AdministrativeArea',
        name: 'Frutillar',
      },
      {
        '@type': 'AdministrativeArea',
        name: 'Puerto Montt',
      },
    ],
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Catálogo de Alimentos Holísticos y Snacks',
      itemListElement: [
        {
          '@type': 'OfferCatalog',
          name: 'Alimento Super Premium Perros',
        },
        {
          '@type': 'OfferCatalog',
          name: 'Alimento Super Premium Gatos',
        },
        {
          '@type': 'OfferCatalog',
          name: 'Antiparasitarios y Farmacia Veterinaria',
        },
        {
          '@type': 'OfferCatalog',
          name: 'Snacks y Premios Deshidratados 100% Naturales',
        },
      ],
    },
  };
}

/**
 * FAQPage Schema for Google Rich Snippets & AI Answer Engines (AEO)
 * @param {Array<{question: string, answer: string}>} faqs
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
