@echo off
title PC Cloud Local Agent
echo Starting PC Cloud Agent...
cd /d "%~dp0"
node local_agent.js
pause
