export type Role = 'ADMIN' | 'PEMBINA' | 'SISWA';

export interface User {
  id: string;
  username: string;
  namaLengkap: string;
  nomorInduk: string; // NIP atau NISN
  role: Role;
  avatarUrl: string;
  spesialisasi?: string;
  kelas?: string;
  statusAktif: boolean;
}

export interface Eskul {
  id: string;
  namaEskul: string;
  pembinaId: string;
  pembinaNama: string;
  pembinaAvatar: string;
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
  pembinaNama: string;
  tanggal: string;
  jamMulai: string;
  jamSelesai: string;
  lokasi: string;
  tokenAktif: string;
  tokenExpiresAt: number; // timestamp
  status: 'BELUM_DIMULAI' | 'BERLANGSUNG' | 'SELESAI';
  totalHadir: number;
  totalSiswa: number;
}

export interface PresensiRecord {
  id: string;
  sesiId: string;
  namaEskul: string;
  siswaId: string;
  namaSiswa: string;
  nisn: string;
  kelas: string;
  waktuScan: string;
  status: 'HADIR' | 'IZIN' | 'SAKIT' | 'ALPA';
  metode: 'DYNAMIC_QR' | 'MANUAL_DISPENSASI';
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
  nilaiKeaktifan: number;  // bobot 30%
  nilaiKinerja: number;    // bobot 30%
  nilaiAkhir: number;
  predikat: 'A' | 'B' | 'C' | 'D';
  catatan: string;
}

export interface StudentProfile extends User {
  enrolledEskulIds: string[];
  kehadiranRataRata: number;
}
