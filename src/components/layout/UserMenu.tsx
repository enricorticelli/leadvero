"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut, User as UserIcon, Users, ChevronDown } from "lucide-react";
import clsx from "clsx";

interface Props {
  username: string;
  role: "admin" | "user";
}

function initials(name: string): string {
  return name
    .split(/[\s._-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

export function UserMenu({ username, role }: Props) {
  const [open, setOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const router = useRouter();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  async function logout() {
    setLoggingOut(true);
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={clsx(
          "flex items-center gap-2 rounded-xl px-2 py-1.5 text-left transition-colors",
          open ? "bg-surface-muted" : "hover:bg-surface-muted",
        )}
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-100 text-sm font-bold text-brand-700">
          {initials(username) || username[0]?.toUpperCase()}
        </div>
        <div className="hidden text-right sm:block">
          <p className="text-sm font-semibold text-ink-900">{username}</p>
          <p className="text-[11px] text-ink-500">
            {role === "admin" ? "Amministratore" : "Utente"}
          </p>
        </div>
        <ChevronDown
          className={clsx(
            "h-4 w-4 text-ink-400 transition-transform",
            open && "rotate-180",
          )}
        />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full mt-2 w-56 overflow-hidden rounded-xl bg-surface shadow-card-hover ring-1 ring-ink-300/40"
        >
          <Link
            href="/profile"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 px-3 py-2.5 text-sm text-ink-700 hover:bg-surface-muted"
          >
            <UserIcon className="h-4 w-4" />
            Profilo
          </Link>
          {role === "admin" && (
            <Link
              href="/users"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 px-3 py-2.5 text-sm text-ink-700 hover:bg-surface-muted"
            >
              <Users className="h-4 w-4" />
              Utenti
            </Link>
          )}
          <button
            type="button"
            onClick={logout}
            disabled={loggingOut}
            className="flex w-full items-center gap-2 border-t border-ink-300/30 px-3 py-2.5 text-left text-sm text-ink-700 hover:bg-surface-muted"
          >
            <LogOut className="h-4 w-4" />
            {loggingOut ? "Disconnessione…" : "Esci"}
          </button>
        </div>
      )}
    </div>
  );
}
