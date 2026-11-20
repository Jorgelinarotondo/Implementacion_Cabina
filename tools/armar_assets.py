"""Convierte las imágenes exportadas del Figma en js/assets.js (data URLs WebP)."""
import sys, io, base64, json, glob
sys.path.insert(0, 'tools'); from assets_map import M
from PIL import Image
src = sys.argv[1] if len(sys.argv) > 1 else '/tmp/claude-0/fig/'
files = {f[:3]: f for f in [p.split('/')[-1] for p in glob.glob(src + '*_*.*')] if f[:3].isdigit()}
import re as _re
prev = json.loads(_re.search(r'window.ASSETS = (\{.*?\});', open('js/assets.js').read(), _re.S).group(1))
out, meta, total = {}, {}, 0
def enc(im, q):
    b = io.BytesIO(); im.save(b, 'WEBP', quality=q, method=3); return b.getvalue()
for ref, cat, num, t, name, cap in M:
    im = Image.open(src + files[num]); key = f"{ref}/{cat}/{num}"
    if t == 'fondo':
        im = im.convert('RGB'); im.thumbnail((1400, 1400)); data = enc(im, 72)
    else:
        im = im.convert('RGBA'); bb = im.getchannel('A').point(lambda a: 255 if a > 12 else 0).getbbox()
        if bb: im = im.crop(bb)
        im.thumbnail((560, 560)); data = enc(im, 80)
    meta[key] = {'w': im.width, 'h': im.height}
    out[key] = "data:image/webp;base64," + base64.b64encode(data).decode(); total += len(data)
for r in ['marginal', 'casados', 'simuladores', 'relatos']:
    im = Image.open(src + f'ref_{r}.jpg').convert('RGB'); im.thumbnail((1600, 1600)); data = enc(im, 72)
    out[f'{r}/ref'] = "data:image/webp;base64," + base64.b64encode(data).decode(); meta[f'{r}/ref'] = {'w': im.width, 'h': im.height}; total += len(data)
for k, v in prev.items():
    if k not in out: out[k] = v
js = "/* Imágenes exportadas del Figma del equipo (TP TALLER). Generado por tools/armar_assets.py */\nwindow.ASSETS = " + json.dumps(out) + ";\nwindow.ASSETS_META = " + json.dumps(meta) + ";\n"
open('js/assets.js', 'w').write(js)
print(len(out), round(total / 1e6, 2), 'MB raw', round(len(js) / 1e6, 2), 'MB js')
