"use client";

import BandwidthTab from "./BandwidthTab";
import StreamingTab from "./StreamingTab";
import LiveTab from "./LiveTab";
import StorageTab from "./StorageTab";
import TranscodeTab from "./TranscodeTab";
import ScreenshotTab from "./ScreenshotTab";
import PushTab from "./PushTab";
import TranscodeBandwidthTab from "./TranscodeBandwidthTab";
import DirectBandwidthTab from "./DirectBandwidthTab";
import GuideTab from "./GuideTab";
import { ChartData, FilterState } from "./types"; // 导入 FilterState

interface TabData {
  chartData: ChartData[];
  streamingData: any[];
  storageData?: any[];
  liveData?: any[];
  durationData?: any[];
  screenshotData?: any[];
  pushData?: any[];
  transcodeData?: any[];
  directData?: any[];
  guideData?: any[];
}

interface TabComponentProps {
  data: TabData;
  loading: boolean;
  viewMode: string;
  filters: FilterState;
  onViewModeChange: (mode: string) => void;
}

interface TabConfig {
  key: string;
  label: string;
  component: React.ComponentType<any>;
  propsMapping: (data: TabComponentProps) => Record<string, any>;
}

export const TAB_CONFIGS: TabConfig[] = [
  {
    key: "bandwidth",
    label: "带宽用量",
    component: BandwidthTab,
    propsMapping: ({ data, loading, viewMode, filters, onViewModeChange }) => ({
      chartData: data.chartData,
      loading,
      viewMode,
      filters,
      onViewModeChange,
    }),
  },
  {
    key: "streaming",
    label: "流量用量",
    component: StreamingTab,
    propsMapping: ({ data }) => ({
      streamingData: data.streamingData,
    }),
  },
  {
    key: "live",
    label: "推拉流监控",
    component: LiveTab,
    propsMapping: ({ data, loading }) => ({
      liveData: data.liveData || [],
      loading,
    }),
  },
  {
    key: "storage",
    label: "存储用量",
    component: StorageTab,
    propsMapping: ({ data, loading }) => ({
      storageData: data.storageData || [],
      loading,
    }),
  },
  {
    key: "duration",
    label: "转码时长",
    component: TranscodeTab,
    propsMapping: ({ data, loading }) => ({
      transcodeData: data.durationData || [],
      loading,
    }),
  },
  {
    key: "screenshot",
    label: "截图张数",
    component: ScreenshotTab,
    propsMapping: ({ data, loading }) => ({
      screenshotData: data.screenshotData || [],
      loading,
    }),
  },
  {
    key: "push",
    label: "拉流转推",
    component: PushTab,
    propsMapping: ({ data, loading }) => ({
      pushData: data.pushData || [],
      loading,
    }),
  },
  {
    key: "transcode",
    label: "转推带宽",
    component: TranscodeBandwidthTab,
    propsMapping: ({ data, loading }) => ({
      transcodeBandwidthData: data.transcodeData || [],
      loading,
    }),
  },
  {
    key: "direct",
    label: "直播带宽",
    component: DirectBandwidthTab,
    propsMapping: ({ data, loading }) => ({
      directBandwidthData: data.directData || [],
      loading,
    }),
  },
  {
    key: "guide",
    label: "云导播",
    component: GuideTab,
    propsMapping: ({ data, loading }) => ({
      guideData: data.guideData || [],
      loading,
    }),
  },
];

export const getTabItems = () =>
  TAB_CONFIGS.map(({ key, label }) => ({ key, label }));

export const getTabComponent = (
  activeTab: string,
  tabData: TabComponentProps
) => {
  const config = TAB_CONFIGS.find((tab) => tab.key === activeTab);

  if (!config) {
    const { Card, Empty } = require("antd");
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

  const Component = config.component;
  const props = config.propsMapping(tabData);

  return <Component {...props} />;
};
