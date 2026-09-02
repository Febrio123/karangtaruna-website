import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import Button from '../ui/Button';
import Container from '../layout/Container';
import useSiteConfig from '../../hooks/useSiteConfig';
import heroImg from '../../assets/hero1.png';

export default function HeroSection() {
  const { data: siteConfig } = useSiteConfig();

  return (
    <section className="relative w-full overflow-hidden bg-neutral-900">
      {/* Background image — full bleed, selalu tampil di semua ukuran */}
      <img
        src={heroImg}
        alt="Kegiatan Karang Taruna Mangga Dua Selatan"
        className="absolute inset-0 w-full h-full object-cover object-center"
        loading="eager"
        aria-hidden="true"
      />
      {/* Overlay gelap agar teks terbaca (pencahayaan diredupkan) */}
      <div
        className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/60 to-black/35"
        aria-hidden="true"
      />

      <Container className="relative z-10 py-24 md:py-32 lg:py-40">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="max-w-2xl text-white"
        >
          <p className="mb-3 inline-block rounded-full bg-white/10 backdrop-blur px-4 py-1 text-sm font-medium tracking-wide">
            Karang Taruna · Pemuda Aktif
          </p>
          <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold leading-tight text-white mb-4">
            Karang Taruna{' '}
            <span className="text-amber-400">Mangga Dua Selatan</span>
          </h1>
          <p className="font-body text-lg md:text-xl text-white/85 mb-8 max-w-xl">
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
      </Container>
    </section>
  );
}
