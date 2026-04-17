import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Leadvero",
  description: "Lead discovery and qualification for SEO/WordPress/Shopify",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="it">
      <body>
        <div className="min-h-screen flex flex-col">
          <header className="border-b px-6 py-4">
            <div className="mx-auto max-w-6xl flex items-center gap-6">
              <a href="/" className="font-semibold">
                Leadvero
              </a>
              <nav className="flex gap-4 text-sm text-neutral-600">
                <a href="/">Nuova ricerca</a>
                <a href="/searches">Ricerche</a>
                <a href="/leads">Lead</a>
              </nav>
            </div>
          </header>
          <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-8">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
