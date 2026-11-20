/* =====================================================================
   CABINA BYTE · CONTROLES FÍSICOS
   La interfaz física (barra deslizadora, perilla tipo dial de cámara y
   botón de confirmar) le habla a la página como si fuera un TECLADO.
   Un Arduino Leonardo / Pro Micro hace eso solo (ver /arduino).
   Ventaja: la página no necesita drivers, y se puede probar sin hardware.

     Barra deslizadora → teclas 1 2 3 4 (posición absoluta)
                         ↑ / ↓ también la mueven de a un paso
     Perilla (encoder) → ← / →   (o la rueda del mouse)
     Botón confirmar   → Enter o Espacio
     Extra             → R reinicia · F pantalla completa · D panel de prueba
   ===================================================================== */
(function () {
  const listeners = { boton: [], perilla: [], barra: [], cualquiera: [] };
  let barraPos = 1, fisica = 0;   // fisica = última posición que mandó la barra real (0 = todavía nada)
  const emit = (type, v) => { listeners[type].forEach(f => f(v)); listeners.cualquiera.forEach(f => f(type, v)); };

  function handleKey(key, repeat) {
    switch (key) {
      case "Enter": case " ": case "Spacebar":
        if (!repeat) emit("boton"); return true;
      case "ArrowRight": emit("perilla", +1); return true;
      case "ArrowLeft": emit("perilla", -1); return true;
      case "ArrowUp": if (!repeat) setBarra(Math.min(4, barraPos + 1)); return true;
      case "ArrowDown": if (!repeat) setBarra(Math.max(1, barraPos - 1)); return true;
      case "1": case "2": case "3": case "4":
        if (!repeat) { fisica = +key; setBarra(+key); } return true;
    }
    return false;
  }
  function setBarra(p) { barraPos = Math.max(1, Math.min(4, p)); emit("barra", barraPos); }

  window.addEventListener("keydown", (e) => {
    if (e.target && /INPUT|TEXTAREA/.test(e.target.tagName)) return;   // escribiendo en el panel de la clave
    if (window.__coachTrap && window.__coachTrap(e.key)) { e.preventDefault(); return; }   // tutorial en pantalla
    if (handleKey(e.key, e.repeat)) { e.preventDefault(); return; }
    const k = e.key.toLowerCase();
    if (k === "d") document.getElementById("debug").classList.toggle("on"), document.body.classList.add("show-cursor");
    if (k === "f") { if (!document.fullscreenElement) document.documentElement.requestFullscreen().catch(() => { }); else document.exitFullscreen(); }
    if (k === "r") window.Cabina && window.Cabina.reset();
    if (k === "k") window.Cabina && window.Cabina.panelIA();
  });

  // rueda del mouse = perilla (para probar sin hardware)
  let wheelAcc = 0, wheelT = 0;
  window.addEventListener("wheel", (e) => {
    wheelAcc += e.deltaY;
    const now = performance.now();
    if (Math.abs(wheelAcc) > 60 && now - wheelT > 70 && window.__coachTrap && window.__coachTrap("wheel")) { wheelAcc = 0; wheelT = now; return; }
    if (Math.abs(wheelAcc) > 60 && now - wheelT > 70) { emit("perilla", wheelAcc > 0 ? 1 : -1); wheelAcc = 0; wheelT = now; }
  }, { passive: true });

  // botones del panel de prueba
  document.addEventListener("click", (e) => {
    const b = e.target.closest("#debug button");
    if (b) handleKey(b.dataset.k, false);
  });

  window.Controles = {
    on: (type, f) => listeners[type].push(f),
    boton: () => emit("boton"),
    perilla: (d) => emit("perilla", d),
    setBarra: (p) => setBarra(p),
    get fisica() { return fisica; },
    get barra() { return barraPos; },
    set barra(v) { barraPos = v; }
  };
})();
