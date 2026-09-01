// Halaman Login — mockup frontend-only.
// Full-page split layout: panel kiri branding biru gelap + panel kanan form.
// Submit apa saja (email/password wajib isi) → set localStorage 'kt-auth' → masuk.
import { useState } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  LogIn,
  TreeDeciduous,
  ShieldCheck,
  Wallet,
  CalendarDays,
  Users,
} from 'lucide-react'

const benefits = [
  { icon: ShieldCheck, text: 'Akses aman & terbatas untuk pengurus organisasi' },
  { icon: Wallet, text: 'Transparansi kas dan anggaran kegiatan' },
  { icon: CalendarDays, text: 'Kelola event, berita, dan galeri kegiatan' },
  { icon: Users, text: 'Susunan pengurus dengan hak akses (RBAC)' },
]

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [remember, setRemember] = useState(true)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  // Sudah login? Langsung kembali ke dashboard.
  if (localStorage.getItem('kt-auth') === 'true') {
    return <Navigate to="/" replace />
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (!email.trim() || !password.trim()) {
      setError('Email dan password wajib diisi.')
      return
    }
    localStorage.setItem('kt-auth', 'true')
    if (remember) localStorage.setItem('kt-remember', 'true')
    navigate('/')
  }

  return (
    <div className="min-h-screen flex bg-bg">
      {/* ============ Panel kiri: branding (desktop) ============ */}
      <div className="hidden lg:flex w-[46%] bg-gradient-to-br from-sidebar to-sidebar-deep flex-col justify-between p-10 xl:p-14 relative overflow-hidden">
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-primary/40 blur-3xl" aria-hidden="true" />
        <div className="absolute -bottom-40 -left-24 w-96 h-96 rounded-full bg-accent/20 blur-3xl" aria-hidden="true" />

        {/* Brand */}
        <div className="relative flex items-center gap-3">
          <div className="w-11 h-11 rounded-lg bg-primary flex items-center justify-center text-white shrink-0 shadow-lg">
            <TreeDeciduous size={24} strokeWidth={1.6} aria-hidden="true" />
          </div>
          <div className="leading-tight">
            <p className="text-white font-heading font-bold text-lg">Karang Taruna Sukamaju</p>
            <p className="text-white/50 text-xs tracking-wide">Dashboard Pengelolaan</p>
          </div>
        </div>

        {/* Tagline + benefit */}
        <div className="relative max-w-md">
          <h1 className="font-heading font-bold text-h1 text-white leading-tight">
            Kelola organisasi dari satu tempat.
          </h1>
          <p className="text-white/70 mt-4 leading-relaxed">
            Kelola pengurus, berita, kegiatan, galeri, dan keuangan Karang Taruna
            Desa Sukamaju — cepat, rapi, dan transparan.
          </p>
          <ul className="mt-8 space-y-4">
            {benefits.map((b) => (
              <li key={b.text} className="flex items-center gap-3 text-white/85">
                <span className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center text-accent-light shrink-0">
                  <b.icon size={18} strokeWidth={1.7} aria-hidden="true" />
                </span>
                <span className="text-sm leading-snug">{b.text}</span>
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-white/40 text-xs">Periode 2025-2027 · Desa Sukamaju</p>
      </div>

      {/* ============ Panel kanan: form login ============ */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-md">
          {/* Brand mobile */}
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-11 h-11 rounded-lg bg-primary flex items-center justify-center text-white shrink-0">
              <TreeDeciduous size={24} strokeWidth={1.6} aria-hidden="true" />
            </div>
            <div className="leading-tight">
              <p className="font-heading font-bold text-text">Karang Taruna Sukamaju</p>
              <p className="text-xs text-text-muted">Dashboard Pengelolaan</p>
            </div>
          </div>

          <h2 className="font-heading font-bold text-h2 text-text">Masuk ke Dashboard</h2>
          <p className="text-caption text-text-muted mt-1.5">
            Gunakan akun pengurus untuk mengelola website Karang Taruna.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5" noValidate>
            {error && (
              <div
                role="alert"
                className="flex items-center gap-2 rounded-md bg-[#FBE8E6] text-danger text-sm px-3.5 py-2.5"
              >
                <Lock size={16} aria-hidden="true" /> {error}
              </div>
            )}

            <div>
              <label className="label" htmlFor="email">Email</label>
              <div className="relative">
                <Mail size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" aria-hidden="true" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    setError('')
                  }}
                  className="input pl-11"
                  placeholder="admin@karangtaruna.id"
                />
              </div>
            </div>

            <div>
              <label className="label" htmlFor="password">Password</label>
              <div className="relative">
                <Lock size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" aria-hidden="true" />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    setError('')
                  }}
                  className="input pl-11 pr-12"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 btn-icon w-9 h-9"
                  aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <label className="inline-flex items-center gap-2 text-sm text-text-secondary cursor-pointer">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="accent-primary w-4 h-4"
                />
                Ingat saya
              </label>
            </div>

            <button type="submit" className="btn-primary w-full !min-h-[48px]">
              <LogIn size={18} aria-hidden="true" /> Masuk
            </button>
          </form>

          <p className="text-xs text-text-muted mt-6 text-center leading-relaxed">
            Demo: isi email &amp; password apa saja untuk masuk.
          </p>
        </div>
      </div>
    </div>
  )
}