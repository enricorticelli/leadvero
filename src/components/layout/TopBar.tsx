"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, Search as SearchIcon } from "lucide-react";

const TITLES: Array<{ match: (p: string) => boolean; title: string }> = [
  { match: (p) => p === "/",                       title: "Dashboard" },
  { match: (p) => p.startsWith("/searches/new"),   title: "Nuova ricerca" },
  { match: (p) => p === "/searches",               title: "Ricerche" },
  { match: (p) => p.startsWith("/searches/"),      title: "Dettaglio ricerca" },
  { match: (p) => p === "/leads",                  title: "Lead" },
  { match: (p) => p.startsWith("/leads/"),         title: "Dettaglio lead" },
];

function resolveTitle(pathname: string) {
  return TITLES.find((t) => t.match(pathname))?.title ?? "Leadvero";
}

export function TopBar() {
  const pathname = usePathname() ?? "/";
  const title = resolveTitle(pathname);

  return (
    <header className="sticky top-0 z-10 flex items-center gap-4 border-b border-ink-300/30 bg-surface-muted/80 px-4 py-4 backdrop-blur md:px-8">
      <Link href="/" className="flex items-center gap-2 md:hidden">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-white">
          L
        </div>
      </Link>

      <h1 className="text-lg font-bold text-ink-900 md:text-xl">{title}</h1>

      <div className="ml-auto hidden flex-1 max-w-md items-center gap-2 rounded-xl bg-surface px-3.5 py-2 ring-1 ring-ink-300/60 md:flex">
        <SearchIcon className="h-4 w-4 text-ink-400" />
        <input
          type="search"
          placeholder="Cerca lead, domini, ricerche…"
          className="w-full bg-transparent text-sm text-ink-900 placeholder:text-ink-400 focus:outline-none"
          disabled
        />
      </div>

      <button
        type="button"
        className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-surface text-ink-700 ring-1 ring-ink-300/60 hover:bg-surface-muted"
        aria-label="Notifiche"
      >
        <Bell className="h-5 w-5" />
        <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-tile-pink-icon" />
      </button>

      <div className="flex items-center gap-3">
        <div className="hidden text-right sm:block">
          <p className="text-sm font-semibold text-ink-900">Evoluzione</p>
          <p className="text-[11px] text-ink-500">devs@evoluzione.agency</p>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-100 text-sm font-bold text-brand-700">
          EV
        </div>
      </div>
    </header>
  );
}
