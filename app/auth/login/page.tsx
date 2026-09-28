'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { SparklesIcon, LockClosedIcon, EnvelopeIcon, ArrowRightIcon } from '@heroicons/react/24/solid';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('admin@rentalms.com');
  const [password, setPassword] = useState('adminpassword123');
  const [loading, setLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      router.push('/');
    }, 400);
  };

  const handleQuickLogin = (role: 'admin' | 'staff') => {
    if (role === 'admin') {
      setEmail('admin@rentalms.com');
      setPassword('adminpassword123');
    } else {
      setEmail('staff@rentalms.com');
      setPassword('staffpassword123');
    }
    setLoading(true);
    setTimeout(() => {
      router.push('/');
    }, 400);
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-100 max-w-md w-full p-8 space-y-6">
        {/* Brand */}
        <div className="text-center space-y-2">
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center mx-auto shadow-lg shadow-indigo-500/25">
            <SparklesIcon className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">RentalMS Portal</h1>
          <p className="text-xs text-slate-500">Sign in to manage fleet operations and rentals</p>
        </div>

        {/* Demo Fast Logins */}
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2">
          <span className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider text-center">
            Demo 1-Click Access
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuickLogin('admin')}
              className="py-1.5 px-3 bg-white border border-slate-200 hover:border-indigo-500 hover:bg-indigo-50 text-indigo-700 text-xs font-semibold rounded-lg transition-all shadow-2xs text-center"
            >
              Sign In Admin
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('staff')}
              className="py-1.5 px-3 bg-white border border-slate-200 hover:border-violet-500 hover:bg-violet-50 text-violet-700 text-xs font-semibold rounded-lg transition-all shadow-2xs text-center"
            >
              Sign In Staff
            </button>
          </div>
        </div>

        <form onSubmit={handleLogin} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Email Address</label>
            <div className="relative">
              <EnvelopeIcon className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Password</label>
            <div className="relative">
              <LockClosedIcon className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 font-medium"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 text-xs disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign In to Dashboard'}
            <ArrowRightIcon className="h-3.5 w-3.5" />
          </button>
        </form>

        <div className="text-center pt-2 border-t border-slate-100">
          <Link href="/" className="text-xs text-indigo-600 font-semibold hover:underline">
            ← Return to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
