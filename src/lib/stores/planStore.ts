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
      
      const plans = await response.json();
      set({ plans, loading: false });
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
          userId: 'mock-user-id',
        }),
      });
      
      if (!response.ok) throw new Error('Failed to add plan');
      
      const newPlan = await response.json();
      set((state) => ({ 
        plans: [newPlan, ...state.plans],
        loading: false 
      }));
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
      
      const updatedPlan = await response.json();
      set((state) => ({
        plans: state.plans.map((plan) =>
          plan._id === id ? updatedPlan : plan
        ),
        loading: false,
      }));
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },
  
  deletePlan: async (id) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch(`/api/plans/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) throw new Error('Failed to delete plan');
      
      set((state) => ({
        plans: state.plans.filter((plan) => plan._id !== id),
        loading: false,
      }));
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
      
      const { plan } = await response.json();
      set((state) => ({
        plans: state.plans.map((p) =>
          p._id === id ? plan : p
        ),
        loading: false,
      }));
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },
}));