"use client";

import { Table, Card } from "antd";
import { formatBandwidth } from "@/lib/utils";
import { ChartData } from "./types";

interface BandwidthTableProps {
  data: ChartData[];
  loading: boolean;
}

export default function BandwidthTable({ data, loading }: BandwidthTableProps) {
  const columns = [
    {
      title: "时间",
      dataIndex: "time",
      key: "time",
      width: 180,
      render: (time: string) => {
        return new Date(time).toLocaleString("zh-CN", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        });
      },
      sorter: (a: ChartData, b: ChartData) =>
        new Date(a.time).getTime() - new Date(b.time).getTime(),
    },
    {
      title: "项目",
      dataIndex: "project",
      key: "project",
      width: 120,
      render: (project: string) => project || "未知",
    },
    {
      title: "域名",
      dataIndex: "domain",
      key: "domain",
      width: 150,
      render: (domain: string) => domain || "未知",
    },
    {
      title: "区域",
      dataIndex: "region",
      key: "region",
      width: 100,
      render: (region: string) => region || "未知",
    },
    {
      title: "标签",
      dataIndex: "tag",
      key: "tag",
      width: 100,
      render: (tag: string) => tag || "未知",
    },
    {
      title: "上行带宽峰值",
      dataIndex: "upload",
      key: "upload",
      width: 150,
      render: (upload: number) => {
        try {
          return formatBandwidth(upload * 1000000);
        } catch (err) {
          return `${upload?.toFixed(3) || 0} Mbps`;
        }
      },
      sorter: (a: ChartData, b: ChartData) => a.upload - b.upload,
    },
    {
      title: "下行带宽峰值",
      dataIndex: "download",
      key: "download",
      width: 150,
      render: (download: number) => {
        try {
          return formatBandwidth(download * 1000000);
        } catch (err) {
          return `${download?.toFixed(3) || 0} Mbps`;
        }
      },
      sorter: (a: ChartData, b: ChartData) => a.download - b.download,
    },
    {
      title: "总带宽",
      key: "total",
      width: 150,
      render: (record: ChartData) => {
        try {
          const total = record.upload + record.download;
          return formatBandwidth(total * 1000000);
        } catch (err) {
          const total = (record.upload || 0) + (record.download || 0);
          return `${total.toFixed(3)} Mbps`;
        }
      },
      sorter: (a: ChartData, b: ChartData) =>
        a.upload + a.download - (b.upload + b.download),
    },
  ];

  // 为表格数据添加唯一键
  const tableData = data.map((item, index) => ({
    ...item,
    key: `${item.time}-${item.project}-${index}`,
  }));

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="text-gray-500 mb-2">暂无项目文件带宽数据</div>
          <div className="text-gray-400 text-sm">
            请先从上方筛选条件中选择项目
          </div>
        </div>
      </div>
    );
  }

  return (
    <Card>
      <Table
        columns={columns}
        dataSource={tableData}
        loading={loading}
        pagination={{
          pageSize: 20,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) =>
            `第 ${range[0]}-${range[1]} 条/共 ${total} 条`,
        }}
        scroll={{ x: 1200 }}
        size="middle"
      />
    </Card>
  );
}
