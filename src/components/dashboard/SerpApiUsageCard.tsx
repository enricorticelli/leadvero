import { Card } from "@/components/ui/Card";
import { format, differenceInDays } from "date-fns";
import { it } from "date-fns/locale";

interface Props {
  left: number;
  used: number;
  limit: number;
  planName: string;
  resetDate: Date;
}

export function SerpApiUsageCard({ left, used, limit, planName, resetDate }: Props) {
  const pct = limit > 0 ? Math.round((used / limit) * 100) : 0;
  const isLow = pct >= 80;
  const isCritical = pct >= 95;

  const barColor = isCritical
    ? "bg-red-500"
    : isLow
      ? "bg-amber-400"
      : "bg-brand-500";

  const daysLeft = differenceInDays(resetDate, new Date());
  const resetLabel = format(resetDate, "d MMMM yyyy", { locale: it });

  return (
    <Card>
      <div className="flex flex-col gap-4 p-1 sm:flex-row sm:items-center sm:gap-8">
        {/* Numbers */}
        <div className="flex items-baseline gap-1.5 shrink-0">
          <span className="text-4xl font-bold tracking-tight text-ink-900">
            {used.toLocaleString("it-IT")}
          </span>
          <span className="text-lg font-medium text-ink-400">
            / {limit.toLocaleString("it-IT")}
          </span>
        </div>

        {/* Bar + labels */}
        <div className="flex flex-1 flex-col gap-2">
          <div className="flex items-center justify-between text-xs text-ink-500">
            <span className="font-medium text-ink-700">SerpAPI · {planName}</span>
            <span>{pct}% usato</span>
          </div>

          <div className="h-3 w-full overflow-hidden rounded-full bg-surface-muted">
            <div
              className={`h-full rounded-full transition-all ${barColor}`}
              style={{ width: `${pct}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-ink-400">
            <span>{used.toLocaleString("it-IT")} usate · {left.toLocaleString("it-IT")} rimaste</span>
            <span>
              Reset il <span className="font-medium text-ink-600">{resetLabel}</span>
              {daysLeft >= 0 && (
                <span className="ml-1">({daysLeft === 0 ? "oggi" : `tra ${daysLeft} gg`})</span>
              )}
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}
