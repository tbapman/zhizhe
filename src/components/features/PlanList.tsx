'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, Edit, Trash2, Target, CheckSquare, Square, Plus, Minus, MoreVertical, ChevronRight, ChevronDown } from 'lucide-react';
import { usePlanStore } from '@/lib/stores/planStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import PlanDialog from './PlanDialog';
import SwipeActions from '@/components/shared/SwipeActions';

interface PlanListProps {
  selectedDate?: string;
}

interface Goal {
  _id: string;
  title: string;
}

export default function PlanList({ selectedDate }: PlanListProps) {
  const { plans, loading, fetchPlans, updatePlan, updatePlanSilently, deletePlan, completePlan } = usePlanStore();
  const [editingPlan, setEditingPlan] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [goalsLoading, setGoalsLoading] = useState(false);
  const [expandedSubtasks, setExpandedSubtasks] = useState<Set<string>>(new Set());

  // 防抖定时器
  const updateTimers = useRef<{ [key: string]: NodeJS.Timeout }>({});

  useEffect(() => {
    console.log('selectedDate', selectedDate);
    fetchPlans(selectedDate);
    fetchGoals();
    
    // 清理函数：组件卸载时清除所有定时器
    return () => {
      Object.values(updateTimers.current).forEach(timer => clearTimeout(timer));
      updateTimers.current = {};
    };
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

  const deleteSubtask = async (planId: string, subtaskIndex: number) => {
    const plan = plans.find(p => p._id === planId);
    if (!plan || !plan.subtasks) return;

    if (confirm('确定要删除这个子任务吗？')) {
      const updatedSubtasks = plan.subtasks.filter((_, index) => index !== subtaskIndex);
      await updatePlan(planId, { subtasks: updatedSubtasks });
    }
  };

  const updateSubtaskQuantity = (planId: string, subtaskIndex: number, change: number) => {
    const plan = plans.find(p => p._id === planId);
    if (!plan || !plan.subtasks) return;

    const originalSubtasks = [...plan.subtasks];
    const updatedSubtasks = [...plan.subtasks];
    updatedSubtasks[subtaskIndex] = {
      ...updatedSubtasks[subtaskIndex],
      quantity: Math.max(0, (updatedSubtasks[subtaskIndex].quantity || 0) + change)
    };

    // 乐观更新：立即更新本地状态
    usePlanStore.setState((state) => ({
      plans: state.plans.map(p => 
        p._id === planId ? { ...p, subtasks: updatedSubtasks } : p
      )
    }));

    // 清除之前的定时器
    const timerKey = `${planId}-${subtaskIndex}`;
    if (updateTimers.current[timerKey]) {
      clearTimeout(updateTimers.current[timerKey]);
    }

    // 防抖：500ms后才真正发送请求
    updateTimers.current[timerKey] = setTimeout(async () => {
      try {
        await updatePlanSilently(planId, { subtasks: updatedSubtasks });
      } catch (error) {
        console.error('Failed to update subtask quantity:', error);
        // 如果失败，恢复原值并重新获取最新数据
        usePlanStore.setState((state) => ({
          plans: state.plans.map(p => 
            p._id === planId ? { ...p, subtasks: originalSubtasks } : p
          )
        }));
        // 重新获取数据以确保数据一致性
        fetchPlans(selectedDate);
      }
      delete updateTimers.current[timerKey];
    }, 500);
  };

  const filteredPlans = selectedDate 
    ? plans.filter(plan => {
        const planDate = new Date(plan.date).toISOString().split('T')[0];
        return planDate === selectedDate;
      })
    : plans;

  const completedCount = filteredPlans.filter(p => p.completed).length;
  const totalCount = filteredPlans.length;

  // 检查计划是否有子任务
  const hasSubtasks = (plan: any) => plan.subtasks && plan.subtasks.length > 0;

  // 移除子任务展开逻辑，现在只在滑动时显示数量控制按钮

  return (
    <div className="space-y-4 sm:space-y-6 px-4 sm:px-6 py-4 sm:py-6">
      <div className="flex items-center justify-between mb-4 sm:mb-6 flex-col sm:flex-row gap-4 sm:gap-0">
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-xl flex items-center justify-center shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">今日计划</h2>
            <p className="text-sm text-gray-600 font-medium">
              {completedCount}/{totalCount} 已完成
            </p>
          </div>
        </div>
        <motion.button
          onClick={handleAdd}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-200 hover:from-green-600 hover:to-green-700"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Plus className="w-4 h-4" />
          添加计划
        </motion.button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <motion.div
            className="flex flex-col items-center gap-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
            <p className="text-gray-600 font-medium">正在加载计划...</p>
          </motion.div>
        </div>
      ) : filteredPlans.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="p-12 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="space-y-6"
            >
              <div className="w-16 h-16 mx-auto mb-6 text-gray-300">
                <div className="w-full h-full rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center shadow-inner">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                  </svg>
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-gray-700">
                  {selectedDate ? '该日期暂无计划' : '今天还没有计划'}
                </h3>
                <p className="text-gray-500 text-sm">
                  开始制定你的第一个计划，让每一天都充实有意义
                </p>
              </div>
              <motion.button
                onClick={handleAdd}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-200 hover:from-green-600 hover:to-green-700"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Plus className="w-4 h-4" />
                创建第一个计划
              </motion.button>
            </motion.div>
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
                <Card className={`${plan.completed ? 'bg-green-50 border-green-200' : ''} transition-all duration-200 hover:shadow-sm sm:hover:shadow-md relative overflow-hidden`}>
                  {/* 滑动操作可用时的视觉指示 */}
                  {hasSubtasks(plan) && (
                    <motion.div
                      className="absolute right-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-400 to-blue-500 opacity-0"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: hasSubtasks(plan) ? 0.3 : 0 }}
                      transition={{ duration: 0.3 }}
                    />
                  )}
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      {/* 左侧完成状态按钮 - 优化为圆形勾选 */}
                      <div className="flex-shrink-0 mt-0.5">
                        {!plan.completed ? (
                          <button
                            className="w-6 h-6 rounded-full border-2 border-gray-300 hover:border-green-500 hover:bg-green-50 transition-all duration-200 flex items-center justify-center group"
                            onClick={() => handleComplete(plan._id)}
                          >
                            <Check className="w-4 h-4 text-green-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </button>
                        ) : (
                          <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                            <Check className="w-4 h-4 text-white" />
                          </div>
                        )}
                      </div>

                      {/* 主内容区 */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex-1 min-w-0">
                            <p className={`font-medium leading-tight text-base sm:text-lg ${plan.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                              {plan.content}
                            </p>
                            {plan.goalId && (
                              <Badge variant="outline" className="text-xs mt-1.5 border-blue-200 text-blue-700 bg-blue-50">
                                <Target className="w-3 h-3 mr-1" />
                                {typeof plan.goalId === 'object' ? plan.goalId.title :
                                 typeof plan.goalId === 'string' ? plan.goalId :
                                 '关联目标'}
                              </Badge>
                            )}
                          </div>

                          {/* 右侧操作菜单 - 移到内容区上方 */}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button
                                className="flex-shrink-0 w-8 h-8 rounded-full hover:bg-gray-100 transition-colors duration-200 flex items-center justify-center text-gray-400 hover:text-gray-600"
                              >
                                <MoreVertical className="w-4 h-4" />
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-36 shadow-lg">
                              <DropdownMenuItem
                                onClick={() => handleEdit(plan)}
                                className="cursor-pointer hover:bg-gray-50"
                              >
                                <Edit className="w-4 h-4 mr-2 text-gray-600" />
                                编辑
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDelete(plan._id)}
                                className="cursor-pointer text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                删除
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                          
                          
                          {/* 子任务列表 - 优化布局和交互 */}
                          {hasSubtasks(plan) && (
                            <div className="mt-4 space-y-2">
                              {/* 滑动提示 - 只在有子任务时显示 */}
                              <motion.div
                                className="flex items-center gap-2 text-xs text-gray-500 mb-3 px-1"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.5 }}
                              >
                                <ChevronRight className="w-3 h-3" />
                                <span>左右滑动调整数量或标记完成</span>
                              </motion.div>
                              {plan.subtasks.map((subtask, subIndex) => (
                                <SwipeActions
                                  key={subIndex}
                                  actions={[
                                    {
                                      id: 'toggle',
                                      label: subtask.completed ? '取消' : '完成',
                                      icon: subtask.completed ? <X className="w-4 h-4" /> : <Check className="w-4 h-4" />,
                                      color: subtask.completed ? 'gray' : 'green',
                                      onClick: () => toggleSubtask(plan._id, subIndex)
                                    },
                                    {
                                      id: 'minus',
                                      label: '减少',
                                      icon: <Minus className="w-4 h-4" />,
                                      color: 'blue',
                                      onClick: () => {
                                        updateSubtaskQuantity(plan._id, subIndex, -1);
                                      },
                                      disabled: subtask.completed || (subtask.quantity || 0) <= 0
                                    },
                                    {
                                      id: 'plus',
                                      label: '增加',
                                      icon: <Plus className="w-4 h-4" />,
                                      color: 'blue',
                                      onClick: () => {
                                        updateSubtaskQuantity(plan._id, subIndex, 1);
                                      },
                                      disabled: subtask.completed
                                    },
                                    {
                                      id: 'delete',
                                      label: '删除',
                                      icon: <Trash2 className="w-4 h-4" />,
                                      color: 'red',
                                      onClick: () => deleteSubtask(plan._id, subIndex)
                                    }
                                  ]}
                                  disabled={loading || subtask.completed}
                                  threshold={60}
                                >
                                  <div
                                    className={`flex items-center gap-3 text-sm p-3 sm:p-4 rounded-lg transition-all duration-200 ${
                                      subtask.completed
                                        ? 'bg-green-50 border border-green-200'
                                        : 'bg-gray-50 hover:bg-gray-100 border border-transparent hover:border-gray-200'
                                    }`}
                                  >
                                    {/* 左侧勾选区域 */}
                                    <div
                                      className="flex-shrink-0 cursor-pointer"
                                      onClick={() => toggleSubtask(plan._id, subIndex)}
                                    >
                                      {subtask.completed ? (
                                        <div className="w-5 h-5 rounded bg-green-500 flex items-center justify-center">
                                          <Check className="w-3 h-3 text-white" />
                                        </div>
                                      ) : (
                                        <div className="w-5 h-5 rounded border-2 border-gray-300 hover:border-green-500 transition-colors" />
                                      )}
                                    </div>

                                    {/* 中间内容区 */}
                                    <div className="flex-1 min-w-0">
                                      <span className={`block ${subtask.completed ? 'line-through text-gray-500' : 'text-gray-700'} font-medium`}>
                                        {subtask.content}
                                      </span>
                                    </div>

                                    {/* 右侧数量指示器 - 优化视觉设计 */}
                                    <div className="flex items-center gap-2 shrink-0">
                                      <motion.div
                                        className={`h-8 px-3 py-0 text-sm font-bold rounded-full flex items-center gap-1 transition-all duration-200 shadow-sm ${
                                          (subtask.quantity || 0) > 0
                                            ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white border-2 border-blue-200 shadow-blue-100'
                                            : 'bg-white text-gray-400 border-2 border-gray-200'
                                        } ${subtask.completed ? 'opacity-40' : ''}`}
                                        whileHover={subtask.completed ? {} : { scale: 1.05 }}
                                        whileTap={subtask.completed ? {} : { scale: 0.95 }}
                                      >
                                        <span className="min-w-[1.2rem] text-center">{subtask.quantity || 0}</span>
                                        {(subtask.quantity || 0) > 0 && (
                                          <div className="w-1 h-1 bg-white bg-opacity-60 rounded-full"></div>
                                        )}
                                      </motion.div>
                                      <motion.div
                                        className="text-gray-400 text-xs ml-1"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 0.2 }}
                                      >
                                        <ChevronRight className="w-3 h-3" />
                                      </motion.div>
                                    </div>
                                  </div>
                                </SwipeActions>
                              ))}

                              {/* 状态提示 - 优化视觉设计 */}
                              {plan.subtasks.every(subtask => subtask.completed) && !plan.completed && (
                                <motion.div
                                  className="text-sm text-green-700 font-medium mt-3 flex items-center gap-2 p-2 bg-green-50 rounded-lg border border-green-200"
                                  initial={{ opacity: 0, y: -10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ duration: 0.3 }}
                                >
                                  <span className="text-lg">✨</span>
                                  <span>所有子任务已完成，主任务将自动标记为完成</span>
                                </motion.div>
                              )}

                              {plan.completed && plan.subtasks.some(subtask => !subtask.completed) && (
                                <motion.div
                                  className="text-sm text-orange-700 font-medium mt-3 flex items-center gap-2 p-2 bg-orange-50 rounded-lg border border-orange-200"
                                  initial={{ opacity: 0, y: -10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ duration: 0.3 }}
                                >
                                  <span className="text-lg">⚠️</span>
                                  <span>有子任务未完成，主任务完成状态已取消</span>
                                </motion.div>
                              )}
                            </div>
                          )}
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