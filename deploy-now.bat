@echo off
color 0A
echo ===============================================
echo    🚀 AUTOMATED VPS DEPLOYMENT LAUNCHER
echo ===============================================
echo.

REM Check if git is available
git --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Git is not installed or not in PATH
    echo Please install Git first: https://git-scm.com/
    pause
    exit /b 1
)

echo 📋 Step 1: Committing and pushing latest changes to GitHub...
echo.

REM Add all files
git add .

REM Commit changes
git commit -m "Add VPS deployment scripts and configurations"

REM Push to GitHub
git push origin main

if errorlevel 1 (
    echo ❌ Failed to push to GitHub
    echo Please check your Git configuration and try again
    pause
    exit /b 1
)

echo ✅ Successfully pushed to GitHub
echo.

echo 📋 Step 2: VPS Deployment Instructions
echo.
echo Now SSH into your VPS (72.60.97.211) and run ONE of these commands:
echo.
echo 🔥 OPTION A - Direct GitHub deployment (Recommended):
echo curl -sSL https://raw.githubusercontent.com/aedentek/Aedentek-CRM/main/super-deploy.sh ^| sudo bash
echo.
echo 🔥 OPTION B - Manual download and run:
echo wget https://raw.githubusercontent.com/aedentek/Aedentek-CRM/main/super-deploy.sh
echo chmod +x super-deploy.sh
echo sudo ./super-deploy.sh
echo.
echo 📝 SSH Connection Details:
echo Host: 72.60.97.211
echo User: root (or your VPS username)
echo.
echo 🎯 What the script will do automatically:
echo - ✅ Install Node.js, PM2, Nginx
echo - ✅ Clone your repository
echo - ✅ Configure environment
echo - ✅ Start your backend on port 4000
echo - ✅ Set up reverse proxy
echo - ✅ Configure firewall
echo - ✅ Create management tools
echo.
echo ⏱️  Estimated deployment time: 5-10 minutes
echo.

REM Create a simple SSH command file
echo ssh root@72.60.97.211 > connect-vps.bat
echo echo Created connect-vps.bat for easy SSH connection

echo.
echo 🔄 After deployment, update your frontend .env file:
echo VITE_API_URL=http://72.60.97.211:4000/api
echo.
echo ✨ Your backend will be available at:
echo - Direct: http://72.60.97.211:4000
echo - With Nginx: http://72.60.97.211
echo.

pause