import { useState } from 'react';
import { clsx } from 'clsx';
import { Users, FileText, Calendar, Phone, ChevronRight, ChevronDown } from 'lucide-react';
import PageHeader from '../components/layout/PageHeader';
import Section from '../components/layout/Section';
import Card from '../components/ui/Card';
import useSiteConfig from '../hooks/useSiteConfig';
import { siteConfig as staticSiteConfig } from '../data/siteConfig';
import useSeo from '../hooks/useSeo';

const iconMap = { Users, FileText, Calendar, Phone };

export default function Information() {
  const { data: siteConfig } = useSiteConfig();
  // Live API mungkin belum mengisi `information[]`; fallback ke data statis
  // supaya halaman Informasi tidak kosong.
  const information =
    siteConfig.information && siteConfig.information.length > 0
      ? siteConfig.information
      : staticSiteConfig.information;
  useSeo({
    title: 'Informasi Umum',
    description: 'Berbagai informasi penting tentang keanggotaan, AD/ART, program kerja, dan layanan masyarakat Karang Taruna Mekar Jaya.',
    path: '/informasi',
    jsonLd: [
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Beranda', item: `${window.location.origin}/` },
          { '@type': 'ListItem', position: 2, name: 'Informasi' },
        ],
      },
    ],
  });
  const [expandedId, setExpandedId] = useState(null);

  function toggleSection(id) {
    setExpandedId((prev) => (prev === id ? null : id));
  }

  return (
    <>
      <PageHeader
        title="Informasi Umum"
        description="Berbagai informasi penting tentang Karang Taruna Mekar Jaya."
        breadcrumbs={[{ label: 'Informasi' }]}
      />

      <Section>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {information.map((info) => {
            const Icon = iconMap[info.icon] || FileText;
            const isExpanded = expandedId === info.id;

            return (
              <Card key={info.id} hover>
                <button
                  onClick={() => toggleSection(info.id)}
                  className="w-full text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary rounded-md"
                  aria-expanded={isExpanded}
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 rounded-md bg-primary-light flex items-center justify-center">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h2 className="font-heading text-h3 text-text mb-1">{info.title}</h2>
                      <p className="font-body text-body-base text-text-secondary">
                        {info.description}
                      </p>
                    </div>
                    <ChevronDown
                      className={clsx(
                        'w-5 h-5 text-text-muted shrink-0 transition-transform duration-150',
                        isExpanded && 'rotate-180'
                      )}
                    />
                  </div>
                </button>

                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-border-light">
                    <p className="font-body text-body-base text-text-secondary mb-4">
                      {info.content}
                    </p>

                    {info.requirements && (
                      <div>
                        <h3 className="font-heading text-h4 text-text mb-2">
                          Syarat Keanggotaan
                        </h3>
                        <ul className="list-disc list-inside space-y-1 font-body text-body-base text-text-secondary">
                          {info.requirements.map((req, idx) => (
                            <li key={idx}>{req}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {info.articles && (
                      <div>
                        <h3 className="font-heading text-h4 text-text mb-2">
                          Isi Pokok AD/ART
                        </h3>
                        <ul className="list-disc list-inside space-y-1 font-body text-body-base text-text-secondary">
                          {info.articles.map((article, idx) => (
                            <li key={idx}>{article}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {info.programs && (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left">
                          <thead>
                            <tr className="border-b border-border">
                              <th className="py-2 px-3 font-heading text-caption font-semibold text-text">
                                Program
                              </th>
                              <th className="py-2 px-3 font-heading text-caption font-semibold text-text">
                                Frekuensi
                              </th>
                              <th className="py-2 px-3 font-heading text-caption font-semibold text-text">
                                Status
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {info.programs.map((prog, idx) => (
                              <tr key={idx} className="border-b border-border-light">
                                <td className="py-2 px-3 font-body text-body-base text-text">
                                  {prog.name}
                                </td>
                                <td className="py-2 px-3 font-body text-caption text-text-secondary">
                                  {prog.frequency}
                                </td>
                                <td className="py-2 px-3">
                                  <span
                                    className={clsx(
                                      'text-caption font-body font-medium',
                                      prog.status === 'Berjalan'
                                        ? 'text-success'
                                        : 'text-accent'
                                    )}
                                  >
                                    {prog.status}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}

                    {info.services && (
                      <div className="space-y-3">
                        {info.services.map((service, idx) => (
                          <div
                            key={idx}
                            className="p-3 bg-bg rounded-md border border-border-light"
                          >
                            <p className="font-heading text-body-base font-semibold text-text mb-1">
                              {service.name}
                            </p>
                            <p className="font-body text-caption text-text-secondary">
                              Lokasi: {service.location}
                            </p>
                            <p className="font-body text-caption text-text-secondary">
                              Jadwal: {service.schedule}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      </Section>
    </>
  );
}
