/* =====================================================================
   CABINA BYTE · CONTROLES FÍSICOS  (Arduino Pro Micro)
   El Pro Micro se hace pasar por un TECLADO USB: la cabina no cambia.

   CONEXIONES
   ----------------------------------------------------------------------
   PERILLA (encoder KY-040)       BOTÓN (pulsador de panel, 2 patitas)
     CLK → pin 2                    una patita  → pin 7
     DT  → pin 3                    otra patita → GND
     SW  → (nada)
     +   → VCC                    BARRA (fader A10KX2, se usa UNA de sus dos pistas)
     GND → GND                      pata 1 → VCC
                                    pata 2 (cursor, la del medio) → A0
                                    pata 3 → GND

   OJO CON EL FADER "A10K": la letra A significa curva LOGARÍTMICA (de audio).
   No sube parejo: en la mitad del recorrido marca mucho menos que la mitad.
   Este programa lo corrige con CURVA (ver abajo), así las 4 posiciones de la
   barra quedan repartidas en partes iguales.

   CÓMO CALIBRAR (una sola vez, 2 minutos)
   ----------------------------------------------------------------------
   1. Poné MODO_PRUEBA = true y subí el programa.
   2. Abrí Herramientas → Monitor Serie (9600 baudios).
   3. Poné la barra JUSTO EN LA MITAD y mirá "valor":
        valor menor a 300  → dejá CURVA = 1
        valor mayor a 700  → poné CURVA = -1
        valor entre 300 y 700 → poné CURVA = 0 (el fader es lineal)
   4. Mové la barra de punta a punta: tiene que decir zona 1, 2, 3, 4.
      Si dice 4-3-2-1 al revés, poné INVERTIR_BARRA = true.
   5. Volvé a poner MODO_PRUEBA = false y subí el programa. Listo.

   QUÉ MANDA EN LA CABINA
     perilla = ← →   ·   botón = Enter   ·   barra = teclas 1 2 3 4
   ===================================================================== */
#include <Keyboard.h>
#include <math.h>

// ---------- AJUSTES (cambien solo esto) ----------
const bool MODO_PRUEBA      = false; // true = revisar conexiones · false = usar la cabina
const bool USAR_BARRA       = true;  // fader conectado en A0
const int  CURVA            = -1;    // 1 = fader logarítmico (A10K) · -1 = logarítmico al revés · 0 = lineal (B10K)
const bool INVERTIR_BARRA   = false; // true si la barra da 4-3-2-1 en vez de 1-2-3-4
const bool INVERTIR_PERILLA = false; // true si al girar a la derecha va a la izquierda
const int  PASOS_POR_CLIC   = 4;     // si cada clic avanza 2 opciones o no avanza, probá con 2

// ---------- PINES ----------
const int PIN_CLK   = 2;
const int PIN_DT    = 3;
const int PIN_BOTON = 7;
const int PIN_BARRA = A0;

// ---------- variables internas ----------
int zonaActual = -1, zonaCandidata = -1;
unsigned long zonaDesde = 0;
int encAcum = 0, perillaTotal = 0;
uint8_t encPrev = 0;
bool botonPrev = HIGH;
unsigned long botonT = 0;
int ultimoValorBarra = -100;
unsigned long ultimoAvisoBarra = 0, ultimoLatido = 0;
int minBarra = 1023, maxBarra = 0;
float barraSuave = -1;
const int8_t TABLA[16] = { 0, -1, 1, 0, 1, 0, 0, -1, -1, 0, 0, 1, 0, 1, -1, 0 };
const char* NOMBRE_ZONA[4] = { "1 INICIO / -", "2 PELICULA / CREA", "3 VESTUARIO / RECOMBINA", "4 ESCENARIO / COPIA" };

void aviso(const String& msg) { if (MODO_PRUEBA) Serial.println(msg); }
void tecla(uint8_t k) { if (!MODO_PRUEBA) Keyboard.write(k); }

// valor leído (0-1023) → posición real del fader (0.0 a 1.0), corrigiendo la curva logarítmica
float posicion(int v) {
  float x = v / 1023.0;
  const float B = 25.0;                       // forma típica de una curva "A" (≈15 % en la mitad)
  float p;
  if (CURVA == 1)       p = log(1 + x * (B - 1)) / log(B);
  else if (CURVA == -1) p = 1 - log(1 + (1 - x) * (B - 1)) / log(B);
  else                  p = x;
  if (INVERTIR_BARRA) p = 1 - p;
  return constrain(p, 0.0, 1.0);
}
// posición → zona 0..3, con un margen para que no salte entre dos zonas en el borde
int leerZona(float p) {
  if (zonaActual >= 0) {
    float desde = zonaActual * 0.25 - 0.05, hasta = (zonaActual + 1) * 0.25 + 0.05;
    if (p >= desde && p <= hasta) return zonaActual;
  }
  return constrain((int)(p * 4), 0, 3);
}

