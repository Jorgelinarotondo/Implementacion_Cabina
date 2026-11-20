# Cabina Byte · ¿La IA crea o recombina?  — VERSIÓN 5

> **Qué cambió en la v5**
> - **Tutorial antes de cada pantalla:** se oscurece todo, un reflector hace zoom donde hay que mirar y aparece el panel físico animado (la perilla girando, el botón rojo bajando). Cualquier giro o botón lo pasa.
> - **Menos texto chico:** sin hashtags, contadores, fuentes ni leyendas en pantalla (las fuentes siguen en este LEEME y en el núcleo 3).
> - **Byte arranca sin nada:** sólo se ve lo que ya confirmaste y la prenda que estás probando.
> - **Pelo, ropa y objetos con mejor tamaño:** la peluca va detrás de la cabeza (sólo el flequillo por delante) y con tamaño limitado; la ropa cubre el cuerpo; las carteras cuelgan de la mano.
> - **IA de verdad (Gemini, Google):** apretá **K** en la cabina, pegá la clave de Google AI Studio, «Probar» y «Guardar». Con clave:
>   1. al terminar el vestuario, la IA dibuja a **Byte vestido con las prendas reales** (cada combinación se guarda en la compu: la próxima vez sale al instante y gratis);
>   2. la **foto final** la hace la IA: la persona, con su cara, vestida igual que Byte y en el escenario elegido, fotorrealista.
>   Costo aproximado (tarifa de Google, nov. 2026): US$ 0,034 por imagen → unos US$ 0,07 por visitante. Necesita internet. Sin clave, la cabina sigue funcionando en modo collage.


> **Qué cambió en la v4** (las versiones anteriores quedaron intactas)
> - **Identidad visual «cuarto oscuro»:** fondo noche violeta, grano de película, perforaciones de negativo, marcas de visor y la «voz de la máquina» en tipografía mono. Paleta: #0e0a15 · #181221 · #241b31 · #f3eefb · #9b6bff · #ff5a3c (luz de seguridad, sólo en detalles).
> - **Pantallas de película rediseñadas** como afiche de cine a pantalla completa (sin el degradé blanco ni el número gigante) y con menos texto suelto.
> - **Botones** más chicos y quietos: se iluminan y agrandan al pasar el mouse o al apretar el botón físico.
> - **Mini tutorial** abajo a la izquierda en cada pantalla (qué hace la perilla y qué hace el botón), con íconos animados.
> - **Ropa real del Figma para Violetta y Esperando la carroza** (pelo, ropa, accesorios de cabeza, accesorios y escenarios).
> - **Prendas bien ubicadas sobre Byte:** cada pelo se apoya por la línea del pelo y el ancho de la cara; los anteojos ocupan los ojos; la ropa va a los hombros; collares al cuello. Se probaron las 160 prendas una por una.
> - **Foto final:** el pelo ya no tapa la cara (la cara vuelve adelante de las cejas para abajo). El recorte (MediaPipe) ahora funciona con doble clic en index.html y sin internet.
> - **Núcleo 2:** la última estación es otra imagen (una mujer que no existe, generada por Stable Diffusion) y el texto es un poco más grande.
> - ⚠ Para que la foto final sea **realista de verdad** (no collage) hace falta la IA: pegá una clave de Google AI Studio en `config.js` → `geminiApiKey`.


> **Qué cambió en la v3** (las versiones anteriores quedaron intactas en «Cabina Beat» y «Cabina Beat v2»)
> - **Botón de avance grande:** en cada pantalla hay un solo botón violeta, grande y que late, que dice qué pasa al apretarlo («Ir a vestuario», «Ir al escenario», «Ir al núcleo 2»…). El botón físico ahora también avanza de sección (no hace falta la barra).
> - **Núcleo 2:** 10 pasos (antes 30), 5 estaciones de 2 pasos, cada una con su propia imagen hecha por IA (astronauta de Stable Diffusion, los 4 estilos, DeepDream, los pasos del castillo, tu foto). El ruido ahora es «lavado» y en cuadraditos, como las primeras etapas de un modelo de difusión, no estática de tele.
> - **Núcleo 3:** la imagen va abajo, grande, con el pedido (prompt) arriba. Se elige el veredicto con la perilla.
> - **Más imágenes generadas por IA** en todo el recorrido (intro de cada núcleo, datos, veredicto final).
> - **Fotos reales** de El Eternauta, Violetta, Metegol y Esperando la carroza, con la información verificada.


