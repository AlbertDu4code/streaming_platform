"use client";

import { Card, Empty } from "antd";
import BandwidthTab from "./BandwidthTab";
import StreamingTab from "./StreamingTab";
import LiveTab from "./LiveTab";
import StorageTab from "./StorageTab";
import { ChartData } from "./types";
import TranscodeTab from "./TranscodeTab";
import ScreenshotTab from "./ScreenshotTab";
import PushTab from "./PushTab";
import TranscodeBandwidthTab from "./TranscodeBandwidthTab";
import DirectBandwidthTab from "./DirectBandwidthTab";
import GuideTab from "./GuideTab";

interface TabContentProps {
  activeTab: string;
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
  loading: boolean;
  viewMode: string;
  dateRange: string[] | null;
  onViewModeChange: (mode: string) => void;
}

export default function TabContent({
  activeTab,
  chartData,
  streamingData,
  storageData,
  liveData,
  durationData,
  screenshotData,
  pushData,
  transcodeData,
  directData,
  guideData,
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

    case "live":
      return <LiveTab liveData={liveData || []} loading={loading} />;

    case "storage":
      return <StorageTab storageData={storageData || []} loading={loading} />;

    case "duration":
      return (
        <TranscodeTab transcodeData={durationData || []} loading={loading} />
      );

    case "screenshot":
      return (
        <ScreenshotTab
          screenshotData={screenshotData || []}
          loading={loading}
        />
      );

    case "push":
      return <PushTab pushData={pushData || []} loading={loading} />;

    case "transcode":
      return (
        <TranscodeBandwidthTab
          transcodeBandwidthData={transcodeData || []}
          loading={loading}
        />
      );

    case "direct":
      return (
        <DirectBandwidthTab
          directBandwidthData={directData || []}
          loading={loading}
        />
      );

    case "guide":
      return <GuideTab guideData={guideData || []} loading={loading} />;

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
