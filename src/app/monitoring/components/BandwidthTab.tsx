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
import { formatBandwidth } from "@/lib/utils";
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
  // 计算统计数据
  const currentUpload =
    chartData.length > 0 && chartData[chartData.length - 1]?.upload
      ? chartData[chartData.length - 1].upload
      : 0;
  const currentDownload =
    chartData.length > 0 && chartData[chartData.length - 1]?.download
      ? chartData[chartData.length - 1].download
      : 0;

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
              value={formatBandwidth(currentUpload * 1000000)}
              prefix={<DatabaseOutlined style={{ color: "#165dff" }} />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="下行带宽峰值"
              value={formatBandwidth(currentDownload * 1000000)}
              prefix={<DownloadOutlined style={{ color: "#00b42a" }} />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="总观看时长"
              value={120}
              suffix="分钟"
              prefix={<ClockCircleOutlined style={{ color: "#ff7d00" }} />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="活跃服务"
              value={3}
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
