export type Role = 'ADMIN' | 'KOORDINATOR' | 'PEMBINA' | 'WALI_KELAS' | 'SISWA';

export interface User {
  id: string;
  username: string;
  namaLengkap: string;
  nomorInduk: string; // NIP atau NISN
  role: Role;
  avatarUrl: string;
  spesialisasi?: string;
  email?: string;
  noHp?: string;
  kelas?: string;
  statusAktif: boolean;
  eskulDiampu?: { id: string; namaEskul: string }[];
}

export interface Guru {
  id: string;
  namaLengkap: string;
  nip: string;
  username: string;
  noHp?: string;
  email?: string;
  spesialisasi?: string;
  avatarUrl: string;
  isPembina?: boolean;
  isWaliKelas?: boolean;
  role?: Role;
  statusAktif?: boolean;
  eskulDiampu?: { id: string; namaEskul: string; kategori?: string }[];
  kelasWali?: { id: string; namaKelas: string; tingkat?: number; jurusan?: string; _count?: { siswaList: number } }[];
}

export interface Kelas {
  id: string;
  namaKelas: string;
  tingkat: number;
  jurusan: string;
  waliKelasId?: string;
  waliKelas?: Guru;
  _count?: { siswaList: number };
}

export interface Siswa {
  id: string;
  nis?: string;
  nisn?: string;
  nomorInduk?: string;
  username: string;
  defaultPassword?: string;
  namaLengkap: string;
  jenisKelamin?: 'L' | 'P' | string;
  kelas: string;
  kelasId?: string;
  avatarUrl: string;
  statusAktif: boolean;
  enrolledEskulIds: string[];
  kehadiranRataRata: number;
}

// Kompatibilitas StudentProfile dengan User lama
export interface StudentProfile extends Siswa {
  nomorInduk: string; // alias dari NIS
  role: Role;
}

export interface Eskul {
  id: string;
  namaEskul: string;
  pembinaId: string;
  pembinaNama: string;
  pembinaAvatar: string;
  pembinaNip?: string;
  jadwalHari: string;
  jamMulai: string;
  jamSelesai: string;
  lokasi: string;
  kuota: number;
  jumlahSiswa: number;
  kategori: 'Olahraga' | 'Teknologi' | 'Seni & Budaya' | 'Keagamaan' | 'Kepemimpinan';
  status: 'Aktif' | 'Non-Aktif';
  deskripsi: string;
}

export interface SesiPertemuan {
  id: string;
  eskulId: string;
  namaEskul: string;
  pembinaId?: string;
  pembinaNama: string;
  tanggal: string;
  jamMulai: string;
  jamSelesai: string;
  lokasi: string;
  judul?: string;
  deskripsi?: string;
  materi?: string;
  tokenAktif: string;
  tokenExpiresAt: number; // timestamp
  status: 'BELUM_DIMULAI' | 'BERLANGSUNG' | 'SELESAI' | 'LIBUR';
  isLibur?: boolean;
  alasanLibur?: string;
  isLocked?: boolean;
  lockedAt?: string;
  totalHadir: number;
  totalSiswa: number;
}

export interface PengajuanJadwal {
  id: string;
  eskulId: string;
  namaEskul: string;
  kategoriEskul?: string;
  pembinaId: string;
  pembinaNama: string;
  pembinaAvatar?: string;
  pembinaNip?: string;
  hariLama: string;
  jamMulaiLama: string;
  jamSelesaiLama: string;
  lokasiLama: string;
  hariBaru: string;
  jamMulaiBaru: string;
  jamSelesaiBaru: string;
  lokasiBaru?: string;
  jenisPerubahan: 'PERMANEN' | 'SEMENTARA';
  tanggalEfektif?: string;
  alasan: string;
  status: 'MENUNGGU_VALIDASI' | 'DISETUJUI' | 'DITOLAK';
  catatanKoordinator?: string;
  diverifikasiOlehId?: string;
  diverifikasiOlehNama?: string;
  diverifikasiPada?: string;
  verifiedAt?: string;
  verifikatorNama?: string;
  verifikatorId?: string;
  createdAt: string;
}

