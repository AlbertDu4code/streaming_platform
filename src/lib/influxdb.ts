import {
  InfluxDB,
  Point,
  WriteApi,
  QueryApi,
} from "@influxdata/influxdb-client";

// InfluxDB 配置
const INFLUX_URL = process.env.INFLUX_URL || "http://localhost:8086";
const INFLUX_TOKEN =
  process.env.INFLUX_TOKEN || "my_super_secret_admin_token_123456789";
const INFLUX_ORG = process.env.INFLUX_ORG || "streaming-org";
const INFLUX_BUCKET = process.env.INFLUX_BUCKET || "usage-data";

// 创建 InfluxDB 客户端
export const influxDB = new InfluxDB({
  url: INFLUX_URL,
  token: INFLUX_TOKEN,
});

// 获取写入API
export const writeApi = influxDB.getWriteApi(INFLUX_ORG, INFLUX_BUCKET, "ms");

// 获取查询API
export const queryApi = influxDB.getQueryApi(INFLUX_ORG);

// 带宽数据接口
export interface BandwidthData {
  time: string;
  upload: number;
  download: number;
  project?: string;
  domain?: string;
  region?: string;
  tag?: string;
}

// 推流数据接口
export interface StreamingData {
  id: string;
  streamName: string;
  type: "推流" | "拉流";
  domain: string;
  region: string;
  bandwidth: number;
  duration: number;
  viewers: number;
  status: "active" | "ended";
  startTime: string;
}

// 写入带宽数据
export async function writeBandwidthData(data: BandwidthData) {
  const point = new Point("bandwidth_usage")
    .tag("project", data.project || "unknown")
    .tag("domain", data.domain || "unknown")
    .tag("region", data.region || "unknown")
    .tag("tag", data.tag || "unknown")
    .floatField("upload", data.upload)
    .floatField("download", data.download)
    .timestamp(new Date(data.time));

  await writeApi.writePoint(point);
  await writeApi.flush();
}

// 查询带宽数据
export async function queryBandwidthData(
  startTime: string,
  endTime: string,
  filters: {
    project?: string;
    domain?: string;
    region?: string;
    tag?: string;
  } = {},
  granularity: string = "5min"
): Promise<BandwidthData[]> {
  let query = `
    from(bucket: "${INFLUX_BUCKET}")
      |> range(start: ${startTime}, stop: ${endTime})
      |> filter(fn: (r) => r._measurement == "bandwidth_usage")
  `;

  // 添加筛选条件
  if (filters.project && filters.project !== "all") {
    query += `|> filter(fn: (r) => r.project == "${filters.project}")`;
  }
  if (filters.domain && filters.domain !== "all") {
    query += `|> filter(fn: (r) => r.domain == "${filters.domain}")`;
  }
  if (filters.region && filters.region !== "all") {
    query += `|> filter(fn: (r) => r.region == "${filters.region}")`;
  }
  if (filters.tag && filters.tag !== "all") {
    query += `|> filter(fn: (r) => r.tag == "${filters.tag}")`;
  }

  // 根据粒度进行聚合
  if (granularity !== "1min") {
    let window = "5m";
    switch (granularity) {
      case "1hour":
        window = "1h";
        break;
      case "1day":
        window = "1d";
        break;
      default:
        window = "5m";
    }

    query += `
      |> aggregateWindow(every: ${window}, fn: mean, createEmpty: false)
    `;
  }

  query += `
    |> pivot(rowKey:["_time"], columnKey: ["_field"], valueColumn: "_value")
    |> sort(columns: ["_time"])
  `;

  const results: BandwidthData[] = [];

  try {
    for await (const { values, tableMeta } of queryApi.iterateRows(query)) {
      const o = tableMeta.toObject(values);
      results.push({
        time: o._time,
        upload: o.upload || 0,
        download: o.download || 0,
        project: o.project ? o.project.replace(/^"|"$/g, "") : undefined,
        domain: o.domain ? o.domain.replace(/^"|"$/g, "") : undefined,
        region: o.region ? o.region.replace(/^"|"$/g, "") : undefined,
        tag: o.tag ? o.tag.replace(/^"|"$/g, "") : undefined,
      });
    }
  } catch (error) {
    console.error("InfluxDB查询错误:", error);
    throw error;
  }

  return results;
}

