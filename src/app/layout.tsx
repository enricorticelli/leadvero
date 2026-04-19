import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopBar } from "@/components/layout/TopBar";
import { MobileNav } from "@/components/layout/MobileNav";
import { ConfirmProvider } from "@/components/ui/ConfirmProvider";

const sans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

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
    <html lang="it" className={sans.variable}>
      <body className="font-sans">
        <ConfirmProvider>
          <Sidebar />
          <div className="flex min-h-screen min-w-0 flex-col md:pl-64">
            <TopBar />
            <main className="flex-1 px-4 pb-24 pt-6 md:px-8 md:pb-10">
              {children}
            </main>
          </div>
          <MobileNav />
        </ConfirmProvider>
      </body>
    </html>
  );
}
