import { NextRequest } from "next/server";
import { initializeSampleData, initializeStreamingData } from "@/lib/init-data";
import { handleApiError, createSuccessResponse } from "@/lib/api-utils";

export async function POST(request: NextRequest) {
  try {
    console.log("开始初始化InfluxDB数据...");

    // 初始化带宽数据
    await initializeSampleData();

    // 初始化推流数据
    await initializeStreamingData();

    return createSuccessResponse({
      message: "数据初始化成功",
    });
  } catch (error) {
    return handleApiError(error, "数据初始化");
  }
}
