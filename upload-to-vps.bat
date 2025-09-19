@echo off
REM Windows batch script to upload backend to VPS

echo ====================================
echo CRM Backend VPS Upload Script
echo ====================================

REM Configuration - Update these with your VPS details
set VPS_IP=72.60.97.211
set VPS_USER=root
set VPS_PATH=/var/www/Aedentek-CRM/backend

echo.
echo 1. Preparing backend files for upload...

REM Create temporary directory
if exist "temp_backend" rmdir /s /q "temp_backend"
mkdir "temp_backend"

REM Copy backend files (excluding node_modules and unnecessary files)
xcopy "backend\*" "temp_backend\" /s /e /y
if exist "temp_backend\node_modules" rmdir /s /q "temp_backend\node_modules"
if exist "temp_backend\.git" rmdir /s /q "temp_backend\.git"

REM Copy the production environment file
copy "backend\.env.production" "temp_backend\.env"

REM Copy management scripts
copy "deploy-vps.sh" "temp_backend\"
copy "manage-vps.sh" "temp_backend\"
copy "nginx-crm-api.conf" "temp_backend\"
copy "backend\ecosystem.config.json" "temp_backend\"

echo.
echo 2. Files prepared in temp_backend directory
echo.
echo 3. Manual upload instructions:
echo    - Use FileZilla, WinSCP, or similar FTP/SFTP client
echo    - Connect to: %VPS_IP%
echo    - Username: %VPS_USER%
echo    - Upload temp_backend contents to: %VPS_PATH%
echo.
echo 4. After upload, SSH into your VPS and run:
echo    chmod +x /var/www/CRM/backend/deploy-vps.sh
echo    chmod +x /var/www/CRM/backend/manage-vps.sh
echo    sudo /var/www/CRM/backend/deploy-vps.sh
echo.
echo 5. Alternative - SCP command (if you have SSH access):
echo    scp -r temp_backend/* %VPS_USER%@%VPS_IP%:%VPS_PATH%/
echo.

REM Keep window open
pause

REM Cleanup
rmdir /s /q "temp_backend"