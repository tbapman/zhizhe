'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Calendar, Target, Plus, Trash2, CheckSquare, Square } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import { Plan, Goal, Subtask } from '@/types';

interface PlanDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (plan: any) => void;
  plan?: Plan;
}

export default function PlanDialog({
  isOpen,
  onClose,
  onSubmit,
  plan
}: PlanDialogProps) {
  const [content, setContent] = useState('');
  const [quantity, setQuantity] = useState(0);
  const [selectedGoal, setSelectedGoal] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [completed, setCompleted] = useState(false);
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const [newSubtaskContent, setNewSubtaskContent] = useState('');
  const [goals, setGoals] = useState<Goal[]>([]);
  const [goalsLoading, setGoalsLoading] = useState(false);

  useEffect(() => {
    if (plan) {
      setContent(plan.content);
      setQuantity(plan.quantity || 0);
      // Handle goalId which can be string or object
      const goalId = typeof plan.goalId === 'object' && plan.goalId ? plan.goalId._id : plan.goalId || '';
      setSelectedGoal(goalId);
      setSelectedDate(new Date(plan.date).toISOString().split('T')[0]);
      setCompleted(plan.completed);
      setSubtasks(plan.subtasks || []);
    } else {
      resetForm();
    }
    fetchGoals();
  }, [plan]);

  const fetchGoals = async () => {
    setGoalsLoading(true);
    try {
      const response = await fetch('/api/goals', {
        method: 'GET',
        credentials: 'include',
      });
      
      if (response.ok) {
        const data = await response.json();
        setGoals(data.data?.goals || []);
      } else {
        console.error('Failed to fetch goals');
        setGoals([]);
      }
    } catch (error) {
      console.error('Error fetching goals:', error);
      setGoals([]);
    } finally {
      setGoalsLoading(false);
    }
  };

  const resetForm = () => {
    setContent('');
    setQuantity(0);
    setSelectedGoal('');
    setSelectedDate(new Date().toISOString().split('T')[0]);
    setCompleted(false);
    setSubtasks([]);
    setNewSubtaskContent('');
  };

  const handleAddSubtask = () => {
    if (newSubtaskContent.trim()) {
      setSubtasks([...subtasks, { content: newSubtaskContent.trim(), quantity: 0, completed: false }]);
      setNewSubtaskContent('');
    }
  };

  const handleToggleSubtask = (index: number) => {
    const updatedSubtasks = [...subtasks];
    updatedSubtasks[index].completed = !updatedSubtasks[index].completed;
    setSubtasks(updatedSubtasks);
  };

  const handleRemoveSubtask = (index: number) => {
    setSubtasks(subtasks.filter((_, i) => i !== index));
  };

  const handleSubtaskContentChange = (index: number, content: string) => {
    const updatedSubtasks = [...subtasks];
    updatedSubtasks[index].content = content;
    setSubtasks(updatedSubtasks);
  };

  const handleSubtaskQuantityChange = (index: number, quantity: number) => {
    const updatedSubtasks = [...subtasks];
    updatedSubtasks[index].quantity = Math.max(0, quantity);
    setSubtasks(updatedSubtasks);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const planData = {
      content,
      quantity,
      goalId: selectedGoal && selectedGoal !== "none" ? selectedGoal : undefined,
      date: new Date(selectedDate),
      completed,
      subtasks,
    };

    onSubmit(planData);
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-lg w-full max-w-md mx-auto max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b flex-shrink-0">
          <h2 className="text-lg font-semibold">
            {plan ? '编辑计划' : '添加新计划'}
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <div className="p-4 space-y-4 overflow-y-auto flex-1">
          <div>
            <Label htmlFor="content">计划内容</Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="请输入计划内容..."
              required
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="quantity">数量/频次/组数</Label>
            <Input
              id="quantity"
              type="number"
              min="0"
              value={quantity}
              onChange={(e) => setQuantity(Math.max(0, parseInt(e.target.value) || 0))}
              placeholder="0"
            />
          </div>

          <div>
            <Label htmlFor="goal">关联目标</Label>
            <Select value={selectedGoal || "none"} onValueChange={(value) => setSelectedGoal(value === "none" ? "" : value)}>
              <SelectTrigger>
                <SelectValue placeholder={goalsLoading ? "加载中..." : "选择关联目标（可选）"} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">无关联目标</SelectItem>
                {goals.length === 0 && !goalsLoading && (
                  <SelectItem value="no-goals" disabled>
                    暂无目标
                  </SelectItem>
                )}
                {goals.map((goal) => (
                  <SelectItem key={goal._id} value={goal._id}>
                    {goal.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="date">计划日期</Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                id="date"
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="pl-10"
                required
              />
            </div>
          </div>

          <div>
            <Label>子任务</Label>
            <div className="space-y-2">
              {subtasks.map((subtask, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="p-1 h-6 w-6"
                    onClick={() => handleToggleSubtask(index)}
                  >
                    {subtask.completed ? (
                      <CheckSquare className="w-4 h-4 text-green-600" />
                    ) : (
                      <Square className="w-4 h-4 text-gray-400" />
                    )}
                  </Button>
                  <Input
                    value={subtask.content}
                    onChange={(e) => handleSubtaskContentChange(index, e.target.value)}
                    placeholder="子任务内容"
                    className="flex-1 text-sm"
                  />
                  <Input
                    type="number"
                    min="0"
                    value={subtask.quantity}
                    onChange={(e) => handleSubtaskQuantityChange(index, parseInt(e.target.value) || 0)}
                    placeholder="数量"
                    className="w-16 text-sm"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="p-1 h-6 w-6 text-red-600 hover:text-red-700"
                    onClick={() => handleRemoveSubtask(index)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              <div className="flex items-center gap-2">
                <Input
                  value={newSubtaskContent}
                  onChange={(e) => setNewSubtaskContent(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddSubtask();
                    }
                  }}
                  placeholder="添加子任务..."
                  className="flex-1 text-sm"
                />
                <Button
                  type="button"
                  size="sm"
                  onClick={handleAddSubtask}
                  disabled={!newSubtaskContent.trim()}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="completed"
              checked={completed}
              onCheckedChange={setCompleted}
            />
            <Label htmlFor="completed">标记为已完成</Label>
          </div>
          </div>

          <div className="flex gap-2 p-4 border-t flex-shrink-0">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={onClose}
            >
              取消
            </Button>
            <Button type="submit" className="flex-1">
              {plan ? '更新' : '添加'}
            </Button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}