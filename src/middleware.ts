import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

// 公开路由，任何人都可以访问
const publicRoutes = ["/", "/auth/login", "/auth/register"];

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const isLoggedIn = !!req.nextauth.token;

    // 如果用户已登录，但访问的是登录/注册页，将他们重定向到主功能页
    if (isLoggedIn && (pathname === "/auth/login" || pathname === "/auth/register")) {
      return NextResponse.redirect(new URL("/monitoring", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ req, token }) => {
        const { pathname } = req.nextUrl;

        // 1. 如果访问的是公开路由，直接授权
        if (publicRoutes.includes(pathname)) {
          return true;
        }

        // 2. 对于受保护的路由，检查 token
        if (!!token) {
          return true;
        }

        // 3. 如果没有 token，检查是否是刚刚登录的情况
        // 通过检查 referer 来判断是否来自登录页
        const referer = req.headers.get('referer');
        if (referer && referer.includes('/auth/login')) {
          // 给一个短暂的宽限期，让 NextAuth 更新 token
          return true;
        }

        return false;
      },
    },
    pages: {
      signIn: "/auth/login",
    },
  }
);

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};