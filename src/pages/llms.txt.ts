import type { APIRoute } from 'astro';
import { getFeed } from '../lib/feed';
import { site, disclosure, regions, niches } from '../config/site.config';
import { published } from '../lib/content';
import { url, abs } from '../lib/urls';
export const GET: APIRoute = async () => {
  const feed = getFeed();
  const guide = (await published('guide')).sort((a, b) => a.data.order - b.data.order);
  const qs = (await published('questions')).sort((a, b) => a.data.order - b.data.order);
  const L: string[] = [];
  L.push(`# ${site.name}`, '', `> ${site.positioning}`, '');
  L.push(`${disclosure.footerShort} ${disclosure.rankingStatement}`, '');
  if (feed.source === 'mock') L.push(`Note: ${disclosure.mockFeedNotice}`, '');
  L.push(`Coverage (computed from the directory feed): ${feed.countries.length} countries, ${feed.companies.filter((c) => !c.example).length} operators.`, '');
  L.push('## Key pages', '');
  L.push(`- [How verification works](${abs(url.verification())}): what each tier checks, and what it does not mean`);
  L.push(`- [How we rank](${abs(url.howWeRank())}): rank comes only from the directory feed, never from payment`);
  L.push(`- [Booking guide](${abs(url.guide())}): how to check a local operator before you pay`);
  L.push(`- [Before-you-pay checklist](${abs(url.checklist())}): printable, every item sourced`);
  L.push(`- [Questions](${abs(url.questions())}): short sourced answers`);
  L.push(`- [Ranked lists](${abs(url.best())}): best operators per country and by niche`);
  L.push(`- [Publisher disclosure](${abs(url.disclosure())})`, '');
  L.push('## Guide', '', ...guide.map((g) => `- [${g.data.title}](${abs(url.guideChapter(g.id))}): ${g.data.description}`), '');
  L.push('## Questions', '', ...qs.map((q) => `- [${q.data.title}](${abs(url.question(q.id))}): ${q.data.short_answer}`), '');
  L.push('## Ranked lists by niche', '');
  for (const n of niches) if (feed.niche.get(n.slug)!.size) L.push(`- [Best local operators for ${n.name.toLowerCase()}](${abs(url.niche(n.slug))})`);
  L.push('', '## Country index', '');
  for (const r of regions) {
    const l = feed.countriesByRegion.get(r.slug) ?? [];
    if (!l.length) continue;
    L.push(`### ${r.name}`, '');
    for (const d of l) L.push(`- [${d.name}](${abs(url.country(d.slug))}): ${feed.rankedByCountry.get(d.slug)!.length} operator(s) listed`);
    L.push('');
  }
  L.push(`Contact: ${site.email}`, `Published by ${site.publisher.name}: ${site.publisher.url}`, '');
  return new Response(L.join('\n'), { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
