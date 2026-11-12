import test, { before, after } from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { PrismaClient } from '@prisma/client';
import { generateUserToken } from '../src/middlewares/auth.js';
import { computeFinalScore, calculatePredicate } from '../src/utils/scoring.js';

const BASE_URL = 'http://127.0.0.1:5000/api';
let serverProcess = null;

const ADMIN_TOKEN = generateUserToken({ id: 'adm-01', username: 'admin', role: 'ADMIN', namaLengkap: 'Administrator Sistem' });
const KOOR_TOKEN = generateUserToken({ id: 'guru-koor-01', username: 'koordinator', role: 'KOORDINATOR', namaLengkap: 'Viska Adawiyah' });
const PEMBINA_TOKEN = generateUserToken({ id: 'guru-pem-01', username: 'ahmad.futsal', role: 'PEMBINA', namaLengkap: 'Ahmad Syafii' });
const PEMBINA_WEB_TOKEN = generateUserToken({ id: 'guru-pem-02', username: 'abdul.jabbar', role: 'PEMBINA', namaLengkap: 'Abdul Jabbar' });
const SISWA_TOKEN = generateUserToken({ id: 'sis-001', username: '20241001', role: 'SISWA', namaLengkap: 'Muhammad Farhan' });

before(async () => {
  const prisma = new PrismaClient();

  await prisma.admin.upsert({
    where: { username: 'admin.inactive' },
    update: { statusAktif: false },
    create: {
      id: 'adm-inactive-01',
      username: 'admin.inactive',
      passwordHash: 'admin123',
      namaLengkap: 'Admin Nonaktif',
      statusAktif: false,
      role: 'ADMIN',
    },
  });

  await prisma.eskul.upsert({
    where: { id: 'eskul-01' },
    update: {
      jadwalHari: 'Kamis',
      jamMulai: '15:30',
      jamSelesai: '17:30',
      lokasi: 'Lapangan Futsal SMK Al Amanah',
      status: 'Aktif',
    },
    create: {
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
      deskripsi: 'Pelatihan teknik sepak bola mini, taktik tim, dan persiapan turnamen.',
    },
  });

  await prisma.eskul.upsert({
    where: { id: 'eskul-02' },
    update: {},
    create: {
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
      deskripsi: 'Pengembangan web modern, React, Node.js, UI/UX.',
    },
  });

  await prisma.eskul.upsert({
    where: { id: 'eskul-03' },
    update: {},
    create: {
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
      deskripsi: 'Seni musik perkusi Islami.',
    },
  });

  await prisma.eskul.upsert({
    where: { id: 'eskul-06' },
    update: {},
    create: {
      id: 'eskul-06',
      namaEskul: 'Pramuka Penegak',
      kategori: 'Kepemimpinan',
      pembinaId: 'guru-pem-06',
      jadwalHari: 'Kamis',
      jamMulai: '15:30',
      jamSelesai: '17:30',
      lokasi: 'Lapangan Utama',
      kuota: 60,
      status: 'Aktif',
      deskripsi: 'Kepanduan pramuka wajib dan penegak.',
    },
  });

  const todayStr = new Date().toISOString().slice(0, 10);
  await prisma.sesiPertemuan.upsert({
    where: { id: 'sesi-01' },
    update: { tanggal: todayStr, status: 'BERLANGSUNG' },
    create: {
      id: 'sesi-01',
      eskulId: 'eskul-01',
      pembuatId: 'guru-pem-01',
      tanggal: todayStr,
      jamMulai: '15:30',
      jamSelesai: '17:30',
      lokasi: 'Lapangan Futsal SMK Al Amanah',
      judul: 'Latihan Rutin Pekanan & Pembekalan Futsal',
      deskripsi: 'Materi pemantapan teknik lapangan dan kedisiplinan.',
      materi: 'Modul Latihan Resmi 2026: Futsal Prestasi',
      tokenAktif: 'SMK-AMANAH:sesi-01:12345:TEST',
      status: 'BERLANGSUNG',
    },
  });

  await prisma.pengajuanJadwal.upsert({
    where: { id: 'prop-01' },
    update: { status: 'MENUNGGU_VALIDASI', hariBaru: 'Sabtu' },
    create: {
      id: 'prop-01',
      eskulId: 'eskul-01',
      pembinaId: 'guru-pem-01',
      hariLama: 'Kamis',
      jamMulaiLama: '15:30',
      jamSelesaiLama: '17:30',
      lokasiLama: 'Lapangan Futsal SMK Al Amanah',
      hariBaru: 'Sabtu',
      jamMulaiBaru: '08:00',
      jamSelesaiBaru: '10:30',
      lokasiBaru: 'Lapangan Futsal & Plaza Upacara',
      jenisPerubahan: 'PERMANEN',
      alasan: 'Kondisi cuaca sore sering hujan lebat di hari Kamis.',
      status: 'MENUNGGU_VALIDASI',
    },
  });

  await prisma.pengajuanJadwal.upsert({
    where: { id: 'prop-02' },
    update: {},
    create: {
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
      alasan: 'Persiapan LKS.',
      status: 'MENUNGGU_VALIDASI',
    },
  });

  await prisma.pendaftaranEskul.upsert({
    where: {
      eskulId_siswaId_tahunAjaran: {
        eskulId: 'eskul-01',
        siswaId: 'sis-011',
        tahunAjaran: '2026/2027',
      },
    },
    update: { status: 'MENUNGGU_SELEKSI' },
    create: {
      id: 'pen-test-01',
      eskulId: 'eskul-01',
      siswaId: 'sis-011',
      tahunAjaran: '2026/2027',
      status: 'MENUNGGU_SELEKSI',
      alasanDaftar: 'Mengembangkan minat olahraga futsal.',
    },
  });

  await prisma.$disconnect();

  let isReady = false;
  try {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'admin', password: 'admin123' }),
    });
    if (res.ok) isReady = true;
  } catch {}

  if (!isReady) {
    serverProcess = spawn('node', ['src/server.js'], {
      cwd: process.cwd(),
      stdio: 'pipe',
      detached: false,
    });
    serverProcess.stdout.resume();
    serverProcess.stderr.resume();

    for (let i = 0; i < 40; i++) {
      await new Promise((r) => setTimeout(r, 250));
      try {
        const res = await fetch(`${BASE_URL}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: 'admin', password: 'admin123' }),
        });
        if (res.ok) {
          isReady = true;
          break;
        }
      } catch {}
    }
  }
});

after(async () => {
  if (serverProcess && serverProcess.pid) {
    try {
      if (process.platform === 'win32') {
        const { execSync } = await import('node:child_process');
        execSync(`taskkill /pid ${serverProcess.pid} /T /F`, { stdio: 'ignore' });
      } else {
        serverProcess.kill('SIGTERM');
      }
    } catch {}
  }

  const prisma = new PrismaClient();
  const canonical = Array.from({ length: 18 }, (_, i) => 'sesi-' + String(i + 1).padStart(2, '0'));
  await prisma.presensi.deleteMany({ where: { sesiId: { notIn: canonical } } });
  await prisma.sesiPertemuan.deleteMany({ where: { id: { notIn: canonical } } });
  await prisma.pendaftaranEskul.deleteMany({ where: { id: { startsWith: 'pen-test-' } } });
  await prisma.pengajuanJadwal.deleteMany({ where: { id: { startsWith: 'prop-test-' } } });
  await prisma.admin.deleteMany({ where: { username: 'admin.inactive' } });
  await prisma.siswa.updateMany({ where: { id: 'sis-001' }, data: { kelasId: 'kls-01' } });
  await prisma.$disconnect();
});

test('1. Auth: Admin login returns ADMIN role & Administrator Sistem profile', async () => {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'admin', password: 'admin123' }),
  });
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.success, true);
  assert.equal(data.user.role, 'ADMIN');
  assert.equal(data.user.username, 'admin');
  assert.equal(data.user.namaLengkap, 'Administrator Sistem');
});

test('2. Auth: Koordinator login returns KOORDINATOR role & Viska Adawiyah Zulkarnaen profile', async () => {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'koordinator', password: 'admin123' }),
  });
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.success, true);
  assert.equal(data.user.role, 'KOORDINATOR');
  assert.equal(data.user.username, 'koordinator');
});

test('3. Auth: Wakasek login returns KOORDINATOR role & Drs. H. Mulyadi profile', async () => {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'mulyadi', password: 'admin123' }),
  });
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.success, true);
  assert.equal(data.user.role, 'KOORDINATOR');
  assert.equal(data.user.namaLengkap, 'Drs. H. Mulyadi, M.Pd.');
});

test('4. Auth: Pembina login returns PEMBINA role & Ahmad Syafii profile', async () => {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'ahmad.futsal', password: 'pembina123' }),
  });
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.success, true);
  assert.equal(data.user.role, 'PEMBINA');
  assert.equal(data.user.namaLengkap, 'Ahmad Syafii, S.Pd.');
});

test('5. Auth: Wali Kelas login returns WALI_KELAS role & Siti Nurhaliza profile', async () => {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'walikelas', password: 'walikelas123' }),
  });
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.success, true);
  assert.equal(data.user.role, 'WALI_KELAS');
});

test('6. Auth: Siswa login returns SISWA role & Muhammad Farhan profile', async () => {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: '20241001', password: 'al_amanah_001' }),
  });
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.success, true);
  assert.equal(data.user.role, 'SISWA');
  assert.equal(data.user.namaLengkap, 'Muhammad Farhan Al-Fatih');
});

test('7. Auth: Invalid login returns 401 Unauthorized', async () => {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'unknown_user', password: 'wrongpassword' }),
  });
  assert.equal(res.status, 401);
  const data = await res.json();
  assert.equal(data.success, false);
});

test('8. Master Data: GET /api/stats/dashboard returns valid metrics and schedule', async () => {
  const res = await fetch(`${BASE_URL}/stats/dashboard`);
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.success, true);
  assert.ok(data.stats.totalEskul > 0);
  assert.ok(data.stats.totalSiswa > 0);
  assert.ok(data.stats.totalGuru > 0);
  assert.ok(Array.isArray(data.weeklySchedule));
});

test('9. Master Data: GET /api/pembina returns pembina list directly from guru table', async () => {
  const res = await fetch(`${BASE_URL}/pembina`);
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.success, true);
  assert.ok(Array.isArray(data.data));
  assert.ok(data.data.some(p => p.username === 'ahmad.futsal'));
});

test('10. Master Data: GET /api/guru returns teachers with proper roles and statusAktif', async () => {
  const res = await fetch(`${BASE_URL}/guru`);
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.success, true);
  assert.ok(Array.isArray(data.data));
  const viska = data.data.find(g => g.username === 'koordinator');
  assert.ok(viska);
  assert.equal(viska.role, 'KOORDINATOR');
  assert.equal(viska.statusAktif, true);
});

test('11. Master Data: GET /api/students returns students directly from siswa table', async () => {
  const res = await fetch(`${BASE_URL}/students`);
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.success, true);
  assert.ok(Array.isArray(data.data));
  const farhan = data.data.find(s => s.nis === '20241001');
  assert.ok(farhan);
  assert.equal(farhan.namaLengkap, 'Muhammad Farhan Al-Fatih');
  assert.equal(farhan.statusAktif, true);
});

test('12. Master Data: GET /api/walikelas returns assigned wali kelas', async () => {
  const res = await fetch(`${BASE_URL}/walikelas`);
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.success, true);
  assert.ok(Array.isArray(data.data));
  assert.ok(data.data.length > 0);
});

test('13. Sesi Absensi: GET /api/sessions/today returns judul and deskripsi', async () => {
  const res = await fetch(`${BASE_URL}/sessions/today`);
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.success, true);
  assert.ok(Array.isArray(data.data));
  const futsalSession = data.data.find(s => s.eskulId === 'eskul-01');
  assert.ok(futsalSession);
  assert.ok(futsalSession.judul);
  assert.ok(futsalSession.deskripsi);
});

test('14. Sesi Absensi: POST /api/sessions fails if judul or deskripsi is missing', async () => {
  const res = await fetch(`${BASE_URL}/sessions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${PEMBINA_TOKEN}` },
    body: JSON.stringify({
      eskulId: 'eskul-01',
    }),
  });
  assert.equal(res.status, 400);
  const data = await res.json();
  assert.equal(data.success, false);
  assert.ok(data.message.includes('wajib diisi'));
});

test('15. Sesi Absensi: POST /api/sessions successfully opens attendance with judul & deskripsi', async () => {
  const res = await fetch(`${BASE_URL}/sessions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${PEMBINA_TOKEN}` },
    body: JSON.stringify({
      eskulId: 'eskul-01',
      judul: 'Latihan Dasar Passing Futsal & Shooting',
      deskripsi: 'Hari ini membahas teknik passing akurat dan latihan shooting target 50x.',
      jamMulai: '15:30',
      jamSelesai: '17:30',
      lokasi: 'Lapangan Futsal SMK Al Amanah',
    }),
  });
  assert.ok(res.status === 200 || res.status === 201);
  const data = await res.json();
  assert.equal(data.success, true);
  assert.equal(data.data.judul, 'Latihan Dasar Passing Futsal & Shooting');
  assert.equal(data.data.status, 'BERLANGSUNG');
  assert.ok(data.data.tokenAktif.startsWith('SMK-AMANAH:'));

  const prismaCleanup = new PrismaClient();
  await prismaCleanup.sesiPertemuan.delete({ where: { id: data.data.id } });
  await prismaCleanup.$disconnect();
});

test('16. Jadwal Proposal: GET /api/jadwal-proposals returns proposals with details', async () => {
  const res = await fetch(`${BASE_URL}/jadwal-proposals`);
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.success, true);
  assert.ok(Array.isArray(data.data));
  const prop = data.data.find(p => p.id === 'prop-01');
  assert.ok(prop);
  assert.equal(prop.status, 'MENUNGGU_VALIDASI');
  assert.equal(prop.hariBaru, 'Sabtu');
});

test('17. Jadwal Proposal Workflow: Pembina proposes change & Koordinator validates (approves) it', async () => {
  const createRes = await fetch(`${BASE_URL}/jadwal-proposals`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${PEMBINA_WEB_TOKEN}` },
    body: JSON.stringify({
      eskulId: 'eskul-02',
      pembinaId: 'guru-pem-02',
      hariBaru: 'Jumat',
      jamMulaiBaru: '14:00',
      jamSelesaiBaru: '16:30',
      lokasiBaru: 'Lab Komputer RPL 2',
      jenisPerubahan: 'PERMANEN',
      alasan: 'Upgrade jaringan fiber optic di Lab RPL 2 selesai, lebih kondusif untuk kelas web programming.',
    }),
  });
  assert.equal(createRes.status, 201);
  const createData = await createRes.json();
  assert.equal(createData.success, true);
  const proposalId = createData.data.id;
  assert.equal(createData.data.status, 'MENUNGGU_VALIDASI');

  const validateRes = await fetch(`${BASE_URL}/jadwal-proposals/${proposalId}/validate`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${KOOR_TOKEN}` },
    body: JSON.stringify({
      status: 'DISETUJUI',
      catatanKoordinator: 'Disetujui. Jadwal Lab RPL 2 telah disesuaikan dan dikonfirmasi teknisi.',
      koordinatorId: 'guru-koor-01',
    }),
  });
  assert.equal(validateRes.status, 200);
  const validateData = await validateRes.json();
  assert.equal(validateData.success, true);
  assert.equal(validateData.data.status, 'DISETUJUI');

  const eskulRes = await fetch(`${BASE_URL}/eskul`);
  const eskulData = await eskulRes.json();
  const updatedEskul = eskulData.data.find(e => e.id === 'eskul-02');
  assert.ok(updatedEskul);
  assert.equal(updatedEskul.jadwalHari, 'Jumat');
  assert.equal(updatedEskul.jamMulai, '14:00');
  assert.equal(updatedEskul.jamSelesai, '16:30');
  assert.equal(updatedEskul.lokasi, 'Lab Komputer RPL 2');
});

test('18. Security: OWASP Defensive Security Headers are enforced in responses', async () => {
  const res = await fetch(`${BASE_URL}/health`);
  assert.equal(res.status, 200);
  assert.equal(res.headers.get('x-content-type-options'), 'nosniff');
  assert.equal(res.headers.get('x-frame-options'), 'SAMEORIGIN');
  assert.equal(res.headers.get('x-xss-protection'), '1; mode=block');
  assert.equal(res.headers.get('referrer-policy'), 'strict-origin-when-cross-origin');
});

test('19. Security: Student credential privacy enforces that non-privileged callers receive NO defaultPassword', async () => {
  const pembinaRes = await fetch(`${BASE_URL}/students`, {
    headers: { 'Authorization': `Bearer ${PEMBINA_TOKEN}` },
  });
  assert.equal(pembinaRes.status, 200);
  const pembinaData = await pembinaRes.json();
  assert.ok(pembinaData.data.length > 0);
  assert.equal(pembinaData.data[0].defaultPassword, undefined);

  const adminRes = await fetch(`${BASE_URL}/students`, {
    headers: { 'Authorization': `Bearer ${ADMIN_TOKEN}` },
  });
  assert.equal(adminRes.status, 200);
  const adminData = await adminRes.json();
  assert.ok(adminData.data.length > 0);
  assert.ok(adminData.data[0].defaultPassword.startsWith('al_amanah_'));
});

test('20. Security: Role Authorization Guard rejects unauthorized mutation with 403 Forbidden', async () => {
  const unauthRes = await fetch(`${BASE_URL}/eskul/some-eskul-id`, { method: 'DELETE' });
  assert.equal(unauthRes.status, 401);

  const res = await fetch(`${BASE_URL}/eskul/some-eskul-id`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${PEMBINA_TOKEN}` },
  });
  assert.equal(res.status, 403);
});

