import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import App from '../../src/App';

vi.mock('../../src/hooks/useScrollToTop', () => ({
  useScrollToTop: vi.fn(),
}));

function renderApp(initialRoute = '/') {
  const router = createMemoryRouter(
    [{ path: '*', element: <App /> }],
    { initialEntries: [initialRoute] }
  );
  return render(<RouterProvider router={router} />);
}

describe('Routing Integration', () => {
  it('renders Home page on / route', async () => {
    renderApp('/');
    await waitFor(() => {
      expect(screen.getByText('KT Mekar Jaya')).toBeInTheDocument();
    });
  });

  it('renders NotFound page on unknown route', async () => {
    renderApp('/unknown-page');
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /halaman tidak ditemukan/i })).toBeInTheDocument();
    });
  });

  it('renders Navbar on all pages', async () => {
    renderApp('/');
    expect(screen.getByText('KT Mekar Jaya')).toBeInTheDocument();
  });

  it('renders Footer on all pages', async () => {
    renderApp('/');
    await waitFor(() => {
      expect(screen.getByText(/hak cipta dilindungi/i)).toBeInTheDocument();
    });
  });

  it('has skip-to-content link for accessibility', async () => {
    renderApp('/');
    const skipLink = screen.getByText('Langsung ke konten');
    expect(skipLink).toHaveAttribute('href', '#main-content');
  });

  it('has main content area with id="main-content"', async () => {
    renderApp('/');
    await waitFor(() => {
      const main = document.getElementById('main-content');
      expect(main).toBeInTheDocument();
    });
  });
});
