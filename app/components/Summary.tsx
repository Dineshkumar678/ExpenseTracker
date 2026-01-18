import { Expense } from './ExpensePage';

const currencyFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 2,
});

type SummaryProps = {
  expenses: Expense[];
};

export default function Summary({ expenses }: SummaryProps) {
  const totals = expenses.reduce<Record<string, number>>((acc, expense) => {
    acc[expense.category] = (acc[expense.category] ?? 0) + expense.amountPaise;
    return acc;
  }, {});

  const entries = Object.entries(totals).sort((a, b) => a[0].localeCompare(b[0]));

  if (!entries.length) {
    return null;
  }

  return (
    <div className="summary">
      <h3>Summary by Category</h3>
      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Category</th>
              <th className="amount">Total</th>
            </tr>
          </thead>
          <tbody>
            {entries.map(([category, total]) => (
              <tr key={category}>
                <td>{category}</td>
                <td className="amount">{currencyFormatter.format(total / 100)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