test('21. Logic & Validation: Presensi scan rejects empty qrToken or siswaId with 400 Bad Request', async () => {
  const res = await fetch(`${BASE_URL}/presensi/scan`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${SISWA_TOKEN}` },
    body: JSON.stringify({}),
  });
  assert.equal(res.status, 400);
  const data = await res.json();
  assert.equal(data.success, false);
  assert.ok(data.message.includes('wajib disertakan'));
});

test('22. Logic & Calculation: Penilaian auto-clamps score bounds and computes weighted nilaiAkhir & predikat (Kurikulum Merdeka >= 85 -> A)', async () => {
  const res = await fetch(`${BASE_URL}/penilaian`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${PEMBINA_TOKEN}` },
    body: JSON.stringify({
      items: [
        {
          siswaId: '20241001',
          eskulId: 'eskul-01',
          nilaiKehadiran: 95,
          nilaiKeaktifan: 90,
          nilaiKinerja: 90,
          poinPrestasi: 5,
          catatan: 'Kehadiran konsisten dan kemampuan teknis lapangan sangat baik.',
        },
      ],
    }),
  });
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.success, true);

  const getRes = await fetch(`${BASE_URL}/penilaian`);
  const getData = await getRes.json();
  const record = getData.data.find(r => r.nisn === '20241001' && r.eskulId === 'eskul-01');
  assert.ok(record);
  assert.equal(record.nilaiAkhir, 88);
  assert.equal(record.predikat, 'A');
});

