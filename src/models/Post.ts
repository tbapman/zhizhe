import mongoose, { Schema, Document } from 'mongoose';
import { Post } from '@/types';

export interface IPost extends Omit<Post, '_id'>, Document {}

const PostSchema: Schema = new Schema(
  {
    groupId: {
      type: Schema.Types.ObjectId,
      ref: 'Group',
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    images: [{
      type: String,
    }],
    videos: [{
      type: String,
    }],
    files: [{
      type: String,
    }],
    likes: [{
      type: Schema.Types.ObjectId,
      ref: 'User',
    }],
    comments: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

PostSchema.index({ groupId: 1 });
PostSchema.index({ userId: 1 });
PostSchema.index({ createdAt: -1 });

export default mongoose.models.Post || mongoose.model<IPost>('Post', PostSchema);