import { describe, expect, it } from 'vitest';
import { mapPrismaError } from '../lib/apiErrors';
import { formatSubmitErrorMessage } from '../app/components/expenseFormUtils';

describe('mapPrismaError', () => {
  it('maps known prisma errors to status and message', () => {
    expect(mapPrismaError({ code: 'P1001' })).toEqual({
      status: 503,
      message: 'Database unavailable. Please try again.',
    });
    expect(mapPrismaError({ code: 'P2002' })).toEqual({
      status: 409,
      message: 'Duplicate request.',
    });
    expect(mapPrismaError({ code: 'P2003' })).toEqual({
      status: 400,
      message: 'Invalid data reference.',
    });
    expect(mapPrismaError({ code: 'P2025' })).toEqual({
      status: 404,
      message: 'Record not found.',
    });
  });

  it('returns null for unknown errors', () => {
    expect(mapPrismaError({ code: 'P9999' })).toBeNull();
    expect(mapPrismaError(null)).toBeNull();
  });
});

describe('formatSubmitErrorMessage', () => {
  it('adds retry-safe note for retryable server errors', () => {
    const message = formatSubmitErrorMessage({ status: 503, apiMessage: 'Server down.' });
    expect(message).toBe('Server down. You can retry safely without creating a duplicate.');
  });

  it('keeps non-retryable messages intact', () => {
    const message = formatSubmitErrorMessage({ status: 400, apiMessage: 'Bad request.' });
    expect(message).toBe('Bad request.');
  });

  it('returns a network-safe retry message for network errors', () => {
    const message = formatSubmitErrorMessage({ isNetworkError: true });
    expect(message).toBe('Network error. You can retry safely without creating a duplicate.');
  });
});
