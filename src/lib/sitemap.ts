import { getFeed } from './feed';
import { published, iso } from './content';
import { niches, regions, site } from '../config/site.config';
import { url, abs } from './urls';

export type Entry = { loc: string; lastmod: string };
export const SECTIONS = ['pages', 'articles', 'countries', 'operators', 'specialties', 'guide', 'questions'] as const;
export type Section = (typeof SECTIONS)[number];

export async function sectionEntries(section: Section): Promise<Entry[]> {
  const feed = getFeed();
  const L = site.launch.published;
  const max = (a: string, b: string) => (a > b ? a : b);
  const e = (p: string, d: string): Entry => ({ loc: abs(p), lastmod: d });
  switch (section) {
    case 'pages': {
      const pages = (await published('pages')).map((p) => e(`/${p.id}/`, iso(p.data.reviewed)));
      return [e('/', feed.latestCheck), e(url.verification(), L), e(url.operators(), feed.latestCheck), e('/credits/', L), ...pages];
    }
    case 'countries': {
      const out = [e(url.countries(), feed.latestCheck), e(url.regions(), feed.latestCheck)];
      for (const r of regions) out.push(e(url.region(r.slug), feed.latestCheck));
      const snaps = new Map((await published('countries')).map((s) => [s.id, iso(s.data.reviewed)]));
      for (const d of feed.countries) {
        const checked = feed.byCountry.get(d.slug)!.reduce((m, x) => max(m, x.company.last_checked), L);
        out.push(e(url.country(d.slug), max(checked, snaps.get(d.slug) ?? L)));
      }
      return out;
    }
    case 'operators':
      return feed.companies.filter((c) => !c.example).map((c) => e(url.operator(c.id), max(c.last_checked, L)));
    case 'specialties':
      return [e(url.specialties(), feed.latestCheck), ...niches.filter((n) => feed.niche.get(n.slug)!.size > 0).map((n) => e(url.niche(n.slug), feed.latestCheck))];
    case 'articles': {
      const a = await published('articles');
      return [e(url.articles(), a.reduce((m, x) => max(m, iso(x.data.reviewed)), L)), ...a.map((x) => e(url.article(x.id), iso(x.data.reviewed)))];
    }
    case 'guide': {
      const g = await published('guide');
      return [e(url.guide(), g.reduce((m, x) => max(m, iso(x.data.reviewed)), L)), e(url.checklist(), L), ...g.map((x) => e(url.guideChapter(x.id), iso(x.data.reviewed)))];
    }
    case 'questions': {
      const q = await published('questions');
      return [e(url.questions(), q.reduce((m, x) => max(m, iso(x.data.reviewed)), L)), ...q.map((x) => e(url.question(x.id), iso(x.data.reviewed)))];
    }
  }
}

export const xml = (body: string) =>
  new Response(`<?xml version="1.0" encoding="UTF-8"?>\n${body}`, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
