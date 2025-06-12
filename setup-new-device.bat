@echo off
echo 🏈 NFL Analytics Platform - New Device Setup
echo ===============================================
echo.

echo 📦 Installing Backend Dependencies...
cd backend
call npm install
if %errorlevel% neq 0 (
    echo ❌ Backend installation failed
    pause
    exit /b 1
)

echo.
echo 🎨 Installing Frontend Dependencies...
cd ../frontend
call npm install
if %errorlevel% neq 0 (
    echo ❌ Frontend installation failed
    pause
    exit /b 1
)

echo.
echo ✅ Setup Complete! 
echo.
echo 🚀 To start the platform:
echo   Backend:  cd backend && npm start
echo   Frontend: cd frontend && npm run dev
echo.
echo 📊 Enhanced Analytics Available at:
echo   http://localhost:3001/api/enhanced-analytics/model-performance
echo.
pause 