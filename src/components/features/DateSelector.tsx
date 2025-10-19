'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface DateSelectorProps {
  selectedDate: string;
  onDateChange: (date: string) => void;
  minDate?: string;
  maxDate?: string;
}

export default function DateSelector({ 
  selectedDate, 
  onDateChange,
  minDate,
  maxDate 
}: DateSelectorProps) {
  // 日期解析和验证
  const parseDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return isNaN(date.getTime()) ? new Date() : date;
  };

  const [currentMonth, setCurrentMonth] = useState(() => {
    const date = parseDate(selectedDate);
    return new Date(date.getFullYear(), date.getMonth(), 1);
  });

  // 当 selectedDate 改变时同步 currentMonth
  useEffect(() => {
    const date = parseDate(selectedDate);
    setCurrentMonth(new Date(date.getFullYear(), date.getMonth(), 1));
  }, [selectedDate]);

  const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days = [];
    
    // 添加空白天数以对齐星期几
    const startDayOfWeek = firstDay.getDay();
    for (let i = 0; i < startDayOfWeek; i++) {
      days.push(null);
    }
    
    // 添加当月的所有天数
    for (let day = 1; day <= lastDay.getDate(); day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const handlePreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const handleDateSelect = (date: Date) => {
    if (isDateDisabled(date)) return;
    onDateChange(formatDate(date));
  };

  // 改进的日期比较
  const isSameDay = (date1: Date, date2: Date) => {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
  };

  const isToday = (date: Date) => {
    return isSameDay(date, new Date());
  };

  const isSelected = (date: Date) => {
    return isSameDay(date, parseDate(selectedDate));
  };

  // 日期禁用逻辑
  const isDateDisabled = (date: Date) => {
    const dateStr = formatDate(date);
    if (minDate && dateStr < minDate) return true;
    if (maxDate && dateStr > maxDate) return true;
    return false;
  };

  const days = getDaysInMonth(currentMonth);
  const weekdays = ['日', '一', '二', '三', '四', '五', '六'];

  return (
    <div className="bg-white rounded-lg shadow-sm border p-4">
      <div className="flex items-center justify-between mb-4">
        <Button
          size="sm"
          variant="ghost"
          onClick={handlePreviousMonth}
          aria-label="上个月"
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>
        
        <h3 className="text-sm font-medium">
          {currentMonth.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long' })}
        </h3>
        
        <Button
          size="sm"
          variant="ghost"
          onClick={handleNextMonth}
          aria-label="下个月"
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {weekdays.map((day) => (
          <div 
            key={day} 
            className="text-center text-xs font-medium text-gray-500 py-1"
          >
            {day}
          </div>
        ))}
        
        {days.map((date, index) => (
          date ? (
            <button
              key={date.toISOString()}
              onClick={() => handleDateSelect(date)}
              disabled={isDateDisabled(date)}
              aria-label={formatDate(date)}
              aria-current={isSelected(date) ? 'date' : undefined}
              className={cn(
                'text-center py-2 text-sm rounded-lg transition-colors',
                'focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-1',
                isSelected(date) && 'bg-green-500 text-white font-medium',
                isToday(date) && !isSelected(date) && 'bg-green-100 text-green-700 font-medium',
                !isSelected(date) && !isToday(date) && !isDateDisabled(date) && 'hover:bg-gray-100',
                isDateDisabled(date) && 'text-gray-300 cursor-not-allowed hover:bg-transparent'
              )}
            >
              {date.getDate()}
            </button>
          ) : (
            <div key={`empty-${index}`} className="text-center py-2 text-sm" />
          )
        ))}
      </div>
    </div>
  );
}