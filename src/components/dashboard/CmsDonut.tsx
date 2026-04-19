"use client";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

interface Slice {
  name: string;
  value: number;
  color: string;
}

export function CmsDonut({ data }: { data: Slice[] }) {
  const total = data.reduce((acc, s) => acc + s.value, 0);

  if (total === 0) {
    return (
      <div className="flex h-56 items-center justify-center text-sm text-ink-400">
        Ancora nessun lead.
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-5">
      <div className="relative h-44 w-44 shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip
              contentStyle={{
                borderRadius: 12,
                border: "1px solid #E5E7EB",
                boxShadow: "0 1px 3px rgba(16,24,40,0.08)",
                fontSize: 12,
              }}
              formatter={(v, name) => [`${v} lead`, name]}
            />
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius={55}
              outerRadius={80}
              paddingAngle={2}
              stroke="none"
            >
              {data.map((slice) => (
                <Cell key={slice.name} fill={slice.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-ink-900">{total}</span>
          <span className="text-[11px] text-ink-500">lead totali</span>
        </div>
      </div>

      <ul className="w-full min-w-0 space-y-2 text-sm">
        {data.map((s) => {
          const pct = total > 0 ? Math.round((s.value / total) * 100) : 0;
          return (
            <li key={s.name} className="flex min-w-0 items-center gap-2.5">
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: s.color }}
              />
              <span className="min-w-0 flex-1 truncate text-ink-700">{s.name}</span>
              <span className="shrink-0 font-semibold text-ink-900">{s.value}</span>
              <span className="shrink-0 text-xs text-ink-400">{pct}%</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
