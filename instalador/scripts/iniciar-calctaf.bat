@echo off
setlocal

set "ROOT=%~dp0.."
set "PG=%ROOT%\runtime\postgresql\binarios\pgsql"
set "DATA=%ROOT%\runtime\postgresql\data"
set "BACKEND=%ROOT%\app\backend"

set "DATABASE_URL=postgresql://postgres:CalcTAF@2026@127.0.0.1:55432/calctaf"

echo Iniciando PostgreSQL...
"%PG%\bin\pg_ctl.exe" -D "%DATA%" -o "-p 55432" -l "%ROOT%\runtime\postgresql\postgresql.log" start

timeout /t 3 /nobreak >nul

echo Iniciando CalcTAF...
cd /d "%BACKEND%"
set "PORT=3000"
"%ROOT%\\runtime\\node\\node.exe" "%BACKEND%\src\server.js"

endlocal

