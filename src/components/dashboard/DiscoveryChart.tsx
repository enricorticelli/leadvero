"use client";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface Point {
  day: string;
  leads: number;
}

export function DiscoveryChart({ data }: { data: Point[] }) {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
          <defs>
            <linearGradient id="leadsFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#7B61FF" stopOpacity={0.35} />
              <stop offset="100%" stopColor="#7B61FF" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="#E5E7EB" strokeDasharray="4 4" vertical={false} />
          <XAxis
            dataKey="day"
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 11, fill: "#6B7280" }}
          />
          <YAxis
            allowDecimals={false}
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 11, fill: "#6B7280" }}
            width={32}
          />
          <Tooltip
            contentStyle={{
              borderRadius: 12,
              border: "1px solid #E5E7EB",
              boxShadow: "0 1px 3px rgba(16,24,40,0.08)",
              fontSize: 12,
            }}
            labelStyle={{ color: "#111827", fontWeight: 600 }}
          />
          <Area
            type="monotone"
            dataKey="leads"
            stroke="#7B61FF"
            strokeWidth={2.5}
            fill="url(#leadsFill)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
