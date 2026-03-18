'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { authApi } from '@/lib/api';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const [fullName, setFullName] = useState('');
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
      const data = await authApi.register({ email, password, fullName });
      login({ ...data, token: data.token });
      router.push('/');
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 -mt-20">
      <div className="classy-card p-10 w-full max-w-md">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-rose-500 flex items-center justify-center mx-auto mb-6 border border-rose-600">
            <span className="text-white text-3xl">✦</span>
          </div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Join SmartCart</h1>
          <p className="text-slate-500 mt-2 font-medium">Create your profile to start curating</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-600 text-sm font-medium flex items-center gap-2">
             <span>⚠</span> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Full Name</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="input-field"
              placeholder="e.g. John Doe"
              required
              id="register-name"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field"
              placeholder="e.g. name@example.com"
              required
              id="register-email"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Create Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field"
              placeholder="Minimum 6 characters"
              required
              minLength={6}
              id="register-password"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full justify-center !py-4 text-lg mt-4"
            id="register-submit"
          >
            {loading ? 'Processing...' : 'Create Account ↗'}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-slate-500 font-medium">
            Already a member?{' '}
            <Link href="/login" className="text-slate-900 hover:text-rose-500 font-bold underline decoration-2 underline-offset-4 transition-colors">
              Access Portal
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
