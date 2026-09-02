import { User } from 'lucide-react';
import PageHeader from '../components/layout/PageHeader';
import Section from '../components/layout/Section';
import OrgChart from '../components/special/OrgChart';
import Card from '../components/ui/Card';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import ErrorBanner from '../components/ui/ErrorBanner';
import useApiData from '../hooks/useApiData';
import { adaptTeamList } from '../lib/adapters';
import { teamMembers as staticTeam } from '../data/team';
import useSeo from '../hooks/useSeo';

export default function ProfileStructure() {
  const { data: teamMembers, loading, error, retry } = useApiData({
    url: '/pengurus',
    fallback: staticTeam,
    adapter: adaptTeamList,
  });
  const periode = teamMembers[0]?.period ?? '2025-2027';
  useSeo({
    title: 'Struktur Organisasi',
    description: `Susunan pengurus Karang Taruna Mangga Dua Selatan periode ${periode} beserta struktur organisasi dan pembagian bidang.`,
    path: '/profil/struktur-organisasi',
    jsonLd: [
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Beranda', item: `${window.location.origin}/` },
          { '@type': 'ListItem', position: 2, name: 'Profil', item: `${window.location.origin}/profil` },
          { '@type': 'ListItem', position: 3, name: 'Struktur Organisasi' },
        ],
      },
    ],
  });
  return (
    <>
      <PageHeader
        title="Struktur Organisasi"
        description={`Susunan pengurus Karang Taruna Mangga Dua Selatan periode ${periode}.`}
        breadcrumbs={[
          { label: 'Profil', href: '/profil' },
          { label: 'Struktur Organisasi' },
        ]}
      />

      {/* Org Chart */}
      <Section>
        <h2 className="font-heading text-h2 text-text mb-6">Bagan Organisasi</h2>
        <OrgChart />
      </Section>

      {/* Team list table */}
      <Section className="bg-surface">
        <h2 className="font-heading text-h2 text-text mb-6">Daftar Pengurus</h2>
        {error && <ErrorBanner message={error} onRetry={retry} className="mb-4" />}
        {loading ? (
          <LoadingSpinner label="Memuat daftar pengurus..." />
        ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-border">
                <th className="py-3 px-4 font-heading text-body-base font-semibold text-text">
                  Nama
                </th>
                <th className="py-3 px-4 font-heading text-body-base font-semibold text-text">
                  Jabatan
                </th>
                <th className="py-3 px-4 font-heading text-body-base font-semibold text-text hidden sm:table-cell">
                  Bidang
                </th>
                <th className="py-3 px-4 font-heading text-body-base font-semibold text-text hidden md:table-cell">
                  Periode
                </th>
              </tr>
            </thead>
            <tbody>
              {teamMembers.map((member) => (
                <tr
                  key={member.id}
                  className="border-b border-border-light hover:bg-bg transition-colors duration-150"
                >
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary-light flex items-center justify-center shrink-0">
                        <User className="w-4 h-4 text-primary" />
                      </div>
                      <span className="font-body text-body-base text-text font-medium">
                        {member.name}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4 font-body text-body-base text-primary">
                    {member.position}
                  </td>
                  <td className="py-3 px-4 font-body text-body-base text-text-secondary hidden sm:table-cell">
                    {member.division}
                  </td>
                  <td className="py-3 px-4 font-body text-caption text-text-muted hidden md:table-cell">
                    {member.period}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        )}
      </Section>
    </>
  );
}
