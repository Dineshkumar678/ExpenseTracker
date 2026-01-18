'use client';

import { useRef, useState } from 'react';

type ExpenseFormProps = {
  onCreated: () => Promise<void>;
};

const pendingKeyStorage = 'pendingExpenseKey';
const pendingPayloadStorage = 'pendingExpensePayload';

export default function ExpenseForm({ onCreated }: ExpenseFormProps) {
  const formRef = useRef<HTMLFormElement>(null);
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

    const form = formRef.current;
    if (!form) {
      setError('Form is not available. Please refresh the page.');
      setLoading(false);
      return;
    }

    const formData = new FormData(form);
    const payload = {
      amount: String(formData.get('amount') ?? ''),
      category: String(formData.get('category') ?? ''),
      description: String(formData.get('description') ?? ''),
      date: String(formData.get('date') ?? ''),
    };

    const amountValue = Number(payload.amount);
    if (!payload.amount || Number.isNaN(amountValue) || amountValue <= 0) {
      setError('Please enter a positive amount.');
      setLoading(false);
      return;
    }
    if (!payload.category.trim()) {
      setError('Please enter a category.');
      setLoading(false);
      return;
    }
    if (!payload.description.trim()) {
      setError('Please enter a description.');
      setLoading(false);
      return;
    }
    if (!payload.date.trim()) {
      setError('Please select a date.');
      setLoading(false);
      return;
    }

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
        const message = typeof errorBody.error === 'string' ? errorBody.error : 'Failed to save expense.';
        const retryable = response.status >= 500 || response.status === 429;
        const retryNote = retryable
          ? ' You can retry safely without creating a duplicate.'
          : '';
        throw new Error(`${message}${retryNote}`);
      }

      clearPendingKey();
      form.reset();
      setStatus('Expense saved.');
      await onCreated();
    } catch (err) {
      if (err instanceof TypeError) {
        setError('Network error. You can retry safely without creating a duplicate.');
        return;
      }
      setError(err instanceof Error ? err.message : 'Failed to save expense.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit}>
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
