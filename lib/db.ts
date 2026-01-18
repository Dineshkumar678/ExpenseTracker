export function parseAmountToPaise(value: string | number): number | null {
  const str = String(value).trim();
  if (!/^\d+(\.\d{1,2})?$/.test(str)) {
    return null;
  }
  const [whole, fraction = ''] = str.split('.');
  const padded = fraction.padEnd(2, '0');
  const paise = Number(whole) * 100 + Number(padded);
  if (!Number.isFinite(paise)) {
    return null;
  }
  return paise;
}

export function formatAmountFromPaise(paise: number): string {
  const sign = paise < 0 ? '-' : '';
  const abs = Math.abs(paise);
  const whole = Math.floor(abs / 100);
  const fraction = String(abs % 100).padStart(2, '0');
  return `${sign}${whole}.${fraction}`;
}

export function normalizeDate(value: string): Date | null {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }
  // Normalize to start of day UTC to avoid timezone drift
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

export function sanitizeText(value: unknown): string {
  if (typeof value !== 'string') {
    return '';
  }
  return value.trim();
}
