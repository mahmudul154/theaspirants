"""Generate the six offline Visual GK illustrations used by the app.

The output is intentionally self-contained (no remote images or fonts) so the
cards keep working in Vercel, Capacitor, and offline previews.
"""
from io import BytesIO
from pathlib import Path

import cairosvg
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "public" / "assets" / "visual"
OUT.mkdir(parents=True, exist_ok=True)

W, H = 1200, 800

COMMON_DEFS = r'''
<linearGradient id="paper" x1="0" y1="0" x2="1" y2="1">
  <stop offset="0" stop-color="#fbfaf5"/><stop offset="1" stop-color="#eee9dc"/>
</linearGradient>
<linearGradient id="green" x1="0" y1="0" x2="1" y2="1">
  <stop offset="0" stop-color="#18745b"/><stop offset="1" stop-color="#0a493b"/>
</linearGradient>
<linearGradient id="blue" x1="0" y1="0" x2="1" y2="1">
  <stop offset="0" stop-color="#48bde9"/><stop offset="1" stop-color="#1178b5"/>
</linearGradient>
<filter id="shadow" x="-30%" y="-30%" width="160%" height="160%">
  <feDropShadow dx="0" dy="14" stdDeviation="18" flood-color="#16362e" flood-opacity=".18"/>
</filter>
<filter id="soft" x="-30%" y="-30%" width="160%" height="160%">
  <feGaussianBlur stdDeviation="18"/>
</filter>
'''

def wrap(body: str, extra_defs: str = "") -> str:
    return f'''<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}">
<defs>{COMMON_DEFS}{extra_defs}</defs>
<rect width="1200" height="800" fill="url(#paper)"/>
{body}
</svg>'''

# 1 — 1971: memorial, sunrise, and freedom-fighter silhouettes.
v1 = wrap(r'''
<circle cx="600" cy="335" r="260" fill="#d9483b" opacity=".1"/>
<circle cx="600" cy="335" r="175" fill="#d9483b" opacity=".14"/>
<circle cx="600" cy="335" r="104" fill="#d9483b"/>
<path d="M0 675 Q260 600 480 655 T1200 630 V800 H0Z" fill="#153f34"/>
<path d="M0 710 Q280 650 560 700 T1200 670 V800 H0Z" fill="#0b2d27" opacity=".78"/>
<!-- National Martyrs' Memorial-inspired seven rising planes -->
<g filter="url(#shadow)" transform="translate(600 650)">
  <polygon points="-235,0 -185,-260 -150,0" fill="#e5e3da"/>
  <polygon points="-170,0 -120,-345 -84,0" fill="#f3f0e8"/>
  <polygon points="-105,0 -55,-445 -18,0" fill="#d7d8d2"/>
  <polygon points="-38,0 0,-520 38,0" fill="#f8f6ef"/>
  <polygon points="18,0 55,-445 105,0" fill="#d7d8d2"/>
  <polygon points="84,0 120,-345 170,0" fill="#f3f0e8"/>
  <polygon points="150,0 185,-260 235,0" fill="#e5e3da"/>
</g>
<!-- respectful human silhouettes -->
<g fill="#101d1a">
  <circle cx="260" cy="500" r="29"/><path d="M220 650 228 545 Q260 515 292 545 L307 650Z"/>
  <path d="M235 555 178 620 195 635 250 590Z"/><path d="M282 555 345 615 330 633 273 590Z"/>
  <circle cx="925" cy="500" r="29"/><path d="M887 650 893 545 Q925 515 958 545 L972 650Z"/>
  <path d="M900 558 850 620 867 635 918 592Z"/><path d="M946 558 1007 608 993 628 936 592Z"/>
</g>
<!-- flag held at left -->
<path d="M188 300 V642" stroke="#192824" stroke-width="10"/>
<path d="M193 315 H390 V430 H193Z" fill="#176b50" filter="url(#shadow)"/>
<circle cx="283" cy="372" r="38" fill="#e2433b"/>
<!-- light rays -->
<g stroke="#d9483b" opacity=".28" stroke-width="6">
 <path d="M600 65V135"/><path d="M335 150l55 55"/><path d="M865 150l-55 55"/>
 <path d="M245 335h82"/><path d="M873 335h82"/>
</g>
''')

