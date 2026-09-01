import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

export default function Breadcrumbs({ items }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-6">
      <ol className="flex flex-wrap items-center gap-1 text-caption text-text-secondary">
        <li>
          <Link
            to="/"
            className="hover:text-primary transition-colors duration-150"
          >
            Beranda
          </Link>
        </li>
        {items.map((item, index) => (
          <li key={index} className="flex items-center gap-1">
            <ChevronRight className="w-3 h-3" aria-hidden="true" />
            {item.href ? (
              <Link
                to={item.href}
                className="hover:text-primary transition-colors duration-150"
              >
                {item.label}
              </Link>
            ) : (
              <span className="text-text font-medium" aria-current="page">
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
