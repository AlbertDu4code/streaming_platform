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

// 查询带宽数据
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
  // 基础查询
  let baseQuery = `
    from(bucket: "${INFLUX_BUCKET}")
      |> range(start: ${startTime}, stop: ${endTime})
      |> filter(fn: (r) => r._measurement == "bandwidth_usage")
  `;

  // 添加筛选条件
  Object.entries(filters).forEach(([key, value]) => {
    if (value && value !== "all") {
      baseQuery += `|> filter(fn: (r) => r.${key} == "${value}")`;
    }
  });

  // 聚合和转换
  baseQuery += `
    |> aggregateWindow(every: ${granularity}, fn: mean, createEmpty: false)
    |> pivot(rowKey:["_time"], columnKey: ["_field"], valueColumn: "_value")
  `;

  // 查询总数
  const countQuery = `${baseQuery} |> count(column: "_time")`;
  let total = 0;
  try {
    const countResult = await queryApi.collectRows<{ _value: number }>(
      countQuery
    );
    if (countResult.length > 0) {
      total = countResult[0]._value;
    }
  } catch (error) {
    console.error("InfluxDB (count)查询错误:", error);
    // 即使计数失败，也继续尝试获取数据
  }

  // 添加排序和分页
  const desc = sort.order === "descend";
  baseQuery += `
    |> sort(columns: ["${sort.field}"], desc: ${desc})
    |> limit(n: ${pageSize}, offset: ${(page - 1) * pageSize})
  `;

  const results: BandwidthData[] = [];

  try {
    for await (const { values, tableMeta } of queryApi.iterateRows(baseQuery)) {
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
    console.error("InfluxDB (data)查询错误:", error);
    throw error;
  }

  return { data: results, total };
}

// 其他函数的代码... (保持不变)
// ...
