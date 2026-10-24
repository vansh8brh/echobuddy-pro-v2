@echo off
title EchoBuddy Pro - Team Broxo Server
echo ========================================================
echo        ECHOBUDDY PRO - TEAM BROXO SERVER
echo ========================================================
echo Starting EchoBuddy Pro Local Server on Port 8000...
echo.
cd /d "%~dp0"
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
pause
