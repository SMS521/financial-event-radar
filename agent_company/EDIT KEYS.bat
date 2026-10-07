@echo off
if not exist "%~dp0secrets\keys.txt" copy "%~dp0secrets\keys.example.txt" "%~dp0secrets\keys.txt" >nul
start "" notepad "%~dp0secrets\keys.txt"
