import { memo } from 'react';
import { Calendar, Clock, MapPin, Megaphone, Wallet } from 'lucide-react';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import { formatDateIndonesian } from '../../utils/formatDate';
import { formatRupiah } from '../../utils/formatCurrency';

function EventCard({ event }) {
  const statusVariant =
    event.status === 'Mendatang'
      ? 'primary'
      : event.status === 'Selesai'
      ? 'success'
      : 'accent';

  return (
    <Card className="flex flex-col sm:flex-row gap-4">
      {/* Date block */}
      <div className="flex-shrink-0 w-full sm:w-20 text-center sm:text-left">
        <div className="inline-flex flex-col items-center sm:items-start p-2 rounded-md bg-primary-light">
          {event.type === 'pengumuman' ? (
            <Megaphone className="w-5 h-5 text-primary mb-1" />
          ) : (
            <Calendar className="w-5 h-5 text-primary mb-1" />
          )}
          <span className="text-overline text-primary font-heading">
            {new Date(event.date + 'T00:00:00').toLocaleDateString('id-ID', {
              month: 'short',
            })}
          </span>
          <span className="text-h3 text-primary font-heading font-bold">
            {new Date(event.date + 'T00:00:00').getDate()}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          <Badge variant={statusVariant}>{event.status}</Badge>
          <span className="flex items-center gap-1 text-caption text-text-muted">
            <Clock className="w-3 h-3" />
            {event.time}
          </span>
        </div>

        <h3 className="font-heading text-h4 text-text mb-1">{event.title}</h3>

        <p className="font-body text-body-base text-text-secondary mb-2">
          {event.description}
        </p>

        {event.location && (
          <div className="flex items-center gap-1 text-caption text-text-muted">
            <MapPin className="w-3 h-3" />
            {event.location}
          </div>
        )}

        {event.budget && (
          <div className="mt-2 pt-2 border-t border-border-light flex items-center justify-between gap-2">
            <span className="flex items-center gap-1 text-caption text-text-muted">
              <Wallet className="w-3 h-3" />
              Total anggaran acara
            </span>
            <span className="font-heading text-body-base font-semibold text-text">
              {formatRupiah(event.budget.amount)}
            </span>
          </div>
        )}
      </div>
    </Card>
  );
}

export default memo(EventCard);
