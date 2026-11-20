/* =====================================================================
   CABINA BYTE · CONTENIDOS
   - 8 referencias audiovisuales argentinas con su vestuario y escenarios
   - Textos de las 3 partes (información verificada, con fuente)
   Para cambiar una película: editen su bloque. Cada prenda tiene:
     nombre   -> lo que lee el usuario
     caption  -> cómo la "vería" un dataset (texto alternativo de la imagen)
     d        -> instrucciones de dibujo para el avatar (ver avatar.js)
   ===================================================================== */

/* Opciones "sin nada" que se agregan a cabeza y accesorio */
const NADA = { id: "nada", nombre: "Sin nada", caption: "", d: { k: "none" } };
const F = (ref, cat) => [...(((window.FOTOS || {})[ref] || {})[cat] || []), ...(((window.FOTOS_EXTRA || {})[ref] || {})[cat] || [])];

const REFERENCIAS = [
  /* ------------------------------------------------------------------ */
  {
    id: "marginal",
    titulo: "El Marginal",
    tipo: "Serie", anio: "2016–2022",
    creditos: "Creada por Sebastián Ortega y Adrián Caetano",
    medio: "TV Pública · luego Netflix",
    sinopsis: "Un ex policía entra infiltrado a la cárcel de San Onofre.",
    caption: "serie argentina, cárcel, presos, patio, tensión, 2016",
    tags: ["Cárcel", "Amistad", "Crimen", "Supervivencia"],
    foto: "marginal/ref",
    paleta: ["#2f3a2c", "#d9822b", "#e8dcc0"],
    filtro: "contrast(1.15) saturate(0.85) sepia(0.15)",
    emblema: "rejas",
    ropa: F("marginal", "ropa"), pelo: F("marginal", "pelo"),
    cabeza: [NADA, ...F("marginal", "cabeza")], accesorio: [NADA, ...F("marginal", "accesorio")],
    escenarios: F("marginal", "escenarios")
  },
  /* ------------------------------------------------------------------ */
  {
    id: "relatos",
    titulo: "Relatos Salvajes",
    tipo: "Película", anio: "2014",
    creditos: "Dirigida por Damián Szifron",
    medio: "Nominada al Oscar a Mejor Película Extranjera",
    sinopsis: "Seis historias de gente común que pierde el control.",
    caption: "película argentina, seis relatos, venganza, humor negro, 2014",
    tags: ["Violencia", "Venganza", "Tensión", "Humor negro"],
    foto: "relatos/ref",
    paleta: ["#5a1e1a", "#e0b04a", "#f2e8d8"],
    filtro: "contrast(1.2) saturate(1.1)",
    emblema: "grieta",
    ropa: F("relatos", "ropa"), pelo: F("relatos", "pelo"),
    cabeza: [NADA, ...F("relatos", "cabeza")],
    accesorio: [NADA, ...F("relatos", "accesorio"), { id: "multa", nombre: "Multa de la grúa", caption: "papel de multa de acarreo en la mano", d: { k: "ticket" } }],
    escenarios: F("relatos", "escenarios")
  },
  /* ------------------------------------------------------------------ */
  {
    id: "eternauta",
    foto: "eternauta/ref",
    titulo: "El Eternauta",
    tipo: "Serie", anio: "2025",
    creditos: "Creada y dirigida por Bruno Stagnaro · basada en la historieta de Oesterheld y Solano López (1957)",
    medio: "Netflix, 30/4/2025 · Ricardo Darín es Juan Salvo",
    sinopsis: "Una nevada mortal cae de noche sobre Buenos Aires. Juan Salvo y sus amigos sobreviven y descubren que es el comienzo de una invasión.",
    caption: "serie argentina, nevada tóxica, Buenos Aires, máscara antigás, supervivencia, 2025",
    tags: ["Ciencia ficción", "Supervivencia", "Buenos Aires", "Historieta"],
    paleta: ["#1c2430", "#9fb8cc", "#eef2f4"],
    filtro: "contrast(1.1) saturate(0.6) hue-rotate(-8deg) brightness(0.95)",
    emblema: "copo",
    ropa: [
      { id: "aislante", nombre: "Traje aislante casero", caption: "traje aislante casero de nylon con cinta adhesiva en las uniones", d: { k: "hazmat", c: "#c9c17a", tape: "#7c7c7c" } },
      { id: "inflable", nombre: "Campera inflable", caption: "campera inflable de abrigo", d: { k: "puffer", c: "#3c4a5a" } },
      { id: "piloto", nombre: "Piloto de lluvia", caption: "piloto de lluvia largo de nylon", d: { k: "raincoat", c: "#6f7b4a" } }
    ],
    pelo: [
      { id: "canoso", nombre: "Corto canoso", caption: "pelo corto canoso", d: { k: "short", c: "#a6a29a" } },
      { id: "desprolijo", nombre: "Desprolijo", caption: "pelo desprolijo", d: { k: "messy", c: "#3a2a1e" } },
      { id: "largo", nombre: "Largo atado", caption: "pelo largo atado", d: { k: "bun", c: "#2a1c14" } }
    ],
    cabeza: [
      { id: "mascara", nombre: "Máscara antigás y capucha", caption: "máscara antigás con capucha, protección contra la nevada", d: { k: "gasmask" } },
      { id: "antiparras", nombre: "Antiparras", caption: "antiparras de protección en la frente", d: { k: "goggles" } },
      { id: "lana", nombre: "Gorro de lana", caption: "gorro de lana gris", d: { k: "beanie", c: "#6a6e72" } }
    ],
    accesorio: [
      { id: "linterna", nombre: "Linterna", caption: "linterna en la mano", d: { k: "flashlight" } },
      { id: "radio", nombre: "Radio a pilas", caption: "radio portátil a pilas", d: { k: "radio", c: "#3a3a3a" } },
      { id: "mochila", nombre: "Mochila", caption: "mochila de supervivencia", d: { k: "backpack", c: "#4a4a3a" } }
    ],
    escenarios: [
      { id: "nevada", nombre: "Buenos Aires bajo la nevada", caption: "calle de Buenos Aires de noche bajo una nevada, autos detenidos", d: { k: "snowCity" } },
      { id: "casa", nombre: "Casa con ventanas tapadas", caption: "interior de casa con ventanas selladas con cinta y nieve afuera", d: { k: "sealedHouse" } },
      { id: "estadio", nombre: "Estadio nevado", caption: "estadio de fútbol vacío cubierto de nieve", d: { k: "stadium" } }
    ]
  },
  /* ------------------------------------------------------------------ */
  {
    id: "violetta",
    foto: "violetta/ref",
    titulo: "Violetta",
    tipo: "Serie", anio: "2012–2015",
    creditos: "Producida por Pol-ka para Disney Channel · 3 temporadas, 240 episodios, filmada en Buenos Aires",
    medio: "Con Martina Stoessel como Violetta Castillo",
    sinopsis: "Una adolescente descubre su pasión por la música en el Studio 21, que en la tercera temporada pasa a llamarse Studio On Beat.",
    caption: "serie juvenil argentina, música, escuela de canto, Disney Channel, 2012",
    tags: ["Música", "Amistad", "Sueños", "Adolescencia"],
    paleta: ["#3a1f5c", "#f08ab8", "#f6eefb"],
    filtro: "contrast(1.05) saturate(1.2) brightness(1.04)",
    emblema: "nota",
    ropa: F("violetta", "ropa"), pelo: F("violetta", "pelo"),
    cabeza: [NADA, ...F("violetta", "cabeza")], accesorio: [NADA, ...F("violetta", "accesorio")],
    escenarios: F("violetta", "escenarios")
  },
  /* ------------------------------------------------------------------ */
  {
    id: "metegol",
    foto: "metegol/ref",
    titulo: "Metegol",
    tipo: "Película animada", anio: "2013",
    creditos: "Dirigida por Juan José Campanella · basada en «Memorias de un wing derecho», de Roberto Fontanarrosa",
    medio: "Costó 21 millones de dólares, la película argentina más cara hasta ese momento · Goya a la mejor película de animación (2014)",
    sinopsis: "Amadeo y los jugadores de su metegol enfrentan al Grosso, una estrella del fútbol.",
    caption: "película animada argentina, fútbol, metegol, pueblo, bar, 2013",
    tags: ["Fútbol", "Amistad", "Pueblo", "Animación"],
    paleta: ["#1f3a24", "#e1b12c", "#eef4e6"],
    filtro: "contrast(1.08) saturate(1.2)",
    emblema: "pelota",
    ropa: [
      { id: "camiseta", nombre: "Camiseta del equipo", caption: "camiseta de fútbol roja con el número 10", d: { k: "jersey", c: "#c0392b", num: "10" } },
      { id: "celeste", nombre: "Camiseta a bastones", caption: "camiseta de fútbol a bastones celestes y blancos", d: { k: "jersey", c: "#7fb5e3", stripes: "#ffffff", num: "5", numc: "#1e2a5a" } },
      { id: "delantal", nombre: "Delantal del bar", caption: "delantal de mozo de bar de pueblo", d: { k: "apron", c: "#c9b27c" } },
      { id: "estrella", nombre: "Campera de estrella", caption: "campera deportiva negra con vivos dorados de jugador famoso", d: { k: "track", c: "#1a1a1a", s: "#e1b12c" } }
    ],
    pelo: [
      { id: "crack", nombre: "Peinado de crack", caption: "pelo en punta con gel de futbolista", d: { k: "spiky", c: "#2a1d15" } },
      { id: "rulos", nombre: "Rulos", caption: "pelo enrulado", d: { k: "curly", c: "#3a2416" } },
      { id: "corto", nombre: "Corto", caption: "pelo corto castaño", d: { k: "short", c: "#6a4a2a" } }
    ],
    cabeza: [NADA,
      { id: "vincha", nombre: "Vincha de fútbol", caption: "vincha deportiva roja", d: { k: "sweatband", c: "#c0392b" } },
      { id: "lana", nombre: "Gorro de lana", caption: "gorro de lana azul", d: { k: "beanie", c: "#2d4f86" } }
    ],
    accesorio: [NADA,
      { id: "pelota", nombre: "Pelota", caption: "pelota de fútbol clásica", d: { k: "ball" } },
      { id: "bufanda", nombre: "Bufanda del club", caption: "bufanda de club de fútbol roja y blanca", d: { k: "scarf2", c: "#c0392b", s: "#ffffff" } },
      { id: "copa", nombre: "Copa", caption: "copa de campeón dorada", d: { k: "trophy" } }
    ],
    escenarios: [
      { id: "bar", nombre: "El bar del pueblo", caption: "bar de pueblo con un metegol en el centro", d: { k: "bar" } },
      { id: "canchita", nombre: "La canchita", caption: "cancha de fútbol de barrio con alambrado", d: { k: "field" } },
      { id: "estadio", nombre: "El estadio", caption: "estadio de fútbol lleno de día", d: { k: "stadiumDay" } }
    ]
  },
  /* ------------------------------------------------------------------ */
  {
    id: "simuladores",
    titulo: "Los Simuladores",
    tipo: "Serie", anio: "2002–2003",
    creditos: "Creada por Damián Szifron",
    medio: "Telefe",
    sinopsis: "Un equipo resuelve problemas ajenos con «operativos de simulación».",
    caption: "serie argentina, equipo, trajes, disfraces, operativo, 2002",
    tags: ["Equipo", "Estrategia", "Investigación", "Cultura pop"],
    foto: "simuladores/ref",
    paleta: ["#1f2633", "#c8a24a", "#e6e3da"],
    filtro: "contrast(1.1) saturate(0.9)",
    emblema: "handy",
    ropa: F("simuladores", "ropa"), pelo: F("simuladores", "pelo"),
    cabeza: [NADA, ...F("simuladores", "cabeza")], accesorio: [NADA, ...F("simuladores", "accesorio")],
    escenarios: F("simuladores", "escenarios")
  },
  /* ------------------------------------------------------------------ */
  {
    id: "casados",
    titulo: "Casados con hijos",
    tipo: "Serie", anio: "2005–2006",
    creditos: "Adaptación argentina de «Married... with Children» · con Guillermo Francella y Florencia Peña",
    medio: "Telefe · 2 temporadas, 212 episodios",
    sinopsis: "Pepe Argento, vendedor de zapatos e hincha de Racing, y su familia.",
    caption: "comedia argentina, familia Argento, living, sillón, 2005",
    tags: ["Familia", "Comedia", "Vida cotidiana", "Cultura pop"],
    foto: "casados/ref",
    paleta: ["#3a2a4a", "#e0609a", "#f3ecf6"],
    filtro: "contrast(1.08) saturate(1.15)",
    emblema: "casa",
    ropa: F("casados", "ropa"), pelo: F("casados", "pelo"),
    cabeza: [NADA, ...F("casados", "cabeza")], accesorio: [NADA, ...F("casados", "accesorio")],
    escenarios: F("casados", "escenarios")
  },
  /* ------------------------------------------------------------------ */
  {
    id: "carroza",
    foto: "carroza/ref",
    titulo: "Esperando la carroza",
    tipo: "Película", anio: "1985",
    creditos: "Dirigida por Alejandro Doria · basada en la obra de teatro del uruguayo Jacobo Langsner (1962)",
    medio: "Estreno 6/5/1985 · Antonio Gasalla es Mamá Cora; con China Zorrilla, Luis Brandoni y Betiana Blum",
    sinopsis: "Tras una pelea familiar, Mamá Cora desaparece. Sus hijos creen que murió y la velan… hasta que ella vuelve.",
    caption: "comedia argentina, familia, casa de barrio, cocina, 1985",
    tags: ["Familia", "Comedia", "Grotesco", "Clásico"],
    paleta: ["#6b3a2a", "#e3a84a", "#f4ead6"],
    filtro: "contrast(1.05) saturate(1.15) sepia(0.3)",
    emblema: "empanada",
    ropa: F("carroza", "ropa"), pelo: F("carroza", "pelo"),
    cabeza: [NADA, ...F("carroza", "cabeza")], accesorio: [NADA, ...F("carroza", "accesorio")],
    escenarios: F("carroza", "escenarios")
  }
];

