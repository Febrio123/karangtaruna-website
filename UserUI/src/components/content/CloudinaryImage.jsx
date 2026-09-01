import { getCloudinaryUrl } from '../../utils/cloudinary';
import { clsx } from 'clsx';

/**
 * Performance-aware Cloudinary image renderer.
 *
 * Key optimisations baked in:
 *  - Auto format (f_auto) + auto quality (q_auto) via the URL transform, so the
 *    CDN serves the smallest/format best for each visitor.
 *  - Responsive `srcSet`/`sizes` with a width-scaled URL per breakpoint so
 *    mobile users never download desktop-sized raster.
 *  - `loading="lazy"` + `decoding="async"` for below-the-fold images (pass
 *    `eager` to opt out for above-the-fold LCP images).
 *  - Reserved box (`width`/`height` or `aspect-ratio`) to prevent CLS while
 *    the image streams in.
 *
 * When `publicId` is null/undefined the component renders nothing, letting the
 * caller keep its existing text placeholder (current project state).
 */
export default function CloudinaryImage({
  publicId,
  alt = '',
  width = 800,
  aspect = null, // e.g. 'video' (16/9) | 'square' (1/1) | '4/3' | '3/2'
  sizes = '100vw',
  className = '',
  eager = false,
  imgClassName = '',
}) {
  if (!publicId) return null;

  // Breakpoints used by the responsive srcSet (matches common Tailwind grid cols).
  const srcsetWidths = [320, 480, 640, 768, 1024, width].filter(
    (w, i, arr) => arr.indexOf(w) === i
  );

  const src = getCloudinaryUrl(publicId, { width, crop: 'fill', gravity: 'auto' });
  const srcSet = srcsetWidths
    .map((w) => `${getCloudinaryUrl(publicId, { width: w, crop: 'fill', gravity: 'auto' })} ${w}w`)
    .join(', ');

  // Reserve space to avoid layout shift (CLS). Prefer a native arithmetic
  // aspect-ratio so the browser sizes the box before the image loads.
  let style = null;
  if (aspect) {
    const map = { video: '16 / 9', square: '1 / 1', '4/3': '4 / 3', '3/2': '3 / 2' };
    const ratio = map[aspect] || aspect;
    style = { aspectRatio: ratio, width: '100%', height: 'auto' };
  }

  return (
    <div className={clsx('overflow-hidden', className)} style={style}>
      <img
        src={src}
        srcSet={srcSet}
        sizes={sizes}
        alt={alt}
        width={width}
        loading={eager ? 'eager' : 'lazy'}
        decoding="async"
        className={clsx('w-full h-full object-cover', imgClassName)}
      />
    </div>
  );
}
