/* =====================================================================
   CABINA BYTE · FLUJO PRINCIPAL
   attract → foto → [parte 1] intro → película → vestuario → escenario → cierre
           → [parte 2] revelado (mientras se genera la foto)
           → [parte 3] casos con la barra como palanca + veredicto con la barra
           → resultado + impresión
   ===================================================================== */
(function () {
  const CFG = window.CABINA_CONFIG || {};
  const $ = (s) => document.querySelector(s);
  const stage = $("#stage");
  const els = { left: $("#left"), right: $("#right"), view: $("#viewInner"), vfLabel: $("#vfLabel"), track: $("#reelTrack"), hint: $("#reelHint"), reel: $("#reel"), overlay: $("#overlay"), toast: $("#toast"), lab: $("#labChip"), attract: $("#attract"), msg: $("#reelMsg") };
  const CATS = CATEGORIAS.map(c => c.key);

  /* ---------------- íconos de los controles físicos ---------------- */
  const ICON = {
    dial: `<svg viewBox="0 0 40 40"><circle cx="20" cy="20" r="18" fill="#fff" stroke="#111" stroke-width="2.5"/><circle cx="20" cy="20" r="9" fill="none" stroke="#111" stroke-width="2"/><circle cx="20" cy="20" r="2.2" fill="#111"/><path d="M20 3v6" stroke="#8b5cf6" stroke-width="3.5" stroke-linecap="round"/><path d="M6 10a17 17 0 0 1 6-5 M34 30a17 17 0 0 1-6 5" stroke="#8b5cf6" stroke-width="2.5" fill="none"/></svg>`,
    btn: `<svg viewBox="0 0 40 40"><circle cx="20" cy="20" r="18" fill="#2a2a33"/><circle cx="20" cy="19" r="13" fill="#e5322d" stroke="#8e1512" stroke-width="2"/><ellipse cx="16" cy="14.5" rx="5" ry="3" fill="#fff" opacity=".45"/></svg>`,
    cam: `<svg viewBox="0 0 40 40"><circle cx="20" cy="20" r="19" fill="#8b5cf6"/><rect x="11" y="15" width="18" height="13" rx="2.5" fill="#fff"/><rect x="16" y="12" width="8" height="4" rx="1" fill="#fff"/><circle cx="20" cy="21.5" r="4" fill="#8b5cf6"/></svg>`,
    slider: `<svg viewBox="0 0 40 40"><rect x="3" y="18" width="34" height="4" rx="2" fill="#bbb"/><circle cx="8" cy="20" r="4" fill="#bbb"/><circle cx="26" cy="20" r="8" fill="#8b5cf6" stroke="#fff" stroke-width="2"/></svg>`
  };
  const ACT = { btn: "boton", dial: "perilla", slider: "barra+" };
  // BOTÓN GRANDE de "qué hacer ahora": lo único que hay que apretar para avanzar
  const cta = (title, sub, act = "boton", ic) => `<div class="cta ${act === "barra+" ? "slide" : ""}" data-act="${act}"><span class="cta-ic">${ic ? ICON[ic] : act === "perilla" ? ICON.dial : act === "barra+" ? ICON.slider : ICON.btn}</span><span class="cta-tx">${sub ? `<small>${sub}</small>` : ""}<b>${title}</b></span><span class="cta-ar">→</span></div>`;
  const ctaBarra = (title, sub) => cta(title, sub, "barra+");
  const hint = (icon, text, pulse) => `<div class="hint ${pulse ? "pulse" : ""}" data-act="${ACT[icon]}">${ICON[icon]}<span>${text}</span></div>`;
  // segmento clickeable dentro de un mensaje del reel
  const seg = (icon, html, act) => `<span class="seg" data-act="${act || ACT[icon]}">${ICON[icon]}${html}</span>`;

  /* ---------------- estado ---------------- */
  let S;
  function fresh() {
    return {
      step: "attract", sub: null, photo: null,
      refIdx: 0, ref: null, idx: { ropa: 0, pelo: 0, cabeza: 0, accesorio: 0 }, ok: {}, catIdx: 0, vestDone: false,
      escIdx: 0, esc: null, seen: new Set(), factN: 0,
      gen: null, genOut: null, dev: { step: 0, shown: 0, disp: 0, backWarned: false },
      n3: { caso: 0, fase: "q", votos: [], final: 50, finalDone: false },
      hoja: null, printed: false, coached: new Set(), avatar: null, avatarProm: null, avatarKey: ""
    };
  }
  // en vestuario Byte arranca SIN NADA: sólo se ve lo que ya confirmaste + lo que estás probando
  const selVest = () => { const s = sel(), o = {}; CATS.forEach((c, i) => { if (S.vestDone || S.ok[c] || i === S.catIdx) o[c] = s[c]; }); return o; };
  const sel = () => S.ref ? { ropa: S.ref.ropa[S.idx.ropa], pelo: S.ref.pelo[S.idx.pelo], cabeza: S.ref.cabeza[S.idx.cabeza], accesorio: S.ref.accesorio[S.idx.accesorio] } : {};

  /* ---------------- escala 1920×1080 → pantalla ---------------- */
  function fit() {
    const s = Math.min(innerWidth / 1920, innerHeight / 1080);
    stage.style.transform = `scale(${s})`;
    stage.style.left = (innerWidth - 1920 * s) / 2 + "px";
    stage.style.top = (innerHeight - 1080 * s) / 2 + "px";
  }
  addEventListener("resize", fit); fit();

  /* ---------------- helpers de UI ---------------- */
  let toastT;
  function toast(msg, warn) { els.toast.textContent = msg; els.toast.className = "on" + (warn ? " warn" : ""); clearTimeout(toastT); toastT = setTimeout(() => els.toast.className = "", 3200); }
  function setNucleo(n) {
    document.querySelectorAll(".nuc").forEach(e => { const k = +e.dataset.n; e.classList.toggle("on", k === n); e.classList.toggle("done", k < n); });
  }
  function setBarra(labels, locks = []) {
    document.querySelectorAll(".barra-stop").forEach((e, i) => {
      e.querySelector("span").textContent = labels[i] || "";
      e.classList.toggle("on", Controles.barra === i + 1 && !!labels[i]);
      e.classList.toggle("lock", !!locks[i]);
    });
  }
  const BARRA_N1 = () => ["INICIO", "PELÍCULA", "VESTUARIO", "ESCENARIO"];
  const BARRA_N3 = ["—", "CREA", "RECOMBINA", "COPIA"];
  function overlay(html) {
    if (html && html.includes('class="ov-cta"')) html = html.replace('<div class="ov-cta">', `<div class="ov-tut">${tutHTML([T("btn", "Apretá el botón", "para seguir")], "")}</div><div class="ov-cta">`); if (html) els.toast.className = ""; els.overlay.innerHTML = html; els.overlay.className = html ? "on" : ""; }
  function vf(html) { els.vfLabel.innerHTML = html; }
  let reelKey = "";
  function reel(items, selIdx, key) {
    els.msg.innerHTML = "";
    if (key !== reelKey) {
      reelKey = key;
      els.track.innerHTML = items.map((it, i) => `<div class="frame ${it.cls || ""}" data-i="${i}"><div class="img">${it.img}</div><div class="cap">${it.label}</div></div>`).join("");
      els.track.style.transition = "none";
    } else els.track.style.transition = "";
    const frames = els.track.children;
    [...frames].forEach((f, i) => { f.classList.toggle("sel", i === selIdx); f.classList.toggle("chosen", !!(items[i] && items[i].chosen)); });
    const f = frames[selIdx];
    if (f) els.track.style.transform = `translateX(${960 - (f.offsetLeft + f.offsetWidth / 2)}px)`;
    requestAnimationFrame(() => els.track.style.transition = "");
    setTimeout(tut, 0);
  }
  /* ---------------- MINI TUTORIAL: qué hacer con la perilla y el botón en cada pantalla ---------------- */
  const T = (icon, title, sub) => ({ icon, title, sub });
  function tutSteps() {
    if (!S) return [];
    const st = S.step;
    if (st === "foto") return S.sub === "review" ? [T("dial", "Girá la perilla", "para sacar otra foto"), T("slider", "Deslizá la barra", "para ir a la siguiente sección")] : [T("btn", "Apretá el botón", "cuenta 3, 2, 1 y saca la foto")];
    if (st === "ref") return [T("dial", "Girá la perilla", "para ver las películas y series"), T("btn", "Apretá el botón", "para elegir la que ves"), T("slider", "Deslizá la barra", "para ir a la siguiente sección")];
    if (st === "vest") return S.vestDone ? [T("slider", "Deslizá la barra", "para ir a la siguiente sección")] : [T("dial", "Girá la perilla", "para probar " + CATEGORIAS[S.catIdx].nombre.toLowerCase()), T("btn", "Apretá el botón", "para confirmar y pasar a lo siguiente")];
    if (st === "esc") return [T("dial", "Girá la perilla", "para cambiar de lugar"), T("btn", "Apretá el botón", "para generar tu imagen")];
    if (st === "n2") return S.dev.step >= NUCLEO2.pasosTotales ? [T("btn", "Apretá el botón", "para seguir")] : [T("dial", "Girá a la derecha", "cada paso quita ruido"), T("dial", "Girá a la izquierda", "vuelve a meter ruido")];
    if (st === "n3") return S.n3.fase === "q" ? [T("dial", "Girá la perilla", "crea · recombina · copia"), T("btn", "Apretá el botón", "para votar")] : [T("btn", "Apretá el botón", "para ver el siguiente caso")];
    if (st === "n3final") return S.n3.finalDone ? [T("btn", "Apretá el botón", "para ver tu foto")] : [T("dial", "Girá la perilla", "crea · recombina · copia"), T("btn", "Apretá el botón", "para confirmar")];
    if (st === "result") return [T("btn", "Apretá el botón", CFG.imprimir && !S.printed ? "para imprimir tu foto" : "para terminar")];
    return [];
  }
  const tutHTML = (steps, head = "Cómo se usa") => steps.length ? `<div class="tut-h">${head}</div>` + steps.map(x => `<div class="tut-s ${x.icon}"><i>${ICON[x.icon]}</i><div>${x.title}<small>${x.sub}</small></div></div>`).join("") : "";
  function tut() { const el = $("#tut"); if (el) el.innerHTML = tutHTML(tutSteps()); }
  function reelMsg(html) {
    reelKey = ""; els.track.innerHTML = "";
    // si el mensaje no trae segmentos propios, todo el mensaje es clickeable según su ícono
    let act = "";
    if (!html.includes("data-act")) act = html.includes(ICON.btn) ? "boton" : html.includes(ICON.dial) ? "perilla" : "";
    els.msg.innerHTML = html ? `<div class="reel-msg" ${act ? `data-act="${act}"` : ""}>${html}</div>` : "";
    setTimeout(tut, 0);
  }
  const machineCard = (head, thumb, alt, tags) => `<div class="machine"><div class="m-head"><span>${head}</span><span>DATASET</span></div>
      <div class="m-pair">${thumb ? `<div class="m-thumb">${thumb}</div>` : ""}<div class="m-alt">${alt}</div></div>
      ${tags && tags.length ? `<div class="m-tags">${tags.map(t => `<span>#${t.replace(/\s+/g, "_")}</span>`).join("")}</div>` : ""}</div>`;
  const tagsFrom = (txt) => txt.split(/,\s*/).slice(0, 6);
  function fact(i) { const d = NUCLEO1.datos[i % NUCLEO1.datos.length], M = window.MEDIA || {}; return `<div class="fact ${d.img ? "has-img" : ""}" key="${i}">${d.img && M[d.img] ? `<img src="${M[d.img]}" alt="">` : ""}<p>${d.t}</p><div class="src">${d.f}</div></div>`; }
  const imgStrip = (list, pie) => { const M = window.MEDIA || {}; return `<div class="img-strip">${list.filter(x => M[x.img]).map(x => `<figure><img src="${M[x.img]}" alt=""><figcaption>${x.pie}</figcaption></figure>`).join("")}</div>${pie ? `<div class="img-strip-pie">${pie}</div>` : ""}`; };


  /* =================================================================
     TUTORIAL ANTES DE CADA PANTALLA: oscurece todo, hace zoom (reflector) sobre lo que hay que mirar
     y muestra el control FÍSICO animado (la perilla girando o el botón rojo bajando).
     Cualquier giro o botón pasa al siguiente paso; no hace nada más mientras está el tutorial.
     ================================================================= */
  const PANEL_DEFS = `<defs><radialGradient id="alu" cx="40%" cy="35%"><stop offset="0" stop-color="#f4f4f6"/><stop offset=".55" stop-color="#b9b9c2"/><stop offset="1" stop-color="#6d6d78"/></radialGradient>
      <radialGradient id="redb" cx="40%" cy="35%"><stop offset="0" stop-color="#ff8a7a"/><stop offset=".6" stop-color="#e5322d"/><stop offset="1" stop-color="#8e1512"/></radialGradient>
      <linearGradient id="cap" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f6f6f8"/><stop offset="1" stop-color="#9a9aa4"/></linearGradient></defs>`;
  const PANEL = (which) => {
    const lbl = (x, t) => `<text x="${x}" y="292" text-anchor="middle" fill="#cfc6dd" font-family="Oswald, Arial Narrow" font-size="26">${t}</text>`;
    if (which === "dial") return `<svg class="phys dial" viewBox="0 0 300 300">${PANEL_DEFS}
      <g class="k-wrap" transform="translate(150,140)">
        <circle r="78" fill="#0e0a15"/>
        <path class="k-arrow" d="M-96,-30 A100,100 0 0 1 -30,-96" fill="none" stroke="#9b6bff" stroke-width="7" stroke-linecap="round"/>
        <path class="k-arrow" d="M96,30 A100,100 0 0 1 30,96" fill="none" stroke="#9b6bff" stroke-width="7" stroke-linecap="round"/>
        <path class="k-arrow" d="M-30,-96 l-4,22 M-30,-96 l-22,-6 M30,96 l4,-22 M30,96 l22,6" stroke="#9b6bff" stroke-width="7" stroke-linecap="round"/>
        <g class="knob"><circle r="62" fill="url(#alu)" stroke="#55555f" stroke-width="3"/>
          ${Array.from({ length: 36 }, (_, i) => `<line x1="0" y1="-62" x2="0" y2="-54" stroke="#7a7a85" stroke-width="2" transform="rotate(${i * 10})"/>`).join("")}
          <circle r="40" fill="none" stroke="#9a9aa4" stroke-width="2"/><rect x="-4" y="-56" width="8" height="26" rx="3" fill="#2a2a33"/></g>
      </g>${lbl(150, "PERILLA")}</svg>`;
    if (which === "btn") return `<svg class="phys btn" viewBox="0 0 300 300">${PANEL_DEFS}
      <g class="b-wrap" transform="translate(150,140)">
        <circle r="78" fill="#0e0a15"/><circle r="62" fill="#3a0d0b"/>
        <g class="bbtn"><circle r="54" fill="url(#redb)" stroke="#5e0d0b" stroke-width="3"/><ellipse cx="-16" cy="-20" rx="20" ry="11" fill="#fff" opacity=".35"/></g>
        <circle class="b-ring" r="84" fill="none" stroke="#9b6bff" stroke-width="6"/>
      </g>${lbl(150, "BOTÓN")}</svg>`;
    return `<svg class="phys slider" viewBox="0 0 320 300">${PANEL_DEFS}
      <g class="s-wrap" transform="translate(40,140)">
        <rect x="-14" y="-40" width="268" height="80" rx="16" fill="#0e0a15"/>
        <rect x="0" y="-5" width="240" height="10" rx="5" fill="#000" stroke="#3a2f4d" stroke-width="2"/>
        ${[0, 1, 2, 3].map(i => `<line x1="${30 + i * 60}" y1="-30" x2="${30 + i * 60}" y2="-18" stroke="#8e83a3" stroke-width="3"/><text x="${30 + i * 60}" y="34" text-anchor="middle" fill="#8e83a3" font-family="IBM Plex Mono, monospace" font-size="14">${i + 1}</text>`).join("")}
        <path class="s-arrow" d="M60,-52 h120 m-14,-10 l14,10 l-14,10" fill="none" stroke="#9b6bff" stroke-width="6" stroke-linecap="round"/>
        <g class="scap"><rect x="16" y="-26" width="28" height="52" rx="6" fill="url(#cap)" stroke="#55555f" stroke-width="2"/><line x1="18" y1="0" x2="42" y2="0" stroke="#2a2a33" stroke-width="3"/></g>
      </g>${lbl(160, "BARRA")}</svg>`;
  };
  // UN tutorial por pantalla, una sola vez por visitante. La barra se explica sólo las dos primeras veces.
  // Tutoriales: sólo tres, una vez por visitante. Foto (botón) · barra (una vez, después de la foto) · vestir a Byte (perilla y botón)
  const COACH = {
    foto: [{ c: "btn", t: "Apretá el botón", s: "Contamos 3, 2, 1 y te sacamos la foto", q: ".cta" }],
    review: [{ c: "slider", t: "Deslizá la barra", s: "un paso para ir a la siguiente sección", q: "#barra" }],
    vest: [{ c: "dial", t: "Girá la perilla", s: "para probarle prendas a Byte", q: "#reelTrack .frame.sel" }, { c: "btn", t: "Apretá el botón", s: "para ponérsela", q: "#reelTrack .frame.sel" }]
  };
  let coachState = null;
  function coach(key) {
    if (!S || S.coached.has(key) || !COACH[key]) return;
    S.coached.add(key);
    coachState = { key, steps: COACH[key], i: 0, t: null };
    setTimeout(() => showCoachStep(), 420);   // espera a que la pantalla se acomode
  }
  function showCoachStep() {
    if (!coachState) return;
    const st = coachState.steps[coachState.i];
    let el = $("#coach"); if (!el) { el = document.createElement("div"); el.id = "coach"; stage.appendChild(el); }
    const tg = document.querySelector(st.q), sr = stage.getBoundingClientRect(), sc = sr.width / 1920;
    let hole = "";
    if (tg) { const r = tg.getBoundingClientRect(), pad = 18; const x = (r.left - sr.left) / sc - pad, y = (r.top - sr.top) / sc - pad, w = r.width / sc + pad * 2, h = r.height / sc + pad * 2; hole = `<div class="c-hole" style="left:${x}px;top:${y}px;width:${w}px;height:${h}px"></div>`; coachState.hy = y + h / 2; }
    const top = (coachState.hy || 540) > 560;   // la tarjeta va del lado contrario al reflector
    el.innerHTML = `${hole || `<div class="c-dim"></div>`}<div class="c-card ${top ? "up" : "down"}">${PANEL(st.c)}<div class="c-tx"><div class="c-step">${coachState.steps.length > 1 ? `Paso ${coachState.i + 1} de ${coachState.steps.length}` : "Cómo se usa"}</div><b>${st.t}</b><span>${st.s}</span></div></div>`;
    el.className = "on";
    clearTimeout(coachState.t); coachState.t = setTimeout(nextCoach, 3800);
  }
  function nextCoach() {
    if (!coachState) return;
    coachState.i++;
    if (coachState.i >= coachState.steps.length) { clearTimeout(coachState.t); coachState = null; const el = $("#coach"); if (el) el.className = ""; return; }
    showCoachStep();
  }
  // mientras está el tutorial, la perilla y el botón sólo lo hacen avanzar
  window.__coachTrap = (k) => { if (!coachState) return false; if (/^[1-4]$/.test(k)) { clearTimeout(coachState.t); coachState = null; const el = $("#coach"); if (el) el.className = ""; return false; } if (["Enter", " ", "ArrowLeft", "ArrowRight", "wheel"].includes(k)) { nextCoach(); return true; } return false; };
  stage.addEventListener("click", (e) => { if (coachState && e.target.closest("#coach")) { e.stopPropagation(); nextCoach(); } }, true);

  /* =================================================================
     ATRACCIÓN — Byte se viste solo, combinando piezas al azar
     ================================================================= */
  let attractT;
  const SPARK = (x, y, sz) => `<svg class="spark" style="left:${x}px;top:${y}px;width:${sz}px;height:${sz}px" viewBox="0 0 40 40"><path d="M20,0 Q22,18 40,20 Q22,22 20,40 Q18,22 0,20 Q18,18 20,0 Z" fill="currentColor"/></svg>`;
  function renderAttract() {
    stage.className = "s-attract"; overlay(""); els.lab.className = "";
    els.attract.innerHTML = `
      <div class="att-left">
        <div class="kicker">¿La IA crea o recombina?</div>
        <div class="att-title">ENTRÁ<br>A LA ESCENA</div>
        <div class="att-sub">Creá tu avatar con Byte y descubrí cómo la IA realiza imágenes</div>
        <div class="att-cta"><span class="pill" data-act="boton">Comenzar <i>→</i></span></div>
        <div class="kbd-legend">Sin la cabina armada: <b>clic</b> o <b>Enter</b> = botón · <b>rueda</b>, <b>← →</b> o clic en las opciones = perilla · <b>1 2 3 4</b> o clic en la barra de arriba = barra</div>
      </div>
      <div class="att-right"><div class="att-blob"></div><div class="att-strip"></div>
        ${SPARK(620, 20, 54)}${SPARK(40, 640, 34)}${SPARK(690, 520, 28)}
        <div class="att-photo"><div class="ph" id="attPh"></div><div class="cap" id="attCap"></div></div>
        <div class="att-tags" id="attTags"></div></div>`;
    const loop = () => {
      const ref = REFERENCIAS[Math.floor(Math.random() * REFERENCIAS.length)];
      const pick = (a) => a[Math.floor(Math.random() * a.length)];
      const real = (a) => { const r = a.filter(x => !Generador.esNada(x)); return pick(r.length ? r : a); };
      const s = { ropa: pick(ref.ropa), pelo: pick(ref.pelo), cabeza: real(ref.cabeza), accesorio: real(ref.accesorio) };
      const esc = pick(ref.escenarios);
      const ph = $("#attPh"); if (!ph) return;
      ph.innerHTML = BeatArt.stageSVG(esc, s);
      const parts = [s.ropa, s.pelo, s.cabeza, s.accesorio].filter(x => !Generador.esNada(x));
      $("#attCap").innerHTML = `<b>${ref.titulo}</b> + ${parts.map(p => p.nombre.toLowerCase()).join(" + ")} + ${esc.nombre.toLowerCase()}`;
      $("#attTags").innerHTML = parts.slice(0, 4).map((p, i) => `<span style="animation-delay:${i * .12}s">#${p.nombre.toLowerCase().replace(/\s+/g, "_")}</span>`).join("");
    };
    loop(); clearInterval(attractT); attractT = setInterval(loop, 2400);
  }

  /* =================================================================
     FOTO
     ================================================================= */
  let stream = null;
  async function startCam() {
    if (stream && stream.active) return stream;
    try { stream = await navigator.mediaDevices.getUserMedia({ video: { width: { ideal: 1280 }, height: { ideal: 960 }, facingMode: "user" }, audio: false }); }
    catch (e) { console.warn("Sin cámara", e); stream = null; }
    return stream;
  }
  const SILUETA = `<svg class="silhouette" viewBox="0 0 400 420"><path d="M200,30 C260,30 290,80 290,140 C290,200 255,240 200,240 C145,240 110,200 110,140 C110,80 140,30 200,30 Z M40,420 C50,320 110,270 200,270 C290,270 350,320 360,420" fill="none" stroke="#fff" stroke-width="5" stroke-dasharray="14 10"/></svg>`;
  async function renderFoto() {
    stage.className = "s-foto"; setNucleo(0); setBarra(["", "", "", ""]); overlay("");
    S.sub = "live";
    els.left.innerHTML = `<div class="kicker">Antes de entrar</div><div class="h-display">PRIMERO,<br>TU FOTO</div>
      <p class="lead big">Mirá a la cámara y ubicate en la silueta.</p>`;
    els.right.innerHTML = `<div class="kicker cel">Sobre tu foto</div>
      <p class="lead">No se guarda en la compu.${Generador.tieneIA() ? " Para transformarla se envía a la IA de Google." : ""}${QR_ON ? " Para darte el QR, tu foto final se sube a internet por un tiempo." : ""}</p>
      `;
    els.view.innerHTML = `<div class="camwrap"><video id="liveVid" class="mirror" autoplay playsinline muted></video>${SILUETA}</div>`;
    vf(`<span class="rec"></span>EN VIVO`);
    reelMsg(cta("Sacar la foto", "Ubicate dentro de la silueta", "boton", "cam")); coach("foto");
    const st = await startCam();
    if (S.step !== "foto") return;
    if (st) { const v = $("#liveVid"); v.srcObject = st; v.play().catch(() => { }); }
    else els.view.innerHTML = `<div class="nocam"><b>No encontramos la cámara</b>Revisá que esté conectada y que Edge tenga permiso.<br>Podés seguir igual: la foto final será sólo con Byte.</div>`;
    Generador.loadMediaPipe();   // precarga el recorte de persona
  }
  let counting = false;
  async function shoot() {
    if (counting) return; counting = true;
    for (const n of [3, 2, 1]) {
      if (S.step !== "foto") { counting = false; return; }
      const d = document.createElement("div"); d.className = "count"; d.textContent = n; els.view.firstElementChild.appendChild(d);
      await new Promise(r => setTimeout(r, 900)); d.remove();
    }
    const fl = $("#flash"); fl.className = ""; void fl.offsetWidth; fl.className = "go";
    const v = $("#liveVid");
    if (v && v.videoWidth) {
      const c = document.createElement("canvas"); c.width = v.videoWidth; c.height = v.videoHeight;
      const x = c.getContext("2d"); x.translate(c.width, 0); x.scale(-1, 1); x.drawImage(v, 0, 0);
      S.photo = c;
      els.view.innerHTML = `<div class="camwrap"></div>`; els.view.firstElementChild.appendChild(c);
    }
    S.sub = "review"; counting = false;
    vf(`FOTO 01`);
    els.hint.innerHTML = "";
    reelMsg(ctaBarra("Deslizá la barra", "¿Te gusta? Para ir a la siguiente sección")); Controles.barra = 1; setBarra(BARRA_N1()); coach("review");
  }

  /* =================================================================
     PARTE 1 · ¿De qué aprende la IA?
     ================================================================= */
  function renderN1Intro() {
    stage.className = "s-n1"; setNucleo(1); setBarra(BARRA_N1());
    overlay(`<div class="ov-card"><div class="ov-num">01</div><div>
      <div class="kicker">Parte 1 de 3</div><div class="h-display">${NUCLEO1.titulo.toUpperCase()}</div>
      <p class="lead">${NUCLEO1.intro}</p>
      <p class="lead" style="margin-top:18px">Vas a armar a <b>Byte</b> —y a vos— con piezas del cine argentino. Mirá, en cada elección, <b style="color:var(--violet)">cómo la describiría un dataset</b>.</p>
      ${imgStrip(NUCLEO1.introImgs, NUCLEO1.introPie)}
      <div class="ov-cta">${cta("Empezar a elegir", "Apretá el botón")}</div></div></div>`);
  }

  /* ---- película ---- */
  const TAG_ICON = { "Cárcel": "⛓", "Amistad": "🤝", "Crimen": "🔪", "Supervivencia": "🔥", "Violencia": "👊", "Venganza": "😠", "Tensión": "⚡", "Humor negro": "🖤", "Música": "🎵", "Sueños": "✨", "Adolescencia": "🎒", "Fútbol": "⚽", "Pueblo": "🏘", "Animación": "🎞", "Equipo": "👥", "Estrategia": "♟", "Investigación": "🔍", "Cultura pop": "📺", "Familia": "🛋", "Comedia": "😂", "Vida cotidiana": "🏠", "Grotesco": "🎭", "Clásico": "🎬", "Ciencia ficción": "🛸", "Buenos Aires": "🏙", "Historieta": "📖" };
  const LOCKS_N1 = () => [0, 0, !S.ref, !S.vestDone];
  function renderRef() {
    S.step = "ref"; stage.className = "s-n1 s-ref"; setNucleo(1); overlay("");
    setBarra(BARRA_N1(), LOCKS_N1());
    const ref = REFERENCIAS[S.refIdx], fotoURL = ref.foto && BeatArt.assetURL(ref.foto);
    const preview = { ropa: ref.ropa[0], pelo: ref.pelo[0], cabeza: ref.cabeza.find(x => !Generador.esNada(x)) || ref.cabeza[0], accesorio: ref.accesorio.find(x => !Generador.esNada(x)) };
    els.view.innerHTML = `<div class="refhero">
        ${fotoURL ? `<img class="bg" src="${fotoURL}" alt="">` : `<div class="bgsvg">${BeatArt.stageSVG(ref.escenarios[0], preview)}</div>`}
        <div class="fade"></div><div class="num">${String(S.refIdx + 1).padStart(2, "0")}</div>
        <div class="txt"><div class="tipo">${ref.tipo}</div><div class="titulo">${ref.titulo}</div><div class="anio">${ref.anio}</div>
          <div class="sinop">${ref.sinopsis}<br><small style="color:var(--dim);font-size:15px">${ref.creditos} · ${ref.medio}</small></div>
          <div class="tags">${(ref.tags || []).map(t => `<span><i>${TAG_ICON[t] || "•"}</i>${t}</span>`).join("")}</div></div>
        <div class="pager">${String(S.refIdx + 1).padStart(2, "0")} / ${String(REFERENCIAS.length).padStart(2, "0")}</div>
      </div>`;
    vf("");
    reel(REFERENCIAS.map((r, i) => ({ img: BeatArt.posterSVG(r), label: r.titulo, cls: "poster", chosen: S.ref === r })), S.refIdx, "refs");
    const elegida = S.ref === ref;
    coach("ref"); if (elegida) coach("refOk");
    els.hint.innerHTML = (elegida ? ctaBarra("Deslizá la barra", "Para ir a la siguiente sección") : cta("Elegir esta", `«${ref.titulo}»`));
  }
  function confirmRef(silencio) {
    const ref = REFERENCIAS[S.refIdx];
    if (S.ref !== ref) { S.ref = ref; S.idx = { ropa: 0, pelo: 0, cabeza: 0, accesorio: 0 }; S.ok = {}; S.catIdx = 0; S.vestDone = false; S.esc = null; S.escIdx = 0; }
    if (silencio) return;
    renderRef();
    toast(`«${ref.titulo}» elegida ✓  Deslizá la barra para ir a la siguiente sección`);
  }

  /* ---- vestuario ---- */
  function renderVest() {
    S.step = "vest"; stage.className = "s-n1"; setNucleo(1); overlay("");
    setBarra(BARRA_N1(), LOCKS_N1());
    const ref = S.ref, cat = CATS[S.catIdx], list = ref[cat], item = list[S.idx[cat]];
    S.seen.add(ref.id + cat + item.id);
    const bgEsc = S.esc || null;
    const useAI = S.vestDone && S.avatar;
    els.view.innerHTML = useAI ? `<div class="byte-spot ai"><img class="byte-ai" src="${S.avatar}" alt=""><span class="ai-badge">Byte vestido por la IA</span></div>`
      : `<div class="byte-spot">${bgEsc ? BeatArt.stageSVG(bgEsc, selVest()) : BeatArt.stageSVG(null, selVest()).replace('fill="#efe7d6"', 'fill="transparent"')}${S.vestDone && S.avatarProm ? `<span class="ai-badge wait"><i></i>La IA está vistiendo a Byte con las prendas reales…</span>` : ""}</div>`;
    if (S.vestDone) els.view.insertAdjacentHTML("beforeend", `<div class="done-banner"><b>¡BYTE ESTÁ LISTO!</b><span>Terminaste de vestirlo. Deslizá la barra para ir a la siguiente sección</span></div>`);
    vf(`<span class="rec"></span>VESTUARIO · ${ref.titulo.toUpperCase()}`);
    const alt = item.caption || "(sin descripción: no hay nada que aprender de esta imagen)";
    els.left.innerHTML = `<div class="kicker">${ref.titulo}</div><div class="h-display">${CATEGORIAS[S.catIdx].nombre}</div>
      <p class="lead big">Como la IA: combinás lo que ya existe.</p>
      ${machineCard("ASÍ LO VE LA IA", BeatArt.itemIconSVG(cat, item), alt, [])}`;
    els.right.innerHTML = wheel();
    reel(list.map((it, i) => ({ img: BeatArt.itemIconSVG(cat, it), label: it.nombre, chosen: S.ok[cat] && S.idx[cat] === i })), S.idx[cat], "vest-" + ref.id + cat);
    coach("vest");
    els.hint.innerHTML = S.vestDone ? ctaBarra("Deslizá la barra", "Byte está listo · para ir a la siguiente sección") : cta(`Confirmar ${CATEGORIAS[S.catIdx].nombre.toLowerCase()}`, `Paso ${S.catIdx + 1} de ${CATS.length}`);
  }
  const CAT_ICON = {
    ropa: `<svg viewBox="0 0 48 48" fill="none" stroke="#111" stroke-width="2.4" stroke-linejoin="round"><path d="M17 6 L8 11 L4 21 L11 23 L12 42 L36 42 L37 23 L44 21 L40 11 L31 6 Q24 12 17 6 Z"/></svg>`,
    pelo: `<svg viewBox="0 0 48 48" fill="none" stroke="#111" stroke-width="2.4"><path d="M10 40 C6 22 12 6 24 6 C36 6 42 22 38 40"/><path d="M15 36 C14 24 18 16 24 16 C30 16 34 24 33 36"/><path d="M18 10 C20 16 28 16 32 11"/></svg>`,
    cabeza: `<svg viewBox="0 0 48 48" fill="none" stroke="#111" stroke-width="2.4" stroke-linejoin="round"><path d="M8 30 C8 16 16 10 24 10 C32 10 40 16 40 30 Z"/><path d="M40 30 L46 31 M8 30 L4 31 M24 10 V7"/><path d="M6 30 H42"/></svg>`,
    accesorio: `<svg viewBox="0 0 48 48" fill="none" stroke="#111" stroke-width="2.4"><rect x="4" y="18" width="16" height="12" rx="5"/><rect x="28" y="18" width="16" height="12" rx="5"/><path d="M20 22 Q24 19 28 22 M4 22 L2 18 M44 22 L46 18"/></svg>`
  };
  // rueda de categorías (como en el Figma): Ropa · Pelo · Cabeza · Accesorios
  function wheel() {
    const pos = [[190, 40], [280, 210], [280, 380], [190, 550]];
    return `<div class="wheel">${CATEGORIAS.map((c, i) => `<div class="wc ${i === S.catIdx ? "on" : ""} ${S.ok[c.key] ? "ok" : ""}" data-cat="${i}" style="left:${pos[i][0] - (i === S.catIdx ? 14 : 0)}px;top:${pos[i][1]}px"><i>${CAT_ICON[c.key]}</i><span>${c.nombre}</span></div>`).join("")}</div>`;
  }
  // pide a la IA a Byte vestido con las prendas reales (si hay clave). Si ya se generó esa combinación, sale al instante.
  function pedirAvatarIA() {
    const s = sel(), key = S.ref.id + JSON.stringify(CATS.map(c => s[c] && (s[c].img || s[c].id)));
    if (S.avatarKey === key) return;
    S.avatarKey = key; S.avatar = null;
    if (!Generador.tieneIA()) { Generador.avatarCacheado(S.ref, s).then(a => { if (a && S.avatarKey === key) { S.avatar = a; if (S.step === "vest") renderVest(); } }); return; }
    const p = S.avatarProm = Generador.avatarIA(S.ref, s).then(a => { if (S.avatarKey !== key) return null; S.avatar = a; S.avatarProm = null; if (S.step === "vest" || S.step === "esc") (S.step === "vest" ? renderVest : renderEsc)(); return a; });
    return p;
  }
  function confirmVest() {
    const cat = CATS[S.catIdx];
    S.ok[cat] = true;
    if (S.catIdx < CATS.length - 1) { S.catIdx++; renderVest(); toast(`${CATEGORIAS[S.catIdx - 1].nombre} ✓  ·  Ahora: ${CATEGORIAS[S.catIdx].nombre.toLowerCase()}`); }
    else { S.vestDone = true; els.toast.className = ""; pedirAvatarIA(); renderVest(); }
  }

  /* ---- escenario ---- */
  function renderEsc() {
    S.step = "esc"; stage.className = "s-n1"; setNucleo(1); overlay("");
    setBarra(BARRA_N1(), LOCKS_N1());
    const ref = S.ref, esc = ref.escenarios[S.escIdx];
    S.seen.add(ref.id + "esc" + esc.id);
    els.view.innerHTML = `<div>${BeatArt.stageSVG(esc, sel())}</div>`;
    vf(`<span class="rec"></span>ESCENARIO ${S.escIdx + 1}/${ref.escenarios.length}`);
    els.left.innerHTML = `<div class="kicker cel">¿Sabías que…?</div>${fact(6)}`;
    els.right.innerHTML = `<div class="kicker">Paso 3 · Elegí el escenario</div><div class="h-display md">${esc.nombre.toUpperCase()}</div>
      <p class="lead big">Cuando te guste, apretá el botón y <b>la IA genera tu foto</b>.</p>`;
    reel(ref.escenarios.map(e => ({ img: BeatArt.sceneSVG(e), label: e.nombre, cls: "wide" })), S.escIdx, "esc-" + ref.id);
    coach("esc");
    els.hint.innerHTML = cta("Confirmar y generar", "Último paso");
  }
  function confirmEsc() {
    S.esc = S.ref.escenarios[S.escIdx];
    // arranca la generación en segundo plano
    const args = { photo: S.photo, ref: S.ref, sel: sel(), esc: S.esc };
    els.lab.className = "on"; els.lab.innerHTML = `<i></i>Revelando tu foto…`;
    S.gen = Promise.resolve(S.avatarProm || S.avatar).then(av => { args.avatar = av || S.avatar || null; return Generador.generar(args); }).then(out => { S.genOut = out; els.lab.className = "on ready"; els.lab.innerHTML = `<i></i>Tu foto está lista`; if (S.step === "result") renderResult(); return out; })
      .catch(e => { console.error(e); S.genOut = { error: e }; });
    renderN1Cierre();
  }
  function renderN1Cierre() {
    S.step = "n1cierre";
    const s = sel(), parts = [S.ref.titulo, ...[s.ropa, s.pelo, s.cabeza, s.accesorio].filter(x => !Generador.esNada(x)).map(x => x.nombre), S.esc.nombre];
    overlay(`<div class="ov-card"><div class="ov-num">01</div><div>
      <div class="kicker">Parte 1 de 3 · cierre</div><div class="h-display">${NUCLEO1.cierreTitulo.toUpperCase()}</div>
      <p class="lead">${NUCLEO1.cierre}</p>
      <div class="prompt-box" style="font-size:19px">${parts.map((p, i) => `<span class="w" style="animation-delay:${i * .15}s">${p}</span>`).join(" + ")} = <b style="color:var(--amber)">tu imagen</b></div>
      <div class="ov-cta">${cta("Seguir", "¿Cómo se construye una imagen?")}</div></div></div>`);
  }

  /* =================================================================
     PARTE 2 · ¿Cómo se construye una imagen?  — revelado con la perilla
     ================================================================= */
  let devCanvas, devRAF, devTargets = [], devWashed = [];
  const DW = 820, DH = 656;
  async function renderN2Intro() {
    S.step = "n2intro"; setNucleo(2); setBarra(["", "", "", ""]);
    overlay(`<div class="ov-card"><div class="ov-num">02</div><div>
      <div class="kicker">Parte 2 de 3</div><div class="h-display">${NUCLEO2.titulo.toUpperCase()}</div>
      <p class="lead">Mientras la cabina genera tu foto, vas a hacer vos el trabajo del modelo. Las IA de imágenes más usadas son <b>modelos de difusión</b>: empiezan con ruido y lo van limpiando paso a paso.</p>
      <p class="lead" style="margin-top:16px">${NUCLEO2.instruccion}</p>
      <div class="ov-cta">${cta("Empezar", "Después, girá la perilla")}</div></div></div>`);
  }
  async function renderN2() {
    S.step = "n2"; overlay(""); stage.className = "s-n2"; setNucleo(2); setBarra(["", "", "", ""]);
    els.view.innerHTML = `<canvas id="devC" width="${DW}" height="${DH}"></canvas><div class="dev-pie" id="devPie"></div>`;
    devCanvas = $("#devC");
    // cada estación tiene su propia imagen (hecha por IA), relacionada con lo que cuenta
    devTargets = await Promise.all(NUCLEO2.estaciones.map(e => targetN2(e.img).catch(err => { console.warn("N2", e.img, err); return blankTarget(); })));
    devWashed = devTargets.map(lavar);
    if (S.step !== "n2") return;
    cancelAnimationFrame(devRAF); devLoop();
    updateN2Panels(); coach("n2");
  }
  const blankTarget = () => { const c = document.createElement("canvas"); c.width = DW; c.height = DH; const x = c.getContext("2d"); x.fillStyle = "#efe8ff"; x.fillRect(0, 0, DW, DH); return c; };
  function coverInto(img, fy = .5) {
    const c = blankTarget(), x = c.getContext("2d"), iw = img.naturalWidth || img.width, ih = img.naturalHeight || img.height;
    const s = Math.max(DW / iw, DH / ih), w = iw * s, h = ih * s;
    x.drawImage(img, (DW - w) / 2, (DH - h) * fy, w, h); return c;
  }
  // imágenes verticales: enteras, sobre una versión desenfocada de sí mismas
  function containInto(img) {
    const c = coverInto(img), x = c.getContext("2d"), b = blankTarget(), bx = b.getContext("2d");
    bx.filter = "blur(18px) brightness(.8)"; bx.drawImage(c, -30, -30, DW + 60, DH + 60); bx.filter = "none";
    const iw = img.naturalWidth || img.width, ih = img.naturalHeight || img.height, s = Math.min(DW / iw, DH / ih);
    bx.drawImage(img, (DW - iw * s) / 2, (DH - ih * s) / 2, iw * s, ih * s); return b;
  }
  const imgFrom = (src) => new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = src; });
  async function targetN2(kind) {
    const M = window.MEDIA || {};
    if (kind === "astronauta" && M.ia_astronauta) return containInto(await imgFrom(M.ia_astronauta));
    if (kind === "deepdream" && M.n2_deepdream_mona) return containInto(await imgFrom(M.n2_deepdream_mona));
    if (kind === "castillo" && M.ia_ddim_castillo) return containInto(await imgFrom(M.ia_ddim_castillo));
    if (kind === "estilos") {   // el mismo pedido con 4 estilos distintos, en una grilla de 2×2
      const c = blankTarget(), x = c.getContext("2d"); x.fillStyle = "#111"; x.fillRect(0, 0, DW, DH);
      const L = [["ia_astro_davinci", "by da Vinci"], ["ia_astro_monet", "by Monet"], ["ia_astro_hiroshige", "by Hiroshige"], ["ia_astro_picasso", "by Picasso"]];
      const sz = DH / 2 - 6, x0 = (DW - sz * 2 - 6) / 2;
      for (let i = 0; i < 4; i++) {
        if (!M[L[i][0]]) continue;
        const im = await imgFrom(M[L[i][0]]), px = x0 + (i % 2) * (sz + 6), py = 3 + Math.floor(i / 2) * (sz + 6);
        x.drawImage(im, px, py, sz, sz);
        x.font = '600 18px "IBM Plex Mono", monospace'; const w = x.measureText(L[i][1]).width + 20;
        x.fillStyle = "rgba(139,92,246,.92)"; x.fillRect(px + 8, py + sz - 38, w, 30); x.fillStyle = "#fff"; x.fillText(L[i][1], px + 18, py + sz - 17);
      }
      return c;
    }
    if (kind === "noexiste" && M.ia_noexiste) return containInto(await imgFrom(M.ia_noexiste));
    if (kind === "final") {
      if (S.genOut && S.genOut.canvas) return containInto(S.genOut.canvas);
      return coverInto(await Generador.svgToImage(BeatArt.stageSVG(S.esc, sel(), { attrs: 'width="1000" height="800"' })));
    }
    return blankTarget();
  }
  // versión "lavada" de cada imagen: menos color y contraste, como las primeras etapas de la difusión
  function lavar(src) {
    const c = blankTarget(), x = c.getContext("2d");
    x.filter = "saturate(.35) contrast(.62) brightness(1.1) blur(6px)"; x.drawImage(src, 0, 0); x.filter = "none";
    return c;
  }
  // ruido "latente": cuadraditos de colores apagados (no estática de tele). Cambia sólo cuando girás.
  let noiseKey = -1, noiseCv = null;
  function latentNoise(key, cols) {
    if (key === noiseKey && noiseCv && noiseCv.width === cols) return noiseCv;
    noiseKey = key;
    const rows = Math.max(2, Math.round(cols * DH / DW));
    const c = noiseCv && noiseCv.width === cols && noiseCv.height === rows ? noiseCv : document.createElement("canvas");
    c.width = cols; c.height = rows;
    const x = c.getContext("2d"), id = x.createImageData(cols, rows);
    let seed = key * 9301 + 49297; const rnd = () => (seed = (seed * 9301 + 49297) % 233280) / 233280;
    for (let i = 0; i < id.data.length; i += 4) {
      const g = 105 + rnd() * 80;   // gris medio
      id.data[i] = g + (rnd() - .5) * 70; id.data[i + 1] = g + (rnd() - .5) * 60; id.data[i + 2] = g + (rnd() - .5) * 80; id.data[i + 3] = 255;
    }
    x.putImageData(id, 0, 0); noiseCv = c; return c;
  }
  function devLoop() {
    if (S.step !== "n2") return;
    S.dev.disp += (S.dev.step - S.dev.disp) * .14;
    if (Math.abs(S.dev.step - S.dev.disp) < .002) S.dev.disp = S.dev.step;
    drawDev(S.dev.disp);
    devRAF = requestAnimationFrame(devLoop);
  }
  // 10 pasos, 5 estaciones de 2 pasos: en cada estación la imagen pasa de ruido (t=0) a limpia (t=1)
  function stationAt(step) {
    const n = NUCLEO2.estaciones.length, per = NUCLEO2.pasosTotales / n;
    if (step <= 0) return { k: 0, t: 0 };
    const k = Math.min(n - 1, Math.ceil(step / per - 1e-6) - 1);
    return { k, t: Math.max(0, Math.min(1, (step - k * per) / per)) };
  }
  function drawDev(step) {
    const ctx = devCanvas.getContext("2d"), W = DW, H = DH;
    const { k, t } = stationAt(step), target = devTargets[k] || devTargets[0], washed = devWashed[k] || target;
    if (!target) return;
    const e = t * t * (3 - 2 * t);   // suave
    // 1. la imagen en "cuadraditos": de pocos bloques grandes a la resolución completa
    const cols = Math.max(8, Math.round(8 + Math.pow(e, 1.8) * (W - 8)));
    const tmp = drawDev.tmp || (drawDev.tmp = document.createElement("canvas"));
    tmp.width = cols; tmp.height = Math.max(2, Math.round(cols * H / W));
    const tx = tmp.getContext("2d");
    tx.globalAlpha = 1; tx.drawImage(washed, 0, 0, tmp.width, tmp.height);           // primero, lavada
    tx.globalAlpha = Math.pow(e, 1.3); tx.drawImage(target, 0, 0, tmp.width, tmp.height);   // el color vuelve de a poco
    tx.globalAlpha = 1;
    ctx.imageSmoothingEnabled = e > .9;
    ctx.drawImage(tmp, 0, 0, W, H);
    // 2. ruido latente: bloques apagados que se van restando
    const amt = Math.pow(1 - e, 1.15);
    if (amt > .01) {
      const nCols = Math.round(20 + e * 60);          // los bloques de ruido se achican a medida que limpia
      ctx.imageSmoothingEnabled = false;
      ctx.globalAlpha = amt * .9; ctx.drawImage(latentNoise(Math.round(step * 3), nCols), 0, 0, W, H);
      ctx.globalAlpha = amt * .22; ctx.fillStyle = "#e9e4f2"; ctx.fillRect(0, 0, W, H);   // velo "lavado"
      ctx.globalAlpha = 1;
    }
    // 3. grilla del espacio latente (64 × 64) mientras la imagen todavía es "números"
    if (e < .5) { ctx.strokeStyle = `rgba(255,255,255,${.22 * (1 - e * 2)})`; ctx.lineWidth = 1; ctx.beginPath(); for (let x = 0; x <= W; x += W / 64) { ctx.moveTo(x, 0); ctx.lineTo(x, H); } for (let y = 0; y <= H; y += H / 51) { ctx.moveTo(0, y); ctx.lineTo(W, y); } ctx.stroke(); }
  }
  const fill = (txt) => txt.replace(/\{escenario\}/g, S.esc ? S.esc.nombre.toLowerCase() : "el escenario");
  function currentStation() { return stationAt(S.dev.step).k; }
  function updateN2Panels() {
    const k = currentStation(), est = NUCLEO2.estaciones[k], tot = NUCLEO2.pasosTotales, done = S.dev.step >= tot;
    // si la foto se terminó de generar mientras girabas, la última estación muestra TU foto
    
    vf(`<span class="rec"></span>PASO ${S.dev.step}/${tot} · ${done ? "IMAGEN" : stationAt(S.dev.step).t >= 1 ? "LIMPIA" : "QUITANDO RUIDO"}`);
    const pie = $("#devPie"); if (pie) pie.innerHTML = fill(est.pie || "");
    els.left.innerHTML = `<div class="kicker">Revelado · ${tot} pasos</div><div class="dev-steps">${NUCLEO2.estaciones.map((e, i) => `<div class="dev-step ${i < k || done ? "ok" : ""} ${i === k && !done ? "now" : ""}"><i>${i + 1}</i>${e.titulo.replace(/^\d · /, "")}</div>`).join("")}</div>
      <div class="dial-meter"><div class="ring" style="transform:rotate(${S.dev.step * 36}deg)"></div><div class="num">${String(S.dev.step).padStart(2, "0")}<small>/ ${tot} PASOS</small></div></div>
      <div class="progress"><i style="width:${S.dev.step / tot * 100}%"></i></div>`;
    let extra = "";
    if (est.prompt) { const p = Generador.buildPrompt(S.ref, sel(), S.esc); extra = `<div class="prompt-box">${p.palabras.map((w, i) => `<span class="w" style="animation-delay:${i * .12}s">${w}</span>`).join(" · ")}</div>`; }
    if (k === 1) extra = `<div class="vec">«…by Monet» &nbsp;→ [0.412, −0.087, 0.733, …]<br>«…by Picasso» → [−0.215, 0.390, 0.044, …]</div><div class="src" style="margin-top:6px;font-size:12px">*valores ilustrativos: otra palabra, otros números, otra imagen</div>`;
    if (k === 2) extra = `<div class="vec">512 × 512 px  →  latente 64 × 64 × 4</div>`;
    els.right.innerHTML = `<div class="kicker">Estación ${k + 1} de ${NUCLEO2.estaciones.length}</div><div class="h-display md">${est.titulo.replace(/^\d · /, "").toUpperCase()}</div>
      <p class="lead" style="font-size:19px">${fill(est.texto)}</p>${extra}${est.f ? `<div class="src">${est.f}</div>` : ""}`;
    if (done) reelMsg(`<span class="rm-l">¡REVELADA! <small>Pero… ¿esto es crear?</small></span>${cta("Seguir", "¿Crea, recombina o copia?")}`);
    else { reelMsg(`<span class="rm-l">${tot - S.dev.step} ${tot - S.dev.step === 1 ? "paso" : "pasos"} <small>para revelar la imagen</small></span>`); }
  }

  /* =================================================================
     PARTE 3 · ¿Crea, recombina o copia? — la barra es la palanca
     ================================================================= */
  const VKEY = "cabinaBeat.votos.v1";
  function loadVotes() { try { return JSON.parse(localStorage.getItem(VKEY)) || { casos: {}, final: [] }; } catch (e) { return { casos: {}, final: [] }; } }
  function saveVotes(v) { try { localStorage.setItem(VKEY, JSON.stringify(v)); } catch (e) { } }
  const barraVerdict = () => ({ 2: "crea", 3: "recombina", 4: "copia" })[Controles.barra] || null;

  function renderN3Intro() {
    S.step = "n3intro"; setNucleo(3); setBarra(BARRA_N3);
    overlay(`<div class="ov-card"><div class="ov-num">03</div><div>
      <div class="kicker">Parte 3 de 3</div><div class="h-display">${NUCLEO3.titulo.toUpperCase()}</div>
      <p class="lead">Ahora sos jurado. Te mostramos <b>5 casos</b>: cuatro reales y uno que es tu propia foto. Con la <b>perilla</b> elegís tu veredicto y lo confirmás con el <b>botón</b>:</p>
      <div class="verdicts" style="margin-top:22px"><div class="verdict" data-p="2">CREA</div><div class="verdict" data-p="3">RECOMBINA</div><div class="verdict" data-p="4">COPIA</div></div>
      ${imgStrip(NUCLEO3.introImgs)}
      <div class="ov-cta">${cta("Ver el primer caso", "¿Crea, recombina o copia?")}</div></div></div>`);
  }
  // imagen + pedido (prompt) de cada caso, para entender qué hizo la IA
  const n3fill = (t) => t.replace(/\{escenario\}/g, S.esc ? S.esc.nombre.toLowerCase() : "el escenario").replace(/\{prompt\}/g, () => S.ref && S.esc ? Generador.buildPrompt(S.ref, sel(), S.esc).texto : "");
  function caseMedia(c, fase) {
    const M = window.MEDIA || {};
    if (c.pasos) {
      const th = (src, lbl, i) => `<figure class="cm-step"><div class="cm-th" id="cmStep${i}">${src ? `<img src="${src}" alt="">` : ""}</div><figcaption><b>${i + 1}</b> ${lbl}</figcaption></figure>`;
      setTimeout(fillMask, 30);
      return `<div class="cm-big cm-row">${th(S.photo ? S.photo.toDataURL("image/jpeg", .7) : "", "Tu foto", 0)}<i class="cm-arrow">→</i>${th("", "Tu silueta, calculada por la IA", 1)}<i class="cm-arrow">→</i>${th(S.genOut && S.genOut.canvas ? S.genOut.canvas.toDataURL("image/jpeg", .7) : "", "En «" + (S.esc ? S.esc.nombre : "") + "»", 2)}</div>`;
    }
    if (c.grilla === "sombreros") return `<figure class="cm-big cm-grid">${gridSombreros()}<figcaption>${c.pieGrilla || ""}</figcaption></figure>`;
    const k = fase === "a" && c.img2 ? "img2" : "img", pie = fase === "a" && c.img2 ? c.pie2 : c.pie;
    return c[k] && M[c[k]] ? `<figure class="cm-big"><img src="${M[c[k]]}" alt=""><figcaption>${pie || ""}</figcaption></figure>` : "";
  }
  // 100 personas, 99 con sombrero: la máquina repite y combina lo que más vio
  function gridSombreros() {
    const hats = ["#c0392b", "#1e8449", "#111", "#b9770e", "#7d3c98", "#a04000", "#2e4053", "#d4ac0d"], skins = ["#8d5524", "#c68642", "#e0ac69", "#a0522d", "#6b4423"];
    let seed = 7; const rnd = () => (seed = (seed * 9301 + 49297) % 233280) / 233280;
    let g = "";
    for (let i = 0; i < 100; i++) {
      const x = (i % 10) * 60 + 30, y = Math.floor(i / 10) * 44 + 26, sk = skins[Math.floor(rnd() * skins.length)], h = hats[Math.floor(rnd() * hats.length)], h2 = hats[Math.floor(rnd() * hats.length)];
      const sin = i === 63;
      g += `<g transform="translate(${x},${y})" ${sin ? 'class="g-sin"' : ""}><path d="M-13,20 Q-13,6 0,6 Q13,6 13,20 Z" fill="${sin ? "#8b5cf6" : "#5d6d7e"}"/><circle cy="-2" r="7" fill="${sk}"/>${sin ? "" : `<ellipse cy="-8" rx="${15 + rnd() * 4}" ry="4" fill="${h}"/><path d="M-6,-8 Q-6,-20 0,-20 Q6,-20 6,-8 Z" fill="${h}"/><rect x="-6" y="-11" width="12" height="2.5" fill="${h2}"/>`}</g>`;
    }
    return `<svg viewBox="0 0 600 450" class="somb-grid"><rect width="600" height="450" fill="#fff"/>${g}<rect x="${3 * 60 + 2}" y="${6 * 44 + 2}" width="56" height="44" rx="8" fill="none" stroke="#8b5cf6" stroke-width="3"/></svg>`;
  }
  const casePrompt = (c) => c.prompt ? `<div class="cm-prompt"><span class="cm-pl">${c.promptNota || "Prompt"}</span><span class="cm-pt">${n3fill(c.prompt)}</span></div>` : "";
  async function fillMask() {
    const box = $("#cmStep1"); if (!box || !S.photo) { if (box) box.innerHTML = `<div class="cm-na">Sin foto</div>`; return; }
    try {
      const mp = await Generador.loadMediaPipe(); const A = Generador.analizar(mp, S.photo);
      if (!A.persona) { box.innerHTML = `<div class="cm-na">No se pudo calcular</div>`; return; }
      const c = document.createElement("canvas"); c.width = S.photo.width; c.height = S.photo.height; const x = c.getContext("2d");
      x.fillStyle = "#1b1030"; x.fillRect(0, 0, c.width, c.height);
      const m = document.createElement("canvas"); m.width = c.width; m.height = c.height; const mx = m.getContext("2d");
      mx.drawImage(A.persona, 0, 0, c.width, c.height); mx.globalCompositeOperation = "source-in"; mx.fillStyle = "#8b5cf6"; mx.fillRect(0, 0, c.width, c.height);
      if (A.cara) { const f = document.createElement("canvas"); f.width = c.width; f.height = c.height; const fx = f.getContext("2d"); fx.drawImage(A.cara, 0, 0, c.width, c.height); fx.globalCompositeOperation = "source-in"; fx.fillStyle = "#efe8ff"; fx.fillRect(0, 0, c.width, c.height); mx.globalCompositeOperation = "source-over"; mx.drawImage(f, 0, 0); }
      x.drawImage(m, 0, 0);
      if (A.lm) { x.fillStyle = "#ffcc33"; A.lm.forEach((p, i) => { if (i % 3 === 0) x.fillRect(p.x - 1.5, p.y - 1.5, 3, 3); }); }
      if ($("#cmStep1")) $("#cmStep1").innerHTML = `<img src="${c.toDataURL("image/jpeg", .8)}" alt="">`;
    } catch (e) { console.warn(e); }
  }
  function renderCase() {
    S.step = "n3"; overlay(""); stage.className = "s-n3"; setNucleo(3); setBarra(BARRA_N3);
    const c = NUCLEO3.casos[S.n3.caso], v = barraVerdict();
    vf(`CASO ${S.n3.caso + 1}/${NUCLEO3.casos.length}`); if (S.n3.fase === "q") coach("n3");
    if (S.n3.fase === "q") {
      els.view.innerHTML = `<div class="case v3"><div class="kicker">${c.etiqueta}</div><div class="q">${n3fill(c.pregunta)}</div>${casePrompt(c)}${caseMedia(c, "q")}<div class="src">${c.f}</div></div>`;
      els.left.innerHTML = `<div class="kicker">Tu veredicto</div><div class="h-display md">LA IA…</div>
        <div class="verdicts" style="flex-direction:column">${NUCLEO3.opciones.map((o, i) => `<div class="verdict ${v === o ? "on" : ""}" data-p="${i + 2}">${o.toUpperCase()}</div>`).join("")}</div>`;
      els.right.innerHTML = `<div class="kicker">${NUCLEO3.titulo}</div><p class="lead big">Mirá el pedido y la imagen: ¿qué hizo la máquina con lo que ya había?</p>`;
      reelMsg(v ? `<span class="rm-l">Tu veredicto: <b>${v.toUpperCase()}</b></span>${cta("Confirmar mi voto", "Apretá el botón")}` : `<span class="rm-l">¿Crea, recombina o copia? <small>Elegí tu veredicto</small></span>`);
    } else {
      const votes = loadVotes().casos[c.id] || { crea: 0, recombina: 0, copia: 0 };
      const tot = votes.crea + votes.recombina + votes.copia || 1, mine = S.n3.votos[S.n3.caso];
      els.view.innerHTML = `<div class="case v3"><div class="stamp">${mine.toUpperCase()}</div><div class="kicker">${c.etiqueta}</div><div class="ans-t">${c.respuestaTitulo}</div><div class="ans">${c.respuesta}</div>${caseMedia(c, "a")}<div class="src">${c.f}</div></div>`;
      els.left.innerHTML = `<div class="kicker cel">Lo que votaron los visitantes</div><div class="bars">${NUCLEO3.opciones.map(o => `<div class="bar ${o === mine ? "me" : ""}"><div class="lbl"><span>${o.toUpperCase()}${o === mine ? " · vos" : ""}</span><b>${Math.round(votes[o] / tot * 100)}%</b></div><div class="tr"><i data-w="${votes[o] / tot * 100}"></i></div></div>`).join("")}</div>
        <div class="counter"><span>Votos en esta muestra</span><b>${tot}</b></div>`;
      setTimeout(() => document.querySelectorAll(".bar .tr i").forEach(i => i.style.width = i.dataset.w + "%"), 60);
      els.right.innerHTML = `<div class="kicker">Votaste</div><div class="h-display md">${mine.toUpperCase()}</div>
        <p class="lead" style="font-size:20px">${!c.tendencia ? "Acá no hay evidencia que te dé o te quite la razón: es un debate abierto, y la ley por ahora sólo reconoce autores humanos." : mine === c.tendencia ? "Coincidís con lo que dice la evidencia de este caso." : "La evidencia de este caso apunta a otro lado. Pensalo: ¿cambiarías tu voto?"}</p>`;
      reelMsg(`<span class="rm-l">Caso ${S.n3.caso + 1} de ${NUCLEO3.casos.length}</span>${cta(S.n3.caso < NUCLEO3.casos.length - 1 ? "Siguiente caso" : "Veredicto final", S.n3.caso < NUCLEO3.casos.length - 1 ? `Caso ${S.n3.caso + 2}` : "Último paso")}`);
    }
    els.hint.innerHTML = "";
  }
  function voteCase() {
    const v = barraVerdict();
    if (!v) { toast("Girá la perilla para elegir: CREA, RECOMBINA o COPIA", true); return; }
    const c = NUCLEO3.casos[S.n3.caso], all = loadVotes();
    all.casos[c.id] = all.casos[c.id] || { crea: 0, recombina: 0, copia: 0 }; all.casos[c.id][v]++; saveVotes(all);
    S.n3.votos[S.n3.caso] = v; S.n3.fase = "a"; renderCase();
  }
  function renderFinal() {
    S.step = "n3final"; stage.className = "s-n3 s-final"; setBarra(["", "", "", ""]); coach("n3final");
    const f = NUCLEO3.final, val = S.n3.final, all = loadVotes();
    const avg = all.final.length ? all.final.reduce((a, b) => a + b, 0) / all.final.length : null;
    const word = (x) => x < 34 ? "COPIA" : x < 67 ? "RECOMBINA" : "CREA";
    vf(`VEREDICTO FINAL`);
    els.view.innerHTML = `<div class="spectrum"><div class="kicker" style="color:var(--violet)">Veredicto final</div><div class="q" style="font-family:var(--display);font-size:64px;line-height:1">¿DÓNDE PONÉS A LA IA?</div>
      <div class="spec-track"><div class="spec-line"></div><div class="spec-needle" style="left:${100 - val}%"><span>VOS: ${word(val)}</span></div>
      ${S.n3.finalDone && avg !== null ? `<div class="spec-avg" style="left:${100 - avg}%"><span>promedio de ${all.final.length} visitantes</span></div>` : ""}</div>
      <div class="spec-labels"><span>CREA</span><span>RECOMBINA</span><span>COPIA</span></div>
      ${S.n3.finalDone ? `<p class="ans" style="font-size:24px;margin-top:70px;color:#3a332c">${NUCLEO3.cierre}</p>` : ""}</div>`;
    els.left.innerHTML = ""; els.right.innerHTML = "";
    reelMsg(S.n3.finalDone ? `<span class="rm-l">¡Gracias por votar!</span>${cta("Ver mi foto", "Resultado")}` : cta("Confirmar", "Mi veredicto"));
  }

  // tus 5 votos, como puntitos numerados sobre el espectro (crea 15% · recombina 50% · copia 85%)
  function votosEnBarra() {
    const pos = { crea: 15, recombina: 50, copia: 85 }, cuenta = {};
    return `<div class="spec-votes-h">Tus votos</div>` + S.n3.votos.map((v, i) => { const k = cuenta[v] = (cuenta[v] || 0) + 1; const x = pos[v] + (k - 1) * 3.2 - (S.n3.votos.filter(z => z === v).length - 1) * 1.6;
      return `<div class="spec-vote" style="left:${x}%" title="${NUCLEO3.casos[i].etiqueta}"><b>${i + 1}</b></div>`; }).join("");
  }

  /* =================================================================
     RESULTADO + IMPRESIÓN
     ================================================================= */
  async function renderResult() {
    S.step = "result"; stage.className = "s-result"; els.lab.className = ""; setNucleo(4); setBarra(["", "", "", ""]); overlay("");
    vf(`<span class="rec"></span>TU FOTO`);
    const s = sel();
    els.left.innerHTML = `<div class="kicker">Tu imagen</div><div class="h-display">NO SALIÓ<br>DE LA NADA</div>
      <p class="lead">Es tu cara + piezas del cine argentino + un proceso que aprendió de millones de imágenes ajenas.</p>
      <div class="prompt-box" style="font-size:16px">${[S.ref.titulo, ...[s.ropa, s.pelo, s.cabeza, s.accesorio].filter(x => !Generador.esNada(x)).map(x => x.nombre), S.esc.nombre].map(w => `<span class="w">${w}</span>`).join(" + ")}</div>`;
    const word = S.n3.final < 34 ? "copia" : S.n3.final < 67 ? "recombina" : "crea";
    els.right.innerHTML = `<div class="kicker">Tu veredicto</div><div class="h-display md">LA IA ${word.toUpperCase()}</div>
      ${QR_ON ? `<div class="qr-box" id="qrBox"><div class="qr-img">${S.qrURL ? QR.svg(S.qrURL, 260) : `<div class="qr-wait"><i></i>Preparando tu QR…</div>`}</div><p class="lead">Escaneá el QR con tu celular para llevarte tu foto.</p></div>` : `<p class="lead">${CFG.imprimir ? "Apretá el botón y llevátela impresa." : "¡Gracias por pasar por la cabina!"}</p>`}`;
    if (!S.genOut) {
      els.view.innerHTML = `<div class="developing"><div class="tray"></div>REVELANDO TU FOTO…</div>`;
      reelMsg(`<small>Un momento: la imagen se está terminando de generar</small>`);
      return;
    }
    if (S.genOut.error || !S.genOut.canvas) { S.genOut = await Generador.generar({ photo: S.photo, ref: S.ref, sel: s, esc: S.esc }).catch(() => null); if (!S.genOut) { els.view.innerHTML = `<div class="nocam">No se pudo generar la imagen.</div>`; return; } }
    if (!S.hoja) S.hoja = await Generador.hojaFinal({ imagen: S.genOut.canvas, modo: S.genOut.modo, ref: S.ref, sel: s, esc: S.esc, veredicto: word });
    if (S.step !== "result") return;
    els.view.innerHTML = `<div class="result-photo"><img src="${S.hoja}" alt="Tu foto"></div>`;
    $("#printImg").src = S.hoja; coach("result"); pedirQR();
    vf(S.genOut.modo === "ia" ? `GENERADA CON IA` : `COLLAGE SIN IA`);
    reelMsg(CFG.imprimir ? (S.printed ? `<span class="rm-l">¡GRACIAS! <small>Retirá tu foto</small></span>${cta("Terminar", "Volver al inicio")}` : cta("Imprimir mi foto", "Sale por la ranura de abajo")) : `<span class="rm-l">¡GRACIAS POR PASAR POR LA CABINA! <small>${QR_ON ? "Escaneá el QR para llevarte tu foto" : ""}</small></span>`);
  }
  /* ---------------- QR: cada foto se sube a internet y el QR lleva a ESA foto ----------------
     Con clave de imgbb.com (gratis) la foto queda online las horas que diga config.js (qrHoras).
     Sin clave se usa tmpfiles.org (sin cuenta, la foto se borra sola a los 60 minutos). */
  const QR_ON = CFG.qrFoto !== false && !!window.QR;
  const IMGBB_LSK = "cabinaByte.imgbbKey";
  const imgbbKey = () => { try { return localStorage.getItem(IMGBB_LSK) || CFG.imgbbApiKey || ""; } catch (e) { return CFG.imgbbApiKey || ""; } };
  async function subirFoto(dataURL) {
    const blob = await (await fetch(dataURL)).blob(), key = imgbbKey();
    if (key) {
      const fd = new FormData(); fd.append("image", dataURL.split(",")[1]);
      const exp = Math.max(60, Math.min(15552000, Math.round((CFG.qrHoras || 24) * 3600)));
      const r = await fetch(`https://api.imgbb.com/1/upload?expiration=${exp}&key=${encodeURIComponent(key)}`, { method: "POST", body: fd });
      const j = await r.json(); if (!j.data || !j.data.url) throw new Error("imgbb: " + (j.error && j.error.message || r.status)); return j.data.url;
    }
    const fd = new FormData(); fd.append("file", blob, "cabina-byte-" + Date.now() + ".jpg");
    const r = await fetch("https://tmpfiles.org/api/v1/upload", { method: "POST", body: fd });
    const j = await r.json(); if (!j.data || !j.data.url) throw new Error("tmpfiles: " + r.status);
    return j.data.url.replace("tmpfiles.org/", "tmpfiles.org/dl/").replace("http://", "https://");
  }
  function pedirQR() {
    if (!QR_ON || S.qrURL || S.qrProm || !S.hoja) return;
    const mine = S;
    S.qrProm = subirFoto(S.hoja).then(url => { mine.qrURL = url; if (S === mine && S.step === "result") renderResult(); })
      .catch(e => { console.warn("QR", e); mine.qrProm = null; const b = $("#qrBox"); if (b && S === mine) b.innerHTML = `<p class="lead">No pudimos armar el QR (¿hay internet?). Llevate la foto impresa.</p>`; });
  }
  function doPrint() {
    if (!S.hoja) return;
    if (S.printed || !CFG.imprimir) { reset(); return; }
    S.printed = true;
    setTimeout(() => window.print(), 50);
    toast("Imprimiendo… retirá tu foto por la ranura");
    renderResult();
    setTimeout(() => { if (S.step === "result") reset(); }, 40000);
  }

  /* =================================================================
     ENTRADAS FÍSICAS
     ================================================================= */
  let lastInput = Date.now();
  Controles.on("cualquiera", () => lastInput = Date.now());

  Controles.on("boton", () => { document.querySelectorAll(".cta").forEach(c => { c.classList.add("press"); setTimeout(() => c.classList.remove("press"), 160); });
    switch (S.step) {
      case "attract": S = fresh(); S.step = "foto"; clearInterval(attractT); renderFoto(); break;
      case "foto": if (S.sub === "live") { if (stream) shoot(); else { S.sub = "review"; reelMsg(ctaBarra("Deslizá la barra", "Para ir a la siguiente sección")); coach("review"); } } else toast("Deslizá la barra para ir a la siguiente sección"); break;
      case "n1intro": renderRef(); break;
      case "ref": if (S.ref && S.ref === REFERENCIAS[S.refIdx]) toast("Deslizá la barra para ir a la siguiente sección"); else confirmRef(); break;
      case "vest": if (S.vestDone) toast("Deslizá la barra para ir a la siguiente sección"); else confirmVest(); break;
      case "esc": confirmEsc(); break;
      case "n1cierre": renderN2Intro(); break;
      case "n2intro": renderN2(); break;
      case "n2": if (S.dev.step >= NUCLEO2.pasosTotales) { cancelAnimationFrame(devRAF); renderN3Intro(); } else toast("Seguí girando la perilla para revelar la imagen"); break;
      case "n3intro": S.n3.caso = 0; S.n3.fase = "q"; Controles.barra = Controles.fisica || 1; renderCase(); break;
      case "n3": if (S.n3.fase === "q") voteCase(); else if (S.n3.caso < NUCLEO3.casos.length - 1) { S.n3.caso++; S.n3.fase = "q"; Controles.barra = Controles.fisica || 1; renderCase(); } else renderFinal(); break;
      case "n3final":
        if (!S.n3.finalDone) { const all = loadVotes(); all.final.push(S.n3.final); saveVotes(all); S.n3.finalDone = true; renderFinal(); }
        else renderResult();
        break;
      case "result": doPrint(); break;
    }
  });

  Controles.on("perilla", (d) => {
    switch (S.step) {
      case "n3": if (S.n3.fase === "q") { const cur = [2, 3, 4].includes(Controles.barra) ? Controles.barra : (d > 0 ? 1 : 5); Controles.barra = Math.max(2, Math.min(4, cur + d)); setBarraOnly(); renderCase(); } break;
      case "n3final": if (!S.n3.finalDone) { S.n3.final = Math.max(0, Math.min(100, S.n3.final - d * 5)); renderFinal(); } break;
      case "foto": if (S.sub === "review") { S.sub = "live"; S.photo = null; renderFoto(); } break;
      case "ref": S.refIdx = (S.refIdx + d + REFERENCIAS.length) % REFERENCIAS.length; renderRef(); break;
      case "vest": {
        if (S.vestDone) { S.vestDone = false; S.catIdx = CATS.length - 1; }
        const cat = CATS[S.catIdx], n = S.ref[cat].length; S.idx[cat] = (S.idx[cat] + d + n) % n; S.ok[cat] = false; renderVest(); break;
      }
      case "esc": { const n = S.ref.escenarios.length; S.escIdx = (S.escIdx + d + n) % n; renderEsc(); break; }
      case "n2": {
        const prev = S.dev.step;
        S.dev.step = Math.max(0, Math.min(NUCLEO2.pasosTotales, S.dev.step + d));
        if (d < 0 && !S.dev.backWarned && S.dev.step < prev) { S.dev.backWarned = true; toast("Girar al revés vuelve a meter ruido"); }
        if (S.dev.step !== prev) updateN2Panels();
        break;
      }
    }
  });

  // LA BARRA es la que pasa de sección en la parte 1 (película → vestuario → escenario)
  // y la que elige el veredicto en la parte 3 (2 crea · 3 recombina · 4 copia)
  Controles.on("barra", (p) => {
    setBarraOnly();
    switch (S.step) {
      case "foto": if (S.sub === "review" && p >= 2) { S.step = "n1intro"; renderN1Intro(); } break;
      case "n1intro": if (p !== 2) bloquear("Primero apretá el botón para empezar", 2); break;
      case "ref": case "vest": case "esc": {
        const aqui = { ref: 2, vest: 3, esc: 4 }[S.step];
        if (p === aqui) break;
        if (p === 1) { bloquear("", aqui); break; }
        if (p >= 3 && !S.ref) { bloquear("Primero elegí una película con el botón", aqui); break; }
        if (p === 4 && !S.vestDone) { bloquear("Primero terminá de vestir a Byte", aqui); break; }
        if (p === 2) renderRef(); else if (p === 3) renderVest(); else renderEsc();
        break;
      }
      case "n3": if (S.n3.fase === "q") renderCase(); break;
    }
  });
  // la barra no deja saltear pasos: vuelve a marcar la sección en la que estás y avisa qué falta
  function bloquear(msg, aqui) {
    Controles.barra = aqui; setBarraOnly();
    if (msg) toast(msg + " · después volvé a deslizar la barra", true);
  }
  function setBarraOnly() { document.querySelectorAll(".barra-stop").forEach((e, i) => e.classList.toggle("on", Controles.barra === i + 1 && !!e.querySelector("span").textContent)); }

  /* =================================================================
     MOUSE — todo se puede navegar con clics (mientras no esté la interfaz física)
     clic en opción = elegirla · clic en la opción elegida = confirmar
     clic en las pistas (girá / confirmá) · clic en la barra de arriba
     rueda = perilla · clic derecho = perilla hacia atrás
     ================================================================= */
  stage.addEventListener("click", (e) => {
    if (e.target.closest("#debug")) return;
    if (S.step === "attract") { Controles.boton(); return; }
    const wc = e.target.closest(".wc[data-cat]");
    if (wc && S.step === "vest") { S.catIdx = +wc.dataset.cat; S.vestDone = false; renderVest(); return; }
    const stop = e.target.closest(".barra-stop");
    if (stop) { Controles.setBarra(+stop.dataset.p); return; }
    const ver = e.target.closest(".verdict[data-p]");
    if (ver) { if (S.step === "n3" && S.n3.fase === "q" && Controles.barra === +ver.dataset.p) Controles.boton(); else Controles.setBarra(+ver.dataset.p); return; }
    const fr = e.target.closest(".frame");
    if (fr) {
      const i = +fr.dataset.i, cur = [...els.track.children].findIndex(f => f.classList.contains("sel"));
      if (i === cur) Controles.boton(); else Controles.perilla(i - cur);
      return;
    }
    const tr = e.target.closest(".spec-track");
    if (tr && S.step === "n3final" && !S.n3.finalDone) {
      const r = tr.getBoundingClientRect(); S.n3.final = 100 - Math.max(0, Math.min(100, Math.round((e.clientX - r.left) / r.width * 20) * 5)); renderFinal(); return;
    }
    let a = e.target.closest("[data-act]");
    if (!a && e.target.closest("#overlay")) a = els.overlay.querySelector("[data-act]");   // clic en la tarjeta = su acción
    if (!a && S.step === "n2" && e.target.closest("#view, .dial-meter")) { Controles.perilla(1); return; }
    if (!a) return;
    const act = a.dataset.act;
    if (act === "boton") Controles.boton();
    else if (act === "perilla") Controles.perilla(1);
    else if (act === "barra+") Controles.setBarra(S.step === "foto" ? 2 : S.step === "ref" ? 3 : S.step === "vest" ? 4 : Controles.barra + 1);
  });
  stage.addEventListener("contextmenu", (e) => { e.preventDefault(); Controles.perilla(-1); });

  /* ---------------- reinicio e inactividad ---------------- */
  function reset() {
    cancelAnimationFrame(devRAF);
    S = fresh(); overlay(""); if (CFG.modoMouse !== false) Controles.barra = 1; els.left.innerHTML = els.right.innerHTML = els.view.innerHTML = ""; els.hint.innerHTML = "";
    $("#printImg").removeAttribute("src");
    renderAttract();
  }
  setInterval(() => { if (S.step !== "attract" && Date.now() - lastInput > (CFG.inactividadSegundos || 120) * 1000) reset(); }, 5000);

  if (CFG.modoMouse !== false) document.body.classList.add("show-cursor");
  if (CFG.mostrarPanelPrueba) { $("#debug").classList.add("on"); document.body.classList.add("show-cursor"); }
  // fotos propias agregadas en img/ (fotos_extra.js): se pasan a data: para poder usarlas en la foto final
  (function preloadExtra() {
    const all = [];
    REFERENCIAS.forEach(r => ["ropa", "pelo", "cabeza", "accesorio", "escenarios"].forEach(c => r[c].forEach(it => { if (it.img && !(window.ASSETS || {})[it.img]) all.push(it.img); })));
    all.forEach(path => { const im = new Image(); im.onload = () => { try { const c = document.createElement("canvas"); c.width = im.width; c.height = im.height; c.getContext("2d").drawImage(im, 0, 0); window.ASSETS[path] = c.toDataURL(path.endsWith(".jpg") || path.endsWith(".jpeg") ? "image/jpeg" : "image/png"); } catch (e) { console.warn("Para usar " + path + " en la foto final abrí la cabina con INICIAR_CABINA.bat"); } }; im.src = path; });
  })();
  /* ---------------- PANEL DE LA IA (tecla K): pegar la clave de Google AI Studio ---------------- */
  function panelIA() {
    let el = $("#panelIA");
    if (el) { el.remove(); document.body.classList.remove("show-cursor-forced"); return; }
    el = document.createElement("div"); el.id = "panelIA";
    el.innerHTML = `<div class="pia"><h3>Conectar la IA (Gemini)</h3>
      <p>Pegá la clave de <b>Google AI Studio</b> (aistudio.google.com → «Get API key»). Queda guardada sólo en esta compu.</p>
      <input id="piaKey" type="password" placeholder="AIza…" autocomplete="off">
      <div class="pia-row"><button id="piaTest">Probar</button><button id="piaSave" class="pri">Guardar</button><button id="piaDel">Borrar</button><button id="piaClose">Cerrar</button></div>
      <p style="margin-top:22px">QR de la foto: clave gratis de <b>imgbb.com</b> (api.imgbb.com). Sin clave se usa tmpfiles.org (la foto dura 60 min).</p>
      <input id="piaQR" type="password" placeholder="clave de imgbb (opcional)" autocomplete="off">
      <div class="pia-row"><button id="piaQRSave" class="pri">Guardar clave del QR</button><button id="piaQRDel">Borrar clave del QR</button></div>
      <div id="piaMsg">${Generador.tieneIA() ? "✓ Hay una clave cargada: la foto final y el avatar se hacen con IA." : "Sin clave: la cabina usa el modo collage (sin IA)."}</div></div>`;
    stage.appendChild(el); document.body.classList.add("show-cursor");
    const msg = (t) => $("#piaMsg").textContent = t, val = () => $("#piaKey").value.trim();
    $("#piaTest").onclick = async () => { msg("Probando…"); try { const r = await Generador.probarClave(val()); msg("✓ La clave funciona. Modelos de imagen: " + (r.imagen.join(", ") || "ninguno (revisá el plan)")); } catch (e) { msg("✗ " + e.message); } };
    $("#piaSave").onclick = () => { Generador.guardarClave(val()); msg(val() ? "✓ Guardada. Desde ahora la cabina usa IA." : "Escribí una clave."); };
    $("#piaDel").onclick = () => { Generador.guardarClave(""); msg("Clave borrada: modo collage."); };
    $("#piaClose").onclick = () => el.remove();
    $("#piaQRSave").onclick = () => { const k = $("#piaQR").value.trim(); try { if (k) localStorage.setItem(IMGBB_LSK, k); } catch (e) { } msg(k ? "✓ Clave del QR guardada." : "Escribí la clave de imgbb."); };
    $("#piaQRDel").onclick = () => { try { localStorage.removeItem(IMGBB_LSK); } catch (e) { } msg("Clave del QR borrada: se usa tmpfiles.org."); };
    setTimeout(() => $("#piaKey").focus(), 50);
  }
  window.Cabina = { reset, panelIA, get state() { return S; } };
  S = fresh(); renderAttract();
})();
