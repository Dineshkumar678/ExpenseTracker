'use client';

import { useEffect, useMemo, useState } from 'react';
import ExpenseForm from './ExpenseForm';
import Filters from './Filters';
import ExpenseList from './ExpenseList';
import Summary from './Summary';

export type Expense = {
  id: string;
  idempotencyKey: string;
  amount: string;
  amountPaise: number;
  category: string;
  description: string;
  date: string;
  createdAt: string;
};

export type FiltersState = {
  category: string;
  sort: 'date_desc' | 'none';
};

const defaultFilters: FiltersState = {
  category: '',
  sort: 'date_desc',
};

export default function ExpensePage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [filters, setFilters] = useState<FiltersState>(defaultFilters);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const filteredExpenses = useMemo(() => {
    if (!filters.category) {
      return expenses;
    }
    return expenses.filter((expense) => expense.category === filters.category);
  }, [expenses, filters.category]);

  const totalPaise = filteredExpenses.reduce((sum, expense) => sum + expense.amountPaise, 0);

  async function fetchExpenses(nextFilters = filters) {
    setIsLoading(true);
    setStatus('Loading expenses...');
    setError('');
    const params = new URLSearchParams();
    if (nextFilters.category) {
      params.set('category', nextFilters.category);
    }
    if (nextFilters.sort === 'date_desc') {
      params.set('sort', 'date_desc');
    }

    const response = await fetch(`/api/expenses?${params.toString()}`);
    if (!response.ok) {
      setError('Unable to load expenses. Please refresh.');
      setStatus('');
      setIsLoading(false);
      return;
    }

    const data = (await response.json()) as Expense[];
    setExpenses(data);
    setStatus(data.length ? '' : 'No expenses to display.');
    setIsLoading(false);
  }

  async function refreshCategories() {
    const response = await fetch('/api/expenses?sort=date_desc');
    if (!response.ok) {
      return;
    }
    const data = (await response.json()) as Expense[];
    const unique = new Set(data.map((expense) => expense.category));
    setCategories(Array.from(unique).sort());
  }

  useEffect(() => {
    fetchExpenses();
    refreshCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleFiltersChange(nextFilters: FiltersState) {
    setFilters(nextFilters);
    await fetchExpenses(nextFilters);
  }

  async function handleCreated() {
    await refreshCategories();
    await fetchExpenses(filters);
  }

  return (
    <main className="container">
      <header>
        <h1>Expense Tracker</h1>
        <p className="subtitle">Track your personal expenses with confidence.</p>
      </header>

      <section className="card">
        <h2>Add Expense</h2>
        <ExpenseForm onCreated={handleCreated} />
      </section>

      <section className="card">
        <Filters
          categories={categories}
          filters={filters}
          disabled={isLoading}
          onChange={handleFiltersChange}
          totalPaise={totalPaise}
        />
        <div className="status" style={{ color: error ? '#d64545' : '#52606d' }}>
          {error || status}
        </div>
        <ExpenseList expenses={filteredExpenses} />
        <Summary expenses={filteredExpenses} />
      </section>
    </main>
  );
}
