@echo off
chcp 65001 >nul
title Fulcrum INSTALL v2
cd /d "C:\Users\Hp\Documents\fulcrum"

REM Everything goes to install.log AND to the screen
set LOG=install.log
echo === Fulcrum INSTALL v2 %DATE% %TIME% === > %LOG%

call :step "[1/5] Cleaning old node_modules" "if exist node_modules rmdir /s /q node_modules"
call :step "[2/5] npm install (this may take ~30s)" "npm install --no-audit --no-fund"
call :step "[3/5] git init -b main" "if exist .git rmdir /s /q .git & git init -b main"
call :step "[4/5] git add ." "git add ."
call :step "[5/5] git commit" "git commit -m \"feat: initial fulcrum scaffold (v0.1)\""

echo. | tee -a %LOG% >nul 2>&1
echo === DONE === | tee -a %LOG% >nul 2>&1
echo. >> %LOG%
echo === DONE ===
echo.
echo Last 30 lines of install.log:
type %LOG% | more
echo.
echo Press any key to close...
pause >nul
exit /b 0

:step
echo. >> %LOG%
echo --- %~1 --- >> %LOG%
echo. >> %LOG%
echo.
echo --- %~1 ---
%~2 >> %LOG% 2>&1
if errorlevel 1 (
  echo *** FAILED: %~1
  echo *** FAILED: %~1 >> %LOG%
  echo See install.log for details. Press any key to close...
  pause >nul
  exit /b 1
)
echo OK
goto :eof
