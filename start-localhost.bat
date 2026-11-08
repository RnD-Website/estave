@echo off
chcp 65001 >nul
title ESTAVE - local server
cd /d "%~dp0"

where node >nul 2>nul
if errorlevel 1 (
  echo.
  echo  Node.js is not installed.
  echo  Download the LTS version from https://nodejs.org , install it, then run this file again.
  echo.
  start "" https://nodejs.org/en/download
  pause
  exit /b
)

if not exist node_modules (
  echo.
  echo  First run: installing packages ^(1-2 minutes^)...
  echo.
  call npm install
  if errorlevel 1 (
    echo.
    echo  npm install failed. Check your internet connection and try again.
    pause
    exit /b
  )
)

echo.
echo  Starting ESTAVE at http://localhost:5173
echo  Keep this window open while you use the site. Close it to stop the server.
echo.
call npm run dev -- --open
pause
