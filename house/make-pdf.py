#!/usr/bin/env python3
"""
make-pdf.py — turn the web dossier into a print-ready PDF.

  A4 portrait  : cover, 16 sections of text/tables/cards, small diagrams
  A3 landscape : one sheet per architectural drawing (19 sheets, title blocks)

Inputs : house/index.html, house/_svg/*.svg  (produce the svgs with
         `node house/build-svg.mjs`), house/_fonts/*.ttf (see fetch-fonts.sh)
Output : house/dhonashi-house.pdf

Requires: pymupdf, lxml   ->  pip install --break-system-packages pymupdf lxml
"""
import os
import re
import sys
import copy

import pymupdf as fitz
from lxml import html as LH

HERE = os.path.dirname(os.path.abspath(__file__))
SVG_DIR = os.path.join(HERE, '_svg')
FONT_DIR = os.path.join(HERE, '_fonts')
OUT = os.path.join(HERE, 'dhonashi-house.pdf')

# ----------------------------------------------------------------------------- theme
INK = '#12141a'
INK60 = '#5c616b'
INK40 = '#8d919b'
RED = '#b03a2e'
RULE = '#d9d2c3'
PAPER = '#f4f1ea'
PAPER2 = '#fbf9f5'

A4 = fitz.paper_rect('a4')                     # 595 x 842
A3L = fitz.paper_rect('a3-l')                  # 1191 x 842

TEXT_MARGIN = (52, 58, 52, 62)
DRAW_MARGIN = (40, 44, 40, 40)

