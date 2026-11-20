@echo off
REM ==================================================================
REM  CABINA BEAT - abre la cabina en Edge en modo kiosco (pantalla completa)
REM  --kiosk                       pantalla completa sin barras
REM  --use-fake-ui-for-media-stream acepta la camara sin preguntar
REM  --kiosk-printing              imprime directo en la impresora predeterminada
REM  Usa un perfil aparte, asi no toca tus pestanas de Edge.
REM  Para salir del modo kiosco: Alt + F4
REM ==================================================================
start "" msedge --user-data-dir="%TEMP%\cabina-beat-edge" --kiosk "%~dp0index.html" --edge-kiosk-type=fullscreen --no-first-run --use-fake-ui-for-media-stream --kiosk-printing --autoplay-policy=no-user-gesture-required --allow-file-access-from-files
