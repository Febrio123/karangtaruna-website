import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Megaphone } from 'lucide-react';
import HeroSection from '../components/special/HeroSection';
import StatsCard from '../components/content/StatsCard';
import ArticleCard from '../components/content/ArticleCard';
import Section from '../components/layout/Section';
import Container from '../components/layout/Container';
import Card from '../components/ui/Card';
import { articles } from '../data/articles';
import { events } from '../data/events';
import { galleryItems } from '../data/gallery';
import { budgetData } from '../data/budget';
import { siteConfig } from '../data/siteConfig';
import { formatRupiah } from '../utils/formatCurrency';
import GalleryItem from '../components/content/GalleryItem';
import useSeo, { SITE_URL } from '../hooks/useSeo';

const ITEMS_PER_PAGE = 3;

export default function Home() {
  const latestArticles = useMemo(
    () =>
      [...articles]
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, ITEMS_PER_PAGE),
    []
  );

  const latestEvents = useMemo(
    () => events.filter((e) => e.status === 'Mendatang').slice(0, 2),
    []
  );

  const latestGallery = useMemo(() => galleryItems.slice(0, 8), []);

  const budgetSummary = useMemo(() => {
    const data = budgetData[2026];
    if (!data) return null;
    const totalIncome = data.income.reduce((sum, item) => sum + item.amount, 0);
    const totalExpenses = data.expenses.reduce((sum, item) => sum + item.amount, 0);
    return { totalIncome, totalExpenses };
  }, []);

  // SEO: home page uses site name as title (no suffix)
  const jsonLd = useMemo(() => [
    {
      '@context': 'https://schema.org',
      '@type': 'NGO',
      name: siteConfig.name,
      url: SITE_URL,
      logo: `${SITE_URL}/favicon.svg`,
      description: siteConfig.tagline,
      address: {
        '@type': 'PostalAddress',
        streetAddress: 'Jl. Raya Mekar Jaya No. 12',
        addressLocality: 'Kel. Mekar Jaya, Kec. Sukmajaya',
        addressRegion: 'Kota Depok, Jawa Barat',
        postalCode: '16411',
        addressCountry: 'ID',
      },
      contactPoint: {
        '@type': 'ContactPoint',
        telephone: '+6281234567890',
        email: siteConfig.email,
        contactType: 'customer service',
      },
      sameAs: [
        siteConfig.socialMedia.instagram,
        siteConfig.socialMedia.facebook,
      ].filter(Boolean),
    },
  ], []);

  useSeo({ path: '/', jsonLd });

  return (
    <>
      <HeroSection />

      {/* Important announcement */}
      {latestEvents.length > 0 && (
        <Section className="!py-0 !pt-6">
          <div className="bg-accent-light border border-accent/20 rounded-md p-4 flex items-start gap-3">
            <Megaphone className="w-5 h-5 text-accent shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="font-body text-body-base text-text">
                <span className="font-semibold">Pengumuman:</span>{' '}
                {latestEvents[0].title}
              </p>
            </div>
            <Link
              to="/pengumuman"
              className="flex items-center gap-1 text-body-base font-body font-semibold text-accent hover:opacity-80 transition-opacity duration-150 shrink-0"
            >
              Lihat
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </Section>
      )}

      {/* Stats */}
      <Section>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatsCard value={`${siteConfig.stats.members}+`} label="Anggota Aktif" />
          <StatsCard value={siteConfig.stats.programs} label="Program Kerja" />
          <StatsCard value={`${siteConfig.stats.yearsActive} Tahun`} label="Berdiri" />
        </div>
      </Section>

      {/* Latest activities */}
      <Section className="bg-surface">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-heading text-h2 text-text">Kegiatan Terkini</h2>
          <Link
            to="/berita"
            className="flex items-center gap-1 text-body-base font-body font-semibold text-primary hover:text-primary-hover transition-colors duration-150"
          >
            Lihat Semua
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {latestArticles.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      </Section>

      {/* Gallery preview */}
      <Section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-heading text-h2 text-text">Dari Galeri Kami</h2>
          <Link
            to="/galeri"
            className="flex items-center gap-1 text-body-base font-body font-semibold text-primary hover:text-primary-hover transition-colors duration-150"
          >
            Lihat Semua
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {latestGallery.map((item) => (
            <Link key={item.id} to="/galeri">
              <GalleryItem item={item} onClick={() => {}} />
            </Link>
          ))}
        </div>
      </Section>

      {/* Budget preview */}
      {budgetSummary && (
        <Section className="bg-surface">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="font-heading text-h2 text-text mb-4">
              Transparansi Keuangan
            </h2>
            <Card>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <p className="text-caption text-text-secondary font-body mb-1">
                    Pemasukan 2026
                  </p>
                  <p className="font-heading text-h3 text-success">
                    {formatRupiah(budgetSummary.totalIncome)}
                  </p>
                </div>
                <div>
                  <p className="text-caption text-text-secondary font-body mb-1">
                    Pengeluaran 2026
                  </p>
                  <p className="font-heading text-h3 text-danger">
                    {formatRupiah(budgetSummary.totalExpenses)}
                  </p>
                </div>
              </div>
              <Link
                to="/anggaran"
                className="inline-flex items-center gap-1 text-body-base font-body font-semibold text-primary hover:text-primary-hover transition-colors duration-150 mt-4"
              >
                Lihat Laporan Lengkap
                <ChevronRight className="w-4 h-4" />
              </Link>
            </Card>
          </div>
        </Section>
      )}
    </>
  );
}
