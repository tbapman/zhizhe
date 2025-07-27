import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongoose';
import Plan from '@/models/Plan';
import '@/models/Goal'; // Import to ensure Goal model is registered
export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    const searchParams = request.nextUrl.searchParams;
    const date = searchParams.get('date');
    const userId = request.headers.get('x-user-id');
    
    if (!userId) {
      return NextResponse.json({
        success: false,
        message: '用户未认证',
        errorCode: 'UNAUTHORIZED'
      }, { status: 401 });
    }
    
    const query: Record<string, unknown> = { userId };
    
    if (date) {
      const targetDate = new Date(date);
      targetDate.setHours(0, 0, 0, 0);
      const nextDay = new Date(targetDate);
      nextDay.setDate(nextDay.getDate() + 1);
      
      query.date = {
        $gte: targetDate,
        $lt: nextDay,
      };
    }
    
    const plans = await Plan.find(query)
      .populate('goalId', 'title')
      .sort({ createdAt: -1 });
    
    return NextResponse.json({
      success: true,
      message: '获取计划列表成功',
      data: plans
    });
  } catch (error) {
    console.error('Error fetching plans:', error);
    return NextResponse.json({
      success: false,
      message: '获取计划列表失败',
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

    // Validate required fields
    if (!body.content || body.content.trim() === '') {
      return NextResponse.json({
        success: false,
        message: '计划内容不能为空',
        errorCode: 'MISSING_CONTENT'
      }, { status: 400 });
    }

    if (!body.date) {
      return NextResponse.json({
        success: false,
        message: '计划日期不能为空',
        errorCode: 'MISSING_DATE'
      }, { status: 400 });
    }
    
    const plan = await Plan.create({
      ...body,
      userId,
    });
    
    return NextResponse.json({
      success: true,
      message: '创建计划成功',
      data: plan
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating plan:', error);
    return NextResponse.json({
      success: false,
      message: '创建计划失败',
      errorCode: 'INTERNAL_ERROR'
    }, { status: 500 });
  }
}