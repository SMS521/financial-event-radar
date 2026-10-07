@echo off
powershell -NoProfile -Command "Unregister-ScheduledTask -TaskName 'AgentCompany Night' -Confirm:$false -ErrorAction SilentlyContinue; Unregister-ScheduledTask -TaskName 'AgentCompany Day' -Confirm:$false -ErrorAction SilentlyContinue; 'Scheduled tasks removed.'"
pause
