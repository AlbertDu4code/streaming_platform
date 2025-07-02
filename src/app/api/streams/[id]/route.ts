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

// 编辑直播流 schema
const UpdateStreamSchema = z.object({
  streamName: z.string().min(1, { message: "流名称不能为空" }),
  streamType: z.enum(["push", "pull"], { message: "流类型必须是push或pull" }),
  domain: z.string().min(1, { message: "域名不能为空" }),
  region: z.string().min(1, { message: "区域不能为空" }),
  resolution: z.string().min(1, { message: "分辨率不能为空" }),
  bitrate: z.number().min(100).max(10000),
  frameRate: z.number().min(1).max(60),
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
    const stream = await prisma.liveStream.findUnique({
      where: { id: params.id, userId: session.user.id },
    });
    if (!stream) {
      return createValidationErrorResponse({ id: "直播流不存在" });
    }
    return createSuccessResponse(stream);
  } catch (error) {
    return handleApiError(error, "获取直播流详情");
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
    const validatedFields = UpdateStreamSchema.safeParse(body);
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
    const stream = await prisma.liveStream.update({
      where: { id: params.id, userId: session.user.id },
      data: {
        streamName,
        streamType,
        domain,
        region,
        resolution,
        bitrate,
        frameRate,
      },
    });
    return createSuccessResponse({ message: "直播流更新成功", stream });
  } catch (error) {
    return handleApiError(error, "更新直播流");
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
    await prisma.liveStream.delete({
      where: { id: params.id, userId: session.user.id },
    });
    return createSuccessResponse({ message: "直播流删除成功" });
  } catch (error) {
    return handleApiError(error, "删除直播流");
  }
}
