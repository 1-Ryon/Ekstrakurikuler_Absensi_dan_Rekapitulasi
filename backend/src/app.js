import express from 'express';
import cors from 'cors';
import { securityHeaders } from './middlewares/security.js';

// Route Modules
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

const app = express();

// 1. CORS Configuration (Defensive whitelist, safe in development and production)
const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',').map(s => s.trim()) 
  : ['http://localhost:3000', 'http://localhost:5173', 'http://127.0.0.1:3000', 'http://127.0.0.1:5173'];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV !== 'production') {
      callback(null, true);
    } else {
      callback(new Error('Akses diblokir oleh kebijakan CORS.'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
}));

// 2. Request Parsers (Bounded body size)
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));

// 3. OWASP Defensive Security Headers
app.use(securityHeaders);

// 4. Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    system: 'SMK Al Amanah Attendance API (Modular Architecture)',
  });
});

// 5. Mount Sub-Routers
app.use('/api/auth', authRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/eskul', eskulRoutes);
app.use('/api', guruRoutes); // Handles /api/pembina, /api/guru, /api/walikelas
app.use('/api/kelas', kelasRoutes);
app.use('/api/students', studentsRoutes);
app.use('/api/sessions', sessionsRoutes);
app.use('/api/jadwal-proposals', jadwalRoutes);
app.use('/api/pendaftaran', pendaftaranRoutes);
app.use('/api/presensi', presensiRoutes);
app.use('/api/penilaian', penilaianRoutes);
app.use('/api/prestasi', prestasiRoutes);

// 6. 404 Handler for Unmatched API Routes
app.use('/api', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Endpoint ${req.method} ${req.originalUrl} tidak ditemukan pada server API.`,
  });
});

// 7. Global Error Handler
app.use((err, req, res, next) => {
  console.error('[API SERVER ERROR]:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Terjadi kesalahan internal pada server.',
  });
});

export default app;
export { app };
