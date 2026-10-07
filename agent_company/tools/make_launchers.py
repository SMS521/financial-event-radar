import os
W = lambda p, s: open(p, "w", newline="\r\n").write(s.strip("\n") + "\n")
W("launchers/_run.bat", r'''
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
''')
def step(fname, title, line, cmd, extra=""):
    W(fname, f'''
@echo off
title {title}
echo ============================================================
echo  {line}
echo ============================================================
{cmd}
{extra}
pause
''')
R = 'call "%~dp0launchers\\_run.bat"'
step("1 SETUP + SELF-TEST.bat", "Setup", "Step 1: portable Python + offline self-tests (1-2 minutes)", f"{R} selftest",
     'if not exist "%~dp0secrets\\keys.txt" copy "%~dp0secrets\\keys.example.txt" "%~dp0secrets\\keys.txt" >nul\necho.\necho Next: double-click "2 DEMO - whole company offline.bat"')
step("2 DEMO - whole company offline.bat", "Demo", "Step 2: all 20 agents on SIMULATED data - proves everything works, no internet needed", f"{R} demo")
step("3 PROBE - which websites and keys work.bat", "Probe", "Step 3: read-only test of data sites, eToro keys and Anthropic key. Never trades.", f"{R} probe")
step("4 COLLECT 5-YEAR DATA.bat", "Collect", "Step 4: download 6 years of daily prices + currencies into data\\market.db (5-15 min first time)", f"{R} collect")
step("5 BACKTEST - quant lab.bat", "Backtest", "Step 5: pattern finder + 5 strategy families on your data + Devil's Advocate verdicts", f"{R} backtest")
step("6 RESEARCH - news and analysts.bat", "Research", "Step 6: research desk on your positions - AI if key set, rules otherwise", f"{R} research")
step("7 NIGHT RUN - everything.bat", "Night run", "Step 7: the full nightly pipeline by hand: data, research, quant, risk, report, email", f"{R} night")
step("8 PAPER TRADE - one session.bat", "Paper trade", "Step 8: one paper-trading session - eToro DEMO if keys set, else local ledger", f"{R} day")
step("STATUS - what is in the database.bat", "Status", "Database contents", f"{R} status")
W("EDIT KEYS.bat", r'''
@echo off
if not exist "%~dp0secrets\keys.txt" copy "%~dp0secrets\keys.example.txt" "%~dp0secrets\keys.txt" >nul
start "" notepad "%~dp0secrets\keys.txt"
''')
W("OPEN DASHBOARD.bat", r'''
@echo off
if exist "%~dp0reports\dashboard.html" (start "" "%~dp0reports\dashboard.html") else (echo No dashboard yet - run step 2 first. & pause)
''')
W("STOP TRADING (kill switch).bat", r'''
@echo off
echo Paper trading stopped by %USERNAME% on %DATE% %TIME% > "%~dp0STOP_TRADING.txt"
echo KILL SWITCH ON: the Paper Trader places no order until you delete STOP_TRADING.txt
pause
''')
W("9 SCHEDULE ON (nightly + daily).bat", r'''
@echo off
title Schedule on
echo Creating 2 Windows scheduled tasks for YOUR user (no admin needed):
echo   AgentCompany Night - every day 22:30   (data, research, quant, risk, report, email)
echo   AgentCompany Day   - Mon-Fri 15:45     (paper-trading session, US + EU markets open)
echo They run hidden. If the PC is off/asleep then, they run as soon as it is back on.
set "VBS=%~dp0launchers\hidden.vbs"
powershell -NoProfile -Command ^
 "$s = New-ScheduledTaskSettingsSet -StartWhenAvailable -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -ExecutionTimeLimit (New-TimeSpan -Hours 6);" ^
 "$a1 = New-ScheduledTaskAction -Execute 'wscript.exe' -Argument ('\"' + $env:VBS + '\" night');" ^
 "$a2 = New-ScheduledTaskAction -Execute 'wscript.exe' -Argument ('\"' + $env:VBS + '\" day');" ^
 "Register-ScheduledTask -TaskName 'AgentCompany Night' -Action $a1 -Trigger (New-ScheduledTaskTrigger -Daily -At 22:30) -Settings $s -Force | Out-Null;" ^
 "Register-ScheduledTask -TaskName 'AgentCompany Day' -Action $a2 -Trigger (New-ScheduledTaskTrigger -Weekly -DaysOfWeek Monday,Tuesday,Wednesday,Thursday,Friday -At 15:45) -Settings $s -Force | Out-Null;" ^
 "Get-ScheduledTask -TaskName 'AgentCompany*' | Format-Table TaskName,State -AutoSize"
echo Done. Change times in Windows "Task Scheduler" if you like. Undo with "9 SCHEDULE OFF.bat".
pause
''')
W("9 SCHEDULE OFF.bat", r'''
@echo off
powershell -NoProfile -Command "Unregister-ScheduledTask -TaskName 'AgentCompany Night' -Confirm:$false -ErrorAction SilentlyContinue; Unregister-ScheduledTask -TaskName 'AgentCompany Day' -Confirm:$false -ErrorAction SilentlyContinue; 'Scheduled tasks removed.'"
pause
''')
W("launchers/hidden.vbs", r'''
' Runs a company command with no window (used by the scheduled tasks).
Set sh = CreateObject("WScript.Shell")
here = CreateObject("Scripting.FileSystemObject").GetParentFolderName(WScript.ScriptFullName)
sh.Run "cmd /c """ & here & "\_run.bat"" " & WScript.Arguments(0) & " --quiet", 0, False
''')
