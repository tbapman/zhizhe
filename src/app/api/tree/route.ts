import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongoose';
import Goal from '@/models/Goal';
import { getTokenFromRequest, verifyToken } from '@/lib/auth/jwt';

// GET /api/tree - 获取用户的所有目标树节点
export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    const token = getTokenFromRequest(request);
    if (!token) {
      return NextResponse.json({
        success: false,
        message: '未提供认证信息',
        errorCode: 'NO_TOKEN'
      }, { status: 401 });
    }

    const decoded = await verifyToken(token);
    if (!decoded) {
      return NextResponse.json({
        success: false,
        message: '无效的认证信息',
        errorCode: 'INVALID_TOKEN'
      }, { status: 401 });
    }

    const goals = await Goal.find({ userId: decoded.userId, status: { $ne: 'archived' } })
      .sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      message: '获取目标树成功',
      data: goals
    });
  } catch (error) {
    console.error('Get tree nodes error:', error);
    return NextResponse.json({
      success: false,
      message: '获取目标树失败',
      errorCode: 'INTERNAL_ERROR'
    }, { status: 500 });
  }
}

// POST /api/tree - 创建新的目标树节点
export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    
    const token = getTokenFromRequest(request);
    if (!token) {
      return NextResponse.json({
        success: false,
        message: '未提供认证信息',
        errorCode: 'NO_TOKEN'
      }, { status: 401 });
    }

    const decoded = await verifyToken(token);
    if (!decoded) {
      return NextResponse.json({
        success: false,
        message: '无效的认证信息',
        errorCode: 'INVALID_TOKEN'
      }, { status: 401 });
    }

    const { title, stage = 'flower', achievementValue = 0, position = { x: 0, y: 0 } } = await request.json();

    if (!title || title.trim() === '') {
      return NextResponse.json({
        success: false,
        message: '标题不能为空',
        errorCode: 'MISSING_TITLE'
      }, { status: 400 });
    }

    if (title.length > 50) {
      return NextResponse.json({
        success: false,
        message: '标题长度不能超过50个字符',
        errorCode: 'TITLE_TOO_LONG'
      }, { status: 400 });
    }

    if (achievementValue < 0 || achievementValue > 100) {
      return NextResponse.json({
        success: false,
        message: '完成度必须在0-100之间',
        errorCode: 'INVALID_ACHIEVEMENT_VALUE'
      }, { status: 400 });
    }

    const goal = await Goal.create({
      userId: decoded.userId,
      title: title.trim(),
      stage,
      achievementValue,
      position
    });

    return NextResponse.json({
      success: true,
      message: '创建目标成功',
      data: goal
    }, { status: 201 });
  } catch (error) {
    console.error('Create tree node error:', error);
    return NextResponse.json({
      success: false,
      message: '创建目标失败',
      errorCode: 'INTERNAL_ERROR'
    }, { status: 500 });
  }
}