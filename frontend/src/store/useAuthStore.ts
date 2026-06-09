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
  login: (token: string, refreshToken: string, id: number, email: string, name: string, role: string) => void;
  logout: () => void;
  initialize: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  refreshToken: null,
  user: null,
  isAuthenticated: false,
  login: (token, refreshToken, id, email, name, role) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('zest_token', token);
      localStorage.setItem('zest_refresh_token', refreshToken);
      localStorage.setItem('zest_user', JSON.stringify({ id, email, name, role }));
    }
    set({ token, refreshToken, user: { id, email, name, role }, isAuthenticated: true });
  },
  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('zest_token');
      localStorage.removeItem('zest_refresh_token');
      localStorage.removeItem('zest_user');
    }
    set({ token: null, refreshToken: null, user: null, isAuthenticated: false });
  },
  initialize: () => {
    if (typeof window === 'undefined') return;
    const token = localStorage.getItem('zest_token');
    const refreshToken = localStorage.getItem('zest_refresh_token');
    const userStr = localStorage.getItem('zest_user');
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        set({ token, refreshToken, user, isAuthenticated: true });
      } catch (e) {
        localStorage.removeItem('zest_token');
        localStorage.removeItem('zest_refresh_token');
        localStorage.removeItem('zest_user');
      }
    }
  }
}));
