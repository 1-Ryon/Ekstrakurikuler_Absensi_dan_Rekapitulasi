import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Helper untuk formula password default siswa: al_amanah_ + 3 digit terakhir NIS
function getStudentDefaultPassword(nis) {
  const cleanNis = String(nis).trim();
  const last3 = cleanNis.slice(-3);
  return `al_amanah_${last3}`;
}

async function main() {
  console.log('🌱 [SEED] Memulai inisialisasi & normalisasi database SMK Al Amanah...');

  // 1. Bersihkan seluruh database secara terurut (menghindari foreign key constraint error)
  await prisma.presensi.deleteMany({});
  await prisma.penilaian.deleteMany({});
  await prisma.prestasiLomba.deleteMany({});
  await prisma.sesiPertemuan.deleteMany({});
  await prisma.anggotaEskul.deleteMany({});
  await prisma.eskul.deleteMany({});
  await prisma.siswa.deleteMany({});
  await prisma.kelas.deleteMany({});
  await prisma.guru.deleteMany({});
  await prisma.admin.deleteMany({});

  console.log('🧹 [SEED] Database bersih. Menginisialisasi data master terpisah (Admin, Guru, Siswa)...');

  // 2. Akun Administrator Sistem (Role: ADMIN) - Terpisah dari Koordinator & Guru
  const adminUtama = await prisma.admin.create({
    data: {
      id: 'adm-01',
      username: 'admin',
      passwordHash: 'admin123',
      namaLengkap: 'Administrator Sistem',
      nomorInduk: 'ADM-ALAMANAH-01',
      email: 'admin@smk-alamanah.sch.id',
      noHp: '081211223344',
      avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=160&auto=format&fit=crop&q=80',
      role: 'ADMIN',
      statusAktif: true,
    },
  });

  const adminIT = await prisma.admin.create({
    data: {
      id: 'adm-02',
      username: 'admin.it',
      passwordHash: 'admin123',
      namaLengkap: 'Ryon Syaputra, S.Kom.',
      nomorInduk: '19950611 202012 1 008',
      email: 'ryon@smk-alamanah.sch.id',
      noHp: '081299887766',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=160&auto=format&fit=crop&q=80',
      role: 'ADMIN',
      statusAktif: true,
    },
  });

  // 3. Akun Guru Koordinator Ekstrakurikuler (Role: KOORDINATOR)
  const guruViska = await prisma.guru.create({
    data: {
      id: 'guru-koor-01',
      username: 'koordinator',
      passwordHash: 'admin123',
      nip: '19890412 201402 2 003',
      namaLengkap: 'Viska Adawiyah Zulkarnaen, S.Pd.',
      jenisKelamin: 'P',
      noHp: '081234567890',
      email: 'viska@smk-alamanah.sch.id',
      spesialisasi: 'Koordinator Ekstrakurikuler Utama',
      avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=160&auto=format&fit=crop&q=80',
      role: 'KOORDINATOR',
      isPembina: true,
      isWaliKelas: false,
      statusAktif: true,
    },
  });

  const guruMulyadi = await prisma.guru.create({
    data: {
      id: 'guru-koor-02',
      username: 'mulyadi',
      passwordHash: 'admin123',
      nip: '19750814 200212 1 002',
      namaLengkap: 'Drs. H. Mulyadi, M.Pd.',
      jenisKelamin: 'L',
      noHp: '081298765432',
      email: 'mulyadi@smk-alamanah.sch.id',
      spesialisasi: 'Wakil Kepala Sekolah Bidang Kesiswaan',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=160&auto=format&fit=crop&q=80',
      role: 'KOORDINATOR',
      isPembina: true,
      isWaliKelas: false,
      statusAktif: true,
    },
  });

  // 4. Guru Pembina & Guru Wali Kelas (Langsung disimpan di tabel `guru`)
  const guruMasterData = [
    {
      id: 'guru-pem-04',
      username: 'ahmad.futsal',
      passwordHash: 'pembina123',
      nip: '19910515 201802 1 004',
      namaLengkap: 'Ahmad Syafii, S.Pd.',
      jenisKelamin: 'L',
      noHp: '081345678901',
      email: 'ahmad.syafii@smk-alamanah.sch.id',
      spesialisasi: 'Guru Pembina Futsal & Olahraga',
      avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=160&auto=format&fit=crop&q=80',
      isPembina: true,
      isWaliKelas: false,
      role: 'PEMBINA',
      statusAktif: true,
    },
    {
      id: 'guru-pem-01',
      username: 'abdul.jabbar',
      passwordHash: 'pembina123',
      nip: '19850210 201101 1 007',
      namaLengkap: 'Abdul Jabbar, S.Kom., M.Kom.',
      jenisKelamin: 'L',
      noHp: '081234567801',
      email: 'abdul.jabbar@smk-alamanah.sch.id',
      spesialisasi: 'Guru Pembina IT & Computer Club',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=160&auto=format&fit=crop&q=80',
      isPembina: true,
      isWaliKelas: false,
      role: 'PEMBINA',
      statusAktif: true,
    },
    {
      id: 'guru-pem-06',
      username: 'budi.paskibra',
      passwordHash: 'pembina123',
      nip: '19840112 200902 1 001',
      namaLengkap: 'Budi Santoso, S.Pd.',
      jenisKelamin: 'L',
      noHp: '081398765401',
      email: 'budi.santoso@smk-alamanah.sch.id',
      spesialisasi: 'Guru Pembina Paskibra & Kedisiplinan',
      avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=160&auto=format&fit=crop&q=80',
      isPembina: true,
      isWaliKelas: false,
      role: 'PEMBINA',
      statusAktif: true,
    },
    {
      id: 'guru-pem-02',
      username: 'rahman.lc',
      passwordHash: 'pembina123',
      nip: '19881105 201503 1 002',
      namaLengkap: 'Rahman, Lc.',
      jenisKelamin: 'L',
      noHp: '081287654301',
      email: 'rahman@smk-alamanah.sch.id',
      spesialisasi: 'Guru Pembina Seni Hadroh',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=160&auto=format&fit=crop&q=80',
      isPembina: true,
      isWaliKelas: false,
      role: 'PEMBINA',
      statusAktif: true,
    },
    {
      id: 'guru-pem-03',
      username: 'miftah.farid',
      passwordHash: 'pembina123',
      nip: '19900824 201704 1 005',
      namaLengkap: 'Miftah Farid, S.Pd.I.',
      jenisKelamin: 'L',
      noHp: '081276543201',
      email: 'miftah.farid@smk-alamanah.sch.id',
      spesialisasi: 'Guru Pembina Tilawatil Quran & Rohis',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=160&auto=format&fit=crop&q=80',
      isPembina: true,
      isWaliKelas: false,
      role: 'PEMBINA',
      statusAktif: true,
    },
    {
      id: 'guru-wali-05',
      username: 'walikelas',
      passwordHash: 'walikelas123',
      nip: '19870321 201301 2 006',
      namaLengkap: 'Siti Nurhaliza, M.Pd.',
      jenisKelamin: 'P',
      noHp: '081265432101',
      email: 'siti.nurhaliza@smk-alamanah.sch.id',
      spesialisasi: 'Wali Kelas X RPL 1 & Guru Bahasa',
      avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=160&auto=format&fit=crop&q=80',
      isPembina: true,
      isWaliKelas: true,
      role: 'WALI_KELAS',
      statusAktif: true,
    },
    {
      id: 'guru-wali-06',
      username: 'hendra.wali',
      passwordHash: 'walikelas123',
      nip: '19860415 201001 1 005',
      namaLengkap: 'Hendra Wijaya, S.T.',
      jenisKelamin: 'L',
      noHp: '081254321098',
      email: 'hendra.wijaya@smk-alamanah.sch.id',
      spesialisasi: 'Wali Kelas X RPL 2 & Guru Pemrograman',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=160&auto=format&fit=crop&q=80',
      isPembina: false,
      isWaliKelas: true,
      role: 'WALI_KELAS',
      statusAktif: true,
    },
    {
      id: 'guru-wali-07',
      username: 'dewi.wali',
      passwordHash: 'walikelas123',
      nip: '19890918 201502 2 004',
      namaLengkap: 'Dewi Lestari, S.E.',
      jenisKelamin: 'P',
      noHp: '081243210987',
      email: 'dewi.lestari@smk-alamanah.sch.id',
      spesialisasi: 'Wali Kelas X AKL 1 & Guru Akuntansi',
      avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=160&auto=format&fit=crop&q=80',
      isPembina: false,
      isWaliKelas: true,
      role: 'WALI_KELAS',
      statusAktif: true,
    },
  ];

  const guruMap = {
    koordinator: guruViska,
    mulyadi: guruMulyadi,
  };

  for (const g of guruMasterData) {
    const createdGuru = await prisma.guru.create({ data: g });
    guruMap[g.username] = createdGuru;
  }

  // 5. Data Master Kelas
  const klsXRPL1 = await prisma.kelas.create({
    data: {
      id: 'kls-01',
      namaKelas: 'X RPL 1',
      tingkat: 10,
      jurusan: 'Rekayasa Perangkat Lunak',
      waliKelasId: guruMap['walikelas'].id,
    },
  });

  const klsXRPL2 = await prisma.kelas.create({
    data: {
      id: 'kls-02',
      namaKelas: 'X RPL 2',
      tingkat: 10,
      jurusan: 'Rekayasa Perangkat Lunak',
      waliKelasId: guruMap['hendra.wali'].id,
    },
  });

  const klsXAKL1 = await prisma.kelas.create({
    data: {
      id: 'kls-03',
      namaKelas: 'X AKL 1',
      tingkat: 10,
      jurusan: 'Akuntansi Keuangan Lembaga',
      waliKelasId: guruMap['dewi.wali'].id,
    },
  });

  const klsXIRPL1 = await prisma.kelas.create({
    data: {
      id: 'kls-04',
      namaKelas: 'XI RPL 1',
      tingkat: 11,
      jurusan: 'Rekayasa Perangkat Lunak',
    },
  });

  const klsXITKJ2 = await prisma.kelas.create({
    data: {
      id: 'kls-05',
      namaKelas: 'XI TKJ 2',
      tingkat: 11,
      jurusan: 'Teknik Komputer & Jaringan',
    },
  });

  const klsXIIBDP2 = await prisma.kelas.create({
    data: {
      id: 'kls-06',
      namaKelas: 'XII BDP 2',
      tingkat: 12,
      jurusan: 'Bisnis Daring & Pemasaran',
    },
  });

  // 6. Data Master Cabang Eskul
  const eskulMasterList = [
    {
      id: 'eskul-01',
      namaEskul: 'Futsal Prestasi',
      kategori: 'Olahraga',
      pembinaId: guruMap['ahmad.futsal'].id,
      jadwalHari: 'Kamis',
      jamMulai: '15:30',
      jamSelesai: '17:30',
      lokasi: 'Lapangan Futsal SMK Al Amanah',
      kuota: 45,
      status: 'Aktif',
      deskripsi: 'Pelatihan teknik sepak bola mini, taktik tim, dan persiapan turnamen antar SMK.',
    },
    {
      id: 'eskul-02',
      namaEskul: 'Computer & Web Club',
      kategori: 'Teknologi',
      pembinaId: guruMap['abdul.jabbar'].id,
      jadwalHari: 'Jumat',
      jamMulai: '13:30',
      jamSelesai: '15:30',
      lokasi: 'Lab Komputer RPL 1',
      kuota: 40,
      status: 'Aktif',
      deskripsi: 'Pengembangan web modern, UI/UX, dan persiapan lomba kompetensi siswa (LKS).',
    },
    {
      id: 'eskul-03',
      namaEskul: 'Seni Hadroh & Marawis',
      kategori: 'Seni & Budaya',
      pembinaId: guruMap['rahman.lc'].id,
      jadwalHari: 'Rabu',
      jamMulai: '15:30',
      jamSelesai: '17:00',
      lokasi: 'Aula Masjid SMK Al Amanah',
      kuota: 30,
      status: 'Aktif',
      deskripsi: 'Seni musik perkusi Islami dan pelestarian syiar sholawat.',
    },
    {
      id: 'eskul-04',
      namaEskul: 'Tilawatil Qur’an',
      kategori: 'Keagamaan',
      pembinaId: guruMap['miftah.farid'].id,
      jadwalHari: 'Selasa',
      jamMulai: '15:30',
      jamSelesai: '17:00',
      lokasi: 'Musholla Al-Ikhlas Lt. 2',
      kuota: 35,
      status: 'Aktif',
      deskripsi: 'Pelatihan seni baca Qur’an dengan kaidah tajwid, nagham, dan makhorijul huruf.',
    },
    {
      id: 'eskul-05',
      namaEskul: 'Paskibra Satya Amanah',
      kategori: 'Kepemimpinan',
      pembinaId: guruMap['budi.paskibra'].id,
      jadwalHari: 'Sabtu',
      jamMulai: '07:30',
      jamSelesai: '10:30',
      lokasi: 'Plaza Upacara SMK Al Amanah',
      kuota: 45,
      status: 'Aktif',
      deskripsi: 'Latihan baris berbaris (PBB), formasi pengibaran bendera, dan pembentukan karakter.',
    },
    {
      id: 'eskul-06',
      namaEskul: 'Pramuka Penegak',
      kategori: 'Kepemimpinan',
      pembinaId: guruMap['budi.paskibra'].id,
      jadwalHari: 'Kamis',
      jamMulai: '15:30',
      jamSelesai: '17:30',
      lokasi: 'Lapangan Utama & Gedung B',
      kuota: 50,
      status: 'Aktif',
      deskripsi: 'Kepanduan pramuka wajib dan penegak bantara dengan materi survival.',
    },
    {
      id: 'eskul-07',
      namaEskul: 'Rohis Al-Ikhlas',
      kategori: 'Keagamaan',
      pembinaId: guruMap['miftah.farid'].id,
      jadwalHari: 'Jumat',
      jamMulai: '11:30',
      jamSelesai: '13:00',
      lokasi: 'Masjid SMK Al Amanah',
      kuota: 60,
      status: 'Aktif',
      deskripsi: 'Kajian keislaman, bimbingan akhlak, dan kepanitiaan hari besar Islam.',
    },
    {
      id: 'eskul-08',
      namaEskul: 'Palang Merah Remaja (PMR)',
      kategori: 'Kepemimpinan',
      pembinaId: guruViska.id,
      jadwalHari: 'Senin',
      jamMulai: '15:30',
      jamSelesai: '17:00',
      lokasi: 'Ruang UKS & Lapangan',
      kuota: 35,
      status: 'Aktif',
      deskripsi: 'Pertolongan pertama (PP), evakuasi bencana, dan kesiapsiagaan medis sekolah.',
    },
    {
      id: 'eskul-09',
      namaEskul: 'Bola Voli Taruna',
      kategori: 'Olahraga',
      pembinaId: guruMap['ahmad.futsal'].id,
      jadwalHari: 'Kamis',
      jamMulai: '15:30',
      jamSelesai: '17:30',
      lokasi: 'Lapangan Voli Outdoor',
      kuota: 30,
      status: 'Aktif',
      deskripsi: 'Latihan servis, smash, passing, dan turnamen bola voli pelajar.',
    },
    {
      id: 'eskul-10',
      namaEskul: 'Badminton Club',
      kategori: 'Olahraga',
      pembinaId: guruMap['ahmad.futsal'].id,
      jadwalHari: 'Selasa',
      jamMulai: '15:30',
      jamSelesai: '17:00',
      lokasi: 'GOR Bulutangkis Al Amanah',
      kuota: 25,
      status: 'Aktif',
      deskripsi: 'Latihan teknik dasar bulutangkis, footwork, dan sparring rutin.',
    },
    {
      id: 'eskul-11',
      namaEskul: 'Seni Tari Tradisional',
      kategori: 'Seni & Budaya',
      pembinaId: guruMap['walikelas'].id,
      jadwalHari: 'Rabu',
      jamMulai: '15:30',
      jamSelesai: '17:00',
      lokasi: 'Sanggar Seni Lt. 3',
      kuota: 25,
      status: 'Aktif',
      deskripsi: 'Eksplorasi ragam tari tradisional Nusantara dan tari kreasi modern.',
    },
    {
      id: 'eskul-12',
      namaEskul: 'Fotografi & Jurnalistik',
      kategori: 'Teknologi',
      pembinaId: guruMap['abdul.jabbar'].id,
      jadwalHari: 'Sabtu',
      jamMulai: '08:00',
      jamSelesai: '10:30',
      lokasi: 'Studio Multimedia & Lapangan',
      kuota: 30,
      status: 'Aktif',
      deskripsi: 'Teknik fotografi kamera DSLR/Mirrorless, videografi, dan majalah sekolah.',
    },
  ];

  for (const e of eskulMasterList) {
    await prisma.eskul.create({ data: e });
  }

  // 7. Data Master Siswa (Langsung di tabel `siswa`)
  const siswaDataList = [
    {
      id: 'sis-01',
      nis: '20241001',
      nisn: '0061928374',
      namaLengkap: 'Muhammad Farhan Al-Fatih',
      jenisKelamin: 'L',
      kelasId: klsXRPL1.id,
      avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=160&auto=format&fit=crop&q=80',
      eskuls: ['eskul-01', 'eskul-02'], // Futsal, IT Club
    },
    {
      id: 'sis-02',
      nis: '20241002',
      nisn: '0062839102',
      namaLengkap: 'Siti Rahmawati',
      jenisKelamin: 'P',
      kelasId: klsXRPL1.id,
      avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=160&auto=format&fit=crop&q=80',
      eskuls: ['eskul-04', 'eskul-11'], // Tilawah, Tari
    },
    {
      id: 'sis-03',
      nis: '20241003',
      nisn: '0059283741',
      namaLengkap: 'Bagas Dwi Wicaksono',
      jenisKelamin: 'L',
      kelasId: klsXRPL1.id,
      avatarUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=160&auto=format&fit=crop&q=80',
      eskuls: ['eskul-01', 'eskul-05'], // Futsal, Paskibra
    },
    {
      id: 'sis-04',
      nis: '20241004',
      nisn: '0073948192',
      namaLengkap: 'Aisyah Putri Azzahra',
      jenisKelamin: 'P',
      kelasId: klsXRPL1.id,
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=160&auto=format&fit=crop&q=80',
      eskuls: ['eskul-07', 'eskul-08'], // Rohis, PMR
    },
    {
      id: 'sis-05',
      nis: '20241005',
      nisn: '0068839201',
      namaLengkap: 'Dimas Anggara Putra',
      jenisKelamin: 'L',
      kelasId: klsXRPL1.id,
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=160&auto=format&fit=crop&q=80',
      eskuls: ['eskul-09', 'eskul-10'], // Voli, Badminton
    },
    {
      id: 'sis-06',
      nis: '20241006',
      nisn: '0071829301',
      namaLengkap: 'Nabila Syakieb Maharani',
      jenisKelamin: 'P',
      kelasId: klsXRPL1.id,
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=160&auto=format&fit=crop&q=80',
      eskuls: ['eskul-02', 'eskul-12'], // IT, Jurnalistik
    },
    {
      id: 'sis-07',
      nis: '20241007',
      nisn: '0069928172',
      namaLengkap: 'Fadhil Muhammad Ihsan',
      jenisKelamin: 'L',
      kelasId: klsXRPL1.id,
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=160&auto=format&fit=crop&q=80',
      eskuls: ['eskul-01', 'eskul-03'], // Futsal, Hadroh
    },
    {
      id: 'sis-08',
      nis: '20241008',
      nisn: '0072938475',
      namaLengkap: 'Zahra Amelia Safitri',
      jenisKelamin: 'P',
      kelasId: klsXRPL1.id,
      avatarUrl: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=160&auto=format&fit=crop&q=80',
      eskuls: ['eskul-03', 'eskul-08'], // Hadroh, PMR
    },
    {
      id: 'sis-09',
      nis: '20241009',
      nisn: '0067382910',
      namaLengkap: 'Rizky Ramadhan',
      jenisKelamin: 'L',
      kelasId: klsXRPL2.id,
      avatarUrl: 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=160&auto=format&fit=crop&q=80',
      eskuls: ['eskul-01', 'eskul-06'], // Futsal, Pramuka
    },
    {
      id: 'sis-10',
      nis: '20241010',
      nisn: '0078492019',
      namaLengkap: 'Amanda Putri Cahyani',
      jenisKelamin: 'P',
      kelasId: klsXAKL1.id,
      avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=160&auto=format&fit=crop&q=80',
      eskuls: ['eskul-05', 'eskul-11'], // Paskibra, Tari
    },
  ];

  const siswaMap = {};
  for (const s of siswaDataList) {
    const defaultPassword = getStudentDefaultPassword(s.nis); // al_amanah_xxx

    const createdSiswa = await prisma.siswa.create({
      data: {
        id: s.id,
        nis: s.nis,
        nisn: s.nisn,
        passwordHash: defaultPassword,
        namaLengkap: s.namaLengkap,
        jenisKelamin: s.jenisKelamin,
        kelasId: s.kelasId,
        avatarUrl: s.avatarUrl,
        statusSiswa: 'AKTIF',
        statusAktif: true,
      },
    });

    siswaMap[s.nis] = createdSiswa;

    // Masukkan keanggotaan eskul
    for (const eid of s.eskuls) {
      await prisma.anggotaEskul.create({
        data: {
          eskulId: eid,
          siswaId: createdSiswa.id,
          tahunAjaran: '2026/2027',
          status: 'AKTIF',
          jabatan: s.nis === '20241001' && eid === 'eskul-01' ? 'KETUA' : 'ANGGOTA',
        },
      });
    }
  }

  // 8. Sesi Pertemuan Hari Ini (Kamis Aktif)
  const todayStr = new Date().toISOString().slice(0, 10);

  const sesiFutsal = await prisma.sesiPertemuan.create({
    data: {
      id: 'sesi-01',
      eskulId: 'eskul-01', // Futsal Prestasi
      pembuatId: guruMap['ahmad.futsal'].id,
      tanggal: todayStr,
      jamMulai: '15:30',
      jamSelesai: '17:30',
      lokasi: 'Lapangan Futsal SMK Al Amanah',
      materi: 'Latihan Taktik Transisi Bertahan & Penyerangan Cepat 4v4',
      tokenAktif: 'SMK-AMANAH:sesi-01:AKTIF:B4F1',
      tokenExpiresAt: new Date(Date.now() + 15000),
      status: 'BERLANGSUNG',
    },
  });

  const sesiIT = await prisma.sesiPertemuan.create({
    data: {
      id: 'sesi-02',
      eskulId: 'eskul-02', // Computer & Web Club
      pembuatId: guruMap['abdul.jabbar'].id,
      tanggal: todayStr,
      jamMulai: '13:30',
      jamSelesai: '15:30',
      lokasi: 'Lab Komputer RPL 1',
      materi: 'Integrasi REST API Presensi QR & Normalisasi Database',
      tokenAktif: 'SMK-AMANAH:sesi-02:STANDBY:8E1A',
      tokenExpiresAt: new Date(Date.now() + 15000),
      status: 'BERLANGSUNG',
    },
  });

  const sesiPaskibra = await prisma.sesiPertemuan.create({
    data: {
      id: 'sesi-03',
      eskulId: 'eskul-05',
      pembuatId: guruMap['budi.paskibra'].id,
      tanggal: todayStr,
      jamMulai: '07:30',
      jamSelesai: '10:30',
      lokasi: 'Plaza Upacara',
      materi: 'Formasi Pengibaran Bendera & Langkah Tegap Maju',
      status: 'SELESAI',
    },
  });

  // 9. Log Presensi Sesi Futsal Hari Ini
  const presensiLogs = [
    {
      sesiId: sesiFutsal.id,
      siswaId: siswaMap['20241001'].id, // Farhan
      waktuScan: new Date(Date.now() - 15 * 60 * 1000),
      status: 'HADIR',
      metode: 'DYNAMIC_QR',
      deviceInfo: 'Perangkat Siswa (GPS Valid Lapangan Futsal)',
    },
    {
      sesiId: sesiFutsal.id,
      siswaId: siswaMap['20241003'].id, // Bagas
      waktuScan: new Date(Date.now() - 12 * 60 * 1000),
      status: 'HADIR',
      metode: 'SCAN_QR_SISWA',
      deviceInfo: 'Kamera Scanner Pembina (ID Card Siswa)',
    },
    {
      sesiId: sesiFutsal.id,
      siswaId: siswaMap['20241007'].id, // Fadhil
      waktuScan: new Date(Date.now() - 8 * 60 * 1000),
      status: 'HADIR',
      metode: 'DYNAMIC_QR',
      deviceInfo: 'Perangkat Siswa (GPS Valid)',
    },
  ];

  for (const p of presensiLogs) {
    await prisma.presensi.create({ data: p });
  }

  // 10. Data Penilaian Rapor Semester Ini
  const penilaianSeed = [
    {
      eskulId: 'eskul-01',
      siswaId: siswaMap['20241001'].id,
      penilaiId: guruMap['ahmad.futsal'].id,
      semester: 1,
      tahunAjaran: '2026/2027',
      nilaiKehadiran: 96.0,
      nilaiKeaktifan: 92.0,
      ratingKeaktifan: 'Sangat Baik',
      nilaiKinerja: 94.0,
      poinPrestasi: 5.0,
      nilaiAkhir: 94.9,
      predikat: 'A',
      capaianKompetensi: 'Memiliki stamina fisik sangat prima, visi bermain matang, dan jiwa kepemimpinan kapten tim.',
    },
    {
      eskulId: 'eskul-02',
      siswaId: siswaMap['20241001'].id,
      penilaiId: guruMap['abdul.jabbar'].id,
      semester: 1,
      tahunAjaran: '2026/2027',
      nilaiKehadiran: 92.0,
      nilaiKeaktifan: 88.0,
      ratingKeaktifan: 'Baik',
      nilaiKinerja: 90.0,
      poinPrestasi: 0.0,
      nilaiAkhir: 90.1,
      predikat: 'A',
      capaianKompetensi: 'Sangat terampil dalam styling CSS, responsive layout, dan integrasi API RESTful.',
    },
    {
      eskulId: 'eskul-01',
      siswaId: siswaMap['20241003'].id, // Bagas
      penilaiId: guruMap['ahmad.futsal'].id,
      semester: 1,
      tahunAjaran: '2026/2027',
      nilaiKehadiran: 90.0,
      nilaiKeaktifan: 85.0,
      ratingKeaktifan: 'Baik',
      nilaiKinerja: 86.0,
      poinPrestasi: 0.0,
      nilaiAkhir: 87.2,
      predikat: 'B',
      capaianKompetensi: 'Konsisten dalam latihan bertahan dan memiliki kecepatan recovery bola yang baik.',
    },
    {
      eskulId: 'eskul-04',
      siswaId: siswaMap['20241002'].id, // Siti Rahmawati
      penilaiId: guruMap['miftah.farid'].id,
      semester: 1,
      tahunAjaran: '2026/2027',
      nilaiKehadiran: 98.0,
      nilaiKeaktifan: 95.0,
      ratingKeaktifan: 'Sangat Baik',
      nilaiKinerja: 94.0,
      poinPrestasi: 5.0,
      nilaiAkhir: 96.0,
      predikat: 'A',
      capaianKompetensi: 'Fashahah sangat fasih, nagham merdu, dan aktif membimbing rekan junior.',
    },
  ];

  for (const n of penilaianSeed) {
    await prisma.penilaian.create({ data: n });
  }

  // 11. Data Prestasi Lomba
  await prisma.prestasiLomba.create({
    data: {
      eskulId: 'eskul-01',
      siswaId: siswaMap['20241001'].id,
      namaLomba: 'Turnamen Futsal Pelajar Walikota Cup Tangerang Selatan 2026',
      penyelenggara: 'Dispora Kota Tangerang Selatan',
      tingkat: 'KOTA',
      peringkat: 'JUARA_1',
      poinTambahan: 10.0,
      keterangan: 'Top Scorer dan Juara 1 Tingkat Pelajar SMK Se-Tangsel.',
      diverifikasi: true,
    },
  });

  console.log('✅ [SEED] Sukses! Seluruh data ternormalisasi dan terhubung presisi.');
  console.log('📋 Daftar Akun Resmi:');
  console.log('  - Administrator     : admin / admin123  (Role: ADMIN - Administrator Sistem)');
  console.log('  - Koordinator Eskul : koordinator / admin123 (Role: KOORDINATOR - Viska Adawiyah Z., S.Pd.)');
  console.log('  - Wakasek Kesiswaan : mulyadi / admin123 (Role: KOORDINATOR - Drs. H. Mulyadi, M.Pd.)');
  console.log('  - Pembina Futsal    : ahmad.futsal / pembina123');
  console.log('  - Pembina IT Club   : abdul.jabbar / pembina123');
  console.log('  - Pembina Paskibra  : budi.paskibra / pembina123');
  console.log('  - Wali Kelas X RPL 1: walikelas / walikelas123');
  console.log('  - Siswa Farhan      : 20241001 / al_amanah_001 (atau siswa123)');
}

main()
  .catch((e) => {
    console.error('❌ [SEED ERROR]:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
