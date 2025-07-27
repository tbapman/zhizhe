'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, Edit, Trash2, Calendar, Target } from 'lucide-react';
import { usePlanStore } from '@/lib/stores/planStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import PlanDialog from './PlanDialog';

interface PlanListProps {
  goals?: any[];
  selectedDate?: string;
}

export default function PlanList({ goals = [], selectedDate }: PlanListProps) {
  const { plans, loading, fetchPlans, updatePlan, deletePlan, completePlan } = usePlanStore();
  const [editingPlan, setEditingPlan] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    fetchPlans(selectedDate);
  }, [fetchPlans, selectedDate]);

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
            <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-400" />
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
                              {typeof plan.goalId === 'object' ? plan.goalId.title : '目标'}
                            </Badge>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(plan.date).toLocaleDateString()}
                          </span>
                          {plan.completed && plan.completedAt && (
                            <span>
                              完成于 {new Date(plan.completedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          )}
                        </div>
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
        goals={goals}
      />
    </div>
  );
}