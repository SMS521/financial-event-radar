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