> Esta es la **copia v2** con las correcciones de los profes. La versión anterior quedó intacta en la carpeta «Cabina Beat».
>
> **Qué cambió en la v2**
> - **Núcleo 2:** cada estación limpia el ruido de una imagen que tiene que ver con lo que cuenta: tus piezas con su texto → un hornero (la palabra «hornero» se vuelve números) → la Gioconda pasada por DeepDream (la primera «IA que soñaba», Google 2015) → tu escenario → tu foto. El ruido ahora es «de sueño»: manchas de colores que se mueven, como DeepDream.
> - **Núcleo 3:** cada caso muestra el **pedido (prompt)** y una **imagen**. Se sumó el **caso 5, «Tu foto»**: cómo la cabina te metió en el escenario (tu foto → tu silueta calculada → el resultado).
> - **Foto final:** cada prenda se ubica con 478 puntos de la cara y los hombros (MediaPipe): los anteojos sobre los ojos, las gorras sobre la frente, las pelucas por el hueco de la cara, la ropa sobre los hombros, las cadenas en el cuello. Todo gira si inclinás la cabeza. La cara se dibuja por encima del cuello de la ropa y, si elegís peluca, se borra tu pelo de los costados.
> - Perilla y botón funcionan igual (mismo Arduino, no hay que volver a cargarlo).


## Cómo abrirla
1. **Para probar:** doble clic en `index.html` (se abre en Edge). Tecla **F** = pantalla completa, **D** = panel de prueba con botones en pantalla.
2. **Para la muestra:** doble clic en `INICIAR_CABINA.bat` → Edge en modo kiosco, sin preguntar por la cámara e imprimiendo directo. Salir: **Alt + F4**.

La pantalla está diseñada a 1920×1080 y **se escala sola** a cualquier resolución (notebook Lenovo de 1366×768, 1920×1080 con zoom de Windows al 125/150 %, o una tele). No hay que tocar el zoom de Edge: dejalo en 100 %.

## Controles (sin hardware)
| Control físico | Teclado |
|---|---|
| Barra de ajustes (4 posiciones) | `1` `2` `3` `4` (o ↑ ↓) |
| Perilla / dial | `←` `→` o la rueda del mouse |
| Botón confirmar | `Enter` o `Espacio` |
| Reiniciar | `R` |

## Controles físicos reales
`arduino/cabina_controles/cabina_controles.ino` → para **Arduino Leonardo, Micro o Pro Micro** (un UNO no sirve).
La placa se hace pasar por un teclado USB, así que la página no cambia.
- Barra: potenciómetro deslizante lineal 10k → A0
- Perilla: encoder rotativo KY-040 → pines 2 y 3
- Botón: pulsador arcade → pin 7 y GND

## La foto final: con IA o en collage
- **Con IA (recomendado para la muestra):** en `config.js` pegá una clave de Google AI Studio en `geminiApiKey`. La cabina le manda a Gemini tu foto + las fotos reales de la ropa, el pelo, el accesorio y el escenario elegidos, con un pedido que obliga a cambiar ropa y pelo. Devuelve una foto realista. ⚠ Cada foto tiene un costo según la tarifa de Google (revisalo antes) y necesita internet. No subas la clave a ningún lado.
- **Sin clave (collage):** la compu recorta a la persona, le pega encima las prendas reales (ubicadas según la cara) y la pone en el escenario. Cambia ropa y pelo, pero se ve como collage, no como foto real.

## Recorte y ubicación de prendas (sin internet)
La carpeta `mp/` trae MediaPipe y sus modelos (cara, cuerpo y segmentación) como scripts: funciona **sin internet**, con doble clic o con `INICIAR_CABINA.bat`.
- Si una prenda queda corrida: en `config.js` poné `debugAnclas: true` para ver los puntos, y corregila en `tools/anclas_manual.json` (dos puntos `a` y `b`, en fracciones de la imagen). Después corré `python3 tools/anclas.py`.

## Dónde se cambia cada cosa
- Películas, prendas, escenarios y textos de los núcleos: `js/data.js`
- Byte (redibujado del archivo byte.ai, en violeta): `js/avatar.js` → `byteBase`, `byteBody`, `byteHead`, `byteFace`
- Fotos de ropa, pelo, accesorios y escenarios: salen del Figma del equipo, empaquetadas en `js/assets.js` (lista en `tools/assets_map.py`)
- Sumar fotos propias (por ejemplo para El Eternauta, Violetta, Metegol y Esperando la carroza, que hoy están dibujadas): seguí las instrucciones de `js/fotos_extra.js` y abrí con `INICIAR_CABINA.bat`
- Colores y tipografías: `css/estilos.css`
- Votos de los visitantes: se guardan en esta compu (localStorage de Edge).

