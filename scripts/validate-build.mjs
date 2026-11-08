// Post-build checks on dist/. Fails the build if any brief rule is broken.
// - one <h1> per page; canonical; Open Graph; "Published by Tourground." footer linking to the main site
// - JSON-LD parses, uses schema.org, and has the required properties per type
// - unverified companies never published; example records noindexed and out of sitemaps
// - no phone numbers / WhatsApp / tel: links; only the configured email address
// - every image has width and height
// - every factual page shows a published date, a last-reviewed date and sources
import fs from 'node:fs';
import path from 'node:path';

const DIST = path.resolve('dist');
const SITE = 'https://trustedground.tourground.com';
const EMAIL = 'trustedground@tourground.com';
const feedFile = process.env.FEED_PATH || (fs.existsSync('data/feed.json') ? 'data/feed.json' : 'data/feed.mock.json');
const feed = JSON.parse(fs.readFileSync(feedFile, 'utf8'));

const errors = [];
const err = (f, m) => errors.push(`${path.relative(DIST, f)}: ${m}`);

function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else out.push(p);
  }
  return out;
}

const files = walk(DIST);
const html = files.filter((f) => f.endsWith('.html'));

const REQUIRED = {
  Article: ['headline', 'datePublished', 'dateModified', 'author', 'publisher', 'mainEntityOfPage'],
  BreadcrumbList: ['itemListElement'],
  ItemList: ['itemListElement'],
  FAQPage: ['mainEntity'],
  TravelAgency: ['name', 'url', 'address'],
  Organization: ['name'],
  Country: ['name'],
  Place: ['name'],
  WebSite: ['name', 'url'],
  Question: ['name', 'acceptedAnswer'],
  Answer: ['text'],
  ListItem: ['position'],
};
const typeCount = {};