// 查询推流数据
export async function queryStreamingData(
  startTime: string,
  endTime: string,
  limit: number = 1000
): Promise<StreamingData[]> {
  const query = `
    from(bucket: "${INFLUX_BUCKET}")
      |> range(start: ${startTime}, stop: ${endTime})
      |> filter(fn: (r) => r._measurement == "streaming_data")
      |> pivot(rowKey:["_time"], columnKey: ["_field"], valueColumn: "_value")
      |> sort(columns: ["_time"], desc: true)
      |> limit(n: ${limit})
  `;

  const results: StreamingData[] = [];
  const seenIds = new Set<string>();

  try {
    for await (const { values, tableMeta } of queryApi.iterateRows(query)) {
      const o = tableMeta.toObject(values);
      const id = o.id ? o.id.replace(/^"|"$/g, "") : "";

      // 确保每个流只出现一次
      if (id && !seenIds.has(id)) {
        seenIds.add(id);
        results.push({
          id: id,
          streamName: o.streamName ? o.streamName.replace(/^"|"$/g, "") : "",
          type: o.type ? o.type.replace(/^"|"$/g, "") : "推流",
          domain: o.domain ? o.domain.replace(/^"|"$/g, "") : "",
          region: o.region ? o.region.replace(/^"|"$/g, "") : "",
          bandwidth: o.bandwidth || 0,
          duration: o.duration || 0,
          viewers: o.viewers || 0,
          status: o.status ? o.status.replace(/^"|"$/g, "") : "active",
          startTime: o.startTime ? o.startTime.replace(/^"|"$/g, "") : "",
        });
      }
    }
  } catch (error) {
    console.error("InfluxDB查询错误:", error);
    // 返回空数组而不是抛出错误，避免页面卡死
    return [];
  }

  return results;
}

// 获取统计数据
export async function getBandwidthStats(
  startTime: string,
  endTime: string,
  filters: {
    project?: string;
    domain?: string;
    region?: string;
    tag?: string;
  } = {}
) {
  let query = `
    from(bucket: "${INFLUX_BUCKET}")
      |> range(start: ${startTime}, stop: ${endTime})
      |> filter(fn: (r) => r._measurement == "bandwidth_usage")
  `;

  // 添加筛选条件
  if (filters.project && filters.project !== "all") {
    query += `|> filter(fn: (r) => r.project == "${filters.project}")`;
  }
  if (filters.domain && filters.domain !== "all") {
    query += `|> filter(fn: (r) => r.domain == "${filters.domain}")`;
  }
  if (filters.region && filters.region !== "all") {
    query += `|> filter(fn: (r) => r.region == "${filters.region}")`;
  }
  if (filters.tag && filters.tag !== "all") {
    query += `|> filter(fn: (r) => r.tag == "${filters.tag}")`;
  }

  query += `
    |> pivot(rowKey:["_time"], columnKey: ["_field"], valueColumn: "_value")
    |> reduce(
      fn: (r, accumulator) => ({
        maxUpload: if r.upload > accumulator.maxUpload then r.upload else accumulator.maxUpload,
        maxDownload: if r.download > accumulator.maxDownload then r.download else accumulator.maxDownload,
        avgUpload: (accumulator.avgUpload * accumulator.count + r.upload) / (accumulator.count + 1),
        avgDownload: (accumulator.avgDownload * accumulator.count + r.download) / (accumulator.count + 1),
        count: accumulator.count + 1
      }),
      identity: {maxUpload: 0.0, maxDownload: 0.0, avgUpload: 0.0, avgDownload: 0.0, count: 0}
    )
  `;

  try {
    const results = await queryApi.collectRows(query);
    if (results.length > 0) {
      return results[0];
    }
    return {
      maxUpload: 0,
      maxDownload: 0,
      avgUpload: 0,
      avgDownload: 0,
      count: 0,
    };
  } catch (error) {
    console.error("InfluxDB统计查询错误:", error);
    throw error;
  }
}

