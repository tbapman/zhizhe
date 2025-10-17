'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface DateSelectorProps {
  selectedDate: string;
  onDateChange: (date: string) => void;
}

export default function DateSelector({ selectedDate, onDateChange }: DateSelectorProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date(selectedDate));

  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days = [];
    
    // 添加空白天数以对齐星期几
    // getDay() 返回 0-6，0是星期天
    const startDayOfWeek = firstDay.getDay();
    for (let i = 0; i < startDayOfWeek; i++) {
      days.push(null); // 用 null 表示空白天
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
    onDateChange(formatDate(date));
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isSelected = (date: Date) => {
    return date.toISOString().split('T')[0] === selectedDate;
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
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {weekdays.map((day) => (
          <div key={day} className="text-center text-xs font-medium text-gray-500 py-1"
          >
            {day}
          </div>
        ))}
        
        {days.map((date, index) => (
          date ? (
            <button
              key={date.toISOString()}
              onClick={() => handleDateSelect(date)}
              className={cn(
                'text-center py-2 text-sm rounded-lg transition-colors',
                isSelected(date) && 'bg-green-500 text-white',
                isToday(date) && !isSelected(date) && 'bg-green-100 text-green-700',
                !isSelected(date) && !isToday(date) && 'hover:bg-gray-100'
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