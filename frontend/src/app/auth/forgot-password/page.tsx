'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, KeyRound, Lock, Phone, ShieldCheck } from 'lucide-react';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [step, setStep] = useState<'phone' | 'verify'>('phone');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const requestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const response = await fetch('http://localhost:8000/api/auth/forgot-password/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || 'Could not send OTP.');
      setMessage('OTP sent. For this demo, check the backend terminal output.');
      setStep('verify');
    } catch (err: any) {
      setError(err.message || 'Could not send OTP.');
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters.');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:8000/api/auth/forgot-password/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, otp, new_password: newPassword }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || 'Could not update password.');
      setMessage('Password updated successfully. Redirecting to sign in...');
      setTimeout(() => router.push('/auth/signin'), 900);
    } catch (err: any) {
      setError(err.message || 'Could not update password.');
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
            <KeyRound size={22} />
          </div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight">Reset password</h2>
          <p className="text-sm text-zinc-400">
            Verify your registered phone number with OTP to update your password.
          </p>
        </div>

        <div className="glass-panel border border-white/5 bg-zinc-900/40 rounded-3xl p-8 shadow-2xl space-y-6">
          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 text-sm rounded-xl">
              {error}
            </div>
          )}

          {message && (
            <div className="p-4 bg-green-500/10 border border-green-500/20 text-green-500 text-sm rounded-xl">
              {message}
            </div>
          )}

          {step === 'phone' ? (
            <form onSubmit={requestOtp} className="space-y-6">
              <div className="relative group">
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder=" "
                  className="peer w-full bg-zinc-950 border border-card-border focus:border-brand-orange rounded-xl px-11 py-3.5 text-sm text-white focus:outline-none transition-all placeholder-transparent"
                />
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 peer-focus:text-brand-orange transition-colors">
                  <Phone size={16} />
                </span>
                <label className="absolute left-11 top-1/2 -translate-y-1/2 text-sm text-zinc-500 pointer-events-none transition-all peer-placeholder-shown:top-1/2 peer-placeholder-shown:text-sm peer-focus:top-2 peer-focus:text-xs peer-focus:text-brand-orange peer-[:not(:placeholder-shown)]:top-2 peer-[:not(:placeholder-shown)]:text-xs">
                  Registered Phone Number
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-brand-orange hover:bg-brand-orange-hover text-white font-bold rounded-xl flex items-center justify-center space-x-2 shadow-lg shadow-brand-orange/20 transition-all disabled:opacity-50"
              >
                <span>{loading ? 'Sending OTP...' : 'Send OTP'}</span>
                {!loading && <ArrowRight size={18} />}
              </button>
            </form>
          ) : (
            <form onSubmit={resetPassword} className="space-y-6">
              <div className="relative group">
                <input
                  type="text"
                  required
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder=" "
                  className="peer w-full bg-zinc-950 border border-card-border focus:border-brand-orange rounded-xl px-11 py-3.5 text-sm text-white focus:outline-none transition-all placeholder-transparent"
                />
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 peer-focus:text-brand-orange transition-colors">
                  <ShieldCheck size={16} />
                </span>
                <label className="absolute left-11 top-1/2 -translate-y-1/2 text-sm text-zinc-500 pointer-events-none transition-all peer-placeholder-shown:top-1/2 peer-placeholder-shown:text-sm peer-focus:top-2 peer-focus:text-xs peer-focus:text-brand-orange peer-[:not(:placeholder-shown)]:top-2 peer-[:not(:placeholder-shown)]:text-xs">
                  OTP
                </label>
              </div>

              <div className="relative group">
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder=" "
                  className="peer w-full bg-zinc-950 border border-card-border focus:border-brand-orange rounded-xl px-11 py-3.5 text-sm text-white focus:outline-none transition-all placeholder-transparent"
                />
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 peer-focus:text-brand-orange transition-colors">
                  <Lock size={16} />
                </span>
                <label className="absolute left-11 top-1/2 -translate-y-1/2 text-sm text-zinc-500 pointer-events-none transition-all peer-placeholder-shown:top-1/2 peer-placeholder-shown:text-sm peer-focus:top-2 peer-focus:text-xs peer-focus:text-brand-orange peer-[:not(:placeholder-shown)]:top-2 peer-[:not(:placeholder-shown)]:text-xs">
                  New Password
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-brand-orange hover:bg-brand-orange-hover text-white font-bold rounded-xl flex items-center justify-center space-x-2 shadow-lg shadow-brand-orange/20 transition-all disabled:opacity-50"
              >
                <span>{loading ? 'Updating...' : 'Update Password'}</span>
                {!loading && <ArrowRight size={18} />}
              </button>
            </form>
          )}

          <Link href="/auth/signin" className="flex items-center justify-center space-x-2 text-xs font-semibold text-zinc-400 hover:text-brand-orange transition-colors">
            <ArrowLeft size={14} />
            <span>Back to sign in</span>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
