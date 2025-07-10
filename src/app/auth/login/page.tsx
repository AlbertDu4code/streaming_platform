"use client";

import { Suspense } from "react";
import { Spin } from "antd";
import LoginPageContent from "./_components/LoginPageContent";

export default function LoginPage() {
  return (
    <Suspense 
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Spin size="large" />
        </div>
      }
    >
      <LoginPageContent />
    </Suspense>
  );
}
