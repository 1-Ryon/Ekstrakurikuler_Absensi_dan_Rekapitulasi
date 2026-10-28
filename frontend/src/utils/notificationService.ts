/**
 * Notification Service for SMK Al Amanah
 * Supports:
 * 1. Web Push / Desktop Notification (PWA Notification API)
 * 2. In-App Notification Center (Bell & unread badges)
 * 3. Audio Chime Alert
 */

export interface SystemNotification {
  id: string;
  title: string;
  desc: string;
  time: string;
  type: 'info' | 'success' | 'warning' | 'error';
  targetRole?: string; // 'ALL' | 'SISWA' | 'PEMBINA' | 'ADMIN'
  read: boolean;
  createdAt: number;
}

const STORAGE_KEY = 'al_amanah_notifications_v1';

// Play gentle notification sound
export function playNotificationSound() {
  try {
    const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
    osc.frequency.setValueAtTime(880.00, audioCtx.currentTime + 0.08); // A5
    
    gain.gain.setValueAtTime(0.06, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.35);

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start();
    osc.stop(audioCtx.currentTime + 0.35);
  } catch {
    // audio context restricted
  }
}

// Request permission for Web Push / Desktop notifications
export async function requestPushPermission(): Promise<boolean> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return false;
  }
  if (Notification.permission === 'granted') {
    return true;
  }
  if (Notification.permission !== 'denied') {
    const perm = await Notification.requestPermission();
    return perm === 'granted';
  }
  return false;
}

// Send a desktop notification to device notification bar
export function sendDesktopNotification(title: string, body: string, icon = '/logo-smk.png') {
  if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
    try {
      new Notification(title, {
        body,
        icon,
        badge: icon,
      });
    } catch (e) {
      console.warn('Desktop notification failed:', e);
    }
  }
}

// Get saved notifications
export function getSavedNotifications(): SystemNotification[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // parse error
  }
  return getDefaultNotifications();
}

// Add a new notification
export function pushSystemNotification(notif: Omit<SystemNotification, 'id' | 'read' | 'createdAt'>) {
  const list = getSavedNotifications();
  const newItem: SystemNotification = {
    ...notif,
    id: `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    read: false,
    createdAt: Date.now(),
  };

  const updated = [newItem, ...list].slice(0, 30); // keep last 30
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // storage full
  }

  // Play sound & notify desktop
  playNotificationSound();
  sendDesktopNotification(notif.title, notif.desc);

  // Dispatch custom event for real-time header badge updates
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('al_amanah_new_notification', { detail: newItem }));
  }

  return newItem;
}

// Mark all as read
export function markAllNotificationsRead() {
  const list = getSavedNotifications().map(n => ({ ...n, read: true }));
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch {
    // ignore
  }
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('al_amanah_notifications_read'));
  }
}

// Initial default seed notifications
function getDefaultNotifications(): SystemNotification[] {
  return [
    {
      id: 'init-1',
      title: 'Pendaftaran Ekstrakurikuler Dibuka',
      desc: 'Tahun Ajaran 2026/2027: Siswa dapat mendaftar hingga 3 pilihan eskul.',
      time: 'Hari ini',
      type: 'info',
      read: false,
      createdAt: Date.now() - 3600000,
    },
    {
      id: 'init-2',
      title: 'Validasi Presensi Dynamic QR Siap Digunakan',
      desc: 'Pembina eskul dapat membuka sesi dengan verifikasi lokasi sekolah (Geofencing 150m).',
      time: 'Hari ini',
      type: 'success',
      read: false,
      createdAt: Date.now() - 7200000,
    },
    {
      id: 'init-3',
      title: 'Notifikasi Status Pendaftaran & Jadwal',
      desc: 'Status berkas diterima/ditolak akan otomatis muncul di notifikasi perangkat Anda.',
      time: 'Kemarin',
      type: 'info',
      read: true,
      createdAt: Date.now() - 86400000,
    },
  ];
}
