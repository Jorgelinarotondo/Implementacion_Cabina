/* =====================================================================
   PRUEBA SIN SOLDAR · Pro Micro / Leonardo
   Para probar que el Pro Micro funciona como teclado sin soldar nada.
   No usa la barra (A0), así no escribe números solo.

   Con un cable dupont (o un clip, o un alambre) tocá:
     pin 7 con GND  → escribe Enter        (el botón)
     pin 2 con GND  → flecha derecha  →    (perilla)
     pin 3 con GND  → flecha izquierda ←   (perilla)
   Antes abrí el Bloc de notas, porque el Pro Micro "escribe" donde esté el cursor.
   ===================================================================== */
#include <Keyboard.h>

const int PINES[3] = { 7, 2, 3 };
const uint8_t TECLAS[3] = { KEY_RETURN, KEY_RIGHT_ARROW, KEY_LEFT_ARROW };
bool antes[3] = { HIGH, HIGH, HIGH };
unsigned long t[3] = { 0, 0, 0 };

void setup() {
  for (int i = 0; i < 3; i++) pinMode(PINES[i], INPUT_PULLUP);
  delay(1500);
  Keyboard.begin();
}

void loop() {
  for (int i = 0; i < 3; i++) {
    bool ahora = digitalRead(PINES[i]);
    if (ahora != antes[i] && millis() - t[i] > 40) {   // filtro de rebote
      t[i] = millis();
      antes[i] = ahora;
      if (ahora == LOW) Keyboard.write(TECLAS[i]);    // se tocó con GND
    }
  }
}
