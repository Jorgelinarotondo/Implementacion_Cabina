/* =====================================================================
   CABINA BYTE · CONFIGURACIÓN
   Este es el único archivo que necesitan tocar para ajustar la cabina.
   ===================================================================== */
window.CABINA_CONFIG = {

  /* --- Generación con IA real (opcional) ---------------------------------
     Si dejan la clave vacía, la cabina usa el "modo laboratorio": arma la
     foto final en la compu (recorta a la persona, le pone el escenario,
     el accesorio y a Byte) sin internet ni costo.
     Si pegan una clave de Google AI Studio (https://aistudio.google.com/apikey)
     la foto se manda a Gemini (Nano Banana) para que la IA la transforme de
     verdad con el vestuario y el escenario elegidos.
     ⚠ No suban este archivo con la clave a internet ni a un repo público. */
  geminiApiKey: "",

  /* Modelo de imagen de Gemini. Si Google lo cambia, actualicen el nombre.
     Opciones documentadas a oct-2026: "gemini-nano-banana-2.1",
     "gemini-3.1-flash-image", "gemini-3.1-flash-lite-image", "gemini-2.5-flash-image" */
  geminiModel: "gemini-nano-banana-2.1",

  /* Segundos máximos que se espera a la IA antes de usar el modo laboratorio */
  aiTimeoutSeconds: 75,

  /* Recorte de la persona con MediaPipe (necesita internet la primera vez).
     Si no carga, la foto igual se arma con un marco ovalado. */
  usarRecortePersona: true,

  /* Recortar la ropa con la silueta de Byte (torso y brazos), así no sobresale del cuerpo */
  recortarRopaAlCuerpo: true,

  /* Segundos sin tocar nada antes de volver a la pantalla de inicio */
  inactividadSegundos: 120,

  /* Imprimir automáticamente al apretar el botón en la pantalla final.
     Para que imprima sin ventana, abrir con INICIAR_CABINA.bat (usa --kiosk-printing) */
  imprimir: false,

  /* QR para llevarse la foto: cada foto se sube a internet y el QR lleva a esa foto.
     Con una clave gratis de imgbb.com (https://api.imgbb.com) la foto dura las horas de qrHoras.
     La clave también se puede pegar en la cabina con la tecla K.
     Sin clave se usa tmpfiles.org: sin cuenta, la foto se borra sola a los 60 minutos.
     Necesita internet. Para no subir nada: qrFoto: false */
  qrFoto: true,
  imgbbApiKey: "",
  qrHoras: 24,

  /* Navegar con mouse y teclado (mientras no esté armada la interfaz física).
     Muestra el cursor y hace clickeable todo. Para la muestra final: false */
  modoMouse: true,

  /* Panel de prueba con botones en pantalla (también se abre con la tecla D) */
  mostrarPanelPrueba: false,
  debugAnclas: false        // true = dibuja en la foto final los puntos donde se apoya cada prenda (para revisar)
};
