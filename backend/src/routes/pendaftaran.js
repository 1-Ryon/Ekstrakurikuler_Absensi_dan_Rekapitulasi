import { Router } from 'express';
import { requireRoles } from '../middlewares/auth.js';
import { prisma } from '../config/prisma.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const { eskulId, status, tahunAjaran } = req.query;
    const where = {};
    if (eskulId) where.eskulId = eskulId;
    if (status) where.status = status;
    if (tahunAjaran) where.tahunAjaran = tahunAjaran;

    const list = await prisma.pendaftaranEskul.findMany({
      where,
      include: {
        eskul: {
          select: {
            id: true,
            namaEskul: true,
            kategori: true,
            kuota: true,
            jadwalHari: true,
            jamMulai: true,
            jamSelesai: true,
            lokasi: true,
            pembinaId: true,
            pembina: { select: { id: true, namaLengkap: true, avatarUrl: true } },
            _count: { select: { anggota: { where: { status: 'AKTIF' } }, pendaftaranList: true } },
          },
        },
        siswa: {
          include: {
            kelas: true,
            keanggotaanEskul: {
              where: { status: 'AKTIF' },
              include: { eskul: { select: { id: true, namaEskul: true } } },
            },
          },
        },
      },
      orderBy: [{ createdAt: 'desc' }],
    });

    const formatted = list.map((item) => ({
      id: item.id,
      eskulId: item.eskulId,
      namaEskul: item.eskul?.namaEskul || 'Ekstrakurikuler',
      kategoriEskul: item.eskul?.kategori || 'Olahraga',
      kuotaEskul: item.eskul?.kuota || 40,
      jumlahAnggotaResmi: item.eskul?._count?.anggota || 0,
      totalPendaftarEskul: item.eskul?._count?.pendaftaranList || 0,
      pembinaId: item.eskul?.pembinaId,
      pembinaNama: item.eskul?.pembina?.namaLengkap || 'Pembina Eskul',
      pembinaAvatar: item.eskul?.pembina?.avatarUrl,
      siswaId: item.siswaId,
      namaSiswa: item.siswa?.namaLengkap || 'Nama Siswa',
      nis: item.siswa?.nis || '-',
      nisn: item.siswa?.nisn || item.siswa?.nis || '-',
      kelas: item.siswa?.kelas?.namaKelas || 'X',
      jenisKelamin: item.siswa?.jenisKelamin || 'L',
      avatarUrl: item.siswa?.avatarUrl,
      eskulLain: item.siswa?.keanggotaanEskul?.map((k) => k.eskul.namaEskul) || [],
      tahunAjaran: item.tahunAjaran,
      status: item.status,
      alasanDaftar: item.alasanDaftar,
      catatanPembina: item.catatanPembina,
      catatanKoordinator: item.catatanKoordinator,
      diajukanPada: item.diajukanPada,
      divalidasiPada: item.divalidasiPada,
      createdAt: item.createdAt,
    }));

    res.json({ success: true, data: formatted });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/summary', async (req, res) => {
  try {
    const totalPendaftar = await prisma.pendaftaranEskul.count();
    const pendingPembina = await prisma.pendaftaranEskul.count({
      where: { status: 'MENUNGGU_SELEKSI' },
    });
    const diterimaPembina = await prisma.pendaftaranEskul.count({
      where: { status: 'DITERIMA_PEMBINA' },
    });
    const pendingKoordinator = await prisma.pendaftaranEskul.count({
      where: { status: 'MENUNGGU_VALIDASI_KOORDINATOR' },
    });
    const resmiTerdaftar = await prisma.pendaftaranEskul.count({
      where: { status: 'RESMI_TERDAFTAR' },
    });
    const ditolak = await prisma.pendaftaranEskul.count({
      where: { status: 'DITOLAK' },
    });

    res.json({
      success: true,
      data: {
        totalPendaftar,
        pendingPembina,
        diterimaPembina,
        pendingKoordinator,
        resmiTerdaftar,
        ditolak,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/', requireRoles('SISWA', 'PEMBINA', 'KOORDINATOR', 'ADMIN'), async (req, res) => {
  try {
    const { eskulId, siswaId, alasanDaftar } = req.body;

    if (!eskulId || !siswaId) {
      return res.status(400).json({ success: false, message: 'ID Eskul dan ID Siswa wajib diisi.' });
    }

    const eskul = await prisma.eskul.findUnique({
      where: { id: eskulId },
      include: { _count: { select: { anggota: { where: { status: 'AKTIF' } } } } },
    });
    if (!eskul) {
      return res.status(404).json({ success: false, message: 'Ekstrakurikuler tidak ditemukan.' });
    }

    // Validasi batas maksimal 2 ekstrakurikuler per siswa
    const totalActiveEskul = await prisma.anggotaEskul.count({
      where: {
        siswaId,
        tahunAjaran: '2026/2027',
        status: 'AKTIF',
      },
    });

    const totalPendingPendaftaran = await prisma.pendaftaranEskul.count({
      where: {
        siswaId,
        tahunAjaran: '2026/2027',
        status: { in: ['MENUNGGU_SELEKSI', 'DITERIMA_PEMBINA', 'MENUNGGU_VALIDASI_KOORDINATOR'] },
      },
    });

    if (totalActiveEskul + totalPendingPendaftaran >= 2) {
      return res.status(400).json({
        success: false,
        message: 'Batas kuota tercapai: Setiap siswa dibatasi maksimal mengikuti atau mendaftar 2 cabang ekstrakurikuler.',
      });
    }

    const existingAnggota = await prisma.anggotaEskul.findUnique({
      where: {
        eskulId_siswaId_tahunAjaran: {
          eskulId,
          siswaId,
          tahunAjaran: '2026/2027',
        },
      },
    });
    if (existingAnggota && existingAnggota.status === 'AKTIF') {
      return res.status(400).json({ 
        success: false, 
        isAlreadyRegistered: true,
        message: 'Siswa sudah menjadi anggota resmi ekstrakurikuler ini.' 
      });
    }

    const existingPendaftaran = await prisma.pendaftaranEskul.findUnique({
      where: {
        eskulId_siswaId_tahunAjaran: {
          eskulId,
          siswaId,
          tahunAjaran: '2026/2027',
        },
      },
    });
    if (existingPendaftaran) {
      return res.status(400).json({
        success: false,
        isAlreadyRegistered: true,
        message: `Pendaftaran siswa ini sudah tercatat sebelumnya dengan status: ${existingPendaftaran.status}.`,
        data: existingPendaftaran,
      });
    }

    const created = await prisma.pendaftaranEskul.create({
      data: {
        eskulId,
        siswaId,
        tahunAjaran: '2026/2027',
        status: 'MENUNGGU_SELEKSI',
        alasanDaftar: alasanDaftar ? String(alasanDaftar).trim() : 'Berminat mengembangkan bakat dan kemampuan',
      },
      include: {
        eskul: true,
        siswa: { include: { kelas: true } },
      },
    });

    res.status(201).json({
      success: true,
      message: `Pendaftaran ${created.siswa.namaLengkap} ke ekstrakurikuler ${created.eskul.namaEskul} berhasil dikirim. Menunggu seleksi pembina.`,
      data: created,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.patch('/seleksi-pembina', requireRoles('PEMBINA', 'KOORDINATOR', 'ADMIN'), async (req, res) => {
  try {
    const { pendaftaranIds, status, catatanPembina } = req.body;

    if (!pendaftaranIds || !Array.isArray(pendaftaranIds) || pendaftaranIds.length === 0) {
      return res.status(400).json({ success: false, message: 'Daftar ID pendaftaran wajib disertakan.' });
    }

    if (!['DITERIMA_PEMBINA', 'DITOLAK', 'MENUNGGU_SELEKSI'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Status seleksi tidak valid.' });
    }

    if (req.user?.role === 'PEMBINA') {
      const records = await prisma.pendaftaranEskul.findMany({
        where: { id: { in: pendaftaranIds } },
        include: { eskul: true },
      });
      const invalid = records.some((r) => r.eskul.pembinaId !== req.user.id);
      if (invalid) {
        return res.status(403).json({
          success: false,
          message: 'Akses ditolak: Anda hanya dapat menyeleksi pendaftar pada ekstrakurikuler yang Anda bina.',
        });
      }
    }

    const result = await prisma.pendaftaranEskul.updateMany({
      where: { id: { in: pendaftaranIds } },
      data: {
        status,
        catatanPembina: catatanPembina ? String(catatanPembina).trim() : null,
      },
    });

    res.json({
      success: true,
      message: `Berhasil memperbarui status ${result.count} siswa menjadi '${status}'.`,
      count: result.count,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/ajukan-koordinator', requireRoles('PEMBINA', 'KOORDINATOR', 'ADMIN'), async (req, res) => {
  try {
    const { eskulId, pendaftaranIds, catatanPembina } = req.body;

    if (!eskulId) {
      return res.status(400).json({ success: false, message: 'ID Eskul wajib disertakan.' });
    }

    const eskul = await prisma.eskul.findUnique({
      where: { id: eskulId },
      include: {
        pembina: true,
        _count: { select: { anggota: { where: { status: 'AKTIF' } } } },
      },
    });

    if (!eskul) {
      return res.status(404).json({ success: false, message: 'Ekstrakurikuler tidak ditemukan.' });
    }

    if (req.user?.role === 'PEMBINA' && eskul.pembinaId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: `Akses ditolak: Anda bukan pembina resmi ekstrakurikuler ${eskul.namaEskul}.`,
      });
    }

    const whereClause = {
      eskulId,
      status: 'DITERIMA_PEMBINA',
    };
    if (pendaftaranIds && Array.isArray(pendaftaranIds) && pendaftaranIds.length > 0) {
      whereClause.id = { in: pendaftaranIds };
    }

    const eligible = await prisma.pendaftaranEskul.findMany({
      where: whereClause,
      include: { siswa: true },
    });

    if (eligible.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Tidak ada siswa berstatus Diterima Pembina yang siap diajukan ke Koordinator.',
      });
    }

    const idsToSubmit = eligible.map((item) => item.id);
    const updated = await prisma.pendaftaranEskul.updateMany({
      where: { id: { in: idsToSubmit } },
      data: {
        status: 'MENUNGGU_VALIDASI_KOORDINATOR',
        diajukanPada: new Date(),
        catatanPembina: catatanPembina ? String(catatanPembina).trim() : 'Siswa telah diseleksi dan diterima pembina eskul sesuai kapasitas.',
      },
    });

    res.json({
      success: true,
      message: `Sebanyak ${updated.count} berkas calon siswa ${eskul.namaEskul} berhasil diajukan ke Koordinator untuk validasi resmi.`,
      count: updated.count,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

async function executeValidation(pendaftaranIds, effectiveAction, catatanKoordinator, koordinatorId) {
  if (effectiveAction === 'TOLAK') {
    const updated = await prisma.pendaftaranEskul.updateMany({
      where: { id: { in: pendaftaranIds } },
      data: {
        status: 'DITOLAK',
        catatanKoordinator: catatanKoordinator ? String(catatanKoordinator).trim() : 'Pendaftaran ditolak oleh Koordinator Ekstrakurikuler.',
        divalidasiPada: new Date(),
        divalidasiOlehId: koordinatorId || null,
      },
    });
    return {
      success: true,
      message: `Sebanyak ${updated.count} pendaftaran siswa telah ditolak dengan catatan yang diberikan.`,
      count: updated.count,
    };
  }

  return await prisma.$transaction(async (tx) => {
    const targetList = await tx.pendaftaranEskul.findMany({
      where: { id: { in: pendaftaranIds } },
      include: { eskul: true, siswa: true },
    });

    if (targetList.length === 0) {
      throw new Error('Tidak ada berkas pendaftaran yang cocok.');
    }

    const eskulCounts = {};
    for (const item of targetList) {
      eskulCounts[item.eskulId] = (eskulCounts[item.eskulId] || 0) + 1;
    }

    for (const [eskulId, countToApprove] of Object.entries(eskulCounts)) {
      const eskul = await tx.eskul.findUnique({
        where: { id: eskulId },
        include: { _count: { select: { anggota: { where: { status: 'AKTIF' } } } } },
      });

      if (!eskul) throw new Error(`Eskul dengan ID ${eskulId} tidak ditemukan.`);

      const currentActiveMembers = eskul._count.anggota;
      const remainingQuota = eskul.kuota - currentActiveMembers;

      if (countToApprove > remainingQuota) {
        const err = new Error(
          `Pendaftaran melebihi kuota: Eskul '${eskul.namaEskul}' memiliki kuota ${eskul.kuota} dan saat ini sudah memiliki ${currentActiveMembers} anggota resmi (sisa kuota: ${Math.max(0, remainingQuota)}).`
        );
        err.statusCode = 400;
        throw err;
      }
    }

    const now = new Date();
    let enrolledCount = 0;

    for (const item of targetList) {
      await tx.pendaftaranEskul.update({
        where: { id: item.id },
        data: {
          status: 'RESMI_TERDAFTAR',
          divalidasiPada: now,
          divalidasiOlehId: koordinatorId || null,
          catatanKoordinator: catatanKoordinator ? String(catatanKoordinator).trim() : 'Disetujui dan disahkan oleh Koordinator Ekstrakurikuler.',
        },
      });

      await tx.anggotaEskul.upsert({
        where: {
          eskulId_siswaId_tahunAjaran: {
            eskulId: item.eskulId,
            siswaId: item.siswaId,
            tahunAjaran: item.tahunAjaran || '2026/2027',
          },
        },
        update: { status: 'AKTIF' },
        create: {
          eskulId: item.eskulId,
          siswaId: item.siswaId,
          tahunAjaran: item.tahunAjaran || '2026/2027',
          jabatan: 'ANGGOTA',
          status: 'AKTIF',
        },
      });

      await tx.penilaian.upsert({
        where: {
          eskulId_siswaId_semester_tahunAjaran: {
            eskulId: item.eskulId,
            siswaId: item.siswaId,
            semester: 1,
            tahunAjaran: item.tahunAjaran || '2026/2027',
          },
        },
        update: {},
        create: {
          eskulId: item.eskulId,
          siswaId: item.siswaId,
          semester: 1,
          tahunAjaran: item.tahunAjaran || '2026/2027',
          nilaiKehadiran: 100.0,
          nilaiKeaktifan: 85.0,
          ratingKeaktifan: 'Sangat Baik',
          nilaiKinerja: 85.0,
          poinPrestasi: 0.0,
          nilaiAkhir: 89.5,
          predikat: 'A',
        },
      });

      enrolledCount++;
    }

    return {
      success: true,
      message: `Validasi berhasil! Sebanyak ${enrolledCount} siswa telah resmi disahkan sebagai anggota ekstrakurikuler.`,
      count: enrolledCount,
    };
  });
}

router.post('/validasi-koordinator', requireRoles('KOORDINATOR', 'ADMIN'), async (req, res) => {
  try {
    const { pendaftaranIds, aksi, status, catatanKoordinator, koordinatorId } = req.body;

    if (!pendaftaranIds || !Array.isArray(pendaftaranIds) || pendaftaranIds.length === 0) {
      return res.status(400).json({ success: false, message: 'Daftar ID pendaftaran wajib disertakan.' });
    }

    const rawAction = (aksi || status || '').toUpperCase();
    const isApprove = ['SETUJUI', 'DISETUJUI', 'APPROVE', 'APPROVED', 'ACCEPT', 'ACCEPTED'].includes(rawAction);
    const isReject = ['TOLAK', 'DITOLAK', 'REJECT', 'REJECTED', 'DECLINE', 'DECLINED'].includes(rawAction);
    const effectiveAction = isApprove ? 'SETUJUI' : isReject ? 'TOLAK' : null;

    if (!effectiveAction) {
      return res.status(400).json({ success: false, message: 'Aksi validasi harus berupa SETUJUI / APPROVE atau TOLAK / REJECT.' });
    }

    const result = await executeValidation(pendaftaranIds, effectiveAction, catatanKoordinator, koordinatorId || req.user?.id);
    res.json(result);
  } catch (error) {
    res.status(error.statusCode || 500).json({ success: false, message: error.message });
  }
});

router.patch('/:id/validate', requireRoles('KOORDINATOR', 'ADMIN'), async (req, res) => {
  try {
    const { id } = req.params;
    const { aksi, status, catatanKoordinator, koordinatorId } = req.body;

    const rawAction = (aksi || status || 'SETUJUI').toUpperCase();
    const isApprove = ['SETUJUI', 'DISETUJUI', 'APPROVE', 'APPROVED', 'ACCEPT', 'ACCEPTED'].includes(rawAction);
    const isReject = ['TOLAK', 'DITOLAK', 'REJECT', 'REJECTED', 'DECLINE', 'DECLINED'].includes(rawAction);
    const effectiveAction = isApprove ? 'SETUJUI' : isReject ? 'TOLAK' : null;

    if (!effectiveAction) {
      return res.status(400).json({ success: false, message: 'Aksi validasi harus berupa SETUJUI / APPROVE atau TOLAK / REJECT.' });
    }

    const result = await executeValidation([id], effectiveAction, catatanKoordinator, koordinatorId || req.user?.id);
    res.json(result);
  } catch (error) {
    res.status(error.statusCode || 500).json({ success: false, message: error.message });
  }
});

export default router;
