"""List Wikimedia Commons Featured Pictures (fallback: Quality images) per destination from the
category web pages, keeping landscape-format photos without people/animals in the title.
Writes candidates JSON for human review. Usage: python3 featured-candidates.py OUT.json [slug ...]"""
import json, os, re, sys, time, html, urllib.parse, urllib.request
H = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.join(H, '..', '..')
UA = 'TrustedGroundBuild/1.0 (+https://trustedground.tourground.com)'
ALIASES = {'united-states': ['the United States'], 'czechia': ['the Czech Republic', 'Czechia'], 'turkiye': ['Turkey'],
  'the-gambia': ['the Gambia', 'Gambia'], 'england-wales': ['England', 'Wales'], 'united-arab-emirates': ['the United Arab Emirates'],
  'dominican-republic': ['the Dominican Republic'], 'philippines': ['the Philippines'], 'maldives': ['the Maldives'],
  'cook-islands': ['the Cook Islands'], 'sao-tome-and-principe': ['São Tomé and Príncipe'], 'cape-verde': ['Cape Verde'],
  'antarctica': ['Antarctica'], 'french-polynesia': ['French Polynesia']}
BAD = re.compile(r'\b(portrait|people|man|men|woman|women|girl|boy|child|children|kids?|crowd|wedding|dancer|soldier|president|minister|actor|singer|vendor|monk|bride|tourists?|festival|parade|carnival|ceremony|students?|worker|insect|beetle|moth|butterfly|spider|lizard|gecko|snake|frog|fungus|mushroom|flower|orchid|leaf|macro|stamp|coin|map|flag|coat of arms|banknote|interior|museum|painting|mosaic|fresco|sculpture|statue|manuscript|bird|heron|eagle|owl|egret|duck|aircraft|airplane|jet|navy|military|warship|helicopter|satellite|NASA|astronaut|night|car|bus|train|locomotive|truck|logo|poster|document|book|tomb|grave|cemetery|hotel|food|dish|drawing|sketch|engraving|lithograph|altar|organ|ceiling|dome interior|nave|chancel|crypt|[A-Z][a-z]+ [a-z]{4,}us\b|[A-Z][a-z]+ [a-z]{4,}is\b|[A-Z][a-z]+ [a-z]{4,}a\b)', re.I)
def get(url):
    for i in range(6):
        try:
            with urllib.request.urlopen(urllib.request.Request(url, headers={'User-Agent': UA}), timeout=60) as r: return r.read().decode('utf-8', 'replace')
        except urllib.error.HTTPError as e:
            if e.code == 404: return ''
            time.sleep(int(e.headers.get('Retry-After') or 20) + 3)
        except Exception: time.sleep(10)
    return ''
def gallery(cat):
    out = []; url = 'https://commons.wikimedia.org/wiki/Category:' + urllib.parse.quote(cat.replace(' ', '_'))
    for _ in range(4):
        page = get(url); time.sleep(1.5)
        if not page: break
        for m in re.finditer(r'<li class="gallerybox".*?</li>\s*(?=<li class="gallerybox"|</ul>)', page, re.S):
            box = m.group(0)
            a = re.search(r'href="/wiki/(File:[^"]+)"', box); im = re.search(r'<img[^>]+src="([^"]+)"[^>]*data-file-width="(\d+)"[^>]*data-file-height="(\d+)"', box)
            if not a or not im: continue
            title = html.unescape(urllib.parse.unquote(a.group(1))).replace('_', ' ')
            w, h = int(im.group(2)), int(im.group(3))
            if not title.lower().endswith(('.jpg', '.jpeg')) or w < 2000 or w / h < 1.25 or w / h > 2.2 or BAD.search(title): continue
            out.append({'file': title, 'thumb': html.unescape(im.group(1)), 'w': w, 'h': h})
        nxt = re.search(r'<a href="([^"]+)"[^>]*>next page</a>', page)
        if not nxt or len(out) >= 40: break
        url = 'https://commons.wikimedia.org' + html.unescape(nxt.group(1))
    return out
feed = json.load(open(os.path.join(ROOT, 'data', 'feed.mock.json')))
names = {d['slug']: d['name'] for d in feed['destinations']}
out = sys.argv[1]; only = sys.argv[2:]
res = json.load(open(out)) if os.path.exists(out) else {}
for slug, name in sorted(names.items()):
    if (only and slug not in only) or slug in res: continue
    pool = []
    for n in ALIASES.get(slug, [name]):
        for kind in ('Featured pictures of ', 'Quality images of '):
            if len(pool) >= 12: break
            got = gallery(kind + n)
            for g in got: g['pool'] = kind.strip()
            pool += [g for g in got if g['file'] not in {p['file'] for p in pool}]
    res[slug] = pool[:24]
    json.dump(res, open(out, 'w'), ensure_ascii=False, indent=1)
    print(slug, len(pool), flush=True)
