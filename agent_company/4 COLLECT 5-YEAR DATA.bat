@echo off
title Collect
echo ============================================================
echo  Step 4: download 6 years of daily prices + currencies into data\market.db (5-15 min first time)
echo ============================================================
call "%~dp0launchers\_run.bat" collect

pause
