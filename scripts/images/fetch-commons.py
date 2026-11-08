"""Pick one freely licensed landscape photo per destination from Wikimedia Commons.

Source pools: Category:Featured pictures of <X>, then Category:Quality images of <X>.
Filters: landscape orientation, >= 1600px wide, free licence, no obvious people
(title/description keywords). Writes src/assets/places/<slug>.jpg (1600px) and
data/images.json with author, licence and source page for the credits.
Re-run safely: existing entries are kept unless --force. Pin a file with data/images.pins.json.
"""
import json, os, re, sys, time, urllib.parse, urllib.request, urllib.error, html

H = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.join(H, '..', '..')
UA = 'TrustedGroundBuild/1.0 (+https://trustedground.tourground.com)'
API = 'https://commons.wikimedia.org/w/api.php'
OUT = os.path.join(ROOT, 'data', 'images.json'); ASSETS = os.path.join(ROOT, 'src', 'assets', 'places')
PINS = os.path.join(ROOT, 'data', 'images.pins.json')
FORCE = '--force' in sys.argv
ONLY = [a for a in sys.argv[1:] if not a.startswith('--')]

ALIASES = {'united-states': ['the United States'], 'czechia': ['the Czech Republic', 'Czechia'], 'turkiye': ['Turkey'],
  'the-gambia': ['the Gambia', 'Gambia'], 'england-wales': ['England', 'Wales'], 'united-arab-emirates': ['the United Arab Emirates'],
  'dominican-republic': ['the Dominican Republic'], 'philippines': ['the Philippines'], 'maldives': ['the Maldives'],
  'seychelles': ['Seychelles'], 'south-korea': ['South Korea'], 'cook-islands': ['the Cook Islands'],
  'sao-tome-and-principe': ['São Tomé and Príncipe', 'Sao Tome and Principe'], 'cape-verde': ['Cape Verde'], 'northern-ireland': ['Northern Ireland']}
PEOPLE = re.compile(r'\b(portrait|people|person|man|men|woman|women|girl|boy|child|children|kids?|family|crowd|selfie|wedding|dancer|dancers|player|players|athlete|soldier|soldiers|president|minister|actor|actress|singer|vendor|fisherm[ae]n|monks?|nun|bride|tourists?|festival|parade|carnival|market|ceremony|procession|students?|worker|workers)\b', re.I)
NOPE = re.compile(r'\b(insect|beetle|moth|butterfly|spider|ant|bee|wasp|fly|lizard|agama|gecko|snake|frog|fungus|mushroom|flower|orchid|leaf|seed|macro|stamp|coin|map|flag|coat of arms|banknote|interior|museum|painting|mosaic|fresco|sculpture|statue|manuscript|bird|heron|eagle|owl|egret|kingfisher|duck|aircraft|airplane|aeroplane|jet|jets|navy|naval|military|warship|helicopter|fighter|squadron|satellite|NASA|ISS|astronaut|space station|from space|night|nocturnal|CVW)\b', re.I)
GOOD = re.compile(r'\b(view|panorama|panoramic|landscape|beach|mountains?|mount|lake|national park|skyline|river|desert|coast|island|bay|valley|old town|harbou?r|waterfall|falls|glacier|fjord|cliffs?|dunes?|savann?ah|canyon|volcano|lagoon|hills?|aerial|from above|city|village|reserve|plateau|forest)\b', re.I)
FREE = re.compile(r'^(CC BY(-SA)? [0-9.]+|CC0|Public domain|PD|CC BY-SA [0-9.]+ .*|CC BY [0-9.]+ .*)', re.I)

def get(params):
    params = dict(params, format='json', formatversion='2')
    url = API + '?' + urllib.parse.urlencode(params)
    for attempt in range(12):
        time.sleep(3)  # be polite: at most one API call every few seconds
        try:
            req = urllib.request.Request(url, headers={'User-Agent': UA})
            with urllib.request.urlopen(req, timeout=60) as r: return json.load(r)
        except urllib.error.HTTPError as e:
            wait = int(e.headers.get('Retry-After') or 30) + 5
            print(f'  {e.code}, waiting {wait}s', flush=True); time.sleep(wait)
        except Exception as e:
            time.sleep(20)
    raise RuntimeError('API failed: ' + url)

