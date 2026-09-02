import { useState } from 'react'
import { useLocation, Outlet } from 'react-router-dom'
import { AnimatePresence, motion, MotionConfig } from 'framer-motion'
import Sidebar from './Sidebar.jsx'
import Topbar from './Topbar.jsx'

const titleMap = {
  '/': 'Dashboard',
  '/pengurus': 'Kelola Pengurus',
  '/berita': 'Kelola Berita',
  '/event': 'Event & Pengumuman',
  '/galeri': 'Kelola Galeri',
  '/anggaran': 'Kelola Anggaran',
  '/prediksi-anggaran': 'Prediksi Anggaran',
  '/prediksi-anggaran/parameter': 'Parameter Ekonomi',
  '/akun': 'Kelola Akun User',
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
            <MotionConfig reducedMotion="user">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={location.pathname}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.25, ease: 'easeOut' }}
                >
                  <Outlet />
                </motion.div>
              </AnimatePresence>
            </MotionConfig>
          </div>
        </main>
      </div>
    </div>
  )
}
