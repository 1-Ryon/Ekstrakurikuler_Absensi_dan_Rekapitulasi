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

export function normalizeSettings(settings) {
  const merged = { ...DEFAULT_SETTINGS, ...settings };
  if (merged.isGeofenceActive !== undefined) {
    if (
      merged.isGeofenceActive === false ||
      merged.isGeofenceActive === 'false' ||
      merged.isGeofenceActive === 0 ||
      merged.isGeofenceActive === '0'
    ) {
      merged.isGeofenceActive = false;
    } else {
      merged.isGeofenceActive = true;
    }
  }
  if (merged.geofenceRadius !== undefined) {
    merged.geofenceRadius = Number(merged.geofenceRadius) || 150;
  }
  if (merged.schoolLatitude !== undefined) {
    merged.schoolLatitude = Number(merged.schoolLatitude) || -6.34215;
  }
  if (merged.schoolLongitude !== undefined) {
    merged.schoolLongitude = Number(merged.schoolLongitude) || 106.71124;
  }
  if (merged.qrExpirySeconds !== undefined) {
    merged.qrExpirySeconds = Number(merged.qrExpirySeconds) || 15;
  }
  return merged;
}

export function getSystemSettings() {
  try {
    if (fs.existsSync(SETTINGS_FILE)) {
      const data = fs.readFileSync(SETTINGS_FILE, 'utf-8');
      return normalizeSettings(JSON.parse(data));
    }
  } catch (err) {
    console.warn('[Settings] Gagal membaca settings.json, menggunakan default:', err.message);
  }
  return normalizeSettings({});
}

export function saveSystemSettings(newSettings) {
  try {
    const current = getSystemSettings();
    const updated = normalizeSettings({ ...current, ...newSettings });
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(updated, null, 2), 'utf-8');
    return updated;
  } catch (err) {
    console.error('[Settings] Gagal menyimpan settings.json:', err.message);
    throw err;
  }
}

router.get('/', (req, res) => {
  try {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
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
