import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth/config";
import { prisma } from "@/lib/db/prisma";
import {
  handleApiError,
  createSuccessResponse,
  createValidationErrorResponse,
} from "@/lib/api-utils";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authConfig);
    if (!session?.user?.id) {
      return createValidationErrorResponse({ auth: "未授权访问" });
    }

    const notification = await prisma.notification.findUnique({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    });

    if (!notification) {
      return createValidationErrorResponse({ id: "通知不存在" });
    }

    return createSuccessResponse(notification);
  } catch (error) {
    return handleApiError(error, "获取通知详情");
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authConfig);
    if (!session?.user?.id) {
      return createValidationErrorResponse({ auth: "未授权访问" });
    }

    // 检查通知是否存在
    const existingNotification = await prisma.notification.findUnique({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    });

    if (!existingNotification) {
      return createValidationErrorResponse({ id: "通知不存在" });
    }

    // 标记为已读
    const notification = await prisma.notification.update({
      where: {
        id: params.id,
        userId: session.user.id,
      },
      data: {
        isRead: true,
      },
    });

    return createSuccessResponse({
      message: "通知已标记为已读",
      notification,
    });
  } catch (error) {
    return handleApiError(error, "标记通知已读");
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authConfig);
    if (!session?.user?.id) {
      return createValidationErrorResponse({ auth: "未授权访问" });
    }

    // 检查通知是否存在
    const existingNotification = await prisma.notification.findUnique({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    });

    if (!existingNotification) {
      return createValidationErrorResponse({ id: "通知不存在" });
    }

    await prisma.notification.delete({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    });

    return createSuccessResponse({ message: "通知删除成功" });
  } catch (error) {
    return handleApiError(error, "删除通知");
  }
}
