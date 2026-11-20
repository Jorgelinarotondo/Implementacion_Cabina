"""Calcula los puntos de anclaje de cada prenda (en fracciones del ancho/alto de la imagen).
Uso: python3 tools/anclas.py   → escribe js/anclas.js
Cada prenda se ubica con DOS puntos (A y B) que se hacen coincidir con dos puntos
de la cara o del cuerpo de la persona (ver generador.js → TARGET)."""
import json, re, base64, io, sys, os
import numpy as np
from PIL import Image
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
import assets_map
src = open(os.path.join(HERE, '..', 'js', 'assets.js')).read()
A = json.loads(re.search(r'window.ASSETS = (\{.*?\});', src, re.S).group(1))
T = {f"{r}/{c}/{n}": t for (r, c, n, t, nm, cap) in assets_map.M}
MANUAL = json.load(open(os.path.join(HERE, 'anclas_manual.json'))) if os.path.exists(os.path.join(HERE, 'anclas_manual.json')) else {}

def alpha(k):
    im = Image.open(io.BytesIO(base64.b64decode(A[k].split(',')[1]))).convert('RGBA')
    return np.array(im)[:, :, 3] > 100, im.size

def rows_extent(m):
    ys = np.where(m.any(1))[0]; xs = np.where(m.any(0))[0]
    return ys[0], ys[-1], xs[0], xs[-1]

def ropa(m, W, H):
    y0, y1, x0, x1 = rows_extent(m)
    bw = x1 - x0
    # saltear el gancho de la percha: primera fila con ancho > 30%
    for y in range(y0, y1):
        r = np.where(m[y])[0]
        if r[-1] - r[0] > .3 * bw: yb = y; break
    hh = y1 - yb
    ys = int(yb + .07 * hh)
    r = np.where(m[ys])[0]
    return {"a": [r[0] / W, ys / H], "b": [r[-1] / W, ys / H]}

def pelo(m, W, H):
    y0, y1, x0, x1 = rows_extent(m)
    cx = int((x0 + x1) / 2)
    col = m[:, cx]
    # bajar por el centro hasta salir del pelo → línea del pelo
    y = y0
    while y < y1 and not col[y]: y += 1
    while y < y1 and col[y]: y += 1
    hy = y
    # ancho del hueco unos píxeles más abajo
    def edges(yy):
        row = m[min(yy, H - 1)]
        L = cx
        while L > 0 and not row[L]: L -= 1
        R = cx
        while R < W - 1 and not row[R]: R += 1
        return L, R
    L, R = edges(hy + 2)
    gap = R - L
    ym = int(hy + .25 * gap)
    L2, R2 = edges(ym)
    if L2 <= 0: L2 = L if L > 0 else int(x0 + .12 * (x1 - x0))
    if R2 >= W - 1: R2 = R if R < W - 1 else int(x1 - .12 * (x1 - x0))
    return {"a": [L2 / W, ym / H], "b": [R2 / W, ym / H], "hy": hy / H}

def gorra(m, W, H):
    y0, y1, x0, x1 = rows_extent(m)
    # ancho de la copa al 45% de la altura
    y = int(y0 + .55 * (y1 - y0)); r = np.where(m[y])[0]
    return {"a": [r[0] / W, y1 / H * .0 + (y0 + .8 * (y1 - y0)) / H], "b": [r[-1] / W, (y0 + .8 * (y1 - y0)) / H]}

def lentes(m, W, H):
    y0, y1, x0, x1 = rows_extent(m)
    cx = (x0 + x1) / 2
    out = []
    for lo, hi in ((x0, cx), (cx, x1)):
        sub = m[:, int(lo):int(hi)]
        yy, xx = np.nonzero(sub)
        # sólo las columnas con mucha "altura" (el vidrio), no las patillas
        colh = sub.sum(0)
        keep = colh > .5 * colh.max()
        xs = np.where(keep)[0]
        out.append([(lo + xs.mean()) / W, yy.mean() / H])
    return {"a": out[0], "b": out[1]}

def bbox_top(m, W, H, f=.0):
    y0, y1, x0, x1 = rows_extent(m)
    y = int(y0 + f * (y1 - y0)); r = np.where(m[y])[0]
    return {"a": [r[0] / W, y / H], "b": [r[-1] / W, y / H]}

def bbox_mid(m, W, H):
    y0, y1, x0, x1 = rows_extent(m)
    y = (y0 + y1) / 2
    return {"a": [x0 / W, y / H], "b": [x1 / W, y / H]}

def generic(m, W, H):
    y0, y1, x0, x1 = rows_extent(m)
    return {"a": [x0 / W, y0 / H], "b": [x1 / W, y0 / H], "c": [(x0 + x1) / 2 / W, (y0 + y1) / 2 / H], "h": (y1 - y0) / H, "w": (x1 - x0) / W}

FN = {"ropa": ropa, "pelo": pelo, "gorra": gorra, "casco": gorra, "lentes": lentes,
      "cuello": lambda m, W, H: bbox_top(m, W, H, .02), "barbijo": lambda m, W, H: bbox_top(m, W, H, .05),
      "bigote": bbox_mid, "barba": lambda m, W, H: bbox_top(m, W, H, .02),
      "vincha": bbox_mid, "capucha": bbox_mid, "mano": generic}
out = {}
for k, t in T.items():
    if t == "fondo" or k not in A: continue
    m, (W, H) = alpha(k)
    d = FN.get(t, generic)(m, W, H)
    g = generic(m, W, H); d.setdefault("c", g["c"]); d["bb"] = [g["a"][0], g["a"][1], g["w"], g["h"]]
    if k in MANUAL: d.update(MANUAL[k])
    rnd = lambda v: [rnd(x) for x in v] if isinstance(v, list) else {a: rnd(b) for a, b in v.items()} if isinstance(v, dict) else round(float(v), 4) if isinstance(v, (float, np.floating)) else v
    out[k] = rnd(d)
    out[k]["t"] = t
open(os.path.join(HERE, '..', 'js', 'anclas.js'), 'w').write(
    "/* Puntos de anclaje de cada prenda (fracciones de la imagen). Generado por tools/anclas.py\n   a/b = los dos puntos que se apoyan sobre la persona. Para corregir uno a mano: tools/anclas_manual.json */\nwindow.ANCLAS = " + json.dumps(out) + ";\n")
print(len(out), "anclas")
