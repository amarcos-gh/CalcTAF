@echo off
setlocal

set "ROOT=%~dp0.."
set "PG=%ROOT%\runtime\postgresql\binarios\pgsql"
set "DATA=%ROOT%\runtime\postgresql\data"
set "BACKEND=%ROOT%\app\backend"
set "NODE=%ROOT%\runtime\node\node.exe"

set "DATABASE_URL=postgresql://postgres:CalcTAF@2026@127.0.0.1:55432/calctaf"

"%PG%\bin\pg_ctl.exe" ^
  -D "%DATA%" ^
  -o "-p 55432" ^
  -l "%ROOT%\runtime\postgresql\postgresql.log" ^
  start >nul 2>&1

timeout /t 3 /nobreak >nul

netstat -ano | findstr /R /C:":3000 .*LISTENING" >nul 2>&1

if %errorlevel%==0 (
    start "" "http://localhost:3000"
    endlocal
    exit /b 0
)

cd /d "%BACKEND%"

start "" /b "%NODE%" "%BACKEND%\src\server.js"

timeout /t 5 /nobreak >nul

start "" "http://localhost:3000"

endlocal
exit /b 0