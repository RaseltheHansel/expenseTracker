import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import type { ReactNode } from 'react';
import Login     from './pages/Login';
import Register  from './pages/Register';
import Dashboard from './pages/Dashboard';

const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const token = localStorage.getItem('token');
  return token ? <>{children}</> : <Navigate to='/login' replace />;
};

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/login'     element={<Login />} />
        <Route path='/register'  element={<Register />} />
        <Route path='/dashboard' element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path='/'          element={<Navigate to='/login' replace />} />
      </Routes>
    </BrowserRouter>
  );
}