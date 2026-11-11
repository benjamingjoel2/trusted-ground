"""Re-read the author from each Commons file page (Author field of the information template)
and clean licence boilerplate out of credit strings in data/images.json."""
import json, os, re, time, html, urllib.request
H = os.path.dirname(os.path.abspath(__file__)); P = os.path.join(H, '..', '..', 'data', 'images.json')
UA = 'TrustedGroundBuild/1.0 (+https://trustedground.tourground.com)'
def text(s): return re.sub(r'\s+', ' ', html.unescape(re.sub(r'<[^>]+>', ' ', s or ''))).strip()
def clean(a):
    a = re.split(r'\s+You are free|\s+\(via Wikimedia|\s*/\s*CC BY', a)[0]
    a = re.sub(r'^Photo by\s+', '', a); a = re.sub(r'\s+or alternatively.*$', '', a)
    a = a.replace('©', '').strip(' ,.-')
    return a[:60]
d = json.load(open(P))
for k, v in d.items():
    a = v.get('author', '')
    if a in ('true', 'false', '', 'Wikimedia Commons contributor') or len(a) > 40 or 'free' in a.lower() or '©' in a:
        if a in ('true', 'false', '', 'Wikimedia Commons contributor') and 'commons.wikimedia.org' in (v.get('page') or ''):
            for i in range(6):
                try:
                    pg = urllib.request.urlopen(urllib.request.Request(v['page'], headers={'User-Agent': UA}), timeout=60).read().decode('utf-8', 'replace').replace('&#95;', '_'); break
                except Exception: time.sleep(15)
            m = re.search(r'id="fileinfotpl_aut"[^>]*>.*?</td>\s*<td[^>]*>(.*?)</td>', pg, re.S)
            a = text(m.group(1)) if m else ''
            if a in ('', 'true', 'false'):
                m2 = re.search(r'class="licensetpl_attr[^"]*"[^>]*>(.*?)</span>', pg, re.S)
                a = text(m2.group(1)) if m2 else 'Wikimedia Commons contributor'
            if a in ('true', 'false'): a = 'Wikimedia Commons contributor'
            time.sleep(1.5)
        v['author'] = clean(a) or 'Wikimedia Commons contributor'
        print(k, '|', v['author'], flush=True)
json.dump(d, open(P, 'w'), ensure_ascii=False, indent=1)
