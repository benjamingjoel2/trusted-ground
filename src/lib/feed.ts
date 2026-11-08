/**
 * Feed loader. The Tourground directory export is the single source of truth
 * for company facts. Never hand-edit company facts in this repo.
 *
 * Load order: $FEED_PATH, then data/feed.json, then data/feed.mock.json.
 * Everything is computed once per build and memoised, so page generation is
 * O(companies + destinations) however many pages there are.
 */
import fs from 'node:fs';
import path from 'node:path';
import { niches, regions, type TierKey } from '../config/site.config';

export interface Destination {
  slug: string;
  name: string;
  type: string;
  region: string;
  content_dir: string | null;
  booster_url: string | null;
}

export interface Source {
  url: string;
  label: string;
}

export interface Company {
  id: string;
  name: string;
  kind: 'dmc' | 'agency';
  country_base: string;
  base_city?: string | null;
  delivers_in: string[];
  sells_from: string[];
  niches: string[];
  tier: TierKey;
  verified: boolean;
  founder_owned: boolean;
  /** Ignored: Trusted Ground does not rank operators. */
  rank?: Record<string, number>;
  summary: string;
  summary_attribution?: string | null;
  website: string | null;
  profile_url: string | null;
  memberships?: string[];
  sources: Source[];
  checked_by?: string | null;
  last_checked: string;
  example?: boolean;
}

/** One company listed for one country. Lists are alphabetical; there is no ranking. */
export interface ListedEntry {
  company: Company;
}

export interface Feed {
  source: 'live' | 'mock';
  sourceFile: string;
  destinations: Destination[];
  /** Publishable destinations only: at least one listed company. */
  countries: Destination[];
  /** Publishable companies only (verified or founder-owned). */
  companies: Company[];
  excludedCount: number;
  destBySlug: Map<string, Destination>;
  companyById: Map<string, Company>;
  /** Companies listed per destination (from delivers_in), alphabetical. */
  byCountry: Map<string, ListedEntry[]>;
  countriesByRegion: Map<string, Destination[]>;
  /** specialty -> destination slug -> entries (alphabetical). */
  niche: Map<string, Map<string, ListedEntry[]>>;
  latestCheck: string;
}

let memo: Feed | null = null;

const TIERS = new Set(['verified', 'black', 'platinum', 'founder']);

/** The publication rule. Never loosen this. */
export function isPublishable(c: Pick<Company, 'verified' | 'founder_owned'>): boolean {
  return c.verified === true || c.founder_owned === true;
}

function resolveFeedFile(): { file: string; source: 'live' | 'mock' } {
  const root = process.cwd();
  const env = process.env.FEED_PATH;
  if (env) return { file: path.resolve(root, env), source: env.includes('mock') ? 'mock' : 'live' };
  const live = path.join(root, 'data', 'feed.json');
  if (fs.existsSync(live)) return { file: live, source: 'live' };
  return { file: path.join(root, 'data', 'feed.mock.json'), source: 'mock' };
}

function fail(msg: string): never {
  throw new Error(`[feed] ${msg}`);
}

export function getFeed(): Feed {
  if (memo) return memo;
  const { file, source } = resolveFeedFile();
  const raw = JSON.parse(fs.readFileSync(file, 'utf8'));
  const declared = raw?._meta?.source;
  const feedSource: 'live' | 'mock' = declared === 'mock' ? 'mock' : source;

  const regionSlugs = new Set(regions.map((r) => r.slug));
  const nicheSlugs = new Set(niches.map((n) => n.slug));

  const destinations: Destination[] = raw.destinations ?? fail('missing destinations[]');
  const destBySlug = new Map<string, Destination>();
  for (const d of destinations) {
    if (!d.slug || !d.name) fail(`destination without slug/name: ${JSON.stringify(d)}`);
    if (!regionSlugs.has(d.region)) fail(`destination ${d.slug}: unknown region "${d.region}"`);
    if (destBySlug.has(d.slug)) fail(`duplicate destination ${d.slug}`);
    destBySlug.set(d.slug, d);
  }

  const all: Company[] = raw.companies ?? fail('missing companies[]');
  const companies: Company[] = [];
  const companyById = new Map<string, Company>();
  let excludedCount = 0;
  for (const c of all) {
    if (!isPublishable(c)) {
      excludedCount++;
      continue;
    }
    if (!c.id || !/^[a-z0-9-]+$/.test(c.id)) fail(`company id must be a lowercase slug: ${c.id}`);
    if (companyById.has(c.id)) fail(`duplicate company id ${c.id}`);
    if (!TIERS.has(c.tier)) fail(`company ${c.id}: unknown tier ${c.tier}`);
    if (!Array.isArray(c.sources) || c.sources.length === 0) fail(`company ${c.id}: no sources`);
    if (!c.last_checked) fail(`company ${c.id}: no last_checked`);
    c.niches = (c.niches ?? []).filter((n) => nicheSlugs.has(n));
    c.memberships = c.memberships ?? [];
    c.sells_from = c.sells_from ?? [];
    companies.push(c);
    companyById.set(c.id, c);
  }
  companies.sort((a, b) => a.name.localeCompare(b.name, 'en'));

  // Listed per country: every country the company delivers in (or its base if none given).
  // Companies are already sorted by name, so each list is alphabetical.
  const byCountry = new Map<string, ListedEntry[]>();
  for (const c of companies) {
    const where = c.delivers_in?.length ? c.delivers_in : [c.country_base];
    for (const slug of new Set(where)) {
      if (!destBySlug.has(slug)) continue;
      let list = byCountry.get(slug);
      if (!list) byCountry.set(slug, (list = []));
      list.push({ company: c });
    }
  }

  const countries = destinations
    .filter((d) => (byCountry.get(d.slug)?.length ?? 0) > 0)
    .sort((a, b) => a.name.localeCompare(b.name, 'en'));

  const countriesByRegion = new Map<string, Destination[]>();
  for (const r of regions) countriesByRegion.set(r.slug, []);
  for (const d of countries) countriesByRegion.get(d.region)!.push(d);

  const niche = new Map<string, Map<string, ListedEntry[]>>();
  for (const n of niches) niche.set(n.slug, new Map());
  for (const d of countries) {
    for (const e of byCountry.get(d.slug)!) {
      for (const n of e.company.niches) {
        const m = niche.get(n)!;
        let l = m.get(d.slug);
        if (!l) m.set(d.slug, (l = []));
        l.push(e);
      }
    }
  }

  const latestCheck = companies.reduce((m, c) => (c.last_checked > m ? c.last_checked : m), '0000-00-00');

  memo = {
    source: feedSource,
    sourceFile: path.relative(process.cwd(), file),
    destinations,
    countries,
    companies,
    excludedCount,
    destBySlug,
    companyById,
    byCountry,
    countriesByRegion,
    niche,
    latestCheck,
  };
  return memo;
}

export function destName(slug: string): string {
  return getFeed().destBySlug.get(slug)?.name ?? slug.replace(/-/g, ' ').replace(/\b\w/g, (m) => m.toUpperCase());
}

/** A country page exists only for publishable destinations. */
export function hasCountryPage(slug: string): boolean {
  return (getFeed().byCountry.get(slug)?.length ?? 0) > 0;
}