const CATEGORIAS = [
  { key: "ropa", nombre: "Ropa", icono: "remera" },
  { key: "pelo", nombre: "Pelo", icono: "pelo" },
  { key: "cabeza", nombre: "Cabeza", icono: "gorra" },
  { key: "accesorio", nombre: "Accesorio", icono: "lentes" }
];

/* =====================================================================
   PARTE 1 · ¿DE QUÉ APRENDE LA IA?
   ===================================================================== */
const NUCLEO1 = {
  titulo: "¿De qué aprende la IA?",
  intro: "Una IA de imágenes nunca vio una película. Vio miles de millones de imágenes sueltas, cada una con un texto que la describe. De esos pares imagen–texto aprende qué cosas suelen aparecer juntas.",
  datos: [
    { t: "LAION-5B, uno de los datasets abiertos más grandes, tiene 5.850 millones de pares imagen–texto sacados de internet.", f: "Schuhmann et al., NeurIPS 2022" },
    { t: "Stable Diffusion se entrenó con LAION-2B(en), la parte de ese dataset con textos en inglés.", f: "Model card de Stable Diffusion v1-4 (CompVis)" },
    { t: "El texto suele ser el «alt» de la imagen en una página web: lo que alguien escribió para describirla, con sus sesgos.", f: "Schuhmann et al., 2022" },
    { t: "En 2023, Rest of World generó 3.000 imágenes con Midjourney. De 100 «personas mexicanas», 99 tenían sombrero o algo parecido.", f: "Rest of World, oct. 2023" },
    { t: "En el mismo estudio, las 100 imágenes de «una persona estadounidense» incluían una bandera.", f: "Rest of World, oct. 2023" },
    { t: "Esta mujer no existe: la generó Stable Diffusion en 2022. Su cara es una mezcla de rasgos aprendidos de millones de fotos de personas reales.", f: "Imagen: Benlisquare, Wikimedia Commons (dominio público)", img: "ia_noexiste" },
    { t: "Si se cambian los datos, cambia lo que genera: con unas 200 imágenes «envenenadas», un modelo SD-XL empezó a dibujar gatos cuando le pedían perros.", f: "Shan et al., «Nightshade», Universidad de Chicago, 2023 · CC BY 4.0", img: "ia_veneno" }
  ],
  // imágenes generadas por IA que acompañan la intro: el mismo pedido «aprende» estilos ajenos
  introImgs: [
    { img: "ia_astro_davinci", pie: "«…by da Vinci»" }, { img: "ia_astro_monet", pie: "«…by Monet»" },
    { img: "ia_astro_hiroshige", pie: "«…by Hiroshige»" }, { img: "ia_astro_picasso", pie: "«…by Picasso»" }
  ],
  introPie: "Stable Diffusion (2022) con el pedido «an astronaut riding a horse, by …». Nunca vio un astronauta pintado por Monet: recombinó lo que aprendió de sus cuadros. Imágenes: Asanagi, Wikimedia Commons, CC0 / dominio público.",
  cierreTitulo: "Acabás de hacer lo mismo que la IA",
  cierre: "No inventaste nada desde cero: elegiste piezas que ya existían —una película, una prenda, un lugar— y las combinaste. Cada pieza llegó con su descripción. Así aprende un modelo: asociando imágenes con palabras. La pregunta es si combinar es crear."
};

