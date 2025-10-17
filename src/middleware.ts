import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyToken } from "@/lib/auth/jwt";

export async function middleware(request: NextRequest) {
  console.log('Middleware: Processing request for path:', request.nextUrl.pathname);
  
  // 检查是否是API路由
  if (request.nextUrl.pathname.startsWith("/api/")) {
    // 跳过认证路由
    if (
      request.nextUrl.pathname.startsWith("/api/auth/login") ||
      request.nextUrl.pathname.startsWith("/api/auth/register") ||
      request.nextUrl.pathname.startsWith("/api/auth/me")
    ) {
      return NextResponse.next();
    }

    const token = request.cookies.get("auth-token")?.value;

    if (!token) {
      console.log('Middleware API: No token found for:', request.nextUrl.pathname);
      return NextResponse.json(
        { success: false, message: "未提供认证令牌" },
        { status: 401 }
      );
    }

    try {
      const payload = await verifyToken(token);
      if (!payload) {
        console.log('Middleware API: Invalid token payload for:', request.nextUrl.pathname);
        return NextResponse.json(
          { success: false, message: "无效的认证令牌" },
          { status: 401 }
        );
      }

      // 将用户信息添加到请求头
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set("x-user-id", payload.userId);
      requestHeaders.set("x-user-email", payload.email);

      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });
    } catch (error) {
      console.log('Middleware API: Token verification error:', error);
      return NextResponse.json(
        { success: false, message: "无效的认证令牌" },
        { status: 401 }
      );
    }
  }

  // 保护需要认证的前端页面
  const protectedPaths = ["/tree", "/goals", "/plans", "/groups", "/profile"];
  const isProtectedPath = protectedPaths.some((path) =>
    request.nextUrl.pathname.startsWith(path)
  );

  if (isProtectedPath) {
    const token = request.cookies.get("auth-token")?.value;

    if (!token) {
      console.log('Middleware: No token found for protected path:', request.nextUrl.pathname);
      console.log('Middleware: Available cookies:', request.cookies.getAll().map(cookie => `${cookie.name}=${cookie.value.substring(0, 10)}...`));
      return NextResponse.redirect(new URL("/login", request.url));
    }

    try {
      console.log('Middleware: Verifying token for path:', request.nextUrl.pathname);
      const payload = await verifyToken(token);
      if (!payload) {
        console.log('Middleware: Invalid token payload for protected path:', request.nextUrl.pathname);
        return NextResponse.redirect(new URL("/login", request.url));
      }
      console.log('Middleware: Token valid for path:', request.nextUrl.pathname, 'userId:', payload.userId);
      return NextResponse.next();
    } catch (error) {
      console.log('Middleware: Token verification failed for path:', request.nextUrl.pathname, 'error:', error);
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/api/:path*",
    "/tree",
    "/tree/:path*",
    "/goals",
    "/goals/:path*",
    "/plans",
    "/plans/:path*",
    "/groups",
    "/groups/:path*",
    "/profile",
    "/profile/:path*",
  ],
};
