import { useState, useMemo } from 'react';
import PageHeader from '../components/layout/PageHeader';
import Section from '../components/layout/Section';
import EventCard from '../components/content/EventCard';
import CategoryFilter from '../components/ui/CategoryFilter';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import ErrorBanner from '../components/ui/ErrorBanner';
import useApiData from '../hooks/useApiData';
import { adaptEventList } from '../lib/adapters';
import { events as staticEvents } from '../data/events';
import useSeo from '../hooks/useSeo';

const statusFilters = ['Semua', 'Mendatang', 'Selesai'];

export default function Announcements() {
  const { data: events, loading, error, retry } = useApiData({
    url: '/events?published=true',
    fallback: staticEvents,
    adapter: adaptEventList,
  });
  useSeo({
    title: 'Pengumuman & Event',
    description: 'Informasi pengumuman, jadwal kegiatan, dan event mendatang dari Karang Taruna Mangga Dua Selatan.',
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
    let result = [...(events || [])].sort((a, b) => new Date(b.date) - new Date(a.date));
    if (activeStatus !== 'Semua') {
      result = result.filter((e) => e.status === activeStatus);
    }
    return result;
  }, [activeStatus, events]);

  return (
    <>
      <PageHeader
        title="Pengumuman & Event"
        description="Informasi pengumuman dan jadwal kegiatan Karang Taruna Mangga Dua Selatan."
        breadcrumbs={[{ label: 'Pengumuman' }]}
      />

      <Section>
        <CategoryFilter
          categories={statusFilters}
          active={activeStatus}
          onChange={setActiveStatus}
        />

        {error && <ErrorBanner message={error} onRetry={retry} className="my-4" />}
        <div className="space-y-4">
          {loading ? (
            <LoadingSpinner label="Memuat pengumuman..." />
          ) : filteredEvents.length === 0 ? (
            <div className="text-center py-12">
              <p className="font-body text-body-lg text-text-muted">
                Tidak ada pengumuman dalam kategori ini.
              </p>
            </div>
          ) : (
            filteredEvents.map((event, i) => (
              <EventCard key={event.id} index={i} event={event} />
            ))
          )}
        </div>
      </Section>
    </>
  );
}
