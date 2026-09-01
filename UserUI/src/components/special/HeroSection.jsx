import { Link } from 'react-router-dom';
import Button from '../ui/Button';
import Container from '../layout/Container';
import useSiteConfig from '../../hooks/useSiteConfig';

export default function HeroSection() {
  const { data: siteConfig } = useSiteConfig();
  return (
    <section className="bg-surface border-b border-border-light">
      <Container>
        <div className="py-12 md:py-16 lg:py-20 max-w-2xl">
          <h1 className="font-heading text-h1 md:text-display text-text mb-4 leading-tight">
            Karang Taruna{' '}
            <span className="text-primary">Mekar Jaya</span>
          </h1>
          <p className="font-body text-body-lg text-text-secondary mb-6 max-w-content">
            {siteConfig.tagline}
          </p>
          <div className="flex flex-wrap gap-3">
            <Link to="/berita">
              <Button variant="primary" size="lg">
                Lihat Kegiatan Kami
              </Button>
            </Link>
            <Link to="/kontak">
              <Button variant="secondary" size="lg">
                Hubungi Kami
              </Button>
            </Link>
          </div>
        </div>
      </Container>
    </section>
  );
}
