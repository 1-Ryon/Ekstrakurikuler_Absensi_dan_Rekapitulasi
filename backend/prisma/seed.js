import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// 10 Siswa Spesifik yang Diberikan Pengguna
const SPECIFIC_STUDENTS = [
  { nama: 'Khaisan Ramzi Muzhaffar', nim: '241011400049', gender: 'L', kelasNama: 'X RPL 1', eskuls: ['eskul-01', 'eskul-02'] },
  { nama: 'Muhamad Ariono Putra Agusni', nim: '241011403038', gender: 'L', kelasNama: 'X RPL 1', eskuls: ['eskul-01', 'eskul-10'] },
  { nama: 'Muhammad Gilang Wicaksana', nim: '241011403351', gender: 'L', kelasNama: 'X RPL 1', eskuls: ['eskul-02', 'eskul-12'] },
  { nama: 'Fandy Azkan Nufus', nim: '241011401904', gender: 'L', kelasNama: 'X RPL 1', eskuls: ['eskul-17', 'eskul-01'] },
  { nama: 'Andini Kemuning Prameswari', nim: '241011400024', gender: 'P', kelasNama: 'X RPL 1', eskuls: ['eskul-11', 'eskul-13'] },
  { nama: 'Rosaliya', nim: '241011403323', gender: 'P', kelasNama: 'X RPL 1', eskuls: ['eskul-08', 'eskul-11'] },
  { nama: 'Muhamad Zidan', nim: '241011401533', gender: 'L', kelasNama: 'X RPL 2', eskuls: ['eskul-05', 'eskul-09'] },
  { nama: 'Arifin Hamdani', nim: '241011400016', gender: 'L', kelasNama: 'X RPL 2', eskuls: ['eskul-07', 'eskul-04'] },
  { nama: 'Ade Novfa Fikriansyah', nim: '241011401903', gender: 'L', kelasNama: 'X RPL 2', eskuls: ['eskul-15', 'eskul-02'] },
  { nama: 'Muhammad Arif Nugroho', nim: '241011403023', gender: 'L', kelasNama: 'X RPL 2', eskuls: ['eskul-16', 'eskul-01'] },
];

// Bank Nama Realistis Indonesia untuk 790 Siswa Lainnya
const FIRST_NAMES_MALE = [
  'Aditya', 'Ahmad', 'Alif', 'Bagas', 'Bima', 'Bayu', 'Daffa', 'Dimas', 'Eko', 'Fajar', 
  'Farhan', 'Galang', 'Gilang', 'Hafizh', 'Ilham', 'Irfan', 'Kevin', 'Lukman', 'Maulana', 
  'Naufal', 'Pratama', 'Raditya', 'Rafi', 'Rangga', 'Rayhan', 'Reza', 'Rian', 'Rifqi', 
  'Rizky', 'Satria', 'Syahrul', 'Taufiq', 'Wahyu', 'Yusuf', 'Zack', 'Aldi', 'Danu', 
  'Fikri', 'Hendra', 'Iqbal', 'Julian', 'Kenji', 'Leon', 'Marcel', 'Nico', 'Panji', 
  'Rendy', 'Surya', 'Teguh', 'Vino'
];

const FIRST_NAMES_FEMALE = [
  'Adinda', 'Aisyah', 'Amalia', 'Anisa', 'Annisa', 'Aqila', 'Aulia', 'Cantika', 'Citra', 
  'Dinda', 'Fadilah', 'Farah', 'Fitriani', 'Gita', 'Hana', 'Indah', 'Intan', 'Karina', 
  'Lestari', 'Maulida', 'Nabila', 'Nadya', 'Nasywa', 'Nayra', 'Nurul', 'Putri', 'Rahma', 
  'Rania', 'Salma', 'Salsabila', 'Syifa', 'Tiara', 'Widya', 'Zahra', 'Zaskia', 'Bella', 
  'Clarissa', 'Devi', 'Eka', 'Febiola', 'Gisella', 'Helena', 'Jessica', 'Kayla', 'Luna', 
  'Mawar', 'Nadine', 'Olivia', 'Priska', 'Rachel'
];

const LAST_NAMES = [
  'Pratama', 'Saputra', 'Setiawan', 'Hidayat', 'Kurniawan', 'Ramadhan', 'Firmansyah', 
  'Wibowo', 'Nugroho', 'Santoso', 'Gunawan', 'Wijaya', 'Permana', 'Maulana', 'Hakim', 
  'Kusuma', 'Lestari', 'Putri', 'Sari', 'Anggraini', 'Dewi', 'Wulandari', 'Maharani', 
  'Safitri', 'Astuti', 'Rahayu', 'Oktaviani', 'Zulkarnaen', 'Subagyo', 'Handayani', 
  'Syaputra', 'Pangestu', 'Siregar', 'Lubis', 'Nasution', 'Kuswanto', 'Purwanto', 
  'Hermawan', 'Kusumo', 'Wicaksono'
];

// Helper chunk array
function chunkArray(array, size) {
  const chunked = [];
  for (let i = 0; i < array.length; i += size) {
    chunked.push(array.slice(i, i + size));
  }
  return chunked;
}

