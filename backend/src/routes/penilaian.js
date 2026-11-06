import { Router } from 'express';
import { requireRoles } from '../middlewares/auth.js';
import { prisma } from '../config/prisma.js';
import { computeFinalScore, calculatePredicate } from '../utils/scoring.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const records = await prisma.penilaian.findMany({
      include: {
        siswa: { include: { kelas: true } },
        eskul: { select: { namaEskul: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const formatted = records.map((r) => ({
      id: r.id,
      eskulId: r.eskulId,
      namaEskul: r.eskul?.namaEskul || 'Eskul',
      siswaId: r.siswaId,
      namaSiswa: r.siswa?.namaLengkap || 'Siswa',
      nisn: r.siswa?.nis || '-',
      kelas: r.siswa?.kelas?.namaKelas || '-',
      semester: r.semester,
      tahunAjaran: r.tahunAjaran,
      nilaiKehadiran: r.nilaiKehadiran,
      nilaiKeaktifan: r.nilaiKeaktifan,
      nilaiKinerja: r.nilaiKinerja,
      poinPrestasi: r.poinPrestasi,
      nilaiAkhir: r.nilaiAkhir,
      predikat: r.predikat,
      catatan: r.capaianKompetensi || '',
    }));

    res.json({ success: true, data: formatted });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/', requireRoles('PEMBINA', 'KOORDINATOR', 'ADMIN'), async (req, res) => {
  try {
    const { items } = req.body;
    if (!items || !Array.isArray(items)) {
      return res.status(400).json({ success: false, message: 'Daftar nilai tidak valid' });
    }

    let savedCount = 0;
    const savedItems = [];
    for (const item of items) {
      const siswa = await prisma.siswa.findFirst({
        where: {
          OR: [
            { id: item.siswaId },
            { nis: String(item.siswaId).trim() },
            { nisn: String(item.siswaId).trim() },
          ],
        },
      });

      const eskul = await prisma.eskul.findFirst({
        where: {
          OR: [
            { id: item.eskulId },
            { namaEskul: item.eskulId },
            { namaEskul: item.namaEskul || '' },
          ],
        },
      });

      if (!siswa || !eskul) continue;

      if (req.user?.role === 'PEMBINA' && eskul.pembinaId !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: `Akses ditolak: Anda bukan pembina resmi ekstrakurikuler ${eskul.namaEskul}.`,
        });
      }

      const calculated = computeFinalScore({
        nilaiKehadiran: item.nilaiKehadiran !== undefined ? item.nilaiKehadiran : 90,
        nilaiKeaktifan: item.nilaiKeaktifan !== undefined ? item.nilaiKeaktifan : 85,
        nilaiKinerja: item.nilaiKinerja !== undefined ? item.nilaiKinerja : 85,
        poinPrestasi: item.poinPrestasi !== undefined ? item.poinPrestasi : 0,
      });

      const finalScore = item.nilaiAkhir !== undefined && !isNaN(Number(item.nilaiAkhir))
        ? Math.min(100, Math.max(0, Math.round(Number(item.nilaiAkhir) * 10) / 10))
        : calculated.nilaiAkhir;

      const finalPredikat = item.predikat || calculatePredicate(finalScore);
      const ratingKeaktifan = item.ratingKeaktifan || (calculated.nilaiKeaktifan >= 88 ? 'Sangat Baik' : calculated.nilaiKeaktifan >= 75 ? 'Baik' : 'Cukup');

      const saved = await prisma.penilaian.upsert({
        where: {
          eskulId_siswaId_semester_tahunAjaran: {
            eskulId: eskul.id,
            siswaId: siswa.id,
            semester: item.semester || 1,
            tahunAjaran: item.tahunAjaran || '2026/2027',
          },
        },
        update: {
          nilaiKehadiran: calculated.nilaiKehadiran,
          nilaiKeaktifan: calculated.nilaiKeaktifan,
          ratingKeaktifan,
          nilaiKinerja: calculated.nilaiKinerja,
          poinPrestasi: calculated.poinPrestasi,
          nilaiAkhir: finalScore,
          predikat: finalPredikat,
          capaianKompetensi: item.catatan || item.capaianKompetensi || '',
        },
        create: {
          eskulId: eskul.id,
          siswaId: siswa.id,
          semester: item.semester || 1,
          tahunAjaran: item.tahunAjaran || '2026/2027',
          nilaiKehadiran: calculated.nilaiKehadiran,
          nilaiKeaktifan: calculated.nilaiKeaktifan,
          ratingKeaktifan,
          nilaiKinerja: calculated.nilaiKinerja,
          poinPrestasi: calculated.poinPrestasi,
          nilaiAkhir: finalScore,
          predikat: finalPredikat,
          capaianKompetensi: item.catatan || item.capaianKompetensi || '',
        },
      });
      savedItems.push(saved);
      savedCount++;
    }

    res.json({
      success: true,
      message: `Seluruh nilai (${savedCount} siswa) berhasil disimpan ke database.`,
      data: savedItems,
      count: savedCount,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
