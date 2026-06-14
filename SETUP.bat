@echo off
REM Fulcrum — Windows setup helper (vrclinix patterni)

setlocal

where node >nul 2>&1
if errorlevel 1 (
  echo Node.js bulunamadi. https://nodejs.org adresinden v20+ kur.
  exit /b 1
)

echo === npm install ===
call npm install
if errorlevel 1 exit /b 1

if not exist .env (
  if exist .env.example (
    copy .env.example .env >nul
    echo .env olusturuldu, Supabase anahtarlarini doldurmayi unutma.
  )
)

echo.
echo === smoke test (Supabase'siz, sadece PubMed) ===
call npm run smoke:pubmed -- --days 2 --max 20
if errorlevel 1 (
  echo Smoke test basarisiz. Internete eristigini ve PubMed E-utilities'in acik oldugunu dogrula.
  exit /b 1
)

echo.
echo === dev sunucu baslatiliyor ===
call npm run dev

endlocal