// 查询存储用量数据
export async function queryStorageData(limit: number = 500): Promise<any[]> {
  const query = `
    from(bucket: "${INFLUX_BUCKET}")
      |> range(start: -30d)
      |> filter(fn: (r) => r._measurement == "storage_usage")
      |> pivot(rowKey:["_time"], columnKey: ["_field"], valueColumn: "_value")
      |> sort(columns: ["_time"], desc: true)
      |> limit(n: ${limit})
  `;

  const results: any[] = [];
  const seen = new Set<string>();

  try {
    for await (const { values, tableMeta } of queryApi.iterateRows(query)) {
      const o = tableMeta.toObject(values);
      const key = `${o.project || ""}-${o.domain || ""}`;
      if (!seen.has(key)) {
        seen.add(key);
        results.push({
          id: key,
          project: o.project ? o.project.replace(/^"|"$/g, "") : "",
          domain: o.domain ? o.domain.replace(/^"|"$/g, "") : "",
          size: o.size || 0,
          updateTime: o._time,
        });
      }
    }
  } catch (error) {
    console.error("InfluxDB存储用量查询错误:", error);
    return [];
  }

  return results;
}

// 关闭连接
export async function closeInfluxDB() {
  await writeApi.close();
}

// 查询直播流数据
export async function queryLiveStreamData(
  startTime: string,
  endTime: string,
  limit: number = 100
): Promise<any[]> {
  const query = `
    from(bucket: "${INFLUX_BUCKET}")
      |> range(start: ${startTime}, stop: ${endTime})
      |> filter(fn: (r) => r._measurement == "live_stream_data")
      |> pivot(rowKey:["_time"], columnKey: ["_field"], valueColumn: "_value")
      |> sort(columns: ["_time"], desc: true)
      |> limit(n: ${limit})
  `;

  const results: any[] = [];
  const seenIds = new Set<string>();

  try {
    for await (const { values, tableMeta } of queryApi.iterateRows(query)) {
      const o = tableMeta.toObject(values);
      const id = o.id ? o.id.replace(/^"|"$/g, "") : "";

      if (id && !seenIds.has(id)) {
        seenIds.add(id);
        results.push({
          id: id,
          streamName: o.streamName ? o.streamName.replace(/^"|"$/g, "") : "",
          type: o.type ? o.type.replace(/^"|"$/g, "") : "推流",
          domain: o.domain ? o.domain.replace(/^"|"$/g, "") : "",
          region: o.region ? o.region.replace(/^"|"$/g, "") : "",
          bandwidth: o.bandwidth || 0,
          viewers: o.viewers || 0,
          status: o.status ? o.status.replace(/^"|"$/g, "") : "active",
          startTime: o.startTime ? o.startTime.replace(/^"|"$/g, "") : "",
          updateTime: o._time,
        });
      }
    }
  } catch (error) {
    console.error("InfluxDB直播流查询错误:", error);
    return [];
  }

  return results;
}

