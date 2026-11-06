import { Router } from 'express';
import { prisma } from '../config/prisma.js';
import { requireRoles } from '../middlewares/auth.js';

const router = Router();

function timeToMinutes(timeStr) {
  if (!timeStr) return 0;
  const [h, m] = timeStr.replace('.', ':').split(':').map((x) => parseInt(x, 10) || 0);
  return h * 60 + m;
}

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
      diverifikasiOlehNama: item.diverifikasiOleh?.namaLengkap || (item.status !== 'MENUNGGU_VALIDASI' ? 'Administrator Sistem' : null),
      diverifikasiPada: item.diverifikasiPada,
      verifikatorId: item.diverifikasiOlehId,
      verifikatorNama: item.diverifikasiOleh?.namaLengkap || (item.status !== 'MENUNGGU_VALIDASI' ? 'Administrator Sistem' : null),
      verifiedAt: item.diverifikasiPada,
      createdAt: item.createdAt,
    }));

    res.json({ success: true, data: formatted });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

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

    if (req.user?.role === 'PEMBINA' && eskul.pembinaId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: `Akses ditolak: Anda bukan pembina resmi ekstrakurikuler ${eskul.namaEskul}.`,
      });
    }

    const cleanHariBaru = hariBaru.trim();
    const cleanJamMulai = jamMulaiBaru.trim();
    const cleanJamSelesai = jamSelesaiBaru.trim();
    const cleanLokasi = (lokasiBaru ? lokasiBaru.trim() : eskul.lokasi).trim();

    const proposedStartMin = timeToMinutes(cleanJamMulai);
    const proposedEndMin = timeToMinutes(cleanJamSelesai);

    const otherEskuls = await prisma.eskul.findMany({
      where: {
        id: { not: eskulId },
        status: 'Aktif',
        jadwalHari: { equals: cleanHariBaru },
      },
    });

    const conflictingEskul = otherEskuls.find((other) => {
      const isSameLocation = other.lokasi && other.lokasi.trim().toLowerCase() === cleanLokasi.toLowerCase();
      if (!isSameLocation) return false;

      const otherStartMin = timeToMinutes(other.jamMulai);
      const otherEndMin = timeToMinutes(other.jamSelesai);

      return proposedStartMin < otherEndMin && proposedEndMin > otherStartMin;
    });

    if (conflictingEskul) {
      return res.status(400).json({
        success: false,
        message: `Konflik Jadwal: Lokasi '${cleanLokasi}' pada hari ${cleanHariBaru} (${cleanJamMulai} - ${cleanJamSelesai}) sudah digunakan oleh ekstrakurikuler '${conflictingEskul.namaEskul}' (${conflictingEskul.jamMulai} - ${conflictingEskul.jamSelesai}).`,
      });
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
        hariBaru: cleanHariBaru,
        jamMulaiBaru: cleanJamMulai,
        jamSelesaiBaru: cleanJamSelesai,
        lokasiBaru: cleanLokasi,
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

    let validVerifikatorId = null;
    if (koordinatorId) {
      const koorCheck = await prisma.guru.findUnique({ where: { id: koordinatorId } });
      if (koorCheck) validVerifikatorId = koorCheck.id;
    }
    if (!validVerifikatorId && req.user?.id) {
      const userGuruCheck = await prisma.guru.findUnique({ where: { id: req.user.id } });
      if (userGuruCheck) validVerifikatorId = userGuruCheck.id;
    }
    if (!validVerifikatorId && req.user?.role === 'ADMIN') {
      const defaultKoor = await prisma.guru.findFirst({ where: { role: 'KOORDINATOR', statusAktif: true } });
      if (defaultKoor) validVerifikatorId = defaultKoor.id;
    }

    const result = await prisma.$transaction(async (tx) => {
      let updatedEskul = null;

      if (effectiveStatus === 'DISETUJUI' && proposal.jenisPerubahan === 'PERMANEN') {
        updatedEskul = await tx.eskul.update({
          where: { id: proposal.eskulId },
          data: {
            jadwalHari: proposal.hariBaru,
            jamMulai: proposal.jamMulaiBaru,
            jamSelesai: proposal.jamSelesaiBaru,
            lokasi: proposal.lokasiBaru || proposal.lokasiLama || undefined,
          },
        });
      }

      const updatedProposal = await tx.pengajuanJadwal.update({
        where: { id },
        data: {
          status: effectiveStatus,
          catatanKoordinator: catatanKoordinator
            ? catatanKoordinator.trim()
            : (effectiveStatus === 'DISETUJUI'
                ? (req.user?.role === 'ADMIN' ? 'Disetujui oleh Administrator Sistem' : 'Disetujui oleh Koordinator')
                : (req.user?.role === 'ADMIN' ? 'Ditolak oleh Administrator Sistem' : 'Ditolak oleh Koordinator')),
          diverifikasiOlehId: validVerifikatorId,
          diverifikasiPada: new Date(),
        },
        include: {
          eskul: true,
          pembina: { select: { namaLengkap: true, avatarUrl: true } },
          diverifikasiOleh: { select: { namaLengkap: true } },
        },
      });

      return { updatedProposal, updatedEskul };
    });

    const { updatedProposal, updatedEskul } = result;

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
        diverifikasiOlehId: updatedProposal.diverifikasiOlehId,
        diverifikasiOlehNama: updatedProposal.diverifikasiOleh?.namaLengkap || (req.user?.namaLengkap || 'Administrator Sistem'),
        diverifikasiPada: updatedProposal.diverifikasiPada,
        verifikatorId: updatedProposal.diverifikasiOlehId,
        verifikatorNama: updatedProposal.diverifikasiOleh?.namaLengkap || (req.user?.namaLengkap || 'Administrator Sistem'),
        verifiedAt: updatedProposal.diverifikasiPada,
        updatedEskul,
      },
      updatedEskul,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
