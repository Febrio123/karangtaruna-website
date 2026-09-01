import { useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Calendar, User, ChevronRight } from 'lucide-react';
import DOMPurify from 'dompurify';
import PageHeader from '../components/layout/PageHeader';
import Section from '../components/layout/Section';
import ArticleCard from '../components/content/ArticleCard';
import CloudinaryImage from '../components/content/CloudinaryImage';
import Badge from '../components/ui/Badge';
import { articles } from '../data/articles';
import { formatDateIndonesian } from '../utils/formatDate';
import useSeo, { SITE_URL } from '../hooks/useSeo';

export default function NewsDetail() {
  const { slug } = useParams();
  const article = articles.find((a) => a.slug === slug);

  // SEO: set meta tags per article, or "not found" if slug is invalid
  const jsonLd = useMemo(() => {
    if (!article) return [];
    return [
      {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: article.title,
        description: article.excerpt,
        author: {
          '@type': 'Person',
          name: article.author,
        },
        publisher: {
          '@type': 'Organization',
          name: 'Karang Taruna Mekar Jaya',
          logo: {
            '@type': 'ImageObject',
            url: `${SITE_URL}/favicon.svg`,
          },
        },
        datePublished: article.date,
        mainEntityOfPage: {
          '@type': 'WebPage',
          '@id': `${SITE_URL}/berita/${article.slug}`,
        },
      },
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Beranda', item: `${SITE_URL}/` },
          { '@type': 'ListItem', position: 2, name: 'Berita', item: `${SITE_URL}/berita` },
          { '@type': 'ListItem', position: 3, name: article.title },
        ],
      },
    ];
  }, [article]);

  useSeo({
    title: article ? article.title : 'Artikel Tidak Ditemukan',
    description: article ? article.excerpt : 'Artikel yang Anda cari tidak ditemukan di Karang Taruna Mekar Jaya.',
    path: article ? `/berita/${article.slug}` : '/berita',
    type: 'article',
    noindex: !article,
    jsonLd,
  });

  if (!article) {
    return (
      <>
        <PageHeader
          title="Artikel Tidak Ditemukan"
          description="Artikel yang Anda cari tidak ditemukan."
          breadcrumbs={[
            { label: 'Berita', href: '/berita' },
            { label: 'Tidak Ditemukan' },
          ]}
        />
        <Section>
          <Link
            to="/berita"
            className="inline-flex items-center gap-1 text-body-base font-body font-semibold text-primary hover:text-primary-hover transition-colors duration-150"
          >
            <ChevronRight className="w-4 h-4 rotate-180" />
            Kembali ke Berita
          </Link>
        </Section>
      </>
    );
  }

  const relatedArticles = articles
    .filter((a) => a.id !== article.id && a.category === article.category)
    .slice(0, 3);

  const sanitizedContent = DOMPurify.sanitize(article.content, {
    ALLOWED_TAGS: ['p', 'h1', 'h2', 'h3', 'h4', 'strong', 'em', 'ul', 'ol', 'li', 'a', 'img', 'blockquote', 'code', 'pre', 'br', 'hr'],
    ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'class', 'target', 'rel'],
    ALLOW_DATA_ATTR: false,
  });

  return (
    <>
      <PageHeader
        title=""
        breadcrumbs={[
          { label: 'Berita', href: '/berita' },
          { label: article.title },
        ]}
      />

      <Section>
        <article className="max-w-content mx-auto">
          {/* Meta */}
          <div className="flex items-center gap-3 mb-4">
            <Badge variant="primary">{article.category}</Badge>
          </div>

          <h1 className="font-heading text-h1 md:text-display text-text mb-4">
            {article.title}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-caption text-text-muted mb-6">
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {formatDateIndonesian(article.date)}
            </span>
            <span className="flex items-center gap-1">
              <User className="w-4 h-4" />
              {article.author}
            </span>
          </div>

      {/* Hero image (eager for LCP since it's above the fold) or placeholder */}
      {article.image ? (
        <div className="mb-8 rounded-md overflow-hidden">
          <CloudinaryImage
            publicId={article.image}
            alt={article.imageAlt}
            aspect="video"
            eager
            sizes="(max-width: 768px) 100vw, 768px"
          />
        </div>
      ) : (
        <div className="aspect-video bg-bg-alt rounded-md flex items-center justify-center mb-8">
          <div className="text-center p-4">
            <span className="block text-h2 font-heading text-text-muted mb-1">KT</span>
            <span className="text-body-base text-text-muted">{article.category}</span>
          </div>
        </div>
      )}

      {/* Content */}
          <div
            className="font-body text-body-base text-text-secondary leading-relaxed prose max-w-none
              [&_h3]:font-heading [&_h3]:text-h3 [&_h3]:text-text [&_h3]:mt-8 [&_h3]:mb-4
              [&_p]:mb-4
              [&_ul]:list-disc [&_ul]:ml-6 [&_ul]:mb-4
              [&_ol]:list-decimal [&_ol]:ml-6 [&_ol]:mb-4
              [&_li]:mb-1
              [&_strong]:text-text [&_strong]:font-semibold"
            dangerouslySetInnerHTML={{ __html: sanitizedContent }}
          />
        </article>
      </Section>

      {/* Related articles */}
      {relatedArticles.length > 0 && (
        <Section className="bg-surface">
          <h2 className="font-heading text-h2 text-text mb-6">Artikel Terkait</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {relatedArticles.map((a) => (
              <ArticleCard key={a.id} article={a} />
            ))}
          </div>
        </Section>
      )}
    </>
  );
}
