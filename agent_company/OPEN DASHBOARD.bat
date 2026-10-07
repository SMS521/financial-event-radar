@echo off
if exist "%~dp0reports\dashboard.html" (start "" "%~dp0reports\dashboard.html") else (echo No dashboard yet - run step 2 first. & pause)
