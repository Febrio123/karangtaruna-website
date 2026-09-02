import { Mail, Phone, MapPin, Clock, ExternalLink } from 'lucide-react';
import PageHeader from '../components/layout/PageHeader';
import Section from '../components/layout/Section';
import Card from '../components/ui/Card';
import ContactForm from '../components/special/ContactForm';
import LocationMap from '../components/special/LocationMap';
import useSiteConfig from '../hooks/useSiteConfig';
import useSeo, { SITE_URL } from '../hooks/useSeo';

export default function Contact() {
  const { data: siteConfig } = useSiteConfig();
  useSeo({
    title: 'Kontak',
    description: 'Hubungi Karang Taruna Mangga Dua Selatan — alamat, telepon, email, dan peta lokasi sekretariat di Kelurahan Mangga Dua Selatan, Depok.',
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
                <div className="flex gap-3">
                  {siteConfig.socialMedia.instagram && (
                    <a
                      href={siteConfig.socialMedia.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-body-base font-body text-text-secondary hover:text-primary transition-colors duration-150"
                    >
                      Instagram
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
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
