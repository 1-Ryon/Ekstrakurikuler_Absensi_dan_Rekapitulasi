import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = 'file:./dev.db';
}

const prisma = new PrismaClient();

async function clearEskulData() {
  console.log('🧹 [Bersihkan Data Eskul] Menghapus seluruh data ekstrakurikuler dan transaksi terkait...');

  // 1. Hapus transaksi & relasi eskul secara berurutan untuk menjaga integritas data
  const presensi = await prisma.presensi.deleteMany({});
  console.log(`  • Presensi terhapus       : ${presensi.count}`);

  const penilaian = await prisma.penilaian.deleteMany({});
  console.log(`  • Penilaian terhapus      : ${penilaian.count}`);

  const prestasi = await prisma.prestasiLomba.deleteMany({});
  console.log(`  • Prestasi lomba terhapus : ${prestasi.count}`);

  const pengajuan = await prisma.pengajuanJadwal.deleteMany({});
  console.log(`  • Pengajuan jadwal terhapus: ${pengajuan.count}`);

  const pendaftaran = await prisma.pendaftaranEskul.deleteMany({});
  console.log(`  • Pendaftaran terhapus    : ${pendaftaran.count}`);

  const sesi = await prisma.sesiPertemuan.deleteMany({});
  console.log(`  • Sesi pertemuan terhapus : ${sesi.count}`);

  const anggota = await prisma.anggotaEskul.deleteMany({});
  console.log(`  • Anggota eskul terhapus  : ${anggota.count}`);

  const eskul = await prisma.eskul.deleteMany({});
  console.log(`  • Cabang eskul terhapus   : ${eskul.count}`);

  console.log('\n✨ Pembersihan data eskul selesai!');

  // 2. Audit verifikasi data master yang tetap dipertahankan
  const totalAdmin = await prisma.admin.count();
  const totalGuru = await prisma.guru.count();
  const totalPembina = await prisma.guru.count({ where: { isPembina: true } });
  const totalKoordinator = await prisma.guru.count({ where: { role: 'KOORDINATOR' } });
  const totalKelas = await prisma.kelas.count();
  const totalSiswa = await prisma.siswa.count();
  const totalEskul = await prisma.eskul.count();

  console.log('\nRingkasan Data Master yang Dipertahankan:');
  console.log(`  ✓ Data Admin        : ${totalAdmin} akun`);
  console.log(`  ✓ Data Guru         : ${totalGuru} guru`);
  console.log(`  ✓ Data Pembina      : ${totalPembina} pembina`);
  console.log(`  ✓ Data Koordinator  : ${totalKoordinator} koordinator`);
  console.log(`  ✓ Data Kelas/Rombel : ${totalKelas} kelas`);
  console.log(`  ✓ Data Siswa        : ${totalSiswa} siswa`);
  console.log(`  ✓ Data Eskul        : ${totalEskul} eskul (Bersih / Siap diisi eskul baru)`);

  await prisma.$disconnect();
}

clearEskulData().catch((err) => {
  console.error(' GAGAL MEMBERSIHKAN DATA ESKUL:', err);
  process.exit(1);
});
