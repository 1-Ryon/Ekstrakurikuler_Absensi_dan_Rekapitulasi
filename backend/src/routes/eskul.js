import { Router } from 'express';
import { prisma } from '../config/prisma.js';
import { requireRoles } from '../middlewares/auth.js';

const router = Router();

// GET /api/eskul
router.get('/', async (req, res) => {
  try {
    const eskulList = await prisma.eskul.findMany({
      include: {
        pembina: {
          select: { id: true, namaLengkap: true, avatarUrl: true, spesialisasi: true, nip: true },
        },
        _count: {
          select: { anggota: { where: { status: 'AKTIF' } } },
        },
      },
      orderBy: { namaEskul: 'asc' },
    });

    const formatted = eskulList.map((e) => ({
      id: e.id,
      namaEskul: e.namaEskul,
      pembinaId: e.pembinaId,
      pembinaNama: e.pembina?.namaLengkap || 'Belum Ditentukan',
      pembinaAvatar: e.pembina?.avatarUrl || '',
      pembinaNip: e.pembina?.nip || '-',
      jadwalHari: e.jadwalHari,
      jamMulai: e.jamMulai,
      jamSelesai: e.jamSelesai,
      lokasi: e.lokasi,
      kategori: e.kategori,
      kuota: e.kuota,
      jumlahSiswa: e._count.anggota,
      status: e.status,
      deskripsi: e.deskripsi,
    }));

    res.json({ success: true, data: formatted });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/eskul
router.post('/', requireRoles('ADMIN', 'KOORDINATOR'), async (req, res) => {
  try {
    const { namaEskul, pembinaId, jadwalHari, jamMulai, jamSelesai, lokasi, kategori, kuota, deskripsi } = req.body;

    // Pastikan ada pembina default jika belum dipilih
    let selectedPembinaId = pembinaId;
    if (!selectedPembinaId) {
      const firstPembina = await prisma.guru.findFirst({ where: { isPembina: true } });
      selectedPembinaId = firstPembina?.id;
    }

    const newEskul = await prisma.eskul.create({
      data: {
        namaEskul,
        pembinaId: selectedPembinaId,
        jadwalHari: jadwalHari || 'Kamis',
        jamMulai: jamMulai || '15:30',
        jamSelesai: jamSelesai || '17:00',
        lokasi: lokasi || 'SMK Al Amanah',
        kategori: kategori || 'Olahraga',
        kuota: Number(kuota) || 40,
        deskripsi: deskripsi || '',
      },
      include: {
        pembina: true,
      },
    });

    res.status(201).json({ success: true, data: newEskul });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/eskul/:id
router.put('/:id', requireRoles('ADMIN', 'KOORDINATOR'), async (req, res) => {
  try {
    const { id } = req.params;
    const { namaEskul, pembinaId, jadwalHari, jamMulai, jamSelesai, lokasi, kategori, kuota, deskripsi, status } = req.body;

    const updated = await prisma.eskul.update({
      where: { id },
      data: {
        ...(namaEskul && { namaEskul }),
        ...(pembinaId && { pembinaId }),
        ...(jadwalHari && { jadwalHari }),
        ...(jamMulai && { jamMulai }),
        ...(jamSelesai && { jamSelesai }),
        ...(lokasi && { lokasi }),
        ...(kategori && { kategori }),
        ...(kuota !== undefined && { kuota: Number(kuota) }),
        ...(deskripsi !== undefined && { deskripsi }),
        ...(status && { status }),
      },
      include: {
        pembina: true,
      },
    });

    res.json({ success: true, message: 'Data eskul berhasil diperbarui', data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/eskul/:id
router.delete('/:id', requireRoles('ADMIN', 'KOORDINATOR'), async (req, res) => {
  try {
    await prisma.eskul.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: 'Eskul berhasil dihapus' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/eskul/:id/members
router.get('/:id/members', async (req, res) => {
  try {
    const { id } = req.params;
    const members = await prisma.anggotaEskul.findMany({
      where: { eskulId: id, status: 'AKTIF' },
      include: {
        siswa: {
          include: { kelas: true },
        },
      },
      orderBy: { siswa: { namaLengkap: 'asc' } },
    });

    res.json({ success: true, data: members });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/eskul/:id/kick-member: Pembina/Koordinator/Admin mengeluarkan siswa dari eskul
router.post('/:id/kick-member', requireRoles('PEMBINA', 'KOORDINATOR', 'ADMIN'), async (req, res) => {
  try {
    const { id: eskulId } = req.params;
    const { siswaId, alasan } = req.body;

    if (!siswaId) {
      return res.status(400).json({ success: false, message: 'ID Siswa wajib disertakan.' });
    }

    // 1. Periksa keanggotaan aktif
    const membership = await prisma.anggotaEskul.findFirst({
      where: { eskulId, siswaId, status: 'AKTIF' },
      include: { siswa: true, eskul: true },
    });

    if (!membership) {
      return res.status(404).json({
        success: false,
        message: 'Data keanggotaan aktif siswa di eskul ini tidak ditemukan.',
      });
    }

    // 2. Ubah status keanggotaan menjadi KELUAR
    await prisma.anggotaEskul.update({
      where: { id: membership.id },
      data: { status: 'KELUAR' },
    });

    // 3. Update juga status pendaftaran jika ada
    await prisma.pendaftaranEskul.updateMany({
      where: { eskulId, siswaId },
      data: {
        status: 'DITOLAK',
        catatanPembina: `Dikeluarkan dari eskul: ${alasan || 'Keputusan Pembina/Indisipliner'}.`,
      },
    });

    res.json({
      success: true,
      message: `Siswa ${membership.siswa.namaLengkap} berhasil dikeluarkan dari ekstrakurikuler ${membership.eskul.namaEskul}.`,
      data: {
        siswaId,
        namaSiswa: membership.siswa.namaLengkap,
        eskulId,
        status: 'KELUAR',
        alasan: alasan || 'Keputusan Pembina',
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
