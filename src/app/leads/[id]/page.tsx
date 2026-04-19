"use client";
import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ExternalLink,
  Mail,
  Phone,
  Trash2,
  Sparkles,
  Globe,
  FileText,
  Wand2,
  LayoutGrid,
  Search,
  Server,
  MessageSquare,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Copy,
  ChevronDown,
  Check,
  HelpCircle,
} from "lucide-react";
import clsx from "clsx";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Field, Select, Textarea } from "@/components/ui/Input";
import { useConfirm } from "@/components/ui/ConfirmProvider";
import { Tabs } from "@/components/ui/Tabs";
import { Tooltip } from "@/components/ui/Tooltip";
import {
  analyzeLead,
  type Insight,
  type Severity,
  type SeoSignalsShape,
  type QualitySignalsShape,
} from "@/lib/lead-analysis";

interface ScanResult {
  id: string;
  pageType: string;
  scannedUrl: string;
  httpStatus: number | null;
  title: string | null;
  metaDescription: string | null;
  h1: string | null;
  canonical: string | null;
  robotsMeta: string | null;
  structuredData: Record<string, unknown> | null;
  notes: Record<string, unknown> | null;
  scannedAt: string;
}

interface OutreachDraft {
  id: string;
  hook: string;
  miniAudit: string;
  suggestedOffer: string;
  emailDraft: string;
  linkedinDraft: string;
  model: string;
  promptVersion: string;
  createdAt: string;
}

interface Lead {
  id: string;
  companyName: string | null;
  domain: string;
  cms: string | null;
  ecommercePlatform: string | null;
  niche: string | null;
  businessType: string | null;
  country: string | null;
  city: string | null;
  language: string | null;
  publicEmail: string | null;
  publicPhone: string | null;
  hasContactPage: boolean;
  hasBlog: boolean;
  hasForm: boolean;
  analyticsPresent: boolean;
  tagManagerPresent: boolean;
  performanceEstimate: number | null;
  totalScore: number;
  fitScore: number;
  opportunityScore: number;
  commercialScore: number;
  contactabilityScore: number;
  scoreReasons: string[] | null;
  seoSignals: SeoSignalsShape | null;
  siteQualityNotes: QualitySignalsShape | null;
  socialLinks: Record<string, string> | null;
  status: string;
  userNotes: string | null;
  createdAt: string;
  updatedAt: string;
  lastScannedAt: string | null;
  scans: ScanResult[];
  outreach: OutreachDraft[];
}

const STATUS_OPTIONS = [
  { value: "new", label: "Nuovo" },
  { value: "to_contact", label: "Da contattare" },
  { value: "contacted", label: "Contattato" },
  { value: "not_relevant", label: "Non rilevante" },
  { value: "closed", label: "Chiuso" },
];

const SCORE_TILES: Array<{
  key: "fitScore" | "opportunityScore" | "commercialScore" | "contactabilityScore";
  label: string;
  tone: "violet" | "orange" | "green" | "blue";
  tooltip: string;
  weight: number;
}> = [
  {
    key: "fitScore",
    label: "Fit",
    tone: "violet",
    weight: 30,
    tooltip:
      "Quanto questo lead è allineato ai criteri della ricerca: CMS target, lingua e paese.",
  },
  {
    key: "opportunityScore",
    label: "Opportunità",
    tone: "orange",
    weight: 35,
    tooltip:
      "Margine di miglioramento SEO e tecnico (title, meta, schema, sito datato…): più alto = più problemi da risolvere = più valore da proporre.",
  },
  {
    key: "commercialScore",
    label: "Commerciale",
    tone: "green",
    weight: 20,
    tooltip:
      "Quanto è strutturato il business: catalogo prodotti, blog, analytics, brand riconoscibile.",
  },
  {
    key: "contactabilityScore",
    label: "Contattabilità",
    tone: "blue",
    weight: 15,
    tooltip:
      "Quanto è facile raggiungere questo lead: email pubblica, form, pagina contatti, telefono, social.",
  },
];

const TONE_STYLES = {
  violet: { bg: "bg-tile-violet-bg", text: "text-tile-violet-icon", bar: "bg-tile-violet-icon" },
  orange: { bg: "bg-tile-orange-bg", text: "text-tile-orange-icon", bar: "bg-tile-orange-icon" },
  green:  { bg: "bg-tile-green-bg",  text: "text-tile-green-icon",  bar: "bg-tile-green-icon"  },
  blue:   { bg: "bg-tile-blue-bg",   text: "text-tile-blue-icon",   bar: "bg-tile-blue-icon"   },
};

