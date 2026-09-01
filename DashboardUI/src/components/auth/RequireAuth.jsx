// Guard proteksi route (mockup auth, frontend-only).
// Jika tidak ada localStorage 'kt-auth' → arahkan ke /login; jika ada → render outlet.
import { Navigate, Outlet } from 'react-router-dom'

export default function RequireAuth() {
  const isAuth = localStorage.getItem('kt-auth') === 'true'
  return isAuth ? <Outlet /> : <Navigate to="/login" replace />
}