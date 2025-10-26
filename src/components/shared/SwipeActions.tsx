'use client';

import { useState, useRef, useEffect, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

interface SwipeAction {
  id: string;
  label: string;
  icon: ReactNode;
  color: 'red' | 'blue' | 'green' | 'orange' | 'gray';
  onClick: () => void;
  disabled?: boolean;
}

interface SwipeActionsProps {
  children: ReactNode;
  actions: SwipeAction[];
  disabled?: boolean;
  isOpen?: boolean;
  onToggle?: (isOpen: boolean) => void;
}

const colorClasses = {
  red: 'bg-gradient-to-br from-red-500 to-red-600 text-white',
  blue: 'bg-gradient-to-br from-blue-500 to-blue-600 text-white',
  green: 'bg-gradient-to-br from-green-500 to-green-600 text-white',
  orange: 'bg-gradient-to-br from-orange-500 to-orange-600 text-white',
  gray: 'bg-gradient-to-br from-gray-500 to-gray-600 text-white'
};

export default function SwipeActions({
  children,
  actions,
  disabled = false,
  isOpen: externalIsOpen,
  onToggle
}: SwipeActionsProps) {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // 使用外部控制的 isOpen 状态，如果没有则使用内部状态
  const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;
  const setIsOpen = onToggle || setInternalIsOpen;


  // 处理操作按钮点击
  const handleActionClick = async (action: SwipeAction, e: React.MouseEvent) => {
    e.stopPropagation();
    if (action.disabled) return;

    // 立即关闭操作面板
    setIsOpen(false);

    // 执行操作
    try {
      await action.onClick();
    } catch (error) {
      console.error('Action execution failed:', error);
    }
  };

  // 点击外部区域关闭
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        if (isOpen) {
          setIsOpen(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  return (
    <div
      ref={containerRef}
      className="relative overflow-visible"
    >
      {/* 主内容区域 */}
      <div className="relative">
        {children}
      </div>

      {/* 操作按钮面板 */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 z-[9999] overflow-hidden"
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex">
              {actions.map((action, index) => (
                <motion.button
                  key={action.id}
                  className={`
                    flex-1 h-12 flex flex-col items-center justify-center gap-1 text-xs font-semibold
                    transition-all duration-200 hover:brightness-110 active:scale-95 relative
                    ${action.disabled
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed opacity-60'
                      : colorClasses[action.color]
                    }
                  `}
                  onClick={(e) => handleActionClick(action, e)}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={action.disabled ? {} : { scale: 1.02 }}
                  whileTap={action.disabled ? {} : { scale: 0.98 }}
                  disabled={action.disabled}
                >
                  <div className={`w-4 h-4 flex items-center justify-center ${action.disabled ? 'opacity-50' : ''}`}>
                    {action.icon}
                  </div>
                  <span className={`text-center leading-tight ${action.disabled ? 'opacity-70' : ''}`}>{action.label}</span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}