import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

// 公开路由，任何人都可以访问
const publicRoutes = ["/", "/auth/login", "/auth/register"];

export default withAuth(
  // 这个函数只会在 `authorized` 回调返回 true 时运行
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const isLoggedIn = !!req.nextauth.token;

    // 如果用户已登录，但访问的是登录/注册页，将他们重定向到主功能页
    if (isLoggedIn && (pathname === "/auth/login" || pathname === "/auth/register")) {
      return NextResponse.redirect(new URL("/monitoring", req.url));
    }

    // 对于所有其他授权的请求，继续处理
    return NextResponse.next();
  },
  {
    callbacks: {
      // 这个回调决定用户是否有权访问一个页面
      authorized: ({ req, token }) => {
        const { pathname } = req.nextUrl;

        // 1. 如果访问的是公开路由，直接授权
        if (publicRoutes.includes(pathname)) {
          return true;
        }

        // 2. 对于所有其他受保护的路由，只有在用户已登录（有token）时才授权
        return !!token;
      },
    },
    // 告诉 withAuth，如果授权失败，应该把用户重定向到哪里
    pages: {
      signIn: "/auth/login",
    },
  }
);

export const config = {
  // 匹配除了 API、静态文件、图片等之外的所有路由
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
