import { useState, useEffect } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Menu, ChevronDown } from 'lucide-react';
import { clsx } from 'clsx';
import Container from './Container';
import MobileDrawer from './MobileDrawer';
import useSiteConfig from '../../hooks/useSiteConfig';
import logoImg from '../../assets/logo karang taruna.jpg';

const navItems = [
  { label: 'Beranda', href: '/' },
  {
    label: 'Profil',
    href: '/profil',
    children: [
      { label: 'Sejarah', href: '/profil/sejarah' },
      { label: 'Visi & Misi', href: '/profil/visi-misi' },
      { label: 'Struktur Organisasi', href: '/profil/struktur-organisasi' },
    ],
  },
  { label: 'Berita', href: '/berita' },
  { label: 'Galeri', href: '/galeri' },
  { label: 'Pengumuman', href: '/pengumuman' },
  { label: 'Informasi', href: '/informasi' },
  { label: 'Anggaran', href: '/anggaran' },
  { label: 'Kontak', href: '/kontak' },
];

export default function Navbar() {
  const { data: siteConfig } = useSiteConfig();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const location = useLocation();

  useEffect(() => {
    setIsDrawerOpen(false);
    setOpenDropdown(null);
  }, [location.pathname]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <a href="#main-content" className="skip-link">
        Langsung ke konten
      </a>

      <header
        className={clsx(
          'sticky top-0 z-20 bg-surface transition-shadow duration-200',
          isScrolled ? 'shadow-md' : 'shadow-sm'
        )}
        role="banner"
      >
        <Container>
          <div className="flex items-center justify-between h-14 md:h-16">
            {/* Logo / Nama */}
            <Link
              to="/"
              className="flex items-center gap-2 group"
              aria-label={`Beranda ${siteConfig.shortName}`}
            >
              <img
                src={logoImg}
                alt="Logo Karang Taruna"
                className="w-9 h-9 md:w-10 md:h-10 rounded-full object-cover border border-border-light shrink-0"
                loading="eager"
              />
              <span className="font-heading text-body-lg md:text-h4 font-bold text-primary group-hover:text-primary-hover transition-colors duration-150">
                {siteConfig.shortName}
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1" aria-label="Navigasi utama">
              {navItems.map((item) =>
                item.children ? (
                  <div
                    key={item.href}
                    className="relative"
                    onMouseEnter={() => setOpenDropdown(item.href)}
                    onMouseLeave={() => setOpenDropdown(null)}
                  >
                    <NavLink
                      to={item.href}
                      className={({ isActive }) =>
                        clsx(
                          'flex items-center gap-1 px-3 py-2 text-nav font-body rounded-md',
                          'transition-colors duration-150',
                          isActive
                            ? 'text-primary font-semibold'
                            : 'text-text-secondary hover:text-text hover:bg-bg'
                        )
                      }
                    >
                      {item.label}
                      <ChevronDown
                        className={clsx(
                          'w-3 h-3 transition-transform duration-150',
                          openDropdown === item.href && 'rotate-180'
                        )}
                      />
                    </NavLink>

                    {/* Dropdown */}
                    {openDropdown === item.href && (
                      <div
                        className="absolute top-full left-0 mt-1 w-56 bg-surface border border-border-light rounded-md shadow-lg py-1 z-10"
                        role="menu"
                      >
                        {item.children.map((child) => (
                          <NavLink
                            key={child.href}
                            to={child.href}
                            className={({ isActive }) =>
                              clsx(
                                'block px-4 py-2 text-body-base font-body',
                                'transition-colors duration-150',
                                isActive
                                  ? 'text-primary font-semibold bg-primary-light'
                                  : 'text-text-secondary hover:text-text hover:bg-bg'
                              )
                            }
                            role="menuitem"
                          >
                            {child.label}
                          </NavLink>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <NavLink
                    key={item.href}
                    to={item.href}
                    className={({ isActive }) =>
                      clsx(
                        'px-3 py-2 text-nav font-body rounded-md',
                        'transition-colors duration-150',
                        isActive
                          ? 'text-primary font-semibold'
                          : 'text-text-secondary hover:text-text hover:bg-bg'
                      )
                    }
                  >
                    {item.label}
                  </NavLink>
                )
              )}
            </nav>

            {/* Mobile Hamburger */}
            <button
              onClick={() => setIsDrawerOpen(true)}
              className="md:hidden p-2 text-text-secondary hover:text-text rounded-md hover:bg-bg transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              aria-label="Buka menu navigasi"
              aria-expanded={isDrawerOpen}
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </Container>
      </header>

      {/* Mobile Drawer */}
      <MobileDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        navItems={navItems}
      />
    </>
  );
}
