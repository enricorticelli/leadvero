"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

const PLATFORMS = [
  { value: "any", label: "Qualsiasi" },
  { value: "shopify", label: "Shopify" },
  { value: "wordpress", label: "WordPress" },
  { value: "both", label: "Shopify + WordPress" },
];

const BUSINESS_TYPES = [
  { value: "", label: "Tutti" },
  { value: "ecommerce", label: "E-commerce" },
  { value: "local", label: "Business locale" },
  { value: "b2b", label: "B2B" },
  { value: "dtc", label: "DTC / Brand" },
];

export default function HomePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const body = {
      keyword: fd.get("keyword") || null,
      niche: fd.get("niche") || null,
      city: fd.get("city") || null,
      country: "IT",
      language: "it",
      targetPlatform: fd.get("targetPlatform") as string,
      businessType: fd.get("businessType") || null,
      maxResults: parseInt(fd.get("maxResults") as string, 10),
    };
    try {
      const res = await fetch("/api/searches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error(await res.text());
      await res.json();
      router.push("/searches");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Errore");
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">Nuova ricerca lead</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Inserisci i criteri per trovare aziende da contattare.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <label className="flex flex-col gap-1 text-sm font-medium">
            Nicchia / settore
            <input
              name="niche"
              placeholder="es. abbigliamento donna"
              className="rounded border px-3 py-2 text-sm font-normal focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium">
            Keyword aggiuntiva
            <input
              name="keyword"
              placeholder="es. scarpe running"
              className="rounded border px-3 py-2 text-sm font-normal focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </label>
        </div>

        <label className="flex flex-col gap-1 text-sm font-medium">
          Città / area geografica
          <input
            name="city"
            placeholder="es. Milano, Lombardia"
            className="rounded border px-3 py-2 text-sm font-normal focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </label>

        <div className="grid grid-cols-2 gap-4">
          <label className="flex flex-col gap-1 text-sm font-medium">
            Piattaforma target
            <select
              name="targetPlatform"
              defaultValue="any"
              className="rounded border px-3 py-2 text-sm font-normal focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {PLATFORMS.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium">
            Tipo di business
            <select
              name="businessType"
              defaultValue=""
              className="rounded border px-3 py-2 text-sm font-normal focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {BUSINESS_TYPES.map((b) => (
                <option key={b.value} value={b.value}>
                  {b.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label className="flex flex-col gap-1 text-sm font-medium">
          Numero massimo di risultati
          <input
            name="maxResults"
            type="number"
            min={5}
            max={100}
            defaultValue={30}
            className="w-32 rounded border px-3 py-2 text-sm font-normal focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </label>

        {error && (
          <p className="rounded bg-red-50 px-3 py-2 text-sm text-red-600">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="rounded bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Avvio ricerca…" : "Lancia ricerca"}
        </button>
      </form>
    </div>
  );
}
