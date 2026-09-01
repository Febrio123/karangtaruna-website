import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Input from '../../../components/ui/Input';

describe('Input Component', () => {
  it('renders with label', () => {
    render(<Input label="Nama" />);
    expect(screen.getByLabelText('Nama')).toBeInTheDocument();
  });

  it('renders with placeholder', () => {
    render(<Input placeholder="Masukkan nama" />);
    expect(screen.getByPlaceholderText('Masukkan nama')).toBeInTheDocument();
  });

  it('renders required indicator when required', () => {
    render(<Input label="Email" required />);
    expect(screen.getByText('*')).toBeInTheDocument();
  });

  it('displays error message when error prop is provided', () => {
    render(<Input label="Nama" error="Nama wajib diisi" />);
    expect(screen.getByText('Nama wajib diisi')).toBeInTheDocument();
  });

  it('sets aria-invalid when error is present', () => {
    render(<Input label="Email" error="Email tidak valid" />);
    const input = screen.getByLabelText('Email');
    expect(input).toHaveAttribute('aria-invalid', 'true');
  });

  it('sets aria-describedby when error is present', () => {
    render(<Input label="Email" error="Email tidak valid" />);
    const input = screen.getByLabelText('Email');
    expect(input).toHaveAttribute('aria-describedby', 'email-error');
  });

  it('sets aria-invalid to false when no error', () => {
    render(<Input label="Email" />);
    const input = screen.getByLabelText('Email');
    expect(input).toHaveAttribute('aria-invalid', 'false');
  });

  it('renders with text type by default', () => {
    render(<Input label="Name" />);
    const input = screen.getByLabelText('Name');
    expect(input).toHaveAttribute('type', 'text');
  });

  it('renders with custom type', () => {
    render(<Input label="Password" type="password" />);
    const input = screen.getByLabelText('Password');
    expect(input).toHaveAttribute('type', 'password');
  });

  it('forwards value prop', () => {
    render(<Input label="Name" value="John" readOnly />);
    const input = screen.getByLabelText('Name');
    expect(input).toHaveValue('John');
  });
});
