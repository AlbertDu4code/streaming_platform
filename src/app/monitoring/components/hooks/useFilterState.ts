import { useState, useCallback, useEffect } from "react";
import dayjs, { Dayjs } from "dayjs";
import { FilterState } from "../types";

// 根据 timeRange 计算 dateRange 的辅助函数
const calculateDateRange = (timeRange: string): [Dayjs, Dayjs] | null => {
  const now = dayjs();
  switch (timeRange) {
    case "today":
      return [now.startOf("day"), now.endOf("day")];
    case "yesterday":
      const yesterday = now.subtract(1, "day");
      return [yesterday.startOf("day"), yesterday.endOf("day")];
    case "7days":
      return [now.subtract(7, "day").startOf("day"), now.endOf("day")];
    case "30days":
      return [now.subtract(30, "day").startOf("day"), now.endOf("day")];
    default:
      // 默认返回今天
      return [now.startOf("day"), now.endOf("day")];
  }
};

const initialFilterState: FilterState = {
  project: "",
  tag: "",
  domain: "",
  region: "",
  protocol: "",
  dateRange: calculateDateRange("today"),
  granularity: "1hour",
  timeRange: "today",
};

export const useFilterState = () => {
  const [filters, setFilters] = useState<FilterState>(initialFilterState);

  // 更新单个筛选条件
  const updateFilter = useCallback(
    <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
      setFilters((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  // 批量更新筛选条件
  const updateFilters = useCallback((newFilters: Partial<FilterState>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  }, []);

  // 重置筛选条件
  const resetFilters = useCallback(() => {
    setFilters(initialFilterState);
  }, []);

  // 时间范围快捷选择
  const setTimeRange = useCallback((timeRange: string) => {
    const dateRange = calculateDateRange(timeRange);
    setFilters((prev) => ({ ...prev, timeRange, dateRange }));
  }, []);

  // 添加调试日志
  useEffect(() => {
    console.log("📊 useFilterState - 当前 filters 状态:", filters);
  }, [filters]);

  return {
    filters,
    updateFilter,
    updateFilters,
    resetFilters,
    setTimeRange,
  };
};
