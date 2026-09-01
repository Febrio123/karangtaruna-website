import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ContactForm from '../../../components/special/ContactForm';

describe('ContactForm Component', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renders all form fields', () => {
    render(<ContactForm />);
    expect(screen.getByLabelText(/nama/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/subjek/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/pesan/i)).toBeInTheDocument();
  });

  it('renders submit button', () => {
    render(<ContactForm />);
    expect(screen.getByRole('button', { name: /kirim pesan/i })).toBeInTheDocument();
  });

  it('renders honeypot field that is hidden', () => {
    render(<ContactForm />);
    const honeypot = screen.getByLabelText(/jangan isi ini/i);
    expect(honeypot).toBeInTheDocument();
    expect(honeypot.closest('div')).toHaveAttribute('aria-hidden', 'true');
  });

  it('shows validation errors when submitting empty form', async () => {
    const user = userEvent.setup();
    render(<ContactForm />);

    const submitButton = screen.getByRole('button', { name: /kirim pesan/i });
    await user.click(submitButton);

    expect(screen.getByText('Nama minimal 2 karakter')).toBeInTheDocument();
    expect(screen.getByText('Email tidak valid')).toBeInTheDocument();
    expect(screen.getByText('Subjek wajib diisi')).toBeInTheDocument();
    expect(screen.getByText('Pesan minimal 10 karakter')).toBeInTheDocument();
  });

  it('shows error for short name on blur', async () => {
    const user = userEvent.setup();
    render(<ContactForm />);

    const nameInput = screen.getByLabelText(/nama/i);
    await user.type(nameInput, 'A');
    await user.tab();

    expect(screen.getByText('Nama minimal 2 karakter')).toBeInTheDocument();
  });

  it('shows error for invalid email on blur', async () => {
    const user = userEvent.setup();
    render(<ContactForm />);

    const emailInput = screen.getByLabelText(/email/i);
    await user.type(emailInput, 'invalidemail');
    await user.tab();

    expect(screen.getByText('Email tidak valid')).toBeInTheDocument();
  });

  it('does not show error for valid email', async () => {
    const user = userEvent.setup();
    render(<ContactForm />);

    const emailInput = screen.getByLabelText(/email/i);
    await user.type(emailInput, 'test@example.com');
    await user.tab();

    expect(screen.queryByText('Email tidak valid')).not.toBeInTheDocument();
  });

  it('shows error for empty subject on blur', async () => {
    const user = userEvent.setup();
    render(<ContactForm />);

    const subjectInput = screen.getByLabelText(/subjek/i);
    await user.click(subjectInput);
    await user.tab();

    expect(screen.getByText('Subjek wajib diisi')).toBeInTheDocument();
  });

  it('shows error for short message on blur', async () => {
    const user = userEvent.setup();
    render(<ContactForm />);

    const messageInput = screen.getByLabelText(/pesan/i);
    await user.type(messageInput, 'Short');
    await user.tab();

    expect(screen.getByText('Pesan minimal 10 karakter')).toBeInTheDocument();
  });

  it('does not show validation error for valid inputs', async () => {
    const user = userEvent.setup();
    render(<ContactForm />);

    await user.type(screen.getByLabelText(/nama/i), 'Ahmad');
    await user.type(screen.getByLabelText(/email/i), 'ahmad@test.com');
    await user.type(screen.getByLabelText(/subjek/i), 'Test Subject');
    await user.type(screen.getByLabelText(/pesan/i), 'Ini adalah pesan test yang cukup panjang');
    await user.tab();

    expect(screen.queryByText('Nama minimal 2 karakter')).not.toBeInTheDocument();
    expect(screen.queryByText('Email tidak valid')).not.toBeInTheDocument();
    expect(screen.queryByText('Subjek wajib diisi')).not.toBeInTheDocument();
    expect(screen.queryByText('Pesan minimal 10 karakter')).not.toBeInTheDocument();
  });

  it('shows success message after successful submit', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({ ok: true });

    const user = userEvent.setup();
    render(<ContactForm />);

    await user.type(screen.getByLabelText(/nama/i), 'Ahmad');
    await user.type(screen.getByLabelText(/email/i), 'ahmad@test.com');
    await user.type(screen.getByLabelText(/subjek/i), 'Test Subject');
    await user.type(screen.getByLabelText(/pesan/i), 'Ini adalah pesan test yang cukup panjang');
    await user.click(screen.getByRole('button', { name: /kirim pesan/i }));

    await waitFor(() => {
      expect(screen.getByText(/pesan berhasil dikirim/i)).toBeInTheDocument();
    });
  });

  it('shows error message when fetch fails', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('Network error'));

    const user = userEvent.setup();
    render(<ContactForm />);

    await user.type(screen.getByLabelText(/nama/i), 'Ahmad');
    await user.type(screen.getByLabelText(/email/i), 'ahmad@test.com');
    await user.type(screen.getByLabelText(/subjek/i), 'Test Subject');
    await user.type(screen.getByLabelText(/pesan/i), 'Ini adalah pesan test yang cukup panjang');
    await user.click(screen.getByRole('button', { name: /kirim pesan/i }));

    await waitFor(() => {
      expect(screen.getByText(/gagal mengirim pesan/i)).toBeInTheDocument();
    });
  });

  it('shows error when response is not ok', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({ ok: false });

    const user = userEvent.setup();
    render(<ContactForm />);

    await user.type(screen.getByLabelText(/nama/i), 'Ahmad');
    await user.type(screen.getByLabelText(/email/i), 'ahmad@test.com');
    await user.type(screen.getByLabelText(/subjek/i), 'Test Subject');
    await user.type(screen.getByLabelText(/pesan/i), 'Ini adalah pesan test yang cukup panjang');
    await user.click(screen.getByRole('button', { name: /kirim pesan/i }));

    await waitFor(() => {
      expect(screen.getByText(/gagal mengirim pesan/i)).toBeInTheDocument();
    });
  });

  it('clears field error when user starts typing', async () => {
    const user = userEvent.setup();
    render(<ContactForm />);

    await user.click(screen.getByRole('button', { name: /kirim pesan/i }));
    expect(screen.getByText('Nama minimal 2 karakter')).toBeInTheDocument();

    await user.type(screen.getByLabelText(/nama/i), 'Ah');
    expect(screen.queryByText('Nama minimal 2 karakter')).not.toBeInTheDocument();
  });

  it('has accessible form structure with labels', () => {
    render(<ContactForm />);
    const nameInput = screen.getByRole('textbox', { name: /nama/i });
    const emailInput = screen.getByRole('textbox', { name: /email/i });
    const subjectInput = screen.getByRole('textbox', { name: /subjek/i });
    const messageInput = screen.getByRole('textbox', { name: /pesan/i });

    expect(nameInput).toBeInTheDocument();
    expect(emailInput).toBeInTheDocument();
    expect(subjectInput).toBeInTheDocument();
    expect(messageInput).toBeInTheDocument();
  });
});