CSS = """
@font-face { font-family: bn; src: url(HindSiliguri-Light.ttf); font-weight: 300; }
@font-face { font-family: bn; src: url(HindSiliguri-Regular.ttf); font-weight: 400; }
@font-face { font-family: bn; src: url(HindSiliguri-SemiBold.ttf); font-weight: 600; }
@font-face { font-family: bn; src: url(HindSiliguri-Bold.ttf); font-weight: 700; }
@font-face { font-family: mono; src: url(JetBrainsMono[wght].ttf); }
@font-face { font-family: sans; src: url(Inter[opsz,wght].ttf); }

* { font-family: bn; color: #12141a; }
body { font-size: 10pt; line-height: 1.72; }

h1 { font-size: 30pt; font-weight: 600; line-height: 1.15; margin: 0 0 10pt; }
h2 { font-size: 19pt; font-weight: 600; line-height: 1.3; margin: 0 0 6pt; }
h3 { font-size: 13pt; font-weight: 600; margin: 16pt 0 6pt; }
h4 { font-size: 11.5pt; font-weight: 600; margin: 0 0 4pt; }
p { margin: 0 0 8pt; }
b { font-weight: 600; }
ul { margin: 2pt 0 8pt 0; padding-left: 13pt; }
li { margin: 0 0 3pt; }

.sheet-head { margin: 0 0 14pt; padding-bottom: 10pt; border-bottom: 0.9pt solid #12141a; }
.secno { font-family: mono; font-size: 8.5pt; letter-spacing: 2pt; color: #b03a2e; }
.secno .en2 { font-family: mono; font-size: 7.4pt; letter-spacing: 1.6pt; color: #8d919b; margin-left: 6pt; }
.secno b { font-family: bn; font-size: 19pt; letter-spacing: 0; font-weight: 600; color: #12141a; margin-right: 8pt; }
.toc { margin-top: 6pt; }
.toc td { border-bottom: 0.4pt solid #e2ddd0; padding: 6pt 0; vertical-align: baseline; }
.toc .n { width: 32pt; font-family: mono; font-size: 8pt; color: #b03a2e; }
.toc .t { font-size: 10.5pt; }
.toc .p { width: 34pt; text-align: right; font-family: mono; font-size: 8.5pt; color: #5c616b; }
.toc .s { font-family: mono; font-size: 6.8pt; letter-spacing: 0.6pt; color: #8d919b; text-transform: uppercase; }
.en { display: block; font-family: mono; font-size: 7.6pt; letter-spacing: 1.6pt; color: #8d919b; text-transform: uppercase; margin: 2pt 0 8pt; }
.lead { font-size: 10.5pt; color: #31353d; }

.strip { width: 100%; border-top: 0.8pt solid #12141a; border-bottom: 0.8pt solid #12141a; padding: 8pt 0; margin: 12pt 0 16pt; }
.strip td { padding: 0 8pt 0 0; vertical-align: top; }
.num { font-size: 20pt; font-weight: 600; line-height: 1; }
.num small { font-size: 8.5pt; color: #8d919b; font-weight: 400; }
.lbl { font-size: 7.4pt; color: #5c616b; line-height: 1.35; }

.card { border: 0.6pt solid #d9d2c3; background: #fbf9f5; padding: 9pt 11pt; margin: 8pt 0 10pt; }
.card__no { display: block; font-family: mono; font-size: 7pt; letter-spacing: 1.4pt; text-transform: uppercase; color: #b03a2e; margin-bottom: 3pt; }
.note { border-left: 2.2pt solid #b03a2e; background: #f7f2ea; padding: 9pt 12pt; margin: 8pt 0 10pt; }
.note__lbl { display: block; font-family: mono; font-size: 7pt; letter-spacing: 1.4pt; text-transform: uppercase; color: #b03a2e; margin-bottom: 3pt; }
.note--blue { border-left-color: #2e4c6d; background: #f2f4f7; }
.note--blue .note__lbl { color: #2e4c6d; }

table.d { width: 100%; border-collapse: collapse; margin: 6pt 0 12pt; }
table.d th { font-family: mono; font-size: 7pt; letter-spacing: 0.9pt; text-transform: uppercase; color: #5c616b;
             border-bottom: 0.8pt solid #12141a; padding: 4pt 5pt; text-align: left; }
table.d td { border-bottom: 0.4pt solid #e2ddd0; padding: 4.5pt 5pt; font-size: 9pt; line-height: 1.5; vertical-align: top; }
table.d tr.tot td { border-top: 0.8pt solid #12141a; border-bottom: 0.8pt solid #12141a; font-weight: 600; }
td.r, th.r { text-align: right; }

.tag { font-family: mono; font-size: 6.6pt; letter-spacing: 0.5pt; text-transform: uppercase;
       border: 0.5pt solid #b03a2e; color: #b03a2e; padding: 0.5pt 2.5pt; }
.tag--green { border-color: #5b7355; color: #5b7355; }
.tag--amber { border-color: #b8862b; color: #b8862b; }
.tag--blue { border-color: #2e4c6d; color: #2e4c6d; }

figure.plate { margin: 10pt 0 12pt; }
figure.plate img { }
figcaption { border-top: 0.6pt solid #12141a; margin-top: 3pt; padding-top: 4pt;
             font-family: mono; font-size: 7pt; letter-spacing: 0.8pt; color: #5c616b; text-transform: uppercase; }
figcaption b { font-family: bn; font-size: 9pt; letter-spacing: 0; color: #12141a; text-transform: none; font-weight: 600; }

.kv { margin: 4pt 0 10pt; }
.kv dt { font-family: mono; font-size: 7pt; letter-spacing: 1pt; text-transform: uppercase; color: #b03a2e; margin-top: 6pt; }
.kv dd { margin: 0; font-size: 9.5pt; }

.srcs li { font-size: 8pt; color: #5c616b; line-height: 1.5; margin-bottom: 2pt; }
"""


# ----------------------------------------------------------------------------- helpers
def cls(el):
    return (el.get('class') or '').split()


def has(el, name):
    return name in cls(el)


def txt(el):
    return ' '.join((el.text_content() or '').split())


def inner_html(el):
    return (el.text or '') + ''.join(LH.tostring(c, encoding='unicode') for c in el)


