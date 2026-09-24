import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database SMK Al Amanah...');

  // 1. Bersihkan data lama
  await prisma.presensi.deleteMany({});
  await prisma.penilaian.deleteMany({});
  await prisma.sesiPertemuan.deleteMany({});
  await prisma.anggotaEskul.deleteMany({});
  await prisma.eskul.deleteMany({});
  await prisma.user.deleteMany({});

  // 2. Buat Admin & Koordinator
  const admin = await prisma.user.create({
    data: {
      id: 'user-01',
      username: 'viska.adawiyah',
      namaLengkap: 'Viska Adawiyah Zulkarnaen, S.Pd.',
      nomorInduk: '19890412 201402 2 003',
      role: 'ADMIN',
      avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=160&auto=format&fit=crop&q=80',
      spesialisasi: 'Koordinator Ekstrakurikuler',
      statusAktif: true,
    }
  });

  // 3. Buat Pembina Eskul
  const pembinas = [
    {
      id: 'pem-01',
      username: 'abdul.jabbar',
      namaLengkap: 'Abdul Jabbar, S.Kom., M.Kom.',
      nomorInduk: '19850210 201101 1 007',
      role: 'PEMBINA',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=160&auto=format&fit=crop&q=80',
      spesialisasi: 'Guru Eskul Computer Club',
    },
    {
      id: 'pem-02',
      username: 'rahman.lc',
      namaLengkap: 'Rahman, Lc.',
      nomorInduk: '19881105 201503 1 002',
      role: 'PEMBINA',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=160&auto=format&fit=crop&q=80',
      spesialisasi: 'Guru Eskul Hadroh',
    },
    {
      id: 'pem-03',
      username: 'miftah.farid',
      namaLengkap: 'Miftah Farid, S.Pd.I.',
      nomorInduk: '19900824 201704 1 005',
      role: 'PEMBINA',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=160&auto=format&fit=crop&q=80',
      spesialisasi: 'Guru Eskul Tilawah',
    },
    {
      id: 'pem-04',
      username: 'ahmad.futsal',
      namaLengkap: 'Ahmad Syafii, S.Pd.',
      nomorInduk: '19910515 201802 1 004',
      role: 'PEMBINA',
      avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=160&auto=format&fit=crop&q=80',
      spesialisasi: 'Guru Eskul Futsal',
    },
    {
      id: 'pem-05',
      username: 'dina.it',
      namaLengkap: 'Dina Marlina, M.T.',
      nomorInduk: '19870321 201301 2 006',
      role: 'PEMBINA',
      avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=160&auto=format&fit=crop&q=80',
      spesialisasi: 'Guru Eskul IT Club',
    },
    {
      id: 'pem-06',
      username: 'budi.paskibra',
      namaLengkap: 'Budi Santoso, S.Pd.',
      nomorInduk: '19840112 200902 1 001',
      role: 'PEMBINA',
      avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=160&auto=format&fit=crop&q=80',
      spesialisasi: 'Guru Eskul Paskibra',
    },
  ];

  for (const p of pembinas) {
    await prisma.user.create({ data: p });
  }

  // 4. Buat Siswa
  const students = [
    {
      id: 'sis-01',
      username: 'muhammad.rizky',
      namaLengkap: 'Muhammad Rizky Pratama',
      nomorInduk: '0061928374',
      role: 'SISWA',
      avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=160&auto=format&fit=crop&q=80',
      kelas: 'XII RPL 1',
    },
    {
      id: 'sis-02',
      username: 'aisyah.zahra',
      namaLengkap: 'Aisyah Putri Azzahra',
      nomorInduk: '0062839102',
      role: 'SISWA',
      avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=160&auto=format&fit=crop&q=80',
      kelas: 'XI TKJ 2',
    },
    {
      id: 'sis-03',
      username: 'fadhil.akbar',
      namaLengkap: 'Fadhil Akbar Hidayat',
      nomorInduk: '0073948192',
      role: 'SISWA',
      avatarUrl: 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=160&auto=format&fit=crop&q=80',
      kelas: 'X AKL 1',
    },
    {
      id: 'sis-04',
      username: 'nabilah.syifa',
      namaLengkap: 'Nabilah Syifa Ramadhani',
      nomorInduk: '0064829103',
      role: 'SISWA',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=160&auto=format&fit=crop&q=80',
      kelas: 'XI OTKP 1',
    },
    {
      id: 'sis-05',
      username: 'bagas.wicaksono',
      namaLengkap: 'Bagas Dwi Wicaksono',
      nomorInduk: '0059283741',
      role: 'SISWA',
      avatarUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=160&auto=format&fit=crop&q=80',
      kelas: 'XII BDP 2',
    },
  ];

  for (const s of students) {
    await prisma.user.create({ data: s });
  }

  // 5. Buat 12 Eskul SMK Al Amanah
  const eskulData = [
    {
      id: 'eskul-01',
      namaEskul: 'Eskul Futsal',
      pembinaId: 'pem-04',
      jadwalHari: 'Kamis',
      jamMulai: '15:30',
      jamSelesai: '17:30',
      lokasi: 'Lapangan Olahraga Utama',
      kuota: 45,
      kategori: 'Olahraga',
      deskripsi: 'Pelatihan teknik sepak bola mini, taktik tim, dan turnamen antar SMK.',
    },
    {
      id: 'eskul-02',
      namaEskul: 'Eskul IT Club',
      pembinaId: 'pem-05',
      jadwalHari: 'Kamis',
      jamMulai: '15:30',
      jamSelesai: '17:00',
      lokasi: 'Lab Komputer RPL 1',
      kuota: 40,
      kategori: 'Teknologi',
      deskripsi: 'Pengembangan web, mobile app, algoritma kompetisi, dan IoT.',
    },
    {
      id: 'eskul-03',
      namaEskul: 'Eskul Paskibra',
      pembinaId: 'pem-06',
      jadwalHari: 'Kamis',
      jamMulai: '14:00',
      jamSelesai: '16:00',
      lokasi: 'Plaza Upacara SMK Al Amanah',
      kuota: 35,
      kategori: 'Kepemimpinan',
      deskripsi: 'Pelatihan baris-berbaris formal, kedisiplinan, dan pengibaran bendera.',
    },
    {
      id: 'eskul-04',
      namaEskul: 'Computer Club',
      pembinaId: 'pem-01',
      jadwalHari: 'Jumat',
      jamMulai: '13:30',
      jamSelesai: '15:30',
      lokasi: 'Lab Multimedia 2',
      kuota: 40,
      kategori: 'Teknologi',
      deskripsi: 'Desain grafis, 3D modelling, editing video, dan perakitan PC.',
    },
    {
      id: 'eskul-05',
      namaEskul: 'Eskul Hadroh',
      pembinaId: 'pem-02',
      jadwalHari: 'Jumat',
      jamMulai: '15:30',
      jamSelesai: '17:00',
      lokasi: 'Masjid Al-Amanah Lantai 2',
      kuota: 30,
      kategori: 'Seni & Budaya',
      deskripsi: 'Kesenian musik rebana islami, vokal sholawat banjari, dan variasi tabuhan.',
    },
    {
      id: 'eskul-06',
      namaEskul: 'Eskul Tilawah',
      pembinaId: 'pem-03',
      jadwalHari: 'Sabtu',
      jamMulai: '08:00',
      jamSelesai: '10:00',
      lokasi: 'Ruang Aula Mini',
      kuota: 25,
      kategori: 'Keagamaan',
      deskripsi: 'Seni baca Al-Quran naghom, tartil tajwid makharijul huruf, dan MTQ.',
    },
    {
      id: 'eskul-07',
      namaEskul: 'Pramuka Garuda',
      pembinaId: 'pem-06',
      jadwalHari: 'Kamis',
      jamMulai: '15:00',
      jamSelesai: '17:00',
      lokasi: 'Halaman Barat',
      kuota: 60,
      kategori: 'Kepemimpinan',
      deskripsi: 'Pendidikan kepanduan penegak, tali temali, navigasi darat, dan survival.',
    },
    {
      id: 'eskul-08',
      namaEskul: 'Rohis (Kerohanian Islam)',
      pembinaId: 'pem-02',
      jadwalHari: 'Kamis',
      jamMulai: '15:30',
      jamSelesai: '17:00',
      lokasi: 'Masjid Utama Al Amanah',
      kuota: 50,
      kategori: 'Keagamaan',
      deskripsi: 'Kajian akhlak mulia, kepemimpinan dakwah sekolah, dan mentoring sebaya.',
    },
    {
      id: 'eskul-09',
      namaEskul: 'Basket Ball',
      pembinaId: 'pem-04',
      jadwalHari: 'Selasa',
      jamMulai: '15:30',
      jamSelesai: '17:30',
      lokasi: 'Lapangan Basket Outdoor',
      kuota: 35,
      kategori: 'Olahraga',
      deskripsi: 'Dribbling, shooting, fast-break, dan persiapan turnamen.',
    },
    {
      id: 'eskul-10',
      namaEskul: 'PMR (Palang Merah Remaja)',
      pembinaId: 'pem-01',
      jadwalHari: 'Rabu',
      jamMulai: '15:30',
      jamSelesai: '17:00',
      lokasi: 'Ruang UKS Terpadu',
      kuota: 35,
      kategori: 'Kepemimpinan',
      deskripsi: 'Pertolongan pertama (PP), evakuasi bencana, dan donor darah sekolah.',
    },
    {
      id: 'eskul-11',
      namaEskul: 'English Club & Debating',
      pembinaId: 'pem-05',
      jadwalHari: 'Rabu',
      jamMulai: '15:30',
      jamSelesai: '17:00',
      lokasi: 'Lab Bahasa Inggris',
      kuota: 30,
      kategori: 'Teknologi',
      deskripsi: 'Public speaking, parliamentary debating, dan storytelling.',
    },
    {
      id: 'eskul-12',
      namaEskul: 'Seni Tari Tradisional',
      pembinaId: 'pem-03',
      jadwalHari: 'Senin',
      jamMulai: '15:30',
      jamSelesai: '17:00',
      lokasi: 'Sanggar Seni Budaya',
      kuota: 30,
      kategori: 'Seni & Budaya',
      deskripsi: 'Pelestarian tari saman, jaipong, dan tari kreasi nusantara.',
    },
  ];

  for (const e of eskulData) {
    await prisma.eskul.create({ data: e });
  }

  // 6. Hubungkan Siswa ke Eskul (AnggotaEskul)
  await prisma.anggotaEskul.createMany({
    data: [
      { eskulId: 'eskul-01', siswaId: 'sis-01' },
      { eskulId: 'eskul-02', siswaId: 'sis-01' },
      { eskulId: 'eskul-04', siswaId: 'sis-02' },
      { eskulId: 'eskul-08', siswaId: 'sis-02' },
      { eskulId: 'eskul-03', siswaId: 'sis-03' },
      { eskulId: 'eskul-01', siswaId: 'sis-03' },
      { eskulId: 'eskul-05', siswaId: 'sis-04' },
      { eskulId: 'eskul-06', siswaId: 'sis-04' },
      { eskulId: 'eskul-07', siswaId: 'sis-05' },
    ]
  });

  // 7. Sesi Pertemuan Hari Ini
  const todayStr = '2026-09-24';
  const sesiFutsal = await prisma.sesiPertemuan.create({
    data: {
      id: 'sesi-01',
      eskulId: 'eskul-01',
      tanggal: todayStr,
      jamMulai: '15:30',
      jamSelesai: '17:30',
      lokasi: 'Lapangan Olahraga Utama',
      tokenAktif: 'SMK-AMANAH:sesi-01:ACTIVE-TOKEN',
      tokenExpiresAt: new Date(Date.now() + 15000),
      status: 'BERLANGSUNG',
    }
  });

  await prisma.sesiPertemuan.create({
    data: {
      id: 'sesi-02',
      eskulId: 'eskul-02',
      tanggal: todayStr,
      jamMulai: '15:30',
      jamSelesai: '17:00',
      lokasi: 'Lab Komputer RPL 1',
      tokenAktif: 'SMK-AMANAH:sesi-02:STANDBY-TOKEN',
      tokenExpiresAt: new Date(Date.now() + 15000),
      status: 'BELUM_DIMULAI',
    }
  });

  await prisma.sesiPertemuan.create({
    data: {
      id: 'sesi-03',
      eskulId: 'eskul-03',
      tanggal: todayStr,
      jamMulai: '14:00',
      jamSelesai: '16:00',
      lokasi: 'Plaza Upacara SMK Al Amanah',
      tokenAktif: 'EXPIRED',
      tokenExpiresAt: new Date(Date.now() - 3600000),
      status: 'SELESAI',
    }
  });

  // 8. Presensi Awal
  await prisma.presensi.createMany({
    data: [
      {
        sesiId: 'sesi-01',
        siswaId: 'sis-01',
        status: 'HADIR',
        metode: 'DYNAMIC_QR',
        deviceInfo: 'Samsung SM-A536E (TOTP Valid)',
      },
      {
        sesiId: 'sesi-01',
        siswaId: 'sis-03',
        status: 'HADIR',
        metode: 'DYNAMIC_QR',
        deviceInfo: 'Xiaomi Redmi Note 11 (TOTP Valid)',
      },
      {
        sesiId: 'sesi-01',
        siswaId: 'sis-05',
        status: 'HADIR',
        metode: 'DYNAMIC_QR',
        deviceInfo: 'Infinix Hot 12 Play (TOTP Valid)',
      }
    ]
  });

  // 9. Penilaian Awal Rapor
  await prisma.penilaian.createMany({
    data: [
      {
        eskulId: 'eskul-01',
        siswaId: 'sis-01',
        semester: 1,
        tahunAjaran: '2026/2027',
        nilaiKehadiran: 95.0,
        nilaiKeaktifan: 90.0,
        nilaiKinerja: 92.0,
        nilaiAkhir: 92.6,
        predikat: 'A',
        catatan: 'Menunjukkan kepemimpinan lapangan yang luar biasa sebagai kapten tim dan disiplin presensi konsisten.',
      },
      {
        eskulId: 'eskul-02',
        siswaId: 'sis-01',
        semester: 1,
        tahunAjaran: '2026/2027',
        nilaiKehadiran: 98.0,
        nilaiKeaktifan: 95.0,
        nilaiKinerja: 94.0,
        nilaiAkhir: 95.9,
        predikat: 'A',
        catatan: 'Sangat piawai dalam pemrograman frontend React dan berkontribusi besar dalam proyek pameran teknologi sekolah.',
      }
    ]
  });

  console.log('✅ Seeding database SQLite selesai.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
