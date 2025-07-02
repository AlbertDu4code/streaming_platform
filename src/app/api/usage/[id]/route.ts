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

// 更新使用记录 schema
const UpdateUsageRecordSchema = z.object({
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, { message: "日期格式不正确" })
    .optional(),
  duration: z.number().min(1, { message: "使用时长必须大于0" }).optional(),
  episodeCount: z.number().min(0).optional(),
  dataUsage: z.number().min(0).optional(),
  contentType: z.string().optional(),
  genre: z.string().optional(),
  quality: z.string().optional(),
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

    const record = await prisma.usageRecord.findUnique({
      where: {
        id: params.id,
        userId: session.user.id,
      },
      include: {
        account: {
          select: {
            service: true,
            accountName: true,
            isActive: true,
          },
        },
      },
    });

    if (!record) {
      return createValidationErrorResponse({ id: "使用记录不存在" });
    }

    return createSuccessResponse(record);
  } catch (error) {
    return handleApiError(error, "获取使用记录详情");
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
    const validatedFields = UpdateUsageRecordSchema.safeParse(body);

    if (!validatedFields.success) {
      return createValidationErrorResponse(validatedFields.error.format());
    }

    const {
      date,
      duration,
      episodeCount,
      dataUsage,
      contentType,
      genre,
      quality,
    } = validatedFields.data;

    // 检查记录是否存在
    const existingRecord = await prisma.usageRecord.findUnique({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    });

    if (!existingRecord) {
      return createValidationErrorResponse({ id: "使用记录不存在" });
    }

    // 如果更新了日期，检查是否与其他记录冲突
    if (date && date !== existingRecord.date.toISOString().split("T")[0]) {
      const conflictRecord = await prisma.usageRecord.findUnique({
        where: {
          accountId_date: {
            accountId: existingRecord.accountId,
            date: new Date(date),
          },
        },
      });

      if (conflictRecord && conflictRecord.id !== params.id) {
        return createValidationErrorResponse({
          date: "该日期已存在使用记录",
        });
      }
    }

    const record = await prisma.usageRecord.update({
      where: {
        id: params.id,
        userId: session.user.id,
      },
      data: {
        date: date ? new Date(date) : undefined,
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
      message: "使用记录更新成功",
      record,
    });
  } catch (error) {
    return handleApiError(error, "更新使用记录");
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

    // 检查记录是否存在
    const existingRecord = await prisma.usageRecord.findUnique({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    });

    if (!existingRecord) {
      return createValidationErrorResponse({ id: "使用记录不存在" });
    }

    await prisma.usageRecord.delete({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    });

    return createSuccessResponse({ message: "使用记录删除成功" });
  } catch (error) {
    return handleApiError(error, "删除使用记录");
  }
}
