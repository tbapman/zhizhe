import mongoose, { Schema, Document } from 'mongoose';
import { Plan } from '@/types';

export interface IPlan extends Omit<Plan, '_id'>, Document {}

const PlanSchema: Schema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    goalId: {
      type: Schema.Types.ObjectId,
      ref: 'Goal',
      default: null,
    },
    content: {
      type: String,
      required: true,
    },
    completed: {
      type: Boolean,
      default: false,
    },
    completedAt: {
      type: Date,
      default: null,
    },
    date: {
      type: Date,
      required: true,
    },
    subtasks: {
      type: [
        {
          content: { type: String, required: true },
          completed: { type: Boolean, default: false },
        },
      ],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

PlanSchema.index({ userId: 1 });
PlanSchema.index({ goalId: 1 });
PlanSchema.index({ date: 1 });

export default mongoose.models.Plan || mongoose.model<IPlan>('Plan', PlanSchema);