/* =====================================================================
   PARTE 2 · ¿CÓMO SE CONSTRUYE UNA IMAGEN?   (modelos de difusión)
   ===================================================================== */
const NUCLEO2 = {
  titulo: "¿Cómo se construye una imagen?",
  instruccion: "Girá la perilla para quitar el ruido. Son 10 pasos: cada dos, una estación nueva con su propia imagen hecha por IA.",
  pasosTotales: 10,
  // 5 estaciones de 2 pasos cada una. img: astronauta | estilos | deepdream | castillo | final
  estaciones: [
    { paso: 0, img: "astronauta", titulo: "1 · Tu elección se vuelve texto", texto: "Todo empieza con un pedido escrito: el <b>prompt</b>. En 2022, con el pedido <b>«a photograph of an astronaut riding a horse»</b>, Stable Diffusion hizo esta imagen. Lo que elegiste al principio también se convirtió en una frase:", f: "Imagen: Stable Diffusion, por Asanagi · Wikimedia Commons, dominio público", prompt: true,
      pie: "Prompt: «a photograph of an astronaut riding a horse» · Stable Diffusion, 2022" },
    { paso: 2, img: "estilos", titulo: "2 · El texto se vuelve números", texto: "Un codificador de texto traduce cada palabra a una lista de números. Si al mismo pedido le sumás <b>«by Picasso»</b> o <b>«by Monet»</b>, cambian los números… y cambia el estilo. El modelo usa el codificador de CLIP (ViT-L/14), entrenado con pares imagen–texto.", f: "Model card de Stable Diffusion v1-4 · Imágenes: Asanagi, Wikimedia Commons, CC0",
      pie: "«an astronaut riding a horse, by da Vinci / Monet / Hiroshige / Picasso»" },
    { paso: 4, img: "deepdream", titulo: "3 · Todo empieza con ruido", texto: "Una de las primeras imágenes famosas hechas por una red neuronal fue <b>DeepDream</b> (Google, julio de 2015): la red miraba una foto y exageraba lo que «creía ver», hasta llenarla de ojos y perros. Hoy los modelos de difusión arrancan de puro ruido, en un espacio comprimido (el «latente»): para 512×512 píxeles trabajan sobre una grilla de 64×64.", f: "Mordvintsev, Olah y Tyka, «Inceptionism», Google Research Blog, 2015 · Model card de SD v1-4",
      pie: "La Gioconda pasada por DeepDream (red VGG16) · Pjfinlay, CC0" },
    { paso: 6, img: "castillo", titulo: "4 · Paso a paso, se quita el ruido", texto: "En cada paso, el modelo predice qué parte es ruido y la resta, guiado por el texto. Mirá este castillo de Stable Diffusion: en el paso 1 son manchas, en el 3 ya hay formas grandes y en el 40 aparecen los detalles. Lo que sabe sobre cómo «debería verse» <b>{escenario}</b> también lo aprendió de imágenes ajenas.", f: "Rombach et al., 2022 · Imagen: Benlisquare, Wikimedia Commons, CC BY-SA 4.0",
      pie: "Prompt: «a european castle in japan» · pasos 1 a 40 de Stable Diffusion (DDIM)" },
    { paso: 8, img: "noexiste", titulo: "5 · De números a píxeles", texto: "Al final, un decodificador (VAE) agranda la grilla latente y la convierte en píxeles. Así salió esta foto: <b>esta mujer no existe</b>. Ninguna foto del entrenamiento se pegó tal cual; el modelo reconstruyó una cara posible con patrones de millones de caras reales.", f: "Model card de Stable Diffusion v1-4 · Imagen: Stable Diffusion 1.5, Benlisquare, Wikimedia Commons (dominio público)",
      pie: "«This AI-generated woman does not exist» · Stable Diffusion 1.5, 2022" }
  ]
};

