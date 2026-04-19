"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Download,
  Mail,
  MailX,
  Trash2,
  SlidersHorizontal,
  X,
  Pencil,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input, Select, Field, Textarea } from "@/components/ui/Input";
import { Table, THead, TH, TBody, TR, TD } from "@/components/ui/Table";
import { Modal } from "@/components/ui/Modal";
import { useConfirm } from "@/components/ui/ConfirmProvider";

interface Lead {
  id: string;
  companyName: string | null;
  domain: string;
  cms: string | null;
  niche: string | null;
  country: string | null;
  totalScore: number;
  publicEmail: string | null;
  status: string;
  userNotes: string | null;
  scoreReasons: string[] | null;
}

const STATUS_OPTIONS = [
  { value: "new", label: "Nuovo" },
  { value: "to_contact", label: "Da contattare" },
  { value: "contacted", label: "Contattato" },
  { value: "not_relevant", label: "Non rilevante" },
  { value: "closed", label: "Chiuso" },
];

interface LeadsResponse {
  leads: Lead[];
  total: number;
  page: number;
  totalPages: number;
}

const STATUS_LABELS: Record<string, string> = {
  new: "Nuovo",
  to_contact: "Da contattare",
  contacted: "Contattato",
  not_relevant: "Non rilevante",
  closed: "Chiuso",
};

const STATUS_TONE: Record<string, "neutral" | "brand" | "green" | "yellow" | "pink"> = {
  new: "neutral",
  to_contact: "yellow",
  contacted: "brand",
  not_relevant: "pink",
  closed: "green",
};

function scoreTone(s: number): "green" | "yellow" | "neutral" {
  if (s >= 70) return "green";
  if (s >= 45) return "yellow";
  return "neutral";
}

