"use client";

import { ProTable } from "@ant-design/pro-components";
import { Tag, Tooltip } from "antd";
import { formatBandwidth } from "@/lib/utils";
import { ChartData } from "./types";
import { ClockCircleOutlined, CloudServerOutlined } from "@ant-design/icons";
import { fetcher } from "@/lib/api-utils";
import type { ProColumns } from "@ant-design/pro-components";

interface BandwidthTableProps {
  filters?: Record<string, any>;
}

interface ApiResponse {
  data: ChartData[];
  total: number;
}

export default function BandwidthTable({ filters }: BandwidthTableProps) {
  // 添加调试日志
  console.log("BandwidthTable 接收到的 filters:", filters);

  // 确保 dateRange 有默认值
  const safeFilters = {
    ...(filters || {}),
    dateRange:
      filters?.dateRange ||
      (() => {
        const now = new Date();
        const startDate = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate()
        );
        return [startDate.toISOString(), now.toISOString()];
      })(),
  };

  console.log("BandwidthTable 处理后的 safeFilters:", safeFilters);

  const safeBandwidthFormat = (value: number | undefined): string => {
    if (typeof value !== "number" || isNaN(value)) {
      return "0.000 Mbps";
    }
    try {
      return formatBandwidth(value * 1000000);
    } catch {
      return `${value.toFixed(3)} Mbps`;
    }
  };

  const columns: ProColumns<ChartData>[] = [
    {
      title: "时间",
      dataIndex: "time",
      key: "time",
      width: 180,
      fixed: "left" as const,
      render: (time: any) => {
        const date = new Date(time as string);
        if (isNaN(date.getTime())) {
          return <Tag color="red">无效时间</Tag>;
        }
        const formatted = date.toLocaleString("zh-CN", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        });
        return (
          <Tooltip title={`完整时间: ${formatted}`}>
            <div className="flex items-center">
              <ClockCircleOutlined className="mr-1 text-blue-500" />
              <span className="text-xs">
                {date.toLocaleDateString("zh-CN")}
                <br />
                {date.toLocaleTimeString("zh-CN", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          </Tooltip>
        );
      },
      sorter: true,
      defaultSortOrder: "descend" as const,
    },
    {
      title: "项目",
      dataIndex: "project",
      key: "project",
      width: 140,
      render: (project: any) => (
        <Tooltip title={project || "未知项目"}>
          <Tag color="blue" icon={<CloudServerOutlined />}>
            {project || "未知"}
          </Tag>
        </Tooltip>
      ),
    },
    {
      title: "域名",
      dataIndex: "domain",
      key: "domain",
      width: 150,
      render: (domain: any) => (
        <Tooltip title={domain || "未知域名"}>
          <span className="text-xs font-mono">{domain || "未知"}</span>
        </Tooltip>
      ),
    },
    {
      title: "区域",
      dataIndex: "region",
      key: "region",
      width: 100,
      render: (region: any) => (
        <Tag color={region === "china" ? "green" : "orange"}>
          {region || "未知"}
        </Tag>
      ),
    },
    {
      title: "标签",
      dataIndex: "tag",
      key: "tag",
      width: 100,
      render: (tag: any) => <Tag color="purple">{tag || "未知"}</Tag>,
    },
    {
      title: "上行带宽峰值",
      dataIndex: "upload",
      key: "upload",
      width: 150,
      render: (upload: any) => (
        <span className="font-semibold text-blue-600">
          {safeBandwidthFormat(upload as number)}
        </span>
      ),
      sorter: true,
    },
    {
      title: "下行带宽峰值",
      dataIndex: "download",
      key: "download",
      width: 150,
      render: (download: any) => (
        <span className="font-semibold text-green-600">
          {safeBandwidthFormat(download as number)}
        </span>
      ),
      sorter: true,
    },
    {
      title: "总带宽",
      key: "total",
      width: 150,
      search: false,
      render: (_, record) => {
        const total = (record.upload || 0) + (record.download || 0);
        return (
          <span className="font-bold text-purple-600">
            {safeBandwidthFormat(total)}
          </span>
        );
      },
      sorter: true,
    },
  ];

  return (
    <ProTable<ChartData>
      columns={columns}
      cardBordered
      request={async (params, sort, filter) => {
        console.log("ProTable request 参数:", {
          params,
          sort,
          filter,
          filters,
        });

        const queryParams = new URLSearchParams({
          current: params.current?.toString() || "1",
          pageSize: params.pageSize?.toString() || "20",
        });

        // 正确处理筛选条件
        if (safeFilters) {
          Object.entries(safeFilters).forEach(([key, value]) => {
            console.log(`处理筛选条件 ${key}:`, value, typeof value);

            if (value !== undefined && value !== null) {
              if (
                key === "dateRange" &&
                Array.isArray(value) &&
                value.length === 2
              ) {
                // 特殊处理 dateRange 数组
                const dateRangeString = value.join(",");
                console.log("添加 dateRange 参数:", dateRangeString);
                queryParams.append("dateRange", dateRangeString);
              } else if (
                typeof value === "string" ||
                typeof value === "number"
              ) {
                // 处理普通的字符串和数字值
                console.log(`添加参数 ${key}:`, String(value));
                queryParams.append(key, String(value));
              }
            }
          });
        }

        // 处理 ProTable 内部的筛选条件
        Object.entries(filter).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            queryParams.append(key, String(value));
          }
        });

        // 处理排序参数
        Object.keys(sort).forEach((key) => {
          queryParams.append("sortField", key);
          queryParams.append("sortOrder", sort[key] as string);
        });

        console.log("最终请求参数:", queryParams.toString());

        const url = `/api/bandwidth?${queryParams.toString()}`;
        console.log("请求 URL:", url);

        try {
          const result: ApiResponse = await fetcher(url);
          console.log("API 响应:", result);

          return {
            data: result.data,
            success: true,
            total: result.total,
          };
        } catch (error) {
          console.error("API 请求失败:", error);
          throw error;
        }
      }}
      rowKey={(record) => `${record.time}-${record.project}-${Math.random()}`}
      pagination={{
        pageSize: 20,
        showSizeChanger: true,
        showQuickJumper: true,
        pageSizeOptions: ["10", "20", "50", "100"],
      }}
      scroll={{ x: 1300, y: 600 }}
      search={false}
      headerTitle="带宽数据详情"
      toolBarRender={false}
      params={safeFilters} // 将处理后的筛选条件作为 ProTable 的查询参数
    />
  );
}
