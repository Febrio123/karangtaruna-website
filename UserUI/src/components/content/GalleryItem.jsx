import { memo } from 'react';
import { clsx } from 'clsx';
import { Play } from 'lucide-react';
import CloudinaryImage from './CloudinaryImage';

function GalleryItem({ item, onClick }) {
  return (
    <button
      onClick={() => onClick(item)}
      className={clsx(
        'group relative aspect-square overflow-hidden rounded-md',
        'bg-bg-alt border border-border-light',
        'transition-shadow duration-150 ease-out hover:shadow-md',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary',
        'cursor-pointer'
      )}
      aria-label={`Lihat detail: ${item.title}`}
    >
      {/* Image (lazy-loaded Cloudinary) or placeholder */}
      {item.image ? (
        <CloudinaryImage
          publicId={item.media?.public_id ?? item.image}
          src={item.media?.secure_url ?? null}
          alt={item.imageAlt}
          aspect="square"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          imgClassName="transition-transform duration-300 group-hover:scale-105"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-bg-alt">
          <div className="text-center p-4">
            <span className="block text-h3 font-heading text-text-muted mb-1">KT</span>
            <span className="text-caption text-text-muted">{item.category}</span>
          </div>
        </div>
      )}

      {/* Video indicator */}
      {item.type === 'video' && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-white/80 flex items-center justify-center shadow-md">
            <Play className="w-5 h-5 text-primary ml-0.5" />
          </div>
        </div>
      )}

      {/* Hover overlay */}
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-150 flex items-end">
        <div className="w-full p-3 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-150">
          <p className="font-heading text-body-base font-semibold line-clamp-1">
            {item.title}
          </p>
          <p className="font-body text-caption opacity-80">{item.category}</p>
        </div>
      </div>
    </button>
  );
}

export default memo(GalleryItem);
