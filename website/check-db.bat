@echo off
echo.
echo =============================================
echo   MySQL Database Status Check
echo   Database: lead_sharing
echo =============================================
echo.

REM Check if MySQL is accessible
mysql --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] MySQL command not found in PATH
    echo.
    echo Please make sure MySQL is installed and added to PATH
    echo Or use MySQL Workbench instead
    echo.
    pause
    exit /b 1
)

echo Connecting to database...
echo.

REM Count users
echo [USERS]
mysql -u aman -paman1234 lead_sharing -e "SELECT COUNT(*) as total_users FROM users;"
mysql -u aman -paman1234 lead_sharing -e "SELECT role, COUNT(*) as count FROM users GROUP BY role;"
echo.

REM Count jobs
echo [JOBS]
mysql -u aman -paman1234 lead_sharing -e "SELECT COUNT(*) as total_jobs FROM jobs;"
echo.

REM Count leads
echo [LEADS]
mysql -u aman -paman1234 lead_sharing -e "SELECT COUNT(*) as total_leads FROM leads;"
echo.

REM Show recent users
echo [RECENT USERS]
mysql -u aman -paman1234 lead_sharing -t -e "SELECT id, email, name, role, created_at FROM users ORDER BY created_at DESC LIMIT 5;"
echo.

echo =============================================
echo   Check complete!
echo =============================================
echo.
echo To view in GUI, use MySQL Workbench:
echo   Host: localhost
echo   User: aman
echo   Password: aman1234
echo   Database: lead_sharing
echo.
pause
