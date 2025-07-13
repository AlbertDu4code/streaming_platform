import { NextRequest } from "next/server";
import { writeApi, influxDB } from "@/lib/influxdb";
import { Point } from "@influxdata/influxdb-client";
import { handleApiError, createSuccessResponse } from "@/lib/api-utils";

const INFLUX_BUCKET = process.env.INFLUX_BUCKET || "usage-data";
const INFLUX_ORG = process.env.INFLUX_ORG || "streaming-org";

// 生成随机数据的辅助函数
function generateRandomData(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

function generateRandomString(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).substring(7)}`;
}

// 验证InfluxDB连接
async function verifyInfluxConnection(): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    console.log("开始验证InfluxDB连接...");

    // 检查环境变量
    const requiredEnvVars = [
      "INFLUX_URL",
      "INFLUX_TOKEN",
      "INFLUX_ORG",
      "INFLUX_BUCKET",
    ];
    const missingVars = requiredEnvVars.filter(
      (varName) => !process.env[varName]
    );

    if (missingVars.length > 0) {
      return {
        success: false,
        error: `缺少环境变量: ${missingVars.join(", ")}`,
      };
    }

    // 测试健康检查
    const healthApi = influxDB.getHealthApi();
    const health = await healthApi.getHealth();

    if (health.status !== "pass") {
      return {
        success: false,
        error: `InfluxDB健康检查失败: ${health.message}`,
      };
    }

    console.log("InfluxDB连接验证成功");
    return { success: true };
  } catch (error) {
    console.error("InfluxDB连接验证失败:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "连接验证失败",
    };
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log("开始数据初始化...");

    // 验证InfluxDB连接
    const connectionCheck = await verifyInfluxConnection();
    if (!connectionCheck.success) {
      return createSuccessResponse({
        success: false,
        error: "InfluxDB连接失败",
        details: connectionCheck.error,
        debug: {
          url: process.env.INFLUX_URL,
          org: process.env.INFLUX_ORG,
          bucket: process.env.INFLUX_BUCKET,
          tokenExists: !!process.env.INFLUX_TOKEN,
        },
      });
    }

    const points: Point[] = [];
    const now = new Date();

    console.log("生成带宽数据...");
    // 生成带宽数据
    for (let i = 0; i < 100; i++) {
      const time = new Date(now.getTime() - i * 5 * 60 * 1000); // 每5分钟一条数据
      const point = new Point("bandwidth_usage")
        .tag("project", `电影《星际穿越》4K.mp4`)
        .tag("domain", "cdn.example.com")
        .tag("region", "china")
        .tag("tag", "电影")
        .floatField("upload", generateRandomData(10, 100))
        .floatField("download", generateRandomData(50, 200))
        .timestamp(time);
      points.push(point);
    }

    console.log("生成推流数据...");
    // 生成推流数据
    for (let i = 0; i < 50; i++) {
      const time = new Date(now.getTime() - i * 10 * 60 * 1000);
      const point = new Point("streaming_data")
        .tag("id", `stream_${i + 1}`)
        .tag("streamName", generateRandomString("stream"))
        .tag("type", Math.random() > 0.5 ? "推流" : "拉流")
        .tag("domain", "cdn.example.com")
        .tag("region", "china")
        .floatField("bandwidth", generateRandomData(5, 50))
        .floatField("duration", generateRandomData(1000, 10000))
        .intField("viewers", Math.floor(generateRandomData(10, 1000)))
        .tag("status", Math.random() > 0.3 ? "active" : "ended")
        .tag("startTime", time.toISOString())
        .timestamp(time);
      points.push(point);
    }

    console.log("生成存储数据...");
    // 生成存储数据
    for (let i = 0; i < 40; i++) {
      const time = new Date(now.getTime() - i * 15 * 60 * 1000);
      const point = new Point("storage_usage")
        .tag("id", `storage_${i + 1}`)
        .tag("project", `电影《星际穿越》4K.mp4`)
        .tag("domain", "cdn.example.com")
        .floatField("size", generateRandomData(1000, 50000))
        .tag("unit", "GB")
        .timestamp(time);
      points.push(point);
    }

    console.log("生成直播流数据...");
    // 生成直播流数据
    for (let i = 0; i < 30; i++) {
      const time = new Date(now.getTime() - i * 20 * 60 * 1000);
      const point = new Point("live_stream_data")
        .tag("id", `live_${i + 1}`)
        .tag("streamName", generateRandomString("live"))
        .tag("type", "推流")
        .tag("domain", "cdn.example.com")
        .tag("region", "china")
        .floatField("bandwidth", generateRandomData(10, 60))
        .intField("viewers", Math.floor(generateRandomData(50, 2000)))
        .tag("status", Math.random() > 0.2 ? "active" : "ended")
        .tag("startTime", time.toISOString())
        .timestamp(time);
      points.push(point);
    }

    console.log("生成转码时长数据...");
    // 生成转码时长数据
    for (let i = 0; i < 25; i++) {
      const time = new Date(now.getTime() - i * 30 * 60 * 1000);
      const point = new Point("transcode_duration")
        .tag("id", `transcode_${i + 1}`)
        .tag("streamName", generateRandomString("transcode"))
        .intField("duration", Math.floor(generateRandomData(300, 3600)))
        .tag("format", Math.random() > 0.5 ? "H.264" : "H.265")
        .tag(
          "resolution",
          ["720p", "1080p", "4K"][Math.floor(Math.random() * 3)]
        )
        .timestamp(time);
      points.push(point);
    }

    console.log("生成截图数据...");
    // 生成截图数据
    for (let i = 0; i < 25; i++) {
      const time = new Date(now.getTime() - i * 30 * 60 * 1000);
      const point = new Point("screenshot_data")
        .tag("id", `screenshot_${i + 1}`)
        .tag("streamName", generateRandomString("screenshot"))
        .intField("count", Math.floor(generateRandomData(10, 100)))
        .tag("format", Math.random() > 0.5 ? "JPEG" : "PNG")
        .intField("interval", Math.floor(generateRandomData(5, 60)))
        .timestamp(time);
      points.push(point);
    }

    console.log("生成拉流转推数据...");
    // 生成拉流转推数据
    for (let i = 0; i < 20; i++) {
      const time = new Date(now.getTime() - i * 45 * 60 * 1000);
      const point = new Point("push_stream_data")
        .tag("id", `push_${i + 1}`)
        .tag("streamName", generateRandomString("push"))
        .tag("sourceUrl", `rtmp://source${i + 1}.example.com/live/stream`)
        .tag("targetUrl", `rtmp://target${i + 1}.example.com/live/stream`)
        .tag("status", Math.random() > 0.1 ? "active" : "ended")
        .timestamp(time);
      points.push(point);
    }

    console.log("生成转推带宽数据...");
    // 生成转推带宽数据
    for (let i = 0; i < 30; i++) {
      const time = new Date(now.getTime() - i * 25 * 60 * 1000);
      const point = new Point("transcode_bandwidth")
        .tag("id", `transcode_bw_${i + 1}`)
        .tag("streamName", generateRandomString("transcode_bw"))
        .floatField("bandwidth", generateRandomData(15, 75))
        .tag("format", Math.random() > 0.5 ? "H.264" : "H.265")
        .tag(
          "resolution",
          ["720p", "1080p", "4K"][Math.floor(Math.random() * 3)]
        )
        .timestamp(time);
      points.push(point);
    }

    console.log("生成直播带宽数据...");
    // 生成直播带宽数据
    for (let i = 0; i < 35; i++) {
      const time = new Date(now.getTime() - i * 18 * 60 * 1000);
      const point = new Point("direct_bandwidth")
        .tag("id", `direct_${i + 1}`)
        .tag("streamName", generateRandomString("direct"))
        .floatField("bandwidth", generateRandomData(20, 100))
        .intField("viewers", Math.floor(generateRandomData(100, 3000)))
        .tag("status", Math.random() > 0.15 ? "active" : "ended")
        .timestamp(time);
      points.push(point);
    }

    console.log("生成云导播数据...");
    // 生成云导播数据
    for (let i = 0; i < 15; i++) {
      const time = new Date(now.getTime() - i * 60 * 60 * 1000);
      const point = new Point("guide_data")
        .tag("id", `guide_${i + 1}`)
        .tag("guideName", generateRandomString("guide"))
        .intField("inputCount", Math.floor(generateRandomData(2, 8)))
        .intField("outputCount", Math.floor(generateRandomData(1, 4)))
        .tag("status", Math.random() > 0.1 ? "active" : "ended")
        .timestamp(time);
      points.push(point);
    }

    console.log(`准备写入 ${points.length} 个数据点...`);

    // 分批写入数据，避免超时
    const batchSize = 50;
    let writtenCount = 0;

    for (let i = 0; i < points.length; i += batchSize) {
      const batch = points.slice(i, i + batchSize);
      try {
        await writeApi.writePoints(batch);
        writtenCount += batch.length;
        console.log(`已写入 ${writtenCount}/${points.length} 个数据点`);
      } catch (batchError) {
        console.error(`批次写入失败 (${i}-${i + batchSize}):`, batchError);
        throw batchError;
      }
    }

    // 确保数据写入完成
    await writeApi.flush();
    console.log("数据写入完成，正在刷新...");

    // 等待一下确保数据被索引
    await new Promise((resolve) => setTimeout(resolve, 1000));

    return createSuccessResponse({
      success: true,
      message: "数据初始化成功",
      count: points.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("数据初始化失败:", error);
    return handleApiError(error, "数据初始化");
  }
}
