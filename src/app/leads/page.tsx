"use client";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";

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
  scoreReasons: string[] | null;
}

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

const SCORE_COLOR = (s: number) =>
  s >= 70 ? "text-green-700" : s >= 45 ? "text-yellow-700" : "text-neutral-500";

export default function LeadsPage() {
  const [data, setData] = useState<LeadsResponse | null>(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [minScore, setMinScore] = useState("");
  const [cms, setCms] = useState("");
  const [hasEmail, setHasEmail] = useState(false);

  const load = useCallback(async () => {
    const sp = new URLSearchParams({ page: String(page), perPage: "25" });
    if (search) sp.set("search", search);
    if (minScore) sp.set("minScore", minScore);
    if (cms) sp.set("cms", cms);
    if (hasEmail) sp.set("hasEmail", "true");
    const res = await fetch(`/api/leads?${sp.toString()}`);
    if (res.ok) setData((await res.json()) as LeadsResponse);
  }, [page, search, minScore, cms, hasEmail]);

  useEffect(() => { load(); }, [load]);

  function buildExportUrl() {
    const sp = new URLSearchParams();
    if (minScore) sp.set("minScore", minScore);
    if (cms) sp.set("cms", cms);
    if (hasEmail) sp.set("hasEmail", "true");
    return `/api/leads/export?${sp.toString()}`;
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">
          Lead{data ? ` (${data.total})` : ""}
        </h1>
        <a
          href={buildExportUrl()}
          download
          className="rounded border px-3 py-1.5 text-sm hover:bg-neutral-50"
        >
          Esporta CSV
        </a>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 text-sm">
        <input
          placeholder="Cerca…"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="rounded border px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          placeholder="Score min"
          type="number"
          value={minScore}
          onChange={(e) => { setMinScore(e.target.value); setPage(1); }}
          className="w-28 rounded border px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select
          value={cms}
          onChange={(e) => { setCms(e.target.value); setPage(1); }}
          className="rounded border px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">CMS: tutti</option>
          <option value="shopify">Shopify</option>
          <option value="wordpress">WordPress</option>
          <option value="woocommerce">WooCommerce</option>
        </select>
        <label className="flex items-center gap-1.5 cursor-pointer">
          <input
            type="checkbox"
            checked={hasEmail}
            onChange={(e) => { setHasEmail(e.target.checked); setPage(1); }}
          />
          Solo con email
        </label>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded border">
        <table className="w-full text-sm">
          <thead className="bg-neutral-50 text-left text-xs uppercase tracking-wide text-neutral-500">
            <tr>
              <th className="px-4 py-3">Azienda / Dominio</th>
              <th className="px-4 py-3">CMS</th>
              <th className="px-4 py-3">Nicchia</th>
              <th className="px-4 py-3">Score</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Stato</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {data?.leads.map((lead) => (
              <tr key={lead.id} className="hover:bg-neutral-50">
                <td className="px-4 py-3">
                  <p className="font-medium">{lead.companyName ?? lead.domain}</p>
                  <p className="text-xs text-neutral-400">{lead.domain}</p>
                </td>
                <td className="px-4 py-3">
                  <span className="rounded bg-neutral-100 px-1.5 py-0.5 text-xs">
                    {lead.cms ?? "—"}
                  </span>
                </td>
                <td className="px-4 py-3 text-neutral-600">{lead.niche ?? "—"}</td>
                <td className={`px-4 py-3 font-semibold ${SCORE_COLOR(lead.totalScore)}`}>
                  {lead.totalScore}
                </td>
                <td className="px-4 py-3">
                  {lead.publicEmail ? (
                    <a href={`mailto:${lead.publicEmail}`} className="text-blue-600 hover:underline truncate block max-w-[180px]">
                      {lead.publicEmail}
                    </a>
                  ) : (
                    <span className="text-neutral-300">—</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <span className="text-xs">{STATUS_LABELS[lead.status] ?? lead.status}</span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <Link
                      href={`/leads/${lead.id}`}
                      className="text-blue-600 hover:underline text-xs"
                    >
                      Dettaglio
                    </Link>
                    <button
                      onClick={async () => {
                        if (!confirm(`Eliminare "${lead.companyName ?? lead.domain}"?`)) return;
                        await fetch(`/api/leads/${lead.id}`, { method: "DELETE" });
                        load();
                      }}
                      className="text-xs text-red-400 hover:text-red-600"
                    >
                      Elimina
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {data?.leads.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-neutral-400">
                  Nessun lead trovato.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {data && data.totalPages > 1 && (
        <div className="flex items-center gap-3 text-sm">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="rounded border px-3 py-1 disabled:opacity-40"
          >
            ← Indietro
          </button>
          <span className="text-neutral-500">
            Pagina {page} di {data.totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
            disabled={page === data.totalPages}
            className="rounded border px-3 py-1 disabled:opacity-40"
          >
            Avanti →
          </button>
        </div>
      )}
    </div>
  );
}
