import { NextRequest } from "next/server";
import { writeApi } from "@/lib/influxdb";
import { Point } from "@influxdata/influxdb-client";
import { handleApiError, createSuccessResponse } from "@/lib/api-utils";

const INFLUX_BUCKET = process.env.INFLUX_BUCKET || "usage-data";

// 生成随机数据的辅助函数
function generateRandomData(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

function generateRandomString(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).substring(7)}`;
}

export async function POST(request: NextRequest) {
  try {
    const points: Point[] = [];
    const now = new Date();

    // 生成带宽数据
    for (let i = 0; i < 100; i++) {
      const time = new Date(now.getTime() - i * 5 * 60 * 1000); // 每5分钟一条数据
      const point = new Point("bandwidth_usage")
        .tag("project", `project_${Math.floor(Math.random() * 3) + 1}`)
        .tag("domain", `domain_${Math.floor(Math.random() * 5) + 1}`)
        .tag("region", `region_${Math.floor(Math.random() * 3) + 1}`)
        .tag("tag", `tag_${Math.floor(Math.random() * 4) + 1}`)
        .floatField("upload", generateRandomData(10, 100))
        .floatField("download", generateRandomData(50, 200))
        .timestamp(time);
      points.push(point);
    }

    // 生成推流数据
    for (let i = 0; i < 50; i++) {
      const time = new Date(now.getTime() - i * 10 * 60 * 1000);
      const point = new Point("streaming_data")
        .tag("id", `stream_${i + 1}`)
        .tag("streamName", generateRandomString("stream"))
        .tag("type", Math.random() > 0.5 ? "推流" : "拉流")
        .tag("domain", `domain_${Math.floor(Math.random() * 5) + 1}`)
        .tag("region", `region_${Math.floor(Math.random() * 3) + 1}`)
        .floatField("bandwidth", generateRandomData(5, 50))
        .floatField("duration", generateRandomData(1000, 10000))
        .intField("viewers", Math.floor(generateRandomData(10, 1000)))
        .tag("status", Math.random() > 0.3 ? "active" : "ended")
        .tag("startTime", time.toISOString())
        .timestamp(time);
      points.push(point);
    }

    // 生成存储用量数据
    for (let i = 0; i < 30; i++) {
      const time = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const point = new Point("storage_usage")
        .tag("project", `project_${Math.floor(Math.random() * 3) + 1}`)
        .tag("domain", `domain_${Math.floor(Math.random() * 5) + 1}`)
        .floatField("size", generateRandomData(100, 10000))
        .timestamp(time);
      points.push(point);
    }

    // 生成直播流数据
    for (let i = 0; i < 40; i++) {
      const time = new Date(now.getTime() - i * 15 * 60 * 1000);
      const point = new Point("live_stream_data")
        .tag("id", `live_${i + 1}`)
        .tag("streamName", generateRandomString("live"))
        .tag("type", Math.random() > 0.5 ? "推流" : "拉流")
        .tag("domain", `domain_${Math.floor(Math.random() * 5) + 1}`)
        .tag("region", `region_${Math.floor(Math.random() * 3) + 1}`)
        .floatField("bandwidth", generateRandomData(10, 80))
        .intField("viewers", Math.floor(generateRandomData(50, 2000)))
        .tag("status", Math.random() > 0.2 ? "active" : "ended")
        .tag("startTime", time.toISOString())
        .timestamp(time);
      points.push(point);
    }

    // 生成转码时长数据
    for (let i = 0; i < 35; i++) {
      const time = new Date(now.getTime() - i * 20 * 60 * 1000);
      const point = new Point("transcode_duration")
        .tag("id", `transcode_${i + 1}`)
        .tag("streamName", generateRandomString("transcode"))
        .floatField("duration", generateRandomData(500, 5000))
        .tag("format", Math.random() > 0.5 ? "H.264" : "H.265")
        .tag(
          "resolution",
          ["720p", "1080p", "4K"][Math.floor(Math.random() * 3)]
        )
        .timestamp(time);
      points.push(point);
    }

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

    // 批量写入数据
    await writeApi.writePoints(points);
    await writeApi.flush();

    return createSuccessResponse({
      message: "数据初始化成功",
      count: points.length,
    });
  } catch (error) {
    return handleApiError(error, "数据初始化");
  }
}
