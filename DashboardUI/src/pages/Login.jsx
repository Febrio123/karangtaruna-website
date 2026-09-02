// Halaman Login — terhubung ke backend (POST /api/auth/login).
import { useState } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import {
  User,
  Lock,
  Eye,
  EyeOff,
  LogIn,
  Loader2,
  TreeDeciduous,
  ShieldCheck,
  Wallet,
  CalendarDays,
  Users,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'

const benefits = [
  { icon: ShieldCheck, text: 'Akses aman & terbatas untuk pengurus organisasi' },
  { icon: Wallet, text: 'Transparansi kas dan anggaran kegiatan' },
  { icon: CalendarDays, text: 'Kelola event, berita, dan galeri kegiatan' },
  { icon: Users, text: 'Susunan pengurus dengan hak akses (RBAC)' },
]

export default function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [remember, setRemember] = useState(true)
  const [error, setError] = useState('')
  const [errorDetails, setErrorDetails] = useState([]) // daftar detail error (mis. per-field)
  const [loading, setLoading] = useState(false)
  const { login, user, initializing } = useAuth()
  const navigate = useNavigate()

  // Sudah login (sesi valid)? Langsung kembali ke dashboard.
  if (!initializing && user) {
    return <Navigate to="/" replace />
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!username.trim() || !password.trim()) {
      setError('Username dan password wajib diisi.')
      return
    }
    setLoading(true)
    setError('')
    setErrorDetails([])
    try {
      await login({
        username: username.trim(),
        password,
        remember,
      })
      navigate('/', { replace: true })
    } catch (err) {
      // Pesan utama: selalu non-kosong (fallback bila backend tidak mengirim message).
      const message = (err?.message && err.message.trim()) || 'Login gagal. Silakan coba lagi.'
      // Detail tambahan (mis. {field, message} per kolom dari validasi backend).
      const details = Array.isArray(err?.details) ? err.details : []
      const detailTexts = details
        .map((d) => {
          const text = typeof d === 'string' ? d : d?.message ?? d?.msg
          return typeof text === 'string' ? text.trim() : ''
        })
        .filter(Boolean)

      // Gabungkan message + detail ke error; detail juga dirender sebagai daftar kecil.
      setError(detailTexts.length > 0 ? `${message} ${detailTexts.join('; ')}` : message)
      setErrorDetails(detailTexts)
    } finally {
      setLoading(false)
    }
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
            <p className="text-white font-heading font-bold text-lg">Karang Taruna Mangga Dua Selatan</p>
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
            Mangga Dua Selatan — cepat, rapi, dan transparan.
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

        <p className="relative text-white/40 text-xs">Periode 2025-2027 · Mangga Dua Selatan</p>
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
              <p className="font-heading font-bold text-text">Karang Taruna Mangga Dua Selatan</p>
              <p className="text-xs text-text-muted">Dashboard Pengelolaan</p>
            </div>
          </div>

          <h2 className="font-heading font-bold text-h2 text-text">Masuk ke Dashboard</h2>
          <p className="text-caption text-text-muted mt-1.5">
            Gunakan username &amp; password akun pengurus untuk mengelola website Karang Taruna.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5" noValidate>
            {error && (
              <div
                role="alert"
                className="flex items-start gap-2 rounded-md bg-[#FBE8E6] text-danger text-sm px-3.5 py-2.5"
              >
                <Lock size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
                <div className="min-w-0 flex-1 space-y-1">
                  <p>{error}</p>
                  {errorDetails.length > 0 && (
                    <ul className="list-disc pl-4 space-y-0.5">
                      {errorDetails.map((detail, i) => (
                        <li key={`${detail}-${i}`}>{detail}</li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            )}

            <div>
              <label className="label" htmlFor="username">Username</label>
              <div className="relative">
                <User size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" aria-hidden="true" />
                <input
                  id="username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value)
                    setError('')
                    setErrorDetails([])
                  }}
                  className="input pl-11"
                  placeholder="mis. ketua"
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
                    setErrorDetails([])
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

            <button type="submit" disabled={loading} className="btn-primary w-full !min-h-[48px]">
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" aria-hidden="true" /> Memproses...
                </>
              ) : (
                <>
                  <LogIn size={18} aria-hidden="true" /> Masuk
                </>
              )}
            </button>
          </form>

          <p className="text-xs text-text-muted mt-6 text-center leading-relaxed">
            Hanya akun pengurus aktif yang dapat masuk. Akses dipantau (RBAC).
          </p>
        </div>
      </div>
    </div>
  )
}