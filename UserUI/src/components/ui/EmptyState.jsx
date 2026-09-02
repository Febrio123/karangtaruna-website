import { Link } from 'react-router-dom';
import { Inbox } from 'lucide-react';
import Button from './Button';

export default function EmptyState({
  title = 'Belum ada konten',
  description,
  actionLabel,
  actionHref = '/',
}) {
  return (
    <div className="text-center py-16">
      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-bg-alt">
        <Inbox className="h-8 w-8 text-text-muted" aria-hidden="true" />
      </div>
      <p className="font-heading text-h3 text-text mb-1">{title}</p>
      {description && (
        <p className="font-body text-body-base text-text-muted max-w-md mx-auto mb-6">
          {description}
        </p>
      )}
      {actionLabel && (
        <Link to={actionHref}>
          <Button variant="secondary">{actionLabel}</Button>
        </Link>
      )}
    </div>
  );
}
