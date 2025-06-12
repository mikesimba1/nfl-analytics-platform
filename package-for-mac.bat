@echo off
echo 🍎 NFL Analytics - Package for Mac Transfer
echo ============================================
echo.

echo 📦 Creating Mac deployment package...

REM Create temporary package directory
if exist "nfl-analytics-mac-package" rmdir /s /q "nfl-analytics-mac-package"
mkdir "nfl-analytics-mac-package"

echo 📋 Copying essential files...

REM Copy core project files (excluding node_modules and build artifacts)
xcopy /s /e /q "backend\src" "nfl-analytics-mac-package\backend\src\" >nul
xcopy /s /e /q "backend\data" "nfl-analytics-mac-package\backend\data\" >nul
xcopy /q "backend\package.json" "nfl-analytics-mac-package\backend\" >nul
xcopy /q "backend\*.md" "nfl-analytics-mac-package\backend\" >nul

xcopy /s /e /q "frontend\src" "nfl-analytics-mac-package\frontend\src\" >nul
xcopy /q "frontend\package.json" "nfl-analytics-mac-package\frontend\" >nul
xcopy /q "frontend\next.config.js" "nfl-analytics-mac-package\frontend\" >nul
xcopy /q "frontend\tailwind.config.js" "nfl-analytics-mac-package\frontend\" >nul
xcopy /q "frontend\tsconfig.json" "nfl-analytics-mac-package\frontend\" >nul

REM Copy root files
xcopy /q "*.md" "nfl-analytics-mac-package\" >nul
xcopy /q "package.json" "nfl-analytics-mac-package\" >nul
xcopy /q ".gitignore" "nfl-analytics-mac-package\" >nul

REM Copy Mac setup script
xcopy /q "setup-mac-auto.sh" "nfl-analytics-mac-package\" >nul

echo 🔧 Creating Mac-specific files...

REM Create Mac README
echo # 🍎 NFL Analytics for Mac > "nfl-analytics-mac-package\MAC-SETUP.md"
echo. >> "nfl-analytics-mac-package\MAC-SETUP.md"
echo ## 🚀 Quick Start >> "nfl-analytics-mac-package\MAC-SETUP.md"
echo 1. Open Terminal >> "nfl-analytics-mac-package\MAC-SETUP.md"
echo 2. Navigate to this folder: `cd path/to/nfl-analytics-mac-package` >> "nfl-analytics-mac-package\MAC-SETUP.md"
echo 3. Run setup: `chmod +x setup-mac-auto.sh && ./setup-mac-auto.sh` >> "nfl-analytics-mac-package\MAC-SETUP.md"
echo 4. Start platform: `./start-nfl-analytics-mac.sh` >> "nfl-analytics-mac-package\MAC-SETUP.md"
echo. >> "nfl-analytics-mac-package\MAC-SETUP.md"
echo ## 📊 What You Get >> "nfl-analytics-mac-package\MAC-SETUP.md"
echo - Enhanced Analytics Engine v2.0 (75.8%% accuracy) >> "nfl-analytics-mac-package\MAC-SETUP.md"
echo - 2,917 player roster system >> "nfl-analytics-mac-package\MAC-SETUP.md"
echo - Advanced betting edge calculations >> "nfl-analytics-mac-package\MAC-SETUP.md"
echo - Real-time predictions and analysis >> "nfl-analytics-mac-package\MAC-SETUP.md"
echo. >> "nfl-analytics-mac-package\MAC-SETUP.md"
echo The setup script handles everything automatically! >> "nfl-analytics-mac-package\MAC-SETUP.md"

echo ✅ Package created successfully!
echo.
echo 📁 Package location: nfl-analytics-mac-package\
echo 📤 Transfer options:
echo   - USB drive: Copy entire folder
echo   - Cloud sync: Upload to Dropbox/Google Drive
echo   - AirDrop: Select folder and AirDrop to Mac
echo   - Git: Commit and clone on Mac
echo.
echo 🍎 On your Mac, just run: chmod +x setup-mac-auto.sh && ./setup-mac-auto.sh
echo.
pause 