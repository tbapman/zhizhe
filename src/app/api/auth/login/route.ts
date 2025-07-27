import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongoose';
import User from '@/models/User';
import { generateToken, setTokenCookie } from '@/lib/auth/jwt';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    
    const { email, password } = await request.json();
    
    // 验证输入
    if (!email || !password) {
      return NextResponse.json({
        success: false,
        message: '请提供邮箱和密码',
        errorCode: 'MISSING_CREDENTIALS'
      }, { status: 400 });
    }
    
    // 查找用户
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return NextResponse.json({
        success: false,
        message: '用户不存在',
        errorCode: 'USER_NOT_FOUND'
      }, { status: 401 });
    }
    
    // 验证密码
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return NextResponse.json({
        success: false,
        message: '密码错误',
        errorCode: 'INVALID_PASSWORD'
      }, { status: 401 });
    }
    
    // 生成JWT
    const token = await generateToken({
      userId: user._id.toString(),
      email: user.email,
    });
    
    // 设置cookie
    const cookie = setTokenCookie(token);
    
    // 确保cookie在localhost上也能正确设置
    const cookieHeader = `${cookie.name}=${cookie.value}; HttpOnly; Path=/; Max-Age=${cookie.maxAge}; SameSite=Lax${cookie.secure ? '; Secure' : ''}`;
    
    return NextResponse.json({
      success: true,
      message: '登录成功',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          avatar: user.avatar,
          achievementPoints: user.achievementPoints,
          achievementCoins: user.achievementCoins,
        },
        token,
      }
    }, {
      headers: {
        'Set-Cookie': cookieHeader,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({
      success: false,
      message: '登录失败，请稍后重试',
      errorCode: 'INTERNAL_ERROR'
    }, { status: 500 });
  }
}