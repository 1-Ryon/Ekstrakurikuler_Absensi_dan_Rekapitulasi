#!/bin/bash
# ==============================================================================
# Script Pemasangan Cloudflare Zero Trust Tunnel pada Linux VPS (Ubuntu/Debian)
# SMK AL AMANAH KOTA TANGERANG SELATAN
# ==============================================================================

set -e

echo "🚀 [1/4] Mengunduh paket resmi cloudflared..."
sudo mkdir -p --mode=0755 /usr/share/keyrings
curl -fsSL https://pkg.cloudflare.com/cloudflare-main.gpg | sudo tee /usr/share/keyrings/cloudflare-main.gpg >/dev/null
echo "deb [signed-by=/usr/share/keyrings/cloudflare-main.gpg] https://pkg.cloudflare.com/cloudflared $(lsb_release -cs) main" | sudo tee /etc/apt/sources.list.d/cloudflared.list

sudo apt-get update && sudo apt-get install -y cloudflared

echo ""
echo "🔑 [2/4] Pasang Token Zero Trust Anda"
read -p "Masukkan Cloudflare Tunnel Token Anda: " TUNNEL_TOKEN

if [ -z "$TUNNEL_TOKEN" ]; then
    echo "❌ Token tidak boleh kosong. Jalankan ulang script."
    exit 1
fi

echo "⚙️ [3/4] Mendaftarkan cloudflared sebagai system service (otomatis hidup saat reboot)..."
sudo cloudflared service install $TUNNEL_TOKEN

echo "✅ [4/4] Menyalakan service cloudflared..."
sudo systemctl enable cloudflared
sudo systemctl restart cloudflared

echo ""
echo "=============================================================================="
echo "🎉 Cloudflare Zero Trust Tunnel BERHASIL AKTIF DI VPS!"
echo "Status Service:"
sudo systemctl status cloudflared --no-pager
echo "=============================================================================="
