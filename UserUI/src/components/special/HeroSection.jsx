import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import Button from '../ui/Button';
import Container from '../layout/Container';
import useSiteConfig from '../../hooks/useSiteConfig';
import heroImg from '../../assets/hero1.png';

export default function HeroSection() {
  const { data: siteConfig } = useSiteConfig();

  return (
    <section className="bg-surface border-b border-border-light overflow-hidden">
      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center py-12 md:py-16 lg:py-20">
          {/* Text content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="max-w-2xl"
          >
            <h1 className="font-heading text-h1 md:text-display text-text mb-4 leading-tight">
              Karang Taruna{' '}
              <span className="text-primary">Mangga Dua Selatan</span>
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
          </motion.div>

          {/* Hero image */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut', delay: 0.1 }}
            className="hidden lg:block"
          >
            <div className="rounded-xl overflow-hidden shadow-md border border-border-light">
              <img
                src={heroImg}
                alt="Kegiatan Karang Taruna Mangga Dua Selatan"
                className="w-full h-auto object-cover"
                loading="eager"
              />
            </div>
          </motion.div>
        </div>
      </Container>
    </section>
  );
}
