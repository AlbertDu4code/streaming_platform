"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import { Layout, Card, Tabs, message } from "antd";
import AppHeader from "./Header";
import FilterPanel from "./FilterPanel";
import TabContent from "./TabContent";
import { User } from "./types";
import { useMonitoringData } from "./hooks/useMonitoringData";
import { useFilterState } from "./hooks/useFilterState";

const { Content } = Layout;

interface MonitoringClientProps {
  user: User;
}

export default function MonitoringClient({ user }: MonitoringClientProps) {
  const [activeTab, setActiveTab] = useState("bandwidth");
  const [viewMode, setViewMode] = useState("line");

  const { filters, updateFilter, setTimeRange } = useFilterState();
  const { loading, chartData, streamingData, options, loadBandwidthData } =
    useMonitoringData();

  // 处理筛选条件变化
  const handleFilterChange = async (key: keyof typeof filters, value: any) => {
    updateFilter(key, value);

    // 如果是项目变化，立即加载数据
    if (key === "project") {
      await loadBandwidthData({ ...filters, [key]: value });
    }
  };

  // 处理时间范围变化
  const handleDateRangeChange = async (dateStrings: string[], dates: any[]) => {
    const newDateRange =
      dateStrings && dateStrings.length === 2 ? dateStrings : null;
    updateFilter("dateRange", newDateRange);

    if (filters.project) {
      await loadBandwidthData({ ...filters, dateRange: newDateRange });
    }
  };

  // 处理粒度变化
  const handleGranularityChange = async (granularity: string) => {
    updateFilter("granularity", granularity);

    if (filters.project) {
      await loadBandwidthData({ ...filters, granularity });
    }
  };

  // 处理时间范围快捷选择
  const handleTimeRangeChange = async (timeRange: string) => {
    setTimeRange(timeRange);

    if (filters.project) {
      await loadBandwidthData({ ...filters, timeRange });
    }
  };

  // 处理登出
  const handleLogout = async () => {
    await signOut({ redirect: true, callbackUrl: "/auth/login" });
  };

  // 处理数据初始化
  const handleInitData = async () => {
    try {
      const response = await fetch("/api/init-data", { method: "POST" });
      if (!response.ok) throw new Error("初始化失败");
      await response.json();
      message.success("数据初始化成功，请刷新页面查看数据");
    } catch (error) {
      message.error("数据初始化失败，请检查InfluxDB连接");
    }
  };

  const tabItems = [
    { key: "bandwidth", label: "带宽用量" },
    { key: "streaming", label: "流量用量" },
    { key: "live", label: "推拉流监控" },
    { key: "storage", label: "存储用量" },
    { key: "duration", label: "转码时长" },
    { key: "screenshot", label: "截图张数" },
    { key: "push", label: "拉流转推" },
    { key: "transcode", label: "转推带宽" },
    { key: "direct", label: "直播带宽" },
    { key: "guide", label: "云导播" },
  ];

  return (
    <Layout style={{ minHeight: "100vh", background: "#f7fafc" }}>
      <AppHeader
        user={user}
        onLogout={handleLogout}
        onInitData={handleInitData}
      />
      <Content style={{ padding: 24 }}>
        <div style={{ maxWidth: "100%", margin: "0 auto" }}>
          <Card
            style={{
              marginBottom: 24,
              background: "#fff",
              borderRadius: 8,
              boxShadow: "0 1px 4px rgba(0,21,41,.08)",
              border: "1px solid #f0f0f0",
            }}
          >
            <Tabs
              activeKey={activeTab}
              onChange={setActiveTab}
              type="card"
              items={tabItems}
              style={{ background: "#fff", borderRadius: 8, marginBottom: 16 }}
            />
          </Card>

          <FilterPanel
            project={filters.project}
            tag={filters.tag}
            domain={filters.domain}
            region={filters.region}
            protocol={filters.protocol}
            dateRange={filters.dateRange}
            granularity={filters.granularity}
            timeRange={filters.timeRange}
            onProjectChange={(value) => handleFilterChange("project", value)}
            onTagChange={(value) => handleFilterChange("tag", value)}
            onDomainChange={(value) => handleFilterChange("domain", value)}
            onRegionChange={(value) => handleFilterChange("region", value)}
            onProtocolChange={(value) => handleFilterChange("protocol", value)}
            onDateRangeChange={handleDateRangeChange}
            onGranularityChange={handleGranularityChange}
            onTimeRangeChange={handleTimeRangeChange}
            projectOptions={options.projectOptions}
            tagOptions={options.tagOptions}
            domainOptions={options.domainOptions}
            regionOptions={options.regionOptions}
          />

          <TabContent
            activeTab={activeTab}
            chartData={chartData}
            streamingData={streamingData}
            loading={loading}
            viewMode={viewMode}
            dateRange={filters.dateRange}
            onViewModeChange={setViewMode}
          />
        </div>
      </Content>
    </Layout>
  );
}
