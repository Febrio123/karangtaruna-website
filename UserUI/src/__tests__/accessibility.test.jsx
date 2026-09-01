import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithRouter } from '../test/test-utils';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import ContactForm from '../components/special/ContactForm';
import Alert from '../components/ui/Alert';
import Input from '../components/ui/Input';
import Textarea from '../components/ui/Textarea';

describe('Accessibility Tests', () => {
  describe('Skip Link', () => {
    it('skip link exists and targets main content', () => {
      renderWithRouter(<Navbar />);
      const skipLink = screen.getByText('Langsung ke konten');
      expect(skipLink).toBeInTheDocument();
      expect(skipLink).toHaveAttribute('href', '#main-content');
    });

    it('skip link has skip-link class', () => {
      renderWithRouter(<Navbar />);
      const skipLink = screen.getByText('Langsung ke konten');
      expect(skipLink.className).toContain('skip-link');
    });
  });

  describe('ARIA Labels and Roles', () => {
    it('hamburger button has aria-label', () => {
      renderWithRouter(<Navbar />);
      const hamburger = screen.getByRole('button', { name: /buka menu navigasi/i });
      expect(hamburger).toBeInTheDocument();
    });

    it('hamburger button has aria-expanded', () => {
      renderWithRouter(<Navbar />);
      const hamburger = screen.getByRole('button', { name: /buka menu navigasi/i });
      expect(hamburger).toHaveAttribute('aria-expanded');
    });

    it('desktop navigation has aria-label', () => {
      renderWithRouter(<Navbar />);
      const nav = screen.getByLabelText('Navigasi utama');
      expect(nav).toBeInTheDocument();
    });

    it('banner role on header', () => {
      renderWithRouter(<Navbar />);
      const header = screen.getByRole('banner');
      expect(header).toBeInTheDocument();
    });

    it('contentinfo role on footer', () => {
      renderWithRouter(<Footer />);
      const footer = screen.getByRole('contentinfo');
      expect(footer).toBeInTheDocument();
    });

    it('footer has aria-label on link nav', () => {
      renderWithRouter(<Footer />);
      const footerNav = screen.getByLabelText('Tautan footer');
      expect(footerNav).toBeInTheDocument();
    });
  });

  describe('Form Accessibility', () => {
    it('all form fields have associated labels', () => {
      renderWithRouter(<ContactForm />);
      expect(screen.getByLabelText(/nama/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/subjek/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/pesan/i)).toBeInTheDocument();
    });

    it('Input component has aria-invalid when error', () => {
      renderWithRouter(<Input label="Name" error="Required" />);
      const input = screen.getByLabelText('Name');
      expect(input).toHaveAttribute('aria-invalid', 'true');
    });

    it('Input component has aria-describedby when error', () => {
      renderWithRouter(<Input label="Name" error="Required" />);
      const input = screen.getByLabelText('Name');
      expect(input).toHaveAttribute('aria-describedby', 'name-error');
    });

    it('error message has role="alert"', () => {
      renderWithRouter(<Input label="Name" error="Required" />);
      const error = screen.getByRole('alert');
      expect(error).toHaveTextContent('Required');
    });

    it('Textarea has aria-describedby when error', () => {
      renderWithRouter(<Textarea label="Message" error="Too short" />);
      const textarea = screen.getByLabelText('Message');
      expect(textarea).toHaveAttribute('aria-describedby', 'message-error');
    });
  });

  describe('Alert Accessibility', () => {
    it('Alert has role="alert" for screen readers', () => {
      renderWithRouter(<Alert variant="error">Error occurred</Alert>);
      const alert = screen.getByRole('alert');
      expect(alert).toBeInTheDocument();
    });

    it('Alert with success variant has role="alert"', () => {
      renderWithRouter(<Alert variant="success">Saved successfully</Alert>);
      const alert = screen.getByRole('alert');
      expect(alert).toHaveTextContent('Saved successfully');
    });
  });

  describe('Semantic HTML', () => {
    it('links have accessible names', () => {
      renderWithRouter(<Navbar />);
      const links = screen.getAllByRole('link');
      links.forEach((link) => {
        expect(link).toHaveAccessibleName();
      });
    });
  });
});
