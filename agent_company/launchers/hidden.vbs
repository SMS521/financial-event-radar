' Runs a company command with no window (used by the scheduled tasks).
Set sh = CreateObject("WScript.Shell")
here = CreateObject("Scripting.FileSystemObject").GetParentFolderName(WScript.ScriptFullName)
sh.Run "cmd /c """ & here & "\_run.bat"" " & WScript.Arguments(0) & " --quiet", 0, False
