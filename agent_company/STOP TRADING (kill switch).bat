@echo off
echo Paper trading stopped by %USERNAME% on %DATE% %TIME% > "%~dp0STOP_TRADING.txt"
echo KILL SWITCH ON: the Paper Trader places no order until you delete STOP_TRADING.txt
pause
