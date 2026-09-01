import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Alert from '../../../components/ui/Alert';

describe('Alert Component', () => {
  it('renders with default info variant', () => {
    render(<Alert>Information message</Alert>);
    const alert = screen.getByRole('alert');
    expect(alert).toBeInTheDocument();
    expect(alert).toHaveTextContent('Information message');
  });

  it('renders success variant', () => {
    render(<Alert variant="success">Success message</Alert>);
    const alert = screen.getByRole('alert');
    expect(alert).toBeInTheDocument();
    expect(alert).toHaveTextContent('Success message');
  });

  it('renders error variant', () => {
    render(<Alert variant="error">Error message</Alert>);
    const alert = screen.getByRole('alert');
    expect(alert).toHaveTextContent('Error message');
  });

  it('renders warning variant', () => {
    render(<Alert variant="warning">Warning message</Alert>);
    const alert = screen.getByRole('alert');
    expect(alert).toHaveTextContent('Warning message');
  });

  it('has role="alert" for screen reader accessibility', () => {
    render(<Alert variant="error">Critical error</Alert>);
    const alert = screen.getByRole('alert');
    expect(alert).toHaveAttribute('role', 'alert');
  });

  it('renders children content', () => {
    render(
      <Alert variant="info">
        <span>Custom content</span>
      </Alert>
    );
    expect(screen.getByText('Custom content')).toBeInTheDocument();
  });
});
