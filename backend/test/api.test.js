import test from 'node:test';
import assert from 'node:assert/strict';

const BASE_URL = 'http://localhost:5000/api';

test('1. Auth: Admin login returns ADMIN role & Administrator Sistem profile (not Viska)', async () => {
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
  assert.notEqual(data.user.namaLengkap, 'Viska Adawiyah Zulkarnaen, S.Pd.');
  assert.ok(data.user.spesialisasi.includes('Super Administrator'));
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
  assert.equal(data.user.namaLengkap, 'Viska Adawiyah Zulkarnaen, S.Pd.');
  assert.equal(data.user.spesialisasi, 'Koordinator Ekstrakurikuler Utama');
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
  assert.equal(data.user.namaLengkap, 'Siti Nurhaliza, M.Pd.');
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
  assert.equal(data.user.kelas, 'X RPL 1');
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
  assert.ok(data.data.length > 0);
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
  assert.ok(data.data.length > 0);
  const futsalSession = data.data.find(s => s.eskulId === 'eskul-01');
  assert.ok(futsalSession);
  assert.ok(futsalSession.judul);
  assert.ok(futsalSession.deskripsi);
});

test('14. Sesi Absensi: POST /api/sessions fails if judul or deskripsi is missing', async () => {
  const res = await fetch(`${BASE_URL}/sessions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      eskulId: 'eskul-03',
      // missing judul and deskripsi
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
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      eskulId: 'eskul-03',
      judul: 'Latihan Dasar Passing Bawah & Service Atas',
      deskripsi: 'Hari ini membahas teknik kuda-kuda, latihan passing bawah berpasangan 50x, dan latihan akurasi servis atas.',
      jamMulai: '15:30',
      jamSelesai: '17:30',
      lokasi: 'Lapangan Voli Outdoor',
    }),
  });
  assert.equal(res.status, 201);
  const data = await res.json();
  assert.equal(data.success, true);
  assert.equal(data.data.judul, 'Latihan Dasar Passing Bawah & Service Atas');
  assert.ok(data.data.deskripsi.includes('passing bawah berpasangan'));
  assert.equal(data.data.status, 'BERLANGSUNG');
  assert.ok(data.data.tokenAktif.startsWith('SMK-AMANAH:'));
});

test('16. Jadwal Proposal: GET /api/jadwal-proposals returns proposals with details', async () => {
  const res = await fetch(`${BASE_URL}/jadwal-proposals`);
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.success, true);
  assert.ok(Array.isArray(data.data));
  assert.ok(data.data.length >= 2);
  const prop = data.data.find(p => p.id === 'prop-01');
  assert.ok(prop);
  assert.equal(prop.status, 'MENUNGGU_VALIDASI');
  assert.equal(prop.hariBaru, 'Sabtu');
});

test('17. Jadwal Proposal Workflow: Pembina proposes change & Koordinator validates (approves) it', async () => {
  // 1. Pembina submits proposal for eskul-02 (Computer & Web Club)
  const createRes = await fetch(`${BASE_URL}/jadwal-proposals`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      eskulId: 'eskul-02',
      pembinaId: 'guru-pem-01',
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

  // 2. Koordinator validates (approves) the proposal
  const validateRes = await fetch(`${BASE_URL}/jadwal-proposals/${proposalId}/validate`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
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

  // 3. Verify that the master Eskul record was automatically updated
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
  // A. Pembina / Siswa / Unprivileged caller: defaultPassword is NOT exposed
  const pembinaRes = await fetch(`${BASE_URL}/students`, {
    headers: { 'X-User-Role': 'PEMBINA' },
  });
  assert.equal(pembinaRes.status, 200);
  const pembinaData = await pembinaRes.json();
  assert.ok(pembinaData.data.length > 0);
  assert.equal(pembinaData.data[0].defaultPassword, undefined);

  // B. Admin / Koordinator caller: defaultPassword is provided for administrative card printing
  const adminRes = await fetch(`${BASE_URL}/students`, {
    headers: { 'X-User-Role': 'ADMIN' },
  });
  assert.equal(adminRes.status, 200);
  const adminData = await adminRes.json();
  assert.ok(adminData.data.length > 0);
  assert.ok(adminData.data[0].defaultPassword.startsWith('al_amanah_'));
});

test('20. Security: Role Authorization Guard rejects unauthorized mutation with 403 Forbidden', async () => {
  // Pembina trying to delete an eskul or validate a proposal should get 403 Forbidden
  const res = await fetch(`${BASE_URL}/eskul/some-eskul-id`, {
    method: 'DELETE',
    headers: { 'X-User-Role': 'PEMBINA' },
  });
  assert.equal(res.status, 403);
  const data = await res.json();
  assert.equal(data.success, false);
  assert.ok(data.message.includes('Akses ditolak'));
});

test('21. Logic & Validation: Presensi scan rejects empty qrToken or siswaId with 400 Bad Request', async () => {
  const res = await fetch(`${BASE_URL}/presensi/scan`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      // missing qrToken and siswaId
    }),
  });
  assert.equal(res.status, 400);
  const data = await res.json();
  assert.equal(data.success, false);
  assert.ok(data.message.includes('wajib disertakan'));
});

test('22. Logic & Calculation: Penilaian auto-clamps score bounds and computes weighted nilaiAkhir & predikat', async () => {
  const res = await fetch(`${BASE_URL}/penilaian`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-User-Role': 'PEMBINA' },
    body: JSON.stringify({
      items: [
        {
          siswaId: '20241001',
          eskulId: 'eskul-01',
          nilaiKehadiran: 95, // 95 * 0.4 = 38
          nilaiKeaktifan: 90, // 90 * 0.25 = 22.5
          nilaiKinerja: 90,   // 90 * 0.25 = 22.5
          poinPrestasi: 5,    // 5
          // total: 38 + 22.5 + 22.5 + 5 = 88 (Predikat B)
          catatan: 'Kehadiran konsisten dan kemampuan teknis lapangan sangat baik.',
        },
      ],
    }),
  });
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.success, true);

  // Check saved record
  const getRes = await fetch(`${BASE_URL}/penilaian`);
  const getData = await getRes.json();
  const record = getData.data.find(r => r.nisn === '20241001' && r.eskulId === 'eskul-01');
  assert.ok(record);
  assert.equal(record.nilaiAkhir, 88);
  assert.equal(record.predikat, 'B');
});

test('23. Sesi Absensi: Pembina can mark session as holiday / tanggal merah without faulting students', async () => {
  const res = await fetch(`${BASE_URL}/sessions/mark-holiday`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-User-Role': 'PEMBINA' },
    body: JSON.stringify({
      eskulId: 'eskul-03', // Robotik
      tanggal: '2026-10-15',
      alasanLibur: 'Hari Libur Nasional Peringatan Hari Guru & Evaluasi Semester',
    }),
  });
  assert.equal(res.status, 201);
  const data = await res.json();
  assert.equal(data.success, true);
  assert.equal(data.data.status, 'LIBUR');
  assert.equal(data.data.isLibur, true);
  assert.ok(data.data.alasanLibur.includes('Hari Libur Nasional'));
});

test('24. Sesi Absensi: Multi-stage finalize locks session history and syncs presence with keaktifan score', async () => {
  // 1. Buka sesi baru
  const openRes = await fetch(`${BASE_URL}/sessions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-User-Role': 'PEMBINA' },
    body: JSON.stringify({
      eskulId: 'eskul-02',
      judul: 'Workshop Web API & Dynamic QR',
      deskripsi: 'Praktik integrasi REST API dan implementasi scanner QR.',
    }),
  });
  const openData = await openRes.json();
  assert.equal(openData.success, true);
  const sessionId = openData.data.id;

  // 2. Finalize presensi dengan multi-tahap (Hadir dengan nilai keaktifan, Izin dengan surat keterangan)
  const finalizeRes = await fetch(`${BASE_URL}/sessions/${sessionId}/finalize`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-User-Role': 'PEMBINA' },
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
  assert.equal(finalizeData.data.summary.countHadir, 1);
  assert.equal(finalizeData.data.summary.countIzin, 1);

  // 3. Verifikasi sesi terkunci tidak dapat discan lagi
  const scanAttempt = await fetch(`${BASE_URL}/presensi/scan-student-card`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
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
  // 1. Ambil data pendaftaran berstatus MENUNGGU_SELEKSI atau buat baru
  const listRes = await fetch(`${BASE_URL}/pendaftaran?status=MENUNGGU_SELEKSI`);
  const listData = await listRes.json();
  let pendaftaranId = listData.data?.[0]?.id;
  let eskulId = listData.data?.[0]?.eskulId || 'eskul-01';

  if (!pendaftaranId) {
    const daftarRes = await fetch(`${BASE_URL}/pendaftaran`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        eskulId: 'eskul-06',
        siswaId: 'sis-07',
        alasanDaftar: 'Ingin bergabung pramuka penegak.',
      }),
    });
    const daftarData = await daftarRes.json();
    pendaftaranId = daftarData.data?.id;
    eskulId = 'eskul-06';
  }
  assert.ok(pendaftaranId);

  // 2. Pembina menyeleksi & menerima calon siswa
  const seleksiRes = await fetch(`${BASE_URL}/pendaftaran/seleksi-pembina`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', 'X-User-Role': 'PEMBINA' },
    body: JSON.stringify({
      pendaftaranIds: [pendaftaranId],
      status: 'DITERIMA_PEMBINA',
      catatanPembina: 'Lulus seleksi dasar minat dan bakat.',
    }),
  });
  assert.equal(seleksiRes.status, 200);

  // 3. Pembina mengajukan seluruh siswa terpilih ke Koordinator
  const ajukanRes = await fetch(`${BASE_URL}/pendaftaran/ajukan-koordinator`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-User-Role': 'PEMBINA' },
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
  // Ambil data yang menunggu validasi koordinator
  const listRes = await fetch(`${BASE_URL}/pendaftaran?status=MENUNGGU_VALIDASI_KOORDINATOR`);
  const listData = await listRes.json();
  assert.equal(listData.success, true);
  assert.ok(listData.data.length > 0);

  const target = listData.data[0];

  // Koordinator memvalidasi & menyetujui
  const valRes = await fetch(`${BASE_URL}/pendaftaran/validasi-koordinator`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-User-Role': 'KOORDINATOR' },
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

  // Pastikan sekarang berstatus RESMI_TERDAFTAR
  const checkRes = await fetch(`${BASE_URL}/pendaftaran?status=RESMI_TERDAFTAR`);
  const checkData = await checkRes.json();
  const found = checkData.data.find(d => d.id === target.id);
  assert.ok(found);
  assert.equal(found.status, 'RESMI_TERDAFTAR');
});