test('23. Sesi Absensi: Pembina can mark session as holiday / tanggal merah without faulting students', async () => {
  const res = await fetch(`${BASE_URL}/sessions/mark-holiday`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${PEMBINA_TOKEN}` },
    body: JSON.stringify({
      eskulId: 'eskul-01',
      tanggal: '2026-10-15',
      alasanLibur: 'Hari Libur Nasional Peringatan Hari Guru & Evaluasi Semester',
    }),
  });
  assert.equal(res.status, 201);
  const data = await res.json();
  assert.equal(data.success, true);
  assert.equal(data.data.status, 'LIBUR');
  assert.equal(data.data.isLibur, true);
});

test('24. Sesi Absensi: Multi-stage finalize locks session history and syncs presence with keaktifan score', async () => {
  const openRes = await fetch(`${BASE_URL}/sessions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${PEMBINA_TOKEN}` },
    body: JSON.stringify({
      eskulId: 'eskul-01',
      judul: 'Workshop Passing & Mini Tournament Futsal',
      deskripsi: 'Evaluasi kedisiplinan dan pertandingan internal.',
    }),
  });
  const openData = await openRes.json();
  assert.equal(openData.success, true);
  const sessionId = openData.data.id;

  const finalizeRes = await fetch(`${BASE_URL}/sessions/${sessionId}/finalize`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${PEMBINA_TOKEN}` },
    body: JSON.stringify({
      kehadiran: [
        {
          siswaId: 'sis-01',
          status: 'HADIR',
          nilaiKeaktifan: 95,
          ratingKeaktifan: 'Sangat Baik',
          metode: 'SCAN_QR_SISWA',
        },
        {
          siswaId: 'sis-02',
          status: 'IZIN',
          keterangan: 'Izin mengikuti olimpiade sains',
          buktiSurat: 'Surat Dispensasi Sekolah No. 042/SMK/X/2026',
        },
      ],
      materi: 'Materi selesai dipaparkan dan evaluasi kehadiran tuntas.',
    }),
  });
  assert.equal(finalizeRes.status, 200);
  const finalizeData = await finalizeRes.json();
  assert.equal(finalizeData.success, true);
  assert.equal(finalizeData.data.sesi.status, 'SELESAI');
  assert.equal(finalizeData.data.sesi.isLocked, true);

  const scanAttempt = await fetch(`${BASE_URL}/presensi/scan-student-card`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${PEMBINA_TOKEN}` },
    body: JSON.stringify({
      sesiId: sessionId,
      studentIdOrNis: '20241001',
    }),
  });
  assert.equal(scanAttempt.status, 400);
  const scanData = await scanAttempt.json();
  assert.ok(scanData.message.includes('dikunci'));
});

test('25. Pendaftaran: Pembina selects applicants and submits batch to Koordinator', async () => {
  const listRes = await fetch(`${BASE_URL}/pendaftaran?status=MENUNGGU_SELEKSI`);
  const listData = await listRes.json();
  let pendaftaranId = listData.data?.[0]?.id;
  let eskulId = listData.data?.[0]?.eskulId || 'eskul-01';

  if (!pendaftaranId) {
    const daftarRes = await fetch(`${BASE_URL}/pendaftaran`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${SISWA_TOKEN}` },
      body: JSON.stringify({
        eskulId: 'eskul-01',
        siswaId: 'sis-011',
        alasanDaftar: 'Ingin bergabung futsal.',
      }),
    });
    const daftarData = await daftarRes.json();
    pendaftaranId = daftarData.data?.id;
    eskulId = 'eskul-01';
  }
  assert.ok(pendaftaranId);

  const seleksiRes = await fetch(`${BASE_URL}/pendaftaran/seleksi-pembina`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${PEMBINA_TOKEN}` },
    body: JSON.stringify({
      pendaftaranIds: [pendaftaranId],
      status: 'DITERIMA_PEMBINA',
      catatanPembina: 'Lulus seleksi dasar minat dan bakat.',
    }),
  });
  assert.equal(seleksiRes.status, 200);

  const ajukanRes = await fetch(`${BASE_URL}/pendaftaran/ajukan-koordinator`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${PEMBINA_TOKEN}` },
    body: JSON.stringify({
      eskulId,
      pendaftaranIds: [pendaftaranId],
      catatanPembina: 'Pengajuan resmi siswa baru sesuai batas kuota.',
    }),
  });
  assert.equal(ajukanRes.status, 200);
  const ajukanData = await ajukanRes.json();
  assert.equal(ajukanData.success, true);
  assert.ok(ajukanData.count >= 1);
});

