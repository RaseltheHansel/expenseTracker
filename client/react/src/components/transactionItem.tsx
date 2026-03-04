import type { Transaction } from '../types';
import api from '../api/axios';

interface Props {
  transaction: Transaction;
  onDelete:    (id: string) => void;
}

export default function TransactionItem({ transaction: t, onDelete }: Props) {
  const handleDelete = async (): Promise<void> => {
    if (!confirm('Delete this transaction?')) return;
    try {
      await api.delete('/transactions/' + t._id);
      onDelete(t._id);
    } catch { alert('Failed to delete.'); }
  };

  const isIncome = t.type === 'income';
  const dateStr  = new Date(t.date).toLocaleDateString('en-PH', {
    month: 'short', day: 'numeric', year: 'numeric'
  });

  return (
    <div className='flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-100 mb-2 shadow-sm'>

      {/* Color dot — green for income, red for expense */}
      <div className={`w-3 h-3 rounded-full shrink-0 ${isIncome ? 'bg-green-500' : 'bg-red-500'}`} />

      {/* Info */}
      <div className='flex-1 min-w-0'>
        <div className='flex items-center gap-2'>
          <span className='text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full'>
            {t.category}
          </span>
          {t.description && (
            <span className='text-sm text-gray-700 truncate'>{t.description}</span>
          )}
        </div>
        <p className='text-xs text-gray-400 mt-0.5'>{dateStr}</p>
      </div>

      {/* Amount */}
      <p className={`font-bold text-sm shrink-0 ${isIncome ? 'text-green-600' : 'text-red-600'}`}>
        {isIncome ? '+' : '-'}₱{t.amount.toLocaleString()}
      </p>

      {/* Delete button */}
      <button onClick={handleDelete}
        className='text-gray-300 hover:text-red-500 font-bold text-lg leading-none'>
        ×
      </button>
    </div>
  );
}