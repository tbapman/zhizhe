import mongoose, { Schema, Document } from 'mongoose';
import { Goal, GoalStage, GoalStatus } from '@/types';

export interface IGoal extends Omit<Goal, '_id'>, Document {}

const GoalSchema: Schema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    subtitle: {
      type: String,
      default: '',
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: ['active', 'completed', 'archived'] as GoalStatus[],
      default: 'active',
    },
    stage: {
      type: String,
      enum: ['flower', 'apple', 'root'] as GoalStage[],
      default: 'flower',
    },
    achievementValue: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

GoalSchema.index({ userId: 1 });
GoalSchema.index({ status: 1 });

export default mongoose.models.Goal || mongoose.model<IGoal>('Goal', GoalSchema);