test('26. Pendaftaran: Koordinator validates (approves) and officially enrolls student into AnggotaEskul', async () => {
  const listRes = await fetch(`${BASE_URL}/pendaftaran?status=MENUNGGU_VALIDASI_KOORDINATOR`);
  const listData = await listRes.json();
  assert.equal(listData.success, true);
  assert.ok(listData.data.length > 0);

  const target = listData.data[0];

  const valRes = await fetch(`${BASE_URL}/pendaftaran/validasi-koordinator`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${KOOR_TOKEN}` },
    body: JSON.stringify({
      pendaftaranIds: [target.id],
      aksi: 'SETUJUI',
      catatanKoordinator: 'Disetujui dan disahkan oleh Koordinator Ekstrakurikuler.',
    }),
  });
  assert.equal(valRes.status, 200);
  const valData = await valRes.json();
  assert.equal(valData.success, true);
  assert.equal(valData.count, 1);

  const checkRes = await fetch(`${BASE_URL}/pendaftaran?status=RESMI_TERDAFTAR`);
  const checkData = await checkRes.json();
  const found = checkData.data.find(d => d.id === target.id);
  assert.ok(found);
  assert.equal(found.status, 'RESMI_TERDAFTAR');
});

test('27. Prestasi: View competition records, add new achievement, and delete with bonus calculation', async () => {
  const getRes = await fetch(`${BASE_URL}/prestasi`);
  const getData = await getRes.json();
  assert.equal(getData.success, true);

  const postRes = await fetch(`${BASE_URL}/prestasi`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${PEMBINA_TOKEN}` },
    body: JSON.stringify({
      eskulId: 'eskul-01',
      siswaId: 'sis-001',
      namaLomba: 'Turnamen Futsal Antar Pelajar Se-Jabodetabek 2026',
      penyelenggara: 'Dispora Tangsel',
      tingkat: 'PROVINSI',
      peringkat: 'JUARA_1',
      tanggal: '2026-05-15',
      keterangan: 'Top scorer dengan 7 gol.',
    }),
  });
  assert.equal(postRes.status, 201);
  const postData = await postRes.json();
  assert.equal(postData.success, true);
  const createdId = postData.data.id;

  const delRes = await fetch(`${BASE_URL}/prestasi/${createdId}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${PEMBINA_TOKEN}` },
  });
  assert.equal(delRes.status, 200);
});

