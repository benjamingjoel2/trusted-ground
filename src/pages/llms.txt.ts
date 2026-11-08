import type { APIRoute } from 'astro';
import { getFeed } from '../lib/feed';
import { site, disclosure, regions, niches } from '../config/site.config';
import { published } from '../lib/content';
import { url, abs } from '../lib/urls';
export const GET: APIRoute = async () => {
  const feed = getFeed();
  const guide = (await published('guide')).sort((a, b) => a.data.order - b.data.order);
  const arts = (await published('articles')).sort((a, b) => a.data.title.localeCompare(b.data.title));
  const qs = (await published('questions')).sort((a, b) => a.data.order - b.data.order);
  const L: string[] = [];
  L.push(`# ${site.name}`, '', `> ${site.positioning}`, '');
  L.push(`${disclosure.footerShort} ${disclosure.listingStatement}`, '');
  if (feed.source === 'mock') L.push(`Note: ${disclosure.mockFeedNotice}`, '');
  L.push(`Coverage (computed from the directory feed): ${feed.countries.length} countries, ${feed.companies.filter((c) => !c.example).length} operators.`, '');
  L.push('## Key pages', '');
  L.push(`- [How verification works](${abs(url.verification())}): what each tier checks, and what it does not mean`);
  L.push(`- [Booking guide](${abs(url.guide())}): how to check a local operator before you pay`);
  L.push(`- [Before-you-pay checklist](${abs(url.checklist())}): printable, every item sourced`);
  L.push(`- [Questions](${abs(url.questions())}): short sourced answers`);
  L.push(`- [Specialties](${abs(url.specialties())}): operators by specialty, grouped by country`);
  L.push(`- [Publisher disclosure](${abs(url.disclosure())})`, '');
  if (arts.length) L.push('## Articles', '', ...arts.map((a) => `- [${a.data.title}](${abs(url.article(a.id))}): ${a.data.description}`), '');
  L.push('## Guide', '', ...guide.map((g) => `- [${g.data.title}](${abs(url.guideChapter(g.id))}): ${g.data.description}`), '');
  L.push('## Questions', '', ...qs.map((q) => `- [${q.data.title}](${abs(url.question(q.id))}): ${q.data.short_answer}`), '');
  L.push('## Specialties', '');
  for (const n of niches) if (feed.niche.get(n.slug)!.size) L.push(`- [${n.name}](${abs(url.niche(n.slug))})`);
  L.push('', '## Country index', '');
  for (const r of regions) {
    const l = feed.countriesByRegion.get(r.slug) ?? [];
    if (!l.length) continue;
    L.push(`### ${r.name}`, '');
    for (const d of l) L.push(`- [${d.name}](${abs(url.country(d.slug))}): ${feed.byCountry.get(d.slug)!.length} operator(s) listed`);
    L.push('');
  }
  L.push(`Contact: ${site.email}`, `Published by ${site.publisher.name}: ${site.publisher.url}`, '');
  return new Response(L.join('\n'), { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
