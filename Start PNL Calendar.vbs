Set fso = CreateObject("Scripting.FileSystemObject")
Set shell = CreateObject("WScript.Shell")
appDir = fso.GetParentFolderName(WScript.ScriptFullName)
builtExe = appDir & "\dist\win-unpacked\PNL Calendar.exe"
electron = appDir & "\node_modules\electron\dist\electron.exe"

If fso.FileExists(builtExe) Then
  shell.CurrentDirectory = fso.GetParentFolderName(builtExe)
  shell.Run """" & builtExe & """", 0, False
ElseIf fso.FileExists(electron) Then
  shell.CurrentDirectory = appDir
  shell.Run """" & electron & """ """ & appDir & """", 0, False
Else
  MsgBox "PNL Calendar not found. Run npm run pack or npm install in the project folder.", vbCritical, "PNL Calendar"
End If
