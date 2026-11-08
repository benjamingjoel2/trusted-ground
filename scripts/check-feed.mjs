// Pre-build sanity check of the feed. Fails the build on structural errors.
import fs from 'node:fs';
import path from 'node:path';
const file = process.env.FEED_PATH || (fs.existsSync('data/feed.json') ? 'data/feed.json' : 'data/feed.mock.json');
const feed = JSON.parse(fs.readFileSync(path.resolve(file), 'utf8'));
const errors = [];
const REQ_D = ['slug', 'name', 'type', 'region'];
const REQ_C = ['id', 'name', 'kind', 'country_base', 'delivers_in', 'niches', 'tier', 'verified', 'founder_owned', 'rank', 'summary', 'sources', 'last_checked'];
const slugs = new Set();
for (const d of feed.destinations) {
  for (const k of REQ_D) if (d[k] == null) errors.push(`destination ${d.slug ?? '?'}: missing ${k}`);
  slugs.add(d.slug);
}
let pub = 0, ex = 0;
for (const c of feed.companies) {
  for (const k of REQ_C) if (c[k] == null) errors.push(`company ${c.id ?? '?'}: missing ${k}`);
  if (!['dmc', 'agency'].includes(c.kind)) errors.push(`company ${c.id}: kind must be dmc|agency`);
  if (!['verified', 'black', 'platinum', 'founder'].includes(c.tier)) errors.push(`company ${c.id}: bad tier ${c.tier}`);
  if (c.last_checked && !/^\d{4}-\d{2}-\d{2}$/.test(c.last_checked)) errors.push(`company ${c.id}: last_checked must be YYYY-MM-DD`);
  for (const s of [c.country_base, ...(c.delivers_in || []), ...Object.keys(c.rank || {})]) if (s && !slugs.has(s)) errors.push(`company ${c.id}: unknown destination "${s}"`);
  if (c.verified === true || c.founder_owned === true) pub++; else ex++;
}
if (errors.length) {
  console.error(`[feed] ${errors.length} error(s) in ${file}:\n  ` + errors.slice(0, 50).join('\n  '));
  process.exit(1);
}
console.log(`[feed] ${file}: ${feed.destinations.length} destinations, ${feed.companies.length} companies (${pub} publishable, ${ex} excluded as unverified)`);
