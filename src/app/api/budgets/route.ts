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

// 创建预算 schema
const CreateBudgetSchema = z.object({
  name: z.string().min(1, { message: "预算名称不能为空" }),
  amount: z.number().min(0.01, { message: "预算金额必须大于0" }),
  currency: z.string().default("CNY"),
  period: z.enum(["MONTHLY", "YEARLY"], {
    message: "预算周期必须是MONTHLY或YEARLY",
  }),
  services: z.string().optional(), // JSON数组字符串
  startDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, { message: "开始日期格式不正确" }),
  endDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, { message: "结束日期格式不正确" })
    .optional(),
  alertAt50: z.boolean().default(true),
  alertAt80: z.boolean().default(true),
  alertAt100: z.boolean().default(true),
});

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig);
    if (!session?.user?.id) {
      return createValidationErrorResponse({ auth: "未授权访问" });
    }

    const { searchParams } = new URL(request.url);
    const isActive = searchParams.get("isActive");
    const period = searchParams.get("period");

    const where: any = { userId: session.user.id };

    if (isActive !== null) {
      where.isActive = isActive === "true";
    }

    if (period) {
      where.period = period;
    }

    const budgets = await prisma.budget.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    return createSuccessResponse(budgets);
  } catch (error) {
    return handleApiError(error, "获取预算列表");
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig);
    if (!session?.user?.id) {
      return createValidationErrorResponse({ auth: "未授权访问" });
    }

    const body = await request.json();
    const validatedFields = CreateBudgetSchema.safeParse(body);

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
    } = validatedFields.data;

    // 验证日期逻辑
    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : null;

    if (end && start >= end) {
      return createValidationErrorResponse({
        endDate: "结束日期必须晚于开始日期",
      });
    }

    // 验证services JSON格式
    let parsedServices = null;
    if (services) {
      try {
        parsedServices = JSON.parse(services);
        if (!Array.isArray(parsedServices)) {
          return createValidationErrorResponse({
            services: "服务列表必须是数组格式",
          });
        }
      } catch {
        return createValidationErrorResponse({
          services: "服务列表JSON格式不正确",
        });
      }
    }

    const budget = await prisma.budget.create({
      data: {
        userId: session.user.id,
        name,
        amount,
        currency,
        period,
        services: parsedServices ? JSON.stringify(parsedServices) : null,
        startDate: start,
        endDate: end,
        alertAt50,
        alertAt80,
        alertAt100,
      },
    });

    return createSuccessResponse({
      message: "预算创建成功",
      budget,
    });
  } catch (error) {
    return handleApiError(error, "创建预算");
  }
}