def strip(s): return html.unescape(re.sub(r'<[^>]+>', '', s or '')).strip()

def candidates(cat):
    data = get({'action': 'query', 'generator': 'categorymembers', 'gcmtitle': 'Category:' + cat, 'gcmtype': 'file', 'gcmlimit': '100',
                'prop': 'imageinfo', 'iiprop': 'url|size|extmetadata|mime', 'iiextmetadatafilter': 'ImageDescription|LicenseShortName|Artist|LicenseUrl|Categories'})
    out = []
    for p in (data.get('query') or {}).get('pages', []):
        ii = (p.get('imageinfo') or [{}])[0]; m = ii.get('extmetadata', {})
        if ii.get('mime') != 'image/jpeg': continue
        w, h = ii.get('width', 0), ii.get('height', 1)
        title = p['title']; desc = strip(m.get('ImageDescription', {}).get('value', ''))
        lic = strip(m.get('LicenseShortName', {}).get('value', ''))
        text = title + ' ' + desc + ' ' + strip(m.get('Categories', {}).get('value', ''))
        if w < 1600 or w / h < 1.3 or w / h > 2.6: continue
        if not FREE.match(lic): continue
        if PEOPLE.search(text) or NOPE.search(title + ' ' + desc): continue
        score = (5 if GOOD.search(title + ' ' + desc) else 0) + min(w / h, 2) + (1 if 'Featured' in cat else 0)
        out.append({'score': score, 'file': title,
                    'page': ii.get('descriptionurl'), 'author': strip(m.get('Artist', {}).get('value', '')) or 'Unknown',
                    'license': lic, 'license_url': strip(m.get('LicenseUrl', {}).get('value', '')) or None,
                    'description': desc[:300]})
    return out

def main():
    feed = json.load(open(os.path.join(ROOT, 'data', 'feed.mock.json')))
    names = {d['slug']: d['name'] for d in feed['destinations']}
    done = json.load(open(OUT)) if os.path.exists(OUT) else {}
    pins = json.load(open(PINS)) if os.path.exists(PINS) else {}
    for slug, name in sorted(names.items()):
        if ONLY and slug not in ONLY: continue
        if slug in done and not FORCE and slug not in pins: continue
        pool = []
        for n in ALIASES.get(slug, [name]):
            for kind in ('Featured pictures of ', 'Quality images of '):
                try: pool += candidates(kind + n)
                except Exception as e: print('  err', slug, e)
                time.sleep(2)
            if len(pool) >= 3: break
        if slug in pins:
            pool = [c for c in pool if c['file'] == pins[slug]] or pool
        pool.sort(key=lambda c: -c['score'])
        if not pool: print('NONE', slug); continue
        c = pool[0]
        ti = get({'action': 'query', 'titles': c['file'], 'prop': 'imageinfo', 'iiprop': 'url', 'iiurlwidth': '1600'})
        ii = ti['query']['pages'][0]['imageinfo'][0]
        c['thumb'], c['thumb_w'], c['thumb_h'] = ii['thumburl'], ii['thumbwidth'], ii['thumbheight']
        req = urllib.request.Request(c['thumb'], headers={'User-Agent': UA})
        for attempt in range(8):
            try:
                with urllib.request.urlopen(req, timeout=120) as r: data = r.read()
                break
            except urllib.error.HTTPError as e:
                time.sleep(int(e.headers.get('Retry-After') or 30) + 5)
        else:
            print('  download failed', slug); continue
        open(os.path.join(ASSETS, slug + '.jpg'), 'wb').write(data)
        done[slug] = {k: c[k] for k in ('file', 'page', 'author', 'license', 'license_url', 'description')} | {'width': c['thumb_w'], 'height': c['thumb_h'], 'alternatives': [x['file'] for x in pool[1:6]]}
        json.dump(done, open(OUT, 'w'), ensure_ascii=False, indent=1)
        print('ok', slug, flush=True); print('  ',  '|', c['file'][:80], '|', c['license'])
        time.sleep(1)
main()
