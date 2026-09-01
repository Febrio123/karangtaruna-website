import { Loader2 } from 'lucide-react'

/** Indikator loading yang dipakai bersama (login, route guard, halaman data). */
export default function LoadingState({ label = 'Memuat data...', className = '' }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={`flex flex-col items-center justify-center px-6 py-16 ${className}`}
    >
      <Loader2 size={28} className="animate-spin text-primary" aria-hidden="true" />
      {label && <p className="mt-3 text-sm text-text-muted">{label}</p>}
    </div>
  )
}