import { describe, it, expect } from 'vitest';
import { formatRupiah } from '../../utils/formatCurrency';

describe('formatRupiah', () => {
  it('formats zero correctly', () => {
    const result = formatRupiah(0);
    expect(result).toMatch(/Rp\s*0/);
  });

  it('formats small amounts correctly', () => {
    const result = formatRupiah(150000);
    expect(result).toContain('150.000');
    expect(result).toMatch(/^Rp/);
  });

  it('formats millions correctly', () => {
    const result = formatRupiah(750000);
    expect(result).toContain('750.000');
  });

  it('formats large amounts correctly', () => {
    const result = formatRupiah(15000000);
    expect(result).toContain('15.000.000');
  });

  it('formats negative amounts correctly', () => {
    const result = formatRupiah(-500000);
    expect(result).toContain('500.000');
    expect(result).toMatch(/^-/);
  });

  it('uses Indonesian locale format with dots as thousands separator', () => {
    const result = formatRupiah(1234567);
    expect(result).toContain('1.234.567');
  });

  it('does not include decimal places', () => {
    const result = formatRupiah(1000);
    expect(result).not.toContain(',');
  });
});
