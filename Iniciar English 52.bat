@echo off
title English 52 Weeks
cd /d "%~dp0"

echo.
echo  ==========================================
echo    English 52 Weeks - iniciando o app...
echo  ==========================================
echo.

if not exist "node_modules" (
  echo Instalando dependencias pela primeira vez. Aguarde...
  call npm install
)

echo O navegador vai abrir sozinho em alguns segundos.
echo Para FECHAR o app, feche esta janela preta.
echo.
call npm run dev -- --open
pause
