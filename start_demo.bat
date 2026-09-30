@echo off
REM ==============================================================================
REM Smart India Hackathon (SIH) - Problem Statement 26120
REM Digital Twin for Cyclic Steam Stimulation (CSS) & Sucker Rod Pump (SRP)
REM Heavy Oil Wells of Baghewala Field (Oil India Limited)
REM ==============================================================================

echo ======================================================================
echo     BAGHEWALA FIELD DIGITAL TWIN - WINDOWS LAUNCHER (MERN STACK)
echo ======================================================================

set CURRENT_DIR=%~dp0
cd /d "%CURRENT_DIR%backend"
echo [1/3] Starting Express Backend on Port 5000...
start "Baghewala Backend" cmd /k "node src/server.js"

timeout /t 3 /nobreak > nul

cd /d "%CURRENT_DIR%frontend"
echo [2/3] Starting Vite SCADA Frontend on Port 3000...
start "Baghewala Frontend" cmd /k "npm run dev"

echo [3/3] System launched!
echo Backend:  http://localhost:5000
echo Frontend: http://localhost:3000
echo ======================================================================
pause
