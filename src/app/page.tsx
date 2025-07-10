"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Spin } from "antd";

export default function HomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return; // 还在加载中

    if (session) {
      router.push("/monitoring");
    } else {
      router.push("/auth/login");
    }
  }, [session, status, router]);

  // 显示加载状态
  return (
    <div className="min-h-screen flex items-center justify-center">
      <Spin size="large" />
    </div>
  );
}
