import { Point } from "@influxdata/influxdb-client";
import { writeApi } from "./influxdb";

// 初始化示例数据
export async function initializeSampleData() {
  console.log("开始初始化示例数据...");

  const projects = [
    {
      name: "电影《星际穿越》4K.mp4",
      domain: "cdn.example.com",
      region: "china",
      tag: "电影",
    },
    {
      name: "电视剧《权游S8》合集.mkv",
      domain: "cdn.example.com",
      region: "china",
      tag: "电视剧",
    },
    {
      name: "纪录片《地球脉动》1080P.mp4",
      domain: "cdn.example.com",
      region: "overseas",
      tag: "纪录片",
    },
    {
      name: "音乐专辑《夜曲》FLAC.zip",
      domain: "cdn.example.com",
      region: "china",
      tag: "音乐",
    },
    {
      name: "软件包《DevTools_v2.1》.tar.gz",
      domain: "cdn.example.com",
      region: "overseas",
      tag: "软件",
    },
  ];

  const now = new Date();
  const dataPoints: any[] = [];

  // 为每个项目生成过去7天的数据
  projects.forEach((project, projectIndex) => {
    const baseTime = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000); // 7天前

    for (let day = 0; day < 7; day++) {
      for (let hour = 0; hour < 24; hour++) {
        for (let minute = 0; minute < 60; minute += 5) {
          // 每5分钟一个数据点
          const time = new Date(
            baseTime.getTime() +
              day * 24 * 60 * 60 * 1000 +
              hour * 60 * 60 * 1000 +
              minute * 60 * 1000
          );

          if (time > now) continue;

          // 根据项目类型和时间生成不同的带宽模式
          let uploadBandwidth = 0;
          let downloadBandwidth = 0;

          const hourOfDay = time.getHours();
          const isPeakHour = hourOfDay >= 19 || hourOfDay <= 23; // 晚上7-11点是高峰

          if (project.tag === "电影" || project.tag === "电视剧") {
            // 视频内容在高峰时段有更多下载
            uploadBandwidth = Math.random() * 0.5 + 0.1;
            downloadBandwidth = isPeakHour
              ? Math.random() * 3 + 1.5
              : Math.random() * 1.5 + 0.5;
          } else if (project.tag === "纪录片") {
            uploadBandwidth = Math.random() * 0.3 + 0.05;
            downloadBandwidth = isPeakHour
              ? Math.random() * 2 + 1
              : Math.random() * 1 + 0.3;
          } else if (project.tag === "音乐") {
            uploadBandwidth = Math.random() * 0.2 + 0.05;
            downloadBandwidth = Math.random() * 0.8 + 0.2;
          } else {
            uploadBandwidth = Math.random() * 0.4 + 0.1;
            downloadBandwidth = Math.random() * 1.2 + 0.3;
          }

          // 添加一些随机波动
          uploadBandwidth += Math.sin(time.getTime() / 1000000) * 0.2;
          downloadBandwidth += Math.cos(time.getTime() / 1000000) * 0.3;

          // 确保带宽不为负数
          uploadBandwidth = Math.max(0, uploadBandwidth);
          downloadBandwidth = Math.max(0, downloadBandwidth);

          const point = new Point("bandwidth_usage")
            .tag("project", project.name)
            .tag("domain", project.domain)
            .tag("region", project.region)
            .tag("tag", project.tag)
            .floatField("upload", uploadBandwidth)
            .floatField("download", downloadBandwidth)
            .timestamp(time);

          dataPoints.push(point);
        }
      }
    }
  });

  // 批量写入数据
  try {
    for (const point of dataPoints) {
      await writeApi.writePoint(point);
    }
    await writeApi.flush();
    console.log(`成功写入 ${dataPoints.length} 个数据点`);
  } catch (error) {
    console.error("写入数据失败:", error);
    throw error;
  }
}

// 初始化推流数据
export async function initializeStreamingData() {
  console.log("开始初始化推流数据...");

  const streamingPoints = [
    {
      id: "1",
      streamName: "live_001",
      type: "推流",
      domain: "cdn.example.com",
      region: "china",
      bandwidth: 2.5,
      duration: 120,
      viewers: 1500,
      status: "active",
      startTime: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2小时前开始
    },
    {
      id: "2",
      streamName: "live_002",
      type: "拉流",
      domain: "cdn.example.com",
      region: "overseas",
      bandwidth: 1.8,
      duration: 90,
      viewers: 800,
      status: "active",
      startTime: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1小时前开始
    },
    {
      id: "3",
      streamName: "live_003",
      type: "推流",
      domain: "cdn-test.example.com",
      region: "china",
      bandwidth: 3.2,
      duration: 180,
      viewers: 2200,
      status: "ended",
      startTime: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4小时前开始
    },
  ];

  try {
    for (const data of streamingPoints) {
      const point = new Point("streaming_data")
        .tag("id", data.id)
        .tag("streamName", data.streamName)
        .tag("type", data.type)
        .tag("domain", data.domain)
        .tag("region", data.region)
        .tag("status", data.status)
        .floatField("bandwidth", data.bandwidth)
        .intField("duration", data.duration)
        .intField("viewers", data.viewers)
        .stringField("startTime", data.startTime.toISOString())
        .timestamp(data.startTime);

      await writeApi.writePoint(point);
    }
    await writeApi.flush();
    console.log(`成功写入 ${streamingPoints.length} 个推流数据点`);
  } catch (error) {
    console.error("写入推流数据失败:", error);
    throw error;
  }
}

// 检查数据是否存在
export async function checkDataExists() {
  // 这里可以添加检查逻辑，如果数据已存在则跳过初始化
  return false; // 暂时返回false，总是初始化数据
}
