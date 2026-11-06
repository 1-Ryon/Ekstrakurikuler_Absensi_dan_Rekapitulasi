@echo off
title SMK Al Amanah - Fullstack Server (Backend & Frontend)
color 0A

echo ==============================================================================
echo    SMK AL AMANAH - SISTEM PRESENSI & PENILAIAN EKSTRAKURIKULER
echo ==============================================================================
echo [INFO] Menjalankan Backend (Port 5000) dan Frontend (Port 3000) sekaligus...
echo [INFO] Akses Lokal: http://localhost:3000
echo ==============================================================================
echo.

cd /d "%~dp0"
npm run dev
pause
