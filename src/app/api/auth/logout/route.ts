import { NextResponse } from 'next/server';

export async function POST() {
  // 清除cookie
  return NextResponse.json({
    success: true,
    message: '登出成功',
    data: null
  }, {
    headers: {
      'Set-Cookie': 'auth-token=; HttpOnly; Path=/; Max-Age=0',
    },
  });
}