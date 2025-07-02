import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import {
  handleApiError,
  createSuccessResponse,
  createValidationErrorResponse,
} from "@/lib/api-utils";

// 检查邮箱 schema
const CheckEmailSchema = z.object({
  email: z.string().email({ message: "请输入有效的邮箱地址" }).toLowerCase(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // 验证输入数据
    const validatedFields = CheckEmailSchema.safeParse(body);

    if (!validatedFields.success) {
      return createValidationErrorResponse(validatedFields.error.format());
    }

    const { email } = validatedFields.data;

    // 检查用户是否已存在
    const existingUser = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true },
    });

    return createSuccessResponse({
      exists: !!existingUser,
      email: email,
      message: existingUser ? "该邮箱已被注册" : "邮箱可以使用",
    });
  } catch (error) {
    return handleApiError(error, "检查邮箱");
  }
}
