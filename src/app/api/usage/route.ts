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

// 创建使用记录 schema
const CreateUsageRecordSchema = z.object({
  accountId: z.string().min(1, { message: "账户ID不能为空" }),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, { message: "日期格式不正确" }),
  duration: z.number().min(1, { message: "使用时长必须大于0" }),
  episodeCount: z.number().min(0).optional(),
  dataUsage: z.number().min(0).optional(),
  contentType: z.string().optional(),
  genre: z.string().optional(),
  quality: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig);
    if (!session?.user?.id) {
      return createValidationErrorResponse({ auth: "未授权访问" });
    }

    const { searchParams } = new URL(request.url);
    const accountId = searchParams.get("accountId");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const contentType = searchParams.get("contentType");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    const where: any = { userId: session.user.id };

    if (accountId) {
      where.accountId = accountId;
    }

    if (startDate && endDate) {
      where.date = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    } else if (startDate) {
      where.date = { gte: new Date(startDate) };
    } else if (endDate) {
      where.date = { lte: new Date(endDate) };
    }

    if (contentType) {
      where.contentType = contentType;
    }

    const skip = (page - 1) * limit;

    const [records, total] = await Promise.all([
      prisma.usageRecord.findMany({
        where,
        orderBy: { date: "desc" },
        skip,
        take: limit,
        include: {
          account: {
            select: {
              service: true,
              accountName: true,
            },
          },
        },
      }),
      prisma.usageRecord.count({ where }),
    ]);

    return createSuccessResponse({
      records,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return handleApiError(error, "获取使用记录列表");
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig);
    if (!session?.user?.id) {
      return createValidationErrorResponse({ auth: "未授权访问" });
    }

    const body = await request.json();
    const validatedFields = CreateUsageRecordSchema.safeParse(body);

    if (!validatedFields.success) {
      return createValidationErrorResponse(validatedFields.error.format());
    }

    const {
      accountId,
      date,
      duration,
      episodeCount,
      dataUsage,
      contentType,
      genre,
      quality,
    } = validatedFields.data;

    // 检查账户是否存在且属于当前用户
    const account = await prisma.streamingAccount.findUnique({
      where: {
        id: accountId,
        userId: session.user.id,
      },
    });

    if (!account) {
      return createValidationErrorResponse({ accountId: "流媒体账户不存在" });
    }

    // 检查是否已存在相同日期的记录
    const existingRecord = await prisma.usageRecord.findUnique({
      where: {
        accountId_date: {
          accountId,
          date: new Date(date),
        },
      },
    });

    if (existingRecord) {
      return createValidationErrorResponse({
        date: "该日期已存在使用记录",
      });
    }

    const record = await prisma.usageRecord.create({
      data: {
        userId: session.user.id,
        accountId,
        date: new Date(date),
        duration,
        episodeCount,
        dataUsage,
        contentType,
        genre,
        quality,
      },
      include: {
        account: {
          select: {
            service: true,
            accountName: true,
          },
        },
      },
    });

    return createSuccessResponse({
      message: "使用记录创建成功",
      record,
    });
  } catch (error) {
    return handleApiError(error, "创建使用记录");
  }
}
