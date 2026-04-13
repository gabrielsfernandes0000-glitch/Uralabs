@echo off
echo Iniciando dev server na porta 4000...
echo Ctrl+C pra parar quando terminar de testar
cd /d "%~dp0"
set NODE_OPTIONS=--max-old-space-size=512
npx next dev --port 4000
