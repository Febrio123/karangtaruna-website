import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';
import Container from '../components/layout/Container';
import useSeo from '../hooks/useSeo';

export default function NotFound() {
  useSeo({
    title: 'Halaman Tidak Ditemukan',
    description: 'Halaman yang Anda cari tidak ditemukan di website Karang Taruna Mekar Jaya.',
    path: '/404',
    noindex: true,
  });
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <Container>
        <div className="text-center max-w-md mx-auto">
          <p className="font-heading text-display text-primary mb-2">404</p>
          <h1 className="font-heading text-h2 text-text mb-3">
            Halaman Tidak Ditemukan
          </h1>
          <p className="font-body text-body-base text-text-secondary mb-6">
            Sepertinya halaman yang Anda cari sudah tidak tersedia atau telah
            dipindahkan.
          </p>
          <Link to="/">
            <Button variant="primary" size="lg">
              Kembali ke Beranda
            </Button>
          </Link>
        </div>
      </Container>
    </div>
  );
}
