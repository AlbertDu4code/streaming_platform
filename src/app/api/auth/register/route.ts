import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import {
  handleApiError,
  createSuccessResponse,
  createValidationErrorResponse,
} from "@/lib/api-utils";

// 注册表单验证 schema
const RegisterSchema = z
  .object({
    name: z.string().min(2, { message: "姓名至少需要2个字符" }),
    email: z.string().email({ message: "请输入有效的邮箱地址" }),
    password: z.string().min(6, { message: "密码至少需要6个字符" }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "两次输入的密码不一致",
    path: ["confirmPassword"],
  });

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // 验证输入数据
    const validatedFields = RegisterSchema.safeParse(body);

    if (!validatedFields.success) {
      return createValidationErrorResponse(validatedFields.error.format());
    }

    const { name, email, password } = validatedFields.data;

    // 检查用户是否已存在
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return createValidationErrorResponse({ email: "该邮箱已被注册" });
    }

    // 加密密码
    const hashedPassword = await bcrypt.hash(password, 12);

    // 创建用户
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      },
    });

    // 创建用户默认偏好设置
    await prisma.userPreferences.create({
      data: {
        userId: user.id,
        emailNotifications: true,
        budgetAlerts: true,
        weeklyReports: false,
        monthlyReports: true,
        defaultCurrency: "USD",
        timeZone: "Asia/Shanghai",
        dateFormat: "YYYY-MM-DD",
        shareUsageData: false,
        anonymousAnalytics: true,
      },
    });

    return createSuccessResponse({
      message: "注册成功",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    return handleApiError(error, "用户注册");
  }
}
