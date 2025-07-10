import { NextResponse } from "next/server";

export async function GET() {
  try {
    // 这里可以添加数据库连接检查
    // 例如：检查MySQL、Redis、InfluxDB连接
    
    return NextResponse.json(
      {
        status: "healthy",
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        status: "unhealthy",
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 503 }
    );
  }
} 