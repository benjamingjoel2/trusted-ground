// Refresh the directory feed. If FEED_URL is set, download the Tourground
// directory export to data/feed.json (used in preference to the mock).
// With no FEED_URL the build uses data/feed.json if present, else the mock.
import fs from 'node:fs';
const url = process.env.FEED_URL;
if (!url) {
  console.log('[feed] FEED_URL not set: using', fs.existsSync('data/feed.json') ? 'data/feed.json' : 'data/feed.mock.json');
  process.exit(0);
}
const headers = process.env.FEED_TOKEN ? { Authorization: `Bearer ${process.env.FEED_TOKEN}` } : {};
const res = await fetch(url, { headers });
if (!res.ok) {
  console.error(`[feed] download failed: HTTP ${res.status}`);
  process.exit(1);
}
const json = await res.json();
if (!Array.isArray(json.destinations) || !Array.isArray(json.companies)) {
  console.error('[feed] downloaded file does not have destinations[] and companies[]');
  process.exit(1);
}
fs.writeFileSync('data/feed.json', JSON.stringify(json));
console.log(`[feed] saved data/feed.json: ${json.destinations.length} destinations, ${json.companies.length} companies`);
