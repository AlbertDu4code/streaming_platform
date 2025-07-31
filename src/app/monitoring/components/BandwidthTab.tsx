"use client";

import { Card, Row, Col, Statistic, Tabs } from "antd";
import {
  DatabaseOutlined,
  DownloadOutlined,
  ClockCircleOutlined,
  DesktopOutlined,
} from "@ant-design/icons";
import { useMemo } from "react";
import BandwidthChart from "./BandwidthChart";
import BandwidthTable from "./BandwidthTable";
import { formatBandwidth, formatDuration, formatCount } from "@/lib/utils";
import { ChartData, FilterState } from "./types";

interface BandwidthTabProps {
  chartData: ChartData[];
  loading: boolean;
  viewMode: string;
  dateRange: string[] | null;
  filters: FilterState; // 接收筛选条件
  onViewModeChange: (mode: string) => void;
}

export default function BandwidthTab({
  chartData,
  loading,
  viewMode,
  dateRange,
  filters,
  onViewModeChange,
}: BandwidthTabProps) {
  // 统计数据部分保持不变
  const statistics = useMemo(() => {
    // ... (统计逻辑不变)
    if (!chartData || chartData.length === 0) {
      return {
        uploadPeak: 0,
        downloadPeak: 0,
        totalBandwidth: 0,
        activeServices: 0,
        totalDuration: 0,
      };
    }

    const uploadValues = chartData.map((d) => d.upload || 0);
    const downloadValues = chartData.map((d) => d.download || 0);

    const uploadPeak = Math.max(...uploadValues, 0);
    const downloadPeak = Math.max(...downloadValues, 0);
    const totalBandwidth = uploadPeak + downloadPeak;

    const uniqueDomains = new Set(
      chartData
        .map((d) => d.domain)
        .filter((domain) => domain && domain !== "未知")
    );
    const activeServices = uniqueDomains.size;

    const totalDuration = chartData.reduce((acc, curr) => {
      return acc + (curr.upload > 0 || curr.download > 0 ? 5 * 60 : 0);
    }, 0);

    return {
      uploadPeak,
      downloadPeak,
      totalBandwidth,
      activeServices,
      totalDuration,
    };
  }, [chartData]);

  const tabItems = useMemo(
    () => [
      { key: "line", label: "折线图" },
      { key: "bar", label: "柱状图" },
      { key: "table", label: "数据表格" },
    ],
    []
  );

  const renderContent = () => {
    if (viewMode === "table") {
      // 传递筛选条件给 BandwidthTable
      return <BandwidthTable filters={filters} />;
    }
    return (
      <BandwidthChart
        data={chartData}
        loading={loading}
        type={viewMode as "line" | "bar"}
      />
    );
  };

  const renderStatisticCard = (
    title: string,
    value: string | number,
    icon: React.ReactNode,
    suffix?: string
  ) => (
    <Card hoverable className="h-full">
      <Statistic
        title={title}
        value={value}
        suffix={suffix}
        prefix={icon}
        valueStyle={{ fontSize: "20px", fontWeight: 600 }}
      />
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* 统计卡片... */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          {renderStatisticCard(
            "上行带宽峰值",
            formatBandwidth(statistics.uploadPeak * 1000000),
            <DatabaseOutlined style={{ color: "#3b82f6" }} />
          )}
        </Col>
        <Col xs={24} sm={12} lg={6}>
          {renderStatisticCard(
            "下行带宽峰值",
            formatBandwidth(statistics.downloadPeak * 1000000),
            <DownloadOutlined style={{ color: "#10b981" }} />
          )}
        </Col>
        <Col xs={24} sm={12} lg={6}>
          {renderStatisticCard(
            "总观看时长",
            formatDuration(statistics.totalDuration),
            <ClockCircleOutlined style={{ color: "#f59e0b" }} />
          )}
        </Col>
        <Col xs={24} sm={12} lg={6}>
          {renderStatisticCard(
            "活跃服务",
            formatCount(statistics.activeServices),
            <DesktopOutlined style={{ color: "#8b5cf6" }} />,
            "个"
          )}
        </Col>
      </Row>

      <Card
        title={
          <div className="flex items-center justify-between">
            <span className="text-lg font-semibold">带宽使用趋势</span>
            {dateRange && (
              <span className="text-sm text-gray-500">
                {new Date(dateRange[0]).toLocaleDateString()} -{" "}
                {new Date(dateRange[1]).toLocaleDateString()}
              </span>
            )}
          </div>
        }
        className="overflow-hidden"
      >
        <Tabs
          activeKey={viewMode}
          onChange={onViewModeChange}
          items={tabItems}
          size="middle"
          type="card"
          animated={false}
        />
        <div style={{ marginTop: 16 }}>{renderContent()}</div>
      </Card>
    </div>
  );
}
