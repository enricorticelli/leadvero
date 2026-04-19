import { prisma } from "../src/server/db/prisma";
import bcrypt from "bcryptjs";

const FIXTURES = [
  {
    domain: "moda-firenze.it",
    normalizedDomain: "moda-firenze.it",
    companyName: "Moda Firenze",
    cms: "shopify",
    ecommercePlatform: "shopify",
    niche: "abbigliamento donna",
    country: "IT",
    city: "Firenze",
    language: "it",
    hasBlog: false,
    hasContactPage: true,
    publicEmail: "info@moda-firenze.it",
    analyticsPresent: false,
    tagManagerPresent: false,
    fitScore: 85,
    opportunityScore: 72,
    commercialScore: 55,
    contactabilityScore: 80,
    totalScore: 74,
    scoreReasons: [
      "Shopify rilevato — target perfetto",
      "Meta description assente",
      "Analytics non rilevato",
    ],
  },
  {
    domain: "autofficina-romano.it",
    normalizedDomain: "autofficina-romano.it",
    companyName: "Autofficina Romano",
    cms: "wordpress",
    ecommercePlatform: null,
    niche: "autofficina",
    country: "IT",
    city: "Milano",
    language: "it",
    hasBlog: false,
    hasContactPage: true,
    publicEmail: "romano.auto@libero.it",
    analyticsPresent: false,
    tagManagerPresent: false,
    fitScore: 70,
    opportunityScore: 80,
    commercialScore: 40,
    contactabilityScore: 75,
    totalScore: 68,
    scoreReasons: [
      "WordPress rilevato — target perfetto",
      "Sito probabilmente datato",
      "Nessun blog/content",
    ],
  },
  {
    domain: "ristorante-laguna.it",
    normalizedDomain: "ristorante-laguna.it",
    companyName: "Ristorante La Laguna",
    cms: null,
    ecommercePlatform: null,
    niche: "ristorazione",
    country: "IT",
    city: "Venezia",
    language: "it",
    hasBlog: false,
    hasContactPage: true,
    publicEmail: "info@laguna-venezia.it",
    analyticsPresent: false,
    tagManagerPresent: false,
    fitScore: 20,
    opportunityScore: 85,
    commercialScore: 30,
    contactabilityScore: 60,
    totalScore: 52,
    scoreReasons: [
      "Nessun markup schema",
      "Meta description assente",
      "Nessun blog/content",
    ],
  },
];

async function seedAdminUser() {
  const existing = await prisma.user.findUnique({ where: { username: "admin" } });
  if (existing) {
    console.log("Admin user already exists — skipping.");
    return;
  }
  const passwordHash = await bcrypt.hash("admin", 10);
  await prisma.user.create({
    data: {
      username: "admin",
      passwordHash,
      role: "admin",
      mustChangePassword: true,
    },
  });
  console.log("Created default admin user (admin / admin). Change at first login.");
}

async function main() {
  await seedAdminUser();

  const job = await prisma.searchJob.create({
    data: {
      keyword: null,
      niche: "test-seed",
      country: "IT",
      city: null,
      language: "it",
      targetPlatform: "any",
      maxResults: FIXTURES.length,
      status: "done",
      discoveredCount: FIXTURES.length,
      scannedCount: FIXTURES.length,
      scoredCount: FIXTURES.length,
      startedAt: new Date(),
      finishedAt: new Date(),
    },
  });

  for (const f of FIXTURES) {
    await prisma.lead.upsert({
      where: { normalizedDomain: f.normalizedDomain },
      update: {},
      create: {
        searchJobId: job.id,
        sourceType: "seed",
        ...f,
        socialLinks: JSON.stringify({}),
        seoSignals: JSON.stringify({}),
        siteQualityNotes: JSON.stringify({ likelySiteDated: f.scoreReasons.some((r) => r.includes("datato")) }),
        scoreReasons: JSON.stringify(f.scoreReasons),
        lastScannedAt: new Date(),
      },
    });
  }

  console.log(`Seeded ${FIXTURES.length} leads`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
