import { describe, it, expect } from 'vitest';
import { formatDateIndonesian, formatDateShort } from '../../utils/formatDate';

describe('formatDateIndonesian', () => {
  it('formats a date string to Indonesian long format', () => {
    const result = formatDateIndonesian('2026-03-15');
    expect(result).toContain('15');
    expect(result).toContain('Maret');
    expect(result).toContain('2026');
  });

  it('formats January dates correctly', () => {
    const result = formatDateIndonesian('2026-01-10');
    expect(result).toContain('10');
    expect(result).toContain('Januari');
    expect(result).toContain('2026');
  });

  it('formats December dates correctly', () => {
    const result = formatDateIndonesian('2025-12-15');
    expect(result).toContain('15');
    expect(result).toContain('Desember');
    expect(result).toContain('2025');
  });

  it('formats dates with day padding', () => {
    const result = formatDateIndonesian('2026-02-05');
    expect(result).toContain('5');
    expect(result).toContain('Februari');
  });
});

describe('formatDateShort', () => {
  it('formats a date string to Indonesian short format', () => {
    const result = formatDateShort('2026-03-15');
    expect(result).toContain('15');
    expect(result).toContain('2026');
  });
});
