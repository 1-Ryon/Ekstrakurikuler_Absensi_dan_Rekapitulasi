import { Router } from 'express';
import { prisma } from '../config/prisma.js';
import { requireRoles } from '../middlewares/auth.js';

const router = Router();

// GET /api/kelas
router.get('/', async (req, res) => {
  try {
    const kelasList = await prisma.kelas.findMany({
      include: {
        waliKelas: {
          select: { id: true, namaLengkap: true, nip: true, noHp: true, avatarUrl: true },
        },
        _count: {
          select: { siswaList: true },
        },
      },
      orderBy: { namaKelas: 'asc' },
    });

    res.json({ success: true, data: kelasList });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/kelas
router.post('/', requireRoles('ADMIN', 'KOORDINATOR'), async (req, res) => {
  try {
    const { namaKelas, tingkat, jurusan, waliKelasId } = req.body;
    const kelas = await prisma.kelas.create({
      data: {
        namaKelas,
        tingkat: Number(tingkat) || 10,
        jurusan: jurusan || 'RPL',
        waliKelasId: waliKelasId || null,
      },
      include: { waliKelas: true },
    });
    res.status(201).json({ success: true, data: kelas });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PATCH /api/kelas/:id/walikelas
router.patch('/:id/walikelas', requireRoles('ADMIN', 'KOORDINATOR'), async (req, res) => {
  try {
    const { waliKelasId } = req.body;
    const updated = await prisma.kelas.update({
      where: { id: req.params.id },
      data: { waliKelasId },
      include: { waliKelas: true },
    });
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/kelas/:id
router.put('/:id', requireRoles('ADMIN', 'KOORDINATOR'), async (req, res) => {
  try {
    const { namaKelas, tingkat, jurusan, waliKelasId } = req.body;
    const updateData = {};
    if (namaKelas !== undefined) updateData.namaKelas = namaKelas;
    if (tingkat !== undefined) updateData.tingkat = Number(tingkat);
    if (jurusan !== undefined) updateData.jurusan = jurusan;
    if (waliKelasId !== undefined) updateData.waliKelasId = waliKelasId || null;

    const updated = await prisma.kelas.update({
      where: { id: req.params.id },
      data: updateData,
      include: {
        waliKelas: {
          select: { id: true, namaLengkap: true, nip: true, noHp: true, avatarUrl: true },
        },
        _count: { select: { siswaList: true } },
      },
    });
    res.json({ success: true, data: updated, message: 'Data kelas berhasil diperbarui.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/kelas/:id
router.delete('/:id', requireRoles('ADMIN', 'KOORDINATOR'), async (req, res) => {
  try {
    await prisma.kelas.delete({
      where: { id: req.params.id },
    });
    res.json({ success: true, message: 'Kelas berhasil dihapus.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
