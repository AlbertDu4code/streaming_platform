"use client";

import { SessionProvider } from "next-auth/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState } from "react";
import { ConfigProvider } from "antd";
import zhCN from "antd/locale/zh_CN";
import { HttpError } from "@/lib/errors";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1分钟
            gcTime: 10 * 60 * 1000, // 10分钟
            retry: (failureCount, error) => {
              // 401错误不重试
              if (error instanceof HttpError && error.status === 401) {
                return false;
              }
              return failureCount < 3;
            },
          },
        },
      })
  );

  return (
    <SessionProvider>
      <QueryClientProvider client={queryClient}>
        <ConfigProvider locale={zhCN}>{children}</ConfigProvider>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </SessionProvider>
  );
}