async function main() {
  console.log('🌱 [SEED 800 SISWA, 30 GURU, 18 PEMBINA] Memulai inisialisasi basis data...');

  // 1. Bersihkan seluruh database secara terurut
  await prisma.presensi.deleteMany({});
  await prisma.penilaian.deleteMany({});
  await prisma.prestasiLomba.deleteMany({});
  await prisma.pengajuanJadwal.deleteMany({});
  await prisma.pendaftaranEskul.deleteMany({});
  await prisma.sesiPertemuan.deleteMany({});
  await prisma.anggotaEskul.deleteMany({});
  await prisma.eskul.deleteMany({});
  await prisma.siswa.deleteMany({});
  await prisma.kelas.deleteMany({});
  await prisma.guru.deleteMany({});
  await prisma.admin.deleteMany({});

  console.log('🧹 Database lama berhasil dibersihkan.');

  // 2. Akun Administrator Sistem (Role: ADMIN)
  await prisma.admin.createMany({
    data: [
      {
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
      {
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
    ],
  });

  console.log('✅ 2 Akun Administrator dibuat.');

  // 3. 30 Data Guru (2 Koordinator, 18 Pembina Eskul, 10 Guru Wali Kelas/Mapel)
  const guruList = [
    // 2 Koordinator Ekstrakurikuler
    {
      id: 'guru-koor-01',
      username: 'koordinator',
      passwordHash: 'admin123',
      nip: '19890412 201402 2 003',
      namaLengkap: 'Viska Adawiyah Zulkarnaen, S.Pd.',
      jenisKelamin: 'P',
      noHp: '081234567890',
      email: 'viska@smk-alamanah.sch.id',
      spesialisasi: 'Koordinator Ekstrakurikuler Utama & Pembina PMR',
      avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=160&auto=format&fit=crop&q=80',
      role: 'KOORDINATOR',
      isPembina: true,
      isWaliKelas: false,
      statusAktif: true,
    },
    {
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

    // 17 Guru Pembina Eskul Lainnya (Total 18 Pembina dengan Bu Viska)
    {
      id: 'guru-pem-01',
      username: 'ahmad.futsal',
      passwordHash: 'pembina123',
      nip: '19910515 201802 1 004',
      namaLengkap: 'Ahmad Syafii, S.Pd.',
      jenisKelamin: 'L',
      noHp: '081345678901',
      email: 'ahmad.syafii@smk-alamanah.sch.id',
      spesialisasi: 'Guru Pembina Futsal Prestasi & Olahraga',
      avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=160&auto=format&fit=crop&q=80',
      isPembina: true,
      isWaliKelas: false,
      role: 'PEMBINA',
      statusAktif: true,
    },
    {
      id: 'guru-pem-02',
      username: 'abdul.jabbar',
      passwordHash: 'pembina123',
      nip: '19850210 201101 1 007',
      namaLengkap: 'Abdul Jabbar, S.Kom., M.Kom.',
      jenisKelamin: 'L',
      noHp: '081234567801',
      email: 'abdul.jabbar@smk-alamanah.sch.id',
      spesialisasi: 'Guru Pembina Computer & Web Club',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=160&auto=format&fit=crop&q=80',
      isPembina: true,
      isWaliKelas: false,
      role: 'PEMBINA',
      statusAktif: true,
    },
    {
      id: 'guru-pem-03',
      username: 'rahman.lc',
      passwordHash: 'pembina123',
      nip: '19881105 201503 1 002',
      namaLengkap: 'Rahman, Lc.',
      jenisKelamin: 'L',
      noHp: '081287654301',
      email: 'rahman@smk-alamanah.sch.id',
      spesialisasi: 'Guru Pembina Seni Hadroh & Marawis',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=160&auto=format&fit=crop&q=80',
      isPembina: true,
      isWaliKelas: false,
      role: 'PEMBINA',
      statusAktif: true,
    },
    {
      id: 'guru-pem-04',
      username: 'miftah.farid',
      passwordHash: 'pembina123',
      nip: '19900824 201704 1 005',
      namaLengkap: 'Miftah Farid, S.Pd.I.',
      jenisKelamin: 'L',
      noHp: '081276543201',
      email: 'miftah.farid@smk-alamanah.sch.id',
      spesialisasi: 'Guru Pembina Tilawatil Quran & Tahfidz',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=160&auto=format&fit=crop&q=80',
      isPembina: true,
      isWaliKelas: false,
      role: 'PEMBINA',
      statusAktif: true,
    },
    {
      id: 'guru-pem-05',
      username: 'budi.paskibra',
      passwordHash: 'pembina123',
      nip: '19840112 200902 1 001',
      namaLengkap: 'Budi Santoso, S.Pd.',
      jenisKelamin: 'L',
      noHp: '081398765401',
      email: 'budi.santoso@smk-alamanah.sch.id',
      spesialisasi: 'Guru Pembina Paskibra Satya Amanah',
      avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=160&auto=format&fit=crop&q=80',
      isPembina: true,
      isWaliKelas: false,
      role: 'PEMBINA',
      statusAktif: true,
    },
    {
      id: 'guru-pem-06',
      username: 'nurjanah.pramuka',
      passwordHash: 'pembina123',
      nip: '19780614 200501 2 003',
      namaLengkap: 'Dra. Hj. Nurjanah, M.Pd.',
      jenisKelamin: 'P',
      noHp: '081387654321',
      email: 'nurjanah@smk-alamanah.sch.id',
      spesialisasi: 'Guru Pembina Pramuka Penegak',
      avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=160&auto=format&fit=crop&q=80',
      isPembina: true,
      isWaliKelas: false,
      role: 'PEMBINA',
      statusAktif: true,
    },
    {
      id: 'guru-pem-07',
      username: 'ridwan.rohis',
      passwordHash: 'pembina123',
      nip: '19860319 201201 1 006',
      namaLengkap: 'Ust. Muhammad Ridwan, S.Pd.I.',
      jenisKelamin: 'L',
      noHp: '081376543210',
      email: 'ridwan@smk-alamanah.sch.id',
      spesialisasi: 'Guru Pembina Rohis Al-Ikhlas',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=160&auto=format&fit=crop&q=80',
      isPembina: true,
      isWaliKelas: false,
      role: 'PEMBINA',
      statusAktif: true,
    },
    {
      id: 'guru-pem-08',
      username: 'deni.voli',
      passwordHash: 'pembina123',
      nip: '19920718 201903 1 003',
      namaLengkap: 'Deni Setiawan, S.Pd.',
      jenisKelamin: 'L',
      noHp: '081365432109',
      email: 'deni.setiawan@smk-alamanah.sch.id',
      spesialisasi: 'Guru Pembina Bola Voli Taruna',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=160&auto=format&fit=crop&q=80',
      isPembina: true,
      isWaliKelas: false,
      role: 'PEMBINA',
      statusAktif: true,
    },
    {
      id: 'guru-pem-09',
      username: 'taufik.badminton',
      passwordHash: 'pembina123',
      nip: '19930411 202002 1 004',
      namaLengkap: 'Taufik Hidayatullah, S.Or.',
      jenisKelamin: 'L',
      noHp: '081354321098',
      email: 'taufik.hidayat@smk-alamanah.sch.id',
      spesialisasi: 'Guru Pembina Badminton Club',
      avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=160&auto=format&fit=crop&q=80',
      isPembina: true,
      isWaliKelas: false,
      role: 'PEMBINA',
      statusAktif: true,
    },
    {
      id: 'guru-pem-10',
      username: 'walikelas',
      passwordHash: 'walikelas123',
      nip: '19870321 201301 2 006',
      namaLengkap: 'Siti Nurhaliza, M.Pd.',
      jenisKelamin: 'P',
      noHp: '081265432101',
      email: 'siti.nurhaliza@smk-alamanah.sch.id',
      spesialisasi: 'Guru Pembina Seni Tari Tradisional & Kreasi',
      avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=160&auto=format&fit=crop&q=80',
      isPembina: true,
      isWaliKelas: true,
      role: 'WALI_KELAS',
      statusAktif: true,
    },
    {
      id: 'guru-pem-11',
      username: 'rahmat.foto',
      passwordHash: 'pembina123',
      nip: '19890915 201602 1 008',
      namaLengkap: 'Rahmat Hidayat, S.Sn.',
      jenisKelamin: 'L',
      noHp: '081343210987',
      email: 'rahmat.hidayat@smk-alamanah.sch.id',
      spesialisasi: 'Guru Pembina Fotografi & Jurnalistik',
      avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=160&auto=format&fit=crop&q=80',
      isPembina: true,
      isWaliKelas: false,
      role: 'PEMBINA',
      statusAktif: true,
    },
    {
      id: 'guru-pem-12',
      username: 'indah.english',
      passwordHash: 'pembina123',
      nip: '19901025 201703 2 009',
      namaLengkap: 'Indah Permatasari, M.Hum.',
      jenisKelamin: 'P',
      noHp: '081332109876',
      email: 'indah.permatasari@smk-alamanah.sch.id',
      spesialisasi: 'Guru Pembina English Debate & Conversation Club',
      avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=160&auto=format&fit=crop&q=80',
      isPembina: true,
      isWaliKelas: false,
      role: 'PEMBINA',
      statusAktif: true,
    },
    {
      id: 'guru-pem-13',
      username: 'yuki.japan',
      passwordHash: 'pembina123',
      nip: '19940214 202102 2 005',
      namaLengkap: 'Yuki Kusuma, S.S.',
      jenisKelamin: 'P',
      noHp: '081321098765',
      email: 'yuki.kusuma@smk-alamanah.sch.id',
      spesialisasi: 'Guru Pembina Japanese Club & Manga',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=160&auto=format&fit=crop&q=80',
      isPembina: true,
      isWaliKelas: false,
      role: 'PEMBINA',
      statusAktif: true,
    },
    {
      id: 'guru-pem-14',
      username: 'faisal.desain',
      passwordHash: 'pembina123',
      nip: '19921108 201901 1 007',
      namaLengkap: 'Faisal Akbar, S.Kom.',
      jenisKelamin: 'L',
      noHp: '081310987654',
      email: 'faisal.akbar@smk-alamanah.sch.id',
      spesialisasi: 'Guru Pembina Desain Komunikasi Visual (DKV)',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=160&auto=format&fit=crop&q=80',
      isPembina: true,
      isWaliKelas: false,
      role: 'PEMBINA',
      statusAktif: true,
    },
    {
      id: 'guru-pem-15',
      username: 'eko.marching',
      passwordHash: 'pembina123',
      nip: '19870530 201403 1 006',
      namaLengkap: 'Eko Prasetyo, S.Pd.',
      jenisKelamin: 'L',
      noHp: '081309876543',
      email: 'eko.prasetyo@smk-alamanah.sch.id',
      spesialisasi: 'Guru Pembina Marching Band Gita Amanah',
      avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=160&auto=format&fit=crop&q=80',
      isPembina: true,
      isWaliKelas: false,
      role: 'PEMBINA',
      statusAktif: true,
    },
    {
      id: 'guru-pem-16',
      username: 'rian.basket',
      passwordHash: 'pembina123',
      nip: '19950820 202203 1 002',
      namaLengkap: 'Rian Pratama, S.Or.',
      jenisKelamin: 'L',
      noHp: '081298765431',
      email: 'rian.pratama@smk-alamanah.sch.id',
      spesialisasi: 'Guru Pembina Basket Ball Club',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=160&auto=format&fit=crop&q=80',
      isPembina: true,
      isWaliKelas: false,
      role: 'PEMBINA',
      statusAktif: true,
    },
    {
      id: 'guru-pem-17',
      username: 'maya.teater',
      passwordHash: 'pembina123',
      nip: '19910609 201802 2 004',
      namaLengkap: 'Maya Anggraini, S.Sn.',
      jenisKelamin: 'P',
      noHp: '081287654320',
      email: 'maya.anggraini@smk-alamanah.sch.id',
      spesialisasi: 'Guru Pembina Teater & Seni Peran',
      avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=160&auto=format&fit=crop&q=80',
      isPembina: true,
      isWaliKelas: false,
      role: 'PEMBINA',
      statusAktif: true,
    },

    // 11 Guru Wali Kelas & Pengajar Mapel
    {
      id: 'guru-wal-01',
      username: 'hendra.wali',
      passwordHash: 'walikelas123',
      nip: '19860415 201001 1 005',
      namaLengkap: 'Hendra Wijaya, S.T.',
      jenisKelamin: 'L',
      noHp: '081254321098',
      email: 'hendra.wijaya@smk-alamanah.sch.id',
      spesialisasi: 'Guru Pemrograman & Wali Kelas X RPL 2',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=160&auto=format&fit=crop&q=80',
      isPembina: false,
      isWaliKelas: true,
      role: 'WALI_KELAS',
      statusAktif: true,
    },
    {
      id: 'guru-wal-02',
      username: 'dewi.wali',
      passwordHash: 'walikelas123',
      nip: '19890918 201502 2 004',
      namaLengkap: 'Dewi Lestari, S.E.',
      jenisKelamin: 'P',
      noHp: '081243210987',
      email: 'dewi.lestari@smk-alamanah.sch.id',
      spesialisasi: 'Guru Akuntansi & Wali Kelas X AKL 1',
      avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=160&auto=format&fit=crop&q=80',
      isPembina: false,
      isWaliKelas: true,
      role: 'WALI_KELAS',
      statusAktif: true,
    },
    {
      id: 'guru-wal-03',
      username: 'agus.wali',
      passwordHash: 'walikelas123',
      nip: '19830512 200801 1 003',
      namaLengkap: 'Agus Supriyanto, S.Pd.',
      jenisKelamin: 'L',
      noHp: '081232109876',
      email: 'agus.supriyanto@smk-alamanah.sch.id',
      spesialisasi: 'Guru Matematika & Wali Kelas X TKJ 1',
      avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=160&auto=format&fit=crop&q=80',
      isPembina: false,
      isWaliKelas: true,
      role: 'WALI_KELAS',
      statusAktif: true,
    },
    {
      id: 'guru-wal-04',
      username: 'ratna.wali',
      passwordHash: 'walikelas123',
      nip: '19900220 201601 2 005',
      namaLengkap: 'Ratna Sari, S.Kom.',
      jenisKelamin: 'P',
      noHp: '081221098765',
      email: 'ratna.sari@smk-alamanah.sch.id',
      spesialisasi: 'Guru Jaringan & Wali Kelas X TKJ 2',
      avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=160&auto=format&fit=crop&q=80',
      isPembina: false,
      isWaliKelas: true,
      role: 'WALI_KELAS',
      statusAktif: true,
    },
    {
      id: 'guru-wal-05',
      username: 'anita.wali',
      passwordHash: 'walikelas123',
      nip: '19871114 201302 2 007',
      namaLengkap: 'Anita Wijayanti, M.Pd.',
      jenisKelamin: 'P',
      noHp: '081210987654',
      email: 'anita.wijayanti@smk-alamanah.sch.id',
      spesialisasi: 'Guru Bahasa Inggris & Wali Kelas X AKL 2',
      avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=160&auto=format&fit=crop&q=80',
      isPembina: false,
      isWaliKelas: true,
      role: 'WALI_KELAS',
      statusAktif: true,
    },
    {
      id: 'guru-wal-06',
      username: 'bambang.wali',
      passwordHash: 'walikelas123',
      nip: '19820419 200701 1 002',
      namaLengkap: 'Bambang Hermanto, S.Pd.',
      jenisKelamin: 'L',
      noHp: '081209876543',
      email: 'bambang.hermanto@smk-alamanah.sch.id',
      spesialisasi: 'Guru PKn & Wali Kelas X OTKP 1',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=160&auto=format&fit=crop&q=80',
      isPembina: false,
      isWaliKelas: true,
      role: 'WALI_KELAS',
      statusAktif: true,
    },
    {
      id: 'guru-wal-07',
      username: 'dian.wali',
      passwordHash: 'walikelas123',
      nip: '19910803 201801 2 006',
      namaLengkap: 'Dian Pratiwi, S.E.',
      jenisKelamin: 'P',
      noHp: '081198765432',
      email: 'dian.pratiwi@smk-alamanah.sch.id',
      spesialisasi: 'Guru Administrasi Perkantoran & Wali Kelas X OTKP 2',
      avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=160&auto=format&fit=crop&q=80',
      isPembina: false,
      isWaliKelas: true,
      role: 'WALI_KELAS',
      statusAktif: true,
    },
    {
      id: 'guru-wal-08',
      username: 'tri.wali',
      passwordHash: 'walikelas123',
      nip: '19851225 201102 1 004',
      namaLengkap: 'Tri Wibowo, S.T.',
      jenisKelamin: 'L',
      noHp: '081187654321',
      email: 'tri.wibowo@smk-alamanah.sch.id',
      spesialisasi: 'Guru Bisnis & Pemasaran & Wali Kelas X BDP 1',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=160&auto=format&fit=crop&q=80',
      isPembina: false,
      isWaliKelas: true,
      role: 'WALI_KELAS',
      statusAktif: true,
    },
    {
      id: 'guru-wal-09',
      username: 'sari.wali',
      passwordHash: 'walikelas123',
      nip: '19880716 201401 2 003',
      namaLengkap: 'Sari Wulandari, S.Pd.',
      jenisKelamin: 'P',
      noHp: '081176543210',
      email: 'sari.wulandari@smk-alamanah.sch.id',
      spesialisasi: 'Guru Bahasa Indonesia & Wali Kelas XI RPL 1',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=160&auto=format&fit=crop&q=80',
      isPembina: false,
      isWaliKelas: true,
      role: 'WALI_KELAS',
      statusAktif: true,
    },
    {
      id: 'guru-wal-10',
      username: 'joko.wali',
      passwordHash: 'walikelas123',
      nip: '19840309 200901 1 005',
      namaLengkap: 'Joko Susilo, M.Kom.',
      jenisKelamin: 'L',
      noHp: '081165432109',
      email: 'joko.susilo@smk-alamanah.sch.id',
      spesialisasi: 'Guru Basis Data & Wali Kelas XI RPL 2',
      avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=160&auto=format&fit=crop&q=80',
      isPembina: false,
      isWaliKelas: true,
      role: 'WALI_KELAS',
      statusAktif: true,
    },
    {
      id: 'guru-wal-11',
      username: 'wahyu.hidayat',
      passwordHash: 'walikelas123',
      nip: '19860928 201202 1 004',
      namaLengkap: 'Wahyu Hidayat, S.Pd.',
      jenisKelamin: 'L',
      noHp: '081154321098',
      email: 'wahyu.hidayat@smk-alamanah.sch.id',
      spesialisasi: 'Guru Fisika & Wali Kelas XII RPL 1',
      avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=160&auto=format&fit=crop&q=80',
      isPembina: false,
      isWaliKelas: true,
      role: 'WALI_KELAS',
      statusAktif: true,
    },
  ];

  for (const g of guruList) {
    await prisma.guru.create({ data: g });
  }

  console.log(`✅ ${guruList.length} Akun Guru berhasil disimpan (termasuk 18 Pembina Eskul).`);

  // 4. Data Master 27 Kelas (X, XI, XII untuk 800 siswa)
  const kelasNames = [
    // Kelas X
    { namaKelas: 'X RPL 1', tingkat: 10, jurusan: 'Rekayasa Perangkat Lunak', waliId: 'guru-pem-10' }, // Bu Siti
    { namaKelas: 'X RPL 2', tingkat: 10, jurusan: 'Rekayasa Perangkat Lunak', waliId: 'guru-wal-01' }, // Pak Hendra
    { namaKelas: 'X TKJ 1', tingkat: 10, jurusan: 'Teknik Komputer & Jaringan', waliId: 'guru-wal-03' },
    { namaKelas: 'X TKJ 2', tingkat: 10, jurusan: 'Teknik Komputer & Jaringan', waliId: 'guru-wal-04' },
    { namaKelas: 'X AKL 1', tingkat: 10, jurusan: 'Akuntansi Keuangan Lembaga', waliId: 'guru-wal-02' },
    { namaKelas: 'X AKL 2', tingkat: 10, jurusan: 'Akuntansi Keuangan Lembaga', waliId: 'guru-wal-05' },
    { namaKelas: 'X OTKP 1', tingkat: 10, jurusan: 'Otomatisasi Tata Kelola Perkantoran', waliId: 'guru-wal-06' },
    { namaKelas: 'X OTKP 2', tingkat: 10, jurusan: 'Otomatisasi Tata Kelola Perkantoran', waliId: 'guru-wal-07' },
    { namaKelas: 'X BDP 1', tingkat: 10, jurusan: 'Bisnis Daring & Pemasaran', waliId: 'guru-wal-08' },

    // Kelas XI
    { namaKelas: 'XI RPL 1', tingkat: 11, jurusan: 'Rekayasa Perangkat Lunak', waliId: 'guru-wal-09' },
    { namaKelas: 'XI RPL 2', tingkat: 11, jurusan: 'Rekayasa Perangkat Lunak', waliId: 'guru-wal-10' },
    { namaKelas: 'XI TKJ 1', tingkat: 11, jurusan: 'Teknik Komputer & Jaringan', waliId: 'guru-pem-02' },
    { namaKelas: 'XI TKJ 2', tingkat: 11, jurusan: 'Teknik Komputer & Jaringan', waliId: 'guru-pem-14' },
    { namaKelas: 'XI AKL 1', tingkat: 11, jurusan: 'Akuntansi Keuangan Lembaga', waliId: 'guru-pem-12' },
    { namaKelas: 'XI AKL 2', tingkat: 11, jurusan: 'Akuntansi Keuangan Lembaga', waliId: 'guru-pem-13' },
    { namaKelas: 'XI OTKP 1', tingkat: 11, jurusan: 'Otomatisasi Tata Kelola Perkantoran', waliId: 'guru-pem-17' },
    { namaKelas: 'XI OTKP 2', tingkat: 11, jurusan: 'Otomatisasi Tata Kelola Perkantoran', waliId: 'guru-pem-06' },
    { namaKelas: 'XI BDP 1', tingkat: 11, jurusan: 'Bisnis Daring & Pemasaran', waliId: 'guru-pem-08' },

    // Kelas XII
    { namaKelas: 'XII RPL 1', tingkat: 12, jurusan: 'Rekayasa Perangkat Lunak', waliId: 'guru-wal-11' },
    { namaKelas: 'XII RPL 2', tingkat: 12, jurusan: 'Rekayasa Perangkat Lunak', waliId: 'guru-pem-01' },
    { namaKelas: 'XII TKJ 1', tingkat: 12, jurusan: 'Teknik Komputer & Jaringan', waliId: 'guru-pem-05' },
    { namaKelas: 'XII TKJ 2', tingkat: 12, jurusan: 'Teknik Komputer & Jaringan', waliId: 'guru-pem-09' },
    { namaKelas: 'XII AKL 1', tingkat: 12, jurusan: 'Akuntansi Keuangan Lembaga', waliId: 'guru-pem-11' },
    { namaKelas: 'XII AKL 2', tingkat: 12, jurusan: 'Akuntansi Keuangan Lembaga', waliId: 'guru-pem-15' },
    { namaKelas: 'XII OTKP 1', tingkat: 12, jurusan: 'Otomatisasi Tata Kelola Perkantoran', waliId: 'guru-pem-16' },
    { namaKelas: 'XII OTKP 2', tingkat: 12, jurusan: 'Otomatisasi Tata Kelola Perkantoran', waliId: 'guru-pem-07' },
    { namaKelas: 'XII BDP 1', tingkat: 12, jurusan: 'Bisnis Daring & Pemasaran', waliId: 'guru-pem-04' },
  ];

  const kelasMap = {};
  let klsIndex = 1;
  for (const k of kelasNames) {
    const klsId = `kls-${String(klsIndex).padStart(2, '0')}`;
    const createdKelas = await prisma.kelas.create({
      data: {
        id: klsId,
        namaKelas: k.namaKelas,
        tingkat: k.tingkat,
        jurusan: k.jurusan,
        waliKelasId: k.waliId,
      },
    });
    kelasMap[k.namaKelas] = createdKelas.id;
    klsIndex++;
  }

  console.log(`✅ 27 Kelas (Rombel) berhasil dibuat dan dipetakan dengan wali kelas.`);

  // 5. Data Master 18 Cabang Eskul
  const eskulMasterList = [
    {
      id: 'eskul-01',
      namaEskul: 'Futsal Prestasi',
      kategori: 'Olahraga',
      pembinaId: 'guru-pem-01',
      jadwalHari: 'Kamis',
      jamMulai: '15:30',
      jamSelesai: '17:30',
      lokasi: 'Lapangan Futsal SMK Al Amanah',
      kuota: 50,
      status: 'Aktif',
      deskripsi: 'Pelatihan teknik sepak bola mini, taktik tim, dan persiapan turnamen antar SMK se-Jabodetabek.',
    },
    {
      id: 'eskul-02',
      namaEskul: 'Computer & Web Club',
      kategori: 'Teknologi',
      pembinaId: 'guru-pem-02',
      jadwalHari: 'Jumat',
      jamMulai: '13:30',
      jamSelesai: '15:30',
      lokasi: 'Lab Komputer RPL 1',
      kuota: 50,
      status: 'Aktif',
      deskripsi: 'Pengembangan web modern, React, Node.js, UI/UX, dan persiapan lomba kompetensi siswa (LKS).',
    },
    {
      id: 'eskul-03',
      namaEskul: 'Seni Hadroh & Marawis',
      kategori: 'Seni & Budaya',
      pembinaId: 'guru-pem-03',
      jadwalHari: 'Rabu',
      jamMulai: '15:30',
      jamSelesai: '17:00',
      lokasi: 'Aula Masjid SMK Al Amanah',
      kuota: 35,
      status: 'Aktif',
      deskripsi: 'Seni musik perkusi Islami dan pelestarian syiar sholawat nabi.',
    },
    {
      id: 'eskul-04',
      namaEskul: 'Tilawatil Qur’an & Tahfidz',
      kategori: 'Keagamaan',
      pembinaId: 'guru-pem-04',
      jadwalHari: 'Selasa',
      jamMulai: '15:30',
      jamSelesai: '17:00',
      lokasi: 'Musholla Al-Ikhlas Lt. 2',
      kuota: 40,
      status: 'Aktif',
      deskripsi: 'Pelatihan seni baca Qur’an dengan kaidah tajwid, nagham, makhorijul huruf, dan hafalan juz 30.',
    },
    {
      id: 'eskul-05',
      namaEskul: 'Paskibra Satya Amanah',
      kategori: 'Kepemimpinan',
      pembinaId: 'guru-pem-05',
      jadwalHari: 'Sabtu',
      jamMulai: '07:30',
      jamSelesai: '10:30',
      lokasi: 'Plaza Upacara SMK Al Amanah',
      kuota: 50,
      status: 'Aktif',
      deskripsi: 'Latihan baris berbaris (PBB), formasi pengibaran bendera pusaka, dan pembentukan kedisiplinan.',
    },
    {
      id: 'eskul-06',
      namaEskul: 'Pramuka Penegak',
      kategori: 'Kepemimpinan',
      pembinaId: 'guru-pem-06',
      jadwalHari: 'Kamis',
      jamMulai: '15:30',
      jamSelesai: '17:30',
      lokasi: 'Lapangan Utama & Gedung B',
      kuota: 60,
      status: 'Aktif',
      deskripsi: 'Kepanduan pramuka wajib dan penegak bantara dengan materi survival, tali temali, dan morse.',
    },
    {
      id: 'eskul-07',
      namaEskul: 'Rohis Al-Ikhlas',
      kategori: 'Keagamaan',
      pembinaId: 'guru-pem-07',
      jadwalHari: 'Jumat',
      jamMulai: '11:30',
      jamSelesai: '13:00',
      lokasi: 'Masjid SMK Al Amanah',
      kuota: 60,
      status: 'Aktif',
      deskripsi: 'Kajian keislaman, bimbingan akhlak, pembiasaan sholat dhuha, dan kepanitiaan PHBI.',
    },
    {
      id: 'eskul-08',
      namaEskul: 'Palang Merah Remaja (PMR)',
      kategori: 'Kepemimpinan',
      pembinaId: 'guru-koor-01', // Bu Viska
      jadwalHari: 'Senin',
      jamMulai: '15:30',
      jamSelesai: '17:00',
      lokasi: 'Ruang UKS & Lapangan',
      kuota: 45,
      status: 'Aktif',
      deskripsi: 'Pertolongan pertama (PP), evakuasi tandu darurat, donor darah, dan kesiapsiagaan medis sekolah.',
    },
    {
      id: 'eskul-09',
      namaEskul: 'Bola Voli Taruna',
      kategori: 'Olahraga',
      pembinaId: 'guru-pem-08',
      jadwalHari: 'Kamis',
      jamMulai: '15:30',
      jamSelesai: '17:30',
      lokasi: 'Lapangan Voli Outdoor',
      kuota: 40,
      status: 'Aktif',
      deskripsi: 'Latihan servis, smash, passing atas/bawah, dan turnamen bola voli pelajar antar sekolah.',
    },
    {
      id: 'eskul-10',
      namaEskul: 'Badminton Club',
      kategori: 'Olahraga',
      pembinaId: 'guru-pem-09',
      jadwalHari: 'Selasa',
      jamMulai: '15:30',
      jamSelesai: '17:00',
      lokasi: 'GOR Bulutangkis Al Amanah',
      kuota: 35,
      status: 'Aktif',
      deskripsi: 'Latihan teknik dasar bulutangkis, footwork, netting, smash, dan sparring rutin.',
    },
    {
      id: 'eskul-11',
      namaEskul: 'Seni Tari Tradisional',
      kategori: 'Seni & Budaya',
      pembinaId: 'guru-pem-10',
      jadwalHari: 'Rabu',
      jamMulai: '15:30',
      jamSelesai: '17:00',
      lokasi: 'Sanggar Seni Lt. 3',
      kuota: 35,
      status: 'Aktif',
      deskripsi: 'Eksplorasi ragam tari tradisional Nusantara (Jaipong, Saman, Piring) dan kreasi kontemporer.',
    },
    {
      id: 'eskul-12',
      namaEskul: 'Fotografi & Jurnalistik',
      kategori: 'Teknologi',
      pembinaId: 'guru-pem-11',
      jadwalHari: 'Sabtu',
      jamMulai: '08:00',
      jamSelesai: '10:30',
      lokasi: 'Studio Multimedia & Lapangan',
      kuota: 40,
      status: 'Aktif',
      deskripsi: 'Teknik fotografi kamera DSLR/Mirrorless, komposisi visual, jurnalisme sekolah, dan podcast.',
    },
    {
      id: 'eskul-13',
      namaEskul: 'English Debate Club',
      kategori: 'Teknologi',
      pembinaId: 'guru-pem-12',
      jadwalHari: 'Senin',
      jamMulai: '15:30',
      jamSelesai: '17:00',
      lokasi: 'Ruang Multimedia 2',
      kuota: 35,
      status: 'Aktif',
      deskripsi: 'Pengembangan kemampuan debat bahasa Inggris format Asian & British Parliamentary, speech, dan storytelling.',
    },
    {
      id: 'eskul-14',
      namaEskul: 'Japanese Club & Manga',
      kategori: 'Seni & Budaya',
      pembinaId: 'guru-pem-13',
      jadwalHari: 'Jumat',
      jamMulai: '13:30',
      jamSelesai: '15:00',
      lokasi: 'Ruang Bahasa Lt. 2',
      kuota: 35,
      status: 'Aktif',
      deskripsi: 'Belajar bahasa Jepang (Hiragana/Katakana), percakapan dasar kaiwa, origami, dan menggambar manga.',
    },
    {
      id: 'eskul-15',
      namaEskul: 'Desain Komunikasi Visual',
      kategori: 'Teknologi',
      pembinaId: 'guru-pem-14',
      jadwalHari: 'Selasa',
      jamMulai: '15:30',
      jamSelesai: '17:00',
      lokasi: 'Lab Desain Grafis',
      kuota: 40,
      status: 'Aktif',
      deskripsi: 'Pelatihan ilustrasi digital, Photoshop, Illustrator, branding logo, dan animasi 2D.',
    },
    {
      id: 'eskul-16',
      namaEskul: 'Marching Band Gita Amanah',
      kategori: 'Seni & Budaya',
      pembinaId: 'guru-pem-15',
      jadwalHari: 'Sabtu',
      jamMulai: '14:00',
      jamSelesai: '17:00',
      lokasi: 'Plaza & GOR Indoor',
      kuota: 50,
      status: 'Aktif',
      deskripsi: 'Latihan korps musik tiup brass, perkusi pit, color guard, dan drill parade upacara.',
    },
    {
      id: 'eskul-17',
      namaEskul: 'Basket Ball Club',
      kategori: 'Olahraga',
      pembinaId: 'guru-pem-16',
      jadwalHari: 'Rabu',
      jamMulai: '15:30',
      jamSelesai: '17:30',
      lokasi: 'Lapangan Basket Utama',
      kuota: 45,
      status: 'Aktif',
      deskripsi: 'Teknik fundamental bola basket, dribbling, shooting three-point, defence, dan sparring DBL.',
    },
    {
      id: 'eskul-18',
      namaEskul: 'Teater Seni Peran',
      kategori: 'Seni & Budaya',
      pembinaId: 'guru-pem-17',
      jadwalHari: 'Jumat',
      jamMulai: '15:30',
      jamSelesai: '17:30',
      lokasi: 'Panggung Utama SMK Al Amanah',
      kuota: 35,
      status: 'Aktif',
      deskripsi: 'Olah vokal, keaktoran, tata panggung, monolog, dan pementasan drama musikal tahunan.',
    },
  ];

  for (const e of eskulMasterList) {
    await prisma.eskul.create({ data: e });
  }

  console.log(`✅ 18 Cabang Ekstrakurikuler berhasil dibuat dan dipetakan dengan 18 Guru Pembina.`);

  // 6. Generate 800 Data Siswa (10 Siswa Spesifik + 790 Siswa Terdistribusi)
  console.log('⏳ Meng-generate 800 data siswa SMK Al Amanah...');

  const siswaList = [];
  const anggotaList = [];
  const allKelasKeys = Object.keys(kelasMap);

  // A. Tambahkan 10 Siswa Spesifik yang Diberikan Pengguna
  for (let i = 0; i < SPECIFIC_STUDENTS.length; i++) {
    const item = SPECIFIC_STUDENTS[i];
    const siswaId = `sis-${String(i + 1).padStart(3, '0')}`;
    const kelasId = kelasMap[item.kelasNama] || kelasMap['X RPL 1'];

    siswaList.push({
      id: siswaId,
      nis: item.nim, // Memasukkan NIM siswa sebagai NIS & login ID
      nisn: `0064${item.nim.slice(-6)}`,
      passwordHash: 'siswa123',
      namaLengkap: item.nama,
      jenisKelamin: item.gender,
      kelasId,
      noHp: `0812${String(10000000 + i * 11111).slice(0, 8)}`,
      noHpOrtu: `0813${String(20000000 + i * 22222).slice(0, 8)}`,
      alamat: `Jl. Raya Puspiptek No. ${i + 12}, Buaran, Serpong, Tangerang Selatan`,
      avatarUrl: item.gender === 'L'
        ? 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=160&auto=format&fit=crop&q=80'
        : 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=160&auto=format&fit=crop&q=80',
      statusSiswa: 'AKTIF',
      statusAktif: true,
    });

    // Daftarkan keanggotaan eskul untuk 10 siswa spesifik
    for (const eskulId of item.eskuls) {
      anggotaList.push({
        id: `ang-${siswaId}-${eskulId}`,
        eskulId,
        siswaId,
        tahunAjaran: '2026/2027',
        jabatan: i === 0 ? 'KETUA' : i === 1 ? 'WAKIL' : 'ANGGOTA',
        status: 'AKTIF',
      });
    }
  }

  // B. Generate 790 Siswa Tambahan hingga Total 800 Siswa
  const eskulIds = eskulMasterList.map(e => e.id);

  for (let i = 11; i <= 800; i++) {
    const siswaId = `sis-${String(i).padStart(3, '0')}`;
    const gender = i % 2 === 0 ? 'P' : 'L';
    const firstNames = gender === 'L' ? FIRST_NAMES_MALE : FIRST_NAMES_FEMALE;
    
    // Pilih nama depan dan belakang deterministik
    const firstName = firstNames[(i * 17) % firstNames.length];
    const middleName = FIRST_NAMES_MALE[(i * 31) % FIRST_NAMES_MALE.length];
    const lastName = LAST_NAMES[(i * 23) % LAST_NAMES.length];
    const isFarhan = i === 11;
    const namaLengkap = isFarhan
      ? 'Muhammad Farhan Al-Fatih'
      : (i % 3 === 0 ? `${firstName} ${middleName} ${lastName}` : `${firstName} ${lastName}`);

    // NIS format 20241xxx, 20251xxx, 20261xxx
    const angkatan = i <= 280 ? '2026' : i <= 550 ? '2025' : '2024';
    const nis = isFarhan ? '20241001' : `${angkatan}${String(i).padStart(4, '0')}`;
    const nisn = isFarhan ? '20241001' : `00${angkatan.slice(-1)}${String(i * 12345).padStart(7, '0').slice(-7)}`;

    // Petakan ke salah satu dari 27 kelas secara merata
    const kelasNama = isFarhan ? 'X RPL 1' : allKelasKeys[(i - 11) % allKelasKeys.length];
    const kelasId = kelasMap[kelasNama] || kelasMap['X RPL 1'];

    siswaList.push({
      id: siswaId,
      nis,
      nisn,
      passwordHash: isFarhan ? 'al_amanah_001' : 'siswa123',
      namaLengkap,
      jenisKelamin: isFarhan ? 'L' : gender,
      kelasId,
      noHp: `08${(81200000000 + i * 791).toString().slice(0, 10)}`,
      noHpOrtu: `08${(81300000000 + i * 853).toString().slice(0, 10)}`,
      alamat: `Kompleks Perumahan Al Amanah Blok ${String.fromCharCode(65 + (i % 8))}-${(i % 30) + 1}, Tangerang Selatan`,
      avatarUrl: (isFarhan || gender === 'L')
        ? 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=160&auto=format&fit=crop&q=80'
        : 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=160&auto=format&fit=crop&q=80',
      statusSiswa: 'AKTIF',
      statusAktif: true,
    });

    // Setiap siswa mengikuti 1 atau 2 eskul
    const primaryEskulId = isFarhan ? 'eskul-01' : eskulIds[i % eskulIds.length];
    anggotaList.push({
      id: `ang-${siswaId}-${primaryEskulId}`,
      eskulId: primaryEskulId,
      siswaId,
      tahunAjaran: '2026/2027',
      jabatan: i % 45 === 0 ? 'SEKRETARIS' : 'ANGGOTA',
      status: 'AKTIF',
    });

    if (i % 2 === 0) {
      const secondaryEskulId = eskulIds[(i + 5) % eskulIds.length];
      if (secondaryEskulId !== primaryEskulId) {
        anggotaList.push({
          id: `ang-${siswaId}-${secondaryEskulId}`,
          eskulId: secondaryEskulId,
          siswaId,
          tahunAjaran: '2026/2027',
          jabatan: 'ANGGOTA',
          status: 'AKTIF',
        });
      }
    }
  }

  // Insert Siswa dalam batch 50
  const siswaBatches = chunkArray(siswaList, 50);
  for (const batch of siswaBatches) {
    await prisma.siswa.createMany({ data: batch });
  }

  console.log(`✅ ${siswaList.length} Siswa berhasil dimasukkan ke basis data (Termasuk 10 siswa spesifik!).`);

  // Insert Anggota Eskul dalam batch 50
  const anggotaBatches = chunkArray(anggotaList, 50);
  for (const batch of anggotaBatches) {
    await prisma.anggotaEskul.createMany({ data: batch });
  }

  console.log(`✅ ${anggotaList.length} Keanggotaan Eskul berhasil didaftarkan ke basis data.`);

  // 7. Sesi Pertemuan (18 Sesi Hari Ini untuk seluruh cabang eskul)
  const todayStr = new Date().toISOString().slice(0, 10);
  const sesiList = [];

  for (let idx = 0; idx < eskulMasterList.length; idx++) {
    const e = eskulMasterList[idx];
    const isHoliday = idx === 2; // Eskul Hadroh ditandai LIBUR sebagai demonstrasi fitur libur
    const isLocked = idx === 1; // Eskul IT Club ditandai terkunci sebagai demonstrasi history terkunci

    sesiList.push({
      id: `sesi-${String(idx + 1).padStart(2, '0')}`,
      eskulId: e.id,
      pembuatId: e.pembinaId,
      tanggal: todayStr,
      jamMulai: e.jamMulai,
      jamSelesai: e.jamSelesai,
      lokasi: e.lokasi,
      judul: isHoliday
        ? `Latihan Rutin ${e.namaEskul} (Libur Nasional)`
        : `Latihan Rutin Pekanan & Pembekalan ${e.namaEskul}`,
      deskripsi: isHoliday
        ? 'Pertemuan ditiadakan karena bertepatan dengan tanggal merah / libur nasional.'
        : `Materi pemantapan teknik lapangan, kedisiplinan, dan persiapan agenda sekolah.`,
      materi: `Modul Latihan Resmi 2026: ${e.namaEskul}`,
      tokenAktif: `SMK-AMANAH:${e.id}:${Math.floor(Date.now() / 15000)}:${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
      tokenExpiresAt: new Date(Date.now() + 15000),
      status: isHoliday ? 'LIBUR' : isLocked ? 'SELESAI' : 'BERLANGSUNG',
      isLibur: isHoliday,
      alasanLibur: isHoliday ? 'Tanggal Merah Libur Nasional Hari Guru' : null,
      isLocked: isLocked,
      lockedAt: isLocked ? new Date() : null,
    });
  }

  for (const s of sesiList) {
    await prisma.sesiPertemuan.create({ data: s });
  }

  console.log(`✅ 18 Sesi Pertemuan Hari Ini berhasil dibuat (dengan opsi libur & sesi terkunci).`);

  // 8. Log Presensi untuk Sesi Hari Ini (Termasuk 10 Siswa Spesifik)
  const presensiList = [];
  const activeSessionId = 'sesi-01'; // Sesi Futsal

  // Presensi untuk 10 siswa spesifik
  for (let i = 0; i < SPECIFIC_STUDENTS.length; i++) {
    const s = SPECIFIC_STUDENTS[i];
    const siswaId = `sis-${String(i + 1).padStart(3, '0')}`;
    const status = i === 4 ? 'IZIN' : i === 5 ? 'SAKIT' : 'HADIR';

    presensiList.push({
      id: `pres-${siswaId}-${activeSessionId}`,
      sesiId: activeSessionId,
      siswaId: siswaId,
      waktuScan: new Date(new Date().setHours(15, 30 + i * 2, 12, 0)),
      status,
      metode: i % 2 === 0 ? 'DYNAMIC_QR' : 'SCAN_QR_SISWA',
      nilaiKeaktifan: status === 'HADIR' ? 90 + (i % 10) : null,
      ratingKeaktifan: status === 'HADIR' ? (i < 3 ? 'Sangat Baik' : 'Baik') : null,
      keterangan: status === 'IZIN' ? 'Mengikuti olimpiade sains' : status === 'SAKIT' ? 'Demam, istirahat dokter' : 'Hadir tepat waktu dan aktif',
      buktiSurat: status === 'SAKIT' ? 'SURAT-DOKTER-008/RS/X/2026' : null,
      deviceInfo: 'Perangkat Siswa (GPS Kompleks Al Amanah Valid)',
    });
  }

  // Tambahkan 35 presensi lainnya dari siswa acak
  for (let i = 11; i <= 45; i++) {
    const siswaId = `sis-${String(i).padStart(3, '0')}`;
    presensiList.push({
      id: `pres-${siswaId}-${activeSessionId}`,
      sesiId: activeSessionId,
      siswaId,
      waktuScan: new Date(new Date().setHours(15, 35 + (i % 20), (i * 7) % 60, 0)),
      status: 'HADIR',
      metode: 'DYNAMIC_QR',
      nilaiKeaktifan: 85 + (i % 15),
      ratingKeaktifan: i % 3 === 0 ? 'Sangat Baik' : 'Baik',
      keterangan: 'Hadir latihan rutin',
      deviceInfo: 'Perangkat Siswa (GPS Valid)',
    });
  }

  const presensiBatches = chunkArray(presensiList, 50);
  for (const batch of presensiBatches) {
    await prisma.presensi.createMany({ data: batch });
  }

  console.log(`✅ ${presensiList.length} Log Presensi Real-Time berhasil diinisialisasi.`);

  // 9. Pendaftaran Eskul (Untuk menguji Menu Validasi Pendaftaran Siswa & Kuota Pembina)
  const pendaftaranSample = [
    // Calon siswa Menunggu Validasi Koordinator (Batch yang sudah diajukan pembina)
    {
      id: 'reg-01',
      eskulId: 'eskul-01',
      siswaId: 'sis-001',
      tahunAjaran: '2026/2027',
      status: 'MENUNGGU_VALIDASI_KOORDINATOR',
      alasanDaftar: 'Ingin berprestasi di tim futsal sekolah dan membanggakan SMK Al Amanah.',
      catatanPembina: 'Lulus seleksi fisik dan taktik dasar futsal dengan nilai istimewa.',
      diajukanPada: new Date(Date.now() - 3600000 * 2),
    },
    {
      id: 'reg-02',
      eskulId: 'eskul-01',
      siswaId: 'sis-002',
      tahunAjaran: '2026/2027',
      status: 'MENUNGGU_VALIDASI_KOORDINATOR',
      alasanDaftar: 'Memiliki pengalaman turnamen futsal tingkat SMP.',
      catatanPembina: 'Memiliki visi bermain yang bagus dan direkomendasikan masuk roster.',
      diajukanPada: new Date(Date.now() - 3600000 * 2),
    },
    {
      id: 'reg-03',
      eskulId: 'eskul-02',
      siswaId: 'sis-003',
      tahunAjaran: '2026/2027',
      status: 'MENUNGGU_VALIDASI_KOORDINATOR',
      alasanDaftar: 'Tertarik membuat aplikasi web modern dan machine learning.',
      catatanPembina: 'Mampu menguasai dasar coding HTML/CSS/JS dengan cepat.',
      diajukanPada: new Date(Date.now() - 3600000 * 4),
    },
    {
      id: 'reg-04',
      eskulId: 'eskul-05',
      siswaId: 'sis-007',
      tahunAjaran: '2026/2027',
      status: 'MENUNGGU_VALIDASI_KOORDINATOR',
      alasanDaftar: 'Ingin mengabdi menjadi petugas pengibar bendera di upacara kenegaraan.',
      catatanPembina: 'Tinggi badan dan postur sempurna, disiplin tinggi.',
      diajukanPada: new Date(Date.now() - 3600000 * 5),
    },

    // Calon siswa Diterima Pembina (Siap diajukan ke Koordinator)
    {
      id: 'reg-05',
      eskulId: 'eskul-01',
      siswaId: 'sis-004',
      tahunAjaran: '2026/2027',
      status: 'DITERIMA_PEMBINA',
      alasanDaftar: 'Menyalurkan hobi olahraga sepak bola dan futsal.',
      catatanPembina: 'Memenuhi syarat kemampuan dan lolos seleksi pembina.',
    },
    {
      id: 'reg-06',
      eskulId: 'eskul-02',
      siswaId: 'sis-009',
      tahunAjaran: '2026/2027',
      status: 'DITERIMA_PEMBINA',
      alasanDaftar: 'Ingin mendalami UI/UX design dan frontend development.',
      catatanPembina: 'Portofolio desain sangat menjanjikan.',
    },

    // Calon siswa Menunggu Seleksi Pembina
    {
      id: 'reg-07',
      eskulId: 'eskul-01',
      siswaId: 'sis-010',
      tahunAjaran: '2026/2027',
      status: 'MENUNGGU_SELEKSI',
      alasanDaftar: 'Ingin bergabung di eskul futsal bersama teman-teman.',
    },
    {
      id: 'reg-08',
      eskulId: 'eskul-11',
      siswaId: 'sis-005',
      tahunAjaran: '2026/2027',
      status: 'MENUNGGU_SELEKSI',
      alasanDaftar: 'Sangat menyukai seni tari tradisional sejak kecil.',
    },
    {
      id: 'reg-09',
      eskulId: 'eskul-08',
      siswaId: 'sis-006',
      tahunAjaran: '2026/2027',
      status: 'MENUNGGU_SELEKSI',
      alasanDaftar: 'Ingin belajar pertolongan pertama dan medis PMR.',
    },
    {
      id: 'reg-10',
      eskulId: 'eskul-07',
      siswaId: 'sis-008',
      tahunAjaran: '2026/2027',
      status: 'MENUNGGU_SELEKSI',
      alasanDaftar: 'Ingin memperdalam ilmu agama dan kajian dakwah sekolah.',
    },
  ];

  for (const reg of pendaftaranSample) {
    await prisma.pendaftaranEskul.create({ data: reg });
  }

  console.log(`✅ 10 Data Pendaftaran Siswa (berbagai status validasi) berhasil dibuat.`);

  // 10. Pengajuan Jadwal untuk Validasi Jadwal di Sidebar
  await prisma.pengajuanJadwal.createMany({
    data: [
      {
        id: 'prop-01',
        eskulId: 'eskul-01',
        pembinaId: 'guru-pem-01',
        hariLama: 'Kamis',
        jamMulaiLama: '15:30',
        jamSelesaiLama: '17:30',
        lokasiLama: 'Lapangan Futsal SMK Al Amanah',
        hariBaru: 'Sabtu',
        jamMulaiBaru: '15:45',
        jamSelesaiBaru: '17:45',
        lokasiBaru: 'Lapangan Futsal Indoor Utama',
        jenisPerubahan: 'PERMANEN',
        tanggalEfektif: '2026-10-15',
        alasan: 'Menghindari bentrok jadwal pemakaian lapangan outdoor dengan kegiatan ekstrakurikuler voli.',
        status: 'MENUNGGU_VALIDASI',
      },
      {
        id: 'prop-02',
        eskulId: 'eskul-02',
        pembinaId: 'guru-pem-02',
        hariLama: 'Jumat',
        jamMulaiLama: '13:30',
        jamSelesaiLama: '15:30',
        lokasiLama: 'Lab Komputer RPL 1',
        hariBaru: 'Sabtu',
        jamMulaiBaru: '09:00',
        jamSelesaiBaru: '12:00',
        lokasiBaru: 'Lab Komputer RPL 1 & 2',
        jenisPerubahan: 'SEMENTARA',
        tanggalEfektif: '2026-10-20',
        alasan: 'Tambahan jam bimbingan intensif persiapan seleksi Lomba Kompetensi Siswa (LKS) tingkat provinsi.',
        status: 'MENUNGGU_VALIDASI',
      },
      {
        id: 'prop-03',
        eskulId: 'eskul-05',
        pembinaId: 'guru-pem-05',
        hariLama: 'Sabtu',
        jamMulaiLama: '07:30',
        jamSelesaiLama: '10:30',
        lokasiLama: 'Plaza Upacara SMK Al Amanah',
        hariBaru: 'Sabtu',
        jamMulaiBaru: '07:00',
        jamSelesaiBaru: '10:00',
        lokasiBaru: 'Plaza Upacara & Lapangan Utama',
        jenisPerubahan: 'PERMANEN',
        tanggalEfektif: '2026-10-01',
        alasan: 'Penyesuaian jam mulai lebih pagi agar latihan fisik tidak terkena terik matahari siang.',
        status: 'DISETUJUI',
        catatanKoordinator: 'Disetujui. Koordinasi fasilitas plaza upacara telah dikonfirmasi dengan bagian sarpras.',
        diverifikasiOlehId: 'guru-koor-01',
        diverifikasiPada: new Date(Date.now() - 86400000 * 2),
      },
    ],
  });

  console.log(`✅ Data Pengajuan Jadwal Latihan berhasil dibuat.`);

  // 11. Penilaian Rapor Sampel
  const penilaianList = [];
  for (let i = 0; i < SPECIFIC_STUDENTS.length; i++) {
    const sId = `sis-${String(i + 1).padStart(3, '0')}`;
    penilaianList.push({
      id: `pen-${sId}-eskul-01`,
      eskulId: 'eskul-01',
      siswaId: sId,
      penilaiId: 'guru-pem-01',
      semester: 1,
      tahunAjaran: '2026/2027',
      nilaiKehadiran: 95.0,
      nilaiKeaktifan: 92.0,
      ratingKeaktifan: 'Sangat Baik',
      nilaiKinerja: 94.0,
      poinPrestasi: 5.0,
      nilaiAkhir: 94.2,
      predikat: 'A',
      capaianKompetensi: 'Disiplin, memiliki teknik yang sangat baik dan aktif dalam tim.',
    });
  }

  // Tambahkan juga penilaian untuk siswa tes (Muhammad Farhan Al-Fatih / sis-011)
  penilaianList.push({
    id: `pen-sis-011-eskul-01`,
    eskulId: 'eskul-01',
    siswaId: 'sis-011',
    penilaiId: 'guru-pem-01',
    semester: 1,
    tahunAjaran: '2026/2027',
    nilaiKehadiran: 95.0,
    nilaiKeaktifan: 90.0,
    ratingKeaktifan: 'Sangat Baik',
    nilaiKinerja: 90.0,
    poinPrestasi: 5.0,
    nilaiAkhir: 88.0,
    predikat: 'B',
    capaianKompetensi: 'Kehadiran konsisten dan kemampuan teknis lapangan sangat baik.',
  });

  await prisma.penilaian.createMany({ data: penilaianList });
  console.log(`✅ ${penilaianList.length} Catatan Penilaian Rapor berhasil diinisialisasi.`);

  console.log('\n🎉 [SEED SELESAI] Database SMK Al Amanah berhasil disimulasikan secara sungguhan!');
  console.log('   - Total Siswa: 800 (Termasuk 10 siswa spesifik dengan NIM asli)');
  console.log('   - Total Guru: 30 (Termasuk 18 Guru Pembina Eskul)');
  console.log('   - Total Cabang Eskul: 18');
  console.log('   - Total Rombel Kelas: 27');
  console.log('   - Total Sesi Hari Ini: 18 (Dengan opsi Libur & Sesi Terkunci)');
  console.log('   - Pendaftaran Siswa & Pengajuan Jadwal terisi untuk pengujian validasi.');
}

main()
  .catch((e) => {
    console.error('❌ Gagal menjalankan seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
