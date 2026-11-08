import type { APIRoute } from 'astro';
import { SECTIONS, sectionEntries, xml, type Section } from '../lib/sitemap';
export function getStaticPaths() {
  return SECTIONS.map((section) => ({ params: { section } }));
}
export const GET: APIRoute = async ({ params }) => {
  const ents = await sectionEntries(params.section as Section);
  // 50,000 URLs per file is the protocol limit; split further if any section ever approaches it.
  if (ents.length > 50000) throw new Error(`sitemap-${params.section} exceeds 50,000 URLs: split it`);
  const urls = ents.map((x) => `<url><loc>${x.loc}</loc><lastmod>${x.lastmod}</lastmod></url>`).join('');
  return xml(`<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>\n`);
};
