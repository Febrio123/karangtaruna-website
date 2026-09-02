import { useState, useMemo } from 'react';
import PageHeader from '../components/layout/PageHeader';
import Section from '../components/layout/Section';
import GalleryItem from '../components/content/GalleryItem';
import CategoryFilter from '../components/ui/CategoryFilter';
import Lightbox from '../components/special/Lightbox';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import ErrorBanner from '../components/ui/ErrorBanner';
import useApiData from '../hooks/useApiData';
import { adaptGalleryList } from '../lib/adapters';
import { galleryItems as staticGallery, galleryCategories } from '../data/gallery';
import useSeo from '../hooks/useSeo';

export default function Gallery() {
  const { data: galleryItems, loading, error, retry } = useApiData({
    url: '/galeri',
    fallback: staticGallery,
    adapter: adaptGalleryList,
  });
  useSeo({
    title: 'Galeri',
    description: 'Dokumentasi foto dan video kegiatan Karang Taruna Mangga Dua Selatan — momen kerja bakti, turnamen olahraga, dan program sosial.',
    path: '/galeri',
    jsonLd: [
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Beranda', item: `${window.location.origin}/` },
          { '@type': 'ListItem', position: 2, name: 'Galeri' },
        ],
      },
    ],
  });
  const [activeCategory, setActiveCategory] = useState('Semua');
  const [lightboxItem, setLightboxItem] = useState(null);

  const filteredItems = useMemo(() => {
    const items = galleryItems || [];
    if (activeCategory === 'Semua') return items;
    return items.filter(
      (item) => item.category === activeCategory || item.year === activeCategory
    );
  }, [activeCategory, galleryItems]);

  return (
    <>
      <PageHeader
        title="Galeri Kegiatan"
        description="Dokumentasi foto dan video kegiatan Karang Taruna Mangga Dua Selatan."
        breadcrumbs={[{ label: 'Galeri' }]}
      />

      <Section>
        <CategoryFilter
          categories={galleryCategories}
          active={activeCategory}
          onChange={setActiveCategory}
        />

        {error && <ErrorBanner message={error} onRetry={retry} className="my-4" />}
        {loading ? (
          <LoadingSpinner label="Memuat galeri..." />
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-12">
            <p className="font-body text-body-lg text-text-muted">
              Tidak ada item galeri dalam kategori ini.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {filteredItems.map((item, i) => (
              <GalleryItem
                key={item.id}
                index={i}
                item={item}
                onClick={setLightboxItem}
              />
            ))}
          </div>
        )}
      </Section>

      {/* Lightbox */}
      {lightboxItem && (
        <Lightbox
          item={lightboxItem}
          items={filteredItems}
          onClose={() => setLightboxItem(null)}
          onNavigate={setLightboxItem}
        />
      )}
    </>
  );
}
