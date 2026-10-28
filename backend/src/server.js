/**
 * Entry point for SMK Al Amanah Backend Server
 * Modular Architecture with Separation of Concerns
 */
import dotenv from 'dotenv';
dotenv.config();

// Auto-fallback jika teman kelompok clone tanpa file .env sama sekali (Zero-config)
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

// Re-exports for test compatibility and backward compatibility
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