# 2 — River delta, intentionally conceptual rather than a misleading political map.
v2 = wrap(r'''
<path d="M0 155 Q210 95 390 150 T760 125 T1200 150 V800 H0Z" fill="#c6d99b"/>
<path d="M0 270 Q180 215 345 260 T710 225 T1200 270 V800 H0Z" fill="#8fbd73"/>
<!-- farm plots -->
<g opacity=".55">
 <path d="M40 335h240v145H40z" fill="#d9c76c"/><path d="M70 350h180M70 385h180M70 420h180M70 455h180" stroke="#789856" stroke-width="7"/>
 <path d="M890 245h250v150H890z" fill="#d9c76c"/><path d="M920 265h190M920 305h190M920 345h190" stroke="#789856" stroke-width="8"/>
 <path d="M80 600h250v145H80z" fill="#6eaa5e"/><path d="M105 620h200M105 655h200M105 690h200" stroke="#d8d56e" stroke-width="8"/>
</g>
<!-- three great river systems and delta branches -->
<g fill="none" stroke-linecap="round">
 <path d="M335 -20 C300 125 420 190 390 315 C360 440 470 500 455 820" stroke="#dff6fb" stroke-width="95"/>
 <path d="M335 -20 C300 125 420 190 390 315 C360 440 470 500 455 820" stroke="url(#blue)" stroke-width="69"/>
 <path d="M685 -20 C710 125 600 210 655 330 C715 455 610 520 650 820" stroke="#dff6fb" stroke-width="105"/>
 <path d="M685 -20 C710 125 600 210 655 330 C715 455 610 520 650 820" stroke="url(#blue)" stroke-width="76"/>
 <path d="M1030 85 C905 205 930 350 825 430 C735 500 755 635 770 820" stroke="#dff6fb" stroke-width="78"/>
 <path d="M1030 85 C905 205 930 350 825 430 C735 500 755 635 770 820" stroke="url(#blue)" stroke-width="53"/>
 <!-- tributaries -->
 <path d="M40 210 C180 230 225 320 380 330M85 520 C230 500 310 455 410 430M1120 300 C985 315 920 410 830 435M1120 620 C930 565 850 540 750 530" stroke="#168bbd" stroke-width="24"/>
 <path d="M470 525 C350 610 330 690 290 810M545 535 C520 660 545 720 535 810M675 535 C705 650 700 730 690 810M760 520 C875 610 900 690 915 810" stroke="#168bbd" stroke-width="23"/>
</g>
<!-- boats -->
<g filter="url(#shadow)">
 <path d="M278 274q45 28 90 0l-15 28h-60z" fill="#713b28"/><path d="M312 222v58" stroke="#273d36" stroke-width="5"/><path d="m317 228 40 25h-40z" fill="#f3e7c3"/>
 <path d="M775 472q38 24 78 0l-13 25h-52z" fill="#713b28"/><path d="M805 430v45" stroke="#273d36" stroke-width="5"/><path d="m810 434 34 22h-34z" fill="#f3e7c3"/>
</g>
<!-- bay waves -->
<g fill="none" stroke="#d6f2f6" stroke-width="7" opacity=".75">
 <path d="M20 760q35-24 70 0t70 0t70 0"/><path d="M930 735q35-24 70 0t70 0t70 0"/>
</g>
''')

