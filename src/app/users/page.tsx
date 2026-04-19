import { redirect } from "next/navigation";
import { getSessionUser } from "@/server/auth/session";
import { UsersClient } from "./UsersClient";

export default async function UsersPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (user.role !== "admin") redirect("/");

  return <UsersClient currentUserId={user.id} />;
}
