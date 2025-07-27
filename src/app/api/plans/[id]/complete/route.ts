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
      return NextResponse.json({
        success: false,
        message: '计划不存在',
        errorCode: 'PLAN_NOT_FOUND'
      }, { status: 404 });
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
      success: true,
      message: '计划完成成功',
      data: {
        plan,
        achievement
      }
    });
  } catch (error) {
    console.error('Error completing plan:', error);
    return NextResponse.json({
      success: false,
      message: '完成计划失败',
      errorCode: 'INTERNAL_ERROR'
    }, { status: 500 });
  }
}