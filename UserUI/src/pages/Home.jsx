import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ChevronRight, Megaphone } from 'lucide-react';
import HeroSection from '../components/special/HeroSection';
import StatsCard from '../components/content/StatsCard';
import ArticleCard from '../components/content/ArticleCard';
import Section from '../components/layout/Section';
import Container from '../components/layout/Container';
import Card from '../components/ui/Card';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import ErrorBanner from '../components/ui/ErrorBanner';
import { articles as staticArticles } from '../data/articles';
import { events as staticEvents } from '../data/events';
import { galleryItems as staticGallery } from '../data/gallery';
import { budgetData as staticBudget } from '../data/budget';
import { formatRupiah } from '../utils/formatCurrency';
import GalleryItem from '../components/content/GalleryItem';
import useApiData from '../hooks/useApiData';
import useSiteConfig from '../hooks/useSiteConfig';
import { adaptArticleList, adaptEventList, adaptGalleryList, adaptPrediksi } from '../lib/adapters';
import useSeo, { SITE_URL } from '../hooks/useSeo';

const ITEMS_PER_PAGE = 3;

export default function Home() {
  const { data: siteConfig } = useSiteConfig();

  // LIVE articles -> 3 terbaru (fallback: statis)
  const articles = useApiData({
    url: '/articles?published=true',
    fallback: staticArticles,
    adapter: adaptArticleList,
  });

  // LIVE events -> pengumuman/event 'Mendatang' (fallback: statis)
  const events = useApiData({
    url: '/events?published=true',
    fallback: staticEvents,
    adapter: adaptEventList,
  });

  // LIVE galeri -> 8 teratas (fallback: statis; API saat ini total 0)
  const gallery = useApiData({
    url: '/galeri',
    fallback: staticGallery,
    adapter: adaptGalleryList,
  });

  // LIVE ringkasan anggaran 2026 (fallback: statis budgetData[2026])
  const budget = useApiData({
    url: '/transaksi-anggaran/ringkasan?tahun=2026',
    fallback: () => {
      const d = staticBudget[2026];
      if (!d) return null;
      return {
        totalPemasukan: d.income.reduce((s, i) => s + i.amount, 0),
        totalPengeluaran: d.expenses.reduce((s, i) => s + i.amount, 0),
      };
    },
    adapter: (raw) =>
      raw
        ? {
            totalPemasukan: Number(raw.totalPemasukan) || 0,
            totalPengeluaran: Number(raw.totalPengeluaran) || 0,
          }
        : null,
  });

  const latestArticles = useMemo(
    () =>
      [...(articles.data || [])]
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, ITEMS_PER_PAGE),
    [articles.data]
  );

  const latestEvents = useMemo(
    () => (events.data || []).filter((e) => e.status === 'Mendatang').slice(0, 2),
    [events.data]
  );

  const latestGallery = useMemo(() => (gallery.data || []).slice(0, 8), [gallery.data]);

  const budgetSummary = budget.data;

  // LIVE prediksi anggaran "17 Agustusan" (WMA + inflasi).
  const prediksi = useApiData({
    url: `/prediksi-anggaran/${encodeURIComponent('17 Agustusan')}`,
    fallback: null,
    adapter: adaptPrediksi,
  });

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
        streetAddress: 'Jl. Raya Mangga Dua Selatan No. 12',
        addressLocality: 'Kel. Mangga Dua Selatan, Kec. Sukmajaya',
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
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="bg-accent-light border border-accent/20 rounded-md p-4 flex items-start gap-3"
          >
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
          </motion.div>
        </Section>
      )}

      {/* Stats */}
      <Section>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatsCard index={0} value={`${siteConfig.stats.members}+`} label="Anggota Aktif" />
          <StatsCard index={1} value={siteConfig.stats.programs} label="Program Kerja" />
          <StatsCard index={2} value={`${siteConfig.stats.yearsActive} Tahun`} label="Berdiri" />
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
        {articles.error && (
          <ErrorBanner message={articles.error} onRetry={articles.retry} className="mb-4" />
        )}
        {articles.loading ? (
          <LoadingSpinner label="Memuat kegiatan..." />
        ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {latestArticles.map((article, i) => (
            <ArticleCard key={article.id} index={i} article={article} />
          ))}
        </div>
        )}
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
        {gallery.error && (
          <ErrorBanner message={gallery.error} onRetry={gallery.retry} className="mb-4" />
        )}
        {gallery.loading ? (
          <LoadingSpinner label="Memuat galeri..." />
        ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {latestGallery.map((item, i) => (
            <Link key={item.id} to="/galeri">
              <GalleryItem index={i} item={item} onClick={() => {}} />
            </Link>
          ))}
        </div>
        )}
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

      {/* Prediksi anggaran (live) */}
      <Section>
        <h2 className="font-heading text-h2 text-text mb-4">
          Prediksi Anggaran Event
        </h2>
        {prediksi.loading ? (
          <LoadingSpinner label="Menghitung prediksi..." />
        ) : prediksi.error ? (
          <Card>
            <p className="font-body text-body-base text-text-secondary mb-2">
              {prediksi.data && prediksi.data.prediksi_final != null ? (
                <span>
                  Estimasi anggaran event "17 Agustusan" tahun{' '}
                  {prediksi.data.tahun_prediksi}:{' '}
                  <strong className="text-primary">{formatRupiah(prediksi.data.prediksi_final)}</strong>
                </span>
              ) : (
                <span>Data prediksi anggaran belum tersedia saat ini.</span>
              )}
            </p>
            <ErrorBanner message={prediksi.error} onRetry={prediksi.retry} />
          </Card>
        ) : prediksi.data && prediksi.data.prediksi_final != null ? (
          <Card>
            <p className="font-body text-body-lg text-text-secondary mb-2">
              Estimasi anggaran event <strong>17 Agustusan</strong> tahun{' '}
              {prediksi.data.tahun_prediksi}:
            </p>
            <p className="font-heading text-h2 text-primary mb-2">
              {formatRupiah(prediksi.data.prediksi_final)}
            </p>
            <p className="font-body text-caption text-text-muted">
              Berbasis WMA (pembobotan 3 tahun terakhir) & inflasi{' '}
              {prediksi.data.persentase_inflasi_digunakan}%.
            </p>
          </Card>
        ) : (
          <Card>
            <p className="font-body text-body-base text-text-secondary">
              Data prediksi anggaran belum tersedia saat ini.
            </p>
          </Card>
        )}
      </Section>
    </>
  );
}
