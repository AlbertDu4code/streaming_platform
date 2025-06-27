#!/usr/bin/env node

const { InfluxDB, Point } = require("@influxdata/influxdb-client");

// InfluxDB 配置
const INFLUX_URL = process.env.INFLUX_URL || "http://localhost:8086";
const INFLUX_TOKEN =
  process.env.INFLUX_TOKEN || "my_super_secret_admin_token_123456789";
const INFLUX_ORG = process.env.INFLUX_ORG || "streaming-org";
const INFLUX_BUCKET = process.env.INFLUX_BUCKET || "usage-data";

// 创建 InfluxDB 客户端
const influxDB = new InfluxDB({
  url: INFLUX_URL,
  token: INFLUX_TOKEN,
});

const writeApi = influxDB.getWriteApi(INFLUX_ORG, INFLUX_BUCKET, "ms");

// 项目配置
const projects = [
  {
    name: "电影《星际穿越》4K.mp4",
    domain: "cdn.example.com",
    region: "china",
    tag: "电影",
    size: 15.6, // GB
  },
  {
    name: "电视剧《权游S8》合集.mkv",
    domain: "cdn.example.com",
    region: "china",
    tag: "电视剧",
    size: 23.2,
  },
  {
    name: "纪录片《地球脉动》1080P.mp4",
    domain: "cdn.example.com",
    region: "overseas",
    tag: "纪录片",
    size: 8.9,
  },
  {
    name: "音乐专辑《夜曲》FLAC.zip",
    domain: "cdn.example.com",
    region: "china",
    tag: "音乐",
    size: 1.2,
  },
  {
    name: "软件包《DevTools_v2.1》.tar.gz",
    domain: "cdn.example.com",
    region: "overseas",
    tag: "软件",
    size: 0.5,
  },
  {
    name: "游戏《赛博朋克2077》安装包.exe",
    domain: "cdn-games.example.com",
    region: "china",
    tag: "游戏",
    size: 45.8,
  },
  {
    name: "教育课程《Python编程入门》.mp4",
    domain: "cdn-edu.example.com",
    region: "china",
    tag: "教育",
    size: 2.1,
  },
  {
    name: "直播回放《2024春晚》.mp4",
    domain: "cdn-live.example.com",
    region: "china",
    tag: "直播",
    size: 12.3,
  },
];

// 推流数据配置
const streamingData = [
  {
    id: "live_001",
    streamName: "电影直播_001",
    type: "推流",
    domain: "cdn-live.example.com",
    region: "china",
    bandwidth: 2.5,
    duration: 120,
    viewers: 1500,
    status: "active",
  },
  {
    id: "live_002",
    streamName: "游戏直播_002",
    type: "拉流",
    domain: "cdn-games.example.com",
    region: "overseas",
    bandwidth: 1.8,
    duration: 90,
    viewers: 800,
    status: "active",
  },
  {
    id: "live_003",
    streamName: "教育直播_003",
    type: "推流",
    domain: "cdn-edu.example.com",
    region: "china",
    bandwidth: 3.2,
    duration: 180,
    viewers: 2200,
    status: "ended",
  },
  {
    id: "live_004",
    streamName: "音乐直播_004",
    type: "推流",
    domain: "cdn-music.example.com",
    region: "china",
    bandwidth: 1.5,
    duration: 60,
    viewers: 500,
    status: "active",
  },
];

// 生成带宽数据的函数
function generateBandwidthData(project, startTime, endTime) {
  const dataPoints = [];
  const interval = 5 * 60 * 1000; // 5分钟间隔
  const now = new Date();

  for (
    let time = new Date(startTime);
    time <= endTime;
    time = new Date(time.getTime() + interval)
  ) {
    if (time > now) break;

    const hourOfDay = time.getHours();
    const dayOfWeek = time.getDay();
    const isPeakHour = hourOfDay >= 19 || hourOfDay <= 23; // 晚上7-11点是高峰
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    // 基础带宽值
    let baseUpload = 0.1;
    let baseDownload = 0.5;

    // 根据项目类型调整带宽
    switch (project.tag) {
      case "电影":
      case "电视剧":
        baseUpload = 0.2;
        baseDownload = isPeakHour ? 3.0 : 1.5;
        if (isWeekend) baseDownload *= 1.3;
        break;
      case "纪录片":
        baseUpload = 0.15;
        baseDownload = isPeakHour ? 2.0 : 1.0;
        break;
      case "音乐":
        baseUpload = 0.05;
        baseDownload = 0.8;
        break;
      case "软件":
        baseUpload = 0.3;
        baseDownload = 1.2;
        break;
      case "游戏":
        baseUpload = 0.4;
        baseDownload = isPeakHour ? 4.0 : 2.0;
        if (isWeekend) baseDownload *= 1.5;
        break;
      case "教育":
        baseUpload = 0.1;
        baseDownload = isPeakHour ? 1.5 : 0.8;
        break;
      case "直播":
        baseUpload = 0.3;
        baseDownload = isPeakHour ? 3.5 : 1.8;
        break;
    }

    // 添加随机波动
    const randomFactor = 0.8 + Math.random() * 0.4; // 0.8-1.2
    const timeFactor = 1 + Math.sin(time.getTime() / 1000000) * 0.2; // 时间周期性波动

    const uploadBandwidth = baseUpload * randomFactor * timeFactor;
    const downloadBandwidth = baseDownload * randomFactor * timeFactor;

    // 确保带宽不为负数
    const finalUpload = Math.max(0, uploadBandwidth);
    const finalDownload = Math.max(0, downloadBandwidth);

    const point = new Point("bandwidth_usage")
      .tag("project", project.name)
      .tag("domain", project.domain)
      .tag("region", project.region)
      .tag("tag", project.tag)
      .floatField("upload", finalUpload)
      .floatField("download", finalDownload)
      .timestamp(time);

    dataPoints.push(point);
  }

  return dataPoints;
}

