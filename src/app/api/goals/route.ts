import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongoose';
import Goal from '@/models/Goal';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const userId = request.headers.get('x-user-id');
    
    if (!userId) {
      return NextResponse.json({
        success: false,
        message: '用户未认证',
        errorCode: 'UNAUTHORIZED'
      }, { status: 401 });
    }
    
    const goals = await Goal.find({ userId }).sort({ createdAt: -1 });
    return NextResponse.json({
      success: true,
      message: '获取目标列表成功',
      data: { goals }
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: '获取目标列表失败',
      errorCode: 'INTERNAL_ERROR'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const body = await request.json();
    const userId = request.headers.get('x-user-id');
    
    if (!userId) {
      return NextResponse.json({
        success: false,
        message: '用户未认证',
        errorCode: 'UNAUTHORIZED'
      }, { status: 401 });
    }
    
    const goal = await Goal.create({
      ...body,
      userId,
    });
    
    return NextResponse.json({
      success: true,
      message: '创建目标成功',
      data: { goal }
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: '创建目标失败',
      errorCode: 'INTERNAL_ERROR'
    }, { status: 500 });
  }
}