@echo off
title Night run
echo ============================================================
echo  Step 7: the full nightly pipeline by hand: data, research, quant, risk, report, email
echo ============================================================
call "%~dp0launchers\_run.bat" night

pause
