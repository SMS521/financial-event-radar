' Double-click: opens the report prepared by the nightly cloud run (instant).
Set sh = CreateObject("WScript.Shell")
here = CreateObject("Scripting.FileSystemObject").GetParentFolderName(WScript.ScriptFullName)
sh.Run "cmd /c """ & here & "\_engine.bat"" --cloud", 0, False
