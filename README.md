# Leadvero

Leadvero is a lead discovery and qualification tool for freelancers and small agencies that sell SEO, WordPress, and Shopify services.

Instead of building a giant list of random companies, Leadvero focuses on finding businesses that are actually worth contacting. It discovers public websites, scans lightweight on-page and technical signals, scores each lead, and generates outreach angles you can use for email or LinkedIn.

## Why this exists

Finding new clients manually is slow.

A typical workflow looks like this:
- search Google or directories
- open each site one by one
- check whether it uses WordPress or Shopify
- look for SEO or UX issues
- decide whether the company is a fit
- write a custom outreach message

Prospect Finder compresses that workflow into a repeatable system.

## What it does

Prospect Finder helps you:

- discover potential clients from public web sources
- detect whether a site uses WordPress, Shopify, or another stack
- identify basic SEO, content, and site quality gaps
- score leads based on fit and opportunity
- surface public contact information when available
- generate a short outreach hook and suggested offer

## Ideal users

- SEO freelancers
- WordPress developers
- Shopify developers
- CRO / tracking / performance consultants
- small web agencies doing outbound prospecting

## Core use cases

### 1. Find Shopify stores with weak SEO
Search by niche, country, and language, then identify stores with issues like poor collection page optimization, weak metadata, or missing content structure.

### 2. Find WordPress sites that need redesign or optimization
Search local businesses or niche businesses and detect signals such as outdated design, weak SEO setup, missing tracking, or poor technical quality.

### 3. Generate personalized outreach
For each lead, get:
- a reason to contact them
- a suggested service angle
- a first-draft email or LinkedIn message

## Product principles

Prospect Finder is designed around a few rules:

- quality over quantity
- public data over private data
- lightweight scans over aggressive crawling
- lead qualification over mass scraping
- human review before outreach

This is not meant to be a spam engine or a giant scraped database.

## MVP scope

The MVP includes:

- search input by niche / keyword / geography
- discovery of public company domains
- lightweight site scan
- WordPress / Shopify detection
- basic SEO and technical signal extraction
- lead scoring
- lead list dashboard
- lead detail view
- CSV export
- AI-assisted outreach draft generation

The MVP does not include:

- automatic mass email sending
- full CRM replacement
- deep crawling of entire websites
- scraping private or gated platforms
- enrichment from expensive third-party providers

## How it works

### Step 1: Discovery
The user enters search criteria such as:
- niche
- keyword
- country
- city
- language
- target platform (WordPress / Shopify / both)

The system gathers candidate domains from public sources.

### Step 2: Site scan
Each domain is scanned lightly across relevant public pages such as:
- homepage
- contact page
- about page
- blog index
- category / collection pages for ecommerce
- a small number of product or service pages

### Step 3: Signal extraction
The tool extracts signals such as:
- CMS / ecommerce platform
- title tag
- meta description
- H1 presence
- sitemap and robots presence
- schema detection
- blog presence
- analytics / tag manager presence
- contact page / form / public email
- basic site quality and opportunity signals

### Step 4: Scoring
Each lead receives a score from 0 to 100 based on:
- fit
- opportunity
- commercial potential
- contactability

### Step 5: Outreach assistance
The tool generates:
- a short personalized hook
- a mini audit summary
- a suggested offer
- a draft outreach message

## Example lead output

```json
{
  "company_name": "Example Store",
  "domain": "examplestore.com",
  "cms": "Shopify",
  "country": "Italy",
  "has_blog": false,
  "public_email": "info@examplestore.com",
  "fit_score": 28,
  "opportunity_score": 31,
  "commercial_score": 16,
  "contactability_score": 12,
  "total_score": 87,
  "opportunity_notes": [
    "Collection pages appear weakly optimized",
    "No visible blog/content layer",
    "Missing or weak metadata on key pages"
  ],
  "outreach_hook": "I noticed your store has strong products, but category pages may not be capturing organic search demand well.",
  "suggested_offer": "Shopify SEO audit + collection page optimization + internal linking improvements"
}