function checkNode(f, node) {
  if (!node || typeof node !== 'object') return;
  if (Array.isArray(node)) return node.forEach((n) => checkNode(f, n));
  const t = node['@type'];
  if (t) {
    typeCount[t] = (typeCount[t] || 0) + 1;
    for (const k of REQUIRED[t] || []) {
      if (node[k] === undefined || node[k] === null || node[k] === '' || (Array.isArray(node[k]) && node[k].length === 0)) err(f, `JSON-LD ${t} missing "${k}"`);
    }
    if (t === 'ListItem' && !node.item && !node.url && !node.name) err(f, 'JSON-LD ListItem needs item, url or name');
    for (const k of ['datePublished', 'dateModified']) if (node[k] && !/^\d{4}-\d{2}-\d{2}/.test(node[k])) err(f, `JSON-LD ${k} not ISO date: ${node[k]}`);
    for (const k of ['url', 'item', 'mainEntityOfPage']) if (typeof node[k] === 'string' && !/^https?:\/\//.test(node[k])) err(f, `JSON-LD ${t}.${k} not absolute: ${node[k]}`);
  }
  for (const v of Object.values(node)) if (typeof v === 'object') checkNode(f, v);
}

const unpublishable = feed.companies.filter((c) => !(c.verified === true || c.founder_owned === true));
const examples = new Set(feed.companies.filter((c) => c.example).map((c) => c.id));

for (const f of html) {
  const s = fs.readFileSync(f, 'utf8');
  const rel = '/' + path.relative(DIST, f).replace(/index\.html$/, '').replace(/\\/g, '/');
  const is404 = rel.startsWith('/404');
  const h1 = (s.match(/<h1[\s>]/g) || []).length;
  if (h1 !== 1) err(f, `expected 1 <h1>, found ${h1}`);
  if (!/<html lang="en"/.test(s)) err(f, 'missing lang');
  if (!is404) {
    const can = s.match(/<link rel="canonical" href="([^"]+)"/);
    if (!can) err(f, 'missing canonical');
    else if (can[1] !== SITE + rel) err(f, `canonical ${can[1]} != ${SITE + rel}`);
  }
  for (const p of ['og:title', 'og:description', 'og:url', 'og:type']) if (!s.includes(`property="${p}"`)) err(f, `missing ${p}`);
  if (!/<a href="https:\/\/tourground\.com"[^>]*>Published by Tourground\.<\/a>/.test(s)) err(f, 'footer "Published by Tourground." link missing');
  if (/href="(tel:|https?:\/\/(wa\.me|api\.whatsapp\.com|chat\.whatsapp\.com))/i.test(s) || /whatsapp/i.test(s.replace(/<script[\s\S]*?<\/script>/g, ''))) err(f, 'phone/WhatsApp link found');
  for (const m of s.matchAll(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi)) if (m[0].toLowerCase() !== EMAIL) err(f, `unexpected email ${m[0]}`);
  for (const m of s.matchAll(/<img\b[^>]*>/g)) if (!/\bwidth=/.test(m[0]) || !/\bheight=/.test(m[0])) err(f, 'img without width/height');
  if (/<script(?![^>]*(type="application\/ld\+json"|\bdefer\b|is:inline))[^>]*\bsrc=/.test(s)) err(f, 'render-blocking external script');
  // Factual pages: dates + sources
  if (!is404 && rel !== '/') {
    if (!s.includes('class="pagemeta"')) err(f, 'missing published / last reviewed dates');
    if (!/class="sources"|class="vrec-sources"/.test(s) && !/^\/(regions(\/[a-z-]+)?|articles|countries|guide|questions)\/$/.test(rel)) err(f, 'missing sources');
  }
  // JSON-LD
  for (const m of s.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    try {
      const j = JSON.parse(m[1]);
      if (j['@context'] !== 'https://schema.org') err(f, 'JSON-LD @context must be https://schema.org');
      checkNode(f, j);
    } catch (e) {
      err(f, 'JSON-LD does not parse: ' + e.message);
    }
  }
  // Paid/ad slot must come before the first operator table
  const ad = s.indexOf('class="adslot"');
  const reg = s.indexOf('class="register"');
  if (ad > -1 && reg > -1 && ad > reg) err(f, 'ad slot must sit above operator lists');
  // Unverified companies must never appear
  for (const c of unpublishable) if (s.includes(`/operators/${c.id}/`) || s.includes(c.name)) err(f, `unpublishable company appears: ${c.id}`);
  // Example records must be noindex
  const opm = rel.match(/^\/operators\/([^/]+)\/$/);
  if (opm && examples.has(opm[1]) && !s.includes('name="robots" content="noindex')) err(f, 'example record must be noindex');
  // Platinum links must be sponsored; other company website links must not appear as outbound CTAs
  for (const m of s.matchAll(/<a class="btnlink" href="([^"]+)" rel="([^"]+)"/g)) {
    const c = feed.companies.find((x) => x.website && m[1] === x.website);
    if (c && c.tier !== 'platinum') err(f, `non-platinum company ${c.id} links to own site`);
    if (c && c.tier === 'platinum' && !/sponsored/.test(m[2]) ) err(f, `platinum link without rel=sponsored`);
  }
}

// No ranking anywhere: no rank column, no 'ranked' wording.
for (const f of html) {
  const s = fs.readFileSync(f, 'utf8').replace(/<script[\s\S]*?<\/script>/g, '');
  if (/\branked\b|>Rank<|How we rank|Best local operators|How verification works|href="\/verification\/"/i.test(s)) err(f, 'ranking or verification wording found');
}
// Directory removed: no operator pages may exist.
if (fs.existsSync(path.join(DIST, 'operators'))) errors.push('operator pages must not be generated');
// Country pages only for destinations with listed companies.
const ranked = new Set(feed.companies.filter((c) => c.verified || c.founder_owned).flatMap((c) => (c.delivers_in?.length ? c.delivers_in : [c.country_base])));
for (const d of feed.destinations) {
  const exists = fs.existsSync(path.join(DIST, 'countries', d.slug, 'index.html'));
  if (exists !== ranked.has(d.slug)) errors.push(`country page for ${d.slug}: exists=${exists}, should=${ranked.has(d.slug)}`);
}
// Sitemaps, robots, llms
const idx = fs.readFileSync(path.join(DIST, 'sitemap.xml'), 'utf8');
const smaps = [...idx.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
if (smaps.length < 2) errors.push('sitemap index should list per-section sitemaps');
let urlCount = 0;
for (const u of smaps) {
  const file = path.join(DIST, new URL(u).pathname);
  if (!fs.existsSync(file)) { errors.push(`sitemap index points to missing ${u}`); continue; }
  const x = fs.readFileSync(file, 'utf8');
  for (const m of x.matchAll(/<loc>([^<]+)<\/loc>/g)) {
    urlCount++;
    const p = new URL(m[1]).pathname;
    if (!fs.existsSync(path.join(DIST, p, 'index.html'))) errors.push(`${path.basename(file)}: URL has no page: ${p}`);
    const op = p.match(/^\/operators\/([^/]+)\/$/);
    if (op && examples.has(op[1])) errors.push(`${path.basename(file)}: example record in sitemap: ${p}`);
  }
}
const robots = fs.readFileSync(path.join(DIST, 'robots.txt'), 'utf8');
for (const a of ['GPTBot', 'ClaudeBot', 'PerplexityBot', 'Google-Extended']) if (!new RegExp(`User-agent: ${a}\\nAllow: /`).test(robots)) errors.push(`robots.txt does not allow ${a}`);
if (!fs.existsSync(path.join(DIST, 'llms.txt'))) errors.push('llms.txt missing');

if (errors.length) {
  console.error(`\n[validate] ${errors.length} problem(s):\n  ` + [...new Set(errors)].slice(0, 80).join('\n  '));
  process.exit(1);
}
console.log(`[validate] OK: ${html.length} HTML pages, ${smaps.length} sitemaps with ${urlCount} URLs. JSON-LD types: ${Object.entries(typeCount).map(([k, v]) => `${k}×${v}`).join(', ')}`);
