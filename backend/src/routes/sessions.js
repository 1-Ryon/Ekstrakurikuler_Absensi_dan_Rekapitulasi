import { Router } from 'express';
import crypto from 'crypto';
import { prisma } from '../config/prisma.js';

const router = Router();

// GET /api/sessions/today
router.get('/today', async (req, res) => {
  try {
    const sessions = await prisma.sesiPertemuan.findMany({
      include: {
        eskul: {
          include: {
            pembina: { select: { id: true, namaLengkap: true } },
            _count: { select: { anggota: true } },
          },
        },
        _count: {
          select: { presensiList: true },
        },
      },
      orderBy: { jamMulai: 'asc' },
    });

    const formatted = sessions.map((s) => ({
      id: s.id,
      eskulId: s.eskulId,
      namaEskul: s.eskul.namaEskul,
      pembinaId: s.eskul.pembinaId || s.eskul.pembina?.id,
      pembinaNama: s.eskul.pembina?.namaLengkap || 'Pembina Eskul',
      tanggal: s.tanggal,
      jamMulai: s.jamMulai,
      jamSelesai: s.jamSelesai,
      lokasi: s.lokasi || s.eskul.lokasi,
      judul: s.judul || s.materi || 'Latihan Rutin',
      deskripsi: s.deskripsi || s.materi || 'Pertemuan dan latihan rutin ekstrakurikuler.',
      materi: s.materi || s.deskripsi || 'Latihan Rutin Mingguan',
      tokenAktif: s.tokenAktif || 'STANDBY',
      tokenExpiresAt: s.tokenExpiresAt ? new Date(s.tokenExpiresAt).getTime() : Date.now() + 15000,
      status: s.status,
      isLibur: Boolean(s.isLibur),
      alasanLibur: s.alasanLibur || null,
      isLocked: Boolean(s.isLocked),
      lockedAt: s.lockedAt || null,
      totalHadir: s._count.presensiList,
      totalSiswa: s.eskul._count.anggota || 35,
    }));

    res.json({ success: true, data: formatted });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/sessions
router.post('/', async (req, res) => {
  try {
    const { eskulId, pembuatId, tanggal, jamMulai, jamSelesai, lokasi, judul, deskripsi, materi } = req.body;
    
    if (!eskulId) {
      return res.status(400).json({ success: false, message: 'ID Eskul wajib disertakan.' });
    }

    if (!judul || !judul.trim()) {
      return res.status(400).json({ 
        success: false, 
        message: 'Judul pertemuan atau topik latihan wajib diisi oleh pembina sebelum membuka absensi.' 
      });
    }

    if (!deskripsi || !deskripsi.trim()) {
      return res.status(400).json({ 
        success: false, 
        message: 'Deskripsi rincian apa yang dibahas dan latihan apa hari ini wajib diisi oleh pembina.' 
      });
    }

    const timestampWindow = Math.floor(Date.now() / 15000);
    const salt = crypto.randomBytes(3).toString('hex').toUpperCase();
    const expiresAt = new Date(Date.now() + 15000);

    const cleanJudul = judul.trim();
    const cleanDeskripsi = deskripsi.trim();
    const cleanMateri = (materi && materi.trim()) ? materi.trim() : cleanDeskripsi;

    const sesi = await prisma.sesiPertemuan.create({
      data: {
        eskulId,
        pembuatId: pembuatId || undefined,
        tanggal: tanggal || new Date().toISOString().slice(0, 10),
        jamMulai: jamMulai || '15:30',
        jamSelesai: jamSelesai || '17:00',
        lokasi: lokasi || 'SMK Al Amanah',
        judul: cleanJudul,
        deskripsi: cleanDeskripsi,
        materi: cleanMateri,
        tokenExpiresAt: expiresAt,
        status: 'BERLANGSUNG',
      },
      include: {
        eskul: {
          include: {
            pembina: { select: { namaLengkap: true } },
            _count: { select: { anggota: true } },
          },
        },
        _count: { select: { presensiList: true } },
      },
    });

    const tokenAktif = `SMK-AMANAH:${sesi.id}:${timestampWindow}:${salt}`;
    const updated = await prisma.sesiPertemuan.update({
      where: { id: sesi.id },
      data: { tokenAktif },
      include: {
        eskul: {
          include: {
            pembina: { select: { namaLengkap: true } },
            _count: { select: { anggota: true } },
          },
        },
        _count: { select: { presensiList: true } },
      },
    });

    const formatted = {
      id: updated.id,
      eskulId: updated.eskulId,
      namaEskul: updated.eskul.namaEskul,
      pembinaNama: updated.eskul.pembina?.namaLengkap || 'Pembina Eskul',
      tanggal: updated.tanggal,
      jamMulai: updated.jamMulai,
      jamSelesai: updated.jamSelesai,
      lokasi: updated.lokasi || updated.eskul.lokasi,
      judul: updated.judul,
      deskripsi: updated.deskripsi,
      materi: updated.materi,
      tokenAktif: updated.tokenAktif,
      tokenExpiresAt: updated.tokenExpiresAt ? new Date(updated.tokenExpiresAt).getTime() : Date.now() + 15000,
      status: updated.status,
      isLibur: Boolean(updated.isLibur),
      alasanLibur: updated.alasanLibur || null,
      isLocked: Boolean(updated.isLocked),
      lockedAt: updated.lockedAt || null,
      totalHadir: updated._count.presensiList,
      totalSiswa: updated.eskul._count.anggota || 35,
    };

    res.status(201).json({ 
      success: true, 
      message: 'Sesi absensi berhasil dibuka dengan agenda dan materi latihan hari ini.', 
      data: formatted 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/sessions/:id/token
router.post('/:id/token', async (req, res) => {
  try {
    const { id } = req.params;
    const timestampWindow = Math.floor(Date.now() / 15000);
    const salt = crypto.randomBytes(3).toString('hex').toUpperCase();
    const token = `SMK-AMANAH:${id}:${timestampWindow}:${salt}`;
    const expiresAt = new Date(Date.now() + 15000);

    await prisma.sesiPertemuan.update({
      where: { id },
      data: {
        tokenAktif: token,
        tokenExpiresAt: expiresAt,
        status: 'BERLANGSUNG',
      },
    });

    res.json({
      success: true,
      token,
      expiresAt: expiresAt.getTime(),
      validitySeconds: 15,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PATCH /api/sessions/:id/status
router.patch('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, judul, deskripsi, materi } = req.body;

    const dataToUpdate = {};
    if (status) dataToUpdate.status = status;
    if (judul !== undefined) dataToUpdate.judul = judul ? judul.trim() : null;
    if (deskripsi !== undefined) dataToUpdate.deskripsi = deskripsi ? deskripsi.trim() : null;
    if (materi !== undefined) dataToUpdate.materi = materi ? materi.trim() : null;

    const updated = await prisma.sesiPertemuan.update({
      where: { id },
      data: dataToUpdate,
      include: {
        eskul: {
          include: {
            pembina: { select: { namaLengkap: true } },
            _count: { select: { anggota: true } },
          },
        },
        _count: { select: { presensiList: true } },
      },
    });

    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/sessions/:id/libur
router.post('/:id/libur', async (req, res) => {
  try {
    const { id } = req.params;
    const { alasanLibur } = req.body;

    if (!alasanLibur || !alasanLibur.trim()) {
      return res.status(400).json({ success: false, message: 'Alasan libur / tanggal merah wajib diisi.' });
    }

    const sesi = await prisma.sesiPertemuan.findUnique({ where: { id }, include: { eskul: true } });
    if (!sesi) {
      return res.status(404).json({ success: false, message: 'Sesi pertemuan tidak ditemukan.' });
    }

    const updated = await prisma.sesiPertemuan.update({
      where: { id },
      data: {
        status: 'LIBUR',
        isLibur: true,
        alasanLibur: alasanLibur.trim(),
        isLocked: true,
        lockedAt: new Date(),
        deskripsi: `DILIBURKAN: ${alasanLibur.trim()}`,
      },
      include: {
        eskul: true,
        _count: { select: { presensiList: true } },
      },
    });

    res.json({
      success: true,
      message: `Sesi ${updated.eskul.namaEskul} berhasil ditandai sebagai Hari Libur (${alasanLibur.trim()}). Tidak ada siswa yang dialfakan.`,
      data: updated,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/sessions/mark-holiday
router.post('/mark-holiday', async (req, res) => {
  try {
    const { eskulId, pembuatId, tanggal, alasanLibur } = req.body;

    if (!eskulId || !alasanLibur || !alasanLibur.trim()) {
      return res.status(400).json({ success: false, message: 'ID Eskul dan alasan libur wajib disertakan.' });
    }

    const eskul = await prisma.eskul.findUnique({ where: { id: eskulId } });
    if (!eskul) {
      return res.status(404).json({ success: false, message: 'Data eskul tidak ditemukan.' });
    }

    const tgl = tanggal || new Date().toISOString().slice(0, 10);
    const existing = await prisma.sesiPertemuan.findFirst({
      where: { eskulId, tanggal: tgl },
    });

    let result;
    if (existing) {
      result = await prisma.sesiPertemuan.update({
        where: { id: existing.id },
        data: {
          status: 'LIBUR',
          isLibur: true,
          alasanLibur: alasanLibur.trim(),
          isLocked: true,
          lockedAt: new Date(),
          deskripsi: `DILIBURKAN: ${alasanLibur.trim()}`,
        },
        include: { eskul: true },
      });
    } else {
      result = await prisma.sesiPertemuan.create({
        data: {
          eskulId,
          pembuatId: pembuatId || undefined,
          tanggal: tgl,
          jamMulai: eskul.jamMulai,
          jamSelesai: eskul.jamSelesai,
          lokasi: eskul.lokasi,
          judul: `Hari Libur: ${eskul.namaEskul}`,
          deskripsi: `DILIBURKAN: ${alasanLibur.trim()}`,
          materi: `Diliburkan - ${alasanLibur.trim()}`,
          status: 'LIBUR',
          isLibur: true,
          alasanLibur: alasanLibur.trim(),
          isLocked: true,
          lockedAt: new Date(),
        },
        include: { eskul: true },
      });
    }

    res.status(201).json({
      success: true,
      message: `Pertemuan ${eskul.namaEskul} tanggal ${tgl} berhasil dicatat sebagai Hari Libur.`,
      data: result,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/sessions/:id/attendance-sheet
router.get('/:id/attendance-sheet', async (req, res) => {
  try {
    const { id } = req.params;
    const sesi = await prisma.sesiPertemuan.findUnique({
      where: { id },
      include: {
        eskul: {
          include: {
            anggota: {
              where: { status: 'AKTIF' },
              include: {
                siswa: {
                  include: { kelas: true },
                },
              },
            },
          },
        },
        presensiList: true,
      },
    });

    if (!sesi) {
      return res.status(404).json({ success: false, message: 'Sesi pertemuan tidak ditemukan.' });
    }

    const presensiMap = new Map();
    sesi.presensiList.forEach((p) => {
      presensiMap.set(p.siswaId, p);
    });

    const roster = sesi.eskul.anggota.map((ang) => {
      const s = ang.siswa;
      const pres = presensiMap.get(s.id);
      return {
        siswaId: s.id,
        namaSiswa: s.namaLengkap,
        nis: s.nis,
        nisn: s.nisn,
        kelas: s.kelas?.namaKelas || '-',
        avatarUrl: s.avatarUrl,
        jabatan: ang.jabatan,
        presensiId: pres ? pres.id : null,
        status: pres ? pres.status : 'BELUM_ABSEN',
        waktuScan: pres ? pres.waktuScan : null,
        metode: pres ? pres.metode : null,
        nilaiKeaktifan: pres && pres.nilaiKeaktifan != null ? pres.nilaiKeaktifan : 85,
        ratingKeaktifan: pres && pres.ratingKeaktifan ? pres.ratingKeaktifan : 'Sangat Baik',
        keterangan: pres ? pres.keterangan : '',
        buktiSurat: pres ? pres.buktiSurat : '',
      };
    });

    res.json({
      success: true,
      data: {
        sesi: {
          id: sesi.id,
          eskulId: sesi.eskulId,
          namaEskul: sesi.eskul.namaEskul,
          tanggal: sesi.tanggal,
          jamMulai: sesi.jamMulai,
          jamSelesai: sesi.jamSelesai,
          judul: sesi.judul,
          deskripsi: sesi.deskripsi,
          materi: sesi.materi,
          status: sesi.status,
          isLibur: Boolean(sesi.isLibur),
          alasanLibur: sesi.alasanLibur,
          isLocked: Boolean(sesi.isLocked),
          lockedAt: sesi.lockedAt,
        },
        roster,
        totalAnggota: roster.length,
        totalHadir: roster.filter((r) => r.status === 'HADIR').length,
        totalIzin: roster.filter((r) => r.status === 'IZIN').length,
        totalSakit: roster.filter((r) => r.status === 'SAKIT').length,
        totalAlfa: roster.filter((r) => r.status === 'ALFA').length,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/sessions/:id/finalize
router.post('/:id/finalize', async (req, res) => {
  try {
    const { id } = req.params;
    const { judul, deskripsi, materi, pembuatId } = req.body;
    const kehadiran = req.body.kehadiran || req.body.attendanceList;

    if (!kehadiran || !Array.isArray(kehadiran)) {
      return res.status(400).json({ success: false, message: 'Daftar data kehadiran siswa wajib disertakan.' });
    }

    const sesi = await prisma.sesiPertemuan.findUnique({
      where: { id },
      include: { eskul: true },
    });

    if (!sesi) {
      return res.status(404).json({ success: false, message: 'Sesi pertemuan tidak ditemukan.' });
    }

    let countHadir = 0;
    let countIzin = 0;
    let countSakit = 0;
    let countAlfa = 0;

    for (const item of kehadiran) {
      if (!item.siswaId) continue;
      const status = item.status || 'HADIR';
      if (status === 'HADIR') countHadir++;
      else if (status === 'IZIN') countIzin++;
      else if (status === 'SAKIT') countSakit++;
      else if (status === 'ALFA') countAlfa++;

      const nilaiKeaktifan = Number(item.nilaiKeaktifan) || 85.0;
      let ratingKeaktifan = item.ratingKeaktifan;
      if (!ratingKeaktifan) {
        if (nilaiKeaktifan >= 90) ratingKeaktifan = 'Sangat Baik';
        else if (nilaiKeaktifan >= 80) ratingKeaktifan = 'Baik';
        else if (nilaiKeaktifan >= 70) ratingKeaktifan = 'Cukup';
        else ratingKeaktifan = 'Kurang';
      }

      const rawId = String(item.siswaId).trim();
      const paddedId = rawId.replace(/^sis-(\d+)$/, (_, n) => `sis-${n.padStart(3, '0')}`);
      let resolvedSiswa = await prisma.siswa.findFirst({
        where: {
          OR: [
            { id: rawId },
            { id: paddedId },
            { nis: rawId },
            { nisn: rawId },
          ],
        },
      });

      if (!resolvedSiswa && (item.namaLengkap || item.namaSiswa)) {
        resolvedSiswa = await prisma.siswa.findFirst({
          where: {
            namaLengkap: { contains: (item.namaLengkap || item.namaSiswa).trim() },
          },
        });
      }

      if (!resolvedSiswa) {
        const defaultKelas = await prisma.kelas.findFirst();
        if (defaultKelas) {
          const generatedNis = rawId.startsWith('sis-')
            ? `2026${rawId.replace(/\D/g, '').padStart(4, '0')}`
            : `2026${Math.floor(1000 + Math.random() * 9000)}`;
          resolvedSiswa = await prisma.siswa.upsert({
            where: { id: rawId },
            update: {},
            create: {
              id: rawId,
              nis: generatedNis,
              namaLengkap: item.namaLengkap || item.namaSiswa || `Siswa ${rawId}`,
              kelasId: defaultKelas.id,
            },
          }).catch(() => null);
        }
      }

      if (!resolvedSiswa) {
        console.warn(`[Finalize] Siswa ${rawId} tidak ditemukan dan dilewati.`);
        continue;
      }
      const validSiswaId = resolvedSiswa.id;

      await prisma.presensi.upsert({
        where: {
          sesiId_siswaId: { sesiId: id, siswaId: validSiswaId },
        },
        update: {
          status,
          metode: item.metode || (status === 'HADIR' ? 'SCAN_QR_SISWA' : 'MANUAL_CHECKLIST'),
          nilaiKeaktifan: status === 'HADIR' ? nilaiKeaktifan : null,
          ratingKeaktifan: status === 'HADIR' ? ratingKeaktifan : null,
          keterangan: item.keterangan || null,
          buktiSurat: item.buktiSurat || null,
          deviceInfo: `Verifikasi Akhir Pembina (${pembuatId || 'Guru'})`,
        },
        create: {
          sesiId: id,
          siswaId: validSiswaId,
          status,
          metode: item.metode || (status === 'HADIR' ? 'SCAN_QR_SISWA' : 'MANUAL_CHECKLIST'),
          nilaiKeaktifan: status === 'HADIR' ? nilaiKeaktifan : null,
          ratingKeaktifan: status === 'HADIR' ? ratingKeaktifan : null,
          keterangan: item.keterangan || null,
          buktiSurat: item.buktiSurat || null,
          deviceInfo: `Verifikasi Akhir Pembina (${pembuatId || 'Guru'})`,
        },
      });

      if (status === 'HADIR') {
        const existingPenilaian = await prisma.penilaian.findUnique({
          where: {
            eskulId_siswaId_semester_tahunAjaran: {
              eskulId: sesi.eskulId,
              siswaId: validSiswaId,
              semester: 1,
              tahunAjaran: '2026/2027',
            },
          },
        });
        if (existingPenilaian) {
          const updatedKeaktifan = Math.round(((existingPenilaian.nilaiKeaktifan + nilaiKeaktifan) / 2) * 10) / 10;
          const bobotHadir = existingPenilaian.nilaiKehadiran * 0.4;
          const bobotAktif = updatedKeaktifan * 0.25;
          const bobotKinerja = existingPenilaian.nilaiKinerja * 0.25;
          const bobotBonus = (existingPenilaian.poinPrestasi || 0) * 0.1;
          const totalAkhir = Math.min(100, Math.round((bobotHadir + bobotAktif + bobotKinerja + bobotBonus) * 10) / 10);
          let pred = 'A';
          if (totalAkhir < 75) pred = 'D';
          else if (totalAkhir < 80) pred = 'C';
          else if (totalAkhir < 88) pred = 'B';

          await prisma.penilaian.update({
            where: { id: existingPenilaian.id },
            data: {
              nilaiKeaktifan: updatedKeaktifan,
              ratingKeaktifan,
              nilaiAkhir: totalAkhir,
              predikat: pred,
            },
          });
        }
      }
    }

    const finalizedSesi = await prisma.sesiPertemuan.update({
      where: { id },
      data: {
        status: 'SELESAI',
        isLocked: true,
        lockedAt: new Date(),
        judul: judul ? judul.trim() : sesi.judul,
        deskripsi: deskripsi ? deskripsi.trim() : sesi.deskripsi,
        materi: materi ? materi.trim() : sesi.materi,
      },
      include: {
        eskul: true,
        _count: { select: { presensiList: true } },
      },
    });

    res.json({
      success: true,
      message: `Presensi pertemuan ${sesi.eskul.namaEskul} berhasil difinalisasi dan dikunci menjadi History Resmi (${countHadir} Hadir, ${countIzin} Izin, ${countSakit} Sakit, ${countAlfa} Alfa).`,
      data: {
        sesi: finalizedSesi,
        summary: { countHadir, countIzin, countSakit, countAlfa, total: kehadiran.length },
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
