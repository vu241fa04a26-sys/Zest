'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ShoppingCart, Menu, X, Sun, Moon, LogOut, LayoutDashboard, ClipboardList } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { useCartStore } from '@/store/useCartStore';
import { useUIStore } from '@/store/useUIStore';

export const ZestLogo = () => (
  <svg viewBox="0 0 200 80" className="h-10 w-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Burst behind text */}
    <path 
      d="M70 20 L82 8 L87 23 L105 12 L98 32 L118 28 L104 42 L122 48 L102 52 L107 68 L92 58 L87 72 L80 54 L65 65 L70 48 L50 45 L70 38 Z" 
      fill="#FFD200" 
      stroke="#111" 
      strokeWidth="2.5" 
      strokeLinejoin="round"
    />
    {/* "Zest" text */}
    <text 
      x="35" 
      y="55" 
      fill="#F26E21" 
      fontSize="42" 
      fontWeight="900" 
      fontFamily="'Impact', 'Arial Black', sans-serif" 
      stroke="#111" 
      strokeWidth="2" 
      letterSpacing="1"
    >
      Zest
    </text>
  </svg>
);

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, isAuthenticated } = useAuthStore();
  const cartBadgeCount = useCartStore((state) => state.items.reduce((count, item) => count + item.quantity, 0));
  const { toggleCart } = useUIStore();
  
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');

  // Sync theme state with DOM
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isDark = document.documentElement.classList.contains('dark');
      Promise.resolve().then(() => {
        setTheme(isDark ? 'dark' : 'light');
      });
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    if (nextTheme === 'dark') {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/');
    setIsMobileMenuOpen(false);
  };

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'About', href: '/#about' },
    { name: 'Menu', href: '/dashboard' },
    { name: 'Contact', href: '/#contact' },
  ];

  return (
    <nav className="sticky top-0 z-40 w-full transition-all duration-300 border-b border-card-border bg-nav-bg backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="flex items-center">
              <ZestLogo />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className={`text-sm font-semibold transition-colors duration-200 hover:text-brand-orange ${
                  pathname === link.href ? 'text-brand-orange' : 'text-foreground/80'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Actions Block */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-full hover:bg-foreground/5 transition-all text-foreground/80"
              aria-label="Toggle Theme"
            >
              {theme === 'dark' ? <Sun size={20} className="text-brand-yellow" /> : <Moon size={20} />}
            </button>

            {/* Shopping Cart (hidden for Admin) */}
            {(isAuthenticated && user?.role !== 'admin') && (
              <button
                onClick={toggleCart}
                className="relative p-2.5 rounded-full hover:bg-foreground/5 transition-all text-foreground/80"
                aria-label="Open Cart"
              >
                <ShoppingCart size={20} />
                {cartBadgeCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-brand-orange text-[10px] font-bold text-white ring-2 ring-background animate-bounce">
                    {cartBadgeCount}
                  </span>
                )}
              </button>
            )}

            {/* Authentication Action / User Menu */}
            {isAuthenticated && user ? (
              <div className="flex items-center space-x-3 pl-2 border-l border-card-border">
                <div className="flex flex-col text-right">
                  <span className="text-xs font-semibold text-foreground">{user.name}</span>
                  <span className="text-[10px] text-text-muted capitalize">{user.role}</span>
                </div>
                
                {user.role === 'admin' ? (
                  <Link
                    href="/admin"
                    className="p-2.5 rounded-full bg-brand-orange/10 text-brand-orange hover:bg-brand-orange/20 transition-all"
                    title="Admin Dashboard"
                  >
                    <LayoutDashboard size={18} />
                  </Link>
                ) : (
                  <Link
                    href="/orders"
                    className="p-2.5 rounded-full bg-foreground/5 text-foreground hover:bg-foreground/10 transition-all"
                    title="Track Orders"
                  >
                    <ClipboardList size={18} />
                  </Link>
                )}

                <button
                  onClick={handleLogout}
                  className="p-2.5 rounded-full text-error hover:bg-error/10 transition-all"
                  title="Logout"
                >
                  <LogOut size={18} />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3 pl-2 border-l border-card-border">
                <Link
                  href="/auth/signin"
                  className="px-4 py-2 text-sm font-semibold text-foreground hover:text-brand-orange transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/signup"
                  className="px-4 py-2 text-sm font-semibold bg-brand-orange text-white rounded-xl shadow-lg hover:bg-brand-orange-hover hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden space-x-2">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-foreground/5 transition-all text-foreground/80"
            >
              {theme === 'dark' ? <Sun size={18} className="text-brand-yellow" /> : <Moon size={18} />}
            </button>

            {/* Shopping Cart */}
            {(isAuthenticated && user?.role !== 'admin') && (
              <button
                onClick={toggleCart}
                className="relative p-2 rounded-full hover:bg-foreground/5 transition-all text-foreground/80"
              >
                <ShoppingCart size={18} />
                {cartBadgeCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-brand-orange text-[9px] font-bold text-white ring-2 ring-background">
                    {cartBadgeCount}
                  </span>
                )}
              </button>
            )}

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-full hover:bg-foreground/5 transition-all text-foreground/80"
              aria-label="Toggle Menu"
            >
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden glass-panel border-t border-card-border py-4 px-6 space-y-4 shadow-xl">
          <div className="flex flex-col space-y-3">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`text-base font-semibold py-1 transition-colors hover:text-brand-orange ${
                  pathname === link.href ? 'text-brand-orange' : 'text-foreground/80'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          <div className="pt-4 border-t border-card-border flex flex-col space-y-3">
            {isAuthenticated && user ? (
              <>
                <div className="flex items-center space-x-3 mb-2">
                  <div className="h-9 w-9 rounded-full bg-brand-orange text-white flex items-center justify-center font-bold">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{user.name}</p>
                    <p className="text-xs text-text-muted capitalize">{user.role}</p>
                  </div>
                </div>

                {user.role === 'admin' ? (
                  <Link
                    href="/admin"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center space-x-2 py-2 text-sm font-semibold text-brand-orange hover:text-brand-orange-hover"
                  >
                    <LayoutDashboard size={18} />
                    <span>Admin Dashboard</span>
                  </Link>
                ) : (
                  <Link
                    href="/orders"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center space-x-2 py-2 text-sm font-semibold text-foreground hover:text-brand-orange"
                  >
                    <ClipboardList size={18} />
                    <span>My Orders</span>
                  </Link>
                )}

                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 py-2 text-sm font-semibold text-error hover:text-red-500"
                >
                  <LogOut size={18} />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <div className="flex flex-col space-y-2">
                <Link
                  href="/auth/signin"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 text-sm font-semibold text-foreground border border-card-border rounded-xl hover:bg-foreground/5 transition-all"
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/signup"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 text-sm font-semibold bg-brand-orange text-white rounded-xl hover:bg-brand-orange-hover shadow-md transition-all"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
