import { Router } from 'express';
import { prisma } from '../config/prisma.js';
import { requireRoles, extractUser, getStudentDefaultPassword, hashPassword } from '../middlewares/auth.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const user = extractUser(req);
    const isPrivileged = user && (user.role === 'ADMIN' || user.role === 'KOORDINATOR');

    const students = await prisma.siswa.findMany({
      include: {
        kelas: true,
        keanggotaanEskul: { select: { eskulId: true, jabatan: true } },
      },
      orderBy: { namaLengkap: 'asc' },
    });

    const formatted = students.map((s) => {
      const studentObj = {
        id: s.id,
        nis: s.nis,
        nisn: s.nisn || s.nis,
        username: s.nis,
        namaLengkap: s.namaLengkap,
        jenisKelamin: s.jenisKelamin,
        kelas: s.kelas?.namaKelas || '-',
        kelasId: s.kelasId,
        avatarUrl: s.avatarUrl,
        statusAktif: s.statusAktif,
        email: s.email || null,
        noHp: s.noHp || null,
        enrolledEskulIds: s.keanggotaanEskul.map((k) => k.eskulId),
        kehadiranRataRata: 94,
      };

      if (isPrivileged) {
        studentObj.defaultPassword = getStudentDefaultPassword(s.nis);
        studentObj.password = getStudentDefaultPassword(s.nis);
      }

      return studentObj;
    });

    res.json({ success: true, data: formatted });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/import', requireRoles('ADMIN', 'KOORDINATOR'), async (req, res) => {
  try {
    const { rows } = req.body;
    if (!rows || !Array.isArray(rows)) {
      return res.status(400).json({ success: false, message: 'Format data baris impor tidak valid.' });
    }

    let importedCount = 0;
    const importSummary = [];

    for (const row of rows) {
      const rawNis = String(row.nis || row.nomorInduk || '').trim();
      const rawNama = String(row.namaLengkap || '').trim();
      const rawKelas = String(row.kelas || 'X RPL 1').trim();
      const rawJk = String(row.jenisKelamin || 'L').toUpperCase().startsWith('P') ? 'P' : 'L';

      if (!rawNis || !rawNama) continue;

      const kelasRecord = await prisma.kelas.upsert({
        where: { namaKelas: rawKelas },
        update: {},
        create: {
          namaKelas: rawKelas,
          tingkat: parseInt(rawKelas.replace(/[^0-9]/g, ''), 10) || 10,
          jurusan: rawKelas.split(' ')[1] || 'Umum',
        },
      });

      const username = rawNis;
      const defaultPassword = getStudentDefaultPassword(rawNis);

      const siswa = await prisma.siswa.upsert({
        where: { nis: rawNis },
        update: {
          namaLengkap: rawNama,
          kelasId: kelasRecord.id,
          jenisKelamin: rawJk,
          nisn: row.nisn ? String(row.nisn).trim() : rawNis,
          noHp: row.noHp ? String(row.noHp).trim() : null,
          noHpOrtu: row.noHpOrtu ? String(row.noHpOrtu).trim() : null,
          statusAktif: true,
        },
        create: {
          nis: rawNis,
          nisn: row.nisn ? String(row.nisn).trim() : rawNis,
          passwordHash: hashPassword(defaultPassword),
          namaLengkap: rawNama,
          kelasId: kelasRecord.id,
          jenisKelamin: rawJk,
          noHp: row.noHp ? String(row.noHp).trim() : null,
          noHpOrtu: row.noHpOrtu ? String(row.noHpOrtu).trim() : null,
          statusSiswa: 'AKTIF',
          statusAktif: true,
        },
      });

      if (row.eskulId) {
        await prisma.anggotaEskul.upsert({
          where: {
            eskulId_siswaId_tahunAjaran: {
              eskulId: row.eskulId,
              siswaId: siswa.id,
              tahunAjaran: '2026/2027',
            },
          },
          update: { status: 'AKTIF' },
          create: {
            eskulId: row.eskulId,
            siswaId: siswa.id,
            tahunAjaran: '2026/2027',
            status: 'AKTIF',
            jabatan: 'ANGGOTA',
          },
        });
      }

      importedCount++;
      importSummary.push({
        namaLengkap: rawNama,
        nis: rawNis,
        kelas: rawKelas,
        username: rawNis,
        defaultPassword,
      });
    }

    res.json({
      success: true,
      message: `Berhasil mengimpor ${importedCount} siswa ke dalam basis data sekolah.`,
      count: importedCount,
      credentialsFormat: 'Nama Pengguna = NIS, Kata Sandi = al_amanah_<3 digit terakhir NIS>',
      sampleCredentials: importSummary.slice(0, 5),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/assign', async (req, res) => {
  try {
    const { studentId, eskulIds } = req.body;

    await prisma.anggotaEskul.deleteMany({
      where: { siswaId: studentId },
    });

    if (eskulIds && eskulIds.length > 0) {
      await prisma.anggotaEskul.createMany({
        data: eskulIds.map((eid) => ({
          eskulId: eid,
          siswaId: studentId,
          tahunAjaran: '2026/2027',
        })),
      });
    }

    res.json({ success: true, message: 'Penugasan eskul siswa berhasil diperbarui' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/enroll-eskul', async (req, res) => {
  try {
    const { siswaId, eskulId, tahunAjaran } = req.body;

    if (!siswaId || !eskulId) {
      return res.status(400).json({ success: false, message: 'ID Siswa dan ID Eskul wajib diisi.' });
    }

    const currentTa = tahunAjaran || '2026/2027';

    const eskul = await prisma.eskul.findUnique({
      where: { id: eskulId },
      include: { _count: { select: { anggota: true } } },
    });

    if (!eskul) {
      return res.status(404).json({ success: false, message: 'Ekstrakurikuler tidak ditemukan.' });
    }

    if (eskul._count.anggota >= eskul.kuota) {
      return res.status(400).json({
        success: false,
        message: `Pendaftaran ditolak: Kuota eskul ${eskul.namaEskul} sudah penuh (${eskul._count.anggota}/${eskul.kuota} siswa).`,
      });
    }

    const existingEnrollments = await prisma.anggotaEskul.count({
      where: { siswaId, tahunAjaran: currentTa, status: 'AKTIF' },
    });

    if (existingEnrollments >= 3) {
      return res.status(400).json({
        success: false,
        message: 'Batas maksimal tercapai: Setiap siswa hanya diperbolehkan mengikuti maksimal 3 ekstrakurikuler.',
      });
    }

    const newMember = await prisma.anggotaEskul.upsert({
      where: {
        eskulId_siswaId_tahunAjaran: {
          eskulId,
          siswaId,
          tahunAjaran: currentTa,
        },
      },
      update: { status: 'AKTIF' },
      create: {
        eskulId,
        siswaId,
        tahunAjaran: currentTa,
        status: 'AKTIF',
        jabatan: 'ANGGOTA',
      },
    });

    res.status(201).json({
      success: true,
      message: `Selamat, Anda berhasil terdaftar di ekstrakurikuler ${eskul.namaEskul}!`,
      data: newMember,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});


router.put('/:id', requireRoles('ADMIN', 'KOORDINATOR'), async (req, res) => {
  try {
    const { id } = req.params;
    const { namaLengkap, kelasId, email, noHp, noHpOrtu, alamat, statusAktif, statusSiswa, jenisKelamin, nisn } = req.body;

    const updateData = {};
    if (namaLengkap !== undefined) updateData.namaLengkap = String(namaLengkap).trim();
    if (kelasId !== undefined) updateData.kelasId = kelasId;
    if (email !== undefined) updateData.email = String(email).trim() || null;
    if (noHp !== undefined) updateData.noHp = String(noHp).trim() || null;
    if (noHpOrtu !== undefined) updateData.noHpOrtu = String(noHpOrtu).trim() || null;
    if (alamat !== undefined) updateData.alamat = String(alamat).trim() || null;
    if (statusAktif !== undefined) updateData.statusAktif = Boolean(statusAktif);
    if (statusSiswa !== undefined) updateData.statusSiswa = statusSiswa;
    if (jenisKelamin !== undefined) updateData.jenisKelamin = jenisKelamin;
    if (nisn !== undefined) updateData.nisn = String(nisn).trim() || null;

    const updated = await prisma.siswa.update({
      where: { id },
      data: updateData,
      include: { kelas: true },
    });

    res.json({
      success: true,
      message: 'Data siswa berhasil diperbarui',
      data: updated,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/batch-update-class', requireRoles('ADMIN', 'KOORDINATOR'), async (req, res) => {
  try {
    const { studentIds, targetKelasId } = req.body;
    if (!studentIds || !Array.isArray(studentIds) || studentIds.length === 0) {
      return res.status(400).json({ success: false, message: 'Daftar ID siswa wajib diisi.' });
    }
    if (!targetKelasId) {
      return res.status(400).json({ success: false, message: 'Kelas tujuan wajib dipilih.' });
    }

    const targetKelas = await prisma.kelas.findUnique({
      where: { id: targetKelasId },
    });
    if (!targetKelas) {
      return res.status(404).json({ success: false, message: 'Kelas tujuan tidak ditemukan.' });
    }

    const result = await prisma.siswa.updateMany({
      where: { id: { in: studentIds } },
      data: { kelasId: targetKelasId },
    });

    res.json({
      success: true,
      message: `Berhasil mempromosikan/memindahkan ${result.count} siswa ke kelas ${targetKelas.namaKelas}.`,
      count: result.count,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
