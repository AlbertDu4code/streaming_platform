import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth/config";
import { redirect } from "next/navigation";
import MonitoringClient from "./components/MonitoringClient";

export default async function MonitoringPage() {
  const session = await getServerSession(authConfig);

  if (!session) {
    redirect("/auth/login");
  }

  return <MonitoringClient user={session.user} />;
}
