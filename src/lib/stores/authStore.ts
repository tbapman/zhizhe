import { create } from 'zustand';
import { User } from '@/types';

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  
  // 登录注册
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  loading: false,
  error: null,
  
  login: async (email: string, password: string) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'include',
      });
      
      if (response.status === 401) {
        set({ user: null, token: null, loading: false });
        throw new Error('需要重新登录');
      }
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || '登录失败');
      }
      
      const data = await response.json();
      set({ user: data.data.user, token: data.data.token, loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },
  
  register: async (name: string, email: string, password: string) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
        credentials: 'include',
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || '注册失败');
      }
      
      const data = await response.json();
      set({ user: data.data.user, token: data.data.token, loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },
  
  logout: async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      set({ user: null, token: null });
    }
  },
  
  checkAuth: async () => {
    set({ loading: true });
    try {
      const response = await fetch('/api/auth/me', {
        credentials: 'include',
      });
      
      if (response.status === 401) {
        // 401未授权，清除状态
        set({ user: null, token: null, loading: false });
        return;
      }
      
      if (response.ok) {
        const data = await response.json();
        set({ user: data.data.user, loading: false });
      } else {
        set({ user: null, loading: false });
      }
    } catch (error) {
      set({ user: null, loading: false });
    }
  },
  
  clearError: () => set({ error: null }),
}));