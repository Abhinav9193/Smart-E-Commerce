'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { authApi } from '@/lib/api';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const data = await authApi.login({ email, password });
      login({ ...data, token: data.token });
      router.push('/');
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 -mt-20">
      <div className="classy-card p-10 w-full max-w-md">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-black flex items-center justify-center mx-auto mb-6 border border-black">
            <span className="text-white text-3xl">✥</span>
          </div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Access Portal</h1>
          <p className="text-slate-500 mt-2 font-medium">Verify your credentials to continue</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-600 text-sm font-medium flex items-center gap-2">
            <span>⚠</span> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field"
              placeholder="e.g. name@example.com"
              required
              id="login-email"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field"
              placeholder="••••••••"
              required
              id="login-password"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full justify-center !py-4 text-lg mt-4"
            id="login-submit"
          >
            {loading ? 'Authenticating...' : 'Sign In ↗'}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-slate-500 font-medium">
            New to SmartCart?{' '}
            <Link href="/register" className="text-slate-900 hover:text-rose-500 font-bold underline decoration-2 underline-offset-4 transition-colors">
              Create an account
            </Link>
          </p>
        </div>

        <div className="mt-8 p-6 bg-slate-50 border border-slate-200">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400 text-center mb-3">Demo Credentials</p>
          <div className="space-y-2">
            <p className="text-sm text-slate-600 text-center font-mono bg-white p-2 border border-slate-200">admin@smartcart.com / admin123</p>
            <p className="text-sm text-slate-600 text-center font-mono bg-white p-2 border border-slate-200">user@smartcart.com / user123</p>
          </div>
        </div>
      </div>
    </div>
  );
}
