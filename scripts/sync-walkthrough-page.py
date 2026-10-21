#!/usr/bin/env python3
"""Update chapter links and transcript after rendering the walkthrough."""
from pathlib import Path
import json,re,html
root=Path(__file__).resolve().parents[1]
chapters=json.loads((root/'media/walkthrough-chapters.json').read_text())
page=root/'learn.html';s=page.read_text();duration=round(chapters[-1]['end']);label=f'{duration//60} min {duration%60:02} sec'
s=re.sub(r'<span data-duration>.*?</span>',f'<span data-duration>{label}</span>',s)
for i,ch in enumerate(chapters):
 t=int(ch['start']);s=re.sub(fr'data-chapter="{i}" data-seek="[^"]+"',f'data-chapter="{i}" data-seek="{ch["start"]}"',s)
 pattern=fr'(<button[^>]+data-chapter="{i}".*?<time)[^>]*>.*?</time>'
 s=re.sub(pattern,lambda m:m.group(1)+f' datetime="PT{ch["start"]}S">{t//60}:{t%60:02}</time>',s,flags=re.S)
transcript=''.join(f'<section><h3>{i+1:02} · {html.escape(c["label"].title())}</h3><p>{html.escape(c["voice"])}</p></section>' for i,c in enumerate(chapters))
s=re.sub(r'(<div class="transcript-body">).*?(</div></details>)',lambda m:m.group(1)+transcript+m.group(2),s,flags=re.S)
# The version query prevents browsers from replaying older media.
version=json.loads((root/'package.json').read_text())['version']
for name in ['planvisiq-walkthrough.mp4','planvisiq-walkthrough.vtt','planvisiq-walkthrough-poster.jpg']:
 s=re.sub(r'(\./media/'+re.escape(name)+r')(?:\?v=[^" ]+)?',lambda m:m.group(1)+'?v='+version,s)
page.write_text(s)
p=root/'README.md';s=p.read_text();s=re.sub(r'\d+-minute-\d+-second',f'{duration//60}-minute-{duration%60:02}-second',s);s=re.sub(r'Learn Planvisiq \(v[\d.]+\)',f'Learn Planvisiq (v{version})',s);p.write_text(s)
p=root/'docs/WALKTHROUGH.md';s=p.read_text();s=re.sub(r'approximately \d+ minutes \d+ seconds',f'approximately {duration//60} minutes {duration%60} seconds',s);p.write_text(s)
print('Updated chapters, transcript and duration:',label)
