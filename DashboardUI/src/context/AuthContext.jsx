// ============================================================================
// context/AuthContext.jsx — Sesi admin dashboard (user disimpan di context,
// access token di memori via lib/api.js, BUKAN di localStorage)
// ============================================================================
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiFetch, setAccessToken, setOnUnauthorized } from '../lib/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [initializing, setInitializing] = useState(true)
  const navigate = useNavigate()

  // Token kedaluwarsa & refresh gagal (dari api.js) → logout + redirect.
  useEffect(() => {
    setOnUnauthorized(() => {
      setUser(null)
      navigate('/login', { replace: true })
    })
    return () => setOnUnauthorized(null)
  }, [navigate])

  const login = useCallback(
    async ({ username, password, remember = false, captchaId = null, captcha = '' }) => {
      const data = await apiFetch('/auth/login', {
        method: 'POST',
        body: { username, password, remember, captchaId, captcha },
      })
      setAccessToken(data?.accessToken || null)
      setUser(data?.user || null)
      return data?.user || null
    },
    []
  )

  const logout = useCallback(async () => {
    try {
      await apiFetch('/auth/logout', { method: 'POST' })
    } catch {
      /* cookie refresh sudah kedaluwarsa — tetap lanjut logout lokal */
    }
    setAccessToken(null)
    setUser(null)
    navigate('/login', { replace: true })
  }, [navigate])

  /** Verifikasi sesi saat halaman dimuat ulang — pakai refresh cookie bila perlu. */
  const verifySession = useCallback(async () => {
    setInitializing(true)
    try {
      const data = await apiFetch('/auth/me')
      setUser(data?.user || null)
    } catch {
      setAccessToken(null)
      setUser(null)
    } finally {
      setInitializing(false)
    }
  }, [])

  const value = useMemo(
    () => ({ user, setUser, initializing, verifySession, login, logout }),
    [user, initializing, verifySession, login, logout]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth harus dipakai di dalam <AuthProvider>.')
  return ctx
}

export default AuthContext