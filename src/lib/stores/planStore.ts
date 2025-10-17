import { create } from 'zustand';
import { Plan } from '@/types';

interface PlanStore {
  plans: Plan[];
  loading: boolean;
  error: string | null;
  
  // CRUD操作
  fetchPlans: (date?: string) => Promise<void>;
  addPlan: (plan: Omit<Plan, '_id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updatePlan: (id: string, updates: Partial<Plan>) => Promise<void>;
  updatePlanSilently: (id: string, updates: Partial<Plan>) => Promise<void>;
  deletePlan: (id: string) => Promise<void>;
  completePlan: (id: string) => Promise<void>;
}

export const usePlanStore = create<PlanStore>((set) => ({
  plans: [],
  loading: false,
  error: null,
  
  fetchPlans: async (date?: string) => {
    set({ loading: true, error: null });
    try {
      const params = new URLSearchParams();
      if (date) params.append('date', date);
      
      const response = await fetch(`/api/plans?${params}`);
      if (!response.ok) throw new Error('Failed to fetch plans');
      
      const result = await response.json();
      if (result.success) {
        set({ plans: result.data, loading: false });
      } else {
        throw new Error(result.message || 'Failed to fetch plans');
      }
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },
  
  addPlan: async (planData) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch('/api/plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...planData,
          subtasks: planData.subtasks || [],
          userId: 'mock-user-id',
        }),
      });
      
      if (!response.ok) throw new Error('Failed to add plan');
      
      const result = await response.json();
      if (result.success) {
        set((state) => ({ 
          plans: [result.data, ...state.plans],
          loading: false 
        }));
      } else {
        throw new Error(result.message || 'Failed to add plan');
      }
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },
  
  updatePlan: async (id, updates) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch(`/api/plans/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      
      if (!response.ok) throw new Error('Failed to update plan');
      
      const result = await response.json();
      if (result.success) {
        set((state) => ({
          plans: state.plans.map((plan) =>
            plan._id === id ? result.data : plan
          ),
          loading: false,
        }));
      } else {
        throw new Error(result.message || 'Failed to update plan');
      }
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },
  
  updatePlanSilently: async (id, updates) => {
    try {
      const response = await fetch(`/api/plans/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      
      if (!response.ok) throw new Error('Failed to update plan');
      
      const result = await response.json();
      if (result.success) {
        set((state) => ({
          plans: state.plans.map((plan) =>
            plan._id === id ? result.data : plan
          ),
        }));
      } else {
        throw new Error(result.message || 'Failed to update plan');
      }
    } catch (error) {
      // 静默更新失败时抛出错误，让调用方处理
      throw error;
    }
  },
  
  deletePlan: async (id) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch(`/api/plans/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) throw new Error('Failed to delete plan');
      
      const result = await response.json();
      if (result.success) {
        set((state) => ({
          plans: state.plans.filter((plan) => plan._id !== id),
          loading: false,
        }));
      } else {
        throw new Error(result.message || 'Failed to delete plan');
      }
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },
  
  completePlan: async (id) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch(`/api/plans/${id}/complete`, {
        method: 'POST',
      });
      
      if (!response.ok) throw new Error('Failed to complete plan');
      
      const result = await response.json();
      if (result.success) {
        set((state) => ({
          plans: state.plans.map((p) =>
            p._id === id ? result.data.plan : p
          ),
          loading: false,
        }));
      } else {
        throw new Error(result.message || 'Failed to complete plan');
      }
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },
}));