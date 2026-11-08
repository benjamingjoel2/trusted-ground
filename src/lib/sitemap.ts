import { getFeed } from './feed';
import { published, iso } from './content';
import { niches, regions, site } from '../config/site.config';
import { url, abs } from './urls';

export type Entry = { loc: string; lastmod: string };
export const SECTIONS = ['pages', 'articles', 'countries', 'questions'] as const;
export type Section = (typeof SECTIONS)[number];

export async function sectionEntries(section: Section): Promise<Entry[]> {
  const feed = getFeed();
  const L = site.launch.published;
  const max = (a: string, b: string) => (a > b ? a : b);
  const e = (p: string, d: string): Entry => ({ loc: abs(p), lastmod: d });
  switch (section) {
    case 'pages': {
      const pages = (await published('pages')).map((p) => e(`/${p.id}/`, iso(p.data.reviewed)));
      return [e('/', L), e('/credits/', L), e(url.compare(), L), e(url.checklist(), L), ...pages];
    }
    case 'countries': {
      const out = [e(url.countries(), L), e(url.regions(), L)];
      for (const r of regions) out.push(e(url.region(r.slug), L));
      const snaps = new Map((await published('countries')).map((s) => [s.id, iso(s.data.reviewed)]));
      for (const d of feed.countries) out.push(e(url.country(d.slug), snaps.get(d.slug) ?? L));
      return out;
    }
    case 'articles': {
      const a = await published('articles');
      return [e(url.articles(), a.reduce((m, x) => max(m, iso(x.data.reviewed)), L)), ...a.map((x) => e(url.article(x.id), iso(x.data.reviewed)))];
    }
    case 'questions': {
      const q = await published('questions');
      return [e(url.questions(), q.reduce((m, x) => max(m, iso(x.data.reviewed)), L)), ...q.map((x) => e(url.question(x.id), iso(x.data.reviewed)))];
    }
  }
}

export const xml = (body: string) =>
  new Response(`<?xml version="1.0" encoding="UTF-8"?>\n${body}`, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
