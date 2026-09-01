import { useEffect } from 'react';

/**
 * SEO constants — single source of truth for site-wide metadata.
 */
const SITE_NAME = 'Karang Taruna Mekar Jaya';
const SITE_URL = (import.meta.env.VITE_SITE_URL || 'https://kt-mekarjaya.vercel.app').replace(/\/+$/, '');
const DEFAULT_DESCRIPTION =
  'Website resmi Karang Taruna Mekar Jaya — organisasi pemuda yang aktif, kreatif, dan bertanggung jawab di Kelurahan Mekar Jaya, Depok.';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function setMeta(name, content, attr = 'name') {
  if (!content) return;
  let el = document.querySelector(`meta[${attr}="${name}"]`);
  if (el) {
    el.setAttribute('content', content);
  } else {
    el = document.createElement('meta');
    el.setAttribute(attr, name);
    el.setAttribute('content', content);
    document.head.appendChild(el);
  }
}

function setCanonical(url) {
  let el = document.querySelector('link[rel="canonical"]');
  if (el) {
    el.setAttribute('href', url);
  } else {
    el = document.createElement('link');
    el.setAttribute('rel', 'canonical');
    el.setAttribute('href', url);
    document.head.appendChild(el);
  }
}

function setJsonLd(schemas) {
  // Remove previously injected JSON-LD scripts from this hook
  document.querySelectorAll('script[data-seo]').forEach((el) => el.remove());
  // Add new schemas
  (schemas || []).forEach((schema) => {
    if (!schema) return;
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.setAttribute('data-seo', 'true');
    script.textContent = JSON.stringify(schema);
    document.head.appendChild(script);
  });
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

/**
 * useSeo — sets document.title, meta description, canonical, Open Graph,
 * Twitter Card meta tags, and JSON-LD structured data for the current route.
 *
 * Call at the top of every page component.
 *
 * @param {Object}   opts
 * @param {string}  [opts.title]       - Page title (appended to site name). Pass falsy for home page.
 * @param {string}  [opts.description] - Meta description (150-160 chars ideal).
 * @param {string}  [opts.path]        - Canonical path, e.g. '/berita/my-slug'.
 * @param {string}  [opts.type]        - OG type ('website' | 'article').
 * @param {string}  [opts.image]       - OG image absolute URL.
 * @param {boolean} [opts.noindex]     - If true, adds noindex,nofollow.
 * @param {Array}   [opts.jsonLd]      - Array of JSON-LD schema objects.
 */
export default function useSeo({
  title,
  description = DEFAULT_DESCRIPTION,
  path = '/',
  type = 'website',
  image,
  noindex = false,
  jsonLd = [],
} = {}) {
  useEffect(() => {
    const pageTitle = title ? `${title} | ${SITE_NAME}` : SITE_NAME;
    const canonicalUrl = `${SITE_URL}${path}`;
    const ogImage = image || `${SITE_URL}/favicon.svg`;

    // --- Document title ---
    document.title = pageTitle;

    // --- Meta description ---
    setMeta('description', description);

    // --- Canonical ---
    setCanonical(canonicalUrl);

    // --- Open Graph ---
    setMeta('og:title', pageTitle, 'property');
    setMeta('og:description', description, 'property');
    setMeta('og:url', canonicalUrl, 'property');
    setMeta('og:type', type, 'property');
    setMeta('og:image', ogImage, 'property');
    setMeta('og:site_name', SITE_NAME, 'property');
    setMeta('og:locale', 'id_ID', 'property');

    // --- Twitter Card ---
    setMeta('twitter:card', 'summary');
    setMeta('twitter:title', pageTitle);
    setMeta('twitter:description', description);
    setMeta('twitter:image', ogImage);

    // --- Robots ---
    if (noindex) {
      setMeta('robots', 'noindex, nofollow');
    } else {
      const robotsEl = document.querySelector('meta[name="robots"]');
      if (robotsEl) robotsEl.remove();
    }

    // --- JSON-LD structured data ---
    setJsonLd(jsonLd);

    // --- Cleanup on unmount (restore defaults for next navigation) ---
    return () => {
      document.title = SITE_NAME;
      setMeta('description', DEFAULT_DESCRIPTION);
      setCanonical(SITE_URL);
      setMeta('og:title', SITE_NAME, 'property');
      setMeta('og:description', DEFAULT_DESCRIPTION, 'property');
      setMeta('og:url', SITE_URL, 'property');
      setMeta('og:type', 'website', 'property');
      setMeta('og:site_name', SITE_NAME, 'property');
      setMeta('og:locale', 'id_ID', 'property');
      document.querySelectorAll('script[data-seo]').forEach((el) => el.remove());
    };
    // Note: jsonLd is intentionally excluded from deps — it's derived from path
    // which is already in the dependency array. Including it would cause
    // unnecessary re-runs because callers pass a new array reference each render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, description, path, type, image, noindex]);
}

export { SITE_NAME, SITE_URL, DEFAULT_DESCRIPTION };
