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
const INFLUX_BUCKET = process.env.INFLUX_BUCKET || "streaming-data";

// 创建 InfluxDB 客户端
export const influxDB = new InfluxDB({
  url: INFLUX_URL,
  token: INFLUX_TOKEN,
});

// 获取写入API
export const writeApi = influxDB.getWriteApi(INFLUX_ORG, INFLUX_BUCKET, "ms");

// 获取查询API
export const queryApi = influxDB.getQueryApi(INFLUX_ORG);

// 统一的时间范围格式化函数
function formatTimeRange(startTime: string, endTime: string): string {
  const format = (time: string) =>
    time.includes("T") ? `time(v: "${time}")` : time;
  return `range(start: ${format(startTime)}, stop: ${format(endTime)})`;
}

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

// 查询带宽数据的参数接口
interface QueryBandwidthDataParams {
  startTime: string;
  endTime: string;
  page?: number;
  pageSize?: number;
  filters?: {
    project?: string;
    domain?: string;
    region?: string;
    tag?: string;
  };
  sort?: {
    field: string;
    order: string;
  };
  granularity?: string;
}

// 查询带宽数据 (最终重构版)
export async function queryBandwidthData({
  startTime,
  endTime,
  page = 1,
  pageSize = 20,
  filters = {},
  sort = { field: "time", order: "descend" },
  granularity = "5min",
}: QueryBandwidthDataParams): Promise<{
  data: BandwidthData[];
  total: number;
}> {
  let window = "5m";
  if (granularity !== "raw") {
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
  }

  // 1. 构建一个只获取所有相关数据的查询 (无分页)
  let query = `
    from(bucket: "${INFLUX_BUCKET}")
      |> ${formatTimeRange(startTime, endTime)}
      |> filter(fn: (r) => r._measurement == "bandwidth_usage")
  `;

  Object.entries(filters).forEach(([key, value]) => {
    if (value && value !== "all") {
      const escapedValue = String(value).replace(/"/g, '\\"');
      query += `\n      |> filter(fn: (r) => r.${key} == "${escapedValue}")`;
    }
  });

  if (granularity !== "raw") {
    query += `\n      |> aggregateWindow(every: ${window}, fn: mean, createEmpty: false)`;
  }

  query += `\n      |> pivot(rowKey:["_time"], columnKey: ["_field"], valueColumn: "_value")`;

  if (sort.field === "total") {
    query += `\n      |> map(fn: (r) => ({ r with total: r.upload + r.download }))`;
  }

  const sortField = sort.field === "time" ? "_time" : sort.field;
  const desc = sort.order === "descend";
  query += `\n      |> sort(columns: ["${sortField}"], desc: ${desc})`;

  // 2. 执行查询，获取所有数据
  const allResults: BandwidthData[] = [];
  try {
    for await (const { values, tableMeta } of queryApi.iterateRows(query)) {
      const o = tableMeta.toObject(values);
      allResults.push({
        time: o._time,
        upload: o.upload || 0,
        download: o.download || 0,
        project: o.project
          ? String(o.project).replace(/^"|"$/g, "")
          : undefined,
        domain: o.domain ? String(o.domain).replace(/^"|"$/g, "") : undefined,
        region: o.region ? String(o.region).replace(/^"|"$/g, "") : undefined,
        tag: o.tag ? String(o.tag).replace(/^"|"$/g, "") : undefined,
      });
    }
  } catch (error) {
    console.error("InfluxDB 数据查询错误:", error);
    throw error;
  }

  // 3. 在内存中计算总数和进行分页
  const total = allResults.length;
  const offset = (page - 1) * pageSize;
  const paginatedData = allResults.slice(offset, offset + pageSize);

  return { data: paginatedData, total };
}

// 查询带宽数据（原版本，用于向后兼容）
export async function queryBandwidthDataLegacy(
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
      |> ${formatTimeRange(startTime, endTime)}
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

// ... 其他函数保持不变 ...

// 查询推流数据
export async function queryStreamingData(
  startTime: string,
  endTime: string,
  limit: number = 1000
): Promise<StreamingData[]> {
  const query = `
    from(bucket: "${INFLUX_BUCKET}")
      |> ${formatTimeRange(startTime, endTime)}
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
      |> ${formatTimeRange(startTime, endTime)}
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

// ... 其余函数保持不变 ...
