"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Rocket,
  ArrowLeft,
  ArrowRight,
  Search,
  MapPin,
  Briefcase,
  Gauge,
  Globe2,
  ShoppingBag,
  Store,
  Building2,
  Sparkles,
  Layers,
  Lightbulb,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Input";
import { Stepper } from "@/components/ui/Stepper";
import { ChoiceCard } from "@/components/ui/ChoiceCard";

interface FormState {
  niche: string;
  keyword: string;
  city: string;
  targetPlatform: "any" | "shopify" | "wordpress" | "both";
  businessType: "" | "ecommerce" | "local" | "b2b" | "dtc";
  maxResults: number;
}

const STEPS = [
  { title: "Cosa cerchi", subtitle: "Nicchia e parole chiave" },
  { title: "Dove", subtitle: "Area geografica" },
  { title: "Che business", subtitle: "Tipo e piattaforma" },
  { title: "Revisione", subtitle: "Conferma e lancia" },
];

const NICHE_EXAMPLES = [
  "abbigliamento donna",
  "cosmetica naturale",
  "integratori sportivi",
  "arredamento design",
  "prodotti bio",
  "accessori animali",
];

const KEYWORD_EXAMPLES = [
  "scarpe running",
  "skincare coreana",
  "caffè specialty",
  "yoga mat",
];

const CITY_EXAMPLES = [
  "Milano",
  "Roma",
  "Torino",
  "Lombardia",
  "Veneto",
  "Tutta Italia",
];

const MAX_RESULTS_PRESETS = [10, 30, 50, 100];

const BUSINESS_OPTIONS = [
  {
    value: "" as const,
    title: "Tutti i tipi",
    description: "Nessun filtro sul tipo di business",
    icon: Layers,
  },
  {
    value: "ecommerce" as const,
    title: "E-commerce",
    description: "Negozi online con carrello e checkout",
    icon: ShoppingBag,
  },
  {
    value: "local" as const,
    title: "Business locale",
    description: "Attività fisiche, ristoranti, servizi territoriali",
    icon: Store,
  },
  {
    value: "b2b" as const,
    title: "B2B",
    description: "Aziende che vendono ad altre aziende",
    icon: Building2,
  },
  {
    value: "dtc" as const,
    title: "DTC / Brand",
    description: "Brand direct-to-consumer con forte identità",
    icon: Sparkles,
  },
];

const PLATFORM_OPTIONS = [
  {
    value: "any" as const,
    title: "Qualsiasi",
    description: "Nessun filtro sulla piattaforma",
    icon: Globe2,
  },
  {
    value: "shopify" as const,
    title: "Shopify",
    description: "Solo store Shopify",
    icon: ShoppingBag,
  },
  {
    value: "wordpress" as const,
    title: "WordPress",
    description: "Siti WordPress (incluso WooCommerce)",
    icon: Layers,
  },
  {
    value: "both" as const,
    title: "Shopify + WordPress",
    description: "Entrambe le piattaforme insieme",
    icon: Sparkles,
  },
];

function Chip({
  label,
  onClick,
  active,
}: {
  label: string;
  onClick: () => void;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        active
          ? "rounded-full border border-brand-500 bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700"
          : "rounded-full border border-ink-300/60 bg-surface px-3 py-1 text-xs font-medium text-ink-700 transition-colors hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700"
      }
    >
      {label}
    </button>
  );
}

function Hint({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2 rounded-xl bg-tile-yellow-bg/60 px-3 py-2.5 text-xs text-ink-700">
      <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-tile-yellow-icon" />
      <p className="leading-relaxed">{children}</p>
    </div>
  );
}

