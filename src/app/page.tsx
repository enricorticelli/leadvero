import Link from "next/link";
import { Users, Target, TrendingUp, MailCheck, Plus, ExternalLink } from "lucide-react";
import { formatDistanceToNow, format, startOfDay, subDays } from "date-fns";
import { it } from "date-fns/locale";
import { prisma } from "@/server/db/prisma";
import { env } from "@/server/env";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { StatTile } from "@/components/ui/StatTile";
import { DiscoveryChart } from "@/components/dashboard/DiscoveryChart";
import { CmsDonut } from "@/components/dashboard/CmsDonut";
import { SerpApiUsageCard } from "@/components/dashboard/SerpApiUsageCard";

export const dynamic = "force-dynamic";

interface SerpApiUsage {
  left: number;
  used: number;
  limit: number;
  planName: string;
  resetDate: Date;
}

async function getSerpApiUsage(): Promise<SerpApiUsage | null> {
  const key = env().SERPAPI_KEY;
  if (!key) return null;
  try {
    const res = await fetch(
      `https://serpapi.com/account.json?api_key=${key}`,
      { next: { revalidate: 3600 } },
    );
    if (!res.ok) return null;
    const data = (await res.json()) as Record<string, unknown>;
    const left = typeof data.plan_searches_left === "number" ? data.plan_searches_left : null;
    const used = typeof data.this_month_usage === "number" ? data.this_month_usage : null;
    const limit = typeof data.searches_per_month === "number" ? data.searches_per_month : null;
    const planName = typeof data.plan_name === "string" ? data.plan_name : "Free";
    if (left === null || used === null || limit === null) return null;

    // SerpAPI doesn't expose the reset date — always 1st of next month
    const now = new Date();
    const resetDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    return { left, used, limit, planName, resetDate };
  } catch {
    return null;
  }
}

interface DiscoveryPoint {
  day: string;
  leads: number;
}

interface CmsSlice {
  name: string;
  value: number;
  color: string;
}

const CMS_COLORS: Record<string, string> = {
  shopify:     "#12B76A",
  wordpress:   "#2E90FA",
  woocommerce: "#7B61FF",
  altro:       "#F79009",
};

async function loadDashboard() {
  const now = new Date();
  const since = startOfDay(subDays(now, 13));

  const [
    totalLeads,
    completedSearches,
    scoreAgg,
    withEmail,
    recentLeads,
    topLeads,
    recentSearches,
    cmsGroups,
  ] = await Promise.all([
    prisma.lead.count(),
    prisma.searchJob.count({ where: { status: "done" } }),
    prisma.lead.aggregate({ _avg: { totalScore: true } }),
    prisma.lead.count({ where: { publicEmail: { not: null } } }),
    prisma.lead.findMany({
      where: { createdAt: { gte: since } },
      select: { createdAt: true },
    }),
    prisma.lead.findMany({
      orderBy: { totalScore: "desc" },
      take: 5,
      select: {
        id: true,
        companyName: true,
        domain: true,
        cms: true,
        totalScore: true,
        publicEmail: true,
      },
    }),
    prisma.searchJob.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        niche: true,
        city: true,
        targetPlatform: true,
        status: true,
        scoredCount: true,
        createdAt: true,
      },
    }),
    prisma.lead.groupBy({
      by: ["cms"],
      _count: { _all: true },
    }),
  ]);

  const discoveryByDay = new Map<string, number>();
  for (let i = 13; i >= 0; i--) {
    const d = format(subDays(now, i), "dd/MM");
    discoveryByDay.set(d, 0);
  }
  for (const l of recentLeads) {
    const d = format(l.createdAt, "dd/MM");
    if (discoveryByDay.has(d)) {
      discoveryByDay.set(d, (discoveryByDay.get(d) ?? 0) + 1);
    }
  }
  const discoveryData: DiscoveryPoint[] = Array.from(
    discoveryByDay.entries(),
    ([day, leads]) => ({ day, leads }),
  );

  const cmsMap = new Map<string, number>();
  for (const g of cmsGroups) {
    const key = (g.cms ?? "altro").toLowerCase();
    const bucket = ["shopify", "wordpress", "woocommerce"].includes(key)
      ? key
      : "altro";
    cmsMap.set(bucket, (cmsMap.get(bucket) ?? 0) + g._count._all);
  }
  const cmsData: CmsSlice[] = ["shopify", "wordpress", "woocommerce", "altro"]
    .filter((k) => (cmsMap.get(k) ?? 0) > 0)
    .map((k) => ({
      name: k.charAt(0).toUpperCase() + k.slice(1),
      value: cmsMap.get(k) ?? 0,
      color: CMS_COLORS[k],
    }));

  return {
    totalLeads,
    completedSearches,
    avgScore: Math.round(scoreAgg._avg.totalScore ?? 0),
    withEmail,
    discoveryData,
    cmsData,
    topLeads,
    recentSearches,
  };
}

