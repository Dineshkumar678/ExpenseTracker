import { FiltersState } from './ExpensePage';

const currencyFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 2,
});

type FiltersProps = {
  categories: string[];
  filters: FiltersState;
  totalPaise: number;
  disabled?: boolean;
  onChange: (filters: FiltersState) => void;
};

export default function Filters({ categories, filters, totalPaise, disabled, onChange }: FiltersProps) {
  return (
    <div className="toolbar">
      <div>
        <label>
          Filter by category
          <select
            value={filters.category}
            disabled={disabled}
            onChange={(event) => onChange({ ...filters, category: event.target.value })}
          >
            <option value="">All</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div>
        <label>
          Sort by date
          <select
            value={filters.sort}
            disabled={disabled}
            onChange={(event) => onChange({ ...filters, sort: event.target.value as FiltersState['sort'] })}
          >
            <option value="date_desc">Newest first</option>
            <option value="none">None</option>
          </select>
        </label>
      </div>
      <div className="total">Total: {currencyFormatter.format(totalPaise / 100)}</div>
    </div>
  );
}