# 3 — Eight planets in correct order.
v3 = wrap('', r'''
<radialGradient id="space"><stop offset="0" stop-color="#173d57"/><stop offset="1" stop-color="#07131f"/></radialGradient>
<radialGradient id="sun"><stop offset="0" stop-color="#fff4a6"/><stop offset=".48" stop-color="#ffc43d"/><stop offset="1" stop-color="#ed6e24"/></radialGradient>
''').replace('<rect width="1200" height="800" fill="url(#paper)"/>', '<rect width="1200" height="800" fill="url(#space)"/>')
v3 = v3.replace('</svg>', r'''
<g fill="#fff" opacity=".7">
 <circle cx="185" cy="85" r="2"/><circle cx="415" cy="175" r="2"/><circle cx="690" cy="105" r="2"/><circle cx="1070" cy="190" r="2"/><circle cx="960" cy="610" r="2"/><circle cx="515" cy="675" r="2"/><circle cx="300" cy="600" r="2"/>
</g>
<circle cx="70" cy="400" r="190" fill="url(#sun)" filter="url(#shadow)"/>
<g fill="none" stroke="#a9c9dd" stroke-width="2" opacity=".25"><path d="M170 625Q610 110 1160 305"/><path d="M180 670Q650 210 1170 435"/><path d="M185 710Q660 330 1160 560"/></g>
<!-- Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus, Neptune -->
<circle cx="245" cy="355" r="15" fill="#a9a39a"/>
<circle cx="335" cy="430" r="25" fill="#d9a75c"/>
<g><circle cx="445" cy="330" r="29" fill="#2e89c7"/><path d="M425 318q18-22 34-5t6 24q-25-2-40-19" fill="#65ad67"/></g>
<circle cx="555" cy="455" r="22" fill="#c95e3c"/>
<g><circle cx="700" cy="315" r="72" fill="#d6a86b"/><path d="M637 285h127M634 315h132M643 347h115" stroke="#8e5d45" stroke-width="9" opacity=".7"/><ellipse cx="685" cy="310" rx="14" ry="9" fill="#9e4938"/></g>
<g><ellipse cx="850" cy="442" rx="106" ry="25" fill="none" stroke="#d9c88f" stroke-width="15" transform="rotate(-10 850 442)"/><circle cx="850" cy="442" r="57" fill="#d6bd78"/><path d="M801 430h98M805 452h90" stroke="#a48a5d" stroke-width="7" opacity=".6"/></g>
<circle cx="1010" cy="335" r="37" fill="#80d6da"/>
<circle cx="1120" cy="485" r="35" fill="#315fb4"/>
</svg>''')

# 4 — Friendly anatomy diagram.
v4 = wrap('', r'''
<linearGradient id="body" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#dcecf0"/><stop offset="1" stop-color="#b7d4da"/></linearGradient>
''').replace('</svg>', r'''
<circle cx="600" cy="380" r="305" fill="#d9eee7" opacity=".55"/>
<!-- neutral body silhouette -->
<g fill="url(#body)" stroke="#63878d" stroke-width="5" filter="url(#shadow)">
 <circle cx="600" cy="126" r="66"/>
 <path d="M530 205 Q600 175 670 205 L710 405 680 650 640 650 630 780 570 780 560 650 520 650 490 405Z"/>
 <path d="M510 235 410 470 455 490 550 310Z"/><path d="M690 235 790 470 745 490 650 310Z"/>
</g>
<!-- brain -->
<path d="M567 113q-5-30 24-35 20-18 39 2 31 5 25 35 10 26-16 36-17 19-39 2-30 8-35-17-15-10 2-23z" fill="#d98aa4" stroke="#a75b78" stroke-width="4"/>
<path d="M583 91q18 12 3 28m40-34q-15 15 0 30m-29 12q17-13 34 4" fill="none" stroke="#f3b7c8" stroke-width="4"/>
<!-- lungs -->
<path d="M581 237q-50 18-54 105 2 57 56 42zM619 237q50 18 54 105-2 57-56 42z" fill="#ef9a94" stroke="#bd615c" stroke-width="5"/>
<path d="M600 218v144" stroke="#87a9ad" stroke-width="9"/>
<!-- heart -->
<path d="M600 342c-33-38-73 10-38 47l38 37 38-37c35-37-5-85-38-47z" fill="#d94445" stroke="#9c3034" stroke-width="5"/>
<!-- liver -->
<path d="M540 425q70-28 133 15l-20 70q-70 17-123-15z" fill="#8e4c3f" stroke="#67332d" stroke-width="5"/>
<!-- stomach -->
<path d="M625 500q60 10 43 77-13 47-70 24 35-26 11-59z" fill="#efa05f" stroke="#b86f37" stroke-width="5"/>
<!-- intestines -->
<g fill="none" stroke-linecap="round"><rect x="536" y="553" width="128" height="116" rx="45" stroke="#c77a56" stroke-width="18"/><path d="M565 580q65 0 45 28t-18 34q-24 17-39-5t33-26q32-8 49 17" stroke="#e6a078" stroke-width="13"/></g>
<!-- bones -->
<g stroke="#f9fbf8" stroke-width="9" opacity=".8"><path d="M440 330l-8 135M760 330l8 135M575 675l-8 98M625 675l8 98"/></g>
<!-- callout dots, no text -->
<g fill="#fff" stroke="#16735b" stroke-width="5"><circle cx="400" cy="125" r="12"/><circle cx="805" cy="335" r="12"/><circle cx="405" cy="565" r="12"/></g>
<g stroke="#16735b" stroke-width="4"><path d="M412 125h120"/><path d="M793 335H675"/><path d="M417 565h112"/></g>
</svg>''')

