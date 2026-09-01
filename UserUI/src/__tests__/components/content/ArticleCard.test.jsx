import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithRouter } from '../../../test/test-utils';
import ArticleCard from '../../../components/content/ArticleCard';

const mockArticle = {
  id: 1,
  slug: 'test-article',
  title: 'Judul Artikel Test',
  category: 'Keagamaan',
  date: '2026-03-15',
  author: 'Ahmad Fauzi',
  excerpt: 'Ini adalah excerpt artikel test yang cukup panjang.',
  content: '<p>Full content</p>',
  image: null,
  imageAlt: 'Gambar test',
};

describe('ArticleCard Component', () => {
  it('renders article title', () => {
    renderWithRouter(<ArticleCard article={mockArticle} />);
    expect(screen.getByText('Judul Artikel Test')).toBeInTheDocument();
  });

  it('renders article category in badge and placeholder', () => {
    renderWithRouter(<ArticleCard article={mockArticle} />);
    // Category appears in both the placeholder area and the badge
    const categoryElements = screen.getAllByText('Keagamaan');
    expect(categoryElements.length).toBeGreaterThanOrEqual(2);
  });

  it('renders article excerpt', () => {
    renderWithRouter(<ArticleCard article={mockArticle} />);
    expect(screen.getByText(/Ini adalah excerpt artikel test/)).toBeInTheDocument();
  });

  it('renders formatted date', () => {
    renderWithRouter(<ArticleCard article={mockArticle} />);
    expect(screen.getByText(/15 Maret 2026/)).toBeInTheDocument();
  });

  it('links to the correct article detail page', () => {
    renderWithRouter(<ArticleCard article={mockArticle} />);
    const links = screen.getAllByRole('link');
    const detailLink = links.find(link => link.getAttribute('href') === '/berita/test-article');
    expect(detailLink).toBeInTheDocument();
  });

  it('has "Baca Selengkapnya" link', () => {
    renderWithRouter(<ArticleCard article={mockArticle} />);
    expect(screen.getByText('Baca Selengkapnya')).toBeInTheDocument();
  });

  it('renders the image placeholder area', () => {
    renderWithRouter(<ArticleCard article={mockArticle} />);
    expect(screen.getByText('KT')).toBeInTheDocument();
  });
});
