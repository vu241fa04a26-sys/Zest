import { create } from 'zustand';

interface User {
  id: number;
  email: string;
  name: string;
  role: string;
}

interface AuthState {
  token: string | null;
  refreshToken: string | null;
  user: User | null;
  isAuthenticated: boolean;
  login: (token: string, refreshToken: string, id: number, email: string, name: string, role: string, rememberMe?: boolean) => void;
  logout: () => void;
  initialize: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  refreshToken: null,
  user: null,
  isAuthenticated: false,
  login: (token, refreshToken, id, email, name, role, rememberMe = false) => {
    if (typeof window !== 'undefined') {
      const storage = rememberMe ? localStorage : sessionStorage;
      
      // Clear from the other storage to prevent sync issues
      const otherStorage = rememberMe ? sessionStorage : localStorage;
      otherStorage.removeItem('zest_token');
      otherStorage.removeItem('zest_refresh_token');
      otherStorage.removeItem('zest_user');

      storage.setItem('zest_token', token);
      storage.setItem('zest_refresh_token', refreshToken);
      storage.setItem('zest_user', JSON.stringify({ id, email, name, role }));
    }
    set({ token, refreshToken, user: { id, email, name, role }, isAuthenticated: true });
  },
  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('zest_token');
      localStorage.removeItem('zest_refresh_token');
      localStorage.removeItem('zest_user');
      sessionStorage.removeItem('zest_token');
      sessionStorage.removeItem('zest_refresh_token');
      sessionStorage.removeItem('zest_user');
    }
    set({ token: null, refreshToken: null, user: null, isAuthenticated: false });
  },
  initialize: () => {
    if (typeof window === 'undefined') return;
    
    // Check localStorage first, then sessionStorage
    let token = localStorage.getItem('zest_token');
    let refreshToken = localStorage.getItem('zest_refresh_token');
    let userStr = localStorage.getItem('zest_user');
    
    if (!token) {
      token = sessionStorage.getItem('zest_token');
      refreshToken = sessionStorage.getItem('zest_refresh_token');
      userStr = sessionStorage.getItem('zest_user');
    }
    
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        set({ token, refreshToken, user, isAuthenticated: true });
      } catch (e) {
        localStorage.removeItem('zest_token');
        localStorage.removeItem('zest_refresh_token');
        localStorage.removeItem('zest_user');
        sessionStorage.removeItem('zest_token');
        sessionStorage.removeItem('zest_refresh_token');
        sessionStorage.removeItem('zest_user');
      }
    }
  }
}));
