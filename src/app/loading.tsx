import { Loader2 } from "lucide-react";
import { Card } from "@/components/ui/Card";

export default function GlobalLoading() {
  return (
    <div className="flex min-h-[55vh] items-center justify-center px-4">
      <Card className="w-full max-w-md text-center" padding="lg">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
        <p className="text-base font-semibold text-ink-900">Caricamento in corso</p>
        <p className="mt-1 text-sm text-ink-500">
          Stiamo preparando la schermata successiva.
        </p>
      </Card>
    </div>
  );
}
