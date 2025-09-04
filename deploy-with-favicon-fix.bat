@echo off
REM Deployment script to ensure favicon cache busting

echo 🚀 Preparing deployment with favicon cache busting...

REM Get current timestamp for cache busting
for /f "delims=" %%i in ('powershell -command "Get-Date -UFormat %%s"') do set TIMESTAMP=%%i

echo 📁 Updating favicon cache busting version to: %TIMESTAMP%

REM Update the version in index.html for cache busting
powershell -Command "(gc frontend\index.html) -replace 'favicon\.ico\?v=[0-9.]*', 'favicon.ico?v=%TIMESTAMP%' | Out-File -encoding UTF8 frontend\index.html"

echo 🏗️ Building frontend...
cd frontend
call npm run build

echo ✅ Build complete! Favicon should now load instantly without cache issues.
echo 📋 Favicon cache busting version: %TIMESTAMP%

echo 📦 Dist folder ready for deployment at: %cd%\dist\

pause
