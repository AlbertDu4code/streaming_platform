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
  // 使用useMemo缓存统计数据计算
  const statistics = useMemo(() => {
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

    // 计算活跃服务数（去重domain）
    const uniqueDomains = new Set(
      chartData
        .map((d) => d.domain)
        .filter((domain) => domain && domain !== "未知")
    );
    const activeServices = uniqueDomains.size;

    // 模拟总观看时长（实际项目中应该从数据中获取）
    const totalDuration = chartData.reduce((acc, curr) => {
      // 假设每个数据点代表5分钟的时长
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
      {
        key: "line",
        label: "折线图",
        children: (
          <BandwidthChart data={chartData} loading={loading} type="line" />
        ),
      },
      {
        key: "bar",
        label: "柱状图",
        children: (
          <BandwidthChart data={chartData} loading={loading} type="bar" />
        ),
      },
      {
        key: "table",
        label: "数据表格",
        children: <BandwidthTable data={chartData} loading={loading} />,
      },
    ],
    [chartData, loading]
  );

  // 渲染统计卡片
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

  if (!chartData || chartData.length === 0) {
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
    <div className="space-y-6">
      {/* 当前带宽统计 */}
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

      {/* 图表展示 */}
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
          animated={false} // 简单禁用所有动画
        />
      </Card>
    </div>
  );
}
