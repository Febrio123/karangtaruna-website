// ============================================================================
// lib/http.js — axios instance + interceptor (refresh token via cookie)
// ============================================================================
// Dipakai untuk request yang melakukan verifikasi/refresh token memakai cookie
// httpOnly `jwt_refresh_token` dari backend (withCredentials).
//
// Alur interceptor:
//   1. Request  → lampirkan `Authorization: Bearer <jwt_access_token>` dari
//                 cookie browser (readable).
//   2. Response → bila 401 pada path non-auth, coba refresh sekali
//                 (POST /auth/refresh, cookie httpOnly terkirim otomatis),
//                 lalu retry request asli. Gagal → clear cookie + panggil
//                 onApiUnauthorized (opsional, didaftarkan AuthContext).
// ============================================================================

import axios from 'axios'
import { getCookie, setCookie, clearCookie, ACCESS_COOKIE } from './cookies.js'

const API_BASE = String(import.meta.env.VITE_API_URL || 'https://karangtaruna-website-server.vercel.app/api').replace(/\/+$/, '')

const http = axios.create({
  baseURL: API_BASE,
  withCredentials: true, // kirim/terima cookie (refresh httpOnly)
  headers: { Accept: 'application/json' },
})

// Request interceptor — lampirkan access token dari cookie browser.
http.interceptors.request.use((config) => {
  const token = getCookie(ACCESS_COOKIE)
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

let refreshPromise = null
let onUnauthorized = null
export function setOnApiUnauthorized(fn) {
  onUnauthorized = typeof fn === 'function' ? fn : null
}

// Refresh token via cookie httpOnly (backend `/auth/refresh`). Single-flight.
async function refreshAccessToken() {
  if (refreshPromise) return refreshPromise
  refreshPromise = (async () => {
    try {
      const { data } = await http.post('/auth/refresh')
      const token = data?.data?.accessToken
      if (!token) {
        clearCookie(ACCESS_COOKIE)
        return false
      }
      setCookie(ACCESS_COOKIE, token)
      return true
    } catch {
      clearCookie(ACCESS_COOKIE)
      return false
    } finally {
      refreshPromise = null
    }
  })()
  return refreshPromise
}

// Response interceptor — 401 di path non-auth → coba refresh sekali → retry.
http.interceptors.response.use(
  (res) => res,
  async (error) => {
    const { response, config } = error
    const path = config?.url || ''
    const isRetry = config?._retried
    if (response?.status === 401 && !path.startsWith('/auth/') && !isRetry) {
      if (await refreshAccessToken()) {
        config._retried = true
        const token = getCookie(ACCESS_COOKIE)
        if (token) config.headers.Authorization = `Bearer ${token}`
        return http(config)
      }
      if (typeof onUnauthorized === 'function') onUnauthorized()
      error.handled = true
    }
    return Promise.reject(error)
  }
)

export function setAccessCookie(token) {
  if (token) setCookie(ACCESS_COOKIE, token)
  else clearCookie(ACCESS_COOKIE)
}
export default http
