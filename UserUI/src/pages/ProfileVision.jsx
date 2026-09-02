import PageHeader from '../components/layout/PageHeader';
import Section from '../components/layout/Section';
import Card from '../components/ui/Card';
import useSiteConfig from '../hooks/useSiteConfig';
import useSeo from '../hooks/useSeo';

export default function ProfileVision() {
  const { data: siteConfig } = useSiteConfig();
  useSeo({
    title: 'Visi & Misi',
    description: 'Visi dan misi Karang Taruna Mangga Dua Selatan dalam membangun pemuda yang beriman, kreatif, dan bertanggung jawab bagi masyarakat.',
    path: '/profil/visi-misi',
    jsonLd: [
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Beranda', item: `${window.location.origin}/` },
          { '@type': 'ListItem', position: 2, name: 'Profil', item: `${window.location.origin}/profil` },
          { '@type': 'ListItem', position: 3, name: 'Visi & Misi' },
        ],
      },
    ],
  });
  return (
    <>
      <PageHeader
        title="Visi & Misi"
        description="Arah dan tujuan organisasi Karang Taruna Mangga Dua Selatan."
        breadcrumbs={[
          { label: 'Profil', href: '/profil' },
          { label: 'Visi & Misi' },
        ]}
      />

      <Section>
        <div className="max-w-content space-y-8">
          {/* Visi */}
          <div>
            <h2 className="font-heading text-h2 text-text mb-4">Visi</h2>
            <Card>
              <p className="font-body text-body-lg text-text-secondary leading-relaxed italic">
                &ldquo;{siteConfig.vision}&rdquo;
              </p>
            </Card>
          </div>

          {/* Misi */}
          <div>
            <h2 className="font-heading text-h2 text-text mb-4">Misi</h2>
            <ol className="space-y-4">
              {siteConfig.mission.map((item, index) => (
                <li key={index} className="flex gap-4">
                  <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-heading text-body-base font-bold">
                    {index + 1}
                  </span>
                  <p className="font-body text-body-base text-text-secondary pt-1 leading-relaxed">
                    {item}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </Section>
    </>
  );
}