// 查询转码时长数据
export async function queryTranscodeDurationData(
  startTime: string,
  endTime: string,
  limit: number = 100
): Promise<any[]> {
  const query = `
    from(bucket: "${INFLUX_BUCKET}")
      |> range(start: ${startTime}, stop: ${endTime})
      |> filter(fn: (r) => r._measurement == "transcode_duration")
      |> pivot(rowKey:["_time"], columnKey: ["_field"], valueColumn: "_value")
      |> sort(columns: ["_time"], desc: true)
      |> limit(n: ${limit})
  `;

  const results: any[] = [];
  const seenIds = new Set<string>();

  try {
    for await (const { values, tableMeta } of queryApi.iterateRows(query)) {
      const o = tableMeta.toObject(values);
      const id = o.id ? o.id.replace(/^"|"$/g, "") : "";

      if (id && !seenIds.has(id)) {
        seenIds.add(id);
        results.push({
          id: id,
          streamName: o.streamName ? o.streamName.replace(/^"|"$/g, "") : "",
          duration: o.duration || 0,
          format: o.format ? o.format.replace(/^"|"$/g, "") : "",
          resolution: o.resolution ? o.resolution.replace(/^"|"$/g, "") : "",
          updateTime: o._time,
        });
      }
    }
  } catch (error) {
    console.error("InfluxDB转码时长查询错误:", error);
    return [];
  }

  return results;
}

// 查询截图数据
export async function queryScreenshotData(
  startTime: string,
  endTime: string,
  limit: number = 100
): Promise<any[]> {
  const query = `
    from(bucket: "${INFLUX_BUCKET}")
      |> range(start: ${startTime}, stop: ${endTime})
      |> filter(fn: (r) => r._measurement == "screenshot_data")
      |> pivot(rowKey:["_time"], columnKey: ["_field"], valueColumn: "_value")
      |> sort(columns: ["_time"], desc: true)
      |> limit(n: ${limit})
  `;

  const results: any[] = [];
  const seenIds = new Set<string>();

  try {
    for await (const { values, tableMeta } of queryApi.iterateRows(query)) {
      const o = tableMeta.toObject(values);
      const id = o.id ? o.id.replace(/^"|"$/g, "") : "";

      if (id && !seenIds.has(id)) {
        seenIds.add(id);
        results.push({
          id: id,
          streamName: o.streamName ? o.streamName.replace(/^"|"$/g, "") : "",
          count: o.count || 0,
          format: o.format ? o.format.replace(/^"|"$/g, "") : "",
          interval: o.interval || 0,
          updateTime: o._time,
        });
      }
    }
  } catch (error) {
    console.error("InfluxDB截图查询错误:", error);
    return [];
  }

  return results;
}

// 查询拉流转推数据
export async function queryPushStreamData(
  startTime: string,
  endTime: string,
  limit: number = 100
): Promise<any[]> {
  const query = `
    from(bucket: "${INFLUX_BUCKET}")
      |> range(start: ${startTime}, stop: ${endTime})
      |> filter(fn: (r) => r._measurement == "push_stream_data")
      |> pivot(rowKey:["_time"], columnKey: ["_field"], valueColumn: "_value")
      |> sort(columns: ["_time"], desc: true)
      |> limit(n: ${limit})
  `;

  const results: any[] = [];
  const seenIds = new Set<string>();

  try {
    for await (const { values, tableMeta } of queryApi.iterateRows(query)) {
      const o = tableMeta.toObject(values);
      const id = o.id ? o.id.replace(/^"|"$/g, "") : "";

      if (id && !seenIds.has(id)) {
        seenIds.add(id);
        results.push({
          id: id,
          streamName: o.streamName ? o.streamName.replace(/^"|"$/g, "") : "",
          sourceUrl: o.sourceUrl ? o.sourceUrl.replace(/^"|"$/g, "") : "",
          targetUrl: o.targetUrl ? o.targetUrl.replace(/^"|"$/g, "") : "",
          status: o.status ? o.status.replace(/^"|"$/g, "") : "active",
          updateTime: o._time,
        });
      }
    }
  } catch (error) {
    console.error("InfluxDB拉流转推查询错误:", error);
    return [];
  }

  return results;
}

