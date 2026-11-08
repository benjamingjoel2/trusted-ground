# Trusted Ground

**trustedground.tourground.com**: the plain-English reference for finding a trustworthy local operator anywhere in the world: how to check one, what verification means, and the verified operators in each country, ranked on merit. Published by Tourground.

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
| Guide chapters | `src/content/guide/*.md` |
| Country snapshots | `src/content/countries/<slug>.md` |
| Q&A | `src/content/questions/*.md` |
| About, Disclosure, Corrections, legal pages, checklist, comparison tables | `src/content/pages/*.md` |
| Layout and components | `src/layouts/`, `src/components/` |
| JSON-LD builders | `src/lib/schema.ts` |
| Sitemaps, robots.txt, llms.txt | `src/pages/sitemap*.ts`, `src/pages/robots.txt.ts`, `src/pages/llms.txt.ts` |

## Add or update reviewed content

Every guide chapter, country snapshot, answer and reference page is a markdown file with this front matter:

```yaml
---
title: What is a DMC?
description: One sentence, under 200 characters.
published: 2026-11-08
reviewed: 2026-11-08
status: draft            # draft | reviewed
sources:
  - url: https://example.org/official-page
    label: "Publisher: page title"
---
```

Rules, enforced by `src/content.config.ts` and `src/lib/content.ts`:

- **Only `status: reviewed` is published.** Drafts stay in the repo and never reach the site.
- **A reviewed file must list at least one source**, or the build fails. Never publish text without sources.
- `reviewed` cannot be earlier than `published`.
- When you re-check a page, update `reviewed`. That date is shown on the page and used in the sitemap and in `dateModified`.

Extra fields:

- Guide: `order`, `short_title`.
- Q&A: `order`, `short_answer` (shown first, and used in FAQPage JSON-LD).
- Country snapshot (`src/content/countries/<slug>.md`, matched by the last part of the destination's `content_dir`): optional `best_months`, `main_regions` (list), `entry_basics`. Leave a field out if you have no source for it. Pages stay short rather than padded.
- Checklist (`src/content/pages/checklist.md`): `items`, each with `text`, optional `detail`, a `source` and an optional `guide` chapter id.

No invented facts: no made-up statistics, reviews, quotes or counts. Counts of companies or countries are only ever computed from the feed.

## Refresh the feed

Company facts come only from the Tourground directory export. Never hand-edit them here.

The build looks for the feed in this order:

1. `FEED_PATH` (a local file path), if set;
2. `data/feed.json` (git-ignored);
3. `data/feed.mock.json`.

To build from the live export, set `FEED_URL` (and `FEED_TOKEN` if the export needs a bearer token) in the Vercel project's environment variables. `scripts/fetch-feed.mjs` downloads it to `data/feed.json` at the start of every build. Then trigger a redeploy (or a Vercel Deploy Hook from the directory when it changes).

What happens on each build:

- Only companies with `verified: true` **or** `founder_owned: true` are published. Anything else, including prospects, is dropped and the validator fails the build if it leaks.
- **A company removed from the feed, or no longer verified, loses its page in the next build.** Static output means there is nothing left to serve; the 404 page explains that listings are removed after directory updates.
- Destinations with no publishable company get no page.
- There is no ranking. Operators are listed alphabetically on every page, and the feed's `rank` field is ignored. Specialty lists are grouped by country.
- If `_meta.source` is `"mock"`, every list shows the preview-data notice.

## Rules built into the templates

- Every page footer: "Published by Tourground." linking to tourground.com.
- Founder-owned brands are labelled "Founder-owned (Tourground Geotrax)", decided by the feed's `founder_owned` flag, never a hard-coded list.
- Platinum companies may link to their own site with `rel="sponsored nofollow"`; all others link only to their Tourground profile.
- Paid placement: `src/components/AdSlot.astro` is the only place a paid item can render. It is labelled "Advertisement feature", sits above any list of operators and is visually separate. Paid placement is not built yet, so the slot renders nothing unless `site.showEmptyAdSlot` is `true`; a specimen is shown on `/disclosure/`.
- Every company page opens with the verification card and has a "Request a correction or removal" link (`links.correctionUrl`, placeholder for now).
- No phone numbers, WhatsApp, team section, social links, testimonials or reviews.

## Performance

Static HTML, CSS inlined, no client JavaScript except the deferred Vercel Web Analytics script and a one-line print button. Fonts are self-hosted (Source Serif 4 600, IBM Plex Sans 400 and 600, Latin subsets preloaded) with `font-display: swap` and metric-matched fallbacks to keep CLS at zero. There are no images in page content; if photographs are added later, use only owned, Unsplash or Wikimedia Commons images, record credits, set `width` and `height`, and lazy-load anything below the fold. The validator rejects an `<img>` without dimensions.

Measured locally with Lighthouse 12 (mobile): performance 100, accessibility 100, SEO 100, CLS 0 on the home, country, company, niche, Q&A and checklist pages. A synthetic feed of 150 countries and 4,500 companies builds 4,246 pages in about 8 seconds.

## Deploy

Vercel project `trusted-ground` in the team "Benjamin - Sevo", connected to this GitHub repository. Pushes to `main` deploy to production at https://trustedground.tourground.com. Settings come from `vercel.json` (build command, `dist` output, clean URLs, trailing slashes). Turn on Web Analytics in the Vercel project (Analytics tab) for the analytics script to record visits.
