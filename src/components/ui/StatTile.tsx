import clsx from "clsx";
import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { Card } from "./Card";

type TileTone = "pink" | "orange" | "green" | "violet" | "yellow" | "blue";

const TILE_STYLES: Record<TileTone, { bg: string; icon: string }> = {
  pink:   { bg: "bg-tile-pink-bg",   icon: "text-tile-pink-icon"   },
  orange: { bg: "bg-tile-orange-bg", icon: "text-tile-orange-icon" },
  green:  { bg: "bg-tile-green-bg",  icon: "text-tile-green-icon"  },
  violet: { bg: "bg-tile-violet-bg", icon: "text-tile-violet-icon" },
  yellow: { bg: "bg-tile-yellow-bg", icon: "text-tile-yellow-icon" },
  blue:   { bg: "bg-tile-blue-bg",   icon: "text-tile-blue-icon"   },
};

interface StatTileProps {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  tone: TileTone;
  icon: LucideIcon;
}

export function StatTile({ label, value, hint, tone, icon: Icon }: StatTileProps) {
  const { bg, icon } = TILE_STYLES[tone];
  return (
    <Card padding="md" className="flex items-center gap-4">
      <div
        className={clsx(
          "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl",
          bg,
        )}
      >
        <Icon className={clsx("h-6 w-6", icon)} />
      </div>
      <div className="min-w-0">
        <p className="text-2xl font-bold tracking-tight text-ink-900">{value}</p>
        <p className="text-xs font-medium text-ink-500">{label}</p>
        {hint && <p className="mt-1 text-[11px] text-ink-400">{hint}</p>}
      </div>
    </Card>
  );
}
