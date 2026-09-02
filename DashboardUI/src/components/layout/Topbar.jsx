import { useState } from 'react'
import { Menu, ChevronDown, LogOut } from 'lucide-react'
import { useAuth } from '../../context/AuthContext.jsx'
import { getInitials } from '../../utils/format.js'
import { roles } from '../../data/pengurus.js'

export default function Topbar({ onMenuClick, pageTitle }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const { user, logout } = useAuth()

  const displayName = user?.nama || user?.username || 'Pengurus'
  const roleLabel = roles.find((r) => r.value === user?.role)?.label || user?.role || 'Anggota'

  function handleLogout() {
    setMenuOpen(false)
    logout() // POST /auth/logout → bersihkan cookie refresh + redirect /login
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
          <p className="text-overline text-text-muted uppercase hidden sm:block">Karang Taruna Mangga Dua Selatan</p>
          <h1 className="font-heading font-bold text-lg sm:text-h2 truncate">{pageTitle}</h1>
        </div>

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
              {getInitials(displayName)}
            </span>
            <span className="hidden sm:block text-left leading-tight">
              <span className="block text-sm font-medium text-text truncate max-w-[11rem]">{displayName}</span>
              <span className="block text-xs text-text-muted">{roleLabel}</span>
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
                  <p className="text-sm font-medium text-text truncate">{displayName}</p>
                  <p className="text-xs text-text-muted mt-0.5 truncate">
                    {roleLabel} Karang Taruna Mangga Dua Selatan
                  </p>
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