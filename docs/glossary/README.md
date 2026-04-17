# Glossary

Domain terms used in leadvero.

Add one section per term. Keep definitions short.

## SearchJob

Represents a queued or completed lead discovery run, including search criteria, progress counters, lifecycle status, and timestamps.

Evidence: `prisma/schema.prisma:10-14`, `prisma/schema.prisma:43-66`, `src/app/api/searches/route.ts:34-41`.

## Lead

A discovered company website enriched with CMS, SEO, contact, scoring, and workflow status data.

Evidence: `prisma/schema.prisma:68-119`, `src/server/jobs/runner.ts:94-156`.

## ScanResult

The persisted record of one crawled page for a lead, including page metadata, structured-data detection, and scan notes.

Evidence: `prisma/schema.prisma:121-139`, `src/server/jobs/runner.ts:158-171`.

## OutreachDraft

An AI-generated outreach artifact for a lead, storing the personalized hook, mini audit, offer, message drafts, model, and prompt version.

Evidence: `prisma/schema.prisma:141-154`, `src/server/outreach/generator.ts:67-72`.

## TargetPlatform

The requested CMS target for a search job: `shopify`, `wordpress`, `both`, or `any`.

Evidence: `prisma/schema.prisma:17-22`, `src/app/api/searches/route.ts:11-13`.

## Fit Score

The scoring component that measures how closely a lead matches the requested platform, language, and country.

Evidence: `README.md:100-104`, `src/server/scoring/config.ts:2`, `src/server/jobs/runner.ts:75-81`.

## Opportunity Score

The scoring component that captures missing or weak SEO signals and signs of an outdated site.

Evidence: `README.md:100-104`, `src/server/scoring/config.ts:3`, `src/server/scoring/config.ts:9-18`, `src/server/jobs/runner.ts:82`.

## Commercial Score

The scoring component that estimates whether the scanned site appears to represent an active real business.

Evidence: `README.md:100-104`, `src/server/scoring/config.ts:4`, `src/server/scoring/config.ts:30-36`, `src/server/jobs/runner.ts:83-88`.

## Contactability Score

The scoring component that values reachable contact channels such as public email, contact page, form, phone, and socials.

Evidence: `README.md:100-104`, `src/server/scoring/config.ts:5`, `src/server/scoring/config.ts:22-27`, `src/server/jobs/runner.ts:89`.