## Fuentes de la información
- Violetta: Disney Channel, 2012–2015, producida por Pol-ka — en.wikipedia.org/wiki/Violetta_(TV_series)
- Metegol: Juan José Campanella, 2013, basada en «Memorias de un wing derecho» de Fontanarrosa; presupuesto de 21 millones de dólares — en.wikipedia.org/wiki/Metegol
- Casados con hijos: Telefe, 2005–2006, 212 episodios, adaptación de «Married... with Children» — en.wikipedia.org/wiki/Casados_con_hijos_(Argentine_TV_series)
- LAION-5B: Schuhmann et al., NeurIPS 2022 — arxiv.org/abs/2210.08402
- Stable Diffusion v1-4, model card (CompVis) — huggingface.co/CompVis/stable-diffusion-v1-4
- Rest of World, «How AI reduces the world to stereotypes», oct. 2023 — restofworld.org/2023/ai-image-stereotypes
- Carlini et al., «Extracting Training Data from Diffusion Models», USENIX Security 2023 — arxiv.org/abs/2301.13188
- Théâtre D'opéra Spatial, U.S. Copyright Office Review Board, 2023
- Thaler v. Perlmutter: la Corte Suprema de EE.UU. rechazó revisar el caso el 2/3/2026
- Getty Images v. Stability AI, High Court (Reino Unido), 4/11/2025
- DeepDream: Mordvintsev, Olah y Tyka, «Inceptionism: Going Deeper into Neural Networks», Google Research Blog, julio de 2015

## Créditos de las imágenes de los núcleos 2 y 3 (Wikimedia Commons)
- Hornero (Furnarius rufus) — Charles J. Sharp, CC BY-SA 4.0
- «Mona Lisa» con efecto DeepDream (VGG16) — Pjfinlay, CC0
- Sombrero charro — Elizjorge, CC BY-SA 4.0 (imagen ilustrativa, no generada por IA)
- «Ann Graham Lotz» generada por Stable Diffusion — Carlini et al. 2023, dominio público
- «Théâtre D'opéra Spatial» y su salida original de Midjourney — Jason M. Allen, dominio público (USCO, 2023)
- Arquitectura de Stable Diffusion — Machine Vision and Learning Group, LMU Munich, licencia MIT
- MediaPipe (Google), licencia Apache 2.0

## Imágenes generadas por IA (Wikimedia Commons)
- «a photograph of an astronaut riding a horse» y versiones «by da Vinci / Monet / Hiroshige / Picasso» — Stable Diffusion, por Asanagi, 2022 (CC0 / dominio público)
- Castillo europeo en Japón, pasos 1 a 40 (DDIM) — Stable Diffusion 1.5, por Benlisquare (CC BY-SA 4.0)
- «This AI-generated woman does not exist» — Stable Diffusion, por Benlisquare (dominio público)
- Modelo envenenado (Nightshade) — Shan, Ding, Passananti, Zheng y Zhao, Universidad de Chicago, 2023 (CC BY 4.0)
- «Edmond de Belamy» — Obvious, 2018 (dominio público); vendido en Christie's por US$ 432.500
- «Zarya of the Dawn», tapa — Kris Kashtanova con Midjourney, 2022 (dominio público; USCO, 21/2/2023)
- Mano con seis dedos — Stable Diffusion 1.5, por Corvus (dominio público)

## Fuentes de las películas y series agregadas
- El Eternauta: Netflix, estreno 30/4/2025, creada y dirigida por Bruno Stagnaro, con Ricardo Darín como Juan Salvo — en.wikipedia.org/wiki/The_Eternaut_(TV_series)
- Esperando la carroza: estreno 6/5/1985, dirigida por Alejandro Doria, basada en la obra de Jacobo Langsner (1962) — en.wikipedia.org/wiki/Waiting_for_the_Hearse
- Violetta: Pol-ka para Disney Channel, 3 temporadas y 240 episodios; Studio 21 pasa a llamarse Studio On Beat en la temporada 3 — en.wikipedia.org/wiki/Violetta_(TV_series)
- Metegol: Goya a la mejor película de animación, febrero de 2014 — ciudad.com.ar
- Las fotos de esas cuatro las aportó el equipo.
