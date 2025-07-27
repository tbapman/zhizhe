import mongoose, { Schema, Document } from 'mongoose';
import { Achievement } from '@/types';

export interface IAchievement extends Omit<Achievement, '_id'>, Document {}

const AchievementSchema: Schema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: ['plan_complete', 'goal_complete', 'daily_checkin'],
      required: true,
    },
    points: {
      type: Number,
      required: true,
    },
    coins: {
      type: Number,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

AchievementSchema.index({ userId: 1 });
AchievementSchema.index({ createdAt: -1 });

export default mongoose.models.Achievement || mongoose.model<IAchievement>('Achievement', AchievementSchema);