import { NextRequest } from "next/server";
import { queryBandwidthData } from "@/lib/influxdb";
import { handleApiError, createSuccessResponse } from "@/lib/api-utils";
import dayjs from "dayjs";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // 1. 直接获取所有参数
    const page = parseInt(searchParams.get("page") || "1", 10);
    const pageSize = parseInt(searchParams.get("pageSize") || "20", 10);
    const sortField = searchParams.get("sortField") || "time";
    const sortOrder = searchParams.get("sortOrder") || "descend";
    const granularity = searchParams.get("granularity") || "5min";

    const project = searchParams.get("project") || undefined;
    const domain = searchParams.get("domain") || undefined;
    const region = searchParams.get("region") || undefined;
    const tag = searchParams.get("tag") || undefined;

    // 2. 直接获取时间参数，并提供可靠的默认值
    let startTime = searchParams.get("startTime");
    let endTime = searchParams.get("endTime");

    if (
      !startTime ||
      !endTime ||
      !dayjs(startTime).isValid() ||
      !dayjs(endTime).isValid()
    ) {
      const now = dayjs();
      startTime = now.subtract(1, "day").toISOString();
      endTime = now.toISOString();
    }

    // 3. 调用核心查询函数
    const { data, total } = await queryBandwidthData({
      startTime,
      endTime,
      page,
      pageSize,
      filters: { project, domain, region, tag },
      sort: { field: sortField, order: sortOrder },
      granularity,
    });

    return createSuccessResponse({
      data,
      total,
    });
  } catch (error) {
    console.error("API 错误:", error);
    return handleApiError(error, "查询带宽数据失败");
  }
}
