import type { APIRoute } from 'astro';
import { SECTIONS, sectionEntries, xml } from '../lib/sitemap';
import { site } from '../config/site.config';
export const GET: APIRoute = async () => {
  const parts = await Promise.all(
    SECTIONS.map(async (s) => {
      const ents = await sectionEntries(s);
      const last = ents.reduce((m, x) => (x.lastmod > m ? x.lastmod : m), '0000-00-00');
      return `<sitemap><loc>${site.url}/sitemap-${s}.xml</loc><lastmod>${last}</lastmod></sitemap>`;
    }),
  );
  return xml(`<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${parts.join('')}</sitemapindex>\n`);
};
