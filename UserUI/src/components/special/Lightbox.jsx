import { useEffect, useRef } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import CloudinaryImage from '../content/CloudinaryImage';

export default function Lightbox({ item, items, onClose, onNavigate }) {
  const closeButtonRef = useRef(null);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    closeButtonRef.current?.focus();

    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') {
        const idx = items.findIndex((i) => i.id === item.id);
        if (idx > 0) onNavigate(items[idx - 1]);
      }
      if (e.key === 'ArrowRight') {
        const idx = items.findIndex((i) => i.id === item.id);
        if (idx < items.length - 1) onNavigate(items[idx + 1]);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [item, items, onClose, onNavigate]);

  const currentIndex = items.findIndex((i) => i.id === item.id);
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < items.length - 1;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-label={item.title}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/90 lightbox-backdrop"
        onClick={onClose}
      />

      {/* Content */}
      <div className="relative z-10 w-full max-w-4xl mx-4 lightbox-content">
        {/* Close button */}
        <button
          ref={closeButtonRef}
          onClick={onClose}
          className="absolute -top-12 right-0 p-2 text-white hover:text-white/70 transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white z-20"
          aria-label="Tutup galeri"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Navigation */}
        {hasPrev && (
          <button
            onClick={() => onNavigate(items[currentIndex - 1])}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-full mr-4 p-2 text-white hover:text-white/70 transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            aria-label="Gambar sebelumnya"
          >
            <ChevronLeft className="w-8 h-8" />
          </button>
        )}

        {hasNext && (
          <button
            onClick={() => onNavigate(items[currentIndex + 1])}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-full ml-4 p-2 text-white hover:text-white/70 transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            aria-label="Gambar selanjutnya"
          >
            <ChevronRight className="w-8 h-8" />
          </button>
        )}

        {/* Image */}
        <div className="bg-surface rounded-lg overflow-hidden shadow-xl">
          {item.image ? (
            <div className="aspect-video bg-bg-alt">
              <CloudinaryImage
                publicId={item.image}
                alt={item.imageAlt}
                aspect="video"
                eager
                sizes="(max-width: 1280px) 90vw, 1024px"
              />
            </div>
          ) : (
            <div className="aspect-video bg-bg-alt flex items-center justify-center">
              <div className="text-center p-8">
                <span className="block text-h1 font-heading text-text-muted mb-2">KT</span>
                <span className="text-body-base text-text-muted">{item.category}</span>
              </div>
            </div>
          )}

          {/* Caption */}
          <div className="p-4">
            <h3 className="font-heading text-h4 text-text mb-1">{item.title}</h3>
            <p className="font-body text-body-base text-text-secondary">
              {item.description}
            </p>
            <p className="font-body text-caption text-text-muted mt-2">
              {currentIndex + 1} / {items.length}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