export default function LeadsPage() {
  const [data, setData] = useState<LeadsResponse | null>(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [minScore, setMinScore] = useState("");
  const [cms, setCms] = useState("");
  const [hasEmail, setHasEmail] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [editing, setEditing] = useState<Lead | null>(null);
  const [editStatus, setEditStatus] = useState("");
  const [editNotes, setEditNotes] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);
  const activeFilters =
    (search ? 1 : 0) + (minScore ? 1 : 0) + (cms ? 1 : 0) + (hasEmail ? 1 : 0);
  const confirm = useConfirm();
  const router = useRouter();

  function openEdit(lead: Lead) {
    setEditing(lead);
    setEditStatus(lead.status);
    setEditNotes(lead.userNotes ?? "");
  }

  async function saveEdit() {
    if (!editing) return;
    setSavingEdit(true);
    const res = await fetch(`/api/leads/${editing.id}/status`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: editStatus, userNotes: editNotes }),
    });
    setSavingEdit(false);
    if (res.ok) {
      setData((prev) =>
        prev
          ? {
              ...prev,
              leads: prev.leads.map((l) =>
                l.id === editing.id
                  ? { ...l, status: editStatus, userNotes: editNotes }
                  : l,
              ),
            }
          : prev,
      );
      setEditing(null);
    }
  }

  const load = useCallback(async () => {
    const sp = new URLSearchParams({ page: String(page), perPage: "25" });
    if (search) sp.set("search", search);
    if (minScore) sp.set("minScore", minScore);
    if (cms) sp.set("cms", cms);
    if (hasEmail) sp.set("hasEmail", "true");
    const res = await fetch(`/api/leads?${sp.toString()}`);
    if (res.ok) setData((await res.json()) as LeadsResponse);
  }, [page, search, minScore, cms, hasEmail]);

  useEffect(() => {
    load();
  }, [load]);

  function buildExportUrl() {
    const sp = new URLSearchParams();
    if (minScore) sp.set("minScore", minScore);
    if (cms) sp.set("cms", cms);
    if (hasEmail) sp.set("hasEmail", "true");
    return `/api/leads/export?${sp.toString()}`;
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm text-ink-500">Lead qualificati</p>
          <h2 className="text-2xl font-bold text-ink-900">
            {data ? `${data.total} lead` : "Caricamento…"}
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            onClick={() => setFiltersOpen((v) => !v)}
            iconLeft={<SlidersHorizontal className="h-4 w-4" />}
          >
            Filtri
            {activeFilters > 0 && (
              <Badge tone="brand" className="ml-1">
                {activeFilters}
              </Badge>
            )}
          </Button>
          <Button
            href={buildExportUrl()}
            variant="secondary"
            download
            iconLeft={<Download className="h-4 w-4" />}
          >
            Esporta CSV
          </Button>
        </div>
      </div>

      {filtersOpen && (
        <Card padding="md">
          <div className="flex flex-wrap items-center gap-3">
            <Input
              placeholder="Cerca azienda o dominio…"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-64"
            />
            <Input
              placeholder="Score min"
              type="number"
              value={minScore}
              onChange={(e) => {
                setMinScore(e.target.value);
                setPage(1);
              }}
              className="w-32"
            />
            <Select
              value={cms}
              onChange={(e) => {
                setCms(e.target.value);
                setPage(1);
              }}
              className="w-44"
            >
              <option value="">CMS: tutti</option>
              <option value="shopify">Shopify</option>
              <option value="wordpress">WordPress</option>
              <option value="woocommerce">WooCommerce</option>
            </Select>
            <label className="flex cursor-pointer items-center gap-2 rounded-xl px-3 py-2 text-sm text-ink-700 ring-1 ring-ink-300/60 hover:bg-surface-muted">
              <input
                type="checkbox"
                checked={hasEmail}
                onChange={(e) => {
                  setHasEmail(e.target.checked);
                  setPage(1);
                }}
                className="h-4 w-4 rounded text-brand-600 focus:ring-brand-400"
              />
              Solo con email
            </label>
            {activeFilters > 0 && (
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setMinScore("");
                  setCms("");
                  setHasEmail(false);
                  setPage(1);
                }}
                className="ml-auto inline-flex items-center gap-1 text-xs font-medium text-ink-500 hover:text-ink-900"
              >
                <X className="h-3.5 w-3.5" />
                Azzera filtri
              </button>
            )}
          </div>
        </Card>
      )}

      <Card padding="sm">
        <Table>
          <THead>
            <tr>
              <TH>Azienda / Dominio</TH>
              <TH>CMS</TH>
              <TH>Nicchia</TH>
              <TH>Score</TH>
              <TH>Email</TH>
              <TH>Stato</TH>
              <TH />
            </tr>
          </THead>
          <TBody>
            {data?.leads.map((lead) => (
              <TR
                key={lead.id}
                onClick={() => router.push(`/leads/${lead.id}`)}
                className="cursor-pointer"
              >
                <TD>
                  <p className="font-semibold text-ink-900">
                    {lead.companyName ?? lead.domain}
                  </p>
                  <p className="text-xs text-ink-400">{lead.domain}</p>
                </TD>
                <TD>
                  {lead.cms ? (
                    <Badge tone="blue" className="capitalize">
                      {lead.cms}
                    </Badge>
                  ) : (
                    <span className="text-ink-300">—</span>
                  )}
                </TD>
                <TD className="text-ink-500">{lead.niche ?? "—"}</TD>
                <TD>
                  <Badge tone={scoreTone(lead.totalScore)}>
                    <span className="font-bold">{lead.totalScore}</span>
                  </Badge>
                </TD>
                <TD>
                  {lead.publicEmail ? (
                    <a
                      href={`mailto:${lead.publicEmail}`}
                      onClick={(e) => e.stopPropagation()}
                      className="flex max-w-[200px] items-center gap-1.5 truncate text-xs text-brand-600 hover:underline"
                    >
                      <Mail className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate">{lead.publicEmail}</span>
                    </a>
                  ) : (
                    <span className="flex items-center gap-1.5 text-xs text-ink-300">
                      <MailX className="h-3.5 w-3.5" />
                      —
                    </span>
                  )}
                </TD>
                <TD>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      openEdit(lead);
                    }}
                    className="group inline-flex items-center gap-1.5 rounded-lg transition-colors"
                    aria-label="Cambia stato"
                    title="Cambia stato o aggiungi note"
                  >
                    <Badge tone={STATUS_TONE[lead.status] ?? "neutral"}>
                      {STATUS_LABELS[lead.status] ?? lead.status}
                    </Badge>
                    <Pencil className="h-3 w-3 text-ink-300 opacity-0 transition-opacity group-hover:opacity-100" />
                    {lead.userNotes && (
                      <span
                        className="h-1.5 w-1.5 rounded-full bg-tile-yellow-icon"
                        title="Note presenti"
                      />
                    )}
                  </button>
                </TD>
                <TD className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={async (e) => {
                        e.stopPropagation();
                        const ok = await confirm({
                          title: `Eliminare "${lead.companyName ?? lead.domain}"?`,
                          message:
                            "Il lead verrà rimosso definitivamente insieme a scan e outreach.",
                          confirmLabel: "Elimina",
                          tone: "danger",
                        });
                        if (!ok) return;
                        await fetch(`/api/leads/${lead.id}`, { method: "DELETE" });
                        load();
                      }}
                      aria-label="Elimina lead"
                      className="rounded-lg p-1.5 text-ink-400 hover:bg-tile-pink-bg hover:text-tile-pink-icon"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </TD>
              </TR>
            ))}
            {data?.leads.length === 0 && (
              <TR>
                <TD colSpan={7} className="py-10 text-center text-ink-400">
                  Nessun lead trovato con questi filtri.
                </TD>
              </TR>
            )}
          </TBody>
        </Table>
      </Card>

      {data && data.totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 text-sm">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            ← Indietro
          </Button>
          <span className="text-ink-500">
            Pagina <span className="font-semibold text-ink-900">{page}</span> di{" "}
            {data.totalPages}
          </span>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
            disabled={page === data.totalPages}
          >
            Avanti →
          </Button>
        </div>
      )}

      <Modal
        open={editing !== null}
        onClose={() => (savingEdit ? null : setEditing(null))}
        title={editing ? editing.companyName ?? editing.domain : ""}
        description="Aggiorna lo stato del lead e le tue note personali."
        size="md"
        footer={
          <>
            <Button
              variant="ghost"
              onClick={() => setEditing(null)}
              disabled={savingEdit}
            >
              Annulla
            </Button>
            <Button onClick={saveEdit} disabled={savingEdit}>
              {savingEdit ? "Salvataggio…" : "Salva"}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Field label="Stato">
            <Select
              value={editStatus}
              onChange={(e) => setEditStatus(e.target.value)}
            >
              {STATUS_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Note personali">
            <Textarea
              value={editNotes}
              onChange={(e) => setEditNotes(e.target.value)}
              placeholder="Es. contattato il 15/04, risposta il 18/04…"
              rows={5}
            />
          </Field>
        </div>
      </Modal>
    </div>
  );
}
