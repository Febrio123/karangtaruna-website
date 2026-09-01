import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import { useScrollToTop } from './hooks/useScrollToTop';

// Eagerly loaded page (entry / landing route only) — keeps initial bundle small
import Home from './pages/Home';

// Lazy loaded pages (non-critical; splits code into smaller on-demand chunks,
// keeping heavy deps like DOMPurify out of the critical path)
const Profile = lazy(() => import('./pages/Profile'));
const ProfileHistory = lazy(() => import('./pages/ProfileHistory'));
const ProfileVision = lazy(() => import('./pages/ProfileVision'));
const ProfileStructure = lazy(() => import('./pages/ProfileStructure'));
const NewsList = lazy(() => import('./pages/NewsList'));
const NewsDetail = lazy(() => import('./pages/NewsDetail'));
const Gallery = lazy(() => import('./pages/Gallery'));
const Announcements = lazy(() => import('./pages/Announcements'));
const Information = lazy(() => import('./pages/Information'));
const Budget = lazy(() => import('./pages/Budget'));
const Contact = lazy(() => import('./pages/Contact'));
const NotFound = lazy(() => import('./pages/NotFound'));

function LoadingFallback() {
  return (
    <div className="min-h-[40vh] flex items-center justify-center">
      <p className="font-body text-body-base text-text-muted">Memuat...</p>
    </div>
  );
}

function Layout() {
  useScrollToTop();

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main id="main-content" className="flex-1">
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/profil" element={<Profile />} />
            <Route path="/profil/sejarah" element={<ProfileHistory />} />
            <Route path="/profil/visi-misi" element={<ProfileVision />} />
            <Route path="/profil/struktur-organisasi" element={<ProfileStructure />} />
            <Route path="/berita" element={<NewsList />} />
            <Route path="/berita/:slug" element={<NewsDetail />} />
            <Route path="/galeri" element={<Gallery />} />
            <Route path="/pengumuman" element={<Announcements />} />
            <Route path="/informasi" element={<Information />} />
            <Route path="/anggaran" element={<Budget />} />
            <Route path="/kontak" element={<Contact />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}

export default function App() {
  return <Layout />;
}
