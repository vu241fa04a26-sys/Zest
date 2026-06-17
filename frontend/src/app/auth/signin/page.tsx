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
        throw new Error(data.detail || 'Incorrect email/phone or password.');
      }

      login(
        data.access_token,
        data.refresh_token,
        data.id,
        data.email,
        data.name,
        data.role,
        rememberMe
      );

      const redirectTo = searchParams.get('redirect');
      if (data.role === 'admin') {
        router.push('/admin');
      } else if (redirectTo === 'checkout') {
        router.push('/dashboard');
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
    <div className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-zinc-950 min-h-screen">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-brand-orange/10 rounded-full blur-[100px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-md w-full space-y-6 relative z-10"
      >
        <div className="border border-zinc-800 bg-zinc-900/60 rounded-3xl p-10 shadow-2xl space-y-8 backdrop-blur-md">
          {/* Logo and Header */}
          <div className="text-center space-y-4">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-orange/10 text-brand-orange border border-brand-orange/20 shadow-lg">
              <UtensilsCrossed size={22} />
            </div>
            <h2 className="text-2xl font-black text-white tracking-tight">Sign in</h2>
            <p className="text-sm text-zinc-400">Use your Zest College Canteen account</p>
          </div>

          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 text-xs rounded-xl">
              {error}
            </div>
          )}

          {success && (
            <div className="p-4 bg-green-500/10 border border-green-500/20 text-green-500 text-xs rounded-xl">
              {success}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Unified Email or Phone Input */}
            <div className="relative group">
              <input
                type="text"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder=" "
                className="peer w-full bg-zinc-950 border border-zinc-800 focus:border-brand-orange rounded-xl px-11 py-3.5 text-sm text-white focus:outline-none transition-all placeholder-transparent"
              />
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 peer-focus:text-brand-orange transition-colors">
                <Mail size={16} />
              </span>
              <label className="absolute left-11 top-1/2 -translate-y-1/2 text-xs text-zinc-500 pointer-events-none transition-all peer-placeholder-shown:top-1/2 peer-placeholder-shown:text-sm peer-focus:top-2.5 peer-focus:text-[10px] peer-focus:text-brand-orange peer-[:not(:placeholder-shown)]:top-2.5 peer-[:not(:placeholder-shown)]:text-[10px]">
                Email Address or Phone Number
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
                className="peer w-full bg-zinc-950 border border-zinc-800 focus:border-brand-orange rounded-xl px-11 py-3.5 text-sm text-white focus:outline-none transition-all placeholder-transparent"
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
              <label className="absolute left-11 top-1/2 -translate-y-1/2 text-xs text-zinc-500 pointer-events-none transition-all peer-placeholder-shown:top-1/2 peer-placeholder-shown:text-sm peer-focus:top-2.5 peer-focus:text-[10px] peer-focus:text-brand-orange peer-[:not(:placeholder-shown)]:top-2.5 peer-[:not(:placeholder-shown)]:text-[10px]">
                Password
              </label>
            </div>

            {/* Remember Me and Forgot Password */}
            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center space-x-2 text-zinc-400 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="accent-brand-orange rounded border-zinc-800 bg-zinc-950 focus:ring-0 focus:ring-offset-0 h-4 w-4"
                />
                <span>Remember me</span>
              </label>
              <Link href="/auth/forgot-password" className="font-bold text-brand-orange hover:underline">
                Forgot password?
              </Link>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-brand-orange hover:bg-brand-orange-hover text-white font-bold rounded-xl flex items-center justify-center space-x-2 shadow-lg shadow-brand-orange/20 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
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
            </div>
          </form>

          <p className="text-center text-xs text-zinc-500">
            Don't have an account yet?{' '}
            <Link href="/auth/signup" className="font-bold text-brand-orange hover:underline">
              Create Zest account
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