void setup() {
  pinMode(PIN_CLK, INPUT_PULLUP);
  pinMode(PIN_DT, INPUT_PULLUP);
  pinMode(PIN_BOTON, INPUT_PULLUP);
  encPrev = (digitalRead(PIN_CLK) << 1) | digitalRead(PIN_DT);

  if (MODO_PRUEBA) {
    Serial.begin(9600);
    unsigned long t0 = millis();
    while (!Serial && millis() - t0 < 5000) { }
    Serial.println();
    Serial.println("==============================================");
    Serial.println(" CABINA BYTE - MODO PRUEBA (no manda teclas)");
    Serial.println("==============================================");
    Serial.println("  BOTON   -> 'BOTON: apretado'");
    Serial.println("  PERILLA -> 'PERILLA: derecha / izquierda'");
    Serial.println("  BARRA   -> 'BARRA: valor ... posicion ...% zona ...'");
    Serial.println("Calibrar la barra: ponela en la MITAD y mira el valor (ver instrucciones arriba del programa).");
    Serial.println("----------------------------------------------");
  } else {
    delay(1500);
    Keyboard.begin();
  }
}

void loop() {
  // ---------------- BARRA (fader) ----------------
  if (USAR_BARRA || MODO_PRUEBA) {
    int crudo = analogRead(PIN_BARRA);
    barraSuave = barraSuave < 0 ? crudo : barraSuave * 0.85 + crudo * 0.15;   // filtra el ruido
    int v = (int)barraSuave;
    minBarra = min(minBarra, v); maxBarra = max(maxBarra, v);
    float p = posicion(v);
    int z = leerZona(p);

    if (MODO_PRUEBA && abs(v - ultimoValorBarra) > 12 && millis() - ultimoAvisoBarra > 150) {
      ultimoValorBarra = v; ultimoAvisoBarra = millis();
      aviso("BARRA: valor " + String(v) + "  posicion " + String((int)(p * 100)) + "%  -> zona " + NOMBRE_ZONA[z]);
    }
    if (z != zonaCandidata) { zonaCandidata = z; zonaDesde = millis(); }
    if (zonaCandidata != zonaActual && millis() - zonaDesde > 120) {
      zonaActual = zonaCandidata;
      if (USAR_BARRA) tecla('1' + zonaActual);
    }
  }

  // ---------------- PERILLA ----------------
  uint8_t enc = (digitalRead(PIN_CLK) << 1) | digitalRead(PIN_DT);
  if (enc != encPrev) {
    encAcum += TABLA[(encPrev << 2) | enc];
    encPrev = enc;
    if (encAcum >= PASOS_POR_CLIC) {
      encAcum = 0; perillaTotal += INVERTIR_PERILLA ? -1 : 1;
      tecla(INVERTIR_PERILLA ? KEY_LEFT_ARROW : KEY_RIGHT_ARROW);
      aviso(String("PERILLA: ") + (INVERTIR_PERILLA ? "izquierda <-" : "derecha  ->") + "   (cuenta: " + perillaTotal + ")");
    }
    if (encAcum <= -PASOS_POR_CLIC) {
      encAcum = 0; perillaTotal += INVERTIR_PERILLA ? 1 : -1;
      tecla(INVERTIR_PERILLA ? KEY_RIGHT_ARROW : KEY_LEFT_ARROW);
      aviso(String("PERILLA: ") + (INVERTIR_PERILLA ? "derecha  ->" : "izquierda <-") + "   (cuenta: " + perillaTotal + ")");
    }
  }

  // ---------------- BOTÓN ----------------
  bool b = digitalRead(PIN_BOTON);
  if (b != botonPrev && millis() - botonT > 30) {
    botonT = millis(); botonPrev = b;
    if (b == LOW) { tecla(KEY_RETURN); aviso("BOTON: apretado  (en la cabina = Enter)"); }
    else          { aviso("BOTON: soltado"); }
  }

  // ---------------- resumen cada 10 s (solo modo prueba) ----------------
  if (MODO_PRUEBA && millis() - ultimoLatido > 10000) {
    ultimoLatido = millis();
    String barra = "BARRA: recorrido medido " + String(minBarra) + " a " + String(maxBarra);
    if (maxBarra - minBarra < 50) barra += "  (no se movio todavia)";
    else if (minBarra > 60 || maxBarra < 960) barra += "  (! no llega a las puntas: revisa que A0 este en la pata 2, la del MEDIO)";
    else barra += "  (ok)";
    aviso("... sigo funcionando. " + barra);
  }
}
