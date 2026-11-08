import type { APIRoute } from 'astro';
import { getFeed } from '../lib/feed';
import { site, regions } from '../config/site.config';
import { published } from '../lib/content';
import { url, abs } from '../lib/urls';
export const GET: APIRoute = async () => {
  const feed = getFeed();
  const arts = (await published('articles')).sort((a, b) => a.data.title.localeCompare(b.data.title));
  const L: string[] = [];
  L.push(`# ${site.name}`, '', `> ${site.positioning}`, '');
  L.push('Every article and guide lists its sources and shows when it was published and last reviewed.', '');
  if (arts.length) L.push('## Articles', '', ...arts.map((a) => `- [${a.data.title}](${abs(url.article(a.id))}): ${a.data.description}`), '');
  L.push('## Destination guides', '');
  for (const r of regions) {
    const l = feed.countriesByRegion.get(r.slug) ?? [];
    if (!l.length) continue;
    L.push(`### ${r.name}`, '', ...l.map((d) => `- [${d.name}](${abs(url.country(d.slug))})`), '');
  }
  L.push(`Contact: ${site.email}`, `Published by ${site.publisher.name}: ${site.publisher.url}`, '');
  return new Response(L.join('\n'), { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
