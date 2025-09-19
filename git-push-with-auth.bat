@echo off
echo ===============================================
echo    🔐 Git Authentication Setup & Push
echo ===============================================
echo.

echo 📋 You need to authenticate with GitHub to push changes.
echo.
echo 🔑 Options to fix authentication:
echo.
echo 1. Personal Access Token (Recommended):
echo    - Go to: https://github.com/settings/tokens
echo    - Generate new token (classic)
echo    - Select 'repo' scope
echo    - Use token as password when prompted
echo.
echo 2. GitHub CLI (Alternative):
echo    - Install GitHub CLI: https://cli.github.com/
echo    - Run: gh auth login
echo.
echo 3. SSH Keys (Advanced):
echo    - Set up SSH keys for Git authentication
echo.

echo 🚀 Ready to push? Let's try again...
echo.

REM Try to push again
git push origin main

if errorlevel 1 (
    echo.
    echo ❌ Push failed. Please set up authentication using one of the methods above.
    echo.
    echo 📝 Quick fix: When prompted for password, use your Personal Access Token
    echo    (not your GitHub password)
    echo.
    echo 🔄 After setting up authentication, run this script again or use:
    echo    git push origin main
    echo.
) else (
    echo.
    echo ✅ Successfully pushed to GitHub!
    echo.
    echo 🎯 Your repository is now ready for VPS deployment.
    echo.
    echo 📋 Next step: SSH to your VPS and run:
    echo curl -sSL https://raw.githubusercontent.com/aedentek/Aedentek-CRM/main/super-deploy.sh ^| sudo bash
    echo.
)

pause