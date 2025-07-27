import mongoose, { Schema, Document } from 'mongoose';
import { Group } from '@/types';

export interface IGroup extends Omit<Group, '_id'>, Document {}

const GroupSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    avatar: {
      type: String,
      default: null,
    },
    members: [{
      type: Schema.Types.ObjectId,
      ref: 'User',
    }],
    ownerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    postsCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

GroupSchema.index({ ownerId: 1 });
GroupSchema.index({ members: 1 });

export default mongoose.models.Group || mongoose.model<IGroup>('Group', GroupSchema);