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

    // Initialize Theme (default as per user system if no local storage preference exists)
    const savedTheme = localStorage.getItem('theme');
    const hasThemeKey = savedTheme !== null;
    
    if (hasThemeKey) {
      if (savedTheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    } else {
      // Default to system preference
      const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (systemPrefersDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }, []);

  return <>{children}</>;
}
