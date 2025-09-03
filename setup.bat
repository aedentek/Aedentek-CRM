@echo off
echo Setting up Gandhii Bai CRM Project...
echo.

echo Step 1: Installing root dependencies...
call npm install

echo.
echo Step 2: Installing frontend dependencies...
cd frontend
call npm install
cd ..

echo.
echo Step 3: Installing backend dependencies...
cd backend
call npm install
cd ..

echo.
echo Step 4: Setting up environment files...
if not exist "backend\.env" (
    copy "backend\.env.example" "backend\.env"
    echo Created backend\.env - Please update with your database credentials
)

if not exist "frontend\.env" (
    copy "frontend\.env.example" "frontend\.env"
    echo Created frontend\.env
)

echo.
echo Setup complete! 
echo.
echo Next steps:
echo 1. Update backend\.env with your database credentials
echo 2. Create your MySQL database: gandhii_bai_crm
echo 3. Run database migrations from shared\sql directory
echo 4. Start development: npm run dev
echo.
pause
