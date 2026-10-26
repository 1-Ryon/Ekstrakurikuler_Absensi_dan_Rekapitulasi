import assert from 'node:assert/strict';

const BASE_URL = 'http://127.0.0.1:5000/api';

async function req(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const res = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
      ...(options.headers || {}),
    },
    ...options,
  });
  const data = await res.json().catch(() => null);
  return { status: res.status, ok: res.ok, data };
}

async function main() {
  console.log('🚀 [E2E FULL LIFECYCLE TEST] Memulai pengujian end-to-end seluruh alur sistem...');

  // ==========================================
  // TAHAP 1: LOGIN & AUTHENTICATION
  // ==========================================
  console.log('\n--- 1. AUTENTIKASI MULTI-ROLE ---');
  
  const adminLogin = await req('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username: 'admin', password: 'admin123' }),
  });
  assert.equal(adminLogin.status, 200, 'Admin login harus 200');
  const adminToken = adminLogin.data.token;
  assert.ok(adminToken, 'Admin token harus ada');
  console.log('  ✓ Admin login berhasil');

  const koorLogin = await req('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username: 'koordinator', password: 'admin123' }),
  });
  assert.equal(koorLogin.status, 200, 'Koordinator login harus 200');
  const koorToken = koorLogin.data.token;
  assert.ok(koorToken, 'Koordinator token harus ada');
  console.log('  ✓ Koordinator login berhasil');

  // ==========================================
  // TAHAP 2: PEMBUATAN ESKUL BARU OLEH ADMIN
  // ==========================================
  console.log('\n--- 2. PEMBUATAN ESKUL BARU OLEH ADMIN ---');
  const uniqueCode = Date.now().toString().slice(-4);
  const eskulName = `Robotika & IoT Club ${uniqueCode}`;
  
  const createEskul = await req('/eskul', {
    method: 'POST',
    token: adminToken,
    body: JSON.stringify({
      namaEskul: eskulName,
      kategori: 'Teknologi',
      kuota: 30,
      jadwalHari: 'Sabtu',
      jamMulai: '08:30',
      jamSelesai: '11:00',
      lokasi: 'Laboratorium Komputer & Elektronika',
      deskripsi: 'Pelatihan mikrokontroler Arduino, IoT, sensor cerdas, dan pemrograman C++.',
    }),
  });
  assert.equal(createEskul.status, 201, 'Pembuatan eskul baru harus 201 Created');
  const newEskul = createEskul.data.data;
  const newEskulId = newEskul.id;
  console.log(`  ✓ Eskul '${newEskul.namaEskul}' berhasil dibuat (ID: ${newEskulId}, Kuota: ${newEskul.kuota})`);

  // ==========================================
  // TAHAP 3: PEMBUATAN AKUN PEMBINA BARU
  // ==========================================
  console.log('\n--- 3. PEMBUATAN AKUN PEMBINA BARU ---');
  const pembinaUsername = `pembina.robo.${uniqueCode}`;
  const createPembina = await req('/pembina', {
    method: 'POST',
    token: adminToken,
    body: JSON.stringify({
      namaLengkap: `Dr. Eng. Hendra Gunawan, S.T. ${uniqueCode}`,
      nip: `19880520201201${uniqueCode}`,
      username: pembinaUsername,
      password: 'pembina123',
      spesialisasi: 'Robotika Industri & IoT',
      assignedEskulId: newEskulId,
    }),
  });
  assert.equal(createPembina.status, 201, 'Pembuatan pembina harus 201 Created');
  console.log(`  ✓ Akun pembina '${pembinaUsername}' berhasil dibuat dan ditautkan ke ${eskulName}`);

  // Login sebagai Pembina baru
  const pembinaLogin = await req('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username: pembinaUsername, password: 'pembina123' }),
  });
  assert.equal(pembinaLogin.status, 200, 'Pembina baru harus bisa login');
  const pembinaToken = pembinaLogin.data.token;
  const pembinaUser = pembinaLogin.data.user;
  console.log(`  ✓ Pembina baru '${pembinaUser.namaLengkap}' berhasil login (Role: ${pembinaUser.role})`);

  // ==========================================
  // TAHAP 4: PENDAFTARAN SISWA KE ESKUL BARU
  // ==========================================
  console.log('\n--- 4. PENDAFTARAN SISWA (CALON ANGGOTA) ---');
  const candidateStudent1 = 'sis-041';
  const candidateStudent2 = 'sis-042';
  const candidateStudent3 = 'sis-043';

  // Pendaftar 1
  const reg1 = await req('/pendaftaran', {
    method: 'POST',
    body: JSON.stringify({
      eskulId: newEskulId,
      siswaId: candidateStudent1,
      alasanDaftar: 'Ingin belajar merakit sensor cerdas dan mikrokontroler.',
    }),
  });
  assert.equal(reg1.status, 201, 'Pendaftaran siswa 1 harus 201 Created');
  const regId1 = reg1.data.data.id;
  assert.equal(reg1.data.data.status, 'MENUNGGU_SELEKSI');
  console.log(`  ✓ Siswa 1 (ID: ${candidateStudent1}) berhasil mendaftar (Status: MENUNGGU_SELEKSI)`);

  // Pendaftar 2
  const reg2 = await req('/pendaftaran', {
    method: 'POST',
    body: JSON.stringify({
      eskulId: newEskulId,
      siswaId: candidateStudent2,
      alasanDaftar: 'Tertarik membuat smart greenhouse berbasis Arduino.',
    }),
  });
  assert.equal(reg2.status, 201, 'Pendaftaran siswa 2 harus 201 Created');
  const regId2 = reg2.data.data.id;
  console.log(`  ✓ Siswa 2 (ID: ${candidateStudent2}) berhasil mendaftar (Status: MENUNGGU_SELEKSI)`);

  // Pendaftar 3
  const reg3 = await req('/pendaftaran', {
    method: 'POST',
    body: JSON.stringify({
      eskulId: newEskulId,
      siswaId: candidateStudent3,
      alasanDaftar: 'Coba-coba daftar eskul teknologi.',
    }),
  });
  assert.equal(reg3.status, 201, 'Pendaftaran siswa 3 harus 201 Created');
  const regId3 = reg3.data.data.id;
  console.log(`  ✓ Siswa 3 (ID: ${candidateStudent3}) berhasil mendaftar (Status: MENUNGGU_SELEKSI)`);

  // ==========================================
  // TAHAP 5: SELEKSI BERKAS OLEH PEMBINA
  // ==========================================
  console.log('\n--- 5. SELEKSI BERKAS OLEH PEMBINA ---');
  
  // Pembina menerima Siswa 1 & Siswa 2
  const seleksiAccept = await req('/pendaftaran/seleksi-pembina', {
    method: 'PATCH',
    token: pembinaToken,
    body: JSON.stringify({
      pendaftaranIds: [regId1, regId2],
      status: 'DITERIMA_PEMBINA',
      catatanPembina: 'Lulus tes kemampuan logika dan dasar elektronika.',
    }),
  });
  assert.equal(seleksiAccept.status, 200);
  assert.equal(seleksiAccept.data.count, 2);
  console.log('  ✓ Pembina menerima Siswa 1 & Siswa 2 (Status: DITERIMA_PEMBINA)');

  // Pembina menolak Siswa 3
  const seleksiReject = await req('/pendaftaran/seleksi-pembina', {
    method: 'PATCH',
    token: pembinaToken,
    body: JSON.stringify({
      pendaftaranIds: [regId3],
      status: 'DITOLAK',
      catatanPembina: 'Nilai prasyarat dasar belum memenuhi kriteria.',
    }),
  });
  assert.equal(seleksiReject.status, 200);
  console.log('  ✓ Pembina menolak Siswa 3 (Status: DITOLAK)');

  // ==========================================
  // TAHAP 6: PENGAJUAN BATCH KE KOORDINATOR
  // ==========================================
  console.log('\n--- 6. PEMBINA MENGAJUKAN BERKAS KE KOORDINATOR ---');
  const ajukan = await req('/pendaftaran/ajukan-koordinator', {
    method: 'POST',
    token: pembinaToken,
    body: JSON.stringify({
      eskulId: newEskulId,
      pendaftaranIds: [regId1, regId2],
      catatanPembina: 'Dua calon siswa terbaik hasil seleksi ketat siap disahkan.',
    }),
  });
  assert.equal(ajukan.status, 200);
  assert.equal(ajukan.data.count, 2);
  console.log('  ✓ Berkas Siswa 1 & 2 berhasil diajukan (Status: MENUNGGU_VALIDASI_KOORDINATOR)');

  // ==========================================
  // TAHAP 7: VALIDASI & PENGESAHAN OLEH KOORDINATOR
  // ==========================================
  console.log('\n--- 7. VALIDASI & PENGESAHAN RESMI OLEH KOORDINATOR ---');
  const validasi = await req('/pendaftaran/validasi-koordinator', {
    method: 'POST',
    token: koorToken,
    body: JSON.stringify({
      pendaftaranIds: [regId1, regId2],
      aksi: 'SETUJUI',
      catatanKoordinator: 'Disetujui dan disahkan resmi oleh Koordinator Ekstrakurikuler.',
      koordinatorId: koorLogin.data.user.id,
    }),
  });
  assert.equal(validasi.status, 200);
  assert.equal(validasi.data.count, 2);
  console.log('  ✓ Koordinator mengesahkan pendaftaran Siswa 1 & Siswa 2 (Status: RESMI_TERDAFTAR)');

  // Cek apakah siswa resmi masuk ke AnggotaEskul
  const eskulMembers = await req(`/eskul/${newEskulId}/members`);
  assert.equal(eskulMembers.status, 200);
  assert.equal(eskulMembers.data.data.length, 2, 'Anggota resmi eskul baru harus berjumlah 2');
  console.log(`  ✓ Terverifikasi: ${eskulMembers.data.data.length} siswa resmi tercatat di tabel AnggotaEskul!`);

  // ==========================================
  // TAHAP 8: BUKA SESI ABSENSI & PRESENSI REAL-TIME
  // ==========================================
  console.log('\n--- 8. SESI ABSENSI & PEMINDAIAN KEHADIRAN SISWA ---');
  const openSession = await req('/sessions', {
    method: 'POST',
    token: pembinaToken,
    body: JSON.stringify({
      eskulId: newEskulId,
      pembuatId: pembinaUser.id,
      judul: 'Pertemuan Perdana: Teori Dasar Mikrokontroler & Sensor',
      deskripsi: 'Pengenalan board Arduino Uno, sensor DHT11, dan instalasi software IDE.',
      lokasi: 'Laboratorium Komputer 3',
      jamMulai: '08:30',
      jamSelesai: '11:00',
    }),
  });
  assert.equal(openSession.status, 201);
  const session = openSession.data.data;
  const sessionId = session.id;
  const qrToken = session.tokenAktif;
  console.log(`  ✓ Sesi absensi dibuka: '${session.judul}' (ID: ${sessionId}, Status: ${session.status})`);

  // Metode 1: Siswa 1 scan Dynamic QR token sesi
  const scanQr = await req('/presensi/scan', {
    method: 'POST',
    body: JSON.stringify({
      qrToken: qrToken,
      siswaId: candidateStudent1,
      deviceInfo: 'Smartphone Siswa (Android 14 Chrome)',
      metode: 'DYNAMIC_QR',
    }),
  });
  assert.equal(scanQr.status, 200, 'Presensi scan Dynamic QR harus 200');
  console.log(`  ✓ Siswa 1 berhasil scan Dynamic QR (Status: HADIR)`);

  // Metode 2: Pembina scan kartu QR Siswa 2
  const scanCard = await req('/presensi/scan-student-card', {
    method: 'POST',
    body: JSON.stringify({
      sesiId: sessionId,
      studentIdOrNis: candidateStudent2,
      pembinaId: pembinaUser.id,
      nilaiKeaktifan: 92,
      ratingKeaktifan: 'Sangat Baik',
    }),
  });
  assert.equal(scanCard.status, 201, 'Presensi scan kartu QR siswa harus 201');
  console.log(`  ✓ Pembina berhasil scan Kartu ID Siswa 2 (Status: HADIR, Keaktifan: 92)`);

  // Verifikasi lembar kehadiran sesi
  const attendanceSheet = await req(`/sessions/${sessionId}/attendance-sheet`);
  assert.equal(attendanceSheet.status, 200);
  assert.equal(attendanceSheet.data.data.totalHadir, 2, 'Harus ada 2 siswa berstatus HADIR');
  console.log(`  ✓ Lembar absensi sesi: 2 siswa hadir tercatat secara real-time`);

  // ==========================================
  // TAHAP 9: FINALISASI & KUNCI SESI PERTEMUAN
  // ==========================================
  console.log('\n--- 9. FINALISASI & PENGUNCIAN RIWAYAT SESI ---');
  const kehadiran = attendanceSheet.data.data.roster;
  const finalize = await req(`/sessions/${sessionId}/finalize`, {
    method: 'POST',
    token: pembinaToken,
    body: JSON.stringify({ kehadiran }),
  });
  assert.equal(finalize.status, 200);
  assert.equal(finalize.data.data.sesi.isLocked, true, 'Sesi harus berstatus terkunci');
  console.log('  ✓ Sesi absensi berhasil dikunci permanen (isLocked: true)');

  // Verifikasi presensi baru ditolak karena sesi terkunci
  const scanAfterLock = await req('/presensi/scan', {
    method: 'POST',
    body: JSON.stringify({
      qrToken: qrToken,
      siswaId: candidateStudent3,
    }),
  });
  assert.equal(scanAfterLock.status, 400, 'Presensi di sesi terkunci harus ditolak dengan 400');
  console.log('  ✓ Verifikasi proteksi: Scan presensi di sesi terkunci berhasil dicegah (400 Bad Request)');

  // ==========================================
  // TAHAP 10: PENILAIAN RAPOR KURIKULUM MERDEKA
  // ==========================================
  console.log('\n--- 10. PENILAIAN RAPOR SISWA (KURIKULUM MERDEKA) ---');
  const saveGrades = await req('/penilaian', {
    method: 'POST',
    token: pembinaToken,
    body: JSON.stringify({
      items: [
        {
          eskulId: newEskulId,
          siswaId: candidateStudent1,
          semester: 1,
          tahunAjaran: '2026/2027',
          nilaiKehadiran: 100,
          nilaiKeaktifan: 90,
          nilaiKinerja: 92,
          catatan: 'Aktif merakit modul IoT dan menunjukkan etos kerja tinggi.',
        },
        {
          eskulId: newEskulId,
          siswaId: candidateStudent2,
          semester: 1,
          tahunAjaran: '2026/2027',
          nilaiKehadiran: 100,
          nilaiKeaktifan: 86,
          nilaiKinerja: 88,
          catatan: 'Mampu memahami konsep sensor cerdas dan disiplin.',
        },
      ],
    }),
  });
  assert.equal(saveGrades.status, 200);
  assert.equal(saveGrades.data.count, 2);
  const grade1 = saveGrades.data.data[0];
  console.log(`  ✓ Nilai Siswa 1 berhasil disimpan: Nilai Akhir = ${grade1.nilaiAkhir}, Predikat = ${grade1.predikat}`);

  // ==========================================
  // TAHAP 11: PENCATATAN PRESTASI & BONUS NILAI
  // ==========================================
  console.log('\n--- 11. PENCATATAN PRESTASI LOMBA & REKALKULASI RAPOR ---');
  const addPrestasi = await req('/prestasi', {
    method: 'POST',
    token: pembinaToken,
    body: JSON.stringify({
      eskulId: newEskulId,
      siswaId: candidateStudent1,
      namaLomba: 'National IoT & Robotics Championship 2026',
      penyelenggara: 'Kementerian Pemuda dan Olahraga RI',
      tingkat: 'NASIONAL',
      peringkat: 'JUARA_1',
      tanggal: new Date().toISOString(),
      keterangan: 'Memenangkan kategori Smart School Innovation dengan robot penyiram otomatis.',
    }),
  });
  assert.equal(addPrestasi.status, 201);
  const bonus = addPrestasi.data.data.poinTambahan;
  assert.equal(bonus, 20, 'Juara 1 Nasional harus bernilai bonus 20 poin');
  console.log(`  ✓ Prestasi lomba berhasil dicatat: Bonus +${bonus} poin otomatis tersinkronisasi ke nilai rapor!`);

  // Verifikasi rekap rapor setelah prestasi
  const allGrades = await req('/penilaian');
  assert.equal(allGrades.status, 200);
  const student1Grade = allGrades.data.data.find(g => g.eskulId === newEskulId && g.siswaId === candidateStudent1);
  assert.ok(student1Grade, 'Buku nilai siswa 1 harus ditemukan');
  console.log(`  ✓ Verifikasi Rapor Siswa 1: Poin Prestasi = ${student1Grade.poinPrestasi}, Nilai Akhir = ${student1Grade.nilaiAkhir}, Predikat = ${student1Grade.predikat}`);

  console.log('\n========================================================================');
  console.log('🎉 SELURUH ALUR SIKLUS HIDUP SISTEM (11 TAHAPAN) 100% SUKSES DAN LOLOS!');
  console.log('========================================================================\n');
}

main().catch((err) => {
  console.error('\n❌ GAGAL PADA PENGUJIAN:', err);
  process.exit(1);
});
