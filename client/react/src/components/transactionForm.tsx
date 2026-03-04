import { useState } from 'react';
import type { FormEvent } from 'react';
import api from '../api/axios';
import type { Transaction, TransactionType, Category } from '../types';

interface Props { onAdd: (t: Transaction) => void; }

const CATEGORIES: Category[] = ['Food','Transport','Entertainment','Shopping',
  'Health','Education','Bills','Salary','Freelance','Investment','Others'];

export default function TransactionForm({ onAdd }: Props) {
  const [type,        setType]        = useState<TransactionType>('expense');
  const [amount,      setAmount]      = useState<string>('');
  const [category,    setCategory]    = useState<Category>('Food');
  const [description, setDescription] = useState<string>('');
  const [date,        setDate]        = useState<string>('');
  const [loading,     setLoading]     = useState<boolean>(false);
  const [open,        setOpen]        = useState<boolean>(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) { alert('Enter a valid amount.'); return; }
    setLoading(true);
    try {
      const res = await api.post<{ transaction: Transaction }>('/transactions', {
        type, amount: Number(amount), category, description,
        date: date || undefined,
      });
      onAdd(res.data.transaction); // ✅ unwrap the nested transaction object
      setAmount(''); setDescription(''); setDate('');
      setOpen(false);
    } catch { alert('Failed to add transaction.'); }
    setLoading(false);
  };

  const cls = 'w-full border border-gray-300 p-2 rounded-lg text-sm outline-none focus:border-blue-500';

  return (
    <div className='mb-6'>
      <button onClick={() => setOpen(!open)}
        className='w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold mb-3'>
        {open ? 'Cancel' : '+ Add Transaction'}
      </button>

      {open && (
        <form onSubmit={handleSubmit} className='bg-white p-4 rounded-xl shadow space-y-3'>

          {/* Income / Expense toggle */}
          <div className='grid grid-cols-2 gap-2'>
            <button type='button' onClick={() => setType('expense')}
              className={`py-2 rounded-lg font-bold text-sm ${type === 'expense' ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-600'}`}>
              Expense
            </button>
            <button type='button' onClick={() => setType('income')}
              className={`py-2 rounded-lg font-bold text-sm ${type === 'income' ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-600'}`}>
              Income
            </button>
          </div>

          <input type='number' placeholder='Amount' value={amount}
            onChange={e => setAmount(e.target.value)} required min='1' className={cls} />

          <select value={category}
            onChange={e => setCategory(e.target.value as Category)}
            className={cls}>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>

          <input type='text' placeholder='Description (optional)' value={description}
            onChange={e => setDescription(e.target.value)} className={cls} />

          <input type='date' value={date}
            onChange={e => setDate(e.target.value)} className={cls} />

          <button type='submit' disabled={loading}
            className='w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white py-2 rounded-lg font-bold text-sm'>
            {loading ? 'Saving...' : 'Save Transaction'}
          </button>
        </form>
      )}
    </div>
  );
}