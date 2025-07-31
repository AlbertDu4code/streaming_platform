"use client";

import { useState, useEffect } from "react";
import { signOut } from "next-auth/react";
import { Layout, Card, Tabs, message } from "antd";
import AppHeader from "./Header";
import FilterPanel from "./FilterPanel";
import { getTabItems, getTabComponent } from "./TabConfig";
import { User, FilterState } from "./types";
import { useMonitoringData } from "./hooks/useMonitoringData";
import { useFilterState } from "./hooks/useFilterState";
import { fetcher } from "@/lib/api-utils";
import { HttpError } from "@/lib/errors";

const { Content } = Layout;

interface MonitoringClientProps {
  user: User;
}

export default function MonitoringClient({ user }: MonitoringClientProps) {
  const [activeTab, setActiveTab] = useState("bandwidth");
  const [viewMode, setViewMode] = useState("line");

  const { filters, updateFilters, setTimeRange } = useFilterState();
  const {
    loading,
    data,
    options,
    loadBandwidthData,
    loadOptions,
    loadStreamingData,
    loadStorageData,
    loadLiveData,
    loadDurationData,
    loadScreenshotData,
    loadPushData,
    loadTranscodeData,
    loadDirectData,
    loadGuideData,
  } = useMonitoringData();

  // 统一处理筛选条件变化
  const handleFilterChange = (newFilters: Partial<FilterState>) => {
    updateFilters(newFilters);
  };

  // 处理时间范围快捷选择
  const handleTimeRangeChange = (timeRange: string) => {
    setTimeRange(timeRange);
  };

  // 自动根据筛选条件加载数据
  useEffect(() => {
    if (filters.project) {
      loadBandwidthData(filters);
      loadStreamingData(filters);
      loadStorageData(filters);
      loadLiveData(filters);
      loadDurationData(filters);
      loadScreenshotData(filters);
      loadPushData(filters);
      loadTranscodeData(filters);
      loadDirectData(filters);
      loadGuideData(filters);
    }
  }, [
    filters,
    loadBandwidthData,
    loadStreamingData,
    loadStorageData,
    loadLiveData,
    loadDurationData,
    loadScreenshotData,
    loadPushData,
    loadTranscodeData,
    loadDirectData,
    loadGuideData,
  ]);

  // 处理登出
  const handleLogout = async () => {
    await signOut({ redirect: true, callbackUrl: "/auth/login" });
  };

  // 处理数据初始化
  const handleInitData = async () => {
    try {
      await fetcher("/api/init-data", { method: "POST" });
      message.success("数据初始化成功，请刷新页面查看数据");
      // 重新加载所有数据
      await Promise.all([
        loadOptions(),
        loadStreamingData(filters),
        loadStorageData(filters),
        loadLiveData(filters),
        loadDurationData(filters),
        loadScreenshotData(filters),
        loadPushData(filters),
        loadTranscodeData(filters),
        loadDirectData(filters),
        loadGuideData(filters),
        loadBandwidthData(filters),
      ]);
    } catch (error) {
      if (error instanceof HttpError) {
        message.error(error.message);
      } else {
        message.error("数据初始化失败，请检查InfluxDB连接");
      }
    }
  };

  // 从配置中获取tab项目
  const tabItems = getTabItems();

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
              style={{ marginBottom: 16 }}
            />

            <FilterPanel
              project={filters.project}
              tag={filters.tag}
              domain={filters.domain}
              region={filters.region}
              protocol={filters.protocol}
              dateRange={filters.dateRange}
              granularity={filters.granularity}
              timeRange={filters.timeRange}
              onProjectChange={(value) =>
                handleFilterChange({ project: value })
              }
              onTagChange={(value) => handleFilterChange({ tag: value })}
              onDomainChange={(value) => handleFilterChange({ domain: value })}
              onRegionChange={(value) => handleFilterChange({ region: value })}
              onProtocolChange={(value) =>
                handleFilterChange({ protocol: value })
              }
              onDateRangeChange={(dateStrings) =>
                handleFilterChange({
                  dateRange:
                    dateStrings && dateStrings.length === 2
                      ? dateStrings
                      : null,
                })
              }
              onGranularityChange={(value) =>
                handleFilterChange({ granularity: value })
              }
              onTimeRangeChange={handleTimeRangeChange}
              projectOptions={options.projectOptions}
              tagOptions={options.tagOptions}
              domainOptions={options.domainOptions}
              regionOptions={options.regionOptions}
            />

            <div style={{ marginTop: 24 }}>
              {getTabComponent(activeTab, {
                data,
                loading,
                viewMode,
                filters,
                onViewModeChange: setViewMode,
              })}
            </div>
          </Card>
        </div>
      </Content>
    </Layout>
  );
}
