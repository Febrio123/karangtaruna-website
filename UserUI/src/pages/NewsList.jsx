import { useState, useMemo } from 'react';
import heroImg from '../assets/hero6.jpg';
import PageHeader from '../components/layout/PageHeader';
import Section from '../components/layout/Section';
import ArticleCard from '../components/content/ArticleCard';
import CategoryFilter from '../components/ui/CategoryFilter';
import EmptyState from '../components/ui/EmptyState';
import Pagination from '../components/ui/Pagination';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import ErrorBanner from '../components/ui/ErrorBanner';
import useApiData from '../hooks/useApiData';
import { adaptArticleList } from '../lib/adapters';
import { articles as staticArticles, categories } from '../data/articles';
import useSeo from '../hooks/useSeo';

const ITEMS_PER_PAGE = 6;

export default function NewsList() {
  const { data: articles, loading, error, retry } = useApiData({
    url: '/articles?published=true',
    fallback: staticArticles,
    adapter: adaptArticleList,
  });
  useSeo({
    title: 'Berita & Kegiatan',
    description: 'Informasi terbaru seputar kegiatan, program kerja, dan acara Karang Taruna Mangga Dua Selatan di Kelurahan Mangga Dua Selatan, Depok.',
    path: '/berita',
    jsonLd: [
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Beranda', item: `${window.location.origin}/` },
          { '@type': 'ListItem', position: 2, name: 'Berita' },
        ],
      },
    ],
  });
  const [activeCategory, setActiveCategory] = useState('Semua');
  const [currentPage, setCurrentPage] = useState(1);

  const filteredArticles = useMemo(() => {
    let result = [...(articles || [])].sort((a, b) => new Date(b.date) - new Date(a.date));
    if (activeCategory !== 'Semua') {
      result = result.filter((a) => a.category === activeCategory);
    }
    return result;
  }, [activeCategory, articles]);

  const totalPages = Math.ceil(filteredArticles.length / ITEMS_PER_PAGE);
  const paginatedArticles = filteredArticles.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  function handleCategoryChange(category) {
    setActiveCategory(category);
    setCurrentPage(1);
  }

  return (
    <>
      <PageHeader
        title="Berita & Kegiatan"
        description="Informasi terbaru seputar kegiatan Karang Taruna Mangga Dua Selatan."
        breadcrumbs={[{ label: 'Berita' }]}
        image={heroImg}
      />

      <Section>
        <CategoryFilter
          categories={categories}
          active={activeCategory}
          onChange={handleCategoryChange}
        />

        {error && <ErrorBanner message={error} onRetry={retry} className="my-4" />}
        {loading ? (
          <LoadingSpinner label="Memuat berita..." />
        ) : paginatedArticles.length === 0 ? (
          <EmptyState
            title="Belum ada berita"
            description="Belum ada artikel atau kegiatan yang dipublikasikan saat ini."
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {paginatedArticles.map((article, i) => (
              <ArticleCard key={article.id} index={i} article={article} />
            ))}
          </div>
        )}

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </Section>
    </>
  );
}
