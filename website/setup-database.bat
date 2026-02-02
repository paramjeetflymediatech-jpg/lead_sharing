@echo off
echo Creating database tables...
echo.

REM Change these if your MySQL credentials are different
set MYSQL_USER=root
set MYSQL_PASSWORD=
set MYSQL_DATABASE=lead_sharing

REM Run the schema.sql file
mysql -u %MYSQL_USER% -p%MYSQL_PASSWORD% %MYSQL_DATABASE% < schema.sql

if %ERRORLEVEL% EQU 0 (
    echo.
    echo SUCCESS! All tables created successfully.
    echo.
    echo You can now run: npm run dev
) else (
    echo.
    echo ERROR! Failed to create tables.
    echo Please check your MySQL credentials and try again.
)

pause
