import { Router } from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { requireRoles } from '../middlewares/auth.js';

const router = Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SETTINGS_FILE = path.join(__dirname, '../../prisma/settings.json');

const DEFAULT_SETTINGS = {
  schoolName: 'SMK AL AMANAH KOTA TANGERANG SELATAN',
  npsn: '20614829',
  schoolLatitude: -6.34215,
  schoolLongitude: 106.71124,
  geofenceRadius: 150,
  isGeofenceActive: true,
  qrExpirySeconds: 15,
  kehadiranWeight: 40,
  keaktifanWeight: 30,
  kinerjaWeight: 30,
};

export function getSystemSettings() {
  try {
    if (fs.existsSync(SETTINGS_FILE)) {
      const data = fs.readFileSync(SETTINGS_FILE, 'utf-8');
      return { ...DEFAULT_SETTINGS, ...JSON.parse(data) };
    }
  } catch (err) {
    console.warn('[Settings] Gagal membaca settings.json, menggunakan default:', err.message);
  }
  return { ...DEFAULT_SETTINGS };
}

export function saveSystemSettings(newSettings) {
  try {
    const current = getSystemSettings();
    const updated = { ...current, ...newSettings };
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(updated, null, 2), 'utf-8');
    return updated;
  } catch (err) {
    console.error('[Settings] Gagal menyimpan settings.json:', err.message);
    throw err;
  }
}

router.get('/', (req, res) => {
  try {
    const settings = getSystemSettings();
    res.json({ success: true, data: settings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put('/', requireRoles('ADMIN', 'KOORDINATOR'), (req, res) => {
  try {
    const updated = saveSystemSettings(req.body);
    res.json({
      success: true,
      message: 'Pengaturan sistem & geofencing berhasil disimpan.',
      data: updated,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
