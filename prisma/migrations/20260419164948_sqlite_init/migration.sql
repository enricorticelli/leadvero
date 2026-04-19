-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "username" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'user',
    "mustChangePassword" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "lastLoginAt" DATETIME
);

-- CreateTable
CREATE TABLE "SearchJob" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "keyword" TEXT,
    "niche" TEXT,
    "country" TEXT NOT NULL,
    "city" TEXT,
    "language" TEXT NOT NULL,
    "targetPlatform" TEXT NOT NULL DEFAULT 'any',
    "businessType" TEXT,
    "maxResults" INTEGER NOT NULL DEFAULT 30,
    "filters" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "errorMessage" TEXT,
    "discoveredCount" INTEGER NOT NULL DEFAULT 0,
    "scannedCount" INTEGER NOT NULL DEFAULT 0,
    "scoredCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "startedAt" DATETIME,
    "finishedAt" DATETIME
);

-- CreateTable
CREATE TABLE "Lead" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "searchJobId" TEXT NOT NULL,
    "companyName" TEXT,
    "domain" TEXT NOT NULL,
    "normalizedDomain" TEXT NOT NULL,
    "sourceUrl" TEXT,
    "sourceType" TEXT,
    "country" TEXT,
    "city" TEXT,
    "language" TEXT,
    "niche" TEXT,
    "businessType" TEXT,
    "cms" TEXT,
    "ecommercePlatform" TEXT,
    "hasBlog" BOOLEAN NOT NULL DEFAULT false,
    "hasContactPage" BOOLEAN NOT NULL DEFAULT false,
    "publicEmail" TEXT,
    "publicPhone" TEXT,
    "hasForm" BOOLEAN NOT NULL DEFAULT false,
    "socialLinks" TEXT,
    "seoSignals" TEXT,
    "analyticsPresent" BOOLEAN NOT NULL DEFAULT false,
    "tagManagerPresent" BOOLEAN NOT NULL DEFAULT false,
    "performanceEstimate" INTEGER,
    "siteQualityNotes" TEXT,
    "fitScore" INTEGER NOT NULL DEFAULT 0,
    "opportunityScore" INTEGER NOT NULL DEFAULT 0,
    "commercialScore" INTEGER NOT NULL DEFAULT 0,
    "contactabilityScore" INTEGER NOT NULL DEFAULT 0,
    "totalScore" INTEGER NOT NULL DEFAULT 0,
    "scoreReasons" TEXT,
    "status" TEXT NOT NULL DEFAULT 'new',
    "userNotes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "lastScannedAt" DATETIME,
    CONSTRAINT "Lead_searchJobId_fkey" FOREIGN KEY ("searchJobId") REFERENCES "SearchJob" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "LeadAnalysisRun" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "leadId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "preset" TEXT NOT NULL,
    "maxPages" INTEGER NOT NULL,
    "runTimeoutMs" INTEGER NOT NULL,
    "includeBlogAndProductPaths" BOOLEAN NOT NULL DEFAULT true,
    "discoveredCount" INTEGER NOT NULL DEFAULT 0,
    "scannedCount" INTEGER NOT NULL DEFAULT 0,
    "summary" TEXT,
    "errorMessage" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "startedAt" DATETIME,
    "finishedAt" DATETIME,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "LeadAnalysisRun_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "LeadAnalysisPage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "runId" TEXT NOT NULL,
    "scannedUrl" TEXT NOT NULL,
    "pageType" TEXT NOT NULL DEFAULT 'other',
    "httpStatus" INTEGER,
    "title" TEXT,
    "metaDescription" TEXT,
    "h1" TEXT,
    "canonical" TEXT,
    "robotsMeta" TEXT,
    "schemaPresent" BOOLEAN NOT NULL DEFAULT false,
    "indexable" BOOLEAN NOT NULL DEFAULT true,
    "titleQuality" TEXT,
    "issues" TEXT,
    "notes" TEXT,
    "scannedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "LeadAnalysisPage_runId_fkey" FOREIGN KEY ("runId") REFERENCES "LeadAnalysisRun" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ScanResult" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "leadId" TEXT NOT NULL,
    "scannedUrl" TEXT NOT NULL,
    "pageType" TEXT NOT NULL DEFAULT 'other',
    "httpStatus" INTEGER,
    "title" TEXT,
    "metaDescription" TEXT,
    "h1" TEXT,
    "canonical" TEXT,
    "robotsMeta" TEXT,
    "structuredData" TEXT,
    "notes" TEXT,
    "scannedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ScanResult_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE INDEX "SearchJob_status_createdAt_idx" ON "SearchJob"("status", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Lead_normalizedDomain_key" ON "Lead"("normalizedDomain");

-- CreateIndex
CREATE INDEX "Lead_searchJobId_idx" ON "Lead"("searchJobId");

-- CreateIndex
CREATE INDEX "Lead_totalScore_idx" ON "Lead"("totalScore");

-- CreateIndex
CREATE INDEX "Lead_status_idx" ON "Lead"("status");

-- CreateIndex
CREATE INDEX "LeadAnalysisRun_leadId_createdAt_idx" ON "LeadAnalysisRun"("leadId", "createdAt");

-- CreateIndex
CREATE INDEX "LeadAnalysisRun_status_createdAt_idx" ON "LeadAnalysisRun"("status", "createdAt");

-- CreateIndex
CREATE INDEX "LeadAnalysisPage_runId_scannedAt_idx" ON "LeadAnalysisPage"("runId", "scannedAt");

-- CreateIndex
CREATE INDEX "ScanResult_leadId_idx" ON "ScanResult"("leadId");
