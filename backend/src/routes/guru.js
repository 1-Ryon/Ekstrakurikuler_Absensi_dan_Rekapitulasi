import { Router } from 'express';
import { prisma } from '../config/prisma.js';
import { requireRoles } from '../middlewares/auth.js';

const router = Router();

// ==========================================
// 1. MASTER DATA PEMBINA
// ==========================================
router.get('/pembina', async (req, res) => {
  try {
    const pembinas = await prisma.guru.findMany({
      where: { isPembina: true },
      include: {
        eskulDiampu: {
          select: { id: true, namaEskul: true, kategori: true },
        },
      },
      orderBy: { namaLengkap: 'asc' },
    });

    const formatted = pembinas.map((p) => ({
      id: p.id,
      namaLengkap: p.namaLengkap,
      nip: p.nip || '-',
      username: p.username || '-',
      password: p.passwordHash || `pembina_${p.username}`,
      defaultPassword: p.passwordHash || `pembina_${p.username}`,
      noHp: p.noHp || '-',
      email: p.email || '-',
      spesialisasi: p.spesialisasi || 'Pembina Eskul',
      avatarUrl: p.avatarUrl,
      role: p.role,
      statusAktif: p.statusAktif,
      eskulDiampu: p.eskulDiampu,
    }));

    res.json({ success: true, data: formatted });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/pembina', requireRoles('ADMIN', 'KOORDINATOR'), async (req, res) => {
  try {
    const { namaLengkap, nip, noHp, email, spesialisasi, username, password, assignedEskulId, assignedEskulIds } = req.body;
    
    if (!namaLengkap) {
      return res.status(400).json({ success: false, message: 'Nama lengkap pembina wajib diisi.' });
    }

    const finalUsername = (username || nip || namaLengkap.toLowerCase().replace(/[^a-z0-9]/g, '.')).slice(0, 30);
    const finalPassword = password || `pembina_${finalUsername}`;

    const guru = await prisma.guru.create({
      data: {
        username: finalUsername,
        passwordHash: finalPassword,
        namaLengkap,
        nip: nip || null,
        noHp: noHp || null,
        email: email || null,
        spesialisasi: spesialisasi || 'Pembina Ekstrakurikuler',
        isPembina: true,
        isWaliKelas: false,
        role: 'PEMBINA',
        statusAktif: true,
      },
    });

    const targetEskulIds = assignedEskulIds && Array.isArray(assignedEskulIds)
      ? assignedEskulIds.filter(Boolean)
      : (assignedEskulId ? [assignedEskulId] : []);

    if (targetEskulIds.length > 0) {
      await prisma.eskul.updateMany({
        where: { id: { in: targetEskulIds } },
        data: { pembinaId: guru.id },
      });
    }

    res.status(201).json({
      success: true,
      message: 'Akun Pembina berhasil dibuat.',
      data: {
        pembinaId: guru.id,
        namaLengkap,
        username: finalUsername,
        defaultPassword: finalPassword,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==========================================
// 2. MASTER DATA GURU & WALI KELAS
// ==========================================
router.get('/guru', async (req, res) => {
  try {
    const { isWaliKelas, isPembina } = req.query;
    const where = {};
    if (isWaliKelas === 'true') where.isWaliKelas = true;
    if (isPembina === 'true') where.isPembina = true;

    const gurus = await prisma.guru.findMany({
      where,
      include: {
        eskulDiampu: { select: { id: true, namaEskul: true, kategori: true } },
        kelasWali: {
          select: {
            id: true,
            namaKelas: true,
            tingkat: true,
            jurusan: true,
            _count: { select: { siswaList: true } },
          },
        },
      },
      orderBy: { namaLengkap: 'asc' },
    });

    const formatted = gurus.map((g) => ({
      id: g.id,
      nip: g.nip || '-',
      namaLengkap: g.namaLengkap,
      jenisKelamin: g.jenisKelamin,
      noHp: g.noHp || '-',
      email: g.email || '-',
      spesialisasi: g.spesialisasi || 'Guru Pendidik',
      avatarUrl: g.avatarUrl,
      isPembina: g.isPembina,
      isWaliKelas: g.isWaliKelas,
      role: g.role,
      username: g.username || '-',
      password: g.passwordHash || (g.isPembina ? `pembina_${g.username}` : `guru_${g.username}`),
      defaultPassword: g.passwordHash || (g.isPembina ? `pembina_${g.username}` : `guru_${g.username}`),
      statusAktif: g.statusAktif,
      eskulDiampu: g.eskulDiampu || [],
      kelasWali: g.kelasWali || [],
    }));

    res.json({ success: true, data: formatted });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/guru', requireRoles('ADMIN', 'KOORDINATOR'), async (req, res) => {
  try {
    const {
      namaLengkap,
      nip,
      noHp,
      email,
      spesialisasi,
      jenisKelamin = 'L',
      username,
      password,
      role = 'WALI_KELAS',
      isPembina = false,
      isWaliKelas = true,
      assignedKelasId,
      assignedEskulId,
      assignedEskulIds,
    } = req.body;

    if (!namaLengkap) {
      return res.status(400).json({ success: false, message: 'Nama lengkap guru wajib diisi.' });
    }

    const finalUsername = (username || nip || namaLengkap.toLowerCase().replace(/[^a-z0-9]/g, '.')).slice(0, 30);
    const finalPassword = password || `guru_${finalUsername}`;

    const guru = await prisma.guru.create({
      data: {
        username: finalUsername,
        passwordHash: finalPassword,
        role: role || (isWaliKelas ? 'WALI_KELAS' : isPembina ? 'PEMBINA' : 'KOORDINATOR'),
        namaLengkap,
        nip: nip || null,
        jenisKelamin: jenisKelamin || 'L',
        noHp: noHp || null,
        email: email || null,
        spesialisasi: spesialisasi || (isWaliKelas ? 'Wali Kelas & Guru Mata Pelajaran' : 'Guru Pengajar'),
        isPembina: Boolean(isPembina),
        isWaliKelas: Boolean(isWaliKelas),
        statusAktif: true,
      },
    });

    if (assignedKelasId) {
      await prisma.kelas.update({
        where: { id: assignedKelasId },
        data: { waliKelasId: guru.id },
      });
    }

    const targetEskulIds = assignedEskulIds && Array.isArray(assignedEskulIds)
      ? assignedEskulIds.filter(Boolean)
      : (assignedEskulId ? [assignedEskulId] : []);

    if (targetEskulIds.length > 0) {
      await prisma.eskul.updateMany({
        where: { id: { in: targetEskulIds } },
        data: { pembinaId: guru.id },
      });
    }

    res.status(201).json({
      success: true,
      message: 'Data Guru berhasil ditambahkan.',
      data: {
        id: guru.id,
        namaLengkap,
        username: finalUsername,
        defaultPassword: finalPassword,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put('/guru/:id', requireRoles('ADMIN', 'KOORDINATOR'), async (req, res) => {
  try {
    const { id } = req.params;
    const {
      namaLengkap,
      nip,
      noHp,
      email,
      spesialisasi,
      jenisKelamin,
      isPembina,
      isWaliKelas,
      statusAktif,
      password,
      role,
      assignedKelasId,
      assignedEskulId,
      assignedEskulIds,
    } = req.body;

    const existingGuru = await prisma.guru.findUnique({
      where: { id },
    });

    if (!existingGuru) {
      return res.status(404).json({ success: false, message: 'Data guru tidak ditemukan.' });
    }

    const updateData = {};
    if (namaLengkap !== undefined) updateData.namaLengkap = namaLengkap;
    if (nip !== undefined) updateData.nip = nip;
    if (noHp !== undefined) updateData.noHp = noHp;
    if (email !== undefined) updateData.email = email;
    if (spesialisasi !== undefined) updateData.spesialisasi = spesialisasi;
    if (jenisKelamin !== undefined) updateData.jenisKelamin = jenisKelamin;
    if (isPembina !== undefined) updateData.isPembina = Boolean(isPembina);
    if (isWaliKelas !== undefined) updateData.isWaliKelas = Boolean(isWaliKelas);
    if (role !== undefined) updateData.role = role;
    if (statusAktif !== undefined) updateData.statusAktif = Boolean(statusAktif);
    if (password) updateData.passwordHash = password;

    const updatedGuru = await prisma.guru.update({
      where: { id },
      data: updateData,
      include: {
        eskulDiampu: true,
        kelasWali: true,
      },
    });

    if (assignedKelasId !== undefined) {
      if (assignedKelasId === null || assignedKelasId === '') {
        await prisma.kelas.updateMany({
          where: { waliKelasId: id },
          data: { waliKelasId: null },
        });
      } else {
        await prisma.kelas.update({
          where: { id: assignedKelasId },
          data: { waliKelasId: id },
        });
      }
    }

    const targetEskulIds = assignedEskulIds !== undefined
      ? (Array.isArray(assignedEskulIds) ? assignedEskulIds.filter(Boolean) : [assignedEskulIds].filter(Boolean))
      : (assignedEskulId ? [assignedEskulId] : null);

    if (targetEskulIds !== null) {
      if (targetEskulIds.length > 0) {
        await prisma.eskul.updateMany({
          where: { id: { in: targetEskulIds } },
          data: { pembinaId: id },
        });
      }

      const removedEskul = await prisma.eskul.findMany({
        where: {
          pembinaId: id,
          id: { notIn: targetEskulIds },
        },
      });

      if (removedEskul.length > 0) {
        const fallbackPembina = await prisma.guru.findFirst({
          where: { id: { not: id }, isPembina: true },
        });
        if (fallbackPembina) {
          await prisma.eskul.updateMany({
            where: { id: { in: removedEskul.map(e => e.id) } },
            data: { pembinaId: fallbackPembina.id },
          });
        }
      }
    }

    res.json({ success: true, message: 'Data guru berhasil diperbarui.', data: updatedGuru });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.delete('/guru/:id', requireRoles('ADMIN', 'KOORDINATOR'), async (req, res) => {
  try {
    const { id } = req.params;
    const guru = await prisma.guru.findUnique({
      where: { id },
    });

    if (!guru) {
      return res.status(404).json({ success: false, message: 'Data guru tidak ditemukan.' });
    }

    await prisma.kelas.updateMany({
      where: { waliKelasId: id },
      data: { waliKelasId: null },
    });

    const otherPembina = await prisma.guru.findFirst({
      where: { id: { not: id }, isPembina: true },
    });
    if (otherPembina) {
      await prisma.eskul.updateMany({
        where: { pembinaId: id },
        data: { pembinaId: otherPembina.id },
      });
    }

    await prisma.guru.delete({ where: { id } });

    res.json({ success: true, message: 'Data guru berhasil dihapus.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/guru/import', requireRoles('ADMIN', 'KOORDINATOR'), async (req, res) => {
  try {
    const rows = req.body.rows || req.body.guruList;
    if (!rows || !Array.isArray(rows)) {
      return res.status(400).json({ success: false, message: 'Format data baris impor guru tidak valid.' });
    }

    let importedCount = 0;
    const importSummary = [];

    for (const row of rows) {
      const rawNama = String(row.namaLengkap || '').trim();
      if (!rawNama) continue;

      const rawNip = row.nip && String(row.nip).trim() !== '-' ? String(row.nip).trim() : null;
      const rawJk = String(row.jenisKelamin || 'L').toUpperCase().startsWith('P') ? 'P' : 'L';
      const rawHp = row.noHp && String(row.noHp).trim() !== '-' ? String(row.noHp).trim() : null;
      const rawEmail = row.email && String(row.email).trim() !== '-' ? String(row.email).trim() : null;
      const rawSpesialisasi = row.spesialisasi ? String(row.spesialisasi).trim() : 'Guru Pengajar';
      const rawRole = String(row.role || row.peran || 'PEMBINA').toUpperCase();
      const isPembina = rawRole.includes('PEMBINA') || Boolean(row.isPembina);
      const isWaliKelas = rawRole.includes('WALI') || Boolean(row.isWaliKelas);

      let username = '';
      if (rawNip && rawNip.replace(/[^0-9]/g, '').length >= 6) {
        username = rawNip.replace(/\s+/g, '');
      } else {
        username = rawNama
          .toLowerCase()
          .replace(/\b(s\.pd|m\.pd|s\.kom|m\.kom|lc|dr|drs|h|hj|ir)\b/gi, '')
          .replace(/[^a-z0-9]/g, '.')
          .replace(/\.+/g, '.')
          .replace(/^\.|\.$/g, '')
          .slice(0, 25);
        if (!username) username = `guru.${Date.now().toString().slice(-4)}`;
      }

      const defaultPassword = rawNip && rawNip.length >= 4
        ? `guru_${rawNip.replace(/[^0-9]/g, '').slice(-4)}`
        : `guru_${username.split('.')[0] || '123'}`;

      let guruRecord = null;
      if (rawNip) {
        guruRecord = await prisma.guru.findFirst({
          where: { OR: [{ username }, { nip: rawNip }] },
        });
      } else {
        guruRecord = await prisma.guru.findUnique({
          where: { username },
        });
      }

      if (guruRecord) {
        guruRecord = await prisma.guru.update({
          where: { id: guruRecord.id },
          data: {
            namaLengkap: rawNama,
            nip: rawNip,
            jenisKelamin: rawJk,
            noHp: rawHp,
            email: rawEmail,
            spesialisasi: rawSpesialisasi,
            isPembina,
            isWaliKelas,
            role: isPembina ? 'PEMBINA' : isWaliKelas ? 'WALI_KELAS' : 'KOORDINATOR',
          },
        });
      } else {
        guruRecord = await prisma.guru.create({
          data: {
            username,
            passwordHash: defaultPassword,
            namaLengkap: rawNama,
            nip: rawNip,
            jenisKelamin: rawJk,
            noHp: rawHp,
            email: rawEmail,
            spesialisasi: rawSpesialisasi,
            isPembina,
            isWaliKelas,
            role: isPembina ? 'PEMBINA' : isWaliKelas ? 'WALI_KELAS' : 'KOORDINATOR',
            statusAktif: true,
          },
        });
      }

      if (row.kelas || row.namaKelas) {
        const targetKelas = String(row.kelas || row.namaKelas).trim();
        await prisma.kelas.updateMany({
          where: { namaKelas: targetKelas },
          data: { waliKelasId: guruRecord.id },
        });
      }

      importedCount++;
      importSummary.push({
        namaLengkap: rawNama,
        nip: rawNip || '-',
        username,
        defaultPassword,
        role: isPembina ? 'PEMBINA' : isWaliKelas ? 'WALI_KELAS' : 'KOORDINATOR',
        spesialisasi: rawSpesialisasi,
      });
    }

    res.json({
      success: true,
      message: `Berhasil mengimpor ${importedCount} data guru.`,
      count: importedCount,
      summary: importSummary,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==========================================
// 3. MASTER DATA WALI KELAS
// ==========================================
router.get('/walikelas', async (req, res) => {
  try {
    const waliKelasList = await prisma.guru.findMany({
      where: { isWaliKelas: true },
      include: {
        kelasWali: true,
      },
      orderBy: { namaLengkap: 'asc' },
    });

    res.json({ success: true, data: waliKelasList });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
