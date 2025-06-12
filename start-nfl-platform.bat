@echo off
echo Starting NFL Analytics Platform...
echo.

echo Starting Backend Server...
start "NFL Backend" cmd /k "cd backend && npm start"

echo Waiting for backend to start...
timeout /t 3 /nobreak >nul

echo Starting Frontend Server...
start "NFL Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo NFL Analytics Platform is starting up!
echo.
echo Backend: http://localhost:3001
echo Frontend: http://localhost:3000
echo.
echo The platform will open automatically in your browser shortly...
timeout /t 5 /nobreak >nul

start http://localhost:3000

echo.
echo Platform launched! Check the opened browser windows.
pause 