/* =====================================================================
   PARTE 3 · ¿CREA, RECOMBINA O COPIA?
   La barra de ajustes se vuelve una palanca de veredicto.
   ===================================================================== */
const NUCLEO3 = {
  titulo: "¿Crea, recombina o copia?",
  instruccion: "Leé el caso, mirá el pedido y la imagen, girá la perilla hasta tu veredicto y apretá el botón.",
  opciones: ["crea", "recombina", "copia"],
  casos: [
    {
      id: "estereotipo",
      etiqueta: "Caso 1 · Estereotipos",
      pregunta: "Le pidieron a Midjourney 100 veces «una persona mexicana». 99 de las 100 imágenes mostraban un sombrero o algo parecido.",
      respuestaTitulo: "La evidencia apunta a: RECOMBINA",
      respuesta: "El modelo no inventó un mexicano: juntó lo que más se repetía en sus datos. Recombinar lo más frecuente produce estereotipos.",
      tendencia: "recombina",
      f: "Rest of World, «How AI reduces the world to stereotypes», 2023",
      prompt: "a Mexican person",
      promptNota: "El pedido que usaron, tal cual",
      img: "n3_sombrero", pie: "Lo que se repetía: el sombrero charro. Foto real, ilustrativa (Elizjorge, CC BY-SA 4.0)",
      grilla: "sombreros", pieGrilla: "100 pedidos iguales → 99 personas con sombrero. La máquina junta y repite lo que más vio (ilustración)"
    },
    {
      id: "memoria",
      etiqueta: "Caso 2 · Memoria",
      pregunta: "En 2023, un grupo de investigadores logró que modelos de difusión como Stable Diffusion devolvieran más de mil imágenes de su entrenamiento casi idénticas, incluidas fotos de personas reales.",
      respuestaTitulo: "La evidencia apunta a: A VECES COPIA",
      respuesta: "Pasa sobre todo con imágenes que estaban repetidas muchas veces en el dataset: el modelo las «memoriza». Es poco frecuente, pero ocurre.",
      tendencia: "copia",
      f: "Carlini et al., «Extracting Training Data from Diffusion Models», USENIX Security 2023",
      prompt: "Living in the light with Ann Graham Lotz",
      promptNota: "El pie de foto que tenía la imagen en el dataset, usado como pedido",
      img: "n3_lotz", pie: "Lo que devolvió Stable Diffusion: casi igual a una foto real de Ann Graham Lotz que estaba en su entrenamiento (Carlini et al., 2023)"
    },
    {
      id: "concurso",
      etiqueta: "Caso 3 · Autoría",
      pregunta: "En 2022, Jason Allen ganó el concurso de arte digital de la Feria Estatal de Colorado con «Théâtre D'opéra Spatial», hecha con Midjourney tras al menos 624 prompts.",
      respuestaTitulo: "La ley dice: NO ES CREACIÓN HUMANA",
      respuesta: "La Oficina de Copyright de EE.UU. le negó el registro: escribir prompts no alcanza para ser autor de lo que genera la máquina. En marzo de 2026 la Corte Suprema dejó firme otro fallo (Thaler) que exige un autor humano.",
      tendencia: null,
      f: "U.S. Copyright Office Review Board, 2023 · Thaler v. Perlmutter, cert. denegado 2/3/2026",
      prompt: "[confidencial] × 624 intentos",
      promptNota: "Allen nunca hizo públicos sus prompts: la Oficina de Copyright decidió sin conocerlos",
      img: "n3_theatre_original", pie: "Lo que sacó Midjourney (antes de que Allen la retocara en Photoshop)",
      img2: "n3_theatre", pie2: "La versión final que ganó el concurso, retocada y agrandada por Allen"
    },
    {
      id: "getty",
      etiqueta: "Caso 4 · Tribunales",
      pregunta: "Getty Images demandó a Stability AI en Londres. Algunas imágenes generadas mostraban hasta una marca de agua parecida a la de Getty.",
      respuestaTitulo: "El fallo dijo: NO GUARDA COPIAS",
      respuesta: "El 4 de noviembre de 2025 el Tribunal Superior concluyó que el modelo no almacena ni reproduce las obras. Pero las marcas de agua sí infringieron la marca de Getty: el modelo recombina tan bien que hasta reconstruyó un logo.",
      tendencia: "recombina",
      f: "Getty Images v. Stability AI, High Court (Reino Unido), 4/11/2025",
      prompt: "texto → números → ruido que se limpia → imagen",
      promptNota: "Por dentro: lo que el modelo guarda son números («pesos»), no un archivo de fotos",
      img: "n3_sd_arquitectura", pie: "Esquema de Stable Diffusion: codificador de texto, U-Net que quita ruido en el espacio latente y decodificador (LMU Munich, MIT)"
    },
    {
      id: "escenario",
      etiqueta: "Caso 5 · Tu foto",
      pregunta: "Para meterte en «{escenario}», la cabina no te sacó otra foto: separó tu silueta del fondo, píxel por píxel, y la pegó sobre una imagen que ya existía.",
      respuestaTitulo: "Lo que hizo la cabina: RECOMBINAR",
      respuesta: "Un modelo de segmentación decide qué píxeles son persona, pelo, cara o ropa. Con eso se recorta tu silueta, se ubica cada prenda según 478 puntos de tu cara y tus hombros, y se pega todo sobre el escenario. Una IA generativa hace algo parecido pero redibuja la escena entera: inventa luces y sombras coherentes a partir de millones de fotos ajenas.",
      tendencia: "recombina",
      f: "MediaPipe Image Segmenter y Face Landmarker (Google) · así funciona esta cabina",
      prompt: "{prompt}",
      promptNota: "Tu pedido",
      pasos: true
    }
  ],
  introImgs: [
    { img: "ia_belamy", pie: "«Edmond de Belamy» (2018), hecho con una red GAN por el colectivo Obvious. Se vendió en Christie's por US$ 432.500." },
    { img: "ia_zarya", pie: "«Zarya of the Dawn» (2022), historieta ilustrada con Midjourney. En 2023 la Oficina de Copyright de EE.UU. protegió el texto, pero no las imágenes." }
  ],
  final: {
    titulo: "Tu veredicto final",
    img: "ia_mano6", pie: "Una mano con seis dedos, hecha por Stable Diffusion 1.5: el modelo combina patrones de manos sin «saber» cuántos dedos tiene una mano. · Wikimedia Commons, dominio público",
    texto: "Después de todo lo que viste, girá la perilla: ¿dónde ponés a la IA?",
    extremos: ["COPIA", "RECOMBINA", "CREA"]
  },
  cierre: "No hay una respuesta única. Lo que sí sabemos: la IA trabaja con lo que ya vio. Tu foto también."
};

/* Misma estética en todas: se muestran sólo las películas/series que tienen las prendas
   en FOTO REAL (ropa, pelo, cabeza y accesorio). Las que todavía tienen prendas dibujadas
   (por ahora Metegol y El Eternauta) quedan ocultas hasta que se les agreguen fotos.
   Para mostrarlas igual: MOSTRAR_DIBUJADAS = true */
const MOSTRAR_DIBUJADAS = false;
if (!MOSTRAR_DIBUJADAS) {
  for (let i = REFERENCIAS.length - 1; i >= 0; i--) {
    const r = REFERENCIAS[i], cats = ["ropa", "pelo", "cabeza", "accesorio"];
    const real = cats.every(c => (r[c] || []).some(x => x.img));
    if (!real) REFERENCIAS.splice(i, 1);
  }
}
