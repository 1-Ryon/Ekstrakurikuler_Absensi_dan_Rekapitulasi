import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { requireRoles } from '../middlewares/auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadDir = path.join(__dirname, '../../uploads');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const ALLOWED_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.pdf']);
const ALLOWED_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'application/pdf']);

const DANGEROUS_EXTENSIONS = new Set([
  '.php', '.phtml', '.php3', '.php4', '.php5', '.phps',
  '.js', '.mjs', '.cjs', '.ts',
  '.sh', '.bash', '.zsh', '.bat', '.cmd', '.ps1',
  '.exe', '.dll', '.bin', '.com', '.msi', '.vbs',
  '.html', '.htm', '.xhtml', '.svg', '.xml',
]);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const randomHex = crypto.randomBytes(8).toString('hex');
    const safeFilename = `doc_${Date.now()}_${randomHex}${ext}`;
    cb(null, safeFilename);
  },
});

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const mime = file.mimetype.toLowerCase();

  if (DANGEROUS_EXTENSIONS.has(ext)) {
    const err = new Error(`Ekstensi file '${ext}' dilarang demi keamanan server.`);
    err.code = 'INVALID_FILE_TYPE';
    return cb(err, false);
  }

  if (!ALLOWED_EXTENSIONS.has(ext) || !ALLOWED_MIME_TYPES.has(mime)) {
    const err = new Error(
      `Format file tidak didukung (${ext || 'tanpa ekstensi'}, MIME: ${mime}). Hanya diizinkan: JPG, PNG, WEBP, dan PDF.`
    );
    err.code = 'INVALID_FILE_TYPE';
    return cb(err, false);
  }

  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 1,
  },
});

const router = Router();

router.post(
  '/',
  requireRoles('SISWA', 'PEMBINA', 'KOORDINATOR', 'ADMIN', 'WALI_KELAS'),
  (req, res) => {
    upload.single('file')(req, res, (err) => {
      if (err) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({
            success: false,
            message: 'Ukuran file terlalu besar. Maksimal ukuran berkas adalah 5 MB.',
          });
        }
        return res.status(400).json({
          success: false,
          message: err.message || 'Gagal mengunggah file.',
        });
      }

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'Silakan pilih berkas file untuk diunggah.',
        });
      }

      const fileUrl = `/uploads/${req.file.filename}`;
      res.status(201).json({
        success: true,
        message: 'Berkas berhasil diverifikasi dan disimpan dengan aman.',
        data: {
          filename: req.file.filename,
          originalName: req.file.originalname,
          size: req.file.size,
          mimeType: req.file.mimetype,
          fileUrl,
        },
      });
    });
  }
);

export default router;
