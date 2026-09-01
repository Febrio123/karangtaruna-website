import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

/**
 * Custom render wrapper that includes React Router context.
 * Use this instead of @testing-library/react's render for any component
 * that uses Link, NavLink, or other router hooks.
 */
export function renderWithRouter(ui, { initialEntries = ['/'], ...options } = {}) {
  function Wrapper({ children }) {
    return (
      <MemoryRouter initialEntries={initialEntries}>
        {children}
      </MemoryRouter>
    );
  }

  return render(ui, { wrapper: Wrapper, ...options });
}
