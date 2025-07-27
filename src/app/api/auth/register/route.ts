import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongoose';
import User from '@/models/User';
import { generateToken, setTokenCookie } from '@/lib/auth/jwt';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    
    const { name, email, password } = await request.json();
    
    // 验证输入
    if (!name || !email || !password) {
      return NextResponse.json({
        success: false,
        message: '请提供完整的注册信息',
        errorCode: 'MISSING_FIELDS'
      }, { status: 400 });
    }
    
    if (password.length < 6) {
      return NextResponse.json({
        success: false,
        message: '密码长度至少为6位',
        errorCode: 'INVALID_PASSWORD'
      }, { status: 400 });
    }
    
    // 检查邮箱是否已注册
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json({
        success: false,
        message: '邮箱已被注册',
        errorCode: 'EMAIL_EXISTS'
      }, { status: 400 });
    }
    
    // 创建新用户
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
    });
    
    // 生成JWT
    const token = await generateToken({
      userId: user._id.toString(),
      email: user.email,
    });
    
    // 设置cookie
    const cookie = setTokenCookie(token);
    
    return NextResponse.json({
      success: true,
      message: '注册成功',
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
      status: 201,
      headers: {
        'Set-Cookie': `${cookie.name}=${cookie.value}; HttpOnly${cookie.secure ? '; Secure' : ''}; SameSite=${cookie.sameSite}; Max-Age=${cookie.maxAge}; Path=/`,
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({
      success: false,
      message: '注册失败，请稍后重试',
      errorCode: 'INTERNAL_ERROR'
    }, { status: 500 });
  }
}