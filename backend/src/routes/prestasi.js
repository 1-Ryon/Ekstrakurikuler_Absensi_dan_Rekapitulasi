import { Router } from 'express';
import { requireRoles } from '../middlewares/auth.js';
import { prisma } from '../config/prisma.js';
import { calculatePrestasiPoints, computeFinalScore } from '../utils/scoring.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const { eskulId, siswaId } = req.query;
    const filter = {};
    if (eskulId) filter.eskulId = String(eskulId);
    if (siswaId) filter.siswaId = String(siswaId);

    const prestasiList = await prisma.prestasiLomba.findMany({
      where: filter,
      include: {
        eskul: { select: { namaEskul: true } },
        siswa: { select: { namaLengkap: true, nis: true, kelas: { select: { namaKelas: true } } } },
      },
      orderBy: { tanggal: 'desc' },
    });

    res.json({ success: true, data: prestasiList });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/', requireRoles('PEMBINA', 'KOORDINATOR', 'ADMIN', 'SISWA'), async (req, res) => {
  try {
    const { eskulId, siswaId, namaLomba, penyelenggara, tingkat, peringkat, tanggal, buktiSertifikat, keterangan } = req.body;

    if (!eskulId || !siswaId || !namaLomba) {
      return res.status(400).json({ success: false, message: 'Data lomba tidak lengkap.' });
    }

    const eskul = await prisma.eskul.findUnique({ where: { id: eskulId } });
    if (!eskul) {
      return res.status(404).json({ success: false, message: 'Data eskul tidak ditemukan.' });
    }

    if (req.user?.role === 'PEMBINA' && eskul.pembinaId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: `Akses ditolak: Anda bukan pembina resmi ekstrakurikuler ${eskul.namaEskul}.`,
      });
    }

    const targetTingkat = tingkat || 'KOTA';
    const targetPeringkat = peringkat || 'JUARA_1';
    const poinTambahan = calculatePrestasiPoints(targetTingkat, targetPeringkat);

    const prestasi = await prisma.prestasiLomba.create({
      data: {
        eskulId,
        siswaId,
        namaLomba,
        penyelenggara: penyelenggara || 'Kemenpora / Dinas Pendidikan',
        tingkat: targetTingkat,
        peringkat: targetPeringkat,
        tanggal: tanggal ? new Date(tanggal) : new Date(),
        poinTambahan,
        buktiSertifikat: buktiSertifikat || null,
        keterangan: keterangan || '',
        diverifikasi: true,
      },
      include: {
        eskul: true,
        siswa: true,
      },
    });

    const existingPenilaian = await prisma.penilaian.findFirst({
      where: { eskulId, siswaId, semester: 1, tahunAjaran: '2026/2027' },
    });

    if (existingPenilaian) {
      const newPoinPrestasi = (existingPenilaian.poinPrestasi || 0) + poinTambahan;
      const scored = computeFinalScore({
        nilaiKehadiran: existingPenilaian.nilaiKehadiran,
        nilaiKeaktifan: existingPenilaian.nilaiKeaktifan,
        nilaiKinerja: existingPenilaian.nilaiKinerja,
        poinPrestasi: newPoinPrestasi,
      });

      await prisma.penilaian.update({
        where: { id: existingPenilaian.id },
        data: {
          poinPrestasi: newPoinPrestasi,
          nilaiAkhir: scored.nilaiAkhir,
          predikat: scored.predikat,
        },
      });
    }

    res.status(201).json({
      success: true,
      message: `Prestasi ${namaLomba} (${targetPeringkat}) berhasil dicatat. Bonus +${poinTambahan} poin ditambahkan ke nilai akhir.`,
      data: prestasi,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.delete('/:id', requireRoles('PEMBINA', 'KOORDINATOR', 'ADMIN'), async (req, res) => {
  try {
    const { id } = req.params;
    const target = await prisma.prestasiLomba.findUnique({
      where: { id },
      include: { eskul: true },
    });
    if (!target) {
      return res.status(404).json({ success: false, message: 'Data prestasi tidak ditemukan.' });
    }

    if (req.user?.role === 'PEMBINA' && target.eskul.pembinaId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Akses ditolak: Anda bukan pembina resmi ekstrakurikuler ini.',
      });
    }

    await prisma.prestasiLomba.delete({ where: { id } });

    const remainingPrestasi = await prisma.prestasiLomba.findMany({
      where: {
        eskulId: target.eskulId,
        siswaId: target.siswaId,
        semester: target.semester,
        tahunAjaran: target.tahunAjaran,
      },
    });
    const totalBonus = remainingPrestasi.reduce((acc, p) => acc + (p.poinTambahan || 0), 0);
    const existingPenilaian = await prisma.penilaian.findFirst({
      where: {
        eskulId: target.eskulId,
        siswaId: target.siswaId,
        semester: target.semester,
        tahunAjaran: target.tahunAjaran,
      },
    });

    if (existingPenilaian) {
      const scored = computeFinalScore({
        nilaiKehadiran: existingPenilaian.nilaiKehadiran,
        nilaiKeaktifan: existingPenilaian.nilaiKeaktifan,
        nilaiKinerja: existingPenilaian.nilaiKinerja,
        poinPrestasi: totalBonus,
      });

      await prisma.penilaian.update({
        where: { id: existingPenilaian.id },
        data: {
          poinPrestasi: totalBonus,
          nilaiAkhir: scored.nilaiAkhir,
          predikat: scored.predikat,
        },
      });
    }

    res.json({ success: true, message: 'Data prestasi berhasil dihapus.', data: target });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
