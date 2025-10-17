'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuthStore } from '@/lib/stores/authStore';
import LoginForm from '@/components/auth/LoginForm';
import RegisterForm from '@/components/auth/RegisterForm';
import { TreePine } from 'lucide-react';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const { user, checkAuth } = useAuthStore();
  const router = useRouter();

  // 只在客户端执行一次检查
  useEffect(() => {
    if (typeof window !== 'undefined') {
      checkAuth();
    }
  }, [checkAuth]);

  const handleSuccess = async () => {
    // 延迟重定向，确保cookie设置完成并重新检查认证状态
    setTimeout(async () => {
      await checkAuth(); // 重新检查认证状态
      router.replace('/tree');
    }, 200);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <TreePine className="w-16 h-16 mx-auto mb-4 text-green-600" />
          <h1 className="text-3xl font-bold text-gray-800">智者</h1>
          <p className="text-gray-600">且行且思，智慧成长</p>
        </div>

        <motion.div
          key={isLogin ? 'login' : 'register'}
          initial={{ opacity: 0, x: isLogin ? -20 : 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          {isLogin ? (
            <LoginForm 
              onSuccess={handleSuccess}
              onSwitch={() => setIsLogin(false)}
            />
          ) : (
            <RegisterForm 
              onSuccess={handleSuccess}
              onSwitch={() => setIsLogin(true)}
            />
          )}
        </motion.div>
      </motion.div>
    </div>
  );
}