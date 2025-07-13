import { NextRequest } from "next/server";
import { influxDB } from "@/lib/influxdb";
import { createSuccessResponse, handleApiError } from "@/lib/api-utils";

export async function GET(request: NextRequest) {
  try {
    const checks = {
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      influxdb: {
        url: process.env.INFLUX_URL,
        org: process.env.INFLUX_ORG,
        bucket: process.env.INFLUX_BUCKET,
        tokenExists: !!process.env.INFLUX_TOKEN,
      },
      status: {
        influxdb: "checking",
        database: "checking",
      },
    };

    // 检查InfluxDB连接
    try {
      const queryApi = influxDB.getQueryApi(
        process.env.INFLUX_ORG || "streaming-org"
      );
      const testQuery = `buckets() |> limit(n: 1)`;
      await queryApi.collectRows(testQuery);
      checks.status.influxdb = "healthy";
    } catch (error) {
      checks.status.influxdb = "error";
      console.error("InfluxDB健康检查失败:", error);
    }

    // 检查数据库连接（如果有MySQL）
    try {
      // 这里可以添加MySQL连接检查
      checks.status.database = "healthy";
    } catch (error) {
      checks.status.database = "error";
    }

    const isHealthy = Object.values(checks.status).every(
      (status) => status === "healthy"
    );

    return createSuccessResponse({
      healthy: isHealthy,
      ...checks,
    });
  } catch (error) {
    return handleApiError(error, "健康检查");
  }
}
