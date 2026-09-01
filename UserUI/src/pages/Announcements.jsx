import { useState, useMemo } from 'react';
import PageHeader from '../components/layout/PageHeader';
import Section from '../components/layout/Section';
import EventCard from '../components/content/EventCard';
import CategoryFilter from '../components/ui/CategoryFilter';
import { events } from '../data/events';
import useSeo from '../hooks/useSeo';

const statusFilters = ['Semua', 'Mendatang', 'Selesai'];

export default function Announcements() {
  useSeo({
    title: 'Pengumuman & Event',
    description: 'Informasi pengumuman, jadwal kegiatan, dan event mendatang dari Karang Taruna Mekar Jaya.',
    path: '/pengumuman',
    jsonLd: [
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Beranda', item: `${window.location.origin}/` },
          { '@type': 'ListItem', position: 2, name: 'Pengumuman' },
        ],
      },
    ],
  });
  const [activeStatus, setActiveStatus] = useState('Semua');

  const filteredEvents = useMemo(() => {
    let result = [...events].sort((a, b) => new Date(b.date) - new Date(a.date));
    if (activeStatus !== 'Semua') {
      result = result.filter((e) => e.status === activeStatus);
    }
    return result;
  }, [activeStatus]);

  return (
    <>
      <PageHeader
        title="Pengumuman & Event"
        description="Informasi pengumuman dan jadwal kegiatan Karang Taruna Mekar Jaya."
        breadcrumbs={[{ label: 'Pengumuman' }]}
      />

      <Section>
        <CategoryFilter
          categories={statusFilters}
          active={activeStatus}
          onChange={setActiveStatus}
        />

        <div className="space-y-4">
          {filteredEvents.length === 0 ? (
            <div className="text-center py-12">
              <p className="font-body text-body-lg text-text-muted">
                Tidak ada pengumuman dalam kategori ini.
              </p>
            </div>
          ) : (
            filteredEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))
          )}
        </div>
      </Section>
    </>
  );
}