export default function NewSearchPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>({
    niche: "",
    keyword: "",
    city: "",
    targetPlatform: "any",
    businessType: "",
    maxResults: 30,
  });

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const canAdvance = (() => {
    if (step === 0) return form.niche.trim().length > 0 || form.keyword.trim().length > 0;
    if (step === 3) return form.maxResults >= 5 && form.maxResults <= 100;
    return true;
  })();

  async function handleSubmit() {
    setError(null);
    setLoading(true);
    const body = {
      keyword: form.keyword.trim() || null,
      niche: form.niche.trim() || null,
      city: form.city.trim() || null,
      country: "IT",
      language: "it",
      targetPlatform: form.targetPlatform,
      businessType: form.businessType || null,
      maxResults: form.maxResults,
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

  const platformLabel =
    PLATFORM_OPTIONS.find((p) => p.value === form.targetPlatform)?.title ?? "—";
  const businessLabel =
    BUSINESS_OPTIONS.find((b) => b.value === form.businessType)?.title ?? "—";

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <p className="text-sm text-ink-500">Nuova ricerca</p>
        <h2 className="text-2xl font-bold text-ink-900">
          Configura il tuo job di discovery
        </h2>
      </div>

      <Stepper steps={STEPS} current={step} onGoTo={(i) => setStep(i)} />

      <Card padding="lg">
        {step === 0 && (
          <div className="space-y-6">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                <Search className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-ink-900">Cosa cerchi?</h3>
                <p className="text-sm text-ink-500">
                  Descrivi la nicchia o la categoria. Più sei specifico, migliori saranno i lead.
                </p>
              </div>
            </div>

            <Field
              label="Nicchia / settore"
              hint="Il settore merceologico principale — es. moda, food, wellness."
            >
              <Input
                value={form.niche}
                onChange={(e) => update("niche", e.target.value)}
                placeholder="es. abbigliamento donna"
                autoFocus
              />
            </Field>
            <div className="flex flex-wrap gap-2">
              {NICHE_EXAMPLES.map((ex) => (
                <Chip
                  key={ex}
                  label={ex}
                  active={form.niche === ex}
                  onClick={() => update("niche", ex)}
                />
              ))}
            </div>

            <Field
              label="Keyword aggiuntiva (opzionale)"
              hint="Un termine più specifico che affina i risultati della search engine."
            >
              <Input
                value={form.keyword}
                onChange={(e) => update("keyword", e.target.value)}
                placeholder="es. scarpe running"
              />
            </Field>
            <div className="flex flex-wrap gap-2">
              {KEYWORD_EXAMPLES.map((ex) => (
                <Chip
                  key={ex}
                  label={ex}
                  active={form.keyword === ex}
                  onClick={() => update("keyword", ex)}
                />
              ))}
            </div>

            <Hint>
              Devi inserire <strong>almeno uno</strong> tra nicchia e keyword. Usare entrambi
              genera query più precise (es. &quot;abbigliamento donna&quot; + &quot;scarpe running&quot;).
            </Hint>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-6">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-tile-orange-bg text-tile-orange-icon">
                <MapPin className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-ink-900">In che zona?</h3>
                <p className="text-sm text-ink-500">
                  Limita la ricerca a una città, regione o nazione. Lascia vuoto per tutta Italia.
                </p>
              </div>
            </div>

            <Field
              label="Città o area geografica (opzionale)"
              hint="Una sola località per query. Per coprire più zone, lancia ricerche separate."
            >
              <Input
                value={form.city}
                onChange={(e) => update("city", e.target.value)}
                placeholder="es. Milano"
                autoFocus
              />
            </Field>
            <div className="flex flex-wrap gap-2">
              {CITY_EXAMPLES.map((ex) => (
                <Chip
                  key={ex}
                  label={ex}
                  active={form.city === ex}
                  onClick={() =>
                    update("city", ex === "Tutta Italia" ? "" : ex)
                  }
                />
              ))}
            </div>

            <Hint>
              I business locali (es. ristoranti, estetiste) hanno senso solo con una città precisa.
              Per e-commerce nazionali, conviene lasciare vuoto.
            </Hint>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-tile-green-bg text-tile-green-icon">
                <Briefcase className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-ink-900">Che tipo di business?</h3>
                <p className="text-sm text-ink-500">
                  Scegli la tipologia e su quale piattaforma focalizzare la discovery.
                </p>
              </div>
            </div>

            <div>
              <p className="mb-2 text-sm font-semibold text-ink-900">Tipo di business</p>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {BUSINESS_OPTIONS.map((opt) => (
                  <ChoiceCard
                    key={opt.value || "all"}
                    title={opt.title}
                    description={opt.description}
                    icon={opt.icon}
                    selected={form.businessType === opt.value}
                    onSelect={() => update("businessType", opt.value)}
                  />
                ))}
              </div>
            </div>

            <div>
              <p className="mb-2 text-sm font-semibold text-ink-900">Piattaforma target</p>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {PLATFORM_OPTIONS.map((opt) => (
                  <ChoiceCard
                    key={opt.value}
                    title={opt.title}
                    description={opt.description}
                    icon={opt.icon}
                    selected={form.targetPlatform === opt.value}
                    onSelect={() => update("targetPlatform", opt.value)}
                  />
                ))}
              </div>
            </div>

            <Hint>
              Scegli <strong>Shopify</strong> per brand e-commerce con forte UX,{" "}
              <strong>WordPress</strong> per siti vetrina e blog, <strong>Entrambe</strong> per
              la massima copertura.
            </Hint>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-tile-violet-bg text-tile-violet-icon">
                <Gauge className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-ink-900">Ultimo passo</h3>
                <p className="text-sm text-ink-500">
                  Scegli quanti risultati analizzare e conferma.
                </p>
              </div>
            </div>

            <Field
              label="Numero massimo di risultati"
              hint="Ogni risultato richiede ~3-5 secondi di scan + scoring. 30 è un buon compromesso."
            >
              <Input
                type="number"
                min={5}
                max={100}
                value={form.maxResults}
                onChange={(e) =>
                  update("maxResults", parseInt(e.target.value, 10) || 0)
                }
                className="max-w-[10rem]"
              />
            </Field>
            <div className="flex flex-wrap gap-2">
              {MAX_RESULTS_PRESETS.map((n) => (
                <Chip
                  key={n}
                  label={`${n} risultati`}
                  active={form.maxResults === n}
                  onClick={() => update("maxResults", n)}
                />
              ))}
            </div>

            <div className="rounded-2xl border border-ink-300/40 bg-surface-muted p-4">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-ink-500">
                Riepilogo
              </p>
              <dl className="grid grid-cols-1 gap-y-2 text-sm sm:grid-cols-2">
                <dt className="text-ink-500">Nicchia</dt>
                <dd className="font-medium text-ink-900">{form.niche || "—"}</dd>
                <dt className="text-ink-500">Keyword</dt>
                <dd className="font-medium text-ink-900">{form.keyword || "—"}</dd>
                <dt className="text-ink-500">Area</dt>
                <dd className="font-medium text-ink-900">{form.city || "Tutta Italia"}</dd>
                <dt className="text-ink-500">Tipo business</dt>
                <dd className="font-medium text-ink-900">{businessLabel}</dd>
                <dt className="text-ink-500">Piattaforma</dt>
                <dd className="font-medium text-ink-900">{platformLabel}</dd>
                <dt className="text-ink-500">Max risultati</dt>
                <dd className="font-medium text-ink-900">{form.maxResults}</dd>
              </dl>
            </div>

            {error && (
              <p className="rounded-xl bg-tile-pink-bg px-4 py-2.5 text-sm text-tile-pink-icon">
                {error}
              </p>
            )}
          </div>
        )}

        <div className="mt-8 flex items-center justify-between gap-3 border-t border-ink-300/40 pt-5">
          <Button
            variant="ghost"
            onClick={() => (step === 0 ? router.push("/searches") : setStep(step - 1))}
            iconLeft={<ArrowLeft className="h-4 w-4" />}
            disabled={loading}
          >
            {step === 0 ? "Annulla" : "Indietro"}
          </Button>
          {step < STEPS.length - 1 ? (
            <Button
              onClick={() => setStep(step + 1)}
              disabled={!canAdvance}
              iconRight={<ArrowRight className="h-4 w-4" />}
            >
              Avanti
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={loading || !canAdvance}
              iconLeft={<Rocket className="h-4 w-4" />}
            >
              {loading ? "Avvio ricerca…" : "Lancia ricerca"}
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}