test('28. Settings & Geofencing: GET returns configuration and PUT updates coordinates/radius', async () => {
  const getRes = await fetch(`${BASE_URL}/settings`);
  assert.equal(getRes.status, 200);
  const getData = await getRes.json();
  assert.equal(getData.success, true);
  assert.ok(getData.data.schoolLatitude);

  const putRes = await fetch(`${BASE_URL}/settings`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${ADMIN_TOKEN}`,
    },
    body: JSON.stringify({
      geofenceRadius: 150,
      isGeofenceActive: false,
    }),
  });
  assert.equal(putRes.status, 200);
  const putData = await putRes.json();
  assert.equal(putData.success, true);
  assert.equal(putData.data.geofenceRadius, 150);
  assert.equal(putData.data.isGeofenceActive, false);

  // Security: RBAC rejects unauthorized roles (SISWA, PEMBINA) from updating system settings
  const siswaPutRes = await fetch(`${BASE_URL}/settings`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SISWA_TOKEN}`,
    },
    body: JSON.stringify({ geofenceRadius: 999 }),
  });
  assert.equal(siswaPutRes.status, 403);

  const pembinaPutRes = await fetch(`${BASE_URL}/settings`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${PEMBINA_TOKEN}`,
    },
    body: JSON.stringify({ geofenceRadius: 999 }),
  });
  assert.equal(pembinaPutRes.status, 403);
});

test('29. Eskul Membership: Pembina kicks student out of eskul', async () => {
  const eskulRes = await fetch(`${BASE_URL}/eskul`);
  const eskulData = await eskulRes.json();
  const eskul = eskulData.data.find(e => e.id === 'eskul-01') || eskulData.data[0];
  assert.ok(eskul);

  const membersRes = await fetch(`${BASE_URL}/eskul/${eskul.id}/members`);
  const membersData = await membersRes.json();
  
  if (membersData.data && membersData.data.length > 0) {
    const studentToKick = membersData.data[0];
    const kickRes = await fetch(`${BASE_URL}/eskul/${eskul.id}/kick-member`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${PEMBINA_TOKEN}`,
      },
      body: JSON.stringify({
        siswaId: studentToKick.siswaId,
        alasan: 'Indisipliner / Jarang Hadir',
      }),
    });
    assert.equal(kickRes.status, 200);
    const kickData = await kickRes.json();
    assert.equal(kickData.success, true);
    assert.equal(kickData.data.status, 'KELUAR');
  }
});

test('30. Auth: GET /api/auth/me restores active user session upon page reload', async () => {
  const res = await fetch(`${BASE_URL}/auth/me`, {
    headers: { Authorization: `Bearer ${ADMIN_TOKEN}` },
  });
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.success, true);
  assert.equal(data.user.role, 'ADMIN');
  assert.equal(data.user.username, 'admin');
});

test('31. Auth: GET /api/auth/me rejects invalid or expired token with 401 Unauthorized', async () => {
  const res = await fetch(`${BASE_URL}/auth/me`, {
    headers: { Authorization: 'Bearer invalid.token.payload' },
  });
  assert.equal(res.status, 401);
  const data = await res.json();
  assert.equal(data.success, false);
});

test('32. Auth: Login rejects inactive account (statusAktif: false) with 401 Unauthorized', async () => {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'admin.inactive', password: 'admin123' }),
  });
  assert.equal(res.status, 401);
  const data = await res.json();
  assert.equal(data.success, false);
  assert.ok(data.message.includes('non-aktif'));
});

test('33. Security: IDOR Guard strictly prevents Pembina from modifying or opening sessions on another eskul', async () => {
  const openRes = await fetch(`${BASE_URL}/sessions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${PEMBINA_TOKEN}` },
    body: JSON.stringify({
      eskulId: 'eskul-02',
      judul: 'IDOR Exploit Attempt',
      deskripsi: 'Trying to open session on an unassigned eskul',
    }),
  });
  assert.equal(openRes.status, 403);
  const openData = await openRes.json();
  assert.ok(openData.message.includes('bukan pembina resmi'));

  const propRes = await fetch(`${BASE_URL}/jadwal-proposals`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${PEMBINA_TOKEN}` },
    body: JSON.stringify({
      eskulId: 'eskul-02',
      pembinaId: 'guru-pem-01',
      hariBaru: 'Senin',
      jamMulaiBaru: '15:30',
      jamSelesaiBaru: '17:00',
      alasan: 'IDOR attempt on schedule',
    }),
  });
  assert.equal(propRes.status, 403);

  const gradeRes = await fetch(`${BASE_URL}/penilaian`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${PEMBINA_TOKEN}` },
    body: JSON.stringify({
      items: [{ eskulId: 'eskul-02', siswaId: '20241001', nilaiKehadiran: 100 }],
    }),
  });
  assert.equal(gradeRes.status, 403);

  const kickRes = await fetch(`${BASE_URL}/eskul/eskul-02/kick-member`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${PEMBINA_TOKEN}` },
    body: JSON.stringify({ siswaId: 'sis-001', alasan: 'Unauthorized kick' }),
  });
  assert.equal(kickRes.status, 403);
});

test('34. Logic: Schedule conflict detection rejects overlapping schedule at the same day & location', async () => {
  const res = await fetch(`${BASE_URL}/jadwal-proposals`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${PEMBINA_WEB_TOKEN}` },
    body: JSON.stringify({
      eskulId: 'eskul-02',
      pembinaId: 'guru-pem-02',
      hariBaru: 'Kamis',
      jamMulaiBaru: '16:00',
      jamSelesaiBaru: '18:00',
      lokasiBaru: 'Lapangan Futsal SMK Al Amanah',
      alasan: 'Latihan outdoor bersama tim futsal.',
    }),
  });
  assert.equal(res.status, 400);
  const data = await res.json();
  assert.equal(data.success, false);
  assert.ok(data.message.includes('Konflik Jadwal'));
});

