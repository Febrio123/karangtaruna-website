import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Textarea from '../../../components/ui/Textarea';

describe('Textarea Component', () => {
  it('renders with label', () => {
    render(<Textarea label="Pesan" />);
    expect(screen.getByLabelText('Pesan')).toBeInTheDocument();
  });

  it('renders with default rows', () => {
    render(<Textarea label="Message" />);
    const textarea = screen.getByLabelText('Message');
    expect(textarea).toHaveAttribute('rows', '4');
  });

  it('renders with custom rows', () => {
    render(<Textarea label="Message" rows={8} />);
    const textarea = screen.getByLabelText('Message');
    expect(textarea).toHaveAttribute('rows', '8');
  });

  it('displays error message when error prop is provided', () => {
    render(<Textarea label="Pesan" error="Pesan terlalu pendek" />);
    expect(screen.getByText('Pesan terlalu pendek')).toBeInTheDocument();
  });

  it('sets aria-invalid when error is present', () => {
    render(<Textarea label="Pesan" error="Error" />);
    const textarea = screen.getByLabelText('Pesan');
    expect(textarea).toHaveAttribute('aria-invalid', 'true');
  });
});
