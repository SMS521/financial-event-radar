@echo off
title Setup
echo ============================================================
echo  Step 1: portable Python + offline self-tests (1-2 minutes)
echo ============================================================
call "%~dp0launchers\_run.bat" selftest
if not exist "%~dp0secrets\keys.txt" copy "%~dp0secrets\keys.example.txt" "%~dp0secrets\keys.txt" >nul
echo.
echo Next: double-click "2 DEMO - whole company offline.bat"
pause
