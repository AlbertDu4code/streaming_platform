"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Spin } from "antd";
import MonitoringClient from "./components/MonitoringClient";

export default function MonitoringPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return; // 还在加载中

    if (!session) {
      router.push("/auth/login");
    }
  }, [session, status, router]);

  // 如果还在加载或者没有会话，显示加载状态
  if (status === "loading" || !session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  return <MonitoringClient user={session.user} />;
}
