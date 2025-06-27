"use server";

import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma as db } from "@/lib/db/prisma";

const RegisterSchema = z.object({
  email: z.string().email({ message: "请输入有效的邮箱地址" }),
  password: z.string().min(6, { message: "密码长度不能少于6位" }),
  name: z.string().min(1, { message: "请输入用户名" }),
});

export const registerUser = async (values: z.infer<typeof RegisterSchema>) => {
  const validatedFields = RegisterSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: "输入信息无效，请检查后重试" };
  }

  const { email, password, name } = validatedFields.data;
  const hashedPassword = await bcrypt.hash(password, 10);

  const existingUser = await db.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    return { error: "该邮箱已被注册！" };
  }

  await db.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
    },
  });

  return { success: "用户注册成功！" };
};
