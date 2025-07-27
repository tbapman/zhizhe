'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, Edit, Trash2, Target, CheckSquare, Square } from 'lucide-react';
import { usePlanStore } from '@/lib/stores/planStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import PlanDialog from './PlanDialog';

interface PlanListProps {
  selectedDate?: string;
}

interface Goal {
  _id: string;
  title: string;
}

export default function PlanList({ selectedDate }: PlanListProps) {
  const { plans, loading, fetchPlans, updatePlan, deletePlan, completePlan } = usePlanStore();
  const [editingPlan, setEditingPlan] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [goalsLoading, setGoalsLoading] = useState(false);

  useEffect(() => {
    fetchPlans(selectedDate);
    fetchGoals();
  }, [fetchPlans, selectedDate]);

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

  const handleEdit = (plan: any) => {
    setEditingPlan(plan);
    setIsDialogOpen(true);
  };

  const handleAdd = () => {
    setEditingPlan(null);
    setIsDialogOpen(true);
  };

  const handleSubmit = async (planData: any) => {
    if (editingPlan) {
      await updatePlan(editingPlan._id, planData);
    } else {
      await usePlanStore.getState().addPlan({
        ...planData,
        date: selectedDate ? new Date(selectedDate) : new Date(),
      });
    }
    setIsDialogOpen(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm('确定要删除这个计划吗？')) {
      await deletePlan(id);
    }
  };

  const handleComplete = async (id: string) => {
    await completePlan(id);
  };

  const toggleSubtask = async (planId: string, subtaskIndex: number) => {
    const plan = plans.find(p => p._id === planId);
    if (!plan || !plan.subtasks) return;

    const updatedSubtasks = [...plan.subtasks];
    updatedSubtasks[subtaskIndex] = {
      ...updatedSubtasks[subtaskIndex],
      completed: !updatedSubtasks[subtaskIndex].completed
    };

    // 检查是否所有子任务都已完成
    const allSubtasksCompleted = updatedSubtasks.every(subtask => subtask.completed);
    
    const updates: any = { subtasks: updatedSubtasks };
    
    // 如果所有子任务都完成且当前任务未完成，则自动标记为完成
    if (allSubtasksCompleted && !plan.completed) {
      updates.completed = true;
      updates.completedAt = new Date();
    }
    
    // 如果有子任务未完成且当前任务已完成，则自动标记为未完成
    if (!allSubtasksCompleted && plan.completed) {
      updates.completed = false;
      updates.completedAt = null;
    }

    await updatePlan(planId, updates);
  };

  const filteredPlans = selectedDate 
    ? plans.filter(plan => {
        const planDate = new Date(plan.date).toISOString().split('T')[0];
        return planDate === selectedDate;
      })
    : plans;

  const completedCount = filteredPlans.filter(p => p.completed).length;
  const totalCount = filteredPlans.length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">今日计划</h2>
          <p className="text-sm text-gray-500">
            {completedCount}/{totalCount} 已完成
          </p>
        </div>
        <Button onClick={handleAdd} size="sm">
          添加计划
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
        </div>
      ) : filteredPlans.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="w-12 h-12 mx-auto mb-4 text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
              </svg>
            </div>
            <p className="text-gray-500 mb-4">
              {selectedDate ? '该日期暂无计划' : '今天还没有计划'}
            </p>
            <Button onClick={handleAdd}>
              创建第一个计划
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {filteredPlans.map((plan) => (
              <motion.div
                key={plan._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
              >
                <Card className={`${plan.completed ? 'bg-green-50 border-green-200' : ''}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <p className={`font-medium ${plan.completed ? 'line-through text-gray-500' : ''}`}>
                            {plan.content}
                          </p>
                          {plan.goalId && (
                            <Badge variant="outline" className="text-xs">
                              <Target className="w-3 h-3 mr-1" />
                              {typeof plan.goalId === 'object' ? plan.goalId.title : 
                               typeof plan.goalId === 'string' ? plan.goalId : 
                               '关联目标'}
                            </Badge>
                          )}
                        </div>
                        
                        {plan.subtasks && plan.subtasks.length > 0 && (
                          <div className="mt-3 space-y-1">
                            {plan.subtasks.map((subtask, subIndex) => (
                              <div 
                                key={subIndex} 
                                className={`flex items-center gap-2 text-sm cursor-pointer hover:bg-gray-50 p-1 rounded transition-colors ${
                                  subtask.completed ? 'bg-green-50 border border-green-200' : ''
                                }`}
                                onClick={() => toggleSubtask(plan._id, subIndex)}
                              >
                                {subtask.completed ? (
                                  <CheckSquare className="w-3 h-3 text-green-600" />
                                ) : (
                                  <Square className="w-3 h-3 text-gray-400" />
                                )}
                                <span className={subtask.completed ? 'line-through text-gray-500' : 'text-gray-600'}>
                                  {subtask.content}
                                </span>
                              </div>
                            ))}
                            
                            {plan.subtasks.every(subtask => subtask.completed) && !plan.completed && (
                              <div className="text-xs text-green-600 font-medium mt-2">
                                ✨ 所有子任务完成，任务将自动标记为完成
                              </div>
                            )}
                            
                            {plan.completed && plan.subtasks.some(subtask => !subtask.completed) && (
                              <div className="text-xs text-orange-600 font-medium mt-2">
                                ⚠️ 有子任务未完成，任务将自动取消完成状态
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-1 ml-4">
                        {!plan.completed && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-green-600 hover:text-green-700"
                            onClick={() => handleComplete(plan._id)}
                          >
                            <Check className="w-4 h-4" />
                          </Button>
                        )}
                        
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-blue-600 hover:text-blue-700"
                          onClick={() => handleEdit(plan)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-red-600 hover:text-red-700"
                          onClick={() => handleDelete(plan._id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      <PlanDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSubmit={handleSubmit}
        plan={editingPlan}
      />
    </div>
  );
}