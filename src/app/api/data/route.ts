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

const INFLUX_BUCKET = process.env.INFLUX_BUCKET || "streaming-data";

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

    console.log("🔍 /api/data 接收到请求:");
    console.log("- type:", type);
    console.log("- startTime:", startTime);
    console.log("- endTime:", endTime);
    console.log("- 所有参数:", Array.from(searchParams.entries()));

    // 验证必需参数
    const validationError = validateRequiredParams(searchParams, ["type"]);
    if (validationError) {
      return createValidationErrorResponse({ type: validationError });
    }

    const validTypes = [
      "bandwidth",
      "streaming",
      "filters",
      "projects",
      "storage",
      "live",
      "duration",
      "screenshot",
      "push",
      "transcode",
      "direct",
      "guide",
    ];
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
          const { queryBandwidthDataLegacy } = await import("@/lib/influxdb");
          const data = await queryBandwidthDataLegacy(
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

      case "live": {
        const limit = parseInt(searchParams.get("limit") || "100");
        const { queryLiveStreamData } = await import("@/lib/influxdb");
        try {
          const data = await queryLiveStreamData(startTime, endTime, limit);
          return createSuccessResponse(data);
        } catch (error) {
          console.error("直播流数据查询失败:", error);
          return createSuccessResponse([]);
        }
      }

      case "duration": {
        const limit = parseInt(searchParams.get("limit") || "100");
        const { queryTranscodeDurationData } = await import("@/lib/influxdb");
        try {
          const data = await queryTranscodeDurationData(
            startTime,
            endTime,
            limit
          );
          return createSuccessResponse(data);
        } catch (error) {
          console.error("转码时长数据查询失败:", error);
          return createSuccessResponse([]);
        }
      }

      case "screenshot": {
        const limit = parseInt(searchParams.get("limit") || "100");
        const { queryScreenshotData } = await import("@/lib/influxdb");
        try {
          const data = await queryScreenshotData(startTime, endTime, limit);
          return createSuccessResponse(data);
        } catch (error) {
          console.error("截图数据查询失败:", error);
          return createSuccessResponse([]);
        }
      }

      case "push": {
        const limit = parseInt(searchParams.get("limit") || "100");
        const { queryPushStreamData } = await import("@/lib/influxdb");
        try {
          const data = await queryPushStreamData(startTime, endTime, limit);
          return createSuccessResponse(data);
        } catch (error) {
          console.error("拉流转推数据查询失败:", error);
          return createSuccessResponse([]);
        }
      }

      case "transcode": {
        const limit = parseInt(searchParams.get("limit") || "100");
        const { queryTranscodeBandwidthData } = await import("@/lib/influxdb");
        try {
          const data = await queryTranscodeBandwidthData(
            startTime,
            endTime,
            limit
          );
          return createSuccessResponse(data);
        } catch (error) {
          console.error("转推带宽数据查询失败:", error);
          return createSuccessResponse([]);
        }
      }

      case "direct": {
        const limit = parseInt(searchParams.get("limit") || "100");
        const { queryDirectBandwidthData } = await import("@/lib/influxdb");
        try {
          const data = await queryDirectBandwidthData(
            startTime,
            endTime,
            limit
          );
          return createSuccessResponse(data);
        } catch (error) {
          console.error("直播带宽数据查询失败:", error);
          return createSuccessResponse([]);
        }
      }

      case "guide": {
        const limit = parseInt(searchParams.get("limit") || "100");
        const { queryGuideData } = await import("@/lib/influxdb");
        try {
          const data = await queryGuideData(startTime, endTime, limit);
          return createSuccessResponse(data);
        } catch (error) {
          console.error("云导播数据查询失败:", error);
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

      case "storage": {
        const limit = parseInt(searchParams.get("limit") || "500");
        const { queryStorageData } = await import("@/lib/influxdb");
        try {
          const data = await queryStorageData(limit);
          return createSuccessResponse(data);
        } catch (error) {
          console.error("存储用量查询失败:", error);
          return createSuccessResponse([]);
        }
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
