// Guard proteksi route — verifikasi sesi ke server (GET /auth/me).
// Access token ada di memori (lib/api.js); refresh cookie (httpOnly) dipakai
// untuk memulihkan sesi saat halaman dimuat ulang.
import { useEffect } from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import LoadingState from '../ui/LoadingState.jsx'

export default function RequireAuth() {
  const { user, initializing, verifySession } = useAuth()

  useEffect(() => {
    if (!user) verifySession()
  }, [user, verifySession])

  if (initializing && !user) {
    return <LoadingState label="Memverifikasi sesi..." className="min-h-screen" />
  }
  if (!user) return <Navigate to="/login" replace />
  return <Outlet />
}