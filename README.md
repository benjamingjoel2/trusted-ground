# Trusted Ground

**trustedground.tourground.com**: practical, sourced travel stories and destination guides, published by Tourground.

A static site built with [Astro](https://astro.build). No client-side framework, no tracking beyond Vercel Web Analytics, no cookies.

## Run it

Requires Node 22.23.4 or later.

```bash
npm ci
npm run dev        # http://localhost:4321
npm run build      # fetch feed (optional) -> check feed -> build -> validate
npm run preview    # serve dist/
```

`npm run build` fails if any rule in the brief is broken. `scripts/validate-build.mjs` checks every page for: one `<h1>`, canonical and Open Graph tags, the "Published by Tourground." footer link, valid JSON-LD with the required properties, published / last-reviewed dates and sources, no phone numbers or WhatsApp links, no email address other than trustedground@tourground.com, `width`/`height` on every image, and that no unverified company appears anywhere. It also checks that every sitemap URL has a page and that robots.txt allows GPTBot, ClaudeBot, PerplexityBot and Google-Extended.

## Where things live

| What | File |
| --- | --- |
| Name, domain, email, editor line, colours, address, links, **all disclosure and paid-label wording**, verification tiers, regions, niches | `src/config/site.config.ts` |
| UI strings (for future FR/DE/ES) | `src/i18n/en.ts` |
| Directory feed loader and publication rule | `src/lib/feed.ts` |
| Mock feed | `data/feed.mock.json` (generator: `scripts/mock/build-mock-feed.py`) |
| Feed field reference | `DATA-FIELDS.md` |
| Facts that need human sign-off | `FACTS-TO-VERIFY.md` |
| Country snapshots | `src/content/countries/<slug>.md` |
| Q&A | `src/content/questions/*.md` |
| About, Disclosure, Corrections, legal pages, checklist, comparison tables | `src/content/pages/*.md` |
| Layout and components | `src/layouts/`, `src/components/` |
| JSON-LD builders | `src/lib/schema.ts` |
| Sitemaps, robots.txt, llms.txt | `src/pages/sitemap*.ts`, `src/pages/robots.txt.ts`, `src/pages/llms.txt.ts` |

## Publish a new article

Articles are markdown files in `src/content/articles/`. One file per article; the file name is the URL (`src/content/articles/gorilla-trekking-permits.md` → `/articles/gorilla-trekking-permits/`).

```yaml
---
title: "Gorilla trekking permits in Rwanda and Uganda"
description: "One sentence for listings and search results, under 200 characters."
category: "Permits and rules"     # groups articles on /articles/ and the home page
hero: rwanda                       # destination slug: its photo is used as the hero
countries: [rwanda, uganda]        # links the article to these destination guides
published: 2026-11-08
reviewed: 2026-11-08
status: reviewed                   # draft | reviewed — only reviewed is published
sources:
  - url: https://example.gov/official-page
    label: "Publisher: page title"
---

Opening paragraph...

## First section
```

Then commit and push to `main`; Vercel publishes it in about a minute. The newest article becomes the home page's featured story.

Rules, enforced by the build:

- **Only `status: reviewed` is published**, and a reviewed file must list at least one source.
- `reviewed` cannot be earlier than `published`. Update `reviewed` whenever you re-check a page.
- No invented facts, statistics, quotes or prices. If you cannot source it, leave it out.
- No ranking: the build fails on words like "ranked" or "best operators".
- Photos: `hero` must be a destination slug with a photo in `data/images.json` (all 101 countries have one). To add or replace a photo, see `scripts/images/fetch-openverse.py`.

## Other content

| What | Where |
| --- | --- |
| Destination guides (one per country) | `src/content/countries/<slug>.md` (fields: `best_months`, `main_regions`, `entry_basics`) |
| Questions | `src/content/questions/*.md` (`order`, `short_answer`) |
| About, disclosure, legal pages, checklist, comparison tables | `src/content/pages/*.md` |

The list of destinations comes from `data/feed.mock.json` (`destinations[]`). To add a country, add it there, add its guide in `src/content/countries/`, and fetch a photo.

## Deploy

Vercel project `trusted-ground` in the team "Benjamin - Sevo", connected to this GitHub repository. Pushes to `main` deploy to production at https://trustedground.tourground.com. Settings come from `vercel.json` (build command, `dist` output, clean URLs, trailing slashes). Turn on Web Analytics in the Vercel project (Analytics tab) for the analytics script to record visits.
