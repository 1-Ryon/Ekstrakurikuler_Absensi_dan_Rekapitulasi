import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { securityHeaders } from './middlewares/security.js';

import authRoutes from './routes/auth.js';
import statsRoutes from './routes/stats.js';
import eskulRoutes from './routes/eskul.js';
import guruRoutes from './routes/guru.js';
import kelasRoutes from './routes/kelas.js';
import studentsRoutes from './routes/students.js';
import sessionsRoutes from './routes/sessions.js';
import jadwalRoutes from './routes/jadwal.js';
import pendaftaranRoutes from './routes/pendaftaran.js';
import presensiRoutes from './routes/presensi.js';
import penilaianRoutes from './routes/penilaian.js';
import prestasiRoutes from './routes/prestasi.js';
import settingsRoutes from './routes/settings.js';
import uploadRoutes from './routes/upload.js';

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const configuredOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',').map((s) => s.trim()) 
  : [];

function isOriginAllowed(origin) {
  if (!origin) return true;
  if (configuredOrigins.includes(origin)) return true;
  if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) return true;
  if (origin === 'https://arionoputra.net' || origin.endsWith('.arionoputra.net')) return true;
  if (origin === 'https://trycloudflare.com' || origin.endsWith('.trycloudflare.com')) return true;
  return false;
}

app.use(cors({
  origin: (origin, callback) => {
    if (isOriginAllowed(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Akses diblokir oleh kebijakan CORS.'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
}));

app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));

app.use(securityHeaders);

app.use('/uploads', express.static(uploadDir));

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    system: 'Absensi Estrakurikuler SMK Al-Amanah API',
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/eskul', eskulRoutes);
app.use('/api', guruRoutes);
app.use('/api/kelas', kelasRoutes);
app.use('/api/students', studentsRoutes);
app.use('/api/sessions', sessionsRoutes);
app.use('/api/jadwal-proposals', jadwalRoutes);
app.use('/api/pendaftaran', pendaftaranRoutes);
app.use('/api/presensi', presensiRoutes);
app.use('/api/penilaian', penilaianRoutes);
app.use('/api/prestasi', prestasiRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/upload', uploadRoutes);

app.use('/api', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Endpoint ${req.method} ${req.originalUrl} tidak ditemukan pada server API.`,
  });
});

const frontendDistPath = path.join(__dirname, '../../frontend/dist');
if (fs.existsSync(frontendDistPath)) {
  app.use(express.static(frontendDistPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) return next();
    res.sendFile(path.join(frontendDistPath, 'index.html'));
  });
}

app.use((err, req, res, next) => {
  if (err.message && err.message.includes('CORS')) {
    return res.status(403).json({
      success: false,
      message: 'Akses diblokir oleh kebijakan keamanan CORS SMK Al Amanah.',
    });
  }

  console.error('[API SERVER ERROR]:', err);
  res.status(err.status || err.statusCode || 500).json({
    success: false,
    message: err.message || 'Terjadi kesalahan internal pada server.',
  });
});

export default app;
export { app };
