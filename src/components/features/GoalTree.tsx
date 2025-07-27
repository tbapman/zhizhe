'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Plus, TreePine, Trash2, Edit3 } from 'lucide-react';
import AppleAnimation from './AppleAnimation';

interface Goal {
  _id: string;
  title: string;
  stage: 'flower' | 'apple' | 'root';
  status: 'active' | 'completed' | 'archived';
  achievementValue: number;
  position: {
    x: number;
    y: number;
  };
  createdAt: string;
  updatedAt: string;
}

export default function GoalTree() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [fallingApples, setFallingApples] = useState<Set<string>>(new Set());
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [editingGoal, setEditingGoal] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');

  // 获取所有目标
  const fetchGoals = async () => {
    try {
      const response = await fetch('/api/tree', {
        method: 'GET',
        credentials: 'include',
      });
      
      if (response.ok) {
        const data = await response.json();
        setGoals(data.data);
      } else {
        console.error('Failed to fetch goals');
      }
    } catch (error) {
      console.error('Error fetching goals:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  // 创建新目标
  const createGoal = async (title: string) => {
    try {
      const response = await fetch('/api/tree', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          title,
          stage: 'flower',
          achievementValue: 0,
          position: {
            x: Math.cos(Math.random() * Math.PI * 2) * 80,
            y: Math.sin(Math.random() * Math.PI * 2) * 80 - 50
          }
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setGoals(prev => [...prev, data.data]);
        setNewTitle('');
        setShowAddForm(false);
      }
    } catch (error) {
      console.error('Error creating goal:', error);
    }
  };

  // 更新目标
  const updateGoal = async (id: string, updates: Partial<Goal>) => {
    try {
      const response = await fetch(`/api/tree/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(updates),
      });

      if (response.ok) {
        const data = await response.json();
        setGoals(prev => prev.map(goal => goal._id === id ? data.data : goal));
        return data.data;
      }
    } catch (error) {
      console.error('Error updating goal:', error);
    }
  };

  // 删除目标
  const deleteGoal = async (id: string) => {
    try {
      const response = await fetch(`/api/tree/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (response.ok) {
        setGoals(prev => prev.filter(goal => goal._id !== id));
      }
    } catch (error) {
      console.error('Error deleting goal:', error);
    }
  };

  // 处理苹果掉落
  const handleAppleFall = async (goalId: string) => {
    setFallingApples(prev => new Set(prev).add(goalId));
    
    setTimeout(async () => {
      await updateGoal(goalId, { 
        stage: 'root', 
        status: 'completed', 
        achievementValue: 100 
      });
      
      setFallingApples(prev => {
        const next = new Set(prev);
        next.delete(goalId);
        return next;
      });
    }, 1500);
  };

  // 处理添加目标
  const handleAddGoal = () => {
    if (newTitle.trim()) {
      createGoal(newTitle.trim());
    }
  };

  // 处理编辑目标
  const handleEditGoal = (goal: Goal) => {
    setEditingGoal(goal._id);
    setEditTitle(goal.title);
  };

  const handleSaveEdit = async (id: string) => {
    await updateGoal(id, { title: editTitle });
    setEditingGoal(null);
    setEditTitle('');
  };

  const getPositionStyle = (goal: Goal) => {
    // Add fallback for undefined position
    const { x = 0, y = 0 } = goal.position || {};
    return {
      transform: `translate(${x}px, ${y}px)`,
    };
  };

  const getStageColor = (stage: string) => {
    switch (stage) {
      case 'flower': return 'bg-pink-300';
      case 'apple': return 'bg-red-500';
      case 'root': return 'bg-amber-700';
      default: return 'bg-gray-400';
    }
  };

  const getStageText = (stage: string) => {
    switch (stage) {
      case 'flower': return '花蕾';
      case 'apple': return '苹果';
      case 'root': return '根茎';
      default: return '';
    }
  };

  return (
    <div className="flex flex-col items-center space-y-6">
      <div className="relative w-full h-96 bg-gradient-to-b from-sky-200 to-green-100 rounded-lg overflow-hidden">
        {/* 树干 */}
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-16 h-32 bg-amber-800 rounded-t-lg" />
        
        {/* 树冠 */}
        <div className="absolute top-12 left-1/2 transform -translate-x-1/2 w-48 h-48 bg-green-500 rounded-full opacity-80" />
        <div className="absolute top-8 left-1/4 w-32 h-32 bg-green-400 rounded-full opacity-70" />
        <div className="absolute top-8 right-1/4 w-32 h-32 bg-green-400 rounded-full opacity-70" />

        {/* 目标果实 */}
        {goals.map((goal, index) => (
          <motion.div
            key={goal._id} // Fix: use _id instead of id
            className="absolute top-1/2 left-1/2"
            style={getPositionStyle(goal)} // Fix: pass goal object instead of index
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: index * 0.2, duration: 0.5 }}
          >
            <div className="flex flex-col items-center space-y-1">
              <div className={`w-12 h-12 ${getStageColor(goal.stage)} rounded-full flex items-center justify-center text-white text-sm font-bold shadow-lg`}>
                {goal.stage === 'apple' && (
                  <AppleAnimation 
                    isFalling={fallingApples.has(goal._id)} // Fix: use _id
                    onFallComplete={() => console.log(`Apple ${goal._id} fell`)} // Fix: use _id
                  />
                )}
                {goal.stage !== 'apple' && goal.stage.charAt(0).toUpperCase()}
              </div>
              <span className="text-xs font-medium text-gray-700">{goal.title}</span>
              <span className="text-xs text-gray-500">{getStageText(goal.stage)}</span>
              
              {goal.stage === 'apple' && goal.status === 'active' && (
                <Button
                  size="sm"
                  variant="outline"
                  className="text-xs px-2 py-1"
                  onClick={() => handleAppleFall(goal._id)} // Fix: use _id
                >
                  完成
                </Button>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* 添加目标表单 */}
      {showAddForm && (
        <div className="w-full space-y-2">
          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="输入目标名称"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            onKeyPress={(e) => e.key === 'Enter' && handleAddGoal()}
          />
          <div className="flex space-x-2">
            <Button className="flex-1" size="sm" onClick={handleAddGoal}>
              确认添加
            </Button>
            <Button variant="outline" size="sm" onClick={() => {
              setShowAddForm(false);
              setNewTitle('');
            }}>
              取消
            </Button>
          </div>
        </div>
      )}

      <div className="w-full">
        {!showAddForm && (
          <Button className="w-full" size="lg" onClick={() => setShowAddForm(true)}>
            <Plus className="w-4 h-4 mr-2" />
            添加新目标
          </Button>
        )}
      </div>

      {loading && (
        <div className="flex justify-center items-center h-64">
          <div className="text-gray-500">加载中...</div>
        </div>
      )}

      <div className="w-full space-y-2">
        <h3 className="font-semibold">当前目标 ({goals.filter(g => g.status === 'active').length})</h3>
        {goals.filter(g => g.status === 'active').map(goal => (
          <div key={goal._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3 flex-1">
              <TreePine className="w-5 h-5 text-green-500" />
              <div className="flex-1">
                {editingGoal === goal._id ? (
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSaveEdit(goal._id)}
                    onBlur={() => handleSaveEdit(goal._id)}
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                    autoFocus
                  />
                ) : (
                  <p className="font-medium">{goal.title}</p>
                )}
                <p className="text-sm text-gray-500">
                  {getStageText(goal.stage)} - {goal.achievementValue}%完成
                </p>
              </div>
            </div>
            <div className="flex space-x-1">
              <Button
                size="sm"
                variant="ghost"
                className="p-1 h-auto"
                onClick={() => handleEditGoal(goal)}
              >
                <Edit3 className="w-4 h-4 text-gray-500" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="p-1 h-auto"
                onClick={() => deleteGoal(goal._id)}
              >
                <Trash2 className="w-4 h-4 text-red-500" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}