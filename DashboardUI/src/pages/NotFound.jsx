import { Link } from 'react-router-dom'
import { LayoutDashboard } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-bg p-6">
      <div className="text-center max-w-md">
        <p className="font-heading font-extrabold text-[80px] leading-none text-primary">404</p>
        <h1 className="font-heading font-bold text-h2 text-text mt-4">Halaman Tidak Ditemukan</h1>
        <p className="text-caption text-text-muted mt-3">
          Halaman yang Anda cari tidak tersedia atau telah dipindahkan.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 mt-6 btn-primary"
        >
          <LayoutDashboard size={18} aria-hidden="true" /> Kembali ke Dashboard
        </Link>
      </div>
    </div>
  )
}
