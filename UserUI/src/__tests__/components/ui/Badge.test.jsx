import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Badge from '../../../components/ui/Badge';

describe('Badge Component', () => {
  it('renders with default primary variant', () => {
    render(<Badge>Keagamaan</Badge>);
    const badge = screen.getByText('Keagamaan');
    expect(badge).toBeInTheDocument();
  });

  it('renders children text', () => {
    render(<Badge>Olahraga</Badge>);
    expect(screen.getByText('Olahraga')).toBeInTheDocument();
  });

  it('renders success variant', () => {
    render(<Badge variant="success">Active</Badge>);
    const badge = screen.getByText('Active');
    expect(badge).toBeInTheDocument();
    expect(badge.className).toContain('success');
  });

  it('renders danger variant', () => {
    render(<Badge variant="danger">Urgent</Badge>);
    const badge = screen.getByText('Urgent');
    expect(badge).toBeInTheDocument();
    expect(badge.className).toContain('danger');
  });

  it('renders neutral variant', () => {
    render(<Badge variant="neutral">Info</Badge>);
    const badge = screen.getByText('Info');
    expect(badge).toBeInTheDocument();
  });

  it('renders accent variant', () => {
    render(<Badge variant="accent">New</Badge>);
    const badge = screen.getByText('New');
    expect(badge).toBeInTheDocument();
    expect(badge.className).toContain('accent');
  });

  it('applies custom className', () => {
    render(<Badge className="custom-class">Test</Badge>);
    const badge = screen.getByText('Test');
    expect(badge.className).toContain('custom-class');
  });
});
