import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import Sidebar from './Sidebar.jsx'
import Topbar from './Topbar.jsx'
import { Outlet } from 'react-router-dom'

const titleMap = {
  '/': 'Dashboard',
  '/pengurus': 'Kelola Pengurus',
  '/berita': 'Kelola Berita',
  '/event': 'Event & Pengumuman',
  '/galeri': 'Kelola Galeri',
  '/anggaran': 'Kelola Anggaran',
  '/prediksi-anggaran': 'Prediksi Anggaran',
  '/prediksi-anggaran/parameter': 'Parameter Ekonomi',
  '/profil': 'Profil & Informasi',
}

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()
  const pageTitle = titleMap[location.pathname] || 'Dashboard'

  return (
    <div className="flex min-h-screen bg-bg">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0">
        <Topbar onMenuClick={() => setSidebarOpen(true)} pageTitle={pageTitle} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <div className="max-w-6xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
