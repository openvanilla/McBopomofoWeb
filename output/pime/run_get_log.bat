@echo off
cls

set LOG_FILE="%localappdata%\\PIME\Log\\PIMELauncher.log"
echo %LOG_FILE%
set COMMAND="powershell Get-Content -Tail 10 -Wait %LOG_FILE%"
echo %COMMAND%
powershell -noexit %COMMAND%
