"""Apply hand-picked Commons photos: download a 1600px rendition and record author + licence
(parsed from the file description page). Usage: python3 apply-picks.py CANDS.json PICKS.json"""
import json, os, re, sys, time, html, urllib.parse, urllib.request
H = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.join(H, '..', '..')
UA = 'TrustedGroundBuild/1.0 (+https://trustedground.tourground.com)'
def get(url, binary=False):
    for i in range(8):
        try:
            with urllib.request.urlopen(urllib.request.Request(url, headers={'User-Agent': UA}), timeout=90) as r:
                d = r.read(); return d if binary else d.decode('utf-8', 'replace')
        except urllib.error.HTTPError as e:
            if e.code == 404: raise
            time.sleep(int(e.headers.get('Retry-After') or 20) + 3)
        except Exception: time.sleep(10)
    raise RuntimeError(url)
def text(s): return re.sub(r'\s+', ' ', html.unescape(re.sub(r'<[^>]+>', '', s or ''))).strip()
cands = json.load(open(sys.argv[1])); picks = json.load(open(sys.argv[2]))
imgs = json.load(open(os.path.join(ROOT, 'data', 'images.json')))
for slug, idx in picks.items():
    c = cands[slug][idx]; file = c['file']
    page_url = 'https://commons.wikimedia.org/wiki/' + urllib.parse.quote(file.replace(' ', '_'))
    page = get(page_url).replace('&#95;', '_'); time.sleep(1)
    attr = re.search(r'class="licensetpl_attr[^"]*"[^>]*>(.*?)</span>', page, re.S)
    aut = re.search(r'id="fileinfotpl_aut"[^>]*>.*?</td>\s*<td[^>]*>(.*?)</td>', page, re.S)
    author = text(attr.group(1)) if attr else (text(aut.group(1)) if aut else 'Wikimedia Commons')
    author = re.sub(r'\s*\(?(talk|contribs)\)?', '', author)[:80]
    lic = re.search(r'class="licensetpl_short[^"]*"[^>]*>(.*?)</span>', page, re.S)
    licu = re.search(r'class="licensetpl_link[^"]*"[^>]*>(.*?)</span>', page, re.S)
    license = text(lic.group(1)) if lic else None
    if not license or not re.match(r'(CC BY|CC0|Public domain|PD)', license, re.I):
        print('SKIP licence', slug, license); continue
    thumb = re.sub(r'/(\d+)px-', '/1280px-', c['thumb'].split('?')[0]).replace('thumb.wikimedia.org', 'upload.wikimedia.org')
    data = get(thumb, binary=True); time.sleep(1)
    open(os.path.join(ROOT, 'src', 'assets', 'places', slug + '.jpg'), 'wb').write(data)
    imgs[slug] = {'file': file, 'page': page_url, 'author': author, 'license': license,
                  'license_url': text(licu.group(1)) if licu else None, 'description': c.get('pool', ''),
                  'width': 1280, 'height': round(1280 * c['h'] / c['w']), 'alternatives': []}
    json.dump(imgs, open(os.path.join(ROOT, 'data', 'images.json'), 'w'), ensure_ascii=False, indent=1)
    print('ok', slug, '|', author[:40], '|', license, flush=True)
