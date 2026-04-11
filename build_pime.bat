@echo off
@REM Run as administrator
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo =======================================================
    echo = ALARM: You must run this script as Administrator.   =
    echo =======================================================
    pause
    exit /b 1
)

set IME_NAME=mcbopomofo

echo * Build %IME_NAME% for PIME
call npm run build:pime
echo * Delete old files
rmdir /S /Q "C:\Program Files (x86)\PIME\node\input_methods\%IME_NAME%"
echo * Copy new files
xcopy /E /I ".\output\pime" "C:\Program Files (x86)\PIME\node\input_methods\%IME_NAME%"

@REM echo * Register %IME_NAME%
@REM "C:\Program Files (x86)\PIME\node\input_methods\%IME_NAME%\run_register_ime.bat"


echo "Please restart PIME Launcher to see the changes."

