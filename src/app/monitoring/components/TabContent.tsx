"use client";

import { Card, Empty } from "antd";
import BandwidthTab from "./BandwidthTab";
import StreamingTab from "./StreamingTab";
import { ChartData } from "./types";

interface TabContentProps {
  activeTab: string;
  chartData: ChartData[];
  streamingData: any[];
  loading: boolean;
  viewMode: string;
  dateRange: string[] | null;
  onViewModeChange: (mode: string) => void;
}

export default function TabContent({
  activeTab,
  chartData,
  streamingData,
  loading,
  viewMode,
  dateRange,
  onViewModeChange,
}: TabContentProps) {
  switch (activeTab) {
    case "bandwidth":
      return (
        <BandwidthTab
          chartData={chartData}
          loading={loading}
          viewMode={viewMode}
          dateRange={dateRange}
          onViewModeChange={onViewModeChange}
        />
      );

    case "streaming":
      return <StreamingTab streamingData={streamingData} />;

    default:
      return (
        <Card
          title={activeTab}
          style={{
            background: "#fff",
            borderRadius: 8,
            boxShadow: "0 1px 4px rgba(0,21,41,.08)",
            border: "1px solid #f0f0f0",
          }}
        >
          <Empty description="该功能正在开发中..." />
        </Card>
      );
  }
}
