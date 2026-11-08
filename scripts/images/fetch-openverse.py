"""Pick one freely licensed landscape photo per destination (Wikimedia Commons, found via Openverse).

Openverse (api.openverse.org) indexes Wikimedia Commons with licence metadata. We search
"<destination> landscape" then "<destination>", restricted to source=wikimedia, photographs,
wide aspect, large size, licences CC BY / CC BY-SA / CC0 / public domain. Filters drop people,
animals close-ups, aircraft, maps and night shots. Writes src/assets/places/<slug>.jpg (1280px
thumbnail from upload.wikimedia.org) and data/images.json with author, licence and source page.
Usage: python3 scripts/images/fetch-openverse.py [--force] [slug ...]
Pin a specific Commons file for a slug in data/images.pins.json: {"japan": "File:Mount Fuji ....jpg"}
"""
import json, os, re, sys, time, urllib.parse, urllib.request, urllib.error, hashlib

H = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.join(H, '..', '..')
UA = 'TrustedGroundBuild/1.0 (+https://trustedground.tourground.com)'
OUT = os.path.join(ROOT, 'data', 'images.json'); ASSETS = os.path.join(ROOT, 'src', 'assets', 'places')
PINS = os.path.join(ROOT, 'data', 'images.pins.json')
FORCE = '--force' in sys.argv
ONLY = [a for a in sys.argv[1:] if not a.startswith('--')]
sys.path.insert(0, H)
PEOPLE = re.compile(r'\b(portrait|people|person|man|men|woman|women|girl|boy|child|children|kids?|family|crowd|selfie|wedding|dancer|dancers|player|players|athlete|soldier|soldiers|president|minister|actor|actress|singer|vendor|fisherm[ae]n|monks?|nun|bride|tourists?|festival|parade|carnival|market|ceremony|procession|students?|worker|workers|team|visit|meeting|delegation|ambassador)\b', re.I)
NOPE = re.compile(r'\b(insect|beetle|moth|butterfly|spider|ant|bee|wasp|fly|lizard|agama|gecko|snake|frog|fungus|mushroom|flower|orchid|leaf|seed|macro|stamp|coin|map|flag|coat of arms|banknote|interior|museum|painting|mosaic|fresco|sculpture|statue|manuscript|bird|heron|eagle|owl|egret|kingfisher|duck|aircraft|airplane|aeroplane|jet|jets|navy|naval|military|warship|helicopter|fighter|squadron|satellite|NASA|ISS|astronaut|space station|from space|night|nocturnal|car|bus|train|locomotive|truck|logo|poster|document|book|tomb|grave|cemetery|hotel|restaurant|food|dish)\b', re.I)
GOOD = re.compile(r'\b(view|panorama|panoramic|landscape|beach|mountains?|mount|lake|national park|skyline|river|desert|coast|island|bay|valley|old town|harbou?r|waterfall|falls|glacier|fjord|cliffs?|dunes?|savann?ah|canyon|volcano|lagoon|hills?|aerial|city|village|reserve|plateau|forest)\b', re.I)
ALIAS = {'england-wales': 'England', 'united-states': 'United States', 'turkiye': 'Turkey', 'the-gambia': 'Gambia', 'sao-tome-and-principe': 'Sao Tome', 'cape-verde': 'Cape Verde'}

def fetch(url, binary=False):
    for attempt in range(8):
        try:
            req = urllib.request.Request(url, headers={'User-Agent': UA})
            with urllib.request.urlopen(req, timeout=90) as r:
                return r.read() if binary else json.load(r)
        except urllib.error.HTTPError as e:
            if e.code in (404, 400): raise
            wait = int(e.headers.get('Retry-After') or 20) + 3
            print(f'  {e.code} waiting {wait}s', flush=True); time.sleep(wait)
        except Exception as e:
            time.sleep(10)
    raise RuntimeError('failed ' + url)

