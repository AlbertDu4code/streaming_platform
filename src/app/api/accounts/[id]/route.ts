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

// 更新流媒体账户 schema
const UpdateAccountSchema = z.object({
  service: z
    .enum(
      [
        "NETFLIX",
        "AMAZON_PRIME",
        "DISNEY_PLUS",
        "HULU",
        "HBO_MAX",
        "SPOTIFY",
        "APPLE_MUSIC",
        "YOUTUBE_PREMIUM",
        "TWITCH",
        "OTHER",
      ],
      { message: "服务类型不合法" }
    )
    .optional(),
  accountName: z.string().optional(),
  isActive: z.boolean().optional(),
  monthlyFee: z.number().min(0).optional(),
  currency: z.string().optional(),
  billingDate: z.number().min(1).max(31).optional(),
  apiKey: z.string().optional(),
  username: z.string().optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authConfig);
    if (!session?.user?.id) {
      return createValidationErrorResponse({ auth: "未授权访问" });
    }

    const account = await prisma.streamingAccount.findUnique({
      where: {
        id: params.id,
        userId: session.user.id,
      },
      include: {
        usageRecords: {
          orderBy: { date: "desc" },
          take: 10,
        },
      },
    });

    if (!account) {
      return createValidationErrorResponse({ id: "流媒体账户不存在" });
    }

    return createSuccessResponse(account);
  } catch (error) {
    return handleApiError(error, "获取流媒体账户详情");
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

    const body = await request.json();
    const validatedFields = UpdateAccountSchema.safeParse(body);

    if (!validatedFields.success) {
      return createValidationErrorResponse(validatedFields.error.format());
    }

    const {
      service,
      accountName,
      isActive,
      monthlyFee,
      currency,
      billingDate,
      apiKey,
      username,
    } = validatedFields.data;

    // 检查账户是否存在
    const existingAccount = await prisma.streamingAccount.findUnique({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    });

    if (!existingAccount) {
      return createValidationErrorResponse({ id: "流媒体账户不存在" });
    }

    // 如果更新了service或accountName，检查是否与其他账户冲突
    if (
      (service && service !== existingAccount.service) ||
      (accountName && accountName !== existingAccount.accountName)
    ) {
      const conflictAccount = await prisma.streamingAccount.findFirst({
        where: {
          userId: session.user.id,
          id: { not: params.id },
          service: service || existingAccount.service,
          accountName: accountName || existingAccount.accountName,
        },
      });

      if (conflictAccount) {
        return createValidationErrorResponse({
          service: "该服务下已存在相同名称的账户",
        });
      }
    }

    const account = await prisma.streamingAccount.update({
      where: {
        id: params.id,
        userId: session.user.id,
      },
      data: {
        service,
        accountName,
        isActive,
        monthlyFee,
        currency,
        billingDate,
        apiKey,
        username,
      },
    });

    return createSuccessResponse({
      message: "流媒体账户更新成功",
      account,
    });
  } catch (error) {
    return handleApiError(error, "更新流媒体账户");
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

    // 检查账户是否存在
    const existingAccount = await prisma.streamingAccount.findUnique({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    });

    if (!existingAccount) {
      return createValidationErrorResponse({ id: "流媒体账户不存在" });
    }

    // 删除账户及其关联的使用记录
    await prisma.streamingAccount.delete({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    });

    return createSuccessResponse({ message: "流媒体账户删除成功" });
  } catch (error) {
    return handleApiError(error, "删除流媒体账户");
  }
}
