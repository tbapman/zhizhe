'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Plus, TreePine } from 'lucide-react';
import AppleAnimation from './AppleAnimation';

interface Goal {
  id: string;
  title: string;
  stage: 'flower' | 'apple' | 'root';
  status: 'active' | 'completed' | 'archived';
  achievementValue: number;
}

const mockGoals: Goal[] = [
  { id: '1', title: '游泳', stage: 'apple', status: 'active', achievementValue: 85 },
  { id: '2', title: '编程', stage: 'flower', status: 'active', achievementValue: 45 },
  { id: '3', title: 'CET-6', stage: 'root', status: 'completed', achievementValue: 100 },
];

export default function GoalTree() {
  const [goals, setGoals] = useState<Goal[]>(mockGoals);
  const [fallingApples, setFallingApples] = useState<Set<string>>(new Set());

  const handleAppleFall = (goalId: string) => {
    setFallingApples(prev => new Set(prev).add(goalId));
    
    setTimeout(() => {
      setGoals(prev => prev.map(goal => 
        goal.id === goalId 
          ? { ...goal, stage: 'root', status: 'completed' }
          : goal
      ));
      setFallingApples(prev => {
        const next = new Set(prev);
        next.delete(goalId);
        return next;
      });
    }, 1500);
  };

  const getPositionStyle = (index: number, total: number) => {
    const angle = (index / total) * 2 * Math.PI;
    const radius = 80;
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius - 50;
    
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
            key={goal.id}
            className="absolute top-1/2 left-1/2"
            style={getPositionStyle(index, goals.length)}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: index * 0.2, duration: 0.5 }}
          >
            <div className="flex flex-col items-center space-y-1">
              <div className={`w-12 h-12 ${getStageColor(goal.stage)} rounded-full flex items-center justify-center text-white text-sm font-bold shadow-lg`}>
                {goal.stage === 'apple' && (
                  <AppleAnimation 
                    isFalling={fallingApples.has(goal.id)}
                    onFallComplete={() => console.log(`Apple ${goal.id} fell`)}
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
                  onClick={() => handleAppleFall(goal.id)}
                >
                  完成
                </Button>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      <div className="w-full">
        <Button className="w-full" size="lg">
          <Plus className="w-4 h-4 mr-2" />
          添加新目标
        </Button>
      </div>

      <div className="w-full space-y-2">
        <h3 className="font-semibold">当前目标</h3>
        {goals.filter(g => g.status === 'active').map(goal => (
          <div key={goal.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <TreePine className="w-5 h-5 text-green-500" />
              <div>
                <p className="font-medium">{goal.title}</p>
                <p className="text-sm text-gray-500">{getStageText(goal.stage)} - {goal.achievementValue}%完成</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}