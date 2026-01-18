import { Expense } from './ExpensePage';

const currencyFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 2,
});

export default function ExpenseList({ expenses }: { expenses: Expense[] }) {
  return (
    <div className="table-wrapper">
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Category</th>
            <th>Description</th>
            <th className="amount">Amount</th>
          </tr>
        </thead>
        <tbody>
      {expenses.map((expense) => (
            <tr key={expense.id}>
              <td>{expense.date}</td>
              <td>{expense.category}</td>
              <td>{expense.description}</td>
          <td className="amount">{currencyFormatter.format(expense.amountPaise / 100)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
