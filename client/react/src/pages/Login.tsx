import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import type { AuthResponse } from '../types';

export default function Login() {
  const [email,    setEmail]    = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error,    setError]    = useState<string>('');
  const [loading,  setLoading]  = useState<boolean>(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const res = await api.post<AuthResponse>('/auth/login', { email, password });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user',  JSON.stringify(res.data.user));
      navigate('/dashboard');
    } catch { setError('Invalid email or password.'); }
    setLoading(false);
  };

  const inp = 'w-full border border-gray-300 p-3 rounded-lg outline-none focus:border-blue-500';

  return (
    <div className='min-h-screen bg-gray-100 flex items-center justify-center'>
      <div className='bg-white p-8 rounded-2xl shadow-lg w-full max-w-md'>
        <h1 className='text-3xl font-bold text-gray-800 mb-2'>Welcome back!</h1>
        <p className='text-gray-500 mb-6'>Login to your expense tracker</p>
        {error && <p className='text-red-500 mb-4 text-sm'>{error}</p>}
        <form onSubmit={handleSubmit} className='space-y-4'>
          <input type='email' placeholder='Email' value={email}
            onChange={e => setEmail(e.target.value)} required className={inp} />
          <input type='password' placeholder='Password' value={password}
            onChange={e => setPassword(e.target.value)} required className={inp} />
          <button type='submit' disabled={loading}
            className='w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white py-3 rounded-lg font-bold'>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        <p className='text-center mt-4 text-gray-500'>
          No account? <Link to='/register' className='text-blue-600 font-semibold'>Register</Link>
        </p>
      </div>
    </div>
  );
}