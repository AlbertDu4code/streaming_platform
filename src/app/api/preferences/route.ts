import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth/config";
import { prisma } from "@/lib/db/prisma";
import { z } from "zod";
import {
  handleApiError,
  createSuccessResponse,
  createValidationErrorResponse,
} from "@/lib/api-utils";

// 更新用户偏好设置 schema
const UpdatePreferencesSchema = z.object({
  // 通知设置
  emailNotifications: z.boolean().optional(),
  budgetAlerts: z.boolean().optional(),
  weeklyReports: z.boolean().optional(),
  monthlyReports: z.boolean().optional(),

  // 显示设置
  defaultCurrency: z.string().optional(),
  timeZone: z.string().optional(),
  dateFormat: z.string().optional(),

  // 隐私设置
  shareUsageData: z.boolean().optional(),
  anonymousAnalytics: z.boolean().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig);
    if (!session?.user?.id) {
      return createValidationErrorResponse({ auth: "未授权访问" });
    }

    let preferences = await prisma.userPreferences.findUnique({
      where: { userId: session.user.id },
    });

    // 如果用户偏好设置不存在，创建默认设置
    if (!preferences) {
      preferences = await prisma.userPreferences.create({
        data: {
          userId: session.user.id,
          // 使用默认值
        },
      });
    }

    return createSuccessResponse(preferences);
  } catch (error) {
    return handleApiError(error, "获取用户偏好设置");
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig);
    if (!session?.user?.id) {
      return createValidationErrorResponse({ auth: "未授权访问" });
    }

    const body = await request.json();
    const validatedFields = UpdatePreferencesSchema.safeParse(body);

    if (!validatedFields.success) {
      return createValidationErrorResponse(validatedFields.error.format());
    }

    const {
      emailNotifications,
      budgetAlerts,
      weeklyReports,
      monthlyReports,
      defaultCurrency,
      timeZone,
      dateFormat,
      shareUsageData,
      anonymousAnalytics,
    } = validatedFields.data;

    // 使用 upsert 确保用户偏好设置存在
    const preferences = await prisma.userPreferences.upsert({
      where: { userId: session.user.id },
      update: {
        emailNotifications,
        budgetAlerts,
        weeklyReports,
        monthlyReports,
        defaultCurrency,
        timeZone,
        dateFormat,
        shareUsageData,
        anonymousAnalytics,
      },
      create: {
        userId: session.user.id,
        emailNotifications,
        budgetAlerts,
        weeklyReports,
        monthlyReports,
        defaultCurrency,
        timeZone,
        dateFormat,
        shareUsageData,
        anonymousAnalytics,
      },
    });

    return createSuccessResponse({
      message: "用户偏好设置更新成功",
      preferences,
    });
  } catch (error) {
    return handleApiError(error, "更新用户偏好设置");
  }
}
