import { useEffect } from 'react';

/**
 * Dynamic SEO Head Manager
 * Updates document title, meta descriptions, robots directives, canonical URLs, Open Graph, and JSON-LD schema on route changes.
 */
export default function SEOHead({
  title,
  description,
  canonical,
  ogType = 'website',
  ogImage = '/images/hero_dog.png',
  keywords,
  jsonLd,
  noindex = false,
}) {
  useEffect(() => {
    // 1. Update Document Title (avoid duplicating brand suffix if already present)
    const hasBrandSuffix = title && /patitas del sur/i.test(title);
    const formattedTitle = title
      ? hasBrandSuffix
        ? title
        : `${title} | Patitas del Sur`
      : 'Patitas del Sur | Alimento y Snacks Naturales para Mascotas en el Sur de Chile';
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

    // 2. Robots Directive (index, follow vs noindex, nofollow)
    setMetaTag('meta[name="robots"]', 'content', noindex ? 'noindex, nofollow' : 'index, follow');

    // 3. Description
    if (description) {
      setMetaTag('meta[name="description"]', 'content', description);
      setMetaTag('meta[property="og:description"]', 'content', description);
      setMetaTag('meta[name="twitter:description"]', 'content', description);
    }

    // 4. Keywords
    if (keywords) {
      setMetaTag('meta[name="keywords"]', 'content', keywords);
    }

    // 5. OpenGraph & Twitter Title
    setMetaTag('meta[property="og:title"]', 'content', formattedTitle);
    setMetaTag('meta[name="twitter:title"]', 'content', formattedTitle);

    // 6. OpenGraph Type
    setMetaTag('meta[property="og:type"]', 'content', ogType);

    // 7. OpenGraph Image (always absolute URL)
    const safeImage = ogImage || '/images/hero_dog.png';
    const fullImageUrl = safeImage.startsWith('http')
      ? safeImage
      : `https://patitasdelsur.cl${safeImage.startsWith('/') ? '' : '/'}${safeImage}`;
    setMetaTag('meta[property="og:image"]', 'content', fullImageUrl);
    setMetaTag('meta[name="twitter:image"]', 'content', fullImageUrl);

    // 8. Canonical URL (strip query strings/hashes when falling back to window.location)
    const fallbackPath = typeof window !== 'undefined' ? window.location.pathname : '/';
    const canonicalUrl = canonical
      ? canonical.startsWith('http')
        ? canonical
        : `https://patitasdelsur.cl${canonical.startsWith('/') ? '' : '/'}${canonical}`
      : `https://patitasdelsur.cl${fallbackPath.startsWith('/') ? '' : '/'}${fallbackPath}`;

    setMetaTag('meta[property="og:url"]', 'content', canonicalUrl);

    let linkCanonical = document.querySelector('link[rel="canonical"]');
    if (!linkCanonical) {
      linkCanonical = document.createElement('link');
      linkCanonical.setAttribute('rel', 'canonical');
      document.head.appendChild(linkCanonical);
    }
    linkCanonical.setAttribute('href', canonicalUrl);

    // 9. Inject or Update Dynamic JSON-LD Script
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
      // Cleanup dynamic route JSON-LD and restore robots indexability on unmount
      const activeScript = document.getElementById('seo-json-ld');
      if (activeScript) {
        activeScript.remove();
      }
      if (noindex) {
        const robotsMeta = document.querySelector('meta[name="robots"]');
        if (robotsMeta) {
          robotsMeta.setAttribute('content', 'index, follow');
        }
      }
    };
  }, [title, description, canonical, ogType, ogImage, keywords, jsonLd, noindex]);

  return null;
}
