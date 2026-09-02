// Guard proteksi RBAC per-route — memastikan `user.role` diizinkan untuk
// sebuah halaman. Backend tetap enforcement utama; ini hanya lapisan UI agar
// menu/route tidak diakses oleh role yang tidak berhak.
import { Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'

export default function RequireRole({ roles = [], children }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  if (!roles.includes(user.role)) return <Navigate to="/" replace />
  return children
}
