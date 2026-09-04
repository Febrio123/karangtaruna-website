import { Mail, Phone, MapPin, Clock, ExternalLink, Music2 } from 'lucide-react';
import heroImg from '../assets/hero2.png';
import PageHeader from '../components/layout/PageHeader';
import Section from '../components/layout/Section';
import Card from '../components/ui/Card';
import ContactForm from '../components/special/ContactForm';
import LocationMap from '../components/special/LocationMap';
import useSiteConfig from '../hooks/useSiteConfig';
import useSeo, { SITE_URL } from '../hooks/useSeo';

// Brand icons (Instagram/Facebook/YouTube) tidak lagi tersedia di lucide-react
// versi terbaru, jadi didefinisikan sebagai icon SVG khusus agar tetap dinamis.
const Instagram = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);
const Facebook = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);
const Youtube = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17" />
    <path d="m10 15 5-3-5-3z" />
  </svg>
);

export default function Contact() {
  const { data: siteConfig } = useSiteConfig();
  useSeo({
    title: 'Kontak',
    description: 'Hubungi Karang Taruna Mangga Dua Selatan — alamat, telepon, email, dan peta lokasi sekretariat di Kelurahan Mangga Dua Selatan, Jakarta Pusat.',
    path: '/kontak',
    jsonLd: [
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Beranda', item: `${SITE_URL}/` },
          { '@type': 'ListItem', position: 2, name: 'Kontak' },
        ],
      },
      {
        '@context': 'https://schema.org',
        '@type': 'ContactPoint',
        contactType: 'customer service',
        telephone: '+6281234567890',
        email: siteConfig.email,
        areaServed: 'ID',
        availableLanguage: 'Indonesian',
      },
    ],
  });
  return (
    <>
      <PageHeader
        title="Hubungi Kami"
        description="Kami siap mendengar dari Anda."
        breadcrumbs={[{ label: 'Kontak' }]}
        image={heroImg}
      />

      <Section>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Form */}
          <div className="lg:col-span-3">
            <h2 className="font-heading text-h3 text-text mb-4">Kirim Pesan</h2>
            <ContactForm />
          </div>

          {/* Contact info */}
          <div className="lg:col-span-2">
            <h2 className="font-heading text-h3 text-text mb-4">Informasi Kontak</h2>
            <Card>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <p className="font-heading text-body-base font-semibold text-text mb-0.5">
                      Alamat
                    </p>
                    <p className="font-body text-body-base text-text-secondary">
                      {siteConfig.address}
                    </p>
                  </div>
                </div>

                {siteConfig.phone && (
                  <div className="flex items-start gap-3">
                    <Phone className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <div>
                      <p className="font-heading text-body-base font-semibold text-text mb-0.5">
                        Telepon
                      </p>
                      <a
                        href={`tel:${siteConfig.phone.replace(/-/g, '')}`}
                        className="font-body text-body-base text-text-secondary hover:text-primary transition-colors duration-150"
                      >
                        {siteConfig.phone}
                      </a>
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <p className="font-heading text-body-base font-semibold text-text mb-0.5">
                      Email
                    </p>
                    <a
                      href={`mailto:${siteConfig.email}`}
                      className="font-body text-body-base text-text-secondary hover:text-primary transition-colors duration-150"
                    >
                      {siteConfig.email}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <p className="font-heading text-body-base font-semibold text-text mb-0.5">
                      Jam Operasional
                    </p>
                    <p className="font-body text-body-base text-text-secondary">
                      {siteConfig.operatingHours}
                    </p>
                  </div>
                </div>
              </div>

              {/* Social media */}
              <div className="mt-6 pt-4 border-t border-border-light">
                <p className="font-heading text-body-base font-semibold text-text mb-2">
                  Media Sosial
                </p>
                <div className="flex flex-wrap gap-3">
                  {Object.entries(siteConfig.socialMedia)
                    .filter(([, url]) => url)
                    .map(([key, url]) => {
                      const socialIcon = { Instagram, TikTok: Music2, Facebook, Youtube };
                      const socialLabel = { instagram: 'Instagram', tiktok: 'TikTok', facebook: 'Facebook', youtube: 'YouTube' };
                      const Icon = socialIcon[key.charAt(0).toUpperCase() + key.slice(1)] || ExternalLink;
                      return (
                        <a
                          key={key}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-body-base font-body text-text-secondary hover:text-primary transition-colors duration-150"
                        >
                          <Icon className="w-4 h-4" />
                          {socialLabel[key] || key}
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      );
                    })}
                </div>
              </div>
            </Card>
          </div>
        </div>
      </Section>

      {/* Map */}
      <Section className="bg-surface">
        <h2 className="font-heading text-h2 text-text mb-6">Lokasi Kami</h2>
        <LocationMap />
      </Section>
    </>
  );
}
