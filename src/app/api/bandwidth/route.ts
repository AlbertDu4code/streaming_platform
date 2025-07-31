import { NextRequest } from "next/server";
import { queryBandwidthData } from "@/lib/influxdb";
import { handleApiError, createSuccessResponse } from "@/lib/api-utils";
import dayjs from "dayjs";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // 分页参数
    const current = parseInt(searchParams.get("current") || "1", 10);
    const pageSize = parseInt(searchParams.get("pageSize") || "20", 10);

    // 筛选参数
    const project = searchParams.get("project") || undefined;
    const domain = searchParams.get("domain") || undefined;
    const region = searchParams.get("region") || undefined;
    const tag = searchParams.get("tag") || undefined;

    // 排序参数
    const sortField = searchParams.get("sortField") || "time";
    const sortOrder = searchParams.get("sortOrder") || "descend";

    // 时间范围参数
    let startTime = searchParams.get("startTime");
    let endTime = searchParams.get("endTime");

    if (!startTime || !endTime) {
      // 默认查询最近24小时
      endTime = dayjs().toISOString();
      startTime = dayjs().subtract(1, "day").toISOString();
    }

    const { data, total } = await queryBandwidthData({
      startTime,
      endTime,
      page: current,
      pageSize,
      filters: { project, domain, region, tag },
      sort: { field: sortField, order: sortOrder },
    });

    return createSuccessResponse({
      data,
      total,
      success: true,
    });
  } catch (error) {
    return handleApiError(error, "查询带宽数据失败");
  }
}
