import PageHeader from '../components/layout/PageHeader';
import Section from '../components/layout/Section';
import TimelineItem from '../components/content/TimelineItem';
import useSiteConfig from '../hooks/useSiteConfig';
import useSeo from '../hooks/useSeo';

export default function ProfileHistory() {
  const { data: siteConfig } = useSiteConfig();
  useSeo({
    title: 'Sejarah',
    description: 'Perjalanan Karang Taruna Mekar Jaya dari awal berdiri pada tahun 2018 hingga saat ini. Organisasi pemuda yang terus berkembang.',
    path: '/profil/sejarah',
    jsonLd: [
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Beranda', item: `${window.location.origin}/` },
          { '@type': 'ListItem', position: 2, name: 'Profil', item: `${window.location.origin}/profil` },
          { '@type': 'ListItem', position: 3, name: 'Sejarah' },
        ],
      },
    ],
  });
  return (
    <>
      <PageHeader
        title="Sejarah Karang Taruna"
        description="Perjalanan Karang Taruna Mekar Jaya dari awal berdiri hingga saat ini."
        breadcrumbs={[
          { label: 'Profil', href: '/profil' },
          { label: 'Sejarah' },
        ]}
      />

      <Section>
        <div className="max-w-content">
          <p className="font-body text-body-lg text-text-secondary mb-8 leading-relaxed">
            {siteConfig.history.summary}
          </p>

          <div className="space-y-0">
            {siteConfig.history.timeline.map((item, index) => (
              <TimelineItem
                key={index}
                item={item}
                isLast={index === siteConfig.history.timeline.length - 1}
              />
            ))}
          </div>
        </div>
      </Section>
    </>
  );
}
