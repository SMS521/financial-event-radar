@echo off
REM Internal helper used by the numbered files. Usage: _run.bat <command> [--quiet]
setlocal
chcp 65001 >nul
set "ROOT=%~dp0.."
cd /d "%ROOT%"
if not exist "logs" mkdir logs
set "PY=%ROOT%\python\python.exe"
if exist "%PY%" goto run

echo [setup] Portable Python not found - downloading it into this folder (no install, no admin)...
powershell -NoProfile -Command ^
  "$ProgressPreference='SilentlyContinue'; [Net.ServicePointManager]::SecurityProtocol='Tls12'; [Net.WebRequest]::DefaultWebProxy.Credentials=[Net.CredentialCache]::DefaultNetworkCredentials;" ^
  "try { Invoke-WebRequest 'https://www.python.org/ftp/python/3.12.7/python-3.12.7-embed-amd64.zip' -OutFile 'py.zip' -UseBasicParsing; Expand-Archive 'py.zip' 'python' -Force; Remove-Item 'py.zip'; 'ok: python.org' }" ^
  "catch { 'python.org blocked, trying nuget.org...'; Invoke-WebRequest 'https://api.nuget.org/v3-flatcontainer/python/3.12.7/python.3.12.7.nupkg' -OutFile 'py.zip' -UseBasicParsing; Expand-Archive 'py.zip' 'pytmp' -Force; Move-Item 'pytmp\tools' 'python'; Remove-Item 'pytmp' -Recurse -Force; Remove-Item 'py.zip'; 'ok: nuget.org' }" > logs\setup.txt 2>&1
type logs\setup.txt
if not exist "%PY%" (
  echo.
  echo [setup] FAILED: could not download Python - python.org and nuget.org both blocked.
  echo         Fix: run "1 SETUP" once on a home PC, then copy the "python" folder into this folder.
  exit /b 1
)
REM let the embedded Python see this project folder (it ignores the current directory by default)
for %%f in ("%ROOT%\python\python3*._pth") do (
  findstr /x /c:".." "%%f" >nul || (echo.& echo ..)>> "%%f"
)

:run
REM output shows live here and is also appended to reports\company.log by the agents
"%PY%" -X utf8 -m company.cli %*
exit /b %ERRORLEVEL%