test('35. Logic: Dynamic Rolling QR Token window tolerance & anti-replay verification', async () => {
  const prisma = new PrismaClient();
  const todayStr = new Date().toISOString().slice(0, 10);
  await prisma.sesiPertemuan.update({
    where: { id: 'sesi-01' },
    data: { tanggal: todayStr, status: 'BERLANGSUNG', isLocked: false, lockedAt: null },
  });
  const farhan = await prisma.siswa.findFirst({ where: { OR: [{ id: 'sis-011' }, { nis: '20241001' }] } });
  if (farhan) {
    await prisma.presensi.deleteMany({ where: { sesiId: 'sesi-01', siswaId: farhan.id } });
  }
  await prisma.$disconnect();

  const currentWindow = Math.floor(Date.now() / 15000);
  const tokenCurrent = `SMK-AMANAH:sesi-01:${currentWindow}:A1B2C3`;
  const tokenExpired = `SMK-AMANAH:sesi-01:${currentWindow - 3}:EX1234`;

  const res0 = await fetch(`${BASE_URL}/presensi/scan`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${SISWA_TOKEN}` },
    body: JSON.stringify({
      qrToken: tokenCurrent,
      siswaId: '20241001',
      lat: -6.34215,
      lng: 106.71124,
    }),
  });
  if (res0.status !== 200) {
    const errBody = await res0.clone().text();
    console.error('TEST 35 FAILED WITH:', res0.status, errBody);
  }
  assert.equal(res0.status, 200);

  const resExpired = await fetch(`${BASE_URL}/presensi/scan`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${SISWA_TOKEN}` },
    body: JSON.stringify({
      qrToken: tokenExpired,
      siswaId: 'sis-002',
      lat: -6.34215,
      lng: 106.71124,
    }),
  });
  assert.equal(resExpired.status, 400);
  const dataExpired = await resExpired.json();
  assert.equal(dataExpired.message, 'Kode QR Kedaluwarsa, silakan scan ulang QR terbaru pada layar pembina.');
});

test('36. Logic: One Scan Per Session Guard rejects duplicate presence after HADIR', async () => {
  const currentWindow = Math.floor(Date.now() / 15000);
  const token = `SMK-AMANAH:sesi-01:${currentWindow}:REP123`;

  const duplicateRes = await fetch(`${BASE_URL}/presensi/scan`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${SISWA_TOKEN}` },
    body: JSON.stringify({
      qrToken: token,
      siswaId: '20241001',
      lat: -6.34215,
      lng: 106.71124,
    }),
  });
  assert.equal(duplicateRes.status, 400);
  const data = await duplicateRes.json();
  assert.equal(data.isDuplicate, true);
  assert.ok(data.message.includes('sudah tercatat HADIR'));
});

test('37. Logic: Geofencing GPS enforcement validates radius and rejects missing or out-of-range coordinates', async () => {
  // Ensure geofencing is temporarily active for this validation test
  await fetch(`${BASE_URL}/settings`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${ADMIN_TOKEN}` },
    body: JSON.stringify({ isGeofenceActive: true, geofenceRadius: 150 }),
  });

  try {
    const currentWindow = Math.floor(Date.now() / 15000);
    const token = `SMK-AMANAH:sesi-01:${currentWindow}:GEO123`;

    const resMissing = await fetch(`${BASE_URL}/presensi/scan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${SISWA_TOKEN}` },
      body: JSON.stringify({
        qrToken: token,
        siswaId: 'sis-003',
      }),
    });
    assert.equal(resMissing.status, 400);
    const dataMissing = await resMissing.json();
    assert.ok(dataMissing.message.includes('Koordinat GPS lokasi perangkat wajib'));

    const resOutside = await fetch(`${BASE_URL}/presensi/scan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${SISWA_TOKEN}` },
      body: JSON.stringify({
        qrToken: token,
        siswaId: 'sis-003',
        lat: -6.35000,
        lng: 106.72000,
      }),
    });
    assert.equal(resOutside.status, 403);
    const dataOutside = await resOutside.json();
    assert.ok(dataOutside.message.includes('di luar area SMK Al Amanah'));
  } finally {
    // Restore geofencing back to disabled so manual testing remains uninterrupted
    await fetch(`${BASE_URL}/settings`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${ADMIN_TOKEN}` },
      body: JSON.stringify({ isGeofenceActive: false }),
    });
  }
});

test('38. Mode B Presensi: POST /api/presensi/teacher-scan allows Pembina to scan student digital ID card', async () => {
  const res = await fetch(`${BASE_URL}/presensi/teacher-scan`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${PEMBINA_TOKEN}` },
    body: JSON.stringify({
      sesiId: 'sesi-01',
      studentIdOrNis: '20241002',
      pembinaId: 'guru-pem-01',
    }),
  });
  assert.ok([200, 201].includes(res.status));
  const data = await res.json();
  assert.equal(data.success, true);
  assert.equal(data.data.status, 'HADIR');
  assert.equal(data.data.metode, 'SCAN_QR_SISWA');
});

test('39. Logic & Calculation: Boundary Value Analysis for Kurikulum Merdeka grading', () => {
  const score85 = computeFinalScore({ nilaiKehadiran: 100, nilaiKeaktifan: 90, nilaiKinerja: 90, poinPrestasi: 0 });
  assert.equal(score85.nilaiAkhir, 85.0);
  assert.equal(score85.predikat, 'A');
  assert.equal(calculatePredicate(85.0), 'A');

  assert.equal(calculatePredicate(84.99), 'B');
  assert.equal(calculatePredicate(75.0), 'B');

  assert.equal(calculatePredicate(74.99), 'C');
  assert.equal(calculatePredicate(65.0), 'C');

  assert.equal(calculatePredicate(64.99), 'D');

  const scoreOver100 = computeFinalScore({ nilaiKehadiran: 100, nilaiKeaktifan: 100, nilaiKinerja: 100, poinPrestasi: 15 });
  assert.equal(scoreOver100.nilaiAkhir, 100.0);
  assert.equal(scoreOver100.predikat, 'A');
});

