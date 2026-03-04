interface Filters {
  type:     string;
  category: string;
  month:    string;
}

interface Props {
  filters:  Filters;
  onFilter: (filters: Filters) => void;
}

const CATEGORIES = ['','Food','Transport','Entertainment','Shopping',
  'Health','Education','Bills','Salary','Freelance','Investment','Other'];

export default function FilterBar({ filters, onFilter }: Props) {
  const sel = 'border border-gray-300 p-2 rounded-lg text-sm outline-none focus:border-blue-500 bg-white';

  return (
    <div className='flex gap-3 mb-4 flex-wrap'>
      <select value={filters.type}
        onChange={e => onFilter({ ...filters, type: e.target.value })}
        className={sel}>
        <option value=''>All Types</option>
        <option value='income'>Income</option>
        <option value='expense'>Expense</option>
      </select>

      <select value={filters.category}
        onChange={e => onFilter({ ...filters, category: e.target.value })}
        className={sel}>
        {CATEGORIES.map(c => (
          <option key={c} value={c}>{c || 'All Categories'}</option>
        ))}
      </select>

      <input type='month' value={filters.month}
        onChange={e => onFilter({ ...filters, month: e.target.value })}
        className={sel} />

      <button onClick={() => onFilter({ type: '', category: '', month: '' })}
        className='text-sm text-blue-600 hover:text-blue-800 font-semibold'>
        Clear Filters
      </button>
    </div>
  );
}