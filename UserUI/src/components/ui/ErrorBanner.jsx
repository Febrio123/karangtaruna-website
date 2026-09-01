import { RefreshCw } from 'lucide-react';
import Alert from './Alert';
import Button from './Button';

/**
 * Banner error + tombol retry. Ditampilkan di atas fallback data supaya
 * pengunjung tahu data yang tampil mungkin "basi", tanpa menghapus konten.
 */
export default function ErrorBanner({ message, onRetry, className }) {
  return (
    <div className={className || ''}>
      <Alert variant="warning">
        <div>
          <p className="mb-2">
            {message || 'Gagal memuat data dari server. Menampilkan data cadangan lokal.'}
          </p>
          {onRetry ? (
            <Button variant="ghost" size="sm" onClick={onRetry}>
              <RefreshCw className="w-4 h-4" />
              Coba lagi
            </Button>
          ) : null}
        </div>
      </Alert>
    </div>
  );
}
