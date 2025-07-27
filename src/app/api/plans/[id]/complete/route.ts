import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongoose';
import Plan from '@/models/Plan';
import Achievement from '@/models/Achievement';
import User from '@/models/User';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    
    const { id } = params;
    
    // 更新计划为完成状态
    const plan = await Plan.findByIdAndUpdate(
      id,
      { 
        completed: true, 
        completedAt: new Date() 
      },
      { new: true }
    ).populate('goalId');

    if (!plan) {
      return NextResponse.json(
        { error: 'Plan not found' },
        { status: 404 }
      );
    }

    // 创建成就记录
    const achievement = await Achievement.create({
      userId: plan.userId || 'mock-user-id',
      type: 'plan_complete',
      points: 10,
      coins: 5,
      description: `完成计划：${plan.content}`,
    });

    // 更新用户成就值和成就币
    await User.findByIdAndUpdate(
      plan.userId || 'mock-user-id',
      { 
        $inc: { 
          achievementPoints: 10,
          achievementCoins: 5 
        } 
      }
    );

    return NextResponse.json({
      plan,
      achievement,
      message: 'Plan completed successfully'
    });
  } catch (error) {
    console.error('Error completing plan:', error);
    return NextResponse.json(
      { error: 'Failed to complete plan' },
      { status: 500 }
    );
  }
}