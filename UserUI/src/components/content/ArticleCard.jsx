import { memo } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, ChevronRight } from 'lucide-react';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import CloudinaryImage from './CloudinaryImage';
import { formatDateIndonesian } from '../../utils/formatDate';

function ArticleCard({ article }) {
  return (
    <Card hover padding={false} className="flex flex-col overflow-hidden h-full">
      {/* Image (lazy-loaded Cloudinary) or placeholder */}
      {article.image ? (
        <CloudinaryImage
          publicId={article.media?.public_id ?? article.image}
          src={article.media?.secure_url ?? null}
          alt={article.imageAlt}
          aspect="video"
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
      ) : (
        <div className="aspect-video bg-bg-alt flex items-center justify-center">
          <div className="text-text-muted text-caption text-center p-4">
            <span className="block text-h3 font-heading mb-1">KT</span>
            <span>{article.category}</span>
          </div>
        </div>
      )}

      <div className="p-4 md:p-5 flex flex-col flex-1">
        {/* Meta */}
        <div className="flex items-center gap-3 mb-2">
          <Badge variant="primary">{article.category}</Badge>
          <span className="flex items-center gap-1 text-caption text-text-muted">
            <Calendar className="w-3 h-3" />
            {formatDateIndonesian(article.date)}
          </span>
        </div>

        {/* Title */}
        <h3 className="font-heading text-h3 text-text mb-2 line-clamp-2">
          <Link
            to={`/berita/${article.slug}`}
            className="hover:text-primary transition-colors duration-150"
          >
            {article.title}
          </Link>
        </h3>

        {/* Excerpt */}
        <p className="font-body text-body-base text-text-secondary mb-4 line-clamp-3 flex-1">
          {article.excerpt}
        </p>

        {/* Read more */}
        <Link
          to={`/berita/${article.slug}`}
          className="inline-flex items-center gap-1 text-body-base font-body font-semibold text-primary hover:text-primary-hover transition-colors duration-150 mt-auto"
        >
          Baca Selengkapnya
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>
    </Card>
  );
}

export default memo(ArticleCard);
