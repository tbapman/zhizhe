import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongoose';
import User from '@/models/User';
import { getTokenFromRequest, verifyToken } from '@/lib/auth/jwt';

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
    
    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({
        success: false,
        message: '无效的认证信息',
        errorCode: 'INVALID_TOKEN'
      }, { status: 401 });
    }
    
    const user = await User.findById(decoded.userId).select('-password');
    if (!user) {
      return NextResponse.json({
        success: false,
        message: '用户不存在',
        errorCode: 'USER_NOT_FOUND'
      }, { status: 404 });
    }
    
    return NextResponse.json({
      success: true,
      message: '获取用户信息成功',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          avatar: user.avatar,
          achievementPoints: user.achievementPoints,
          achievementCoins: user.achievementCoins,
        }
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    return NextResponse.json({
      success: false,
      message: '获取用户信息失败',
      errorCode: 'INTERNAL_ERROR'
    }, { status: 500 });
  }
}