import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongoose';
import Plan from '@/models/Plan';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;
    const userId = request.headers.get('x-user-id');
    
    if (!userId) {
      return NextResponse.json({
        success: false,
        message: '用户未认证',
        errorCode: 'UNAUTHORIZED'
      }, { status: 401 });
    }
    
    if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
      return NextResponse.json({
        success: false,
        message: '计划ID格式无效',
        errorCode: 'INVALID_PLAN_ID'
      }, { status: 400 });
    }
    
    const plan = await Plan.findOne({ _id: id, userId }).populate('goalId', 'title');
    
    if (!plan) {
      return NextResponse.json({
        success: false,
        message: '计划不存在',
        errorCode: 'PLAN_NOT_FOUND'
      }, { status: 404 });
    }
    
    return NextResponse.json({
      success: true,
      message: '获取计划成功',
      data: plan
    });
  } catch (error) {
    console.error('Error fetching plan:', error);
    return NextResponse.json({
      success: false,
      message: '获取计划失败',
      errorCode: 'INTERNAL_ERROR'
    }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;
    const body = await request.json();
    const userId = request.headers.get('x-user-id');
    
    if (!userId) {
      return NextResponse.json({
        success: false,
        message: '用户未认证',
        errorCode: 'UNAUTHORIZED'
      }, { status: 401 });
    }
    
    if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
      return NextResponse.json({
        success: false,
        message: '计划ID格式无效',
        errorCode: 'INVALID_PLAN_ID'
      }, { status: 400 });
    }
    
    const plan = await Plan.findOneAndUpdate(
      { _id: id, userId },
      { ...body, updatedAt: new Date() },
      { new: true }
    ).populate('goalId', 'title');
    
    if (!plan) {
      return NextResponse.json({
        success: false,
        message: '计划不存在',
        errorCode: 'PLAN_NOT_FOUND'
      }, { status: 404 });
    }
    
    return NextResponse.json({
      success: true,
      message: '更新计划成功',
      data: plan
    });
  } catch (error) {
    console.error('Error updating plan:', error);
    return NextResponse.json({
      success: false,
      message: '更新计划失败',
      errorCode: 'INTERNAL_ERROR'
    }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;
    const userId = request.headers.get('x-user-id');
    
    if (!userId) {
      return NextResponse.json({
        success: false,
        message: '用户未认证',
        errorCode: 'UNAUTHORIZED'
      }, { status: 401 });
    }
    
    if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
      return NextResponse.json({
        success: false,
        message: '计划ID格式无效',
        errorCode: 'INVALID_PLAN_ID'
      }, { status: 400 });
    }
    
    const plan = await Plan.findOneAndDelete({ _id: id, userId });
    
    if (!plan) {
      return NextResponse.json({
        success: false,
        message: '计划不存在',
        errorCode: 'PLAN_NOT_FOUND'
      }, { status: 404 });
    }
    
    return NextResponse.json({
      success: true,
      message: '删除计划成功',
      data: { id }
    });
  } catch (error) {
    console.error('Error deleting plan:', error);
    return NextResponse.json({
      success: false,
      message: '删除计划失败',
      errorCode: 'INTERNAL_ERROR'
    }, { status: 500 });
  }
}