export interface PendaftaranEskul {
  id: string;
  eskulId: string;
  namaEskul: string;
  kategoriEskul?: string;
  kuotaEskul: number;
  jumlahAnggotaResmi: number;
  totalPendaftarEskul?: number;
  pembinaId?: string;
  pembinaNama: string;
  pembinaAvatar?: string;
  siswaId: string;
  namaSiswa: string;
  nis: string;
  nisn: string;
  kelas: string;
  jenisKelamin: 'L' | 'P' | string;
  avatarUrl?: string;
  eskulLain?: string[];
  tahunAjaran: string;
  status: 'MENUNGGU_SELEKSI' | 'DITERIMA_PEMBINA' | 'MENUNGGU_VALIDASI_KOORDINATOR' | 'RESMI_TERDAFTAR' | 'DITOLAK';
  alasanDaftar?: string;
  catatanPembina?: string;
  catatanKoordinator?: string;
  diajukanPada?: string;
  divalidasiPada?: string;
  createdAt: string;
}

export interface PresensiRecord {
  id: string;
  sesiId: string;
  namaEskul: string;
  siswaId: string;
  namaSiswa: string;
  nisn: string;
  kelas: string;
  avatarUrl?: string;
  waktuScan: string;
  status: 'HADIR' | 'IZIN' | 'SAKIT' | 'ALPA';
  metode: 'DYNAMIC_QR' | 'SCAN_QR_SISWA' | 'SCAN_KARTU_GURU' | 'MANUAL_CHECKLIST' | 'MANUAL_DISPENSASI';
  nilaiKeaktifan?: number;
  ratingKeaktifan?: string;
  buktiSurat?: string;
  keterangan?: string;
  deviceInfo?: string;
}

export interface PenilaianRecord {
  id: string;
  eskulId: string;
  namaEskul: string;
  siswaId: string;
  namaSiswa: string;
  nisn: string;
  kelas: string;
  semester: 1 | 2;
  tahunAjaran: string;
  nilaiKehadiran: number; // bobot 40%
  nilaiKeaktifan: number; // bobot 30%
  nilaiKinerja: number;    // bobot 30%
  nilaiAkhir: number;
  predikat: 'A' | 'B' | 'C' | 'D';
  catatan: string;
}

export interface EskulScheduleItem {
  id: string;
  namaEskul: string;
  pembinaNama: string;
  jamMulai: string;
  jamSelesai: string;
  lokasi: string;
  kategori: string;
  kuota: number;
  jumlahSiswa?: number;
}

export interface WeeklyScheduleDay {
  dayIndex: number;
  dayName: 'Senin' | 'Selasa' | 'Rabu' | 'Kamis' | 'Jumat' | 'Sabtu' | 'Minggu';
  shortDay: 'SEN' | 'SEL' | 'RAB' | 'KAM' | 'JUM' | 'SAB' | 'MIN';
  jumlahEskul: number;
  kehadiranPercent: number;
  isToday: boolean;
  eskulList: EskulScheduleItem[];
  keterangan: string;
}

export interface PrestasiLombaRecord {
  id: string;
  eskulId: string;
  namaEskul?: string;
  siswaId: string;
  namaSiswa?: string;
  nis?: string;
  kelas?: string;
  namaLomba: string;
  penyelenggara?: string;
  tingkat: 'KOTA' | 'PROVINSI' | 'NASIONAL' | 'INTERNASIONAL';
  peringkat: 'JUARA_1' | 'JUARA_2' | 'JUARA_3' | 'HARAPAN_1' | 'FINALIS' | 'PESERTA';
  tanggal: string;
  tahunAjaran: string;
  semester: 1 | 2;
  buktiSertifikat?: string;
  poinTambahan: number;
  keterangan?: string;
  diverifikasi: boolean;
}


