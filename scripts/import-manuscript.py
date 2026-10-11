"""One-time faithful PDF import. Run with the source PDF path as argument."""
import json, re, sys
from pathlib import Path
from pypdf import PdfReader

reader = PdfReader(sys.argv[1])
sections = []
for page in reader.pages[2:28]:
    runs = []
    page.extract_text(visitor_text=lambda text, cm, tm, font, size: runs.append((size, text)) if text.strip() else None)
    title = ' '.join(t.strip() for s, t in runs if s == 15)
    part = ' '.join(t.strip() for s, t in runs if s == 8 and t.strip().startswith('PART'))
    body = ' '.join(t.strip() for s, t in runs if abs(s - 9.3) < .01)
    number, title = re.split(r'\s+\u00b7\s+', title, maxsplit=1)
    sections.append({'id': int(number), 'part': part, 'title': title, 'paragraphs': [body]})
assert [s['id'] for s in sections] == list(range(1, 27))
assert all(s['paragraphs'][0] for s in sections)
Path('src/data').mkdir(parents=True, exist_ok=True)
Path('src/data/manuscript.json').write_text(json.dumps(sections, ensure_ascii=False, indent=2), encoding='utf-8')
print(f'Imported {len(sections)} complete sections; {sum(len(s["paragraphs"][0].split()) for s in sections)} words.')

