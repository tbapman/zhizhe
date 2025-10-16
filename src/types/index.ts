export interface User {
  _id: string;
  email: string;
  name: string;
  avatar?: string;
  achievementPoints: number;
  achievementCoins: number;
  createdAt: Date;
  updatedAt: Date;
}

export type GoalStage = 'flower' | 'apple' | 'root';
export type GoalStatus = 'active' | 'completed' | 'archived';

export interface Goal {
  _id: string;
  userId: string;
  title: string;
  subtitle?: string;
  startDate: Date;
  endDate?: Date;
  status: GoalStatus;
  stage: GoalStage;
  achievementValue: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Subtask {
  content: string;
  completed: boolean;
}

export interface Plan {
  _id: string;
  userId: string;
  goalId?: string | { _id: string; title: string };
  content: string;
  completed: boolean;
  completedAt?: Date;
  date: Date;
  subtasks: Subtask[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Group {
  _id: string;
  name: string;
  description: string;
  avatar?: string;
  members: string[];
  ownerId: string;
  postsCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Post {
  _id: string;
  groupId: string;
  userId: string;
  content: string;
  images?: string[];
  videos?: string[];
  files?: string[];
  likes: string[];
  comments: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Achievement {
  _id: string;
  userId: string;
  type: 'plan_complete' | 'goal_complete' | 'daily_checkin';
  points: number;
  coins: number;
  description: string;
  createdAt: Date;
}