@echo off
REM Internal helper - use "Radar LIVE.vbs" or "Radar NIGHT REPORT.vbs" instead.
REM Finds Python; if none, downloads portable Python into .\python (no install, no admin).
setlocal
cd /d "%~dp0"
set "PY="
if exist "python\pythonw.exe" set "PY=python\pythonw.exe"
if not defined PY (
  powershell -NoProfile -WindowStyle Hidden -Command ^
   "$ProgressPreference='SilentlyContinue';" ^
   "Invoke-WebRequest 'https://www.python.org/ftp/python/3.12.7/python-3.12.7-embed-amd64.zip' -OutFile 'py.zip' -UseBasicParsing;" ^
   "Expand-Archive 'py.zip' -DestinationPath 'python' -Force; Remove-Item 'py.zip'" > logs_setup.txt 2>&1
  if exist "python\pythonw.exe" set "PY=python\pythonw.exe"
)
if not defined PY (
  echo Could not find or download Python. See logs_setup.txt and README.md > "reports\ERROR.txt"
  start "" notepad "reports\ERROR.txt"
  exit /b 1
)
"%PY%" radar\radar.py %* > logs_last_run.txt 2>&1
