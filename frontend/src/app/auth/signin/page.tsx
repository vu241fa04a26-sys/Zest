'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Lock, Mail, ArrowRight, Eye, EyeOff, UtensilsCrossed } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';

function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const login = useAuthStore((state) => state.login);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (searchParams.get('registered') === 'true') {
      setSuccess('Account created successfully! Please sign in below.');
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    if (!email || !password) {
      setError('Please fill in all fields.');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:8000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Incorrect email or password.');
      }

      // Save credentials in Zustand store and local storage
      login(
        data.access_token,
        data.refresh_token,
        data.id,
        data.email,
        data.name,
        data.role
      );

      // Routing rules: admins go to /admin, users go to dashboard
      const redirectTo = searchParams.get('redirect');
      if (data.role === 'admin') {
        router.push('/admin');
      } else if (redirectTo === 'checkout') {
        router.push('/dashboard');
        // trigger drawer open by setting store if necessary
      } else {
        router.push('/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during authentication.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-zinc-950">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-brand-orange/10 rounded-full blur-[100px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-md w-full space-y-8 relative z-10"
      >
        <div className="text-center space-y-3">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-orange/10 text-brand-orange border border-brand-orange/20 shadow-lg shadow-brand-orange/5">
            <UtensilsCrossed size={22} />
          </div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight">Welcome back</h2>
          <p className="text-sm text-zinc-400">
            Sign in to access your college canteen ordering dashboard
          </p>
        </div>

        {/* Form panel */}
        <div className="glass-panel border border-white/5 bg-zinc-900/40 rounded-3xl p-8 shadow-2xl space-y-6">
          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 text-sm rounded-xl">
              {error}
            </div>
          )}

          {success && (
            <div className="p-4 bg-green-500/10 border border-green-500/20 text-green-500 text-sm rounded-xl">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Input */}
            <div className="relative group">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder=" "
                className="peer w-full bg-zinc-950 border border-card-border focus:border-brand-orange rounded-xl px-11 py-3.5 text-sm text-white focus:outline-none transition-all placeholder-transparent"
              />
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 peer-focus:text-brand-orange transition-colors">
                <Mail size={16} />
              </span>
              <label className="absolute left-11 top-1/2 -translate-y-1/2 text-sm text-zinc-500 pointer-events-none transition-all peer-placeholder-shown:top-1/2 peer-placeholder-shown:text-sm peer-focus:top-2 peer-focus:text-xs peer-focus:text-brand-orange peer-[:not(:placeholder-shown)]:top-2 peer-[:not(:placeholder-shown)]:text-xs">
                College Email Address
              </label>
            </div>

            {/* Password Input */}
            <div className="relative group">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder=" "
                className="peer w-full bg-zinc-950 border border-card-border focus:border-brand-orange rounded-xl px-11 py-3.5 text-sm text-white focus:outline-none transition-all placeholder-transparent"
              />
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 peer-focus:text-brand-orange transition-colors">
                <Lock size={16} />
              </span>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
              <label className="absolute left-11 top-1/2 -translate-y-1/2 text-sm text-zinc-500 pointer-events-none transition-all peer-placeholder-shown:top-1/2 peer-placeholder-shown:text-sm peer-focus:top-2 peer-focus:text-xs peer-focus:text-brand-orange peer-[:not(:placeholder-shown)]:top-2 peer-[:not(:placeholder-shown)]:text-xs">
                Password
              </label>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center space-x-2 text-xs text-zinc-400 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="accent-brand-orange rounded border-zinc-700 bg-zinc-950 focus:ring-0 focus:ring-offset-0 h-4 w-4"
                />
                <span>Remember me</span>
              </label>
              <Link href="/auth/forgot-password" className="text-xs font-semibold text-brand-orange hover:underline">
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-brand-orange hover:bg-brand-orange-hover text-white font-bold rounded-xl flex items-center justify-center space-x-2 shadow-lg shadow-brand-orange/20 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none"
            >
              {loading ? (
                <span className="border-2 border-white border-t-transparent animate-spin rounded-full h-5 w-5" />
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-xs text-zinc-500">
            Don't have an account yet?{' '}
            <Link href="/auth/signup" className="font-semibold text-brand-orange hover:underline">
              Create an account
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={
      <div className="flex-1 flex items-center justify-center bg-zinc-950 min-h-screen">
        <div className="border-2 border-brand-orange border-t-transparent animate-spin rounded-full h-8 w-8" />
      </div>
    }>
      <SignInForm />
    </Suspense>
  );
}
