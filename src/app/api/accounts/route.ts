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

// 创建流媒体账户 schema
const CreateAccountSchema = z.object({
  service: z.enum(
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
  ),
  accountName: z.string().optional(),
  monthlyFee: z.number().min(0).optional(),
  currency: z.string().default("CNY"),
  billingDate: z.number().min(1).max(31).optional(),
  apiKey: z.string().optional(),
  username: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig);
    if (!session?.user?.id) {
      return createValidationErrorResponse({ auth: "未授权访问" });
    }

    const { searchParams } = new URL(request.url);
    const service = searchParams.get("service");
    const isActive = searchParams.get("isActive");

    const where: any = { userId: session.user.id };

    if (service) {
      where.service = service;
    }

    if (isActive !== null) {
      where.isActive = isActive === "true";
    }

    const accounts = await prisma.streamingAccount.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        usageRecords: {
          orderBy: { date: "desc" },
          take: 1,
        },
      },
    });

    return createSuccessResponse(accounts);
  } catch (error) {
    return handleApiError(error, "获取流媒体账户列表");
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig);
    if (!session?.user?.id) {
      return createValidationErrorResponse({ auth: "未授权访问" });
    }

    const body = await request.json();
    const validatedFields = CreateAccountSchema.safeParse(body);

    if (!validatedFields.success) {
      return createValidationErrorResponse(validatedFields.error.format());
    }

    const {
      service,
      accountName,
      monthlyFee,
      currency,
      billingDate,
      apiKey,
      username,
    } = validatedFields.data;

    // 检查是否已存在相同的账户
    const existingAccount = await prisma.streamingAccount.findFirst({
      where: {
        userId: session.user.id,
        service,
        accountName: accountName || null,
      },
    });

    if (existingAccount) {
      return createValidationErrorResponse({
        service: "该服务下已存在相同名称的账户",
      });
    }

    const account = await prisma.streamingAccount.create({
      data: {
        userId: session.user.id,
        service,
        accountName,
        monthlyFee,
        currency,
        billingDate,
        apiKey,
        username,
      },
    });

    return createSuccessResponse({
      message: "流媒体账户创建成功",
      account,
    });
  } catch (error) {
    return handleApiError(error, "创建流媒体账户");
  }
}
