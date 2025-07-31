"use client";

import { Card, Row, Col, Statistic, Tabs } from "antd";
import {
  DatabaseOutlined,
  DownloadOutlined,
  ClockCircleOutlined,
  DesktopOutlined,
} from "@ant-design/icons";
import BandwidthChart from "./BandwidthChart";
import BandwidthBarChart from "./BandwidthBarChart";
import BandwidthTable from "./BandwidthTable";
import { formatBandwidth, formatDuration, formatCount } from "@/lib/utils";
import { ChartData } from "./types";

interface BandwidthTabProps {
  chartData: ChartData[];
  loading: boolean;
  viewMode: string;
  dateRange: string[] | null;
  onViewModeChange: (mode: string) => void;
}

export default function BandwidthTab({
  chartData,
  loading,
  viewMode,
  dateRange,
  onViewModeChange,
}: BandwidthTabProps) {
  // 动态统计数据
  const uploadPeak = Math.max(...chartData.map((d) => d.upload || 0), 0);
  const downloadPeak = Math.max(...chartData.map((d) => d.download || 0), 0);
  // ChartData 没有 duration 字段，totalDuration 设为 0 或后续补充
  const totalDuration = 0;
  // 活跃服务数（以 domain 计）
  const activeServices = new Set(chartData.map((d) => d.domain)).size;

  const tabItems = [
    {
      key: "line",
      label: "折线图",
      children: <BandwidthChart data={chartData} loading={loading} />,
    },
    {
      key: "bar",
      label: "柱状图",
      children: <BandwidthBarChart data={chartData} loading={loading} />,
    },
    {
      key: "table",
      label: "数据表格",
      children: <BandwidthTable data={chartData} loading={loading} />,
    },
  ];

  return (
    <div className="space-y-6">
      {/* 当前带宽统计 */}
      <Row gutter={[16, 16]}>
        <Col span={6}>
          <Card>
            <Statistic
              title="上行带宽峰值"
              value={formatBandwidth(uploadPeak * 1000000)}
              prefix={<DatabaseOutlined style={{ color: "#165dff" }} />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="下行带宽峰值"
              value={formatBandwidth(downloadPeak * 1000000)}
              prefix={<DownloadOutlined style={{ color: "#00b42a" }} />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="总观看时长"
              value={formatDuration(totalDuration)}
              prefix={<ClockCircleOutlined style={{ color: "#ff7d00" }} />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="活跃服务"
              value={formatCount(activeServices)}
              suffix="个"
              prefix={<DesktopOutlined style={{ color: "#722ed1" }} />}
            />
          </Card>
        </Col>
      </Row>

      {/* 图表展示 */}
      <Card
        title={
          <div>
            <span>带宽使用趋势</span>
            {dateRange && (
              <span className="text-sm text-gray-500 ml-2">
                ({new Date(dateRange[0]).toLocaleDateString()} -{" "}
                {new Date(dateRange[1]).toLocaleDateString()})
              </span>
            )}
          </div>
        }
      >
        <Tabs
          activeKey={viewMode}
          onChange={onViewModeChange}
          items={tabItems}
        />
      </Card>
    </div>
  );
}
