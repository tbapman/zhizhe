'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/lib/stores/authStore';

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const { checkAuth } = useAuthStore();

  useEffect(() => {
    // 只在客户端执行一次认证检查
    if (typeof window !== 'undefined') {
      checkAuth();
    }
  }, [checkAuth]);

  return <>{children}</>;
}