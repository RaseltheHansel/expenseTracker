import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import type { Transaction, Summary, monthlyData, categoryData, user } from '../types';
import SummaryCards    from '../components/summaryCard';
import FilterBar       from '../components/filterBar';
import TransactionForm from '../components/transactionForm';
import TransactionItem from '../components/transactionItem';

interface Filters { type: string; category: string; month: string; }

export default function Dashboard() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [summary,      setSummary]      = useState<Summary>({ totalIncome: 0, totalExpense: 0, balance: 0, transactionCount: 0 });
  const [monthly,      setMonthly]      = useState<monthlyData[]>([]);
  const [categories,   setCategories]   = useState<categoryData[]>([]);
  const [filters,      setFilters]      = useState<Filters>({ type: '', category: '', month: '' });
  const [loading,      setLoading]      = useState<boolean>(true);
  const navigate = useNavigate();

  const userStr = localStorage.getItem('user');
  const user: user | null = userStr ? JSON.parse(userStr) : null;

  // Load summary, monthly, categories once on mount
  useEffect(() => {
    const loadMeta = async (): Promise<void> => {
      try {
        const [sumRes, monRes, catRes] = await Promise.all([
          api.get<Summary>('/transactions/summary'),
          api.get<monthlyData[]>('/transactions/monthly'),
          api.get<categoryData[]>('/transactions/categories'),
        ]);
        setSummary(sumRes.data);
        setMonthly(monRes.data);
        setCategories(catRes.data);
      } catch {
        navigate('/login');
      }
    };
    loadMeta();
  }, [navigate]);

  // Reload transactions whenever filters change
  const loadTransactions = useCallback(async (): Promise<void> => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.type)     params.append('type',     filters.type);
      if (filters.category) params.append('category', filters.category);
      if (filters.month)    params.append('month',    filters.month);
      const res = await api.get<Transaction[]>('/transactions?' + params.toString());
      setTransactions(res.data);
    } catch { alert('Failed to load transactions.'); }
    setLoading(false);
  }, [filters]);

  useEffect(() => { loadTransactions(); }, [loadTransactions]);

  const refreshSummary = async (): Promise<void> => {
    try {
      const res = await api.get<Summary>('/transactions/summary');
      setSummary(res.data);
    } catch {}
  };

  const handleAdd = async (t: Transaction): Promise<void> => {
    setTransactions(prev => [t, ...prev]);
    await refreshSummary();
  };

  const handleDelete = async (id: string): Promise<void> => {
    setTransactions(prev => prev.filter(t => t._id !== id));
    await refreshSummary();
  };

  const handleLogout = (): void => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className='min-h-screen bg-gray-100'>
      {/* Navbar */}
      <nav className='bg-white shadow-sm border-b px-6 py-3 flex justify-between items-center'>
        <h1 className='text-xl font-bold text-blue-600'>Expense Tracker</h1>
        <div className='flex items-center gap-4'>
          {user && <span className='text-gray-600 text-sm'>👋 {user.name}</span>}
          <button onClick={handleLogout}
            className='bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-bold'>
            Logout
          </button>
        </div>
      </nav>

      <div className='max-w-3xl mx-auto p-6'>

        {/* Summary cards */}
        <SummaryCards summary={summary} />

        {/* Monthly breakdown */}
        {monthly.length > 0 && (
          <div className='bg-white p-4 rounded-xl shadow mb-6'>
            <h2 className='font-bold text-gray-700 mb-3'>Monthly Breakdown</h2>
            <div className='space-y-2'>
              {monthly.slice(0, 3).map(m => (
                <div key={m.month} className='flex justify-between items-center text-sm'>
                  <span className='text-gray-500 font-medium'>{m.month}</span>
                  <span className='text-green-600'>+₱{m.totalIncome.toLocaleString()}</span>
                  <span className='text-red-600'>-₱{m.totalExpense.toLocaleString()}</span>
                  <span className={`font-bold ${m.balance >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                    ₱{m.balance.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Category breakdown */}
        {categories.length > 0 && (
          <div className='bg-white p-4 rounded-xl shadow mb-6'>
            <h2 className='font-bold text-gray-700 mb-3'>Top Spending Categories</h2>
            <div className='space-y-2'>
              {categories.slice(0, 5).map(c => (
                <div key={c.category} className='flex justify-between text-sm'>
                  <span className='text-gray-600'>{c.category}</span>
                  <span className='text-red-600 font-semibold'>₱{c.total.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Add transaction */}
        <TransactionForm onAdd={handleAdd} />

        {/* Filters */}
        <FilterBar filters={filters} onFilter={setFilters} />

        {/* Transaction list */}
        {loading ? (
          <p className='text-center text-gray-500 py-8'>Loading...</p>
        ) : transactions.length === 0 ? (
          <div className='text-center text-gray-400 py-12'>
            <p className='text-4xl mb-3'>💰</p>
            <p className='font-semibold'>No transactions found</p>
            <p className='text-sm'>Add your first transaction above</p>
          </div>
        ) : (
          transactions.map(t => (
            <TransactionItem key={t._id} transaction={t} onDelete={handleDelete} />
          ))
        )}
      </div>
    </div>
  );
}