import { useState, useMemo } from 'react';
import PageHeader from '../components/layout/PageHeader';
import Section from '../components/layout/Section';
import ArticleCard from '../components/content/ArticleCard';
import CategoryFilter from '../components/ui/CategoryFilter';
import Pagination from '../components/ui/Pagination';
import { articles, categories } from '../data/articles';
import useSeo from '../hooks/useSeo';

const ITEMS_PER_PAGE = 6;

export default function NewsList() {
  useSeo({
    title: 'Berita & Kegiatan',
    description: 'Informasi terbaru seputar kegiatan, program kerja, dan acara Karang Taruna Mekar Jaya di Kelurahan Mekar Jaya, Depok.',
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
    let result = [...articles].sort((a, b) => new Date(b.date) - new Date(a.date));
    if (activeCategory !== 'Semua') {
      result = result.filter((a) => a.category === activeCategory);
    }
    return result;
  }, [activeCategory]);

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
        description="Informasi terbaru seputar kegiatan Karang Taruna Mekar Jaya."
        breadcrumbs={[{ label: 'Berita' }]}
      />

      <Section>
        <CategoryFilter
          categories={categories}
          active={activeCategory}
          onChange={handleCategoryChange}
        />

        {paginatedArticles.length === 0 ? (
          <div className="text-center py-12">
            <p className="font-body text-body-lg text-text-muted">
              Tidak ada berita dalam kategori ini.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {paginatedArticles.map((article) => (
              <ArticleCard key={article.id} article={article} />
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
