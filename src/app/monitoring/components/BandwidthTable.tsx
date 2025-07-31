"use client";

import { Table, Card, Tag, Tooltip } from "antd";
import { useMemo } from "react";
import { formatBandwidth } from "@/lib/utils";
import { ChartData } from "./types";
import { ClockCircleOutlined, CloudServerOutlined } from "@ant-design/icons";

interface BandwidthTableProps {
  data: ChartData[];
  loading: boolean;
}

export default function BandwidthTable({ data, loading }: BandwidthTableProps) {
  // 安全的带宽格式化函数
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

  // 使用useMemo缓存列配置
  const columns = useMemo(
    () => [
      {
        title: "时间",
        dataIndex: "time",
        key: "time",
        width: 180,
        fixed: "left" as const,
        render: (time: string) => {
          const date = new Date(time);
          const isValidDate = !isNaN(date.getTime());

          if (!isValidDate) {
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
        sorter: (a: ChartData, b: ChartData) =>
          new Date(a.time).getTime() - new Date(b.time).getTime(),
        defaultSortOrder: "descend" as const,
      },
      {
        title: "项目",
        dataIndex: "project",
        key: "project",
        width: 140,
        render: (project: string) => (
          <Tooltip title={project || "未知项目"}>
            <Tag color="blue" icon={<CloudServerOutlined />}>
              {project || "未知"}
            </Tag>
          </Tooltip>
        ),
        filters: Array.from(
          new Set(data.map((d) => d.project).filter(Boolean))
        ).map((project) => ({
          text: project as string,
          value: project as string,
        })),
        onFilter: (value: any, record: ChartData) => record.project === value,
      },
      {
        title: "域名",
        dataIndex: "domain",
        key: "domain",
        width: 150,
        render: (domain: string) => (
          <Tooltip title={domain || "未知域名"}>
            <span className="text-xs font-mono">{domain || "未知"}</span>
          </Tooltip>
        ),
        filters: Array.from(
          new Set(data.map((d) => d.domain).filter(Boolean))
        ).map((domain) => ({
          text: domain as string,
          value: domain as string,
        })),
        onFilter: (value: any, record: ChartData) => record.domain === value,
      },
      {
        title: "区域",
        dataIndex: "region",
        key: "region",
        width: 100,
        render: (region: string) => (
          <Tag color={region === "china" ? "green" : "orange"}>
            {region || "未知"}
          </Tag>
        ),
        filters: Array.from(
          new Set(data.map((d) => d.region).filter(Boolean))
        ).map((region) => ({
          text: region as string,
          value: region as string,
        })),
        onFilter: (value: any, record: ChartData) => record.region === value,
      },
      {
        title: "标签",
        dataIndex: "tag",
        key: "tag",
        width: 100,
        render: (tag: string) => <Tag color="purple">{tag || "未知"}</Tag>,
      },
      {
        title: "上行带宽峰值",
        dataIndex: "upload",
        key: "upload",
        width: 150,
        render: (upload: number) => (
          <span className="font-semibold text-blue-600">
            {safeBandwidthFormat(upload)}
          </span>
        ),
        sorter: (a: ChartData, b: ChartData) =>
          (a.upload || 0) - (b.upload || 0),
      },
      {
        title: "下行带宽峰值",
        dataIndex: "download",
        key: "download",
        width: 150,
        render: (download: number) => (
          <span className="font-semibold text-green-600">
            {safeBandwidthFormat(download)}
          </span>
        ),
        sorter: (a: ChartData, b: ChartData) =>
          (a.download || 0) - (b.download || 0),
      },
      {
        title: "总带宽",
        key: "total",
        width: 150,
        render: (record: ChartData) => {
          const total = (record.upload || 0) + (record.download || 0);
          return (
            <span className="font-bold text-purple-600">
              {safeBandwidthFormat(total)}
            </span>
          );
        },
        sorter: (a: ChartData, b: ChartData) => {
          const totalA = (a.upload || 0) + (a.download || 0);
          const totalB = (b.upload || 0) + (b.download || 0);
          return totalA - totalB;
        },
      },
    ],
    [data]
  );

  // 使用useMemo缓存表格数据
  const tableData = useMemo(
    () =>
      data.map((item, index) => ({
        ...item,
        key: `${item.time}-${item.project}-${index}`,
      })),
    [data]
  );

  // 计算统计信息
  const statistics = useMemo(() => {
    const totalUpload = data.reduce((sum, item) => sum + (item.upload || 0), 0);
    const totalDownload = data.reduce(
      (sum, item) => sum + (item.download || 0),
      0
    );
    const avgUpload = totalUpload / (data.length || 1);
    const avgDownload = totalDownload / (data.length || 1);

    return {
      totalRecords: data.length,
      totalUpload,
      totalDownload,
      avgUpload,
      avgDownload,
    };
  }, [data]);

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="text-gray-500 mb-2 text-lg">暂无带宽数据</div>
          <div className="text-gray-400 text-sm">
            请先从上方筛选条件中选择项目和时间范围
          </div>
        </div>
      </div>
    );
  }

  return (
    <Card
      title={
        <div className="flex items-center justify-between">
          <span>带宽数据详情</span>
          <div className="text-sm text-gray-500">
            总计 {statistics.totalRecords} 条记录 | 平均上行:{" "}
            {safeBandwidthFormat(statistics.avgUpload)} | 平均下行:{" "}
            {safeBandwidthFormat(statistics.avgDownload)}
          </div>
        </div>
      }
    >
      <Table
        columns={columns}
        dataSource={tableData}
        loading={loading}
        pagination={{
          pageSize: 20,
          showSizeChanger: true,
          showQuickJumper: true,
          pageSizeOptions: ["10", "20", "50", "100"],
          showTotal: (total, range) =>
            `第 ${range?.[0]}-${range?.[1]} 条/共 ${total} 条`,
        }}
        scroll={{ x: 1300, y: 600 }}
        size="small"
        bordered
        rowClassName={(record, index) =>
          index % 2 === 0 ? "bg-gray-50" : "bg-white"
        }
      />
    </Card>
  );
}
