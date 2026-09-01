import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithRouter } from '../../test/test-utils';
import NotFound from '../../pages/NotFound';

describe('NotFound Page', () => {
  it('renders 404 text', () => {
    renderWithRouter(<NotFound />);
    expect(screen.getByText('404')).toBeInTheDocument();
  });

  it('renders "Halaman Tidak Ditemukan" heading', () => {
    renderWithRouter(<NotFound />);
    expect(screen.getByRole('heading', { name: /halaman tidak ditemukan/i })).toBeInTheDocument();
  });

  it('renders a descriptive message', () => {
    renderWithRouter(<NotFound />);
    expect(
      screen.getByText(/sepertinya halaman yang anda cari sudah tidak tersedia/i)
    ).toBeInTheDocument();
  });

  it('renders a "Kembali ke Beranda" button/link', () => {
    renderWithRouter(<NotFound />);
    const homeLink = screen.getByRole('link', { name: /kembali ke beranda/i });
    expect(homeLink).toBeInTheDocument();
    expect(homeLink).toHaveAttribute('href', '/');
  });
});
