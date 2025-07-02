import type { NextAuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma as db } from "@/lib/db/prisma";

// 定义登录表单的验证 schema
const LoginSchema = z.object({
  email: z.string().email({ message: "请输入有效的邮箱地址" }).toLowerCase(),
  password: z
    .string()
    .min(1, { message: "请输入密码" })
    .max(100, { message: "密码不能超过100个字符" }),
});

export const authConfig: NextAuthOptions = {
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      // authorize 函数负责验证用户的凭据
      async authorize(credentials) {
        try {
          // 1. 使用 Zod 验证输入字段
          const validatedFields = LoginSchema.safeParse(credentials);

          if (!validatedFields.success) {
            console.log("登录验证失败: 输入字段格式错误");
            return null;
          }

          const { email, password } = validatedFields.data;

          // 2. 在数据库中查找用户
          const user = await db.user.findUnique({
            where: { email },
            select: {
              id: true,
              email: true,
              name: true,
              image: true,
              password: true,
            },
          });

          // 如果用户不存在
          if (!user) {
            console.log(`登录失败: 用户不存在 - ${email}`);
            return null;
          }

          // 如果用户没有设置密码（例如通过 OAuth 注册的）
          if (!user.password) {
            console.log(`登录失败: 用户没有设置密码 - ${email}`);
            return null;
          }

          // 3. 比较提交的密码和数据库中存储的哈希密码
          const passwordsMatch = await bcrypt.compare(password, user.password);

          // 4. 如果密码匹配，则返回用户信息，登录成功
          if (passwordsMatch) {
            console.log(`登录成功: ${email}`);
            return {
              id: user.id,
              email: user.email,
              name: user.name,
              image: user.image,
            };
          } else {
            console.log(`登录失败: 密码错误 - ${email}`);
            return null;
          }
        } catch (error) {
          console.error("登录过程中发生错误:", error);
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24小时
  },
  callbacks: {
    async jwt({ token, user, account }) {
      // 登录成功时，将用户信息存储到token中
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.image = user.image;
      }

      // 如果是credentials登录，返回token给前端
      if (account && account.type === "credentials") {
        token.accessToken = token.id;
      }

      return token;
    },
    async session({ session, token }) {
      // 将token中的用户信息传递到session中
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
        session.user.image = token.image as string;
        // 让前端能拿到accessToken
        (session as any).accessToken = token.accessToken;
      }
      return session;
    },
    async signIn({ user, account, profile }) {
      // 可以在这里添加额外的登录验证逻辑
      if (account?.type === "credentials") {
        // 对于credentials登录，用户必须存在
        return !!user;
      }
      return true;
    },
  },
  events: {
    async signIn({ user, account, profile, isNewUser }) {
      console.log(`用户登录: ${user.email}, 类型: ${account?.type}`);
    },
    async signOut({ session, token }) {
      console.log(`用户登出: ${session?.user?.email || token?.email}`);
    },
  },
  pages: {
    signIn: "/auth/login",
    error: "/auth/error",
  },
  debug: process.env.NODE_ENV === "development",
  secret: process.env.NEXTAUTH_SECRET || "your-secret-key",
};
