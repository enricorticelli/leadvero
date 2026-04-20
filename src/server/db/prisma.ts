import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL ?? "file:./leadvero.db",
});

function tryJson(v: string | null | undefined): unknown {
  if (v == null) return null;
  try { return JSON.parse(v); } catch { return null; }
}

function makePrisma() {
  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  }).$extends({
    result: {
      searchJob: {
        filters: { needs: { filters: true }, compute: (d) => tryJson(d.filters) },
      },
      lead: {
        socialLinks:      { needs: { socialLinks: true },      compute: (d) => tryJson(d.socialLinks) },
        seoSignals:       { needs: { seoSignals: true },       compute: (d) => tryJson(d.seoSignals) },
        siteQualityNotes: { needs: { siteQualityNotes: true }, compute: (d) => tryJson(d.siteQualityNotes) },
        scoreReasons:     { needs: { scoreReasons: true },     compute: (d) => tryJson(d.scoreReasons) },
      },
      leadAnalysisRun: {
        summary: { needs: { summary: true }, compute: (d) => tryJson(d.summary) },
      },
      leadAnalysisPage: {
        issues: { needs: { issues: true }, compute: (d) => tryJson(d.issues) },
        notes:  { needs: { notes: true },  compute: (d) => tryJson(d.notes) },
      },
      scanResult: {
        structuredData: { needs: { structuredData: true }, compute: (d) => tryJson(d.structuredData) },
        notes:          { needs: { notes: true },          compute: (d) => tryJson(d.notes) },
      },
    },
  });
}

type ExtendedPrisma = ReturnType<typeof makePrisma>;

const globalForPrisma = globalThis as unknown as {
  __leadveroPrisma?: ExtendedPrisma;
};

export const prisma: ExtendedPrisma =
  globalForPrisma.__leadveroPrisma ?? makePrisma();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.__leadveroPrisma = prisma;
}
