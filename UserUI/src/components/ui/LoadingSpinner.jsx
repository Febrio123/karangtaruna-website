import { Loader2 } from 'lucide-react';

/**
 * Spinner loading lokal (tidak memblokir seluruh halaman).
 * Dipakai saat data dari API masih dimuat.
 */
export default function LoadingSpinner({ label = 'Memuat data...', className }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={`flex items-center justify-center gap-2 py-8 text-text-muted ${className || ''}`}
    >
      <Loader2 className="w-5 h-5 animate-spin" />
      <span className="font-body text-body-base">{label}</span>
    </div>
  );
}
