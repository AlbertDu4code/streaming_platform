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

// 更新预算 schema
const UpdateBudgetSchema = z.object({
  name: z.string().min(1, { message: "预算名称不能为空" }).optional(),
  amount: z.number().min(0.01, { message: "预算金额必须大于0" }).optional(),
  currency: z.string().optional(),
  period: z
    .enum(["MONTHLY", "YEARLY"], { message: "预算周期必须是MONTHLY或YEARLY" })
    .optional(),
  services: z.string().optional(), // JSON数组字符串
  startDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, { message: "开始日期格式不正确" })
    .optional(),
  endDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, { message: "结束日期格式不正确" })
    .optional(),
  alertAt50: z.boolean().optional(),
  alertAt80: z.boolean().optional(),
  alertAt100: z.boolean().optional(),
  isActive: z.boolean().optional(),
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

    const budget = await prisma.budget.findUnique({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    });

    if (!budget) {
      return createValidationErrorResponse({ id: "预算不存在" });
    }

    return createSuccessResponse(budget);
  } catch (error) {
    return handleApiError(error, "获取预算详情");
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
    const validatedFields = UpdateBudgetSchema.safeParse(body);

    if (!validatedFields.success) {
      return createValidationErrorResponse(validatedFields.error.format());
    }

    const {
      name,
      amount,
      currency,
      period,
      services,
      startDate,
      endDate,
      alertAt50,
      alertAt80,
      alertAt100,
      isActive,
    } = validatedFields.data;

    // 检查预算是否存在
    const existingBudget = await prisma.budget.findUnique({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    });

    if (!existingBudget) {
      return createValidationErrorResponse({ id: "预算不存在" });
    }

    // 验证日期逻辑
    let start = existingBudget.startDate;
    let end = existingBudget.endDate;

    if (startDate) {
      start = new Date(startDate);
    }
    if (endDate) {
      end = new Date(endDate);
    }

    if (end && start >= end) {
      return createValidationErrorResponse({
        endDate: "结束日期必须晚于开始日期",
      });
    }

    // 验证services JSON格式
    let parsedServices = existingBudget.services;
    if (services !== undefined) {
      if (services === null) {
        parsedServices = null;
      } else {
        try {
          const parsed = JSON.parse(services);
          if (!Array.isArray(parsed)) {
            return createValidationErrorResponse({
              services: "服务列表必须是数组格式",
            });
          }
          parsedServices = services;
        } catch {
          return createValidationErrorResponse({
            services: "服务列表JSON格式不正确",
          });
        }
      }
    }

    const budget = await prisma.budget.update({
      where: {
        id: params.id,
        userId: session.user.id,
      },
      data: {
        name,
        amount,
        currency,
        period,
        services: parsedServices,
        startDate: start,
        endDate: end,
        alertAt50,
        alertAt80,
        alertAt100,
        isActive,
      },
    });

    return createSuccessResponse({
      message: "预算更新成功",
      budget,
    });
  } catch (error) {
    return handleApiError(error, "更新预算");
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

    // 检查预算是否存在
    const existingBudget = await prisma.budget.findUnique({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    });

    if (!existingBudget) {
      return createValidationErrorResponse({ id: "预算不存在" });
    }

    await prisma.budget.delete({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    });

    return createSuccessResponse({ message: "预算删除成功" });
  } catch (error) {
    return handleApiError(error, "删除预算");
  }
}
