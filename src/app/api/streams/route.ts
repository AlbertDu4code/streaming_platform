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

// 创建直播流 schema
const CreateStreamSchema = z.object({
  streamName: z.string().min(1, { message: "流名称不能为空" }),
  streamType: z.enum(["push", "pull"], { message: "流类型必须是push或pull" }),
  domain: z.string().min(1, { message: "域名不能为空" }),
  region: z.string().min(1, { message: "区域不能为空" }),
  resolution: z.string().min(1, { message: "分辨率不能为空" }),
  bitrate: z.number().min(100).max(10000),
  frameRate: z.number().min(1).max(60),
});

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig);
    if (!session?.user?.id) {
      return createValidationErrorResponse({ auth: "未授权访问" });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const streamType = searchParams.get("streamType");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    const where: any = { userId: session.user.id };

    if (status) {
      where.status = status;
    }

    if (streamType) {
      where.streamType = streamType;
    }

    const skip = (page - 1) * limit;

    const [streams, total] = await Promise.all([
      prisma.liveStream.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.liveStream.count({ where }),
    ]);

    return createSuccessResponse({
      streams,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return handleApiError(error, "获取直播流列表");
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig);
    if (!session?.user?.id) {
      return createValidationErrorResponse({ auth: "未授权访问" });
    }

    const body = await request.json();
    const validatedFields = CreateStreamSchema.safeParse(body);

    if (!validatedFields.success) {
      return createValidationErrorResponse(validatedFields.error.format());
    }

    const {
      streamName,
      streamType,
      domain,
      region,
      resolution,
      bitrate,
      frameRate,
    } = validatedFields.data;

    // 检查是否已存在相同名称的直播流
    const existingStream = await prisma.liveStream.findFirst({
      where: {
        userId: session.user.id,
        streamName,
      },
    });

    if (existingStream) {
      return createValidationErrorResponse({
        streamName: "已存在相同名称的直播流",
      });
    }

    const stream = await prisma.liveStream.create({
      data: {
        userId: session.user.id,
        streamName,
        streamType,
        domain,
        region,
        resolution,
        bitrate,
        frameRate,
        status: "inactive", // 默认状态为未激活
      },
    });

    return createSuccessResponse({
      message: "直播流创建成功",
      stream,
    });
  } catch (error) {
    return handleApiError(error, "创建直播流");
  }
}
