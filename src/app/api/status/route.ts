import { NextResponse } from "next/server";

// 强制用 Node.js runtime，避免 Edge 环境不支持 process
export const runtime = "nodejs";

export async function GET() {
  const startTime = Date.now();

  // 基础健康信息
  const healthStatus: any = {
    status: "healthy",
    message: "Application is running",
    timestamp: new Date().toISOString(),
    uptime: typeof process !== "undefined" && process.uptime ? process.uptime() : "unknown",
    version: process.env.npm_package_version || "unknown",
    node_version: typeof process !== "undefined" && process.version ? process.version : "unknown",
    environment: process.env.NODE_ENV || "unknown",
    responseTime: 0,
    services: {
      database: "unchecked",
      redis: "unchecked"
    }
  };

  // 检查数据库（Prisma）
  try {
    const { prisma } = await import("@/lib/db/prisma");
    await prisma.$queryRaw`SELECT 1`;
    healthStatus.services.database = "connected";
  } catch (e) {
    healthStatus.services.database = "error";
  }

  // 检查 Redis
  if (process.env.REDIS_URL) {
    try {
      const { redis } = await import("@/lib/db/redis");
      await redis.ping();
      healthStatus.services.redis = "connected";
    } catch (e) {
      healthStatus.services.redis = "error";
    }
  } else {
    healthStatus.services.redis = "not_configured";
  }

  healthStatus.responseTime = Date.now() - startTime;

  return NextResponse.json(healthStatus, { status: 200 });
}