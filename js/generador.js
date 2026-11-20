/* =====================================================================
   CABINA BYTE · GENERADOR DE LA FOTO
   Dos caminos, y la cabina elige sola:

   A) IA REAL (si hay clave en config.js y hay internet)
      Manda a Gemini (Nano Banana): tu foto + las FOTOS REALES de la ropa,
      el pelo, el accesorio y el escenario que elegiste + un pedido escrito
      que exige cambiar ropa y pelo. La IA devuelve una foto realista tuya
      vestida así. Después se le agrega Byte como sticker.

   B) MODO COLLAGE (sin clave o sin internet; gratis)
      La compu arma la foto por capas: el escenario real + vos recortado
      (MediaPipe) + las prendas reales pegadas sobre tu cuerpo y tu cabeza
      (ubicadas con la detección de cara) + Byte. Cambia la ropa y el pelo
      como un collage, no como una foto: para que parezca real hace falta
      la IA del modo A.
   ===================================================================== */
(function () {
  const CFG = window.CABINA_CONFIG || {};
  // la clave se puede pegar en config.js o cargar desde la cabina (tecla K) → queda guardada en esta compu
  const LSK = "cabinaByte.geminiKey";
  const KEY = () => { if (CFG.geminiApiKey) return CFG.geminiApiKey; try { return localStorage.getItem(LSK) || ""; } catch (e) { return ""; } };
  const W = 1200, H = 1500;                 // área de imagen (4:5)
  const PW = 1200, PH = 1800;               // hoja final 10×15 (2:3)
  const MP = "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14";
  const SEG_MODEL = "https://storage.googleapis.com/mediapipe-models/image_segmenter/selfie_segmenter/float16/latest/selfie_segmenter.tflite";
  const FACE_MODEL = "https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/latest/blaze_face_short_range.tflite";
  const VIOLETA = "#8b5cf6";

  /* ---------------- utilidades ---------------- */
  const canvas = (w, h) => { const c = document.createElement("canvas"); c.width = w; c.height = h; return c; };
  function svgToImage(svg) {
    return new Promise((res, rej) => {
      const img = new Image();
      img.onload = () => res(img); img.onerror = rej;
      img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
    });
  }
  function loadImage(src) { return new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = src; }); }
  function drawCover(ctx, img, x, y, w, h) {
    const iw = img.naturalWidth || img.width, ih = img.naturalHeight || img.height;
    const s = Math.max(w / iw, h / ih), dw = iw * s, dh = ih * s;
    ctx.drawImage(img, x + (w - dw) / 2, y + (h - dh) / 2, dw, dh);
  }
  const withTimeout = (p, ms) => Promise.race([p, new Promise((_, rej) => setTimeout(() => rej(new Error("timeout")), ms))]);
  const esNada = (it) => !it || (it.d && it.d.k === "none");
  const nombre = (it) => esNada(it) ? null : it.nombre.toLowerCase();
  const desc = (it) => esNada(it) ? null : (it.caption || it.nombre);
  // en el canvas sólo se usan imágenes ya convertidas a data: (las de img/ se convierten al iniciar)
  const url = (it) => { const u = it && it.img ? BeatArt.assetURL(it.img) : null; return u && u.startsWith("data:") ? u : null; };

  /* ---------------- prompt (se muestra en la parte 2 y se manda a la IA) ---------------- */
  function buildPrompt(ref, sel, esc) {
    const piezas = [nombre(sel.ropa), nombre(sel.pelo), nombre(sel.cabeza), nombre(sel.accesorio)].filter(Boolean);
    const palabras = [ref.titulo, ...piezas, esc.nombre.toLowerCase()];
    const texto = `Foto realista de la persona, con su misma cara, vestida como en «${ref.titulo}» (${ref.anio}): ${piezas.join(", ")}. Fondo: ${esc.caption}.`;
    return { texto, palabras };
  }
  // pedido completo para la IA (en inglés, que es como mejor obedece) + imágenes de referencia
  function buildAIRequest(ref, sel, esc) {
    const refs = [];  // [{label, url}]
    const add = (label, it) => { const u = url(it); if (u) refs.push({ label, url: u }); return u ? ` (see reference image ${refs.length + 1})` : ""; };
    const lines = [];
    const r = desc(sel.ropa), p = desc(sel.pelo), c = desc(sel.cabeza), a = desc(sel.accesorio);
    if (r) lines.push(`CLOTHES (mandatory): completely remove what the person is wearing and dress them in: "${r}"${add("clothes", sel.ropa)}. None of the original clothing may remain visible.`);
    if (p) lines.push(`HAIR (mandatory): change the hairstyle completely to: "${p}"${add("hair", sel.pelo)}. Change length, color and shape to match; the original hairstyle must not remain.`);
    else lines.push(`HAIR: keep the person's own hair.`);
    if (c) lines.push(`HEAD: the person wears: "${c}"${add("head item", sel.cabeza)}.`);
    if (a) lines.push(`ACCESSORY: the person wears or holds: "${a}"${add("accessory", sel.accesorio)}.`);
    lines.push(`BACKGROUND: replace the background with: "${esc.caption}"${add("background", esc)}.`);
    const texto =
`Edit image 1, a photo of a real person taken in a photo booth. The result must be a PHOTOREALISTIC photograph of the SAME person: keep their face, identity, skin tone, age and expression exactly.
Apply ALL of these changes, inspired by the Argentine ${ref.tipo.toLowerCase()} "${ref.titulo}" (${ref.anio}):
${lines.map((l, i) => `${i + 1}. ${l}`).join("\n")}
Use the reference images only as a guide for the garment, hairstyle, object and place; render them as real fabric, real hair and a real location, with consistent cinematic lighting and natural proportions.
Framing: vertical 4:5 portrait, from the waist up, person centered. No text, no logos added, no cartoon or illustration style.`;
    return { texto, refs };
  }

  /* ---------------- MediaPipe: cara (478 puntos), cuerpo (hombros) y segmentación por partes ----------------
     Viene incluido en la carpeta mp/ como scripts comunes (con el binario y los modelos adentro), así que
     funciona con doble clic en index.html y SIN internet. Si por algo falla, prueba bajarlo de internet. */
  const MODELS_WEB = {
    face: "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",
    pose: "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task",
    multi: "https://storage.googleapis.com/mediapipe-models/image_segmenter/selfie_multiclass_256x256/float32/latest/selfie_multiclass_256x256.tflite",
    seg: SEG_MODEL
  };
  let mpPromise = null;
  const loadScript = (src) => new Promise((res, rej) => { const s = document.createElement("script"); s.src = src; s.onload = res; s.onerror = () => rej(new Error("no se pudo cargar " + src)); document.head.appendChild(s); });
  const b64 = (str) => { const bin = atob(str), u = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i); return u; };
  async function mpBuild(vision, fileset, opt) {
    const out = {};
    try { out.multi = await vision.ImageSegmenter.createFromOptions(fileset, opt("multi", { outputCategoryMask: false, outputConfidenceMasks: true })); }
    catch (e) { console.warn("segmentación por partes no disponible", e); out.seg = await vision.ImageSegmenter.createFromOptions(fileset, opt("seg", { outputCategoryMask: false, outputConfidenceMasks: true })); }
    try { out.face = await vision.FaceLandmarker.createFromOptions(fileset, opt("face", { numFaces: 1 })); } catch (e) { console.warn("FaceLandmarker", e); }
    try { out.pose = await vision.PoseLandmarker.createFromOptions(fileset, opt("pose", { numPoses: 1 })); } catch (e) { console.warn("PoseLandmarker", e); }
    return out;
  }
  async function mpLocal() {
    for (const f of ["mp_bundle", "mp_wasm", "mp_model_face", "mp_model_pose", "mp_model_multi", "mp_model_seg"]) {
      const ok = f === "mp_bundle" ? window.MPVision : f === "mp_wasm" ? window.MP_WASM : (window.MP_MODELS || {})[f.replace("mp_model_", "")];
      if (!ok) await loadScript("mp/" + f + ".js");
    }
    const vision = window.MPVision;
    const fileset = { wasmLoaderPath: URL.createObjectURL(new Blob([b64(window.MP_WASM_JS)], { type: "text/javascript" })), wasmBinaryPath: URL.createObjectURL(new Blob([b64(window.MP_WASM)], { type: "application/wasm" })) };
    const buf = {}; for (const k of Object.keys(window.MP_MODELS)) buf[k] = b64(window.MP_MODELS[k]);
    return mpBuild(vision, fileset, (k, extra) => Object.assign({ baseOptions: { modelAssetBuffer: buf[k], delegate: "CPU" }, runningMode: "IMAGE" }, extra || {}));
  }
  async function mpWeb() {
    const vision = await import(MP + "/vision_bundle.mjs");
    const fileset = await vision.FilesetResolver.forVisionTasks(MP + "/wasm");
    return mpBuild(vision, fileset, (k, extra) => Object.assign({ baseOptions: { modelAssetPath: MODELS_WEB[k], delegate: "CPU" }, runningMode: "IMAGE" }, extra || {}));
  }
  function loadMediaPipe() {
    if (!CFG.usarRecortePersona) return Promise.resolve(null);
    if (mpPromise) return mpPromise;
    mpPromise = (async () => {
      try { const r = await withTimeout(mpLocal(), 45000); console.info("MediaPipe: archivos locales"); return r; }
      catch (e) { console.warn("MediaPipe local no disponible, pruebo internet", e && e.message); }
      try { const r = await withTimeout(mpWeb(), 30000); console.info("MediaPipe: internet"); return r; }
      catch (e) { console.warn("MediaPipe no disponible → marco con forma de arco", e); return null; }
    })();
    return mpPromise;
  }

  /* ---- análisis de la foto: máscaras + geometría de la cara y el cuerpo ---- */
  const OVAL = [10, 338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 288, 397, 365, 379, 378, 400, 377, 152, 148, 176, 149, 150, 136, 172, 58, 132, 93, 234, 127, 162, 21, 54, 103, 67, 109];
  function maskCanvas(m, fn) {   // MPMask → canvas alfa (tamaño del modelo)
    const arr = m.getAsFloat32Array(), mw = m.width, mh = m.height;
    const c = canvas(mw, mh), ctx = c.getContext("2d"), id = ctx.createImageData(mw, mh);
    for (let i = 0; i < arr.length; i++) id.data[i * 4 + 3] = Math.max(0, Math.min(255, fn(arr[i], i) * 255));
    ctx.putImageData(id, 0, 0); return c;
  }
  function analizar(mp, photo) {
    const A = { w: photo.width, h: photo.height };
    if (!mp) return A;
    try {
      if (mp.multi) {
        const r = mp.multi.segment(photo), M = r.confidenceMasks;   // 0 fondo · 1 pelo · 2 piel del cuerpo · 3 piel de la cara · 4 ropa · 5 otros
        const sm = (x, a, b) => Math.max(0, Math.min(1, (x - a) / (b - a)));
        const bg = M[0].getAsFloat32Array();
        A.persona = maskCanvas(M[0], v => sm(1 - v, .3, .7));
        A.pelo = maskCanvas(M[1], v => sm(v, .35, .65));
        A.cara = maskCanvas(M[3], v => sm(v, .3, .6));
        A.otros = maskCanvas(M[5], v => sm(v, .35, .65));
        M.forEach(x => x.close && x.close());
      } else if (mp.seg) {
        const r = mp.seg.segment(photo), M = r.confidenceMasks, m = M[M.length - 1];
        A.persona = maskCanvas(m, v => Math.max(0, Math.min(1, (v - .35) / .35)));
        M.forEach(x => x.close && x.close());
      }
    } catch (e) { console.warn("segment", e); }
    try {
      if (mp.face) { const r = mp.face.detect(photo); if (r.faceLandmarks && r.faceLandmarks[0]) A.lm = r.faceLandmarks[0].map(p => ({ x: p.x * A.w, y: p.y * A.h })); }
    } catch (e) { console.warn("face", e); }
    try {
      if (mp.pose) { const r = mp.pose.detect(photo); if (r.landmarks && r.landmarks[0]) A.pose = r.landmarks[0].map(p => ({ x: p.x * A.w, y: p.y * A.h, v: p.visibility == null ? 1 : p.visibility })); }
    } catch (e) { console.warn("pose", e); }
    return A;
  }

  /* ---- geometría: un sistema de coordenadas pegado a la cara ----
     origen = entre los ojos · eje u = de ojo a ojo · eje v = hacia el mentón · unidad E = distancia entre
     las comisuras externas de los ojos. Así cada prenda se apoya igual en cualquier cara, aunque esté inclinada. */
  const P = (x, y) => ({ x, y });
  const mid = (a, b) => P((a.x + b.x) / 2, (a.y + b.y) / 2);
  const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
  function geometria(A, place) {
    const T = (p) => P(place.dx + p.x * place.s, place.dy + p.y * place.s);   // foto → hoja
    let lm = A.lm ? A.lm.map(T) : null;
    let O, ex, E, uv, G = {};
    if (lm) {
      let eL = mid(lm[33], lm[133]), eR = mid(lm[362], lm[263]);
      if (eL.x > eR.x) [eL, eR] = [eR, eL];
      O = mid(eL, eR); E = dist(lm[33], lm[263]);
      const d = dist(eL, eR); ex = P((eR.x - eL.x) / d, (eR.y - eL.y) / d);
      G.ojoL = eL; G.ojoR = eR;
    } else {
      // sin puntos de la cara: la cara se estima centrada en la silueta
      const fb = { x: A.w * .37, y: A.h * .2, w: A.w * .26, h: A.h * .3 };
      const c = T(P(fb.x + fb.w / 2, fb.y + fb.h * .42)); O = c; E = fb.w * place.s * .62; ex = P(1, 0);
    }
    const ey = P(-ex.y, ex.x);
    const at = (u, v) => P(O.x + ex.x * u * E + ey.x * v * E, O.y + ex.y * u * E + ey.y * v * E);
    uv = (p) => { const dx = p.x - O.x, dy = p.y - O.y; return { u: (dx * ex.x + dy * ex.y) / E, v: (dx * ey.x + dy * ey.y) / E }; };
    const U = (i, def) => lm ? uv(lm[i]) : def;
    const sideU = (a, b, def) => { if (!lm) return def; const p = uv(lm[a]), q = uv(lm[b]); return [Math.min(p.u, q.u), Math.max(p.u, q.u), (p.v + q.v) / 2]; };
    const v10 = U(10, { v: -1.05 }).v, vBrow = U(9, { v: -.28 }).v, vChin = U(152, { v: 1.62 }).v;
    const sien = sideU(162, 389, [-.82, .82, -.25]);      // sienes
    const mej = sideU(234, 454, [-.86, .86, .1]);         // mejillas
    const boca = sideU(61, 291, [-.32, .32, 1.02]);
    const vBig = U(164, { v: .9 }).v, vNariz = U(195, { v: .45 }).v;
    G = Object.assign(G, { O, E, ex, ey, at, uv, v10, vBrow, vChin, vChin2: vChin, rot: Math.atan2(ex.y, ex.x), lm });
    if (!G.ojoL) { G.ojoL = at(-.5, 0); G.ojoR = at(.5, 0); }
    // hombros (cuerpo) — si no hay pose, se estiman desde la cara
    let hL = null, hR = null;
    if (A.pose && A.pose[11] && A.pose[12] && Math.min(A.pose[11].v, A.pose[12].v) > .4) {
      hL = T(A.pose[11]); hR = T(A.pose[12]); if (hL.x > hR.x) [hL, hR] = [hR, hL];
      const sw = dist(hL, hR);
      if (sw < E * 1.9 || sw > E * 5) hL = hR = null;   // detección rara: descartar
    }
    if (!hL) { hL = at(-1.75, vChin + 1.05); hR = at(1.75, vChin + 1.05); }
    G.hL = hL; G.hR = hR; G.SW = dist(hL, hR);
    const hU = P((hR.x - hL.x) / G.SW, (hR.y - hL.y) / G.SW), hN = P(-hU.y, hU.x), hc = mid(hL, hR);
    const alongShoulders = (k, up) => P(hc.x + hU.x * k * G.SW / 2 - hN.x * up * G.SW, hc.y + hU.y * k * G.SW / 2 - hN.y * up * G.SW);
    G.body = alongShoulders;
    // destinos (pares de puntos) para cada tipo de prenda
    const vBand = v10 + .25 * (vBrow - v10);
    G.target = {
      ropa: [alongShoulders(-1.1, .1), alongShoulders(1.1, .1)],
      pelo: [at(sien[0] * 1.0, sien[2] - .05), at(sien[1] * 1.0, sien[2] - .05)],
      gorra: [at(sien[0] * 1.12, vBand), at(sien[1] * 1.12, vBand)],
      casco: [at(sien[0] * 1.15, vBand - .05), at(sien[1] * 1.15, vBand - .05)],
      vincha_arco: [at(sien[0] * 1.22, sien[2] - .62), at(sien[1] * 1.22, sien[2] - .62)],
      vincha_banda: [at(sien[0] * 1.08, (vBrow + v10) / 2), at(sien[1] * 1.08, (vBrow + v10) / 2)],
      vincha: [at(sien[0] * 1.08, (vBrow + v10) / 2), at(sien[1] * 1.08, (vBrow + v10) / 2)],
      capucha: [at(-.66, -.02), at(.66, -.02)],
      capucha_cerrada: [at(mej[0] * 1.45, .05), at(mej[1] * 1.45, .05)],
      lentes: [G.ojoL, G.ojoR],
      bigote: [at(boca[0] * 1.12, vBig), at(boca[1] * 1.12, vBig)],
      barba: [at(boca[0] * 1.45, boca[2] + .12), at(boca[1] * 1.45, boca[2] + .12)],
      patillas: [at(sien[0] * .98, sien[2] - .05), at(sien[1] * .98, sien[2] - .05)],
      barbijo: [at(mej[0] * 1.02, vNariz), at(mej[1] * 1.02, vNariz)],
      cuello: [at(-.42, vChin + .45), at(.42, vChin + .45)],
      cadena_gruesa: [at(-.6, vChin + .4), at(.6, vChin + .4)],
      auriculares: [at(-.95, vChin + .95), at(.95, vChin + .95)],
      hebilla: [at(sien[0] * .8, v10 + .2), at(sien[0] * .2, v10 + .02)]
    };
    // la cadena sigue el ángulo de los hombros, no el de la cabeza
    const neckC = at(0, vChin + .45);
    G.peluca = [at(mej[0] * 1.02, v10 + .12), at(mej[1] * 1.02, v10 + .12)];
    ["cuello", "cadena_gruesa", "auriculares"].forEach(k => { const hw = dist(G.target[k][0], G.target[k][1]) / 2; G.target[k] = [P(neckC.x - hU.x * hw, neckC.y - hU.y * hw), P(neckC.x + hU.x * hw, neckC.y + hU.y * hw)]; });
    G.ovalo = lm ? OVAL.map(i => lm[i]) : null;
    return G;
  }

  /* ---- dibujar una imagen haciendo coincidir sus puntos a,b con los puntos p,q (escala + giro) ---- */
  function drawAnchored(ctx, img, a, b, p, q, crop) {
    const iw = img.naturalWidth || img.width, ih = img.naturalHeight || img.height;
    const A = P(a[0] * iw, a[1] * ih), B = P(b[0] * iw, b[1] * ih);
    const dI = dist(A, B) || 1, dT = dist(p, q);
    const s = dT / dI, ang = Math.atan2(q.y - p.y, q.x - p.x) - Math.atan2(B.y - A.y, B.x - A.x);
    ctx.save();
    ctx.translate(p.x, p.y); ctx.rotate(ang); ctx.scale(s, s); ctx.translate(-A.x, -A.y);
    if (crop) { ctx.beginPath(); ctx.rect(0, crop[0] * ih, iw, (crop[1] - crop[0]) * ih); ctx.clip(); }
    ctx.drawImage(img, 0, 0, iw, ih);
    ctx.restore();
    return { s, ang };
  }
  // sombra suave + ajuste de luz para que la prenda no parezca "pegada"
  function prendaLayer(img, luz) {
    const c = canvas(img.naturalWidth || img.width, img.naturalHeight || img.height), x = c.getContext("2d");
    x.filter = `brightness(${luz.toFixed(3)}) saturate(.94) contrast(1.02)`; x.drawImage(img, 0, 0); x.filter = "none";
    return c;
  }
  function luzDeFoto(photo, A) {   // brillo medio de la cara, para ajustar las prendas
    try {
      const c = canvas(64, 64), x = c.getContext("2d"); x.drawImage(photo, 0, 0, 64, 64);
      const d = x.getImageData(16, 8, 32, 40).data; let s = 0;
      for (let i = 0; i < d.length; i += 4) s += (d[i] * .3 + d[i + 1] * .59 + d[i + 2] * .11);
      const L = s / (d.length / 4) / 255;
      return Math.max(.82, Math.min(1.08, .72 + L * .55));
    } catch (e) { return 1; }
  }

  /* ---------------- B) MODO COLLAGE ---------------- */
  const ORDEN = ["ropa", "cuello", "barba", "bigote", "barbijo", "pelo", "lentes", "capucha", "gorra", "casco", "vincha", "hebilla", "mano"];
  const ANC = () => window.ANCLAS || {};

  async function composeLocal({ photo, ref, sel, esc }) {
    const c = canvas(W, H), ctx = c.getContext("2d");
    // 1. escenario (foto real si la hay)
    const bgURL = url(esc);
    const bg = bgURL ? await loadImage(bgURL) : await svgToImage(BeatArt.sceneSVG(esc, { attrs: `width="1000" height="800"` }));
    drawCover(ctx, bg, 0, 0, W, H);
    // el fondo un poco desenfocado, como una foto con profundidad de campo
    if (photo) { const b = canvas(W, H), bx = b.getContext("2d"); bx.filter = "blur(3px) brightness(.92)"; bx.drawImage(c, 0, 0); ctx.drawImage(b, 0, 0); }

    if (!photo) { await stickerByte(ctx, sel, false); return gradeCanvas(c, ref.filtro); }

    const items = [sel.ropa, sel.pelo, sel.cabeza, sel.accesorio].filter(it => it && it.img && url(it));
    const tipo = (it) => (ANC()[it.img] && ANC()[it.img].t) || it.t;
    const hayPeluca = items.some(it => tipo(it) === "pelo");
    const mp = await loadMediaPipe();
    const A = analizar(mp, photo);
    const pw = photo.width, ph = photo.height;

    // 2. persona: se ubica para que la cara quede en el tercio superior
    let place;
    if (A.persona) {
      let s = (H * .92) / ph;
      if (A.lm) {   // encuadre según la cara: que la distancia entre ojos ocupe ~15% del ancho
        const E0 = dist(A.lm[33], A.lm[263]); s = Math.max((H * .7) / ph, Math.min((W * .105) / E0, (H * 1.6) / ph));
        const eye = mid(A.lm[33], A.lm[263]);
        place = { s, dx: W / 2 - eye.x * s, dy: H * .33 - eye.y * s };
        place.dy = Math.min(place.dy, H * .05);                 // que no quede flotando
        place.dy = Math.max(place.dy, H - ph * s);              // que llegue hasta abajo
      } else place = { s, dx: (W - pw * s) / 2, dy: H - ph * s };
    } else {
      const fw = 860, fh = 1080, fx = (W - fw) / 2, fy = H - fh - 60;
      const s = Math.max(fw / pw, fh / ph);
      place = { s, dx: fx + (fw - pw * s) / 2, dy: fy + (fh - ph * s) / 2, arco: { fx, fy, fw, fh } };
    }
    const G = geometria(A, place);

    // capa de la persona (con la máscara, y sin su pelo de afuera de la cara si lleva peluca)
    const persona = canvas(W, H), px = persona.getContext("2d");
    const dibujarFoto = (x) => x.drawImage(photo, place.dx, place.dy, pw * place.s, ph * place.s);
    const conMascara = (mask, extra, soft) => {
      const L = canvas(W, H), lx = L.getContext("2d"); dibujarFoto(lx);
      lx.globalCompositeOperation = "destination-in"; lx.filter = `blur(${soft || 1.5}px)`;
      lx.drawImage(mask, place.dx, place.dy, pw * place.s, ph * place.s); lx.filter = "none";
      if (extra) extra(lx);
      return L;
    };
    if (A.persona) {
      px.drawImage(conMascara(A.persona, (lx) => {
        if (hayPeluca && A.pelo) {   // borra el pelo propio que asoma fuera de la cara (la peluca lo reemplaza)
          const hm = canvas(W, H), hx = hm.getContext("2d");
          hx.filter = "blur(4px)"; hx.drawImage(A.pelo, place.dx, place.dy, pw * place.s, ph * place.s); hx.filter = "none";
          if (G.ovalo) { hx.globalCompositeOperation = "destination-out"; hx.beginPath(); G.ovalo.forEach((p, i) => i ? hx.lineTo(p.x, p.y) : hx.moveTo(p.x, p.y)); hx.closePath(); hx.fill(); }
          lx.globalCompositeOperation = "destination-out"; lx.drawImage(hm, 0, 0);
        }
      }), 0, 0);
      ctx.save(); ctx.shadowColor = "rgba(0,0,0,.4)"; ctx.shadowBlur = 36; ctx.shadowOffsetY = 8; ctx.drawImage(persona, 0, 0); ctx.restore();
    } else {
      const { fx, fy, fw, fh } = place.arco;
      ctx.save(); ctx.shadowColor = "rgba(0,0,0,.5)"; ctx.shadowBlur = 50;
      ctx.fillStyle = "#fff"; archPath(ctx, fx - 22, fy - 22, fw + 44, fh + 44); ctx.fill(); ctx.restore();
      ctx.save(); archPath(ctx, fx, fy, fw, fh); ctx.clip(); dibujarFoto(ctx); ctx.restore();
    }

    // 3. vestuario real, cada prenda apoyada en sus dos puntos
    const luz = luzDeFoto(photo, A);
    const orden = items.slice().sort((a, b) => ORDEN.indexOf(tipo(a)) - ORDEN.indexOf(tipo(b)));
    let cabezaRedibujada = false;
    const redibujarCabeza = () => {   // la cara (y el pelo propio si no hay peluca) va por encima del cuello de la ropa
      if (cabezaRedibujada || !A.cara) return; cabezaRedibujada = true;
      const L = conMascara(A.cara, (lx) => {
        if (!hayPeluca && A.pelo) { lx.globalCompositeOperation = "source-over"; const h = conMascara(A.pelo, null, 2); lx.drawImage(h, 0, 0); }
      }, 3);
      ctx.drawImage(L, 0, 0);
    };
    for (const it of orden) {
      const t = tipo(it), an = ANC()[it.img] || {};
      if (t !== "ropa") redibujarCabeza();
      try {
        const img = prendaLayer(await loadImage(url(it)), luz);
        ctx.save(); ctx.shadowColor = "rgba(0,0,0,.32)"; ctx.shadowBlur = t === "ropa" ? 26 : 12; ctx.shadowOffsetY = t === "ropa" ? 8 : 4;
        if (t === "mano" || an.to === "pecho") dibujarEnMano(ctx, img, an, G, an.to === "pecho");
        else if (an.partes) {
          for (const pt of an.partes) {
            const key = pt.to || an.to || t, tg = G.target[key] || G.target[t];
            drawAnchored(ctx, img, pt.a || an.a, pt.b || an.b, tg[0], tg[1], pt.y);
          }
        } else if (t === "pelo" && an.a && A.cara) {
          // peluca: se apoya en las sienes; después la cara (de las cejas para abajo) vuelve a quedar adelante,
          // así el pelo nunca tapa los ojos ni las mejillas
          drawAnchored(ctx, img, an.a, an.b, G.target.pelo[0], G.target.pelo[1]);
          ctx.restore(); ctx.save();
          const L = conMascara(A.cara, (lx) => {
            lx.globalCompositeOperation = "destination-in";
            const p0 = G.at(-3, G.vBrow + .12), p1 = G.at(3, G.vBrow + .12), q1 = G.at(3, G.vChin + 3), q0 = G.at(-3, G.vChin + 3);
            lx.beginPath(); lx.moveTo(p0.x, p0.y); lx.lineTo(p1.x, p1.y); lx.lineTo(q1.x, q1.y); lx.lineTo(q0.x, q0.y); lx.closePath(); lx.fill();
          }, 2.5);
          ctx.drawImage(L, 0, 0);
        } else {
          const tg = G.target[an.to] || G.target[t];
          if (tg && an.a && an.to === "vincha_arco" && G.ovalo) {
            // las puntas de la vincha van detrás de la cabeza: se borra lo que cae sobre la cara
            const L = canvas(W, H), lx = L.getContext("2d");
            drawAnchored(lx, img, an.a, an.b, tg[0], tg[1]);
            lx.globalCompositeOperation = "destination-out"; lx.filter = "blur(2px)";
            lx.beginPath(); G.ovalo.forEach((p, i) => i ? lx.lineTo(p.x, p.y) : lx.moveTo(p.x, p.y)); lx.closePath(); lx.fill(); lx.filter = "none";
            ctx.drawImage(L, 0, 0);
          } else if (tg && an.a) drawAnchored(ctx, img, an.a, an.b, tg[0], tg[1]);
        }
        ctx.restore();
      } catch (e) { console.warn("prenda", it.id, e); ctx.restore(); }
    }
    redibujarCabeza();
    // prendas dibujadas (referencias sin fotos): accesorio de cabeza y anteojos
    const vec = { cabeza: sel.cabeza && !sel.cabeza.img ? sel.cabeza : null, accesorio: sel.accesorio && !sel.accesorio.img ? sel.accesorio : null };
    if ((vec.cabeza && !esNada(vec.cabeza)) || (vec.accesorio && vec.accesorio.d && ["glasses", "earpiece"].includes(vec.accesorio.d.k))) {
      const ov = await svgToImage(BeatArt.avatarSVG(vec, { overlayOnly: true }));
      // en ese dibujo los ojos (centro de los lentes) están en (166,188) y (236,188) de un lienzo de 400×520
      drawAnchored(ctx, ov, [166 / 400, 188 / 520], [236 / 400, 188 / 520], G.ojoL, G.ojoR);
    }
    if (CFG.debugAnclas) debugDraw(ctx, G);
    await stickerByte(ctx, sel, true);
    return gradeCanvas(c, ref.filtro, true);
  }
  // objetos de mano: en la mano si se ve, si no a la altura del pecho, del lado derecho
  function dibujarEnMano(ctx, img, an, G, pecho) {
    const iw = img.width, ih = img.height;
    let alto = (an.alto || 2) * G.E * .85;
    const piso = H - 12, hombro = Math.max(G.hL.y, G.hR.y);
    if (!pecho) alto = Math.min(alto, (piso - hombro) * .92);   // que no tape la cara: arranca debajo del hombro
    const s = alto / ih, w = iw * s, h = ih * s;
    let c = pecho ? G.body(-.45, -.55) : P(G.body(-.95, 0).x, Math.min(piso - h / 2, hombro + h / 2 + G.E * .4));   // del lado izquierdo: a la derecha va Byte
    c = P(Math.max(w / 2 + 10, Math.min(W - w / 2 - 10, c.x)), Math.min(H - h / 2 - 10, c.y));
    ctx.translate(c.x, c.y); ctx.rotate(pecho ? G.rot : .06); ctx.drawImage(img, -w / 2, -h / 2, w, h);
  }
  function debugDraw(ctx, G) {
    ctx.save(); ctx.lineWidth = 3;
    Object.entries(G.target).forEach(([k, [p, q]]) => { ctx.strokeStyle = "#0f0"; ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.stroke(); ctx.fillStyle = "#ff0"; ctx.font = "16px sans-serif"; ctx.fillText(k, p.x, p.y - 4); });
    [G.hL, G.hR, G.ojoL, G.ojoR].forEach(p => { ctx.fillStyle = "#f0f"; ctx.beginPath(); ctx.arc(p.x, p.y, 7, 0, 7); ctx.fill(); });
    ctx.restore();
  }
  function archPath(ctx, x, y, w, h) {
    const r = w / 2; ctx.beginPath(); ctx.moveTo(x, y + h); ctx.lineTo(x, y + r); ctx.arc(x + r, y + r, r, Math.PI, 0); ctx.lineTo(x + w, y + h); ctx.closePath();
  }
  // Byte, la mascota de la muestra, vestido igual, como sticker con borde blanco
  async function stickerByte(ctx, sel, chico) {
    const av = await svgToImage(BeatArt.avatarSVG(sel));
    const bw = chico ? 330 : 640, bh = bw * 700 / 460, bx = chico ? W - bw - 16 : (W - bw) / 2, by = H - bh + (chico ? 6 : -40);
    const st = canvas(bw + 40, bh + 40), sx = st.getContext("2d");
    sx.drawImage(av, 20, 20, bw, bh);
    const outline = canvas(bw + 40, bh + 40), ox = outline.getContext("2d");
    for (let a = 0; a < 360; a += 30) { const r = a * Math.PI / 180; ox.drawImage(st, Math.cos(r) * 9, Math.sin(r) * 9); }
    ox.globalCompositeOperation = "source-in"; ox.fillStyle = "#fff"; ox.fillRect(0, 0, outline.width, outline.height);
    ox.globalCompositeOperation = "source-over"; ox.drawImage(st, 0, 0);
    ctx.save(); ctx.shadowColor = "rgba(0,0,0,.35)"; ctx.shadowBlur = 24; ctx.translate(bx + bw / 2, by + bh / 2); ctx.rotate(chico ? .06 : 0);
    ctx.drawImage(outline, -bw / 2 - 20, -bh / 2 - 20); ctx.restore();
  }
  function gradeCanvas(src, filtro, grano) {
    const c = canvas(src.width, src.height), ctx = c.getContext("2d");
    ctx.filter = filtro || "none"; ctx.drawImage(src, 0, 0); ctx.filter = "none";
    if (grano) {   // grano fino parejo: une la foto, las prendas y el fondo en una sola "toma"
      const n = canvas(300, 375), nx = n.getContext("2d"), id = nx.createImageData(300, 375);
      for (let i = 0; i < id.data.length; i += 4) { const v = 128 + (Math.random() - .5) * 60; id.data[i] = id.data[i + 1] = id.data[i + 2] = v; id.data[i + 3] = 255; }
      nx.putImageData(id, 0, 0);
      ctx.save(); ctx.globalAlpha = .07; ctx.globalCompositeOperation = "overlay"; ctx.drawImage(n, 0, 0, c.width, c.height); ctx.restore();
    }
    const g = ctx.createRadialGradient(c.width / 2, c.height / 2, c.width * .4, c.width / 2, c.height / 2, c.width * .9);
    g.addColorStop(0, "rgba(0,0,0,0)"); g.addColorStop(1, "rgba(0,0,0,.35)"); ctx.fillStyle = g; ctx.fillRect(0, 0, c.width, c.height);
    return c;
  }

  /* ---------------- A) IA REAL (Gemini / Nano Banana) ---------------- */
  function findImage(obj, depth = 0) {
    if (!obj || typeof obj !== "object" || depth > 8) return null;
    const mt = obj.mime_type || obj.mimeType;
    if (typeof obj.data === "string" && obj.data.length > 1000 && (!mt || /^image\//.test(mt))) return { data: obj.data, mime: mt || "image/png" };
    for (const k of Object.keys(obj)) { const r = findImage(obj[k], depth + 1); if (r) return r; }
    return null;
  }
  async function callGemini(prompt, imgs, signal, aspect) {
    const key = KEY(), model = CFG.geminiModel || "gemini-nano-banana-2.1";
    const H_ = { "Content-Type": "application/json", "x-goog-api-key": key };
    const base = "https://generativelanguage.googleapis.com/v1beta";
    const input = [{ type: "text", text: prompt }, ...imgs.map(i => ({ type: "image", mime_type: i.mime, data: i.data }))];
    const tries = [
      { url: `${base}/interactions`, body: { model, input, response_format: { type: "image", mime_type: "image/jpeg", aspect_ratio: aspect || "4:5" } } },
      { url: `${base}/interactions`, body: { model, input } },
      { url: `${base}/models/${model}:generateContent`, body: { contents: [{ parts: [{ text: prompt }, ...imgs.map(i => ({ inline_data: { mime_type: i.mime, data: i.data } }))] }], generationConfig: { responseModalities: ["IMAGE", "TEXT"] } } }
    ];
    let lastErr;
    for (const t of tries) {
      try {
        const r = await fetch(t.url, { method: "POST", headers: H_, body: JSON.stringify(t.body), signal });
        const j = await r.json().catch(() => ({}));
        if (!r.ok) { lastErr = new Error((j.error && j.error.message) || ("HTTP " + r.status)); if (r.status === 401 || r.status === 403) break; continue; }
        const img = findImage(j);
        if (img) return img;
        lastErr = new Error("La respuesta no trajo imagen");
      } catch (e) { lastErr = e; if (e.name === "AbortError") break; }
    }
    throw lastErr;
  }
  async function toJPEG(src, max) {   // imagen (url/dataURL/canvas) → base64 JPEG chico para mandar
    const img = src instanceof HTMLCanvasElement ? src : await loadImage(src);
    const s = Math.min(1, max / Math.max(img.width, img.height));
    const c = canvas(Math.round(img.width * s), Math.round(img.height * s)), x = c.getContext("2d");
    x.fillStyle = "#fff"; x.fillRect(0, 0, c.width, c.height); x.drawImage(img, 0, 0, c.width, c.height);
    return { mime: "image/jpeg", data: c.toDataURL("image/jpeg", .88).split(",")[1] };
  }
  async function generateAI({ photo, ref, sel, esc, avatarIA }) {
    const req = buildAIRequest(ref, sel, esc);
    const imgs = [await toJPEG(photo, 1024)];
    for (const r of req.refs) { try { imgs.push(await toJPEG(r.url, 640)); } catch (e) { console.warn("ref", r.label, e); } }
    let texto = req.texto;
    if (avatarIA) {   // el avatar de Byte ya vestido por la IA: la persona tiene que quedar vestida igual
      imgs.push(await toJPEG(avatarIA, 640));
      texto += `\nThe LAST reference image shows the purple mascot Byte wearing the complete outfit: dress the person EXACTLY like Byte (same garments, hairstyle, colors and accessories), but as a real human in a real photograph.`;
    }
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), (CFG.aiTimeoutSeconds || 75) * 1000);
    try {
      const out = await callGemini(texto, imgs, ctrl.signal, "4:5");
      const img = await loadImage(`data:${out.mime};base64,${out.data}`);
      const c = canvas(W, H), ctx = c.getContext("2d"); drawCover(ctx, img, 0, 0, W, H);
      if (avatarIA) await stickerImg(ctx, avatarIA); else await stickerByte(ctx, sel, true);
      return c;
    } finally { clearTimeout(t); }
  }
  // sticker con la imagen de Byte vestido por la IA (tarjeta blanca inclinada, como una polaroid)
  async function stickerImg(ctx, src) {
    const im = await loadImage(src), bw = 300, bh = bw * im.height / im.width;
    ctx.save(); ctx.translate(W - bw / 2 - 40, H - bh / 2 - 40); ctx.rotate(.05);
    ctx.shadowColor = "rgba(0,0,0,.45)"; ctx.shadowBlur = 30; ctx.fillStyle = "#fff"; ctx.fillRect(-bw / 2 - 12, -bh / 2 - 12, bw + 24, bh + 24);
    ctx.shadowColor = "transparent"; ctx.drawImage(im, -bw / 2, -bh / 2, bw, bh); ctx.restore();
  }

  /* ---------------- AVATAR CON IA: Byte vestido con las prendas reales ----------------
     Se le manda a la IA la imagen de Byte + las fotos de las prendas elegidas. Cada combinación se guarda
     en esta compu (IndexedDB), así la segunda vez que alguien elige lo mismo aparece al instante y no se paga de nuevo. */
  const DB = { name: "cabinaByte", store: "avatares" };
  const idb = () => new Promise((res, rej) => { const r = indexedDB.open(DB.name, 1); r.onupgradeneeded = () => r.result.createObjectStore(DB.store); r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); });
  async function cacheGet(k) { try { const db = await idb(); return await new Promise(res => { const q = db.transaction(DB.store).objectStore(DB.store).get(k); q.onsuccess = () => res(q.result || null); q.onerror = () => res(null); }); } catch (e) { return null; } }
  async function cacheSet(k, v) { try { const db = await idb(); db.transaction(DB.store, "readwrite").objectStore(DB.store).put(v, k); } catch (e) { } }
  const avatarKey = (ref, sel) => ["v1", ref.id, ...["ropa", "pelo", "cabeza", "accesorio"].map(c => sel[c] ? (sel[c].img || sel[c].id) : "-")].join("|");
  async function avatarCacheado(ref, sel) { return cacheGet(avatarKey(ref, sel)); }
  async function avatarIA(ref, sel) {
    const k = avatarKey(ref, sel), hit = await cacheGet(k);
    if (hit) return hit;
    if (!KEY() || navigator.onLine === false) return null;
    const M = window.MEDIA || {};
    const imgs = [await toJPEG(M.byte_base, 700)], lines = [];
    const add = (label, it, how) => { const u = url(it); if (!u) return; imgs.push(null); lines.push({ u, t: `${label}: "${desc(it)}" (reference image ${imgs.length}) — ${how}` }); };
    add("CLOTHES", sel.ropa, "put it on Byte's body, fitted to its torso, real fabric, correct size (it must cover the whole body, not look tiny)");
    add("HAIR", sel.pelo, "a real wig/hairstyle placed naturally on top of Byte's round head, hairline on the forehead, proportional to the head (not giant)");
    add("HEAD ITEM", sel.cabeza, "worn on the head in the correct place");
    add("ACCESSORY", sel.accesorio, "worn or held naturally (necklaces on the neck, glasses on the eyes, bags hanging from the hand or shoulder)");
    for (let i = 1, j = 0; i < imgs.length; i++, j++) imgs[i] = await toJPEG(lines[j].u, 600);
    const texto =
`Image 1 is "Byte", a purple cartoon mascot (round purple head, big sleepy eyes, small purple body).
Dress Byte with these REAL items from the Argentine ${ref.tipo.toLowerCase()} "${ref.titulo}":
${lines.map((l, i) => `${i + 1}. ${l.t}`).join("\n")}
Keep Byte's exact face, eyes, purple color, cartoon proportions and style. The garments, hair and objects must look like the real ones in the reference photos (real fabric, real hair texture), correctly scaled and fitted to Byte's body, with consistent soft studio lighting and shadows.
Full body, centered, front view, plain soft light-grey studio background. No text, no logos added, no extra characters.`;
    const ctrl = new AbortController(), t = setTimeout(() => ctrl.abort(), (CFG.aiTimeoutSeconds || 75) * 1000);
    try {
      const out = await callGemini(texto, imgs, ctrl.signal, "4:5");
      const dataURL = `data:${out.mime};base64,${out.data}`;
      cacheSet(k, dataURL);
      return dataURL;
    } catch (e) { console.warn("avatar IA", e.message); return null; }
    finally { clearTimeout(t); }
  }
  // prueba la clave sin gastar: lista los modelos disponibles
  async function probarClave(k) {
    const r = await fetch("https://generativelanguage.googleapis.com/v1beta/models?pageSize=200", { headers: { "x-goog-api-key": k } });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error((j.error && j.error.message) || ("HTTP " + r.status));
    const ids = (j.models || []).map(m => (m.name || "").replace("models/", ""));
    return { ok: true, imagen: ids.filter(x => /image|banana/i.test(x)) };
  }
  function guardarClave(k) { try { if (k) localStorage.setItem(LSK, k); else localStorage.removeItem(LSK); } catch (e) { } }

  /* ---------------- función principal ---------------- */
  async function generar({ photo, ref, sel, esc, avatar }) {
    if (KEY() && photo && navigator.onLine !== false) {
      try { return { canvas: await generateAI({ photo, ref, sel, esc, avatarIA: avatar }), modo: "ia" }; }
      catch (e) { console.warn("IA falló → modo collage:", e.message); }
    }
    return { canvas: await composeLocal({ photo, ref, sel, esc }), modo: "collage" };
  }

  /* ---------------- hoja final para imprimir (10×15) ---------------- */
  async function hojaFinal({ imagen, modo, ref, sel, esc, veredicto }) {
    try { await Promise.all([document.fonts.load('70px "Anton"'), document.fonts.load('24px "Oswald"')]); } catch (e) { }
    const c = canvas(PW, PH), ctx = c.getContext("2d");
    ctx.fillStyle = "#ffffff"; ctx.fillRect(0, 0, PW, PH);
    const m = 44, iw = PW - m * 2, ih = Math.round(iw * 1.25);
    ctx.drawImage(imagen, m, m, iw, ih);
    // tira de película arriba y abajo de la foto
    ctx.fillStyle = "#111"; ctx.fillRect(m, m + ih, iw, 14);
    const y0 = m + ih + 72;
    ctx.fillStyle = "#111"; ctx.textBaseline = "alphabetic";
    let fs = 72; ctx.font = `${fs}px "Anton", Impact, sans-serif`;
    while (ctx.measureText(ref.titulo.toUpperCase()).width > 660 && fs > 30) { fs -= 4; ctx.font = `${fs}px "Anton", Impact, sans-serif`; }
    ctx.fillText(ref.titulo.toUpperCase(), m, y0 + 6);
    ctx.font = '500 22px "Oswald", "Arial Narrow", sans-serif'; ctx.fillStyle = "#555";
    const fecha = new Date().toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit", year: "numeric" });
    ctx.fillText(`${ref.tipo.toUpperCase()} · ${ref.anio}   ·   CABINA BYTE · ${fecha}`, m, y0 + 46);
    const piezas = [sel.ropa, sel.pelo, sel.cabeza, sel.accesorio].filter(x => !esNada(x)).map(x => x.nombre.toLowerCase());
    ctx.fillStyle = "#111"; ctx.font = '20px "Oswald", "Arial Narrow", sans-serif';
    wrap(ctx, "RECETA: " + [...piezas, esc.nombre.toLowerCase()].join(" + ").toUpperCase(), m, y0 + 86, 700, 28);
    const v = (veredicto || "recombina").toUpperCase();
    ctx.save(); ctx.translate(PW - m - 180, y0 + 20);
    ctx.fillStyle = VIOLETA; roundRect(ctx, -170, -62, 340, 132, 22); ctx.fill();
    ctx.fillStyle = "#fff"; ctx.textAlign = "center"; ctx.font = '500 19px "Oswald", "Arial Narrow", sans-serif'; ctx.fillText("MI VEREDICTO: LA IA…", 0, -24);
    ctx.font = '60px "Anton", Impact, sans-serif'; ctx.fillText(v, 0, 46); ctx.restore();
    ctx.textAlign = "left"; ctx.fillStyle = "#777"; ctx.font = '17px "Oswald", "Arial Narrow", sans-serif';
    ctx.fillText(modo === "ia" ? "IMAGEN GENERADA CON IA A PARTIR DE TU FOTO Y DE PIEZAS QUE YA EXISTÍAN." : "COLLAGE ARMADO CON TU FOTO Y PIEZAS QUE YA EXISTÍAN (SIN IA).", m, PH - 40);
    return c.toDataURL("image/jpeg", .92);
  }
  function roundRect(ctx, x, y, w, h, r) { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); }
  function wrap(ctx, text, x, y, maxW, lh) {
    const words = text.split(" "); let line = "";
    for (const w of words) { const t = line ? line + " " + w : w; if (ctx.measureText(t).width > maxW && line) { ctx.fillText(line, x, y); y += lh; line = w; } else line = t; }
    if (line) ctx.fillText(line, x, y);
  }

  window.Generador = { avatarIA, avatarCacheado, probarClave, guardarClave, tieneIA: () => !!KEY(), generar, hojaFinal, buildPrompt, buildAIRequest, loadMediaPipe, svgToImage, esNada, analizar, composeLocal, loadImage };
})();