def search(q):
    out = []
    for page in (1, 2):
        params = {'q': q, 'source': 'wikimedia', 'license': 'by,by-sa,cc0,pdm', 'aspect_ratio': 'wide', 'page_size': '20', 'page': str(page), 'mature': 'false'}
        try:
            d = fetch('https://api.openverse.org/v1/images/?' + urllib.parse.urlencode(params))
        except Exception:
            break
        out += d.get('results', [])
        time.sleep(1.5)
        if (d.get('page_count') or 1) <= page: break
    return out

def thumb(url, width):
    # https://upload.wikimedia.org/wikipedia/commons/a/ab/Name.jpg -> /thumb/a/ab/Name.jpg/<w>px-Name.jpg
    m = re.match(r'(https://upload\.wikimedia\.org/wikipedia/commons)/(\w)/(\w\w)/(.+)$', url)
    if not m: return None
    name = m.group(4)
    return f'{m.group(1)}/thumb/{m.group(2)}/{m.group(3)}/{name}/{width}px-{name}'

def main():
    feed = json.load(open(os.path.join(ROOT, 'data', 'feed.mock.json')))
    names = {d['slug']: d['name'] for d in feed['destinations']}
    done = json.load(open(OUT)) if os.path.exists(OUT) else {}
    pins = json.load(open(PINS)) if os.path.exists(PINS) else {}
    used = {v['file'] for k, v in done.items()}
    for slug, name in sorted(names.items()):
        if ONLY and slug not in ONLY: continue
        if slug in done and not FORCE: continue
        q = ALIAS.get(slug, name)
        pool = []
        for query in (f'{q} landscape', q):
            for r in search(query):
                title = r.get('title') or ''; tags = ' '.join(t.get('name', '') for t in r.get('tags') or [])
                text = title + ' ' + tags
                url = r.get('url') or ''
                if not url.lower().endswith(('.jpg', '.jpeg')): continue
                if PEOPLE.search(text) or NOPE.search(title): continue
                w, h = r.get('width') or 0, r.get('height') or 1
                if w < 1600 or w / h < 1.3 or w / h > 2.6: continue
                file = 'File:' + urllib.parse.unquote(url.rsplit('/', 1)[1]).replace('_', ' ')
                if file in used and slug not in pins: continue
                if not re.search(re.escape(q.split()[0]), text, re.I) and query == q: pass
                score = (3 if (r.get('filetype') or '').lower() in ('jpg','jpeg') else 0) + (5 if GOOD.search(text) else 0) + (2 if re.search(re.escape(q), title, re.I) else 0) + min(w / h, 2)
                pool.append({'score': score, 'file': file, 'url': url, 'page': r.get('foreign_landing_url'),
                             'author': r.get('creator') or 'Unknown', 'license': ('CC ' + r['license'].upper() + ' ' + (r.get('license_version') or '')).strip() if r['license'] not in ('cc0', 'pdm') else ('CC0' if r['license'] == 'cc0' else 'Public domain'),
                             'license_url': r.get('license_url'), 'description': title, 'w': w, 'h': h})
            if len(pool) >= 6: break
        if slug in pins:
            pool = [c for c in pool if c['file'] == pins[slug]] or pool
        pool.sort(key=lambda c: -c['score'])
        ok = False
        for c in pool[:5]:
            for width in (1280, 1920, 960):
                t = thumb(c['url'], width)
                if not t: break
                try:
                    data = fetch(t, binary=True)
                except Exception:
                    continue
                if len(data) < 30000: continue
                open(os.path.join(ASSETS, slug + '.jpg'), 'wb').write(data)
                done[slug] = {k: c[k] for k in ('file', 'page', 'author', 'license', 'license_url', 'description')} | {'width': width, 'height': round(width * c['h'] / c['w']), 'alternatives': [x['file'] for x in pool if x is not c][:5]}
                used.add(c['file']); ok = True
                break
            if ok: break
        if ok:
            json.dump(done, open(OUT, 'w'), ensure_ascii=False, indent=1)
            print('ok', slug, '|', done[slug]['file'][:70], '|', done[slug]['license'], flush=True)
        else:
            print('NONE', slug, len(pool), flush=True)
        time.sleep(1)
main()
