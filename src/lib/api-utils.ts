import { NextResponse } from "next/server";
import { HttpError } from "./errors";

// 统一的API响应格式
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  details?: any;
}

// 客户端数据请求函数
export async function fetcher<T>(
  url: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(url, options);
  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({
      message: `HTTP error! status: ${response.status}`,
    }));
    throw new HttpError(
      errorBody.message || "An unknown error occurred",
      response.status
    );
  }
  return response.json();
}

// 统一的错误处理函数
export function handleApiError(error: unknown, context: string): NextResponse {
  console.error(`${context}错误:`, error);

  const errorMessage = error instanceof Error ? error.message : "未知错误";

  return NextResponse.json(
    {
      success: false,
      error: `${context}失败`,
      details: errorMessage,
    },
    { status: 500 }
  );
}

// 处理InfluxDB查询错误的函数
export function handleInfluxQueryError(
  error: unknown,
  queryType: string
): void {
  console.error(`查询${queryType}失败:`, error);
}

// 统一的成功响应函数
export function createSuccessResponse<T>(data: T): NextResponse {
  return NextResponse.json({
    success: true,
    data,
  });
}

// 统一的验证错误响应函数
export function createValidationErrorResponse(details: any): NextResponse {
  return NextResponse.json(
    {
      success: false,
      error: "输入数据验证失败",
      details,
    },
    { status: 400 }
  );
}

// 构建InfluxDB查询的通用函数
export function buildInfluxQuery(
  bucket: string,
  measurement: string,
  startTime: string,
  endTime: string,
  groupBy?: string,
  distinctColumn?: string
): string {
  let query = `
    from(bucket: "${bucket}")
      |> range(start: ${startTime}, stop: ${endTime})
      |> filter(fn: (r) => r._measurement == "${measurement}")
  `;

  if (groupBy) {
    query += `|> group(columns: ["${groupBy}"])`;
  }

  if (distinctColumn) {
    query += `|> distinct(column: "${distinctColumn}")`;
  }

  query += `|> sort(columns: ["${groupBy || distinctColumn || "_time"}"])\n`;

  return query;
}

// 处理InfluxDB查询结果的通用函数
export function processInfluxResults(
  results: any[],
  columnName: string,
  labelPrefix: string = "全部"
): Array<{ label: string; value: string }> {
  const options = [
    {
      label: `${labelPrefix}${columnName === "project" ? "项目" : columnName === "tag" ? "标签" : columnName === "domain" ? "域名" : "区域"}`,
      value: "all",
    },
  ];

  for (const result of results) {
    const value = result[columnName]
      ? result[columnName].replace(/^"|"$/g, "")
      : "";
    if (value && value !== "unknown") {
      options.push({
        label: value,
        value: value,
      });
    }
  }

  return options;
}

// 验证必需参数
export function validateRequiredParams(
  searchParams: URLSearchParams,
  requiredParams: string[]
): string | null {
  for (const param of requiredParams) {
    if (!searchParams.get(param)) {
      return `缺少必需参数: ${param}`;
    }
  }
  return null;
}
