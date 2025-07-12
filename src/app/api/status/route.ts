import { NextResponse } from "next/server";
export const runtime = "nodejs";

export async function GET() {
  // 最简单的状态检查，不依赖任何外部服务
  return NextResponse.json(
    {
      status: "ok",
      message: "Application is running",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.npm_package_version || "unknown",
      node_version: process.version,
      environment: process.env.NODE_ENV || "unknown",
    },
    { status: 200 }
  );
}