test('40. Pendaftaran: Single validation PATCH /api/pendaftaran/:id/validate & quota enforcement', async () => {
  const prisma = new PrismaClient();
  const testEskulName = 'Eskul Kuota Test ' + Date.now();
  await prisma.pendaftaranEskul.deleteMany({ where: { eskul: { namaEskul: { startsWith: 'Eskul Kuota' } } } });
  await prisma.anggotaEskul.deleteMany({ where: { eskul: { namaEskul: { startsWith: 'Eskul Kuota' } } } });
  await prisma.eskul.deleteMany({ where: { namaEskul: { startsWith: 'Eskul Kuota' } } });

  const testEskul = await prisma.eskul.create({
    data: {
      namaEskul: testEskulName,
      pembinaId: 'guru-pem-01',
      jadwalHari: 'Selasa',
      jamMulai: '15:30',
      jamSelesai: '17:00',
      lokasi: 'Ruang Teori 1',
      kuota: 1,
    },
  });

  try {
    const reg1 = await prisma.pendaftaranEskul.create({
      data: {
        eskulId: testEskul.id,
        siswaId: 'sis-001',
        tahunAjaran: '2026/2027',
        status: 'MENUNGGU_VALIDASI_KOORDINATOR',
      },
    });

    const reg2 = await prisma.pendaftaranEskul.create({
      data: {
        eskulId: testEskul.id,
        siswaId: 'sis-002',
        tahunAjaran: '2026/2027',
        status: 'MENUNGGU_VALIDASI_KOORDINATOR',
      },
    });

    const res1 = await fetch(`${BASE_URL}/pendaftaran/${reg1.id}/validate`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${KOOR_TOKEN}` },
      body: JSON.stringify({ aksi: 'SETUJUI' }),
    });
    assert.equal(res1.status, 200);

    const res2 = await fetch(`${BASE_URL}/pendaftaran/${reg2.id}/validate`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${KOOR_TOKEN}` },
      body: JSON.stringify({ aksi: 'SETUJUI' }),
    });
    assert.equal(res2.status, 400);
    const data2 = await res2.json();
    assert.ok(data2.message.includes('melebihi kuota'));
  } finally {
    await prisma.pendaftaranEskul.deleteMany({ where: { eskulId: testEskul.id } });
    await prisma.anggotaEskul.deleteMany({ where: { eskulId: testEskul.id } });
    await prisma.eskul.delete({ where: { id: testEskul.id } });
    await prisma.$disconnect();
  }
});

test('41. Security: File upload vulnerability guard blocks malicious files (.php, .exe) and accepts valid .pdf/.png', async () => {
  const phpBlob = new Blob(['<?php phpinfo(); ?>'], { type: 'application/x-php' });
  const phpForm = new FormData();
  phpForm.append('file', phpBlob, 'shell.php');

  const phpRes = await fetch(`${BASE_URL}/upload`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${PEMBINA_TOKEN}` },
    body: phpForm,
  });
  assert.equal(phpRes.status, 400);
  const phpData = await phpRes.json();
  assert.ok(phpData.message.includes('dilarang'));

  const pdfBlob = new Blob(['%PDF-1.4 test document content'], { type: 'application/pdf' });
  const pdfForm = new FormData();
  pdfForm.append('file', pdfBlob, 'surat_izin_resmi.pdf');

  const pdfRes = await fetch(`${BASE_URL}/upload`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${PEMBINA_TOKEN}` },
    body: pdfForm,
  });
  assert.equal(pdfRes.status, 201);
  const pdfData = await pdfRes.json();
  assert.equal(pdfData.success, true);
  assert.ok(pdfData.data.fileUrl.startsWith('/uploads/'));
});

test('42. Security: CORS whitelist blocks unauthorized origin (https://evil-attacker.com)', async () => {
  const res = await fetch(`${BASE_URL}/health`, {
    headers: {
      Origin: 'https://evil-attacker.com',
    },
  });
  assert.equal(res.status, 403);
  const data = await res.json();
  assert.ok(data.message.includes('CORS'));
});

test('43. Sesi Absensi: Auto-finalize past sessions converts past sessions from BERLANGSUNG to SELESAI & isLocked', async () => {
  const prisma = new PrismaClient();
  const pastSession = await prisma.sesiPertemuan.create({
    data: {
      eskulId: 'eskul-01',
      tanggal: '2026-01-01',
      jamMulai: '15:30',
      jamSelesai: '17:30',
      judul: 'Sesi Masa Lalu',
      deskripsi: 'Sesi yang lupa ditutup tahun lalu',
      status: 'BERLANGSUNG',
      isLocked: false,
    },
  });

  const res = await fetch(`${BASE_URL}/sessions/today`);
  assert.equal(res.status, 200);

  const checked = await prisma.sesiPertemuan.findUnique({ where: { id: pastSession.id } });
  assert.equal(checked.status, 'SELESAI');
  assert.equal(checked.isLocked, true);

  await prisma.sesiPertemuan.delete({ where: { id: pastSession.id } });
  await prisma.$disconnect();
});

test('44. Jadwal Proposal: Admin can reject schedule proposal with persistence across database reload', async () => {
  const createRes = await fetch(`${BASE_URL}/jadwal-proposals`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${PEMBINA_TOKEN}` },
    body: JSON.stringify({
      eskulId: 'eskul-01',
      pembinaId: 'guru-pem-01',
      hariBaru: 'Selasa',
      jamMulaiBaru: '15:00',
      jamSelesaiBaru: '17:00',
      lokasiBaru: 'Lapangan Futsal Barat',
      jenisPerubahan: 'SEMENTARA',
      alasan: 'Uji coba penolakan oleh administrator sistem',
    }),
  });
  assert.equal(createRes.status, 201);
  const createData = await createRes.json();
  const proposalId = createData.data.id;
  assert.equal(createData.data.status, 'MENUNGGU_VALIDASI');

  const rejectRes = await fetch(`${BASE_URL}/jadwal-proposals/${proposalId}/validate`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${ADMIN_TOKEN}` },
    body: JSON.stringify({
      status: 'DITOLAK',
      catatanKoordinator: 'Ditolak: bentrok dengan kegiatan upacara.',
    }),
  });
  assert.equal(rejectRes.status, 200);
  const rejectData = await rejectRes.json();
  assert.equal(rejectData.success, true);
  assert.equal(rejectData.data.status, 'DITOLAK');

  const listRes = await fetch(`${BASE_URL}/jadwal-proposals`);
  assert.equal(listRes.status, 200);
  const listData = await listRes.json();
  const persistedProp = listData.data.find(p => p.id === proposalId);
  assert.ok(persistedProp);
  assert.equal(persistedProp.status, 'DITOLAK');
  assert.equal(persistedProp.catatanKoordinator, 'Ditolak: bentrok dengan kegiatan upacara.');
  assert.ok(persistedProp.diverifikasiPada);
});

