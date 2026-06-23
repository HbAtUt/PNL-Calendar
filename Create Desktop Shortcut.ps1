# Creates or updates a desktop shortcut with the PNL Calendar icon (no terminal).
$AppDir = $PSScriptRoot
$BuiltExe = Join-Path $AppDir "dist\win-unpacked\PNL Calendar.exe"
$Electron = Join-Path $AppDir "node_modules\electron\dist\electron.exe"
$Icon = Join-Path $AppDir "assets\icon.ico"
$ShortcutPath = Join-Path ([Environment]::GetFolderPath("Desktop")) "PNL Calendar.lnk"

if (Test-Path $BuiltExe) {
  $TargetPath = $BuiltExe
  $Arguments = ""
  $WorkingDirectory = Split-Path $BuiltExe -Parent
} elseif (Test-Path $Electron) {
  $TargetPath = $Electron
  $Arguments = "`"$AppDir`""
  $WorkingDirectory = $AppDir
} else {
  Write-Error "No app found. Run 'npm run pack' or 'npm install' in $AppDir first."
  exit 1
}

if (-not (Test-Path $Icon)) {
  python (Join-Path $AppDir "scripts\build-icon.py")
}

$shell = New-Object -ComObject WScript.Shell
$shortcut = $shell.CreateShortcut($ShortcutPath)
$shortcut.TargetPath = $TargetPath
$shortcut.Arguments = $Arguments
$shortcut.WorkingDirectory = $WorkingDirectory
$shortcut.IconLocation = "$Icon,0"
$shortcut.Description = "PNL Calendar"
$shortcut.WindowStyle = 1
$shortcut.Save()

Write-Host "Shortcut created: $ShortcutPath"
