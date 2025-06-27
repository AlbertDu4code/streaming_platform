import clsx, { type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatBytes(bytes: number, decimals = 2) {
  if (!+bytes) return "0 Bytes";

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

export function formatBandwidth(bps: number, decimals = 2) {
  if (!+bps) return "0 bps";

  const k = 1000;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["bps", "Kbps", "Mbps", "Gbps", "Tbps"];

  const i = Math.floor(Math.log(bps) / Math.log(k));

  return `${parseFloat((bps / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

export function formatDate(
  date: Date | string,
  format = "YYYY-MM-DD HH:mm:ss"
) {
  const d = new Date(date);

  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");
  const seconds = String(d.getSeconds()).padStart(2, "0");

  return format
    .replace("YYYY", year.toString())
    .replace("MM", month)
    .replace("DD", day)
    .replace("HH", hours)
    .replace("mm", minutes)
    .replace("ss", seconds);
}

export function generateTaskId() {
  return `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Arco Design 相关工具函数
export function getArcoThemeVars(isDark = false) {
  return {
    "--primary-color": isDark ? "#4080ff" : "#165dff",
    "--success-color": "#00b42a",
    "--warning-color": "#ff7d00",
    "--error-color": "#f53f3f",
    "--color-bg-1": isDark ? "#17171a" : "#ffffff",
    "--color-bg-2": isDark ? "#232324" : "#f7f8fa",
    "--color-text-1": isDark ? "#f7f8fa" : "#1d2129",
    "--color-text-2": isDark ? "#c9cdd4" : "#4e5969",
    "--color-border-2": isDark ? "#313132" : "#e5e6eb",
  };
}

export function createArcoTableColumns<T>(
  columns: Array<{
    title: string;
    dataIndex: keyof T;
    key?: string;
    width?: number;
    align?: "left" | "center" | "right";
    render?: (value: any, record: T, index: number) => React.ReactNode;
    sorter?: boolean | ((a: T, b: T) => number);
    filters?: Array<{ text: string; value: any }>;
    onFilter?: (value: any, record: T) => boolean;
  }>
) {
  return columns.map((col) => ({
    ...col,
    key: col.key || String(col.dataIndex),
  }));
}