# 5 — Stylized globe with recognizable continent groups.
v5 = wrap('', r'''
<radialGradient id="ocean" cx="35%" cy="30%"><stop stop-color="#55bde3"/><stop offset="1" stop-color="#116a9e"/></radialGradient>
''').replace('</svg>', r'''
<circle cx="600" cy="400" r="315" fill="url(#ocean)" filter="url(#shadow)"/>
<circle cx="600" cy="400" r="315" fill="none" stroke="#163f56" stroke-width="8"/>
<!-- globe grid -->
<g fill="none" stroke="#d6f1f7" stroke-width="3" opacity=".34">
 <ellipse cx="600" cy="400" rx="190" ry="315"/><ellipse cx="600" cy="400" rx="70" ry="315"/>
 <ellipse cx="600" cy="400" rx="315" ry="230"/><ellipse cx="600" cy="400" rx="315" ry="105"/>
 <path d="M285 400h630"/>
</g>
<!-- stylized, recognizable land masses -->
<g fill="#72ad62" stroke="#376f4b" stroke-width="5" stroke-linejoin="round">
 <!-- North America --> <path d="M330 235l80-70 105 18 45 62-48 36-26 76-64 30-55-54-49-20z"/>
 <!-- South America --> <path d="M493 391l75 23 35 68-25 70-29 112-42-35-24-83 18-66-29-48z"/>
 <!-- Europe --> <path d="M610 237l47-30 55 25-8 45-52 25-48-21z"/>
 <!-- Africa --> <path d="M612 311l91-20 64 75-21 115-61 99-47-52-31-119-41-54z"/>
 <!-- Asia --> <path d="M690 222l87-56 111 45 56 75-35 78-87 5-49-43-75-20z"/>
 <!-- Australia --> <path d="M824 512l82-16 63 51-34 69-92-8-31-48z"/>
 <!-- Greenland --> <path d="M527 130l56-34 37 33-23 55-53-8z" fill="#dce8d5"/>
 <!-- Antarctica --> <path d="M410 671q190 72 380 0l-35 50q-155 61-310 0z" fill="#eef5ee"/>
</g>
<!-- compass rose -->
<g transform="translate(1000 610)" filter="url(#shadow)"><circle r="70" fill="#fff" opacity=".9"/><path d="M0-55 14-10 0 0-14-10Z" fill="#d8483e"/><path d="M0 55 14 10 0 0-14 10Z" fill="#153f56"/><path d="M-55 0-10-14 0 0-10 14ZM55 0 10-14 0 0 10 14Z" fill="#153f56"/></g>
</svg>''')

