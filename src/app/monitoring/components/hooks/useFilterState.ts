import { useState, useCallback, useEffect } from "react";
import { FilterState } from "../types";

// 根据 timeRange 计算 dateRange 的辅助函数
const calculateDateRange = (timeRange: string): string[] | null => {
  const now = new Date();
  let startDate: Date;

  switch (timeRange) {
    case "today":
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      return [startDate.toISOString(), now.toISOString()];
    case "yesterday":
      const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      startDate = new Date(
        yesterday.getFullYear(),
        yesterday.getMonth(),
        yesterday.getDate()
      );
      const endDate = new Date(
        yesterday.getFullYear(),
        yesterday.getMonth(),
        yesterday.getDate(),
        23,
        59,
        59
      );
      return [startDate.toISOString(), endDate.toISOString()];
    case "7days":
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      return [startDate.toISOString(), now.toISOString()];
    case "30days":
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      return [startDate.toISOString(), now.toISOString()];
    default:
      return null;
  }
};

const initialFilterState: FilterState = {
  project: "",
  tag: "",
  domain: "",
  region: "",
  protocol: "",
  dateRange: calculateDateRange("today"), // 初始化时计算 dateRange
  granularity: "1hour",
  timeRange: "today",
};

export const useFilterState = () => {
  // 初始化时计算正确的 dateRange
  const [filters, setFilters] = useState<FilterState>(() => {
    const dateRange = calculateDateRange(initialFilterState.timeRange);
    return {
      ...initialFilterState,
      dateRange,
    };
  });

  // 更新单个筛选条件
  const updateFilter = useCallback((key: keyof FilterState, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }, []);

  // 批量更新筛选条件
  const updateFilters = useCallback((newFilters: Partial<FilterState>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  }, []);

  // 重置筛选条件
  const resetFilters = useCallback(() => {
    const dateRange = calculateDateRange(initialFilterState.timeRange);
    setFilters({
      ...initialFilterState,
      dateRange,
    });
  }, []);

  // 时间范围快捷选择
  const setTimeRange = useCallback((timeRange: string) => {
    const dateRange = calculateDateRange(timeRange);
    setFilters((prev) => ({ ...prev, timeRange, dateRange }));
  }, []);

  // 添加调试日志
  useEffect(() => {
    console.log("📊 useFilterState - 当前 filters 状态:", filters);
    console.log("📊 useFilterState - dateRange:", filters.dateRange);
    console.log("📊 useFilterState - timeRange:", filters.timeRange);
  }, [filters]);

  return {
    filters,
    updateFilter,
    updateFilters,
    resetFilters,
    setTimeRange,
  };
};
