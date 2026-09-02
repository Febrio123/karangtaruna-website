import { getCloudinaryUrl } from '../../utils/cloudinary';
import { clsx } from 'clsx';

/**
 * Aspect-ratio values supported by the responsive box reservation.
 */
const ASPECT_MAP = {
  video: '16 / 9',
  square: '1 / 1',
  '4/3': '4 / 3',
  '3/2': '3 / 2',
};

function resolveAspect(aspect) {
  if (!aspect) return null;
  return { aspectRatio: ASPECT_MAP[aspect] || aspect, width: '100%', height: 'auto' };
}

/**
 * Dual-source, performance-aware image renderer.
 *
 * Two mutually exclusive sources are supported:
 *
 *  1. `src`  — a plain URL or `data:<mime>;base64,...` data-URI. Used when media
 *     is stored locally (test/dev without Cloudinary). Renders a plain `<img>`
 *     with NO Cloudinary transformations and NO responsive srcSet/sizes.
 *  2. `publicId` — a Cloudinary public id. Builds a fully-optimised CDN URL with
 *     auto format/quality (`f_auto`/`q_auto`) and a responsive `srcSet`/`sizes`
 *     so mobile users never download desktop-sized raster. Used in production.
 *
 * Priority: if `src` is provided (URL or data-URI) it is rendered directly;
 * otherwise `publicId` falls back to the Cloudinary pipeline.
 *
 * Both paths reserve their box (via `aspect-ratio` or width/height) to prevent
 * CLS, lazy-load below-the-fold images (`eager` opts out for LCP), and hide any
 * broken image on error so no broken-image icon ever appears.
 */
export default function CloudinaryImage({
  publicId,
  src = null,
  alt = '',
  width = 800,
  aspect = null, // e.g. 'video' (16/9) | 'square' (1/1) | '4/3' | '3/2'
  sizes = '100vw',
  className = '',
  eager = false,
  imgClassName = '',
}) {
  // --- src path (URL or data-URI): render plain <img>, no Cloudinary ---
  if (src) {
    const style = resolveAspect(aspect);
    return (
      <div className={clsx('overflow-hidden', className)} style={style}>
        <img
          src={src}
          alt={alt}
          width={width}
          loading={eager ? 'eager' : 'lazy'}
          decoding="async"
          className={clsx('w-full h-full object-cover', imgClassName)}
          onError={(e) => {
            e.currentTarget.style.display = 'none';
          }}
        />
      </div>
    );
  }

  // --- Cloudinary path: needs a public id -----------------------------
  if (!publicId) return null;

  // Breakpoints used by the responsive srcSet (matches common Tailwind grid cols).
  const srcsetWidths = [320, 480, 640, 768, 1024, width].filter(
    (w, i, arr) => arr.indexOf(w) === i
  );

  const cloudinarySrc = getCloudinaryUrl(publicId, { width, crop: 'fill', gravity: 'auto' });
  const srcSet = srcsetWidths
    .map((w) => `${getCloudinaryUrl(publicId, { width: w, crop: 'fill', gravity: 'auto' })} ${w}w`)
    .join(', ');

  // Reserve space to avoid layout shift (CLS). Prefer a native arithmetic
  // aspect-ratio so the browser sizes the box before the image loads.
  const style = resolveAspect(aspect);

  return (
    <div className={clsx('overflow-hidden', className)} style={style}>
      <img
        src={cloudinarySrc}
        srcSet={srcSet}
        sizes={sizes}
        alt={alt}
        width={width}
        loading={eager ? 'eager' : 'lazy'}
        decoding="async"
        className={clsx('w-full h-full object-cover', imgClassName)}
        onError={(e) => {
          e.currentTarget.style.display = 'none';
        }}
      />
    </div>
  );
}
