' Double-click: runs all checks NOW in the background (no window), then opens the dashboard.
Set sh = CreateObject("WScript.Shell")
here = CreateObject("Scripting.FileSystemObject").GetParentFolderName(WScript.ScriptFullName)
sh.Run "cmd /c """ & here & "\_engine.bat""", 0, False
