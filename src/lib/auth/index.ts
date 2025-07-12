import { getServerSession } from "next-auth/next";
import { authConfig } from "./config";

export async function getCurrentUser() {
  const session = await getServerSession(authConfig);
  return session?.user;
}

export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Unauthorized");
  }
  return user;
}
