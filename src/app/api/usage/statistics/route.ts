import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth/config";
import { prisma } from "@/lib/db/prisma";
import {
  handleApiError,
  createSuccessResponse,
  createValidationErrorResponse,
} from "@/lib/api-utils";

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
    const period = searchParams.get("period") || "month"; // day, week, month, year

    const where: any = { userId: session.user.id };

    if (accountId) {
      where.accountId = accountId;
    }

    if (startDate && endDate) {
      where.date = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    } else {
      // 默认查询最近30天
      const end = new Date();
      const start = new Date();
      start.setDate(start.getDate() - 30);
      where.date = { gte: start, lte: end };
    }

    // 基础统计数据
    const [totalStats, serviceStats, contentTypeStats, dailyStats] =
      await Promise.all([
        // 总体统计
        prisma.usageRecord.aggregate({
          where,
          _sum: {
            duration: true,
            episodeCount: true,
            dataUsage: true,
          },
          _count: true,
        }),

        // 按服务统计
        prisma.usageRecord.groupBy({
          by: ["accountId"],
          where,
          _sum: {
            duration: true,
            episodeCount: true,
            dataUsage: true,
          },
          _count: true,
        }),

        // 按内容类型统计
        prisma.usageRecord.groupBy({
          by: ["contentType"],
          where,
          _sum: {
            duration: true,
            episodeCount: true,
            dataUsage: true,
          },
          _count: true,
        }),

        // 按日期统计
        prisma.usageRecord.groupBy({
          by: ["date"],
          where,
          _sum: {
            duration: true,
            episodeCount: true,
            dataUsage: true,
          },
          _count: true,
          orderBy: { date: "asc" },
        }),
      ]);

    // 获取账户信息用于服务统计
    const accountIds = serviceStats.map((stat) => stat.accountId);
    const accounts = await prisma.streamingAccount.findMany({
      where: { id: { in: accountIds } },
      select: { id: true, service: true, accountName: true },
    });

    const accountMap = new Map(accounts.map((acc) => [acc.id, acc]));

    // 格式化服务统计
    const formattedServiceStats = serviceStats.map((stat) => ({
      accountId: stat.accountId,
      service: accountMap.get(stat.accountId)?.service,
      accountName: accountMap.get(stat.accountId)?.accountName,
      totalDuration: stat._sum.duration || 0,
      totalEpisodes: stat._sum.episodeCount || 0,
      totalDataUsage: stat._sum.dataUsage || 0,
      recordCount: stat._count,
    }));

    // 格式化内容类型统计
    const formattedContentTypeStats = contentTypeStats
      .filter((stat) => stat.contentType)
      .map((stat) => ({
        contentType: stat.contentType!,
        totalDuration: stat._sum.duration || 0,
        totalEpisodes: stat._sum.episodeCount || 0,
        totalDataUsage: stat._sum.dataUsage || 0,
        recordCount: stat._count,
      }))
      .sort((a, b) => b.totalDuration - a.totalDuration);

    // 格式化每日统计
    const formattedDailyStats = dailyStats.map((stat) => ({
      date: stat.date,
      totalDuration: stat._sum.duration || 0,
      totalEpisodes: stat._sum.episodeCount || 0,
      totalDataUsage: stat._sum.dataUsage || 0,
      recordCount: stat._count,
    }));

    // 计算平均值
    const totalDays = formattedDailyStats.length;
    const averageDurationPerDay =
      totalDays > 0 ? Number(totalStats._sum.duration || 0) / totalDays : 0;
    const averageEpisodesPerDay =
      totalDays > 0 ? Number(totalStats._sum.episodeCount || 0) / totalDays : 0;
    const averageDataUsagePerDay =
      totalDays > 0 ? Number(totalStats._sum.dataUsage || 0) / totalDays : 0;

    // 最受欢迎的内容类型
    const mostWatchedContentType =
      formattedContentTypeStats[0]?.contentType || "未知";

    return createSuccessResponse({
      summary: {
        totalDuration: totalStats._sum.duration || 0,
        totalEpisodes: totalStats._sum.episodeCount || 0,
        totalDataUsage: totalStats._sum.dataUsage || 0,
        totalRecords: totalStats._count,
        averageDurationPerDay,
        averageEpisodesPerDay,
        averageDataUsagePerDay,
        mostWatchedContentType,
      },
      serviceStats: formattedServiceStats,
      contentTypeStats: formattedContentTypeStats,
      dailyStats: formattedDailyStats,
    });
  } catch (error) {
    return handleApiError(error, "获取使用统计");
  }
}
