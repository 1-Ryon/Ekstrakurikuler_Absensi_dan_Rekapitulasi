import { Router } from 'express';
import { prisma } from '../config/prisma.js';

const router = Router();

// ==========================================
// PENDAFTARAN & VALIDASI KUOTA ANGGOTA ESKUL
// ==========================================

// 1. GET /api/pendaftaran: List pendaftaran siswa
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
            _count: { select: { anggota: true, pendaftaranList: true } },
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

// 2. GET /api/pendaftaran/summary: Ringkasan statistik & badge counter
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
        pendingKoordinator, // Badge untuk Koordinator & Admin
        resmiTerdaftar,
        ditolak,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 3. POST /api/pendaftaran: Siswa / Form mendaftar eskul baru
router.post('/', async (req, res) => {
  try {
    const { eskulId, siswaId, alasanDaftar } = req.body;

    if (!eskulId || !siswaId) {
      return res.status(400).json({ success: false, message: 'ID Eskul dan ID Siswa wajib diisi.' });
    }

    const eskul = await prisma.eskul.findUnique({
      where: { id: eskulId },
      include: { _count: { select: { anggota: true } } },
    });
    if (!eskul) {
      return res.status(404).json({ success: false, message: 'Ekstrakurikuler tidak ditemukan.' });
    }

    // Cek apakah sudah terdaftar di anggota resmi
    const existingAnggota = await prisma.anggotaEskul.findUnique({
      where: {
        eskulId_siswaId_tahunAjaran: {
          eskulId,
          siswaId,
          tahunAjaran: '2026/2027',
        },
      },
    });
    if (existingAnggota) {
      return res.status(400).json({ 
        success: false, 
        isAlreadyRegistered: true,
        message: 'Siswa sudah menjadi anggota resmi ekstrakurikuler ini.' 
      });
    }

    // Cek pendaftaran aktif
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
        alasanDaftar: alasanDaftar ? alasanDaftar.trim() : 'Berminat mengembangkan bakat dan kemampuan',
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

// 4. PATCH /api/pendaftaran/seleksi-pembina: Pembina memilih / menerima / menolak siswa pendaftar
router.patch('/seleksi-pembina', async (req, res) => {
  try {
    const { pendaftaranIds, status, catatanPembina } = req.body;

    if (!pendaftaranIds || !Array.isArray(pendaftaranIds) || pendaftaranIds.length === 0) {
      return res.status(400).json({ success: false, message: 'Daftar ID pendaftaran wajib disertakan.' });
    }

    if (!['DITERIMA_PEMBINA', 'DITOLAK', 'MENUNGGU_SELEKSI'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Status seleksi tidak valid.' });
    }

    const result = await prisma.pendaftaranEskul.updateMany({
      where: { id: { in: pendaftaranIds } },
      data: {
        status,
        catatanPembina: catatanPembina ? catatanPembina.trim() : null,
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

// 5. POST /api/pendaftaran/ajukan-koordinator: Pembina mengirim batch siswa terpilih ke Koordinator
router.post('/ajukan-koordinator', async (req, res) => {
  try {
    const { eskulId, pendaftaranIds, catatanPembina } = req.body;

    if (!eskulId) {
      return res.status(400).json({ success: false, message: 'ID Eskul wajib disertakan.' });
    }

    const eskul = await prisma.eskul.findUnique({
      where: { id: eskulId },
      include: {
        pembina: true,
        _count: { select: { anggota: true } },
      },
    });

    if (!eskul) {
      return res.status(404).json({ success: false, message: 'Ekstrakurikuler tidak ditemukan.' });
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
        catatanPembina: catatanPembina ? catatanPembina.trim() : 'Siswa telah diseleksi dan diterima pembina eskul sesuai kapasitas.',
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

// 6. POST /api/pendaftaran/validasi-koordinator: Koordinator memvalidasi & meresmikan siswa masuk eskul
router.post('/validasi-koordinator', async (req, res) => {
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

    const targetList = await prisma.pendaftaranEskul.findMany({
      where: { id: { in: pendaftaranIds } },
      include: {
        eskul: true,
        siswa: true,
      },
    });

    if (targetList.length === 0) {
      return res.status(404).json({ success: false, message: 'Tidak ada berkas pendaftaran yang cocok.' });
    }

    if (effectiveAction === 'SETUJUI') {
      const now = new Date();
      let enrolledCount = 0;

      for (const item of targetList) {
        await prisma.pendaftaranEskul.update({
          where: { id: item.id },
          data: {
            status: 'RESMI_TERDAFTAR',
            divalidasiPada: now,
            divalidasiOlehId: koordinatorId || null,
            catatanKoordinator: catatanKoordinator ? catatanKoordinator.trim() : 'Disetujui dan disahkan oleh Koordinator Ekstrakurikuler.',
          },
        });

        await prisma.anggotaEskul.upsert({
          where: {
            eskulId_siswaId_tahunAjaran: {
              eskulId: item.eskulId,
              siswaId: item.siswaId,
              tahunAjaran: item.tahunAjaran || '2026/2027',
            },
          },
          update: {
            status: 'AKTIF',
          },
          create: {
            eskulId: item.eskulId,
            siswaId: item.siswaId,
            tahunAjaran: item.tahunAjaran || '2026/2027',
            jabatan: 'ANGGOTA',
            status: 'AKTIF',
          },
        });

        await prisma.penilaian.upsert({
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

      return res.json({
        success: true,
        message: `Validasi berhasil! Sebanyak ${enrolledCount} siswa telah resmi disahkan sebagai anggota ekstrakurikuler.`,
        count: enrolledCount,
      });
    } else {
      const updated = await prisma.pendaftaranEskul.updateMany({
        where: { id: { in: pendaftaranIds } },
        data: {
          status: 'DITOLAK',
          catatanKoordinator: catatanKoordinator ? catatanKoordinator.trim() : 'Pendaftaran ditolak oleh Koordinator Ekstrakurikuler.',
          divalidasiPada: new Date(),
          divalidasiOlehId: koordinatorId || null,
        },
      });

      return res.json({
        success: true,
        message: `Sebanyak ${updated.count} pendaftaran siswa telah ditolak dengan catatan yang diberikan.`,
        count: updated.count,
      });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
