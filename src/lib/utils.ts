import { type ClassValue, clsx } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatCurrency(
  amount: number,
  currency: string = "CNY",
  options: Intl.NumberFormatOptions = {}
): string {
  const defaultOptions: Intl.NumberFormatOptions = {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    ...options,
  };

  if (currency === "CNY") {
    return new Intl.NumberFormat("zh-CN", defaultOptions).format(amount);
  }

  return new Intl.NumberFormat("en-US", defaultOptions).format(amount);
}

export function formatRMB(amount: number): string {
  return `￥${amount.toFixed(2)}`;
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
  if (bps < k) {
    return `${bps.toFixed(dm)} bps`;
  }
  const i = Math.floor(Math.log(bps) / Math.log(k));
  return `${parseFloat((bps / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

export function formatDuration(minutes: number, decimals = 2) {
  if (!+minutes) return "0 分钟";
  return `${minutes.toFixed(decimals)} 分钟`;
}

export function formatCount(count: number) {
  return new Intl.NumberFormat().format(count);
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
