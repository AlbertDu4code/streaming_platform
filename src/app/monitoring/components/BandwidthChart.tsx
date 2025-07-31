import React, { useMemo } from "react";
import ReactECharts from "echarts-for-react";
import { ChartData } from "./types";
import dayjs from "dayjs";

interface BandwidthChartProps {
  data: ChartData[];
  loading?: boolean;
  type?: "line" | "bar";
  height?: number;
}

export default function BandwidthChart({
  data,
  loading,
  type = "line",
  height = 400,
}: BandwidthChartProps) {
  const option = useMemo(() => {
    const xAxisData = data.map((d) => dayjs(d.time).format("YYYY-MM-DD HH:mm"));
    const uploadData = data.map((d) => d.upload || 0);
    const downloadData = data.map((d) => d.download || 0);

    return {
      tooltip: {
        trigger: "axis",
        axisPointer: {
          animation: false, // 关键：禁用动画减少闪烁
        },
      },
      legend: { data: ["上行带宽峰值", "下行带宽峰值"] },
      xAxis: {
        type: "category",
        data: xAxisData,
        axisLabel: { formatter: (value: string) => value.slice(5, 16) },
      },
      yAxis: { type: "value", name: "Mbps" },
      series: [
        {
          name: "上行带宽峰值",
          type,
          data: uploadData,
          smooth: type === "line",
          lineStyle: type === "line" ? { color: "#3b82f6" } : undefined,
          itemStyle: type === "bar" ? { color: "#3b82f6" } : undefined,
        },
        {
          name: "下行带宽峰值",
          type,
          data: downloadData,
          smooth: type === "line",
          lineStyle: type === "line" ? { color: "#10b981" } : undefined,
          itemStyle: type === "bar" ? { color: "#10b981" } : undefined,
        },
      ],
      animation: false, // 关键：禁用动画
    };
  }, [data, type]);

  return (
    <ReactECharts
      option={option}
      style={{ width: "100%", height }}
      showLoading={loading}
      notMerge={false} // ECharts官方推荐：允许增量更新，避免重新创建图表
    />
  );
}
