@echo off
cd /d "%~dp0"
if exist "%~dp0dist\win-unpacked\PNL Calendar.exe" (
  start "" "%~dp0dist\win-unpacked\PNL Calendar.exe"
) else if exist "%~dp0node_modules\electron\dist\electron.exe" (
  start "" "%~dp0node_modules\electron\dist\electron.exe" "%~dp0"
) else (
  echo PNL Calendar not found. Run npm run pack or npm install in the project folder.
  pause
)
exit
