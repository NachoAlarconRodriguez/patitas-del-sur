/**
 * Schema.org JSON-LD Generators for SEO, GEO & AEO Rich Snippets
 * Compliant with Google Search Central (Merchant Listings & Rich Results) & Schema.org specifications
 */

import { COMPANY_INFO, SITE_URL } from '../constants.js';

export const BASE_URL = String(SITE_URL || COMPANY_INFO.url || 'https://www.patitas-delsur.cl').replace(/\/+$/, '');

const LOGO_IMAGE_OBJECT = {
  '@type': 'ImageObject',
  url: `${BASE_URL}${COMPANY_INFO.logoUrl || '/pwa-icon-512.png'}`,
  width: 512,
  height: 512,
};

function toAbsoluteUrl(pathOrUrl, fallback = '/images/og-patitas-frutillar.jpg') {
  const value = typeof pathOrUrl === 'string' && pathOrUrl.trim() ? pathOrUrl.trim() : fallback;
  if (value.startsWith('http://') || value.startsWith('https://')) {
    return value;
  }
  return `${BASE_URL}${value.startsWith('/') ? '' : '/'}${value}`;
}

function buildShippingDetails(priceVal) {
  const shippingRateVal =
    priceVal >= (COMPANY_INFO.freeShippingThreshold || 25000)
      ? 0
      : (COMPANY_INFO.baseShippingFee || 2500);

  return {
    '@type': 'OfferShippingDetails',
    shippingRate: {
      '@type': 'MonetaryAmount',
      value: shippingRateVal,
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
      handlingTime: {
        '@type': 'QuantitativeValue',
        minValue: 0,
        maxValue: 0,
        unitCode: 'DAY',
      },
      transitTime: {
        '@type': 'QuantitativeValue',
        minValue: 0,
        maxValue: 1,
        unitCode: 'DAY',
      },
    },
  };
}

function buildReturnPolicy() {
  return {
    '@type': 'MerchantReturnPolicy',
    applicableCountry: 'CL',
    returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow',
    merchantReturnDays: COMPANY_INFO.returnPolicyDays || 10,
    returnMethod: 'https://schema.org/ReturnByMail',
    returnFees: 'https://schema.org/FreeReturn',
  };
}

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
    logo: LOGO_IMAGE_OBJECT,
    image: `${BASE_URL}${COMPANY_INFO.defaultOgImage || '/images/og-patitas-frutillar.jpg'}`,
    description:
      'Tienda online de alimento super premium, fórmulas Grain Free, snacks naturales y antiparasitarios para perros y gatos con despacho a domicilio propio en Frutillar y alrededores (radio de ~9 km desde Frutillar Alto), Región de Los Lagos, Chile.',
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
    description: 'Alimento para perros y gatos con despacho a domicilio en Frutillar y alrededores, Región de Los Lagos, Chile.',
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
 * Rich Product Schema for Google Merchant Listings, Rich Snippets & AI Engines
 * Supports full image gallery, multi-variant AggregateOffer, accurate Frutillar shipping (with handlingTime),
 * MerchantReturnPolicy, and only includes AggregateRating if real verified reviews exist.
 * @param {Object} product
 * @param {{ images?: string[], displayProduct?: Object }} [options]
 */
