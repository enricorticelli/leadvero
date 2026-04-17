"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

interface ScanResult {
  id: string;
  pageType: string;
  scannedUrl: string;
  httpStatus: number | null;
  title: string | null;
  metaDescription: string | null;
  h1: string | null;
  structuredData: { detected?: boolean } | null;
}

interface OutreachDraft {
  id: string;
  hook: string;
  miniAudit: string;
  suggestedOffer: string;
  emailDraft: string;
  linkedinDraft: string;
}

interface Lead {
  id: string;
  companyName: string | null;
  domain: string;
  cms: string | null;
  niche: string | null;
  country: string | null;
  city: string | null;
  language: string | null;
  publicEmail: string | null;
  publicPhone: string | null;
  hasContactPage: boolean;
  hasBlog: boolean;
  analyticsPresent: boolean;
  tagManagerPresent: boolean;
  totalScore: number;
  fitScore: number;
  opportunityScore: number;
  commercialScore: number;
  contactabilityScore: number;
  scoreReasons: string[] | null;
  seoSignals: Record<string, unknown> | null;
  siteQualityNotes: Record<string, unknown> | null;
  socialLinks: Record<string, string> | null;
  status: string;
  userNotes: string | null;
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

export default function LeadDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [lead, setLead] = useState<Lead | null>(null);
  const [generating, setGenerating] = useState(false);
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [activeTab, setActiveTab] = useState<"email" | "linkedin">("email");

  useEffect(() => {
    fetch(`/api/leads/${id}`)
      .then((r) => r.json())
      .then((d: Lead) => {
        setLead(d);
        setNotes(d.userNotes ?? "");
        setStatus(d.status);
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
    if (!confirm(`Eliminare il lead "${lead?.companyName ?? lead?.domain}"? L'operazione non è reversibile.`)) return;
    setDeleting(true);
    await fetch(`/api/leads/${id}`, { method: "DELETE" });
    router.push("/leads");
  }

  async function saveStatus() {
    setSaving(true);
    await fetch(`/api/leads/${id}/status`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, userNotes: notes }),
    });
    setSaving(false);
  }

  if (!lead) return <p className="text-neutral-400 text-sm">Caricamento…</p>;

  const draft = lead.outreach[0];

