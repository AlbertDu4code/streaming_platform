import { NextRequest } from "next/server";
import { queryBandwidthData } from "@/lib/influxdb";
import { handleApiError, createSuccessResponse } from "@/lib/api-utils";
import dayjs from "dayjs";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    console.log("接收到的完整 URL:", request.url);
    console.log("所有 searchParams:", Array.from(searchParams.entries()));

    // 分页参数
    const current = parseInt(searchParams.get("current") || "1", 10);
    const pageSize = parseInt(searchParams.get("pageSize") || "20", 10);

    // 筛选参数
    const project = searchParams.get("project") || undefined;
    const domain = searchParams.get("domain") || undefined;
    const region = searchParams.get("region") || undefined;
    const tag = searchParams.get("tag") || undefined;
    const granularity = searchParams.get("granularity") || "5min";

    // 排序参数
    const sortField = searchParams.get("sortField") || "time";
    const sortOrder = searchParams.get("sortOrder") || "descend";

    // 时间范围参数
    const dateRangeParam = searchParams.get("dateRange");
    let startTime: string;
    let endTime: string;

    console.log("接收到的原始参数:", {
      current,
      pageSize,
      project,
      domain,
      region,
      tag,
      granularity,
      sortField,
      sortOrder,
      dateRangeParam,
    });

    if (
      dateRangeParam &&
      dateRangeParam !== "undefined" &&
      dateRangeParam !== "null"
    ) {
      console.log("处理 dateRange 参数:", dateRangeParam);
      const dates = dateRangeParam.split(",");
      if (
        dates.length === 2 &&
        dates[0] !== "undefined" &&
        dates[1] !== "undefined"
      ) {
        startTime = dates[0].trim();
        endTime = dates[1].trim();
        console.log("从 dateRange 解析出的时间:", { startTime, endTime });
      } else {
        console.log("dateRange 格式无效，使用默认时间");
        endTime = dayjs().toISOString();
        startTime = dayjs().subtract(1, "day").toISOString();
      }
    } else {
      console.log("没有 dateRange 参数或参数为空，使用默认时间");
      endTime = dayjs().toISOString();
      startTime = dayjs().subtract(1, "day").toISOString();
    }

    console.log("最终使用的时间范围:", { startTime, endTime });

    // 验证时间格式
    if (!dayjs(startTime).isValid() || !dayjs(endTime).isValid()) {
      console.error("无效的时间格式:", { startTime, endTime });
      // 使用默认时间
      endTime = dayjs().toISOString();
      startTime = dayjs().subtract(1, "day").toISOString();
      console.log("使用默认时间替代:", { startTime, endTime });
    }

    const { data, total } = await queryBandwidthData({
      startTime,
      endTime,
      page: current,
      pageSize,
      filters: { project, domain, region, tag },
      sort: { field: sortField, order: sortOrder },
      granularity,
    });

    return createSuccessResponse({
      data,
      total,
      success: true,
    });
  } catch (error) {
    console.error("API 错误:", error);
    return handleApiError(error, "查询带宽数据失败");
  }
}
