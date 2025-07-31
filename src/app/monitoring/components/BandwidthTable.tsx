"use client";

import { ProTable } from "@ant-design/pro-components";
import { Tag, Tooltip } from "antd";
import { formatBandwidth } from "@/lib/utils";
import { ChartData, FilterState } from "./types";
import { ClockCircleOutlined, CloudServerOutlined } from "@ant-design/icons";
import { fetcher } from "@/lib/api-utils";
import type { ProColumns, ProTableProps } from "@ant-design/pro-components";
import dayjs from "dayjs";

interface BandwidthTableProps {
  filters?: Partial<FilterState>;
}

interface ApiResponse {
  data: ChartData[];
  total: number;
}

export default function BandwidthTable({ filters }: BandwidthTableProps) {
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
        const date = dayjs(time as string);
        if (!date.isValid()) {
          return <Tag color="red">无效时间</Tag>;
        }
        return (
          <Tooltip title={`完整时间: ${date.format("YYYY-MM-DD HH:mm:ss")}`}>
            <div className="flex items-center">
              <ClockCircleOutlined className="mr-1 text-blue-500" />
              <span className="text-xs">
                {date.format("YYYY-MM-DD")}
                <br />
                {date.format("HH:mm")}
              </span>
            </div>
          </Tooltip>
        );
      },
      sorter: true,
      defaultSortOrder: "descend",
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

  const handleRequest: ProTableProps<
    ChartData,
    Record<string, any>
  >["request"] = async (params, sort) => {
    const queryParams = new URLSearchParams();

    // 合并和处理所有参数
    const allParams = { ...filters, ...params };

    // 1. 分页
    queryParams.append("page", (allParams.current || 1).toString());
    queryParams.append("pageSize", (allParams.pageSize || 20).toString());

    // 2. 排序
    if (sort) {
      Object.keys(sort).forEach((key) => {
        queryParams.append("sortField", key);
        queryParams.append("sortOrder", sort[key] as string);
      });
    }

    // 3. 筛选条件 (除 dateRange 外)
    Object.entries(allParams).forEach(([key, value]) => {
      if (
        key !== "dateRange" &&
        key !== "current" &&
        key !== "pageSize" &&
        value !== undefined &&
        value !== null &&
        value !== ""
      ) {
        queryParams.append(key, String(value));
      }
    });

    // 4. 时间范围 (最关键)
    let dateRangeToUse = allParams.dateRange;
    if (
      !dateRangeToUse ||
      !Array.isArray(dateRangeToUse) ||
      dateRangeToUse.length !== 2
    ) {
      // 提供一个可靠的默认值
      const now = dayjs();
      dateRangeToUse = [now.subtract(1, "day"), now];
    }
    // 在最后一刻格式化
    queryParams.append("startTime", dateRangeToUse[0].toISOString());
    queryParams.append("endTime", dateRangeToUse[1].toISOString());

    const url = `/api/bandwidth?${queryParams.toString()}`;
    console.log("请求 URL:", url);

    try {
      const result = await fetcher<{ data: ApiResponse }>(url);
      return {
        data: result.data.data || [],
        success: true,
        total: result.data.total || 0,
      };
    } catch (error) {
      console.error("API 请求失败:", error);
      return {
        data: [],
        success: false,
        total: 0,
      };
    }
  };

  return (
    <ProTable<ChartData>
      columns={columns}
      cardBordered
      request={handleRequest}
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
      params={filters}
    />
  );
}