  return (
    <div className="space-y-8 max-w-3xl">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">
            {lead.companyName ?? lead.domain}
          </h1>
          <a
            href={`https://${lead.domain}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-blue-600 hover:underline"
          >
            {lead.domain} ↗
          </a>
        </div>
        <div className="flex flex-col items-end gap-2">
          <div className="text-right">
            <p className="text-3xl font-bold text-blue-700">{lead.totalScore}</p>
            <p className="text-xs text-neutral-400">score totale</p>
          </div>
          <button
            onClick={deleteLead}
            disabled={deleting}
            className="rounded border border-red-200 px-3 py-1 text-xs text-red-600 hover:bg-red-50 disabled:opacity-50"
          >
            {deleting ? "Eliminazione…" : "Elimina lead"}
          </button>
        </div>
      </div>

      {/* Score breakdown */}
      <section className="space-y-2">
        <h2 className="font-medium text-sm uppercase tracking-wide text-neutral-500">Score</h2>
        <div className="grid grid-cols-4 gap-3 text-center text-sm">
          {[
            { label: "Fit", val: lead.fitScore },
            { label: "Opportunità", val: lead.opportunityScore },
            { label: "Commerciale", val: lead.commercialScore },
            { label: "Contattabilità", val: lead.contactabilityScore },
          ].map(({ label, val }) => (
            <div key={label} className="rounded border p-3">
              <p className="text-xl font-semibold">{val}</p>
              <p className="text-xs text-neutral-500">{label}</p>
            </div>
          ))}
        </div>
        {lead.scoreReasons && lead.scoreReasons.length > 0 && (
          <ul className="mt-2 space-y-1 text-sm text-neutral-600">
            {(lead.scoreReasons as string[]).map((r, i) => (
              <li key={i} className="flex gap-2">
                <span className="text-orange-400">▸</span> {r}
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Site info */}
      <section className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
        <h2 className="col-span-2 font-medium text-sm uppercase tracking-wide text-neutral-500">
          Sito
        </h2>
        <Row label="CMS" value={lead.cms ?? "—"} />
        <Row label="Nicchia" value={lead.niche ?? "—"} />
        <Row label="Paese" value={`${lead.country ?? "—"} ${lead.city ? `/ ${lead.city}` : ""}`} />
        <Row label="Lingua" value={lead.language ?? "—"} />
        <Row label="Blog" value={lead.hasBlog ? "Sì" : "No"} />
        <Row label="Analytics" value={lead.analyticsPresent ? "Sì" : "No"} />
        <Row label="Tag Manager" value={lead.tagManagerPresent ? "Sì" : "No"} />
        {Boolean(lead.siteQualityNotes?.likelySiteDated) && (
          <Row label="Sito datato" value="Probabilmente sì" />
        )}
      </section>

      {/* Contact */}
      <section className="space-y-2 text-sm">
        <h2 className="font-medium text-sm uppercase tracking-wide text-neutral-500">Contatti</h2>
        {lead.publicEmail && (
          <p>
            Email:{" "}
            <a href={`mailto:${lead.publicEmail}`} className="text-blue-600 hover:underline">
              {lead.publicEmail}
            </a>
          </p>
        )}
        {lead.publicPhone && <p>Telefono: {lead.publicPhone}</p>}
        {lead.socialLinks && Object.entries(lead.socialLinks).map(([k, v]) => (
          <p key={k}>
            {k.charAt(0).toUpperCase() + k.slice(1)}:{" "}
            <a href={v} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
              {v}
            </a>
          </p>
        ))}
        {!lead.publicEmail && !lead.publicPhone && (
          <p className="text-neutral-400">Nessun contatto pubblico trovato.</p>
        )}
      </section>

      {/* Scans */}
      {lead.scans.length > 0 && (
        <section className="space-y-2">
          <h2 className="font-medium text-sm uppercase tracking-wide text-neutral-500">
            Pagine analizzate
          </h2>
          <div className="space-y-2">
            {lead.scans.map((s) => (
              <div key={s.id} className="rounded border px-3 py-2 text-sm">
                <p className="font-medium">{s.pageType} — {s.httpStatus}</p>
                <p className="text-xs text-neutral-500 truncate">{s.scannedUrl}</p>
                {s.title && <p className="text-xs mt-1">Title: {s.title}</p>}
                {s.h1 && <p className="text-xs">H1: {s.h1}</p>}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Outreach */}
      <section className="space-y-4">
        <div className="flex items-center gap-4">
          <h2 className="font-medium text-sm uppercase tracking-wide text-neutral-500">
            Outreach
          </h2>
          <button
            onClick={generateOutreach}
            disabled={generating}
            className="rounded bg-blue-600 px-3 py-1 text-xs font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {generating ? "Generazione…" : draft ? "Rigenera" : "Genera con AI"}
          </button>
        </div>

        {draft && (
          <div className="space-y-4 rounded border p-4 text-sm">
            <div>
              <p className="text-xs font-medium uppercase text-neutral-400 mb-1">Hook</p>
              <p>{draft.hook}</p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase text-neutral-400 mb-1">Mini audit</p>
              <p className="whitespace-pre-line">{draft.miniAudit}</p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase text-neutral-400 mb-1">Servizio suggerito</p>
              <p>{draft.suggestedOffer}</p>
            </div>
            <div>
              <div className="flex gap-3 mb-2">
                <button
                  onClick={() => setActiveTab("email")}
                  className={`text-xs font-medium ${activeTab === "email" ? "text-blue-600" : "text-neutral-500"}`}
                >
                  Email
                </button>
                <button
                  onClick={() => setActiveTab("linkedin")}
                  className={`text-xs font-medium ${activeTab === "linkedin" ? "text-blue-600" : "text-neutral-500"}`}
                >
                  LinkedIn
                </button>
              </div>
              <pre className="whitespace-pre-wrap rounded bg-neutral-50 px-4 py-3 text-xs leading-relaxed">
                {activeTab === "email" ? draft.emailDraft : draft.linkedinDraft}
              </pre>
            </div>
          </div>
        )}
      </section>

      {/* Status + notes */}
      <section className="space-y-3 text-sm">
        <h2 className="font-medium text-sm uppercase tracking-wide text-neutral-500">
          Stato e note
        </h2>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="rounded border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {STATUS_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Note personali su questo lead…"
          rows={3}
          className="w-full rounded border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={saveStatus}
          disabled={saving}
          className="rounded border px-3 py-1.5 text-sm hover:bg-neutral-50 disabled:opacity-50"
        >
          {saving ? "Salvataggio…" : "Salva"}
        </button>
      </section>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <p>
      <span className="text-neutral-500">{label}:</span>{" "}
      <span className="font-medium">{value}</span>
    </p>
  );
}
