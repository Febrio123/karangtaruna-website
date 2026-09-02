import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, ExternalLink, Music2 } from 'lucide-react';
import { motion } from 'framer-motion';
import Container from './Container';
import useSiteConfig from '../../hooks/useSiteConfig';
import logoImg from '../../assets/logo karang taruna.jpg';

// Brand icons (Instagram/Facebook/YouTube) tidak lagi tersedia di lucide-react
// versi terbaru, jadi didefinisikan sebagai icon SVG khusus agar tetap dinamis.
const Instagram = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);
const Facebook = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);
const Youtube = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17" />
    <path d="m10 15 5-3-5-3z" />
  </svg>
);

const socialIcon = { Instagram, TikTok: Music2, Facebook, Youtube };
const socialLabel = { instagram: 'Instagram', tiktok: 'TikTok', facebook: 'Facebook', youtube: 'YouTube' };

const footerLinks = [
  { label: 'Profil', href: '/profil' },
  { label: 'Berita', href: '/berita' },
  { label: 'Galeri', href: '/galeri' },
  { label: 'Pengumuman', href: '/pengumuman' },
  { label: 'Anggaran', href: '/anggaran' },
  { label: 'Kontak', href: '/kontak' },
];

export default function Footer() {
  const { data: siteConfig } = useSiteConfig();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-bg-alt border-t border-border-light" role="contentinfo">
      <Container>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="py-10 md:py-12"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Organization Info */}
            <div>
              <div className="flex items-center gap-3 mb-3">
                <img
                  src={logoImg}
                  alt="Logo Karang Taruna"
                  className="w-12 h-12 rounded-full object-cover border border-border-light shrink-0"
                  loading="lazy"
                />
                <h3 className="font-heading text-h4 font-bold text-text">
                  {siteConfig.name}
                </h3>
              </div>
              <p className="font-body text-body-base text-text-secondary mb-4">
                {siteConfig.tagline}
              </p>
              <div className="flex flex-col gap-2 text-caption text-text-secondary">
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 mt-0.5 shrink-0 text-text-muted" />
                  <span>{siteConfig.address}</span>
                </div>
                {siteConfig.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 shrink-0 text-text-muted" />
                    <a
                      href={`tel:${siteConfig.phone.replace(/-/g, '')}`}
                      className="hover:text-primary transition-colors duration-150"
                    >
                      {siteConfig.phone}
                    </a>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 shrink-0 text-text-muted" />
                  <a
                    href={`mailto:${siteConfig.email}`}
                    className="hover:text-primary transition-colors duration-150"
                  >
                    {siteConfig.email}
                  </a>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="font-heading text-h4 font-bold text-text mb-3">
                Tautan
              </h3>
              <nav aria-label="Tautan footer">
                <ul className="flex flex-col gap-2">
                  {footerLinks.map((link) => (
                    <li key={link.href}>
                      <Link
                        to={link.href}
                        className="font-body text-body-base text-text-secondary hover:text-primary transition-colors duration-150"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>

            {/* Social Media */}
            <div>
              <h3 className="font-heading text-h4 font-bold text-text mb-3">
                Media Sosial
              </h3>
              <div className="flex flex-col gap-2">
                {Object.entries(siteConfig.socialMedia)
                  .filter(([, url]) => url)
                  .map(([key, url]) => {
                    const Icon = socialIcon[key.charAt(0).toUpperCase() + key.slice(1)] || ExternalLink;
                    return (
                      <a
                        key={key}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-body text-body-base text-text-secondary hover:text-primary transition-colors duration-150 inline-flex items-center gap-2"
                      >
                        <Icon className="w-4 h-4" />
                        {socialLabel[key] || key}
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    );
                  })}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Copyright */}
        <div className="border-t border-border py-4 text-center">
          <p className="font-body text-caption text-text-muted">
            &copy; {currentYear} {siteConfig.name}. Hak cipta dilindungi.
          </p>
        </div>
      </Container>
    </footer>
  );
}
