import { useState, useCallback } from "react";
import { FilterState } from "../types";

const initialFilterState: FilterState = {
  project: "",
  tag: "",
  domain: "",
  region: "",
  protocol: "",
  dateRange: null,
  granularity: "1hour",
  timeRange: "today",
};

export const useFilterState = () => {
  const [filters, setFilters] = useState<FilterState>(initialFilterState);

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
    setFilters(initialFilterState);
  }, []);

  // 时间范围快捷选择
  const setTimeRange = useCallback((timeRange: string) => {
    const now = new Date();
    let startDate: Date;
    let dateRange: string[] | null = null;

    switch (timeRange) {
      case "today":
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        dateRange = [startDate.toISOString(), now.toISOString()];
        break;
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
        dateRange = [startDate.toISOString(), endDate.toISOString()];
        break;
      case "7days":
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        dateRange = [startDate.toISOString(), now.toISOString()];
        break;
      case "30days":
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        dateRange = [startDate.toISOString(), now.toISOString()];
        break;
      default:
        dateRange = null;
    }

    setFilters((prev) => ({ ...prev, timeRange, dateRange }));
  }, []);

  return {
    filters,
    updateFilter,
    updateFilters,
    resetFilters,
    setTimeRange,
  };
};
