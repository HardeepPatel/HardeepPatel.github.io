"""Check the files GitHub Pages will actually serve; no build required."""
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlsplit, unquote
import re
root = Path(__file__).resolve().parents[1]
class Document(HTMLParser):
    def __init__(self):
        super().__init__(); self.links=[]; self.ids=set()
    def handle_starttag(self, tag, attrs):
        attrs=dict(attrs)
        if attrs.get('id'): self.ids.add(attrs['id'])
        for key in ('href','src'):
            if attrs.get(key): self.links.append(attrs[key])
files=[root/'index.html', *sorted((root/'html').glob('*.html'))]
parsed={}
for file in files:
    doc=Document(); doc.feed(file.read_text()); parsed[file.resolve()]=doc
count=0
for file,doc in parsed.items():
    for link in doc.links:
        u=urlsplit(link)
        if u.scheme or u.netloc: continue
        target=(root/u.path.lstrip('/') if u.path.startswith('/') else file.parent/unquote(u.path)).resolve() if u.path else file
        assert target.is_file(), f'{file.name}: missing {link}'
        if u.fragment and target in parsed:
            assert u.fragment in parsed[target].ids, f'{file.name}: missing anchor {link}'
        count+=1
for css in (root/'assets/css').glob('*.css'):
    for value in re.findall(r'url\([\"\']?([^\)\"\']+)',css.read_text()):
        assert (css.parent/value).is_file(), f'Missing CSS resource: {value}'
assert (root/'.nojekyll').is_file()
assert (root/'assets/documents/Hardeep-Patel-Resume.pdf').read_bytes().startswith(b'%PDF')
print(f'PASS: {len(files)} pages, {count} local links, CSS assets, résumé, and Pages entrypoint.')
