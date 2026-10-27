/**
 * Entry point for SMK Al Amanah Backend Server
 * Modular Architecture with Separation of Concerns
 */
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
