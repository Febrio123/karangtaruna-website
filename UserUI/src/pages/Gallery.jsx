import { useState, useMemo } from 'react';
import PageHeader from '../components/layout/PageHeader';
import Section from '../components/layout/Section';
import GalleryItem from '../components/content/GalleryItem';
import CategoryFilter from '../components/ui/CategoryFilter';
import Lightbox from '../components/special/Lightbox';
import { galleryItems, galleryCategories } from '../data/gallery';
import useSeo from '../hooks/useSeo';

export default function Gallery() {
  useSeo({
    title: 'Galeri',
    description: 'Dokumentasi foto dan video kegiatan Karang Taruna Mekar Jaya — momen kerja bakti, turnamen olahraga, dan program sosial.',
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
    if (activeCategory === 'Semua') return galleryItems;
    return galleryItems.filter(
      (item) => item.category === activeCategory || item.year === activeCategory
    );
  }, [activeCategory]);

  return (
    <>
      <PageHeader
        title="Galeri Kegiatan"
        description="Dokumentasi foto dan video kegiatan Karang Taruna Mekar Jaya."
        breadcrumbs={[{ label: 'Galeri' }]}
      />

      <Section>
        <CategoryFilter
          categories={galleryCategories}
          active={activeCategory}
          onChange={setActiveCategory}
        />

        {filteredItems.length === 0 ? (
          <div className="text-center py-12">
            <p className="font-body text-body-lg text-text-muted">
              Tidak ada item galeri dalam kategori ini.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {filteredItems.map((item) => (
              <GalleryItem
                key={item.id}
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
