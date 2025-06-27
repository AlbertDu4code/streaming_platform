import { NextRequest } from "next/server";
import { queryApi } from "@/lib/influxdb";
import {
  handleApiError,
  createSuccessResponse,
  createValidationErrorResponse,
  buildInfluxQuery,
  validateRequiredParams,
  handleInfluxQueryError,
} from "@/lib/api-utils";

const INFLUX_BUCKET = process.env.INFLUX_BUCKET || "usage-data";

// 统一的查询逻辑
async function queryFilterOptions(
  columnName: string,
  startTime: string,
  endTime: string,
  labelPrefix: string
) {
  const query = buildInfluxQuery(
    INFLUX_BUCKET,
    "bandwidth_usage",
    startTime,
    endTime,
    columnName,
    columnName
  );

  const options = [];

  try {
    for await (const { values, tableMeta } of queryApi.iterateRows(query)) {
      const obj = tableMeta.toObject(values);
      const value = obj[columnName]
        ? obj[columnName].replace(/^"|"$/g, "")
        : "";
      if (value && value !== "unknown") {
        options.push({ label: value, value: value });
      }
    }
  } catch (error) {
    handleInfluxQueryError(error, `${labelPrefix}列表`);
    return [{ label: labelPrefix, value: "all" }];
  }

  return [{ label: labelPrefix, value: "all" }, ...options];
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");
    const startTime = searchParams.get("startTime") || "-7d";
    const endTime = searchParams.get("endTime") || "now()";

    // 验证必需参数
    const validationError = validateRequiredParams(searchParams, ["type"]);
    if (validationError) {
      return createValidationErrorResponse({ type: validationError });
    }

    const validTypes = ["bandwidth", "streaming", "filters", "projects"];
    if (!validTypes.includes(type!)) {
      return createValidationErrorResponse({
        type: `不支持的type参数: ${type}。支持的类型: ${validTypes.join(", ")}`,
      });
    }

    switch (type) {
      case "bandwidth": {
        const project = searchParams.get("project");
        const domain = searchParams.get("domain");
        const region = searchParams.get("region");
        const tag = searchParams.get("tag");
        const stats = searchParams.get("stats") === "true";
        const granularity = searchParams.get("granularity") || "5min";

        const filters = {
          project: project || undefined,
          domain: domain || undefined,
          region: region || undefined,
          tag: tag || undefined,
        };

        if (stats) {
          const { getBandwidthStats } = await import("@/lib/influxdb");
          const statsData = await getBandwidthStats(
            startTime,
            endTime,
            filters
          );
          return createSuccessResponse(statsData);
        } else {
          const { queryBandwidthData } = await import("@/lib/influxdb");
          const data = await queryBandwidthData(
            startTime,
            endTime,
            filters,
            granularity
          );
          return createSuccessResponse(data);
        }
      }

      case "streaming": {
        const limit = parseInt(searchParams.get("limit") || "500");
        const { queryStreamingData } = await import("@/lib/influxdb");

        // 添加超时控制
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error("查询超时")), 10000);
        });

        const dataPromise = queryStreamingData(startTime, endTime, limit);

        try {
          const data = (await Promise.race([
            dataPromise,
            timeoutPromise,
          ])) as any[];
          return createSuccessResponse(data);
        } catch (error) {
          console.error("推流数据查询失败:", error);
          return createSuccessResponse([]);
        }
      }

      case "filters": {
        const filterType = searchParams.get("filterType");
        if (!filterType) {
          return createValidationErrorResponse({
            filterType: "缺少filterType参数",
          });
        }

        const validFilterTypes = ["tags", "domains", "regions"];
        if (!validFilterTypes.includes(filterType)) {
          return createValidationErrorResponse({
            filterType: `不支持的filterType参数: ${filterType}。支持的类型: ${validFilterTypes.join(", ")}`,
          });
        }

        const columnMap = {
          tags: { column: "tag", label: "全部标签" },
          domains: { column: "domain", label: "全部域名" },
          regions: { column: "region", label: "全部区域" },
        };

        const { column, label } =
          columnMap[filterType as keyof typeof columnMap];
        const result = await queryFilterOptions(
          column,
          startTime,
          endTime,
          label
        );
        return createSuccessResponse(result);
      }

      case "projects": {
        const result = await queryFilterOptions(
          "project",
          startTime,
          endTime,
          "全部项目"
        );
        return createSuccessResponse(result);
      }

      default:
        return createValidationErrorResponse({
          type: `未处理的type参数: ${type}`,
        });
    }
  } catch (error) {
    return handleApiError(error, "数据查询");
  }
}