const SEARCH_TONE: Record<string, "yellow" | "brand" | "green" | "pink"> = {
  pending: "yellow",
  running: "brand",
  done:    "green",
  failed:  "pink",
};

const SEARCH_LABEL: Record<string, string> = {
  pending: "In attesa",
  running: "In corso",
  done:    "Completata",
  failed:  "Errore",
};

export default async function DashboardPage() {
  const [data, serpApi] = await Promise.all([
    loadDashboard(),
    getSerpApiUsage(),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm text-ink-500">Panoramica</p>
          <h2 className="text-2xl font-bold text-ink-900">Benvenuto in Leadvero</h2>
        </div>
        <Button href="/searches/new" iconLeft={<Plus className="h-4 w-4" />}>
          Nuova ricerca
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile
          label="Lead totali"
          value={data.totalLeads}
          tone="pink"
          icon={Users}
        />
        <StatTile
          label="Ricerche completate"
          value={data.completedSearches}
          tone="orange"
          icon={Target}
        />
        <StatTile
          label="Score medio"
          value={data.avgScore}
          tone="green"
          icon={TrendingUp}
        />
        <StatTile
          label="Con email pubblica"
          value={data.withEmail}
          tone="violet"
          icon={MailCheck}
        />
      </div>

      {serpApi && (
        <SerpApiUsageCard
          left={serpApi.left}
          used={serpApi.used}
          limit={serpApi.limit}
          planName={serpApi.planName}
          resetDate={serpApi.resetDate}
        />
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card
          title="Lead scoperti (ultimi 14 giorni)"
          subtitle="Nuovi lead per giorno, tutte le ricerche"
          className="lg:col-span-2"
        >
          <DiscoveryChart data={data.discoveryData} />
        </Card>
        <Card
          title="Distribuzione CMS"
          subtitle="Lead per piattaforma rilevata"
        >
          <CmsDonut data={data.cmsData} />
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card
          title="Top 5 lead"
          subtitle="I lead con score più alto"
          actions={
            <Button href="/leads" variant="ghost" size="sm" iconRight={<ExternalLink className="h-3.5 w-3.5" />}>
              Vedi tutti
            </Button>
          }
        >
          {data.topLeads.length === 0 ? (
            <p className="py-6 text-center text-sm text-ink-400">
              Ancora nessun lead. Lancia la prima ricerca.
            </p>
          ) : (
            <ul className="divide-y divide-ink-300/30">
              {data.topLeads.map((l, i) => (
                <li key={l.id} className="flex items-center gap-3 py-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-surface-muted text-xs font-semibold text-ink-500">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/leads/${l.id}`}
                      className="block truncate text-sm font-medium text-ink-900 hover:text-brand-600"
                    >
                      {l.companyName ?? l.domain}
                    </Link>
                    <p className="truncate text-xs text-ink-400">{l.domain}</p>
                  </div>
                  {l.cms && (
                    <Badge tone="blue" className="capitalize">{l.cms}</Badge>
                  )}
                  <span className="w-12 text-right text-sm font-bold text-brand-600">
                    {l.totalScore}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card
          title="Ultime ricerche"
          subtitle="I job più recenti"
          actions={
            <Button href="/searches" variant="ghost" size="sm" iconRight={<ExternalLink className="h-3.5 w-3.5" />}>
              Vedi tutte
            </Button>
          }
        >
          {data.recentSearches.length === 0 ? (
            <p className="py-6 text-center text-sm text-ink-400">
              Nessuna ricerca ancora.
            </p>
          ) : (
            <ul className="divide-y divide-ink-300/30">
              {data.recentSearches.map((s) => (
                <li key={s.id} className="flex items-center gap-3 py-3">
                  <Badge tone={SEARCH_TONE[s.status] ?? "neutral"}>
                    {SEARCH_LABEL[s.status] ?? s.status}
                  </Badge>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-ink-900">
                      {[s.niche, s.city].filter(Boolean).join(" · ") ||
                        "Ricerca generica"}{" "}
                      <span className="text-xs font-normal text-ink-400">
                        ({s.targetPlatform})
                      </span>
                    </p>
                    <p className="text-[11px] text-ink-400">
                      {formatDistanceToNow(s.createdAt, {
                        addSuffix: true,
                        locale: it,
                      })}
                      {s.status === "done" && ` · ${s.scoredCount} lead`}
                    </p>
                  </div>
                  <Link
                    href={
                      s.status === "done" ? "/leads" : `/searches/${s.id}`
                    }
                    className="text-xs font-medium text-brand-600 hover:underline"
                  >
                    {s.status === "done" ? "Lead →" : "Dettaglio →"}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}
