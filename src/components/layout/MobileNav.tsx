"use client";
import clsx from "clsx";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Search, ListChecks, Users } from "lucide-react";

const ITEMS = [
  { label: "Dashboard",     href: "/",             icon: LayoutDashboard, exact: true },
  { label: "Nuova",         href: "/searches/new", icon: Search,          exact: true },
  { label: "Ricerche",      href: "/searches",     icon: ListChecks,      exact: false },
  { label: "Lead",          href: "/leads",        icon: Users,           exact: false },
];

export function MobileNav() {
  const pathname = usePathname() ?? "/";
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-20 flex items-stretch justify-around gap-1 border-t border-ink-300/30 bg-surface px-2 py-1.5 shadow-card-hover md:hidden">
      {ITEMS.map((it) => {
        const active = it.exact
          ? pathname === it.href
          : pathname.startsWith(it.href);
        const Icon = it.icon;
        return (
          <Link
            key={it.href}
            href={it.href}
            className={clsx(
              "flex flex-1 flex-col items-center gap-0.5 rounded-lg py-1.5 text-[10px] font-medium",
              active ? "text-brand-600" : "text-ink-500",
            )}
          >
            <Icon className="h-5 w-5" />
            {it.label}
          </Link>
        );
      })}
    </nav>
  );
}