def esc(s):
    return (s.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;'))


def svg_aspect(name):
    """width / height of a drawing, from its viewBox."""
    path = os.path.join(SVG_DIR, f'{name}.svg')
    with open(path, encoding='utf-8') as fh:
        head = fh.read(400)
    m = re.search(r'viewBox="([^"]+)"', head)
    if not m:
        return 1.4
    v = [float(x) for x in re.split(r'[\s,]+', m.group(1).strip())]
    if len(v) != 4 or v[3] == 0:
        return 1.4
    return v[2] / v[3]


def fit_image(name, max_w, max_h):
    """largest width that keeps the drawing inside max_w x max_h (pt)."""
    a = svg_aspect(name)
    return min(max_w, max_h * a)


def render_table(tbl):
    rows = tbl.xpath('.//tr')
    if not rows:
        return ''
    out = ['<table class="d">']
    head = tbl.xpath('.//thead//tr')
    if head:
        out.append('<tr>' + ''.join(
            f'<th class="{"r" if has(c, "num") else ""}">{esc(txt(c))}</th>' for c in head[0].xpath('./th|./td')) + '</tr>')
    body = tbl.xpath('.//tbody//tr') or [r for r in rows if r not in head]
    for tr in body:
        klass = ' class="tot"' if has(tr, 'tbl-tot') else ''
        cells = []
        for c in tr.xpath('./td|./th'):
            ck = ' class="r"' if has(c, 'num') else ''
            cells.append(f'<td{ck}>{esc(txt(c))}</td>')
        out.append(f'<tr{klass}>' + ''.join(cells) + '</tr>')
    out.append('</table>')
    return ''.join(out)


def convert_block(el, plate_info):
    """Turn one dossier block into simple, well-behaved print HTML."""
    c = cls(el)

    if 'strip' in c:
        tds = []
        for d in el.xpath('./div'):
            n = d.xpath("./div[contains(@class,'n')]")
            l = d.xpath("./div[contains(@class,'l')]")
            if not n:
                continue
            num = inner_html(n[0])
            lbl = esc(txt(l[0])) if l else ''
            tds.append(f'<td><div class="num">{num}</div><div class="lbl">{lbl}</div></td>')
        return '<table class="strip"><tr>' + ''.join(tds) + '</tr></table>'

    if 'card' in c:
        no = el.xpath("./span[contains(@class,'card__no')]")
        h4 = el.xpath('./h4')
        body = ''.join(convert_block(k, plate_info) for k in el if k.tag in ('p', 'ul', 'ol', 'table', 'div'))
        return (f'<div class="card">'
                f'{f"<span class=card__no>{esc(txt(no[0]))}</span>" if no else ""}'
                f'{f"<h4>{esc(txt(h4[0]))}</h4>" if h4 else ""}'
                f'{body}</div>')

    if 'note' in c:
        lbl = el.xpath("./span[contains(@class,'note__lbl')]")
        klass = 'note note--blue' if 'note--blue' in c else 'note'
        rest = inner_html(el)
        if lbl:
            rest = re.sub(r'<span class="note__lbl">.*?</span>', '', rest, count=1, flags=re.S)
        rest = re.sub(r'<(b|strong)>', r'<b>', rest)
        return (f'<div class="{klass}">'
                f'{f"<span class=note__lbl>{esc(txt(lbl[0]))}</span>" if lbl else ""}'
                f'{rest}</div>')

    if 'plate' in c:
        bd = el.xpath("./div[contains(@class,'plate__bd')]")
        if not bd:
            return ''
        name = bd[0].get('data-draw')
        head = el.xpath("./div[contains(@class,'plate__hd')]")
        title = txt(head[0].xpath('./span')[0]) if head else name
        sub = txt(head[0].xpath('./span')[1]) if head and len(head[0].xpath('./span')) > 1 else ''
        tb = el.xpath("./div[contains(@class,'plate__tb')]")
        sheet = ''
        if tb:
            for d in tb[0].xpath('./div'):
                if txt(d).upper().startswith('SHEET'):
                    sheet = txt(d).replace('Sheet', '').strip()
        svg_path = os.path.join(SVG_DIR, f'{name}.svg')
        if not os.path.exists(svg_path):
            return ''
        full = sheet and any(sheet.startswith(p) for p in ('D-0', 'D-1'))
        plate_info.append({'name': name, 'title': title, 'sub': sub,
                           'sheet': sheet, 'full': full, 'aspect': svg_aspect(name)})
        # drawings are composed on their own pages (see figure_pages) so a
        # rasterised drawing can never be sliced in half by a page break
        return ''

    if el.tag == 'table':
        return render_table(el)
    if el.tag == 'ul':
        return '<ul>' + ''.join(f'<li>{inner_html(li)}</li>' for li in el.xpath('./li')) + '</ul>'
    if el.tag == 'dl':
        out = ['<div class="kv">']
        for k, v in zip(el.xpath('./dt'), el.xpath('./dd')):
            out.append(f'<dt>{esc(txt(k))}</dt><dd>{inner_html(v)}</dd>')
        out.append('</div>')
        return ''.join(out)
    if el.tag in ('div', 'section'):
        if 'ctrls' in c or 'tbl-wrap' in c and not el.xpath('.//table'):
            return ''
        kids = ''.join(convert_block(k, plate_info) for k in el)
        return kids
    return ''


def figure_pages(plates, max_w, max_h, gap=16):
    """Greedy-pack drawings into pages so nothing is split across a page break."""
    pages, cur, used = [], [], 0
    for p in plates:
        w = min(max_w, max_h * p['aspect'])
        h = w / p['aspect'] + 26                     # + caption + rule
        if cur and used + h > max_h:
            pages.append(cur)
            cur, used = [], 0
        cur.append({**p, 'w': w, 'h': h})
        used += h + gap
    if cur:
        pages.append(cur)
    return pages


def figure_page_html(items, number, label, title):
    out = [f'<div class="sheet-head"><div class="secno"><b>{number}</b>{esc(label)}</div>'
           f'<h3 style="margin-top:2pt">{esc(title)}</h3>'
           f'<span class="en">Drawings · পূর্ণ মাপে দেখতে জুম করুন</span></div>']
    for p in items:
        cap = f'<figcaption><b>{esc(p["title"])}</b> · {esc(p["sub"])}'
        if p['full'] and p['sheet']:
            cap += f'<span style="color:#b03a2e"> — পূর্ণ মাপে A3 শীট {esc(p["sheet"])} দেখুন</span>'
        cap += '</figcaption>'
        out.append(f'<figure class="plate"><img src="{p["name"]}.svg" width="{p["w"]:.0f}">{cap}</figure>')
    return ''.join(out)


def build_section(sec):
    no = sec.xpath("./div[contains(@class,'sec__head')]//div[contains(@class,'sec__no')]")[0]
    number = ''.join(t for t in no.xpath('./text()') if t.strip())
    number = re.sub(r'\s+', '', number)
    label = txt(no.xpath('./span')[0]) if no.xpath('./span') else ''
    h2 = txt(sec.xpath('.//h2')[0])
    en = txt(sec.xpath(".//span[contains(@class,'en')]")[0]) if sec.xpath(".//span[contains(@class,'en')]") else ''
    lead = sec.xpath("./div[contains(@class,'sec__head')]//p")
    lead_html = ''.join(f'<p class="lead">{esc(txt(p))}</p>' for p in lead)

    plates = []
    body = []
    for wrap in sec.xpath("./div[contains(@class,'wrap')]"):
        for el in wrap:
            body.append(convert_block(el, plates))
    return ({'no': number, 'label': label, 'title': h2, 'en': en,
             'head': f'{lead_html}', 'body': ''.join(body)}, plates)


# ----------------------------------------------------------------------------- story
def new_writer(path):
    return fitz.DocumentWriter(path)


def run_story(html, path, page_rect, margin, archive):
    story = fitz.Story(html=html, user_css=CSS, archive=archive)
    w = new_writer(path)
    body = page_rect + (margin[0], margin[1], -margin[2], -margin[3])
    more = 1
    pages = 0
    while more:
        dev = w.begin_page(page_rect)
        more, _ = story.place(body)
        story.draw(dev)
        w.end_page()
        pages += 1
        if pages > 60:
            raise RuntimeError('story will not finish')
    w.close()
    return pages


def check_svgs():
    """Every drawing must be well-formed XML, or the renderer silently drops it."""
    from lxml import etree
    names = sorted(f[:-4] for f in os.listdir(SVG_DIR) if f.endswith('.svg'))
    if not names:
        sys.exit('no drawings in _svg — run: node house/build-svg.mjs')
    bad = []
    for n in names:
        try:
            etree.fromstring(open(os.path.join(SVG_DIR, n + '.svg'), 'rb').read())
        except Exception as e:
            bad.append(f'{n}.svg: {str(e)[:90]}')
    if bad:
        sys.exit('malformed drawings:\n  ' + '\n  '.join(bad))
    print(f'  {len(names)} drawings OK')


def main():
    src = os.path.join(HERE, 'index.html')
    doc = LH.parse(src).getroot()
    main_el = doc.xpath('//main')[0]
    sections = [s for s in main_el.xpath('./section[contains(@class,"sec")]')]

    check_svgs()
    archive = fitz.Archive(SVG_DIR)
    archive.add(FONT_DIR)
    tmpdir = os.path.join(HERE, '_build')
    os.makedirs(tmpdir, exist_ok=True)

    book = fitz.open()
    parts = []            # (kind, path, pages, meta)

    # ---- cover
    cover = f"""
      <div style="height:26pt"></div>
      <div class="secno">PROJECT DHS-2026-01 · REV 03 · 26.10.2026</div>
      <h1 style="margin-top:8pt">ধনশি হাউস</h1>
      <p style="font-size:14pt;color:#31353d">৩২'-০" × ১৬'-০" একতলা বাসভবন · ৫১২ বর্গফুট<br>
      ধনশি গ্রাম, নবীনগর, ব্রাহ্মণবাড়িয়া</p>
      <div style="height:6pt"></div>
      <img src="axon.svg" width="470">
      <div style="height:8pt"></div>
      <p class="lbl">একটি সম্পূর্ণ স্থাপত্য ও প্রকৌশল প্যাকেজ — জলবায়ু ও ভূমিকম্পের
      গবেষণা, লেয়ারড প্ল্যান, ৪টি এলিভেশন, ২টি সেকশন, ৬টি কনস্ট্রাকশন ডিটেইল,
      কাঠামোর হিসাব, উপকরণের স্পেসিফিকেশন, পানি-বিদ্যুৎ ও ব্যয়ের পূর্ণ হিসাব।</p>
      <table class="strip" style="margin-top:18pt"><tr>
        <td><div class="num">৫১২<small> sqft</small></div><div class="lbl">ফ্লোর এরিয়া</div></td>
        <td><div class="num">২,৭৪,৬৪০</div><div class="lbl">মূল বাজেট · টাকা</div></td>
        <td><div class="num">৭,৭২,০০০</div><div class="lbl">বাস্তব বাজেট · টাকা</div></td>
      </tr></table>
      <p class="lbl" style="margin-top:16pt">DESIGN PROPOSAL — NOT FOR CONSTRUCTION ·
      সয়েল টেস্ট ও কাঠামো ইঞ্জিনিয়ারের স্বাক্ষরের পরে নির্মাণযোগ্য</p>
    """
    cover_path = os.path.join(tmpdir, 'cover.pdf')
    run_story(cover, cover_path, A4, TEXT_MARGIN, archive)
    parts.append(('cover', cover_path, fitz.open(cover_path).page_count, None))

    # ---- sections
    for idx, sec in enumerate(sections, start=1):
        data, plates = build_section(sec)
        html = (f'<div class="sheet-head"><div class="secno"><b>{data["no"]}</b>{esc(data["label"])}</div>'
                f'<h2>{esc(data["title"])}</h2>'
                f'<span class="en">{esc(data["en"])}</span></div>{data["head"]}{data["body"]}')
        path = os.path.join(tmpdir, f's{idx:02d}.pdf')
        n = run_story(html, path, A4, TEXT_MARGIN, archive)
        parts.append(('section', path, n, {'no': data['no'], 'title': data['title'],
                                           'label': data['label'], 'en': data['en']}))

        figures = [p for p in plates if not p['full']]
        fcount = 0
        for gi, page_items in enumerate(figure_pages(figures, 470, 640), start=1):
            fpath = os.path.join(tmpdir, f'f{idx:02d}_{gi}.pdf')
            fcount = run_story(figure_page_html(page_items, data['no'], data['label'], data['title']),
                               fpath, A4, TEXT_MARGIN, archive)
            parts.append(('figures', fpath, fcount, None))
        print(f'  section {data["no"]:>3}  {n:>2} text page(s)'
              f'  {len(plates)} drawing(s)  {data["title"][:30]}')

        # architectural drawings of this section, full size on A3 landscape
        for p in plates:
            if not p['full']:
                continue
            iw = fit_image(p['name'], 1080, 640)
            sheet = f"""<table style="width:100%;border-bottom:0.9pt solid #12141a;padding-bottom:6pt">
                <tr><td><div class="secno"><b>{esc(data['no'])}</b><span style="letter-spacing:0">{esc(data['label'])}</span></div></td>
                <td style="text-align:right"><div class="secno">{esc(p['sheet'])} · {esc(p['sub'])}</div></td></tr></table>
              <div style="height:10pt"></div>
              <img src="{p['name']}.svg" width="{iw:.0f}">"""
            dpath = os.path.join(tmpdir, f'd_{p["name"]}.pdf')
            dn = run_story(sheet, dpath, A3L, DRAW_MARGIN, archive)
            if dn != 1:
                raise RuntimeError(f'{p["name"]}: drawing sheet spilled onto {dn} pages')
            parts.append(('drawing', dpath, dn, None))

    # ---- contents page (page numbers need the section PDFs to exist first)
    def toc_html(toc_pages, total_pages):
        running = 1 + toc_pages                  # 1-based page numbers
        rows = []
        for kind, _path, pages, meta in parts:
            if kind != 'section':
                continue
            rows.append(
                f'<tr><td class="n">{esc(meta["no"])}</td>'
                f'<td class="t"><a href="#{meta["no"]}" style="color:#12141a">{esc(meta["title"])}</a></td>'
                f'<td class="p">{running}</td></tr>')
            running += pages
        drawings = sum(1 for k, _p, _pp, _m in parts if k == 'drawing')
        rows.append('<tr><td class="n"></td><td class="t" style="padding-top:9pt;color:#5c616b">'
                    f'পূর্ণ মাপের ড্রয়িং শীট · A3 ল্যান্ডস্কেপ · {drawings}টি</td>'
                    '<td class="p"></td></tr>')
        return (f'<div class="sheet-head"><div class="secno">CONTENTS</div>'
                f'<h2>সূচিপত্র</h2>'
                f'<span class="en">16 sections · {drawings} full-size drawing sheets · {total_pages} pages</span>'
                f'</div><table class="toc">{"".join(rows)}</table>')

    toc_path = os.path.join(tmpdir, 'toc.pdf')
    others = sum(pg for k, _p, pg, _m in parts)
    toc_pages = 1
    for _ in range(4):
        total = 1 + toc_pages + others
        n = run_story(toc_html(toc_pages, total), toc_path, A4, TEXT_MARGIN, archive)
        if n == toc_pages:
            break
        toc_pages = n
    parts.insert(1, ('toc', toc_path, toc_pages, None))
    for kind, path, _pages, _meta in parts:
        book.insert_pdf(fitz.open(path))

    # ---- page furniture + metadata
    for i, page in enumerate(book, start=1):
        w, h = page.rect.width, page.rect.height
        landscape = w > h
        f = fitz.Font(fontfile=os.path.join(FONT_DIR, 'JetBrainsMono[wght].ttf'))
        label = 'DHS-2026-01  ·  DHONASHI HOUSE  ·  512 SQFT  ·  DESIGN DOSSIER  ·  REV 03'
        page.insert_font(fontname='mono', fontfile=os.path.join(FONT_DIR, 'JetBrainsMono[wght].ttf'))
        page.insert_text((40 if landscape else 52, h - 26), label,
                         fontname='mono', fontsize=6.6, color=(0.35, 0.36, 0.38))
        num = f'{i:02d}'
        tw = f.text_length(num, fontsize=8)
        page.insert_text((w - (40 if landscape else 52) - tw, h - 26), num,
                         fontname='mono', fontsize=8, color=(0.07, 0.08, 0.1))
        if not landscape:
            page.draw_line(fitz.Point(52, h - 34), fitz.Point(w - 52, h - 34),
                           color=(0.85, 0.82, 0.76), width=0.5)

    # ---- navigation outline (bookmarks) + internal links
    toc_items = []
    page = 1
    for kind, _path, pages, meta in parts:
        if kind == 'cover':
            toc_items.append([1, 'প্রচ্ছদ · Cover', page])
        elif kind == 'toc':
            toc_items.append([1, 'সূচিপত্র · Contents', page])
        elif kind == 'section':
            toc_items.append([1, f'{meta["no"]} · {meta["title"]}', page])
        page += pages
    book.set_toc(toc_items)

    book.set_metadata({
        'title': 'ধনশি হাউস — ৩২x১৬ ফুট একতলা বাসভবন · সম্পূর্ণ ডিজাইন ডসিয়ার',
        'author': 'Design team · Project DHS-2026-01',
        'subject': 'Architectural + structural + MEP design package, 512 sqft rural house, Nabinagar, Brahmanbaria',
        'keywords': 'BNBC 2020, Zone 3, 512 sqft, tin roof, eco block, Dhonashi',
        'creator': 'house/make-pdf.py',
    })
    count = book.page_count
    if not book.is_closed:
        book.save(OUT, garbage=4, deflate=True)
        book.close()
    book = fitz.open(OUT)   # reopen: incremental save adds the contents links
    try:
        toc_page = book[1]
        words = toc_page.get_text('words')
        rows = {}
        for w in words:
            t = w[4].strip()
            if t.isdigit() and w[0] > 280 and 140 < w[1] < 790:
                rows.setdefault(round(w[1]), []).append(w)
        for lbl in words:
            t = lbl[4].strip()
            if len(t) == 2 and t[0] in '০১২৩৪৫৬৭৮৯' and lbl[0] < 90:
                cand = min(rows.keys(), key=lambda y: abs(y - lbl[1]), default=None)
                if cand is None or abs(cand - lbl[1]) > 8:
                    continue
                num = rows[cand][0]
                rect = fitz.Rect(lbl[0], min(lbl[1], num[1]) - 2, num[2], max(lbl[3], num[3]) + 2)
                target = int(num[4]) - 1
                if 0 <= target < count:
                    toc_page.insert_link({'kind': fitz.LINK_GOTO, 'from': rect,
                                          'page': target, 'to': fitz.Point(52, 60)})
        book.saveIncr()
    finally:
        book.close()
    print(f'\n{OUT} — {count} pages, {os.path.getsize(OUT)/1024/1024:.1f} MB')


if __name__ == '__main__':
    main()
