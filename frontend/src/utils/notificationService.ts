
export interface SystemNotification {
  id: string;
  title: string;
  desc: string;
  time: string;
  type: 'info' | 'success' | 'warning' | 'error';
  category?: 'JADWAL' | 'PENDAFTARAN' | 'PESAN' | 'SISTEM';
  targetRoles?: ('ADMIN' | 'KOORDINATOR' | 'PEMBINA' | 'WALI_KELAS' | 'SISWA' | string)[];
  targetUserId?: string;
  senderName?: string;
  read: boolean;
  createdAt: number;
}

const STORAGE_KEY = 'al_amanah_notifications_v1';

export function playNotificationSound() {
  try {
    const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, audioCtx.currentTime);
    osc.frequency.setValueAtTime(880.00, audioCtx.currentTime + 0.08);
    
    gain.gain.setValueAtTime(0.06, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.35);

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start();
    osc.stop(audioCtx.currentTime + 0.35);
  } catch {
  }
}

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

export function getSavedNotifications(userRole?: string, userId?: string): SystemNotification[] {
  if (typeof window === 'undefined') return [];
  let all: SystemNotification[] = [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      all = JSON.parse(raw);
    } else {
      all = getDefaultNotifications();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
    }
  } catch {
    all = getDefaultNotifications();
  }

  if (!userRole && !userId) return all;

  return all.filter((n) => {
    // 1. Direct user match
    if (n.targetUserId && userId) {
      return n.targetUserId === userId;
    }
    // 2. Role match
    if (n.targetRoles && n.targetRoles.length > 0 && userRole) {
      return n.targetRoles.includes(userRole);
    }
    // 3. Fallback: if no specific target, it's global
    return !n.targetUserId && (!n.targetRoles || n.targetRoles.length === 0);
  });
}

export function pushSystemNotification(notif: Omit<SystemNotification, 'id' | 'read' | 'createdAt'>) {
  let all: SystemNotification[] = [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    all = raw ? JSON.parse(raw) : getDefaultNotifications();
  } catch {
    all = getDefaultNotifications();
  }

  const newItem: SystemNotification = {
    ...notif,
    id: `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    read: false,
    createdAt: Date.now(),
  };

  const updated = [newItem, ...all].slice(0, 50);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {
  }

  playNotificationSound();
  sendDesktopNotification(notif.title, notif.desc);

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('al_amanah_new_notification', { detail: newItem }));
  }

  return newItem;
}

export function markAllNotificationsRead(userRole?: string, userId?: string) {
  if (typeof window === 'undefined') return;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const list: SystemNotification[] = raw ? JSON.parse(raw) : getDefaultNotifications();
    const updated = list.map(n => {
      const isForUser = !userRole && !userId
        || (n.targetUserId && userId && n.targetUserId === userId)
        || (n.targetRoles && userRole && n.targetRoles.includes(userRole))
        || (!n.targetUserId && (!n.targetRoles || n.targetRoles.length === 0));
      return isForUser ? { ...n, read: true } : n;
    });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {
  }
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('al_amanah_notifications_read'));
  }
}

export function markNotificationAsRead(id: string) {
  if (typeof window === 'undefined') return;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const list: SystemNotification[] = raw ? JSON.parse(raw) : getDefaultNotifications();
    const updated = list.map(n => n.id === id ? { ...n, read: true } : n);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {
  }
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('al_amanah_notifications_read'));
  }
}

function getDefaultNotifications(): SystemNotification[] {
  return [
    {
      id: 'init-mail-1',
      title: 'Dispensasi Siswa Lomba LKS',
      desc: 'Mohon izin untuk siswa Muhammad Rizky Pratama karena sedang mempersiapkan modul LKS Wilayah Tangerang Selatan.',
      senderName: 'Abdul Jabbar, S.Kom., M.Kom.',
      category: 'PESAN',
      time: '14:20 WIB',
      type: 'info',
      targetRoles: ['ADMIN', 'KOORDINATOR', 'PEMBINA', 'WALI_KELAS'],
      read: false,
      createdAt: Date.now() - 1800000,
    },
    {
      id: 'init-mail-2',
      title: 'Laporan Sesi Latihan Hari Ini',
      desc: 'Sesi futsal telah selesai dengan kehadiran 38 dari 42 siswa. Siswa lainnya berhalangan izin resmi.',
      senderName: 'Ahmad Syafii, S.Pd.',
      category: 'PESAN',
      time: '12:05 WIB',
      type: 'info',
      targetRoles: ['ADMIN', 'KOORDINATOR', 'PEMBINA', 'WALI_KELAS'],
      read: false,
      createdAt: Date.now() - 7200000,
    },
    {
      id: 'init-pendaftaran-info',
      title: 'Pendaftaran Ekstrakurikuler Dibuka (Maksimal 2 Eskul)',
      desc: 'Tahun Ajaran 2026/2027: Setiap siswa dapat memilih dan mendaftar maksimal 2 cabang ekstrakurikuler resmi.',
      senderName: 'Koordinator Ekstrakurikuler',
      category: 'PENDAFTARAN',
      time: 'Hari ini',
      type: 'success',
      read: false,
      createdAt: Date.now() - 14400000,
    },
  ];
}
