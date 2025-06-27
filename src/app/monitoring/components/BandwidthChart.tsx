import React from "react";
import ReactECharts from "echarts-for-react";
import { ChartData, TimeRange } from "./types";
import dayjs from "dayjs";

interface BandwidthChartProps {
  data: ChartData[];
  loading?: boolean;
  timeRange?: TimeRange;
}

export default function BandwidthChart({ data, loading }: BandwidthChartProps) {
  const option = {
    tooltip: { trigger: "axis" },
    legend: { data: ["上行带宽峰值", "下行带宽峰值"] },
    xAxis: {
      type: "category",
      data: data.map((d) => dayjs(d.time).format("YYYY-MM月DD日 HH:mm")),
      axisLabel: { formatter: (value: string) => value.slice(5, 16) },
    },
    yAxis: { type: "value", name: "Mbps" },
    series: [
      {
        name: "上行带宽峰值",
        type: "line",
        smooth: true,
        data: data.map((d) => d.upload),
        lineStyle: { color: "#3b82f6" },
      },
      {
        name: "下行带宽峰值",
        type: "line",
        smooth: true,
        data: data.map((d) => d.download),
        lineStyle: { color: "#10b981" },
      },
    ],
  };

  return (
    <ReactECharts
      option={option}
      style={{ width: "100%", height: 400 }}
      showLoading={loading}
      notMerge
      lazyUpdate
    />
  );
}