// 生成推流数据的函数
function generateStreamingData(stream, startTime, endTime) {
  const dataPoints = [];
  const interval = 10 * 60 * 1000; // 10分钟间隔
  const now = new Date();

  for (
    let time = new Date(startTime);
    time <= endTime;
    time = new Date(time.getTime() + interval)
  ) {
    if (time > now) break;

    // 模拟观看人数变化
    const hourOfDay = time.getHours();
    const isPeakHour = hourOfDay >= 19 || hourOfDay <= 23;
    const baseViewers = stream.viewers;
    const viewerChange = (Math.random() - 0.5) * 200; // ±200的随机变化
    const peakMultiplier = isPeakHour ? 1.3 : 0.8;
    const currentViewers = Math.max(
      0,
      Math.floor(baseViewers * peakMultiplier + viewerChange)
    );

    // 模拟带宽变化
    const bandwidthChange = (Math.random() - 0.5) * 0.5; // ±0.5的随机变化
    const currentBandwidth = Math.max(0.1, stream.bandwidth + bandwidthChange);

    const point = new Point("streaming_data")
      .tag("id", stream.id)
      .tag("streamName", stream.streamName)
      .tag("type", stream.type)
      .tag("domain", stream.domain)
      .tag("region", stream.region)
      .tag("status", stream.status)
      .floatField("bandwidth", currentBandwidth)
      .intField("duration", stream.duration)
      .intField("viewers", currentViewers)
      .stringField("startTime", stream.startTime || time.toISOString())
      .timestamp(time);

    dataPoints.push(point);
  }

  return dataPoints;
}

// 主函数
async function generateTestData() {
  console.log("开始生成测试数据...");

  try {
    // 检查InfluxDB连接
    console.log("检查InfluxDB连接...");
    const queryApi = influxDB.getQueryApi(INFLUX_ORG);
    const healthQuery = `from(bucket: "${INFLUX_BUCKET}") |> range(start: -1m) |> limit(n: 1)`;

    try {
      await queryApi.collectRows(healthQuery);
      console.log("✓ InfluxDB连接正常");
    } catch (error) {
      console.error("✗ InfluxDB连接失败:", error.message);
      console.log("请确保InfluxDB服务正在运行，并且配置正确");
      process.exit(1);
    }

    // 清空现有数据（可选）
    const clearData = process.argv.includes("--clear");
    if (clearData) {
      console.log("清空现有数据...");
      // 注意：这里只是示例，实际生产环境中应该谨慎使用
      console.log("⚠️  跳过清空操作（生产环境保护）");
    }

    // 生成时间范围
    const endTime = new Date();
    const startTime = new Date(endTime.getTime() - 7 * 24 * 60 * 60 * 1000); // 7天前

    console.log(
      `生成时间范围: ${startTime.toISOString()} 到 ${endTime.toISOString()}`
    );

    // 生成带宽数据
    console.log("生成带宽数据...");
    let totalBandwidthPoints = 0;

    for (const project of projects) {
      console.log(`  - ${project.name}`);
      const bandwidthPoints = generateBandwidthData(
        project,
        startTime,
        endTime
      );

      for (const point of bandwidthPoints) {
        await writeApi.writePoint(point);
      }

      totalBandwidthPoints += bandwidthPoints.length;
    }

    // 生成推流数据
    console.log("生成推流数据...");
    let totalStreamingPoints = 0;

    for (const stream of streamingData) {
      console.log(`  - ${stream.streamName}`);
      const streamingPoints = generateStreamingData(stream, startTime, endTime);

      for (const point of streamingPoints) {
        await writeApi.writePoint(point);
      }

      totalStreamingPoints += streamingPoints.length;
    }

    // 刷新数据
    await writeApi.flush();
    await writeApi.close();

    console.log("✓ 测试数据生成完成！");
    console.log(`  - 带宽数据点: ${totalBandwidthPoints}`);
    console.log(`  - 推流数据点: ${totalStreamingPoints}`);
    console.log(
      `  - 总计数据点: ${totalBandwidthPoints + totalStreamingPoints}`
    );
    console.log("");
    console.log("现在可以启动应用并查看数据了！");
  } catch (error) {
    console.error("生成测试数据失败:", error);
    process.exit(1);
  }
}

// 运行脚本
if (require.main === module) {
  generateTestData();
}

module.exports = { generateTestData };
