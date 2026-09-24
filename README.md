# Sistem Informasi Presensi Dynamic QR & Penilaian Ekstrakurikuler
### SMK AL AMANAH KOTA TANGERANG SELATAN

Platform terpadu untuk digitalisasi kegiatan ekstrakurikuler sekolah dengan mekanisme **Dynamic QR Code (rotasi 15 detik)** guna mencegah titip absen/kecurangan, pencatatan kehadiran instan, dan penilaian akhir semester berstandar e-Rapor Kurikulum Merdeka.

---

## 📁 Struktur Pemisahan Folder (Frontend & Backend Terpisah)

Proyek ini telah dipisahkan secara rapi menjadi 2 folder mandiri:

```
Absensi_PKM/
│
├── 📂 backend/                  # 🚀 BACKEND SERVICE (Node.js + Express.js + Prisma ORM)
│   ├── prisma/
│   │   ├── schema.prisma       # Skema Relasi Database PRD (SQLite / PostgreSQL)
│   │   ├── seed.js             # Data awal 12 eskul, guru, siswa, sesi, & nilai
│   │   └── dev.db              # Database SQLite lokal (Zero-config)
│   ├── src/
│   │   └── server.js           # REST API: QR TOTP 15s, Presensi, Import, Penilaian
│   ├── .env                    # Port 5000 & JWT Secret
│   └── package.json            # Dependensi backend
│
├── 📂 frontend/                 # 💻 FRONTEND WEB (React.js + TypeScript + Vite + Tailwind)
│   ├── src/
│   │   ├── components/
│   │   │   ├── dashboard/      # Beranda Utama, Eskul, Siswa, Laporan, Pengaturan
│   │   │   ├── guru/           # Dynamic QR Generator 15s, Live Attendance Log, Penilaian
│   │   │   ├── siswa/          # Dashboard Siswa, Camera Laser Scanner, KHN Digital
│   │   │   ├── modals/         # Tambah Eskul, Import Excel/CSV, Notifikasi, Mail
│   │   │   ├── Header.tsx      # Top bar, profil foto guru, role switcher
│   │   │   ├── Sidebar.tsx     # Navigasi MENU & UMUM sesuai gambar desain
│   │   │   └── SchoolLogo.tsx  # Emblem resmi SMK Al Amanah Tangsel
│   │   ├── services/
│   │   │   └── api.ts          # Client API penghubung ke backend http://localhost:5000/api
│   │   ├── types/              # TypeScript interface data model
│   │   └── App.tsx             # Router & Master State
│   ├── index.html              # Entry HTML & Google Font (Plus Jakarta Sans)
│   ├── vite.config.ts          # Konfigurasi Vite
│   ├── tailwind.config.js      # Konfigurasi Tema Warna Hijau Emerald SMK Al Amanah
│   └── package.json            # Dependensi frontend
│
├── package.json                 # Master Workspace Orchestrator (1 Perintah Jalankan Keduanya)
└── README.md                    # Dokumentasi lengkap
```

---

## ⚡ Cara Menjalankan Aplikasi

Aplikasi ini **SUDAH BISA DIJALANKAN DETIK INI JUGA**. Anda memiliki 2 pilihan cara menjalankannya:

### Pilihan A: Sekali Perintah dari Folder Utama (Paling Praktis)
Buka terminal di folder `c:\Coding\Absensi_PKM` lalu ketik:
```bash
npm run dev
```
Perintah ini otomatis menyalakan **Backend** dan **Frontend** secara bersamaan!

---

### Pilihan B: Menjalankan di 2 Terminal Terpisah

#### 1. Terminal 1 - Menjalankan Backend (Server Port 5000):
```bash
cd backend
npm run dev
```
> Server API aktif di: **`http://localhost:5000`**

#### 2. Terminal 2 - Menjalankan Frontend (Client Web Port 5173):
```bash
cd frontend
npm run dev
```
> Buka browser di: **`http://localhost:5173`**

---

## 🗄️ Database Visual (Prisma Studio)
Untuk melihat atau mengedit isi tabel database SQLite (`users`, `eskul`, `presensi`, `penilaian`) langsung di browser:
```bash
npm run db:studio
# atau: cd backend && npx prisma studio
```
Akses di browser: **`http://localhost:5555`**

---

## 🔄 Reset & Seed Ulang Database
Jika ingin mengembalikan data ke kondisi awal bawaan SMK Al Amanah:
```bash
npm run db:seed
# atau: cd backend && node prisma/seed.js
```
