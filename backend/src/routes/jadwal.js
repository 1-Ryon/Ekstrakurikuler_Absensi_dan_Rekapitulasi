import { Router } from 'express';
import { prisma } from '../config/prisma.js';
import { requireRoles } from '../middlewares/auth.js';

const router = Router();

// GET /api/jadwal-proposals
router.get('/', async (req, res) => {
  try {
    const { pembinaId, status, eskulId } = req.query;
    const where = {};
    if (pembinaId) where.pembinaId = pembinaId;
    if (status) where.status = status;
    if (eskulId) where.eskulId = eskulId;

    const list = await prisma.pengajuanJadwal.findMany({
      where,
      include: {
        eskul: {
          select: {
            namaEskul: true,
            kategori: true,
            lokasi: true,
            jadwalHari: true,
            jamMulai: true,
            jamSelesai: true,
          },
        },
        pembina: {
          select: {
            namaLengkap: true,
            avatarUrl: true,
            spesialisasi: true,
            nip: true,
          },
        },
        diverifikasiOleh: {
          select: {
            namaLengkap: true,
            spesialisasi: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const formatted = list.map((item) => ({
      id: item.id,
      eskulId: item.eskulId,
      namaEskul: item.eskul?.namaEskul || 'Ekstrakurikuler',
      kategoriEskul: item.eskul?.kategori || 'Olahraga',
      pembinaId: item.pembinaId,
      pembinaNama: item.pembina?.namaLengkap || 'Pembina',
      pembinaAvatar: item.pembina?.avatarUrl,
      pembinaNip: item.pembina?.nip,
      hariLama: item.hariLama,
      jamMulaiLama: item.jamMulaiLama,
      jamSelesaiLama: item.jamSelesaiLama,
      lokasiLama: item.lokasiLama || item.eskul?.lokasi || 'SMK Al Amanah',
      hariBaru: item.hariBaru,
      jamMulaiBaru: item.jamMulaiBaru,
      jamSelesaiBaru: item.jamSelesaiBaru,
      lokasiBaru: item.lokasiBaru || item.lokasiLama || item.eskul?.lokasi || 'SMK Al Amanah',
      jenisPerubahan: item.jenisPerubahan,
      tanggalEfektif: item.tanggalEfektif,
      alasan: item.alasan,
      status: item.status,
      catatanKoordinator: item.catatanKoordinator,
      diverifikasiOlehId: item.diverifikasiOlehId,
      diverifikasiOlehNama: item.diverifikasiOleh?.namaLengkap || null,
      diverifikasiPada: item.diverifikasiPada,
      createdAt: item.createdAt,
    }));

    res.json({ success: true, data: formatted });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/jadwal-proposals
router.post('/', requireRoles('PEMBINA', 'KOORDINATOR', 'ADMIN'), async (req, res) => {
  try {
    const {
      eskulId,
      pembinaId,
      hariBaru,
      jamMulaiBaru,
      jamSelesaiBaru,
      lokasiBaru,
      jenisPerubahan,
      tanggalEfektif,
      alasan,
    } = req.body;

    if (!eskulId || !pembinaId) {
      return res.status(400).json({ success: false, message: 'ID Eskul dan Pembina wajib disertakan.' });
    }
    if (!hariBaru || !jamMulaiBaru || !jamSelesaiBaru) {
      return res.status(400).json({ success: false, message: 'Hari baru dan jam kegiatan wajib ditentukan.' });
    }
    if (!alasan || alasan.trim().length < 5) {
      return res.status(400).json({
        success: false,
        message: 'Alasan pengajuan perubahan jadwal wajib diisi minimal 5 karakter agar dapat ditinjau koordinator.',
      });
    }

    const eskul = await prisma.eskul.findUnique({ where: { id: eskulId } });
    if (!eskul) {
      return res.status(404).json({ success: false, message: 'Data eskul tidak ditemukan.' });
    }

    let validPembinaId = pembinaId;
    const guruCheck = await prisma.guru.findUnique({ where: { id: pembinaId } });
    if (!guruCheck) {
      validPembinaId = eskul.pembinaId;
    }

    const proposal = await prisma.pengajuanJadwal.create({
      data: {
        eskulId,
        pembinaId: validPembinaId,
        hariLama: eskul.jadwalHari,
        jamMulaiLama: eskul.jamMulai,
        jamSelesaiLama: eskul.jamSelesai,
        lokasiLama: eskul.lokasi,
        hariBaru: hariBaru.trim(),
        jamMulaiBaru: jamMulaiBaru.trim(),
        jamSelesaiBaru: jamSelesaiBaru.trim(),
        lokasiBaru: lokasiBaru ? lokasiBaru.trim() : eskul.lokasi,
        jenisPerubahan: jenisPerubahan || 'PERMANEN',
        tanggalEfektif: tanggalEfektif || null,
        alasan: alasan.trim(),
        status: 'MENUNGGU_VALIDASI',
      },
      include: {
        eskul: true,
        pembina: { select: { namaLengkap: true, avatarUrl: true } },
      },
    });

    res.status(201).json({
      success: true,
      message: 'Permohonan perubahan jadwal berhasil diajukan kepada Koordinator Eskul.',
      data: {
        id: proposal.id,
        eskulId: proposal.eskulId,
        namaEskul: proposal.eskul.namaEskul,
        pembinaId: proposal.pembinaId,
        pembinaNama: proposal.pembina.namaLengkap,
        hariLama: proposal.hariLama,
        jamMulaiLama: proposal.jamMulaiLama,
        jamSelesaiLama: proposal.jamSelesaiLama,
        lokasiLama: proposal.lokasiLama,
        hariBaru: proposal.hariBaru,
        jamMulaiBaru: proposal.jamMulaiBaru,
        jamSelesaiBaru: proposal.jamSelesaiBaru,
        lokasiBaru: proposal.lokasiBaru,
        jenisPerubahan: proposal.jenisPerubahan,
        tanggalEfektif: proposal.tanggalEfektif,
        alasan: proposal.alasan,
        status: proposal.status,
        createdAt: proposal.createdAt,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PATCH /api/jadwal-proposals/:id/validate
router.patch('/:id/validate', requireRoles('ADMIN', 'KOORDINATOR'), async (req, res) => {
  try {
    const { id } = req.params;
    const { status, aksi, catatanKoordinator, koordinatorId } = req.body;

    const rawStatus = (status || aksi || '').toUpperCase();
    const isApprove = ['DISETUJUI', 'SETUJUI', 'APPROVE', 'APPROVED', 'ACCEPT', 'ACCEPTED'].includes(rawStatus);
    const isReject = ['DITOLAK', 'TOLAK', 'REJECT', 'REJECTED', 'DECLINE', 'DECLINED'].includes(rawStatus);
    const effectiveStatus = isApprove ? 'DISETUJUI' : isReject ? 'DITOLAK' : null;

    if (!effectiveStatus) {
      return res.status(400).json({
        success: false,
        message: "Status validasi harus 'DISETUJUI' / 'APPROVE' atau 'DITOLAK' / 'REJECT'.",
      });
    }

    const proposal = await prisma.pengajuanJadwal.findUnique({
      where: { id },
      include: { eskul: true },
    });

    if (!proposal) {
      return res.status(404).json({ success: false, message: 'Permohonan perubahan jadwal tidak ditemukan.' });
    }

    if (proposal.status !== 'MENUNGGU_VALIDASI') {
      return res.status(400).json({
        success: false,
        message: `Permohonan ini telah berstatus '${proposal.status}' sebelumnya.`,
      });
    }

    let updatedEskul = null;

    if (effectiveStatus === 'DISETUJUI') {
      updatedEskul = await prisma.eskul.update({
        where: { id: proposal.eskulId },
        data: {
          jadwalHari: proposal.hariBaru,
          jamMulai: proposal.jamMulaiBaru,
          jamSelesai: proposal.jamSelesaiBaru,
          lokasi: proposal.lokasiBaru || proposal.lokasiLama || undefined,
        },
      });
    }

    let validVerifikatorId = null;
    if (koordinatorId) {
      const koorCheck = await prisma.guru.findUnique({ where: { id: koordinatorId } });
      if (koorCheck) {
        validVerifikatorId = koordinatorId;
      } else {
        const defaultKoor = await prisma.guru.findFirst({ where: { role: 'KOORDINATOR' } });
        validVerifikatorId = defaultKoor?.id || null;
      }
    }

    const updatedProposal = await prisma.pengajuanJadwal.update({
      where: { id },
      data: {
        status: effectiveStatus,
        catatanKoordinator: catatanKoordinator ? catatanKoordinator.trim() : (effectiveStatus === 'DISETUJUI' ? 'Disetujui oleh Koordinator' : 'Ditolak oleh Koordinator'),
        diverifikasiOlehId: validVerifikatorId,
        diverifikasiPada: new Date(),
      },
      include: {
        eskul: true,
        pembina: { select: { namaLengkap: true, avatarUrl: true } },
        diverifikasiOleh: { select: { namaLengkap: true } },
      },
    });

    res.json({
      success: true,
      message: effectiveStatus === 'DISETUJUI'
        ? `Permohonan perubahan jadwal disetujui. Jadwal ${proposal.eskul.namaEskul} resmi diperbarui ke ${proposal.hariBaru}, ${proposal.jamMulaiBaru} - ${proposal.jamSelesaiBaru} WIB.`
        : 'Permohonan perubahan jadwal ditolak.',
      data: {
        id: updatedProposal.id,
        eskulId: updatedProposal.eskulId,
        namaEskul: updatedProposal.eskul.namaEskul,
        pembinaId: updatedProposal.pembinaId,
        pembinaNama: updatedProposal.pembina.namaLengkap,
        hariLama: updatedProposal.hariLama,
        jamMulaiLama: updatedProposal.jamMulaiLama,
        jamSelesaiLama: updatedProposal.jamSelesaiLama,
        lokasiLama: updatedProposal.lokasiLama,
        hariBaru: updatedProposal.hariBaru,
        jamMulaiBaru: updatedProposal.jamMulaiBaru,
        jamSelesaiBaru: updatedProposal.jamSelesaiBaru,
        lokasiBaru: updatedProposal.lokasiBaru,
        jenisPerubahan: updatedProposal.jenisPerubahan,
        tanggalEfektif: updatedProposal.tanggalEfektif,
        alasan: updatedProposal.alasan,
        status: updatedProposal.status,
        catatanKoordinator: updatedProposal.catatanKoordinator,
        diverifikasiOlehNama: updatedProposal.diverifikasiOleh?.namaLengkap || 'Koordinator Eskul',
        diverifikasiPada: updatedProposal.diverifikasiPada,
      },
      updatedEskul,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
