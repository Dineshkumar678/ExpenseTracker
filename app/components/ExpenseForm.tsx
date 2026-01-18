'use client';

import { useState } from 'react';

type ExpenseFormProps = {
  onCreated: () => Promise<void>;
};

const pendingKeyStorage = 'pendingExpenseKey';
const pendingPayloadStorage = 'pendingExpensePayload';

export default function ExpenseForm({ onCreated }: ExpenseFormProps) {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');

  function payloadKey(payload: Record<string, string>) {
    return JSON.stringify(payload);
  }

  function getIdempotencyKey(payload: Record<string, string>) {
    const storedPayload = sessionStorage.getItem(pendingPayloadStorage);
    const storedKey = sessionStorage.getItem(pendingKeyStorage);
    const keyForPayload = payloadKey(payload);

    if (storedPayload === keyForPayload && storedKey) {
      return storedKey;
    }

    const newKey = crypto.randomUUID();
    sessionStorage.setItem(pendingPayloadStorage, keyForPayload);
    sessionStorage.setItem(pendingKeyStorage, newKey);
    return newKey;
  }

  function clearPendingKey() {
    sessionStorage.removeItem(pendingPayloadStorage);
    sessionStorage.removeItem(pendingKeyStorage);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus('');
    setError('');
    setLoading(true);

    const formData = new FormData(event.currentTarget);
    const payload = {
      amount: String(formData.get('amount') ?? ''),
      category: String(formData.get('category') ?? ''),
      description: String(formData.get('description') ?? ''),
      date: String(formData.get('date') ?? ''),
    };

    try {
      const idempotencyKey = getIdempotencyKey(payload);
      const response = await fetch('/api/expenses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ idempotencyKey, ...payload }),
      });

      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}));
        throw new Error(errorBody.error || 'Failed to save expense.');
      }

      clearPendingKey();
      event.currentTarget.reset();
      setStatus('Expense saved.');
      await onCreated();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save expense.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid">
        <label>
          Amount (₹)
          <input type="number" step="0.01" min="0" name="amount" required />
        </label>
        <label>
          Category
          <input type="text" name="category" required />
        </label>
        <label>
          Date
          <input type="date" name="date" required />
        </label>
        <label className="full">
          Description
          <input type="text" name="description" required />
        </label>
      </div>
      <div className="actions">
        <button type="submit" disabled={loading}>
          {loading ? 'Saving...' : 'Add Expense'}
        </button>
        <span className="status" style={{ color: error ? '#d64545' : '#52606d' }}>
          {error || status}
        </span>
      </div>
    </form>
  );
}
