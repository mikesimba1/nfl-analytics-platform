@echo off
echo 🐙 NFL Analytics - GitHub Setup Assistant
echo =========================================
echo.

echo This script will help you push your NFL Analytics Platform to GitHub
echo so you can access it from any device (desktop, laptop, phone, etc.)
echo.

echo 📋 What you'll need:
echo   1. GitHub account (free at github.com)
echo   2. Git installed (we'll check this)
echo   3. 5 minutes of your time
echo.

REM Check if Git is installed
git --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Git is not installed. Please install Git first:
    echo    Download from: https://git-scm.com/download/win
    echo.
    pause
    exit /b 1
)

echo ✅ Git is installed
echo.

echo 🔧 Current repository status:
git status
echo.

echo 📚 Step-by-step instructions:
echo.
echo 1️⃣  CREATE GITHUB REPOSITORY:
echo    - Go to github.com and sign in
echo    - Click "New repository" (green button)
echo    - Name: "nfl-analytics-enhanced"
echo    - Description: "Enhanced NFL Analytics Platform v2.0 - 75.8%% accuracy"
echo    - Set to Private (recommended)
echo    - DON'T initialize with README (we have files already)
echo    - Click "Create repository"
echo.

echo 2️⃣  COPY THE COMMANDS GITHUB SHOWS YOU:
echo    GitHub will show commands like:
echo    git remote add origin https://github.com/YOUR_USERNAME/nfl-analytics-enhanced.git
echo    git branch -M main  
echo    git push -u origin main
echo.

echo 3️⃣  RUN THE COMMANDS HERE:
echo    Come back to this terminal and run the commands GitHub gave you
echo.

echo 🎯 Example commands (replace YOUR_USERNAME):
echo    git remote add origin https://github.com/YOUR_USERNAME/nfl-analytics-enhanced.git
echo    git branch -M main
echo    git push -u origin main
echo.

echo 📱 Once pushed, you can access from ANY device:
echo    - Desktop: git clone https://github.com/YOUR_USERNAME/nfl-analytics-enhanced.git
echo    - Laptop: git clone https://github.com/YOUR_USERNAME/nfl-analytics-enhanced.git  
echo    - Phone: Browse to github.com/YOUR_USERNAME/nfl-analytics-enhanced
echo    - Tablet: Use GitHub mobile app or GitHub Codespaces
echo.

echo ✨ What's included in your repository:
echo    ✅ Enhanced Analytics Engine v2.0 (75.8%% accuracy)
echo    ✅ Complete 2,917 player roster system
echo    ✅ Professional web interface  
echo    ✅ Mac auto-setup scripts
echo    ✅ Cross-device development tools
echo    ✅ All documentation and guides
echo.

echo 🚀 Ready to push? Follow the steps above!
echo.
echo 💡 Need help? The commands are waiting for you at GitHub after you create the repo.
echo.
pause 