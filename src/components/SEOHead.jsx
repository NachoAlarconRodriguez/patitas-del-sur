import { useEffect } from 'react';

/**
 * Dynamic SEO Head Manager
 * Updates document title, meta descriptions, canonical URLs, Open Graph, and JSON-LD schema on route changes.
 */
export default function SEOHead({
  title,
  description,
  canonical,
  ogType = 'website',
  ogImage = '/images/hero_dog.png',
  keywords,
  jsonLd,
}) {
  useEffect(() => {
    // 1. Update Document Title
    const formattedTitle = title
      ? `${title} | Patitas del Sur`
      : 'Patitas del Sur | Alimento y Snacks Naturales para Mascotas en la Patagonia';
    document.title = formattedTitle;

    // Helper to set or create meta tag
    const setMetaTag = (selector, attribute, value) => {
      let element = document.querySelector(selector);
      if (!element) {
        element = document.createElement('meta');
        const [attrName, attrVal] = selector
          .replace('meta[', '')
          .replace(']', '')
          .split('=');
        element.setAttribute(attrName, attrVal.replace(/"/g, ''));
        document.head.appendChild(element);
      }
      element.setAttribute(attribute, value);
    };

    // 2. Description
    if (description) {
      setMetaTag('meta[name="description"]', 'content', description);
      setMetaTag('meta[property="og:description"]', 'content', description);
      setMetaTag('meta[name="twitter:description"]', 'content', description);
    }

    // 3. Keywords
    if (keywords) {
      setMetaTag('meta[name="keywords"]', 'content', keywords);
    }

    // 4. OpenGraph & Twitter Title
    setMetaTag('meta[property="og:title"]', 'content', formattedTitle);
    setMetaTag('meta[name="twitter:title"]', 'content', formattedTitle);

    // 5. OpenGraph Type
    setMetaTag('meta[property="og:type"]', 'content', ogType);

    // 6. OpenGraph Image
    const fullImageUrl = ogImage.startsWith('http')
      ? ogImage
      : `https://patitasdelsur.cl${ogImage.startsWith('/') ? '' : '/'}${ogImage}`;
    setMetaTag('meta[property="og:image"]', 'content', fullImageUrl);
    setMetaTag('meta[name="twitter:image"]', 'content', fullImageUrl);

    // 7. Canonical URL
    const canonicalUrl = canonical
      ? canonical.startsWith('http')
        ? canonical
        : `https://patitasdelsur.cl${canonical.startsWith('/') ? '' : '/'}${canonical}`
      : window.location.href;

    setMetaTag('meta[property="og:url"]', 'content', canonicalUrl);

    let linkCanonical = document.querySelector('link[rel="canonical"]');
    if (!linkCanonical) {
      linkCanonical = document.createElement('link');
      linkCanonical.setAttribute('rel', 'canonical');
      document.head.appendChild(linkCanonical);
    }
    linkCanonical.setAttribute('href', canonicalUrl);

    // 8. Inject or Update JSON-LD Script
    let scriptTag = document.getElementById('seo-json-ld');
    if (jsonLd) {
      if (!scriptTag) {
        scriptTag = document.createElement('script');
        scriptTag.id = 'seo-json-ld';
        scriptTag.type = 'application/ld+json';
        document.head.appendChild(scriptTag);
      }
      scriptTag.textContent = JSON.stringify(jsonLd);
    } else if (scriptTag) {
      scriptTag.remove();
    }

    return () => {
      // Optional cleanup on unmount
      const activeScript = document.getElementById('seo-json-ld');
      if (activeScript) {
        activeScript.remove();
      }
    };
  }, [title, description, canonical, ogType, ogImage, keywords, jsonLd]);

  return null;
}
