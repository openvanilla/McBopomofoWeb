@REM Run as administrator

echo "Build McBopomopfo for PIME"
call npm run build:pime
echo "Delete old files"
rmdir /s "C:\Program Files (x86)\PIME\node\input_methods\mcbopomofo"
echo "Copy new files"
xcopy /E /I ".\output\pime" "C:\Program Files (x86)\PIME\node\input_methods\mcbopomofo"
echo "Register McBopomofo"
"C:\Program Files (x86)\PIME\node\input_methods\mcbopomofo\run_register_ime.bat"