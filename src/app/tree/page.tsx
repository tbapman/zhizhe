import GoalTree from '@/components/features/GoalTree';
import UserMenu from '@/components/layout/UserMenu';

export default function TreePage() {
  return (
    <div className="p-4 min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">技能目标树</h1>
        <UserMenu />
      </div>
      <GoalTree />
    </div>
  );
}