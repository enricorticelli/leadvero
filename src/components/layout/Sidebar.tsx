"use client";
import clsx from "clsx";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  Search,
  ListChecks,
  Users,
  UserCog,
  Sparkles,
} from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  match: (path: string) => boolean;
}

const NAV: NavItem[] = [
  { label: "Dashboard",     href: "/",             icon: LayoutDashboard, match: (p) => p === "/" },
  { label: "Nuova ricerca", href: "/searches/new", icon: Search,          match: (p) => p.startsWith("/searches/new") },
  { label: "Ricerche",      href: "/searches",     icon: ListChecks,      match: (p) => p === "/searches" || (p.startsWith("/searches/") && !p.startsWith("/searches/new")) },
  { label: "Lead",          href: "/leads",        icon: Users,           match: (p) => p.startsWith("/leads") },
];

interface SidebarProps {
  role: "admin" | "user";
}

export function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname() ?? "/";
  const items =
    role === "admin"
      ? [
          ...NAV,
          {
            label: "Utenti",
            href: "/users",
            icon: UserCog,
            match: (p: string) => p.startsWith("/users"),
          },
        ]
      : NAV;

  return (
    <aside className="fixed left-0 top-0 bottom-0 z-20 hidden w-64 flex-col gap-6 overflow-y-auto border-r border-ink-300/30 bg-surface-muted px-5 py-6 md:flex">
      <Link href="/" className="flex items-center gap-2 px-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-600 text-white shadow-card">
          <Sparkles className="h-5 w-5" />
        </div>
        <div>
          <p className="text-base font-bold leading-tight text-ink-900">Leadvero</p>
          <p className="text-[11px] text-ink-500">lead discovery</p>
        </div>
      </Link>

      <nav className="flex flex-col gap-1">
        {items.map((item) => {
          const active = item.match(pathname);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-brand-600 text-white shadow-card"
                  : "text-ink-700 hover:bg-surface hover:text-ink-900",
              )}
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto flex flex-col gap-1">
        <div className="mt-4 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 p-5 text-white shadow-card">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-white/20">
            <Sparkles className="h-5 w-5" />
          </div>
          <p className="text-sm font-semibold">Leadvero v0.1</p>
          <p className="mt-1 text-xs text-white/80">
            MVP locale — discovery &amp; scoring per freelance SEO.
          </p>
        </div>
      </div>
    </aside>
  );
}
