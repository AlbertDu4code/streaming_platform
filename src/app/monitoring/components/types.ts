import type { Dayjs } from "dayjs";

// 统一的类型定义
export interface User {
  id?: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
}

export interface ChartData {
  time: string;
  upload: number;
  download: number;
  project?: string;
  domain?: string;
  region?: string;
  tag?: string;
}

export interface OptionType {
  label: string;
  value: string;
}

export interface FilterState {
  project: string;
  tag: string;
  domain: string;
  region: string;
  protocol: string;
  dateRange: [Dayjs, Dayjs] | null;
  granularity: string;
  timeRange: string;
}

export interface TimeRange {
  start: string;
  end: string;
}
