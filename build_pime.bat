@REM Run as administrator

echo * Build McBopomopfo for PIME
call npm run build:pime
echo * Delete old files
rmdir /S /Q "C:\Program Files (x86)\PIME\node\input_methods\mcbopomofo"
echo * Copy new files
xcopy /E /I ".\output\pime" "C:\Program Files (x86)\PIME\node\input_methods\mcbopomofo"

@REM echo * Register McBopomofo
@REM "C:\Program Files (x86)\PIME\node\input_methods\mcbopomofo\run_register_ime.bat"


echo "Please restart PIME Launcher to see the changes."

