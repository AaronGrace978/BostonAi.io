@echo off
title BostonAI Local Proxy
cd /d "%~dp0"

where node >nul 2>&1
if errorlevel 1 (
  echo.
  echo  Node.js is required for the local proxy.
  echo  Opening https://nodejs.org/ — install LTS, then run this again.
  echo.
  start https://nodejs.org/
  pause
  exit /b 1
)

echo.
echo  BostonAI local proxy — keep this window open.
echo  Then open https://bostonai.io and turn on "Local proxy".
echo.
node "%~dp0bostonai-proxy.mjs"
pause
