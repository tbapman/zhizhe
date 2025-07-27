import DailyPlanCard from '@/components/features/DailyPlanCard';

export default function PlanPage() {
  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">每日计划</h1>
      <DailyPlanCard />
    </div>
  );
}