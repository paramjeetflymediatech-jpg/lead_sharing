@echo off
REM Check if python is available
where python >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo Running screenshot script via Python...
    python "%~dp0take_screenshot.py"
) else (
    echo Python not found. Falling back to basic ADB commands.
    
    REM Make sure screenshots directory exists
    if not exist "%~dp0..\screenshots" mkdir "%~dp0..\screenshots"
    
    REM Capture the screen on the device
    echo Taking screenshot...
    adb shell screencap -p /sdcard/screenshot_latest.png
    
    REM Pull the file from the device to the computer
    adb pull /sdcard/screenshot_latest.png "%~dp0..\screenshots\screenshot_latest.png"
    
    REM Remove the temporary file from the device
    adb shell rm /sdcard/screenshot_latest.png
    
    echo Success! Screenshot saved to: screenshots\screenshot_latest.png
)
pause
