#!/bin/bash
# ==============================================================================
# Script Pembaruan Otomatis Aplikasi PKM SMK Al Amanah
# Jalankan script ini setiap kali Anda selesai push update dari laptop lain
# ==============================================================================

set -e

APP_DIR="/home/coding/PKM"

echo "🚀 [1/4] Berpindah ke direktori proyek: $APP_DIR"
cd "$APP_DIR"

echo "📥 [2/4] Mengambil pembaruan terbaru dari GitHub..."
git pull origin main

echo "🔨 [3/4] Melakukan build ulang bundle frontend produksi..."
npm run build:frontend

echo "🔄 [4/4] Merestart service aplikasi (pkm.service)..."
sudo systemctl restart pkm.service

echo ""
echo "✅ Pembaruan selesai! Service telah direstart."
sudo systemctl status pkm.service --no-pager
