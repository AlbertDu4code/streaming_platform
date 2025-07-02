import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth/config";
import { prisma } from "@/lib/db/prisma";
import {
  handleApiError,
  createSuccessResponse,
  createValidationErrorResponse,
} from "@/lib/api-utils";

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authConfig);
    if (!session?.user?.id) {
      return createValidationErrorResponse({ auth: "未授权访问" });
    }
    const { status } = await request.json();
    if (!["active", "inactive", "error"].includes(status)) {
      return createValidationErrorResponse({ status: "状态不合法" });
    }
    const stream = await prisma.liveStream.update({
      where: { id: params.id, userId: session.user.id },
      data: { status },
    });
    return createSuccessResponse({ message: "状态切换成功", stream });
  } catch (error) {
    return handleApiError(error, "切换直播流状态");
  }
}
