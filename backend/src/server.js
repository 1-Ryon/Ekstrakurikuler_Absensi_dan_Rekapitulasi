import dotenv from 'dotenv';
dotenv.config();

if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = 'file:./dev.db';
}
if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = 'smk-al-amanah-super-secret-key-2026';
}

import app from './app.js';
import { prisma } from './config/prisma.js';
import {
  getStudentDefaultPassword,
  verifyPassword,
  generateUserToken,
  requireRoles,
} from './middlewares/auth.js';

const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || '0.0.0.0';

const server = app.listen(PORT, HOST, () => {
  console.log(`🚀 [BACKEND] Server SMK Al Amanah berjalan di http://${HOST}:${PORT}`);
  console.log(`📡 [API] REST Endpoints siap melayani sistem presensi & penilaian (Modular Architecture).`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`\n❌ [PORT IN USE] Port ${PORT} sedang dipakai oleh proses lain (background node/server).`);
    console.error(`💡 Solusi: Jalankan 'npm run kill:port' untuk menghentikan proses lama secara otomatis.\n`);
  } else {
    console.error('[SERVER ERROR]:', err);
  }
});

process.on('SIGTERM', () => {
  server.close(() => {
    console.log('[BACKEND] Server ditutup dengan aman.');
  });
});

export {
  app,
  server,
  prisma,
  getStudentDefaultPassword,
  verifyPassword,
  generateUserToken,
  requireRoles,
};

export default server;
