import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  FileText,
  CalendarDays,
  Image,
  Calculator,
  TrendingUp,
  Info,
  X,
  TreeDeciduous,
} from 'lucide-react'

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/pengurus', label: 'Pengurus', icon: Users },
  { to: '/berita', label: 'Berita', icon: FileText },
  { to: '/event', label: 'Event & Pengumuman', icon: CalendarDays },
  { to: '/galeri', label: 'Galeri', icon: Image },
  { to: '/anggaran', label: 'Anggaran', icon: Calculator },
  { to: '/prediksi-anggaran', label: 'Prediksi Anggaran', icon: TrendingUp },
  { to: '/profil', label: 'Profil & Informasi', icon: Info },
]

function SidebarContent({ onNavigate }) {
  return (
    <div className="flex flex-col h-full">
      {/* Brand */}
      <div className="flex items-center gap-3 px-5 pt-6 pb-7">
        <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center text-white shrink-0">
          <TreeDeciduous size={22} strokeWidth={1.6} aria-hidden="true" />
        </div>
        <div className="leading-tight min-w-0">
          <p className="text-white font-heading font-bold text-base whitespace-nowrap">KT Mangga Dua Selatan</p>
          <p className="text-white/60 text-xs font-body tracking-wide">Kelola Website</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 space-y-1 overflow-y-auto no-scrollbar" aria-label="Navigasi utama">
        <p className="px-3 pt-1 pb-2 text-[11px] uppercase tracking-wider text-white/40 font-semibold">
          Menu
        </p>
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={onNavigate}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-md text-[15px] transition-colors min-h-touch focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 ${
                isActive
                  ? 'bg-white/10 text-white font-medium'
                  : 'text-white/70 hover:bg-white/5 hover:text-white'
              }`
            }
          >
            <item.icon size={19} strokeWidth={1.6} aria-hidden="true" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-5 py-5 border-t border-white/10">
        <p className="text-white/50 text-xs leading-relaxed">
          Karang Taruna<br />Mangga Dua Selatan
        </p>
        <p className="text-white/30 text-[11px] mt-1">Periode 2025-2027</p>
      </div>
    </div>
  )
}

export default function Sidebar({ open, onClose }) {
  return (
    <>
      {/* Mobile drawer */}
      <div
        className={`fixed inset-0 z-40 bg-black/40 transition-opacity duration-200 lg:hidden ${
          open ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer (mobile) */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-sidebar-deep shadow-xl transition-transform duration-200 lg:hidden ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Menu navigasi"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-4 btn-icon text-white/70 hover:bg-white/10 hover:text-white"
          aria-label="Tutup menu"
        >
          <X size={20} />
        </button>
        <SidebarContent onNavigate={onClose} />
      </aside>

      {/* Desktop sidebar */}
      <aside className="hidden lg:block w-64 shrink-0 bg-sidebar-deep h-screen sticky top-0">
        <SidebarContent />
      </aside>
    </>
  )
}
