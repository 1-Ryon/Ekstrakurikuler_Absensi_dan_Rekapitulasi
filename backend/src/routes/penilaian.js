import { Router } from 'express';
import { requireRoles } from '../middlewares/auth.js';
import { prisma } from '../config/prisma.js';

const router = Router();

// ==========================================
// PENILAIAN RAPOR EKSTRAKURIKULER
// ==========================================

// 1. GET /api/penilaian: Rekap nilai rapor ekstrakurikuler
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

// 2. POST /api/penilaian: Batch input/update nilai rapor (Formula Kurikulum Merdeka)
router.post('/', requireRoles('PEMBINA', 'KOORDINATOR', 'ADMIN'), async (req, res) => {
  try {
    const { items } = req.body;
    if (!items || !Array.isArray(items)) {
      return res.status(400).json({ success: false, message: 'Daftar nilai tidak valid' });
    }

    let savedCount = 0;
    const savedItems = [];
    for (const item of items) {
      // Resolve siswa by id, nis, or nisn
      const siswa = await prisma.siswa.findFirst({
        where: {
          OR: [
            { id: item.siswaId },
            { nis: String(item.siswaId).trim() },
            { nisn: String(item.siswaId).trim() },
          ],
        },
      });

      // Resolve eskul by id or name
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

      const rawKehadiran = Number(item.nilaiKehadiran);
      const rawKeaktifan = Number(item.nilaiKeaktifan);
      const rawKinerja = Number(item.nilaiKinerja);
      const rawPrestasi = Number(item.poinPrestasi);

      const kehadiran = Math.min(100, Math.max(0, isNaN(rawKehadiran) ? 90 : rawKehadiran));
      const keaktifan = Math.min(100, Math.max(0, isNaN(rawKeaktifan) ? 85 : rawKeaktifan));
      const kinerja = Math.min(100, Math.max(0, isNaN(rawKinerja) ? 85 : rawKinerja));
      const prestasi = Math.min(25, Math.max(0, isNaN(rawPrestasi) ? 0 : rawPrestasi));

      const rawFinalScore = item.nilaiAkhir !== undefined && !isNaN(Number(item.nilaiAkhir))
        ? Number(item.nilaiAkhir)
        : Math.min(100, Math.round((kehadiran * 0.4 + keaktifan * 0.25 + kinerja * 0.25 + prestasi) * 10) / 10);
      const finalScore = Math.min(100, Math.max(0, Math.round(rawFinalScore * 10) / 10));

      const finalPredikat = item.predikat || (finalScore >= 90 ? 'A' : finalScore >= 80 ? 'B' : finalScore >= 70 ? 'C' : 'D');
      const ratingKeaktifan = item.ratingKeaktifan || (keaktifan >= 88 ? 'Sangat Baik' : keaktifan >= 75 ? 'Baik' : 'Cukup');

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
          nilaiKehadiran: kehadiran,
          nilaiKeaktifan: keaktifan,
          ratingKeaktifan,
          nilaiKinerja: kinerja,
          poinPrestasi: prestasi,
          nilaiAkhir: finalScore,
          predikat: finalPredikat,
          capaianKompetensi: item.catatan || item.capaianKompetensi || '',
        },
        create: {
          eskulId: eskul.id,
          siswaId: siswa.id,
          semester: item.semester || 1,
          tahunAjaran: item.tahunAjaran || '2026/2027',
          nilaiKehadiran: kehadiran,
          nilaiKeaktifan: keaktifan,
          ratingKeaktifan,
          nilaiKinerja: kinerja,
          poinPrestasi: prestasi,
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