# 6 — National-symbol collage.
v6 = wrap('', r'''
<linearGradient id="card" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#ffffff"/><stop offset="1" stop-color="#e9eee4"/></linearGradient>
''').replace('</svg>', r'''
<circle cx="600" cy="400" r="310" fill="#dcebdd"/>
<!-- flag centerpiece -->
<g filter="url(#shadow)"><rect x="390" y="255" width="420" height="250" rx="16" fill="#176b50"/><circle cx="575" cy="380" r="82" fill="#e3443c"/></g>
<!-- six symbol cards -->
<g fill="url(#card)" stroke="#d8d8cf" stroke-width="4" filter="url(#shadow)">
 <rect x="55" y="70" width="260" height="250" rx="28"/><rect x="885" y="70" width="260" height="250" rx="28"/>
 <rect x="55" y="480" width="260" height="250" rx="28"/><rect x="885" y="480" width="260" height="250" rx="28"/>
 <rect x="350" y="570" width="220" height="180" rx="28"/><rect x="630" y="570" width="220" height="180" rx="28"/>
</g>
<!-- water lily -->
<g transform="translate(185 195)"><ellipse cy="62" rx="92" ry="22" fill="#4e9a67"/><g fill="#fff" stroke="#9cb7a7" stroke-width="3"><ellipse rx="30" ry="78" transform="rotate(0)"/><ellipse rx="30" ry="78" transform="rotate(55)"/><ellipse rx="30" ry="78" transform="rotate(110)"/></g><circle r="22" fill="#efc640"/></g>
<!-- jackfruit -->
<g transform="translate(1015 190) rotate(-12)"><path d="M0-100q75 0 75 100T0 112Q-75 100-75 0T0-100Z" fill="#93a840" stroke="#4e6f35" stroke-width="7"/><g fill="#c7cf63"><circle cx="-30" cy="-45" r="6"/><circle cx="20" cy="-55" r="6"/><circle cx="42" cy="-10" r="6"/><circle cx="-35" cy="15" r="6"/><circle cx="15" cy="32" r="6"/><circle cx="-18" cy="70" r="6"/></g><path d="M0-105v-38" stroke="#4e6f35" stroke-width="12"/></g>
<!-- hilsa -->
<g transform="translate(185 605)"><path d="M-95 0Q-35-80 65-35L115-78 104-15 120 42 65 15Q-35 80-95 0Z" fill="#b9d3d8" stroke="#4a7079" stroke-width="7"/><path d="M-65 0Q0-25 72-6" fill="none" stroke="#fff" stroke-width="8"/><circle cx="72" cy="-20" r="8" fill="#1e2d30"/></g>
<!-- tiger face -->
<g transform="translate(1015 606)"><path d="M-80-80-105-125-45-98Q0-120 45-98l60-27-25 45q42 45 5 120Q45 105 0 112-45 105-85 40q-37-75 5-120z" fill="#e58a2f" stroke="#5c3823" stroke-width="7"/><g fill="none" stroke="#4b2d20" stroke-width="12"><path d="M-52-64-20-34M52-64 20-34M-62 2l35 10M62 2l-35 10M0-83v35"/></g><circle cx="-38" cy="-12" r="8"/><circle cx="38" cy="-12" r="8"/><path d="M-20 35Q0 58 20 35Q0 28-20 35Z" fill="#503126"/></g>
<!-- doyel bird -->
<g transform="translate(458 655)"><path d="M-72 25Q-42-80 32-48 74-70 90-50L45-24q10 77-56 65-35 32-78 8z" fill="#1e292b"/><path d="M-48 10Q-5-22 35 5L8 32q-35 15-56-22" fill="#f5f5ef"/><path d="M82-51l36 10-32 13" fill="#d6a33b"/><circle cx="62" cy="-43" r="6" fill="#fff"/><path d="M-30 48-45 80M0 45-2 80" stroke="#4e3b2c" stroke-width="6"/></g>
<!-- mango branch -->
<g transform="translate(740 654)"><path d="M-85 58Q-20 0 76-60" stroke="#55753f" stroke-width="12" fill="none"/><g fill="#4f914d"><ellipse cx="-35" cy="16" rx="45" ry="16" transform="rotate(-28 -35 16)"/><ellipse cx="22" cy="-19" rx="45" ry="16" transform="rotate(24 22 -19)"/><ellipse cx="67" cy="-55" rx="40" ry="15" transform="rotate(-30 67 -55)"/></g><path d="M25 4q60-4 58 54-10 52-55 38Q-8 66 25 4Z" fill="#e4b63e" stroke="#8a7c31" stroke-width="6"/></g>
</svg>''')

arts = [v1, v2, v3, v4, v5, v6]
for i, art in enumerate(arts, 1):
    svg_path = OUT / f"v{i}.svg"
    jpg_path = OUT / f"v{i}.jpg"
    svg_path.write_text(art, encoding="utf-8")

    # Render through CairoSVG for consistent gradients and curves, then flatten
    # onto a light canvas because JPEG has no alpha channel.
    png = cairosvg.svg2png(bytestring=art.encode("utf-8"), output_width=W, output_height=H)
    with Image.open(BytesIO(png)).convert("RGBA") as rendered:
        canvas = Image.new("RGB", rendered.size, "#f7f5ef")
        canvas.paste(rendered, mask=rendered.getchannel("A"))
        canvas.save(jpg_path, "JPEG", quality=91, optimize=True, progressive=True)
    print(jpg_path.relative_to(ROOT))
