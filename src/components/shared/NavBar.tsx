'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  Trophy, 
  TreePine, 
  Users, 
  User 
} from 'lucide-react';

const navItems = [
  {
    href: '/plan',
    icon: Calendar,
    label: '计划',
  },
  {
    href: '/achievements',
    icon: Trophy,
    label: '成就',
  },
  {
    href: '/tree',
    icon: TreePine,
    label: '目标树',
    center: true,
  },
  {
    href: '/groups',
    icon: Users,
    label: '小组',
  },
  {
    href: '/me',
    icon: User,
    label: '我的',
  },
];

export default function NavBar() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 max-w-[375px] mx-auto bg-white border-t border-gray-200 px-4 py-2">
      <div className="flex items-center justify-around relative">
        {navItems.map((item, index) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          if (item.center) {
            return (
              <div key={item.href} className="relative">
                <Link href={item.href} className="flex flex-col items-center">
                  <motion.div
                    className="relative"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
                      <div className="w-14 h-14 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
                        <Icon className="w-7 h-7 text-white" />
                      </div>
                    </div>
                  </motion.div>
                  <span className="text-xs mt-1 text-gray-600 mt-8">{item.label}</span>
                </Link>
              </div>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center py-2"
            >
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Icon
                  className={`w-6 h-6 mb-1 ${
                    isActive ? 'text-green-500' : 'text-gray-400'
                  }`}
                />
              </motion.div>
              <span
                className={`text-xs ${
                  isActive ? 'text-green-500 font-medium' : 'text-gray-600'
                }`}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}