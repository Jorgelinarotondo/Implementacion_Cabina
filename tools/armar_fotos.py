"""Genera js/fotos.js con las prendas/escenarios de foto (del Figma) por referencia y categoría."""
import sys, json
sys.path.insert(0, 'tools'); from assets_map import M
out = {}
for ref, cat, num, t, name, cap in M:
    out.setdefault(ref, {}).setdefault(cat, []).append({"id": num, "nombre": name, "caption": cap, "img": f"{ref}/{cat}/{num}", "t": t})
open('js/fotos.js', 'w').write("/* Prendas y escenarios con FOTO real (exportados del Figma). Generado por tools/armar_fotos.py */\nwindow.FOTOS = " + json.dumps(out, ensure_ascii=False, indent=1) + ";\n")
print({r: {c: len(v) for c, v in d.items()} for r, d in out.items()})
