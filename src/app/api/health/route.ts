import { NextResponse } from "next/server";

export async function GET() {
  const startTime = Date.now();
  
  try {
    // 基础健康检查
    const healthStatus = {
      status: "healthy",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      responseTime: 0,
      env: {
        NODE_ENV: process.env.NODE_ENV,
        DATABASE_URL: process.env.DATABASE_URL ? "configured" : "missing",
        NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? "configured" : "missing",
        NEXTAUTH_URL: process.env.NEXTAUTH_URL ? "configured" : "missing",
      },
      services: {
        app: "running",
        database: "checking...",
        redis: "not_configured",
        influxdb: "not_configured",
      }
    };

    // 数据库连接检查（超时控制）
    const dbCheckPromise = new Promise<string>((resolve) => {
      setTimeout(() => resolve("timeout"), 3000); // 3秒超时
      
      import("@/lib/db/prisma")
        .then(({ prisma }) => {
          return prisma.$queryRaw`SELECT 1 as test`;
        })
        .then(() => resolve("connected"))
        .catch((error) => {
          console.warn("数据库连接检查失败:", error?.message || error);
          resolve("error");
        });
    });

    healthStatus.services.database = await dbCheckPromise;

    // Redis检查（如果配置了）
    if (process.env.REDIS_URL) {
      healthStatus.services.redis = "checking...";
      try {
        const redisCheckPromise = new Promise<string>((resolve) => {
          setTimeout(() => resolve("timeout"), 2000);
          
          import("@/lib/db/redis")
            .then(({ redis }) => redis.ping())
            .then(() => resolve("connected"))
            .catch(() => resolve("error"));
        });
        
        healthStatus.services.redis = await redisCheckPromise;
      } catch {
        healthStatus.services.redis = "error";
      }
    }

    // InfluxDB检查（如果配置了）
    if (process.env.INFLUX_URL && process.env.INFLUX_TOKEN) {
      healthStatus.services.influxdb = "configured";
    }

    healthStatus.responseTime = Date.now() - startTime;
    
    return NextResponse.json(healthStatus, { status: 200 });
    
  } catch (error) {
    console.error("健康检查失败:", error);
    
    const errorResponse = {
      status: "partial",
      timestamp: new Date().toISOString(),
      responseTime: Date.now() - startTime,
      error: error instanceof Error ? error.message : "Unknown error",
      env: {
        NODE_ENV: process.env.NODE_ENV || "unknown",
        DATABASE_URL: process.env.DATABASE_URL ? "configured" : "missing",
        NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? "configured" : "missing",
        NEXTAUTH_URL: process.env.NEXTAUTH_URL ? "configured" : "missing",
      },
      services: {
        app: "running",
        database: "unknown",
        redis: "unknown",
        influxdb: "unknown",
      }
    };

    // 即使出错也返回200，因为应用本身是运行的
    return NextResponse.json(errorResponse, { status: 200 });
  }
} 