test('45. Auth: Login with Admin UI displayed formula credentials works seamlessly', async () => {
  // 1. Pembina using pembina_ahmad.futsal
  const pembinaRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'ahmad.futsal', password: 'pembina_ahmad.futsal' }),
  });
  assert.equal(pembinaRes.status, 200);
  const pembinaData = await pembinaRes.json();
  assert.equal(pembinaData.success, true);
  assert.equal(pembinaData.user.role, 'PEMBINA');

  // 2. Wali Kelas using guru_walikelas
  const waliRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'walikelas', password: 'guru_walikelas' }),
  });
  assert.equal(waliRes.status, 200);
  const waliData = await waliRes.json();
  assert.equal(waliData.success, true);
  assert.equal(waliData.user.role, 'WALI_KELAS');

  // 3. Student using al_amanah_049
  const studentRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: '241011400049', password: 'al_amanah_049' }),
  });
  assert.equal(studentRes.status, 200);
  const studentData = await studentRes.json();
  assert.equal(studentData.success, true);
  assert.equal(studentData.user.role, 'SISWA');
});

test('46. Auth & Profile: PUT /api/auth/profile updates user contact info and persists', async () => {
  const updateRes = await fetch(`${BASE_URL}/auth/profile`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SISWA_TOKEN}`,
    },
    body: JSON.stringify({
      email: 'muhammad.farhan@smk-alamanah.sch.id',
      noHp: '081299998888',
    }),
  });
  assert.equal(updateRes.status, 200);
  const data = await updateRes.json();
  assert.equal(data.success, true);
  assert.equal(data.user.email, 'muhammad.farhan@smk-alamanah.sch.id');
  assert.equal(data.user.noHp, '081299998888');

  // Verify GET /api/auth/me also returns updated contact
  const meRes = await fetch(`${BASE_URL}/auth/me`, {
    headers: { 'Authorization': `Bearer ${SISWA_TOKEN}` },
  });
  assert.equal(meRes.status, 200);
  const meData = await meRes.json();
  assert.equal(meData.user.email, 'muhammad.farhan@smk-alamanah.sch.id');
  assert.equal(meData.user.noHp, '081299998888');
});

test('47. Master Data: POST /api/students/batch-update-class promotes students to new class', async () => {
  // Promote sis-001 to kls-01
  const promoteRes = await fetch(`${BASE_URL}/students/batch-update-class`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${ADMIN_TOKEN}`,
    },
    body: JSON.stringify({
      studentIds: ['sis-001'],
      targetKelasId: 'kls-01',
    }),
  });
  assert.equal(promoteRes.status, 200);
  const promoteData = await promoteRes.json();
  assert.equal(promoteData.success, true);
  assert.equal(promoteData.count, 1);
});

test('48. Pendaftaran: Student registration enforces maximum 2 active eskuls limit', async () => {
  const prisma = new PrismaClient();
  // Ensure sis-001 has 2 active eskuls
  await prisma.anggotaEskul.upsert({
    where: { eskulId_siswaId_tahunAjaran: { eskulId: 'eskul-01', siswaId: 'sis-001', tahunAjaran: '2026/2027' } },
    update: { status: 'AKTIF' },
    create: { id: 'ang-test-01', eskulId: 'eskul-01', siswaId: 'sis-001', tahunAjaran: '2026/2027', status: 'AKTIF' },
  });
  await prisma.anggotaEskul.upsert({
    where: { eskulId_siswaId_tahunAjaran: { eskulId: 'eskul-02', siswaId: 'sis-001', tahunAjaran: '2026/2027' } },
    update: { status: 'AKTIF' },
    create: { id: 'ang-test-02', eskulId: 'eskul-02', siswaId: 'sis-001', tahunAjaran: '2026/2027', status: 'AKTIF' },
  });

  // Now sis-001 tries to register for eskul-03 (3rd eskul)
  const res = await fetch(`${BASE_URL}/pendaftaran`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SISWA_TOKEN}`,
    },
    body: JSON.stringify({
      eskulId: 'eskul-03',
      siswaId: 'sis-001',
      alasanDaftar: 'Mau coba eskul ketiga.',
    }),
  });

  assert.equal(res.status, 400);
  const data = await res.json();
  assert.equal(data.success, false);
  assert.match(data.message, /maksimal.*2/i);

  // Clean up test membership
  await prisma.anggotaEskul.deleteMany({ where: { id: { in: ['ang-test-01', 'ang-test-02'] } } });
  await prisma.$disconnect();
});

test('49. Master Data: POST /api/students supports single and small-batch student creation', async () => {
  const prisma = new PrismaClient();
  const testNisSingle = 'TEST_NIS_' + Date.now().toString().slice(-6);

  // 1. Test single student creation
  const resSingle = await fetch(`${BASE_URL}/students`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${ADMIN_TOKEN}`,
    },
    body: JSON.stringify({
      nis: testNisSingle,
      namaLengkap: 'Siswa Uji Satuan',
      kelas: 'X RPL 1',
      jenisKelamin: 'L',
      noHp: '081299990001',
    }),
  });

  assert.equal(resSingle.status, 201);
  const dataSingle = await resSingle.json();
  assert.equal(dataSingle.success, true);
  assert.equal(dataSingle.data.nis, testNisSingle);
  assert.equal(dataSingle.data.namaLengkap, 'Siswa Uji Satuan');

  // 2. Test small-batch student creation
  const testNisBatch1 = 'BATCH_' + (Date.now() + 1).toString().slice(-6);
  const testNisBatch2 = 'BATCH_' + (Date.now() + 2).toString().slice(-6);

  const resBatch = await fetch(`${BASE_URL}/students`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${ADMIN_TOKEN}`,
    },
    body: JSON.stringify({
      students: [
        { nis: testNisBatch1, namaLengkap: 'Siswa Batch 1', kelas: 'X RPL 1', jenisKelamin: 'L' },
        { nis: testNisBatch2, namaLengkap: 'Siswa Batch 2', kelas: 'X RPL 2', jenisKelamin: 'P' },
      ],
    }),
  });

  assert.equal(resBatch.status, 201);
  const dataBatch = await resBatch.json();
  assert.equal(dataBatch.success, true);
  assert.equal(dataBatch.count, 2);

  // Clean up
  await prisma.siswa.deleteMany({
    where: { nis: { in: [testNisSingle, testNisBatch1, testNisBatch2] } },
  });
  await prisma.$disconnect();
});
