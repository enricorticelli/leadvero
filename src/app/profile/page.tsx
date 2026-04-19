import { redirect } from "next/navigation";
import { getSessionUser } from "@/server/auth/session";
import { ProfileForm } from "./ProfileForm";

export default async function ProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ first?: string }>;
}) {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  const { first } = await searchParams;

  return (
    <div className="mx-auto max-w-xl space-y-5">
      <div>
        <p className="text-sm text-ink-500">Profilo</p>
        <h2 className="text-2xl font-bold text-ink-900">{user.username}</h2>
        <p className="mt-1 text-sm text-ink-500">
          Ruolo:{" "}
          <span className="font-medium text-ink-900">
            {user.role === "admin" ? "Amministratore" : "Utente"}
          </span>
        </p>
      </div>

      <ProfileForm
        mustChange={user.mustChangePassword}
        isFirstLogin={first === "1"}
      />
    </div>
  );
}