// 查询转推带宽数据
export async function queryTranscodeBandwidthData(
  startTime: string,
  endTime: string,
  limit: number = 100
): Promise<any[]> {
  const query = `
    from(bucket: "${INFLUX_BUCKET}")
      |> range(start: ${startTime}, stop: ${endTime})
      |> filter(fn: (r) => r._measurement == "transcode_bandwidth")
      |> pivot(rowKey:["_time"], columnKey: ["_field"], valueColumn: "_value")
      |> sort(columns: ["_time"], desc: true)
      |> limit(n: ${limit})
  `;

  const results: any[] = [];
  const seenIds = new Set<string>();

  try {
    for await (const { values, tableMeta } of queryApi.iterateRows(query)) {
      const o = tableMeta.toObject(values);
      const id = o.id ? o.id.replace(/^"|"$/g, "") : "";

      if (id && !seenIds.has(id)) {
        seenIds.add(id);
        results.push({
          id: id,
          streamName: o.streamName ? o.streamName.replace(/^"|"$/g, "") : "",
          bandwidth: o.bandwidth || 0,
          format: o.format ? o.format.replace(/^"|"$/g, "") : "",
          resolution: o.resolution ? o.resolution.replace(/^"|"$/g, "") : "",
          updateTime: o._time,
        });
      }
    }
  } catch (error) {
    console.error("InfluxDB转推带宽查询错误:", error);
    return [];
  }

  return results;
}

// 查询直播带宽数据
export async function queryDirectBandwidthData(
  startTime: string,
  endTime: string,
  limit: number = 100
): Promise<any[]> {
  const query = `
    from(bucket: "${INFLUX_BUCKET}")
      |> range(start: ${startTime}, stop: ${endTime})
      |> filter(fn: (r) => r._measurement == "direct_bandwidth")
      |> pivot(rowKey:["_time"], columnKey: ["_field"], valueColumn: "_value")
      |> sort(columns: ["_time"], desc: true)
      |> limit(n: ${limit})
  `;

  const results: any[] = [];
  const seenIds = new Set<string>();

  try {
    for await (const { values, tableMeta } of queryApi.iterateRows(query)) {
      const o = tableMeta.toObject(values);
      const id = o.id ? o.id.replace(/^"|"$/g, "") : "";

      if (id && !seenIds.has(id)) {
        seenIds.add(id);
        results.push({
          id: id,
          streamName: o.streamName ? o.streamName.replace(/^"|"$/g, "") : "",
          bandwidth: o.bandwidth || 0,
          viewers: o.viewers || 0,
          status: o.status ? o.status.replace(/^"|"$/g, "") : "active",
          updateTime: o._time,
        });
      }
    }
  } catch (error) {
    console.error("InfluxDB直播带宽查询错误:", error);
    return [];
  }

  return results;
}

// 查询云导播数据
export async function queryGuideData(
  startTime: string,
  endTime: string,
  limit: number = 100
): Promise<any[]> {
  const query = `
    from(bucket: "${INFLUX_BUCKET}")
      |> range(start: ${startTime}, stop: ${endTime})
      |> filter(fn: (r) => r._measurement == "guide_data")
      |> pivot(rowKey:["_time"], columnKey: ["_field"], valueColumn: "_value")
      |> sort(columns: ["_time"], desc: true)
      |> limit(n: ${limit})
  `;

  const results: any[] = [];
  const seenIds = new Set<string>();

  try {
    for await (const { values, tableMeta } of queryApi.iterateRows(query)) {
      const o = tableMeta.toObject(values);
      const id = o.id ? o.id.replace(/^"|"$/g, "") : "";

      if (id && !seenIds.has(id)) {
        seenIds.add(id);
        results.push({
          id: id,
          guideName: o.guideName ? o.guideName.replace(/^"|"$/g, "") : "",
          inputCount: o.inputCount || 0,
          outputCount: o.outputCount || 0,
          status: o.status ? o.status.replace(/^"|"$/g, "") : "active",
          updateTime: o._time,
        });
      }
    }
  } catch (error) {
    console.error("InfluxDB云导播查询错误:", error);
    return [];
  }

  return results;
}
