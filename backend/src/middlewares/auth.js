import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

export const JWT_SECRET = process.env.JWT_SECRET || 'smk-al-amanah-super-secret-key-2026';

// Helper: Formula Password Siswa: al_amanah_ + 3 digit terakhir NIS
export function getStudentDefaultPassword(nis) {
  const cleanNis = String(nis).trim();
  const last3 = cleanNis.slice(-3);
  return `al_amanah_${last3}`;
}

// Helper: Hash password dengan Bcrypt
export function hashPassword(plainPassword) {
  return bcrypt.hashSync(String(plainPassword).trim(), 10);
}

// Rate Limiter for Login (Defensive Brute-Force Prevention)
const loginAttemptTracker = new Map();

export function rateLimitLogin(req, res, next) {
  const ip = req.ip || req.connection?.remoteAddress || '127.0.0.1';
  const now = Date.now();
  const windowMs = 5 * 60 * 1000; // 5 menit
  const maxAttempts = 20; // 20 percobaan per 5 menit

  const tracker = loginAttemptTracker.get(ip);
  if (tracker && tracker.resetAt > now) {
    if (tracker.count >= maxAttempts) {
      const waitSeconds = Math.ceil((tracker.resetAt - now) / 1000);
      return res.status(429).json({
        success: false,
        message: `Terlalu banyak percobaan masuk yang gagal. Silakan tunggu ${waitSeconds} detik sebelum mencoba kembali demi keamanan akun.`,
      });
    }
  } else {
    loginAttemptTracker.set(ip, { count: 0, resetAt: now + windowMs });
  }
  next();
}

export function recordFailedLoginAttempt(req) {
  const ip = req.ip || req.connection?.remoteAddress || '127.0.0.1';
  const now = Date.now();
  const tracker = loginAttemptTracker.get(ip);
  if (tracker && tracker.resetAt > now) {
    tracker.count += 1;
  } else {
    loginAttemptTracker.set(ip, { count: 1, resetAt: now + 5 * 60 * 1000 });
  }
}

export function clearFailedLoginAttempts(req) {
  const ip = req.ip || req.connection?.remoteAddress || '127.0.0.1';
  loginAttemptTracker.delete(ip);
}

// Helper: Verifikasi password kriptografis (Bcrypt dengan backward compatibility)
export function verifyPassword(inputPassword, storedHash, fallbackCheck) {
  if (!storedHash) return false;
  if (storedHash.startsWith('$2a$') || storedHash.startsWith('$2b$') || storedHash.startsWith('$2y$')) {
    return bcrypt.compareSync(inputPassword, storedHash);
  }
  // Plaintext match untuk data legacy yang belum termigrasi
  if (inputPassword === storedHash) return true;
  if (typeof fallbackCheck === 'function' && fallbackCheck(inputPassword)) return true;
  return false;
}

// Helper: Terbitkan token JWT resmi
export function generateUserToken(user) {
  return jwt.sign(
    {
      id: user.id,
      username: user.username,
      role: user.role,
      namaLengkap: user.namaLengkap,
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

// Helper: Ekstrak user dari header Authorization jika ada (aman & non-throwing)
export function extractUser(req) {
  const authHeader = (req.headers['authorization'] || '').toString();
  if (authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7).trim();
    try {
      return jwt.verify(token, JWT_SECRET);
    } catch {
      return null;
    }
  }
  return null;
}

// Middleware: Role-Based Authorization Guard (Verifikasi Kriptografis Token JWT)
export function requireRoles(...allowedRoles) {
  return (req, res, next) => {
    const authHeader = (req.headers['authorization'] || '').toString();

    if (!authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Akses ditolak: Autentikasi diperlukan. Silakan sertakan token JWT yang valid.',
      });
    }

    const token = authHeader.substring(7).trim();
    let decodedUser = null;
    try {
      decodedUser = jwt.verify(token, JWT_SECRET);
    } catch {
      return res.status(401).json({
        success: false,
        message: 'Token otentikasi tidak valid atau telah kedaluwarsa.',
      });
    }

    const callerRole = decodedUser.role;
    req.user = decodedUser;
    req.callerRole = callerRole;

    if (allowedRoles.length > 0 && !allowedRoles.includes(callerRole)) {
      return res.status(403).json({
        success: false,
        message: `Akses ditolak: Operasi ini membutuhkan hak akses [${allowedRoles.join(', ')}]. Peran Anda: ${callerRole}.`,
      });
    }

    next();
  };
}
