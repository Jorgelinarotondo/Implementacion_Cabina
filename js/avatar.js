/* =====================================================================
   CABINA BEAT · DIBUJO DEL AVATAR (Beat) Y DE LOS ESCENARIOS
   Todo es SVG generado por código: cada prenda es una "receta" (d: {k: ...})
   que se dibuja en capas, igual que la IA arma una imagen con piezas.

   BYTE: la mascota de la muestra, redibujada en vectores a partir de
   byte.ai y pasada de rojo a violeta (ver byteBase / byteBody / byteHead).
   ===================================================================== */
(function () {
  const INK = "#2a1745";
  const SW = 3.2;               // grosor de línea
  const SKIN = "#9a5cf5";       // "piel" de Byte (violeta, como en el Figma)
  const V2 = "#6b35c9", V3 = "#5a2ab0", EYE_INK = "#140a1e";
  let uidN = 0;

  /* ---------- utilidades ---------- */
  const st = (fill, w = SW, extra = "") => `fill="${fill}" stroke="${INK}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round" ${extra}`;
  function shade(hex, amt) {           // aclara (+) u oscurece (-) un color
    let c = hex.replace("#", "");
    if (c.length === 3) c = c.split("").map(x => x + x).join("");
    const n = parseInt(c, 16);
    let r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
    const f = v => Math.max(0, Math.min(255, Math.round(amt > 0 ? v + (255 - v) * amt : v * (1 + amt))));
    return "#" + [f(r), f(g), f(b)].map(v => v.toString(16).padStart(2, "0")).join("");
  }
  function rng(seed) { let s = seed % 2147483647; if (s <= 0) s += 2147483646; return () => (s = s * 16807 % 2147483647) / 2147483647; }

  /* ---------- cuerpo base ---------- */
  const TORSO = "M58,520 C62,430 84,352 140,326 Q200,306 260,326 C316,352 338,430 342,520 Z";
  const torso = (c) => `<path d="${TORSO}" ${st(c)}/>`;
  const clipT = (id) => `<clipPath id="${id}"><path d="${TORSO}"/></clipPath>`;


  /* =================================================================
     ROPA
     ================================================================= */
  const ROPA = {
    tee(d, id) {
      let s = torso(d.c);
      if (d.stripes) { s += `<g clip-path="url(#${id}t)">`; for (let y = 345; y < 520; y += 34) s += `<rect x="40" y="${y}" width="320" height="15" fill="${d.stripes}"/>`; s += `</g><path d="${TORSO}" fill="none" stroke="${INK}" stroke-width="${SW}"/>`; }
      s += `<path d="M164,322 Q200,356 236,322" ${st("none", 5)}/>`;
      return s;
    },
    tank(d) {
      return torso(SKIN) + `<path d="M126,520 L134,372 Q144,334 158,322 Q200,376 242,322 Q256,334 266,372 L274,520 Z" ${st(d.c)}/>
        <path d="M150,440 q10,8 22,2 M228,470 q8,6 18,0" stroke="#c9bfa8" stroke-width="5" fill="none" opacity=".8"/>`;
    },
    track(d) {
      return torso(d.c) + `<path d="M118,350 L76,520 M282,350 L324,520" stroke="${d.s}" stroke-width="12" fill="none"/>
        <path d="M118,350 L76,520 M282,350 L324,520" stroke="${INK}" stroke-width="2" fill="none" opacity=".3"/>
        <path d="M162,326 L164,300 L236,300 L238,326" ${st(shade(d.c, -.2))}/>
        <path d="M200,302 L200,520" stroke="${INK}" stroke-width="4" stroke-dasharray="6 5"/>
        <circle cx="200" cy="350" r="5" fill="#ddd" stroke="${INK}" stroke-width="2"/>`;
    },
    shirt(d, id) {
      let s = torso(d.c);
      if (d.p === "flores") {
        const r = rng(7); s += `<g clip-path="url(#${id}t)">`;
        for (let i = 0; i < 26; i++) { const x = 60 + r() * 280, y = 330 + r() * 190; s += `<g transform="translate(${x},${y})"><circle r="9" fill="#f2c94c"/><circle r="9" cx="12" fill="#eb5757" opacity=".9"/><circle r="5" cx="6" cy="-8" fill="#fff"/></g>`; }
        s += `</g><path d="${TORSO}" fill="none" stroke="${INK}" stroke-width="${SW}"/>`;
      }
      if (d.p === "animal") {
        const r = rng(23); s += `<g clip-path="url(#${id}t)">`;
        for (let i = 0; i < 46; i++) { const x = 60 + r() * 280, y = 320 + r() * 200; s += `<path d="M${x},${y} q8,-10 16,0 q-8,10 -16,0 Z" fill="none" stroke="#3a2210" stroke-width="5"/><circle cx="${x + 8}" cy="${y}" r="3" fill="#8a5a2a"/>`; }
        s += `</g><path d="${TORSO}" fill="none" stroke="${INK}" stroke-width="${SW}"/>`;
      }
      if (d.p === "rayas") { s += `<g clip-path="url(#${id}t)">`; for (let x = 60; x < 350; x += 22) s += `<rect x="${x}" y="300" width="5" height="230" fill="${shade(d.c, -.25)}"/>`; s += `</g><path d="${TORSO}" fill="none" stroke="${INK}" stroke-width="${SW}"/>`; }
      if (d.open) s += `<path d="M174,324 L200,392 L226,324 Z" fill="${SKIN}" stroke="${INK}" stroke-width="4"/>`;
      else s += `<path d="M200,330 L200,520" stroke="${INK}" stroke-width="3"/>` + [360, 400, 440, 480].map(y => `<circle cx="200" cy="${y}" r="4" fill="#fff" stroke="${INK}" stroke-width="2"/>`).join("");
      s += `<path d="M200,334 L158,316 L170,356 Z" ${st(shade(d.c, .15), 4)}/><path d="M200,334 L242,316 L230,356 Z" ${st(shade(d.c, .15), 4)}/>`;
      if (d.tie) s += `<path d="M193,336 L207,336 L211,350 L200,356 L189,350 Z" ${st(d.tie, 3)}/><path d="M192,354 L182,440 L200,460 L210,440 L205,354 Z" transform="rotate(8 200 354)" ${st(d.tie, 3)}/>`;
      return s;
    },
    suit(d) {
      let s = torso(d.c);
      s += `<path d="M168,322 L200,430 L232,322 Z" fill="${d.shirt}" stroke="${INK}" stroke-width="4"/>`;
      if (d.tie) s += `<path d="M192,330 L208,330 L212,346 L200,352 L188,346 Z" ${st(d.tie, 3)}/><path d="M190,350 L${d.wide ? 176 : 184},420 L200,${d.wide ? 446 : 438} L${d.wide ? 224 : 216},420 L210,350 Z" ${st(d.tie, 3)}/>`;
      if (d.bow) s += `<path d="M200,338 L172,324 L172,352 Z M200,338 L228,324 L228,352 Z" ${st(d.bow, 3)}/><circle cx="200" cy="338" r="7" fill="${d.bow}" stroke="${INK}" stroke-width="3"/>`;
      const w = d.wide ? 34 : 22, lap = shade(d.c, -.18);
      s += `<path d="M168,322 L200,432 L${170 - w * .3},400 L${150 - w},350 Z" ${st(lap, 4)}/><path d="M232,322 L200,432 L${230 + w * .3},400 L${250 + w},350 Z" ${st(lap, 4)}/>`;
      s += `<circle cx="200" cy="462" r="6" fill="${shade(d.c, -.4)}"/><circle cx="200" cy="496" r="6" fill="${shade(d.c, -.4)}"/>`;
      s += `<path d="M262,420 L300,416" stroke="${INK}" stroke-width="4"/>`;
      return s;
    },
    jacket(d) {
      return torso(d.c) + `<path d="M176,324 L224,324 L232,520 L168,520 Z" fill="${d.inner}" stroke="${INK}" stroke-width="4"/>
        <path d="M176,324 L150,330 L166,380 L180,370 Z M224,324 L250,330 L234,380 L220,370 Z" ${st(shade(d.c, -.15), 4)}/>
        <rect x="112" y="390" width="44" height="34" rx="4" ${st(shade(d.c, .1), 3)}/><rect x="244" y="390" width="44" height="34" rx="4" ${st(shade(d.c, .1), 3)}/>
        <path d="M120,400 h28 M252,400 h28" stroke="#e8c76a" stroke-width="2" stroke-dasharray="3 3"/>`;
    },
    leather(d) {
      return torso(d.c) + `<path d="M180,324 L220,324 L224,520 L176,520 Z" fill="#2a2a2a" stroke="${INK}" stroke-width="4"/>
        <path d="M180,322 L140,326 L156,392 L184,356 Z M220,322 L260,326 L244,392 L216,356 Z" ${st(shade(d.c, .12), 4)}/>
        <path d="M214,360 L226,520" stroke="#cfcfcf" stroke-width="4"/>
        <path d="M100,420 q20,-30 30,-70 M300,420 q-20,-30 -30,-70" stroke="#fff" stroke-width="5" opacity=".18" fill="none"/>`;
    },
    uniform(d) {
      return torso(d.c) + `<path d="M200,330 L160,316 L172,352 Z M200,330 L240,316 L228,352 Z" ${st(shade(d.c, .15), 4)}/>
        <path d="M200,332 L200,520" stroke="${INK}" stroke-width="3"/>
        <rect x="118" y="386" width="50" height="40" rx="4" ${st(shade(d.c, -.1), 3)}/><rect x="232" y="386" width="50" height="40" rx="4" ${st(shade(d.c, -.1), 3)}/>
        <path d="M120,340 L160,330 L162,346 L126,356 Z M280,340 L240,330 L238,346 L274,356 Z" ${st(shade(d.c, -.3), 3)}/>
        ${d.badge ? `<path d="M257,362 l5,10 11,1 -8,8 2,11 -10,-6 -10,6 2,-11 -8,-8 11,-1 Z" fill="#e1b12c" stroke="${INK}" stroke-width="2"/>` : ""}`;
    },
    overall(d) {
      return torso(d.c) + `<path d="M200,330 L162,318 L172,350 Z M200,330 L238,318 L228,350 Z" ${st(shade(d.c, .15), 4)}/>
        <path d="M200,332 L200,520" stroke="${INK}" stroke-width="3" stroke-dasharray="7 4"/>
        <rect x="120" y="380" width="56" height="44" rx="5" ${st(shade(d.c, -.12), 3)}/><rect x="240" y="378" width="46" height="22" rx="3" fill="#f2f2f2" stroke="${INK}" stroke-width="3"/>
        <path d="M246,389 h34" stroke="${d.c}" stroke-width="4"/>`;
    },
    polo(d) {
      return torso(d.c) + `<path d="M200,334 L166,318 L176,346 Z M200,334 L234,318 L224,346 Z" ${st(shade(d.c, -.08), 4)}/>
        <rect x="192" y="334" width="16" height="50" fill="none" stroke="${INK}" stroke-width="3"/><circle cx="200" cy="348" r="3.5" fill="${INK}"/><circle cx="200" cy="368" r="3.5" fill="${INK}"/>
        <circle cx="256" cy="380" r="15" fill="${d.logo}" stroke="${INK}" stroke-width="3"/><path d="M249,380 h14 M256,373 v14" stroke="${INK}" stroke-width="3"/>`;
    },
    hoodie(d) {
      return torso(d.c) + `<path d="M140,334 Q200,288 260,334 Q236,362 200,364 Q164,362 140,334 Z" ${st(shade(d.c, -.18), 4)}/>
        <path d="M186,360 L182,420 M214,360 L218,420" stroke="${INK}" stroke-width="3"/><circle cx="182" cy="422" r="4" fill="#ddd" stroke="${INK}" stroke-width="2"/><circle cx="218" cy="422" r="4" fill="#ddd" stroke="${INK}" stroke-width="2"/>
        <path d="M136,520 L148,452 L252,452 L264,520" ${st(shade(d.c, -.08), 4)}/>`;
    },
    hazmat(d) {
      return torso(d.c) + `<rect x="160" y="300" width="80" height="36" rx="10" ${st(shade(d.c, -.2), 4)}/>
        <path d="M70,410 Q200,430 330,410" stroke="${d.tape}" stroke-width="18" fill="none"/>
        <path d="M70,410 Q200,430 330,410" stroke="${INK}" stroke-width="2" fill="none" opacity=".4"/>
        <path d="M200,336 L200,520" stroke="${d.tape}" stroke-width="14"/>
        <path d="M118,350 L100,470 M282,350 L300,470" stroke="${d.tape}" stroke-width="12"/>
        <path d="M90,360 q30,10 50,0 M260,470 q30,8 50,-4" stroke="#fff" stroke-width="5" fill="none" opacity=".3"/>`;
    },
    puffer(d) {
      let s = torso(d.c) + `<rect x="158" y="292" width="84" height="46" rx="16" ${st(shade(d.c, -.12), 4)}/>`;
      for (let y = 380; y < 520; y += 38) s += `<path d="M${74 + (y - 380) * .05},${y} Q200,${y + 16} ${326 - (y - 380) * .05},${y}" stroke="${INK}" stroke-width="3.5" fill="none"/>`;
      return s + `<path d="M200,338 L200,520" stroke="${INK}" stroke-width="3.5"/>`;
    },
    raincoat(d) {
      return torso(d.c) + `<path d="M176,322 L140,330 L160,392 L196,350 Z M224,322 L260,330 L240,392 L204,350 Z" ${st(shade(d.c, .12), 4)}/>
        ${[390, 440, 490].map(y => `<circle cx="178" cy="${y}" r="6" fill="${shade(d.c, -.4)}"/><circle cx="222" cy="${y}" r="6" fill="${shade(d.c, -.4)}"/>`).join("")}
        <path d="M80,470 Q200,486 320,470" stroke="${shade(d.c, -.3)}" stroke-width="14" fill="none"/>`;
    },
    dress(d) {
      let s = torso(SKIN) + `<path d="M96,520 C100,440 116,388 132,374 Q166,394 200,374 Q234,394 268,374 C284,388 300,440 304,520 Z" ${st(d.c)}/>`;
      const r = rng(3); for (let i = 0; i < 30; i++) s += `<circle cx="${120 + r() * 160}" cy="${400 + r() * 115}" r="${2 + r() * 3}" fill="none" stroke="#d8cdb8" stroke-width="2"/>`;
      return s + `<path d="M132,374 Q166,394 200,374 Q234,394 268,374" fill="none" stroke="#e2d6bf" stroke-width="6" stroke-dasharray="2 6"/>`;
    },
    vest(d) {
      return torso(d.c) + `<path d="M200,334 L162,318 L172,352 Z M200,334 L238,318 L228,352 Z" ${st(shade(d.c, .1), 4)}/>
        <path d="M66,520 C70,440 88,370 140,334 L176,340 L170,520 Z" ${st(d.v)}/><path d="M334,520 C330,440 312,370 260,334 L224,340 L230,520 Z" ${st(d.v)}/>
        <path d="M72,452 L170,452 M228,452 L330,452" stroke="#e6e6e6" stroke-width="12"/>`;
    },
    chef(d) {
      return torso(d.c) + `<rect x="164" y="300" width="72" height="32" rx="8" ${st(shade(d.c, -.05), 4)}/>
        <path d="M176,334 L244,520" stroke="${INK}" stroke-width="3"/>
        ${[370, 420, 470].map(y => `<circle cx="${178 + (y - 334) * .2}" cy="${y}" r="5" fill="#fff" stroke="${INK}" stroke-width="2.5"/><circle cx="${238 + (y - 334) * .2}" cy="${y}" r="5" fill="#fff" stroke="${INK}" stroke-width="2.5"/>`).join("")}`;
    },
    baton(d, id) {
      let s = torso(d.c) + `<g clip-path="url(#${id}t)">`;
      const r = rng(11); for (let i = 0; i < 40; i++) { const x = 60 + r() * 280, y = 320 + r() * 200; s += `<circle cx="${x}" cy="${y}" r="7" fill="${d.dot}"/><circle cx="${x}" cy="${y}" r="2.5" fill="#f2c94c"/>`; }
      s += `</g><path d="${TORSO}" fill="none" stroke="${INK}" stroke-width="${SW}"/>`;
      return s + `<path d="M162,322 Q180,352 200,346 Q220,352 238,322" ${st("#fff", 4)}/>` + [380, 420, 460, 500].map(y => `<circle cx="200" cy="${y}" r="5" fill="#fff" stroke="${INK}" stroke-width="2"/>`).join("");
    },
    apron(d) {
      return torso(d.c) + `<path d="M166,322 Q200,352 234,322" ${st("none", 5)}/>
        <path d="M168,330 L160,300 M232,330 L240,300" stroke="#eee" stroke-width="7"/>
        <path d="M164,374 L164,334 L236,334 L236,374 L262,520 L138,520 Z" ${st("#f6f3ec", 4)}/>
        <rect x="176" y="430" width="48" height="34" rx="4" fill="none" stroke="${INK}" stroke-width="3"/>`;
    },
    sundress(d, id) {
      let s = torso(SKIN) + `<path d="M120,520 C122,450 132,392 140,372 L150,330 L162,330 L166,372 Q200,388 234,372 L238,330 L250,330 L260,372 C268,392 278,450 280,520 Z" ${st(d.c)}/>`;
      const r = rng(17); s += `<g clip-path="url(#${id}t)">`;
      for (let i = 0; i < 22; i++) { const x = 130 + r() * 140, y = 380 + r() * 140; s += `<circle cx="${x}" cy="${y}" r="6" fill="${d.dot}"/><circle cx="${x}" cy="${y}" r="2" fill="#fff"/>`; }
      return s + `</g>`;
    },
    jersey(d, id) {
      let s = torso(d.c);
      if (d.stripes) { s += `<g clip-path="url(#${id}t)">`; for (let x = 70; x < 340; x += 44) s += `<rect x="${x}" y="300" width="22" height="230" fill="${d.stripes}"/>`; s += `</g><path d="${TORSO}" fill="none" stroke="${INK}" stroke-width="${SW}"/>`; }
      s += `<path d="M170,320 L200,350 L230,320" ${st(d.collar || "#fff", 4)}/>`;
      if (d.num) s += `<text x="200" y="460" text-anchor="middle" font-family="Arial Black,Arial" font-weight="900" font-size="64" fill="${d.numc || "#fff"}" stroke="${INK}" stroke-width="2">${d.num}</text>`;
      return s;
    },
    sweater(d) {
      return torso(d.c) + `<path d="M170,322 L200,392 L230,322 Z" fill="${d.shirt}" stroke="${INK}" stroke-width="4"/>
        <path d="M200,334 L176,322 L184,348 Z M200,334 L224,322 L216,348 Z" ${st(d.shirt, 3)}/>
        <path d="M164,322 L200,400 L236,322" fill="none" stroke="${shade(d.c, -.25)}" stroke-width="9"/>
        <path d="M92,500 L308,500" stroke="${shade(d.c, -.2)}" stroke-width="10" stroke-dasharray="3 5"/>`;
    }
  };

  /* =================================================================
     PELO  → {back, front}
     ================================================================= */
  const cap = (low, v, inner) => `M104,${low} C100,${92 - v} 150,${64 - v} 200,${64 - v} C250,${64 - v} 300,${92 - v} 296,${low} ${inner || `C286,130 250,114 200,114 C150,114 114,130 104,${low}`} Z`;
  const PELO = {
    none: () => ({ back: "", front: "" }),
    buzz: (d) => ({ back: "", front: `<path d="${cap(140, -4)}" fill="${d.c}" opacity=".55"/>` }),
    short: (d) => ({ back: "", front: `<path d="${cap(168, 2, "C292,140 270,120 240,124 C226,108 204,122 190,112 C170,126 150,112 136,126 C118,128 108,148 104,168")}" ${st(d.c)}/>` }),
    slick: (d) => ({ back: "", front: `<path d="${cap(160, 4, "C292,128 262,100 200,98 C140,100 110,128 104,160")}" ${st(d.c)}/>
        <path d="M150,84 Q200,74 252,86 M136,100 Q200,88 268,102" stroke="#fff" stroke-width="4" opacity=".35" fill="none"/>`, mustache: d.mustache ? d.c : null }),
    side: (d) => ({ back: "", front: `<path d="${cap(164, 2, "C292,132 260,112 220,110 L168,92 C150,108 116,128 104,164")}" ${st(d.c)}/><path d="M168,92 L176,70" stroke="${INK}" stroke-width="3"/>` }),
    spiky: (d) => ({ back: "", front: `<path d="${cap(150, 0, "C288,126 250,118 200,118 C150,118 114,126 104,150")}" ${st(d.c)}/>
        <path d="M120,96 L112,62 L146,82 L150,46 L176,74 L196,38 L210,72 L238,44 L240,80 L276,62 L272,98" ${st(d.c, 4)}/>` }),
    messy: (d) => ({ back: "", front: `<path d="${cap(168, 6, "C296,140 280,122 262,126 L250,108 L232,124 L214,104 L196,124 L178,106 L160,126 L140,110 L130,132 C116,136 106,150 104,168")}" ${st(d.c)}/>
        <path d="M150,62 q-6,-20 10,-24 M206,54 q4,-22 22,-18 M250,66 q14,-14 24,-2" fill="none" stroke="${d.c}" stroke-width="5" stroke-linecap="round"/>` }),
    fringe: (d) => ({ back: "", front: `<path d="${cap(176, 8, "C294,150 276,138 266,138 L262,132 C240,136 220,128 200,134 C180,128 160,136 138,132 L134,138 C124,138 106,150 104,176")}" ${st(d.c)}/>` }),
    mullet: (d) => ({ back: `<path d="M120,200 L112,318 Q200,346 288,318 L280,200 Z" ${st(d.c)}/>`, front: `<path d="${cap(176, 6, "C292,140 270,122 246,126 C228,112 208,124 190,114 C170,126 150,114 136,128 C118,132 108,150 104,176")}" ${st(d.c)}/>` }),
    long: (d) => ({ back: `<path d="M92,150 C84,250 84,320 100,352 L300,352 C316,320 316,250 308,150 Z" ${st(d.c)}/>`, front: `<path d="M98,240 C88,110 140,66 200,66 C260,66 312,110 302,240 C290,180 260,128 206,116 L200,96 L194,116 C140,128 110,180 98,240 Z" ${st(d.c)}/>` }),
    curly: (d) => {
      let f = "", b = "";
      for (let a = 190; a <= 350; a += 16) { const r = a * Math.PI / 180; f += `<circle cx="${200 + Math.cos(r) * 92}" cy="${158 + Math.sin(r) * 88}" r="26" ${st(d.c, 4)}/>`; }
      for (let i = 0; i < 5; i++) b += `<circle cx="${104 + i * 3}" cy="${190 + i * 22}" r="24" ${st(d.c, 4)}/><circle cx="${296 - i * 3}" cy="${190 + i * 22}" r="24" ${st(d.c, 4)}/>`;
      return { back: b, front: `<path d="${cap(150, 4)}" fill="${d.c}"/>` + f };
    },
    perm: (d) => {
      let f = "", b = "";
      for (let a = 170; a <= 370; a += 14) { const r = a * Math.PI / 180; f += `<circle cx="${200 + Math.cos(r) * 108}" cy="${150 + Math.sin(r) * 96}" r="32" ${st(d.c, 4)}/>`; }
      b += `<ellipse cx="200" cy="170" rx="150" ry="120" ${st(d.c, 4)}/>`;
      return { back: b, front: `<path d="${cap(150, 10)}" fill="${d.c}"/>` + f };
    },
    braid: (d) => ({ back: `<path d="M110,170 C100,250 104,300 116,330 L150,330 C140,280 136,220 140,170 Z" ${st(d.c)}/>`,
      front: `<path d="${cap(176, 6, "C292,140 262,112 214,110 L200,94 C150,108 112,136 104,176")}" ${st(d.c)}/>` + [0, 1, 2, 3, 4].map(i => `<ellipse cx="${292 - i * 2}" cy="${206 + i * 26}" rx="16" ry="15" ${st(d.c, 3)}/>`).join("") }),
    bun: (d) => ({ back: `<circle cx="200" cy="64" r="36" ${st(d.c)}/>`, front: `<path d="${cap(166, 4, "C292,132 262,106 200,104 C138,106 108,132 104,166")}" ${st(d.c)}/><path d="M140,96 Q200,84 262,98" stroke="#fff" stroke-width="3" opacity=".3" fill="none"/>` })
  };

  /* =================================================================
     CABEZA → {back, front}
     ================================================================= */
  const CABEZA = {
    none: () => ({}),
    cap: (d) => d.back
      ? { front: `<path d="M104,150 C108,70 292,70 296,150 Z" ${st(d.c)}/><path d="M170,150 Q200,130 230,150" ${st(SKIN, 4)}/><circle cx="200" cy="74" r="7" fill="${d.c}" stroke="${INK}" stroke-width="3"/>` }
      : { front: `<path d="M104,150 C108,70 292,70 296,150 Z" ${st(d.c)}/><circle cx="200" cy="74" r="7" fill="${d.c}" stroke="${INK}" stroke-width="3"/><path d="M200,72 L200,150" stroke="${INK}" stroke-width="3" opacity=".5"/>
          <path d="M104,146 Q200,172 296,146 Q302,164 290,170 Q200,194 110,170 Q98,164 104,146 Z" ${st(shade(d.c, -.15))}/>` },
    beanie: (d) => ({ front: `<path d="M100,166 C96,58 304,58 300,166 Z" ${st(d.c)}/><path d="M98,138 Q200,122 302,138 L302,172 Q200,156 98,172 Z" ${st(shade(d.c, .12))}/>
        ${Array.from({ length: 14 }, (_, i) => `<path d="M${108 + i * 14},${134 - Math.sin(i / 13 * Math.PI) * 10} v30" stroke="${INK}" stroke-width="2" opacity=".35"/>`).join("")}` }),
    bandana: (d) => ({ front: `<path d="M100,126 Q200,100 300,126 L298,152 Q200,128 102,152 Z" ${st(d.c)}/>
        <path d="M296,132 L336,118 L326,146 Z M296,140 L332,166 L304,170 Z" ${st(d.c, 4)}/>
        ${[130, 160, 190, 220, 250, 280].map(x => `<circle cx="${x}" cy="${128 - Math.sin((x - 100) / 200 * Math.PI) * 10}" r="3" fill="#fff"/>`).join("")}` }),
    headphones: (d) => ({ front: `<path d="M96,184 C92,52 308,52 304,184" fill="none" stroke="${INK}" stroke-width="14"/><path d="M96,184 C92,52 308,52 304,184" fill="none" stroke="${d.c}" stroke-width="8"/>
        <rect x="78" y="156" width="34" height="58" rx="12" ${st(d.c)}/><rect x="288" y="156" width="34" height="58" rx="12" ${st(d.c)}/>
        <path d="M95,214 Q100,300 170,330" fill="none" stroke="${INK}" stroke-width="3"/>` }),
    hardhat: (d) => ({ front: `<path d="M110,142 C112,58 288,58 290,142 Z" ${st(d.c)}/><path d="M188,64 L188,140 M212,64 L212,140" stroke="${INK}" stroke-width="3" opacity=".5"/>
        <path d="M88,140 L312,140 Q316,158 298,160 L102,160 Q84,158 88,140 Z" ${st(d.c)}/>` }),
    beret: (d) => ({ front: `<ellipse cx="192" cy="96" rx="112" ry="38" transform="rotate(-8 192 96)" ${st(d.c)}/><path d="M196,58 l4,-14" stroke="${INK}" stroke-width="5"/>` }),
    fedora: (d) => ({ front: `<path d="M130,116 Q128,46 200,44 Q272,46 270,116 Z" ${st(d.c)}/><path d="M164,58 Q200,78 236,58" fill="none" stroke="${INK}" stroke-width="3"/>
        <path d="M130,100 L270,100 L270,116 L130,116 Z" fill="${shade(d.c, -.4)}"/><ellipse cx="200" cy="118" rx="134" ry="22" ${st(d.c)}/>` }),
    glassesUp: () => ({ raw: true, front: `<path d="M100,46 Q235,10 370,46" fill="none" stroke="#1b1424" stroke-width="9"/><rect x="104" y="22" width="112" height="58" rx="18" fill="#1b1424"/><rect x="254" y="22" width="112" height="58" rx="18" fill="#1b1424"/>` }),
    glassesUpOld: () => ({ front: `<path d="M134,104 Q200,88 266,104" fill="none" stroke="${INK}" stroke-width="5"/><rect x="132" y="88" width="56" height="30" rx="10" ${st("#2a2a33")}/><rect x="212" y="88" width="56" height="30" rx="10" ${st("#2a2a33")}/>` }),
    rollers: () => ({ front: [["#f28ca6", 132, 98, -30], ["#7fc8e8", 170, 76, -10], ["#f2c94c", 214, 74, 10], ["#9bd27a", 254, 92, 28], ["#f28ca6", 280, 124, 50], ["#7fc8e8", 118, 128, -50]]
        .map(([c, x, y, r]) => `<rect x="${x - 14}" y="${y - 22}" width="28" height="44" rx="10" transform="rotate(${r} ${x} ${y})" ${st(c, 4)}/><path d="M${x - 10},${y} h20" transform="rotate(${r} ${x} ${y})" stroke="${INK}" stroke-width="2"/>`).join("") }),
    scarf: (d) => ({ front: `<path d="M96,200 C84,62 316,62 304,200 L292,206 C284,140 252,116 200,116 C148,116 116,140 108,206 Z" ${st(d.c)}/>
        <path d="M292,200 L318,236 L300,250 Z M296,204 L332,218 L322,240 Z" ${st(d.c, 4)}/>
        ${[140, 180, 220, 260].map(x => `<circle cx="${x}" cy="${92 - Math.sin((x - 100) / 200 * Math.PI) * 4}" r="5" fill="#fff" opacity=".8"/>`).join("")}` }),
    veil: () => ({ back: `<path d="M124,96 Q50,300 36,520 L364,520 Q350,300 276,96 Z" fill="#ffffff" opacity=".6" stroke="#d9d2c4" stroke-width="3"/>`,
        front: `<path d="M138,98 Q200,62 262,98" fill="none" stroke="#d9c38a" stroke-width="6"/>${[150, 172, 200, 228, 250].map((x, i) => `<circle cx="${x}" cy="${[90, 78, 72, 78, 90][i]}" r="6" fill="#fff" stroke="#c9b27c" stroke-width="2"/>`).join("")}` }),
    gasmask: () => ({ back: `<path d="M82,206 C66,36 334,36 318,206 L336,340 Q200,370 64,340 Z" ${st("#8a8f6a")}/>`,
        front: `<path d="M112,206 C108,96 292,96 288,206 C288,262 250,290 200,290 C150,290 112,262 112,206 Z" fill="none" stroke="#6c7150" stroke-width="16"/>
          <path d="M120,170 Q200,140 280,170 L276,258 Q200,300 124,258 Z" ${st("#3b3d36")}/>
          <circle cx="164" cy="190" r="28" ${st("#a9c4cf")}/><circle cx="236" cy="190" r="28" ${st("#a9c4cf")}/>
          <path d="M150,178 l14,-8 M222,178 l14,-8" stroke="#fff" stroke-width="5" opacity=".8"/>
          <path d="M176,236 L224,236 L232,276 L168,276 Z" ${st("#2b2c27", 4)}/><circle cx="200" cy="270" r="26" ${st("#55584a")}/>
          ${[0, 60, 120, 180, 240, 300].map(a => `<circle cx="${200 + Math.cos(a * Math.PI / 180) * 13}" cy="${270 + Math.sin(a * Math.PI / 180) * 13}" r="3" fill="${INK}"/>`).join("")}` }),
    headband: (d) => ({ front: `<path d="M106,140 C110,74 290,74 294,140" fill="none" stroke="${INK}" stroke-width="16"/><path d="M106,140 C110,74 290,74 294,140" fill="none" stroke="${d.c}" stroke-width="11"/>` }),
    sweatband: (d) => ({ front: `<path d="M100,124 Q200,100 300,124 L300,150 Q200,126 100,150 Z" ${st(d.c)}/><path d="M104,136 Q200,112 296,136" stroke="#fff" stroke-width="4" fill="none"/>` }),
    goggles: () => ({ front: `<path d="M100,124 Q200,98 300,124" fill="none" stroke="#3a3a3a" stroke-width="14"/>
        <rect x="134" y="98" width="58" height="40" rx="16" ${st("#7fa8b8")}/><rect x="208" y="98" width="58" height="40" rx="16" ${st("#7fa8b8")}/><path d="M146,108 l14,-4 M220,108 l14,-4" stroke="#fff" stroke-width="4" opacity=".8"/>` })
  };

  /* =================================================================
     ACCESORIOS → {back, neck, face, hand}
     ================================================================= */
  const hand = (x, y) => `<circle cx="${x}" cy="${y}" r="20" ${st(SKIN, 4)}/>`;
  const GLASSES = {
    sun: `<rect x="134" y="168" width="64" height="40" rx="8" ${st("#1e1e24")}/><rect x="204" y="168" width="64" height="40" rx="8" ${st("#1e1e24")}/><path d="M198,182 h6 M134,180 l-30,-2 M268,180 l28,-2" stroke="${INK}" stroke-width="5"/><path d="M144,176 l18,0" stroke="#fff" stroke-width="4" opacity=".5"/>`,
    sport: `<path d="M120,172 Q200,150 282,172 L276,200 Q238,214 206,200 L200,192 L194,200 Q162,214 124,200 Z" ${st("#4fb0c6")}/><path d="M136,176 Q200,160 266,176" stroke="#fff" stroke-width="5" opacity=".6" fill="none"/>`,
    oval: `<ellipse cx="166" cy="188" rx="30" ry="18" ${st("#3a2a4a", 4)} opacity=".95"/><ellipse cx="236" cy="188" rx="30" ry="18" ${st("#3a2a4a", 4)} opacity=".95"/><path d="M196,186 h10" stroke="${INK}" stroke-width="4"/>`,
    aviator: `<path d="M136,174 L196,174 Q198,214 166,214 Q136,212 136,174 Z" ${st("#5a4632", 3)} opacity=".92"/><path d="M206,174 L266,174 Q266,212 236,214 Q204,214 206,174 Z" ${st("#5a4632", 3)} opacity=".92"/><path d="M196,176 Q201,170 206,176 M136,176 l-32,0 M266,176 l30,0" stroke="#c9a24a" stroke-width="4" fill="none"/>`,
    big80: `<rect x="128" y="160" width="74" height="60" rx="18" fill="#cfe3f0" fill-opacity=".35" stroke="${INK}" stroke-width="7"/><rect x="200" y="160" width="74" height="60" rx="18" fill="#cfe3f0" fill-opacity=".35" stroke="${INK}" stroke-width="7"/><path d="M128,176 l-26,-4 M274,176 l24,-4" stroke="${INK}" stroke-width="6"/>`
  };
  const ACC = {
    none: () => ({}),
    glasses: (d) => ({ face: GLASSES[d.s] || GLASSES.sun }),
    earpiece: () => ({ face: `<path d="M300,196 q10,4 6,16 q-6,10 2,20 q8,12 -4,26 Q290,290 250,326" fill="none" stroke="#e8e8e8" stroke-width="4"/><circle cx="298" cy="190" r="7" fill="#e8e8e8" stroke="${INK}" stroke-width="2"/>` }),
    chain: (d) => ({ neck: `<path d="M166,322 Q200,382 234,322" fill="none" stroke="${INK}" stroke-width="12"/><path d="M166,322 Q200,382 234,322" fill="none" stroke="${d.c}" stroke-width="8" stroke-dasharray="9 4"/>` }),
    rosary: (d) => ({ neck: Array.from({ length: 13 }, (_, i) => { const t = i / 12, x = 166 + t * 68, y = 322 + Math.sin(t * Math.PI) * 74; return `<circle cx="${x}" cy="${y}" r="5" fill="${d.c}" stroke="${INK}" stroke-width="2"/>`; }).join("") + `<path d="M200,398 v40 M188,410 h24" stroke="${d.c}" stroke-width="7"/><path d="M200,398 v40 M188,410 h24" stroke="${INK}" stroke-width="1.5" fill="none"/>` }),
    pearls: () => ({ neck: Array.from({ length: 15 }, (_, i) => { const t = i / 14, x = 164 + t * 72, y = 322 + Math.sin(t * Math.PI) * 44; return `<circle cx="${x}" cy="${y}" r="6.5" fill="#fbf7ee" stroke="#9a8f7a" stroke-width="2"/>`; }).join("") }),
    badge: (d) => ({ neck: `<path d="M170,326 L192,420 M230,326 L208,420" stroke="#2a4f8a" stroke-width="6"/><rect x="176" y="414" width="48" height="62" rx="5" ${st(d.c, 3)}/><rect x="186" y="424" width="28" height="24" fill="#9fb3c8"/><path d="M184,458 h32 M184,466 h22" stroke="${INK}" stroke-width="3"/>` }),
    backpack: (d) => ({ back: `<rect x="62" y="330" width="276" height="190" rx="40" ${st(shade(d.c, -.2))}/>`, neck: `<path d="M150,330 L136,520 M250,330 L264,520" stroke="${INK}" stroke-width="22"/><path d="M150,330 L136,520 M250,330 L264,520" stroke="${d.c}" stroke-width="16"/>` }),
    stamps: () => {
      let s = `<g transform="rotate(-8 290 440)"><rect x="232" y="384" width="118" height="110" ${st("#f6eedc", 4)}/>`;
      for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) s += `<rect x="${240 + i * 37}" y="${392 + j * 34}" width="30" height="28" fill="${["#b8433a", "#3b6a9a", "#5a8a4a"][(i + j) % 3]}" stroke="#fff" stroke-width="2" stroke-dasharray="2 2"/>`;
      return { hand: s + `</g>` + hand(250, 490) };
    },
    briefcase: (d) => ({ hand: `<path d="M268,426 q0,-22 26,-22 q26,0 26,22" fill="none" stroke="${INK}" stroke-width="8"/><rect x="236" y="424" width="116" height="84" rx="10" ${st(d.c)}/><path d="M236,450 h116" stroke="${INK}" stroke-width="3"/><rect x="284" y="444" width="20" height="14" fill="#d9b25a" stroke="${INK}" stroke-width="2"/>` + hand(294, 414) }),
    phone: () => ({ hand: `<rect x="268" y="380" width="44" height="96" rx="10" ${st("#3a3d42")}/><rect x="300" y="352" width="8" height="32" rx="3" fill="${INK}"/><rect x="276" y="392" width="28" height="26" fill="#9fc28a"/>${[0, 1, 2].map(r => [0, 1, 2].map(c => `<circle cx="${280 + c * 10}" cy="${432 + r * 12}" r="3" fill="#bbb"/>`).join("")).join("")}` + hand(290, 476) }),
    bouquet: () => {
      let s = `<path d="M200,520 L188,440 M200,520 L200,440 M200,520 L214,440" stroke="#3f7a3a" stroke-width="6"/>`;
      [[176, 432], [200, 420], [224, 432], [188, 446], [212, 446], [200, 438]].forEach(([x, y]) => s += `<circle cx="${x}" cy="${y}" r="17" fill="#fff" stroke="#c7bfae" stroke-width="3"/><circle cx="${x}" cy="${y}" r="5" fill="#f2d16b"/>`);
      return { hand: s + `<path d="M186,480 L214,480 L208,494 L192,494 Z" fill="#f2c2cf" stroke="${INK}" stroke-width="2"/>` + hand(172, 500) + hand(228, 500) };
    },
    ticket: () => ({ hand: `<g transform="rotate(10 290 430)"><rect x="254" y="372" width="76" height="110" ${st("#fff7c2", 4)}/><text x="292" y="398" font-family="Arial Black,Arial" font-size="15" text-anchor="middle" fill="#b3261e">MULTA</text>${[412, 426, 440, 454].map(y => `<path d="M264,${y} h56" stroke="#999" stroke-width="3"/>`).join("")}</g>` + hand(266, 480) }),
    empanadas: () => {
      let s = `<ellipse cx="200" cy="476" rx="96" ry="26" ${st("#f4f1ea")}/>`;
      [[160, 462], [204, 456], [246, 464]].forEach(([x, y]) => s += `<path d="M${x - 30},${y + 6} Q${x},${y - 34} ${x + 30},${y + 6} Z" ${st("#d9a24a", 4)}/><path d="M${x - 24},${y} Q${x},${y - 24} ${x + 24},${y}" fill="none" stroke="#a8702a" stroke-width="3" stroke-dasharray="4 4"/>`);
      return { hand: s + hand(108, 480) + hand(292, 480) };
    },
    folder: () => ({ hand: `<g transform="rotate(-6 280 440)"><rect x="226" y="380" width="120" height="120" rx="4" ${st("#d8c08a", 4)}/><rect x="236" y="372" width="100" height="18" fill="#fff" stroke="${INK}" stroke-width="3"/><text x="286" y="430" font-family="Courier New,monospace" font-weight="bold" font-size="16" text-anchor="middle" fill="${INK}">EXPTE.</text><path d="M246,450 h80 M246,464 h64" stroke="${INK}" stroke-width="3"/></g>` + hand(236, 488) }),
    flashlight: () => ({ back: "", hand: `<path d="M300,400 L380,300 L400,380 Z" fill="#fff6c4" opacity=".55"/><rect x="262" y="398" width="70" height="30" rx="6" transform="rotate(-38 296 412)" ${st("#3a3a3a")}/>` + hand(276, 440) }),
    mic: () => ({ hand: `<rect x="282" y="420" width="16" height="76" rx="6" transform="rotate(-20 290 458)" ${st("#2b2b2b")}/><circle cx="276" cy="410" r="22" ${st("#9a9a9a")}/>${[-8, 0, 8].map(o => `<path d="M${262 + o},400 l14,20" stroke="#666" stroke-width="2"/>`).join("")}` + hand(300, 486) }),
    diary: () => ({ hand: `<g transform="rotate(-8 286 440)"><rect x="234" y="384" width="104" height="128" rx="8" ${st("#c9407a")}/><rect x="242" y="384" width="10" height="128" fill="#a32e60"/><path d="M286,428 c-12,-14 -30,0 -16,14 l16,14 16,-14 c14,-14 -4,-28 -16,-14 Z" fill="#ffd1e3"/><rect x="330" y="440" width="12" height="18" rx="3" fill="#e8c76a" stroke="${INK}" stroke-width="2"/></g>` + hand(244, 500) }),
    ball: () => ({ hand: `<circle cx="296" cy="450" r="46" ${st("#fff")}/><path d="M296,432 l17,12 -6,20 -22,0 -6,-20 Z" fill="${INK}"/><path d="M296,432 v-28 M313,444 l26,-8 M307,464 l14,22 M285,464 l-14,22 M279,444 l-26,-8" stroke="${INK}" stroke-width="3"/>` + hand(254, 488) }),
    trophy: () => ({ hand: `<path d="M260,380 L332,380 Q332,436 296,446 Q260,436 260,380 Z" ${st("#e1b12c")}/><path d="M260,392 q-24,0 -20,22 q4,16 22,14 M332,392 q24,0 20,22 q-4,16 -22,14" fill="none" stroke="${INK}" stroke-width="4"/><rect x="286" y="446" width="20" height="26" fill="#e1b12c" stroke="${INK}" stroke-width="3"/><rect x="268" y="470" width="56" height="18" rx="3" ${st("#5a3a22", 3)}/>` + hand(250, 486) }),
    remote: () => ({ hand: `<rect x="270" y="392" width="40" height="104" rx="12" transform="rotate(12 290 444)" ${st("#2b2b2b")}/><circle cx="292" cy="410" r="6" fill="#e5432d" transform="rotate(12 290 444)"/>${[0, 1, 2].map(r => `<rect x="${280}" y="${428 + r * 16}" width="22" height="8" rx="3" fill="#888" transform="rotate(12 290 444)"/>`).join("")}` + hand(284, 494) }),
    shoe: () => ({ hand: `<path d="M228,452 L232,410 L262,410 Q270,440 316,448 Q344,454 344,474 L236,474 Q226,470 228,452 Z" ${st("#3a2416")}/><path d="M236,474 L344,474" stroke="#1a100a" stroke-width="8"/><path d="M246,420 l14,8 M244,432 l16,6" stroke="#d9c7a8" stroke-width="3"/>` + hand(300, 488) }),
    scarf2: (d) => ({ neck: `<path d="M150,330 Q200,362 250,330 L256,350 Q200,384 144,350 Z" ${st(d.c)}/><path d="M220,350 L236,470 L262,466 L248,350 Z" ${st(d.c)}/>${[384, 410, 436].map(y => `<path d="M${225 + (y - 350) * .12},${y} L${253 + (y - 350) * .1},${y}" stroke="${d.s}" stroke-width="8"/>`).join("")}` }),
    radio: (d) => ({ hand: `<rect x="252" y="390" width="78" height="96" rx="10" ${st(d.c)}/><rect x="314" y="344" width="8" height="50" fill="${INK}"/><rect x="262" y="400" width="58" height="22" fill="#c9d6a0" stroke="${INK}" stroke-width="2"/>${[0, 1, 2, 3].map(i => `<path d="M264,${436 + i * 10} h54" stroke="#777" stroke-width="4"/>`).join("")}` + hand(258, 484) })
  };

  /* =================================================================
     COMPOSICIÓN DEL AVATAR
     sel = { ropa:item, pelo:item, cabeza:item, accesorio:item }
     ================================================================= */
  /* =================================================================
     BYTE · la mascota de la muestra (redibujada del archivo byte.ai, en violeta)
     viewBox 0 0 460 700 · cabeza ovalada (235,185) · cuerpo 106–364 × 345–582
     ================================================================= */
  const HEAD_T = "translate(235,185) scale(2.3,1.8) translate(-200,-172)";   // prendas de cabeza → óvalo de Byte
  const BODY_T = "matrix(1.24,0,0,1.3,-11.9,-76)";                            // prendas de cuerpo → torso de Byte
  const byteBase = () => `<ellipse cx="235" cy="652" rx="140" ry="36" fill="#000" opacity=".1"/>
      <path d="M140,560 C138,600 150,650 172,656 C192,660 200,630 205,575 Z" fill="${SKIN}"/>
      <path d="M330,560 C332,600 320,650 298,656 C278,660 270,630 265,575 Z" fill="${SKIN}"/>
      <path d="M152,362 C110,410 70,470 66,535 C80,552 110,552 130,545 L140,420 Z" fill="${SKIN}"/>
      <path d="M318,362 C360,410 400,470 404,535 C390,552 360,552 340,545 L330,420 Z" fill="${SKIN}"/>`;
  const byteBody = () => `<path d="M150,352 Q235,334 320,352 C352,385 368,470 364,530 C360,575 300,584 235,582 C170,584 110,575 106,530 C102,470 118,385 150,352 Z" fill="${V2}"/>
      <path d="M290,384 Q294,406 316,410 Q294,414 290,436 Q286,414 264,410 Q286,406 290,384 Z" fill="#fff"/>`;
  const byteHead = () => `<ellipse cx="235" cy="185" rx="225" ry="175" fill="${SKIN}"/>`;
  const byteFace = (mustache) => `<ellipse cx="133" cy="182" rx="82" ry="62" fill="#fff"/><ellipse cx="342" cy="182" rx="82" ry="62" fill="#fff"/>
      <circle cx="170" cy="190" r="30" fill="${EYE_INK}"/><circle cx="306" cy="188" r="30" fill="${EYE_INK}"/>
      <path d="M51,172 A82,62 0 0 1 215,172 Z" fill="${V3}"/><path d="M260,172 A82,62 0 0 1 424,172 Z" fill="${V3}"/>
      <path d="M68,106 Q108,82 156,80 M314,84 Q366,84 402,108 M203,257 Q240,253 272,247" fill="none" stroke="${EYE_INK}" stroke-width="2.6" stroke-linecap="round"/>
      ${mustache ? `<g transform="${HEAD_T}"><path d="M172,226 Q186,212 201,222 Q216,212 230,226 Q216,234 201,228 Q186,234 172,226 Z" fill="${mustache}"/></g>` : ""}`;
  const BYTE_GLASSES = {
    sun: `<rect x="40" y="128" width="186" height="104" rx="26" fill="#1b1424"/><rect x="246" y="128" width="186" height="104" rx="26" fill="#1b1424"/><path d="M224,165 h24 M40,160 L16,150 M432,160 L456,150" stroke="#1b1424" stroke-width="10"/><path d="M62,150 h60" stroke="#fff" stroke-width="7" opacity=".35"/>`,
    sport: `<path d="M18,150 Q235,90 452,150 L440,215 Q345,252 250,215 L235,200 L220,215 Q125,252 30,215 Z" fill="#43b3cf" stroke="${INK}" stroke-width="4"/><path d="M50,150 Q235,105 420,150" stroke="#fff" stroke-width="8" opacity=".55" fill="none"/>`,
    oval: `<ellipse cx="133" cy="182" rx="92" ry="56" fill="#2e2140" opacity=".93"/><ellipse cx="342" cy="182" rx="92" ry="56" fill="#2e2140" opacity=".93"/><path d="M224,178 h28" stroke="#2e2140" stroke-width="9"/>`,
    aviator: `<path d="M44,138 L226,138 Q230,248 135,248 Q44,244 44,138 Z" fill="#4a3826" opacity=".9" stroke="#c9a24a" stroke-width="6"/><path d="M246,138 L428,138 Q428,244 337,248 Q242,248 246,138 Z" fill="#4a3826" opacity=".9" stroke="#c9a24a" stroke-width="6"/><path d="M226,142 Q236,128 246,142 M44,140 L14,136 M428,140 L458,136" stroke="#c9a24a" stroke-width="6" fill="none"/>`,
    big80: `<rect x="34" y="112" width="196" height="140" rx="42" fill="#d6e6f5" fill-opacity=".35" stroke="${EYE_INK}" stroke-width="13"/><rect x="240" y="112" width="196" height="140" rx="42" fill="#d6e6f5" fill-opacity=".35" stroke="${EYE_INK}" stroke-width="13"/><path d="M34,150 L12,140 M436,150 L458,140" stroke="${EYE_INK}" stroke-width="11"/>`
  };
  const BYTE_EAR = `<path d="M448,210 q14,10 4,26 q-10,14 2,28 q8,16 -8,30 Q400,330 330,372" fill="none" stroke="#e8e8e8" stroke-width="6"/><circle cx="446" cy="204" r="11" fill="#e8e8e8" stroke="${INK}" stroke-width="3"/>`;

  /* ---------- prendas con FOTO real (recortes PNG del Figma) ----------
     Cada tipo tiene una "caja" sobre Byte donde se encaja la foto. */
  const BOX = {
    ropa: [25, 330, 420, 330, "top"], pelo: [-15, -45, 490, 760, "top"], barba: [45, 100, 370, 330, "mid"],
    gorra: [5, -70, 450, 232, "bottom"], hebilla: [80, 20, 140, 60, "mid"], casco: [25, -80, 410, 240, "bottom"], vincha: [40, -30, 380, 170, "mid"],
    capucha: [-25, -45, 510, 480, "mid"], bigote: [160, 212, 150, 62, "mid"], lentes: [22, 112, 426, 150, "mid"],
    cuello: [125, 334, 220, 240, "top"], barbijo: [100, 205, 270, 230, "top"], mano: [292, 380, 190, 230, "mid"]
  };
  const LAYER = { ropa: "ropa", cuello: "cuello", barba: "barba", pelo: "pelo", capucha: "capucha", gorra: "cabeza", casco: "cabeza", vincha: "cabeza", hebilla: "cabeza", lentes: "cara", barbijo: "cara", bigote: "cara", mano: "mano" };
  /* Cada foto tiene dos puntos de anclaje (js/anclas.js: a y b, en fracciones de la imagen) que se apoyan
     sobre dos puntos de Byte. Así el pelo calza en la cabeza, los anteojos en los ojos y la ropa en los hombros,
     sin deformar la foto (sólo se escala y se gira). */
  const BT = {
    ropa: [[104, 362], [366, 362]], pelo: [[62, 200], [408, 200]], patillas: null,
    gorra: [[30, 104], [440, 104]], casco: [[22, 100], [448, 100]], vincha: [[34, 92], [436, 92]], vincha_banda: [[34, 92], [436, 92]],
    vincha_arco: [[4, 140], [466, 140]], hebilla: [[86, 62], [196, 36]],
    capucha: [[36, 182], [434, 182]], capucha_cerrada: [[6, 170], [464, 170]],
    lentes: [[133, 182], [342, 182]], bigote: [[192, 238], [284, 233]], barba: [[178, 262], [294, 257]],
    barbijo: [[96, 228], [374, 228]], cuello: [[158, 334], [312, 334]], cadena_gruesa: [[140, 330], [330, 330]], auriculares: [[146, 374], [324, 374]],
    lentesByte: [[26, 186], [444, 186]]
  };
  let clipN = 0;
  function anchoredSVG(src, w, h, A, B, P, Q, crop) {
    const ax = A[0] * w, ay = A[1] * h, bx = B[0] * w, by = B[1] * h;
    const s = Math.hypot(Q[0] - P[0], Q[1] - P[1]) / (Math.hypot(bx - ax, by - ay) || 1);
    const ang = (Math.atan2(Q[1] - P[1], Q[0] - P[0]) - Math.atan2(by - ay, bx - ax)) * 180 / Math.PI;
    let clip = "", cattr = "";
    if (crop) { const id = "cp" + (++clipN); clip = `<clipPath id="${id}"><rect x="0" y="${crop[0] * h}" width="${w}" height="${(crop[1] - crop[0]) * h}"/></clipPath>`; cattr = ` clip-path="url(#${id})"`; }
    return `<g transform="translate(${P[0].toFixed(1)},${P[1].toFixed(1)}) rotate(${ang.toFixed(2)}) scale(${s.toFixed(4)}) translate(${(-ax).toFixed(1)},${(-ay).toFixed(1)})">${clip}<image href="${src}" x="0" y="0" width="${w}" height="${h}"${cattr}/></g>`;
  }
  /* ---------- AJUSTES FINOS (js/ajustes.js, se hacen con ajustar_prendas.html) ----------
     Cada prenda puede tener un ajuste extra: mover (dx, dy), escalar (s), girar (r) y espejar (f).
     Se aplica alrededor de un centro según el tipo de prenda. */
  const AJ_C = { ropa: [235, 460], pelo: [235, 120], barba: [236, 262], gorra: [235, 70], casco: [235, 70], vincha: [235, 80],
    hebilla: [140, 50], capucha: [235, 190], bigote: [238, 236], lentes: [238, 182], cuello: [235, 360], barbijo: [235, 228],
    mano: [398, 590], pecho: [205, 452] };
  let AJ = "";
  function ajusteT(it) {
    const a = (window.AJUSTES || {})[it.img];
    if (!a) return "";
    const an = (window.ANCLAS || {})[it.img];
    let t = (an && an.t) || it.t;
    if (an && an.to === "pecho") t = "pecho";
    const c = AJ_C[t] || [235, 350];
    const dx = +a.dx || 0, dy = +a.dy || 0, sc = +a.s || 1, r = +a.r || 0, f = a.f === -1 ? -1 : 1;
    if (!dx && !dy && sc === 1 && !r && f === 1) return "";
    return `translate(${(c[0] + dx).toFixed(1)},${(c[1] + dy).toFixed(1)}) rotate(${r.toFixed(1)}) scale(${(sc * f).toFixed(4)},${sc.toFixed(4)}) translate(${-c[0]},${-c[1]})`;
  }
  function photoSVG(it) {
    AJ = ajusteT(it);
    const r = photoSVGraw(it);
    if (!AJ || !r || typeof r !== "string") return r;   // la peluca ya trae el ajuste adentro
    return `<g transform="${AJ}">${r}</g>`;
  }
  /* La ropa se recorta con la silueta de Byte (torso + brazos): nada sobresale y no queda el borde recto de la foto. */
  const CUERPO_CLIP = `<path d="M152,362 C110,410 70,470 66,535 C80,552 110,552 130,545 L140,420 Z"/><path d="M318,362 C360,410 400,470 404,535 C390,552 360,552 340,545 L330,420 Z"/><path d="M150,352 Q235,334 320,352 C352,385 368,470 364,530 C360,575 300,584 235,582 C170,584 110,575 106,530 C102,470 118,385 150,352 Z"/>`;
  function ropaRecortada(x, id) {
    const cfg = window.CABINA_CONFIG || {};
    if (!x || cfg.recortarRopaAlCuerpo === false) return x;
    return `<defs><clipPath id="${id}rc">${CUERPO_CLIP}</clipPath></defs><g clip-path="url(#${id}rc)">${x}</g>`;
  }
  function photoSVGraw(it) {
    const src = assetURL(it.img);
    if (!src) return "";
    const an = (window.ANCLAS || {})[it.img], meta = (window.ASSETS_META || {})[it.img];
    const t = (an && an.t) || it.t;
    if (an && meta) {
      const w = meta.w, h = meta.h;
      if (t === "mano" || an.to === "pecho") {   // objeto en la mano (o colgado en el pecho)
        const pecho = an.to === "pecho", alto = Math.min(190, (an.alto || 2) * (pecho ? 58 : 66)), sc = alto / h, ww = w * sc;
        const cx = pecho ? 205 : 398, top = pecho ? 452 - alto / 2 : 492;
        return `<image href="${src}" x="${(cx - ww / 2).toFixed(1)}" y="${top.toFixed(1)}" width="${ww.toFixed(1)}" height="${alto.toFixed(1)}"/>`;
      }
      if (an.partes) return an.partes.map(pt => { const key = pt.to || an.to || t; const tg = key in BT ? BT[key] : BT[t]; return tg ? anchoredSVG(src, w, h, pt.a || an.a, pt.b || an.b, tg[0], tg[1], pt.y) : ""; }).join("");
      if (t === "pelo" && an.hl != null && an.a) {
        // PELUCA sobre Byte: la parte de atrás va detrás de la cabeza y del cuerpo; sólo el flequillo/coronilla va
        // por delante, recortado a la cabeza y por encima de las cejas. El tamaño se limita para que no quede gigante.
        const holeW = Math.abs(an.b[0] - an.a[0]) * w, bbW = (an.bb ? an.bb[2] : 1) * w;
        const s = Math.min(430 / holeW, 560 / bbW);
        const cx = (an.a[0] + an.b[0]) / 2 * w, hy = an.hl * h;
        const T = (AJ ? AJ + " " : "") + `translate(235,46) scale(${s.toFixed(4)}) translate(${(-cx).toFixed(1)},${(-hy).toFixed(1)})`;
        const crop = an.partes ? an.partes[0].y : null;
        const id = "hp" + (++clipN);
        let cl = "", ca = "";
        if (crop) { cl = `<clipPath id="${id}c"><rect x="0" y="${crop[0] * h}" width="${w}" height="${(crop[1] - crop[0]) * h}"/></clipPath>`; ca = ` clip-path="url(#${id}c)"`; }
        const im = `<image href="${src}" x="0" y="0" width="${w}" height="${h}"${ca}/>`;
        let extra = "";
        if (an.partes) an.partes.slice(1).forEach(pt => { const tg = BT[pt.to]; if (tg) extra += anchoredSVG(src, w, h, pt.a, pt.b, tg[0], tg[1], pt.y); });
        if (AJ && extra) extra = `<g transform="${AJ}">${extra}</g>`;
        return { back: `<g transform="${T}">${cl}${im}</g>`,
          front: `<defs><clipPath id="${id}h"><ellipse cx="235" cy="185" rx="226" ry="176"/></clipPath><clipPath id="${id}t"><rect x="-60" y="-200" width="600" height="300"/></clipPath></defs>
            <g clip-path="url(#${id}t)"><g clip-path="url(#${id}h)"><g transform="${T}">${im}</g></g></g>`, cara: extra };   // bigote/barba de la peluca: por delante de la cara
      }
      const tg = BT[an.to] || BT[t];
      if (tg && an.a) return anchoredSVG(src, w, h, an.a, an.b, tg[0], tg[1]);
    }
    const [bx, by, bw, bh, al] = BOX[it.t] || BOX.mano;   // fotos propias sin anclas (img/): caja aproximada
    const par = "xMid" + (al === "top" ? "YMin" : al === "bottom" ? "YMax" : "YMid") + " meet";
    return `<image href="${src}" x="${bx}" y="${by}" width="${bw}" height="${bh}" preserveAspectRatio="${par}"/>`;
  }
  // una prenda puede venir del Figma (clave en ASSETS) o ser un archivo propio en img/ (ruta)
  const assetURL = (key) => key ? ((window.ASSETS || {})[key] || (/\.(png|jpe?g|webp|gif)$/i.test(key) ? key : null)) : null;

  /* Con anteojos de foto, el centro de los ojos (entre los dos vidrios) no se dibuja: así no asoma el blanco por el puente */
  /* Vestidos largos: con "libre": true en sus anclas, la falda puede pasar el borde del cuerpo (cae sobre las piernas) */
  function sinRecorte(it) { return !!(it && it.img && ((window.ANCLAS || {})[it.img] || {}).libre); }
  function conLentesFoto(sel) {
    return [sel.accesorio, sel.cabeza].some(it => { if (!it || !it.img) return false; const an = (window.ANCLAS || {})[it.img] || {}; return (an.t || it.t) === "lentes" && !an.claro; });   // los de vidrio transparente ("claro") dejan ver los ojos enteros
  }
  function avatarSVG(sel = {}, opt = {}) {
    const id = "av" + (++uidN);
    const g = (it) => (it && it.d) || { k: "none" };
    const r = g(sel.ropa), p = g(sel.pelo), c = g(sel.cabeza), a = g(sel.accesorio);
    const hair = (PELO[p.k] || PELO.none)(p) || {};
    const head = (CABEZA[c.k] || CABEZA.none)(c) || {};
    const acc = (ACC[a.k] || ACC.none)(a) || {};
    if (opt.overlayOnly) // solo lo que va sobre la cara real (modo laboratorio): coordenadas de cabeza redonda
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 520">${head.front || ""}${acc.face || ""}</svg>`;
    // capas de foto
    const P = {};
    for (const it of [sel.ropa, sel.pelo, sel.cabeza, sel.accesorio]) if (it && it.img) { const an = (window.ANCLAS || {})[it.img], t = (an && an.t) || it.t, L = (an && an.to === "pecho") ? "mano" : (LAYER[t] || "mano"); const r = photoSVG(it); if (typeof r === "string") P[L] = (P[L] || "") + r; else { P.peloBack = (P.peloBack || "") + r.back; P[L] = (P[L] || "") + r.front; if (r.cara) P.cara = (P.cara || "") + r.cara; } }
    const ropa = P.ropa || (r.k === "none" || !ROPA[r.k] ? "" : ROPA[r.k](r, id));
    const hideHairFront = c.k === "gasmask";
    const H = (x) => x ? `<g transform="${HEAD_T}">${x}</g>` : "";
    const B = (x) => x ? `<g transform="${BODY_T}">${x}</g>` : "";
    const face = a.k === "glasses" ? (BYTE_GLASSES[a.s] || BYTE_GLASSES.sun) : a.k === "earpiece" ? BYTE_EAR : "";
    const body = `
      <defs>${clipT(id + "t")}</defs>
      ${P.peloBack || ""}${B(acc.back)}${H(hair.back)}${H(head.back)}
      ${byteBase()}
      ${P.ropa ? byteBody().split("\n")[0] + (sinRecorte(sel.ropa) ? P.ropa : ropaRecortada(P.ropa, id)) : ropa ? B(ropa) : byteBody()}
      ${B(acc.neck)}${P.cuello || ""}
      ${byteHead()}
      ${P.pelo || ""}
      ${conLentesFoto(sel) ? `<defs><clipPath id="${id}lf"><path d="M-60,-200 H530 V800 H-60 Z M188,112 H286 V244 H188 Z" clip-rule="evenodd"/></clipPath></defs><g clip-path="url(#${id}lf)">${byteFace(hair.mustache)}</g>` : byteFace(hair.mustache)}
      ${P.barba || ""}
      ${hideHairFront ? "" : H(hair.front)}
      ${P.capucha || ""}
      ${head.raw ? head.front : H(head.front)}${P.cabeza || ""}
      ${face}${P.cara || ""}
      ${B(acc.hand)}${P.mano || ""}`;
    if (opt.inner) return body;
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-40 -100 540 820" ${opt.attrs || ""}>${body}</svg>`;
  }

  /* Ícono de una prenda sola (para la tira de opciones) */
  function itemIconSVG(cat, item) {
    if (item && item.img && assetURL(item.img)) return `<img class="ph" src="${assetURL(item.img)}" alt="">`;
    const sel = { [cat]: item };
    const k = item && item.d && item.d.k;
    let vb = { ropa: "30 330 410 300", pelo: "-30 -50 520 340", cabeza: "-30 -60 520 340", accesorio: "0 300 470 330" }[cat];
    if (cat === "accesorio" && (k === "glasses" || k === "earpiece")) vb = "-10 60 490 260";
    if (cat === "accesorio" && (k === "chain" || k === "rosary" || k === "pearls" || k === "badge" || k === "scarf2")) vb = "60 320 350 300";
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}">${avatarSVG(sel, { inner: true })}</svg>`;
  }

  /* =================================================================
     ESCENARIOS (viewBox 0 0 1000 800) · el avatar va abajo al centro
     ================================================================= */
  const S = {
    sky: (a, b) => { const gid = "skyg" + (++uidN); return `<defs><linearGradient id="${gid}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient></defs><rect width="1000" height="800" fill="url(#${gid})"/>`; },
    floor: (y, c) => `<rect x="0" y="${y}" width="1000" height="${800 - y}" fill="${c}"/><path d="M0,${y} H1000" stroke="${INK}" stroke-width="5"/>`,
    win: (x, y, w, h, c, light) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${light || "#f7d77a"}" stroke="${INK}" stroke-width="4"/><path d="M${x + w / 2},${y} v${h} M${x},${y + h / 2} h${w}" stroke="${c || INK}" stroke-width="3"/>`
  };
  const SCENES = {
    prisonYard: () => S.sky("#9fb3b8", "#d9d2bd") + `<rect x="0" y="250" width="1000" height="380" fill="#a49b86" stroke="${INK}" stroke-width="5"/>
      ${Array.from({ length: 11 }, (_, i) => `<path d="M${i * 100},250 v380" stroke="#8a8170" stroke-width="3"/>`).join("")}
      <path d="M0,236 ${Array.from({ length: 50 }, (_, i) => `L${i * 20 + 10},${i % 2 ? 226 : 246}`).join(" ")}" fill="none" stroke="#444" stroke-width="3"/>
      <rect x="820" y="90" width="110" height="160" fill="#7d7566" stroke="${INK}" stroke-width="5"/><path d="M800,90 L875,40 L950,90 Z" fill="#5a5246" stroke="${INK}" stroke-width="5"/><rect x="845" y="110" width="60" height="40" fill="#f2e28a" stroke="${INK}" stroke-width="4"/>
      <path d="M60,420 q40,-20 80,0 M600,380 q30,-14 70,4" stroke="#7a2d1e" stroke-width="10" fill="none" opacity=".5"/>
      <text x="80" y="360" font-family="Arial Black,Arial" font-size="44" fill="#6a2a1a" opacity=".55" transform="rotate(-4 80 360)">SAN ONOFRE</text>
      ${S.floor(630, "#bfae8c")}`,
    cell: () => `<rect width="1000" height="800" fill="#b9b49f"/><rect x="0" y="0" width="1000" height="640" fill="#c8c3a8"/>
      ${Array.from({ length: 30 }, (_, i) => `<path d="M${(i * 137) % 1000},${(i * 89) % 600} q20,8 30,-6" stroke="#9a9580" stroke-width="5" fill="none"/>`).join("")}
      <rect x="40" y="420" width="220" height="70" fill="#8a8a8a" stroke="${INK}" stroke-width="5"/><rect x="50" y="400" width="200" height="30" rx="10" fill="#e9e3d0" stroke="${INK}" stroke-width="4"/>
      <rect x="760" y="120" width="120" height="90" fill="#dfe8ec" stroke="${INK}" stroke-width="5"/>${[780, 800, 820, 840, 860].map(x => `<path d="M${x},120 v90" stroke="${INK}" stroke-width="6"/>`).join("")}
      ${S.floor(640, "#9d9784")}
      ${Array.from({ length: 13 }, (_, i) => `<rect x="${i * 80 + 4}" y="0" width="16" height="800" fill="#4a4d52" stroke="${INK}" stroke-width="3" opacity=".88"/>`).join("")}
      <rect x="0" y="40" width="1000" height="18" fill="#4a4d52" stroke="${INK}" stroke-width="3"/>`,
    corridor: () => `<rect width="1000" height="800" fill="#bfc6c2"/><path d="M0,0 L380,260 L620,260 L1000,0 Z" fill="#a7b0ac" stroke="${INK}" stroke-width="4"/>
      <path d="M0,800 L380,520 L620,520 L1000,800 Z" fill="#8f938a" stroke="${INK}" stroke-width="4"/><rect x="380" y="260" width="240" height="260" fill="#dfe6e2" stroke="${INK}" stroke-width="4"/>
      ${[0, 1, 2].map(i => `<path d="M${40 + i * 110},${30 + i * 75} L${40 + i * 110},${760 - i * 75} L${110 + i * 100},${710 - i * 70} L${110 + i * 100},${78 + i * 70} Z" fill="#6a7570" stroke="${INK}" stroke-width="4"/><path d="M${960 - i * 110},${30 + i * 75} L${960 - i * 110},${760 - i * 75} L${890 - i * 100},${710 - i * 70} L${890 - i * 100},${78 + i * 70} Z" fill="#6a7570" stroke="${INK}" stroke-width="4"/>`).join("")}
      <rect x="440" y="276" width="120" height="14" fill="#fff" opacity=".9"/>`,
    squat: () => `<rect width="1000" height="800" fill="#b8a888"/>
      ${Array.from({ length: 16 }, (_, i) => `<path d="M${(i * 173) % 950},${(i * 97) % 560} q30,-20 60,4 q20,30 -16,40 q-40,6 -44,-44 Z" fill="#d6c9a8" stroke="#8f7f60" stroke-width="3"/>`).join("")}
      <rect x="700" y="100" width="190" height="300" fill="#4a6a6a" stroke="${INK}" stroke-width="6"/><path d="M795,100 v300 M700,250 h190" stroke="${INK}" stroke-width="5"/><path d="M712,112 l70,120 M808,112 l70,120" stroke="#cfe3e0" stroke-width="5" opacity=".5"/>
      <path d="M60,120 h160 v220 h-160 Z" fill="none" stroke="#6a5a40" stroke-width="6" stroke-dasharray="14 8"/>
      ${S.floor(600, "#7a6a4c")}<rect x="40" y="610" width="300" height="70" rx="14" fill="#c9c1a2" stroke="${INK}" stroke-width="5"/><path d="M60,630 h260" stroke="#a89f80" stroke-width="5"/>`,
    rooftop: () => S.sky("#f2b46a", "#f7dcb0") + `${[[0, 330, 90, 310], [90, 380, 120, 260], [210, 300, 80, 340], [700, 320, 110, 320], [810, 280, 80, 360], [890, 360, 110, 280]].map(([x, y, w, h]) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#7a6a5a" stroke="${INK}" stroke-width="4"/>`).join("")}
      <rect x="90" y="180" width="140" height="120" rx="10" fill="#d6d2c8" stroke="${INK}" stroke-width="5"/><path d="M110,300 v80 M210,300 v80" stroke="${INK}" stroke-width="6"/>
      <rect x="760" y="160" width="130" height="110" rx="10" fill="#8aa7b5" stroke="${INK}" stroke-width="5"/><path d="M780,270 v60 M870,270 v60" stroke="${INK}" stroke-width="6"/>
      <path d="M600,180 v-120 M560,90 h80 M570,120 h60" stroke="${INK}" stroke-width="5"/>
      <path d="M300,420 Q400,400 500,430 T700,420" stroke="#fff" stroke-width="4" fill="none"/>${[340, 400, 460, 540, 620].map(x => `<rect x="${x}" y="${420 + Math.sin(x) * 6}" width="26" height="40" fill="${["#e6584a", "#4a7ab5", "#f2c94c"][x % 3]}"/>`).join("")}
      ${S.floor(600, "#a8826a")}${Array.from({ length: 10 }, (_, i) => `<path d="M${i * 110},600 L${i * 110 - 60},800" stroke="#8a6650" stroke-width="3"/>`).join("")}`,
    corner: () => S.sky("#8fb2cf", "#cfdde6") + `<rect x="0" y="160" width="430" height="480" fill="#d7b98a" stroke="${INK}" stroke-width="5"/><rect x="570" y="120" width="430" height="520" fill="#b98a6a" stroke="${INK}" stroke-width="5"/>
      ${[40, 160, 280].map(x => S.win(x, 210, 90, 110, INK, "#e8eef2")).join("")}${[620, 760, 880].map(x => S.win(x, 180, 90, 110, INK, "#e8eef2")).join("")}
      <rect x="40" y="420" width="340" height="200" fill="#5a6a7a" stroke="${INK}" stroke-width="5"/>${Array.from({ length: 12 }, (_, i) => `<path d="M40,${436 + i * 16} h340" stroke="#3a4a5a" stroke-width="4"/>`).join("")}
      <text x="70" y="410" font-family="Arial Black,Arial" font-size="40" fill="${INK}">KIOSCO</text>
      <rect x="640" y="400" width="300" height="180" fill="#2f4a3a" stroke="${INK}" stroke-width="5"/><path d="M640,430 h300" stroke="#e6c35c" stroke-width="10"/>
      ${S.floor(640, "#8f8a80")}<path d="M0,700 h1000" stroke="#f2f2f2" stroke-width="8" stroke-dasharray="40 30"/>`,
    planBoard: () => `<rect width="1000" height="800" fill="#d8d2c2"/><rect x="60" y="80" width="880" height="420" fill="#f4f2ea" stroke="${INK}" stroke-width="6"/>
      ${[[110, 120, -6], [300, 150, 4], [720, 120, -3], [820, 300, 5]].map(([x, y, r]) => `<rect x="${x}" y="${y}" width="110" height="90" fill="#cfd8de" stroke="${INK}" stroke-width="4" transform="rotate(${r} ${x} ${y})"/><circle cx="${x + 55}" cy="${y + 4}" r="8" fill="#c0392b"/>`).join("")}
      <path d="M220,180 C300,300 500,140 560,260 S760,200 820,340" stroke="#c0392b" stroke-width="5" fill="none" stroke-dasharray="12 8"/><path d="M806,328 l16,14 4,-22" stroke="#c0392b" stroke-width="5" fill="none"/>
      <text x="420" y="430" font-family="Courier New,monospace" font-weight="bold" font-size="40" fill="#1e3a5a">OPERATIVO</text><path d="M420,446 h240" stroke="#1e3a5a" stroke-width="5"/>
      ${S.floor(620, "#6a5a4a")}`,
    van: () => `<rect width="1000" height="800" fill="#2a2e34"/><rect x="40" y="70" width="920" height="420" rx="30" fill="#3a3f46" stroke="${INK}" stroke-width="5"/>
      ${[[90, 110], [380, 110], [670, 110], [90, 300], [670, 300]].map(([x, y]) => `<rect x="${x}" y="${y}" width="240" height="160" rx="8" fill="#0f1a14" stroke="#777" stroke-width="6"/><rect x="${x + 14}" y="${y + 14}" width="212" height="132" fill="#2a5a3a" opacity=".85"/><path d="M${x + 20},${y + 120} l50,-40 40,20 60,-60" stroke="#8fe39a" stroke-width="4" fill="none"/><text x="${x + 22}" y="${y + 40}" font-family="Courier New,monospace" font-size="20" fill="#8fe39a">REC ●</text>`).join("")}
      <path d="M380,320 q120,80 260,0" stroke="#c0392b" stroke-width="6" fill="none"/>${S.floor(600, "#1d2024")}`,
    lobby: () => `<rect width="1000" height="800" fill="#d9dadc"/>${Array.from({ length: 6 }, (_, i) => `<rect x="${i * 170 + 10}" y="40" width="150" height="460" fill="#bfd3df" stroke="${INK}" stroke-width="4"/>`).join("")}
      <rect x="560" y="360" width="400" height="160" fill="#7a5a3a" stroke="${INK}" stroke-width="5"/><text x="600" y="460" font-family="Arial Black,Arial" font-size="38" fill="#e8d6a8">RECEPCIÓN</text>
      <path d="M80,500 L120,380 L160,500" fill="#3f7a3a" stroke="${INK}" stroke-width="4"/><rect x="100" y="500" width="40" height="40" fill="#8a5a3a" stroke="${INK}" stroke-width="4"/>
      ${S.floor(560, "#e9e4da")}${Array.from({ length: 8 }, (_, i) => `<path d="M${i * 140},560 L${i * 140 - 100},800" stroke="#cfc8b8" stroke-width="3"/>`).join("")}`,
    store: () => `<rect width="1000" height="800" fill="#e6efe6"/><rect x="0" y="40" width="1000" height="40" fill="#fffbe6"/>${[100, 400, 700].map(x => `<rect x="${x}" y="50" width="200" height="16" rx="8" fill="#fff" stroke="#ddd"/>`).join("")}
      ${[0, 1, 2, 3].map(r => `<rect x="30" y="${150 + r * 110}" width="300" height="12" fill="#888"/>${Array.from({ length: 7 }, (_, i) => `<rect x="${40 + i * 40}" y="${100 + r * 110}" width="30" height="50" fill="${["#c0392b", "#f2c94c", "#2d6a9a", "#3f7a3a"][(i + r) % 4]}" stroke="${INK}" stroke-width="2"/>`).join("")}`).join("")}
      <rect x="650" y="300" width="330" height="260" fill="#c8483a" stroke="${INK}" stroke-width="5"/><rect x="680" y="250" width="120" height="70" fill="#333" stroke="${INK}" stroke-width="4"/><rect x="694" y="262" width="92" height="30" fill="#7fe39a"/>
      <rect x="640" y="110" width="320" height="120" fill="#123" stroke="${INK}" stroke-width="5"/><text x="660" y="190" font-family="Arial Black,Arial" font-size="50" fill="#f2c94c">24 HS</text>
      ${S.floor(600, "#d8d8d0")}${Array.from({ length: 9 }, (_, i) => `<path d="M${i * 125},600 v200" stroke="#bbb" stroke-width="3"/>`).join("")}`,
    hotel: () => `<rect width="1000" height="800" fill="#5a2a22"/>${[80, 360, 640, 920].map(x => `<rect x="${x - 30}" y="0" width="60" height="640" fill="#e8d6b0" stroke="${INK}" stroke-width="4"/><rect x="${x - 44}" y="0" width="88" height="40" fill="#d6c090" stroke="${INK}" stroke-width="4"/>`).join("")}
      <circle cx="500" cy="80" r="60" fill="#f7d77a" opacity=".6"/>${Array.from({ length: 9 }, (_, i) => `<circle cx="${440 + i * 15}" cy="${110 + Math.sin(i) * 10}" r="6" fill="#fff6c4"/>`).join("")}
      ${S.floor(640, "#7a1e22")}<path d="M300,640 L200,800 L800,800 L700,640 Z" fill="#a8323a" stroke="${INK}" stroke-width="4"/><path d="M310,660 L690,660" stroke="#e1b12c" stroke-width="5"/>`,
    downtown: () => S.sky("#c9d6e0", "#eef1ee") + `${[[0, 120, 200], [200, 60, 160], [360, 160, 140], [640, 80, 180], [820, 140, 180]].map(([x, y, w]) => `<rect x="${x}" y="${y}" width="${w}" height="${640 - y}" fill="${["#8a8f96", "#a59c8e", "#7a8088", "#b0a796", "#959a9e"][x % 5]}" stroke="${INK}" stroke-width="4"/>${Array.from({ length: Math.floor((560 - y) / 60) }, (_, j) => Array.from({ length: Math.floor(w / 50) }, (_, i) => `<rect x="${x + 14 + i * 50}" y="${y + 20 + j * 60}" width="30" height="36" fill="#dfe8ee" stroke="${INK}" stroke-width="2"/>`).join("")).join("")}`).join("")}
      <rect x="40" y="300" width="140" height="60" fill="#c0392b" stroke="${INK}" stroke-width="4"/><text x="56" y="342" font-family="Arial Black,Arial" font-size="28" fill="#fff">CAMBIO</text>
      ${S.floor(640, "#6f6f6f")}<path d="M0,720 h1000" stroke="#f2f2f2" stroke-width="10" stroke-dasharray="60 40"/>`,
    wedding: () => `<rect width="1000" height="800" fill="#2a1a2e"/>${[0, 1, 2].map(r => `<path d="M0,${80 + r * 70} Q500,${180 + r * 70} 1000,${80 + r * 70}" stroke="#7a6a50" stroke-width="2" fill="none"/>${Array.from({ length: 21 }, (_, i) => { const x = i * 50, t = x / 1000, y = 80 + r * 70 + 4 * 100 * t * (1 - t); return `<circle cx="${x}" cy="${y}" r="7" fill="#ffe9a8"/><circle cx="${x}" cy="${y}" r="16" fill="#ffe9a8" opacity=".18"/>`; }).join("")}`).join("")}
      <rect x="730" y="420" width="220" height="140" fill="#f4efe6" stroke="${INK}" stroke-width="5"/><rect x="790" y="330" width="100" height="90" fill="#fff" stroke="${INK}" stroke-width="4"/><rect x="810" y="280" width="60" height="50" fill="#fff" stroke="${INK}" stroke-width="4"/>
      <rect x="50" y="440" width="200" height="120" fill="#f4efe6" stroke="${INK}" stroke-width="5"/>${[90, 150, 210].map(x => `<path d="M${x},440 v-40" stroke="#ccc" stroke-width="5"/><circle cx="${x}" cy="395" r="8" fill="#f7d77a"/>`).join("")}
      ${S.floor(560, "#3a2a3e")}${Array.from({ length: 10 }, (_, i) => `<rect x="${i * 100}" y="${560 + (i % 2) * 0}" width="100" height="240" fill="${i % 2 ? "#4a3a4e" : "#3a2a3e"}"/>`).join("")}`,
    road: () => S.sky("#f2c57a", "#f7e2b8") + `<circle cx="760" cy="200" r="70" fill="#fff1c4"/>
      <path d="M0,430 L120,330 L220,400 L360,300 L480,420 L1000,420 L1000,440 L0,440 Z" fill="#c0703a" stroke="${INK}" stroke-width="4"/>
      <rect x="0" y="430" width="1000" height="370" fill="#d9a86a"/><path d="M380,440 L620,440 L1000,800 L0,800 Z" fill="#555" stroke="${INK}" stroke-width="4"/><path d="M500,450 L500,800" stroke="#f2f2f2" stroke-width="12" stroke-dasharray="40 40"/>
      ${[[80, 520], [880, 560], [160, 700]].map(([x, y]) => `<path d="M${x},${y} v-60 M${x - 16},${y - 40} v-20 M${x},${y - 30} h-16 M${x + 16},${y - 30} v-24 M${x},${y - 20} h16" stroke="#3f6a3a" stroke-width="12" stroke-linecap="round"/>`).join("")}
      <g transform="translate(690,470)"><rect x="0" y="20" width="200" height="50" rx="12" fill="#2d5a8a" stroke="${INK}" stroke-width="5"/><path d="M30,20 L60,-10 L140,-10 L170,20 Z" fill="#9fc0d8" stroke="${INK}" stroke-width="5"/><circle cx="45" cy="72" r="18" fill="${INK}"/><circle cx="160" cy="72" r="18" fill="${INK}"/></g>`,
    plane: () => `<rect width="1000" height="800" fill="#e6e8ea"/><path d="M0,0 Q500,120 1000,0 L1000,120 Q500,220 0,120 Z" fill="#d0d4d8" stroke="${INK}" stroke-width="4"/>
      ${[0, 1, 2, 3].map(i => `<rect x="${60 + i * 60}" y="${200 + i * 20}" width="60" height="70" rx="26" fill="#9fc6e6" stroke="${INK}" stroke-width="4"/><rect x="${880 - i * 60}" y="${200 + i * 20}" width="60" height="70" rx="26" fill="#9fc6e6" stroke="${INK}" stroke-width="4"/>`).join("")}
      ${[0, 1, 2].map(i => `<rect x="${20 + i * 90}" y="${380 + i * 40}" width="${200 - i * 20}" height="${260 - i * 30}" rx="24" fill="#2f4a7a" stroke="${INK}" stroke-width="5"/><rect x="${780 - i * 90 + i * 20}" y="${380 + i * 40}" width="${200 - i * 20}" height="${260 - i * 30}" rx="24" fill="#2f4a7a" stroke="${INK}" stroke-width="5"/>`).join("")}
      ${S.floor(640, "#5a5f68")}<path d="M380,640 L460,300 L540,300 L620,640" fill="#7a2a2a" opacity=".6"/>`,
    kitchen: () => `<rect width="1000" height="800" fill="#f2ead2"/>${Array.from({ length: 12 }, (_, i) => Array.from({ length: 5 }, (_, j) => `<rect x="${i * 84}" y="${260 + j * 50}" width="84" height="50" fill="${(i + j) % 2 ? "#d8e8e0" : "#f4f4ee"}" stroke="#b8c8c0" stroke-width="2"/>`).join("")).join("")}
      <rect x="40" y="120" width="190" height="460" rx="24" fill="#e8e4d8" stroke="${INK}" stroke-width="5"/><path d="M40,280 h190 M200,170 v60 M200,320 v90" stroke="${INK}" stroke-width="5"/>
      <rect x="720" y="120" width="230" height="110" fill="#c98a4a" stroke="${INK}" stroke-width="5"/><path d="M835,120 v110" stroke="${INK}" stroke-width="4"/>
      <rect x="700" y="420" width="260" height="160" fill="#f4f4ee" stroke="${INK}" stroke-width="5"/><circle cx="760" cy="440" r="24" fill="#555"/><circle cx="890" cy="440" r="24" fill="#555"/><rect x="740" y="380" width="80" height="40" rx="8" fill="#a8a8a8" stroke="${INK}" stroke-width="4"/>
      <text x="300" y="200" font-family="Georgia,serif" font-style="italic" font-size="34" fill="#a8452c">¡Tres empanadas!</text>
      ${S.floor(580, "#c96a4a")}${Array.from({ length: 10 }, (_, i) => Array.from({ length: 4 }, (_, j) => `<rect x="${i * 100}" y="${580 + j * 60}" width="100" height="60" fill="${(i + j) % 2 ? "#e8e0cc" : "#2a2a2a"}" opacity=".85"/>`).join("")).join("")}`,
    patio: () => S.sky("#9fc6e6", "#e6f0f2") + `<rect x="0" y="120" width="1000" height="480" fill="#e8d4b0" stroke="${INK}" stroke-width="5"/>
      ${[80, 300, 700].map(x => `<rect x="${x}" y="200" width="120" height="240" fill="#4a7a6a" stroke="${INK}" stroke-width="5"/><path d="M${x + 60},200 v240" stroke="${INK}" stroke-width="4"/>`).join("")}
      ${[[60, 520], [250, 540], [880, 520], [760, 540]].map(([x, y]) => `<path d="M${x - 30},${y} L${x + 30},${y} L${x + 22},${y + 50} L${x - 22},${y + 50} Z" fill="#c0603a" stroke="${INK}" stroke-width="4"/><path d="M${x},${y} q-40,-60 -10,-110 M${x},${y} q30,-70 20,-120 M${x},${y} q-6,-50 30,-80" stroke="#3f7a3a" stroke-width="10" fill="none" stroke-linecap="round"/>`).join("")}
      ${S.floor(600, "#b88a6a")}${Array.from({ length: 10 }, (_, i) => Array.from({ length: 4 }, (_, j) => `<path d="M${i * 100 + 50},${600 + j * 60} l50,30 -50,30 -50,-30 Z" fill="${(i + j) % 2 ? "#a86a4a" : "#d8c0a0"}" opacity=".7"/>`).join("")).join("")}`,
    dining: () => `<rect width="1000" height="800" fill="#b8a07a"/>${Array.from({ length: 25 }, (_, i) => `<path d="M${i * 40},0 v640" stroke="#a8906a" stroke-width="12"/>`).join("")}
      <rect x="40" y="200" width="260" height="360" fill="#6a4a2a" stroke="${INK}" stroke-width="5"/>${[0, 1].map(i => `<rect x="60" y="${220 + i * 120}" width="220" height="100" fill="#c9dbe0" stroke="${INK}" stroke-width="4"/>`).join("")}${[90, 150, 210].map(x => `<circle cx="${x}" cy="270" r="20" fill="#fff" stroke="#3a6a9a" stroke-width="4"/>`).join("")}
      <rect x="700" y="80" width="200" height="140" fill="#f2e6c8" stroke="#8a6a3a" stroke-width="12"/><path d="M720,200 l50,-60 30,30 40,-50 40,80" stroke="#6a8a5a" stroke-width="6" fill="none"/>
      ${S.floor(560, "#7a5a3a")}<rect x="0" y="600" width="1000" height="200" fill="#f4efe6" stroke="${INK}" stroke-width="5"/>${Array.from({ length: 10 }, (_, i) => `<rect x="${i * 100}" y="600" width="50" height="200" fill="#c94a4a" opacity=".25"/>`).join("")}`,
    court: () => `<rect width="1000" height="800" fill="#4a3a2a"/>${Array.from({ length: 10 }, (_, i) => `<rect x="${i * 100 + 6}" y="0" width="88" height="420" fill="#5c4630" stroke="#3a2a1a" stroke-width="4"/>`).join("")}
      <circle cx="500" cy="150" r="70" fill="#d9c38a" stroke="${INK}" stroke-width="5"/><ellipse cx="500" cy="150" rx="40" ry="50" fill="#7fb5e3" stroke="${INK}" stroke-width="4"/><path d="M460,150 h80" stroke="#fff" stroke-width="16"/>
      <rect x="100" y="300" width="800" height="200" fill="#7a5a3a" stroke="${INK}" stroke-width="6"/>${[0, 1, 2, 3, 4, 5].map(i => `<rect x="${170 + i * 110}" y="230" width="70" height="80" rx="10" fill="#2a1e14" stroke="${INK}" stroke-width="4"/>`).join("")}
      ${S.floor(580, "#5a4430")}<rect x="0" y="600" width="1000" height="200" fill="#6a5038"/>${[0, 1, 2, 3, 4, 5, 6].map(i => `<path d="M${i * 160},620 v180" stroke="#3a2a1a" stroke-width="6"/>`).join("")}`,
    archive: () => `<rect width="1000" height="800" fill="#8a7a5a"/>${[0, 1, 2, 3].map(r => `<rect x="20" y="${70 + r * 130}" width="960" height="14" fill="#5a4a30"/>${Array.from({ length: 30 }, (_, i) => `<rect x="${30 + i * 32}" y="${10 + r * 130 + (i % 3) * 6}" width="26" height="${60 - (i % 3) * 6}" fill="${["#d8c08a", "#c9a86a", "#e8d8b0", "#b0905a"][(i + r) % 4]}" stroke="${INK}" stroke-width="2"/>`).join("")}`).join("")}
      <rect x="640" y="440" width="320" height="140" fill="#5a3a22" stroke="${INK}" stroke-width="5"/><rect x="680" y="390" width="120" height="60" rx="8" fill="#3a3a3a" stroke="${INK}" stroke-width="4"/><rect x="694" y="370" width="92" height="26" fill="#fff" stroke="${INK}" stroke-width="3"/>
      <path d="M880,440 l-20,-90 40,-20" stroke="${INK}" stroke-width="6" fill="none"/><path d="M880,330 l40,-10 10,40 Z" fill="#3a6a4a" stroke="${INK}" stroke-width="4"/><path d="M930,360 L980,440 L860,440 Z" fill="#fff6c4" opacity=".4"/>
      ${[[60, 440, 6], [150, 460, 4]].map(([x, y, n]) => Array.from({ length: n }, (_, i) => `<rect x="${x + (i % 2) * 6}" y="${y + 120 - i * 22}" width="90" height="22" fill="#e8dcc0" stroke="${INK}" stroke-width="3"/>`).join("")).join("")}
      ${S.floor(580, "#5a4a36")}`,
    columns: () => S.sky("#b9c9d6", "#e6eaee") + `<path d="M100,140 L500,40 L900,140 Z" fill="#d8d0c0" stroke="${INK}" stroke-width="5"/><rect x="100" y="140" width="800" height="40" fill="#cfc6b4" stroke="${INK}" stroke-width="5"/>
      ${[140, 270, 400, 530, 660, 790].map(x => `<rect x="${x}" y="180" width="70" height="360" fill="#e8e2d4" stroke="${INK}" stroke-width="5"/>${[0, 1, 2].map(i => `<path d="M${x + 18 + i * 17},190 v340" stroke="#c9c1ae" stroke-width="4"/>`).join("")}`).join("")}
      ${[0, 1, 2, 3, 4].map(i => `<rect x="${60 - i * 30}" y="${540 + i * 30}" width="${880 + i * 60}" height="30" fill="${i % 2 ? "#c9c1ae" : "#d8d0c0"}" stroke="${INK}" stroke-width="3"/>`).join("")}
      <rect x="0" y="690" width="1000" height="110" fill="#9a958a"/>`,
    studio: () => `<rect width="1000" height="800" fill="#e9e2f5"/><rect x="0" y="80" width="1000" height="420" fill="#cfd8e6" stroke="${INK}" stroke-width="4"/>${[0, 1, 2, 3, 4].map(i => `<rect x="${i * 200 + 10}" y="90" width="180" height="400" fill="#e8eef6" stroke="#9aa8bc" stroke-width="3"/>`).join("")}
      <rect x="0" y="476" width="1000" height="12" fill="#c9b27c"/>
      <g transform="translate(640,400)"><path d="M0,120 L0,40 Q0,0 60,0 L300,0 L300,120 Z" fill="#141018" stroke="${INK}" stroke-width="4"/><rect x="10" y="60" width="280" height="24" fill="#fff"/>${Array.from({ length: 14 }, (_, i) => `<rect x="${14 + i * 20}" y="60" width="10" height="14" fill="#141018"/>`).join("")}</g>
      <text x="60" y="60" font-family="Arial Black,Arial" font-size="40" fill="#7a2ef0">ON BEAT STUDIO</text>
      ${S.floor(600, "#b88a5a")}${Array.from({ length: 12 }, (_, i) => `<path d="M${i * 90},600 L${i * 90 - 40},800" stroke="#9a7048" stroke-width="3"/>`).join("")}`,
    concert: () => `<rect width="1000" height="800" fill="#12081f"/>${[[150, "#b06bff"], [500, "#ff5fa2"], [850, "#5fd0ff"]].map(([x, c]) => `<path d="M${x},0 L${x - 220},620 L${x + 220},620 Z" fill="${c}" opacity=".22"/><circle cx="${x}" cy="10" r="26" fill="${c}"/>`).join("")}
      ${Array.from({ length: 40 }, (_, i) => `<circle cx="${(i * 97) % 1000}" cy="${700 + (i % 3) * 30}" r="${22 + (i % 4) * 4}" fill="#05020a"/>`).join("")}
      <rect x="0" y="600" width="1000" height="40" fill="#2a1a3e" stroke="${INK}" stroke-width="4"/>${Array.from({ length: 30 }, (_, i) => `<path d="M${(i * 61) % 1000},${(i * 37) % 300 + 80} l6,14 14,2 -10,10 2,14 -12,-7 -12,7 2,-14 -10,-10 14,-2 Z" fill="#fff" opacity=".5"/>`).join("")}`,
    bar: () => `<rect width="1000" height="800" fill="#7a4a2a"/>${Array.from({ length: 20 }, (_, i) => `<path d="M${i * 50},0 v600" stroke="#6a3e22" stroke-width="20"/>`).join("")}
      <rect x="40" y="120" width="300" height="160" fill="#2f5a3a" stroke="#d9c38a" stroke-width="10"/><text x="70" y="190" font-family="Georgia,serif" font-size="34" fill="#f2e6c8">BAR · PIZZA</text><text x="70" y="240" font-family="Georgia,serif" font-size="26" fill="#f2e6c8">metegol $1</text>
      ${[[700, 160], [830, 160], [700, 260], [830, 260]].map(([x, y]) => `<rect x="${x}" y="${y}" width="100" height="70" fill="#c9b27c" stroke="${INK}" stroke-width="3"/>`).join("")}
      ${S.floor(560, "#a87a4a")}<g transform="translate(560,520)"><rect x="0" y="0" width="400" height="200" fill="#2f7a3a" stroke="#5a3418" stroke-width="22"/>${[60, 130, 200, 270, 340].map(x => `<path d="M${x},-30 v260" stroke="#c9c9c9" stroke-width="6"/>${[40, 100, 160].map(y => `<rect x="${x - 6}" y="${y}" width="12" height="26" fill="${x % 140 ? "#c0392b" : "#2d6a9a"}"/>`).join("")}`).join("")}</g>`,
    field: () => S.sky("#8fc6ef", "#dff0fb") + `${[0, 1, 2, 3, 4, 5].map(i => `<rect x="${i * 180 - 20}" y="${300 - (i % 3) * 30}" width="170" height="${300 + (i % 3) * 30}" fill="${["#c98a6a", "#e0c08a", "#a8b8c8"][i % 3]}" stroke="${INK}" stroke-width="3"/>`).join("")}
      <path d="M0,560 h1000" stroke="#7a7a7a" stroke-width="10"/>${Array.from({ length: 26 }, (_, i) => `<path d="M${i * 40},480 v80" stroke="#7a7a7a" stroke-width="3"/>`).join("")}<path d="M0,480 h1000" stroke="#7a7a7a" stroke-width="3"/>
      <rect x="0" y="570" width="1000" height="230" fill="#7cae4a"/><path d="M0,570 h1000" stroke="#fff" stroke-width="6"/><rect x="700" y="420" width="220" height="150" fill="none" stroke="#fff" stroke-width="10"/>`,
    stadiumDay: () => S.sky("#9fd0f2", "#e6f4fc") + `${[0, 1, 2, 3, 4].map(i => `<path d="M-40,${200 + i * 60} Q500,${150 + i * 60} 1040,${200 + i * 60}" stroke="${i % 2 ? "#6ab4e8" : "#ffffff"}" stroke-width="56" fill="none"/>`).join("")}
      ${Array.from({ length: 120 }, (_, i) => `<circle cx="${(i * 83) % 1000}" cy="${190 + (i * 37) % 260}" r="5" fill="${i % 2 ? "#2a5a9a" : "#f2f2f2"}"/>`).join("")}
      <rect x="0" y="500" width="1000" height="300" fill="#5aa04a"/>${[0, 1, 2, 3, 4].map(i => `<rect x="${i * 200}" y="500" width="100" height="300" fill="#4e9240"/>`).join("")}<path d="M0,500 h1000" stroke="#fff" stroke-width="6"/>`,
    livingroom: () => `<rect width="1000" height="800" fill="#d9c79e"/>${Array.from({ length: 16 }, (_, i) => `<path d="M${i * 64},0 v600" stroke="#cbb88c" stroke-width="22"/>`).join("")}
      <rect x="60" y="140" width="200" height="150" fill="#8fb2cf" stroke="#6a4a2a" stroke-width="12"/><path d="M160,140 v150" stroke="#6a4a2a" stroke-width="6"/>
      <g transform="translate(740,330)"><rect x="0" y="0" width="200" height="150" rx="16" fill="#3a3a3a" stroke="${INK}" stroke-width="5"/><rect x="16" y="16" width="168" height="110" rx="10" fill="#7fa8c8"/><rect x="40" y="150" width="120" height="70" fill="#6a4a2a" stroke="${INK}" stroke-width="4"/></g>
      ${S.floor(560, "#8a5a3a")}<path d="M40,560 L40,470 Q40,430 90,430 L380,430 Q420,430 420,470 L420,560 Z" fill="#7a5a3a" stroke="${INK}" stroke-width="5"/><rect x="30" y="500" width="400" height="90" rx="20" fill="#9a6a44" stroke="${INK}" stroke-width="5"/>`,
    shoestore: () => `<rect width="1000" height="800" fill="#efe6d8"/>${[0, 1, 2, 3].map(r => `<rect x="20" y="${110 + r * 120}" width="960" height="12" fill="#8a6a4a"/>${Array.from({ length: 12 }, (_, i) => `<path d="M${40 + i * 80},${100 + r * 120} L${44 + i * 80},${70 + r * 120} L${64 + i * 80},${70 + r * 120} Q${70 + i * 80},${88 + r * 120} ${96 + i * 80},${92 + r * 120} L${100 + i * 80},${110 + r * 120} Z" fill="${["#3a2416", "#7a1e22", "#1e1e1e", "#c98a4a", "#f2f2f2"][(i + r) % 5]}" stroke="${INK}" stroke-width="2"/>`).join("")}`).join("")}
      <rect x="640" y="20" width="320" height="60" fill="#2a3a6a"/><text x="660" y="62" font-family="Arial Black,Arial" font-size="32" fill="#fff">ZAPATERÍA</text>
      ${S.floor(600, "#b8a080")}<rect x="60" y="600" width="140" height="70" rx="10" fill="#c0392b" stroke="${INK}" stroke-width="4"/><path d="M80,640 l40,-30 40,30" stroke="#fff" stroke-width="5" fill="none"/>`,
    mansion: () => `<rect width="1000" height="800" fill="#f2ece2"/><rect x="0" y="0" width="1000" height="600" fill="#ece3d4"/>${[120, 420, 720].map(x => `<rect x="${x}" y="60" width="160" height="320" rx="80" fill="#cfe0ea" stroke="#b8a888" stroke-width="10"/>`).join("")}
      <path d="M0,600 L1000,600" stroke="#b8a888" stroke-width="6"/><rect x="0" y="600" width="1000" height="200" fill="#d8ccb8"/>${Array.from({ length: 10 }, (_, i) => `<rect x="${i * 100}" y="600" width="50" height="200" fill="#cbbfaa"/>`).join("")}
      <path d="M760,440 L940,440 L940,600 L760,600 Z" fill="#fff" stroke="#b8a888" stroke-width="5"/><circle cx="850" cy="410" r="40" fill="#e8b4c8"/>`,
    snowCity: () => `<rect width="1000" height="800" fill="#1c2430"/>${[[0, 160, 180], [180, 220, 140], [320, 120, 160], [620, 180, 150], [770, 90, 230]].map(([x, y, w]) => `<rect x="${x}" y="${y}" width="${w}" height="${620 - y}" fill="#2c3644" stroke="#0e131a" stroke-width="4"/>${Array.from({ length: Math.floor((540 - y) / 60) }, (_, j) => Array.from({ length: Math.floor(w / 46) }, (_, i) => `<rect x="${x + 12 + i * 46}" y="${y + 20 + j * 60}" width="26" height="34" fill="${(i * 7 + j * 3 + x) % 5 === 0 ? "#f2d77a" : "#3e4a5a"}"/>`).join("")).join("")}`).join("")}
      <rect x="0" y="600" width="1000" height="200" fill="#dfe8ee"/><path d="M0,600 Q250,580 500,604 T1000,596" fill="none" stroke="#fff" stroke-width="10"/>
      <g transform="translate(60,560)"><rect x="0" y="20" width="220" height="56" rx="14" fill="#6a2a2a" stroke="#0e131a" stroke-width="5"/><path d="M36,20 L70,-14 L150,-14 L184,20 Z" fill="#3e4a5a" stroke="#0e131a" stroke-width="5"/><path d="M10,18 Q110,0 210,18" stroke="#fff" stroke-width="12" fill="none"/></g>
      <path d="M880,620 v-220 M860,400 h40" stroke="#0e131a" stroke-width="10"/><circle cx="880" cy="400" r="40" fill="#f2d77a" opacity=".25"/>
      ${(() => { const r = rng(5); return Array.from({ length: 160 }, () => `<circle cx="${r() * 1000}" cy="${r() * 800}" r="${1.5 + r() * 4}" fill="#fff" opacity="${.5 + r() * .5}"/>`).join(""); })()}`,
    sealedHouse: () => `<rect width="1000" height="800" fill="#5a5048"/><rect x="0" y="0" width="1000" height="600" fill="#7a6e60"/>
      <rect x="560" y="80" width="360" height="300" fill="#cfdde6" stroke="${INK}" stroke-width="6"/>${(() => { const r = rng(9); return Array.from({ length: 50 }, () => `<circle cx="${570 + r() * 340}" cy="${90 + r() * 280}" r="${2 + r() * 4}" fill="#fff"/>`).join(""); })()}
      <path d="M560,80 L920,380 M920,80 L560,380 M740,80 v300 M560,230 h360" stroke="#c9b27c" stroke-width="22" opacity=".95"/>
      <rect x="60" y="300" width="300" height="200" fill="#4a3a2a" stroke="${INK}" stroke-width="5"/><rect x="100" y="250" width="70" height="50" fill="#2a2a2a" stroke="${INK}" stroke-width="4"/><path d="M130,250 l-20,-40 M140,250 l24,-50" stroke="${INK}" stroke-width="4"/>
      <circle cx="260" cy="280" r="20" fill="#f2d77a" opacity=".8"/><rect x="250" y="290" width="20" height="10" fill="#ccc"/>
      ${S.floor(600, "#4a3e34")}`,
    stadium: () => `<rect width="1000" height="800" fill="#1a2230"/>${[0, 1, 2, 3, 4, 5].map(i => `<path d="M0,${120 + i * 50} Q500,${60 + i * 50} 1000,${120 + i * 50}" stroke="#2c3a4a" stroke-width="40" fill="none"/>`).join("")}
      ${[100, 900].map(x => `<path d="M${x},400 v-360" stroke="#0e131a" stroke-width="10"/><rect x="${x - 60}" y="20" width="120" height="60" fill="#e8eef2" stroke="#0e131a" stroke-width="5"/><path d="M${x},80 L${x - 220},600 L${x + 220},600 Z" fill="#fff" opacity=".07"/>`).join("")}
      <rect x="0" y="480" width="1000" height="320" fill="#e8eef2"/><path d="M0,480 h1000 M500,480 v320" stroke="#c9d6de" stroke-width="5"/><ellipse cx="500" cy="640" rx="160" ry="60" fill="none" stroke="#c9d6de" stroke-width="5"/>
      ${(() => { const r = rng(21); return Array.from({ length: 140 }, () => `<circle cx="${r() * 1000}" cy="${r() * 800}" r="${1.5 + r() * 4}" fill="#fff" opacity="${.5 + r() * .5}"/>`).join(""); })()}`
  };

  function sceneSVG(esc, opt = {}) {
    if (esc && esc.img && assetURL(esc.img)) return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 800" preserveAspectRatio="${opt.par || "xMidYMid slice"}" ${opt.attrs || ""}><image href="${assetURL(esc.img)}" x="0" y="0" width="1000" height="800" preserveAspectRatio="xMidYMid slice"/></svg>`;
    const k = esc && esc.d && esc.d.k;
    const body = (SCENES[k] || (() => `<rect width="1000" height="800" fill="#d8d0c0"/>`))();
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 800" preserveAspectRatio="${opt.par || "xMidYMid slice"}" ${opt.attrs || ""}>${body}</svg>`;
  }

  /* Avatar parado sobre el escenario */
  function stageSVG(esc, sel, opt = {}) {
    const k = esc && esc.d && esc.d.k;
    const bg = esc && esc.img && assetURL(esc.img) ? `<image href="${assetURL(esc.img)}" x="0" y="0" width="1000" height="800" preserveAspectRatio="xMidYMid slice"/>`
      : esc ? (SCENES[k] || (() => ""))() : `<rect width="1000" height="800" fill="#efe7d6"/>`;
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 800" preserveAspectRatio="xMidYMid slice" ${opt.attrs || ""}>${bg}
      ${opt.photo ? `<image href="${opt.photo}" x="0" y="0" width="1000" height="800" preserveAspectRatio="xMidYMid slice"/>` : ""}
      <g transform="translate(270,${opt.y ?? 112})">${avatarSVG(sel, { inner: true })}</g></svg>`;
  }

  /* Emblemas para los afiches de cada referencia (dibujos propios, no los afiches reales) */
  const EMB = {
    rejas: (c) => `${[30, 50, 70].map(x => `<rect x="${x - 4}" y="14" width="8" height="72" rx="3" fill="${c}"/>`).join("")}<rect x="16" y="22" width="68" height="7" fill="${c}"/><rect x="16" y="72" width="68" height="7" fill="${c}"/>`,
    casa: (c) => `<path d="M14,50 L50,18 L86,50 L78,50 L78,84 L22,84 L22,50 Z" fill="none" stroke="${c}" stroke-width="6" stroke-linejoin="round"/><rect x="42" y="58" width="16" height="26" fill="${c}"/><path d="M30,56 l10,10 M60,46 l12,8" stroke="${c}" stroke-width="4"/>`,
    handy: (c) => `<rect x="34" y="30" width="32" height="56" rx="6" fill="none" stroke="${c}" stroke-width="6"/><rect x="56" y="10" width="6" height="24" fill="${c}"/><path d="M40,48 h20 M40,58 h20 M40,68 h20" stroke="${c}" stroke-width="4"/>`,
    estampilla: (c) => `<rect x="20" y="16" width="60" height="70" fill="none" stroke="${c}" stroke-width="6" stroke-dasharray="6 4"/><circle cx="50" cy="46" r="14" fill="${c}"/><path d="M30,74 h40" stroke="${c}" stroke-width="5"/>`,
    grieta: (c) => `<path d="M50,8 L42,36 L58,44 L36,70 L52,76 L44,94" fill="none" stroke="${c}" stroke-width="6" stroke-linejoin="round"/><path d="M42,36 L20,30 M58,44 L82,40 M36,70 L16,74 M52,76 L76,84" stroke="${c}" stroke-width="4"/>`,
    empanada: (c) => `<path d="M12,68 Q50,4 88,68 Z" fill="none" stroke="${c}" stroke-width="6" stroke-linejoin="round"/><path d="M20,58 Q50,14 80,58" fill="none" stroke="${c}" stroke-width="4" stroke-dasharray="5 5"/>`,
    balanza: (c) => `<path d="M50,14 v70 M30,86 h40 M18,30 h64" stroke="${c}" stroke-width="6" stroke-linecap="round"/><path d="M18,30 L8,56 h20 Z M82,30 L72,56 h20 Z" fill="none" stroke="${c}" stroke-width="4" stroke-linejoin="round"/>`,
    nota: (c) => `<path d="M38,70 V22 L76,14 V60" fill="none" stroke="${c}" stroke-width="6" stroke-linejoin="round"/><ellipse cx="30" cy="72" rx="12" ry="9" fill="${c}"/><ellipse cx="68" cy="62" rx="12" ry="9" fill="${c}"/>`,
    pelota: (c) => `<circle cx="50" cy="50" r="34" fill="none" stroke="${c}" stroke-width="6"/><path d="M50,36 l13,9 -5,15 -16,0 -5,-15 Z" fill="${c}"/><path d="M50,36 V16 M63,45 L82,38 M58,60 L70,78 M42,60 L30,78 M37,45 L18,38" stroke="${c}" stroke-width="4"/>`,
    copo: (c) => `${[0, 60, 120].map(a => `<path d="M50,10 v80 M40,20 l10,10 10,-10 M40,80 l10,-10 10,10" transform="rotate(${a} 50 50)" fill="none" stroke="${c}" stroke-width="5" stroke-linecap="round"/>`).join("")}`
  };
  function posterSVG(ref) {
    if (ref.foto && assetURL(ref.foto)) return `<img class="ph cover" src="${assetURL(ref.foto)}" alt="">`;
    const [a, b, c] = ref.paleta;
    const r = rng(ref.id.length * 31);
    let grain = ""; for (let i = 0; i < 60; i++) grain += `<circle cx="${r() * 200}" cy="${r() * 280}" r="${r() * 1.6}" fill="${c}" opacity=".25"/>`;
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 280"><rect width="200" height="280" fill="${a}"/>
      <circle cx="100" cy="112" r="70" fill="${b}"/>${grain}
      <g transform="translate(50,62)">${(EMB[ref.emblema] || EMB.copo)(a)}</g>
      <rect x="0" y="206" width="200" height="74" fill="${c}"/><path d="M0,206 h200" stroke="${INK}" stroke-width="3"/><text x="100" y="256" text-anchor="middle" font-family="Anton,Impact,Arial Black,sans-serif" font-size="34" fill="${a}">${ref.anio.split("–")[0]}</text></svg>`;
  }

  window.BeatArt = { avatarSVG, itemIconSVG, sceneSVG, stageSVG, posterSVG, shade, assetURL };
})();
