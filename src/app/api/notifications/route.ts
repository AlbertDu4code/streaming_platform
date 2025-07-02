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

// 标记通知已读 schema
const MarkReadSchema = z.object({
  notificationIds: z.array(z.string()).min(1, { message: "至少选择一个通知" }),
});

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig);
    if (!session?.user?.id) {
      return createValidationErrorResponse({ auth: "未授权访问" });
    }

    const { searchParams } = new URL(request.url);
    const isRead = searchParams.get("isRead");
    const type = searchParams.get("type");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    const where: any = { userId: session.user.id };

    if (isRead !== null) {
      where.isRead = isRead === "true";
    }

    if (type) {
      where.type = type;
    }

    const skip = (page - 1) * limit;

    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.notification.count({ where }),
    ]);

    return createSuccessResponse({
      notifications,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return handleApiError(error, "获取通知列表");
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig);
    if (!session?.user?.id) {
      return createValidationErrorResponse({ auth: "未授权访问" });
    }

    const body = await request.json();
    const validatedFields = MarkReadSchema.safeParse(body);

    if (!validatedFields.success) {
      return createValidationErrorResponse(validatedFields.error.format());
    }

    const { notificationIds } = validatedFields.data;

    // 验证所有通知都属于当前用户
    const notifications = await prisma.notification.findMany({
      where: {
        id: { in: notificationIds },
        userId: session.user.id,
      },
    });

    if (notifications.length !== notificationIds.length) {
      return createValidationErrorResponse({
        notificationIds: "部分通知不存在或无权限访问",
      });
    }

    // 标记为已读
    await prisma.notification.updateMany({
      where: {
        id: { in: notificationIds },
        userId: session.user.id,
      },
      data: {
        isRead: true,
      },
    });

    return createSuccessResponse({
      message: "通知已标记为已读",
      count: notificationIds.length,
    });
  } catch (error) {
    return handleApiError(error, "标记通知已读");
  }
}
