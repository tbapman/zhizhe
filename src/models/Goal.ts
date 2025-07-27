import mongoose, { Schema, Document } from 'mongoose';

export interface IGoal extends Document {
  userId: string;
  title: string;
  stage: 'flower' | 'apple' | 'root';
  status: 'active' | 'completed' | 'archived';
  achievementValue: number;
  position: {
    x: number;
    y: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const GoalSchema: Schema = new Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  stage: {
    type: String,
    enum: ['flower', 'apple', 'root'],
    default: 'flower'
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'archived'],
    default: 'active'
  },
  achievementValue: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  position: {
    x: {
      type: Number,
      default: 0
    },
    y: {
      type: Number,
      default: 0
    }
  }
}, {
  timestamps: true
});

GoalSchema.index({ userId: 1, status: 1 });
GoalSchema.index({ userId: 1, stage: 1 });

export default mongoose.models.Goal || mongoose.model<IGoal>('Goal', GoalSchema);