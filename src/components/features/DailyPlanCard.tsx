'use client';

import { useState, useEffect } from 'react';
import { usePlanStore } from '@/lib/stores/planStore';
import PlanList from './PlanList';
import DateSelector from './DateSelector';
import PlanDialog from './PlanDialog';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export default function DailyPlanCard() {
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [isDialogOpen, setIsDialogOpen] = useState(false);


  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">每日计划</h2>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          添加计划
        </Button>
      </div>

      <DateSelector
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
      />

      <PlanList
        selectedDate={selectedDate}
      />

      <PlanDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSubmit={(planData) => {
          usePlanStore.getState().addPlan({
            ...planData,
            date: new Date(selectedDate),
          });
          setIsDialogOpen(false);
        }}
        plan={null}
      />
    </div>
  );
}