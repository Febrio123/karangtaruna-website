import { describe, it, expect } from 'vitest';
import { slugify } from '../../utils/slugify';

describe('slugify', () => {
  it('converts text to lowercase slug', () => {
    expect(slugify('Hello World')).toBe('hello-world');
  });

  it('removes special characters', () => {
    expect(slugify('Hello, World!')).toBe('hello-world');
  });

  it('replaces spaces with hyphens', () => {
    expect(slugify('This Is A Test')).toBe('this-is-a-test');
  });

  it('collapses multiple hyphens', () => {
    expect(slugify('hello---world')).toBe('hello-world');
  });

  it('handles Indonesian text', () => {
    expect(slugify('Pengajian Bulan Ramadhan 2026')).toBe('pengajian-bulan-ramadhan-2026');
  });

  it('handles empty string', () => {
    expect(slugify('')).toBe('');
  });

  it('handles text with multiple spaces', () => {
    expect(slugify('hello   world')).toBe('hello-world');
  });

  it('preserves existing single hyphens', () => {
    expect(slugify('hello-world')).toBe('hello-world');
  });
});
