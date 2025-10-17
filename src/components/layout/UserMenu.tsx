'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, LogOut, Settings } from 'lucide-react';
import { useAuthStore } from '@/lib/stores/authStore';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function UserMenu() {
  const { user, logout, loading } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
  };

  console.log('UserMenu: user state:', user, 'loading:', loading);

  if (loading) {
    return <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse" />;
  }

  if (!user) {
    console.log('UserMenu: No user found, returning null');
    return null;
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage src={`https://avatar.vercel.sh/${user.email}`} alt={user.name} />
            <AvatarFallback className="bg-gradient-to-br from-green-400 to-blue-500">
              {user.name?.charAt(0)?.toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <div className="flex items-center justify-start gap-2 p-2">
          <div className="flex flex-col space-y-1 leading-none">
            <p className="font-medium">{user.name}</p>
            <p className="w-[200px] truncate text-sm text-muted-foreground">
              {user.email}
            </p>
          </div>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="cursor-pointer">
          <Settings className="mr-2 h-4 w-4" />
          <span>设置</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          className="cursor-pointer text-red-600" 
          onSelect={handleLogout}
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>退出登录</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}