import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth/config";

export default async function HomePage() {
  const session = await getServerSession(authConfig);

  if (session) {
    redirect("/monitoring");
  } else {
    redirect("/auth/login");
  }
}
