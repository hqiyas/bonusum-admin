'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

export default function Login() {
  const router = useRouter();
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');

  const submit = async (e: any) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const r = await api.post('/auth/login', { email, password });
      if (r.data.user?.role !== 'bonusum_admin') {
        setError('Bu panel yalnız Bonusum administratorları üçündür.');
        return;
      }
      localStorage.setItem('bonusum_admin_token', r.data.token);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Giriş xətası baş verdi.');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[#1a1a2e] rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">🎁</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Bonusum Admin</h1>
          <p className="text-gray-500 text-sm mt-1">İdarəetmə panelinə daxil olun</p>
        </div>

        <div className="card p-8">
          {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 text-sm px-4 py-3 rounded-xl mb-5">
              {error}
            </div>
          )}
          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
              <input type="email" required className="input-field" placeholder="admin@bonusum.az"
                value={email} onChange={e => setEmail(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Şifrə</label>
              <input type="password" required className="input-field" placeholder="••••••••"
                value={password} onChange={e => setPassword(e.target.value)} />
            </div>
            <button type="submit" disabled={loading}
              className="btn-primary w-full justify-center py-3 mt-2">
              {loading
                ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : 'Daxil ol'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}