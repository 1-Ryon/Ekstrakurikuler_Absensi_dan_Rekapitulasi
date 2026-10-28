@echo off
title SMK Al Amanah - Cloudflare Zero Trust Tunnel
color 0A

echo ==============================================================================
echo    CLOUDFLARE ZERO TRUST TUNNEL - SMK AL AMANAH KOTA TANGERANG SELATAN
echo ==============================================================================
echo.

:: Cek apakah user memasukkan token sebagai argumen
if "%~1"=="" goto prompt_token
set TUNNEL_TOKEN=%~1
goto run_token

:prompt_token
echo Pilih metode koneksi Cloudflare Tunnel:
echo [1] Gunakan Token Zero Trust (Paling Mudah - Disarankan)
echo [2] Quick Tunnel Sementara (Domain otomatis trycloudflare.com untuk uji coba)
echo [3] Gunakan File config.yml
echo.
set /p choice="Pilihan Anda (1/2/3): "

if "%choice%"=="1" (
    echo.
    set /p TUNNEL_TOKEN="Masukkan Cloudflare Tunnel Token Anda: "
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
echo [INFO] Menghubungkan Tunnel Zero Trust dengan Token resmi...
echo [INFO] Target port lokal: http://localhost:5000 (Backend + Frontend)
cloudflared tunnel run --token %TUNNEL_TOKEN%
pause
exit /b

:run_quick
echo.
echo [INFO] Menyalakan Quick Tunnel sementara...
echo [INFO] Tautan HTTPS publik akan muncul di bawah ini dalam beberapa detik:
cloudflared tunnel --url http://localhost:5000
pause
exit /b

:run_config
echo.
echo [INFO] Menjalankan tunnel dengan file cloudflared/config.yml...
cloudflared tunnel --config "%~dp0config.yml" run
pause
exit /b
