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
