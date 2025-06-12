@echo off
echo.
echo ======================================
echo    NFL Analytics Pro - Launcher
echo ======================================
echo.
echo Starting NFL Analytics Platform...
echo Frontend: http://localhost:3000
echo Backend:  http://localhost:3001
echo.

REM Start backend in background
echo Starting backend server...
start "NFL Backend" cmd /c "cd backend && npm start"
timeout /t 3 >nul

REM Start frontend in background  
echo Starting frontend server...
start "NFL Frontend" cmd /c "cd frontend && npm run dev"
timeout /t 5 >nul

REM Open browser
echo Opening NFL Analytics Pro in browser...
start http://localhost:3000

echo.
echo Platform is launching!
echo - Frontend: http://localhost:3000
echo - Backend:  http://localhost:3001
echo.
echo Press any key to close this launcher...
pause >nul 