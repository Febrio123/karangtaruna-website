import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import PageHeader from '../components/layout/PageHeader';
import Section from '../components/layout/Section';
import TimelineItem from '../components/content/TimelineItem';
import OrgChart from '../components/special/OrgChart';
import useSiteConfig from '../hooks/useSiteConfig';
import useSeo from '../hooks/useSeo';

export default function Profile() {
  const { data: siteConfig } = useSiteConfig();
  useSeo({
    title: 'Profil',
    description: 'Mengenal lebih dekat Karang Taruna Mangga Dua Selatan — sejarah, visi, misi, dan struktur organisasi pemuda di Kelurahan Mangga Dua Selatan, Depok.',
    path: '/profil',
    jsonLd: [
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Beranda', item: `${window.location.origin}/` },
          { '@type': 'ListItem', position: 2, name: 'Profil' },
        ],
      },
    ],
  });
  return (
    <>
      <PageHeader
        title="Tentang Karang Taruna"
        description="Mengenal lebih dekat organisasi pemuda di Kelurahan Mangga Dua Selatan."
        breadcrumbs={[{ label: 'Profil' }]}
      />

      {/* Sejarah Ringkas */}
      <Section>
        <div className="max-w-content">
          <h2 className="font-heading text-h2 text-text mb-4">Sejarah Singkat</h2>
          <p className="font-body text-body-lg text-text-secondary mb-4">
            {siteConfig.history.summary}
          </p>
          <Link
            to="/profil/sejarah"
            className="inline-flex items-center gap-1 text-body-base font-body font-semibold text-primary hover:text-primary-hover transition-colors duration-150"
          >
            Baca Selengkapnya
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </Section>

      {/* Visi & Misi */}
      <Section className="bg-surface">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-content">
          <div>
            <h2 className="font-heading text-h2 text-text mb-4">Visi</h2>
            <p className="font-body text-body-lg text-text-secondary leading-relaxed">
              {siteConfig.vision}
            </p>
          </div>
          <div>
            <h2 className="font-heading text-h2 text-text mb-4">Misi</h2>
            <ol className="list-decimal list-inside space-y-2 font-body text-body-base text-text-secondary">
              {siteConfig.mission.map((item, index) => (
                <li key={index} className="leading-relaxed">
                  {item}
                </li>
              ))}
            </ol>
          </div>
        </div>
        <Link
          to="/profil/visi-misi"
          className="inline-flex items-center gap-1 text-body-base font-body font-semibold text-primary hover:text-primary-hover transition-colors duration-150 mt-6"
        >
          Lihat Detail
          <ChevronRight className="w-4 h-4" />
        </Link>
      </Section>

      {/* Struktur Organisasi Preview */}
      <Section>
        <h2 className="font-heading text-h2 text-text mb-6">Struktur Organisasi</h2>
        <OrgChart />
        <div className="mt-6 text-center">
          <Link
            to="/profil/struktur-organisasi"
            className="inline-flex items-center gap-1 text-body-base font-body font-semibold text-primary hover:text-primary-hover transition-colors duration-150"
          >
            Lihat Struktur Lengkap
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </Section>
    </>
  );
}
