cd installer\wix\McBopomofo
cmd /c del /F /Q bin

wix extension add -g WixToolset.Util.wixext/4.0.0
wix extension add -g WixToolset.Bal.wixext/4.0.0
wix extension add -g WixToolset.UI.wixext/4.0.0

echo "Start to build the MSI file..."

@REM candle.exe McBopomofo.wxs -out McBopomofo.wixobj
@REM @if %ERRORLEVEL% NEQ 0 exit %ERRORLEVEL%
@REM cmd /c dir
@REM light.exe McBopomofo.wixobj -out bin\Release\McBopomofo.msi -ext WixUIExtension -ext WixUtilExtension

wix build McBopomofo.wxs -ext WixToolset.Util.wixext/4.0.0 -ext WixToolset.UI.wixext/4.0.0

@if %ERRORLEVEL% NEQ 0 exit %ERRORLEVEL%


@REM cmd /c del /F /Q McBopomofo.wixobj

@REM echo "Start to build the Boostrap bundle..."

cd ..\Bundle

@REM cmd /c del /F /Q  bin
@REM candle.exe Bundle.wxs -out Bundle.wixobj  -ext WixBalExtension 
@REM light.exe Bundle.wixobj -out bin\Release\McBopomofo.exe -ext WixBalExtension -ext WixUtilExtension
@REM del Bundle.wixobj

wix build Bundle.wxs -out bin\Release\McBopomofo.exe -ext WixToolset.Util.wixext/4.0.0 -ext WixToolset.Bal.wixext/4.0.0

cmd /c explorer "bin\Release"
cd ..\..\..
