import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Menu, Bell, ChevronDown, Search, LogOut } from 'lucide-react'

export default function Topbar({ onMenuClick, pageTitle }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const navigate = useNavigate()

  function handleLogout() {
    localStorage.removeItem('kt-auth')
    navigate('/login')
  }

  return (
    <header className="sticky top-0 z-30 bg-surface border-b border-border-light">
      <div className="flex items-center gap-3 px-4 sm:px-6 h-16">
        {/* Mobile menu button */}
        <button
          type="button"
          onClick={onMenuClick}
          className="btn-icon lg:hidden"
          aria-label="Buka menu navigasi"
        >
          <Menu size={20} />
        </button>

        {/* Page title */}
        <div className="flex-1 min-w-0">
          <p className="text-overline text-text-muted uppercase hidden sm:block">Karang Taruna Sukamaju</p>
          <h1 className="font-heading font-bold text-lg sm:text-h2 truncate">{pageTitle}</h1>
        </div>

        {/* Search (hidden on small) */}
        <div className="hidden md:flex items-center gap-2 bg-bg rounded-md px-3 border border-transparent focus-within:border-primary focus-within:ring-1 focus-within:ring-primary">
          <Search size={17} className="text-text-muted" aria-hidden="true" />
          <input
            type="search"
            className="bg-transparent py-2 outline-none w-44 text-sm placeholder:text-text-muted"
            placeholder="Cari..."
            aria-label="Cari di dashboard"
          />
        </div>

        {/* Notification */}
        <button type="button" className="btn-icon relative" aria-label="Notifikasi">
          <Bell size={19} />
          <span className="absolute top-2 right-2.5 w-2 h-2 rounded-full bg-accent" aria-hidden="true" />
        </button>

        {/* User menu + logout */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setMenuOpen((o) => !o)}
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            className="flex items-center gap-2.5 pl-1.5 pr-1 py-1 rounded-md hover:bg-bg-alt transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            aria-label="Menu akun"
          >
            <span className="w-9 h-9 rounded-full bg-primary text-white flex items-center justify-center font-heading font-semibold text-sm">
              AF
            </span>
            <span className="hidden sm:block text-left leading-tight">
              <span className="block text-sm font-medium text-text">Ahmad Fauzi</span>
              <span className="block text-xs text-text-muted">Ketua</span>
            </span>
            <ChevronDown
              size={16}
              className={`hidden sm:block text-text-muted transition-transform ${menuOpen ? 'rotate-180' : ''}`}
              aria-hidden="true"
            />
          </button>

          {menuOpen && (
            <>
              {/* Backdrop untuk menutup dropdown saat klik di luar */}
              <div
                className="fixed inset-0 z-10"
                onClick={() => setMenuOpen(false)}
                aria-hidden="true"
              />
              <div
                role="menu"
                className="absolute right-0 top-full mt-2 w-60 card shadow-lg z-20 overflow-hidden"
              >
                <div className="px-4 py-3 border-b border-border-light">
                  <p className="text-sm font-medium text-text">Ahmad Fauzi</p>
                  <p className="text-xs text-text-muted mt-0.5">Ketua Karang Taruna Sukamaju</p>
                </div>
                <button
                  type="button"
                  role="menuitem"
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-danger hover:bg-[#FBE8E6] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  <LogOut size={16} aria-hidden="true" /> Keluar
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  )
}