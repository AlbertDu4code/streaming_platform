// src/lib/db/prisma.ts
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

// src/lib/db/influxdb.ts
import {
  InfluxDB,
  Point,
  WriteApi,
  QueryApi,
} from "@influxdata/influxdb-client";

const influxDB = new InfluxDB({
  url: process.env.INFLUXDB_URL!,
  token: process.env.INFLUXDB_TOKEN!,
});

const org = process.env.INFLUXDB_ORG!;
const bucket = process.env.INFLUXDB_BUCKET!;

export const writeAPI: WriteApi = influxDB.getWriteApi(org, bucket);
export const queryAPI: QueryApi = influxDB.getQueryApi(org);

// 写入使用数据
export async function writeUsageData(
  userId: string,
  service: string,
  duration: number,
  dataUsage?: number
) {
  const point = new Point("usage")
    .tag("userId", userId)
    .tag("service", service)
    .floatField("duration", duration)
    .timestamp(new Date());

  if (dataUsage) {
    point.floatField("dataUsage", dataUsage);
  }

  writeAPI.writePoint(point);
  await writeAPI.flush();
}

// 查询使用数据
export async function queryUsageData(userId: string, timeRange: string = "7d") {
  const query = `
    from(bucket: "${bucket}")
      |> range(start: -${timeRange})
      |> filter(fn: (r) => r._measurement == "usage")
      |> filter(fn: (r) => r.userId == "${userId}")
      |> group(columns: ["service"])
      |> aggregateWindow(every: 1d, fn: sum, createEmpty: false)
      |> yield(name: "mean")
  `;

  const result = [];
  for await (const { values, tableMeta } of queryAPI.iterateRows(query)) {
    const o = tableMeta.toObject(values);
    result.push(o);
  }

  return result;
}
