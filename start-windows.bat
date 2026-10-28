@echo off
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo Node.js is not installed. Install Node.js 20 or newer from https://nodejs.org
  pause
  exit /b 1
)
echo Starting GeeGeeVerse server in a new window...
start "GeeGeeVerse Server" cmd /k "node server.mjs"
timeout /t 2 /nobreak >nul
start "" "http://localhost:3030"
echo The game should now be open in your browser.
