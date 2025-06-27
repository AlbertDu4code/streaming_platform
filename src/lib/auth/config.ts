import type { NextAuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma as db } from "@/lib/db/prisma";

// 定义登录表单的验证 schema
const LoginSchema = z.object({
  email: z.string().email({ message: "请输入有效的邮箱地址" }),
  password: z.string().min(1, { message: "请输入密码" }),
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
        // 1. 使用 Zod 验证输入字段
        const validatedFields = LoginSchema.safeParse(credentials);

        if (validatedFields.success) {
          const { email, password } = validatedFields.data;

          // 2. 在数据库中查找用户
          const user = await db.user.findUnique({ where: { email } });

          // 如果用户不存在或没有设置密码（例如通过 OAuth 注册的），则登录失败
          if (!user || !user.password) {
            return null;
          }

          // 3. 比较提交的密码和数据库中存储的哈希密码
          const passwordsMatch = await bcrypt.compare(password, user.password);

          // 4. 如果密码匹配，则返回用户信息，登录成功
          if (passwordsMatch) {
            return {
              id: user.id,
              email: user.email,
              name: user.name,
              image: user.image,
            };
          }
        }

        // 5. 如果验证失败、用户不存在或密码不匹配，则返回 null
        return null;
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/login",
    error: "/auth/error",
  },
  secret: process.env.NEXTAUTH_SECRET || "your-secret-key",
};
