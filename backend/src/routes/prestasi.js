import { Router } from 'express';
import { requireRoles } from '../middlewares/auth.js';
import { prisma } from '../config/prisma.js';

const router = Router();

// ==========================================
// PRESTASI & PERLOMBAAN EKSTERNAL
// ==========================================

// 1. GET /api/prestasi: Daftar prestasi lomba dengan filter eskulId & siswaId
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

// 2. POST /api/prestasi: Tambah capaian prestasi & sinkronisasi nilai akhir
router.post('/', requireRoles('PEMBINA', 'KOORDINATOR', 'ADMIN', 'SISWA'), async (req, res) => {
  try {
    const { eskulId, siswaId, namaLomba, penyelenggara, tingkat, peringkat, tanggal, buktiSertifikat, keterangan } = req.body;

    if (!eskulId || !siswaId || !namaLomba) {
      return res.status(400).json({ success: false, message: 'Data lomba tidak lengkap.' });
    }

    // Hitung bobot poin bonus otomatis berdasarkan tingkat & juara
    let poinTambahan = 5.0; // default partisipan
    if (peringkat === 'JUARA_1') {
      poinTambahan = tingkat === 'INTERNASIONAL' ? 25 : tingkat === 'NASIONAL' ? 20 : tingkat === 'PROVINSI' ? 15 : 10;
    } else if (peringkat === 'JUARA_2') {
      poinTambahan = tingkat === 'INTERNASIONAL' ? 20 : tingkat === 'NASIONAL' ? 15 : tingkat === 'PROVINSI' ? 12 : 8;
    } else if (peringkat === 'JUARA_3') {
      poinTambahan = tingkat === 'INTERNASIONAL' ? 15 : tingkat === 'NASIONAL' ? 12 : tingkat === 'PROVINSI' ? 10 : 6;
    } else if (peringkat === 'HARAPAN_1' || peringkat === 'FINALIS') {
      poinTambahan = 5;
    }

    const prestasi = await prisma.prestasiLomba.create({
      data: {
        eskulId,
        siswaId,
        namaLomba,
        penyelenggara: penyelenggara || 'Kemenpora / Dinas Pendidikan',
        tingkat: tingkat || 'KOTA',
        peringkat: peringkat || 'JUARA_1',
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

    // Otomatis akumulasi poin ke tabel Penilaian siswa semester ini
    const existingPenilaian = await prisma.penilaian.findFirst({
      where: { eskulId, siswaId, semester: 1, tahunAjaran: '2026/2027' },
    });

    if (existingPenilaian) {
      const newPoinPrestasi = Math.min(15, (existingPenilaian.poinPrestasi || 0) + poinTambahan);
      // Formula: 40% Kehadiran + 25% Keaktifan + 25% Kinerja + 10% Prestasi Lomba
      const newFinalScore = Math.min(
        100,
        existingPenilaian.nilaiKehadiran * 0.4 +
        existingPenilaian.nilaiKeaktifan * 0.25 +
        existingPenilaian.nilaiKinerja * 0.25 +
        newPoinPrestasi
      );
      const newPredikat = newFinalScore >= 90 ? 'A' : newFinalScore >= 80 ? 'B' : newFinalScore >= 70 ? 'C' : 'D';

      await prisma.penilaian.update({
        where: { id: existingPenilaian.id },
        data: {
          poinPrestasi: newPoinPrestasi,
          nilaiAkhir: Math.round(newFinalScore * 10) / 10,
          predikat: newPredikat,
        },
      });
    }

    res.status(201).json({
      success: true,
      message: `Prestasi ${namaLomba} (${peringkat}) berhasil dicatat. Bonus +${poinTambahan} poin ditambahkan ke nilai akhir.`,
      data: prestasi,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 3. DELETE /api/prestasi/:id: Hapus data prestasi & kalkulasi ulang nilai akhir
router.delete('/:id', requireRoles('PEMBINA', 'KOORDINATOR', 'ADMIN'), async (req, res) => {
  try {
    const { id } = req.params;
    const target = await prisma.prestasiLomba.findUnique({ where: { id } });
    if (!target) {
      return res.status(404).json({ success: false, message: 'Data prestasi tidak ditemukan.' });
    }

    await prisma.prestasiLomba.delete({ where: { id } });

    // Hitung ulang akumulasi poin prestasi di penilaian
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
      const newBonus = Math.min(15, totalBonus);
      const newScore = Math.min(
        100,
        existingPenilaian.nilaiKehadiran * 0.4 +
        existingPenilaian.nilaiKeaktifan * 0.25 +
        existingPenilaian.nilaiKinerja * 0.25 +
        newBonus
      );
      const newPredikat = newScore >= 90 ? 'A' : newScore >= 80 ? 'B' : newScore >= 70 ? 'C' : 'D';
      await prisma.penilaian.update({
        where: { id: existingPenilaian.id },
        data: {
          poinPrestasi: newBonus,
          nilaiAkhir: Math.round(newScore * 10) / 10,
          predikat: newPredikat,
        },
      });
    }

    res.json({ success: true, message: 'Data prestasi berhasil dihapus.', data: target });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
