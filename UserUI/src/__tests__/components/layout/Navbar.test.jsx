import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithRouter } from '../../../test/test-utils';
import Navbar from '../../../components/layout/Navbar';

describe('Navbar Component', () => {
  it('renders the organization short name', () => {
    renderWithRouter(<Navbar />);
    expect(screen.getByText('KT Mekar Jaya')).toBeInTheDocument();
  });

  it('renders all main navigation items', () => {
    renderWithRouter(<Navbar />);
    expect(screen.getByRole('link', { name: /beranda/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /profil/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /berita/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /galeri/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /pengumuman/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /informasi/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /anggaran/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /kontak/i })).toBeInTheDocument();
  });

  it('has a skip-to-content link for accessibility', () => {
    renderWithRouter(<Navbar />);
    const skipLink = screen.getByText('Langsung ke konten');
    expect(skipLink).toBeInTheDocument();
    expect(skipLink).toHaveAttribute('href', '#main-content');
    expect(skipLink.className).toContain('skip-link');
  });

  it('has aria-label on desktop navigation', () => {
    renderWithRouter(<Navbar />);
    const nav = screen.getByLabelText('Navigasi utama');
    expect(nav).toBeInTheDocument();
  });

  it('renders the mobile hamburger button with aria-label', () => {
    renderWithRouter(<Navbar />);
    const hamburger = screen.getByRole('button', { name: /buka menu navigasi/i });
    expect(hamburger).toBeInTheDocument();
    expect(hamburger).toHaveAttribute('aria-expanded', 'false');
  });

  it('has header with role="banner"', () => {
    renderWithRouter(<Navbar />);
    const header = screen.getByRole('banner');
    expect(header).toBeInTheDocument();
  });

  it('links to correct routes', () => {
    renderWithRouter(<Navbar />);
    expect(screen.getByRole('link', { name: /beranda/i })).toHaveAttribute('href', '/');
    expect(screen.getByRole('link', { name: /berita/i })).toHaveAttribute('href', '/berita');
    expect(screen.getByRole('link', { name: /kontak/i })).toHaveAttribute('href', '/kontak');
  });

  it('logo links to home page', () => {
    renderWithRouter(<Navbar />);
    const logoLink = screen.getByText('KT Mekar Jaya').closest('a');
    expect(logoLink).toHaveAttribute('href', '/');
  });
});