export function getProductSchema(product, options = {}) {
  if (!product) return null;

  const effective = options.displayProduct || product;
  const petTypeRaw = String(product.petType || product.pet_type || '').toLowerCase();
  const isDog = petTypeRaw !== 'gatos';
  const categoryLabel = isDog ? 'Alimento para Perros' : 'Alimento para Gatos';
  const productUrl = `${BASE_URL}/producto/${encodeURIComponent(String(product.id))}`;

  const rawImages = [];
  const pushImage = (img) => {
    if (typeof img === 'string' && img.trim() && !img.includes('photo-1568640347023-a616a30bc3bd')) {
      const abs = toAbsoluteUrl(img);
      if (!rawImages.includes(abs)) rawImages.push(abs);
    }
  };

  if (Array.isArray(options.images)) {
    options.images.forEach(pushImage);
  }
  pushImage(effective.image || product.image);
  if (Array.isArray(effective.images)) effective.images.forEach(pushImage);
  if (Array.isArray(product.images)) product.images.forEach(pushImage);
  if (rawImages.length === 0) {
    rawImages.push(toAbsoluteUrl('/images/og-patitas-frutillar.jpg'));
  }

  const variants = Array.isArray(product.variants) ? product.variants : [];
  const activeVariants = variants.filter((v) => v && !v.isPaused && v.isActive !== false);

  const buildSingleOffer = (item, fallbackUrl = productUrl) => {
    const pVal = Number(item.price) || 0;
    const inStock =
      (typeof item.stock === 'number' ? item.stock : 10) > 0 &&
      !item.isPaused &&
      !item.isOutOfStock;

    return {
      '@type': 'Offer',
      ...(item.format ? { name: `${product.name} — ${item.format}` } : {}),
      ...(item.sku ? { sku: String(item.sku) } : {}),
      priceCurrency: 'CLP',
      price: pVal,
      priceValidUntil: '2027-12-31',
      availability: inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      url: fallbackUrl,
      itemCondition: 'https://schema.org/NewCondition',
      seller: {
        '@type': 'Organization',
        '@id': `${BASE_URL}/#organization`,
        name: 'Patitas del Sur',
        url: BASE_URL,
      },
      shippingDetails: buildShippingDetails(pVal),
      hasMerchantReturnPolicy: buildReturnPolicy(),
    };
  };

  let offersNode;
  if (activeVariants.length > 1) {
    const validPrices = activeVariants.map((v) => Number(v.price) || 0).filter((p) => p > 0);
    const lowPrice = validPrices.length > 0 ? Math.min(...validPrices) : (Number(product.price) || 0);
    const highPrice = validPrices.length > 0 ? Math.max(...validPrices) : lowPrice;
    const hasAnyStock = activeVariants.some((v) => (typeof v.stock === 'number' ? v.stock : 10) > 0 && !v.isPaused);

    if (lowPrice !== highPrice) {
      offersNode = {
        '@type': 'AggregateOffer',
        priceCurrency: 'CLP',
        lowPrice,
        highPrice,
        offerCount: activeVariants.length,
        availability: hasAnyStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
        url: productUrl,
        offers: activeVariants.map((v) => buildSingleOffer(v, productUrl)),
      };
    } else {
      offersNode = buildSingleOffer(
        {
          price: lowPrice,
          stock: hasAnyStock ? 1 : 0,
          sku: effective.sku || product.sku,
        },
        productUrl
      );
    }
  } else {
    const targetItem = activeVariants[0] || product;
    offersNode = buildSingleOffer(targetItem, productUrl);
  }

  const ratingVal = Number(product.rating);
  const reviewsCount = Number(product.reviewsCount || product.reviews_count);
  const hasVerifiedReviews = Number.isFinite(ratingVal) && ratingVal > 0 && Number.isFinite(reviewsCount) && reviewsCount > 0;

  const additionalProperties = [];
  const proteinValue = effective.proteinValue ?? product.proteinValue ?? product.protein_value;
  const mainProtein = effective.mainProtein || product.mainProtein || product.main_protein;
  const targetStageLabel = effective.targetStageLabel || product.targetStageLabel || product.target_stage_label;

  if (proteinValue) {
    additionalProperties.push({
      '@type': 'PropertyValue',
      name: 'Porcentaje de Proteína',
      value: `${proteinValue}%`,
    });
  }
  if (mainProtein) {
    additionalProperties.push({
      '@type': 'PropertyValue',
      name: 'Fuente Proteica Principal',
      value: mainProtein,
    });
  }
  if (product.weights && product.weights.length > 0) {
    additionalProperties.push({
      '@type': 'PropertyValue',
      name: 'Formatos Disponibles',
      value: product.weights.join(', '),
    });
  }
  if (targetStageLabel) {
    additionalProperties.push({
      '@type': 'PropertyValue',
      name: 'Etapa de Vida',
      value: targetStageLabel,
    });
  }

  const tagline = effective.tagline || product.tagline;

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    '@id': `${productUrl}#product`,
    name: product.name,
    image: rawImages,
    description: tagline
      ? `${tagline}. Alimento para ${isDog ? 'perros' : 'gatos'} con despacho a domicilio en Frutillar y alrededores (urbano y parcelaciones).`
      : `${product.name} disponible en Patitas del Sur con despacho a domicilio el mismo día en Frutillar y alrededores, Región de Los Lagos.`,
    sku: String(effective.sku || product.sku || product.id),
    category: categoryLabel,
    brand: {
      '@type': 'Brand',
      name: product.brand || 'Patitas del Sur',
    },
    offers: offersNode,
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
    logo: LOGO_IMAGE_OBJECT,
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
      {
        '@type': 'GeoCircle',
        geoMidpoint: {
          '@type': 'GeoCoordinates',
          latitude: COMPANY_INFO.coordinates.hubLat,
          longitude: COMPANY_INFO.coordinates.hubLng,
        },
        geoRadius: String((COMPANY_INFO.coverageRadiusKm || 9) * 1000),
      },
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
