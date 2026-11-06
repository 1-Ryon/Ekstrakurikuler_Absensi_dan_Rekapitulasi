@echo off
title SMK Al Amanah - Cloudflare Zero Trust Tunnel
color 0A

echo ==============================================================================
echo    CLOUDFLARE ZERO TRUST TUNNEL - SMK AL AMANAH KOTA TANGERANG SELATAN
echo ==============================================================================
echo.

set DEFAULT_TOKEN=eyJhIjoiN2NhNzRlMzI5YmQyYzRlMjU1OTJlNTQ2ZjE5MjNjNzgiLCJ0IjoiOTJmOTg3ZGItNjQ2YS00NDA4LWI3NjItZDM1MmJjZjhhNTI2IiwicyI6Ik9XTXlaV05sTXprdE9HSXdOeTAwTUdJM0xXSTNZVGN0TmprM09HTTRaRFEzT0RkaCJ9

:: Cek apakah user memasukkan token sebagai argumen
if not "%~1"=="" (
    set TUNNEL_TOKEN=%~1
    goto run_token
)

:prompt_token
echo Pilih metode koneksi Cloudflare Tunnel:
echo [1] Token Zero Trust Resmi (absensieskulsmkalamanah.arionoputra.net) [Default]
echo [2] Quick Tunnel Sementara (Domain otomatis trycloudflare.com untuk uji coba)
echo [3] Gunakan File config.yml
echo.
set /p choice="Pilihan Anda (1/2/3, default [1]): "

if "%choice%"=="" set choice=1
if "%choice%"=="1" (
    echo.
    echo Masukkan Token Cloudflare (Tekan ENTER langsung untuk memakai token resmi):
    set /p TUNNEL_TOKEN=""
    if "%TUNNEL_TOKEN%"=="" set TUNNEL_TOKEN=%DEFAULT_TOKEN%
    goto run_token
)
if "%choice%"=="2" (
    goto run_quick
)
if "%choice%"=="3" (
    goto run_config
)
goto prompt_token

:run_token
echo.
echo [INFO] Menghubungkan Tunnel Zero Trust resmi SMK Al Amanah...
echo [INFO] Domain Publik: https://absensieskulsmkalamanah.arionoputra.net
netstat -ano | findstr /R ":3000 " >nul
if %errorlevel% neq 0 (
    echo [PERINGATAN] Port 3000 (Frontend) belum aktif!
    echo Pastikan Frontend sudah berjalan ('npm run dev') agar domain tidak menghasilkan 502 Bad Gateway.
    echo.
)
cloudflared tunnel --edge-ip-version 4 run --token %TUNNEL_TOKEN%
pause
exit /b

:run_quick
echo.
echo [INFO] Menyalakan Quick Tunnel sementara...
echo [INFO] Tautan HTTPS publik trycloudflare.com akan muncul di bawah ini dalam beberapa detik:
netstat -ano | findstr /R ":3000 " >nul
if %errorlevel% neq 0 (
    echo [PERINGATAN] Port 3000 (Frontend) belum aktif!
    echo Pastikan Frontend sudah berjalan ('npm run dev') agar domain tidak menghasilkan 502 Bad Gateway.
    echo.
)
cloudflared tunnel --edge-ip-version 4 --url http://localhost:3000
pause
exit /b

:run_config
echo.
echo [INFO] Menjalankan tunnel dengan file cloudflared/config.yml...
netstat -ano | findstr /R ":3000 " >nul
if %errorlevel% neq 0 (
    echo [PERINGATAN] Port 3000 (Frontend) belum aktif!
    echo Pastikan Frontend sudah berjalan ('npm run dev') agar domain tidak menghasilkan 502 Bad Gateway.
    echo.
)
cloudflared tunnel --edge-ip-version 4 --config "%~dp0config.yml" run
pause
exit /b
