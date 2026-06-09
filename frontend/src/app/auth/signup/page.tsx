'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { User, Mail, Phone, Lock, ArrowRight, Eye, EyeOff, UtensilsCrossed } from 'lucide-react';

export default function SignUpPage() {
  const router = useRouter();
  
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Frontend validations
    if (!fullName || !email || !phoneNumber || !password || !confirmPassword) {
      setError('Please fill in all fields.');
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      setLoading(false);
      return;
    }

    // Optional email check, verify email is valid format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address.');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:8000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          full_name: fullName,
          phone: phoneNumber,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Registration failed. Try again.');
      }

      // Successful registration
      router.push('/auth/signin?registered=true');
    } catch (err: any) {
      setError(err.message || 'An error occurred during registration.');
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
          <h2 className="text-3xl font-extrabold text-white tracking-tight">Create Account</h2>
          <p className="text-sm text-zinc-400">
            Sign up to start ordering fresh meals from ZEST Canteen
          </p>
        </div>

        {/* Card panel */}
        <div className="glass-panel border border-white/5 bg-zinc-900/40 rounded-3xl p-8 shadow-2xl space-y-6">
          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 text-sm rounded-xl">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Full Name */}
            <div className="relative group">
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder=" "
                className="peer w-full bg-zinc-950 border border-card-border focus:border-brand-orange rounded-xl px-11 py-3.5 text-sm text-white focus:outline-none transition-all placeholder-transparent"
              />
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 peer-focus:text-brand-orange transition-colors">
                <User size={16} />
              </span>
              <label className="absolute left-11 top-1/2 -translate-y-1/2 text-sm text-zinc-500 pointer-events-none transition-all peer-placeholder-shown:top-1/2 peer-placeholder-shown:text-sm peer-focus:top-2 peer-focus:text-xs peer-focus:text-brand-orange peer-[:not(:placeholder-shown)]:top-2 peer-[:not(:placeholder-shown)]:text-xs">
                Full Name
              </label>
            </div>

            {/* Email Address */}
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

            {/* Phone Number */}
            <div className="relative group">
              <input
                type="tel"
                required
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder=" "
                className="peer w-full bg-zinc-950 border border-card-border focus:border-brand-orange rounded-xl px-11 py-3.5 text-sm text-white focus:outline-none transition-all placeholder-transparent"
              />
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 peer-focus:text-brand-orange transition-colors">
                <Phone size={16} />
              </span>
              <label className="absolute left-11 top-1/2 -translate-y-1/2 text-sm text-zinc-500 pointer-events-none transition-all peer-placeholder-shown:top-1/2 peer-placeholder-shown:text-sm peer-focus:top-2 peer-focus:text-xs peer-focus:text-brand-orange peer-[:not(:placeholder-shown)]:top-2 peer-[:not(:placeholder-shown)]:text-xs">
                Phone Number
              </label>
            </div>

            {/* Password */}
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

            {/* Confirm Password */}
            <div className="relative group">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder=" "
                className="peer w-full bg-zinc-950 border border-card-border focus:border-brand-orange rounded-xl px-11 py-3.5 text-sm text-white focus:outline-none transition-all placeholder-transparent"
              />
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 peer-focus:text-brand-orange transition-colors">
                <Lock size={16} />
              </span>
              <label className="absolute left-11 top-1/2 -translate-y-1/2 text-sm text-zinc-500 pointer-events-none transition-all peer-placeholder-shown:top-1/2 peer-placeholder-shown:text-sm peer-focus:top-2 peer-focus:text-xs peer-focus:text-brand-orange peer-[:not(:placeholder-shown)]:top-2 peer-[:not(:placeholder-shown)]:text-xs">
                Confirm Password
              </label>
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
                  <span>Create Account</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-xs text-zinc-500">
            Already have an account?{' '}
            <Link href="/auth/signin" className="font-semibold text-brand-orange hover:underline">
              Sign In
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
