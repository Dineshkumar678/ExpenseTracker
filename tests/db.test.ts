import { describe, expect, it } from 'vitest';
import { formatAmountFromPaise, normalizeDate, parseAmountToPaise } from '../lib/db';

describe('parseAmountToPaise', () => {
  it('parses whole numbers and decimals', () => {
    expect(parseAmountToPaise('10')).toBe(1000);
    expect(parseAmountToPaise('10.5')).toBe(1050);
    expect(parseAmountToPaise('10.50')).toBe(1050);
  });

  it('rejects invalid or negative amounts', () => {
    expect(parseAmountToPaise('abc')).toBeNull();
    expect(parseAmountToPaise('-2')).toBeNull();
    expect(parseAmountToPaise('10.999')).toBeNull();
  });
});

describe('formatAmountFromPaise', () => {
  it('formats paise as a decimal string', () => {
    expect(formatAmountFromPaise(1234)).toBe('12.34');
    expect(formatAmountFromPaise(100)).toBe('1.00');
  });
});

describe('normalizeDate', () => {
  it('normalizes to UTC date', () => {
    const date = normalizeDate('2026-01-18');
    expect(date?.toISOString().slice(0, 10)).toBe('2026-01-18');
  });

  it('returns null for invalid dates', () => {
    expect(normalizeDate('not-a-date')).toBeNull();
  });
});
