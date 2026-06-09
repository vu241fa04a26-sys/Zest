'use client';

import React, { useEffect } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { useCartStore } from '@/store/useCartStore';

export default function ClientProviders({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Initialize Auth state from local storage
    useAuthStore.getState().initialize();
    
    // Initialize Cart state from local storage
    useCartStore.getState().initializeCart();

    // Initialize Theme (dark mode by default or matching local storage selection)
    const savedTheme = localStorage.getItem('theme');
    const hasThemeKey = savedTheme !== null;
    
    // Default to dark mode if no key exists, otherwise follow saved value
    if (savedTheme === 'dark' || (!hasThemeKey)) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  return <>{children}</>;
}
