import type { Summary } from '../types';

interface Props { summary: Summary; }

export default function SummaryCards({ summary }: Props) {
  const fmt = (n: number) => n.toLocaleString();

  return (
    <div className='grid grid-cols-3 gap-4 mb-6'>
      <div className='bg-white p-4 rounded-xl shadow text-center border-t-4 border-green-500'>
        <p className='text-sm text-gray-500 mb-1'>Total Income</p>
        <p className='text-2xl font-bold text-green-600'>₱{fmt(summary.totalIncome)}</p>
      </div>
      <div className='bg-white p-4 rounded-xl shadow text-center border-t-4 border-red-500'>
        <p className='text-sm text-gray-500 mb-1'>Total Expenses</p>
        <p className='text-2xl font-bold text-red-600'>₱{fmt(summary.totalExpense)}</p>
      </div>
      <div className='bg-white p-4 rounded-xl shadow text-center border-t-4 border-blue-500'>
        <p className='text-sm text-gray-500 mb-1'>Balance</p>
        <p className={`text-2xl font-bold ${summary.balance >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
          ₱{fmt(summary.balance)}
        </p>
      </div>
    </div>
  );
}