const CONTACT_POINTS = {
  publicEmail: 35,
  contactPage: 25,
  form: 20,
  publicPhone: 12,
  socials: 8,
} as const;

type TabId = "overview" | "seo" | "tech" | "contacts" | "outreach";

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("it-IT", { day: "2-digit", month: "short", year: "numeric" });

const formatDateTime = (iso: string) =>
  new Date(iso).toLocaleString("it-IT", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

export default function LeadDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [lead, setLead] = useState<Lead | null>(null);
  const [generating, setGenerating] = useState(false);
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState("");
  const [savedNotes, setSavedNotes] = useState("");
  const [savedStatus, setSavedStatus] = useState("");
  const [saving, setSaving] = useState(false);
  const [justSaved, setJustSaved] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [tab, setTab] = useState<TabId>("overview");
  const confirm = useConfirm();

  useEffect(() => {
    fetch(`/api/leads/${id}`)
      .then((r) => r.json())
      .then((d: Lead) => {
        setLead(d);
        setNotes(d.userNotes ?? "");
        setStatus(d.status);
        setSavedNotes(d.userNotes ?? "");
        setSavedStatus(d.status);
      });
  }, [id]);

  async function generateOutreach() {
    setGenerating(true);
    const res = await fetch(`/api/leads/${id}/outreach`, { method: "POST" });
    if (res.ok) {
      const draft = (await res.json()) as OutreachDraft;
      setLead((l) => (l ? { ...l, outreach: [draft, ...l.outreach] } : l));
    }
    setGenerating(false);
  }

  async function deleteLead() {
    const ok = await confirm({
      title: `Eliminare il lead "${lead?.companyName ?? lead?.domain}"?`,
      message: "L'operazione non è reversibile.",
      confirmLabel: "Elimina",
      tone: "danger",
    });
    if (!ok) return;
    setDeleting(true);
    await fetch(`/api/leads/${id}`, { method: "DELETE" });
    router.push("/leads");
  }

  async function saveStatus() {
    setSaving(true);
    const res = await fetch(`/api/leads/${id}/status`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, userNotes: notes }),
    });
    setSaving(false);
    if (res.ok) {
      setSavedNotes(notes);
      setSavedStatus(status);
      setJustSaved(true);
      setTimeout(() => setJustSaved(false), 1800);
    }
  }

  const dirty = notes !== savedNotes || status !== savedStatus;

  const analysis = useMemo(() => (lead ? analyzeLead(lead) : null), [lead]);

  if (!lead || !analysis) {
    return (
      <Card className="mx-auto max-w-md py-10 text-center text-sm text-ink-400">
        Caricamento…
      </Card>
    );
  }

  const outreachBadge = lead.outreach.length > 0 ? lead.outreach.length : undefined;

  const TAB_ITEMS = [
    { id: "overview" as const, label: "Panoramica", icon: LayoutGrid },
    { id: "seo" as const, label: "SEO", icon: Search },
    { id: "tech" as const, label: "Sito & tecnologia", icon: Server },
    { id: "contacts" as const, label: "Contatti", icon: Mail },
    { id: "outreach" as const, label: "Outreach AI", icon: MessageSquare, badge: outreachBadge },
  ];

  return (
    <div className="space-y-5">
      {/* Header */}
      <Card>
        <div className="flex flex-wrap items-start gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-brand-100 text-lg font-bold uppercase text-brand-700">
            {(lead.companyName ?? lead.domain).charAt(0)}
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="truncate text-2xl font-bold text-ink-900">
              {lead.companyName ?? lead.domain}
            </h2>
            <a
              href={`https://${lead.domain}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm text-brand-600 hover:underline"
            >
              {lead.domain}
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
            <div className="mt-2 flex flex-wrap gap-2">
              {lead.cms && (
                <Badge tone="blue" className="capitalize">
                  {lead.cms}
                </Badge>
              )}
              {lead.niche && <Badge tone="violet">{lead.niche}</Badge>}
              {lead.country && (
                <Badge tone="neutral">
                  {lead.country}
                  {lead.city && ` · ${lead.city}`}
                </Badge>
              )}
              {lead.language && (
                <Badge tone="neutral" className="uppercase">
                  {lead.language}
                </Badge>
              )}
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className="text-right">
              <p className="text-4xl font-extrabold text-brand-600 leading-none">
                {lead.totalScore}
              </p>
              <p className="mt-1 text-[11px] font-medium uppercase tracking-wide text-ink-500">
                Score totale
              </p>
            </div>
            <Button
              variant="danger"
              size="sm"
              onClick={deleteLead}
              disabled={deleting}
              iconLeft={<Trash2 className="h-3.5 w-3.5" />}
            >
              {deleting ? "Eliminazione…" : "Elimina"}
            </Button>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-4">
        {/* Main column with tabs */}
        <div className="space-y-5 lg:col-span-3">
          <Tabs items={TAB_ITEMS} value={tab} onChange={setTab} />

          {tab === "overview" && <OverviewTab lead={lead} analysis={analysis} />}
          {tab === "seo" && <SeoTab seo={lead.seoSignals} />}
          {tab === "tech" && <TechTab lead={lead} />}
          {tab === "contacts" && <ContactsTab lead={lead} />}
          {tab === "outreach" && (
            <OutreachTab
              drafts={lead.outreach}
              generating={generating}
              onGenerate={generateOutreach}
            />
          )}
        </div>

        {/* Side sticky: status + notes */}
        <div className="lg:col-span-1">
          <div className="lg:sticky lg:top-6">
            <Card title="Stato & note" subtitle="Pipeline del lead">
              <div className="space-y-3">
                <Field label="Stato">
                  <Select value={status} onChange={(e) => setStatus(e.target.value)}>
                    {STATUS_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </Select>
                </Field>
                <Field label="Note personali">
                  <Textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Es. contattato il 15/04, risposta il 18/04…"
                    rows={5}
                  />
                </Field>
                <div className="flex items-center justify-end gap-2 pt-1">
                  {justSaved && !dirty && (
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-tile-green-icon">
                      <Check className="h-3.5 w-3.5" />
                      Salvato
                    </span>
                  )}
                  {dirty && !justSaved && (
                    <span className="text-xs text-ink-400">
                      Modifiche non salvate
                    </span>
                  )}
                  <Button
                    size="sm"
                    onClick={saveStatus}
                    disabled={saving || !dirty}
                  >
                    {saving ? "Salvataggio…" : "Salva"}
                  </Button>
                </div>
              </div>

              <dl className="mt-5 space-y-1.5 border-t border-ink-300/40 pt-4 text-xs">
                <MetaRow label="Creato" value={formatDate(lead.createdAt)} />
                <MetaRow label="Aggiornato" value={formatDate(lead.updatedAt)} />
                {lead.lastScannedAt && (
                  <MetaRow label="Ultimo scan" value={formatDate(lead.lastScannedAt)} />
                )}
              </dl>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- Overview tab ---------- */

function OverviewTab({
  lead,
  analysis,
}: {
  lead: Lead;
  analysis: { strengths: Insight[]; weaknesses: Insight[] };
}) {
  return (
    <div className="space-y-5">
      <Card title="Score breakdown" subtitle="I 4 fattori che compongono il punteggio totale">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {SCORE_TILES.map(({ key, label, tone, tooltip, weight }) => {
            const styles = TONE_STYLES[tone];
            const value = lead[key];
            return (
              <Tooltip
                key={key}
                content={
                  <>
                    <p className="mb-1 font-semibold">
                      {label}{" "}
                      <span className="font-normal text-ink-400">
                        · peso {weight}%
                      </span>
                    </p>
                    <p className="font-normal text-ink-300">{tooltip}</p>
                  </>
                }
              >
                <div
                  className={clsx(
                    "flex cursor-help flex-col gap-2 rounded-xl p-4",
                    styles.bg,
                  )}
                >
                  <div className="flex items-baseline justify-between">
                    <span className={clsx("text-3xl font-extrabold", styles.text)}>
                      {value}
                    </span>
                    <span className="text-[10px] font-medium uppercase tracking-wide text-ink-500">
                      /100
                    </span>
                  </div>
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-ink-700">
                    {label}
                    <HelpCircle className="h-3 w-3 text-ink-400" />
                  </span>
                  <div className="h-1.5 w-full rounded-full bg-surface/70">
                    <div
                      className={clsx("h-full rounded-full", styles.bar)}
                      style={{ width: `${value}%` }}
                    />
                  </div>
                </div>
              </Tooltip>
            );
          })}
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <Card
          title="Cosa funziona"
          subtitle={`${analysis.strengths.length} punti forti rilevati`}
        >
          {analysis.strengths.length > 0 ? (
            <ul className="space-y-2.5 text-sm">
              {analysis.strengths.map((s, i) => (
                <InsightRow key={i} insight={s} kind="strength" />
              ))}
            </ul>
          ) : (
            <p className="py-6 text-center text-sm text-ink-400">
              Nessun punto forte evidente.
            </p>
          )}
        </Card>

        <Card
          title="Cosa migliorare"
          subtitle={`${analysis.weaknesses.length} opportunità di miglioramento`}
        >
          {analysis.weaknesses.length > 0 ? (
            <ul className="space-y-2.5 text-sm">
              {analysis.weaknesses.map((w, i) => (
                <InsightRow key={i} insight={w} kind="weakness" />
              ))}
            </ul>
          ) : (
            <p className="py-6 text-center text-sm text-ink-400">
              Ottimo lavoro: nessuna criticità rilevata.
            </p>
          )}
        </Card>
      </div>

      <Card title="Informazioni lead" padding="md">
        <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm md:grid-cols-3">
          <DlRow label="Nicchia" value={lead.niche ?? "—"} />
          <DlRow label="Business type" value={lead.businessType ?? "—"} />
          <DlRow label="Lingua" value={lead.language?.toUpperCase() ?? "—"} />
          <DlRow
            label="Località"
            value={
              lead.country
                ? `${lead.country}${lead.city ? ` · ${lead.city}` : ""}`
                : "—"
            }
          />
          <DlRow label="CMS" value={lead.cms ?? "—"} />
          <DlRow label="E-commerce" value={lead.ecommercePlatform ?? "—"} />
        </dl>
      </Card>
    </div>
  );
}

function InsightRow({
  insight,
  kind,
}: {
  insight: Insight;
  kind: "strength" | "weakness";
}) {
  const severity: Severity = insight.severity ?? "low";
  const Icon =
    kind === "strength"
      ? CheckCircle2
      : severity === "high"
      ? XCircle
      : AlertTriangle;
  const color =
    kind === "strength"
      ? "text-tile-green-icon"
      : severity === "high"
      ? "text-tile-pink-icon"
      : severity === "medium"
      ? "text-tile-orange-icon"
      : "text-tile-yellow-icon";

  return (
    <li className="flex items-start gap-2.5">
      <Icon className={clsx("mt-0.5 h-4 w-4 shrink-0", color)} />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-medium text-ink-900">{insight.label}</p>
          {kind === "weakness" && severity !== "low" && (
            <Badge tone={severity === "high" ? "pink" : "orange"}>
              {severity === "high" ? "alta" : "media"}
            </Badge>
          )}
        </div>
        {insight.hint && (
          <p className="mt-0.5 text-xs text-ink-500">{insight.hint}</p>
        )}
      </div>
    </li>
  );
}

/* ---------- SEO tab ---------- */

const SEO_ROWS: Array<{
  key: keyof SeoSignalsShape;
  label: string;
  hint: string;
  format: (seo: SeoSignalsShape) => { ok: boolean | "warn"; value: string };
}> = [
  {
    key: "title",
    label: "Title tag",
    hint: "Principale segnale SEO per la SERP. Ideale 30–60 caratteri.",
    format: (s) => {
      const q = s.titleQuality ?? "missing";
      if (q === "missing") return { ok: false, value: "Assente" };
      const ok = q === "good" ? true : "warn";
      return { ok, value: `${s.title ?? "—"} (${s.titleLength ?? 0} ch, ${q})` };
    },
  },
  {
    key: "metaDescription",
    label: "Meta description",
    hint: "Aumenta il CTR dai risultati di ricerca.",
    format: (s) => ({
      ok: !!s.metaDescriptionPresent,
      value: s.metaDescription?.trim()
        ? s.metaDescription.slice(0, 160)
        : "Assente",
    }),
  },
  {
    key: "h1First",
    label: "H1",
    hint: "Segnale di tema della pagina. Meglio averne uno.",
    format: (s) => {
      const c = s.h1Count ?? 0;
      if (c === 0) return { ok: false, value: "Assente" };
      if (c === 1) return { ok: true, value: s.h1First || "(vuoto)" };
      return { ok: "warn", value: `${c} H1 — meglio averne uno solo` };
    },
  },
  {
    key: "canonical",
    label: "Canonical",
    hint: "Evita duplicati in SERP.",
    format: (s) => ({
      ok: !!s.canonicalPresent,
      value: s.canonical || "Non dichiarato",
    }),
  },
  {
    key: "indexable",
    label: "Indicizzabile",
    hint: "Con noindex il sito è invisibile ai motori di ricerca.",
    format: (s) => ({
      ok: s.indexable !== false,
      value: s.indexable === false ? "Noindex attivo" : "Sì",
    }),
  },
  {
    key: "robotsMeta",
    label: "Meta robots",
    hint: "Direttive di crawling a livello pagina.",
    format: (s) => ({
      ok: true,
      value: s.robotsMeta?.trim() || "(default)",
    }),
  },
  {
    key: "schemaPresent",
    label: "Schema JSON-LD",
    hint: "Abilita rich snippet (stelle, FAQ, prezzi).",
    format: (s) => ({
      ok: !!s.schemaPresent,
      value: s.schemaPresent ? "Rilevato" : "Assente",
    }),
  },
  {
    key: "sitemapPresent",
    label: "Sitemap XML",
    hint: "Velocizza la scoperta delle pagine da parte dei crawler.",
    format: (s) => ({
      ok: !!s.sitemapPresent,
      value: s.sitemapPresent ? "Disponibile" : "Non trovata",
    }),
  },
  {
    key: "robotsTxtPresent",
    label: "robots.txt",
    hint: "File base di controllo crawler.",
    format: (s) => ({
      ok: !!s.robotsTxtPresent,
      value: s.robotsTxtPresent ? "Disponibile" : "Non trovato",
    }),
  },
];

function SeoTab({ seo }: { seo: SeoSignalsShape | null }) {
  if (!seo) {
    return (
      <Card padding="lg" className="text-center text-sm text-ink-400">
        Nessun dato SEO disponibile per questo lead.
      </Card>
    );
  }
  return (
    <Card
      title="Analisi SEO"
      subtitle="Stato dei principali segnali SEO rilevati in homepage"
    >
      <ul className="divide-y divide-ink-300/30">
        {SEO_ROWS.map((row) => {
          const { ok, value } = row.format(seo);
          const Icon =
            ok === true ? CheckCircle2 : ok === "warn" ? AlertTriangle : XCircle;
          const color =
            ok === true
              ? "text-tile-green-icon"
              : ok === "warn"
              ? "text-tile-orange-icon"
              : "text-tile-pink-icon";
          return (
            <li key={row.key} className="flex items-start gap-3 py-3">
              <Icon className={clsx("mt-0.5 h-5 w-5 shrink-0", color)} />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-ink-900">{row.label}</p>
                <p className="text-xs text-ink-500">{row.hint}</p>
                <p className="mt-1 break-words text-xs text-ink-700">
                  {value}
                </p>
              </div>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}

/* ---------- Tech tab ---------- */

function TechTab({ lead }: { lead: Lead }) {
  const q = lead.siteQualityNotes ?? {};
  return (
    <div className="space-y-5">
      <Card title="Stack tecnologico" subtitle="CMS e strumenti rilevati sul sito">
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <BoolRow label="CMS" value={lead.cms ?? "Non rilevato"} ok={Boolean(lead.cms)} />
          <BoolRow
            label="E-commerce platform"
            value={lead.ecommercePlatform ?? "—"}
            ok={Boolean(lead.ecommercePlatform)}
          />
          <BoolRow
            label="Analytics"
            value={lead.analyticsPresent ? "Rilevato" : "Non rilevato"}
            ok={lead.analyticsPresent}
          />
          <BoolRow
            label="Tag Manager"
            value={lead.tagManagerPresent ? "Rilevato" : "Non rilevato"}
            ok={lead.tagManagerPresent}
          />
          <BoolRow
            label="Blog"
            value={lead.hasBlog ? "Presente" : "Assente"}
            ok={lead.hasBlog}
          />
          <BoolRow
            label="Catalogo prodotti"
            value={q.hasProductsOrCollections ? "Rilevato" : "Non rilevato"}
            ok={Boolean(q.hasProductsOrCollections)}
          />
          <BoolRow
            label="Pagina contatti"
            value={lead.hasContactPage ? "Presente" : "Assente"}
            ok={lead.hasContactPage}
          />
          <BoolRow
            label="Form di contatto"
            value={lead.hasForm ? "Rilevato" : "Non rilevato"}
            ok={lead.hasForm}
          />
        </div>
      </Card>

      <Card title="Qualità sito" subtitle="Indicatori sullo stato del sito">
        <dl className="grid grid-cols-1 gap-x-4 gap-y-2 text-sm sm:grid-cols-2">
          <DlRow
            label="Sito datato"
            value={q.likelySiteDated ? "Probabilmente sì" : "No"}
          />
          <DlRow
            label="Anno copyright"
            value={q.copyrightYear ? String(q.copyrightYear) : "—"}
          />
          <DlRow
            label="Performance stimata"
            value={
              lead.performanceEstimate != null
                ? `${lead.performanceEstimate}/100`
                : "—"
            }
          />
          <DlRow
            label="Ultimo scan"
            value={lead.lastScannedAt ? formatDateTime(lead.lastScannedAt) : "—"}
          />
        </dl>
      </Card>

      <Card
        title="Pagine scansionate"
        subtitle={`${lead.scans.length} pagine analizzate dal crawler`}
      >
        {lead.scans.length === 0 ? (
          <p className="py-6 text-center text-sm text-ink-400">
            Nessuno scan disponibile.
          </p>
        ) : (
          <div className="space-y-2">
            {lead.scans.map((s) => (
              <ScanRow key={s.id} scan={s} />
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

function ScanRow({ scan }: { scan: ScanResult }) {
  const [open, setOpen] = useState(false);
  const hasExtra = Boolean(
    scan.metaDescription ||
      scan.canonical ||
      scan.robotsMeta ||
      (scan.structuredData && Object.keys(scan.structuredData).length > 0) ||
      (scan.notes && Object.keys(scan.notes).length > 0),
  );
  return (
    <div className="rounded-xl bg-surface-muted px-4 py-3 text-sm">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-2 text-left"
        disabled={!hasExtra}
      >
        <FileText className="h-4 w-4 shrink-0 text-ink-400" />
        <Badge tone="neutral" className="capitalize">
          {scan.pageType}
        </Badge>
        {scan.httpStatus && (
          <Badge tone={scan.httpStatus < 400 ? "green" : "pink"}>
            {scan.httpStatus}
          </Badge>
        )}
        <span className="ml-auto text-[11px] text-ink-400">
          {formatDate(scan.scannedAt)}
        </span>
        {hasExtra && (
          <ChevronDown
            className={clsx(
              "h-4 w-4 shrink-0 text-ink-400 transition-transform",
              open && "rotate-180",
            )}
          />
        )}
      </button>
      <p className="mt-1 truncate text-xs text-ink-500">{scan.scannedUrl}</p>
      {scan.title && (
        <p className="mt-1 text-xs">
          <span className="text-ink-500">Title:</span>{" "}
          <span className="text-ink-900">{scan.title}</span>
        </p>
      )}
      {scan.h1 && (
        <p className="text-xs">
          <span className="text-ink-500">H1:</span>{" "}
          <span className="text-ink-900">{scan.h1}</span>
        </p>
      )}
      {open && hasExtra && (
        <div className="mt-3 space-y-2 border-t border-ink-300/40 pt-3 text-xs">
          {scan.metaDescription && (
            <p>
              <span className="text-ink-500">Meta:</span>{" "}
              <span className="text-ink-700">{scan.metaDescription}</span>
            </p>
          )}
          {scan.canonical && (
            <p className="break-all">
              <span className="text-ink-500">Canonical:</span>{" "}
              <span className="text-ink-700">{scan.canonical}</span>
            </p>
          )}
          {scan.robotsMeta && (
            <p>
              <span className="text-ink-500">Robots meta:</span>{" "}
              <span className="text-ink-700">{scan.robotsMeta}</span>
            </p>
          )}
          {scan.structuredData && Object.keys(scan.structuredData).length > 0 && (
            <details>
              <summary className="cursor-pointer text-ink-500 hover:text-ink-900">
                Structured data
              </summary>
              <pre className="mt-1 max-h-48 overflow-auto rounded-lg bg-surface p-2 text-[11px] text-ink-700">
                {JSON.stringify(scan.structuredData, null, 2)}
              </pre>
            </details>
          )}
        </div>
      )}
    </div>
  );
}

/* ---------- Contacts tab ---------- */

function ContactsTab({ lead }: { lead: Lead }) {
  const points = CONTACT_POINTS;
  const channels: Array<{ label: string; hit: boolean; points: number; hint?: string }> = [
    {
      label: "Email pubblica",
      hit: Boolean(lead.publicEmail),
      points: points.publicEmail,
      hint: lead.publicEmail ?? undefined,
    },
    { label: "Pagina contatti", hit: lead.hasContactPage, points: points.contactPage },
    { label: "Form di contatto", hit: lead.hasForm, points: points.form },
    {
      label: "Telefono pubblico",
      hit: Boolean(lead.publicPhone),
      points: points.publicPhone,
      hint: lead.publicPhone ?? undefined,
    },
    {
      label: "Profili social",
      hit: Boolean(lead.socialLinks && Object.keys(lead.socialLinks).length > 0),
      points: points.socials,
    },
  ];

  const score = lead.contactabilityScore;
  const judgment =
    score >= 70 ? "ottimo" : score >= 45 ? "buono" : score >= 20 ? "basso" : "scarso";

  return (
    <div className="space-y-5">
      <Card title="Contattabilità" subtitle="Quanto è facile raggiungere questo lead">
        <div className="flex flex-wrap items-center gap-6">
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-extrabold text-tile-blue-icon">{score}</span>
            <span className="text-sm font-medium text-ink-500">/100 · {judgment}</span>
          </div>
          <div className="min-w-[200px] flex-1">
            <div className="h-2 w-full rounded-full bg-surface-sunken">
              <div
                className="h-full rounded-full bg-tile-blue-icon"
                style={{ width: `${score}%` }}
              />
            </div>
          </div>
        </div>

        <ul className="mt-5 space-y-2">
          {channels.map((c) => (
            <li key={c.label} className="flex items-center gap-3 text-sm">
              {c.hit ? (
                <CheckCircle2 className="h-4 w-4 shrink-0 text-tile-green-icon" />
              ) : (
                <XCircle className="h-4 w-4 shrink-0 text-ink-300" />
              )}
              <span
                className={clsx(
                  "font-medium",
                  c.hit ? "text-ink-900" : "text-ink-400",
                )}
              >
                {c.label}
              </span>
              {c.hint && <span className="text-xs text-ink-500">· {c.hint}</span>}
              <span className="ml-auto text-xs font-semibold text-ink-500">
                +{c.points}
              </span>
            </li>
          ))}
        </ul>
      </Card>

      <Card title="Canali disponibili" subtitle="Link pronti all'uso">
        {lead.publicEmail || lead.publicPhone || (lead.socialLinks && Object.keys(lead.socialLinks).length > 0) ? (
          <div className="space-y-2 text-sm">
            {lead.publicEmail && (
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-ink-400" />
                <a
                  href={`mailto:${lead.publicEmail}`}
                  className="text-brand-600 hover:underline"
                >
                  {lead.publicEmail}
                </a>
              </div>
            )}
            {lead.publicPhone && (
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-ink-400" />
                <a
                  href={`tel:${lead.publicPhone}`}
                  className="text-brand-600 hover:underline"
                >
                  {lead.publicPhone}
                </a>
              </div>
            )}
            {lead.socialLinks &&
              Object.entries(lead.socialLinks).map(([k, v]) => (
                <div key={k} className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-ink-400" />
                  <a
                    href={v}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="capitalize text-brand-600 hover:underline"
                  >
                    {k}
                  </a>
                </div>
              ))}
          </div>
        ) : (
          <p className="py-6 text-center text-sm text-ink-400">
            Nessun canale pubblico rilevato.
          </p>
        )}
      </Card>
    </div>
  );
}

/* ---------- Outreach tab ---------- */

function OutreachTab({
  drafts,
  generating,
  onGenerate,
}: {
  drafts: OutreachDraft[];
  generating: boolean;
  onGenerate: () => void;
}) {
  const [channel, setChannel] = useState<"email" | "linkedin">("email");
  const [historyOpen, setHistoryOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const latest = drafts[0];
  const older = drafts.slice(1);

  async function copy(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* noop */
    }
  }

  return (
    <Card
      title="Outreach AI"
      subtitle="Hook, mini audit e messaggi generati con Claude"
      actions={
        <Button
          size="sm"
          onClick={onGenerate}
          disabled={generating}
          iconLeft={<Wand2 className="h-3.5 w-3.5" />}
        >
          {generating ? "Generazione…" : latest ? "Rigenera" : "Genera"}
        </Button>
      }
    >
      {!latest ? (
        <div className="rounded-xl bg-surface-muted px-4 py-10 text-center">
          <Sparkles className="mx-auto h-8 w-8 text-brand-400" />
          <p className="mt-2 text-sm font-medium text-ink-900">
            Nessun outreach generato
          </p>
          <p className="mt-1 text-xs text-ink-500">
            Clicca &quot;Genera&quot; per creare hook + mini audit + email + DM LinkedIn.
          </p>
        </div>
      ) : (
        <div className="space-y-5 text-sm">
          <OutreachSection label="Hook" value={latest.hook} />
          <OutreachSection label="Mini audit" value={latest.miniAudit} preformatted />
          <OutreachSection label="Servizio suggerito" value={latest.suggestedOffer} />

          <div>
            <div className="mb-2 flex items-center justify-between gap-2">
              <Tabs
                variant="pill"
                value={channel}
                onChange={setChannel}
                items={[
                  { id: "email" as const, label: "Email" },
                  { id: "linkedin" as const, label: "LinkedIn" },
                ]}
              />
              <Button
                size="sm"
                variant="secondary"
                onClick={() =>
                  copy(channel === "email" ? latest.emailDraft : latest.linkedinDraft)
                }
                iconLeft={
                  copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />
                }
              >
                {copied ? "Copiato" : "Copia"}
              </Button>
            </div>
            <pre className="whitespace-pre-wrap rounded-xl bg-surface-muted px-4 py-3 text-xs leading-relaxed text-ink-700">
              {channel === "email" ? latest.emailDraft : latest.linkedinDraft}
            </pre>
          </div>

          <p className="text-[11px] text-ink-400">
            Generato {formatDateTime(latest.createdAt)} · {latest.model} · prompt{" "}
            {latest.promptVersion}
          </p>

          {older.length > 0 && (
            <div className="border-t border-ink-300/40 pt-4">
              <button
                type="button"
                onClick={() => setHistoryOpen((v) => !v)}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink-500 hover:text-ink-900"
              >
                <ChevronDown
                  className={clsx(
                    "h-4 w-4 transition-transform",
                    historyOpen && "rotate-180",
                  )}
                />
                Versioni precedenti ({older.length})
              </button>
              {historyOpen && (
                <ul className="mt-3 space-y-2">
                  {older.map((d) => (
                    <HistoryRow key={d.id} draft={d} />
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      )}
    </Card>
  );
}

function HistoryRow({ draft }: { draft: OutreachDraft }) {
  const [open, setOpen] = useState(false);
  return (
    <li className="rounded-xl bg-surface-muted px-3 py-2 text-xs">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-2 text-left"
      >
        <ChevronDown
          className={clsx(
            "h-3.5 w-3.5 text-ink-400 transition-transform",
            open && "rotate-180",
          )}
        />
        <span className="font-medium text-ink-900">
          {formatDateTime(draft.createdAt)}
        </span>
        <span className="text-ink-400">· {draft.model}</span>
        <span className="ml-auto text-ink-400">v{draft.promptVersion}</span>
      </button>
      {open && (
        <div className="mt-2 space-y-3 border-t border-ink-300/40 pt-2">
          <OutreachSection label="Hook" value={draft.hook} />
          <OutreachSection label="Email" value={draft.emailDraft} preformatted />
          <OutreachSection label="LinkedIn" value={draft.linkedinDraft} preformatted />
        </div>
      )}
    </li>
  );
}

/* ---------- Shared small bits ---------- */

function OutreachSection({
  label,
  value,
  preformatted,
}: {
  label: string;
  value: string;
  preformatted?: boolean;
}) {
  return (
    <div>
      <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-ink-400">
        {label}
      </p>
      <p
        className={clsx(
          "text-ink-700",
          preformatted && "whitespace-pre-line",
        )}
      >
        {value}
      </p>
    </div>
  );
}

function DlRow({ label, value }: { label: string; value: string }) {
  return (
    <>
      <dt className="text-ink-500">{label}</dt>
      <dd className="font-medium text-ink-900">{value}</dd>
    </>
  );
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <dt className="text-ink-500">{label}</dt>
      <dd className="font-medium text-ink-700">{value}</dd>
    </div>
  );
}

function BoolRow({
  label,
  value,
  ok,
}: {
  label: string;
  value: string;
  ok: boolean;
}) {
  const Icon = ok ? CheckCircle2 : XCircle;
  return (
    <div className="flex items-center gap-2 rounded-xl bg-surface-muted px-3 py-2 text-sm">
      <Icon
        className={clsx(
          "h-4 w-4 shrink-0",
          ok ? "text-tile-green-icon" : "text-ink-300",
        )}
      />
      <span className="text-ink-500">{label}:</span>
      <span className="font-medium text-ink-900">{value}</span>
    </div>
  );
}
