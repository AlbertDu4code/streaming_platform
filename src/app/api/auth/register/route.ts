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
    name: z
      .string()
      .min(2, { message: "姓名至少需要2个字符" })
      .max(50, { message: "姓名不能超过50个字符" })
      .regex(/^[a-zA-Z\u4e00-\u9fa5\s]+$/, {
        message: "姓名只能包含中文、英文和空格",
      }),
    email: z
      .string()
      .email({ message: "请输入有效的邮箱地址" })
      .max(100, { message: "邮箱地址不能超过100个字符" })
      .toLowerCase(),
    password: z
      .string()
      .min(6, { message: "密码至少需要6个字符" })
      .max(100, { message: "密码不能超过100个字符" })
      .regex(/^(?=.*[a-z])(?=.*\d)/, {
        message: "密码必须包含至少一个小写字母和一个数字",
      }),
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
      select: { id: true, email: true },
    });

    if (existingUser) {
      return createValidationErrorResponse({
        email: "该邮箱已被注册，请使用其他邮箱或直接登录",
      });
    }

    // 验证邮箱格式（额外检查）
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return createValidationErrorResponse({
        email: "邮箱格式不正确",
      });
    }

    // 加密密码
    const hashedPassword = await bcrypt.hash(password, 12);

    // 使用事务创建用户和默认偏好设置
    const result = await prisma.$transaction(async (tx) => {
      // 创建用户
      const user = await tx.user.create({
        data: {
          name: name.trim(),
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
      await tx.userPreferences.create({
        data: {
          userId: user.id,
          emailNotifications: true,
          budgetAlerts: true,
          weeklyReports: false,
          monthlyReports: true,
          defaultCurrency: "CNY",
          timeZone: "Asia/Shanghai",
          dateFormat: "YYYY-MM-DD",
          shareUsageData: false,
          anonymousAnalytics: true,
        },
      });

      return user;
    });

    return createSuccessResponse({
      success: true,
      message: "注册成功！请使用您的账户登录",
      user: {
        id: result.id,
        name: result.name,
        email: result.email,
        createdAt: result.createdAt,
      },
    });
  } catch (error) {
    console.error("注册失败:", error);

    // 检查是否是数据库约束错误
    if (error instanceof Error && error.message.includes("Unique constraint")) {
      return createValidationErrorResponse({
        email: "该邮箱已被注册",
      });
    }

    return handleApiError(error, "用户注册");
  }
}
