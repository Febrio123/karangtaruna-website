// Halaman Login — terhubung ke backend (POST /api/auth/login).
// Alur captcha: coba login tanpa captcha → jika server balas error
// ber-code CAPTCHA_INVALID → ambil GET /api/auth/captcha → tampilkan SVG →
// submit ulang dengan captchaId + kode yang diketik.
import { useState } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import {
  User,
  Lock,
  Eye,
  EyeOff,
  LogIn,
  TreeDeciduous,
  ShieldCheck,
  Wallet,
  CalendarDays,
  Users,
  RefreshCw,
} from 'lucide-react'
import { apiFetch } from '../lib/api'
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
  const [loading, setLoading] = useState(false)
  const [captcha, setCaptcha] = useState(null) // { id, image } — aktif saat server memintanya
  const [captchaInput, setCaptchaInput] = useState('')
  const { login, user, initializing } = useAuth()
  const navigate = useNavigate()

  // Sudah login (sesi valid)? Langsung kembali ke dashboard.
  if (!initializing && user) {
    return <Navigate to="/" replace />
  }

  async function loadCaptcha() {
    try {
      const data = await apiFetch('/auth/captcha')
      setCaptcha({ id: data?.captchaId, image: data?.image })
      setCaptchaInput('')
    } catch {
      setCaptcha(null) // gagal memuat → biarkan user mencoba tanpa captcha
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!username.trim() || !password.trim()) {
      setError('Username dan password wajib diisi.')
      return
    }
    setLoading(true)
    setError('')
    try {
      await login({
        username: username.trim(),
        password,
        remember,
        ...(captcha ? { captchaId: captcha.id, captcha: captchaInput } : {}),
      })
      navigate('/', { replace: true })
    } catch (err) {
      setError(err?.message || 'Login gagal. Silakan coba lagi.')
      if (err?.code === 'CAPTCHA_INVALID') {
        // Server mewajibkan captcha → minta & tampilkan kode keamanan.
        await loadCaptcha()
      }
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
            Gunakan username &amp; password akun pengurus untuk mengelola website Karang Taruna.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5" noValidate>
            {error && (
              <div
                role="alert"
                className="flex items-start gap-2 rounded-md bg-[#FBE8E6] text-danger text-sm px-3.5 py-2.5"
              >
                <Lock size={16} className="mt-0.5 shrink-0" aria-hidden="true" /> <span>{error}</span>
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

            {captcha && captcha.id && (
              <div className="rounded-md border border-border-light p-3 space-y-3">
                <p className="text-xs text-text-muted">
                  Server meminta kode keamanan. Ketik ulang kode pada gambar di bawah.
                </p>
                <div className="flex items-center gap-2">
                  <img
                    src={captcha.image}
                    alt="Kode keamanan"
                    className="h-12 rounded-sm border border-border-light"
                  />
                  <button
                    type="button"
                    onClick={loadCaptcha}
                    className="btn-icon"
                    aria-label="Muat ulang kode keamanan"
                    title="Muat ulang kode"
                  >
                    <RefreshCw size={16} />
                  </button>
                </div>
                <input
                  id="captcha"
                  name="captcha"
                  type="text"
                  autoComplete="off"
                  value={captchaInput}
                  onChange={(e) => setCaptchaInput(e.target.value)}
                  className="input"
                  placeholder="Ketik kode di gambar"
                />
              </div>
            )}

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
              <LogIn size={18} aria-hidden="true" />
              {loading ? 'Memproses...' : 'Masuk'}
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