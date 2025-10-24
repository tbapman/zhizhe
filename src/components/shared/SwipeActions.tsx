'use client';

import { useState, useRef, useEffect, ReactNode } from 'react';
import { motion, PanInfo, useMotionValue, useTransform } from 'framer-motion';

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
  threshold?: number; // 触发滑动的最小距离
  disabled?: boolean;
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
  threshold = 80,
  disabled = false 
}: SwipeActionsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  
  // 计算操作按钮的总宽度
  const actionsWidth = actions.length * 80; // 每个按钮80px宽度
  
  // 根据滑动距离计算透明度
  const opacity = useTransform(x, [-actionsWidth, -threshold, 0], [1, 0.7, 0]);
  
  // 处理拖拽开始
  const handleDragStart = () => {
    if (disabled) return;
    setIsDragging(true);
  };

  // 处理拖拽结束
  const handleDragEnd = (event: any, info: PanInfo) => {
    if (disabled) return;
    
    setIsDragging(false);
    const shouldOpen = info.offset.x < -threshold;
    
    if (shouldOpen && !isOpen) {
      setIsOpen(true);
      x.set(-actionsWidth);
    } else if (!shouldOpen && isOpen) {
      setIsOpen(false);
      x.set(0);
    } else if (isOpen) {
      x.set(-actionsWidth);
    } else {
      x.set(0);
    }
  };

  // 处理操作按钮点击
  const handleActionClick = (action: SwipeAction) => {
    if (action.disabled) return; // 如果按钮被禁用，不执行任何操作
    action.onClick();
    // 点击后关闭滑动面板
    setIsOpen(false);
    x.set(0);
  };

  // 点击外部区域关闭
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        if (isOpen) {
          setIsOpen(false);
          x.set(0);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, x]);

  // 阻止滑动时的点击事件冒泡
  const handleContentClick = (e: React.MouseEvent) => {
    if (isDragging) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  return (
    <div 
      ref={containerRef}
      className="relative overflow-hidden bg-white rounded-lg"
      style={{ touchAction: disabled ? 'auto' : 'pan-y' }}
    >
      {/* 操作按钮背景层 */}
      <motion.div 
        className="absolute inset-y-0 right-0 flex"
        style={{ 
          width: actionsWidth,
          opacity: isOpen ? 1 : opacity 
        }}
      >
        {actions.map((action, index) => (
          <motion.button
            key={action.id}
            className={`
              w-20 h-full flex flex-col items-center justify-center gap-1.5 text-xs font-semibold
              transition-all duration-200 hover:brightness-110 active:scale-95 relative
              ${action.disabled
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed opacity-60'
                : colorClasses[action.color]
              }
            `}
            onClick={() => handleActionClick(action)}
            initial={{ x: 20 }}
            animate={{ x: 0 }}
            transition={{ delay: index * 0.05 }}
            whileHover={action.disabled ? {} : { scale: 1.05 }}
            whileTap={action.disabled ? {} : { scale: 0.95 }}
            disabled={action.disabled}
          >
            <div className={`w-5 h-5 flex items-center justify-center ${action.disabled ? 'opacity-50' : ''}`}>
              {action.icon}
            </div>
            <span className={`text-center leading-tight ${action.disabled ? 'opacity-70' : ''}`}>{action.label}</span>
          </motion.button>
        ))}
      </motion.div>

      {/* 主内容层 */}
      <motion.div
        className="relative z-10 bg-white"
        style={{ x }}
        drag={disabled ? false : "x"}
        dragConstraints={{ left: -actionsWidth, right: 0 }}
        dragElastic={0.1}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onClick={handleContentClick}
        whileDrag={{ 
          cursor: 'grabbing',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)' 
        }}
      >
        {children}
      </motion.div>

      {/* 滑动提示指示器 - 优化设计 */}
      {!disabled && !isOpen && (
        <motion.div
          className="absolute right-3 top-1/2 transform -translate-y-1/2"
          initial={{ opacity: 0 }}
          animate={{ opacity: isDragging ? 0 : 0.4 }}
          transition={{ duration: 0.2 }}
        >
          <div className="flex flex-col items-center gap-0.5">
            <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
            <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
            <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
