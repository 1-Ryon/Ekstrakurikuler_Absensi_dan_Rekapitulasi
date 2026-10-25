import { Router } from 'express';
import { prisma } from '../config/prisma.js';
import { 
  rateLimitLogin, 
  recordFailedLoginAttempt, 
  clearFailedLoginAttempts, 
  verifyPassword, 
  generateUserToken, 
  getStudentDefaultPassword 
} from '../middlewares/auth.js';

const router = Router();

// POST /api/auth/login
router.post('/login', rateLimitLogin, async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ success: false, message: 'Nama pengguna dan kata sandi wajib diisi.' });
    }

    const cleanUsername = String(username).trim().toLowerCase();
    const cleanPassword = String(password).trim();

    // 1. Cek Database: A. Tabel Admin
    const dbAdmin = await prisma.admin.findFirst({
      where: {
        username: { equals: cleanUsername },
        statusAktif: true,
      },
    });

    if (dbAdmin && verifyPassword(cleanPassword, dbAdmin.passwordHash)) {
      const userPayload = {
        id: dbAdmin.id,
        username: dbAdmin.username,
        role: 'ADMIN',
        namaLengkap: dbAdmin.namaLengkap,
        nomorInduk: dbAdmin.nomorInduk || 'ADM-001',
        spesialisasi: dbAdmin.spesialisasi || 'Super Administrator & Pengelola Sistem IT PKM',
        avatarUrl: dbAdmin.avatarUrl,
        statusAktif: dbAdmin.statusAktif,
      };
      const token = generateUserToken(userPayload);
      clearFailedLoginAttempts(req);
      return res.json({
        success: true,
        token,
        user: userPayload,
      });
    }

    // B. Tabel Guru (Koordinator, Pembina Eskul, Wali Kelas)
    const dbGuru = await prisma.guru.findFirst({
      where: {
        OR: [
          { username: { equals: cleanUsername } },
          { nip: { equals: cleanUsername } },
        ],
        statusAktif: true,
      },
      include: {
        eskulDiampu: true,
        kelasWali: true,
      },
    });

    if (dbGuru && verifyPassword(cleanPassword, dbGuru.passwordHash, (p) => p === 'pembina123' || p === 'admin123')) {
      let spesialisasi = dbGuru.spesialisasi;
      if (cleanUsername === 'koordinator' || cleanUsername === 'viska') {
        spesialisasi = 'Koordinator Ekstrakurikuler Utama';
      }
      const userPayload = {
        id: dbGuru.id,
        username: dbGuru.username,
        role: dbGuru.role, // 'KOORDINATOR' | 'PEMBINA' | 'WALI_KELAS'
        namaLengkap: dbGuru.namaLengkap,
        nomorInduk: dbGuru.nip || dbGuru.username,
        avatarUrl: dbGuru.avatarUrl,
        spesialisasi,
        kelas: dbGuru.kelasWali?.[0]?.namaKelas,
        statusAktif: dbGuru.statusAktif,
        eskulDiampu: dbGuru.eskulDiampu,
      };
      const token = generateUserToken(userPayload);
      clearFailedLoginAttempts(req);
      return res.json({
        success: true,
        token,
        user: userPayload,
      });
    }

    // C. Tabel Siswa
    const dbSiswa = await prisma.siswa.findFirst({
      where: {
        OR: [
          { nis: { equals: cleanUsername } },
          { nisn: { equals: cleanUsername } },
        ],
        statusAktif: true,
      },
      include: {
        kelas: true,
        keanggotaanEskul: true,
      },
    });

    if (dbSiswa && verifyPassword(cleanPassword, dbSiswa.passwordHash, (p) => p === getStudentDefaultPassword(dbSiswa.nis) || p === 'siswa123' || p === 'al_amanah_001')) {
      const userPayload = {
        id: dbSiswa.id,
        username: dbSiswa.nis,
        role: 'SISWA',
        namaLengkap: dbSiswa.namaLengkap,
        nomorInduk: dbSiswa.nis,
        avatarUrl: dbSiswa.avatarUrl,
        kelas: dbSiswa.kelas?.namaKelas || '-',
        kelasId: dbSiswa.kelasId,
        statusAktif: dbSiswa.statusAktif,
      };
      const token = generateUserToken(userPayload);
      clearFailedLoginAttempts(req);
      return res.json({
        success: true,
        token,
        user: userPayload,
      });
    }

    recordFailedLoginAttempt(req);
    return res.status(401).json({
      success: false,
      message: 'Username atau kata sandi tidak valid. Silakan periksa kembali kredensial Anda.',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
